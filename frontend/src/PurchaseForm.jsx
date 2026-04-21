import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate, useLocation } from "react-router-dom";
const API = process.env.REACT_APP_API_URL;

// --- Initial State ---
const initialItem = {
  product_name: "",
  sku: "",
  qty: 1,
  rate: 0.0,
  disc_val: 0.0,
  disc_percent: 0.0,
  gst_percent: 0.0,
  total: 0.0,
};

const getInitialState = () => ({
  supplier_name: "",
  ship_to: "",
  mobile: "",

  billing_address: "",
  gst: "",
  purchase_person: "",
  purchase_date: new Date().toISOString().substring(0, 10),
  due_date: new Date(Date.now() + 86400000).toISOString().substring(0, 10),
  stock_action: "",
  items: [{ ...initialItem }],
  discount_total: 0.0,
  gst_total: 0.0,
  net_total: 0.0,
  grand_total: 0.0,
  round_off: 0.0,
  igst: false,
});


// --- Calculation Helpers ---
const calculateItemTotal = (item, is_inclusive = 0) => {
  const qty = parseFloat(item.qty || 0);
  const rate = parseFloat(item.rate || 0);
  const discVal = parseFloat(item.disc_val || 0);
  const discPercent = parseFloat(item.disc_percent || 0);
  const gstPercent = parseFloat(item.gst_percent || 0);

  let subTotal = qty * rate;
  let discountAmount = discVal + (subTotal * discPercent) / 100;
  let amountAfterDiscount = subTotal - discountAmount;

  let gstAmount, afterDiscount;
  if (is_inclusive) {
    afterDiscount = amountAfterDiscount / (1 + gstPercent / 100);
    gstAmount = amountAfterDiscount - afterDiscount;
  } else {
    afterDiscount = amountAfterDiscount;
    gstAmount = (afterDiscount * gstPercent) / 100;
  }

  let total = afterDiscount + gstAmount;

  return { total, discountAmount, gstAmount, afterDiscount };
};

const calculateTotals = (items, is_inclusive = 0) => {
  let net_total = 0,
    discount_total = 0,
    gst_total = 0;
  items.forEach((item) => {
    const { discountAmount, gstAmount, afterDiscount } = calculateItemTotal(item, is_inclusive);
    net_total += afterDiscount;
    discount_total += discountAmount;
    gst_total += gstAmount;
  });
  let grand_total = net_total + gst_total;

  const rounded = Math.round(grand_total);
  const round_off = parseFloat((rounded - grand_total).toFixed(2));
  grand_total = rounded;

  return { net_total, discount_total, gst_total, grand_total, round_off };
};

