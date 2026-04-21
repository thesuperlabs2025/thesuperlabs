import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Select from "react-select";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "bootstrap/dist/css/bootstrap.min.css";
import CostingModule from "./CostingModule";
import OrderSizeQuantity from "./OrderSizeQuantity";
import OrderFabricPlanning from "./OrderFabricPlanning";
import OrderYarnPlanning from "./OrderYarnPlanning";
import OrderTrimsPlanning from "./OrderTrimsPlanning";
import OrderBOM from "./OrderBOM";
import OrderLifeCycle from "./OrderLifeCycle";

const API = process.env.REACT_APP_API_URL;

const ORDERED_TABS = [
    "Order Details",
    "Costing",
    "Size Qty Details",
    "Fabric Planning",
    "Yarn Planning",
    "Trims Planning",
    "Life Cycle",
    "BOM"
];

const OrderPlanning = () => {
    const { id: rawId } = useParams();
    const id = (rawId === 'undefined' || rawId === 'null' || !rawId) ? null : rawId;
    const navigate = useNavigate();
    const [orderStatus, setOrderStatus] = useState("Pending");
    const [buyers, setBuyers] = useState([]);
    const [merchandisers, setMerchandisers] = useState([]);
    const [seasons, setSeasons] = useState([]);
    const [activeTab, setActiveTab] = useState(() => {
        const saved = localStorage.getItem(`order_planning_active_tab_${id || 'new'}`);
        return (saved && ORDERED_TABS.includes(saved)) ? saved : "Order Details";
    });

    useEffect(() => {
        localStorage.setItem(`order_planning_active_tab_${id || 'new'}`, activeTab);
    }, [activeTab, id]);

    useEffect(() => {
        document.title = id ? "Edit Order Planning - TSL ERP" : "New Order Planning - TSL ERP";
    }, [id]);


    const [formData, setFormData] = useState({
        orderType: "Buyer",
        ownBrandName: "",
        buyerId: "",
        buyerName: "",
        buyerPo: "",
        orderName: "",
        orderNo: "",
        orderCategory: "Bulk",
        seasonId: "",
        seasonName: "",
        orderDate: new Date().toISOString().split('T')[0],
        factoryDate: "",
        deliveryDate: "",
        merchandiserId: "",
        merchandiserName: "",
        priority: "Medium",
        styleType: "",
        lifecycleType: "order wise",
        isBundle: "no",
        orderImage: null
    });

    const fetchNextOrderNo = useCallback(async () => {
        if (id) return;
        try {
            const res = await axios.get(`${API}/order_planning/next-order-no`);
            setFormData(prev => ({ ...prev, orderNo: res.data.orderNo }));
        } catch (err) { console.error("Error fetching next order no:", err); }
    }, [id]);
    const [imagePreview, setImagePreview] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);

    const [isSaved, setIsSaved] = useState(false);
    const [completedSections, setCompletedSections] = useState(["Order Details"]);

    // Shared Size Context for real-time sync across tabs
    const [sharedSizeContext, setSharedSizeContext] = useState({
        sizeChartId: null,
        activeChartName: "",
        currentSizes: [],
        orderSizeQtys: {},
        orderItems: []
    });

    const resetForm = () => {
        setFormData({
            orderType: "Buyer",
            ownBrandName: "",
            buyerId: "",
            buyerName: "",
            buyerPo: "",
            orderName: "",
            orderNo: "",
            orderCategory: "Bulk",
            styleType: "",
            seasonId: "",
            seasonName: "",
            orderDate: new Date().toISOString().split('T')[0],
            factoryDate: "",
            deliveryDate: "",
            merchandiserId: "",
            merchandiserName: "",
            priority: "Medium",
            lifecycleType: "order wise",
            isBundle: "no",
            orderImage: null
        });
        setImagePreview(null);
        setOrderStatus("Pending");
        setIsSaved(false);
        setCompletedSections(["Order Details"]);
        setActiveTab("Order Details");
        setSharedSizeContext({
            sizeChartId: null,
            activeChartName: "",
            currentSizes: [],
            orderSizeQtys: {},
            orderItems: []
        });
    };

    const fetchAllData = useCallback((showToast = false) => {
        const p1 = fetchBuyers();
        const p2 = fetchMerchandisers();
        const p3 = fetchSeasons();

        Promise.all([p1, p2, p3]).then(() => {
            if (showToast) {
                toast.success("Cool ! Data were refreshed");
            }
        });
    }, []);

    const fetchOrderDetails = useCallback(async (explicitId = null) => {
        const targetId = explicitId || id;
        if (!targetId || targetId === 'undefined' || targetId === 'null') return;

        try {
            const res = await axios.get(`${API}/order_planning/${targetId}`);
            const data = res.data;
            setFormData({
                orderType: data.order_type || "Buyer",
                ownBrandName: data.own_brand_name || "",
                buyerId: data.buyer_id || "",
                buyerName: data.buyer_name || "",
                buyerPo: data.buyer_po || "",
                orderName: data.order_name || "",
                orderNo: data.order_no || "",
                orderCategory: data.order_category || "Bulk",
                styleType: data.style_type || "",
                seasonId: data.season_id || "",
                seasonName: data.season_name || "",
                orderDate: data.order_date ? data.order_date.split('T')[0] : "",
                factoryDate: data.factory_date ? data.factory_date.split('T')[0] : "",
                deliveryDate: data.delivery_date ? data.delivery_date.split('T')[0] : "",
                merchandiserId: data.merchandiser_id || "",
                merchandiserName: data.merchandiser_name || "",
                priority: data.priority || "Medium",
                lifecycleType: data.lifecycle_type || "order wise",
                isBundle: data.is_bundle || "no",
                orderImage: data.order_image || null
            });
            if (data.order_image) {
                setImagePreview(`${API}/uploads/${data.order_image}`);
            }
            setOrderStatus(data.status);
            setIsSaved(true);

            // Check completion of other sections
            const checkSections = async () => {
                const completed = ["Order Details"];
                try {
                    const [cost, size, fabric, other] = await Promise.allSettled([
                        axios.get(`${API}/garment-costing/order/${targetId}`),
                        axios.get(`${API}/size-quantity/order/${targetId}`),
                        axios.get(`${API}/fabric-planning/order/${targetId}`),
                        axios.get(`${API}/order-planning-v2/all/${targetId}`)
                    ]);
                    if (cost.status === "fulfilled" && cost.value.data) completed.push("Costing");

                    if (size.status === "fulfilled" && size.value.data && size.value.data.items?.length > 0) {
                        completed.push("Size Qty Details");
                        const sData = size.value.data;

                        // Auto-populate shared size context if not already done
                        if (sData.size_chart_id) {
                            try {
                                const scRes = await axios.get(`${API}/size-charts/${sData.size_chart_id}`);
                                const aggregatedQtys = {};
                                const items = sData.items || [];
                                items.forEach(item => {
                                    const rowData = typeof item.sizes_data === 'string' ? JSON.parse(item.sizes_data) : item.sizes_data;
                                    Object.entries(rowData || {}).forEach(([sz, q]) => {
                                        aggregatedQtys[sz] = (aggregatedQtys[sz] || 0) + (parseFloat(q) || 0);
                                    });
                                });
                                setSharedSizeContext({
                                    sizeChartId: sData.size_chart_id,
                                    activeChartName: sData.size_chart_name,
                                    currentSizes: scRes.data.values || [],
                                    orderSizeQtys: aggregatedQtys,
                                    orderItems: items
                                });
                            } catch (error) { console.error("Error syncing shared size context:", error); }
                        }
                    }

                    if (fabric.status === "fulfilled" && fabric.value.data && fabric.value.data.items?.length > 0) completed.push("Fabric Planning");

                    if (other.status === "fulfilled" && other.value.data) {
                        if (other.value.data.yarn?.length > 0) completed.push("Yarn Planning");
                        if (other.value.data.trims?.length > 0) completed.push("Trims Planning");
                        if (other.value.data.lifecycle?.length > 0) completed.push("Life Cycle");
                        if (other.value.data.bom?.length > 0) completed.push("BOM");
                    }
                } catch (e) { console.error(e); }

                setCompletedSections(completed);

                // Auto-navigate ONLY if no saved tab exists in localStorage for this order
                const savedTab = localStorage.getItem(`order_planning_active_tab_${targetId}`);
                if (!savedTab) {
                    const firstIncomplete = ORDERED_TABS.find(tab => !completed.includes(tab));
                    if (firstIncomplete) {
                        setActiveTab(firstIncomplete);
                    } else {
                        setActiveTab("Order Details");
                    }
                }
            };
            checkSections();

        } catch (err) {
            console.error("Error fetching order details:", err);
            toast.error("Failed to load order details");
        }
    }, [id]);

    useEffect(() => {
        fetchAllData();
        if (id) {
            fetchOrderDetails();
        } else {
            resetForm();
            fetchNextOrderNo();
        }
    }, [fetchAllData, id, fetchOrderDetails, fetchNextOrderNo]);

    const fetchBuyers = async () => {
        try {
            const res = await axios.get(`${API}/customers`);
            setBuyers(res.data.map(b => ({ value: b.id, label: b.name })));
        } catch (err) { console.error("Error fetching buyers:", err); }
    };

    const fetchMerchandisers = async () => {
        try {
            const res = await axios.get(`${API}/employees`);
            setMerchandisers(res.data.map(e => ({ value: e.id, label: e.employee_name })));
        } catch (err) { console.error("Error fetching merchandisers:", err); }
    };

    const fetchSeasons = async () => {
        try {
            const res = await axios.get(`${API}/seasons`);
            setSeasons(res.data.map(s => ({ value: s.id, label: s.name })));
        } catch (err) { console.error("Error fetching seasons:", err); }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newState = { ...prev, [name]: value };
            if (name === "buyerPo") {
                newState.orderName = value || "";
            }
            return newState;
        });
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

    const calculateDays = (start, end) => {
        if (!start || !end) return 0;
        const s = new Date(start);
        const e = new Date(end);
        const diff = e.getTime() - s.getTime();
        return Math.ceil(diff / (1000 * 3600 * 24));
    };

    const handleSizesUpdate = useCallback((sizes, chartName, chartId, qtys, items) => {
        setSharedSizeContext(prev => {
            if (prev.sizeChartId === chartId &&
                JSON.stringify(prev.currentSizes) === JSON.stringify(sizes) &&
                JSON.stringify(prev.orderSizeQtys) === JSON.stringify(qtys) &&
                JSON.stringify(prev.orderItems) === JSON.stringify(items)) {
                return prev;
            }
            return {
                sizeChartId: chartId,
                activeChartName: chartName,
                currentSizes: sizes,
                orderSizeQtys: qtys,
                orderItems: items
            };
        });
    }, []);

    const handleSave = async () => {
        try {
            const formDataToSend = new FormData();

            // Append all fields to FormData
            Object.keys(formData).forEach(key => {
                if (key !== 'orderImage') {
                    formDataToSend.append(key, formData[key]);
                }
            });

            formDataToSend.append('status', orderStatus);
            if (selectedFile) {
                formDataToSend.append('order_image', selectedFile);
            }

            if (id) {
                await axios.put(`${API}/order_planning/${id}`, formDataToSend, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                const res = await axios.post(`${API}/order_planning`, formDataToSend, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                if (res.data.id) {
                    // Navigate and pass the new ID to fetch functions to avoid 'undefined' closures
                    navigate(`/order-planning/${res.data.id}`, { replace: true });
                    fetchOrderDetails(res.data.id);
                }
            }

            setIsSaved(true);
            handleSectionComplete("Order Details");
            toast.success("Order Details Saved! You can now proceed.");
            if (id) fetchOrderDetails();
        } catch (err) {
            console.error("Save error:", err);
            toast.error("Failed to save order");
        }
    };

    const handleSectionComplete = (sectionId) => {
        setCompletedSections(prev => prev.includes(sectionId) ? prev : [...prev, sectionId]);

        // Automatically move to next section
        const currentIndex = ORDERED_TABS.indexOf(sectionId);
        if (currentIndex < ORDERED_TABS.length - 1) {
            const nextTab = ORDERED_TABS[currentIndex + 1];
            setActiveTab(nextTab);
        }
    };

    const tabs = [
        { id: "Order Details", icon: "bi-info-circle", label: "Order Details", subgroup: "Production Setup" },
        { id: "Costing", icon: "bi-currency-dollar", label: "Costing", subgroup: "Production Setup" },
        { id: "Size Qty Details", icon: "bi-grid-3x3-gap", label: "Size Quantity Details", subgroup: "Production Setup" },
        { id: "Fabric Planning", icon: "bi-layers", label: "Fabric Planning", subgroup: "Material Planning" },
        { id: "Yarn Planning", icon: "bi-record-circle", label: "Yarn Planning", subgroup: "Material Planning" },
        { id: "Trims Planning", icon: "bi-tags", label: "Trims Planning", subgroup: "Material Planning" },
        { id: "Life Cycle", icon: "bi-arrow-repeat", label: "Life Cycle", subgroup: "Execution" },
        { id: "BOM", icon: "bi-list-check", label: "BOM", subgroup: "Execution" },
    ];

    const subgroups = Array.from(new Set(tabs.map(t => t.subgroup)));

    const DropdownWithActions = ({ label, options, value, onChange, onAdd, onRefresh, placeholder, disabled }) => (
        <div className="col-md-4">
            <div className="d-flex justify-content-between align-items-center mb-1">
                <label className="form-label fw-bold text-muted x-small mb-0">{label}</label>
                <div className="d-flex gap-2">
                    <button type="button" className="btn btn-link btn-sm p-0 text-primary" onClick={() => onRefresh(true)} title="Refresh data">
                        <i className="bi bi-arrow-clockwise" style={{ fontSize: '0.8rem' }}></i>
                    </button>
                    {!disabled && (
                        <button type="button" className="btn btn-link btn-sm p-0 text-success" onClick={onAdd} title={`Add new ${label}`}>
                            <i className="bi bi-plus-circle-fill" style={{ fontSize: '0.8rem' }}></i>
                        </button>
                    )}
                </div>
            </div>
            {disabled ? (
                <div className="form-control form-control-sm bg-light text-muted" style={{ height: '32px', display: 'flex', alignItems: 'center' }}>
                    {value ? value.label : "N/A"}
                </div>
            ) : (
                <Select
                    options={options}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    classNamePrefix="react-select"
                    menuPortalTarget={document.body}
                    styles={{
                        menuPortal: base => ({ ...base, zIndex: 9999 }),
                        control: base => ({ ...base, minHeight: '32px', height: '32px', fontSize: '0.78rem', borderRadius: '6px' }),
                        valueContainer: base => ({ ...base, padding: '0 8px' }),
                        indicatorsContainer: base => ({ ...base, height: '30px' }),
                        option: base => ({ ...base, fontSize: '0.78rem', padding: '4px 10px' })
                    }}
                />
            )}
        </div>
    );

    const isLocked = orderStatus === 'Approved';

    const renderContent = () => {

        switch (activeTab) {
            case "Order Details":
                return (
                    <ContentCard title="Order Details" icon="bi-info-circle-fill">
                        {isLocked && (
                            <div className="alert alert-warning mb-3 py-2 rounded-3 shadow-sm border-0 d-flex align-items-center gap-2">
                                <i className="bi bi-lock-fill fs-5 text-warning"></i>
                                <div>
                                    <strong className="d-block small">Order is Approved!</strong>
                                    <span className="x-small">Editing is restricted for this order.</span>
                                </div>
                            </div>
                        )}
                        <div className="row g-3 px-1">
                            <div className="col-md-4">
                                <label className="form-label fw-bold small">Order Type</label>
                                <select className="form-select rounded-3 border-2" disabled={isLocked} name="orderType" value={formData.orderType} onChange={handleInputChange}>
                                    <option value="Buyer">Buyer</option>
                                    <option value="Own Brand">Own Brand</option>
                                </select>
                            </div>

                            <DropdownWithActions
                                label="Buyer Name"
                                options={buyers}
                                value={buyers.find(b => b.value === formData.buyerId)}
                                onChange={(opt) => setFormData(prev => ({ ...prev, buyerId: opt.value, buyerName: opt.label }))}
                                onAdd={() => window.open('/customermy', '_blank')}
                                onRefresh={fetchBuyers}
                                placeholder="Select Buyer"
                                disabled={isLocked || formData.orderType === "Own Brand"}
                            />

                            {formData.orderType === "Own Brand" && (
                                <div className="col-md-4">
                                    <label className="form-label fw-bold small">Own Brand Name</label>
                                    <input type="text" className="form-control rounded-3" readOnly={isLocked} name="ownBrandName" value={formData.ownBrandName} onChange={handleInputChange} placeholder="Enter Brand Name" />
                                </div>
                            )}

                            <div className="col-md-4">
                                <label className="form-label fw-bold small">Order No (Auto)</label>
                                <input type="text" className="form-control rounded-3 bg-light fw-bold text-primary" value={formData.orderNo} readOnly />
                            </div>

                            <div className="col-md-4">
                                <label className="form-label fw-bold small">Order Category</label>
                                <select className="form-select rounded-3" disabled={isLocked} name="orderCategory" value={formData.orderCategory} onChange={handleInputChange}>
                                    <option value="Bulk">Bulk</option>
                                    <option value="Sample">Sample</option>
                                    <option value="Repeat">Repeat</option>
                                </select>
                            </div>

                            <div className="col-md-4">
                                <label className="form-label fw-bold small">Style Type</label>
                                <select className="form-select rounded-3" disabled={isLocked} name="styleType" value={formData.styleType} onChange={handleInputChange}>
                                    <option value="">Select Style Type...</option>
                                    <option value="New Style">New Style</option>
                                    <option value="Repeat Style">Repeat Style</option>
                                    <option value="Specific Order Style">Specific Order Style</option>
                                </select>
                            </div>

                            <DropdownWithActions
                                label="Season"
                                options={seasons}
                                value={seasons.find(s => s.value === formData.seasonId)}
                                onChange={(opt) => setFormData(prev => ({ ...prev, seasonId: opt.value, seasonName: opt.label }))}
                                onAdd={() => window.open('/season-master', '_blank')}
                                onRefresh={fetchSeasons}
                                placeholder="Select Season"
                                disabled={isLocked}
                            />

                            <DropdownWithActions
                                label="Merchandiser"
                                options={merchandisers}
                                value={merchandisers.find(m => m.value === formData.merchandiserId)}
                                onChange={(opt) => setFormData(prev => ({ ...prev, merchandiserId: opt.value, merchandiserName: opt.label }))}
                                onAdd={() => window.open('/employeemy', '_blank')}
                                onRefresh={fetchMerchandisers}
                                placeholder="Select Merchandiser"
                                disabled={isLocked}
                            />

                            <div className="col-md-4">
                                <label className="form-label fw-bold small">Buyer PO No</label>
                                <input
                                    type="text"
                                    className={`form-control rounded-3 ${(isLocked || formData.orderType === "Own Brand") ? 'bg-light' : ''}`}
                                    placeholder="Enter PO Number"
                                    name="buyerPo"
                                    value={formData.buyerPo}
                                    onChange={handleInputChange}
                                    readOnly={isLocked || formData.orderType === "Own Brand"}
                                />
                            </div>

                            <div className="col-md-4">
                                <label className="form-label fw-bold small">Order Name</label>
                                <input
                                    type="text"
                                    className="form-control rounded-3"
                                    readOnly={isLocked}
                                    placeholder="Enter Order Name"
                                    name="orderName"
                                    value={formData.orderName}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="col-md-4">
                                <label className="form-label fw-bold small">Priority</label>
                                <select className="form-select rounded-3" disabled={isLocked} name="priority" value={formData.priority} onChange={handleInputChange}>
                                    <option value="High">High</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Low">Low</option>
                                </select>
                            </div>

                            <div className="col-md-4">
                                <label className="form-label fw-bold small">Order Date</label>
                                <input type="date" className="form-control rounded-3" readOnly={isLocked} name="orderDate" value={formData.orderDate} onChange={handleInputChange} />
                            </div>

                            <div className="col-md-4">
                                <label className="form-label fw-bold small">Delivery Date</label>
                                <input type="date" className="form-control rounded-3" readOnly={isLocked} name="deliveryDate" value={formData.deliveryDate} onChange={handleInputChange} />
                            </div>

                            <div className="col-md-4">
                                <label className="form-label fw-bold small">Factory Date</label>
                                <input
                                    type="date"
                                    className={`form-control rounded-3 ${formData.factoryDate > formData.deliveryDate && formData.deliveryDate ? 'is-invalid' : ''}`}
                                    readOnly={isLocked}
                                    name="factoryDate"
                                    value={formData.factoryDate}
                                    onChange={handleInputChange}
                                    max={formData.deliveryDate}
                                />
                                {formData.factoryDate && (
                                    <div className="mt-2 ps-1">
                                        <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill">
                                            <i className="bi bi-clock-history me-1"></i> {calculateDays(formData.orderDate, formData.factoryDate)} Days from Order
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="col-md-4">
                                <label className="form-label fw-bold small">Lifecycle Type</label>
                                <select className="form-select rounded-3 border-2" disabled={isLocked} name="lifecycleType" value={formData.lifecycleType} onChange={handleInputChange}>
                                    <option value="fabric wise">Fabric Wise</option>
                                    <option value="order wise">Order Wise</option>
                                    <option value="not planned">Not Planned</option>
                                </select>
                            </div>

                            <div className="col-md-4">
                                <label className="form-label fw-bold small">Bundle Required</label>
                                <select className="form-select rounded-3 border-2" disabled={isLocked} name="isBundle" value={formData.isBundle} onChange={handleInputChange}>
                                    <option value="yes">Yes</option>
                                    <option value="no">No</option>
                                </select>
                            </div>

                            <div className="col-md-4">
                                <label className="form-label fw-bold small">Order Image / Attachment</label>
                                <div className="d-flex align-items-start gap-3">
                                    <div className="flex-grow-1">
                                        <input type="file" className="form-control rounded-3" accept="image/*" onChange={handleFileChange} disabled={isLocked} />
                                        <p className="x-small text-muted mt-1">Attach style image or tech pack preview</p>
                                    </div>
                                    {imagePreview && (
                                        <div className="position-relative">
                                            <img src={imagePreview} alt="Preview" className="rounded-3 border" style={{ width: '60px', height: '60px', objectFit: 'cover' }} />
                                            {!isLocked && (
                                                <button
                                                    className="btn btn-danger btn-sm position-absolute top-0 start-100 translate-middle p-0 rounded-circle"
                                                    style={{ width: '18px', height: '18px', fontSize: '10px' }}
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
                        <div className="mt-4 d-flex justify-content-end border-top pt-3">
                            {!isLocked && (
                                <button className="btn btn-primary px-4 py-2 rounded-pill fw-bold shadow-sm transition-all"
                                    onClick={handleSave}
                                    style={{ transform: 'translateY(0)', transition: 'all 0.3s' }}
                                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                                    {isSaved ? "Update & Proceed" : "Save & Proceed to Costing"} <i className="bi bi-arrow-right ms-2"></i>
                                </button>
                            )}
                            {isLocked && (
                                <button className="btn btn-outline-primary px-4 py-2 rounded-pill fw-bold" onClick={() => setActiveTab("Costing")}>
                                    Next Section (Costing) <i className="bi bi-arrow-right ms-2"></i>
                                </button>
                            )}
                        </div>
                    </ContentCard>
                );
            case "Costing":
                return (
                    <ContentCard title="Costing" icon="bi-cash-stack">
                        <CostingModule
                            key={id || "new-costing"}
                            orderId={id}
                            buyerId={formData.buyerId}
                            buyerName={formData.buyerName}
                            onSaveSuccess={() => handleSectionComplete("Costing")}
                            isLocked={orderStatus === 'Approved'}
                        />
                    </ContentCard>
                );
            case "Size Qty Details":
                return (
                    <ContentCard title="Size Quantity Details" icon="bi-grid-3x3-gap">
                        <OrderSizeQuantity
                            key={id || "new-size"}
                            orderId={id}
                            buyerName={formData.buyerName}
                            onSaveSuccess={() => handleSectionComplete("Size Qty Details")}
                            isLocked={orderStatus === 'Approved'}
                            onSizesUpdate={handleSizesUpdate}
                        />
                    </ContentCard>
                );
            case "Fabric Planning":
                return (
                    <ContentCard title="Fabric Planning" icon="bi-layers">
                        <OrderFabricPlanning
                            key={id}
                            orderId={id}
                            onSaveSuccess={() => handleSectionComplete("Fabric Planning")}
                            isLocked={orderStatus === 'Approved'}
                            sharedSizes={sharedSizeContext}
                        />
                    </ContentCard>
                );
            case "Yarn Planning":
                return (
                    <ContentCard title="Yarn Planning" icon="bi-record-circle">
                        <OrderYarnPlanning
                            key={id}
                            orderId={id}
                            onSaveSuccess={() => handleSectionComplete("Yarn Planning")}
                            isLocked={orderStatus === 'Approved'}
                            sharedSizes={sharedSizeContext}
                        />
                    </ContentCard>
                );
            case "Trims Planning":
                return (
                    <ContentCard title="Trims Planning" icon="bi-tags">
                        <OrderTrimsPlanning
                            key={id}
                            orderId={id}
                            onSaveSuccess={() => handleSectionComplete("Trims Planning")}
                            isLocked={orderStatus === 'Approved'}
                            sharedSizes={sharedSizeContext}
                        />
                    </ContentCard>
                );
            case "BOM":
                return (
                    <ContentCard title="BOM" icon="bi-list-check">
                        <OrderBOM
                            orderId={id}
                            onSaveSuccess={() => handleSectionComplete("BOM")}
                            isLocked={orderStatus === 'Approved'}
                        />
                    </ContentCard>
                );
            case "Life Cycle":
                return (
                    <ContentCard title="Life Cycle" icon="bi-arrow-repeat">
                        <OrderLifeCycle
                            orderId={id}
                            onSaveSuccess={() => handleSectionComplete("Life Cycle")}
                            isLocked={orderStatus === 'Approved'}
                        />
                    </ContentCard>
                );
            default:
                return <ContentCard title={activeTab} icon="bi-grid" children={<div className="p-5 text-center text-muted">Section Content for {activeTab} coming soon...</div>} />;
        }
    };

    return (
        <div className="order-planning-page" style={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
            <style>{`
                .order-planning-page {
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                    font-size: 0.8rem;
                }
                .glass-sidebar {
                    background: white;
                    border-right: 1px solid #edf2f7;
                    width: 210px;
                    padding: 10px 8px;
                    overflow-y: auto;
                }
                .main-content-area {
                    flex: 1;
                    background: #f8fafc;
                    padding: 14px 20px;
                    overflow-y: auto;
                }
                .tab-item {
                    padding: 6px 10px;
                    border-radius: 6px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    margin-bottom: 1px;
                    color: #64748b;
                    font-weight: 500;
                    transition: all 0.2s;
                    font-size: 0.78rem;
                }
                .tab-item i { font-size: 0.95rem !important; }
                .tab-item:hover { background: #f1f5f9; color: #0f172a; }
                .tab-item.active {
                    background: #eef2ff;
                    color: #4f46e5;
                    font-weight: 600;
                }
                .subgroup-label {
                    font-size: 0.6rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: #94a3b8;
                    font-weight: 700;
                    margin: 10px 0 4px 8px;
                }
                .content-card-custom {
                    background: white;
                    border-radius: 10px;
                    padding: 16px;
                    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
                    border: 1px solid #e2e8f0;
                    min-height: 100%;
                }
                .react-select__control { border-radius: 6px !important; border: 1px solid #e2e8f0 !important; min-height: 32px !important; font-size: 0.78rem; }
                .react-select__control--is-focused { border-color: #4f46e5 !important; box-shadow: 0 0 0 1px #4f46e5 !important; }
                .react-select__value-container { padding: 0 6px !important; }
                .react-select__indicator { padding: 4px !important; }
                .tab-item.disabled {
                    opacity: 0.4;
                    cursor: not-allowed;
                    pointer-events: none;
                }
                .transition-all { transition: all 0.3s ease; }
                .table-black-header thead th {
                    background-color: #000 !important;
                    color: #fff !important;
                    text-transform: uppercase;
                    font-size: 0.65rem;
                    letter-spacing: 0.05em;
                    padding: 7px 8px !important;
                    border: none;
                }
                .form-control, .form-select { 
                    font-size: 0.95rem; 
                    padding: 0.35rem 0.75rem; 
                    border-radius: 6.5px;
                    transition: all 0.2s ease-in-out;
                    background-color: #fff;
                }
                .form-control:focus, .form-select:focus {
                    background-color: #f1f5f9 !important;
                    border-color: #4f46e5 !important;
                    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1) !important;
                    outline: none;
                }
                .react-select__control { 
                    border-radius: 6px !important; 
                    border: 1px solid #e2e8f0 !important; 
                    min-height: 32px !important; 
                    font-size: 0.78rem; 
                    transition: all 0.2s ease-in-out;
                }
                .react-select__control--is-focused { 
                    border-color: #4f46e5 !important; 
                    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1) !important; 
                    background-color: #f1f5f9 !important;
                }
                .form-control-sm, .form-select-sm { font-size: 0.85rem; padding: 0.25rem 0.6rem; }
                .btn { font-size: 0.95rem; padding: 0.35rem 1rem; }
                .btn-sm { font-size: 0.85rem; padding: 0.25rem 0.75rem; }
                .x-small { font-size: 0.8rem; }
                .table th, .table td { font-size: 0.9rem; padding: 0.45rem 0.6rem; }
                .table-sm th, .table-sm td { padding: 0.3rem 0.5rem; }
                h5 { font-size: 1.15rem; }
                h6 { font-size: 0.95rem; }
                .badge { font-size: 0.75rem; padding: 0.3em 0.6em; }
                .input-group-text { font-size: 0.85rem; padding: 0.3rem 0.6rem; }
                
                /* Specific styles for breakdown inputs */
                .qty-input { 
                    background-color: #ffffff;
                }
                .qty-input:focus {
                    background-color: #f1f5f9 !important;
                }
            `}</style>

            {/* Top Toolbar */}
            <div className="bg-white border-bottom px-3 py-2 d-flex justify-content-between align-items-center sticky-top">
                <div className="d-flex align-items-center">
                    <button className="btn btn-sm btn-light me-2 rounded-circle border" onClick={() => window.history.back()}><i className="bi bi-chevron-left"></i></button>
                    <div>
                        <h6 className="fw-bold mb-0">Order Planning</h6>
                        <small className="text-muted x-small">Master Setup & Planning</small>
                    </div>
                </div>
                <div className="d-flex gap-3">
                    <select
                        className="form-select form-select-sm rounded-pill px-4 fw-bold border-2"
                        value={orderStatus}
                        onChange={e => setOrderStatus(e.target.value)}
                        style={{
                            width: '180px',
                            borderColor: orderStatus === 'Approved' ? '#22c55e' : orderStatus === 'Completed' ? '#3b82f6' : orderStatus === 'Canceled' ? '#ef4444' : '#f59e0b',
                            color: orderStatus === 'Approved' ? '#22c55e' : orderStatus === 'Completed' ? '#3b82f6' : orderStatus === 'Canceled' ? '#ef4444' : '#f59e0b'
                        }}
                    >
                        <option value="Pending">🕒 Pending</option>
                        <option value="Approved">✅ Approved</option>
                        <option value="Completed">🏁 Completed</option>
                        <option value="Canceled">❌ Canceled</option>
                    </select>
                    <button className="btn btn-primary rounded-pill px-4 fw-bold" onClick={handleSave}>
                        <i className="bi bi-check2-circle me-2"></i> Save Changes
                    </button>
                </div>
            </div>

            <div className="d-flex flex-grow-1 overflow-hidden">
                {/* Sidebar */}
                <div className="glass-sidebar shadow-sm">
                    {subgroups.map(subgroup => (
                        <div key={subgroup}>
                            <div className="subgroup-label">{subgroup}</div>
                            {tabs.filter(t => t.subgroup === subgroup).map(tab => {
                                const currentIndex = ORDERED_TABS.indexOf(tab.id);
                                const isAllCompleted = ORDERED_TABS.every(t => completedSections.includes(t));
                                let isTabLocked = false;

                                if (tab.id !== "Order Details" && !isAllCompleted) {
                                    // Sequential lock: A tab is locked if any previous tab is not in completedSections
                                    for (let i = 0; i < currentIndex; i++) {
                                        if (!completedSections.includes(ORDERED_TABS[i])) {
                                            isTabLocked = true;
                                            break;
                                        }
                                    }
                                }

                                // Bypass sidebar locks if already approved
                                if (isLocked) isTabLocked = false;

                                // Also lock if the main order isn't saved yet (only relevant before first save)
                                if (tab.id !== "Order Details" && !id) isTabLocked = true;

                                return (
                                    <div
                                        key={tab.id}
                                        className={`tab-item ${activeTab === tab.id ? "active" : ""} ${isTabLocked ? "disabled text-muted" : ""}`}
                                        onClick={() => !isTabLocked && setActiveTab(tab.id)}
                                    >
                                        <i className={`bi ${tab.icon} me-2`}></i>
                                        <span>{tab.label}</span>
                                        {isTabLocked && <i className="bi bi-lock-fill ms-auto small opacity-50"></i>}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>

                {/* Main Content Area */}
                <main className="main-content-area">
                    <div className="h-100">
                        {renderContent()}
                    </div>
                </main>
            </div>
            <ToastContainer autoClose={2000} />
        </div>
    );
};

const ContentCard = ({ title, icon, children }) => (
    <div className="content-card-custom shadow-sm overflow-auto">
        <div className="d-flex align-items-center mb-3 border-bottom pb-2">
            <div className="bg-primary bg-opacity-10 rounded-2 p-1 me-2 text-primary">
                <i className={`bi ${icon}`} style={{ fontSize: '0.95rem' }}></i>
            </div>
            <div>
                <h6 className="fw-bold text-dark mb-0" style={{ fontSize: '0.88rem' }}>{title}</h6>
                <small className="text-secondary fw-semibold text-uppercase opacity-75 x-small">Production Planning</small>
            </div>
        </div>
        <div>{children}</div>
    </div>
);

export default OrderPlanning;
