
import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabase';

const BRAND = '#9B7AF2';
const DARK = '#7651D5';
const LIGHT = '#F4F0FF';
const GRADIENT = `linear-gradient(135deg, ${BRAND}, ${DARK})`;

function Recharges({ adminCredentials, onBack }) {
  const [recharges, setRecharges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const fetchRecharges = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('admin_get_deposits', {
        p_phone: adminCredentials.phone,
        p_password: adminCredentials.password
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.message || 'Unable to load recharges.');
      setRecharges(data.deposits || []);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecharges();
  }, [adminCredentials?.phone, adminCredentials?.password]);

  // APPROVE OR REJECT
  const updateStatus = async (recharge, action) => {
    const label = action === 'approved' ? 'Approve' : 'Reject';
    if (!window.confirm(`${label} recharge #${recharge.id}?`)) return;

    setUpdatingId(recharge.id);
    try {
      const { data, error } = await supabase.rpc('admin_process_deposit', {
        p_phone: adminCredentials.phone,
        p_password: adminCredentials.password,
        p_deposit_id: recharge.id,
        p_action: action
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.message || 'Unable to process recharge.');

      setRecharges(prev => prev.map(r =>
        r.id === recharge.id ? { ...r, status: data.status || action } : r
      ));
    } catch (error) {
      alert(error.message);
    } finally {
      setUpdatingId(null);
    }
  };

  // AMOUNT SUMMARY
  const count = status => recharges.filter(r => r.status === status).length;

  const amount = status => recharges
    .filter(r => r.status === status)
    .reduce((sum, r) => sum + Number(r.amount || 0), 0);

  const amounts = [
    ['Approved', amount('approved'), count('approved'), 'bi-check-circle-fill', '#159B65', '#EAF8F1'],
    ['Rejected', amount('rejected'), count('rejected'), 'bi-x-circle-fill', '#D94B58', '#FFF0F1'],
    ['Pending', amount('pending'), count('pending'), 'bi-clock-fill', '#C28A20', '#FFF7E8']
  ];

  const filtered = recharges.filter(r =>
    (filter === 'all' || r.status === filter) &&
    [r.customer_phone, r.id, r.payment_message, r.method]
      .some(v => String(v || '').toLowerCase().includes(search.toLowerCase()))
  );

  const statusColors = {
    pending: { color: '#B7791F', bg: '#FFF7E6' },
    approved: { color: '#159B65', bg: '#EAF8F1' },
    rejected: { color: '#D94B58', bg: '#FFF0F1' }
  };

  return (
    <div className="container-fluid py-3" style={{ maxWidth: 1500 }}>

      {/* HEADER */}
      <div className="rounded-4 p-3 text-white mb-3 shadow-sm" style={{ background: GRADIENT }}>
        <div className="d-flex align-items-center gap-2">
          <button onClick={onBack} className="btn btn-light btn-sm rounded-circle">
            <i className="bi bi-arrow-left" style={{ color: BRAND }} />
          </button>

          <div className="rounded-3 bg-white bg-opacity-25 p-2">
            <i className="bi bi-wallet2 fs-5" />
          </div>

          <div>
            <h6 className="fw-bold mb-0">Recharges</h6>
            <small className="opacity-75">Manage customer deposits</small>
          </div>

          <button onClick={fetchRecharges} disabled={loading}
            className="btn btn-light btn-sm rounded-pill ms-auto px-3">
            <i className="bi bi-arrow-clockwise me-1" style={{ color: BRAND }} />
            <span style={{ color: DARK }}>Refresh</span>
          </button>
        </div>
      </div>

      {/* TOTAL AMOUNTS */}
      <div className="bg-white rounded-4 shadow-sm p-3 mb-3">
        <div className="d-flex align-items-center gap-2 mb-3">
          <div className="rounded-3 p-2" style={{ background: LIGHT, color: BRAND }}>
            <i className="bi bi-bar-chart-fill fs-5" />
          </div>
          <div>
            <h6 className="fw-bold mb-0">Total Amounts</h6>
            <small className="text-muted">Recharge payment summary</small>
          </div>
        </div>

        <div className="row g-2">
          {amounts.map(([title, value, total, icon, color, bg]) => (
            <div className="col-12 col-md-4" key={title}>
              <div className="rounded-4 p-3 h-100" style={{ background: bg }}>
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div className="d-flex align-items-center gap-2">
                    <div className="rounded-3 bg-white d-flex align-items-center justify-content-center"
                      style={{ width: 38, height: 38, color }}>
                      <i className={`bi ${icon} fs-5`} />
                    </div>
                    <span className="fw-semibold" style={{ color }}>{title}</span>
                  </div>
                  <span className="badge rounded-pill bg-white px-3 py-2" style={{ color }}>
                    {total} {total === 1 ? 'Request' : 'Requests'}
                  </span>
                </div>

                <h4 className="fw-bold mb-0" style={{ color }}>
                  ETB {value.toLocaleString()}
                </h4>
                <small className="text-muted">{title} Amount</small>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RECHARGE REQUESTS */}
      <div className="bg-white rounded-4 shadow-sm overflow-hidden">
        <div className="p-3 border-bottom">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
            <div>
              <h6 className="fw-bold mb-0">Recharge Requests</h6>
              <small className="text-muted">Review customer payments</small>
            </div>

            <span className="rounded-pill px-3 py-2 small fw-semibold"
              style={{ background: LIGHT, color: DARK }}>
              {filtered.length} Records
            </span>
          </div>

          <div className="row g-2 align-items-center">
            <div className="col-12 col-lg-5">
              <div className="input-group">
                <span className="input-group-text border-0" style={{ background: LIGHT }}>
                  <i className="bi bi-search" style={{ color: BRAND }} />
                </span>
                <input
                  className="form-control border-0"
                  style={{ background: LIGHT }}
                  placeholder="Search phone, ID or payment..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="col-12 col-lg-7 d-flex gap-2 flex-wrap">
              {['all', 'pending', 'approved', 'rejected'].map(item => (
                <button key={item} onClick={() => setFilter(item)}
                  className="btn btn-sm rounded-pill px-3"
                  style={filter === item
                    ? { background: GRADIENT, color: '#fff', border: 0 }
                    : { background: LIGHT, color: DARK, border: 0 }}>
                  {item[0].toUpperCase() + item.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border" style={{ color: BRAND }} />
            <p className="text-muted small mt-2">Loading requests...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-5">
            <div className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
              style={{ width: 60, height: 60, background: LIGHT, color: BRAND }}>
              <i className="bi bi-inbox fs-3" />
            </div>
            <h6 className="fw-bold">No recharge requests</h6>
            <small className="text-muted">Try changing your search or filter.</small>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle table-hover mb-0">
              <thead>
                <tr style={{ background: '#FAF9FD' }}>
                  {['ID', 'Customer', 'Amount', 'Method', 'Payment Details', 'Date', 'Status', 'Actions'].map((heading, i) => (
                    <th key={heading}
                      className={`text-muted small fw-semibold py-3 ${i === 0 ? 'ps-3' : ''} ${i === 7 ? 'text-center' : ''}`}>
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filtered.map(r => {
                  const status = statusColors[r.status] || { color: '#777', bg: '#F1F1F1' };

                  return (
                    <tr key={r.id}>
                      <td className="ps-3">
                        <span className="fw-semibold small" style={{ color: DARK }}>#{r.id}</span>
                      </td>

                      <td style={{ minWidth: 145 }}>
                        <div className="d-flex align-items-center gap-2">
                          <div className="rounded-circle d-flex align-items-center justify-content-center"
                            style={{ width: 34, height: 34, background: LIGHT, color: BRAND, flexShrink: 0 }}>
                            <i className="bi bi-person-fill" />
                          </div>
                          <span className="fw-semibold small">{r.customer_phone || 'N/A'}</span>
                        </div>
                      </td>

                      <td style={{ minWidth: 110 }}>
                        <span className="fw-bold">
                          ETB {Number(r.amount || 0).toLocaleString()}
                        </span>
                      </td>

                      <td>
                        <span className="badge rounded-pill px-2 py-2"
                          style={{ background: LIGHT, color: DARK }}>
                          {r.method || 'N/A'}
                        </span>
                      </td>

                      <td style={{ minWidth: 170, maxWidth: 240 }}>
                        <span className="small text-break" style={{ whiteSpace: 'pre-wrap' }}>
                          {r.payment_message || '—'}
                        </span>
                      </td>

                      <td className="small text-muted" style={{ minWidth: 140 }}>
                        {r.created_at ? new Date(r.created_at).toLocaleString() : '—'}
                      </td>

                      <td>
                        <span className="badge rounded-pill px-3 py-2"
                          style={{ background: status.bg, color: status.color }}>
                          <i className={`bi ${
                            r.status === 'approved' ? 'bi-check-circle-fill' :
                            r.status === 'rejected' ? 'bi-x-circle-fill' : 'bi-clock-fill'
                          } me-1`} />
                          {r.status || 'unknown'}
                        </span>
                      </td>

                      <td className="text-center" style={{ minWidth: 190 }}>
                        {r.status === 'pending' ? (
                          <div className="d-flex justify-content-center gap-2">
                            <button
                              disabled={updatingId === r.id}
                              onClick={() => updateStatus(r, 'approved')}
                              className="btn btn-sm rounded-pill px-3 text-white"
                              style={{ background: '#159B65' }}>
                              {updatingId === r.id && (
                                <span className="spinner-border spinner-border-sm me-1" />
                              )}
                              Approve
                            </button>

                            <button
                              disabled={updatingId === r.id}
                              onClick={() => updateStatus(r, 'rejected')}
                              className="btn btn-sm rounded-pill px-3"
                              style={{ background: '#FFF0F1', color: '#D94B58' }}>
                              Reject
                            </button>
                          </div>
                        ) : (
                          <small className="text-muted">Completed</small>
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

      <p className="text-muted small mt-3">
        <i className="bi bi-shield-check me-1" style={{ color: BRAND }} />
        Customer balances are credited only after a successful approval.
      </p>
    </div>
  );
}

export default Recharges;
