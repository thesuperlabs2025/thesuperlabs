import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
const API = process.env.REACT_APP_API_URL;

function SizeForm() {
  const [sizes, setSizes] = useState([]);

  const [newSize, setNewSize] = useState("");
  const [showNewInput, setShowNewInput] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editSize, setEditSize] = useState("");

  useEffect(() => {
    fetchSizes();
  }, []);

  const fetchSizes = async () => {
    try {
      const res = await axios.get(`${API}/size`);
      setSizes(res.data);
    } catch (error) {
      console.error("Error fetching sizes:", error);
    }
  };

  const handleAddSize = async () => {
    if (newSize.trim() === "") return;

    // Duplicate check (frontend)
    const duplicate = sizes.find(
      (s) => s.size.toLowerCase() === newSize.trim().toLowerCase()
    );

    if (duplicate) {
      alert("⚠️ Size already exists!");
      return;
    }

    try {
      await axios.post(`${API}/size`, {
        size: newSize,
      });

      setNewSize("");
      setShowNewInput(false);
      fetchSizes();
    } catch (err) {
      alert("❌ Something went wrong while adding size!");
      console.error("Error adding size:", err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure to delete this size?")) {
      try {
        await axios.delete(`${API}/size/${id}`);
        fetchSizes();
      } catch (error) {
        console.error("Error deleting size:", error);
      }
    }
  };

  const handleEdit = (s) => {
    setEditId(s.id);
    setEditSize(s.size);
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`${API}/size/${editId}`, {
        size: editSize,
      });
      setEditId(null);
      setEditSize("");
      fetchSizes();
    } catch (error) {
      console.error("Error updating size:", error);
    }
  };

  return (
    <div className="container mt-5">
      <h4 className="mb-4 text-center">Size Dropdown (CRUD + Inline Add)</h4>

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
                placeholder="Enter new size"
                value={newSize}
                onChange={(e) => setNewSize(e.target.value)}
              />
              <button className="btn btn-primary me-2" onClick={handleAddSize}>
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

      <h5 className="mt-4 mb-3">All Sizes</h5>
      <table className="table table-bordered table-striped">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Size</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sizes.map((s) => (
            <tr key={s.id}>
              <td>{s.id}</td>
              <td>
                {editId === s.id ? (
                  <input
                    type="text"
                    value={editSize}
                    className="form-control"
                    onChange={(e) => setEditSize(e.target.value)}
                  />
                ) : (
                  s.size
                )}
              </td>
              <td>
                {editId === s.id ? (
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
                      onClick={() => handleEdit(s)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(s.id)}
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

export default SizeForm;
