import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const API = process.env.REACT_APP_API_URL;

export default function OrderStatusReport() {
    const [orders, setOrders] = useState([]);
    const [processes, setProcesses] = useState([]);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    const [filters, setFilters] = useState({
        orderNo: "",
        process: "",
        fromDate: "",
        toDate: "",
        fabric: "",
        color: "",
        dia: "",
        showFabric: false,
        showColor: false,
        showDia: false
    });

    useEffect(() => {
        Promise.all([
            axios.get(`${API}/yarn-dyeing-outward/orders`),
            axios.get(`${API}/life-cycles`)
        ]).then(([orderRes, procRes]) => {
            setOrders(orderRes.data || []);
            setProcesses(procRes.data || []);
        }).catch(err => console.error("Initializer Error:", err));
    }, []);

    const fetchLedger = useCallback(async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams({
                order_no: filters.orderNo,
                process: filters.process,
                fromDate: filters.fromDate,
                toDate: filters.toDate,
                fabric: filters.fabric,
                color: filters.color,
                dia: filters.dia,
                groupByFabric: filters.showFabric,
                groupByColor: filters.showColor,
                groupByDia: filters.showDia
            }).toString();

            const res = await axios.get(`${API}/erp-reports/order-status-ledger?${query}`);
            setData(res.data || []);
        } catch (err) {
            console.error("Ledger Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchLedger();
    }, [fetchLedger]);

    const handleFilterChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handlePrint = () => window.print();

    // The backend now provides sort_order, but we can double check on frontend
    const sortedData = [...data].sort((a, b) => {
        const orderA = a.sort_order ?? processes.find(p => p.process_name?.toLowerCase().trim() === a.process?.toLowerCase().trim())?.sort_order ?? 999;
        const orderB = b.sort_order ?? processes.find(p => p.process_name?.toLowerCase().trim() === b.process?.toLowerCase().trim())?.sort_order ?? 999;

        if (orderA !== orderB) return orderA - orderB;
        if (a.order_no !== b.order_no) return a.order_no.localeCompare(b.order_no);
        return a.company_name?.localeCompare(b.company_name || "");
    });

    return (
        <div className="container-fluid py-4 min-vh-100 bg-white">
            <style>{`
                @media print { 
                    .no-print { display: none !important; } 
                    body { background: white !important; margin: 0; padding: 0; }
                    .report-card { box-shadow: none !important; border: 1px solid #000 !important; border-radius: 0 !important; }
                    .ledger-table th { background-color: #f0f0f0 !important; color: #000 !important; border: 1px solid #000 !important; font-size: 0.8rem !important; }
                    .ledger-table td { border: 1px solid #000 !important; font-size: 0.75rem !important; }
                    .container-fluid { padding: 0 !important; }
                }
                .report-card { border-radius: 12px; border: 1px solid #eef2f6; box-shadow: 0 10px 30px rgba(0,0,0,0.04); background: white; margin-bottom: 25px; }
                .ledger-table thead th { background: #1e293b !important; color: #f8fafc !important; font-size: 0.75rem; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; padding: 12px 8px; border: none; text-align: center; }
                .ledger-table tbody td { font-size: 0.85rem; padding: 10px 8px; vertical-align: middle; border-bottom: 1px solid #f1f5f9; color: #334155; }
                .filter-label { font-size: 0.7rem; color: #64748b; font-weight: 700; margin-bottom: 4px; text-transform: uppercase; }
                .process-text { font-weight: 700; color: #0f172a; text-transform: capitalize; }
                .val-cell { font-family: 'Inter', sans-serif; font-weight: 700; }
                .balance-cell { background-color: #f8fafc; font-weight: 800; color: #0f172a; }
                .status-badge { font-size: 0.7rem; font-weight: 800; padding: 4px 8px; border-radius: 4px; letter-spacing: 0.5px; }
                .btn-download { background: #fff; border: 1.5px solid #e2e8f0; padding: 8px 16px; border-radius: 8px; font-weight: 700; font-size: 0.8rem; display: flex; align-items: center; gap: 8px; color: #475569; transition: all 0.2s; }
                .btn-download:hover { background: #f8fafc; border-color: #cbd5e1; transform: translateY(-1px); }
                .check-group { display: flex; align-items: center; gap: 15px; background: #f8fafc; padding: 10px 20px; border-radius: 10px; margin-top: 15px; border: 1px dashed #cbd5e1; }
                .form-check-label { font-size: 0.75rem; font-weight: 700; color: #475569; cursor: pointer; }
            `}</style>

            <div className="d-flex justify-content-between align-items-center mb-4 px-3 no-print">
                <div>
                    <h1 className="fw-extrabold text-slate-900 mb-1" style={{ fontSize: '1.8rem', letterSpacing: '-0.025em' }}>Order Status Ledger Report</h1>
                    <p className="text-slate-500 fw-medium mb-0">Consolidated Production flow per process with Fabric/Color details</p>
                </div>
                <div className="d-flex gap-3">
                    <button className="btn-download" onClick={handlePrint}>
                        <i className="bi bi-printer-fill"></i> PRINT REPORT
                    </button>
                    <button className="btn btn-outline-primary fw-bold px-3 py-2" onClick={fetchLedger}>
                        <i className="bi bi-arrow-repeat me-2"></i> REFRESH
                    </button>
                </div>
            </div>

            {/* FILTER BAR */}
            <div className="report-card p-4 no-print border-top border-4 border-primary">
                <div className="row g-3">
                    <div className="col-md-2">
                        <label className="filter-label">Job Order</label>
                        <select className="form-select" name="orderNo" value={filters.orderNo} onChange={handleFilterChange}>
                            <option value="">— All Orders —</option>
                            {orders.map(o => <option key={o.order_no} value={o.order_no}>{o.order_name} ({o.order_no})</option>)}
                        </select>
                    </div>
                    <div className="col-md-2">
                        <label className="filter-label">Process</label>
                        <select className="form-select" name="process" value={filters.process} onChange={handleFilterChange}>
                            <option value="">— All Stages —</option>
                            {processes.map(p => <option key={p.id} value={p.process_name}>{p.process_name}</option>)}
                        </select>
                    </div>
                    <div className="col-md-2">
                        <label className="filter-label">Fabric</label>
                        <input type="text" className="form-control" name="fabric" value={filters.fabric} onChange={handleFilterChange} placeholder="Search Fabric..." />
                    </div>
                    <div className="col-md-2">
                        <label className="filter-label">Color</label>
                        <input type="text" className="form-control" name="color" value={filters.color} onChange={handleFilterChange} placeholder="Search Color..." />
                    </div>
                    <div className="col-md-1">
                        <label className="filter-label">Dia</label>
                        <input type="text" className="form-control" name="dia" value={filters.dia} onChange={handleFilterChange} placeholder="Dia..." />
                    </div>
                    <div className="col-md-3">
                        <label className="filter-label">Dates</label>
                        <div className="input-group">
                            <input type="date" className="form-control" name="fromDate" value={filters.fromDate} onChange={handleFilterChange} />
                            <input type="date" className="form-control" name="toDate" value={filters.toDate} onChange={handleFilterChange} />
                        </div>
                    </div>
                </div>

                <div className="check-group">
                    <span className="filter-label mb-0 me-2">Detailed View (Show Columns):</span>
                    <div className="form-check form-switch">
                        <input className="form-check-input" type="checkbox" name="showFabric" id="showFabric" checked={filters.showFabric} onChange={handleFilterChange} />
                        <label className="form-check-label" htmlFor="showFabric">Fabric Name</label>
                    </div>
                    <div className="form-check form-switch">
                        <input className="form-check-input" type="checkbox" name="showColor" id="showColor" checked={filters.showColor} onChange={handleFilterChange} />
                        <label className="form-check-label" htmlFor="showColor">Colors</label>
                    </div>
                    <div className="form-check form-switch">
                        <input className="form-check-input" type="checkbox" name="showDia" id="showDia" checked={filters.showDia} onChange={handleFilterChange} />
                        <label className="form-check-label" htmlFor="showDia">Dia</label>
                    </div>
                </div>
            </div>

            {/* TABLE AREA */}
            <div className="report-card overflow-hidden">
                <div className="table-responsive">
                    <table className="table mb-0 ledger-table">
                        <thead>
                            <tr>
                                <th style={{ width: '5%' }}>Order</th>
                                <th style={{ width: '10%' }}>Style</th>
                                <th style={{ width: '10%' }}>Party</th>
                                <th style={{ width: '10%', textAlign: 'left' }}>Process</th>
                                {filters.showFabric && <th style={{ width: '10%' }}>Fabric Name</th>}
                                {filters.showColor && <th style={{ width: '10%' }}>Item Color</th>}
                                {filters.showColor && <th style={{ width: '10%' }}>Style Color</th>}
                                {filters.showDia && <th style={{ width: '5%' }}>Dia</th>}
                                <th style={{ width: '4%', textAlign: 'center' }}>UOM</th>
                                <th style={{ width: '8%', textAlign: 'right' }}>Total Out</th>
                                <th style={{ width: '10%', textAlign: 'right' }}>Total In</th>
                                <th style={{ width: '8%', textAlign: 'right' }}>Total Ret</th>
                                <th style={{ width: '8%', textAlign: 'right' }}>Balance</th>
                                <th style={{ width: '2%', textAlign: 'center' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={20} className="text-center py-5">
                                        <div className="spinner-grow text-primary"></div>
                                    </td>
                                </tr>
                            ) : sortedData.length > 0 ? (
                                sortedData.map((row, i) => {
                                    const bal = parseFloat(row.balance || 0);
                                    const isCutting = row.process?.toLowerCase().trim().includes("cutting");

                                    return (
                                        <tr key={i}>
                                            <td className="fw-bold text-slate-900">{row.order_no}</td>
                                            <td className="text-uppercase fw-semibold">{row.order_name}</td>
                                            <td className="text-slate-500">{row.company_name || "-"}</td>
                                            <td className="process-text">{row.process}</td>
                                            {filters.showFabric && <td><span className="small fw-medium">{row.single_fabric || row.fabrics || "-"}</span></td>}
                                            {filters.showColor && <td><span className="small fw-medium">{row.single_color || row.colors || "-"}</span></td>}
                                            {filters.showColor && <td><span className="small fw-medium">{row.single_style_color || row.style_colors || "-"}</span></td>}
                                            {filters.showDia && <td className="text-center"><span className="small fw-medium">{row.single_dia || row.dias || "-"}</span></td>}
                                            <td className="text-center">
                                                <span className={`fw-bold ${row.uom === 'KG' ? 'text-info' : 'text-warning'}`} style={{ fontSize: '0.75rem' }}>{row.uom}</span>
                                            </td>
                                            <td className="text-end val-cell text-primary">
                                                {parseFloat(row.total_outward || 0).toFixed(3)}
                                            </td>
                                            <td className="text-end val-cell text-success">
                                                {isCutting ? (
                                                    <div className="d-flex flex-column">
                                                        <span>{parseFloat(row.total_inward || 0).toFixed(3)} PCS</span>
                                                        <span className="small text-muted fw-normal" style={{ fontSize: '0.65rem' }}>
                                                            {parseFloat(row.total_inward_weight || 0).toFixed(3)} KG
                                                        </span>
                                                    </div>
                                                ) : (
                                                    parseFloat(row.total_inward || 0).toFixed(3)
                                                )}
                                            </td>
                                            <td className="text-end val-cell text-danger">{parseFloat(row.total_return || 0).toFixed(3)}</td>
                                            <td className="text-end val-cell balance-cell">{bal.toFixed(3)}</td>
                                            <td className="text-center">
                                                <span className={`status-badge ${bal <= 0.001 ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'}`}>
                                                    {bal <= 0.001 ? 'CLOSED' : 'OPEN'}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={20} className="text-center py-5 text-slate-400 fw-medium">
                                        No transactions found for the selection.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
