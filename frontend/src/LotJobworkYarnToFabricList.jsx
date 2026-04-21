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
            filename: `Lot-Outward-${rec.outward_no || rec.id}.pdf`,
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
                                <div style={{ display: "flex" }}><span style={{ width: "90px", fontWeight: "700" }}>Supplier:</span> <span>{rec.party_name || "—"}</span></div>
                                <div style={{ display: "flex" }}><span style={{ width: "90px", fontWeight: "700" }}>Lot No:</span> <span>{rec.lot_no || "—"}</span></div>
                                <div style={{ display: "flex" }}><span style={{ width: "90px", fontWeight: "700" }}>Lot Name:</span> <span>{rec.lot_name || "—"}</span></div>
                                <div style={{ display: "flex" }}><span style={{ width: "90px", fontWeight: "700" }}>GSTIN:</span> <span>—</span></div>
                            </div>
                        </div>
                        <div style={{ flex: 1, border: "1.5px solid #000" }}>
                            <div className="print-black-header" style={{ background: "#000", color: "#fff", padding: "6px 15px", fontSize: "11px", fontWeight: "800", textTransform: "uppercase" }}>OTHER DETAILS</div>
                            <div style={{ padding: "12px 15px", fontSize: "11px", lineHeight: "1.8" }}>
                                <div style={{ display: "flex" }}><span style={{ width: "110px", fontWeight: "700" }}>{rec.process === "Knitting" ? "Process" : "Inward Ref ID"}:</span> <span>{rec.process === "Knitting" ? rec.process : rec.ref_no || "—"}</span></div>
                                <div style={{ display: "flex" }}><span style={{ width: "110px", fontWeight: "700" }}>DC No:</span> <span>{rec.ref_no || "—"}</span></div>
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

