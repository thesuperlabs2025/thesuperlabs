import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate, useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const API = process.env.REACT_APP_API_URL;

<>
  <style>{`
    tbody, tr, td {
      overflow: visible !important;
    }
  `}</style>

  {/* Your component code */}
</>




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
  header: {
    customer_name: "",
    mobile: "",
    billing_address: "",
    gst: "",
    sales_person: "",
    ship_to: "",
    debit_note_date: new Date().toISOString().substring(0, 10),
    due_date: new Date(Date.now() + 86400000 * 1).toISOString().substring(0, 10),
  },
  items: [{ ...initialItem }],
  discount_total: 0.0,
  gst_total: 0.0,
  net_total: 0.0,
  grand_total: 0.0,
  round_off: 0.0,
  igst: false,
});

// --- Calculation Helpers ---
const calculateItemTotal = (item) => {
  const qty = parseFloat(item.qty || 0);
  const rate = parseFloat(item.rate || 0);
  const discVal = parseFloat(item.disc_val || 0);
  const discPercent = parseFloat(item.disc_percent || 0);
  const gstPercent = parseFloat(item.gst_percent || 0);

  let subTotal = qty * rate;
  let discountAmount = discVal + (subTotal * discPercent) / 100;
  let afterDiscount = subTotal - discountAmount;
  let gstAmount = (afterDiscount * gstPercent) / 100;
  let total = afterDiscount + gstAmount;

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

  // ✅ Added Round Off
  const rounded = Math.round(grand_total);
  const round_off = parseFloat((rounded - grand_total).toFixed(2));
  grand_total = rounded;

  return { net_total, discount_total, gst_total, grand_total, round_off };
};

