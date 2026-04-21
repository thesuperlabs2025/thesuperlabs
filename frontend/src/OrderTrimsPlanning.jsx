import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import CreatableSelect from "react-select/creatable";

const API = process.env.REACT_APP_API_URL;

const OrderTrimsPlanning = ({ orderId, onSaveSuccess, isLocked, sharedSizes }) => {
    const [loading, setLoading] = useState(false);
    const [currentSizes, setCurrentSizes] = useState([]);
    const [trimsList, setTrimsList] = useState([]);
    const [colorsList, setColorsList] = useState([]);

    // Sync from parent
    useEffect(() => {
        if (sharedSizes && sharedSizes.currentSizes && sharedSizes.currentSizes.length > 0) {
            setCurrentSizes(sharedSizes.currentSizes);
        }
    }, [sharedSizes]);

    const [input, setInput] = useState({
        style_part: "Top",
        trims_name: "",
        color: "",
        trim_type: "Non-Sizeable",
        qty_per_pcs: "",
        consumption: {}
    });

    const [rows, setRows] = useState([]);

    const fetchData = useCallback(async () => {
        if (!orderId || orderId === 'undefined' || isNaN(orderId)) return;
        try {
            const [trimMaster, colorMaster, existing] = await Promise.all([
                axios.get(`${API}/trims`),
                axios.get(`${API}/color`),
                axios.get(`${API}/order-planning-v2/all/${orderId}`)
            ]);

            // Handle sizes if not already in sharedSizes
            if (!sharedSizes || !sharedSizes.currentSizes || sharedSizes.currentSizes.length === 0) {
                try {
                    const sizeQty = await axios.get(`${API}/size-quantity/order/${orderId}`);
                    if (sizeQty.data.size_chart_id) {
                        const scRes = await axios.get(`${API}/size-charts/${sizeQty.data.size_chart_id}`);
                        setCurrentSizes(scRes.data.values || []);
                    }
                } catch (e) { }
            }

            setTrimsList(trimMaster.data.map(t => ({ value: t.id, label: t.trim_name })));
            setColorsList(colorMaster.data.map(c => ({ value: c.id, label: c.color })));

            if (existing.data.trims) {
                setRows(existing.data.trims.map(t => ({
                    ...t,
                    consumption_data: typeof t.consumption_data === 'string' ? JSON.parse(t.consumption_data) : t.consumption_data
                })));
            }
        } catch (err) { console.error(err); }
    }, [orderId, sharedSizes]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const addRow = () => {
        if (!input.trims_name) return toast.warning("Trims name is required");

        const newRow = {
            style_part: input.style_part,
            trims_name: input.trims_name,
            color: input.color,
            trim_type: input.trim_type,
            qty_per_pcs: parseFloat(input.qty_per_pcs) || 0,
            consumption_data: { ...input.consumption }
        };

        if (input.trim_type === "Non-Sizeable") {
            // Apply qty_per_pcs to all sizes if non-sizeable or just use global
        }

        setRows([...rows, newRow]);
        setInput({ ...input, trims_name: "", color: "", qty_per_pcs: "", consumption: {} });
    };

    const updateRowConsumption = (idx, size, val) => {
        const updated = [...rows];
        updated[idx].consumption_data[size] = val;
        setRows(updated);
    };

    const updateRowQty = (idx, val) => {
        const updated = [...rows];
        updated[idx].qty_per_pcs = val;
        setRows(updated);
    };

    const removeRow = (idx) => setRows(rows.filter((_, i) => i !== idx));

    const handleSave = async () => {
        setLoading(true);
        try {
            await axios.post(`${API}/order-planning-v2/trims`, {
                order_id: orderId,
                items: rows
            });
            toast.success("Trims Planning Saved!");
            if (onSaveSuccess) onSaveSuccess();
        } catch (err) {
            toast.error("Failed to save");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-2 planning-section">
            <style>{`
                .planning-section { font-size: 0.95rem; }
                .planning-section .form-control, 
                .planning-section .form-select,
                .planning-section .btn { font-size: 0.95rem; }
                .planning-section .table thead th { font-size: 0.8rem; letter-spacing: 0.03rem; text-transform: uppercase; }
                .x-small { font-size: 0.8rem; }
            `}</style>
            <div className="bg-light p-3 rounded-3 mb-3 border shadow-sm">
                <h6 className="fw-bold mb-2 text-primary small"><i className="bi bi-plus-square me-1"></i>Add Trims Requirement</h6>
                <div className="row g-2 align-items-end">
                    <div className="col-md-2">
                        <label className="form-label x-small fw-bold text-muted">Style Part</label>
                        <select className="form-select form-select-sm" disabled={isLocked} value={input.style_part} onChange={e => setInput({ ...input, style_part: e.target.value })}>
                            <option value="Top">Top</option>
                            <option value="Bottom">Bottom</option>
                            <option value="Set">Set</option>
                        </select>
                    </div>
                    <div className="col-md-3">
                        <label className="form-label x-small fw-bold text-muted">Trims Name</label>
                        <CreatableSelect
                            options={trimsList}
                            value={trimsList.find(t => t.label === input.trims_name) || (input.trims_name ? { label: input.trims_name, value: input.trims_name } : null)}
                            onChange={(opt) => setInput({ ...input, trims_name: opt?.label || "" })}
                            placeholder="Select Trims..."
                            isDisabled={isLocked}
                            styles={{
                                control: (b) => ({ ...b, borderRadius: '8px', minHeight: '34px', fontSize: '0.85rem' }),
                                valueContainer: (b) => ({ ...b, padding: '0 8px' })
                            }}
                        />
                    </div>
                    <div className="col-md-2">
                        <label className="form-label x-small fw-bold text-muted">Color</label>
                        <CreatableSelect
                            options={colorsList}
                            value={colorsList.find(c => c.label === input.color) || (input.color ? { label: input.color, value: input.color } : null)}
                            onChange={(opt) => setInput({ ...input, color: opt?.label || "" })}
                            placeholder="Color..."
                            isDisabled={isLocked}
                            styles={{
                                control: (b) => ({ ...b, borderRadius: '8px', minHeight: '34px', fontSize: '0.85rem' }),
                                valueContainer: (b) => ({ ...b, padding: '0 8px' })
                            }}
                        />
                    </div>
                    <div className="col-md-2">
                        <label className="form-label x-small fw-bold text-muted">Type</label>
                        <select className="form-select form-select-sm" value={input.trim_type} onChange={e => setInput({ ...input, trim_type: e.target.value })} disabled={isLocked}>
                            <option value="Sizeable">Sizeable</option>
                            <option value="Non-Sizeable">Non-Sizeable</option>
                        </select>
                    </div>
                    <div className="col-md-1">
                        <label className="form-label x-small fw-bold text-muted">Qty/Pcs</label>
                        <input
                            type="text"
                            className="form-control form-control-sm"
                            value={input.qty_per_pcs}
                            onChange={e => {
                                const val = e.target.value;
                                let evaluated = val;

                                if (/[-/*+]/.test(val)) {
                                    try {
                                        const clean = val.replace(/[^0-9./*+()-]/g, '');
                                        if (/[0-9)]$/.test(clean)) {
                                            const res = Function(`"use strict"; return (${clean})`)(); // eslint-disable-line no-new-func
                                            if (!isNaN(res) && isFinite(res)) {
                                                evaluated = res.toFixed(4).replace(/\.?0+$/, "");
                                            }
                                        }
                                    } catch (err) { }
                                }

                                const newCons = { ...input.consumption };
                                if (input.trim_type === "Sizeable") {
                                    currentSizes.forEach(s => {
                                        newCons[s.size_value] = evaluated;
                                    });
                                }
                                setInput({ ...input, qty_per_pcs: val, consumption: newCons });
                            }}
                            onBlur={e => {
                                const val = e.target.value;
                                try {
                                    const clean = val.replace(/[^0-9./*+()-]/g, '');
                                    const res = Function(`"use strict"; return (${clean})`)(); // eslint-disable-line no-new-func
                                    if (!isNaN(res) && isFinite(res)) {
                                        const finalVal = res.toFixed(4).replace(/\.?0+$/, "");
                                        setInput(prev => ({ ...prev, qty_per_pcs: finalVal }));
                                    }
                                } catch (err) { }
                            }}
                            readOnly={isLocked}
                        />
                    </div>
                    <div className="col-md-2">
                        <button className="btn btn-primary btn-sm w-100 fw-bold" onClick={addRow} disabled={isLocked}>Add Trims</button>
                    </div>
                </div>

                {input.trim_type === "Sizeable" && (
                    <div className="mt-2 pt-2 border-top">
                        <label className="form-label x-small fw-bold text-muted mb-2">Consumption per Size</label>
                        <div className="d-flex flex-wrap gap-2">
                            {currentSizes.map(s => (
                                <div key={s.id} style={{ width: '65px' }}>
                                    <div className="text-center x-small mb-1">{s.size_value}</div>
                                    <input
                                        type="text"
                                        className="form-control form-control-sm text-center px-1"
                                        value={input.consumption[s.size_value] || ""}
                                        onChange={e => setInput({ ...input, consumption: { ...input.consumption, [s.size_value]: e.target.value } })}
                                        readOnly={isLocked}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="table-responsive rounded-3 shadow-sm border overflow-hidden">
                <table className="table table-hover align-middle mb-0">
                    <thead className="table-dark">
                        <tr>
                            <th className="ps-3 x-small">Trims Name & Color</th>
                            <th className="x-small">Type</th>
                            {currentSizes.map(s => (
                                <th key={s.id} className="text-center x-small">{s.size_value}</th>
                            ))}
                            <th style={{ width: '40px' }}></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white">
                        {rows.map((row, idx) => (
                            <tr key={idx}>
                                <td className="ps-3 py-2">
                                    <div className="fw-bold small">{row.trims_name}</div>
                                    <div className="x-small text-muted">{row.color} <span className="badge bg-light text-dark border ms-1">{row.style_part}</span></div>
                                </td>
                                <td><span className={`badge ${row.trim_type === 'Sizeable' ? 'bg-info' : 'bg-secondary'} x-small`}>{row.trim_type}</span></td>
                                {currentSizes.map(s => (
                                    <td key={s.id} className="p-1">
                                        {row.trim_type === 'Sizeable' ? (
                                            <input
                                                type="text"
                                                className="form-control form-control-sm text-center trim-input"
                                                value={row.consumption_data[s.size_value] || ""}
                                                onChange={e => updateRowConsumption(idx, s.size_value, e.target.value)}
                                                readOnly={isLocked}
                                            />
                                        ) : (
                                            <input
                                                type="text"
                                                className="form-control form-control-sm text-center trim-input fw-bold"
                                                value={row.qty_per_pcs || ""}
                                                onChange={e => updateRowQty(idx, e.target.value)}
                                                readOnly={isLocked}
                                            />
                                        )}
                                    </td>
                                ))}
                                <td className="text-center">
                                    {!isLocked && <button className="btn btn-link link-danger p-0" onClick={() => removeRow(idx)}><i className="bi bi-trash"></i></button>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="d-flex justify-content-end mt-3">
                {!isLocked && (
                    <button className="btn btn-success btn-sm px-4 py-2 rounded-pill fw-bold shadow" onClick={handleSave} disabled={loading}>
                        <i className="bi bi-cloud-check me-1"></i> {loading ? "Saving..." : "Save Trims Planning"}
                    </button>
                )}
            </div>
            <style>{`
                .trim-input {
                    border: 1px solid transparent;
                    background: transparent;
                    transition: all 0.2s;
                }
                .trim-input:hover:not([readonly]) {
                    background: #f1f5f9;
                    border-color: #cbd5e1;
                }
                .trim-input:focus:not([readonly]) {
                    background: #fff;
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
                    outline: none;
                }
                .trim-input[readonly] {
                    background: transparent;
                    border: none;
                    cursor: default;
                }
            `}</style>
        </div>
    );
};

export default OrderTrimsPlanning;
