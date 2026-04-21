import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API = process.env.REACT_APP_API_URL;

export default function TnaTrack() {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API}/tna`);
            setData(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const getStatusColor = (status, dueDate) => {
        if (status === 'Completed') return 'success';
        if (new Date(dueDate) < new Date() && status !== 'Completed') return 'danger';
        if (status === 'In Progress') return 'warning';
        return 'secondary';
    };

    const filteredData = data.filter(h =>
        h.order_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.order_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container-fluid py-4 bg-light min-vh-100">
            <style>{`
                @keyframes pulse-active {
                    0% { box-shadow: 0 0 0 0 rgba(255, 193, 7, 0.4); }
                    70% { box-shadow: 0 0 0 15px rgba(255, 193, 7, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(255, 193, 7, 0); }
                }
                .active-process-node {
                    animation: pulse-active 2s infinite;
                    border-color: #ffc107 !important;
                }
                .hover-scale { transition: transform 0.2s; }
                .hover-scale:hover { transform: scale(1.1); z-index: 10; }
            `}</style>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="fw-bold text-dark m-0">TNA Tracking Dashboard</h3>
                    <p className="text-muted small">Monitor real-time progress across all orders</p>
                </div>
                <div className="d-flex gap-2">
                    <input type="text" className="form-control form-control-sm border-0 shadow-sm" style={{ width: '250px', borderRadius: '10px' }}
                        placeholder="Search Order..." onChange={e => setSearchTerm(e.target.value)} />
                    <button className="btn btn-dark btn-sm rounded-pill px-4" onClick={() => navigate("/tna-add")}>+ New TNA</button>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
            ) : filteredData.length === 0 ? (
                <div className="card border-0 shadow-sm rounded-4 p-5 text-center text-muted">No TNA records found</div>
            ) : (
                <div className="row g-4">
                    {filteredData.map((h) => (
                        <div className="col-12" key={h.id}>
                            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                                <div className="card-header bg-white border-0 p-4">
                                    <div className="row align-items-center">
                                        <div className="col-md-3">
                                            <h5 className="fw-bold mb-0">#{h.order_no} - {h.order_name}</h5>
                                            <span className="text-muted small">{h.customer_name} | {h.style_name}</span>
                                        </div>
                                        <div className="col-md-2 text-center">
                                            <div className="small text-muted mb-1">Total Qty</div>
                                            <div className="fw-bold fs-5">{h.order_qty}</div>
                                        </div>
                                        <div className="col-md-2 text-center">
                                            <div className="small text-muted mb-1">Due Date</div>
                                            <div className="fw-bold text-primary">{new Date(h.overall_due_date).toLocaleDateString()}</div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="d-flex justify-content-between small text-muted mb-1">
                                                <span>Overall Progress</span>
                                                <span>{Math.round((h.processes.filter(p => p.status === 'Completed').length / h.processes.length) * 100)}%</span>
                                            </div>
                                            <div className="progress rounded-pill shadow-sm" style={{ height: '10px' }}>
                                                <div className="progress-bar bg-success" style={{ width: `${(h.processes.filter(p => p.status === 'Completed').length / h.processes.length) * 100}%` }}></div>
                                            </div>
                                        </div>
                                        <div className="col-md-2 text-end">
                                            <button className="btn btn-dark btn-sm rounded-pill px-3 fw-bold shadow-sm" onClick={() => navigate(`/tna-status-update/${h.id}`)}>
                                                <i className="bi bi-pencil-square me-1"></i> Update Status
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="card-body p-0 border-top bg-light/30">
                                    <div className="position-relative p-5">
                                        {/* Background Line (Grey) */}
                                        <div className="position-absolute start-0 end-0 top-50 translate-middle-y border-bottom border-2 border-light-subtle"
                                            style={{ zIndex: 0, margin: '0 80px', transform: 'translateY(-45px)' }}></div>

                                        {/* Progress Line (Green) */}
                                        {(() => {
                                            const completedCount = h.processes.filter(p => p.status === 'Completed').length;
                                            const totalSteps = h.processes.length - 1;
                                            const progressWidth = totalSteps > 0 ? (completedCount / totalSteps) * 100 : 0;
                                            return (
                                                <div className="position-absolute start-0 top-50 translate-middle-y border-bottom border-2 border-success transition-all shadow-sm"
                                                    style={{
                                                        zIndex: 0,
                                                        margin: '0 80px',
                                                        transform: 'translateY(-45px)',
                                                        width: completedCount === h.processes.length ? 'calc(100% - 160px)' : `calc(${progressWidth}% - ${progressWidth > 0 ? 0 : 0}px)`,
                                                        maxWidth: 'calc(100% - 160px)',
                                                        opacity: completedCount > 0 ? 1 : 0
                                                    }}></div>
                                            );
                                        })()}

                                        <div className="d-flex justify-content-between align-items-start position-relative" style={{ zIndex: 1 }}>
                                            {h.processes.map((p, idx) => {
                                                const statusColor = getStatusColor(p.status, p.due_date);
                                                const isCompleted = p.status === 'Completed';
                                                const currentIdx = h.processes.findIndex(proc => proc.status !== 'Completed' && proc.status !== 'Cancelled');
                                                const isCurrent = idx === currentIdx;

                                                return (
                                                    <div key={idx} className="text-center position-relative" style={{ width: '140px', cursor: 'pointer' }}
                                                        onClick={() => navigate(`/tna-status-update/${h.id}/${p.id}`)}>

                                                        {isCurrent && (
                                                            <div className="position-absolute start-50 translate-middle-x" style={{ top: '-35px' }}>
                                                                <span className="badge bg-warning text-dark shadow-sm border border-white px-2 py-1" style={{ fontSize: '9px', fontWeight: '800' }}>
                                                                    CURRENT STAGE <i className="bi bi-geo-alt-fill"></i>
                                                                </span>
                                                            </div>
                                                        )}

                                                        <div className={`rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center shadow-lg border-4 border-white transition-all hover-scale
                                                            ${isCompleted ? 'bg-success text-white' : isCurrent ? 'bg-warning text-dark active-process-node' : 'bg-white text-dark'}`}
                                                            style={{
                                                                width: '60px',
                                                                height: '60px',
                                                                fontSize: '1.2rem',
                                                                boxShadow: isCurrent
                                                                    ? `0 8px 20px -5px rgba(255,193,7,0.4), 0 0 0 2px #ffc107`
                                                                    : `0 8px 20px -5px rgba(0,0,0,0.1), 0 0 0 2px ${isCompleted ? '#198754' : '#dee2e6'}`
                                                            }}>
                                                            {isCompleted ? <i className="bi bi-check-lg"></i> : <span className="fw-bold">{idx + 1}</span>}
                                                        </div>

                                                        <div className="px-2">
                                                            <div className={`fw-bolder mb-1 lh-1 ${isCurrent ? 'text-primary' : 'text-dark'}`} style={{ fontSize: '13px' }}>{p.process_name}</div>
                                                            <div className={`badge rounded-pill mb-2 py-1 px-3 bg-${statusColor}-subtle text-${statusColor} fw-bold`}
                                                                style={{ fontSize: '10px', letterSpacing: '0.02em' }}>
                                                                {p.status}
                                                            </div>

                                                            <div className={`bg-white rounded-3 py-1 shadow-sm border mb-2 ${isCurrent ? 'border-warning' : 'border-light-subtle'}`}>
                                                                <span className={`fw-black fs-6 ${isCurrent ? 'text-warning fw-bold' : 'text-dark'}`}>{p.completed_qty || 0}</span>
                                                            </div>

                                                            <div className="d-flex flex-column gap-1">
                                                                <span className="text-muted" style={{ fontSize: '9px' }}>
                                                                    <i className="bi bi-calendar-event me-1"></i>
                                                                    {new Date(p.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                                                </span>
                                                                <span className="text-secondary fw-medium" style={{ fontSize: '9px' }}>
                                                                    <i className="bi bi-person-fill me-1"></i>
                                                                    {p.assigned_member_name ? p.assigned_member_name.split(' ')[0] : 'Open'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
