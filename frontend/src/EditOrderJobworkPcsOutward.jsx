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

const initialRow = () => ({ item_name: "", style_name: "", color: "", style_color: "", size: "", pcs: "", sizes_data: {}, contractor_name: "" });

export default function EditOrderJobworkPcsOutward() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { toasts, add: toast, remove } = useToast();
    const [form, setForm] = useState({
        outward_date: "", order_no: "", order_name: "", party_name: "", ship_to: "", process: "", previous_process: "", size_chart_name: "", ref_no: "",
        staff_name: "", staff_remarks: "", remarks: "", work_type: "Jobwork", rows: [initialRow()]
    });
    const [outwardNo, setOutwardNo] = useState("...");
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    const [employees, setEmployees] = useState([]);
    const [contractors, setContractors] = useState([]);
    const [lifecycle, setLifecycle] = useState([]);
    const [styleColors, setStyleColors] = useState([]);
    const [sizeCharts, setSizeCharts] = useState([]);
    const [errors, setErrors] = useState({});

    // Contractor autocomplete
    const [contractorSuggestions, setContractorSuggestions] = useState([]);
    const [activeContractorIdx, setActiveContractorIdx] = useState(null);
    const [contractorSuggIdx, setContractorSuggIdx] = useState(-1);
    const contractorRef = useRef(null);

    // Item autocomplete
    const [itemSuggestions, setItemSuggestions] = useState([]);
    const [activeRowIdx, setActiveRowIdx] = useState(null);
    const [itemSuggIdx, setItemSuggIdx] = useState(-1);
    const itemRef = useRef(null);

    // Supplier autocomplete
    const [supplierSuggestions, setSupplierSuggestions] = useState([]);
    const [supplierSuggIdx, setSupplierSuggIdx] = useState(-1);
    const supplierRef = useRef(null);

    const fetchData = useCallback(async () => {
        try {
            const [recRes, empRes, contractorRes, chartRes, orderRes] = await Promise.all([
                axios.get(`${API}/pcs-outward/${id}`),
                axios.get(`${API}/employees`),
                axios.get(`${API}/contractor`), // Fixed path
                axios.get(`${API}/size-charts`),
                axios.get(`${API}/yarn-dyeing-outward/orders`)
            ]);
            const rec = recRes.data;
            setOutwardNo(rec.outward_no);

            setEmployees(empRes.data || []);
            setContractors(contractorRes.data || []);
            setSizeCharts(chartRes.data || []);

            // Fetch order-specific lifecycle and colors
            let orderLifecycle = [];
            if (rec.order_no) {
                const foundOrder = (orderRes.data || []).find(o => o.order_no === rec.order_no);
                if (foundOrder) {
                    try {
                        const [lifeRes, colorRes] = await Promise.all([
                            axios.get(`${API}/order-planning-v2/all/${foundOrder.id}`),
                            axios.get(`${API}/size-quantity/order/${foundOrder.id}`)
                        ]);
                        orderLifecycle = lifeRes.data.lifecycle || [];
                        setLifecycle(orderLifecycle);
                        if (colorRes.data && colorRes.data.items) {
                            const colors = [...new Set(colorRes.data.items.map(it => it.color).filter(Boolean))];
                            setStyleColors(colors);
                        }
                    } catch (err) { console.error("Error fetching order details:", err); }
                }
            }

            // IdentiAY previous process
            let prevProcName = "";
            if (rec.process && orderLifecycle.length > 0) {
                const val = rec.process.trim().toLowerCase();
                const idx = orderLifecycle.findIndex(p =>
                    (p.process_name || "").trim().toLowerCase() === val ||
                    (p.custom_name || "").trim().toLowerCase() === val
                );
                if (idx > 0) {
                    const prev = orderLifecycle[idx - 1];
                    prevProcName = prev.custom_name || prev.process_name;
                }
            }

            setForm({
                outward_date: rec.outward_date ? rec.outward_date.substring(0, 10) : "",
                order_no: rec.order_no || "",
                order_name: rec.order_name || "",
                party_name: rec.party_name || "",
                ship_to: rec.ship_to || "",
                process: rec.process || "",
                previous_process: prevProcName,
                size_chart_name: rec.size_chart_name || "",
                ref_no: rec.ref_no || "",
                staff_name: rec.staff_name || "",
                staff_remarks: rec.staff_remarks || "",
                remarks: rec.remarks || "",
                work_type: rec.work_type || "Jobwork",
                rows: (rec.items && rec.items.length) ? rec.items.map(it => ({
                    item_name: it.item_name || "",
                    style_name: it.style_name || it.item_name || "",
                    color: it.color || "",
                    style_color: it.style_color || it.color || "",
                    size: it.size || "",
                    pcs: it.pcs || "",
                    contractor_name: it.contractor_name || "",
                    sizes_data: it.sizes_data ? (typeof it.sizes_data === 'string' ? JSON.parse(it.sizes_data) : it.sizes_data) : {}
                })) : [initialRow()],
            });
        } catch (err) {
            toast("Failed to load record.", "danger");
        } finally { setLoading(false); }
    }, [id, toast]);

    useEffect(() => {
        fetchData();
        const handler = (e) => {
            if (itemRef.current && !itemRef.current.contains(e.target)) { setItemSuggestions([]); setActiveRowIdx(null); }
            if (supplierRef.current && !supplierRef.current.contains(e.target)) setSupplierSuggestions([]);
            if (contractorRef.current && !contractorRef.current.contains(e.target)) { setContractorSuggestions([]); setActiveContractorIdx(null); }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [fetchData]);

    const handleHeader = (e) => {
        const { name, value } = e.target;
        setForm(prev => {
            const upd = { ...prev, [name]: value };
            if (name === "process") {
                if (value && lifecycle.length > 0) {
                    const v = value.trim().toLowerCase();
                    const idx = lifecycle.findIndex(p =>
                        (p.process_name || "").trim().toLowerCase() === v ||
                        (p.custom_name || "").trim().toLowerCase() === v
                    );
                    if (idx > 0) {
                        const prev = lifecycle[idx - 1];
                        upd.previous_process = prev.custom_name || prev.process_name;
                    } else upd.previous_process = "";
                } else upd.previous_process = "";
            }
            return upd;
        });
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

    const handleSizeQtyChange = (index, size, value) => {
        const rows = [...form.rows];
        const szData = { ...(rows[index].sizes_data || {}), [size]: value };
        const rowTotal = Object.values(szData).reduce((sum, v) => sum + (parseInt(v, 10) || 0), 0);
        rows[index] = { ...rows[index], sizes_data: szData, pcs: rowTotal };
        setForm(prev => ({ ...prev, rows }));
    };

    const handleRowChange = (index, e) => {
        const { name, value } = e.target;
        const rows = [...form.rows];
        rows[index] = { ...rows[index], [name]: value };
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

    const handleContractorChange = (index, value) => {
        const rows = [...form.rows];
        rows[index].contractor_name = value;
        setForm(prev => ({ ...prev, rows }));
        setActiveContractorIdx(index);
        setContractorSuggIdx(-1);
        if (value.length >= 1) {
            const filtered = contractors.filter(c => (c.name || "").toLowerCase().includes(value.toLowerCase()));
            setContractorSuggestions(filtered);
        } else setContractorSuggestions([]);
    };

    const selectContractor = (index, name) => {
        const rows = [...form.rows];
        rows[index].contractor_name = name;
        setForm(prev => ({ ...prev, rows }));
        setContractorSuggestions([]);
        setActiveContractorIdx(null);
    };

    const handleContractorKeyDown = (e, index) => {
        if (!contractorSuggestions.length || activeContractorIdx !== index) return;
        if (e.key === "ArrowDown") { e.preventDefault(); setContractorSuggIdx(p => Math.min(p + 1, contractorSuggestions.length - 1)); }
        else if (e.key === "ArrowUp") { e.preventDefault(); setContractorSuggIdx(p => Math.max(p - 1, -1)); }
        else if (e.key === "Enter" && contractorSuggIdx >= 0) { e.preventDefault(); selectContractor(index, contractorSuggestions[contractorSuggIdx].name); }
        else if (e.key === "Escape") { setContractorSuggestions([]); setActiveContractorIdx(null); }
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
        if (form.work_type === "Jobwork" && !form.party_name?.trim()) e.party_name = "Party / Supplier is required";
        if (form.work_type === "Contractor" && form.rows.some(r => !r.contractor_name?.trim())) e.rows = "All rows must have a Contractor Name";
        if (!form.process) e.process = "Process is required";
        if (form.rows.some(r => !r.item_name.trim())) e.rows = (e.rows ? e.rows + " and " : "") + "All rows must have an Item Name";
        if (form.rows.some(r => !r.pcs)) e.rows = (e.rows ? e.rows + " and " : "") + "Pcs is required";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleUpdate = async () => {
        if (!validate()) { toast("Please fix fields.", "warning"); return; }
        setSaving(true);
        try {
            const payload = {
                ...form,
                total_pcs: totalPcs,
                items: form.rows,
                contractor_name: form.work_type === "Contractor" ? (form.rows[0]?.contractor_name || "") : ""
            };
            await axios.put(`${API}/pcs-outward/${id}`, payload);
            toast("Updated successfully!", "success");
            setTimeout(() => navigate("/order-jobwork-pcs-outward-list"), 1500);
        } catch (err) {
            toast(err.response?.data?.error || "Update failed.", "danger");
        } finally { setSaving(false); }
    };

    if (loading) return <div className="container mt-5 text-center"><div className="spinner-border text-primary"></div></div>;

    const selectedChart = sizeCharts.find(c => c.chart_name === form.size_chart_name);
    const sizes = selectedChart ? selectedChart.size_values.split(", ") : [];

    return (
        <div className="container-fluid mt-3 mb-5 px-3 px-md-4">
            <Toast toasts={toasts} remove={remove} />

            <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom">
                <button className="btn btn-outline-secondary btn-sm rounded-pill px-3" onClick={() => navigate("/order-jobwork-pcs-outward-list")}>
                    <i className="bi bi-arrow-left me-1"></i>Back
                </button>
                <div>
                    <div className="d-flex align-items-center gap-2">
                        <span className="badge bg-primary rounded-pill px-3" style={{ fontSize: "0.7rem", letterSpacing: "0.06em" }}>EDIT ORDER JOBWORK</span>
                        <span className="badge bg-primary-subtle text-primary rounded-pill px-3" style={{ fontSize: "0.7rem" }}>PCS OUTWARD</span>
                    </div>
                    <h4 className="fw-bold mb-0 mt-1 text-dark">
                        <i className="bi bi-pencil-square me-2 text-primary"></i>Edit Pcs Outward
                    </h4>
                </div>
                <div className="ms-auto text-end">
                    <div className="fw-bold text-primary fs-5">{outwardNo}</div>
                    <small className="text-muted">Editing Outward</small>
                </div>
            </div>

            <div className="card border-0 shadow-sm rounded-4">
                <div className="card-body p-4">
                    <div className="row g-3 mb-3">
                        <div className="col-md-2">
                            <label className="form-label fw-semibold text-muted small">DATE</label>
                            <input type="date" className="form-control" name="outward_date" value={form.outward_date} onChange={handleHeader} />
                        </div>
                        <div className="col-md-2">
                            <label className="form-label fw-semibold text-muted small">ORDER NO</label>
                            <input type="text" className="form-control bg-light" value={form.order_no} readOnly />
                        </div>
                        <div className="col-md-2">
                            <label className="form-label fw-semibold text-muted small">ORDER NAME</label>
                            <input type="text" className="form-control bg-light" value={form.order_name} readOnly />
                        </div>
                        <div className="col-md-2">
                            <label className="form-label fw-semibold text-muted small">PROCESS <span className="text-danger">*</span></label>
                            <select className={`form-select ${errors.process ? "is-invalid" : ""} fw-bold text-primary`} name="process" value={form.process} onChange={handleHeader}>
                                <option value="">— Select —</option>
                                {lifecycle
                                    .filter(p => (p.process_type || "").toUpperCase() === "PCS" && (p.custom_name || p.process_name).toLowerCase() !== "cutting")
                                    .map((p, i) => {
                                        const name = p.custom_name || p.process_name;
                                        return <option key={i} value={name}>{name}</option>;
                                    })
                                }
                            </select>
                        </div>
                        <div className="col-md-2">
                            <label className="form-label fw-semibold text-muted small">PREV. PROCESS</label>
                            <input type="text" className="form-control bg-light" value={form.previous_process} readOnly placeholder="Auto-filled" />
                        </div>
                        <div className="col-md-2">
                            <label className="form-label fw-semibold text-muted small">SIZE CHART</label>
                            <select className="form-select fw-bold text-success" name="size_chart_name" value={form.size_chart_name} onChange={handleHeader}>
                                <option value="">— Select —</option>
                                {sizeCharts.map((c, i) => <option key={i} value={c.chart_name}>{c.chart_name}</option>)}
                            </select>
                        </div>
                        <div className="col-md-2">
                            <label className="form-label fw-semibold text-muted small">REF. / DC NO.</label>
                            <input type="text" className="form-control" name="ref_no" value={form.ref_no} onChange={handleHeader} />
                        </div>
                        <div className="col-md-2">
                            <label className="form-label fw-semibold text-muted small">WORK TYPE</label>
                            <div className="d-flex gap-3 mt-1">
                                <div className="form-check">
                                    <input className="form-check-input" type="radio" name="work_type" id="wtJobwork" value="Jobwork" checked={form.work_type === "Jobwork"} onChange={handleHeader} />
                                    <label className="form-check-label small fw-bold" htmlFor="wtJobwork">Jobwork</label>
                                </div>
                                <div className="form-check">
                                    <input className="form-check-input" type="radio" name="work_type" id="wtContractor" value="Contractor" checked={form.work_type === "Contractor"} onChange={handleHeader} />
                                    <label className="form-check-label small fw-bold text-primary" htmlFor="wtContractor">Contractor</label>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-1">
                            <label className="form-label fw-semibold text-muted small">TOTAL</label>
                            <input className="form-control fw-bold text-center bg-light px-1" readOnly value={totalPcs} />
                        </div>
                    </div>

                    <div className="row g-3 mb-4">
                        {form.work_type === "Jobwork" && (
                            <>
                                <div className="col-md-4 position-relative" ref={supplierRef}>
                                    <label className="form-label fw-semibold text-muted small">PARTY NAME <span className="text-danger">*</span></label>
                                    <input type="text" className={`form-control ${errors.party_name ? "is-invalid" : ""}`}
                                        name="party_name" value={form.party_name}
                                        onChange={handlePartyChange} onKeyDown={handleSupplierKeyDown}
                                        placeholder="Type to search..." autoComplete="off" />
                                    {supplierSuggestions.length > 0 && (
                                        <ul className="list-group position-absolute w-100 shadow-lg mt-1" style={{ zIndex: 1050, maxHeight: 200, overflowY: "auto" }}>
                                            {supplierSuggestions.map((s, i) => (
                                                <li key={i} className={`list-group-item list-group-item-action py-1 px-3 small ${supplierSuggIdx === i ? "active" : ""}`}
                                                    onMouseDown={() => selectSupplier(s.name)} style={{ cursor: "pointer" }}>{s.name}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label fw-semibold text-muted small">SHIP TO</label>
                                    <input type="text" className="form-control" name="ship_to" value={form.ship_to} onChange={handleHeader} />
                                </div>
                            </>
                        )}
                        <div className="col-md-4">
                            <label className="form-label fw-semibold text-muted small">REMARKS</label>
                            <input type="text" className="form-control" name="remarks" value={form.remarks} onChange={handleHeader} />
                        </div>
                    </div>

                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <h6 className="fw-bold mb-0 text-dark"><i className="bi bi-table me-2 text-primary"></i>Pcs Items</h6>
                        <button className="btn btn-primary btn-sm rounded-pill px-3" onClick={addRow}>Add Row</button>
                    </div>
                    {errors.rows && <div className="alert alert-warning py-1 px-3 small mb-2 rounded-3 text-center">{errors.rows}</div>}

                    <div className="table-responsive rounded-3 border" ref={itemRef}>
                        <table className="table table-hover table-bordered align-middle mb-0">
                            <thead className="table-dark small">
                                <tr>
                                    <th className="text-center" style={{ width: "40px" }}>#</th>
                                    <th>STYLE NAME</th>
                                    {form.work_type === "Contractor" && (
                                        <th style={{ width: "200px" }}>
                                            <div className="d-flex align-items-center justify-content-between">
                                                <span>CONTRACTOR</span>
                                                <div className="d-flex gap-1">
                                                    <i className="bi bi-plus-circle-fill text-success cursor-pointer" title="Add Contractor" onClick={() => navigate("/contractor-add")}></i>
                                                    <i className="bi bi-arrow-clockwise cursor-pointer text-white" title="Refresh" onClick={() => axios.get(`${API}/contractor`).then(r => setContractors(r.data))}></i>
                                                </div>
                                            </div>
                                        </th>
                                    )}
                                    <th style={{ width: "130px" }}>COLOR</th>
                                    {form.size_chart_name ? (
                                        sizes.map((sz, i) => <th key={i} className="text-center px-1" style={{ minWidth: "50px" }}>{sz}</th>)
                                    ) : (
                                        <th style={{ width: "100px" }}>SIZE</th>
                                    )}
                                    <th style={{ width: "80px" }} className="text-center">PCS</th>
                                    <th className="text-center" style={{ width: "40px" }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {form.rows.map((row, idx) => (
                                    <tr key={idx}>
                                        <td className="text-center text-muted small">{idx + 1}</td>
                                        <td className="position-relative">
                                            <input type="text" className="form-control form-control-sm" name="item_name" value={row.item_name}
                                                onChange={e => handleRowChange(idx, e)} onKeyDown={e => handleItemKeyDown(e, idx)} autoComplete="off" />
                                            {activeRowIdx === idx && itemSuggestions.length > 0 && (
                                                <ul className="list-group position-absolute w-100 shadow-lg mt-1" style={{ zIndex: 1050, maxHeight: 200, overflowY: "auto" }}>
                                                    {itemSuggestions.map((it, i) => (
                                                        <li key={i} className={`list-group-item list-group-item-action py-1 px-2 small ${itemSuggIdx === i ? "active" : ""}`}
                                                            onMouseDown={() => selectItem(idx, it)} style={{ cursor: "pointer" }}>{it.product_name}</li>
                                                    ))}
                                                </ul>
                                            )}
                                        </td>
                                        {form.work_type === "Contractor" && (
                                            <td className="position-relative" ref={contractorRef}>
                                                <input type="text" className="form-control form-control-sm" placeholder="Search contractor..." value={row.contractor_name || ""}
                                                    onChange={e => handleContractorChange(idx, e.target.value)} onKeyDown={e => handleContractorKeyDown(e, idx)} />
                                                {activeContractorIdx === idx && contractorSuggestions.length > 0 && (
                                                    <ul className="list-group position-absolute w-100 shadow-lg mt-1" style={{ zIndex: 1050, maxHeight: 150, overflowY: "auto" }}>
                                                        {contractorSuggestions.map((c, i) => (
                                                            <li key={i} className={`list-group-item list-group-item-action py-1 px-2 small ${contractorSuggIdx === i ? "active" : ""}`}
                                                                onMouseDown={() => selectContractor(idx, c.name)} style={{ cursor: "pointer" }}>{c.name}</li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </td>
                                        )}
                                        <td>
                                            <select className="form-select form-select-sm" name="color" value={row.color} onChange={e => handleRowChange(idx, e)}>
                                                <option value="">— Color —</option>
                                                {styleColors.map((c, i) => <option key={i} value={c}>{c}</option>)}
                                            </select>
                                        </td>
                                        {form.size_chart_name ? (
                                            sizes.map((sz, sIdx) => (
                                                <td key={sIdx} className="p-1">
                                                    <input type="number" className="form-control form-control-sm text-center p-0" value={row.sizes_data?.[sz] || ""}
                                                        onChange={e => handleSizeQtyChange(idx, sz, e.target.value)} min="0" />
                                                </td>
                                            ))
                                        ) : (
                                            <td><input type="text" className="form-control form-control-sm" name="size" value={row.size} onChange={e => handleRowChange(idx, e)} /></td>
                                        )}
                                        <td><input type="number" className="form-control form-control-sm text-center fw-bold" name="pcs" value={row.pcs} onChange={e => handleRowChange(idx, e)} readOnly={!!form.size_chart_name} /></td>
                                        <td className="text-center">
                                            <button className="btn btn-sm btn-outline-danger border-0" onClick={() => removeRow(idx)} disabled={form.rows.length === 1}><i className="bi bi-trash"></i></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="table-light fw-bold">
                                    <td colSpan={(form.size_chart_name ? 3 + sizes.length : 4) + (form.work_type === "Contractor" ? 1 : 0)} className="text-end">Total Pcs:</td>
                                    <td className="text-center text-primary">{totalPcs}</td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    <div className="card bg-light border-0 rounded-3 mt-4 p-3">
                        <div className="row g-3">
                            <div className="col-md-4">
                                <label className="form-label fw-semibold text-muted small">STAFF NAME</label>
                                <select className="form-select" name="staff_name" value={form.staff_name} onChange={handleHeader}>
                                    <option value="">— Select Staff —</option>
                                    {employees.map((emp, i) => <option key={i} value={emp.employee_name}>{emp.employee_name}</option>)}
                                </select>
                            </div>
                            <div className="col-md-8">
                                <label className="form-label fw-semibold text-muted small">STAFF REMARKS</label>
                                <input type="text" className="form-control" name="staff_remarks" value={form.staff_remarks} onChange={handleHeader} />
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 pt-3 border-top d-flex gap-2">
                        <button className="btn btn-primary rounded-pill px-5 fw-bold" onClick={handleUpdate} disabled={saving}>
                            {saving ? "Updating..." : "Update Outward"}
                        </button>
                        <button className="btn btn-outline-secondary rounded-pill px-4" onClick={() => navigate("/order-jobwork-pcs-outward-list")}>Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
