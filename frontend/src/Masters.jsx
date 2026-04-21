import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Masters() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        document.title = "Masters - TSL ERP";
    }, []);

    // List of masters (Initial list)
    const rawMasters = [
        { id: 1, name: "User Privilege", route: "/userprivilege" },
        { id: 2, name: "Account Head", route: "/accounthead" },
        { id: 3, name: "Bank Account", route: "/bankaccount" },
        { id: 4, name: "Brand Name", route: "/brandform" },
        { id: 5, name: "Category", route: "/categoryform" },
        { id: 6, name: "Sub Category", route: "/subcategoryform" },
        { id: 7, name: "Super Sub Category", route: "/supersubcategoryform" },
        { id: 8, name: "Country", route: "/countrymaster" },
        { id: 9, name: "State", route: "/statemaster" },
        { id: 10, name: "City", route: "/citymaster" },
        { id: 11, name: "Color", route: "/color" },
        { id: 12, name: "Module", route: "/modulemaster" },
        { id: 13, name: "User Type", route: "/usertypemaster" },
        { id: 14, name: "Template", route: "/template" },
        { id: 15, name: "Customers", route: "/Customermy" },
        { id: 16, name: "Suppliers", route: "/Suppliermy" },
        { id: 17, name: "Employee", route: "/employeemy" },
        { id: 18, name: "Agent", route: "/agent" },
        { id: 19, name: "Customer Bulk Import", route: "/customer-bulk-import" },
        { id: 20, name: "Supplier Bulk Import", route: "/supplier-bulk-import" },
        { id: 21, name: "Product Import", route: "/product-bulk-import" },
        { id: 22, name: "Price List Master", route: "/price-list-master" },
        { id: 24, name: "UOM Master", route: "/uom" },
        { id: 25, name: "Company Profile", route: "/company-profile" },
        { id: 28, name: "Leads (CRM)", route: "/lead-my" },
        { id: 29, name: "Lead Source Master", route: "/lead-source" },
        { id: 30, name: "Product Type Master", route: "/product-type" },
        { id: 31, name: "Lead Status Master", route: "/lead-status" },
        { id: 32, name: "Accounting Year", route: "/accounting-years" },
    ];

    const storedUser = localStorage.getItem("user");
    let isAdmin = false;
    if (storedUser) {
        try {
            const user = JSON.parse(storedUser);
            if (user.role === "Admin") isAdmin = true;
        } catch (e) { }
    }

    if (isAdmin) {
        rawMasters.push({ id: 99, name: "Activity Log (Admin Only)", route: "/activity-logs" });
    }

    // Sort alphabetically Ascending
    const sortedMasters = [...rawMasters].sort((a, b) =>
        a.name.localeCompare(b.name)
    );

    // Filter based on search term
    const filteredMasters = sortedMasters.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="masters-container container-fluid my-4">
            <style>{`
                .masters-container {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
                }
                
                .search-container {
                    max-width: 600px;
                }
                
                .search-input-wrapper {
                    position: relative;
                    display: flex;
                    align-items: center;
                    background: #ffffff;
                    border: 2px solid #e0e0e0;
                    border-radius: 12px;
                    padding: 12px 20px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
                    transition: all 0.3s ease;
                }
                
                .search-input-wrapper:focus-within {
                    border-color: #2196F3;
                    box-shadow: 0 4px 12px rgba(33, 150, 243, 0.15);
                    transform: translateY(-1px);
                }
                
                .search-icon {
                    color: #9e9e9e;
                    font-size: 18px;
                    margin-right: 12px;
                    transition: color 0.3s ease;
                }
                
                .search-input-wrapper:focus-within .search-icon {
                    color: #2196F3;
                }
                
                .search-input {
                    flex: 1;
                    border: none;
                    outline: none;
                    font-size: 15px;
                    color: #333;
                    background: transparent;
                }
                
                .search-input::placeholder {
                    color: #aaa;
                }
                
                .clear-button {
                    background: none;
                    border: none;
                    color: #9e9e9e;
                    font-size: 18px;
                    cursor: pointer;
                    padding: 0;
                    margin-left: 8px;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .clear-button:hover {
                    color: #f44336;
                    transform: scale(1.1);
                }
                
                .search-results-info {
                    margin-top: 10px;
                    padding: 8px 16px;
                    background: #e3f2fd;
                    border-left: 3px solid #2196F3;
                    border-radius: 6px;
                    font-size: 13px;
                    color: #1976d2;
                    font-weight: 500;
                    display: inline-block;
                }
                
                .master-row {
                    transition: all 0.2s;
                    cursor: pointer;
                }
                .master-row:hover {
                    background-color: #f1f8ff !important;
                    transform: translateX(5px);
                }
                .table-dark th {
                    background-color: #000 !important;
                    color: #fff !important;
                    border-color: #32383e !important;
                    letter-spacing: 0.5px;
                    font-size: 0.85rem;
                    text-transform: uppercase;
                }
                
                @media (max-width: 768px) {
                    .search-container {
                        max-width: 100%;
                    }
                    
                    .search-input-wrapper {
                        padding: 10px 16px;
                    }
                    
                    .search-input {
                        font-size: 14px;
                    }
                }
            `}</style>

            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="fw-bold text-dark mb-0">Masters</h3>
                    <p className="text-muted small mb-0">Manage all master configurations and lookups</p>
                </div>
            </div>

            {/* Enhanced Search/Filter Bar */}
            <div className="mb-4">
                <div className="search-container">
                    <div className="search-input-wrapper">
                        <i className="bi bi-search search-icon"></i>
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search masters by name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <button
                                className="clear-button"
                                onClick={() => setSearchTerm('')}
                                title="Clear search"
                            >
                                <i className="bi bi-x-circle-fill"></i>
                            </button>
                        )}
                    </div>
                    {searchTerm && (
                        <div className="search-results-info">
                            <i className="bi bi-funnel me-1"></i>
                            Showing {filteredMasters.length} result{filteredMasters.length !== 1 ? 's' : ''}
                        </div>
                    )}
                </div>
            </div>

            {/* Masters Table */}
            <div className="table-responsive shadow-sm rounded-3 overflow-hidden border">
                <table className="table table-bordered table-hover align-middle mb-0">
                    <thead className="table-dark">
                        <tr>
                            <th className="py-3 px-4">Masters Name</th>
                            <th className="py-3 px-4 text-center" style={{ width: '150px' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredMasters.length > 0 ? (
                            filteredMasters.map((master) => (
                                <tr
                                    key={master.id}
                                    className="master-row"
                                    onClick={() => navigate(master.route)}
                                >
                                    <td className="px-4 fw-semibold text-secondary py-3">
                                        <i className="bi bi-grid-fill me-2 text-primary opacity-75"></i>
                                        {master.name}
                                    </td>
                                    <td className="text-center">
                                        <button className="btn btn-link btn-sm text-decoration-none fw-bold p-0">
                                            Open <i className="bi bi-chevron-right small"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="2" className="py-5 text-center text-muted">
                                    No masters found matching "{searchTerm}"
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="mt-3 text-muted small">
                Showing {filteredMasters.length} of {sortedMasters.length} total masters
            </div>
        </div>
    );
}
