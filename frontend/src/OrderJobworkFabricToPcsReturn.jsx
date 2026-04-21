import React, { useState, useEffect, useRef, useCallback } from "react";
import Select from "react-select";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const API = process.env.REACT_APP_API_URL;

/* ─── Toast helper ─────────────────────────────────────────────────────────── */
function Toast({ toasts, remove }) {
    return (
        <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, minWidth: 280 }}>
            {toasts.map(t => (
                <div key={t.id} className={`alert alert-${t.type} alert-dismissible shadow d-flex align-items-center gap-2 mb-2`}
                    style={{ borderRadius: 12, animation: "fadeInRight 0.3s ease" }}>
                    <i className={`bi ${t.type === "success" ? "bi-check-circle-fill" : t.type === "danger" ? "bi-x-circle-fill" : "bi-exclamation-triangle-fill"} fs-5`}></i>
                    <span className="fw-semibold small">{t.msg}</span>
                    <button className="btn-close ms-auto" style={{ fontSize: "0.7rem" }} onClick={() => remove(t.id)} />
                </div>
            ))}
            <style>{`@keyframes fadeInRight{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:translateX(0)}}`}</style>
        </div>
    );
}

function useToast() {
    const [toasts, setToasts] = useState([]);
    const add = useCallback((msg, type = "success") => {
        const id = Date.now();
        setToasts(p => [...p, { id, msg, type }]);
        setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
    }, []);
    const remove = useCallback((id) => setToasts(p => p.filter(t => t.id !== id)), []);
    return { toasts, add, remove };
}
/* ──────────────────────────────────────────────────────────────────────────── */

const initialRow = () => ({ counts: "", fabric_name: "", gsm: "", dia: "", color: "", qty: "" });
const today = new Date().toISOString().substring(0, 10);
const getForm = () => ({
    return_date: today,
    order_no: "", order_name: "",
    party_name: "",
    ship_to: "",
    process: "",
    ref_no: "",
    staff_name: "",
    staff_remarks: "",
    remarks: "",
    rows: [initialRow()]
});

