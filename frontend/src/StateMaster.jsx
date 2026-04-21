import React, { useEffect, useState } from "react";
import axios from "axios";

const API = process.env.REACT_APP_API_URL;

function StateMaster() {
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [countryId, setCountryId] = useState("");
  const [newState, setNewState] = useState("");
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    axios.get(`${API}/countries`).then(res => setCountries(res.data));
  }, []);

  const fetchStates = async (cid) => {
    const res = await axios.get(`${API}/states/${cid}`);
    setStates(res.data);
  };

  const addState = async () => {
    if (!newState || !countryId) return;

    const duplicate = states.find(
      s => s.name.toLowerCase() === newState.toLowerCase()
    );
    if (duplicate) return alert("State already exists");

    await axios.post(`${API}/states`, {
      name: newState,
      country_id: countryId
    });
    setNewState("");
    fetchStates(countryId);
  };

  const updateState = async () => {
    await axios.put(`${API}/states/${editId}`, {
      name: editName,
      country_id: countryId
    });
    setEditId(null);
    fetchStates(countryId);
  };

  const deleteState = async (id) => {
    if (window.confirm("Delete this state?")) {
      await axios.delete(`${API}/states/${id}`);
      fetchStates(countryId);
    }
  };

  return (
    <div className="container mt-5">
      <h4>State Master</h4>

      <select className="form-select mb-3" onChange={e => {
        setCountryId(e.target.value);
        fetchStates(e.target.value);
      }}>
        <option value="">Select Country</option>
        {countries.map(c => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>

      <div className="d-flex mb-3">
        <input
          className="form-control me-2"
          placeholder="New State"
          value={newState}
          onChange={e => setNewState(e.target.value)}
        />
        <button className="btn btn-success" onClick={addState}>Add</button>
      </div>

      <table className="table table-bordered">
        <tbody>
          {states.map(s => (
            <tr key={s.id}>
              <td>
                {editId === s.id ? (
                  <input value={editName} onChange={e => setEditName(e.target.value)} />
                ) : s.name}
              </td>
              <td>
                {editId === s.id ? (
                  <>
                    <button onClick={updateState}>Save</button>
                    <button onClick={() => setEditId(null)}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => { setEditId(s.id); setEditName(s.name); }}>Edit</button>
                    <button onClick={() => deleteState(s.id)}>Delete</button>
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

export default StateMaster;
