import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API = process.env.REACT_APP_API_URL;

// Initial State
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

function EditVoucherForm() {
  const [formData, setFormData] = useState(getInitialState());
  const [modeofpayment, setModeofpayment] = useState([]);
  const [accounthead, setAccounthead] = useState([]);
  const [bankaccount, setBankaccount] = useState([]);
  const [employee_name, setEmployeename] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    document.title = `Edit Voucher No: ${id || ""} - TSL ERP`;
  }, [id]);

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
      console.error("Error:", err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await axios.get(`${API}/employees`);
      setEmployeename(res.data);
    } catch (err) {
      console.error("Employee fetch error:", err);
    }
  };

  // Fetch voucher (Edit)
  const fetchVoucher = useCallback(async () => {
    if (!id) return;

    try {
      const res = await axios.get(`${API}/vouchers/${id}`);

      if (res.data) {
        setFormData({
          ...res.data,
          VoucherDate: res.data.VoucherDate?.slice(0, 10) || "",
        });
      }
    } catch (err) {
      console.error("Voucher fetch error:", err);
      alert("Voucher not found!");
      navigate("/vouchermy");
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchModeofpayment();
    fetchBankaccount();
    fetchAccounthead();
    fetchEmployees();
    fetchVoucher();
  }, [id, fetchVoucher]);

  // Refresh dropdowns
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
    } catch (err) {
      toast.error("Refresh failed!", { autoClose: 2000 });
    }
  };

  // Supplier autocomplete
  const handleSupplierInput = async (e) => {
    const val = e.target.value;

    setFormData((prev) => ({ ...prev, SupplierName: val }));

    if (val.trim().length >= 1) {
      try {
        const res = await axios.get(
          `${API}/supplier?term=${encodeURIComponent(val)}`
        );
        setSuggestions(res.data);
      } catch (err) {
        console.error("Supplier suggestion error:", err);
      }
    } else {
      setSuggestions([]);
    }
  };

  const selectSupplier = (sup) => {
    const name = sup.supplier_name || sup.name || "";
    setFormData((prev) => ({ ...prev, SupplierName: name }));
    setSuggestions([]);
  };

  // Input Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Save or Update
  const handleSave = async (e) => {
    e.preventDefault();


    const payload = {
      ...formData,
      Amount: parseFloat(formData.Amount),
    };

    try {
      if (formData.id) {
        await axios.put(`${API}/vouchers/${formData.id}`, payload);
        alert("Voucher Updated Successfully!");
      } else {
        await axios.post(`${API}/vouchers`, payload);
        alert("Voucher Saved Successfully!");
      }

      navigate("/vouchermy");
    } catch (err) {
      console.error("Save error:", err);
      alert("Failed to save!");
    }
  };

  const handleClear = () => setFormData(getInitialState());

  return (
    <div className="container my-5">
      <ToastContainer />
      <div className="card shadow-lg p-4">
        <div className="mb-3 position-relative" style={{ height: "2.5rem" }}>
          {/* Voucher No on the left */}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: "1.1rem",
              fontWeight: "600",
            }}
          >
            <label className="fw-bold mb-0 me-1 text-muted small">Voucher No:</label>
            <span className="text-primary">{id || "Loading..."}</span>
          </div>

          <h2 className="card-title fw-bold mb-0 text-center" style={{ lineHeight: "2.5rem" }}>
            {formData.id ? "Edit Voucher" : "Voucher"}{" "}
            <span className="text-muted">(Payment)</span>
          </h2>
        </div>

        <form onSubmit={handleSave}>
          {/* 1. Basic Details */}
          <h4 className="mt-4 mb-3 border-bottom pb-2">1. Basic Details</h4>

          <div className="row g-3">

            {/* Supplier Name */}
            <div className="col-md-3 mb-2 position-relative">
              <label className="form-label">Supplier Name</label>
              <button
                type="button"
                className="btn btn-outline-success ms-2"
                onClick={() => window.open("/supplier", "_blank")}
              >
                +
              </button>
              <input
                type="text"
                name="SupplierName"
                value={formData.SupplierName}
                onChange={handleSupplierInput}
                className="form-control"
                autoComplete="off"
                onBlur={() => setTimeout(() => setSuggestions([]), 200)}
              />
              {suggestions.length > 0 && (
                <ul
                  className="list-group position-absolute w-100 shadow"
                  style={{ zIndex: 1000, top: "100%" }}
                >
                  {suggestions.map((sup) => (
                    <li
                      key={sup.id}
                      className="list-group-item list-group-item-action"
                      onClick={() => selectSupplier(sup)}
                      style={{ cursor: "pointer" }}
                    >
                      {sup.supplier_name || sup.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Date */}
            <div className="col-md-3">
              <label className="form-label">Transaction Date *</label>
              <input
                type="date"
                name="VoucherDate"
                value={formData.VoucherDate}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>

            {/* Mode of Payment */}
            <div className="col-md-3">
              <label className="form-label">
                Mode of Payment <span className="text-danger">*</span>
              </label>
              <button
                type="button"
                className="btn btn-outline-success ms-2"
                onClick={() => window.open("/modeofpayment", "_blank")}
              >
                +
              </button>
              <button
                type="button"
                className="btn btn-outline-primary ms-2"
                onClick={handleRefresh}
              >
                ⟳
              </button>
              <select
                name="ModeOfPayment"
                value={formData.ModeOfPayment}
                onChange={handleChange}
                className="form-select"
                required
              >
                <option value="">Select...</option>
                {modeofpayment.map((m, i) => (
                  <option key={i} value={m.modeofpayment}>
                    {m.modeofpayment}
                  </option>
                ))}
              </select>
            </div>

            {/* Voucher Ref */}
            <div className="col-md-3">
              <label className="form-label">Voucher Ref No *</label>
              <input
                type="text"
                name="VoucherRefNo"
                value={formData.VoucherRefNo}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>

            {/* Transaction Amount */}
            <div className="col-md-3">
              <label className="form-label">
                Transaction Amount <span className="text-danger">*</span>
              </label>
              <input
                type="number"
                name="Amount"
                value={formData.Amount}
                onChange={handleChange}
                className="form-control"
                step="0.01"
                min="0.01"
                required
              />
            </div>
          </div>

          {/* DETAILS */}
          <div className="row mt-3">
            <div className="col-12">
              <label className="form-label">Details</label>
              <textarea
                name="Details"
                value={formData.Details}
                onChange={handleChange}
                className="form-control"
                rows="3"
              />
            </div>
          </div>

          {/* 2. OTHER DETAILS */}
          <h4 className="mt-4 mb-3 border-bottom pb-2">2. Other Details</h4>

          <div className="row g-3">

            {/* Payment Against */}
            <div className="col-md-3">
              <label className="form-label">Payment Against</label>
              <select
                name="PaymentAgainst"
                value={formData.PaymentAgainst}
                onChange={handleChange}
                className="form-select"
              >
                <option value="">Select...</option>
                <option value="Purchase Bill">Purchase Bill</option>
                <option value="Advance">Advance</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Reference No */}
            <div className="col-md-3">
              <label className="form-label">Reference No</label>
              <input
                type="text"
                name="ReferenceNo"
                value={formData.ReferenceNo}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            {/* Bank Account */}
            <div className="col-md-3">
              <label className="form-label">Bank/Account Name</label>
              <button
                type="button"
                className="btn btn-outline-success ms-2"
                onClick={() => window.open("/bankaccount", "_blank")}
              >
                +
              </button>
              <button
                type="button"
                className="btn btn-outline-primary ms-2"
                onClick={handleRefresh}
              >
                ⟳
              </button>
              <select
                name="BankAccountName"
                value={formData.BankAccountName}
                onChange={handleChange}
                className="form-select"
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
              <label className="form-label">
                Account Head (Chart of A/C){" "}
                <span className="text-danger">*</span>
              </label>
              <button
                type="button"
                className="btn btn-outline-success ms-2"
                onClick={() => window.open("/accounthead", "_blank")}
              >
                +
              </button>
              <button
                type="button"
                className="btn btn-outline-primary ms-2"
                onClick={handleRefresh}
              >
                ⟳
              </button>
              <select
                name="AccountHead"
                value={formData.AccountHead}
                onChange={handleChange}
                className="form-select"
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

            {/* Employee */}
            <div className="col-md-3">
              <label className="form-label">Staff Name *</label>
              <button
                type="button"
                className="btn btn-outline-success ms-2"
                onClick={() => window.open("/employee", "_blank")}
              >
                +
              </button>
              <button
                type="button"
                className="btn btn-outline-primary ms-2"
                onClick={handleRefresh}
              >
                ⟳
              </button>
              <select
                name="StaffName"
                value={formData.StaffName}
                onChange={handleChange}
                className="form-select"
                required
              >
                <option value="">Select...</option>
                {employee_name.map((e, i) => (
                  <option key={i} value={e.employee_name}>
                    {e.employee_name}
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

export default EditVoucherForm;
