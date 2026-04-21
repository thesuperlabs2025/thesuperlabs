import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";

const API = process.env.REACT_APP_API_URL;

const InternalLotList = () => {
    const navigate = useNavigate();
    const [lots, setLots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchLots();
    }, []);

    const fetchLots = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API}/internal-lots`);
            setLots(res.data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load internal lots");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this lot?")) return;
        try {
            await axios.delete(`${API}/internal-lots/${id}`);
            toast.success("Lot deleted successfully");
            fetchLots();
        } catch (err) {
            console.error(err);
            toast.error("Delete failed");
        }
    };

    const getStatusBadge = (status) => {
        const base = "badge px-3 py-2 rounded-3 fw-bold text-uppercase x-small ";
        switch (status) {
            case 'Completed': return base + "bg-indigo-soft text-indigo";
            case 'Hold': return base + "bg-danger-soft text-danger";
            case 'Approved': return base + "bg-success-soft text-success";
            default: return base + "bg-secondary-soft text-dark";
        }
    };

    const filteredLots = lots.filter(l =>
        (l.internal_lot_no || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (l.internal_lot_name || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container-fluid py-4 min-vh-100 bg-light">
            <ToastContainer position="top-right" theme="colored" />

            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-width-900 mx-auto"
            >
                <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
                    <div>
                        <h3 className="fw-bold text-dark mb-1">Internal Lots</h3>
                        <p className="text-muted mb-0 small fw-medium">Manage your internal batch naming</p>
                    </div>
                    <button
                        className="btn btn-dark shadow d-flex align-items-center gap-2 px-4"
                        style={{ borderRadius: '12px' }}
                        onClick={() => navigate("/internal-lot/new")}
                    >
                        <i className="bi bi-plus-lg"></i> Create Internal Lot
                    </button>
                </div>

                <div className="card shadow-sm border-0 rounded-4 p-4 mb-4 bg-white">
                    <div className="row align-items-center">
                        <div className="col-md-6">
                            <div className="input-group">
                                <span className="input-group-text border-0 bg-transparent ps-0">
                                    <i className="bi bi-search text-muted"></i>
                                </span>
                                <input
                                    type="text"
                                    className="form-control border-0 bg-transparent border-bottom shadow-none"
                                    placeholder="Search by lot no or name..."
                                    style={{ borderRadius: '0', fontSize: '0.9rem' }}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card shadow-sm border-0 rounded-4 overflow-hidden bg-white">
                    <div className="table-responsive">
                        <table className="table custom-lot-table mb-0 align-middle">
                            <thead>
                                <tr className="bg-dark text-white">
                                    <th className="px-4 py-3 text-uppercase x-small fw-bold border-0" width="20%">Lot No</th>
                                    <th className="px-3 py-3 text-uppercase x-small fw-bold border-0" width="40%">Lot Name</th>
                                    <th className="px-3 py-3 text-uppercase x-small fw-bold border-0 text-center" width="20%">Status</th>
                                    <th className="px-4 py-3 text-uppercase x-small fw-bold border-0 text-end" width="20%">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="4" className="text-center py-5">
                                            <div className="spinner-border text-dark spinner-border-sm me-2"></div>
                                            <span className="text-muted fw-bold small">Loading lots...</span>
                                        </td>
                                    </tr>
                                ) : filteredLots.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="text-center py-5 text-muted fw-bold small">No lots found.</td>
                                    </tr>
                                ) : (
                                    filteredLots.map((lot) => (
                                        <tr key={lot.id} className="transition-all hover-bg-light">
                                            <td className="px-4 py-4">
                                                <span className="fw-bold text-dark">{lot.internal_lot_no}</span>
                                            </td>
                                            <td className="px-3 py-4">
                                                <span className="fw-semibold text-muted d-block text-truncate" style={{ maxWidth: '300px' }}>
                                                    {lot.internal_lot_name}
                                                </span>
                                            </td>
                                            <td className="px-3 py-4 text-center">
                                                <span className={getStatusBadge(lot.status)}>
                                                    {lot.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-end">
                                                <div className="d-flex justify-content-end gap-2">
                                                    <button
                                                        className="btn btn-outline-dark btn-sm rounded-3 shadow-none border-0 bg-light"
                                                        onClick={() => navigate("/internal-lot/edit", { state: { id: lot.id } })}
                                                    >
                                                        <i className="bi bi-pencil-square"></i>
                                                    </button>
                                                    <button
                                                        className="btn btn-outline-danger btn-sm rounded-3 shadow-none border-0 bg-light"
                                                        onClick={() => handleDelete(lot.id)}
                                                    >
                                                        <i className="bi bi-trash"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </motion.div>

            <style>{`
                .max-width-900 { max-width: 900px; }
                .bg-indigo-soft { background: rgba(79, 70, 229, 0.1); color: #4f46e5 !important; }
                .bg-danger-soft { background: rgba(239, 68, 68, 0.1); color: #ef4444 !important; }
                .bg-success-soft { background: rgba(34, 197, 94, 0.1); color: #22c55e !important; }
                .bg-secondary-soft { background: rgba(148, 163, 184, 0.1); color: #475569 !important; }
                .transition-all { transition: all 0.25s ease; }
                .hover-bg-light:hover { background-color: #f1f5f9; }
                .rounded-3 { border-radius: 8px !important; }
            `}</style>
        </div>
    );
};

export default InternalLotList;
