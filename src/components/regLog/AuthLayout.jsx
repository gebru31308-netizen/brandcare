
import React from 'react';

function AuthLayout({ activeTab, onLoginTab, onRegisterTab, children }) {
  return (
    <div className="container min-vh-100 d-flex justify-content-center align-items-center py-4">
      <div className="w-100" style={{ maxWidth: '400px' }}>
        <div
          className="bg-white rounded-4 p-4 p-md-5"
          style={{
            boxShadow: '0 12px 40px rgba(75, 65, 160, 0.12)'
          }}
        >
          {/* BrandCare Heading */}
          <div className="text-center mb-3">
            <h3 className="fw-bold mb-2" style={{ color: '#4535bd' }}>
              BrandCare
            </h3>

            <hr
              className="mx-auto"
              style={{
                width: '65px',
                borderTop: '3px solid #6654e8',
                opacity: 1
              }}
            />
            
          </div>

          {/* Always Visible Login and Register Tabs */}
          <div
            className="d-flex align-items-center mb-4"
            style={{
              borderBottom: '1px solid #eee',
              gap: '15px'
            }}
          >
            <button
              type="button"
              onClick={onLoginTab}
              className="flex-fill bg-transparent fw-bold py-2"
              style={{
                border: 'none',
                borderBottom: activeTab === 'login'
                  ? '3px solid #6654e8'
                  : '3px solid transparent',
                color: activeTab === 'login' ? '#4535bd' : '#777',
                fontSize: '15px',
                marginBottom: '-1px'
              }}
            >
              Login
            </button>

            <button
              type="button"
              onClick={onRegisterTab}
              className="flex-fill bg-transparent fw-bold py-2"
              style={{
                border: 'none',
                borderBottom: activeTab === 'register'
                  ? '3px solid #6654e8'
                  : '3px solid transparent',
                color: activeTab === 'register' ? '#4535bd' : '#777',
                fontSize: '15px',
                marginBottom: '-1px'
              }}
            >
              Register
            </button>
          </div>

          {/* Form Content */}
          {children}
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
