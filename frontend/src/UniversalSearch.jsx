import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export const searchItems = [
    // Masters
    { id: 1, label: 'Customers Master', path: '/customermy', category: 'Master', icon: 'bi-people' },
    { id: 2, label: 'Suppliers Master', path: '/suppliermy', category: 'Master', icon: 'bi-truck' },
    { id: 3, label: 'Employees Master', path: '/employeemy', category: 'Master', icon: 'bi-person-badge' },
    { id: 4, label: 'Products Master', path: '/productmy', category: 'Master', icon: 'bi-box' },
    { id: 5, label: 'Category Master', path: '/categoryform', category: 'Master', icon: 'bi-tags' },
    { id: 6, label: 'Sub Category Master', path: '/subcategoryform', category: 'Master', icon: 'bi-tag' },
    { id: 7, label: 'Super Sub Category Master', path: '/supersubcategoryform', category: 'Master', icon: 'bi-tag-fill' },
    { id: 10, label: 'Brand Master', path: '/brandform', category: 'Master', icon: 'bi-bookmark' },
    { id: 11, label: 'Price List', path: '/price-list-master', category: 'Master', icon: 'bi-list-ul' },
    { id: 13, label: 'UOM Master', path: '/uom', category: 'Master', icon: 'bi-measuring-cup' },
    { id: 14, label: 'Company Profile', path: '/company-profile', category: 'Master', icon: 'bi-building' },
    { id: 15, label: 'User List', path: '/users', category: 'Master', icon: 'bi-people-fill' },
    { id: 16, label: 'Masters Overview', path: '/masters', category: 'Master', icon: 'bi-gear' },
    { id: 17, label: 'User Privilege', path: '/userprivilege', category: 'Master', icon: 'bi-shield-lock' },
    { id: 18, label: 'Module Master', path: '/modulemaster', category: 'Master', icon: 'bi-grid' },
    { id: 19, label: 'Country Master', path: '/countrymaster', category: 'Master', icon: 'bi-globe' },
    { id: 20, label: 'State Master', path: '/statemaster', category: 'Master', icon: 'bi-map' },
    { id: 21, label: 'City Master', path: '/citymaster', category: 'Master', icon: 'bi-geo-alt' },
    { id: 22, label: 'User Type Master', path: '/usertypemaster', category: 'Master', icon: 'bi-person-gear' },
    { id: 23, label: 'Mode of Payment', path: '/modeofpayment', category: 'Master', icon: 'bi-credit-card' },
    { id: 24, label: 'Bank Account', path: '/bankaccount', category: 'Master', icon: 'bi-bank' },
    { id: 25, label: 'Account Head', path: '/accounthead', category: 'Master', icon: 'bi-journal-bookmark' },
    { id: 26, label: 'Lead Source Master', path: '/lead-source', category: 'Master', icon: 'bi-box-arrow-in-right' },
    { id: 27, label: 'Product Type Master', path: '/product-type', category: 'Master', icon: 'bi-box-seam' },
    { id: 28, label: 'Lead Status Master', path: '/lead-status', category: 'Master', icon: 'bi-flag' },

    // Production Items
    { id: 181, label: 'Production Lot List', path: '/production-lot-list', category: 'Production', icon: 'bi-list-ul' },
    { id: 182, label: 'Internal Lot List', path: '/internal-lot-list', category: 'Production', icon: 'bi-list-stars' },
    { id: 183, label: 'TNA Track', path: '/tna-track', category: 'Production', icon: 'bi-calendar-check' },
    { id: 184, label: 'Order Planning', path: '/order-planning-my', category: 'Production', icon: 'bi-clipboard-check' },
    { id: 185, label: 'Style Planning', path: '/style-planning-my', category: 'Production', icon: 'bi-palette' },

    // Regular Accounting Forms
    { id: 30, label: 'Invoice Form (New)', path: '/invoiceform', category: 'Form', icon: 'bi-file-earmark-plus' },
    { id: 31, label: 'Quotation Form (New)', path: '/quotationform', category: 'Form', icon: 'bi-file-earmark-text' },
    { id: 32, label: 'Purchase Form (New)', path: '/purchaseform', category: 'Form', icon: 'bi-cart-plus' },
    { id: 33, label: 'Receipt Form (New)', path: '/receiptform', category: 'Form', icon: 'bi-receipt' },
    { id: 34, label: 'Voucher Form (New)', path: '/voucherform', category: 'Form', icon: 'bi-cash-coin' },
    { id: 35, label: 'DC (Delivery Challan) Form', path: '/dcform', category: 'Form', icon: 'bi-truck' },
    { id: 36, label: 'PI (Proforma Invoice) Form', path: '/piform', category: 'Form', icon: 'bi-file-earmark-spreadsheet' },
    { id: 37, label: 'PO (Purchase Order) Form', path: '/poform', category: 'Form', icon: 'bi-bag-plus' },
    { id: 38, label: 'GRN (Goods Received) Form', path: '/grnform', category: 'Form', icon: 'bi-box-arrow-in-down' },
    { id: 39, label: 'Debit Note Form', path: '/debitnoteform', category: 'Form', icon: 'bi-file-earmark-minus' },
    { id: 40, label: 'Credit Note Form', path: '/creditnoteform', category: 'Form', icon: 'bi-file-earmark-plus' },
    { id: 41, label: 'Sales Return Form', path: '/salesreturnform', category: 'Form', icon: 'bi-arrow-left-right' },
    { id: 42, label: 'Purchase Return Form', path: '/purchasereturnform', category: 'Form', icon: 'bi-arrow-repeat' },
    { id: 43, label: 'Estimate Form', path: '/estimateform', category: 'Form', icon: 'bi-calculator' },

    // Reports
    { id: 50, label: 'Reports Overview', path: '/reports', category: 'Report', icon: 'bi-graph-up' },
    { id: 51, label: 'Outstanding Report', path: '/outstanding', category: 'Report', icon: 'bi-clock-history' },
    { id: 52, label: 'Invoice Ledger', path: '/invoice-ledger', category: 'Report', icon: 'bi-journal-text' },
    { id: 77, label: 'GSTR-1 Report', path: '/gstr1-report', category: 'Report', icon: 'bi-file-earmark-ruled' },
    { id: 86, label: 'Balance Sheet', path: '/balance-sheet', category: 'Report', icon: 'bi-bank' },
    { id: 87, label: 'Trial Balance', path: '/trial-balance', category: 'Report', icon: 'bi-scales' },
    { id: 88, label: 'General Ledger', path: '/general-ledger', category: 'Report', icon: 'bi-journal-medical' },
    { id: 72, label: 'Profit and Loss Report', path: '/profit-loss', category: 'Report', icon: 'bi-calculator' },
    { id: 76, label: 'Stock Report (Inventory)', path: '/stock-report', category: 'Report', icon: 'bi-box-seam' },

    // Modules
    { id: 80, label: 'Inventory', path: '/inventory', category: 'Module', icon: 'bi-box-seam' },
    { id: 81, label: 'Contacts', path: '/contacts', category: 'Module', icon: 'bi-person-lines-fill' },
    { id: 82, label: 'Accounts', path: '/accounts', category: 'Module', icon: 'bi-calculator' },
    { id: 83, label: 'Dashboard', path: '/dashboard', category: 'Module', icon: 'bi-speedometer2' },

    // Transactions / Lists
    { id: 90, label: 'Invoices List', path: '/invoicemy', category: 'Transaction', icon: 'bi-file-earmark-check' },
    { id: 95, label: 'POs List', path: '/pomy', category: 'Transaction', icon: 'bi-bag-check' },
    { id: 96, label: 'DCs List', path: '/dcmy', category: 'Transaction', icon: 'bi-truck' },
    { id: 97, label: 'GRNs List', path: '/grnmy', category: 'Transaction', icon: 'bi-box-arrow-in-down' },
    { id: 105, label: 'Leads List (CRM)', path: '/lead-my', category: 'Transaction', icon: 'bi-people-fill' },

];

