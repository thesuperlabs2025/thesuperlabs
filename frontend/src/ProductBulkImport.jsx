import React, { useState } from "react";
import * as XLSX from "xlsx";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = process.env.REACT_APP_API_URL;

export default function ProductBulkImport() {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [importData, setImportData] = useState([]);
    const [duplicates, setDuplicates] = useState([]); // Will store {sku, rows[]}
    const [dbErrors, setDbErrors] = useState([]);
    const navigate = useNavigate();

    const productHeaders = [
        "sku", "product_name", "category", "sub_category", "super_sub_category",
        "hsn_code", "gst", "discount", "barcode", "size", "color", "brand_name",
        "current_stock", "minimum_stock", "selling_price", "purchase_price", "mrp",
        "description"
    ];

    const downloadTemplate = () => {
        const ws = XLSX.utils.aoa_to_sheet([productHeaders]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Products");
        XLSX.writeFile(wb, "Product_Import_Template.xlsx");
    };

    const handleFileChange = async (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        setFile(selectedFile);
        setDuplicates([]);
        setDbErrors([]);
        setImportData([]);
        setLoading(true);

        try {
            // Fetch existing SKUs from DB for comparison
            const res = await axios.get(`${API}/products/skus`).catch(err => {
                console.error("Database connection error:", err);
                return { data: [] };
            });
            const existingSkus = (res.data || []).map(s => s?.toString().trim().toLowerCase());

            const reader = new FileReader();

            reader.onerror = (evt) => {
                console.error("FileReader error:", evt.target.error);
                alert("The software could not open this file. Please make sure the file is not open in Excel and try again.");
                setLoading(false);
            };

            reader.onload = (evt) => {
                try {
                    const bstr = evt.target.result;
                    const wb = XLSX.read(bstr, { type: "binary" });
                    const wsname = wb.SheetNames[0];
                    const ws = wb.Sheets[wsname];
                    const rawData = XLSX.utils.sheet_to_json(ws);

                    if (rawData.length === 0) {
                        alert("This Excel file looks empty. Please add some products and try again.");
                        setFile(null);
                        setLoading(false);
                        return;
                    }

                    // Standardize data: Ensure 'sku' and 'product_name' exists
                    const data = rawData.map(item => {
                        const normalized = { ...item };
                        if (!normalized.sku) {
                            normalized.sku = item.SKU || item.Sku || item["Item Code"] || "";
                        }
                        if (!normalized.product_name) {
                            normalized.product_name = item.Name || item.NAME || item["Product Name"] || "";
                        }
                        return normalized;
                    });

                    const canonical = (val) => val ? val.toString().trim().toLowerCase() : "";

                    // Group by SKU to find row numbers
                    const skuToRows = {};
                    data.forEach((item, index) => {
                        const s = canonical(item.sku);
                        if (s) {
                            if (!skuToRows[s]) skuToRows[s] = [];
                            skuToRows[s].push(index + 2); // Excel row number (1-based + 1 for header)
                        }
                    });

                    // Find Excel duplicates (by SKU)
                    const excelDups = Object.keys(skuToRows)
                        .filter(sku => skuToRows[sku].length > 1)
                        .map(sku => ({
                            sku: data[skuToRows[sku][0] - 2].sku, // Get original case
                            rows: skuToRows[sku]
                        }));

                    // Find DB duplicates (by SKU)
                    const dbDups = data
                        .filter(item => {
                            const s = canonical(item.sku);
                            return s && existingSkus.includes(s);
                        })
                        .map(item => item.sku.toString().trim());

                    setDuplicates(excelDups);
                    setDbErrors([...new Set(dbDups)]);
                    setImportData(data);
                    setLoading(false);
                } catch (readErr) {
                    console.error("Excel processing error:", readErr);
                    alert("We found a problem with the format of this Excel file. Please use our template for the best results.");
                    setLoading(false);
                }
            };
            reader.readAsBinaryString(selectedFile);
        } catch (err) {
            console.error("System error:", err);
            alert("The software ran into a system error. Please refresh the page and try again.");
            setLoading(false);
        }
    };

    const handleImport = async () => {
        if (!importData.length) return;
        if (duplicates.length > 0) {
            alert("Please fix the repeated SKUs in your file first.");
            return;
        }

        setLoading(true);
        try {
            let successCount = 0;
            for (const row of importData) {
                const sku = canonicalSku(row.sku);
                // Check if SKU already in system to avoid errors during import
                const isAlreadyInDb = dbErrors.some(e => canonicalSku(e) === sku);
                if (!isAlreadyInDb) {
                    await axios.post(`${API}/products`, row);
                    successCount++;
                }
            }
            alert(`Successfully added ${successCount} products!`);
            navigate("/productmy");
        } catch (err) {
            console.error("Import error:", err);
            alert("We ran into a problem while saving. Please check your data.");
        } finally {
            setLoading(false);
        }
    };

    const canonicalSku = (val) => val ? val.toString().trim().toLowerCase() : "";

    return (
        <div className="container-fluid my-4 px-4 px-md-5" style={{ fontFamily: "'Segoe UI', sans-serif" }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="fw-bold text-dark mb-0">Product Bulk Import</h3>
                    <p className="text-muted small mb-0">Add many products at once using an Excel file (Validated by SKU)</p>
                </div>
                <button className="btn btn-dark fw-bold px-4 shadow-sm" onClick={downloadTemplate}>
                    <i className="bi bi-download me-2"></i> DOWNLOAD TEMPLATE
                </button>
            </div>

            <div className="card border-0 shadow-sm p-5 rounded-4 bg-light text-center">
                <div className="mb-4">
                    <i className={`bi ${duplicates.length > 0 ? 'bi-file-earmark-x text-danger' : 'bi-file-earmark-excel text-success'}`} style={{ fontSize: '4rem' }}></i>
                </div>

                <h5 className="fw-bold mb-3">
                    {duplicates.length > 0 ? "Wait! We found some repeated SKUs" : "Select your Excel file"}
                </h5>

                <div className="d-flex justify-content-center mb-4">
                    <div className="input-group" style={{ maxWidth: '500px' }}>
                        <input
                            type="file"
                            className={`form-control ${duplicates.length > 0 ? 'is-invalid' : ''}`}
                            accept=".xlsx, .xls"
                            onChange={handleFileChange}
                        />
                    </div>
                </div>

                {file && (
                    <div className="mt-2">
                        {loading ? (
                            <div className="p-4">
                                <div className="spinner-border text-primary mb-2" role="status"></div>
                                <p className="text-muted fw-bold">Reading your file, please wait...</p>
                            </div>
                        ) : importData.length > 0 ? (
                            <div className="mt-3">
                                {duplicates.length > 0 ? (
                                    <div className="alert alert-danger border-0 rounded-4 p-4 shadow-sm text-start mx-auto" style={{ maxWidth: '600px' }}>
                                        <h6 className="fw-bold"><i className="bi bi-exclamation-triangle-fill me-2"></i>Double SKU Entry Found</h6>
                                        <p className="small mb-2 text-dark">You have written the same SKU more than once in your file. <strong>Please fix these rows and upload again:</strong></p>
                                        <div className="bg-white bg-opacity-50 p-3 rounded-3 mt-2">
                                            {duplicates.map((d, i) => (
                                                <div key={i} className="text-danger small fw-bold mb-1">
                                                    • SKU "{d.sku}" is repeated on Row Numbers: {d.rows.join(", ")}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mx-auto" style={{ maxWidth: '600px' }}>
                                        <div className="alert alert-success border-0 rounded-4 p-4 shadow-sm mb-4">
                                            <h6 className="fw-bold mb-1"><i className="bi bi-check-circle-fill me-2"></i>Everything looks good!</h6>
                                            <p className="mb-0 small">We found <strong>{importData.length} products</strong> in your file. They are ready to be added.</p>
                                            {dbErrors.length > 0 && (
                                                <p className="mt-2 text-dark small opacity-75 mb-0">
                                                    Note: {dbErrors.length} SKUs already exist in your system and will be skipped.
                                                </p>
                                            )}
                                        </div>

                                        <button
                                            className="btn btn-primary px-5 py-3 fw-bold shadow-lg w-100"
                                            onClick={handleImport}
                                            disabled={loading}
                                            style={{ borderRadius: '15px' }}
                                        >
                                            {loading ? "SAVING..." : "YES, ADD THESE NOW"}
                                        </button>
                                        <div className="mt-3">
                                            <button className="btn btn-link text-muted btn-sm" onClick={() => { setFile(null); setImportData([]); setDuplicates([]); setDbErrors([]); }}>
                                                <i className="bi bi-arrow-repeat me-1"></i> Start Over
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : null}
                    </div>
                )}
            </div>

            {importData.length > 0 && (
                <div className="mt-5 text-start">
                    <h5 className="fw-bold text-dark mb-3">Check your data below:</h5>
                    <div className="table-responsive shadow-sm rounded-4 border overflow-hidden">
                        <table className="table table-hover align-middle mb-0 bg-white">
                            <thead className="table-dark">
                                <tr>
                                    <th className="px-4 py-3">No.</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">SKU</th>
                                    <th className="px-4 py-3">Product Name</th>
                                    <th className="px-4 py-3">Price (MRP)</th>
                                    <th className="px-4 py-3">Stock</th>
                                </tr>
                            </thead>
                            <tbody>
                                {importData.map((row, index) => {
                                    const rawSku = row.sku?.toString().trim() || "";
                                    const skuLower = rawSku.toLowerCase();
                                    const isExcelDup = duplicates.some(d => d.sku.toLowerCase() === skuLower);
                                    const isDbDup = dbErrors.some(e => e.toLowerCase() === skuLower);

                                    return (
                                        <tr key={index} className={isExcelDup ? "table-danger" : ""}>
                                            <td className="px-4 py-3 text-muted">{index + 1}</td>
                                            <td className="px-4 py-3">
                                                {isExcelDup ? (
                                                    <span className="badge bg-danger">REPEATED SKU</span>
                                                ) : isDbDup ? (
                                                    <span className="badge bg-warning text-dark">ALREADY EXISTS</span>
                                                ) : (
                                                    <span className="badge bg-success">READY</span>
                                                )}
                                            </td>
                                            <td className={`px-4 py-3 fw-bold ${isExcelDup ? "text-danger" : isDbDup ? "text-warning" : "text-dark"}`}>
                                                {rawSku || "No SKU Found"}
                                            </td>
                                            <td className="px-4 py-3 text-secondary">{row.product_name || "-"}</td>
                                            <td className="px-4 py-3 text-secondary">{row.mrp || "0"}</td>
                                            <td className="px-4 py-3 text-secondary">{row.current_stock || "0"}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <div className="mt-5 pb-5">
                <hr />
                <h6 className="fw-bold text-secondary mb-3 small">TIPS:</h6>
                <ul className="small text-muted mb-0">
                    <li>Download our template to see how to list your products.</li>
                    <li>If an SKU is already in your system, we will automatically ignore it.</li>
                    <li>Make sure every row has an SKU and Product Name before you upload.</li>
                </ul>
            </div>
        </div>
    );
}
