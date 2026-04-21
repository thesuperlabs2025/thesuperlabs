import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const API = process.env.REACT_APP_API_URL;

function LeadForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = !!id;

    const [formData, setFormData] = useState({
        lead_id: "",
        lead_date: new Date().toISOString().substring(0, 10),
        company_name: "",
        contact_person: "",
        mobile_number: "",
        whatsapp_number: "",
        email_id: "",
        city: "",
        state: "",
        country: "India",
        lead_source: "",
        assigned_sales_person: "",
        product_type: "",
        appointment_date: "",
        reference_image: null,
        gst_number: "",
        address: "",
        lead_status: "New",
        next_followup_date: "",
        followup_notes: "",
        expected_closing_date: ""
    });

    const [imagePreview, setImagePreview] = useState(null);
    const [salesPersons, setSalesPersons] = useState([]);
    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [leadSources, setLeadSources] = useState([]);
    const [productTypes, setProductTypes] = useState([]);
    const [leadStatuses, setLeadStatuses] = useState([]);

    const fetchDropdowns = useCallback(async () => {
        try {
            const [src, prod, stat, countriesRes] = await Promise.all([
                axios.get(`${API}/lead-masters/lead_sources`),
                axios.get(`${API}/lead-masters/product_types`),
                axios.get(`${API}/lead-masters/lead_statuses`),
                axios.get(`${API}/countries`)
            ]);
            setLeadSources(src.data);
            setProductTypes(prod.data);
            setLeadStatuses(stat.data);
            setCountries(countriesRes.data);
        } catch (err) {
            console.error("Dropdown fetch error", err);
        }
    }, []);

    const fetchNextId = useCallback(async () => {
        try {
            const res = await axios.get(`${API}/leads/next-id`);
            setFormData(prev => ({ ...prev, lead_id: res.data.nextId }));
        } catch (err) {
            console.error("Error fetching next lead ID:", err);
        }
    }, []);

    const fetchLead = useCallback(async () => {
        try {
            const res = await axios.get(`${API}/leads/${id}`);
            const data = res.data;
            if (data.lead_date) data.lead_date = new Date(data.lead_date).toISOString().substring(0, 10);
            if (data.appointment_date) data.appointment_date = new Date(data.appointment_date).toISOString().substring(0, 16);
            if (data.next_followup_date) data.next_followup_date = new Date(data.next_followup_date).toISOString().substring(0, 10);
            if (data.expected_closing_date) data.expected_closing_date = new Date(data.expected_closing_date).toISOString().substring(0, 10);

            setFormData(data);
            if (data.reference_image) {
                setImagePreview(`${API}/uploads/${data.reference_image}`);
            }
        } catch (err) {
            console.error("Error fetching lead:", err);
        }
    }, [id]);

    const fetchSalesPersons = useCallback(async () => {
        try {
            const res = await axios.get(`${API}/employees`);
            setSalesPersons(res.data);
        } catch (err) {
            console.error("Error fetching employees:", err);
        }
    }, []);

    // State/City Linkage
    useEffect(() => {
        if (formData.country) {
            const country = countries.find(c => c.name === formData.country);
            if (country) {
                axios.get(`${API}/states/${country.id}`).then(res => setStates(res.data));
            }
        }
    }, [formData.country, countries]);

    useEffect(() => {
        if (formData.state) {
            const state = states.find(s => s.name === formData.state);
            if (state) {
                axios.get(`${API}/cities/${state.id}`).then(res => setCities(res.data));
            }
        }
    }, [formData.state, states]);

    useEffect(() => {
        fetchDropdowns();
        fetchSalesPersons();
        if (isEdit) {
            fetchLead();
            document.title = `Edit Lead #${id} - TSL ERP`;
        } else {
            fetchNextId();
            document.title = "New Lead - TSL ERP";
        }
    }, [id, isEdit, fetchLead, fetchNextId, fetchSalesPersons, fetchDropdowns]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRefresh = async () => {
        try {
            await fetchDropdowns();
            alert("Options Refreshed!");
        } catch (err) {
            console.error("Refresh error", err);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, reference_image: file }));
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const clearImage = () => {
        setFormData(prev => ({ ...prev, reference_image: null }));
        setImagePreview(null);
        // Clear file input
        const fileInput = document.getElementById("reference_image_input");
        if (fileInput) fileInput.value = "";
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (formData[key] !== null) {
                data.append(key, formData[key]);
            } else if (isEdit && key === 'reference_image') {
                // If editing and image is cleared, we might need a flag or just send null
                data.append(key, "");
            }
        });

        try {
            if (isEdit) {
                await axios.put(`${API}/leads/${id}`, data);
                alert("Lead updated successfully!");
            } else {
                await axios.post(`${API}/leads`, data);
                alert("Lead created successfully!");
            }
            navigate("/lead-my");
        } catch (err) {
            console.error("Error saving lead:", err);
            alert("Failed to save lead");
        }
    };

    return (
        <div className="container-fluid py-4 bg-light min-vh-100">
            <div className="card shadow-sm border-0 rounded-3 mx-auto" style={{ maxWidth: "1200px" }}>
                <form onSubmit={handleSubmit}>
                    <div className="card-header bg-white py-3">
                        <h4 className="mb-0 fw-bold text-primary">{isEdit ? "Edit Lead" : "Create New Lead"}</h4>
                    </div>
                    <div className="card-body p-4">
                        {/* Section 1: Basic Lead Information */}
                        <div className="mb-4">
                            <h5 className="fw-bold mb-3 text-dark border-bottom pb-2">1️⃣ Basic Lead Information</h5>
                            <div className="row g-3">
                                <div className="col-md-3">
                                    <label className="form-label small fw-bold">Lead ID</label>
                                    <input type="text" name="lead_id" className="form-control" value={formData.lead_id} readOnly />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label small fw-bold">Lead Date</label>
                                    <input type="date" name="lead_date" className="form-control" value={formData.lead_date} onChange={handleChange} required />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold">Company Name</label>
                                    <input type="text" name="company_name" className="form-control" value={formData.company_name} onChange={handleChange} required />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label small fw-bold">Contact Person</label>
                                    <input type="text" name="contact_person" className="form-control" value={formData.contact_person} onChange={handleChange} />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label small fw-bold">Mobile Number</label>
                                    <input type="text" name="mobile_number" className="form-control" value={formData.mobile_number} onChange={handleChange} required />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label small fw-bold">WhatsApp Number</label>
                                    <input type="text" name="whatsapp_number" className="form-control" value={formData.whatsapp_number} onChange={handleChange} />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label small fw-bold">Email ID</label>
                                    <input type="email" name="email_id" className="form-control" value={formData.email_id} onChange={handleChange} />
                                </div>

                                <div className="col-md-4">
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                        <label className="form-label small fw-bold mb-0">Country</label>
                                        <div className="d-flex gap-1">
                                            <button type="button" className="btn btn-link btn-sm p-0 text-success" onClick={() => window.open("/countrymaster", "_blank")} title="Add Country"><i className="bi bi-plus-lg"></i></button>
                                            <button type="button" className="btn btn-link btn-sm p-0 text-primary" onClick={handleRefresh} title="Reload"><i className="bi bi-arrow-clockwise"></i></button>
                                        </div>
                                    </div>
                                    <select name="country" className="form-select" value={formData.country} onChange={handleChange}>
                                        <option value="">Select Country</option>
                                        {countries.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="col-md-4">
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                        <label className="form-label small fw-bold mb-0">State</label>
                                        <div className="d-flex gap-1">
                                            <button type="button" className="btn btn-link btn-sm p-0 text-success" onClick={() => window.open("/statemaster", "_blank")} title="Add State"><i className="bi bi-plus-lg"></i></button>
                                            <button type="button" className="btn btn-link btn-sm p-0 text-primary" onClick={handleRefresh} title="Reload"><i className="bi bi-arrow-clockwise"></i></button>
                                        </div>
                                    </div>
                                    <select name="state" className="form-select" value={formData.state} onChange={handleChange}>
                                        <option value="">Select State</option>
                                        {states.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div className="col-md-4">
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                        <label className="form-label small fw-bold mb-0">City</label>
                                        <div className="d-flex gap-1">
                                            <button type="button" className="btn btn-link btn-sm p-0 text-success" onClick={() => window.open("/citymaster", "_blank")} title="Add City"><i className="bi bi-plus-lg"></i></button>
                                            <button type="button" className="btn btn-link btn-sm p-0 text-primary" onClick={handleRefresh} title="Reload"><i className="bi bi-arrow-clockwise"></i></button>
                                        </div>
                                    </div>
                                    <select name="city" className="form-select" value={formData.city} onChange={handleChange}>
                                        <option value="">Select City</option>
                                        {cities.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                    </select>
                                </div>

                                <div className="col-md-4">
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                        <label className="form-label small fw-bold mb-0">Lead Source</label>
                                        <div className="d-flex gap-1">
                                            <button type="button" className="btn btn-link btn-sm p-0 text-success" onClick={() => window.open("/lead-source", "_blank")} title="Add Source"><i className="bi bi-plus-lg"></i></button>
                                            <button type="button" className="btn btn-link btn-sm p-0 text-primary" onClick={handleRefresh} title="Reload"><i className="bi bi-arrow-clockwise"></i></button>
                                        </div>
                                    </div>
                                    <select name="lead_source" className="form-select" value={formData.lead_source} onChange={handleChange}>
                                        <option value="">Select Source</option>
                                        {leadSources.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label small fw-bold">Assigned Sales Person</label>
                                    <select name="assigned_sales_person" className="form-select" value={formData.assigned_sales_person} onChange={handleChange}>
                                        <option value="">Select Sales Person</option>
                                        {salesPersons.map(s => <option key={s.id} value={s.employee_name}>{s.employee_name}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Requirement Details */}
                        <div className="mb-4">
                            <h5 className="fw-bold mb-3 text-dark border-bottom pb-2">2️⃣ Requirement Details</h5>
                            <div className="row g-3">
                                <div className="col-md-4">
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                        <label className="form-label small fw-bold mb-0">Product Type</label>
                                        <div className="d-flex gap-1">
                                            <button type="button" className="btn btn-link btn-sm p-0 text-success" onClick={() => window.open("/product-type", "_blank")} title="Add Product Type"><i className="bi bi-plus-lg"></i></button>
                                            <button type="button" className="btn btn-link btn-sm p-0 text-primary" onClick={handleRefresh} title="Reload"><i className="bi bi-arrow-clockwise"></i></button>
                                        </div>
                                    </div>
                                    <select name="product_type" className="form-select" value={formData.product_type} onChange={handleChange}>
                                        <option value="">Select Product Type</option>
                                        {productTypes.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                                    </select>
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label small fw-bold">Appointment Date & Time</label>
                                    <input type="datetime-local" name="appointment_date" className="form-control" value={formData.appointment_date} onChange={handleChange} />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label small fw-bold">Reference Image</label>
                                    <div className="d-flex gap-2">
                                        <input type="file" id="reference_image_input" name="reference_image" className="form-control" onChange={handleImageChange} accept="image/*" />
                                        {imagePreview && <button type="button" className="btn btn-outline-danger" onClick={clearImage} title="Clear Image"><i className="bi bi-x-lg"></i></button>}
                                    </div>
                                    {imagePreview && (
                                        <div className="mt-2 text-center position-relative d-inline-block">
                                            <img src={imagePreview} alt="Preview" className="img-thumbnail" style={{ maxHeight: "150px" }} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Company Details */}
                        <div className="mb-4">
                            <h5 className="fw-bold mb-3 text-dark border-bottom pb-2">3️⃣ Company Details</h5>
                            <div className="row g-3">
                                <div className="col-md-4">
                                    <label className="form-label small fw-bold">GST Number</label>
                                    <input type="text" name="gst_number" className="form-control" value={formData.gst_number} onChange={handleChange} />
                                </div>
                                <div className="col-md-8">
                                    <label className="form-label small fw-bold">Address</label>
                                    <textarea name="address" className="form-control" rows="2" value={formData.address} onChange={handleChange}></textarea>
                                </div>
                            </div>
                        </div>

                        {/* Section 4: Follow-Up Management */}
                        <div className="mb-4">
                            <h5 className="fw-bold mb-3 text-dark border-bottom pb-2">4️⃣ Follow-Up Management (Very Important 🚀)</h5>
                            <div className="row g-3">
                                <div className="col-md-3">
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                        <label className="form-label small fw-bold mb-0">Lead Status</label>
                                        <div className="d-flex gap-1">
                                            <button type="button" className="btn btn-link btn-sm p-0 text-success" onClick={() => window.open("/lead-status", "_blank")} title="Add Status"><i className="bi bi-plus-lg"></i></button>
                                            <button type="button" className="btn btn-link btn-sm p-0 text-primary" onClick={handleRefresh} title="Reload"><i className="bi bi-arrow-clockwise"></i></button>
                                        </div>
                                    </div>
                                    <select name="lead_status" className="form-select" value={formData.lead_status} onChange={handleChange}>
                                        {leadStatuses.map(s => <option key={s.id} value={s.name} style={{ color: s.color }}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label small fw-bold">Next Follow-up Date</label>
                                    <input type="date" name="next_followup_date" className="form-control" value={formData.next_followup_date} onChange={handleChange} />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label small fw-bold">Expected Closing Date</label>
                                    <input type="date" name="expected_closing_date" className="form-control" value={formData.expected_closing_date} onChange={handleChange} />
                                </div>
                                <div className="col-md-12">
                                    <label className="form-label small fw-bold">Follow-up Notes</label>
                                    <textarea name="followup_notes" className="form-control" rows="3" value={formData.followup_notes} onChange={handleChange}></textarea>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="card-footer bg-white py-3 d-flex justify-content-end gap-2">
                        <button type="button" className="btn btn-outline-secondary px-4" onClick={() => navigate("/lead-my")}>Cancel</button>
                        <button type="submit" className="btn btn-primary px-5 fw-bold shadow-sm">{isEdit ? "Update Lead" : "Save Lead"}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default LeadForm;
