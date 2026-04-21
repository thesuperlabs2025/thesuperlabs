import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import * as XLSX from "xlsx";

const API = process.env.REACT_APP_API_URL;

export default function HsnReport() {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [companyProfile, setCompanyProfile] = useState(null);

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    };

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
            const res = await axios.get(`${API}/reports/hsn`, {
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

    const handleFilter = (e) => {
        e.preventDefault();
        fetchReport();
    };

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

    const exportExcel = () => {
        if (!data.length) return;
        const worksheetData = [
            ["HSN Wise Invoice Report"],
            ["Period", `${startDate || "All"} to ${endDate || "All"}`],
            [],
            ["Date", "Invoice #", "Customer", "HSN Code", "GST %", "Total Qty", "Amount (Net)", "Tax Amount", "Total Amount"]
        ];

        data.forEach(item => {
            worksheetData.push([
                formatDate(item.invoice_date),
                item.invoice_id,
                item.customer_name,
                item.hsn_code || "N/A",
                item.gst_percent,
                item.total_qty,
                item.net_amount,
                item.tax_amount,
                item.total_amount
            ]);
        });

        const ws = XLSX.utils.aoa_to_sheet(worksheetData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "HSN Report");
        XLSX.writeFile(wb, `HSN_Report_${new Date().toLocaleDateString()}.xlsx`);
    };

    const printReport = () => {
        window.print();
    };

    return (
        <div className="container mt-4 px-4 mb-5">
            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    .card { border: none !important; box-shadow: none !important; }
                    body { background: white !important; }
                    table { width: 100% !important; border-collapse: collapse !important; }
                    th, td { border: 1px solid #ddd !important; padding: 4px !important; font-size: 10px !important; }
                    .table-dark { background-color: #333 !important; color: white !important; -webkit-print-color-adjust: exact; }
                }
            `}</style>

            <div className="d-flex justify-content-between align-items-center mb-4 no-print flex-wrap gap-3">
                <h2 className="fw-bold text-primary mb-0">
                    <i className="bi bi-list-stars me-2"></i>HSN Wise Report
                </h2>
                <div className="d-flex gap-2">
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

            {/* Print Header */}
            {companyProfile && (
                <div className="d-none d-print-block mb-4 border-bottom pb-3">
                    <div className="d-flex align-items-center gap-4">
                        {companyProfile.logo && (
                            <img src={`${API}/uploads/${companyProfile.logo}`} alt="Logo" style={{ height: '80px' }} />
                        )}
                        <div>
                            <h2 className="fw-bold mb-1">{companyProfile.company_name}</h2>
                            <p className="mb-1">{companyProfile.address}</p>
                            <p className="mb-0"><strong>GST:</strong> {companyProfile.gst_no} | <strong>Mobile:</strong> {companyProfile.mobile}</p>
                        </div>
                    </div>
                    <h4 className="text-center mt-3 text-uppercase border-top pt-2 fw-bold">HSN Wise Invoice Report</h4>
                    <p className="text-center small text-muted">Period: {startDate || "Initial"} to {endDate || "Today"}</p>
                </div>
            )}

            <div className="card shadow-sm border-0 mb-4 no-print">
                <div className="card-body p-4">
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

            <div className="card shadow-sm border-0 overflow-hidden">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover table-striped mb-0 align-middle">
                            <thead className="table-dark">
                                <tr>
                                    <th className="ps-4">Date</th>
                                    <th>Inv #</th>
                                    <th>Customer</th>
                                    <th>HSN Code</th>
                                    <th>GST %</th>
                                    <th className="text-center">Qty</th>
                                    <th className="text-end">Amount</th>
                                    <th className="text-end">Tax Amount</th>
                                    <th className="text-end pe-4">Total Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="6" className="text-center py-5">Loading report...</td></tr>
                                ) : data.length === 0 ? (
                                    <tr><td colSpan="6" className="text-center py-5">No data found for the selected period.</td></tr>
                                ) : data.map((item, index) => (
                                    <tr key={index}>
                                        <td className="ps-4">{formatDate(item.invoice_date)}</td>
                                        <td className="fw-bold">#{item.invoice_id}</td>
                                        <td>{item.customer_name}</td>
                                        <td>{item.hsn_code || "N/A"}</td>
                                        <td>{item.gst_percent}%</td>
                                        <td className="text-center">{item.total_qty}</td>
                                        <td className="text-end">₹ {Number(item.net_amount || 0).toFixed(2)}</td>
                                        <td className="text-end text-danger">₹ {Number(item.tax_amount || 0).toFixed(2)}</td>
                                        <td className="text-end pe-4 fw-bold">₹ {Number(item.total_amount || 0).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            {!loading && data.length > 0 && (
                                <tfoot className="table-light fw-bold border-top">
                                    <tr>
                                        <td colSpan="5" className="ps-4 text-uppercase">Grand Total</td>
                                        <td className="text-center">{data.reduce((acc, curr) => acc + Number(curr.total_qty || 0), 0)}</td>
                                        <td className="text-end">₹ {data.reduce((acc, curr) => acc + Number(curr.net_amount || 0), 0).toFixed(2)}</td>
                                        <td className="text-end text-danger">₹ {data.reduce((acc, curr) => acc + Number(curr.tax_amount || 0), 0).toFixed(2)}</td>
                                        <td className="text-end pe-4 text-success">₹ {data.reduce((acc, curr) => acc + Number(curr.total_amount || 0), 0).toFixed(2)}</td>
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