const UniversalSearch = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const navigate = useNavigate();
    const wrapperRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = (e) => {
        const val = e.target.value;
        setQuery(val);
        if (val.length > 0) {
            const filtered = searchItems.filter(item =>
                item.label.toLowerCase().includes(val.toLowerCase()) ||
                item.category.toLowerCase().includes(val.toLowerCase())
            ).slice(0, 10);
            setResults(filtered);
            setIsOpen(true);
            setActiveIndex(-1);
        } else {
            setResults([]);
            setIsOpen(false);
        }
    };

    const handleSelect = (path) => {
        navigate(path);
        setQuery('');
        setIsOpen(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            setActiveIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
        } else if (e.key === 'ArrowUp') {
            setActiveIndex(prev => (prev > 0 ? prev - 1 : prev));
        } else if (e.key === 'Enter') {
            if (activeIndex >= 0 && results[activeIndex]) {
                handleSelect(results[activeIndex].path);
            } else if (results.length > 0) {
                handleSelect(results[0].path);
            }
        } else if (e.key === 'Escape') {
            setIsOpen(false);
        }
    };

    return (
        <div ref={wrapperRef} className="universal-search-wrapper" style={{ width: '100%', maxWidth: '600px', margin: '0 auto' }}>
            <div className="position-relative search-container" style={{ width: '100%' }}>
                <div className="input-group search-input-group shadow-sm rounded-pill overflow-hidden border">
                    <span className="input-group-text bg-white border-0 ps-3">
                        <i className="bi bi-search text-primary"></i>
                    </span>
                    <input
                        type="text"
                        className="form-control border-0 py-2 ps-1 pe-3"
                        placeholder="Search masters, reports, or modules..."
                        value={query}
                        onChange={handleSearch}
                        onKeyDown={handleKeyDown}
                        onFocus={() => query.length > 0 && setIsOpen(true)}
                        style={{ boxShadow: 'none', background: 'transparent' }}
                    />
                </div>
                {isOpen && results.length > 0 && (
                    <div className="search-dropdown position-absolute w-100 shadow-lg mt-2 rounded-3 bg-white border no-print"
                        style={{ zIndex: 9999, maxHeight: '400px', overflowY: 'auto' }}>
                        <ul className="list-group list-group-flush">
                            {results.map((res, index) => (
                                <li
                                    key={res.id}
                                    className={`list-group-item list-group-item-action d-flex align-items-center border-0 py-2 px-3 ${activeIndex === index ? 'active' : ''}`}
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => handleSelect(res.path)}
                                    onMouseEnter={() => setActiveIndex(index)}
                                >
                                    <i className={`bi ${res.icon} me-3 fs-5 ${activeIndex === index ? 'text-white' : 'text-primary'}`}></i>
                                    <div className="flex-grow-1">
                                        <div className={`fw-semibold ${activeIndex === index ? 'text-white' : 'text-dark'}`} style={{ fontSize: '0.9rem' }}>{res.label}</div>
                                        <div className={`${activeIndex === index ? 'text-white-50' : 'text-muted'}`} style={{ fontSize: '0.75rem' }}>{res.category}</div>
                                    </div>
                                    <i className={`bi bi-arrow-return-left small opacity-50 ${activeIndex === index ? 'text-white' : ''}`}></i>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            <style>{`
                .search-input-group {
                    transition: all 0.3s;
                    background: #f8f9fa;
                }
                .search-input-group:focus-within {
                    background: #fff;
                    border-color: #0d6efd !important;
                    box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.1) !important;
                }
                .search-dropdown {
                    animation: slideDown 0.2s ease-out;
                }
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @media (max-width: 576px) {
                    .search-container {
                        max-width: 100% !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default UniversalSearch;
