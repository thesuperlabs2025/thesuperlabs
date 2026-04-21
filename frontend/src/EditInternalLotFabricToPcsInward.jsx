import Loader from "./Loader";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

const API = process.env.REACT_APP_API_URL;

export default function EditInternalLotFabricToPcsInward() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [lots, setLots] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [processes, setProcesses] = useState([]);
    const [fabrics, setFabrics] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);

    const initialRow = () => ({ counts: "", fabric_name: "", gsm: "", dia: "", color: "", qty: "" });

    const [form, setForm] = useState({
        inward_no: "",
        inward_type: "internal",
        inward_date: new Date().toISOString().substring(0, 10),
        ref_no: "",
        internal_lot_no: "",
        internal_lot_name: "",
        party_name: "",
        ship_to: "",
        process: "",
        remarks: "",
        staff_name: "",
        staff_remarks: "",
        total_qty: 0,
        rows: [initialRow()]
    });

    const [sugg, setSugg] = useState({ fabric: [], supplier: [], ship_to: [] });
    const [suggIdx, setSuggIdx] = useState(-1);
    const [activeField, setActiveField] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [recRes, lotRes, empRes, procRes, fabRes, supRes] = await Promise.all([
                    axios.get(`${API}/fabric-to-pcs-inward/${id}`),
                    axios.get(`${API}/yarn-dyeing-outward/internal-lots`),
                    axios.get(`${API}/employees`),
                    axios.get(`${API}/life-cycles`),
                    axios.get(`${API}/fabrics`),
                    axios.get(`${API}/supplier/supplier`)
                ]);

                const rec = recRes.data;
                setLots(lotRes.data || []);
                setEmployees(empRes.data || []);
                setProcesses((procRes.data || []).filter(p => p.process_type?.toLowerCase() === "fabric" || p.process_name?.toLowerCase() === "cutting"));
                setFabrics(fabRes.data || []);
                setSuppliers(supRes.data || []);

                setForm({
                    ...rec,
                    inward_date: rec.inward_date ? new Date(rec.inward_date).toISOString().substring(0, 10) : "",
                    rows: (rec.items && rec.items.length) ? rec.items.map(it => ({
                        counts: it.counts || "",
                        fabric_name: it.fabric_name || "",
                        gsm: it.gsm || "",
                        dia: it.dia || "",
                        color: it.color || "",
                        qty: it.qty || ""
                    })) : [initialRow()],
                });
            } catch (err) {
                toast.error("Failed to fetch record");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleHeader = (e) => {
        const { name, value } = e.target;
        setForm(prev => {
            const next = { ...prev, [name]: value };
            if (name === "internal_lot_no") {
                const found = lots.find(o => o.internal_lot_no === value);
                next.internal_lot_name = found ? found.internal_lot_name : "";
            }
            return next;
        });
    };

    const handleRowChange = (idx, e) => {
        const { name, value } = e.target;
        const newRows = [...form.rows];
        newRows[idx][name] = value;
        setForm(prev => ({ ...prev, rows: newRows }));

        if (name === "fabric_name") {
            if (value.length > 0) {
                const filtered = fabrics.filter(f => f.fabric_name.toLowerCase().includes(value.toLowerCase())).slice(0, 10);
                setSugg(p => ({ ...p, fabric: filtered }));
                setActiveField({ type: "fabric", index: idx });
                setSuggIdx(0);
            } else {
                setSugg(p => ({ ...p, fabric: [] }));
                setActiveField(null);
            }
        }
    };

    const handleFabricSelect = (idx, fabricName) => {
        const newRows = [...form.rows];
        newRows[idx].fabric_name = fabricName;
        const fab = fabrics.find(f => f.fabric_name === fabricName);
        if (fab) {
            newRows[idx].gsm = fab.gsm || newRows[idx].gsm;
            newRows[idx].dia = fab.dia || newRows[idx].dia;
        }
        setForm(prev => ({ ...prev, rows: newRows }));
        setSugg(p => ({ ...p, fabric: [] }));
        setActiveField(null);
    };

    const handleSupplierSearch = (e) => {
        const val = e.target.value;
        setForm(prev => ({ ...prev, party_name: val }));
        if (val.length > 0) {
            const filtered = suppliers.filter(s => s.supplier_name.toLowerCase().includes(val.toLowerCase())).slice(0, 10);
            setSugg(p => ({ ...p, supplier: filtered }));
            setActiveField({ type: "supplier" });
            setSuggIdx(0);
        } else {
            setSugg(p => ({ ...p, supplier: [] }));
            setActiveField(null);
        }
    };

    const handleSupplierSelect = (name) => {
        setForm(prev => ({ ...prev, party_name: name }));
        setSugg(p => ({ ...p, supplier: [] }));
        setActiveField(null);
    };

    const handleShipToSearch = (e) => {
        const val = e.target.value;
        setForm(prev => ({ ...prev, ship_to: val }));
        if (val.length > 0) {
            const filtered = suppliers.filter(s => s.supplier_name.toLowerCase().includes(val.toLowerCase())).slice(0, 10);
            setSugg(p => ({ ...p, ship_to: filtered }));
            setActiveField({ type: "ship_to" });
            setSuggIdx(0);
        } else {
            setSugg(p => ({ ...p, ship_to: [] }));
            setActiveField(null);
        }
    };

    const handleShipToSelect = (name) => {
        setForm(prev => ({ ...prev, ship_to: name }));
        setSugg(p => ({ ...p, ship_to: [] }));
        setActiveField(null);
    };

    const handleKeyDown = (e) => {
        if (!activeField) return;
        const list = activeField.type === "fabric" ? sugg.fabric : activeField.type === "ship_to" ? sugg.ship_to : sugg.supplier;
        if (!list.length) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setSuggIdx(p => (p < list.length - 1 ? p + 1 : 0));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setSuggIdx(p => (p > 0 ? p - 1 : list.length - 1));
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (activeField.type === "fabric") {
                handleFabricSelect(activeField.index, list[suggIdx].fabric_name);
            } else if (activeField.type === "ship_to") {
                handleShipToSelect(list[suggIdx].supplier_name);
            } else {
                handleSupplierSelect(list[suggIdx].supplier_name);
            }
        } else if (e.key === "Escape") {
            setSugg({ fabric: [], supplier: [], ship_to: [] });
            setActiveField(null);
        }
    };

    const addRow = () => setForm(prev => ({ ...prev, rows: [...prev.rows, initialRow()] }));
    const removeRow = (idx) => {
        if (form.rows.length === 1) return;
        setForm(prev => ({ ...prev, rows: prev.rows.filter((_, i) => i !== idx) }));
    };

    useEffect(() => {
        const totalQty = form.rows.reduce((sum, row) => sum + (parseFloat(row.qty) || 0), 0);
        setForm(prev => ({ ...prev, total_qty: totalQty.toFixed(3) }));
    }, [form.rows]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.party_name || !form.internal_lot_no) return toast.warning("Please fill required fields");
        try {
            await axios.put(`${API}/fabric-to-pcs-inward/${id}`, { ...form, items: form.rows });
            toast.success("Internal Lot Inward updated successfully");
            navigate("/internal-lot-fabric-to-pcs-inward-list");
        } catch (err) {
            toast.error(err.response?.data?.error || "Update failed");
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="container-fluid py-4 min-vh-100 bg-light" style={{ fontFamily: "'Inter', sans-serif" }}>
            <div className="card border-0 shadow-sm rounded-4 mx-auto" style={{ maxWidth: "1200px" }}>
                <div className="card-header bg-white border-0 py-3 px-4 d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-3">
                        <button className="btn btn-outline-secondary btn-sm rounded-pill px-3" onClick={() => navigate(-1)}>
                            <i className="bi bi-arrow-left"></i>
                        </button>
                        <div>
                            <h5 className="fw-bold mb-0 text-success">Edit Internal Lot Fabric Inward</h5>
                            <small className="text-muted">Inward No: <span className="fw-bold text-dark">{form.inward_no}</span></small>
                        </div>
                    </div>
                    <span className="badge bg-success bg-opacity-10 text-success px-3 py-2 rounded-pill">INTERNAL LOT</span>
                </div>

                <div className="card-body p-4">
                    <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
                        {/* Header Fields */}
                        <div className="row g-3 mb-4 p-3 bg-light rounded-4 border mx-0">
                            <div className="col-md-3">
                                <label className="form-label small fw-bold text-muted">INWARD DATE</label>
                                <input type="date" className="form-control border-0 shadow-sm" name="inward_date" value={form.inward_date} onChange={handleHeader} required />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small fw-bold text-muted">INT. LOT NO.</label>
                                <select className="form-select border-0 shadow-sm" name="internal_lot_no" value={form.internal_lot_no} onChange={handleHeader} required>
                                    <option value="">Select Internal Lot</option>
                                    {lots.map((o, i) => <option key={i} value={o.internal_lot_no}>{o.internal_lot_no}</option>)}
                                </select>
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small fw-bold text-muted">INT. LOT NAME</label>
                                <input type="text" className="form-control border-0 shadow-sm bg-white" value={form.internal_lot_name} readOnly placeholder="Auto-filled" />
                            </div>
                            <div className="col-md-3 position-relative">
                                <label className="form-label small fw-bold text-muted">PARTY NAME (SUPPLIER)</label>
                                <input type="text" className="form-control border-0 shadow-sm" value={form.party_name} onChange={handleSupplierSearch} placeholder="Search supplier..." required autoComplete="off" />
                                {activeField?.type === 'supplier' && sugg.supplier.length > 0 && (
                                    <ul className="list-group position-absolute w-100 shadow-lg z-3 mt-1 rounded-3">
                                        {sugg.supplier.map((s, i) => (
                                            <li key={i} className={`list-group-item list-group-item-action small py-2 ${suggIdx === i ? "active" : ""}`} onClick={() => handleSupplierSelect(s.supplier_name)} style={{ cursor: "pointer" }}>
                                                {s.supplier_name}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            <div className="col-md-3 position-relative">
                                <label className="form-label small fw-bold text-muted">SHIP TO</label>
                                <input type="text" className="form-control border-0 shadow-sm" value={form.ship_to} onChange={handleShipToSearch} placeholder="Search supplier..." autoComplete="off" />
                                {activeField?.type === 'ship_to' && sugg.ship_to.length > 0 && (
                                    <ul className="list-group position-absolute w-100 shadow-lg z-3 mt-1 rounded-3">
                                        {sugg.ship_to.map((s, i) => (
                                            <li key={i} className={`list-group-item list-group-item-action small py-2 ${suggIdx === i ? "active" : ""}`} onClick={() => handleShipToSelect(s.supplier_name)} style={{ cursor: "pointer" }}>
                                                {s.supplier_name}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            <div className="col-md-3 mt-3">
                                <label className="form-label small fw-bold text-muted">PROCESS</label>
                                <select className="form-select border-0 shadow-sm fw-semibold text-success" name="process" value={form.process} onChange={handleHeader}>
                                    <option value="">Select Process</option>
                                    {processes.map((p, i) => <option key={i} value={p.process_name}>{p.process_name}</option>)}
                                </select>
                            </div>
                            <div className="col-md-3 mt-3">
                                <label className="form-label small fw-bold text-muted">SUPPLIER DC NO.</label>
                                <input type="text" className="form-control border-0 shadow-sm" name="ref_no" value={form.ref_no} onChange={handleHeader} placeholder="Enter ref no" />
                            </div>
                            <div className="col-md-3 mt-3">
                                <label className="form-label small fw-bold text-muted">RECEIVER NAME</label>
                                <select className="form-select border-0 shadow-sm" name="staff_name" value={form.staff_name} onChange={handleHeader}>
                                    <option value="">Select Employee</option>
                                    {employees.map((e, i) => <option key={i} value={e.employee_name}>{e.employee_name}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Items Table */}
                        <div className="table-responsive mb-4 rounded-4 border overflow-hidden">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-light border-bottom">
                                    <tr style={{ fontSize: "0.75rem" }}>
                                        <th className="text-center" style={{ width: "40px" }}>#</th>
                                        <th style={{ width: "120px" }}>COUNTS</th>
                                        <th>FABRIC NAME</th>
                                        <th style={{ width: "90px" }}>GSM</th>
                                        <th style={{ width: "80px" }}>DIA</th>
                                        <th style={{ width: "140px" }}>COLOR</th>
                                        <th style={{ width: "120px" }}>QTY (KG)</th>
                                        <th className="text-center" style={{ width: "50px" }}>DEL</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {form.rows.map((row, idx) => (
                                        <tr key={idx}>
                                            <td className="text-center text-muted fw-bold small">{idx + 1}</td>
                                            <td><input type="text" className="form-control form-control-sm border-0 bg-light" name="counts" value={row.counts} onChange={(e) => handleRowChange(idx, e)} placeholder="Counts" /></td>
                                            <td className="position-relative">
                                                <input type="text" className="form-control form-control-sm border-0 bg-light fw-semibold" name="fabric_name" value={row.fabric_name} onChange={(e) => handleRowChange(idx, e)} placeholder="Search fabric..." autoComplete="off" />
                                                {activeField?.type === 'fabric' && activeField?.index === idx && sugg.fabric.length > 0 && (
                                                    <ul className="list-group position-absolute w-100 shadow-lg z-3 mt-1 rounded-3">
                                                        {sugg.fabric.map((f, i) => (
                                                            <li key={i} className={`list-group-item list-group-item-action small py-2 ${suggIdx === i ? "active" : ""}`} onClick={() => handleFabricSelect(idx, f.fabric_name)} style={{ cursor: "pointer" }}>
                                                                {f.fabric_name}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </td>
                                            <td><input type="text" className="form-control form-control-sm border-0 bg-light" name="gsm" value={row.gsm} onChange={(e) => handleRowChange(idx, e)} placeholder="GSM" /></td>
                                            <td><input type="text" className="form-control form-control-sm border-0 bg-light" name="dia" value={row.dia} onChange={(e) => handleRowChange(idx, e)} placeholder="DIA" /></td>
                                            <td><input type="text" className="form-control form-control-sm border-0 bg-light" name="color" value={row.color} onChange={(e) => handleRowChange(idx, e)} placeholder="Color" /></td>
                                            <td><input type="number" step="0.001" className="form-control form-control-sm border-0 bg-light text-primary fw-bold" name="qty" value={row.qty} onChange={(e) => handleRowChange(idx, e)} placeholder="0.000" /></td>
                                            <td className="text-center">
                                                <button type="button" className="btn btn-link text-danger p-0 shadow-none" onClick={() => removeRow(idx)}>
                                                    <i className="bi bi-trash-fill"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <button type="button" className="btn btn-dark btn-sm rounded-pill px-4 fw-bold shadow-sm" onClick={addRow}>
                                <i className="bi bi-plus-lg me-2"></i>ADD NEW ROW
                            </button>
                            <div className="d-flex gap-4">
                                <div className="text-end">
                                    <small className="text-muted d-block fw-bold" style={{ fontSize: "0.65rem" }}>TOTAL QUANTITY</small>
                                    <span className="fs-5 fw-bold text-primary">{form.total_qty} <small className="text-muted">KG</small></span>
                                </div>
                            </div>
                        </div>

                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label small fw-bold text-muted">REMARKS</label>
                                <textarea className="form-control border-0 bg-light rounded-4" rows="2" name="remarks" value={form.remarks} onChange={handleHeader} placeholder="Internal remarks..."></textarea>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label small fw-bold text-muted">STAFF REMARKS</label>
                                <textarea className="form-control border-0 bg-light rounded-4" rows="2" name="staff_remarks" value={form.staff_remarks} onChange={handleHeader} placeholder="Staff notes..."></textarea>
                            </div>
                        </div>

                        <div className="mt-5 d-flex gap-3 justify-content-end">
                            <button type="button" className="btn btn-light rounded-pill px-5 fw-bold text-muted" onClick={() => navigate(-1)}>CANCEL</button>
                            <button type="submit" className="btn btn-success rounded-pill px-5 fw-bold shadow-lg">UPDATE INWARD RECORD</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
