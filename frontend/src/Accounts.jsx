import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = process.env.REACT_APP_API_URL;

function Accounts() {
  const navigate = useNavigate();
  const [activeGroup, setActiveGroup] = useState("all");
  const [counts, setCounts] = useState({});

  useEffect(() => {
    document.title = "Accounts & Finance - TSL ERP";
    fetchCounts();
  }, []);

  const fetchCounts = async () => {
    try {
      const res = await axios.get(`${API}/dashboard/accounts-counts`);
      setCounts(res.data);
    } catch (err) {
      console.error("Error fetching counts:", err);
    }
  };

  const mainCards = [
    { key: "invoice", title: "Invoice", icon: "bi-receipt-cutoff", path: "/invoicemy", color: "#2563eb", bg: "#eff6ff", desc: "Generate pro customer bills" },
    { key: "receipt", title: "Receipt", icon: "bi-file-earmark-check", path: "/receiptmy", color: "#10b981", bg: "#ecfdf5", desc: "Track customer payment receipts" },
    { key: "purchase", title: "Purchase", icon: "bi-cart-check", path: "/purchasemy", color: "#f59e0b", bg: "#fffbeb", desc: "Manage supplier material entries" },
    { key: "voucher", title: "Voucher", icon: "bi-ticket-detailed", path: "/vouchermy", color: "#e91e63", bg: "#fff1f2", desc: "Record journal & cash entries" },
  ];

  const confirmationCards = [
    { key: "quotation", title: "Quotation", icon: "bi-file-earmark-text", path: "/quotationmy", color: "#9c27b0", bg: "#faf5ff", desc: "Create professional sales quotes" },
    { key: "pi", title: "PI | Sales Order", icon: "bi-file-earmark-check-fill", path: "/pimy", color: "#00bcd4", bg: "#ecfeff", desc: "Confirm orders with PI" },
    { key: "po", title: "PO", icon: "bi-bag-check", path: "/pomy", color: "#ff5722", bg: "#fff7ed", desc: "Issue official purchase orders" },
    { key: "grn", title: "GRN", icon: "bi-inboxes-fill", path: "/grnmy", color: "#795548", bg: "#fefbeb", desc: "Log received goods shipments" },
    { key: "dc", title: "DC", icon: "bi-truck", path: "/dcmy", color: "#607d8b", bg: "#f8fafc", desc: "Track delivery & shipping notes" },
    { key: "estimate", title: "Estimate", icon: "bi-calculator", path: "/estimatemy", color: "#3f51b5", bg: "#eef2ff", desc: "Draft project cost estimates" },
  ];

  const returnCards = [
    { key: "salesReturn", title: "Sales Return", icon: "bi-arrow-return-left", path: "/salesreturnmy", color: "#f44336", bg: "#fef2f2", desc: "Process customer item returns" },
    { key: "creditNote", title: "Credit Note", icon: "bi-credit-card-2-back", path: "/creditnotemy", color: "#009688", bg: "#f0fdfa", desc: "Issue credit & balance notes" },
    { key: "purchaseReturn", title: "Purchase Return", icon: "bi-arrow-return-right", path: "/purchasereturnmy", color: "#ff9800", bg: "#fff7ed", desc: "Return goods back to vendor" },
    { key: "debitNote", title: "Debit Note", icon: "bi-credit-card", path: "/debitnotemy", color: "#673ab7", bg: "#f5f3ff", desc: "Log debit memo adjustments" },
  ];

  const groups = [
    { key: "all", label: "All Activity" },
    { key: "main", label: "Transactions" },
    { key: "confirm", label: "Operations" },
    { key: "returns", label: "Returns" },
  ];

  const ModuleCard = ({ mKey, title, icon, path, color, bg, desc }) => (
    <div
      onClick={() => path && navigate(path)}
      style={{
        background: "#ffffff",
        borderRadius: "16px",
        padding: "20px",
        cursor: "pointer",
        border: "1px solid #e2e8f0",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
        position: "relative"
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = `0 12px 24px -8px ${color}25`;
        e.currentTarget.style.borderColor = color;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.02)";
        e.currentTarget.style.borderColor = "#e2e8f0";
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <i className={`bi ${icon}`} style={{ fontSize: 22, color }} />
        </div>
        <div style={{ background: "#f8fafc", padding: "4px 10px", borderRadius: 8, fontSize: "0.85rem", fontWeight: 800, color: "#1e293b", border: "1px solid #f1f5f9" }}>
          {counts[mKey] || 0}
        </div>
      </div>
      <div>
        <div style={{ fontWeight: 800, fontSize: "1rem", color: "#0f172a", letterSpacing: "-0.01em" }}>{title}</div>
        <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: 2, lineHeight: 1.4, fontWeight: 500 }}>{desc}</div>
      </div>
    </div>
  );

  const SectionTitle = ({ title, icon, color, count }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
      <div style={{ background: color, width: 34, height: 34, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 12px ${color}30` }}>
        <i className={`bi ${icon}`} style={{ color: "#fff", fontSize: 14 }} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontWeight: 850, fontSize: "1.05rem", color: "#1e293b", letterSpacing: "-0.01em" }}>{title}</span>
        <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#64748b" }}>
          {count}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh", padding: "32px", fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Page Header */}
      <div style={{
        background: "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)",
        borderRadius: 24, padding: "40px", marginBottom: 32,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        boxShadow: "0 20px 40px -12px rgba(37,99,235,0.3)",
        position: "relative", overflow: "hidden"
      }}>
        <div style={{ position: "absolute", top: "-20%", right: "-5%", width: 300, height: 300, background: "rgba(255,255,255,0.08)", borderRadius: "50%", filter: "blur(60px)" }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.12)", padding: "4px 12px", borderRadius: 8, color: "#fff", fontSize: 12, fontWeight: 700, letterSpacing: "0.05em", marginBottom: 12 }}>
            <i className="bi bi-shield-check" />
            SUPERLABS ERP
          </div>
          <h1 style={{ fontSize: "clamp(1.8rem, 5vw, 2.4rem)", fontWeight: 900, color: "#fff", margin: 0, letterSpacing: "-0.04em" }}>Accounts & Finance</h1>
          <p style={{ color: "rgba(255,255,255,0.8)", margin: "10px 0 0", fontSize: 16, maxWidth: 500, lineHeight: 1.5 }}>Manage your daily invoicing, track payments, and organize financial documents with precision.</p>
        </div>
        <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 22, padding: "18px", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 32px rgba(0,0,0,0.1)" }}>
          <i className="bi bi-bank" style={{ fontSize: 32, color: "#fff" }} />
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: 10, marginBottom: 32, overflowX: "auto", paddingBottom: 8, scrollbarWidth: "none" }}>
        {groups.map(g => (
          <button
            key={g.key}
            onClick={() => setActiveGroup(g.key)}
            style={{
              padding: "10px 24px", borderRadius: 14, border: "1px solid", fontWeight: 700, fontSize: "0.9rem", cursor: "pointer",
              background: activeGroup === g.key ? "#1e293b" : "#fff",
              borderColor: activeGroup === g.key ? "#1e293b" : "#e2e8f0",
              color: activeGroup === g.key ? "#fff" : "#64748b",
              boxShadow: activeGroup === g.key ? "0 10px 20px -6px rgba(30,41,59,0.3)" : "0 1px 2px rgba(0,0,0,0.04)",
              transition: "all 0.2s",
              whiteSpace: "nowrap"
            }}
          >{g.label}</button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
        {/* Row 1: Core Transactions */}
        {(activeGroup === "all" || activeGroup === "main") && (
          <div>
            <SectionTitle title="Core Transactions" icon="bi-lightning-fill" color="#2563eb" count={mainCards.length} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
              {mainCards.map(({ key, ...c }, i) => <ModuleCard key={i} mKey={key} {...c} />)}
            </div>
          </div>
        )}

        {/* Row 2: Orders & Documents */}
        {(activeGroup === "all" || activeGroup === "confirm") && (
          <div>
            <SectionTitle title="Orders & Documents" icon="bi-stack" color="#f59e0b" count={confirmationCards.length} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
              {confirmationCards.map(({ key, ...c }, i) => <ModuleCard key={i} mKey={key} {...c} />)}
            </div>
          </div>
        )}

        {/* Row 3: Returns & Adjustments */}
        {(activeGroup === "all" || activeGroup === "returns") && (
          <div>
            <SectionTitle title="Returns & Adjustments" icon="bi-arrow-left-right" color="#ef4444" count={returnCards.length} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
              {returnCards.map(({ key, ...c }, i) => <ModuleCard key={i} mKey={key} {...c} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Accounts;
