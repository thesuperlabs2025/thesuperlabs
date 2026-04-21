import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
const API = process.env.REACT_APP_API_URL;

function CreateCustomer() {
  const navigate = useNavigate();

  const [values, setValues] = useState({
    name: '', display_name: '', mobile: '', gst_tin: '', whatsapp_no: '', email: '', pan: '', tan: '', cin: '', igst: '',
    discount: '', contact_type: '', credit_limit: '', credit_days: '', agent_name: '',
    tds: '', tcs: '', price_list: '', receivable_opening_balance: '', payable_opening_balance: '', bank_name: '',
    branch: '', account_number: '', ifsc_code: '', upi_name: '', upi_id: '', billing_address: '', billing_country: '', billing_state: '', billing_city: '', billing_zip: '',
    shipping_address: '', shipping_country: '', shipping_state: '', shipping_city: '', shipping_zip: ''
  });

  const [sameAsBilling, setSameAsBilling] = useState(false);
  const [sameAsName, setSameAsName] = useState(true); // Display Name same as Name

  const [countries, setCountries] = useState([]);
  const [States, setStates] = useState([]);
  const [Cities, setCity] = useState([]);
  const [gst, setGst] = useState("no");
  const [tds, setTds] = useState("no");
  const [tcs, setTcs] = useState("no");
  const [agents, setAgents] = useState([]);
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


  // Name input change

  useEffect(() => {
    if (values?.tds && values.tds !== "0") {
      setTds("yes");
    } else {
      setTds("no");
    }

    if (values?.tcs && values.tcs !== "0") {
      setTcs("yes");
    } else {
      setTcs("no");
    }
  }, [values]);


  const handleChange = async (e) => {
    const { name, value } = e.target;

    setValues(prev => ({
      ...prev,
      [name]: value,
    }));

    // COUNTRY → STATE
    if (name === "billing_country") {
      setStates([]);
      setCity([]);

      setValues(prev => ({
        ...prev,
        billing_state: "",
        billing_city: "",
      }));

      const selectedCountry = countries.find(c => c.name === value);
      if (selectedCountry) {
        const res = await axios.get(`${API}/states/${selectedCountry.id}`);
        setStates(res.data);
      }
    }

    // STATE → CITY
    if (name === "billing_state") {
      setCity([]);

      setValues(prev => ({
        ...prev,
        billing_city: "",
      }));

      const selectedState = States.find(s => s.name === value);
      if (selectedState) {
        const res = await axios.get(`${API}/cities/${selectedState.id}`);
        setCity(res.data);
      }
    }
  };

  const fetchCountry = async () => {
    try {
      const res = await axios.get(`${API}/countries`);
      setCountries(res.data);
    } catch (err) {
      console.error("Error fetching state:", err);
    }
  };

  const fetchAgents = async () => {
    try {
      const res = await axios.get(`${API}/agents`);
      setAgents(res.data);
    } catch (err) {
      console.error("Error fetching agents:", err);
    }
  };

  const handleNameChange = (e) => {
    const val = e.target.value;
    setValues(prev => ({
      ...prev,
      name: val,
      display_name: sameAsName ? val : prev.display_name
    }));
  };

  // Display Name checkbox
  const handleDisplayCheckbox = (e) => {
    const checked = e.target.checked;
    setSameAsName(checked);
    if (checked) {
      setValues(prev => ({ ...prev, display_name: prev.name }));
    }
  };

  // Display Name manual change
  const handleDisplayChange = (e) => {
    if (!sameAsName) {
      setValues(prev => ({ ...prev, display_name: e.target.value }));
    }
  };

  // Billing → Shipping checkbox
  const handleSameAsBilling = (e) => {
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
    } else {
      setValues(prev => ({
        ...prev,
        shipping_address: '',
        shipping_country: '',
        shipping_state: '',
        shipping_city: '',
        shipping_zip: ''
      }));
    }
  };

  // Handle changes in billing fields
  const handleBillingChange = (field, val) => {
    setValues(prev => {
      const newValues = { ...prev, [field]: val };
      if (sameAsBilling) {
        return {
          ...newValues,
          shipping_address: newValues.billing_address,
          shipping_country: newValues.billing_country,
          shipping_state: newValues.billing_state,
          shipping_city: newValues.billing_city,
          shipping_zip: newValues.billing_zip
        };
      }
      return newValues;
    });
  };
  const [priceLists, setPriceLists] = useState([]);

  const fetchPriceLists = async () => {
    try {
      const res = await axios.get(`${API}/pricelist-master`);
      setPriceLists(res.data);
    } catch (err) {
      console.error("Error fetching price lists:", err);
    }
  };

  useEffect(() => {
    fetchCountry();
    fetchAgents();
    fetchPriceLists();
  }, []);

  // Form submit
  const handleSubmit = (e) => {
    e.preventDefault();

    axios.post(`${API}/customers`, values)
      .then(() => {
        alert("Customer saved successfully!");
        navigate("/customermy");
      })
      .catch(err => console.error(err));
  };

  return (
    <div className="container mt-5">
      <h2>Create Customer</h2>
      <p className="text-muted mb-3">Fill in the details below to create a new customer.</p>

      <form onSubmit={handleSubmit}>

        {/* Customer Details */}
        <div className="shadow-lg rounded-3 p-4 mb-4">

          <div className="row mb-3">
            <h2>Basic Details:</h2>
            <hr />
            <br />
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
                    id="sameAsName"
                  />
                  <label className="form-check-label" htmlFor="sameAsName">
                    Same as Name
                  </label>
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
              <input type="text" className="form-control" value={values.mobile}
                onChange={e => setValues({ ...values, mobile: e.target.value })} />
            </div>
          </div>

          <div className="row mb-3">

            <div className="col-md-3">
              <label>WhatsApp No</label>
              <input type="text" className="form-control" value={values.whatsapp_no}
                onChange={e => setValues({ ...values, whatsapp_no: e.target.value })} />
            </div>

            {/* <div className="col-md-4">
              <label>GST No</label>
              <input type="text" className="form-control" value={values.gst_tin}
                onChange={e => setValues({ ...values, gst_tin: e.target.value })} />
            </div> */}
            <div className="col-md-3">
              <label>GST</label>
              <select
                className="form-select"
                value={gst}
                onChange={(e) => setGst(e.target.value)}
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
                <option value="yes" selected>Yes</option>
                <option value="no">No</option>
              </select>
            </div>
            <div className="col-md-3">
              <label>PAN</label>
              <input
                type="text"
                className={`form-control ${errors.pan ? "is-invalid" : valid.pan ? "is-valid" : ""
                  }`}
                value={values.pan}
                maxLength={10}
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

          <div className="row mb-3">
            <div className="col-md-4">
              <label>TAN</label>
              <input
                type="text"
                className={`form-control ${errors.tan ? "is-invalid" : valid.tan ? "is-valid" : ""
                  }`}
                value={values.tan}
                maxLength={10}
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
              <input type="email" className="form-control" value={values.email}
                onChange={e => setValues({ ...values, email: e.target.value })} />
            </div>

            <div className="col-md-4">
              <label>Discount %</label>
              <input
                type="text"
                className="form-control"
                value={values.discount}
                onChange={e => setValues({ ...values, discount: e.target.value })}
              />

            </div>


          </div>

          <div className="row mb-3">
            <div className="col-md-4">
              <label>Contact Type</label>
              <select className="form-select" value={values.contact_type}
                onChange={e => setValues({ ...values, contact_type: e.target.value })}>
                <option value="">Select</option>
                <option value="customer" selected>Customer</option>
                <option value="both">Both</option>
              </select>
            </div>
            <div className="col-md-4">
              <label>Credit Limit</label>
              <input type="text" className="form-control" value={values.credit_limit}
                onChange={e => setValues({ ...values, credit_limit: e.target.value })} />
            </div>

            <div className="col-md-4">
              <label>Credit Days</label>
              <input type="text" className="form-control" value={values.credit_days}
                onChange={e => setValues({ ...values, credit_days: e.target.value })} />
            </div>


          </div>

          <div className="row mb-3">
            <div className="col-md-4">
              <label>Agent Name</label>
              <select className="form-select" value={values.agent_name}
                onChange={e => setValues({ ...values, agent_name: e.target.value })}>
                <option value="">Select</option>
                {agents.map(agent => (
                  <option key={agent.id} value={agent.agent_name}>
                    {agent.agent_name}
                  </option>
                ))}
              </select>
            </div>
            {/* <div className="col-md-4">
              <label>Agent %</label>
              <input type="number" className="form-control" value={values.agent_percentage}
                onChange={e => setValues({ ...values, agent_percentage: e.target.value })} />
            </div> */}
            <div className="col-md-4">
              <label>TDS</label>
              <select
                className="form-select"
                value={tds}
                onChange={(e) => setTds(e.target.value)}
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>

            <div className="col-md-4">
              <label>TCS</label>
              <select
                className="form-select"
                value={tcs}
                onChange={(e) => setTcs(e.target.value)}
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>


          </div>

          <div className="row mb-3">


            <div className="col-md-4">
              <label>Price List</label>
              <select className="form-select" value={values.price_list}
                onChange={e => setValues({ ...values, price_list: e.target.value })}>
                <option value="">Select</option>
                {priceLists.map(list => (
                  <option key={list.id} value={list.name}>
                    {list.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <label>Receivable Opening Balance</label>
              <input type="text" className="form-control" value={values.receivable_opening_balance}
                onChange={e => setValues({ ...values, receivable_opening_balance: e.target.value })} />
            </div>
            <div className="col-md-4">

              <label>Payable Opening Balance</label>
              <input type="text" className="form-control" value={values.payable_opening_balance}
                onChange={e => setValues({ ...values, payable_opening_balance: e.target.value })} />
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
          {gst === "yes" && (
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
                    id="gstDetails"
                    className="accordion-collapse collapse show"
                  >
                    <div className="accordion-body">
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label">GST TIN</label>

                          <input
                            type="text"
                            className={`form-control ${errors.gst ? "is-invalid" : valid.gst ? "is-valid" : ""
                              }`}
                            value={values.gst_tin}
                            maxLength={15}
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

          {tds === "yes" && (
            <div className="col-md-12">
              <div className="accordion" id="tdsAccordion">
                <div className="accordion-item">
                  <h2 className="accordion-header">
                    <button
                      className="accordion-button"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#gstDetails"
                    >
                      TDS Details
                    </button>
                  </h2>

                  <div
                    id="gstDetails"
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
                            placeholder="Enter TDS%"
                          />
                        </div>


                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tcs === "yes" && (
            <div className="col-md-12">
              <div className="accordion" id="tcsAccordion">
                <div className="accordion-item">
                  <h2 className="accordion-header">
                    <button
                      className="accordion-button"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#gstDetails"
                    >
                      TCS Details
                    </button>
                  </h2>

                  <div
                    id="gstDetails"
                    className="accordion-collapse collapse show"
                  >
                    <div className="accordion-body">
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label">TCS %</label>
                          <input
                            type="text"
                            className="form-control" value={values.tcs}
                            onChange={e => setValues({ ...values, tcs: e.target.value })}
                            placeholder="Enter TCS%"
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
              value={values.billing_address}
              onChange={e => handleBillingChange("billing_address", e.target.value)}
              rows={2}
              cols={30}
            />



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

            <select
              className="form-select mb-4"
              name="billing_state"
              value={values.billing_state}
              onChange={handleChange}
              disabled={!values.billing_country}
            >
              <option value="">Select State</option>
              {States.map(s => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>

            <select
              className="form-select mb-1"
              name="billing_city"
              value={values.billing_city}
              onChange={handleChange}
              disabled={!values.billing_state}
            >
              <option value="">Select City</option>
              {Cities.map(c => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>

            <br />
            <input type="text" className="form-control" placeholder="Zip"
              value={values.billing_zip} onChange={e => handleBillingChange('billing_zip', e.target.value)} />
          </div>

          {/* Shipping */}
          <div className="col-md-6">
            <div className="d-flex align-items-center mb-2">
              <h5 className="me-2 mb-0">Shipping Address</h5>
              <div className="form-check mb-0">
                <input
                  className="form-check-input"
                  type="checkbox"
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
              rows={2}
              cols={30}
              disabled={sameAsBilling}
            />


            <select
              className="form-select mb-4"
              value={values.shipping_country}
              onChange={e => setValues({ ...values, shipping_country: e.target.value })}
              disabled={sameAsBilling}
            >
              <option value="">Select Country</option>
              {countries.map(c => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              className="form-select mb-4"
              value={values.shipping_state}
              onChange={e => setValues({ ...values, shipping_state: e.target.value })}
              disabled={!values.shipping_country || sameAsBilling}
            >
              <option value="">Select State</option>
              {States.map(s => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>

            <select
              className="form-select mb-4"
              value={values.shipping_city}
              onChange={e => setValues({ ...values, shipping_city: e.target.value })}
              disabled={!values.shipping_state || sameAsBilling}
            >
              <option value="">Select City</option>
              {Cities.map(c => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>

            <input type="text" className="form-control" placeholder="Zip"
              value={values.shipping_zip} onChange={e => setValues({ ...values, shipping_zip: e.target.value })} disabled={sameAsBilling} />
          </div>
        </div>

        <div className="d-flex justify-content-end mt-3">
          <button type="submit" className="btn btn-success">
            Create Customer
          </button>
        </div>

      </form>
      <br />
    </div>
  );
}

export default CreateCustomer;
