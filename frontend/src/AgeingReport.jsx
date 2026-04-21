import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import * as XLSX from "xlsx";
import { ToastContainer, toast } from "react-toastify";

const API = process.env.REACT_APP_API_URL;

const AgeingReport = ({ type = "customer" }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [companyProfile, setCompanyProfile] = useState(null);

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
            const res = await axios.get(`${API}/reports/ageing/${type}`);
            setData(res.data);
        } catch (err) {
            console.error(`Error fetching ${type} ageing data:`, err);
            toast.error(`Failed to load ${type} ageing report`);
        } finally {
            setLoading(false);
        }
    }, [type]);

    useEffect(() => {
        fetchCompany();
        fetchData();
    }, [fetchData]);

    const exportExcel = () => {
        if (!data.length) return;
        let worksheetData = [];
        const title = `${type === "customer" ? "Customer" : type === "supplier" ? "Supplier" : "Invoice"} Ageing Report`;

        if (type === "invoice") {
            worksheetData = [
                [title],
                [`Date: ${new Date().toLocaleDateString()}`],
                [],
                ["Inv No", "Date", "Name", "Age (Days)", "Bucket", "Total amount", "Paid amount", "Balance"]
            ];
            data.forEach(item => {
                worksheetData.push([
                    item.invoice_no,
                    new Date(item.invoice_date).toLocaleDateString(),
                    item.customer_name,
                    item.days_old,
                    item.ageing_bucket,
                    item.total_amount,
                    item.paid_amount,
                    item.balance
                ]);
            });
        } else {
            worksheetData = [
                [title],
                [`Date: ${new Date().toLocaleDateString()}`],
                [],
                ["Name", "Total Bill", "Total Paid", "Balance", "0-30 Days", "31-60 Days", "61-90 Days", "90+ Days"]
            ];
            data.forEach(item => {
                worksheetData.push([
                    type === "customer" ? item.customer_name : item.supplier_name,
                    type === "customer" ? item.total_receivable : item.total_payable,
                    type === "customer" ? item.total_received : item.total_paid,
                    item.balance,
                    item.bucket_0_30,
                    item.bucket_31_60,
                    item.bucket_61_90,
                    item.bucket_90_plus
                ]);
            });
        }

        const ws = XLSX.utils.aoa_to_sheet(worksheetData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Ageing Report");
        XLSX.writeFile(wb, `${type}_ageing_report.xlsx`);
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

                    .table-responsive { 
                        overflow: visible !important; 
                        width: 100% !important;
                    }

                    .table { 
                        width: 100% !important; 
                        border-collapse: collapse !important; 
                        table-layout: auto !important; 
                    }

                    .table th { 
                        background-color: #2c3e50 !important; 
                        color: white !important; 
                        -webkit-print-color-adjust: exact; 
                        font-size: 11px !important; 
                        padding: 8px 4px !important; 
                        border: 1px solid #000 !important; 
                    }

                    .table td { 
                        font-size: 11px !important; 
                        padding: 6px 4px !important; 
                        border: 1px solid #000 !important; 
                        word-wrap: break-word !important;
                    }
                    
                    /* Hide scrollbars */
                    ::-webkit-scrollbar { display: none; }
                }
                .report-card { border-radius: 12px; border: none; overflow: hidden; }
                .table thead { background-color: #2c3e50; color: white; }
                .bucket-col { background-color: #f8f9fa; font-weight: 500; }
                .bucket-title { font-size: 11px; text-transform: uppercase; color: #6c757d; }
            `}</style>

            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap no-print">
                <div>
                    <h2 className="fw-bold text-dark mb-1 text-capitalize">{type} Ageing Wise Report</h2>
                    <p className="text-muted small">Outstanding balance analyzed by time period</p>
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

            {/* Print Header */}
            {companyProfile && (
                <div className="d-none d-print-block mb-3">
                    <div className="d-flex justify-content-between align-items-start border-bottom pb-2">
                        <div style={{ textAlign: 'left' }}>
                            <h2 className="fw-bold mb-0 text-dark" style={{ fontSize: '22px' }}>{companyProfile.company_name}</h2>
                            <p className="mb-0 text-secondary" style={{ fontSize: '12px' }}>{companyProfile.address}</p>
                            <div className="small mt-1" style={{ fontSize: '11px' }}>
                                <span className="me-3"><strong>GST:</strong> {companyProfile.gst_no}</span>
                                <span><strong>Mobile:</strong> {companyProfile.mobile}</span>
                            </div>
                        </div>
                        {companyProfile.logo && (
                            <div style={{ textAlign: 'right' }}>
                                <img src={`${API}/uploads/${companyProfile.logo}`} alt="Logo" style={{ height: '50px', objectFit: 'contain' }} />
                                <p className="mb-0 text-muted" style={{ fontSize: '10px' }}>{companyProfile.company_name.toLowerCase()}</p>
                            </div>
                        )}
                    </div>
                    <div className="text-center mt-3">
                        <h4 className="text-uppercase fw-bold mb-0" style={{ letterSpacing: '2px', fontSize: '18px' }}>{type} Ageing Wise Report</h4>
                        <p className="text-muted mb-0" style={{ fontSize: '10px' }}>Generated on {new Date().toLocaleDateString()}</p>
                        <hr className="my-2" />
                    </div>
                </div>
            )}

            <div className="card shadow-sm report-card">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover mb-0 align-middle">
                            <thead className="bg-dark text-white">
                                {type === "invoice" ? (
                                    <tr>
                                        <th className="ps-4">Inv No</th>
                                        <th>Date</th>
                                        <th>Name</th>
                                        <th className="text-center">Age (Days)</th>
                                        <th className="text-center">Bucket</th>
                                        <th className="text-end">Total Amount</th>
                                        <th className="text-end">Paid Amount</th>
                                        <th className="text-end pe-4">Balance</th>
                                    </tr>
                                ) : (
                                    <tr>
                                        <th className="ps-4">Name</th>
                                        <th className="text-end">Total Bill</th>
                                        <th className="text-end border-end">Total Paid</th>
                                        <th className="text-end bg-secondary text-white fw-bold">Balance</th>
                                        <th className="text-end bucket-col">0-30 Days</th>
                                        <th className="text-end bucket-col">31-60 Days</th>
                                        <th className="text-end bucket-col">61-90 Days</th>
                                        <th className="text-end pe-4 bucket-col text-danger">90+ Days</th>
                                    </tr>
                                )}
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="10" className="text-center py-5">Loading data...</td></tr>
                                ) : data.length === 0 ? (
                                    <tr><td colSpan="10" className="text-center py-5">No outstanding balances found.</td></tr>
                                ) : (
                                    data.map((item, idx) => (
                                        <tr key={idx}>
                                            {type === "invoice" ? (
                                                <>
                                                    <td className="ps-4 fw-bold">{item.invoice_no}</td>
                                                    <td>{new Date(item.invoice_date).toLocaleDateString('en-GB')}</td>
                                                    <td>{item.customer_name}</td>
                                                    <td className="text-center"><span className="badge bg-light text-dark border">{item.days_old}</span></td>
                                                    <td className="text-center">
                                                        <span className={`badge ${item.days_old > 90 ? 'bg-danger' : item.days_old > 60 ? 'bg-warning text-dark' : 'bg-info text-dark'}`}>
                                                            {item.ageing_bucket}
                                                        </span>
                                                    </td>
                                                    <td className="text-end">₹{Number(item.total_amount).toFixed(2)}</td>
                                                    <td className="text-end text-success">₹{Number(item.paid_amount).toFixed(2)}</td>
                                                    <td className="text-end pe-4 fw-bold text-danger">₹{Number(item.balance).toFixed(2)}</td>
                                                </>
                                            ) : (
                                                <>
                                                    <td className="ps-4 fw-bold text-uppercase">{type === "customer" ? item.customer_name : item.supplier_name}</td>
                                                    <td className="text-end">₹{Number(type === "customer" ? item.total_receivable : item.total_payable).toFixed(2)}</td>
                                                    <td className="text-end border-end text-success">₹{Number(type === "customer" ? item.total_received : item.total_paid).toFixed(2)}</td>
                                                    <td className="text-end bg-light fw-bold">₹{Number(item.balance).toFixed(2)}</td>
                                                    <td className="text-end bucket-col">₹{Number(item.bucket_0_30).toFixed(2)}</td>
                                                    <td className="text-end bucket-col">₹{Number(item.bucket_31_60).toFixed(2)}</td>
                                                    <td className="text-end bucket-col">₹{Number(item.bucket_61_90).toFixed(2)}</td>
                                                    <td className="text-end pe-4 bucket-col text-danger fw-bold">₹{Number(item.bucket_90_plus).toFixed(2)}</td>
                                                </>
                                            )}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                            {!loading && data.length > 0 && (
                                <tfoot className="bg-light fw-bold border-top border-2">
                                    {type === "invoice" ? (
                                        <tr>
                                            <td colSpan="5" className="text-end ps-4 py-3">Total Outstanding:</td>
                                            <td className="text-end">₹{data.reduce((s, i) => s + Number(i.total_amount), 0).toFixed(2)}</td>
                                            <td className="text-end text-success">₹{data.reduce((s, i) => s + Number(i.paid_amount), 0).toFixed(2)}</td>
                                            <td className="text-end pe-4 text-danger">₹{data.reduce((s, i) => s + Number(i.balance), 0).toFixed(2)}</td>
                                        </tr>
                                    ) : (
                                        <tr>
                                            <td className="ps-4 py-3">Grand Total:</td>
                                            <td className="text-end">₹{data.reduce((s, i) => s + Number(type === "customer" ? i.total_receivable : i.total_payable), 0).toFixed(2)}</td>
                                            <td className="text-end">₹{data.reduce((s, i) => s + Number(type === "customer" ? i.total_received : i.total_paid), 0).toFixed(2)}</td>
                                            <td className="text-end bg-secondary text-white">₹{data.reduce((s, i) => s + Number(i.balance), 0).toFixed(2)}</td>
                                            <td className="text-end">₹{data.reduce((s, i) => s + Number(i.bucket_0_30), 0).toFixed(2)}</td>
                                            <td className="text-end">₹{data.reduce((s, i) => s + Number(i.bucket_31_60), 0).toFixed(2)}</td>
                                            <td className="text-end">₹{data.reduce((s, i) => s + Number(i.bucket_61_90), 0).toFixed(2)}</td>
                                            <td className="text-end pe-4 text-danger">₹{data.reduce((s, i) => s + Number(i.bucket_90_plus), 0).toFixed(2)}</td>
                                        </tr>
                                    )}
                                </tfoot>
                            )}
                        </table>
                    </div>
                </div>
            </div>

            <div className="mt-4 no-print border-top pt-4">
                <div className="row g-3">
                    <div className="col-md-3">
                        <div className="card border-0 shadow-sm bg-primary text-white p-3">
                            <h6 className="small opacity-75 mb-1">0-30 Days</h6>
                            <h4 className="mb-0">
                                ₹{data.reduce((s, i) => {
                                    if (type === 'invoice') return s + (i.days_old <= 30 ? Number(i.balance || 0) : 0);
                                    return s + Number(i.bucket_0_30 || 0);
                                }, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </h4>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card border-0 shadow-sm bg-info text-white p-3">
                            <h6 className="small opacity-75 mb-1">31-90 Days</h6>
                            <h4 className="mb-0">
                                ₹{data.reduce((s, i) => {
                                    if (type === 'invoice') return s + (i.days_old > 30 && i.days_old <= 90 ? Number(i.balance || 0) : 0);
                                    return s + (Number(i.bucket_31_60 || 0) + Number(i.bucket_61_90 || 0));
                                }, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </h4>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card border-0 shadow-sm bg-danger text-white p-3">
                            <h6 className="small opacity-75 mb-1">90+ Days Critical</h6>
                            <h4 className="mb-0">
                                ₹{data.reduce((s, i) => {
                                    if (type === 'invoice') return s + (i.days_old > 90 ? Number(i.balance || 0) : 0);
                                    return s + Number(i.bucket_90_plus || 0);
                                }, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </h4>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card border-0 shadow-sm bg-dark text-white p-3">
                            <h6 className="small opacity-75 mb-1">Net Balance</h6>
                            <h4 className="mb-0">
                                ₹{data.reduce((s, i) => s + Number(i.balance || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </h4>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AgeingReport;
