import React from 'react';

const Gallery = () => {
    const items = [
        { title: 'Command Center', image: '/assets/landing/dashboard.png', desc: 'Real-time production ecosystem with live stat tracking and order pipelines.' },
        { title: 'Garments Module', image: '/assets/landing/garments.png', desc: 'Unified hub for planning, jobwork operations, and resource allocation.' },
        { title: 'Accounts & Finance', image: '/assets/landing/accounts.png', desc: 'Professional invoicing, receipt management, and automated accounting workflows.' },
        { title: 'TNA Tracking', image: '/assets/landing/tna.png', desc: 'Milestone-based production monitoring with automated status progression.' },
        { title: 'Advanced Reports', image: '/assets/landing/reports.png', desc: 'Specialized business intelligence and operations auditing for deeper insights.' },
    ];

    return (
        <section id="gallery" className="gallery-section">
            <h2 className="text-3xl font-bold text-center mb-12">Experience the Power</h2>
            <div className="gallery-grid">
                {items.map((item, idx) => (
                    <div key={idx} className="gallery-item">
                        <img src={item.image} alt={item.title} className="gallery-image" />
                        <div className="gallery-content">
                            <h3>{item.title}</h3>
                            <p className="text-gray-500 text-sm">{item.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Gallery;
