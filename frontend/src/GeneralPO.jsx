
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import Select from 'react-select';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const API = process.env.REACT_APP_API_URL;

const GeneralPO = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [poNo, setPoNo] = useState("Loading...");
    const [suppliers, setSuppliers] = useState([]);
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(false);

    const selectedYear = JSON.parse(localStorage.getItem("selectedYear") || "{}");

    const [header, setHeader] = useState({
        supplier_name: "",
        ship_to: "",
        create_date: new Date().toISOString().split('T')[0],
        staff_name: "",
        po_type: "Yarn", // Default
        is_order_specific: false,
        is_lot_specific: false,
        order_id: null,
        order_no: "",
        order_name: "",
        lot_no: "",
        lot_name: "",
        is_igst: false,
        round_off: 0,
        remarks: ""
    });

    const [items, setItems] = useState([{}]); // Dynamic structure based on PO Type

    const [orders, setOrders] = useState([]);
    const [lots, setLots] = useState([]);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [poRes, supRes, staffRes, ordersRes, lotsRes] = await Promise.all([
                    axios.get(`${API}/general-po/next-no/gen`),
                    axios.get(`${API}/supplier`),
                    axios.get(`${API}/employees`),
                    axios.get(`${API}/order_planning?exclude_completed=true`),
                    axios.get(`${API}/production_lots`)
                ]);

                setPoNo(poRes.data.po_no);
                setSuppliers(supRes.data.map(s => ({ value: s.name, label: s.name })));
                setStaff(staffRes.data.map(e => ({ value: e.employee_name, label: e.employee_name })));

                const orderData = ordersRes.data.data || ordersRes.data;
                const formattedOrders = orderData.map(o => ({
                    value: o.id,
                    label: String(o.order_no).replace('ORD-', ''),
                    order_no: o.order_no,
                    order_name: o.order_name
                }));
                setOrders(formattedOrders);

                const formattedLots = lotsRes.data.map(l => ({
                    value: l.lot_no,
                    label: l.lot_name ? `${l.lot_no} - ${l.lot_name}` : l.lot_no,
                    lot_no: l.lot_no,
                    lot_name: l.lot_name
                }));
                setLots(formattedLots);

            } catch (err) {
                console.error("Error fetching initial data:", err);
                // toast.error("Failed to load initial data");
            }
        };
        fetchInitialData();
    }, []);

    // Handle location state for Order/Lot export
    useEffect(() => {
        if (location.state) {
            const { type, order_id, order_no, order_name, lot_no, lot_name, items: incomingItems } = location.state;

            if (type === "Order") {
                setHeader(prev => ({
                    ...prev,
                    is_order_specific: true,
                    order_id, order_no, order_name
                }));
            } else if (type === "Lot") {
                setHeader(prev => ({
                    ...prev,
                    is_lot_specific: true,
                    lot_no, lot_name
                }));
            }

            if (incomingItems && incomingItems.length > 0) {
                setItems(incomingItems.map(i => ({
                    ...i,
                    counts: i.counts || "",
                    yarn_name: i.yarn_name || "",
                    fabric_name: i.fabric_name || "",
                    trims_name: i.trims_name || "",
                    color: i.color || "",
                    size: i.size || "",
                    qty: i.qty || 0,
                    rate: i.rate || 0,
                    gst_per: i.gst_per || 0,
                    total: (parseFloat(i.qty || 0) * parseFloat(i.rate || 0)).toFixed(2)
                })));
            }
        }
    }, [location.state]);

    // Reset items when type changes
    useEffect(() => {
        // Only reset if not coming from location state
        if (!location.state) {
            if (header.po_type === "Yarn") setItems([{ counts: "", yarn_name: "", color: "", per_bag: "", per_bag_qty: "", qty: "", rate: "", gst_per: "", total: 0 }]);
            else if (header.po_type === "Fabric") setItems([{ counts: "", fabric_name: "", color: "", gsm: "", dia: "", rolls: "", qty: "", rate: "", gst_per: "", total: 0 }]);
            else if (header.po_type === "Trims") setItems([{ trims_name: "", color: "", size: "", qty: "", rate: "", gst_per: "", total: 0 }]);
        }
    }, [header.po_type, location.state]);

    const handleHeaderChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (type === "checkbox") {
            if (name === "is_order_specific") {
                setHeader(prev => ({
                    ...prev,
                    is_order_specific: checked,
                    is_lot_specific: false,
                    order_id: null, order_no: "", order_name: "",
                    lot_no: "", lot_name: ""
                }));
            } else if (name === "is_lot_specific") {
                setHeader(prev => ({
                    ...prev,
                    is_lot_specific: checked,
                    is_order_specific: false,
                    order_id: null, order_no: "", order_name: "",
                    lot_no: "", lot_name: ""
                }));
            } else {
                setHeader(prev => ({ ...prev, [name]: checked }));
            }
        } else {
            setHeader(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleItemChange = (index, e) => {
        const { name, value } = e.target;
        const newItems = [...items];
        newItems[index][name] = value;

        if (header.po_type === "Yarn" && (name === "per_bag" || name === "per_bag_qty")) {
            const pb = parseFloat(newItems[index].per_bag) || 0;
            const pbq = parseFloat(newItems[index].per_bag_qty) || 0;
            if (pb && pbq) newItems[index].qty = (pb * pbq).toFixed(3);
        }

        const qty = parseFloat(newItems[index].qty) || 0;
        const rate = parseFloat(newItems[index].rate) || 0;
        newItems[index].total = (qty * rate).toFixed(2);

        setItems(newItems);
    };

    const addItem = () => {
        if (header.po_type === "Yarn") setItems([...items, { counts: "", yarn_name: "", color: "", per_bag: "", per_bag_qty: "", qty: "", rate: "", gst_per: "", total: 0 }]);
        else if (header.po_type === "Fabric") setItems([...items, { counts: "", fabric_name: "", color: "", gsm: "", dia: "", rolls: "", qty: "", rate: "", gst_per: "", total: 0 }]);
        else if (header.po_type === "Trims") setItems([...items, { trims_name: "", color: "", size: "", qty: "", rate: "", gst_per: "", total: 0 }]);
    };

    const removeItem = (index) => {
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
    };

    const savePO = async () => {
        if (!header.supplier_name) return toast.error("Supplier Name is required");

        if (selectedYear.is_closed) {
            toast.error("Error: This Accounting Year is locked and cannot be modified.");
            return;
        }

        const poDateVal = new Date(header.create_date);
        const startDate = new Date(selectedYear.start_date);
        const endDate = new Date(selectedYear.end_date);
        if (poDateVal < startDate || poDateVal > endDate) {
            if (!window.confirm(`Warning: PO date is outside the selected Accounting Year (AY ${selectedYear.year_name}). Do you want to proceed?`)) {
                return;
            }
        }

        setLoading(true);
        try {
            await axios.post(`${API}/general-po`, {
                po_no: poNo,
                ...header,
                round_off: parseFloat(autoRoundOff) || 0,
                year_id: selectedYear.year_id,
                items: items.map(i => ({ ...i, rate: parseFloat(i.rate) || 0, total: parseFloat(i.total) || 0 }))
            });
            toast.success("General PO Created Successfully!");
            setTimeout(() => navigate('/general-po-list'), 1500);
        } catch (err) {
            console.error("Error saving PO:", err);
            toast.error("Failed to save PO");
        } finally {
            setLoading(false);
        }
    };

    const grandTotalQty = items.reduce((sum, i) => sum + (parseFloat(i.qty) || 0), 0);
    const taxableAmount = items.reduce((sum, i) => sum + (parseFloat(i.total) || 0), 0);

    const cgstTotal = header.is_igst ? 0 : items.reduce((sum, i) => {
        const total = parseFloat(i.total) || 0;
        const gst = parseFloat(i.gst_per) || 0;
        return sum + (total * (gst / 200));
    }, 0);

    const sgstTotal = header.is_igst ? 0 : items.reduce((sum, i) => {
        const total = parseFloat(i.total) || 0;
        const gst = parseFloat(i.gst_per) || 0;
        return sum + (total * (gst / 200));
    }, 0);

    const igstTotal = !header.is_igst ? 0 : items.reduce((sum, i) => {
        const total = parseFloat(i.total) || 0;
        const gst = parseFloat(i.gst_per) || 0;
        return sum + (total * (gst / 100));
    }, 0);

    const totalBeforeRound = taxableAmount + cgstTotal + sgstTotal + igstTotal;
    const netAmount = Math.round(totalBeforeRound);
    const autoRoundOff = (netAmount - totalBeforeRound).toFixed(2);

    const renderTableHeaders = () => {
        switch (header.po_type) {
            case "Yarn":
                return (
                    <>
                        <th>Counts</th>
                        <th>Yarn Name</th>
                        <th>Color</th>
                        <th>Per Bag (KG)</th>
                        <th>Per Bag Qty</th>
                        <th>Qty</th>
                        <th>Rate</th>
                        <th>GST %</th>
                        <th>Total</th>
                    </>
                );
            case "Fabric":
                return (
                    <>
                        <th>Counts</th>
                        <th>Fabric Name</th>
                        <th>Color</th>
                        <th>GSM</th>
                        <th>DIA</th>
                        <th>Rolls</th>
                        <th>Qty</th>
                        <th>Rate</th>
                        <th>GST %</th>
                        <th>Total</th>
                    </>
                );
            case "Trims":
                return (
                    <>
                        <th>Trims Name</th>
                        <th>Color</th>
                        <th>Size</th>
                        <th>Qty</th>
                        <th>Rate</th>
                        <th>GST %</th>
                        <th>Total</th>
                    </>
                );
            default: return null;
        }
    };

    const renderTableRows = (item, index) => {
        switch (header.po_type) {
            case "Yarn":
                return (
                    <>
                        <td><input type="text" name="counts" className="form-control form-control-sm" value={item.counts || ""} onChange={(e) => handleItemChange(index, e)} /></td>
                        <td><input type="text" name="yarn_name" className="form-control form-control-sm" value={item.yarn_name || ""} onChange={(e) => handleItemChange(index, e)} /></td>
                        <td><input type="text" name="color" className="form-control form-control-sm" value={item.color || ""} onChange={(e) => handleItemChange(index, e)} /></td>
                        <td><input type="text" name="per_bag" className="form-control form-control-sm text-center" value={item.per_bag || ""} onChange={(e) => handleItemChange(index, e)} /></td>
                        <td><input type="text" name="per_bag_qty" className="form-control form-control-sm text-center" value={item.per_bag_qty || ""} onChange={(e) => handleItemChange(index, e)} /></td>
                        <td><input type="text" name="qty" className="form-control form-control-sm text-center fw-bold" value={item.qty || ""} onChange={(e) => handleItemChange(index, e)} /></td>
                        <td><input type="text" name="rate" className="form-control form-control-sm text-end text-primary fw-bold" value={item.rate || ""} onChange={(e) => handleItemChange(index, e)} placeholder="0.00" /></td>
                        <td><input type="text" name="gst_per" className="form-control form-control-sm text-center" value={item.gst_per || ""} onChange={(e) => handleItemChange(index, e)} placeholder="0" /></td>
                        <td><input type="text" name="total" className="form-control form-control-sm text-end fw-bold" style={{ backgroundColor: '#f1f1f1' }} value={item.total || 0} readOnly /></td>
                    </>
                );
            case "Fabric":
                return (
                    <>
                        <td><input type="text" name="counts" className="form-control form-control-sm" value={item.counts || ""} onChange={(e) => handleItemChange(index, e)} /></td>
                        <td><input type="text" name="fabric_name" className="form-control form-control-sm" value={item.fabric_name || ""} onChange={(e) => handleItemChange(index, e)} /></td>
                        <td><input type="text" name="color" className="form-control form-control-sm" value={item.color || ""} onChange={(e) => handleItemChange(index, e)} /></td>
                        <td><input type="text" name="gsm" className="form-control form-control-sm" value={item.gsm || ""} onChange={(e) => handleItemChange(index, e)} /></td>
                        <td><input type="text" name="dia" className="form-control form-control-sm" value={item.dia || ""} onChange={(e) => handleItemChange(index, e)} /></td>
                        <td><input type="text" name="rolls" className="form-control form-control-sm text-center" value={item.rolls || ""} onChange={(e) => handleItemChange(index, e)} /></td>
                        <td><input type="text" name="qty" className="form-control form-control-sm text-center fw-bold" value={item.qty || ""} onChange={(e) => handleItemChange(index, e)} /></td>
                        <td><input type="text" name="rate" className="form-control form-control-sm text-end text-primary fw-bold" value={item.rate || ""} onChange={(e) => handleItemChange(index, e)} placeholder="0.00" /></td>
                        <td><input type="text" name="gst_per" className="form-control form-control-sm text-center" value={item.gst_per || ""} onChange={(e) => handleItemChange(index, e)} placeholder="0" /></td>
                        <td><input type="text" name="total" className="form-control form-control-sm text-end fw-bold" style={{ backgroundColor: '#f1f1f1' }} value={item.total || 0} readOnly /></td>
                    </>
                );
            case "Trims":
                return (
                    <>
                        <td><input type="text" name="trims_name" className="form-control form-control-sm" value={item.trims_name || ""} onChange={(e) => handleItemChange(index, e)} /></td>
                        <td><input type="text" name="color" className="form-control form-control-sm" value={item.color || ""} onChange={(e) => handleItemChange(index, e)} /></td>
                        <td><input type="text" name="size" className="form-control form-control-sm" value={item.size || ""} onChange={(e) => handleItemChange(index, e)} /></td>
                        <td><input type="text" name="qty" className="form-control form-control-sm text-center fw-bold" value={item.qty || ""} onChange={(e) => handleItemChange(index, e)} /></td>
                        <td><input type="text" name="rate" className="form-control form-control-sm text-end text-primary fw-bold" value={item.rate || ""} onChange={(e) => handleItemChange(index, e)} placeholder="0.00" /></td>
                        <td><input type="text" name="gst_per" className="form-control form-control-sm text-center" value={item.gst_per || ""} onChange={(e) => handleItemChange(index, e)} placeholder="0" /></td>
                        <td><input type="text" name="total" className="form-control form-control-sm text-end fw-bold" style={{ backgroundColor: '#f1f1f1' }} value={item.total || 0} readOnly /></td>
                    </>
                );
            default: return null;
        }
    };

    return (
        <div className="container-fluid mt-4 mb-5">
            <ToastContainer autoClose={2000} />
            <div className="card shadow border-0 rounded-4">
                <div className="card-header bg-white py-3 border-bottom shadow-sm">
                    <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-4">
                            <div>
                                <label className="fw-bold mb-0 me-1 text-muted small">PO No:</label>
                                <div className="text-primary fw-bold fs-5">{poNo || "Loading..."}</div>
                            </div>
                            <div className="vr" style={{ height: '40px' }}></div>
                            <div>
                                <label className="fw-bold mb-0 me-1 text-muted small">Accounting Year:</label>
                                <div className="text-dark fw-bold">AY {selectedYear.year_name}</div>
                            </div>
                        </div>

                        <div className="text-center flex-grow-1">
                            <h4 className="fw-bold mb-0 text-uppercase tracking-wider">General Purchase Order</h4>
                        </div>

                        <div className="d-flex align-items-center gap-3">
                            {selectedYear.is_closed ? (
                                <span className="badge bg-danger px-3 py-2 rounded-pill shadow-sm">
                                    <i className="bi bi-lock-fill me-1"></i>YEAR LOCKED
                                </span>
                            ) : (
                                <span className="badge bg-success px-3 py-2 rounded-pill shadow-sm">
                                    <i className="bi bi-unlock-fill me-1"></i>ACTIVE YEAR
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="card-body p-3">
                    <div className="row g-2 mb-3">
                        <div className="col-md-3">
                            <label className="form-label x-small fw-bold text-muted mb-1">Supplier Name</label>
                            <Select
                                options={suppliers}
                                onChange={(opt) => setHeader(prev => ({ ...prev, supplier_name: opt?.value || "" }))}
                                placeholder="Select"
                                value={suppliers.find(s => s.value === header.supplier_name)}
                                styles={{ control: (b) => ({ ...b, minHeight: '32px', fontSize: '0.8rem' }) }}
                            />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label x-small fw-bold text-muted mb-1">Ship To</label>
                            <Select
                                options={suppliers}
                                onChange={(opt) => setHeader(prev => ({ ...prev, ship_to: opt?.value || "" }))}
                                placeholder="Select"
                                value={suppliers.find(s => s.value === header.ship_to)}
                                styles={{ control: (b) => ({ ...b, minHeight: '32px', fontSize: '0.8rem' }) }}
                            />
                        </div>
                        <div className="col-md-2">
                            <label className="form-label x-small fw-bold text-muted mb-1">Create Date</label>
                            <input
                                type="date"
                                className="form-control form-control-sm"
                                name="create_date"
                                value={header.create_date}
                                onChange={handleHeaderChange}
                            />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label x-small fw-bold text-muted mb-1">Staff Name</label>
                            <Select
                                options={staff}
                                onChange={(opt) => setHeader(prev => ({ ...prev, staff_name: opt?.value || "" }))}
                                placeholder="Select"
                                value={staff.find(s => s.value === header.staff_name)}
                                styles={{ control: (b) => ({ ...b, minHeight: '32px', fontSize: '0.8rem' }) }}
                            />
                        </div>
                        <div className="col-md-2">
                            <label className="form-label x-small fw-bold text-muted mb-1">PO Type</label>
                            <select
                                className="form-select form-select-sm"
                                name="po_type"
                                value={header.po_type}
                                onChange={handleHeaderChange}
                            >
                                <option value="Yarn">Yarn PO</option>
                                <option value="Fabric">Fabric PO</option>
                                <option value="Trims">Trims PO</option>
                            </select>
                        </div>
                    </div>

                    <div className="row g-2 mb-3">
                        <div className="col-md-2">
                            <div className="form-check form-switch mt-1">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    name="is_order_specific"
                                    id="orderSwitch"
                                    checked={header.is_order_specific}
                                    onChange={handleHeaderChange}
                                />
                                <label className="form-check-label x-small fw-bold text-muted" htmlFor="orderSwitch">Order Specific</label>
                            </div>
                        </div>
                        <div className="col-md-2">
                            <div className="form-check form-switch mt-1">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    name="is_lot_specific"
                                    id="lotSwitch"
                                    checked={header.is_lot_specific}
                                    onChange={handleHeaderChange}
                                />
                                <label className="form-check-label x-small fw-bold text-muted" htmlFor="lotSwitch">Lot Specific</label>
                            </div>
                        </div>
                        {header.is_order_specific && (
                            <div className="col-md-3">
                                <label className="form-label x-small fw-bold text-muted mb-1">Select Order</label>
                                <Select
                                    options={orders}
                                    onChange={(opt) => setHeader(prev => ({
                                        ...prev,
                                        order_id: opt?.value || null,
                                        order_no: opt?.order_no || "",
                                        order_name: opt?.order_name || ""
                                    }))}
                                    placeholder="Order"
                                    value={orders.find(o => o.value === header.order_id) || (header.order_id ? { value: header.order_id, label: String(header.order_no).replace('ORD-', '') } : null)}
                                    styles={{ control: (b) => ({ ...b, minHeight: '32px', fontSize: '0.8rem' }) }}
                                />
                            </div>
                        )}
                        {header.is_lot_specific && (
                            <div className="col-md-3">
                                <label className="form-label x-small fw-bold text-muted mb-1">Select Lot</label>
                                <Select
                                    options={lots}
                                    onChange={(opt) => setHeader(prev => ({
                                        ...prev,
                                        lot_no: opt?.lot_no || "",
                                        lot_name: opt?.lot_name || ""
                                    }))}
                                    placeholder="Lot"
                                    value={lots.find(l => l.value === header.lot_no)}
                                    styles={{ control: (b) => ({ ...b, minHeight: '32px', fontSize: '0.8rem' }) }}
                                />
                            </div>
                        )}
                    </div>

                    <div className="d-flex justify-content-end mb-3">
                        <div className="form-check form-check-inline p-0 m-0">
                            <input
                                type="checkbox"
                                className="btn-check"
                                id="igstToggle"
                                name="is_igst"
                                checked={header.is_igst}
                                onChange={handleHeaderChange}
                                autoComplete="off"
                            />
                            <label className={`btn btn-sm rounded-pill px-3 fw-bold ${header.is_igst ? 'btn-primary' : 'btn-outline-primary'}`} htmlFor="igstToggle">
                                {header.is_igst ? <i className="bi bi-check-circle-fill me-1"></i> : <i className="bi bi-circle me-1"></i>}
                                Apply IGST
                            </label>
                        </div>
                    </div>

                    <div className="table-responsive mb-3">
                        <table className="table table-bordered table-hover align-middle">
                            <thead className="table-dark text-white" style={{ fontSize: '0.75rem' }}>
                                <tr>
                                    {renderTableHeaders()}
                                    <th className="text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item, index) => (
                                    <tr key={index}>
                                        {renderTableRows(item, index)}
                                        <td className="text-center">
                                            <button className="btn btn-outline-danger btn-sm rounded-circle" onClick={() => removeItem(index)}>
                                                <i className="bi bi-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="table-light">
                                <tr className="fw-bold small">
                                    <td colSpan={header.po_type === "Yarn" ? 5 : header.po_type === "Fabric" ? 6 : 3} className="text-end">GRAND TOTAL (Taxable):</td>
                                    <td className="text-center text-success">{grandTotalQty}</td>
                                    <td></td>
                                    <td></td>
                                    <td className="text-end text-dark">₹{taxableAmount.toFixed(2)}</td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    <div className="row mt-4">
                        <div className="col-md-7">
                            <button className="btn btn-outline-primary btn-sm rounded-pill mb-4" onClick={addItem}>
                                <i className="bi bi-plus-lg me-1"></i> Add Row
                            </button>
                            <div className="mt-2">
                                <label className="form-label fw-semibold text-muted">Remarks</label>
                                <textarea
                                    className="form-control"
                                    name="remarks"
                                    rows="3"
                                    value={header.remarks}
                                    onChange={handleHeaderChange}
                                    placeholder="Enter any special instructions or remarks..."
                                ></textarea>
                            </div>
                        </div>
                        <div className="col-md-5">
                            <div className="card border-0 shadow-sm rounded-4 bg-light p-2">
                                <div className="d-flex justify-content-between mb-1 small">
                                    <span className="text-muted">Taxable Amount:</span>
                                    <span className="fw-bold">₹{taxableAmount.toFixed(2)}</span>
                                </div>
                                {!header.is_igst ? (
                                    <>
                                        <div className="d-flex justify-content-between mb-1 text-secondary x-small">
                                            <span>CGST:</span>
                                            <span>₹{cgstTotal.toFixed(2)}</span>
                                        </div>
                                        <div className="d-flex justify-content-between mb-1 text-secondary x-small">
                                            <span>SGST:</span>
                                            <span>₹{sgstTotal.toFixed(2)}</span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="d-flex justify-content-between mb-1 text-secondary x-small">
                                        <span>IGST:</span>
                                        <span>₹{igstTotal.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="d-flex justify-content-between mb-1 align-items-center">
                                    <span className="text-muted x-small">Round Off:</span>
                                    <div style={{ width: '80px' }}>
                                        <input
                                            type="text"
                                            className="form-control form-control-sm text-end fw-bold py-0"
                                            style={{ backgroundColor: '#f1f1f1', border: '1px solid #dee2e6', fontSize: '0.75rem' }}
                                            name="round_off"
                                            value={autoRoundOff}
                                            readOnly
                                        />
                                    </div>
                                </div>
                                <hr className="my-1" />
                                <div className="d-flex justify-content-between align-items-center">
                                    <h6 className="mb-0 fw-bold">Grand Total:</h6>
                                    <h6 className="mb-0 fw-bold text-success">₹{netAmount.toFixed(2)}</h6>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="d-flex justify-content-end gap-2">
                        <button className="btn btn-secondary rounded-pill px-4" onClick={() => navigate('/general-po-list')}>Cancel</button>
                        {selectedYear.is_closed ? (
                            <div className="text-danger fw-bold d-flex align-items-center me-3 h6 mb-0">
                                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                Cannot save: This Accounting Year is locked.
                            </div>
                        ) : (
                            <button className="btn btn-success rounded-pill px-4 fw-bold shadow-sm" onClick={savePO} disabled={loading}>
                                <i className="bi bi-check-lg me-2"></i>{loading ? "Saving..." : "Save General PO"}
                            </button>
                        )}
                    </div>
                </div>
            </div>
            <style>{`
                .x-small { font-size: 0.7rem; }
                .table td { padding: 0.25rem; }
                .table input { font-size: 0.8rem; }
            `}</style>
        </div>
    );
};

export default GeneralPO;
