import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const API = process.env.REACT_APP_API_URL;

export default function CreditNoteSummary() {
    const [data, setData] = useState([]);
    const [partySuggestions, setPartySuggestions] = useState([]);
    const [companyProfile, setCompanyProfile] = useState(null);
    const [filters, setFilters] = useState({ customer_name: "", sku: "", from_date: "", to_date: "" });

    useEffect(() => {
        handleSearch(); fetchCompanyProfile(); // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const fetchCompanyProfile = async () => { try { const res = await axios.get(`${API}/company-profile`); setCompanyProfile(res.data); } catch (err) { console.error(err); } };
    const handleSearch = async (f = filters) => { try { const res = await axios.get(`${API}/reports/creditnote/summary`, { params: f }); setData(res.data); } catch (err) { console.error(err); } };
    const handlePartyInput = async (e) => {
        const value = e.target.value; setFilters({ ...filters, customer_name: value });
        if (value.length > 0) { try { const res = await axios.get(`${API}/customers?term=${value}`); setPartySuggestions(res.data); } catch (err) { console.error(err); } } else { setPartySuggestions([]); }
    };
    const formatDate = (date) => date ? new Date(date).toLocaleDateString("en-GB") : "-";
    const printReport = () => window.print();

    return (
        <div className="container-fluid my-4">
            <style>{` .print-header, .report-title-print { display: none; } @media print { .no-print { display: none !important; } .print-header { display: flex !important; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 10px; } .report-title-print { display: flex !important; justify-content: space-between; font-weight: bold; margin: 10px 0; border-bottom: 1px solid #ddd; } th { background-color: #000 !important; color: #fff !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } } `}</style>
            {companyProfile && (
                <div className="print-header">
                    <div className="text-start"><h2>{companyProfile.company_name}</h2><p>GST NO: {companyProfile.gst_no}<br />{companyProfile.address}<br />{companyProfile.email}</p></div>
                    {companyProfile.logo && <img src={`${API}/uploads/${companyProfile.logo}`} alt="Logo" style={{ width: '80px' }} />}
                </div>
            )}
            <div className="report-title-print"><span>Credit Note Summary Report</span><span>Period: {formatDate(filters.from_date)} To {formatDate(filters.to_date)}</span></div>
            <div className="d-flex justify-content-between align-items-center mb-4 no-print"><h2 className="fw-bold">Credit Note Summary Report</h2><button className="btn btn-outline-danger" onClick={printReport}>Print PDF</button></div>
            <div className="card p-3 mb-4 no-print shadow-sm">
                <div className="row g-2">
                    <div className="col-md-3 position-relative">
                        <input type="text" className="form-control" placeholder="Customer Name" value={filters.customer_name} onChange={handlePartyInput} />
                        {partySuggestions.length > 0 && (
                            <div className="list-group position-absolute w-100 shadow" style={{ zIndex: 1000 }}>
                                {partySuggestions.map((s, i) => (<button key={i} className="list-group-item list-group-item-action" onClick={() => { setFilters({ ...filters, customer_name: s.name }); setPartySuggestions([]); }}>{s.name}</button>))}
                            </div>
                        )}
                    </div>
                    <div className="col-md-2"><input type="text" className="form-control" placeholder="SKU" value={filters.sku} onChange={(e) => setFilters({ ...filters, sku: e.target.value })} /></div>
                    <div className="col-md-2"><input type="date" className="form-control" value={filters.from_date} onChange={(e) => setFilters({ ...filters, from_date: e.target.value })} /></div>
                    <div className="col-md-2"><input type="date" className="form-control" value={filters.to_date} onChange={(e) => setFilters({ ...filters, to_date: e.target.value })} /></div>
                    <div className="col-md-2"><button className="btn btn-primary w-100" onClick={() => handleSearch()}>Filter</button></div>
                </div>
            </div>
            <div className="table-responsive">
                <table className="table table-bordered table-hover shadow-sm">
                    <thead className="table-dark"><tr><th>ID</th><th>Date</th><th>Customer</th><th>SKU</th><th>Qty</th><th>Rate</th><th>GST%</th><th>Total</th></tr></thead>
                    <tbody>{data.map((item, i) => (<tr key={i}><td>{item.tx_id}</td><td>{formatDate(item.tx_date)}</td><td>{item.customer_name}</td><td>{item.sku}</td><td>{item.qty}</td><td>{item.rate}</td><td>{item.gst_percent}%</td><td className="fw-bold">{parseFloat(item.item_total).toFixed(2)}</td></tr>))}</tbody>
                </table>
            </div>
        </div>
    );
}
