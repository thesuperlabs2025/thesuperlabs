import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const API = process.env.REACT_APP_API_URL;

export default function InvoiceLedger() {
    const [data, setData] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [customerSuggestions, setCustomerSuggestions] = useState([]);
    const [invoiceSuggestions, setInvoiceSuggestions] = useState([]);
    const [activeCustomerIndex, setActiveCustomerIndex] = useState(false);
    const [activeInvoiceIndex, setActiveInvoiceIndex] = useState(false);
    const [dateRangePreset, setDateRangePreset] = useState("custom");

    const [filters, setFilters] = useState({
        customer_name: "",
        sales_person: "",
        from_date: "",
        to_date: "",
        manual_invoice_no: "",
        dc_no: ""
    });

    const [companyProfile, setCompanyProfile] = useState(null);

    useEffect(() => {
        fetchEmployees();
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

    const fetchEmployees = async () => {
        try {
            const res = await axios.get(`${API}/employees`);
            setEmployees(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSearch = async (searchFilters = filters) => {
        try {
            const res = await axios.get(`${API}/reports/invoice-ledger`, { params: searchFilters });
            setData(res.data);
        } catch (err) {
            console.error("Search Error:", err);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));

        // Clear suggestions if input is empty
        if (name === "customer_name" && value === "") setCustomerSuggestions([]);
        if (name === "manual_invoice_no" && value === "") setInvoiceSuggestions([]);
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

    const handleInvoiceInput = async (e) => {
        const value = e.target.value;
        handleInputChange(e);
        if (value.trim().length >= 1) {
            try {
                // Fetch specific invoice suggestions
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
        const headers = ["Bill No", "Customer Name", "Sales Person", "GSTIN", "Date", "Qty", "Bill Amount", "Total Tax Amount", "Total Amount"];
        const rows = data.map(item => [
            item.manual_invoice_no || item.id,
            item.customer_name,
            item.sales_person || "-",
            item.gst_tin || "",
            formatDate(item.invoice_date),
            item.total_qty,
            item.bill_value,
            item.gst_total,
            item.grand_total
        ]);

        let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "InvoiceLedger.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const printReport = () => {
        const originalTitle = document.title;
        document.title = "Invoice Ledger Report";
        window.print();
        document.title = originalTitle;
    };

    return (
        <div className="invoice-ledger-container container-fluid my-4">
            <style>{`
                .invoice-ledger-container {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
                }
                .filter-card {
                    background-color: #ffffff;
                    border: 1px solid #dee2e6;
                    border-radius: 8px;
                }
                .suggestion-list {
                    z-index: 9999;
                    max-height: 250px;
                    overflow-y: auto;
                    font-size: 0.85rem;
                    background: white;
                }
                .table-dark th {
                    background-color: #000 !important;
                    color: #fff !important;
                    border-color: #000 !important;
                }
                .pointer { cursor: pointer; }
                @media print {
                    @page { margin: 10mm; size: portrait; }
                    html, body { margin: 0 !important; padding: 0 !important; width: 100% !important; height: auto !important; overflow: visible !important; }
                    #root { width: 100% !important; margin: 0 !important; padding: 0 !important; }
                    .no-print { display: none !important; }
                    .invoice-ledger-container { padding: 0 !important; margin: 0 !important; width: 100% !important; max-width: 100% !important; display: block !important; }
                    .print-section { width: 100% !important; margin: 0 !important; padding: 0 !important; box-shadow: none !important; border: none !important; display: block !important; }
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

                    
                    /* Percentage Based Column Widths for Ledger */
                    table th:nth-child(1), table td:nth-child(1) { width: 8%; }  /* Bill No */
                    table th:nth-child(2), table td:nth-child(2) { width: 22%; } /* Customer Name */
                    table th:nth-child(3), table td:nth-child(3) { width: 12%; } /* Sales Person */
                    table th:nth-child(4), table td:nth-child(4) { width: 12%; } /* GSTIN */
                    table th:nth-child(5), table td:nth-child(5) { width: 10%; } /* Date */
                    table th:nth-child(6), table td:nth-child(6) { width: 6%; }  /* Qty */
                    table th:nth-child(7), table td:nth-child(7) { width: 10%; } /* Bill Amount */
                    table th:nth-child(8), table td:nth-child(8) { width: 10%; } /* Tax Amount */
                    table th:nth-child(9), table td:nth-child(9) { width: 10%; } /* Total Amount */

                    .text-start { text-align: left !important; }
                    .text-end { text-align: right !important; }
                    .text-center { text-align: center !important; }
                    .fw-bold { font-weight: bold !important; }
                    tfoot tr td { font-weight: bold !important; background-color: #f2f2f2 !important; }
                    .print-header { display: flex !important; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; border-bottom: 2px solid #000; padding-bottom: 10px; }
                    .company-logo { width: 80px; height: 80px; object-fit: contain; }
                    .company-info h2 { margin: 0; font-weight: bold; color: #000; font-size: 16pt; }
                    .company-info p { margin: 1px 0; font-size: 8.5pt; color: #333; }
                    .report-title-print { font-size: 14pt; font-weight: bold; margin-top: 10px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
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
                <span>Invoice Ledger Report</span>
                <span>Period: {formatDate(filters.from_date)} To {formatDate(filters.to_date)}</span>
            </div>

            <div className="d-flex justify-content-between align-items-end mb-4 border-bottom pb-3 text-start d-print-none">
                <div>
                    <h2 className="fw-bold text-dark mb-1">Invoice Ledger Report</h2>
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

            {/* Filter UI - Rectified & Simplified */}
            <div className="card filter-card shadow-sm p-3 mb-4 no-print">
                <div className="row g-2 align-items-end">
                    {/* Customer Autocomplete */}
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

                    {/* Bill No Autocomplete */}
                    <div className="col-12 col-sm-6 col-md-2 position-relative">
                        <label className="form-label fw-bold small">Bill/Invoice No</label>
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

                    <div className="col-12 col-sm-6 col-md-2">
                        <label className="form-label fw-bold small">Staff Name</label>
                        <select name="sales_person" className="form-select form-select-sm border-secondary-subtle" value={filters.sales_person} onChange={handleInputChange}>
                            <option value="">All Staff</option>
                            {employees.map(emp => <option key={emp.id} value={emp.employee_name}>{emp.employee_name}</option>)}
                        </select>
                    </div>

                    <div className="col-12 col-md-4">
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

            {/* Data Table */}
            <div className="table-responsive mb-5 print-section shadow-sm rounded">
                <table className="table table-bordered table-hover text-center align-middle mb-0">
                    <thead className="table-dark">
                        <tr>
                            <th>Bill No</th>
                            <th className="text-start">Customer Name</th>
                            <th>Sales Person</th> {/* Separate Column */}
                            <th>GSTIN</th>
                            <th>Date</th>
                            <th>Qty</th>
                            <th>Bill Amount</th>
                            <th>Total Tax Amount</th>
                            <th>Total Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.length > 0 ? data.map((item, index) => (
                            <tr key={index}>
                                <td className="fw-bold">{item.manual_invoice_no || item.id}</td>
                                <td className="text-start">{item.customer_name}</td>
                                <td>{item.sales_person || "-"}</td> {/* Sales Person show here */}
                                <td>{item.gst_tin || "-"}</td>
                                <td>{formatDate(item.invoice_date)}</td>
                                <td>{item.total_qty}</td>
                                <td className="text-end px-3">{Number(item.bill_value || 0).toFixed(2)}</td>
                                <td className="text-end px-3">{Number(item.gst_total || 0).toFixed(2)}</td> {/* Showing value of total tax */}
                                <td className="text-end px-3 fw-bold">{Number(item.grand_total || 0).toFixed(2)}</td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="9" className="py-5 text-muted">No records found for the selected filters.</td>
                            </tr>
                        )}
                    </tbody>
                    <tfoot className="table-light fw-bold border-top border-2">
                        <tr>
                            <td colSpan="5" className="text-end px-3 py-2">TOTALS</td>
                            <td className="py-2">{data.reduce((acc, curr) => acc + Number(curr.total_qty || 0), 0)}</td>
                            <td className="text-end px-3 py-2">{data.reduce((acc, curr) => acc + Number(curr.bill_value || 0), 0).toFixed(2)}</td>
                            <td className="text-end px-3 py-2">{data.reduce((acc, curr) => acc + Number(curr.gst_total || 0), 0).toFixed(2)}</td>
                            <td className="text-end px-3 py-2 text-primary">{data.reduce((acc, curr) => acc + Number(curr.grand_total || 0), 0).toFixed(2)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
}
