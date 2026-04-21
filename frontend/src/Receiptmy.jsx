import Loader from "./Loader";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const API = process.env.REACT_APP_API_URL;

function Receiptmy() {
  const [receipts, setReceipts] = useState([]);
  const [filteredReceipts, setFilteredReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [receiptPriv, setReceiptPriv] = useState(null);
  const user = JSON.parse(localStorage.getItem("user") || "null");


  const [filters, setFilters] = useState({
    customer_name: "",
    TransactionDate: "",
    TransactionAmount: "",
  });

  const [nameSuggestions, setNameSuggestions] = useState([]);
  const navigate = useNavigate();

  // ✅ Fetch receipts
  // const fetchReceipts = async () => {
  //   try {
  //     const res = await axios.get(`${API}/receipts`);
  //     // Format TransactionDate to yyyy-MM-dd
  //     const data = res.data.map((r) => ({
  //       ...r,
  //       TransactionDate: r.TransactionDate?.slice(0, 10),
  //     }));
  //     setReceipts(data);
  //     setFilteredReceipts(data);
  //   } catch (err) {
  //     console.error("Error fetching receipts:", err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const fetchReceipts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/receipts`, {
        params: {
          usertype_id: user.usertype_id,
        },
      });

      const data = (res.data.data || res.data).map((r) => ({
        ...r,
        TransactionDate: r.TransactionDate?.slice(0, 10),
      }));

      setReceipts(data);
      setFilteredReceipts(data);
      setReceiptPriv(res.data.privileges || {});
    } catch (err) {
      console.error("Error fetching receipts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.usertype_id]);






  // ✅ Filter logic
  useEffect(() => {
    const result = receipts.filter((r) => {
      const rDate = r.TransactionDate?.slice(0, 10); // yyyy-MM-dd
      return (
        (filters.customer_name === "" ||
          r.customer_name?.toLowerCase().includes(filters.customer_name.toLowerCase())) &&
        (filters.TransactionDate === "" || rDate === filters.TransactionDate) &&
        (filters.TransactionAmount === "" ||
          String(r.TransactionAmount)
            .toLowerCase()
            .includes(filters.TransactionAmount.toLowerCase()))
      );
    });
    setFilteredReceipts(result);
  }, [filters, receipts]);

  // ✅ Handle input changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    if (name === "TransactionDate") {
      setFilters((prev) => ({ ...prev, [name]: value }));
      return;
    }

    setFilters((prev) => ({ ...prev, [name]: value }));

    // Autocomplete for CustomerName
    if (name === "customer_name") {
      if (value.trim() === "") {
        setNameSuggestions([]);
      } else {
        const suggestions = receipts
          .filter((r) => r.customer_name?.toLowerCase().includes(value.toLowerCase()))
          .slice(0, 5);
        setNameSuggestions(suggestions);
      }
    }
  };

  const handleNameSelect = (name) => {
    setFilters((prev) => ({ ...prev, customer_name: name }));
    setNameSuggestions([]);
  };

  // ✅ Delete single receipt
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this receipt?")) {
      try {
        await axios.delete(`${API}/receipts/${id}`);
        alert("Receipt deleted successfully!");
        fetchReceipts();
      } catch (err) {
        console.error("Error deleting receipt:", err);
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
      const allIds = filteredReceipts.map((r) => r.id);
      setSelectedIds(allIds);
    } else {
      setSelectedIds([]);
    }
    setSelectAll(!selectAll);
  };

  // ✅ Delete selected receipts
  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) {
      alert("Please select at least one receipt to delete.");
      return;
    }
    if (window.confirm("Are you sure you want to delete selected receipts?")) {
      try {
        for (const id of selectedIds) {
          await axios.delete(`${API}/receipts/${id}`);
        }
        alert("Selected receipts deleted successfully!");
        setSelectedIds([]);
        setSelectAll(false);
        fetchReceipts();
      } catch (err) {
        console.error("Error deleting selected receipts:", err);
      }
    }
  };

  // Convert ISO date to yyyy-MM-dd


  // Convert ISO date to dd/MM/yyyy
  const formatDateDDMMYYYY = (str) => {
    if (!str) return "";
    const [dd, mm, yyyy] = str.split("-"); // "2026-01-19"
    return `${dd}-${mm}-${yyyy}`;
  };


  if (loading) return <Loader />;
  return receiptPriv?.can_view ? (
    <div className="container-fluid py-4 px-md-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-primary mb-0">
          <i className="bi bi-receipt me-2"></i>Receipt Master
        </h2>
        <div className="btn-group shadow-sm">
          {receiptPriv?.can_add === 1 && (
            <button className="btn btn-primary d-flex align-items-center fw-bold px-4" onClick={() => navigate("/receiptform")}>
              <i className="bi bi-plus-lg me-2"></i>New
            </button>
          )}
          {receiptPriv?.can_delete === 1 && (
            <button className="btn btn-danger d-flex align-items-center" onClick={handleDeleteSelected} disabled={selectedIds.length === 0}>
              <i className="bi bi-trash me-2"></i>Delete ({selectedIds.length})
            </button>
          )}
        </div>
      </div>

      {/* Filters Card */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body p-4">
          <div className="row g-3 px-2">
            <div className="col-md-4 position-relative">
              <label className="form-label fw-bold small text-muted">Customer Name</label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0"><i className="bi bi-person text-muted"></i></span>
                <input type="text" name="customer_name" className="form-control border-start-0 ps-0" placeholder="Search name..." value={filters.customer_name} onChange={handleFilterChange} autoComplete="off" />
              </div>
              {nameSuggestions.length > 0 && (
                <ul className="list-group position-absolute shadow-sm" style={{ zIndex: 1000, width: '31%', marginTop: '5px', maxHeight: "200px", overflowY: "auto" }}>
                  {nameSuggestions.map((s, index) => (
                    <li key={index} className="list-group-item list-group-item-action fw-bold small" onClick={() => handleNameSelect(s.customer_name)} style={{ cursor: "pointer" }}>
                      {s.customer_name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="col-md-4">
              <label className="form-label fw-bold small text-muted">Transaction Date</label>
              <input type="date" name="TransactionDate" className="form-control" value={filters.TransactionDate || ""} onChange={handleFilterChange} />
            </div>
            <div className="col-md-4">
              <label className="form-label fw-bold small text-muted">Transaction Amount</label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">₹</span>
                <input type="text" name="TransactionAmount" className="form-control border-start-0 ps-0" placeholder="Search by amount..." value={filters.TransactionAmount} onChange={handleFilterChange} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover table-striped mb-0 align-middle" style={{ fontSize: '16px' }}>
              <thead className="table-dark small">
                <tr>
                  <th className="ps-4" width="40"><input className="form-check-input" type="checkbox" checked={selectAll} onChange={handleSelectAll} /></th>
                  <th className="fw-bold py-3">CUSTOMER DETAILS</th>
                  <th className="fw-bold py-3">TRANSACTION DATE</th>
                  <th className="fw-bold py-3 text-end">AMOUNT</th>
                  <th className="fw-bold py-3 text-end pe-4" width="120">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredReceipts.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-5 text-muted fw-bold">No receipts found matching your criteria.</td></tr>
                ) : (
                  filteredReceipts.map((r) => (
                    <tr key={r.id}>
                      <td className="ps-4"><input className="form-check-input" type="checkbox" checked={selectedIds.includes(r.id)} onChange={() => handleCheckboxChange(r.id)} /></td>
                      <td>
                        <div className="fw-bold text-dark">{r.customer_name}</div>
                        <div className="text-muted small" style={{ fontSize: '12px' }}>ID: #{r.id}</div>
                      </td>
                      <td className="small">{formatDateDDMMYYYY(r.TransactionDate)}</td>
                      <td className="text-end fw-bold">₹{r.TransactionAmount}</td>
                      <td className="text-end pe-4">
                        <div className="d-flex justify-content-end gap-2">
                          <button className="btn btn-outline-secondary btn-sm rounded-circle d-flex align-items-center justify-content-center border-0 "
                            style={{ width: '32px', height: '32px' }} title="Print"
                            onClick={() => window.open(`${API}/printreceipt/receipt/${r.id}`, "_blank")}>
                            <i className="bi bi-printer-fill"></i>
                          </button>
                          {receiptPriv?.can_update === 1 && (
                            <button className="btn btn-outline-primary btn-sm rounded-circle d-flex align-items-center justify-content-center border-0 "
                              style={{ width: '32px', height: '32px' }} onClick={() => navigate(`/editreceipt/${r.id}`)} title="Edit">
                              <i className="bi bi-pencil-square"></i>
                            </button>
                          )}
                          {receiptPriv?.can_delete === 1 && (
                            <button className="btn btn-outline-danger btn-sm rounded-circle d-flex align-items-center justify-content-center border-0 "
                              style={{ width: '32px', height: '32px' }} onClick={() => handleDelete(r.id)} title="Delete">
                              <i className="bi bi-trash-fill"></i>
                            </button>
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
          <span className="text-muted small">Showing {filteredReceipts.length} of {receipts.length} receipts</span>
        </div>
      </div>
    </div>
  ) : (
    <div className="text-center p-5 bg-white shadow-sm rounded border border-danger border-opacity-25" style={{ marginTop: "20px" }}>
      <i className="bi bi-shield-lock text-danger display-1 mb-4"></i>
      <h1 className="fw-bold text-dark">🚫 Access Denied</h1>
      <p className="lead text-muted mb-4">You do not have permission to view this page.</p>
      <button className="btn btn-danger btn-lg px-5 shadow" onClick={() => navigate("/dashboard")}>Return to Safety</button>
    </div>
  );
}

export default Receiptmy;

