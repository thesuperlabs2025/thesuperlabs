import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
const API = process.env.REACT_APP_API_URL;

function BrandnameForm() {
  const [brandnames, setBrandnames] = useState([]);
  const [newBrandname, setNewBrandname] = useState("");
  const [showNewInput, setShowNewInput] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editBrandname, setEditBrandname] = useState("");

  useEffect(() => {
    fetchBrandnames();
  }, []);

  const fetchBrandnames = async () => {
    try {
      const res = await axios.get(`${API}/brandname`);
      setBrandnames(res.data);
    } catch (error) {
      console.error("Error fetching brand names:", error);
    }
  };

  const handleAddBrandname = async () => {
    if (newBrandname.trim() === "") return;

    // ✅ Check duplicate (frontend)
    const duplicate = brandnames.find(
      (b) => b.brandname.toLowerCase() === newBrandname.trim().toLowerCase()
    );

    if (duplicate) {
      alert("⚠️ Brand name already exists!");
      return;
    }

    try {
      await axios.post(`${API}/brandname`, {
        brandname: newBrandname,
      });

      setNewBrandname("");
      setShowNewInput(false);
      fetchBrandnames();
    } catch (err) {
      alert("❌ Something went wrong while adding brand name!");
      console.error("Error adding brand name:", err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure to delete this brand name?")) {
      try {
        await axios.delete(`${API}/brandname/${id}`);
        fetchBrandnames();
      } catch (error) {
        console.error("Error deleting brand name:", error);
      }
    }
  };

  const handleEdit = (b) => {
    setEditId(b.id);
    setEditBrandname(b.brandname);
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`${API}/brandname/${editId}`, {
        brandname: editBrandname,
      });
      setEditId(null);
      setEditBrandname("");
      fetchBrandnames();
    } catch (error) {
      console.error("Error updating brand name:", error);
    }
  };

  return (
    <div className="container mt-5">
     

      <div className="mb-3">
        <div className="d-flex">
          {!showNewInput ? (
            <button
              className="btn btn-success"
              onClick={() => setShowNewInput(true)}
            >
              + New
            </button>
          ) : (
            <div className="d-flex">
              <input
                type="text"
                className="form-control me-2"
                placeholder="Enter new brand name"
                value={newBrandname}
                onChange={(e) => setNewBrandname(e.target.value)}
              />
              <button className="btn btn-primary me-2" onClick={handleAddBrandname}>
                Save
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setShowNewInput(false)}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      <h5 className="mt-4 mb-3">All Brand Names</h5>
      <table className="table table-bordered table-striped">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Brand Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {brandnames.map((b) => (
            <tr key={b.id}>
              <td>{b.id}</td>
              <td>
                {editId === b.id ? (
                  <input
                    type="text"
                    value={editBrandname}
                    className="form-control"
                    onChange={(e) => setEditBrandname(e.target.value)}
                  />
                ) : (
                  b.brandname
                )}
              </td>
              <td>
                {editId === b.id ? (
                  <>
                    <button
                      className="btn btn-sm btn-success me-2"
                      onClick={handleUpdate}
                    >
                      Update
                    </button>
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => setEditId(null)}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="btn btn-sm btn-warning me-2"
                      onClick={() => handleEdit(b)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(b.id)}
                    >
                      Delete
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default BrandnameForm;
