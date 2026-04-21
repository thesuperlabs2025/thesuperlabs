import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import * as XLSX from "xlsx";
import { ToastContainer, toast } from "react-toastify";

const API = process.env.REACT_APP_API_URL;

const TaxExtraReport = ({ type }) => {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [companyProfile, setCompanyProfile] = useState(null);
    const [filters, setFilters] = useState({
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
    });

    const reportTitle = type === 'rcm' ? 'Reverse Charge Mechanism (RCM) Report' : 'Amended Invoice Report';

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
            const res = await axios.get(`${API}/reports/tax-extra/${type}`, { params: filters });
            setData(res.data);
        } catch (err) {
            console.error(`Error fetching ${type} report:`, err);
            toast.error(`Failed to load ${type} report`);
        } finally {
            setLoading(false);
        }
    }, [type, filters]);

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
        XLSX.utils.book_append_sheet(wb, ws, "Report");
        XLSX.writeFile(wb, `${type}_report_${new Date().toLocaleDateString()}.xlsx`);
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
                    background - color: #2c3e50 !important;
                color: white !important;
                -webkit-print-color-adjust: exact;
                font-size: 11px !important;
                padding: 6px 4px !important;
                border: 1px solid #000 !important; 
                    }

                .table td {
                    font - size: 11px !important;
                padding: 5px 4px !important;
                border: 1px solid #000 !important;
                word-wrap: break-word !important;
                    }

                /* Hide scrollbars */
                ::-webkit-scrollbar {display: none; }
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
            `}</style>

            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap no-print">
                <div>
                    <h2 className="fw-bold text-dark mb-1">{reportTitle}</h2>
                    <p className="text-muted small">Tax compliance and filing analysis</p>
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
                        <h4 className="text-uppercase fw-bold mb-0" style={{ letterSpacing: '2px', fontSize: '18px' }}>{reportTitle}</h4>
                        <p className="text-muted mb-0" style={{ fontSize: '10px' }}>Period: {filters.startDate} to {filters.endDate}</p>
                        <hr className="my-2" />
                    </div>
                </div>
            )}

            <div className="card shadow-sm border-0 overflow-hidden">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover mb-0 report-table">
                            <thead>
                                {type === 'rcm' ? (
                                    <tr>
                                        <th className="ps-4">Date</th>
                                        <th>Purchase ID</th>
                                        <th>Supplier Name</th>
                                        <th>Supplier GSTIN</th>
                                        <th className="text-end">Taxable Value</th>
                                        <th className="text-end">GST Amount</th>
                                        <th className="text-end pe-4">Total Amount</th>
                                    </tr>
                                ) : (
                                    <tr>
                                        <th className="ps-4">Date</th>
                                        <th>Invoice No</th>
                                        <th>Customer Name</th>
                                        <th>GSTIN</th>
                                        <th className="text-end">Original Value</th>
                                        <th className="text-end">Amended Value</th>
                                        <th className="text-end pe-4">Amendment Type</th>
                                    </tr>
                                )}
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="7" className="text-center py-5">Loading...</td></tr>
                                ) : data.length === 0 ? (
                                    <tr><td colSpan="7" className="text-center py-5 text-muted">No records found.</td></tr>
                                ) : data.map((item, idx) => (
                                    <tr key={idx}>
                                        {type === 'rcm' ? (
                                            <>
                                                <td className="ps-4">{new Date(item.purchase_date).toLocaleDateString()}</td>
                                                <td>{item.purchase_id}</td>
                                                <td>{item.supplier_name}</td>
                                                <td>{item.supplier_gstin || "Unregistered"}</td>
                                                <td className="text-end">₹{Number(item.taxable_value).toFixed(2)}</td>
                                                <td className="text-end">₹{Number(item.gst_total).toFixed(2)}</td>
                                                <td className="text-end pe-4 fw-bold">₹{Number(item.grand_total).toFixed(2)}</td>
                                            </>
                                        ) : (
                                            <>
                                                <td className="ps-4 text-center">{new Date(item.invoice_date).toLocaleDateString()}</td>
                                                <td>{item.invoice_no}</td>
                                                <td>{item.customer_name}</td>
                                                <td className="text-center">{item.gstin || "-"}</td>
                                                <td className="text-end number-font">₹{Number(item.original_value).toFixed(2)}</td>
                                                <td className="text-end">₹{Number(item.amended_value).toFixed(2)}</td>
                                                <td className="text-end pe-4"><span className="badge bg-info">{item.amendment_type}</span></td>
                                            </>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaxExtraReport;
