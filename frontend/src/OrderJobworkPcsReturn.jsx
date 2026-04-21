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

const initialRow = () => ({ item_name: "", color: "", size: "", pcs: "", sizes_data: {}, contractor_name: "" });

const today = new Date().toISOString().substring(0, 10);
const getForm = () => ({
    return_date: today,
    order_no: "", order_name: "",
    party_name: "",
    ship_to: "",
    process: "",
    previous_process: "",
    size_chart_name: "",
    ref_no: "",
    work_type: "Jobwork",

    staff_name: "",
    staff_remarks: "",
    remarks: "",
    rows: [initialRow()]
});

export default function OrderJobworkPcsReturn() {
    const navigate = useNavigate();
    const { toasts, add: toast, remove } = useToast();
    const [form, setForm] = useState(getForm());
    const [returnNo, setReturnNo] = useState("Loading...");
    const [saving, setSaving] = useState(false);
    const [orders, setOrders] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [processes, setProcesses] = useState([]);
    const [errors, setErrors] = useState({});
    const [lifecycle, setLifecycle] = useState([]);
    const [sizeCharts, setSizeCharts] = useState([]);

    // Modal for Loading Inward Data

    const [showLoadModal, setShowLoadModal] = useState(false);
    const [loadableItems, setLoadableItems] = useState([]);


    // Item autocomplete
    const [itemSuggestions, setItemSuggestions] = useState([]);
    const [activeRowIdx, setActiveRowIdx] = useState(null);
    const [itemSuggIdx, setItemSuggIdx] = useState(-1);
    const itemRef = useRef(null);

    // Supplier autocomplete
    const [supplierSuggestions, setSupplierSuggestions] = useState([]);
    const [supplierSuggIdx, setSupplierSuggIdx] = useState(-1);
    const supplierRef = useRef(null);

    // Ship to autocomplete
    const [shipToSuggestions, setShipToSuggestions] = useState([]);
    const [shipToSuggestionIndex, setShipToSuggestionIndex] = useState(-1);
    const shipToRef = useRef(null);

    // Contractor autocomplete
    const [contractors, setContractors] = useState([]);
    const [contractorSuggestions, setContractorSuggestions] = useState([]);
    const [contractorSuggIdx, setContractorSuggIdx] = useState(-1);
    const [activeContractorRowIdx, setActiveContractorRowIdx] = useState(null);
    const contractorRef = useRef(null);



    const fetchInitial = useCallback(async () => {
        try {
            const [noRes, orderRes, empRes, procRes, chartRes, contractRes] = await Promise.all([
                axios.get(`${API}/pcs-return/next-no/order`),
                axios.get(`${API}/yarn-dyeing-outward/orders`),
                axios.get(`${API}/employees`),
                axios.get(`${API}/life-cycles`),
                axios.get(`${API}/size-charts`),
                axios.get(`${API}/contractor`)
            ]);
            setReturnNo(noRes.data.return_no);
            setOrders(orderRes.data || []);
            setEmployees(empRes.data || []);
            setLifecycle(procRes.data || []);
            setSizeCharts(chartRes.data || []);
            setContractors(contractRes.data || []);
            // Filter processes: Type 'pcs' but exclude 'cutting'
            setProcesses((procRes.data || []).filter(p => p.process_type?.toLowerCase() === "pcs" && p.process_name?.toLowerCase() !== "cutting"));

        } catch (err) {
            console.error("fetchInitial error:", err);
            setReturnNo("PCS-RET-0001");
        }
    }, []);

    const handleMousedown = useCallback((e) => {
        if (activeRowIdx !== null && itemRef.current && !itemRef.current.contains(e.target)) { setItemSuggestions([]); setActiveRowIdx(null); }
        if (supplierRef.current && !supplierRef.current.contains(e.target)) setSupplierSuggestions([]);
        if (shipToRef.current && !shipToRef.current.contains(e.target)) { setShipToSuggestions([]); setShipToSuggestionIndex(-1); }
        if (activeContractorRowIdx !== null && contractorRef.current && !contractorRef.current.contains(e.target)) { setContractorSuggestions([]); setActiveContractorRowIdx(null); }
    }, [activeRowIdx, activeContractorRowIdx]);

    useEffect(() => {
        fetchInitial();
    }, [fetchInitial]);

    useEffect(() => {
        document.addEventListener("mousedown", handleMousedown);
        return () => document.removeEventListener("mousedown", handleMousedown);
    }, [handleMousedown]);

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
            } else if (form.previous_process !== "") {
                setForm(prev => ({ ...prev, previous_process: "" }));
            }
        } else if (form.previous_process !== "") {
            setForm(prev => ({ ...prev, previous_process: "" }));
        }
    }, [form.process, lifecycle, form.previous_process]);

    const handleOrderSelect = async (e) => {
        const val = e.target.value;
        const found = orders.find(o => o.order_no === val);
        setForm(prev => ({ ...prev, order_no: val, order_name: found ? found.order_name : "", previous_process: "" }));
        setErrors(prev => ({ ...prev, order_no: "" }));

        if (found) {
            try {
                const lifeRes = await axios.get(`${API}/order-planning-v2/all/${found.id}`);
                setLifecycle(lifeRes.data.lifecycle || []);
            } catch (err) { console.error("Lifecycle error:", err); }
        }
    };


    const handleLoadInward = async () => {
        if (!form.order_no) {
            toast("Please select an order first.", "warning");
            return;
        }
        try {
            const inRes = await axios.get(`${API}/pcs-inward/by-order/${encodeURIComponent(form.order_no)}`);
            let items = inRes.data || [];

            // Filter by selected process
            if (form.process) {
                items = items.filter(it => it.process?.toLowerCase() === form.process.toLowerCase());
            }

            if (items.length > 0) {
                const filtered = items.filter(it => {
                    const bPcs = parseFloat(it.balanced_pcs || it.balanced_qty || it.pending_pcs || it.pcs || it.qty || 0);
                    return bPcs > 0;
                });
                if (filtered.length === 0) {
                    toast("All quantities have already been returned.", "info");
                    return;
                }
                setLoadableItems(filtered.map(it => {
                    const rowTotal = it.balanced_pcs || it.balanced_qty || it.pending_pcs || it.pcs || it.qty || 0;
                    return { ...it, checked: true, max_pcs: rowTotal };
                }));
                setShowLoadModal(true);
            } else {
                toast("No inward records found for this order.", "info");
            }
        } catch (err) {
            console.error("Error loading inward items:", err);
            toast("Failed to fetch inward items.", "danger");
        }
    };

    const handleLoadPrevious = async () => {
        if (!form.order_no) {
            toast("Please select an order first.", "warning");
            return;
        }
        if (!form.process) {
            toast("Please select a process first.", "warning");
            return;
        }
        try {
            const res = await axios.get(`${API}/pcs-return/balanced-qty?order_no=${encodeURIComponent(form.order_no)}&process=${encodeURIComponent(form.process)}`);

            if (res.data && res.data.length > 0) {
                const filtered = res.data.filter(it => {
                    const bPcs = parseFloat(it.balanced_pcs || it.balanced_qty || it.pending_pcs || it.pcs || it.qty || 0);
                    return bPcs > 0;
                });
                if (filtered.length === 0) {
                    toast(`All quantities for ${form.process} have already been returned.`, "info");
                    return;
                }
                setLoadableItems(filtered.map(it => {
                    const bPcs = parseFloat(it.balanced_pcs || it.balanced_qty || it.pending_pcs || it.pcs || it.qty || 0);
                    return { ...it, checked: true, max_pcs: bPcs };
                }));
                setShowLoadModal(true);
            } else {
                toast(`No balanced quantities found for ${form.process}. Everything may be received.`, "info");
            }
        } catch (err) {
            console.error("Error loading balanced items:", err);
            toast("Failed to fetch balanced items.", "danger");
        }
    };


    const handleApplyLoad = () => {
        const selected = loadableItems.filter(i => i.checked);
        if (selected.length === 0) return;

        const first = selected[0];
        const newRows = selected.map(it => {
            const szData = it.sizes_data ? (typeof it.sizes_data === 'string' ? JSON.parse(it.sizes_data) : it.sizes_data) : {};
            return {
                item_name: it.style_name || it.item_name || it.fabric_name || "",
                color: it.style_color || it.fabric_color || it.color || "",
                size: it.size || "",
                pcs: it.balanced_pcs || it.pcs || it.qty || "",
                max_pcs: it.max_pcs || it.balanced_pcs || it.pcs || it.qty || "",
                sizes_data: szData,
                contractor_name: it.contractor_name || it.header_contractor || ""
            };
        });

        setForm(prev => {
            const existing = prev.rows.filter(r => r.item_name || r.pcs);
            return {
                ...prev,
                work_type: first.work_type || prev.work_type,
                party_name: (first.work_type === "Jobwork" || !first.work_type) ? (prev.party_name || first.party_name || "") : "",
                ship_to: (first.work_type === "Jobwork" || !first.work_type) ? (prev.ship_to || first.ship_to || "") : "",
                process: prev.process || first.process || "",
                size_chart_name: prev.size_chart_name || first.size_chart_name || "",
                rows: existing.length === 0 ? newRows : [...existing, ...newRows]
            };
        });

        setShowLoadModal(false);
        toast(`Successfully loaded ${selected.length} items.`, "success");
    };


    const handleHeader = (e) => {
        const { name, value } = e.target;
        if (name === "work_type") {
            setForm(p => ({
                ...p,
                [name]: value,
                party_name: value === "Jobwork" ? p.party_name : "",
                ship_to: value === "Jobwork" ? p.ship_to : "",
                rows: p.rows.map(row => ({ ...row, contractor_name: value === "Jobwork" ? "" : row.contractor_name }))
            }));
        } else {
            setForm(p => ({ ...p, [name]: value }));
        }
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

    const handleSizeQtyChange = (index, size, value) => {
        const rows = [...form.rows];
        const szData = { ...(rows[index].sizes_data || {}), [size]: value };
        const rowTotal = Object.values(szData).reduce((sum, v) => sum + (parseInt(v, 10) || 0), 0);

        if (rows[index].max_pcs && rowTotal > parseInt(rows[index].max_pcs, 10)) {
            toast(`Total PCS cannot exceed loaded quantity (${rows[index].max_pcs})`, "warning");
            return;
        }

        rows[index] = { ...rows[index], sizes_data: szData, pcs: rowTotal };
        setForm(prev => ({ ...prev, rows }));
    };

    const handleRowChange = (index, e) => {
        const { name, value } = e.target;
        const rows = [...form.rows];
        if (name === "pcs" && rows[index].max_pcs && parseInt(value, 10) > parseInt(rows[index].max_pcs, 10)) {
            toast(`PCS cannot exceed loaded quantity (${rows[index].max_pcs})`, "warning");
            rows[index].pcs = rows[index].max_pcs;
        } else {
            rows[index][name] = value;
        }
        setForm(prev => ({ ...prev, rows }));

        if (name === "item_name") {
            setActiveRowIdx(index); setItemSuggIdx(-1);
            if (value.length >= 1) {
                axios.get(`${API}/products?term=${encodeURIComponent(value)}`)
                    .then(r => setItemSuggestions(r.data)).catch(() => setItemSuggestions([]));
            } else setItemSuggestions([]);
        }
    };

    const selectItem = (index, item) => {
        const rows = [...form.rows];
        rows[index] = { ...rows[index], item_name: item.product_name, color: item.color || rows[index].color, size: item.size || rows[index].size };
        setForm(prev => ({ ...prev, rows }));
        setItemSuggestions([]); setActiveRowIdx(null);
    };

    const handleItemKeyDown = (e, index) => {
        if (!itemSuggestions.length || activeRowIdx !== index) return;
        if (e.key === "ArrowDown") { e.preventDefault(); setItemSuggIdx(p => Math.min(p + 1, itemSuggestions.length - 1)); }
        else if (e.key === "ArrowUp") { e.preventDefault(); setItemSuggIdx(p => Math.max(p - 1, -1)); }
        else if (e.key === "Enter" && itemSuggIdx >= 0) { e.preventDefault(); selectItem(index, itemSuggestions[itemSuggIdx]); }
        else if (e.key === "Escape") { setItemSuggestions([]); setActiveRowIdx(null); }
    };

    // Contractor handlers
    const handleContractorChange = (index, e) => {
        const val = e.target.value;
        const rows = [...form.rows];
        rows[index].contractor_name = val;
        setForm(p => ({ ...p, rows }));

        if (val.trim()) {
            const low = val.toLowerCase();
            setContractorSuggestions(contractors.filter(c => c.name.toLowerCase().includes(low)));
            setActiveContractorRowIdx(index);
        } else {
            setContractorSuggestions([]);
        }
        setContractorSuggIdx(-1);
    };

    const selectContractor = (index, name) => {
        const rows = [...form.rows];
        rows[index].contractor_name = name;
        setForm(p => ({ ...p, rows }));
        setContractorSuggestions([]);
        setActiveContractorRowIdx(null);
    };

    const handleContractorKeyDown = (e, index) => {
        if (!contractorSuggestions.length || activeContractorRowIdx !== index) return;
        if (e.key === "ArrowDown") { e.preventDefault(); setContractorSuggIdx(p => Math.min(p + 1, contractorSuggestions.length - 1)); }
        else if (e.key === "ArrowUp") { e.preventDefault(); setContractorSuggIdx(p => Math.max(p - 1, -1)); }
        else if (e.key === "Enter" && contractorSuggIdx >= 0) { e.preventDefault(); selectContractor(index, contractorSuggestions[contractorSuggIdx].name); }
        else if (e.key === "Escape") { setContractorSuggestions([]); setActiveContractorRowIdx(null); }
    };

    const refreshContractors = async () => {
        try {
            const res = await axios.get(`${API}/contractor`);
            setContractors(res.data || []);
            toast("Contractors list updated", "success");
        } catch (e) { toast("Failed to refresh contractors", "danger"); }
    };

    const addRow = () => setForm(prev => ({ ...prev, rows: [...prev.rows, initialRow()] }));
    const removeRow = (i) => {
        if (form.rows.length === 1) return;
        setForm(prev => ({ ...prev, rows: prev.rows.filter((_, idx) => idx !== i) }));
    };

    const totalPcs = form.rows.reduce((s, r) => s + (parseInt(r.pcs, 10) || 0), 0);



    const validate = () => {
        const e = {};
        if (!form.order_no) e.order_no = "Order No is required";
        if (form.work_type === "Jobwork" && !form.party_name.trim()) e.party_name = "Party / Supplier is required";
        if (form.work_type === "Contractor" && form.rows.some(r => !r.contractor_name?.trim())) e.rows = "All rows must have a Contractor Name";
        if (!form.process) e.process = "Process is required";
        if (form.rows.some(r => !r.item_name.trim())) e.rows = "All rows must have an Item Name";
        if (form.rows.some(r => !r.pcs)) e.rows = (e.rows ? e.rows + " and " : "") + "Pcs is required";
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
            const payload = {
                ...form,
                total_pcs: totalPcs,
                items: form.rows,
                contractor_name: form.work_type === "Contractor" ? (form.rows[0]?.contractor_name || "") : ""
            };
            const res = await axios.post(`${API}/pcs-return`, payload);
            toast(`Saved! Return No: ${res.data.return_no}`, "success");
            setTimeout(() => navigate("/order-jobwork-pcs-return-list"), 1500);
        } catch (err) {
            toast(err.response?.data?.error || "Failed to save. Please try again.", "danger");
        } finally { setSaving(false); }
    };

    return (
        <div className="container-fluid mt-3 mb-5 px-3 px-md-4">
            <Toast toasts={toasts} remove={remove} />

            <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom">
                <button className="btn btn-outline-secondary btn-sm rounded-pill px-3" onClick={() => navigate("/order-jobwork-pcs-return-list")}>
                    <i className="bi bi-arrow-left me-1"></i>Back
                </button>
                <div>
                    <div className="d-flex align-items-center gap-2">
                        <span className="badge bg-danger rounded-pill px-3" style={{ fontSize: "0.7rem", letterSpacing: "0.06em" }}>ORDER JOBWORK</span>
                        <span className="badge bg-danger-subtle text-danger rounded-pill px-3" style={{ fontSize: "0.7rem" }}>PCS RETURN</span>
                    </div>
                    <h4 className="fw-bold mb-0 mt-1 text-dark">
                        <i className="bi bi-arrow-counterclockwise me-2 text-danger"></i>Pcs Return
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
                                isDisabled={form.rows.some(r => r.item_name || r.pcs)}
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
                            <input type="text" className="form-control bg-light" value={form.order_name} readOnly placeholder="Auto-filled" />
                        </div>
                        <div className="col-md-2">
                            <label className="form-label fw-semibold text-muted" style={{ fontSize: "0.8rem" }}>PROCESS <span className="text-danger">*</span></label>
                            <div className="d-flex gap-2">
                                <select className={`form-select ${errors.process ? "is-invalid" : ""} fw-bold text-danger`} name="process" value={form.process}
                                    onChange={handleHeader} disabled={form.rows.some(r => r.item_name || r.pcs)}>
                                    <option value="">— Select —</option>
                                    {processes.map((p, i) => <option key={i} value={p.process_name}>{p.process_name}</option>)}
                                </select>
                                {form.order_no && (
                                    <button className="btn btn-dark btn-sm rounded-3 px-3 italic" onClick={handleLoadInward} disabled={form.rows.some(r => r.item_name || r.pcs)}>Load</button>
                                )}
                            </div>
                            {errors.process && <div className="invalid-feedback d-block">{errors.process}</div>}
                        </div>

                        <div className="col-md-2">
                            <label className="form-label fw-semibold text-muted" style={{ fontSize: "0.8rem" }}>PREV. PROCESS</label>
                            <div className="d-flex gap-2">
                                <input type="text" className="form-control bg-light" value={form.previous_process} readOnly placeholder="Auto-filled" />
                                {form.previous_process && (
                                    <button className="btn btn-dark btn-sm rounded-3 px-3 italic" onClick={handleLoadPrevious} disabled={form.rows.some(r => r.item_name || r.pcs)}>Load</button>
                                )}
                            </div>
                        </div>


                        <div className="col-md-2">
                            <label className="form-label fw-semibold text-muted" style={{ fontSize: "0.8rem" }}>SIZE CHART</label>
                            <select className="form-select fw-bold text-danger" name="size_chart_name" value={form.size_chart_name}
                                onChange={handleHeader} disabled={form.rows.some(r => r.item_name || r.pcs)}>
                                <option value="">— Select —</option>
                                {sizeCharts.map((c, i) => (
                                    <option key={i} value={c.chart_name}>{c.chart_name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-2">
                            <label className="form-label fw-semibold text-muted" style={{ fontSize: "0.8rem" }}>REF. / DC NO.</label>

                            <input type="text" className="form-control" name="ref_no" value={form.ref_no} onChange={handleHeader} placeholder="DC / Challan" />
                        </div>
                        <div className="col-md-2">
                            <label className="form-label fw-semibold text-muted" style={{ fontSize: "0.8rem" }}>TOTAL PCS</label>
                            <input className="form-control fw-bold text-center bg-light" readOnly value={totalPcs} />
                        </div>
                    </div>

                    <div className="row g-3 mb-4 align-items-end">
                        <div className="col-md-3">
                            <label className="form-label fw-semibold text-muted d-block" style={{ fontSize: "0.8rem" }}>WORK TYPE</label>
                            <div className="btn-group w-100 shadow-sm" style={{ borderRadius: "10px", overflow: "hidden" }}>
                                <input type="radio" className="btn-check" name="work_type" id="wt_jobwork" value="Jobwork"
                                    checked={form.work_type === "Jobwork"} onChange={handleHeader} />
                                <label className="btn btn-outline-danger py-2 fw-bold" htmlFor="wt_jobwork">Jobwork</label>

                                <input type="radio" className="btn-check" name="work_type" id="wt_contractor" value="Contractor"
                                    checked={form.work_type === "Contractor"} onChange={handleHeader} />
                                <label className="btn btn-outline-danger py-2 fw-bold" htmlFor="wt_contractor">Contractor</label>
                            </div>
                        </div>

                        {form.work_type === "Jobwork" && (
                            <>
                                <div className="col-md-3 position-relative" ref={supplierRef}>
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
                                <div className="col-md-3 position-relative" ref={shipToRef}>
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
                            </>
                        )}
                        <div className="col-md-3">
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
                        <h6 className="fw-bold mb-0 text-dark"><i className="bi bi-table me-2 text-danger"></i>Pcs Items</h6>
                        <button className="btn btn-danger btn-sm rounded-pill px-3" onClick={addRow}>
                            <i className="bi bi-plus-lg me-1"></i>Add Row
                        </button>
                    </div>
                    {errors.rows && <div className="alert alert-warning py-1 px-3 small mb-2 rounded-3"><i className="bi bi-exclamation-triangle me-1"></i>{errors.rows}</div>}

                    <div className="table-responsive rounded-3 border" ref={itemRef}>
                        <table className="table table-hover table-bordered align-middle mb-0">
                            <thead className="table-dark">
                                {form.size_chart_name ? (
                                    <tr style={{ fontSize: "0.75rem" }}>
                                        <th className="text-center" style={{ width: "40px" }}>#</th>
                                        <th>STYLE NAME</th>
                                        <th style={{ width: "130px" }}>COLOR</th>

                                        {sizeCharts.find(c => c.chart_name === form.size_chart_name)?.size_values.split(", ").map((size, idx) => (
                                            <th key={idx} className="text-center px-1" style={{ minWidth: "60px" }}>{size}</th>
                                        ))}
                                        {form.work_type === "Contractor" && (
                                            <th style={{ width: "180px" }}>
                                                <div className="d-flex align-items-center justify-content-between">
                                                    CONTRACTOR
                                                    <div className="d-flex gap-1">
                                                        <i className="bi bi-plus-circle text-primary cursor-pointer" onClick={() => navigate("/contractor-add")} title="Add Contractor"></i>
                                                        <i className="bi bi-arrow-clockwise text-success cursor-pointer" onClick={refreshContractors} title="Refresh List"></i>
                                                    </div>
                                                </div>
                                            </th>
                                        )}
                                        <th style={{ width: "100px" }} className="text-center text-danger fw-bold">TOTAL PCS</th>
                                        <th className="text-center" style={{ width: "50px" }}>DEL</th>
                                    </tr>
                                ) : (
                                    <tr>
                                        <th className="text-center" style={{ width: "5%" }}>#</th>
                                        <th style={{ width: "30%" }}>STYLE NAME</th>
                                        <th style={{ width: "15%" }}>COLOR</th>

                                        <th style={{ width: "10%" }}>SIZE</th>
                                        {form.work_type === "Contractor" && (
                                            <th style={{ width: "180px" }}>
                                                <div className="d-flex align-items-center justify-content-between">
                                                    CONTRACTOR
                                                    <div className="d-flex gap-1">
                                                        <i className="bi bi-plus-circle text-primary cursor-pointer" onClick={() => navigate("/contractor-add")} title="Add Contractor"></i>
                                                        <i className="bi bi-arrow-clockwise text-success cursor-pointer" onClick={refreshContractors} title="Refresh List"></i>
                                                    </div>
                                                </div>
                                            </th>
                                        )}
                                        <th style={{ width: "15%" }}>PCS</th>
                                        <th className="text-center" style={{ width: "5%" }}>DEL</th>
                                    </tr>
                                )}
                            </thead>
                            <tbody>
                                {form.rows.map((row, idx) => {
                                    const selectedChart = sizeCharts.find(c => c.chart_name === form.size_chart_name);
                                    const sizes = selectedChart ? selectedChart.size_values.split(", ") : [];

                                    if (form.size_chart_name) {
                                        return (
                                            <tr key={idx}>
                                                <td className="text-center text-muted fw-semibold small">{idx + 1}</td>
                                                <td className="position-relative">
                                                    <input type="text" className="form-control form-control-sm"
                                                        name="item_name" value={row.item_name}
                                                        onChange={(e) => handleRowChange(idx, e)}
                                                        onKeyDown={(e) => handleItemKeyDown(e, idx)}
                                                        placeholder="Search style..." autoComplete="off" />
                                                    {activeRowIdx === idx && itemSuggestions.length > 0 && (
                                                        <ul className="list-group position-absolute w-100 shadow-lg" style={{ zIndex: 1050, top: "100%", maxHeight: 200, overflowY: "auto" }}>
                                                            {itemSuggestions.map((it, i) => (
                                                                <li key={it.id} className={`list-group-item list-group-item-action py-1 px-2 small ${itemSuggIdx === i ? "active" : ""}`} style={{ cursor: "pointer" }} onMouseDown={() => selectItem(idx, it)}>
                                                                    <strong>{it.product_name}</strong>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                </td>
                                                <td>
                                                    <input type="text" className="form-control form-control-sm" name="color" value={row.color} onChange={(e) => handleRowChange(idx, e)} placeholder="Color" />
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
                                                {form.work_type === "Contractor" && (
                                                    <td className="position-relative p-1" ref={activeContractorRowIdx === idx ? contractorRef : null}>
                                                        <input type="text" className="form-control form-control-sm"
                                                            value={row.contractor_name}
                                                            onChange={(e) => handleContractorChange(idx, e)}
                                                            onKeyDown={(e) => handleContractorKeyDown(e, idx)}
                                                            placeholder="Contractor..." autoComplete="off" />
                                                        {activeContractorRowIdx === idx && contractorSuggestions.length > 0 && (
                                                            <ul className="list-group position-absolute w-100 shadow-lg" style={{ zIndex: 1050, top: "100%", maxHeight: 200, overflowY: "auto" }}>
                                                                {contractorSuggestions.map((c, i) => (
                                                                    <li key={c.id} className={`list-group-item list-group-item-action py-1 px-2 small ${contractorSuggIdx === i ? "active" : ""}`} style={{ cursor: "pointer" }} onMouseDown={() => selectContractor(idx, c.name)}>
                                                                        {c.name}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                    </td>
                                                )}
                                                <td className="text-center fw-bold text-danger" style={{ backgroundColor: "#fff5f5" }}>{row.pcs || 0}</td>
                                                <td className="text-center">
                                                    <button className="btn btn-sm btn-outline-danger border-0 p-0" onClick={() => removeRow(idx)} disabled={form.rows.length === 1}>
                                                        <i className="bi bi-x-circle fs-5"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    }

                                    return (
                                        <tr key={idx}>
                                            <td className="text-center text-muted fw-semibold small">{idx + 1}</td>
                                            <td className="position-relative">
                                                <input type="text" className="form-control form-control-sm"
                                                    name="item_name" value={row.item_name}
                                                    onChange={(e) => handleRowChange(idx, e)}
                                                    onKeyDown={(e) => handleItemKeyDown(e, idx)}
                                                    placeholder="Search item..." autoComplete="off" />
                                                {activeRowIdx === idx && itemSuggestions.length > 0 && (
                                                    <ul className="list-group position-absolute w-100 shadow-lg" style={{ zIndex: 1050, top: "100%", maxHeight: 200, overflowY: "auto" }}>
                                                        {itemSuggestions.map((it, i) => (
                                                            <li key={it.id}
                                                                className={`list-group-item list-group-item-action py-1 px-2 small ${itemSuggIdx === i ? "active" : ""}`}
                                                                style={{ cursor: "pointer" }}
                                                                onMouseDown={() => selectItem(idx, it)}>
                                                                <strong>{it.product_name}</strong>
                                                                {it.sku && <span className="text-muted ms-1">· {it.sku}</span>}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </td>
                                            <td><input type="text" className="form-control form-control-sm" name="color" value={row.color} onChange={(e) => handleRowChange(idx, e)} placeholder="Color" /></td>

                                            <td><input type="text" className="form-control form-control-sm" name="size" value={row.size} onChange={(e) => handleRowChange(idx, e)} placeholder="Size" /></td>
                                            {form.work_type === "Contractor" && (
                                                <td className="position-relative p-1" ref={activeContractorRowIdx === idx ? contractorRef : null}>
                                                    <input type="text" className="form-control form-control-sm"
                                                        value={row.contractor_name}
                                                        onChange={(e) => handleContractorChange(idx, e)}
                                                        onKeyDown={(e) => handleContractorKeyDown(e, idx)}
                                                        placeholder="Contractor..." autoComplete="off" />
                                                    {activeContractorRowIdx === idx && contractorSuggestions.length > 0 && (
                                                        <ul className="list-group position-absolute w-100 shadow-lg" style={{ zIndex: 1050, top: "100%", maxHeight: 200, overflowY: "auto" }}>
                                                            {contractorSuggestions.map((c, i) => (
                                                                <li key={c.id} className={`list-group-item list-group-item-action py-1 px-2 small ${contractorSuggIdx === i ? "active" : ""}`} style={{ cursor: "pointer" }} onMouseDown={() => selectContractor(idx, c.name)}>
                                                                    {c.name}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                </td>
                                            )}
                                            <td><input type="number" className="form-control form-control-sm text-center" name="pcs" value={row.pcs} onChange={(e) => handleRowChange(idx, e)} placeholder="0" min="0" /></td>
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
                                    <td colSpan={(form.size_chart_name ? 3 + (sizeCharts.find(c => c.chart_name === form.size_chart_name)?.size_values.split(", ").length || 0) : 4) + (form.work_type === "Contractor" ? 1 : 0)} className="text-end fw-bold">Total:</td>
                                    <td className="text-center fw-bold text-warning">{totalPcs}</td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    <div className="mt-4 pt-3 border-top d-flex gap-2">
                        <button className="btn btn-danger rounded-pill px-5 py-2 fw-bold" onClick={handleSave} disabled={saving}>
                            {saving ? <><span className="spinner-border spinner-border-sm me-2"></span>Saving...</> : <><i className="bi bi-cloud-arrow-up me-2"></i>Save Return</>}
                        </button>
                        <button className="btn btn-outline-secondary rounded-pill px-4" onClick={() => navigate("/order-jobwork-pcs-return-list")}>Cancel</button>
                    </div>
                </div>
            </div>

            {/* Load Inward Modal */}
            {showLoadModal && (
                <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
                        <div className="modal-content border-0 shadow-lg rounded-4">
                            <div className="modal-header border-bottom-0 p-4 pb-0">
                                <h5 className="modal-title fw-bold"><i className="bi bi-download me-2 text-danger"></i>Load from Inwards</h5>
                                <button type="button" className="btn-close" onClick={() => setShowLoadModal(false)}></button>
                            </div>
                            <div className="modal-body p-4">
                                <div className="table-responsive rounded-3 border">
                                    <table className="table table-hover align-middle mb-0 small">
                                        <thead className="table-light">
                                            <tr>
                                                <th className="text-center" style={{ width: "40px" }}>
                                                    <input type="checkbox" className="form-check-input"
                                                        checked={loadableItems.every(i => i.checked)}
                                                        onChange={(e) => setLoadableItems(prev => prev.map(it => ({ ...it, checked: e.target.checked })))}
                                                    />
                                                </th>
                                                <th>INWARD NO.</th>
                                                <th>PROCESS</th>
                                                <th>ITEM NAME</th>
                                                <th>COLOR</th>
                                                <th>SIZE</th>
                                                <th className="text-end">QTY</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {loadableItems.map((it, idx) => (
                                                <tr key={idx} style={{ cursor: "pointer" }} onClick={() => {
                                                    const updated = [...loadableItems];
                                                    updated[idx].checked = !updated[idx].checked;
                                                    setLoadableItems(updated);
                                                }}>
                                                    <td className="text-center" onClick={(e) => e.stopPropagation()}>
                                                        <input type="checkbox" className="form-check-input"
                                                            checked={it.checked}
                                                            onChange={(e) => {
                                                                const updated = [...loadableItems];
                                                                updated[idx].checked = e.target.checked;
                                                                setLoadableItems(updated);
                                                            }}
                                                        />
                                                    </td>
                                                    <td className="fw-bold">{it.inward_no}</td>
                                                    <td><span className="badge bg-danger-subtle text-danger">{it.process}</span></td>
                                                    <td>{it.item_name}</td>
                                                    <td>{it.color}</td>
                                                    <td>{it.size}</td>
                                                    <td className="text-end fw-bold">{it.pcs}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="modal-footer border-top-0 p-4 pt-0 gap-2">
                                <button className="btn btn-outline-secondary rounded-pill px-4" onClick={() => setShowLoadModal(false)}>Cancel</button>
                                <button className="btn btn-danger rounded-pill px-5 fw-bold" onClick={handleApplyLoad}>
                                    Apply Loaded Data ({loadableItems.filter(i => i.checked).length})
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>

    );
}
