import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const API = process.env.REACT_APP_API_URL;

function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [values, setValues] = useState({
    sku: "",
    product_name: "",
    category: "",
    sub_category: "",
    super_sub_category: "",
    hsn_code: "",
    gst: "",
    discount: "",
    barcode: "",
    size: "",
    color: "",
    brand_name: "",
    current_stock: "",
    minimum_stock: "",
    selling_price: "",
    purchase_price: "",
    mrp: "",
    product_type: "Product",
    size_chart_id: '', // Added size_chart_id
    uom: "",
    boxes: "",
  });

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [superSubCategories, setSuperSubCategories] = useState([]);
  const [size, setSize] = useState([]);
  const [color, setColor] = useState([]);
  const [brands, setBrands] = useState([]); // Renamed from brandname to brands for dropdown options
  const [uoms, setUoms] = useState([]);
  const [sizeCharts, setSizeCharts] = useState([]); // Added sizeCharts

  // ✅ Fetch Dropdown Data
  const fetchDropdowns = async () => {
    try {
      const [
        catRes, subRes, superSubRes, sizeRes, colorRes, brandRes, uomRes, sizeChartRes
      ] = await Promise.all([
        axios.get(`${API}/categories`),
        axios.get(`${API}/sub_categories`),
        axios.get(`${API}/super_sub_categories`),
        axios.get(`${API}/size`),
        axios.get(`${API}/color`),
        axios.get(`${API}/brandname`),
        axios.get(`${API}/uom`),
        axios.get(`${API}/size-charts`), // Fetch size charts
      ]);

      setCategories(catRes.data);
      setSubCategories(subRes.data);
      setSuperSubCategories(superSubRes.data);
      setSize(sizeRes.data);
      setColor(colorRes.data);
      setBrands(brandRes.data); // Set brands
      setUoms(uomRes.data);
      setSizeCharts(sizeChartRes.data); // Set size charts
    } catch (error) {
      console.error("Dropdown fetch error:", error);
      toast.error('Failed to load form data');
    }
  };

  // ✅ Fetch Product Data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`${API}/products/${id}`);
        setValues(res.data);
      } catch (err) {
        console.error("Failed to load product:", err);
        toast.error("❌ Failed to load product data!");
      }
    };

    fetchDropdowns();
    fetchProduct();
  }, [id]);


  useEffect(() => {
    if (brands.length && values.brand_name) {
      const exists = brands.some(b =>
        (b.brand_name || b.brand || b.name || b.brandname) === values.brand_name
      );

      if (!exists) {
        setValues(prev => ({ ...prev, brand_name: "" }));
      }
    }
  }, [brands, values.brand_name]);




  // ✅ Handle Input Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Update Product
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // ✅ Auto-create size in master if it doesn't exist
      if (values.size) {
        try {
          await axios.post(`${API}/size`, { size: values.size });
        } catch (sizeErr) {
          if (sizeErr.response?.status !== 409) {
            console.error("Error creating size in master:", sizeErr);
          }
        }
      }

      await axios.put(`${API}/products/${id}`, values);
      toast.success("✅ Product updated successfully!");
      setTimeout(() => navigate("/productmy"), 1500);
    } catch (err) {
      console.error("Error updating product:", err);
      toast.error("❌ Failed to update product!");
    }
  };

  return (
    <div className="container mt-4 mb-5">
      <ToastContainer />
      <div className="card shadow-sm border-0">
        <div className="card-header bg-primary text-white py-3">
          <h4 className="mb-0">
            <i className="bi bi-pencil-square me-2"></i>
            Edit Product {values.barcode && <span className="ms-3 badge bg-light text-primary">Barcode: {values.barcode}</span>}
          </h4>
        </div>
        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>
            {/* SKU and Product Name */}
            <div className="row mb-4">
              <div className="col-md-3">
                <label className="form-label fw-bold">Product Type</label>
                <select
                  name="product_type"
                  className="form-select"
                  value={values.product_type}
                  onChange={handleChange}
                >
                  <option value="Product">Product</option>
                  <option value="Service">Service</option>
                  <option value="Fabric">Fabric</option>
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label fw-bold">SKU</label>
                <input type="text" name="sku" className="form-control"
                  value={values.sku} onChange={handleChange} />
              </div>
              <div className="col-md-3">
                <label className="form-label fw-bold">Product Name</label>
                <input type="text" name="product_name" className="form-control"
                  value={values.product_name} onChange={handleChange} />
              </div>
              <div className="col-md-3">
                <label className="form-label fw-bold">Barcode</label>
                <input type="text" name="barcode" className="form-control"
                  value={values.barcode} onChange={handleChange} />
              </div>
            </div>

            <div className="row mb-4">
              <div className="col-md-6">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label className="form-label fw-bold mb-0">UOM</label>
                  <div className="d-flex gap-1">
                    <button type="button" className="btn btn-link btn-sm p-0 text-success"
                      onClick={() => window.open("/uom/add", "_blank")} title="Add UOM">
                      <i className="bi bi-plus-lg"></i>
                    </button>
                    <button type="button" className="btn btn-link btn-sm p-0 text-primary"
                      onClick={fetchDropdowns} title="Reload">
                      <i className="bi bi-arrow-clockwise"></i>
                    </button>
                  </div>
                </div>
                <select name="uom" className="form-select" value={values.uom || ""} onChange={handleChange}>
                  <option value="">Select UOM</option>
                  {uoms.map((u) => (
                    <option key={u.id} value={u.name}>{u.name}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">Boxes</label>
                <input type="text" name="boxes" className="form-control"
                  value={values.boxes} onChange={handleChange} />
              </div>
            </div>

            {/* Category Section */}
            <div className="row mb-4">
              <div className="col-md-4">
                <label className="form-label fw-bold">Category</label>
                <select className="form-select" name="category" value={values.category || ""} onChange={handleChange}>
                  <option value="">Select Category</option>
                  {categories.map(c => <option key={c.id} value={c.category}>{c.category}</option>)}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label fw-bold">Sub Category</label>
                <select className="form-select" name="sub_category" value={values.sub_category} onChange={handleChange}>
                  <option value="">Select Sub Category</option>
                  {subCategories.map((c) => <option key={c.id} value={c.sub_category}>{c.sub_category}</option>)}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label fw-bold">Super Sub Category</label>
                <select className="form-select" name="super_sub_category" value={values.super_sub_category} onChange={handleChange}>
                  <option value="">Select Super Sub Category</option>
                  {superSubCategories.map((c) => <option key={c.id} value={c.super_sub_category}>{c.super_sub_category}</option>)}
                </select>
              </div>
            </div>

            {/* Size, Color, Brand Name */}
            <div className="row mb-4">
              <div className="col-md-4">
                <label className="form-label fw-bold">Size</label>
                <select className="form-select" name="size" value={values.size} onChange={handleChange}>
                  <option value="">Select Size</option>
                  {size.map((c) => <option key={c.id} value={c.size}>{c.size}</option>)}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label fw-bold">Color</label>
                <select className="form-select" name="color" value={values.color} onChange={handleChange}>
                  <option value="">Select Color</option>
                  {color.map((c) => <option key={c.id} value={c.color}>{c.color}</option>)}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label fw-bold">Brand Name</label>
                <select className="form-select" name="brand_name" value={values.brand_name || ""} onChange={handleChange}>
                  <option value="">Select Brand name</option>
                  {brands.map(c => { // Changed from brandname to brands
                    const brand = c.brand_name || c.brand || c.name || c.brandname;
                    return <option key={c.id} value={brand}>{brand}</option>;
                  })}
                </select>
              </div>
            </div>

            {/* Size Chart */}
            <div className="row mb-4">
              <div className="col-md-12">
                <label className="form-label fw-bold">Size Chart</label>
                <select className="form-select" name="size_chart_id" value={values.size_chart_id || ""} onChange={handleChange}>
                  <option value="">Select Size Chart</option>
                  {sizeCharts.map((chart) => (
                    <option key={chart.id} value={chart.id}>{chart.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <hr className="my-4 text-muted" />

            {/* Stock, Prices, Description */}
            <div className="row mb-4">
              <div className="col-md-6">
                <label className="form-label fw-bold">Current Stock</label>
                <input type="text" name="current_stock" className="form-control bg-light"
                  value={values.current_stock} readOnly />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">Minimum Stock</label>
                <input type="text" name="minimum_stock" className="form-control"
                  value={values.minimum_stock} onChange={handleChange} />
              </div>
            </div>

            <div className="row mb-4">
              <div className="col-md-4">
                <label className="form-label fw-bold">Selling Price</label>
                <div className="input-group">
                  <span className="input-group-text">₹</span>
                  <input type="number" step="0.01" name="selling_price" className="form-control"
                    value={values.selling_price} onChange={handleChange} />
                </div>
              </div>
              <div className="col-md-4">
                <label className="form-label fw-bold">Purchase Price</label>
                <div className="input-group">
                  <span className="input-group-text">₹</span>
                  <input type="number" step="0.01" name="purchase_price" className="form-control"
                    value={values.purchase_price} onChange={handleChange} />
                </div>
              </div>
              <div className="col-md-4">
                <label className="form-label fw-bold">MRP</label>
                <div className="input-group">
                  <span className="input-group-text">₹</span>
                  <input type="number" step="0.01" name="mrp" className="form-control"
                    value={values.mrp} onChange={handleChange} />
                </div>
              </div>
            </div>

            <div className="row mb-4">
              <div className="col-md-4">
                <label className="form-label fw-bold">HSN Code</label>
                <input type="text" name="hsn_code" className="form-control"
                  value={values.hsn_code} onChange={handleChange} />
              </div>
              <div className="col-md-4">
                <label className="form-label fw-bold">GST %</label>
                <input type="text" name="gst" className="form-control"
                  value={values.gst} onChange={handleChange} />
              </div>
              <div className="col-md-4">
                <label className="form-label fw-bold">Discount %</label>
                <input type="text" name="discount" className="form-control"
                  value={values.discount} onChange={handleChange} />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label fw-bold">Description</label>
              <textarea name="description" className="form-control" rows="3"
                value={values.description} onChange={handleChange}></textarea>
            </div>

            <div className="d-flex justify-content-end gap-2 mt-4">
              <button type="button" className="btn btn-outline-secondary px-4" onClick={() => navigate("/productmy")}>Cancel</button>
              <button type="submit" className="btn btn-primary px-5 fw-bold">Update Product</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditProduct;
