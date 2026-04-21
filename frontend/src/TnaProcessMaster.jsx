import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const API = process.env.REACT_APP_API_URL;

export default function TnaProcessMaster() {
    const navigate = useNavigate();
    const [processes, setProcesses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newProcess, setNewProcess] = useState({ process_name: '', sequence_no: '' });
    const [editMode, setEditMode] = useState(null);

    const fetchProcesses = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API}/tna/process-master`);
            setProcesses(res.data || []);
        } catch (err) {
            toast.error("Failed to load processes");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProcesses();
    }, [fetchProcesses]);

    const handleSave = async (e) => {
        e.preventDefault();
        if (!newProcess.process_name) return toast.warning("Enter process name");

        try {
            if (editMode) {
                await axios.put(`${API}/tna/process-master/${editMode}`, newProcess);
                toast.success("Process updated");
            } else {
                await axios.post(`${API}/tna/process-master`, newProcess);
                toast.success("Process added");
            }
            setNewProcess({ process_name: '', sequence_no: '' });
            setEditMode(null);
            fetchProcesses();
        } catch (err) {
            toast.error(err.response?.data?.error || "Operation failed");
        }
    };

    const handleEdit = (p) => {
        setEditMode(p.id);
        setNewProcess({ process_name: p.process_name, sequence_no: p.sequence_no });
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this process from master?")) return;
        try {
            await axios.delete(`${API}/tna/process-master/${id}`);
            toast.success("Process deleted");
            fetchProcesses();
        } catch (err) {
            toast.error("Failed to delete process");
        }
    };

    return (
        <div className="container-fluid py-4 min-vh-100" style={{ background: '#f8fafc' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="fw-bold mb-1">TNA Process Master</h3>
                    <p className="text-muted small m-0">Manage global list of TNA processes</p>
                </div>
                <button className="btn btn-outline-secondary btn-sm rounded-pill px-3" onClick={() => navigate(-1)}>
                    <i className="bi bi-arrow-left me-1"></i> Back
                </button>
            </div>

            <div className="row g-4">
                {/* Form Side */}
                <div className="col-lg-4">
                    <div className="card shadow-sm border-0 rounded-4 sticky-top" style={{ top: '20px' }}>
                        <div className="card-header bg-dark text-white p-3 rounded-top-4">
                            <h6 className="mb-0 fw-bold">{editMode ? 'Edit Process' : 'Add New Process'}</h6>
                        </div>
                        <div className="card-body p-4">
                            <form onSubmit={handleSave}>
                                <div className="mb-3">
                                    <label className="form-label small fw-bold">Process Name *</label>
                                    <input
                                        type="text"
                                        className="form-control rounded-3"
                                        placeholder="e.g. Yarn Dyeing"
                                        value={newProcess.process_name}
                                        onChange={e => setNewProcess({ ...newProcess, process_name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="form-label small fw-bold">Sequence Order (Optional)</label>
                                    <input
                                        type="number"
                                        className="form-control rounded-3"
                                        placeholder="e.g. 10, 20, 30"
                                        value={newProcess.sequence_no}
                                        onChange={e => setNewProcess({ ...newProcess, sequence_no: e.target.value })}
                                    />
                                    <div className="form-text small">Used for sorting processes in the setup page.</div>
                                </div>
                                <div className="d-grid gap-2">
                                    <button type="submit" className="btn btn-dark rounded-pill py-2 fw-bold">
                                        {editMode ? 'Update Process' : 'Save Process'}
                                    </button>
                                    {editMode && (
                                        <button type="button" className="btn btn-light rounded-pill" onClick={() => {
                                            setEditMode(null);
                                            setNewProcess({ process_name: '', sequence_no: '' });
                                        }}>Cancel</button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                {/* List Side */}
                <div className="col-lg-8">
                    <div className="card shadow-sm border-0 rounded-4">
                        <div className="card-header bg-white p-3 rounded-top-4 border-bottom d-flex justify-content-between align-items-center">
                            <h6 className="mb-0 fw-bold">Master Process List</h6>
                            <span className="badge bg-light text-dark rounded-pill border">{processes.length} Processes</span>
                        </div>
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="bg-light text-uppercase" style={{ fontSize: '11px', letterSpacing: '0.05em' }}>
                                        <tr>
                                            <th className="py-3 px-4" style={{ width: '10%' }}>Seq</th>
                                            <th className="py-3 px-4">Process Name</th>
                                            <th className="py-3 px-4 text-end">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr><td colSpan="3" className="text-center py-5">Loading processes...</td></tr>
                                        ) : processes.length === 0 ? (
                                            <tr><td colSpan="3" className="text-center py-5 text-muted">No processes found in master.</td></tr>
                                        ) : (
                                            processes.map((p, i) => (
                                                <tr key={p.id}>
                                                    <td className="px-4 fw-bold text-muted">{p.sequence_no || '-'}</td>
                                                    <td className="px-4">
                                                        <span className="badge rounded-pill px-3 py-2 bg-light text-dark border fw-bold" style={{ fontSize: '12px' }}>
                                                            {p.process_name}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 text-end">
                                                        <div className="d-flex gap-2 justify-content-end">
                                                            <button className="btn btn-light btn-sm rounded-circle p-0"
                                                                style={{ width: '32px', height: '32px' }}
                                                                onClick={() => handleEdit(p)}>
                                                                <i className="bi bi-pencil-square text-primary"></i>
                                                            </button>
                                                            <button className="btn btn-light btn-sm rounded-circle p-0"
                                                                style={{ width: '32px', height: '32px' }}
                                                                onClick={() => handleDelete(p.id)}>
                                                                <i className="bi bi-trash3 text-danger"></i>
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
                </div>
            </div>
        </div>
    );
}
