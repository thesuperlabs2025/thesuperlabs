import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const API = process.env.REACT_APP_API_URL;

const TYPE_CONFIG = {
    "order": {
        label: "Order Jobworks",
        color: "#6366f1",
        badge: "ORDER",
        backPath: "/garments",
    },
    "lot": {
        label: "Lot Jobwork",
        color: "#3b82f6",
        badge: "LOT",
        backPath: "/garments",
    },
    "internal": {
        label: "Internal Lot",
        color: "#10b981",
        badge: "INTERNAL",
        backPath: "/garments",
    },
};

const initialRow = () => ({
    yarn_name: "",
    counts: "",
    color: "",
    qty: "",
});

const today = new Date().toISOString().substring(0, 10);

const getInitialForm = () => ({
    outward_no: "",
    outward_date: today,
    party_name: "",
    reference_no: "",
    remarks: "",
    rows: [initialRow()],
});

function YarnDyeingOutwardForm() {
    const navigate = useNavigate();
    const { type } = useParams(); // "order" | "lot" | "internal"

    const config = TYPE_CONFIG[type] || TYPE_CONFIG["order"];

    const [form, setForm] = useState(getInitialForm());
    const [saving, setSaving] = useState(false);
    const [outwardNo, setOutwardNo] = useState("YD-OUT-001");

    // Auto-generate outward number (simple client-side placeholder)
    useEffect(() => {
        const prefix =
            type === "order" ? "YD-ORD" :
                type === "lot" ? "YD-LOT" :
                    "YD-INT";
        const rand = String(Math.floor(Math.random() * 9000) + 1000);
        setOutwardNo(`${prefix}-${rand}`);
        setForm(f => ({ ...f, outward_no: `${prefix}-${rand}` }));
    }, [type]);

    // --- Header ---
    const handleHeader = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    // --- Rows ---
    const handleRowChange = (index, e) => {
        const { name, value } = e.target;
        const rows = [...form.rows];
        rows[index] = { ...rows[index], [name]: value };
        setForm(prev => ({ ...prev, rows }));
    };

    const addRow = () => {
        setForm(prev => ({ ...prev, rows: [...prev.rows, initialRow()] }));
    };

    const removeRow = (index) => {
        if (form.rows.length === 1) return;
        setForm(prev => ({ ...prev, rows: prev.rows.filter((_, i) => i !== index) }));
    };

    const totalQty = form.rows.reduce((sum, r) => sum + (parseFloat(r.qty) || 0), 0);

    // --- Save ---
    const handleSave = async () => {
        if (!form.party_name.trim()) {
            alert("Party Name is required.");
            return;
        }
        const emptyRow = form.rows.find(r => !r.yarn_name.trim() || !r.qty);
        if (emptyRow) {
            alert("All rows must have at least Yarn Name and Qty.");
            return;
        }
        setSaving(true);
        try {
            const payload = {
                type,
                ...form,
                total_qty: totalQty,
            };
            await fetch(`${API}/yarn-dyeing-outward`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            alert("Yarn Dyeing Outward saved successfully!");
            navigate(config.backPath);
        } catch (err) {
            console.error(err);
            alert("Failed to save. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        setForm(f => ({ ...getInitialForm(), outward_no: f.outward_no }));
    };

    return (
        <div className="container-fluid mt-3 mb-5 px-3 px-md-4">
            {/* Page Header */}
            <div
                className="rounded-4 mb-4 p-4 text-white position-relative overflow-hidden"
                style={{
                    background: `linear-gradient(135deg, ${config.color}, ${config.color}cc)`,
                    boxShadow: `0 8px 32px ${config.color}44`,
                }}
            >
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                    <div>
                        <div className="d-flex align-items-center gap-2 mb-1">
                            <button
                                className="btn btn-sm btn-light opacity-80 rounded-pill px-3"
                                onClick={() => navigate(config.backPath)}
                                style={{ fontSize: "0.78rem" }}
                            >
                                <i className="bi bi-arrow-left me-1"></i>Back
                            </button>
                            <span
                                className="badge rounded-pill"
                                style={{ background: "rgba(255,255,255,0.25)", fontSize: "0.68rem", letterSpacing: "0.08em" }}
                            >
                                {config.badge}
                            </span>
                        </div>
                        <h4 className="fw-bold mb-0" style={{ letterSpacing: "-0.02em" }}>
                            <i className="bi bi-box-arrow-up-right me-2"></i>
                            Yarn Dyeing Outward
                        </h4>
                        <p className="mb-0 opacity-75" style={{ fontSize: "0.85rem" }}>
                            {config.label} &mdash; Yarn Dyeing Process
                        </p>
                    </div>
                    <div className="text-end">
                        <div className="fw-bold fs-5" style={{ letterSpacing: "0.04em" }}>{outwardNo}</div>
                        <div className="opacity-75" style={{ fontSize: "0.8rem" }}>Outward No.</div>
                    </div>
                </div>
                {/* Decorative circle */}
                <div style={{
                    position: "absolute", right: "-40px", top: "-40px",
                    width: "160px", height: "160px", borderRadius: "50%",
                    background: "rgba(255,255,255,0.08)"
                }} />
            </div>

            {/* Form Card */}
            <div className="card border-0 shadow-sm rounded-4">
                <div className="card-body p-4">

                    {/* Header Fields */}
                    <div className="row g-3 mb-4">
                        <div className="col-md-3">
                            <label className="form-label fw-semibold text-muted" style={{ fontSize: "0.8rem" }}>
                                OUTWARD DATE
                            </label>
                            <input
                                type="date"
                                className="form-control rounded-3"
                                name="outward_date"
                                value={form.outward_date}
                                onChange={handleHeader}
                            />
                        </div>
                        <div className="col-md-4">
                            <label className="form-label fw-semibold text-muted" style={{ fontSize: "0.8rem" }}>
                                PARTY NAME <span className="text-danger">*</span>
                            </label>
                            <input
                                type="text"
                                className="form-control rounded-3"
                                name="party_name"
                                value={form.party_name}
                                onChange={handleHeader}
                                placeholder="Enter party / dyeing unit name"
                            />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label fw-semibold text-muted" style={{ fontSize: "0.8rem" }}>
                                REFERENCE NO.
                            </label>
                            <input
                                type="text"
                                className="form-control rounded-3"
                                name="reference_no"
                                value={form.reference_no}
                                onChange={handleHeader}
                                placeholder="DC / Challan No."
                            />
                        </div>
                        <div className="col-md-2">
                            <label className="form-label fw-semibold text-muted" style={{ fontSize: "0.8rem" }}>
                                TOTAL QTY
                            </label>
                            <input
                                type="text"
                                className="form-control rounded-3 bg-light fw-bold text-center"
                                readOnly
                                value={totalQty % 1 === 0 ? totalQty : totalQty.toFixed(2)}
                                style={{ color: config.color }}
                            />
                        </div>
                        <div className="col-12">
                            <label className="form-label fw-semibold text-muted" style={{ fontSize: "0.8rem" }}>
                                REMARKS
                            </label>
                            <textarea
                                className="form-control rounded-3"
                                name="remarks"
                                rows="2"
                                value={form.remarks}
                                onChange={handleHeader}
                                placeholder="Optional remarks..."
                            />
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="d-flex align-items-center justify-content-between mb-3">
                        <h6 className="fw-bold mb-0" style={{ color: config.color }}>
                            <i className="bi bi-table me-2"></i>Yarn Items
                        </h6>
                        <button
                            className="btn btn-sm rounded-pill px-3"
                            style={{
                                background: `${config.color}15`,
                                color: config.color,
                                border: `1px solid ${config.color}33`,
                                fontWeight: 600,
                                fontSize: "0.82rem"
                            }}
                            onClick={addRow}
                        >
                            <i className="bi bi-plus-lg me-1"></i>Add Row
                        </button>
                    </div>

                    <div className="table-responsive rounded-3" style={{ border: `1px solid ${config.color}22` }}>
                        <table className="table table-hover align-middle mb-0">
                            <thead>
                                <tr style={{ background: `${config.color}10` }}>
                                    <th
                                        className="text-center fw-semibold"
                                        style={{ width: "5%", fontSize: "0.78rem", color: config.color, padding: "12px 8px" }}
                                    >
                                        #
                                    </th>
                                    <th
                                        className="fw-semibold"
                                        style={{ width: "32%", fontSize: "0.78rem", color: config.color, padding: "12px 8px" }}
                                    >
                                        YARN NAME
                                    </th>
                                    <th
                                        className="fw-semibold"
                                        style={{ width: "20%", fontSize: "0.78rem", color: config.color, padding: "12px 8px" }}
                                    >
                                        COUNTS
                                    </th>
                                    <th
                                        className="fw-semibold"
                                        style={{ width: "20%", fontSize: "0.78rem", color: config.color, padding: "12px 8px" }}
                                    >
                                        COLOR
                                    </th>
                                    <th
                                        className="fw-semibold"
                                        style={{ width: "16%", fontSize: "0.78rem", color: config.color, padding: "12px 8px" }}
                                    >
                                        QTY (KG)
                                    </th>
                                    <th
                                        className="text-center fw-semibold"
                                        style={{ width: "7%", fontSize: "0.78rem", color: config.color, padding: "12px 8px" }}
                                    >
                                        DEL
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {form.rows.map((row, index) => (
                                    <tr
                                        key={index}
                                        style={{ background: index % 2 === 0 ? "#fff" : `${config.color}05` }}
                                    >
                                        <td className="text-center text-muted fw-semibold" style={{ fontSize: "0.85rem" }}>
                                            {index + 1}
                                        </td>
                                        <td>
                                            <input
                                                type="text"
                                                className="form-control form-control-sm rounded-2"
                                                name="yarn_name"
                                                value={row.yarn_name}
                                                onChange={(e) => handleRowChange(index, e)}
                                                placeholder="e.g. Cotton Yarn"
                                                style={{ borderColor: `${config.color}33` }}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="text"
                                                className="form-control form-control-sm rounded-2"
                                                name="counts"
                                                value={row.counts}
                                                onChange={(e) => handleRowChange(index, e)}
                                                placeholder="e.g. 30/1, 40/2"
                                                style={{ borderColor: `${config.color}33` }}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="text"
                                                className="form-control form-control-sm rounded-2"
                                                name="color"
                                                value={row.color}
                                                onChange={(e) => handleRowChange(index, e)}
                                                placeholder="e.g. Navy Blue"
                                                style={{ borderColor: `${config.color}33` }}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                className="form-control form-control-sm rounded-2 text-center"
                                                name="qty"
                                                value={row.qty}
                                                onChange={(e) => handleRowChange(index, e)}
                                                placeholder="0"
                                                min="0"
                                                step="0.01"
                                                style={{ borderColor: `${config.color}33` }}
                                            />
                                        </td>
                                        <td className="text-center">
                                            <button
                                                className="btn btn-sm btn-outline-danger rounded-circle"
                                                style={{ width: "28px", height: "28px", padding: 0, lineHeight: 1 }}
                                                onClick={() => removeRow(index)}
                                                title="Remove row"
                                                disabled={form.rows.length === 1}
                                            >
                                                <i className="bi bi-x" style={{ fontSize: "0.9rem" }}></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            {/* Footer Total Row */}
                            <tfoot>
                                <tr style={{ background: `${config.color}10`, borderTop: `2px solid ${config.color}33` }}>
                                    <td colSpan={4} className="text-end fw-bold" style={{ fontSize: "0.85rem", color: config.color }}>
                                        Total Quantity:
                                    </td>
                                    <td className="fw-bold text-center" style={{ color: config.color, fontSize: "0.95rem" }}>
                                        {totalQty % 1 === 0 ? totalQty : totalQty.toFixed(2)}
                                    </td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* Add Row button (below table) */}
                    <div className="mt-2 mb-4">
                        <button
                            className="btn btn-sm rounded-pill px-4"
                            style={{
                                background: `${config.color}15`,
                                color: config.color,
                                border: `1px dashed ${config.color}55`,
                                fontWeight: 600,
                                fontSize: "0.82rem",
                                width: "100%",
                            }}
                            onClick={addRow}
                        >
                            <i className="bi bi-plus-circle me-2"></i>Add Another Row
                        </button>
                    </div>

                    {/* Action Buttons */}
                    <div className="d-flex justify-content-end gap-2 pt-3 border-top">
                        <button
                            className="btn btn-light rounded-pill px-4"
                            onClick={handleReset}
                        >
                            <i className="bi bi-arrow-counterclockwise me-1"></i>Reset
                        </button>
                        <button
                            className="btn btn-secondary rounded-pill px-4"
                            onClick={() => navigate(config.backPath)}
                        >
                            <i className="bi bi-x-lg me-1"></i>Cancel
                        </button>
                        <button
                            className="btn rounded-pill px-5 fw-semibold text-white"
                            style={{ background: config.color, boxShadow: `0 4px 12px ${config.color}55` }}
                            onClick={handleSave}
                            disabled={saving}
                        >
                            {saving
                                ? <><span className="spinner-border spinner-border-sm me-2" />Saving...</>
                                : <><i className="bi bi-check2-circle me-2"></i>Save Outward</>
                            }
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                .form-control:focus {
                    border-color: ${config.color}88 !important;
                    box-shadow: 0 0 0 3px ${config.color}20 !important;
                }
                .table-hover tbody tr:hover td {
                    background: ${config.color}08 !important;
                }
            `}</style>
        </div>
    );
}

export default YarnDyeingOutwardForm;
