import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
const API = process.env.REACT_APP_API_URL;

function ModeOfPaymentForm() {
  const [modes, setModes] = useState([]);
  const [newMode, setNewMode] = useState("");
  const [showNewInput, setShowNewInput] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editMode, setEditMode] = useState("");

  useEffect(() => {
    fetchModes();
  }, []);

  // ✅ Fetch all mode of payments
  const fetchModes = async () => {
    try {
      const res = await axios.get(`${API}/modeofpayment`);
      setModes(res.data);
    } catch (error) {
      console.error("Error fetching mode of payments:", error);
    }
  };

  // ✅ Add new mode of payment
  const handleAddMode = async () => {
    if (newMode.trim() === "") return;

    // Duplicate check
    const duplicate = modes.find(
      (m) => m.modeofpayment.toLowerCase() === newMode.trim().toLowerCase()
    );
    if (duplicate) {
      alert("⚠️ Mode of payment already exists!");
      return;
    }

    try {
      await axios.post(`${API}/modeofpayment`, {
        modeofpayment: newMode,
      });
      setNewMode("");
      setShowNewInput(false);
      fetchModes();
    } catch (err) {
      alert("❌ Something went wrong while adding mode of payment!");
      console.error("Error adding mode of payment:", err);
    }
  };

  // ✅ Delete mode of payment
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure to delete this mode of payment?")) {
      try {
        await axios.delete(`${API}/modeofpayment/${id}`);
        fetchModes();
      } catch (error) {
        console.error("Error deleting mode of payment:", error);
      }
    }
  };

  // ✅ Start editing mode of payment
  const handleEdit = (m) => {
    setEditId(m.id);
    setEditMode(m.modeofpayment);
  };

  // ✅ Update mode of payment
  const handleUpdate = async () => {
    if (editMode.trim() === "") return;
    try {
      await axios.put(`${API}/modeofpayment/${editId}`, {
        modeofpayment: editMode,
      });
      setEditId(null);
      setEditMode("");
      fetchModes();
    } catch (error) {
      console.error("Error updating mode of payment:", error);
    }
  };

  return (
    <div className="container mt-5">
      <h4 className="mb-4 text-center">Mode of Payment (CRUD + Inline Add)</h4>

      <div className="mb-3">
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
              placeholder="Enter new mode of payment"
              value={newMode}
              onChange={(e) => setNewMode(e.target.value)}
            />
            <button className="btn btn-primary me-2" onClick={handleAddMode}>
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

      <h5 className="mt-4 mb-3">All Modes of Payment</h5>
      <table className="table table-bordered table-striped">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Mode of Payment</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {modes.map((m) => (
            <tr key={m.id}>
              <td>{m.id}</td>
              <td>
                {editId === m.id ? (
                  <input
                    type="text"
                    value={editMode}
                    className="form-control"
                    onChange={(e) => setEditMode(e.target.value)}
                  />
                ) : (
                  m.modeofpayment
                )}
              </td>
              <td>
                {editId === m.id ? (
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
                      onClick={() => handleEdit(m)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(m.id)}
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

export default ModeOfPaymentForm;
