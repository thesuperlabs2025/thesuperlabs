import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";

const API = process.env.REACT_APP_API_URL;

const LifeCycleTemplateMaster = () => {
    const [templates, setTemplates] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [lifeCyclesMaster, setLifeCyclesMaster] = useState([]);
    const [formData, setFormData] = useState({
        id: null,
        template_name: "",
        description: "",
        items: []
    });

    useEffect(() => {
        fetchTemplates();
        fetchLifeCycles();
    }, []);

    const fetchTemplates = async () => {
        try {
            const res = await axios.get(`${API}/lifecycle-templates`);
            setTemplates(res.data);
        } catch (err) {
            toast.error("Failed to load templates");
        }
    };

    const fetchLifeCycles = async () => {
        try {
            const res = await axios.get(`${API}/life-cycles`);
            setLifeCyclesMaster(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleEdit = async (template) => {
        try {
            const res = await axios.get(`${API}/lifecycle-templates/${template.id}`);
            setFormData(res.data);
            setShowModal(true);
        } catch (err) {
            toast.error("Failed to load template details");
        }
    };

    const handleAddNew = () => {
        setFormData({
            id: null,
            template_name: "",
            description: "",
            items: [{ process_name: "", process_type: "yarn", wastage_pct: 0 }]
        });
        setShowModal(true);
    };

    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { process_name: "", process_type: "yarn", wastage_pct: 0 }]
        }));
    };

    const removeItem = (index) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...formData.items];
        if (field === 'process_name') {
            // Check for duplicates
            if (value && formData.items.some((item, i) => item.process_name === value && i !== index)) {
                toast.warning(`Process "${value}" is already added to this template.`);
                return;
            }
            const master = lifeCyclesMaster.find(m => m.process_name === value);
            newItems[index] = {
                ...newItems[index],
                process_name: value,
                process_type: master ? master.process_type : newItems[index].process_type,
                wastage_pct: master ? master.wastage : newItems[index].wastage_pct
            };
        } else {
            newItems[index][field] = value;
        }
        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const saveTemplate = async () => {
        if (!formData.template_name) return toast.warning("Template name is required");
        try {
            await axios.post(`${API}/lifecycle-templates`, formData);
            toast.success("Template saved successfully");
            setShowModal(false);
            fetchTemplates();
        } catch (err) {
            toast.error("Failed to save template");
        }
    };

    const deleteTemplate = async (id) => {
        if (!window.confirm("Are you sure you want to delete this template?")) return;
        try {
            await axios.delete(`${API}/lifecycle-templates/${id}`);
            toast.success("Template deleted");
            fetchTemplates();
        } catch (err) {
            toast.error("Failed to delete template");
        }
    };

    return (
        <div className="container-fluid py-4 min-vh-100 bg-light">
            <ToastContainer position="top-right" autoClose={3000} />
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="fw-bold mb-0">Life Cycle Template Master</h4>
                    <p className="text-muted small mb-0">Standardize your production workflows</p>
                </div>
                <button className="btn btn-primary rounded-pill px-4 fw-bold" onClick={handleAddNew}>
                    <i className="bi bi-plus-lg me-2"></i>Create New Template
                </button>
            </div>

            <div className="row g-3">
                {templates.map(t => (
                    <div className="col-md-4" key={t.id}>
                        <div className="card border-0 shadow-sm h-100 rounded-3 overflow-hidden">
                            <div className="card-body">
                                <div className="d-flex justify-content-between">
                                    <h6 className="fw-bold text-dark">{t.template_name}</h6>
                                    <div className="dropdown">
                                        <button className="btn btn-sm btn-light rounded-circle p-0" style={{ width: 30, height: 30 }} data-bs-toggle="dropdown">
                                            <i className="bi bi-three-dots-vertical"></i>
                                        </button>
                                        <ul className="dropdown-menu dropdown-menu-end shadow-sm border-0">
                                            <li><button className="dropdown-item py-2" onClick={() => handleEdit(t)}><i className="bi bi-pencil me-2 text-primary"></i>Edit Template</button></li>
                                            <li><hr className="dropdown-divider" /></li>
                                            <li><button className="dropdown-item py-2 text-danger" onClick={() => deleteTemplate(t.id)}><i className="bi bi-trash me-2"></i>Delete</button></li>
                                        </ul>
                                    </div>
                                </div>
                                <p className="text-muted small mb-3">{t.description || "No description provided."}</p>
                                <div className="d-flex align-items-center gap-2 mt-auto">
                                    <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-3">
                                        <i className="bi bi-layers me-1 text-primary"></i>Master Template
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                {templates.length === 0 && (
                    <div className="col-12 text-center py-5">
                        <div className="py-5 bg-white rounded-3 border dashed">
                            <i className="bi bi-diagram-3 fs-1 text-muted opacity-25"></i>
                            <h5 className="mt-3 text-muted">No Templates Defined</h5>
                            <button className="btn btn-link text-primary mt-2" onClick={handleAddNew}>Create your first template now</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Template Modal */}
            {showModal && (
                <div className="modal fade show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                        <div className="modal-content border-0 shadow rounded-4" style={{ maxHeight: '90vh' }}>
                            <div className="modal-header border-0 pb-0 pt-4 px-4 sticky-top bg-white">
                                <div>
                                    <h5 className="modal-title fw-bold">{formData.id ? "Edit Template" : "New Life Cycle Template"}</h5>
                                    <p className="text-muted x-small mb-0">Define the sequence of processes for this template</p>
                                </div>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body p-4">
                                <div className="row g-3 mb-4">
                                    <div className="col-md-12">
                                        <label className="form-label fw-bold small text-muted">Template Name</label>
                                        <input
                                            type="text"
                                            className="form-control rounded-3 border-2"
                                            placeholder="e.g., T-Shirt Wash & Pack Cycle"
                                            value={formData.template_name}
                                            onChange={e => setFormData({ ...formData, template_name: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-md-12">
                                        <label className="form-label fw-bold small text-muted">Description (Optional)</label>
                                        <textarea
                                            className="form-control rounded-3"
                                            rows="2"
                                            placeholder="Details about when to use this template..."
                                            value={formData.description}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        ></textarea>
                                    </div>
                                </div>

                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h6 className="fw-bold mb-0">Processes Sequence</h6>
                                    <button className="btn btn-outline-primary btn-sm rounded-pill px-3 fw-bold" onClick={addItem}>
                                        <i className="bi bi-plus-lg me-1"></i>Add Process
                                    </button>
                                </div>

                                <div className="table-responsive">
                                    <table className="table table-borderless align-middle">
                                        <thead>
                                            <tr>
                                                <th className="x-small fw-bold text-muted" style={{ width: 50 }}>ORD</th>
                                                <th className="x-small fw-bold text-muted">PROCESS NAME</th>
                                                <th className="x-small fw-bold text-muted" style={{ width: 120 }}>TYPE</th>
                                                <th className="x-small fw-bold text-muted" style={{ width: 100 }}>WASTAGE%</th>
                                                <th style={{ width: 50 }}></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {formData.items.map((item, idx) => (
                                                <tr key={idx} className="border-bottom- dashed">
                                                    <td>
                                                        <span className="badge bg-light text-dark border rounded-circle" style={{ width: 24, height: 24, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            {idx + 1}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <select
                                                            className="form-select form-select-sm rounded-3 border-0 bg-light"
                                                            value={item.process_name}
                                                            onChange={e => handleItemChange(idx, 'process_name', e.target.value)}
                                                        >
                                                            <option value="">Select Process Master...</option>
                                                            {lifeCyclesMaster.map(m => (
                                                                <option key={m.id} value={m.process_name}>{m.process_name}</option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td>
                                                        <select
                                                            className="form-select form-select-sm rounded-3 border-0 bg-light"
                                                            value={item.process_type || 'yarn'}
                                                            onChange={e => handleItemChange(idx, 'process_type', e.target.value)}
                                                        >
                                                            <option value="yarn">YARN</option>
                                                            <option value="fabric">FABRIC</option>
                                                            <option value="pcs">PCS</option>
                                                        </select>
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            className="form-control form-control-sm rounded-3 border-0 bg-light text-center"
                                                            placeholder="0.0"
                                                            value={item.wastage_pct}
                                                            onChange={e => handleItemChange(idx, 'wastage_pct', e.target.value)}
                                                        />
                                                    </td>
                                                    <td>
                                                        <button className="btn btn-link link-danger p-0" onClick={() => removeItem(idx)}>
                                                            <i className="bi bi-trash"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {formData.items.length === 0 && (
                                                <tr>
                                                    <td colSpan="5" className="text-center py-4 text-muted x-small">No processes added. Click "Add Process" to begin.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="modal-footer border-0 p-4 sticky-bottom bg-white">
                                <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="button" className="btn btn-primary rounded-pill px-5 fw-bold" onClick={saveTemplate}>Save Template</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .dashed { border: 2px dashed #dee2e6 !important; }
                .border-bottom-dashed { border-bottom: 1px dashed #dee2e6; }
                .form-control:focus, .form-select:focus {
                    box-shadow: 0 0 0 4px rgba(13, 110, 253, 0.1);
                    border-color: #0d6efd;
                }
                .card:hover { transform: translateY(-3px); transition: all 0.3s ease; }
            `}</style>
        </div>
    );
};

export default LifeCycleTemplateMaster;
