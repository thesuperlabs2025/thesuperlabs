import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API = process.env.REACT_APP_API_URL;

// Helper to generate initial state
const getInitialState = () => ({
  id: "",
  customer_name: "",
  TransactionDate: new Date().toISOString().substring(0, 10),
  ModeOfPayment: "",
  TransactionAmount: "",
  Details: "",
  PaymentAgainst: "",
  ReferenceNo: "",
  BankAccountName: "",
  AccountHead: "",
  StaffName: "",
  ReceiptRefNo: "",
  upi_id: "",      // NEW: for Gpay payments
});

function ReceiptForm() {
  const [formData, setFormData] = useState(getInitialState());
  const [modeofpayment, setModeofpayment] = useState([]);
  const [accounthead, setAccounthead] = useState([]);
  const [bankaccount, setBankaccount] = useState([]);
  const [employee_name, setEmployeename] = useState([]);
  const [outstanding, setOutstanding] = useState(0);
  const [suggestions, setSuggestions] = useState([]);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [outstandingInvoices, setOutstandingInvoices] = useState([]);
  const [receiptNo, setReceiptNo] = useState("");
  const [suggestionIndex, setSuggestionIndex] = useState(-1);

  const navigate = useNavigate();

  const outstandingCustomer = async (cust) => {
    try {
      const name = cust.customer_name ?? cust.name;

      // Use the name directly in the URL
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/outstanding/${encodeURIComponent(name)}`
      );

      // Expecting API to return { outstanding_balance: number }
      setOutstanding(Number(res.data.outstanding_balance) || 0);

    } catch (err) {
      console.error("Outstanding fetch error:", err);
      setOutstanding(0);
    }
  };



  useEffect(() => {
    if (!formData.customer_name) {
      setOutstandingInvoices([]);
      setSelectedInvoices([]);
      return;
    }

    axios
      .get(
        `${API}/receipts/pending-invoices/${encodeURIComponent(formData.customer_name)}`
      )
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : [];
        setOutstandingInvoices(data);
        setSelectedInvoices([]); // reset when customer changes
      })
      .catch(err => {
        console.error("Failed to fetch pending invoices", err);
        setOutstandingInvoices([]);
        setSelectedInvoices([]);
      });
  }, [formData.customer_name]);



  const fetchModeofpayment = async () => {
    try {
      const res = await axios.get(`${API}/modeofpayment`);
      setModeofpayment(res.data);
    } catch (err) {
      console.error("Error fetching Mode of payment:", err);
    }
  };

  const fetchBankaccount = async () => {
    try {
      const res = await axios.get(`${API}/bankaccount`);
      setBankaccount(res.data);
    } catch (err) {
      console.error("Error fetching bankaccount:", err);
    }
  };

  const fetchAccounthead = async () => {
    try {
      const res = await axios.get(`${API}/accounthead`);
      setAccounthead(res.data);
    } catch (err) {
      console.error("Error fetching accounthead:", err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await axios.get(`${API}/employees`);
      setEmployeename(res.data);
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };

  useEffect(() => {
    fetchModeofpayment();
    fetchBankaccount();
    fetchAccounthead();
    fetchEmployees();
    fetchReceiptNo();
  }, []);

  const fetchReceiptNo = async () => {
    try {
      const res = await axios.get(`${API}/receipts/next-receipt-no`);
      setReceiptNo(res.data.receiptNo);
    } catch (err) {
      console.error("Failed to load receipt number", err);
    }
  };

  useEffect(() => {
    document.title = `Receipt Form No: ${receiptNo || ""} - TSL ERP`;
  }, [receiptNo]);

  const selectedYear = JSON.parse(localStorage.getItem("selectedYear") || "{}");

  const handleRefresh = async () => {
    try {
      await fetchModeofpayment();
      await fetchBankaccount();
      await fetchAccounthead();
      await fetchEmployees();
      toast.success("✅ Cool! Options Refreshed!", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        theme: "colored",
      });
    } catch (error) {
      console.error("Refresh error:", error);
      toast.error("❌ Failed to refresh options!", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        theme: "colored",
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCustomerInput = async (e) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      customer_name: value
    }));

    if (value.trim().length >= 1) {
      try {
        const res = await axios.get(`${API}/customers?term=${encodeURIComponent(value)}`);
        const data = res.data.map(c => ({ ...c, type: "Customer" }));

        setSuggestions(data.slice(0, 10));
        setSuggestionIndex(-1);
      } catch (err) {
        console.error("Error fetching suggestions:", err);
      }
    } else {
      setSuggestions([]);
    }
  };

  const selectCustomer = (cust) => {
    const name = cust.customer_name || cust.supplier_name || cust.name || "";
    const customerId = cust.id || cust.customer_id || "";

    setFormData(prev => ({
      ...prev,
      customer_name: name,
      customer_id: customerId
    }));

    // clear autocomplete suggestions
    setSuggestions([]);
    setSuggestionIndex(-1);
    if (cust.type === "Customer") {
      outstandingCustomer(cust);
    } else {
      setOutstanding(0);
    }
  };

  const handleKeyDown = (e) => {
    if (suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSuggestionIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSuggestionIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (suggestionIndex >= 0 && suggestions[suggestionIndex]) {
        selectCustomer(suggestions[suggestionIndex]);
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (selectedYear.is_closed) {
      setError("Error: This Accounting Year is locked and cannot be modified.");
      return;
    }

    const receiptDate = new Date(formData.TransactionDate);
    const startDate = new Date(selectedYear.start_date);
    const endDate = new Date(selectedYear.end_date);

    if (receiptDate < startDate || receiptDate > endDate) {
      if (!window.confirm(`Warning: Receipt date is outside the selected Accounting Year (AY ${selectedYear.year_name}). Do you want to proceed?`)) {
        return;
      }
    }

    try {
      let res;

      // 🔥 CASE 1: Payment Against Invoice → MULTIPLE RECEIPT ENTRIES
      if (formData.PaymentAgainst === "Invoice" && selectedInvoices.length > 0) {

        const payload = selectedInvoices.map(inv => ({
          ...formData,
          TransactionAmount: parseFloat(inv.paid_amount),
          PaymentAgainst: "Invoice",
          ReferenceNo: inv.invoice_no, // 🔥 invoice no stored here
          year_id: selectedYear.year_id
        }));

        // 🔥 bulk insert API
        res = await axios.post(`${API}/receipts/bulk`, payload);

        setSuccess(res.data.message || "Receipt Saved Successfully!");

      } else {
        // 🔥 CASE 2: Normal receipt (Advance / Other) → SINGLE ENTRY
        const payload = {
          ...formData,
          TransactionAmount: parseFloat(formData.TransactionAmount),
          year_id: selectedYear.year_id
        };

        if (formData.id) {
          res = await axios.put(`${API}/receipts/${formData.id}`, payload);
          setSuccess(res.data.message || "Receipt Updated Successfully!");
        } else {
          res = await axios.post(`${API}/receipts`, payload);
          setSuccess(res.data.message || "Receipt Saved Successfully!");
        }
      }

      // Reset & redirect (UNCHANGED)
      setTimeout(() => navigate("/receiptmy"), 1000);
      setFormData(getInitialState());
      setSelectedInvoices([]);
      setOutstandingInvoices([]);

    } catch (error) {
      console.error(
        "Save Error:",
        error.response ? error.response.data : error.message
      );
      setError("Error saving receipt!");
    }
  };


  const handleClear = () => {
    setFormData(getInitialState());
    setSelectedInvoices([]);
    setOutstandingInvoices([]);
    setSuggestions([]);
    setOutstanding(0);
  };

  return (
    <div className="container my-5">
      {success && (
        <div
          className="toast align-items-center text-white bg-success border-0 show position-fixed top-0 end-0 m-3"
          role="alert"
          style={{ zIndex: 99999 }}
        >
          <div className="d-flex">
            <div className="toast-body">
              {success}
            </div>
            <button
              type="button"
              className="btn-close btn-close-white me-2 m-auto"
              onClick={() => setSuccess("")}
            ></button>
          </div>
        </div>
      )}
      {error && (
        <div
          className="toast align-items-center text-white bg-danger border-0 show position-fixed top-0 end-0 m-3"
          role="alert"
          style={{ zIndex: 99999 }}
        >
          <div className="d-flex">
            <div className="toast-body">
              <i className="bi bi-exclamation-circle me-2"></i>
              {error}
            </div>
            <button
              type="button"
              className="btn-close btn-close-white me-2 m-auto"
              onClick={() => setError("")}
            ></button>
          </div>
        </div>
      )}
      <ToastContainer />

      <div className="card shadow-lg p-4">
        <div className="mb-3 d-flex justify-content-between align-items-center border-bottom pb-3">
          <div className="d-flex align-items-center gap-4">
            <div>
              <label className="fw-bold mb-0 me-1 text-muted small">Receipt No:</label>
              <div className="text-primary fw-bold fs-5">{receiptNo || "Loading..."}</div>
            </div>
            <div className="vr" style={{ height: '40px' }}></div>
            <div>
              <label className="fw-bold mb-0 me-1 text-muted small">Accounting Year:</label>
              <div className="text-dark fw-bold">AY {selectedYear.year_name}</div>
            </div>
          </div>

          <div className="text-center flex-grow-1">
            <h2 className="fw-bold mb-0">Receipt <span className="text-muted">(Receive Payment)</span></h2>
          </div>

          <div style={{ width: '200px', textAlign: 'right' }}>
            {selectedYear.is_closed ? (
              <span className="badge bg-danger px-3 py-2 rounded-pill shadow-sm">
                <i className="bi bi-lock-fill me-1"></i>YEAR LOCKED
              </span>
            ) : (
              <span className="badge bg-success px-3 py-2 rounded-pill shadow-sm">
                <i className="bi bi-unlock-fill me-1"></i>ACTIVE YEAR
              </span>
            )}
          </div>
        </div>

        <form onSubmit={handleSave}>
          {/* 1. Basic Details */}
          <h4 className="mt-4 mb-3 border-bottom pb-2">1. Basic Details</h4>
          <div className="row g-3">
            {/* Customer */}
            <div className="col-md-3 mb-2 position-relative">
              <div className="d-flex align-items-center justify-content-between mb-1">
                <label className="form-label mb-0">Customer Name</label>
                <div className="d-flex gap-1 align-items-center">
                  {outstanding > 0 && (
                    <span className="badge bg-success text-white">
                      Outstanding: ₹ {outstanding.toFixed(2)}
                    </span>
                  )}
                  <button
                    type="button"
                    className="btn btn-outline-success btn-sm"
                    style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem" }}
                    onClick={() => window.open("/customers", "_blank")}
                  >
                    +
                  </button>
                </div>
              </div>
              <input
                type="text"
                name="customer_name"
                value={formData.customer_name}
                onChange={handleCustomerInput}
                onKeyDown={handleKeyDown}
                className="form-control"
                autoComplete="off"
                onBlur={() => setTimeout(() => setSuggestions([]), 200)}
              />
              {suggestions.length > 0 && (
                <ul
                  className="list-group position-absolute w-100 shadow"
                  style={{ zIndex: 1000, top: "100%" }}
                >
                  {suggestions.map((cust, index) => {
                    const display = cust.customer_name ?? cust.supplier_name ?? cust.name ?? `${cust.id || ""}`;
                    return (
                      <li
                        key={cust.id ?? display}
                        className={`list-group-item list-group-item-action ${suggestionIndex === index ? "active" : ""}`}
                        style={{ cursor: "pointer" }}
                        onClick={() => selectCustomer(cust)}
                      >
                        {display}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Transaction Date */}
            <div className="col-md-3">
              <label className="form-label">
                Transaction Date <span className="text-danger">*</span>
              </label>
              <input
                type="date"
                className="form-control"
                name="TransactionDate"
                value={formData.TransactionDate}
                onChange={handleChange}
                required
              />
            </div>

            {/* Mode of Payment */}
            <div className="col-md-3">
              <div className="d-flex align-items-center justify-content-between mb-1">
                <label className="form-label mb-0">
                  Mode of Payment <span className="text-danger">*</span>
                </label>
                <div className="d-flex gap-1">
                  <button
                    type="button"
                    className="btn btn-outline-success btn-sm"
                    style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem" }}
                    onClick={() => window.open("/modeofpayment", "_blank")}
                  >
                    +
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm"
                    style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem" }}
                    onClick={handleRefresh}
                  >
                    ⟳
                  </button>
                </div>
              </div>
              <select
                className="form-select"
                name="ModeOfPayment"
                value={formData.ModeOfPayment}
                onChange={handleChange}
                required
              >
                <option value="">Select...</option>
                {modeofpayment.map((b, i) => (
                  <option key={i} value={b.modeofpayment || b.ModeOfPayment}>
                    {b.modeofpayment || b.ModeOfPayment}
                  </option>
                ))}
              </select>
            </div>

            {/* Receipt Ref No */}
            <div className="col-md-3">
              <label className="form-label">
                Receipt Ref No <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                name="ReceiptRefNo"
                value={formData.ReceiptRefNo}
                onChange={handleChange}
                placeholder="Auto/Manual Ref No"
                required
              />
            </div>

            {/* Transaction Amount */}
            <div className="col-md-3">
              <label className="form-label">
                Transaction Amount <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                name="TransactionAmount"
                value={formData.TransactionAmount}
                onChange={handleChange}
                step="0.01"
                min="0.01"
                required
              />
            </div>

            {/* UPI Id - Visible only when Mode is Gpay */}
            {formData.ModeOfPayment?.toLowerCase() === "gpay" && (
              <div className="col-md-3">
                <label className="form-label">UPI Id</label>
                <input
                  type="text"
                  name="upi_id"
                  value={formData.upi_id || ""}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Enter UPI Id"
                />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="row mt-3">
            <div className="col-12">
              <label className="form-label">Details</label>
              <textarea
                className="form-control"
                name="Details"
                value={formData.Details}
                onChange={handleChange}
                rows="3"
                placeholder="Details"
              ></textarea>
            </div>
          </div>

          {/* 2. Other Details */}
          <h4 className="mt-5 mb-3 border-bottom pb-2">2. Other Details</h4>
          <div className="row g-3">
            {/* Payment Against */}

            <div className="col-md-3">
              <label className="form-label">Payment Against</label>
              <select
                className="form-select"
                name="PaymentAgainst"
                value={formData.PaymentAgainst}
                onChange={handleChange}
              >
                <option value="">Select...</option>
                <option value="Invoice">Invoice</option>
                <option value="Advance">Advance</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Invoice Dropdown */}
            {formData.PaymentAgainst === "Invoice" && (
              <div className="col-md-4">
                <label className="form-label">Select Invoice(s)</label>

                <select
                  className="form-select"
                  value=""
                  onChange={(e) => {
                    const invoiceNo = e.target.value;
                    if (!invoiceNo) return;

                    const invoice = outstandingInvoices.find(
                      inv => String(inv.invoice_no) === String(invoiceNo)
                    );

                    if (invoice && !selectedInvoices.some(i => i.invoice_no === invoice.invoice_no)) {
                      setSelectedInvoices(prev => [
                        ...prev,
                        {
                          ...invoice,
                          paid_amount: invoice.outstanding_amount // init with full outstanding
                        }
                      ]);
                    }
                  }}
                >
                  <option value="">-- Select Invoice --</option>

                  {outstandingInvoices.map(inv => {
                    // Calculate remaining after any already selected partial payment
                    const selected = selectedInvoices.find(i => i.invoice_no === inv.invoice_no);
                    const remaining = selected
                      ? inv.outstanding_amount - selected.paid_amount
                      : inv.outstanding_amount;

                    return (
                      <option
                        key={inv.invoice_no}
                        value={inv.invoice_no}
                        disabled={remaining <= 0} // disable immediately if fully paid
                      >
                        Invoice #{inv.invoice_no} — Outstanding: ₹{Number(remaining || 0).toFixed(2)}
                      </option>
                    );
                  })}

                </select>

                {/* Selected Invoices Display */}
                {selectedInvoices.length > 0 && (
                  <div className="mt-2 p-2 border rounded">
                    <small className="text-muted d-block mb-2">Selected Invoices:</small>

                    {selectedInvoices.map(inv => {
                      // Use backend-calculated outstanding
                      const remaining = inv.outstanding_amount;

                      return (
                        <div key={inv.invoice_no} className="d-flex align-items-center gap-2 mb-2">
                          <span className="badge bg-primary">{inv.invoice_no}</span>

                          <span className="small">
                            Outstanding: ₹{Number(remaining).toFixed(2)}
                          </span>

                          <input
                            type="text"
                            className="form-control form-control-sm"
                            style={{ width: "100px" }}
                            min="0"
                            max={remaining}
                            value={inv.paid_amount}
                            onChange={(e) => {
                              let amt = Number(e.target.value);
                              if (amt > remaining) amt = remaining;
                              if (amt < 0) amt = 0;

                              setSelectedInvoices(prev =>
                                prev.map(i =>
                                  i.invoice_no === inv.invoice_no
                                    ? { ...i, paid_amount: amt }
                                    : i
                                )
                              );
                            }}
                          />

                          <button
                            type="button"
                            className="btn btn-sm btn-danger"
                            onClick={() =>
                              setSelectedInvoices(prev =>
                                prev.filter(i => i.invoice_no !== inv.invoice_no)
                              )
                            }
                          >
                            ✕
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* No invoices message */}
                {outstandingInvoices.length === 0 && formData.customer_name && (
                  <div className="mt-2">
                    <div className="alert alert-info mb-0">
                      No pending invoices for this customer.
                    </div>
                  </div>
                )}
              </div>
            )}




            {/* Bank/Account Name */}
            <div className="col-md-3">
              <div className="d-flex align-items-center justify-content-between mb-1">
                <label className="form-label mb-0">Bank/Account Name</label>
                <div className="d-flex gap-1">
                  <button
                    type="button"
                    className="btn btn-outline-success btn-sm"
                    style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem" }}
                    onClick={() => window.open("/bankaccount", "_blank")}
                  >
                    +
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm"
                    style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem" }}
                    onClick={handleRefresh}
                  >
                    ⟳
                  </button>
                </div>
              </div>
              <select
                className="form-select"
                name="BankAccountName"
                value={formData.BankAccountName}
                onChange={handleChange}
              >
                <option value="">Select...</option>
                {bankaccount.map((b, i) => (
                  <option key={i} value={b.bankaccount}>
                    {b.bankaccount}
                  </option>
                ))}
              </select>
            </div>

            {/* Account Head */}
            <div className="col-md-3">
              <div className="d-flex align-items-center justify-content-between mb-1">
                <label className="form-label mb-0">
                  Account Head (Chart of A/C) <span className="text-danger">*</span>
                </label>
                <div className="d-flex gap-1">
                  <button
                    type="button"
                    className="btn btn-outline-success btn-sm"
                    style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem" }}
                    onClick={() => window.open("/accounthead", "_blank")}
                  >
                    +
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm"
                    style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem" }}
                    onClick={handleRefresh}
                  >
                    ⟳
                  </button>
                </div>
              </div>
              <select
                className="form-select"
                name="AccountHead"
                value={formData.AccountHead}
                onChange={handleChange}
                required
              >
                <option value="">Select...</option>
                {accounthead.map((a, i) => (
                  <option key={i} value={a.accounthead}>
                    {a.accounthead}
                  </option>
                ))}
              </select>
            </div>

            {/* Staff Name */}
            <div className="col-md-3">
              <div className="d-flex align-items-center justify-content-between mb-1">
                <label className="form-label mb-0">
                  Staff Name <span className="text-danger">*</span>
                </label>
                <div className="d-flex gap-1">
                  <button
                    type="button"
                    className="btn btn-outline-success btn-sm"
                    style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem" }}
                    onClick={() => window.open("/employee", "_blank")}
                  >
                    +
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm"
                    style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem" }}
                    onClick={handleRefresh}
                  >
                    ⟳
                  </button>
                </div>
              </div>
              <select
                className="form-select"
                name="StaffName"
                value={formData.StaffName}
                onChange={handleChange}
              >
                <option value="">Select...</option>
                {employee_name.map((a, i) => (
                  <option key={i} value={a.employee_name}>
                    {a.employee_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Save / Clear Buttons */}
          <div className="d-flex justify-content-end mt-4 gap-2">
            {selectedYear.is_closed ? (
              <div className="text-danger fw-bold d-flex align-items-center me-3">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                Cannot save: This Accounting Year is locked.
              </div>
            ) : (
              <button
                type="submit"
                className="btn btn-success fw-bold px-4 shadow-sm"
              >
                {formData.id ? "Update Receipt" : "Save Receipt"}
              </button>
            )}
            <button
              type="button"
              className="btn btn-secondary fw-bold px-4"
              onClick={handleClear}
            >
              Clear Form
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReceiptForm;
