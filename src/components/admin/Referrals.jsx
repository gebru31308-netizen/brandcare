
import React from 'react';

const BRAND = '#9B7AF2';

function Referrals({ onBack }) {
  return (
    <div className="container py-3" style={{ maxWidth: 750 }}>
      <div className="d-flex align-items-center gap-2 rounded-4 p-3 mb-3 text-white shadow-sm"
        style={{ background: 'linear-gradient(135deg, #9B7AF2, #7651D5)' }}>
        <button onClick={onBack} className="btn btn-light btn-sm rounded-circle">
          <i className="bi bi-arrow-left" style={{ color: BRAND }} />
        </button>
        <i className="bi bi-link-45deg fs-4" />
        <div>
          <h6 className="fw-bold mb-0">Referral Manager</h6>
          <small className="opacity-75">Manage customer invitations</small>
        </div>
      </div>

      <div className="bg-white rounded-4 shadow-sm p-4 text-center">
        <div className="rounded-4 d-flex align-items-center justify-content-center mx-auto mb-3"
          style={{ width: 65, height: 65, background: '#F4F0FF', color: BRAND }}>
          <i className="bi bi-people-fill fs-2" />
        </div>
        <h6 className="fw-bold mb-1">Referral Management</h6>
        <p className="text-muted small mb-3">
          Track invitation codes, referred customers and referral commissions.
        </p>
        <span className="badge rounded-pill px-3 py-2"
          style={{ background: '#F4F0FF', color: BRAND }}>
          Coming Soon
        </span>
      </div>
    </div>
  );
}

export default Referrals;
