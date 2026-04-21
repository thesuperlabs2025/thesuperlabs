import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import * as XLSX from "xlsx";

const API = process.env.REACT_APP_API_URL;

export default function ProfitLossReport() {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [companyProfile, setCompanyProfile] = useState(null);

    useEffect(() => {
        const fetchCompany = async () => {
            try {
                const res = await axios.get(`${API}/company-profile`);
                setCompanyProfile(res.data);
            } catch (err) {
                console.error("Error fetching company profile:", err);
            }
        };
        fetchCompany();
    }, []);

    const fetchReport = React.useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API}/reports/profit-loss`, {
                params: { startDate, endDate }
            });
            setData(res.data);
        } catch (err) {
            console.error("Error fetching report:", err);
            alert("Failed to fetch report data");
        } finally {
            setLoading(false);
        }
    }, [startDate, endDate]);

    useEffect(() => {
        fetchReport();
    }, [fetchReport]);

    const handleQuickFilter = (type) => {
        const today = new Date();
        let start = new Date();
        let end = new Date();

        switch (type) {
            case "today":
                start = today;
                end = today;
                break;
            case "yesterday":
                start.setDate(today.getDate() - 1);
                end.setDate(today.getDate() - 1);
                break;
            case "thisWeek":
                start.setDate(today.getDate() - today.getDay());
                break;
            case "thisMonth":
                start = new Date(today.getFullYear(), today.getMonth(), 1);
                break;
            case "lastMonth":
                start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                end = new Date(today.getFullYear(), today.getMonth(), 0);
                break;
            case "thisYear":
                // Accounting year start (April 1st)
                if (today.getMonth() < 3) {
                    start = new Date(today.getFullYear() - 1, 3, 1);
                } else {
                    start = new Date(today.getFullYear(), 3, 1);
                }
                break;
            case "lastYear":
                if (today.getMonth() < 3) {
                    start = new Date(today.getFullYear() - 2, 3, 1);
                    end = new Date(today.getFullYear() - 1, 2, 31);
                } else {
                    start = new Date(today.getFullYear() - 1, 3, 1);
                    end = new Date(today.getFullYear(), 2, 31);
                }
                break;
            default:
                break;
        }

        const format = (d) => d.toISOString().split("T")[0];
        setStartDate(format(start));
        setEndDate(format(end));
    };

    const handleFilter = (e) => {
        e.preventDefault();
        fetchReport();
    };

    const exportExcel = () => {
        if (!data) return;
        const worksheetData = [
            ["Profit and Loss Report"],
            ["Period", `${startDate || "All"} to ${endDate || "All"}`],
            [],
            ["REVENUE (SALES)"],
            ["Total Sales", data.total_sales],
            ["Sales Return", data.total_sales_return],
            ["Net Sales", data.net_sales],
            [],
            ["EXPENSES (PURCHASE & VOUCHERS)"],
            ["Total Purchase", data.total_purchase],
            ["Purchase Return", data.total_purchase_return],
            ["Net Purchase", data.net_purchase],
            ["Bank/Cash Vouchers", data.total_voucher],
            [],
            ["SUMMARY"],
            ["Net Profit/Loss", data.profit]
        ];

        const ws = XLSX.utils.aoa_to_sheet(worksheetData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Profit and Loss");
        XLSX.writeFile(wb, `Profit_Loss_Report_${new Date().toLocaleDateString()}.xlsx`);
    };

    const printReport = () => {
        window.print();
    };

    return (
        <div className="container mt-4 px-4 mb-5">
            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    .card { border: 1px solid #ddd !important; box-shadow: none !important; margin-top: 5px !important; border-radius: 0 !important; page-break-inside: avoid !important; }
                    .container { width: 100% !important; max-width: 100% !important; margin: 0 !important; padding: 0 !important; }
                    .row { display: flex !important; flex-wrap: nowrap !important; gap: 0 !important; }
                    .col-md-6 { width: 50% !important; flex: 0 0 50% !important; }
                    .display-4 { font-size: 1.4rem !important; }
                    .display-3 { font-size: 1.6rem !important; }
                    body { background: white !important; margin: 0.2cm !important; font-size: 10px !important; }
                    .badge { border: 1px solid #000 !important; }
                    .card-header { 
                        -webkit-print-color-adjust: exact !important; 
                        print-color-adjust: exact !important;
                        border-bottom: 2px solid #333 !important;
                        font-weight: bold !important;
                        font-size: 0.9rem !important;
                        padding: 5px 10px !important;
                    }
                    .card-header-sales { background: #198754 !important; color: white !important; }
                    .card-header-expenses { background: #dc3545 !important; color: white !important; }
                    .bg-primary { background-color: #0d6efd !important; -webkit-print-color-adjust: exact !important; }
                    .bg-danger { background-color: #dc3545 !important; -webkit-print-color-adjust: exact !important; }
                    .text-white { color: white !important; }
                    .table-light { background-color: #f8f9fa !important; -webkit-print-color-adjust: exact !important; }
                    .text-danger { color: #dc3545 !important; }
                    .text-success { color: #198754 !important; }
                    h2, h4 { color: #000 !important; font-size: 1.1rem !important; }
                    .py-3 { padding-top: 0.5rem !important; padding-bottom: 0.5rem !important; }
                    .p-4 { padding: 0.5rem !important; }
                    .mt-4, .mt-md-5 { margin-top: 0.5rem !important; }
                }
                .card-header-sales { background: linear-gradient(45deg, #198754, #20c997) !important; color: white !important; }
                .card-header-expenses { background: linear-gradient(45deg, #dc3545, #fd7e14) !important; color: white !important; }
            `}</style>

            <div className="d-flex justify-content-between align-items-center mb-4 no-print flex-wrap gap-3">
                <h2 className="fw-bold text-primary mb-0">
                    <i className="bi bi-graph-up-arrow me-2"></i>Profit & Loss Report
                </h2>
                <div className="d-flex gap-2 w-sm-100">
                    <button className="btn btn-outline-success btn-sm shadow-sm px-3 fw-bold" onClick={exportExcel}>
                        <i className="bi bi-file-earmark-excel me-1"></i> Excel
                    </button>
                    <button className="btn btn-outline-danger btn-sm shadow-sm px-3 fw-bold" onClick={printReport}>
                        <i className="bi bi-file-earmark-pdf me-1"></i> PDF / Print
                    </button>
                    <button className="btn btn-secondary btn-sm shadow-sm px-3 fw-bold" onClick={() => navigate(-1)}>
                        <i className="bi bi-arrow-left me-1"></i> Back
                    </button>
                </div>
            </div>

            {/* Print Only Header */}
            {companyProfile && (
                <div className="d-none d-print-block mb-4 border-bottom pb-3">
                    <div className="d-flex align-items-center gap-4">
                        {companyProfile.logo && (
                            <img src={`${API}/uploads/${companyProfile.logo}`} alt="Logo" style={{ height: '80px', objectFit: 'contain' }} />
                        )}
                        <div>
                            <h2 className="fw-bold mb-1">{companyProfile.company_name}</h2>
                            <p className="mb-1">{companyProfile.address}</p>
                            <p className="mb-0"><strong>GST:</strong> {companyProfile.gst_no} | <strong>Mobile:</strong> {companyProfile.mobile}</p>
                        </div>
                    </div>
                    <h4 className="text-center mt-3 text-uppercase border-top pt-2 fw-bold">Profit and Loss Report</h4>
                    <p className="text-center small text-muted">Period: {startDate || "Initial"} to {endDate || "Today"}</p>
                </div>
            )}

            <div className="card shadow-sm border-0 mb-4 no-print">
                <div className="card-body p-4 text-truncate">
                    <form className="row g-3" onSubmit={handleFilter}>
                        <div className="col-md-3">
                            <label className="form-label fw-bold small">Quick Filter</label>
                            <select className="form-select" onChange={(e) => handleQuickFilter(e.target.value)}>
                                <option value="">Select Range</option>
                                <option value="today">Today</option>
                                <option value="yesterday">Yesterday</option>
                                <option value="thisWeek">This Week</option>
                                <option value="thisMonth">This Month</option>
                                <option value="lastMonth">Last Month</option>
                                <option value="thisYear">This Accounting Year</option>
                                <option value="lastYear">Last Accounting Year</option>
                            </select>
                        </div>
                        <div className="col-md-3">
                            <label className="form-label fw-bold small">Start Date</label>
                            <input type="date" className="form-control" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label fw-bold small">End Date</label>
                            <input type="date" className="form-control" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                        </div>
                        <div className="col-md-3 d-flex align-items-end">
                            <button type="submit" className="btn btn-primary w-100 fw-bold">
                                <i className="bi bi-funnel me-1"></i> Filter Data
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-5 no-print">
                    <div className="spinner-border text-primary" role="status"></div>
                </div>
            ) : data && (
                <div className="row g-4 d-flex flex-wrap overflow-hidden">
                    {/* Sales Column */}
                    <div className="col-md-6 mt-md-4">
                        <div className="card h-100 shadow-sm border-0 overflow-hidden">
                            <div className="card-header card-header-sales py-3 fw-bold text-white">
                                <i className="bi bi-cart-check me-2"></i>REVENUE (SALES)
                            </div>
                            <div className="card-body p-0 overflow-auto">
                                <table className="table table-hover mb-0">
                                    <tbody>
                                        <tr>
                                            <td className="ps-4 py-3">Total Sales</td>
                                            <td className="text-end pe-4 fw-bold">₹ {data.total_sales.toFixed(2)}</td>
                                        </tr>
                                        <tr>
                                            <td className="ps-4 py-3 text-danger">(-) Sales Return</td>
                                            <td className="text-end pe-4 text-danger">- ₹ {data.total_sales_return.toFixed(2)}</td>
                                        </tr>
                                        <tr className="table-light">
                                            <td className="ps-4 py-3 fw-bold">Net Sales</td>
                                            <td className="text-end pe-4 fw-bold">₹ {data.net_sales.toFixed(2)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Expenses Column */}
                    <div className="col-md-6 mt-md-4">
                        <div className="card h-100 shadow-sm border-0 overflow-hidden">
                            <div className="card-header card-header-expenses py-3 fw-bold text-white">
                                <i className="bi bi-cart-dash me-2"></i>EXPENSES (PURCHASE & VOUCHERS)
                            </div>
                            <div className="card-body p-0 overflow-auto">
                                <table className="table table-hover mb-0">
                                    <tbody>
                                        <tr>
                                            <td className="ps-4 py-3">Total Purchase</td>
                                            <td className="text-end pe-4 fw-bold">₹ {data.total_purchase.toFixed(2)}</td>
                                        </tr>
                                        <tr>
                                            <td className="ps-4 py-3 text-success">(-) Purchase Return</td>
                                            <td className="text-end pe-4 text-success">- ₹ {data.total_purchase_return.toFixed(2)}</td>
                                        </tr>
                                        <tr className="table-light">
                                            <td className="ps-4 py-3 fw-bold border-bottom">Net Purchase</td>
                                            <td className="text-end pe-4 fw-bold border-bottom">₹ {data.net_purchase.toFixed(2)}</td>
                                        </tr>
                                        <tr>
                                            <td className="ps-4 py-3">Bank/Cash Vouchers</td>
                                            <td className="text-end pe-4 fw-bold">₹ {data.total_voucher.toFixed(2)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Summary Card */}
                    <div className="col-12 mt-4 mt-md-5">
                        <div className={`card border-0 shadow-lg ${data.profit >= 0 ? "bg-primary" : "bg-danger"} text-white`}>
                            <div className="card-body p-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
                                <div>
                                    <h4 className="mb-1 opacity-75">Bottom Line Result</h4>
                                    <h1 className="display-4 fw-bold mb-0">
                                        {data.profit >= 0 ? "Net Profit" : "Net Loss"}
                                    </h1>
                                </div>
                                <div className="text-end">
                                    <h1 className="display-3 fw-bold mb-0">
                                        ₹ {data.profit.toFixed(2)}
                                    </h1>
                                    <div className="small opacity-75">
                                        Calculated: (Net Sales) - (Net Purchase) - (Vouchers)
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Formula Explanation */}
                    <div className="col-12 mt-4 no-print mb-4">
                        <div className="alert alert-info border-0 shadow-sm d-flex align-items-center">
                            <i className="bi bi-info-circle-fill fs-3 me-3"></i>
                            <div>
                                <strong>Formula:</strong> (Net Sales) - (Net Purchase) - (Total Vouchers)<br />
                                <small className="text-muted">Net Sales = Total Sales - Sales Return | Net Purchase = Total Purchase - Purchase Return</small>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

