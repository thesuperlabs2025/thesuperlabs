import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const API = process.env.REACT_APP_API_URL;

export default function UserList() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const res = await axios.get(`${API}/users`);
    setData(res.data);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await axios.delete(`${API}/users/${id}`);
      // remove user from UI instantly
      setData((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      alert("Failed to delete user");
    }
  };

  const getInitial = (name) => name?.charAt(0).toUpperCase() || "?";

  return (
    <div style={{ padding: 20 }}>
      <h2>User List</h2>

      <Link
        to="/users/add"
        style={{
          display: "inline-block",
          marginBottom: 15,
          padding: "8px 12px",
          backgroundColor: "#4CAF50",
          color: "#fff",
          textDecoration: "none",
          borderRadius: 4,
        }}
      >
        Add User
      </Link>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#f2f2f2" }}>
            <th style={th}>Profile</th>
            <th style={th}>ID</th>
            <th style={th}>Name</th>
            <th style={th}>Email</th>
            <th style={th}>Role</th>
            <th style={th}>Action</th>
          </tr>
        </thead>

        <tbody>
          {data.map((u) => (
            <tr key={u.id}>
              <td style={{ ...td, textAlign: "center" }}>
                <Link to={`/users/edit/${u.id}`} style={{ textDecoration: "none" }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      backgroundColor: "#2196F3",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "bold",
                      cursor: "pointer",
                      margin: "auto",
                    }}
                  >
                    {getInitial(u.name)}
                  </div>
                </Link>
              </td>

              <td style={td}>{u.id}</td>
              <td style={td}>{u.name}</td>
              <td style={td}>{u.email}</td>
              <td style={td}>{u.role}</td>

              <td style={td}>
                <Link
                  to={`/users/edit/${u.id}`}
                  style={btnEdit}
                >
                  Edit
                </Link>

                <button
                  onClick={() => handleDelete(u.id)}
                  style={btnDelete}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}

          {data.length === 0 && (
            <tr>
              <td colSpan={6} style={{ textAlign: "center", padding: 10 }}>
                No users found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

const th = { border: "1px solid #ddd", padding: 8 };
const td = { border: "1px solid #ddd", padding: 8 };

const btnEdit = {
  padding: "4px 8px",
  backgroundColor: "#2196F3",
  color: "#fff",
  textDecoration: "none",
  borderRadius: 4,
  marginRight: 6,
};

const btnDelete = {
  padding: "4px 8px",
  backgroundColor: "#f44336",
  color: "#fff",
  border: "none",
  borderRadius: 4,
  cursor: "pointer",
};
