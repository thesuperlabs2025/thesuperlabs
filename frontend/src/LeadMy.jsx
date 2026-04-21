import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const API = process.env.REACT_APP_API_URL;

function LeadMy() {
    const navigate = useNavigate();
    const [list, setList] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [filters, setFilters] = useState({
        company_name: "",
        lead_status: "",
        lead_id: "",
        mobile_number: ""
    });

    const fetchData = useCallback(async () => {
        try {
            const [leadsRes, statusRes] = await Promise.all([
                axios.get(`${API}/leads`),
                axios.get(`${API}/lead-masters/lead_statuses`)
            ]);
            setList(leadsRes.data);
            setStatuses(statusRes.data);
        } catch (err) {
            console.error(err);
        }
    }, []);

    useEffect(() => {
        fetchData();
        document.title = "Lead Management - TSL ERP";
    }, [fetchData]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this lead?")) {
            try {
                await axios.delete(`${API}/leads/${id}`);
                fetchData();
            } catch (err) {
                console.error(err);
                alert("Delete failed");
            }
        }
    };

    const filteredList = list.filter(item => {
        const matchesSearch = (
            (item.company_name?.toLowerCase().includes(filters.company_name.toLowerCase())) &&
            (item.lead_id?.toLowerCase().includes(filters.lead_id.toLowerCase())) &&
            (item.mobile_number?.toLowerCase().includes(filters.mobile_number.toLowerCase()))
        );

        if (!matchesSearch) return false;

        // If "All Status" is selected (empty string), hide "Won" leads by default
        if (filters.lead_status === "") {
            return item.lead_status !== "Won";
        }

        // Otherwise, show only the selected status
        return item.lead_status === filters.lead_status;
    });

    const getStatusStyle = (statusName) => {
        const status = statuses.find(s => s.name === statusName);
        if (status) {
            return {
                backgroundColor: status.color,
                color: "#fff",
                padding: "6px 12px",
                borderRadius: "50px",
                fontSize: "0.75rem",
                fontWeight: "600"
            };
        }
        return {
            backgroundColor: "#edf2f7",
            color: "#4a5568",
            padding: "6px 12px",
            borderRadius: "50px",
            fontSize: "0.75rem",
            fontWeight: "600"
        };
    };

    return (
        <div className="container-fluid py-4 min-vh-100 bg-light">
            <div className="card shadow-sm border-0 rounded-3">
                <div className="card-header bg-white py-3 border-bottom-0">
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                        <h4 className="mb-0 fw-bold text-dark">Lead Management</h4>
                        <button className="btn btn-primary d-flex align-items-center gap-2 fw-bold" onClick={() => navigate("/lead-form")}>
                            <i className="bi bi-plus-lg"></i> New Lead
                        </button>
                    </div>
                </div>

                <div className="card-body p-4 pt-0">
                    {/* Filter Section */}
                    <div className="row g-3 mb-4 p-3 bg-light rounded border border-white shadow-sm">
                        <div className="col-md-4">
                            <label className="form-label small fw-bold text-muted">Company Name</label>
                            <input type="text" name="company_name" className="form-control form-control-sm" placeholder="Search Company..." value={filters.company_name} onChange={handleFilterChange} />
                        </div>
                        <div className="col-md-2">
                            <label className="form-label small fw-bold text-muted">Lead ID</label>
                            <input type="text" name="lead_id" className="form-control form-control-sm" placeholder="Search ID..." value={filters.lead_id} onChange={handleFilterChange} />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label small fw-bold text-muted">Mobile Number</label>
                            <input type="text" name="mobile_number" className="form-control form-control-sm" placeholder="Search Mobile..." value={filters.mobile_number} onChange={handleFilterChange} />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label small fw-bold text-muted">Lead Status</label>
                            <select name="lead_status" className="form-select form-select-sm" value={filters.lead_status} onChange={handleFilterChange}>
                                <option value="">All Active Status</option>
                                {statuses.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="table-responsive">
                        <table className="table table-hover align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th className="px-3">Lead ID</th>
                                    <th className="px-3">Date</th>
                                    <th className="px-3">Company</th>
                                    <th className="px-3">Contact Person</th>
                                    <th className="px-3">Mobile</th>
                                    <th className="px-3 text-center">Status</th>
                                    <th className="px-3 text-center">Next Follow-up</th>
                                    <th className="px-3 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredList.length > 0 ? filteredList.map((item) => (
                                    <tr key={item.id} className={item.lead_status === 'Won' ? 'table-success' : item.lead_status === 'Lost' ? 'table-danger' : ''}>
                                        <td className="px-3 fw-bold text-primary">{item.lead_id}</td>
                                        <td className="px-3 text-muted">{new Date(item.lead_date).toLocaleDateString()}</td>
                                        <td className="px-3 text-dark fw-medium">{item.company_name}</td>
                                        <td className="px-3">{item.contact_person}</td>
                                        <td className="px-3">{item.mobile_number}</td>
                                        <td className="px-3 text-center">
                                            <span style={getStatusStyle(item.lead_status)}>
                                                {item.lead_status}
                                            </span>
                                        </td>
                                        <td className="px-3 text-center">
                                            {item.next_followup_date ? new Date(item.next_followup_date).toLocaleDateString() : "-"}
                                        </td>
                                        <td className="px-3 text-center">
                                            <div className="d-flex justify-content-center gap-2">
                                                <button className="btn btn-sm btn-outline-primary border-0" title="Edit" onClick={() => navigate(`/edit-lead/${item.id}`)}>
                                                    <i className="bi bi-pencil-square"></i>
                                                </button>
                                                <button className="btn btn-sm btn-outline-danger border-0" title="Delete" onClick={() => handleDelete(item.id)}>
                                                    <i className="bi bi-trash"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="8" className="text-center py-5 text-muted">No leads found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LeadMy;
