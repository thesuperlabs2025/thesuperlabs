import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
const API = process.env.REACT_APP_API_URL;
// Dropdown data


function EditCustomer() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Form state
  const [values, setValues] = useState({
    name: "", display_name: "", mobile: "", gst_tin: "", whatsapp_no: "", email: "", pan: '', tan: '', cin: '', gst: "yes",
    igst: '', discount: "", contact_type: "", credit_limit: "", credit_days: "", agent_name: "",
    agent_percentage: "", tds: "", tcs: '', price_list: "", receivable_opening_balance: "", payable_opening_balance: "", bank_name: '',
    branch: '', account_number: '', ifsc_code: '', upi_name: '', upi_id: '', billing_address: "", billing_country: "", billing_state: "", billing_city: "", billing_zip: "",
    shipping_address: "", shipping_country: "", shipping_state: "", shipping_city: "", shipping_zip: ""
  });


  const [sameAsBilling, setSameAsBilling] = useState(false);
  const [sameAsName, setSameAsName] = useState(true);
  const [countries, setCountry] = useState([]);
  const [billingStates, setBillingStates] = useState([]);
  const [billingCities, setBillingCities] = useState([]);

  const [shippingStates, setShippingStates] = useState([]);
  const [shippingCities, setShippingCities] = useState([]);
  const [agents, setAgents] = useState([]);
  const [priceLists, setPriceLists] = useState([]);
  const tdsEnabled = values.tds && values.tds.trim() !== "";
  const tcsEnabled = values.tcs && values.tcs.trim() !== "";
  const GST_REGEX =
    /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

  const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  const TAN_REGEX = /^[A-Z]{4}[0-9]{5}[A-Z]{1}$/;
  const [errors, setErrors] = useState({
    gst: "",
    pan: "",
    tan: ""
  });
  const [valid, setValid] = useState({
    gst: false,
    pan: false,
    tan: false
  });



  useEffect(() => {
    const hasGst =
      values.gst_tin?.trim() !== "" ||
      values.cin?.trim() !== "";

    setValues(prev => ({
      ...prev,
      gst: hasGst ? "yes" : "no"
    }));
  }, [values.gst_tin, values.cin]);

  useEffect(() => {
    if (values.tds === undefined || values.tds === null) return;

    // allow empty
    if (values.tds === "") return;

    // allow only numbers (0–100)
    const num = Number(values.tds);

    if (isNaN(num) || num < 0 || num > 100) {
      setValues(prev => ({
        ...prev,
        tds: ""
      }));
    }
  }, [values.tds]);


  useEffect(() => {
    if (values.tcs === undefined || values.tcs === null) return;

    // allow empty
    if (values.tcs === "") return;

    // allow only numbers (0–100)
    const num = Number(values.tcs);

    if (isNaN(num) || num < 0 || num > 100) {
      setValues(prev => ({
        ...prev,
        tcs: ""
      }));
    }
  }, [values.tcs]);



  // Fetch customer details by ID
  useEffect(() => {
    axios.get(`${API}/customers/${id}`)
      .then(res => {
        setValues(res.data || {});
        setSameAsName(res.data.display_name === res.data.name);
        setSameAsBilling(
          res.data.shipping_address === res.data.billing_address &&
          res.data.shipping_country === res.data.billing_country &&
          res.data.shipping_state === res.data.billing_state &&
          res.data.shipping_city === res.data.billing_city &&
          res.data.shipping_zip === res.data.billing_zip
        );
      })
      .catch(err => console.error(err));
  }, [id]);


  useEffect(() => {
    fetchCountry();
    fetchAgents();
    fetchPriceLists();
  }, []);

  useEffect(() => {
    if (values.billing_country) {
      const country = countries.find(c => c.name === values.billing_country);
      if (country) {
        axios.get(`${API}/states/${country.id}`).then(res => {
          setBillingStates(res.data);
        });
      }
    }
  }, [values.billing_country, countries]);
  useEffect(() => {
    if (values.billing_state && billingStates.length > 0) {
      const state = billingStates.find(
        s => s.name === values.billing_state
      );

      if (state) {
        axios
          .get(`${API}/cities/${state.id}`)
          .then(res => setBillingCities(res.data));
      }
    }
  }, [values.billing_state, billingStates]);

  useEffect(() => {
    if (values.shipping_country && countries.length) {
      const country = countries.find(c => c.name === values.shipping_country);
      if (country) {
        axios.get(`${API}/states/${country.id}`)
          .then(res => setShippingStates(res.data));
      }
    }
  }, [values.shipping_country, countries]);

  useEffect(() => {
    if (values.shipping_state && shippingStates.length) {
      const state = shippingStates.find(s => s.name === values.shipping_state);
      if (state) {
        axios.get(`${API}/cities/${state.id}`)
          .then(res => setShippingCities(res.data));
      }
    }
  }, [values.shipping_state, shippingStates]);



  const fetchCountry = async () => {
    const res = await axios.get(`${API}/countries`);
    setCountry(res.data);
  };

  const fetchAgents = async () => {
    try {
      const res = await axios.get(`${API}/agents`);
      setAgents(res.data);
    } catch (err) {
      console.error("Error fetching agents:", err);
    }
  };

  const fetchPriceLists = async () => {
    try {
      const res = await axios.get(`${API}/pricelist-master`);
      setPriceLists(res.data);
    } catch (err) {
      console.error("Error fetching price lists:", err);
    }
  };
  // Handle updates
  const handleChange = async (e) => {
    const { name, value } = e.target;

    setValues(prev => ({ ...prev, [name]: value }));

    // ================= BILLING =================

    if (name === "billing_country") {
      setBillingStates([]);
      setBillingCities([]);

      const country = countries.find(c => c.name === value);
      if (country) {
        const res = await axios.get(`${API}/states/${country.id}`);
        setBillingStates(res.data);
      }
    }

    if (name === "billing_state") {
      setBillingCities([]);

      const state = billingStates.find(s => s.name === value);
      if (state) {
        const res = await axios.get(`${API}/cities/${state.id}`);
        setBillingCities(res.data);
      }
    }

    // ================= SHIPPING =================

    if (name === "shipping_country") {
      setShippingStates([]);
      setShippingCities([]);

      const country = countries.find(c => c.name === value);
      if (country) {
        const res = await axios.get(`${API}/states/${country.id}`);
        setShippingStates(res.data);
      }
    }

    if (name === "shipping_state") {
      setShippingCities([]);

      const state = shippingStates.find(s => s.name === value);
      if (state) {
        const res = await axios.get(`${API}/cities/${state.id}`);
        setShippingCities(res.data);
      }
    }
  };


  const handleNameChange = e => {
    const val = e.target.value;

    setValues(prev => ({
      ...prev,
      name: val,
      display_name: sameAsName ? val : prev.display_name
    }));
  };


  const handleDisplayCheckbox = e => {
    const checked = e.target.checked;
    setSameAsName(checked);
    if (checked) setValues(prev => ({ ...prev, display_name: prev.name }));
  };

  const handleDisplayChange = e => {
    if (!sameAsName) setValues(prev => ({ ...prev, display_name: e.target.value }));
  };

  const handleSameAsBilling = e => {
    const checked = e.target.checked;
    setSameAsBilling(checked);
    if (checked) {
      setValues(prev => ({
        ...prev,
        shipping_address: prev.billing_address,
        shipping_country: prev.billing_country,
        shipping_state: prev.billing_state,
        shipping_city: prev.billing_city,
        shipping_zip: prev.billing_zip
      }));
    }
  };

  // const handleBillingChange = (field, val) => {
  //   setValues(prev => {
  //     const newValues = { ...prev, [field]: val };
  //     if (sameAsBilling) {
  //       return {
  //         ...newValues,
  //         shipping_address: newValues.billing_address,
  //         shipping_country: newValues.billing_country,
  //         shipping_state: newValues.billing_state,
  //         shipping_city: newValues.billing_city,
  //         shipping_zip: newValues.billing_zip
  //       };
  //     }
  //     return newValues;
  //   });
  // };

  const handleSubmit = e => {
    e.preventDefault();
    axios.put(`${API}/customers/${id}`, values)
      .then(() => {
        alert("Customer updated successfully!");
        navigate("/customermy");
      })
      .catch(err => console.error(err));
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center text-primary mb-4">Edit Customer</h2>
      <form onSubmit={handleSubmit}>
        {/* Basic Details */}

        <div className="shadow-lg rounded-3 p-4 mb-4">
          <h2>Basic Details:</h2>
          <div className="row mb-3">
            <div className="col-md-4">
              <label>Name</label>
              <input type="text" className="form-control" value={values.name} onChange={handleNameChange} />
            </div>

            <div className="col-md-4">
              <div className="d-flex align-items-center">
                <label className="form-label me-2">Display Name</label>
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={sameAsName}
                    onChange={handleDisplayCheckbox}
                  />
                  <label className="form-check-label">Same as Name</label>
                </div>
              </div>
              <input
                type="text"
                className="form-control"
                value={values.display_name}
                onChange={handleDisplayChange}
                disabled={sameAsName}
              />
            </div>

            <div className="col-md-4">
              <label>Mobile</label>
              <input type="text" className="form-control" value={values.mobile} onChange={handleChange} name="mobile" />
            </div>
          </div>

          {/* Contact Info */}
          <div className="row mb-3">
            <div className="col-md-3">
              <label>WhatsApp No</label>
              <input type="text" className="form-control" value={values.whatsapp_no} onChange={handleChange} name="whatsapp_no" />
            </div>
            <div className="col-md-3">
              <label>GST</label>
              <select
                className="form-select"
                value={values.gst}
                onChange={e =>
                  setValues({ ...values, gst: e.target.value })
                }
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>


            </div>
            <div className="col-md-3">
              <label>IGST</label>
              <select className="form-select" value={values.igst}
                onChange={e => setValues({ ...values, igst: e.target.value })}>
                <option value="">Select</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
            <div className="col-md-3 mb-3">
              <label>PAN</label>

              <input
                type="text"
                maxLength={10}
                className={`form-control ${errors.pan ? "is-invalid" : valid.pan ? "is-valid" : ""
                  }`}
                value={values.pan}
                placeholder="ABCDE1234F"
                onChange={e => {
                  const pan = e.target.value.toUpperCase();
                  setValues({ ...values, pan });

                  if (!pan) {
                    setErrors(prev => ({ ...prev, pan: "" }));
                    setValid(prev => ({ ...prev, pan: false }));
                  } else if (!PAN_REGEX.test(pan)) {
                    setErrors(prev => ({
                      ...prev,
                      pan: "Invalid PAN format (ABCDE1234F)"
                    }));
                    setValid(prev => ({ ...prev, pan: false }));
                  } else {
                    setErrors(prev => ({ ...prev, pan: "" }));
                    setValid(prev => ({ ...prev, pan: true }));
                  }
                }}
              />

              {errors.pan && <div className="invalid-feedback">{errors.pan}</div>}
              {valid.pan && <div className="valid-feedback">Valid PAN</div>}
            </div>



          </div>

          {/* Financial Info */}
          <div className="row mb-3">
            <div className="col-md-4 mb-3">
              <label>TAN</label>

              <input
                type="text"
                maxLength={10}
                className={`form-control ${errors.tan ? "is-invalid" : valid.tan ? "is-valid" : ""
                  }`}
                value={values.tan}
                placeholder="ABCD12345E"
                onChange={e => {
                  const tan = e.target.value.toUpperCase();
                  setValues({ ...values, tan });

                  if (!tan) {
                    setErrors(prev => ({ ...prev, tan: "" }));
                    setValid(prev => ({ ...prev, tan: false }));
                  } else if (!TAN_REGEX.test(tan)) {
                    setErrors(prev => ({
                      ...prev,
                      tan: "Invalid TAN format (ABCD12345E)"
                    }));
                    setValid(prev => ({ ...prev, tan: false }));
                  } else {
                    setErrors(prev => ({ ...prev, tan: "" }));
                    setValid(prev => ({ ...prev, tan: true }));
                  }
                }}
              />

              {errors.tan && <div className="invalid-feedback">{errors.tan}</div>}
              {valid.tan && <div className="valid-feedback">Valid TAN</div>}
            </div>

            <div className="col-md-4">
              <label>Email</label>
              <input type="email" className="form-control" value={values.email} onChange={handleChange} name="email" />
            </div>
            <div className="col-md-4">
              <label>Discount (%)</label>
              <input type="text" className="form-control" value={values.discount} onChange={handleChange} name="discount" />
            </div>



          </div>

          {/* Agent / Tax Info */}
          <div className="row mb-3">
            <div className="col-md-4">
              <label>Contact Type</label>
              <select className="form-select" value={values.contact_type}
                onChange={e => setValues({ ...values, contact_type: e.target.value })}>
                <option value="">Select</option>
                <option value="customer">Customer</option>
                <option value="both">Both</option>
              </select>
            </div>
            <div className="col-md-4">
              <label>Credit Limit</label>
              <input type="text" className="form-control" value={values.credit_limit} onChange={handleChange} name="credit_limit" />
            </div>
            <div className="col-md-4">
              <label>Credit Days</label>
              <input type="text" className="form-control" value={values.credit_days} onChange={handleChange} name="credit_days" />
            </div>



          </div>

          <div className="row mb-3">
            <div className="col-md-4">
              <label>Agent Name</label>
              <select
                className="form-select"
                name="agent_name"
                value={values.agent_name}
                onChange={handleChange}
              >
                <option value="">Select</option>
                {agents.map(agent => (
                  <option key={agent.id} value={agent.agent_name}>
                    {agent.agent_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <label>Agent %</label>
              <input type="text" className="form-control" value={values.agent_percentage} onChange={handleChange} name="agent_percentage" />
            </div>
            <div className="col-md-4">
              <label>TDS</label>
              <select
                className="form-select"
                value={tdsEnabled ? "yes" : "no"}
                onChange={e => {
                  if (e.target.value === "no") {
                    setValues({ ...values, tds: "" });
                  } else {
                    setValues({ ...values, tds: "0" }); // 👈 important
                  }
                }}
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>



            </div>



          </div>

          <div className="row mb-3">
            <div className="col-md-3">
              <label>TCS</label>
              <select
                className="form-select"
                value={tcsEnabled ? "yes" : "no"}
                onChange={e => {
                  if (e.target.value === "no") {
                    setValues({ ...values, tcs: "" });
                  } else {
                    setValues({ ...values, tcs: "0" }); // 👈 important
                  }
                }}
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>



            </div>
            <div className="col-md-3">
              <label>Price List</label>
              <select className="form-select" value={values.price_list}
                name="price_list"
                onChange={handleChange}>
                <option value="">Select</option>
                {priceLists.map(list => (
                  <option key={list.id} value={list.name}>
                    {list.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label>Receivable Opening Balance</label>
              <input type="text" className="form-control" value={values.receivable_opening_balance} onChange={handleChange} name="receivable_opening_balance" />
            </div>
            <div className="col-md-3">
              <label>Payable Opening Balance</label>
              <input type="text" className="form-control" value={values.payable_opening_balance} onChange={handleChange} name="payable_opening_balance" />
            </div>
          </div>
          <div className="row mb-3">


            <div className="col-md-6">
              <label className="mb-1 fw-bold">Bank Details :</label>
              <hr className="mt-0 mb-3" />


              <table className="table table-bordered">
                <tbody>
                  <tr>
                    <th>Bank Name</th>
                    <td>
                      <input
                        type="text"
                        className="form-control"
                        value={values.bank_name || ""}
                        onChange={(e) =>
                          setValues({ ...values, bank_name: e.target.value })
                        }
                      />
                    </td>
                  </tr>

                  <tr>
                    <th>Branch</th>
                    <td>
                      <input
                        type="text"
                        className="form-control"
                        value={values.branch || ""}
                        onChange={(e) =>
                          setValues({ ...values, branch: e.target.value })
                        }
                      />
                    </td>
                  </tr>

                  <tr>
                    <th>Account Number</th>
                    <td>
                      <input
                        type="text"
                        className="form-control"
                        value={values.account_number || ""}
                        onChange={(e) =>
                          setValues({ ...values, account_number: e.target.value })
                        }
                      />
                    </td>
                  </tr>

                  <tr>
                    <th>IFSC Code</th>
                    <td>
                      <input
                        type="text"
                        className="form-control"
                        value={values.ifsc_code || ""}
                        onChange={(e) =>
                          setValues({ ...values, ifsc_code: e.target.value })
                        }
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>UPI Name</th>
                    <td>
                      <input
                        type="text"
                        className="form-control"
                        value={values.upi_name || ""}
                        onChange={(e) =>
                          setValues({ ...values, upi_name: e.target.value })
                        }
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>UPI ID</th>
                    <td>
                      <input
                        type="text"
                        className="form-control"
                        value={values.upi_id || ""}
                        onChange={(e) =>
                          setValues({ ...values, upi_id: e.target.value })
                        }
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>
          {values.gst === "yes" && (
            <div className="col-md-12">
              <div className="accordion" id="gstAccordion">
                <div className="accordion-item">
                  <h2 className="accordion-header">
                    <button
                      className="accordion-button"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#gstDetails"
                    >
                      GST Details
                    </button>
                  </h2>

                  <div
                    data-bs-target="#gstDetails"
                    id="gstDetails"

                    className="accordion-collapse collapse show"
                  >
                    <div className="accordion-body">
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label">GST TIN</label>

                          <input
                            type="text"
                            maxLength={15}
                            className={`form-control ${errors.gst ? "is-invalid" : valid.gst ? "is-valid" : ""
                              }`}
                            value={values.gst_tin}
                            placeholder="Enter GST TIN"
                            onChange={e => {
                              const gst = e.target.value.toUpperCase();
                              setValues({ ...values, gst_tin: gst });

                              if (!gst) {
                                setErrors(prev => ({ ...prev, gst: "" }));
                                setValid(prev => ({ ...prev, gst: false }));
                              } else if (!GST_REGEX.test(gst)) {
                                setErrors(prev => ({
                                  ...prev,
                                  gst: "Invalid GSTIN format (22ABCDE1234F1Z5)"
                                }));
                                setValid(prev => ({ ...prev, gst: false }));
                              } else {
                                setErrors(prev => ({ ...prev, gst: "" }));
                                setValid(prev => ({ ...prev, gst: true }));
                              }
                            }}
                          />

                          {errors.gst && <div className="invalid-feedback">{errors.gst}</div>}
                          {valid.gst && <div className="valid-feedback">Valid GSTIN</div>}
                        </div>


                        <div className="col-md-6 mb-3">
                          <label className="form-label">CIN No</label>
                          <input
                            type="text"
                            className="form-control" value={values.cin}
                            onChange={e => setValues({ ...values, cin: e.target.value })}
                            placeholder="Enter CIN No"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {values.tds && (
            <div className="col-md-12">
              <div className="accordion" id="tdsAccordion">
                <div className="accordion-item">
                  <h2 className="accordion-header">
                    <button
                      className="accordion-button"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#tdsDetails"
                    >
                      TDS Details
                    </button>
                  </h2>

                  <div
                    id="tdsDetails"
                    className="accordion-collapse collapse show"
                  >
                    <div className="accordion-body">
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label">TDS %</label>
                          <input
                            type="text"
                            className="form-control" value={values.tds}
                            onChange={e => setValues({ ...values, tds: e.target.value })}
                            placeholder="Enter TDS %"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}

          {values.tcs && (
            <div className="col-md-12">
              <div className="accordion" id="tcsAccordion">
                <div className="accordion-item">
                  <h2 className="accordion-header">
                    <button
                      className="accordion-button"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#tcsDetails"
                    >
                      TCS Details
                    </button>
                  </h2>

                  <div
                    id="tcsDetails"
                    className="accordion-collapse collapse show"
                  >
                    <div className="accordion-body">
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label">TCS %</label>
                          <input
                            type="number"
                            className="form-control"
                            value={values.tcs}
                            onChange={e =>
                              setValues({ ...values, tcs: e.target.value })
                            }
                            placeholder="Enter TCS %"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}

        </div>



        {/* Billing & Shipping */}
        <div className="row shadow-lg rounded-3 mt-4 p-4">
          {/* Billing */}
          <div className="col-md-6">
            <h5>Billing Address</h5>

            <textarea
              className="form-control mb-4"
              placeholder="Street Address"
              name="billing_address"
              value={values.billing_address}
              onChange={handleChange}
              rows={2}
              cols={30}
            />


            {/* Country */}
            <select
              className="form-select mb-4"
              name="billing_country"
              value={values.billing_country}
              onChange={handleChange}
            >
              <option value="">Select Country</option>
              {countries.map(c => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>


            {/* State */}
            <select
              className="form-select mb-4"
              name="billing_state"
              value={values.billing_state}
              onChange={handleChange}
              disabled={!values.billing_country}
            >
              <option value="">Select State</option>
              {billingStates.map(s => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>


            {/* City */}
            <select
              className="form-select mb-4"
              name="billing_city"
              value={values.billing_city}
              onChange={handleChange}
              disabled={!values.billing_state}
            >
              <option value="">Select City</option>
              {billingCities.map(c => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>



            <input
              type="text"
              className="form-control"
              placeholder="Zip"
              name="billing_zip"
              value={values.billing_zip}
              onChange={handleChange}
            />
          </div>


          {/* Shipping */}
          <div className="col-md-6">
            <div className="d-flex align-items-center mb-2">
              <h5 className="me-2 mb-0">Shipping Address</h5>
              <div className="form-check mb-0">
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={sameAsBilling}
                  onChange={handleSameAsBilling}
                  id="sameAsBilling"
                />
                <label className="form-check-label ms-1" htmlFor="sameAsBilling">
                  Same as Billing Address
                </label>
              </div>
            </div>

            <textarea
              className="form-control mb-4"
              placeholder="Street Address"
              name="shipping_address"
              value={values.shipping_address}
              onChange={handleChange}
              disabled={sameAsBilling}
              rows={2}
              cols={30}
            />



            {/* Country */}
            <select
              className="form-select mb-4"
              name="shipping_country"
              value={values.shipping_country}
              onChange={handleChange}
              disabled={sameAsBilling}
            >
              <option value="">Select Country</option>
              {countries.map(c => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>


            {/* State */}
            <select
              className="form-select mb-4"
              name="shipping_state"
              value={values.shipping_state}
              onChange={handleChange}
              disabled={!values.shipping_country || sameAsBilling}
            >
              <option value="">Select State</option>
              {shippingStates.map(s => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>


            {/* City */}
            <select
              className="form-select mb-4"
              name="shipping_city"
              value={values.shipping_city}
              onChange={handleChange}
              disabled={!values.shipping_state || sameAsBilling}
            >
              <option value="">Select City</option>
              {shippingCities.map(c => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>


            <input
              type="text"
              className="form-control"
              placeholder="Zip"
              name="shipping_zip"
              value={values.shipping_zip}
              onChange={handleChange}
              disabled={sameAsBilling}
            />
          </div>

        </div>

        <div className="d-flex justify-content-end mt-3">
          <button type="submit" className="btn btn-success px-4">Update Customer</button>
        </div>

      </form>
      <br />
    </div>

  );
}

export default EditCustomer;
