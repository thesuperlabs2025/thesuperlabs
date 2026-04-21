import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/css/bootstrap.min.css";

const API = process.env.REACT_APP_API_URL;

const initialItem = {
    sku: "",
    qty: 1
};

const getInitialState = () => ({
    supplier_name: "",
    mobile: "",
    sales_person: "",
    inward_date: new Date().toISOString().substring(0, 10),
    reference_no: "",
    address: "",
    details: "",
    items: [{ ...initialItem }],
    total_qty: 0,
    template_id: null,
    stock_action: "add" // Default action for Inward
});

function InwardForm() {
    const [formData, setFormData] = useState(getInitialState());
    const [suggestions, setSuggestions] = useState([]);
    const [productSuggestions, setProductSuggestions] = useState([]);
    const [activeIndex, setActiveIndex] = useState(null);
    const [suggestionIndex, setSuggestionIndex] = useState(-1);
    const [supplierSuggestionIndex, setSupplierSuggestionIndex] = useState(-1);
    const [inwardNo, setInwardNo] = useState("");
    const [loading, setLoading] = useState(false);
    const selectedYear = JSON.parse(localStorage.getItem("selectedYear") || "{}");

    const navigate = useNavigate();
    const location = useLocation();

    // Load Inward for Editing
    useEffect(() => {
        if (location.state && location.state.id) {
            const id = location.state.id;
            // Fetch Inward details
            axios.get(`${API}/inward/${id}`)
                .then(res => {
                    const data = res.data;
                    setFormData({
                        ...data,
                        inward_date: data.inward_date ? new Date(data.inward_date).toISOString().substring(0, 10) : "",
                        items: data.items.map(i => ({ sku: i.sku, qty: i.qty }))
                    });
                    setInwardNo(data.id); // Or inward_no if exists
                })
                .catch(err => console.error("Error loading inward:", err));
        } else {
            fetchNextInwardNo();
        }
    }, [location.state]);

    const fetchNextInwardNo = async () => {
        try {
            const res = await axios.get(`${API}/inward/next-inward-no`);
            setInwardNo(res.data.inwardNo);
        } catch (err) {
            console.error("Failed to load Inward number", err);
        }
    };

    // Fetch Templates
    useEffect(() => {
        axios.get(`${API}/templates`)
            .then((res) => {
                const templates = res.data;
                // Try to find 'Inward' template, else use default logic
                const tpl = templates.find(t => t.template_name.toLowerCase() === "inward") || templates[0];
                if (tpl) {
                    setFormData(prev => ({ ...prev, template_id: tpl.id, stock_action: tpl.stock_action || 'add' }));
                }
            })
            .catch(err => console.error(err));
    }, []);

    // --- Handlers ---

    const handleHeaderChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Supplier Autocomplete
    const handleSupplierInput = async (e) => {
        const value = e.target.value;
        handleHeaderChange(e);
        if (value.trim().length >= 1) {
            try {
                const res = await axios.get(`${API}/supplier?term=${encodeURIComponent(value)}`);
                setSuggestions(res.data);
                setSupplierSuggestionIndex(-1);
            } catch (err) { console.error(err); }
        } else {
            setSuggestions([]);
            setSupplierSuggestionIndex(-1);
        }
    };

    const selectSupplier = (s) => {
        setFormData(prev => ({
            ...prev,
            supplier_name: s.name || s.supplier_name,
            mobile: s.mobile || "",
            address: s.billing_address || ""
        }));
        setSuggestions([]);
        setSupplierSuggestionIndex(-1);
    };

    const handleSupplierKeyDown = (e) => {
        if (suggestions.length === 0) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setSupplierSuggestionIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setSupplierSuggestionIndex(prev => (prev > 0 ? prev - 1 : -1));
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (supplierSuggestionIndex >= 0 && suggestions[supplierSuggestionIndex]) {
                selectSupplier(suggestions[supplierSuggestionIndex]);
            }
        }
    };

    const handleProductInput = async (index, e) => {
        const value = e.target.value;
        const newItems = [...formData.items];
        newItems[index].sku = value;
        setFormData(prev => ({ ...prev, items: newItems }));
        setActiveIndex(index);
        setSuggestionIndex(-1);

        if (value.length >= 1) {
            try {
                const res = await axios.get(`${API}/products?term=${value}`);
                setProductSuggestions(res.data || []);
            } catch (err) { console.error(err); }
        } else {
            setProductSuggestions([]);
        }
    };

    const handleKeyDown = (e, index) => {
        if (productSuggestions.length === 0) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setSuggestionIndex(prev => (prev < productSuggestions.length - 1 ? prev + 1 : prev));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setSuggestionIndex(prev => (prev > 0 ? prev - 1 : -1));
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (suggestionIndex >= 0 && productSuggestions[suggestionIndex]) {
                selectProduct(index, productSuggestions[suggestionIndex]);
            }
        }
    };

    const selectProduct = (index, product) => {
        const newItems = [...formData.items];
        newItems[index].sku = product.sku;
        setFormData(prev => ({ ...prev, items: newItems }));
        setProductSuggestions([]);
        setActiveIndex(null);
        setSuggestionIndex(-1);
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

    // Calculate Total Qty
    useEffect(() => {
        const total = formData.items.reduce((sum, item) => sum + (Number(item.qty) || 0), 0);
        setFormData(prev => ({ ...prev, total_qty: total }));
    }, [formData.items]);

    const handleSave = async () => {
        if (!formData.supplier_name) {
            alert("Supplier Name is required");
            return;
        }
        if (formData.items.some(i => !i.sku || !i.qty)) {
            alert("All items must have SKU and Qty");
            return;
        }

        if (selectedYear.is_closed) {
            alert("Error: This Accounting Year is locked and cannot be modified.");
            return;
        }

        const date = new Date(formData.inward_date);
        const startDate = new Date(selectedYear.start_date);
        const endDate = new Date(selectedYear.end_date);
        if (date < startDate || date > endDate) {
            if (!window.confirm(`Warning: Inward date is outside the selected Accounting Year (AY ${selectedYear.year_name}). Do you want to proceed?`)) {
                return;
            }
        }

        setLoading(true);
        const payload = {
            ...formData,
            year_id: selectedYear.year_id
        };

        try {
            if (location.state && location.state.id) {
                await axios.put(`${API}/inward/${location.state.id}`, payload);
                alert("Inward Updated Successfully");
            } else {
                await axios.post(`${API}/inward`, payload);
                alert("Inward Created Successfully");
            }
            navigate("/inwardmy");
        } catch (err) {
            console.error(err);
            alert("Failed to save Inward");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-fluid mt-4 mb-5">
            <div className="card shadow-sm">
                <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center py-3">
                    <div className="d-flex align-items-center gap-4">
                        <h4 className="mb-0">
                            {location.state?.id ? `Edit Inward #${inwardNo}` : `New Inward #${inwardNo}`}
                        </h4>
                        <div className="vr" style={{ height: '30px', opacity: 0.5 }}></div>
                        <div>
                            <span className="small opacity-75 d-block text-uppercase fw-bold" style={{ fontSize: '0.65rem' }}>Accounting Year</span>
                            <span className="fw-bold">AY {selectedYear.year_name}</span>
                        </div>
                        {selectedYear.is_closed ? (
                            <span className="badge bg-danger px-3 py-2 rounded-pill shadow-sm">
                                <i className="bi bi-lock-fill me-1"></i>LOCKED
                            </span>
                        ) : (
                            <span className="badge bg-success px-3 py-2 rounded-pill shadow-sm">
                                <i className="bi bi-unlock-fill me-1"></i>ACTIVE
                            </span>
                        )}
                    </div>
                </div>
                <div className="card-body">
                    {/* Header Section */}
                    <div className="row g-3 mb-4">
                        <div className="col-md-4 position-relative">
                            <label className="form-label">Supplier / Source *</label>
                            <input
                                type="text"
                                className="form-control"
                                name="supplier_name"
                                value={formData.supplier_name}
                                onChange={handleSupplierInput}
                                placeholder="Search Supplier..."
                                onKeyDown={handleSupplierKeyDown}
                            />
                            {suggestions.length > 0 && (
                                <ul className="list-group position-absolute w-100 shadow" style={{ zIndex: 1000 }}>
                                    {suggestions.map((s, i) => (
                                        <li
                                            key={i}
                                            className={`list-group-item list-group-item-action ${supplierSuggestionIndex === i ? "active" : ""}`}
                                            onClick={() => selectSupplier(s)}
                                        >
                                            {s.customer_name || s.name} <small className="text-muted">({s.mobile})</small>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <div className="col-md-3">
                            <label className="form-label">Reference No</label>
                            <input
                                type="text"
                                className="form-control"
                                name="reference_no"
                                value={formData.reference_no}
                                onChange={handleHeaderChange}
                            />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label">Date</label>
                            <input
                                type="date"
                                className="form-control"
                                name="inward_date"
                                value={formData.inward_date}
                                onChange={handleHeaderChange}
                            />
                        </div>
                        <div className="col-md-2">
                            <label className="form-label">Total Qty</label>
                            <input
                                type="text"
                                className="form-control bg-light"
                                readOnly
                                value={formData.total_qty}
                            />
                        </div>
                    </div>

                    <div className="row g-3 mb-4">
                        <div className="col-md-6">
                            <label className="form-label">Details / Remarks</label>
                            <textarea
                                className="form-control"
                                name="details"
                                rows="2"
                                value={formData.details}
                                onChange={handleHeaderChange}
                            ></textarea>
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Address</label>
                            <textarea
                                className="form-control"
                                name="address"
                                rows="2"
                                value={formData.address}
                                onChange={handleHeaderChange}
                            ></textarea>
                        </div>
                    </div>

                    {/* Items Table */}
                    <h5 className="mb-3 border-bottom pb-2">Items</h5>
                    <div className="table-responsive mb-4">
                        <table className="table table-bordered align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th style={{ width: '5%' }}>#</th>
                                    <th style={{ width: '60%' }}>Product / SKU *</th>
                                    <th style={{ width: '25%' }}>Qty *</th>
                                    <th style={{ width: '10%' }} className="text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {formData.items.map((item, index) => (
                                    <tr key={index}>
                                        <td className="text-center">{index + 1}</td>
                                        <td className="position-relative">
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={item.sku}
                                                onChange={(e) => handleProductInput(index, e)}
                                                onKeyDown={(e) => handleKeyDown(e, index)}
                                                placeholder="Scan SKU or Search Product"
                                                autoComplete="off"
                                            />
                                            {activeIndex === index && productSuggestions.length > 0 && (
                                                <ul className="list-group position-absolute w-100 shadow" style={{ zIndex: 1000, top: "100%" }}>
                                                    {productSuggestions.map((p, i) => (
                                                        <li
                                                            key={i}
                                                            className={`list-group-item list-group-item-action ${suggestionIndex === i ? "active" : ""}`}
                                                            onClick={() => selectProduct(index, p)}
                                                            style={{ cursor: "pointer" }}
                                                        >
                                                            <div className="d-flex justify-content-between align-items-center">
                                                                <span><strong>{p.sku}</strong> - {p.product_name}</span>
                                                                <span className="badge bg-secondary rounded-pill">Stock: {p.current_stock || 0}</span>
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                className="form-control"
                                                name="qty"
                                                value={item.qty}
                                                onChange={(e) => handleItemChange(index, e)}
                                                min="1"
                                            />
                                        </td>
                                        <td className="text-center">
                                            <button className="btn btn-outline-danger btn-sm" onClick={() => removeItem(index)}>
                                                <i className="bi bi-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <button className="btn btn-outline-primary btn-sm" onClick={addItem}>
                            <i className="bi bi-plus-lg me-1"></i> Add Row
                        </button>
                    </div>

                    {/* Action Buttons */}
                    <div className="d-flex justify-content-end gap-2">
                        <button className="btn btn-secondary px-4 fw-bold" onClick={() => navigate("/inwardmy")}>Cancel</button>
                        {selectedYear.is_closed ? (
                            <div className="alert alert-danger mb-0 py-2 px-4 fw-bold">
                                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                Year Locked
                            </div>
                        ) : (
                            <button className="btn btn-success px-5 fw-bold shadow-sm" onClick={handleSave} disabled={loading}>
                                {loading ? "Saving..." : "Save Inward"}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default InwardForm;
