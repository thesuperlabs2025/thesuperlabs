
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ToastContainer, toast } from 'react-toastify';

const API = process.env.REACT_APP_API_URL;

const GarmentsGRNList = () => {
    const navigate = useNavigate();
    const [grns, setGrns] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchGRNs();
    }, []);

    const fetchGRNs = async () => {
        try {
            const res = await axios.get(`${API}/garments-grn`);
            setGrns(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching GRNs:", err);
            toast.error("Failed to fetch GRN list");
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this GRN?")) {
            try {
                await axios.delete(`${API}/garments-grn/${id}`);
                setGrns(grns.filter(g => g.id !== id));
                toast.success("GRN deleted successfully");
            } catch (err) {
                console.error("Error deleting GRN:", err);
                toast.error("Failed to delete GRN");
            }
        }
    };

    return (
        <div className="container-fluid mt-4">
            <ToastContainer />
            <div className="card shadow border-0 rounded-4">
                <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center border-bottom-0">
                    <h4 className="mb-0 fw-bold text-primary"><i className="bi bi-list-ul me-2"></i>Garments GRN List</h4>
                    <button className="btn btn-primary rounded-pill px-4" onClick={() => navigate('/garments-grn-add')}>
                        <i className="bi bi-plus-lg me-2"></i>New GRN
                    </button>
                </div>
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="bg-light text-secondary">
                                <tr>
                                    <th className="ps-4">GRN No</th>
                                    <th>Date</th>
                                    <th>Supplier</th>
                                    <th>DC No</th>
                                    <th>Staff</th>
                                    <th>Order No</th>
                                    <th>Total Qty</th>
                                    <th className="text-end pe-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="8" className="text-center py-5">Loading...</td></tr>
                                ) : grns.length === 0 ? (
                                    <tr><td colSpan="8" className="text-center py-5 text-muted">No GRNs found.</td></tr>
                                ) : (
                                    grns.map(grn => (
                                        <tr key={grn.id}>
                                            <td className="ps-4 fw-bold text-primary">#{grn.grn_no}</td>
                                            <td>{new Date(grn.grn_date).toLocaleDateString()}</td>
                                            <td>{grn.supplier_name}</td>
                                            <td>{grn.dc_no}</td>
                                            <td>{grn.staff_name}</td>
                                            <td>{grn.order_no || "-"}</td>
                                            <td className="fw-bold">{Number(grn.total_qty || 0).toFixed(3)}</td>
                                            <td className="text-end pe-4">
                                                <button className="btn btn-sm btn-outline-secondary me-2 rounded-circle" onClick={() => window.open(`${API}/printgarmentsgrn/grn/${grn.id}`, '_blank')} title="Print">
                                                    <i className="bi bi-printer"></i>
                                                </button>
                                                <button className="btn btn-sm btn-outline-primary me-2 rounded-circle" onClick={() => navigate(`/garments-grn-edit/${grn.id}`)} title="Edit">
                                                    <i className="bi bi-pencil"></i>
                                                </button>
                                                <button className="btn btn-sm btn-outline-danger rounded-circle" onClick={() => handleDelete(grn.id)} title="Delete">
                                                    <i className="bi bi-trash"></i>
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
        </div>
    );
};

export default GarmentsGRNList;
