
import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabase';

const BRAND = '#9B7AF2';
const GRADIENT = 'linear-gradient(135deg, #9B7AF2, #7651D5)';
const money = value => Number(value || 0).toLocaleString('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

function Profile({ currentUser, onHome, onLogout, onNavigate }) {
  const [wallet, setWallet] = useState({ balance: 0, income: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!currentUser?.id) return setLoading(false);

      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('balance, commission_balance')
        .eq('id', currentUser.id)
        .single();

      if (error) console.error('Error fetching profile:', error.message);
      else setWallet({
        balance: Number(data.balance || 0),
        income: Number(data.commission_balance || 0)
      });

      setLoading(false);
    };

    fetchProfile();
  }, [currentUser?.id]);

  const menu = [
    ['bi-chat-left-text', 'Messages', 'View your messages', () => onNavigate('messages')],
    ['bi-person-vcard', 'Personal Information', 'Manage your account', () => onNavigate('information')],
    ['bi-info-circle', 'About Us', 'Learn about BrandCare', () => onNavigate('about')],
    ['bi-box-arrow-right', 'Logout', 'Sign out of your account', onLogout]
  ];

  const card = (icon, title, value) => (
    <div className="col-6">
      <div className="bg-white border rounded-4 p-3 h-100 shadow-sm">
        <div className="rounded-3 d-flex align-items-center justify-content-center mb-3"
          style={{ width: 42, height: 42, background: '#F4F0FF', color: BRAND }}>
          <i className={`bi ${icon} fs-4`} />
        </div>
        <small className="text-muted">{title}</small>
        <h6 className="fw-bold mb-0 mt-1" style={{ color: BRAND }}>
          {money(value)} ETB
        </h6>
      </div>
    </div>
  );

  return (
    <div className="container py-4" style={{ maxWidth: 600 }}>
      <div className="d-flex align-items-center gap-3 mb-4">
        <button onClick={onHome} className="btn bg-white rounded-circle shadow-sm">
          <i className="bi bi-arrow-left fs-5" style={{ color: BRAND }} />
        </button>
        <div>
          <h5 className="fw-bold mb-0">My Profile</h5>
          <small className="text-muted">Manage your account</small>
        </div>
      </div>

      <div className="rounded-4 p-4 mb-4 text-white shadow-sm"
        style={{ background: GRADIENT }}>
        <div className="d-flex align-items-center gap-3">
          <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
            style={{ width: 62, height: 62, background: '#ffffff30', border: '2px solid #ffffff80' }}>
            <i className="bi bi-person-fill fs-1" />
          </div>
          <div>
            <h5 className="fw-bold mb-1">My Profile</h5>
            <div className="small opacity-75">
              <i className="bi bi-telephone me-2" />
              {currentUser?.phone || 'No phone number'}
            </div>
            <div className="small mt-1 opacity-75">
              <i className="bi bi-patch-check-fill me-1" /> BrandCare Member
            </div>
          </div>
        </div>
      </div>

      <h6 className="fw-bold mb-3">My Wallet</h6>
      {loading ? (
        <div className="text-center py-4 bg-white rounded-4 shadow-sm mb-4">
          <div className="spinner-border" style={{ color: BRAND }} />
          <p className="text-muted small mb-0 mt-2">Loading wallet...</p>
        </div>
      ) : (
        <div className="row g-3 mb-4">
          {card('bi-wallet2', 'Current Balance', wallet.balance)}
          {card('bi-people-fill', 'Referral Income', wallet.income)}
        </div>
      )}

      <h6 className="fw-bold mb-3">Account Settings</h6>
      <div className="row g-3">
        {menu.map(([icon, title, description, action]) => (
          <div className="col-6" key={title}>
            <button onClick={action}
              className="w-100 h-100 text-start border-0 bg-white rounded-4 p-3 shadow-sm"
              style={{ minHeight: 125 }}>
              <div className="rounded-3 d-flex align-items-center justify-content-center mb-3"
                style={{ width: 43, height: 43, background: '#F4F0FF', color: BRAND }}>
                <i className={`bi ${icon} fs-4`} />
              </div>
              <div className="fw-bold small mb-1" style={{ color: BRAND }}>{title}</div>
              <small className="text-muted" style={{ fontSize: 11 }}>{description}</small>
            </button>
          </div>
        ))}
      </div>

      <p className="text-center text-muted small mt-4 mb-0">
        BrandCare • Your account, your convenience
      </p>
    </div>
  );
}

export default Profile;
