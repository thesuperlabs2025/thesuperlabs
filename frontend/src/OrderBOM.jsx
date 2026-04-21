import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const API = process.env.REACT_APP_API_URL;

const OrderBOM = ({ orderId, onSaveSuccess, isLocked }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [bomData, setBomData] = useState({
        yarn: [],
        fabric: [],
        trims: []
    });

    const [selectedItems, setSelectedItems] = useState({
        yarn: new Set(),
        fabric: new Set(),
        trims: new Set()
    });

    const [orderInfo, setOrderInfo] = useState({});
    const [stocks, setStocks] = useState({
        yarn: {},    // sku -> stock
        fabric: {},  // sku -> stock
        trims: {}    // sku -> stock
    });

    const fetchData = useCallback(async () => {
        if (!orderId || orderId === 'undefined' || isNaN(orderId)) return;
        try {
            setLoading(true);
            const [enhancedRes, sizeQtyRes, yStock, fStock, tStock] = await Promise.all([
                axios.get(`${API}/order-planning-v2/bom-enhanced/${orderId}`),
                axios.get(`${API}/size-quantity/order/${orderId}`).catch(() => ({ data: { items: [] } })),
                axios.get(`${API}/yarn`),
                axios.get(`${API}/fabrics`),
                axios.get(`${API}/trims`)
            ]);

            const { yarnPlan, trimsPlan, fabricPlan, bom, issuedPOs } = enhancedRes.data;
            const obRes = await axios.get(`${API}/order_planning/${orderId}`).catch(() => ({ data: {} }));
            setOrderInfo(obRes.data || {});

            // Process Stocks for State
            const yMap = {};
            yStock.data.forEach(item => { if (item.yarn_sku) yMap[item.yarn_sku.toLowerCase()] = item.current_stock; });

            const fMap = {};
            fStock.data.forEach(item => { if (item.fabric_sku) fMap[item.fabric_sku.toLowerCase()] = item.current_stock; });

            const tMap = {};
            tStock.data.forEach(item => { if (item.trims_sku) tMap[item.trims_sku.toLowerCase()] = item.current_stock; });

            setStocks({ yarn: yMap, fabric: fMap, trims: tMap });

            const lifecycles = (enhancedRes.data.lifecycle || []).sort((a, b) => a.sequence_no - b.sequence_no);
            const trimsLifecycles = enhancedRes.data.trims_lifecycle || [];

            // Foundation Data
            const excessPct = parseFloat(sizeQtyRes.data.excess_pct) || 0;
            const excessMultiplier = 1 + (excessPct / 100);
            const sizeQtyItems = sizeQtyRes.data.items || [];

            // Helper to get aggregated sizes for a filter
            const getFilteredQtys = (stylePart, color) => {
                const aggregated = {};
                sizeQtyItems
                    .filter(item =>
                        (!stylePart || item.style_part === stylePart) &&
                        (!color || item.color === color)
                    )
                    .forEach(item => {
                        const data = typeof item.sizes_data === 'string' ? JSON.parse(item.sizes_data) : item.sizes_data;
                        if (data) {
                            Object.entries(data).forEach(([sz, q]) => {
                                aggregated[sz] = (aggregated[sz] || 0) + (parseFloat(q) || 0) * excessMultiplier;
                            });
                        }
                    });
                return aggregated;
            };

            // 2. Sequential Multiplier Utility (Process Specific)
            const calculateSequential = (baseQty, allowedTypes = ['yarn', 'fabric', 'pcs']) => {
                let current = baseQty;
                lifecycles
                    .filter(lc => allowedTypes.includes((lc.process_type || 'yarn').toLowerCase()))
                    .forEach(lc => {
                        const pct = parseFloat(lc.wastage_pct) || 0;
                        if (pct > 0) current *= (1 + pct / 100);
                    });
                return current;
            };

            // 3. Fabric BOM Calculation (Color + Style Part Aware)
            const fabricItemsCalculated = (fabricPlan.items || []).map(f => {
                const targetQtys = getFilteredQtys(f.style_part, f.color);
                const totalTargetPcs = Object.values(targetQtys).reduce((a, b) => a + b, 0);

                const consData = typeof f.consumption_data === 'string' ? JSON.parse(f.consumption_data) : (f.consumption_data || {});
                let baseFabricKg = 0;

                Object.entries(consData).forEach(([sz, cons]) => {
                    const qty = targetQtys[sz] || 0;
                    const wt = parseFloat(cons) || 0;
                    const wtKg = wt > 5 ? (wt / 1000) : wt;
                    baseFabricKg += qty * wtKg;
                });

                if (baseFabricKg === 0 && f.avg_wt > 0) baseFabricKg = totalTargetPcs * (parseFloat(f.avg_wt) || 0);

                const fabWastage = parseFloat(f.wastage_pct) || 0;
                const greyFabricReq = baseFabricKg * (1 + fabWastage / 100);

                // Differentiated Wastage: 
                // Ready Fabric gets ONLY PCS (garment) wastage. 
                // Yarn-based fabric gets FABRIC + PCS wastage.
                const isReadyFabric = f.fabric_type === 'Ready Fabric';
                const fabAllowedTypes = isReadyFabric ? ['pcs'] : ['fabric', 'pcs'];
                const finalFabricRequirement = calculateSequential(greyFabricReq, fabAllowedTypes);

                return {
                    id: f.id,
                    item_category: 'Fabric',
                    item_name: [f.fabric_name, f.composition, f.gsm && `${f.gsm}G`, f.dia && `${f.dia}"`, f.color].filter(Boolean).join(' - '),
                    _raw: f,
                    required_qty: finalFabricRequirement.toFixed(3),
                    final_qty: finalFabricRequirement.toFixed(3),
                    budget_rate: f.rate || 0,
                    is_read_only: (f.fabric_type === 'Yarn' || !f.fabric_type),
                    _greyFabricReq: greyFabricReq
                };
            });

            // 4. Yarn BOM Calculation (Color + Style Part Aware)
            const yarnItemsCalculated = (yarnPlan || []).map(y => {
                const linkedFabric = fabricItemsCalculated.find(fi => fi.id === y.fabric_id_ref);
                const fabricGreyReq = linkedFabric ? parseFloat(linkedFabric._greyFabricReq) : 0;

                const yarnConsPct = parseFloat(y.consumption) || 0;
                const yarnBaseWeight = fabricGreyReq * (yarnConsPct / 100);
                const yarnWastage = parseFloat(y.wastage_pct) || 0;
                const yarnBeforeLifecycle = yarnBaseWeight * (1 + yarnWastage / 100);

                // Yarn gets ALL process wastages (Yarn + Fabric + PCS)
                const finalYarnRequirement = calculateSequential(yarnBeforeLifecycle, ['yarn', 'fabric', 'pcs']);

                const isParentYarnType = linkedFabric ? (linkedFabric._raw.fabric_type === 'Yarn' || !linkedFabric._raw.fabric_type) : true;
                if (!isParentYarnType) return null;

                // Find SKU from master
                const yarnMaster = yStock.data.find(ym =>
                    (ym.yarn_name || "").toLowerCase() === (y.yarn_name || "").toLowerCase() &&
                    (ym.counts || "").toLowerCase() === (y.yarn_counts || "").toLowerCase() &&
                    (ym.color || "").toLowerCase() === (y.yarn_color || "").toLowerCase()
                );

                return {
                    item_category: 'Yarn',
                    item_name: [y.yarn_counts, y.yarn_name, y.yarn_color].filter(Boolean).join(' - '),
                    _raw: { ...y, yarn_sku: yarnMaster ? yarnMaster.yarn_sku : "" },
                    required_qty: finalYarnRequirement.toFixed(3),
                    final_qty: finalYarnRequirement.toFixed(3),
                    budget_rate: y.budget_rate || 0
                };
            }).filter(Boolean);

            // 5. Trims BOM Calculation
            const trimItemsCalculated = [];
            (trimsPlan || []).forEach(t => {
                const targetQtys = getFilteredQtys(t.style_part, t.color);
                const totalTargetPcs = Object.values(targetQtys).reduce((a, b) => a + b, 0);
                const trimLC = trimsLifecycles.find(tlc => tlc.trim_name === t.trims_name);
                const trimWastage = trimLC ? (parseFloat(trimLC.wastage_pct) || 0) : 0;

                if (t.trim_type === 'Sizeable') {
                    const consData = typeof t.consumption_data === 'string' ? JSON.parse(t.consumption_data) : (t.consumption_data || {});
                    Object.entries(consData).forEach(([size, cons]) => {
                        const qty = targetQtys[size] || 0;
                        const baseTrim = qty * (parseFloat(cons) || 0);
                        const finalTrim = baseTrim * (1 + trimWastage / 100);
                        trimItemsCalculated.push({
                            item_category: 'Trims',
                            item_name: [t.trims_name, size, t.color].filter(Boolean).join(' - '),
                            _raw: { ...t, size },
                            required_qty: finalTrim.toFixed(3),
                            final_qty: finalTrim.toFixed(3),
                            budget_rate: t.rate || 0
                        });
                    });
                } else {
                    const cons = parseFloat(t.qty_per_pcs) || 0;
                    let baseTrim = totalTargetPcs * cons;
                    if ((t.trims_name || '').toLowerCase().includes('thread') && cons > 2) baseTrim /= 1000;
                    const finalTrim = baseTrim * (1 + trimWastage / 100);
                    trimItemsCalculated.push({
                        item_category: 'Trims',
                        item_name: [t.trims_name, t.color].filter(Boolean).join(' - '),
                        _raw: t,
                        required_qty: finalTrim.toFixed(3),
                        final_qty: finalTrim.toFixed(3),
                        budget_rate: t.rate || 0
                    });
                }
            });

            // 6. Final Grouping & PO Sync
            const groupAndSync = (items, category) => {
                const grouped = {};
                items.forEach(i => {
                    const key = i.item_name;
                    if (!grouped[key]) {
                        grouped[key] = { ...i, required_qty: 0, final_qty: 0, issued_qty: 0 };
                    }
                    grouped[key].required_qty += parseFloat(i.required_qty);
                    grouped[key].final_qty += parseFloat(i.final_qty);
                });

                return Object.values(grouped).map(i => {
                    const catKey = category.toLowerCase();
                    let match;
                    if (catKey === 'yarn') match = issuedPOs.yarn.find(p => p.yarn_name === i._raw.yarn_name && p.counts === i._raw.yarn_counts && p.color === i._raw.yarn_color);
                    if (catKey === 'fabric') match = issuedPOs.fabric.find(p => p.fabric_name === i._raw.fabric_name && p.color === i._raw.color && p.gsm === i._raw.gsm);
                    if (catKey === 'trims') match = issuedPOs.trims.find(p => p.trims_name === i._raw.trims_name && p.color === i._raw.color && (p.size === i._raw.size || !i._raw.size));

                    const saved = bom.find(s => s.item_name === i.item_name && s.item_category === (catKey.charAt(0).toUpperCase() + catKey.slice(1)));

                    let finalVal = i.final_qty.toFixed(3);
                    if (saved && saved.final_qty !== null && saved.final_qty !== undefined && parseFloat(saved.final_qty) !== 0) {
                        finalVal = saved.final_qty;
                    }

                    return {
                        ...i,
                        required_qty: i.required_qty.toFixed(3),
                        final_qty: finalVal,
                        issued_qty: match ? parseFloat(match.issued_qty) : 0,
                        export_to_po: saved ? !!saved.export_to_po : false
                    };
                });
            };

            setBomData({
                yarn: groupAndSync(yarnItemsCalculated, 'Yarn'),
                fabric: groupAndSync(fabricItemsCalculated, 'Fabric'),
                trims: groupAndSync(trimItemsCalculated, 'Trims')
            });

        } catch (err) {
            console.error(err);
            toast.error("Calculation Sync Error");
        } finally {
            setLoading(false);
        }
    }, [orderId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleQtyChange = (cat, idx, val) => {
        const updated = { ...bomData };
        // Allow numeric inputs and up to 3 decimal places
        if (val === "" || /^\d*(\.\d{0,3})?$/.test(val)) {
            updated[cat][idx].final_qty = val;
            setBomData(updated);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const allItems = [...bomData.yarn, ...bomData.fabric, ...bomData.trims];

            // Validation: Final qty should not be less than required qty
            const invalidItems = allItems.filter(i => parseFloat(i.final_qty) < parseFloat(i.required_qty));
            if (invalidItems.length > 0) {
                toast.error(`Error: Final Qty cannot be less than Required Qty for: ${invalidItems[0].item_name}`);
                setLoading(false);
                return;
            }

            const payloadItems = allItems.map(i => ({
                item_category: i.item_category,
                item_name: i.item_name,
                required_qty: i.required_qty,
                final_qty: i.final_qty,
                budget_rate: i.budget_rate,
                export_to_po: i.export_to_po ? 1 : 0
            }));
            await axios.post(`${API}/order-planning-v2/bom`, { order_id: orderId, items: payloadItems });
            toast.success("BOM Saved!");
            if (onSaveSuccess) onSaveSuccess();
        } catch (err) { toast.error("Save failed"); }
        finally { setLoading(false); }
    };

    const toggleSelection = (cat, idx) => {
        const news = { ...selectedItems };
        Object.keys(news).forEach(c => c !== cat && news[c].clear());
        news[cat].has(idx) ? news[cat].delete(idx) : news[cat].add(idx);
        setSelectedItems(news);
    };

    const exportToPO = () => {
        const cat = Object.keys(selectedItems).find(c => selectedItems[c].size > 0);
        if (!cat) return toast.warning("Select items first");

        const items = Array.from(selectedItems[cat]).map(idx => bomData[cat][idx]);

        // Check if any selected item is already processed (100% or more)
        const alreadyProcessed = items.find(item => {
            const poPct = item.final_qty > 0 ? (item.issued_qty / item.final_qty * 100) : 0;
            return poPct >= 100;
        });

        if (alreadyProcessed) {
            return toast.error(`Error: PO is already processed for ${alreadyProcessed.item_name}`);
        }

        let path = `/${cat}-po-add`;
        let stateItems = items.map(i => {
            if (cat === 'yarn') return { counts: i._raw.yarn_counts, yarn_name: i._raw.yarn_name, yarn_sku: i._raw.yarn_sku || "", color: i._raw.yarn_color, req_qty: i.required_qty, qty: i.final_qty, rate: i.budget_rate };
            if (cat === 'fabric') return { counts: i._raw.counts, fabric_name: i._raw.fabric_name, color: i._raw.color, gsm: i._raw.gsm, dia: i._raw.dia, req_qty: i.required_qty, qty: i.final_qty, rate: i.budget_rate };
            if (cat === 'trims') return { trims_name: i._raw.trims_name, color: i._raw.color, size: i._raw.size || "", req_qty: i.required_qty, qty: i.final_qty, rate: i.budget_rate };
            return i;
        });
        navigate(path, { state: { items: stateItems, order_id: orderId, order_no: orderInfo.order_no, order_name: orderInfo.order_name } });
    };

    const renderTable = (cat, title, items) => {
        const totalReq = items.reduce((sum, item) => sum + (parseFloat(item.required_qty) || 0), 0);
        const totalFinal = items.reduce((sum, item) => sum + (parseFloat(item.final_qty) || 0), 0);

        return (
            <div className="mb-4 bg-white border rounded-4 shadow-sm overflow-hidden">
                <div className="bg-dark text-white px-4 py-2.5 d-flex justify-content-between align-items-center">
                    <h6 className="fw-bold mb-0 small"><i className="bi bi-cpu me-2 text-primary"></i>{title} MATERIAL BOM</h6>
                    <span className="badge bg-primary px-3 x-small">{items.length} SKUs</span>
                </div>
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light text-uppercase font-monospace" style={{ fontSize: '0.65rem' }}>
                            <tr>
                                <th className="ps-4" style={{ width: '40px' }}></th>
                                <th style={{ minWidth: '400px' }}>ITEM HUB (Description & Composition)</th>
                                <th className="text-center" style={{ width: '150px' }}>REQ (PLAN)</th>
                                <th className="text-center" style={{ width: '150px' }}>FINAL ADJ</th>
                                <th className="text-center px-4" style={{ width: '180px' }}>FULFILLMENT</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, idx) => {
                                const poPct = item.final_qty > 0 ? (item.issued_qty / item.final_qty * 100).toFixed(1) : 0;
                                return (
                                    <tr key={idx} className={item.is_read_only ? 'bg-light bg-opacity-10' : ''}>
                                        <td className="ps-4">
                                            {orderInfo.status === 'Approved' && (
                                                <input type="checkbox" className="form-check-input" checked={selectedItems[cat].has(idx)} onChange={() => toggleSelection(cat, idx)} />
                                            )}
                                        </td>
                                        <td className="py-3">
                                            <div className="fw-bold text-dark small">{item.item_name}</div>
                                            <div className="text-muted" style={{ fontSize: '0.7rem', marginTop: '2px' }}>
                                                Stock Indent: <span className="fw-bold text-dark">{Number(stocks[cat.toLowerCase()][item.item_name.toLowerCase()] || 0).toFixed(2)}</span> {cat === 'trims' ? '' : 'Kgs'}
                                            </div>
                                            {item.is_read_only && <div className="x-small text-info fw-bold mt-1"><i className="bi bi-link-45deg"></i> Yarn Derived</div>}
                                            {!item.is_read_only && item.item_category === 'Fabric' && <div className="x-small text-success fw-bold mt-1"><i className="bi bi-cart"></i> Ready Purchase</div>}
                                        </td>
                                        <td className="text-center font-monospace fw-bold text-dark">{parseFloat(item.required_qty).toFixed(3)}</td>
                                        <td className="text-center px-3">
                                            <input
                                                type="text"
                                                className={`form-control form-control-sm text-center fw-bold ${item.is_read_only ? 'bg-light border-0' : 'border-primary border-opacity-25 text-primary'} ${parseFloat(item.final_qty) < parseFloat(item.required_qty) ? 'border-danger bg-danger bg-opacity-10 text-danger' : ''}`}
                                                value={item.final_qty}
                                                readOnly={item.is_read_only || isLocked}
                                                onChange={e => handleQtyChange(cat, idx, e.target.value)}
                                            />
                                            {parseFloat(item.final_qty) < parseFloat(item.required_qty) && (
                                                <div className="text-danger" style={{ fontSize: '0.6rem', marginTop: '2px' }}>Min: {parseFloat(item.required_qty).toFixed(3)}</div>
                                            )}
                                        </td>
                                        <td className="text-center px-4">
                                            <div className="progress" style={{ height: '6px' }}><div className="progress-bar" style={{ width: `${Math.min(100, poPct)}%` }}></div></div>
                                            <div className="x-small mt-1 text-muted fw-bold">{poPct}% PO Issued</div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        <tfoot className="table-light border-top-2">
                            <tr className="fw-bold">
                                <td className="ps-4"></td>
                                <td className="text-end py-3 text-muted small">TOTAL {title} QUANTITY:</td>
                                <td className="text-center font-monospace text-primary fs-6">{totalReq.toFixed(3)}</td>
                                <td className="text-center px-3">
                                    <div className="form-control form-control-sm text-center fw-bold bg-white border-0 fs-6">{totalFinal.toFixed(3)}</div>
                                </td>
                                <td className="px-4"></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        );
    };

    return (
        <div className="p-1 planning-section">
            <style>{`
                .planning-section { font-size: 0.95rem; }
                .planning-section .form-control, 
                .planning-section .form-select,
                .planning-section .btn { font-size: 0.95rem; }
                .planning-section .table thead th { font-size: 0.8rem; letter-spacing: 0.03rem; text-transform: uppercase; }
                .x-small { font-size: 0.8rem; }
                .btn-export { font-size: 0.8rem !important; padding: 0.2rem 0.75rem !important; }
            `}</style>
            <div className="d-flex justify-content-between align-items-center mb-4 bg-light p-3 border rounded-4">
                <div>
                    <h6 className="fw-bold mb-0 text-dark">MULTI-STYLE MATERIAL BOM</h6>
                    <p className="text-muted x-small mb-0">Filtered by Style Color | Foundation: Planning + Excess foundation</p>
                </div>
                <div className="d-flex gap-2">
                    <button className="btn btn-outline-primary btn-sm px-4 rounded-pill fw-bold btn-export" onClick={exportToPO}>Export to PO</button>
                    {!isLocked && <button className="btn btn-success btn-sm px-4 rounded-pill fw-bold" onClick={handleSave} disabled={loading}>Save BOM</button>}
                </div>
            </div>
            {loading ? <div className="text-center py-5"><div className="spinner-border spinner-border-sm text-primary"></div></div> : (
                <div className="fade-in">
                    {renderTable('yarn', 'YARN', bomData.yarn)}
                    {renderTable('fabric', 'FABRIC', bomData.fabric)}
                    {renderTable('trims', 'TRIMS', bomData.trims)}
                </div>
            )}
        </div>
    );
};

export default OrderBOM;
