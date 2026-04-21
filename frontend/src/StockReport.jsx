import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import * as XLSX from "xlsx";
import { ToastContainer, toast } from "react-toastify";

const API = process.env.REACT_APP_API_URL;

const StockReport = () => {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        category: "",
        sub_category: "",
        brand: "",
        searchTerm: "",
        minStock: "",
        maxStock: ""
    });
    const [filterOptions, setFilterOptions] = useState({
        categories: [],
        subCategories: [],
        brands: []
    });
    const [companyProfile, setCompanyProfile] = useState(null);

    const fetchFilters = async () => {
        try {
            const res = await axios.get(`${API}/reports/stock/filters`);
            setFilterOptions(res.data);
        } catch (err) {
            console.error("Error fetching filters:", err);
        }
    };

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
            const res = await axios.get(`${API}/reports/stock`, { params: filters });
            setData(res.data);
        } catch (err) {
            console.error("Error fetching stock report:", err);
            toast.error("Failed to load stock data");
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const cat = queryParams.get("category");
        if (cat) {
            setFilters(prev => ({ ...prev, category: cat }));
        }
        fetchFilters();
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
            [companyProfile?.company_name || "Stock Report"],
            ["Inventory Status Report", `Generated on: ${new Date().toLocaleString()}`],
            [],
            ["SKU", "Product Name", "Barcode", "Category", "Sub Category", "Brand", "Opening Stock", "Current Stock", "Min Stock", "Selling Price"]
        ];

        data.forEach(item => {
            worksheetData.push([
                item.sku,
                item.product_name,
                item.barcode || "N/A",
                item.category || "N/A",
                item.sub_category || "N/A",
                item.brand_name || "N/A",
                item.year_opening_stock || 0,
                item.current_stock,
                item.minimum_stock,
                item.selling_price
            ]);
        });

        const ws = XLSX.utils.aoa_to_sheet(worksheetData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Stock Report");
        XLSX.writeFile(wb, `Stock_Report_${new Date().toLocaleDateString()}.xlsx`);
    };

    const totalItems = data.reduce((sum, item) => sum + Number(item.current_stock || 0), 0);
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
                    /* Hide browser header/footer */
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
                        table-layout: auto !important; /* Allow columns to auto-size */
                    }

                    .table th { 
                        background-color: #1a202c !important; 
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

                    .badge { 
                        border: 1px solid #000 !important; 
                        color: #000 !important; 
                        background: transparent !important; 
                        padding: 1px 4px !important; 
                    }
                    
                    /* Hide scrollbars */
                    ::-webkit-scrollbar { display: none; }
                }
                
                .stock-table th { background-color: #1a202c; color: white; }
                .low-stock-alert { color: #e53e3e; font-weight: bold; background: #fff5f5; }
            `}</style>

            {/* Header Section */}
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap no-print">
                <div>
                    <h2 className="fw-bold text-dark mb-1">
                        Stock Report {filters.category && <span className="text-primary"> - {filters.category}</span>}
                    </h2>
                    <p className="text-muted small">Monitor real-time inventory levels</p>
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
                                <h3 className="mb-0 fw-bold">{data.reduce((sum, item) => sum + Number(item.year_opening_stock || 0), 0).toLocaleString()} Units</h3>
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
                                <p className="mb-0 text-muted small text-uppercase fw-bold">Current Stock in Hand</p>
                                <h3 className="mb-0 fw-bold">{totalItems.toLocaleString()} Units</h3>
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
                                <p className="mb-0 text-muted small text-uppercase fw-bold">Low Stock Warning</p>
                                <h3 className="mb-0 fw-bold">{lowStockCount} Products</h3>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="card shadow-sm border-0 mb-4 no-print">
                <div className="card-body p-4">
                    <div className="row g-3">
                        <div className="col-md-4">
                            <label className="form-label fw-bold small">Search Product</label>
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0">
                                    <i className="bi bi-search text-muted"></i>
                                </span>
                                <input
                                    type="text"
                                    name="searchTerm"
                                    className="form-control border-start-0"
                                    placeholder="SKU, Barcode or Name..."
                                    value={filters.searchTerm}
                                    onChange={handleFilterChange}
                                />
                            </div>
                        </div>
                        <div className="col-md-4">
                            <label className="form-label fw-bold small">Category</label>
                            <select className="form-select" name="category" value={filters.category} onChange={handleFilterChange}>
                                <option value="">All Categories</option>
                                {filterOptions.categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="col-md-4">
                            <label className="form-label fw-bold small">Sub Category</label>
                            <select className="form-select" name="sub_category" value={filters.sub_category} onChange={handleFilterChange}>
                                <option value="">All Sub Categories</option>
                                {filterOptions.subCategories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="col-md-3">
                            <label className="form-label fw-bold small">Brand</label>
                            <select className="form-select" name="brand" value={filters.brand} onChange={handleFilterChange}>
                                <option value="">All Brands</option>
                                {filterOptions.brands.map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                        </div>
                        <div className="col-md-3">
                            <label className="form-label fw-bold small text-danger font-monospace">Stock Greater Than &gt;=</label>
                            <input
                                type="number"
                                name="minStock"
                                className="form-control"
                                placeholder="Min Quantity"
                                value={filters.minStock}
                                onChange={handleFilterChange}
                            />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label fw-bold small text-primary font-monospace">Stock Less Than &lt;=</label>
                            <input
                                type="number"
                                name="maxStock"
                                className="form-control"
                                placeholder="Max Quantity"
                                value={filters.maxStock}
                                onChange={handleFilterChange}
                            />
                        </div>
                        <div className="col-md-3 d-flex align-items-end">
                            <button
                                className="btn btn-outline-secondary w-100 fw-bold"
                                onClick={() => setFilters({ category: "", sub_category: "", brand: "", searchTerm: "", minStock: "", maxStock: "" })}
                            >
                                <i className="bi bi-x-lg me-2"></i>Reset
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Print Header (Visible only in Print) */}
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
                        <h4 className="text-uppercase fw-bold mb-0" style={{ letterSpacing: '2px', fontSize: '18px' }}>Stock Inventory Report</h4>
                        <p className="text-muted mb-0" style={{ fontSize: '10px' }}>Generated on {new Date().toLocaleString()}</p>
                        <hr className="my-2" />
                    </div>
                </div>
            )}

            {/* Main Table */}
            <div className="card shadow-sm border-0 overflow-hidden">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table stock-table mb-0 table-hover">
                            <thead className="table-dark">
                                <tr>
                                    <th className="ps-4 col-sku">SKU / Item</th>
                                    <th className="col-cat">Category</th>
                                    <th className="col-sub">Sub Category</th>
                                    <th className="text-end col-stock">Opening Stock</th>
                                    <th className="text-center col-stock text-warning">Current Stock</th>
                                    <th className="text-center pe-4 col-min">Min Level</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="6" className="text-center py-5">
                                        <div className="spinner-border text-primary" role="status"></div>
                                        <p className="mt-2 mb-0">Loading inventory data...</p>
                                    </td></tr>
                                ) : data.length === 0 ? (
                                    <tr><td colSpan="6" className="text-center py-5 text-muted">No products found matching the criteria.</td></tr>
                                ) : data.map((item, idx) => {
                                    const isLow = Number(item.current_stock) <= Number(item.minimum_stock);
                                    return (
                                        <tr key={item.id} className={isLow ? "low-stock-alert" : ""}>
                                            <td className="ps-4 col-sku">
                                                <div className="fw-bold">{item.sku}</div>
                                                <div className="small text-muted">{item.product_name}</div>
                                                {item.barcode && <div className="small text-muted">Barcode: {item.barcode}</div>}
                                            </td>
                                            <td className="col-cat">{item.category || "-"}</td>
                                            <td className="col-sub">{item.sub_category || "-"}</td>
                                            <td className="text-end fw-bold text-muted px-3">
                                                {Number(item.year_opening_stock || 0).toLocaleString()}
                                            </td>
                                            <td className="text-center col-stock">
                                                <span className={`badge rounded-pill ${isLow ? 'bg-danger' : 'bg-success'}`} style={{ fontSize: '0.95rem', minWidth: '60px' }}>
                                                    {item.current_stock}
                                                </span>
                                            </td>
                                            <td className="text-center text-muted fw-bold pe-4 col-min">{item.minimum_stock || 0}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            {!loading && data.length > 0 && (
                                <tfoot className="table-light border-top border-2">
                                    <tr className="fw-bold fs-5">
                                        <td colSpan="3" className="ps-4 text-primary">GRAND TOTAL</td>
                                        <td className="text-end px-3 text-muted">
                                            {data.reduce((sum, item) => sum + Number(item.year_opening_stock || 0), 0).toLocaleString()}
                                        </td>
                                        <td className="text-center text-success">{totalItems.toLocaleString()} Units</td>
                                        <td className="pe-4"></td>
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

export default StockReport;
