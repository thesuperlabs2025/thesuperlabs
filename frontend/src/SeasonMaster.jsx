import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "bootstrap/dist/css/bootstrap.min.css";
const API = process.env.REACT_APP_API_URL;

function SeasonMaster() {
    const [seasons, setSeasons] = useState([]);
    const [newSeason, setNewSeason] = useState("");
    const [showNewInput, setShowNewInput] = useState(false);
    const [editId, setEditId] = useState(null);
    const [editSeason, setEditSeason] = useState("");

    useEffect(() => {
        fetchSeasons();
    }, []);

    const fetchSeasons = async (showToast = false) => {
        try {
            const res = await axios.get(`${API}/seasons`);
            setSeasons(res.data);
            if (showToast === true) {
                toast.success("Cool ! Data were refreshed", {
                    position: "top-right",
                    autoClose: 3000,
                    theme: "colored",
                });
            }
        } catch (error) {
            console.error("Error fetching seasons:", error);
        }
    };

    const handleAddSeason = async () => {
        if (newSeason.trim() === "") return;
        try {
            await axios.post(`${API}/seasons`, { name: newSeason });
            setNewSeason("");
            setShowNewInput(false);
            fetchSeasons();
        } catch (err) {
            console.error("Error adding season:", err);
            alert("Failed to add season");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this season?")) {
            try {
                await axios.delete(`${API}/seasons/${id}`);
                fetchSeasons();
            } catch (error) {
                console.error("Error deleting season:", error);
            }
        }
    };

    const handleUpdate = async () => {
        if (editSeason.trim() === "") return;
        try {
            await axios.put(`${API}/seasons/${editId}`, { name: editSeason });
            setEditId(null);
            setEditSeason("");
            fetchSeasons();
        } catch (error) {
            console.error("Error updating season:", error);
        }
    };

    return (
        <div className="container mt-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex align-items-center">
                    <h4 className="fw-bold mb-0 me-3">Season Master</h4>
                    <button className="btn btn-sm btn-outline-primary rounded-circle" onClick={() => fetchSeasons(true)} title="Refresh data">
                        <i className="bi bi-arrow-clockwise"></i>
                    </button>
                </div>
                {!showNewInput ? (
                    <button className="btn btn-primary" onClick={() => setShowNewInput(true)}>+ New Season</button>
                ) : (
                    <div className="d-flex">
                        <input
                            type="text"
                            className="form-control me-2"
                            placeholder="Enter season name"
                            value={newSeason}
                            onChange={(e) => setNewSeason(e.target.value)}
                        />
                        <button className="btn btn-success me-2" onClick={handleAddSeason}>Save</button>
                        <button className="btn btn-secondary" onClick={() => setShowNewInput(false)}>Cancel</button>
                    </div>
                )}
            </div>

            <div className="table-responsive shadow-sm rounded-3">
                <table className="table table-hover align-middle border">
                    <thead className="table-dark">
                        <tr>
                            <th className="px-4">Season Name</th>
                            <th className="text-center" style={{ width: '200px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {seasons.map((s) => (
                            <tr key={s.id}>
                                <td className="px-4 fw-semibold">
                                    {editId === s.id ? (
                                        <input
                                            type="text"
                                            value={editSeason}
                                            className="form-control"
                                            onChange={(e) => setEditSeason(e.target.value)}
                                        />
                                    ) : s.name}
                                </td>
                                <td className="text-center">
                                    {editId === s.id ? (
                                        <div className="btn-group">
                                            <button className="btn btn-sm btn-success" onClick={handleUpdate}>Update</button>
                                            <button className="btn btn-sm btn-secondary" onClick={() => setEditId(null)}>Cancel</button>
                                        </div>
                                    ) : (
                                        <div className="btn-group">
                                            <button className="btn btn-sm btn-outline-warning me-2" onClick={() => { setEditId(s.id); setEditSeason(s.name); }}>Edit</button>
                                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(s.id)}>Delete</button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <ToastContainer />
        </div>
    );
}

export default SeasonMaster;
