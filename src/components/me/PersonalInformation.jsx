
import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabase';

const BRAND = '#9B7AF2';

function PersonalInformation({ currentUser, onBack }) {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInformation = async () => {
      if (!currentUser?.id) return setLoading(false);

      const { data, error } = await supabase
        .from('users')
        .select('id, phone, created_at, referral_code, bank_method, bank_account_name, bank_account_number')
        .eq('id', currentUser.id)
        .single();

      if (error) console.error('Error fetching personal information:', error.message);
      else setUserInfo(data);

      setLoading(false);
    };

    fetchInformation();
  }, [currentUser?.id]);

  const formatDate = date => date
    ? new Date(date).toLocaleDateString('en-GB', {
        day: '2-digit', month: 'long', year: 'numeric'
      })
    : 'Not available';

  const bankName = method => ({
    telebirr: 'Telebirr',
    cbe: 'Commercial Bank of Ethiopia (CBE)'
  }[method] || 'Not available');

  const details = [
    ['Phone Number', userInfo?.phone, 'bi-telephone'],
    ['Referral Code', userInfo?.referral_code, 'bi-link-45deg'],
    ['Registration Date', formatDate(userInfo?.created_at), 'bi-calendar-check']
  ];

  return (
    <div className="container py-4" style={{ maxWidth: 600 }}>

      {/* HEADER */}
      <div className="d-flex align-items-center gap-3 mb-4">
        <button onClick={onBack} className="btn bg-white shadow-sm rounded-circle">
          <i className="bi bi-arrow-left fs-5" style={{ color: BRAND }} />
        </button>
        <h5 className="fw-bold mb-0">Personal Information</h5>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border" style={{ color: BRAND }} />
          <p className="text-muted small mt-2">Loading information...</p>
        </div>
      ) : !userInfo ? (
        <div className="alert alert-warning rounded-4">
          Unable to load your personal information.
        </div>
      ) : (
        <>
          {/* INLINE PROFILE */}
          <div className="rounded-4 p-3 mb-4 text-white shadow-sm d-flex align-items-center gap-3"
            style={{ background: 'linear-gradient(135deg, #9B7AF2, #7651D5)' }}>
            <div className="rounded-circle bg-white bg-opacity-25 d-flex align-items-center justify-content-center flex-shrink-0"
              style={{ width: 58, height: 58 }}>
              <i className="bi bi-person-fill fs-2" />
            </div>
            <div>
              <h5 className="fw-bold mb-1">My Account</h5>
              <p className="small opacity-75 mb-0">
                Your BrandCare personal information
              </p>
            </div>
          </div>

          {/* PERSONAL DETAILS */}
          <div className="bg-white rounded-4 shadow-sm p-3 mb-4">
            <h6 className="fw-bold mb-2">Personal Details</h6>

            {details.map(([label, value, icon], index) => (
              <div key={label}
                className={`d-flex align-items-center justify-content-between py-3 ${index !== details.length - 1 ? 'border-bottom' : ''}`}>
                <div>
                  <small className="text-muted">{label}</small>
                  <div className="fw-semibold">{value || 'Not available'}</div>
                </div>
                <i className={`bi ${icon} fs-4`} style={{ color: BRAND }} />
              </div>
            ))}
          </div>

          {/* BANK ACCOUNT */}
          <div className="bg-white rounded-4 shadow-sm p-3">
            <div className="d-flex align-items-center gap-3 mb-3">
              <div className="rounded-3 d-flex align-items-center justify-content-center"
                style={{ width: 45, height: 45, background: '#F4F0FF', color: BRAND }}>
                <i className="bi bi-bank fs-4" />
              </div>
              <div>
                <h6 className="fw-bold mb-0">Bank Account</h6>
                <small className="text-muted">Your withdrawal details</small>
              </div>
            </div>

            {[
              ['Payment Method', bankName(userInfo.bank_method)],
              ['Account Holder', userInfo.bank_account_name || 'Not added yet'],
              ['Account Number', userInfo.bank_account_number || 'Not added yet']
            ].map(([label, value], index) => (
              <div key={label} className={`py-3 ${index !== 2 ? 'border-bottom' : ''}`}>
                <small className="text-muted">{label}</small>
                <div className="fw-semibold">{value}</div>
              </div>
            ))}

            {!userInfo.bank_account_number && (
              <div className="rounded-3 p-3 small mt-2"
                style={{ background: '#F4F0FF', color: '#7651D5' }}>
                <i className="bi bi-info-circle me-2" style={{ color: BRAND }} />
                Your withdrawal account details will appear here after they are saved.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default PersonalInformation;
