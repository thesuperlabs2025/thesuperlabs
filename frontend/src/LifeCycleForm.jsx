import Loader from "./Loader";
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion } from "framer-motion";

const API = process.env.REACT_APP_API_URL;

const LifeCycleForm = () => {
    const navigate = useNavigate();
    const [processes, setProcesses] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchProcesses = useCallback(async () => {
        try {
            const res = await axios.get(`${API}/life-cycles`);
            if (res.data.length > 0) {
                setProcesses(res.data.map(p => ({
                    id: p.id,
                    processName: p.process_name,
                    type: p.process_type,
                    wastage: p.wastage,
                    sortOrder: p.sort_order || 0
                })));
            } else {
                setProcesses([{ id: Date.now(), processName: "", type: "yarn", wastage: "", sortOrder: 1 }]);
            }
        } catch (err) {
            console.error("Error fetching life cycles:", err);
            toast.error("Failed to load existing processes");
            setProcesses([{ id: Date.now(), processName: "", type: "yarn", wastage: "", sortOrder: 1 }]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        document.title = "Life Cycle Setup - TSL ERP";
        fetchProcesses();
    }, [fetchProcesses]);

    const handleProcessNameChange = (id, value) => {
        let formattedValue = value.replace(/[^a-zA-Z\s]/g, "");
        if (formattedValue.length > 0) {
            formattedValue = formattedValue.charAt(0).toUpperCase() + formattedValue.slice(1).toLowerCase();
        }
        setProcesses(prev => prev.map(p => p.id === id ? { ...p, processName: formattedValue } : p));
    };

    const handleWastageChange = (id, value) => {
        const formattedValue = value.replace(/[^0-9]/g, "");
        setProcesses(prev => prev.map(p => p.id === id ? { ...p, wastage: formattedValue } : p));
    };

    const handleSortOrderChange = (id, value) => {
        const formattedValue = value.replace(/[^0-9]/g, "");
        setProcesses(prev => prev.map(p => p.id === id ? { ...p, sortOrder: formattedValue } : p));
    };

    const handleTypeChange = (id, value) => {
        setProcesses(prev => prev.map(p => p.id === id ? { ...p, type: value } : p));
    };

    const addRow = () => {
        const nextSort = processes.length + 1;
        setProcesses(prev => [...prev, { id: Date.now(), processName: "", type: "yarn", wastage: "", sortOrder: nextSort }]);
    };

    const removeRow = (id) => {
        if (processes.length > 1) {
            setProcesses(prev => prev.filter(p => p.id !== id));
        }
    };

    const handleSave = async () => {
        const validProcesses = processes.filter(p => p.processName);
        if (validProcesses.length === 0 && processes.length > 0) {
            return toast.error("Please enter at least one process name");
        }

        try {
            await axios.post(`${API}/life-cycles/save-all`, { processes: validProcesses });
            toast.success("Life Cycle Configuration Saved Successfully!");
        } catch (err) {
            console.error("Save error:", err);
            toast.error("Failed to save Life Cycle");
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
                        <h5 className="fw-bold mb-0">Production Life Cycle Master</h5>
                        <small className="text-muted">Configure your standard manufacturing sequence</small>
                    </div>
                </div>
                <button className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm" onClick={handleSave}>
                    <i className="bi bi-check2-circle me-2"></i> Save Changes
                </button>
            </div>

            <div className="container py-5">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card shadow-sm border-0 rounded-4 overflow-hidden"
                >
                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead style={{ backgroundColor: 'black', color: 'white' }}>
                                    <tr>
                                        <th className="px-4 py-3 small fw-bold text-uppercase" style={{ width: '50px' }}>#</th>
                                        <th className="py-3 small fw-bold text-uppercase">Process Name</th>
                                        <th className="py-3 small fw-bold text-uppercase" style={{ width: '200px' }}>Type</th>
                                        <th className="py-3 small fw-bold text-uppercase text-center" style={{ width: '150px' }}>Wastage (%)</th>
                                        <th className="py-3 small fw-bold text-uppercase text-center" style={{ width: '120px' }}>Sort Order</th>
                                        <th className="py-3 small fw-bold text-uppercase text-end px-4" style={{ width: '100px' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {processes.map((p, index) => (
                                        <tr key={p.id}>
                                            <td className="px-4 text-muted small fw-bold">{index + 1}</td>
                                            <td>
                                                <input
                                                    type="text"
                                                    className="form-control border-0 bg-light rounded-3 shadow-none p-2 fs-6"
                                                    placeholder="e.g. Knitting"
                                                    value={p.processName}
                                                    onChange={(e) => handleProcessNameChange(p.id, e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <select
                                                    className="form-select border-0 bg-light rounded-3 shadow-none p-2 fs-6"
                                                    value={p.type}
                                                    onChange={(e) => handleTypeChange(p.id, e.target.value)}
                                                >
                                                    <option value="yarn">Yarn</option>
                                                    <option value="fabric">Fabric</option>
                                                    <option value="pcs">Pcs</option>
                                                </select>
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    className="form-control border-0 bg-light rounded-3 text-center shadow-none p-2 fs-6"
                                                    placeholder="0"
                                                    value={p.wastage}
                                                    onChange={(e) => handleWastageChange(p.id, e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    className="form-control border-0 bg-light rounded-3 text-center shadow-none p-2 fs-6 fw-bold"
                                                    value={p.sortOrder}
                                                    onChange={(e) => handleSortOrderChange(p.id, e.target.value)}
                                                />
                                            </td>
                                            <td className="text-end px-4">
                                                <button
                                                    className="btn btn-outline-danger btn-sm border-0 rounded-circle"
                                                    onClick={() => removeRow(p.id)}
                                                    disabled={processes.length === 1}
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
                                <i className="bi bi-plus-lg me-2"></i> Add New Process
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Info Note */}
                <div className="mt-4 p-4 bg-primary bg-opacity-10 rounded-4 border border-primary border-opacity-25">
                    <div className="d-flex align-items-start">
                        <div className="bg-white p-2 rounded-circle text-primary me-3 shadow-sm">
                            <i className="bi bi-info-circle-fill fs-5"></i>
                        </div>
                        <div>
                            <h6 className="fw-bold text-primary mb-1">Configuration Note</h6>
                            <p className="small text-muted mb-0">
                                This sequence defines the standard workflow for garments.
                                The first letter of each process name is automatically capitalized, and wastage input is restricted to numbers only.
                                You can set a custom sort order to arrange processes as they appear in the production flow.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
};

export default LifeCycleForm;
