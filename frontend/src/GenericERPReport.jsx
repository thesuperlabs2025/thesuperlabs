import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const API = process.env.REACT_APP_API_URL;

export default function GenericERPReport({ title, endpoint, columns, dateField = "date" }) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        fromDate: "",
        toDate: "",
        searchTerm: ""
    });

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API}/erp-reports/${endpoint}`);
            setData(res.data || []);
        } catch (err) {
            console.error(`Error fetching ${title}:`, err);
        } finally {
            setLoading(false);
        }
    }, [endpoint, title]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const filteredData = data.filter(item => {
        const matchesSearch = Object.values(item).some(val =>
            String(val).toLowerCase().includes(filters.searchTerm.toLowerCase())
        );

        let matchesDate = true;
        if (filters.fromDate && item[dateField]) {
            matchesDate = matchesDate && (new Date(item[dateField]) >= new Date(filters.fromDate));
        }
        if (filters.toDate && item[dateField]) {
            matchesDate = matchesDate && (new Date(item[dateField]) <= new Date(filters.toDate));
        }

        return matchesSearch && matchesDate;
    });

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="container-fluid py-4 h-100 bg-light">
            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    .card { border: none !important; box-shadow: none !important; }
                    .main-content { padding: 0 !important; }
                    body { background: white !important; }
                }
            `}</style>

            <div className="d-flex justify-content-between align-items-center mb-4 no-print">
                <div>
                    <h3 className="fw-bold text-dark mb-1">{title}</h3>
                    <p className="text-muted small mb-0">Analysis and Tracking</p>
                </div>
                <button className="btn btn-dark btn-sm rounded-3 px-4 shadow-sm" onClick={handlePrint}>
                    <i className="bi bi-printer me-2"></i> Print Report
                </button>
            </div>

            <div className="card border-0 shadow-sm rounded-4 mb-4 no-print">
                <div className="card-body p-4">
                    <div className="row g-3">
                        <div className="col-md-4">
                            <label className="form-label small fw-bold text-muted">Search</label>
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0"><i className="bi bi-search text-muted"></i></span>
                                <input type="text" name="searchTerm" className="form-control border-start-0"
                                    placeholder="Keywords..." value={filters.searchTerm} onChange={handleFilterChange} />
                            </div>
                        </div>
                        <div className="col-md-3">
                            <label className="form-label small fw-bold text-muted">From Date</label>
                            <input type="date" name="fromDate" className="form-control"
                                value={filters.fromDate} onChange={handleFilterChange} />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label small fw-bold text-muted">To Date</label>
                            <input type="date" name="toDate" className="form-control"
                                value={filters.toDate} onChange={handleFilterChange} />
                        </div>
                        <div className="col-md-2 d-flex align-items-end">
                            <button className="btn btn-primary w-100 rounded-3 shadow-sm" onClick={fetchData}>
                                <i className="bi bi-arrow-clockwise me-2"></i> Refresh
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="bg-dark text-white">
                                <tr>
                                    {columns.map((col, i) => (
                                        <th key={i} className="py-3 px-4 small text-uppercase" style={{ minWidth: col.width || 'auto' }}>
                                            {col.label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={columns.length} className="text-center py-5">
                                            <div className="spinner-border spinner-border-sm text-primary me-2"></div>
                                            Loading report data...
                                        </td>
                                    </tr>
                                ) : filteredData.length > 0 ? (
                                    filteredData.map((row, i) => (
                                        <tr key={i} className="border-bottom">
                                            {columns.map((col, j) => (
                                                <td key={j} className="py-3 px-4 small font-monospace">
                                                    {col.render ? col.render(row) : (row[col.key] || "-")}
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={columns.length} className="text-center py-5 text-muted">
                                            No data found for the selected criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
