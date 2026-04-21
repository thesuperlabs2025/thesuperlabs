import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const API = process.env.REACT_APP_API_URL;

export default function InvoiceSummary() {
    const [data, setData] = useState([]);
    const [customerSuggestions, setCustomerSuggestions] = useState([]);
    const [invoiceSuggestions, setInvoiceSuggestions] = useState([]);
    const [skuSuggestions, setSkuSuggestions] = useState([]);
    const [activeCustomerIndex, setActiveCustomerIndex] = useState(false);
    const [activeInvoiceIndex, setActiveInvoiceIndex] = useState(false);
    const [activeSkuIndex, setActiveSkuIndex] = useState(false);
    const [dateRangePreset, setDateRangePreset] = useState("custom");

    const [filters, setFilters] = useState({
        customer_name: "",
        from_date: "",
        to_date: "",
        manual_invoice_no: "",
        sku: ""
    });

    const [companyProfile, setCompanyProfile] = useState(null);

    useEffect(() => {
        handleSearch();
        fetchCompanyProfile();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchCompanyProfile = async () => {
        try {
            const res = await axios.get(`${API}/company-profile`);
            setCompanyProfile(res.data);
        } catch (err) {
            console.error("Error fetching company profile:", err);
        }
    };

    const handleSearch = async (searchFilters = filters) => {
        try {
            const res = await axios.get(`${API}/reports/invoice-summary`, { params: searchFilters });
            setData(res.data);
        } catch (err) {
            console.error("Search Error:", err);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));

        if (name === "customer_name" && value === "") setCustomerSuggestions([]);
        if (name === "manual_invoice_no" && value === "") setInvoiceSuggestions([]);
        if (name === "sku" && value === "") setSkuSuggestions([]);
    };

    const handleDatePresetChange = (preset) => {
        setDateRangePreset(preset);
        if (preset === "custom") return;

        const today = new Date();
        let from = new Date();
        let to = new Date();

        switch (preset) {
            case "today":
                from = today;
                to = today;
                break;
            case "yesterday":
                from.setDate(today.getDate() - 1);
                to.setDate(today.getDate() - 1);
                break;
            case "this_week":
                const day = today.getDay(); // 0 is Sunday
                from.setDate(today.getDate() - day);
                to.setDate(today.getDate() + (6 - day));
                break;
            case "this_month":
                from = new Date(today.getFullYear(), today.getMonth(), 1);
                to = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                break;
            case "last_month":
                from = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                to = new Date(today.getFullYear(), today.getMonth(), 0);
                break;
            case "this_accounting_year":
                // Assuming April 1st start
                if (today.getMonth() >= 3) {
                    from = new Date(today.getFullYear(), 3, 1);
                    to = new Date(today.getFullYear() + 1, 2, 31);
                } else {
                    from = new Date(today.getFullYear() - 1, 3, 1);
                    to = new Date(today.getFullYear(), 2, 31);
                }
                break;
            case "last_accounting_year":
                if (today.getMonth() >= 3) {
                    from = new Date(today.getFullYear() - 1, 3, 1);
                    to = new Date(today.getFullYear(), 2, 31);
                } else {
                    from = new Date(today.getFullYear() - 2, 3, 1);
                    to = new Date(today.getFullYear() - 1, 2, 31);
                }
                break;
            default:
                break;
        }

        const formatDateStr = (d) => d.toISOString().split('T')[0];
        const newFilters = { ...filters, from_date: formatDateStr(from), to_date: formatDateStr(to) };
        setFilters(newFilters);
        handleSearch(newFilters);
    };

    const handleCustomerInput = async (e) => {
        const value = e.target.value;
        handleInputChange(e);
        if (value.trim().length >= 1) {
            try {
                const res = await axios.get(`${API}/customers?term=${encodeURIComponent(value)}`);
                setCustomerSuggestions(res.data);
            } catch (err) {
                console.error(err);
            }
        } else {
            setCustomerSuggestions([]);
        }
    };

    const handleSkuInput = async (e) => {
        const value = e.target.value;
        handleInputChange(e);
        if (value.trim().length >= 1) {
            try {
                const res = await axios.get(`${API}/products?term=${encodeURIComponent(value)}`);
                setSkuSuggestions(res.data);
            } catch (err) {
                console.error(err);
            }
        } else {
            setSkuSuggestions([]);
        }
    };

    const handleInvoiceInput = async (e) => {
        const value = e.target.value;
        handleInputChange(e);
        if (value.trim().length >= 1) {
            try {
                const res = await axios.get(`${API}/reports/invoice-ledger`, {
                    params: { manual_invoice_no: value }
                });
                setInvoiceSuggestions(res.data);
            } catch (err) {
                console.error(err);
            }
        } else {
            setInvoiceSuggestions([]);
        }
    };

    const selectCustomer = (name) => {
        const newFilters = { ...filters, customer_name: name };
        setFilters(newFilters);
        setCustomerSuggestions([]);
        handleSearch(newFilters);
    };

    const selectSku = (sku) => {
        const newFilters = { ...filters, sku: sku };
        setFilters(newFilters);
        setSkuSuggestions([]);
        handleSearch(newFilters);
    };

    const selectInvoice = (no) => {
        const newFilters = { ...filters, manual_invoice_no: no };
        setFilters(newFilters);
        setInvoiceSuggestions([]);
        handleSearch(newFilters);
    };

    const formatDate = (date) => {
        if (!date) return "-";
        const d = new Date(date);
        return d.toLocaleDateString("en-GB"); // DD/MM/YYYY
    };

    const exportExcel = () => {
        const headers = ["Invoice No", "Date", "Customer Name", "SKU", "Qty", "Rate", "GST %", "Item Total", "Invoice Grand Total"];
        const rows = data.map(item => [
            item.manual_invoice_no || item.invoice_id,
            formatDate(item.invoice_date),
            item.customer_name,
            item.sku,
            item.qty,
            item.rate,
            item.gst_percent,
            item.item_total,
            item.invoice_grand_total
        ]);

        let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "InvoiceSummary.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const printReport = () => {
        const originalTitle = document.title;
        document.title = "Invoice Summary Report";
        window.print();
        document.title = originalTitle;
    };

    return (
        <div className="invoice-summary-container container-fluid my-4">
            <style>{`
                .invoice-summary-container { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important; }
                .filter-card { background-color: #ffffff; border: 1px solid #dee2e6; border-radius: 8px; }
                .suggestion-list { z-index: 9999; max-height: 250px; overflow-y: auto; font-size: 0.85rem; background: white; }
                .table-dark th { background-color: #000 !important; color: #fff !important; border-color: #000 !important; }
                .pointer { cursor: pointer; }
                @media print {
                    @page { margin: 10mm; size: portrait; }
                    html, body { margin: 0 !important; padding: 0 !important; width: 100% !important; height: auto !important; overflow: visible !important; }
                    #root { width: 100% !important; margin: 0 !important; padding: 0 !important; }
                    .no-print { display: none !important; }
                    .invoice-summary-container { padding: 0 !important; margin: 0 !important; width: 100% !important; max-width: 100% !important; }
                    .print-section { width: 100% !important; margin: 0 !important; padding: 0 !important; box-shadow: none !important; border: none !important; }
                    .table-responsive { overflow: visible !important; display: block !important; width: 100% !important; margin: 0 !important; padding: 0 !important; border: none !important; }
                    table { 
                        width: 100% !important; 
                        table-layout: fixed !important; 
                        border-collapse: collapse !important; 
                        margin: 10px 0 !important;
                        border: 1px solid #000 !important;
                    }
                    th, td { 
                        border: 1px solid #000 !important; 
                        padding: 6px 3px !important; 
                        font-size: 7.5pt !important;
                        word-wrap: break-word !important;
                        vertical-align: middle !important;
                    }
                    th { 
                        background-color: #000 !important; 
                        color: #ffffff !important; 
                        font-weight: bold !important; 
                        text-align: center !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    
                    /* Percentage Based Column Widths for Summary */
                    table th:nth-child(1), table td:nth-child(1) { width: 8%; }  /* Inv No */
                    table th:nth-child(2), table td:nth-child(2) { width: 12%; } /* Date */
                    table th:nth-child(3), table td:nth-child(3) { width: 22%; } /* Customer */
                    table th:nth-child(4), table td:nth-child(4) { width: 12%; } /* SKU */
                    table th:nth-child(5), table td:nth-child(5) { width: 6%; }  /* Qty */
                    table th:nth-child(6), table td:nth-child(6) { width: 10%; } /* Rate */
                    table th:nth-child(7), table td:nth-child(7) { width: 8%; }  /* GST% */
                    table th:nth-child(8), table td:nth-child(8) { width: 10%; } /* Item Total */
                    table th:nth-child(9), table td:nth-child(9) { width: 12%; } /* Grand Total */

                    .text-start { text-align: left !important; }
                    .text-end { text-align: right !important; }
                    .text-center { text-align: center !important; }
                    .fw-bold { font-weight: bold !important; }
                    .bg-light { background-color: #f8f9fa !important; }
                    tfoot tr td { font-weight: bold !important; background-color: #f2f2f2 !important; }
                    .print-header { display: flex !important; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; border-bottom: 2px solid #000; padding-bottom: 10px; }
                    .company-logo { width: 80px; height: 80px; object-fit: contain; }
                    .company-info h2 { margin: 0; font-weight: bold; color: #000; font-size: 16pt; }
                    .company-info p { margin: 1px 0; font-size: 8.5pt; color: #333; }
                    .report-title-print { font-size: 14pt; font-weight: bold; margin-top: 10px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
                }
                }
            `}</style>

            {/* Print Header */}
            {companyProfile && (
                <div className="print-header d-none d-print-flex">
                    <div className="company-info text-start">
                        <h2 className="mb-1">{companyProfile.company_name}</h2>
                        <p className="fw-bold mb-1">GST NO: {companyProfile.gst_no}</p>
                        <p className="mb-1">{companyProfile.address}, {companyProfile.pincode}</p>
                        <p className="mb-0">Email: {companyProfile.email} | Mobile: {companyProfile.mobile}</p>
                    </div>
                    {companyProfile.logo && (
                        <div className="text-end">
                            <img
                                src={`${API}/uploads/${companyProfile.logo}`}
                                alt="Logo"
                                className="company-logo"
                            />
                        </div>
                    )}
                </div>
            )}

            <div className="report-title-print d-none d-print-flex justify-content-between align-items-end">
                <span>Invoice Summary Report</span>
                <span>Period: {formatDate(filters.from_date)} To {formatDate(filters.to_date)}</span>
            </div>

            <div className="d-flex justify-content-between align-items-end mb-4 border-bottom pb-3 text-start d-print-none">
                <div>
                    <h2 className="fw-bold text-dark mb-1">Invoice Summary Report</h2>
                </div>
                <div className="text-end">
                    <h5 className="fw-bold text-primary mb-1 text-end">Period: {formatDate(filters.from_date)} To {formatDate(filters.to_date)}</h5>
                    <div className="no-print mt-2">
                        <button className="btn btn-outline-success btn-sm me-2 px-3 shadow-sm" onClick={exportExcel}>
                            <i className="bi bi-file-earmark-excel"></i> Export Excel
                        </button>
                        <button className="btn btn-outline-danger btn-sm px-3 shadow-sm" onClick={printReport}>
                            <i className="bi bi-file-earmark-pdf"></i> Print / PDF
                        </button>
                    </div>
                </div>
            </div>

            <div className="card filter-card shadow-sm p-3 mb-4 no-print">
                <div className="row g-2 align-items-end">
                    <div className="col-12 col-sm-6 col-md-3 position-relative">
                        <label className="form-label fw-bold small">Customer Name</label>
                        <input
                            type="text"
                            name="customer_name"
                            className="form-control form-control-sm border-secondary-subtle"
                            value={filters.customer_name}
                            onChange={handleCustomerInput}
                            onFocus={() => setActiveCustomerIndex(true)}
                            onBlur={() => setTimeout(() => setActiveCustomerIndex(false), 200)}
                            placeholder="Type customer name..."
                            autoComplete="off"
                        />
                        {activeCustomerIndex && customerSuggestions.length > 0 && (
                            <ul className="list-group position-absolute w-100 shadow suggestion-list border">
                                {customerSuggestions.map((c, i) => (
                                    <li key={i} className="list-group-item list-group-item-action py-1 px-2 pointer" onClick={() => selectCustomer(c.name || c.customer_name)}>
                                        {c.name || c.customer_name}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="col-12 col-sm-6 col-md-2 position-relative">
                        <label className="form-label fw-bold small">Invoice No</label>
                        <input
                            type="text"
                            name="manual_invoice_no"
                            className="form-control form-control-sm border-secondary-subtle"
                            value={filters.manual_invoice_no}
                            onChange={handleInvoiceInput}
                            onFocus={() => setActiveInvoiceIndex(true)}
                            onBlur={() => setTimeout(() => setActiveInvoiceIndex(false), 200)}
                            placeholder="No..."
                            autoComplete="off"
                        />
                        {activeInvoiceIndex && invoiceSuggestions.length > 0 && (
                            <ul className="list-group position-absolute w-100 shadow suggestion-list border">
                                {Array.from(new Set(invoiceSuggestions.map(s => s.manual_invoice_no || s.id))).map((no, i) => (
                                    <li key={i} className="list-group-item list-group-item-action py-1 px-2 pointer" onClick={() => selectInvoice(no)}>
                                        {no}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="col-12 col-sm-6 col-md-2 position-relative">
                        <label className="form-label fw-bold small">SKU</label>
                        <input
                            type="text"
                            name="sku"
                            className="form-control form-control-sm border-secondary-subtle"
                            value={filters.sku}
                            onChange={handleSkuInput}
                            onFocus={() => setActiveSkuIndex(true)}
                            onBlur={() => setTimeout(() => setActiveSkuIndex(false), 200)}
                            placeholder="SKU search..."
                            autoComplete="off"
                        />
                        {activeSkuIndex && skuSuggestions.length > 0 && (
                            <ul className="list-group position-absolute w-100 shadow suggestion-list border">
                                {skuSuggestions.map((s, i) => (
                                    <li key={i} className="list-group-item list-group-item-action py-1 px-2 pointer" onClick={() => selectSku(s.sku)}>
                                        {s.sku} {s.product_name ? `- ${s.product_name}` : ""}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="col-12 col-md-5">
                        <label className="form-label fw-bold small">Date Period</label>
                        <div className="input-group input-group-sm">
                            <select
                                className="form-select border-secondary-subtle"
                                value={dateRangePreset}
                                onChange={(e) => handleDatePresetChange(e.target.value)}
                                style={{ flex: '0 0 110px' }}
                            >
                                <option value="custom">Custom</option>
                                <option value="today">Today</option>
                                <option value="yesterday">Yesterday</option>
                                <option value="this_week">This Week</option>
                                <option value="this_month">This Month</option>
                                <option value="last_month">Last Month</option>
                                <option value="this_accounting_year">This A/c Year</option>
                                <option value="last_accounting_year">Last A/c Year</option>
                            </select>
                            <input type="date" name="from_date" className="form-control border-secondary-subtle" value={filters.from_date} onChange={handleInputChange} disabled={dateRangePreset !== "custom"} />
                            <input type="date" name="to_date" className="form-control border-secondary-subtle" value={filters.to_date} onChange={handleInputChange} disabled={dateRangePreset !== "custom"} />
                        </div>
                    </div>

                    <div className="col-12 col-md-auto ms-auto">
                        <button className="btn btn-primary btn-sm fw-bold shadow-sm px-4 h-100" style={{ minHeight: '31px' }} onClick={() => handleSearch()}>
                            <i className="bi bi-search"></i> FILTER DATA
                        </button>
                    </div>
                </div>
            </div>

            <div className="table-responsive mb-5 print-section shadow-sm rounded">
                <table className="table table-bordered table-hover text-center align-middle mb-0">
                    <thead className="table-dark">
                        <tr>
                            <th>Inv No</th>
                            <th>Date</th>
                            <th className="text-start">Customer</th>
                            <th>SKU</th>
                            <th>Qty</th>
                            <th>Rate</th>
                            <th>GST %</th>
                            <th>Item Total</th>
                            <th>Inv Grand Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.length > 0 ? data.map((item, index) => (
                            <tr key={index}>
                                <td className="fw-bold">{item.manual_invoice_no || item.invoice_id}</td>
                                <td>{formatDate(item.invoice_date)}</td>
                                <td className="text-start">{item.customer_name}</td>
                                <td>{item.sku}</td>
                                <td>{item.qty}</td>
                                <td className="text-end">{Number(item.rate || 0).toFixed(2)}</td>
                                <td>{item.gst_percent}%</td>
                                <td className="text-end px-3">{Number(item.item_total || 0).toFixed(2)}</td>
                                <td className="text-end px-3 fw-bold bg-light">{Number(item.invoice_grand_total || 0).toFixed(2)}</td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="9" className="py-5 text-muted">No records found.</td>
                            </tr>
                        )}
                    </tbody>
                    <tfoot className="table-light fw-bold border-top border-2">
                        <tr>
                            <td colSpan="4" className="text-end px-3 py-2">TOTALS</td>
                            <td className="py-2">{data.reduce((acc, curr) => acc + Number(curr.qty || 0), 0)}</td>
                            <td colSpan="2"></td>
                            <td className="text-end px-3 py-2 text-primary">{data.reduce((acc, curr) => acc + Number(curr.item_total || 0), 0).toFixed(2)}</td>
                            <td className="text-end px-3 py-2 bg-warning-subtle">
                                {Array.from(new Set(data.map(i => i.invoice_id)))
                                    .reduce((acc, id) => {
                                        const match = data.find(item => item.invoice_id === id);
                                        return acc + (Number(match.invoice_grand_total) || 0);
                                    }, 0).toFixed(2)}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
}
