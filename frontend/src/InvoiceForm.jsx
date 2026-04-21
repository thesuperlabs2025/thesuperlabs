import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate, useLocation } from "react-router-dom";
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
    customer_id: "",
    customer_name: "",
    mobile: "",
    billing_address: "",
    gst: "",
    sales_person: "",
    agent_name: "",
    invoice_date: new Date().toISOString().substring(0, 10),
    due_date: new Date(Date.now() + 86400000 * 1).toISOString().substring(0, 10),
    transport_name: "",
    dc_no: "",
    manual_invoice_no: "",
    place_of_delivery: "",
    terms: ""
  },
  items: [{ ...initialItem }],
  discount_total: 0.0,
  gst_total: 0.0,
  net_total: 0.0,
  grand_total: 0.0,
  round_off: 0.0,
  igst: false,
  customer_id: "",
  customer_name: "",
  mobile: "",
  billing_address: "",
  gst: "",
  sales_person: "",
  agent_name: "",
  invoice_date: new Date().toISOString().substring(0, 10),
  due_date: new Date(Date.now() + 86400000 * 1).toISOString().substring(0, 10),
  transport_name: "",
  dc_no: "",
  manual_invoice_no: "",
  place_of_delivery: "",
  terms: "",
  tds: 0,
  tds_percent: 0,
  tds_amount: 0,
  tcs_percent: 0,
  tcs_amount: 0,
  payment_type: "credit", // cash or credit
  mode_of_payment: "", // for cash invoices
  bank_account: "", // for cash invoices
  staff_name: "", // for cash invoices
  upi_id: "",      // NEW: for Gpay invoices
  is_sku: 1,      // Template setting
  is_inclusive: 0, // Template setting
  job_inward_id: null,
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
    // Inclusive tax: amountAfterDiscount includes GST
    // Net = Gross / (1 + Tax%/100)
    afterDiscount = amountAfterDiscount / (1 + gstPercent / 100);
    gstAmount = amountAfterDiscount - afterDiscount;
  } else {
    // Exclusive tax: amountAfterDiscount is the taxable base
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

  const tds_amount = +(before_tax * tdsPercent / 100).toFixed(2);
  const tcs_amount = +(before_tax * tcsPercent / 100).toFixed(2);

  const final_before_round =
    before_tax - tds_amount + tcs_amount;

  const round_off =
    +(Math.round(final_before_round) - final_before_round).toFixed(2);

  const grand_total =
    +(final_before_round + round_off).toFixed(2);

  return {
    net_total,
    discount_total,
    gst_total,
    tds_amount,
    tcs_amount,     // ✅ THIS WAS MISSING
    round_off,
    grand_total
  };
};




// Then call it AFTER definition



function InvoiceForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const [invoice, setInvoice] = useState(getInitialState());
  const [suggestions, setSuggestions] = useState([]);
  const [employee_name, setEmployeename] = useState([]);
  const [agents, setAgents] = useState([]);
  const [productSuggestions, setProductSuggestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);
  const [suggestionIndex, setSuggestionIndex] = useState(-1);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [outstanding, setOutstanding] = useState(0);
  const [invoiceNo, setInvoiceNo] = useState("");

  const [priceLists, setPriceLists] = useState([]);
  const [selectedPriceList, setSelectedPriceList] = useState("");
  const [customerHasPriceList, setCustomerHasPriceList] = useState(false);
  const [modeofpayment, setModeofpayment] = useState([]);
  const [bankaccount, setBankaccount] = useState([]);
  const [shipToSuggestions, setShipToSuggestions] = useState([]);  // NEW: for ship_to autocomplete
  const [customerSuggestionIndex, setCustomerSuggestionIndex] = useState(-1);
  const [shipToSuggestionIndex, setShipToSuggestionIndex] = useState(-1);

  // Set page title
  useEffect(() => {
    document.title = `Invoice ${invoiceNo || 'New'} - TSL ERP`;
  }, [invoiceNo]);

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
  }, [invoice.items, invoice.tds_percent, invoice.tcs_percent, invoice.is_inclusive]);










  // ✅ add invoice.tds as dependency




  useEffect(() => {
    fetchInvoiceNo();
  }, []);
  const fetchInvoiceNo = async () => {
    try {
      const res = await axios.get(`${API}/invoices/next-invoice-no`);
      setInvoiceNo(res.data.invoiceNo);
    } catch (err) {
      console.error("Failed to load invoice number", err);
    }
  };

  const selectedYear = JSON.parse(localStorage.getItem("selectedYear") || "{}");












  // New name for select customer
  const outstandingCustomer = async (cust) => {
    try {
      const name = cust.customer_name ?? cust.name;

      // Use the name directly in the URL
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/outstanding/${encodeURIComponent(name)}`
      );

      // Expecting API to return { outstanding_balance: number }
      setOutstanding(Number(res.data.outstanding_balance) || 0);

    } catch (err) {
      console.error("Outstanding fetch error:", err);
      setOutstanding(0);
    }
  };







  useEffect(() => {
    if (location.state && location.state.convertData) {
      const data = location.state.convertData;
      setInvoice(prev => {
        const newState = {
          ...prev,
          customer_id: data.customer_id || prev.customer_id,
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
          })) : prev.items,
          job_inward_id: data.job_inward_id || prev.job_inward_id
        };

        // Recalculate totals for the converted items
        const totals = calculateTotals(newState.items, Number(newState.tds_percent || 0), Number(newState.tcs_percent || 0), newState.is_inclusive);
        return { ...newState, ...totals };
      });

      if (data.customer_name) {
        outstandingCustomer({ customer_name: data.customer_name });
      }
    }
  }, [location.state]);

  useEffect(() => {
    axios.get(`${API}/templates`)
      .then((res) => {
        const templates = res.data;

        // ⭐ Find invoice template
        const invoiceTpl = templates.find(
          (t) => t.template_name.toLowerCase() === "invoice"
        );

        if (!invoiceTpl || !invoiceTpl.stock_action) {
          setError("No valid 'invoice' template found.");
          setInvoice((prev) => ({
            ...prev,
            template_id: null,
            stock_action: null,
          }));
          return;
        }

        // ✅ Valid invoice template
        setInvoice((prev) => ({
          ...prev,
          stock_action: invoiceTpl.stock_action,
          template_id: invoiceTpl.id,
          is_sku: invoiceTpl.is_sku,
          is_inclusive: invoiceTpl.is_inclusive,
        }));

        setError("");
      })
      .catch((err) => {
        console.error("Error fetching template:", err);
        setError("Error fetching templates from server.");
      });
  }, []);




  // --- Fetch employees, agents, and price lists ---
  useEffect(() => {
    axios
      .get(`${API}/employees`)
      .then((res) => setEmployeename(res.data))
      .catch((err) => console.error("Error fetching employees:", err));

    axios
      .get(`${API}/agents`)
      .then((res) => setAgents(res.data))
      .catch((err) => console.error("Error fetching agents:", err));

    axios
      .get(`${API}/pricelist-master`)
      .then((res) => setPriceLists(res.data))
      .catch((err) => console.error("Error fetching price lists:", err));

    axios
      .get(`${API}/modeofpayment`)
      .then((res) => setModeofpayment(res.data))
      .catch((err) => console.error("Error fetching mode of payment:", err));

    axios
      .get(`${API}/bankaccount`)
      .then((res) => setBankaccount(res.data))
      .catch((err) => console.error("Error fetching bank accounts:", err));
  }, []);

  // --- Auto calculate totals ---
  // useEffect(() => {
  //   const totals = calculateTotals(invoice.items);
  //   setInvoice((prev) => ({ ...prev, ...totals }));
  // }, [invoice.items]);

  // --- Header change ---
  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    setInvoice((prev) => ({
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
        const res = await axios.get(`${API}/customers?term=${encodeURIComponent(value)}`);
        setSuggestions(res.data.slice(0, 10));
        setCustomerSuggestionIndex(-1);
      } catch (err) {
        console.error("Error fetching customer suggestions:", err);
      }
    } else {
      setSuggestions([]);
    }
  };

  const selectCustomer = (customer) => {
    setInvoice(prev => ({
      ...prev,
      customer_id: customer.id,
      customer_name: customer.customer_name || customer.name || "",
      ship_to: customer.customer_name || customer.name || "",  // Auto-populate ship_to
      mobile: customer.mobile || "",
      billing_address: customer.billing_address || "",
      gst: customer.gst || 0,
      discount: customer.disc_val || 0,
      igst: customer.igst || "",
      tds_percent: Number(customer.tds || 0),
      tcs_percent: Number(customer.tcs || 0),
    }));

    // Auto-select price list if customer has one assigned
    console.log("Customer price_list:", customer.price_list);
    console.log("Available price lists:", priceLists);

    if (customer.price_list && customer.price_list.trim() !== "") {
      const matchingList = priceLists.find(list => list.name === customer.price_list);
      console.log("Matching list found:", matchingList);

      if (matchingList) {
        setSelectedPriceList(matchingList.id);
        setCustomerHasPriceList(true); // Mark as customer-assigned
        console.log("Price list set to:", matchingList.id, matchingList.name);
      } else {
        setSelectedPriceList("");
        setCustomerHasPriceList(false);
        console.log("No matching price list found");
      }
    } else {
      setSelectedPriceList("");
      setCustomerHasPriceList(false);
      console.log("Customer has no price list");
    }

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

  // NEW: Ship To autocomplete handler
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
    setInvoice(prev => ({
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


  // --- Product autocomplete ---
  const handleProductInput = async (index, e) => {
    const value = e.target.value;
    const newItems = [...invoice.items];
    newItems[index].sku = value;
    setInvoice((prev) => ({ ...prev, items: newItems }));
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


  const selectProduct = async (index, product) => {
    const isDuplicate = invoice.items.some(
      (item, i) => i !== index && item.product_name === product.product_name
    );
    if (isDuplicate) {
      alert("This product is already added!");
      setProductSuggestions([]);
      return;
    }

    const newItems = [...invoice.items];
    newItems[index].product_name = product.product_name || "";
    newItems[index].sku = product.sku || "";

    // If a price list is selected, fetch pricing from that list
    if (selectedPriceList) {
      try {
        const res = await axios.get(`${API}/pricelist-details/product/${selectedPriceList}/${product.id}`);
        const priceData = res.data;
        newItems[index].rate = priceData.selling_price || product.selling_price || 0;
        newItems[index].disc_percent = priceData.discount || 0;
        newItems[index].gst_percent = priceData.gst || product.gst || 0;
      } catch (err) {
        console.error("Error fetching price list data:", err);
        // Fallback to default product pricing
        newItems[index].rate = product.selling_price || product.mrp || 0;
        newItems[index].disc_percent = product.discount || 0;
        newItems[index].gst_percent = product.gst || 0;
      }
    } else {
      // Use default product pricing
      newItems[index].rate = product.selling_price || product.mrp || 0;
      newItems[index].disc_percent = product.discount || 0;
      newItems[index].gst_percent = product.gst || 0;
    }

    const { total } = calculateItemTotal(newItems[index], invoice.is_inclusive);
    newItems[index].total = parseFloat(total.toFixed(2));
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

  // --- Item change handler ---
  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const newItems = [...invoice.items];
    newItems[index][name] = value;
    const { total } = calculateItemTotal(newItems[index], invoice.is_inclusive);
    newItems[index].total = parseFloat(total.toFixed(2));
    setInvoice((prev) => ({ ...prev, items: newItems }));
  };

  // --- Add / Remove rows ---
  const addItem = () =>
    setInvoice((prev) => ({
      ...prev,
      items: [...prev.items, { ...initialItem }],
    }));

  const removeItem = (index) => {
    if (invoice.items.length > 1) {
      const newItems = invoice.items.filter((_, i) => i !== index);
      setInvoice((prev) => ({ ...prev, items: newItems }));
    }
  };


  const saveInvoice = async () => {
    // 🛑 Stop if no template
    if (invoice.template_id == null) {
      setError("Cannot save invoice: valid 'invoice' template not selected.");
      return;
    }

    if (!invoice.items || invoice.items.length === 0) {
      setError("Cannot save invoice: No items added.");
      return;
    }

    if (selectedYear.is_closed) {
      setError("Error: This Accounting Year is locked and cannot be modified.");
      return;
    }

    const invDate = new Date(invoice.invoice_date);
    const startDate = new Date(selectedYear.start_date);
    const endDate = new Date(selectedYear.end_date);
    if (invDate < startDate || invDate > endDate) {
      if (!window.confirm(`Warning: Invoice date is outside the selected Accounting Year (AY ${selectedYear.year_name}). Do you want to proceed?`)) {
        return;
      }
    }

    // SKU Validation based on template
    if (invoice.is_sku === 1) {
      const missingSku = invoice.items.some(item => !item.sku || item.sku.trim() === "");
      if (missingSku) {
        setError("SKU is required for all items in this template.");
        return;
      }
    }

    // --- CHECK FOR MANUAL INVOICE NO DUPLICATION ---
    if (invoice.header.manual_invoice_no) {
      try {
        const checkRes = await axios.get(`${API}/invoices/check-manual-no/${invoice.header.manual_invoice_no}`);
        if (checkRes.data.exists) {
          setError(`Manual Invoice No ${invoice.header.manual_invoice_no} already exists!`);
          return;
        }
      } catch (err) {
        console.error("Manual No Check Error:", err);
      }
    }

    try {
      const res = await axios.post(`${API}/invoices`, {
        customer_name: invoice.customer_name,
        ship_to: invoice.ship_to,
        mobile: invoice.mobile,
        invoice_date: toDMY(invoice.invoice_date),
        due_date: toDMY(invoice.due_date),
        sales_person: invoice.sales_person,
        billing_address: invoice.billing_address,
        sku: invoice.sku,
        total_qty: invoice.total_qty,
        discount_total: invoice.discount_total,
        gst_total: invoice.gst_total,
        net_total: invoice.net_total,
        tds: invoice.tds_amount,
        tds_percent: invoice.tds_percent,
        tcs: invoice.tcs_amount,
        tcs_percent: invoice.tcs_percent,
        grand_total: invoice.grand_total,
        transport_name: invoice.header.transport_name,
        dc_no: invoice.header.dc_no,
        manual_invoice_no: invoice.header.manual_invoice_no,
        place_of_delivery: invoice.header.place_of_delivery,
        terms: invoice.header.terms,
        items: invoice.items,
        template_id: invoice.template_id,
        payment_type: invoice.payment_type, // Send payment type to backend
        mode_of_payment: invoice.mode_of_payment,
        bank_account: invoice.bank_account,
        staff_name: invoice.staff_name,
        is_sku: invoice.is_sku,
        is_inclusive: invoice.is_inclusive,
        job_inward_id: invoice.job_inward_id,
        upi_id: invoice.upi_id,
        year_id: selectedYear.year_id
      });

      // If it's a cash invoice, create a receipt automatically
      if (invoice.payment_type === "cash") {
        try {
          await axios.post(`${API}/receipts`, {
            customer_name: invoice.customer_name,
            TransactionDate: invoice.invoice_date, // Use invoice date as transaction date (YYYY-MM-DD format)
            TransactionAmount: invoice.grand_total, // Use grand total as transaction amount
            ModeOfPayment: invoice.mode_of_payment || "Cash", // Use selected mode or default to Cash
            PaymentAgainst: "Invoice",
            ReferenceNo: invoice.header.manual_invoice_no || invoiceNo, // Use the invoice number
            BankAccountName: invoice.bank_account || "", // Bank account from invoice
            StaffName: invoice.staff_name || "", // Staff name from invoice
            upi_id: invoice.upi_id || "", // NEW: UPI Id
            Details: `Auto-generated receipt for Cash Invoice`,
          });
          setSuccess("Cash Invoice and Receipt saved successfully!");
        } catch (receiptErr) {
          console.error("Error creating receipt:", receiptErr);
          setError("Invoice saved but failed to create receipt. Please create receipt manually.");
          return;
        }
      } else {
        setSuccess(res.data.message || "Invoice saved successfully!");
      }

      // Keep template ID + stock action after reset
      setInvoice((prev) => ({
        ...getInitialState(),
        stock_action: prev.stock_action,
        template_id: prev.template_id,
      }));

      setTimeout(() => navigate("/invoicemy"), 1000);
    } catch (err) {
      console.error("Error saving invoice:", err.response?.data || err.message);
      setError(err.response?.data?.error || "Error saving invoice");
    }
  };


  function toDMY(dateString) {
    if (!dateString || !dateString.includes("-")) return "";
    const [y, m, d] = dateString.split("-");
    return `${d}-${m}-${y}`;
  }




  // --- Clear form ---
  const clearForm = () => {
    if (window.confirm("Clear form?")) setInvoice(getInitialState());
  };

  const toggleIGST = () => {
    setInvoice(prev => ({
      ...prev,
      igst: !prev.igst
    }));
  };



  return (


    <div className="container my-4">
      {success && (
        <div
          className="toast align-items-center text-white bg-success border-0 show position-fixed top-0 end-0 m-3"
          role="alert"
          style={{ zIndex: 99999 }}
        >
          <div className="d-flex">
            <div className="toast-body">
              <i className="bi bi-exclamation-circle me-2"></i>
              {success}
            </div>
            <button
              type="button"
              className="btn-close btn-close-white me-2 m-auto"
              onClick={() => setSuccess("")}
            ></button>
          </div>
        </div>
      )}

      {error && (
        <div
          className="toast align-items-center text-white bg-danger border-0 show position-fixed top-0 end-0 m-3"
          role="alert"
          style={{ zIndex: 99999 }}
        >
          <div className="d-flex">
            <div className="toast-body">
              <i className="bi bi-exclamation-circle me-2"></i>
              {error}
            </div>
            <button
              type="button"
              className="btn-close btn-close-white me-2 m-auto"
              onClick={() => setError("")}
            ></button>
          </div>
        </div>
      )}



      <div className="card shadow p-4 w-90">
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
              gap: "15px"
            }}
          >
            <div className="d-flex align-items-center gap-3">
              <div>
                <label className="fw-bold mb-0 me-1">Invoice No:</label>
                <span>{invoiceNo || "Loading..."}</span>
              </div>
              <div className="vr" style={{ height: '30px' }}></div>
              <div>
                <label className="fw-bold mb-0 me-1 text-muted small">Accounting Year:</label>
                <span className="text-dark fw-bold small">AY {selectedYear.year_name}</span>
              </div>
              {selectedYear.is_closed ? (
                <span className="badge bg-danger ms-2 px-2 py-1 rounded-pill small">
                  <i className="bi bi-lock-fill me-1"></i>LOCKED
                </span>
              ) : (
                <span className="badge bg-success ms-2 px-2 py-1 rounded-pill small">
                  <i className="bi bi-unlock-fill me-1"></i>ACTIVE
                </span>
              )}
            </div>

            {/* Stylish Cash/Credit Toggle Switch */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
                padding: "4px",
                borderRadius: "50px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                border: "1px solid rgba(255,255,255,0.3)"
              }}
            >
              <button
                type="button"
                onClick={() => setInvoice(prev => ({ ...prev, payment_type: "cash" }))}
                style={{
                  padding: "4px 16px",
                  borderRadius: "50px",
                  border: "none",
                  fontWeight: "600",
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  background: invoice.payment_type === "cash"
                    ? "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)"
                    : "transparent",
                  color: invoice.payment_type === "cash" ? "#fff" : "#64748b",
                  boxShadow: invoice.payment_type === "cash" ? "0 2px 8px rgba(17, 153, 142, 0.3)" : "none",
                  transform: invoice.payment_type === "cash" ? "scale(1.05)" : "scale(1)"
                }}
              >
                💵 Cash
              </button>
              <button
                type="button"
                onClick={() => setInvoice(prev => ({ ...prev, payment_type: "credit" }))}
                style={{
                  padding: "4px 16px",
                  borderRadius: "50px",
                  border: "none",
                  fontWeight: "600",
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  background: invoice.payment_type === "credit"
                    ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                    : "transparent",
                  color: invoice.payment_type === "credit" ? "#fff" : "#64748b",
                  boxShadow: invoice.payment_type === "credit" ? "0 2px 8px rgba(102, 126, 234, 0.3)" : "none",
                  transform: invoice.payment_type === "credit" ? "scale(1.05)" : "scale(1)"
                }}
              >
                💳 Credit
              </button>
            </div>
            {/* Tax Type Badge */}
            <span className={`badge ${invoice.is_inclusive ? 'bg-info' : 'bg-secondary'}`} style={{ fontSize: '0.75rem' }}>
              {invoice.is_inclusive ? 'Tax Inclusive' : 'Tax Exclusive'}
            </span>
          </div>

          {/* Invoice Form centered */}
          <h3 className="mb-0 text-center" style={{ lineHeight: "2rem" }}>
            Invoice Form
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
                <button
                  type="button"
                  className="btn btn-outline-success btn-sm"
                  style={{ padding: "0.25rem 0.5rem", fontSize: "0.6rem" }}
                  onClick={() => window.open("/customers", "_blank")}
                >
                  +
                </button>

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
                  className="list-group position-absolute w-100 shadow-lg"
                  style={{
                    zIndex: 1050,
                    top: "100%",
                    marginTop: "4px",
                    maxHeight: "300px",
                    overflowY: "auto",
                    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
                  }}
                >
                  {suggestions.map((cust, index) => {
                    const display = cust.customer_name || cust.name || cust.id || "Unknown";

                    return (
                      <li
                        key={cust.id ?? index}
                        className={`list-group-item list-group-item-action ${customerSuggestionIndex === index ? "active" : ""}`}
                        style={{
                          cursor: "pointer",
                          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
                        }}
                        onClick={() => {
                          selectCustomer(cust);
                          setSuggestions([]);
                        }}
                      >
                        {display}
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
                value={invoice.ship_to}
                onChange={handleShipToInput}
                className="form-control"
                autoComplete="off"
                placeholder="Type customer  name..."
                onKeyDown={handleShipToKeyDown}
                onBlur={() => setTimeout(() => setShipToSuggestions([]), 200)}
              />

              {shipToSuggestions.length > 0 && (
                <ul
                  className="list-group position-absolute w-100 shadow"
                  style={{ zIndex: 1000, top: "100%", maxHeight: "200px", overflowY: "auto" }}
                >
                  {shipToSuggestions.map((cust, index) => {
                    const display = cust.customer_name || cust.name || cust.id || "Unknown";
                    return (
                      <li
                        key={cust.id ?? index}
                        className={`list-group-item list-group-item-action ${shipToSuggestionIndex === index ? "active" : ""}`}
                        style={{ cursor: "pointer" }}
                        onClick={() => selectShipTo(cust)}
                      >
                        {display}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
            <div className="col-md-6 mb-2">
              <label className="form-label">Invoice Date</label>
              <input
                type="date"
                name="invoice_date"
                value={invoice.invoice_date}
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
                value={invoice.due_date}
                onChange={handleHeaderChange}
                className="form-control"
              />
            </div>

            <div className="col-md-6 mb-2 position-relative">

              <label className="form-label">Sales Person</label>

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
                name="sales_person"
                value={invoice.sales_person}
                onChange={handleHeaderChange}
                className="form-select"
              >
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
                value={invoice.mobile}
                onChange={handleHeaderChange}
                className="form-control"
              />
            </div>

            {/* Price List Dropdown - Always visible, readonly if customer-assigned */}
            <div className="col-md-6 mb-2">
              <label className="form-label fw-bold text-primary">
                <i className="bi bi-tags-fill me-2"></i>Price List
              </label>
              <select
                className="form-select shadow-sm"
                value={selectedPriceList}
                onChange={(e) => setSelectedPriceList(e.target.value)}
                disabled={customerHasPriceList}
                style={{
                  backgroundColor: customerHasPriceList ? '#e9ecef' : 'white',
                  cursor: customerHasPriceList ? 'not-allowed' : 'pointer'
                }}
              >
                <option value="">Default Pricing</option>
                {priceLists.map((list) => (
                  <option key={list.id} value={list.id}>
                    {list.name}
                  </option>
                ))}
              </select>
              <small className="text-muted d-block">
                {customerHasPriceList ? (
                  <>
                    <i className="bi bi-lock-fill me-1"></i>
                    Assigned from customer profile
                  </>
                ) : (
                  selectedPriceList ? "Custom pricing applied" : "Using default prices"
                )}
              </small>
            </div>

            <div className="col-md-12 mb-2">
              <label className="form-label">Address</label>
              <textarea
                name="billing_address"
                value={invoice.billing_address}
                onChange={handleHeaderChange}
                className="form-control"

              />
            </div>
          </div>

          {/* Transport & Delivery Details Accordion */}
          <div className="accordion mb-3" id="transportAccordion">
            <div className="accordion-item">
              <h2 className="accordion-header" id="headingTransport">
                <button
                  className="accordion-button collapsed fw-bold"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#collapseTransport"
                  aria-expanded="false"
                  aria-controls="collapseTransport"
                >
                  Other Details
                </button>
              </h2>
              <div
                id="collapseTransport"
                className="accordion-collapse collapse"
                aria-labelledby="headingTransport"
                data-bs-parent="#transportAccordion"
              >
                <div className="accordion-body">
                  <div className="row">
                    {/* Agent Name - Moved here */}
                    <div className="col-md-4 mb-2 position-relative">
                      <label className="form-label text-bold">Agent Name</label>
                      <button
                        type="button"
                        className="btn btn-outline-success btn-sm position-absolute"
                        style={{
                          top: "5px",
                          right: "14px",
                          padding: "0.25rem 0.5rem",
                          fontSize: "0.6rem",
                          zIndex: 5
                        }}
                        onClick={() => window.open("/agent", "_blank")}
                      >
                        +
                      </button>
                      <select
                        name="agent_name"
                        value={invoice.agent_name}
                        onChange={handleHeaderChange}
                        className="form-select"
                      >
                        <option value="">Select Agent</option>
                        {agents.map((agent) => (
                          <option key={agent.id} value={agent.agent_name}>
                            {agent.agent_name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-4 mb-2">
                      <label className="form-label">Transport Name</label>
                      <input
                        type="text"
                        name="transport_name"
                        value={invoice.header.transport_name}
                        onChange={(e) => {
                          const { name, value } = e.target;
                          setInvoice(prev => ({
                            ...prev,
                            header: { ...prev.header, [name]: value }
                          }));
                        }}
                        className="form-control"
                      />
                    </div>
                    <div className="col-md-4 mb-2">
                      <label className="form-label">DC No</label>
                      <input
                        type="text"
                        name="dc_no"
                        value={invoice.header.dc_no}
                        onChange={(e) => {
                          const { name, value } = e.target;
                          setInvoice(prev => ({
                            ...prev,
                            header: { ...prev.header, [name]: value }
                          }));
                        }}
                        className="form-control"
                      />
                    </div>
                    <div className="col-md-4 mb-2">
                      <label className="form-label">Manual Invoice No</label>
                      <input
                        type="text"
                        name="manual_invoice_no"
                        value={invoice.header.manual_invoice_no}
                        onChange={(e) => {
                          const { name, value } = e.target;
                          setInvoice(prev => ({
                            ...prev,
                            header: { ...prev.header, [name]: value }
                          }));
                        }}
                        className="form-control"
                      />
                    </div>
                    <div className="col-md-6 mb-2">
                      <label className="form-label">Place of Delivery</label>
                      <input
                        type="text"
                        name="place_of_delivery"
                        value={invoice.header.place_of_delivery}
                        onChange={(e) => {
                          const { name, value } = e.target;
                          setInvoice(prev => ({
                            ...prev,
                            header: { ...prev.header, [name]: value }
                          }));
                        }}
                        className="form-control"
                      />
                    </div>
                    <div className="col-md-6 mb-2">
                      <label className="form-label">Terms</label>
                      <textarea
                        name="terms"
                        value={invoice.header.terms}
                        onChange={(e) => {
                          const { name, value } = e.target;
                          setInvoice(prev => ({
                            ...prev,
                            header: { ...prev.header, [name]: value }
                          }));
                        }}
                        className="form-control"
                        rows="1"
                      />
                    </div>

                    {/* Mode of Payment */}
                    <div className="col-md-4 mb-2 position-relative">
                      <label className="form-label">Mode of Payment</label>
                      <button
                        type="button"
                        className="btn btn-outline-success btn-sm position-absolute"
                        style={{
                          top: "5px",
                          right: "14px",
                          padding: "0.25rem 0.5rem",
                          fontSize: "0.6rem",
                          zIndex: 5
                        }}
                        onClick={() => window.open("/modeofpayment", "_blank")}
                      >
                        +
                      </button>
                      <select
                        name="mode_of_payment"
                        value={invoice.mode_of_payment}
                        onChange={handleHeaderChange}
                        className="form-select"
                      >
                        <option value="">Select Mode</option>
                        {modeofpayment.map((mode, i) => (
                          <option key={i} value={mode.modeofpayment || mode.ModeOfPayment}>
                            {mode.modeofpayment || mode.ModeOfPayment}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Bank Account */}
                    <div className="col-md-4 mb-2 position-relative">
                      <label className="form-label">Bank Account</label>
                      <button
                        type="button"
                        className="btn btn-outline-success btn-sm position-absolute"
                        style={{
                          top: "5px",
                          right: "14px",
                          padding: "0.25rem 0.5rem",
                          fontSize: "0.6rem",
                          zIndex: 5
                        }}
                        onClick={() => window.open("/bankaccount", "_blank")}
                      >
                        +
                      </button>
                      <select
                        name="bank_account"
                        value={invoice.bank_account}
                        onChange={handleHeaderChange}
                        className="form-select"
                      >
                        <option value="">Select Bank</option>
                        {bankaccount.map((bank, i) => (
                          <option key={i} value={bank.bankaccount}>
                            {bank.bankaccount}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Staff Name */}
                    <div className="col-md-4 mb-2 position-relative">
                      <label className="form-label">Staff Name</label>
                      <button
                        type="button"
                        className="btn btn-outline-success btn-sm position-absolute"
                        style={{
                          top: "5px",
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
                        name="staff_name"
                        value={invoice.staff_name}
                        onChange={handleHeaderChange}
                        className="form-select"
                      >
                        <option value="">Select Staff</option>
                        {employee_name.map((emp) => (
                          <option key={emp.id} value={emp.employee_name}>
                            {emp.employee_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* UPI Id - Visible only when Mode is Gpay */}
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
                  </div>
                </div>
              </div>
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
              checked={invoice.igst}
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
              {invoice.items.map((item, index) => (
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

                          {productSuggestions.map((p, i) => (
                            <li
                              key={i}
                              className={`list-group-item list-group-item-action d-flex justify-content-between py-1 px-2 ${suggestionIndex === i ? "active" : ""}`}
                              onMouseDown={() => selectProduct(index, p)}
                              style={{ cursor: "pointer", fontSize: "0.85rem" }}
                            >
                              <span style={{ width: "70%" }}>{p.sku}</span>
                              <span style={{ width: "30%", textAlign: "right" }}>{p.current_stock ?? 0}</span>
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
                      disabled={invoice.items.length === 1}
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
                      const qtyTotal = invoice.items.reduce(
                        (sum, item) => sum + Number(item.qty || 0),
                        0
                      );

                      invoice.total_qty = qtyTotal; // ✅ store inside invoice object

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
              value={invoice.net_total.toFixed(2)}
              readOnly
              className="form-control form-control-sm text-end w-25"
            />
          </div>

          <div className="d-flex justify-content-between mb-2">
            <label>Discount Total:</label>
            <input
              value={invoice.discount_total.toFixed(2)}
              readOnly
              className="form-control form-control-sm text-end w-25"
            />
          </div>

          {invoice.igst ? (
            <div className="d-flex justify-content-between mb-2">
              <label>IGST:</label>
              <input
                value={invoice.gst_total.toFixed(2)}
                readOnly
                className="form-control form-control-sm text-end w-25"
              />
            </div>
          ) : (
            <>
              <div className="d-flex justify-content-between mb-2">
                <label>CGST:</label>
                <input
                  value={(invoice.gst_total / 2).toFixed(2)}
                  readOnly
                  className="form-control form-control-sm text-end w-25"
                />
              </div>
              <div className="d-flex justify-content-between mb-2">
                <label>SGST:</label>
                <input
                  value={(invoice.gst_total / 2).toFixed(2)}
                  readOnly
                  className="form-control form-control-sm text-end w-25"
                />
              </div>
            </>
          )}
          {(Number(invoice.tds_percent) > 0 || Number(invoice.tds_amount) > 0) && (
            <div className="d-flex justify-content-between mb-2">
              <label>
                TDS ({Number(invoice.tds_percent || 0)}%):
              </label>
              <input
                value={Number(invoice.tds_amount || 0).toFixed(2)}
                readOnly
                className="form-control form-control-sm bold text-end w-25"
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


          {/* ✅ Added Round Off */}
          <div className="d-flex justify-content-between mb-2">
            <label>Round Off:</label>
            <input
              value={invoice.round_off.toFixed(2)}
              readOnly
              className="form-control form-control-sm text-end w-25"
            />
          </div>

          <div className="d-flex justify-content-between">
            <label className="fw-bold text-primary">Grand Total:</label>
            <input
              value={Number(invoice.grand_total || 0).toFixed(2)}
              readOnly
              className="form-control form-control-sm fw-bold text-end w-25"
            />

          </div>
        </div>

        {/* Buttons */}
        <div className="text-center mt-4">
          {selectedYear.is_closed ? (
            <div className="alert alert-danger d-inline-block py-2 px-4 shadow-sm">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              Cannot save: This Accounting Year is locked.
            </div>
          ) : (
            <button className="btn btn-success me-2 px-4 fw-bold shadow-sm" onClick={saveInvoice}>
              <i className="bi bi-save me-2"></i>Save Invoice
            </button>
          )}
          <button className="btn btn-secondary px-4 ms-2" onClick={clearForm}>
            Clear
          </button>
        </div>
      </div>

    </div>

  );

}

export default InvoiceForm;
