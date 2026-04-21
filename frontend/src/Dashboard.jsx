import axios from "axios";
import React, { useState, useEffect } from "react";
import Loader from "./Loader";

const API = process.env.REACT_APP_API_URL;

/* ================= STAT COMPONENTS ================= */
const StatCard = ({ title, value, icon, gradient, delay }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), delay * 1000); }, [delay]);

  return (
    <div style={{
      background: gradient, borderRadius: 18, padding: "22px 24px",
      color: "#fff", boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
      opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(18px)",
      transition: "all 0.5s ease", cursor: "default"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 12, width: 42, height: 42, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <i className={`bi ${icon}`} style={{ fontSize: 20 }} />
        </div>
        <span style={{ background: "rgba(255,255,255,0.15)", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20, letterSpacing: "0.05em" }}>LIVE</span>
      </div>
      <div style={{ fontSize: "clamp(1.6rem, 4vw, 2.2rem)", fontWeight: 800, lineHeight: 1, marginBottom: 6 }}>{value}</div>
      <div style={{ fontSize: 13, opacity: 0.75, fontWeight: 500 }}>{title}</div>
    </div>
  );
};

const StepItem = ({ step, isLast }) => {
  const colors = { 'Completed': '#10b981', 'In Progress': '#3b82f6', 'Delayed': '#ef4444' };
  const bgs = { 'Completed': '#ecfdf5', 'In Progress': '#eff6ff', 'Delayed': '#fef2f2' };
  const c = colors[step.status] || '#94a3b8';
  const bg = bgs[step.status] || '#f1f5f9';

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 130, position: "relative", flexShrink: 0 }}>
      {!isLast && <div style={{ position: "absolute", left: "50%", top: 42, width: "100%", height: 2, background: step.status === "Completed" ? "#10b981" : "#e2e8f0" }} />}
      <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 10, textAlign: "center", color: step.status === "In Progress" ? "#3b82f6" : "#1e293b", zIndex: 2, textTransform: "uppercase", letterSpacing: "0.02em" }}>{step.name}</div>
      <div style={{ background: bg, border: `1px solid ${c}40`, borderRadius: 20, padding: "2px 12px", fontSize: 10, fontWeight: 800, color: c, zIndex: 2, marginBottom: 8, whiteSpace: "nowrap" }}>{step.status}</div>
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "4px 10px", fontSize: 13, fontWeight: 700, color: step.in_qty > 0 ? "#1e293b" : "#94a3b8", zIndex: 2, display: "flex", gap: 4, alignItems: "center" }}>
        <span>{step.in_qty || 0}</span>
        <span style={{ fontSize: 10, color: "#94a3b8" }}>{step.unit}</span>
      </div>
    </div>
  );
};

