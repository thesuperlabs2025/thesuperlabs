import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = process.env.REACT_APP_API_URL;

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [years, setYears] = useState([]);
  const [selectedYearLocal, setSelectedYearLocal] = useState("");
  const [loadingYears, setLoadingYears] = useState(true);
  const nav = useNavigate();

  useEffect(() => {
    document.title = "Login - TSL ERP";
    fetchYears();
  }, []);

  const fetchYears = async () => {
    try {
      setLoadingYears(true);
      const res = await axios.get(`${API}/accounting-years`);
      const yearsData = Array.isArray(res.data) ? res.data : [];
      setYears(yearsData);

      // Auto-select the active year if available
      const activeYear = yearsData.find(y => y.is_active) || yearsData[0];
      if (activeYear) {
        setSelectedYearLocal(activeYear.year_id.toString());
      }
    } catch (err) {
      console.error("Error fetching years:", err);
      setError("Failed to load accounting years. Please refresh.");
    } finally {
      setLoadingYears(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!selectedYearLocal) {
      return setError("Please select a Accounting Year");
    }

    try {
      const res = await axios.post(`${API}/auth/login`, { username, password });

      // Store initial session data
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user || {}));
      localStorage.setItem("privileges", JSON.stringify(res.data.privileges || {}));

      // Find the full year object for the selected ID
      const selectedYearObj = years.find(y => y.year_id.toString() === selectedYearLocal);
      if (selectedYearObj) {
        localStorage.setItem("selectedYear", JSON.stringify(selectedYearObj));
      } else {
        // Fallback to what server says if local selection is somehow invalid
        const availableYears = Array.isArray(res.data.years) ? res.data.years : [];
        const fallbackYear = availableYears.find(y => y.is_active) || availableYears[0];
        localStorage.setItem("selectedYear", JSON.stringify(fallbackYear));
      }

      setSuccess("Login successful!");
      setTimeout(() => nav("/dashboard"), 500);
    } catch (err) {
      console.log("LOGIN ERROR:", err.response?.data);
      setError(err.response?.data?.message || err.response?.data?.error || "Invalid username or password");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        padding: "20px",
        backgroundColor: "#f1f5f9", // Light slate background
        position: "relative",
        overflow: "hidden"
      }}
    >
      {/* Subtlest possible background elements for uniqueness */}
      <div style={{
        position: "absolute",
        top: "10%",
        right: "5%",
        width: "300px",
        height: "300px",
        borderRadius: "50%",
        background: "linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)",
        filter: "blur(80px)",
        opacity: 0.5,
        zIndex: 0
      }}></div>

      <div
        style={{
          padding: "48px 40px",
          borderRadius: "20px",
          backgroundColor: "#ffffff",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 20px 25px -5px rgba(0, 0, 0, 0.05)",
          width: "100%",
          maxWidth: "440px",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          zIndex: 1,
          border: "1px solid #e2e8f0"
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "40px" }}>
          <img
            src="/images/TSL Logo 2.jpg"
            alt="TSL"
            style={{ maxWidth: "230px", width: "100%", height: "auto" }}
          />
        </div>

        <h2 style={{ textAlign: "center", marginBottom: "8px", color: "#1e293b", fontWeight: "700", fontSize: "28px", letterSpacing: "-0.02em" }}>
          TSL Login
        </h2>
        <p style={{ textAlign: "center", marginBottom: "40px", color: "#64748b", fontSize: "15px" }}>
          Enter your credentials to manage your TSL operations
        </p>

        {error && (
          <div style={{ marginBottom: "24px", padding: "14px", backgroundColor: "#fff1f2", color: "#be123c", textAlign: "left", fontSize: "13.5px", borderRadius: "10px", border: "1px solid #ffe4e6", display: "flex", alignItems: "center", gap: "10px" }}>
            <i className="bi bi-shield-lock-fill" style={{ fontSize: "18px" }}></i>
            <span style={{ fontWeight: "500" }}>{error}</span>
          </div>
        )}

        {success && (
          <div style={{ marginBottom: "24px", padding: "14px", backgroundColor: "#f0fdf4", color: "#15803d", textAlign: "left", fontSize: "13.5px", borderRadius: "10px", border: "1px solid #dcfce7", display: "flex", alignItems: "center", gap: "10px" }}>
            <i className="bi bi-check-circle-fill" style={{ fontSize: "18px" }}></i>
            <span style={{ fontWeight: "500" }}>{success}</span>
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "8px", color: "#475569", fontSize: "13px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.025em" }}>Username</label>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{ width: "100%", padding: "14px 16px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "15px", outline: "none", transition: "all 0.2s", backgroundColor: "#ffffff" }}
              onFocus={(e) => { e.target.style.border = "1px solid #1e293b"; e.target.style.boxShadow = "0 0 0 3px rgba(30, 41, 59, 0.05)"; }}
              onBlur={(e) => { e.target.style.border = "1px solid #cbd5e1"; e.target.style.boxShadow = "none"; }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "8px", color: "#475569", fontSize: "13px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.025em" }}>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: "100%", padding: "14px 16px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "15px", outline: "none", transition: "all 0.2s", backgroundColor: "#ffffff" }}
              onFocus={(e) => { e.target.style.border = "1px solid #1e293b"; e.target.style.boxShadow = "0 0 0 3px rgba(30, 41, 59, 0.05)"; }}
              onBlur={(e) => { e.target.style.border = "1px solid #cbd5e1"; e.target.style.boxShadow = "none"; }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "8px", color: "#475569", fontSize: "13px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.025em" }}>Accounting Year</label>
            <div style={{ position: "relative" }}>
              <select
                value={selectedYearLocal}
                onChange={(e) => {
                  const val = e.target.value;
                  const pass = prompt("Enter Accounting Year Password:");
                  if (pass === "14043011") {
                    setSelectedYearLocal(val);
                  } else {
                    alert("Incorrect Password!");
                  }
                }}
                required
                disabled={loadingYears}
                style={{ width: "100%", padding: "14px 16px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "15px", outline: "none", transition: "all 0.2s", backgroundColor: "#ffffff", appearance: "none", cursor: "pointer" }}
                onFocus={(e) => { e.target.style.border = "1px solid #1e293b"; e.target.style.boxShadow = "0 0 0 3px rgba(30, 41, 59, 0.05)"; }}
                onBlur={(e) => { e.target.style.border = "1px solid #cbd5e1"; e.target.style.boxShadow = "none"; }}
              >
                {loadingYears ? (
                  <option>Loading systems...</option>
                ) : (
                  years.map(y => (
                    <option key={y.year_id} value={y.year_id}>
                      {y.year_name} {y.is_active ? "(Current)" : ""}
                    </option>
                  ))
                )}
              </select>
              <i className="bi bi-chevron-down" style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", color: "#64748b", pointerEvents: "none" }}></i>
            </div>
          </div>

          <button
            type="submit"
            disabled={loadingYears}
            style={{
              padding: "16px",
              borderRadius: "10px",
              border: "none",
              background: "#1e293b",
              color: "#ffffff",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s",
              marginTop: "8px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
            }}
            onMouseOver={(e) => { e.target.style.backgroundColor = "#0f172a"; e.target.style.transform = "translateY(-1px)"; }}
            onMouseOut={(e) => { e.target.style.backgroundColor = "#1e293b"; e.target.style.transform = "translateY(0)"; }}
          >
            Sign In
          </button>
        </form>

        <div style={{ marginTop: "40px", textAlign: "center", borderTop: "1px solid #f1f5f9", paddingTop: "24px" }}>
          <p style={{ color: "#94a3b8", fontSize: "12px" }}>
            &copy; {new Date().getFullYear()} TSL Garments. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
