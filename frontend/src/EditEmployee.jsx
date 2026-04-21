import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const API = process.env.REACT_APP_API_URL;

function EditEmployee() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [values, setValues] = useState({
    employee_name: "",
    mobile: "",
    email: "",
    address: "",
    aadhar_no: "",
    image: null,
  });

  const [preview, setPreview] = useState(null);
  const [existingImage, setExistingImage] = useState(null);

  // ✅ Fetch existing employee data
useEffect(() => {
  axios
    .get(`${API}/employees/${id}`)
    .then((res) => {
      setValues(res.data);
      setExistingImage(res.data.image);
    })
    .catch((err) => console.error("Error fetching employee:", err));
}, [id]);
// ✅ Runs only once when component mounts or id changes

  // ✅ Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Handle new image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setValues((prev) => ({ ...prev, image: file }));
      setPreview(URL.createObjectURL(file));
    }
  };

  // ✅ Submit updated data
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    Object.entries(values).forEach(([key, val]) => {
      formData.append(key, val);
    });

    try {
      await axios.put(`${API}/employees/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("✅ Employee updated successfully!");
      setTimeout(() => navigate("/employeemy"), 1500);
    } catch (err) {
      console.error("Error updating employee:", err);
      toast.error("❌ Failed to update employee!");
    }
  };

  return (
    <div className="container mt-5">
      <ToastContainer />
      <h2>Edit Employee</h2>
      <form onSubmit={handleSubmit} className="shadow-lg p-4 rounded-3">
        <div className="row mb-3">
          <div className="col-md-6">
            <label>Employee Name</label>
            <input
              type="text"
              name="employee_name"
              className="form-control"
              value={values.employee_name || ""}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-6">
            <label>Mobile</label>
            <input
              type="text"
              name="mobile"
              className="form-control"
              value={values.mobile || ""}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-6">
            <label>Email</label>
            <input
              type="email"
              name="email"
              className="form-control"
              value={values.email || ""}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-6">
            <label>Aadhar No</label>
            <input
              type="text"
              name="aadhar_no"
              className="form-control"
              value={values.aadhar_no || ""}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="mb-3">
          <label>Address</label>
          <textarea
            name="address"
            className="form-control"
            value={values.address || ""}
            onChange={handleChange}
          ></textarea>
        </div>

        <div className="mb-3">
          <label>Upload New Image (optional)</label>
          <input
            type="file"
            className="form-control"
            accept="image/*"
            onChange={handleImageChange}
          />

          {/* 🖼️ Preview new image or show old image */}
          {preview ? (
            <img
              src={preview}
              alt="preview"
              className="img-thumbnail mt-2"
              style={{ width: "150px", height: "150px", objectFit: "cover" }}
            />
          ) : existingImage ? (
            <img
              src={`${API}/uploads/${existingImage}`}
              alt="existing"
              className="img-thumbnail mt-2"
              style={{ width: "150px", height: "150px", objectFit: "cover" }}
            />
          ) : null}
        </div>

        <div className="d-flex justify-content-end mt-3">
          <button type="submit" className="btn btn-success">
            Update Employee
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditEmployee;
