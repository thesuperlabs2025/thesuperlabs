import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API = process.env.REACT_APP_API_URL;

const PcsInwardList = () => {
    const navigate = useNavigate();
    const [inwards, setInwards] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchInwards();
    }, []);

    const fetchInwards = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API}/pcs-direct-inward`);
            setInwards(res.data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load list");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this inward?")) {
            try {
                await axios.delete(`${API}/pcs-direct-inward/${id}`);
                toast.success("Deleted successfully");
                fetchInwards();
            } catch (err) {
                console.error(err);
                toast.error("Failed to delete");
            }
        }
    };

    const filtered = inwards.filter(i =>
        (i.inward_no || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (i.supplier_name || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container-fluid mt-4">
            <ToastContainer position="top-right" theme="colored" />

            <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="fw-bold text-dark">Pcs Inward List</h4>
                <div className="d-flex gap-2">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button className="btn btn-dark px-3 fw-bold" onClick={() => navigate("/pcs-inward/new")}>
                        <i className="bi bi-plus-lg me-1"></i> New
                    </button>
                    <button className="btn btn-secondary px-3" onClick={() => navigate("/")}>
                        <i className="bi bi-arrow-left me-1"></i> Back
                    </button>
                </div>
            </div>

            <div className="card shadow border-0">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0 table-black-header">
                            <thead>
                                <tr>
                                    <th>Inward No</th>
                                    <th>Date</th>
                                    <th>Supplier</th>
                                    <th>Staff</th>
                                    <th>Remarks</th>
                                    <th className="text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="6" className="text-center py-4">Loading...</td></tr>
                                ) : filtered.length === 0 ? (
                                    <tr><td colSpan="6" className="text-center py-4 text-muted">No records found.</td></tr>
                                ) : filtered.map((inward) => (
                                    <tr key={inward.id}>
                                        <td className="fw-bold">{inward.inward_no}</td>
                                        <td>{new Date(inward.inward_date).toLocaleDateString()}</td>
                                        <td>{inward.supplier_name}</td>
                                        <td>{inward.staff_name}</td>
                                        <td className="text-truncate" style={{ maxWidth: '200px' }}>{inward.remarks}</td>
                                        <td className="text-end">
                                            <button className="btn btn-outline-dark btn-sm me-2" onClick={() => navigate("/pcs-inward/edit", { state: { id: inward.id } })}>
                                                <i className="bi bi-pencil"></i>
                                            </button>
                                            <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(inward.id)}>
                                                <i className="bi bi-trash"></i>
                                            </button>
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
};

export default PcsInwardList;
