
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import Select from 'react-select';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const API = process.env.REACT_APP_API_URL;

const GarmentsGRN = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [grnNo, setGrnNo] = useState("Loading...");
    const [suppliers, setSuppliers] = useState([]);
    const [staff, setStaff] = useState([]);
    const [orders, setOrders] = useState([]);
    const selectedYear = JSON.parse(localStorage.getItem("selectedYear") || "{}");

    const [header, setHeader] = useState({
        supplier_name: "",
        grn_date: new Date().toISOString().split('T')[0],
        dc_no: "",
        staff_name: "",
        order_id: null,
        order_no: "",
        order_name: "",
        po_no: "",
        remarks: ""
    });

    const [items, setItems] = useState([
        { style_name: "", sku: "", color: "", size: "", qty: "" }
    ]);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [grnRes, supRes, staffRes, orderRes] = await Promise.all([
                    axios.get(`${API}/garments-grn/next-no/gen`),
                    axios.get(`${API}/supplier`),
                    axios.get(`${API}/employees`),
                    axios.get(`${API}/order_planning?exclude_completed=true`)
                ]);

                setGrnNo(grnRes.data.grn_no);
                setSuppliers(supRes.data.map(s => ({ value: s.supplier_name, label: s.supplier_name })));
                setStaff(staffRes.data.map(e => ({ value: e.employee_name, label: e.employee_name })));
                const orderData = orderRes.data.data || orderRes.data;
                setOrders(orderData.map(o => ({ value: o.id, label: o.order_no, details: o })));

                // If po_data passed from list
                if (location.state && location.state.po_data) {
                    const po = location.state.po_data;
                    const fullPoRes = await axios.get(`${API}/garments-po/${po.id}`);
                    const fullPo = fullPoRes.data;

                    setHeader(prev => ({
                        ...prev,
                        supplier_name: fullPo.ship_to || fullPo.supplier_name,
                        order_id: fullPo.order_id,
                        order_no: fullPo.order_no,
                        order_name: fullPo.order_name,
                        po_no: fullPo.po_no
                    }));
                    setItems(fullPo.items
                        .map(it => ({
                            style_name: it.style_name,
                            sku: it.sku || "",
                            color: it.color,
                            size: it.size,
                            qty: (Number(it.qty || 0) - Number(it.received_qty || 0)).toFixed(3),
                            po_qty: Number(it.qty || 0),
                            received_qty: Number(it.received_qty || 0)
                        }))
                        .filter(it => it.qty > 0)
                    );
                }

            } catch (err) {
                console.error("Error fetching initial data:", err);
                toast.error("Failed to load initial data");
            }
        };
        fetchInitialData();
    }, [location.state]);

    const handleHeaderChange = (e) => {
        const { name, value } = e.target;
        setHeader(prev => ({ ...prev, [name]: value }));
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

    const handleItemChange = (index, e) => {
        const { name, value } = e.target;
        const newItems = [...items];
        newItems[index][name] = value;
        setItems(newItems);
    };

    const addItem = () => {
        setItems([...items, { style_name: "", sku: "", color: "", size: "", qty: "" }]);
    };

    const removeItem = (index) => {
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
    };

    const saveGRN = async () => {
        if (!header.supplier_name) return toast.error("Supplier Name is required");

        // Validation for PO quantity
        if (header.po_no) {
            for (const item of items) {
                const remaining = Number(item.po_qty || 0) - Number(item.received_qty || 0);
                if (item.po_qty && Number(item.qty || 0) > Number(remaining.toFixed(3)) + 0.0001) {
                    return toast.error(`Quantity for ${item.style_name} exceeds remaining PO quantity (${remaining.toFixed(3)})`);
                }
            }
        }

        if (selectedYear.is_closed) {
            toast.error("Error: This Accounting Year is locked and cannot be modified.");
            return;
        }

        const grnDateVal = new Date(header.grn_date);
        const startDate = new Date(selectedYear.start_date);
        const endDate = new Date(selectedYear.end_date);
        if (grnDateVal < startDate || grnDateVal > endDate) {
            if (!window.confirm(`Warning: GRN date is outside the selected Accounting Year (AY ${selectedYear.year_name}). Do you want to proceed?`)) {
                return;
            }
        }

        try {
            await axios.post(`${API}/garments-grn`, {
                grn_no: grnNo,
                ...header,
                year_id: selectedYear.year_id,
                items
            });
            toast.success("Garments GRN Created Successfully!");
            setTimeout(() => navigate('/garments-grn-list'), 1500);
        } catch (err) {
            console.error("Error saving GRN:", err);
            toast.error("Failed to save GRN");
        }
    };

    return (
        <div className="container-fluid mt-4 mb-5">
            <ToastContainer />
            <div className="card shadow border-0 rounded-4">
                <div className="card-header bg-white py-3 border-bottom shadow-sm">
                    <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-4">
                            <div>
                                <label className="fw-bold mb-0 me-1 text-muted small">GRN No:</label>
                                <div className="text-primary fw-bold fs-5">{grnNo || "Loading..."}</div>
                            </div>
                            <div className="vr" style={{ height: '40px' }}></div>
                            <div>
                                <label className="fw-bold mb-0 me-1 text-muted small">Accounting Year:</label>
                                <div className="text-dark fw-bold">AY {selectedYear.year_name}</div>
                            </div>
                        </div>

                        <div className="text-center flex-grow-1">
                            <h4 className="fw-bold mb-0 text-uppercase tracking-wider">Garments GRN</h4>
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
                <div className="card-body p-4">
                    {/* Header Fields */}
                    <div className="row g-3 mb-4">
                        <div className="col-md-3">
                            <label className="form-label fw-semibold text-muted">PO No</label>
                            <input type="text" className="form-control bg-light" value={header.po_no} readOnly />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label fw-semibold text-muted">Supplier Name</label>
                            <Select
                                options={suppliers}
                                value={suppliers.find(s => s.value === header.supplier_name) || (header.supplier_name ? { value: header.supplier_name, label: header.supplier_name } : null)}
                                onChange={(opt) => setHeader(prev => ({ ...prev, supplier_name: opt?.value || "" }))}
                                placeholder="Select Supplier"
                                isClearable
                                isSearchable
                            />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label fw-semibold text-muted">GRN Date</label>
                            <input type="date" className="form-control" name="grn_date" value={header.grn_date} onChange={handleHeaderChange} />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label fw-semibold text-muted">DC No</label>
                            <input type="text" className="form-control" name="dc_no" value={header.dc_no} onChange={handleHeaderChange} placeholder="Enter DC No" />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label fw-semibold text-muted">Staff Name</label>
                            <Select
                                options={staff}
                                value={staff.find(s => s.value === header.staff_name)}
                                onChange={(opt) => setHeader(prev => ({ ...prev, staff_name: opt?.value || "" }))}
                                placeholder="Select Staff"
                            />
                        </div>
                        <div className="col-md-9">
                            <label className="form-label fw-semibold text-muted">Remarks</label>
                            <input type="text" className="form-control" name="remarks" value={header.remarks} onChange={handleHeaderChange} placeholder="Any remarks..." />
                        </div>
                    </div>

                    {/* Order Selection */}
                    <div className="card bg-light border-0 p-3 mb-4 rounded-3">
                        <h6 className="fw-bold mb-3 text-secondary">Order Details</h6>
                        <div className="row g-3">
                            <div className="col-md-4">
                                <label className="form-label small text-muted">Order No</label>
                                <Select
                                    options={orders}
                                    value={orders.find(o => o.label === header.order_no)}
                                    onChange={handleOrderSelect}
                                    placeholder="Select Order"
                                />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label small text-muted">Order Name</label>
                                <input type="text" className="form-control bg-white" value={header.order_name} readOnly />
                            </div>
                        </div>
                    </div>

                    {/* Table Section */}
                    <div className="table-responsive mb-3">
                        <table className="table table-bordered table-hover align-middle">
                            <thead className="table-dark text-white">
                                <tr>
                                    <th>Style Name</th>
                                    <th>SKU</th>
                                    <th>Color</th>
                                    <th>Size</th>
                                    <th>Total Qty</th>
                                    <th className="text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item, index) => (
                                    <tr key={index}>
                                        <td><input type="text" name="style_name" className="form-control form-control-sm" value={item.style_name} onChange={(e) => handleItemChange(index, e)} /></td>
                                        <td><input type="text" name="sku" className="form-control form-control-sm" value={item.sku} onChange={(e) => handleItemChange(index, e)} /></td>
                                        <td><input type="text" name="color" className="form-control form-control-sm" value={item.color} onChange={(e) => handleItemChange(index, e)} /></td>
                                        <td><input type="text" name="size" className="form-control form-control-sm" value={item.size} onChange={(e) => handleItemChange(index, e)} /></td>
                                        <td><input type="number" name="qty" step="0.001" className="form-control form-control-sm fw-bold" value={item.qty} onChange={(e) => handleItemChange(index, e)} /></td>
                                        <td className="text-center">
                                            <button className="btn btn-outline-danger btn-sm rounded-circle" onClick={() => removeItem(index)}><i className="bi bi-trash"></i></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="table-light fw-bold">
                                <tr>
                                    <td colSpan="4" className="text-end">Total GRN Qty:</td>
                                    <td className="text-primary">{items.reduce((sum, item) => sum + Number(item.qty || 0), 0).toFixed(3)}</td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                    <button className="btn btn-outline-primary btn-sm rounded-pill mb-4" onClick={addItem}><i className="bi bi-plus-lg me-1"></i> Add Row</button>

                    <div className="d-flex justify-content-end gap-2">
                        <button className="btn btn-secondary rounded-pill px-4" onClick={() => navigate('/garments-grn-list')}>Cancel</button>
                        {selectedYear.is_closed ? (
                            <div className="text-danger fw-bold d-flex align-items-center me-3 h6 mb-0">
                                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                Cannot save: This Accounting Year is locked.
                            </div>
                        ) : (
                            <button className="btn btn-success rounded-pill px-4 fw-bold shadow-sm" onClick={saveGRN}>
                                <i className="bi bi-check-lg me-2"></i>Save Garments GRN
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GarmentsGRN;
