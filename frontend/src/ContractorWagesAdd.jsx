import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import "bootstrap/dist/css/bootstrap.min.css";

const API = process.env.REACT_APP_API_URL;

const ContractorWagesAdd = () => {
    const { id } = useParams(); // For edit mode
    const navigate = useNavigate();
    const [loadingMasters, setLoadingMasters] = useState(false);
    const [loadingData, setLoadingData] = useState(false);
    const [saving, setSaving] = useState(false);
    const [orders, setOrders] = useState([]);
    const [contractors, setContractors] = useState([]);
    const [processes, setProcesses] = useState([]);

    const [header, setHeader] = useState({
        order_id: "",
        order_name: "",
    });

    const [items, setItems] = useState([]);

    // Temporary input state
    const [tempItem, setTempItem] = useState({
        style_name: "",
        color: "",
        contractor: "",
        process: "",
        qty: "",
        rate: "",
    });

    useEffect(() => {
        const fetchMasters = async () => {
            try {
                setLoadingMasters(true);
                const [ordersRes, contractorsRes, processesRes] = await Promise.all([
                    axios.get(`${API}/order_planning?exclude_completed=true`),
                    axios.get(`${API}/supplier`),
                    axios.get(`${API}/life-cycles`)
                ]);
                const orderData = ordersRes.data.data || ordersRes.data || [];
                const mappedOrders = orderData.map(o => ({
                    value: o.id,
                    label: o.order_no,
                    name: o.order_name || o.orderName
                }));
                setOrders(mappedOrders);
                setContractors(contractorsRes.data.map(s => ({ value: s.name, label: s.name })));
                setProcesses(processesRes.data.map(p => ({ value: p.process_name, label: p.process_name })));
                return mappedOrders;
            } catch (err) {
                console.error("Failed to fetch masters", err);
                return [];
            } finally {
                setLoadingMasters(false);
            }
        };

        const fetchExistingData = async (currentOrders) => {
            if (!id) return;
            setLoadingData(true);
            try {
                const res = await axios.get(`${API}/contractor-wages/${id}`);
                const data = res.data;
                const parentOrder = currentOrders.find(o => o.value === data.order_id);

                setHeader({
                    order_id: data.order_id,
                    order_no: parentOrder?.label || "",
                    order_name: data.order_name
                });

                setItems(data.items.map(it => ({
                    ...it,
                    qty: parseFloat(it.qty) || 0,
                    rate: parseFloat(it.rate) || 0,
                    total_rate: parseFloat(it.total_rate) || 0
                })));
            } catch (err) {
                toast.error("Failed to fetch existing entry");
            } finally {
                setLoadingData(false);
            }
        };

        const init = async () => {
            const loadedOrders = await fetchMasters();
            if (id) {
                await fetchExistingData(loadedOrders);
            }
        };
        init();
    }, [id]); // Removed 'API' as it's defined in the outer scope

    const handleOrderChange = (option) => {
        setHeader({
            order_id: option.value,
            order_no: option.label,
            order_name: option.name
        });
    };

    const handleLoadInward = async () => {
        if (!header.order_no) return toast.warning("Please select an order first");
        setLoadingData(true);
        try {
            const res = await axios.get(`${API}/pcs-inward/for-wages/${header.order_no}`);
            if (res.data.length === 0) {
                toast.info("No contractor inward items found for this order");
                return;
            }
            const mapped = res.data.map(it => ({
                style_name: it.style_name || it.item_name || it.order_name || "",
                color: it.style_color || it.color || "",
                contractor: it.contractor_name || it.header_contractor || "",
                process: it.process || "",
                qty: parseFloat(it.pcs) || 0,
                rate: 0,
                total_rate: 0
            }));
            setItems(mapped);
            toast.success(`${mapped.length} items loaded`);
        } catch (err) {
            toast.error("Failed to load items");
        } finally {
            setLoadingData(false);
        }
    };

    const handleRateChange = (idx, val) => {
        const newItems = [...items];
        const rate = parseFloat(val) || 0;
        newItems[idx].rate = rate;
        newItems[idx].total_rate = newItems[idx].qty * rate;
        setItems(newItems);
    };

    const handleAddItem = () => {
        if (!tempItem.style_name || !tempItem.color || !tempItem.contractor || !tempItem.process || !tempItem.qty || !tempItem.rate) {
            toast.warning("Please fill all fields for the item");
            return;
        }

        const qty = parseFloat(tempItem.qty) || 0;
        const rate = parseFloat(tempItem.rate) || 0;
        const total_rate = qty * rate;

        setItems([...items, { ...tempItem, qty, rate, total_rate }]);
        setTempItem({
            style_name: "",
            color: "",
            contractor: "",
            process: "",
            qty: "",
            rate: "",
        });
    };

    const handleRemoveItem = (index) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        if (!header.order_id) return toast.warning("Please select an order");
        if (items.length === 0) return toast.warning("Add at least one item");

        setSaving(true);
        try {
            const payload = {
                order_id: header.order_id,
                order_name: header.order_name,
                items: items
            };

            if (id) {
                await axios.put(`${API}/contractor-wages/${id}`, payload);
                toast.success("Contractor wages updated!");
            } else {
                await axios.post(`${API}/contractor-wages`, payload);
                toast.success("Contractor wages saved!");
            }
            navigate('/contractor-wages-list');
        } catch (err) {
            toast.error("Failed to save");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="container-fluid p-4" style={{ backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold text-dark mb-1">{id ? "Edit Entry" : "New Entry"} - Contractor Wages</h2>
                    <p className="text-secondary small mb-0">Record piece-rate payments for specific orders</p>
                </div>
                <button className="btn btn-outline-secondary px-4 py-2 rounded-pill shadow-sm" onClick={() => navigate('/contractor-wages-list')}>
                    <i className="bi bi-arrow-left me-2"></i> Back to List
                </button>
            </div>

            <div className="row g-4">
                {/* Header Information */}
                <div className="col-12">
                    <div className="card border-0 shadow-sm rounded-4 p-4">
                        <div className="row g-3 align-items-end">
                            <div className="col-md-3">
                                <label className="form-label fw-bold small text-muted">Order No</label>
                                <Select
                                    options={orders}
                                    onChange={handleOrderChange}
                                    value={orders.find(o => o.value === header.order_id)}
                                    placeholder="Select Order..."
                                    styles={{ control: (b) => ({ ...b, borderRadius: '10px', padding: '2px' }) }}
                                />
                            </div>
                            <div className="col-md-5">
                                <label className="form-label fw-bold small text-muted">Order Name</label>
                                <input type="text" className="form-control form-control-lg border-0 bg-light rounded-4 fw-bold" readOnly value={header.order_name} placeholder="Automatically populated..." />
                            </div>
                            <div className="col-md-4">
                                <button
                                    className="btn btn-primary btn-lg w-100 rounded-4 fw-bold shadow-sm"
                                    onClick={handleLoadInward}
                                    disabled={loadingMasters || loadingData || saving || !header.order_id}
                                >
                                    <i className="bi bi-cloud-download me-2"></i>
                                    {loadingData ? "Loading..." : "Load Inwarded Pcs & Contractors"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Add Item Form */}
                <div className="col-12">
                    <div className="card border-0 shadow-sm rounded-4 p-4">
                        <h6 className="fw-bold mb-3 text-primary"><i className="bi bi-plus-circle-fill me-2"></i>Add Details</h6>
                        <div className="row g-2">
                            <div className="col-md-2">
                                <label className="form-label x-small fw-bold text-muted">Style Name</label>
                                <input type="text" className="form-control form-control-sm rounded-3" value={tempItem.style_name} onChange={e => setTempItem({ ...tempItem, style_name: e.target.value })} />
                            </div>
                            <div className="col-md-2">
                                <label className="form-label x-small fw-bold text-muted">Color</label>
                                <input type="text" className="form-control form-control-sm rounded-3" value={tempItem.color} onChange={e => setTempItem({ ...tempItem, color: e.target.value })} />
                            </div>
                            <div className="col-md-2">
                                <label className="form-label x-small fw-bold text-muted">Contractor</label>
                                <CreatableSelect
                                    options={contractors}
                                    onChange={(opt) => setTempItem({ ...tempItem, contractor: opt?.value || "" })}
                                    value={contractors.find(c => c.value === tempItem.contractor) || { label: tempItem.contractor, value: tempItem.contractor }}
                                    placeholder="Search..."
                                    styles={{ control: (b) => ({ ...b, borderRadius: '8px', minHeight: '34px', fontSize: '0.85rem' }), valueContainer: (b) => ({ ...b, padding: '0 8px' }) }}
                                />
                            </div>
                            <div className="col-md-2">
                                <label className="form-label x-small fw-bold text-muted">Process</label>
                                <CreatableSelect
                                    options={processes}
                                    onChange={(opt) => setTempItem({ ...tempItem, process: opt?.value || "" })}
                                    value={processes.find(p => p.value === tempItem.process) || { label: tempItem.process, value: tempItem.process }}
                                    placeholder="Search..."
                                    styles={{ control: (b) => ({ ...b, borderRadius: '8px', minHeight: '34px', fontSize: '0.85rem' }), valueContainer: (b) => ({ ...b, padding: '0 8px' }) }}
                                />
                            </div>
                            <div className="col-md-1">
                                <label className="form-label x-small fw-bold text-muted">Qty</label>
                                <input type="number" className="form-control form-control-sm rounded-3 fw-bold" value={tempItem.qty} onChange={e => setTempItem({ ...tempItem, qty: e.target.value })} />
                            </div>
                            <div className="col-md-1">
                                <label className="form-label x-small fw-bold text-muted">Rate</label>
                                <input type="number" className="form-control form-control-sm rounded-3 fw-bold" value={tempItem.rate} onChange={e => setTempItem({ ...tempItem, rate: e.target.value })} />
                            </div>
                            <div className="col-md-2 d-flex align-items-end">
                                <button className="btn btn-primary btn-sm w-100 rounded-3 fw-bold" onClick={handleAddItem}><i className="bi bi-plus-lg me-1"></i> Add Item</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Items Table */}
                <div className="col-12">
                    <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead style={{ backgroundColor: '#000', color: '#fff' }}>
                                    <tr>
                                        <th className="px-4 py-3">Style Name</th>
                                        <th className="py-3">Color</th>
                                        <th className="py-3">Contractor</th>
                                        <th className="py-3">Process</th>
                                        <th className="py-3 text-center" style={{ width: '120px' }}>Actual Qty</th>
                                        <th className="py-3 text-center" style={{ width: '150px' }}>Rate (₹)</th>
                                        <th className="py-3 text-end" style={{ width: '150px' }}>Total Rate</th>
                                        <th className="py-3 text-end px-4" style={{ width: '80px' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white">
                                    {items.length === 0 ? (
                                        <tr>
                                            <td colSpan="8" className="text-center py-5 text-muted small italic">
                                                <div className="mb-2"><i className="bi bi-inbox fs-2 opacity-25"></i></div>
                                                No items loaded yet. Select an order and click "Load" or add manually.
                                            </td>
                                        </tr>
                                    ) : (
                                        items.map((it, idx) => (
                                            <tr key={idx}>
                                                <td className="px-4 fw-bold">{it.style_name}</td>
                                                <td>{it.color}</td>
                                                <td><span className="badge bg-light text-dark border px-2 py-1 rounded">{it.contractor}</span></td>
                                                <td><span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1 rounded">{it.process}</span></td>
                                                <td className="text-center fw-bold">{it.qty}</td>
                                                <td className="text-center">
                                                    <input
                                                        type="number"
                                                        className="form-control form-control-sm text-center fw-bold border-primary-subtle"
                                                        style={{ borderRadius: '6px' }}
                                                        value={it.rate}
                                                        onChange={(e) => handleRateChange(idx, e.target.value)}
                                                        min="0"
                                                        step="0.1"
                                                    />
                                                </td>
                                                <td className="text-end fw-bold text-dark">₹{it.total_rate.toFixed(2)}</td>
                                                <td className="text-end px-4">
                                                    <button className="btn btn-link link-danger p-0 outline-none" onClick={() => handleRemoveItem(idx)}>
                                                        <i className="bi bi-trash3-fill"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                                {items.length > 0 && (
                                    <tfoot className="bg-light">
                                        <tr>
                                            <td colSpan="6" className="text-end fw-bold py-3 px-4">Grand Total:</td>
                                            <td className="text-end fw-bold fs-5 py-3 text-primary">₹{items.reduce((acc, it) => acc + (it.total_rate || 0), 0).toFixed(2)}</td>
                                            <td></td>
                                        </tr>
                                    </tfoot>
                                )}
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <div className="d-flex justify-content-end mt-4">
                <button className="btn btn-success px-5 py-3 rounded-pill fw-bold shadow-lg" onClick={handleSave} disabled={saving || loadingData}>
                    <i className="bi bi-cloud-check me-2 fs-5"></i> {saving ? "Saving..." : id ? "Update Entry" : "Save Entry"}
                </button>
            </div>

            <style>{`
                .x-small { font-size: 0.7rem; }
            `}</style>
        </div>
    );
};

export default ContractorWagesAdd;
