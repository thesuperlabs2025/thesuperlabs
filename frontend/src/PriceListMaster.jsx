import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import "bootstrap/dist/css/bootstrap.min.css";
import PriceList from "./PriceList"; // Import the existing component

const API = process.env.REACT_APP_API_URL || "http://localhost:8081";

function PriceListMaster() {
    const [lists, setLists] = useState([]);
    const [name, setName] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [showPriceEditor, setShowPriceEditor] = useState(false);
    const [selectedListForPrices, setSelectedListForPrices] = useState(null);

    useEffect(() => {
        fetchLists();
    }, []);

    const fetchLists = async () => {
        try {
            const res = await axios.get(`${API}/pricelist-master`);
            setLists(res.data);
        } catch (err) {
            console.error("Error fetching price lists:", err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        setLoading(true);
        try {
            if (editingId) {
                await axios.put(`${API}/pricelist-master/${editingId}`, { name });
                setMessage("✅ Price list updated");
            } else {
                await axios.post(`${API}/pricelist-master`, { name });
                setMessage("✅ Price list created");
            }
            setName("");
            setEditingId(null);
            fetchLists();
            setTimeout(() => setMessage(""), 3000);
        } catch (err) {
            setMessage("❌ Operation failed");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (list) => {
        setName(list.name);
        setEditingId(list.id);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this price list?")) return;
        try {
            await axios.delete(`${API}/pricelist-master/${id}`);
            fetchLists();
            setMessage("🗑️ Deleted successfully");
            setTimeout(() => setMessage(""), 3000);
        } catch (err) {
            setMessage("❌ Delete failed");
        }
    };

    const openPriceEditor = (list) => {
        setSelectedListForPrices(list);
        setShowPriceEditor(true);
    };

    if (showPriceEditor) {
        return (
            <div className="container-fluid p-4">
                <div className="d-flex align-items-center mb-4">
                    <button
                        className="btn btn-outline-secondary me-3 shadow-sm rounded-3"
                        onClick={() => setShowPriceEditor(false)}
                    >
                        <i className="bi bi-arrow-left me-1"></i> Back to Master
                    </button>
                    <div>
                        <h2 className="fw-bold text-primary mb-0">Managing Prices: {selectedListForPrices.name}</h2>
                        <p className="text-muted mb-0">Product-specific pricing for this list</p>
                    </div>
                </div>
                <PriceList defaultListId={selectedListForPrices.id} hideListSelector={true} />
            </div>
        );
    }

    return (
        <div className="container-fluid p-4">
            <div className="row g-4">
                <div className="col-md-5">
                    <div className="card shadow-sm border-0 p-4 rounded-4">
                        <h4 className="fw-bold text-primary mb-4">
                            {editingId ? "Edit Price List" : "Add New Price List"}
                        </h4>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="form-label fw-semibold text-muted">Price List Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="e.g. Retail, Wholesale..."
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="d-flex gap-2">
                                <button type="submit" className="btn btn-primary px-4 shadow-sm" disabled={loading}>
                                    {loading ? "Saving..." : editingId ? "Update" : "Create"}
                                </button>
                                {editingId && (
                                    <button type="button" className="btn btn-light px-4" onClick={() => { setEditingId(null); setName(""); }}>
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                        {message && <div className="mt-3 small text-muted">{message}</div>}
                    </div>
                </div>

                <div className="col-md-7">
                    <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="bg-light">
                                    <tr>
                                        <th className="px-4">ID</th>
                                        <th>Name</th>
                                        <th className="text-end px-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <AnimatePresence>
                                        {lists.map((list) => (
                                            <motion.tr
                                                key={list.id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 10 }}
                                            >
                                                <td className="px-4 text-muted">{list.id}</td>
                                                <td>
                                                    <div className="fw-bold">{list.name}</div>
                                                    <small className="text-primary cursor-pointer" style={{ cursor: 'pointer' }} onClick={() => openPriceEditor(list)}>
                                                        <i className="bi bi-tags-fill me-1"></i> Edit Product Prices
                                                    </small>
                                                </td>
                                                <td className="text-end px-4">
                                                    <button className="btn btn-light btn-sm text-primary me-2 rounded-3" onClick={() => handleEdit(list)}>
                                                        <i className="bi bi-pencil"></i>
                                                    </button>
                                                    <button className="btn btn-light btn-sm text-danger rounded-3" onClick={() => handleDelete(list.id)}>
                                                        <i className="bi bi-trash"></i>
                                                    </button>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                    {lists.length === 0 && (
                                        <tr>
                                            <td colSpan="3" className="text-center py-5 text-muted">No price lists defined yet.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PriceListMaster;
