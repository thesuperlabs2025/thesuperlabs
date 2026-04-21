// Invoicemy.jsx
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Loader from "./Loader";





const API = process.env.REACT_APP_API_URL;

function Invoicemy() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedIds, setSelectedIds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [invoicePriv, setInvoicePriv] = useState(null);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [targetModule, setTargetModule] = useState("");
  const user = JSON.parse(localStorage.getItem("user") || "null");


  const [nameSuggestions, setNameSuggestions] = useState([]);

  // pagination & sorting
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [pagination, setPagination] = useState(null);
  const [sortBy, setSortBy] = useState("id");
  const [order, setOrder] = useState("DESC");
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    customer_name: "",
    mobile: "",
    sales_person: "",
    invoice_date: "",
    due_date: "",
    grand_total: "",
    status: "", // All / Paid / Pending
  });





  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        sort_by: sortBy,
        order,
        usertype_id: user.usertype_id, // send "Admin" / "User" etc.
      };

      if (filters.customer_name) params.customer_name = filters.customer_name;
      if (filters.mobile) params.mobile = filters.mobile;
      if (filters.sales_person) params.sales_person = filters.sales_person;
      if (filters.invoice_date) params.invoice_date = filters.invoice_date;
      if (filters.due_date) params.due_date = filters.due_date;
      if (filters.grand_total) params.grand_total = filters.grand_total;
      if (filters.status) params.status = filters.status;

      const res = await axios.get(`${API}/invoices`, { params });

      console.log("API response:", res.data);

      // ✅ debug

      setInvoices(res.data.data || []);
      setPagination(res.data.pagination || { page: 1, limit: 20, total: res.data.data.length, pages: 1 });
      setInvoicePriv(res.data.privileges || {});
      setSelectedIds([]);
      setSelectAll(false);
    } catch (err) {
      console.error("Fetch Invoices Error:", err);
      alert(err.response?.data?.message || "Error loading invoices");
    } finally {
      setLoading(false);
    }
  }, [page, limit, sortBy, order, filters, user.usertype_id]);

  const handleConvert = () => {
    if (selectedIds.length === 0) {
      alert("Please select at least one invoice to convert.");
      return;
    }

    const selectedInvoices = invoices.filter(inv => selectedIds.includes(inv.id));
    const sameCustomer = selectedInvoices.every(inv => inv.customer_name === selectedInvoices[0].customer_name);

    if (!sameCustomer) {
      alert("Please select invoices from the same customer for conversion.");
      return;
    }

    setShowConvertModal(true);
  };

  const confirmConvert = async () => {
    if (!targetModule) {
      alert("Please select a target module.");
      return;
    }

    try {
      const fullDetails = await Promise.all(
        selectedIds.map(id => axios.get(`${API}/invoices/${id}`).then(res => res.data))
      );

      const first = fullDetails[0];
      const combinedItems = fullDetails.flatMap(inv => inv.items);

      // Map combined data to target form structure
      const convertData = {
        customer_id: first.customer_id,
        customer_name: first.customer_name,
        ship_to: first.ship_to,
        mobile: first.mobile,
        billing_address: first.billing_address,
        sales_person: first.sales_person,
        items: combinedItems.map(item => ({
          product_name: item.product_name || item.sku, // Adjust as needed
          sku: item.sku,
          qty: item.qty,
          rate: item.rate,
          disc_val: item.disc_val,
          disc_percent: item.disc_percent,
          gst_percent: item.gst_percent,
          total: item.total
        }))
      };

      const paths = {
        "Invoice": "/invoiceform",
        "Purchase": "/purchaseform",
        "DC": "/dcform",
        "PO": "/poform",
        "PI": "/piform",
        "Estimate": "/estimateform",
        "Sales Return": "/salesreturnform",
        "Purchase Return": "/purchasereturnform",
        "Credit Note": "/creditnoteform",
        "Debit Note": "/debitnoteform",
        "GRN": "/grnform",
        "Quotation": "/quotationform"
      };

      navigate(paths[targetModule], { state: { convertData } });
    } catch (err) {
      console.error("Conversion error:", err);
      alert("Failed to fetch invoice details for conversion.");
    }
  };





  // 3️⃣ Example: Users module privilege












  // { invoiceId: totalPaid }
  const [paidAmounts, setPaidAmounts] = useState({});

  // ✅ Fetch payment progress
  const fetchPaymentProgress = useCallback(
    async (invoiceId) => {
      try {
        const res = await axios.get(
          `${API}/invoices/payment-progress`,
          {
            params: { invoiceId },
          }
        );

        setPaidAmounts((prev) => ({
          ...prev,
          [invoiceId]: {
            grand_total: Number(res.data.grand_total),
            total_paid: Number(res.data.total_paid),
            payment_percentage: Number(res.data.payment_percentage),
          },
        }));
      } catch (err) {
        console.error("❌ Payment progress error:", err.message);

        setPaidAmounts((prev) => ({
          ...prev,
          [invoiceId]: {
            grand_total: 0,
            total_paid: 0,
            payment_percentage: 0,
          },
        }));
      }
    },
    [] // ✅ warning fixed
  );

  // ✅ Fetch for all invoices
  useEffect(() => {
    if (!invoices?.length) return;

    invoices.forEach((inv) => {
      fetchPaymentProgress(inv.id);
    });
  }, [invoices, fetchPaymentProgress]);






  // const fetchInvoices = useCallback(async () => {
  //   setLoading(true);
  //   try {
  //     const params = {
  //       page,
  //       limit,
  //       sort_by: sortBy,
  //       order,
  //     };

  //     if (filters.customer_name) params.customer_name = filters.customer_name;
  //     if (filters.mobile) params.mobile = filters.mobile;
  //     if (filters.sales_person) params.sales_person = filters.sales_person;
  //     if (filters.invoice_date) params.invoice_date = filters.invoice_date;
  //     if (filters.due_date) params.due_date = filters.due_date;
  //     if (filters.status) params.status = filters.status;

  //     const res = await axios.get(`${API}/invoices`, { params });

  //     setInvoices(res.data.data || []);
  //     setPagination(res.data.pagination || null);
  //     setSelectedIds([]);
  //     setSelectAll(false);
  //   } catch (err) {
  //     console.error("Fetch Invoices Error:", err);
  //     alert("Error loading invoices");
  //   } finally {
  //     setLoading(false);
  //   }
  // }, [API, page, limit, sortBy, order, filters]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPage(1);

    if (name === "customer_name") {
      if (!value) {
        setNameSuggestions([]);
      } else {
        const suggestions = invoices
          .filter((inv) =>
            inv.customer_name?.toLowerCase().includes(value.toLowerCase())
          )
          .slice(0, 5);
        setNameSuggestions(suggestions);
      }
    }
  };

  const handleNameSelect = (name) => {
    setFilters((prev) => ({ ...prev, customer_name: name }));
    setNameSuggestions([]);
    setPage(1);
  };

  const toggleSort = (field) => {
    if (sortBy === field) {
      setOrder((o) => (o === "ASC" ? "DESC" : "ASC"));
    } else {
      setSortBy(field);
      setOrder("ASC");
    }
    setPage(1);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this invoice?")) return;
    try {
      await axios.delete(`${API}/invoices/${id}`);
      alert("Deleted");
      fetchInvoices();
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  const handleCheckboxChange = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (!selectAll) {
      setSelectedIds(invoices.map((inv) => inv.id));
    } else {
      setSelectedIds([]);
    }
    setSelectAll((s) => !s);
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) {
      alert("Select at least one invoice");
      return;
    }
    if (!window.confirm("Delete selected invoices?")) return;
    try {
      for (const id of selectedIds) {
        await axios.delete(`${API}/invoices/${id}`);
      }
      alert("Deleted selected");
      setSelectedIds([]);
      setSelectAll(false);
      fetchInvoices();
    } catch (err) {
      console.error(err);
      alert("Bulk delete failed");
    }
  };

  const goPrev = () => {
    if (page > 1) setPage((p) => p - 1);
  };
  const goNext = () => {
    if (pagination && page < pagination.pages) setPage((p) => p + 1);
  };



  if (loading) return <Loader message="Loading invoices..." />;


  return (
    <div className="container-fluid py-4 px-md-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-primary mb-0">
          <i className="bi bi-file-earmark-text me-2"></i>Invoice
        </h2>
        <div className="d-flex align-items-center gap-3">
          <button className="btn btn-outline-success btn-sm shadow-sm px-3 fw-bold" onClick={() => window.print()} title="Export">
            Export
          </button>
          <button className="btn btn-outline-primary btn-sm shadow-sm px-3 fw-bold" onClick={handleConvert} title="Convert">
            Convert
          </button>
          <div className="btn-group shadow-sm">
            {invoicePriv?.can_add === 1 && (
              <button className="btn btn-primary d-flex align-items-center fw-bold px-4 shadow-sm" onClick={() => navigate("/invoiceform")}>
                <i className="bi bi-plus-lg me-2"></i>New
              </button>
            )}
            {invoicePriv?.can_delete === 1 && (
              <button className="btn btn-danger d-flex align-items-center" onClick={handleDeleteSelected} disabled={selectedIds.length === 0}>
                <i className="bi bi-trash me-2"></i>Delete ({selectedIds.length})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filters Card */}
      <div className="card shadow-sm border-0 mb-4 no-print">
        <div className="card-body p-4">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label fw-bold small text-muted">Customer Name</label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0"><i className="bi bi-person text-muted"></i></span>
                <input type="text" name="customer_name" className="form-control border-start-0 ps-0" placeholder="Search customer..." value={filters.customer_name} onChange={handleFilterChange} autoComplete="off" />
              </div>
              {nameSuggestions.length > 0 && (
                <ul className="list-group position-absolute shadow" style={{ zIndex: 1000, marginTop: '5px', maxHeight: "200px", overflowY: "auto" }}>
                  {nameSuggestions.map((s, i) => (
                    <li key={i} className="list-group-item list-group-item-action fw-bold small" onClick={() => handleNameSelect(s.customer_name)} style={{ cursor: "pointer" }}>
                      {s.customer_name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="col-md-2">
              <label className="form-label fw-bold small text-muted">Mobile</label>
              <input type="text" name="mobile" className="form-control" placeholder="Mobile..." value={filters.mobile} onChange={handleFilterChange} />
            </div>
            <div className="col-md-2">
              <label className="form-label fw-bold small text-muted">Sales Person</label>
              <select name="sales_person" className="form-select" value={filters.sales_person} onChange={handleFilterChange}>
                <option value="">All Staff</option>
                {/* Assuming there's a list or it's dynamic, for now just text or handled via fetch */}
                <option value={filters.sales_person}>{filters.sales_person}</option>
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label fw-bold small text-muted">Invoice Date</label>
              <input type="date" name="invoice_date" className="form-control" value={filters.invoice_date} onChange={handleFilterChange} />
            </div>
            {/* <div className="col-md-2">
              <label className="form-label fw-bold small text-muted">Status</label>
              <select name="status" className="form-select" value={filters.status} onChange={handleFilterChange}>
                <option value="">All Statuses</option>
                <option value="Paid">Fully Paid</option>
                <option value="Pending">Unpaid/Partial</option>
              </select>
            </div> */}
            <div className="col-md-3 ms-auto d-flex align-items-end justify-content-end">
              <div className="d-flex align-items-center bg-white border px-3 py-1 rounded shadow-sm w-100">
                <span className="small text-muted fw-bold me-2">Rows:</span>
                <select
                  className="form-select form-select-sm border-0 bg-transparent"
                  style={{ width: 'auto', boxShadow: 'none' }}
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setPage(1);
                  }}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table Card */}
      {
        invoicePriv?.can_view ? (
          <div className="card shadow-sm border-0">
            <div className="card-body p-0 text-truncate">
              <div className="table-responsive">
                <table className="table table-hover table-striped mb-0 align-middle" style={{ fontSize: '16px' }}>
                  <thead className="table-dark small">

                    <tr>
                      <th className="ps-4 no-print" width="40"><input className="form-check-input" type="checkbox" checked={selectAll} onChange={handleSelectAll} /></th>
                      <th className="fw-bold py-3 pointer" onClick={() => toggleSort("id")}>
                        INV NO {sortBy === "id" ? (order === "ASC" ? "▲" : "▼") : ""}
                      </th>
                      <th className="fw-bold py-3 pointer" onClick={() => toggleSort("invoice_date")}>
                        DATE {sortBy === "invoice_date" ? (order === "ASC" ? "▲" : "▼") : ""}
                      </th>
                      <th className="fw-bold py-3 pointer" onClick={() => toggleSort("customer_name")}>
                        CUSTOMER {sortBy === "customer_name" ? (order === "ASC" ? "▲" : "▼") : ""}
                      </th>
                      <th className="fw-bold py-3 text-end" onClick={() => toggleSort("grand_total")}>
                        TOTAL {sortBy === "grand_total" ? (order === "ASC" ? "▲" : "▼") : ""}
                      </th>
                      <th className="fw-bold py-3 text-center hide-on-mobile">QTY</th>
                      <th className="fw-bold py-3 hide-on-mobile">STAFF</th>
                      <th className="fw-bold py-3 text-center">PAYMENT STATUS</th>
                      <th className="fw-bold py-3 text-end pe-4 no-print" width="160">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.length === 0 ? (
                      <tr><td colSpan="9" className="text-center py-5 text-muted fw-bold">No invoices found.</td></tr>
                    ) : (
                      invoices.map((inv) => (
                        <tr key={inv.id}>
                          <td className="ps-4 no-print"><input className="form-check-input" type="checkbox" checked={selectedIds.includes(inv.id)} onChange={() => handleCheckboxChange(inv.id)} /></td>
                          <td className="fw-bold text-dark">#{inv.id}</td>
                          <td className="small">{inv.invoice_date}</td>
                          <td className="fw-bold text-dark">{inv.customer_name}</td>
                          <td className="text-end fw-bold">₹{inv.grand_total}</td>
                          <td className="text-center small hide-on-mobile">{inv.total_qty}</td>
                          <td className="hide-on-mobile"><span className="badge bg-light text-dark fw-normal border">{inv.sales_person}</span></td>
                          <td style={{ minWidth: "180px" }}>
                            {(() => {
                              const total = Number(inv.grand_total || 0);
                              const paid = Number(paidAmounts[inv.id]?.total_paid || 0);
                              const percent = Number(paidAmounts[inv.id]?.payment_percentage || 0);
                              const isPaid = paid >= total && total > 0;
                              return (
                                <div className="px-2">
                                  <div className="progress rounded-pill shadow-sm" style={{ height: "10px" }}>
                                    <div className={`progress-bar progress-bar-striped progress-bar-animated ${isPaid ? "bg-success" : percent > 0 ? "bg-warning" : "bg-danger"}`}
                                      style={{ width: `${percent}%` }}></div>
                                  </div>
                                  <div className="d-flex justify-content-between align-items-center mt-1">
                                    <small className="text-muted fw-bold" style={{ fontSize: '12px' }}>₹{paid} / ₹{total}</small>
                                    {isPaid && <span className="badge bg-success" style={{ fontSize: '9px' }}>PAID</span>}
                                  </div>
                                </div>
                              );
                            })()}
                          </td>
                          <td className="text-end pe-4 no-print">
                            <div className="d-flex justify-content-end gap-2">
                              <button className="btn btn-outline-secondary btn-sm rounded-circle d-flex align-items-center justify-content-center border-0 "
                                style={{ width: '32px', height: '32px' }} title="Print"
                                onClick={() => window.open(`${API}/printinvoice/invoice/${inv.id}`, "_blank")}>
                                <i className="bi bi-printer-fill"></i>
                              </button>
                              {invoicePriv?.can_update === 1 && (
                                <button className="btn btn-outline-primary btn-sm rounded-circle d-flex align-items-center justify-content-center border-0 "
                                  style={{ width: '32px', height: '32px' }} title="Edit"
                                  onClick={() => navigate(`/Editinvoiceform/${inv.id}`)}>
                                  <i className="bi bi-pencil-square"></i>
                                </button>
                              )}
                              {invoicePriv?.can_delete === 1 && (
                                <button className="btn btn-outline-danger btn-sm rounded-circle d-flex align-items-center justify-content-center border-0 "
                                  style={{ width: '32px', height: '32px' }} title="Delete"
                                  onClick={() => handleDelete(inv.id)}>
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
            <div className="card-footer bg-white py-3 border-0 d-flex justify-content-between align-items-center mb-5 no-print">
              <span className="text-muted small">
                Page {pagination?.page || 1} of {pagination?.pages || 1} &bull; Total {pagination?.total || 0} Invoices
              </span>
              <div className="d-flex gap-2">
                <button className="btn btn-outline-primary btn-sm px-3 fw-bold rounded-pill" disabled={page <= 1} onClick={goPrev}>
                  <i className="bi bi-chevron-left me-1"></i> Previous
                </button>
                <button className="btn btn-outline-primary btn-sm px-3 fw-bold rounded-pill" disabled={pagination ? page >= pagination.pages : true} onClick={goNext}>
                  Next <i className="bi bi-chevron-right ms-1"></i>
                </button>
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
        )
      }
      {/* Convert Modal */}
      {showConvertModal && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-primary text-white border-0">
                <h5 className="modal-title fw-bold">Convert Invoice(s)</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowConvertModal(false)}></button>
              </div>
              <div className="modal-body p-4">
                <p className="text-muted small mb-4">Select the target module to convert selected invoices into. Data like customer info and items will be carried over.</p>
                <div className="mb-3">
                  <label className="form-label fw-bold small">Target Module</label>
                  <select className="form-select shadow-sm" value={targetModule} onChange={(e) => setTargetModule(e.target.value)}>
                    <option value="">Select Module...</option>
                    <option value="Invoice">Invoice</option>
                    <option value="Purchase">Purchase Bill</option>
                    <option value="DC">Delivery Challan</option>
                    <option value="PO">Purchase Order</option>
                    <option value="PI">Proforma Invoice</option>
                    <option value="Estimate">Estimate</option>
                    <option value="Sales Return">Sales Return</option>
                    <option value="Purchase Return">Purchase Return</option>
                    <option value="Credit Note">Credit Note</option>
                    <option value="Debit Note">Debit Note</option>
                    <option value="GRN">GRN</option>
                    <option value="Quotation">Quotation</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer border-0 p-3">
                <button type="button" className="btn btn-light fw-bold" onClick={() => setShowConvertModal(false)}>Cancel</button>
                <button type="button" className="btn btn-primary fw-bold px-4" onClick={confirmConvert} disabled={!targetModule}>Confirm</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div >
  );
}

export default Invoicemy;
