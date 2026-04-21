import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
const API = process.env.REACT_APP_API_URL;

function AccountHeadForm() {
  const [accountHeads, setAccountHeads] = useState([]);
  const [newAccountHead, setNewAccountHead] = useState("");
  const [showNewInput, setShowNewInput] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editAccountHead, setEditAccountHead] = useState("");

  // ✅ Fetch all account heads
  const fetchAccountHeads = async () => {
    try {
      const res = await axios.get(`${API}/accounthead`);
      setAccountHeads(res.data);
    } catch (error) {
      console.error("Error fetching account heads:", error);
    }
  };

  useEffect(() => {
    fetchAccountHeads();
  }, []);

  // ✅ Add new account head
  const handleAddAccountHead = async () => {
    if (newAccountHead.trim() === "") return;

    // Duplicate check
    const duplicate = accountHeads.find(
      (a) =>
        a.accounthead.toLowerCase() === newAccountHead.trim().toLowerCase()
    );
    if (duplicate) {
      alert("⚠️ Account head already exists!");
      return;
    }

    try {
      await axios.post(`${API}/accounthead`, {
        accounthead: newAccountHead,
      });
      setNewAccountHead("");
      setShowNewInput(false);
      fetchAccountHeads();
    } catch (err) {
      alert("❌ Something went wrong while adding account head!");
      console.error("Error adding account head:", err);
    }
  };

  // ✅ Delete account head
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this account head?")) {
      try {
        await axios.delete(`${API}/accounthead/${id}`);
        fetchAccountHeads();
      } catch (error) {
        console.error("Error deleting account head:", error);
      }
    }
  };

  // ✅ Start editing account head
  const handleEdit = (a) => {
    setEditId(a.id);
    setEditAccountHead(a.accounthead);
  };

  // ✅ Update account head
  const handleUpdate = async () => {
    if (editAccountHead.trim() === "") return;
    try {
      await axios.put(`${API}/accounthead/${editId}`, {
        accounthead: editAccountHead,
      });
      setEditId(null);
      setEditAccountHead("");
      fetchAccountHeads();
    } catch (error) {
      console.error("Error updating account head:", error);
    }
  };

  return (
    <div className="container mt-5">
      <h4 className="mb-4 text-center">Account Head (CRUD + Inline Add)</h4>

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
              placeholder="Enter new account head"
              value={newAccountHead}
              onChange={(e) => setNewAccountHead(e.target.value)}
            />
            <button
              className="btn btn-primary me-2"
              onClick={handleAddAccountHead}
            >
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

      <h5 className="mt-4 mb-3">All Account Heads</h5>
      <table className="table table-bordered table-striped">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Account Head</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {accountHeads.map((a) => (
            <tr key={a.id}>
              <td>{a.id}</td>
              <td>
                {editId === a.id ? (
                  <input
                    type="text"
                    value={editAccountHead}
                    className="form-control"
                    onChange={(e) => setEditAccountHead(e.target.value)}
                  />
                ) : (
                  a.accounthead
                )}
              </td>
              <td>
                {editId === a.id ? (
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
                      onClick={() => handleEdit(a)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(a.id)}
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

export default AccountHeadForm;
