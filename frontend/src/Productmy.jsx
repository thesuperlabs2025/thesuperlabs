import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Loader from "./Loader";
const API = process.env.REACT_APP_API_URL;

function ProductMy() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [filters, setFilters] = useState({ sku: "", product_name: "", category: "" });
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [nameSuggestions, setNameSuggestions] = useState([]);

  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API}/products`);
      const data = Array.isArray(res.data) ? res.data : res.data.products || [];
      setProducts(data);
      setFilteredProducts(data);

      const categories = [...new Set(data.map(p => p.category).filter(Boolean))];
      setCategoryOptions(categories);
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  useEffect(() => {
    const result = products.filter(p =>
      (filters.sku === "" || p.sku?.toLowerCase().includes(filters.sku.toLowerCase())) &&
      (filters.product_name === "" || p.product_name?.toLowerCase().includes(filters.product_name.toLowerCase())) &&
      (filters.category === "" || p.category === filters.category)
    );
    setFilteredProducts(result);
  }, [filters, products]);

  const handleFilterChange = e => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));

    if (name === "product_name") {
      if (!value.trim()) setNameSuggestions([]);
      else {
        const suggestions = products.filter(p =>
          p.product_name?.toLowerCase().includes(value.toLowerCase())
        ).slice(0, 5);
        setNameSuggestions(suggestions);
      }
    }
  };

  const handleNameSelect = name => {
    setFilters(prev => ({ ...prev, product_name: name }));
    setNameSuggestions([]);
  };

  const handleDelete = async id => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await axios.delete(`${API}/products/${id}`);
      alert("Product deleted successfully!");
      fetchProducts();
    } catch (err) {
      console.error(err); alert("Failed to delete product.");
    }
  };

  const handleCheckboxChange = id => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleSelectAll = () => {
    if (!selectAll) setSelectedIds(filteredProducts.map(p => p.id));
    else setSelectedIds([]);
    setSelectAll(!selectAll);
  };

  const handleDeleteSelected = async () => {
    if (!selectedIds.length) return alert("Select at least one product.");
    if (!window.confirm("Are you sure you want to delete selected products?")) return;
    try {
      await axios.post(`${API}/products/delete-multiple`, { ids: selectedIds });
      alert("Selected products deleted successfully!");
      setSelectedIds([]); setSelectAll(false); fetchProducts();
    } catch (err) {
      console.error(err); alert("Failed to delete selected products.");
    }
  };

  if (loading) return <Loader message="Loading products..." />;

  return (
    <div className="container-fluid py-4 px-md-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-primary mb-0">
          <i className="bi bi-box-seam me-2"></i>Product Master
        </h2>
        <div className="btn-group shadow-sm">
          <button className="btn btn-primary d-flex align-items-center fw-bold px-4" onClick={() => navigate("/product")}>
            <i className="bi bi-plus-lg me-2"></i>New
          </button>
          <button className="btn btn-danger d-flex align-items-center" onClick={handleDeleteSelected} disabled={selectedIds.length === 0}>
            <i className="bi bi-trash me-2"></i>Delete ({selectedIds.length})
          </button>
        </div>
      </div>

      {/* Filters Card */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body p-4">
          <div className="row g-3 px-2">
            <div className="col-md-4">
              <label className="form-label fw-bold small text-muted">SKU Search</label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0"><i className="bi bi-search text-muted small"></i></span>
                <input type="text" name="sku" className="form-control border-start-0 ps-0" placeholder="Search by SKU..." value={filters.sku} onChange={handleFilterChange} />
              </div>
            </div>
            <div className="col-md-4">
              <label className="form-label fw-bold small text-muted">Product Name Search</label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0"><i className="bi bi-search text-muted small"></i></span>
                <input type="text" name="product_name" className="form-control border-start-0 ps-0 text-truncate" placeholder="Search product name..." value={filters.product_name} onChange={handleFilterChange} autoComplete="off" />
              </div>
              {nameSuggestions.length > 0 && (
                <ul className="list-group position-absolute shadow-sm" style={{ zIndex: 1000, width: '31%', marginTop: '5px', maxHeight: "200px", overflowY: "auto" }}>
                  {nameSuggestions.map(s => (
                    <li key={s.id} className="list-group-item list-group-item-action" onClick={() => handleNameSelect(s.product_name)} style={{ cursor: "pointer" }}>
                      {s.product_name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="col-md-4">
              <label className="form-label fw-bold small text-muted">Category Filter</label>
              <select name="category" className="form-select" value={filters.category} onChange={handleFilterChange}>
                <option value="">All Categories</option>
                {categoryOptions.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover table-striped mb-0 align-middle" style={{ fontSize: '16px' }}>
              <thead className="bg-dark text-white small">
                <tr>
                  <th className="ps-4" width="40"><input className="form-check-input" type="checkbox" checked={selectAll} onChange={handleSelectAll} /></th>
                  <th className="fw-bold py-3">SKU</th>
                  <th className="fw-bold py-3">PRODUCT DETAILS</th>
                  <th className="fw-bold py-3">CATEGORY</th>
                  <th className="fw-bold py-3">UOM</th>
                  <th className="fw-bold py-3 text-center">STOCK STATUS</th>
                  <th className="fw-bold py-3 text-end pe-4" width="120">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr><td colSpan="7" className="text-center py-5 text-muted">No products found matching your criteria.</td></tr>
                ) : (
                  filteredProducts.map(p => (
                    <tr key={p.id}>
                      <td className="ps-4"><input className="form-check-input" type="checkbox" checked={selectedIds.includes(p.id)} onChange={() => handleCheckboxChange(p.id)} /></td>
                      <td className="fw-bold text-dark small">{p.sku}</td>
                      <td>
                        <div className="fw-bold text-dark">{p.product_name}</div>
                        <div className="text-muted small" style={{ fontSize: '12px' }}>ID: {p.id}</div>
                      </td>
                      <td><span className="badge bg-light text-dark border">{p.category}</span></td>
                      <td className="small">{p.uom}</td>
                      <td className="text-center">
                        <div className={`fw-bold ${p.current_stock <= p.minimum_stock ? 'text-danger' : 'text-success'}`}>
                          {p.current_stock}
                        </div>
                        <div className="text-muted small" style={{ fontSize: '10px' }}>Min: {p.minimum_stock}</div>
                      </td>
                      <td className="text-end pe-4">
                        <div className="d-flex justify-content-end gap-2">
                          <button className="btn btn-outline-primary btn-sm rounded-circle d-flex align-items-center justify-content-center"
                            style={{ width: '32px', height: '32px' }} onClick={() => navigate(`/editproduct/${p.id}`)} title="Edit">
                            <i className="bi bi-pencil-square"></i>
                          </button>
                          <button className="btn btn-outline-danger btn-sm rounded-circle d-flex align-items-center justify-content-center"
                            style={{ width: '32px', height: '32px' }} onClick={() => handleDelete(p.id)} title="Delete">
                            <i className="bi bi-trash-fill"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card-footer bg-white py-3">
          <span className="text-muted small">Showing {filteredProducts.length} of {products.length} products total</span>
        </div>
      </div>
    </div>
  );
}

export default ProductMy;
