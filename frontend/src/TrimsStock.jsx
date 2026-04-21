import { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API = process.env.REACT_APP_API_URL;



const TrimsStock = () => {
    const [trims, setTrims] = useState([]);
    const [sizeCharts, setSizeCharts] = useState([]);
    const [uoms, setUoms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [filters, setFilters] = useState({
        sku: "",
        name: "",
        color: "",
        type: "", // "" (All), "sizable", "non-sizable"
        stockStatus: "" // "" (All), "gt0" (>0), "le0" (<=0)
    });
    const [selectedIds, setSelectedIds] = useState([]);
    const [formData, setFormData] = useState({
        id: null,
        trims_name: "",
        trims_sku: "",
        color: "",
        uom: "",
        is_sizable: 0,
        size_chart_id: "",
        minimum_stock: ""
    });

    const fetchData = async () => {
        setLoading(true);
        const yearId = localStorage.getItem("year_id");
        try {
            const [trimsRes, chartsRes, uomsRes] = await Promise.all([
                axios.get(`${API}/reports/stock/trims`, { headers: { 'x-year-id': yearId } }),
                axios.get(`${API}/size-charts`),
                axios.get(`${API}/uom`)
            ]);
            setTrims(trimsRes.data);
            setSizeCharts(chartsRes.data);
            setUoms(uomsRes.data);
        } catch (err) {
            console.error("Error fetching trims data:", err);
            toast.error("Failed to load trims data");
        } finally {
            setLoading(false);
        }
    };

    const fetchUoms = async () => {
        try {
            const res = await axios.get(`${API}/uom`);
            setUoms(res.data);
            toast.success("UOM list refreshed");
        } catch (err) {
            console.error("Error fetching UOMs:", err);
            toast.error("Failed to refresh UOMs");
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? (checked ? 1 : 0) : value;

        setFormData(prev => {
            const updated = { ...prev, [name]: newValue };

            // Auto-generate SKU base
            if (name === "trims_name" || name === "color") {
                const namePart = (updated.trims_name || "").trim().toLowerCase().replace(/\s+/g, '-');
                const colorPart = (updated.color || "").trim().toLowerCase().replace(/\s+/g, '-');
                updated.trims_sku = colorPart ? `${namePart}-${colorPart}` : namePart;
            }

            return updated;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const dataToSave = {
                ...formData,
                trims_name: (formData.trims_name || "").trim(),
                trims_sku: (formData.trims_sku || "").trim(),
                size_chart_id: formData.is_sizable ? formData.size_chart_id : null
            };

            if (formData.id) {
                await axios.put(`${API}/trims/${formData.id}`, dataToSave);
                toast.success("Trims updated successfully");
            } else {
                await axios.post(`${API}/trims`, dataToSave);
                toast.success("Trims created successfully");
            }
            setShowForm(false);
            setFormData({ id: null, trims_name: "", trims_sku: "", color: "", uom: "", is_sizable: 0, size_chart_id: "", minimum_stock: "" });
            fetchData();
        } catch (err) {
            console.error("Error saving trims:", err);
            const errorMessage = err.response?.data?.error || "Failed to save trims";
            toast.error(errorMessage);
        }
    };

    const handleEdit = (trim) => {
        setFormData({
            ...trim,
            size_chart_id: trim.size_chart_id || ""
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this trim record?")) {
            try {
                await axios.delete(`${API}/trims/${id}`);
                toast.success("Trim deleted successfully");
                fetchData();
            } catch (err) {
                console.error("Error deleting trim:", err);
                toast.error("Failed to delete trim");
            }
        }
    };



    const toggleSelectAll = (filteredRows) => {
        // For trims, select unique base master IDs
        const allFilteredBaseIds = [...new Set(filteredRows.map(r => r.id))];
        if (selectedIds.length >= allFilteredBaseIds.length && allFilteredBaseIds.every(id => selectedIds.includes(id))) {
            setSelectedIds([]);
        } else {
            setSelectedIds(allFilteredBaseIds);
        }
    };

    const toggleSelect = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const filteredRows = trims.flatMap((t) => {
        if (t.is_sizable && t.size_values) {
            const sizes = t.size_values.split(",").map(s => s.trim());
            return sizes.map(size => ({
                ...t,
                display_sku: `${t.trims_sku}-${size}`,
                display_size: size,
                unique_row_id: `${t.id}-${size}`
            }));
        }
        return [{
            ...t,
            display_sku: t.trims_sku,
            display_size: null,
            unique_row_id: t.id
        }];
    }).filter(row => {
        const skuMatch = (row.display_sku || "").toLowerCase().includes(filters.sku.toLowerCase());
        const nameMatch = (row.trims_name || "").toLowerCase().includes(filters.name.toLowerCase());
        const colorMatch = (row.color || "").toLowerCase().includes(filters.color.toLowerCase());

        const typeMatch = filters.type === "" ||
            (filters.type === "sizable" && row.is_sizable) ||
            (filters.type === "non-sizable" && !row.is_sizable);

        const stockStatusMatch = filters.stockStatus === "" ||
            (filters.stockStatus === "gt0" && row.current_stock > 0) ||
            (filters.stockStatus === "le0" && row.current_stock <= 0);

        return skuMatch && nameMatch && colorMatch && typeMatch && stockStatusMatch;
    });

    return (
        <div className="container-fluid py-3 min-vh-100 bg-light">
            <ToastContainer position="bottom-right" theme="colored" />

            {/* Summary Tiles */}
            <div className="row g-3 mb-4 no-print px-2">
                <div className="col-md-4">
                    <div className="card shadow-sm border-0 bg-white rounded-4">
                        <div className="card-body p-4 d-flex align-items-center text-dark">
                            <div className="bg-info bg-opacity-10 text-info rounded-circle p-3 me-3">
                                <i className="bi bi-calendar-check fs-3"></i>
                            </div>
                            <div>
                                <p className="mb-0 text-muted small text-uppercase fw-bold">Year Opening Stock</p>
                                <h3 className="mb-0 fw-bold">{trims.reduce((sum, item) => sum + Number(item.year_opening_stock || 0), 0).toFixed(2)}</h3>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card shadow-sm border-0 bg-white rounded-4">
                        <div className="card-body p-4 d-flex align-items-center text-dark">
                            <div className="bg-primary bg-opacity-10 text-primary rounded-circle p-3 me-3">
                                <i className="bi bi-box-seam fs-3"></i>
                            </div>
                            <div>
                                <p className="mb-0 text-muted small text-uppercase fw-bold">Current Trims Stock</p>
                                <h3 className="mb-0 fw-bold">{trims.reduce((sum, item) => sum + Number(item.current_stock || 0), 0).toFixed(2)}</h3>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card shadow-sm border-0 bg-white rounded-4">
                        <div className="card-body p-4 d-flex align-items-center text-dark">
                            <div className="bg-danger bg-opacity-10 text-danger rounded-circle p-3 me-3">
                                <i className="bi bi-exclamation-triangle fs-3"></i>
                            </div>
                            <div>
                                <p className="mb-0 text-muted small text-uppercase fw-bold">Low Stock Alerts</p>
                                <h3 className="mb-0 fw-bold">{trims.filter(t => Number(t.current_stock) <= Number(t.minimum_stock)).length} Items</h3>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form Area - Compact Card */}
            {showForm && (
                <div className="card shadow-sm border-0 rounded-4 mb-4 animate__animated animate__fadeIn">
                    <div className="card-body p-4">
                        <h6 className="fw-bold mb-3 text-primary">{formData.id ? "Edit Trim" : "Create New Trim"}</h6>
                        <form onSubmit={handleSubmit}>
                            <div className="row g-3">
                                <div className="col-md-4">
                                    <label className="form-label small fw-bold text-muted">Trims Name <span className="text-danger">*</span></label>
                                    <input type="text" name="trims_name" className="form-control form-control-sm" value={formData.trims_name} onChange={handleChange} required placeholder="e.g. Button" />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label small fw-bold text-muted">SKU Base</label>
                                    <div className="input-group input-group-sm">
                                        <span className="input-group-text bg-light border-end-0"><i className="bi bi-upc-scan text-muted"></i></span>
                                        <input type="text" name="trims_sku" className="form-control form-control-sm bg-light border-start-0 ps-0" value={formData.trims_sku} onChange={handleChange} readOnly placeholder="Auto-generated" />
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label small fw-bold text-muted">UOM <span className="text-danger">*</span></label>
                                    <div className="input-group input-group-sm">
                                        <select name="uom" className="form-select form-select-sm" value={formData.uom} onChange={handleChange} required>
                                            <option value="">Select UOM</option>
                                            {uoms.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                                        </select>
                                        <button type="button" className="btn btn-outline-secondary" onClick={fetchUoms} title="Refresh UOM List">
                                            <i className="bi bi-arrow-clockwise"></i>
                                        </button>
                                    </div>
                                </div>
                                <div className="col-md-2">
                                    <label className="form-label small fw-bold text-muted">Size Type</label>
                                    <select name="is_sizable" className="form-select form-select-sm" value={formData.is_sizable} onChange={(e) => setFormData({ ...formData, is_sizable: parseInt(e.target.value) })}>
                                        <option value={0}>Non-Sizable</option>
                                        <option value={1}>Sizable</option>
                                    </select>
                                </div>
                                {formData.is_sizable === 1 && (
                                    <div className="col-md-3 animate__animated animate__fadeIn">
                                        <label className="form-label small fw-bold text-muted">Size Chart <span className="text-danger">*</span></label>
                                        <select name="size_chart_id" className="form-select form-select-sm" value={formData.size_chart_id} onChange={handleChange} required>
                                            <option value="">Select Size Chart</option>
                                            {sizeCharts.map(sc => (
                                                <option key={sc.id} value={sc.id}>{sc.chart_name}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                <div className="col-md-2">
                                    <label className="form-label small fw-bold text-muted">Color</label>
                                    <input type="text" name="color" className="form-control form-control-sm" value={formData.color} onChange={handleChange} placeholder="e.g. Red" />
                                </div>
                                <div className="col-md-2">
                                    <label className="form-label small fw-bold text-muted">Min Stock</label>
                                    <input type="number" name="minimum_stock" className="form-control form-control-sm" value={formData.minimum_stock} onChange={handleChange} placeholder="0.00" />
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
                                    <select className="form-select form-select-sm" value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
                                        <option value="">All Types</option>
                                        <option value="sizable">Sizable</option>
                                        <option value="non-sizable">Non-Sizable</option>
                                    </select>
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
                            <button className="btn btn-sm btn-link text-decoration-none text-muted" onClick={() => setFilters({ sku: "", name: "", color: "", type: "", stockStatus: "" })}>Clear Filters</button>
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
                                            checked={filteredRows.length > 0 && [...new Set(filteredRows.map(r => r.id))].every(id => selectedIds.includes(id))}
                                            onChange={() => toggleSelectAll(filteredRows)}
                                        />
                                    </th>
                                    <th className="py-2">SKU</th>
                                    <th className="py-2">Trims Name</th>
                                    <th className="py-2 text-center">Opening Stock</th>
                                    <th className="py-2 text-center text-warning">Current Stock</th>
                                    <th className="py-2 text-center">Status</th>
                                    <th className="py-2 text-end pe-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="7" className="text-center py-5"><div className="spinner-border spinner-border-sm text-primary"></div></td></tr>
                                ) : filteredRows.length === 0 ? (
                                    <tr><td colSpan="7" className="text-center py-5 text-muted small">No trim records found matching your filters.</td></tr>
                                ) : filteredRows.map((row) => (
                                    <tr key={row.unique_row_id} className={selectedIds.includes(row.id) ? "table-active" : ""}>
                                        <td className="text-center">
                                            <input
                                                type="checkbox"
                                                className="form-check-input"
                                                checked={selectedIds.includes(row.id)}
                                                onChange={() => toggleSelect(row.id)}
                                            />
                                        </td>
                                        <td className="fw-bold text-primary small font-monospace">{row.display_sku}</td>
                                        <td className="fw-semibold text-dark">
                                            {row.trims_name} {row.display_size && <span className="badge bg-light text-dark border ms-1">{row.display_size}</span>}
                                            <div className="small text-muted">{row.color}</div>
                                        </td>
                                        <td className="text-center">
                                            <span className="fw-bold text-muted">{Number(row.year_opening_stock || 0).toFixed(2)}</span>
                                        </td>
                                        <td className="text-center fw-bold text-dark">
                                            <span className={`badge rounded-pill ${(row.current_stock || 0) > (row.minimum_stock || 0) ? 'bg-success' : 'bg-danger'}`} style={{ fontSize: '0.9rem', minWidth: '60px' }}>
                                                {Number(row.current_stock || 0).toFixed(2)}
                                            </span>
                                            <div className="x-small text-muted fw-normal">{row.uom}</div>
                                        </td>
                                        <td className="text-center">
                                            {(row.current_stock || 0) > (row.minimum_stock || 0) ?
                                                <span className="badge bg-success-subtle text-success rounded-pill border border-success-subtle">In Stock</span> :
                                                <span className="badge bg-danger-subtle text-danger rounded-pill border border-danger-subtle">Low Stock</span>
                                            }
                                        </td>
                                        <td className="text-end pe-3">
                                            <button className="btn btn-outline-primary btn-sm border-0 me-1" title="Edit" onClick={() => handleEdit(row)}><i className="bi bi-pencil"></i></button>
                                            <button className="btn btn-outline-danger btn-sm border-0" title="Delete" onClick={() => handleDelete(row.id)}><i className="bi bi-trash"></i></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="card-footer bg-white py-2 small text-muted">
                        Showing {filteredRows.length} records
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrimsStock;
