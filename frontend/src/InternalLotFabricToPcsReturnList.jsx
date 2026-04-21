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
        const element = document.getElementById('fn-print-content');
        const opt = {
            margin: 0,
            filename: `Internal-Lot-Fabric-Return-${rec.return_no || rec.id}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        html2pdf().from(element).set(opt).save();
    };

    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
            <style>{`
                .fn-print-root { animation: slideUp 0.15s ease-out; }
                @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                
                @media print {
                    body * { visibility: hidden !important; }
                    .fn-print-root, .fn-print-root * { visibility: visible !important; }
                    .fn-print-root { 
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
                    .fn-no-print { display: none !important; }
                    .print-black-header { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; background-color: #000 !important; color: #fff !important; }
                    @page { size: A4 portrait; margin: 0; }
                }
            `}</style>

            <div className="fn-print-root bg-white rounded-4 shadow-lg" style={{ width: "100%", maxWidth: "840px", maxHeight: "95vh", overflowY: "auto", display: "flex", flexDirection: "column" }}>

                {/* Toolbar */}
                <div className="fn-no-print d-flex align-items-center justify-content-between px-4 py-3 border-bottom sticky-top bg-white rounded-top-4" style={{ zIndex: 10 }}>
                    <div className="d-flex align-items-center gap-2">
                        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#dc3545", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <i className="bi bi-printer text-white"></i>
                        </div>
                        <div>
                            <div className="fw-bold small">Print Preview</div>
                            <div className="text-muted" style={{ fontSize: "0.65rem" }}>Professional Internal Lot Return</div>
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
                <div id="fn-print-content" style={{ padding: "40px", fontFamily: "'Inter', 'Segoe UI', sans-serif", color: "#000", background: "#fff" }}>

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
                            <div style={{ fontSize: "22px", fontWeight: "900", letterSpacing: "1px", textTransform: "uppercase", color: "#dc3545" }}>INTERNAL LOT RETURN</div>
                            <div style={{ fontSize: "16px", fontWeight: "800", marginTop: "5px" }}>{rec.return_no || `RET-#${rec.id}`}</div>
                            <div style={{ fontSize: "12px", color: "#4b5563", marginTop: "2px" }}>Date: <strong>{fmt(rec.return_date)}</strong></div>
                        </div>
                    </div>

                    {/* Info Boxes */}
                    <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
                        <div style={{ flex: 1, border: "1.5px solid #000" }}>
                            <div className="print-black-header" style={{ background: "#000", color: "#fff", padding: "6px 15px", fontSize: "11px", fontWeight: "800", textTransform: "uppercase" }}>BILLED FROM</div>
                            <div style={{ padding: "12px 15px", fontSize: "11px", lineHeight: "1.8" }}>
                                <div style={{ display: "flex" }}><span style={{ width: "90px", fontWeight: "700" }}>Supplier:</span> <span>{rec.party_name || "—"}</span></div>
                                <div style={{ display: "flex" }}><span style={{ width: "120px", fontWeight: "700" }}>Internal Lot No:</span> <span>{rec.internal_lot_no || "—"}</span></div>
                                <div style={{ display: "flex" }}><span style={{ width: "120px", fontWeight: "700" }}>Internal Lot Name:</span> <span>{rec.internal_lot_name || "—"}</span></div>
                            </div>
                        </div>
                        <div style={{ flex: 1, border: "1.5px solid #000" }}>
                            <div className="print-black-header" style={{ background: "#000", color: "#fff", padding: "6px 15px", fontSize: "11px", fontWeight: "800", textTransform: "uppercase" }}>OTHER DETAILS</div>
                            <div style={{ padding: "12px 15px", fontSize: "11px", lineHeight: "1.8" }}>
                                <div style={{ display: "flex" }}><span style={{ width: "110px", fontWeight: "700" }}>Process:</span> <span>{rec.process || "—"}</span></div>
                                <div style={{ display: "flex" }}><span style={{ width: "110px", fontWeight: "700" }}>DC No:</span> <span>{rec.ref_no || "—"}</span></div>
                                <div style={{ display: "flex" }}><span style={{ width: "110px", fontWeight: "700" }}>Employee:</span> <span>{rec.staff_name || "—"}</span></div>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div style={{ border: "1.5px solid #000", marginBottom: "20px", borderRadius: "0" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr className="print-black-header" style={{ background: "#000", color: "#fff" }}>
                                    <th style={{ padding: "8px 10px", fontSize: "10px", textTransform: "uppercase", textAlign: "center", borderRight: "1.5px solid #fff", width: "5%" }}>#</th>
                                    <th style={{ padding: "8px 10px", fontSize: "10px", textTransform: "uppercase", textAlign: "center", borderRight: "1.5px solid #fff", width: "10%" }}>COUNTS</th>
                                    <th style={{ padding: "8px 10px", fontSize: "10px", textTransform: "uppercase", textAlign: "left", borderRight: "1.5px solid #fff", width: "25%" }}>FABRIC NAME</th>
                                    <th style={{ padding: "8px 10px", fontSize: "10px", textTransform: "uppercase", textAlign: "center", borderRight: "1.5px solid #fff", width: "10%" }}>GSM</th>
                                    <th style={{ padding: "8px 10px", fontSize: "10px", textTransform: "uppercase", textAlign: "center", borderRight: "1.5px solid #fff", width: "10%" }}>DIA</th>
                                    <th style={{ padding: "8px 10px", fontSize: "10px", textTransform: "uppercase", textAlign: "center", borderRight: "1.5px solid #fff", width: "10%" }}>COLOR</th>
                                    <th style={{ padding: "8px 10px", fontSize: "10px", textTransform: "uppercase", textAlign: "right", borderRight: "1.5px solid #fff", width: "15%" }}>QTY (KG)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(items || []).map((it, i) => (
                                    <tr key={i} style={{ borderBottom: "1.5px solid #000" }}>
                                        <td style={{ padding: "10px", textAlign: "center", fontSize: "11px", borderRight: "1.5px solid #000" }}>{i + 1}</td>
                                        <td style={{ padding: "10px", textAlign: "center", fontSize: "11px", borderRight: "1.5px solid #000" }}>{it.counts || "—"}</td>
                                        <td style={{ padding: "10px", fontSize: "11px", fontWeight: "600", borderRight: "1.5px solid #000" }}>{it.fabric_name || "—"}</td>
                                        <td style={{ padding: "10px", textAlign: "center", fontSize: "11px", borderRight: "1.5px solid #000" }}>{it.gsm || "—"}</td>
                                        <td style={{ padding: "10px", textAlign: "center", fontSize: "11px", borderRight: "1.5px solid #000" }}>{it.dia || "—"}</td>
                                        <td style={{ padding: "10px", textAlign: "center", fontSize: "11px", borderRight: "1.5px solid #000" }}>{it.color || "—"}</td>
                                        <td style={{ padding: "10px", textAlign: "right", fontSize: "11px", fontWeight: "800" }}>{parseFloat(it.qty || 0).toFixed(3)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr style={{ background: "#f9fafb", borderTop: "1.5px solid #000" }}>
                                    <td colSpan={6} style={{ padding: "10px", textAlign: "right", fontSize: "11px", fontWeight: "800", borderRight: "1.5px solid #000" }}>TOTAL:</td>
                                    <td style={{ padding: "10px", textAlign: "right", fontSize: "11px", fontWeight: "900" }}>{totalQty.toFixed(3)} KG</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* Footer - Signature Only */}
                    <div style={{ marginTop: "40px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: "11px", fontWeight: "800", textTransform: "uppercase", marginBottom: "8px" }}>Remarks:</div>
                            <div style={{ fontSize: "10px", color: "#333", lineHeight: "1.6" }}>{rec.remarks || "No additional remarks."}</div>
                        </div>
                        <div style={{ textAlign: "center", minWidth: "200px" }}>
                            <div style={{ fontSize: "10px", fontWeight: "800", marginBottom: "40px" }}>For {company.company_name || "SUPER LABS ERP"}</div>
                            <div style={{ borderTop: "1px solid #000", paddingTop: "5px", fontSize: "10px", fontWeight: "700" }}>Sender Signature</div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default function InternalLotFabricToPcsReturnList() {
    const navigate = useNavigate();
    const today = new Date().toISOString().substring(0, 10);

    const [filters, setFilters] = useState({ from_date: "", to_date: today, party_name: "", return_no: "", internal_lot_no: "" });
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
            const params = new URLSearchParams({ type: "internal", from_date: filters.from_date, to_date: filters.to_date });
            const res = await axios.get(`${API}/fabric-to-pcs-return?${params}`);
            setAllRecords(res.data);
        } catch { setAllRecords([]); }
        finally { setLoading(false); }
    }, [filters.from_date, filters.to_date]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const records = useMemo(() => {
        return allRecords.filter(r => {
            const p = filters.party_name.toLowerCase();
            const o = filters.return_no.toLowerCase();
            const n = filters.internal_lot_no.toLowerCase();
            if (p && !(r.party_name || "").toLowerCase().includes(p)) return false;
            if (o && !(r.return_no || "").toLowerCase().includes(o)) return false;
            if (n && !(r.internal_lot_no || "").toLowerCase().includes(n)) return false;
            return true;
        });
    }, [allRecords, filters.party_name, filters.return_no, filters.internal_lot_no]);

    const handleFilter = e => setFilters(p => ({ ...p, [e.target.name]: e.target.value }));
    const clearFilters = () => setFilters({ from_date: "", to_date: today, party_name: "", return_no: "", internal_lot_no: "" });

    const toggleExpand = async (rec) => {
        if (expandedId === rec.id) { setExpandedId(null); return; }
        setExpandedId(rec.id);
        if (!itemsMap[rec.id]) {
            try {
                const res = await axios.get(`${API}/fabric-to-pcs-return/${rec.id}`);
                setItemsMap(p => ({ ...p, [rec.id]: res.data.items || [] }));
            } catch { setItemsMap(p => ({ ...p, [rec.id]: [] })); }
        }
    };

    const openPrint = async (rec) => {
        let items = itemsMap[rec.id];
        if (!items) {
            try {
                const res = await axios.get(`${API}/fabric-to-pcs-return/${rec.id}`);
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
        if (!window.confirm("Delete this return record?")) return;
        await axios.delete(`${API}/fabric-to-pcs-return/${id}`);
        fetchData();
    };

    const bulkDelete = async () => {
        if (!window.confirm(`Delete ${selected.size} selected record(s)?`)) return;
        try {
            await axios.delete(`${API}/fabric-to-pcs-return/bulk`, { data: { ids: Array.from(selected) } });
            fetchData();
        } catch (err) { alert(err.response?.data?.error || "Delete failed"); }
    };

    const totalQty = records.reduce((s, r) => s + (parseFloat(r.total_qty) || 0), 0);

    return (
        <div className="container-fluid mt-3 mb-5 px-3 px-md-4">
            {printRec && <PrintModal rec={printRec} items={printItems} onClose={() => setPrintRec(null)} />}

            {/* Header */}
            <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom">
                <button className="btn btn-outline-secondary btn-sm rounded-pill px-3" onClick={() => navigate("/garments")}>
                    <i className="bi bi-arrow-left me-1"></i>Back
                </button>
                <div>
                    <div className="d-flex align-items-center gap-2">
                        <span className="badge bg-dark rounded-pill px-3" style={{ fontSize: "0.7rem" }}>INTERNAL LOT</span>
                        <span className="badge rounded-pill px-3 text-white" style={{ background: "#ef4444", fontSize: "0.7rem" }}>Internal Lot Return</span>
                    </div>
                    <h4 className="fw-bold mb-0 mt-1 text-dark">
                        <i className="bi bi-arrow-left-right me-2 text-danger"></i>Internal Lot Return List
                    </h4>
                </div>
                <div className="ms-auto d-flex gap-2 flex-wrap">
                    {selected.size > 0 && (
                        <button className="btn btn-danger rounded-pill px-3 btn-sm" onClick={bulkDelete}>
                            <i className="bi bi-trash me-1"></i>Delete ({selected.size})
                        </button>
                    )}
                    <button className="btn btn-danger rounded-pill px-3 btn-sm fw-bold shadow-sm" onClick={() => navigate("/internal-lot-fabric-to-pcs-return")}>
                        <i className="bi bi-plus-lg me-1"></i>New Return
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="card border-0 shadow-sm rounded-4 mb-4">
                <div className="card-body p-3">
                    <div className="row g-2 align-items-end">
                        <div className="col-md-2 col-6">
                            <label className="form-label fw-semibold text-muted mb-1" style={{ fontSize: "0.72rem" }}>FROM DATE</label>
                            <input type="date" className="form-control form-control-sm border-0 bg-light rounded-pill" name="from_date" value={filters.from_date} onChange={handleFilter} />
                        </div>
                        <div className="col-md-2 col-6">
                            <label className="form-label fw-semibold text-muted mb-1" style={{ fontSize: "0.72rem" }}>TO DATE</label>
                            <input type="date" className="form-control form-control-sm border-0 bg-light rounded-pill" name="to_date" value={filters.to_date} onChange={handleFilter} />
                        </div>
                        <div className="col-md-3 col-6">
                            <label className="form-label fw-semibold text-muted mb-1" style={{ fontSize: "0.72rem" }}>SUPPLIER NAME</label>
                            <input type="text" className="form-control form-control-sm border-0 bg-light rounded-pill" name="party_name" value={filters.party_name} onChange={handleFilter} placeholder="Filter supplier..." />
                        </div>
                        <div className="col-md-2 col-6">
                            <label className="form-label fw-semibold text-muted mb-1" style={{ fontSize: "0.72rem" }}>RETURN NO.</label>
                            <input type="text" className="form-control form-control-sm border-0 bg-light rounded-pill" name="return_no" value={filters.return_no} onChange={handleFilter} placeholder="Filter return..." />
                        </div>
                        <div className="col-md-2 col-6">
                            <label className="form-label fw-semibold text-muted mb-1" style={{ fontSize: "0.72rem" }}>INTERNAL LOT NO.</label>
                            <input type="text" className="form-control form-control-sm border-0 bg-light rounded-pill" name="internal_lot_no" value={filters.internal_lot_no} onChange={handleFilter} placeholder="Filter internal lot..." />
                        </div>
                        <div className="col-md-1 col-6 d-flex gap-2 align-items-end">
                            <button className="btn btn-outline-secondary btn-sm rounded-pill flex-fill" onClick={clearFilters}>
                                <i className="bi bi-x-circle me-1"></i>Clear
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Summary */}
            <div className="row g-3 mb-4">
                {[
                    { label: "Total Returns", value: records.length, grad: "#dc3545,#c82333", icon: "bi-layers" },
                    { label: "Total Qty (KG)", value: totalQty.toFixed(3), grad: "#0ea5e9,#0284c7", icon: "bi-graph-up-arrow" },
                ].map((c, i) => (
                    <div className="col-6 col-md-4" key={i}>
                        <div className="card border-0 rounded-4 shadow-sm h-100 position-relative overflow-hidden" style={{ background: `linear-gradient(135deg,${c.grad})`, color: "#fff" }}>
                            <div className="card-body p-4 d-flex align-items-center gap-3">
                                <div className="rounded-circle bg-white bg-opacity-25 d-flex align-items-center justify-content-center" style={{ width: 48, height: 48 }}>
                                    <i className={`bi ${c.icon} fs-4`}></i>
                                </div>
                                <div className="text-start">
                                    <div className="fs-3 fw-bold lh-1 mb-1">{c.value}</div>
                                    <div className="small opacity-75 fw-medium text-uppercase ls-wide" style={{ fontSize: "0.65rem", letterSpacing: "0.05em" }}>{c.label}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0" style={{ fontSize: "0.83rem" }}>
                            <thead className="table-dark">
                                <tr>
                                    <th className="ps-3" style={{ width: 40 }}>
                                        <input type="checkbox" className="form-check-input mt-0 shadow-none"
                                            checked={selected.size === records.length && records.length > 0}
                                            onChange={toggleAll} />
                                    </th>
                                    <th style={{ width: "13%" }}>RETURN NO.</th>
                                    <th style={{ width: "9%" }}>DATE</th>
                                    <th style={{ width: "11%" }}>INT. LOT NO.</th>
                                    <th style={{ width: "14%" }}>INT. LOT NAME</th>
                                    <th style={{ width: "16%" }}>SUPPLIER</th>
                                    <th style={{ width: "10%" }}>PROCESS</th>
                                    <th style={{ width: "8%" }}>QTY (KG)</th>
                                    <th className="text-center" style={{ width: "14%" }}>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading && <tr><td colSpan={9} className="text-center py-5"><span className="spinner-border spinner-border-sm text-primary me-2"></span>Loading records...</td></tr>}
                                {!loading && records.length === 0 && (
                                    <tr><td colSpan={9} className="text-center py-5 text-muted bg-light bg-opacity-50">
                                        <i className="bi bi-inbox fs-1 d-block mb-3 opacity-25"></i>
                                        <div className="fw-medium">No records found matching filters</div>
                                        <button className="btn btn-sm btn-link mt-2" onClick={clearFilters}>Reset all filters</button>
                                    </td></tr>
                                )}
                                {!loading && records.map((r, idx) => (
                                    <React.Fragment key={r.id}>
                                        <tr className={selected.has(r.id) ? "table-danger bg-opacity-10" : ""}>
                                            <td className="ps-3">
                                                <input type="checkbox" className="form-check-input mt-0 shadow-none"
                                                    checked={selected.has(r.id)} onChange={() => toggleSelect(r.id)} />
                                            </td>
                                            <td>
                                                <span className="badge fw-semibold px-2 py-1 rounded-pill"
                                                    style={{ background: "#fef2f2", color: "#dc3545", fontSize: "0.73rem" }}>
                                                    {r.return_no}
                                                </span>
                                            </td>
                                            <td className="text-muted">{fmt(r.return_date)}</td>
                                            <td className="fw-bold">{r.internal_lot_no || "—"}</td>
                                            <td className="text-muted small" style={{ maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.internal_lot_name || "—"}</td>
                                            <td className="fw-medium">{r.party_name || "—"}</td>
                                            <td><span className="badge bg-light text-danger border-0 small fw-normal">{r.process || "—"}</span></td>
                                            <td className="fw-bold text-primary">{parseFloat(r.total_qty || 0).toFixed(3)}</td>
                                            <td className="text-center">
                                                <div className="d-flex gap-1 justify-content-center">
                                                    <button className="btn btn-sm rounded-circle border-0 action-btn"
                                                        style={{ width: 28, height: 28, padding: 0, background: "#f1f5f9", color: "#475569" }}
                                                        title="Expand items" onClick={() => toggleExpand(r)}>
                                                        <i className={`bi ${expandedId === r.id ? "bi-chevron-up" : "bi-chevron-down"}`} style={{ fontSize: "0.7rem" }}></i>
                                                    </button>
                                                    <button className="btn btn-sm rounded-circle border-0 action-btn"
                                                        style={{ width: 28, height: 28, padding: 0, background: "#fef2f2", color: "#dc3545" }}
                                                        title="Print PDF" onClick={() => openPrint(r)}>
                                                        <i className="bi bi-printer" style={{ fontSize: "0.7rem" }}></i>
                                                    </button>
                                                    <button className="btn btn-sm rounded-circle border-0 action-btn text-warning"
                                                        style={{ width: 28, height: 28, padding: 0, background: "#fef3c7" }}
                                                        title="Edit record" onClick={() => navigate(`/edit-internal-lot-fabric-to-pcs-return/${r.id}`)}>
                                                        <i className="bi bi-pencil" style={{ fontSize: "0.7rem" }}></i>
                                                    </button>
                                                    <button className="btn btn-sm rounded-circle border-0 action-btn text-danger"
                                                        style={{ width: 28, height: 28, padding: 0, background: "#fee2e2" }}
                                                        title="Delete record" onClick={() => handleDelete(r.id)}>
                                                        <i className="bi bi-trash" style={{ fontSize: "0.7rem" }}></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                        {expandedId === r.id && (
                                            <tr>
                                                <td colSpan={9} className="p-0 border-0">
                                                    <div className="bg-light p-3 mx-3 mb-3 border rounded-4 shadow-sm" style={{ animation: "slideDown 0.2s ease" }}>
                                                        <div className="mb-2 d-flex justify-content-between align-items-center">
                                                            <h6 className="fw-bold m-0 small text-uppercase ls-wide text-danger">Item Breakdown</h6>
                                                            <span className="badge bg-white text-dark border px-2 py-1 rounded-pill small fw-normal">{itemsMap[r.id]?.length || 0} items</span>
                                                        </div>
                                                        <table className="table table-sm table-bordered bg-white m-0 rounded-3 overflow-hidden shadow-sm">
                                                            <thead className="table-light">
                                                                <tr style={{ fontSize: "0.68rem" }}>
                                                                    <th className="text-center" width="5%">#</th>
                                                                    <th className="text-center">COUNTS</th>
                                                                    <th>FABRIC NAME</th>
                                                                    <th className="text-center">GSM</th>
                                                                    <th className="text-center">DIA</th>
                                                                    <th className="text-center">COLOR</th>
                                                                    <th className="text-end pe-3">QTY (KG)</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody style={{ fontSize: "0.75rem" }}>
                                                                {itemsMap[r.id]?.map((it, i) => (
                                                                    <tr key={i}>
                                                                        <td className="text-center text-muted">{i + 1}</td>
                                                                        <td className="text-center fw-medium">{it.counts || "—"}</td>
                                                                        <td className="fw-semibold">{it.fabric_name}</td>
                                                                        <td className="text-center">{it.gsm || "—"}</td>
                                                                        <td className="text-center">{it.dia || "—"}</td>
                                                                        <td className="text-center">{it.color || "—"}</td>
                                                                        <td className="text-end fw-bold pe-3 text-primary">{parseFloat(it.qty || 0).toFixed(3)}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
                .action-btn:hover { transform: scale(1.1); transition: transform 0.2s; }
                .ls-wide { letter-spacing: 0.05em; }
            `}</style>
        </div>
    );
}
