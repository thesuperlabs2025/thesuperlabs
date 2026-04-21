import React, { useState, useEffect, useRef, useCallback } from "react";
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

const initialRow = () => ({ yarn_name: "", counts: "", color: "", fabric_name: "", gsm: "", dia: "", qty: "", yarn_sku: "", gsm_list: [], dia_list: [] });
const today = new Date().toISOString().substring(0, 10);
const getForm = () => ({
    outward_date: today,
    order_no: "", order_name: "",
    party_name: "",
    ship_to: "",
    process: "Yarn Dyeing",
    ref_no: "",
    staff_name: "",
    staff_remarks: "",
    remarks: "",
    rows: [initialRow()]
});

export default function OrderJobworkYarnToFabricOutward() {
    const navigate = useNavigate();
    const { toasts, add: toast, remove } = useToast();
    const [form, setForm] = useState(getForm());
    const [outwardNo, setOutwardNo] = useState("Loading...");
    const [saving, setSaving] = useState(false);
    const [orders, setOrders] = useState([]);
    const [employees, setEmployees] = useState([]);
    // validation
    const [errors, setErrors] = useState({});
    const selectedYear = JSON.parse(localStorage.getItem("selectedYear") || "{}");

    // Yarn autocomplete
    const [yarnSuggestions, setYarnSuggestions] = useState([]);
    const [activeRowIdx, setActiveRowIdx] = useState(null);
    const [yarnSuggIdx, setYarnSuggIdx] = useState(-1);
    const yarnRef = useRef(null);

    // Fabric autocomplete
    const [fabricSuggestions, setFabricSuggestions] = useState([]);
    const [activeFabricRowIdx, setActiveFabricRowIdx] = useState(null);
    const [fabricSuggIdx, setFabricSuggIdx] = useState(-1);
    const fabricRef = useRef(null);

    // Supplier autocomplete
    const [supplierSuggestions, setSupplierSuggestions] = useState([]);
    const [supplierSuggIdx, setSupplierSuggIdx] = useState(-1);
    const supplierRef = useRef(null);

    // Ship to autocomplete
    const [shipToSuggestions, setShipToSuggestions] = useState([]);
    const [shipToSuggestionIndex, setShipToSuggestionIndex] = useState(-1);
    const shipToRef = useRef(null);

    // Load PO modal (Knitting)
    const [showLoadPOModal, setShowLoadPOModal] = useState(false);
    const [loadPOLines, setLoadPOLines] = useState([]);
    const [loadPOLoading, setLoadPOLoading] = useState(false);
    const [selectedLoadIndices, setSelectedLoadIndices] = useState(new Set());

    const fetchInitial = useCallback(async () => {
        try {
            const [noRes, orderRes, empRes] = await Promise.all([
                axios.get(`${API}/yarn-dyeing-outward/next-no/order`),
                axios.get(`${API}/yarn-dyeing-outward/orders`),
                axios.get(`${API}/employees`)
            ]);
            setOutwardNo(noRes.data.outward_no);
            setOrders(orderRes.data || []);
            setEmployees(empRes.data || []);
        } catch {
            setOutwardNo("YDO-OUT-0001");
        }
    }, []);

    useEffect(() => {
        fetchInitial();
        const handler = (e) => {
            if (yarnRef.current && !yarnRef.current.contains(e.target)) { setYarnSuggestions([]); setActiveRowIdx(null); }
            if (fabricRef.current && !fabricRef.current.contains(e.target)) { setFabricSuggestions([]); setActiveFabricRowIdx(null); }
            if (supplierRef.current && !supplierRef.current.contains(e.target)) setSupplierSuggestions([]);
            if (shipToRef.current && !shipToRef.current.contains(e.target)) { setShipToSuggestions([]); setShipToSuggestionIndex(-1); }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [fetchInitial]);

    const handleOrderSelect = (e) => {
        const val = e.target.value;
        const found = orders.find(o => o.order_no === val);
        setForm(prev => ({ ...prev, order_no: val, order_name: found ? (found.order_name || "") : "" }));
        setErrors(prev => ({ ...prev, order_no: "" }));
    };

    const handleHeader = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
    };

    // Supplier autocomplete
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

    // Yarn per row
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
        if (name === "yarn_name") {
            setActiveRowIdx(index); setYarnSuggIdx(-1);
            if (value.length >= 1) {
                axios.get(`${API}/yarn-dyeing-outward/yarn-search?term=${encodeURIComponent(value)}`)
                    .then(r => setYarnSuggestions(r.data)).catch(() => setYarnSuggestions([]));
            } else setYarnSuggestions([]);
        }
        if (name === "fabric_name") {
            setActiveFabricRowIdx(index); setFabricSuggIdx(-1);
            const row = form.rows[index];
            if (row.yarn_sku && form.order_no) {
                axios.get(`${API}/order-planning-v2/fabrics-for-yarn?order_no=${encodeURIComponent(form.order_no)}&yarn_sku=${encodeURIComponent(row.yarn_sku)}`)
                    .then(r => {
                        const list = (r.data.fabrics || []).map(f => ({ fabric_name: typeof f === "string" ? f : f.fabric_name }));
                        setFabricSuggestions(value.length >= 1 ? list.filter(f => f.fabric_name.toLowerCase().includes(value.toLowerCase())) : list);
                    })
                    .catch(() => setFabricSuggestions([]));
            } else if (value.length >= 1) {
                axios.get(`${API}/fabrics?term=${encodeURIComponent(value)}`)
                    .then(r => setFabricSuggestions(r.data.filter(f => f.fabric_name && f.fabric_name.toLowerCase().includes(value.toLowerCase())))).catch(() => setFabricSuggestions([]));
            } else setFabricSuggestions([]);
        }
    };

    const selectYarn = (index, yarn) => {
        const rows = [...form.rows];
        rows[index] = { ...rows[index], yarn_name: yarn.yarn_name, counts: yarn.counts || rows[index].counts, color: yarn.color || rows[index].color };
        setForm(prev => ({ ...prev, rows }));
        setYarnSuggestions([]); setActiveRowIdx(null);
    };

    const handleYarnKeyDown = (e, index) => {
        if (!yarnSuggestions.length || activeRowIdx !== index) return;
        if (e.key === "ArrowDown") { e.preventDefault(); setYarnSuggIdx(p => Math.min(p + 1, yarnSuggestions.length - 1)); }
        else if (e.key === "ArrowUp") { e.preventDefault(); setYarnSuggIdx(p => Math.max(p - 1, -1)); }
        else if (e.key === "Enter" && yarnSuggIdx >= 0) { e.preventDefault(); selectYarn(index, yarnSuggestions[yarnSuggIdx]); }
        else if (e.key === "Escape") { setYarnSuggestions([]); setActiveRowIdx(null); }
    };

    const selectFabric = (index, fabric) => {
        const name = fabric.fabric_name || (typeof fabric === "string" ? fabric : "");
        const rows = [...form.rows];
        rows[index] = { ...rows[index], fabric_name: name };
        setForm(prev => ({ ...prev, rows }));
        setFabricSuggestions([]); setActiveFabricRowIdx(null);
        if (name && form.order_no) {
            axios.get(`${API}/order-planning-v2/fabric-gsm-dia?order_no=${encodeURIComponent(form.order_no)}&fabric_name=${encodeURIComponent(name)}`)
                .then(r => {
                    setForm(prev => {
                        const rows2 = [...prev.rows];
                        rows2[index] = { ...rows2[index], fabric_name: name, gsm_list: r.data.gsm_list || [], dia_list: r.data.dia_list || [] };
                        return { ...prev, rows: rows2 };
                    });
                })
                .catch(() => { });
        }
    };

    const handleFabricKeyDown = (e, index) => {
        if (!fabricSuggestions.length || activeFabricRowIdx !== index) return;
        if (e.key === "ArrowDown") { e.preventDefault(); setFabricSuggIdx(p => Math.min(p + 1, fabricSuggestions.length - 1)); }
        else if (e.key === "ArrowUp") { e.preventDefault(); setFabricSuggIdx(p => Math.max(p - 1, -1)); }
        else if (e.key === "Enter" && fabricSuggIdx >= 0) { e.preventDefault(); selectFabric(index, fabricSuggestions[fabricSuggIdx]); }
        else if (e.key === "Escape") { setFabricSuggestions([]); setActiveFabricRowIdx(null); }
    };

    const addRow = () => setForm(prev => ({ ...prev, rows: [...prev.rows, initialRow()] }));
    const removeRow = (i) => {
        if (form.rows.length === 1) return;
        setForm(prev => ({ ...prev, rows: prev.rows.filter((_, idx) => idx !== i) }));
    };

    const openLoadPOModal = async () => {
        if (!form.order_no) {
            toast("Please select an Order No. first.", "warning");
            return;
        }
        setShowLoadPOModal(true);
        setLoadPOLoading(true);
        setLoadPOLines([]);
        setSelectedLoadIndices(new Set());
        try {
            const res = await axios.get(`${API}/yarn-dyeing-outward/order-yarn-po-grn?order_no=${encodeURIComponent(form.order_no)}`);
            const filtered = (res.data.lines || []).filter(l => {
                const bQty = parseFloat(l.pending_qty != null ? l.pending_qty : (l.grn_qty != null ? l.grn_qty : 0));
                return bQty > 0;
            });
            if (filtered.length > 0) {
                setLoadPOLines(filtered);
            } else {
                toast("All quantities from GRN have already been processed.", "info");
                setShowLoadPOModal(false);
            }
        } catch (err) {
            toast(err.response?.data?.error || "Failed to load PO/GRN data", "danger");
            setLoadPOLines([]);
        } finally {
            setLoadPOLoading(false);
        }
    };

    const toggleLoadLine = (idx) => {
        setSelectedLoadIndices(prev => {
            const next = new Set(prev);
            if (next.has(idx)) next.delete(idx); else next.add(idx);
            return next;
        });
    };

    const applyLoadPO = () => {
        const lines = loadPOLines.filter((_, i) => selectedLoadIndices.has(i));
        if (lines.length === 0) {
            toast("Select at least one row to load.", "warning");
            return;
        }

        // Grouping selected lines by (yarn_sku/yarn_name + counts + color)
        const groupedMap = {};
        lines.forEach(l => {
            const key = `${l.yarn_sku || l.yarn_name || ""}|${l.counts || ""}|${l.color || ""}`;
            const qty = parseFloat(l.pending_qty != null ? l.pending_qty : (l.grn_qty != null ? l.grn_qty : 0));

            if (!groupedMap[key]) {
                groupedMap[key] = {
                    yarn_name: l.yarn_sku || l.yarn_name || "",
                    yarn_sku: l.yarn_sku || "",
                    counts: l.counts || "",
                    color: l.color || "",
                    fabric_name: "",
                    gsm: "",
                    dia: "",
                    qty: 0,
                    max_qty: 0,
                    gsm_list: [],
                    dia_list: []
                };
            }
            groupedMap[key].qty += qty;
            groupedMap[key].max_qty += qty;
        });

        const newRows = Object.values(groupedMap);

        setForm(prev => {
            // Remove initial empty row if it's the only one and has no yarn_name or qty
            let existing = prev.rows;
            if (existing.length === 1 && !existing[0].yarn_name && !existing[0].qty) {
                existing = [];
            }
            return { ...prev, rows: [...existing, ...newRows] };
        });

        setShowLoadPOModal(false);
        setLoadPOLines([]);
        setSelectedLoadIndices(new Set());
        toast(`Loaded and grouped ${newRows.length} item(s) from GRN.`, "success");
    };

    const totalQty = form.rows.reduce((s, r) => s + (parseFloat(r.qty) || 0), 0);
    const dispTotal = totalQty.toFixed(3);

    const validate = () => {
        const e = {};
        if (!form.order_no) e.order_no = "Order No. is required";
        if (!form.party_name.trim()) e.party_name = "Party / Supplier is required";
        if (form.rows.some(r => !r.yarn_name.trim())) e.rows = "All rows must have a Name";
        if (form.process === "Knitting" && form.rows.some(r => !r.fabric_name.trim())) e.rows = (e.rows ? e.rows + " and " : "") + "Fabric Name is required";
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
            const res = await axios.post(`${API}/yarn-dyeing-outward`, {
                outward_type: "order", ...form,
                total_qty: totalQty, items: form.rows,
                year_id: selectedYear.year_id
            });
            toast(`Saved! Outward No: ${res.data.outward_no}`, "success");
            setTimeout(() => navigate("/order-jobwork-yarn-to-fabric-list"), 1500);
        } catch (err) {
            toast(err.response?.data?.error || "Failed to save. Please try again.", "danger");
        } finally { setSaving(false); }
    };

    return (
        <div className="container-fluid mt-2 mb-3 px-2 px-md-3">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
                
                :root {
                    --erp-font-main: 'Inter', -apple-system, sans-serif;
                }

                .container-fluid {
                    font-family: var(--erp-font-main) !important;
                }

                .form-label {
                    font-size: 0.8rem !important;
                    letter-spacing: 0.02em;
                    margin-bottom: 0.4rem;
                    color: #475467 !important;
                }

                .form-control, .form-select {
                    font-size: 0.95rem !important;
                    padding: 0.6rem 0.85rem;
                    border-radius: 8px;
                    border: 1px solid #d0d5dd;
                    transition: all 0.2s ease;
                }

                .form-control:focus, .form-select:focus {
                    border-color: #0d6efd;
                    box-shadow: 0 0 0 4px rgba(13, 110, 253, 0.1);
                }

                .card {
                    border: 1px solid #eaecf0 !important;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.03) !important;
                }

                .table thead th {
                    background-color: #101828 !important;
                    color: white !important;
                    font-weight: 600;
                    text-transform: uppercase;
                    font-size: 0.75rem;
                    letter-spacing: 0.05em;
                    padding: 14px 10px;
                }

                .table tbody td {
                    padding: 10px;
                    font-size: 0.9rem;
                    vertical-align: middle;
                }

                .badge {
                    font-weight: 600;
                    padding: 6px 12px !important;
                }

                .process-select-prominent {
                    background-color: #f9fafb !important;
                    font-weight: 700 !important;
                    color: #0d6efd !important;
                    border: 2px solid #0d6efd !important;
                }

                .btn-save-premium {
                    background: #0d6efd;
                    border: none;
                    box-shadow: 0 4px 12px rgba(13, 110, 253, 0.25);
                    transition: all 0.3s;
                }

                .btn-save-premium:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 6px 16px rgba(13, 110, 253, 0.35);
                }
            `}</style>

            <Toast toasts={toasts} remove={remove} />

            {/* Page header */}
            <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom">
                <button className="btn btn-outline-secondary btn-sm rounded-pill px-3 py-1 fw-bold" onClick={() => navigate("/order-jobwork-yarn-to-fabric-list")}>
                    <i className="bi bi-arrow-left me-1"></i>Back
                </button>
                <div className="d-flex align-items-center gap-4">
                    <div>
                        <div className="d-flex align-items-center gap-2 mb-1">
                            <span className="badge bg-dark rounded-pill">ORDER JOBWORKS</span>
                            <span className="badge bg-primary-subtle text-primary rounded-pill">OUTWARD</span>
                        </div>
                        <h4 className="fw-extrabold mb-0 text-dark" style={{ letterSpacing: "-0.02em" }}>
                            <i className="bi bi-box-arrow-up-right me-2 text-primary"></i>Yarn to Fabric Outward
                        </h4>
                    </div>
                    <div className="vr" style={{ height: '40px', opacity: 0.2 }}></div>
                    <div>
                        <span className="x-small text-uppercase opacity-75 fw-bold d-block mb-1">Accounting Year</span>
                        <h5 className="fw-bold mb-0">AY {selectedYear.year_name}</h5>
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
                <div className="ms-auto text-end bg-light p-2 px-3 rounded-4 border">
                    <div className="fw-bold text-primary fs-5">{outwardNo}</div>
                    <small className="text-muted fw-bold">System Ref No.</small>
                </div>
            </div>

            <div className="card border-0 shadow-sm rounded-4">
                <div className="card-body p-4">

                    {/* Row 1 */}
                    <div className="row g-3 mb-3">
                        <div className="col-md-2">
                            <label className="form-label fw-bold fw-semibold text-muted">OUTWARD DATE</label>
                            <input type="date" className="form-control fw-semibold" name="outward_date" value={form.outward_date} onChange={handleHeader} />
                        </div>
                        <div className="col-md-2">
                            <label className="form-label fw-bold fw-semibold text-muted">ORDER NO <span className="text-danger">*</span></label>
                            <select className={`form-select fw-bold ${errors.order_no ? "is-invalid" : ""}`} name="order_no" value={form.order_no} onChange={handleOrderSelect}>
                                <option value="">— Select —</option>
                                {orders.map(o => <option key={o.id} value={o.order_no}>{o.order_no}</option>)}
                            </select>
                            {errors.order_no && <div className="invalid-feedback">{errors.order_no}</div>}
                        </div>
                        <div className="col-md-2">
                            <label className="form-label fw-bold fw-semibold text-muted">ORDER NAME</label>
                            <input type="text" className="form-control bg-light fw-semibold" name="order_name" value={form.order_name}
                                readOnly={!!form.order_no} onChange={handleHeader} placeholder="Auto-filled" />
                        </div>
                        <div className="col-md-2">
                            <label className="form-label fw-bold fw-semibold text-muted text-primary">CURRENT PROCESS</label>
                            <select className="form-select process-select-prominent" name="process" value={form.process} onChange={handleHeader}>
                                <option value="Yarn Dyeing">Yarn Dyeing</option>
                                <option value="Knitting">Knitting</option>
                            </select>
                        </div>
                        <div className="col-md-2">
                            <label className="form-label fw-bold fw-semibold text-muted">REF. / DC NO.</label>
                            <input type="text" className="form-control" name="ref_no" value={form.ref_no} onChange={handleHeader} placeholder="DC / Challan" />
                        </div>
                        <div className="col-md-2">
                            <label className="form-label fw-bold fw-semibold text-muted">TOTAL QTY (KG)</label>
                            <input className="form-control fw-bold fs-5 text-center bg-light" readOnly value={dispTotal} style={{ color: "#0d6efd" }} />
                        </div>
                    </div>

                    {/* Row 2: Party + Ship To + Remarks */}
                    <div className="row g-2 mb-3">
                        <div className="col-md-4 position-relative" ref={supplierRef}>
                            <label className="form-label fw-semibold text-muted" style={{ fontSize: "0.75rem" }}>PARTY NAME (SUPPLIER) <span className="text-danger">*</span></label>
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
                            <label className="form-label fw-semibold text-muted" style={{ fontSize: "0.75rem" }}>SHIP TO</label>
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
                            <label className="form-label fw-semibold text-muted" style={{ fontSize: "0.75rem" }}>REMARKS</label>
                            <input type="text" className="form-control" name="remarks" value={form.remarks} onChange={handleHeader} placeholder="Optional remarks" />
                        </div>
                    </div>

                    {/* Staff Section */}
                    <div className="card bg-light border-0 rounded-3 mb-3 p-2">
                        <div className="d-flex align-items-center mb-2">
                            <i className="bi bi-person-badge me-2 text-primary fs-5"></i>
                            <h6 className="fw-bold mb-0 text-dark">Staff Details</h6>
                        </div>
                        <div className="row g-2">
                            <div className="col-md-4">
                                <label className="form-label fw-semibold text-muted" style={{ fontSize: "0.75rem" }}>STAFF NAME</label>
                                <select className="form-select" name="staff_name" value={form.staff_name} onChange={handleHeader}>
                                    <option value="">— Select Staff —</option>
                                    {employees.map((emp, i) => <option key={i} value={emp.employee_name}>{emp.employee_name}</option>)}
                                </select>
                            </div>
                            <div className="col-md-8">
                                <label className="form-label fw-semibold text-muted" style={{ fontSize: "0.75rem" }}>STAFF REMARKS</label>
                                <textarea className="form-control" name="staff_remarks" rows="1" value={form.staff_remarks}
                                    onChange={handleHeader} placeholder="Enter staff remarks or instructions..." />
                            </div>
                        </div>
                    </div>

                    {/* Yarn Items Table */}
                    <div className="d-flex justify-content-between align-items-center mb-1">
                        <h6 className="fw-bold mb-0 text-dark"><i className="bi bi-table me-2 text-primary"></i>Yarn Items</h6>
                        <div className="d-flex gap-2">
                            {form.process === "Knitting" && (
                                <button type="button" className="btn btn-outline-primary btn-sm rounded-pill px-2" onClick={openLoadPOModal} disabled={!form.order_no}>
                                    <i className="bi bi-cloud-download me-1"></i>Load PO
                                </button>
                            )}
                            <button className="btn btn-primary btn-sm rounded-pill px-2" onClick={addRow}>
                                <i className="bi bi-plus-lg me-1"></i>Add Row
                            </button>
                        </div>
                    </div>
                    {errors.rows && <div className="alert alert-warning py-1 px-2 small mb-1 rounded-2"><i className="bi bi-exclamation-triangle me-1"></i>{errors.rows}</div>}

                    <div className="table-responsive rounded-2 border" ref={yarnRef}>
                        <table className="table table-hover table-bordered align-middle mb-0" style={{ fontSize: "0.85rem" }}>
                            <thead className="table-dark">
                                <tr>
                                    <th style={{ width: "22%" }}>YARN NAME</th>
                                    <th style={{ width: "10%" }}>COUNTS</th>
                                    <th style={{ width: "10%" }}>COLOR</th>
                                    {form.process === "Knitting" && (
                                        <>
                                            <th style={{ width: "18%" }}>FABRIC NAME</th>
                                            <th style={{ width: "8%" }}>GSM</th>
                                            <th style={{ width: "8%" }}>DIA</th>
                                        </>
                                    )}
                                    <th style={{ width: "12%" }}>QTY (KG)</th>
                                    <th className="text-center" style={{ width: "5%" }}>DEL</th>
                                </tr>
                            </thead>
                            <tbody>
                                {form.rows.map((row, idx) => (
                                    <tr key={idx}>
                                        <td className="position-relative">
                                            <input type="text" className="form-control form-control-sm"
                                                name="yarn_name" value={row.yarn_name}
                                                onChange={(e) => handleRowChange(idx, e)}
                                                onKeyDown={(e) => handleYarnKeyDown(e, idx)}
                                                placeholder="Search yarn..." autoComplete="off" />
                                            {activeRowIdx === idx && yarnSuggestions.length > 0 && (
                                                <ul className="list-group position-absolute w-100 shadow-lg" style={{ zIndex: 1050, top: "100%", maxHeight: 200, overflowY: "auto" }}>
                                                    {yarnSuggestions.map((y, i) => (
                                                        <li key={y.id}
                                                            className={`list-group-item list-group-item-action py-1 px-2 small ${yarnSuggIdx === i ? "active" : ""}`}
                                                            style={{ cursor: "pointer" }}
                                                            onMouseDown={() => selectYarn(idx, y)}>
                                                            <strong>{y.yarn_name}</strong>
                                                            {y.counts && <span className="text-muted ms-1">· {y.counts}</span>}
                                                            {y.color && <span className="badge bg-secondary ms-1 rounded-pill" style={{ fontSize: "0.65rem" }}>{y.color}</span>}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </td>
                                        <td><input type="text" className="form-control form-control-sm" name="counts" value={row.counts} onChange={(e) => handleRowChange(idx, e)} placeholder="30/1" /></td>
                                        <td><input type="text" className="form-control form-control-sm" name="color" value={row.color} onChange={(e) => handleRowChange(idx, e)} placeholder="Color" /></td>

                                        {form.process === "Knitting" && (
                                            <>
                                                <td className="position-relative" ref={fabricRef}>
                                                    <input type="text" className="form-control form-control-sm"
                                                        name="fabric_name" value={row.fabric_name}
                                                        onChange={(e) => handleRowChange(idx, e)}
                                                        onFocus={() => {
                                                            if (row.yarn_sku && form.order_no) {
                                                                setActiveFabricRowIdx(idx);
                                                                setFabricSuggIdx(-1);
                                                                axios.get(`${API}/order-planning-v2/fabrics-for-yarn?order_no=${encodeURIComponent(form.order_no)}&yarn_sku=${encodeURIComponent(row.yarn_sku)}`)
                                                                    .then(r => setFabricSuggestions((r.data.fabrics || []).map(f => ({ fabric_name: typeof f === "string" ? f : f.fabric_name }))))
                                                                    .catch(() => setFabricSuggestions([]));
                                                            }
                                                        }}
                                                        onBlur={() => {
                                                            if (row.fabric_name?.trim() && form.order_no) {
                                                                const fname = row.fabric_name.trim();
                                                                axios.get(`${API}/order-planning-v2/fabric-gsm-dia?order_no=${encodeURIComponent(form.order_no)}&fabric_name=${encodeURIComponent(fname)}`)
                                                                    .then(r => {
                                                                        setForm(prev => {
                                                                            const rows2 = [...prev.rows];
                                                                            rows2[idx] = { ...rows2[idx], gsm_list: r.data.gsm_list || [], dia_list: r.data.dia_list || [] };
                                                                            return { ...prev, rows: rows2 };
                                                                        });
                                                                    })
                                                                    .catch(() => { });
                                                            }
                                                        }}
                                                        onKeyDown={(e) => handleFabricKeyDown(e, idx)}
                                                        placeholder={row.yarn_sku ? "Select or type fabric..." : "Search fabric..."} autoComplete="off" />
                                                    {activeFabricRowIdx === idx && fabricSuggestions.length > 0 && (
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
                                                    {(row.gsm_list?.length > 0) ? (
                                                        <select className="form-select form-select-sm" name="gsm" value={row.gsm || ""} onChange={(e) => handleRowChange(idx, e)}>
                                                            <option value="">— Select —</option>
                                                            {row.gsm_list.map((g, i) => <option key={i} value={g}>{g}</option>)}
                                                        </select>
                                                    ) : (
                                                        <input type="text" className="form-control form-control-sm text-center" name="gsm" value={row.gsm} onChange={(e) => handleRowChange(idx, e)} placeholder="GSM" />
                                                    )}
                                                </td>
                                                <td>
                                                    {(row.dia_list?.length > 0) ? (
                                                        <select className="form-select form-select-sm" name="dia" value={row.dia || ""} onChange={(e) => handleRowChange(idx, e)}>
                                                            <option value="">— Select —</option>
                                                            {row.dia_list.map((d, i) => <option key={i} value={d}>{d}</option>)}
                                                        </select>
                                                    ) : (
                                                        <input type="text" className="form-control form-control-sm text-center" name="dia" value={row.dia} onChange={(e) => handleRowChange(idx, e)} placeholder="DIA" />
                                                    )}
                                                </td>
                                            </>
                                        )}

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
                                    <td colSpan={form.process === "Knitting" ? 6 : 3} className="text-end fw-bold">Total Qty (KG):</td>
                                    <td className="text-center fw-bold text-warning">{dispTotal}</td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    <button className="btn btn-outline-primary btn-sm rounded-pill w-100 mt-2 mb-4" style={{ borderStyle: "dashed" }} onClick={addRow}>
                        <i className="bi bi-plus-circle me-2"></i>Add Another Row
                    </button>

                    <div className="d-flex justify-content-end gap-2 pt-3 border-top">
                        <button className="btn btn-light rounded-pill px-4" onClick={() => { setForm(getForm()); setErrors({}); }}>
                            <i className="bi bi-arrow-counterclockwise me-1"></i>Reset
                        </button>
                        <button className="btn btn-secondary rounded-pill px-4" onClick={() => navigate("/order-jobwork-yarn-to-fabric-list")}>
                            <i className="bi bi-x-lg me-1"></i>Cancel
                        </button>
                        {selectedYear.is_closed ? (
                            <div className="alert alert-danger mb-0 py-2 px-4 fw-bold shadow-sm" style={{ borderRadius: '50px' }}>
                                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                Year Locked
                            </div>
                        ) : (
                            <button className="btn btn-primary rounded-pill px-5 fw-semibold" onClick={handleSave} disabled={saving}>
                                {saving ? <><span className="spinner-border spinner-border-sm me-2" />Saving...</> : <><i className="bi bi-check2-circle me-2"></i>Save Outward</>}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Load PO Modal (Knitting) */}
            {showLoadPOModal && (
                <div className="modal d-block bg-dark bg-opacity-50" tabIndex={-1} style={{ zIndex: 1050 }}>
                    <div className="modal-dialog modal-lg modal-dialog-scrollable">
                        <div className="modal-content rounded-4 shadow">
                            <div className="modal-header border-0 pb-0">
                                <h5 className="modal-title fw-bold">Load Yarn PO / GRN for Order</h5>
                                <button type="button" className="btn-close" onClick={() => { setShowLoadPOModal(false); setLoadPOLines([]); }} />
                            </div>
                            <div className="modal-body pt-2">
                                {loadPOLoading ? (
                                    <div className="text-center py-5"><span className="spinner-border text-primary" /> Loading...</div>
                                ) : loadPOLines.length === 0 ? (
                                    <p className="text-muted mb-0">No yarn GRN lines found for this order. Create yarn PO and GRN for this order first.</p>
                                ) : (
                                    <>
                                        <p className="small text-muted mb-2">Select rows to load. Yarn SKU will fill Yarn Name, GRN qty will fill Qty. Fabric Name will show order-assigned fabrics per yarn.</p>
                                        <div className="table-responsive">
                                            <table className="table table-sm table-hover align-middle mb-0">
                                                <thead className="table-dark">
                                                    <tr>
                                                        <th style={{ width: 40 }}><input type="checkbox" checked={selectedLoadIndices.size === loadPOLines.length} onChange={() => selectedLoadIndices.size === loadPOLines.length ? setSelectedLoadIndices(new Set()) : setSelectedLoadIndices(new Set(loadPOLines.map((_, i) => i)))} /></th>
                                                        <th>PO No</th>
                                                        <th>GRN No</th>
                                                        <th>Yarn SKU</th>
                                                        <th>Counts</th>
                                                        <th>Color</th>
                                                        <th className="text-end">PO Qty</th>
                                                        <th className="text-end">GRN Qty</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {loadPOLines.map((line, idx) => (
                                                        <tr key={idx}>
                                                            <td><input type="checkbox" checked={selectedLoadIndices.has(idx)} onChange={() => toggleLoadLine(idx)} /></td>
                                                            <td>{line.po_no || "—"}</td>
                                                            <td>{line.grn_no || "—"}</td>
                                                            <td>{line.yarn_sku || "—"}</td>
                                                            <td>{line.counts || "—"}</td>
                                                            <td>{line.color || "—"}</td>
                                                            <td className="text-end">{line.po_qty != null ? Number(line.po_qty).toFixed(3) : "—"}</td>
                                                            <td className="text-end fw-semibold">{line.grn_qty != null ? Number(line.grn_qty).toFixed(3) : "—"}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </>
                                )}
                            </div>
                            {!loadPOLoading && loadPOLines.length > 0 && (
                                <div className="modal-footer border-0 pt-0">
                                    <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={() => { setShowLoadPOModal(false); setLoadPOLines([]); }}>Cancel</button>
                                    <button type="button" className="btn btn-primary rounded-pill px-4" onClick={applyLoadPO}>
                                        <i className="bi bi-check2-circle me-1"></i>Load
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