function PurchaseForm() {
  const [purchase, setPurchase] = useState(getInitialState());
  const [suggestions, setSuggestions] = useState([]);
  const [employee_name, setEmployeename] = useState([]);
  const [productSuggestions, setProductSuggestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);
  const [suggestionIndex, setSuggestionIndex] = useState(-1);
  const [purchaseNo, setPurchaseNo] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const [shipToSuggestions, setShipToSuggestions] = useState([]);
  const [supplierSuggestionIndex, setSupplierSuggestionIndex] = useState(-1);
  const [shipToSuggestionIndex, setShipToSuggestionIndex] = useState(-1);

  useEffect(() => {
    axios.get(`${API}/templates`)
      .then((res) => {
        const templates = res.data;

        // ⭐ Find purchase template, not latest
        const purchaseTpl = templates.find(
          (t) => t.template_name.toLowerCase() === "purchase"
        );

        if (!purchaseTpl || !purchaseTpl.stock_action) {
          alert("No valid 'purchase' template found.");
          setPurchase((prev) => ({
            ...prev,
            template_id: null,
            stock_action: null,
          }));
          return;
        }

        // ✅ Valid purchase template
        setPurchase((prev) => ({
          ...prev,
          stock_action: purchaseTpl.stock_action,
          template_id: purchaseTpl.id,
          is_sku: purchaseTpl.is_sku,
          is_inclusive: purchaseTpl.is_inclusive,
        }));
      })
      .catch((err) => {
        console.error("Error fetching template:", err);
        alert("Error fetching template from server");
      });
  }, []);




  useEffect(() => {
    if (location.state && location.state.convertData) {
      const data = location.state.convertData;
      setPurchase(prev => {
        const newState = {
          ...prev,
          supplier_name: data.customer_name || prev.supplier_name, // Map customer to supplier if converting from customer-side modules
          ship_to: data.ship_to || prev.ship_to,
          mobile: data.mobile || prev.mobile,
          billing_address: data.billing_address || prev.billing_address,
          purchase_person: data.sales_person || prev.purchase_person,
          items: data.items && data.items.length > 0 ? data.items.map(i => ({
            ...i,
            qty: Number(i.qty || 0),
            rate: Number(i.rate || 0),
            disc_val: Number(i.disc_val || 0),
            disc_percent: Number(i.disc_percent || 0),
            gst_percent: Number(i.gst_percent || 0),
            total: Number(i.total || 0)
          })) : prev.items
        };

        const totals = calculateTotals(newState.items, newState.is_inclusive);
        return { ...newState, ...totals };
      });
    }
  }, [location.state]);

  // --- Fetch employees, template and next number ---
  useEffect(() => {
    axios
      .get(`${API}/employees`)
      .then((res) => setEmployeename(res.data))
      .catch((err) => console.error("Error fetching employees:", err));

    fetchPurchaseNo();
  }, []);

  const fetchPurchaseNo = async () => {
    try {
      const res = await axios.get(`${API}/purchases/next-purchase-no`);
      setPurchaseNo(res.data.purchaseNo);
    } catch (err) {
      console.error("Failed to load purchase number", err);
    }
  };

  useEffect(() => {
    document.title = `Purchase Form No: ${purchaseNo || ""} - TSL ERP`;
  }, [purchaseNo]);

  const selectedYear = JSON.parse(localStorage.getItem("selectedYear") || "{}");

  // --- Auto calculate totals ---
  useEffect(() => {
    const totals = calculateTotals(purchase.items, purchase.is_inclusive);
    setPurchase((prev) => ({ ...prev, ...totals }));
  }, [purchase.items, purchase.is_inclusive]);

  // --- Header change ---
  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    setPurchase((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // --- Supplier autocomplete ---
  const handleSupplierInput = async (e) => {
    const value = e.target.value;
    setPurchase((prev) => ({ ...prev, supplier_name: value }));

    if (value.trim().length >= 1) {
      try {
        const res = await axios.get(`${API}/supplier?term=${encodeURIComponent(value)}`);
        const data = res.data.map(s => ({ ...s, SupplierName: s.supplier_name || s.name || "Unknown" }));
        setSuggestions(data.slice(0, 10));
        setSupplierSuggestionIndex(-1);
      } catch (err) {
        console.error("Error fetching suggestions:", err);
      }
    } else {
      setSuggestions([]);
    }
  };

  const selectSupplier = (supplier) => {
    setPurchase((prev) => ({
      ...prev,
      supplier_name: supplier.SupplierName || supplier.name || "",
      ship_to: supplier.SupplierName || supplier.name || "",
      mobile: supplier.mobile || "",
      billing_address: supplier.billing_address || "",
      gst: supplier.gst || "",
    }));
    setSuggestions([]);
    setSupplierSuggestionIndex(-1);
  };

  const handleSupplierKeyDown = (e) => {
    if (suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSupplierSuggestionIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSupplierSuggestionIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (supplierSuggestionIndex >= 0 && suggestions[supplierSuggestionIndex]) {
        selectSupplier(suggestions[supplierSuggestionIndex]);
      }
    }
  };

  // Ship To autocomplete - SUPPLIER version
  const handleShipToInput = async (e) => {
    const value = e.target.value;
    handleHeaderChange(e);
    if (value.trim().length < 1) return setShipToSuggestions([]);
    try {
      const res = await axios.get(`${API}/supplier?term=${encodeURIComponent(value)}`);
      setShipToSuggestions(res.data.slice(0, 10));
      setShipToSuggestionIndex(-1);
    } catch (err) {
      console.error("Error fetching ship to suggestions:", err);
    }
  };

  const selectShipTo = (supplier) => {
    setPurchase(prev => ({
      ...prev,
      ship_to: supplier.SupplierName || supplier.name || ""
    }));
    setShipToSuggestions([]);
    setShipToSuggestionIndex(-1);
  };

  const handleShipToKeyDown = (e) => {
    if (shipToSuggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setShipToSuggestionIndex((prev) => (prev < shipToSuggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setShipToSuggestionIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (shipToSuggestionIndex >= 0 && shipToSuggestions[shipToSuggestionIndex]) {
        selectShipTo(shipToSuggestions[shipToSuggestionIndex]);
      }
    }
  };

  // --- Product autocomplete ---
  const handleProductInput = async (index, e) => {
    const value = e.target.value;
    const newItems = [...purchase.items];
    newItems[index].sku = value;
    setPurchase((prev) => ({ ...prev, items: newItems }));
    setActiveIndex(index);
    setSuggestionIndex(-1);

    try {
      if (value.length >= 1) {
        const res = await axios.get(`${API}/products?term=${value}`);
        let data = res.data || [];
        // Dedupe by SKU
        data = Array.from(new Map(data.map(p => [p.sku, p])).values());
        setProductSuggestions(data.slice(0, 10));
      } else {
        setProductSuggestions([]);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  const selectProduct = (index, product) => {
    const isDuplicate = purchase.items.some(
      (item, i) => i !== index && item.product_name === product.product_name
    );
    if (isDuplicate) {
      alert("This product is already added!");
      setProductSuggestions([]);
      return;
    }

    const newItems = [...purchase.items];

    newItems[index].sku = product.sku || "";
    newItems[index].rate = product.mrp || "";
    newItems[index].gst_percent = product.gst || "";
    newItems[index].disc_percent = product.discount || "";
    const { total } = calculateItemTotal(newItems[index]);
    newItems[index].total = parseFloat(total.toFixed(2));
    setPurchase((prev) => ({ ...prev, items: newItems }));
    setProductSuggestions([]);
    setActiveIndex(null);
    setSuggestionIndex(-1);
  };

  const handleKeyDown = (e, index) => {
    if (productSuggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSuggestionIndex(prev => (prev < productSuggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSuggestionIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (suggestionIndex >= 0 && productSuggestions[suggestionIndex]) {
        selectProduct(index, productSuggestions[suggestionIndex]);
      }
    }
  };

  // --- Item change handler ---
  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const newItems = [...purchase.items];
    newItems[index][name] = value;
    const { total } = calculateItemTotal(newItems[index]);
    newItems[index].total = parseFloat(total.toFixed(2));
    setPurchase((prev) => ({ ...prev, items: newItems }));
  };

  // --- Add / Remove rows ---
  const addItem = () =>
    setPurchase((prev) => ({
      ...prev,
      items: [...prev.items, { ...initialItem }],
    }));

  const removeItem = (index) => {
    if (purchase.items.length > 1) {
      const newItems = purchase.items.filter((_, i) => i !== index);
      setPurchase((prev) => ({ ...prev, items: newItems }));
    }
  };

  // --- IGST toggle ---
  const toggleIGST = () =>
    setPurchase((prev) => ({ ...prev, igst: !prev.igst }));

  // --- Save Purchase ---
  const savePurchase = async () => {
    // 🛑 Stop if invalid template
    if (!purchase.template_id) {
      alert("Cannot save purchase: Valid 'purchase' template not selected.");
      return;
    }

    // 🛑 Stop if no items
    if (!purchase.items || purchase.items.length === 0) {
      alert("Cannot save purchase: No items added.");
      return;
    }

    if (selectedYear.is_closed) {
      alert("Error: This Accounting Year is locked and cannot be modified.");
      return;
    }

    const pDate = new Date(purchase.purchase_date);
    const startDate = new Date(selectedYear.start_date);
    const endDate = new Date(selectedYear.end_date);
    if (pDate < startDate || pDate > endDate) {
      if (!window.confirm(`Warning: Purchase date is outside the selected Accounting Year (AY ${selectedYear.year_name}). Do you want to proceed?`)) {
        return;
      }
    }

    try {
      const res = await axios.post(`${API}/purchases`, {
        supplier_name: purchase.supplier_name,
        ship_to: purchase.ship_to,
        mobile: purchase.mobile,
        purchase_date: toDMY(purchase.purchase_date),
        due_date: toDMY(purchase.due_date),
        purchase_person: purchase.purchase_person,
        billing_address: purchase.billing_address,
        total_qty: purchase.total_qty,
        discount_total: purchase.discount_total,
        grand_total: purchase.grand_total,
        items: purchase.items,
        template_id: purchase.template_id, // IMPORTANT
        is_sku: purchase.is_sku,
        is_inclusive: purchase.is_inclusive,
        year_id: selectedYear.year_id
      });

      alert(res.data.message || "Purchase saved successfully!");

      // Reset but keep template ID + stock_action
      setPurchase((prev) => ({
        ...getInitialState(),
        stock_action: prev.stock_action,
        template_id: prev.template_id,
        is_sku: prev.is_sku,
        is_inclusive: prev.is_inclusive,
      }));

      setTimeout(() => navigate("/purchasemy"), 1000);
    } catch (err) {
      const msg = err.response?.data?.error || err.message || "Error saving purchase";
      console.error("❌ Error saving purchase:", msg);
      alert(msg);
    }
  };



  // --- Clear form ---
  const clearForm = () => {
    if (window.confirm("Clear form?")) setPurchase(getInitialState());
  };

  function toDMY(dateString) {
    if (!dateString || !dateString.includes("-")) return "";
    const [y, m, d] = dateString.split("-");
    return `${d}-${m}-${y}`;
  }
  return (
    <div className="container my-4">
      <div className="card shadow p-4 w-90">
        <div className="mb-3 d-flex justify-content-between align-items-center border-bottom pb-3">
          <div className="d-flex align-items-center gap-4">
            <div>
              <label className="fw-bold mb-0 me-1 text-muted small">Purchase No:</label>
              <div className="text-primary fw-bold fs-5">{purchaseNo || "Loading..."}</div>
            </div>
            <div className="vr" style={{ height: '40px' }}></div>
            <div>
              <label className="fw-bold mb-0 me-1 text-muted small">Accounting Year:</label>
              <div className="text-dark fw-bold">AY {selectedYear.year_name}</div>
            </div>
          </div>

          <div className="text-center flex-grow-1">
            <h3 className="fw-bold mb-0">Purchase Form</h3>
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

        {/* Header Section */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="d-flex gap-2">
            <span className={`badge ${purchase.is_inclusive ? "bg-info" : "bg-secondary"}`}>
              {purchase.is_inclusive ? "Tax Inclusive" : "Tax Exclusive"}
            </span>
            <span className={`badge ${purchase.is_sku ? "bg-primary" : "bg-warning text-dark"}`}>
              {purchase.is_sku ? "With SKU" : "Without SKU"}
            </span>
          </div>

        </div>

        <div className="card shadow p-3 mb-3">
          <div className="row mb-3">
            <div className="col-md-6 mb-2 position-relative">
              <label className="form-label">Supplier Name</label>
              <input
                type="text"
                name="supplier_name"
                value={purchase.supplier_name}
                onChange={handleSupplierInput}
                className="form-control"
                autoComplete="off"
                onKeyDown={handleSupplierKeyDown}
                onBlur={() => setTimeout(() => setSuggestions([]), 200)}
              />
              {suggestions.length > 0 && (
                <ul
                  className="list-group position-absolute w-100 shadow"
                  style={{ zIndex: 1000, top: "100%" }}
                >
                  {suggestions.map((sup, index) => {
                    const display = sup.SupplierName || sup.name || sup.id || "Unknown";
                    return (
                      <li
                        key={sup.id ?? index}
                        className={`list-group-item list-group-item-action ${supplierSuggestionIndex === index ? "active" : ""}`}
                        onClick={() => selectSupplier(sup)}
                        style={{ cursor: "pointer" }}
                      >
                        {display} <small className="text-muted">({sup.type})</small>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="col-md-6 mb-2 position-relative">
              <label className="form-label">Ship to</label>
              <input
                type="text"
                name="ship_to"
                value={purchase.ship_to}
                onChange={handleShipToInput}
                className="form-control"
                autoComplete="off"
                placeholder="Type supplier name..."
                onKeyDown={handleShipToKeyDown}
                onBlur={() => setTimeout(() => setShipToSuggestions([]), 200)}
              />

              {shipToSuggestions.length > 0 && (
                <ul
                  className="list-group position-absolute w-100 shadow"
                  style={{ zIndex: 1000, top: "100%", maxHeight: "200px", overflowY: "auto" }}
                >
                  {shipToSuggestions.map((supp, index) => (
                    <li
                      key={supp.id ?? index}
                      className={`list-group-item list-group-item-action ${shipToSuggestionIndex === index ? "active" : ""}`}
                      style={{ cursor: "pointer" }}
                      onClick={() => selectShipTo(supp)}
                    >
                      {supp.SupplierName || supp.name || "Unknown"}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="col-md-6 mb-2">
              <label className="form-label">Purchase Person</label>
              <select
                name="purchase_person"
                value={purchase.purchase_person}
                onChange={handleHeaderChange}
                className="form-select"
              >
                <option value="">Select Purchase Person</option>
                {employee_name.map((emp) => (
                  <option key={emp.id} value={emp.employee_name}>
                    {emp.employee_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-6 mb-2">
              <label className="form-label">Purchase Date</label>
              <input
                type="date"
                name="purchase_date"
                value={purchase.purchase_date}
                onChange={handleHeaderChange}
                className="form-control"
              />
            </div>

            {/* Due Date */}
            <div className="col-md-6 mb-2">
              <label className="form-label">Due Date</label>
              <input
                type="date"
                name="due_date"
                value={purchase.due_date}
                onChange={handleHeaderChange}
                className="form-control"
              />
            </div>

            <div className="col-md-6 mb-2">
              <label className="form-label">Mobile</label>
              <input
                type="text"
                name="mobile"
                value={purchase.mobile}
                onChange={handleHeaderChange}
                className="form-control"
              />
            </div>
            <div className="col-md-12 mb-2">
              <label className="form-label">Address</label>
              <textarea
                name="billing_address"
                value={purchase.billing_address}
                onChange={handleHeaderChange}
                className="form-control"
              />
            </div>
          </div>
        </div>

        {/* IGST Toggle */}
        <div className="d-flex justify-content-end mb-3">
          <div className="form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id="igstToggle"
              checked={purchase.igst}
              onChange={toggleIGST}
            />
            <label className="form-check-label fw-bold" htmlFor="igstToggle">
              Apply IGST
            </label>
          </div>
        </div>

        {/* Product Table */}
        <div className="table-responsive mb-3">
          <table className="table table-bordered">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Product</th>
                <th>Qty</th>
                <th>Rate</th>
                <th>Disc Val</th>
                <th>Disc %</th>
                <th>GST %</th>
                <th>Total</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {purchase.items.map((item, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td
                    className="position-relative"
                    style={{ overflow: "visible", position: "relative" }}
                  >
                    <div style={{ position: "relative", width: "100%" }}>
                      <input
                        name="sku"
                        value={item.sku}
                        onChange={(e) => handleProductInput(index, e)}
                        onFocus={() => setActiveIndex(index)}
                        onBlur={() => setTimeout(() => setProductSuggestions([]), 200)}
                        className="form-control form-control-sm"
                        autoComplete="off"
                        onKeyDown={(e) => handleKeyDown(e, index)}
                      />

                      {/* ✅ PURCHASE Autocomplete — same style as Customer autocomplete */}
                      {activeIndex === index && productSuggestions.length > 0 && (
                        <ul
                          className="list-group position-absolute w-100 shadow"
                          style={{
                            zIndex: 999999,
                            top: "100%",
                            left: 0,
                            maxHeight: "200px",
                            overflowY: "auto",
                            background: "white",
                            border: "1px solid #ddd",
                          }}
                        >
                          {/* Header */}
                          <li
                            className="list-group-item bg-light d-flex justify-content-between fw-bold py-1 px-2"
                            style={{ fontSize: "0.8rem" }}
                          >
                            <span style={{ width: "60%" }}>SKU</span>
                            <span style={{ width: "40%", textAlign: "right" }}>Stock</span>
                          </li>

                          {/* Suggestions */}
                          {productSuggestions
                            .map((p, i) => (
                              <li
                                key={i}
                                className={`list-group-item list-group-item-action d-flex justify-content-between py-1 px-2 ${suggestionIndex === i ? "active" : ""}`}
                                onMouseDown={() => selectProduct(index, p)}
                                style={{ cursor: "pointer", fontSize: "0.85rem" }}
                              >
                                <span style={{ width: "60%" }}>{p.sku} {p.barcode ? `(${p.barcode})` : ""}</span>
                                <span style={{ width: "40%", textAlign: "right" }}>
                                  {p.current_stock ?? 0}
                                </span>
                              </li>
                            ))}
                        </ul>
                      )}
                    </div>
                  </td>

                  <td>
                    <input
                      name="qty"
                      type="text"
                      value={item.qty}
                      onChange={(e) => handleItemChange(index, e)}
                      className="form-control form-control-sm"
                    />
                  </td>
                  <td>
                    <input
                      name="rate"
                      type="text"
                      value={item.rate}
                      onChange={(e) => handleItemChange(index, e)}
                      className="form-control form-control-sm"
                    />
                  </td>
                  <td>
                    <input
                      name="disc_val"
                      type="text"
                      value={item.disc_val}
                      onChange={(e) => handleItemChange(index, e)}
                      className="form-control form-control-sm"
                    />
                  </td>
                  <td>
                    <input
                      name="disc_percent"
                      type="text"
                      value={item.disc_percent}
                      onChange={(e) => handleItemChange(index, e)}
                      className="form-control form-control-sm"
                    />
                  </td>
                  <td>
                    <input
                      name="gst_percent"
                      type="text"
                      value={item.gst_percent}
                      onChange={(e) => handleItemChange(index, e)}
                      className="form-control form-control-sm"
                    />
                  </td>
                  <td>
                    <input
                      value={Number(item.total || 0).toFixed(2)}
                      readOnly
                      className="form-control form-control-sm text-end"
                    />
                  </td>
                  <td className="text-center">
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => removeItem(index)}
                      disabled={purchase.items.length === 1}
                    >
                      &times;
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

            <tfoot>
              <tr>
                <td colSpan="2" className="fw-bold text-end">Total Qty:</td>
                <td className="fw-bold">
                  {
                    (() => {
                      const qtyTotal = purchase.items.reduce(
                        (sum, item) => sum + Number(item.qty || 0),
                        0
                      );

                      purchase.total_qty = qtyTotal; // ✅ store inside invoice object

                      return qtyTotal; // display
                    })()
                  }
                </td>
                <td colSpan="6"></td>
              </tr>

            </tfoot>
          </table>
          <div className="d-flex justify-content-end">
            <button onClick={addItem} className="btn btn-primary btn-sm">
              + Add Row
            </button>
          </div>
        </div>

        {/* Totals Section */}
        <div className="border p-3 bg-light">
          <div className="d-flex justify-content-between mb-2">
            <label>Sub Total:</label>
            <input
              value={purchase.net_total.toFixed(2)}
              readOnly
              className="form-control form-control-sm text-end w-25"
            />
          </div>

          <div className="d-flex justify-content-between mb-2">
            <label>Discount Total:</label>
            <input
              value={purchase.discount_total.toFixed(2)}
              readOnly
              className="form-control form-control-sm text-end w-25"
            />
          </div>

          {purchase.igst ? (
            <div className="d-flex justify-content-between mb-2">
              <label>IGST:</label>
              <input
                value={purchase.gst_total.toFixed(2)}
                readOnly
                className="form-control form-control-sm text-end w-25"
              />
            </div>
          ) : (
            <>
              <div className="d-flex justify-content-between mb-2">
                <label>CGST:</label>
                <input
                  value={(purchase.gst_total / 2).toFixed(2)}
                  readOnly
                  className="form-control form-control-sm text-end w-25"
                />
              </div>
              <div className="d-flex justify-content-between mb-2">
                <label>SGST:</label>
                <input
                  value={(purchase.gst_total / 2).toFixed(2)}
                  readOnly
                  className="form-control form-control-sm text-end w-25"
                />
              </div>
            </>
          )}


          {/* ✅ Added Round Off */}
          <div className="d-flex justify-content-between mb-2">
            <label>Round Off:</label>
            <input
              value={purchase.round_off.toFixed(2)}
              readOnly
              className="form-control form-control-sm text-end w-25"
            />
          </div>

          <div className="d-flex justify-content-between">
            <label className="fw-bold text-primary">Grand Total:</label>
            <input
              value={purchase.grand_total.toFixed(2)}
              readOnly
              className="form-control form-control-sm text-end w-25 fw-bold text-primary"
            />
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
              className="btn btn-success fw-bold px-4 shadow-sm"
              onClick={savePurchase}
            >
              Save Purchase
            </button>
          )}
          <button
            className="btn btn-secondary fw-bold px-4"
            onClick={clearForm}
          >
            Clear Form
          </button>
        </div>
      </div>
    </div>
  );
}

export default PurchaseForm;
