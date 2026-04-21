import React, { useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const Garments = () => {
    const navigate = useNavigate();

    const sectionRefs = {
        1: useRef(null),
        2: useRef(null),
        3: useRef(null),
        4: useRef(null),
        5: useRef(null)
    };

    useEffect(() => {
        document.title = "Production | TSL ERP";
    }, []);

    const scrollToSection = (id) => {
        if (id === 1) {
            window.scrollTo({ top: 0, behavior: "smooth" });
            return;
        }
        const element = sectionRefs[id].current;
        if (element) {
            const offset = 40;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });
        }
    };

    // Performance: Memoize variants to prevent re-renders
    const variants = useMemo(() => ({
        container: {
            hidden: { opacity: 0 },
            visible: {
                opacity: 1,
                transition: { staggerChildren: 0.03, delayChildren: 0.05 },
            },
        },
        item: {
            hidden: { y: 15, opacity: 0 },
            visible: { y: 0, opacity: 1, transition: { duration: 0.4, ease: "easeOut" } },
        }
    }), []);

    // High-End Apple App Icon Logo (Enhanced Visibility)
    const MainAppLogo = () => (
        <div style={{
            width: "64px",
            height: "64px",
            background: "linear-gradient(180deg, #007AFF 0%, #0056B3 100%)",
            borderRadius: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 8px 24px rgba(0, 122, 255, 0.3)",
            position: "relative",
            overflow: "hidden",
            flexShrink: 0
        }}>
            <div style={{ position: "absolute", width: "100%", height: "40%", top: 0, background: "linear-gradient(to bottom, rgba(255,255,255,0.2), transparent)" }}></div>
            <i className="bi bi-cpu-fill" style={{ color: "white", fontSize: "32px", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))" }}></i>
        </div>
    );

    // Optimized Module Card (No Backdrop Blur for Performance)
    const ModuleCard = ({ title, icon, color, path, subtitle, isSmall = false }) => (
        <motion.div
            variants={variants.item}
            whileHover={{ y: -4, boxShadow: "0 12px 30px rgba(0,0,0,0.08)", scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => path && navigate(path)}
            style={{
                cursor: "pointer",
                background: "#FFFFFF",
                borderRadius: "24px",
                padding: isSmall ? "16px" : "24px",
                border: "1px solid #E5E5EA",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                height: "100%",
                transition: "background-color 0.2s, box-shadow 0.2s",
                position: "relative",
                willChange: "transform, opacity"
            }}
        >
            <div style={{
                width: isSmall ? "40px" : "48px",
                height: isSmall ? "40px" : "48px",
                borderRadius: "12px",
                background: `${color}10`,
                color: color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: isSmall ? "18px" : "22px",
                flexShrink: 0
            }}>
                <i className={`bi ${icon}`}></i>
            </div>
            <div>
                <h6 style={{ fontWeight: "700", color: "#1D1D1F", fontSize: isSmall ? "13px" : "16px", margin: 0, lineHeight: "1.2" }}>{title}</h6>
                {subtitle && <p style={{ color: "#86868B", fontSize: "11px", margin: "4px 0 0 0", lineHeight: "1.3" }}>{subtitle}</p>}
            </div>
        </motion.div>
    );

    // Sharp & Compact Mini Action (The "Wow" Component)
    const MiniAction = ({ title, icon, color, path }) => (
        <div
            onClick={() => path && navigate(path)}
            style={{
                cursor: "pointer",
                background: "#FFFFFF",
                borderRadius: "16px",
                padding: "12px 8px",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "8px",
                border: "1px solid #E5E5EA",
                transition: "all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)",
                height: "100%",
                position: "relative",
                overflow: "hidden"
            }}
            onMouseOver={(e) => {
                e.currentTarget.style.transform = "scale(1.02) translateY(-2px)";
                e.currentTarget.style.boxShadow = `0 8px 16px ${color}15`;
                e.currentTarget.style.borderColor = color;
            }}
            onMouseOut={(e) => {
                e.currentTarget.style.transform = "scale(1) translateY(0)";
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.borderColor = "#E5E5EA";
            }}
        >
            <div style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: `${color}08`,
                color: color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
                transition: "all 0.25s ease"
            }}>
                <i className={`bi ${icon}`}></i>
            </div>
            <span style={{ fontWeight: "700", fontSize: "11px", color: "#1D1D1F", letterSpacing: "-0.02em" }}>{title}</span>
        </div>
    );

    const SectionHeader = ({ title, icon, color, id }) => (
        <div
            id={id}
            ref={id ? sectionRefs[id.slice(-1)] : null}
            style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px", marginTop: "10px", paddingLeft: "8px", scrollMarginTop: "120px" }}
        >
            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>
                <i className={`bi ${icon}`}></i>
            </div>
            <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#1D1D1F", textTransform: "uppercase", letterSpacing: "0.02em", margin: 0 }}>{title}</h2>
        </div>
    );

    const NavigationProgressBar = () => {
        const navItems = [
            { id: 1, label: "PLAN" },
            { id: 2, label: "JOBS" },
            { id: 3, label: "STOCK" },
            { id: 4, label: "PO" },
            { id: 5, label: "OTHERS" }
        ];

        return (
            <div className="nav-progressive-bar" style={{
                position: "fixed",
                right: "16px",
                top: "50%",
                transform: "translateY(-50%)",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                zIndex: 1000,
                background: "rgba(255, 255, 255, 0.6)",
                padding: "8px 6px",
                borderRadius: "20px",
                boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(255,255,255,0.3)"
            }}>
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => scrollToSection(item.id)}
                        style={{
                            width: "54px",
                            height: "22px",
                            borderRadius: "11px",
                            border: "1px solid #E5E5EA",
                            background: "#fff",
                            color: "#1D1D1F",
                            fontWeight: "900",
                            fontSize: "8px",
                            letterSpacing: "0.03em",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                            cursor: "pointer",
                            padding: 0
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.transform = "translateX(-2px)";
                            e.currentTarget.style.background = "#007AFF";
                            e.currentTarget.style.color = "#fff";
                            e.currentTarget.style.borderColor = "#007AFF";
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.transform = "translateX(0)";
                            e.currentTarget.style.background = "#fff";
                            e.currentTarget.style.color = "#1D1D1F";
                            e.currentTarget.style.borderColor = "#E5E5EA";
                        }}
                    >
                        {item.label}
                    </button>
                ))}
            </div>
        );
    };

    const Shelf = ({ children }) => (
        <div className="row g-3 mb-5">
            {children}
        </div>
    );

    return (
        <motion.div
            variants={variants.container}
            initial="hidden"
            animate="visible"
            style={{
                background: "#F2F2F7", // Traditional iOS Light Gray Background
                minHeight: "100vh",
                padding: "40px 24px 80px",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif",
                WebkitFontSmoothing: "antialiased"
            }}
        >
            <NavigationProgressBar />
            <div className="main-content-layout" style={{
                maxWidth: "1300px",
                margin: "0 auto",
                position: "relative",
                transition: "padding 0.3s ease"
            }}>

                {/* Benchmark Header with Prominent Logo */}
                <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "48px", flexWrap: "wrap", gap: "20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                        <MainAppLogo />
                        <div>
                            <h1 style={{ fontSize: "34px", fontWeight: "800", letterSpacing: "-0.04em", color: "#000", margin: 0 }}>Garments ERP</h1>
                            <p style={{ color: "#8E8E93", fontSize: "15px", fontWeight: "600", margin: 0 }}>Production Central Hub</p>
                        </div>
                    </div>

                    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                        <button onClick={() => navigate("/tna-add")} style={{ padding: "10px 20px", borderRadius: "12px", border: "none", background: "#007AFF", color: "#fff", fontWeight: "700", fontSize: "14px", boxShadow: "0 4px 12px rgba(0,122,255,0.2)" }}>
                            <i className="bi bi-plus-lg me-2"></i> TNA SETUP
                        </button>
                        <button onClick={() => navigate("/tna-process-master")} style={{ padding: "10px 20px", borderRadius: "12px", border: "1px solid #D1D1D6", background: "#fff", color: "#000", fontWeight: "700", fontSize: "14px" }}>
                            TNA MASTER
                        </button>
                        <button onClick={() => navigate("/tna-my-page")} style={{ padding: "10px 20px", borderRadius: "12px", border: "1px solid #D1D1D6", background: "#fff", color: "#000", fontWeight: "700", fontSize: "14px" }}>
                            TNA TASKS
                        </button>
                    </div>
                </header>

                {/* 1. Planning Core */}
                <SectionHeader id="section-1" title="Planning & Management" icon="bi-bar-chart-fill" color="#5856D6" />
                <Shelf>
                    <div className="col-12 col-md-4"><ModuleCard title="Order Planning" icon="bi-calendar-week" color="#007AFF" subtitle="Strategic manufacturing setup" path="/order-planning-my" /></div>
                    <div className="col-12 col-md-4"><ModuleCard title="Style Planning" icon="bi-palette-fill" color="#AF52DE" subtitle="Technical & creative definition" path="/style-planning-my" /></div>
                    <div className="col-12 col-md-4"><ModuleCard title="Track TNA" icon="bi-speedometer2" color="#34C759" subtitle="Live production monitoring" path="/tna-track" /></div>
                </Shelf>

                {/* 2. Workflows (The "App Shelf" Style) */}
                <SectionHeader id="section-2" title="Manufacturing Workflows" icon="bi-gear-wide-connected" color="#007AFF" />
                <Shelf>
                    {/* Order Workflow */}
                    <div className="col-12 col-xl-4">
                        <div style={{
                            background: "#FFFFFF",
                            borderRadius: "24px",
                            padding: "20px",
                            border: "1px solid #E5E5EA",
                            position: "relative",
                            overflow: "hidden"
                        }}>
                            <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "3px", background: "#007AFF" }}></div>
                            <div className="mb-4 d-flex justify-content-between align-items-center">
                                <h4 style={{ fontSize: "12px", fontWeight: "900", color: "#1D1D1F", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>Order Unit Work</h4>
                                <i className="bi bi-shield-check" style={{ color: "#007AFF", opacity: 0.4 }}></i>
                            </div>
                            <div className="mb-4">
                                <div className="d-flex align-items-center gap-2 mb-3">
                                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#5856D6" }}></div>
                                    <span style={{ fontSize: "10px", fontWeight: "800", color: "#8E8E93", letterSpacing: "0.02em" }}>YARN TO FABRIC</span>
                                </div>
                                <div className="row g-2">
                                    <div className="col-4"><MiniAction title="OUT" icon="bi-send" color="#5856D6" path="/order-jobwork-yarn-to-fabric-list" /></div>
                                    <div className="col-4"><MiniAction title="IN" icon="bi-cloud-download" color="#34C759" path="/order-jobwork-yarn-to-fabric-inward-list" /></div>
                                    <div className="col-4"><MiniAction title="RTN" icon="bi-arrow-counterclockwise" color="#FF3B30" path="/order-jobwork-yarn-to-fabric-return-list" /></div>
                                </div>
                            </div>
                            <div className="mb-4">
                                <div className="d-flex align-items-center gap-2 mb-3">
                                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#007AFF" }}></div>
                                    <span style={{ fontSize: "10px", fontWeight: "800", color: "#8E8E93", letterSpacing: "0.02em" }}>FABRIC TO PCS</span>
                                </div>
                                <div className="row g-2">
                                    <div className="col-4"><MiniAction title="OUT" icon="bi-send" color="#007AFF" path="/order-jobwork-fabric-to-pcs-outward-list" /></div>
                                    <div className="col-4"><MiniAction title="IN" icon="bi-cloud-download" color="#34C759" path="/order-jobwork-fabric-to-pcs-inward-list" /></div>
                                    <div className="col-4"><MiniAction title="RTN" icon="bi-arrow-counterclockwise" color="#FF3B30" path="/order-jobwork-fabric-to-pcs-return-list" /></div>
                                </div>
                            </div>
                            <div>
                                <div className="d-flex align-items-center gap-2 mb-3">
                                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#AF52DE" }}></div>
                                    <span style={{ fontSize: "10px", fontWeight: "800", color: "#8E8E93", letterSpacing: "0.02em" }}>PCS PROCESS</span>
                                </div>
                                <div className="row g-2">
                                    <div className="col-4"><MiniAction title="OUT" icon="bi-send" color="#AF52DE" path="/order-jobwork-pcs-outward-list" /></div>
                                    <div className="col-4"><MiniAction title="IN" icon="bi-cloud-download" color="#34C759" path="/order-jobwork-pcs-inward-list" /></div>
                                    <div className="col-4"><MiniAction title="RTN" icon="bi-arrow-counterclockwise" color="#FF3B30" path="/order-jobwork-pcs-return-list" /></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Lot Workflow */}
                    <div className="col-12 col-xl-4">
                        <div style={{
                            background: "#FFFFFF",
                            borderRadius: "24px",
                            padding: "20px",
                            border: "1px solid #E5E5EA",
                            position: "relative",
                            overflow: "hidden"
                        }}>
                            <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "3px", background: "#545456" }}></div>
                            <div className="mb-4 d-flex justify-content-between align-items-center">
                                <h4 style={{ fontSize: "12px", fontWeight: "900", color: "#1D1D1F", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>Lot Processing</h4>
                                <i className="bi bi-list-task" style={{ color: "#545456", opacity: 0.4 }}></i>
                            </div>
                            <div className="mb-4">
                                <div className="d-flex align-items-center gap-2 mb-3">
                                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#5856D6" }}></div>
                                    <span style={{ fontSize: "10px", fontWeight: "800", color: "#8E8E93", letterSpacing: "0.02em" }}>YARN TO FABRIC</span>
                                </div>
                                <div className="row g-2">
                                    <div className="col-4"><MiniAction title="OUT" icon="bi-send" color="#5856D6" path="/lot-jobwork-yarn-to-fabric-list" /></div>
                                    <div className="col-4"><MiniAction title="IN" icon="bi-cloud-download" color="#34C759" path="/lot-jobwork-yarn-to-fabric-inward-list" /></div>
                                    <div className="col-4"><MiniAction title="RTN" icon="bi-arrow-counterclockwise" color="#FF3B30" path="/lot-jobwork-yarn-to-fabric-return-list" /></div>
                                </div>
                            </div>
                            <div>
                                <div className="d-flex align-items-center gap-2 mb-3">
                                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#007AFF" }}></div>
                                    <span style={{ fontSize: "10px", fontWeight: "800", color: "#8E8E93", letterSpacing: "0.02em" }}>FABRIC TO PCS</span>
                                </div>
                                <div className="row g-2">
                                    <div className="col-4"><MiniAction title="OUT" icon="bi-send" color="#007AFF" path="/lot-jobwork-fabric-to-pcs-outward-list" /></div>
                                    <div className="col-4"><MiniAction title="IN" icon="bi-cloud-download" color="#34C759" path="/lot-jobwork-fabric-to-pcs-inward-list" /></div>
                                    <div className="col-4"><MiniAction title="RTN" icon="bi-arrow-counterclockwise" color="#FF3B30" path="/lot-jobwork-fabric-to-pcs-return-list" /></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Internal Workflow */}
                    <div className="col-12 col-xl-4">
                        <div style={{
                            background: "#FFFFFF",
                            borderRadius: "24px",
                            padding: "20px",
                            border: "1px solid #E5E5EA",
                            position: "relative",
                            overflow: "hidden"
                        }}>
                            <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "3px", background: "#FF9500" }}></div>
                            <div className="mb-4 d-flex justify-content-between align-items-center">
                                <h4 style={{ fontSize: "12px", fontWeight: "900", color: "#1D1D1F", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>Internal Operations</h4>
                                <i className="bi bi-box-seam" style={{ color: "#FF9500", opacity: 0.4 }}></i>
                            </div>
                            <div className="mb-4">
                                <div className="d-flex align-items-center gap-2 mb-3">
                                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#5856D6" }}></div>
                                    <span style={{ fontSize: "10px", fontWeight: "800", color: "#8E8E93", letterSpacing: "0.02em" }}>YARN TO FABRIC</span>
                                </div>
                                <div className="row g-2">
                                    <div className="col-4"><MiniAction title="OUT" icon="bi-send" color="#5856D6" path="/internal-lot-yarn-to-fabric-list" /></div>
                                    <div className="col-4"><MiniAction title="IN" icon="bi-cloud-download" color="#34C759" path="/internal-lot-yarn-to-fabric-inward-list" /></div>
                                    <div className="col-4"><MiniAction title="RTN" icon="bi-arrow-counterclockwise" color="#FF3B30" path="/internal-lot-yarn-to-fabric-return-list" /></div>
                                </div>
                            </div>
                            <div className="mb-4">
                                <div className="d-flex align-items-center gap-2 mb-3">
                                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#007AFF" }}></div>
                                    <span style={{ fontSize: "10px", fontWeight: "800", color: "#8E8E93", letterSpacing: "0.02em" }}>FABRIC TO PCS</span>
                                </div>
                                <div className="row g-2">
                                    <div className="col-4"><MiniAction title="OUT" icon="bi-send" color="#007AFF" path="/internal-lot-fabric-to-pcs-outward-list" /></div>
                                    <div className="col-4"><MiniAction title="IN" icon="bi-cloud-download" color="#34C759" path="/internal-lot-fabric-to-pcs-inward-list" /></div>
                                    <div className="col-4"><MiniAction title="RTN" icon="bi-arrow-counterclockwise" color="#FF3B30" path="/internal-lot-fabric-to-pcs-return-list" /></div>
                                </div>
                            </div>
                            <div>
                                <div className="d-flex align-items-center gap-2 mb-3">
                                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#FF9500" }}></div>
                                    <span style={{ fontSize: "10px", fontWeight: "800", color: "#8E8E93", letterSpacing: "0.02em" }}>CORA FABRIC</span>
                                </div>
                                <div className="row g-2">
                                    <div className="col-4"><MiniAction title="OUT" icon="bi-send" color="#FF9500" /></div>
                                    <div className="col-4"><MiniAction title="IN" icon="bi-cloud-download" color="#34C759" /></div>
                                    <div className="col-4"><MiniAction title="RTN" icon="bi-arrow-counterclockwise" color="#FF3B30" /></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Shelf>

                {/* 3. Resources */}
                <SectionHeader id="section-3" title="Materials & Resources" icon="bi-archive-fill" color="#FF9500" />
                <Shelf>
                    <div className="col-6 col-md-3"><ModuleCard title="Yarn Stock" icon="bi-box-seam" color="#5AC8FA" path="/yarn-stock" subtitle="Inventory log" isSmall /></div>
                    <div className="col-6 col-md-3"><ModuleCard title="Fabric Stock" icon="bi-stack" color="#007AFF" path="/fabric-stock" subtitle="Knit/Woven repository" isSmall /></div>
                    <div className="col-6 col-md-3"><ModuleCard title="Trims Stock" icon="bi-tag-fill" color="#FF2D55" path="/trims-stock" subtitle="Accessories" isSmall /></div>
                    <div className="col-6 col-md-3"><ModuleCard title="Bundle Card" icon="bi-qr-code" color="#AF52DE" path="/barcode-creation" subtitle="Identification" isSmall /></div>
                    <div className="col-12 col-md-4"><ModuleCard title="Contractor Wages" icon="bi-cash-coin" color="#34C759" path="/contractor-wages-list" subtitle="Payroll & production rates" /></div>
                    <div className="col-12 col-md-4"><ModuleCard title="Quality Check" icon="bi-patch-check-fill" color="#32ADE6" subtitle="AQL Standards" /></div>
                    <div className="col-12 col-md-4"><ModuleCard title="Life Cycle" icon="bi-arrow-repeat" color="#FF9500" path="/lifecycle" subtitle="Global sequence setup" /></div>
                </Shelf>

                {/* 4. Logistics (Optimized Grid) */}
                <SectionHeader id="section-4" title="Logistics & Procurement" icon="bi-truck" color="#32ADE6" />
                <div style={{ background: "#FFFFFF", borderRadius: "32px", padding: "32px", border: "1px solid #E5E5EA", marginBottom: "40px" }}>
                    <div className="mb-5">
                        <h5 style={{ fontSize: "14px", fontWeight: "800", color: "#8E8E93", textTransform: "uppercase", marginBottom: "20px" }}>Purchase Orders</h5>
                        <div className="row g-2">
                            {["Yarn", "Fabric", "Trims", "Garments", "General"].map((p) => (
                                <div className="col-6 col-md-4 col-xl" key={p}>
                                    <ModuleCard title={`${p} PO`} icon="bi-file-earmark-text" color="#8E8E93" path={`/${p.toLowerCase()}-po-list`} isSmall />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="mb-5">
                        <h5 style={{ fontSize: "14px", fontWeight: "800", color: "#8E8E93", textTransform: "uppercase", marginBottom: "20px" }}>Goods Receipt (GRN)</h5>
                        <div className="row g-2">
                            {["Yarn", "Fabric", "Trims", "Garments", "General"].map((p) => (
                                <div className="col-6 col-md-4 col-xl" key={p}>
                                    <ModuleCard title={p} icon="bi-clipboard2-check" color="#34C759" path={`/${p.toLowerCase()}-grn-list`} isSmall />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h5 style={{ fontSize: "14px", fontWeight: "800", color: "#8E8E93", textTransform: "uppercase", marginBottom: "20px" }}>Warehouse Inward</h5>
                        <div className="row g-2">
                            <div className="col-6 col-md-4 col-xl"><ModuleCard title="Direct" icon="bi-lightning-fill" color="#FF9500" path="/direct-inward" subtitle="Gate Entry" isSmall /></div>
                            <div className="col-6 col-md-4 col-xl"><ModuleCard title="Yarn" icon="bi-box-arrow-in-right" color="#5AC8FA" path="/yarn-inward-list" isSmall /></div>
                            <div className="col-6 col-md-4 col-xl"><ModuleCard title="Fabric" icon="bi-box-arrow-in-right" color="#007AFF" path="/fabric-inward-list" isSmall /></div>
                            <div className="col-6 col-md-4 col-xl"><ModuleCard title="Trims" icon="bi-box-arrow-in-right" color="#FF2D55" path="/trims-inward-list" isSmall /></div>
                            <div className="col-6 col-md-4 col-xl"><ModuleCard title="Pcs" icon="bi-box-arrow-in-right" color="#34C759" path="/pcs-inward-list" isSmall /></div>
                        </div>
                    </div>
                </div>

                {/* 5. Master Units */}
                <SectionHeader id="section-5" title="Production Units" icon="bi-collection-play-fill" color="#30B0C7" />
                <Shelf>
                    <div className="col-12 col-md-6"><ModuleCard title="Production Lot" icon="bi-stack-overflow" color="#30B0C7" subtitle="Unified manufacturing orchestration" path="/production-lot-list" /></div>
                    <div className="col-12 col-md-6"><ModuleCard title="Internal Lot" icon="bi-diagram-3-fill" color="#10B981" subtitle="Secondary processing units" path="/internal-lot-list" /></div>
                </Shelf>
            </div>

            <style>{`
                body { overflow-x: hidden; }
                * { -webkit-tap-highlight-color: transparent; }
                
                /* Layout Setup */
                .main-content-layout {
                    width: 100%;
                    margin: 0 auto;
                }

                /* Desktop (Extra Large) */
                @media (min-width: 1400px) {
                    .main-content-layout { 
                        max-width: 1300px;
                        padding-right: 140px !important; 
                        padding-left: 20px !important;
                    }
                    .nav-progressive-bar { right: calc(50% - 660px) !important; }
                }
                
                /* Laptop / Desktop (Large) */
                @media (min-width: 992px) and (max-width: 1399px) {
                    .main-content-layout { 
                        max-width: 1100px;
                        padding-right: 120px !important; 
                        padding-left: 20px !important; 
                    }
                    .nav-progressive-bar { right: 20px !important; }
                }

                /* Tablet / Small Laptop */
                @media (min-width: 769px) and (max-width: 991px) {
                    .main-content-layout { 
                        padding-right: 100px !important; 
                        padding-left: 20px !important; 
                    }
                    .nav-progressive-bar { right: 16px !important; }
                }

                /* Mobile */
                @media (max-width: 768px) {
                    motion.div { padding-bottom: 20px !important; }
                    .main-content-layout { 
                        padding-right: 15px !important; 
                        padding-left: 15px !important; 
                    }
                    .nav-progressive-bar { 
                        top: auto !important;
                        bottom: 20px !important;
                        left: 50% !important;
                        right: auto !important;
                        transform: translateX(-50%) !important;
                        flex-direction: row !important;
                        padding: 10px 16px !important;
                        background: rgba(255, 255, 255, 0.95) !important;
                        border-radius: 30px !important;
                        width: max-content;
                    }
                    .nav-progressive-bar button {
                        width: auto !important;
                        height: auto !important;
                        padding: 6px 12px !important;
                        font-size: 10px !important;
                        border-radius: 12px !important;
                        background: #f1f5f9 !important;
                        color: #1D1D1F !important;
                        border: none !important;
                    }
                    .nav-progressive-bar button:active {
                        background: #007AFF !important;
                        color: #fff !important;
                    }
                }

                /* Extra Small Mobile Fixes */
                @media (max-width: 576px) {
                    header {
                        flex-direction: column !important;
                        align-items: flex-start !important;
                    }
                    header .d-flex {
                        width: 100%;
                    }
                    header h1 { fontSize: 26px !important; }
                    .SectionHeader h2 { fontSize: 16px !important; }
                }
            `}</style>
        </motion.div>
    );
};

export default Garments;
