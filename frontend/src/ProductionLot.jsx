import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import Select from "react-select";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";

const API = process.env.REACT_APP_API_URL;

const ProductionLot = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const editId = location.state?.id;

    const [formData, setFormData] = useState({
        lot_no: "",
        lot_name: "",
        status: "Pending",
        orders: []
    });

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const selectedYear = JSON.parse(localStorage.getItem("selectedYear") || "{}");

    useEffect(() => {
        fetchOrders();
        if (editId) {
            fetchLotData(editId);
        } else {
            fetchNextNo();
        }
    }, [editId]);

    const fetchOrders = async () => {
        try {
            const res = await axios.get(`${API}/order_planning?limit=1000`);
            const data = (res.data.data || []).map(o => ({
                value: o.id,
                label: `${o.order_no} - ${o.buyer_name || o.own_brand_name || 'N/A'}`,
                order_no: o.order_no,
                order_date: o.order_planning_date || o.order_date
            }));
            setOrders(data);
        } catch (err) {
            console.error("Error fetching orders:", err);
        }
    };

    const fetchNextNo = async () => {
        try {
            const res = await axios.get(`${API}/production-lots/next-no`);
            setFormData(prev => ({ ...prev, lot_no: res.data.lot_no }));
        } catch (err) {
            console.error("Error fetching next no:", err);
        }
    };

    const fetchLotData = async (id) => {
        try {
            const res = await axios.get(`${API}/production-lots/${id}`);
            const data = res.data;
            setFormData({
                lot_no: data.lot_no,
                lot_name: data.lot_name,
                status: data.status,
                orders: (data.orders || []).map(o => ({
                    value: o.order_planning_id,
                    label: o.order_no,
                    order_no: o.order_no,
                    order_date: o.order_date
                }))
            });
        } catch (err) {
            console.error("Error fetching lot:", err);
            toast.error("Failed to load lot details");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.lot_name) return toast.error("Lot Name is required");
        if (formData.orders.length === 0) return toast.error("Please select at least one order");

        if (selectedYear.is_closed) {
            toast.error("Error: This Accounting Year is locked and cannot be modified.");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                ...formData,
                year_id: selectedYear.year_id,
                orders: formData.orders.map(o => ({
                    order_planning_id: o.value,
                    order_no: o.order_no,
                    order_date: o.order_date
                }))
            };

            if (editId) {
                await axios.put(`${API}/production-lots/${editId}`, payload);
                toast.success("Production Lot updated successfully");
            } else {
                await axios.post(`${API}/production-lots`, payload);
                toast.success("Production Lot created successfully");
            }
            navigate("/production-lot-list");
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.error || "Operation failed");
        } finally {
            setLoading(false);
        }
    };

    const customStyles = {
        control: (base) => ({
            ...base,
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '4px',
            fontSize: '0.9rem',
            background: '#f8fafc',
            '&:hover': { border: '1px solid #cbd5e1' }
        }),
        multiValue: (base) => ({
            ...base,
            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            borderRadius: '8px',
            padding: '2px 8px',
        }),
        multiValueLabel: (base) => ({
            ...base,
            color: 'white',
            fontWeight: '600',
        }),
        multiValueRemove: (base) => ({
            ...base,
            color: 'white',
            '&:hover': { background: 'rgba(255,255,255,0.2)', color: 'white' }
        }),
    };

    return (
        <div className="container-fluid py-4 bg-light min-vh-100">
            <ToastContainer position="top-right" theme="colored" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-width-1000 mx-auto"
            >
                {/* Header Card */}
                <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4"
                    style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' }}>
                    <div className="card-body p-4 text-white d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-4">
                            <div>
                                <h3 className="fw-bold mb-1">{editId ? "Edit Production Lot" : "Create Production Lot"}</h3>
                                <p className="mb-0 opacity-75">Define manufacturing batches and linked orders</p>
                            </div>
                            <div className="vr" style={{ height: '40px', opacity: 0.3 }}></div>
                            <div>
                                <span className="x-small text-uppercase opacity-75 fw-bold d-block mb-1">Accounting Year</span>
                                <h5 className="fw-bold mb-0">AY {selectedYear.year_name}</h5>
                            </div>
                            {selectedYear.is_closed ? (
                                <span className="badge bg-danger bg-opacity-75 border border-white border-opacity-25 px-3 py-2 rounded-pill shadow-sm">
                                    <i className="bi bi-lock-fill me-1"></i>LOCKED
                                </span>
                            ) : (
                                <span className="badge bg-success bg-opacity-75 border border-white border-opacity-25 px-3 py-2 rounded-pill shadow-sm">
                                    <i className="bi bi-unlock-fill me-1"></i>ACTIVE
                                </span>
                            )}
                        </div>
                        <div className="text-end">
                            <span className="x-small text-uppercase opacity-75 fw-bold d-block mb-1">Lot Number</span>
                            <h4 className="fw-bold mb-0">{formData.lot_no || "---"}</h4>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-lg-8">
                        <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
                            <h5 className="fw-bold text-dark mb-4 d-flex align-items-center">
                                <span className="bg-indigo-soft p-2 rounded-3 me-3">
                                    <i className="bi bi-box-seam text-indigo"></i>
                                </span>
                                Lot Details
                            </h5>

                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label className="text-muted x-small fw-bold mb-2">LOT NAME / REFERENCE</label>
                                    <input
                                        type="text"
                                        className="form-control form-control-lg border-light bg-light"
                                        style={{ borderRadius: '12px', fontSize: '1rem' }}
                                        placeholder="e.g. Summer Collection Batch A"
                                        value={formData.lot_name}
                                        onChange={(e) => setFormData({ ...formData, lot_name: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="text-muted x-small fw-bold mb-2">LINKED ORDERS (MULTI-SELECT)</label>
                                    <Select
                                        isMulti
                                        options={orders}
                                        value={formData.orders}
                                        onChange={(selected) => setFormData({ ...formData, orders: selected || [] })}
                                        styles={customStyles}
                                        placeholder="Select orders to bundle..."
                                    />
                                    <div className="mt-2 text-muted x-small fw-medium px-1">
                                        <i className="bi bi-info-circle me-1"></i>
                                        These orders will be grouped under this production lot for tracking.
                                    </div>
                                </div>

                                <div className="d-flex justify-content-end gap-2 mt-5 align-items-center">
                                    <button
                                        type="button"
                                        className="btn btn-light px-4 py-2 fw-bold text-secondary"
                                        style={{ borderRadius: '12px' }}
                                        onClick={() => navigate("/production-lot-list")}
                                    >
                                        Cancel
                                    </button>
                                    {selectedYear.is_closed ? (
                                        <div className="alert alert-danger mb-0 py-2 px-4 fw-bold shadow-sm" style={{ borderRadius: '12px' }}>
                                            <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                            Year Locked
                                        </div>
                                    ) : (
                                        <button
                                            type="submit"
                                            className="btn btn-indigo px-5 py-2 fw-bold text-white shadow-sm"
                                            style={{ borderRadius: '12px', background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' }}
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <><span className="spinner-border spinner-border-sm me-2"></span>Saving...</>
                                            ) : (
                                                <><i className="bi bi-check-circle me-2"></i>{editId ? "Update Lot" : "Create Lot"}</>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>

                    <div className="col-lg-4">
                        <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
                            <h6 className="fw-bold text-dark mb-3">Status Management</h6>
                            <div className="lot-status-options">
                                {['Pending', 'Approved', 'Hold', 'Completed'].map(s => (
                                    <div
                                        key={s}
                                        className={`p-3 border rounded-3 mb-2 cursor-pointer transition-all d-flex align-items-center justify-content-between ${formData.status === s ? 'bg-indigo-soft border-indigo' : 'bg-white border-light'}`}
                                        onClick={() => setFormData({ ...formData, status: s })}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <div className="d-flex align-items-center">
                                            <div className={`status-dot me-3 ${s.toLowerCase()}`}></div>
                                            <span className={`fw-semibold ${formData.status === s ? 'text-indigo' : 'text-muted'}`}>{s}</span>
                                        </div>
                                        {formData.status === s && <i className="bi bi-check-circle-fill text-indigo"></i>}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="card border-0 shadow-sm rounded-4 p-4 bg-gradient-indigo text-white">
                            <h6 className="fw-bold mb-3">Lot Summary</h6>
                            <div className="d-flex justify-content-between mb-2">
                                <span className="x-small opacity-75">Lot ID:</span>
                                <span className="small fw-bold">{formData.lot_no || 'TBD'}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                                <span className="x-small opacity-75">Selected Orders:</span>
                                <span className="small fw-bold">{formData.orders.length}</span>
                            </div>
                            <div className="d-flex justify-content-between">
                                <span className="x-small opacity-75">Batch Status:</span>
                                <span className="small fw-bold">{formData.status}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            <style>{`
                .max-width-1000 { max-width: 1000px; }
                .bg-indigo-soft { background: rgba(79, 70, 229, 0.1); }
                .text-indigo { color: #4f46e5; }
                .bg-gradient-indigo { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); }
                .transition-all { transition: all 0.2s ease; }
                .border-indigo { border-color: #4f46e5 !important; }
                .status-dot { width: 10px; height: 10px; border-radius: 50%; background: #94a3b8; }
                .status-dot.pending { background: #f59e0b; }
                .status-dot.approved { background: #22c55e; }
                .status-dot.hold { background: #ef4444; }
                .status-dot.completed { background: #6366f1; }
                .cursor-pointer { cursor: pointer; }
            `}</style>
        </div>
    );
};

export default ProductionLot;
