import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";

const API = process.env.REACT_APP_API_URL;

export default function UomForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);

    const fetchUom = React.useCallback(async () => {
        try {
            const res = await axios.get(`${API}/uom/${id}`);
            setName(res.data.name);
        } catch (error) {
            console.error("Error fetching UOM:", error);
            toast.error("Failed to load UOM details");
        }
    }, [id]);

    useEffect(() => {
        if (isEdit) {
            fetchUom();
        }
    }, [isEdit, fetchUom]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) {
            toast.error("UOM name is required");
            return;
        }

        setLoading(true);
        try {
            if (isEdit) {
                await axios.put(`${API}/uom/${id}`, { name });
                toast.success("UOM updated successfully");
            } else {
                await axios.post(`${API}/uom`, { name });
                toast.success("UOM created successfully");
            }
            setTimeout(() => navigate("/uom"), 1500);
        } catch (error) {
            console.error("Error saving UOM:", error);
            if (error.response && error.response.status === 409) {
                toast.error("UOM name already exists");
            } else {
                toast.error("Failed to save UOM");
            }
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5">
            <ToastContainer />
            <div className="card shadow-sm border-0" style={{ maxWidth: '600px', margin: '0 auto' }}>
                <div className="card-header bg-white py-3 d-flex align-items-center">
                    <button
                        className="btn btn-light btn-sm me-3 border shadow-sm rounded-circle"
                        onClick={() => {
                            if (window.history.length <= 1) {
                                window.close();
                            } else {
                                navigate(-1);
                            }
                        }}
                        style={{ width: '32px', height: '32px' }}
                    >
                        <i className="bi bi-arrow-left"></i>
                    </button>
                    <h4 className="mb-0 fw-bold text-primary">
                        {isEdit ? "Edit UOM" : "Create New UOM"}
                    </h4>
                </div>
                <div className="card-body p-4">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="form-label fw-bold">UOM Name <span className="text-danger">*</span></label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="e.g. Kg, Box, Pcs"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <div className="d-flex justify-content-end gap-2">
                            <button
                                type="button"
                                className="btn btn-light"
                                onClick={() => {
                                    if (window.history.length <= 1) {
                                        window.close();
                                    } else {
                                        navigate("/uom");
                                    }
                                }}
                            >
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary fw-bold" disabled={loading}>
                                {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-save me-2"></i>}
                                {isEdit ? "Update UOM" : "Create UOM"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
