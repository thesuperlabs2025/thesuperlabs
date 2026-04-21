import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const API = process.env.REACT_APP_API_URL;

function LeadSourceMaster() {
    const [list, setList] = useState([]);
    const [newName, setNewName] = useState("");
    const [editId, setEditId] = useState(null);
    const [editName, setEditName] = useState("");

    const fetchData = useCallback(async () => {
        try {
            const res = await axios.get(`${API}/lead-masters/lead_sources`);
            setList(res.data);
        } catch (err) {
            console.error(err);
        }
    }, []);

    useEffect(() => {
        fetchData();
        document.title = "Lead Source Master - TSL ERP";
    }, [fetchData]);

    const handleAdd = async () => {
        if (!newName.trim()) return;
        try {
            await axios.post(`${API}/lead-masters/lead_sources`, { name: newName });
            setNewName("");
            fetchData();
        } catch (err) {
            alert("Error adding lead source");
        }
    };

    const handleUpdate = async () => {
        if (!editName.trim()) return;
        try {
            await axios.put(`${API}/lead-masters/lead_sources/${editId}`, { name: editName });
            setEditId(null);
            fetchData();
        } catch (err) {
            alert("Error updating lead source");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure?")) {
            try {
                await axios.delete(`${API}/lead-masters/lead_sources/${id}`);
                fetchData();
            } catch (err) {
                alert("Error deleting lead source");
            }
        }
    };

    return (
        <div className="container py-4">
            <div className="card shadow-sm border-0">
                <div className="card-header bg-white py-3">
                    <h4 className="mb-0 fw-bold">Lead Source Master</h4>
                </div>
                <div className="card-body">
                    <div className="d-flex gap-2 mb-4">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Enter new lead source..."
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                        />
                        <button className="btn btn-primary px-4 fw-bold" onClick={handleAdd}>Add</button>
                    </div>

                    <div className="table-responsive">
                        <table className="table table-hover align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th>Source Name</th>
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
                                                item.name
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

export default LeadSourceMaster;
