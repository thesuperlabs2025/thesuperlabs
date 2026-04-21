import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion, AnimatePresence } from "framer-motion";
import Select from "react-select";

const API = process.env.REACT_APP_API_URL;

const initialItem = {
    fabric_name: "",
    qty: 0,
    sku: "",
    display_value: ""
};

const FabricInward = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const selectedYear = JSON.parse(localStorage.getItem("selectedYear") || "{}");

    const [formData, setFormData] = useState({
        inward_no: "",
        order_no: "",
        supplier_name: "",
        inward_date: new Date().toISOString().substring(0, 10),
        staff_name: "",
        remarks: "",
        items: [{ ...initialItem }]
    });

    const [loading, setLoading] = useState(false);
    const [supplierSuggestions, setSupplierSuggestions] = useState([]);
    const [fabricSuggestions, setFabricSuggestions] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [orders, setOrders] = useState([]);
    const [activeIndex, setActiveIndex] = useState(null);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);

    useEffect(() => {
        fetchEmployees();
        fetchOrders();
        if (location.state && location.state.id) {
            fetchInward(location.state.id);
        } else {
            fetchNextNo();
        }
    }, [location.state]);

    const fetchEmployees = async () => {
        try {
            const res = await axios.get(`${API}/employees`);
            setEmployees(res.data.map(e => ({ value: e.employee_name, label: e.employee_name })));
        } catch (err) { console.error(err); }
    };

    const fetchOrders = async () => {
        try {
            const res = await axios.get(`${API}/order_planning?limit=100`);
            setOrders((res.data.data || []).map(o => ({ value: o.order_no, label: o.order_no })));
        } catch (err) { console.error(err); }
    };

    const fetchNextNo = async () => {
        try {
            const res = await axios.get(`${API}/fabric-direct-inward/next-no`);
            setFormData(prev => ({ ...prev, inward_no: res.data.inward_no }));
        } catch (err) { console.error(err); }
    };

    const fetchInward = async (id) => {
        try {
            const res = await axios.get(`${API}/fabric-direct-inward/${id}`);
            const data = res.data;
            setFormData({
                ...data,
                inward_date: data.inward_date ? new Date(data.inward_date).toISOString().substring(0, 10) : "",
                items: data.items.map(i => ({
                    fabric_name: i.fabric_name,
                    qty: i.qty,
                    sku: i.sku,
                    display_value: i.sku || i.fabric_name
                }))
            });
        } catch (err) {
            console.error(err);
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
                setSupplierSuggestions(res.data || []);
            } catch (err) { console.error(err); }
        } else {
            setSupplierSuggestions([]);
        }
    };

    const selectSupplier = (name) => {
        setFormData(prev => ({ ...prev, supplier_name: name }));
        setSupplierSuggestions([]);
    };

    const handleItemChange = (index, e) => {
        const { name, value } = e.target;
        const newItems = [...formData.items];
        newItems[index][name] = value;
        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const handleFabricInput = async (index, e) => {
        const value = e.target.value;
        const newItems = [...formData.items];
        newItems[index].display_value = value;
        setFormData(prev => ({ ...prev, items: newItems }));
        setActiveIndex(index);

        if (value.length > 1) {
            try {
                const res = await axios.get(`${API}/fabrics?term=${value}`);
                setFabricSuggestions(res.data || []);
            } catch (err) { console.error(err); }
        } else {
            setFabricSuggestions([]);
        }
    };

    const selectFabric = (index, fabric) => {
        const newItems = [...formData.items];
        newItems[index].fabric_name = fabric.fabric_name;
        newItems[index].sku = fabric.fabric_sku; // Assuming fabric has SKU field
        newItems[index].display_value = fabric.fabric_sku || fabric.fabric_name;
        setFormData(prev => ({ ...prev, items: newItems }));
        setFabricSuggestions([]);
        setActiveIndex(null);
        setHighlightedIndex(-1);
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
        if (!formData.supplier_name) return toast.error("Supplier is required");
        if (formData.items.some(i => !i.fabric_name || !i.qty)) return toast.error("Please complete all items");

        if (selectedYear.is_closed) {
            toast.error("Error: This Accounting Year is locked and cannot be modified.");
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
        try {
            const payload = { ...formData, year_id: selectedYear.year_id };
            if (location.state && location.state.id) {
                await axios.put(`${API}/fabric-direct-inward/${location.state.id}`, payload);
                toast.success("Updated successfully");
            } else {
                await axios.post(`${API}/fabric-direct-inward`, payload);
                toast.success("Created successfully");
            }
            navigate("/fabric-inward-list");
        } catch (err) {
            console.error(err);
            toast.error("Operation failed");
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e, index, type) => {
        if (type === 'supplier') {
            if (e.key === 'ArrowDown') {
                setHighlightedIndex(prev => Math.min(prev + 1, supplierSuggestions.length - 1));
            } else if (e.key === 'ArrowUp') {
                setHighlightedIndex(prev => Math.max(prev - 1, 0));
            } else if (e.key === 'Enter' && highlightedIndex >= 0) {
                selectSupplier(supplierSuggestions[highlightedIndex].supplier_name);
            }
        } else {
            if (e.key === 'ArrowDown') {
                setHighlightedIndex(prev => Math.min(prev + 1, fabricSuggestions.length - 1));
            } else if (e.key === 'ArrowUp') {
                setHighlightedIndex(prev => Math.max(prev - 1, 0));
            } else if (e.key === 'Enter' && highlightedIndex >= 0) {
                selectFabric(index, fabricSuggestions[highlightedIndex]);
            }
        }
    };

    return (
        <div className="container-fluid py-4 bg-light min-vh-100">
            <ToastContainer position="top-right" theme="colored" />

            <div className="mx-auto" style={{ maxWidth: '1200px' }}>
                {/* Header Card */}
                <div className="mb-4" style={{
                    background: 'linear-gradient(135deg, #4338ca 0%, #6366f1 100%)',
                    padding: '20px 30px',
                    borderRadius: '20px',
                    color: 'white',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    boxShadow: '0 10px 20px rgba(99, 102, 241, 0.2)'
                }}>
                    <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-4">
                            <div>
                                <h4 className="fw-bold mb-1">Fabric Inward</h4>
                                <p className="mb-0 opacity-75 small">{location.state?.id ? 'Editing' : 'New'} Stock Entry</p>
                            </div>
                            <div className="vr" style={{ height: '40px', opacity: 0.3 }}></div>
                            <div>
                                <span className="x-small text-uppercase opacity-75 fw-bold d-block mb-1" style={{ fontSize: '0.65rem' }}>Accounting Year</span>
                                <h6 className="fw-bold mb-0">AY {selectedYear.year_name}</h6>
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
                        <div className="text-end">
                            <div className="small opacity-75">Inward Number</div>
                            <h5 className="fw-bold mb-0">{formData.inward_no}</h5>
                        </div>
                    </div>
                </div>

                <div className="row g-4">
                    {/* Form Details */}
                    <div className="col-lg-4">
                        <div className="card border-0 shadow-sm" style={{ borderRadius: '20px' }}>
                            <div className="card-body p-4">
                                <h6 className="fw-bold text-dark mb-4">General Information</h6>

                                <div className="mb-3">
                                    <label className="text-muted x-small fw-bold mb-2">ORDER NO (OPTIONAL)</label>
                                    <Select
                                        options={orders}
                                        value={orders.find(o => o.value === formData.order_no)}
                                        onChange={(opt) => setFormData({ ...formData, order_no: opt ? opt.value : "" })}
                                        placeholder="Select Order"
                                        isClearable
                                        styles={{
                                            control: (base) => ({
                                                ...base,
                                                borderRadius: '12px',
                                                border: '1px solid #e2e8f0',
                                                fontSize: '0.9rem',
                                                background: '#f8fafc'
                                            })
                                        }}
                                    />
                                </div>

                                <div className="mb-3 position-relative">
                                    <label className="text-muted x-small fw-bold mb-2">SUPPLIER NAME</label>
                                    <input
                                        type="text" className="form-control border-light bg-light"
                                        style={{ borderRadius: '10px', fontSize: '0.9rem' }}
                                        name="supplier_name" value={formData.supplier_name}
                                        onChange={handleSupplierInput} onKeyDown={(e) => handleKeyDown(e, null, 'supplier')}
                                        placeholder="Type to search..." autoComplete="off"
                                    />
                                    {supplierSuggestions.length > 0 && (
                                        <ul className="list-group position-absolute w-100 shadow mt-1" style={{ zIndex: 1000, borderRadius: '10px', overflow: 'hidden' }}>
                                            {supplierSuggestions.map((s, i) => (
                                                <li
                                                    key={i}
                                                    className={`list-group-item list-group-item-action border-0 ${highlightedIndex === i ? 'bg-indigo text-white' : ''}`}
                                                    onClick={() => selectSupplier(s.name)}
                                                    onMouseEnter={() => setHighlightedIndex(i)}
                                                    style={{ cursor: 'pointer', padding: '10px 15px', fontSize: '0.9rem' }}
                                                >
                                                    {s.name}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>

                                <div className="row">
                                    <div className="col-md-12 mb-3">
                                        <label className="text-muted x-small fw-bold mb-2">INWARD DATE</label>
                                        <input
                                            type="date" className="form-control border-light bg-light"
                                            style={{ borderRadius: '10px', fontSize: '0.9rem' }}
                                            name="inward_date" value={formData.inward_date}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="col-md-12 mb-3 text-start">
                                        <label className="text-muted x-small fw-bold mb-2">STAFF / RECEIVER</label>
                                        <Select
                                            options={employees}
                                            value={employees.find(e => e.value === formData.staff_name)}
                                            onChange={(opt) => setFormData({ ...formData, staff_name: opt ? opt.value : "" })}
                                            placeholder="Select Staff"
                                            styles={{
                                                control: (base) => ({
                                                    ...base,
                                                    borderRadius: '12px',
                                                    border: '1px solid #e2e8f0',
                                                    fontSize: '0.9rem',
                                                    background: '#f8fafc'
                                                })
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="mb-0">
                                    <label className="text-muted x-small fw-bold mb-2">REMARKS</label>
                                    <textarea
                                        className="form-control border-light bg-light"
                                        style={{ borderRadius: '10px', fontSize: '0.9rem' }}
                                        name="remarks" rows="2"
                                        value={formData.remarks}
                                        onChange={handleChange}
                                        placeholder="Notes..."
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Items Section */}
                    <div className="col-lg-8">
                        <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '20px' }}>
                            <div className="card-body p-3">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h6 className="fw-bold text-dark m-0">Inward Items (Fabric)</h6>
                                    <button
                                        className="btn btn-sm px-2 py-1 fw-bold text-indigo"
                                        style={{ background: '#eef2ff', borderRadius: '8px', fontSize: '0.8rem' }}
                                        onClick={addItem}
                                    >
                                        <i className="bi bi-plus-lg me-1"></i> Add Fabric
                                    </button>
                                </div>

                                <div className="table-responsive">
                                    <table className="table table-borderless align-middle">
                                        <thead>
                                            <tr className="border-bottom">
                                                <th className="text-muted x-small fw-bold py-2" width="60%">FABRIC NAME / SKU</th>
                                                <th className="text-muted x-small fw-bold py-2" width="25%">QTY (MTRS)</th>
                                                <th className="text-muted x-small fw-bold py-2 text-end" width="15%">ACTION</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {formData.items.map((item, index) => (
                                                <tr key={index} className="border-bottom border-light">
                                                    <td className="py-2">
                                                        <div className="position-relative">
                                                            <input
                                                                type="text"
                                                                className="form-control border-0 bg-light"
                                                                style={{ borderRadius: '10px', fontSize: '0.85rem' }}
                                                                value={item.display_value}
                                                                onChange={(e) => handleFabricInput(index, e)}
                                                                onKeyDown={(e) => handleKeyDown(e, index, 'fabric')}
                                                                placeholder="Search SKU..."
                                                                autoComplete="off"
                                                            />
                                                            <AnimatePresence>
                                                                {activeIndex === index && fabricSuggestions.length > 0 && (
                                                                    <motion.ul
                                                                        initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                                                                        className="list-group position-absolute w-100 shadow-lg mt-1"
                                                                        style={{ zIndex: 1000, borderRadius: '10px', overflow: 'hidden' }}
                                                                    >
                                                                        {fabricSuggestions.map((f, i) => (
                                                                            <li
                                                                                key={i}
                                                                                className={`list-group-item list-group-item-action border-0 ${highlightedIndex === i ? 'bg-indigo text-white' : ''}`}
                                                                                onClick={() => selectFabric(index, f)}
                                                                                onMouseEnter={() => setHighlightedIndex(i)}
                                                                                style={{ cursor: 'pointer', padding: '8px 12px', fontSize: '0.85rem' }}
                                                                            >
                                                                                <div className="d-flex justify-content-between">
                                                                                    <span className="fw-bold">{f.fabric_sku}</span>
                                                                                    <small className={`${highlightedIndex === i ? 'text-white' : 'text-muted'} opacity-75`}>{f.fabric_name}</small>
                                                                                </div>
                                                                            </li>
                                                                        ))}
                                                                    </motion.ul>
                                                                )}
                                                            </AnimatePresence>
                                                        </div>
                                                    </td>
                                                    <td className="py-2">
                                                        <input
                                                            type="number"
                                                            className="form-control border-0 bg-light text-center fw-bold"
                                                            style={{ borderRadius: '10px', fontSize: '0.9rem' }}
                                                            name="qty"
                                                            value={item.qty}
                                                            onChange={(e) => handleItemChange(index, e)}
                                                            placeholder="0"
                                                        />
                                                    </td>
                                                    <td className="py-2 text-end">
                                                        <button
                                                            disabled={formData.items.length === 1}
                                                            className={`btn btn-sm rounded-circle d-inline-flex align-items-center justify-content-center ${formData.items.length === 1 ? 'opacity-25 text-muted' : 'text-danger bg-danger-subtle border-0'}`}
                                                            style={{ width: '28px', height: '28px' }}
                                                            onClick={() => removeItem(index)}
                                                        >
                                                            <i className="bi bi-trash-fill x-small"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="card-footer bg-white border-0 p-3 pt-0 text-end">
                                <div className="d-flex justify-content-end gap-2">
                                    <button className="btn px-4 py-2 border-0 text-muted fw-bold" style={{ borderRadius: '14px', background: '#f8fafc', fontSize: '0.9rem' }} onClick={() => navigate("/fabric-inward-list")}>Cancel</button>
                                    {selectedYear.is_closed ? (
                                        <div className="alert alert-danger mb-0 py-2 px-4 shadow-sm fw-bold" style={{ borderRadius: '14px' }}>
                                            <i className="bi bi-lock-fill me-2"></i>Year Locked
                                        </div>
                                    ) : (
                                        <motion.button
                                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                            className="btn px-5 py-2 fw-bold text-white shadow-lg border-0"
                                            style={{ borderRadius: '14px', background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)', fontSize: '0.9rem' }}
                                            onClick={handleSubmit} disabled={loading}
                                        >
                                            {loading ? "Saving..." : "Confirm Inward"}
                                        </motion.button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .bg-indigo { background-color: #6366f1 !important; color: white !important; }
                .text-indigo { color: #6366f1 !important; }
                .x-small { font-size: 0.7rem; }
                .form-control:focus { box-shadow: none; background-color: #fff !important; border-color: #6366f1 !important; }
            `}</style>
        </div>
    );
};

export default FabricInward;
