import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const API = process.env.REACT_APP_API_URL;

export default function OrderSheetReport() {
    const [orders, setOrders] = useState([]);
    const [selectedOrderNo, setSelectedOrderNo] = useState("");
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        axios.get(`${API}/yarn-dyeing-outward/orders`)
            .then(res => setOrders(res.data || []))
            .catch(err => console.error("Error fetching orders:", err));
    }, []);

    const fetchOrderSheet = useCallback(async (orderNo) => {
        if (!orderNo) return;
        setLoading(true);
        try {
            const res = await axios.get(`${API}/erp-reports/order-sheet/${encodeURIComponent(orderNo)}`);
            setReportData(res.data);
        } catch (err) {
            console.error("Error fetching order sheet:", err);
            setReportData(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (selectedOrderNo) fetchOrderSheet(selectedOrderNo);
    }, [selectedOrderNo, fetchOrderSheet]);

    const handlePrint = () => window.print();

    // Helper to get unique sizes from all items
    const getUniqueSizes = (items) => {
        const sizes = new Set();
        items.forEach(it => {
            const szData = typeof it.sizes_data === 'string' ? JSON.parse(it.sizes_data) : (it.sizes_data || {});
            Object.keys(szData).forEach(s => sizes.add(s));
        });
        return Array.from(sizes).sort((a, b) => {
            const na = parseInt(a), nb = parseInt(b);
            if (!isNaN(na) && !isNaN(nb)) return na - nb;
            return a.localeCompare(b);
        });
    };

    const renderTable = (items, allowance = 1) => {
        if (!items || items.length === 0) return null;
        const uniqueSizes = getUniqueSizes(items);
        let grandTotal = 0;
        const sizeTotals = {};
        uniqueSizes.forEach(s => sizeTotals[s] = 0);

        return (
            <div className="table-responsive mb-4">
                <table className="table table-sm table-bordered order-sheet-table">
                    <thead>
                        <tr className="bg-light">
                            <th style={{ width: '25%' }}>Style Name</th>
                            <th style={{ width: '15%' }}>Color</th>
                            {uniqueSizes.map(s => <th key={s} className="text-center" style={{ width: '50px' }}>{s}</th>)}
                            <th className="text-end" style={{ width: '100px' }}>Qty</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((it, idx) => {
                            const szData = typeof it.sizes_data === 'string' ? JSON.parse(it.sizes_data) : (it.sizes_data || {});
                            let rowTotal = 0;
                            return (
                                <tr key={idx}>
                                    <td className="fw-bold">{it.style_name}</td>
                                    <td>{it.color}</td>
                                    {uniqueSizes.map(s => {
                                        const val = Math.round((parseFloat(szData[s]) || 0) * allowance);
                                        rowTotal += val;
                                        sizeTotals[s] += val;
                                        return <td key={s} className="text-center font-monospace">{val || "-"}</td>;
                                    })}
                                    <td className="text-end fw-bold font-monospace bg-light">{rowTotal}</td>
                                    {(() => { grandTotal += rowTotal; return null; })()}
                                </tr>
                            );
                        })}
                        <tr className="fw-bold" style={{ backgroundColor: '#fdfdfd' }}>
                            <td colSpan="2" className="text-center py-2">SUB TOTAL</td>
                            {uniqueSizes.map(s => <td key={s} className="text-center font-monospace">{sizeTotals[s]}</td>)}
                            <td className="text-end bg-dark text-white">{grandTotal}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="container-fluid py-4 min-vh-100" style={{ backgroundColor: '#f5f7f9' }}>
            <style>{`
                @media print {
                    @page { 
                        size: landscape; 
                        margin: 10mm; 
                    }
                    .no-print { display: none !important; }
                    body { padding: 0 !important; margin: 0 !important; background: white !important; }
                    .order-sheet-container { padding: 5mm !important; border: 1px solid #000 !important; box-shadow: none !important; margin: 0 !important; max-width: 100% !important; border-radius: 0 !important; }
                    .order-sheet-table thead th { 
                        background-color: #000 !important; 
                        color: #fff !important; 
                        border: 1px solid #000 !important; 
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                        text-transform: uppercase;
                    }
                    .order-sheet-table td { border: 1px solid #000 !important; }
                    .report-title-box { background-color: #000 !important; -webkit-print-color-adjust: exact; color: #fff !important; }
                }
                .order-sheet-container {
                    max-width: 1100px;
                    margin: auto;
                    background: white;
                    border-radius: 12px;
                    border: none;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                }
                .company-name { font-size: 2rem; font-weight: 900; color: #2c3e50; letter-spacing: -1px; }
                .report-title-box { background: #34495e; color: white; padding: 10px 25px; font-weight: 800; border-radius: 6px; font-size: 1.1rem; }
                .info-label { font-size: 0.65rem; color: #7f8c8d; font-weight: 800; text-transform: uppercase; margin-bottom: 2px; }
                .info-value { font-size: 0.9rem; font-weight: 700; color: #2c3e50; }
                .section-divider { height: 3px; background: #eef2f7; width: 100%; margin: 25px 0; }
                .order-sheet-table thead th { background-color: #000 !important; color: white !important; font-size: 0.75rem; text-transform: uppercase; padding: 12px; border: 1px solid #333; }
                .order-sheet-table td { vertical-align: middle; padding: 10px; font-size: 0.85rem; border: 1px solid #dee2e6; }
                .section-tag { background: #ebf5ff; color: #007bff; font-weight: 800; font-size: 0.75rem; padding: 4px 12px; border-radius: 20px; display: inline-block; margin-bottom: 15px; }
            `}</style>

            <div className="d-flex justify-content-between align-items-center mb-4 no-print px-3 mx-auto" style={{ maxWidth: 1100 }}>
                <h3 className="fw-bold text-dark mb-0">Order Production Sheet</h3>
                <div className="d-flex gap-3 align-items-center">
                    <select className="form-select border-0 shadow-sm" style={{ width: 350, height: 45 }}
                        value={selectedOrderNo} onChange={(e) => setSelectedOrderNo(e.target.value)}>
                        <option value="">— Search & Select Job Order —</option>
                        {orders.map(o => <option key={o.order_no} value={o.order_no}>{o.order_no} | {o.order_name}</option>)}
                    </select>
                    <button className="btn btn-dark d-flex align-items-center gap-2 px-4 shadow-sm" style={{ height: 45, fontWeight: 700 }} onClick={handlePrint} disabled={!reportData}>
                        <i className="bi bi-printer-fill fs-5"></i> DOWNLOAD PDF
                    </button>
                </div>
            </div>

            {reportData ? (
                <div className="order-sheet-container p-5">
                    {/* Header Design */}
                    <div className="row align-items-start">
                        <div className="col-8">
                            <div className="company-name mb-1">{reportData.company?.company_name || "GARMENTS ERP"}</div>
                            <div className="text-secondary small fw-bold mb-1" style={{ maxWidth: '500px' }}>
                                {reportData.company?.address || "Factory Plot, Industrial Zone"}
                            </div>
                            <div className="d-flex flex-column gap-1">
                                <span className="small"><strong>GSTIN:</strong> {reportData.company?.gst_in || "N/A"}</span>
                                <span className="small"><strong>Phone:</strong> {reportData.company?.mobile || "N/A"}</span>
                                <span className="small"><strong>Email:</strong> {reportData.company?.email || "N/A"}</span>
                            </div>
                        </div>
                        <div className="col-4 text-end">
                            <div className="report-title-box mb-3 d-inline-block" style={{ backgroundColor: '#000' }}>OFFICIAL ORDER SHEET</div>
                            <div className="h4 fw-bold text-dark mb-0">I.O. NO: {reportData.order.order_no}</div>
                            <div className="text-muted small">Date: {new Date().toLocaleDateString()}</div>
                        </div>
                    </div>

                    <div className="section-divider"></div>

                    {/* Metadata Grid */}
                    <div className="row g-4 mb-4">
                        {[
                            { l: "Style Description", v: reportData.order.order_name },
                            { l: "Buyer/Brand", v: reportData.order.own_brand_name || "Direct Merchant" },
                            { l: "Total Order Qty", v: reportData.qty?.total_qty + " Pcs" },
                            { l: "Order Receipt Date", v: reportData.order.order_date },
                            { l: "Production Season", v: reportData.order.season_name },
                            { l: "Order Classification", v: reportData.order.order_type },
                            { l: "Merchandiser", v: reportData.order.merchandiser_name },
                            { l: "Ex-Factory Date", v: reportData.order.delivery_date },
                            { l: "Main Fabric", v: reportData.fabrics.join(", ") }
                        ].map((item, i) => (
                            <div className="col-4" key={i}>
                                <div className="info-label">{item.l}</div>
                                <div className="info-value">{item.v || "-"}</div>
                            </div>
                        ))}
                    </div>

                    <div className="section-divider"></div>

                    {/* Table 1: Base Qty */}
                    <div className="section-tag">1. PRIMARY ORDER QUANTITIES</div>
                    {renderTable(reportData.items, 1)}

                    {/* Table 2: With Allowance */}
                    <div className="section-tag mt-4">2. PRODUCTION QUANTITIES (INCL. {reportData.qty?.excess_pct || 0}% ALLOWANCE)</div>
                    {renderTable(reportData.items, (1 + (parseFloat(reportData.qty?.excess_pct || 0) / 100)))}

                    {/* Authorization Section */}
                    <div className="row mt-5 pt-4 text-center">
                        <div className="col-4">
                            <div className="border-top pt-2 small text-muted fw-bold">PREPARED BY</div>
                        </div>
                        <div className="col-4">
                            <div className="border-top pt-2 small text-muted fw-bold">PRODUCTION MANAGER</div>
                        </div>
                        <div className="col-4">
                            <div className="border-top pt-2 small text-muted fw-bold">DIRECTOR SIGNATURE</div>
                        </div>
                    </div>
                </div>
            ) : (
                !loading && (
                    <div className="text-center py-5 no-print" style={{ color: '#abb8c3' }}>
                        <i className="bi bi-file-earmark-text display-1 d-block mb-3 opacity-25"></i>
                        <h5 className="fw-bold">No Order Selected</h5>
                        <p>Use the search bar above to generate a production sheet.</p>
                    </div>
                )
            )}

            {loading && (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }}></div>
                    <h6 className="mt-3 fw-bold text-secondary">Synchronizing production data...</h6>
                </div>
            )}
        </div>
    );
}
