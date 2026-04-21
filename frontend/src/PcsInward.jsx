import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API = process.env.REACT_APP_API_URL;

const initialItem = {
    style_name: "",
    size: "",
    qty: 0
};

const PcsInward = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const selectedYear = JSON.parse(localStorage.getItem("selectedYear") || "{}");

    const [formData, setFormData] = useState({
        inward_no: "",
        supplier_name: "", // From?
        inward_date: new Date().toISOString().substring(0, 10),
        staff_name: "",
        remarks: "",
        items: [{ ...initialItem }]
    });

    const [loading, setLoading] = useState(false);
    const [supplierSuggestions, setSupplierSuggestions] = useState([]);

    useEffect(() => {
        if (location.state && location.state.id) {
            fetchInward(location.state.id);
        } else {
            fetchNextNo();
        }
    }, [location.state]);

    const fetchNextNo = async () => {
        try {
            const res = await axios.get(`${API}/pcs-direct-inward/next-no`);
            setFormData(prev => ({ ...prev, inward_no: res.data.inward_no }));
        } catch (err) {
            console.error("Error fetching next no:", err);
        }
    };

    const fetchInward = async (id) => {
        try {
            const res = await axios.get(`${API}/pcs-direct-inward/${id}`);
            const data = res.data;
            setFormData({
                ...data,
                inward_date: data.inward_date ? new Date(data.inward_date).toISOString().substring(0, 10) : "",
                items: data.items.map(i => ({
                    style_name: i.style_name,
                    size: i.size,
                    qty: i.qty
                }))
            });
        } catch (err) {
            console.error("Error loading inward:", err);
            toast.error("Failed to load details");
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSupplierInput = async (e) => {
        const value = e.target.value;
        handleChange(e);
        if (value.length > 1) {
            try {
                const res = await axios.get(`${API}/supplier?term=${value}`);
                setSupplierSuggestions(res.data);
            } catch (err) { console.error(err); }
        } else {
            setSupplierSuggestions([]);
        }
    };

    const selectSupplier = (s) => {
        setFormData(prev => ({ ...prev, supplier_name: s.customer_name || s.name }));
        setSupplierSuggestions([]);
    };

    const handleItemChange = (index, e) => {
        const { name, value } = e.target;
        const newItems = [...formData.items];
        newItems[index][name] = value;
        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const addItem = () => {
        setFormData(prev => ({ ...prev, items: [...prev.items, { ...initialItem }] }));
    };

    const removeItem = (index) => {
        if (formData.items.length === 1) return;
        const newItems = formData.items.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const handleSubmit = async () => {
        if (!formData.supplier_name) return toast.error("From Name is required");
        if (formData.items.some(i => !i.style_name || !i.qty)) return toast.error("Please complete all items");

        if (selectedYear.is_closed) {
            toast.error("Error: This Accounting Year is locked and cannot be modified.");
            return;
        }

        const dateVal = new Date(formData.inward_date);
        const startDate = new Date(selectedYear.start_date);
        const endDate = new Date(selectedYear.end_date);
        if (dateVal < startDate || dateVal > endDate) {
            if (!window.confirm(`Warning: Inward date is outside the selected Accounting Year (AY ${selectedYear.year_name}). Do you want to proceed?`)) {
                return;
            }
        }

        setLoading(true);
        try {
            const payload = { ...formData, year_id: selectedYear.year_id };
            if (location.state && location.state.id) {
                await axios.put(`${API}/pcs-direct-inward/${location.state.id}`, payload);
                toast.success("Updated successfully");
            } else {
                await axios.post(`${API}/pcs-direct-inward`, payload);
                toast.success("Created successfully");
            }
            navigate("/pcs-inward-list");
        } catch (err) {
            console.error(err);
            toast.error("Operation failed");
        } finally {
            setLoading(false);
        }
    };

    const [highlightedIndex, setHighlightedIndex] = useState(-1);

    const handleKeyDown = (e, type) => {
        if (!supplierSuggestions.length) return;

        if (e.key === "ArrowDown") {
            setHighlightedIndex(prev => (prev < supplierSuggestions.length - 1 ? prev + 1 : prev));
        } else if (e.key === "ArrowUp") {
            setHighlightedIndex(prev => (prev > 0 ? prev - 1 : 0));
        } else if (e.key === "Enter") {
            if (highlightedIndex >= 0) {
                selectSupplier(supplierSuggestions[highlightedIndex]);
                setHighlightedIndex(-1);
            }
        }
    };

    return (
        <div className="container-fluid mt-4">
            <ToastContainer position="top-right" theme="colored" />
            <div className="card shadow border-0">
                <div className="card-header bg-white py-3 border-bottom shadow-sm">
                    <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-4">
                            <div>
                                <label className="fw-bold mb-0 me-1 text-muted small">Inward No:</label>
                                <div className="text-primary fw-bold fs-5">{formData.inward_no || "Loading..."}</div>
                            </div>
                            <div className="vr" style={{ height: '40px' }}></div>
                            <div>
                                <label className="fw-bold mb-0 me-1 text-muted small">Accounting Year:</label>
                                <div className="text-dark fw-bold">AY {selectedYear.year_name}</div>
                            </div>
                        </div>

                        <div className="text-center flex-grow-1">
                            <h4 className="fw-bold mb-0 text-uppercase tracking-wider">Pcs Inward</h4>
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
                <div className="card-body">
                    <div className="row g-3 mb-4">
                        <div className="col-md-4 position-relative">
                            <label className="form-label small text-muted fw-bold">From (Supplier/Source)</label>
                            <input
                                type="text"
                                className="form-control"
                                name="supplier_name"
                                value={formData.supplier_name}
                                onChange={handleSupplierInput}
                                onKeyDown={(e) => handleKeyDown(e, 'supplier')}
                                placeholder="Search Supplier"
                                autoComplete="off"
                            />
                            {supplierSuggestions.length > 0 && (
                                <ul className="list-group position-absolute w-100 shadow" style={{ zIndex: 1000 }}>
                                    {supplierSuggestions.map((s, i) => (
                                        <li
                                            key={i}
                                            className={`list-group-item list-group-item-action ${highlightedIndex === i ? 'suggestion-active' : ''}`}
                                            onClick={() => selectSupplier(s)}
                                            onMouseEnter={() => setHighlightedIndex(i)}
                                        >
                                            {s.customer_name || s.name}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <div className="col-md-3">
                            <label className="form-label small text-muted fw-bold">Create Date</label>
                            <input type="date" className="form-control" name="inward_date" value={formData.inward_date} onChange={handleChange} />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label small text-muted fw-bold">Staff Name</label>
                            <input type="text" className="form-control" name="staff_name" value={formData.staff_name} onChange={handleChange} />
                        </div>
                        <div className="col-md-12">
                            <label className="form-label small text-muted fw-bold">Remarks</label>
                            <textarea className="form-control" name="remarks" rows="2" value={formData.remarks} onChange={handleChange}></textarea>
                        </div>
                    </div>

                    <div className="table-responsive mb-3">
                        <table className="table table-bordered align-middle table-black-header">
                            <thead>
                                <tr>
                                    <th width="40%">Style Name</th>
                                    <th width="30%">Size</th>
                                    <th width="20%">Qty</th>
                                    <th width="10%">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {formData.items.map((item, index) => (
                                    <tr key={index}>
                                        <td>
                                            <input type="text" className="form-control" name="style_name" value={item.style_name} onChange={(e) => handleItemChange(index, e)} placeholder="Style Name" />
                                        </td>
                                        <td>
                                            <input type="text" className="form-control" name="size" value={item.size} onChange={(e) => handleItemChange(index, e)} placeholder="Size" />
                                        </td>
                                        <td><input type="number" className="form-control" name="qty" value={item.qty} onChange={(e) => handleItemChange(index, e)} /></td>
                                        <td className="text-center">
                                            <button className="btn btn-outline-danger btn-sm" onClick={() => removeItem(index)}><i className="bi bi-trash"></i></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <button className="btn btn-sm btn-outline-dark" onClick={addItem}><i className="bi bi-plus-lg me-1"></i> Add Row</button>
                    </div>

                    <div className="d-flex justify-content-end gap-2">
                        <button className="btn btn-secondary rounded-pill px-4" onClick={() => navigate("/pcs-inward-list")}>Cancel</button>
                        {selectedYear.is_closed ? (
                            <div className="text-danger fw-bold d-flex align-items-center me-3 h6 mb-0">
                                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                Cannot save: This Accounting Year is locked.
                            </div>
                        ) : (
                            <button className="btn btn-dark rounded-pill px-4 fw-bold shadow-sm" onClick={handleSubmit} disabled={loading}>
                                {loading ? "Saving..." : "Save Pcs Inward"}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PcsInward;
