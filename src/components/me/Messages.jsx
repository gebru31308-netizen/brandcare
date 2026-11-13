
import React, { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../supabase';

const BRAND = '#9B7AF2';

function Messages({ currentUser, loginCredentials, onBack }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const phone = currentUser?.phone || currentUser?.phone_number || loginCredentials?.phone || 'your account';

  const fetchNotifications = useCallback(async () => {
    if (!loginCredentials?.phone || !loginCredentials?.password) {
      setError('Please log in again to view your messages.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    const { data, error: fetchError } = await supabase.rpc('get_my_notifications', {
      p_phone: loginCredentials.phone,
      p_password: loginCredentials.password
    });

    if (fetchError || !data?.success) {
      console.error('Notification fetch error:', fetchError);
      setError(data?.message || 'Unable to load your messages. Please try again.');
      setNotifications([]);
    } else {
      setNotifications([
        ...(data.withdrawal_notifications || []).map(n => ({ ...n, notification_type: 'withdrawal' })),
        ...(data.deposit_notifications || []).map(n => ({ ...n, notification_type: 'recharge' }))
      ].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)));
    }

    setLoading(false);
  }, [loginCredentials]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const formatDate = date => date ? new Date(date).toLocaleString() : '';

  const getStatus = status => ({
    approved: { color: '#15803d', bg: '#dcfce7', icon: 'bi-check-circle-fill' },
    rejected: { color: '#dc2626', bg: '#fee2e2', icon: 'bi-x-circle-fill' }
  }[status] || { color: '#a16207', bg: '#fef3c7', icon: 'bi-clock-fill' });

  const withdrawals = notifications.filter(n => n.notification_type === 'withdrawal').length;
  const recharges = notifications.length - withdrawals;

  return (
    <div className="min-vh-100" style={{ background: '#F7F6FB' }}>
      <div className="container py-4" style={{ maxWidth: 650 }}>

        {/* HEADER */}
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div className="d-flex align-items-center gap-3">
            <button onClick={onBack} className="btn bg-white shadow-sm rounded-circle">
              <i className="bi bi-arrow-left fs-5" />
            </button>
            <div>
              <h5 className="fw-bold mb-0">Messages</h5>
              <small className="text-muted">Your account notifications</small>
            </div>
          </div>
          <button onClick={fetchNotifications} disabled={loading}
            className="btn rounded-pill bg-white shadow-sm" style={{ color: BRAND }}>
            <i className="bi bi-arrow-clockwise me-1" /> Refresh
          </button>
        </div>

        {/* WELCOME */}
        <div className="rounded-4 p-4 mb-4 text-white shadow-sm"
          style={{ background: 'linear-gradient(135deg, #9B7AF2, #7651D5)' }}>
          <div className="d-flex align-items-center gap-3 mb-3">
            <div className="rounded-circle bg-white bg-opacity-25 d-flex align-items-center justify-content-center"
              style={{ width: 50, height: 50 }}>
              <i className="bi bi-chat-heart-fill fs-3" />
            </div>
            <div>
              <h5 className="fw-bold mb-1">Welcome to BrandCare!</h5>
              <small className="opacity-75">We're happy to have you.</small>
            </div>
          </div>
          <p className="small mb-0 opacity-75">
            Hello, {phone}! Your recharge and withdrawal updates will appear here.
          </p>
        </div>

        {/* COUNTS */}
        {!loading && !error && (
          <div className="row g-3 mb-4">
            {[
              ['Withdrawals', withdrawals, 'bi-wallet2'],
              ['Recharges', recharges, 'bi-credit-card']
            ].map(([label, count, icon]) => (
              <div className="col-6" key={label}>
                <div className="bg-white rounded-4 shadow-sm p-3">
                  <div className="d-flex align-items-center justify-content-between">
                    <small className="text-muted">{label}</small>
                    <i className={`bi ${icon} fs-5`} style={{ color: BRAND }} />
                  </div>
                  <h4 className="fw-bold mt-2 mb-0">{count}</h4>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SECTION TITLE */}
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div>
            <h5 className="fw-bold mb-1">Account Updates</h5>
            <small className="text-muted">Latest transaction notifications</small>
          </div>
          <i className="bi bi-bell-fill fs-4" style={{ color: BRAND }} />
        </div>

        {/* LOADING */}
        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border" style={{ color: BRAND }} />
            <p className="text-muted small mt-3">Loading messages...</p>
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div className="bg-white rounded-4 p-4 text-center shadow-sm">
            <i className="bi bi-exclamation-circle fs-2 text-danger" />
            <p className="text-muted mt-2">{error}</p>
            <button onClick={fetchNotifications} className="btn text-white rounded-pill px-4"
              style={{ background: BRAND }}>
              Try Again
            </button>
          </div>
        )}

        {/* EMPTY */}
        {!loading && !error && !notifications.length && (
          <div className="bg-white rounded-4 p-5 text-center shadow-sm">
            <i className="bi bi-bell-slash fs-1" style={{ color: BRAND }} />
            <h6 className="fw-bold mt-3">No updates yet</h6>
            <p className="text-muted small mb-0">
              Your recharge and withdrawal notifications will appear here.
            </p>
          </div>
        )}

        {/* NOTIFICATIONS */}
        {!loading && !error && notifications.map((n, i) => {
          const recharge = n.notification_type === 'recharge';
          const status = getStatus((n.status || 'pending').toLowerCase());
          const reference = recharge ? n.deposit_id : n.withdrawal_id;

          return (
            <div key={`${n.notification_type}-${n.id || i}`}
              className="bg-white rounded-4 shadow-sm mb-3 overflow-hidden">
              <div style={{ height: 3, background: status.color }} />
              <div className="p-3 p-md-4">
                <div className="d-flex gap-3">
                  <div className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{ width: 46, height: 46, background: status.bg, color: status.color }}>
                    <i className={`bi ${status.icon} fs-4`} />
                  </div>

                  <div className="flex-grow-1 min-w-0">
                    <div className="d-flex justify-content-between align-items-start gap-2 flex-wrap">
                      <h6 className="fw-bold mb-1">{n.title}</h6>
                      <span className="badge rounded-pill px-3 py-2"
                        style={{ color: status.color, background: status.bg }}>
                        {(n.status || 'pending').toUpperCase()}
                      </span>
                    </div>

                    <span className="badge rounded-pill mb-2"
                      style={{ color: BRAND, background: '#F4F0FF' }}>
                      <i className={`bi ${recharge ? 'bi-credit-card' : 'bi-wallet2'} me-1`} />
                      {recharge ? 'RECHARGE' : 'WITHDRAWAL'}
                    </span>

                    <p className="text-muted small mb-3">{n.message}</p>

                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                      <small className="text-muted">
                        <i className="bi bi-calendar3 me-1" />
                        {formatDate(n.created_at)}
                      </small>
                      <small className="fw-semibold" style={{ color: BRAND }}>
                        <i className="bi bi-receipt me-1" />
                        #{reference ?? '—'}
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

      </div>
    </div>
  );
}

export default Messages;