function DebitnoteForm() {
  const [debitnote, setDebitnote] = useState(getInitialState());
  const [suggestions, setSuggestions] = useState([]);
  const [employee_name, setEmployeename] = useState([]);
  const [productSuggestions, setProductSuggestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);
  const [shipToSuggestions, setShipToSuggestions] = useState([]);
  const [suggestionIndex, setSuggestionIndex] = useState(-1);
  const [customerSuggestionIndex, setCustomerSuggestionIndex] = useState(-1);
  const [shipToSuggestionIndex, setShipToSuggestionIndex] = useState(-1);
  const [debitNoteNo, setDebitNoteNo] = useState("");
  const [purchaseList, setPurchaseList] = useState([]);
  const [selectedPurchase, setSelectedPurchase] = useState("");
  // const [outstanding, setOutstanding] = useState(0);

  useEffect(() => {
    document.title = `Debit Note No: ${debitNoteNo || ""} - TSL ERP`;
  }, [debitNoteNo]);


  // New name for select customer
  // const outstandingCustomer = async (cust) => {
  //   try {
  //     const name = cust.customer_name ?? cust.name;

  //     // Use the name directly in the URL
  //     const res = await axios.get(
  //       `${process.env.REACT_APP_API_URL}/api/outstanding/${encodeURIComponent(name)}`
  //     );

  //     // Expecting API to return { outstanding_balance: number }
  //     setOutstanding(Number(res.data.outstanding_balance) || 0);

  //   } catch (err) {
  //     console.error("Outstanding fetch error:", err);
  //     setOutstanding(0);
  //   }
  // };







  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state && location.state.convertData) {
      const data = location.state.convertData;
      setDebitnote(prev => {
        const newState = {
          ...prev,
          customer_name: data.customer_name || prev.customer_name,
          ship_to: data.ship_to || prev.ship_to,
          mobile: data.mobile || prev.mobile,
          billing_address: data.billing_address || prev.billing_address,
          sales_person: data.sales_person || prev.sales_person,
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

        const totals = calculateTotals(newState.items);
        return { ...newState, ...totals };
      });
    }
  }, [location.state]);
  useEffect(() => {
    axios.get(`${API}/templates`)
      .then((res) => {
        const templates = res.data;

        // ⭐ Find debitnote template
        const debitnoteTpl = templates.find(
          (t) => t.template_name.toLowerCase() === "debitnote"
        );

        if (!debitnoteTpl || !debitnoteTpl.stock_action) {
          toast.error("No valid 'debitnote' template found.");
          setDebitnote((prev) => ({
            ...prev,
            template_id: null,
            stock_action: null,
          }));
          return;
        }

        // ✅ Valid debitnote template
        setDebitnote((prev) => ({
          ...prev,
          stock_action: debitnoteTpl.stock_action,
          template_id: debitnoteTpl.id,
        }));


      })
      .catch((err) => {
        console.error("Error fetching template:", err);
        toast.error("Error fetching templates from server.");
      });
  }, []);

  useEffect(() => {
    fetchDebitNoteNo();
  }, []);

  const fetchDebitNoteNo = async () => {
    try {
      const res = await axios.get(`${API}/debitnote/next-debit-note-no`);
      setDebitNoteNo(res.data.debitNoteNo);
    } catch (err) {
      console.error("Failed to load Debit Note number", err);
    }
  };

  const selectedYear = JSON.parse(localStorage.getItem("selectedYear") || "{}");




  // --- Fetch employees ---
  useEffect(() => {
    axios
      .get(`${API}/employees`)
      .then((res) => setEmployeename(res.data))
      .catch((err) => console.error("Error fetching employees:", err));
  }, []);

  // --- Auto calculate totals ---
  useEffect(() => {
    const totals = calculateTotals(debitnote.items);
    setDebitnote((prev) => ({ ...prev, ...totals }));
  }, [debitnote.items]);

  // --- Header change ---
  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    setDebitnote((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  // --- Customer autocomplete ---
  const handleCustomerInput = async (e) => {
    const value = e.target.value;
    handleHeaderChange(e); // updates the customer_name input value

    if (value.trim().length >= 1) {
      try {
        const [supRes, custRes] = await Promise.all([
          axios.get(`${API}/supplier?term=${encodeURIComponent(value)}`),
          axios.get(`${API}/customers?term=${encodeURIComponent(value)}`)
        ]);

        const combined = [
          ...supRes.data.map(s => ({ ...s, type: "Supplier", customer_name: s.supplier_name || s.name })),
          ...custRes.data.map(c => ({ ...c, type: "Customer", customer_name: c.customer_name || c.name }))
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
        selectSupplier(suggestions[customerSuggestionIndex]);
      }
    }
  };

  const loadPurchase = async () => {
    if (!selectedPurchase) return; // safety check

    try {
      // Call backend endpoint for a specific purchase
      const res = await axios.get(`${API}/purchases/${selectedPurchase}`);
      const purchase = res.data;

      // Map purchase items to purchase return items
      const loadedItems = purchase.items.map((item) => ({
        product_name: item.product_name,
        sku: item.sku,
        qty: item.qty,                  // purchased quantity
        rate: item.rate,                // purchase rate
        disc_val: item.disc_val || 0,
        disc_percent: item.disc_percent || 0,
        gst_percent: item.gst_percent || 0,
        total: Number(item.total) || 0, // ensure numeric
      }));

      setDebitnote((prev) => ({
        ...prev,
        items: loadedItems,
      }));
    } catch (err) {
      console.error("Purchase load error:", err);
      toast.error("Failed to load purchase data");
    }
  };

  const selectSupplier = async (supplier) => {
    const Name = supplier.customer_name || supplier.name || "";

    // Update purchase return header
    setDebitnote((prev) => ({
      ...prev,
      customer_name: Name,
      ship_to: Name,
      mobile: supplier.mobile || "",
      billing_address: supplier.billing_address || "",
      gst: supplier.gst || 0,
    }));

    // Close autocomplete suggestions
    setSuggestions([]);
    setCustomerSuggestionIndex(-1);

    // 🔹 Fetch purchases for this supplier
    try {
      const res = await axios.get(
        `${API}/purchases/by-supplier/${encodeURIComponent(Name)}`
      );
      setPurchaseList(res.data); // expects [{ purchase_no: 1 }, { purchase_no: 2 }]
    } catch (err) {
      console.error("Purchase fetch error:", err);
      setPurchaseList([]);
    }

    // 🔹 Optional: fetch outstanding balance if needed
    // outstandingSupplier(supplier);
  };

  // Ship To autocomplete
  const handleShipToInput = async (e) => {
    const value = e.target.value;
    handleHeaderChange(e);
    if (value.trim().length < 1) return setShipToSuggestions([]);
    try {
      // For Debit Note, search suppliers for ship_to since it's purchase-related
      const res = await axios.get(`${API}/supplier?term=${encodeURIComponent(value)}`);
      setShipToSuggestions(res.data.slice(0, 10));
      setShipToSuggestionIndex(-1);
    } catch (err) {
      console.error("Error fetching ship to suggestions:", err);
    }
  };

  const selectShipTo = (supplier) => {
    setDebitnote(prev => ({
      ...prev,
      ship_to: supplier.customer_name || supplier.name || ""
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
    const newItems = [...debitnote.items];
    newItems[index].sku = value;
    setDebitnote((prev) => ({ ...prev, items: newItems }));
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
    const isDuplicate = debitnote.items.some(
      (item, i) => i !== index && item.product_name === product.product_name
    );
    if (isDuplicate) {
      alert("This product is already added!");
      setProductSuggestions([]);
      return;
    }

    const newItems = [...debitnote.items];

    newItems[index].sku = product.sku || "";
    newItems[index].rate = product.mrp || "";
    newItems[index].gst_percent = product.gst || "";
    newItems[index].disc_percent = product.discount || "";
    const { total } = calculateItemTotal(newItems[index]);
    newItems[index].total = parseFloat(total.toFixed(2));
    setDebitnote((prev) => ({ ...prev, items: newItems }));
    setProductSuggestions([]);
    setActiveIndex(null);
    setSuggestionIndex(-1);
  };

  // --- Item change handler ---
  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const newItems = [...debitnote.items];
    newItems[index][name] = value;
    const { total } = calculateItemTotal(newItems[index]);
    newItems[index].total = parseFloat(total.toFixed(2));
    setDebitnote((prev) => ({ ...prev, items: newItems }));
  };

  // --- Add / Remove rows ---
  const addItem = () =>
    setDebitnote((prev) => ({
      ...prev,
      items: [...prev.items, { ...initialItem }],
    }));

  const removeItem = (index) => {
    if (debitnote.items.length > 1) {
      const newItems = debitnote.items.filter((_, i) => i !== index);
      setDebitnote((prev) => ({ ...prev, items: newItems }));
    }
  };

  // --- IGST toggle ---
  const toggleIGST = () =>
    setDebitnote((prev) => ({ ...prev, igst: !prev.igst }));

  // --- Save debitnote ---
  const saveDebitnote = async () => {
    if (selectedYear.is_closed) {
      toast.error("Error: This Accounting Year is locked and cannot be modified.");
      return;
    }

    const dnDate = new Date(debitnote.debit_note_date);
    const startDate = new Date(selectedYear.start_date);
    const endDate = new Date(selectedYear.end_date);
    if (dnDate < startDate || dnDate > endDate) {
      if (!window.confirm(`Warning: Debit Note date is outside the selected Accounting Year (AY ${selectedYear.year_name}). Do you want to proceed?`)) {
        return;
      }
    }

    try {
      const res = await axios.post(`${API}/debitnote`, {
        customer_name: debitnote.customer_name,
        ship_to: debitnote.ship_to,
        mobile: debitnote.mobile,
        debit_note_date: toDMY(debitnote.debit_note_date),
        due_date: toDMY(debitnote.due_date),
        sales_person: debitnote.sales_person,
        billing_address: debitnote.billing_address,
        sku: debitnote.sku,
        total_qty: debitnote.total_qty,
        discount_total: debitnote.discount_total,
        grand_total: debitnote.grand_total,
        items: debitnote.items,
        template_id: debitnote.template_id,
        year_id: selectedYear.year_id
      });

      toast.success(res.data.message || "debitnote saved successfully!");

      // Keep template ID + stock action after reset
      setDebitnote((prev) => ({
        ...getInitialState(),
        stock_action: prev.stock_action,
        template_id: prev.template_id,
      }));

      setTimeout(() => navigate("/debitnotemy"), 1000);
    } catch (err) {
      console.error("Error saving debitnote return:", err.response?.data || err.message);
      toast.error(err.response?.data?.error || "Error saving debitnote return");
    }
  };


  function toDMY(dateString) {
    if (!dateString || !dateString.includes("-")) return "";
    const [y, m, d] = dateString.split("-");
    return `${d}-${m}-${y}`;
  }




  // --- Clear form ---
  const clearForm = () => {
    if (window.confirm("Clear form?")) setDebitnote(getInitialState());
  };







  return (
    <div className="container my-4">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} theme="colored" />
      <div className="card shadow p-4 w-90">
        <div className="mb-3 d-flex justify-content-between align-items-center border-bottom pb-3">
          <div className="d-flex align-items-center gap-4">
            <div>
              <label className="fw-bold mb-0 me-1 text-muted small">Debit Note No:</label>
              <div className="text-primary fw-bold fs-5">{debitNoteNo || "Loading..."}</div>
            </div>
            <div className="vr" style={{ height: '40px' }}></div>
            <div>
              <label className="fw-bold mb-0 me-1 text-muted small">Accounting Year:</label>
              <div className="text-dark fw-bold">AY {selectedYear.year_name}</div>
            </div>
          </div>

          <div className="text-center flex-grow-1">
            <h3 className="fw-bold mb-0">Debit Note Form</h3>
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
        <div className="mt-4"></div>
        <div className="card shadow p-3 mb-3">
          <div className="row mb-3">

            <div className="col-md-6 mb-2 position-relative">

              <div className="d-flex justify-content-between align-items-center">

                <label className="form-label mb-0">Customer Name</label>
                <button
                  type="button"
                  className="btn btn-outline-success btn-sm"
                  style={{ padding: "0.25rem 0.5rem", fontSize: "0.6rem" }}
                  onClick={() => window.open("/customers", "_blank")}
                >
                  +
                </button>
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
                onKeyDown={handleCustomerKeyDown}
                className="form-control mt-1"
                autoComplete="off"
              />

              {suggestions.length > 0 && (
                <ul
                  className="list-group position-absolute w-100 shadow"
                  style={{
                    zIndex: 1050,
                    top: "100%",
                    marginTop: "4px"
                  }}
                >
                  {suggestions.map((cust, index) => {
                    const display =
                      cust.customer_name || cust.supplier_name || cust.name || cust.id || "Unknown";

                    return (
                      <li
                        key={cust.id ?? index}
                        className={`list-group-item list-group-item-action ${customerSuggestionIndex === index ? "active" : ""}`}
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          selectSupplier(cust);
                          setSuggestions([]); // 👈 close dropdown
                        }}
                      >
                        {display} <small className="text-muted">({cust.type})</small>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>




            <div className="col-md-6 mb-2 position-relative">
              <label className="form-label">Ship to </label>
              <input
                type="text"
                name="ship_to"
                value={debitnote.ship_to}
                onChange={handleShipToInput}
                onKeyDown={handleShipToKeyDown}
                className="form-control"
                autoComplete="off"
                placeholder="Type customer name..."
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
              <label className="form-label">Debit Note Date</label>
              <input
                type="date"
                name="debit_note_date"
                value={debitnote.debit_note_date}
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
                value={debitnote.due_date}
                onChange={handleHeaderChange}
                className="form-control"
              />
            </div>
            <div className="col-md-6 mb-2">
              <label className="form-label">Purchase No</label>

              <div className="d-flex gap-2">
                <select
                  className="form-select"
                  value={selectedPurchase}
                  onChange={(e) => setSelectedPurchase(e.target.value)}
                  disabled={purchaseList.length === 0}
                >
                  <option value="">
                    {purchaseList.length === 0
                      ? "No Purchase found"
                      : "Select Purchase"}
                  </option>

                  {purchaseList.map((pur, i) => (
                    <option key={i} value={pur.id}>
                      {pur.id}
                    </option>
                  ))}
                </select>

                <button
                  className="btn btn-primary"
                  disabled={!selectedPurchase}
                  onClick={loadPurchase}
                >
                  Load
                </button>
              </div>
            </div>
            <div className="col-md-6 mb-2 position-relative">

              <label className="form-label">Purchase Person</label>

              {/* + button at top-right corner of select */}
              <button
                type="button"
                className="btn btn-outline-success btn-sm position-absolute"
                style={{
                  top: "5px",   // aligns with select top
                  right: "14px",
                  padding: "0.25rem 0.5rem",
                  fontSize: "0.6rem",
                  zIndex: 5
                }}
                onClick={() => window.open("/employee", "_blank")}
              >
                +
              </button>

              <select
                name="purchase_person"
                value={debitnote.sales_person}
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
              <label className="form-label">Mobile</label>
              <input
                type="text"
                name="mobile"
                value={debitnote.mobile}
                onChange={handleHeaderChange}
                className="form-control"
              />
            </div>
            <div className="col-md-12 mb-2">
              <label className="form-label">Address</label>
              <textarea
                name="billing_address"
                value={debitnote.billing_address}
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
              checked={debitnote.igst}
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
              {debitnote.items.map((item, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>

                  {/* SKU / Autocomplete */}
                  <td className="position-relative" style={{ overflow: "visible", position: "relative" }}>
                    <div style={{ position: "relative", width: "100%" }}>
                      <input
                        name="sku"
                        value={item.sku}
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

                          {productSuggestions
                            .map((p, i) => (
                              <li
                                key={i}
                                className={`list-group-item list-group-item-action d-flex justify-content-between py-1 px-2 ${suggestionIndex === i ? "active" : ""}`}
                                onMouseDown={() => selectProduct(index, p)}
                                style={{ cursor: "pointer", fontSize: "0.85rem" }}
                              >
                                <span style={{ width: "60%" }}>{p.sku} {p.barcode ? `(${p.barcode})` : ""}</span>
                                <span style={{ width: "40%", textAlign: "right" }}>{p.current_stock ?? 0}</span>
                              </li>
                            ))}
                        </ul>
                      )}
                    </div>
                  </td>

                  {/* Qty */}
                  <td>
                    <input
                      name="qty"
                      type="text"
                      value={item.qty}
                      onChange={(e) => handleItemChange(index, e)}
                      className="form-control form-control-sm"
                    />
                  </td>

                  {/* Rate */}
                  <td>
                    <input
                      name="rate"
                      type="text"
                      value={item.rate}
                      onChange={(e) => handleItemChange(index, e)}
                      className="form-control form-control-sm"
                    />
                  </td>

                  {/* Discount Value */}
                  <td>
                    <input
                      name="disc_val"
                      type="text"
                      value={item.disc_val}
                      onChange={(e) => handleItemChange(index, e)}
                      className="form-control form-control-sm"
                    />
                  </td>

                  {/* Discount % */}
                  <td>
                    <input
                      name="disc_percent"
                      type="text"
                      value={item.disc_percent}
                      onChange={(e) => handleItemChange(index, e)}
                      className="form-control form-control-sm"
                    />
                  </td>

                  {/* GST % */}
                  <td>
                    <input
                      name="gst_percent"
                      type="text"
                      value={item.gst_percent}
                      onChange={(e) => handleItemChange(index, e)}
                      className="form-control form-control-sm"
                    />
                  </td>

                  {/* Total */}
                  <td>
                    <input
                      value={Number(item.total || 0).toFixed(2)}
                      readOnly
                      className="form-control form-control-sm text-end"
                    />
                  </td>

                  {/* Remove */}
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

            {/* ✅ TOTAL QTY ROW (ADDED BY REQUEST) */}
            <tfoot>
              <tr>
                <td colSpan="2" className="fw-bold text-end">Total Qty:</td>
                <td className="fw-bold">
                  {
                    (() => {
                      const qtyTotal = debitnote.items.reduce(
                        (sum, item) => sum + Number(item.qty || 0),
                        0
                      );

                      debitnote.total_qty = qtyTotal; // ✅ store inside debitnote object

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
        <br />
        <br />


        {/* Totals Section */}
        <div className="border p-3 bg-light">

          <div className="d-flex justify-content-between mb-2">
            <label>Sub Total:</label>
            <input
              value={debitnote.net_total.toFixed(2)}
              readOnly
              className="form-control form-control-sm text-end w-25"
            />
          </div>

          <div className="d-flex justify-content-between mb-2">
            <label>Discount Total:</label>
            <input
              value={debitnote.discount_total.toFixed(2)}
              readOnly
              className="form-control form-control-sm text-end w-25"
            />
          </div>

          {debitnote.igst ? (
            <div className="d-flex justify-content-between mb-2">
              <label>IGST:</label>
              <input
                value={debitnote.gst_total.toFixed(2)}
                readOnly
                className="form-control form-control-sm text-end w-25"
              />
            </div>
          ) : (
            <>
              <div className="d-flex justify-content-between mb-2">
                <label>CGST:</label>
                <input
                  value={(debitnote.gst_total / 2).toFixed(2)}
                  readOnly
                  className="form-control form-control-sm text-end w-25"
                />
              </div>
              <div className="d-flex justify-content-between mb-2">
                <label>SGST:</label>
                <input
                  value={(debitnote.gst_total / 2).toFixed(2)}
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
              value={debitnote.round_off.toFixed(2)}
              readOnly
              className="form-control form-control-sm text-end w-25"
            />
          </div>

          <div className="d-flex justify-content-between">
            <label className="fw-bold text-primary">Grand Total:</label>
            <input
              value={debitnote.grand_total.toFixed(2)}
              readOnly
              className="form-control form-control-sm text-end w-25 fw-bold text-primary"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="text-center mt-4">
          {selectedYear.is_closed ? (
            <div className="alert alert-danger d-inline-block px-5 py-2 fw-bold shadow-sm" style={{ borderRadius: '50px' }}>
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              Cannot save: This Accounting Year is locked.
            </div>
          ) : (
            <>
              <button className="btn btn-success px-5 py-2 me-2 fw-bold shadow-sm rounded-pill" onClick={saveDebitnote}>
                Save Debit Note
              </button>
              <button className="btn btn-outline-secondary px-4 py-2 fw-bold rounded-pill" onClick={clearForm}>
                Clear
              </button>
            </>
          )}
        </div>
      </div>
    </div>

  );

}

export default DebitnoteForm;
