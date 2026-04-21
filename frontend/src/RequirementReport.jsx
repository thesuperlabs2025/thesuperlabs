import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const API = process.env.REACT_APP_API_URL;

export default function RequirementReport() {
    const [data, setData] = useState({ fabrics: [], trims: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`${API}/erp-reports/requirements`)
            .then(res => setData(res.data))
            .finally(() => setLoading(false));
    }, []);

    const handlePrint = () => window.print();

    return (
        <div className="container-fluid py-4 bg-light min-vh-100">
            <div className="d-flex justify-content-between align-items-center mb-4 no-print px-3">
                <h3 className="fw-bold text-dark mb-0">Fabric & Trims Requirement Report</h3>
                <button className="btn btn-dark btn-sm rounded-3 px-3 shadow-sm" onClick={handlePrint} disabled={loading}>
                    <i className="bi bi-printer me-2"></i> Print Report
                </button>
            </div>

            {loading ? (
                <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
            ) : (
                <div className="px-3">
                    <div className="card border-0 shadow-sm rounded-4 mb-4">
                        <div className="card-header bg-primary text-white py-3 px-4">
                            <h5 className="mb-0 fw-bold">Fabric Requirements</h5>
                        </div>
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table table-hover mb-0">
                                    <thead className="bg-light">
                                        <tr className="small text-uppercase fw-bold text-muted">
                                            <th className="px-4">Order No</th>
                                            <th>Style Name</th>
                                            <th>Fabric Name</th>
                                            <th>Color</th>
                                            <th>GSM/DIA</th>
                                            <th className="text-end px-4">Required Qty</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.fabrics.map((f, i) => (
                                            <tr key={i} className="small border-bottom">
                                                <td className="px-4 fw-bold">{f.order_no}</td>
                                                <td>{f.style_name}</td>
                                                <td>{f.fabric_name}</td>
                                                <td>{f.color}</td>
                                                <td>{f.gsm} / {f.dia}</td>
                                                <td className="text-end px-4 fw-bold">{parseFloat(f.required_qty).toFixed(2)} KG</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div className="card border-0 shadow-sm rounded-4 mb-4">
                        <div className="card-header bg-dark text-white py-3 px-4">
                            <h5 className="mb-0 fw-bold">Trims Requirements</h5>
                        </div>
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table table-hover mb-0">
                                    <thead className="bg-light">
                                        <tr className="small text-uppercase fw-bold text-muted">
                                            <th className="px-4">Order No</th>
                                            <th>Style Name</th>
                                            <th>Trims Name</th>
                                            <th>Color</th>
                                            <th className="text-end px-4">Per Pcs</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.trims.map((t, i) => (
                                            <tr key={i} className="small border-bottom">
                                                <td className="px-4 fw-bold">{t.order_no}</td>
                                                <td>{t.style_name}</td>
                                                <td>{t.trims_name}</td>
                                                <td>{t.color}</td>
                                                <td className="text-end px-4 fw-bold">{parseFloat(t.qty_per_pcs).toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
