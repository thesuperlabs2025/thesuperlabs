import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const API = process.env.REACT_APP_API_URL;

export default function OutstandingReport() {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOutstanding();
  }, []);

  const fetchOutstanding = async (customerName = "") => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/outstanding`, {
        params: { customer_name: customerName }
      });
      setData(res.data);
    } catch (err) {
      console.error("Error fetching outstanding:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchOutstanding(filter);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const exportExcel = () => {
    const headers = ["Customer Name", "Receivable Outstanding (₹)", "Payable Outstanding (₹)"];
    const rows = data.map(item => [
      item.customer_name,
      Number(item.receivable_outstanding || 0).toFixed(2),
      Number(item.payable_outstanding || 0).toFixed(2)
    ]);

    // ✅ ADD GRAND TOTAL TO EXCEL
    rows.push([
      "GRAND TOTAL",
      totalReceivable.toFixed(2),
      totalPayable.toFixed(2)
    ]);

    let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "OutstandingReport.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printReport = () => {
    window.print();
  };

  const totalReceivable = data.reduce((acc, curr) => acc + Number(curr.receivable_outstanding || 0), 0);
  const totalPayable = data.reduce((acc, curr) => acc + Number(curr.payable_outstanding || 0), 0);

  return (
    <div className="outstanding-report-container container-fluid my-4">
      <style>{`
                .outstanding-report-container {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
                }
                .filter-card {
                    background-color: #f8f9fa;
                    border: 1px solid #dee2e6;
                    border-radius: 12px;
                }
                .table-dark th {
                    background-color: #000 !important;
                    color: #fff !important;
                    border-color: #32383e !important;
                    letter-spacing: 0.5px;
                    font-size: 0.8rem;
                }
                @media print {
                    @page {
                        size: landscape;
                        margin: 10mm;
                    }
                    .no-print {
                        display: none !important;
                    }
                    body {
                        background: white !important;
                        padding: 0 !important;
                        margin: 0 !important;
                    }
                    .outstanding-report-container {
                        width: 100% !important;
                        max-width: 100% !important;
                        padding: 0 !important;
                        margin: 0 !important;
                    }
                    table {
                        width: 100% !important;
                        border-collapse: collapse !important;
                        -webkit-print-color-adjust: exact !important;
                        border: 1px solid #000 !important;
                    }
                    .table-dark th {
                        background-color: #000 !important;
                        color: #fff !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        border: 1px solid #000 !important;
                        padding: 10px !important;
                    }
                    td {
                        border: 1px solid #000 !important;
                        padding: 8px !important;
                        font-size: 11pt !important;
                    }
                    .text-end {
                        text-align: right !important;
                    }
                    .text-start {
                        text-align: left !important;
                    }
                }
            `}</style>

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold text-dark">Outstanding Report</h3>
        <div className="no-print">
          <button className="btn btn-outline-success me-2 px-3 shadow-sm" onClick={exportExcel}>
            <i className="bi bi-file-earmark-excel"></i> Export Excel
          </button>
          <button className="btn btn-outline-danger px-3 shadow-sm" onClick={printReport}>
            <i className="bi bi-file-earmark-pdf"></i> Print / PDF
          </button>
        </div>
      </div>

      {/* Clean Filter Bar */}
      <div className="no-print mb-4 d-flex align-items-center justify-content-start">
        <div className="d-flex align-items-center bg-white border border-secondary-subtle px-3 py-1" style={{ borderRadius: '50px', width: '400px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <i className="bi bi-search text-muted me-2"></i>
          <input
            type="text"
            className="form-control border-0 bg-transparent text-secondary shadow-none"
            style={{ fontSize: '0.9rem' }}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Search customer name..."
          />
          <button
            className="btn btn-primary btn-sm px-4 fw-bold ms-2"
            onClick={handleSearch}
            disabled={loading}
            style={{ borderRadius: '50px' }}
          >
            {loading ? "..." : "SEARCH"}
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="table-responsive shadow-sm rounded">
        <table className="table table-bordered table-hover text-center align-middle mb-0">
          <thead className="table-dark">
            <tr>
              <th className="text-start">Customer Name</th>
              <th className="text-end px-4">Receivable Outstanding</th>
              <th className="text-end px-4">Payable Outstanding</th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? data.map((row, index) => (
              <tr key={index}>
                <td className="text-start px-4 fw-bold">{row.customer_name || "Unknown"}</td>
                <td className="text-end px-4 text-success fw-bold">₹ {Number(row.receivable_outstanding || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                <td className="text-end px-4 text-danger fw-bold">₹ {Number(row.payable_outstanding || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan="3" className="py-5 text-muted">
                  {loading ? "Loading data..." : "No outstanding records found."}
                </td>
              </tr>
            )}
          </tbody>
          <tfoot className="table-light fw-bold border-top border-2">
            <tr>
              <td className="text-end px-3 py-2">GRAND TOTAL</td>
              <td className="text-end px-4 py-2 text-success">₹ {totalReceivable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
              <td className="text-end px-4 py-2 text-danger">₹ {totalPayable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
