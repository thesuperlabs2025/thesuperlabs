// DiaChartMy.jsx
import Loader from "./Loader";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';

const API = process.env.REACT_APP_API_URL;

export default function DiaChartMy() {
    const [charts, setCharts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchCharts = async () => {
        try {
            const res = await axios.get(`${API}/dia-masters`);
            setCharts(res.data);
        } catch (error) {
            console.error("Error fetching dia charts:", error);
            toast.error("Failed to load dia charts");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCharts();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this dia chart?")) return;
        try {
            await axios.delete(`${API}/dia-masters/${id}`);
            toast.success("Dia chart deleted successfully");
            fetchCharts();
        } catch (error) {
            console.error("Error deleting dia chart:", error);
            toast.error("Failed to delete dia chart");
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="container mt-5 px-md-5">
            <ToastContainer />
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold text-primary mb-0">
                    <i className="bi bi-grid-3x3 me-2"></i>Dia Master
                </h2>
                <button className="btn btn-primary d-flex align-items-center fw-bold px-4 shadow-sm rounded-pill" onClick={() => navigate('/dia-chart/add')}>
                    <i className="bi bi-plus-lg me-2"></i>New Dia Chart
                </button>
            </div>

            <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-dark small fw-bold text-uppercase">
                                <tr>
                                    <th className="ps-4 py-3">#</th>
                                    <th className="py-3">Dia Name</th>
                                    <th className="py-3 text-end pe-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {charts.length === 0 ? (
                                    <tr><td colSpan="3" className="text-center py-5 text-muted fw-bold">No dia charts found.</td></tr>
                                ) : (
                                    charts.map((chart, index) => (
                                        <tr key={chart.id}>
                                            <td className="ps-4 text-muted small fw-bold">{index + 1}</td>
                                            <td className="fw-bold">{chart.dia_name}</td>
                                            <td className="text-end pe-4">
                                                <div className="d-flex justify-content-end gap-2">
                                                    <button className="btn btn-light btn-sm rounded-circle shadow-sm" title="Edit" onClick={() => navigate(`/dia-chart/edit/${chart.id}`)}>
                                                        <i className="bi bi-pencil-square text-primary"></i>
                                                    </button>
                                                    <button className="btn btn-light btn-sm rounded-circle shadow-sm" title="Delete" onClick={() => handleDelete(chart.id)}>
                                                        <i className="bi bi-trash text-danger"></i>
                                                    </button>
                                                </div>
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
