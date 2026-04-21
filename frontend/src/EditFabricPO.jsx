import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import Select from 'react-select';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const API = process.env.REACT_APP_API_URL;

const EditFabricPO = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [poNo, setPoNo] = useState("Loading...");
    const [suppliers, setSuppliers] = useState([]);
    const [staff, setStaff] = useState([]);
    const [orders, setOrders] = useState([]);
    const [lots, setLots] = useState([]);
    const [loading, setLoading] = useState(false);

    const [header, setHeader] = useState({
        supplier_name: "",
        ship_to: "",
        create_date: "",
        staff_name: "",
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

    const [items, setItems] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [poRes, supRes, staffRes, orderRes, lotRes] = await Promise.all([
                    axios.get(`${API}/fabric-po/${id}`),
                    axios.get(`${API}/supplier`),
                    axios.get(`${API}/employees`),
                    axios.get(`${API}/order_planning`),
                    axios.get(`${API}/yarn-dyeing-inward/internal-lots`)
                ]);

                const po = poRes.data;
                setPoNo(po.po_no);

                setHeader({
                    supplier_name: po.supplier_name,
                    ship_to: po.ship_to || "",
                    create_date: po.create_date.split('T')[0],
                    staff_name: po.staff_name,
                    is_order_specific: !!po.is_order_specific,
                    is_lot_specific: !!po.is_lot_specific,
                    order_id: po.order_id,
                    order_no: po.order_no,
                    order_name: po.order_name,
                    lot_no: po.lot_no,
                    lot_name: po.lot_name,
                    is_igst: !!po.is_igst,
                    round_off: po.round_off || 0,
                    remarks: po.remarks || ""
                });

                setItems(po.items ? po.items.map(i => ({
                    ...i,
                    total: (parseFloat(i.qty) || 0) * (parseFloat(i.rate) || 0)
                })) : []);

                setSuppliers(supRes.data.map(s => ({ value: s.name, label: s.name })));
                setStaff(staffRes.data.map(e => ({ value: e.employee_name, label: e.employee_name })));

                const orderData = orderRes.data.data || orderRes.data;
                const formattedOrders = orderData.map(o => ({
                    value: o.id,
                    label: String(o.order_no).replace('ORD-', ''),
                    details: o
                }));
                setOrders(formattedOrders);

                const formattedLots = lotRes.data.map(l => ({
                    value: l.internal_lot_no,
                    label: l.internal_lot_no,
                    details: l
                }));
                setLots(formattedLots);

            } catch (err) {
                console.error("Error fetching data:", err);
                toast.error("Failed to load PO data");
            }
        };
        fetchData();
    }, [id]);

    const handleHeaderChange = (e) => {
        const { name, value, type, checked } = e.target;
        setHeader(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        if (name === 'is_order_specific' && checked) {
            setHeader(prev => ({ ...prev, is_order_specific: true, is_lot_specific: false, lot_no: "", lot_name: "" }));
        }
        if (name === 'is_lot_specific' && checked) {
            setHeader(prev => ({ ...prev, is_lot_specific: true, is_order_specific: false, order_id: null, order_no: "", order_name: "" }));
        }
    };

    const handleOrderSelect = (selected) => {
        if (selected) {
            setHeader(prev => ({
                ...prev,
                order_id: selected.value,
                order_no: selected.label,
                order_name: selected.details.order_name || ""
            }));
        } else {
            setHeader(prev => ({ ...prev, order_id: null, order_no: "", order_name: "" }));
        }
    };

    const handleLotSelect = (selected) => {
        if (selected) {
            setHeader(prev => ({
                ...prev,
                lot_no: selected.value,
                lot_name: selected.details.internal_lot_name || ""
            }));
        } else {
            setHeader(prev => ({ ...prev, lot_no: "", lot_name: "" }));
        }
    };

    const handleItemChange = (index, e) => {
        const { name, value } = e.target;
        const newItems = [...items];
        newItems[index][name] = value;

        const qty = parseFloat(newItems[index].qty) || 0;
        const rate = parseFloat(newItems[index].rate) || 0;
        newItems[index].total = (qty * rate).toFixed(2);

        setItems(newItems);
    };

    const addItem = () => {
        setItems([...items, { counts: "", fabric_name: "", fabric_sku: "", color: "", gsm: "", dia: "", rolls: "", qty: "", rate: "", gst_per: "", total: 0 }]);
    };

    const removeItem = (index) => {
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
    };

    const updatePO = async () => {
        if (!header.supplier_name) return toast.error("Supplier Name is required");

        setLoading(true);
        try {
            await axios.put(`${API}/fabric-po/${id}`, {
                ...header,
                round_off: parseFloat(autoRoundOff) || 0,
                items: items.map(i => ({ ...i, rate: parseFloat(i.rate) || 0, total: parseFloat(i.total) || 0 }))
            });
            toast.success("Fabric PO Updated Successfully!");
            setTimeout(() => navigate('/fabric-po-list'), 1500);
        } catch (err) {
            console.error("Error updating PO:", err);
            toast.error("Failed to update PO");
        } finally {
            setLoading(false);
        }
    };

    const grandTotalFinal = items.reduce((sum, i) => sum + (parseFloat(i.qty) || 0), 0).toFixed(3);
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

    return (
        <div className="container-fluid mt-4 mb-5">
            <ToastContainer autoClose={2000} />
            <div className="card shadow border-0 rounded-4">
                <div className="card-header bg-white py-2 d-flex justify-content-between align-items-center border-bottom-0">
                    <h5 className="mb-0 fw-bold text-primary"><i className="bi bi-pencil-square me-2"></i>Edit Fabric PO</h5>
                    <span className="badge bg-primary">{poNo}</span>
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
                    </div>

                    <div className="card bg-light border-0 p-2 mb-3 rounded-3">
                        <div className="d-flex gap-3 mb-1">
                            <div className="form-check">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    name="is_order_specific"
                                    checked={header.is_order_specific}
                                    onChange={handleHeaderChange}
                                    id="orderCheck"
                                />
                                <label className="form-check-label x-small fw-bold" htmlFor="orderCheck">Against Order</label>
                            </div>
                            <div className="form-check">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    name="is_lot_specific"
                                    checked={header.is_lot_specific}
                                    onChange={handleHeaderChange}
                                    id="lotCheck"
                                />
                                <label className="form-check-label x-small fw-bold" htmlFor="lotCheck">Against Lot</label>
                            </div>
                        </div>

                        {header.is_order_specific && (
                            <div className="row g-3 align-items-end fade-in">
                                <div className="col-md-3">
                                    <label className="form-label x-small text-muted mb-1">Order No</label>
                                    <Select
                                        options={orders}
                                        onChange={handleOrderSelect}
                                        placeholder="Order"
                                        value={orders.find(o => o.value === header.order_id) || (header.order_id ? { value: header.order_id, label: String(header.order_no).replace('ORD-', '') } : null)}
                                        styles={{ control: (b) => ({ ...b, minHeight: '32px', fontSize: '0.8rem' }) }}
                                    />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label small text-muted">Order Name</label>
                                    <input type="text" className="form-control bg-white form-control-sm" value={header.order_name} readOnly />
                                </div>
                            </div>
                        )}

                        {header.is_lot_specific && (
                            <div className="row g-3 align-items-end fade-in">
                                <div className="col-md-3">
                                    <label className="form-label x-small text-muted mb-1">Lot No</label>
                                    <Select
                                        options={lots}
                                        onChange={handleLotSelect}
                                        placeholder="Lot"
                                        value={lots.find(l => l.value === header.lot_no)}
                                        styles={{ control: (b) => ({ ...b, minHeight: '32px', fontSize: '0.8rem' }) }}
                                    />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label small text-muted">Lot Name</label>
                                    <input type="text" className="form-control bg-white form-control-sm" value={header.lot_name} readOnly />
                                </div>
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
                                    <th>Counts</th>
                                    <th>Fabric SKU</th>
                                    <th>Fabric Name</th>
                                    <th>Color</th>
                                    <th>GSM</th>
                                    <th>DIA</th>
                                    <th className="text-center">Rolls</th>
                                    <th className="text-center">Final Qty</th>
                                    <th className="text-right">Rate</th>
                                    <th className="text-center">GST %</th>
                                    <th className="text-right">Total</th>
                                    <th className="text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item, index) => (
                                    <tr key={index}>
                                        <td><input type="text" name="counts" className="form-control form-control-sm" value={item.counts} onChange={(e) => handleItemChange(index, e)} /></td>
                                        <td><input type="text" name="fabric_sku" className="form-control form-control-sm" value={item.fabric_sku} onChange={(e) => handleItemChange(index, e)} /></td>
                                        <td><input type="text" name="fabric_name" className="form-control form-control-sm" value={item.fabric_name} onChange={(e) => handleItemChange(index, e)} /></td>
                                        <td><input type="text" name="color" className="form-control form-control-sm" value={item.color} onChange={(e) => handleItemChange(index, e)} /></td>
                                        <td><input type="text" name="gsm" className="form-control form-control-sm" value={item.gsm} onChange={(e) => handleItemChange(index, e)} /></td>
                                        <td><input type="text" name="dia" className="form-control form-control-sm" value={item.dia} onChange={(e) => handleItemChange(index, e)} /></td>
                                        <td><input type="text" name="rolls" className="form-control form-control-sm text-center" value={item.rolls} onChange={(e) => handleItemChange(index, e)} /></td>
                                        <td><input type="text" name="qty" className="form-control form-control-sm text-center fw-bold" value={item.qty} onChange={(e) => handleItemChange(index, e)} /></td>
                                        <td><input type="text" name="rate" className="form-control form-control-sm text-end text-primary fw-bold" value={item.rate} onChange={(e) => handleItemChange(index, e)} placeholder="0.00" /></td>
                                        <td><input type="text" name="gst_per" className="form-control form-control-sm text-center" value={item.gst_per} onChange={(e) => handleItemChange(index, e)} placeholder="0" /></td>
                                        <td><input type="text" name="total" className="form-control form-control-sm text-end fw-bold" style={{ backgroundColor: '#f1f1f1' }} value={item.total} readOnly /></td>
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
                                    <td colSpan="6" className="text-end">GRAND TOTAL:</td>
                                    <td className="text-center text-success">{grandTotalFinal}</td>
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
                        <button className="btn btn-secondary rounded-pill px-4" onClick={() => navigate('/fabric-po-list')}>Cancel</button>
                        <button className="btn btn-success rounded-pill px-4 fw-bold" onClick={updatePO} disabled={loading}>
                            <i className="bi bi-check-lg me-2"></i>{loading ? "Updating..." : "Update Fabric PO"}
                        </button>
                    </div>
                </div>
            </div>
            <style>{`
                .fade-in { animation: fadeIn 0.5s; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                .x-small { font-size: 0.7rem; }
                .table td { padding: 0.25rem; }
                .table input { font-size: 0.8rem; }
            `}</style>
        </div>
    );
};

export default EditFabricPO;
