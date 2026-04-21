import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import * as XLSX from "xlsx";

const API = process.env.REACT_APP_API_URL;

export default function CompanyStatement() {
    const navigate = useNavigate();
    const [data, setData] = useState({ debits: [], credits: [], totalDebit: 0, totalCredit: 0, outstanding: 0, openingDebit: 0, openingCredit: 0 });
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [companyProfile, setCompanyProfile] = useState(null);
    const [suggestions, setSuggestions] = useState([]);

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
        document.title = "Company Statement Report";
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

    const fetchReport = useCallback(async () => {
        if (!name) return;
        setLoading(true);
        try {
            const res = await axios.get(`${API}/reports/company-statement`, {
                params: { name, startDate, endDate }
            });
            setData(res.data);
        } catch (err) {
            console.error("Error fetching report:", err);
        } finally {
            setLoading(false);
        }
    }, [name, startDate, endDate]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchReport();
    };

    const fetchSuggestions = async (val) => {
        if (!val) {
            setSuggestions([]);
            return;
        }
        try {
            // Fetch from customers and suppliers
            const [custRes, suppRes] = await Promise.all([
                axios.get(`${API}/customers?term=${val}`),
                axios.get(`${API}/supplier/supplier?term=${val}`)
            ]);

            const custs = (Array.isArray(custRes.data) ? custRes.data : []).map(c => c.name);
            const supps = (Array.isArray(suppRes.data) ? suppRes.data : []).map(s => s.name);
            const combined = [...new Set([...custs, ...supps])];
            setSuggestions(combined);
        } catch (err) {
            console.error(err);
        }
    };

    const handleNameChange = (e) => {
        const val = e.target.value;
        setName(val);
        fetchSuggestions(val);
    };

    const selectSuggestion = (val) => {
        setName(val);
        setSuggestions([]);
    };

    const exportExcel = () => {
        if (!data.rows) return;
        const worksheetData = [
            ["Company Statement Report"],
            ["Company Name", name],
            ["Period", `${startDate || "Initial"} to ${endDate || "Today"}`],
            [],
            ["Opening Payable Balance (Debit)", data.openingDebit.toFixed(2)],
            ["Opening Receivable Balance (Credit)", data.openingCredit.toFixed(2)],
            [],
            ["Date", "Description", "Debit", "Credit"]
        ];

        data.rows.forEach(r => {
            worksheetData.push([formatDate(r.date_col), r.details, r.debit, r.credit]);
        });

        worksheetData.push([]);
        worksheetData.push(["", "Total Debit", data.totalDebit]);
        worksheetData.push(["", "Total Credit", data.totalCredit]);
        worksheetData.push(["", "Outstanding Balance", data.outstanding]);

        const ws = XLSX.utils.aoa_to_sheet(worksheetData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Statement");
        XLSX.writeFile(wb, `${name}_Statement.xlsx`);
    };

    return (
        <div className="container mt-4 px-4 mb-5">
            <style>{`
                @font-face {
                    font-family: 'Segoe UI';
                    src: local('Segoe UI');
                }
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
                }
                .table-header-custom { 
                    background-color: #000 !important; 
                    color: white !important; 
                }
                .table-header-custom th { 
                    background-color: #000 !important; 
                    color: white !important; 
                    font-size: 15px !important; 
                    padding: 12px !important;
                }
                .table td {
                    font-size: 14px !important;
                    padding: 10px !important;
                }
                @media print {
                    @page {
                        size: landscape;
                        margin: 10mm;
                    }
                    .no-print { display: none !important; }
                    .card { border: none !important; box-shadow: none !important; }
                    body { background: white !important; padding: 0 !important; margin: 0 !important; font-family: 'Segoe UI' !important; }
                    .container { max-width: 100% !important; width: 100% !important; padding: 0 !important; margin: 0 !important; }
                    .table-header-custom { 
                        background-color: #000 !important; 
                        color: white !important; 
                        -webkit-print-color-adjust: exact !important; 
                    }
                    .table-header-custom th {
                        background-color: #000 !important;
                        color: white !important;
                        font-size: 14px !important;
                        padding: 8px !important;
                    }
                    .statement-header {
                        background-color: #000 !important;
                        color: white !important;
                        -webkit-print-color-adjust: exact !important;
                        padding: 12px !important;
                        font-weight: bold !important;
                        text-align: center !important;
                        text-transform: uppercase !important;
                        font-size: 24px !important;
                    }
                    .row { display: flex !important; flex-direction: row !important; flex-wrap: nowrap !important; width: 100% !important; }
                    .col-md-6 { width: 50% !important; flex: 0 0 50% !important; }
                    .table th, .table td { padding: 8px !important; font-size: 13px !important; border: 1px solid #000 !important; }
                }
                .statement-header { background-color: #000; color: white; padding: 10px; font-weight: bold; text-align: center; font-size: 1.8rem; }
                .suggestion-list { position: absolute; z-index: 1000; width: 100%; max-height: 200px; overflow-y: auto; }
            `}</style>

            <div className="d-flex justify-content-between align-items-center mb-4 no-print flex-wrap gap-3">
                <h2 className="fw-bold text-primary mb-0">
                    <i className="bi bi-file-earmark-person me-2"></i>Company Statement
                </h2>
                <div className="d-flex gap-2">
                    <button className="btn btn-outline-success btn-sm shadow-sm px-3 fw-bold" onClick={exportExcel} disabled={!data.rows}>
                        <i className="bi bi-file-earmark-excel me-1"></i> Excel
                    </button>
                    <button className="btn btn-outline-danger btn-sm shadow-sm px-3 fw-bold" onClick={() => window.print()} disabled={!data.rows}>
                        <i className="bi bi-file-earmark-pdf me-1"></i> PDF / Print
                    </button>
                    <button className="btn btn-secondary btn-sm shadow-sm px-3 fw-bold" onClick={() => navigate(-1)}>
                        <i className="bi bi-arrow-left me-1"></i> Back
                    </button>
                </div>
            </div>

            <div className="card shadow-sm border-0 mb-4 no-print">
                <div className="card-body p-4">
                    <form className="row g-3" onSubmit={handleSearch}>
                        <div className="col-md-4 position-relative">
                            <label className="form-label fw-bold small">Company Name / Mobile</label>
                            <input type="text" className="form-control" value={name} onChange={handleNameChange} placeholder="Search name..." />
                            {suggestions.length > 0 && (
                                <ul className="list-group suggestion-list shadow">
                                    {suggestions.map((s, i) => (
                                        <li key={i} className="list-group-item list-group-item-action py-1 small fw-bold" onClick={() => selectSuggestion(s)} style={{ cursor: "pointer" }}>{s}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <div className="col-md-3">
                            <label className="form-label fw-bold small">Start Date</label>
                            <input type="date" className="form-control" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label fw-bold small">End Date</label>
                            <input type="date" className="form-control" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                        </div>
                        <div className="col-md-2 d-flex align-items-end">
                            <button type="submit" className="btn btn-primary w-100 fw-bold">
                                <i className="bi bi-search me-1"></i> Search
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status"></div>
                </div>
            ) : data.rows && (
                <div className="p-3 bg-white">
                    {/* Report Header */}
                    <div className="mb-4 d-flex justify-content-between">
                        <div style={{ maxWidth: '60%' }}>
                            {companyProfile && (
                                <>
                                    <h4 className="fw-bold m-0">{companyProfile.company_name}</h4>
                                    <p className="small m-0 text-muted">{companyProfile.address}</p>
                                    <p className="small m-0 text-muted">{companyProfile.mobile} | {companyProfile.gst_no}</p>
                                </>
                            )}
                            <div className="mt-3">
                                <h6 className="fw-bold mb-0">Company Name : {name}</h6>
                                <p className="small text-muted">Period : {startDate || "Initial"} to {endDate || "Today"}</p>
                            </div>
                        </div>
                        <div className="text-end">
                            <div className="statement-header mb-2 px-4 shadow-sm">Company Statement</div>
                            <p className="small text-muted">Date: {new Date().toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="row g-0 border-top mt-3">
                        {/* Debit Table (Left) */}
                        <div className="col-md-6 border-end">
                            <table className="table table-bordered mb-0" style={{ fontSize: '13px' }}>
                                <thead className="table-header-custom text-center">
                                    <tr>
                                        <th width="100">Date</th>
                                        <th>Details</th>
                                        <th width="120">Debit Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="bg-light">
                                        <td></td>
                                        <td className="fw-bold">Opening Payable Balance</td>
                                        <td className="text-end">{Number(data.openingDebit).toFixed(2)}</td>
                                    </tr>
                                    {data.debits.map((r, i) => (
                                        <tr key={i}>
                                            <td className="text-center">{formatDate(r.date_col)}</td>
                                            <td>{r.details}</td>
                                            <td className="text-end">{Number(r.debit).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                    {data.debits.length < 5 && Array(5 - data.debits.length).fill(0).map((_, i) => (
                                        <tr key={`empty-d-${i}`}><td style={{ height: '30px' }}></td><td></td><td></td></tr>
                                    ))}
                                </tbody>
                                <tfoot className="table-header-custom">
                                    <tr>
                                        <td colSpan="2" className="text-end fw-bold">Total</td>
                                        <td className="text-end fw-bold">{data.totalDebit.toFixed(2)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        {/* Credit Table (Right) */}
                        <div className="col-md-6">
                            <table className="table table-bordered mb-0" style={{ fontSize: '13px' }}>
                                <thead className="table-header-custom text-center">
                                    <tr>
                                        <th width="100">Date</th>
                                        <th>Details</th>
                                        <th width="120">Credit</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="bg-light">
                                        <td></td>
                                        <td className="fw-bold">Opening Receivable Balance</td>
                                        <td className="text-end">{Number(data.openingCredit).toFixed(2)}</td>
                                    </tr>
                                    {data.credits.map((r, i) => (
                                        <tr key={i}>
                                            <td className="text-center">{formatDate(r.date_col)}</td>
                                            <td>{r.details}</td>
                                            <td className="text-end">{Number(r.credit).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                    {data.credits.length < 5 && Array(5 - data.credits.length).fill(0).map((_, i) => (
                                        <tr key={`empty-c-${i}`}><td style={{ height: '30px' }}></td><td></td><td></td></tr>
                                    ))}
                                </tbody>
                                <tfoot className="table-header-custom">
                                    <tr>
                                        <td colSpan="2" className="text-end fw-bold">Total</td>
                                        <td className="text-end fw-bold">{data.totalCredit.toFixed(2)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    {/* Summary Section */}
                    <div className="mt-4 text-end pe-3">
                        <div className="mb-1">Total Credit Amount : <span className="fw-bold">{data.totalCredit.toFixed(2)}</span></div>
                        <div className="mb-1">Total Debit Amount : <span className="fw-bold">{data.totalDebit.toFixed(2)}</span></div>
                        <div className="display-6 fw-bold mt-2">
                            Outstanding Balance : <span className={data.outstanding >= 0 ? "text-primary" : "text-danger"}>
                                ₹ {Math.abs(data.outstanding).toFixed(2)} {data.outstanding >= 0 ? "(DR)" : "(CR)"}
                            </span>
                        </div>
                    </div>

                    <div className="mt-5 pt-5 text-center small text-muted border-top d-none d-print-block">
                        This is a computer generated statement.
                    </div>
                </div>
            )}
        </div>
    );
}
