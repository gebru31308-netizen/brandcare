
import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabase';

const BRAND = '#9B7AF2';

function Share({ currentUser, onBack }) {
  const [code, setCode] = useState('');
  const [count, setCount] = useState(0);
  const [commission, setCommission] = useState(0);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const link = code
    ? `${window.location.origin}/?ref=${encodeURIComponent(code)}`
    : '';

  useEffect(() => {
    const load = async () => {
      if (!currentUser?.id) return setLoading(false);

      try {
        const { data, error } = await supabase.from('users')
          .select('referral_code, commission_balance')
          .eq('id', currentUser.id).single();

        if (error) throw error;

        setCode(data?.referral_code || '');
        setCommission(Number(data?.commission_balance || 0));

        const { count, error: countError } = await supabase.from('users')
          .select('*', { count: 'exact', head: true })
          .eq('referred_by_id', currentUser.id);

        if (countError) throw countError;
        setCount(count || 0);
      } catch (error) {
        console.error('Referral loading error:', error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [currentUser?.id]);

  const copy = async () => {
    if (!link) return;

    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Copy your invitation link:', link);
    }
  };

  const share = async () => {
    if (!link) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join BrandCare',
          text: 'Join BrandCare using my personal invitation link!',
          url: link
        });
      } catch (error) {
        if (error.name !== 'AbortError') copy();
      }
    } else copy();
  };

  return (
    <div className="container py-2" style={{ maxWidth: 540 }}>
      <style>{`
        .sh-card{background:#fff;border:1px solid #efedf6;border-radius:14px;padding:12px;box-shadow:0 3px 14px #30205c08}
        .sh-hero{background:linear-gradient(135deg,#7651D5,#9B7AF2);border-radius:16px;padding:12px;color:white;text-align:center}
        .sh-stat{height:100%;padding:10px;border-radius:13px;background:white;border:1px solid #efedf6}
        .sh-stat-icon{width:30px;height:30px;border-radius:9px;display:grid;place-items:center;font-size:15px;margin-bottom:7px}
        .sh-stat small{color:#9390a2;font-size:10px}
        .sh-stat h3{font-size:17px;font-weight:850;margin:4px 0 0;overflow-wrap:anywhere}
        .sh-input{min-width:0;width:100%;border:1px solid #e9e5f3;background:#f9f8fc;border-radius:10px;padding:10px;font-size:11px;outline:none}
        .sh-btn{width:100%;border:0;border-radius:11px;padding:11px;background:linear-gradient(100deg,#7651D5,#9B7AF2);color:white;font-weight:750}
        .sh-step{display:flex;align-items:center;gap:9px;margin-bottom:9px}
        .sh-step:last-child{margin-bottom:0}
        .sh-number{width:28px;height:28px;flex-shrink:0;border-radius:9px;background:#F4F0FF;color:${BRAND};display:grid;place-items:center;font-weight:800;font-size:12px}
      `}</style>

      {/* Header */}
      <div className="d-flex align-items-center gap-2 mb-3">
        <button
          className="btn btn-light rounded-circle"
          onClick={onBack}
          style={{ color: BRAND, width: 36, height: 36 }}
        >
          <i className="bi bi-arrow-left" />
        </button>
        <div>
          <h6 className="fw-bold mb-0">Invite Friends</h6>
          <small className="text-muted" style={{ fontSize: 10 }}>
            Your rewards, your community
          </small>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border spinner-border-sm" style={{ color: BRAND }} />
          <p className="text-muted small mt-2">Loading invitation...</p>
        </div>
      ) : (
        <>
          {/* Compact Share Banner */}
          <div className="sh-hero mb-2">
            <div className="d-flex align-items-center justify-content-center gap-2 mb-1">
              <i className="bi bi-gift-fill fs-5" />
              <h6 className="fw-bold mb-0">Share & Earn</h6>
            </div>
            <p className="mb-2" style={{ fontSize: 10, color: '#eee5ff' }}>
              Invite friends to BrandCare and earn 10 ETB for every successful registration.
            </p>
            <div className="fw-bold small">
              {code || 'No referral code available'}
            </div>
          </div>

          {/* Statistics */}
          <div className="row g-2 mb-2">
            <div className="col-6">
              <div className="sh-stat">
                <div className="sh-stat-icon" style={{ background: '#F4F0FF', color: BRAND }}>
                  <i className="bi bi-people-fill" />
                </div>
                <small>Successful Invites</small>
                <h3 style={{ color: BRAND }}>{count.toLocaleString()}</h3>
              </div>
            </div>
            <div className="col-6">
              <div className="sh-stat">
                <div className="sh-stat-icon" style={{ background: '#E8F8F0', color: '#159B70' }}>
                  <i className="bi bi-wallet-fill" />
                </div>
                <small>Referral Earnings</small>
                <h3 style={{ color: '#159B70' }}>{commission.toFixed(2)} ETB</h3>
              </div>
            </div>
          </div>

          {/* Invitation Link */}
          <div className="sh-card mb-2">
            <h6 className="fw-bold mb-1" style={{ fontSize: 13 }}>
              Your Invitation Link
            </h6>
            <p className="text-muted mb-2" style={{ fontSize: 10 }}>
              Share your personal link with friends.
            </p>

            <div className="d-flex gap-2 mb-2">
              <input
                className="sh-input"
                value={link}
                readOnly
                placeholder="No link available"
              />
              <button
                className="btn btn-outline-primary btn-sm rounded-3 px-3"
                onClick={copy}
                disabled={!link}
              >
                {copied ? '✓' : 'Copy'}
              </button>
            </div>

            <button className="sh-btn" onClick={share} disabled={!link}>
              <i className="bi bi-share-fill me-2" />
              Share Invitation
            </button>
          </div>

          {/* How It Works */}
          <div className="sh-card">
            <h6 className="fw-bold mb-3" style={{ fontSize: 13 }}>
              How It Works
            </h6>

            {[
              ['1', 'Share your link', 'Send your personal invitation link.'],
              ['2', 'Friends register', 'They join BrandCare using your link.'],
              ['3', 'Earn 10 ETB', 'Get rewarded for successful registrations.']
            ].map(([number, title, description]) => (
              <div className="sh-step" key={number}>
                <div className="sh-number">{number}</div>
                <div>
                  <div className="fw-bold" style={{ fontSize: 11 }}>{title}</div>
                  <small className="text-muted" style={{ fontSize: 10 }}>
                    {description}
                  </small>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center text-muted mt-3" style={{ fontSize: 10 }}>
            Made with <span style={{ color: BRAND }}>♥</span> for the BrandCare community
          </div>
        </>
      )}
    </div>
  );
}

export default Share;
