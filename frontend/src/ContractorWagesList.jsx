import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";

const API = process.env.REACT_APP_API_URL;

const ContractorWagesList = () => {
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchList = async () => {
        try {
            const res = await axios.get(`${API}/contractor-wages`);
            setList(res.data);
        } catch (err) {
            toast.error("Failed to fetch list");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchList();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            await axios.delete(`${API}/contractor-wages/${id}`);
            toast.success("Deleted successfully");
            fetchList();
        } catch (err) {
            toast.error("Failed to delete");
        }
    };

    return (
        <div className="container-fluid p-4" style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold text-dark mb-1">Contractor Wages</h2>
                    <p className="text-secondary small mb-0">Manage piece-rate payments for contractors</p>
                </div>
                <button className="btn btn-primary px-4 py-2 rounded-pill shadow-sm fw-bold" onClick={() => navigate('/contractor-wages-add')}>
                    <i className="bi bi-plus-lg me-2"></i> New Entry
                </button>
            </div>

            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead style={{ backgroundColor: '#000', color: '#fff' }}>
                            <tr>
                                <th className="px-4 py-3">ID</th>
                                <th className="py-3">Order No</th>
                                <th className="py-3">Order Name</th>
                                <th className="py-3">Date</th>
                                <th className="py-3 text-end px-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-5">
                                        <div className="spinner-border text-primary spinner-border-sm me-2"></div>
                                        <span className="text-muted">Loading wages...</span>
                                    </td>
                                </tr>
                            ) : list.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-5 text-muted">No records found</td>
                                </tr>
                            ) : (
                                list.map((item) => (
                                    <tr key={item.id}>
                                        <td className="px-4 fw-bold">#{item.id}</td>
                                        <td><span className="badge bg-primary-subtle text-primary px-3 py-2 rounded-pill">{item.order_id || 'N/A'}</span></td>
                                        <td>{item.order_name || 'N/A'}</td>
                                        <td className="text-muted small">{new Date(item.created_at).toLocaleDateString()}</td>
                                        <td className="text-end px-4">
                                            <button className="btn btn-light btn-sm rounded-circle me-2" onClick={() => navigate(`/contractor-wages-edit/${item.id}`)}>
                                                <i className="bi bi-pencil-square text-primary"></i>
                                            </button>
                                            <button className="btn btn-light btn-sm rounded-circle" onClick={() => handleDelete(item.id)}>
                                                <i className="bi bi-trash text-danger"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ContractorWagesList;
