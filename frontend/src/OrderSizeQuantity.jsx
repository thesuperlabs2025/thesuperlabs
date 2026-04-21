import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";

const API = process.env.REACT_APP_API_URL;

const OrderSizeQuantity = ({ orderId, buyerName, onSaveSuccess, isLocked, onSizesUpdate }) => {
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
        style_part: "Top",
        color: "",
        pcs_qty: 0
    });

    const [selectedStyle, setSelectedStyle] = useState(null);
    const [selectedColor, setSelectedColor] = useState(null);

    // Table State
    const [rows, setRows] = useState([]);

    // Logic to sync with parent
    useEffect(() => {
        if (onSizesUpdate) {
            const aggregatedQtys = {};
            rows.forEach(row => {
                Object.entries(row.sizes_data).forEach(([s, q]) => {
                    aggregatedQtys[s] = (aggregatedQtys[s] || 0) + (parseFloat(q) || 0);
                });
            });
            onSizesUpdate(currentSizes, header.size_chart_name, header.size_chart_id, aggregatedQtys, rows);
        }
    }, [currentSizes, header.size_chart_name, header.size_chart_id, rows, onSizesUpdate]);

    const fetchData = useCallback(async () => {
        // Reset state before fetching new data to prevent leakage from previous order
        setRows([]);
        setHeader({
            size_chart_id: null,
            size_chart_name: "",
            total_qty: 0,
            excess_pct: 0,
            final_qty: 0
        });
        setSelectedSizeChart(null);
        setCurrentSizes([]);

        try {
            const [sc, styles, colors] = await Promise.all([
                axios.get(`${API}/size-charts`),
                axios.get(`${API}/style-planning`),
                axios.get(`${API}/color`)
            ]);
            setSizeCharts(sc.data.map(c => ({ value: c.id, label: c.chart_name })));
            setStylesList(styles.data.map(s => ({ value: s.id, label: s.style_name })));
            setColorsList(colors.data.map(c => ({ value: c.id, label: c.color })));

            // If orderId exists, fetch existing size quantity details
            if (orderId && orderId !== 'undefined' && orderId !== 'null') {
                try {
                    const detailRes = await axios.get(`${API}/size-quantity/order/${orderId}`);
                    const data = detailRes.data;
                    setHeader({
                        size_chart_id: data.size_chart_id,
                        size_chart_name: data.size_chart_name,
                        total_qty: data.total_qty,
                        excess_pct: data.excess_pct,
                        final_qty: data.final_qty
                    });

                    // Fetch sizes for this chart
                    if (data.size_chart_id) {
                        const scRes = await axios.get(`${API}/size-charts/${data.size_chart_id}`);
                        setCurrentSizes(scRes.data.values || []);
                        setSelectedSizeChart({ value: data.size_chart_id, label: data.size_chart_name });
                    }

                    setRows(data.items.map(item => ({
                        ...item,
                        sizes_data: typeof item.sizes_data === 'string' ? JSON.parse(item.sizes_data) : item.sizes_data
                    })));
                } catch (e) {
                    if (e.response?.status !== 404) {
                        console.error("Error loading existing breakdown:", e);
                    } else {
                        // On 404, we've already reset state above, so we're good.
                    }
                }
            }
        } catch (err) { console.error(err); }
    }, [orderId]);

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
        const stylePart = inputRow.style_part;
        const perSizeQty = parseFloat(inputRow.pcs_qty);

        setRows(prevRows => {
            const existingIndex = prevRows.findIndex(r => r.style_name === styleName && r.style_part === stylePart && r.color === colorName);

            const newSizesData = {};
            currentSizes.forEach(s => {
                newSizesData[s.size_value] = perSizeQty;
            });

            if (existingIndex > -1) {
                const updatedRows = [...prevRows];
                currentSizes.forEach(s => {
                    updatedRows[existingIndex].sizes_data[s.size_value] = (updatedRows[existingIndex].sizes_data[s.size_value] || 0) + perSizeQty;
                });
                return updatedRows;
            } else {
                const newRow = {
                    style_name: styleName,
                    style_part: stylePart,
                    color: colorName,
                    sizes_data: newSizesData
                };
                return [...prevRows, newRow];
            }
        });

        setInputRow(prev => ({ ...prev, pcs_qty: 0 }));
        setSelectedStyle(null);
        setSelectedColor(null);
    };


    const handleSizeValueChange = (rowIndex, sizeValue, value) => {
        const newRows = [...rows];
        newRows[rowIndex].sizes_data[sizeValue] = parseFloat(value) || 0;
        setRows(newRows);
    };

    const removeRow = (index) => {
        setRows(rows.filter((_, i) => i !== index));
    };

    // Summary Calculations - Derived purely from data
    const totalStylePcs = useMemo(() => {
        return rows.reduce((sum, row) => {
            return sum + Object.values(row.sizes_data || {}).reduce((s, v) => s + (parseFloat(v) || 0), 0);
        }, 0);
    }, [rows]);

    const excessQty = totalStylePcs * (header.excess_pct / 100);
    const finalTotalQty = Math.round(totalStylePcs + excessQty);

    const handleSave = async () => {
        if (rows.length === 0) return toast.warning("Add some rows first");
        setLoading(true);
        try {
            // Include explicit row totals in items for back-compat
            const itemsWithTotals = rows.map(r => ({
                ...r,
                pcs_qty: Object.values(r.sizes_data || {}).reduce((s, v) => s + (parseFloat(v) || 0), 0)
            }));

            const payload = {
                ...header,
                order_id: orderId,
                total_qty: totalStylePcs,
                final_qty: finalTotalQty,
                items: itemsWithTotals
            };
            await axios.post(`${API}/size-quantity`, payload);
            toast.success("Size Quantity Details Saved!");
            if (onSaveSuccess) onSaveSuccess();
        } catch (err) {
            toast.error(err.response?.data?.error || "Save failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-2 planning-section">
            <style>{`
                .planning-section { font-size: 0.95rem; }
                .planning-section .form-control, 
                .planning-section .form-select,
                .planning-section .btn { font-size: 0.95rem; }
                .planning-section .table thead th { font-size: 0.8rem; letter-spacing: 0.03rem; text-transform: uppercase; }
                .x-small { font-size: 0.8rem; }
                .focus-visible:focus {
                    border-color: #4f46e5 !important;
                    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2) !important;
                    outline: none;
                    background-color: #fff !important;
                }
                .qty-input:focus {
                    border-color: #4f46e5 !important;
                    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1) !important;
                    background-color: #fff !important;
                }
            `}</style>
            <div className="row g-3 mb-4 align-items-end">
                <div className="col-md-5">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <label className="form-label small fw-bold text-muted mb-0">Size Chart Selection</label>
                        <div className="d-flex gap-2">
                            <button className="btn btn-link btn-sm p-0 text-primary" onClick={() => window.open('/size-chart/add', '_blank')} title="Add New Chart">
                                <i className="bi bi-plus-circle-fill"></i>
                            </button>
                            <button className="btn btn-link btn-sm p-0 text-secondary" onClick={fetchData} title="Refresh Lists">
                                <i className="bi bi-arrow-clockwise"></i>
                            </button>
                        </div>
                    </div>
                    <Select
                        options={sizeCharts}
                        value={selectedSizeChart}
                        onChange={handleSizeChartChange}
                        className="flex-grow-1"
                        placeholder="Select Chart..."
                        isDisabled={isLocked}
                        styles={{
                            control: (base) => ({ ...base, borderRadius: '8px', minHeight: '34px', fontSize: '0.85rem' }),
                            valueContainer: (base) => ({ ...base, padding: '0 8px' })
                        }}
                    />
                </div>
                <div className="col-md-3">
                    <div className="mb-2">
                        <label className="form-label small fw-bold text-muted mb-0">Excess %</label>
                    </div>
                    <div className="input-group">
                        <input
                            type="text"
                            className="form-control rounded-start-3 focus-visible"
                            style={{ height: '34px' }}
                            value={header.excess_pct}
                            readOnly={isLocked}
                            onChange={e => setHeader({ ...header, excess_pct: parseFloat(e.target.value) || 0 })}
                        />
                        <span className="input-group-text rounded-end-3 bg-white x-small fw-bold">%</span>
                    </div>
                </div>
            </div>

            <div className="bg-light p-2 rounded-3 mb-3 border border-dashed shadow-sm">
                <h6 className="fw-bold mb-2 text-primary small"><i className="bi bi-plus-circle me-1"></i>Quick Entry Breakdown</h6>
                <div className="row g-2 align-items-end">
                    <div className="col-md-3">
                        <label className="form-label x-small fw-bold text-muted">Style Name</label>
                        <CreatableSelect
                            options={stylesList}
                            value={selectedStyle}
                            onChange={setSelectedStyle}
                            isDisabled={isLocked}
                            placeholder="Type style..."
                            isSearchable={true}
                            openMenuOnClick={false}
                            openMenuOnFocus={false}
                            components={{ DropdownIndicator: null, IndicatorSeparator: null }}
                            styles={{
                                control: (base) => ({ ...base, borderRadius: '8px', minHeight: '34px', fontSize: '0.85rem', boxShadow: 'none', border: '1px solid #dee2e6' }),
                                valueContainer: (base) => ({ ...base, padding: '0 8px' }),
                                dropdownIndicator: () => ({ display: 'none' })
                            }}
                            formatCreateLabel={(inputValue) => `Add Style "${inputValue}"`}
                        />
                    </div>
                    <div className="col-md-2">
                        <label className="form-label x-small fw-bold text-muted">Style Part</label>
                        <select
                            className="form-select form-select-sm focus-visible"
                            style={{ borderRadius: '8px' }}
                            disabled={isLocked}
                            value={inputRow.style_part}
                            onChange={e => setInputRow({ ...inputRow, style_part: e.target.value })}
                        >
                            <option value="Top">Top</option>
                            <option value="Bottom">Bottom</option>
                            <option value="Set">Set</option>
                        </select>
                    </div>
                    <div className="col-md-2">
                        <label className="form-label x-small fw-bold text-muted">Color</label>
                        <CreatableSelect
                            options={colorsList}
                            value={selectedColor}
                            onChange={setSelectedColor}
                            isDisabled={isLocked}
                            placeholder="Type color..."
                            isSearchable={true}
                            openMenuOnClick={false}
                            openMenuOnFocus={false}
                            components={{ DropdownIndicator: null, IndicatorSeparator: null }}
                            styles={{
                                control: (base) => ({ ...base, borderRadius: '8px', minHeight: '34px', fontSize: '0.85rem', boxShadow: 'none', border: '1px solid #dee2e6' }),
                                valueContainer: (base) => ({ ...base, padding: '0 8px' }),
                                dropdownIndicator: () => ({ display: 'none' })
                            }}
                            formatCreateLabel={(inputValue) => `Add Color "${inputValue}"`}
                        />
                    </div>
                    <div className="col-md-2">
                        <label className="form-label x-small fw-bold text-muted">Qty Per Size</label>
                        <input
                            type="text"
                            className="form-control form-control-sm focus-visible"
                            readOnly={isLocked}
                            style={{ borderRadius: '8px' }}
                            value={inputRow.pcs_qty}
                            onChange={e => setInputRow({ ...inputRow, pcs_qty: parseFloat(e.target.value) || 0 })}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    !isLocked && addRow();
                                }
                            }}
                        />
                    </div>
                    <div className="col-md-3">
                        <button className="btn btn-primary btn-sm w-100 fw-bold" onClick={addRow} disabled={isLocked}>
                            <i className="bi bi-plus-lg me-1"></i> Add row
                        </button>
                    </div>
                </div>
            </div>

            <div className="table-responsive rounded-4 shadow-sm border">
                <table className="table table-hover align-middle mb-0">
                    <thead className="table-dark">
                        <tr>
                            <th className="ps-3">Style Name</th>
                            <th className="text-center">Part</th>
                            <th className="text-center">Color</th>
                            {currentSizes.map(s => (
                                <th key={s.id} className="text-center small">{s.size_value}</th>
                            ))}
                            <th className="text-center" style={{ width: '100px' }}>Total Pcs</th>
                            <th style={{ width: '50px' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, i) => (
                            <tr key={i}>
                                <td className="ps-3 py-2">
                                    <div className="fw-bold text-dark" style={{ fontSize: '0.85rem' }}>
                                        {row.style_name}
                                    </div>
                                </td>
                                <td className="text-center">
                                    <span className="badge bg-secondary bg-opacity-10 text-dark border border-secondary border-opacity-25 px-2 py-1" style={{ fontSize: '0.7rem' }}>
                                        {row.style_part}
                                    </span>
                                </td>
                                <td className="text-center">
                                    <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-2 py-1" style={{ fontSize: '0.7rem' }}>
                                        {row.color}
                                    </span>
                                </td>
                                {currentSizes.map(s => (
                                    <td key={s.id} className="p-1">
                                        <input
                                            type="text"
                                            className="form-control form-control-sm text-center rounded-2 bg-white border qty-input"
                                            style={{ minWidth: '70px', padding: '6px 4px' }}
                                            readOnly={isLocked}
                                            value={row.sizes_data[s.size_value] || 0}
                                            onChange={e => handleSizeValueChange(i, s.size_value, e.target.value)}
                                        />
                                    </td>
                                ))}
                                <td className="text-center fw-bold text-primary bg-light small">
                                    {Object.values(row.sizes_data || {}).reduce((s, v) => s + (parseFloat(v) || 0), 0)}
                                </td>
                                <td className="text-center">
                                    {!isLocked && <button className="btn btn-link link-danger p-0" onClick={() => removeRow(i)}><i className="bi bi-trash"></i></button>}
                                </td>
                            </tr>
                        ))}
                        {rows.length === 0 && (
                            <tr>
                                <td colSpan={currentSizes.length + 5} className="text-center py-5 text-muted small">
                                    <i className="bi bi-inbox fs-2 d-block mb-2 opacity-25"></i>
                                    Please select a size chart and add some style breakdowns.
                                </td>
                            </tr>
                        )}
                    </tbody>
                    {rows.length > 0 && (
                        <tfoot className="table-light fw-bold border-top-2">
                            <tr>
                                <td colSpan={currentSizes.length + 3} className="text-end pe-4 py-3">Summary Style Total:</td>
                                <td className="text-center text-primary h6 mb-0">{totalStylePcs}</td>
                                <td></td>
                            </tr>
                            <tr>
                                <td colSpan={currentSizes.length + 3} className="text-end pe-4 py-3 text-muted small">Excess for Production ({header.excess_pct}%):</td>
                                <td className="text-center text-danger small">+{excessQty.toFixed(0)}</td>
                                <td></td>
                            </tr>
                            <tr className="bg-primary bg-opacity-10">
                                <td colSpan={currentSizes.length + 3} className="text-end pe-4 py-3">Final Production Target:</td>
                                <td className="text-center text-dark h6 mb-0">{finalTotalQty}</td>
                                <td></td>
                            </tr>
                        </tfoot>
                    )}
                </table>
            </div>

            {!isLocked && (
                <div className="d-flex justify-content-end mt-4">
                    <button className="btn btn-success px-4 py-2 rounded-pill fw-bold shadow-sm" onClick={handleSave} disabled={loading}>
                        <i className="bi bi-cloud-check me-2"></i> {loading ? "Saving..." : "Save Size Quantity Details"}
                    </button>
                </div>
            )}
            {isLocked && (
                <div className="d-flex justify-content-end mt-4">
                    <div className="badge bg-success bg-opacity-10 text-success p-3 rounded-pill border border-success border-opacity-25">
                        <i className="bi bi-lock-fill me-2"></i> Size Quantity Locked (Approved)
                    </div>
                </div>
            )}
            <style>{`
                .planning-section { font-size: 0.82rem; }
                .planning-section .form-control, 
                .planning-section .form-select,
                .planning-section .btn { font-size: 0.82rem; }
                .planning-section .table thead th { font-size: 0.72rem; letter-spacing: 0.02rem; }
                .x-small { font-size: 0.7rem; }
            `}</style>
        </div>
    );
};

export default OrderSizeQuantity;
