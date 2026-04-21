import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import * as XLSX from "xlsx";
import { ToastContainer, toast } from "react-toastify";

const API = process.env.REACT_APP_API_URL;

const YarnStockReport = () => {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        searchTerm: "",
        minStock: "",
        maxStock: ""
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

    const fetchReport = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API}/reports/stock/yarn`, { params: filters });
            setData(res.data);
        } catch (err) {
            console.error("Error fetching yarn stock report:", err);
            toast.error("Failed to load yarn stock data");
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchCompany();
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchReport();
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [fetchReport]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const exportExcel = () => {
        if (!data.length) return;
        const worksheetData = [
            [companyProfile?.company_name || "Yarn Stock Report"],
            ["Yarn Inventory Status Report", `Generated on: ${new Date().toLocaleString()}`],
            [],
            ["Yarn SKU", "Yarn Name", "Counts", "Color", "Composition", "Current Stock (Kgs)", "Min Stock"]
        ];

        data.forEach(item => {
            worksheetData.push([
                item.yarn_sku,
                item.yarn_name,
                item.counts || "-",
                item.color || "-",
                item.composition || "-",
                item.current_stock,
                item.minimum_stock
            ]);
        });

        const ws = XLSX.utils.aoa_to_sheet(worksheetData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Yarn Stock Report");
        XLSX.writeFile(wb, `Yarn_Stock_Report_${new Date().toLocaleDateString()}.xlsx`);
    };

    const totalStock = data.reduce((sum, item) => sum + Number(item.current_stock || 0), 0);
    const lowStockCount = data.filter(item => Number(item.current_stock) <= Number(item.minimum_stock)).length;

    return (
        <div className="container-fluid py-4 px-md-5 bg-light min-vh-100">
            <ToastContainer />
            <style>{`
                @media print {
                    @page { 
                        size: landscape; 
                        margin: 10mm; 
                    }
                    .no-print { display: none !important; }
                    body { background: white !important; margin: 0 !important; }
                    .card { border: 1px solid #000 !important; box-shadow: none !important; }
                    .table thead th { 
                        background-color: #000 !important; 
                        color: #fff !important; 
                        -webkit-print-color-adjust: exact; 
                        print-color-adjust: exact;
                        border: 1px solid #000 !important; 
                        text-transform: uppercase;
                        font-size: 9pt;
                    }
                    .table td { border: 1px solid #000 !important; color: #000 !important; }
                    .badge { border: 1px solid #000 !important; color: #000 !important; background: transparent !important; }
                }
            `}</style>

            {/* Header Section */}
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap no-print">
                <div>
                    <h2 className="fw-bold text-dark mb-1">Yarn Stock Report</h2>
                    <p className="text-muted small">Real-time yarn inventory levels and requirements</p>
                </div>
                <div className="d-flex gap-2">
                    <button className="btn btn-outline-success shadow-sm fw-bold px-4" onClick={exportExcel}>
                        <i className="bi bi-file-earmark-excel me-2"></i>Export Excel
                    </button>
                    <button className="btn btn-primary shadow-sm fw-bold px-4" onClick={() => window.print()}>
                        <i className="bi bi-printer me-2"></i>Print PDF
                    </button>
                    <button className="btn btn-secondary shadow-sm fw-bold" onClick={() => navigate(-1)}>
                        <i className="bi bi-arrow-left me-2"></i>Back
                    </button>
                </div>
            </div>

            {/* Summary Tiles */}
            <div className="row g-3 mb-4 no-print">
                <div className="col-md-4">
                    <div className="card shadow-sm border-0 bg-white">
                        <div className="card-body p-4 d-flex align-items-center text-dark">
                            <div className="bg-info bg-opacity-10 text-info rounded-circle p-3 me-3">
                                <i className="bi bi-calendar-check fs-3"></i>
                            </div>
                            <div>
                                <p className="mb-0 text-muted small text-uppercase fw-bold">Year Opening Stock</p>
                                <h3 className="mb-0 fw-bold">{data.reduce((sum, item) => sum + Number(item.year_opening_stock || 0), 0).toFixed(2)} Kgs</h3>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card shadow-sm border-0 bg-white">
                        <div className="card-body p-4 d-flex align-items-center text-dark">
                            <div className="bg-primary bg-opacity-10 text-primary rounded-circle p-3 me-3">
                                <i className="bi bi-box-seam fs-3"></i>
                            </div>
                            <div>
                                <p className="mb-0 text-muted small text-uppercase fw-bold">Current Yarn Stock</p>
                                <h3 className="mb-0 fw-bold">{totalStock.toFixed(2)} Kgs</h3>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card shadow-sm border-0 bg-white">
                        <div className="card-body p-4 d-flex align-items-center text-dark">
                            <div className="bg-danger bg-opacity-10 text-danger rounded-circle p-3 me-3">
                                <i className="bi bi-exclamation-triangle fs-3"></i>
                            </div>
                            <div>
                                <p className="mb-0 text-muted small text-uppercase fw-bold">Low Stock Alerts</p>
                                <h3 className="mb-0 fw-bold">{lowStockCount} Items</h3>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="card shadow-sm border-0 mb-4 no-print">
                <div className="card-body p-4">
                    <div className="row g-3">
                        <div className="col-md-6">
                            <label className="form-label fw-bold small">Search Yarn</label>
                            <input
                                type="text"
                                name="searchTerm"
                                className="form-control"
                                placeholder="Search by SKU, Name, Color, Counts..."
                                value={filters.searchTerm}
                                onChange={handleFilterChange}
                            />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label fw-bold small text-danger font-monospace">Stock &gt;=</label>
                            <input
                                type="number"
                                name="minStock"
                                className="form-control"
                                placeholder="Min Qty"
                                value={filters.minStock}
                                onChange={handleFilterChange}
                            />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label fw-bold small text-primary font-monospace">Stock &lt;=</label>
                            <input
                                type="number"
                                name="maxStock"
                                className="form-control"
                                placeholder="Max Qty"
                                value={filters.maxStock}
                                onChange={handleFilterChange}
                            />
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
                                <span className="me-3"><strong>GST:</strong> {companyProfile.gst_no}</span>
                                <span><strong>Mobile:</strong> {companyProfile.mobile}</span>
                            </div>
                        </div>
                        {companyProfile.logo && (
                            <div style={{ textAlign: 'right' }}>
                                <img src={`${API}/uploads/${companyProfile.logo}`} alt="Logo" style={{ height: '50px', objectFit: 'contain' }} />
                            </div>
                        )}
                    </div>
                    <div className="text-center mt-3">
                        <h4 className="text-uppercase fw-bold mb-0">Yarn Stock Report</h4>
                        <p className="text-muted mb-0" style={{ fontSize: '10px' }}>Generated on {new Date().toLocaleString()}</p>
                        <hr className="my-2" />
                    </div>
                </div>
            )}

            {/* Main Table */}
            <div className="card shadow-sm border-0 overflow-hidden">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table mb-0 table-hover align-middle">
                            <thead className="table-dark">
                                <tr>
                                    <th className="ps-4">Yarn SKU</th>
                                    <th>Yarn Name & Counts</th>
                                    <th>Color</th>
                                    <th className="text-center">Opening Stock</th>
                                    <th className="text-center text-warning">Current Stock (Kgs)</th>
                                    <th className="text-center pe-4">Min Stock</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="6" className="text-center py-5"><div className="spinner-border text-primary"></div></td></tr>
                                ) : data.length === 0 ? (
                                    <tr><td colSpan="6" className="text-center py-5 text-muted">No yarn records found.</td></tr>
                                ) : data.map((item) => {
                                    const isLow = Number(item.current_stock) <= Number(item.minimum_stock);
                                    return (
                                        <tr key={item.id} className={isLow ? "bg-danger bg-opacity-10" : ""}>
                                            <td className="ps-4 fw-bold text-primary">{item.yarn_sku}</td>
                                            <td>
                                                <div className="fw-bold">{item.yarn_name}</div>
                                                <div className="small text-muted">{item.counts}</div>
                                            </td>
                                            <td>{item.color || "-"}</td>
                                            <td className="text-center fw-bold text-muted">
                                                {Number(item.year_opening_stock || 0).toFixed(2)}
                                            </td>
                                            <td className="text-center">
                                                <span className={`badge rounded-pill ${isLow ? 'bg-danger' : 'bg-success'}`} style={{ fontSize: '0.9rem', minWidth: '60px' }}>
                                                    {Number(item.current_stock).toFixed(2)}
Span
                                                </span>
                                            </td>
                                            <td className="text-center text-muted fw-bold pe-4">{item.minimum_stock || 0}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            <tfoot className="table-light border-top border-2 fw-bold fs-5">
                                <tr>
                                    <td colSpan="3" className="ps-4 text-primary">GRAND TOTAL</td>
                                    <td className="text-center text-muted">
                                        {data.reduce((sum, item) => sum + Number(item.year_opening_stock || 0), 0).toFixed(2)}
                                    </td>
                                    <td className="text-center text-success">{totalStock.toFixed(2)} Kgs</td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default YarnStockReport;
