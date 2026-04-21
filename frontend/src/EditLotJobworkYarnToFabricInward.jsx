import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const API = process.env.REACT_APP_API_URL;

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

const initialRow = () => ({ yarn_name: "", counts: "", color: "", fabric_name: "", gsm: "", dia: "", qty: "" });
const getForm = () => ({
    inward_date: "",
    lot_no: "", lot_name: "",
    party_name: "",
    process: "Yarn Dyeing",
    ref_no: "",
    staff_name: "",
    staff_remarks: "",
    remarks: "",
    rows: [initialRow()]
});

export default function EditLotJobworkYarnToFabricInward() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toasts, add: toast, remove } = useToast();
    const [form, setForm] = useState(getForm());
    const [inwardNo, setInwardNo] = useState("Loading...");
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [lots, setLots] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [errors, setErrors] = useState({});

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

    const fetchInitial = useCallback(async () => {
        try {
            const [lotRes, empRes] = await Promise.all([
                axios.get(`${API}/yarn-dyeing-inward/lots`),
                axios.get(`${API}/employees`),
            ]);
            setLots(lotRes.data);
            setEmployees(empRes.data);
        } catch { }
    }, []);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API}/yarn-dyeing-inward/${id}`);
            const data = res.data;
            setInwardNo(data.inward_no);
            setForm({
                inward_date: data.inward_date ? new Date(data.inward_date).toISOString().substring(0, 10) : "",
                lot_no: data.lot_no || "",
                lot_name: data.lot_name || "",
                party_name: data.party_name || "",
                process: data.process || "Yarn Dyeing",
                ref_no: data.ref_no || "",
                staff_name: data.staff_name || "",
                staff_remarks: data.staff_remarks || "",
                remarks: data.remarks || "",
                rows: data.items && data.items.length ? data.items.map(i => ({
                    yarn_name: i.yarn_name || "",
                    counts: i.counts || "",
                    color: i.color || "",
                    fabric_name: i.fabric_name || "",
                    gsm: i.gsm || "",
                    dia: i.dia || "",
                    qty: i.qty || ""
                })) : [initialRow()]
            });
        } catch (err) {
            toast("Failed to load record details", "danger");
            navigate("/lot-jobwork-yarn-to-fabric-inward-list");
        } finally { setLoading(false); }
    }, [id, navigate, toast]);

    useEffect(() => {
        fetchInitial().then(fetchData);
        const handler = (e) => {
            if (yarnRef.current && !yarnRef.current.contains(e.target)) { setYarnSuggestions([]); setActiveRowIdx(null); }
            if (fabricRef.current && !fabricRef.current.contains(e.target)) { setFabricSuggestions([]); setActiveFabricRowIdx(null); }
            if (supplierRef.current && !supplierRef.current.contains(e.target)) setSupplierSuggestions([]);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [fetchInitial, fetchData]);

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

    const handleRowChange = (index, e) => {
        const { name, value } = e.target;
        const rows = [...form.rows];
        rows[index] = { ...rows[index], [name]: value };
        setForm(prev => ({ ...prev, rows }));

        if (name === "yarn_name") {
            setActiveRowIdx(index); setYarnSuggIdx(-1);
            if (value.length >= 1) {
                axios.get(`${API}/yarn-dyeing-inward/yarn-search?term=${encodeURIComponent(value)}`)
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
    const dispTotal = totalQty % 1 === 0 ? totalQty : totalQty.toFixed(2);

    const validate = () => {
        const e = {};
        if (!form.lot_no) e.lot_no = "Lot No. is required";
        if (!form.party_name.trim()) e.party_name = "Party / Supplier is required";
        if (form.rows.some(r => !r.yarn_name.trim())) e.rows = "All rows must have a Yarn Name";
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
        setSaving(true);
        try {
            await axios.put(`${API}/yarn-dyeing-inward/${id}`, {
                ...form,
                total_qty: totalQty, items: form.rows,
            });
            toast("Updated successfully!", "success");
            setTimeout(() => navigate("/lot-jobwork-yarn-to-fabric-inward-list"), 1500);
        } catch (err) {
            toast(err.response?.data?.error || "Failed to update. Please try again.", "danger");
        } finally { setSaving(false); }
    };

    if (loading) return <div className="text-center py-5 mt-5"><span className="spinner-border text-success me-2"></span>Loading record...</div>;

    return (
        <div className="container-fluid mt-3 mb-5 px-3 px-md-4">
            <Toast toasts={toasts} remove={remove} />

            <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom">
                <button className="btn btn-outline-secondary btn-sm rounded-pill px-3" onClick={() => navigate("/lot-jobwork-yarn-to-fabric-inward-list")}>
                    <i className="bi bi-arrow-left me-1"></i>Back
                </button>
                <div>
                    <div className="d-flex align-items-center gap-2">
                        <span className="badge bg-dark rounded-pill px-3" style={{ fontSize: "0.7rem", letterSpacing: "0.06em" }}>LOT JOBWORKS</span>
                        <span className="badge bg-success-subtle text-success rounded-pill px-3" style={{ fontSize: "0.7rem" }}>{form.process}</span>
                    </div>
                    <h4 className="fw-bold mb-0 mt-1 text-dark">
                        <i className="bi bi-pencil-square me-2 text-success"></i>Edit Inward
                    </h4>
                </div>
                <div className="ms-auto text-end">
                    <div className="fw-bold text-success fs-5">{inwardNo}</div>
                    <small className="text-muted">Inward No.</small>
                </div>
            </div>

            <div className="card border-0 shadow-sm rounded-4">
                <div className="card-body p-4">
                    {/* Row 1 */}
                    <div className="row g-3 mb-3">
                        <div className="col-md-2">
                            <label className="form-label fw-semibold text-muted" style={{ fontSize: "0.8rem" }}>DATE</label>
                            <input type="date" className="form-control" name="inward_date" value={form.inward_date} onChange={handleHeader} />
                        </div>
                        <div className="col-md-2">
                            <label className="form-label fw-semibold text-muted" style={{ fontSize: "0.8rem" }}>LOT NO <span className="text-danger">*</span></label>
                            <select className={`form-select ${errors.lot_no ? "is-invalid" : ""}`} name="lot_no" value={form.lot_no} onChange={handleLotSelect}>
                                <option value="">— Select —</option>
                                {lots.map(l => <option key={l.id} value={l.lot_no}>{l.lot_no}</option>)}
                            </select>
                            {errors.lot_no && <div className="invalid-feedback">{errors.lot_no}</div>}
                        </div>
                        <div className="col-md-2">
                            <label className="form-label fw-semibold text-muted" style={{ fontSize: "0.8rem" }}>PROCESS</label>
                            <select className="form-select fw-semibold text-success" name="process" value={form.process} onChange={handleHeader} style={{ fontSize: "0.82rem" }}>
                                <option value="Yarn Dyeing">Yarn Dyeing</option>
                                <option value="Knitting">Knitting</option>
                            </select>
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
                            <input className="form-control fw-bold text-center bg-light" readOnly value={dispTotal} style={{ color: "#16a34a" }} />
                        </div>
                    </div>

                    {/* Row 2: Party + Remarks */}
                    <div className="row g-3 mb-4">
                        <div className="col-md-5 position-relative" ref={supplierRef}>
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
                        <div className="col-md-7">
                            <label className="form-label fw-semibold text-muted" style={{ fontSize: "0.8rem" }}>REMARKS</label>
                            <input type="text" className="form-control" name="remarks" value={form.remarks} onChange={handleHeader} placeholder="Optional remarks" />
                        </div>
                    </div>

                    {/* Staff Section */}
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

                    {/* Yarn Items Table */}
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <h6 className="fw-bold mb-0 text-dark"><i className="bi bi-table me-2 text-success"></i>Yarn Items (Received)</h6>
                        <button className="btn btn-success btn-sm rounded-pill px-3" onClick={addRow}>
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
                                            <th style={{ width: "15%" }}>FABRIC NAME</th>
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

                                        <td><input type="number" className="form-control form-control-sm text-center" name="qty" value={row.qty} onChange={(e) => handleRowChange(idx, e)} placeholder="0" min="0" step="0.01" /></td>
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
                                <tr style={{ background: "#166534", color: "#fff" }}>
                                    <td colSpan={form.process === "Knitting" ? 6 : 3} className="text-end fw-bold">Total Qty (KG):</td>
                                    <td className="text-center fw-bold text-warning">{dispTotal}</td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    <button className="btn btn-outline-success btn-sm rounded-pill w-100 mt-2 mb-4" style={{ borderStyle: "dashed" }} onClick={addRow}>
                        <i className="bi bi-plus-circle me-2"></i>Add Another Row
                    </button>

                    <div className="d-flex justify-content-end gap-2 pt-3 border-top">
                        <button className="btn btn-secondary rounded-pill px-4" onClick={() => navigate("/lot-jobwork-yarn-to-fabric-inward-list")}>
                            <i className="bi bi-x-lg me-1"></i>Cancel
                        </button>
                        <button className="btn btn-success rounded-pill px-5 fw-semibold" onClick={handleSave} disabled={saving}>
                            {saving ? <><span className="spinner-border spinner-border-sm me-2" />Updating...</> : <><i className="bi bi-check2-circle me-2"></i>Update Inward</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
