import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Select from "react-select";

const API = process.env.REACT_APP_API_URL;

const CostingModule = ({ orderId, buyerId, buyerName, onSaveSuccess, isLocked: parentLocked }) => {
    const [loading, setLoading] = useState(false);
    const [versions, setVersions] = useState([]);
    const [costing, setCosting] = useState({
        id: null,
        style_no: "",
        description: "",
        order_qty: 0,
        currency: "INR",
        target_fob: 0,
        delivery_date: "",
        status: "Draft",
        version: "V1",
        cm_cost: 0,
        overhead_pct: 2,
        profit_pct: 8,
        total_fabrics_cost: 0,
        total_trims_cost: 0,
        total_processing_cost: 0,
        total_cost: 0,
        final_fob: 0,
        fabrics: [{ fabric_name: "", gsm: "", cons_kg_pc: 0, excess_pct: 3, final_cons: 0, rate_kg: 0, total_cost: 0 }],
        trims: [{ trim_name: "", uom: "Pc", qty_pc: 1, excess_pct: 2, final_qty: 0, rate: 0, total_cost: 0 }],
        processes: [{ process_name: "", basis: "Kg", rate: 0, cost_pc: 0 }],
        additional_processes: [{ process_name: "", basis: "Pc", rate: 0, cost_pc: 0 }]
    });

    const [buyersList, setBuyersList] = useState([]);
    const [selectedBuyer, setSelectedBuyer] = useState(buyerId ? { value: buyerId, label: buyerName } : null);
    const [calcs, setCalcs] = useState({ overhead: 0, profit: 0, subTotal: 0, marginPct: 0, totalOrderProfit: 0, diff: 0 });

    const isLocked = costing.status === "Approved" || parentLocked;

    const fetchBuyers = useCallback(async () => {
        try {
            const res = await axios.get(`${API}/customers`);
            setBuyersList(res.data.map(b => ({ value: b.id, label: b.name })));
        } catch (err) { console.error(err); }
    }, []);

    const fetchVersions = useCallback(async () => {
        if (!orderId) return;
        try {
            const res = await axios.get(`${API}/garment-costing/order/${orderId}/versions`);
            setVersions(res.data);
        } catch (err) { console.error(err); }
    }, [orderId]);

    const fetchCosting = useCallback(async (id = null) => {
        try {
            const url = id ? `${API}/garment-costing/${id}` : `${API}/garment-costing/order/${orderId}`;
            const res = await axios.get(url);
            if (res.data) {
                // Formatting date for HTML input
                const formattedDate = res.data.delivery_date ? new Date(res.data.delivery_date).toISOString().split('T')[0] : "";
                setCosting({
                    ...res.data,
                    delivery_date: formattedDate,
                    fabrics: res.data.fabrics || [],
                    trims: res.data.trims || [],
                    processes: (res.data.processes || []).filter(p => !p.process_type || p.process_type === 'Process' || p.process_type === 'General'),
                    additional_processes: (res.data.processes || []).filter(p => p.process_type === 'CMT')
                });
                if (res.data.buyer_id) {
                    setSelectedBuyer({ value: res.data.buyer_id, label: res.data.buyer_name });
                }
            } else {
                setCosting(prev => ({
                    ...prev,
                    order_planning_id: orderId,
                    id: null,
                    fabrics: [{ fabric_name: "", gsm: "", cons_kg_pc: 0, excess_pct: 3, final_cons: 0, rate_kg: 0, total_cost: 0 }],
                    trims: [{ trim_name: "", uom: "Pc", qty_pc: 1, excess_pct: 2, final_qty: 0, rate: 0, total_cost: 0 }],
                    processes: [{ process_name: "", basis: "Kg", rate: 0, cost_pc: 0 }],
                    additional_processes: [{ process_name: "", basis: "Pc", rate: 0, cost_pc: 0 }]
                }));
            }
        } catch (err) {
            console.error("Error fetching costing:", err);
        }
    }, [orderId]);

    useEffect(() => {
        fetchBuyers();
        if (orderId && orderId !== 'undefined' && orderId !== 'null') {
            fetchCosting();
            fetchVersions();
        }
    }, [orderId, fetchBuyers, fetchCosting, fetchVersions]);

    const handleFabricChange = (index, field, value) => {
        if (isLocked) return;
        const newFabrics = [...costing.fabrics];
        newFabrics[index][field] = value;
        setCosting(prev => ({ ...prev, fabrics: newFabrics }));
    };

    const handleTrimChange = (index, field, value) => {
        if (isLocked) return;
        const newTrims = [...costing.trims];
        newTrims[index][field] = value;
        setCosting(prev => ({ ...prev, trims: newTrims }));
    };

    const handleProcessChange = (index, field, value, isAdditional = false) => {
        if (isLocked) return;
        const key = isAdditional ? 'additional_processes' : 'processes';
        const newProcesses = [...costing[key]];
        newProcesses[index][field] = value;
        setCosting(prev => ({ ...prev, [key]: newProcesses }));
    };

    const addRow = (type) => {
        if (isLocked) return;
        if (type === 'fabric') {
            setCosting(prev => ({ ...prev, fabrics: [...prev.fabrics, { fabric_name: "", gsm: "", cons_kg_pc: 0, excess_pct: 3, final_cons: 0, rate_kg: 0, total_cost: 0 }] }));
        } else if (type === 'trim') {
            setCosting(prev => ({ ...prev, trims: [...prev.trims, { trim_name: "", uom: "Pc", qty_pc: 1, excess_pct: 2, final_qty: 0, rate: 0, total_cost: 0 }] }));
        } else if (type === 'process') {
            setCosting(prev => ({ ...prev, processes: [...prev.processes, { process_name: "", basis: "Kg", rate: 0, cost_pc: 0 }] }));
        } else if (type === 'additional_process') {
            setCosting(prev => ({ ...prev, additional_processes: [...prev.additional_processes, { process_name: "", basis: "Pc", rate: 0, cost_pc: 0 }] }));
        }
    };

    const removeRow = (type, index) => {
        if (isLocked) return;
        if (type === 'fabric') {
            setCosting(prev => ({ ...prev, fabrics: prev.fabrics.filter((_, i) => i !== index) }));
        } else if (type === 'trim') {
            setCosting(prev => ({ ...prev, trims: prev.trims.filter((_, i) => i !== index) }));
        } else if (type === 'process') {
            setCosting(prev => ({ ...prev, processes: prev.processes.filter((_, i) => i !== index) }));
        } else if (type === 'additional_process') {
            setCosting(prev => ({ ...prev, additional_processes: prev.additional_processes.filter((_, i) => i !== index) }));
        }
    };

    // Calculations
    useEffect(() => {
        // 1. Calculate Fabric Costs
        const fabricsWithCosts = costing.fabrics.map(f => {
            const cons = parseFloat(f.cons_kg_pc) || 0;
            const excess = parseFloat(f.excess_pct) || 0;
            const rate = parseFloat(f.rate_kg) || 0;
            const final_cons = cons * (1 + excess / 100);
            return { ...f, final_cons, total_cost: final_cons * rate };
        });
        const totalFabrics = fabricsWithCosts.reduce((sum, f) => sum + f.total_cost, 0);
        const totalFinalFabricCons = fabricsWithCosts.reduce((sum, f) => sum + f.final_cons, 0);

        // 2. Calculate Trim Costs (Simplified: No Qty/Pc separate from Final Qty)
        const trimsWithCosts = costing.trims.map(t => {
            const qty = parseFloat(t.qty_pc) || 0;
            const rate = parseFloat(t.rate) || 0;
            return { ...t, final_qty: qty, total_cost: qty * rate };
        });
        const totalTrims = trimsWithCosts.reduce((sum, t) => sum + t.total_cost, 0);

        // 3. Calculate Process Costs (Dynamic Kg-based)
        const calcProcess = (p) => {
            if (p.basis === "Kg") return (parseFloat(p.rate) || 0) * totalFinalFabricCons;
            return parseFloat(p.rate) || 0;
        };
        const processesWithCosts = costing.processes.map(p => ({ ...p, cost_pc: calcProcess(p) }));
        const additionalProcessesWithCosts = costing.additional_processes.map(p => ({ ...p, cost_pc: calcProcess(p) }));

        const totalProcesses1 = processesWithCosts.reduce((sum, p) => sum + p.cost_pc, 0);
        const totalProcesses2 = additionalProcessesWithCosts.reduce((sum, p) => sum + p.cost_pc, 0);
        const totalProcesses = totalProcesses1 + totalProcesses2;

        // 4. Summary Totals
        const baseCost = totalFabrics + totalTrims + totalProcesses;
        const overheadAmount = baseCost * (costing.overhead_pct / 100);
        const totalCost = baseCost + overheadAmount;
        const profitAmount = totalCost * (costing.profit_pct / 100);
        const finalFob = totalCost + profitAmount;

        const marginPct = finalFob > 0 ? (profitAmount / finalFob) * 100 : 0;
        const totalOrderProfit = profitAmount * (costing.order_qty || 0);
        const diff = (costing.target_fob || 0) - finalFob;

        setCalcs({ overhead: overheadAmount, profit: profitAmount, subTotal: baseCost, marginPct, totalOrderProfit, diff });

        // Update state once with all calculated values to avoid infinite loop
        // We only update if values actually changed or we can just hope React handles it
        setCosting(prev => {
            const updatedCosting = {
                ...prev,
                fabrics: fabricsWithCosts,
                trims: trimsWithCosts,
                processes: processesWithCosts,
                additional_processes: additionalProcessesWithCosts,
                total_fabrics_cost: totalFabrics,
                total_trims_cost: totalTrims,
                total_processing_cost: totalProcesses1, // Only Kg Based
                cm_cost: totalProcesses2, // CMT is stored in cm_cost
                total_cost: totalCost,
                final_fob: finalFob
            };

            // Prevent infinite loop by only updating if values have actually changed
            if (
                JSON.stringify(prev.fabrics) !== JSON.stringify(updatedCosting.fabrics) ||
                JSON.stringify(prev.trims) !== JSON.stringify(updatedCosting.trims) ||
                JSON.stringify(prev.processes) !== JSON.stringify(updatedCosting.processes) ||
                JSON.stringify(prev.additional_processes) !== JSON.stringify(updatedCosting.additional_processes) ||
                prev.total_fabrics_cost !== updatedCosting.total_fabrics_cost ||
                prev.total_trims_cost !== updatedCosting.total_trims_cost ||
                prev.total_processing_cost !== updatedCosting.total_processing_cost ||
                prev.total_cost !== updatedCosting.total_cost ||
                prev.final_fob !== updatedCosting.final_fob
            ) {
                return updatedCosting;
            }
            return prev;
        });

    }, [costing.fabrics, costing.trims, costing.processes, costing.additional_processes, costing.cm_cost, costing.overhead_pct, costing.profit_pct, costing.order_qty, costing.target_fob]);

    const handleSave = async (asNewVersion = false) => {
        setLoading(true);
        try {
            const payload = {
                ...costing,
                id: asNewVersion ? null : costing.id,
                order_planning_id: orderId,
                buyer_id: selectedBuyer?.value,
                buyer_name: selectedBuyer?.label,
                version: asNewVersion ? `V${versions.length + 1}` : costing.version,
                status: asNewVersion ? "Draft" : costing.status
            };
            const res = await axios.post(`${API}/garment-costing`, payload);
            toast.success(asNewVersion ? "New version created!" : "Costing saved successfully!");
            if (onSaveSuccess) onSaveSuccess();
            fetchVersions();
            if (asNewVersion) {
                fetchCosting(res.data.id);
            }
        } catch (err) {
            toast.error(err.response?.data?.error || "Failed to save costing");
        } finally {
            setLoading(false);
        }
    };

    const handleFocus = (e) => {
        if (e.target.value === "0" || e.target.value === "0.00") {
            e.target.select();
        }
    };

    return (
        <div className="costing-module p-1 p-lg-2" style={{ minWidth: '1200px', background: '#f8fafc' }}>
            <div className="text-center mb-4">
                <h4 className="fw-bold text-dark opacity-75 mb-0" style={{ letterSpacing: '-0.5px' }}>Garment Costing Module</h4>
                <div className="d-flex justify-content-center mt-2">
                    <div style={{ width: '60px', height: '3px', background: '#0d6efd', borderRadius: '10px' }}></div>
                </div>
            </div>

            <div className="row g-4">
                <div className="col-12 col-xl-9">
                    {/* Style Info */}
                    <div className="card shadow-sm border-0 mb-3 rounded-4 overflow-hidden">
                        <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center gap-2">
                                <div className="p-2 bg-primary bg-opacity-10 rounded-3">
                                    <i className="bi bi-person-badge text-primary fs-5"></i>
                                </div>
                                <h6 className="fw-bold mb-0 text-dark opacity-75">Style Info</h6>
                            </div>
                            <div className="d-flex align-items-center gap-3">
                                <div className="d-flex align-items-center gap-2">
                                    <span className="small fw-bold text-muted">Version:</span>
                                    <span className="badge bg-primary px-3 py-2 rounded-2 fs-6">{costing.version || 'V1'}</span>
                                </div>
                                <div className="d-flex align-items-center gap-2">
                                    <span className="small fw-bold text-muted">Status:</span>
                                    <select
                                        disabled={isLocked}
                                        className={`form-select form-select-sm fw-bold border-0 rounded-pill px-3 ${costing.status === 'Approved' ? 'bg-success text-white' : 'bg-warning bg-opacity-10 text-warning'}`}
                                        style={{ width: '120px' }}
                                        value={costing.status}
                                        onChange={e => setCosting({ ...costing, status: e.target.value })}
                                    >
                                        <option value="Draft">Draft</option>
                                        <option value="Approved">Approved</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="card-body p-3">
                            <div className="row g-4">
                                <div className="col-md-3">
                                    <div className="d-flex align-items-center gap-2 mb-2">
                                        <i className="bi bi-people text-muted"></i>
                                        <label className="small fw-bold text-muted mb-0">Buyer:</label>
                                    </div>
                                    <Select
                                        options={buyersList}
                                        value={selectedBuyer}
                                        onChange={setSelectedBuyer}
                                        isDisabled={isLocked}
                                        placeholder="Select Buyer"
                                        classNamePrefix="react-select"
                                        styles={{
                                            control: (base) => ({ ...base, borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: 'bold', minHeight: '34px' }),
                                            singleValue: (base) => ({ ...base, color: '#0f172a' })
                                        }}
                                    />
                                </div>
                                <div className="col-md-3">
                                    <div className="d-flex align-items-center gap-2 mb-2">
                                        <i className="bi bi-hash text-muted"></i>
                                        <label className="small fw-bold text-muted mb-0">Style No:</label>
                                    </div>
                                    <input type="text" readOnly={isLocked} className="form-control rounded-3 border-light bg-light fw-bold" value={costing.style_no} onChange={e => setCosting({ ...costing, style_no: e.target.value })} placeholder="TS-101" />
                                </div>
                                <div className="col-md-4">
                                    <div className="d-flex align-items-center gap-2 mb-2">
                                        <i className="bi bi-file-text text-muted"></i>
                                        <label className="small fw-bold text-muted mb-0">Description:</label>
                                    </div>
                                    <input type="text" readOnly={isLocked} className="form-control rounded-3 border-light bg-light fw-bold" value={costing.description} onChange={e => setCosting({ ...costing, description: e.target.value })} placeholder="Collar T-Shirt" />
                                </div>
                                <div className="col-md-2">
                                    <div className="d-flex align-items-center gap-2 mb-2">
                                        <label className="small fw-bold text-muted mb-0">Currency:</label>
                                    </div>
                                    <select disabled={isLocked} className="form-select rounded-3 border-light bg-light fw-bold" value={costing.currency} onChange={e => setCosting({ ...costing, currency: e.target.value })}>
                                        <option value="INR">INR</option>
                                        <option value="USD">USD</option>
                                    </select>
                                </div>
                                <div className="col-md-3">
                                    <div className="d-flex align-items-center gap-2 mb-2">
                                        <i className="bi bi-box-seam text-muted"></i>
                                        <label className="small fw-bold text-muted mb-0">Order Qty:</label>
                                    </div>
                                    <div className="input-group">
                                        <input type="number" readOnly={isLocked} className="form-control rounded-3 border-light bg-light fw-bold" value={costing.order_qty} onChange={e => setCosting({ ...costing, order_qty: parseFloat(e.target.value) || 0 })} onFocus={handleFocus} />
                                        <span className="input-group-text bg-transparent border-0 small text-muted">pcs</span>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="d-flex align-items-center gap-2 mb-2">
                                        <i className="bi bi-currency-dollar text-muted"></i>
                                        <label className="small fw-bold text-muted mb-0">Target FOB Price:</label>
                                    </div>
                                    <div className="input-group">
                                        <span className="input-group-text bg-transparent border-0 fw-bold">₹</span>
                                        <input type="number" readOnly={isLocked} className="form-control rounded-3 border-light bg-light fw-bold" value={costing.target_fob} onChange={e => setCosting({ ...costing, target_fob: parseFloat(e.target.value) || 0 })} onFocus={handleFocus} />
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="d-flex align-items-center gap-2 mb-2">
                                        <i className="bi bi-calendar-event text-muted"></i>
                                        <label className="small fw-bold text-muted mb-0">Delivery Date:</label>
                                    </div>
                                    <input type="date" readOnly={isLocked} className="form-control rounded-3 border-light bg-light fw-bold" value={costing.delivery_date} onChange={e => setCosting({ ...costing, delivery_date: e.target.value })} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Fabric costing */}
                    <CostingTable
                        title="Fabric Costing"
                        icon="bi-box" color="#0d6efd"
                        headers={["Fabric Type", "GSM", "Cons (Kg/Pc)", "Excess %", "Final Cons", "Rate (₹/Kg)", "Fabric Cost (₹/Pc)"]}
                        onAdd={() => addRow('fabric')}
                        isLocked={isLocked}
                    >
                        {(costing.fabrics || []).map((f, i) => (
                            <tr key={i}>
                                <td><input type="text" readOnly={isLocked} className="form-control border-0 bg-transparent fw-bold" value={f.fabric_name} onChange={e => handleFabricChange(i, 'fabric_name', e.target.value)} placeholder="Fleece Cotton" /></td>
                                <td><input type="text" readOnly={isLocked} className="form-control border-0 bg-transparent text-center fw-bold" value={f.gsm || ""} onChange={e => handleFabricChange(i, 'gsm', e.target.value)} placeholder="180" /></td>
                                <td><input type="number" readOnly={isLocked} className="form-control border-0 bg-transparent text-center fw-bold" value={f.cons_kg_pc} onChange={e => handleFabricChange(i, 'cons_kg_pc', parseFloat(e.target.value) || 0)} onFocus={handleFocus} /></td>
                                <td><input type="number" readOnly={isLocked} className="form-control border-0 bg-transparent text-center fw-bold text-danger" value={f.excess_pct || 0} onChange={e => handleFabricChange(i, 'excess_pct', parseFloat(e.target.value) || 0)} onFocus={handleFocus} /></td>
                                <td className="text-center fw-bold text-muted">{Number(f.final_cons || 0).toFixed(4)}</td>
                                <td><input type="number" readOnly={isLocked} className="form-control border-0 bg-transparent text-center fw-bold" value={f.rate_kg} onChange={e => handleFabricChange(i, 'rate_kg', parseFloat(e.target.value) || 0)} onFocus={handleFocus} /></td>
                                <td className="text-center fw-bold bg-light">₹{Number(f.total_cost || 0).toFixed(2)}</td>
                                {!isLocked && <td className="text-center"><button onClick={() => removeRow('fabric', i)} className="btn btn-link link-danger p-0"><i className="bi bi-trash"></i></button></td>}
                            </tr>
                        ))}
                    </CostingTable>

                    {/* Trims costing */}
                    <CostingTable
                        title="Trims Costing"
                        icon="bi-key" color="#fd7e14"
                        headers={["Item", "Unit", "Qty", "Rate (₹)", "Total (₹/Pc)"]}
                        onAdd={() => addRow('trim')}
                        isLocked={isLocked}
                    >
                        {(costing.trims || []).map((t, i) => (
                            <tr key={i}>
                                <td><input type="text" readOnly={isLocked} className="form-control border-0 bg-transparent fw-bold" value={t.trim_name} onChange={e => handleTrimChange(i, 'trim_name', e.target.value)} placeholder="Label" /></td>
                                <td>
                                    <select disabled={isLocked} className="form-select border-0 bg-transparent fw-bold" value={t.uom || "Pc"} onChange={e => handleTrimChange(i, 'uom', e.target.value)}>
                                        <option value="Pc">Pc</option>
                                        <option value="Mtr">Mtr</option>
                                        <option value="Kg">Kg</option>
                                    </select>
                                </td>
                                <td><input type="number" readOnly={isLocked} className="form-control border-0 bg-transparent text-center fw-bold" value={t.qty_pc || 0} onChange={e => handleTrimChange(i, 'qty_pc', parseFloat(e.target.value) || 0)} onFocus={handleFocus} /></td>
                                <td><input type="number" readOnly={isLocked} className="form-control border-0 bg-transparent text-center fw-bold" value={t.rate || 0} onChange={e => handleTrimChange(i, 'rate', parseFloat(e.target.value) || 0)} onFocus={handleFocus} /></td>
                                <td className="text-center fw-bold bg-light">₹{Number(t.total_cost || 0).toFixed(2)}</td>
                                {!isLocked && <td className="text-center"><button onClick={() => removeRow('trim', i)} className="btn btn-link link-danger p-0"><i className="bi bi-trash"></i></button></td>}
                            </tr>
                        ))}
                        <tr className="bg-light bg-opacity-50">
                            <td colSpan="4" className="text-end fw-bold py-3 pe-4 text-muted">Total Trims Cost:</td>
                            <td className="text-center fw-bold fs-6">₹{Number(costing.total_trims_cost || 0).toFixed(2)}</td>
                            {!isLocked && <td></td>}
                        </tr>
                    </CostingTable>

                    {/* Process costing */}
                    <CostingTable
                        title="Process Costing (Kg Based)"
                        icon="bi-node-plus" color="#198754"
                        headers={["Process", "Rate (₹/Kg)", "Cost (₹/Pc)"]}
                        onAdd={() => addRow('process')}
                        isLocked={isLocked}
                    >
                        {(costing.processes || []).map((p, i) => (
                            <tr key={i}>
                                <td><input type="text" readOnly={isLocked} className="form-control border-0 bg-transparent fw-bold" value={p.process_name} onChange={e => handleProcessChange(i, 'process_name', e.target.value)} placeholder="Dyeing" /></td>
                                <td><input type="number" readOnly={isLocked} className="form-control border-0 bg-transparent text-center fw-bold" value={p.rate || 0} onChange={e => handleProcessChange(i, 'rate', parseFloat(e.target.value) || 0)} onFocus={handleFocus} /></td>
                                <td className="text-center fw-bold bg-light">₹{Number(p.cost_pc || 0).toFixed(2)}</td>
                                {!isLocked && <td className="text-center"><button onClick={() => removeRow('process', i)} className="btn btn-link link-danger p-0"><i className="bi bi-trash"></i></button></td>}
                            </tr>
                        ))}
                        <tr className="bg-primary bg-opacity-10">
                            <td colSpan="2" className="text-end fw-bold py-3 pe-4 text-primary fs-5">Total Process Cost (Kg Based):</td>
                            <td className="text-center fw-bold fs-5 text-primary">₹{Number(costing.total_processing_cost || 0).toFixed(2)}</td>
                            {!isLocked && <td></td>}
                        </tr>
                    </CostingTable>

                    {/* Additional Process costing */}
                    <CostingTable
                        title="CMT / Per Piece Costing"
                        icon="bi-scissors" color="#6f42c1"
                        headers={["Process", "Rate (₹/Pc)", "Cost (₹/Pc)"]}
                        onAdd={() => addRow('additional_process')}
                        isLocked={isLocked}
                    >
                        {(costing.additional_processes || []).map((p, i) => (
                            <tr key={i}>
                                <td><input type="text" readOnly={isLocked} className="form-control border-0 bg-transparent fw-bold" value={p.process_name} onChange={e => handleProcessChange(i, 'process_name', e.target.value, true)} placeholder="..." /></td>
                                <td><input type="number" readOnly={isLocked} className="form-control border-0 bg-transparent text-center fw-bold" value={p.rate || 0} onChange={e => handleProcessChange(i, 'rate', parseFloat(e.target.value) || 0, true)} onFocus={handleFocus} /></td>
                                <td className="text-center fw-bold bg-light">₹{Number(p.cost_pc || 0).toFixed(2)}</td>
                                {!isLocked && <td className="text-center"><button onClick={() => removeRow('additional_process', i)} className="btn btn-link link-danger p-0"><i className="bi bi-trash"></i></button></td>}
                            </tr>
                        ))}
                        <tr className="bg-primary bg-opacity-10">
                            <td colSpan="2" className="text-end fw-bold py-3 pe-4 text-primary fs-5">Total CMT Cost (Pc Based):</td>
                            <td className="text-center fw-bold fs-5 text-primary">₹{Number(costing.cm_cost || 0).toFixed(2)}</td>
                            {!isLocked && <td></td>}
                        </tr>
                    </CostingTable>
                </div>

                {/* Sidebar Summary */}
                <div className="col-12 col-xl-3">
                    <div className="sticky-top" style={{ top: '20px' }}>
                        <div className="card shadow border-0 rounded-4 overflow-hidden mb-4">
                            <div className="card-header bg-dark text-white p-3 border-0">
                                <div className="d-flex align-items-center gap-2">
                                    <i className="bi bi-clipboard-data fs-5"></i>
                                    <h6 className="fw-bold mb-0">Cost Calculation Summary</h6>
                                </div>
                            </div>
                            <div className="card-body p-3">
                                <SummaryItem label="Fabric Cost" value={costing.total_fabrics_cost} icon="bi-box" />
                                <SummaryItem label="Trims Cost" value={costing.total_trims_cost} icon="bi-key" />
                                <SummaryItem label="Process Cost" value={costing.total_processing_cost} icon="bi-node-plus" />
                                <SummaryItem label="CMT Cost" value={costing.cm_cost} icon="bi-scissors" />

                                <div className="border-top my-3 pt-3">
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                        <span className="fw-bold text-muted small">Base Cost</span>
                                        <span className="fw-bold">₹{Number(calcs.subTotal || 0).toFixed(2)}</span>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <div className="d-flex align-items-center gap-2">
                                            <span className="fw-bold text-muted small">Overhead (%)</span>
                                            <input
                                                type="number"
                                                readOnly={isLocked}
                                                className="form-control form-control-sm border-0 bg-light fw-bold text-center p-0"
                                                style={{ width: '40px', fontSize: '12px' }}
                                                value={costing.overhead_pct}
                                                onChange={e => setCosting({ ...costing, overhead_pct: parseFloat(e.target.value) || 0 })}
                                            />
                                        </div>
                                        <span className="fw-bold">₹{Number(calcs.overhead || 0).toFixed(2)}</span>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center bg-light p-2 rounded-2 mb-3">
                                        <span className="fw-bold text-dark small">Total Cost</span>
                                        <span className="fw-bold text-dark">₹{Number(costing.total_cost || 0).toFixed(2)}</span>
                                    </div>
                                </div>

                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <div className="d-flex align-items-center gap-2">
                                        <span className="fw-bold text-success small">Profit (%)</span>
                                        <input
                                            type="number"
                                            readOnly={isLocked}
                                            className="form-control form-control-sm border-0 bg-success bg-opacity-10 fw-bold text-center text-success p-0"
                                            style={{ width: '40px', fontSize: '12px' }}
                                            value={costing.profit_pct}
                                            onChange={e => setCosting({ ...costing, profit_pct: parseFloat(e.target.value) || 0 })}
                                        />
                                    </div>
                                    <span className="fw-bold text-success">₹{Number(calcs.profit || 0).toFixed(2)}</span>
                                </div>

                                <div className="bg-primary p-3 rounded-4 text-white shadow-sm mb-4">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span className="fw-bold small opacity-75">Final FOB Price (₹/Pc)</span>
                                        <i className="bi bi-lock-fill small"></i>
                                    </div>
                                    <div className="text-center my-1">
                                        <span className="display-6 fw-bold">₹{Number(costing.final_fob || 0).toFixed(2)}</span>
                                    </div>
                                </div>

                                <div className="d-flex justify-content-between small mb-2">
                                    <span className="text-muted fw-bold">Profit/Pc</span>
                                    <span className="fw-bold">₹{Number(calcs.profit || 0).toFixed(2)}</span>
                                </div>
                                <div className="d-flex justify-content-between small mb-4">
                                    <span className="text-muted fw-bold">Margin %</span>
                                    <span className="fw-bold text-success">{Number(calcs.marginPct || 0).toFixed(2)}%</span>
                                </div>

                                <div className="bg-success bg-opacity-10 p-3 rounded-3 mb-4">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span className="small fw-bold text-success">Total Order Profit</span>
                                        <span className="fw-bold text-success">₹{calcs.totalOrderProfit.toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="border border-dashed rounded-4 p-3">
                                    <div className="d-flex justify-content-between small mb-1">
                                        <span className="text-muted fw-bold">Target FOB:</span>
                                        <span className="fw-bold">₹{Number(costing.target_fob || 0).toFixed(2)}</span>
                                    </div>
                                    <div className="d-flex justify-content-between small">
                                        <span className="text-muted fw-bold">Diff:</span>
                                        <span className={`fw-bold ${calcs.diff >= 0 ? 'text-success' : 'text-danger'}`}>
                                            ₹{Math.abs(Number(calcs.diff || 0)).toFixed(2)} {calcs.diff >= 0 ? '↑' : '↓'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {!isLocked ? (
                            <div className="d-grid gap-2">
                                <button className="btn btn-primary py-2 rounded-4 fw-bold shadow" onClick={() => handleSave(false)} disabled={loading}>
                                    <i className="bi bi-save2 me-2"></i> Update Costing Version
                                </button>
                                <button className="btn btn-success py-2 rounded-4 fw-bold shadow" onClick={() => { if (window.confirm("Approve this costing? It will be locked.")) { setCosting({ ...costing, status: 'Approved' }); handleSave(false); } }}>
                                    <i className="bi bi-check-lg me-2"></i> Approve Costing
                                </button>
                                <button className="btn btn-outline-primary py-2 rounded-4 fw-bold" onClick={() => handleSave(true)}>
                                    <i className="bi bi-plus-circle me-2"></i> Create New Version
                                </button>
                                <button className="btn btn-link text-muted mt-2" onClick={() => onSaveSuccess && onSaveSuccess()}>
                                    Skip Costing for now <i className="bi bi-arrow-right ms-1"></i>
                                </button>
                            </div>
                        ) : (
                            <div className="p-3 bg-success bg-opacity-10 border border-success border-opacity-25 rounded-4 text-center text-success fw-bold">
                                <i className="bi bi-lock-fill me-2 fs-5"></i> COSTING APPROVED & LOCKED
                            </div>
                        )}
                        <p className="text-center small text-muted mt-3">* All values are calculated automatically based on inputs</p>
                    </div>
                </div>
            </div >
        </div >
    );
};

const CostingTable = ({ title, icon, color, headers, onAdd, isLocked, children }) => (
    <div className="card shadow-sm border-0 mb-4 rounded-4 overflow-hidden">
        <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-2">
                <div className="p-2 rounded-3" style={{ background: `${color}15`, color: color }}>
                    <i className={`bi ${icon} fs-5`}></i>
                </div>
                <h6 className="fw-bold mb-0 text-dark opacity-75">{title} <span className="small fw-normal text-muted" style={{ fontSize: '10px' }}>(Per Piece)</span></h6>
            </div>
            {!isLocked && <button className="btn btn-sm fw-bold px-3 rounded-pill" style={{ color: color, background: `${color}15` }} onClick={onAdd}><i className="bi bi-plus-lg me-1"></i> Add Row</button>}
        </div>
        <div className="card-body p-0">
            <div className="table-responsive">
                <table className="table table-bordered mb-0 align-middle">
                    <thead className="bg-light">
                        <tr className="small text-muted text-uppercase">
                            {headers.map((h, i) => <th key={i} className="text-center py-2 px-1" style={{ fontSize: '10px' }}>{h}</th>)}
                            {!isLocked && <th style={{ width: '50px' }}></th>}
                        </tr>
                    </thead>
                    <tbody>
                        {children}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
);

const SummaryItem = ({ label, value, icon }) => (
    <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex align-items-center gap-2 text-muted small fw-bold">
            <i className={`bi ${icon}`}></i>
            <span>{label}</span>
        </div>
        <span className="fw-bold">₹{Number(value || 0).toFixed(2)}</span>
    </div>
);

export default CostingModule;
