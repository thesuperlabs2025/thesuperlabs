import { useEffect, useState } from "react";
import axios from "axios";

const API = process.env.REACT_APP_API_URL;

export default function UserPrivilege() {
  const [userTypes, setUserTypes] = useState([]);
  const [selectedType, setSelectedType] = useState("");
  const [privileges, setPrivileges] = useState([]);
  const [changedPrivileges, setChangedPrivileges] = useState({});
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Fetch user types
  useEffect(() => {
    axios.get(`${API}/usertype`).then(res => setUserTypes(res.data));
  }, []);

  // Fetch privileges for selected type
  useEffect(() => {
    if (selectedType) {
      axios.get(`${API}/privileges/${selectedType}`)
        .then(res => setPrivileges(res.data));
    } else {
      setPrivileges([]);
    }
    setChangedPrivileges({});
  }, [selectedType]);

  // Toggle checkbox
  const toggle = (index, field) => {
    const updated = [...privileges];
    updated[index][field] = updated[index][field] ? 0 : 1;
    setPrivileges(updated);

    // Track changes for saving later
    setChangedPrivileges(prev => ({
      ...prev,
      [updated[index].module_id]: { ...updated[index] }
    }));
  };

  // Save all changes
  const handleSave = async () => {
    if (!selectedType) return;

    setSuccess("");
    setError("");

    try {
      const updates = Object.values(changedPrivileges);
      for (let p of updates) {
        await axios.post(`${API}/privileges`, {
          usertype_id: selectedType,
          module_id: p.module_id,
          can_add: p.can_add,
          can_update: p.can_update,
          can_delete: p.can_delete,
          can_view: p.can_view,
          can_print: p.can_print
        });
      }
      setSuccess("Privileges saved successfully!");
      setChangedPrivileges({});
    } catch (err) {
      console.error(err);
      setError("Error saving privileges");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>User Privileges</h2>

      <select
        value={selectedType}
        onChange={(e) => setSelectedType(e.target.value)}
        className="form-select mb-3"
      >
        <option value="">Select User Type</option>
        {userTypes.map(u => (
          <option key={u.id} value={u.id}>{u.role}</option>
        ))}
      </select>

      {error && <div style={{ color: "red", marginBottom: 10 }}>{error}</div>}
      {success && <div style={{ color: "green", marginBottom: 10 }}>{success}</div>}

      {privileges.length > 0 && (
        <>
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Module</th>
                <th>Add</th>
                <th>Update</th>
                <th>Delete</th>
                <th>View</th>
                <th>Print</th>
              </tr>
            </thead>
            <tbody>
              {privileges.map((p, i) => (
                <tr key={p.module_id}>
                  <td>{p.module_name}</td>
                  {["can_add","can_update","can_delete","can_view","can_print"].map(f => (
                    <td key={f} style={{ textAlign:"center" }}>
                      <input type="checkbox"
                        checked={!!p[f]}
                        onChange={() => toggle(i, f)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          <button
            onClick={handleSave}
            className="btn btn-success mt-2"
            disabled={Object.keys(changedPrivileges).length === 0}
          >
            Save Privileges
          </button>
        </>
      )}
    </div>
  );
}
