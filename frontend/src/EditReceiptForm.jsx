import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API = process.env.REACT_APP_API_URL;

// ✅ Helper to generate initial state
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

function EditReceiptForm() {
  const [formData, setFormData] = useState(getInitialState());
  const [modeofpayment, setModeofpayment] = useState([]);
  const [accounthead, setAccounthead] = useState([]);
  const [bankaccount, setBankaccount] = useState([]);
  const [employee_name, setEmployeename] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [outstanding, setOutstanding] = useState(0);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { id } = useParams(); // Get receipt id from URL

  useEffect(() => {
    document.title = `Edit Receipt No: ${id || ""} - TSL ERP`;
  }, [id]);

  const outstandingCustomer = async (cust) => {
    try {
      const name = cust.customer_name ?? cust.name;

      const res = await fetch(
        `${API}/outstanding/${encodeURIComponent(name)}`
      );

      if (!res.ok) {
        throw new Error("Failed to fetch outstanding balance");
      }

      const data = await res.json();
      setOutstanding(Number(data.outstanding_balance) || 0);
    } catch (err) {
      console.error(err);
      setOutstanding(0);
    }
  };

  // ✅ Fetch dropdowns
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

  // ✅ Fetch receipt for editing
  const fetchReceipt = useCallback(async () => {
    if (!id) return;
    try {
      const res = await axios.get(`${API}/receipts/${id}`);
      if (res.data) {
        setFormData({
          ...res.data,
          TransactionDate: res.data.TransactionDate?.slice(0, 10) || "",
        });
      }
    } catch (err) {
      console.error("Error fetching receipt:", err);
    }
  }, [id])

  useEffect(() => {
    fetchModeofpayment();
    fetchBankaccount();
    fetchAccounthead();
    fetchEmployees();
    fetchReceipt();
  }, [id, fetchReceipt]); // ✅ linter happy


  // ✅ Refresh dropdowns
  const handleRefresh = async () => {
    try {
      await fetchModeofpayment();
      await fetchBankaccount();
      await fetchAccounthead();
      await fetchEmployees();
      toast.success("✅ Cool! Options Refreshed!", {
        position: "top-right",
        autoClose: 2000,
        theme: "colored",
      });
    } catch (error) {
      console.error("Refresh error:", error);
      toast.error("❌ Failed to refresh options!", {
        position: "top-right",
        autoClose: 2000,
        theme: "colored",
      });
    }
  };

  // ✅ Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ✅ Customer autocomplete
  const handleCustomerInput = async (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, customer_name: value }));
    if (value.trim().length >= 1) {
      try {
        const res = await axios.get(
          `${API}/customers?term=${encodeURIComponent(value)}`
        );
        setSuggestions(res.data);
      } catch (err) {
        console.error("Error fetching customer suggestions:", err);
      }
    } else {
      setSuggestions([]);
    }
  };

  const selectCustomer = (cust) => {
    const name = cust.customer_name || cust.name || "";
    setFormData((prev) => ({ ...prev, customer_name: name }));
    setSuggestions([]);
    outstandingCustomer(cust);
  };

  // ✅ Save or Update receipt
  const handleSave = async (e) => {
    e.preventDefault();

    if (
      !formData.customer_name ||
      !formData.ModeOfPayment ||
      !formData.TransactionAmount ||
      !formData.AccountHead
    ) {
      alert("Please fill in all mandatory fields (*).");
      return;
    }

    const payload = {
      ...formData,
      TransactionAmount: parseFloat(formData.TransactionAmount),
    };

    try {
      if (formData.id) {
        await axios.put(`${API}/receipts/${formData.id}`, payload);
        setSuccess("Receipt Updated Successfully!");
      } else {
        await axios.post(`${API}/receipts`, payload);
        setSuccess("Receipt Saved Successfully!");
      }

      navigate("/receiptmy");
    } catch (error) {
      console.error(
        "Save Error:",
        error.response ? error.response.data : error.message
      );
      setError("Error saving receipt!");
    }
  };

  // ✅ Clear Form
  const handleClear = () => setFormData(getInitialState());

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
              <i className="bi bi-exclamation-circle me-2"></i>
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
        <div className="card-header bg-white border-0">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h2 className="card-title fw-bold mb-0">
                {formData.id ? "Edit Receipt" : "Receipt"}{" "}
                <span className="text-muted">(Receive Payment)</span>
              </h2>
              <p className="text-muted small mb-0">
                An official document issued to customers as proof of payment.
              </p>
            </div>
            <div className="text-end">
              <div className="text-muted small">Receipt Number</div>
              <div className="fs-4 fw-bold text-primary">{formData.id || id || "Loading..."}</div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave}>
          {/* 1. Basic Details */}
          <h4 className="mt-4 mb-3 border-bottom pb-2">1. Basic Details</h4>
          <div className="row g-3">
            <div className="col-md-3 mb-2 position-relative">
              <label className="form-label">Customer Name</label>
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
              <input
                type="text"
                name="customer_name"
                value={formData.customer_name}
                onChange={handleCustomerInput}
                className="form-control"
                autoComplete="off"
                onBlur={() => setTimeout(() => setSuggestions([]), 200)}
              />
              {suggestions.length > 0 && (
                <ul
                  className="list-group position-absolute w-100 shadow"
                  style={{ zIndex: 1000, top: "100%" }}
                >
                  {suggestions.map((cust) => {
                    const display =
                      cust.customer_name ?? cust.name ?? `${cust.id || ""}`;
                    return (
                      <li
                        key={cust.id ?? display}
                        className="list-group-item list-group-item-action"
                        onClick={() => selectCustomer(cust)}
                        style={{ cursor: "pointer" }}
                      >
                        {display}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

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

            <div className="col-md-3">
              <label className="form-label">Invoice No#</label>
              <input
                type="text"
                className="form-control"
                name="ReferenceNo"
                value={formData.ReferenceNo}
                onChange={handleChange}
              />
            </div>

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
                required
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

          {/* Buttons */}
          <div className="d-flex justify-content-end mt-4 pt-3 gap-2">
            <button type="submit" className="btn btn-success px-4">
              {formData.id ? "Update" : "Save"}
            </button>
            <button
              type="button"
              className="btn btn-secondary px-4"
              onClick={handleClear}
            >
              Clear
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditReceiptForm;
