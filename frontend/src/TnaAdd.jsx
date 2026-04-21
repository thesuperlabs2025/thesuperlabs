import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Select from 'react-select';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const API = process.env.REACT_APP_API_URL;

export default function TnaAdd() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [users, setUsers] = useState([]);
    const [masterProcesses, setMasterProcesses] = useState([]);
    const [processes, setProcesses] = useState([]);
    const [loading, setLoading] = useState(false);

    const [header, setHeader] = useState({
        order_no: '',
        order_name: '',
        customer_name: '',
        style_name: '',
        order_qty: '',
        overall_due_date: ''
    });

    const [showProcessModal, setShowProcessModal] = useState(false);
    const [newProcessName, setNewProcessName] = useState('');

    const fetchInitialData = useCallback(async () => {
        try {
            const [orderRes, userRes, processRes] = await Promise.all([
                axios.get(`${API}/tna/orders-for-tna`),
                axios.get(`${API}/users`),
                axios.get(`${API}/tna/process-master`)
            ]);

            setOrders(orderRes.data || []);
            setUsers((userRes.data.data || userRes.data || []).map(u => ({
                value: u.id,
                label: u.name || u.username
            })));

            const mProcs = (processRes.data || []).map(p => ({
                value: p.process_name,
                label: p.process_name
            }));
            setMasterProcesses(mProcs);

            // Initially, maybe we don't pre-fill everything, or we pre-fill the common ones
            // Let's pre-fill nothing if the user wants "add row concept", or just 3 rows
            if (processRes.data && processRes.data.length > 0) {
                const initial = (processRes.data.slice(0, 5) || []).map(p => ({
                    process_name: p.process_name,
                    assigned_member_id: '',
                    assigned_member_name: '',
                    due_date: '',
                    exceptional_days: 0,
                    notes: ''
                }));
                setProcesses(initial);
            } else {
                setProcesses([{ process_name: '', assigned_member_id: '', assigned_member_name: '', due_date: '', exceptional_days: 0, notes: '' }]);
            }

        } catch (err) {
            console.error(err);
            toast.error("Failed to load master data");
        }
    }, []);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    const handleOrderChange = (opt) => {
        if (opt) {
            const order = orders.find(o => String(o.order_no) === String(opt.value));
            if (order) {
                let delDate = '';
                if (order.delivery_date) {
                    delDate = new Date(order.delivery_date).toISOString().split('T')[0];
                }

                setHeader({
                    order_no: order.order_no,
                    order_name: order.order_name || '',
                    customer_name: order.buyer_name || '',
                    style_name: order.style_name || order.order_name || '',
                    order_qty: order.order_qty || 0,
                    overall_due_date: delDate
                });
            }
        }
    };

    const addDays = (dateStr, days) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return '';
        d.setDate(d.getDate() + parseInt(days || 0));
        return d.toISOString().split('T')[0];
    };

    const handleProcessChange = (index, field, value) => {
        let updated = [...processes];

        if (field === 'assigned_member') {
            updated[index].assigned_member_id = value ? value.value : '';
            updated[index].assigned_member_name = value ? value.label : '';
        } else if (field === 'process_name') {
            updated[index].process_name = value ? value.value : '';
        } else {
            updated[index][field] = value;
        }

        if (field === 'due_date' || field === 'exceptional_days') {
            for (let i = index; i < updated.length - 1; i++) {
                if (updated[i].due_date) {
                    updated[i + 1].due_date = addDays(updated[i].due_date, updated[i].exceptional_days);
                }
            }
        }

        setProcesses(updated);
    };

    const addRow = () => {
        setProcesses([...processes, { process_name: '', assigned_member_id: '', assigned_member_name: '', due_date: '', exceptional_days: 0, notes: '' }]);
    };

    const removeRow = (index) => {
        const updated = processes.filter((_, i) => i !== index);
        setProcesses(updated);
    };

    const handleAddProcessMaster = async () => {
        if (!newProcessName.trim()) return toast.warning("Enter process name");
        try {
            await axios.post(`${API}/tna/process-master`, { process_name: newProcessName });
            toast.success("Process added to master");
            setNewProcessName('');
            setShowProcessModal(false);
            fetchInitialData();
        } catch (err) {
            toast.error("Failed to add process");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!header.order_no) return toast.warning("Please select an order first");
        if (processes.length === 0 || processes.some(p => !p.process_name)) return toast.warning("Please add processes and set names");

        setLoading(true);
        try {
            await axios.post(`${API}/tna`, { header, processes });
            toast.success("✅ TNA Record Created Successfully!");
            navigate("/tna-track");
        } catch (err) {
            toast.error(err.response?.data?.error || "Failed to create TNA");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-fluid py-4 min-vh-100" style={{ background: '#f8fafc' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="fw-bold mb-1" style={{ letterSpacing: '-0.02em' }}>Create TNA Calendar</h3>
                    <p className="text-muted small m-0">Define timeline and assign responsibilities for each process</p>
                </div>
                <div className="d-flex gap-2">
                    <button className="btn btn-outline-secondary btn-sm rounded-pill px-3" onClick={() => navigate(-1)}>
                        <i className="bi bi-arrow-left me-1"></i> Back
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                {/* Order Overview Card */}
                <div className="card shadow-sm border-0 rounded-4 mb-4">
                    <div className="card-header bg-dark text-white p-3 rounded-top-4 d-flex align-items-center gap-2">
                        <i className="bi bi-clipboard-data"></i>
                        <h6 className="mb-0 fw-bold">Order Overview</h6>
                    </div>
                    <div className="card-body p-4">
                        <div className="row g-3">
                            <div className="col-md-4">
                                <label className="form-label small fw-bold text-muted text-uppercase" style={{ fontSize: '11px' }}>Select Order *</label>
                                <Select
                                    options={orders.map(o => ({
                                        value: o.order_no,
                                        label: `${o.order_no} — ${o.order_name}`
                                    }))}
                                    onChange={handleOrderChange}
                                    placeholder="Search and select order..."
                                    styles={{
                                        control: b => ({ ...b, borderRadius: '10px', borderColor: '#dee2e6', padding: '1px' }),
                                        menu: b => ({ ...b, borderRadius: '10px', zIndex: 9999 })
                                    }}
                                />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label small fw-bold text-muted text-uppercase" style={{ fontSize: '11px' }}>Customer / Brand</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-light border-end-0 rounded-start-3">
                                        <i className="bi bi-person text-muted" style={{ fontSize: '13px' }}></i>
                                    </span>
                                    <input type="text" className="form-control bg-light border-start-0 rounded-end-3"
                                        value={header.customer_name} readOnly placeholder="Auto-filled..." />
                                </div>
                            </div>
                            <div className="col-md-4">
                                <label className="form-label small fw-bold text-muted text-uppercase" style={{ fontSize: '11px' }}>Style Name</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-light border-end-0 rounded-start-3">
                                        <i className="bi bi-palette text-muted" style={{ fontSize: '13px' }}></i>
                                    </span>
                                    <input type="text" className="form-control bg-light border-start-0 rounded-end-3"
                                        value={header.style_name} readOnly placeholder="Auto-filled..." />
                                </div>
                            </div>
                            <div className="col-md-4">
                                <label className="form-label small fw-bold text-muted text-uppercase" style={{ fontSize: '11px' }}>Order Quantity</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-light border-end-0 rounded-start-3">
                                        <i className="bi bi-stack text-muted" style={{ fontSize: '13px' }}></i>
                                    </span>
                                    <input type="text" className="form-control bg-light border-start-0 rounded-end-3 fw-bold"
                                        value={header.order_qty} readOnly placeholder="Auto-filled..." />
                                </div>
                            </div>
                            <div className="col-md-4">
                                <label className="form-label small fw-bold text-muted text-uppercase" style={{ fontSize: '11px' }}>Overall Due Date (Delivery)</label>
                                <input type="date" className="form-control rounded-3" required
                                    value={header.overall_due_date}
                                    onChange={e => setHeader({ ...header, overall_due_date: e.target.value })} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Process Assignment Card */}
                <div className="card shadow-sm border-0 rounded-4">
                    <div className="card-header bg-dark text-white p-3 rounded-top-4 d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-3">
                            <div className="d-flex align-items-center gap-2">
                                <i className="bi bi-diagram-3"></i>
                                <h6 className="mb-0 fw-bold">Process & Team Assignment</h6>
                            </div>
                            <div className="d-flex gap-2 ms-3">
                                <button type="button" className="btn btn-primary btn-sm rounded-circle p-0"
                                    style={{ width: '24px', height: '24px' }}
                                    onClick={() => setShowProcessModal(true)}
                                    title="Quick Add New Process">
                                    <i className="bi bi-plus small"></i>
                                </button>
                                <button type="button" className="btn btn-warning btn-sm rounded-circle p-0"
                                    style={{ width: '24px', height: '24px' }}
                                    onClick={fetchInitialData}
                                    title="Refresh Master List">
                                    <i className="bi bi-arrow-clockwise small"></i>
                                </button>
                            </div>
                        </div>
                        <button type="button" className="btn btn-sm btn-light rounded-pill px-3 fw-bold" onClick={addRow}>
                            <i className="bi bi-plus-lg me-1"></i> Add Row
                        </button>
                    </div>
                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="bg-light text-uppercase" style={{ fontSize: '11px', letterSpacing: '0.05em' }}>
                                    <tr>
                                        <th className="py-3 px-4" style={{ width: '5%' }}>#</th>
                                        <th className="py-3 px-4" style={{ width: '25%' }}>Process</th>
                                        <th className="py-3 px-4" style={{ width: '25%' }}>Responsible Member</th>
                                        <th className="py-3 px-4" style={{ width: '15%' }}>Due Date</th>
                                        <th className="py-3 px-4 text-center" style={{ width: '8%' }}>Buffer</th>
                                        <th className="py-3 px-4">Notes</th>
                                        <th className="py-3 px-4 text-end" style={{ width: '5%' }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {processes.map((p, i) => (
                                        <tr key={i} style={{ borderLeft: i % 2 === 0 ? '3px solid transparent' : '3px solid #f8fafc' }}>
                                            <td className="px-4 text-muted fw-bold" style={{ fontSize: '12px' }}>{i + 1}</td>
                                            <td className="px-4">
                                                <Select
                                                    options={masterProcesses}
                                                    value={masterProcesses.find(o => o.value === p.process_name)}
                                                    placeholder="Select process..."
                                                    onChange={val => handleProcessChange(i, 'process_name', val)}
                                                    styles={{
                                                        control: b => ({ ...b, borderRadius: '8px', minHeight: '36px', fontSize: '13px' }),
                                                        menu: b => ({ ...b, fontSize: '13px' })
                                                    }}
                                                />
                                            </td>
                                            <td className="px-4">
                                                <Select
                                                    options={users}
                                                    isClearable
                                                    value={users.find(o => o.value === p.assigned_member_id)}
                                                    placeholder="Assign member..."
                                                    onChange={val => handleProcessChange(i, 'assigned_member', val)}
                                                    styles={{
                                                        control: b => ({ ...b, borderRadius: '8px', minHeight: '36px', fontSize: '13px' }),
                                                        menu: b => ({ ...b, fontSize: '13px' })
                                                    }}
                                                />
                                            </td>
                                            <td className="px-4">
                                                <input type="date" className="form-control form-control-sm rounded-3"
                                                    value={p.due_date}
                                                    onChange={e => handleProcessChange(i, 'due_date', e.target.value)} />
                                            </td>
                                            <td className="px-4 text-center">
                                                <input type="number" min="0" className="form-control form-control-sm text-center rounded-3"
                                                    value={p.exceptional_days}
                                                    onChange={e => handleProcessChange(i, 'exceptional_days', e.target.value)} />
                                            </td>
                                            <td className="px-4">
                                                <input type="text" className="form-control form-control-sm rounded-3"
                                                    placeholder="Notes..."
                                                    value={p.notes}
                                                    onChange={e => handleProcessChange(i, 'notes', e.target.value)} />
                                            </td>
                                            <td className="px-4 text-end">
                                                <button type="button" className="btn btn-link text-danger p-0" onClick={() => removeRow(i)}>
                                                    <i className="bi bi-x-circle"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="card-footer p-4 bg-white border-top d-flex justify-content-between align-items-center rounded-bottom-4">
                        <div className="text-muted small">
                            <i className="bi bi-info-circle me-1"></i>
                            Select processes from master and set their timelines.
                        </div>
                        <button type="submit" className="btn btn-dark px-5 rounded-pill py-2 fw-bold shadow-sm" disabled={loading}>
                            {loading ? 'Creating...' : 'Create TNA Record'}
                        </button>
                    </div>
                </div>
            </form>

            {/* Quick Add Process Modal */}
            {showProcessModal && (
                <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content rounded-4 border-0">
                            <div className="modal-header border-0 pb-0">
                                <h5 className="modal-title fw-bold">Add Process to Master</h5>
                                <button type="button" className="btn-close" onClick={() => setShowProcessModal(false)}></button>
                            </div>
                            <div className="modal-body py-4">
                                <label className="form-label small fw-bold">Process Name</label>
                                <input
                                    type="text"
                                    className="form-control rounded-3"
                                    placeholder="Enter process name"
                                    value={newProcessName}
                                    onChange={e => setNewProcessName(e.target.value)}
                                    autoFocus
                                />
                            </div>
                            <div className="modal-footer border-0 pt-0">
                                <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => setShowProcessModal(false)}>Cancel</button>
                                <button type="button" className="btn btn-dark rounded-pill px-4" onClick={handleAddProcessMaster}>Add Process</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
