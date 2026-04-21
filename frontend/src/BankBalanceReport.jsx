
import React, { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import "bootstrap/dist/css/bootstrap.min.css";
import { toast } from "react-toastify";

const API = process.env.REACT_APP_API_URL;

const BankBalanceReport = () => {
    const [banks, setBanks] = useState([]);
    const [selectedBank, setSelectedBank] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchBanks();
    }, []);

    const fetchBanks = async () => {
        try {
            const res = await axios.get(`${API}/bankaccount`);
            setBanks(res.data);
        } catch (error) {
            console.error("Error fetching banks:", error);
            toast.error("Failed to load bank accounts");
        }
    };

    const fetchReport = async () => {
        if (!selectedBank) {
            toast.warning("Please select a bank");
            return;
        }

        setLoading(true);
        try {
            const res = await axios.get(`${API}/reports/bank-ledger`, {
                params: {
                    bankName: selectedBank,
                    fromDate,
                    toDate
                }
            });
            setReportData(res.data);
            if (res.data.transactions.length === 0) {
                toast.info("No transactions found for the selected period.");
            }
        } catch (error) {
            console.error("Error fetching report:", error);
            toast.error("Failed to generate report");
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleExcel = () => {
        if (!reportData) return;

        const wb = XLSX.utils.book_new();
        const wsData = [
            ["Bank Balance Report"],
            [`Bank: ${reportData.bankName}`],
            [`Period: ${fromDate || "Start"} to ${toDate || "End"}`],
            [],
            ["Date", "Type", "Ref No", "Description", "Withdrawal (Debit)", "Deposit (Credit)", "Balance"]
        ];

        reportData.transactions.forEach(t => {
            wsData.push([
                new Date(t.date).toLocaleDateString("en-GB"), // DD-MM-YYYY
                t.type,
                t.refNo,
                t.description,
                Number(t.debit) ? Number(t.debit).toFixed(2) : "",
                Number(t.credit) ? Number(t.credit).toFixed(2) : "",
                Number(t.balance).toFixed(2)
            ]);
        });

        // Closing Balance Row
        wsData.push(["", "Closing Balance", "", "", "", "", Number(reportData.closingBalance).toFixed(2)]);

        const ws = XLSX.utils.aoa_to_sheet(wsData);

        // Adjust column widths
        const wscols = [
            { wch: 12 }, // Date
            { wch: 10 }, // Type
            { wch: 15 }, // Ref No
            { wch: 40 }, // Description
            { wch: 15 }, // Debit
            { wch: 15 }, // Credit
            { wch: 15 }, // Balance
        ];
        ws['!cols'] = wscols;

        XLSX.utils.book_append_sheet(wb, ws, "Bank Ledger");
        XLSX.writeFile(wb, `Bank_Statement_${selectedBank}_${fromDate}_to_${toDate}.xlsx`);
    };

    return (
        <div className="container-fluid my-4">
            {/* Controls Section - Hidden on Print */}
            <div className="card shadow mb-4 no-print">
                <div className="card-header bg-white py-3">
                    <h5 className="mb-0 text-primary fw-bold">Bank Balance Report</h5>
                </div>
                <div className="card-body">
                    <div className="row g-3 align-items-end">
                        <div className="col-md-3">
                            <label className="form-label">Select Bank</label>
                            <select
                                className="form-select"
                                value={selectedBank}
                                onChange={(e) => setSelectedBank(e.target.value)}
                            >
                                <option value="">-- Select Bank --</option>
                                {banks.map((b, i) => (
                                    <option key={i} value={b.bankaccount}>
                                        {b.bankaccount}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-3">
                            <label className="form-label">From Date</label>
                            <input
                                type="date"
                                className="form-control"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                            />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label">To Date</label>
                            <input
                                type="date"
                                className="form-control"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                            />
                        </div>
                        <div className="col-md-3 d-flex gap-2">
                            <button
                                className="btn btn-primary flex-grow-1"
                                onClick={fetchReport}
                                disabled={loading || !selectedBank}
                            >
                                {loading ? "Loading..." : "Generate"}
                            </button>
                            {reportData && (
                                <>
                                    <button
                                        className="btn btn-outline-danger"
                                        onClick={handlePrint}
                                        title="Print / Save PDF"
                                    >
                                        <i className="bi bi-printer"></i> Print
                                    </button>
                                    <button
                                        className="btn btn-success"
                                        onClick={handleExcel}
                                        title="Export Excel"
                                    >
                                        <i className="bi bi-file-earmark-excel"></i> Excel
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Report Section - Visible on Print */}
            {reportData && (
                <div className="card shadow border-0 print-area">
                    <div className="card-body p-4">
                        {/* Report Header */}
                        <div className="text-center mb-4">
                            <h3 className="fw-bold text-uppercase mb-1">Bank Statement</h3>
                            <h5 className="text-primary mb-2">{reportData.bankName}</h5>
                            <p className="text-muted mb-0">
                                Period: <strong>{fromDate ? new Date(fromDate).toLocaleDateString() : "Beginning"}</strong> to <strong>{toDate ? new Date(toDate).toLocaleDateString() : "Present"}</strong>
                            </p>
                        </div>

                        {/* Responsive Table Wrapper */}
                        <div className="table-responsive">
                            <table className="table table-striped table-bordered table-hover align-middle">
                                <thead className="table-dark text-center">
                                    <tr>
                                        <th style={{ width: "10%" }}>Date</th>
                                        <th style={{ width: "10%" }}>Type</th>
                                        <th style={{ width: "15%" }}>Ref No</th>
                                        <th style={{ width: "35%" }}>Description</th>
                                        <th style={{ width: "10%" }} className="text-end">Withdrawal</th>
                                        <th style={{ width: "10%" }} className="text-end">Deposit</th>
                                        <th style={{ width: "10%" }} className="text-end">Balance</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* Opening Balance Row */}


                                    {/* Transactions */}
                                    {reportData.transactions.map((t, idx) => (
                                        <tr key={idx}>
                                            <td className="text-center">{new Date(t.date).toLocaleDateString("en-GB")}</td>
                                            <td className="text-center">
                                                <span className={`badge ${t.type === 'Receipt' ? 'bg-success' : 'bg-warning text-dark'}`}>
                                                    {t.type}
                                                </span>
                                            </td>
                                            <td>{t.refNo}</td>
                                            <td>{t.description}</td>
                                            <td className="text-end text-danger">
                                                {Number(t.debit) > 0 ? Number(t.debit).toFixed(2) : "-"}
                                            </td>
                                            <td className="text-end text-success">
                                                {Number(t.credit) > 0 ? Number(t.credit).toFixed(2) : "-"}
                                            </td>
                                            <td className="text-end fw-bold">{Number(t.balance).toFixed(2)}</td>
                                        </tr>
                                    ))}

                                    {/* Closing Balance Row */}
                                    <tr className="table-dark fw-bold">
                                        <td colSpan="6" className="text-end">Closing Balance</td>
                                        <td className="text-end fs-5">{Number(reportData.closingBalance).toFixed(2)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-4 text-center text-muted small no-print">
                            <p>End of Report. Generated on {new Date().toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Print Styles */}
            <style>
                {`
                    @media print {
                        .no-print { display: none !important; }
                        .print-area { box-shadow: none !important; border: none !important; }
                        .App, .main-content { margin: 0; padding: 0; }
                        body { background: white; -webkit-print-color-adjust: exact; }
                        aside, nav, header { display: none !important; }
                    }
                `}
            </style>
        </div>
    );
};

export default BankBalanceReport;
