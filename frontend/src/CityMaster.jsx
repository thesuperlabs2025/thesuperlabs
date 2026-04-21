import React, { useEffect, useState } from "react";
import axios from "axios";

const API = process.env.REACT_APP_API_URL;

function CityMaster() {
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  const [stateId, setStateId] = useState("");
  const [newCity, setNewCity] = useState("");

  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    axios.get(`${API}/countries`)
      .then(res => setCountries(res.data));
  }, []);

  const fetchStates = async (countryId) => {
    setStates([]);
    setCities([]);
    setStateId("");
    const res = await axios.get(`${API}/states/${countryId}`);
    setStates(res.data);
  };

  const fetchCities = async (stateId) => {
    const res = await axios.get(`${API}/cities/${stateId}`);
    setCities(res.data);
  };

  const addCity = async () => {
    if (!newCity || !stateId) return;

    await axios.post(`${API}/cities`, {
      name: newCity,
      state_id: stateId
    });

    setNewCity("");
    fetchCities(stateId);
  };

  const updateCity = async () => {
    await axios.put(`${API}/cities/${editId}`, {
      name: editName,
      state_id: stateId
    });

    setEditId(null);
    setEditName("");
    fetchCities(stateId);
  };

  const deleteCity = async (id) => {
    if (window.confirm("Delete this city?")) {
      await axios.delete(`${API}/cities/${id}`);
      fetchCities(stateId);
    }
  };

  return (
    <div className="container mt-5">
      <h4>City Master</h4>

      {/* Country Dropdown */}
      <select
        className="form-select mb-2"
        onChange={e => fetchStates(e.target.value)}
      >
        <option value="">Select Country</option>
        {countries.map(c => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>

      {/* State Dropdown */}
      <select
        className="form-select mb-2"
        value={stateId}
        onChange={e => {
          setStateId(e.target.value);
          fetchCities(e.target.value);
        }}
      >
        <option value="">Select State</option>
        {states.map(s => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>

      {/* Add City */}
      <div className="d-flex mb-3">
        <input
          className="form-control me-2"
          value={newCity}
          onChange={e => setNewCity(e.target.value)}
          placeholder="New City"
        />
        <button className="btn btn-success" onClick={addCity}>
          Add
        </button>
      </div>

      {/* City Table */}
      <table className="table table-bordered">
        <tbody>
          {cities.map(c => (
            <tr key={c.id}>
              <td>
                {editId === c.id ? (
                  <input
                    className="form-control"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                  />
                ) : (
                  c.name
                )}
              </td>
              <td width="180">
                {editId === c.id ? (
                  <>
                    <button className="btn btn-sm btn-success me-2" onClick={updateCity}>Save</button>
                    <button className="btn btn-sm btn-secondary" onClick={() => setEditId(null)}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button
                      className="btn btn-sm btn-warning me-2"
                      onClick={() => {
                        setEditId(c.id);
                        setEditName(c.name);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => deleteCity(c.id)}
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

export default CityMaster;
