import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";

const API = process.env.REACT_APP_API_URL;

const ProductionLotList = () => {
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
            const res = await axios.get(`${API}/production-lots`);
            setLots(res.data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load production lots");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this lot?")) return;
        try {
            await axios.delete(`${API}/production-lots/${id}`);
            toast.success("Lot deleted successfully");
            fetchLots();
        } catch (err) {
            console.error(err);
            toast.error("Delete failed");
        }
    };

    const getStatusBadge = (status) => {
        const base = "badge px-3 py-2 rounded-pill fw-bold text-uppercase x-small ";
        switch (status) {
            case 'Completed': return base + "bg-indigo-soft text-indigo border-indigo-20";
            case 'Hold': return base + "bg-rose-soft text-rose border-rose-20";
            case 'Approved': return base + "bg-emerald-soft text-emerald border-emerald-20";
            default: return base + "bg-amber-soft text-amber border-amber-20";
        }
    };

    const filteredLots = lots.filter(l =>
        (l.lot_no || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (l.lot_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (l.orders || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container-fluid py-4 bg-light min-vh-100">
            <ToastContainer position="top-right" theme="colored" />

            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-width-1200 mx-auto"
            >
                <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
                    <div>
                        <h3 className="fw-bold text-dark mb-1">Production Lots</h3>
                        <p className="text-muted mb-0 small fw-medium">Track your manufacturing batches and linked orders</p>
                    </div>
                    <button
                        className="btn btn-indigo shadow-sm d-flex align-items-center gap-2 px-4 py-2"
                        style={{ borderRadius: '12px', background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', color: 'white', fontWeight: '600' }}
                        onClick={() => navigate("/production-lot/new")}
                    >
                        <i className="bi bi-plus-lg"></i> Create Lot
                    </button>
                </div>

                <div className="card shadow-sm border-0 rounded-4 p-4 mb-4 bg-white">
                    <div className="row align-items-center">
                        <div className="col-md-5">
                            <div className="input-group">
                                <span className="input-group-text border-0 bg-transparent ps-0">
                                    <i className="bi bi-search text-muted"></i>
                                </span>
                                <input
                                    type="text"
                                    className="form-control border-0 bg-transparent border-bottom shadow-none"
                                    placeholder="Search by Lot ID, Name, or Orders..."
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
                                <tr className="bg-light">
                                    <th className="px-4 py-3 text-uppercase x-small fw-bold text-muted" width="15%">Lot ID</th>
                                    <th className="px-3 py-3 text-uppercase x-small fw-bold text-muted" width="25%">Lot Name</th>
                                    <th className="px-3 py-3 text-uppercase x-small fw-bold text-muted" width="25%">Linked Orders</th>
                                    <th className="px-3 py-3 text-uppercase x-small fw-bold text-muted text-center" width="15%">Status</th>
                                    <th className="px-4 py-3 text-uppercase x-small fw-bold text-muted text-end" width="20%">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-5">
                                            <div className="spinner-border text-indigo spinner-border-sm me-2"></div>
                                            <span className="text-muted fw-bold">Loading lots...</span>
                                        </td>
                                    </tr>
                                ) : filteredLots.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-5 text-muted fw-bold">No production lots found.</td>
                                    </tr>
                                ) : (
                                    filteredLots.map((lot) => (
                                        <tr key={lot.id} className="transition-all hover-bg-light">
                                            <td className="px-4 py-4">
                                                <div className="d-flex align-items-center">
                                                    <div className="lot-id-icon me-3">
                                                        <i className="bi bi-box-seam text-indigo"></i>
                                                    </div>
                                                    <span className="fw-bold text-primary">{lot.lot_no}</span>
                                                </div>
                                            </td>
                                            <td className="px-3 py-4">
                                                <span className="fw-semibold text-dark d-block text-truncate" style={{ maxWidth: '250px' }}>
                                                    {lot.lot_name}
                                                </span>
                                                <span className="x-small text-muted">{new Date(lot.created_at).toLocaleDateString()}</span>
                                            </td>
                                            <td className="px-3 py-4">
                                                <div className="d-flex flex-wrap gap-1">
                                                    {(lot.orders || "").split(', ').map((o, idx) => (
                                                        <span key={idx} className="badge bg-light text-muted border px-2 py-1 x-small fw-semibold">{o}</span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-3 py-4 text-center">
                                                <span className={getStatusBadge(lot.status)}>
                                                    {lot.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-end">
                                                <div className="d-flex justify-content-end gap-2">
                                                    <button
                                                        className="btn btn-light-indigo btn-sm rounded-3 shadow-none border-0"
                                                        onClick={() => navigate("/production-lot/edit", { state: { id: lot.id } })}
                                                    >
                                                        <i className="bi bi-pencil-square"></i>
                                                    </button>
                                                    <button
                                                        className="btn btn-light-rose btn-sm rounded-3 shadow-none border-0"
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
                .max-width-1200 { max-width: 1200px; }
                .text-indigo { color: #4f46e5; }
                .bg-indigo-soft { background: rgba(79, 70, 229, 0.1); }
                .border-indigo-20 { border: 1px solid rgba(79, 70, 229, 0.2); }
                .bg-rose-soft { background: rgba(244, 63, 94, 0.1); }
                .text-rose { color: #f43f5e; }
                .border-rose-20 { border: 1px solid rgba(244, 63, 94, 0.2); }
                .bg-emerald-soft { background: rgba(16, 185, 129, 0.1); }
                .text-emerald { color: #10b981; }
                .border-emerald-20 { border: 1px solid rgba(16, 185, 129, 0.2); }
                .bg-amber-soft { background: rgba(245, 158, 11, 0.1); }
                .text-amber { color: #f59e0b; }
                .border-amber-20 { border: 1px solid rgba(245, 158, 11, 0.2); }
                .btn-light-indigo { background: rgba(79, 70, 229, 0.08); color: #4f46e5; }
                .btn-light-indigo:hover { background: #4f46e5; color: white; }
                .btn-light-rose { background: rgba(244, 63, 94, 0.08); color: #f43f5e; }
                .btn-light-rose:hover { background: #f43f5e; color: white; }
                .lot-id-icon { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: rgba(79, 70, 229, 0.1); border-radius: 8px; }
                .transition-all { transition: all 0.25s ease; }
                .hover-bg-light:hover { background-color: #f8fafc; }
            `}</style>
        </div>
    );
};

export default ProductionLotList;
