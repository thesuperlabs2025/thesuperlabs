import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

const ActivityLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        table_name: "",
        action: "",
        start_date: "",
        end_date: ""
    });

    const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8081/api";

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${API_URL}/activity-logs`, {
                headers: { Authorization: `Bearer ${token}` },
                params: filters
            });
            setLogs(response.data);
        } catch (error) {
            console.error("Error fetching activity logs:", error);
        } finally {
            setLoading(false);
        }
    }, [filters, API_URL]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const getActionClass = (action) => {
        switch (action) {
            case "UPDATE": return "bg-warning text-dark";
            case "DELETE": return "bg-danger";
            case "INSERT": return "bg-success";
            default: return "bg-secondary";
        }
    };

    return (
        <div className="container-fluid py-4 px-4" style={{ background: "#F2F2F7", minHeight: "100vh" }}>
            <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
                <div className="card-header bg-white py-3 border-bottom">
                    <div className="d-flex justify-content-between align-items-center">
                        <h4 className="fw-bold mb-0">Activity Log</h4>
                        <div className="text-muted small">Real-time update & delete tracking</div>
                    </div>
                </div>
                <div className="card-body p-4">
                    <form className="mb-4">
                        <div className="row g-3">
                            <div className="col-md-3">
                                <label className="form-label small fw-bold">Table Name</label>
                                <input
                                    type="text"
                                    className="form-control form-control-sm rounded-3"
                                    name="table_name"
                                    placeholder="e.g. customers"
                                    onChange={handleFilterChange}
                                />
                            </div>
                            <div className="col-md-2">
                                <label className="form-label small fw-bold">Action</label>
                                <select className="form-select form-select-sm rounded-3" name="action" onChange={handleFilterChange}>
                                    <option value="">All Actions</option>
                                    <option value="INSERT">INSERT</option>
                                    <option value="UPDATE">UPDATE</option>
                                    <option value="DELETE">DELETE</option>
                                </select>
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small fw-bold">Start Date</label>
                                <input type="date" className="form-control form-control-sm rounded-3" name="start_date" onChange={handleFilterChange} />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small fw-bold">End Date</label>
                                <input type="date" className="form-control form-control-sm rounded-3" name="end_date" onChange={handleFilterChange} />
                            </div>
                        </div>
                    </form>

                    <div className="table-responsive rounded-3 border">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-light">
                                <tr className="small text-uppercase fw-bold text-muted">
                                    <th className="py-3 px-3">Timestamp</th>
                                    <th className="py-3 px-3">User</th>
                                    <th className="py-3 px-3">Action</th>
                                    <th className="py-3 px-3">Table</th>
                                    <th className="py-3 px-3">Row ID</th>
                                    <th className="py-3 px-3">Changes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="6" className="text-center py-5">Loading logs...</td></tr>
                                ) : logs.length === 0 ? (
                                    <tr><td colSpan="6" className="text-center py-5">No logs found</td></tr>
                                ) : logs.map(log => (
                                    <tr key={log.id} style={{ fontSize: "14px" }}>
                                        <td className="px-3">{new Date(log.timestamp).toLocaleString()}</td>
                                        <td className="px-3 fw-bold">{log.user_name}</td>
                                        <td className="px-3">
                                            <span className={`badge ${getActionClass(log.action)}`}>{log.action}</span>
                                        </td>
                                        <td className="px-3">{log.table_name}</td>
                                        <td className="px-3">#{log.row_id}</td>
                                        <td className="px-3">
                                            <div className="small text-muted text-truncate" style={{ maxWidth: "250px" }}>
                                                {log.action === "UPDATE" ? "Modified fields..." : log.action === "DELETE" ? "Deleted entry" : "New entry"}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActivityLogs;
