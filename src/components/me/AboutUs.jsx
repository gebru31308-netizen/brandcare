
import React from 'react';

function AboutUs({ onBack }) {
  return (
    <div className="container py-4" style={{ maxWidth: 550 }}>
      <div className="d-flex align-items-center gap-3 mb-4">
        <button className="btn btn-light rounded-circle shadow-sm" onClick={onBack}>
          <i className="bi bi-arrow-left fs-5" />
        </button>
        <h5 className="fw-bold mb-0">About Us</h5>
      </div>

      <div className="bg-white rounded-4 shadow-sm p-4 text-center">
        <div className="mx-auto mb-3 rounded-4 d-flex align-items-center justify-content-center"
          style={{ width: 85, height: 85, background: '#F4F0FF', color: '#9B7AF2' }}>
          <i className="bi bi-shop fs-1" />
        </div>

        <h3 className="fw-bold mb-1">BrandCare</h3>
        <p className="text-muted small">Your trusted shopping experience.</p>

        <div className="my-4" style={{ height: 1, background: '#eee' }} />

        <h6 className="fw-bold">Who We Are</h6>
        <p className="text-muted small mb-0 lh-lg">
          BrandCare helps customers discover quality products, access
          convenient services, and earn referral commissions.
        </p>

        <div className="mt-4 rounded-3 p-3"
          style={{ background: '#F4F0FF', color: '#7651D5' }}>
          <i className="bi bi-heart-fill me-2" />
          <span className="small fw-semibold">Thank you for choosing BrandCare!</span>
        </div>
      </div>

      <p className="text-center text-muted small mt-4">© {new Date().getFullYear()} BrandCare. All rights reserved.</p>
    </div>
  );
}

export default AboutUs;
