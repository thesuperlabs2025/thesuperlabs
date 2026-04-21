import Loader from "./Loader";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
const API = process.env.REACT_APP_API_URL;

function Employeemy() {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    name: "",
    mobile: "",
    email: "",
  });

  const [nameSuggestions, setNameSuggestions] = useState([]);
  const navigate = useNavigate();

  // Fetch employees
  const fetchEmployees = async () => {
    try {
      const res = await axios.get(`${API}/employees`);
      setEmployees(res.data);
      setFilteredEmployees(res.data);
    } catch (err) {
      console.error("Error fetching employees:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Filter logic
  useEffect(() => {
    let result = employees.filter((e) => {
      return (
        (filters.name === "" ||
          e.employee_name?.toLowerCase().includes(filters.name.toLowerCase())) &&
        (filters.mobile === "" ||
          e.mobile?.toLowerCase().includes(filters.mobile.toLowerCase())) &&
        (filters.email === "" ||
          e.email?.toLowerCase().includes(filters.email.toLowerCase()))
      );
    });
    setFilteredEmployees(result);
  }, [filters, employees]);

  // Handle input change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));

    // Autocomplete for name
    if (name === "name") {
      if (value.trim() === "") {
        setNameSuggestions([]);
      } else {
        const suggestions = employees
          .filter((emp) =>
            emp.employee_name?.toLowerCase().includes(value.toLowerCase())
          )
          .slice(0, 5);
        setNameSuggestions(suggestions);
      }
    }
  };

  const handleNameSelect = (name) => {
    setFilters((prev) => ({ ...prev, name }));
    setNameSuggestions([]);
  };

  // Delete single employee
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      try {
        await axios.delete(`${API}/employees/${id}`);
        alert("Employee deleted successfully!");
        fetchEmployees();
      } catch (err) {
        console.error("Error deleting employee:", err);
      }
    }
  };

  // Checkbox handlers
  const handleCheckboxChange = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (!selectAll) {
      const allIds = filteredEmployees.map((e) => e.id);
      setSelectedIds(allIds);
    } else {
      setSelectedIds([]);
    }
    setSelectAll(!selectAll);
  };

  // Delete selected
  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) {
      alert("Please select at least one employee to delete.");
      return;
    }
    if (window.confirm("Are you sure you want to delete selected employees?")) {
      try {
        for (const id of selectedIds) {
          await axios.delete(`${API}/employees/${id}`);
        }
        alert("Selected employees deleted successfully!");
        setSelectedIds([]);
        setSelectAll(false);
        fetchEmployees();
      } catch (err) {
        console.error("Error deleting selected employees:", err);
      }
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="container-fluid py-4 px-md-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-primary mb-0">
          <i className="bi bi-people me-2"></i>Employee Master
        </h2>
        <div className="btn-group shadow-sm">
          <button className="btn btn-primary d-flex align-items-center fw-bold px-4" onClick={() => navigate("/employee")}>
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
            <div className="col-md-4 position-relative">
              <label className="form-label fw-bold small text-muted">Employee Name</label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0"><i className="bi bi-person text-muted small"></i></span>
                <input type="text" name="name" className="form-control border-start-0 ps-0" placeholder="Search name..." value={filters.name} onChange={handleFilterChange} autoComplete="off" />
              </div>
              {nameSuggestions.length > 0 && (
                <ul className="list-group position-absolute shadow-sm" style={{ zIndex: 1000, width: '31%', marginTop: '5px', maxHeight: "200px", overflowY: "auto" }}>
                  {nameSuggestions.map((s, index) => (
                    <li key={index} className="list-group-item list-group-item-action fw-bold small" onClick={() => handleNameSelect(s.employee_name)} style={{ cursor: "pointer" }}>
                      {s.employee_name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="col-md-4">
              <label className="form-label fw-bold small text-muted">Mobile Number</label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0"><i className="bi bi-phone text-muted small"></i></span>
                <input type="text" name="mobile" className="form-control border-start-0 ps-0" placeholder="Search mobile..." value={filters.mobile} onChange={handleFilterChange} />
              </div>
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
                  <th className="fw-bold py-3">ID</th>
                  <th className="fw-bold py-3">EMPLOYEE NAME</th>
                  <th className="fw-bold py-3">MOBILE</th>
                  <th className="fw-bold py-3 text-end pe-4" width="120">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-5 text-muted fw-bold">No employees found.</td></tr>
                ) : (
                  filteredEmployees.map((e) => (
                    <tr key={e.id}>
                      <td className="ps-4"><input className="form-check-input" type="checkbox" checked={selectedIds.includes(e.id)} onChange={() => handleCheckboxChange(e.id)} /></td>
                      <td className="text-muted small">#{e.id}</td>
                      <td className="fw-bold text-dark">{e.employee_name}</td>
                      <td className="small">{e.mobile}</td>
                      <td className="text-end pe-4">
                        <div className="d-flex justify-content-end gap-2">
                          <button className="btn btn-outline-primary btn-sm rounded-circle d-flex align-items-center justify-content-center border-0 "
                            style={{ width: '32px', height: '32px' }} onClick={() => navigate(`/editemployee/${e.id}`)} title="Edit">
                            <i className="bi bi-pencil-square"></i>
                          </button>
                          <button className="btn btn-outline-danger btn-sm rounded-circle d-flex align-items-center justify-content-center border-0 "
                            style={{ width: '32px', height: '32px' }} onClick={() => handleDelete(e.id)} title="Delete">
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
        <div className="card-footer bg-white py-3 border-0">
          <span className="text-muted small">Showing {filteredEmployees.length} of {employees.length} employees</span>
        </div>
      </div>
    </div>
  );
}

export default Employeemy;
