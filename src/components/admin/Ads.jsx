
import React from 'react';

const BRAND = '#9B7AF2';

function Ads({ onBack }) {
  return (
    <div className="container py-3" style={{ maxWidth: 650 }}>
      <div className="d-flex align-items-center gap-3 mb-4">
        <button onClick={onBack}
          className="btn bg-white rounded-circle shadow-sm">
          <i className="bi bi-arrow-left fs-5" style={{ color: BRAND }} />
        </button>
        <div>
          <h5 className="fw-bold mb-0">Advertisements</h5>
          <small className="text-muted">Manage your promotions</small>
        </div>
      </div>

      <div className="bg-white rounded-4 shadow-sm p-4 text-center">
        <div className="mx-auto mb-3 rounded-4 d-flex align-items-center justify-content-center"
          style={{ width: 65, height: 65, background: '#F4F0FF', color: BRAND }}>
          <i className="bi bi-megaphone-fill fs-2" />
        </div>

        <h5 className="fw-bold mb-2">Manage Advertisements</h5>
        <p className="text-muted small mb-3">
          Add promotional images, advertising text, links and display dates.
        </p>

        <span className="badge rounded-pill px-3 py-2"
          style={{ background: '#F4F0FF', color: BRAND }}>
          Coming Soon
        </span>
      </div>
    </div>
  );
}

export default Ads;
