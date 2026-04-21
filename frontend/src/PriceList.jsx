import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

const API = process.env.REACT_APP_API_URL || "http://localhost:8081";

function PriceList({ defaultListId = "", hideListSelector = false }) {
    const [lists, setLists] = useState([]);
    const [selectedList, setSelectedList] = useState(defaultListId);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    const fetchLists = useCallback(async () => {
        try {
            const res = await axios.get(`${API}/pricelist-master`);
            setLists(res.data);
            if (res.data.length > 0 && !selectedList) {
                setSelectedList(res.data[0].id);
            }
        } catch (err) {
            console.error("Error fetching price lists:", err);
        }
    }, [selectedList]);

    useEffect(() => {
        fetchLists();
    }, [fetchLists]);

    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API}/pricelist-details/${selectedList}`);
            setProducts(res.data);
        } catch (err) {
            console.error("Error fetching prices:", err);
            setMessage("Failed to load products");
        } finally {
            setLoading(false);
        }
    }, [selectedList]);

    useEffect(() => {
        if (selectedList) {
            fetchProducts();
        }
    }, [selectedList, fetchProducts]);

    const handlePriceChange = (id, field, value) => {
        setProducts(prev =>
            prev.map(p => p.product_id === id ? { ...p, [field]: parseFloat(value) || 0 } : p)
        );
    };

    const handleSave = async () => {
        if (!selectedList) {
            setMessage("❌ Please select a price list first");
            return;
        }
        try {
            setMessage("Saving...");
            const itemsToUpdate = products.map(p => ({
                product_id: p.product_id,
                mrp: p.mrp,
                selling_price: p.selling_price,
                discount: p.discount
            }));

            await axios.post(`${API}/pricelist-details/update`, {
                price_list_id: selectedList,
                items: itemsToUpdate
            });
            setMessage("✅ Prices updated successfully!");
            setTimeout(() => setMessage(""), 3000);
        } catch (err) {
            console.error("Error saving prices:", err);
            setMessage("❌ Failed to save prices");
        }
    };

    const filteredProducts = products.filter(p =>
        p.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container-fluid p-4">
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                <div>
                    <h2 className="fw-bold text-primary mb-0">Product Price List</h2>
                    <p className="text-muted">Manage pricing for specific customer lists</p>
                </div>
                <div className="d-flex gap-2 flex-wrap align-items-center">
                    {!hideListSelector && (
                        <div className="d-flex align-items-center gap-2">
                            <label className="fw-bold text-muted small text-nowrap">Price List Name:</label>
                            <select
                                className="form-select shadow-sm"
                                style={{ width: "200px" }}
                                value={selectedList}
                                onChange={(e) => setSelectedList(e.target.value)}
                            >
                                <option value="">Select List...</option>
                                {lists.map(list => (
                                    <option key={list.id} value={list.id}>{list.name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    <input
                        type="text"
                        className="form-control shadow-sm"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: "250px" }}
                    />
                    <button className="btn btn-primary px-4 shadow-sm" onClick={handleSave}>
                        Save All Changes
                    </button>
                </div>
            </div>

            {message && (
                <div className={`alert ${message.includes("✅") ? "alert-success" : "alert-info"} shadow-sm mb-4`}>
                    {message}
                </div>
            )}

            <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th className="px-4">SKU</th>
                                <th>Product Name</th>
                                <th style={{ width: "130px" }}>MRP (₹)</th>
                                <th style={{ width: "130px" }}>Selling Price (₹)</th>
                                <th style={{ width: "130px" }}>Discount (%)</th>
                                <th>Margin (%)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-5">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : !selectedList ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-5 text-muted">
                                        Please select or create a Price List Name.
                                    </td>
                                </tr>
                            ) : filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-5 text-muted">
                                        No products found.
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map((product) => {
                                    const effectivePrice = product.selling_price * (1 - (product.discount || 0) / 100);
                                    const margin = effectivePrice > 0
                                        ? (((effectivePrice - product.purchase_price) / effectivePrice) * 100).toFixed(2)
                                        : 0;

                                    return (
                                        <motion.tr
                                            key={product.product_id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                        >
                                            <td className="px-4 fw-semibold text-muted">{product.sku}</td>
                                            <td className="fw-bold text-dark">{product.product_name}</td>
                                            <td>
                                                <input
                                                    type="number"
                                                    className="form-control form-control-sm border-0 bg-light text-center"
                                                    value={product.mrp}
                                                    onChange={(e) => handlePriceChange(product.product_id, "mrp", e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="number"
                                                    className="form-control form-control-sm border-0 bg-light text-primary fw-bold text-center"
                                                    value={product.selling_price}
                                                    onChange={(e) => handlePriceChange(product.product_id, "selling_price", e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="number"
                                                    className="form-control form-control-sm border-0 bg-light text-center text-success"
                                                    value={product.discount}
                                                    placeholder="%"
                                                    onChange={(e) => handlePriceChange(product.product_id, "discount", e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <span className={`badge rounded-pill ${margin > 20 ? "bg-success" : margin > 0 ? "bg-warning" : "bg-danger"}`}>
                                                    {margin}%
                                                </span>
                                            </td>
                                        </motion.tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default PriceList;
