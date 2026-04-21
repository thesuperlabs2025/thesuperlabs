import React from 'react';
import Hero from './design-cards/Hero';
import Gallery from './design-cards/Gallery';
import About from './design-cards/About';
import FAQ from './design-cards/FAQ';
import WhatsAppWidget from './design-cards/WhatsAppWidget';
import './LandingPage.css';

const LandingPage = () => {
    React.useEffect(() => {
        document.title = "Design Card - TSL ERP";
    }, []);

    return (
        <div className="landing-container">
            <Hero />
            <Gallery />
            <About />
            <FAQ />
            <WhatsAppWidget />

            <footer className="py-12 bg-dark text-white text-center mt-20">
                <p className="opacity-75">&copy; 2026 TSL ERP. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default LandingPage;
