import React from 'react';

const Loader = ({ message = "Loading..." }) => {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '300px', padding: '40px' }}>
      <div className="mb-4 position-relative">
        <img 
          src="/images/TSL Logo 4.jpg" 
          alt="Loading..." 
          style={{ 
            width: '80px', 
            height: '80px', 
            objectFit: 'contain',
            animation: 'pulse 1.5s infinite ease-in-out'
          }} 
        />
        <style>
          {`
            @keyframes pulse {
              0% { transform: scale(1); opacity: 1; }
              50% { transform: scale(1.1); opacity: 0.7; }
              100% { transform: scale(1); opacity: 1; }
            }
          `}
        </style>
      </div>
      <h5 className="text-muted fw-bold animate-pulse">{message}</h5>
    </div>
  );
};

export default Loader;
