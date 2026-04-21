import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import axios from "axios";
import html2pdf from "html2pdf.js";
import "bootstrap/dist/css/bootstrap.min.css";

const API = process.env.REACT_APP_API_URL;

export default function OrderDetailedReport() {
    const [orders, setOrders] = useState([]);
    const [selectedOrderNo, setSelectedOrderNo] = useState("");
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [companyProfile, setCompanyProfile] = useState(null);

    // Searchable dropdown state
    const [searchOpen, setSearchOpen] = useState(false);
    const [orderSearchTerm, setOrderSearchTerm] = useState("");
    const dropdownRef = useRef(null);
    const reportRef = useRef(null);

    useEffect(() => {
        axios.get(`${API}/yarn-dyeing-outward/orders`)
            .then(res => setOrders(res.data || []))
            .catch(err => console.error("Error fetching orders:", err));

        axios.get(`${API}/company-profile`)
            .then(res => setCompanyProfile(res.data))
            .catch(err => console.error("Error fetching company profile:", err));

        // Close dropdown when clicking outside
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setSearchOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchOrderDetails = useCallback(async (orderNo) => {
        if (!orderNo) return;
        setLoading(true);
        try {
            const res = await axios.get(`${API}/erp-reports/order-details/${encodeURIComponent(orderNo)}`);
            setReportData(res.data);
        } catch (err) {
            console.error("Error fetching details:", err);
            setReportData(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (selectedOrderNo) fetchOrderDetails(selectedOrderNo);
    }, [selectedOrderNo, fetchOrderDetails]);

    const handlePrint = () => window.print();

    const handleDownloadPDF = () => {
        if (!reportRef.current || !selectedOrderNo) return;

        const element = reportRef.current;
        const opt = {
            margin: [5, 5, 5, 5],
            filename: `Report_${selectedOrderNo}_${new Date().getTime()}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: {
                scale: 2,
                useCORS: true,
                logging: false,
                letterRendering: true,
                windowWidth: 1200
            },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
            pagebreak: { mode: ['css', 'legacy'] }
        };

        // Add a temporary class to the element to apply PDF-specific styling if needed
        element.classList.add('pdf-downloading');

        html2pdf().set(opt).from(element).save().then(() => {
            element.classList.remove('pdf-downloading');
        });
    };

    // Helper to format date
    const formatDate = (dateStr) => {
        if (!dateStr) return "-";
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const getPcsFromSizes = (data) => {
        if (!data) return 0;
        try {
            const sizes = typeof data === 'string' ? JSON.parse(data) : data;
            return Object.values(sizes).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
        } catch (e) { return 0; }
    };

    // ─── Reconciliation logic ──────────────────────────────────────────────────

    const procurementReconciliation = useMemo(() => {
        if (!reportData) return [];
        const result = [];
        const categories = ['yarn', 'fabric', 'trims', 'garments'];

        categories.forEach(cat => {
            const pos = reportData.pos[cat] || [];
            const grns = reportData.grns[cat] || [];
            const usedGrnIds = new Set();

            pos.forEach(po => {
                const linkedGrns = grns.filter(g => g.po_no === po.po_no);
                linkedGrns.forEach(g => usedGrnIds.add(g.id));
                result.push({
                    type: cat.toUpperCase(),
                    po: po,
                    grns: linkedGrns
                });
            });

            grns.filter(g => !usedGrnIds.has(g.id)).forEach(g => {
                result.push({
                    type: cat.toUpperCase(),
                    po: null,
                    grns: [g]
                });
            });
        });
        return result;
    }, [reportData]);

    const jobworkReconciliation = useMemo(() => {
        if (!reportData) return [];
        const allOut = [...reportData.jobwork.yarn_to_fabric.outward, ...reportData.jobwork.fabric_to_pcs.outward, ...reportData.jobwork.pcs.outward];
        const allIn = [...reportData.jobwork.yarn_to_fabric.inward, ...reportData.jobwork.fabric_to_pcs.inward, ...reportData.jobwork.pcs.inward];
        const allRet = [...reportData.jobwork.yarn_to_fabric.return, ...reportData.jobwork.fabric_to_pcs.return, ...reportData.jobwork.pcs.return];

        const processMap = {};
        const getProcessKey = (h) => (h.process || "Other").trim();

        allOut.forEach(h => {
            const key = getProcessKey(h);
            if (!processMap[key]) processMap[key] = { process: key, outs: [], ins: [], rets: [] };
            processMap[key].outs.push(h);
        });
        allIn.forEach(h => {
            const key = getProcessKey(h);
            if (!processMap[key]) processMap[key] = { process: key, outs: [], ins: [], rets: [] };
            processMap[key].ins.push(h);
        });
        allRet.forEach(h => {
            const key = getProcessKey(h);
            if (!processMap[key]) processMap[key] = { process: key, outs: [], ins: [], rets: [] };
            processMap[key].rets.push(h);
        });

        return Object.values(processMap).sort((a, b) => {
            const dateA = new Date(a.outs[0]?.outward_date || a.ins[0]?.inward_date || 0);
            const dateB = new Date(b.outs[0]?.outward_date || b.ins[0]?.inward_date || 0);
            return dateA - dateB;
        });
    }, [reportData]);

    // Summary calculation for KPIs
    const kpis = useMemo(() => {
        if (!reportData) return null;
        const totalPO = procurementReconciliation.reduce((sum, p) => sum + (p.po ? parseFloat(p.po.total_qty || 0) : 0), 0);
        const totalRecd = procurementReconciliation.reduce((sum, p) => sum + p.grns.reduce((s, g) => s + parseFloat(g.total_qty || 0), 0), 0);

        const totalJWOut = jobworkReconciliation.reduce((sum, j) => sum + j.outs.reduce((s, o) => s + parseFloat(o.total_qty || o.qty || 0), 0), 0);
        const totalJWIn = jobworkReconciliation.reduce((sum, j) => {
            let inVal = 0;
            const isCutting = j.process.toLowerCase().includes('cutting');
            j.ins.forEach(i => i.items?.forEach(it => {
                inVal += isCutting ? (getPcsFromSizes(it.sizes_data) || parseFloat(it.pcs || 0)) : parseFloat(it.qty || it.pcs || 0);
            }));
            return sum + inVal;
        }, 0);

        return { totalPO, totalRecd, totalJWOut, totalJWIn };
    }, [reportData, procurementReconciliation, jobworkReconciliation]);

    const filteredOrders = useMemo(() => {
        return orders.filter(o =>
            o.order_no.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
            o.order_name.toLowerCase().includes(orderSearchTerm.toLowerCase())
        );
    }, [orders, orderSearchTerm]);

    // ─── Rendering Components ──────────────────────────────────────────────────

    const ReconciliationRow = ({ item, isProcurement }) => {
        const [expanded, setExpanded] = useState(false);

        if (isProcurement) {
            const { type, po, grns } = item;
            const totalOut = po ? parseFloat(po.total_qty || 0) : 0;
            const totalIn = grns.reduce((sum, g) => sum + parseFloat(g.total_qty || 0), 0);
            const balance = totalOut - totalIn;

            return (
                <React.Fragment>
                    <tr className={`align-middle ${expanded ? 'bg-primary-subtle' : ''} report-row`}
                        onClick={() => setExpanded(!expanded)}>
                        <td><span className="badge bg-secondary-subtle text-secondary border">{type}</span></td>
                        <td>{po ? <div className="text-muted small-text">{formatDate(po.create_date)}</div> : "—"}</td>
                        <td><div className="truncate fw-medium" style={{ maxWidth: 220 }}>{po?.supplier_name || grns[0]?.supplier_name || "-"}</div></td>
                        <td className="text-end fw-bold">{po ? totalOut.toFixed(2) : "-"}</td>
                        <td className="border-start">
                            <div className="text-muted small-text">
                                {grns.map((g, i) => <div key={i}>{formatDate(g.grn_date)}</div>)}
                                {grns.length === 0 && "—"}
                            </div>
                        </td>
                        <td className="text-end fw-bold text-success">{totalIn.toFixed(2)}</td>
                        <td className={`text-end fw-bold ${balance > 0 ? 'text-danger' : 'text-success'}`}>
                            {po ? balance.toFixed(2) : "-"}
                        </td>
                        <td className="text-center no-print"><i className={`bi bi-chevron-${expanded ? 'up' : 'down'}`}></i></td>
                    </tr>
                    {expanded && (
                        <tr>
                            <td colSpan="8" className="bg-light p-4 animate__animated animate__fadeIn border-bottom">
                                <div className="row g-4">
                                    <div className="col-md-6">
                                        <div className="d-flex align-items-center mb-3">
                                            <div className="icon-badge bg-primary-subtle text-primary me-2"><i className="bi bi-file-earmark-text"></i></div>
                                            <h6 className="mb-0 fw-bold uppercase-title">PO Details <span className="text-muted fw-normal ms-2">{po?.po_no}</span></h6>
                                        </div>
                                        {po?.items ? (
                                            <div className="table-responsive rounded-3 border">
                                                <table className="table table-sm mb-0">
                                                    <thead className="table-light"><tr><th>Item</th><th>Color</th><th className="text-end">Qty</th></tr></thead>
                                                    <tbody>
                                                        {po.items.map((it, idx) => (
                                                            <tr key={idx}>
                                                                <td>{it.yarn_name || it.fabric_name || it.trims_name || it.style_name}</td>
                                                                <td>{it.color}</td>
                                                                <td className="text-end">{parseFloat(it.qty || it.pcs || 0).toFixed(2)}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : <p className="text-muted small p-2">No PO items found</p>}
                                    </div>
                                    <div className="col-md-6 border-start">
                                        <div className="d-flex align-items-center mb-3">
                                            <div className="icon-badge bg-success-subtle text-success me-2"><i className="bi bi-box-seam"></i></div>
                                            <h6 className="mb-0 fw-bold uppercase-title">Receipts (GRN)</h6>
                                        </div>
                                        {grns.some(g => g.items) ? (
                                            <div className="table-responsive rounded-3 border">
                                                <table className="table table-sm mb-0">
                                                    <thead className="table-light"><tr><th>Item</th><th>Color</th><th className="text-end">Qty</th></tr></thead>
                                                    <tbody>
                                                        {grns.map(g => g.items?.map((it, idx) => (
                                                            <tr key={`${g.id}-${idx}`}>
                                                                <td>{it.yarn_name || it.fabric_name || it.trims_name || it.style_name || it.item_name}</td>
                                                                <td>{it.color || it.item_color || it.style_color || "-"}</td>
                                                                <td className="text-end">{parseFloat(it.qty || it.pcs || 0).toFixed(2)}</td>
                                                            </tr>
                                                        )))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : <p className="text-muted small p-2">No GRN items found</p>}
                                    </div>
                                </div>
                            </td>
                        </tr>
                    )}
                </React.Fragment>
            );
        } else {
            const { process, outs, ins, rets } = item;
            const isCutting = process.toLowerCase().includes('cutting');
            const totalOutVal = outs.reduce((sum, o) => sum + parseFloat(o.total_qty || o.qty || 0), 0);

            let totalInVal = 0;
            if (isCutting) {
                ins.forEach(i => i.items?.forEach(it => {
                    totalInVal += getPcsFromSizes(it.sizes_data) || parseFloat(it.pcs || 0);
                }));
            } else {
                totalInVal = ins.reduce((sum, i) => sum + parseFloat(i.total_qty || i.qty || 0), 0);
            }
            const totalRetVal = rets.reduce((sum, r) => sum + parseFloat(r.total_qty || r.qty || 0), 0);
            const balanceVal = totalOutVal - totalInVal - totalRetVal;

            return (
                <React.Fragment>
                    <tr className={`align-middle ${expanded ? 'bg-info-subtle' : ''} report-row`}
                        onClick={() => setExpanded(!expanded)}>
                        <td><div className="fw-bold fs-6">{process}</div></td>
                        <td>
                            <div className="text-muted small-text">
                                {outs.map((o, idx) => <div key={idx}>{formatDate(o.outward_date)}</div>)}
                                {outs.length === 0 && "—"}
                            </div>
                        </td>
                        <td className="text-end fw-bold">{totalOutVal > 0 ? totalOutVal.toFixed(2) : "—"}</td>
                        <td className="border-start">
                            <div className="text-muted small-text">
                                {ins.map((i, idx) => <div key={idx}>{formatDate(i.inward_date)}</div>)}
                                {ins.length === 0 && "—"}
                            </div>
                        </td>
                        <td className="text-end fw-bold text-success">
                            {totalInVal > 0 ? totalInVal.toFixed(2) : "—"}
                            {isCutting && totalInVal > 0 && <span className="ms-1 tiny-text opacity-75">pcs</span>}
                        </td>
                        <td className="border-start text-end text-warning fw-bold">{totalRetVal > 0 ? totalRetVal.toFixed(2) : "—"}</td>
                        <td className={`border-start text-end fw-bold ${balanceVal > 0 ? 'text-danger' : 'text-success'}`}>
                            {totalOutVal > 0 ? balanceVal.toFixed(2) : "—"}
                        </td>
                        <td className="text-center no-print"><i className={`bi bi-chevron-${expanded ? 'up' : 'down'}`}></i></td>
                    </tr>
                    {expanded && (
                        <tr>
                            <td colSpan="8" className="bg-light p-4 animate__animated animate__fadeIn border-bottom">
                                <div className="row g-4">
                                    <div className="col-md-6">
                                        <div className="d-flex align-items-center mb-3">
                                            <div className="icon-badge bg-primary-subtle text-primary me-2"><i className="bi bi-truck"></i></div>
                                            <h6 className="mb-0 fw-bold uppercase-title">Outward Sent</h6>
                                        </div>
                                        <div className="table-responsive rounded-3 border">
                                            <table className="table table-sm mb-0">
                                                <thead className="table-light"><tr><th>{process.toLowerCase().includes('knitting') ? 'Yarn Name' : 'Item'}</th><th className="text-end">Qty</th></tr></thead>
                                                <tbody>
                                                    {outs.map(o => o.items?.map((it, idx) => (
                                                        <tr key={`${o.id}-${idx}`}>
                                                            <td>{it.yarn_name || it.fabric_name || it.item_name || it.style_name}</td>
                                                            <td className="text-end">{parseFloat(it.qty || it.pcs || 0).toFixed(2)}</td>
                                                        </tr>
                                                    )))}
                                                    {outs.length === 0 && <tr><td colSpan="2" className="text-center text-muted py-2">No outward records</td></tr>}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                    <div className="col-md-6 border-start">
                                        <div className="d-flex align-items-center mb-3">
                                            <div className="icon-badge bg-success-subtle text-success me-2"><i className="bi bi-check-all"></i></div>
                                            <h6 className="mb-0 fw-bold uppercase-title">Inward Receipts</h6>
                                        </div>
                                        <div className="table-responsive rounded-3 border">
                                            <table className="table table-sm mb-0">
                                                <thead className="table-light">
                                                    <tr><th>Item</th>{isCutting ? <><th className="text-end">Cut Wt</th><th className="text-end">Pcs</th></> : <th className="text-end">Qty</th>}</tr>
                                                </thead>
                                                <tbody>
                                                    {ins.map(i => i.items?.map((it, idx) => (
                                                        <tr key={`${i.id}-${idx}`}>
                                                            <td>{it.fabric_name || it.yarn_name || it.item_name || it.style_name}</td>
                                                            {isCutting ? (
                                                                <><td className="text-end">{parseFloat(it.cut_pcs_wt || 0).toFixed(3)}kg</td><td className="text-end fw-bold text-primary">{getPcsFromSizes(it.sizes_data).toFixed(0)}</td></>
                                                            ) : <td className="text-end">{parseFloat(it.qty || it.pcs || 0).toFixed(2)}</td>}
                                                        </tr>
                                                    )))}
                                                    {ins.length === 0 && <tr><td colSpan={isCutting ? 3 : 2} className="text-center text-muted py-2">No inward records</td></tr>}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    )}
                </React.Fragment>
            );
        }
    };

    return (
        <div className="container-fluid py-4 min-vh-100 bg-app">
            <style>{`
                :root {
                    --app-primary: #004ecc;
                    --app-secondary: #64748b;
                    --table-header: #1e293b;
                    --app-bg: #f8fafc;
                }
                .bg-app { background-color: var(--app-bg); }
                @media print {
                    @page { 
                        size: landscape; 
                        margin: 10mm; 
                    }
                    .no-print { display: none !important; }
                    .card { 
                        border: 1px solid #000 !important; 
                        margin-bottom: 20px !important; 
                        box-shadow: none !important; 
                        border-radius: 8px !important;
                        break-inside: avoid;
                        padding: 10px !important;
                    }
                    body { 
                        background: white !important; 
                        font-size: 9pt; 
                        color: #000 !important;
                    }
                    .container-fluid { padding: 0 !important; }
                    .section-break { page-break-before: auto; margin-top: 15px; }
                    .table { 
                        width: 100% !important; 
                        border: 1px solid #000 !important; 
                        border-collapse: collapse !important;
                        margin-bottom: 0 !important;
                    }
                    .table thead th { 
                        background-color: #000 !important; 
                        color: #fff !important; 
                        font-weight: bold;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                        text-transform: uppercase;
                        font-size: 8pt;
                        border: 1px solid #000 !important;
                    }
                    .table th, .table td { 
                        border: 1px solid #000 !important;
                        padding: 4px 6px !important;
                        vertical-align: middle !important;
                    }
                    .bg-light { background-color: transparent !important; }
                    .p-4 { padding: 10px !important; }
                    .rounded-3 { border-radius: 0 !important; }
                    .border { border: 1px solid #000 !important; }
                    .section-header {
                        background: #f1f5f9 !important;
                        padding: 6px 10px !important;
                        margin-bottom: 8px !important;
                        border-left: 5px solid #000 !important;
                        font-weight: 800 !important;
                        color: #000 !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    .kpi-card {
                        border: 1px solid #000 !important;
                        break-inside: avoid;
                        background: #fff !important;
                        padding: 8px !important;
                    }
                    .badge {
                        border: 1px solid #000 !important;
                        color: #000 !important;
                        background: transparent !important;
                        font-weight: bold !important;
                    }
                    .report-row {
                        break-inside: avoid;
                    }
                    .bi-chevron-up, .bi-chevron-down { display: none !important; }
                    .icon-badge { display: none !important; }
                    .text-success, .text-danger, .text-warning, .text-primary { color: #000 !important; }
                    
                    /* Alignment fixes */
                    .text-end { text-align: right !important; }
                    .text-center { text-align: center !important; }
                    .fw-bold { font-weight: bold !important; }
                    
                    /* Ensure headers don't break */
                    .table thead th { white-space: nowrap !important; }
                    
                    /* Force visibility of colors for some elements if using browser print */
                    .badge { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                }
                
                /* PDF Specific refinements when downloading via html2pdf */
                .pdf-downloading {
                    background: white !important;
                    width: 1000px !important; /* Fixed width for stable rendering */
                    margin: 0 !important;
                    padding: 10px !important;
                }
                .pdf-downloading .card, .pdf-downloading .section-break { 
                    margin-bottom: 10px !important; 
                    break-inside: avoid !important;
                }
                .pdf-downloading .card-body { padding: 10px !important; }
                .pdf-downloading .section-header { margin-bottom: 10px !important; }
                .pdf-downloading .table { font-size: 8.5pt !important; }
                .pdf-downloading .no-print { display: none !important; }
                .pdf-downloading .kpi-card { padding: 5px !important; }
                .pdf-downloading h5 { font-size: 1rem !important; }
                .premium-title { font-weight: 800; color: #0f172a; letter-spacing: -0.5px; }
                .section-card { border: none; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03); overflow: hidden; }
                .section-header { border-left: 5px solid var(--app-primary); padding-left: 15px; margin-bottom: 25px; font-weight: 700; color: #1e293b; font-size: 1.1rem; }
                .kpi-card { border: none; border-radius: 16px; transition: transform 0.2s; background: white; border: 1px solid #f1f5f9; }
                .kpi-card:hover { transform: translateY(-3px); }
                .report-row { cursor: pointer; transition: all 0.2s; border-bottom: 1px solid #f1f5f9; }
                .report-row:hover { background-color: #f8fafc; }
                .small-text { font-size: 11px; color: #64748b; }
                .tiny-text { font-size: 9px; text-transform: uppercase; }
                .uppercase-title { text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.5px; color: #64748b; }
                .icon-badge { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 8px; font-size: 1rem; }
                .truncate { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                
                /* Custom Dropdown Styles */
                .custom-select-container { position: relative; width: 300px; }
                .custom-select-trigger { 
                    background: white; border: 1px solid #e2e8f0; border-radius: 10px; padding: 8px 16px; 
                    cursor: pointer; display: flex; justify-content: space-between; align-items: center;
                    font-weight: 500; font-size: 0.9rem; transition: border-color 0.2s;
                }
                .custom-select-trigger:hover { border-color: var(--app-primary); }
                .dropdown-menu-custom {
                    position: absolute; top: 100%; left: 0; right: 0; background: white; 
                    border: 1px solid #e2e8f0; border-radius: 10px; margin-top: 5px; z-index: 1000;
                    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); max-height: 400px; overflow-y: auto;
                }
                .search-input-group { padding: 10px; border-bottom: 1px solid #f1f5f9; position: sticky; top: 0; background: white; }
                .search-input { width: 100%; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px 10px; font-size: 0.85rem; outline: none; }
                .search-input:focus { border-color: var(--app-primary); }
                .order-option { 
                    padding: 10px 15px; cursor: pointer; transition: background 0.2s; border-bottom: 1px solid #f8fafc;
                    display: flex; flex-direction: column;
                }
                .order-option:hover { background: #f1f5f9; }
                .order-option.selected { border-left: 3px solid var(--app-primary); background: #eff6ff; }
            `}</style>

            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 no-print px-3 gap-3">
                <h2 className="premium-title mb-0">Order Reconciliation History</h2>
                <div className="d-flex gap-2 align-items-center">
                    <div className="custom-select-container" ref={dropdownRef}>
                        <div className="custom-select-trigger shadow-sm" onClick={() => setSearchOpen(!searchOpen)}>
                            <span className="truncate">{selectedOrderNo ? orders.find(o => o.order_no === selectedOrderNo)?.order_no || selectedOrderNo : "— Select Order —"}</span>
                            <i className={`bi bi-chevron-${searchOpen ? 'up' : 'down'} ms-2`}></i>
                        </div>
                        {searchOpen && (
                            <div className="dropdown-menu-custom animate__animated animate__fadeInDown animate__faster">
                                <div className="search-input-group">
                                    <input
                                        type="text" autoFocus className="search-input" placeholder="Search order # or name..."
                                        value={orderSearchTerm} onChange={(e) => setOrderSearchTerm(e.target.value)}
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                </div>
                                <div className="options-list">
                                    {filteredOrders.length > 0 ? filteredOrders.map(o => (
                                        <div key={o.order_no}
                                            className={`order-option ${selectedOrderNo === o.order_no ? 'selected' : ''}`}
                                            onClick={() => { setSelectedOrderNo(o.order_no); setSearchOpen(false); }}>
                                            <span className="fw-bold text-dark fs-7">{o.order_no}</span>
                                            <span className="small text-muted truncate">{o.order_name}</span>
                                        </div>
                                    )) : <div className="p-3 text-center text-muted small">No orders found</div>}
                                </div>
                            </div>
                        )}
                    </div>
                    <button className="btn btn-outline-danger btn-sm rounded-3 px-3 shadow-sm py-2 fw-medium" onClick={handleDownloadPDF} disabled={!reportData}>
                        <i className="bi bi-file-earmark-pdf me-2"></i> PDF
                    </button>
                    <button className="btn btn-dark btn-sm rounded-3 px-3 shadow-sm py-2 fw-medium" onClick={handlePrint} disabled={!reportData}>
                        <i className="bi bi-printer me-2"></i> PRINT
                    </button>
                </div>
            </div>

            {!reportData && !loading && (
                <div className="text-center py-5 no-print animate__animated animate__fadeIn">
                    <img src="https://cdni.iconscout.com/illustration/premium/thumb/empty-state-2130362-1800926.png"
                        alt="Empty" style={{ maxWidth: 250, opacity: 0.8 }} />
                    <h5 className="mt-4 text-dark fw-bold">No Order Selected</h5>
                    <p className="text-muted">Use the powerful search above to find any order and view its complete lifecycle history.</p>
                </div>
            )}

            {loading && (
                <div className="text-center py-5 no-print">
                    <div className="spinner-grow text-primary" role="status"></div>
                    <p className="mt-3 text-secondary fw-medium">Assembling reconciliation dashboard...</p>
                </div>
            )}

            {reportData && (
                <div className="px-3 animate__animated animate__fadeIn" ref={reportRef}>
                    {/* Print Header */}
                    {companyProfile && (
                        <div className="d-none d-print-block mb-4">
                            <div className="d-flex justify-content-between align-items-start border-bottom pb-3">
                                <div style={{ textAlign: 'left' }}>
                                    <h2 className="fw-bold mb-1 text-dark" style={{ fontSize: '26px', letterSpacing: '-1px' }}>{companyProfile.company_name}</h2>
                                    <p className="mb-0 text-secondary" style={{ fontSize: '12px', maxWidth: '400px' }}>{companyProfile.address}</p>
                                    <div className="mt-2" style={{ fontSize: '11px' }}>
                                        <span className="me-3"><strong>GSTIN:</strong> {companyProfile.gst_no}</span>
                                        <span><strong>Mo:</strong> {companyProfile.mobile}</span>
                                    </div>
                                </div>
                                {companyProfile.logo && (
                                    <div style={{ textAlign: 'right' }}>
                                        <img src={`${API}/uploads/${companyProfile.logo}`} alt="Logo" style={{ height: '60px', width: 'auto', objectFit: 'contain' }} />
                                    </div>
                                )}
                            </div>
                            <div className="text-center mt-4">
                                <h4 className="text-uppercase fw-extrabold mb-1" style={{ letterSpacing: '2px', color: '#1a202c' }}>Order Detailed Reconciliation Report</h4>
                                <p className="text-muted small mb-0">Confidential business document generated on {new Date().toLocaleString()}</p>
                                <div className="mx-auto mt-2" style={{ width: '60px', height: '3px', background: '#004ecc' }}></div>
                            </div>
                        </div>
                    )}
                    {/* KPI Cards */}
                    <div className="row g-3 mb-5 no-print">
                        <div className="col-md-3">
                            <div className="kpi-card p-3 shadow-sm h-100 border-start border-primary border-4">
                                <label className="uppercase-title d-block mb-1">Stock Ordered (PO)</label>
                                <h3 className="fw-bold mb-0 text-dark">{kpis?.totalPO.toFixed(2)}</h3>
                                <div className="small text-muted">Total units across all material types</div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="kpi-card p-3 shadow-sm h-100 border-start border-success border-4">
                                <label className="uppercase-title d-block mb-1">Stock Received (GRN)</label>
                                <h3 className="fw-bold mb-0 text-success">{kpis?.totalRecd.toFixed(2)}</h3>
                                <div className="small text-muted">{((kpis?.totalRecd / kpis?.totalPO) * 100 || 0).toFixed(1)}% fulfillment rate</div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="kpi-card p-3 shadow-sm h-100 border-start border-info border-4">
                                <label className="uppercase-title d-block mb-1">Production Issue (Out)</label>
                                <h3 className="fw-bold mb-0 text-info">{kpis?.totalJWOut.toFixed(2)}</h3>
                                <div className="small text-muted">Material issued to various processes</div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="kpi-card p-3 shadow-sm h-100 border-start border-warning border-4">
                                <label className="uppercase-title d-block mb-1">Production Receipts (In)</label>
                                <h3 className="fw-bold mb-0 text-warning">{kpis?.totalJWIn.toFixed(2)}</h3>
                                <div className="small text-muted">Final outputs and semi-finished pieces</div>
                            </div>
                        </div>
                    </div>

                    {/* Order Information Header */}
                    <div className="card section-card mb-5 border-0 bg-white">
                        <div className="card-body p-4">
                            <h5 className="section-header">Order Integrity Header</h5>
                            <div className="row g-4 d-flex align-items-center">
                                <div className="col-md-3 col-6">
                                    <label className="uppercase-title d-block">Order # / Style</label>
                                    <span className="fw-bold text-primary fs-4">{reportData.order.order_no}</span>
                                    <div className="text-secondary fw-medium small mb-0">{reportData.order.order_name}</div>
                                </div>
                                <div className="col-md-4 col-6 border-start border-md-start">
                                    <label className="uppercase-title d-block">Customer / Buyer</label>
                                    <span className="fw-bold text-dark fs-5">{reportData.order.buyer_name}</span>
                                    <div className="small text-muted">Active Partnership</div>
                                </div>
                                <div className="col-md-3 col-6 border-start">
                                    <label className="uppercase-title d-block">Target Delivery</label>
                                    <span className="fw-bold text-danger fs-5">{formatDate(reportData.order.delivery_date)}</span>
                                    <div className="small text-muted">Confirmed Timeline</div>
                                </div>
                                <div className="col-md-2 col-6 border-start text-end text-md-start">
                                    <label className="uppercase-title d-block">Status</label>
                                    <span className="badge bg-success-subtle text-success fs-7 px-3 py-2 border border-success-subtle">{reportData.order.status}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Procurement Section */}
                    <div className="section-break mb-5">
                        <h5 className="section-header">STAGE 1: Material Procurement & Reconciliation</h5>
                        <div className="table-responsive rounded-4 shadow-sm bg-white border">
                            <table className="table hover-table mb-0 align-middle">
                                <thead className="table-dark">
                                    <tr className="small uppercase-title border-bottom">
                                        <th className="py-3 px-3 text-white">Category</th>
                                        <th className="text-white">Doc Date</th>
                                        <th className="text-white">Strategic Partner</th>
                                        <th className="text-end text-white">Issued Qty</th>
                                        <th className="border-start px-3 text-white">Receipt Timeline</th>
                                        <th className="text-end text-success px-3">Recd Qty</th>
                                        <th className="text-end px-3 text-white">Pending Bal</th>
                                        <th className="no-print" style={{ width: 50 }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {procurementReconciliation.map((item, idx) => (
                                        <ReconciliationRow key={idx} item={item} isProcurement={true} />
                                    ))}
                                    {procurementReconciliation.length === 0 && (
                                        <tr><td colSpan="8" className="text-center py-5 text-muted">No material procurement history detected yet.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Production Section */}
                    <div className="section-break mb-5">
                        <h5 className="section-header">STAGE 2: Production Workflow & Yield Audit</h5>
                        <div className="table-responsive rounded-4 shadow-sm bg-white border">
                            <table className="table hover-table mb-0 align-middle">
                                <thead className="table-dark">
                                    <tr className="small uppercase-title border-bottom">
                                        <th className="py-3 px-3 text-white">Process / Milestone</th>
                                        <th className="text-white">Issue Dates</th>
                                        <th className="text-end px-3 text-white">Out Qty</th>
                                        <th className="border-start px-3 text-white">Receipt Dates</th>
                                        <th className="text-end text-success px-3">In Qty</th>
                                        <th className="border-start text-end text-warning px-3">Returns</th>
                                        <th className="border-start text-end px-3 fs-7 text-white">Net Balance</th>
                                        <th className="no-print" style={{ width: 50 }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {jobworkReconciliation.map((item, idx) => (
                                        <ReconciliationRow key={idx} item={item} isProcurement={false} />
                                    ))}
                                    {jobworkReconciliation.length === 0 && (
                                        <tr><td colSpan="8" className="text-center py-5 text-muted">No high-level production activity found for this order.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
