
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Select from "react-select";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";

const API = process.env.REACT_APP_API_URL;

const EditGarmentsGRN = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [grnNo, setGrnNo] = useState("");
    const [suppliers, setSuppliers] = useState([]);
    const [staff, setStaff] = useState([]);
    const [orders, setOrders] = useState([]);

    const [header, setHeader] = useState({
        supplier_name: "",
        grn_date: "",
        dc_no: "",
        dc_date: "",
        staff_name: "",
        order_id: null,
        order_no: "",
        order_name: "",
        remarks: "",
    });

    const [items, setItems] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [grnRes, supRes, staffRes, orderRes] = await Promise.all([
                    axios.get(`${API}/garments-grn/${id}`),
                    axios.get(`${API}/supplier`),
                    axios.get(`${API}/employees`),
                    axios.get(`${API}/order_planning`),
                ]);

                const grnData = grnRes.data;
                setGrnNo(grnData.grn_no);
                setHeader({
                    supplier_name: grnData.supplier_name,
                    grn_date: grnData.grn_date ? new Date(grnData.grn_date).toISOString().split("T")[0] : "",
                    dc_no: grnData.dc_no,
                    dc_date: grnData.dc_date ? new Date(grnData.dc_date).toISOString().split("T")[0] : "",
                    staff_name: grnData.staff_name,
                    order_id: grnData.order_id,
                    order_no: grnData.order_no,
                    order_name: grnData.order_name,
                    remarks: grnData.remarks
                });
                setItems((grnData.items || []).map(it => ({
                    ...it,
                    qty: Number(it.qty || 0).toFixed(3)
                })));

                setSuppliers(supRes.data.map((s) => ({ value: s.supplier_name, label: s.supplier_name })));
                setStaff(staffRes.data.map((e) => ({ value: e.employee_name, label: e.employee_name })));
                const orderData = orderRes.data.data || orderRes.data;
                setOrders(orderData.map((o) => ({ value: o.id, label: o.order_no, details: o })));
            } catch (err) {
                console.error("Error fetching GRN data:", err);
                toast.error("Failed to load GRN data");
            }
        };
        fetchData();
    }, [id]);

    const handleHeaderChange = (e) => {
        const { name, value } = e.target;
        setHeader((prev) => ({ ...prev, [name]: value }));
    };

    const handleOrderSelect = (selected) => {
        if (selected) {
            setHeader((prev) => ({
                ...prev,
                order_id: selected.value,
                order_no: selected.label,
                order_name: selected.details.order_name || "",
            }));
        } else {
            setHeader((prev) => ({ ...prev, order_id: null, order_no: "", order_name: "" }));
        }
    };

    const handleItemChange = (index, e) => {
        const { name, value } = e.target;
        const newItems = [...items];
        newItems[index][name] = value;
        setItems(newItems);
    };

    const addItem = () => {
        setItems([...items, { style_name: "", color: "", size: "", qty: "" }]);
    };

    const removeItem = (index) => {
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
    };

    const saveGRN = async () => {
        if (!header.supplier_name) return toast.error("Supplier Name is required");

        try {
            await axios.put(`${API}/garments-grn/${id}`, {
                ...header,
                items,
            });
            toast.success("Garments GRN Updated Successfully!");
            setTimeout(() => navigate("/garments-grn-list"), 1500);
        } catch (err) {
            console.error("Error updating GRN:", err);
            toast.error("Failed to update GRN");
        }
    };

    return (
        <div className="container-fluid mt-4 mb-5">
            <ToastContainer />
            <div className="card shadow border-0 rounded-4">
                <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center border-bottom-0">
                    <h4 className="mb-0 fw-bold text-primary">
                        <i className="bi bi-pencil-square me-2"></i>Edit Garments GRN
                    </h4>
                    <span className="badge bg-primary fs-6">{grnNo}</span>
                </div>
                <div className="card-body p-4">
                    {/* Header Fields */}
                    <div className="row g-3 mb-4">
                        <div className="col-md-3">
                            <label className="form-label fw-semibold text-muted">Supplier Name</label>
                            <Select
                                options={suppliers}
                                value={suppliers.find((s) => s.value === header.supplier_name)}
                                onChange={(opt) => setHeader((prev) => ({ ...prev, supplier_name: opt?.value || "" }))}
                                placeholder="Select Supplier"
                            />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label fw-semibold text-muted">GRN Date</label>
                            <input type="date" className="form-control" name="grn_date" value={header.grn_date} onChange={handleHeaderChange} />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label fw-semibold text-muted">DC No</label>
                            <input type="text" className="form-control" name="dc_no" value={header.dc_no} onChange={handleHeaderChange} />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label fw-semibold text-muted">DC Date</label>
                            <input type="date" className="form-control" name="dc_date" value={header.dc_date} onChange={handleHeaderChange} />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label fw-semibold text-muted">Staff Name</label>
                            <Select
                                options={staff}
                                value={staff.find((e) => e.value === header.staff_name)}
                                onChange={(opt) => setHeader((prev) => ({ ...prev, staff_name: opt?.value || "" }))}
                                placeholder="Select Staff"
                            />
                        </div>
                        <div className="col-md-9">
                            <label className="form-label fw-semibold text-muted">Remarks</label>
                            <input type="text" className="form-control" name="remarks" value={header.remarks} onChange={handleHeaderChange} />
                        </div>
                    </div>

                    {/* Order Selection */}
                    <div className="card bg-light border-0 p-3 mb-4 rounded-3">
                        <h6 className="fw-bold mb-3 text-secondary">Order Details</h6>
                        <div className="row g-3">
                            <div className="col-md-4">
                                <label className="form-label small text-muted">Order No</label>
                                <Select
                                    options={orders}
                                    value={orders.find((o) => o.value === header.order_id)}
                                    onChange={handleOrderSelect}
                                    placeholder="Select Order"
                                />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label small text-muted">Order Name</label>
                                <input type="text" className="form-control bg-white" value={header.order_name} readOnly />
                            </div>
                        </div>
                    </div>

                    {/* Table Section */}
                    <div className="table-responsive mb-3">
                        <table className="table table-bordered table-hover align-middle">
                            <thead className="table-dark text-white">
                                <tr>
                                    <th>Style Name</th>
                                    <th>SKU</th>
                                    <th>Color</th>
                                    <th>Size</th>
                                    <th>Total Qty</th>
                                    <th className="text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item, index) => (
                                    <tr key={index}>
                                        <td><input type="text" name="style_name" className="form-control form-control-sm" value={item.style_name} onChange={(e) => handleItemChange(index, e)} /></td>
                                        <td><input type="text" name="sku" className="form-control form-control-sm" value={item.sku} onChange={(e) => handleItemChange(index, e)} /></td>
                                        <td><input type="text" name="color" className="form-control form-control-sm" value={item.color} onChange={(e) => handleItemChange(index, e)} /></td>
                                        <td><input type="text" name="size" className="form-control form-control-sm" value={item.size} onChange={(e) => handleItemChange(index, e)} /></td>
                                        <td><input type="number" name="qty" step="0.001" className="form-control form-control-sm fw-bold" value={item.qty} onChange={(e) => handleItemChange(index, e)} /></td>
                                        <td className="text-center">
                                            <button className="btn btn-outline-danger btn-sm rounded-circle" onClick={() => removeItem(index)}><i className="bi bi-trash"></i></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="table-light fw-bold">
                                <tr>
                                    <td colSpan="4" className="text-end">Total GRN Qty:</td>
                                    <td className="text-primary">{items.reduce((sum, item) => sum + Number(item.qty || 0), 0).toFixed(3)}</td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                    <button className="btn btn-outline-primary btn-sm rounded-pill mb-4" onClick={addItem}>
                        <i className="bi bi-plus-lg me-1"></i> Add Row
                    </button>

                    <div className="d-flex justify-content-end gap-2">
                        <button className="btn btn-secondary rounded-pill px-4" onClick={() => navigate("/garments-grn-list")}>
                            Cancel
                        </button>
                        <button className="btn btn-success rounded-pill px-4 fw-bold" onClick={saveGRN}>
                            <i className="bi bi-check-lg me-2"></i>Update Garments GRN
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditGarmentsGRN;
