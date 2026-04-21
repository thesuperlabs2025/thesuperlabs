import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const API = process.env.REACT_APP_API_URL;

export default function TnaMyPage() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState('all');
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const fetchTasks = useCallback(async () => {
        if (!user.id) return;
        setLoading(true);
        try {
            const res = await axios.get(`${API}/tna/my-tasks/${user.id}`);
            setTasks(res.data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load your tasks");
        } finally {
            setLoading(false);
        }
    }, [user.id]);

    useEffect(() => { fetchTasks(); }, [fetchTasks]);

    const handleUpdate = async (task, updates) => {
        try {
            let newStatus = updates.status || task.status;
            if (updates.completed_qty >= (task.order_qty || 0)) {
                newStatus = 'Completed';
            }
            await axios.put(`${API}/tna/process/${task.id}`, {
                completed_qty: updates.completed_qty || task.completed_qty,
                notes: updates.notes || task.notes,
                status: newStatus,
                completion_date: newStatus === 'Completed' ? new Date().toISOString().split('T')[0] : null
            });
            toast.success("Progress updated");
            fetchTasks();
        } catch {
            toast.error("Update failed");
        }
    };

    const isOverdue = (dueDate) => new Date(dueDate) < new Date();

    const filteredTasks = tasks.filter(t => {
        if (filter === 'overdue') return isOverdue(t.due_date) && t.status !== 'Completed';
        if (filter === 'pending') return t.status !== 'Completed';
        if (filter === 'completed') return t.status === 'Completed';
        return true;
    });

    const counts = {
        all: tasks.length,
        overdue: tasks.filter(t => isOverdue(t.due_date) && t.status !== 'Completed').length,
        pending: tasks.filter(t => t.status !== 'Completed').length,
        completed: tasks.filter(t => t.status === 'Completed').length,
    };

    const statusColor = (t) => {
        if (t.status === 'Completed') return { bg: '#f0fdf4', text: '#10b981', border: '#bbf7d0' };
        if (isOverdue(t.due_date)) return { bg: '#fef2f2', text: '#ef4444', border: '#fecaca' };
        return { bg: '#fffbeb', text: '#f59e0b', border: '#fde68a' };
    };

    return (
        <div style={{ background: "#f8fafc", minHeight: "100vh", padding: "24px 20px", fontFamily: "'Inter', system-ui, sans-serif" }}>
            {/* Header */}
            <div style={{
                background: "linear-gradient(135deg, #0f172a 0%, #1e40af 100%)",
                borderRadius: 20, padding: "24px 28px", marginBottom: 24,
                display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12,
                boxShadow: "0 10px 40px rgba(15,23,42,0.3)"
            }}>
                <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 }}>TNA Module</div>
                    <h1 style={{ fontSize: "clamp(1.4rem, 3vw, 1.8rem)", fontWeight: 800, color: "#fff", margin: 0 }}>My TNA Tasks</h1>
                    <p style={{ color: "rgba(255,255,255,0.55)", margin: "4px 0 0", fontSize: 13 }}>Personalized dashboard for your assigned processes</p>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {[
                        { label: "All", val: counts.all, color: "#6366f1" },
                        { label: "Overdue", val: counts.overdue, color: "#ef4444" },
                        { label: "Pending", val: counts.pending, color: "#f59e0b" },
                        { label: "Done", val: counts.completed, color: "#10b981" },
                    ].map(s => (
                        <div key={s.label} style={{ background: "rgba(255,255,255,0.1)", borderRadius: 12, padding: "10px 16px", textAlign: "center", backdropFilter: "blur(8px)" }}>
                            <div style={{ fontSize: "1.3rem", fontWeight: 800, color: s.color }}>{s.val}</div>
                            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>{s.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Filter Tabs */}
            <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
                {[
                    { key: 'all', label: 'All Tasks', color: '#6366f1' },
                    { key: 'overdue', label: '🔴 Overdue', color: '#ef4444' },
                    { key: 'pending', label: '⏳ Pending', color: '#f59e0b' },
                    { key: 'completed', label: '✅ Completed', color: '#10b981' },
                ].map(tab => (
                    <button key={tab.key} onClick={() => setFilter(tab.key)} style={{
                        padding: "7px 18px", borderRadius: 20, border: "none", fontWeight: 600, fontSize: 13, cursor: "pointer",
                        background: filter === tab.key ? tab.color : "#fff",
                        color: filter === tab.key ? "#fff" : "#64748b",
                        boxShadow: filter === tab.key ? `0 4px 12px ${tab.color}40` : "0 1px 4px rgba(0,0,0,0.06)",
                        transition: "all 0.2s"
                    }}>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            {loading ? (
                <div style={{ textAlign: "center", padding: "60px", color: "#94a3b8" }}>
                    <div style={{ width: 40, height: 40, border: "3px solid #e2e8f0", borderTopColor: "#6366f1", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    Loading tasks...
                </div>
            ) : filteredTasks.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px", background: "#fff", borderRadius: 16, border: "1.5px solid #f1f5f9", color: "#94a3b8" }}>
                    <i className="bi bi-clipboard-check" style={{ fontSize: 48, marginBottom: 12, display: "block" }} />
                    <div style={{ fontWeight: 600, fontSize: "1.1rem" }}>No tasks found</div>
                    <div style={{ fontSize: 13, marginTop: 4 }}>You have no {filter !== 'all' ? filter : 'active'} tasks assigned</div>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {filteredTasks.map((t) => {
                        const sc = statusColor(t);
                        return (
                            <div key={t.id} style={{
                                background: "#fff", borderRadius: 14, padding: "18px 20px",
                                border: `1.5px solid ${t.status === 'Completed' ? '#f0fdf4' : isOverdue(t.due_date) ? '#fecaca' : '#f1f5f9'}`,
                                boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                                opacity: t.status === 'Completed' ? 0.7 : 1,
                                display: "grid", gridTemplateColumns: "1fr 1fr 1fr 180px auto", gap: 16,
                                alignItems: "center"
                            }}>
                                {/* Order Info */}
                                <div>
                                    <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "#6366f1", marginBottom: 2 }}>#{t.order_no}</div>
                                    <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#1e293b" }}>{t.order_name}</div>
                                    <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{t.customer_name} • {t.style_name}</div>
                                </div>

                                {/* Process */}
                                <div>
                                    <span style={{ background: "#eff6ff", color: "#3b82f6", fontWeight: 700, fontSize: 12, padding: "4px 12px", borderRadius: 20, display: "inline-block" }}>
                                        {t.process_name}
                                    </span>
                                </div>

                                {/* Due Date + Status */}
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: "0.9rem", color: isOverdue(t.due_date) && t.status !== 'Completed' ? '#ef4444' : '#1e293b' }}>
                                        {new Date(t.due_date).toLocaleDateString()}
                                    </div>
                                    {t.exceptional_days > 0 && <div style={{ fontSize: 11, color: "#94a3b8" }}>+{t.exceptional_days} buffer days</div>}
                                    <span style={{ background: sc.bg, color: sc.text, border: `1px solid ${sc.border}`, fontWeight: 700, fontSize: 11, padding: "3px 10px", borderRadius: 20, display: "inline-block", marginTop: 6 }}>
                                        {t.status}
                                    </span>
                                </div>

                                {/* Input Fields */}
                                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                    <input
                                        type="number" placeholder="Qty Completed"
                                        defaultValue={t.completed_qty}
                                        onBlur={(e) => t.temp_qty = e.target.value}
                                        style={{ width: "100%", border: "1.5px solid #e2e8f0", borderRadius: 8, padding: "6px 10px", fontSize: 13, outline: "none" }}
                                    />
                                    <textarea
                                        placeholder="Add notes..."
                                        defaultValue={t.notes}
                                        onBlur={(e) => t.temp_notes = e.target.value}
                                        rows={1}
                                        style={{ width: "100%", border: "1.5px solid #e2e8f0", borderRadius: 8, padding: "6px 10px", fontSize: 13, outline: "none", resize: "none" }}
                                    />
                                </div>

                                {/* Actions */}
                                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                    <button
                                        disabled={t.status === 'Completed'}
                                        onClick={() => handleUpdate(t, { completed_qty: t.temp_qty || t.completed_qty, notes: t.temp_notes || t.notes, status: 'In Progress' })}
                                        style={{ background: t.status === 'Completed' ? '#f1f5f9' : '#1e293b', color: t.status === 'Completed' ? '#94a3b8' : '#fff', border: "none", borderRadius: 10, padding: "7px 14px", fontWeight: 700, fontSize: 12, cursor: t.status === 'Completed' ? 'not-allowed' : 'pointer' }}
                                    >Update</button>
                                    <button
                                        disabled={t.status === 'Completed'}
                                        onClick={() => handleUpdate(t, { completed_qty: t.temp_qty || t.completed_qty, notes: t.temp_notes || t.notes, status: 'Completed' })}
                                        style={{ background: t.status === 'Completed' ? '#f0fdf4' : '#10b981', color: t.status === 'Completed' ? '#10b981' : '#fff', border: "none", borderRadius: 10, padding: "7px 14px", fontWeight: 700, fontSize: 12, cursor: t.status === 'Completed' ? 'not-allowed' : 'pointer' }}
                                    >✓ Complete</button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
