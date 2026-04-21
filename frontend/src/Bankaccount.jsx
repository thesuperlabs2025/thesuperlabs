import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
const API = process.env.REACT_APP_API_URL;

function BankaccountForm() {
  const [bankaccounts, setBankaccounts] = useState([]);
  const [newBankaccount, setNewBankaccount] = useState("");
  const [showNewInput, setShowNewInput] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editBankaccount, setEditBankaccount] = useState("");

  // ✅ Fetch all bank accounts
  const fetchBankaccounts = async () => {
    try {
      const res = await axios.get(`${API}/bankaccount`);
      setBankaccounts(res.data);
    } catch (error) {
      console.error("Error fetching bank accounts:", error);
    }
  };

  useEffect(() => {
    fetchBankaccounts();
  }, []);

  // ✅ Add new bank account
  const handleAddBankaccount = async () => {
    if (newBankaccount.trim() === "") return;

    // Duplicate check
    const duplicate = bankaccounts.find(
      (b) => b.bankaccount.toLowerCase() === newBankaccount.trim().toLowerCase()
    );
    if (duplicate) {
      alert("⚠️ Bank account already exists!");
      return;
    }

    try {
      await axios.post(`${API}/bankaccount`, {
        bankaccount: newBankaccount,
      });
      setNewBankaccount("");
      setShowNewInput(false);
      fetchBankaccounts();
    } catch (err) {
      alert("❌ Something went wrong while adding bank account!");
      console.error("Error adding bank account:", err);
    }
  };

  // ✅ Delete bank account
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this bank account?")) {
      try {
        await axios.delete(`${API}/bankaccount/${id}`);
        fetchBankaccounts();
      } catch (error) {
        console.error("Error deleting bank account:", error);
      }
    }
  };

  // ✅ Start editing bank account
  const handleEdit = (b) => {
    setEditId(b.id);
    setEditBankaccount(b.bankaccount);
  };

  // ✅ Update bank account
  const handleUpdate = async () => {
    if (editBankaccount.trim() === "") return;
    try {
      await axios.put(`${API}/bankaccount/${editId}`, {
        bankaccount: editBankaccount,
      });
      setEditId(null);
      setEditBankaccount("");
      fetchBankaccounts();
    } catch (error) {
      console.error("Error updating bank account:", error);
    }
  };

  return (
    <div className="container mt-5">
      <h4 className="mb-4 text-center">Bank Account (CRUD + Inline Add)</h4>

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
              placeholder="Enter new bank account"
              value={newBankaccount}
              onChange={(e) => setNewBankaccount(e.target.value)}
            />
            <button
              className="btn btn-primary me-2"
              onClick={handleAddBankaccount}
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

      <h5 className="mt-4 mb-3">All Bank Accounts</h5>
      <table className="table table-bordered table-striped">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Bank Account</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {bankaccounts.map((b) => (
            <tr key={b.id}>
              <td>{b.id}</td>
              <td>
                {editId === b.id ? (
                  <input
                    type="text"
                    value={editBankaccount}
                    className="form-control"
                    onChange={(e) => setEditBankaccount(e.target.value)}
                  />
                ) : (
                  b.bankaccount
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

export default BankaccountForm;
