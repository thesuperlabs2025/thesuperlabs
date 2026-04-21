import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
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

const initialRow = () => ({ counts: "", fabric_name: "", fabric_sku: "", gsm: "", dia: "", color: "", style_name: "", style_color: "", qty: "" });


export default function EditOrderJobworkFabricToPcsOutward() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { toasts, add: toast, remove } = useToast();
    const [form, setForm] = useState({
        outward_date: "", order_no: "", order_name: "", party_name: "", ship_to: "", process: "", previous_process: "", ref_no: "",
        staff_name: "", staff_remarks: "", remarks: "", rows: [initialRow()]
    });
    const [outwardNo, setOutwardNo] = useState("...");
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    const [employees, setEmployees] = useState([]);
    const [processes, setProcesses] = useState([]);
    const [errors, setErrors] = useState({});
    const [orderStyleColors, setOrderStyleColors] = useState([]);
    const [lifecycle, setLifecycle] = useState([]);
    const [orderFabrics, setOrderFabrics] = useState([]);
    const [orderStyles, setOrderStyles] = useState([]);
    const [orderPlannedDetails, setOrderPlannedDetails] = useState([]); // {name, color} from planning
    const [prevUsedStyles, setPrevUsedStyles] = useState([]); // Unique {style_name, style_color} pairs from previous outwards


    // Supplier autocomplete
    const [supplierSuggestions, setSupplierSuggestions] = useState([]);
    const [supplierSuggIdx, setSupplierSuggIdx] = useState(-1);
    const supplierRef = useRef(null);

    // Ship To autocomplete
    const [shipToSuggestions, setShipToSuggestions] = useState([]);
    const [shipToSuggIdx, setShipToSuggIdx] = useState(-1);
    const shipToRef = useRef(null);

    const fetchData = useCallback(async () => {
        try {
            const [recRes, orderRes, empRes, procRes] = await Promise.all([
                axios.get(`${API}/fabric-to-pcs-outward/${id}`),
                axios.get(`${API}/yarn-dyeing-outward/orders`),
                axios.get(`${API}/employees`),
                axios.get(`${API}/life-cycles`)
            ]);
            const rec = recRes.data;
            const orders = orderRes.data || [];
            setOutwardNo(rec.outward_no);

            setEmployees(empRes.data || []);
            setProcesses((procRes.data || []).filter(p => p.process_type?.toLowerCase() === "fabric" || p.process_name?.toLowerCase() === "cutting"));
            setForm({
                outward_date: rec.outward_date ? rec.outward_date.substring(0, 10) : "",
                order_no: rec.order_no || "",
                order_name: rec.order_name || "",
                party_name: rec.party_name || "",
                ship_to: rec.ship_to || "",
                process: rec.process || "",
                previous_process: rec.previous_process || "",
                ref_no: rec.ref_no || "",
                staff_name: rec.staff_name || "",
                staff_remarks: rec.staff_remarks || "",
                remarks: rec.remarks || "",
                rows: (rec.items && rec.items.length) ? rec.items.map(it => ({
                    counts: it.counts || "",
                    fabric_name: it.fabric_name || "",
                    fabric_sku: it.fabric_sku || "",
                    gsm: it.gsm || "",
                    dia: it.dia || "",
                    color: it.color || "",
                    style_name: it.style_name || "",
                    style_color: it.style_color || "",
                    qty: it.qty || ""
                })) : [initialRow()],

            });

            // Fetch lifecycle and colors for the loaded order
            if (rec.order_no) {
                const orderFound = orders.find(o => o.order_no === rec.order_no);
                if (orderFound) {
                    const lifeRes = await axios.get(`${API}/order-planning-v2/all/${orderFound.id}`);
                    setLifecycle(lifeRes.data.lifecycle || []);
                    const colorRes = await axios.get(`${API}/size-quantity/order/${orderFound.id}`);
                    if (colorRes.data && colorRes.data.items) {
                        const items = colorRes.data.items;
                        const colors = [...new Set(items.map(it => it.color).filter(Boolean))];
                        const styles = [...new Set(items.map(it => it.style_name).filter(Boolean))];
                        // Create unique planned combos
                        const planned = [];
                        const pSeen = new Set();
                        items.forEach(it => {
                            const key = `${(it.style_name || "").trim()}|${(it.color || "").trim()}`;
                            if (key !== "|" && !pSeen.has(key)) {
                                pSeen.add(key);
                                planned.push({ name: it.style_name, color: it.color });
                            }
                        });

                        setOrderStyleColors(colors);
                        setOrderStyles(styles);
                        setOrderPlannedDetails(planned);
                    }
                    if (lifeRes.data && lifeRes.data.yarn) {
                        setOrderFabrics([...new Set(lifeRes.data.yarn.map(y => y.fabric_name).filter(Boolean))]);
                    }

                    // Fetch previous used styles/colors in cutting outward
                    const prevRes = await axios.get(`${API}/fabric-to-pcs-outward/by-order/${encodeURIComponent(rec.order_no)}`);
                    if (prevRes.data) {
                        const uniqueStyles = [];
                        const seen = new Set();
                        prevRes.data.forEach(it => {
                            const styleKey = `${(it.style_name || "").trim()}|${(it.style_color || "").trim()}`;
                            if (styleKey !== "|" && !seen.has(styleKey)) {
                                seen.add(styleKey);
                                uniqueStyles.push({ name: it.style_name, color: it.style_color });
                            }
                        });
                        setPrevUsedStyles(uniqueStyles);
                    }
                }
            }

        } catch (err) {
            toast("Failed to load record.", "danger");
        } finally { setLoading(false); }
    }, [id, toast]);

    useEffect(() => {
        fetchData();
        const handler = (e) => {
            if (supplierRef.current && !supplierRef.current.contains(e.target)) setSupplierSuggestions([]);
            if (shipToRef.current && !shipToRef.current.contains(e.target)) setShipToSuggestions([]);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [fetchData]);


    const handleHeader = (e) => {
        const { name, value } = e.target;
        setForm(prev => {
            const next = { ...prev, [name]: value };
            if (name === "process") {
                if (value && lifecycle.length > 0) {
                    const idx = lifecycle.findIndex(p => p.process_name?.toLowerCase() === value.toLowerCase() || p.custom_name?.toLowerCase() === value.toLowerCase());
                    if (idx > 0) {
                        const prevProc = lifecycle[idx - 1];
                        next.previous_process = prevProc.custom_name || prevProc.process_name;
                    } else next.previous_process = "";
                } else next.previous_process = "";
            }
            return next;
        });
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
    };

    const handlePartyChange = async (e) => {
        const val = e.target.value;
        setForm(prev => ({ ...prev, party_name: val }));
        setErrors(prev => ({ ...prev, party_name: "" }));
        setSupplierSuggIdx(-1);
        if (val.length >= 1) {
            try { const res = await axios.get(`${API}/supplier/supplier?term=${encodeURIComponent(val)}`); setSupplierSuggestions(res.data); }
            catch { setSupplierSuggestions([]); }
        } else setSupplierSuggestions([]);
    };

    const selectSupplier = (name) => { setForm(prev => ({ ...prev, party_name: name })); setErrors(prev => ({ ...prev, party_name: "" })); setSupplierSuggestions([]); };
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
        rows[index] = { ...rows[index], [name]: value };
        setForm(prev => ({ ...prev, rows }));
    };



    const addRow = () => setForm(prev => ({ ...prev, rows: [...prev.rows, initialRow()] }));
    const removeRow = (i) => { if (form.rows.length === 1) return; setForm(prev => ({ ...prev, rows: prev.rows.filter((_, idx) => idx !== i) })); };

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
        if (!validate()) { toast("Please fix the highlighted fields before saving.", "warning"); return; }
        setSaving(true);
        try {
            await axios.put(`${API}/fabric-to-pcs-outward/${id}`, {
                outward_type: "order", ...form,
                total_qty: totalQty, items: form.rows,
            });
            toast("Updated successfully!", "success");
            setTimeout(() => navigate("/order-jobwork-fabric-to-pcs-outward-list"), 1500);
        } catch (err) {
            toast(err.response?.data?.error || "Failed to update. Please try again.", "danger");
        } finally { setSaving(false); }
    };

    if (loading) return <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 300 }}><span className="spinner-border text-primary"></span></div>;

    return (
        <div className="container-fluid mt-3 mb-5 px-3 px-md-4">
            <Toast toasts={toasts} remove={remove} />

            <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom">
                <button className="btn btn-outline-secondary btn-sm rounded-pill px-3" onClick={() => navigate("/order-jobwork-fabric-to-pcs-outward-list")}>
                    <i className="bi bi-arrow-left me-1"></i>Back
                </button>
                <div>
                    <div className="d-flex align-items-center gap-2">
                        <span className="badge bg-dark rounded-pill px-3" style={{ fontSize: "0.7rem", letterSpacing: "0.06em" }}>ORDER JOBWORKS</span>
                        <span className="badge bg-warning-subtle text-warning rounded-pill px-3" style={{ fontSize: "0.7rem" }}>{form.process}</span>
                    </div>
                    <h4 className="fw-bold mb-0 mt-1 text-dark">
                        <i className="bi bi-pencil-square me-2 text-warning"></i>Edit Fabric Tops Outward
                    </h4>
                </div>
                <div className="ms-auto text-end">
                    <div className="fw-bold text-primary fs-5">{outwardNo}</div>
                    <small className="text-muted">Outward No.</small>
                </div>
            </div>

            <div className="card border-0 shadow-sm rounded-4">
                <div className="card-body p-4">
                    <div className="row g-3 mb-3">
                        <div className="col-md-2">
                            <label className="form-label fw-semibold text-muted" style={{ fontSize: "0.8rem" }}>DATE</label>
                            <input type="date" className="form-control" name="outward_date" value={form.outward_date} onChange={handleHeader} />
                        </div>
                        <div className="col-md-2">
                            <label className="form-label fw-semibold text-muted" style={{ fontSize: "0.8rem" }}>ORDER NO <span className="text-danger">*</span></label>
                            <input type="text" className="form-control bg-light" value={form.order_no} readOnly />
                        </div>
                        <div className="col-md-2">
                            <label className="form-label fw-semibold text-muted" style={{ fontSize: "0.8rem" }}>ORDER NAME</label>
                            <input type="text" className="form-control bg-light" name="order_name" value={form.order_name}
                                readOnly={!!form.order_no} onChange={handleHeader} placeholder="Auto-filled from order" />
                        </div>
                        <div className="col-md-2">
                            <label className="form-label fw-semibold text-muted" style={{ fontSize: "0.8rem" }}>PROCESS</label>
                            <select className="form-select fw-semibold text-success" name="process" value={form.process} onChange={handleHeader} style={{ fontSize: "0.82rem" }}>
                                <option value="">— Select —</option>
                                {processes.map((p, i) => (
                                    <option key={i} value={p.process_name}>{p.process_name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-2">
                            <label className="form-label fw-semibold text-muted" style={{ fontSize: "0.8rem" }}>PREV. PROCESS</label>
                            <input type="text" className="form-control bg-light" name="previous_process" value={form.previous_process} readOnly placeholder="Auto-filled" />
                        </div>
                        <div className="col-md-2">
                            <label className="form-label fw-semibold text-muted" style={{ fontSize: "0.8rem" }}>REF. / DC NO.</label>
                            <input type="text" className="form-control" name="ref_no" value={form.ref_no} onChange={handleHeader} placeholder="DC / Challan" />
                        </div>
                        <div className="col-md-2">
                            <label className="form-label fw-semibold text-muted" style={{ fontSize: "0.8rem" }}>TOTAL QTY (KG)</label>
                            <input className="form-control fw-bold text-center bg-light" readOnly value={dispTotalQty} style={{ color: "#1d4ed8" }} />
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
                            <i className="bi bi-person-badge me-2 text-primary fs-5"></i>
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
                        <h6 className="fw-bold mb-0 text-dark"><i className="bi bi-table me-2 text-primary"></i>Fabric Items</h6>
                        <button className="btn btn-primary btn-sm rounded-pill px-3" onClick={addRow}>
                            <i className="bi bi-plus-lg me-1"></i>Add Row
                        </button>
                    </div>
                    {errors.rows && <div className="alert alert-warning py-1 px-3 small mb-2 rounded-3"><i className="bi bi-exclamation-triangle me-1"></i>{errors.rows}</div>}

                    <div className="table-responsive rounded-3 border">
                        <table className="table table-hover table-bordered align-middle mb-0">
                            <thead className="table-dark">
                                <tr>
                                    <th className="text-center" style={{ width: "5%" }}>#</th>
                                    <th style={{ width: "10%" }}>COUNTS</th>
                                    <th style={{ width: "15%" }}>FABRIC NAME</th>
                                    <th style={{ width: "13%" }}>COLOR</th>
                                    <th style={{ width: "12%" }}>STYLE NAME</th>
                                    <th style={{ width: "10%" }}>STYLE COLOR</th>
                                    <th style={{ width: "8%" }}>GSM</th>
                                    <th style={{ width: "8%" }}>DIA</th>
                                    <th style={{ width: "12%" }}>QTY (KG)</th>
                                    <th className="text-center" style={{ width: "5%" }}>DEL</th>
                                </tr>
                            </thead>
                            <tbody>
                                {form.rows.map((row, idx) => (
                                    <tr key={idx}>
                                        <td className="text-center text-muted fw-semibold small">{idx + 1}</td>
                                        <td><input type="text" className="form-control form-control-sm" name="counts" value={row.counts} onChange={(e) => handleRowChange(idx, e)} placeholder="Counts" /></td>
                                        <td>
                                            <input type="text" className="form-control form-control-sm" name="fabric_name" value={row.fabric_name} onChange={(e) => handleRowChange(idx, e)} placeholder="Fabric Name" list={`order-fabrics-${idx}`} />
                                            <datalist id={`order-fabrics-${idx}`}>
                                                {orderFabrics.map((f, i) => <option key={i} value={f} />)}
                                            </datalist>
                                        </td>
                                        <td>
                                            <input type="text" className="form-control form-control-sm" name="color" value={row.color} onChange={(e) => handleRowChange(idx, e)} placeholder="Color" list={`order-colors-${idx}`} />
                                            <datalist id={`order-colors-${idx}`}>
                                                {orderStyleColors.map((c, i) => <option key={i} value={c} />)}
                                            </datalist>
                                        </td>

                                        <td>
                                            <select className="form-select form-select-sm" name="style_name" value={row.style_name} onChange={(e) => handleRowChange(idx, e)}>
                                                <option value="">— Style —</option>
                                                {orderStyles.map((s, i) => <option key={`pl-${i}`} value={s}>{s}</option>)}
                                                {prevUsedStyles.filter(ps => !orderStyles.includes(ps.name)).map((s, i) => <option key={`prev-${i}`} value={s.name}>{s.name} (Prev)</option>)}
                                            </select>
                                        </td>
                                        <td>
                                            <select className="form-select form-select-sm" name="style_color" value={row.style_color} onChange={(e) => handleRowChange(idx, e)}>
                                                <option value="">— Color —</option>
                                                {/* 1. Colors planned for this style */}
                                                {row.style_name && orderPlannedDetails.filter(d => d.name === row.style_name).map((d, i) => <option key={`pc-${i}`} value={d.color}>{d.color}</option>)}

                                                {/* 2. Colors previously used for this style (if not in planned) */}
                                                {row.style_name && prevUsedStyles.filter(ps => ps.name === row.style_name && !orderPlannedDetails.some(op => op.name === ps.name && op.color === ps.color)).map((s, i) => <option key={`prec-${i}`} value={s.color}>{s.color} (Prev)</option>)}

                                                {/* 3. Fallback: all planned order colors if no style chosen */}
                                                {!row.style_name && orderStyleColors.map((c, i) => <option key={`sc-${i}`} value={c}>{c}</option>)}
                                            </select>
                                        </td>
                                        <td><input type="text" className="form-control form-control-sm" name="gsm" value={row.gsm} onChange={(e) => handleRowChange(idx, e)} placeholder="GSM" /></td>
                                        <td><input type="text" className="form-control form-control-sm" name="dia" value={row.dia} onChange={(e) => handleRowChange(idx, e)} placeholder="DIA" /></td>
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
                                    <td colSpan={8} className="text-end fw-bold">Total:</td>

                                    <td className="text-center fw-bold text-warning">{dispTotalQty} KG</td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    <div className="mt-4 pt-3 border-top d-flex gap-2">
                        <button className="btn btn-warning rounded-pill px-5 py-2 fw-bold text-dark" onClick={handleSave} disabled={saving}>
                            {saving ? <><span className="spinner-border spinner-border-sm me-2"></span>Updating...</> : <><i className="bi bi-cloud-arrow-up me-2"></i>Update Outward</>}
                        </button>
                        <button className="btn btn-outline-secondary rounded-pill px-4" onClick={() => navigate("/order-jobwork-fabric-to-pcs-outward-list")}>Cancel</button>
                    </div>
                </div>
            </div>
        </div >
    );
}
