// EditInvoiceForm.jsx
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
  customer_name: "",
  mobile: "",
  billing_address: "",
  gst: "",
  sales_person: "",
  ship_to: "",
  debit_note_date: "",
  due_date: "",
  items: [{ ...initialItem }],
  discount_total: 0.0,
  gst_total: 0.0,
  net_total: 0.0,
  grand_total: 0.0,
  round_off: 0.0,
  igst: false,
  stock_action: null,
  template_id: null,
});

// --- Calculation Helpers ---
const calculateItemTotal = (item) => {
  const qty = parseFloat(item.qty || 0);
  const rate = parseFloat(item.rate || 0);
  const discVal = parseFloat(item.disc_val || 0);
  const discPercent = parseFloat(item.disc_percent || 0);
  const gstPercent = parseFloat(item.gst_percent || 0);

  const subTotal = qty * rate;
  const discountAmount = discVal + (subTotal * discPercent) / 100;
  const afterDiscount = subTotal - discountAmount;
  const gstAmount = (afterDiscount * gstPercent) / 100;
  const total = afterDiscount + gstAmount;

  return { total, discountAmount, gstAmount, afterDiscount };
};

const calculateTotals = (items) => {
  let net_total = 0,
    discount_total = 0,
    gst_total = 0;
  items.forEach((item) => {
    const { discountAmount, gstAmount, afterDiscount } = calculateItemTotal(item);
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

function EditDebitnoteForm() {
  const { id } = useParams();
  const [debitnote, setDebitnote] = useState(getInitialState());
  const [suggestions, setSuggestions] = useState([]);
  const [employee_name, setEmployeename] = useState([]);
  const [productSuggestions, setProductSuggestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  // const [outstanding, setOutstanding] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    document.title = `Edit Debit Note No: ${id || ""} - TSL ERP`;
  }, [id]);


  //   const outstandingCustomer = async (cust) => {
  //   try {
  //     const name = cust.customer_name ?? cust.name;

  //     const res = await fetch(
  //       `${process.env.REACT_APP_API_URL}/api/outstanding/${encodeURIComponent(name)}`
  //     );

  //     if (!res.ok) {
  //       throw new Error("Failed to fetch outstanding balance");
  //     }

  //     const data = await res.json();
  //     setOutstanding(Number(data.outstanding_balance) || 0);

  //   } catch (err) {
  //     console.error(err);
  //     setOutstanding(0);
  //   }
  // };
  // Load template
  useEffect(() => {
    axios.get(`${API}/templates`)
      .then((res) => {
        const templates = res.data;
        const debitnoteTpl = templates.find((t) => t.template_name?.toLowerCase() === "debitnote");
        if (!debitnoteTpl || !debitnoteTpl.stock_action) {
          setDebitnote((prev) => ({ ...prev, template_id: null, stock_action: null }));
          setError("No valid 'debit note' template found.");
          return;
        }
        setDebitnote((prev) => ({ ...prev, stock_action: debitnoteTpl.stock_action, template_id: debitnoteTpl.id }));
      })
      .catch(() => setError("Error fetching templates from server."));
  }, []);

  // Load employees
  useEffect(() => {
    axios.get(`${API}/employees`)
      .then((res) => setEmployeename(res.data))
      .catch((err) => console.error("Error fetching employees:", err));
  }, []);

  // FIXED — Load invoice for edit (header + items now load)
  useEffect(() => {
    if (!id) return;

    axios.get(`${API}/debitnote/${id}`)
      .then((res) => {


        const raw = res.data;
        const data = raw.debitnote ? raw.debitnote : raw;       // supports both formats

        const items = Array.isArray(data.items) && data.items.length > 0
          ? data.items
          : [{ ...initialItem }];

        setDebitnote((prev) => ({
          ...prev,
          customer_name: data.customer_name || "",
          ship_to: data.ship_to || "",
          debit_note_date: (data.debit_note_date),
          due_date: (data.due_date),
          sales_person: data.sales_person || "",
          mobile: data.mobile || "",
          billing_address: data.billing_address || "",
          total_qty: data.total_qty || 0,
          discount_total: Number(data.discount_total) || 0,
          grand_total: Number(data.grand_total) || 0,


          items: items.map((item) => ({
            ...initialItem,
            ...item,
            qty: Number(item.qty) || "",
            rate: Number(item.rate) || 0,
            disc_val: Number(item.disc_val) || 0,
            disc_percent: Number(item.disc_percent) || 0,
            gst_percent: Number(item.gst_percent) || 0,
            total: Number(item.total) || 0,
          })),
        }));
      })
      .catch((err) => {
        console.error("Error loading debit note:", err);
        setError("Failed to load debit note data.");
      });
  }, [id]);



  // Auto-calculate totals when items change
  useEffect(() => {
    const totals = calculateTotals(debitnote.items);
    setDebitnote((prev) => ({ ...prev, ...totals }));
  }, [debitnote.items]);

  // Header change handler
  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    setDebitnote((prev) => ({ ...prev, [name]: value }));
  };

  // Customer autocomplete
  const handleCustomerInput = async (e) => {
    const value = e.target.value;
    handleHeaderChange(e);
    if (value.trim().length < 1) return setSuggestions([]);
    try {
      const res = await axios.get(`${API}/customers?term=${encodeURIComponent(value)}`);
      setSuggestions(res.data);
    } catch (err) {
      console.error("Error fetching customer suggestions:", err);
    }
  };

  const selectCustomer = (customer) => {
    setDebitnote((prev) => ({
      ...prev,
      customer_name: customer.customer_name || customer.name || "",
      mobile: customer.mobile || "",
      billing_address: customer.billing_address || "",
      gst: customer.gst || "",
    }));
    setSuggestions([]);
    // outstandingCustomer(customer);
  };

  // Product autocomplete
  const handleProductInput = async (index, e) => {
    const value = e.target.value;
    const newItems = [...debitnote.items];
    newItems[index].sku = value;
    setDebitnote(prev => ({ ...prev, items: newItems }));
    setActiveIndex(index);

    if (!value) return setProductSuggestions([]);

    try {
      const res = await axios.get(`${API}/products?term=${value}`);
      setProductSuggestions(res.data || []);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  const selectProduct = (index, product) => {
    const newItems = [...debitnote.items];
    newItems[index] = {
      ...newItems[index],
      sku: product.sku || "",
      product_name: product.product_name || "",
      rate: product.mrp || 0,
      gst_percent: product.gst || 0,
      disc_percent: product.discount || 0,
      total: calculateItemTotal({ ...newItems[index], rate: product.mrp || 0 }).total,
    };
    setDebitnote((prev) => ({ ...prev, items: newItems }));
    setProductSuggestions([]);
    setActiveIndex(null);
  };

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const newItems = [...debitnote.items];
    newItems[index][name] = value;
    newItems[index].total = calculateItemTotal(newItems[index]).total;
    setDebitnote((prev) => ({ ...prev, items: newItems }));
  };

  const addItem = () => setDebitnote((prev) => ({ ...prev, items: [...prev.items, { ...initialItem }] }));
  const removeItem = (index) => debitnote.items.length > 1 && setDebitnote((prev) => ({
    ...prev,
    items: prev.items.filter((_, i) => i !== index),
  }));

  const toggleIGST = () => setDebitnote((prev) => ({ ...prev, igst: !prev.igst }));

  // Save debitnote
  const saveDebitnote = async () => {
    if (!debitnote.template_id) return setError("Cannot save debit note: valid 'debit note' template not selected.");
    if (!debitnote.items.length) return setError("Cannot save debit note: No items added.");

    try {
      const payload = {
        ...debitnote,
        debit_note_date: inputToDMY(debitnote.debit_note_date),
        due_date: inputToDMY(debitnote.due_date),
      };
      if (id) {
        const res = await axios.put(`${API}/debitnote/${id}`, payload);


        setSuccess(res.data.message || "debit note updated successfully!");
      } else {
        const res = await axios.post(`${API}/debitnote`, payload);
        setSuccess(res.data.message || "debit note saved successfully!");
      }
      setTimeout(() => navigate("/debitnotemy"), 1000);
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError(err.response?.data?.error || "Error saving debit note");
    }
  };

  const clearForm = () => window.confirm("Clear form?") && setDebitnote(getInitialState());
  function dmyToInput(dateStr) {
    if (!dateStr) return "";
    const [dd, mm, yyyy] = dateStr.split("-");
    return `${yyyy}-${mm}-${dd}`;
  }




  function inputToDMY(ymd) {
    if (!ymd) return "";
    const [yyyy, mm, dd] = ymd.split("-");
    return `${dd}-${mm}-${yyyy}`;
  }



  return (
    <div className="container my-4">
      {success && <div className="alert alert-success">{success}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card shadow p-4">
        <div
          style={{
            position: "absolute",
            left: "1.5rem",
            top: "1.5rem",
            fontSize: "1.1rem",
            fontWeight: "600",
          }}
        >
          <label className="fw-bold mb-0 me-1 text-muted small">Debit Note No:</label>
          <span className="text-primary">{id}</span>
        </div>
        <h3 className="mb-3 text-center">Debit Note Form</h3>

        {/* Header Section */}
        <div className="mt-4"></div>
        <div className="card shadow p-3 mb-3">
          <div className="row mb-3">
            <div className="col-md-6 mb-2 position-relative">

              <div className="d-flex justify-content-between align-items-center">
                <label className="form-label mb-0">Customer Name</label>

                {/* {outstanding > 0 && (
      <span className="badge bg-success text-white">
        Outstanding: ₹ {outstanding.toFixed(2)}
      </span>
    )} */}
              </div>

              <input
                type="text"
                name="customer_name"
                value={debitnote.customer_name}
                onChange={handleCustomerInput}
                className="form-control mt-1"
                autoComplete="off"
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

            <div className="col-md-6 mb-2">
              <label className="form-label">Ship to</label>
              <input type="text" name="ship_to" value={debitnote.ship_to} onChange={handleHeaderChange} className="form-control" />
            </div>

            <div className="col-md-6 mb-2">
              <label className="form-label">Purchase Person</label>
              <select name="sales_person" value={debitnote.sales_person} onChange={handleHeaderChange} className="form-select">
                <option value="">Select Sales Person</option>
                {employee_name.map((emp) => <option key={emp.id} value={emp.employee_name}>{emp.employee_name}</option>)}
              </select>
            </div>

            <div className="col-md-6 mb-2">
              <label className="form-label">Mobile</label>
              <input type="text" name="mobile" value={debitnote.mobile} onChange={handleHeaderChange} className="form-control" />
            </div>

            <div className="col-md-6 mb-2">
              <label className="form-label">Debit Note Date</label>
              <input
                type="date"
                name="debit_note_date"
                value={debitnote.debit_note_date ? dmyToInput(debitnote.debit_note_date) : ""}
                onChange={(e) =>
                  setDebitnote({
                    ...debitnote,
                    debit_note_date: inputToDMY(e.target.value),
                  })
                }
                className="form-control"
              />
            </div>

            <div className="col-md-6 mb-2">
              <label className="form-label">Due Date</label>
              <input
                type="date"
                name="due_date"
                value={debitnote.due_date ? dmyToInput(debitnote.due_date) : ""}
                onChange={(e) =>
                  setDebitnote({
                    ...debitnote,
                    due_date: inputToDMY(e.target.value),
                  })
                }
                className="form-control"
              />
            </div>

            <div className="col-md-12 mb-2">
              <label className="form-label">Address</label>
              <textarea name="billing_address" value={debitnote.billing_address} onChange={handleHeaderChange} className="form-control" />
            </div>
          </div>
        </div>

        {/* IGST Toggle */}
        <div className="d-flex justify-content-end mb-3">
          <div className="form-check">
            <input type="checkbox" className="form-check-input" checked={debitnote.igst} onChange={toggleIGST} />
            <label className="form-check-label fw-bold">Apply IGST</label>
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
              {debitnote.items.map((item, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>

                  {/* Product / SKU Autocomplete */}
                  <td className="position-relative" style={{ overflow: "visible", position: "relative" }}>
                    <div style={{ position: "relative", width: "100%" }}>
                      <input
                        name="sku"
                        value={item.sku || ""}
                        onChange={(e) => handleProductInput(index, e)}
                        onFocus={() => setActiveIndex(index)}
                        onBlur={() => setTimeout(() => setActiveIndex(null), 200)}
                        className="form-control form-control-sm"
                        autoComplete="off"
                        placeholder="Enter SKU or Product"
                      />

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
                          <li
                            className="list-group-item bg-light d-flex justify-content-between fw-bold py-1 px-2"
                            style={{ fontSize: "0.8rem" }}
                          >
                            <span style={{ width: "60%" }}>SKU</span>
                            <span style={{ width: "40%", textAlign: "right" }}>Stock</span>
                          </li>

                          {productSuggestions
                            .filter(
                              (p) =>
                                p.sku?.toLowerCase().includes(item.sku?.toLowerCase() || "") ||
                                p.product_name?.toLowerCase().includes(item.sku?.toLowerCase() || "")
                            )
                            .map((p, i) => (
                              <li
                                key={i}
                                className="list-group-item list-group-item-action d-flex justify-content-between py-1 px-2"
                                onMouseDown={() => selectProduct(index, p)}
                                style={{ cursor: "pointer", fontSize: "0.85rem" }}
                              >
                                <span style={{ width: "60%" }}>{p.sku}</span>
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
                      type="number"
                      value={item.qty || ""}
                      onChange={(e) => handleItemChange(index, e)}
                      className="form-control form-control-sm"
                    />
                  </td>
                  <td>
                    <input
                      name="rate"
                      type="number"
                      value={item.rate || ""}
                      onChange={(e) => handleItemChange(index, e)}
                      className="form-control form-control-sm"
                    />
                  </td>
                  <td>
                    <input
                      name="disc_val"
                      type="number"
                      value={item.disc_val || ""}
                      onChange={(e) => handleItemChange(index, e)}
                      className="form-control form-control-sm"
                    />
                  </td>
                  <td>
                    <input
                      name="disc_percent"
                      type="number"
                      value={item.disc_percent || ""}
                      onChange={(e) => handleItemChange(index, e)}
                      className="form-control form-control-sm"
                    />
                  </td>
                  <td>
                    <input
                      name="gst_percent"
                      type="number"
                      value={item.gst_percent || ""}
                      onChange={(e) => handleItemChange(index, e)}
                      className="form-control form-control-sm"
                    />
                  </td>
                  <td>
                    <input
                      value={Number(item.total || "").toFixed(2)}
                      readOnly
                      className="form-control form-control-sm text-end"
                    />
                  </td>

                  <td className="text-center">
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => removeItem(index)}
                      disabled={debitnote.items.length === 1}
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
                  {(() => {
                    const qtyTotal = debitnote.items.reduce(
                      (sum, item) => sum + Number(item.qty || 0),
                      0
                    );
                    debitnote.total_qty = qtyTotal; // store in invoice
                    return qtyTotal;
                  })()}
                </td>
                <td colSpan="6"></td>
              </tr>
            </tfoot>

          </table>

          <div className="d-flex justify-content-end">
            <button onClick={addItem} className="btn btn-primary btn-sm">+ Add Row</button>
          </div>
        </div>

        {/* Totals Section */}
        <div className="border p-3 bg-light">
          <div className="d-flex justify-content-between mb-2">
            <label>Discount Total:</label>
            <input value={debitnote.discount_total.toFixed(2)} readOnly className="form-control form-control-sm text-end w-25" />
          </div>

          {debitnote.igst ? (
            <div className="d-flex justify-content-between mb-2">
              <label>IGST:</label>
              <input value={debitnote.gst_total.toFixed(2)} readOnly className="form-control form-control-sm text-end w-25" />
            </div>
          ) : (
            <>
              <div className="d-flex justify-content-between mb-2">
                <label>CGST:</label>
                <input value={(debitnote.gst_total / 2).toFixed(2)} readOnly className="form-control form-control-sm text-end w-25" />
              </div>
              <div className="d-flex justify-content-between mb-2">
                <label>SGST:</label>
                <input value={(debitnote.gst_total / 2).toFixed(2)} readOnly className="form-control form-control-sm text-end w-25" />
              </div>
            </>
          )}

          <div className="d-flex justify-content-between mb-2">
            <label>Net Total:</label>
            <input value={debitnote.net_total.toFixed(2)} readOnly className="form-control form-control-sm text-end w-25" />
          </div>

          <div className="d-flex justify-content-between mb-2">
            <label>Round Off:</label>
            <input value={debitnote.round_off.toFixed(2)} readOnly className="form-control form-control-sm text-end w-25" />
          </div>

          <div className="d-flex justify-content-between">
            <label>Grand Total:</label>
            <input
              value={debitnote.grand_total.toFixed(2)}
              readOnly
              className="form-control form-control-sm text-end w-25 fw-bold"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="d-flex justify-content-end mt-3">
          <button onClick={clearForm} className="btn btn-secondary me-2">
            Clear
          </button>
          <button onClick={saveDebitnote} className="btn btn-success">
            Save Debit Note
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditDebitnoteForm;