/* ================= DASHBOARD MAIN ================= */
function Dashboard() {
  const [stats, setStats] = useState({ totalOrders: 0, inProduction: 0, readyForDispatch: 0, delayedOrders: 0 });
  const [prodSummary, setProdSummary] = useState({ totalProduction: 0, wipQuantity: 0, productionDelayAlerts: 0 });
  const [pipeline, setPipeline] = useState([]);
  const [tasks, setTasks] = useState({ overdueTasks: 0, completedToday: 0, employeeStats: [] });
  const [deadlines, setDeadlines] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [s, p, pipe, t, d] = await Promise.all([
        axios.get(`${API}/dashboard/summary-stats`),
        axios.get(`${API}/dashboard/production-summary`),
        axios.get(`${API}/dashboard/order-pipeline`),
        axios.get(`${API}/dashboard/task-distribution`),
        axios.get(`${API}/dashboard/deadlines`)
      ]);
      setStats(s.data);
      setProdSummary(p.data);
      setPipeline(pipe.data);
      setTasks(t.data);
      setDeadlines(d.data);
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 300000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <Loader message="Loading dashboard..." />;

  const S = { fontFamily: "'Inter', system-ui, sans-serif", background: "#f8fafc", minHeight: "100vh", padding: "24px 20px" };

  return (
    <div style={S}>
      <div style={{ maxWidth: "100%", overflowX: "hidden", minWidth: 0 }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>Production Overview</div>
            <h1 style={{ fontSize: "clamp(1.4rem, 3.5vw, 1.9rem)", fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: "-0.04em" }}>Command Center</h1>
            <p style={{ color: "#64748b", fontSize: 13, margin: "4px 0 0", fontWeight: 500 }}>Live Production Ecosystem</p>
          </div>
          <button
            onClick={fetchData}
            style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 12, padding: "9px 18px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#475569", transition: "all 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#6366f1"; e.currentTarget.style.color = "#6366f1"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#475569"; }}
          >
            <i className="bi bi-arrow-clockwise" /> Refresh
          </button>
        </div>

        {/* Stat Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
          <StatCard title="Approved Orders" value={stats.totalOrders} icon="bi-receipt-cutoff" gradient="linear-gradient(135deg, #6366f1, #4f46e5)" delay={0.05} />
          <StatCard title="In Production" value={stats.inProduction} icon="bi-hammer" gradient="linear-gradient(135deg, #0891b2, #0e7490)" delay={0.1} />
          <StatCard title="Ready for Dispatch" value={stats.readyForDispatch} icon="bi-truck" gradient="linear-gradient(135deg, #10b981, #059669)" delay={0.15} />
          <StatCard title="Delayed Orders" value={stats.delayedOrders} icon="bi-exclamation-triangle" gradient="linear-gradient(135deg, #ef4444, #dc2626)" delay={0.2} />
        </div>

        {/* Production Volume + Priority Deliveries */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16, marginBottom: 24 }}>
          {/* Production Volume */}
          <div style={{ background: "#fff", borderRadius: 16, padding: "22px 24px", border: "1.5px solid #f1f5f9", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#94a3b8", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>Production Volume</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 800, color: "#0f172a" }}>{prodSummary.totalProduction.toLocaleString()}</div>
                <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>Total Packed (Pcs)</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#6366f1" }}>{prodSummary.wipQuantity.toLocaleString()}</div>
                <div style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", fontWeight: 700 }}>WIP Qty</div>
              </div>
            </div>
            <div style={{ background: "#f1f5f9", borderRadius: 100, height: 8, overflow: "hidden" }}>
              <div style={{
                width: `${(prodSummary.totalProduction / (prodSummary.totalProduction + prodSummary.wipQuantity + 1)) * 100}%`,
                height: "100%", background: "linear-gradient(90deg, #6366f1, #8b5cf6)", borderRadius: 100, transition: "width 1s ease"
              }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, paddingTop: 12, borderTop: "1px solid #f1f5f9" }}>
              <span style={{ fontSize: 12, color: "#94a3b8" }}>Efficiency Index</span>
              <span style={{ fontSize: 12, color: "#10b981", fontWeight: 700 }}>+12.5%</span>
            </div>
          </div>

          {/* Priority Deliveries */}
          <div style={{ background: "#fff", borderRadius: 16, padding: "22px 24px", border: "1.5px solid #f1f5f9", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#94a3b8", letterSpacing: "0.1em", textTransform: "uppercase" }}>Priority Deliveries</div>
              <span style={{ background: "#fef3c7", color: "#92400e", fontWeight: 700, fontSize: 11, padding: "3px 10px", borderRadius: 20 }}>Next 7 Days</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10, maxHeight: 200, overflowY: "auto" }}>
              {deadlines.length > 0 ? deadlines.slice(0, 6).map(d => (
                <div key={d.id} style={{
                  padding: "12px 14px", borderRadius: 12,
                  borderLeft: `4px solid ${d.deadline_status === "Delayed" ? "#ef4444" : "#6366f1"}`,
                  background: d.deadline_status === "Delayed" ? "#fef2f2" : "#eff6ff"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontWeight: 800, fontSize: 13, color: "#1e293b" }}>{d.order_no}</span>
                    <span style={{ fontSize: 11, color: "#94a3b8" }}>{new Date(d.factory_date).toLocaleDateString()}</span>
                  </div>
                  <div style={{ fontSize: 11, color: "#64748b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.order_name}</div>
                </div>
              )) : (
                <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "30px 20px", color: "#94a3b8", fontSize: 13 }}>
                  <i className="bi bi-calendar-check" style={{ fontSize: 28, marginBottom: 8, display: "block" }} />
                  No urgent deadlines
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pipeline */}
        <div style={{ background: "#fff", borderRadius: 16, border: "1.5px solid #f1f5f9", marginBottom: 24, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 24px", borderBottom: "1px solid #f8fafc" }}>
            <div style={{ display: "flex", alignItems: 'center', gap: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 0 3px #d1fae5" }} />
              <span style={{ fontWeight: 800, fontSize: "1rem", color: "#1e293b" }}>Production Pipeline</span>
              <span style={{ background: "#f1f5f9", color: "#64748b", fontWeight: 700, fontSize: 11, padding: "2px 10px", borderRadius: 20 }}>Active & Upcoming</span>
            </div>
          </div>
          <div style={{ overflowX: "auto" }}>
            {pipeline.length > 0 ? (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    <th style={{ padding: "12px 24px", textAlign: "left", fontSize: 11, fontWeight: 800, color: "#94a3b8", letterSpacing: "0.1em", textTransform: "uppercase" }}>ORDER PROFILE</th>
                    <th style={{ padding: "12px 24px", textAlign: "left", fontSize: 11, fontWeight: 800, color: "#94a3b8", letterSpacing: "0.1em", textTransform: "uppercase" }}>PROCESS PROGRESSION</th>
                  </tr>
                </thead>
                <tbody>
                  {pipeline.slice(0, 8).map(order => (
                    <tr key={order.order_no} style={{ borderTop: "1px solid #f8fafc" }}>
                      <td style={{ padding: "20px 24px", minWidth: 240 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                          <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg, #6366f1, #3b82f6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 16, flexShrink: 0 }}>
                            {order.order_no}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#1e293b" }}>{order.style_name}</div>
                            <div style={{ fontSize: 12, color: "#94a3b8" }}>ID: {order.order_no} • {order.percentage}% Done</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "20px 24px" }}>
                        <div style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 8 }}>
                          {order.steps?.map((step, idx) => (
                            <StepItem key={idx} step={step} isLast={idx === order.steps.length - 1} />
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ textAlign: "center", padding: "48px 20px", color: "#94a3b8" }}>
                <i className="bi bi-diagram-3" style={{ fontSize: 40, marginBottom: 12, display: "block" }} />
                No active production streams.
              </div>
            )}
          </div>
        </div>

        {/* TNA & Employee */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
          {/* TNA Performance */}
          <div style={{ background: "#fff", borderRadius: 16, padding: "22px 24px", border: "1.5px solid #f1f5f9", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#94a3b8", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>TNA Performance</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ background: "#fef2f2", borderRadius: 12, padding: "16px 14px", textAlign: "center" }}>
                <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#ef4444" }}>{tasks.overdueTasks}</div>
                <div style={{ fontSize: 11, color: "#ef4444", fontWeight: 700 }}>Overdue</div>
              </div>
              <div style={{ background: "#f0fdf4", borderRadius: 12, padding: "16px 14px", textAlign: "center" }}>
                <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#10b981" }}>{tasks.completedToday}</div>
                <div style={{ fontSize: 11, color: "#10b981", fontWeight: 700 }}>Closed Today</div>
              </div>
            </div>
          </div>

          {/* Team Capacity */}
          <div style={{ background: "#fff", borderRadius: 16, padding: "22px 24px", border: "1.5px solid #f1f5f9", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#94a3b8", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>Team Capacity Load</div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["Member", "Done", "Pending", "Delayed", "Load"].map(h => (
                      <th key={h} style={{ padding: "6px 8px", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", textAlign: h === "Load" ? "left" : "center" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tasks.employeeStats.map((emp, i) => {
                    const totalPending = emp.pending + emp.delayed;
                    const load = Math.min((totalPending / 10) * 100, 100);
                    return (
                      <tr key={i} style={{ borderTop: "1px solid #f8fafc" }}>
                        <td style={{ padding: "10px 8px", fontWeight: 700, fontSize: 13, color: "#1e293b" }}>{emp.name}</td>
                        <td style={{ textAlign: "center" }}><span style={{ background: "#f0fdf4", color: "#10b981", fontWeight: 700, fontSize: 12, padding: "2px 8px", borderRadius: 12 }}>{emp.completed}</span></td>
                        <td style={{ textAlign: "center" }}><span style={{ background: "#eff6ff", color: "#6366f1", fontWeight: 700, fontSize: 12, padding: "2px 8px", borderRadius: 12 }}>{emp.pending}</span></td>
                        <td style={{ textAlign: "center" }}><span style={{ background: "#fef2f2", color: "#ef4444", fontWeight: 700, fontSize: 12, padding: "2px 8px", borderRadius: 12 }}>{emp.delayed}</span></td>
                        <td style={{ paddingLeft: 16 }}>
                          <div style={{ background: "#f1f5f9", borderRadius: 100, height: 6, width: 100, overflow: "hidden" }}>
                            <div style={{ width: `${load}%`, height: "100%", background: totalPending > 5 ? "#ef4444" : "#6366f1", borderRadius: 100 }} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {tasks.employeeStats.length === 0 && (
                    <tr><td colSpan={5} style={{ textAlign: "center", padding: "24px", color: "#94a3b8", fontSize: 13 }}>No team data available.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
