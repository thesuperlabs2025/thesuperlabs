import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API = process.env.REACT_APP_API_URL;

function OrderPlanningmy() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [limit] = useState(20);
    const [pagination, setPagination] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showPrintModal, setShowPrintModal] = useState(false);
    const [reportType, setReportType] = useState("order-status");
    const navigate = useNavigate();

    const [filters, setFilters] = useState({
        order_no: "",
        buyer_name: "",
        season_name: "",
        merchandiser_name: "",
        status: "",
    });

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page,
                limit,
                ...filters
            };
            const res = await axios.get(`${API}/order_planning`, { params });
            setOrders(res.data.data || []);
            setPagination(res.data.pagination);
        } catch (err) {
            console.error("Fetch Orders Error:", err);
            toast.error("Failed to load order plans");
        } finally {
            setLoading(false);
        }
    }, [page, limit, filters]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
        setPage(1);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this order plan?")) return;
        try {
            await axios.delete(`${API}/order_planning/${id}`);
            toast.success("Order plan deleted");
            fetchOrders();
        } catch (err) {
            console.error(err);
            toast.error("Delete failed");
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Approved': return '#22c55e';
            case 'Canceled': return '#ef4444';
            default: return '#f59e0b';
        }
    };

    const handleOpenReport = () => {
        if (!selectedOrder) return;
        window.open(`/print/${reportType}/${selectedOrder.id}`, '_blank');
        setShowPrintModal(false);
    };

    return (
        <div className="order-planning-list-page py-4 px-md-5">
            <style>{`
        .order-planning-list-page {
          background: #f8fafc;
          min-height: 100vh;
          font-family: 'Inter', sans-serif;
        }
        .filter-card {
          background: white;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        .table-card {
          background: white;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          overflow: hidden;
        }
        .custom-table thead {
          background: #f8fafc;
          border-bottom: 2px solid #edf2f7;
        }
        .custom-table th {
          font-weight: 700;
          text-transform: uppercase;
          font-size: 0.7rem;
          letter-spacing: 0.025em;
          color: #64748b;
          padding: 12px 16px;
        }
        .custom-table td {
          padding: 10px 16px;
          vertical-align: middle;
          color: #1e293b;
          font-weight: 500;
          font-size: 0.85rem;
        }
        .status-badge {
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 0.7rem;
          font-weight: 700;
        }
        .action-btn {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          transition: all 0.2s;
          border: none;
          background: transparent;
        }
        .action-btn:hover {
          background: #f1f5f9;
        }
        .btn-new {
          background: #0d6efd;
          color: white;
          border-radius: 8px;
          padding: 8px 16px;
          font-weight: 600;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s;
        }
        .btn-new:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(13, 110, 253, 0.2);
          color: white;
        }
        .form-control-compact {
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          padding: 6px 12px;
          font-size: 0.85rem;
        }
        .form-control-compact:focus {
          border-color: #0d6efd;
          box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.1);
        }
        @media (max-width: 768px) {
          .custom-table thead { display: none; }
          .custom-table tr { 
            display: block; 
            margin-bottom: 12px; 
            border: 1px solid #e2e8f0; 
            border-radius: 10px; 
            padding: 8px;
            background: white;
          }
          .custom-table td { 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            text-align: right; 
            border: none;
            padding: 6px 8px;
            font-size: 0.8rem;
          }
          .custom-table td::before {
            content: attr(data-label);
            font-weight: 600;
            text-transform: uppercase;
            font-size: 0.65rem;
            color: #94a3b8;
            text-align: left;
          }
          .order-planning-list-page { padding: 12px !important; }
          .btn-new { width: 100%; justify-content: center; margin-top: 12px; }
          .d-flex.justify-content-between.align-items-center.mb-5 { flex-direction: column; align-items: flex-start !important; margin-bottom: 2rem !important; }
        }
        .transition-all { transition: all 0.2s ease; }
        .cursor-pointer { cursor: pointer; }
      `}</style>

            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="fw-bold text-dark mb-1">Order Planning List</h3>
                    <p className="text-muted mb-0 small fw-medium">Manage and monitor your production plans</p>
                </div>
                <button className="btn btn-new shadow-sm" onClick={() => navigate("/order-planning")}>
                    <i className="bi bi-plus-lg"></i> Create New Plan
                </button>
            </div>

            {/* Filters */}
            <div className="filter-card p-3 mb-3">
                <div className="row g-2">
                    <div className="col-md-3">
                        <label className="form-label x-small fw-bold text-secondary">Order No</label>
                        <input type="text" name="order_no" className="form-control form-control-compact" placeholder="ORD-XXXX" value={filters.order_no} onChange={handleFilterChange} />
                    </div>
                    <div className="col-md-2">
                        <label className="form-label x-small fw-bold text-secondary">Buyer</label>
                        <input type="text" name="buyer_name" className="form-control form-control-compact" placeholder="Search buyer..." value={filters.buyer_name} onChange={handleFilterChange} />
                    </div>
                    <div className="col-md-2">
                        <label className="form-label x-small fw-bold text-secondary">Season</label>
                        <input type="text" name="season_name" className="form-control form-control-compact" placeholder="Season..." value={filters.season_name} onChange={handleFilterChange} />
                    </div>
                    <div className="col-md-2">
                        <label className="form-label x-small fw-bold text-secondary">Status</label>
                        <select name="status" className="form-select form-select-sm form-control-compact" value={filters.status} onChange={handleFilterChange}>
                            <option value="">All Status</option>
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Canceled">Canceled</option>
                        </select>
                    </div>
                    <div className="col-md-3 d-flex align-items-end justify-content-end">
                        <button className="btn btn-light fw-bold rounded-pill px-3 py-1 x-small text-secondary me-2" onClick={() => setFilters({ order_no: "", buyer_name: "", season_name: "", merchandiser_name: "", status: "" })}>
                            Clear Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="table-card">
                <div className="table-responsive">
                    <table className="table custom-table mb-0">
                        <thead>
                            <tr>
                                <th>Order No</th>
                                <th>Order Date</th>
                                <th>Buyer</th>
                                <th>Season</th>
                                <th>Category</th>
                                <th>Priority</th>
                                <th>Status</th>
                                <th className="text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="8" className="text-center py-5"><div className="spinner-border text-primary"></div></td></tr>
                            ) : orders.length === 0 ? (
                                <tr><td colSpan="8" className="text-center py-5 text-muted fw-bold">No order plans found matching filters.</td></tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order.id}>
                                        <td data-label="Order No">
                                            <span className="fw-bold text-primary">#{order.order_no}</span>
                                        </td>
                                        <td data-label="Date" className="x-small text-muted">
                                            {new Date(order.order_date).toLocaleDateString()}
                                        </td>
                                        <td data-label="Buyer" className="small">{order.buyer_name || order.own_brand_name}</td>
                                        <td data-label="Season"><span className="badge bg-light text-dark border x-small">{order.season_name}</span></td>
                                        <td data-label="Category" className="small">{order.order_category}</td>
                                        <td data-label="Priority">
                                            <span className={`x-small fw-bold ${order.priority === 'High' ? 'text-danger' : order.priority === 'Medium' ? 'text-warning' : 'text-success'}`}>
                                                {order.priority}
                                            </span>
                                        </td>
                                        <td data-label="Status">
                                            <span className="status-badge" style={{ backgroundColor: `${getStatusColor(order.status)}15`, color: getStatusColor(order.status) }}>
                                                ● {order.status}
                                            </span>
                                        </td>
                                        <td data-label="Actions" className="text-end">
                                            <div className="d-flex justify-content-end gap-1">
                                                <button
                                                    className="action-btn text-success"
                                                    title="Print Reports"
                                                    onClick={() => {
                                                        setSelectedOrder(order);
                                                        setShowPrintModal(true);
                                                    }}
                                                >
                                                    <i className="bi bi-printer fs-6"></i>
                                                </button>
                                                <button className="action-btn text-primary" title="Edit Plan" onClick={() => navigate(`/order-planning/${order.id}`)}>
                                                    <i className="bi bi-pencil-square fs-6"></i>
                                                </button>
                                                <button className="action-btn text-danger" title="Delete Plan" onClick={() => handleDelete(order.id)}>
                                                    <i className="bi bi-trash fs-6"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-3 bg-light border-top d-flex justify-content-between align-items-center">
                    <span className="text-muted x-small fw-bold">
                        Showing {orders.length} of {pagination?.total || 0} orders
                    </span>
                    <div className="d-flex gap-2">
                        <button className="btn btn-white btn-sm border fw-bold rounded-pill px-3" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                            Previous
                        </button>
                        <button className="btn btn-white btn-sm border fw-bold rounded-pill px-3" disabled={page >= (pagination?.pages || 1)} onClick={() => setPage(p => p + 1)}>
                            Next
                        </button>
                    </div>
                </div>
            </div>
            <ToastContainer />

            {/* Print Modal */}
            {showPrintModal && (
                <>
                    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content border-0 shadow-lg rounded-4">
                                <div className="modal-header border-0 pb-0">
                                    <h5 className="modal-title fw-bold">Select Report to Print</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowPrintModal(false)}></button>
                                </div>
                                <div className="modal-body py-4">
                                    {selectedOrder && (
                                        <div className="mb-3 p-3 bg-light rounded-3">
                                            <p className="mb-0 small text-muted">Order Selected:</p>
                                            <p className="mb-0 fw-bold text-primary">#{selectedOrder.order_no} - {selectedOrder.order_name || selectedOrder.buyer_name}</p>
                                        </div>
                                    )}
                                    <div className="report-options">
                                        {[
                                            { id: 'order-status', label: 'Order Status Report', icon: 'bi-file-earmark-text' },
                                            { id: 'order-detailed', label: 'Order Detailed Report', icon: 'bi-file-earmark-medical' },
                                            { id: 'order-cmt', label: 'CMT Report', icon: 'bi-scissors' },
                                            { id: 'order-consumption', label: 'Overall Consumption Report', icon: 'bi-pie-chart' },
                                            { id: 'order-requirement', label: 'Requirement Report', icon: 'bi-card-checklist' },
                                        ].map((opt) => (
                                            <div key={opt.id} className={`p-3 mb-2 rounded-3 border d-flex align-items-center cursor-pointer transition-all ${reportType === opt.id ? 'bg-primary bg-opacity-10 border-primary' : 'bg-white border-light'}`}
                                                onClick={() => setReportType(opt.id)}
                                                style={{ cursor: 'pointer' }}>
                                                <input
                                                    type="radio"
                                                    className="form-check-input me-3"
                                                    checked={reportType === opt.id}
                                                    onChange={() => setReportType(opt.id)}
                                                />
                                                <div className={`icon-box me-3 text-${reportType === opt.id ? 'primary' : 'secondary'}`}>
                                                    <i className={`bi ${opt.icon} fs-5`}></i>
                                                </div>
                                                <span className={`fw-semibold ${reportType === opt.id ? 'text-primary' : 'text-dark'}`}>{opt.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="modal-footer border-0 pt-0">
                                    <button type="button" className="btn btn-light px-4 rounded-pill fw-bold" onClick={() => setShowPrintModal(false)}>Cancel</button>
                                    <button type="button" className="btn btn-primary px-4 rounded-pill fw-bold" onClick={handleOpenReport}>
                                        <i className="bi bi-box-arrow-up-right me-2"></i> Open Report
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default OrderPlanningmy;
