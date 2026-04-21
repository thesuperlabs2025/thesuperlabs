import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
const API = process.env.REACT_APP_API_URL;

function SuperSubCategoryForm() {
  const [superSubCategories, setSuperSubCategories] = useState([]);
  const [newSuperSubCategory, setNewSuperSubCategory] = useState("");
  const [showNewInput, setShowNewInput] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editSuperSubCategory, setEditSuperSubCategory] = useState("");

  useEffect(() => {
    fetchSuperSubCategories();
  }, []);

  // Fetch all
  const fetchSuperSubCategories = async () => {
    try {
      const res = await axios.get(`${API}/super_sub_categories`);
      setSuperSubCategories(res.data);
    } catch (error) {
      console.error("Error fetching super sub categories:", error);
    }
  };

  // Add new
  const handleAddSuperSubCategory = async () => {
    const trimmed = newSuperSubCategory.trim();
    if (trimmed === "") return;

    // ✅ Duplicate check
    const duplicate = superSubCategories.find(
      (item) => item.super_sub_category.toLowerCase() === trimmed.toLowerCase()
    );

    if (duplicate) {
      alert("⚠️ Super Sub Category already exists!");
      return;
    }

    try {
      await axios.post(`${API}/super_sub_categories`, {
        super_sub_category: trimmed,
      });

      setNewSuperSubCategory("");
      setShowNewInput(false);
      fetchSuperSubCategories();
    } catch (err) {
      alert("❌ Something went wrong while adding super sub category!");
      console.error("Error adding super sub category:", err);
    }
  };

  // Delete
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure to delete this super sub category?")) {
      try {
        await axios.delete(`${API}/super_sub_categories/${id}`);
        fetchSuperSubCategories();
      } catch (error) {
        console.error("Error deleting super sub category:", error);
      }
    }
  };

  // Edit
  const handleEdit = (cat) => {
    setEditId(cat.id);
    setEditSuperSubCategory(cat.super_sub_category);
  };

  // Update
  const handleUpdate = async () => {
    try {
      await axios.put(`${API}/super_sub_categories/${editId}`, {
        super_sub_category: editSuperSubCategory,
      });
      setEditId(null);
      setEditSuperSubCategory("");
      fetchSuperSubCategories();
    } catch (error) {
      console.error("Error updating super sub category:", error);
    }
  };

  return (
    <div className="container mt-5">
      <div className="mb-3">
        {!showNewInput ? (
          <button
            className="btn btn-success"
            onClick={() => setShowNewInput(true)}
          >
            + New
          </button>
        ) : (
          <div className="d-flex">
            <input
              type="text"
              className="form-control me-2"
              placeholder="Enter new super sub category"
              value={newSuperSubCategory}
              onChange={(e) => setNewSuperSubCategory(e.target.value)}
            />
            <button
              className="btn btn-primary me-2"
              onClick={handleAddSuperSubCategory}
            >
              Save
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setShowNewInput(false)}
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      <h5 className="mt-4 mb-3">All Super Sub Categories</h5>
      <table className="table table-bordered table-striped">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Super Sub Category Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {superSubCategories.map((cat) => (
            <tr key={cat.id}>
              <td>{cat.id}</td>
              <td>
                {editId === cat.id ? (
                  <input
                    type="text"
                    value={editSuperSubCategory}
                    className="form-control"
                    onChange={(e) => setEditSuperSubCategory(e.target.value)}
                  />
                ) : (
                  cat.super_sub_category
                )}
              </td>
              <td>
                {editId === cat.id ? (
                  <>
                    <button
                      className="btn btn-sm btn-success me-2"
                      onClick={handleUpdate}
                    >
                      Update
                    </button>
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => setEditId(null)}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="btn btn-sm btn-warning me-2"
                      onClick={() => handleEdit(cat)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(cat.id)}
                    >
                      Delete
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default SuperSubCategoryForm;
