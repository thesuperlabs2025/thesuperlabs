import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";

const API = process.env.REACT_APP_API_URL;

const FabricInwardList = () => {
    const navigate = useNavigate();
    const [inwards, setInwards] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchInwards();
    }, []);

    const fetchInwards = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API}/fabric-direct-inward`);
            setInwards(res.data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load list");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this inward? Stock will be reversed.")) {
            try {
                await axios.delete(`${API}/fabric-direct-inward/${id}`);
                toast.success("Deleted successfully");
                fetchInwards();
            } catch (err) {
                console.error(err);
                toast.error("Failed to delete");
            }
        }
    };

    const filtered = inwards.filter(i =>
        (i.inward_no || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (i.order_no || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (i.supplier_name || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container-fluid py-4 bg-light min-vh-100">
            <ToastContainer position="top-right" theme="colored" />

            <div className="mb-3 mx-auto" style={{
                background: 'linear-gradient(135deg, #4338ca 0%, #6366f1 100%)',
                padding: '24px 32px',
                borderRadius: '20px',
                color: 'white',
                maxWidth: '1200px',
                boxShadow: '0 8px 20px rgba(99, 102, 241, 0.15)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                        <div>
                            <h3 className="fw-bold mb-1" style={{ letterSpacing: '-0.02em' }}>Fabric Inward</h3>
                            <p className="opacity-75 mb-0 small">Track fabric stock entries and gate passes</p>
                        </div>
                        <div className="d-flex gap-2">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="btn btn-light px-4 fw-bold text-indigo shadow-sm"
                                onClick={() => navigate("/fabric-inward/new")}
                                style={{ borderRadius: '12px', color: '#4338ca' }}
                            >
                                <i className="bi bi-plus-lg me-2"></i> New Entry
                            </motion.button>
                            <button className="btn btn-outline-light border-0" onClick={() => navigate("/inventory")}>
                                <i className="bi bi-arrow-left"></i>
                            </button>
                        </div>
                    </div>
                </div>
                <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '200px', height: '200px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}></div>
            </div>

            <div className="card border-0 shadow-sm mx-auto" style={{ borderRadius: '20px', overflow: 'hidden', maxWidth: '1200px' }}>
                <div className="card-header bg-white border-0 py-3 px-4">
                    <div className="row align-items-center">
                        <div className="col-md-6">
                            <h6 className="mb-0 fw-bold text-dark">Recent Inwards <span className="badge bg-indigo-100 text-indigo-700 ms-2">{filtered.length}</span></h6>
                        </div>
                        <div className="col-md-6 mt-3 mt-md-0">
                            <div className="input-group" style={{ maxWidth: '400px', marginLeft: 'auto' }}>
                                <span className="input-group-text bg-light border-0" style={{ borderRadius: '12px 0 0 12px' }}>
                                    <i className="bi bi-search text-muted"></i>
                                </span>
                                <input
                                    type="text"
                                    className="form-control bg-light border-0 py-2"
                                    placeholder="Search by ID, Order or Supplier..."
                                    style={{ borderRadius: '0 12px 12px 0', fontSize: '0.9rem' }}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="bg-light">
                                <tr>
                                    <th className="px-4 py-3 text-uppercase x-small fw-bold text-muted">Inward Details</th>
                                    <th className="px-4 py-3 text-uppercase x-small fw-bold text-muted">Order No</th>
                                    <th className="px-4 py-3 text-uppercase x-small fw-bold text-muted">Supplier</th>
                                    <th className="px-4 py-3 text-uppercase x-small fw-bold text-muted">Staff</th>
                                    <th className="px-4 py-3 text-uppercase x-small fw-bold text-muted">Remarks</th>
                                    <th className="px-4 py-3 text-uppercase x-small fw-bold text-muted text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="6" className="text-center py-5"><div className="spinner-border text-primary spinner-border-sm me-2"></div>Loading...</td></tr>
                                ) : filtered.length === 0 ? (
                                    <tr><td colSpan="6" className="text-center py-5 text-muted">No inward records found</td></tr>
                                ) : filtered.map((inward) => (
                                    <tr key={inward.id} className="border-bottom border-light">
                                        <td className="px-4 py-3">
                                            <div className="fw-bold text-dark" style={{ fontSize: '0.9rem' }}>{inward.inward_no}</div>
                                            <div className="text-muted x-small">{new Date(inward.inward_date).toLocaleDateString()}</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            {inward.order_no ? (
                                                <span className="badge bg-indigo-50 text-indigo-600 border border-indigo-100 fw-bold px-2 py-1" style={{ fontSize: '0.75rem' }}>
                                                    {inward.order_no}
                                                </span>
                                            ) : <span className="text-muted small">---</span>}
                                        </td>
                                        <td className="px-4 py-3 fw-semibold text-dark" style={{ fontSize: '0.9rem' }}>{inward.supplier_name}</td>
                                        <td className="px-4 py-3">
                                            <div className="d-flex align-items-center">
                                                <div className="bg-light rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: '24px', height: '24px' }}>
                                                    <i className="bi bi-person text-indigo small"></i>
                                                </div>
                                                <span className="text-secondary small">{inward.staff_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-muted small">
                                            <div className="text-truncate" style={{ maxWidth: '150px' }}>{inward.remarks || "---"}</div>
                                        </td>
                                        <td className="px-4 py-3 text-end">
                                            <div className="d-flex justify-content-end gap-2">
                                                <button
                                                    className="btn btn-sm"
                                                    style={{ background: '#f5f3ff', color: '#4f46e5', borderRadius: '8px' }}
                                                    onClick={() => navigate("/fabric-inward/edit", { state: { id: inward.id } })}
                                                >
                                                    <i className="bi bi-pencil-square"></i>
                                                </button>
                                                <button
                                                    className="btn btn-sm"
                                                    style={{ background: '#fff1f2', color: '#e11d48', borderRadius: '8px' }}
                                                    onClick={() => handleDelete(inward.id)}
                                                >
                                                    <i className="bi bi-trash"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <style>{`
                .x-small { font-size: 0.7rem; }
                .text-indigo-700 { color: #4338ca; }
                .bg-indigo-100 { background-color: #e0e7ff; }
                .bg-indigo-50 { background-color: #f5f3ff; }
                .text-indigo-600 { color: #4f46e5; }
                .border-indigo-100 { border-color: #e0e7ff !important; }
                .text-indigo { color: #6366f1; }
            `}</style>
        </div>
    );
};

export default FabricInwardList;
