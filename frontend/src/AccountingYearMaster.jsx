import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";

const API = process.env.REACT_APP_API_URL;

export default function AccountingYearMaster() {
    const [years, setYears] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState({
        year_name: "",
        start_date: "",
        end_date: ""
    });

    useEffect(() => {
        const pass = prompt("Enter Administration Password to access Accounting Year Management:");
        if (pass === "14043011") {
            fetchYears();
        } else {
            alert("Incorrect Password! Access Denied.");
            window.location.href = "/dashboard";
        }
    }, []);

    const fetchYears = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API}/accounting-years`);
            const yearsData = Array.isArray(res.data) ? res.data : [];
            setYears(yearsData);
        } catch (err) {
            console.error("Error fetching years:", err);
            toast.error("Failed to load accounting years");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API}/accounting-years`, formData);
            toast.success("New Accounting Year created and activated successfully!");
            setShowAddForm(false);
            setFormData({ year_name: "", start_date: "", end_date: "" });
            fetchYears();
        } catch (err) {
            console.error("Error creating year:", err);
            toast.error(err.response?.data?.error || "Failed to create accounting year");
        }
    };

    return (
        <div className="container-fluid p-4">
            <ToastContainer />
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="fw-bold text-dark">Accounting Year Management</h3>
                    <p className="text-muted small">Create and manage accounting periods</p>
                </div>
                {!showAddForm && (
                    <button
                        className="btn btn-primary d-flex align-items-center gap-2"
                        onClick={() => setShowAddForm(true)}
                    >
                        <i className="bi bi-plus-lg"></i> Create New Year
                    </button>
                )}
            </div>

            {showAddForm && (
                <div className="card shadow-sm border-0 mb-4 p-4 rounded-3 bg-light">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="fw-bold mb-0">Create New Accounting Year</h5>
                        <button className="btn-close" onClick={() => setShowAddForm(false)}></button>
                    </div>
                    <form onSubmit={handleSubmit} className="row g-3">
                        <div className="col-md-4">
                            <label className="form-label small fw-bold text-uppercase">Year Name (eg. 2025-26)</label>
                            <input
                                type="text"
                                className="form-control"
                                name="year_name"
                                value={formData.year_name}
                                onChange={handleInputChange}
                                placeholder="Year Name"
                                required
                            />
                        </div>
                        <div className="col-md-4">
                            <label className="form-label small fw-bold text-uppercase">Start Date</label>
                            <input
                                type="date"
                                className="form-control"
                                name="start_date"
                                value={formData.start_date}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="col-md-4">
                            <label className="form-label small fw-bold text-uppercase">End Date</label>
                            <input
                                type="date"
                                className="form-control"
                                name="end_date"
                                value={formData.end_date}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="col-12 mt-4 d-flex gap-2">
                            <button type="submit" className="btn btn-dark px-4">Initialize & Activate Year</button>
                            <button type="button" className="btn btn-outline-secondary px-4" onClick={() => setShowAddForm(false)}>Cancel</button>
                        </div>
                        <div className="col-12">
                            <div className="alert alert-warning small mb-0 mt-2">
                                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                <strong>Important:</strong> Creating a new year will automatically set it as <strong>Active</strong> and mark previous years as <strong>Closed</strong>.
                            </div>
                        </div>
                    </form>
                </div>
            )}

            <div className="card shadow-sm border-0 overflow-hidden rounded-3">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th className="px-4 py-3 small text-uppercase fw-bold">Year Name</th>
                                <th className="py-3 small text-uppercase fw-bold">Period</th>
                                <th className="py-3 small text-uppercase fw-bold text-center">Status</th>
                                <th className="py-3 small text-uppercase fw-bold text-center">Lock Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="4" className="text-center py-5 text-muted">Loading accounting periods...</td></tr>
                            ) : years.length === 0 ? (
                                <tr><td colSpan="4" className="text-center py-5 text-muted">No accounting years found. Create one to get started.</td></tr>
                            ) : (
                                years.map(year => (
                                    <tr key={year.year_id}>
                                        <td className="px-4 py-3 fw-bold text-dark">{year.year_name}</td>
                                        <td className="py-3">
                                            {new Date(year.start_date).toLocaleDateString()} - {new Date(year.end_date).toLocaleDateString()}
                                        </td>
                                        <td className="py-3 text-center">
                                            {year.is_active ? (
                                                <span className="badge bg-success-subtle text-success border border-success px-3 py-2 rounded-pill">Active</span>
                                            ) : (
                                                <span className="badge bg-secondary-subtle text-secondary border px-3 py-2 rounded-pill">Inactive</span>
                                            )}
                                        </td>
                                        <td className="py-3 text-center">
                                            {year.is_closed ? (
                                                <span className="text-danger small fw-bold"><i className="bi bi-lock-fill me-1"></i> Closed</span>
                                            ) : (
                                                <span className="text-primary small fw-bold"><i className="bi bi-unlock-fill me-1"></i> Open</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
