import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import html2pdf from 'html2pdf.js';

const API = process.env.REACT_APP_API_URL;
const fmt = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

/* ─── Print Modal ─────────────────────────────────────────────────────────── */
function PrintModal({ rec, items, onClose }) {
    const [company, setCompany] = React.useState({});
    React.useEffect(() => {
        fetch(`${API}/company-profile`).then(r => r.json()).then(d => setCompany(d || {})).catch(() => { });
    }, []);
    if (!rec) return null;

    const totalPcs = (items || []).reduce((s, it) => s + (parseInt(it.pcs, 10) || 0), 0);

    const logoUrl = company.logo ? `${API}/uploads/${company.logo}` : null;

    const downloadPDF = () => {
        const element = document.getElementById('pcs-print-content');
        const opt = {
            margin: 0,
            filename: `Pcs-Return-${rec.return_no || rec.id}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        html2pdf().from(element).set(opt).save();
    };

    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
            <style>{`
                .yd-print-root { animation: slideUp 0.15s ease-out; }
                @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                
                @media print {
                    body * { visibility: hidden !important; }
                    .yd-print-root, .yd-print-root * { visibility: visible !important; }
                    .yd-print-root { 
                        position: fixed !important; 
                        top: 0 !important; 
                        left: 0 !important; 
                        width: 100% !important; 
                        height: auto !important; 
                        margin: 0 !important; 
                        padding: 0 !important; 
                        background: #fff !important; 
                        z-index: 99999 !important; 
                        box-shadow: none !important;
                    }
                    .yd-no-print { display: none !important; }
                    @page { size: A4 portrait; margin: 0; }
                }
            `}</style>

            <div className="yd-print-root bg-white rounded-4 shadow-lg" style={{ width: "100%", maxWidth: "840px", maxHeight: "95vh", overflowY: "auto", display: "flex", flexDirection: "column" }}>

                {/* Toolbar */}
                <div className="yd-no-print d-flex align-items-center justify-content-between px-4 py-3 border-bottom sticky-top bg-white rounded-top-4" style={{ zIndex: 10 }}>
                    <div className="d-flex align-items-center gap-2">
                        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#dc3545", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <i className="bi bi-printer text-white"></i>
                        </div>
                        <div>
                            <div className="fw-bold small">Print Preview</div>
                            <div className="text-muted" style={{ fontSize: "0.65rem" }}>Professional Pcs Return</div>
                        </div>
                    </div>
                    <div className="d-flex gap-2">
                        <button className="btn btn-primary rounded-pill px-4 btn-sm fw-bold" onClick={downloadPDF}>
                            <i className="bi bi-file-earmark-pdf me-1"></i>Download PDF
                        </button>
                        <button className="btn btn-dark rounded-pill px-3 btn-sm fw-bold" onClick={() => window.print()}>
                            <i className="bi bi-printer me-1"></i>Print
                        </button>
                        <button className="btn btn-outline-secondary rounded-pill px-3 btn-sm" onClick={onClose}>
                            <i className="bi bi-x-lg me-1"></i>Close
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div id="pcs-print-content" style={{ padding: "40px", fontFamily: "'Inter', 'Segoe UI', sans-serif", color: "#000", background: "#fff" }}>

                    {/* Header */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "30px" }}>
                        <div style={{ display: "flex", gap: "20px" }}>
                            {logoUrl ? (
                                <img src={logoUrl} alt="logo" style={{ height: "60px", width: "60px", objectFit: "contain" }} />
                            ) : (
                                <div style={{ width: 60, height: 60, background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #ddd" }}>
                                    <span style={{ fontWeight: 800, fontSize: "10px" }}>LOGO</span>
                                </div>
                            )}
                            <div>
                                <div style={{ fontSize: "22px", fontWeight: "900", letterSpacing: "-0.5px", textTransform: "uppercase" }}>{company.company_name || "SUPER LABS ERP"}</div>
                                <div style={{ fontSize: "10px", lineHeight: "1.4", color: "#4b5563", maxWidth: "250px", marginTop: "4px" }}>
                                    {company.address && <div>{company.address}</div>}
                                    {company.city} {company.state} {company.pincode}<br />
                                    {company.phone && <span>Ph: {company.phone} </span>}
                                    {company.email && <span>Email: {company.email}</span>}
                                </div>
                            </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: "12px", color: "#9ca3af", textTransform: "uppercase", fontWeight: "700", marginBottom: "4px" }}>Jobwork Return Note</div>
                            <div style={{ fontSize: "32px", fontWeight: "900", color: "#dc3545", lineHeight: "1" }}>PCS RETURN</div>
                            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "15px" }}>
                                <div style={{ padding: "6px 12px", background: "#f9fafb", borderRadius: "8px", textAlign: "center", border: "1px solid #f3f4f6" }}>
                                    <div style={{ fontSize: "9px", color: "#6b7280", fontWeight: "600", textTransform: "uppercase" }}>Number</div>
                                    <div style={{ fontSize: "12px", fontWeight: "700" }}>{rec.return_no || rec.id}</div>
                                </div>
                                <div style={{ padding: "6px 12px", background: "#f9fafb", borderRadius: "8px", textAlign: "center", border: "1px solid #f3f4f6" }}>
                                    <div style={{ fontSize: "9px", color: "#6b7280", fontWeight: "600", textTransform: "uppercase" }}>Date</div>
                                    <div style={{ fontSize: "12px", fontWeight: "700" }}>{fmt(rec.return_date)}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px", marginBottom: "30px", padding: "15px", background: "#fafafa", borderRadius: "12px" }}>
                        <div>
                            <div style={{ fontSize: "10px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase", marginBottom: "8px" }}>Returned By (Supplier)</div>
                            <div style={{ fontSize: "14px", fontWeight: "700" }}>{rec.party_name}</div>
                            {rec.ref_no && <div style={{ fontSize: "11px", marginTop: "4px", color: "#4b5563" }}>Ref: {rec.ref_no}</div>}
                        </div>
                        <div>
                            <div style={{ fontSize: "10px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase", marginBottom: "8px" }}>Order Information</div>
                            <div style={{ fontSize: "14px", fontWeight: "700" }}>{rec.order_no}</div>
                            <div style={{ fontSize: "11px", color: "#4b5563" }}>{rec.order_name}</div>
                            <div style={{ fontSize: "12px", fontWeight: "700", marginTop: "8px", color: "#dc3545" }}>Process: {rec.process}</div>
                        </div>
                    </div>

                    <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
                        <thead>
                            <tr style={{ background: "#dc3545", color: "#fff" }}>
                                <th style={{ padding: "10px 15px", textAlign: "center", fontSize: "11px", fontWeight: "700", border: "1px solid #dc3545" }}>#</th>
                                <th style={{ padding: "10px 15px", textAlign: "left", fontSize: "11px", fontWeight: "700", border: "1px solid #dc3545" }}>STYLE NAME</th>
                                <th style={{ padding: "10px 15px", textAlign: "center", fontSize: "11px", fontWeight: "700", border: "1px solid #dc3545" }}>COLOR</th>
                                <th style={{ padding: "10px 15px", textAlign: "center", fontSize: "11px", fontWeight: "700", border: "1px solid #dc3545" }}>SIZE</th>
                                <th style={{ padding: "10px 15px", textAlign: "right", fontSize: "11px", fontWeight: "700", border: "1px solid #dc3545" }}>PCS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(() => {
                                let rowIdx = 1;
                                return items.flatMap((it, i) => {
                                    const szData = it.sizes_data ? (typeof it.sizes_data === 'string' ? JSON.parse(it.sizes_data) : it.sizes_data) : {};
                                    const sizeEntries = Object.entries(szData).filter(([sz, qty]) => parseFloat(qty) > 0);

                                    if (sizeEntries.length > 0) {
                                        return sizeEntries.map(([sz, qty], sIdx) => (
                                            <tr key={`${i}-${sIdx}`}>
                                                <td style={{ padding: "8px 15px", textAlign: "center", fontSize: "11px", border: "1px solid #e5e7eb" }}>{rowIdx++}</td>
                                                <td style={{ padding: "8px 15px", textAlign: "left", fontSize: "11px", fontWeight: "600", border: "1px solid #e5e7eb" }}>{it.item_name}</td>
                                                <td style={{ padding: "8px 15px", textAlign: "center", fontSize: "11px", border: "1px solid #e5e7eb" }}>{it.color || "—"}</td>
                                                <td style={{ padding: "8px 15px", textAlign: "center", fontSize: "11px", border: "1px solid #e5e7eb" }}>{sz}</td>
                                                <td style={{ padding: "8px 15px", textAlign: "right", fontSize: "11px", fontWeight: "700", border: "1px solid #e5e7eb" }}>{qty}</td>
                                            </tr>
                                        ));
                                    }

                                    return (
                                        <tr key={i}>
                                            <td style={{ padding: "8px 15px", textAlign: "center", fontSize: "11px", border: "1px solid #e5e7eb" }}>{rowIdx++}</td>
                                            <td style={{ padding: "8px 15px", textAlign: "left", fontSize: "11px", fontWeight: "600", border: "1px solid #e5e7eb" }}>{it.item_name}</td>
                                            <td style={{ padding: "8px 15px", textAlign: "center", fontSize: "11px", border: "1px solid #e5e7eb" }}>{it.color || "—"}</td>
                                            <td style={{ padding: "8px 15px", textAlign: "center", fontSize: "11px", border: "1px solid #e5e7eb" }}>{it.size || "—"}</td>
                                            <td style={{ padding: "8px 15px", textAlign: "right", fontSize: "11px", fontWeight: "700", border: "1px solid #e5e7eb" }}>{it.pcs}</td>
                                        </tr>
                                    );
                                });
                            })()}
                        </tbody>
                        <tfoot>
                            <tr style={{ background: "#f9fafb" }}>
                                <td colSpan="4" style={{ padding: "10px 15px", textAlign: "right", fontSize: "11px", fontWeight: "800", border: "1px solid #e5e7eb" }}>TOTAL PCS</td>
                                <td style={{ padding: "10px 15px", textAlign: "right", fontSize: "11px", fontWeight: "900", border: "1px solid #e5e7eb", color: "#dc3545" }}>{totalPcs}</td>
                            </tr>
                        </tfoot>
                    </table>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "40px" }}>
                        <div>
                            <div style={{ fontSize: "10px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase", marginBottom: "8px" }}>Remarks</div>
                            <div style={{ fontSize: "11px", padding: "10px", border: "1px dashed #ddd", borderRadius: "8px", minHeight: "60px", color: "#4b5563" }}>
                                {rec.remarks || "No additional remarks."}
                            </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                            <div>
                                <div style={{ fontSize: "10px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase", marginBottom: "8px" }}>Staff Details</div>
                                <div style={{ fontSize: "12px", fontWeight: "600" }}>{rec.staff_name || "—"}</div>
                                <div style={{ fontSize: "10px", fontStyle: "italic", color: "#6b7280" }}>{rec.staff_remarks}</div>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: "40px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                        <div style={{ textAlign: "center" }}>
                            <div style={{ width: "120px", borderTop: "1px solid #000", marginTop: "60px" }}></div>
                            <div style={{ fontSize: "10px", fontWeight: "700", marginTop: "5px" }}>Receiver's Signature</div>
                        </div>
                        <div style={{ textAlign: "center" }}>
                            <div style={{ fontSize: "10px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase", marginBottom: "40px" }}>For {company.company_name || "SUPER LABS ERP"}</div>
                            <div style={{ width: "120px", borderTop: "1px solid #000", margin: "0 auto" }}></div>
                            <div style={{ fontSize: "10px", fontWeight: "700", marginTop: "5px" }}>Authorised Signatory</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ─── Main Component ──────────────────────────────────────────────────────── */
export default function OrderJobworkPcsReturnList() {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState({ supplier: "", return_no: "", order_no: "" });
    const [selectedIds, setSelectedIds] = useState([]);
    const [activeRec, setActiveRec] = useState(null);
    const [activeItems, setActiveItems] = useState([]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API}/pcs-return`);
            setData(res.data || []);
        } catch { } finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const filtered = useMemo(() => {
        return data.filter(r => (
            (r.party_name?.toLowerCase().includes(searchTerm.supplier.toLowerCase()) || r.contractor_name?.toLowerCase().includes(searchTerm.supplier.toLowerCase())) &&
            r.return_no?.toLowerCase().includes(searchTerm.return_no.toLowerCase()) &&
            r.order_no?.toLowerCase().includes(searchTerm.order_no.toLowerCase())
        ));
    }, [data, searchTerm]);

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this record?")) return;
        try {
            await axios.delete(`${API}/pcs-return/${id}`);
            setData(p => p.filter(r => r.id !== id));
        } catch { alert("Failed to delete."); }
    };

    const handleBulkDelete = async () => {
        if (!window.confirm(`Delete ${selectedIds.length} records?`)) return;
        try {
            await axios.delete(`${API}/pcs-return/bulk`, { data: { ids: selectedIds } });
            setData(p => p.filter(r => !selectedIds.includes(r.id)));
            setSelectedIds([]);
        } catch { alert("Bulk delete failed."); }
    };

    const toggleSelect = (id) => setSelectedIds(p => p.includes(id) ? p.filter(i => i !== id) : [...p, id]);
    const toggleAll = () => setSelectedIds(selectedIds.length === filtered.length ? [] : filtered.map(r => r.id));

    const handlePrint = async (r) => {
        try {
            const res = await axios.get(`${API}/pcs-return/${r.id}`);
            setActiveRec(res.data);
            setActiveItems(res.data.items || []);
        } catch { alert("Failed to load details."); }
    };

    return (
        <div className="container-fluid py-4 min-vh-100 bg-light px-3 px-md-4">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
                
                :root {
                    --erp-font-main: 'Inter', -apple-system, sans-serif;
                }

                .container-fluid {
                    font-family: var(--erp-font-main) !important;
                }

                .fw-900 { fontWeight: 900 !important; }
                .ls-1 { letter-spacing: -0.5px; }

                .card { 
                    border: none !important; 
                    box-shadow: 0 10px 30px rgba(0,0,0,0.04) !important;
                    border-radius: 16px !important;
                }

                .table thead th {
                    background-color: #f8fafc !important;
                    text-transform: uppercase !important;
                    font-size: 0.65rem !important;
                    letter-spacing: 0.05em !important;
                    font-weight: 700 !important;
                    color: #64748b !important;
                    padding: 12px 16px !important;
                    border-bottom: 1px solid #e2e8f0 !important;
                }

                .table tbody td {
                    padding: 16px !important;
                    font-size: 0.85rem !important;
                    color: #1e293b !important;
                    border-bottom: 1px solid #f1f5f9 !important;
                }

                .btn-premium {
                    padding: 8px 20px !important;
                    border-radius: 12px !important;
                    font-weight: 600 !important;
                    font-size: 0.85rem !important;
                    transition: all 0.2s ease;
                }

                .btn-premium:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                }

                .form-control-premium {
                    background-color: #f8fafc !important;
                    border: 1px solid #e2e8f0 !important;
                    padding: 10px 16px !important;
                    border-radius: 10px !important;
                    font-size: 0.85rem !important;
                }

                .form-control-premium:focus {
                    background-color: #fff !important;
                    border-color: #ef4444 !important;
                    box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1) !important;
                }
            `}</style>

            <div className="mx-auto" style={{ maxWidth: "1400px" }}>
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
                    <div>
                        <div className="d-flex align-items-center gap-2 mb-1">
                            <span className="badge bg-danger rounded-pill px-3 py-2 text-white" style={{ fontSize: "0.65rem", letterSpacing: "0.05em", background: "#ef4444" }}>ORDER JOBWORK</span>
                            <span className="badge bg-white text-muted border rounded-pill px-3 py-2" style={{ fontSize: "0.65rem" }}>{filtered.length} RECORDS</span>
                        </div>
                        <h2 className="fw-900 mb-0 ls-1 text-dark" style={{ fontSize: "1.75rem" }}>Pcs <span className="text-danger">Return</span> List</h2>
                    </div>
                    <div className="d-flex gap-2">
                        <button className="btn btn-white btn-premium shadow-sm border" onClick={fetchData}>
                            <i className="bi bi-arrow-clockwise me-2"></i>Refresh
                        </button>
                        <button className="btn btn-danger btn-premium shadow-sm fw-bold" style={{ background: "#ef4444", borderColor: "#ef4444" }} onClick={() => navigate("/order-jobwork-pcs-return")}>
                            <i className="bi bi-plus-lg me-2"></i>New Job Return
                        </button>
                    </div>
                </div>

                <div className="card mb-4 overflow-hidden">
                    <div className="card-body p-4 bg-white border-bottom">
                        <div className="row g-3">
                            <div className="col-md-4">
                                <label className="form-label small fw-bold text-muted mb-2 text-uppercase ls-1" style={{ fontSize: '0.65rem' }}>Supplier / Party</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-light border-0"><i className="bi bi-search text-muted"></i></span>
                                    <input type="text" className="form-control form-control-premium" placeholder="Filter by Supplier..." value={searchTerm.supplier} onChange={e => setSearchTerm(p => ({ ...p, supplier: e.target.value }))} />
                                </div>
                            </div>
                            <div className="col-md-4">
                                <label className="form-label small fw-bold text-muted mb-2 text-uppercase ls-1" style={{ fontSize: '0.65rem' }}>Return Number</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-light border-0"><i className="bi bi-hash text-muted"></i></span>
                                    <input type="text" className="form-control form-control-premium" placeholder="Filter by Return No..." value={searchTerm.return_no} onChange={e => setSearchTerm(p => ({ ...p, return_no: e.target.value }))} />
                                </div>
                            </div>
                            <div className="col-md-4">
                                <label className="form-label small fw-bold text-muted mb-2 text-uppercase ls-1" style={{ fontSize: '0.65rem' }}>Order Information</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-light border-0"><i className="bi bi-journal-text text-muted"></i></span>
                                    <input type="text" className="form-control form-control-premium" placeholder="Filter by Order No..." value={searchTerm.order_no} onChange={e => setSearchTerm(p => ({ ...p, order_no: e.target.value }))} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead>
                                <tr>
                                    <th className="ps-4" style={{ width: "40px" }}>
                                        <input type="checkbox" className="form-check-input" checked={selectedIds.length > 0 && selectedIds.length === filtered.length} onChange={toggleAll} />
                                    </th>
                                    <th>DATE</th>
                                    <th>RETURN NO.</th>
                                    <th>ORDER DETAILS</th>
                                    <th>SUPPLIER / PARTY</th>
                                    <th>PROCESS</th>
                                    <th className="text-center">TOTAL PCS</th>
                                    <th className="text-end pe-4">ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody className="border-top-0">
                                {loading ? (
                                    <tr><td colSpan="8" className="text-center py-5"><div className="spinner-border spinner-border-sm text-danger"></div></td></tr>
                                ) : filtered.length === 0 ? (
                                    <tr><td colSpan="8" className="text-center py-5">
                                        <div className="text-muted py-4">
                                            <i className="bi bi-inbox fs-1 d-block mb-2 opacity-25"></i>
                                            <div className="fw-medium">No records found matching filters</div>
                                        </div>
                                    </td></tr>
                                ) : filtered.map(r => (
                                    <tr key={r.id}>
                                        <td className="ps-4">
                                            <input type="checkbox" className="form-check-input mt-0" checked={selectedIds.includes(r.id)} onChange={() => toggleSelect(r.id)} />
                                        </td>
                                        <td className="fw-medium text-dark">{fmt(r.return_date)}</td>
                                        <td>
                                            <span className="badge rounded-pill px-3 py-2 fw-bold" style={{ background: "#fef2f2", color: "#dc2626", fontSize: '0.75rem' }}>
                                                {r.return_no}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="fw-bold text-dark">{r.order_no}</div>
                                            <div className="text-muted small" style={{ fontSize: '0.7rem' }}>{r.order_name}</div>
                                        </td>
                                        <td>
                                            <div className="fw-semibold text-dark">
                                                {r.work_type === "Contractor" ? (r.contractor_name || "—") : (r.party_name || "—")}
                                            </div>
                                            <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                                                {r.work_type === "Contractor" ? <span className="text-danger fw-bold text-uppercase">Contractor</span> : "JOBWORK"}
                                            </div>
                                        </td>
                                        <td>
                                            <span className="badge bg-light text-dark fw-bold border rounded-pill px-3" style={{ fontSize: '0.7rem' }}>
                                                {r.process}
                                            </span>
                                        </td>
                                        <td className="text-center">
                                            <div className="fw-800 text-dark fs-6" style={{ fontWeight: 800 }}>{r.total_pcs}</div>
                                        </td>
                                        <td className="text-end pe-4">
                                            <div className="d-flex justify-content-end gap-2">
                                                <button className="btn btn-sm btn-light rounded-circle border-0 action-btn p-0"
                                                    style={{ width: 32, height: 32, background: '#f8fafc' }} onClick={() => handlePrint(r)} title="Print">
                                                    <i className="bi bi-printer text-dark" style={{ fontSize: '0.85rem' }}></i>
                                                </button>
                                                <button className="btn btn-sm btn-light rounded-circle border-0 action-btn p-0"
                                                    style={{ width: 32, height: 32, background: '#fff1f2' }} onClick={() => navigate(`/edit-order-jobwork-pcs-return/${r.id}`)} title="Edit">
                                                    <i className="bi bi-pencil text-primary" style={{ fontSize: '0.85rem' }}></i>
                                                </button>
                                                <button className="btn btn-sm btn-light rounded-circle border-0 action-btn p-0"
                                                    style={{ width: 32, height: 32, background: '#fff1f2' }} onClick={() => handleDelete(r.id)} title="Delete">
                                                    <i className="bi bi-trash text-danger" style={{ fontSize: '0.85rem' }}></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {selectedIds.length > 0 && (
                        <div className="bg-dark text-white p-3 d-flex align-items-center justify-content-between">
                            <div className="small fw-bold px-3">{selectedIds.length} records selected</div>
                            <button className="btn btn-danger btn-premium py-2" onClick={handleBulkDelete}>Delete Selected Records</button>
                        </div>
                    )}
                </div>
            </div>

            <PrintModal rec={activeRec} items={activeItems} onClose={() => setActiveRec(null)} />
        </div>
    );
}
