import Loader from "./Loader";
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const API = process.env.REACT_APP_API_URL;

function InwardMy() {
    const [inwards, setInwards] = useState([]);
    const [loading, setLoading] = useState(true);

    const [filters, setFilters] = useState({
        supplier_name: "",
        inward_no: "",
        inward_date: ""
    });

    const navigate = useNavigate();

    const fetchInwards = useCallback(async () => {
        setLoading(true);
        try {
            // Pass 'term' for search if provided
            const params = {
                term: filters.supplier_name || filters.inward_no
            };

            const res = await axios.get(`${API}/inward`, { params });
            setInwards(res.data || []);

        } catch (err) {
            console.error("Fetch Inward Error:", err);
            // alert("Error loading Inwards");
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchInwards();
    }, [fetchInwards]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this Inward?")) return;
        try {
            await axios.delete(`${API}/inward/${id}`);
            fetchInwards();
        } catch (err) {
            console.error(err);
            alert("Delete failed");
        }
    };

    const navigateToEdit = (id) => {
        navigate("/inwardform", { state: { id } }); // pass ID to form for edit mode
    };

    if (loading) return <Loader />;

    // Filter client-side if needed for exact matches or dates
    const filteredInwards = inwards.filter(item => {
        if (filters.inward_date && !item.inward_date.includes(filters.inward_date)) return false;
        return true;
    });

    return (
        <div className="container-fluid mt-4 px-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold text-primary">
                    <i className="bi bi-box-seam me-2"></i> Inward Management
                </h2>
                <button
                    className="btn btn-primary"
                    onClick={() => navigate("/inwardform")}
                >
                    <i className="bi bi-plus-lg me-2"></i> Create Inward
                </button>
            </div>

            {/* Filters */}
            <div className="card shadow-sm mb-4">
                <div className="card-body">
                    <div className="row g-3">
                        <div className="col-md-4">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search Supplier or Inward No..."
                                name="supplier_name"
                                value={filters.supplier_name}
                                onChange={handleFilterChange}
                            />
                        </div>
                        <div className="col-md-3">
                            <input
                                type="date"
                                className="form-control"
                                name="inward_date"
                                value={filters.inward_date}
                                onChange={handleFilterChange}
                            />
                        </div>
                        <div className="col-md-2">
                            <button className="btn btn-outline-secondary w-100" onClick={fetchInwards}>
                                Search
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="card shadow-sm">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover table-striped mb-0 align-middle">
                            <thead className="table-dark">
                                <tr>
                                    <th>#</th>
                                    <th>Date</th>
                                    <th>Supplier</th>
                                    <th>Mobile</th>
                                    <th>Qty</th>
                                    <th>Process</th>
                                    <th>Status</th>
                                    <th className="text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredInwards.length > 0 ? (
                                    filteredInwards.map((item, index) => (
                                        <tr key={item.id}>
                                            <td>{item.id}</td>
                                            <td>{new Date(item.inward_date).toLocaleDateString()}</td>
                                            <td>{item.supplier_name}</td>
                                            <td>{item.mobile || "-"}</td>
                                            <td>{item.total_qty}</td>
                                            <td><span className="badge bg-light text-dark text-uppercase small">{item.process || "—"}</span></td>
                                            <td>
                                                <span className="badge bg-info text-dark">{item.status || "Pending"}</span>
                                            </td>
                                            <td className="text-end">
                                                <button
                                                    className="btn btn-sm btn-outline-primary me-2"
                                                    onClick={() => navigateToEdit(item.id)}
                                                    title="Edit"
                                                >
                                                    <i className="bi bi-pencil"></i>
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => handleDelete(item.id)}
                                                    title="Delete"
                                                >
                                                    <i className="bi bi-trash"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="text-center py-4 text-muted">
                                            No Inwards Found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default InwardMy;
