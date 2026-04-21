import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";

const API = process.env.REACT_APP_API_URL;

export default function UomMy() {
    const [uoms, setUoms] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchUoms();
    }, []);

    const fetchUoms = async () => {
        try {
            const res = await axios.get(`${API}/uom`);
            setUoms(res.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching UOMs:", error);
            toast.error("Failed to load UOMs");
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this UOM?")) {
            try {
                await axios.delete(`${API}/uom/${id}`);
                toast.success("UOM deleted successfully");
                fetchUoms();
            } catch (error) {
                console.error("Error deleting UOM:", error);
                toast.error("Failed to delete UOM");
            }
        }
    };

    return (
        <div className="container mt-5">
            <ToastContainer />
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold d-flex align-items-center">
                    <button className="btn btn-light btn-sm me-3 border shadow-sm rounded-circle" onClick={() => navigate('/masters')} style={{ width: '32px', height: '32px' }}>
                        <i className="bi bi-arrow-left"></i>
                    </button>
                    <i className="bi bi-rulers me-2"></i>
                    UOM Master
                </h2>
                <Link to="/uom/add" className="btn btn-primary fw-bold">
                    <i className="bi bi-plus-lg me-2"></i> Create New UOM
                </Link>
            </div>

            <div className="card shadow-sm border-0">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th className="px-4 py-3">#</th>
                                    <th className="px-4 py-3">UOM Name</th>
                                    <th className="px-4 py-3 text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="3" className="text-center py-4">
                                            <div className="spinner-border text-primary" role="status"></div>
                                        </td>
                                    </tr>
                                ) : uoms.length === 0 ? (
                                    <tr>
                                        <td colSpan="3" className="text-center py-4 text-muted">
                                            No UOMs found. Create one to get started.
                                        </td>
                                    </tr>
                                ) : (
                                    uoms.map((uom, index) => (
                                        <tr key={uom.id}>
                                            <td className="px-4 py-3">{index + 1}</td>
                                            <td className="px-4 py-3 fw-bold text-primary">
                                                {uom.name}
                                            </td>
                                            <td className="px-4 py-3 text-end">
                                                <button
                                                    className="btn btn-outline-primary btn-sm me-2"
                                                    onClick={() => navigate(`/uom/edit/${uom.id}`)}
                                                    title="Edit"
                                                >
                                                    <i className="bi bi-pencil"></i>
                                                </button>
                                                <button
                                                    className="btn btn-outline-danger btn-sm"
                                                    onClick={() => handleDelete(uom.id)}
                                                    title="Delete"
                                                >
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
}
