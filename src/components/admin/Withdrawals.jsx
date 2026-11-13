
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../../supabase';

const BRAND = '#9B7AF2';
const DARK = '#7651D5';
const LIGHT = '#F4F0FF';

function Withdrawals({ onBack, adminCredentials }) {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [confirmAction, setConfirmAction] = useState(null);
  const [error, setError] = useState('');

  const fetchWithdrawals = useCallback(async () => {
    if (!adminCredentials?.phone || !adminCredentials?.password) {
      setError('Admin credentials missing. Please log in again.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.rpc('admin_get_withdrawals', {
        p_phone: adminCredentials.phone,
        p_password: adminCredentials.password
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.message || 'Unable to load withdrawals.');

      setWithdrawals(data.withdrawals || []);
    } catch (err) {
      setError(err.message);
      setWithdrawals([]);
    } finally {
      setLoading(false);
    }
  }, [adminCredentials?.phone, adminCredentials?.password]);

  useEffect(() => {
    fetchWithdrawals();
  }, [fetchWithdrawals]);

  const processWithdrawal = async () => {
    if (!confirmAction) return;

    const { item, action } = confirmAction;
    setProcessingId(item.id);
    setConfirmAction(null);
    setError('');

    try {
      const { data, error } = await supabase.rpc('admin_process_withdrawal', {
        p_phone: adminCredentials.phone,
        p_password: adminCredentials.password,
        p_withdrawal_id: item.id,
        p_action: action
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.message || 'Unable to process withdrawal.');

      await fetchWithdrawals();

      alert(action === 'approved'
        ? 'Withdrawal approved successfully.'
        : 'Withdrawal rejected successfully.');
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const count = status => withdrawals.filter(
    r => r.status?.toLowerCase() === status
  ).length;

  const amount = status => withdrawals
    .filter(r => r.status?.toLowerCase() === status)
    .reduce((sum, r) => sum + Number(r.amount || 0), 0);

  const summaries = [
    ['Pending', 'pending', 'bi-clock-fill', '#C28A20', '#FFF7E8'],
    ['Approved', 'approved', 'bi-check-circle-fill', '#159B65', '#EAF8F1'],
    ['Rejected', 'rejected', 'bi-x-circle-fill', '#D94B58', '#FFF0F1']
  ];

  const filtered = useMemo(() => withdrawals.filter(r => {
    const status = (r.status || 'pending').toLowerCase();
    const term = search.toLowerCase();

    return (filter === 'all' || status === filter) &&
      [r.id, r.customer_phone, r.account_name, r.account_number]
        .some(v => String(v || '').toLowerCase().includes(term));
  }), [withdrawals, filter, search]);

  const formatMoney = value => Number(value || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  const formatDate = value => value ? new Date(value).toLocaleString() : '—';

  const statusStyle = {
    pending: { color: '#B7791F', background: '#FFF7E8' },
    approved: { color: '#159B65', background: '#EAF8F1' },
    rejected: { color: '#D94B58', background: '#FFF0F1' }
  };

  return (
    <div className="container-fluid py-3" style={{ maxWidth: 1450 }}>

      {/* HEADER */}
      <div className="rounded-4 p-3 text-white mb-3 shadow-sm"
        style={{ background: `linear-gradient(135deg, ${BRAND}, ${DARK})` }}>
        <div className="d-flex align-items-center gap-2">
          <button onClick={onBack} className="btn btn-light btn-sm rounded-circle">
            <i className="bi bi-arrow-left" style={{ color: BRAND }} />
          </button>
          <i className="bi bi-cash-stack fs-4" />
          <div>
            <h6 className="fw-bold mb-0">Withdrawals</h6>
            <small className="opacity-75">Manage customer requests</small>
          </div>
          <button onClick={fetchWithdrawals} disabled={loading}
            className="btn btn-light btn-sm rounded-pill ms-auto px-3"
            style={{ color: DARK }}>
            <i className="bi bi-arrow-clockwise me-1" /> Refresh
          </button>
        </div>
      </div>

      {/* AMOUNT SUMMARY */}
      <div className="bg-white rounded-4 shadow-sm p-3 mb-3">
        <h6 className="fw-bold mb-3">Total Amounts</h6>
        <div className="row g-2">
          {summaries.map(([title, status, icon, color, bg]) => (
            <div className="col-12 col-md-4" key={status}>
              <div className="rounded-3 p-3 h-100" style={{ background: bg }}>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="fw-semibold" style={{ color }}>{title}</span>
                  <i className={`bi ${icon} fs-5`} style={{ color }} />
                </div>
                <h5 className="fw-bold mb-1" style={{ color }}>
                  ETB {formatMoney(amount(status))}
                </h5>
                <small className="text-muted">
                  {count(status)} {count(status) === 1 ? 'Request' : 'Requests'}
                </small>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* REQUESTS */}
      <div className="bg-white rounded-4 shadow-sm overflow-hidden">
        <div className="p-3 border-bottom">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h6 className="fw-bold mb-0">Withdrawal Requests</h6>
              <small className="text-muted">Review and process payments</small>
            </div>
            <span className="badge rounded-pill px-3 py-2"
              style={{ background: LIGHT, color: DARK }}>
              {filtered.length} Records
            </span>
          </div>

          <div className="row g-2 align-items-center">
            <div className="col-lg-5">
              <div className="input-group">
                <span className="input-group-text border-0" style={{ background: LIGHT }}>
                  <i className="bi bi-search" style={{ color: BRAND }} />
                </span>
                <input className="form-control border-0" style={{ background: LIGHT }}
                  placeholder="Search phone, account or ID..."
                  value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </div>

            <div className="col-lg-7 d-flex gap-2 flex-wrap">
              {['all', 'pending', 'approved', 'rejected'].map(s => (
                <button key={s} onClick={() => setFilter(s)}
                  className="btn btn-sm rounded-pill px-3"
                  style={filter === s
                    ? { background: BRAND, color: '#fff', border: 0 }
                    : { background: LIGHT, color: DARK, border: 0 }}>
                  {s[0].toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger m-3 mb-0">{error}</div>
        )}

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border" style={{ color: BRAND }} />
            <p className="small text-muted mt-2">Loading withdrawals...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-inbox fs-1" style={{ color: BRAND }} />
            <p className="text-muted mt-2 mb-0">No withdrawal requests found.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead style={{ background: '#FAF9FD' }}>
                <tr>
                  {['ID', 'Customer', 'Amount', 'Method', 'Account Details', 'Date', 'Status', 'Actions'].map((h, i) => (
                    <th key={h} className={`small text-muted py-3 ${i === 0 ? 'ps-3' : ''}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => {
                  const status = (r.status || 'pending').toLowerCase();
                  const colors = statusStyle[status] || statusStyle.pending;

                  return (
                    <tr key={r.id}>
                      <td className="ps-3 fw-semibold" style={{ color: DARK }}>#{r.id}</td>
                      <td>
                        <div className="fw-semibold small">{r.customer_phone || 'N/A'}</div>
                        <small className="text-muted">{r.account_name || '—'}</small>
                      </td>
                      <td className="fw-bold text-nowrap">
                        ETB {formatMoney(r.amount)}
                      </td>
                      <td>
                        <span className="badge rounded-pill px-2 py-2"
                          style={{ background: LIGHT, color: DARK }}>
                          {r.method === 'cbe' ? 'CBE' : r.method || 'N/A'}
                        </span>
                      </td>
                      <td className="small">{r.account_number || '—'}</td>
                      <td className="small text-muted text-nowrap">{formatDate(r.created_at)}</td>
                      <td>
                        <span className="badge rounded-pill px-3 py-2"
                          style={{ color: colors.color, background: colors.background }}>
                          {status.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ minWidth: 175 }}>
                        {status === 'pending' ? (
                          <div className="d-flex gap-2">
                            <button disabled={Boolean(processingId)}
                              onClick={() => setConfirmAction({ item: r, action: 'approved' })}
                              className="btn btn-sm rounded-pill px-3 text-white"
                              style={{ background: '#159B65' }}>
                              Approve
                            </button>
                            <button disabled={Boolean(processingId)}
                              onClick={() => setConfirmAction({ item: r, action: 'rejected' })}
                              className="btn btn-sm rounded-pill px-3"
                              style={{ background: '#FFF0F1', color: '#D94B58' }}>
                              Reject
                            </button>
                          </div>
                        ) : (
                          <small className="text-muted">Completed</small>
                        )}
                        {processingId === r.id && (
                          <small className="text-muted d-block mt-1">Processing...</small>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CONFIRMATION */}
      {confirmAction && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{ background: '#0009', zIndex: 2000 }}>
          <div className="bg-white rounded-4 p-4 shadow-lg text-center"
            style={{ maxWidth: 400, width: '100%' }}>
            <div className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
              style={{
                width: 55, height: 55,
                background: confirmAction.action === 'approved' ? '#EAF8F1' : '#FFF0F1',
                color: confirmAction.action === 'approved' ? '#159B65' : '#D94B58'
              }}>
              <i className={`bi ${confirmAction.action === 'approved' ? 'bi-check-lg' : 'bi-x-lg'} fs-3`} />
            </div>
            <h5 className="fw-bold">
              {confirmAction.action === 'approved' ? 'Approve Withdrawal?' : 'Reject Withdrawal?'}
            </h5>
            <p className="text-muted small">
              {confirmAction.action === 'approved'
                ? `ETB ${formatMoney(confirmAction.item.amount)} will be deducted from the customer's balance.`
                : 'The request will be rejected without deducting the customer balance.'}
            </p>
            <div className="d-flex gap-2 mt-3">
              <button onClick={() => setConfirmAction(null)}
                className="btn btn-light border rounded-pill w-50">
                Cancel
              </button>
              <button onClick={processWithdrawal}
                className={`btn rounded-pill w-50 text-white ${confirmAction.action === 'approved' ? 'btn-success' : 'btn-danger'}`}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Withdrawals;
