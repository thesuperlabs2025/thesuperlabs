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

const initialRow = () => ({ yarn_name: "", counts: "", color: "", fabric_name: "", gsm: "", dia: "", qty: "" });
const today = new Date().toISOString().substring(0, 10);
const getForm = () => ({
    outward_date: today,
    lot_no: "", lot_name: "",
    party_name: "",
    ship_to: "",
    process: "Yarn Dyeing",
    ref_no: "",
    staff_name: "",
    staff_remarks: "",
    remarks: "",
    rows: [initialRow()]
});

export default function LotJobworkYarnToFabricOutward() {
    const navigate = useNavigate();
    const { toasts, add: toast, remove } = useToast();
    const [form, setForm] = useState(getForm());
    const [outwardNo, setOutwardNo] = useState("Loading...");
    const [saving, setSaving] = useState(false);
    const [lots, setLots] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [errors, setErrors] = useState({});
    const selectedYear = JSON.parse(localStorage.getItem("selectedYear") || "{}");

    const [yarnSuggestions, setYarnSuggestions] = useState([]);
    const [activeRowIdx, setActiveRowIdx] = useState(null);
    const [yarnSuggIdx, setYarnSuggIdx] = useState(-1);
    const yarnRef = useRef(null);

    const [fabricSuggestions, setFabricSuggestions] = useState([]);
    const [activeFabricRowIdx, setActiveFabricRowIdx] = useState(null);
    const [fabricSuggIdx, setFabricSuggIdx] = useState(-1);
    const fabricRef = useRef(null);

    const [supplierSuggestions, setSupplierSuggestions] = useState([]);
    const [supplierSuggIdx, setSupplierSuggIdx] = useState(-1);
    const supplierRef = useRef(null);

    const [shipToSuggestions, setShipToSuggestions] = useState([]);
    const [shipToSuggIdx, setShipToSuggIdx] = useState(-1);
    const shipToRef = useRef(null);


    const fetchInitial = useCallback(async () => {
        try {
            const [noRes, lotRes, empRes] = await Promise.all([
                axios.get(`${API}/yarn-dyeing-outward/next-no/lot`),
                axios.get(`${API}/yarn-dyeing-outward/lots`),
                axios.get(`${API}/employees`),
            ]);
            setOutwardNo(noRes.data.outward_no);
            setLots(lotRes.data || []);
            setEmployees(empRes.data || []);
        } catch { setOutwardNo("YD-LOT-0001"); }
    }, []);

    useEffect(() => {
        fetchInitial();
        const handler = (e) => {
            if (yarnRef.current && !yarnRef.current.contains(e.target)) { setYarnSuggestions([]); setActiveRowIdx(null); }
            if (fabricRef.current && !fabricRef.current.contains(e.target)) { setFabricSuggestions([]); setActiveFabricRowIdx(null); }
            if (supplierRef.current && !supplierRef.current.contains(e.target)) setSupplierSuggestions([]);
            if (shipToRef.current && !shipToRef.current.contains(e.target)) setShipToSuggestions([]);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [fetchInitial]);

    const handleLotSelect = (e) => {
        const val = e.target.value;
        const found = lots.find(l => l.lot_no === val);
        setForm(prev => ({ ...prev, lot_no: val, lot_name: found ? (found.lot_name || "") : "" }));
        setErrors(prev => ({ ...prev, lot_no: "" }));
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
        rows[index] = { ...rows[index], [name]: value };
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
            if (value.length >= 1) {
                axios.get(`${API}/fabrics?term=${encodeURIComponent(value)}`)
                    .then(r => setFabricSuggestions(r.data.filter(f => f.fabric_name.toLowerCase().includes(value.toLowerCase())))).catch(() => setFabricSuggestions([]));
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
        const rows = [...form.rows];
        rows[index] = { ...rows[index], fabric_name: fabric.fabric_name };
        setForm(prev => ({ ...prev, rows }));
        setFabricSuggestions([]); setActiveFabricRowIdx(null);
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

    const totalQty = form.rows.reduce((s, r) => s + (parseFloat(r.qty) || 0), 0);
    const dispTotal = totalQty.toFixed(3);

    const validate = () => {
        const e = {};
        if (!form.lot_no) e.lot_no = "Lot No. is required";
        if (!form.party_name.trim()) e.party_name = "Party / Supplier is required";
        if (form.rows.some(r => !r.yarn_name.trim())) e.rows = "All rows must have a Name";
        if (form.process === "Knitting" && form.rows.some(r => !r.fabric_name.trim())) e.rows = (e.rows ? e.rows + " and " : "") + "Fabric Name is required";
        if (form.rows.some(r => !r.qty)) e.rows = (e.rows ? e.rows + " and " : "") + "Qty is required";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) { toast("Please fix the highlighted fields before saving.", "warning"); return; }

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
                outward_type: "lot", ...form,
                total_qty: totalQty, items: form.rows,
                year_id: selectedYear.year_id
            });
            toast(`Saved! Outward No: ${res.data.outward_no}`, "success");
            setTimeout(() => navigate("/garments"), 1500);
        } catch (err) {
            toast(err.response?.data?.error || "Failed to save. Please try again.", "danger");
        } finally { setSaving(false); }
    };

    return (
        <div className="container-fluid mt-3 mb-5 px-3 px-md-4">
            <Toast toasts={toasts} remove={remove} />

            <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom">
                <button className="btn btn-outline-secondary btn-sm rounded-pill px-3" onClick={() => navigate("/lot-jobwork-yarn-to-fabric-list")}>
                    <i className="bi bi-arrow-left me-1"></i>Back
                </button>
                <div className="d-flex align-items-center gap-4">
                    <div>
                        <div className="d-flex align-items-center gap-2">
                            <span className="badge bg-dark rounded-pill px-3" style={{ fontSize: "0.7rem", letterSpacing: "0.06em" }}>LOT JOBWORK</span>
                            <span className="badge bg-primary-subtle text-primary rounded-pill px-3" style={{ fontSize: "0.7rem" }}>{form.process}</span>
                        </div>
                        <h4 className="fw-bold mb-0 mt-1 text-dark">
                            <i className="bi bi-box-arrow-up-right me-2 text-primary"></i>Yarn to Fabric Outward
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
                        <div className="col-md-2">
                            <label className="form-label fw-semibold text-muted" style={{ fontSize: "0.8rem" }}>LOT NO <span className="text-danger">*</span></label>
                            <select className={`form-select ${errors.lot_no ? "is-invalid" : ""}`} name="lot_no" value={form.lot_no} onChange={handleLotSelect}>
                                <option value="">— Select Lot —</option>
                                {lots.map((l, i) => <option key={i} value={l.lot_no}>{l.lot_no}</option>)}
                                {lots.length === 0 && <option disabled>No lots found</option>}
                            </select>
                            {errors.lot_no && <div className="invalid-feedback">{errors.lot_no}</div>}
                        </div>
                        <div className="col-md-2">
                            <label className="form-label fw-semibold text-muted" style={{ fontSize: "0.8rem" }}>LOT NAME</label>
                            <input type="text" className="form-control bg-light" name="lot_name" value={form.lot_name}
                                readOnly={!!form.lot_no} onChange={handleHeader} placeholder="Auto-filled from lot" />
                        </div>
                        <div className="col-md-2">
                            <label className="form-label fw-semibold text-muted" style={{ fontSize: "0.8rem" }}>REF. / DC NO.</label>
                            <input type="text" className="form-control" name="ref_no" value={form.ref_no} onChange={handleHeader} placeholder="DC / Challan" />
                        </div>
                        <div className="col-md-2">
                            <label className="form-label fw-semibold text-muted" style={{ fontSize: "0.8rem" }}>TOTAL QTY (KG)</label>
                            <input className="form-control fw-bold text-center bg-light" readOnly value={dispTotal} style={{ color: "#1d4ed8" }} />
                        </div>
                        <div className="col-md-2">
                            <label className="form-label fw-semibold text-muted" style={{ fontSize: "0.8rem" }}>PROCESS</label>
                            <select className="form-select fw-semibold text-success" name="process" value={form.process} onChange={handleHeader} style={{ fontSize: "0.82rem" }}>
                                <option value="Yarn Dyeing">Yarn Dyeing</option>
                                <option value="Knitting">Knitting</option>
                            </select>
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

                    {/* Staff Section */}
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

                    {/* Yarn Items */}
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <h6 className="fw-bold mb-0 text-dark"><i className="bi bi-table me-2 text-primary"></i>Yarn Items</h6>
                        <button className="btn btn-primary btn-sm rounded-pill px-3" onClick={addRow}>
                            <i className="bi bi-plus-lg me-1"></i>Add Row
                        </button>
                    </div>
                    {errors.rows && <div className="alert alert-warning py-1 px-3 small mb-2 rounded-3"><i className="bi bi-exclamation-triangle me-1"></i>{errors.rows}</div>}

                    <div className="table-responsive rounded-3 border" ref={yarnRef}>
                        <table className="table table-hover table-bordered align-middle mb-0">
                            <thead className="table-dark">
                                <tr>
                                    <th style={{ width: "25%" }}>YARN NAME</th>
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
                                                        onKeyDown={(e) => handleFabricKeyDown(e, idx)}
                                                        placeholder="Search fabric..." autoComplete="off" />
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
                                                <td><input type="text" className="form-control form-control-sm text-center" name="gsm" value={row.gsm} onChange={(e) => handleRowChange(idx, e)} placeholder="GSM" /></td>
                                                <td><input type="text" className="form-control form-control-sm text-center" name="dia" value={row.dia} onChange={(e) => handleRowChange(idx, e)} placeholder="DIA" /></td>
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
                        <button className="btn btn-secondary rounded-pill px-4" onClick={() => navigate("/lot-jobwork-yarn-to-fabric-list")}>
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
        </div>
    );
}
