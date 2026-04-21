import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
const API = process.env.REACT_APP_API_URL;

function CategoryForm() {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [showNewInput, setShowNewInput] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editCategory, setEditCategory] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API}/categories`);
      setCategories(res.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // ✅ Fixed duplication + error handling logic
  const handleAddCategory = async () => {
    if (newCategory.trim() === "") return;

    // Check duplicate from fetched categories
    const duplicate = categories.find(
      (cat) => cat.category.toLowerCase() === newCategory.trim().toLowerCase()
    );

    if (duplicate) {
      alert("⚠️ Category already exists!");
      return;
    }

    try {
      const res = await axios.post(`${API}/categories`, {
        category: newCategory,
      });

      if (res.status === 201 || res.status === 200) {
        setNewCategory("");
        setShowNewInput(false);
        fetchCategories();
      } else {
        alert("⚠️ Failed to add category. Please try again!");
      }
    } catch (err) {
      console.error("❌ Error adding category:", err);
      alert(
        err.response?.data?.message ||
          "❌ Something went wrong while adding category!"
      );
    }
  }; // ✅ Missing brace added here

 // 🗑️ Delete category
const handleDelete = async (id) => {
  if (window.confirm("Are you sure you want to delete this category?")) {
    try {
      const res = await axios.delete(`${API}/categories/${id}`);

      if (res.status === 200) {
        alert("🗑️ Category deleted successfully!");
        fetchCategories();
      } else {
        alert("⚠️ Failed to delete category. Please try again.");
      }
    } catch (error) {
      console.error("❌ Error deleting category:", error);
      alert(
        error.response?.data?.message ||
          "❌ Something went wrong while deleting the category."
      );
    }
  }
};

// ✏️ Edit mode handler
const handleEdit = (cat) => {
  setEditId(cat.id);
  setEditCategory(cat.category);
};

// 💾 Update category
const handleUpdate = async () => {
  if (editCategory.trim() === "") {
    alert("⚠️ Category name cannot be empty!");
    return;
  }

  try {
    const res = await axios.put(
      `${API}/categories/${editId}`,
      { category: editCategory }
    );

    if (res.status === 200) {
      alert("✅ Category updated successfully!");
      setEditId(null);
      setEditCategory("");
      fetchCategories();
    } else {
      alert("⚠️ Failed to update category. Please try again.");
    }
  } catch (error) {
    console.error("❌ Error updating category:", error);
    alert(
      error.response?.data?.message ||
        "❌ Something went wrong while updating the category."
    );
  }
};


  return (
    <div className="container mt-5">
    
      <div className="mb-3">
        <div className="d-flex">
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
                placeholder="Enter new category"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
              <button className="btn btn-primary me-2" onClick={handleAddCategory}>
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
      </div>

      <h5 className="mt-4 mb-3">All Categories</h5>
      <table className="table table-bordered table-striped">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Category Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat) => (
            <tr key={cat.id}>
              <td>{cat.id}</td>
              <td>
                {editId === cat.id ? (
                  <input
                    type="text"
                    value={editCategory}
                    className="form-control"
                    onChange={(e) => setEditCategory(e.target.value)}
                  />
                ) : (
                  cat.category
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

export default CategoryForm;
