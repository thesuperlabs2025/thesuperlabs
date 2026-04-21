import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

function Contacts() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Contacts - TSL ERP";
  }, []);

  const contactsCards = [
    {
      title: "Customers",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      path: "/customermy",
      color: "#2196F3",
    },
    {
      title: "Supplier",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="1" y="3" width="15" height="13" />
          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
          <circle cx="5.5" cy="18.5" r="2.5" />
          <circle cx="18.5" cy="18.5" r="2.5" />
        </svg>
      ),
      path: "/suppliermy",
      color: "#ff9800",
    },
    {
      title: "Employee",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
      path: "/employeemy",
      color: "#4caf50",
    },
  ];

  const Card = ({ title, icon, path, color }) => (
    <div className="col-xl-4 col-lg-4 col-md-6 col-sm-6 mb-4">
      <div
        className="card-module"
        onClick={() => path && navigate(path)}
        style={{
          "--card-color": color,
        }}
      >
        <div className="icon-container" style={{ color }}>
          {icon}
        </div>
        <h6 className="module-title">{title}</h6>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        .card-module {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 30px 20px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          cursor: pointer;
          min-height: 140px;
          border: 2px solid transparent;
          position: relative;
          overflow: hidden;
        }

        .card-module::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: var(--card-color);
          transform: scaleX(0);
          transition: transform 0.3s ease;
        }

        .card-module:hover::before {
          transform: scaleX(1);
        }

        .card-module:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
          border-color: var(--card-color);
        }

        .icon-container {
          width: 45px;
          height: 45px;
          margin-bottom: 15px;
          transition: transform 0.3s ease;
        }

        .card-module:hover .icon-container {
          transform: scale(1.1);
        }

        .icon-container svg {
          width: 100%;
          height: 100%;
        }

        .module-title {
          font-weight: 600;
          margin: 0;
          color: #333;
          font-size: 16px;
          text-align: center;
        }

        .contacts-header {
          display: flex;
          align-items: center;
          margin-bottom: 40px;
          padding: 25px 30px;
          background: #fff;
          border: 1px solid #e0e0e0;
          border-radius: 16px;
        }

        .header-content h2 {
          font-weight: 700;
          margin-bottom: 10px;
          font-size: 32px;
          color: #333;
        }

        .header-content p {
          margin: 0;
          color: #666;
          font-size: 15px;
          line-height: 1.6;
        }

        @media (max-width: 768px) {
          .contacts-header {
            text-align: center;
            padding: 20px;
          }

          .header-content h2 {
            font-size: 24px;
          }

          .header-content p {
            font-size: 14px;
          }

          .card-module {
            min-height: 120px;
            padding: 20px 15px;
          }

          .icon-container {
            width: 38px;
            height: 38px;
            margin-bottom: 10px;
          }

          .module-title {
            font-size: 14px;
          }
        }

        @media (max-width: 576px) {
          .card-module {
            min-height: 100px;
          }

          .header-content h2 {
            font-size: 20px;
          }
        }
      `}</style>

      <div className="container py-4">
        {/* Header */}
        <div className="contacts-header">
          <div className="header-content">
            <h2>Contacts</h2>
            <p>
              Here Contacts are the Company or a Person You Do Business with, they can be
              either a Customer or a Supplier.
            </p>
          </div>
        </div>

        {/* Contact Cards */}
        <div className="row">
          {contactsCards.map((card, i) => (
            <Card key={i} {...card} />
          ))}
        </div>
      </div>
    </>
  );
}

export default Contacts;
