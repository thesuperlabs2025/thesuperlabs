import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

function Inventory() {
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "Inventory - TSL ERP";
    }, []);

    const inventoryOptions = [
        {
            title: 'Products',
            description: 'Manage your product catalog',
            icon: 'bi-box-seam',
            color: '#0d6efd',
            path: '/productmy'
        },
        {
            title: 'Bulk Creator',
            description: 'Create multiple products at once',
            icon: 'bi-grid-3x3-gap-fill',
            color: '#198754',
            path: '/product-bulk-creator'
        },
        {
            title: 'Price List',
            description: 'Manage pricing for different customer groups',
            icon: 'bi-tags',
            color: '#fd7e14',
            path: '/price-list-master'
        },
        {
            title: 'Inwards',
            description: 'Manage simplified goods receipt',
            icon: 'bi-box-arrow-in-down',
            color: '#6f42c1',
            path: '/inwardmy'
        },
        {
            title: 'Barcode Creation',
            description: 'Generate and print product barcodes',
            icon: 'bi-upc-scan',
            color: '#dc3545',
            path: '/barcode-creation'
        },
      
    ];

    return (
        <div className="container mt-5">
            <div className="mb-4">
                <h2 className="fw-bold">
                    <i className="bi bi-archive me-2"></i>
                    Inventory Management
                </h2>
                <p className="text-muted">Choose an option to manage your inventory</p>
            </div>

            <div className="row g-4">
                {inventoryOptions.map((option, index) => (
                    <div key={index} className="col-md-4">
                        <div
                            className="card h-100 shadow-sm border-0"
                            style={{
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                borderLeft: `4px solid ${option.color}`
                            }}
                            onClick={() => navigate(option.path)}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-5px)';
                                e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                            }}
                        >
                            <div className="card-body text-center p-5">
                                {option.image ? (
                                    <div className="mb-4" style={{ margin: '0 auto' }}>
                                        <img
                                            src={option.image}
                                            alt={option.title}
                                            style={{ width: 80, height: 80, objectFit: 'contain', borderRadius: '50%' }}
                                        />
                                    </div>
                                ) : (
                                    <div
                                        className="mb-4"
                                        style={{
                                            width: '80px',
                                            height: '80px',
                                            borderRadius: '50%',
                                            backgroundColor: `${option.color}15`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            margin: '0 auto'
                                        }}
                                    >
                                        <i
                                            className={`bi ${option.icon}`}
                                            style={{
                                                fontSize: '2.5rem',
                                                color: option.color
                                            }}
                                        ></i>
                                    </div>
                                )}
                                <h4 className="card-title fw-bold mb-3">{option.title}</h4>
                                <p className="card-text text-muted">{option.description}</p>
                                <button
                                    className="btn btn-sm mt-3"
                                    style={{
                                        backgroundColor: option.color,
                                        color: 'white',
                                        border: 'none'
                                    }}
                                >
                                    Open <i className="bi bi-arrow-right ms-2"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Inventory;
