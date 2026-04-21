import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const API = process.env.REACT_APP_API_URL;

function OpenJobWorks() {
    const navigate = useNavigate();
    const [list, setList] = useState([]);
    const [filters, setFilters] = useState({
        company_name: "",
        job_no: ""
    });

    const fetchData = useCallback(async () => {
        try {
            const res = await axios.get(`${API}/job_inward/open-jobs`);
            setList(res.data);
        } catch (err) {
            console.error(err);
        }
    }, []);

    useEffect(() => {
        fetchData();
        document.title = "Open Job Works - TSL ERP";
    }, [fetchData]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const getStatus = (item) => {
        const totalOut = parseFloat(item.job_out_qty || 0) + parseFloat(item.job_return_qty || 0);
        const totalIn = parseFloat(item.job_in_qty || 0);

        if (totalOut >= totalIn && totalIn > 0) return { label: "Completed", color: "bg-success" };
        if (totalOut > 0) return { label: "Partial", color: "bg-warning text-dark" };
        return { label: "Pending", color: "bg-danger" };
    };

    const convertToInvoice = async (item) => {
        if (item.is_converted > 0) {
            alert(`For this inward number (#${item.id}) already invoiced`);
            return;
        }
        try {
            // Fetch outward items for this inward to get fabric names
            const res = await axios.get(`${API}/job_outward/by-inward/${item.id}`);
            const outwardItems = res.data;

            if (outwardItems.length === 0) {
                alert("No outward records found to convert");
                return;
            }

            // Group by fabric name and sum weights
            const fabricSummary = {};
            for (const row of outwardItems) {
                if (!fabricSummary[row.fabric_name]) {
                    fabricSummary[row.fabric_name] = {
                        product_name: row.fabric_name,
                        sku: row.fabric_name, // Fabric Name as SKU
                        qty: 0
                    };
                }
                fabricSummary[row.fabric_name].qty += parseFloat(row.outward_weight || 0);
            }

            // Fetch product details for each fabric to get Rate and GST
            const itemsWithDetails = await Promise.all(Object.values(fabricSummary).map(async (f) => {
                try {
                    const prodRes = await axios.get(`${API}/products?term=${encodeURIComponent(f.product_name)}`);
                    const products = prodRes.data;
                    const match = products.find(p => p.product_name === f.product_name || p.sku === f.product_name);

                    return {
                        ...f,
                        rate: match?.selling_price || 0,
                        gst_percent: match?.gst || 0,
                        total: (f.qty * (match?.selling_price || 0))
                    };
                } catch (err) {
                    return { ...f, rate: 0, gst_percent: 0, total: 0 };
                }
            }));

            const convertData = {
                customer_name: item.company_name,
                items: itemsWithDetails,
                job_inward_id: item.id
            };

            navigate("/invoiceform", { state: { convertData } });
        } catch (err) {
            console.error(err);
            alert("Failed to convert to invoice");
        }
    };

    const filteredList = list.filter(item =>
        item.company_name?.toLowerCase().includes(filters.company_name.toLowerCase()) &&
        (item.job_no || "").toLowerCase().includes(filters.job_no.toLowerCase())
    );

    return (
        <div className="container-fluid py-4 min-vh-100 bg-light">
            <div className="card shadow-sm border-0 rounded-3">
                <div className="card-header bg-white py-3 border-bottom-0">
                    <div className="d-flex justify-content-between align-items-center">
                        <h4 className="mb-0 fw-bold text-dark">Open Job Works</h4>
                        <button className="btn btn-outline-primary btn-sm" onClick={fetchData}>
                            <i className="bi bi-arrow-clockwise me-1"></i> Refresh
                        </button>
                    </div>
                </div>

                <div className="card-body p-4 pt-0">
                    {/* Filter Section */}
                    <div className="row g-3 mb-4 p-3 bg-light rounded border border-white shadow-sm">
                        <div className="col-md-3">
                            <label className="form-label small fw-bold text-muted">Company Name</label>
                            <input type="text" name="company_name" className="form-control form-control-sm" placeholder="Search Company..." value={filters.company_name} onChange={handleFilterChange} />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label small fw-bold text-muted">Job No.</label>
                            <input type="text" name="job_no" className="form-control form-control-sm" placeholder="Search Job No..." value={filters.job_no} onChange={handleFilterChange} />
                        </div>
                    </div>

                    <div className="table-responsive">
                        <table className="table table-hover align-middle">
                            <thead className="table-dark">
                                <tr>
                                    <th className="px-3 text-center">Inward No</th>
                                    <th className="px-3">Job No</th>
                                    <th className="px-3">Company Name</th>
                                    <th className="px-3 text-center">Date</th>
                                    <th className="px-3 text-end">Job In Qty</th>
                                    <th className="px-3 text-end text-primary">Job Out Qty</th>
                                    <th className="px-3 text-end text-success">Return Qty</th>
                                    <th className="px-3 text-end text-danger">Balance</th>
                                    <th className="px-3 text-center">Status</th>
                                    <th className="px-3 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredList.map((item) => {
                                    const status = getStatus(item);
                                    const balance = parseFloat(item.job_in_qty || 0) - (parseFloat(item.job_out_qty || 0) + parseFloat(item.job_return_qty || 0));
                                    return (
                                        <tr key={item.id} className={item.is_converted > 0 ? "table-success" : ""}>
                                            <td className="px-3 text-center fw-bold text-primary">{item.id}</td>
                                            <td className="px-3">{item.job_no}</td>
                                            <td className="px-3 text-dark fw-medium">{item.company_name}</td>
                                            <td className="px-3 text-center text-muted small">{new Date(item.create_date).toLocaleDateString()}</td>
                                            <td className="px-3 text-end fw-bold">{parseFloat(item.job_in_qty || 0).toFixed(2)}</td>
                                            <td className="px-3 text-end text-primary fw-bold">{parseFloat(item.job_out_qty || 0).toFixed(2)}</td>
                                            <td className="px-3 text-end text-success fw-bold">{parseFloat(item.job_return_qty || 0).toFixed(2)}</td>
                                            <td className="px-3 text-end text-danger fw-bold">{balance.toFixed(2)}</td>
                                            <td className="px-3 text-center">
                                                <span className={`badge ${status.color} px-3 py-2 rounded-pill`} style={{ fontSize: '0.7rem' }}>
                                                    {status.label}
                                                </span>
                                            </td>
                                            <td className="px-3 text-center">
                                                <div className="d-flex justify-content-center gap-1">
                                                    <button
                                                        className="btn btn-xs btn-success text-white"
                                                        onClick={() => convertToInvoice(item)}
                                                        disabled={parseFloat(item.job_out_qty || 0) === 0}
                                                        title="Convert to Invoice"
                                                    >
                                                        <i className="bi bi-file-earmark-plus"></i> Invoice
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filteredList.length === 0 && (
                                    <tr><td colSpan="10" className="text-center py-5 text-muted">No open jobs found</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default OpenJobWorks;
