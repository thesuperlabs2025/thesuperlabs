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

const initialRow = () => ({ counts: "", fabric_name: "", fabric_sku: "", gsm: "", dia: "", color: "", style_name: "", style_color: "", qty: "" });
const today = new Date().toISOString().substring(0, 10);
const getForm = () => ({
    outward_date: today,
    order_no: "", order_name: "",
    party_name: "",
    ship_to: "",
    process: "",
    previous_process: "",
    ref_no: "",
    staff_name: "",
    staff_remarks: "",
    remarks: "",
    rows: [initialRow()]
});

export default function OrderJobworkFabricToPcsOutward() {
    const navigate = useNavigate();
    const { toasts, add: toast, remove } = useToast();
    const [form, setForm] = useState(getForm());
    const [outwardNo, setOutwardNo] = useState("Loading...");
    const [saving, setSaving] = useState(false);
    const [orders, setOrders] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [processes, setProcesses] = useState([]);
    const [errors, setErrors] = useState({});
    const selectedYear = JSON.parse(localStorage.getItem("selectedYear") || "{}");
    const [lifecycle, setLifecycle] = useState([]);
    const [orderStyleColors, setOrderStyleColors] = useState([]);
    const [orderStyles, setOrderStyles] = useState([]);
    const [orderPlannedDetails, setOrderPlannedDetails] = useState([]); // {name, color} from planning
    const [orderFabrics, setOrderFabrics] = useState([]);
    const [prevUsedStyles, setPrevUsedStyles] = useState([]);


    // Modal for Loading Previous Data
    const [showLoadModal, setShowLoadModal] = useState(false);
    const [loadableItems, setLoadableItems] = useState([]);

    // Supplier autocomplete
    const [supplierSuggestions, setSupplierSuggestions] = useState([]);
    const [supplierSuggIdx, setSupplierSuggIdx] = useState(-1);
    const supplierRef = useRef(null);

    // Ship to autocomplete
    const [shipToSuggestions, setShipToSuggestions] = useState([]);
    const [shipToSuggestionIndex, setShipToSuggestionIndex] = useState(-1);
    const shipToRef = useRef(null);



    const fetchInitial = useCallback(async () => {
        try {
            const [noRes, orderRes, empRes, procRes] = await Promise.all([
                axios.get(`${API}/fabric-to-pcs-outward/next-no/order`),
                axios.get(`${API}/yarn-dyeing-outward/orders`), // Orders are same for all core modules
                axios.get(`${API}/employees`),
                axios.get(`${API}/life-cycles`)
            ]);
            setOutwardNo(noRes.data.outward_no);
            setOrders(orderRes.data || []);
            setEmployees(empRes.data || []);
            // Filter processes: Type 'Fabric' or 'Cutting'
            setProcesses((procRes.data || []).filter(p => p.process_type?.toLowerCase() === "fabric" || p.process_name?.toLowerCase() === "cutting"));
        } catch (err) {
            console.error("fetchInitial error:", err);
            setOutwardNo("0001");
        }
    }, []);

    useEffect(() => {
        fetchInitial();
        const handler = (e) => {
            if (supplierRef.current && !supplierRef.current.contains(e.target)) setSupplierSuggestions([]);
            if (shipToRef.current && !shipToRef.current.contains(e.target)) { setShipToSuggestions([]); setShipToSuggestionIndex(-1); }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [fetchInitial]);

    useEffect(() => {
        if (form.process && lifecycle && lifecycle.length > 0) {
            const val = form.process.trim().toLowerCase();
            const idx = lifecycle.findIndex(p =>
                (p.process_name || "").trim().toLowerCase() === val ||
                (p.custom_name || "").trim().toLowerCase() === val
            );
            if (idx > 0) {
                const prevProc = lifecycle[idx - 1];
                const prevName = prevProc.custom_name || prevProc.process_name;
                if (form.previous_process !== prevName) {
                    setForm(prev => ({ ...prev, previous_process: prevName }));
                }
            } else {
                if (form.previous_process !== "") {
                    setForm(prev => ({ ...prev, previous_process: "" }));
                }
            }
        } else if (form.previous_process !== "") {
            setForm(prev => ({ ...prev, previous_process: "" }));
        }
    }, [form.process, lifecycle, form.previous_process]);

    const handleOrderSelect = async (e) => {
        const val = e.target.value;
        const found = orders.find(o => o.order_no === val);
        setForm(prev => ({ ...prev, order_no: val, order_name: found ? (found.order_name || "") : "", previous_process: "" }));
        setErrors(prev => ({ ...prev, order_no: "" }));

        if (found) {
            try {
                // Fetch lifecycle
                const lifeRes = await axios.get(`${API}/order-planning-v2/all/${found.id}`);
                console.log("Fetched lifecycle for order:", found.id, lifeRes.data.lifecycle);
                setLifecycle(lifeRes.data.lifecycle || []);

                // Fetch style colors/names from planning
                const colorRes = await axios.get(`${API}/size-quantity/order/${found.id}`);
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
                } else {
                    setOrderStyleColors([]);
                    setOrderStyles([]);
                    setOrderPlannedDetails([]);
                }

                // Get unique fabrics from yarn planning
                if (lifeRes.data && lifeRes.data.yarn) {
                    const fabrics = [...new Set(lifeRes.data.yarn.map(y => y.fabric_name).filter(Boolean))];
                    setOrderFabrics(fabrics);
                } else {
                    setOrderFabrics([]);
                }

                // Fetch previous used styles/colors in cutting outward
                const prevRes = await axios.get(`${API}/fabric-to-pcs-outward/by-order/${encodeURIComponent(val)}`);
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

            } catch (err) {
                console.error("Error fetching order details:", err);
                setLifecycle([]);
                setOrderStyleColors([]);
                setOrderStyles([]);
                setOrderPlannedDetails([]);
                setPrevUsedStyles([]);
            }
        } else {
            setLifecycle([]);
            setOrderStyleColors([]);
            setOrderStyles([]);
            setOrderPlannedDetails([]);
            setOrderFabrics([]);
            setPrevUsedStyles([]);
        }

    };

    const handleHeader = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
    };

    const handleLoadPrevious = async () => {
        if (!form.order_no || !form.previous_process) {
            toast("Please select order and ensure previous process is identified.", "warning");
            return;
        }

        // IdentiAY previous process type to choose correct API
        const prevProc = lifecycle.find(p =>
            (p.custom_name && p.custom_name === form.previous_process) ||
            (p.process_name === form.previous_process)
        );
        const type = (prevProc?.process_type || "").toLowerCase();

        // Choose endpoint: yarn type processes are in yarn-dyeing-inward, others in fabric-to-pcs-inward
        const endpoint = type === "yarn"
            ? `${API}/yarn-dyeing-inward/order-process-items`
            : `${API}/fabric-to-pcs-inward/order-process-items`;

        try {
            // Try matching both custom_name and process_name if they differ
            const res = await axios.get(endpoint, {
                params: {
                    order_no: form.order_no,
                    process: form.previous_process,
                    alt_process: prevProc?.process_name !== form.previous_process ? prevProc?.process_name : null
                }
            });

            if (res.data && res.data.length > 0) {
                const filtered = res.data.filter(it => {
                    const bQty = parseFloat(it.balanced_qty || it.pending_qty || it.qty || 0);
                    return bQty > 0;
                });
                if (filtered.length > 0) {
                    setLoadableItems(filtered.map(it => ({ ...it, checked: true })));
                    setShowLoadModal(true);
                } else {
                    toast(`All quantities for ${form.previous_process} have already been processed.`, "info");
                }
            } else {
                toast(`No inward data found for ${form.previous_process} in this order.`, "info");
            }
        } catch (err) {
            console.error("Load previous error:", err);
            const msg = err.response?.data?.error || err.message || "Failed to load previous process data.";
            toast(msg, "danger");
        }
    };

    const handleApplyLoad = () => {
        const selected = loadableItems.filter(i => i.checked);
        if (selected.length === 0) return;

        const newRows = selected.map(it => {
            const qty = it.balanced_qty || it.pending_qty || it.qty || "";
            return {
                counts: it.counts || "",
                fabric_name: it.fabric_name || "",
                fabric_sku: it.fabric_sku || "",
                gsm: it.gsm || "",
                dia: it.dia || "",
                color: it.color || "",
                qty: qty,
                max_qty: qty,
                style_name: it.style_name || "",
                style_color: it.style_color || ""
            };
        });

        setForm(prev => {
            const existing = prev.rows.filter(r => r.fabric_name || r.qty);
            return { ...prev, rows: existing.length === 0 ? newRows : [...existing, ...newRows] };
        });

        setShowLoadModal(false);
        toast(`Successfully loaded ${selected.length} items.`, "success");
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

    // Ship to autocomplete handlers
    const handleShipToInput = async (e) => {
        const val = e.target.value;
        setForm(prev => ({ ...prev, ship_to: val }));
        setShipToSuggestionIndex(-1);
        if (val.length >= 1) {
            try {
                const res = await axios.get(`${API}/supplier/supplier?term=${encodeURIComponent(val)}`);
                setShipToSuggestions(res.data);
            } catch { setShipToSuggestions([]); }
        } else setShipToSuggestions([]);
    };

    const selectShipTo = (supplier) => {
        setForm(prev => ({ ...prev, ship_to: supplier.name }));
        setShipToSuggestions([]);
        setShipToSuggestionIndex(-1);
    };

    const handleShipToKeyDown = (e) => {
        if (!shipToSuggestions.length) return;
        if (e.key === "ArrowDown") { e.preventDefault(); setShipToSuggestionIndex(p => Math.min(p + 1, shipToSuggestions.length - 1)); }
        else if (e.key === "ArrowUp") { e.preventDefault(); setShipToSuggestionIndex(p => Math.max(p - 1, -1)); }
        else if (e.key === "Enter" && shipToSuggestionIndex >= 0) { e.preventDefault(); selectShipTo(shipToSuggestions[shipToSuggestionIndex]); }
        else if (e.key === "Escape") { setShipToSuggestions([]); setShipToSuggestionIndex(-1); }
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
        if (!form.process) e.process = "Process is required";
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

        if (selectedYear.is_closed) {
            toast("Error: This Accounting Year is locked and cannot be modified.", "warning");
            return;
        }

        const date = new Date(form.outward_date);
        const startDate = new Date(selectedYear.start_date);
        const endDate = new Date(selectedYear.end_date);
        if (date < startDate || date > endDate) {
            if (!window.confirm(`Warning: Outward date is outside the selected Accounting Year (AY ${selectedYear.year_name}). Do you want to proceed?`)) {
                return;
            }
        }

        setSaving(true);
        try {
            const res = await axios.post(`${API}/fabric-to-pcs-outward`, {
                outward_type: "order", ...form,
                total_qty: totalQty, items: form.rows,
                year_id: selectedYear.year_id
            });
            toast(`Saved! Outward No: ${res.data.outward_no}`, "success");
            setTimeout(() => navigate("/order-jobwork-fabric-to-pcs-outward-list"), 1500);
        } catch (err) {
            toast(err.response?.data?.error || "Failed to save. Please try again.", "danger");
        } finally { setSaving(false); }
    };

    return (
        <div className="container-fluid mt-3 mb-5 px-3 px-md-4">
            <Toast toasts={toasts} remove={remove} />

            {/* Page header */}
            <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom">
                <button className="btn btn-outline-secondary btn-sm rounded-pill px-3" onClick={() => navigate("/order-jobwork-fabric-to-pcs-outward-list")}>
                    <i className="bi bi-arrow-left me-1"></i>Back
                </button>
                <div className="d-flex align-items-center gap-4">
                    <div>
                        <div className="d-flex align-items-center gap-2">
                            <span className="badge bg-dark rounded-pill px-3" style={{ fontSize: "0.7rem", letterSpacing: "0.06em" }}>ORDER JOBWORKS</span>
                            <span className="badge bg-primary-subtle text-primary rounded-pill px-3" style={{ fontSize: "0.7rem" }}>{form.process}</span>
                        </div>
                        <h4 className="fw-bold mb-0 mt-1 text-dark">
                            <i className="bi bi-box-arrow-up-right me-2 text-primary"></i>Fabric Outward
                        </h4>
                    </div>
                    <div className="vr" style={{ height: '40px', opacity: 0.2 }}></div>
                    <div>
                        <span className="x-small text-uppercase opacity-75 fw-bold d-block mb-1" style={{ fontSize: '0.65rem' }}>Accounting Year</span>
                        <h6 className="fw-bold mb-0">AY {selectedYear.year_name}</h6>
                    </div>
                    {selectedYear.is_closed ? (
                        <span className="badge bg-danger px-3 py-2 rounded-pill shadow-sm">
                            <i className="bi bi-lock-fill me-1"></i>LOCKED
                        </span>
                    ) : (
                        <span className="badge bg-success px-3 py-2 rounded-pill shadow-sm">
                            <i className="bi bi-unlock-fill me-1"></i>ACTIVE
                        </span>
                    )}
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
                                        "&:hover": { borderColor: "#10b981" }
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
                            <select className={`form-select fw-semibold text-success ${errors.process ? "is-invalid" : ""}`}
                                name="process" value={form.process} onChange={handleHeader}
                                disabled={form.rows.some(r => r.fabric_name || r.qty)}>
                                <option value="">— Select —</option>
                                {processes.map((p, i) => (
                                    <option key={i} value={p.process_name}>{p.process_name}</option>
                                ))}
                            </select>
                            {errors.process && <div className="invalid-feedback d-block">{errors.process}</div>}
                        </div>
                        <div className="col-md-2">
                            <label className="form-label fw-semibold text-muted" style={{ fontSize: "0.8rem" }}>PREV. PROCESS</label>
                            <div className="d-flex gap-2">
                                <input type="text" className="form-control bg-light" name="previous_process" value={form.previous_process} readOnly placeholder="Auto-filled" />
                                {form.previous_process && (
                                    <button className="btn btn-dark btn-sm rounded-3 px-3" onClick={handleLoadPrevious} title="Load items from previous process inward">
                                        Load
                                    </button>
                                )}
                            </div>
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
                                    {shipToSuggestions
                                        .filter(supplier =>
                                            (supplier.name ?? "").toLowerCase().includes((form.ship_to || "").toLowerCase())
                                        )
                                        .slice(0, 10)
                                        .map((supplier, index) => (
                                            <li
                                                key={supplier.id}
                                                className={`list-group-item list-group-item-action py-1 px-3 small ${shipToSuggestionIndex === index ? "active" : ""}`}
                                                style={{ cursor: "pointer" }}
                                                onMouseDown={() => selectShipTo(supplier)}>
                                                <i className="bi bi-building me-2 text-muted"></i>{supplier.name}
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
                                    <th style={{ width: "15%" }}>COUNTS</th>
                                    <th style={{ width: "15%" }}>FABRIC NAME</th>
                                    <th style={{ width: "13%" }}>COLOR</th>
                                    <th style={{ width: "12%" }}>STYLE NAME</th>
                                    <th style={{ width: "10%" }}>STYLE COLOR</th>
                                    <th style={{ width: "8%" }}>GSM</th>
                                    <th style={{ width: "8%" }}>DIA</th>
                                    <th style={{ width: "10%" }}>QTY (KG)</th>
                                    <th className="text-center" style={{ width: "5%" }}>DEL</th>
                                </tr>
                            </thead>
                            <tbody>
                                {form.rows.map((row, idx) => (
                                    <tr key={idx}>
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
                                    <td colSpan={7} className="text-end fw-bold">Total:</td>
                                    <td className="text-center fw-bold text-warning">{dispTotalQty} KG</td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    <div className="mt-4 pt-3 border-top d-flex align-items-center gap-3">
                        {selectedYear.is_closed ? (
                            <div className="alert alert-danger mb-0 py-2 px-4 fw-bold shadow-sm" style={{ borderRadius: '50px' }}>
                                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                Year Locked
                            </div>
                        ) : (
                            <button className="btn btn-primary rounded-pill px-5 py-2 fw-bold" onClick={handleSave} disabled={saving}>
                                {saving ? <><span className="spinner-border spinner-border-sm me-2"></span>Saving...</> : <><i className="bi bi-cloud-arrow-up me-2"></i>Save Outward</>}
                            </button>
                        )}
                        <button className="btn btn-outline-secondary rounded-pill px-4 py-2" onClick={() => navigate("/order-jobwork-fabric-to-pcs-outward-list")}>Cancel</button>
                    </div>
                </div>
            </div>

            {/* Modal for loading previous process items */}
            {showLoadModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1060 }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg rounded-4">
                            <div className="modal-header bg-dark text-white border-0 py-3 px-4">
                                <h5 className="modal-title fw-bold">Select Items from {form.previous_process}</h5>
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
                                                <th>Style Name</th>
                                                <th>Style Color</th>
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
                                                    <td><span className="badge bg-light text-dark border small">{item.process || form.previous_process}</span></td>
                                                    <td className="fw-semibold small">{item.fabric_name}</td>
                                                    <td className="small">{item.color}</td>
                                                    <td className="small">{item.style_name || <em className="text-muted">N/A</em>}</td>
                                                    <td className="small">{item.style_color || <em className="text-muted">N/A</em>}</td>
                                                    <td className="small">{item.gsm}</td>
                                                    <td className="small">{item.dia}</td>
                                                    <td className="text-end fw-bold text-primary">{parseFloat(item.balanced_qty || item.pending_qty || item.qty || 0).toFixed(3)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {(!loadableItems || loadableItems.length === 0) && <div className="p-5 text-center text-muted">No items found for this process.</div>}
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
