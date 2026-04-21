import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import CreatableSelect from "react-select/creatable";

const API = process.env.REACT_APP_API_URL;

const OrderFabricPlanning = ({ orderId, onSaveSuccess, isLocked, sharedSizes }) => {
    const [loading, setLoading] = useState(false);
    const [currentSizes, setCurrentSizes] = useState([]);
    const [activeChartName, setActiveChartName] = useState("");
    const [wastagePct, setWastagePct] = useState(0);

    // Track all style/color items from size-quantity
    const [sizeQtyItems, setSizeQtyItems] = useState([]);

    // Sync with parent's shared size context
    useEffect(() => {
        if (sharedSizes) {
            if (sharedSizes.currentSizes && sharedSizes.currentSizes.length > 0) {
                setCurrentSizes(sharedSizes.currentSizes);
            }
            if (sharedSizes.activeChartName) {
                setActiveChartName(sharedSizes.activeChartName);
            }
            // Explicitly sync breakdown items for real-time calculation
            // Always sync even if empty to ensure deletions are reflected
            if (sharedSizes.orderItems) {
                setSizeQtyItems(sharedSizes.orderItems);
            }
        }
    }, [sharedSizes]);

    const colorsMaster = useMemo(() => {
        const unique = new Set(sizeQtyItems.map(i => i.color).filter(Boolean));
        return Array.from(unique).map(c => ({ value: c, label: c }));
    }, [sizeQtyItems]);

    // Masters
    const [fabricsList, setFabricsList] = useState([]);
    const [bodyPartsList, setBodyPartsList] = useState([]);

    // Input state
    const [input, setInput] = useState({
        style_part: "Top",
        body_part: "",
        fabric_name: "",
        gsm: "",
        dia: "",
        color: "",
        composition: "",
        counts: "",
        fabric_type: "Yarn",
        avg_pcs_weight: "",
        consumption: {}
    });

    const [selectedFabric, setSelectedFabric] = useState(null);
    const [selectedBodyPart, setSelectedBodyPart] = useState(null);
    const [selectedColor, setSelectedColor] = useState(null);

    // Table state
    const [rows, setRows] = useState([]);

    const fetchData = useCallback(async (force = false) => {
        try {
            // Fetch masters - can be done without orderId
            const [fabrics, bodyParts] = await Promise.all([
                axios.get(`${API}/fabrics`),
                axios.get(`${API}/body-parts`).catch(() => ({ data: [] }))
            ]);

            setFabricsList(fabrics.data.map(f => ({
                value: f.id,
                label: f.fabric_name,
                gsm: f.gsm,
                dia: f.dia,
                counts: f.counts,
                composition: f.composition,
                color: f.color
            })));
            if (bodyParts.data) setBodyPartsList(bodyParts.data.map(b => ({ value: b.id, label: b.part_name })));

            // Fetch order-specific data - only if orderId exists
            if (orderId && orderId !== 'undefined' && orderId !== 'null') {
                // If we already have size data from context, skip fetching from API to avoid overwrite
                const hasLiveContext = sharedSizes && sharedSizes.orderItems && sharedSizes.orderItems.length > 0;

                if (!hasLiveContext || force === true) {
                    const [sizeQtyRes] = await Promise.all([
                        axios.get(`${API}/size-quantity/order/${orderId}`).catch(() => ({ data: { items: [] } }))
                    ]);

                    if (sizeQtyRes.data.items) {
                        setSizeQtyItems(sizeQtyRes.data.items);
                        if (sizeQtyRes.data.size_chart_id) {
                            const scRes = await axios.get(`${API}/size-charts/${sizeQtyRes.data.size_chart_id}`);
                            setCurrentSizes(scRes.data.values || []);
                            setActiveChartName(scRes.data.chart_name || "");
                        }
                    }
                }

                // Load existing planning
                try {
                    const existing = await axios.get(`${API}/fabric-planning/order/${orderId}`);
                    if (existing.data) {
                        if (existing.data.wastage_pct) setWastagePct(existing.data.wastage_pct);
                        if (existing.data.items) {
                            setRows(existing.data.items.map(item => ({
                                ...item,
                                consumption_data: typeof item.consumption_data === 'string' ? JSON.parse(item.consumption_data) : item.consumption_data
                            })));
                        }
                    }
                } catch (e) { }
            }
        } catch (err) {
            console.error(err);
            toast.error("Error refreshing data");
        }
    }, [orderId, sharedSizes]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Helper to get quantities for a specific style part + color
    const getTargetQuantities = (stylePart, color) => {
        const aggregated = {};
        const sPart = String(stylePart || "").toLowerCase().trim();
        const sColor = String(color || "").toLowerCase().trim();

        if (!sizeQtyItems || sizeQtyItems.length === 0) return aggregated;

        sizeQtyItems
            .filter(item => {
                const itemColor = String(item.color || item.style_color || "").toLowerCase().trim();
                const itemPart = String(item.style_part || "").toLowerCase().trim();

                const colorMatch = (!color || itemColor === sColor);
                // Match if part matches, OR if no part specified in either side, OR if sPart is empty
                const partMatch = !stylePart || itemPart === sPart || !itemPart;

                return colorMatch && partMatch;
            })
            .forEach(item => {
                const data = typeof item.sizes_data === 'string' ? JSON.parse(item.sizes_data) : item.sizes_data;
                if (data) {
                    Object.entries(data).forEach(([sz, q]) => {
                        // Use consistent key comparison if needed, but here we just aggregate
                        const sizeKey = String(sz).trim();
                        aggregated[sizeKey] = (aggregated[sizeKey] || 0) + (parseFloat(q) || 0);
                    });
                }
            });
        return aggregated;
    };

    const handleFabricChange = (option) => {
        setSelectedFabric(option);
        if (option) {
            setInput(prev => ({
                ...prev,
                fabric_name: option.label,
                gsm: option.gsm || prev.gsm,
                dia: option.dia || prev.dia,
                counts: option.counts || prev.counts,
                composition: option.composition || prev.composition,
                color: option.color || prev.color
            }));
            if (option.color) {
                setSelectedColor({ value: option.color, label: option.color });
            }
        }
    };

    const addRows = () => {
        const fabric = selectedFabric?.label || input.fabric_name;
        const bodyPart = selectedBodyPart?.label || input.body_part;
        const color = selectedColor?.label || input.color;

        if (!fabric || !bodyPart || !color) {
            toast.warning("Fabric, Body Part, and Color are required");
            return;
        }

        const dias = input.dia.split(',').map(d => d.trim()).filter(d => d);
        const diaList = dias.length > 0 ? dias : [""];

        const targetQtys = getTargetQuantities(input.style_part, color);
        const totalTargetPcs = Object.values(targetQtys).reduce((a, b) => a + b, 0);

        if (totalTargetPcs === 0) {
            // No quantities found - just log or proceed quietly
            console.log(`No quantities for: ${input.style_part} - ${color}`);
        }

        const newRows = diaList.map(diaVal => {
            const rowData = {
                style_part: input.style_part,
                body_part: bodyPart,
                fabric_name: fabric,
                gsm: input.gsm,
                dia: diaVal,
                color: color,
                composition: input.composition,
                counts: input.counts,
                fabric_type: input.fabric_type,
                wastage_pct: wastagePct,
                consumption_data: { ...input.consumption }
            };

            const consEntries = Object.entries(input.consumption);
            const consValues = consEntries.map(e => parseFloat(e[1]) || 0);
            rowData.avg_wt = consValues.length > 0 ? (consValues.reduce((a, b) => a + b, 0) / consValues.length) : 0;

            let rowTotalReq = 1; // Default to 1 to avoid 0s if something is missing
            rowTotalReq = 0;
            consEntries.forEach(([size, cons]) => {
                const qty = targetQtys[size] || 0;
                rowTotalReq += (parseFloat(qty) * (parseFloat(cons) || 0));
            });
            rowData.total_req = rowTotalReq;

            return rowData;
        });

        setRows(prev => [...prev, ...newRows]);
        setInput(prev => ({ ...prev, consumption: {}, avg_pcs_weight: "" }));
        setSelectedColor(null);
    };

    const handleConsumptionChange = (size, gVal) => {
        const kgVal = (parseFloat(gVal) || 0) / 1000;
        setInput(prev => ({
            ...prev,
            consumption: { ...prev.consumption, [size]: kgVal.toFixed(4) }
        }));
    };


    const updateRowConsumption = (rowIndex, size, gVal) => {
        const kgVal = (parseFloat(gVal) || 0) / 1000;
        const updated = [...rows];
        updated[rowIndex].consumption_data[size] = kgVal.toFixed(4);

        const row = updated[rowIndex];
        const targetQtys = getTargetQuantities(row.style_part, row.color);

        const consEntries = Object.entries(row.consumption_data);
        const consValues = consEntries.map(e => parseFloat(e[1]) || 0);
        row.avg_wt = consValues.length > 0 ? (consValues.reduce((a, b) => a + b, 0) / consValues.length) : 0;

        let rowTotalReq = 1; // Default
        rowTotalReq = 0;
        consEntries.forEach(([sz, cons]) => {
            const qty = targetQtys[sz] || 0;
            rowTotalReq += (parseFloat(qty) * (parseFloat(cons) || 0));
        });
        row.total_req = rowTotalReq;

        setRows(updated);
    };

    const removeRow = (index) => {
        setRows(rows.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        if (rows.length === 0) return toast.warning("Add some rows first");
        setLoading(true);
        try {
            await axios.post(`${API}/fabric-planning`, {
                order_id: orderId,
                wastage_pct: wastagePct,
                items: rows
            });
            toast.success("Fabric Planning Saved!");
            if (onSaveSuccess) onSaveSuccess();
        } catch (err) {
            toast.error("Failed to save");
        } finally {
            setLoading(false);
        }
    };

    const DropdownWithActions = ({ label, options, value, onChange, onAdd, onRefresh, placeholder, disabled, colorTheme = "text-muted" }) => (
        <div className="col-md-2">
            <div className="d-flex justify-content-between align-items-center mb-1">
                <label className={`form-label x-small fw-bold ${colorTheme} mb-0`}>{label}</label>
                <div className="d-flex gap-2">
                    <button type="button" className="btn btn-link btn-sm p-0 text-primary" onClick={() => onRefresh(true)} title="Refresh data">
                        <i className="bi bi-arrow-clockwise" style={{ fontSize: '0.7rem' }}></i>
                    </button>
                    {!disabled && onAdd && (
                        <button type="button" className="btn btn-link btn-sm p-0 text-success" onClick={onAdd} title={`Add new ${label}`}>
                            <i className="bi bi-plus-circle-fill" style={{ fontSize: '0.7rem' }}></i>
                        </button>
                    )}
                </div>
            </div>
            <CreatableSelect
                options={options}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                isDisabled={disabled}
                classNamePrefix="react-select"
                styles={{
                    control: base => ({ ...base, minHeight: '32px', height: '32px', fontSize: '0.75rem', borderRadius: '6px' }),
                    valueContainer: base => ({ ...base, padding: '0 8px' }),
                    indicatorsContainer: base => ({ ...base, height: '30px' }),
                    option: base => ({ ...base, fontSize: '0.75rem', padding: '4px 10px' })
                }}
            />
        </div>
    );

    const groupedRows = {
        Top: rows.filter(r => r.style_part === "Top"),
        Bottom: rows.filter(r => r.style_part === "Bottom"),
        Set: rows.filter(r => r.style_part === "Set")
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
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="fw-bold mb-0 text-primary small"><i className="bi bi-palette me-1"></i>Multi-Style Color Fabric Planning</h6>
                    <div className="d-flex align-items-center gap-3">
                        <div className="bg-white border shadow-sm px-3 py-1.5 rounded-pill x-small d-flex align-items-center gap-2">
                            <span className="fw-bold text-dark">{activeChartName || "No Size Chart"}</span>
                            <button className="btn btn-link btn-sm p-0 text-secondary x-small fw-bold" onClick={() => fetchData(true)}>Sync</button>
                        </div>
                        <div className="input-group input-group-sm" style={{ width: '150px' }}>
                            <span className="input-group-text x-small fw-bold bg-white">Wastage</span>
                            <input type="number" className="form-control text-center fw-bold" value={wastagePct} onChange={e => setWastagePct(parseFloat(e.target.value) || 0)} readOnly={isLocked} />
                            <span className="input-group-text x-small fw-bold bg-white">%</span>
                        </div>
                    </div>
                </div>
                <div className="row g-2 align-items-end">
                    <div className="col-md-2">
                        <label className="form-label x-small fw-bold text-muted">Style Part</label>
                        <select className="form-select form-select-sm" value={input.style_part} onChange={e => setInput({ ...input, style_part: e.target.value })} disabled={isLocked}>
                            <option value="Top">Top</option>
                            <option value="Bottom">Bottom</option>
                            <option value="Set">Set</option>
                        </select>
                    </div>
                    <div className="col-md-3">
                        <label className="form-label x-small fw-bold text-muted">Fabric Name (Stock)</label>
                        <CreatableSelect
                            options={fabricsList}
                            value={selectedFabric}
                            onChange={handleFabricChange}
                            placeholder="Type to search fabric..."
                            isSearchable={true}
                            isDisabled={isLocked}
                            styles={{ control: (b) => ({ ...b, minHeight: '34px', fontSize: '0.8rem' }) }}
                        />
                    </div>
                    <DropdownWithActions
                        label="Body Part"
                        options={bodyPartsList}
                        value={selectedBodyPart}
                        onChange={setSelectedBodyPart}
                        onAdd={() => window.open('/body-part-master', '_blank')}
                        onRefresh={fetchData}
                        placeholder="Select..."
                        disabled={isLocked}
                    />
                    <div className="col-md-1">
                        <label className="form-label x-small fw-bold text-muted">GSM</label>
                        <input type="text" className="form-control form-control-sm" value={input.gsm} onChange={e => setInput({ ...input, gsm: e.target.value })} readOnly={isLocked} />
                    </div>
                    <div className="col-md-1">
                        <label className="form-label x-small fw-bold text-muted">Dia</label>
                        <input type="text" className="form-control form-control-sm" value={input.dia} onChange={e => setInput({ ...input, dia: e.target.value })} readOnly={isLocked} />
                    </div>
                    <div className="col-md-1">
                        <label className="form-label x-small fw-bold text-muted">Counts</label>
                        <input type="text" className="form-control form-control-sm" value={input.counts} onChange={e => setInput({ ...input, counts: e.target.value })} readOnly={isLocked} />
                    </div>
                    <div className="col-md-2">
                        <label className="form-label x-small fw-bold text-muted">Comp</label>
                        <input type="text" className="form-control form-control-sm" value={input.composition} onChange={e => setInput({ ...input, composition: e.target.value })} readOnly={isLocked} />
                    </div>
                    <div className="col-md-2">
                        <label className="form-label x-small fw-bold text-primary">Fabric Color</label>
                        <CreatableSelect
                            options={colorsMaster}
                            value={selectedColor}
                            onChange={setSelectedColor}
                            placeholder="Select/Type Color..."
                            isDisabled={isLocked}
                            styles={{ control: (b) => ({ ...b, minHeight: '34px', fontSize: '0.8rem', borderColor: '#0d6efd40' }) }}
                        />
                    </div>
                    <div className="col-md-2">
                        <label className="form-label x-small fw-bold text-primary">Fabric Type</label>
                        <select className="form-select form-select-sm border-primary" value={input.fabric_type} onChange={e => setInput({ ...input, fabric_type: e.target.value })} disabled={isLocked}>
                            <option value="Yarn">Yarn</option>
                            <option value="Ready Fabric">Ready Fabric</option>
                        </select>
                    </div>
                    <div className="col-md-2">
                        <label className="form-label x-small fw-bold text-primary">Avg Wt (g)</label>
                        <input type="number" className="form-control form-control-sm font-monospace" placeholder="e.g. 200" value={input.avg_pcs_weight}
                            readOnly={isLocked}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    addRows();
                                }
                            }}
                            onChange={e => {
                                const gVal = e.target.value;
                                const kgVal = (parseFloat(gVal) || 0) / 1000;
                                setInput(prev => {
                                    const newCons = { ...prev.consumption };
                                    currentSizes.forEach(s => { newCons[s.size_value] = kgVal.toFixed(4); });
                                    return { ...prev, avg_pcs_weight: gVal, consumption: newCons };
                                });
                            }}
                        />
                    </div>
                </div>

                <div className="mt-2 pt-2 border-top">
                    <label className="form-label x-small fw-bold text-muted mb-2">Consumption (g/pcs)</label>
                    <div className="d-flex flex-wrap gap-2">
                        {currentSizes.map(s => {
                            const tQty = getTargetQuantities(input.style_part, selectedColor?.label || input.color)[s.size_value] || 0;
                            return (
                                <div key={s.id} style={{ width: '65px' }}>
                                    <div className="text-center x-small mb-1 fw-bold">{s.size_value}</div>
                                    <div className="text-center x-small text-primary opacity-75 mb-1" style={{ fontSize: '0.65rem' }}>{tQty}</div>
                                    <input type="number" className="form-control form-control-sm text-center"
                                        readOnly={isLocked}
                                        value={input.consumption[s.size_value] !== undefined && input.consumption[s.size_value] !== "" ? (parseFloat(input.consumption[s.size_value]) * 1000).toFixed(0) : ""}
                                        onChange={e => handleConsumptionChange(s.size_value, e.target.value)} placeholder="0" style={{ height: '32px' }} />
                                </div>
                            );
                        })}
                        <div className="ms-auto align-self-end">
                            <button className="btn btn-primary btn-sm px-3 fw-bold" onClick={addRows} disabled={isLocked}><i className="bi bi-plus-lg me-1"></i>Add Row</button>
                        </div>
                    </div>
                </div>
            </div>

            {['Top', 'Bottom', 'Set'].map(part => groupedRows[part].length > 0 && (
                <div key={part} className="mb-4 shadow-sm rounded-3 overflow-hidden border bg-white">
                    <div className="bg-dark text-white px-3 py-2 d-flex align-items-center justify-content-between">
                        <h6 className="fw-bold mb-0 small">{part} Fabric Planning</h6>
                        <span className="badge bg-primary x-small rounded-pill">{groupedRows[part].length} Items</span>
                    </div>
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="bg-light shadow-sm">
                                <tr>
                                    <th className="ps-3 x-small fw-bold">Fabric/Counts</th>
                                    <th className="x-small fw-bold">Color/Type</th>
                                    <th className="text-center x-small fw-bold">G/D</th>
                                    {currentSizes.map(s => <th key={s.id} className="text-center x-small fw-bold">{s.size_value}</th>)}
                                    <th className="text-center x-small fw-bold" style={{ width: '100px' }}>Target Pcs</th>
                                    <th className="text-center x-small fw-bold" style={{ width: '100px' }}>Total Req (kg)</th>
                                    <th className="text-center x-small fw-bold" style={{ width: '80px' }}>Avg (g)</th>
                                    <th style={{ width: '40px' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {groupedRows[part].map((row, idx) => {
                                    const targetQtys = getTargetQuantities(row.style_part, row.color);
                                    const totalTarget = Object.values(targetQtys).reduce((a, b) => a + b, 0);
                                    return (
                                        <tr key={idx}>
                                            <td className="ps-3">
                                                <div className="fw-bold text-primary small">{row.fabric_name}</div>
                                                <div className="text-muted x-small">{row.counts}</div>
                                            </td>
                                            <td>
                                                <div className="fw-bold x-small text-dark">{row.color}</div>
                                                <div className="text-muted" style={{ fontSize: '0.6rem' }}>{row.fabric_type}</div>
                                            </td>
                                            <td className="text-center">
                                                <div className="x-small fw-bold">{row.gsm} / {row.dia}"</div>
                                            </td>
                                            {currentSizes.map(s => (
                                                <td key={s.id} className="p-1">
                                                    <div className="text-center x-small text-muted mb-1" style={{ fontSize: '0.6rem' }}>{targetQtys[s.size_value] || 0}</div>
                                                    <input type="number" className="form-control form-control-sm text-center px-1 qty-input" style={{ fontSize: '0.8rem' }}
                                                        readOnly={isLocked}
                                                        value={row.consumption_data[s.size_value] ? (parseFloat(row.consumption_data[s.size_value]) * 1000).toFixed(0) : 0}
                                                        onChange={e => updateRowConsumption(rows.indexOf(row), s.size_value, e.target.value)} />
                                                </td>
                                            ))}
                                            <td className="text-center">
                                                <div className="badge bg-primary bg-opacity-10 text-primary small fw-bold">{totalTarget} Pcs</div>
                                            </td>
                                            <td className="text-center fw-bold small">
                                                <span className="text-primary">{Number(row.total_req || 0).toFixed(3)}</span> <span className="text-muted x-small">kg</span>
                                            </td>
                                            <td className="text-center fw-bold small">{(parseFloat(row.avg_wt) * 1000).toFixed(0)}g</td>
                                            <td>
                                                <button className="btn btn-link link-danger p-0" onClick={() => removeRow(rows.indexOf(row))} disabled={isLocked}><i className="bi bi-trash"></i></button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            ))}

            <div className="d-flex justify-content-end mt-4">
                {!isLocked && (
                    <button className="btn btn-success px-5 py-2 rounded-pill fw-bold shadow" onClick={handleSave} disabled={loading}>
                        {loading ? "Saving..." : "Save Multi-Color Planning"}
                    </button>
                )}
                {isLocked && (
                    <div className="badge bg-success bg-opacity-10 text-success p-3 rounded-pill border border-success border-opacity-25">
                        <i className="bi bi-lock-fill me-2"></i> Fabrication Plan Locked (Approved)
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderFabricPlanning;
