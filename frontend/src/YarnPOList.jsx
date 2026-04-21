import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ToastContainer, toast } from 'react-toastify';

const API = process.env.REACT_APP_API_URL;

const YarnPOList = () => {
    const navigate = useNavigate();
    const [pos, setPos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

    const selectedYear = JSON.parse(localStorage.getItem("selectedYear") || "{}");
    const yearId = selectedYear.year_id;
    const fetchPOs = useCallback(async () => {
        try {
            const res = await axios.get(`${API}/yarn-po`, {
                headers: { 'x-year-id': yearId }
            });
            setPos(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching Yarn POs:", err);
            setLoading(false);
        }
    }, [yearId]);

    useEffect(() => {
        if (yearId) {
            fetchPOs();
        } else {
            setLoading(false);
            // toast.error("No Accounting Year selected");
        }
    }, [yearId, fetchPOs]);

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this Yarn PO?")) {
            try {
                await axios.delete(`${API}/yarn-po/${id}`);
                toast.success("Yarn PO Deleted");
                fetchPOs();
            } catch (err) {
                toast.error("Failed to delete PO");
            }
        }
    };

    const filteredPOs = pos.filter(po => {
        const matchesSearch = 
            (po.po_no || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (po.supplier_name || "").toLowerCase().includes(searchTerm.toLowerCase());
        
        const poDate = new Date(po.create_date).setHours(0,0,0,0);
        const fromDate = dateFrom ? new Date(dateFrom).setHours(0,0,0,0) : null;
        const toDate = dateTo ? new Date(dateTo).setHours(0,0,0,0) : null;

        const matchesFrom = !fromDate || poDate >= fromDate;
        const matchesTo = !toDate || poDate <= toDate;

        return matchesSearch && matchesFrom && matchesTo;
    });

    return (
        <div className="container-fluid mt-4">
            <ToastContainer />
            <div className="card shadow border-0 rounded-4">
                <div className="card-header bg-white py-3 border-bottom shadow-sm">
                    <div className="row g-3 align-items-center">
                        <div className="col-md-3">
                            <h4 className="fw-bold text-primary mb-0">
                                <i className="bi bi-list-check me-2"></i>Yarn PO List
                            </h4>
                            <div className="small text-muted mt-1">AY: {selectedYear.year_name || "N/A"}</div>
                        </div>
                        <div className="col-md-9 d-flex flex-wrap gap-2 justify-content-md-end">
                            <div className="input-group input-group-sm" style={{ maxWidth: '200px' }}>
                                <span className="input-group-text bg-white border-end-0"><i className="bi bi-search py-1"></i></span>
                                <input 
                                    type="text" 
                                    className="form-control border-start-0" 
                                    placeholder="Search PO / Supplier..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="d-flex align-items-center gap-2">
                                <label className="small fw-bold text-muted mb-0">From:</label>
                                <input 
                                    type="date" 
                                    className="form-control form-control-sm" 
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                />
                            </div>
                            <div className="d-flex align-items-center gap-2">
                                <label className="small fw-bold text-muted mb-0">To:</label>
                                <input 
                                    type="date" 
                                    className="form-control form-control-sm" 
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                />
                            </div>
                            <button className="btn btn-primary btn-sm rounded-pill px-3 shadow-sm" onClick={() => navigate('/yarn-po-add')}>
                                <i className="bi bi-plus-lg me-1"></i>Create New
                            </button>
                        </div>
                    </div>
                </div>
                <div className="card-body p-0">
                    <div className="table-responsive" style={{ maxHeight: '70vh' }}>
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-light position-sticky top-0 z-1 shadow-sm">
                                <tr>
                                    <th className="ps-4 py-3">PO No</th>
                                    <th>Supplier</th>
                                    <th>Date</th>
                                    <th>Staff</th>
                                    <th>Order / Lot</th>
                                    <th>Total Qty</th>
                                    <th>Fulfillment</th>
                                    <th className="text-center">GRN</th>
                                    <th className="text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="9" className="text-center py-5"><div className="spinner-border text-primary"></div></td></tr>
                                ) : filteredPOs.length === 0 ? (
                                    <tr><td colSpan="9" className="text-center py-5 text-muted">No Yarn POs found for the selected filters.</td></tr>
                                ) : (
                                    filteredPOs.map(po => (
                                        <tr key={po.id}>
                                            <td className="ps-4 fw-bold text-primary">{po.po_no}</td>
                                            <td>{po.supplier_name}</td>
                                            <td>{new Date(po.create_date).toLocaleDateString('en-GB')}</td>
                                            <td>{po.staff_name}</td>
                                            <td>
                                                {po.is_order_specific ? <span className="badge bg-info-subtle text-info border border-info-subtle">Ord: {po.order_no}</span> :
                                                    po.is_lot_specific ? <span className="badge bg-success-subtle text-success border border-success-subtle">Lot: {po.lot_no}</span> :
                                                        <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle">General</span>}
                                            </td>
                                            <td className="fw-bold text-dark">{Number(po.total_qty || 0).toFixed(2)}</td>
                                            <td style={{ minWidth: '120px' }}>
                                                {(() => {
                                                    const total = Number(po.total_qty || 0);
                                                    const received = Number(po.received_qty || 0);
                                                    const percent = total > 0 ? Math.min((received / total) * 100, 100) : 0;
                                                    const color = percent >= 100 ? 'bg-success' : percent > 50 ? 'bg-primary' : 'bg-warning';
                                                    return (
                                                        <div style={{ fontSize: '0.7rem' }}>
                                                            <div className="d-flex justify-content-between mb-1">
                                                                <span>{received.toFixed(2)} / {total.toFixed(2)}</span>
                                                                <span className="fw-bold">{percent.toFixed(0)}%</span>
                                                            </div>
                                                            <div className="progress" style={{ height: '6px' }}>
                                                                <div
                                                                    className={`progress-bar ${color}`}
                                                                    role="progressbar"
                                                                    style={{ width: `${percent}%` }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    );
                                                })()}
                                            </td>
                                            <td className="text-center">
                                                <button
                                                    className="btn btn-sm btn-success rounded-pill px-3 py-1 shadow-sm fs-xsmall"
                                                    onClick={() => navigate('/yarn-grn-add', { state: { po_data: po } })}
                                                >
                                                    <i className="bi bi-plus-circle me-1"></i>GRN
                                                </button>
                                            </td>
                                            <td className="text-center">
                                                <div className="d-flex justify-content-center gap-1">
                                                    <button className="btn btn-sm btn-outline-secondary border-0 rounded-circle" onClick={() => window.open(`${API}/printyarnpo/po/${po.id}`, '_blank')} title="Print">
                                                        <i className="bi bi-printer"></i>
                                                    </button>
                                                    <button className="btn btn-sm btn-outline-primary border-0 rounded-circle" onClick={() => navigate(`/yarn-po-edit/${po.id}`)}>
                                                        <i className="bi bi-pencil"></i>
                                                    </button>
                                                    <button className="btn btn-sm btn-outline-danger border-0 rounded-circle" onClick={() => handleDelete(po.id)}>
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
            </div>
            <style>{`
                .fs-xsmall { font-size: 0.76rem; }
                .z-1 { z-index: 1 !important; }
            `}</style>
        </div>
    );
};

export default YarnPOList;
