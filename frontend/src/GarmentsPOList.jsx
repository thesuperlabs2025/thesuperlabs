
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ToastContainer, toast } from 'react-toastify';

const API = process.env.REACT_APP_API_URL;

const GarmentsPOList = () => {
    const navigate = useNavigate();
    const [pos, setPos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPOs();
    }, []);

    const fetchPOs = async () => {
        try {
            const res = await axios.get(`${API}/garments-po`);
            setPos(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching Garments POs:", err);
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this Garments PO?")) {
            try {
                await axios.delete(`${API}/garments-po/${id}`);
                toast.success("Garments PO Deleted");
                fetchPOs();
            } catch (err) {
                toast.error("Failed to delete PO");
            }
        }
    };

    return (
        <div className="container-fluid mt-4">
            <ToastContainer />
            <div className="card shadow border-0 rounded-4">
                <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                    <h4 className="fw-bold text-primary mb-0"><i className="bi bi-list-check me-2"></i>Garments PO List</h4>
                    <button className="btn btn-primary rounded-pill px-4" onClick={() => navigate('/garments-po-add')}>
                        <i className="bi bi-plus-lg me-2"></i>Create New PO
                    </button>
                </div>
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th className="ps-4">PO No</th>
                                    <th>Supplier</th>
                                    <th>Date</th>
                                    <th>Staff</th>
                                    <th>Order</th>
                                    <th>Total Qty</th>
                                    <th>Fulfillment</th>
                                    <th className="text-center">GRN</th>
                                    <th className="text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="7" className="text-center py-5">Loading...</td></tr>
                                ) : pos.length === 0 ? (
                                    <tr><td colSpan="7" className="text-center py-5 text-muted">No Garments POs found.</td></tr>
                                ) : (
                                    pos.map(po => (
                                        <tr key={po.id}>
                                            <td className="ps-4 fw-bold text-primary">{po.po_no}</td>
                                            <td>{po.supplier_name}</td>
                                            <td>{new Date(po.create_date).toLocaleDateString()}</td>
                                            <td>{po.staff_name}</td>
                                            <td><span className="badge bg-info text-dark">Ord: {po.order_no}</span></td>
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
                                                                <span>{received.toFixed(0)} / {total.toFixed(0)}</span>
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
                                                    className="btn btn-sm btn-success rounded-pill px-2 py-0 shadow-sm"
                                                    style={{ fontSize: '0.7rem' }}
                                                    onClick={() => navigate('/garments-grn-add', { state: { po_data: po } })}
                                                >
                                                    <i className="bi bi-plus-circle me-1"></i>Add GRN
                                                </button>
                                            </td>
                                            <td className="text-center">
                                                <button className="btn btn-sm btn-outline-secondary me-2 rounded-circle" onClick={() => window.open(`${API}/printgarmentspo/po/${po.id}`, '_blank')} title="Print">
                                                    <i className="bi bi-printer"></i>
                                                </button>
                                                <button className="btn btn-sm btn-outline-primary me-2 rounded-circle" onClick={() => navigate(`/garments-po-edit/${po.id}`)}>
                                                    <i className="bi bi-pencil"></i>
                                                </button>
                                                <button className="btn btn-sm btn-outline-danger rounded-circle" onClick={() => handleDelete(po.id)}>
                                                    <i className="bi bi-trash"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GarmentsPOList;
