import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';

function Navbar({ isSidebarOpen, toggleSidebar, company }) {
  const navigate = useNavigate();
  const isLogged = localStorage.getItem("token");

  let user = {};
  const storedUser = localStorage.getItem("user");
  if (storedUser && storedUser !== "undefined") {
    try {
      user = JSON.parse(storedUser);
    } catch (e) {
      console.error("Error parsing user from localStorage:", e);
    }
  }

  const rawName = user.name || user.username || "User";
  const username = rawName.charAt(0).toUpperCase() + rawName.slice(1);
  const initial = username.charAt(0);

  const companyName = company?.company_name || "TSL ERP";
  const shortName = companyName.split(" ").map(w => w[0]).join("").substring(0, 2).toUpperCase();

  // Get selected year for display
  const storedYear = localStorage.getItem("selectedYear");
  let selectedYearName = "";
  if (storedYear && storedYear !== "undefined") {
    try {
      selectedYearName = JSON.parse(storedYear).year_name;
    } catch (e) {
      console.error("Error parsing selectedYear:", e);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("selectedYear");
    navigate("/login");
  };

  const navItems = [
    { to: "/dashboard", label: "Dashboard", shortLabel: "Dash", icon: "bi-speedometer2" },

    { to: "/contacts", label: "Contacts", shortLabel: "Cont", icon: "bi-person-lines-fill" },
    { to: "/garments", label: "Garments", shortLabel: "Garm", icon: "bi-layers" },
    { to: "/inventory", label: "Inventory", shortLabel: "Inv", icon: "bi-box-seam" }, // Changed from bi-archive to bi-box-seam (clearer for inventory)
    { to: "/accounts", label: "Accounts", shortLabel: "Acc", icon: "bi-calculator" }, // Changed from bi-wallet2 to bi-calculator (clearer for accounting)
    { to: "/lead-my", label: "CRM", shortLabel: "CRM", icon: "bi-people-fill" },
    { to: "/reports", label: "Reports", shortLabel: "Rep", icon: "bi-graph-up" },
    { to: "/masters", label: "Masters", shortLabel: "Mast", icon: "bi-gear" },
  ];

  return (
    <aside className={`sidebar ${isSidebarOpen ? "expanded" : "collapsed"}`}>
      {/* Top Branding (SL) */}
      <div className="sidebar-header d-flex align-items-center justify-content-between px-3 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="d-flex flex-column">
          <h6 className="mb-0 fw-bold" style={{ color: 'var(--accent-color)', letterSpacing: '1px' }}>
            {isSidebarOpen ? companyName : shortName}
          </h6>
          {isSidebarOpen && selectedYearName && (
            <div className="mt-1 px-1 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.05)', fontSize: '0.6rem', color: '#888', fontWeight: 'bold', width: 'fit-content' }}>
              AY {selectedYearName}
            </div>
          )}
        </div>

        {/* Mobile Close Button */}
        {isSidebarOpen && (
          <button
            className="btn p-0 border-0 text-white d-md-none"
            onClick={toggleSidebar}
            style={{ fontSize: '1.25rem' }}
          >
            <i className="bi bi-x-lg"></i>
          </button>
        )}
      </div>

      {/* Navigation Items (Content area) */}
      <nav className="sidebar-nav flex-grow-1 overflow-y-auto py-1 scrollbar-visible">
        <ul className="list-unstyled mb-0">
          {navItems.map((item) => (
            <li key={item.to} className="nav-item">
              <NavLink
                to={item.to}
                className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
              >
                <i className={`bi ${item.icon}`}></i>
                <span className="nav-label">{isSidebarOpen ? item.label : item.shortLabel}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer Profile & Logout */}
      <div className="sidebar-footer">
        {isLogged && (
          <div className={`d-flex align-items-center ${isSidebarOpen ? 'w-100 px-3' : 'flex-column'} gap-2 mb-3`}>
            <div
              className="profile-initial"
              style={{
                width: isSidebarOpen ? 36 : 32,
                height: isSidebarOpen ? 36 : 32,
                borderRadius: "50%",
                background: "var(--accent-color)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "600",
                fontSize: isSidebarOpen ? '0.9rem' : '0.8rem',
                flexShrink: 0
              }}
            >
              {initial}
            </div>
            {isSidebarOpen && (
              <div className="ms-1 overflow-hidden">
                <div className="text-white fw-bold text-truncate" style={{ fontSize: '0.85rem' }}>{username}</div>
              </div>
            )}
          </div>
        )}
        <button
          className={`btn p-0 border-0 ${isSidebarOpen ? 'w-100 px-3' : ''} mb-2`}
          onClick={handleLogout}
        >
          <div
            className={`d-flex align-items-center ${isSidebarOpen ? 'justify-content-start gap-3 w-100' : 'justify-content-center'}`}
            style={{
              width: isSidebarOpen ? "auto" : "28px",
              height: isSidebarOpen ? "40px" : "28px",
              borderRadius: "8px",
              border: "1px solid #ff4d4d",
              color: "#ff4d4d",
              padding: isSidebarOpen ? '0 12px' : '0'
            }}
          >
            <i className="bi bi-door-open-fill" style={{ fontSize: '1rem' }}></i>
            {isSidebarOpen && <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Sign Out</span>}
          </div>
        </button>
      </div>
    </aside>
  );
}

export default Navbar;
