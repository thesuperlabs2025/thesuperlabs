import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Select from "react-select";
import "bootstrap/dist/css/bootstrap.min.css";

const API = process.env.REACT_APP_API_URL;

export default function PcsWipReport() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [orders, setOrders] = useState([]);
    const [filters, setFilters] = useState({
        order_no: "",
        fromDate: "",
        toDate: ""
    });

    const fetchOrders = async () => {
        try {
            const res = await axios.get(`${API}/order_planning?limit=1000`);
            const items = res.data.data || res.data || [];
            setOrders(items.map(o => ({ value: o.order_no, label: o.order_no })));
        } catch (err) {
            console.error("Error fetching orders:", err);
        }
    };

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                order_no: filters.order_no,
                fromDate: filters.fromDate,
                toDate: filters.toDate
            };
            const res = await axios.get(`${API}/erp-reports/pcs-wip-report`, { params });
            setData(res.data || []);
        } catch (err) {
            console.error("Error fetching PCS WIP data:", err);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchOrders();
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="container-fluid py-4 h-100 bg-light">
            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    .card { border: none !important; box-shadow: none !important; }
                    body { background: white !important; }
                    .table-dark { background-color: #000 !important; color: #fff !important; }
                }
                .table-dark th { background-color: #000 !important; color: #fff !important; border: none; }
            `}</style>

            <div className="d-flex justify-content-between align-items-center mb-4 no-print">
                <div>
                    <h3 className="fw-bold text-dark mb-1">PCS WIP (Work in Progress)</h3>
                    <p className="text-muted small mb-0">Track piece production status across contractors</p>
                </div>
                <button className="btn btn-dark btn-sm rounded-pill px-4 shadow-sm" onClick={handlePrint}>
                    <i className="bi bi-printer me-2"></i> Print Report
                </button>
            </div>

            <div className="card border-0 shadow-sm rounded-4 mb-4 no-print">
                <div className="card-body p-4">
                    <div className="row g-3">
                        <div className="col-md-4">
                            <label className="form-label small fw-bold text-muted">Filter by Order</label>
                            <Select
                                options={orders}
                                isClearable
                                placeholder="Select Order Number..."
                                onChange={(opt) => setFilters({ ...filters, order_no: opt ? opt.value : "" })}
                                styles={{ control: (b) => ({ ...b, borderRadius: '10px' }) }}
                            />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label small fw-bold text-muted">From Date</label>
                            <input type="date" className="form-control" value={filters.fromDate}
                                onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })} />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label small fw-bold text-muted">To Date</label>
                            <input type="date" className="form-control" value={filters.toDate}
                                onChange={(e) => setFilters({ ...filters, toDate: e.target.value })} />
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
                            <thead className="table-dark">
                                <tr>
                                    <th className="py-3 px-4 small">Order No</th>
                                    <th className="py-3 px-4 small">Order Name</th>
                                    <th className="py-3 px-4 small">Contractor</th>
                                    <th className="py-3 px-4 small">Process</th>
                                    <th className="py-3 px-4 small text-center">Outward</th>
                                    <th className="py-3 px-4 small text-center">Inward</th>
                                    <th className="py-3 px-4 small text-center">Return</th>
                                    <th className="py-3 px-4 small text-center">WIP Balance</th>
                                    <th className="py-3 px-4 small text-end">Last Activity</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="9" className="text-center py-5">
                                            <div className="spinner-border spinner-border-sm text-primary me-2"></div>
                                            Loading PCS WIP report...
                                        </td>
                                    </tr>
                                ) : data.length > 0 ? (
                                    data.map((row, i) => (
                                        <tr key={i} className="border-bottom">
                                            <td className="py-3 px-4 small fw-bold text-primary">#{row.order_no}</td>
                                            <td className="py-3 px-4 small">{row.order_name}</td>
                                            <td className="py-3 px-4 small">
                                                <span className="badge bg-light text-dark border">{row.contractor_name}</span>
                                            </td>
                                            <td className="py-3 px-4 small">
                                                <span className="badge bg-primary-subtle text-primary border border-primary-subtle">{row.process}</span>
                                            </td>
                                            <td className="py-3 px-4 small text-center fw-bold">{row.total_outward}</td>
                                            <td className="py-3 px-4 small text-center text-success fw-bold">{row.total_inward}</td>
                                            <td className="py-3 px-4 small text-center text-danger fw-bold">{row.total_return}</td>
                                            <td className="py-3 px-4 small text-center fw-bold fs-6" style={{ color: row.balance > 0 ? '#f59e0b' : '#10b981' }}>
                                                {row.balance}
                                            </td>
                                            <td className="py-3 px-4 small text-end text-muted">
                                                {row.last_activity ? new Date(row.last_activity).toLocaleDateString() : "-"}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="9" className="text-center py-5 text-muted">
                                            No PCS WIP data found for the selected criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                            {data.length > 0 && (
                                <tfoot className="bg-light fw-bold">
                                    <tr>
                                        <td colSpan="4" className="text-end py-3 px-4">TOTALS:</td>
                                        <td className="text-center py-3 px-4">{data.reduce((s, r) => s + (parseInt(r.total_outward) || 0), 0)}</td>
                                        <td className="text-center py-3 px-4 text-success">{data.reduce((s, r) => s + (parseInt(r.total_inward) || 0), 0)}</td>
                                        <td className="text-center py-3 px-4 text-danger">{data.reduce((s, r) => s + (parseInt(r.total_return) || 0), 0)}</td>
                                        <td className="text-center py-3 px-4 text-primary fs-5">{data.reduce((s, r) => s + (parseInt(r.balance) || 0), 0)}</td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
