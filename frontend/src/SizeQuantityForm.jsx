import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Select from "react-select";
import { useNavigate } from "react-router-dom";

const API = process.env.REACT_APP_API_URL;

const SizeQuantityForm = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Masters
    const [sizeCharts, setSizeCharts] = useState([]);
    const [stylesList, setStylesList] = useState([]);
    const [colorsList, setColorsList] = useState([]);

    // Header State
    const [header, setHeader] = useState({
        size_chart_id: null,
        size_chart_name: "",
        total_qty: 0,
        excess_pct: 0,
        final_qty: 0
    });

    const [selectedSizeChart, setSelectedSizeChart] = useState(null);
    const [currentSizes, setCurrentSizes] = useState([]);

    // Input Box State
    const [inputRow, setInputRow] = useState({
        style_name: "",
        color: "",
        pcs_qty: 0
    });

    const [selectedStyle, setSelectedStyle] = useState(null);
    const [selectedColor, setSelectedColor] = useState(null);

    // Table State
    const [rows, setRows] = useState([]);
    const [ratios, setRatios] = useState({}); // Tracking ratios per size

    const distributeRow = (row, currentRatios) => {
        const totalRatio = Object.values(currentRatios).reduce((s, v) => s + (parseFloat(v) || 0), 0);
        if (totalRatio <= 0) return row;

        const newSizesData = { ...row.sizes_data };
        currentSizes.forEach(s => {
            const sizeRatio = parseFloat(currentRatios[s.size_value]) || 0;
            newSizesData[s.size_value] = Math.round(row.pcs_qty * (sizeRatio / totalRatio));
        });

        // Adjust last size to match total exactly due to rounding
        const currentSum = Object.values(newSizesData).reduce((s, v) => s + v, 0);
        if (currentSum !== row.pcs_qty && currentSizes.length > 0) {
            const lastSize = currentSizes[currentSizes.length - 1].size_value;
            newSizesData[lastSize] += (row.pcs_qty - currentSum);
        }

        return { ...row, sizes_data: newSizesData };
    };

    const fetchData = useCallback(async () => {
        try {
            const [sc, styles, colors] = await Promise.all([
                axios.get(`${API}/size-charts`),
                axios.get(`${API}/style-planning`),
                axios.get(`${API}/color`)
            ]);
            setSizeCharts(sc.data.map(c => ({ value: c.id, label: c.chart_name })));
            setStylesList(styles.data.map(s => ({ value: s.id, label: s.style_name })));
            setColorsList(colors.data.map(c => ({ value: c.id, label: c.color })));
        } catch (err) { console.error(err); }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSizeChartChange = async (option) => {
        setSelectedSizeChart(option);
        if (option) {
            try {
                const res = await axios.get(`${API}/size-charts/${option.value}`);
                setCurrentSizes(res.data.values || []);
                setHeader(prev => ({ ...prev, size_chart_id: option.value, size_chart_name: option.label }));
            } catch (err) { toast.error("Failed to fetch sizes"); }
        } else {
            setCurrentSizes([]);
            setHeader(prev => ({ ...prev, size_chart_id: null, size_chart_name: "" }));
        }
    };

    const addRow = () => {
        if (!selectedStyle || !selectedColor || inputRow.pcs_qty <= 0) {
            toast.warning("Please select Style, Color and enter Qty");
            return;
        }

        const styleName = selectedStyle.label;
        const colorName = selectedColor.label;
        const qty = parseFloat(inputRow.pcs_qty);

        setRows(prevRows => {
            const existingIndex = prevRows.findIndex(r => r.style_name === styleName && r.color === colorName);
            if (existingIndex > -1) {
                const updatedRows = [...prevRows];
                updatedRows[existingIndex].pcs_qty += qty;
                return updatedRows;
            } else {
                const newRow = distributeRow({
                    style_name: styleName,
                    color: colorName,
                    pcs_qty: qty,
                    sizes_data: {}
                }, ratios);
                return [...prevRows, newRow];
            }
        });

        setInputRow(prev => ({ ...prev, pcs_qty: 0 }));
    };

    const handleSizeValueChange = (rowIndex, sizeValue, value) => {
        const newRows = [...rows];
        newRows[rowIndex].sizes_data[sizeValue] = parseFloat(value) || 0;

        // Update total pcs_qty for this row
        const rowTotal = Object.values(newRows[rowIndex].sizes_data).reduce((s, v) => s + v, 0);
        newRows[rowIndex].pcs_qty = rowTotal;

        setRows(newRows);
    };

    const removeRow = (index) => {
        setRows(rows.filter((_, i) => i !== index));
    };

    // Summary Calculations
    const totalStylePcs = rows.reduce((s, r) => s + (parseFloat(r.pcs_qty) || 0), 0);
    const excessQty = totalStylePcs * (header.excess_pct / 100);
    const finalTotalQty = totalStylePcs + excessQty;

    const handleSave = async () => {
        if (rows.length === 0) return toast.warning("Add some rows first");
        setLoading(true);
        try {
            const payload = {
                ...header,
                total_qty: totalStylePcs,
                final_qty: finalTotalQty,
                items: rows
            };
            await axios.post(`${API}/size-quantity`, payload);
            toast.success("Saved successfully!");
            navigate(-1);
        } catch (err) {
            toast.error(err.response?.data?.error || "Save failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-fluid p-4" style={{ minHeight: '100vh', background: '#f4f7fe' }}>
            <div className="card shadow-sm border-0 rounded-4 overflow-hidden mb-4">
                <div className="card-header bg-white py-3 border-bottom-0">
                    <h5 className="fw-bold mb-0"><i className="bi bi-rulers me-2 text-primary"></i>Size Quantity Details</h5>
                </div>
                <div className="card-body">
                    <div className="row g-3 mb-4">
                        <div className="col-md-3">
                            <label className="form-label small fw-bold text-muted">Size Chart Selection</label>
                            <div className="d-flex gap-2">
                                <Select
                                    options={sizeCharts}
                                    value={selectedSizeChart}
                                    onChange={handleSizeChartChange}
                                    className="flex-grow-1"
                                    placeholder="Select Chart..."
                                    styles={{ control: (base) => ({ ...base, borderRadius: '10px' }) }}
                                />
                                <button className="btn btn-primary rounded-3" onClick={() => navigate('/size-chart/add')} title="Add New Chart"><i className="bi bi-plus-lg"></i></button>
                                <button className="btn btn-outline-secondary rounded-3" onClick={fetchData} title="Refresh Lists"><i className="bi bi-arrow-clockwise"></i></button>
                            </div>
                        </div>
                        <div className="col-md-2">
                            <label className="form-label small fw-bold text-muted">Excess % (for Final Production)</label>
                            <div className="input-group">
                                <input
                                    type="number"
                                    className="form-control rounded-start-3"
                                    value={header.excess_pct}
                                    onChange={e => setHeader({ ...header, excess_pct: parseFloat(e.target.value) || 0 })}
                                />
                                <span className="input-group-text rounded-end-3 bg-white">%</span>
                            </div>
                        </div>
                    </div>

                    <div className="d-flex align-items-center gap-2 mb-3">
                        <div style={{ width: '4px', height: '20px', background: '#0d6efd', borderRadius: '2px' }}></div>
                        <h6 className="fw-bold mb-0 text-dark opacity-75">Add Style & Color Breakdown</h6>
                    </div>
                    <div className="bg-light p-3 rounded-3 mb-4 border border-dashed">
                        <div className="row g-3 align-items-end">
                            <div className="col-md-3">
                                <label className="form-label small fw-bold text-muted">Style Name (Autocomplete)</label>
                                <Select
                                    options={stylesList}
                                    value={selectedStyle}
                                    onChange={setSelectedStyle}
                                    placeholder="Search Style..."
                                />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small fw-bold text-muted">Color</label>
                                <div className="d-flex gap-2">
                                    <Select
                                        options={colorsList}
                                        value={selectedColor}
                                        onChange={setSelectedColor}
                                        placeholder="Search Color..."
                                        className="flex-grow-1"
                                    />
                                    <button className="btn btn-outline-primary" onClick={() => navigate('/color')}><i className="bi bi-plus"></i></button>
                                </div>
                            </div>
                            <div className="col-md-2">
                                <label className="form-label small fw-bold text-muted">Pcs Qty</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    value={inputRow.pcs_qty}
                                    onChange={e => setInputRow({ ...inputRow, pcs_qty: parseFloat(e.target.value) || 0 })}
                                />
                            </div>
                            <div className="col-md-2">
                                <button className="btn btn-primary w-100 fw-bold" onClick={addRow}>
                                    <i className="bi bi-plus-circle me-1"></i> Add Row
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Table Area */}
                    <div className="table-responsive">
                        <table className="table table-bordered align-middle">
                            <thead className="bg-primary text-white">
                                <tr>
                                    <th>Style Name</th>
                                    <th>Color</th>
                                    {currentSizes.map(s => (
                                        <th key={s.id} className="text-center">
                                            {s.size_value}
                                        </th>
                                    ))}
                                    <th className="text-center" style={{ width: '100px' }}>Total Pcs</th>
                                    <th style={{ width: '50px' }}></th>
                                </tr>
                                <tr className="bg-primary-subtle text-dark">
                                    <td colSpan="2" className="text-end small fw-bold">Distribution Ratio:</td>
                                    {currentSizes.map(s => (
                                        <td key={s.id} className="p-0">
                                            <input
                                                type="number"
                                                placeholder="ratio"
                                                className="form-control form-control-sm border-0 bg-transparent text-center"
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setRatios(prev => {
                                                        const newRatios = { ...prev, [s.size_value]: val };
                                                        // Optionally redistribute all existing rows? 
                                                        // For now just for new rows as requested "if values given... append"
                                                        return newRatios;
                                                    });
                                                }}
                                            />
                                        </td>
                                    ))}
                                    <td colSpan="2"></td>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((row, i) => (
                                    <tr key={i}>
                                        <td className="fw-bold">{row.style_name}</td>
                                        <td><span className="badge bg-secondary">{row.color}</span></td>
                                        {currentSizes.map(s => (
                                            <td key={s.id} className="p-0">
                                                <input
                                                    type="number"
                                                    className="form-control border-0 text-center rounded-0"
                                                    value={row.sizes_data[s.size_value] || 0}
                                                    onChange={e => handleSizeValueChange(i, s.size_value, e.target.value)}
                                                />
                                            </td>
                                        ))}
                                        <td className="text-center fw-bold bg-light">{row.pcs_qty}</td>
                                        <td className="text-center">
                                            <button className="btn btn-link link-danger p-0" onClick={() => removeRow(i)}><i className="bi bi-trash"></i></button>
                                        </td>
                                    </tr>
                                ))}
                                {rows.length === 0 && (
                                    <tr>
                                        <td colSpan={currentSizes.length + 4} className="text-center py-4 text-muted">No rows added yet.</td>
                                    </tr>
                                )}
                            </tbody>
                            <tfoot className="fw-bold">
                                <tr className="bg-light">
                                    <td colSpan={currentSizes.length + 2} className="text-end pe-4">Total Style Pcs Qty:</td>
                                    <td className="text-center text-primary fs-5">{totalStylePcs}</td>
                                    <td></td>
                                </tr>
                                <tr className="bg-light">
                                    <td colSpan={currentSizes.length + 2} className="text-end pe-4">Excess Qty ({header.excess_pct}%):</td>
                                    <td className="text-center text-danger">+{excessQty.toFixed(2)}</td>
                                    <td></td>
                                </tr>
                                <tr className="bg-dark text-white">
                                    <td colSpan={currentSizes.length + 2} className="text-end pe-4">Final Qty (Pcs + Excess):</td>
                                    <td className="text-center fs-4">{finalTotalQty.toFixed(2)}</td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    <div className="d-flex justify-content-end mt-4">
                        <button className="btn btn-success px-5 py-2 fw-bold shadow-sm" onClick={handleSave} disabled={loading}>
                            {loading ? "Saving..." : "Save Size Quantity Details"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SizeQuantityForm;