export default function OrderJobworkFabricToPcsReturn() {
    const navigate = useNavigate();
    const { toasts, add: toast, remove } = useToast();
    const [form, setForm] = useState(getForm());
    const [returnNo, setReturnNo] = useState("Loading...");
    const [saving, setSaving] = useState(false);
    const [orders, setOrders] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [processes, setProcesses] = useState([]);
    const [errors, setErrors] = useState({});

    const [styleColors, setStyleColors] = useState([]);

    // Modal for Loading Inward Data
    const [showLoadModal, setShowLoadModal] = useState(false);
    const [loadableItems, setLoadableItems] = useState([]);

    // Fabric autocomplete
    const [fabricSuggestions, setFabricSuggestions] = useState([]);
    const [activeRowIdx, setActiveRowIdx] = useState(null);
    const [fabricSuggIdx, setFabricSuggIdx] = useState(-1);
    const fabricRef = useRef(null);

    // Supplier autocomplete
    const [supplierSuggestions, setSupplierSuggestions] = useState([]);
    const [supplierSuggIdx, setSupplierSuggIdx] = useState(-1);
    const supplierRef = useRef(null);

    // Ship To autocomplete
    const [shipToSuggestions, setShipToSuggestions] = useState([]);
    const [shipToSuggIdx, setShipToSuggIdx] = useState(-1);
    const shipToRef = useRef(null);



    const fetchInitial = useCallback(async () => {
        try {
            const [noRes, orderRes, empRes, procRes] = await Promise.all([
                axios.get(`${API}/fabric-to-pcs-return/next-no/order`),
                axios.get(`${API}/yarn-dyeing-outward/orders`),
                axios.get(`${API}/employees`),
                axios.get(`${API}/life-cycles`)
            ]);
            setReturnNo(noRes.data.return_no);
            setOrders(orderRes.data || []);
            setEmployees(empRes.data || []);
            const _filteredProcs = (procRes.data || []).filter(p => p.process_type?.toLowerCase() === "fabric" || p.process_name?.toLowerCase() === "cutting");
            setProcesses(_filteredProcs);
        } catch (err) {
            console.error("fetchInitial error:", err);
            setReturnNo("0001");
        }
    }, []);

    useEffect(() => {
        fetchInitial();
        const handler = (e) => {
            if (fabricRef.current && !fabricRef.current.contains(e.target)) { setFabricSuggestions([]); setActiveRowIdx(null); }
            if (supplierRef.current && !supplierRef.current.contains(e.target)) setSupplierSuggestions([]);
            if (shipToRef.current && !shipToRef.current.contains(e.target)) setShipToSuggestions([]);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [fetchInitial]);

    const handleOrderSelect = async (e) => {
        const val = e.target.value;
        const found = orders.find(o => o.order_no === val);
        setForm(prev => ({ ...prev, order_no: val, order_name: found ? (found.order_name || "") : "" }));
        setErrors(prev => ({ ...prev, order_no: "" }));

        if (found) {
            try {
                // Fetch style colors
                const colorRes = await axios.get(`${API}/size-quantity/order/${found.id}`);
                if (colorRes.data && colorRes.data.items) {
                    const colors = [...new Set(colorRes.data.items.map(it => it.color).filter(Boolean))];
                    setStyleColors(colors);
                } else {
                    setStyleColors([]);
                }
            } catch (err) {
                console.error("Error fetching order colors:", err);
                setStyleColors([]);
            }
        } else {
            setStyleColors([]);
        }
    };

    const handleLoadInward = async () => {
        if (!form.order_no) {
            toast("Please select an order first.", "warning");
            return;
        }
        try {
            // Usually returns are from what was received (inward)
            // We need the items for these inwards. The endpoint might return headers only.
            // Let's assume we want to pull items from the latest inward for this order and process.
            // For now, let's just fetch all items for this order from inward_items if available.
            // Or better: use a specialized endpoint if it exists. 
            // Since we moved to a modal, let's just fetch items from the latest inward matching order.

            const outRes = await axios.get(`${API}/fabric-to-pcs-inward/order-process-items`, {
                params: { order_no: form.order_no, process: form.process || "" }
            });
            const items = outRes.data;
            if (items && items.length > 0) {
                const filtered = items.filter(it => {
                    const bQty = parseFloat(it.balanced_qty || it.pending_qty || it.qty || 0);
                    return bQty > 0;
                });
                if (filtered.length > 0) {
                    setLoadableItems(filtered.map(it => ({ ...it, checked: true })));
                    setShowLoadModal(true);
                } else {
                    toast("All inward quantities have already been returned.", "info");
                }
            } else {
                toast("No inward records found for this order" + (form.process ? ` and process ${form.process}` : "") + ".", "info");
            }
        } catch (err) {
            console.error("Error loading inward items:", err);
            const msg = err.response?.data?.error || err.message || "Failed to fetch inward items.";
            toast(msg, "danger");
        }
    };

    const handleApplyLoad = () => {
        const selected = loadableItems.filter(i => i.checked);
        if (selected.length === 0) return;

        const first = selected[0];
        const newRows = selected.map(it => {
            const qty = it.balanced_qty || it.pending_qty || it.qty || "";
            return {
                counts: it.counts || "",
                fabric_name: it.fabric_name || "",
                gsm: it.gsm || "",
                dia: it.dia || "",
                color: it.color || "",
                qty: qty,
                max_qty: qty
            };
        });

        setForm(prev => {
            const existing = prev.rows.filter(r => r.fabric_name || r.qty);
            return {
                ...prev,
                party_name: prev.party_name || first.party_name || "",
                ship_to: prev.ship_to || first.ship_to || "",
                process: prev.process || first.process || "",
                rows: existing.length === 0 ? newRows : [...existing, ...newRows]
            };
        });

        setShowLoadModal(false);
        toast(`Successfully loaded ${selected.length} items from inward records.`, "success");
    };

    const handleHeader = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
    };

    const handlePartyChange = async (e) => {
        const val = e.target.value;
        setForm(prev => ({ ...prev, party_name: val }));
        setErrors(prev => ({ ...prev, party_name: "" }));
        setSupplierSuggIdx(-1);
        if (val.length >= 1) {
            try {
                const res = await axios.get(`${API}/supplier/supplier?term=${encodeURIComponent(val)}`);
                setSupplierSuggestions(res.data);
            } catch { setSupplierSuggestions([]); }
        } else setSupplierSuggestions([]);
    };

    const selectSupplier = (name) => {
        setForm(prev => ({ ...prev, party_name: name }));
        setErrors(prev => ({ ...prev, party_name: "" }));
        setSupplierSuggestions([]);
    };

    const handleSupplierKeyDown = (e) => {
        if (!supplierSuggestions.length) return;
        if (e.key === "ArrowDown") { e.preventDefault(); setSupplierSuggIdx(p => Math.min(p + 1, supplierSuggestions.length - 1)); }
        else if (e.key === "ArrowUp") { e.preventDefault(); setSupplierSuggIdx(p => Math.max(p - 1, -1)); }
        else if (e.key === "Enter" && supplierSuggIdx >= 0) { e.preventDefault(); selectSupplier(supplierSuggestions[supplierSuggIdx].name); }
        else if (e.key === "Escape") setSupplierSuggestions([]);
    };

    const handleShipToInput = async (e) => {
        const val = e.target.value;
        setForm(prev => ({ ...prev, ship_to: val }));
        setShipToSuggIdx(-1);
        if (val.length >= 1) {
            try {
                const res = await axios.get(`${API}/supplier/supplier?term=${encodeURIComponent(val)}`);
                setShipToSuggestions(res.data);
            } catch { setShipToSuggestions([]); }
        } else setShipToSuggestions([]);
    };

    const selectShipTo = (name) => {
        setForm(prev => ({ ...prev, ship_to: name }));
        setShipToSuggestions([]);
    };

    const handleShipToKeyDown = (e) => {
        if (!shipToSuggestions.length) return;
        if (e.key === "ArrowDown") { e.preventDefault(); setShipToSuggIdx(p => Math.min(p + 1, shipToSuggestions.length - 1)); }
        else if (e.key === "ArrowUp") { e.preventDefault(); setShipToSuggIdx(p => Math.max(p - 1, -1)); }
        else if (e.key === "Enter" && shipToSuggIdx >= 0) { e.preventDefault(); selectShipTo(shipToSuggestions[shipToSuggIdx].name); }
        else if (e.key === "Escape") setShipToSuggestions([]);
    };

    const handleRowChange = (index, e) => {
        const { name, value } = e.target;
        const rows = [...form.rows];
        if (name === "qty" && rows[index].max_qty && parseFloat(value) > parseFloat(rows[index].max_qty)) {
            toast(`Quantity cannot exceed loaded quantity (${rows[index].max_qty})`, "warning");
            rows[index].qty = rows[index].max_qty;
        } else {
            rows[index][name] = value;
        }
        setForm(prev => ({ ...prev, rows }));

        if (name === "fabric_name") {
            setActiveRowIdx(index); setFabricSuggIdx(-1);
            if (value.length >= 1) {
                axios.get(`${API}/fabrics?term=${encodeURIComponent(value)}`)
                    .then(r => setFabricSuggestions(r.data.filter(f => f.fabric_name.toLowerCase().includes(value.toLowerCase())))).catch(() => setFabricSuggestions([]));
            } else setFabricSuggestions([]);
        }
    };

    const selectFabric = (index, fabric) => {
        const rows = [...form.rows];
        rows[index] = { ...rows[index], fabric_name: fabric.fabric_name, gsm: fabric.gsm || rows[index].gsm, dia: fabric.dia || rows[index].dia, color: fabric.color || rows[index].color };
        setForm(prev => ({ ...prev, rows }));
        setFabricSuggestions([]); setActiveRowIdx(null);
    };

    const handleFabricKeyDown = (e, index) => {
        if (!fabricSuggestions.length || activeRowIdx !== index) return;
        if (e.key === "ArrowDown") { e.preventDefault(); setFabricSuggIdx(p => Math.min(p + 1, fabricSuggestions.length - 1)); }
        else if (e.key === "ArrowUp") { e.preventDefault(); setFabricSuggIdx(p => Math.max(p - 1, -1)); }
        else if (e.key === "Enter" && fabricSuggIdx >= 0) { e.preventDefault(); selectFabric(index, fabricSuggestions[fabricSuggIdx]); }
        else if (e.key === "Escape") { setFabricSuggestions([]); setActiveRowIdx(null); }
    };

    const addRow = () => setForm(prev => ({ ...prev, rows: [...prev.rows, initialRow()] }));
    const removeRow = (i) => {
        if (form.rows.length === 1) return;
        setForm(prev => ({ ...prev, rows: prev.rows.filter((_, idx) => idx !== i) }));
    };

    const totalQty = form.rows.reduce((s, r) => s + (parseFloat(r.qty) || 0), 0);
    const dispTotalQty = totalQty.toFixed(3);

    const validate = () => {
        const e = {};
        if (!form.order_no) e.order_no = "Order No. is required";
        if (!form.party_name.trim()) e.party_name = "Party / Supplier is required";
        if (form.rows.some(r => !r.fabric_name.trim())) e.rows = "All rows must have a Fabric Name";
        if (form.rows.some(r => !r.qty)) e.rows = (e.rows ? e.rows + " and " : "") + "Qty is required";
        setErrors(e);
        return Object.keys(e).length === 0;
    };



    const handleSave = async () => {
        if (!validate()) {
            toast("Please fix the highlighted fields before saving.", "warning");
            return;
        }
        setSaving(true);
        try {
            const res = await axios.post(`${API}/fabric-to-pcs-return`, {
                return_type: "order", ...form,
                total_qty: totalQty, items: form.rows,
            });
            toast(`Saved! Return No: ${res.data.return_no}`, "success");
            setTimeout(() => navigate("/order-jobwork-fabric-to-pcs-return-list"), 1500);
        } catch (err) {
            toast(err.response?.data?.error || "Failed to save. Please try again.", "danger");
        } finally { setSaving(false); }
    };

    return (
        <div className="container-fluid mt-3 mb-5 px-3 px-md-4">
            <Toast toasts={toasts} remove={remove} />

            <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom">
                <button className="btn btn-outline-secondary btn-sm rounded-pill px-3" onClick={() => navigate("/order-jobwork-fabric-to-pcs-return-list")}>
                    <i className="bi bi-arrow-left me-1"></i>Back
                </button>
                <div>
                    <div className="d-flex align-items-center gap-2">
                        <span className="badge bg-dark rounded-pill px-3" style={{ fontSize: "0.7rem", letterSpacing: "0.06em" }}>ORDER JOBWORKS</span>
                        <span className="badge bg-danger-subtle text-danger rounded-pill px-3" style={{ fontSize: "0.7rem" }}>{form.process} RETURN</span>
                    </div>
                    <h4 className="fw-bold mb-0 mt-1 text-dark">
                        <i className="bi bi-box-arrow-left me-2 text-danger"></i>Fabric Return
                    </h4>
                </div>
                <div className="ms-auto text-end">
                    <div className="fw-bold text-danger fs-5">{returnNo}</div>
                    <small className="text-muted">Return No.</small>
                </div>
            </div>

            <div className="card border-0 shadow-sm rounded-4">
                <div className="card-body p-4">

                    <div className="row g-3 mb-3">
                        <div className="col-md-2">
                            <label className="form-label fw-semibold text-muted" style={{ fontSize: "0.8rem" }}>DATE</label>
                            <input type="date" className="form-control" name="return_date" value={form.return_date} onChange={handleHeader} />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label fw-semibold text-muted" style={{ fontSize: "0.8rem" }}>ORDER NO <span className="text-danger">*</span></label>
                            <Select
                                options={orders.map(o => ({ value: o.order_no, label: o.order_no, details: o }))}
                                value={form.order_no ? { value: form.order_no, label: form.order_no } : null}
                                onChange={(opt) => handleOrderSelect({ target: { name: "order_no", value: opt ? opt.value : "" } })}
                                placeholder="Search Order..."
                                isClearable
                                isDisabled={form.rows.some(r => r.fabric_name || r.qty)}
                                styles={{
                                    control: (base) => ({
                                        ...base,
                                        borderRadius: "8px",
                                        border: errors.order_no ? "1px solid #dc3545" : "1px solid #dee2e6",
                                        boxShadow: "none",
                                        "&:hover": { borderColor: "#dc3545" }
                                    })
                                }}
                            />
                            {errors.order_no && <div className="invalid-feedback d-block">{errors.order_no}</div>}
                        </div>
                        <div className="col-md-2">
                            <label className="form-label fw-semibold text-muted" style={{ fontSize: "0.8rem" }}>ORDER NAME</label>
                            <input type="text" className="form-control bg-light" name="order_name" value={form.order_name}
                                readOnly={!!form.order_no} onChange={handleHeader} placeholder="Auto-filled from order" />
                        </div>
                        <div className="col-md-2">
                            <label className="form-label fw-semibold text-muted" style={{ fontSize: "0.8rem" }}>PROCESS <span className="text-danger">*</span></label>
                            <div className="d-flex gap-2">
                                <select className={`form-select fw-semibold text-danger ${errors.process ? "is-invalid" : ""}`}
                                    name="process" value={form.process} onChange={handleHeader}
                                    disabled={form.rows.some(r => r.fabric_name || r.qty)}>
                                    <option value="">— Select —</option>
                                    {processes.map((p, i) => (
                                        <option key={i} value={p.process_name}>{p.process_name}</option>
                                    ))}
                                </select>
                                {form.order_no && (
                                    <button className="btn btn-dark btn-sm rounded-3 px-3" onClick={handleLoadInward} title="Load items from inward records">
                                        Load
                                    </button>
                                )}
                            </div>
                            {errors.process && <div className="invalid-feedback d-block">{errors.process}</div>}
                        </div>
                        <div className="col-md-2">
                            <label className="form-label fw-semibold text-muted" style={{ fontSize: "0.8rem" }}>REF. / DC NO.</label>
                            <input type="text" className="form-control" name="ref_no" value={form.ref_no} onChange={handleHeader} placeholder="DC / Challan" />
                        </div>
                        <div className="col-md-2">
                            <label className="form-label fw-semibold text-muted" style={{ fontSize: "0.8rem" }}>TOTAL QTY (KG)</label>
                            <input className="form-control fw-bold text-center bg-light" readOnly value={dispTotalQty} style={{ color: "#dc3545" }} />
                        </div>
                    </div>

                    <div className="row g-3 mb-4">
                        <div className="col-md-4 position-relative" ref={supplierRef}>
                            <label className="form-label fw-semibold text-muted" style={{ fontSize: "0.8rem" }}>PARTY NAME (SUPPLIER) <span className="text-danger">*</span></label>
                            <input type="text" className={`form-control ${errors.party_name ? "is-invalid" : ""}`}
                                name="party_name" value={form.party_name}
                                onChange={handlePartyChange} onKeyDown={handleSupplierKeyDown}
                                placeholder="Type to search supplier..." autoComplete="off" />
                            {errors.party_name && <div className="invalid-feedback">{errors.party_name}</div>}
                            {supplierSuggestions.length > 0 && (
                                <ul className="list-group position-absolute w-100 shadow-lg" style={{ zIndex: 1050, top: "calc(100% - 1px)", maxHeight: 200, overflowY: "auto" }}>
                                    {supplierSuggestions.map((s, i) => (
                                        <li key={s.id}
                                            className={`list-group-item list-group-item-action py-1 px-3 small ${supplierSuggIdx === i ? "active" : ""}`}
                                            style={{ cursor: "pointer" }}
                                            onMouseDown={() => selectSupplier(s.name)}>
                                            <i className="bi bi-building me-2 text-muted"></i>{s.name}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <div className="col-md-4 position-relative" ref={shipToRef}>
                            <label className="form-label fw-semibold text-muted" style={{ fontSize: "0.8rem" }}>SHIP TO</label>
                            <input type="text" className="form-control"
                                name="ship_to" value={form.ship_to}
                                onChange={handleShipToInput} onKeyDown={handleShipToKeyDown}
                                placeholder="Type to search supplier..." autoComplete="off" />
                            {shipToSuggestions.length > 0 && (
                                <ul className="list-group position-absolute w-100 shadow-lg" style={{ zIndex: 1050, top: "calc(100% - 1px)", maxHeight: 200, overflowY: "auto" }}>
                                    {shipToSuggestions.map((s, i) => (
                                        <li key={s.id}
                                            className={`list-group-item list-group-item-action py-1 px-3 small ${shipToSuggIdx === i ? "active" : ""}`}
                                            style={{ cursor: "pointer" }}
                                            onMouseDown={() => selectShipTo(s.name)}>
                                            <i className="bi bi-building me-2 text-muted"></i>{s.name}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <div className="col-md-4">
                            <label className="form-label fw-semibold text-muted" style={{ fontSize: "0.8rem" }}>REMARKS</label>
                            <input type="text" className="form-control" name="remarks" value={form.remarks} onChange={handleHeader} placeholder="Optional remarks" />
                        </div>
                    </div>

                    <div className="card bg-light border-0 rounded-3 mb-4 p-3">
                        <div className="d-flex align-items-center mb-3">
                            <i className="bi bi-person-badge me-2 text-danger fs-5"></i>
                            <h6 className="fw-bold mb-0 text-dark">Staff Details</h6>
                        </div>
                        <div className="row g-3">
                            <div className="col-md-4">
                                <label className="form-label fw-semibold text-muted" style={{ fontSize: "0.8rem" }}>STAFF NAME</label>
                                <select className="form-select" name="staff_name" value={form.staff_name} onChange={handleHeader}>
                                    <option value="">— Select Staff —</option>
                                    {employees.map((emp, i) => <option key={i} value={emp.employee_name}>{emp.employee_name}</option>)}
                                </select>
                            </div>
                            <div className="col-md-8">
                                <label className="form-label fw-semibold text-muted" style={{ fontSize: "0.8rem" }}>STAFF REMARKS</label>
                                <textarea className="form-control" name="staff_remarks" rows="2" value={form.staff_remarks}
                                    onChange={handleHeader} placeholder="Enter staff remarks or instructions..." />
                            </div>
                        </div>
                    </div>

                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <h6 className="fw-bold mb-0 text-dark"><i className="bi bi-table me-2 text-danger"></i>Return Items</h6>
                        <button className="btn btn-danger btn-sm rounded-pill px-3" onClick={addRow}>
                            <i className="bi bi-plus-lg me-1"></i>Add Row
                        </button>
                    </div>
                    {errors.rows && <div className="alert alert-warning py-1 px-3 small mb-2 rounded-3"><i className="bi bi-exclamation-triangle me-1"></i>{errors.rows}</div>}

                    <div className="table-responsive rounded-3 border" ref={fabricRef}>
                        <table className="table table-hover table-bordered align-middle mb-0">
                            <thead className="table-dark">
                                <tr>
                                    <th className="text-center" style={{ width: "5%" }}>#</th>
                                    <th style={{ width: "10%" }}>COUNTS</th>
                                    <th style={{ width: "15%" }}>FABRIC NAME</th>
                                    <th style={{ width: "10%" }}>GSM</th>
                                    <th style={{ width: "10%" }}>DIA</th>
                                    <th style={{ width: "13%" }}>COLOR</th>

                                    <th style={{ width: "12%" }}>QTY (KG)</th>
                                    <th className="text-center" style={{ width: "5%" }}>DEL</th>
                                </tr>
                            </thead>
                            <tbody>
                                {form.rows.map((row, idx) => (
                                    <tr key={idx}>
                                        <td className="text-center text-muted fw-semibold small">{idx + 1}</td>
                                        <td><input type="text" className="form-control form-control-sm" name="counts" value={row.counts} onChange={(e) => handleRowChange(idx, e)} placeholder="Counts" /></td>
                                        <td className="position-relative">
                                            <input type="text" className="form-control form-control-sm"
                                                name="fabric_name" value={row.fabric_name}
                                                onChange={(e) => handleRowChange(idx, e)}
                                                onKeyDown={(e) => handleFabricKeyDown(e, idx)}
                                                placeholder="Search fabric..." autoComplete="off" />
                                            {activeRowIdx === idx && fabricSuggestions.length > 0 && (
                                                <ul className="list-group position-absolute w-100 shadow-lg" style={{ zIndex: 1050, top: "100%", maxHeight: 200, overflowY: "auto" }}>
                                                    {fabricSuggestions.map((f, i) => (
                                                        <li key={f.id}
                                                            className={`list-group-item list-group-item-action py-1 px-2 small ${fabricSuggIdx === i ? "active" : ""}`}
                                                            style={{ cursor: "pointer" }}
                                                            onMouseDown={() => selectFabric(idx, f)}>
                                                            <strong>{f.fabric_name}</strong>
                                                            {f.counts && <span className="text-muted ms-1">· {f.counts}</span>}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </td>
                                        <td><input type="text" className="form-control form-control-sm" name="gsm" value={row.gsm} onChange={(e) => handleRowChange(idx, e)} placeholder="GSM" /></td>
                                        <td><input type="text" className="form-control form-control-sm" name="dia" value={row.dia} onChange={(e) => handleRowChange(idx, e)} placeholder="DIA" /></td>
                                        <td>
                                            {form.process?.toLowerCase().includes("dyeing") ? (
                                                <select className="form-select form-select-sm" name="color" value={row.color} onChange={(e) => handleRowChange(idx, e)}>
                                                    <option value="">— Color —</option>
                                                    {styleColors.map((c, i) => <option key={i} value={c}>{c}</option>)}
                                                </select>
                                            ) : (
                                                <input type="text" className="form-control form-control-sm" name="color" value={row.color} onChange={(e) => handleRowChange(idx, e)} placeholder="Color" />
                                            )}
                                        </td>

                                        <td><input type="number" className="form-control form-control-sm text-center" name="qty" value={row.qty} onChange={(e) => handleRowChange(idx, e)} placeholder="0.000" min="0" step="0.001" /></td>
                                        <td className="text-center">
                                            <button className="btn btn-sm btn-outline-danger rounded-circle" style={{ width: 28, height: 28, padding: 0 }}
                                                onClick={() => removeRow(idx)} disabled={form.rows.length === 1}>
                                                <i className="bi bi-x"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="table-dark">
                                    <td colSpan={6} className="text-end fw-bold">Total:</td>
                                    <td className="text-center fw-bold text-warning">{dispTotalQty} KG</td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    <div className="mt-4 pt-3 border-top d-flex gap-2">
                        <button className="btn btn-danger rounded-pill px-5 py-2 fw-bold" onClick={handleSave} disabled={saving}>
                            {saving ? <><span className="spinner-border spinner-border-sm me-2"></span>Saving...</> : <><i className="bi bi-cloud-arrow-up me-2"></i>Save Return</>}
                        </button>
                        <button className="btn btn-outline-secondary rounded-pill px-4" onClick={() => navigate("/order-jobwork-fabric-to-pcs-return-list")}>Cancel</button>
                    </div>
                </div>
            </div>

            {/* Modal for loading inward process items */}
            {showLoadModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1060 }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg rounded-4">
                            <div className="modal-header bg-dark text-white border-0 py-3 px-4">
                                <h5 className="modal-title fw-bold">Select Items from Inward Records</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowLoadModal(false)}></button>
                            </div>
                            <div className="modal-body p-0">
                                <div className="table-responsive" style={{ maxHeight: "400px" }}>
                                    <table className="table table-hover align-middle mb-0">
                                        <thead className="table-light sticky-top">
                                            <tr>
                                                <th className="text-center" style={{ width: "50px" }}>
                                                    <input type="checkbox" className="form-check-input"
                                                        onChange={(e) => {
                                                            const checked = e.target.checked;
                                                            setLoadableItems(prev => prev.map(item => ({ ...item, checked })));
                                                        }}
                                                        checked={loadableItems.length > 0 && loadableItems.every(i => i.checked)}
                                                    />
                                                </th>
                                                <th>Process</th>
                                                <th>Fabric Name</th>
                                                <th>Color</th>
                                                <th>GSM</th>
                                                <th>DIA</th>
                                                <th className="text-end">Qty (KG)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {loadableItems.map((item, idx) => (
                                                <tr key={idx} onClick={() => {
                                                    setLoadableItems(prev => {
                                                        const updated = [...prev];
                                                        updated[idx].checked = !updated[idx].checked;
                                                        return updated;
                                                    });
                                                }} style={{ cursor: "pointer" }}>
                                                    <td className="text-center">
                                                        <input type="checkbox" className="form-check-input" checked={!!item.checked} readOnly />
                                                    </td>
                                                    <td><span className="badge bg-light text-dark border small">{item.process || form.process}</span></td>
                                                    <td className="fw-semibold small">{item.fabric_name}</td>
                                                    <td className="small">{item.color}</td>
                                                    <td className="small">{item.gsm}</td>
                                                    <td className="small">{item.dia}</td>
                                                    <td className="text-end fw-bold text-danger">{item.qty}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {(!loadableItems || loadableItems.length === 0) && <div className="p-5 text-center text-muted">No items found in inward records.</div>}
                            </div>
                            <div className="modal-footer border-0 p-3">
                                <button className="btn btn-light rounded-pill px-4" onClick={() => setShowLoadModal(false)}>Cancel</button>
                                <button className="btn btn-dark rounded-pill px-4" onClick={handleApplyLoad} disabled={!loadableItems.some(i => i.checked)}>
                                    Load Selected ({loadableItems.filter(i => i.checked).length})
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