export default function LotJobworkYarnDyeingList() {
    const navigate = useNavigate();
    const today = new Date().toISOString().substring(0, 10);
    const [filters, setFilters] = useState({ from_date: "", to_date: today, party_name: "", outward_no: "", lot_no: "" });
    const [allRecords, setAllRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [expandedId, setExpandedId] = useState(null);
    const [itemsMap, setItemsMap] = useState({});
    const [selected, setSelected] = useState(new Set());
    const [printRec, setPrintRec] = useState(null);
    const [printItems, setPrintItems] = useState([]);

    const fetchData = useCallback(async () => {
        setLoading(true); setSelected(new Set());
        try {
            const p = new URLSearchParams({ type: "lot", from_date: filters.from_date, to_date: filters.to_date });
            const res = await axios.get(`${API}/yarn-dyeing-outward?${p}`);
            setAllRecords(res.data);
        } catch { setAllRecords([]); } finally { setLoading(false); }
    }, [filters.from_date, filters.to_date]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const records = useMemo(() => allRecords.filter(r => {
        if (filters.party_name && !(r.party_name || "").toLowerCase().includes(filters.party_name.toLowerCase())) return false;
        if (filters.outward_no && !(r.outward_no || "").toLowerCase().includes(filters.outward_no.toLowerCase())) return false;
        if (filters.lot_no && !(r.lot_no || "").toLowerCase().includes(filters.lot_no.toLowerCase())) return false;
        return true;
    }), [allRecords, filters.party_name, filters.outward_no, filters.lot_no]);

    const handleFilter = e => setFilters(p => ({ ...p, [e.target.name]: e.target.value }));
    const clearFilters = () => setFilters({ from_date: "", to_date: today, party_name: "", outward_no: "", lot_no: "" });

    const toggleExpand = async (rec) => {
        if (expandedId === rec.id) { setExpandedId(null); return; }
        setExpandedId(rec.id);
        if (!itemsMap[rec.id]) {
            try { const res = await axios.get(`${API}/yarn-dyeing-outward/${rec.id}`); setItemsMap(p => ({ ...p, [rec.id]: res.data.items || [] })); }
            catch { setItemsMap(p => ({ ...p, [rec.id]: [] })); }
        }
    };

    const openPrint = async (rec) => {
        let items = itemsMap[rec.id];
        if (!items) {
            try { const res = await axios.get(`${API}/yarn-dyeing-outward/${rec.id}`); items = res.data.items || []; setItemsMap(p => ({ ...p, [rec.id]: items })); }
            catch { items = []; }
        }
        setPrintRec(rec); setPrintItems(items);
    };

    const toggleSelect = (id) => setSelected(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
    const toggleAll = () => setSelected(selected.size === records.length && records.length > 0 ? new Set() : new Set(records.map(r => r.id)));
    const handleDelete = async (id) => { if (!window.confirm("Delete this record?")) return; await axios.delete(`${API}/yarn-dyeing-outward/${id}`); fetchData(); };
    const bulkDelete = async () => {
        if (!window.confirm(`Delete ${selected.size} selected record(s)?`)) return;
        try {
            await axios.delete(`${API}/yarn-dyeing-outward/bulk`, { data: { ids: Array.from(selected) } });
            fetchData();
        } catch (err) { alert(err.response?.data?.error || "Delete failed"); }
    };

    const totalQty = records.reduce((s, r) => s + (parseFloat(r.total_qty) || 0), 0);
    const bs = (bg, color) => ({ width: 28, height: 28, padding: 0, background: bg, color, border: "none", fontSize: "0.7rem" });

    return (
        <div className="container-fluid mt-3 mb-5 px-3 px-md-4">
            {printRec && <PrintModal rec={printRec} items={printItems} onClose={() => setPrintRec(null)} />}
            <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom flex-wrap">
                <button className="btn btn-outline-secondary btn-sm rounded-pill px-3" onClick={() => navigate("/garments")}><i className="bi bi-arrow-left me-1"></i>Back</button>
                <div>
                    <div className="d-flex align-items-center gap-2">
                        <span className="badge bg-dark rounded-pill px-3" style={{ fontSize: "0.7rem" }}>LOT JOBWORK</span>
                        <span className="badge rounded-pill px-3 text-white" style={{ background: "#6366f1", fontSize: "0.7rem" }}>Yarn to Fabric</span>
                    </div>
                    <h4 className="fw-bold mb-0 mt-1 text-dark"><i className="bi bi-journal-text me-2 text-primary"></i>Job Outward Records</h4>
                </div>
                <div className="ms-auto d-flex gap-2 flex-wrap">
                    {selected.size > 0 && <button className="btn btn-danger rounded-pill px-3 btn-sm" onClick={bulkDelete}><i className="bi bi-trash me-1"></i>Delete ({selected.size})</button>}
                    <button className="btn btn-outline-primary rounded-pill px-3 btn-sm" onClick={() => navigate("/lot-jobwork-yarn-to-fabric-outward")}><i className="bi bi-plus-lg me-1"></i>New Outward</button>
                    <button className="btn btn-success rounded-pill px-3 btn-sm" onClick={() => navigate("/lot-jobwork-yarn-to-fabric-inward")}><i className="bi bi-box-arrow-in-down-right me-1"></i>New Inward</button>
                </div>
            </div>

            <div className="card border-0 shadow-sm rounded-4 mb-4">
                <div className="card-body p-3">
                    <div className="row g-2 align-items-end">
                        <div className="col-md-2 col-6"><label className="form-label fw-semibold text-muted mb-1" style={{ fontSize: "0.72rem" }}>FROM DATE</label><input type="date" className="form-control form-control-sm" name="from_date" value={filters.from_date} onChange={handleFilter} /></div>
                        <div className="col-md-2 col-6"><label className="form-label fw-semibold text-muted mb-1" style={{ fontSize: "0.72rem" }}>TO DATE</label><input type="date" className="form-control form-control-sm" name="to_date" value={filters.to_date} onChange={handleFilter} /></div>
                        <div className="col-md-3 col-6"><label className="form-label fw-semibold text-muted mb-1" style={{ fontSize: "0.72rem" }}>SUPPLIER NAME</label><input type="text" className="form-control form-control-sm" name="party_name" value={filters.party_name} onChange={handleFilter} placeholder="Filter supplier..." /></div>
                        <div className="col-md-2 col-6"><label className="form-label fw-semibold text-muted mb-1" style={{ fontSize: "0.72rem" }}>OUTWARD NO.</label><input type="text" className="form-control form-control-sm" name="outward_no" value={filters.outward_no} onChange={handleFilter} placeholder="e.g. YD-LOT-0001" /></div>
                        <div className="col-md-2 col-6"><label className="form-label fw-semibold text-muted mb-1" style={{ fontSize: "0.72rem" }}>LOT NO.</label><input type="text" className="form-control form-control-sm" name="lot_no" value={filters.lot_no} onChange={handleFilter} placeholder="Filter lot no..." /></div>
                        <div className="col-md-1 col-6 d-flex gap-2 align-items-end"><button className="btn btn-outline-secondary btn-sm rounded-pill flex-fill" onClick={clearFilters}><i className="bi bi-x-circle me-1"></i>Clear</button></div>
                    </div>
                </div>
            </div>

            <div className="row g-3 mb-4">
                {[{ label: "Total Outwards", value: records.length, grad: "#6366f1,#8b5cf6" }, { label: "Total Qty (KG)", value: totalQty.toFixed(3), grad: "#0ea5e9,#38bdf8" }].map((c, i) => (
                    <div className="col-6 col-md-3" key={i}>
                        <div className="card border-0 rounded-4 shadow-sm text-center p-3" style={{ background: `linear-gradient(135deg,${c.grad})`, color: "#fff" }}>
                            <div className="fs-3 fw-bold">{c.value}</div><div className="small opacity-75">{c.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="card border-0 shadow-sm rounded-4">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0" style={{ fontSize: "0.83rem" }}>
                            <thead className="table-dark">
                                <tr>
                                    <th className="ps-3" style={{ width: 40 }}><input type="checkbox" className="form-check-input mt-0" checked={selected.size === records.length && records.length > 0} onChange={toggleAll} /></th>
                                    <th>OUTWARD NO.</th><th>DATE</th><th>LOT NO.</th><th>LOT NAME</th><th>SUPPLIER</th><th>REF. NO.</th>
                                    <th className="text-center">QTY (KG)</th><th className="text-center">ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading && <tr><td colSpan={10} className="text-center py-5"><span className="spinner-border spinner-border-sm text-primary me-2"></span>Loading...</td></tr>}
                                {!loading && records.length === 0 && <tr><td colSpan={10} className="text-center py-5 text-muted"><i className="bi bi-inbox fs-2 d-block mb-2"></i>No records found</td></tr>}
                                {!loading && records.map((r, idx) => (
                                    <React.Fragment key={r.id}>
                                        <tr className={selected.has(r.id) ? "table-primary" : ""}>
                                            <td className="ps-3"><input type="checkbox" className="form-check-input mt-0" checked={selected.has(r.id)} onChange={() => toggleSelect(r.id)} /></td>
                                            <td><span className="badge fw-semibold px-2 py-1 rounded-pill" style={{ background: "#eef2ff", color: "#6366f1", fontSize: "0.73rem" }}>{r.outward_no}</span></td>
                                            <td className="text-muted">{fmt(r.outward_date)}</td>
                                            <td className="fw-semibold">{r.lot_no || "—"}</td>
                                            <td className="text-muted" style={{ maxWidth: 130, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.lot_name || "—"}</td>
                                            <td>{r.party_name || "—"}</td>
                                            <td className="text-muted">{r.ref_no || "—"}</td>
                                            <td className="text-center fw-bold" style={{ color: "#1d4ed8" }}>{r.total_qty || 0}</td>
                                            <td className="text-center">
                                                <div className="d-flex gap-1 justify-content-center">
                                                    <button className="btn btn-sm rounded-circle" style={bs("#f1f5f9", "#6366f1")} title="Expand" onClick={() => toggleExpand(r)}><i className={`bi ${expandedId === r.id ? "bi-chevron-up" : "bi-chevron-down"}`}></i></button>
                                                    <button className="btn btn-sm rounded-circle" style={bs("#f0fdf4", "#10b981")} title="Print" onClick={() => openPrint(r)}><i className="bi bi-printer"></i></button>
                                                    <button className="btn btn-sm rounded-circle" style={bs("#eff6ff", "#3b82f6")} title="Edit" onClick={() => navigate(`/edit-lot-jobwork-yarn-to-fabric-outward/${r.id}`)}><i className="bi bi-pencil"></i></button>
                                                    <button className="btn btn-sm rounded-circle" style={bs("#fff1f2", "#ef4444")} title="Delete" onClick={() => handleDelete(r.id)}><i className="bi bi-trash"></i></button>
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
