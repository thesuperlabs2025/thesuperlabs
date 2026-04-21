import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
const API = process.env.REACT_APP_API_URL;

function ColorForm() {
  const [colors, setColors] = useState([]);
  const [newColor, setNewColor] = useState("");
  const [showNewInput, setShowNewInput] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editColor, setEditColor] = useState("");

  useEffect(() => {
    fetchColors();
  }, []);

  const fetchColors = async () => {
    try {
      const res = await axios.get(`${API}/color`);
      setColors(res.data);
    } catch (error) {
      console.error("Error fetching colors:", error);
    }
  };

  const handleAddColor = async () => {
    if (newColor.trim() === "") return;

    // ✅ Check for duplicate (frontend)
    const duplicate = colors.find(
      (c) => c.color.toLowerCase() === newColor.trim().toLowerCase()
    );

    if (duplicate) {
      alert("⚠️ Color already exists!");
      return;
    }

    try {
      await axios.post(`${API}/color`, {
        color: newColor,
      });

      setNewColor("");
      setShowNewInput(false);
      fetchColors();
    } catch (err) {
      alert("❌ Something went wrong while adding color!");
      console.error("Error adding color:", err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure to delete this color?")) {
      try {
        await axios.delete(`${API}/color/${id}`);
        fetchColors();
      } catch (error) {
        console.error("Error deleting color:", error);
      }
    }
  };

  const handleEdit = (c) => {
    setEditId(c.id);
    setEditColor(c.color);
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`${API}/color/${editId}`, {
        color: editColor,
      });
      setEditId(null);
      setEditColor("");
      fetchColors();
    } catch (error) {
      console.error("Error updating color:", error);
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
                placeholder="Enter new color"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
              />
              <button className="btn btn-primary me-2" onClick={handleAddColor}>
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

      <h5 className="mt-4 mb-3">All Colors</h5>
      <table className="table table-bordered table-striped">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Color</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {colors.map((c) => (
            <tr key={c.id}>
              <td>{c.id}</td>
              <td>
                {editId === c.id ? (
                  <input
                    type="text"
                    value={editColor}
                    className="form-control"
                    onChange={(e) => setEditColor(e.target.value)}
                  />
                ) : (
                  c.color
                )}
              </td>
              <td>
                {editId === c.id ? (
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
                      onClick={() => handleEdit(c)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(c.id)}
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

export default ColorForm;
