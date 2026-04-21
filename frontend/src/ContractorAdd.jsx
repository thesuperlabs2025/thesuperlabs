import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const API = process.env.REACT_APP_API_URL;

function ContractorAdd() {
    const navigate = useNavigate();

    const [values, setValues] = useState({
        name: "",
        mobile: "",
        whatsapp_no: "",
        email: "",
        gst_tin: "",
        billing_address: "",
        billing_city: "",
        billing_state: "",
        billing_zip: "",
        bank_name: "",
        branch: "",
        account_number: "",
        ifsc_code: "",
        upi_id: ""
    });

    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);

    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const res = await axios.get(`${API}/countries`);
                setCountries(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchCountries();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setValues(prev => ({ ...prev, [name]: value }));
    };

    const handleStateChange = async (e) => {
        const val = e.target.value;
        setValues(prev => ({ ...prev, billing_state: val, billing_city: "" }));
        const selectedState = states.find(s => s.name === val);
        if (selectedState) {
            const res = await axios.get(`${API}/cities/${selectedState.id}`);
            setCities(res.data);
        }
    };

    const handleCountryChange = async (e) => {
        const val = e.target.value;
        setValues(prev => ({ ...prev, billing_country: val, billing_state: "", billing_city: "" }));
        const selectedCountry = countries.find(c => c.name === val);
        if (selectedCountry) {
            const res = await axios.get(`${API}/states/${selectedCountry.id}`);
            setStates(res.data);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API}/contractor`, values);
            alert("Contractor saved successfully!");
            navigate("/contractor-list");
        } catch (err) {
            console.error(err);
            alert("Error saving contractor");
        }
    };

    return (
        <div className="container py-5">
            <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
                <h2 className="fw-bold text-primary mb-0">
                    <i className="bi bi-person-workspace me-2"></i>Add New Contractor
                </h2>
                <button className="btn btn-outline-secondary" onClick={() => navigate("/contractor-list")}>
                    <i className="bi bi-arrow-left me-2"></i>Back to List
                </button>
            </div>

            <form onSubmit={handleSubmit} className="row g-4">
                <div className="col-12 col-lg-8">
                    <div className="card shadow-sm border-0 mb-4 h-100">
                        <div className="card-header bg-white py-3">
                            <h5 className="mb-0 fw-bold"><i className="bi bi-card-list me-2"></i>Basic Information</h5>
                        </div>
                        <div className="card-body p-4">
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label className="form-label fw-bold small">Contractor Name *</label>
                                    <input type="text" name="name" className="form-control" value={values.name} onChange={handleChange} required placeholder="Full name or Company name" />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label fw-bold small">Mobile Number</label>
                                    <input type="text" name="mobile" className="form-control" value={values.mobile} onChange={handleChange} placeholder="Primary contact number" />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label fw-bold small">WhatsApp Number</label>
                                    <input type="text" name="whatsapp_no" className="form-control" value={values.whatsapp_no} onChange={handleChange} />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label fw-bold small">Email ID</label>
                                    <input type="email" name="email" className="form-control" value={values.email} onChange={handleChange} />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label fw-bold small">GST TIN</label>
                                    <input type="text" name="gst_tin" className="form-control" value={values.gst_tin} onChange={handleChange} placeholder="GST Number" />
                                </div>
                            </div>

                            <hr className="my-4" />

                            <h5 className="mb-3 fw-bold"><i className="bi bi-geo-alt me-2"></i>Address Details</h5>
                            <div className="row g-3">
                                <div className="col-12">
                                    <label className="form-label fw-bold small">Street Address</label>
                                    <textarea name="billing_address" className="form-control" value={values.billing_address} onChange={handleChange} rows="2"></textarea>
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label fw-bold small">Country</label>
                                    <select name="billing_country" className="form-select" value={values.billing_country} onChange={handleCountryChange}>
                                        <option value="">Select Country</option>
                                        {countries.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label fw-bold small">State</label>
                                    <select name="billing_state" className="form-select" value={values.billing_state} onChange={handleStateChange}>
                                        <option value="">Select State</option>
                                        {states.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label fw-bold small">City</label>
                                    <select name="billing_city" className="form-select" value={values.billing_city} onChange={handleChange}>
                                        <option value="">Select City</option>
                                        {cities.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label fw-bold small">Zip Code</label>
                                    <input type="text" name="billing_zip" className="form-control" value={values.billing_zip} onChange={handleChange} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-lg-4">
                    <div className="card shadow-sm border-0 h-100">
                        <div className="card-header bg-white py-3">
                            <h5 className="mb-0 fw-bold"><i className="bi bi-bank me-2"></i>Banking Details</h5>
                        </div>
                        <div className="card-body p-4">
                            <div className="row g-3">
                                <div className="col-12">
                                    <label className="form-label fw-bold small">Bank Name</label>
                                    <input type="text" name="bank_name" className="form-control" value={values.bank_name} onChange={handleChange} />
                                </div>
                                <div className="col-12">
                                    <label className="form-label fw-bold small">Branch</label>
                                    <input type="text" name="branch" className="form-control" value={values.branch} onChange={handleChange} />
                                </div>
                                <div className="col-12">
                                    <label className="form-label fw-bold small">Account Number</label>
                                    <input type="text" name="account_number" className="form-control" value={values.account_number} onChange={handleChange} />
                                </div>
                                <div className="col-12">
                                    <label className="form-label fw-bold small">IFSC Code</label>
                                    <input type="text" name="ifsc_code" className="form-control" value={values.ifsc_code} onChange={handleChange} />
                                </div>
                                <div className="col-12">
                                    <label className="form-label fw-bold small">UPI ID</label>
                                    <input type="text" name="upi_id" className="form-control" value={values.upi_id} onChange={handleChange} />
                                </div>
                            </div>
                        </div>
                        <div className="card-footer bg-white border-0 p-4">
                            <button type="submit" className="btn btn-primary w-100 py-3 fw-bold rounded-pill">
                                <i className="bi bi-check-circle me-2"></i>SAVE CONTRACTOR
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default ContractorAdd;
