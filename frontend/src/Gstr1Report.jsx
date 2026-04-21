import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import * as XLSX from "xlsx";
import { ToastContainer, toast } from "react-toastify";

const API = process.env.REACT_APP_API_URL;

const Gstr1Report = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [filters, setFilters] = useState({
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        type: "Both",
        hsn: "",
        gstRate: "",
        taxReturnFor: "invoice",
        gstType: "Type 1"
    });
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
            const res = await axios.get(`${API}/reports/gstr1/detailed`, { params: filters });
            setData(res.data);
        } catch (err) {
            console.error("Error fetching GSTR-1 data:", err);
            toast.error("Failed to load report data");
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchCompany();
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleFilterChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFilters(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSearch = () => {
        fetchData();
    };

    const exportExcel = () => {
        if (!data.length) return;
        const worksheetData = [
            ["GST Returns - Detailed"],
            [`Period: ${filters.startDate} to ${filters.endDate}`],
            [],
            ["Company Name", "GSTIN", "Invoice No", "Date", "Tax Before Value", "HSN", "GST %", "IGST %", "IGST", "CGST %", "CGST", "SGST %", "SGST", "Tax Amount", "Total Value"]
        ];

        data.forEach(item => {
            worksheetData.push([
                item.company_name,
                item.gstin || "N/A",
                item.invoice_no,
                new Date(item.invoice_date).toLocaleDateString('en-GB'),
                Number(item.taxable_value).toFixed(2),
                item.hsn || "-",
                item.gst_rate,
                item.igst_rate,
                Number(item.igst).toFixed(2),
                item.cgst_rate,
                Number(item.cgst).toFixed(2),
                item.sgst_rate,
                Number(item.sgst).toFixed(2),
                Number(item.tax_amount).toFixed(2),
                Number(item.total_value).toFixed(2)
            ]);
        });

        const ws = XLSX.utils.aoa_to_sheet(worksheetData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "GSTR-1 Detailed");
        XLSX.writeFile(wb, `GSTR1_Detailed_${filters.startDate}_to_${filters.endDate}.xlsx`);
    };

    return (
        <div className="container-fluid py-4 px-md-5 bg-light min-vh-100">
            <ToastContainer />
            <style>{`
                @media print {
                    @page { 
                        size: landscape; 
                        margin: 5mm; 
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
                        border: none !important; 
                        width: 100% !important;
                    }

                    .gstr1-table { 
                        width: 100% !important; 
                        border-collapse: collapse !important; 
                        table-layout: auto !important; 
                    }

                    .gstr1-table th { 
                        background-color: #2c3e50 !important; 
                        color: white !important; 
                        -webkit-print-color-adjust: exact; 
                        font-size: 9px !important; 
                        padding: 4px !important; 
                        border: 1px solid #000 !important; 
                        text-transform: lowercase !important; 
                        font-weight: normal !important; 
                    }

                    .gstr1-table td { 
                        font-size: 9px !important; 
                        padding: 3px !important; 
                        border: 1px solid #000 !important; 
                        word-break: break-all !important; 
                    }

                    .report-table-container { 
                        box-shadow: 0 0.125rem 0.25rem rgba(0,0,0,0.075) !important;
                        border: none !important;
                        border-radius: 8px;
                    }

                    .gstr1-table { 
                        width: 100%;
                        margin-bottom: 0;
                        color: #212529;
                        vertical-align: top;
                        border-color: #dee2e6;
                    }

                    .gstr1-table thead th { 
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

                    .gstr1-table tbody td { 
                        padding: 1rem 0.75rem;
                        vertical-align: middle;
                        border-bottom: 1px solid #e2e8f0;
                        font-size: 0.9rem;
                    }

                    .gstr1-table tbody tr:hover {
                        background-color: #f8fafc;
                    }
                    
                    .amount-text {
                        font-family: 'Consolas', 'Monaco', monospace;
                        font-weight: 600;
                        color: #2563eb;
                    }
                }
                .filter-card { border-radius: 12px; border: none; }
                /* On-screen styles */
                .gstr1-table thead th { 
                    background-color: #1a202c; 
                    color: white; 
                    padding: 15px;
                    font-weight: 600;
                    border: none;
                }
                .gstr1-table tbody td {
                    padding: 12px 15px;
                    border-bottom: 1px solid #eee;
                    vertical-align: middle;
                }
                .gstr1-table tbody tr:last-child td {
                    border-bottom: none;
                }
                .amount-col { color: #0d6efd; font-weight: 600; }
                .report-table-container { background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
            `}</style>

            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap no-print">
                <div>
                    <h2 className="fw-bold text-dark mb-1">GSTR-1 Reports</h2>
                    <p className="text-muted small">Comprehensive tax analysis and filing data</p>
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

            <div className="card shadow-sm filter-card mb-4 no-print">
                <div className="card-body p-4">
                    <div className="row g-3 align-items-end">
                        <div className="col-md-2">
                            <label className="form-label small fw-bold">From Date</label>
                            <input type="date" name="startDate" className="form-control form-control-sm" value={filters.startDate} onChange={handleFilterChange} />
                        </div>
                        <div className="col-md-2">
                            <label className="form-label small fw-bold">To Date</label>
                            <input type="date" name="endDate" className="form-control form-control-sm" value={filters.endDate} onChange={handleFilterChange} />
                        </div>
                        <div className="col-md-2">
                            <label className="form-label small fw-bold">Filter Type</label>
                            <select name="type" className="form-select form-select-sm" value={filters.type} onChange={handleFilterChange}>
                                <option value="Both">B2B & B2C</option>
                                <option value="B2B">B2B Only</option>
                                <option value="B2C">B2C Only</option>
                            </select>
                        </div>
                        <div className="col-md-2">
                            <label className="form-label small fw-bold">Search HSN</label>
                            <input type="text" name="hsn" className="form-control form-control-sm" value={filters.hsn} onChange={handleFilterChange} placeholder="Enter HSN..." />
                        </div>
                        <div className="col-md-1">
                            <label className="form-label small fw-bold">GST %</label>
                            <input type="number" name="gstRate" className="form-control form-control-sm" value={filters.gstRate} onChange={handleFilterChange} placeholder="%" />
                        </div>
                        <div className="col-md-3 text-end">
                            <button className="btn btn-primary btn-sm w-100 fw-bold" style={{ height: '31px' }} onClick={handleSearch}>
                                <i className="bi bi-search me-1"></i>Search Records
                            </button>
                        </div>
                    </div>
                </div>
            </div>

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
                        <h4 className="text-uppercase fw-bold mb-0" style={{ letterSpacing: '2px', fontSize: '18px' }}>GSTR-1 Detailed Report</h4>
                        <p className="text-muted mb-0" style={{ fontSize: '10px' }}>Period: {filters.startDate} to {filters.endDate}</p>
                        <hr className="my-2" />
                    </div>
                </div>
            )}
            <div className="report-table-container shadow-sm mt-3">
                <h6 className="p-3 mb-0 fw-bold border-bottom">invoice GST Report</h6>
                <table className="gstr1-table">
                    <thead>
                        <tr>
                            <th style={{ minWidth: '180px' }}>company name</th>
                            <th style={{ minWidth: '140px' }}>gstin</th>
                            <th>invoice no</th>
                            <th style={{ minWidth: '100px' }}>invoice date</th>
                            <th className="text-end">tax before value</th>
                            <th>HSN</th>
                            <th>gst %</th>
                            <th>igst %</th>
                            <th className="text-end">igst</th>
                            <th>cgst %</th>
                            <th className="text-end">cgst</th>
                            <th>sgst %</th>
                            <th className="text-end">sgst</th>
                            <th className="text-end">tax amount</th>
                            <th className="text-end">total value</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? <tr><td colSpan="15" className="text-center py-5">Loading data...</td></tr> :
                            data.length === 0 ? <tr><td colSpan="15" className="text-center py-5 text-muted">No records found. Click search to load.</td></tr> :
                                data.map((item, idx) => (
                                    <tr key={idx}>
                                        <td className="fw-bold">{item.company_name}</td>
                                        <td className="text-uppercase small">{item.gstin || "-"}</td>
                                        <td className="text-center">{item.invoice_no}</td>
                                        <td className="text-center">{new Date(item.invoice_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}</td>
                                        <td className="text-end">{Number(item.taxable_value).toFixed(2)}</td>
                                        <td className="text-center">{item.hsn || "-"}</td>
                                        <td className="text-center">{Number(item.gst_rate).toFixed(2)}</td>
                                        <td className="text-center">{Number(item.igst_rate).toFixed(2)}</td>
                                        <td className="text-end">{Number(item.igst).toFixed(2)}</td>
                                        <td className="text-center">{Number(item.cgst_rate).toFixed(2)}</td>
                                        <td className="text-end">{Number(item.cgst).toFixed(2)}</td>
                                        <td className="text-center">{Number(item.sgst_rate).toFixed(2)}</td>
                                        <td className="text-end">{Number(item.sgst).toFixed(2)}</td>
                                        <td className="text-end fw-bold">{Number(item.tax_amount).toFixed(2)}</td>
                                        <td className="text-end fw-bold">₹{Number(item.total_value).toFixed(2)}</td>
                                    </tr>
                                ))}
                    </tbody>
                    {!loading && data.length > 0 && (
                        <tfoot className="bg-light fw-bold">
                            <tr>
                                <td colSpan="4" className="text-end">Total:</td>
                                <td className="text-end">{data.reduce((s, i) => s + Number(i.taxable_value), 0).toFixed(2)}</td>
                                <td></td><td></td><td></td>
                                <td className="text-end">{data.reduce((s, i) => s + Number(i.igst), 0).toFixed(2)}</td>
                                <td></td>
                                <td className="text-end">{data.reduce((s, i) => s + Number(i.cgst), 0).toFixed(2)}</td>
                                <td></td>
                                <td className="text-end">{data.reduce((s, i) => s + Number(i.sgst), 0).toFixed(2)}</td>
                                <td className="text-end">{data.reduce((s, i) => s + Number(i.tax_amount), 0).toFixed(2)}</td>
                                <td className="text-end text-primary">₹{data.reduce((s, i) => s + Number(i.total_value), 0).toFixed(2)}</td>
                            </tr>
                        </tfoot>
                    )}
                </table>
            </div>
        </div>
    );
};

export default Gstr1Report;
