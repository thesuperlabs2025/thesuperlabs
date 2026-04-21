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
  po_date: "",
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
const calculateItemTotal = (item, is_inclusive = 0) => {
  const qty = parseFloat(item.qty || 0);
  const rate = parseFloat(item.rate || 0);
  const discVal = parseFloat(item.disc_val || 0);
  const discPercent = parseFloat(item.disc_percent || 0);
  const gstPercent = parseFloat(item.gst_percent || 0);

  const subTotal = qty * rate;
  const discountAmount = discVal + (subTotal * discPercent) / 100;
  const amountAfterDiscount = subTotal - discountAmount;

  let gstAmount, afterDiscount;
  if (is_inclusive) {
    afterDiscount = amountAfterDiscount / (1 + gstPercent / 100);
    gstAmount = amountAfterDiscount - afterDiscount;
  } else {
    afterDiscount = amountAfterDiscount;
    gstAmount = (afterDiscount * gstPercent) / 100;
  }

  const total = afterDiscount + gstAmount;

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

function EditPOForm() {
  const { id } = useParams();
  const [po, setPO] = useState(getInitialState());
  const [suggestions, setSuggestions] = useState([]);
  const [employee_name, setEmployeename] = useState([]);
  const [productSuggestions, setProductSuggestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  // const [outstanding, setOutstanding] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    document.title = `Edit PO No: ${id || ""} - TSL ERP`;
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
        const poTpl = templates.find((t) => t.template_name?.toLowerCase() === "po");
        if (!poTpl || !poTpl.stock_action) {
          setPO((prev) => ({ ...prev, template_id: null, stock_action: null }));
          setError("No valid 'po' template found.");
          return;
        }
        setPO((prev) => ({
          ...prev,
          stock_action: poTpl.stock_action,
          template_id: poTpl.id,
          is_sku: poTpl.is_sku,
          is_inclusive: poTpl.is_inclusive,
        }));
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

    axios.get(`${API}/po/${id}`)
      .then((res) => {


        const raw = res.data;
        const data = raw.po ? raw.po : raw;       // supports both formats

        const items = Array.isArray(data.items) && data.items.length > 0
          ? data.items
          : [{ ...initialItem }];

        setPO((prev) => ({
          ...prev,
          customer_name: data.customer_name || "",
          ship_to: data.ship_to || "",
          po_date: (data.po_date),
          due_date: (data.due_date),
          sales_person: data.sales_person || "",
          mobile: data.mobile || "",
          billing_address: data.billing_address || "",
          total_qty: data.total_qty || 0,
          discount_total: Number(data.discount_total) || 0,
          grand_total: Number(data.grand_total) || 0,
          is_sku: data.is_sku || 0,
          is_inclusive: data.is_inclusive || 0,


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
        console.error("Error loading po:", err);
        setError("Failed to load po data.");
      });
  }, [id]);



  // Auto-calculate totals when items change
  useEffect(() => {
    const totals = calculateTotals(po.items, po.is_inclusive);
    setPO((prev) => ({ ...prev, ...totals }));
  }, [po.items, po.is_inclusive]);

  // Header change handler
  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    setPO((prev) => ({ ...prev, [name]: value }));
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
    setPO((prev) => ({
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
    const newItems = [...po.items];
    newItems[index].sku = value;
    setPO(prev => ({ ...prev, items: newItems }));
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
    const newItems = [...po.items];
    newItems[index] = {
      ...newItems[index],
      sku: product.sku || "",
      product_name: product.product_name || "",
      rate: product.mrp || 0,
      gst_percent: product.gst || 0,
      disc_percent: product.discount || 0,
      total: calculateItemTotal({ ...newItems[index], rate: product.mrp || 0 }, po.is_inclusive).total,
    };
    setPO((prev) => ({ ...prev, items: newItems }));
    setProductSuggestions([]);
    setActiveIndex(null);
  };

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const newItems = [...po.items];
    newItems[index][name] = value;
    newItems[index].total = calculateItemTotal(newItems[index], po.is_inclusive).total;
    setPO((prev) => ({ ...prev, items: newItems }));
  };

  const addItem = () => setPO((prev) => ({ ...prev, items: [...prev.items, { ...initialItem }] }));
  const removeItem = (index) => po.items.length > 1 && setPO((prev) => ({
    ...prev,
    items: prev.items.filter((_, i) => i !== index),
  }));

  const toggleIGST = () => setPO((prev) => ({ ...prev, igst: !prev.igst }));

  // Save invoice
  const savePO = async () => {
    if (!po.template_id) return setError("Cannot save po: valid 'po' template not selected.");
    if (!po.items.length) return setError("Cannot save po: No items added.");

    try {
      const payload = {
        ...po,
        po_date: inputToDMY(po.po_date),
        due_date: inputToDMY(po.due_date),
      };
      if (id) {
        const res = await axios.put(`${API}/po/${id}`, payload);


        setSuccess(res.data.message || "po updated successfully!");
      } else {
        const res = await axios.post(`${API}/po`, payload);
        setSuccess(res.data.message || "po saved successfully!");
      }
      setTimeout(() => navigate("/pomy"), 1000);
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError(err.response?.data?.error || "Error saving po");
    }
  };

  const clearForm = () => window.confirm("Clear form?") && setPO(getInitialState());
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
            <label className="fw-bold mb-0 me-1 text-muted small">PO No:</label>
            <span className="text-primary">{id || "Loading..."}</span>
          </div>
          <h3 className="mb-0 text-center">PO Form</h3>
        </div>

        {/* Header Section */}
        <div className="d-flex justify-content-between align-items-center mb-3 text-muted fw-bold">
          <div className="d-flex gap-2">
            <span className={`badge ${po.is_inclusive ? "bg-info" : "bg-secondary"}`}>
              {po.is_inclusive ? "Tax Inclusive" : "Tax Exclusive"}
            </span>
            <span className={`badge ${po.is_sku ? "bg-primary" : "bg-warning text-dark"}`}>
              {po.is_sku ? "With SKU" : "Without SKU"}
            </span>
          </div>
          {/* Removed EDIT PO #id display */}
        </div>

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
                value={po.customer_name}
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
              <input type="text" name="ship_to" value={po.ship_to} onChange={handleHeaderChange} className="form-control" />
            </div>

            <div className="col-md-6 mb-2">
              <label className="form-label">Sales Person</label>
              <select name="sales_person" value={po.sales_person} onChange={handleHeaderChange} className="form-select">
                <option value="">Select Sales Person</option>
                {employee_name.map((emp) => <option key={emp.id} value={emp.employee_name}>{emp.employee_name}</option>)}
              </select>
            </div>

            <div className="col-md-6 mb-2">
              <label className="form-label">Mobile</label>
              <input type="text" name="mobile" value={po.mobile} onChange={handleHeaderChange} className="form-control" />
            </div>

            <div className="col-md-6 mb-2">
              <label className="form-label">PO Date</label>
              <input
                type="date"
                name="po_date"
                value={po.po_date ? dmyToInput(po.po_date) : ""}
                onChange={(e) =>
                  setPO({
                    ...po,
                    po_date: inputToDMY(e.target.value),
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
                value={po.due_date ? dmyToInput(po.due_date) : ""}
                onChange={(e) =>
                  setPO({
                    ...po,
                    due_date: inputToDMY(e.target.value),
                  })
                }
                className="form-control"
              />
            </div>

            <div className="col-md-12 mb-2">
              <label className="form-label">Address</label>
              <textarea name="billing_address" value={po.billing_address} onChange={handleHeaderChange} className="form-control" />
            </div>
          </div>
        </div>

        {/* IGST Toggle */}
        <div className="d-flex justify-content-end mb-3">
          <div className="form-check">
            <input type="checkbox" className="form-check-input" checked={po.igst} onChange={toggleIGST} />
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
              {po.items.map((item, index) => (
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
                      disabled={po.items.length === 1}
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
                    const qtyTotal = po.items.reduce(
                      (sum, item) => sum + Number(item.qty || 0),
                      0
                    );
                    po.total_qty = qtyTotal; // store in invoice
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
            <input value={po.discount_total.toFixed(2)} readOnly className="form-control form-control-sm text-end w-25" />
          </div>

          {po.igst ? (
            <div className="d-flex justify-content-between mb-2">
              <label>IGST:</label>
              <input value={po.gst_total.toFixed(2)} readOnly className="form-control form-control-sm text-end w-25" />
            </div>
          ) : (
            <>
              <div className="d-flex justify-content-between mb-2">
                <label>CGST:</label>
                <input value={(po.gst_total / 2).toFixed(2)} readOnly className="form-control form-control-sm text-end w-25" />
              </div>
              <div className="d-flex justify-content-between mb-2">
                <label>SGST:</label>
                <input value={(po.gst_total / 2).toFixed(2)} readOnly className="form-control form-control-sm text-end w-25" />
              </div>
            </>
          )}

          <div className="d-flex justify-content-between mb-2">
            <label>Net Total:</label>
            <input value={po.net_total.toFixed(2)} readOnly className="form-control form-control-sm text-end w-25" />
          </div>

          <div className="d-flex justify-content-between mb-2">
            <label>Round Off:</label>
            <input value={po.round_off.toFixed(2)} readOnly className="form-control form-control-sm text-end w-25" />
          </div>

          <div className="d-flex justify-content-between">
            <label>Grand Total:</label>
            <input
              value={po.grand_total.toFixed(2)}
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
          <button onClick={savePO} className="btn btn-success">
            Save PO
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditPOForm;
