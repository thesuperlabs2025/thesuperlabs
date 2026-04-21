import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import CreatableSelect from "react-select/creatable";

const API = process.env.REACT_APP_API_URL;

const OrderYarnPlanning = ({ orderId, onSaveSuccess, isLocked, sharedSizes }) => {
    const [loading, setLoading] = useState(false);
    const [yarnsStockMaster, setYarnsStockMaster] = useState([]);
    const [rows, setRows] = useState([]);

    // Modal State
    const [showYarnModal, setShowYarnModal] = useState(false);
    const [activeRowIndex, setActiveRowIndex] = useState(null); // Can be a number or an array of numbers
    const [tempYarnAssignments, setTempYarnAssignments] = useState([]);
    const [yarnWastagePct, setYarnWastagePct] = useState(0);
    const [selectedRows, setSelectedRows] = useState([]);

    const fetchData = useCallback(async () => {
        if (!orderId || orderId === 'undefined' || isNaN(orderId)) return;
        try {
            const [fabricPlan, existing, yarnMaster] = await Promise.all([
                axios.get(`${API}/fabric-planning/order/${orderId}`),
                axios.get(`${API}/order-planning-v2/all/${orderId}`),
                axios.get(`${API}/yarn`)
            ]);

            setYarnsStockMaster(yarnMaster.data);

            if (fabricPlan.data.items) {
                // Initialize rows with full fabric details
                const initialRows = fabricPlan.data.items.map(f => {
                    // Robust matching: Try ID first, then fallback to name/counts/part match
                    let existingYarns = existing.data.yarn.filter(y => y.fabric_id_ref === f.id);

                    if (existingYarns.length === 0) {
                        existingYarns = existing.data.yarn.filter(y =>
                            y.fabric_name === f.fabric_name &&
                            (y.style_part === f.style_part || !y.style_part) &&
                            (y.fabric_counts === f.counts || !y.fabric_counts)
                        );
                    }

                    return {
                        id: f.id,
                        fabric_name: f.fabric_name,
                        counts: f.counts,
                        gsm: f.gsm || '',
                        dia: f.dia || '',
                        color: f.color || '',
                        style_part: f.style_part,
                        fabric_type: f.fabric_type || 'Yarn',
                        assignedYarns: existingYarns.map(y => ({
                            id: y.id || (Date.now() + Math.random()),
                            yarnName: y.yarn_name,
                            yarnCounts: y.yarn_counts,
                            yarnColor: y.yarn_color,
                            yarnConsumption: y.consumption
                        }))
                    };
                });
                setRows(initialRows);
                if (existing.data.yarn && existing.data.yarn.length > 0) {
                    setYarnWastagePct(parseFloat(existing.data.yarn[0].wastage_pct) || 0);
                }
            }
        } catch (err) { console.error(err); }
    }, [orderId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleYarnAssignClick = (indexOrIndices) => {
        let currentAssigned = [];
        if (typeof indexOrIndices === 'number') {
            if (rows[indexOrIndices].fabric_type === 'Ready Fabric') return;
            setActiveRowIndex(indexOrIndices);
            currentAssigned = rows[indexOrIndices].assignedYarns || [];
        } else if (Array.isArray(indexOrIndices) && indexOrIndices.length > 0) {
            const validIndices = indexOrIndices.filter(idx => rows[idx].fabric_type !== 'Ready Fabric');
            if (validIndices.length === 0) {
                toast.info("No items requiring yarn planning selected.");
                return;
            }
            setActiveRowIndex(validIndices);
            currentAssigned = rows[validIndices[0]].assignedYarns || [];
        }

        setTempYarnAssignments(currentAssigned.length > 0 ? [...currentAssigned] : [{ id: Date.now(), yarnName: "", yarnCounts: "", yarnColor: "", yarnConsumption: 100 }]);
        setShowYarnModal(true);
    };

    const handleAddYarnRow = () => {
        setTempYarnAssignments([...tempYarnAssignments, { id: Date.now(), yarnName: "", yarnCounts: "", yarnColor: "", yarnConsumption: "" }]);
    };

    const handleRemoveYarnRow = (id) => {
        setTempYarnAssignments(tempYarnAssignments.filter(y => y.id !== id));
    };

    const handleTempYarnChange = (id, field, value) => {
        setTempYarnAssignments(tempYarnAssignments.map(y => y.id === id ? { ...y, [field]: value } : y));
    };

    const saveYarnAssignments = () => {
        const total = tempYarnAssignments.reduce((sum, y) => sum + (parseFloat(y.yarnConsumption) || 0), 0);
        if (total !== 100) {
            toast.warning(`Total consumption must be 100% (Current: ${total}%)`);
            return;
        }

        const updatedRows = [...rows];
        if (typeof activeRowIndex === 'number') {
            updatedRows[activeRowIndex].assignedYarns = tempYarnAssignments;
        } else if (Array.isArray(activeRowIndex)) {
            activeRowIndex.forEach(idx => {
                if (updatedRows[idx].fabric_type !== 'Ready Fabric') {
                    updatedRows[idx].assignedYarns = tempYarnAssignments.map(y => ({ ...y, id: Date.now() + Math.random() }));
                }
            });
            setSelectedRows([]); // Clear selection after bulk assign
        }

        setRows(updatedRows);
        setShowYarnModal(false);
    };

    const handleSave = async () => {
        // Validation: Every fabric (except Ready Fabric) must have at least one yarn assigned
        const missingYarn = rows.find(row => row.fabric_type !== 'Ready Fabric' && (!row.assignedYarns || row.assignedYarns.length === 0));
        if (missingYarn) {
            toast.warning(`Please assign yarn for fabric: ${missingYarn.fabric_name} (${missingYarn.style_part})`);
            return;
        }

        setLoading(true);
        try {
            const itemsToSave = [];
            rows.forEach(row => {
                if (row.fabric_type !== 'Ready Fabric' && row.assignedYarns) {
                    row.assignedYarns.forEach(ay => {
                        itemsToSave.push({
                            fabric_id_ref: row.id,
                            fabric_name: row.fabric_name,
                            style_part: row.style_part,
                            fabric_counts: row.counts,
                            yarn_name: ay.yarnName,
                            yarn_counts: ay.yarnCounts,
                            yarn_color: ay.yarnColor,
                            consumption: ay.yarnConsumption,
                            wastage_pct: yarnWastagePct
                        });
                    });
                }
            });

            await axios.post(`${API}/order-planning-v2/yarn`, {
                order_id: orderId,
                items: itemsToSave
            });

            if (itemsToSave.length === 0 && rows.length > 0) {
                toast.success("⏭️ Yarn planning skipped (Ready Fabric)");
            } else {
                toast.success("✅ Yarn Planning Saved Successfully!");
            }

            if (onSaveSuccess) onSaveSuccess();
        } catch (err) {
            console.error(err);
            toast.error("❌ Failed to save yarn planning");
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
            `}</style>
            <div className="bg-white rounded-3 shadow-sm border overflow-hidden">
                <div className="bg-dark text-white px-3 py-2 d-flex align-items-center justify-content-between">
                    <h6 className="fw-bold mb-0 small"><i className="bi bi-diagram-3-fill me-2 text-primary"></i>Yarn Assignment (Fabric Wise)</h6>
                    <div className="d-flex align-items-center gap-2">
                        {selectedRows.length > 0 && (
                            <button className="btn btn-primary btn-sm rounded-pill px-3 fw-bold" onClick={() => handleYarnAssignClick(selectedRows)}>
                                <i className="bi bi-plus-lg me-1"></i> Assign Yarn ({selectedRows.length})
                            </button>
                        )}
                    </div>
                </div>
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light">
                            <tr className="small fw-bold">
                                <th className="ps-3 py-2" style={{ width: '40px' }}>
                                    <input
                                        type="checkbox"
                                        className="form-check-input mt-0"
                                        checked={rows.length > 0 && selectedRows.length === rows.length}
                                        disabled={isLocked}
                                        onChange={(e) => {
                                            if (e.target.checked) setSelectedRows(rows.map((_, i) => i));
                                            else setSelectedRows([]);
                                        }}
                                    />
                                </th>
                                <th className="py-2" style={{ width: '100px' }}>Style Part</th>
                                <th className="py-2">Fabric</th>
                                <th className="py-2">Fabric SKU</th>
                                <th className="py-2 text-center">Yarn Assign</th>
                                <th className="py-2">Assigned Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, idx) => (
                                <tr key={idx} className={selectedRows.includes(idx) ? 'table-primary bg-opacity-10' : ''}>
                                    <td className="ps-3 py-2">
                                        <input
                                            type="checkbox"
                                            className="form-check-input mt-0"
                                            checked={selectedRows.includes(idx)}
                                            disabled={isLocked}
                                            onChange={(e) => {
                                                if (e.target.checked) setSelectedRows([...selectedRows, idx]);
                                                else setSelectedRows(selectedRows.filter(i => i !== idx));
                                            }}
                                        />
                                    </td>
                                    <td className="py-2">
                                        <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25">{row.style_part}</span>
                                    </td>
                                    <td className="py-2">
                                        <span className="fw-bold text-dark small">{row.fabric_name}</span>
                                    </td>
                                    <td className="py-2">
                                        <span className="small text-muted">
                                            {[row.counts, row.fabric_name, row.gsm && `${row.gsm} GSM`, row.dia && `${row.dia}"`, row.color].filter(Boolean).join(' - ')}
                                        </span>
                                    </td>
                                    <td className="text-center">
                                        {row.fabric_type === 'Ready Fabric' ? (
                                            <span className="badge bg-secondary-subtle text-secondary border rounded-pill px-3">Skip (Ready Fabric)</span>
                                        ) : (
                                            <button className={`btn btn-sm ${row.assignedYarns.length > 0 ? 'btn-success' : 'btn-outline-primary'} rounded-pill px-3`} onClick={() => handleYarnAssignClick(idx)}>
                                                <i className={`bi ${isLocked ? 'bi-eye' : 'bi-plus-lg'} me-1`}></i> {isLocked ? 'View' : 'Assign'}
                                            </button>
                                        )}
                                    </td>
                                    <td className="py-2">
                                        {row.assignedYarns.length > 0 ? (
                                            <div className="small">
                                                {row.assignedYarns.map((ay, i) => (
                                                    <div key={i} className="mb-1 d-flex align-items-center gap-1">
                                                        <span className="badge bg-info-subtle text-info border x-small">{ay.yarnCounts}</span>
                                                        <span className="fw-bold">{ay.yarnName}</span>
                                                        <span className="text-muted x-small">({ay.yarnColor})</span>
                                                        <span className="ms-auto fw-bold text-primary">{ay.yarnConsumption}%</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-muted x-small">No yarns assigned</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {rows.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="text-center py-5 text-muted">Please complete Fabric Planning first.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="d-flex justify-content-end mt-3">
                {!isLocked && (
                    <button className="btn btn-success btn-sm px-4 py-2 rounded-pill fw-bold shadow" onClick={handleSave} disabled={loading}>
                        <i className="bi bi-cloud-check me-1"></i> {loading ? "Saving..." : "Save Yarn Planning"}
                    </button>
                )}
                {isLocked && (
                    <div className="badge bg-success bg-opacity-10 text-success p-3 rounded-pill border border-success border-opacity-25">
                        <i className="bi bi-lock-fill me-2"></i> Yarn Planning Locked (Approved)
                    </div>
                )}
            </div>

            {/* Yarn Assignment Modal */}
            {showYarnModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg rounded-4">
                            <div className="modal-header bg-dark text-white border-0 py-3">
                                <h5 className="modal-title fw-bold small">
                                    <i className="bi bi-record-circle me-2 text-primary"></i>
                                    {Array.isArray(activeRowIndex)
                                        ? `Bulk Assign Yarn (${activeRowIndex.length} Fabrics)`
                                        : `Assign Yarn: ${rows[activeRowIndex]?.fabric_name}`}
                                </h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowYarnModal(false)}></button>
                            </div>
                            <div className="modal-body p-4">
                                <div className="table-responsive">
                                    <table className="table table-bordered align-middle table-sm">
                                        <thead className="small fw-bold bg-light">
                                            <tr>
                                                <th style={{ width: '120px' }}>Counts</th>
                                                <th style={{ minWidth: '300px' }}>Yarn Name</th>
                                                <th style={{ width: '150px' }}>Color</th>
                                                <th style={{ width: '150px' }}>Consumption %</th>
                                                <th style={{ width: '50px' }}></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {tempYarnAssignments.map((ty) => (
                                                <tr key={ty.id}>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            className="form-control form-control-sm rounded-2"
                                                            style={{ height: '34px', fontSize: '0.85rem' }}
                                                            value={ty.yarnCounts}
                                                            onChange={(e) => handleTempYarnChange(ty.id, "yarnCounts", e.target.value)}
                                                            placeholder="Counts"
                                                            readOnly={isLocked}
                                                        />
                                                    </td>
                                                    <td>
                                                        <CreatableSelect
                                                            options={yarnsStockMaster.map(y => ({
                                                                value: y.yarn_name,
                                                                label: y.yarn_name,
                                                                counts: y.counts,
                                                                color: y.color,
                                                                sku: y.yarn_sku
                                                            }))}
                                                            value={ty.yarnName ? { value: ty.yarnName, label: ty.yarnName } : null}
                                                            onChange={(sel) => {
                                                                if (sel) {
                                                                    setTempYarnAssignments(prev => prev.map(y => y.id === ty.id ? {
                                                                        ...y,
                                                                        yarnName: sel.value,
                                                                        yarnCounts: sel.counts || y.yarnCounts,
                                                                        yarnColor: sel.color || y.yarnColor,
                                                                        yarnSku: sel.sku || y.yarnSku
                                                                    } : y));
                                                                } else {
                                                                    handleTempYarnChange(ty.id, "yarnName", "");
                                                                }
                                                            }}
                                                            placeholder="Yarn Name"
                                                            isDisabled={isLocked}
                                                            menuPortalTarget={document.body}
                                                            styles={{
                                                                control: (base) => ({ ...base, borderRadius: '8px', minHeight: '34px', fontSize: '0.85rem' }),
                                                                menuPortal: base => ({ ...base, zIndex: 9999 })
                                                            }}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            className="form-control form-control-sm rounded-2"
                                                            style={{ height: '34px', fontSize: '0.85rem' }}
                                                            value={ty.yarnColor}
                                                            onChange={(e) => handleTempYarnChange(ty.id, "yarnColor", e.target.value)}
                                                            placeholder="Color"
                                                            readOnly={isLocked}
                                                        />
                                                    </td>
                                                    <td>
                                                        <div className="input-group input-group-sm">
                                                            <input
                                                                type="text"
                                                                className="form-control text-end"
                                                                value={ty.yarnConsumption}
                                                                onChange={(e) => handleTempYarnChange(ty.id, "yarnConsumption", e.target.value)}
                                                                readOnly={isLocked}
                                                            />
                                                            <span className="input-group-text">%</span>
                                                        </div>
                                                    </td>
                                                    <td className="text-center">
                                                        {!isLocked && (
                                                            <button className="btn btn-link link-danger p-0" onClick={() => handleRemoveYarnRow(ty.id)}>
                                                                <i className="bi bi-trash"></i>
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr className="bg-light fw-bold">
                                                <td colSpan="3" className="text-end small">Total Consumption:</td>
                                                <td className={`text-end small ${tempYarnAssignments.reduce((sum, y) => sum + (parseFloat(y.yarnConsumption) || 0), 0) === 100 ? 'text-success' : 'text-danger'}`}>
                                                    {tempYarnAssignments.reduce((sum, y) => sum + (parseFloat(y.yarnConsumption) || 0), 0)}%
                                                </td>
                                                <td></td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                                {!isLocked && (
                                    <button className="btn btn-outline-primary btn-sm rounded-pill px-3 mt-2" onClick={handleAddYarnRow}>
                                        <i className="bi bi-plus-lg me-1"></i> Add Another Yarn
                                    </button>
                                )}
                            </div>
                            <div className="modal-footer border-0 p-4 pt-0">
                                <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => setShowYarnModal(false)}>{isLocked ? 'Close' : 'Cancel'}</button>
                                {!isLocked && <button type="button" className="btn btn-primary rounded-pill px-4 fw-bold" onClick={saveYarnAssignments}>Apply & Close</button>}
                            </div>
                        </div>
                    </div>
                </div>
            )
            }
        </div >
    );
};

export default OrderYarnPlanning;
