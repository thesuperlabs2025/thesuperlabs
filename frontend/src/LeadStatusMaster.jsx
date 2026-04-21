import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const API = process.env.REACT_APP_API_URL;

function LeadStatusMaster() {
    const [list, setList] = useState([]);
    const [newName, setNewName] = useState("");
    const [newColor, setNewColor] = useState("#0d6efd");
    const [editId, setEditId] = useState(null);
    const [editName, setEditName] = useState("");
    const [editColor, setEditColor] = useState("");

    const fetchData = useCallback(async () => {
        try {
            const res = await axios.get(`${API}/lead-masters/lead_statuses`);
            setList(res.data);
        } catch (err) {
            console.error(err);
        }
    }, []);

    useEffect(() => {
        fetchData();
        document.title = "Lead Status Master - TSL ERP";
    }, [fetchData]);

    const handleAdd = async () => {
        if (!newName.trim()) return;
        try {
            await axios.post(`${API}/lead-masters/lead_statuses`, { name: newName, color: newColor });
            setNewName("");
            setNewColor("#0d6efd");
            fetchData();
        } catch (err) {
            alert("Error adding lead status");
        }
    };

    const handleUpdate = async () => {
        if (!editName.trim()) return;
        try {
            await axios.put(`${API}/lead-masters/lead_statuses/${editId}`, { name: editName, color: editColor });
            setEditId(null);
            fetchData();
        } catch (err) {
            alert("Error updating lead status");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure?")) {
            try {
                await axios.delete(`${API}/lead-masters/lead_statuses/${id}`);
                fetchData();
            } catch (err) {
                alert("Error deleting lead status");
            }
        }
    };

    return (
        <div className="container py-4">
            <div className="card shadow-sm border-0">
                <div className="card-header bg-white py-3">
                    <h4 className="mb-0 fw-bold">Lead Status Master</h4>
                </div>
                <div className="card-body">
                    <div className="row g-2 mb-4">
                        <div className="col-md-8">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Enter lead status name..."
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                            />
                        </div>
                        <div className="col-md-2">
                            <input
                                type="color"
                                className="form-control form-control-color w-100"
                                value={newColor}
                                onChange={(e) => setNewColor(e.target.value)}
                                title="Choose status color"
                            />
                        </div>
                        <div className="col-md-2">
                            <button className="btn btn-primary w-100 fw-bold" onClick={handleAdd}>Add</button>
                        </div>
                    </div>

                    <div className="table-responsive">
                        <table className="table table-hover align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th>Status Name</th>
                                    <th>Color Tag</th>
                                    <th className="text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {list.map((item) => (
                                    <tr key={item.id}>
                                        <td>
                                            {editId === item.id ? (
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={editName}
                                                    onChange={(e) => setEditName(e.target.value)}
                                                />
                                            ) : (
                                                <span className="fw-bold" style={{ color: item.color }}>{item.name}</span>
                                            )}
                                        </td>
                                        <td>
                                            {editId === item.id ? (
                                                <input
                                                    type="color"
                                                    className="form-control form-control-color"
                                                    value={editColor}
                                                    onChange={(e) => setEditColor(e.target.value)}
                                                />
                                            ) : (
                                                <div className="d-flex align-items-center gap-2">
                                                    <div style={{ width: 20, height: 20, backgroundColor: item.color, borderRadius: '50%' }}></div>
                                                    <small className="text-muted">{item.color}</small>
                                                </div>
                                            )}
                                        </td>
                                        <td className="text-center">
                                            <div className="d-flex justify-content-center gap-2">
                                                {editId === item.id ? (
                                                    <>
                                                        <button className="btn btn-sm btn-success" onClick={handleUpdate}>Save</button>
                                                        <button className="btn btn-sm btn-secondary" onClick={() => setEditId(null)}>Cancel</button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button
                                                            className="btn btn-sm btn-outline-primary"
                                                            onClick={() => {
                                                                setEditId(item.id);
                                                                setEditName(item.name);
                                                                setEditColor(item.color);
                                                            }}
                                                        >
                                                            Edit
                                                        </button>
                                                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(item.id)}>Delete</button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LeadStatusMaster;
