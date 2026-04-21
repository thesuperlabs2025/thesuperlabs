import Loader from "./Loader";
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion } from "framer-motion";

const API = process.env.REACT_APP_API_URL;

const BodyPartForm = () => {
    const navigate = useNavigate();
    const [parts, setParts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchParts = useCallback(async () => {
        try {
            const res = await axios.get(`${API}/body-parts`);
            if (res.data.length > 0) {
                setParts(res.data.map(p => ({
                    id: p.id,
                    partName: p.part_name
                })));
            } else {
                setParts([{ id: Date.now(), partName: "" }]);
            }
        } catch (err) {
            console.error("Error fetching body parts:", err);
            toast.error("Failed to load existing body parts");
            setParts([{ id: Date.now(), partName: "" }]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        document.title = "Body Part Master - TSL ERP";
        fetchParts();
    }, [fetchParts]);

    const handlePartNameChange = (id, value) => {
        let formattedValue = value;
        if (formattedValue.length > 0) {
            formattedValue = formattedValue.charAt(0).toUpperCase() + formattedValue.slice(1);
        }
        setParts(prev => prev.map(p => p.id === id ? { ...p, partName: formattedValue } : p));
    };

    const addRow = () => {
        setParts(prev => [...prev, { id: Date.now(), partName: "" }]);
    };

    const removeRow = async (id) => {
        if (parts.length > 1) {
            // Check if it's a saved part (has numeric ID from DB, usually)
            // For simplicity, let's just filter it out if not saved, or handle DB delete if requested.
            // But usually, "Save Changes" handles syncing. 
            // However, body_parts route has a delete endpoint. Let's use it if id looks like a DB id.
            if (typeof id === 'number' && id < 1000000000000) { // Simple check for Date.now() vs DB auto-inc
                try {
                    await axios.delete(`${API}/body-parts/${id}`);
                    toast.success("Part deleted");
                } catch (err) {
                    toast.error("Error deleting part from database");
                    return;
                }
            }
            setParts(prev => prev.filter(p => p.id !== id));
        }
    };

    const handleSave = async () => {
        const validParts = parts.filter(p => p.partName.trim());
        if (validParts.length === 0 && parts.length > 0) {
            return toast.error("Please enter at least one body part name");
        }

        try {
            // We need a save-all endpoint for body-parts similar to life-cycles
            // If it doesn't exist, we should probably add it or loop.
            // Let's check if the backend routes/body_parts.js has it.
            // Based on my previous tool call, it only had GET, POST, DELETE.
            // I'll update the backend to have save-all too.
            await axios.post(`${API}/body-parts/save-all`, { parts: validParts });
            toast.success("Body Parts Saved Successfully!");
            fetchParts();
        } catch (err) {
            console.error("Save error:", err);
            toast.error("Failed to save Body Parts");
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="min-vh-100 bg-light">
            <div className="bg-white border-bottom px-4 py-3 d-flex justify-content-between align-items-center sticky-top shadow-sm">
                <div className="d-flex align-items-center">
                    <button className="btn btn-sm btn-light me-3 rounded-circle border" onClick={() => navigate("/garments")}>
                        <i className="bi bi-chevron-left"></i>
                    </button>
                    <div>
                        <h5 className="fw-bold mb-0">Body Part Master</h5>
                        <small className="text-muted">Manage standard body parts for style planning</small>
                    </div>
                </div>
                <button className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm" onClick={handleSave}>
                    <i className="bi bi-check2-circle me-2"></i> Save Changes
                </button>
            </div>

            <div className="container py-5" style={{ maxWidth: '800px' }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card shadow-sm border-0 rounded-4 overflow-hidden"
                >
                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="bg-dark text-white">
                                    <tr>
                                        <th className="px-4 py-3 small fw-bold text-uppercase" style={{ width: '50px' }}>#</th>
                                        <th className="py-3 small fw-bold text-uppercase">Part Name</th>
                                        <th className="py-3 small fw-bold text-uppercase text-end px-4" style={{ width: '100px' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {parts.map((p, index) => (
                                        <tr key={p.id}>
                                            <td className="px-4 text-muted small fw-bold">{index + 1}</td>
                                            <td>
                                                <input
                                                    type="text"
                                                    className="form-control border-0 bg-light rounded-3 shadow-none p-2 fs-6"
                                                    placeholder="e.g. Front, Back, Sleeve"
                                                    value={p.partName}
                                                    onChange={(e) => handlePartNameChange(p.id, e.target.value)}
                                                />
                                            </td>
                                            <td className="text-end px-4">
                                                <button
                                                    className="btn btn-outline-danger btn-sm border-0 rounded-circle"
                                                    onClick={() => removeRow(p.id)}
                                                    disabled={parts.length === 1}
                                                >
                                                    <i className="bi bi-trash"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="p-4 border-top bg-light bg-opacity-50">
                            <button
                                className="btn btn-outline-primary rounded-pill px-4 fw-bold"
                                onClick={addRow}
                            >
                                <i className="bi bi-plus-lg me-2"></i> Add New Part
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
            <ToastContainer />
        </div>
    );
};

export default BodyPartForm;
