import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const API = process.env.REACT_APP_API_URL;

function UserTypeMaster() {
  const [types, setTypes] = useState([]);
  const [newType, setNewType] = useState("");
  const [editId, setEditId] = useState(null);
  const [editType, setEditType] = useState("");

  useEffect(() => {
    fetchTypes();
  }, []);

  const fetchTypes = async () => {
    const res = await axios.get(`${API}/usertype`);
    setTypes(res.data);
  };

  const addType = async () => {
    if (!newType.trim()) return;

    try {
      await axios.post(`${API}/usertype`, { role: newType });
      setNewType("");
      fetchTypes();
    } catch (err) {
      alert("User type already exists!");
    }
  };

  const updateType = async () => {
    await axios.put(`${API}/usertype/${editId}`, {
      role: editType,
    });
    setEditId(null);
    setEditType("");
    fetchTypes();
  };

  const deleteType = async (id) => {
    if (window.confirm("Delete this user type?")) {
      await axios.delete(`${API}/usertype/${id}`);
      fetchTypes();
    }
  };

  return (
    <div className="container mt-5">
      <h4 className="text-center mb-4">User Type Master</h4>

      {/* Add */}
      <div className="d-flex mb-3">
        <input
          className="form-control me-2"
          placeholder="Enter user type"
          value={newType}
          onChange={(e) => setNewType(e.target.value)}
        />
        <button className="btn btn-success" onClick={addType}>
          + Add
        </button>
      </div>

      {/* Table */}
      <table className="table table-bordered">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>User Type</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {types.map((t) => (
            <tr key={t.id}>
              <td>{t.id}</td>
              <td>
                {editId === t.id ? (
                  <input
                    className="form-control"
                    value={editType}
                    onChange={(e) => setEditType(e.target.value)}
                  />
                ) : (
                  t.role
                )}
              </td>
              <td>
                {editId === t.id ? (
                  <>
                    <button
                      className="btn btn-sm btn-success me-2"
                      onClick={updateType}
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
                      onClick={() => {
                        setEditId(t.id);
                        setEditType(t.role);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => deleteType(t.id)}
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

export default UserTypeMaster;
