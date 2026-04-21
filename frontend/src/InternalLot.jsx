import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";

const API = process.env.REACT_APP_API_URL;

const InternalLot = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const editId = location.state?.id;

    const [formData, setFormData] = useState({
        internal_lot_no: "",
        internal_lot_name: "",
        status: "Pending"
    });

    const [loading, setLoading] = useState(false);
    const selectedYear = JSON.parse(localStorage.getItem("selectedYear") || "{}");

    useEffect(() => {
        if (editId) {
            fetchLotData(editId);
        } else {
            fetchNextNo();
        }
    }, [editId]);

    const fetchNextNo = async () => {
        try {
            const res = await axios.get(`${API}/internal-lots/next-no`);
            setFormData(prev => ({ ...prev, internal_lot_no: res.data.internal_lot_no }));
        } catch (err) {
            console.error("Error fetching next no:", err);
        }
    };

    const fetchLotData = async (id) => {
        try {
            const res = await axios.get(`${API}/internal-lots/${id}`);
            setFormData(res.data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load lot details");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.internal_lot_name) return toast.error("Lot Name is required");

        if (selectedYear.is_closed) {
            toast.error("Error: This Accounting Year is locked and cannot be modified.");
            return;
        }

        setLoading(true);
        const payload = {
            ...formData,
            year_id: selectedYear.year_id
        };

        try {
            if (editId) {
                await axios.put(`${API}/internal-lots/${editId}`, payload);
                toast.success("Internal Lot updated successfully");
            } else {
                await axios.post(`${API}/internal-lots`, payload);
                toast.success("Internal Lot created successfully");
            }
            navigate("/internal-lot-list");
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.error || "Operation failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-fluid py-4 bg-light min-vh-100">
            <ToastContainer position="top-right" theme="colored" />

            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-width-600 mx-auto"
            >
                <div className="card border-0 shadow-lg rounded-4 overflow-hidden mb-4">
                    <div className="p-4 text-white d-flex justify-content-between align-items-center bg-dark">
                        <div className="d-flex align-items-center gap-4">
                            <div>
                                <h3 className="fw-bold mb-1">{editId ? "Edit Internal Lot" : "Create Internal Lot"}</h3>
                                <p className="mb-0 opacity-75 small">Internal batch identification</p>
                            </div>
                            <div className="vr" style={{ height: '40px', opacity: 0.3 }}></div>
                            <div>
                                <span className="x-small text-uppercase opacity-75 fw-bold d-block mb-1">Accounting Year</span>
                                <h5 className="fw-bold mb-0 text-white">AY {selectedYear.year_name}</h5>
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
                            <span className="x-small text-uppercase opacity-75 fw-bold d-block mb-1">Lot Number</span>
                            <h4 className="fw-bold mb-0 text-white shadow-sm">{formData.internal_lot_no || "---"}</h4>
                        </div>
                    </div>

                    <div className="card-body p-4 p-md-5">
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="text-muted x-small fw-bold mb-2">INTERNAL LOT NAME</label>
                                <input
                                    type="text"
                                    className="form-control form-control-lg border-0 bg-light"
                                    style={{ borderRadius: '12px', fontSize: '1.2rem', fontWeight: '500' }}
                                    placeholder="Enter lot name..."
                                    value={formData.internal_lot_name}
                                    onChange={(e) => setFormData({ ...formData, internal_lot_name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label className="text-muted x-small fw-bold mb-2">STATUS</label>
                                <div className="d-flex flex-wrap gap-2">
                                    {['Pending', 'Approved', 'Hold', 'Completed'].map(s => (
                                        <div
                                            key={s}
                                            className={`px-3 py-2 rounded-3 border transition-all cursor-pointer flex-grow-1 text-center small fw-bold ${formData.status === s ? 'bg-dark text-white border-dark shadow-sm' : 'bg-white text-muted border-light'}`}
                                            onClick={() => setFormData({ ...formData, status: s })}
                                        >
                                            {s}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="d-flex justify-content-end gap-2 mt-5 align-items-center">
                                <button
                                    type="button"
                                    className="btn btn-light px-4 py-3 fw-bold text-secondary"
                                    style={{ borderRadius: '12px' }}
                                    onClick={() => navigate("/internal-lot-list")}
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
                                        className="btn btn-dark px-5 py-3 fw-bold shadow"
                                        style={{ borderRadius: '12px' }}
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <><span className="spinner-border spinner-border-sm me-2"></span>Saving...</>
                                        ) : (
                                            <>{editId ? "Update Internal Lot" : "Save Internal Lot"}</>
                                        )}
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-4 shadow-sm border text-center opacity-75">
                    <p className="mb-0 x-small text-muted fw-medium">
                        <i className="bi bi-info-circle me-1"></i>
                        Internal lots are only used for grouping within the facility.
                    </p>
                </div>
            </motion.div>

            <style>{`
                .max-width-600 { max-width: 600px; }
                .transition-all { transition: all 0.2s ease; }
                .cursor-pointer { cursor: pointer; }
            `}</style>
        </div>
    );
};

export default InternalLot;
