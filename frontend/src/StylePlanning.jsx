import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "bootstrap/dist/css/bootstrap.min.css";

const API = process.env.REACT_APP_API_URL;

const StylePlanning = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const selectedYear = JSON.parse(localStorage.getItem("selectedYear") || "{}");

    // Master Data
    const [sizeCharts, setSizeCharts] = useState([]);
    const [lifeCyclesMaster, setLifeCyclesMaster] = useState([]);
    const [bodyPartsMaster, setBodyPartsMaster] = useState([]);
    const [fabricsMaster, setFabricsMaster] = useState([]);
    const [yarnsStockMaster, setYarnsStockMaster] = useState([]);
    const [trimsMaster, setTrimsMaster] = useState([]);
    const [diaChartsMaster, setDiaChartsMaster] = useState([]);

    // Modal State
    const [showYarnModal, setShowYarnModal] = useState(false);
    const [activeFabricForYarn, setActiveFabricForYarn] = useState(null);
    const [tempYarnAssignments, setTempYarnAssignments] = useState([]);

    // Form State
    const [styleData, setStyleData] = useState({
        styleName: "",
        styleColor: "",
        sizeChartId: null,
        sizeChartName: "",
        selectedSizes: [],
        averageWeight: 0,
        status: "Planned"
    });

    const [totalAverageWeight, setTotalAverageWeight] = useState(0);
    const processingRows = useRef(new Set());
    const [fabricUsage, setFabricUsage] = useState({});
    const [imagePreview, setImagePreview] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);

    const [fabrics, setFabrics] = useState([
        { id: Date.now(), stylePart: "", fabricSku: "", fabricName: "", bodyPart: "", counts: "", sizeData: {}, gsm: "", dia: "", color: "", composition: "", fabricType: "Yarn", diaChartId: "", diaData: {} }
    ]);

    const [trims, setTrims] = useState([
        { id: Date.now(), trimsName: "", trimsSku: "", isSizable: "Non-Sizable", sizeData: {}, color: "" }
    ]);

    const [lifeCycle, setLifeCycle] = useState([
        { id: Date.now(), processName: "", type: "yarn", wastage: "" }
    ]);

    const [yarns, setYarns] = useState([]);

    const fetchSizeCharts = useCallback(async () => {
        try {
            const res = await axios.get(`${API}/size-charts`);
            const mapped = res.data.map(c => ({
                value: c.id,
                label: c.chart_name,
                sizes: c.size_values ? c.size_values.split(', ') : []
            }));
            setSizeCharts(mapped);
            return mapped;
        } catch (err) {
            console.error("Error fetching size charts:", err);
            return [];
        }
    }, []);

    const fetchLifeCycles = useCallback(async () => {
        try {
            const res = await axios.get(`${API}/life-cycles`);
            setLifeCyclesMaster(res.data);
        } catch (err) {
            console.error("Error fetching master life cycles:", err);
        }
    }, []);

    const fetchBodyParts = useCallback(async () => {
        try {
            const res = await axios.get(`${API}/body-parts`);
            setBodyPartsMaster(res.data.map(p => ({ value: p.part_name, label: p.part_name })));
        } catch (err) {
            console.error("Error fetching body parts:", err);
        }
    }, []);

    const fetchFabrics = useCallback(async () => {
        try {
            const res = await axios.get(`${API}/fabrics`);
            setFabricsMaster(res.data.map(f => ({
                value: f.id,
                label: f.fabric_name,
                fabric_sku: f.fabric_sku,
                counts: f.counts,
                gsm: f.gsm,
                dia: f.dia,
                dia_chart_id: f.dia_chart_id,
                dia_data: typeof f.dia_data === 'string' ? JSON.parse(f.dia_data) : (f.dia_data || {}),
                color: f.color,
                composition: f.composition
            })));
        } catch (err) {
            console.error("Error fetching fabrics:", err);
        }
    }, []);

    const fetchYarnStock = useCallback(async () => {
        try {
            const res = await axios.get(`${API}/yarn`);
            setYarnsStockMaster(res.data);
        } catch (err) {
            console.error("Error fetching yarn stock:", err);
        }
    }, []);

    const fetchTrims = useCallback(async () => {
        try {
            const res = await axios.get(`${API}/trims`);
            setTrimsMaster(res.data.map(t => ({
                value: t.id,
                label: t.trims_name,
                trims_sku: t.trims_sku,
                is_sizable: t.is_sizable ? "Sizable" : "Non-Sizable",
                color: t.color
            })));
        } catch (err) {
            console.error("Error fetching trims:", err);
        }
    }, []);

    const fetchDiaCharts = useCallback(async () => {
        try {
            const res = await axios.get(`${API}/dia-masters`);
            setDiaChartsMaster(res.data.map(d => ({ value: d.id, label: d.dia_name, size_chart_id: d.size_chart_id })));
        } catch (err) {
            console.error("Error fetching dia charts:", err);
        }
    }, []);

    const fetchFabricUsage = useCallback(async () => {
        try {
            const res = await axios.get(`${API}/style-planning/fabric-usage/check`);
            const usageMap = {};
            res.data.forEach(item => {
                usageMap[item.fabric_sku] = item.style_ids;
            });
            setFabricUsage(usageMap);
        } catch (err) {
            console.error("Error fetching fabric usage:", err);
        }
    }, []);


    const fetchStyleDetails = useCallback(async (charts) => {
        try {
            const res = await axios.get(`${API}/style-planning/${id}`);
            const data = res.data;

            const currentChart = charts.find(c => c.value === data.size_chart_id);
            const sizes = currentChart ? currentChart.sizes : [];

            if (data.style_image) {
                setImagePreview(`${API}/uploads/${data.style_image}`);
            }

            setStyleData({
                styleName: data.style_name,
                styleColor: data.style_color,
                sizeChartId: data.size_chart_id,
                sizeChartName: data.size_chart_name,
                selectedSizes: sizes,
                status: data.status || "Planned"
            });

            setFabrics(data.fabrics.map(f => ({
                id: f.id,
                stylePart: f.style_part || "",
                fabricSku: f.fabric_sku || "",
                fabricName: f.fabric_name || "",
                bodyPart: f.body_part || "",
                counts: f.counts || "",
                sizeData: typeof f.size_data === 'string' ? JSON.parse(f.size_data) : (f.size_data || {}),
                diaData: typeof f.dia_data === 'string' ? JSON.parse(f.dia_data) : (f.dia_data || {}),
                diaChartId: f.dia_chart_id || "",
                gsm: f.gsm || "",
                dia: f.dia || "",
                color: f.color || "",
                composition: f.composition || "",
                fabricType: f.fabric_type || "Yarn"
            })));

            // Merge sizable trims back into single rows for UI
            const mergedTrims = [];
            const trimGroups = {};

            data.trims.forEach(t => {
                const key = `${t.trims_name}-${t.color}-${t.is_sizable}`;
                if (t.is_sizable === "Sizable") {
                    if (!trimGroups[key]) {
                        trimGroups[key] = {
                            id: t.id,
                            trimsName: t.trims_name || "",
                            trimsSku: t.trims_sku.split('-').slice(0, -1).join('-') || t.trims_sku, // remove -size if possible
                            isSizable: "Sizable",
                            sizeData: {},
                            color: t.color || ""
                        };
                        mergedTrims.push(trimGroups[key]);
                    }
                    const sizeData = typeof t.size_data === 'string' ? JSON.parse(t.size_data) : (t.size_data || {});
                    Object.assign(trimGroups[key].sizeData, sizeData);
                } else {
                    mergedTrims.push({
                        id: t.id,
                        trimsName: t.trims_name || "",
                        trimsSku: t.trims_sku || "",
                        isSizable: t.is_sizable || "Non-Sizable",
                        sizeData: typeof t.size_data === 'string' ? JSON.parse(t.size_data) : (t.size_data || {}),
                        color: t.color || ""
                    });
                }
            });
            setTrims(mergedTrims);

            setYarns(data.yarns.map(y => ({
                id: y.id,
                fabricId: y.fabric_id_ref,
                fabricSku: y.fabric_sku || "",
                fabricName: y.fabric_name || "",
                yarnCounts: y.yarn_counts || "",
                yarnName: y.yarn_name || "",
                yarnColor: y.yarn_color || "",
                yarnConsumption: y.consumption || ""
            })));

            setLifeCycle(typeof data.life_cycle === 'string' ? JSON.parse(data.life_cycle) : (data.life_cycle || [
                { id: Date.now(), processName: "", type: "yarn", wastage: "" }
            ]));

        } catch (err) {
            console.error("Error fetching style details:", err);
            toast.error("Failed to load style details");
        }
    }, [id]);

    useEffect(() => {
        document.title = id ? "Edit Style Planning - TSL ERP" : "New Style Planning - TSL ERP";
        const load = async () => {
            const charts = await fetchSizeCharts();
            fetchLifeCycles();
            fetchBodyParts();
            fetchFabrics();
            fetchYarnStock();
            fetchDiaCharts();
            fetchFabricUsage();
            if (id) fetchStyleDetails(charts);
        };
        load();
    }, [id, fetchSizeCharts, fetchStyleDetails, fetchLifeCycles, fetchBodyParts, fetchFabrics, fetchYarnStock, fetchTrims, fetchDiaCharts, fetchFabricUsage]);

    useEffect(() => {
        const totalAvg = fabrics.reduce((sum, f) => {
            const values = styleData.selectedSizes.map(s => parseFloat(f.sizeData[s]) || 0);
            const rowAvg = styleData.selectedSizes.length > 0 ? values.reduce((a, b) => a + b, 0) / styleData.selectedSizes.length : 0;
            return sum + rowAvg;
        }, 0);
        setTotalAverageWeight(totalAvg.toFixed(3));
    }, [fabrics, styleData.selectedSizes]);

    const handleStyleChange = (e) => {
        const { name, value } = e.target;
        setStyleData(prev => ({ ...prev, [name]: value }));
    };

    const handleSizeChartChange = (selected) => {
        setStyleData(prev => ({
            ...prev,
            sizeChartId: selected.value,
            sizeChartName: selected.label,
            selectedSizes: selected.sizes
        }));

        const emptySizeData = {};
        selected.sizes.forEach(s => emptySizeData[s] = "");

        setFabrics(prev => prev.map(f => ({ ...f, sizeData: { ...emptySizeData } })));
        setTrims(prev => prev.map(t => ({ ...t, sizeData: { ...emptySizeData } })));
    };

    const addFabricRow = () => {
        const emptySizeData = {};
        styleData.selectedSizes.forEach(s => emptySizeData[s] = "");
        setFabrics(prev => [...prev, { id: Date.now(), stylePart: "", fabricSku: "", fabricName: "", bodyPart: "", counts: "", sizeData: emptySizeData, gsm: "", dia: "", color: "", composition: "", fabricType: "Yarn", diaChartId: "", diaData: {} }]);
    };

    const removeFabricRow = (rowId) => {
        setFabrics(prev => prev.filter(f => f.id !== rowId));
    };

    const generateFabricSku = (fabric) => {
        if (!fabric.fabricName) return "";
        const parts = [
            fabric.counts ? fabric.counts.replace(/\s+/g, '-') : "",
            fabric.fabricName.replace(/\s+/g, '-'),
            fabric.gsm ? fabric.gsm : "",
            fabric.dia ? fabric.dia : "",
            fabric.color ? fabric.color.replace(/\s+/g, '-') : ""
        ].filter(p => p !== "");
        return parts.join('-');
    };

    const handleFabricChange = (rowId, field, value, isSizeData = false, sizeLabel = null) => {
        setFabrics(prev => prev.map(f => {
            if (f.id === rowId) {
                let updatedFabric = { ...f };
                if (isSizeData) {
                    updatedFabric.sizeData = { ...f.sizeData, [sizeLabel]: value };
                } else if (typeof field === 'object') {
                    updatedFabric = { ...updatedFabric, ...field };
                } else if (field === "diaChartId") {
                    updatedFabric.diaChartId = value;
                    if (value && !processingRows.current.has(rowId)) {
                        processingRows.current.add(rowId);
                        axios.get(`${API}/dia-masters/${value}`)
                            .then(res => {
                                if (res.data && res.data.sizeData) {
                                    const sizeMappings = Object.entries(res.data.sizeData)
                                        .filter(([s, d]) => d && styleData.selectedSizes.includes(s));

                                    if (sizeMappings.length > 0) {
                                        // Check if all dias are the same
                                        const uniqueDias = [...new Set(sizeMappings.map(m => m[1]))];

                                        if (uniqueDias.length > 1) {
                                            // Split required
                                            const newRows = sizeMappings.map((mapping, idx) => {
                                                const [size, diaValue] = mapping;
                                                const newId = idx === 0 ? updatedFabric.id : Date.now() + idx + Math.random();
                                                // Create clean deep copy
                                                const newFabric = JSON.parse(JSON.stringify(updatedFabric));

                                                // Reset all sizes to 0 first, then set the active size
                                                Object.keys(newFabric.sizeData).forEach(s => {
                                                    newFabric.sizeData[s] = "0";
                                                });
                                                newFabric.sizeData[size] = updatedFabric.sizeData[size];

                                                newFabric.id = newId;
                                                newFabric.dia = diaValue;
                                                newFabric.diaChartId = value;
                                                newFabric.fabricSku = generateFabricSku(newFabric);

                                                // Duplicate yarns if it's a new row (skip index 0 as it keeps existing yarns)
                                                if (idx > 0) {
                                                    const existingYarns = yarns.filter(y => y.fabricId === updatedFabric.id);
                                                    if (existingYarns.length > 0) {
                                                        const newYarnAssignments = existingYarns.map(y => ({
                                                            ...y,
                                                            id: Date.now() + Math.random(),
                                                            fabricId: newId,
                                                            fabricSku: newFabric.fabricSku
                                                        }));
                                                        setYarns(prev => [...prev, ...newYarnAssignments]);
                                                    }
                                                }

                                                return newFabric;
                                            });

                                            setFabrics(curr => {
                                                const index = curr.findIndex(row => row.id === rowId);
                                                if (index === -1) return curr;
                                                const before = curr.slice(0, index);
                                                // Ensure we don't duplicate if already split - check if adjacent rows share SKU base
                                                const after = curr.slice(index + 1);
                                                return [...before, ...newRows, ...after];
                                            });
                                        } else {
                                            // Same dia for all, no split needed
                                            handleFabricChange(rowId, "dia", uniqueDias[0]);
                                        }
                                    } else {
                                        const firstDia = Object.values(res.data.sizeData).find(d => d) || "";
                                        handleFabricChange(rowId, "dia", firstDia);
                                    }
                                }
                            })
                            .finally(() => {
                                processingRows.current.delete(rowId);
                            });
                    }
                    return updatedFabric;
                } else {
                    updatedFabric[field] = value;
                }

                // Auto-generate SKU if name, counts, gsm, color, or dia changed
                if (!isSizeData && (field === "fabricName" || field === "counts" || field === "gsm" || field === "color" || field === "dia" || typeof field === 'object')) {
                    updatedFabric.fabricSku = generateFabricSku(updatedFabric);
                }

                return updatedFabric;
            }
            return f;
        }));
    };

    const addTrimsRow = () => {
        const emptySizeData = {};
        styleData.selectedSizes.forEach(s => emptySizeData[s] = "");
        setTrims(prev => [...prev, { id: Date.now(), trimsName: "", trimsSku: "", isSizable: "Non-Sizable", sizeData: emptySizeData, color: "" }]);
    };

    const removeTrimsRow = (rowId) => {
        setTrims(prev => prev.filter(t => t.id !== rowId));
    };

    const handleTrimsChange = (rowId, field, value, isSizeData = false, sizeLabel = null) => {
        setTrims(prev => prev.map(t => {
            if (t.id === rowId) {
                if (isSizeData) {
                    return { ...t, sizeData: { ...t.sizeData, [sizeLabel]: value } };
                }
                return { ...t, [field]: value };
            }
            return t;
        }));
    };

    const handleLifeCycleChange = (rowId, field, value) => {
        let formattedValue = value;
        if (field === "processName") {
            formattedValue = value.replace(/[^a-zA-Z\s]/g, "");
        } else if (field === "wastage") {
            formattedValue = value.replace(/[^0-9]/g, "");
        }

        setLifeCycle(prev => prev.map(p => p.id === rowId ? { ...p, [field]: formattedValue } : p));
    };

    const addLifeCycleRow = () => {
        setLifeCycle(prev => [...prev, { id: Date.now(), processName: "", type: "yarn", wastage: "" }]);
    };

    const removeLifeCycleRow = (rowId) => {
        setLifeCycle(prev => prev.filter(p => p.id !== rowId));
    };

    useEffect(() => {
        setYarns(prevYarns => {
            // Only keep yarns for fabrics that still exist
            const activeFabricIds = fabrics.map(f => f.id);
            const activeFabricSkus = fabrics.map(f => f.fabricSku).filter(sku => sku);

            return prevYarns.filter(y =>
                activeFabricIds.includes(y.fabricId) ||
                (y.fabricSku && activeFabricSkus.includes(y.fabricSku))
            ).map(y => {
                const f = fabrics.find(fb => fb.id === y.fabricId || (y.fabricSku && fb.fabricSku === y.fabricSku));
                return {
                    ...y,
                    fabricId: f ? f.id : y.fabricId,
                    fabricName: f ? f.fabricName : y.fabricName,
                    fabricSku: f ? f.fabricSku : y.fabricSku
                };
            });
        });
    }, [fabrics]);

    const handleYarnAssignClick = (fabric) => {
        setActiveFabricForYarn(fabric);
        const existing = yarns.filter(y => y.fabricId === fabric.id);
        if (existing.length > 0) {
            setTempYarnAssignments(existing.map(y => ({ ...y, id: y.id || Date.now() + Math.random() })));
        } else {
            setTempYarnAssignments([{ id: Date.now(), fabricId: fabric.id, fabricSku: fabric.fabricSku, fabricName: fabric.fabricName, yarnCounts: "", yarnName: "", yarnColor: "", yarnConsumption: "" }]);
        }
        setShowYarnModal(true);
    };

    const handleAddYarnRow = () => {
        setTempYarnAssignments(prev => [...prev, { id: Date.now(), fabricId: activeFabricForYarn.id, fabricSku: activeFabricForYarn.fabricSku, fabricName: activeFabricForYarn.fabricName, yarnCounts: "", yarnName: "", yarnColor: "", yarnConsumption: "" }]);
    };

    const handleRemoveYarnRow = (rowId) => {
        setTempYarnAssignments(prev => prev.filter(row => row.id !== rowId));
    };

    const handleTempYarnChange = (rowId, field, value) => {
        setTempYarnAssignments(prev => prev.map(y => y.id === rowId ? { ...y, [field]: value } : y));
    };

    const saveYarnAssignments = () => {
        const total = tempYarnAssignments.reduce((sum, y) => sum + (parseFloat(y.yarnConsumption) || 0), 0);
        if (total !== 100) {
            return toast.error(`Total consumption must be exactly 100%. Current: ${total}%`);
        }

        setYarns(prev => {
            const others = prev.filter(y => y.fabricId !== activeFabricForYarn.id);
            return [...others, ...tempYarnAssignments];
        });
        setShowYarnModal(false);
        toast.success("Yarn assigned successfully");
    };

    const handleSave = async () => {
        if (!styleData.styleName) return toast.error("Please enter style name");

        const processedFabrics = fabrics.map(f => {
            const values = styleData.selectedSizes.map(s => parseFloat(f.sizeData[s]) || 0);
            const rowAvg = styleData.selectedSizes.length > 0 ? values.reduce((a, b) => a + b, 0) / styleData.selectedSizes.length : 0;
            return { ...f, avgWeight: rowAvg.toFixed(3) };
        });

        if (selectedYear.is_closed) {
            toast.error("Error: This Accounting Year is locked and cannot be modified.");
            return;
        }

        const payload = { ...styleData, fabrics: processedFabrics, trims, yarns, lifeCycle, status: styleData.status, averageWeight: totalAverageWeight, year_id: selectedYear.year_id };

        const formData = new FormData();
        formData.append("data", JSON.stringify(payload));
        if (selectedFile) {
            formData.append("style_image", selectedFile);
        }

        try {
            if (id) {
                await axios.put(`${API}/style-planning/${id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success("Style Updated!");
            } else {
                const res = await axios.post(`${API}/style-planning`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success("Style Saved!");
                if (res.data.id) navigate(`/style-planning/${res.data.id}`);
            }
            setTimeout(() => {
                navigate("/style-planning-my");
            }, 2000);
        } catch (err) {
            console.error("Save error:", err);
            const msg = err.response?.data?.message || "Failed to save style planning";
            toast.error(msg);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const SectionHeader = ({ title, icon }) => (
        <div className="d-flex align-items-center mb-4 pb-2 border-bottom">
            <div className="bg-primary bg-opacity-10 p-2 rounded-3 text-primary me-3">
                <i className={`bi ${icon} fs-5`}></i>
            </div>
            <h5 className="fw-bold mb-0">{title}</h5>
        </div>
    );

    const isApprovedCurrent = styleData.status === 'Approved';

    return (
        <div className="min-vh-100 bg-light">
            <div className="bg-white border-bottom px-3 py-2 d-flex justify-content-between align-items-center sticky-top shadow-sm" style={{ zIndex: 1000 }}>
                <div className="d-flex align-items-center">
                    <button className="btn btn-sm btn-light me-2 rounded-circle border" onClick={() => navigate("/garments")}><i className="bi bi-chevron-left"></i></button>
                    <div>
                        <h5 className="mb-0 fw-bold text-primary">
                            <i className="bi bi-pencil-square me-2"></i>{id ? 'Edit Style Plan' : 'New Style Plan'}
                        </h5>
                        <small className="text-muted" style={{ fontSize: '0.75rem' }}>{id ? 'Update existing style details' : 'Create a new style plan'}</small>
                    </div>
                </div>
                <div className="d-flex align-items-center gap-3">
                    <div className="text-end me-2">
                        <span className="x-small text-uppercase opacity-75 fw-bold d-block mb-0 text-muted" style={{ fontSize: '0.6rem' }}>Selected Year</span>
                        <span className="fw-bold text-dark small">AY {selectedYear.year_name}</span>
                    </div>

                    <button className={`btn btn-sm btn-outline-secondary rounded-pill px-3 ${isApprovedCurrent ? 'd-none' : ''}`} onClick={() => navigate("/garments")}>Cancel</button>
                    {selectedYear.is_closed ? (
                        <div className="badge bg-danger px-3 py-2 rounded-pill shadow-sm">
                            <i className="bi bi-lock-fill me-1"></i>YEAR LOCKED
                        </div>
                    ) : (
                        <button className="btn btn-sm btn-primary rounded-pill px-4 fw-bold shadow-sm" onClick={handleSave}>
                            <i className="bi bi-save me-1"></i> Save Style
                        </button>
                    )}
                </div>
            </div>

            <div className="container-fluid py-3">
                <div className="row g-3 justify-content-center">
                    <div className="col-12 col-xxl-11">

                        {/* 1. Basic Info */}
                        <div className="card shadow-sm border-0 rounded-3 mb-3">
                            <div className="card-body p-3">
                                <SectionHeader title="Basic Information" icon="bi-info-circle-fill" />
                                <div className="row g-3">
                                    <div className="col-md-3">
                                        <label className="form-label fw-bold">Style Name</label>
                                        <input type="text" className="form-control" name="styleName" value={styleData.styleName} onChange={handleStyleChange} placeholder="Enter Style Name" readOnly={isApprovedCurrent} />
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label fw-bold">Style Color</label>
                                        <input type="text" className="form-control" name="styleColor" value={styleData.styleColor} onChange={handleStyleChange} placeholder="Enter Color" readOnly={isApprovedCurrent} />
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label fw-bold d-flex justify-content-between">
                                            Size Chart
                                            {!isApprovedCurrent && (
                                                <div className="btn-group btn-group-sm mb-1">
                                                    <button className="btn btn-outline-primary border-0 rounded-circle" onClick={() => window.open("/size-charts", "_blank")} title="Add New"><i className="bi bi-plus-lg"></i></button>
                                                    <button className="btn btn-outline-secondary border-0 rounded-circle" onClick={fetchSizeCharts} title="Refresh"><i className="bi bi-arrow-clockwise"></i></button>
                                                </div>
                                            )}
                                        </label>
                                        <Select
                                            options={sizeCharts}
                                            value={sizeCharts.find(c => c.value === styleData.sizeChartId)}
                                            onChange={handleSizeChartChange}
                                            placeholder="Select Size Chart"
                                            isDisabled={isApprovedCurrent}
                                            menuPortalTarget={document.body}
                                            styles={{
                                                control: (base) => ({
                                                    ...base,
                                                    borderRadius: '10px',
                                                    padding: '2px',
                                                    borderColor: '#dee2e6'
                                                }),
                                                menuPortal: base => ({ ...base, zIndex: 9999 })
                                            }}
                                        />
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label small fw-bold text-secondary">Life Cycle (Days)</label>
                                        <div className="input-group input-group-sm">
                                            <span className="input-group-text bg-light border-end-0"><i className="bi bi-calendar-event text-secondary"></i></span>
                                            <input
                                                type="number"
                                                className="form-control border-start-0 ps-0 fw-bold"
                                                value={lifeCycle.reduce((sum, p) => sum + (parseFloat(p.wastage) || 0), 0)} // Assuming wastage is days for now, or needs a dedicated field
                                                readOnly
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label small fw-bold text-secondary">Current Status</label>
                                        <div className="d-flex gap-2 align-items-center">
                                            <select
                                                className="form-select form-select-sm rounded-pill px-3 fw-bold border-2"
                                                value={styleData.status}
                                                onChange={(e) => {
                                                    let user = {};
                                                    try {
                                                        const stored = localStorage.getItem("user");
                                                        if (stored && stored !== "undefined") user = JSON.parse(stored);
                                                    } catch (e) { }
                                                    if (e.target.value === "Approved" && user.role !== "Admin") {
                                                        return toast.error("Only administrators can approve style planning");
                                                    }
                                                    handleStyleChange({ target: { name: "status", value: e.target.value } });
                                                }}
                                                style={{
                                                    width: '180px',
                                                    borderColor: styleData.status === 'Approved' ? '#22c55e' : styleData.status === 'Planned' ? '#f59e0b' : '#3b82f6',
                                                    color: styleData.status === 'Approved' ? '#22c55e' : styleData.status === 'Planned' ? '#f59e0b' : '#3b82f6'
                                                }}
                                            >
                                                <option value="Planned">🕒 Planned</option>
                                                <option value="Approved">✅ Approved</option>
                                                <option value="On Hold">⏸️ On Hold</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="col-md-3">
                                        <label className="form-label fw-bold small">Style Image / Ref</label>
                                        <div className="d-flex align-items-center gap-2">
                                            <input type="file" className="form-control form-control-sm" onChange={handleFileChange} accept="image/*" disabled={isApprovedCurrent} />
                                            {imagePreview && (
                                                <div className="position-relative">
                                                    <img src={imagePreview} alt="Preview" className="rounded border shadow-sm" style={{ width: '38px', height: '38px', objectFit: 'cover' }} />
                                                    {!isApprovedCurrent && (
                                                        <button
                                                            className="btn btn-danger btn-sm position-absolute top-0 start-100 translate-middle p-0 rounded-circle"
                                                            style={{ width: '16px', height: '16px', fontSize: '10px' }}
                                                            onClick={() => { setImagePreview(null); setSelectedFile(null); }}
                                                        >
                                                            <i className="bi bi-x"></i>
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. Fabric Planning */}
                        <div className={`card shadow-sm border-0 rounded-3 mb-3 ${!styleData.sizeChartId ? 'opacity-50 pointer-events-none' : ''}`}
                            style={!styleData.sizeChartId ? { pointerEvents: 'none', userSelect: 'none' } : {}}>
                            <div className="card-body p-3">
                                <SectionHeader title="Fabric Planning" icon="bi-layers-fill" />
                                {!styleData.sizeChartId && <div className="alert alert-warning py-2 mb-3 small"><i className="bi bi-exclamation-triangle me-2"></i>Please select a size chart first to enable fabric planning.</div>}
                                <div className="table-responsive rounded-3 border" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                                    <table className="table table-bordered table-hover align-middle mb-0 table-sm text-nowrap">
                                        <thead className="table-dark small fw-bold text-center sticky-top" style={{ zIndex: 5 }}>
                                            <tr>
                                                <th style={{ width: '40px' }}>#</th>
                                                <th style={{ width: '120px' }}>Style Part</th>
                                                <th style={{ width: '140px' }}>Fabric SKU</th>
                                                <th style={{ width: '250px' }}>Fabric Name</th>
                                                <th style={{ width: '140px' }}>Body Part</th>
                                                <th style={{ width: '100px' }}>Counts</th>
                                                <th style={{ width: '100px' }}>GSM</th>
                                                <th style={{ width: '100px' }}>Color</th>
                                                {styleData.selectedSizes.map(size => (
                                                    <th key={size} style={{ width: '90px' }} className="bg-primary bg-opacity-10 text-primary">{size}</th>
                                                ))}
                                                <th style={{ width: '90px' }}>Avg Wt (kg)</th>
                                                <th style={{ width: '160px' }}>Dia Master</th>
                                                <th style={{ width: '90px' }}>Dia</th>
                                                <th style={{ width: '150px' }}>Type</th>
                                                {!isApprovedCurrent && <th style={{ width: '50px' }}></th>}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {fabrics.map((f, index) => (
                                                <tr key={f.id}>
                                                    <td className="text-muted small">{index + 1}</td>
                                                    <td>
                                                        <select
                                                            className="form-select form-select-sm"
                                                            style={{ minWidth: '120px' }}
                                                            value={f.stylePart}
                                                            onChange={(e) => handleFabricChange(f.id, "stylePart", e.target.value)}
                                                            disabled={isApprovedCurrent}
                                                        >
                                                            <option value="">Select</option>
                                                            <option value="Top">Top</option>
                                                            <option value="Bottom">Bottom</option>
                                                        </select>
                                                    </td>
                                                    <td>
                                                        <input type="text" className="form-control form-control-sm bg-light" style={{ minWidth: '140px' }} value={f.fabricSku} readOnly placeholder="SKU" />
                                                    </td>
                                                    <td>
                                                        <div style={{ minWidth: '250px' }}>
                                                            <CreatableSelect
                                                                options={fabricsMaster}
                                                                value={fabricsMaster.find(m => m.label === f.fabricName) || (f.fabricName ? { value: f.fabricName, label: f.fabricName } : null)}
                                                                onChange={(selected) => {
                                                                    if (selected) {
                                                                        handleFabricChange(f.id, {
                                                                            fabricName: selected.label,
                                                                            fabricSku: selected.fabric_sku || "",
                                                                            counts: selected.counts || f.counts,
                                                                            gsm: selected.gsm || f.gsm,
                                                                            dia: selected.dia || f.dia,
                                                                            diaChartId: selected.dia_chart_id || f.diaChartId,
                                                                            diaData: selected.dia_data || f.diaData,
                                                                            color: selected.color || f.color,
                                                                            composition: selected.composition || f.composition
                                                                        });
                                                                    } else {
                                                                        handleFabricChange(f.id, { fabricName: "", fabricSku: "" });
                                                                    }
                                                                }}
                                                                placeholder="Search Fabric"
                                                                isClearable={!isApprovedCurrent}
                                                                isSearchable={!isApprovedCurrent}
                                                                isDisabled={isApprovedCurrent}
                                                                menuPortalTarget={document.body}
                                                                styles={{
                                                                    control: (base) => ({ ...base, borderRadius: '8px', borderColor: '#dee2e6', minHeight: '30px' }),
                                                                    valueContainer: (base) => ({ ...base, padding: '0 8px' }),
                                                                    input: (base) => ({ ...base, margin: '0px' }),
                                                                    indicatorsContainer: (base) => ({ ...base, height: '30px' }),
                                                                    menuPortal: base => ({ ...base, zIndex: 9999 })
                                                                }}
                                                            />
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div style={{ minWidth: '120px' }}>
                                                            <CreatableSelect
                                                                options={bodyPartsMaster}
                                                                value={bodyPartsMaster.find(m => m.value === f.bodyPart) || (f.bodyPart ? { value: f.bodyPart, label: f.bodyPart } : null)}
                                                                onChange={(selected) => handleFabricChange(f.id, "bodyPart", selected ? selected.value : "")}
                                                                placeholder="Search Part"
                                                                isClearable={!isApprovedCurrent}
                                                                isSearchable={!isApprovedCurrent}
                                                                isDisabled={isApprovedCurrent}
                                                                menuPortalTarget={document.body}
                                                                styles={{
                                                                    control: (base) => ({ ...base, borderRadius: '8px', borderColor: '#dee2e6', minHeight: '38px', fontSize: '1rem', fontWeight: 'bold' }),
                                                                    valueContainer: (base) => ({ ...base, padding: '0 8px' }),
                                                                    input: (base) => ({ ...base, margin: '0px' }),
                                                                    indicatorsContainer: (base) => ({ ...base, height: '38px' }),
                                                                    menuPortal: base => ({ ...base, zIndex: 9999 })
                                                                }}
                                                            />
                                                        </div>
                                                    </td>
                                                    <td><input type="text" className="form-control form-control-sm" style={{ minWidth: '100px' }} value={f.counts} onChange={(e) => handleFabricChange(f.id, "counts", e.target.value)} readOnly={isApprovedCurrent} /></td>
                                                    <td><input type="text" className="form-control form-control-sm text-center" style={{ minWidth: '100px' }} value={f.gsm} onChange={(e) => handleFabricChange(f.id, "gsm", e.target.value)} readOnly={isApprovedCurrent} /></td>
                                                    <td><input type="text" className="form-control form-control-sm" style={{ minWidth: '100px' }} value={f.color} onChange={(e) => handleFabricChange(f.id, "color", e.target.value)} readOnly={isApprovedCurrent} /></td>
                                                    {styleData.selectedSizes.map(size => (
                                                        <td key={size} style={{ minWidth: '70px' }}>
                                                            <input
                                                                type="text"
                                                                className="form-control text-center fw-bold text-primary"
                                                                style={{ fontSize: '1.1rem' }}
                                                                value={f.sizeData[size] || ""}
                                                                onChange={(e) => handleFabricChange(f.id, "sizeData", e.target.value, true, size)}
                                                                readOnly={isApprovedCurrent}
                                                            />
                                                        </td>
                                                    ))}
                                                    <td>
                                                        <input
                                                            type="text"
                                                            className="form-control text-center bg-light fw-bold text-dark"
                                                            style={{ minWidth: '90px', fontSize: '1.1rem' }}
                                                            value={((styleData.selectedSizes.map(s => parseFloat(f.sizeData[s]) || 0).reduce((a, b) => a + b, 0)) / (styleData.selectedSizes.length || 1)).toFixed(3)}
                                                            readOnly
                                                        />
                                                    </td>
                                                    <td>
                                                        <select
                                                            className="form-select form-select-sm"
                                                            style={{ minWidth: '160px' }}
                                                            value={f.diaChartId}
                                                            onChange={(e) => handleFabricChange(f.id, "diaChartId", e.target.value)}
                                                            disabled={isApprovedCurrent}
                                                        >
                                                            <option value="">Select Dia</option>
                                                            {diaChartsMaster
                                                                .filter(d => !d.size_chart_id || d.size_chart_id === styleData.sizeChartId)
                                                                .map(d => (
                                                                    <option key={d.value} value={d.value}>{d.label}</option>
                                                                ))}
                                                        </select>
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            className="form-control form-control-sm text-center"
                                                            style={{ minWidth: '90px' }}
                                                            value={f.dia}
                                                            onChange={(e) => handleFabricChange(f.id, "dia", e.target.value)}
                                                            readOnly={isApprovedCurrent}
                                                        />
                                                    </td>
                                                    <td>
                                                        <select className="form-select form-select-sm" style={{ minWidth: '150px' }} value={f.fabricType} onChange={(e) => handleFabricChange(f.id, "fabricType", e.target.value)} disabled={isApprovedCurrent}>
                                                            <option value="Yarn">Yarn</option>
                                                            <option value="Ready Fabric">Ready Fabric</option>
                                                        </select>
                                                    </td>
                                                    <td>{!isApprovedCurrent && <button className="btn btn-outline-danger btn-sm border-0" onClick={() => removeFabricRow(f.id)}><i className="bi bi-trash"></i></button>}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="d-flex justify-content-between align-items-center mt-3">
                                    {!isApprovedCurrent && (
                                        <button className="btn btn-primary btn-sm rounded-pill px-3" onClick={addFabricRow}>
                                            <i className="bi bi-plus-circle me-1"></i> Add Fabric
                                        </button>
                                    )}
                                    <div className="bg-primary bg-opacity-10 px-4 py-2 rounded-4 border border-primary border-opacity-25">
                                        <span className="text-primary fw-bold me-3 small text-uppercase">Total Average Weight (Pcs):</span>
                                        <span className="fs-5 fw-bold text-primary">{totalAverageWeight} kg</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 3. Yarn Planning */}
                        <div className={`card shadow-sm border-0 rounded-3 mb-3 overflow-hidden ${!styleData.sizeChartId ? 'opacity-50 pointer-events-none' : ''}`}
                            style={!styleData.sizeChartId ? { pointerEvents: 'none', userSelect: 'none' } : {}}>
                            <div className="card-body p-3">
                                <SectionHeader title="Yarn Consumption" icon="bi-record-circle-fill" />
                                <div className="table-responsive rounded-3 border" style={{ overflowX: 'auto' }}>
                                    <table className="table table-bordered align-middle table-sm mb-0">
                                        <thead className="table-light small fw-bold text-nowrap">
                                            <tr>
                                                <th className="py-2">Style Part</th>
                                                <th className="py-2">Fabric SKU</th>
                                                <th className="py-2">Base Fabric</th>
                                                <th className="py-2 text-center">Yarn Assign</th>
                                                <th className="py-2">Yarn Details</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(() => {
                                                const sortedFabrics = fabrics.filter(f => f.fabricName && f.fabricType === "Yarn")
                                                    .sort((a, b) => (a.stylePart || "").localeCompare(b.stylePart || ""));

                                                let lastStylePart = null;

                                                return sortedFabrics.map((f, idx) => {
                                                    const assignedYarns = yarns.filter(y => y.fabricId === f.id);

                                                    // Determine button color
                                                    let btnClass = "btn-outline-primary";
                                                    if (assignedYarns.length > 0) {
                                                        btnClass = "btn-success";
                                                    }

                                                    // Check if used in other styles
                                                    const styleIdsStr = fabricUsage[f.fabricSku];
                                                    if (styleIdsStr) {
                                                        const styleIds = styleIdsStr.split(',').map(Number);
                                                        const usedInOthers = id ? styleIds.some(sid => sid !== parseInt(id)) : styleIds.length > 0;
                                                        if (usedInOthers) {
                                                            btnClass = "btn-dark";
                                                        }
                                                    }

                                                    // Grouping Logic
                                                    const isNewGroup = f.stylePart !== lastStylePart;
                                                    const rowSpan = sortedFabrics.filter(sf => sf.stylePart === f.stylePart).length;
                                                    if (isNewGroup) lastStylePart = f.stylePart;

                                                    // Dynamic Style Part Colors
                                                    const getStylePartColor = (part) => {
                                                        if (!part) return { bg: '#f8f9fa', text: '#6c757d' }; // Default
                                                        const colors = [
                                                            { bg: '#e0f2fe', text: '#0369a1' }, // Sky Blue
                                                            { bg: '#dcfce7', text: '#15803d' }, // Green
                                                            { bg: '#fef3c7', text: '#b45309' }, // Amber
                                                            { bg: '#f3e8ff', text: '#7e22ce' }, // Purple
                                                            { bg: '#fee2e2', text: '#b91c1c' }, // Red
                                                            { bg: '#ffedd5', text: '#c2410c' }, // Orange
                                                        ];
                                                        let hash = 0;
                                                        for (let i = 0; i < part.length; i++) hash = part.charCodeAt(i) + ((hash << 5) - hash);
                                                        const index = Math.abs(hash) % colors.length;
                                                        return colors[index];
                                                    };
                                                    const partStyle = getStylePartColor(f.stylePart);

                                                    return (
                                                        <tr key={f.id}>
                                                            {isNewGroup && (
                                                                <td rowSpan={rowSpan} className="align-middle text-center fw-bold shadow-sm" style={{ width: '150px', backgroundColor: partStyle.bg, color: partStyle.text, borderRight: '1px solid #dee2e6' }}>
                                                                    <div className="d-flex flex-column align-items-center justify-content-center h-100 p-2">
                                                                        <i className="bi bi-layers-fill mb-2 fs-5 opacity-75"></i>
                                                                        <span className="text-uppercase small">{f.stylePart || "Unassigned"}</span>
                                                                    </div>
                                                                </td>
                                                            )}
                                                            <td className="bg-light fw-bold" style={{ minWidth: '150px' }}>{f.fabricSku}</td>
                                                            <td className="bg-light" style={{ minWidth: '180px' }}>{f.fabricName}</td>
                                                            <td className="text-center">
                                                                <button className={`btn btn-sm ${btnClass} rounded-pill px-3`} onClick={() => handleYarnAssignClick(f)}>
                                                                    <i className={`bi ${isApprovedCurrent ? 'bi-eye' : 'bi-plus-lg'} me-1`}></i> {isApprovedCurrent ? 'View Details' : 'Assign'}
                                                                </button>
                                                            </td>
                                                            <td style={{ minWidth: '300px' }}>
                                                                {assignedYarns.length > 0 ? (
                                                                    <div className="small">
                                                                        {assignedYarns.map((ay, idx) => (
                                                                            <div key={idx} className="mb-1 d-flex align-items-center">
                                                                                {ay.yarnCounts && <span className="badge bg-info-subtle text-info border me-1">{ay.yarnCounts}</span>}
                                                                                <span className="fw-bold">{ay.yarnName}</span>
                                                                                {ay.yarnColor && <span className="ms-1 text-muted">({ay.yarnColor})</span>}
                                                                                <span className="ms-auto fw-bold text-primary">{ay.yarnConsumption}%</span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-muted small">No yarns assigned</span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                });
                                            })()}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Yarn Assignment Modal */}
                        {showYarnModal && activeFabricForYarn && (
                            <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
                                <div className="modal-dialog modal-lg modal-dialog-centered">
                                    <div className="modal-content border-0 shadow-lg rounded-4">
                                        <div className="modal-header bg-dark text-white border-0 py-3">
                                            <h5 className="modal-title fw-bold">
                                                <i className="bi bi-record-circle me-2"></i>
                                                Assign Yarn for: {activeFabricForYarn.fabricName} ({activeFabricForYarn.fabricSku})
                                            </h5>
                                            <button type="button" className="btn-close btn-close-white" onClick={() => setShowYarnModal(false)}></button>
                                        </div>
                                        <div className="modal-body p-4">
                                            <div className="table-responsive">
                                                <table className="table table-bordered align-middle">
                                                    <thead className="small fw-bold bg-light">
                                                        <tr>
                                                            <th>Counts</th>
                                                            <th>Yarn Name</th>
                                                            <th>Color</th>
                                                            <th style={{ width: '150px' }}>Consumption %</th>
                                                            <th style={{ width: '50px' }}></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {tempYarnAssignments.map((ty) => (
                                                            <tr key={ty.id}>
                                                                <td>
                                                                    <CreatableSelect
                                                                        options={[...new Set(yarnsStockMaster.map(y => y.counts))].map(c => ({ value: c, label: c }))}
                                                                        value={ty.yarnCounts ? { value: ty.yarnCounts, label: ty.yarnCounts } : null}
                                                                        onChange={(sel) => handleTempYarnChange(ty.id, "yarnCounts", sel ? sel.value : "")}
                                                                        placeholder="Counts"
                                                                        className="small"
                                                                        isDisabled={isApprovedCurrent}
                                                                        menuPortalTarget={document.body}
                                                                        styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                                                    />
                                                                </td>
                                                                <td>
                                                                    <CreatableSelect
                                                                        options={[...new Set(yarnsStockMaster.map(y => y.yarn_name))].map(n => ({ value: n, label: n }))}
                                                                        value={ty.yarnName ? { value: ty.yarnName, label: ty.yarnName } : null}
                                                                        onChange={(sel) => handleTempYarnChange(ty.id, "yarnName", sel ? sel.value : "")}
                                                                        placeholder="Yarn Name"
                                                                        isDisabled={isApprovedCurrent}
                                                                        menuPortalTarget={document.body}
                                                                        styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                                                    />
                                                                </td>
                                                                <td>
                                                                    <CreatableSelect
                                                                        options={[...new Set(yarnsStockMaster.map(y => y.color))].map(c => ({ value: c, label: c }))}
                                                                        value={ty.yarnColor ? { value: ty.yarnColor, label: ty.yarnColor } : null}
                                                                        onChange={(sel) => handleTempYarnChange(ty.id, "yarnColor", sel ? sel.value : "")}
                                                                        placeholder="Color"
                                                                        isDisabled={isApprovedCurrent}
                                                                        menuPortalTarget={document.body}
                                                                        styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                                                    />
                                                                </td>
                                                                <td>
                                                                    <div className="input-group input-group-sm">
                                                                        <input
                                                                            type="number"
                                                                            className="form-control text-end"
                                                                            value={ty.yarnConsumption}
                                                                            onChange={(e) => handleTempYarnChange(ty.id, "yarnConsumption", e.target.value)}
                                                                            readOnly={isApprovedCurrent}
                                                                        />
                                                                        <span className="input-group-text">%</span>
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    {!isApprovedCurrent && (
                                                                        <button className="btn btn-sm btn-outline-danger border-0" onClick={() => handleRemoveYarnRow(ty.id)}>
                                                                            <i className="bi bi-trash"></i>
                                                                        </button>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                    <tfoot>
                                                        <tr className="bg-light fw-bold">
                                                            <td colSpan="3" className="text-end">Total Consumption:</td>
                                                            <td className={`text-end ${tempYarnAssignments.reduce((sum, y) => sum + (parseFloat(y.yarnConsumption) || 0), 0) === 100 ? 'text-success' : 'text-danger'}`}>
                                                                {tempYarnAssignments.reduce((sum, y) => sum + (parseFloat(y.yarnConsumption) || 0), 0)}%
                                                            </td>
                                                            <td></td>
                                                        </tr>
                                                    </tfoot>
                                                </table>
                                            </div>
                                            {!isApprovedCurrent && (
                                                <button className="btn btn-outline-primary btn-sm rounded-pill px-3 mt-2" onClick={handleAddYarnRow}>
                                                    <i className="bi bi-plus-lg me-1"></i> Add Another Yarn
                                                </button>
                                            )}
                                        </div>
                                        <div className="modal-footer border-0 p-4">
                                            <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => setShowYarnModal(false)}>{isApprovedCurrent ? 'Close' : 'Cancel'}</button>
                                            {!isApprovedCurrent && <button type="button" className="btn btn-primary rounded-pill px-4" onClick={saveYarnAssignments}>Apply & Close</button>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 4. Trims Planning */}
                        <div className={`card shadow-sm border-0 rounded-4 mb-4 overflow-hidden ${!styleData.sizeChartId ? 'opacity-50 pointer-events-none' : ''}`}
                            style={!styleData.sizeChartId ? { pointerEvents: 'none', userSelect: 'none' } : {}}>
                            <div className="card-body p-4">
                                <SectionHeader title="Trims & Accessories" icon="bi-tags-fill" />
                                <div className="table-responsive" style={{ overflowX: 'auto' }}>
                                    <table className="table table-bordered align-middle text-center">
                                        <thead className="table-dark small fw-bold">
                                            <tr>
                                                <th rowSpan="2" className="py-3 text-start px-3">Trims Name</th>
                                                <th rowSpan="2" className="py-3">Mode</th>
                                                {styleData.selectedSizes.length > 0 && <th colSpan={styleData.selectedSizes.length} className="py-3">Size Chart Values</th>}
                                                <th rowSpan="2" className="py-3">Trims Color</th>
                                                <th rowSpan="2" className="py-3"></th>
                                            </tr>
                                            {styleData.selectedSizes.length > 0 && (
                                                <tr>
                                                    {styleData.selectedSizes.map(size => (
                                                        <th key={size} style={{ width: '100px', minWidth: '100px' }} className="py-2">{size}</th>
                                                    ))}
                                                </tr>
                                            )}
                                        </thead>
                                        <tbody>
                                            {trims.map((t) => (
                                                <tr key={t.id}>
                                                    <td>
                                                        <div style={{ minWidth: '220px' }}>
                                                            <CreatableSelect
                                                                options={trimsMaster}
                                                                value={trimsMaster.find(m => m.label === t.trimsName) || (t.trimsName ? { value: t.trimsName, label: t.trimsName } : null)}
                                                                onChange={(selected) => {
                                                                    if (selected) {
                                                                        handleTrimsChange(t.id, "trimsName", selected.label);
                                                                        handleTrimsChange(t.id, "trimsSku", selected.trims_sku || t.trimsSku);
                                                                        handleTrimsChange(t.id, "isSizable", selected.is_sizable || t.isSizable);
                                                                        handleTrimsChange(t.id, "color", selected.color || t.color);
                                                                    } else {
                                                                        handleTrimsChange(t.id, "trimsName", "");
                                                                    }
                                                                }}
                                                                placeholder="Search Trim"
                                                                isDisabled={isApprovedCurrent}
                                                                isClearable={!isApprovedCurrent}
                                                                isSearchable={!isApprovedCurrent}
                                                                menuPortalTarget={document.body}
                                                                styles={{
                                                                    control: (base) => ({ ...base, borderRadius: '8px', borderColor: '#dee2e6' }),
                                                                    menuPortal: base => ({ ...base, zIndex: 9999 })
                                                                }}
                                                            />
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <select className="form-select" style={{ minWidth: '140px' }} value={t.isSizable} onChange={(e) => handleTrimsChange(t.id, "isSizable", e.target.value)} disabled={isApprovedCurrent}>
                                                            <option value="Sizable">Sizable</option>
                                                            <option value="Non-Sizable">Non-Sizable</option>
                                                        </select>
                                                    </td>
                                                    {t.isSizable === "Non-Sizable" ? (
                                                        <td colSpan={styleData.selectedSizes.length}>
                                                            <input
                                                                type="text"
                                                                className="form-control form-control-sm text-center"
                                                                placeholder="Enter value"
                                                                value={t.sizeData["all"] || ""}
                                                                onChange={(e) => handleTrimsChange(t.id, "sizeData", e.target.value, true, "all")}
                                                                readOnly={isApprovedCurrent}
                                                            />
                                                        </td>
                                                    ) : (
                                                        styleData.selectedSizes.map(size => (
                                                            <td key={size}>
                                                                <input
                                                                    type="text"
                                                                    className="form-control form-control-sm text-center"
                                                                    value={t.sizeData[size] || ""}
                                                                    onChange={(e) => handleTrimsChange(t.id, "sizeData", e.target.value, true, size)}
                                                                    readOnly={isApprovedCurrent}
                                                                />
                                                            </td>
                                                        ))
                                                    )}
                                                    <td>
                                                        <input type="text" className="form-control form-control-sm" value={t.color} onChange={(e) => handleTrimsChange(t.id, "color", e.target.value)} readOnly={isApprovedCurrent} />
                                                    </td>
                                                    <td>{!isApprovedCurrent && <button className="btn btn-outline-danger btn-sm border-0" onClick={() => removeTrimsRow(t.id)}><i className="bi bi-trash"></i></button>}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {!isApprovedCurrent && (
                                    <button className="btn btn-primary btn-sm rounded-pill px-3 mt-3" onClick={addTrimsRow}>
                                        <i className="bi bi-plus-circle me-1"></i> Add Trim
                                    </button>
                                )}
                            </div>
                        </div>


                        {/* 5. Production Life Cycle */}
                        <div className={`card shadow-sm border-0 rounded-3 mb-4 overflow-hidden ${!styleData.sizeChartId ? 'opacity-50 pointer-events-none' : ''}`}
                            style={!styleData.sizeChartId ? { pointerEvents: 'none', userSelect: 'none' } : {}}>
                            <div className="card-body p-3">
                                <SectionHeader title="Production Life Cycle" icon="bi-arrow-repeat" />
                                <div className="table-responsive rounded-3 border">
                                    <table className="table table-bordered align-middle table-sm mb-0">
                                        <thead className="table-light small fw-bold uppercase">
                                            <tr>
                                                <th className="py-2 px-3">#</th>
                                                <th className="py-2">Process Name</th>
                                                <th className="py-2 text-center">Wastage (%)</th>
                                                <th className="py-2 text-end px-3">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {lifeCycle.map((p, index) => (
                                                <tr key={p.id}>
                                                    <td className="text-muted small fw-bold px-3">{index + 1}</td>
                                                    <td>
                                                        <div className="d-flex flex-column">
                                                            <select
                                                                className="form-select form-select-sm fw-bold"
                                                                value={p.processName}
                                                                onChange={(e) => {
                                                                    const selected = lifeCyclesMaster.find(m => m.process_name === e.target.value);
                                                                    handleLifeCycleChange(p.id, "processName", e.target.value);
                                                                    if (selected) {
                                                                        handleLifeCycleChange(p.id, "type", selected.process_type);
                                                                        handleLifeCycleChange(p.id, "wastage", String(selected.wastage));
                                                                    }
                                                                }}
                                                                disabled={isApprovedCurrent}
                                                            >
                                                                <option value="">Select Process</option>
                                                                {lifeCyclesMaster.map(m => (
                                                                    <option key={m.id} value={m.process_name}>{m.process_name}</option>
                                                                ))}
                                                                <option value="Other">Other</option>
                                                            </select>
                                                            {p.type && (
                                                                <span className="badge bg-secondary-subtle text-secondary small mt-1 align-self-start border" style={{ fontSize: '0.7rem' }}>
                                                                    Type: {p.type.toUpperCase()}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {p.processName === "Other" && (
                                                            <input
                                                                type="text"
                                                                className="form-control form-control-sm mt-2"
                                                                placeholder="Enter Custom Process"
                                                                value={p.customName || ""}
                                                                onChange={(e) => handleLifeCycleChange(p.id, "customName", e.target.value)}
                                                                readOnly={isApprovedCurrent}
                                                            />
                                                        )}
                                                    </td>
                                                    <td>
                                                        <div className="input-group input-group-sm m-auto" style={{ width: '100px' }}>
                                                            <input type="text" className="form-control text-center text-danger fw-bold" value={p.wastage} onChange={(e) => handleLifeCycleChange(p.id, "wastage", e.target.value)} readOnly={isApprovedCurrent} />
                                                            <span className="input-group-text">%</span>
                                                        </div>
                                                    </td>
                                                    <td className="text-end px-3">
                                                        {!isApprovedCurrent && <button className="btn btn-outline-danger btn-sm border-0" onClick={() => removeLifeCycleRow(p.id)}><i className="bi bi-trash"></i></button>}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {!isApprovedCurrent && (
                                    <button className="btn btn-primary btn-sm rounded-pill px-4 mt-3" onClick={addLifeCycleRow}>
                                        <i className="bi bi-plus-circle me-2"></i> Add Process
                                    </button>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
                <ToastContainer position="bottom-right" theme="colored" />
            </div>
        </div >
    );
};

export default StylePlanning;
