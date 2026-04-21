import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const API = process.env.REACT_APP_API_URL;

function CountryMaster() {
  const [countries, setCountries] = useState([]);
  const [newCountry, setNewCountry] = useState("");
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    const res = await axios.get(`${API}/countries`);
    setCountries(res.data);
  };

  const addCountry = async () => {
    if (!newCountry.trim()) return;

    const duplicate = countries.find(
      c => c.name.toLowerCase() === newCountry.toLowerCase()
    );
    if (duplicate) return alert("Country already exists");

    await axios.post(`${API}/countries`, { name: newCountry });
    setNewCountry("");
    fetchCountries();
  };

  const updateCountry = async () => {
    await axios.put(`${API}/countries/${editId}`, { name: editName });
    setEditId(null);
    fetchCountries();
  };

  const deleteCountry = async (id) => {
    if (window.confirm("Delete this country?")) {
      await axios.delete(`${API}/countries/${id}`);
      fetchCountries();
    }
  };

  return (
    <div className="container mt-5">
      <h4>Country Master</h4>

      <div className="d-flex mb-3">
        <input
          className="form-control me-2"
          placeholder="New Country"
          value={newCountry}
          onChange={e => setNewCountry(e.target.value)}
        />
        <button className="btn btn-success" onClick={addCountry}>Add</button>
      </div>

      <table className="table table-bordered">
        <thead className="table-dark">
          <tr>
            <th>ID</th><th>Name</th><th>Action</th>
          </tr>
        </thead>
        <tbody>
          {countries.map(c => (
            <tr key={c.id}>
              <td>{c.id}</td>
              <td>
                {editId === c.id ? (
                  <input
                    className="form-control"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                  />
                ) : c.name}
              </td>
              <td>
                {editId === c.id ? (
                  <>
                    <button className="btn btn-success btn-sm me-2" onClick={updateCountry}>Save</button>
                    <button className="btn btn-secondary btn-sm" onClick={() => setEditId(null)}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button className="btn btn-warning btn-sm me-2" onClick={() => { setEditId(c.id); setEditName(c.name); }}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => deleteCountry(c.id)}>Delete</button>
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

export default CountryMaster;
