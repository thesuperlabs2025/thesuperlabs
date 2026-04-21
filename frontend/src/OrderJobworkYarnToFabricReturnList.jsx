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

    const totalQty = (items || []).reduce((s, it) => s + (parseFloat(it.qty) || 0), 0);
    const logoUrl = company.logo ? `${API}/uploads/${company.logo}` : null;

    const downloadPDF = () => {
        const element = document.getElementById('ydr-print-content');
        const opt = {
            margin: 0,
            filename: `Order-Return-${rec.return_no || rec.id}.pdf`,
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
                    .print-black-header { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; background-color: #000 !important; color: #fff !important; }
                    @page { size: A4 portrait; margin: 0; }
                }
            `}</style>

            <div className="yd-print-root bg-white rounded-4 shadow-lg" style={{ width: "100%", maxWidth: "840px", maxHeight: "95vh", overflowY: "auto", display: "flex", flexDirection: "column" }}>

                {/* Toolbar */}
                <div className="yd-no-print d-flex align-items-center justify-content-between px-4 py-3 border-bottom sticky-top bg-white rounded-top-4" style={{ zIndex: 10 }}>
                    <div className="d-flex align-items-center gap-2">
                        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#dc2626", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <i className="bi bi-box-arrow-left text-white"></i>
                        </div>
                        <div>
                            <div className="fw-bold small">Return Preview</div>
                            <div className="text-muted" style={{ fontSize: "0.65rem" }}>Professional Yarn Dyeing Return</div>
                        </div>
                    </div>
                    <div className="d-flex gap-2">
                        <button className="btn btn-danger rounded-pill px-4 btn-sm fw-bold" onClick={downloadPDF}>
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
                <div id="ydr-print-content" style={{ padding: "40px", fontFamily: "'Inter', 'Segoe UI', sans-serif", color: "#000", background: "#fff" }}>

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
                                <div style={{ fontSize: "22px", fontWeight: "900", letterSpacing: "-0.5px", textTransform: "uppercase" }}>{company.company_name || "Company Name"}</div>
                                <div style={{ fontSize: "11px", color: "#4b5563", lineHeight: "1.5", marginTop: "4px" }}>
                                    {company.address && <div>{company.address}, {company.pincode}</div>}
                                    {company.gst_no && <div>GSTIN: <strong>{company.gst_no}</strong></div>}
                                    {company.mobile && <div>Mobile: <strong>{company.mobile}</strong></div>}
                                </div>
                            </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: "22px", fontWeight: "900", letterSpacing: "1px", textTransform: "uppercase", color: "#dc2626" }}>JOBWORK RETURN</div>
                            <div style={{ fontSize: "16px", fontWeight: "800", marginTop: "5px" }}>{rec.return_no || `#${rec.id}`}</div>
                            <div style={{ fontSize: "12px", color: "#4b5563", marginTop: "2px" }}>Date: <strong>{fmt(rec.return_date)}</strong></div>
                        </div>
                    </div>

                    {/* Info Boxes */}
                    <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
                        <div style={{ flex: 1, border: "1.5px solid #000" }}>
                            <div className="print-black-header" style={{ background: "#000", color: "#fff", padding: "6px 15px", fontSize: "11px", fontWeight: "800", textTransform: "uppercase" }}>RETURN TO</div>
                            <div style={{ padding: "12px 15px", fontSize: "11px", lineHeight: "1.8" }}>
                                <div style={{ display: "flex" }}><span style={{ width: "90px", fontWeight: "700" }}>Supplier:</span> <span>{rec.party_name || "—"}</span></div>
                                <div style={{ display: "flex" }}><span style={{ width: "90px", fontWeight: "700" }}>Order No:</span> <span>{rec.order_no || "—"}</span></div>
                                <div style={{ display: "flex" }}><span style={{ width: "90px", fontWeight: "700" }}>Order Name:</span> <span>{rec.order_name || "—"}</span></div>
                            </div>
                        </div>
                        <div style={{ flex: 1, border: "1.5px solid #000" }}>
                            <div className="print-black-header" style={{ background: "#000", color: "#fff", padding: "6px 15px", fontSize: "11px", fontWeight: "800", textTransform: "uppercase" }}>RETURN DETAILS</div>
                            <div style={{ padding: "12px 15px", fontSize: "11px", lineHeight: "1.8" }}>
                                <div style={{ display: "flex" }}><span style={{ width: "110px", fontWeight: "700" }}>Ref / DC No:</span> <span>{rec.ref_no || "—"}</span></div>
                                <div style={{ display: "flex" }}><span style={{ width: "110px", fontWeight: "700" }}>Process:</span> <span>{rec.process || "Yarn Dyeing"}</span></div>
                                <div style={{ display: "flex" }}><span style={{ width: "110px", fontWeight: "700" }}>Staff:</span> <span>{rec.staff_name || "—"}</span></div>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div style={{ border: "1.5px solid #000", marginBottom: "20px", borderRadius: "0" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr className="print-black-header" style={{ background: "#000", color: "#fff" }}>
                                    <th style={{ padding: "8px 10px", fontSize: "10px", textTransform: "uppercase", textAlign: "center", borderRight: "1.5px solid #fff", width: "5%" }}>#</th>
                                    <th style={{ padding: "8px 10px", fontSize: "10px", textTransform: "uppercase", textAlign: "left", borderRight: "1.5px solid #fff", width: "25%" }}>YARN DESCRIPTION</th>
                                    <th style={{ padding: "8px 10px", fontSize: "10px", textTransform: "uppercase", textAlign: "center", borderRight: "1.5px solid #fff", width: "12%" }}>COUNTS</th>
                                    <th style={{ padding: "8px 10px", fontSize: "10px", textTransform: "uppercase", textAlign: "center", borderRight: "1.5px solid #fff", width: "12%" }}>COLOR</th>
                                    {rec.process === "Knitting" && <th style={{ padding: "8px 10px", fontSize: "10px", textTransform: "uppercase", textAlign: "left", borderRight: "1.5px solid #fff", width: "25%" }}>FABRIC NAME</th>}
                                    <th style={{ padding: "8px 10px", fontSize: "10px", textTransform: "uppercase", textAlign: "right", width: "15%" }}>QTY (KG)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(items || []).map((it, i) => (
                                    <tr key={i} style={{ borderBottom: "1.5px solid #000" }}>
                                        <td style={{ padding: "10px", textAlign: "center", fontSize: "11px", borderRight: "1.5px solid #000" }}>{i + 1}</td>
                                        <td style={{ padding: "10px", fontSize: "11px", fontWeight: "600", borderRight: "1.5px solid #000" }}>{it.yarn_name || "—"}</td>
                                        <td style={{ padding: "10px", textAlign: "center", fontSize: "11px", borderRight: "1.5px solid #000" }}>{it.counts || "—"}</td>
                                        <td style={{ padding: "10px", textAlign: "center", fontSize: "11px", borderRight: "1.5px solid #000" }}>{it.color || "—"}</td>
                                        {rec.process === "Knitting" && <td style={{ padding: "10px", fontSize: "11px", borderRight: "1.5px solid #000" }}>{it.fabric_name || "—"}</td>}
                                        <td style={{ padding: "10px", textAlign: "right", fontSize: "11px", fontWeight: "800" }}>{parseFloat(it.qty || 0).toFixed(3)}</td>
                                    </tr>
                                ))}
                                {(!items || items.length === 0) && (
                                    <tr><td colSpan={rec.process === "Knitting" ? 6 : 5} style={{ padding: "30px", textAlign: "center", fontStyle: "italic", color: "#9ca3af" }}>No items records found</td></tr>
                                )}
                            </tbody>
                            <tfoot>
                                <tr style={{ background: "#f9fafb", borderTop: "1.5px solid #000" }}>
                                    <td colSpan={rec.process === "Knitting" ? 5 : 4} style={{ padding: "10px", textAlign: "right", fontSize: "11px", fontWeight: "800", borderRight: "1.5px solid #000" }}>TOTAL QUANTITY:</td>
                                    <td style={{ padding: "10px", textAlign: "right", fontSize: "11px", fontWeight: "900" }}>{totalQty.toFixed(3)} KG</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* Footer */}
                    <div style={{ marginTop: "40px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: "11px", fontWeight: "800", textTransform: "uppercase", marginBottom: "8px" }}>Remarks / Terms:</div>
                            <div style={{ fontSize: "10px", color: "#333", lineHeight: "1.6" }}>
                                {rec.remarks || "No remarks"}
                            </div>
                        </div>
                        <div style={{ textAlign: "center", minWidth: "200px" }}>
                            <div style={{ fontSize: "10px", fontWeight: "800", marginBottom: "40px" }}>For {company.company_name || "Company Name"}</div>
                            <div style={{ borderTop: "1px solid #000", paddingTop: "5px", fontSize: "10px", fontWeight: "700" }}>Authorised Signatory</div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default function OrderJobworkYarnToFabricReturnList() {
    const navigate = useNavigate();
    const today = new Date().toISOString().substring(0, 10);

    const [allRecords, setAllRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(new Set());
    const [filters, setFilters] = useState({ party: "", return_no: "", order_no: "", from_date: "", to_date: today });
    const [printRec, setPrintRec] = useState(null);
    const [printItems, setPrintItems] = useState([]);
    const [itemsMap, setItemsMap] = useState({});

    const fetchData = useCallback(async () => {
        setLoading(true);
        setSelected(new Set());
        try {
            const params = new URLSearchParams({ type: "order", from_date: filters.from_date, to_date: filters.to_date });
            const res = await axios.get(`${API}/yarn-dyeing-return?${params}`);
            setAllRecords(res.data);
        } catch { setAllRecords([]); }
        finally { setLoading(false); }
    }, [filters.from_date, filters.to_date]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const filtered = useMemo(() => {
        return allRecords.filter(r =>
            (r.party_name || "").toLowerCase().includes(filters.party.toLowerCase()) &&
            (r.return_no || "").toLowerCase().includes(filters.return_no.toLowerCase()) &&
            (r.order_no || "").toLowerCase().includes(filters.order_no.toLowerCase())
        );
    }, [allRecords, filters.party, filters.return_no, filters.order_no]);

    const toggleAll = () => {
        if (selected.size === filtered.length) setSelected(new Set());
        else setSelected(new Set(filtered.map(r => r.id)));
    };

    const toggleOne = (id) => {
        const next = new Set(selected);
        if (next.has(id)) next.delete(id); else next.add(id);
        setSelected(next);
    };

    const handleDelete = async () => {
        if (!window.confirm(`Delete ${selected.size} selected records?`)) return;
        try {
            await axios.delete(`${API}/yarn-dyeing-return/bulk`, { data: { ids: Array.from(selected) } });
            fetchData();
        } catch (err) { alert(err.response?.data?.error || "Delete failed"); }
    };

    const openPrint = async (rec) => {
        let items = itemsMap[rec.id];
        if (!items) {
            try {
                const res = await axios.get(`${API}/yarn-dyeing-return/${rec.id}`);
                items = res.data.items || [];
                setItemsMap(p => ({ ...p, [rec.id]: items }));
            } catch { items = []; }
        }
        setPrintRec(rec);
        setPrintItems(items);
    };

    return (
        <div className="container-fluid py-4 px-4 h-100 d-flex flex-column">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
                
                :root {
                    --erp-font-main: 'Inter', -apple-system, sans-serif;
                }

                .container-fluid {
                    font-family: var(--erp-font-main) !important;
                }

                .table thead th {
                    background-color: #7f1d1d !important;
                    color: white !important;
                    font-weight: 600;
                    text-transform: uppercase;
                    font-size: 0.75rem;
                    letter-spacing: 0.05em;
                    padding: 14px 10px;
                }

                .table tbody td {
                    padding: 12px 10px;
                    font-size: 0.95rem;
                    vertical-align: middle;
                }

                .badge-process {
                    font-size: 0.75rem !important;
                    font-weight: 700 !important;
                    padding: 6px 12px !important;
                    text-transform: uppercase;
                    letter-spacing: 0.02em;
                }

                .form-control-sm, .form-select-sm {
                    font-size: 0.9rem !important;
                    padding: 0.5rem 0.75rem;
                    border-radius: 8px;
                }

                .card {
                    border: 1px solid #eaecf0 !important;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.03) !important;
                }
            `}</style>

            {/* Header Section */}
            <div className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom flex-wrap gap-3">
                <div className="d-flex align-items-center gap-3">
                    <div className="bg-danger text-white rounded-4 d-flex align-items-center justify-content-center shadow-sm" style={{ width: "56px", height: "56px" }}>
                        <i className="bi bi-box-arrow-left fs-3"></i>
                    </div>
                    <div>
                        <h4 className="fw-extrabold mb-0 text-dark" style={{ letterSpacing: "-0.02em" }}>Order Yarn to Fabric Return</h4>
                        <div className="text-muted fw-medium small">Manage and track your yarn to fabric returns</div>
                    </div>
                </div>
                <div className="d-flex gap-2">
                    {selected.size > 0 && (
                        <button className="btn btn-outline-danger rounded-pill px-3 btn-sm fw-bold shadow-sm" onClick={handleDelete}>
                            <i className="bi bi-trash me-1"></i>Delete ({selected.size})
                        </button>
                    )}
                    <button className="btn btn-danger rounded-pill px-4 btn-sm fw-bold shadow-sm" onClick={() => navigate("/order-jobwork-yarn-to-fabric-return")}>
                        <i className="bi bi-plus-lg me-1"></i>New Return
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="card border-0 shadow-sm rounded-4 mb-4">
                <div className="card-body p-3">
                    <div className="row g-3 align-items-end">
                        <div className="col-md-2">
                            <label className="form-label fw-bold text-muted small mb-1">FROM DATE</label>
                            <input type="date" className="form-control form-control-sm border-0 bg-light fw-semibold" value={filters.from_date} onChange={e => setFilters(p => ({ ...p, from_date: e.target.value }))} />
                        </div>
                        <div className="col-md-2">
                            <label className="form-label fw-bold text-muted small mb-1">TO DATE</label>
                            <input type="date" className="form-control form-control-sm border-0 bg-light fw-semibold" value={filters.to_date} onChange={e => setFilters(p => ({ ...p, to_date: e.target.value }))} />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label fw-bold text-muted small mb-1">SUPPLIER</label>
                            <input type="text" className="form-control form-control-sm border-0 bg-light" placeholder="Search supplier..." value={filters.party} onChange={e => setFilters(p => ({ ...p, party: e.target.value }))} />
                        </div>
                        <div className="col-md-2">
                            <label className="form-label fw-bold text-muted small mb-1">RETURN NO</label>
                            <input type="text" className="form-control form-control-sm border-0 bg-light" placeholder="Search return..." value={filters.return_no} onChange={e => setFilters(p => ({ ...p, return_no: e.target.value }))} />
                        </div>
                        <div className="col-md-2">
                            <label className="form-label fw-bold text-muted small mb-1">ORDER NO</label>
                            <input type="text" className="form-control form-control-sm border-0 bg-light" placeholder="Search order..." value={filters.order_no} onChange={e => setFilters(p => ({ ...p, order_no: e.target.value }))} />
                        </div>
                        <div className="col-md-1">
                            <button className="btn btn-outline-secondary btn-sm rounded-pill w-100 fw-bold border-0" onClick={() => setFilters({ party: "", return_no: "", order_no: "", from_date: "", to_date: today })}>
                                <i className="bi bi-arrow-counterclockwise me-1"></i>Clear
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* List Table */}
            <div className="card border-0 shadow-sm rounded-4 flex-grow-1 overflow-hidden">
                <div className="table-responsive h-100">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="sticky-top" style={{ zIndex: 1, top: 0 }}>
                            <tr>
                                <th className="ps-4" style={{ width: "40px" }}>
                                    <input type="checkbox" className="form-check-input" checked={filtered.length > 0 && selected.size === filtered.length} onChange={toggleAll} />
                                </th>
                                <th className="py-3">RETURN NO</th>
                                <th className="py-3">PROCESS</th>
                                <th className="py-3">DATE</th>
                                <th className="py-3">SUPPLIER NAME</th>
                                <th className="py-3">ORDER / DC</th>
                                <th className="py-3 text-end">TOTAL QTY</th>
                                <th className="py-3 text-center" style={{ width: "140px" }}>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={8} className="text-center py-5"><div className="spinner-border spinner-border-sm text-danger me-2"></div>Loading records...</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={8} className="text-center py-5 text-muted"><i className="bi bi-inbox fs-2 d-block mb-2"></i>No records found</td></tr>
                            ) : filtered.map(r => (
                                <tr key={r.id} className={selected.has(r.id) ? "table-danger-subtle" : ""}>
                                    <td className="ps-4">
                                        <input type="checkbox" className="form-check-input" checked={selected.has(r.id)} onChange={() => toggleOne(r.id)} />
                                    </td>
                                    <td>
                                        <span className="badge fw-bold px-3 py-2 rounded-pill" style={{ background: "#fef2f2", color: "#dc2626", fontSize: "0.8rem" }}>
                                            {r.return_no}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`badge badge-process rounded-pill bg-danger-subtle text-danger`}>
                                            {r.process || 'Yarn'}
                                        </span>
                                    </td>
                                    <td className="text-muted fw-semibold">{fmt(r.return_date)}</td>
                                    <td>
                                        <div className="fw-bold text-dark">{r.party_name}</div>
                                        {r.remarks && <div className="text-muted small fw-medium" style={{ fontSize: "0.75rem" }}>{r.remarks.length > 30 ? r.remarks.substring(0, 30) + "..." : r.remarks}</div>}
                                    </td>
                                    <td>
                                        <div className="badge bg-dark rounded-pill me-1 px-2">{r.order_no}</div>
                                        <div className="text-muted small fw-bold d-inline">{r.ref_no || "—"}</div>
                                    </td>
                                    <td className="text-end fw-extrabold text-danger">{parseFloat(r.total_qty || 0).toFixed(3)} <span className="text-muted fw-bold" style={{ fontSize: "0.7rem" }}>KG</span></td>
                                    <td className="text-center">
                                        <div className="d-flex gap-1 justify-content-center">
                                            <button className="btn btn-sm rounded-circle border-0 shadow-sm" style={{ width: 32, height: 32, background: "#eff6ff", color: "#3b82f6" }} onClick={() => navigate(`/edit-order-jobwork-yarn-to-fabric-return/${r.id}`)} title="Edit">
                                                <i className="bi bi-pencil"></i>
                                            </button>
                                            <button className="btn btn-sm rounded-circle border-0 shadow-sm" style={{ width: 32, height: 32, background: "#f8fafc", color: "#475569" }} onClick={() => openPrint(r)} title="Print">
                                                <i className="bi bi-printer"></i>
                                            </button>
                                            <button className="btn btn-sm rounded-circle border-0 shadow-sm" style={{ width: 32, height: 32, background: "#fff1f2", color: "#ef4444" }} onClick={() => { setSelected(new Set([r.id])); handleDelete(); }} title="Delete">
                                                <i className="bi bi-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {printRec && <PrintModal rec={printRec} items={printItems} onClose={() => { setPrintRec(null); setPrintItems([]); }} />}
        </div>
    );
}
