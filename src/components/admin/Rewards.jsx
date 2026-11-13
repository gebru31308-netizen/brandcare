
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../../supabase';

const BRAND = '#9B7AF2';
const DARK = '#7651D5';
const LIGHT = '#F4F0FF';

const methods = [
  ['telebirr', 'Telebirr'], ['cbe', 'Commercial Bank of Ethiopia (CBE)'],
  ['abyssinia', 'Bank of Abyssinia'], ['awash', 'Awash Bank'],
  ['dashen', 'Dashen Bank'], ['wegagen', 'Wegagen Bank'],
  ['hibret', 'Hibret Bank'], ['nib', 'Nib International Bank']
];

const methodName = v => methods.find(([k]) => k === v)?.[1] || v || 'Not assigned';
const money = v => Number(v || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function Rewards({ adminCredentials, onBack }) {
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('');

  const { phone: adminPhone, password: adminPassword } = adminCredentials || {};

  const loadRewards = useCallback(async () => {
    if (!adminPhone || !adminPassword) {
      setError('Admin credentials missing. Please log in again.');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('admin_get_rewards', {
        p_phone: adminPhone, p_password: adminPassword
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.message || 'Unable to load rewards.');
      setRewards(data.rewards || []);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [adminPhone, adminPassword]);

  useEffect(() => { loadRewards(); }, [loadRewards]);

  const resetForm = () => {
    setPhone('');
    setAmount('');
    setMethod('');
    setEditingId(null);
  };

  const editReward = r => {
    setEditingId(r.id);
    setPhone(r.customer_phone || '');
    setAmount(String(r.daily_withdrawals ?? ''));
    setMethod(r.transfer_method || 'telebirr');
    setError('');
    setSuccess('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const saveReward = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!phone.trim() || amount === '' || !Number.isFinite(Number(amount)) || Number(amount) < 0) {
      setError('Enter a valid phone number and amount.');
      return;
    }

    const selectedMethod = editingId
      ? method
      : methods[Math.floor(Math.random() * methods.length)][0];

    setSaving(true);
    try {
      const { data, error } = await supabase.rpc('admin_save_reward', {
        p_phone: adminPhone,
        p_password: adminPassword,
        p_reward_id: editingId ? Number(editingId) : null,
        p_customer_phone: phone.trim(),
        p_transfer_method: selectedMethod,
        p_daily_withdrawals: Number(amount)
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.message || 'Unable to save reward.');

      setSuccess(editingId ? 'Reward updated successfully.' : `Reward added. Assigned: ${methodName(selectedMethod)}`);
      resetForm();
      await loadRewards();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteReward = async id => {
    if (!window.confirm('Delete this reward?')) return;
    setDeleting(id);
    setError('');
    setSuccess('');

    try {
      const { data, error } = await supabase.rpc('admin_delete_reward', {
        p_phone: adminPhone, p_password: adminPassword, p_reward_id: Number(id)
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.message || 'Unable to delete reward.');

      setSuccess('Reward deleted successfully.');
      if (editingId === id) resetForm();
      await loadRewards();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(null);
    }
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return rewards.filter(r =>
      String(r.customer_phone || '').toLowerCase().includes(q) ||
      methodName(r.transfer_method).toLowerCase().includes(q)
    );
  }, [rewards, search]);

  const total = rewards.reduce((sum, r) => sum + Number(r.daily_withdrawals || 0), 0);

  return (
    <div className="container-fluid py-3 rw" style={{ maxWidth: 1400 }}>
      <style>{`
        .rw-card{background:#fff;border:1px solid #eee;border-radius:16px}
        .rw-icon{width:38px;height:38px;display:grid;place-items:center;background:${LIGHT};color:${BRAND};border-radius:11px;font-size:18px}
        .rw .form-control{border-radius:10px;padding:10px 12px}
        .rw .form-control:focus{border-color:${BRAND};box-shadow:0 0 0 3px #9B7AF220}
        .rw-label{font-size:13px;font-weight:650;margin-bottom:6px}
        .rw-table th{background:#faf9fd;color:#777;font-size:12px;white-space:nowrap}
        .rw-table th,.rw-table td{padding:13px;vertical-align:middle}
        .rw-action{width:33px;height:33px;border:0;border-radius:9px}
      `}</style>

      {/* Header */}
      <div className="rounded-4 p-3 text-white mb-3"
        style={{ background: `linear-gradient(135deg,${BRAND},${DARK})` }}>
        <div className="d-flex align-items-center gap-2">
          <button onClick={onBack} className="btn btn-light btn-sm rounded-circle">
            <i className="bi bi-arrow-left" style={{ color: BRAND }} />
          </button>
          <i className="bi bi-gift fs-4" />
          <div>
            <h6 className="fw-bold mb-0">Rewards</h6>
            <small className="opacity-75">Manage customer rewards</small>
          </div>
          <button onClick={loadRewards} disabled={loading}
            className="btn btn-light btn-sm rounded-pill ms-auto" style={{ color: DARK }}>
            <i className="bi bi-arrow-clockwise" />
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && <div className="alert alert-danger py-2">{error}</div>}
      {success && <div className="alert alert-success py-2">{success}</div>}

      {/* Statistics */}
      <div className="row g-2 mb-3">
        <div className="col-6">
          <div className="rw-card p-3">
            <div className="d-flex align-items-center justify-content-between">
              <small className="text-muted">Total Customers</small>
              <i className="bi bi-people-fill" style={{ color: BRAND }} />
            </div>
            <h5 className="fw-bold mt-2 mb-0">{rewards.length.toLocaleString()}</h5>
          </div>
        </div>
        <div className="col-6">
          <div className="rw-card p-3">
            <div className="d-flex align-items-center justify-content-between">
              <small className="text-muted">Daily Withdrawals</small>
              <i className="bi bi-wallet2" style={{ color: BRAND }} />
            </div>
            <h5 className="fw-bold mt-2 mb-0">{money(total)} ETB</h5>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="rw-card mb-3">
        <div className="p-3 border-bottom d-flex align-items-center gap-2">
          <div className="rw-icon">
            <i className={`bi ${editingId ? 'bi-pencil-square' : 'bi-plus-lg'}`} />
          </div>
          <h6 className="fw-bold mb-0">{editingId ? 'Edit Reward' : 'Add Reward'}</h6>
        </div>

        <form className="p-3" onSubmit={saveReward}>
          <div className="row g-3">
            <div className="col-md-4">
              <label className="rw-label">Customer Phone</label>
              <input className="form-control" placeholder="Phone number"
                value={phone} onChange={e => setPhone(e.target.value)} required />
            </div>
            <div className="col-md-4">
              <label className="rw-label">Transfer Method</label>
              <input className="form-control" readOnly
                value={editingId ? methodName(method) : 'Automatically assigned'} />
            </div>
            <div className="col-md-4">
              <label className="rw-label">Daily Withdrawals (ETB)</label>
              <input type="number" min="0" step="0.01" className="form-control"
                placeholder="Amount" value={amount}
                onChange={e => setAmount(e.target.value)} required />
            </div>
          </div>

          <div className="d-flex gap-2 mt-3">
            <button className="btn text-white rounded-3 px-4" disabled={saving}
              style={{ background: BRAND }}>
              {saving ? 'Saving...' : editingId ? 'Update' : 'Add Reward'}
            </button>
            {editingId && <button type="button" className="btn btn-light rounded-3"
              onClick={resetForm}>Cancel</button>}
          </div>
        </form>
      </div>

      {/* List */}
      <div className="rw-card overflow-hidden">
        <div className="p-3 border-bottom d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div>
            <h6 className="fw-bold mb-0">Rewards List</h6>
            <small className="text-muted">{filtered.length} records</small>
          </div>
          <input className="form-control" style={{ maxWidth: 230 }}
            placeholder="Search customer..." value={search}
            onChange={e => setSearch(e.target.value)} />
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border" style={{ color: BRAND }} />
          </div>
        ) : !filtered.length ? (
          <div className="text-center text-muted py-5">
            <i className="bi bi-gift fs-2 d-block mb-2" />
            No rewards found.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table rw-table table-hover mb-0">
              <thead>
                <tr>
                  <th className="ps-3">#</th>
                  <th>Customer</th>
                  <th>Transfer Method</th>
                  <th>Daily Withdrawals</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr key={r.id}>
                    <td className="ps-3 text-muted">{i + 1}</td>
                    <td className="fw-semibold">{r.customer_phone}</td>
                    <td>
                      <span className="badge rounded-pill px-3 py-2"
                        style={{ color: DARK, background: LIGHT }}>
                        {methodName(r.transfer_method)}
                      </span>
                    </td>
                    <td className="fw-semibold">{money(r.daily_withdrawals)} ETB</td>
                    <td className="text-center text-nowrap">
                      <button className="rw-action me-1"
                        style={{ color: BRAND, background: LIGHT }}
                        onClick={() => editReward(r)} title="Edit">
                        <i className="bi bi-pencil-square" />
                      </button>
                      <button className="rw-action"
                        style={{ color: '#D94B58', background: '#FFF0F1' }}
                        onClick={() => deleteReward(r.id)}
                        disabled={deleting === r.id} title="Delete">
                        {deleting === r.id
                          ? <span className="spinner-border spinner-border-sm" />
                          : <i className="bi bi-trash3" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Rewards;
