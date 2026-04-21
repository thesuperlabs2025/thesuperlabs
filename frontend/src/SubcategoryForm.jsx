import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
const API = process.env.REACT_APP_API_URL;

function SubCategoryForm() {
  const [subCategories, setSubCategories] = useState([]);
  const [newSubCategory, setNewSubCategory] = useState("");
  const [showNewInput, setShowNewInput] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editSubCategory, setEditSubCategory] = useState("");

  useEffect(() => {
    fetchSubCategories();
  }, []);

  // Fetch data from backend
  const fetchSubCategories = async () => {
    try {
      const res = await axios.get(`${API}/sub_categories`);
      setSubCategories(res.data);
    } catch (error) {
      console.error("Error fetching sub categories:", error);
    }
  };

  // Add new sub category (with duplicate check)
  const handleAddSubCategory = async () => {
    const trimmed = newSubCategory.trim();
    if (trimmed === "") return;

    // ✅ Check duplicate from already fetched list
    const duplicate = subCategories.find(
      (item) => item.sub_category.toLowerCase() === trimmed.toLowerCase()
    );

    if (duplicate) {
      alert("⚠️ Sub Category already exists!");
      return;
    }

    try {
      await axios.post(`${API}/sub_categories`, {
        sub_category: trimmed,
      });

      setNewSubCategory("");
      setShowNewInput(false);
      fetchSubCategories();
    } catch (err) {
      alert("❌ Something went wrong while adding sub category!");
      console.error("Error adding sub category:", err);
    }
  };

  // Delete sub category
// ✅ Delete Sub Category
const handleDelete = async (id) => {
  if (window.confirm("Are you sure you want to delete this sub category?")) {
    try {
      await axios.delete(`${API}/sub_categories/${id}`);
      fetchSubCategories();
    } catch (error) {
      console.error("Error deleting sub category:", error);
      alert("❌ Failed to delete sub category. Please try again.");
    }
  }
};

// ✅ Edit Sub Category
const handleEdit = (cat) => {
  setEditId(cat.id);
  setEditSubCategory(cat.sub_category);
};

// ✅ Update Sub Category
const handleUpdate = async () => {
  if (!editSubCategory.trim()) {
    alert("⚠️ Sub Category name cannot be empty!");
    return;
  }

  try {
  await axios.put(`${API}/sub_categories/${editId}`, {
  sub_category: editSubCategory,
});

    setEditId(null);
    setEditSubCategory("");
    fetchSubCategories();
    alert("✅ Sub Category updated successfully!");
  } catch (error) {
    console.error("Error updating sub category:", error);
    alert("❌ Failed to update sub category. Please try again.");
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
              placeholder="Enter new sub category"
              value={newSubCategory}
              onChange={(e) => setNewSubCategory(e.target.value)}
            />
            <button
              className="btn btn-primary me-2"
              onClick={handleAddSubCategory}
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

      <h5 className="mt-4 mb-3">All Sub Categories</h5>
      <table className="table table-bordered table-striped">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Sub Category Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {subCategories.map((cat) => (
            <tr key={cat.id}>
              <td>{cat.id}</td>
              <td>
                {editId === cat.id ? (
                  <input
                    type="text"
                    value={editSubCategory}
                    className="form-control"
                    onChange={(e) => setEditSubCategory(e.target.value)}
                  />
                ) : (
                  cat.sub_category
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

export default SubCategoryForm;
