import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const API = process.env.REACT_APP_API_URL;

export default function EditUser() {
  const { id } = useParams();
  const nav = useNavigate();

  const [form, setForm] = useState({
    username: "",
    name: "",
    email: "",
    role: "",
    password: "", // 🔹 added
  });

  const [userTypes, setUserTypes] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

useEffect(() => {
  const loadData = async () => {
    try {
      const [userRes, typeRes] = await Promise.all([
        axios.get(`${API}/users/${id}`),
        axios.get(`${API}/usertype`)
      ]);

      setForm({ ...userRes.data, password: "" });
      setUserTypes(typeRes.data);
    } catch (err) {
      setError("Error fetching data");
    }
  };

  loadData();
}, [id]);



 

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      await axios.put(`${API}/users/${id}`, form);
      setSuccess("User updated successfully!");
      setTimeout(() => nav("/users"), 1000);
    } catch (err) {
      setError(err.response?.data?.error || "Error updating user");
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div className="bg-white p-4 rounded shadow" style={{ width: 350 }}>
        <h4 className="text-center mb-3">Edit User</h4>

        {error && <div className="text-danger text-center mb-2">{error}</div>}
        {success && (
          <div className="text-success text-center mb-2">{success}</div>
        )}

        <form onSubmit={handleUpdate}>
          <input
            className="form-control mb-2"
            placeholder="Username"
            value={form.username}
            onChange={(e) =>
              setForm({ ...form, username: e.target.value })
            }
            required
          />

          <input
            className="form-control mb-2"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />

          <input
            type="email"
            className="form-control mb-2"
            placeholder="Email"
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
            required
          />

          {/* 🔹 Password (optional) */}
          <input
            type="password"
            className="form-control mb-2"
            placeholder="New Password (leave blank to keep same)"
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
          />

          <select
            className="form-select mb-3"
            value={form.role}
            onChange={(e) =>
              setForm({ ...form, role: e.target.value })
            }
            required
          >
            <option value="">Select User Type</option>
            {userTypes.map((t) => (
              <option key={t.id} value={t.role}>
                {t.role}
              </option>
            ))}
          </select>

          <button className="btn btn-success w-100">Update</button>
        </form>
      </div>
    </div>
  );
}
