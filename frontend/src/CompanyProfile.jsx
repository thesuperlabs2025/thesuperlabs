import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CompanyProfile = () => {
    const [profile, setProfile] = useState({
        company_name: "",
        gst_no: "",
        mobile: "",
        email: "",
        address: "",
        pincode: "",
        bank_name: "",
        account_name: "",
        ifsc_code: "",
        account_number: "",
        logo: ""
    });

    const [logoFile, setLogoFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState("");

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/company-profile`);
            if (res.data) {
                setProfile(res.data);
                if (res.data.logo) {
                    setPreviewUrl(`${process.env.REACT_APP_API_URL}/uploads/${res.data.logo}`);
                }
            }
        } catch (err) {
            console.error("Error fetching profile:", err);
            toast.error("Failed to load company profile");
        }
    };

    const handleInputChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogoFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        Object.keys(profile).forEach(key => {
            if (key !== 'logo') formData.append(key, profile[key]);
        });

        if (logoFile) {
            formData.append('logo', logoFile);
        } else {
            formData.append('logo', profile.logo); // Send existing filename if no new file
        }

        try {
            await axios.put(`${process.env.REACT_APP_API_URL}/company-profile`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success("Company profile updated successfully!");
            fetchProfile(); // Refresh to get the latest logo filename if changed
        } catch (err) {
            console.error("Error updating profile:", err);
            toast.error("Failed to update company profile");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-fluid py-4">
            <ToastContainer position="top-right" autoClose={3000} />
            <div className="row justify-content-center">
                <div className="col-md-10 col-lg-8">
                    <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
                        <div className="card-header bg-dark text-white p-4">
                            <div className="d-flex align-items-center">
                                <div className="bg-primary rounded-circle p-3 me-3">
                                    <i className="bi bi-building fs-3 text-white"></i>
                                </div>
                                <div>
                                    <h3 className="mb-0 fw-bold">Company Profile</h3>
                                    <p className="mb-0 opacity-75">Manage your business information, logo and banking details</p>
                                </div>
                            </div>
                        </div>
                        <div className="card-body p-4 p-md-5 bg-light">
                            <form onSubmit={handleSubmit}>
                                {/* Logo Selection */}
                                <div className="mb-5 text-center">
                                    <h5 className="fw-bold text-primary mb-4 border-bottom pb-2 text-start">
                                        <i className="bi bi-image me-2"></i>Company Logo
                                    </h5>
                                    <div className="d-inline-block position-relative">
                                        <div className="rounded-circle border border-3 border-white shadow-sm overflow-hidden bg-white" style={{ width: '150px', height: '150px' }}>
                                            {previewUrl ? (
                                                <img src={previewUrl} alt="Logo Preview" className="w-100 h-100 object-fit-contain" />
                                            ) : (
                                                <div className="w-100 h-100 d-flex align-items-center justify-content-center text-muted bg-light">
                                                    <i className="bi bi-camera fs-1"></i>
                                                </div>
                                            )}
                                        </div>
                                        <label htmlFor="logo-upload" className="btn btn-primary btn-sm rounded-circle position-absolute bottom-0 end-0 shadow-sm p-2" style={{ transform: 'translate(10%, 10%)' }}>
                                            <i className="bi bi-pencil-fill"></i>
                                            <input type="file" id="logo-upload" className="d-none" accept="image/*" onChange={handleLogoChange} />
                                        </label>
                                    </div>
                                    <p className="text-muted small mt-2">Recommended: Square PNG or JPG</p>
                                </div>

                                {/* Basic Information */}
                                <div className="mb-5">
                                    <h5 className="fw-bold text-primary mb-4 border-bottom pb-2">
                                        <i className="bi bi-info-circle me-2"></i>General Information
                                    </h5>
                                    <div className="row g-3">
                                        <div className="col-md-12">
                                            <label className="form-label fw-bold small text-secondary">Company Name</label>
                                            <input type="text" name="company_name" className="form-control form-control-lg border-0 shadow-sm rounded-3" value={profile.company_name} onChange={handleInputChange} placeholder="Enter official company name" required />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-bold small text-secondary">GST Number</label>
                                            <input type="text" name="gst_no" className="form-control border-0 shadow-sm rounded-3" value={profile.gst_no} onChange={handleInputChange} placeholder="GSTIN..." />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-bold small text-secondary">Mobile Number</label>
                                            <input type="text" name="mobile" className="form-control border-0 shadow-sm rounded-3" value={profile.mobile} onChange={handleInputChange} placeholder="Contact number..." />
                                        </div>
                                        <div className="col-md-12">
                                            <label className="form-label fw-bold small text-secondary">Email Address</label>
                                            <input type="email" name="email" className="form-control border-0 shadow-sm rounded-3" value={profile.email} onChange={handleInputChange} placeholder="Official email..." />
                                        </div>
                                        <div className="col-md-9">
                                            <label className="form-label fw-bold small text-secondary">Address</label>
                                            <textarea name="address" className="form-control border-0 shadow-sm rounded-3" value={profile.address} onChange={handleInputChange} placeholder="Street address, building, etc." rows="3"></textarea>
                                        </div>
                                        <div className="col-md-3">
                                            <label className="form-label fw-bold small text-secondary">Pincode</label>
                                            <input type="text" name="pincode" className="form-control border-0 shadow-sm rounded-3" value={profile.pincode} onChange={handleInputChange} placeholder="6-digit PIN" />
                                        </div>
                                    </div>
                                </div>

                                {/* Banking Details */}
                                <div className="mb-5">
                                    <h5 className="fw-bold text-primary mb-4 border-bottom pb-2">
                                        <i className="bi bi-bank me-2"></i>Banking Details
                                    </h5>
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label fw-bold small text-secondary">Bank Name</label>
                                            <input type="text" name="bank_name" className="form-control border-0 shadow-sm rounded-3" value={profile.bank_name} onChange={handleInputChange} placeholder="Name of the bank" />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-bold small text-secondary">Account Name</label>
                                            <input type="text" name="account_name" className="form-control border-0 shadow-sm rounded-3" value={profile.account_name} onChange={handleInputChange} placeholder="Account holder name" />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-bold small text-secondary">Account Number</label>
                                            <input type="text" name="account_number" className="form-control border-0 shadow-sm rounded-3" value={profile.account_number} onChange={handleInputChange} placeholder="Bank account number" />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-bold small text-secondary">IFSC Code</label>
                                            <input type="text" name="ifsc_code" className="form-control border-0 shadow-sm rounded-3" value={profile.ifsc_code} onChange={handleInputChange} placeholder="IFSC" />
                                        </div>
                                    </div>
                                </div>

                                <div className="d-grid mt-4">
                                    <button type="submit" className="btn btn-primary btn-lg fw-bold shadow-sm rounded-pill py-3" disabled={loading}>
                                        {loading ? (
                                            <><span className="spinner-border spinner-border-sm me-2"></span> Saving...</>
                                        ) : (
                                            <>Save Profile Changes</>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompanyProfile;
