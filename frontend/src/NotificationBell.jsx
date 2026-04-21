import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function NotificationBell() {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);

    const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8081/api";

    // Check if user is Admin
    const storedUser = localStorage.getItem("user");
    let user = null;
    try {
        if (storedUser && storedUser !== "undefined") {
            user = JSON.parse(storedUser);
        }
    } catch (e) { }

    let isAdmin = false;
    if (user) {
        if (user.usertype_id && user.usertype_id === 1) {
            isAdmin = true;
        } else if (user.role === "Admin") {
            isAdmin = true;
        }
    }

    const fetchNotifications = useCallback(async () => {
        if (!isAdmin) return;
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            // Fetch latest 15 logs
            const res = await axios.get(`${API_URL}/activity-logs`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data && Array.isArray(res.data)) {
                // Filter for creations (INSERT) of specific important modules
                const importantTables = ['receipts', 'vouchers', 'pi', 'po', 'tna', 'invoices'];

                const filtered = res.data.filter(log =>
                    log.action === "INSERT" && importantTables.includes(log.table_name)
                );

                setNotifications(filtered.slice(0, 10)); // keep last 10

                // Compare with last seen if we want real unread
                const lastSeenId = parseInt(localStorage.getItem("last_seen_notification_id")) || 0;
                let newCount = 0;
                filtered.slice(0, 10).forEach(n => {
                    if (n.id > lastSeenId) newCount++;
                });

                setUnreadCount(newCount);
            }
        } catch (error) {
            console.error("Error fetching notifications", error);
        }
    }, [isAdmin, API_URL]);

    useEffect(() => {
        if (isAdmin) {
            fetchNotifications();
            // Polling every 30 seconds
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [isAdmin, fetchNotifications]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleOpen = () => {
        setIsOpen(!isOpen);
        if (!isOpen && notifications.length > 0) {
            // mark as read
            const latestId = Math.max(...notifications.map(n => n.id));
            localStorage.setItem("last_seen_notification_id", latestId.toString());
            setUnreadCount(0);
        }
    };

    const formatMessage = (log) => {
        const t = log.table_name;
        let prefix = "New entry";
        if (t === 'receipts') prefix = "New Receipt recorded";
        if (t === 'vouchers') prefix = "New Voucher created";
        if (t === 'po') prefix = "New Purchase Order (PO) created";
        if (t === 'pi') prefix = "New Proforma Invoice (PI) generated";
        if (t === 'tna') prefix = "New TNA Schedule created";
        if (t === 'invoices') prefix = "New Invoice generated";

        return `${prefix} by ${log.user_name}`;
    };

    const getIcon = (table) => {
        switch (table) {
            case 'receipts': return 'bi-receipt text-success';
            case 'vouchers': return 'bi-cash-coin text-warning';
            case 'po': return 'bi-bag-plus text-primary';
            case 'pi': return 'bi-file-earmark-spreadsheet text-info';
            case 'tna': return 'bi-calendar-check text-danger';
            case 'invoices': return 'bi-file-earmark-check text-primary';
            default: return 'bi-bell text-secondary';
        }
    };

    return (
        <div ref={wrapperRef} className="position-relative ms-3 d-flex justify-content-end" style={{ width: '40px', visibility: isAdmin ? 'visible' : 'hidden' }}>
            <button
                onClick={toggleOpen}
                className="btn btn-light rounded-circle shadow-sm border p-2 position-relative"
                style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
                <i className="bi bi-bell fs-5"></i>
                {unreadCount > 0 && (
                    <span className="position-absolute align-items-center justify-content-center d-flex badge rounded-pill bg-danger" style={{ top: '-4px', right: '-4px', fontSize: '10px', height: '18px', width: '18px', padding: 0 }}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div
                    className="position-absolute shadow-lg bg-white border rounded-3"
                    style={{ width: '320px', right: '-10px', top: '50px', zIndex: 9999, overflow: 'hidden' }}
                >
                    <div className="bg-primary text-white px-3 py-2 d-flex justify-content-between align-items-center">
                        <h6 className="mb-0 fw-bold">Notifications</h6>
                        <span className="badge bg-light text-primary">{notifications.length}</span>
                    </div>

                    <div className="notification-list" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                        {notifications.length === 0 ? (
                            <div className="text-center p-4 text-muted small">
                                <i className="bi bi-bell-slash fs-4 d-block mb-2 opacity-50"></i>
                                No recent notifications.
                            </div>
                        ) : (
                            notifications.map(notif => (
                                <Link
                                    to="/activity-logs"
                                    key={notif.id}
                                    className="text-decoration-none border-bottom p-3 d-flex align-items-start hover-bg-light"
                                    style={{ color: 'inherit', transition: 'background 0.2s' }}
                                    onClick={() => setIsOpen(false)}
                                >
                                    <div className="rounded-circle bg-light p-2 me-3 d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
                                        <i className={`bi ${getIcon(notif.table_name)} fs-6`}></i>
                                    </div>
                                    <div>
                                        <div className="fw-semibold small" style={{ lineHeight: '1.2', marginBottom: '4px' }}>
                                            {formatMessage(notif)}
                                        </div>
                                        <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                                            {new Date(notif.timestamp).toLocaleString()}
                                        </div>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                    {notifications.length > 0 && (
                        <div className="text-center border-top">
                            <Link
                                to="/activity-logs"
                                className="d-block py-2 text-decoration-none fw-bold small text-primary hover-bg-light"
                                onClick={() => setIsOpen(false)}
                            >
                                View All Activity Logs
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
