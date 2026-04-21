import React, { useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const InvoiceDownload = () => {
  const [downloading, setDownloading] = useState(false);
  const [message, setMessage] = useState("");

  const downloadPDF = async () => {
    setDownloading(true);
    setMessage("");

    try {
      const API = process.env.REACT_APP_API_URL;
      const id = 1; // ✅ You can replace this with a dynamic invoice ID if needed
      // ✅ Fetch PDF from backend
      const response = await axios.get(
        `${API}/invoicedownload/invoice-pdf/${id}`,
        { responseType: "blob" }
      );

      // ✅ Trigger file download
      const fileURL = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = fileURL;
      link.setAttribute("download", `invoice_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      setMessage("✅ Invoice downloaded successfully!");
    } catch (error) {
      console.error("❌ Download failed:", error);
      setMessage("❌ Failed to download invoice. Please check backend logs.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="container mt-5 p-4 bg-light rounded shadow-sm">
      {/* Header */}
      <div className="text-center mb-4">
        <h3 className="fw-bold text-primary">Invoice PDF Download</h3>
        <p className="text-muted mb-0">
          Click below to download your invoice as a professional PDF.
        </p>
      </div>

      {/* Card */}
      <div className="card border-0 shadow-sm">
        <div className="card-body text-center">
          <h5 className="card-title mb-3">Invoice #1</h5>
          <p className="card-text text-secondary">
            This will generate a professionally formatted invoice from the
            <span className="fw-semibold text-dark"> TEST ERP </span> system.
          </p>

          <button
            className="btn btn-primary px-4 py-2"
            onClick={downloadPDF}
            disabled={downloading}
          >
            {downloading ? "⏳ Downloading..." : "📄 Download Invoice PDF"}
          </button>

          {message && (
            <div
              className={`alert mt-3 ${message.includes("✅")
                ? "alert-success"
                : "alert-danger"
                }`}
              role="alert"
            >
              {message}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-4">
        <small className="text-muted">
          © 2025 TEST ERP — All Rights Reserved.
        </small>
      </div>
    </div>
  );
};

export default InvoiceDownload;
