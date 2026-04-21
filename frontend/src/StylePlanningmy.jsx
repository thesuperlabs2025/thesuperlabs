// StylePlanningmy.jsx
import Loader from "./Loader";
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";

const API = process.env.REACT_APP_API_URL;

function StylePlanningmy() {
    const [styles, setStyles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const navigate = useNavigate();

    const fetchStyles = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API}/style-planning`);
            setStyles(res.data || []);
        } catch (err) {
            console.error("Fetch Styles Error:", err);
            toast.error("Error loading style plans");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStyles();
    }, [fetchStyles]);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this style plan?")) return;
        try {
            await axios.delete(`${API}/style-planning/${id}`);
            toast.success("Style plan deleted successfully");
            fetchStyles();
        } catch (err) {
            console.error(err);
            toast.error("Delete failed");
        }
    };

    const filteredStyles = styles.filter(style => {
        const matchesSearch = style.style_name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "" || style.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (loading) return <Loader />;

    return (
        <div className="container-fluid py-4 px-md-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold text-primary mb-0">
                    <i className="bi bi-palette2 me-2"></i>Style Planning
                </h2>
                <button
                    className="btn btn-primary d-flex align-items-center fw-bold px-4 shadow-sm rounded-pill"
                    onClick={() => navigate("/style-planning")}
                >
                    <i className="bi bi-plus-lg me-2"></i>New Style Plan
                </button>
            </div>

            {/* Filters Card */}
            <div className="card shadow-sm border-0 mb-4">
                <div className="card-body p-4">
                    <div className="row g-3">
                        <div className="col-md-6">
                            <label className="form-label fw-bold small text-muted text-uppercase">Search Style</label>
                            <div className="input-group shadow-sm rounded-3 overflow-hidden border">
                                <span className="input-group-text bg-white border-0"><i className="bi bi-search text-muted"></i></span>
                                <input
                                    type="text"
                                    className="form-control border-0 ps-0"
                                    placeholder="Enter style name..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="col-md-3">
                            <label className="form-label fw-bold small text-muted text-uppercase">Status</label>
                            <select
                                className="form-select shadow-sm rounded-3"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="">All Statuses</option>
                                <option value="Pending">Pending</option>
                                <option value="Approved">Approved</option>
                                <option value="Completed">Completed</option>
                            </select>
                        </div>
                        <div className="col-md-3 d-flex align-items-end">
                            <button className="btn btn-outline-secondary w-100 rounded-3 shadow-sm" onClick={() => { setSearchTerm(""); setStatusFilter(""); }}>
                                <i className="bi bi-arrow-clockwise me-2"></i>Reset Filters
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table Card */}
            <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-dark small fw-bold text-uppercase">
                                <tr>
                                    <th className="ps-4 py-3">ID</th>
                                    <th className="py-3">Style Name</th>
                                    <th className="py-3 text-center">Color</th>
                                    <th className="py-3">Size Chart</th>
                                    <th className="py-3 text-center">Status</th>
                                    <th className="py-3 text-end pe-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStyles.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-5 text-muted fw-bold">No style plans found matching your criteria.</td>
                                    </tr>
                                ) : (
                                    filteredStyles.map((style) => (
                                        <tr key={style.id}>
                                            <td className="ps-4 fw-bold text-muted small">#{style.id}</td>
                                            <td>
                                                <div className="fw-bold text-dark">{style.style_name}</div>
                                                <div className="text-muted small">Created: {new Date(style.created_at).toLocaleDateString()}</div>
                                            </td>
                                            <td className="text-center">
                                                <span className="badge rounded-pill bg-light text-dark border px-3">
                                                    {style.style_color}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="text-primary fw-medium">{style.size_chart_name}</span>
                                            </td>
                                            <td className="text-center">
                                                <span className={`badge rounded-pill px-3 ${style.status === 'Approved' ? 'bg-success-subtle text-success border border-success-subtle' :
                                                        style.status === 'Completed' ? 'bg-primary-subtle text-primary border border-primary-subtle' :
                                                            'bg-warning-subtle text-warning border border-warning-subtle'
                                                    }`}>
                                                    {style.status || 'Pending'}
                                                </span>
                                            </td>
                                            <td className="text-end pe-4">
                                                <div className="d-flex justify-content-end gap-2">
                                                    <button
                                                        className="btn btn-light btn-sm rounded-circle shadow-sm"
                                                        title="Edit"
                                                        onClick={() => navigate(`/style-planning/${style.id}`)}
                                                    >
                                                        <i className="bi bi-pencil-square text-primary"></i>
                                                    </button>
                                                    <button
                                                        className="btn btn-light btn-sm rounded-circle shadow-sm"
                                                        title="Delete"
                                                        onClick={() => handleDelete(style.id)}
                                                    >
                                                        <i className="bi bi-trash text-danger"></i>
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
            </div>
            <ToastContainer />
        </div>
    );
}

export default StylePlanningmy;
