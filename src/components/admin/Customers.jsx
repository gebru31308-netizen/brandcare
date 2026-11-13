
import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabase';

const BRAND = '#9B7AF2';
const GRADIENT = 'linear-gradient(135deg, #9B7AF2, #7651D5)';

const money = value => Number(value || 0).toLocaleString('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

function Customers({ onBack }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionId, setActionId] = useState(null);
  const [editing, setEditing] = useState(null);
  const [balance, setBalance] = useState('');
  const [commission, setCommission] = useState('');

  const fetchCustomers = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('users')
      .select('id, phone, balance, commission_balance, referral_code, referred_by_id, created_at, is_admin')
      .order('created_at', { ascending: false });

    if (error) alert('Unable to load customers: ' + error.message);
    else setCustomers(data || []);

    setLoading(false);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const closeModal = () => {
    setEditing(null);
    setBalance('');
    setCommission('');
  };

  const openModal = customer => {
    setEditing(customer);
    setBalance(String(customer.balance ?? 0));
    setCommission(String(customer.commission_balance ?? 0));
  };

  const saveCustomer = async () => {
    if (!editing) return;

    const b = Number(balance);
    const c = Number(commission);

    if (
      !balance.trim() ||
      !commission.trim() ||
      !Number.isFinite(b) ||
      !Number.isFinite(c) ||
      b < 0 ||
      c < 0
    ) {
      return alert('Please enter valid non-negative amounts.');
    }

    setActionId(editing.id);

    const { data, error } = await supabase
      .from('users')
      .update({ balance: b, commission_balance: c })
      .eq('id', editing.id)
      .select('id, balance, commission_balance')
      .maybeSingle();

    setActionId(null);

    if (error) return alert('Update failed: ' + error.message);
    if (!data) return alert('No customer updated. Check Supabase permissions.');

    setCustomers(prev => prev.map(user =>
      user.id === editing.id ? { ...user, ...data } : user
    ));

    closeModal();
    alert('Customer account updated successfully.');
  };

  // CHANGE USER ROLE
  const toggleRole = async user => {
    const newRole = !user.is_admin;
    const roleName = newRole ? 'Admin' : 'User';

    if (!window.confirm(
      `Change ${user.phone}'s role to ${roleName}?`
    )) return;

    setActionId(user.id);

    const { data, error } = await supabase
      .from('users')
      .update({ is_admin: newRole })
      .eq('id', user.id)
      .select('id, is_admin')
      .maybeSingle();

    setActionId(null);

    if (error) {
      return alert('Role update failed: ' + error.message);
    }

    if (!data) {
      return alert('Role was not updated. Check Supabase permissions.');
    }

    setCustomers(prev => prev.map(customer =>
      customer.id === user.id
        ? { ...customer, is_admin: data.is_admin }
        : customer
    ));

    alert(`${user.phone} is now ${roleName}.`);
  };

  const resetPassword = async customer => {
    if (!window.confirm(`Reset password for ${customer.phone}?`)) return;

    setActionId(customer.id);

    const temporaryPassword =
      Math.random().toString(36).slice(-5).toUpperCase() +
      Math.floor(100 + Math.random() * 900);

    const { error } = await supabase
      .from('users')
      .update({ password: temporaryPassword })
      .eq('id', customer.id);

    setActionId(null);

    if (error) return alert('Password reset failed: ' + error.message);

    alert(
      `Password reset successful!\n\nCustomer: ${customer.phone}\nTemporary password: ${temporaryPassword}\n\nShare it securely with the customer.`
    );
  };

  const deleteCustomer = async customer => {
    if (customer.is_admin) {
      return alert('Admin accounts cannot be deleted here.');
    }

    if (!window.confirm(
      `Permanently delete ${customer.phone}? This cannot be undone.`
    )) return;

    setActionId(customer.id);

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', customer.id);

    setActionId(null);

    if (error) return alert('Delete failed: ' + error.message);

    setCustomers(prev => prev.filter(user => user.id !== customer.id));
    alert('Customer deleted successfully.');
  };

  const filtered = customers.filter(user =>
    user.phone?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = [
    ['bi-people-fill', 'Total Accounts', customers.length],
    ['bi-wallet2', 'Total Balance', `ETB ${money(customers.reduce((s, u) => s + Number(u.balance || 0), 0))}`],
    ['bi-cash-coin', 'Total Commissions', `ETB ${money(customers.reduce((s, u) => s + Number(u.commission_balance || 0), 0))}`]
  ];

  return (
    <div className="container-fluid py-3">
      <style>{`
        .customer-modal-overlay {
          position:fixed; inset:0; z-index:1055;
          background:#17132999; display:flex;
          align-items:center; justify-content:center; padding:15px;
        }
        .customer-modal {
          width:100%; max-width:430px; background:white;
          border-radius:20px; overflow:hidden;
          box-shadow:0 15px 45px #0003;
        }
        .customer-edit-input { border-radius:12px; padding:12px; }
        .customer-action { color:${BRAND}; border-color:${BRAND}; }
        .customer-action:hover { color:white; background:${BRAND}; }
        .role-toggle {
          width:48px; height:26px; border:0;
          border-radius:30px; position:relative;
          transition:background .2s ease;
          cursor:pointer; padding:0;
        }
        .role-toggle:disabled { opacity:.5; cursor:not-allowed; }
        .role-toggle span {
          position:absolute; top:3px; left:3px;
          width:20px; height:20px; border-radius:50%;
          background:white; transition:transform .2s ease;
          box-shadow:0 1px 4px #0003;
        }
        .role-toggle.active span { transform:translateX(22px); }
      `}</style>

      <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
        <div className="d-flex align-items-center gap-3">
          <button onClick={onBack} className="btn bg-white rounded-circle shadow-sm">
            <i className="bi bi-arrow-left fs-5" style={{ color: BRAND }} />
          </button>
          <div>
            <h5 className="fw-bold mb-0">Customers</h5>
            <small className="text-muted">Manage customer accounts</small>
          </div>
        </div>

        <button
          onClick={fetchCustomers}
          disabled={loading}
          className="btn btn-sm rounded-pill px-3"
          style={{ background: '#F4F0FF', color: BRAND }}
        >
          <i className="bi bi-arrow-clockwise me-1" /> Refresh
        </button>
      </div>

      <div className="row g-3 mb-4">
        {stats.map(([icon, title, value]) => (
          <div className="col-6 col-lg-4" key={title}>
            <div className="bg-white rounded-4 p-3 shadow-sm h-100">
              <i className={`bi ${icon} fs-4`} style={{ color: BRAND }} />
              <h5 className="fw-bold mt-2 mb-0">{value}</h5>
              <small className="text-muted">{title}</small>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-4 shadow-sm p-3 mb-3">
        <div className="input-group">
          <span className="input-group-text bg-light border-0">
            <i className="bi bi-search" style={{ color: BRAND }} />
          </span>
          <input
            className="form-control bg-light border-0"
            placeholder="Search by phone number..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="btn btn-light" onClick={() => setSearch('')}>
              <i className="bi bi-x-lg" />
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-4 shadow-sm overflow-hidden">
        <div className="p-3 border-bottom d-flex justify-content-between">
          <h6 className="fw-bold mb-0">Customer Accounts</h6>
          <small className="text-muted">{filtered.length} accounts</small>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border" style={{ color: BRAND }} />
            <p className="text-muted small mt-2 mb-0">Loading customers...</p>
          </div>
        ) : !filtered.length ? (
          <div className="text-center py-5">
            <i className="bi bi-people fs-1" style={{ color: BRAND }} />
            <p className="text-muted mt-2 mb-0">No customers found.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-3">ID</th>
                  <th>Customer</th>
                  <th>Balance</th>
                  <th>Commission</th>
                  <th>Referral Code</th>
                  <th>Joined</th>
                  <th>Status</th>
                  <th>Role</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map(user => (
                  <tr key={user.id}>
                    <td className="ps-3 text-muted">#{user.id}</td>
                    <td>{user.phone}</td>
                    <td>{money(user.balance)} ETB</td>
                    <td>{money(user.commission_balance)} ETB</td>

                    <td>
                      <span
                        className="badge rounded-pill"
                        style={{ background: '#F4F0FF', color: BRAND }}
                      >
                        {user.referral_code || 'N/A'}
                      </span>
                    </td>

                    <td className="small text-muted">
                      {user.created_at
                        ? new Date(user.created_at).toLocaleDateString()
                        : 'N/A'}
                    </td>

                    <td>
                      <span
                        className="badge rounded-pill"
                        style={{
                          background: '#EAF8F0',
                          color: '#198754'
                        }}
                      >
                        Active
                      </span>
                    </td>

                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <button
                          type="button"
                          className={`role-toggle ${user.is_admin ? 'active' : ''}`}
                          style={{
                            background: user.is_admin ? BRAND : '#C9C9D1'
                          }}
                          disabled={actionId === user.id}
                          onClick={() => toggleRole(user)}
                          title={`Change role to ${user.is_admin ? 'User' : 'Admin'}`}
                          aria-label={`Change ${user.phone} role`}
                          aria-pressed={!!user.is_admin}
                        >
                          <span />
                        </button>

                        <small
                          className="fw-semibold"
                          style={{ color: user.is_admin ? BRAND : '#777' }}
                        >
                          {user.is_admin ? 'Admin' : 'User'}
                        </small>
                      </div>
                    </td>

                    <td>
                      <div className="d-flex justify-content-center flex-wrap gap-1">
                        <button
                          className="btn btn-sm customer-action"
                          title="Edit account"
                          disabled={actionId === user.id}
                          onClick={() => openModal(user)}
                        >
                          <i className="bi bi-pencil-square" />
                          <span className="d-none d-lg-inline ms-1">Edit</span>
                        </button>

                        <button
                          className="btn btn-sm customer-action"
                          title="Reset password"
                          disabled={actionId === user.id}
                          onClick={() => resetPassword(user)}
                        >
                          <i className="bi bi-key-fill" />
                          <span className="d-none d-lg-inline ms-1">Reset</span>
                        </button>

                        <button
                          className="btn btn-sm btn-outline-danger"
                          title="Delete customer"
                          disabled={actionId === user.id || user.is_admin}
                          onClick={() => deleteCustomer(user)}
                        >
                          <i className="bi bi-trash" />
                          <span className="d-none d-lg-inline ms-1">Delete</span>
                        </button>
                      </div>

                      {actionId === user.id && (
                        <small className="text-muted d-block text-center mt-1">
                          Processing...
                        </small>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing && (
        <div className="customer-modal-overlay" onClick={closeModal}>
          <div className="customer-modal" onClick={e => e.stopPropagation()}>
            <div
              className="p-3 text-white d-flex justify-content-between align-items-center"
              style={{ background: GRADIENT }}
            >
              <div>
                <h6 className="fw-bold mb-1">Edit Customer Account</h6>
                <small className="opacity-75">{editing.phone}</small>
              </div>
              <button
                className="btn btn-sm btn-light rounded-circle"
                onClick={closeModal}
                disabled={actionId === editing.id}
              >
                <i className="bi bi-x-lg" />
              </button>
            </div>

            <div className="p-4">
              <label className="form-label fw-semibold">Customer Balance (ETB)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="form-control customer-edit-input mb-3"
                value={balance}
                onChange={e => setBalance(e.target.value)}
                placeholder="Enter balance"
              />

              <label className="form-label fw-semibold">Commission Balance (ETB)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="form-control customer-edit-input mb-4"
                value={commission}
                onChange={e => setCommission(e.target.value)}
                placeholder="Enter commission"
              />

              <div className="d-flex gap-2">
                <button
                  onClick={closeModal}
                  disabled={actionId === editing.id}
                  className="btn btn-light flex-fill rounded-3"
                >
                  Cancel
                </button>

                <button
                  onClick={saveCustomer}
                  disabled={actionId === editing.id}
                  className="btn text-white flex-fill rounded-3 fw-semibold"
                  style={{ background: GRADIENT }}
                >
                  {actionId === editing.id
                    ? <><span className="spinner-border spinner-border-sm me-2" />Saving...</>
                    : <><i className="bi bi-check-circle me-2" />Save Changes</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <p className="text-muted small mt-3">
        <i className="bi bi-info-circle me-1" style={{ color: BRAND }} />
        Edit balances, reset passwords, change account roles, or delete customer accounts.
        Admin accounts cannot be deleted here.
      </p>
    </div>
  );
}

export default Customers;
