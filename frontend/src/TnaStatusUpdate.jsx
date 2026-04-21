import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const API = process.env.REACT_APP_API_URL;

export default function TnaStatusUpdate() {
    const { id, processId } = useParams();
    const navigate = useNavigate();
    const [tna, setTna] = useState(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API}/tna/${id}`);
            setTna(res.data);
        } catch (err) {
            toast.error("Failed to load TNA details");
            navigate(-1);
        } finally {
            setLoading(false);
        }
    }, [id, navigate]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleProcessChange = (idx, field, value) => {
        const updatedProcs = [...tna.processes];
        updatedProcs[idx][field] = value;

        // Auto-set completion date if status becomes 'Completed'
        if (field === 'status' && value === 'Completed') {
            updatedProcs[idx]['completion_date'] = new Date().toISOString().split('T')[0];
        } else if (field === 'status' && value !== 'Completed') {
            updatedProcs[idx]['completion_date'] = null;
        }

        setTna({ ...tna, processes: updatedProcs });
    };

    const handleSaveRow = async (idx) => {
        const p = tna.processes[idx];
        setSaving(true);
        try {
            await axios.put(`${API}/tna/process/${p.id}`, {
                completed_qty: p.completed_qty || 0,
                notes: p.notes || '',
                status: p.status,
                completion_date: p.completion_date
            });
            toast.success(`${p.process_name} updated successfully`);
            fetchData();
        } catch (err) {
            toast.error("Update failed");
        } finally {
            setSaving(false);
        }
    };

    if (loading || !tna) return <div className="text-center py-5">Loading TNA...</div>;

    const statusOptions = ['Not Started', 'In Progress', 'Completed', 'Delayed', 'Cancelled'];

    return (
        <div className="container-fluid py-4 min-vh-100 bg-white">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="fw-bold mb-1">Update Process Status</h3>
                    <p className="text-muted small m-0">Order: <span className="text-dark fw-bold">#{tna.order_no} - {tna.order_name}</span> | Style: {tna.style_name}</p>
                </div>
                <button className="btn btn-outline-secondary btn-sm rounded-pill px-3" onClick={() => navigate(-1)}>
                    <i className="bi bi-arrow-left me-1"></i> Back to Tracking
                </button>
            </div>

            <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
                <div className="card-header bg-dark text-white p-3">
                    <h6 className="mb-0 fw-bold">Process Wise Updates</h6>
                </div>
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="bg-light text-uppercase" style={{ fontSize: '11px', letterSpacing: '0.05em' }}>
                                <tr>
                                    <th className="py-3 px-4" style={{ width: '5%' }}>Seq</th>
                                    <th className="py-3 px-4" style={{ width: '20%' }}>Process Name</th>
                                    <th className="py-3 px-4" style={{ width: '15%' }}>Assigned To</th>
                                    <th className="py-3 px-4" style={{ width: '15%' }}>Status</th>
                                    <th className="py-3 px-4" style={{ width: '10%' }}>Qty Done</th>
                                    <th className="py-3 px-4">Notes / Remarks</th>
                                    <th className="py-3 px-4 text-end" style={{ width: '10%' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tna.processes
                                    .map((p, originalIdx) => ({ ...p, originalIdx })) // Attach original index
                                    .filter(p => !processId || p.id === parseInt(processId))
                                    .map((p) => (
                                        <tr key={p.id}>
                                            <td className="px-4 fw-bold text-muted">{p.sequence_no || p.originalIdx + 1}</td>
                                            <td className="px-4 fw-bold">{p.process_name}</td>
                                            <td className="px-4 small">
                                                <i className="bi bi-person text-muted me-1"></i>
                                                {p.assigned_member_name || 'Unassigned'}
                                            </td>
                                            <td className="px-4">
                                                <select
                                                    className={`form-select form-select-sm rounded-pill fw-bold bg-${p.status === 'Completed' ? 'success-subtle text-success' : p.status === 'In Progress' ? 'warning-subtle text-warning' : 'light text-muted'}`}
                                                    value={p.status}
                                                    onChange={(e) => handleProcessChange(p.originalIdx, 'status', e.target.value)}
                                                >
                                                    {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                </select>
                                            </td>
                                            <td className="px-4">
                                                <input
                                                    type="number"
                                                    className="form-control form-control-sm rounded-3"
                                                    value={p.completed_qty || ''}
                                                    onChange={(e) => handleProcessChange(p.originalIdx, 'completed_qty', e.target.value)}
                                                    placeholder="Qty"
                                                />
                                            </td>
                                            <td className="px-4">
                                                <input
                                                    type="text"
                                                    className="form-control form-control-sm rounded-3"
                                                    value={p.notes || ''}
                                                    onChange={(e) => handleProcessChange(p.originalIdx, 'notes', e.target.value)}
                                                    placeholder="Remarks..."
                                                />
                                            </td>
                                            <td className="px-4 text-end">
                                                <button
                                                    className="btn btn-dark btn-sm rounded-pill px-3"
                                                    onClick={() => handleSaveRow(p.originalIdx)}
                                                    disabled={saving}
                                                >
                                                    Save
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className="alert alert-info rounded-4 border-0 small shadow-sm d-flex align-items-center gap-3">
                <i className="bi bi-info-circle fs-4"></i>
                <div>
                    <strong>Pro-tip:</strong> Updating status here will reflect immediately on the Tracking Dashboard and the assigned staff member's personal task page.
                </div>
            </div>
        </div>
    );
}
