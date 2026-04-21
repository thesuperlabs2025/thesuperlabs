import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";

const API = process.env.REACT_APP_API_URL;

export default function SizeChartMy() {
    const [charts, setCharts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCharts();
    }, []);

    const fetchCharts = async () => {
        try {
            const res = await axios.get(`${API}/size-charts`);
            setCharts(res.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching size charts:", error);
            toast.error("Failed to load size charts");
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this size chart?")) {
            try {
                await axios.delete(`${API}/size-charts/${id}`);
                toast.success("Size chart deleted successfully");
                fetchCharts();
            } catch (error) {
                console.error("Error deleting size chart:", error);
                toast.error("Failed to delete size chart");
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
                    Size Charts
                </h2>
                <Link to="/size-chart/add" className="btn btn-primary fw-bold">
                    <i className="bi bi-plus-lg me-2"></i> Create New Chart
                </Link>
            </div>

            <div className="card shadow-sm border-0">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th className="px-4 py-3">#</th>
                                    <th className="px-4 py-3">Chart Name</th>
                                    <th className="px-4 py-3">Size Values</th>
                                    <th className="px-4 py-3 text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="4" className="text-center py-4">
                                            <div className="spinner-border text-primary" role="status"></div>
                                        </td>
                                    </tr>
                                ) : charts.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="text-center py-4 text-muted">
                                            No size charts found. Create one to get started.
                                        </td>
                                    </tr>
                                ) : (
                                    charts.map((chart, index) => (
                                        <tr key={chart.id}>
                                            <td className="px-4 py-3">{index + 1}</td>
                                            <td className="px-4 py-3 fw-bold text-primary">
                                                {chart.chart_name}
                                            </td>
                                            <td className="px-4 py-3">
                                                {chart.size_values ? (
                                                    chart.size_values.split(', ').map((val, i) => (
                                                        <span key={i} className="badge bg-light text-dark border me-1 mb-1">
                                                            {val}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-muted small">No values</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-end">
                                                <button
                                                    className="btn btn-outline-primary btn-sm me-2"
                                                    onClick={() => navigate(`/size-chart/edit/${chart.id}`)}
                                                    title="Edit"
                                                >
                                                    <i className="bi bi-pencil"></i>
                                                </button>
                                                <button
                                                    className="btn btn-outline-danger btn-sm"
                                                    onClick={() => handleDelete(chart.id)}
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
