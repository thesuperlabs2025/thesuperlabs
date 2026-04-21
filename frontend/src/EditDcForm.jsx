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
  dc_date: "",
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

function EditDCForm() {
  const { id } = useParams();
  const [dc, setDC] = useState(getInitialState());
  const [suggestions, setSuggestions] = useState([]);
  const [employee_name, setEmployeename] = useState([]);
  const [productSuggestions, setProductSuggestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);
  const [suggestionIndex, setSuggestionIndex] = useState(-1);
  const [customerSuggestionIndex, setCustomerSuggestionIndex] = useState(-1);
  const [shipToSuggestionIndex, setShipToSuggestionIndex] = useState(-1);
  const [shipToSuggestions, setShipToSuggestions] = useState([]);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    document.title = `Edit DC No: ${id || ""} - TSL ERP`;
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
        const dcTpl = templates.find((t) => t.template_name?.toLowerCase() === "dc");
        if (!dcTpl || !dcTpl.stock_action) {
          setDC((prev) => ({ ...prev, template_id: null, stock_action: null }));
          setError("No valid 'dc' template found.");
          return;
        }
        setDC((prev) => ({ ...prev, stock_action: dcTpl.stock_action, template_id: dcTpl.id }));
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

    axios.get(`${API}/dc/${id}`)
      .then((res) => {


        const raw = res.data;
        const data = raw.dc ? raw.dc : raw;       // supports both formats

        const items = Array.isArray(data.items) && data.items.length > 0
          ? data.items
          : [{ ...initialItem }];

        setDC((prev) => ({
          ...prev,
          customer_name: data.customer_name || "",
          ship_to: data.ship_to || "",
          dc_date: (data.dc_date),
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
        console.error("Error loading dc:", err);
        setError("Failed to load dc data.");
      });
  }, [id]);



  // Auto-calculate totals when items change
  useEffect(() => {
    const totals = calculateTotals(dc.items);
    setDC((prev) => ({ ...prev, ...totals }));
  }, [dc.items]);

  // Header change handler
  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    setDC((prev) => ({ ...prev, [name]: value }));
  };

  // Customer autocomplete
  const handleCustomerInput = async (e) => {
    const value = e.target.value;
    handleHeaderChange(e); // updates the customer_name input value

    if (value.trim().length >= 1) {
      try {
        const [custRes, supRes] = await Promise.all([
          axios.get(`${API}/customers?term=${encodeURIComponent(value)}`),
          axios.get(`${API}/supplier?term=${encodeURIComponent(value)}`)
        ]);

        const combined = [
          ...custRes.data.map(c => ({ ...c, type: "Customer" })),
          ...supRes.data.map(s => ({ ...s, type: "Supplier", customer_name: s.supplier_name || s.name }))
        ];

        setSuggestions(combined.slice(0, 10));
        setCustomerSuggestionIndex(-1);
      } catch (err) {
        console.error("Error fetching suggestions:", err);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleCustomerKeyDown = (e) => {
    if (suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCustomerSuggestionIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCustomerSuggestionIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (customerSuggestionIndex >= 0 && suggestions[customerSuggestionIndex]) {
        selectCustomer(suggestions[customerSuggestionIndex]);
      }
    }
  };

  const selectCustomer = (customer) => {
    setDC((prev) => ({
      ...prev,
      customer_name: customer.customer_name || customer.name || "",
      mobile: customer.mobile || "",
      billing_address: customer.billing_address || "",
      gst: customer.gst || "",
    }));
    setSuggestions([]);
    setCustomerSuggestionIndex(-1);
    // outstandingCustomer(customer);
  };

  const handleShipToInput = async (e) => {
    const value = e.target.value;
    handleHeaderChange(e);
    if (value.trim().length < 1) return setShipToSuggestions([]);
    try {
      const res = await axios.get(`${API}/customers?term=${encodeURIComponent(value)}`);
      setShipToSuggestions(res.data.slice(0, 10));
      setShipToSuggestionIndex(-1);
    } catch (err) {
      console.error("Error fetching ship to suggestions:", err);
    }
  };

  const selectShipTo = (customer) => {
    setDC(prev => ({
      ...prev,
      ship_to: customer.customer_name || customer.name || ""
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

  // Product autocomplete
  const handleProductInput = async (index, e) => {
    const value = e.target.value;
    const newItems = [...dc.items];
    newItems[index].sku = value;
    setDC(prev => ({ ...prev, items: newItems }));
    setActiveIndex(index);
    setSuggestionIndex(-1);

    if (!value) return setProductSuggestions([]);

    try {
      const res = await axios.get(`${API}/products?term=${value}`);
      let data = res.data || [];
      // Dedupe by SKU
      data = Array.from(new Map(data.map(p => [p.sku, p])).values());
      setProductSuggestions(data.slice(0, 10));
    } catch (err) {
      console.error("Error fetching products:", err);
    }
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

  const selectProduct = (index, product) => {
    const newItems = [...dc.items];
    newItems[index] = {
      ...newItems[index],
      sku: product.sku || "",
      product_name: product.product_name || "",
      rate: product.mrp || 0,
      gst_percent: product.gst || 0,
      disc_percent: product.discount || 0,
      total: calculateItemTotal({ ...newItems[index], rate: product.mrp || 0 }).total,
    };
    setDC((prev) => ({ ...prev, items: newItems }));
    setProductSuggestions([]);
    setActiveIndex(null);
    setSuggestionIndex(-1);
  };

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const newItems = [...dc.items];
    newItems[index][name] = value;
    newItems[index].total = calculateItemTotal(newItems[index]).total;
    setDC((prev) => ({ ...prev, items: newItems }));
  };

  const addItem = () => setDC((prev) => ({ ...prev, items: [...prev.items, { ...initialItem }] }));
  const removeItem = (index) => dc.items.length > 1 && setDC((prev) => ({
    ...prev,
    items: prev.items.filter((_, i) => i !== index),
  }));

  const toggleIGST = () => setDC((prev) => ({ ...prev, igst: !prev.igst }));

  // Save invoice
  const saveDC = async () => {
    if (!dc.template_id) return setError("Cannot save dc: valid 'dc' template not selected.");
    if (!dc.items.length) return setError("Cannot save dc: No items added.");

    try {
      const payload = {
        ...dc,
        dc_date: inputToDMY(dc.dc_date),
        due_date: inputToDMY(dc.due_date),
      };
      if (id) {
        const res = await axios.put(`${API}/dc/${id}`, payload);


        setSuccess(res.data.message || "dc updated successfully!");
      } else {
        const res = await axios.post(`${API}/dc`, payload);
        setSuccess(res.data.message || "dc saved successfully!");
      }
      setTimeout(() => navigate("/dcmy"), 1000);
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError(err.response?.data?.error || "Error saving dc");
    }
  };

  const clearForm = () => window.confirm("Clear form?") && setDC(getInitialState());
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
        <div style={{ position: "relative", marginBottom: "1rem" }}>
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
            <label className="fw-bold mb-0 me-1 text-muted small">DC No:</label>
            <span className="text-primary">{id || "Loading..."}</span>
          </div>
          <h3 className="mb-0 text-center">DC Form</h3>
        </div>

        {/* Header Section */}
        <div className="card shadow p-3 mb-3 mt-4">
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
                value={dc.customer_name}
                onChange={handleCustomerInput}
                onKeyDown={handleCustomerKeyDown}
                className="form-control mt-1"
                autoComplete="off"
              />

              {suggestions.length > 0 && (
                <ul
                  className="list-group position-absolute w-100 shadow"
                  style={{ zIndex: 1000, top: "100%" }}
                >
                  {suggestions.map((cust, index) => {
                    const display =
                      cust.customer_name || cust.supplier_name || cust.name || cust.id || "Unknown";
                    return (
                      <li
                        key={cust.id ?? index}
                        className={`list-group-item list-group-item-action ${customerSuggestionIndex === index ? "active" : ""}`}
                        style={{ cursor: "pointer" }}
                        onClick={() => selectCustomer(cust)}
                      >
                        {display} <small className="text-muted">({cust.type})</small>
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
                value={dc.ship_to}
                onChange={handleShipToInput}
                onKeyDown={handleShipToKeyDown}
                className="form-control"
                autoComplete="off"
              />
              {shipToSuggestions.length > 0 && (
                <ul
                  className="list-group position-absolute w-100 shadow"
                  style={{ zIndex: 1000, top: "100%", maxHeight: "200px", overflowY: "auto" }}
                >
                  {shipToSuggestions.map((cust, index) => (
                    <li
                      key={cust.id ?? index}
                      className={`list-group-item list-group-item-action ${shipToSuggestionIndex === index ? "active" : ""}`}
                      style={{ cursor: "pointer" }}
                      onClick={() => selectShipTo(cust)}
                    >
                      {cust.customer_name || cust.name || "Unknown"}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="col-md-6 mb-2">
              <label className="form-label">Sales Person</label>
              <select name="sales_person" value={dc.sales_person} onChange={handleHeaderChange} className="form-select">
                <option value="">Select Sales Person</option>
                {employee_name.map((emp) => <option key={emp.id} value={emp.employee_name}>{emp.employee_name}</option>)}
              </select>
            </div>

            <div className="col-md-6 mb-2">
              <label className="form-label">Mobile</label>
              <input type="text" name="mobile" value={dc.mobile} onChange={handleHeaderChange} className="form-control" />
            </div>

            <div className="col-md-6 mb-2">
              <label className="form-label">DC Date</label>
              <input
                type="date"
                name="dc_date"
                value={dc.dc_date ? dmyToInput(dc.dc_date) : ""}
                onChange={(e) =>
                  setDC({
                    ...dc,
                    dc_date: inputToDMY(e.target.value),
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
                value={dc.due_date ? dmyToInput(dc.due_date) : ""}
                onChange={(e) =>
                  setDC({
                    ...dc,
                    due_date: inputToDMY(e.target.value),
                  })
                }
                className="form-control"
              />
            </div>

            <div className="col-md-12 mb-2">
              <label className="form-label">Address</label>
              <textarea name="billing_address" value={dc.billing_address} onChange={handleHeaderChange} className="form-control" />
            </div>
          </div>
        </div>

        {/* IGST Toggle */}
        <div className="d-flex justify-content-end mb-3">
          <div className="form-check">
            <input type="checkbox" className="form-check-input" checked={dc.igst} onChange={toggleIGST} />
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
              {dc.items.map((item, index) => (
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
                        onKeyDown={(e) => handleKeyDown(e, index)}
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

                          {productSuggestions.map((p, i) => (
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
                      disabled={dc.items.length === 1}
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
                    const qtyTotal = dc.items.reduce(
                      (sum, item) => sum + Number(item.qty || 0),
                      0
                    );
                    dc.total_qty = qtyTotal; // store in invoice
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
            <input value={dc.discount_total.toFixed(2)} readOnly className="form-control form-control-sm text-end w-25" />
          </div>

          {dc.igst ? (
            <div className="d-flex justify-content-between mb-2">
              <label>IGST:</label>
              <input value={dc.gst_total.toFixed(2)} readOnly className="form-control form-control-sm text-end w-25" />
            </div>
          ) : (
            <>
              <div className="d-flex justify-content-between mb-2">
                <label>CGST:</label>
                <input value={(dc.gst_total / 2).toFixed(2)} readOnly className="form-control form-control-sm text-end w-25" />
              </div>
              <div className="d-flex justify-content-between mb-2">
                <label>SGST:</label>
                <input value={(dc.gst_total / 2).toFixed(2)} readOnly className="form-control form-control-sm text-end w-25" />
              </div>
            </>
          )}

          <div className="d-flex justify-content-between mb-2">
            <label>Net Total:</label>
            <input value={dc.net_total.toFixed(2)} readOnly className="form-control form-control-sm text-end w-25" />
          </div>

          <div className="d-flex justify-content-between mb-2">
            <label>Round Off:</label>
            <input value={dc.round_off.toFixed(2)} readOnly className="form-control form-control-sm text-end w-25" />
          </div>

          <div className="d-flex justify-content-between">
            <label>Grand Total:</label>
            <input
              value={dc.grand_total.toFixed(2)}
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
          <button onClick={saveDC} className="btn btn-success">
            Save DC
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditDCForm;
