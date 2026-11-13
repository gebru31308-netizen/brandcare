
import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabase';

import Products from './Products';
import Rewards from './Rewards';
import Ads from './Ads';
import Customers from './Customers';
import Recharges from './Recharges';
import Withdrawals from './Withdrawals';
import Referrals from './Referrals';

const BRAND = '#9B7AF2';
const GRADIENT = 'linear-gradient(135deg, #9B7AF2, #7651D5)';

const menuItems = [
  ['customers', 'bi-people-fill', 'Customers', 'View registered users'],
  ['products', 'bi-box-seam-fill', 'Products', 'Manage store products'],
  ['recharges', 'bi-wallet-fill', 'Recharges', 'Review customer deposits'],
  ['withdrawals', 'bi-wallet2', 'Withdrawals', 'Review withdrawal requests'],
  ['rewards', 'bi-gift-fill', 'Rewards', 'Manage user rewards'],
  ['ads', 'bi-megaphone-fill', 'Advertisements', 'Manage promotions'],
  ['referrals', 'bi-link-45deg', 'Referrals', 'Track referral activity']
];

function Admin({ currentUser, adminCredentials, onBack }) {
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);
  const [section, setSection] = useState('dashboard');

  useEffect(() => {
    let active = true;

    const verifyAdmin = async () => {
      if (!currentUser?.id || !adminCredentials?.phone || !adminCredentials?.password) {
        if (active) {
          setChecking(false);
          alert('Please log in again.');
          onBack?.();
        }
        return;
      }

      const { data, error } = await supabase.rpc('admin_get_withdrawals', {
        p_phone: adminCredentials.phone,
        p_password: adminCredentials.password
      });

      if (!active) return;

      if (error || !data?.success) {
        console.error('Admin verification error:', error || data?.message);
        setChecking(false);
        alert(data?.message || error?.message || 'Admin access denied.');
        onBack?.();
        return;
      }

      setAuthorized(true);
      setChecking(false);
    };

    verifyAdmin();
    return () => { active = false; };
  }, [currentUser?.id, adminCredentials?.phone, adminCredentials?.password, onBack]);

  const backToDashboard = () => setSection('dashboard');

  const pages = {
    customers: <Customers onBack={backToDashboard} />,
    products: <Products onBack={backToDashboard} />,
    recharges: <Recharges adminCredentials={adminCredentials} onBack={backToDashboard} />,
    withdrawals: <Withdrawals adminCredentials={adminCredentials} onBack={backToDashboard} />,
    rewards: <Rewards adminCredentials={adminCredentials} onBack={backToDashboard} />,
    ads: <Ads onBack={backToDashboard} />,
    referrals: <Referrals onBack={backToDashboard} />
  };

  if (checking) return (
    <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center bg-light">
      <div className="spinner-border mb-3" style={{ color: BRAND }} />
      <p className="text-muted fw-semibold">Checking admin access...</p>
    </div>
  );

  if (!authorized) return null;
  if (section !== 'dashboard') return pages[section] || null;

  return (
    <div className="min-vh-100 bg-light pb-5">
      <div className="container py-3 px-3 px-md-4">

        {/* COMPACT HEADER */}
        <div className="rounded-4 px-3 py-2 text-white shadow mb-3"
          style={{ background: GRADIENT }}>

          <div className="d-flex align-items-center gap-2 mb-2">
            <button onClick={onBack}
              className="btn btn-light btn-sm rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: 34, height: 34 }}>
              <i className="bi bi-arrow-left" style={{ color: BRAND }} />
            </button>

            <small className="badge rounded-pill px-2 py-1"
              style={{ background: '#ffffff30' }}>
              <i className="bi bi-shield-check me-1" /> ADMIN PANEL
            </small>
          </div>

          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-speedometer2" style={{ fontSize: 30 }} />
            <div>
              <h5 className="fw-bold mb-0">Admin Dashboard</h5>
              <small className="opacity-75">Welcome back, Admin 👋</small>
            </div>
          </div>

          <div className="d-flex justify-content-between align-items-center mt-2">
            <small className="opacity-75">Manage your BrandCare platform</small>
            <span className="badge bg-white rounded-pill"
              style={{ color: '#7651D5' }}>
              {menuItems.length} Sections
            </span>
          </div>
        </div>

        {/* SECTION HEADING */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5 className="fw-bold mb-1">Platform Management</h5>
            <small className="text-muted">Choose what you want to manage</small>
          </div>
          <i className="bi bi-grid-fill fs-4" style={{ color: BRAND }} />
        </div>

        {/* ADMIN MENU */}
        <div className="row g-3">
          {menuItems.map(([id, icon, title, description]) => (
            <div className="col-6 col-md-4 col-lg-3" key={id}>
              <button onClick={() => setSection(id)}
                className="btn bg-white border-0 shadow-sm rounded-4 w-100 text-start p-3 h-100"
                style={{ minHeight: 145 }}>
                <i className={`bi ${icon} fs-2 mb-3 d-block`}
                  style={{ color: BRAND }} />
                <div className="fw-bold text-dark mb-1">{title}</div>
                <small className="text-muted">{description}</small>
                <div className="text-end mt-2">
                  <i className="bi bi-arrow-up-right-circle-fill"
                    style={{ color: BRAND }} />
                </div>
              </button>
            </div>
          ))}
        </div>

        {/* FOOTER */}
        <div className="text-center mt-4 pt-3">
          <small className="text-muted">
            <i className="bi bi-shield-lock me-1" style={{ color: BRAND }} />
            BrandCare Administration
          </small>
        </div>
      </div>
    </div>
  );
}

export default Admin;
