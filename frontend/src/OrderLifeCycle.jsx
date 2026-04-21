import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const API = process.env.REACT_APP_API_URL;

const TYPE_COLORS = {
    yarn: { bg: 'bg-primary-subtle', text: 'text-primary', border: 'border-primary-subtle' },
    fabric: { bg: 'bg-success-subtle', text: 'text-success', border: 'border-success-subtle' },
    pcs: { bg: 'bg-warning-subtle', text: 'text-warning', border: 'border-warning-subtle' },
};

/* Multi-select using native <select> for Trims Lifecycle processes */
const MultiSelectDropdown = ({ options, selected, onChange, disabled }) => {
    const selectedArr = selected ? selected.split(',').map(s => s.trim()).filter(Boolean) : [];
    const availableOptions = options.filter(opt => !selectedArr.includes(opt));

    const handleAdd = (e) => {
        const val = e.target.value;
        if (!val || disabled) return;
        onChange([...selectedArr, val].join(', '));
        e.target.value = '';
    };

    const handleRemove = (val) => {
        if (disabled) return;
        onChange(selectedArr.filter(s => s !== val).join(', '));
    };

    return (
        <div>
            <select
                className="form-select form-select-sm"
                style={{ borderRadius: '8px' }}
                onChange={handleAdd}
                disabled={disabled || availableOptions.length === 0}
                value=""
            >
                <option value="">{availableOptions.length > 0 ? 'Select process...' : 'All selected'}</option>
                {availableOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                ))}
            </select>
            {selectedArr.length > 0 && (
                <div className="d-flex flex-wrap gap-1 mt-1">
                    {selectedArr.map(s => (
                        <span key={s} className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1" style={{ fontSize: '0.72rem' }}>
                            {s}
                            {!disabled && <i className="bi bi-x ms-1" style={{ cursor: 'pointer' }} onClick={() => handleRemove(s)}></i>}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
};

const OrderLifeCycle = ({ orderId, onSaveSuccess, isLocked }) => {
    const [loading, setLoading] = useState(false);
    const [lifeCyclesMaster, setLifeCyclesMaster] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState("");
    const [rows, setRows] = useState([]);
    const [trimsRows, setTrimsRows] = useState([]);
    const [fabricInHouseProcess, setFabricInHouseProcess] = useState("");

    const fetchTemplates = async () => {
        try {
            const res = await axios.get(`${API}/lifecycle-templates`);
            setTemplates(res.data);
        } catch (err) {
            console.error("Failed to fetch templates:", err);
        }
    };

    const fetchData = useCallback(async () => {
        if (!orderId || orderId === 'undefined' || isNaN(orderId)) return;
        try {
            const [master, existing] = await Promise.all([
                axios.get(`${API}/life-cycles`),
                axios.get(`${API}/order-planning-v2/all/${orderId}`)
            ]);

            setLifeCyclesMaster(master.data || []);

            // Main Lifecycle
            const lifecycleData = existing.data.lifecycle || [];
            if (lifecycleData.length > 0) {
                setRows(lifecycleData.map(r => ({
                    id: r.id || Date.now() + Math.random(),
                    process_name: r.process_name || "",
                    process_type: r.process_type || "",
                    custom_name: r.custom_name || "",
                    wastage_pct: r.wastage_pct || 0
                })));
            } else {
                setRows([{ id: Date.now(), process_name: "", process_type: "", custom_name: "", wastage_pct: 0 }]);
            }

            // Detect Fabric In-House Process (e.g. from existing planning or metadata)
            // For now, we'll try to find it from the first fabric process in lifecycle
            const savedProcess = existing.data.planning?.fabric_in_house_process;
            if (savedProcess) {
                setFabricInHouseProcess(savedProcess);
            } else {
                const firstFabricProcess = lifecycleData.find(r => r.process_type === 'fabric')?.process_name || "";
                setFabricInHouseProcess(firstFabricProcess);
            }

            // Trims Lifecycle - Source from Trims Planning
            const planningTrims = existing.data.trims || [];
            const existingTrimsLC = existing.data.trims_lifecycle || [];

            if (planningTrims.length > 0) {
                setTrimsRows(planningTrims.map(pt => {
                    const found = existingTrimsLC.find(lc => lc.trim_name === pt.trims_name);
                    return {
                        id: pt.id || Date.now() + Math.random(),
                        trim_name: pt.trims_name,
                        color: pt.color,
                        qty: pt.qty_per_pcs, // Or actual total qty if available
                        process_name: found ? found.process_name : "",
                        wastage_pct: found ? (found.wastage_pct || 0) : 0
                    };
                }));
            } else {
                setTrimsRows([]);
            }

        } catch (err) {
            console.error(err);
            toast.error("Failed to load lifecycle data");
        }
    }, [orderId]);

    useEffect(() => {
        fetchData();
        fetchTemplates();
    }, [fetchData]);

    const addRow = () => {
        setRows(prev => [...prev, { id: Date.now(), process_name: "", process_type: "", custom_name: "", wastage_pct: 0 }]);
    };

    const removeRow = (id) => setRows(prev => prev.filter(r => r.id !== id));

    const handleChange = (id, field, val) => {
        setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: val } : r));
    };

    const handleTrimRowChange = (id, field, val) => {
        setTrimsRows(prev => prev.map(r => r.id === id ? { ...r, [field]: val } : r));
    };

    const handleProcessSelect = (id, processName) => {
        // Prevent duplicates
        if (rows.some(r => r.process_name === processName && r.id !== id)) {
            toast.warning(`Process "${processName}" is already added.`);
            return;
        }

        const master = lifeCyclesMaster.find(m => m.process_name === processName);
        setRows(prev => prev.map(r => {
            if (r.id !== id) return r;
            return {
                ...r,
                process_name: processName,
                process_type: master ? master.process_type : "",
                wastage_pct: master ? (parseFloat(master.wastage) || 0) : r.wastage_pct,
                custom_name: ""
            };
        }));
    };

    const loadTemplate = async (templateId) => {
        if (!templateId) return;
        setLoading(true);
        try {
            const res = await axios.get(`${API}/lifecycle-templates/${templateId}`);
            if (res.data && res.data.items) {
                setRows(res.data.items.map(item => ({
                    id: Date.now() + Math.random(),
                    process_name: item.process_name,
                    process_type: item.process_type,
                    custom_name: item.custom_name || "",
                    wastage_pct: item.wastage_pct || 0
                })));
                toast.success(`Template ${res.data.template_name} loaded!`);
            }
        } catch (err) {
            toast.error("Failed to load template");
        } finally {
            setLoading(false);
            setSelectedTemplate("");
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await Promise.all([
                axios.post(`${API}/order-planning-v2/lifecycle`, {
                    order_id: orderId,
                    items: rows,
                    fabric_in_house_process: fabricInHouseProcess
                }),
                axios.post(`${API}/order-planning-v2/trims-lifecycle`, {
                    order_id: orderId,
                    items: trimsRows
                })
            ]);
            toast.success("All Life Cycle Plans Saved!");
            if (onSaveSuccess) onSaveSuccess();
        } catch (err) {
            toast.error("Failed to save life cycle");
        } finally {
            setLoading(false);
        }
    };

    const totalWastage = rows.reduce((sum, r) => sum + (parseFloat(r.wastage_pct) || 0), 0);

    return (
        <div className="p-2 planning-section">
            <style>{`
                .planning-section { font-size: 0.85rem; }
                .planning-section .form-control, 
                .planning-section .form-select,
                .planning-section .btn { font-size: 0.85rem; }
                .planning-section .table thead th { font-size: 0.72rem; letter-spacing: 0.02rem; text-transform: uppercase; }
                .x-small { font-size: 0.75rem; }
            `}</style>
            {/* Summary Bar */}
            <div className="d-flex align-items-center gap-3 mb-4 p-3 bg-light rounded-3 border">
                <div className="d-flex align-items-center gap-2">
                    <div className="bg-dark text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: 36, height: 36 }}>
                        <i className="bi bi-arrow-repeat fs-6"></i>
                    </div>
                    <div>
                        <div className="fw-bold small text-dark">Production Life Cycle</div>
                        <div className="x-small text-muted">{rows.length} process{rows.length !== 1 ? 'es' : ''} planned</div>
                    </div>
                </div>
                <div className="ms-auto d-flex align-items-center gap-3">
                    <div className="text-center">
                        <div className={`fw-bold fs-6 ${totalWastage > 0 ? 'text-danger' : 'text-muted'}`}>{totalWastage.toFixed(1)}%</div>
                        <div className="x-small text-muted">Total Wastage</div>
                    </div>
                    <div className="text-center">
                        <div className="fw-bold fs-6 text-dark">{rows.length}</div>
                        <div className="x-small text-muted">Processes</div>
                    </div>
                </div>
            </div>

            {/* Main Lifecycle Table */}
            <div className="rounded-3 border overflow-hidden shadow-sm mb-5">
                <div className="bg-dark text-white px-3 py-2 d-flex align-items-center justify-content-between">
                    <h6 className="fw-bold mb-0 small">
                        <i className="bi bi-arrow-repeat me-2 text-primary"></i>
                        Operation Life Cycle
                    </h6>
                    {!isLocked && (
                        <div className="d-flex align-items-center gap-2">
                            <div className="input-group input-group-sm" style={{ width: '320px' }}>
                                <select
                                    className="form-select rounded-start-pill ps-3"
                                    style={{ backgroundColor: '#3d4451', color: '#fff', borderColor: '#4b5563' }}
                                    value={selectedTemplate}
                                    onChange={(e) => loadTemplate(e.target.value)}
                                >
                                    <option value="">Load from Template...</option>
                                    {templates.map(t => (
                                        <option key={t.id} value={t.id}>{t.template_name}</option>
                                    ))}
                                </select>
                                <button
                                    className="btn btn-outline-light border-secondary px-2"
                                    onClick={() => {
                                        fetchTemplates();
                                        toast.info("Templates refreshed");
                                    }}
                                    title="Refresh Templates"
                                    type="button"
                                >
                                    <i className="bi bi-arrow-clockwise"></i>
                                </button>
                                <button
                                    className="btn btn-primary rounded-end-pill px-3"
                                    onClick={() => window.open("/lifecycle-templates", "_blank")}
                                    title="Create/Manage Templates"
                                    type="button"
                                >
                                    <i className="bi bi-plus-lg"></i>
                                </button>
                            </div>
                            <button className="btn btn-primary btn-sm rounded-pill px-3" onClick={addRow}>
                                <i className="bi bi-plus-lg me-1 x-small"></i> Add Process
                            </button>
                        </div>
                    )}
                </div>

                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th className="ps-3 x-small fw-bold" style={{ width: '40px' }}>#</th>
                                <th className="x-small fw-bold">Process Name</th>
                                <th className="text-center x-small fw-bold" style={{ width: '130px' }}>Type</th>
                                <th className="text-center x-small fw-bold" style={{ width: '140px' }}>Wastage %</th>
                                {!isLocked && <th style={{ width: '50px' }}></th>}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, idx) => {
                                const typeKey = (row.process_type || 'yarn').toLowerCase();
                                const typeStyle = TYPE_COLORS[typeKey] || TYPE_COLORS.yarn;
                                return (
                                    <tr key={row.id}>
                                        <td className="ps-3 py-2">
                                            <span className="badge bg-secondary-subtle text-secondary border rounded-circle fw-bold"
                                                style={{ width: '26px', height: '26px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>
                                                {idx + 1}
                                            </span>
                                        </td>
                                        <td className="py-2">
                                            <div className="d-flex flex-column gap-1">
                                                <select
                                                    className="form-select form-select-sm fw-bold"
                                                    value={row.process_name}
                                                    onChange={(e) => handleProcessSelect(row.id, e.target.value)}
                                                    disabled={isLocked}
                                                    style={{ borderRadius: '8px' }}
                                                >
                                                    <option value="">Select Process...</option>
                                                    {lifeCyclesMaster.map(m => (
                                                        <option key={m.id} value={m.process_name}>{m.process_name}</option>
                                                    ))}
                                                </select>
                                                {/* Assigned Trims for this process */}
                                                {trimsRows.filter(tr => tr.process_name.split(',').map(s => s.trim()).includes(row.process_name)).length > 0 && (
                                                    <div className="mt-1 ps-2 border-start border-2 border-warning">
                                                        <div className="fw-bold x-small text-warning mb-1">Associated Trims:</div>
                                                        <table className="table table-sm table-bordered mb-0" style={{ fontSize: '0.65rem' }}>
                                                            <thead className="bg-light">
                                                                <tr>
                                                                    <th>Trim</th>
                                                                    <th>Color</th>
                                                                    <th className="text-end">Qty</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {trimsRows.filter(tr => tr.process_name.split(',').map(s => s.trim()).includes(row.process_name)).map((tr, tidx) => (
                                                                    <tr key={tidx}>
                                                                        <td>{tr.trim_name}</td>
                                                                        <td>{tr.color}</td>
                                                                        <td className="text-end">{tr.qty}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="text-center">
                                            <select
                                                className={`form-select form-select-sm fw-bold text-center ${typeStyle.text}`}
                                                style={{ letterSpacing: '0.03em', borderRadius: '6px', border: '1px solid #dee2e6', background: '#fff' }}
                                                value={row.process_type || 'yarn'}
                                                onChange={(e) => handleChange(row.id, 'process_type', e.target.value)}
                                                disabled={isLocked}
                                            >
                                                <option value="yarn">YARN</option>
                                                <option value="fabric">FABRIC</option>
                                                <option value="pcs">PCS</option>
                                            </select>
                                        </td>
                                        <td className="text-center">
                                            <div className="input-group input-group-sm mx-auto" style={{ width: '110px' }}>
                                                <input
                                                    type="number"
                                                    className="form-control text-center fw-bold text-danger"
                                                    style={{ borderRadius: '8px 0 0 8px' }}
                                                    value={row.wastage_pct}
                                                    onChange={(e) => handleChange(row.id, 'wastage_pct', e.target.value)}
                                                    readOnly={isLocked}
                                                    min="0"
                                                    max="100"
                                                    step="0.1"
                                                />
                                                <span className="input-group-text fw-bold text-danger bg-danger-subtle border-danger-subtle">%</span>
                                            </div>
                                        </td>
                                        {!isLocked && (
                                            <td className="text-center">
                                                <button className="btn btn-link link-danger p-1" onClick={() => removeRow(row.id)} title="Remove">
                                                    <i className="bi bi-trash"></i>
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Fabric In-House Selector */}
            <div className="d-flex align-items-center gap-3 mb-2 p-3 bg-success-subtle rounded-3 border border-success-subtle">
                <div className="fw-bold text-success small">
                    <i className="bi bi-house-door-fill me-2"></i>
                    Fabric In-House Process:
                </div>
                <div style={{ width: '250px' }}>
                    <select
                        className="form-select form-select-sm fw-bold border-success-subtle"
                        value={fabricInHouseProcess}
                        onChange={(e) => setFabricInHouseProcess(e.target.value)}
                        disabled={isLocked}
                    >
                        <option value="">— Select Fabric Process —</option>
                        {lifeCyclesMaster.filter(m => m.process_type === 'fabric').map(m => (
                            <option key={m.id} value={m.process_name}>{m.process_name}</option>
                        ))}
                    </select>
                </div>
                {fabricInHouseProcess && (
                    <div className="x-small text-success-emphasis">
                        Fabric SKU will be updated in stock during <strong>{fabricInHouseProcess} Inward</strong>.
                    </div>
                )}
            </div>

            {/* Trims Lifecycle Table */}
            <div className="rounded-3 border overflow-hidden shadow-sm">
                <div className="bg-dark text-white px-3 py-2">
                    <h6 className="fw-bold mb-0 small">
                        <i className="bi bi-tag-fill me-2 text-warning"></i>
                        Trims Life Cycle
                    </h6>
                </div>
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th className="ps-3 x-small fw-bold">Trims Name</th>
                                <th className="x-small fw-bold">Color</th>
                                <th className="text-center x-small fw-bold">Planning Qty</th>
                                <th className="x-small fw-bold" style={{ width: '30%' }}>Process of Lifecycle</th>
                                <th className="text-center x-small fw-bold" style={{ width: '140px' }}>Wastage %</th>
                            </tr>
                        </thead>
                        <tbody>
                            {trimsRows.map((row, idx) => (
                                <tr key={row.id}>
                                    <td className="ps-3 py-2 fw-bold text-dark small">{row.trim_name}</td>
                                    <td className="small text-muted">{row.color}</td>
                                    <td className="text-center small">{row.qty}</td>
                                    <td>
                                        <MultiSelectDropdown
                                            options={rows.map(r => r.process_name).filter(Boolean)}
                                            selected={row.process_name}
                                            onChange={(val) => handleTrimRowChange(row.id, 'process_name', val)}
                                            disabled={isLocked}
                                        />
                                    </td>
                                    <td className="text-center">
                                        <div className="input-group input-group-sm mx-auto" style={{ width: '110px' }}>
                                            <input
                                                type="number"
                                                className="form-control text-center fw-bold text-warning"
                                                style={{ borderRadius: '8px 0 0 8px' }}
                                                value={row.wastage_pct}
                                                onChange={(e) => handleTrimRowChange(row.id, 'wastage_pct', e.target.value)}
                                                readOnly={isLocked}
                                                min="0"
                                            />
                                            <span className="input-group-text fw-bold text-warning bg-warning-subtle border-warning-subtle">%</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {trimsRows.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="text-center py-4 text-muted small">Please add Trims in Planning first.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Save Button */}
            <div className="d-flex justify-content-end mt-4">
                {!isLocked && (
                    <button
                        className="btn btn-success px-4 py-2 rounded-pill fw-bold shadow-sm transition-all"
                        onClick={handleSave}
                        disabled={loading}
                    >
                        <i className="bi bi-cloud-check me-2 fs-5"></i>
                        {loading ? "Saving All..." : "Save Planning"}
                    </button>
                )}
            </div>
        </div>
    );
};

export default OrderLifeCycle;
