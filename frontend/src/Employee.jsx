import React, { useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const API = process.env.REACT_APP_API_URL;

function CreateEmployee() {
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

  // ✅ Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setValues((prev) => ({ ...prev, image: file }));
      setPreview(URL.createObjectURL(file));
    }
  };

  // ✅ Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    Object.entries(values).forEach(([key, val]) => {
      formData.append(key, val);
    });

    try {
      await axios.post(`${API}/employees`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("✅ Employee added successfully!");
      setTimeout(() => navigate("/employeemy"), 1500);
    } catch (err) {
      console.error("Error saving employee:", err);
      toast.error("❌ Failed to save employee!");
    }
  };

  return (
    <div className="container mt-5">
      <ToastContainer />
      <h2>Create Employee</h2>
      <p className="text-muted mb-3">Enter employee details below.</p>

      <form onSubmit={handleSubmit} className="shadow-lg rounded-3 p-4 mb-4">
        <div className="row mb-3">
          <div className="col-md-6">
            <label>Employee Name</label>
            <input
              type="text"
              name="employee_name"
              className="form-control"
              value={values.employee_name}
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
              value={values.mobile}
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
              value={values.email}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-6">
            <label>Aadhar No</label>
            <input
              type="text"
              name="aadhar_no"
              className="form-control"
              value={values.aadhar_no}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="mb-3">
          <label>Address</label>
          <textarea
            name="address"
            className="form-control"
            value={values.address}
            onChange={handleChange}
          ></textarea>
        </div>

        <div className="mb-3">
          <label>Upload Image</label>
          <input
            type="file"
            className="form-control"
            accept="image/*"
            onChange={handleImageChange}
          />
          {preview && (
            <img
              src={preview}
              alt="preview"
              className="img-thumbnail mt-2"
              style={{ width: "150px", height: "150px", objectFit: "cover" }}
            />
          )}
        </div>

        <div className="d-flex justify-content-end mt-3">
          <button type="submit" className="btn btn-success">
            Save Employee
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateEmployee;
