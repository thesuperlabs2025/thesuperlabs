import { useState,useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = process.env.REACT_APP_API_URL;

export default function AddUser() {
const [form, setForm] = useState({
username: "",
password: "",
name: "",
email: "",
role: "user",
});
const [error, setError] = useState("");
const [success, setSuccess] = useState("");
const [types, setTypes] = useState([]);

const nav = useNavigate();

const handleSubmit = async (e) => {
e.preventDefault();
setError("");
setSuccess("");
try {
await axios.post(`${API}/users`, form);
setSuccess("User added successfully!");
setTimeout(() => nav("/users"), 1000);
} catch (err) {
console.log("ADD USER ERROR:", err.response?.data);
setError(err.response?.data?.error || "Error adding user");
}
};

useEffect(() => {
  fetchUserTypes();
}, []);

const fetchUserTypes = async () => {
  try {
    const res = await axios.get(`${API}/usertype`);
    setTypes(res.data);
  } catch (err) {
    console.error("Error fetching user types", err);
  }
};

return (
<div
style={{
display: "flex",
justifyContent: "center",
alignItems: "center",
padding: 40,
backgroundColor: "#f0f0f0",
minHeight: "100vh",
}}
>
<div
style={{
backgroundColor: "#fff",
padding: 30,
borderRadius: 8,
boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
width: 350,
display: "flex",
flexDirection: "column",
}}
>
<h2 style={{ textAlign: "center", marginBottom: 20 }}>Add User</h2>

    {error && (
      <div
        style={{
          color: "red",
          textAlign: "center",
          marginBottom: 10,
          fontSize: 14,
        }}
      >
        {error}
      </div>
    )}

    {success && (
      <div
        style={{
          color: "green",
          textAlign: "center",
          marginBottom: 10,
          fontSize: 14,
        }}
      >
        {success}
      </div>
    )}

    <form
      onSubmit={handleSubmit}
      style={{ display: "flex", flexDirection: "column" }}
    >
      <input
        type="text"
        placeholder="Username"
        value={form.username}
        onChange={(e) => setForm({ ...form, username: e.target.value })}
        style={{ padding: 10, marginBottom: 10, borderRadius: 4, border: "1px solid #ccc", fontSize: 16 }}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        style={{ padding: 10, marginBottom: 10, borderRadius: 4, border: "1px solid #ccc", fontSize: 16 }}
        required
      />
      <input
        type="text"
        placeholder="Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        style={{ padding: 10, marginBottom: 10, borderRadius: 4, border: "1px solid #ccc", fontSize: 16 }}
        required
      />
      <input
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        style={{ padding: 10, marginBottom: 10, borderRadius: 4, border: "1px solid #ccc", fontSize: 16 }}
        required
      />
  <select
  value={form.role}
  onChange={(e) => setForm({ ...form, role: e.target.value })}
  className="form-select"
>
  <option value="">Select Role</option>
  {types.map((t) => (
    <option key={t.id} value={t.role}>
      {t.role}
    </option>
  ))}
</select>
<br />


      <button
        type="submit"
        style={{
          padding: 10,
          borderRadius: 4,
          border: "none",
          backgroundColor: "#4CAF50",
          color: "#fff",
          fontSize: 16,
          cursor: "pointer",
        }}
      >
        Save
      </button>
    </form>
  </div>
</div>


);
}
