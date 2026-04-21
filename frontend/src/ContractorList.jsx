import Loader from "./Loader";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const API = process.env.REACT_APP_API_URL;

function ContractorList() {
    const [contractors, setContractors] = useState([]);
    const [filteredContractors, setFilteredContractors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState([]);
    const [selectAll, setSelectAll] = useState(false);

    const [filters, setFilters] = useState({
        name: "",
        mobile: "",
        city: ""
    });

    const navigate = useNavigate();

    const fetchContractors = async () => {
        try {
            const res = await axios.get(`${API}/contractor`);
            setContractors(res.data);
            setFilteredContractors(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContractors();
    }, []);

    useEffect(() => {
        const result = contractors.filter((c) => {
            return (
                (filters.name === "" || c.name?.toLowerCase().includes(filters.name.toLowerCase())) &&
                (filters.mobile === "" || c.mobile?.toLowerCase().includes(filters.mobile.toLowerCase())) &&
                (filters.city === "" || c.billing_city?.toLowerCase().includes(filters.city.toLowerCase()))
            );
        });
        setFilteredContractors(result);
    }, [filters, contractors]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this contractor?")) {
            try {
                await axios.delete(`${API}/contractor/${id}`);
                alert("Contractor deleted successfully!");
                fetchContractors();
            } catch (err) {
                console.error(err);
            }
        }
    };

    const handleCheckboxChange = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        if (!selectAll) {
            const allIds = filteredContractors.map((c) => c.id);
            setSelectedIds(allIds);
        } else {
            setSelectedIds([]);
        }
        setSelectAll(!selectAll);
    };

    const handleDeleteSelected = async () => {
        if (selectedIds.length === 0) {
            alert("Please select at least one contractor to delete.");
            return;
        }
        if (window.confirm("Are you sure you want to delete selected contractors?")) {
            try {
                for (const id of selectedIds) {
                    await axios.delete(`${API}/contractor/${id}`);
                }
                alert("Selected contractors deleted successfully!");
                setSelectedIds([]);
                setSelectAll(false);
                fetchContractors();
            } catch (err) {
                console.error(err);
            }
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="container-fluid py-4 px-md-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold text-primary mb-0">
                    <i className="bi bi-person-workspace me-2"></i>Contractor Master
                </h2>
                <div className="btn-group shadow-sm">
                    <button className="btn btn-primary d-flex align-items-center fw-bold px-4" onClick={() => navigate("/contractor-add")}>
                        <i className="bi bi-plus-lg me-2"></i>New
                    </button>
                    <button className="btn btn-danger d-flex align-items-center" onClick={handleDeleteSelected} disabled={selectedIds.length === 0}>
                        <i className="bi bi-trash me-2"></i>Delete ({selectedIds.length})
                    </button>
                </div>
            </div>

            <div className="card shadow-sm border-0 mb-4">
                <div className="card-body p-4">
                    <div className="row g-3">
                        <div className="col-md-4">
                            <label className="form-label fw-bold small text-muted">Contractor Name</label>
                            <input type="text" name="name" className="form-control" placeholder="Search name..." value={filters.name} onChange={handleFilterChange} />
                        </div>
                        <div className="col-md-4">
                            <label className="form-label fw-bold small text-muted">Mobile Number</label>
                            <input type="text" name="mobile" className="form-control" placeholder="Search mobile..." value={filters.mobile} onChange={handleFilterChange} />
                        </div>
                        <div className="col-md-4">
                            <label className="form-label fw-bold small text-muted">City</label>
                            <input type="text" name="city" className="form-control" placeholder="Search city..." value={filters.city} onChange={handleFilterChange} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="card shadow-sm border-0 text-center">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover table-striped mb-0 align-middle">
                            <thead className="table-dark small">
                                <tr>
                                    <th className="ps-4" width="40"><input className="form-check-input" type="checkbox" checked={selectAll} onChange={handleSelectAll} /></th>
                                    <th className="fw-bold py-3">CONTRACTOR DETAILS</th>
                                    <th className="fw-bold py-3 text-center">MOBILE</th>
                                    <th className="fw-bold py-3 text-center">CITY</th>
                                    <th className="fw-bold py-3 text-end pe-4" width="120">ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredContractors.length === 0 ? (
                                    <tr><td colSpan="5" className="text-center py-5 text-muted">No contractors found.</td></tr>
                                ) : (
                                    filteredContractors.map((c) => (
                                        <tr key={c.id}>
                                            <td className="ps-4"><input className="form-check-input" type="checkbox" checked={selectedIds.includes(c.id)} onChange={() => handleCheckboxChange(c.id)} /></td>
                                            <td className="text-start">
                                                <div className="fw-bold text-dark">{c.name}</div>
                                                <div className="text-muted small">ID: {c.id}</div>
                                            </td>
                                            <td>{c.mobile}</td>
                                            <td><span className="badge bg-light text-dark border">{c.billing_city}</span></td>
                                            <td className="text-end pe-4">
                                                <div className="d-flex justify-content-end gap-2 text-center">
                                                    <button className="btn btn-outline-primary btn-sm rounded-circle d-flex align-items-center justify-content-center border-0"
                                                        style={{ width: '32px', height: '32px' }} onClick={() => navigate(`/contractor-edit/${c.id}`)}>
                                                        <i className="bi bi-pencil-square"></i>
                                                    </button>
                                                    <button className="btn btn-outline-danger btn-sm rounded-circle d-flex align-items-center justify-content-center border-0"
                                                        style={{ width: '32px', height: '32px' }} onClick={() => handleDelete(c.id)}>
                                                        <i className="bi bi-trash-fill"></i>
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
                <div className="card-footer bg-white py-3 text-start">
                    <span className="text-muted small">Showing {filteredContractors.length} of {contractors.length} contractors total</span>
                </div>
            </div>
        </div>
    );
}

export default ContractorList;
