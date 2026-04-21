// EditPurchaseForm.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate, useParams } from "react-router-dom";
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
  purchase_date: "",
  due_date: "",
  stock_action: "",
  items: [{ ...initialItem }],
  discount_total: 0.0,
  gst_total: 0.0,
  net_total: 0.0,
  grand_total: 0.0,
  round_off: 0.0,
  igst: false,
});

// Convert backend datetime → YYYY-MM-DD
function toInputDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toISOString().split("T")[0];
}

// Convert YYYY-MM-DD → DD-MM-YYYY
function toDMY(dateString) {
  if (!dateString) return "";
  const [y, m, d] = dateString.split("-");
  return `${d}-${m}-${y}`;
}

// TOOLS
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

function EditPurchaseForm() {
  const [purchase, setPurchase] = useState(getInitialState());
  const [suggestions, setSuggestions] = useState([]);
  const [employee_name, setEmployeename] = useState([]);
  const [productSuggestions, setProductSuggestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);
  const [suggestionIndex, setSuggestionIndex] = useState(-1);
  const [supplierSuggestionIndex, setSupplierSuggestionIndex] = useState(-1);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = `Edit Purchase No: ${id || ""} - TSL ERP`;
  }, [id]);

  // ---------------- FETCH TEMPLATE ----------------
  useEffect(() => {
    axios
      .get(`${API}/templates`)
      .then((res) => {
        const templates = res.data;
        const purchaseTpl = templates.find((t) => t.template_name.toLowerCase() === "purchase");

        if (purchaseTpl) {
          setPurchase((prev) => ({
            ...prev,
            stock_action: purchaseTpl.stock_action,
            template_id: purchaseTpl.id,
            is_sku: purchaseTpl.is_sku,
            is_inclusive: purchaseTpl.is_inclusive,
          }));
        }
      })
      .catch(() => { });
  }, []);

  // ---------------- FETCH EMPLOYEES ----------------
  useEffect(() => {
    axios
      .get(`${API}/employees`)
      .then((res) => setEmployeename(res.data))
      .catch(() => { });
  }, []);

  // ---------------- FETCH PURCHASE BY ID ----------------
  useEffect(() => {
    if (!id) return;

    axios
      .get(`${API}/purchases/${id}`)
      .then((res) => {
        const data = res.data;

        setPurchase((prev) => ({
          ...prev,
          supplier_name: data.supplier_name || "",
          ship_to: data.ship_to || "",
          mobile: data.mobile || "",
          purchase_person: data.purchase_person || "",
          billing_address: data.billing_address || "",
          gst: data.gst || "",
          total_qty: data.total_qty || "",
          igst: data.igst ?? false,
          is_inclusive: data.is_inclusive || 0,
          is_sku: data.is_sku || 0,

          purchase_date: toInputDate(data.purchase_date),
          due_date: toInputDate(data.due_date),

          items: data.items?.length
            ? data.items.map((item) => ({
              ...initialItem,
              ...item,
              qty: Number(item.qty),
              rate: Number(item.rate),
              disc_val: Number(item.disc_val),
              disc_percent: Number(item.disc_percent),
              gst_percent: Number(item.gst_percent),
              total: Number(item.total),
            }))
            : [{ ...initialItem }],
        }));
      })
      .catch((err) => console.error("Error loading purchase:", err));
  }, [id]);

  // ---------------- AUTO TOTAL CALC ----------------
  useEffect(() => {
    const totals = calculateTotals(purchase.items, purchase.is_inclusive);
    setPurchase((prev) => ({ ...prev, ...totals }));
  }, [purchase.items, purchase.is_inclusive]);

  // ---------------- INPUT HANDLERS ----------------
  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    setPurchase((prev) => ({ ...prev, [name]: value }));
  };

  const handleSupplierInput = async (e) => {
    const value = e.target.value;
    handleHeaderChange(e);

    if (value.length >= 1) {
      try {
        const res = await axios.get(`${API}/supplier?term=${value}`);
        setSuggestions(res.data);
        setSupplierSuggestionIndex(-1);
      } catch { }
    } else {
      setSuggestions([]);
      setSupplierSuggestionIndex(-1);
    }
  };

  const selectSupplier = (supplier) => {
    setPurchase((prev) => ({
      ...prev,
      supplier_name: supplier.supplier_name,
      mobile: supplier.mobile,
      billing_address: supplier.billing_address,
      gst: supplier.gst,
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

  const handleProductInput = async (index, e) => {
    const value = e.target.value;
    const newItems = [...purchase.items];
    newItems[index].sku = value;
    setPurchase((prev) => ({ ...prev, items: newItems }));
    setActiveIndex(index);
    setSuggestionIndex(-1);

    if (value.length >= 1) {
      try {
        const res = await axios.get(`${API}/products?term=${value}`);
        setProductSuggestions(res.data || []);
      } catch { }
    } else setProductSuggestions([]);
  };

  const selectProduct = (index, product) => {
    const newItems = [...purchase.items];
    newItems[index].sku = product.sku;
    newItems[index].rate = product.mrp;
    newItems[index].gst_percent = product.gst;
    newItems[index].disc_percent = product.discount;

    const { total } = calculateItemTotal(newItems[index], purchase.is_inclusive);
    newItems[index].total = total;

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



  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const newItems = [...purchase.items];
    newItems[index][name] = value;

    const { total } = calculateItemTotal(newItems[index], purchase.is_inclusive);
    newItems[index].total = total;

    setPurchase((prev) => ({ ...prev, items: newItems }));
  };

  const addItem = () =>
    setPurchase((prev) => ({ ...prev, items: [...prev.items, { ...initialItem }] }));

  const removeItem = (index) => {
    if (purchase.items.length > 1) {
      const newItems = purchase.items.filter((_, i) => i !== index);
      setPurchase((prev) => ({ ...prev, items: newItems }));
    }
  };

  const toggleIGST = () => setPurchase((prev) => ({ ...prev, igst: !prev.igst }));

  // ---------------- SAVE UPDATED PURCHASE ----------------
  const updatePurchase = async () => {
    try {
      await axios.put(`${API}/purchases/${id}`, {
        supplier_name: purchase.supplier_name,
        ship_to: purchase.ship_to,
        mobile: purchase.mobile,
        purchase_person: purchase.purchase_person,
        billing_address: purchase.billing_address,

        purchase_date: toDMY(purchase.purchase_date),
        due_date: toDMY(purchase.due_date),

        discount_total: purchase.discount_total,
        gst_total: purchase.gst_total,
        net_total: purchase.net_total,
        grand_total: purchase.grand_total,
        round_off: purchase.round_off,

        igst: purchase.igst,
        items: purchase.items,
        template_id: purchase.template_id,
        is_sku: purchase.is_sku,
        is_inclusive: purchase.is_inclusive,
      });

      alert("Purchase updated successfully!");
      navigate("/purchasemy");
    } catch (err) {
      alert(err.response?.data?.error || "Error updating purchase");
    }
  };

  return (
    <div className="container my-4">
      <div className="card shadow p-4 w-90">
        <div className="mb-3 position-relative" style={{ height: "2.5rem" }}>
          {/* Purchase No on the left */}
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
            <label className="fw-bold mb-0 me-1 text-muted small">Purchase No:</label>
            <span className="text-primary">{id || "Loading..."}</span>
          </div>

          <h3 className="mb-0 text-center" style={{ lineHeight: "2.5rem" }}>Edit Purchase Form</h3>
        </div>

        {/* ---------------- SAME UI EXACTLY LIKE PurchaseForm ---------------- */}
        {/* (UI CODE EXACTLY SAME - NOT REMOVED / NOT ALTERED) */}

        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-center mb-3 text-muted fw-bold">
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
            {/* Supplier */}
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
                <ul className="list-group position-absolute w-100 shadow" style={{ zIndex: 1000 }}>
                  {suggestions.map((sup, index) => (
                    <li
                      key={sup.id}
                      className={`list-group-item list-group-item-action ${supplierSuggestionIndex === index ? "active" : ""}`}
                      onClick={() => selectSupplier(sup)}
                      style={{ cursor: "pointer" }}
                    >
                      {sup.supplier_name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="col-md-6 mb-2">
              <label className="form-label">Ship To</label>
              <input
                type="text"
                name="ship_to"
                value={purchase.ship_to}
                onChange={handleHeaderChange}
                className="form-control"
              />
            </div>

            {/* Purchase Person */}
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

            {/* Dates */}
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

            {/* Mobile */}
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

            {/* Address */}
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

        {/* ---------------- IGST TOGGLE ---------------- */}
        <div className="d-flex justify-content-end mb-3">
          <div className="form-check">
            <input
              type="checkbox"
              className="form-check-input"
              checked={purchase.igst}
              onChange={toggleIGST}
            />
            <label className="form-check-label fw-bold">Apply IGST</label>
          </div>
        </div>

        {/* ---------------- PRODUCT TABLE ---------------- */}
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

                  {/* PRODUCT AUTOCOMPLETE */}
                  <td className="position-relative">
                    <input
                      name="sku"
                      value={item.sku}
                      onChange={(e) => handleProductInput(index, e)}
                      onFocus={() => setActiveIndex(index)}
                      className="form-control form-control-sm"
                      autoComplete="off"
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      onBlur={() => setTimeout(() => setProductSuggestions([]), 200)}
                    />

                    {activeIndex === index && productSuggestions.length > 0 && (
                      <ul
                        className="list-group position-absolute w-100 shadow"
                        style={{ zIndex: 9999, top: "100%" }}
                      >
                        {productSuggestions.map((p, i) => (
                          <li
                            key={i}
                            className={`list-group-item list-group-item-action ${suggestionIndex === i ? "active" : ""}`}
                            onMouseDown={() => selectProduct(index, p)}
                            style={{ cursor: "pointer" }}
                          >
                            {p.sku} — {p.current_stock ?? 0}
                          </li>
                        ))}
                      </ul>
                    )}
                  </td>

                  {/* OTHER FIELDS */}
                  <td>
                    <input
                      name="qty"
                      type="number"
                      value={item.qty}
                      onChange={(e) => handleItemChange(index, e)}
                      className="form-control form-control-sm"
                    />
                  </td>

                  <td>
                    <input
                      name="rate"
                      type="number"
                      value={item.rate}
                      onChange={(e) => handleItemChange(index, e)}
                      className="form-control form-control-sm"
                    />
                  </td>

                  <td>
                    <input
                      name="disc_val"
                      type="number"
                      value={item.disc_val}
                      onChange={(e) => handleItemChange(index, e)}
                      className="form-control form-control-sm"
                    />
                  </td>

                  <td>
                    <input
                      name="disc_percent"
                      type="number"
                      value={item.disc_percent}
                      onChange={(e) => handleItemChange(index, e)}
                      className="form-control form-control-sm"
                    />
                  </td>

                  <td>
                    <input
                      name="gst_percent"
                      type="number"
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
                      ×
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
            <button className="btn btn-primary btn-sm" onClick={addItem}>
              + Add Row
            </button>
          </div>
        </div>

        {/* ---------------- TOTALS ---------------- */}
        <div className="border p-3 bg-light">
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

          <div className="d-flex justify-content-between mb-2">
            <label>Net Total:</label>
            <input
              value={purchase.net_total.toFixed(2)}
              readOnly
              className="form-control form-control-sm text-end w-25"
            />
          </div>

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

        {/* ---------------- BUTTONS ---------------- */}
        <div className="text-center mt-4">
          <button className="btn btn-success me-2" onClick={updatePurchase}>
            Update
          </button>
          <button className="btn btn-secondary" onClick={() => navigate("/suppliermy")}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditPurchaseForm;
