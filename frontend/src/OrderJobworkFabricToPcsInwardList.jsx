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
            filename: `Fabric-Tops-Inward-${rec.inward_no || rec.id}.pdf`,
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
                        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#198754", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <i className="bi bi-printer text-white"></i>
                        </div>
                        <div>
                            <div className="fw-bold small">Print Preview</div>
                            <div className="text-muted" style={{ fontSize: "0.65rem" }}>Professional Fabric Tops Inward</div>
                        </div>
                    </div>
                    <div className="d-flex gap-2">
                        <button className="btn btn-success rounded-pill px-4 btn-sm fw-bold" onClick={downloadPDF}>
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
                            <div style={{ fontSize: "22px", fontWeight: "900", letterSpacing: "1px", textTransform: "uppercase", color: "#198754" }}>FABRIC TOPS INWARD</div>
                            <div style={{ fontSize: "16px", fontWeight: "800", marginTop: "5px" }}>{rec.inward_no || `INV-#${rec.id}`}</div>
                            <div style={{ fontSize: "12px", color: "#4b5563", marginTop: "2px" }}>Date: <strong>{fmt(rec.inward_date)}</strong></div>
                        </div>
                    </div>

                    {/* Info Boxes */}
                    <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
                        <div style={{ flex: 1, border: "1.5px solid #000" }}>
                            <div className="print-black-header" style={{ background: "#000", color: "#fff", padding: "6px 15px", fontSize: "11px", fontWeight: "800", textTransform: "uppercase" }}>BILLED FROM</div>
                            <div style={{ padding: "12px 15px", fontSize: "11px", lineHeight: "1.8" }}>
                                <div style={{ display: "flex" }}><span style={{ width: "90px", fontWeight: "700" }}>Supplier:</span> <span>{rec.party_name || "—"}</span></div>
                                <div style={{ display: "flex" }}><span style={{ width: "90px", fontWeight: "700" }}>Order No:</span> <span>{rec.order_no || "—"}</span></div>
                                <div style={{ display: "flex" }}><span style={{ width: "90px", fontWeight: "700" }}>Order Name:</span> <span>{rec.order_name || "—"}</span></div>
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
                            <div style={{ borderTop: "1px solid #000", paddingTop: "5px", fontSize: "10px", fontWeight: "700" }}>Receiver Signature</div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default function OrderJobworkFabricToPcsInwardList() {
    const navigate = useNavigate();
    const today = new Date().toISOString().substring(0, 10);
    const [filters, setFilters] = useState({ from_date: "", to_date: today, party_name: "", inward_no: "", order_no: "" });
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
            const res = await axios.get(`${API}/fabric-to-pcs-inward?${params}`);
            setAllRecords(res.data);
        } catch { setAllRecords([]); }
        finally { setLoading(false); }
    }, [filters.from_date, filters.to_date]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const records = useMemo(() => {
        return allRecords.filter(r => {
            const p = filters.party_name.toLowerCase();
            const o = filters.inward_no.toLowerCase();
            const n = filters.order_no.toLowerCase();
            if (p && !(r.party_name || "").toLowerCase().includes(p)) return false;
            if (o && !(r.inward_no || "").toLowerCase().includes(o)) return false;
            if (n && !(r.order_no || "").toLowerCase().includes(n)) return false;
            return true;
        });
    }, [allRecords, filters.party_name, filters.inward_no, filters.order_no]);

    const handleFilter = e => setFilters(p => ({ ...p, [e.target.name]: e.target.value }));
    const clearFilters = () => setFilters({ from_date: "", to_date: today, party_name: "", inward_no: "", order_no: "" });

    const toggleExpand = async (rec) => {
        if (expandedId === rec.id) { setExpandedId(null); return; }
        setExpandedId(rec.id);
        if (!itemsMap[rec.id]) {
            try {
                const res = await axios.get(`${API}/fabric-to-pcs-inward/${rec.id}`);
                setItemsMap(p => ({ ...p, [rec.id]: res.data.items || [] }));
            } catch { setItemsMap(p => ({ ...p, [rec.id]: [] })); }
        }
    };

    const openPrint = async (rec) => {
        let items = itemsMap[rec.id];
        if (!items) {
            try {
                const res = await axios.get(`${API}/fabric-to-pcs-inward/${rec.id}`);
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
        if (!window.confirm("Delete this inward record?")) return;
        await axios.delete(`${API}/fabric-to-pcs-inward/${id}`);
        fetchData();
    };

    const bulkDelete = async () => {
        if (!window.confirm(`Delete ${selected.size} selected record(s)?`)) return;
        try {
            await axios.delete(`${API}/fabric-to-pcs-inward/bulk`, { data: { ids: Array.from(selected) } });
            fetchData();
        } catch (err) { alert(err.response?.data?.error || "Delete failed"); }
    };

    const totalQty = records.reduce((s, r) => s + (parseFloat(r.total_qty) || 0), 0);

    return (
        <div className="container-fluid py-4 min-vh-100 bg-light px-3 px-md-4">
            {printRec && <PrintModal rec={printRec} items={printItems} onClose={() => setPrintRec(null)} />}
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
                    border-color: #10b981 !important;
                    box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1) !important;
                }
            `}</style>

            <div className="mx-auto" style={{ maxWidth: "1500px" }}>
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
                    <div className="d-flex align-items-center gap-3">
                        <button className="btn btn-outline-secondary btn-premium border shadow-sm bg-white" onClick={() => navigate("/garments")}>
                            <i className="bi bi-arrow-left me-1"></i>Back
                        </button>
                        <div>
                            <div className="d-flex align-items-center gap-2 mb-1">
                                <span className="badge bg-dark rounded-pill px-3 py-2 text-white" style={{ fontSize: "0.65rem", letterSpacing: "0.05em" }}>ORDER JOBWORK</span>
                                <span className="badge rounded-pill px-3 py-2 text-white" style={{ background: "#10b981", fontSize: "0.65rem" }}>Fabric Tops Inward</span>
                            </div>
                            <h2 className="fw-900 mb-0 ls-1 text-dark" style={{ fontSize: "1.75rem" }}>Fabric Inward List</h2>
                        </div>
                    </div>
                    <div className="d-flex gap-2">
                        {selected.size > 0 && (
                            <button className="btn btn-danger btn-premium shadow-sm" onClick={bulkDelete}>
                                <i className="bi bi-trash me-2"></i>Delete Selected ({selected.size})
                            </button>
                        )}
                        <button className="btn btn-success btn-premium shadow-sm fw-bold" style={{ background: "#10b981", borderColor: "#10b981" }} onClick={() => navigate("/order-jobwork-fabric-to-pcs-inward")}>
                            <i className="bi bi-plus-lg me-2"></i>New Inward
                        </button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="row g-3 mb-4">
                    {[
                        { label: "Total Inwards", value: records.length, grad: "#10b981, #059669", icon: "bi-layers" },
                        { label: "Total Qty (KG)", value: totalQty.toFixed(3), grad: "#0ea5e9, #0284c7", icon: "bi-graph-up-arrow" },
                    ].map((c, i) => (
                        <div className="col-6 col-md-3" key={i}>
                            <div className="card border-0 rounded-4 shadow-sm h-100 position-relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${c.grad})`, color: "#fff" }}>
                                <div className="card-body p-4 d-flex align-items-center gap-3">
                                    <div className="rounded-circle bg-white bg-opacity-25 d-flex align-items-center justify-content-center" style={{ width: 48, height: 48 }}>
                                        <i className={`bi ${c.icon} fs-4 text-white`}></i>
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

                {/* Quick Filters */}
                <div className="card mb-4 overflow-hidden">
                    <div className="card-body p-4 bg-white border-bottom">
                        <div className="row g-3">
                            <div className="col-md-2">
                                <label className="form-label small fw-bold text-muted mb-2 text-uppercase ls-1" style={{ fontSize: '0.65rem' }}>From Date</label>
                                <input type="date" className="form-control form-control-premium" name="from_date" value={filters.from_date} onChange={handleFilter} />
                            </div>
                            <div className="col-md-2">
                                <label className="form-label small fw-bold text-muted mb-2 text-uppercase ls-1" style={{ fontSize: '0.65rem' }}>To Date</label>
                                <input type="date" className="form-control form-control-premium" name="to_date" value={filters.to_date} onChange={handleFilter} />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small fw-bold text-muted mb-2 text-uppercase ls-1" style={{ fontSize: '0.65rem' }}>Party Name</label>
                                <input type="text" className="form-control form-control-premium" name="party_name" value={filters.party_name} onChange={handleFilter} placeholder="Search supplier..." />
                            </div>
                            <div className="col-md-2">
                                <label className="form-label small fw-bold text-muted mb-2 text-uppercase ls-1" style={{ fontSize: '0.65rem' }}>Inward No.</label>
                                <input type="text" className="form-control form-control-premium" name="inward_no" value={filters.inward_no} onChange={handleFilter} placeholder="Search inward..." />
                            </div>
                            <div className="col-md-2">
                                <label className="form-label small fw-bold text-muted mb-2 text-uppercase ls-1" style={{ fontSize: '0.65rem' }}>Order No.</label>
                                <input type="text" className="form-control form-control-premium" name="order_no" value={filters.order_no} onChange={handleFilter} placeholder="Search order..." />
                            </div>
                            <div className="col-md-1 d-flex align-items-end">
                                <button className="btn btn-white btn-premium border shadow-sm w-100 p-2" onClick={clearFilters} title="Clear Filters">
                                    <i className="bi bi-x-circle text-muted"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead>
                                <tr>
                                    <th className="ps-4" style={{ width: 40 }}>
                                        <input type="checkbox" className="form-check-input mt-0 shadow-none"
                                            checked={selected.size === records.length && records.length > 0}
                                            onChange={toggleAll} />
                                    </th>
                                    <th>INWARD NO.</th>
                                    <th>DATE</th>
                                    <th>ORDER DETAILS</th>
                                    <th>SUPPLIER / PARTY</th>
                                    <th>PROCESS</th>
                                    <th className="text-center">QTY (KG)</th>
                                    <th className="text-end pe-4">ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody className="border-top-0">
                                {loading ? (
                                    <tr><td colSpan="9" className="text-center py-5"><div className="spinner-border spinner-border-sm text-primary"></div></td></tr>
                                ) : records.length === 0 ? (
                                    <tr><td colSpan="9" className="text-center py-5">
                                        <div className="text-muted py-4">
                                            <i className="bi bi-inbox fs-1 d-block mb-2 opacity-25"></i>
                                            <div className="fw-medium">No records found matching filters</div>
                                        </div>
                                    </td></tr>
                                ) : records.map((r, idx) => (
                                    <React.Fragment key={r.id}>
                                        <tr className={selected.has(r.id) ? "table-light" : ""}>
                                            <td className="ps-4">
                                                <input type="checkbox" className="form-check-input mt-0"
                                                    checked={selected.has(r.id)} onChange={() => toggleSelect(r.id)} />
                                            </td>
                                            <td>
                                                <span className="badge rounded-pill px-3 py-2 fw-bold" style={{ background: "#f0fdf4", color: "#16a34a", fontSize: '0.75rem' }}>
                                                    {r.inward_no}
                                                </span>
                                            </td>
                                            <td className="fw-medium text-dark">{fmt(r.inward_date)}</td>
                                            <td>
                                                <div className="fw-bold text-dark">{r.order_no || "—"}</div>
                                                <div className="text-muted small" style={{ fontSize: '0.7rem' }}>{r.order_name || "—"}</div>
                                            </td>
                                            <td>
                                                <div className="fw-semibold text-dark">{r.party_name || "—"}</div>
                                            </td>
                                            <td>
                                                <span className="badge bg-light text-success fw-bold border rounded-pill px-3" style={{ fontSize: '0.7rem' }}>
                                                    {r.process || "—"}
                                                </span>
                                            </td>
                                            <td className="text-center">
                                                <div className="fw-800 text-dark" style={{ fontWeight: 800 }}>{parseFloat(r.total_qty || 0).toFixed(3)}</div>
                                            </td>
                                            <td className="text-end pe-4">
                                                <div className="d-flex justify-content-end gap-2">
                                                    <button className="btn btn-sm btn-light rounded-circle border-0 action-btn p-0"
                                                        style={{ width: 32, height: 32, background: '#f8fafc' }} onClick={() => toggleExpand(r)} title="Expand Details">
                                                        <i className={`bi ${expandedId === r.id ? "bi-chevron-up" : "bi-chevron-down"} text-dark`} style={{ fontSize: '0.85rem' }}></i>
                                                    </button>
                                                    <button className="btn btn-sm btn-light rounded-circle border-0 action-btn p-0"
                                                        style={{ width: 32, height: 32, background: '#f8fafc' }} onClick={() => openPrint(r)} title="Print">
                                                        <i className="bi bi-printer text-dark" style={{ fontSize: '0.85rem' }}></i>
                                                    </button>
                                                    <button className="btn btn-sm btn-light rounded-circle border-0 action-btn p-0"
                                                        style={{ width: 32, height: 32, background: '#eff6ff' }} onClick={() => navigate(`/edit-order-jobwork-fabric-to-pcs-inward/${r.id}`)} title="Edit">
                                                        <i className="bi bi-pencil text-primary" style={{ fontSize: '0.85rem' }}></i>
                                                    </button>
                                                    <button className="btn btn-sm btn-light rounded-circle border-0 action-btn p-0"
                                                        style={{ width: 32, height: 32, background: '#fff1f2' }} onClick={() => handleDelete(r.id)} title="Delete">
                                                        <i className="bi bi-trash text-danger" style={{ fontSize: '0.85rem' }}></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                        {expandedId === r.id && (
                                            <tr>
                                                <td colSpan={9} className="p-0 border-0">
                                                    <div className="bg-light p-4 mx-4 mb-4 rounded-4 shadow-sm animate__animated animate__fadeIn">
                                                        <div className="mb-3 d-flex justify-content-between align-items-center">
                                                            <h6 className="fw-bold m-0 text-uppercase ls-1 text-success" style={{ fontSize: '0.75rem' }}>Detailed Item Information</h6>
                                                            <span className="badge bg-white text-dark border px-3 py-2 rounded-pill small fw-bold">{itemsMap[r.id]?.length || 0} ITEMS</span>
                                                        </div>
                                                        <div className="table-responsive rounded-3 border bg-white overflow-hidden shadow-sm">
                                                            <table className="table table-sm table-hover mb-0">
                                                                <thead className="table-light">
                                                                    <tr style={{ fontSize: "0.65rem" }}>
                                                                        <th className="text-center ps-3" width="5%">#</th>
                                                                        <th>COUNTS</th>
                                                                        <th>FABRIC NAME</th>
                                                                        <th>GSM/DIA</th>
                                                                        <th>COLOR</th>
                                                                        <th className="text-end pe-4">QTY (KG)</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody style={{ fontSize: "0.8rem" }}>
                                                                    {itemsMap[r.id]?.map((it, i) => (
                                                                        <tr key={i}>
                                                                            <td className="text-center text-muted ps-3 fw-bold">{i + 1}</td>
                                                                            <td className="fw-medium">{it.counts || "—"}</td>
                                                                            <td className="fw-bold text-dark">{it.fabric_name}</td>
                                                                            <td>
                                                                                <div className="text-dark fw-medium">{it.gsm || "—"} / {it.dia || "—"}</div>
                                                                            </td>
                                                                            <td>{it.color || "—"}</td>
                                                                            <td className="text-end fw-bold pe-4 text-primary">{parseFloat(it.qty || 0).toFixed(3)}</td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
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
                .action-btn { transition: all 0.2s ease; }
                .action-btn:hover { transform: scale(1.1); box-shadow: 0 4px 8px rgba(0,0,0,0.05); }
                .animate__fadeIn { animation: fadeIn 0.3s ease-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
}
