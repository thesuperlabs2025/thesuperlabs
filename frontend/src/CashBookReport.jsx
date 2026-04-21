import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import * as XLSX from "xlsx";
import { ToastContainer, toast } from "react-toastify";

const API = process.env.REACT_APP_API_URL;

const CashBookReport = () => {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [companyProfile, setCompanyProfile] = useState(null);
    const [filters, setFilters] = useState({
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
    });

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
            const res = await axios.get(`${API}/reports/financial/cash-book`, { params: filters });
            setData(res.data);
        } catch (err) {
            console.error(`Error fetching cash book report:`, err);
            toast.error(`Failed to load Cash Book report`);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchCompany();
        fetchData();
    }, [fetchData]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const exportExcel = () => {
        if (!data.length) return;
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Cash Book");
        XLSX.writeFile(wb, `CashBook_${new Date().toLocaleDateString()}.xlsx`);
    };

    const totalDebit = data.reduce((acc, curr) => acc + Number(curr.debit || 0), 0);
    const totalCredit = data.reduce((acc, curr) => acc + Number(curr.credit || 0), 0);
    const closingBalance = data.length > 0 ? data[data.length - 1].balance : 0;

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
                .balance-col { font-family: 'Consolas', monospace; font-weight: 700; color: #198754; }
                .negative-balance { color: #dc3545 !important; }
            `}</style>

            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap no-print">
                <div>
                    <h2 className="fw-bold text-dark mb-1">Cash Book Report</h2>
                    <p className="text-muted small">Detailed Cash Transactions Ledger</p>
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
                        <div className="col-md-3">
                            <label className="form-label small fw-bold">From Date</label>
                            <input type="date" name="startDate" className="form-control" value={filters.startDate} onChange={handleFilterChange} />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label small fw-bold">To Date</label>
                            <input type="date" name="endDate" className="form-control" value={filters.endDate} onChange={handleFilterChange} />
                        </div>
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
                        {companyProfile.logo && (
                            <div style={{ textAlign: 'right' }}>
                                <img src={`${API}/uploads/${companyProfile.logo}`} alt="Logo" style={{ height: '50px', objectFit: 'contain' }} />
                                <p className="mb-0 text-muted" style={{ fontSize: '10px' }}>Cash Ledger</p>
                            </div>
                        )}
                    </div>
                    <div className="text-center mt-3">
                        <h4 className="text-uppercase fw-bold mb-0" style={{ letterSpacing: '2px', fontSize: '18px' }}>Cash Book</h4>
                        <p className="text-muted mb-0" style={{ fontSize: '10px' }}>Period: {filters.startDate} to {filters.endDate}</p>
                        <hr className="my-2" />
                    </div>
                </div>
            )}

            <div className="card shadow-sm border-0 overflow-hidden report-table-container">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table report-table mb-0">
                            <thead>
                                <tr>
                                    <th className="ps-4">Date</th>
                                    <th>Ref No / Description</th>
                                    <th>Type</th>
                                    <th className="text-end text-success">Cash In (Cr)</th>
                                    <th className="text-end text-danger">Cash Out (Dr)</th>
                                    <th className="text-end pe-4">Balance</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="6" className="text-center py-5">Loading...</td></tr>
                                ) : data.length === 0 ? (
                                    <tr><td colSpan="6" className="text-center py-5 text-muted">No records found.</td></tr>
                                ) : data.map((item, idx) => (
                                    <tr key={idx}>
                                        <td className="ps-4">{new Date(item.date).toLocaleDateString()}</td>
                                        <td>{item.description}</td>
                                        <td><span className={`badge ${item.type === 'Receipt' ? 'bg-soft-success text-success' : 'bg-soft-danger text-danger'}`}>{item.type}</span></td>
                                        <td className="text-end amount-col text-success">{Number(item.credit) > 0 ? `₹${Number(item.credit).toFixed(2)}` : '-'}</td>
                                        <td className="text-end amount-col text-danger">{Number(item.debit) > 0 ? `₹${Number(item.debit).toFixed(2)}` : '-'}</td>
                                        <td className={`text-end pe-4 balance-col ${Number(item.balance) < 0 ? 'negative-balance' : ''}`}>₹{Number(item.balance).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            {data.length > 0 && (
                                <tfoot className="bg-light fw-bold border-top">
                                    <tr>
                                        <td colSpan="3" className="text-end py-3">Total:</td>
                                        <td className="text-end text-success">₹{totalCredit.toFixed(2)}</td>
                                        <td className="text-end text-danger">₹{totalDebit.toFixed(2)}</td>
                                        <td className="text-end pe-4">₹{closingBalance.toFixed(2)}</td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CashBookReport;
