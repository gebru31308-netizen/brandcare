
import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabase';
import Packages from './Packages';

const BRAND = '#9B7AF2';

const methods = {
  telebirr: 'Telebirr',
  cbe: 'Commercial Bank of Ethiopia (CBE)',
  abyssinia: 'Bank of Abyssinia',
  awash: 'Awash Bank',
  dashen: 'Dashen Bank',
  wegagen: 'Wegagen Bank',
  hibret: 'Hibret Bank',
  nib: 'Nib International Bank'
};

function Reward() {
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('winners');

  useEffect(() => {
    let active = true;

    const fetchWinners = async () => {
      try {
        const { data, error } = await supabase.rpc('get_public_rewards');
        if (error) throw error;
        if (data?.success === false) throw new Error(data.message);
        if (active) setWinners(Array.isArray(data) ? data : data?.rewards || []);
      } catch (err) {
        if (active) setError(err.message || 'Unable to load winners.');
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchWinners();
    const timer = setInterval(fetchWinners, 30000);
    return () => { active = false; clearInterval(timer); };
  }, []);

  const amount = value => Number(value || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  return (
    <div className="rw-page">
      <style>{`
        .rw-tabs{display:flex;gap:7px;padding:5px;background:#fff;border-radius:14px;margin-bottom:12px;box-shadow:0 3px 14px #0000000c}
        .rw-tabs button{flex:1;border:0;border-radius:10px;padding:11px 5px;background:transparent;color:#89919e;font-size:12px;font-weight:800}
        .rw-tabs button.active{background:linear-gradient(135deg,#9B7AF2,#7651D5);color:#fff}
        .rw-card{background:#fff;border-radius:16px;padding:12px;box-shadow:0 4px 18px #0000000d}
        .rw-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
        .rw-title{display:flex;align-items:center;gap:9px}
        .rw-icon{width:40px;height:40px;display:grid;place-items:center;border-radius:12px;background:#F4F0FF;color:${BRAND};font-size:21px}
        .rw-head h5{font-size:16px;font-weight:800;margin:0;color:#202938}
        .rw-head small{font-size:10px;color:#89919e}
        .rw-live{background:#ffe8e8;color:#dc2626;padding:5px 10px;border-radius:20px;font-size:10px;font-weight:800}
        .rw-dot{display:inline-block;width:7px;height:7px;background:#ef4444;border-radius:50%;margin-right:5px;animation:pulse 1s infinite}
        .rw-grid{display:grid;grid-template-columns:25px minmax(0,1.2fr) minmax(0,1.3fr) 85px;align-items:center;gap:5px;padding:10px 5px}
        .rw-labels{background:#F4F0FF;color:#7651D5;border-radius:8px;font-size:9px;font-weight:800;text-transform:uppercase}
        .rw-list{height:220px;overflow:hidden}
        .rw-track{animation:scrollWinners 18s linear infinite}
        .rw-list:hover .rw-track{animation-play-state:paused}
        .rw-row{min-height:52px;border-bottom:1px solid #f0f1f3;font-size:11px;color:#303a48}
        .rw-number{width:23px;height:23px;display:grid;place-items:center;border-radius:7px;background:#F4F0FF;color:${BRAND};font-weight:800}
        .rw-first{background:#fff1c7;color:#d69b00}
        .rw-customer{font-weight:700;overflow-wrap:anywhere}
        .rw-method{background:#F4F0FF;color:#7651D5;border-radius:6px;padding:5px;font-size:9px;font-weight:700;overflow-wrap:anywhere}
        .rw-amount{text-align:right;color:#159b68;font-weight:800;white-space:nowrap}
        .rw-footer{text-align:center;border-top:1px solid #f1f2f4;padding-top:10px;margin-top:8px;color:#929aa6;font-size:10px}
        @keyframes scrollWinners{to{transform:translateY(-50%)}}
        @keyframes pulse{50%{opacity:.3;transform:scale(.7)}}
        @media(max-width:480px){.rw-grid{grid-template-columns:23px minmax(0,1fr) minmax(0,1.1fr) 75px;gap:4px;padding:9px 3px}.rw-labels{font-size:8px}.rw-row{font-size:10px}.rw-method{font-size:8px}.rw-amount{font-size:9px}}
        @media(prefers-reduced-motion:reduce){.rw-track,.rw-dot{animation:none}}
      `}</style>

      <div className="rw-tabs">
        <button className={tab === 'winners' ? 'active' : ''} onClick={() => setTab('winners')}>
          <i className="bi bi-trophy-fill me-2" />Today's Winners
        </button>
        <button className={tab === 'packages' ? 'active' : ''} onClick={() => setTab('packages')}>
          <i className="bi bi-box-seam me-2" />Packages
        </button>
      </div>

      {tab === 'packages' ? <Packages /> : (
        <div className="rw-card">
          <div className="rw-head">
            <div className="rw-title">
              <div className="rw-icon"><i className="bi bi-trophy-fill" /></div>
              <div>
                <h5>Today's Winners</h5>
                <small>Congratulations to our winners!</small>
              </div>
            </div>
            <span className="rw-live"><span className="rw-dot" />LIVE</span>
          </div>

          <div className="rw-grid rw-labels">
            <span>SN</span><span>Customer</span><span>Method</span>
            <span className="text-end">Daily Withdrawals</span>
          </div>

          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border spinner-border-sm" style={{ color: BRAND }} />
              <small className="d-block mt-2">Loading winners...</small>
            </div>
          ) : error ? (
            <p className="text-center text-danger small py-4">{error}</p>
          ) : !winners.length ? (
            <p className="text-center text-muted small py-4">No winners announced yet.</p>
          ) : (
            <div className="rw-list">
              <div className="rw-track">
                {[...winners, ...winners].map((w, i) => (
                  <div className="rw-grid rw-row" key={`${w.id}-${i}`}>
                    <span className={`rw-number ${i % winners.length === 0 ? 'rw-first' : ''}`}>
                      {i % winners.length + 1}
                    </span>
                    <span className="rw-customer">{w.masked_phone || 'Customer'}</span>
                    <span className="rw-method">
                      {methods[String(w.transfer_method || '').toLowerCase()] || w.transfer_method || 'Not assigned'}
                    </span>
                    <span className="rw-amount">{amount(w.daily_withdrawals)} ETB</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rw-footer">
            <i className="bi bi-arrow-repeat me-1" />Winners update automatically
          </div>
        </div>
      )}
    </div>
  );
}

export default Reward;
