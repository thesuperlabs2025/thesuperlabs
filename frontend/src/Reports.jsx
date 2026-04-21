import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Reports() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [activeCategory, setActiveCategory] = React.useState("ALL");
  const [favorites, setFavorites] = React.useState(() => {
    const saved = localStorage.getItem("report_favorites");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    document.title = "Reports - TSL ERP";
  }, []);

  useEffect(() => {
    localStorage.setItem("report_favorites", JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (e, id) => {
    e.stopPropagation();
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  const rawReports = [
    { id: 1, name: "Outstanding Report", route: "/outstanding", category: "ACCOUNTS", icon: "bi-hourglass-split" },
    { id: 2, name: "Invoice Ledger Report", route: "/invoice-ledger", category: "ACCOUNTS", icon: "bi-journal-text" },
    { id: 3, name: "Invoice Summary Report", route: "/invoice-summary", category: "ACCOUNTS", icon: "bi-file-earmark-bar-graph" },
    { id: 4, name: "Quotation Ledger", route: "/quotation-ledger", category: "ACCOUNTS", icon: "bi-journal-text" },
    { id: 5, name: "Quotation Summary", route: "/quotation-summary", category: "ACCOUNTS", icon: "bi-file-earmark-bar-graph" },
    { id: 6, name: "PO Ledger Report", route: "/po-ledger", category: "ACCOUNTS", icon: "bi-journal-text" },
    { id: 7, name: "PO Summary Report", route: "/po-summary", category: "ACCOUNTS", icon: "bi-file-earmark-bar-graph" },
    { id: 8, name: "DC Ledger Report", route: "/dc-ledger", category: "ACCOUNTS", icon: "bi-journal-text" },
    { id: 9, name: "DC Summary Report", route: "/dc-summary", category: "ACCOUNTS", icon: "bi-file-earmark-bar-graph" },
    { id: 10, name: "PI Ledger Report", route: "/pi-ledger", category: "ACCOUNTS", icon: "bi-journal-text" },
    { id: 11, name: "PI Summary Report", route: "/pi-summary", category: "ACCOUNTS", icon: "bi-file-earmark-bar-graph" },
    { id: 12, name: "Purchase Ledger", route: "/purchase-ledger", category: "ACCOUNTS", icon: "bi-journal-text" },
    { id: 13, name: "Purchase Summary", route: "/purchase-summary", category: "ACCOUNTS", icon: "bi-file-earmark-bar-graph" },
    { id: 14, name: "Sales Return Ledger", route: "/sales-return-ledger", category: "ACCOUNTS", icon: "bi-journal-text" },
    { id: 15, name: "Sales Return Summary", route: "/sales-return-summary", category: "ACCOUNTS", icon: "bi-file-earmark-bar-graph" },
    { id: 16, name: "Debit Note Ledger", route: "/debit-note-ledger", category: "ACCOUNTS", icon: "bi-journal-text" },
    { id: 17, name: "Debit Note Summary", route: "/debit-note-summary", category: "ACCOUNTS", icon: "bi-file-earmark-bar-graph" },
    { id: 18, name: "Purchase Return Ledger", route: "/purchase-return-ledger", category: "ACCOUNTS", icon: "bi-journal-text" },
    { id: 19, name: "Purchase Return Summary", route: "/purchase-return-summary", category: "ACCOUNTS", icon: "bi-file-earmark-bar-graph" },
    { id: 20, name: "Credit Note Ledger", route: "/credit-note-ledger", category: "ACCOUNTS", icon: "bi-journal-text" },
    { id: 21, name: "Credit Note Summary", route: "/credit-note-summary", category: "ACCOUNTS", icon: "bi-file-earmark-bar-graph" },
    { id: 22, name: "Profit and Loss", route: "/profit-loss", category: "ACCOUNTS", icon: "bi-graph-up-arrow" },
    { id: 23, name: "HSN Wise Invoice", route: "/hsn-report", category: "ACCOUNTS", icon: "bi-upc-scan" },
    { id: 24, name: "Company Statement", route: "/company-statement", category: "ACCOUNTS", icon: "bi-building" },
    { id: 25, name: "Bank Balance Report", route: "/bank-balance-report", category: "ACCOUNTS", icon: "bi-bank" },
    { id: 26, name: "Stock Report", route: "/stock-report", category: "ACCOUNTS", icon: "bi-boxes" },
    { id: 27, name: "GSTR-1 Report", route: "/gstr1-report", category: "ACCOUNTS", icon: "bi-receipt" },
    { id: 28, name: "Customer Ageing", route: "/customer-ageing", category: "ACCOUNTS", icon: "bi-person-lines-fill" },
    { id: 29, name: "Supplier Ageing", route: "/supplier-ageing", category: "ACCOUNTS", icon: "bi-people-fill" },
    { id: 30, name: "Invoice Ageing", route: "/invoice-ageing", category: "ACCOUNTS", icon: "bi-clock-history" },
    { id: 31, name: "RCM Report", route: "/rcm-report", category: "ACCOUNTS", icon: "bi-percent" },
    { id: 32, name: "Amended Invoice", route: "/amended-invoice-report", category: "ACCOUNTS", icon: "bi-pencil-square" },
    { id: 33, name: "Cash Book Report", route: "/cash-book-report", category: "ACCOUNTS", icon: "bi-cash-stack" },
    { id: 34, name: "TDS Report", route: "/tds-report", category: "ACCOUNTS", icon: "bi-file-earmark-spreadsheet" },
    { id: 35, name: "TCS Report", route: "/tcs-report", category: "ACCOUNTS", icon: "bi-file-earmark-spreadsheet" },
    { id: 36, name: "Balance Sheet", route: "/balance-sheet", category: "ACCOUNTS", icon: "bi-bar-chart-line" },
    { id: 37, name: "Trial Balance", route: "/trial-balance", category: "ACCOUNTS", icon: "bi-scale" },
    { id: 38, name: "General Ledger", route: "/general-ledger", category: "ACCOUNTS", icon: "bi-journal-bookmark" },
    { id: 39, name: "Daily Sales Report", route: "/daily-sales-report", category: "ACCOUNTS", icon: "bi-calendar-check" },
    { id: 40, name: "Order Sheet Report", route: "/order-sheet-report", category: "PRODUCTION", icon: "bi-layout-text-window" },
    { id: 41, name: "Order Ledger Report", route: "/order-ledger-report", category: "PRODUCTION", icon: "bi-journal-richtext" },
    { id: 42, name: "WIP Report", route: "/wip-report", category: "PRODUCTION", icon: "bi-activity" },
    { id: 43, name: "Style P&L Report", route: "/style-profit-loss-report", category: "PRODUCTION", icon: "bi-graph-up" },
    { id: 44, name: "Order Detailed Report", route: "/order-detailed-report", category: "PRODUCTION", icon: "bi-list-columns" },
    { id: 45, name: "Yarn Stock Report", route: "/yarn-stock-report", category: "PRODUCTION", icon: "bi-record-circle" },
    { id: 46, name: "Fabric Stock Report", route: "/fabric-stock-report", category: "PRODUCTION", icon: "bi-layers" },
    { id: 47, name: "Daily Production Report", route: "/daily-production-report", category: "PRODUCTION", icon: "bi-hammer" },
    { id: 48, name: "Fabric Balance Report", route: "/fabric-balance-report", category: "PRODUCTION", icon: "bi-balance-scale" },
    { id: 49, name: "Budget vs Actual", route: "/budget-actual-report", category: "PRODUCTION", icon: "bi-currency-rupee" },
    { id: 50, name: "Line Production Report", route: "/line-production-report", category: "PRODUCTION", icon: "bi-diagram-3" },
  ];

  const filtered = rawReports
    .filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(r => activeCategory === "ALL" || r.category === activeCategory)
    .sort((a, b) => {
      const af = favorites.includes(a.id), bf = favorites.includes(b.id);
      if (af && !bf) return -1;
      if (!af && bf) return 1;
      return a.name.localeCompare(b.name);
    });

  const accountsReports = filtered.filter(r => r.category === "ACCOUNTS");
  const productionReports = filtered.filter(r => r.category === "PRODUCTION");

  const ReportCard = ({ report }) => {
    const isFav = favorites.includes(report.id);
    const isProd = report.category === "PRODUCTION";
    const color = isProd ? "#3b82f6" : "#10b981";
    const bg = isProd ? "#eff6ff" : "#f0fdf4";

    return (
      <div
        onClick={() => navigate(report.route)}
        style={{
          background: "#fff", borderRadius: 14, padding: "14px 16px",
          display: "flex", alignItems: "center", gap: 12, cursor: "pointer",
          border: "1.5px solid #f1f5f9", transition: "all 0.18s ease",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.borderColor = color; e.currentTarget.style.boxShadow = `0 6px 20px ${color}20`; }}
        onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = "#f1f5f9"; e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)"; }}
      >
        <div style={{ width: 38, height: 38, borderRadius: 10, background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <i className={`bi ${report.icon}`} style={{ color, fontSize: 17 }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: "0.85rem", color: "#1e293b" }}>{report.name}</div>
          {isFav && <span style={{ fontSize: 11, color: "#f59e0b", fontWeight: 700 }}>★ Favourite</span>}
        </div>
        <button
          onClick={(e) => toggleFavorite(e, report.id)}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 4, flexShrink: 0 }}
        >
          <i className={`bi ${isFav ? "bi-star-fill" : "bi-star"}`} style={{ color: isFav ? "#f59e0b" : "#cbd5e1", fontSize: 16 }} />
        </button>
        <i className="bi bi-chevron-right" style={{ color: "#e2e8f0", fontSize: 13 }} />
      </div>
    );
  };

  const SectionBlock = ({ title, icon, color, reports }) => (
    <div style={{ background: "#fff", borderRadius: 16, padding: "20px 24px", marginBottom: 20, border: "1px solid #f1f5f9" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
        <div style={{ width: 4, height: 24, borderRadius: 2, background: color }} />
        <i className={`bi ${icon}`} style={{ color, fontSize: 18 }} />
        <span style={{ fontWeight: 800, fontSize: "1rem", color: "#1e293b" }}>{title}</span>
        <span style={{ marginLeft: "auto", background: color + "18", color, fontWeight: 700, fontSize: 12, padding: "2px 10px", borderRadius: 20 }}>{reports.length} Reports</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10 }}>
        {reports.length > 0
          ? reports.map(r => <ReportCard key={r.id} report={r} />)
          : <div style={{ textAlign: "center", padding: "24px", color: "#94a3b8", gridColumn: "1/-1" }}>No reports found.</div>
        }
      </div>
    </div>
  );

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh", padding: "28px 24px", fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
        borderRadius: 20, padding: "28px 32px", marginBottom: 28,
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16,
        boxShadow: "0 10px 40px rgba(15,23,42,0.25)"
      }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 }}>Business Intelligence</div>
          <h1 style={{ fontSize: "clamp(1.5rem, 4vw, 2rem)", fontWeight: 800, color: "#fff", margin: 0 }}>Advanced Reports</h1>
          <p style={{ color: "rgba(255,255,255,0.6)", margin: "6px 0 0", fontSize: 14 }}>Specialized analytics for operations & finance</p>
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.08)",
          borderRadius: 12, padding: "10px 16px", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.1)"
        }}>
          <i className="bi bi-search" style={{ color: "rgba(255,255,255,0.5)" }} />
          <input
            type="text" placeholder="Search reports..."
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            style={{ background: "none", border: "none", outline: "none", color: "#fff", width: 200, fontSize: 14 }}
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {[
          { key: "ALL", label: "All Reports", count: rawReports.length, color: "#6366f1" },
          { key: "ACCOUNTS", label: "Accounts", count: rawReports.filter(r => r.category === "ACCOUNTS").length, color: "#10b981" },
          { key: "PRODUCTION", label: "Production", count: rawReports.filter(r => r.category === "PRODUCTION").length, color: "#3b82f6" },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveCategory(tab.key)} style={{
            padding: "7px 18px", borderRadius: 20, border: "none", fontWeight: 600, fontSize: 14, cursor: "pointer",
            background: activeCategory === tab.key ? tab.color : "#fff",
            color: activeCategory === tab.key ? "#fff" : "#64748b",
            boxShadow: activeCategory === tab.key ? `0 4px 12px ${tab.color}40` : "0 1px 4px rgba(0,0,0,0.06)",
            transition: "all 0.2s"
          }}>
            {tab.label} <span style={{ opacity: 0.7, marginLeft: 4 }}>({tab.count})</span>
          </button>
        ))}
      </div>

      {(activeCategory === "ALL" || activeCategory === "PRODUCTION") && productionReports.length > 0 && (
        <SectionBlock title="Production & Operations" icon="bi-diagram-3-fill" color="#3b82f6" reports={productionReports} />
      )}
      {(activeCategory === "ALL" || activeCategory === "ACCOUNTS") && accountsReports.length > 0 && (
        <SectionBlock title="Accounts & Finance" icon="bi-cash-stack" color="#10b981" reports={accountsReports} />
      )}
      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#94a3b8" }}>
          <i className="bi bi-search" style={{ fontSize: 48, marginBottom: 16, display: "block" }} />
          <div style={{ fontSize: "1.1rem", fontWeight: 600 }}>No reports found for "{searchTerm}"</div>
        </div>
      )}
    </div>
  );
}
