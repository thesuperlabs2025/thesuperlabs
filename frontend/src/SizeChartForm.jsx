import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';

const API = process.env.REACT_APP_API_URL;

export default function SizeChartForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = !!id;

    const [chartName, setChartName] = useState('');
    const [rows, setRows] = useState([{ id: Date.now(), size_value: '' }]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchChart = async () => {
            try {
                const res = await axios.get(`${API}/size-charts/${id}`);
                const data = res.data;
                setChartName(data.chart_name);

                if (data.values && data.values.length > 0) {
                    setRows(data.values.map(val => ({
                        id: val.id, // Use DB id, but for new rows we use timestamp. key prop handles this.
                        size_value: val.size_value
                    })));
                }
            } catch (error) {
                console.error("Error fetching size chart:", error);
                toast.error("Failed to load size chart details");
            }
        };

        if (isEdit) {
            fetchChart();
        }
    }, [id, isEdit]);

    const handleAddRow = () => {
        setRows([...rows, { id: Date.now(), size_value: '' }]);
    };

    const handleRemoveRow = (idToRemove) => {
        if (rows.length === 1) {
            toast.warning("At least one size value is required");
            return;
        }
        setRows(rows.filter(row => row.id !== idToRemove));
    };

    const handleValueChange = (id, value) => {
        setRows(rows.map(row =>
            row.id === id ? { ...row, size_value: value } : row
        ));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!chartName.trim()) {
            toast.error("Size Chart Name is required");
            return;
        }

        const validValues = rows
            .map(r => r.size_value.trim())
            .filter(v => v !== "");

        if (validValues.length === 0) {
            toast.error("Please add at least one size value");
            return;
        }

        setLoading(true);
        const payload = {
            chart_name: chartName,
            values: validValues
        };

        try {
            if (isEdit) {
                await axios.put(`${API}/size-charts/${id}`, payload);
                toast.success("Size chart updated successfully");
            } else {
                await axios.post(`${API}/size-charts`, payload);
                toast.success("Size chart created successfully");
            }
            setTimeout(() => navigate('/size-charts'), 1500);
        } catch (error) {
            console.error("Error saving size chart:", error);
            toast.error(error.response?.data?.error || "Failed to save size chart");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5">
            <ToastContainer />
            <div className="card shadow-sm border-0" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div className="card-header bg-white py-3 d-flex align-items-center">
                    <button className="btn btn-light btn-sm me-3 border shadow-sm rounded-circle" onClick={() => navigate(-1)} style={{ width: '32px', height: '32px' }}>
                        <i className="bi bi-arrow-left"></i>
                    </button>
                    <h4 className="mb-0 fw-bold text-primary">
                        {isEdit ? "Edit Size Chart" : "Create New Size Chart"}
                    </h4>
                </div>
                <div className="card-body p-4">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="form-label fw-bold">Size Chart Name</label>
                            <input
                                type="text"
                                className="form-control form-control-lg"
                                placeholder="e.g. Standard Sizes (S-XL)"
                                value={chartName}
                                onChange={(e) => setChartName(e.target.value)}
                                autoFocus
                            />
                            <div className="form-text">Give your size chart a unique name to identiAY it easily.</div>
                        </div>

                        <div className="mb-3">
                            <label className="form-label fw-bold">Size Values</label>
                            <div className="table-responsive border rounded-3 overflow-hidden">
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th className="px-4 py-2" style={{ width: '60px' }}>#</th>
                                            <th className="px-4 py-2">Size Value</th>
                                            <th className="px-4 py-2 text-end" style={{ width: '100px' }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rows.map((row, index) => (
                                            <tr key={row.id}>
                                                <td className="px-4 py-2 text-muted">{index + 1}</td>
                                                <td className="px-4 py-2">
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        placeholder={`e.g. ${index === 0 ? 'Small' : index === 1 ? 'Medium' : 'Large'}`}
                                                        value={row.size_value}
                                                        onChange={(e) => handleValueChange(row.id, e.target.value)}
                                                    />
                                                </td>
                                                <td className="px-4 py-2 text-end">
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-danger btn-sm border-0 rounded-circle"
                                                        onClick={() => handleRemoveRow(row.id)}
                                                        disabled={rows.length === 1}
                                                        style={{ width: '32px', height: '32px' }}
                                                    >
                                                        <i className="bi bi-x-lg"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <button
                                type="button"
                                className="btn btn-light w-100 mt-2 text-primary fw-bold border-dashed"
                                onClick={handleAddRow}
                                style={{ border: '2px dashed #dee2e6' }}
                            >
                                <i className="bi bi-plus-lg me-2"></i> Add Another Size
                            </button>
                        </div>

                        <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                            <button
                                type="button"
                                className="btn btn-light px-4"
                                onClick={() => navigate('/size-charts')}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary px-5 fw-bold"
                                disabled={loading}
                            >
                                {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : null}
                                {isEdit ? "Update Chart" : "Save Chart"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
