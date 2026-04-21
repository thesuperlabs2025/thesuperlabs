import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';

const API = process.env.REACT_APP_API_URL;

export default function ProductBulkCreator() {
    const navigate = useNavigate();

    // Masters State
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [superSubCategories, setSuperSubCategories] = useState([]);
    const [colors, setColors] = useState([]);
    const [sizeCharts, setSizeCharts] = useState([]);
    const [uoms, setUoms] = useState([]);
    const [brands, setBrands] = useState([]);

    // Input State
    const [commonData, setCommonData] = useState({
        product_name: '',
        category: '',
        sub_category: '',
        super_sub_category: '',
        hsn_code: '',
        gst: '',
        uom: '',
        boxes: '',
        size_chart_id: '',
        brandname: '' // Added brandname
    });

    const [selectedColors, setSelectedColors] = useState([]); // Array of color objects {id, color}

    // Generated Table State
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [colorSearch, setColorSearch] = useState('');
    const [showColorDropdown, setShowColorDropdown] = useState(false);

    // ✅ Detect duplicate SKUs in the rows
    const getDuplicateSkus = () => {
        const skuCounts = {};
        rows.forEach(row => {
            if (row.sku) {
                skuCounts[row.sku] = (skuCounts[row.sku] || 0) + 1;
            }
        });
        return Object.keys(skuCounts).filter(sku => skuCounts[sku] > 1);
    };

    const duplicateSkus = getDuplicateSkus();

    useEffect(() => {
        fetchMasters();
    }, []);

    // Regenerate rows whenever key inputs change
    // Regenerate rows whenever key inputs change
    useEffect(() => {
        const generateRows = () => {
            if (!commonData.size_chart_id) {
                setRows([]);
                return;
            }

            const selectedChart = sizeCharts.find(sc => sc.id === parseInt(commonData.size_chart_id));
            if (!selectedChart || !selectedChart.size_values) {
                setRows([]);
                return;
            }

            const sizeValues = selectedChart.size_values.split(', ').map(s => s.trim());
            const newRows = [];

            const colorsToUse = selectedColors.length > 0 ? selectedColors : [{ id: null, color: '' }];

            colorsToUse.forEach(colorObj => {
                sizeValues.forEach(sizeVal => {
                    // Variant string for SKU
                    const variantSku = commonData.product_name ?
                        `${commonData.product_name}${colorObj.color ? ' - ' + colorObj.color : ''} - ${sizeVal}` :
                        `${colorObj.color ? colorObj.color + ' - ' : ''}${sizeVal}`;

                    newRows.push({
                        id: `${colorObj.id || 'none'}-${sizeVal}`,
                        product_name: commonData.product_name, // Fixed product name
                        color: colorObj.color || "",
                        size: sizeVal,
                        sku: variantSku, // SKU is now the variant string
                        selling_price: 0,
                        mrp: 0,
                        discount: 0
                    });
                });
            });

            setRows(newRows);
        };

        generateRows();
    }, [commonData.product_name, commonData.size_chart_id, selectedColors, sizeCharts]);

    const fetchMasters = async () => {
        try {
            const [catRes, subCatRes, superSubCatRes, colorRes, sizeChartRes, uomRes, brandRes] = await Promise.all([
                axios.get(`${API}/categories`),
                axios.get(`${API}/sub_categories`),
                axios.get(`${API}/super_sub_categories`),
                axios.get(`${API}/color`),
                axios.get(`${API}/size-charts`),
                axios.get(`${API}/uom`),
                axios.get(`${API}/brandname`)
            ]);
            setCategories(catRes.data);
            setSubCategories(subCatRes.data);
            setSuperSubCategories(superSubCatRes.data);
            setColors(colorRes.data);
            setSizeCharts(sizeChartRes.data);
            setUoms(uomRes.data);
            setBrands(brandRes.data);
        } catch (error) {
            console.error("Error fetching masters:", error);
            toast.error("Failed to load master data");
        }
    };

    const handleCommonChange = (field, value) => {
        setCommonData(prev => ({ ...prev, [field]: value }));
    };

    const handleColorToggle = (colorObj) => {
        if (selectedColors.find(c => c.id === colorObj.id)) {
            setSelectedColors(selectedColors.filter(c => c.id !== colorObj.id));
        } else {
            setSelectedColors([...selectedColors, colorObj]);
        }
    };



    const handleRowChange = (index, field, value) => {
        const updatedRows = [...rows];
        updatedRows[index][field] = value;
        setRows(updatedRows);
    };

    const removeRow = (index) => {
        const updatedRows = rows.filter((_, i) => i !== index);
        setRows(updatedRows);
    };

    const handleSubmit = async () => {
        if (rows.length === 0) {
            toast.warning("No products generated. Please select at least a Size Chart.");
            return;
        }

        if (!commonData.product_name || !commonData.category) {
            toast.error("Product Name and Category are required.");
            return;
        }

        // ✅ Check for duplicate SKUs within the generated rows
        const skuMap = {};
        const duplicatesInRows = [];

        rows.forEach((row, index) => {
            if (row.sku) {
                if (skuMap[row.sku]) {
                    duplicatesInRows.push(`Row ${index + 1}: ${row.sku}`);
                } else {
                    skuMap[row.sku] = true;
                }
            }
        });

        if (duplicatesInRows.length > 0) {
            toast.error(
                `Duplicate SKUs found in generated products:\n${duplicatesInRows.join('\n')}`,
                { autoClose: 5000 }
            );
            return;
        }

        // ✅ Check for duplicate SKUs against existing database
        setLoading(true);
        try {
            const existingSkusRes = await axios.get(`${API}/products/skus`);
            const existingSkus = existingSkusRes.data || [];

            const duplicateAgainstDB = rows.filter(row =>
                row.sku && existingSkus.includes(row.sku)
            );

            if (duplicateAgainstDB.length > 0) {
                setLoading(false);
                const duplicateList = duplicateAgainstDB.map(r => r.sku).join(', ');
                toast.error(
                    `Duplicate SKU(s) already exist in database: ${duplicateList}`,
                    { autoClose: 5000 }
                );
                return;
            }
        } catch (err) {
            console.error("Error checking SKU duplicates:", err);
            toast.warning("Could not veriAY SKU duplicates. Proceeding with save...");
        }

        // ✅ Proceed with saving
        let successCount = 0;
        let errors = [];

        for (const row of rows) {
            try {
                // ✅ Auto-create size in master if it doesn't exist
                if (row.size) {
                    try {
                        await axios.post(`${API}/size`, { size: row.size });
                    } catch (sizeErr) {
                        if (sizeErr.response?.status !== 409) {
                            console.error("Error creating size in master:", sizeErr);
                        }
                    }
                }

                const payload = {
                    product_name: row.product_name,
                    brand_name: commonData.brandname,
                    category: commonData.category,
                    sub_category: commonData.sub_category,
                    super_sub_category: commonData.super_sub_category,
                    hsn_code: commonData.hsn_code,
                    gst: commonData.gst,
                    size: row.size,
                    color: row.color,
                    sku: row.sku,
                    uom: commonData.uom,
                    boxes: commonData.boxes,
                    discount: parseFloat(row.discount) || 0,
                    current_stock: 0,
                    minimum_stock: 0,
                    selling_price: parseFloat(row.selling_price) || 0,
                    purchase_price: 0,
                    mrp: parseFloat(row.mrp) || 0
                };

                await axios.post(`${API}/products`, payload);
                successCount++;
            } catch (err) {
                console.error("Error saving row:", row.product_name, err);
                const errorMsg = err.response?.data?.error || err.message || 'Unknown error';

                // Check if it's a duplicate SKU error from database
                if (errorMsg.includes('Duplicate') || errorMsg.includes('duplicate') ||
                    errorMsg.includes('sku') || err.response?.status === 409) {
                    errors.push(`${row.product_name} - Duplicate SKU: ${row.sku}`);
                    toast.error(`Duplicate SKU detected: ${row.sku}`);
                } else {
                    errors.push(`${row.product_name} (${errorMsg})`);
                    toast.error(`Failed to save: ${row.product_name} - ${errorMsg}`);
                }
            }
        }

        setLoading(false);
        if (successCount > 0) {
            toast.success(`Successfully created ${successCount} products!`);
            if (errors.length === 0) {
                setTimeout(() => navigate('/inventory'), 1500);
            }
        }
        if (errors.length > 0) {
            console.error("Failed products:", errors);
            toast.error(`Failed to create ${errors.length} product(s). Check console for details.`);
        }
    };

    return (
        <div className="container-fluid p-4">
            <ToastContainer />
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold text-primary">
                    <i className="bi bi-grid-3x3-gap-fill me-2"></i>
                    Bulk Product Creator
                </h3>
                <div>
                    <button className="btn btn-outline-secondary me-2" onClick={() => navigate('/inventory')}>
                        Cancel
                    </button>
                    <button
                        className="btn btn-primary fw-bold"
                        onClick={handleSubmit}
                        disabled={loading || rows.length === 0}
                    >
                        {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-save me-2"></i>}
                        Save {rows.length > 0 ? `${rows.length} Products` : ''}
                    </button>
                </div>
            </div>

            {/* Input Form Card */}
            <div className="card shadow-sm border-0 mb-4">
                <div className="card-header bg-white py-3">
                    <h5 className="mb-0 fw-bold text-secondary">Common Attributes</h5>
                </div>
                <div className="card-body">
                    <div className="row g-3">
                        {/* Row 1 */}
                        <div className="col-md-3">
                            <label className="form-label fw-bold small">Product Name <span className="text-danger">*</span></label>
                            <input type="text" className="form-control" value={commonData.product_name} onChange={(e) => handleCommonChange('product_name', e.target.value)} placeholder="Base Product Name" />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label fw-bold small">Category <span className="text-danger">*</span></label>
                            <select className="form-select" value={commonData.category} onChange={(e) => handleCommonChange('category', e.target.value)}>
                                <option value="">Select Category</option>
                                {categories.map(c => <option key={c.id} value={c.category}>{c.category}</option>)}
                            </select>
                        </div>
                        <div className="col-md-3">
                            <label className="form-label fw-bold small">Sub Category</label>
                            <select className="form-select" value={commonData.sub_category} onChange={(e) => handleCommonChange('sub_category', e.target.value)}>
                                <option value="">Select Sub Category</option>
                                {subCategories.map(c => <option key={c.id} value={c.sub_category}>{c.sub_category}</option>)}
                            </select>
                        </div>
                        <div className="col-md-3">
                            <label className="form-label fw-bold small">Super Sub Category</label>
                            <select className="form-select" value={commonData.super_sub_category} onChange={(e) => handleCommonChange('super_sub_category', e.target.value)}>
                                <option value="">Select Super Sub</option>
                                {superSubCategories.map(c => <option key={c.id} value={c.super_sub_category}>{c.super_sub_category}</option>)}
                            </select>
                        </div>

                        {/* Row 2 */}
                        <div className="col-md-2">
                            <label className="form-label fw-bold small">HSN Code</label>
                            <input type="text" className="form-control" value={commonData.hsn_code} onChange={(e) => handleCommonChange('hsn_code', e.target.value)} />
                        </div>
                        <div className="col-md-2">
                            <label className="form-label fw-bold small">GST %</label>
                            <input type="number" className="form-control" value={commonData.gst} onChange={(e) => handleCommonChange('gst', e.target.value)} />
                        </div>
                        <div className="col-md-2">
                            <label className="form-label fw-bold small">UOM</label>
                            <select className="form-select" value={commonData.uom} onChange={(e) => handleCommonChange('uom', e.target.value)}>
                                <option value="">Select UOM</option>
                                {uoms.map((u) => <option key={u.id} value={u.name}>{u.name}</option>)}
                            </select>
                        </div>
                        <div className="col-md-2">
                            <label className="form-label fw-bold small">Boxes</label>
                            <input type="text" className="form-control" value={commonData.boxes} onChange={(e) => handleCommonChange('boxes', e.target.value)} placeholder="e.g. 10" />
                        </div>
                        <div className="col-md-2">
                            <label className="form-label fw-bold small">Brand Name</label>
                            <select className="form-select" value={commonData.brandname} onChange={(e) => handleCommonChange('brandname', e.target.value)}>
                                <option value="">Select Brand</option>
                                {brands.map((b) => <option key={b.id} value={b.brandname || b.brand}>{b.brandname || b.brand}</option>)}
                            </select>
                        </div>
                        <div className="col-md-2">
                            <label className="form-label fw-bold small">Size Chart <span className="text-danger">*</span></label>
                            <select className="form-select" value={commonData.size_chart_id} onChange={(e) => handleCommonChange('size_chart_id', e.target.value)}>
                                <option value="">Select Size Chart</option>
                                {sizeCharts.map(sc => <option key={sc.id} value={sc.id}>{sc.chart_name} ({sc.size_values})</option>)}
                            </select>
                        </div>

                        {/* Row 3 - Color Autocomplete */}
                        <div className="col-12 position-relative">
                            <label className="form-label fw-bold small">Select Colors (Live Search)</label>
                            <div className="d-flex flex-wrap gap-2 mb-2">
                                {selectedColors.map(c => (
                                    <span key={c.id} className="badge bg-primary p-2">
                                        {c.color}
                                        <i className="bi bi-x-circle ms-2 cursor-pointer" onClick={() => handleColorToggle(c)}></i>
                                    </span>
                                ))}
                            </div>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search colors..."
                                value={colorSearch}
                                onChange={(e) => {
                                    setColorSearch(e.target.value);
                                    setShowColorDropdown(true);
                                }}
                                onFocus={() => setShowColorDropdown(true)}
                            />
                            {showColorDropdown && (
                                <ul className="list-group position-absolute w-100 shadow-sm" style={{ zIndex: 1000, maxHeight: '200px', overflowY: 'auto' }}>
                                    {colors
                                        .filter(c => c.color.toLowerCase().includes(colorSearch.toLowerCase()) && !selectedColors.find(sc => sc.id === c.id))
                                        .map(c => (
                                            <li
                                                key={c.id}
                                                className="list-group-item list-group-item-action cursor-pointer"
                                                onClick={() => {
                                                    handleColorToggle(c);
                                                    setColorSearch('');
                                                    setShowColorDropdown(false);
                                                }}
                                            >
                                                {c.color}
                                            </li>
                                        ))}
                                    {colors.filter(c => c.color.toLowerCase().includes(colorSearch.toLowerCase()) && !selectedColors.find(sc => sc.id === c.id)).length === 0 && (
                                        <li className="list-group-item disabled">No matching colors</li>
                                    )}
                                </ul>
                            )}
                            <div className="form-text">Type to find colors, click to select. Generation works even without colors.</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Generated Rows Table */}
            <div className="card shadow-sm border-0">
                <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                    <h5 className="mb-0 fw-bold text-secondary">Generated Products</h5>
                    <div className="d-flex align-items-center gap-2">
                        {duplicateSkus.length > 0 && (
                            <span className="badge bg-danger">
                                <i className="bi bi-exclamation-triangle me-1"></i>
                                {duplicateSkus.length} Duplicate SKU(s)
                            </span>
                        )}
                        <span className="badge bg-secondary">{rows.length} Items</span>
                    </div>
                </div>

                {/* Duplicate Warning Banner */}
                {duplicateSkus.length > 0 && (
                    <div className="alert alert-danger m-3 mb-0">
                        <div className="d-flex align-items-center">
                            <i className="bi bi-exclamation-triangle-fill fs-4 me-3"></i>
                            <div>
                                <strong>Duplicate SKUs Detected!</strong>
                                <p className="mb-0 small">
                                    The following SKUs appear multiple times: <strong>{duplicateSkus.join(', ')}</strong>
                                    <br />Please remove duplicates before saving.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-bordered table-hover mb-0 align-middle">
                            <thead className="table-light text-center">
                                <tr>
                                    <th width="50">#</th>
                                    <th>Product Name</th>
                                    <th>Color</th>
                                    <th>Size</th>
                                    <th>Selling Price</th>
                                    <th>MRP</th>
                                    <th>Discount %</th>
                                    <th width="80">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="text-center py-5 text-muted">
                                            Select a Size Chart to generate products. Colors are optional.
                                        </td>
                                    </tr>
                                ) : (
                                    rows.map((row, index) => {
                                        const isDuplicate = duplicateSkus.includes(row.sku);
                                        return (
                                            <tr
                                                key={index}
                                                className={isDuplicate ? 'table-danger' : ''}
                                                style={isDuplicate ? { border: '2px solid #dc3545' } : {}}
                                            >
                                                <td className="text-center">
                                                    {index + 1}
                                                    {isDuplicate && (
                                                        <span className="badge bg-danger ms-1" title="Duplicate SKU">
                                                            <i className="bi bi-exclamation-triangle"></i>
                                                        </span>
                                                    )}
                                                </td>
                                                <td>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm"
                                                        value={row.product_name}
                                                        onChange={(e) => handleRowChange(index, 'product_name', e.target.value)}
                                                    />
                                                </td>
                                                <td className="text-center bg-light text-secondary">{row.color || "N/A"}</td>
                                                <td className="text-center bg-light text-secondary">
                                                    {row.size}
                                                    {isDuplicate && (
                                                        <div className="text-danger small mt-1">
                                                            <i className="bi bi-exclamation-circle-fill me-1"></i>
                                                            Duplicate SKU: {row.sku}
                                                        </div>
                                                    )}
                                                </td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        className="form-control form-control-sm"
                                                        value={row.selling_price}
                                                        onChange={(e) => handleRowChange(index, 'selling_price', e.target.value)}
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        className="form-control form-control-sm"
                                                        value={row.mrp}
                                                        onChange={(e) => handleRowChange(index, 'mrp', e.target.value)}
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        className="form-control form-control-sm"
                                                        value={row.discount}
                                                        onChange={(e) => handleRowChange(index, 'discount', e.target.value)}
                                                    />
                                                </td>
                                                <td className="text-center">
                                                    <button
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={() => removeRow(index)}
                                                        title="Remove variant"
                                                    >
                                                        <i className="bi bi-trash"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
