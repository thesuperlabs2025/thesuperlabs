import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import * as XLSX from "xlsx";
import { ToastContainer, toast } from "react-toastify";

const API = process.env.REACT_APP_API_URL;

const AdvancedReport = ({ type }) => {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [companyProfile, setCompanyProfile] = useState(null);
    const [filters, setFilters] = useState({
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        asOfDate: new Date().toISOString().split('T')[0]
    });

    const reportConfig = {
        'balance-sheet': { title: 'Balance Sheet', desc: 'Financial Position Statement', endpoint: '/reports/advanced/balance-sheet' },
        'trial-balance': { title: 'Trial Balance', desc: 'List of General Ledger Account Balances', endpoint: '/reports/advanced/trial-balance' },
        'general-ledger': { title: 'General Ledger', desc: 'Detailed Transaction Report', endpoint: '/reports/advanced/general-ledger' },
        'daily-sales': { title: 'Daily Sales Report', desc: 'Sales Performance by Day', endpoint: '/reports/advanced/daily-sales' }
    };

    const config = reportConfig[type] || {};

    const fetchCompany = async () => {
        try {
            const res = await axios.get(`${API}/company-profile`);
            setCompanyProfile(res.data);
        } catch (err) {
            console.error("Error fetching company profile:", err);
        }
    };

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API}${config.endpoint}`, { params: filters });
            setData(res.data);
        } catch (err) {
            console.error(`Error fetching ${type} report:`, err);
            toast.error(`Failed to load ${config.title}`);
        } finally {
            setLoading(false);
        }
    }, [type, filters, config.endpoint, config.title]);

    useEffect(() => {
        fetchCompany();
        fetchData();
    }, [fetchData]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const exportExcel = () => {
        let ws_data = [];

        if (type === 'balance-sheet') {
            // Custom logic for Balance Sheet Excel
            ws_data.push(["Liabilities", "Amount", "Assets", "Amount"]);
            const maxRows = Math.max(data.liabilities?.length || 0, data.assets?.length || 0);
            for (let i = 0; i < maxRows; i++) {
                const liab = data.liabilities?.[i] || {};
                const asset = data.assets?.[i] || {};
                ws_data.push([liab.head || '', liab.amount || '', asset.head || '', asset.amount || '']);
            }
        } else {
            ws_data = Array.isArray(data) ? data : [];
        }

        const ws = XLSX.utils.json_to_sheet(ws_data);
        if (type === 'balance-sheet') {
            // Apply header if simple array didn't handle it
        }

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Report");
        XLSX.writeFile(wb, `${type}_report_${new Date().toLocaleDateString()}.xlsx`);
    };

    const renderTable = () => {
        if (loading) return <tr><td colSpan="10" className="text-center py-5">Loading...</td></tr>;
        if (!data) return <tr><td colSpan="10" className="text-center py-5 text-muted">No records found.</td></tr>;

        // For Balance Sheet, data is an object. For others, it's an array.
        if (type !== 'balance-sheet' && (!Array.isArray(data) || data.length === 0)) {
            return <tr><td colSpan="10" className="text-center py-5 text-muted">No records found.</td></tr>;
        }

        switch (type) {
            case 'daily-sales':
                return (
                    <table className="table report-table mb-0">
                        <thead>
                            <tr>
                                <th className="ps-4">Date</th>
                                <th className="text-center">Total Invoices</th>
                                <th className="text-center">Total Qty</th>
                                <th className="text-end">Cash Sales</th>
                                <th className="text-end">Credit Sales</th>
                                <th className="text-end pe-4">Total Sales</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row, idx) => (
                                <tr key={idx}>
                                    <td className="ps-4">{new Date(row.invoice_date).toLocaleDateString()}</td>
                                    <td className="text-center">{row.total_invoices}</td>
                                    <td className="text-center">{row.total_qty}</td>
                                    <td className="text-end amount-col">₹{Number(row.cash_sales).toFixed(2)}</td>
                                    <td className="text-end amount-col">₹{Number(row.credit_sales).toFixed(2)}</td>
                                    <td className="text-end pe-4 fw-bold">₹{Number(row.total_sales).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-light fw-bold border-top">
                            <tr>
                                <td colSpan="3" className="text-end py-3">Grand Total:</td>
                                <td className="text-end">₹{data.reduce((acc, r) => acc + Number(r.cash_sales), 0).toFixed(2)}</td>
                                <td className="text-end">₹{data.reduce((acc, r) => acc + Number(r.credit_sales), 0).toFixed(2)}</td>
                                <td className="text-end pe-4">₹{data.reduce((acc, r) => acc + Number(r.total_sales), 0).toFixed(2)}</td>
                            </tr>
                        </tfoot>
                    </table>
                );
            case 'general-ledger':
                return (
                    <table className="table report-table mb-0">
                        <thead>
                            <tr>
                                <th className="ps-4">Date</th>
                                <th>Particulars</th>
                                <th>Voucher Type</th>
                                <th className="text-end text-success">Credit</th>
                                <th className="text-end text-danger">Debit</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row, idx) => (
                                <tr key={idx}>
                                    <td className="ps-4">{new Date(row.date).toLocaleDateString()}</td>
                                    <td>{row.particulars}</td>
                                    <td><span className="badge bg-light text-dark border">{row.voucher_type}</span></td>
                                    <td className="text-end amount-col text-success">{Number(row.credit) > 0 ? `₹${Number(row.credit).toFixed(2)}` : '-'}</td>
                                    <td className="text-end amount-col text-danger">{Number(row.debit) > 0 ? `₹${Number(row.debit).toFixed(2)}` : '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );
            case 'trial-balance':
                return (
                    <table className="table report-table mb-0">
                        <thead>
                            <tr>
                                <th className="ps-4">Account Name</th>
                                <th>Group</th>
                                <th className="text-end text-danger">Debit Balance</th>
                                <th className="text-end pe-4 text-success">Credit Balance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row, idx) => (
                                <tr key={idx}>
                                    <td className="ps-4 fw-bold">{row.account_name}</td>
                                    <td>{row.group_name}</td>
                                    <td className="text-end amount-col text-danger">{Number(row.debit) > 0 ? `₹${Number(row.debit).toFixed(2)}` : '-'}</td>
                                    <td className="text-end pe-4 amount-col text-success">{Number(row.credit) > 0 ? `₹${Number(row.credit).toFixed(2)}` : '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-light fw-bold border-top">
                            <tr>
                                <td colSpan="2" className="text-end py-3">Totals:</td>
                                <td className="text-end text-danger">₹{data.reduce((acc, r) => acc + Number(r.debit), 0).toFixed(2)}</td>
                                <td className="text-end pe-4 text-success">₹{data.reduce((acc, r) => acc + Number(r.credit), 0).toFixed(2)}</td>
                            </tr>
                        </tfoot>
                    </table>
                );
            case 'balance-sheet':
                // Determine max rows to render side-by-side
                const liabRows = data.liabilities || [];
                const assetRows = data.assets || [];
                const maxRows = Math.max(liabRows.length, assetRows.length);
                const rows = [];
                for (let i = 0; i < maxRows; i++) {
                    rows.push({
                        liab: liabRows[i] || {},
                        asset: assetRows[i] || {}
                    });
                }

                const totalLiab = liabRows.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
                const totalAsset = assetRows.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

                return (
                    <table className="table report-table mb-0 table-bordered">
                        <thead>
                            <tr>
                                <th className="ps-4 table-light" style={{ width: '40%' }}>Liabilities</th>
                                <th className="text-end table-light" style={{ width: '10%' }}>Amount</th>
                                <th className="ps-4 table-light" style={{ width: '40%' }}>Assets</th>
                                <th className="text-end pe-4 table-light" style={{ width: '10%' }}>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, idx) => (
                                <tr key={idx}>
                                    <td className="ps-4 fw-bold text-secondary">{row.liab.head}</td>
                                    <td className="text-end amount-col">{row.liab.amount ? `₹${Number(row.liab.amount).toFixed(2)}` : ''}</td>

                                    <td className="ps-4 fw-bold text-secondary border-start">{row.asset.head}</td>
                                    <td className="text-end pe-4 amount-col">{row.asset.amount ? `₹${Number(row.asset.amount).toFixed(2)}` : ''}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-light fw-bold border-top">
                            <tr>
                                <td className="text-end py-3">Total Liabilities:</td>
                                <td className="text-end">₹{totalLiab.toFixed(2)}</td>
                                <td className="text-end py-3 border-start">Total Assets:</td>
                                <td className="text-end pe-4">₹{totalAsset.toFixed(2)}</td>
                            </tr>
                        </tfoot>
                    </table>
                );
            default:
                return null;
        }
    };

    return (
        <div className="container-fluid py-4 px-md-5 bg-light min-vh-100">
            <ToastContainer />
            <style>{`
                @media print {
                    @page { 
                        size: landscape; 
                        margin: 10mm; 
                    }
                    @page :first { margin-top: 10mm; }

                    .no-print { display: none !important; }
                    
                    body { 
                        background: white !important; 
                        font-family: 'Segoe UI', sans-serif !important; 
                        margin: 0 !important;
                        padding: 0 !important;
                        min-width: 100% !important;
                    }

                    .container-fluid { 
                        width: 100% !important; 
                        max-width: 100% !important; 
                        padding: 0 !important; 
                        margin: 0 !important; 
                    }

                    .card { 
                        border: none !important; 
                        box-shadow: none !important; 
                        width: 100% !important; 
                        margin: 0 !important; 
                        padding: 0 !important;
                    }

                    .report-table-container { 
                        box-shadow: 0 0.125rem 0.25rem rgba(0,0,0,0.075) !important;
                        border: none !important;
                        border-radius: 8px;
                    }

                    .report-table { 
                        width: 100%;
                        margin-bottom: 0;
                        color: #212529;
                        vertical-align: top;
                        border-color: #dee2e6;
                    }

                    .report-table thead th { 
                        background-color: #1a202c !important; 
                        color: #ffffff !important; 
                        font-weight: 600;
                        text-transform: uppercase;
                        font-size: 0.85rem;
                        padding: 1rem 0.75rem;
                        border-bottom: none;
                        vertical-align: middle;
                        white-space: nowrap;
                    }

                    .report-table tbody td { 
                        padding: 1rem 0.75rem;
                        vertical-align: middle;
                        border-bottom: 1px solid #e2e8f0;
                        font-size: 0.9rem;
                    }
                    
                    /* Hide scrollbars */
                    ::-webkit-scrollbar { display: none; }
                }

                /* On-screen styles */
                .report-table th { 
                    background-color: #1a202c; 
                    color: white; 
                    text-transform: uppercase; 
                    font-size: 12px; 
                    padding: 15px;
                    border: none;
                }
                .report-table td {
                    padding: 12px 15px;
                    border-bottom: 1px solid #eee;
                    vertical-align: middle;
                }
                .card { border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
                .amount-col { font-family: 'Consolas', monospace; font-weight: 600; color: #2c3e50; }
            `}</style>

            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap no-print">
                <div>
                    <div className="d-flex align-items-center gap-3">
                        <h2 className="fw-bold text-dark mb-1">{config.title}</h2>
                        {JSON.parse(localStorage.getItem("selectedYear") || "{}").is_closed && (
                            <span className="badge bg-danger rounded-pill px-3 py-2" style={{ fontSize: '0.75rem' }}>
                                <i className="bi bi-lock-fill me-1"></i>LOCKED YEAR
                            </span>
                        )}
                    </div>
                    <p className="text-muted small">{config.desc} | Session: AY {JSON.parse(localStorage.getItem("selectedYear") || "{}").year_name}</p>
                </div>
                <div className="d-flex gap-2">
                    <button className="btn btn-outline-success shadow-sm fw-bold" onClick={exportExcel}>
                        <i className="bi bi-file-earmark-excel me-1"></i>Excel
                    </button>
                    <button className="btn btn-primary shadow-sm fw-bold" onClick={() => window.print()}>
                        <i className="bi bi-printer me-1"></i>Print PDF
                    </button>
                    <button className="btn btn-secondary shadow-sm fw-bold" onClick={() => navigate(-1)}>
                        <i className="bi bi-arrow-left me-1"></i>Back
                    </button>
                </div>
            </div>

            <div className="card shadow-sm border-0 mb-4 no-print">
                <div className="card-body p-4">
                    <div className="row g-3 align-items-end">
                        {type === 'balance-sheet' || type === 'trial-balance' ? (
                            <div className="col-md-3">
                                <label className="form-label small fw-bold">As of Date</label>
                                <input type="date" name="asOfDate" className="form-control" value={filters.asOfDate} onChange={handleFilterChange} />
                            </div>
                        ) : (
                            <>
                                <div className="col-md-3">
                                    <label className="form-label small fw-bold">From Date</label>
                                    <input type="date" name="startDate" className="form-control" value={filters.startDate} onChange={handleFilterChange} />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label small fw-bold">To Date</label>
                                    <input type="date" name="endDate" className="form-control" value={filters.endDate} onChange={handleFilterChange} />
                                </div>
                            </>
                        )}

                        <div className="col-md-2">
                            <button className="btn btn-primary w-100 fw-bold" onClick={fetchData}>
                                <i className="bi bi-search me-1"></i>Search
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Print Header */}
            {companyProfile && (
                <div className="d-none d-print-block mb-3">
                    <div className="d-flex justify-content-between align-items-start border-bottom pb-2">
                        <div style={{ textAlign: 'left' }}>
                            <h2 className="fw-bold mb-0 text-dark" style={{ fontSize: '22px' }}>{companyProfile.company_name}</h2>
                            <p className="mb-0 text-secondary" style={{ fontSize: '12px' }}>{companyProfile.address}</p>
                            <div className="small mt-1" style={{ fontSize: '11px' }}>
                                <span className="me-3"><strong>GSTIN:</strong> {companyProfile.gst_no}</span>
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            {JSON.parse(localStorage.getItem("selectedYear") || "{}").is_closed && (
                                <div className="badge bg-danger mb-2 px-3 py-2" style={{ fontSize: '12px' }}>LOCKED YEAR - VIEW ONLY</div>
                            )}
                            {companyProfile.logo && (
                                <img src={`${API}/uploads/${companyProfile.logo}`} alt="Logo" style={{ height: '50px', objectFit: 'contain' }} />
                            )}
                            <p className="mb-0 text-muted" style={{ fontSize: '10px' }}>Financial Report</p>
                        </div>
                    </div>
                    <div className="text-center mt-3">
                        <h4 className="text-uppercase fw-bold mb-0" style={{ letterSpacing: '2px', fontSize: '18px' }}>{config.title}</h4>
                        <p className="text-muted mb-0" style={{ fontSize: '10px' }}>
                            {type === 'balance-sheet' || type === 'trial-balance' ? `As of: ${filters.asOfDate}` : `Period: ${filters.startDate} to ${filters.endDate}`}
                        </p>
                        <hr className="my-2" />
                    </div>
                </div>
            )}

            <div className="card shadow-sm border-0 overflow-hidden report-table-container">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        {renderTable()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdvancedReport;
