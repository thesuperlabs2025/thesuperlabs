// DiaChartForm.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';

const API = process.env.REACT_APP_API_URL;

export default function DiaChartForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = !!id;

    const [diaName, setDiaName] = useState('');
    const [sizeChartId, setSizeChartId] = useState('');
    const [sizeCharts, setSizeCharts] = useState([]);
    const [rows, setRows] = useState([{ id: Date.now(), size: '', dia_value: '' }]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        axios.get(`${API}/size-charts`).then(res => {
            setSizeCharts(res.data);
        }).catch(err => console.error(err));
    }, []);

    useEffect(() => {
        const fetchChart = async () => {
            try {
                const res = await axios.get(`${API}/dia-masters/${id}`);
                const data = res.data;
                setDiaName(data.dia_name);
                setSizeChartId(data.size_chart_id || '');

                if (data.sizeData) {
                    setRows(Object.entries(data.sizeData).map(([size, dia_value], index) => ({
                        id: Date.now() + index,
                        size,
                        dia_value
                    })));
                }
            } catch (error) {
                console.error("Error fetching dia chart:", error);
                toast.error("Failed to load dia chart details");
            }
        };

        if (isEdit) {
            fetchChart();
        }
    }, [id, isEdit]);

    const handleSizeChartChange = async (e) => {
        const val = e.target.value;
        setSizeChartId(val);

        if (val) {
            try {
                const res = await axios.get(`${API}/size-charts/${val}`);
                if (res.data && res.data.values) {
                    setRows(res.data.values.map((v, i) => ({
                        id: Date.now() + i,
                        size: v.size_value,
                        dia_value: ''
                    })));
                }
            } catch (error) {
                console.error(error);
                toast.error("Failed to load size chart values");
            }
        }
    };

    const handleAddRow = () => {
        setRows([...rows, { id: Date.now(), size: '', dia_value: '' }]);
    };

    const handleRemoveRow = (idToRemove) => {
        if (rows.length === 1) {
            toast.warning("At least one dia value is required");
            return;
        }
        setRows(rows.filter(row => row.id !== idToRemove));
    };

    const handleFieldChange = (id, field, value) => {
        setRows(rows.map(row =>
            row.id === id ? { ...row, [field]: value } : row
        ));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!diaName.trim()) {
            toast.error("Dia Chart Name is required");
            return;
        }

        const sizeData = {};
        rows.forEach(r => {
            if (r.size.trim() && r.dia_value.trim()) {
                sizeData[r.size.trim()] = r.dia_value.trim();
            }
        });

        if (Object.keys(sizeData).length === 0) {
            toast.error("Please add at least one complete size and dia value pair");
            return;
        }

        setLoading(true);
        setLoading(true);
        const payload = {
            dia_name: diaName,
            size_chart_id: sizeChartId || null,
            sizeData
        };

        try {
            if (isEdit) {
                await axios.put(`${API}/dia-masters/${id}`, payload);
                toast.success("Dia chart updated successfully");
            } else {
                await axios.post(`${API}/dia-masters`, payload);
                toast.success("Dia chart created successfully");
            }
            setTimeout(() => navigate('/dia-charts'), 1500);
        } catch (error) {
            console.error("Error saving dia chart:", error);
            toast.error("Failed to save dia chart");
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
                        {isEdit ? "Edit Dia Chart" : "Create New Dia Chart"}
                    </h4>
                </div>
                <div className="card-body p-4">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="form-label fw-bold">Dia Chart Name</label>
                            <input
                                type="text"
                                className="form-control form-control-lg"
                                placeholder="e.g. Standard Dia Plan"
                                value={diaName}
                                onChange={(e) => setDiaName(e.target.value)}
                                autoFocus
                            />
                        </div>

                        <div className="mb-4">
                            <label className="form-label fw-bold">Link Size Chart (Optional)</label>
                            <select
                                className="form-select"
                                value={sizeChartId}
                                onChange={handleSizeChartChange}
                            >
                                <option value="">-- Manual Entry (No Size Chart) --</option>
                                {sizeCharts.map(sc => (
                                    <option key={sc.id} value={sc.id}>{sc.chart_name}</option>
                                ))}
                            </select>
                            <div className="form-text">Selecting a size chart will auto-fill sizes and restrict editing to ensure consistency.</div>
                        </div>

                        <div className="mb-3">
                            <label className="form-label fw-bold">Dia Values per Size</label>
                            <div className="table-responsive border rounded-3 overflow-hidden">
                                <table className="table table-hover align-middle mb-0 text-center">
                                    <thead className="table-light">
                                        <tr>
                                            <th className="px-4 py-2" style={{ width: '60px' }}>#</th>
                                            <th className="px-4 py-2">Size</th>
                                            <th className="px-4 py-2">Dia Value</th>
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
                                                        className={`form-control ${sizeChartId ? 'bg-light' : ''}`}
                                                        placeholder="Size (e.g. S)"
                                                        value={row.size}
                                                        onChange={(e) => handleFieldChange(row.id, "size", e.target.value)}
                                                        readOnly={!!sizeChartId}
                                                    />
                                                </td>
                                                <td className="px-4 py-2">
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        placeholder="Dia (e.g. 18)"
                                                        value={row.dia_value}
                                                        onChange={(e) => handleFieldChange(row.id, "dia_value", e.target.value)}
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
                                disabled={!!sizeChartId}
                            >
                                <i className="bi bi-plus-lg me-2"></i> Add Size Mapping
                            </button>
                        </div>

                        <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                            <button type="button" className="btn btn-light px-4" onClick={() => navigate('/dia-charts')}>Cancel</button>
                            <button type="submit" className="btn btn-primary px-5 fw-bold" disabled={loading}>
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
