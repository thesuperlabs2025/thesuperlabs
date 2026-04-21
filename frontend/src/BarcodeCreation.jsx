import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import Barcode from 'react-barcode';
import { useReactToPrint } from 'react-to-print';
import html2pdf from 'html2pdf.js';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';

const API = process.env.REACT_APP_API_URL;

export default function BarcodeCreation() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [products, setProducts] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [barcodeList, setBarcodeList] = useState([]);
    const printRef = useRef();

    // Master search for products
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await axios.get(`${API}/products`, {
                    params: { term: searchTerm }
                });
                setProducts(res.data);
            } catch (error) {
                console.error("Error fetching products:", error);
            }
        };

        if (searchTerm.length > 2) {
            const delayDebounceFn = setTimeout(() => {
                fetchProducts();
            }, 300);
            return () => clearTimeout(delayDebounceFn);
        } else {
            setProducts([]);
        }
    }, [searchTerm]);

    const addProductToSelection = (product) => {
        const exists = selectedProducts.find(p => p.id === product.id);
        if (exists) {
            toast.warning("Product already added");
            return;
        }
        setSelectedProducts([...selectedProducts, { ...product, quantity: 1 }]);
        setSearchTerm('');
        setProducts([]);
    };

    const handleQuantityChange = (id, qty) => {
        setSelectedProducts(selectedProducts.map(p =>
            p.id === id ? { ...p, quantity: parseInt(qty) || 1 } : p
        ));
    };

    const removeProduct = (id) => {
        setSelectedProducts(selectedProducts.filter(p => p.id !== id));
    };

    const [globalCopies, setGlobalCopies] = useState(1);

    const applyGlobalCopies = () => {
        if (selectedProducts.length === 0) return;
        setSelectedProducts(selectedProducts.map(p => ({ ...p, quantity: parseInt(globalCopies) || 1 })));
        toast.info(`Updated all items to ${globalCopies} copies`);
    };

    const generateBarcodes = () => {
        if (selectedProducts.length === 0) {
            toast.error("Please select at least one product");
            return;
        }

        const list = [];
        selectedProducts.forEach(product => {
            const qty = parseInt(product.quantity) || 1;
            for (let i = 0; i < qty; i++) {
                list.push({
                    name: product.product_name,
                    sku: product.sku,
                    barcode: product.barcode || product.sku,
                    mrp: product.mrp,
                    selling_price: product.selling_price
                });
            }
        });
        setBarcodeList(list);
        toast.info(`Generated ${list.length} barcodes for preview`);
    };

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: 'Product Barcodes',
    });

    const handleDownloadPDF = () => {
        if (barcodeList.length === 0) {
            toast.error("Generate barcodes first");
            return;
        }

        const element = printRef.current;
        const opt = {
            margin: 5,
            filename: `barcodes_${new Date().getTime()}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(element).save();
        toast.success("PDF Download Started");
    };

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '24px 20px', fontFamily: "'Inter', system-ui, sans-serif" }}>
            <ToastContainer />

            {/* Header */}
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #1d4ed8, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className="bi bi-upc-scan" style={{ fontSize: 22, color: '#fff' }} />
                    </div>
                    <div>
                        <h2 style={{ margin: 0, fontWeight: 800, fontSize: '1.4rem', color: '#0f172a', letterSpacing: '-0.03em' }}>Barcode Creation</h2>
                        <p style={{ margin: 0, fontSize: 13, color: '#94a3b8', fontWeight: 500 }}>Generate and print product barcodes</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button style={{ padding: '9px 18px', borderRadius: 10, border: '1.5px solid #e2e8f0', background: '#fff', color: '#475569', fontWeight: 600, fontSize: 14, cursor: 'pointer' }} onClick={() => navigate('/inventory')}>
                        ← Back to Inventory
                    </button>
                    {barcodeList.length > 0 && (
                        <>
                            <button style={{ padding: '9px 18px', borderRadius: 10, border: 'none', background: '#ef4444', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }} onClick={handleDownloadPDF}>
                                <i className="bi bi-file-earmark-pdf" /> Download PDF
                            </button>
                            <button style={{ padding: '9px 18px', borderRadius: 10, border: 'none', background: '#10b981', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }} onClick={handlePrint}>
                                <i className="bi bi-printer" /> Print Barcodes
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Main Grid */}
            <div className="no-print" style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 16, marginBottom: 24 }}>
                {/* Search */}
                <div style={{ background: '#fff', borderRadius: 16, padding: '20px 22px', border: '1.5px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1e293b', marginBottom: 4 }}>Search Product</div>
                    <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 16 }}>Scan barcode or type product name / SKU</div>
                    <div style={{ position: 'relative' }}>
                        <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: 12, padding: '10px 16px', gap: 10, transition: 'border-color 0.2s' }}
                            onFocus={() => { }}
                        >
                            <i className="bi bi-search" style={{ color: '#94a3b8', fontSize: 16, flexShrink: 0 }} />
                            <input
                                type="text"
                                placeholder="Type product name or SKU..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                autoFocus
                                style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 14, color: '#1e293b', width: '100%' }}
                            />
                            {searchTerm && (
                                <button onClick={() => { setSearchTerm(''); setProducts([]); }} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, color: '#94a3b8', fontSize: 16, flexShrink: 0 }}>✕</button>
                            )}
                        </div>
                        {products.length > 0 && (
                            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4, background: '#fff', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', border: '1.5px solid #f1f5f9', zIndex: 1000, overflow: 'hidden' }}>
                                {products.map(p => (
                                    <div key={p.id}
                                        onClick={() => addProductToSelection(p)}
                                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid #f8fafc', transition: 'background 0.15s' }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#eff6ff'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: 14, color: '#1e293b', maxWidth: 220, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.product_name}</div>
                                            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>SKU: {p.sku} • BC: {p.barcode}</div>
                                        </div>
                                        <span style={{ background: '#2563eb', color: '#fff', fontWeight: 700, fontSize: 12, padding: '4px 12px', borderRadius: 20, flexShrink: 0 }}>Add</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Selected Items */}
                <div style={{ background: '#fff', borderRadius: 16, border: '1.5px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #f8fafc', flexWrap: 'wrap', gap: 10 }}>
                        <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1e293b' }}>Selected Items</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #e2e8f0', borderRadius: 10, overflow: 'hidden', background: '#f8fafc' }}>
                                <span style={{ padding: '6px 12px', fontSize: 13, fontWeight: 600, color: '#64748b', borderRight: '1px solid #e2e8f0' }}>Copies</span>
                                <input
                                    type="number" min="1" value={globalCopies}
                                    onChange={(e) => setGlobalCopies(e.target.value)}
                                    style={{ width: 52, border: 'none', background: 'transparent', padding: '6px 8px', fontSize: 14, fontWeight: 700, outline: 'none', textAlign: 'center', color: '#1e293b' }}
                                />
                                <button onClick={applyGlobalCopies} style={{ border: 'none', background: '#2563eb', color: '#fff', padding: '6px 12px', cursor: 'pointer', fontWeight: 700, fontSize: 12 }} title="Apply to all">Apply</button>
                            </div>
                            {selectedProducts.length > 0 && (
                                <button onClick={() => setSelectedProducts([])} style={{ padding: '6px 14px', border: '1.5px solid #fecaca', background: '#fff', color: '#ef4444', borderRadius: 10, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Clear</button>
                            )}
                            <button onClick={generateBarcodes} disabled={selectedProducts.length === 0}
                                style={{ padding: '7px 18px', border: 'none', background: selectedProducts.length === 0 ? '#f1f5f9' : '#2563eb', color: selectedProducts.length === 0 ? '#94a3b8' : '#fff', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: selectedProducts.length === 0 ? 'not-allowed' : 'pointer' }}
                            >Generate</button>
                        </div>
                    </div>
                    <div style={{ maxHeight: 250, overflowY: 'auto' }}>
                        {selectedProducts.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
                                <i className="bi bi-cart-plus" style={{ fontSize: 32, marginBottom: 8, display: 'block' }} />
                                No products selected
                            </div>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: '#f8fafc', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                                        <th style={{ padding: '10px 20px', textAlign: 'left' }}>Product</th>
                                        <th style={{ padding: '10px', textAlign: 'center', width: 140 }}>Qty to Print</th>
                                        <th style={{ padding: '10px', textAlign: 'center', width: 50 }}>#</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedProducts.map(p => (
                                        <tr key={p.id} style={{ borderTop: '1px solid #f8fafc' }}>
                                            <td style={{ padding: '12px 20px' }}>
                                                <div style={{ fontWeight: 700, fontSize: 14, color: '#1e293b' }}>{p.product_name}</div>
                                                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                                                    SKU: {p.sku} • Barcode: {p.barcode}
                                                </div>
                                            </td>
                                            <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                                                    <button onClick={() => handleQuantityChange(p.id, Math.max(1, p.quantity - 1))} style={{ width: 28, height: 28, border: '1.5px solid #e2e8f0', borderRadius: 8, background: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>-</button>
                                                    <input type="text" value={p.quantity} onChange={(e) => handleQuantityChange(p.id, e.target.value)}
                                                        style={{ width: 44, height: 28, textAlign: 'center', border: '1.5px solid #e2e8f0', borderRadius: 8, fontWeight: 700, fontSize: 14, outline: 'none' }} />
                                                    <button onClick={() => handleQuantityChange(p.id, p.quantity + 1)} style={{ width: 28, height: 28, border: '1.5px solid #e2e8f0', borderRadius: 8, background: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                                                </div>
                                            </td>
                                            <td style={{ textAlign: 'center', padding: '12px 8px' }}>
                                                <button onClick={() => removeProduct(p.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: 18 }}>
                                                    <i className="bi bi-trash" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            {/* Preview Section */}
            <div style={{ marginBottom: 12 }} className="no-print">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 4, height: 20, borderRadius: 2, background: '#2563eb' }} />
                    <span style={{ fontWeight: 800, fontSize: '1rem', color: '#1e293b' }}>Preview &amp; Print Area</span>
                    {barcodeList.length > 0 && <span style={{ background: '#dbeafe', color: '#2563eb', fontWeight: 700, fontSize: 12, padding: '2px 10px', borderRadius: 20 }}>{barcodeList.length} labels</span>}
                </div>
            </div>
            <div style={{ background: '#f1f5f9', borderRadius: 16, padding: 16, border: '1.5px solid #e2e8f0' }}>
                <div ref={printRef} className="print-area">
                    <style dangerouslySetInnerHTML={{
                        __html: `
                        @media screen {
                            .print-area { 
                                display: grid;
                                grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
                                gap: 15px;
                                min-height: 200px;
                            }
                            .barcode-label { 
                                background: white; 
                                border: none; 
                                border-radius: 4px;
                                padding: 12px;
                                text-align: center;
                                transition: all 0.2s;
                            }
                            .barcode-label:hover { transform: translateY(-2px); }
                        }
                        @media print {
                            body * { visibility: hidden; }
                            .print-area, .print-area * { visibility: visible; }
                            .print-area { 
                                position: absolute; 
                                left: 0; 
                                top: 0; 
                                width: 100%;
                                display: block !important;
                            }
                            .barcode-label { 
                                width: 48mm; 
                                height: 25mm; 
                                padding: 2mm; 
                                border: none; 
                                display: inline-block; 
                                margin: 1mm;
                                text-align: center;
                                overflow: hidden;
                                font-family: Arial, sans-serif;
                                font-size: 8pt;
                                page-break-inside: avoid;
                            }
                            .no-print { display: none !important; }
                        }
                        .barcode-name { 
                            font-weight: bold; 
                            font-size: 10px;
                            white-space: nowrap; 
                            overflow: hidden; 
                            text-overflow: ellipsis; 
                            margin-bottom: 2px;
                        }
                        .barcode-details { font-weight: bold; font-size: 8px; color: #333; margin-bottom: 3px; }
                        .barcode-render { margin: 4px 0; }
                        .barcode-render svg { width: 100% !important; height: auto !important; max-height: 35px !important; }
                        .barcode-price { font-weight: bold; font-size: 14px; margin-top: 5px; padding-top: 2px; }
                    `}} />

                    {barcodeList.length > 0 ? (
                        barcodeList.map((item, idx) => (
                            <div key={idx} className="barcode-label">
                                <div className="barcode-name">{item.name}</div>
                                <div className="barcode-details">{item.sku}</div>
                                <div className="barcode-render">
                                    <Barcode
                                        value={item.barcode}
                                        width={1.2}
                                        height={30}
                                        fontSize={10}
                                        margin={0}
                                        background="transparent"
                                        displayValue={true}
                                    />
                                </div>
                                <div className="barcode-price">M.R.P: ₹{item.mrp || item.selling_price}</div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center w-100 py-5 text-muted no-print">
                            <i className="bi bi-eye-slash fs-2 mb-2 d-block"></i>
                            Generate labels to see preview
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
