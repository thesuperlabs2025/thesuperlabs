import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const API = process.env.REACT_APP_API_URL;

function AgentForm() {
    const [agents, setAgents] = useState([]);
    const [showNewInput, setShowNewInput] = useState(false);

    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);

    const [newAgent, setNewAgent] = useState({
        agent_name: "",
        agent_percent: "",
        address: "",
        country_id: "",
        country: "",
        state_id: "",
        state: "",
        city_id: "",
        city: "",
        pincode: ""
    });

    const [editId, setEditId] = useState(null);
    const [editAgent, setEditAgent] = useState({});

    useEffect(() => {
        fetchAgents();
        fetchCountries();
    }, []);

    const fetchAgents = async () => {
        try {
            const res = await axios.get(`${API}/agents`);
            setAgents(res.data);
        } catch (err) {
            console.error("Error fetching agents:", err);
        }
    };

    const fetchCountries = async () => {
        try {
            const res = await axios.get(`${API}/countries`);
            setCountries(res.data);
        } catch (err) {
            console.error("Error fetching countries:", err);
        }
    };

    // const handleCountryChange = async (e) => {
    //     const countryId = Number(e.target.value);
    //     const selected = countries.find(c => c.id === countryId);

    //     setNewAgent(prev => ({
    //         ...prev,
    //         country_id: countryId,
    //         country: selected?.name || "",
    //         state_id: "",
    //         state: "",
    //         city_id: "",
    //         city: ""
    //     }));

    //     setStates([]);
    //     setCities([]);

    //     if (!countryId) return;

    //     const res = await axios.get(`${API}/api/states/${countryId}`);
    //     setStates(res.data);
    // };


    // const handleStateChange = async (e) => {
    //     const stateId = Number(e.target.value);
    //     const selected = states.find(s => s.id === stateId);

    //     setNewAgent(prev => ({
    //         ...prev,
    //         state_id: stateId,
    //         state: selected?.name || "",
    //         city_id: "",
    //         city: ""
    //     }));

    //     setCities([]);

    //     if (!stateId) return;

    //     const res = await axios.get(`${API}/api/cities/${stateId}`);
    //     setCities(res.data);
    // };


    const handleAddAgent = async () => {
        if (!newAgent.agent_name.trim()) return;

        const duplicate = agents.find(
            (a) => a.agent_name.toLowerCase() === newAgent.agent_name.trim().toLowerCase()
        );
        if (duplicate) {
            alert("⚠️ Agent already exists!");
            return;
        }

        try {
            await axios.post(`${API}/agents`, newAgent);
            console.log("POST PAYLOAD:", newAgent);

            setNewAgent({
                agent_name: "",
                agent_percent: "",
                address: "",
                country_id: "",
                country: "",
                state_id: "",
                state: "",
                city_id: "",
                city: "",
                pincode: ""
            });

            setStates([]);
            setCities([]);
            setShowNewInput(false);
            fetchAgents();
        } catch (err) {
            alert("❌ Error adding agent!");
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure to delete this agent?")) {
            try {
                await axios.delete(`${API}/agents/${id}`);
                fetchAgents();
            } catch (err) {
                console.error(err);
            }
        }
    };

    const handleEdit = async (agent) => {
        setEditId(agent.id);

        // find country id from name
        const countryObj = countries.find(c => c.name === agent.country);

        let statesRes = [];
        let citiesRes = [];

        if (countryObj) {
            statesRes = (await axios.get(`${API}/states/${countryObj.id}`)).data;
        }

        const stateObj = statesRes.find(s => s.name === agent.state);

        if (stateObj) {
            citiesRes = (await axios.get(`${API}/cities/${stateObj.id}`)).data;
        }

        const cityObj = citiesRes.find(c => c.name === agent.city);

        setStates(statesRes);
        setCities(citiesRes);

        setEditAgent({
            ...agent,
            country_id: countryObj?.id || "",
            state_id: stateObj?.id || "",
            city_id: cityObj?.id || ""
        });
    };


    const handleUpdate = async () => {
        try {
            await axios.put(`${API}/agents/${editId}`, editAgent);
            setEditId(null);
            setEditAgent({});
            setStates([]);
            setCities([]);
            fetchAgents();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="container mt-5">
            <h4 className="mb-4 text-center">Agent Master (CRUD + Inline Add)</h4>

            {/* Add Agent Form */}
            <div className="mb-3">
                {!showNewInput ? (
                    <button className="btn btn-success" onClick={() => setShowNewInput(true)}>
                        + New Agent
                    </button>
                ) : (
                    <div className="card p-3 mb-3">
                        <input
                            type="text"
                            className="form-control mb-2"
                            placeholder="Agent Name"
                            value={newAgent.agent_name}
                            onChange={(e) => setNewAgent({ ...newAgent, agent_name: e.target.value })}
                        />
                        <input
                            type="number"
                            className="form-control mb-2"
                            placeholder="Agent Percent"
                            value={newAgent.agent_percent}
                            onChange={(e) => setNewAgent({ ...newAgent, agent_percent: e.target.value })}
                        />
                        <input
                            type="text"
                            className="form-control mb-2"
                            placeholder="Address"
                            value={newAgent.address}
                            onChange={(e) => setNewAgent({ ...newAgent, address: e.target.value })}
                        />

                        <select
                            className="form-control"
                            value={newAgent.country_id}
                            onChange={(e) => {
                                const countryId = Number(e.target.value);
                                const selected = countries.find(c => c.id === countryId);

                                setNewAgent(prev => ({
                                    ...prev,
                                    country_id: countryId,
                                    country: selected?.name || "",
                                    state_id: "",
                                    state: "",
                                    city_id: "",
                                    city: ""
                                }));

                                setStates([]);
                                setCities([]);

                                if (countryId) {
                                    axios.get(`${API}/states/${countryId}`)
                                        .then(res => setStates(res.data));
                                }
                            }}
                        >
                            <option value="">Select Country</option>
                            {countries.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>


                        <select
                            className="form-control"
                            value={newAgent.state_id}
                            disabled={!states.length}
                            onChange={(e) => {
                                const stateId = Number(e.target.value);
                                const selected = states.find(s => s.id === stateId);

                                setNewAgent(prev => ({
                                    ...prev,
                                    state_id: stateId,
                                    state: selected?.name || "",
                                    city_id: "",
                                    city: ""
                                }));

                                setCities([]);

                                if (stateId) {
                                    axios.get(`${API}/cities/${stateId}`)
                                        .then(res => setCities(res.data));
                                }
                            }}
                        >
                            <option value="">Select State</option>
                            {states.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>

                        <select
                            className="form-control"
                            value={newAgent.city_id}
                            disabled={!cities.length}
                            onChange={(e) => {
                                const cityId = Number(e.target.value);
                                const selected = cities.find(c => c.id === cityId);

                                setNewAgent(prev => ({
                                    ...prev,
                                    city_id: cityId,
                                    city: selected?.name || ""
                                }));
                            }}
                        >
                            <option value="">Select City</option>
                            {cities.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>




                        <input
                            type="text"
                            className="form-control mb-2"
                            placeholder="Pincode"
                            value={newAgent.pincode}
                            onChange={(e) => setNewAgent({ ...newAgent, pincode: e.target.value })}
                        />

                        <button className="btn btn-primary me-2" onClick={handleAddAgent}>Save</button>
                        <button className="btn btn-secondary" onClick={() => setShowNewInput(false)}>Cancel</button>
                    </div>
                )}
            </div>

            {/* Agents Table */}
            <table className="table table-bordered table-striped">
                <thead className="table-dark">
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Percent</th>
                        <th>Address</th>
                        <th>Country</th>
                        <th>State</th>
                        <th>City</th>
                        <th>Pincode</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {agents.map((a) => (
                        <tr key={a.id}>
                            <td>{a.id}</td>
                            {editId === a.id ? (
                                <>
                                    <td><input className="form-control" value={editAgent.agent_name} onChange={e => setEditAgent({ ...editAgent, agent_name: e.target.value })} /></td>
                                    <td><input type="number" className="form-control" value={editAgent.agent_percent} onChange={e => setEditAgent({ ...editAgent, agent_percent: e.target.value })} /></td>
                                    <td><input className="form-control" value={editAgent.address} onChange={e => setEditAgent({ ...editAgent, address: e.target.value })} /></td>

                                    <td>
                                        <select
                                            className="form-control"
                                            value={editAgent.country_id || ""}
                                            onChange={(e) => {
                                                const countryId = Number(e.target.value);
                                                const selected = countries.find(c => c.id === countryId);

                                                setEditAgent(prev => ({
                                                    ...prev,
                                                    country_id: countryId,
                                                    country: selected?.name || "",
                                                    state_id: "",
                                                    state: "",
                                                    city_id: "",
                                                    city: ""
                                                }));

                                                setStates([]);
                                                setCities([]);

                                                if (countryId) {
                                                    axios.get(`${API}/states/${countryId}`)
                                                        .then(res => setStates(res.data));
                                                }
                                            }}
                                        >
                                            <option value="">Select Country</option>
                                            {countries.map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>


                                    </td>

                                    <td>
                                        <select
                                            className="form-control"
                                            value={editAgent.state_id || ""}
                                            disabled={!states.length}
                                            onChange={(e) => {
                                                const stateId = Number(e.target.value);
                                                const selected = states.find(s => s.id === stateId);

                                                setEditAgent(prev => ({
                                                    ...prev,
                                                    state_id: stateId,
                                                    state: selected?.name || "",
                                                    city_id: "",
                                                    city: ""
                                                }));

                                                setCities([]);

                                                if (stateId) {
                                                    axios.get(`${API}/cities/${stateId}`)
                                                        .then(res => setCities(res.data));
                                                }
                                            }}
                                        >
                                            <option value="">Select State</option>
                                            {states.map(s => (
                                                <option key={s.id} value={s.id}>{s.name}</option>
                                            ))}
                                        </select>



                                    </td>

                                    <td>
                                        <select
                                            className="form-control"
                                            value={editAgent.city_id || ""}
                                            disabled={!cities.length}
                                            onChange={(e) => {
                                                const cityId = Number(e.target.value);
                                                const selected = cities.find(c => c.id === cityId);

                                                setEditAgent(prev => ({
                                                    ...prev,
                                                    city_id: cityId,
                                                    city: selected?.name || ""
                                                }));
                                            }}
                                        >
                                            <option value="">Select City</option>
                                            {cities.map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>




                                    </td>

                                    <td><input className="form-control" value={editAgent.pincode} onChange={e => setEditAgent({ ...editAgent, pincode: e.target.value })} /></td>

                                    <td>
                                        <button className="btn btn-sm btn-success me-2" onClick={handleUpdate}>Update</button>
                                        <button className="btn btn-sm btn-secondary" onClick={() => setEditId(null)}>Cancel</button>
                                    </td>
                                </>
                            ) : (
                                <>
                                    <td>{a.agent_name}</td>
                                    <td>{a.agent_percent}%</td>
                                    <td>{a.address}</td>
                                    <td>{a.country}</td>
                                    <td>{a.state || a.state_id}</td>
                                    <td>{a.city || a.city_id}</td>
                                    <td>{a.pincode}</td>
                                    <td>
                                        <button className="btn btn-sm btn-warning me-2" onClick={() => handleEdit(a)}>Edit</button>
                                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(a.id)}>Delete</button>
                                    </td>
                                </>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default AgentForm;
