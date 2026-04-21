import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const API = process.env.REACT_APP_API_URL;

function ProductForm() {
  const [values, setValues] = useState({
    sku: "",
    product_name: "",
    product_type: "Product",
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
    description: "",
    uom: "",
    boxes: "",
  });

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [superSubCategories, setSuperSubCategories] = useState([]);
  const [size, setSize] = useState([]);
  const [color, setColor] = useState([]);
  const [brandname, setBrandname] = useState([]);
  const [uoms, setUoms] = useState([]);

  const navigate = useNavigate();






  // ✅ Fetch Categories
  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API}/categories`);
      setCategories(res.data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };
  const fetchSubCategories = async () => {
    try {
      const res = await axios.get(`${API}/sub_categories`);
      setSubCategories(res.data);
    } catch (err) {
      console.error("Error fetching sub categories:", err);
    }
  };
  const fetchSuperSubCategories = async () => {
    try {
      const res = await axios.get(`${API}/super_sub_categories`);
      setSuperSubCategories(res.data);
    } catch (err) {
      console.error("Error fetching super sub categories:", err);
    }
  };
  const fetchSize = async () => {
    try {
      const res = await axios.get(`${API}/size`);
      setSize(res.data);
    } catch (err) {
      console.error("Error fetching Size:", err);
    }
  };
  const fetchColor = async () => {
    try {
      const res = await axios.get(`${API}/color`);
      setColor(res.data);
    } catch (err) {
      console.error("Error fetching color:", err);
    }
  };
  const fetchBrandname = async () => {
    try {
      const res = await axios.get(`${API}/brandname`);
      setBrandname(res.data);
    } catch (err) {
      console.error("Error fetching brand name:", err);
    }
  };

  const fetchUoms = async () => {
    try {
      const res = await axios.get(`${API}/uom`);
      setUoms(res.data);
    } catch (err) {
      console.error("Error fetching UOMs:", err);
    }
  };

  // ✅ Refresh Button Toast
  const handleRefresh = async () => {
    try {
      await fetchCategories();
      await fetchSubCategories();
      await fetchSuperSubCategories();
      await fetchSize();
      await fetchColor();
      await fetchBrandname();
      await fetchUoms();     // Reload data
      toast.success("✅ Cool! Options Refreshed!", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        theme: "colored",
      });
    } catch (error) {
      console.error("Refresh error:", error);
      toast.error("❌ Failed to refresh options!", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        theme: "colored",
      });
    }
  };

  // ✅ Initial load
  useEffect(() => {
    fetchCategories();
    fetchSubCategories();
    fetchSuperSubCategories();
    fetchSize();
    fetchColor();
    fetchBrandname();
    fetchUoms();
    fetchLastBarcode();
  }, []);

  const fetchLastBarcode = async () => {
    try {
      const res = await axios.get(`${API}/products/last-barcode`);
      const nextBarcode = (parseInt(res.data.lastBarcode) || 0) + 1;
      setValues(prev => ({ ...prev, barcode: nextBarcode.toString() }));
    } catch (err) {
      console.error("Error fetching last barcode:", err);
    }
  };

  //sub category


  // ✅ Handle change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({
      ...prev,
      [name]: value === "" ? "" : value,
    }));
  };

  // ✅ Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // ✅ Auto-create size in master if it doesn't exist
      if (values.size) {
        try {
          await axios.post(`${API}/size`, { size: values.size });
        } catch (sizeErr) {
          // If 409, it already exists, so we continue
          if (sizeErr.response?.status !== 409) {
            console.error("Error creating size in master:", sizeErr);
          }
        }
      }

      await axios.post(`${API}/products`, values);
      alert("✅ Product saved successfully!");
      navigate("/Productmy");
    } catch (err) {
      console.error("❌ Error adding product:", err.response?.data || err.message);
      alert(`Error adding product: ${err.response?.data?.error || err.message}`);
    }
  };

  return (
    <div className="container mt-4 mb-5">
      <ToastContainer />
      <div className="card shadow-sm border-0">
        <div className="card-header bg-primary text-white py-3">
          <h4 className="mb-0"><i className="bi bi-plus-circle me-2"></i>Add New Product</h4>
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
                <input
                  type="text"
                  name="sku"
                  className="form-control"
                  placeholder="Enter SKU"
                  value={values.sku}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label fw-bold">Product Name</label>
                <input
                  type="text"
                  name="product_name"
                  className="form-control"
                  placeholder="Enter Product Name"
                  value={values.product_name}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-2">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label className="form-label fw-bold mb-0">UOM</label>
                  <div className="d-flex gap-1">
                    <button type="button" className="btn btn-link btn-sm p-0 text-success"
                      onClick={() => window.open("/uom/add", "_blank")} title="Add UOM">
                      <i className="bi bi-plus-lg"></i>
                    </button>
                    <button type="button" className="btn btn-link btn-sm p-0 text-primary"
                      onClick={handleRefresh} title="Reload">
                      <i className="bi bi-arrow-clockwise"></i>
                    </button>
                  </div>
                </div>
                <select name="uom" className="form-select" value={values.uom} onChange={handleChange}>
                  <option value="">Select UOM</option>
                  {uoms.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                </select>
              </div>

            </div>

            {/* Category Section */}
            <div className="row mb-4">
              <div className="col-md-4">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label className="form-label fw-bold mb-0">Category</label>
                  <div className="d-flex gap-1">
                    <button type="button" className="btn btn-link btn-sm p-0 text-success" onClick={() => window.open("/categoryform", "_blank")}><i className="bi bi-plus-lg"></i></button>
                    <button type="button" className="btn btn-link btn-sm p-0 text-primary" onClick={handleRefresh}><i className="bi bi-arrow-clockwise"></i></button>
                  </div>
                </div>
                <select className="form-select" name="category" value={values.category} onChange={handleChange}>
                  <option value="">Select Category</option>
                  {categories.map(c => <option key={c.id} value={c.category}>{c.category}</option>)}
                </select>
              </div>

              <div className="col-md-4">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label className="form-label fw-bold mb-0">Sub Category</label>
                  <div className="d-flex gap-1">
                    <button type="button" className="btn btn-link btn-sm p-0 text-success" onClick={() => window.open("/subcategoryform", "_blank")}><i className="bi bi-plus-lg"></i></button>
                    <button type="button" className="btn btn-link btn-sm p-0 text-primary" onClick={handleRefresh}><i className="bi bi-arrow-clockwise"></i></button>
                  </div>
                </div>
                <select className="form-select" name="sub_category" value={values.sub_category} onChange={handleChange}>
                  <option value="">Select Sub Category</option>
                  {subCategories.map(c => <option key={c.id} value={c.sub_category}>{c.sub_category}</option>)}
                </select>
              </div>

              <div className="col-md-4">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label className="form-label fw-bold mb-0">Super Sub Category</label>
                  <div className="d-flex gap-1">
                    <button type="button" className="btn btn-link btn-sm p-0 text-success" onClick={() => window.open("/supersubcategoryform", "_blank")}><i className="bi bi-plus-lg"></i></button>
                    <button type="button" className="btn btn-link btn-sm p-0 text-primary" onClick={handleRefresh}><i className="bi bi-arrow-clockwise"></i></button>
                  </div>
                </div>
                <select className="form-select" name="super_sub_category" value={values.super_sub_category} onChange={handleChange}>
                  <option value="">Select Super Sub Category</option>
                  {superSubCategories.map(c => <option key={c.id} value={c.super_sub_category}>{c.super_sub_category}</option>)}
                </select>
              </div>
            </div>

            {/* Size, Color, Brand */}
            <div className="row mb-4">
              <div className="col-md-4">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label className="form-label fw-bold mb-0">Size</label>
                  <div className="d-flex gap-1">
                    <button type="button" className="btn btn-link btn-sm p-0 text-success" onClick={() => window.open("/size", "_blank")}><i className="bi bi-plus-lg"></i></button>
                    <button type="button" className="btn btn-link btn-sm p-0 text-primary" onClick={handleRefresh}><i className="bi bi-arrow-clockwise"></i></button>
                  </div>
                </div>
                <select className="form-select" name="size" value={values.size} onChange={handleChange}>
                  <option value="">Select Size</option>
                  {size.map(c => <option key={c.id} value={c.size}>{c.size}</option>)}
                </select>
              </div>
              <div className="col-md-4">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label className="form-label fw-bold mb-0">Color</label>
                  <div className="d-flex gap-1">
                    <button type="button" className="btn btn-link btn-sm p-0 text-success" onClick={() => window.open("/color", "_blank")}><i className="bi bi-plus-lg"></i></button>
                    <button type="button" className="btn btn-link btn-sm p-0 text-primary" onClick={handleRefresh}><i className="bi bi-arrow-clockwise"></i></button>
                  </div>
                </div>
                <select className="form-select" name="color" value={values.color} onChange={handleChange}>
                  <option value="">Select Color</option>
                  {color.map(c => <option key={c.id} value={c.color}>{c.color}</option>)}
                </select>
              </div>
              <div className="col-md-4">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label className="form-label fw-bold mb-0">Brand name</label>
                  <div className="d-flex gap-1">
                    <button type="button" className="btn btn-link btn-sm p-0 text-success" onClick={() => window.open("/brandform", "_blank")}><i className="bi bi-plus-lg"></i></button>
                    <button type="button" className="btn btn-link btn-sm p-0 text-primary" onClick={handleRefresh}><i className="bi bi-arrow-clockwise"></i></button>
                  </div>
                </div>
                <select className="form-select" name="brand_name" value={values.brand_name} onChange={handleChange}>
                  <option value="">Select Brand name</option>
                  {brandname.map(c => <option key={c.id} value={c.brandname}>{c.brandname}</option>)}
                </select>
              </div>
            </div>

            <hr className="my-4 text-muted" />

            {/* HSN, GST, Discount */}
            <div className="row mb-3">
              <div className="col-md-3">
                <label className="form-label fw-bold">HSN Code</label>
                <input type="text" name="hsn_code" className="form-control" value={values.hsn_code} onChange={handleChange} />
              </div>
              <div className="col-md-3">
                <label className="form-label fw-bold">GST %</label>
                <input type="text" name="gst" className="form-control" value={values.gst} onChange={handleChange} />
              </div>
              <div className="col-md-3">
                <label className="form-label fw-bold">Discount %</label>
                <input type="text" name="discount" className="form-control" value={values.discount} onChange={handleChange} />
              </div>
              <div className="col-md-3">
                <label className="form-label fw-bold">Boxes</label>
                <input type="text" name="boxes" className="form-control" value={values.boxes} onChange={handleChange} />
              </div>
            </div>

            {/* Stock and Price */}
            <div className="row mb-4">
              <div className="col-md-4">
                <label className="form-label fw-bold">Barcode</label>
                <input type="text" name="barcode" className="form-control" value={values.barcode} onChange={handleChange} />
              </div>
              <div className="col-md-4">
                <label className="form-label fw-bold">Current Stock</label>
                <input type="text" name="current_stock" className="form-control bg-light" value={values.current_stock} readOnly />
              </div>
              <div className="col-md-4">
                <label className="form-label fw-bold">Minimum Stock</label>
                <input type="text" name="minimum_stock" className="form-control" value={values.minimum_stock} onChange={handleChange} />
              </div>
            </div>

            {/* Pricing */}
            <div className="row mb-4">
              <div className="col-md-4">
                <label className="form-label fw-bold">Selling Price</label>
                <div className="input-group">
                  <span className="input-group-text">₹</span>
                  <input type="number" step="0.01" name="selling_price" className="form-control" value={values.selling_price} onChange={handleChange} />
                </div>
              </div>
              <div className="col-md-4">
                <label className="form-label fw-bold">Purchase Price</label>
                <div className="input-group">
                  <span className="input-group-text">₹</span>
                  <input type="number" step="0.01" name="purchase_price" className="form-control" value={values.purchase_price} onChange={handleChange} />
                </div>
              </div>
              <div className="col-md-4">
                <label className="form-label fw-bold">MRP</label>
                <div className="input-group">
                  <span className="input-group-text">₹</span>
                  <input type="number" step="0.01" name="mrp" className="form-control" value={values.mrp} onChange={handleChange} />
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label fw-bold">Description</label>
              <textarea name="description" className="form-control" rows="3" value={values.description} onChange={handleChange}></textarea>
            </div>

            <div className="d-flex justify-content-end gap-2">
              <button type="button" className="btn btn-outline-secondary px-4" onClick={() => navigate("/Productmy")}>Cancel</button>
              <button type="submit" className="btn btn-primary px-5 fw-bold">Save Product</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ProductForm;
