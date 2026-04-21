import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const API = process.env.REACT_APP_API_URL;

// Helper for initial state
const getInitialState = () => ({
  id: "",
  SupplierName: "",
  VoucherDate: new Date().toISOString().substring(0, 10),
  ModeOfPayment: "",
  Amount: "",
  Details: "",
  PaymentAgainst: "",
  ReferenceNo: "",
  BankAccountName: "",
  AccountHead: "",
  StaffName: "",
  VoucherRefNo: "",
});

function VoucherForm() {
  const [formData, setFormData] = useState(getInitialState());
  const [modeofpayment, setModeofpayment] = useState([]);
  const [accounthead, setAccounthead] = useState([]);
  const [bankaccount, setBankaccount] = useState([]);
  const [employee_name, setEmployeename] = useState([]);

  const [suggestions, setSuggestions] = useState([]);
  const [voucherNo, setVoucherNo] = useState("");
  const [suggestionIndex, setSuggestionIndex] = useState(-1);

  const navigate = useNavigate();

  // Fetch dropdowns
  const fetchModeofpayment = async () => {
    try {
      const res = await axios.get(`${API}/modeofpayment`);
      setModeofpayment(res.data);
    } catch (err) {
      console.error("Error fetching mode of payment:", err);
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
    fetchVoucherNo();
  }, []);

  const fetchVoucherNo = async () => {
    try {
      const res = await axios.get(`${API}/vouchers/next-voucher-no`);
      setVoucherNo(res.data.voucherNo);
    } catch (err) {
      console.error("Failed to load voucher number", err);
    }
  };

  useEffect(() => {
    document.title = `Voucher Form No: ${voucherNo || ""} - TSL ERP`;
  }, [voucherNo]);

  // Refresh list
  const handleRefresh = async () => {
    try {
      await fetchModeofpayment();
      await fetchBankaccount();
      await fetchAccounthead();
      await fetchEmployees();

      toast.success("Options refreshed!", {
        position: "top-right",
        autoClose: 2000,
      });
    } catch (error) {
      toast.error("Failed to refresh!", {
        position: "top-right",
        autoClose: 2000,
      });
    }
  };

  const handleSupplierInput = async (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, SupplierName: value }));

    if (value.trim().length >= 1) {
      try {
        const res = await axios.get(`${API}/supplier?term=${encodeURIComponent(value)}`);
        const data = res.data.map(s => ({ ...s, type: "Supplier", SupplierName: s.supplier_name || s.name }));
        setSuggestions(data.slice(0, 10));
        setSuggestionIndex(-1);
      } catch (err) {
        console.error("Error fetching suggestions:", err);
      }
    } else {
      setSuggestions([]);
    }
  };

  const selectSupplier = (sup) => {
    const name = sup.SupplierName || sup.supplier_name || sup.customer_name || sup.name || "";
    setFormData((prev) => ({ ...prev, SupplierName: name }));
    setSuggestions([]);
    setSuggestionIndex(-1);
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
        selectSupplier(suggestions[suggestionIndex]);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const selectedYear = JSON.parse(localStorage.getItem("selectedYear") || "{}");
    if (selectedYear.is_closed) {
      toast.error("Error: This Accounting Year is locked and cannot be modified.");
      return;
    }

    const voucherDate = new Date(formData.VoucherDate);
    const startDate = new Date(selectedYear.start_date);
    const endDate = new Date(selectedYear.end_date);

    if (voucherDate < startDate || voucherDate > endDate) {
      if (!window.confirm(`Warning: Voucher date is outside the selected Accounting Year (AY ${selectedYear.year_name}). Do you want to proceed anyway?`)) {
        return;
      }
    }

    const payload = {
      ...formData,
      TransactionAmount: parseFloat(formData.Amount),
      year_id: selectedYear.year_id
    };

    try {
      if (formData.id) {
        await axios.put(`${API}/vouchers/${formData.id}`, payload);
        toast.success("Voucher updated successfully!");
      } else {
        await axios.post(`${API}/vouchers`, payload);
        toast.success("Voucher saved successfully!");
      }

      setTimeout(() => navigate("/vouchermy"), 1500);
      setFormData(getInitialState());
    } catch (error) {
      console.error("Save Error:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Error saving voucher!");
    }
  };

  const handleClear = () => setFormData(getInitialState());

  return (
    <div className="container my-5">
      <ToastContainer />
      <div className="card shadow-lg p-4">
        <div className="mb-3 d-flex justify-content-between align-items-center border-bottom pb-3">
          <div className="d-flex align-items-center gap-4">
            <div>
              <label className="fw-bold mb-0 me-1 text-muted small">Voucher No:</label>
              <div className="text-primary fw-bold fs-5">{voucherNo || "Loading..."}</div>
            </div>
            <div className="vr" style={{ height: '40px' }}></div>
            <div>
              <label className="fw-bold mb-0 me-1 text-muted small">Accounting Year:</label>
              <div className="text-dark fw-bold">AY {JSON.parse(localStorage.getItem("selectedYear") || "{}").year_name}</div>
            </div>
          </div>

          <div className="text-center flex-grow-1">
            <h2 className="fw-bold mb-0">Voucher <span className="text-muted">(Payment)</span></h2>
          </div>

          <div style={{ width: '200px', textAlign: 'right' }}>
            {JSON.parse(localStorage.getItem("selectedYear") || "{}").is_closed ? (
              <span className="badge bg-danger px-3 py-2 rounded-pill">
                <i className="bi bi-lock-fill me-1"></i>YEAR LOCKED
              </span>
            ) : (
              <span className="badge bg-success px-3 py-2 rounded-pill">
                <i className="bi bi-unlock-fill me-1"></i>ACTIVE YEAR
              </span>
            )}
          </div>
        </div>

        <form onSubmit={handleSave}>
          <h4 className="mt-4 mb-3 border-bottom pb-2">1. Basic Details</h4>
          <div className="row g-3">
            <div className="col-md-6 mb-2 position-relative">
              <label className="form-label">Supplier Name</label>
              <input
                type="text"
                name="SupplierName"
                value={formData.SupplierName}
                onChange={handleSupplierInput}
                onKeyDown={handleKeyDown}
                className="form-control"
                autoComplete="off"
                onBlur={() => setTimeout(() => setSuggestions([]), 200)}
              />
              {suggestions.length > 0 && (
                <ul className="list-group position-absolute w-100 shadow" style={{ zIndex: 1000, top: "100%" }}>
                  {suggestions.map((sup, index) => (
                    <li
                      key={sup.id}
                      className={`list-group-item list-group-item-action ${suggestionIndex === index ? "active" : ""}`}
                      onClick={() => selectSupplier(sup)}
                      style={{ cursor: "pointer" }}
                    >
                      {sup.SupplierName || sup.supplier_name || sup.customer_name || sup.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="col-md-3">
              <label className="form-label">Voucher Date *</label>
              <input
                type="date"
                name="VoucherDate"
                value={formData.VoucherDate}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            <div className="col-md-3">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <label className="form-label">Mode of Payment *</label>
                <div className="d-flex gap-1">
                  <button type="button" className="btn btn-outline-success btn-sm" onClick={() => window.open("/modeofpayment", "_blank")}>+</button>
                  <button type="button" className="btn btn-outline-primary btn-sm" onClick={handleRefresh}>⟳</button>
                </div>
              </div>
              <select name="ModeOfPayment" value={formData.ModeOfPayment} onChange={handleChange} className="form-select">
                <option value="">Select...</option>
                {modeofpayment.map((m, i) => <option key={i} value={m.modeofpayment}>{m.modeofpayment}</option>)}
              </select>
            </div>

            <div className="col-md-3">
              <label className="form-label">Voucher Ref No *</label>
              <input type="text" name="VoucherRefNo" value={formData.VoucherRefNo} onChange={handleChange} className="form-control" placeholder="Auto/Manual Ref No" />
            </div>

            <div className="col-md-3">
              <label className="form-label">Transaction Amount *</label>
              <input type="text" name="Amount" value={formData.Amount} onChange={handleChange} className="form-control" step="0.01" min="0.01" />
            </div>
          </div>

          <div className="row mt-3">
            <div className="col-12">
              <label className="form-label">Details</label>
              <textarea name="Details" value={formData.Details} onChange={handleChange} className="form-control" rows="3" />
            </div>
          </div>

          <h4 className="mt-4 mb-3 border-bottom pb-2">2. Other Details</h4>
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label">Payment Against</label>
              <select name="PaymentAgainst" value={formData.PaymentAgainst} onChange={handleChange} className="form-select">
                <option value="">Select...</option>
                <option value="Purchase Bill">Purchase Bill</option>
                <option value="Advance">Advance</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="col-md-3">
              <label className="form-label">Reference No</label>
              <input type="text" name="ReferenceNo" value={formData.ReferenceNo} onChange={handleChange} className="form-control" />
            </div>

            <div className="col-md-3">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <label className="form-label">Bank/Account Name</label>
                <div className="d-flex gap-1">
                  <button type="button" className="btn btn-outline-success btn-sm" onClick={() => window.open("/bankaccount", "_blank")}>+</button>
                  <button type="button" className="btn btn-outline-primary btn-sm" onClick={handleRefresh}>⟳</button>
                </div>
              </div>
              <select name="BankAccountName" value={formData.BankAccountName} onChange={handleChange} className="form-select">
                <option value="">Select...</option>
                {bankaccount.map((b, i) => <option key={i} value={b.bankaccount}>{b.bankaccount}</option>)}
              </select>
            </div>

            <div className="col-md-3">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <label className="form-label">Account Head *</label>
                <div className="d-flex gap-1">
                  <button type="button" className="btn btn-outline-success btn-sm" onClick={() => window.open("/accounthead", "_blank")}>+</button>
                  <button type="button" className="btn btn-outline-primary btn-sm" onClick={handleRefresh}>⟳</button>
                </div>
              </div>
              <select name="AccountHead" value={formData.AccountHead} onChange={handleChange} className="form-select">
                <option value="">Select...</option>
                {accounthead.map((a, i) => <option key={i} value={a.accounthead}>{a.accounthead}</option>)}
              </select>
            </div>

            <div className="col-md-3">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <label className="form-label">Staff Name <span className="text-danger">*</span></label>
                <div className="d-flex gap-1">
                  <button type="button" className="btn btn-outline-success btn-sm" onClick={() => window.open("/employee", "_blank")}>+</button>
                  <button type="button" className="btn btn-outline-primary btn-sm" onClick={handleRefresh}>⟳</button>
                </div>
              </div>
              <select name="StaffName" value={formData.StaffName} onChange={handleChange} className="form-select">
                <option value="">Select...</option>
                {employee_name.map((emp) => <option key={emp.id} value={emp.employee_name}>{emp.employee_name}</option>)}
              </select>
            </div>
          </div>

          <div className="d-flex justify-content-end mt-4">
            {JSON.parse(localStorage.getItem("selectedYear") || "{}").is_closed ? (
              <div className="text-danger fw-bold me-3 d-flex align-items-center">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                Cannot save: This Accounting Year is locked.
              </div>
            ) : (
              <button type="submit" className="btn btn-success px-4 fw-bold shadow-sm">
                {formData.id ? "Update Voucher" : "Save Voucher"}
              </button>
            )}
            <button type="button" className="btn btn-secondary px-4 ms-2 fw-bold" onClick={handleClear}>Clear Form</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default VoucherForm;
