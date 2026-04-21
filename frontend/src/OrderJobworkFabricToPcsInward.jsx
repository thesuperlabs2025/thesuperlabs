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

const initialRow = () => ({
    counts: "",
    fabric_name: "",
    fabric_sku: "",
    style_name: "",
    gsm: "",
    dia: "",
    color: "",
    fabric_color: "",
    style_color: "",
    qty: "",
    sizes_data: {},
    cut_pcs_wt: "",
    waste_pcs_wt: ""
});


const today = new Date().toISOString().substring(0, 10);
const getForm = () => ({
    inward_date: today,
    order_no: "", order_name: "",
    party_name: "",
    ship_to: "",
    process: "",
    size_chart_name: "",
    ref_no: "",
    staff_name: "",
    staff_remarks: "",
    remarks: "",
    rows: [initialRow()]
});


export default function OrderJobworkFabricToPcsInward() {
    const navigate = useNavigate();
    const { toasts, add: toast, remove } = useToast();
    const [form, setForm] = useState(getForm());
    const [inwardNo, setInwardNo] = useState("Loading...");
    const [saving, setSaving] = useState(false);
    const [orders, setOrders] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [processes, setProcesses] = useState([]);
    const [errors, setErrors] = useState({});

    const [styleColors, setStyleColors] = useState([]);
    const [sizeCharts, setSizeCharts] = useState([]);



    // Modal for Loading Outward Data
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
            const [noRes, orderRes, empRes, procRes, chartRes] = await Promise.all([
                axios.get(`${API}/fabric-to-pcs-inward/next-no/order`),
                axios.get(`${API}/yarn-dyeing-outward/orders`),
                axios.get(`${API}/employees`),
                axios.get(`${API}/life-cycles`),
                axios.get(`${API}/size-charts`)
            ]);
            setInwardNo(noRes.data.inward_no);
            setOrders(orderRes.data || []);
            setEmployees(empRes.data || []);
            setProcesses((procRes.data || []).filter(p => p.process_type?.toLowerCase() === "fabric" || p.process_name?.toLowerCase() === "cutting"));
            setSizeCharts(chartRes.data || []);

        } catch (err) {
            console.error("fetchInitial error:", err);
            setInwardNo("0001");
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
                const colorRes = await axios.get(`${API}/size-quantity/order/${found.id}`);

                if (colorRes.data && colorRes.data.items) {
                    const colors = [...new Set(colorRes.data.items.map(it => it.color).filter(Boolean))];
                    setStyleColors(colors);

                    // Auto-select size chart from order's size quantity details
                    if (colorRes.data.size_chart_name) {
                        setForm(prev => ({ ...prev, size_chart_name: colorRes.data.size_chart_name }));
                    }
                } else {
                    setStyleColors([]);
                }
            } catch (err) {
                console.error("Error fetching order details:", err);
                setStyleColors([]);
            }
        } else {
            setStyleColors([]);
            setForm(prev => ({ ...prev, size_chart_name: "" }));
        }




    };

    const handleLoadOutward = async () => {
        if (!form.order_no) {
            toast("Please select an order first.", "warning");
            return;
        }
        try {
            const outRes = await axios.get(`${API}/fabric-to-pcs-outward/by-order/${encodeURIComponent(form.order_no)}`);
            let items = outRes.data || [];

            // Filter by selected process
            if (form.process) {
                items = items.filter(it => it.process?.toLowerCase() === form.process.toLowerCase());
            }

            if (items.length > 0) {
                const filtered = items.filter(it => {
                    const bQty = parseFloat(it.balanced_qty || it.pending_qty || it.qty || 0);
                    return bQty > 0;
                });
                if (filtered.length > 0) {
                    setLoadableItems(filtered.map(it => ({ ...it, checked: true })));
                    setShowLoadModal(true);
                } else {
                    toast(`All quantities have already been received.`, "info");
                }
            } else {
                toast("No outward records found for this order.", "info");
            }
        } catch (err) {
            console.error("Error loading outward items:", err);
            toast("Failed to fetch outward items.", "danger");
        }
    };

    const handleApplyLoad = () => {
        const selected = loadableItems.filter(i => i.checked);
        if (selected.length === 0) return;

        // Optionally take header info from first selected item if form is empty
        const first = selected[0];

        const grouped = {};
        selected.forEach(it => {
            const key = `${(it.style_name || "").trim()}|${(it.style_color || "").trim()}`;
            const qty = parseFloat(it.balanced_qty || it.pending_qty || it.qty || 0);

            if (!grouped[key]) {
                grouped[key] = {
                    counts: it.counts || "",
                    fabric_name: it.fabric_name || "",
                    fabric_sku: it.fabric_sku || "",
                    style_name: it.style_name || "",
                    gsm: it.gsm || "",
                    dia: it.dia || "",
                    color: it.color || "",
                    fabric_color: it.color || "",
                    style_color: it.style_color || it.color || "",
                    qty: 0,
                    max_qty: 0,
                    sizes_data: it.sizes_data || {},
                    cut_pcs_wt: it.cut_pcs_wt || "",
                    waste_pcs_wt: it.waste_pcs_wt || ""
                };
            }
            grouped[key].qty += qty;
            grouped[key].max_qty += qty;
        });

        const newRows = Object.values(grouped).map(row => ({
            ...row,
            qty: row.qty.toFixed(3),
            max_qty: row.max_qty.toFixed(3)
        }));



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
        toast(`Successfully loaded ${selected.length} items from outward records.`, "success");
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

    const handleSizeQtyChange = (index, size, value) => {
        const rows = [...form.rows];
        const szData = { ...(rows[index].sizes_data || {}), [size]: value };
        const rowTotal = Object.values(szData).reduce((sum, v) => sum + (parseFloat(v) || 0), 0);

        if (form.process?.toLowerCase() !== "cutting" && rows[index].max_qty && rowTotal > parseFloat(rows[index].max_qty)) {
            toast(`Total KG cannot exceed loaded quantity (${rows[index].max_qty})`, "warning");
            return;
        }

        rows[index] = { ...rows[index], sizes_data: szData, qty: rowTotal };
        setForm(prev => ({ ...prev, rows }));
    };

    const handleRowChange = (index, e) => {

        const { name, value } = e.target;
        const rows = [...form.rows];
        if (form.process?.toLowerCase() !== "cutting" && name === "qty" && rows[index].max_qty && parseFloat(value) > parseFloat(rows[index].max_qty)) {
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
        rows[index] = {
            ...rows[index],
            fabric_name: fabric.fabric_name,
            fabric_sku: fabric.fabric_sku || "",
            gsm: fabric.gsm || rows[index].gsm,
            dia: fabric.dia || rows[index].dia,
            color: fabric.color || rows[index].color
        };
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
            const res = await axios.post(`${API}/fabric-to-pcs-inward`, {
                inward_type: "order", ...form,
                total_qty: totalQty, items: form.rows,
            });
            toast(`Saved! Inward No: ${res.data.inward_no}`, "success");
            setTimeout(() => navigate("/order-jobwork-fabric-to-pcs-inward-list"), 1500);
        } catch (err) {
            toast(err.response?.data?.error || "Failed to save. Please try again.", "danger");
        } finally { setSaving(false); }
    };

    return (
        <div className="container-fluid mt-3 mb-5 px-3 px-md-4">
            <Toast toasts={toasts} remove={remove} />

            <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom">
                <button className="btn btn-outline-secondary btn-sm rounded-pill px-3" onClick={() => navigate("/order-jobwork-fabric-to-pcs-inward-list")}>
                    <i className="bi bi-arrow-left me-1"></i>Back
                </button>
                <div>
                    <div className="d-flex align-items-center gap-2">
                        <span className="badge bg-dark rounded-pill px-3" style={{ fontSize: "0.7rem", letterSpacing: "0.06em" }}>ORDER JOBWORKS</span>
                        <span className="badge bg-success-subtle text-success rounded-pill px-3" style={{ fontSize: "0.7rem" }}>{form.process} INWARD</span>
                    </div>
                    <h4 className="fw-bold mb-0 mt-1 text-dark">
                        <i className="bi bi-box-arrow-in-down-left me-2 text-success"></i>Fabric Inward
                    </h4>
                </div>
                <div className="ms-auto text-end">
                    <div className="fw-bold text-success fs-5">{inwardNo}</div>
                    <small className="text-muted">Inward No.</small>
                </div>
            </div>

            <div className="card border-0 shadow-sm rounded-4">
                <div className="card-body p-4">

                    <div className="row g-3 mb-3">
                        <div className="col-md-2">
                            <label className="form-label fw-semibold text-muted" style={{ fontSize: "0.8rem" }}>DATE</label>
                            <input type="date" className="form-control" name="inward_date" value={form.inward_date} onChange={handleHeader} />
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
                            <label className="form-label fw-semibold text-muted" style={{ fontSize: "0.8rem" }}>PROCESS</label>
                            <select className="form-select fw-semibold text-success" name="process" value={form.process}
                                onChange={handleHeader} style={{ fontSize: "0.82rem" }}
                                disabled={form.rows.some(r => r.fabric_name || r.qty)}>
                                <option value="">— Select —</option>
                                {processes.map((p, i) => (
                                    <option key={i} value={p.process_name}>{p.process_name}</option>
                                ))}
                            </select>
                        </div>

                        {form.process?.toLowerCase() === "cutting" && (
                            <div className="col-md-2">
                                <label className="form-label fw-semibold text-muted" style={{ fontSize: "0.8rem" }}>SIZE CHART</label>
                                <select className="form-select fw-bold text-success" name="size_chart_name" value={form.size_chart_name}
                                    onChange={handleHeader} disabled={!!form.order_no && !!form.size_chart_name}>
                                    <option value="">— Select —</option>
                                    {sizeCharts.map((c, i) => (
                                        <option key={i} value={c.chart_name}>{c.chart_name}</option>
                                    ))}
                                </select>

                            </div>
                        )}
                        <div className="col-md-1 d-flex align-items-end">
                            {form.order_no && (
                                <button className="btn btn-dark btn-sm rounded-3 w-100" onClick={handleLoadOutward} title="Load items from outward records">
                                    Load
                                </button>
                            )}
                        </div>
                        <div className="col-md-2">
                            <label className="form-label fw-semibold text-muted" style={{ fontSize: "0.8rem" }}>REF. / DC NO.</label>
                            <input type="text" className="form-control" name="ref_no" value={form.ref_no} onChange={handleHeader} placeholder="DC / Challan" />
                        </div>

                        <div className="col-md-2">
                            <label className="form-label fw-semibold text-muted" style={{ fontSize: "0.8rem" }}>TOTAL QTY ({form.process?.toLowerCase() === "cutting" ? "PCS" : "KG"})</label>
                            <input className="form-control fw-bold text-center bg-light" readOnly value={dispTotalQty} style={{ color: "#198754" }} />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label fw-semibold text-muted" style={{ fontSize: "0.8rem" }}>REMARKS</label>
                            <input type="text" className="form-control" name="remarks" value={form.remarks} onChange={handleHeader} placeholder="Optional remarks" />
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
                            <i className="bi bi-person-badge me-2 text-success fs-5"></i>
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
                        <h6 className="fw-bold mb-0 text-dark"><i className="bi bi-table me-2 text-success"></i>Inward Items</h6>
                        <button className="btn btn-success btn-sm rounded-pill px-3" onClick={addRow}>
                            <i className="bi bi-plus-lg me-1"></i>Add Row
                        </button>
                    </div>
                    {errors.rows && <div className="alert alert-warning py-1 px-3 small mb-2 rounded-3"><i className="bi bi-exclamation-triangle me-1"></i>{errors.rows}</div>}

                    <div className="table-responsive rounded-3 border" ref={fabricRef}>
                        <table className="table table-hover table-bordered align-middle mb-0">
                            <thead className="table-dark">
                                {form.process?.toLowerCase() === "cutting" && form.size_chart_name ? (
                                    <tr style={{ fontSize: "0.75rem" }}>
                                        <th style={{ width: "20%" }}>FABRIC NAME</th>
                                        <th style={{ width: "100px" }}>FABRIC CLR</th>
                                        <th style={{ width: "120px" }}>STYLE NAME</th>
                                        <th style={{ width: "100px" }}>STYLE CLR</th>

                                        {sizeCharts.find(c => c.chart_name === form.size_chart_name)?.size_values.split(", ").map((size, idx) => (
                                            <th key={idx} className="text-center px-1" style={{ minWidth: "60px" }}>{size}</th>
                                        ))}
                                        <th style={{ width: "100px" }}>CUT PCS WT</th>
                                        <th style={{ width: "100px" }}>WASTE WT</th>
                                        <th style={{ width: "100px" }} className="text-center text-primary fw-bold">TOTAL PCS</th>
                                        <th className="text-center" style={{ width: "50px" }}>DEL</th>
                                    </tr>

                                ) : (
                                    <tr>
                                        <th style={{ width: "15%" }}>COUNTS</th>
                                        <th style={{ width: "10%" }}>STYLE NAME</th>
                                        <th style={{ width: "15%" }}>FABRIC NAME</th>
                                        <th style={{ width: "13%" }}>COLOR</th>

                                        <th style={{ width: "10%" }}>GSM</th>
                                        <th style={{ width: "10%" }}>DIA</th>
                                        <th style={{ width: "12%" }}>QTY (KG)</th>
                                        <th className="text-center" style={{ width: "5%" }}>DEL</th>
                                    </tr>
                                )}
                            </thead>

                            <tbody>
                                {form.rows.map((row, idx) => {
                                    const selectedChart = sizeCharts.find(c => c.chart_name === form.size_chart_name);
                                    const sizes = selectedChart ? selectedChart.size_values.split(", ") : [];

                                    if (form.process?.toLowerCase() === "cutting" && form.size_chart_name) {
                                        return (
                                            <tr key={idx}>
                                                <td><input type="text" className="form-control form-control-sm" name="fabric_name" value={row.fabric_name} onChange={(e) => handleRowChange(idx, e)} placeholder="Fabric" /></td>
                                                <td><input type="text" className="form-control form-control-sm" name="fabric_color" value={row.fabric_color} onChange={(e) => handleRowChange(idx, e)} placeholder="Color" /></td>
                                                <td><input type="text" className="form-control form-control-sm" name="style_name" value={row.style_name} onChange={(e) => handleRowChange(idx, e)} placeholder="Style" /></td>
                                                <td>
                                                    <select className="form-select form-select-sm" name="style_color" value={row.style_color} onChange={(e) => handleRowChange(idx, e)}>
                                                        <option value="">— Color —</option>
                                                        {styleColors.map((c, i) => <option key={i} value={c}>{c}</option>)}
                                                    </select>
                                                </td>

                                                {sizes.map((size, sIdx) => (
                                                    <td key={sIdx} className="p-1">
                                                        <input type="number" className="form-control form-control-sm text-center p-0"
                                                            style={{ fontSize: "0.75rem", height: "auto" }}
                                                            value={row.sizes_data?.[size] || ""}
                                                            onChange={(e) => handleSizeQtyChange(idx, size, e.target.value)}
                                                            placeholder="0" min="0" />
                                                    </td>
                                                ))}
                                                <td><input type="number" className="form-control form-control-sm text-center" name="cut_pcs_wt" value={row.cut_pcs_wt} onChange={(e) => handleRowChange(idx, e)} placeholder="0.000" step="0.001" /></td>
                                                <td><input type="number" className="form-control form-control-sm text-center" name="waste_pcs_wt" value={row.waste_pcs_wt} onChange={(e) => handleRowChange(idx, e)} placeholder="0.000" step="0.001" /></td>
                                                <td className="text-center fw-bold text-success" style={{ backgroundColor: "#f8fff9" }}>{row.qty || 0}</td>
                                                <td className="text-center">
                                                    <button className="btn btn-sm btn-outline-danger border-0 p-0"
                                                        onClick={() => removeRow(idx)} disabled={form.rows.length === 1}>
                                                        <i className="bi bi-x-circle fs-5"></i>
                                                    </button>
                                                </td>
                                            </tr>

                                        );
                                    }

                                    return (
                                        <tr key={idx}>
                                            <td><input type="text" className="form-control form-control-sm" name="counts" value={row.counts} onChange={(e) => handleRowChange(idx, e)} placeholder="Counts" /></td>
                                            <td><input type="text" className="form-control form-control-sm" name="style_name" value={row.style_name} onChange={(e) => handleRowChange(idx, e)} placeholder="Style" /></td>
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
                                            <td>
                                                {form.process?.toLowerCase().includes("dyeing") || form.process?.toLowerCase() === "cutting" ? (
                                                    <select className="form-select form-select-sm" name="color" value={row.color} onChange={(e) => handleRowChange(idx, e)}>
                                                        <option value="">— Color —</option>
                                                        {styleColors.map((c, i) => <option key={i} value={c}>{c}</option>)}
                                                    </select>
                                                ) : (
                                                    <input type="text" className="form-control form-control-sm" name="color" value={row.color} onChange={(e) => handleRowChange(idx, e)} placeholder="Color" />
                                                )}
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
                                    );
                                })}

                            </tbody>
                            <tfoot>
                                <tr className="table-dark">
                                    <td colSpan={form.process?.toLowerCase() === "cutting" && form.size_chart_name ? 4 + (sizeCharts.find(c => c.chart_name === form.size_chart_name)?.size_values.split(", ").length || 0) + 2 : 6} className="text-end fw-bold">Total:</td>

                                    <td className="text-center fw-bold text-warning">{dispTotalQty} {form.process?.toLowerCase() === "cutting" ? "PCS" : "KG"}</td>
                                    <td></td>
                                </tr>
                            </tfoot>

                        </table>
                    </div>

                    <div className="mt-4 pt-3 border-top d-flex gap-2">
                        <button className="btn btn-success rounded-pill px-5 py-2 fw-bold" onClick={handleSave} disabled={saving}>
                            {saving ? <><span className="spinner-border spinner-border-sm me-2"></span>Saving...</> : <><i className="bi bi-cloud-arrow-up me-2"></i>Save Inward</>}
                        </button>
                        <button className="btn btn-outline-secondary rounded-pill px-4" onClick={() => navigate("/order-jobwork-fabric-to-pcs-inward-list")}>Cancel</button>
                    </div>
                </div>
            </div >

            {/* Modal for loading outward process items */}
            {
                showLoadModal && (
                    <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1060 }}>
                        <div className="modal-dialog modal-lg modal-dialog-centered">
                            <div className="modal-content border-0 shadow-lg rounded-4">
                                <div className="modal-header bg-dark text-white border-0 py-3 px-4">
                                    <h5 className="modal-title fw-bold">Select Items from Outward Records</h5>
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
                                                    <th>Style / Color</th>
                                                    <th>GSM/DIA</th>
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
                                                        <td><span className="badge bg-light text-dark border small">{item.process}</span></td>
                                                        <td className="fw-semibold small">{item.fabric_name}</td>
                                                        <td className="small">{item.style_name} / {item.style_color || item.color}</td>
                                                        <td className="small text-muted">{item.gsm}/{item.dia}</td>
                                                        <td className="text-end fw-bold text-success">{parseFloat(item.balanced_qty || 0).toFixed(3)}</td>

                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    {(!loadableItems || loadableItems.length === 0) && <div className="p-5 text-center text-muted">No items found in outward records.</div>}
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
                )
            }
        </div >
    );
}
