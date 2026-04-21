// EditInvoiceForm.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate, useParams } from "react-router-dom";


const API = process.env.REACT_APP_API_URL;

// --- Initial State ---
const initialItem = {
  product_name: "",
  sku: "test",
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
  invoice_date: "",
  due_date: "",
  items: [{ ...initialItem }],
  discount_total: 0.0,
  gst_total: 0.0,
  net_total: 0.0,
  grand_total: 0.0,
  round_off: 0.0,
  tds: 0,
  tds_percent: 0, // <--- make it 0, not ""
  tds_amount: 0,
  tcs_percent: 0,      // ✅ ADDED
  tcs_amount: 0,
  igst: false,
  stock_action: null,
  template_id: null,
  transport_name: "",
  dc_no: "",
  manual_invoice_no: "",
  place_of_delivery: "",
  terms: "",
  payment_type: "credit",  // NEW: cash or credit
  mode_of_payment: "",     // NEW: for cash
  upi_id: "",           // NEW: for Gpay
  is_sku: 1,      // Template setting
  is_inclusive: 0, // Template setting
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
    // Inclusive: amountAfterDiscount includes tax
    afterDiscount = amountAfterDiscount / (1 + gstPercent / 100);
    gstAmount = amountAfterDiscount - afterDiscount;
  } else {
    // Exclusive: amountAfterDiscount is base
    gstAmount = (amountAfterDiscount * gstPercent) / 100;
    afterDiscount = amountAfterDiscount;
  }

  let total = afterDiscount + gstAmount;

  return { total, discountAmount, gstAmount, afterDiscount };
};


// Define calculateTotals first
const calculateTotals = (
  items,
  tdsPercent = 0,
  tcsPercent = 0,
  is_inclusive = 0
) => {
  let net_total = 0,
    discount_total = 0,
    gst_total = 0;

  items.forEach(item => {
    const { discountAmount, gstAmount, afterDiscount } =
      calculateItemTotal(item, is_inclusive);

    net_total += Number(afterDiscount) || 0;
    discount_total += Number(discountAmount) || 0;
    gst_total += Number(gstAmount) || 0;
  });

  const before_tax = net_total + gst_total;

  // ✅ TDS (SUBTRACT)
  const tds_amount = +(
    before_tax * tdsPercent / 100
  ).toFixed(2);

  // ✅ TCS (ADD)
  const tcs_amount = +(
    before_tax * tcsPercent / 100
  ).toFixed(2);

  const after_tds_tcs = before_tax - tds_amount + tcs_amount;

  const round_off = +(
    Math.round(after_tds_tcs) - after_tds_tcs
  ).toFixed(2);

  const grand_total = +(
    after_tds_tcs + round_off
  ).toFixed(2);

  return {
    net_total,
    discount_total,
    gst_total,

    tds_amount,
    tcs_amount,

    round_off,
    grand_total
  };
};

