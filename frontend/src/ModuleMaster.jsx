import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const API = process.env.REACT_APP_API_URL;

function ModuleMaster() {
  const [modules, setModules] = useState([]);
  const [newModule, setNewModule] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editModule, setEditModule] = useState("");

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    const res = await axios.get(`${API}/module`);
    setModules(res.data);
  };

  const handleAdd = async () => {
    if (!newModule.trim()) return;

    const duplicate = modules.find(
      (m) =>
        m.module_name.toLowerCase() === newModule.trim().toLowerCase()
    );

    if (duplicate) {
      alert("Module already exists!");
      return;
    }

    await axios.post(`${API}/module`, { module_name: newModule });
    setNewModule("");
    setShowInput(false);
    fetchModules();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this module?")) {
      await axios.delete(`${API}/module/${id}`);
      fetchModules();
    }
  };

  const handleEdit = (m) => {
    setEditId(m.id);
    setEditModule(m.module_name);
  };

  const handleUpdate = async () => {
    await axios.put(`${API}/module/${editId}`, {
      module_name: editModule,
    });
    setEditId(null);
    setEditModule("");
    fetchModules();
  };

  return (
    <div className="container mt-4">
      <h4 className="text-center mb-4">Module Master</h4>

      {/* Add New */}
      {!showInput ? (
        <button
          className="btn btn-success mb-3"
          onClick={() => setShowInput(true)}
        >
          + New Module
        </button>
      ) : (
        <div className="d-flex mb-3">
          <input
            className="form-control me-2"
            placeholder="Module name"
            value={newModule}
            onChange={(e) => setNewModule(e.target.value)}
          />
          <button className="btn btn-primary me-2" onClick={handleAdd}>
            Save
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => setShowInput(false)}
          >
            Cancel
          </button>
        </div>
      )}

      {/* Table */}
      <table className="table table-bordered">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Module Name</th>
            <th width="200">Action</th>
          </tr>
        </thead>
        <tbody>
          {modules.map((m) => (
            <tr key={m.id}>
              <td>{m.id}</td>
              <td>
                {editId === m.id ? (
                  <input
                    className="form-control"
                    value={editModule}
                    onChange={(e) => setEditModule(e.target.value)}
                  />
                ) : (
                  m.module_name
                )}
              </td>
              <td>
                {editId === m.id ? (
                  <>
                    <button
                      className="btn btn-success btn-sm me-2"
                      onClick={handleUpdate}
                    >
                      Update
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setEditId(null)}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="btn btn-warning btn-sm me-2"
                      onClick={() => handleEdit(m)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
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

export default ModuleMaster;
