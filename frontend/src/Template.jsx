import React, { useState, useEffect } from "react";
import axios from "axios";

import "react-toastify/dist/ReactToastify.css";

const API = process.env.REACT_APP_API_URL;

function Template() {
  const [success, setSuccess] = useState("");
  const [templates, setTemplates] = useState([]);
  const [form, setForm] = useState({
    id: null,
    template_name: "",
    stock_action: "",
    is_sku: 1,
    is_inclusive: 0,
  });
  const [isEditing, setIsEditing] = useState(false);

  // Fetch templates
  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await axios.get(`${API}/templates`);
      setTemplates(res.data);
    } catch (err) {
      console.error("Error fetching templates:", err);
    }
  };

  // prevent duplicates
  const exists = templates.find(
    (t) =>
      t.template_name.toLowerCase() === form.template_name.toLowerCase() &&
      t.id !== form.id
  );

  if (exists) {
    alert("This template name already exists!");
    return;
  }

  form.template_name = form.template_name.trim().toLowerCase();

  // Handle form input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Save new or updated template
  const saveTemplate = async () => {
    if (!form.template_name || !form.stock_action) {
      alert("Please fill all fields");
      return;
    }

    // ✅ Format template name before saving
    form.template_name = form.template_name.trim().toLowerCase();

    try {
      if (isEditing) {
        // --- Update existing ---
        await axios.put(`${API}/templates/${form.id}`, form);
        setSuccess("Template updated successfully!");
      } else {
        // --- Insert new ---
        await axios.post(`${API}/templates`, form);
        setSuccess("Template saved successfully!");
      }

      setForm({ id: null, template_name: "", stock_action: "", is_sku: 1, is_inclusive: 0 });
      setIsEditing(false);
      fetchTemplates();
    } catch (err) {
      console.error("Error saving template:", err);
      alert("Error saving template");
    }
  };


  // Load selected row for editing
  const editTemplate = (tpl) => {
    setForm({
      id: tpl.id,
      template_name: tpl.template_name,
      stock_action: tpl.stock_action,
      is_sku: tpl.is_sku,
      is_inclusive: tpl.is_inclusive,
    });
    setIsEditing(true);
  };

  // Delete template
  const deleteTemplate = async (id) => {
    if (!window.confirm("Delete this template?")) return;
    try {
      await axios.delete(`${API}/templates/${id}`);
      fetchTemplates();
    } catch (err) {
      console.error("Error deleting template:", err);
      alert("Error deleting template");
    }
  };

  // Cancel editing
  const cancelEdit = () => {
    setForm({ id: null, template_name: "", stock_action: "", is_sku: 1, is_inclusive: 0 });
    setIsEditing(false);
  };

  return (
    <div className="container mt-4">
      {success && (
        <div
          className="toast align-items-center text-white bg-success border-0 show position-fixed top-0 end-0 m-3"
          role="alert"
          style={{ zIndex: 99999 }}
        >
          <div className="d-flex">
            <div className="toast-body">
              <i className="bi bi-exclamation-circle me-2"></i>
              {success}
            </div>
            <button
              type="button"
              className="btn-close btn-close-white me-2 m-auto"
              onClick={() => setSuccess("")}
            ></button>
          </div>
        </div>
      )}
      <div className="card shadow p-4">
        <h4 className="text-center mb-3">
          {isEditing ? "Update Template" : "Template Configuration"}
        </h4>

        <div className="row mb-3">
          <div className="col-md-6">
            <label className="form-label">Template Name</label>
            <input
              type="text"
              name="template_name"
              value={form.template_name}
              onChange={handleChange}
              className="form-control"
              placeholder="Enter template name (e.g. Sales, Purchase)"
            />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Stock Action</label>
            <select
              name="stock_action"
              value={form.stock_action}
              onChange={handleChange}
              className="form-select"
            >
              <option value="">Select stock action</option>
              <option value="add">Add Stock</option>
              <option value="reduce">Reduce Stock</option>
              <option value="none">None</option>
            </select>
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">SKU Validation</label>
            <select
              name="is_sku"
              value={form.is_sku}
              onChange={(e) => setForm({ ...form, is_sku: Number(e.target.value) })}
              className="form-select"
            >
              <option value={1}>With SKU (Validation Required)</option>
              <option value={0}>Without SKU (Validation Optional)</option>
            </select>
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Tax Calculation</label>
            <select
              name="is_inclusive"
              value={form.is_inclusive}
              onChange={(e) => setForm({ ...form, is_inclusive: Number(e.target.value) })}
              className="form-select"
            >
              <option value={0}>Exclusive (Normal: 100 + 18%)</option>
              <option value={1}>Inclusive (Included: 100 includes 18%)</option>
            </select>
          </div>
        </div>

        <div className="d-flex gap-2">
          <button className="btn btn-primary w-100" onClick={saveTemplate}>
            {isEditing ? "Update Template" : "Save Template"}
          </button>
          {isEditing && (
            <button className="btn btn-secondary" onClick={cancelEdit}>
              Cancel
            </button>
          )}
        </div>

        <hr />

        <h5 className="mb-3">Saved Templates</h5>
        <table className="table table-bordered table-striped">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Template Name</th>
              <th>Stock Action</th>
              <th>SKU</th>
              <th>Tax Type</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {templates.length > 0 ? (
              templates.map((tpl) => (
                <tr key={tpl.id}>
                  <td>{tpl.id}</td>
                  <td>{tpl.template_name}</td>
                  <td>{tpl.stock_action}</td>
                  <td>{tpl.is_sku === 1 ? "With SKU" : "Without SKU"}</td>
                  <td>{tpl.is_inclusive === 1 ? "Inclusive" : "Exclusive"}</td>
                  <td>
                    <button
                      className="btn btn-warning btn-sm me-2"
                      onClick={() => editTemplate(tpl)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => deleteTemplate(tpl.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center">
                  No templates found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Template;
