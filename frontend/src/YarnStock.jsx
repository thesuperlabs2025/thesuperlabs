import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API = process.env.REACT_APP_API_URL;

const SectionHeader = ({ title, icon }) => (
    <div className="d-flex align-items-center mb-3">
        <div className="bg-primary bg-opacity-10 p-2 rounded-circle me-2">
            <i className={`bi ${icon} text-primary fs-5`}></i>
        </div>
        <h5 className="mb-0 fw-bold text-dark">{title}</h5>
    </div>
);

const YarnStock = () => {
    const navigate = useNavigate();
    const [yarns, setYarns] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [filters, setFilters] = useState({
        sku: "",
        name: "",
        color: "",
        composition: "",
        stockStatus: "" // "" (All), "gt0" (>0), "le0" (<=0)
    });
    const [formData, setFormData] = useState({
        id: null,
        yarn_sku: "",
        counts: "",
        yarn_name: "",
        color: "",
        composition: "",
        minimum_stock: ""
    });
    const [selectedIds, setSelectedIds] = useState([]);

    const fetchYarns = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API}/yarn`);
            setYarns(res.data);
        } catch (err) {
            console.error("Error fetching yarns:", err);
            toast.error("Failed to load yarn data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchYarns();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData(prev => {
            const updated = { ...prev, [name]: value };

            // Auto-generate SKU: counts-yarn name-color-composition
            if (["counts", "yarn_name", "color", "composition"].includes(name)) {
                const parts = [
                    (updated.counts || "").trim(),
                    (updated.yarn_name || "").trim(),
                    (updated.color || "").trim(),
                    (updated.composition || "").trim()
                ].filter(Boolean);

                updated.yarn_sku = parts.join('-').toLowerCase().replace(/\s+/g, '-');
            }

            return updated;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (formData.id) {
                await axios.put(`${API}/yarn/${formData.id}`, formData);
                toast.success("Yarn updated successfully");
            } else {
                await axios.post(`${API}/yarn`, formData);
                toast.success("Yarn created successfully");
            }
            setShowForm(false);
            setFormData({ id: null, yarn_sku: "", counts: "", yarn_name: "", color: "", composition: "", minimum_stock: "" });
            fetchYarns();
        } catch (err) {
            console.error("Error saving yarn:", err);
            const errorMessage = err.response?.data?.error || "Failed to save yarn";
            toast.error(errorMessage);
        }
    };

    const handleEdit = (yarn) => {
        let updatedYarn = { ...yarn };
        if (!updatedYarn.yarn_sku) {
            const parts = [
                (updatedYarn.counts || "").trim(),
                (updatedYarn.yarn_name || "").trim(),
                (updatedYarn.color || "").trim(),
                (updatedYarn.composition || "").trim()
            ].filter(Boolean);
            updatedYarn.yarn_sku = parts.join('-').toLowerCase().replace(/\s+/g, '-');
        }
        setFormData(updatedYarn);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this yarn record?")) {
            try {
                await axios.delete(`${API}/yarn/${id}`);
                toast.success("Yarn record deleted successfully");
                fetchYarns();
            } catch (err) {
                console.error("Error deleting yarn:", err);
                toast.error("Failed to delete yarn");
            }
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        if (window.confirm(`Are you sure you want to delete ${selectedIds.length} selected yarn records?`)) {
            try {
                await axios.post(`${API}/yarn/bulk-delete`, { ids: selectedIds });
                toast.success(`${selectedIds.length} yarn records deleted`);
                setSelectedIds([]);
                fetchYarns();
            } catch (err) {
                console.error("Error bulk deleting:", err);
                toast.error("Failed to delete selected items");
            }
        }
    };

    const toggleSelectAll = (filteredYarns) => {
        if (selectedIds.length === filteredYarns.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredYarns.map(y => y.id));
        }
    };

    const toggleSelect = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const filteredYarns = yarns.filter(y => {
        const skuMatch = (y.yarn_sku || "").toLowerCase().includes(filters.sku.toLowerCase());
        const nameMatch = (y.yarn_name || "").toLowerCase().includes(filters.name.toLowerCase());
        const colorMatch = (y.color || "").toLowerCase().includes(filters.color.toLowerCase());
        const compMatch = (y.composition || "").toLowerCase().includes(filters.composition.toLowerCase());

        const stockStatusMatch = filters.stockStatus === "" ||
            (filters.stockStatus === "gt0" && y.current_stock > 0) ||
            (filters.stockStatus === "le0" && y.current_stock <= 0);

        return skuMatch && nameMatch && colorMatch && compMatch && stockStatusMatch;
    });

    return (
        <div className="container-fluid py-3 min-vh-100 bg-light">
            <ToastContainer position="bottom-right" theme="colored" />

            {/* Header Area */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <SectionHeader title="Yarn Stock Management" icon="bi-box-seam" />

                <div className="d-flex gap-2">
                    {selectedIds.length > 0 && (
                        <button className="btn btn-outline-danger btn-sm rounded-pill fw-bold" onClick={handleBulkDelete}>
                            <i className="bi bi-trash me-1"></i>Delete ({selectedIds.length})
                        </button>
                    )}
                    <button className="btn btn-primary btn-sm rounded-pill px-3 shadow-sm fw-bold" onClick={() => {
                        setFormData({ id: null, yarn_sku: "", counts: "", yarn_name: "", color: "", composition: "", minimum_stock: "" });
                        setShowForm(true);
                    }}>
                        <i className="bi bi-plus-lg me-1"></i>Add New Yarn
                    </button>
                    <button className="btn btn-secondary btn-sm rounded-pill px-3 shadow-sm" onClick={() => navigate(-1)}>
                        <i className="bi bi-arrow-left me-1"></i>Back
                    </button>
                </div>
            </div>

            {/* Form Area - Compact Card */}
            {showForm && (
                <div className="card shadow-sm border-0 rounded-4 mb-4 animate__animated animate__fadeIn">
                    <div className="card-body p-4">
                        <h6 className="fw-bold mb-3 text-primary">{formData.id ? "Edit Yarn" : "Create New Yarn"}</h6>
                        <form onSubmit={handleSubmit}>
                            <div className="row g-3">
                                <div className="col-md-3">
                                    <label className="form-label small fw-bold text-muted">Yarn SKU</label>
                                    <div className="input-group input-group-sm">
                                        <span className="input-group-text bg-light border-end-0"><i className="bi bi-upc-scan text-muted"></i></span>
                                        <input type="text" name="yarn_sku" className="form-control form-control-sm bg-light border-start-0 ps-0" value={formData.yarn_sku} readOnly placeholder="Auto-generated" />
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label small fw-bold text-muted">Yarn Name <span className="text-danger">*</span></label>
                                    <input type="text" name="yarn_name" className="form-control form-control-sm" value={formData.yarn_name} onChange={handleChange} required placeholder="Name" />
                                </div>
                                <div className="col-md-2">
                                    <label className="form-label small fw-bold text-muted">Counts</label>
                                    <input type="text" name="counts" className="form-control form-control-sm" value={formData.counts} onChange={handleChange} placeholder="Counts" />
                                </div>
                                <div className="col-md-2">
                                    <label className="form-label small fw-bold text-muted">Color</label>
                                    <input type="text" name="color" className="form-control form-control-sm" value={formData.color} onChange={handleChange} placeholder="Color" />
                                </div>
                                <div className="col-md-2">
                                    <label className="form-label small fw-bold text-muted">Min Stock</label>
                                    <input type="number" name="minimum_stock" className="form-control form-control-sm" value={formData.minimum_stock} onChange={handleChange} placeholder="0.00" step="0.01" />
                                </div>
                                <div className="col-md-12">
                                    <label className="form-label small fw-bold text-muted">Composition</label>
                                    <input type="text" name="composition" className="form-control form-control-sm" value={formData.composition} onChange={handleChange} placeholder="Composition Details" />
                                </div>

                                <div className="col-12 d-flex justify-content-end gap-2 mt-2">
                                    <button type="button" className="btn btn-outline-secondary btn-sm rounded-pill px-3" onClick={() => setShowForm(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-success btn-sm rounded-pill px-4 fw-bold">{formData.id ? "Update" : "Save"}</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* List Table Card */}
            <div className={`card shadow-sm border-0 rounded-4 overflow-hidden ${showForm ? 'opacity-75' : ''}`}>
                <div className="card-header bg-white border-bottom-0 py-3">
                    <div className="row g-2 align-items-center">
                        <div className="col-md-10">
                            <div className="row g-2">
                                <div className="col-md-3">
                                    <div className="input-group input-group-sm">
                                        <span className="input-group-text bg-light border-end-0"><i className="bi bi-search text-muted"></i></span>
                                        <input type="text" className="form-control form-control-sm border-start-0 ps-0" placeholder="Search SKU..." value={filters.sku} onChange={(e) => setFilters({ ...filters, sku: e.target.value })} />
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <input type="text" className="form-control form-control-sm" placeholder="Filter by Name" value={filters.name} onChange={(e) => setFilters({ ...filters, name: e.target.value })} />
                                </div>
                                <div className="col-md-2">
                                    <input type="text" className="form-control form-control-sm" placeholder="Color" value={filters.color} onChange={(e) => setFilters({ ...filters, color: e.target.value })} />
                                </div>
                                <div className="col-md-2">
                                    <input type="text" className="form-control form-control-sm" placeholder="Composition" value={filters.composition} onChange={(e) => setFilters({ ...filters, composition: e.target.value })} />
                                </div>
                                <div className="col-md-2">
                                    <select className="form-select form-select-sm" value={filters.stockStatus} onChange={(e) => setFilters({ ...filters, stockStatus: e.target.value })}>
                                        <option value="">All Stock</option>
                                        <option value="gt0">In Stock (&gt;0)</option>
                                        <option value="le0">Out of Stock (&le;0)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-2 text-end">
                            <button className="btn btn-sm btn-link text-decoration-none text-muted" onClick={() => setFilters({ sku: "", name: "", color: "", composition: "", stockStatus: "" })}>Clear Filters</button>
                        </div>
                    </div>
                </div>

                <div className="card-body p-0">
                    <div className="table-responsive" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
                        <table className="table table-hover table-bordered align-middle table-sm mb-0">
                            <thead className="table-dark position-sticky top-0 shadow-sm" style={{ zIndex: 10 }}>
                                <tr>
                                    <th className="py-2 text-center" style={{ width: '40px' }}>
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            checked={filteredYarns.length > 0 && selectedIds.length === filteredYarns.length}
                                            onChange={() => toggleSelectAll(filteredYarns)}
                                        />
                                    </th>
                                    <th className="py-2">SKU</th>
                                    <th className="py-2">Name</th>
                                    <th className="py-2">Composition</th>
                                    <th className="py-2 text-center">Color</th>
                                    <th className="py-2 text-center">Stock (Kgs)</th>
                                    <th className="py-2 text-center">Status</th>
                                    <th className="py-2 text-end pe-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="8" className="text-center py-5"><div className="spinner-border spinner-border-sm text-primary"></div></td></tr>
                                ) : filteredYarns.length === 0 ? (
                                    <tr><td colSpan="8" className="text-center py-5 text-muted small">No yarn records found matching your filters.</td></tr>
                                ) : filteredYarns.map((y) => (
                                    <tr key={y.id} className={selectedIds.includes(y.id) ? "table-active" : ""}>
                                        <td className="text-center">
                                            <input
                                                type="checkbox"
                                                className="form-check-input"
                                                checked={selectedIds.includes(y.id)}
                                                onChange={() => toggleSelect(y.id)}
                                            />
                                        </td>
                                        <td className="fw-bold text-primary small font-monospace">{y.yarn_sku}</td>
                                        <td className="fw-semibold text-dark">{y.yarn_name}<small className="text-muted d-block">{y.counts}</small></td>
                                        <td className="small text-muted">{y.composition}</td>
                                        <td className="text-center small">{y.color}</td>
                                        <td className="text-center fw-bold text-dark">{Number(y.current_stock || 0).toFixed(2)}</td>
                                        <td className="text-center">
                                            {(y.current_stock || 0) > (y.minimum_stock || 0) ?
                                                <span className="badge bg-success-subtle text-success rounded-pill border border-success-subtle">In Stock</span> :
                                                <span className="badge bg-danger-subtle text-danger rounded-pill border border-danger-subtle">Low Stock</span>
                                            }
                                        </td>
                                        <td className="text-end pe-3">
                                            <button className="btn btn-outline-primary btn-sm border-0 me-1" title="Edit" onClick={() => handleEdit(y)}><i className="bi bi-pencil"></i></button>
                                            <button className="btn btn-outline-danger btn-sm border-0" title="Delete" onClick={() => handleDelete(y.id)}><i className="bi bi-trash"></i></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="card-footer bg-white py-2 small text-muted">
                        Showing {filteredYarns.length} records
                    </div>
                </div>
            </div>
        </div>
    );
};

export default YarnStock;
