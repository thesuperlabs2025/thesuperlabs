import Loader from "./Loader";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const API = process.env.REACT_APP_API_URL;

function VoucherMy() {
  const [vouchers, setVouchers] = useState([]);
  const [filteredVouchers, setFilteredVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [voucherPriv, setVoucherPriv] = useState(null);
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [filters, setFilters] = useState({
    VoucherName: "",
    VoucherDate: "",
    Amount: "",
  });

  const [voucherNoSuggestions, setVoucherNoSuggestions] = useState([]);
  const navigate = useNavigate();

  // ✅ Fetch vouchers
  // const fetchVouchers = async () => {
  //   try {
  //     const res = await axios.get(`${API}/vouchers`);
  //     const data = res.data.map((v) => ({
  //       ...v,
  //       VoucherDate: v.VoucherDate?.slice(0, 10),
  //     }));
  //     setVouchers(data);
  //     setFilteredVouchers(data);
  //   } catch (err) {
  //     console.error("Error fetching vouchers:", err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // useEffect(() => {
  //   fetchVouchers();
  // }, []);
  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/vouchers`, {
        params: {
          usertype_id: user.usertype_id,
        },
      });

      const data = (res.data.data || res.data).map((v) => ({
        ...v,
        VoucherDate: v.VoucherDate?.slice(0, 10),
      }));

      setVouchers(data);
      setFilteredVouchers(data);

      // ✅ privilege same like receipt
      setVoucherPriv(res.data.privileges || {});
    } catch (err) {
      console.error("Error fetching vouchers:", err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchVouchers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.usertype_id]);


  // ✅ Filter logic
  useEffect(() => {
    const result = vouchers.filter((v) => {
      const vDate = v.VoucherDate?.slice(0, 10);
      return (
        (filters.VoucherName === "" ||
          v.VoucherName?.toLowerCase().includes(filters.VoucherName.toLowerCase())) &&
        (filters.VoucherDate === "" || vDate === filters.VoucherDate) &&
        (filters.Amount === "" ||
          String(v.Amount)
            .toLowerCase()
            .includes(filters.Amount.toLowerCase()))
      );
    });
    setFilteredVouchers(result);
  }, [filters, vouchers]);

  // ✅ Handle input changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    if (name === "VoucherDate") {
      setFilters((prev) => ({ ...prev, [name]: value }));
      return;
    }

    setFilters((prev) => ({ ...prev, [name]: value }));

    // Autocomplete for VoucherNo
    if (name === "VoucherName") {
      if (value.trim() === "") {
        setVoucherNoSuggestions([]);
      } else {
        const suggestions = vouchers
          .filter((v) => v.VoucherName?.toLowerCase().includes(value.toLowerCase()))
          .slice(0, 5);
        setVoucherNoSuggestions(suggestions);
      }
    }
  };

  const handleVoucherNoSelect = (no) => {
    setFilters((prev) => ({ ...prev, VoucherNo: no }));
    setVoucherNoSuggestions([]);
  };

  // ✅ Delete single voucher
  const handleDelete = async (id) => {
    const selectedYear = JSON.parse(localStorage.getItem("selectedYear") || "{}");
    if (selectedYear.is_closed) {
      alert("Error: This Accounting Year is locked. You cannot delete records.");
      return;
    }

    if (window.confirm("Are you sure you want to delete this voucher?")) {
      try {
        await axios.delete(`${API}/vouchers/${id}`);
        alert("Voucher deleted successfully!");
        fetchVouchers();
      } catch (err) {
        console.error("Error deleting voucher:", err);
      }
    }
  };

  // ✅ Checkbox handlers
  const handleCheckboxChange = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (!selectAll) {
      const allIds = filteredVouchers.map((v) => v.id);
      setSelectedIds(allIds);
    } else {
      setSelectedIds([]);
    }
    setSelectAll(!selectAll);
  };

  // ✅ Delete selected vouchers
  const handleDeleteSelected = async () => {
    const selectedYear = JSON.parse(localStorage.getItem("selectedYear") || "{}");
    if (selectedYear.is_closed) {
      alert("Error: This Accounting Year is locked. You cannot delete records.");
      return;
    }

    if (selectedIds.length === 0) {
      alert("Please select at least one voucher to delete.");
      return;
    }
    if (window.confirm("Are you sure you want to delete selected vouchers?")) {
      try {
        for (const id of selectedIds) {
          await axios.delete(`${API}/vouchers/${id}`);
        }
        alert("Selected vouchers deleted successfully!");
        setSelectedIds([]);
        setSelectAll(false);
        fetchVouchers();
      } catch (err) {
        console.error("Error deleting selected vouchers:", err);
      }
    }
  };

  // Convert ISO date to dd/MM/yyyy
  const formatDateToDDMMYYYY = (isoDate) => {
    if (!isoDate) return "";
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  if (loading) return <Loader />;

  return voucherPriv?.can_view ? (
    <div className="container-fluid py-4 px-md-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-primary mb-0">
          <i className="bi bi-file-earmark-spreadsheet me-2"></i>Voucher Master
        </h2>
        <div className="btn-group shadow-sm">
          {voucherPriv?.can_add === 1 && !JSON.parse(localStorage.getItem("selectedYear") || "{}").is_closed && (
            <button className="btn btn-primary d-flex align-items-center fw-bold px-4" onClick={() => navigate("/voucherform")}>
              <i className="bi bi-plus-lg me-2"></i>New
            </button>
          )}
          {voucherPriv?.can_delete === 1 && !JSON.parse(localStorage.getItem("selectedYear") || "{}").is_closed && (
            <button className="btn btn-danger d-flex align-items-center" onClick={handleDeleteSelected} disabled={selectedIds.length === 0}>
              <i className="bi bi-trash me-2"></i>Delete ({selectedIds.length})
            </button>
          )}
          {JSON.parse(localStorage.getItem("selectedYear") || "{}").is_closed && (
            <span className="badge bg-danger d-flex align-items-center px-3 ms-2">
              <i className="bi bi-lock-fill me-2"></i>YEAR LOCKED
            </span>
          )}
        </div>
      </div>

      {/* Filters Card */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body p-4">
          <div className="row g-3">
            <div className="col-md-4 position-relative">
              <label className="form-label fw-bold small text-muted">Supplier Name</label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0"><i className="bi bi-shop text-muted"></i></span>
                <input type="text" name="VoucherName" className="form-control border-start-0 ps-0" placeholder="Search supplier..." value={filters.VoucherName} onChange={handleFilterChange} autoComplete="off" />
              </div>
              {voucherNoSuggestions.length > 0 && (
                <ul className="list-group position-absolute shadow" style={{ zIndex: 1000, width: '31%', marginTop: '5px', maxHeight: "150px", overflowY: "auto" }}>
                  {voucherNoSuggestions.map((v, index) => (
                    <li key={index} className="list-group-item list-group-item-action fw-bold small" onClick={() => handleVoucherNoSelect(v.SupplierName)} style={{ cursor: "pointer" }}>
                      {v.SupplierName}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="col-md-4">
              <label className="form-label fw-bold small text-muted">Voucher Date</label>
              <input type="date" name="VoucherDate" className="form-control" value={filters.VoucherDate} onChange={handleFilterChange} />
            </div>
            <div className="col-md-4">
              <label className="form-label fw-bold small text-muted">Amount</label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">₹</span>
                <input type="text" name="Amount" className="form-control border-start-0 ps-0" placeholder="Search amount..." value={filters.Amount} onChange={handleFilterChange} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="card shadow-sm border-0">
        <div className="card-body p-0 text-truncate">
          <div className="table-responsive">
            <table className="table table-hover table-striped mb-0 align-middle" style={{ fontSize: '16px' }}>
              <thead className="table-dark small">
                <tr>
                  <th className="ps-4" width="40"><input className="form-check-input" type="checkbox" checked={selectAll} onChange={handleSelectAll} /></th>
                  <th className="fw-bold py-3">SUPPLIER NAME</th>
                  <th className="fw-bold py-3">VOUCHER DATE</th>
                  <th className="fw-bold py-3 text-end">AMOUNT</th>
                  <th className="fw-bold py-3 text-end pe-4" width="120">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredVouchers.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-5 text-muted fw-bold">No vouchers found.</td></tr>
                ) : (
                  filteredVouchers.map((v) => (
                    <tr key={v.id}>
                      <td className="ps-4"><input className="form-check-input" type="checkbox" checked={selectedIds.includes(v.id)} onChange={() => handleCheckboxChange(v.id)} /></td>
                      <td className="fw-bold text-dark">{v.SupplierName}</td>
                      <td className="small">{formatDateToDDMMYYYY(v.VoucherDate)}</td>
                      <td className="text-end fw-bold">₹{v.Amount}</td>
                      <td className="text-end pe-4">
                        <div className="d-flex justify-content-end gap-2">
                          <button className="btn btn-outline-secondary btn-sm rounded-circle d-flex align-items-center justify-content-center border-0 "
                            style={{ width: '32px', height: '32px' }} title="Print"
                            onClick={() => window.open(`${API}/printvoucher/voucher/${v.id}`, "_blank")}>
                            <i className="bi bi-printer-fill"></i>
                          </button>
                          {voucherPriv?.can_update === 1 && !JSON.parse(localStorage.getItem("selectedYear") || "{}").is_closed && (
                            <button className="btn btn-outline-primary btn-sm rounded-circle d-flex align-items-center justify-content-center border-0 "
                              style={{ width: '32px', height: '32px' }} title="Edit"
                              onClick={() => navigate(`/editvoucher/${v.id}`)}>
                              <i className="bi bi-pencil-square"></i>
                            </button>
                          )}
                          {voucherPriv?.can_delete === 1 && !JSON.parse(localStorage.getItem("selectedYear") || "{}").is_closed && (
                            <button className="btn btn-outline-danger btn-sm rounded-circle d-flex align-items-center justify-content-center border-0 "
                              style={{ width: '32px', height: '32px' }} title="Delete"
                              onClick={() => handleDelete(v.id)}>
                              <i className="bi bi-trash-fill"></i>
                            </button>
                          )}
                          {JSON.parse(localStorage.getItem("selectedYear") || "{}").is_closed && (
                            <i className="bi bi-lock-fill text-muted" title="Locked"></i>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card-footer bg-white py-3 border-0">
          <span className="text-muted small">Showing {filteredVouchers.length} of {vouchers.length} vouchers</span>
        </div>
      </div>
    </div>
  ) : (
    <div className="text-center p-5 bg-white shadow-sm rounded border border-danger border-opacity-25" style={{ marginTop: "20px" }}>
      <i className="bi bi-shield-lock text-danger display-1 mb-4"></i>
      <h1 className="fw-bold text-dark">🚫 Access Denied</h1>
      <p className="lead text-muted mb-4">You do not have permission to view this module.</p>
      <button className="btn btn-danger btn-lg px-5 shadow" onClick={() => navigate("/dashboard")}>Return to Safety</button>
    </div>
  );
}

export default VoucherMy;

