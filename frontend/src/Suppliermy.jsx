import Loader from "./Loader";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
const API = process.env.REACT_APP_API_URL;

function Suppliermy() {
  const [suppliers, setSuppliers] = useState([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const [filters, setFilters] = useState({
    name: "",
    mobile: "",
    city: "",
    state: "",
  });

  const [cityOptions, setCityOptions] = useState([]);
  const [stateOptions, setStateOptions] = useState([]);
  const [nameSuggestions, setNameSuggestions] = useState([]);

  const navigate = useNavigate();

  // Fetch all suppliers
  const fetchSuppliers = async () => {
    try {
      const res = await axios.get(`${API}/supplier`);
      setSuppliers(res.data);
      setFilteredSuppliers(res.data);

      const cities = [...new Set(res.data.map((c) => c.billing_city).filter(Boolean))];
      const states = [...new Set(res.data.map((c) => c.billing_state).filter(Boolean))];
      setCityOptions(cities);
      setStateOptions(states);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  // Filter logic
  useEffect(() => {
    const result = suppliers.filter((c) => {
      return (
        (filters.name === "" || c.name?.toLowerCase().includes(filters.name.toLowerCase())) &&
        (filters.mobile === "" || c.mobile?.toLowerCase().includes(filters.mobile.toLowerCase())) &&
        (filters.city === "" || c.billing_city === filters.city) &&
        (filters.state === "" || c.billing_state === filters.state)
      );
    });
    setFilteredSuppliers(result);
  }, [filters, suppliers]);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));

    if (name === "name") {
      if (!value.trim()) {
        setNameSuggestions([]);
      } else {
        const suggestions = suppliers
          .filter((c) => c.name?.toLowerCase().includes(value.toLowerCase()))
          .slice(0, 5);
        setNameSuggestions(suggestions);
      }
    }
  };

  // Handle name suggestion click
  const handleNameSelect = (name) => {
    setFilters((prev) => ({ ...prev, name }));
    setNameSuggestions([]);
  };

  // Delete a single supplier
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this supplier?")) {
      try {
        await axios.delete(`${API}/supplier/${id}`);
        alert("Supplier deleted successfully!");
        fetchSuppliers();
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Handle checkbox toggle for each row
  const handleCheckboxChange = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  // Handle select all checkbox
  const handleSelectAll = () => {
    if (!selectAll) {
      const allIds = filteredSuppliers.map((c) => c.id); // ✅ fixed here
      setSelectedIds(allIds);
    } else {
      setSelectedIds([]);
    }
    setSelectAll(!selectAll);
  };

  // Delete selected suppliers
  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) {
      alert("Please select at least one supplier to delete.");
      return;
    }
    if (window.confirm("Are you sure you want to delete selected suppliers?")) {
      try {
        for (const id of selectedIds) {
          await axios.delete(`${API}/supplier/${id}`);
        }
        alert("Selected suppliers deleted successfully!");
        setSelectedIds([]);
        setSelectAll(false);
        fetchSuppliers();
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
          <i className="bi bi-truck me-2"></i>Supplier Master
        </h2>
        <div className="btn-group shadow-sm">
          <button className="btn btn-primary d-flex align-items-center fw-bold px-4" onClick={() => navigate("/supplier")}>
            <i className="bi bi-plus-lg me-2"></i>New
          </button>
          <button className="btn btn-danger d-flex align-items-center" onClick={handleDeleteSelected} disabled={selectedIds.length === 0}>
            <i className="bi bi-trash me-2"></i>Delete ({selectedIds.length})
          </button>
        </div>
      </div>

      {/* Filters Card */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body p-4">
          <div className="row g-3 px-2">
            <div className="col-md-3">
              <label className="form-label fw-bold small text-muted">Supplier Name</label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0"><i className="bi bi-search text-muted small"></i></span>
                <input type="text" name="name" className="form-control border-start-0 ps-0 text-truncate px-1" placeholder="Search name..." value={filters.name} onChange={handleFilterChange} autoComplete="off" />
              </div>
              {nameSuggestions.length > 0 && (
                <ul className="list-group position-absolute shadow-sm" style={{ zIndex: 1000, width: '22%', marginTop: '5px', maxHeight: "200px", overflowY: "auto" }}>
                  {nameSuggestions.map((s) => (
                    <li key={s.id} className="list-group-item list-group-item-action" onClick={() => handleNameSelect(s.name)} style={{ cursor: "pointer" }}>
                      {s.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="col-md-3">
              <label className="form-label fw-bold small text-muted">Mobile Number</label>
              <input type="text" name="mobile" className="form-control" placeholder="Search mobile..." value={filters.mobile} onChange={handleFilterChange} />
            </div>
            <div className="col-md-3">
              <label className="form-label fw-bold small text-muted">City</label>
              <select name="city" className="form-select" value={filters.city} onChange={handleFilterChange}>
                <option value="">All Cities</option>
                {cityOptions.map((city) => <option key={city} value={city}>{city}</option>)}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label fw-bold small text-muted">State</label>
              <select name="state" className="form-select" value={filters.state} onChange={handleFilterChange}>
                <option value="">All States</option>
                {stateOptions.map((state) => <option key={state} value={state}>{state}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover table-striped mb-0 align-middle" style={{ fontSize: '16px' }}>
             <thead className="table-dark small">
                <tr>
                  <th className="ps-4" width="40"><input className="form-check-input" type="checkbox" checked={selectAll} onChange={handleSelectAll} /></th>
                  <th className="fw-bold py-3">SUPPLIER DETAILS</th>
                  <th className="fw-bold py-3">MOBILE</th>
                  <th className="fw-bold py-3">CITY</th>
                  <th className="fw-bold py-3">STATE</th>
                  <th className="fw-bold py-3 text-end pe-4" width="120">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredSuppliers.length === 0 ? (
                  <tr><td colSpan="6" className="text-center py-5 text-muted">No suppliers found matching your criteria.</td></tr>
                ) : (
                  filteredSuppliers.map(c => (
                    <tr key={c.id}>
                      <td className="ps-4"><input className="form-check-input" type="checkbox" checked={selectedIds.includes(c.id)} onChange={() => handleCheckboxChange(c.id)} /></td>
                      <td>
                        <div className="fw-bold text-dark">{c.name}</div>
                        <div className="text-muted small" style={{ fontSize: '12px' }}>ID: {c.id}</div>
                      </td>
                      <td className="small">{c.mobile}</td>
                      <td><span className="badge bg-light text-dark border">{c.billing_city}</span></td>
                      <td className="small">{c.billing_state}</td>
                      <td className="text-end pe-4">
                        <div className="d-flex justify-content-end gap-2">
                          <button className="btn btn-outline-primary btn-sm rounded-circle d-flex align-items-center justify-content-center border-0 "
                            style={{ width: '32px', height: '32px' }} onClick={() => navigate(`/EditSupplier/${c.id}`)} title="Edit">
                            <i className="bi bi-pencil-square"></i>
                          </button>
                          <button className="btn btn-outline-danger btn-sm rounded-circle d-flex align-items-center justify-content-center border-0 "
                            style={{ width: '32px', height: '32px' }} onClick={() => handleDelete(c.id)} title="Delete">
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
        <div className="card-footer bg-white py-3">
          <span className="text-muted small">Showing {filteredSuppliers.length} of {suppliers.length} suppliers total</span>
        </div>
      </div>
    </div>
  );
}

export default Suppliermy;
