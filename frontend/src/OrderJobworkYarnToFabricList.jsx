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
        const element = document.getElementById('yd-print-content');
        const opt = {
            margin: 0,
            filename: `Invoice-${rec.outward_no || rec.id}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        html2pdf().from(element).set(opt).save();
    };

    const hasYarnName = (items || []).some(it => it.yarn_name && it.yarn_name.trim());
    const hasColor = (items || []).some(it => it.color && it.color.trim());
    const hasCounts = (items || []).some(it => it.counts && it.counts.trim());

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
                        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#000", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <i className="bi bi-printer text-white"></i>
                        </div>
                        <div>
                            <div className="fw-bold small">Print Preview</div>
                            <div className="text-muted" style={{ fontSize: "0.65rem" }}>Professional Yarn to Fabric Outward</div>
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
                <div id="yd-print-content" style={{ padding: "40px", fontFamily: "'Inter', 'Segoe UI', sans-serif", color: "#000", background: "#fff" }}>

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
                                <div style={{ fontSize: "11px", color: "#4b5563", lineHeight: "1.5", marginTop: "4px" }}>
                                    {company.address && <div>{company.address}, {company.pincode}</div>}
                                    {company.gst_no && <div>GSTIN: <strong>{company.gst_no}</strong></div>}
                                    {company.mobile && <div>Mobile: <strong>{company.mobile}</strong></div>}
                                </div>
                            </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: "22px", fontWeight: "900", letterSpacing: "1px", textTransform: "uppercase", color: "#000" }}>{rec.process === "Knitting" ? "FABRIC OUTWARD" : "YARN DYEING OUTWARD"}</div>
                            <div style={{ fontSize: "16px", fontWeight: "800", marginTop: "5px" }}>{rec.outward_no || `INV-#${rec.id}`}</div>
                            <div style={{ fontSize: "12px", color: "#4b5563", marginTop: "2px" }}>Date: <strong>{fmt(rec.outward_date)}</strong></div>
                        </div>
                    </div>

                    {/* Info Boxes */}
                    <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
                        <div style={{ flex: 1, border: "1.5px solid #000" }}>
                            <div className="print-black-header" style={{ background: "#000", color: "#fff", padding: "6px 15px", fontSize: "11px", fontWeight: "800", textTransform: "uppercase" }}>BILLED TO</div>
                            <div style={{ padding: "12px 15px", fontSize: "11px", lineHeight: "1.8" }}>
                                <div style={{ display: "flex" }}><span style={{ width: "90px", fontWeight: "700" }}>Customer:</span> <span>{rec.party_name || "—"}</span></div>
                                <div style={{ display: "flex" }}><span style={{ width: "90px", fontWeight: "700" }}>Order No:</span> <span>{rec.order_no || "—"}</span></div>
                                <div style={{ display: "flex" }}><span style={{ width: "90px", fontWeight: "700" }}>Order Name:</span> <span>{rec.order_name || "—"}</span></div>
                                <div style={{ display: "flex" }}><span style={{ width: "90px", fontWeight: "700" }}>GSTIN:</span> <span>—</span></div>
                            </div>
                        </div>
                        <div style={{ flex: 1, border: "1.5px solid #000" }}>
                            <div className="print-black-header" style={{ background: "#000", color: "#fff", padding: "6px 15px", fontSize: "11px", fontWeight: "800", textTransform: "uppercase" }}>OTHER DETAILS</div>
                            <div style={{ padding: "12px 15px", fontSize: "11px", lineHeight: "1.8" }}>
                                <div style={{ display: "flex" }}><span style={{ width: "110px", fontWeight: "700" }}>Inward Ref ID:</span> <span>{rec.ref_no || "—"}</span></div>
                                <div style={{ display: "flex" }}><span style={{ width: "110px", fontWeight: "700" }}>DC No:</span> <span>{rec.dc_no || "—"}</span></div>
                                <div style={{ display: "flex" }}><span style={{ width: "110px", fontWeight: "700" }}>Vehicle No:</span> <span>—</span></div>
                                <div style={{ display: "flex" }}><span style={{ width: "110px", fontWeight: "700" }}>Place of Supply:</span> <span>{company.city || "—"}</span></div>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div style={{ border: "1.5px solid #000", marginBottom: "20px", borderRadius: "0" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr className="print-black-header" style={{ background: "#000", color: "#fff" }}>
                                    <th style={{ padding: "8px 10px", fontSize: "10px", textTransform: "uppercase", textAlign: "center", borderRight: "1.5px solid #fff", width: "5%" }}>#</th>

                                    {rec.process === "Knitting" ? (
                                        <>
                                            <th style={{ padding: "8px 10px", fontSize: "10px", textTransform: "uppercase", textAlign: "left", borderRight: "1.5px solid #fff", width: "25%" }}>YARN NAME</th>
                                            <th style={{ padding: "8px 10px", fontSize: "10px", textTransform: "uppercase", textAlign: "center", borderRight: "1.5px solid #fff", width: "12%" }}>COLOR</th>
                                            <th style={{ padding: "8px 10px", fontSize: "10px", textTransform: "uppercase", textAlign: "left", borderRight: "1.5px solid #fff", width: "28%" }}>FABRIC NAME</th>
                                            <th style={{ padding: "8px 10px", fontSize: "10px", textTransform: "uppercase", textAlign: "center", borderRight: "1.5px solid #fff", width: "7%" }}>GSM</th>
                                            <th style={{ padding: "8px 10px", fontSize: "10px", textTransform: "uppercase", textAlign: "center", borderRight: "1.5px solid #fff", width: "7%" }}>DIA</th>
                                        </>
                                    ) : (
                                        <>
                                            <th style={{ padding: "8px 10px", fontSize: "10px", textTransform: "uppercase", textAlign: "left", borderRight: "1.5px solid #fff", width: "35%" }}>YARN DESCRIPTION</th>
                                            {hasCounts && <th style={{ padding: "8px 10px", fontSize: "10px", textTransform: "uppercase", textAlign: "center", borderRight: "1.5px solid #fff", width: "12%" }}>COUNTS</th>}
                                            {hasColor && <th style={{ padding: "8px 10px", fontSize: "10px", textTransform: "uppercase", textAlign: "center", borderRight: "1.5px solid #fff", width: "12%" }}>COLOR</th>}
                                        </>
                                    )}

                                    <th style={{ padding: "8px 10px", fontSize: "10px", textTransform: "uppercase", textAlign: "right", width: "15%" }}>QTY (KG)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(items || []).map((it, i) => (
                                    <tr key={i} style={{ borderBottom: "1.5px solid #000" }}>
                                        <td style={{ padding: "10px", textAlign: "center", fontSize: "11px", borderRight: "1.5px solid #000" }}>{i + 1}</td>

                                        {rec.process === "Knitting" ? (
                                            <>
                                                <td style={{ padding: "10px", fontSize: "11px", borderRight: "1.5px solid #000" }}>{it.yarn_name || "—"}</td>
                                                <td style={{ padding: "10px", textAlign: "center", fontSize: "11px", borderRight: "1.5px solid #000" }}>{it.color || "—"}</td>
                                                <td style={{ padding: "10px", fontSize: "11px", fontWeight: "600", borderRight: "1.5px solid #000" }}>{it.fabric_name || "—"}</td>
                                                <td style={{ padding: "10px", textAlign: "center", fontSize: "11px", borderRight: "1.5px solid #000" }}>{it.gsm || "—"}</td>
                                                <td style={{ padding: "10px", textAlign: "center", fontSize: "11px", borderRight: "1.5px solid #000" }}>{it.dia || "—"}</td>
                                            </>
                                        ) : (
                                            <>
                                                <td style={{ padding: "10px", fontSize: "11px", fontWeight: "600", borderRight: "1.5px solid #000" }}>{it.yarn_name || "—"}</td>
                                                {hasCounts && <td style={{ padding: "10px", textAlign: "center", fontSize: "11px", borderRight: "1.5px solid #000" }}>{it.counts || "—"}</td>}
                                                {hasColor && <td style={{ padding: "10px", textAlign: "center", fontSize: "11px", borderRight: "1.5px solid #000" }}>{it.color || "—"}</td>}
                                            </>
                                        )}

                                        <td style={{ padding: "10px", textAlign: "right", fontSize: "11px", fontWeight: "800" }}>{parseFloat(it.qty || 0).toFixed(3)}</td>
                                    </tr>
                                ))}
                                {(!items || items.length === 0) && (
                                    <tr><td colSpan={10} style={{ padding: "30px", textAlign: "center", fontStyle: "italic", color: "#9ca3af" }}>No items records found</td></tr>
                                )}
                            </tbody>
                            <tfoot>
                                <tr style={{ background: "#f9fafb", borderTop: "1.5px solid #000" }}>
                                    <td colSpan={rec.process === "Knitting" ? 6 : 1 + (hasYarnName ? 1 : 0) + (hasCounts ? 1 : 0) + (hasColor ? 1 : 0)} style={{ padding: "10px", textAlign: "right", fontSize: "11px", fontWeight: "800", borderRight: "1.5px solid #000" }}>TOTAL QUANTITY:</td>
                                    <td style={{ padding: "10px", textAlign: "right", fontSize: "11px", fontWeight: "900" }}>{totalQty.toFixed(3)} KG</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* Footer - Signature Only */}
                    <div style={{ marginTop: "40px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: "11px", fontWeight: "800", textTransform: "uppercase", marginBottom: "8px" }}>Terms & Conditions:</div>
                            <div style={{ fontSize: "10px", color: "#333", lineHeight: "1.6" }}>
                                1. Goods once sold will not be taken back.<br />
                                2. Interest @ 18% p.a. will be charged if payment is not made within the due date.<br />
                                3. Subject to local jurisdiction.
                            </div>
                        </div>
                        <div style={{ textAlign: "center", minWidth: "200px" }}>
                            <div style={{ fontSize: "10px", fontWeight: "800", marginBottom: "40px" }}>For {company.company_name || "SUPER LABS ERP"}</div>
                            <div style={{ borderTop: "1px solid #000", paddingTop: "5px", fontSize: "10px", fontWeight: "700" }}>Authorised Signatory</div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default function OrderJobworkYarnDyeingList() {
    const navigate = useNavigate();
    const today = new Date().toISOString().substring(0, 10);
    const [filters, setFilters] = useState({ from_date: "", to_date: today, party_name: "", outward_no: "", order_no: "" });
    const [allRecords, setAllRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [expandedId, setExpandedId] = useState(null);
    const [itemsMap, setItemsMap] = useState({});
    const [selected, setSelected] = useState(new Set());
    const [printRec, setPrintRec] = useState(null);
    const [printItems, setPrintItems] = useState([]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setSelected(new Set());
        try {
            const params = new URLSearchParams({ type: "order", from_date: filters.from_date, to_date: filters.to_date });
            const res = await axios.get(`${API}/yarn-dyeing-outward?${params}`);
            setAllRecords(res.data);
        } catch { setAllRecords([]); }
        finally { setLoading(false); }
    }, [filters.from_date, filters.to_date]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const records = useMemo(() => {
        return allRecords.filter(r => {
            const p = filters.party_name.toLowerCase();
            const o = filters.outward_no.toLowerCase();
            const n = filters.order_no.toLowerCase();
            if (p && !(r.party_name || "").toLowerCase().includes(p)) return false;
            if (o && !(r.outward_no || "").toLowerCase().includes(o)) return false;
            if (n && !(r.order_no || "").toLowerCase().includes(n)) return false;
            return true;
        });
    }, [allRecords, filters.party_name, filters.outward_no, filters.order_no]);

    const handleFilter = e => setFilters(p => ({ ...p, [e.target.name]: e.target.value }));
    const clearFilters = () => setFilters({ from_date: "", to_date: today, party_name: "", outward_no: "", order_no: "" });

    const toggleExpand = async (rec) => {
        if (expandedId === rec.id) { setExpandedId(null); return; }
        setExpandedId(rec.id);
        if (!itemsMap[rec.id]) {
            try {
                const res = await axios.get(`${API}/yarn-dyeing-outward/${rec.id}`);
                setItemsMap(p => ({ ...p, [rec.id]: res.data.items || [] }));
            } catch { setItemsMap(p => ({ ...p, [rec.id]: [] })); }
        }
    };

    const openPrint = async (rec) => {
        let items = itemsMap[rec.id];
        if (!items) {
            try {
                const res = await axios.get(`${API}/yarn-dyeing-outward/${rec.id}`);
                items = res.data.items || [];
                setItemsMap(p => ({ ...p, [rec.id]: items }));
            } catch { items = []; }
        }
        setPrintRec(rec);
        setPrintItems(items);
    };

    const toggleSelect = (id) => setSelected(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
    const toggleAll = () => setSelected(selected.size === records.length && records.length > 0 ? new Set() : new Set(records.map(r => r.id)));

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this outward record?")) return;
        await axios.delete(`${API}/yarn-dyeing-outward/${id}`);
        fetchData();
    };

    const bulkDelete = async () => {
        if (!window.confirm(`Delete ${selected.size} selected record(s)?`)) return;
        try {
            await axios.delete(`${API}/yarn-dyeing-outward/bulk`, { data: { ids: Array.from(selected) } });
            fetchData();
        } catch (err) { alert(err.response?.data?.error || "Delete failed"); }
    };

    const totalQty = records.reduce((s, r) => s + (parseFloat(r.total_qty) || 0), 0);

    return (
        <div className="container-fluid mt-3 mb-5 px-3 px-md-4">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
                
                :root {
                    --erp-font-main: 'Inter', -apple-system, sans-serif;
                }

                .container-fluid {
                    font-family: var(--erp-font-main) !important;
                }

                .table thead th {
                    background-color: #1e1b4b !important;
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

            {printRec && <PrintModal rec={printRec} items={printItems} onClose={() => setPrintRec(null)} />}

            {/* Header */}
            <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom">
                <button className="btn btn-outline-secondary btn-sm rounded-pill px-3 py-1 fw-bold" onClick={() => navigate("/garments")}>
                    <i className="bi bi-arrow-left me-1"></i>Back
                </button>
                <div>
                    <div className="d-flex align-items-center gap-2 mb-1">
                        <span className="badge bg-dark rounded-pill">ORDER JOBWORK</span>
                        <span className="badge rounded-pill text-white" style={{ background: "#4f46e5" }}>Yarn to Fabric</span>
                    </div>
                    <h4 className="fw-extrabold mb-0 text-dark" style={{ letterSpacing: "-0.02em" }}>
                        <i className="bi bi-journal-text me-2 text-primary"></i>Job Outward Records
                    </h4>
                </div>
                <div className="ms-auto d-flex gap-2 flex-wrap">
                    {selected.size > 0 && (
                        <button className="btn btn-danger rounded-pill px-3 btn-sm fw-bold shadow-sm" onClick={bulkDelete}>
                            <i className="bi bi-trash me-1"></i>Delete ({selected.size})
                        </button>
                    )}
                    <button className="btn btn-primary rounded-pill px-4 btn-sm fw-bold shadow-sm" onClick={() => navigate("/order-jobwork-yarn-to-fabric-outward")}>
                        <i className="bi bi-plus-lg me-1"></i>New Outward
                    </button>
                    <button className="btn btn-success rounded-pill px-4 btn-sm fw-bold shadow-sm" onClick={() => navigate("/order-jobwork-yarn-to-fabric-inward")}>
                        <i className="bi bi-box-arrow-in-down-right me-1"></i>Inward
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="card border-0 shadow-sm rounded-4 mb-4">
                <div className="card-body p-3">
                    <div className="row g-3 align-items-end">
                        <div className="col-md-2">
                            <label className="form-label fw-bold text-muted small mb-1">FROM DATE</label>
                            <input type="date" className="form-control form-control-sm border-0 bg-light fw-semibold" name="from_date" value={filters.from_date} onChange={handleFilter} />
                        </div>
                        <div className="col-md-2">
                            <label className="form-label fw-bold text-muted small mb-1">TO DATE</label>
                            <input type="date" className="form-control form-control-sm border-0 bg-light fw-semibold" name="to_date" value={filters.to_date} onChange={handleFilter} />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label fw-bold text-muted small mb-1">SUPPLIER</label>
                            <input type="text" className="form-control form-control-sm border-0 bg-light" name="party_name" value={filters.party_name} onChange={handleFilter} placeholder="Filter supplier..." />
                        </div>
                        <div className="col-md-2">
                            <label className="form-label fw-bold text-muted small mb-1">OUTWARD NO.</label>
                            <input type="text" className="form-control form-control-sm border-0 bg-light" name="outward_no" value={filters.outward_no} onChange={handleFilter} placeholder="YD-ORD-..." />
                        </div>
                        <div className="col-md-2">
                            <label className="form-label fw-bold text-muted small mb-1">ORDER NO.</label>
                            <input type="text" className="form-control form-control-sm border-0 bg-light" name="order_no" value={filters.order_no} onChange={handleFilter} placeholder="Filter order..." />
                        </div>
                        <div className="col-md-1">
                            <button className="btn btn-outline-secondary btn-sm rounded-pill w-100 fw-bold border-0" onClick={clearFilters}>
                                <i className="bi bi-x-circle me-1"></i>Clear
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead>
                                <tr>
                                    <th className="ps-4" style={{ width: 50 }}>
                                        <input type="checkbox" className="form-check-input"
                                            checked={selected.size === records.length && records.length > 0}
                                            onChange={toggleAll} />
                                    </th>
                                    <th style={{ width: "15%" }}>OUTWARD NO.</th>
                                    <th style={{ width: "10%" }}>PROCESS</th>
                                    <th style={{ width: "9%" }}>DATE</th>
                                    <th style={{ width: "10%" }}>ORDER NO.</th>
                                    <th style={{ width: "12%" }}>ORDER NAME</th>
                                    <th style={{ width: "14%" }}>SUPPLIER</th>
                                    <th style={{ width: "10%" }}>REF. NO.</th>
                                    <th className="text-end" style={{ width: "8%" }}>QTY (KG)</th>
                                    <th className="text-center" style={{ width: "12%" }}>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading && <tr><td colSpan={11} className="text-center py-5"><span className="spinner-border spinner-border-sm text-primary me-2"></span>Loading records...</td></tr>}
                                {!loading && records.length === 0 && (
                                    <tr><td colSpan={11} className="text-center py-5 text-muted">
                                        <i className="bi bi-inbox fs-2 d-block mb-2"></i>No records found
                                    </td></tr>
                                )}
                                {!loading && records.map((r, idx) => (
                                    <React.Fragment key={r.id}>
                                        <tr className={selected.has(r.id) ? "table-primary" : ""}>
                                            <td className="ps-4">
                                                <input type="checkbox" className="form-check-input"
                                                    checked={selected.has(r.id)} onChange={() => toggleSelect(r.id)} />
                                            </td>
                                            <td>
                                                <span className="badge fw-bold px-3 py-2 rounded-pill"
                                                    style={{ background: "#eef2ff", color: "#4f46e5", fontSize: "0.8rem" }}>
                                                    {r.outward_no}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge badge-process rounded-pill ${r.process === 'Knitting' ? 'bg-info-subtle text-info' : 'bg-primary-subtle text-primary'}`}>
                                                    {r.process || 'Yarn'}
                                                </span>
                                            </td>
                                            <td className="text-muted fw-semibold">{fmt(r.outward_date)}</td>
                                            <td className="fw-bold">{r.order_no || "—"}</td>
                                            <td className="text-muted fw-medium" style={{ maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.order_name || "—"}</td>
                                            <td className="fw-semibold text-dark">{r.party_name || "—"}</td>
                                            <td className="text-muted">{r.ref_no || "—"}</td>
                                            <td className="text-end fw-extrabold text-primary">{parseFloat(r.total_qty || 0).toFixed(3)}</td>
                                            <td className="text-center">
                                                <div className="d-flex gap-1 justify-content-center">
                                                    <button className="btn btn-sm rounded-circle border-0 shadow-sm"
                                                        style={{ width: 32, height: 32, padding: 0, background: "#f1f5f9", color: "#6366f1" }}
                                                        title="Expand items" onClick={() => toggleExpand(r)}>
                                                        <i className={`bi ${expandedId === r.id ? "bi-chevron-up" : "bi-chevron-down"}`}></i>
                                                    </button>
                                                    <button className="btn btn-sm rounded-circle border-0 shadow-sm"
                                                        style={{ width: 32, height: 32, padding: 0, background: "#f0fdf4", color: "#10b981" }}
                                                        title="Print this record" onClick={() => openPrint(r)}>
                                                        <i className="bi bi-printer"></i>
                                                    </button>
                                                    <button className="btn btn-sm rounded-circle border-0 shadow-sm"
                                                        style={{ width: 32, height: 32, padding: 0, background: "#eff6ff", color: "#3b82f6" }}
                                                        title="Edit" onClick={() => navigate(`/edit-order-jobwork-yarn-to-fabric-outward/${r.id}`)}>
                                                        <i className="bi bi-pencil"></i>
                                                    </button>
                                                    <button className="btn btn-sm rounded-circle border-0 shadow-sm"
                                                        style={{ width: 32, height: 32, padding: 0, background: "#fff1f2", color: "#ef4444" }}
                                                        title="Delete" onClick={() => handleDelete(r.id)}>
                                                        <i className="bi bi-trash"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                        {expandedId === r.id && (
                                            <tr style={{ background: "#f8faff" }}>
                                                <td colSpan={10} className="py-3 ps-5">
                                                    {r.staff_name && <div className="mb-2 small text-muted"><i className="bi bi-person-badge me-1 text-primary"></i>Staff: <strong>{r.staff_name}</strong>{r.staff_remarks && <span className="ms-2">— {r.staff_remarks}</span>}</div>}
                                                    {r.remarks && <div className="mb-2 small text-muted"><i className="bi bi-chat-left-text me-1"></i>Remarks: {r.remarks}</div>}
                                                    <table className="table table-sm table-bordered mb-0" style={{ fontSize: "0.78rem", maxWidth: 650 }}>
                                                        <thead style={{ background: "#111", color: "#fff" }}>
                                                            <tr>
                                                                <th className="text-center" style={{ width: "8%" }}>#</th>
                                                                {r.process === "Knitting" ? (
                                                                    <th style={{ width: "50%" }}>FABRIC NAME</th>
                                                                ) : (
                                                                    <>
                                                                        <th style={{ width: "35%" }}>YARN NAME</th>
                                                                        <th style={{ width: "15%" }}>COUNTS</th>
                                                                        <th style={{ width: "15%" }}>COLOR</th>
                                                                    </>
                                                                )}
                                                                <th className="text-center" style={{ width: "15%" }}>QTY (KG)</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {(itemsMap[r.id] || []).map((it, i) => (
                                                                <tr key={i}>
                                                                    <td className="text-center text-muted">{i + 1}</td>
                                                                    {r.process === "Knitting" ? (
                                                                        <td>{it.fabric_name || it.yarn_name || "—"}</td>
                                                                    ) : (
                                                                        <>
                                                                            <td className="fw-semibold">{it.yarn_name || "—"}</td>
                                                                            <td>{it.counts || "—"}</td>
                                                                            <td>{it.color || "—"}</td>
                                                                        </>
                                                                    )}
                                                                    <td className="text-center fw-bold text-primary">{parseFloat(it.qty || 0).toFixed(3)}</td>
                                                                </tr>
                                                            ))}
                                                            {!(itemsMap[r.id] || []).length && <tr><td colSpan={r.process === "Knitting" ? 3 : 5} className="text-center text-muted py-2">No items</td></tr>}
                                                        </tbody>
                                                    </table>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                            {records.length > 0 && (
                                <tfoot>
                                    <tr style={{ background: "#111", color: "#fff" }}>
                                        <td colSpan={7} className="ps-3 fw-bold">Total</td>
                                        <td className="text-center fw-bold text-warning">{totalQty.toFixed(3)}</td>
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
