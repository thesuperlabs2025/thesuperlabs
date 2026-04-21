import React, { useState } from 'react';

const FAQ = () => {
    const [active, setActive] = useState(0);

    const accordions = [
        {
            title: 'Are you struggling to track real-time production?',
            content: 'Our ERP provides live updates for every garment on the production line, ensuring zero blind spots in your manufacturing process.'
        },
        {
            title: 'Is your Time and Action (TNA) management inconsistent?',
            content: 'Automate your milestones and receive instant alerts if a process lags, keeping your shipping dates secure and your clients happy.'
        },
        {
            title: 'Finding it hard to balance accounts with production costs?',
            content: 'Integrate your financial data directly with production inputs, giving you accurate per-style margin and profit/loss reports.'
        },
        {
            title: 'Worried about branding consistency across your range?',
            content: 'Our branding tools ensure that from labels to packaging, your brand identity remains cohesive and professional on every SKU.'
        }
    ];

    return (
        <section className="faq-section">
            <h2 className="faq-title">Solving Production Challenges</h2>
            <div className="accordion-list">
                {accordions.map((item, idx) => (
                    <div key={idx} className={`accordion-item ${active === idx ? 'active' : ''}`}>
                        <div className="accordion-header" onClick={() => setActive(active === idx ? -1 : idx)}>
                            {item.title}
                            <span>{active === idx ? '−' : '+'}</span>
                        </div>
                        <div className="accordion-content">
                            {item.content}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default FAQ;