function EditInvoiceForm() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(getInitialState());
  const [suggestions, setSuggestions] = useState([]);
  const [employee_name, setEmployeename] = useState([]);
  const [productSuggestions, setProductSuggestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);
  const [suggestionIndex, setSuggestionIndex] = useState(-1);
  const [customerSuggestionIndex, setCustomerSuggestionIndex] = useState(-1);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [outstanding, setOutstanding] = useState(0);
  const [invoiceNo, setInvoiceNo] = useState("");








  // get invoice ID from URL
  const isEditMode = !!id;    // true if id exists
  const invoiceId = id;
  // Set page title
  useEffect(() => {
    document.title = `Edit Invoice ${invoiceNo || id} - TSL ERP`;
  }, [invoiceNo, id]);

  useEffect(() => {
    if (!invoice.items?.length) return;

    const totals = calculateTotals(
      invoice.items,
      Number(invoice.tds_percent || 0),
      Number(invoice.tcs_percent || 0),
      invoice.is_inclusive
    );

    setInvoice(prev => ({
      ...prev,
      ...totals
    }));
  }, [
    invoice.items,
    invoice.tds_percent,
    invoice.tcs_percent,
    invoice.is_inclusive
  ]);










  const navigate = useNavigate();
  useEffect(() => {
    if (isEditMode && invoiceId) {
      fetchInvoiceById(invoiceId);
    } else {
      fetchInvoiceNo();
    }
  }, [isEditMode, invoiceId]);




  const fetchInvoiceById = async (id) => {
    try {
      const res = await axios.get(`${API}/invoices/${id}`);
      const data = res.data;
      console.log("Edit invoice data:", res.data);
      console.log("EDIT API TDS:", data.tds, data.tds_amount);

      // use id as invoice number if you don't have a formatted one
      setInvoiceNo(res.data.id);
    } catch (err) {
      console.error("Failed to fetch invoice:", err);
    }
  };


  const fetchInvoiceNo = async () => {
    try {
      const res = await axios.get(`${API}/next-invoice-no`);
      console.log("Next invoice:", res.data); // debug
      setInvoiceNo(res.data.invoiceNo);
    } catch (err) {
      console.error("Failed to get next invoice no:", err);
    }
  };




  const outstandingCustomer = async (cust) => {
    try {
      const name = cust.customer_name ?? cust.name;

      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/outstanding/${encodeURIComponent(name)}`
      );

      if (!res.ok) {
        throw new Error("Failed to fetch outstanding balance");
      }

      const data = await res.json();
      setOutstanding(Number(data.outstanding_balance) || 0);

    } catch (err) {
      console.error(err);
      setOutstanding(0);
    }
  };
  // Load template
  useEffect(() => {
    axios.get(`${API}/templates`)
      .then((res) => {
        const templates = res.data;
        const invoiceTpl = templates.find((t) => t.template_name?.toLowerCase() === "invoice");
        if (!invoiceTpl || !invoiceTpl.stock_action) {
          setInvoice((prev) => ({ ...prev, template_id: null, stock_action: null }));
          setError("No valid 'invoice' template found.");
          return;
        }
        setInvoice((prev) => ({
          ...prev,
          stock_action: invoiceTpl.stock_action,
          template_id: invoiceTpl.id,
          is_sku: invoiceTpl.is_sku,
          is_inclusive: invoiceTpl.is_inclusive
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

    axios.get(`${API}/invoices/${id}`)
      .then((res) => {


        const raw = res.data;
        const data = raw.invoice ? raw.invoice : raw;       // supports both formats

        const items = Array.isArray(data.items) && data.items.length > 0
          ? data.items
          : [{ ...initialItem }];

        setInvoice((prev) => ({
          ...prev,



          // amount comes from invoice

          tds_percent: Number(data.tds_percent ?? data.tds ?? 0),
          tds: Number(data.tds || 0),
          tcs: Number(data.tcs || 0),
          tcs_percent: Number(data.tcs_percent || 0),

          customer_name: data.customer_name || "",
          ship_to: data.ship_to || "",
          invoice_date: (data.invoice_date),
          due_date: (data.due_date),
          sales_person: data.sales_person || "",
          mobile: data.mobile || "",
          billing_address: data.billing_address || "",
          transport_name: data.transport_name || "",
          dc_no: data.dc_no || "",
          manual_invoice_no: data.manual_invoice_no || "",
          place_of_delivery: data.place_of_delivery || "",
          terms: data.terms || "",
          payment_type: data.payment_type || "credit",  // Load payment type from API
          mode_of_payment: data.mode_of_payment || "",     // Load mode
          upi_id: data.upi_id || "",                    // Load upi id

          // DEBUG: Log payment_type value
          ...(console.log("Loaded payment_type from API:", data.payment_type) || {}),

          total_qty: data.total_qty || 0,
          // discount_total: Number(data.discount_total) || 0,
          // grand_total: Number(data.grand_total) || 0,


          items: items.map((item) => ({
            ...initialItem,
            ...item,
            qty: Number(item.qty) || "",
            rate: Number(item.rate) || 0,
            disc_val: Number(item.disc_val) || 0,
            disc_percent: Number(item.disc_percent) || 0,
            gst_percent: Number(item.gst_percent) || 0,


          })),
        }));
      })
      .catch((err) => {
        console.error("Error loading invoice:", err);
        setError("Failed to load invoice data.");
      });
  }, [id]);



  // Auto-calculate totals when items change
  // useEffect(() => {
  //   const totals = calculateTotals(invoice.items);
  //   setInvoice((prev) => ({ ...prev, ...totals }));
  // }, [invoice.items]);

  // Header change handler
  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    setInvoice((prev) => ({ ...prev, [name]: value }));
  };

  // Customer autocomplete
  const handleCustomerInput = async (e) => {
    const value = e.target.value;
    handleHeaderChange(e);
    if (value.trim().length < 1) {
      setSuggestions([]);
      setCustomerSuggestionIndex(-1);
      return;
    }
    try {
      const res = await axios.get(`${API}/customers?term=${encodeURIComponent(value)}`);
      setSuggestions(res.data);
      setCustomerSuggestionIndex(-1);
    } catch (err) {
      console.error("Error fetching customer suggestions:", err);
    }
  };

  const selectCustomer = (customer) => {
    setInvoice((prev) => ({
      ...prev,
      customer_name: customer.customer_name || customer.name || "",
      mobile: customer.mobile || "",
      billing_address: customer.billing_address || "",
      gst: customer.gst || "", tds: customer.tds || "",
    }));
    setSuggestions([]);
    setCustomerSuggestionIndex(-1);
    outstandingCustomer(customer);
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

  // Product autocomplete
  const handleProductInput = async (index, e) => {
    const value = e.target.value;
    const newItems = [...invoice.items];
    newItems[index].sku = value;
    setInvoice(prev => ({ ...prev, items: newItems }));
    setActiveIndex(index);
    setSuggestionIndex(-1);

    if (value.length < 1) return setProductSuggestions([]);

    try {
      const res = await axios.get(`${API}/products?term=${value}`);
      let data = res.data || [];
      // Dedupe by SKU
      data = Array.from(new Map(data.map(p => [p.sku, p])).values());
      setProductSuggestions(data);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  const selectProduct = (index, product) => {
    const newItems = [...invoice.items];
    newItems[index] = {
      ...newItems[index],
      sku: product.sku || "",
      product_name: product.product_name || "",
      rate: product.mrp || 0,
      gst_percent: product.gst || 0,
      disc_percent: product.discount || 0,
      total: calculateItemTotal({ ...newItems[index], rate: product.mrp || 0 }, invoice.is_inclusive).total,
    };
    setInvoice((prev) => ({ ...prev, items: newItems }));
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
    const newItems = [...invoice.items];
    newItems[index][name] = value;
    newItems[index].total = calculateItemTotal(newItems[index], invoice.is_inclusive).total;
    setInvoice((prev) => ({ ...prev, items: newItems }));
  };

  const addItem = () => setInvoice((prev) => ({ ...prev, items: [...prev.items, { ...initialItem }] }));
  const removeItem = (index) => invoice.items.length > 1 && setInvoice((prev) => ({
    ...prev,
    items: prev.items.filter((_, i) => i !== index),
  }));

  const toggleIGST = () => setInvoice((prev) => ({ ...prev, igst: !prev.igst }));

  // Save invoice
  const saveInvoice = async () => {
    if (!invoice.template_id) return setError("Cannot save invoice: valid 'invoice' template not selected.");
    if (!invoice.items.length) return setError("Cannot save invoice: No items added.");

    // SKU Validation based on template
    if (invoice.is_sku === 1) {
      const missingSku = invoice.items.some(target => !target.sku || target.sku.trim() === "");
      if (missingSku) {
        setError("SKU is required for all items in this template.");
        return;
      }
    }

    // --- CHECK FOR MANUAL INVOICE NO DUPLICATION ---
    if (invoice.manual_invoice_no) {
      try {
        const checkRes = await axios.get(`${API}/invoices/check-manual-no/${invoice.manual_invoice_no}`);
        // If editing, exclude the current invoice ID from the check
        if (checkRes.data.exists && checkRes.data.id !== id) {
          setError(`Manual Invoice No ${invoice.manual_invoice_no} already exists!`);
          return;
        }
      } catch (err) {
        console.error("Manual No Check Error:", err);
      }
    }

    try {
      const payload = {
        ...invoice,
        invoice_date: inputToDMY(invoice.invoice_date),
        due_date: inputToDMY(invoice.due_date),
        is_sku: invoice.is_sku,
        is_inclusive: invoice.is_inclusive,
      };
      if (id) {
        const res = await axios.put(`${API}/invoices/${id}`, payload);


        setSuccess(res.data.message || "Invoice updated successfully!");
      } else {
        const res = await axios.post(`${API}/invoices`, payload);
        setSuccess(res.data.message || "Invoice saved successfully!");
      }
      setTimeout(() => navigate("/invoicemy"), 1000);
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError(err.response?.data?.error || "Error saving invoice");
    }
  };

  const clearForm = () => window.confirm("Clear form?") && setInvoice(getInitialState());
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
        <div className="mb-3 position-relative" style={{ height: "2rem" }}>
          {/* Invoice No on the left */}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: "1.2rem",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "12px"
            }}
          >
            <div>
              <label className="fw-bold mb-0 me-1">Invoice No:</label>
              <span>{invoiceNo || "Loading..."}</span>
            </div>

            {/* Payment Type Badge (Readonly) */}
            <div
              style={{
                display: "inline-flex",
                padding: "4px 12px",
                borderRadius: "50px",
                fontWeight: "600",
                fontSize: "0.75rem",
                background: invoice.payment_type === "cash"
                  ? "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)"
                  : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "#fff",
                boxShadow: invoice.payment_type === "cash"
                  ? "0 2px 8px rgba(17, 153, 142, 0.3)"
                  : "0 2px 8px rgba(102, 126, 234, 0.3)",
                textTransform: "uppercase",
                letterSpacing: "0.5px"
              }}
            >
              {invoice.payment_type === "cash" ? "💵 CASH INVOICE" : "💳 CREDIT INVOICE"}
            </div>
            {/* Tax Type Badge */}
            <span className={`badge ${invoice.is_inclusive ? 'bg-info' : 'bg-secondary'}`} style={{ marginLeft: '10px', fontSize: '0.75rem' }}>
              {invoice.is_inclusive ? 'Tax Inclusive' : 'Tax Exclusive'}
            </span>
          </div>

          {/* Invoice Form centered */}
          <h3 className="mb-0 text-center" style={{ lineHeight: "2rem" }}>
            Edit Invoice Form
          </h3>
        </div>
        {/* Header Section */}
        <div className="card shadow p-3 mb-3">
          <div className="row mb-3">
            <div className="col-md-6 mb-2 position-relative">

              <div className="d-flex justify-content-between align-items-center">
                <label className="form-label mb-0">Customer Name</label>

                {outstanding > 0 && (
                  <span className="badge bg-success text-white">
                    Outstanding: ₹ {outstanding.toFixed(2)}
                  </span>
                )}
              </div>

              <input
                type="text"
                name="customer_name"
                value={invoice.customer_name}
                onChange={handleCustomerInput}
                className="form-control mt-1"
                autoComplete="off"
                placeholder="Type customer name..."
                onKeyDown={handleCustomerKeyDown}
                onBlur={() => setTimeout(() => setSuggestions([]), 200)}
              />

              {suggestions.length > 0 && (
                <ul
                  className="list-group position-absolute w-100 shadow"
                  style={{ zIndex: 1000, top: "100%" }}
                >
                  {suggestions.map((cust, index) => {
                    const display =
                      cust.customer_name ?? cust.name ?? `${cust.id || ""}`;
                    return (
                      <li
                        key={cust.id ?? display}
                        className={`list-group-item list-group-item-action ${customerSuggestionIndex === index ? "active" : ""}`}
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
              <input type="text" name="ship_to" value={invoice.ship_to} onChange={handleHeaderChange} className="form-control" />
            </div>

            <div className="col-md-6 mb-2">
              <label className="form-label">Sales Person</label>
              <select name="sales_person" value={invoice.sales_person} onChange={handleHeaderChange} className="form-select">
                <option value="">Select Sales Person</option>
                {employee_name.map((emp) => <option key={emp.id} value={emp.employee_name}>{emp.employee_name}</option>)}
              </select>
            </div>

            <div className="col-md-6 mb-2">
              <label className="form-label">Mobile</label>
              <input type="text" name="mobile" value={invoice.mobile} onChange={handleHeaderChange} className="form-control" />
            </div>

            <div className="col-md-6 mb-2">
              <label className="form-label">Invoice Date</label>
              <input
                type="date"
                name="invoice_date"
                value={invoice.invoice_date ? dmyToInput(invoice.invoice_date) : ""}
                onChange={(e) =>
                  setInvoice({
                    ...invoice,
                    invoice_date: inputToDMY(e.target.value),
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
                value={invoice.due_date ? dmyToInput(invoice.due_date) : ""}
                onChange={(e) =>
                  setInvoice({
                    ...invoice,
                    due_date: inputToDMY(e.target.value),
                  })
                }
                className="form-control"
              />
            </div>

            <div className="col-md-12 mb-2">
              <label className="form-label">Address</label>
              <textarea name="billing_address" value={invoice.billing_address} onChange={handleHeaderChange} className="form-control" />
            </div>
          </div>

          {/* Other Details Accordion */}
          <div className="accordion mb-3" id="otherDetailsAccordion">
            <div className="accordion-item">
              <h2 className="accordion-header" id="headingOther">
                <button
                  className="accordion-button collapsed fw-bold"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#collapseOther"
                  aria-expanded="false"
                  aria-controls="collapseOther"
                >
                  Other Details
                </button>
              </h2>
              <div
                id="collapseOther"
                className="accordion-collapse collapse"
                aria-labelledby="headingOther"
                data-bs-parent="#otherDetailsAccordion"
              >
                <div className="accordion-body">
                  <div className="row">
                    <div className="col-md-4 mb-2">
                      <label className="form-label">Transport Name</label>
                      <input
                        type="text"
                        name="transport_name"
                        value={invoice.transport_name}
                        onChange={handleHeaderChange}
                        className="form-control"
                      />
                    </div>
                    <div className="col-md-4 mb-2">
                      <label className="form-label">DC No</label>
                      <input
                        type="text"
                        name="dc_no"
                        value={invoice.dc_no}
                        onChange={handleHeaderChange}
                        className="form-control"
                      />
                    </div>
                    <div className="col-md-4 mb-2">
                      <label className="form-label">Manual Invoice No</label>
                      <input
                        type="text"
                        name="manual_invoice_no"
                        value={invoice.manual_invoice_no}
                        onChange={handleHeaderChange}
                        className="form-control"
                      />
                    </div>
                    <div className="col-md-6 mb-2">
                      <label className="form-label">Place of Delivery</label>
                      <input
                        type="text"
                        name="place_of_delivery"
                        value={invoice.place_of_delivery}
                        onChange={handleHeaderChange}
                        className="form-control"
                      />
                    </div>
                    <div className="col-md-6 mb-2">
                      <label className="form-label">Terms</label>
                      <textarea
                        name="terms"
                        value={invoice.terms}
                        onChange={handleHeaderChange}
                        className="form-control"
                        rows="1"
                      />
                    </div>

                    {/* Mode of Payment & UPI ID (If Cash Invoice) */}
                    {invoice.payment_type === "cash" && (
                      <>
                        <div className="col-md-4 mb-2">
                          <label className="form-label">Mode of Payment</label>
                          <input
                            type="text"
                            name="mode_of_payment"
                            value={invoice.mode_of_payment || ""}
                            onChange={handleHeaderChange}
                            className="form-control"
                            placeholder="e.g. Cash, Gpay"
                          />
                        </div>

                        {invoice.mode_of_payment?.toLowerCase() === "gpay" && (
                          <div className="col-md-4 mb-2">
                            <label className="form-label">UPI Id</label>
                            <input
                              type="text"
                              name="upi_id"
                              value={invoice.upi_id || ""}
                              onChange={handleHeaderChange}
                              className="form-control"
                              placeholder="Enter UPI Id"
                            />
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* IGST Toggle */}
        <div className="d-flex justify-content-end mb-3">
          <div className="form-check">
            <input type="checkbox" className="form-check-input" checked={invoice.igst} onChange={toggleIGST} />
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
              {invoice.items.map((item, index) => (
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
                        onBlur={() => setTimeout(() => { setActiveIndex(null); setProductSuggestions([]); }, 200)}
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
                      disabled={invoice.items.length === 1}
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
                    const qtyTotal = invoice.items.reduce(
                      (sum, item) => sum + Number(item.qty || 0),
                      0
                    );
                    invoice.total_qty = qtyTotal; // store in invoice
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
            <label>Net Total:</label>
            <input value={invoice.net_total.toFixed(2)} readOnly className="form-control form-control-sm text-end w-25" />
          </div>
          <div className="d-flex justify-content-between mb-2">
            <label>Discount Total:</label>
            <input value={invoice.discount_total.toFixed(2)} readOnly className="form-control form-control-sm text-end w-25" />
          </div>

          {invoice.igst ? (
            <div className="d-flex justify-content-between mb-2">
              <label>IGST:</label>
              <input value={invoice.gst_total.toFixed(2)} readOnly className="form-control form-control-sm text-end w-25" />
            </div>
          ) : (
            <>
              <div className="d-flex justify-content-between mb-2">
                <label>CGST:</label>
                <input value={(invoice.gst_total / 2).toFixed(2)} readOnly className="form-control form-control-sm text-end w-25" />
              </div>
              <div className="d-flex justify-content-between mb-2">
                <label>SGST:</label>
                <input value={(invoice.gst_total / 2).toFixed(2)} readOnly className="form-control form-control-sm text-end w-25" />
              </div>
            </>
          )}
          {(Number(invoice.tds_percent) > 0) && (
            <div className="d-flex justify-content-between mb-2">
              <label>TDS ({invoice.tds_percent}%)</label>
              <input
                value={Number(invoice.tds || 0).toFixed(2)}
                readOnly
                className="form-control form-control-sm text-end w-25"
              />
            </div>
          )}

          {Number(invoice.tcs_percent) > 0 && (
            <div className="d-flex justify-content-between mb-2">
              <label>TCS ({invoice.tcs_percent}%)</label>
              <input
                value={Number(invoice.tcs_amount || 0).toFixed(2)}
                readOnly
                className="form-control form-control-sm text-end w-25"
              />
            </div>
          )}



          <div className="d-flex justify-content-between mb-2">
            <label>Round Off:</label>
            <input value={invoice.round_off.toFixed(2)} readOnly className="form-control form-control-sm text-end w-25" />
          </div>

          <div className="d-flex justify-content-between">
            <label>Grand Total:</label>
            <input
              value={Number(invoice.grand_total || 0).toFixed(2)}
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
          <button onClick={saveInvoice} className="btn btn-success">
            Save Invoice
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditInvoiceForm;
