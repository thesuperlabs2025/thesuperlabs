import React, { useState, useEffect } from 'react';

const slides = [
    { img: '/assets/landing/dashboard.png', title: 'Intelligent Dashboard', desc: 'Real-time business insights at a glance' },
    { img: '/assets/landing/garments.png', title: 'Production Management', desc: 'End-to-end garment manufacturing control' },
    { img: '/assets/landing/tna.png', title: 'Time & Action Tracking', desc: 'Never miss a delivery deadline again' },
    { img: '/assets/landing/accounts.png', title: 'Financial Analytics', desc: 'Complete accounting & financial visibility' },
    { img: '/assets/landing/reports.png', title: 'Advanced Reporting', desc: 'Data-driven decisions with smart reports' }
];

const About = () => {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent(prev => (prev + 1) % slides.length);
        }, 3000);
        return () => clearInterval(timer);
    }, []);

    return (
        <section className="about-section" style={{ padding: '4rem 1rem', background: '#fff' }}>
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>

                {/* ERP Screenshot Slider */}
                <div style={{
                    position: 'relative',
                    width: '100%',
                    height: '480px',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
                    border: '2px solid #e2e8f0',
                    background: '#1e293b'
                }}>
                    {/* Browser chrome bar */}
                    <div style={{
                        background: '#f1f5f9',
                        padding: '10px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        borderBottom: '1px solid #e2e8f0',
                        position: 'relative',
                        zIndex: 10
                    }}>
                        <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }}></span>
                        <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }}></span>
                        <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }}></span>
                        <div style={{
                            flex: 1, background: '#fff', borderRadius: '6px',
                            padding: '4px 12px', fontSize: '12px', color: '#94a3b8',
                            marginLeft: '8px', border: '1px solid #e2e8f0'
                        }}>
                            🔒 superlabs-erp.com / {slides[current].title.toLowerCase().replace(/ /g, '-')}
                        </div>
                    </div>

                    {/* Screenshot */}
                    <div style={{ position: 'relative', height: 'calc(100% - 40px)', overflow: 'hidden' }}>
                        <img
                            key={current}
                            src={slides[current].img}
                            alt={slides[current].title}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                objectPosition: 'top',
                                display: 'block',
                                animation: 'fadeSlideIn 0.6s ease'
                            }}
                        />
                        {/* Bottom overlay */}
                        <div style={{
                            position: 'absolute', bottom: 0, left: 0, right: 0,
                            background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)',
                            padding: '40px 24px 20px',
                        }}>
                            <h3 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>{slides[current].title}</h3>
                            <p style={{ color: 'rgba(255,255,255,0.65)', margin: '4px 0 0', fontSize: '0.95rem' }}>{slides[current].desc}</p>
                        </div>
                    </div>

                    {/* Dot indicators */}
                    <div style={{
                        position: 'absolute', bottom: '16px', right: '20px',
                        display: 'flex', gap: '6px', zIndex: 10
                    }}>
                        {slides.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrent(i)}
                                style={{
                                    width: i === current ? '24px' : '8px',
                                    height: '8px',
                                    borderRadius: '4px',
                                    background: i === current ? '#2563eb' : 'rgba(255,255,255,0.4)',
                                    border: 'none',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    padding: 0
                                }}
                            />
                        ))}
                    </div>
                </div>

                {/* Captions row */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '20px', flexWrap: 'wrap' }}>
                    {slides.map((slide, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrent(i)}
                            style={{
                                padding: '6px 16px',
                                borderRadius: '20px',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                border: i === current ? '2px solid #2563eb' : '2px solid #e2e8f0',
                                background: i === current ? '#eff6ff' : 'transparent',
                                color: i === current ? '#2563eb' : '#64748b',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            {slide.title}
                        </button>
                    ))}
                </div>

                {/* Section heading — pushed down */}
                <div style={{ marginTop: '80px', textAlign: 'center' }}>
                    <h2 style={{
                        fontSize: '2.25rem',
                        fontWeight: 800,
                        marginBottom: '1rem',
                        background: 'linear-gradient(135deg, #2563eb 0%, #6366f1 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                    }}>
                        Built for Modern Garments Logistics
                    </h2>
                    <p className="about-text">
                        Our Garments ERP is a user-friendly, high-performance platform that streamlines every aspect of your branding and manufacturing journey. From fabric procurement to final delivery, we provide a unified interface that eliminates complexity and empowers your team with real-time data accuracy and elegant branding tools.
                    </p>
                </div>

            </div>
        </section>
    );
};

export default About;
