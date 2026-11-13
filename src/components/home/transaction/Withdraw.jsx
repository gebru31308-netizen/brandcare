
import React, { useState } from 'react';

const BRAND = '#9B7AF2';
const DARK = '#7651D5';
const LIGHT = '#F4F0FF';
const GRADIENT = `linear-gradient(135deg, ${BRAND}, ${DARK})`;

const MIN_WITHDRAWAL = 250;

const methods = [
  { id: 'telebirr', name: 'Telebirr', icon: 'bi-phone' },
  { id: 'cbe', name: 'Commercial Bank of Ethiopia (CBE)', icon: 'bi-bank' }
];

const money = value => Number(value || 0).toLocaleString('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

function Withdraw({ balance = 0, onBack, onWithdraw }) {
  const [method, setMethod] = useState('telebirr');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState('');

  const currentBalance = Number(balance) || 0;
  const withdrawalAmount = Number(amount);
  const selectedMethod = methods.find(item => item.id === method);

  const closeModal = () => {
    if (!loading) setModal('');
  };

  const validateWithdrawal = () => {
    if (!accountName.trim())
      return setModal('name');

    if (!accountNumber.trim())
      return setModal('account');

    if (!amount || !Number.isFinite(withdrawalAmount) || withdrawalAmount <= 0)
      return setModal('amount');

    if (withdrawalAmount < MIN_WITHDRAWAL)
      return setModal('minimum');

    if (withdrawalAmount > currentBalance)
      return setModal('balance');

    setModal('confirm');
  };

  const confirmWithdrawal = async () => {
    if (loading) return;

    setLoading(true);

    try {
      if (!onWithdraw) throw new Error('Withdrawal service is unavailable.');

      await onWithdraw({
        method,
        accountName: accountName.trim(),
        accountNumber: accountNumber.trim(),
        amount: withdrawalAmount
      });

      setModal('success');
      setAccountName('');
      setAccountNumber('');
      setAmount('');
    } catch (error) {
      console.error('Withdrawal error:', error);
      setModal('error');
    } finally {
      setLoading(false);
    }
  };

  const messages = {
    name: {
      icon: 'bi-person',
      title: 'Account Name Required',
      text: 'Please enter the account holder name to continue.'
    },
    account: {
      icon: 'bi-credit-card',
      title: 'Account Number Required',
      text: 'Please enter your Telebirr or bank account number.'
    },
    amount: {
      icon: 'bi-cash',
      title: 'Invalid Amount',
      text: 'Please enter a valid withdrawal amount.'
    },
    minimum: {
      icon: 'bi-exclamation-circle',
      title: 'Minimum Withdrawal',
      text: 'The minimum withdrawal amount is ETB 250.00.'
    },
    balance: {
      icon: 'bi-wallet2',
      title: 'Insufficient Balance',
      text: 'Your withdrawal amount exceeds your available balance.'
    }
  };

  return (
    <div className="container py-3 pb-5" style={{ maxWidth: 560 }}>
      <style>{`
        .wd-card{background:white;border:1px solid #eeeaf5;border-radius:15px;padding:16px}
        .wd-method{width:100%;padding:12px;border:1px solid #eae7f2;background:white;border-radius:11px;text-align:left}
        .wd-method.active{border:2px solid ${BRAND};background:${LIGHT}}
        .wd-input{border-radius:10px;padding:11px}
        .wd-btn{background:${GRADIENT};color:white;border:0;border-radius:11px;padding:12px;font-weight:700}
        .wd-btn:disabled{opacity:.55}
        .wd-icon{color:${BRAND}}
        .wd-overlay{position:fixed;inset:0;z-index:4000;background:#160D2FCC;display:flex;align-items:center;justify-content:center;padding:16px}
        .wd-modal{background:white;border-radius:20px;width:100%;max-width:390px;padding:22px;box-shadow:0 15px 50px #0002;animation:wd-show .2s ease-out}
        @keyframes wd-show{from{opacity:0;transform:translateY(12px) scale(.98)}to{opacity:1;transform:translateY(0) scale(1)}}
      `}</style>

      {/* Header */}
      <div className="d-flex align-items-center gap-3 mb-3">
        <button onClick={onBack} disabled={loading}
          className="btn rounded-circle d-flex align-items-center justify-content-center"
          style={{ width: 38, height: 38, background: LIGHT, color: BRAND }}>
          <i className="bi bi-arrow-left" />
        </button>
        <div>
          <h5 className="fw-bold mb-0">Withdraw</h5>
          <small className="text-muted">Withdraw funds from your wallet</small>
        </div>
      </div>

      {/* Balance */}
      <div className="rounded-4 p-3 mb-3 text-white" style={{ background: GRADIENT }}>
        <small className="opacity-75">Available Balance</small>
        <h2 className="fw-bold my-1">ETB {money(currentBalance)}</h2>
        <div className="d-flex align-items-center gap-2 mt-2 small opacity-75">
          <i className="bi bi-info-circle" />
          Minimum withdrawal: ETB {money(MIN_WITHDRAWAL)}
        </div>
      </div>

      {/* Withdrawal Method */}
      <div className="wd-card mb-3">
        <h6 className="fw-bold mb-3">Withdrawal Method</h6>
        <div className="d-flex flex-column gap-2">
          {methods.map(item => (
            <button key={item.id} type="button"
              disabled={loading}
              onClick={() => setMethod(item.id)}
              className={`wd-method ${method === item.id ? 'active' : ''}`}>
              <div className="d-flex align-items-center gap-3">
                <div className="rounded-3 d-flex align-items-center justify-content-center"
                  style={{ width: 40, height: 40, background: LIGHT }}>
                  <i className={`bi ${item.icon} fs-5 wd-icon`} />
                </div>
                <strong className="small flex-grow-1">{item.name}</strong>
                <i className={`bi ${method === item.id ? 'bi-check-circle-fill' : 'bi-circle'} wd-icon`} />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Account Details */}
      <div className="wd-card mb-3">
        <h6 className="fw-bold mb-3">Account Details</h6>

        <label className="form-label small fw-semibold">Account Holder Name</label>
        <input className="form-control wd-input mb-3"
          placeholder="Enter account holder name"
          value={accountName}
          disabled={loading}
          onChange={e => setAccountName(e.target.value)} />

        <label className="form-label small fw-semibold">
          {method === 'telebirr' ? 'Telebirr Number' : 'CBE Account Number'}
        </label>
        <input className="form-control wd-input"
          type="text"
          placeholder={method === 'telebirr' ? '09XXXXXXXX' : 'Enter CBE account number'}
          value={accountNumber}
          disabled={loading}
          onChange={e => setAccountNumber(e.target.value)} />
      </div>

      {/* Withdrawal Amount */}
      <div className="wd-card">
        <h6 className="fw-bold mb-3">Withdrawal Amount</h6>

        <label className="form-label small fw-semibold">Amount (ETB)</label>
        <input type="number" min={MIN_WITHDRAWAL} max={currentBalance}
          className="form-control wd-input"
          placeholder="Enter withdrawal amount"
          value={amount}
          disabled={loading}
          onChange={e => setAmount(e.target.value)} />

        <small className="text-muted d-block mt-2">
          Minimum withdrawal: ETB {money(MIN_WITHDRAWAL)}
        </small>

        {amount !== '' && Number.isFinite(withdrawalAmount) && (
          <div className="rounded-3 p-3 mt-3" style={{ background: LIGHT }}>
            <div className="d-flex justify-content-between mb-2 small">
              <span className="text-muted">Withdrawal Amount</span>
              <strong>ETB {money(withdrawalAmount)}</strong>
            </div>
            <div className="d-flex justify-content-between small">
              <span className="text-muted">Remaining Balance</span>
              <strong style={{
                color: withdrawalAmount > currentBalance ? '#dc3545' : '#198754'
              }}>
                ETB {money(currentBalance - withdrawalAmount)}
              </strong>
            </div>
          </div>
        )}

        <button className="wd-btn w-100 mt-3"
          onClick={validateWithdrawal} disabled={loading}>
          Continue to Withdraw <i className="bi bi-arrow-right ms-2" />
        </button>
      </div>

      {/* Validation Modals */}
      {messages[modal] && (
        <div className="wd-overlay" onClick={closeModal}>
          <div className="wd-modal text-center" onClick={e => e.stopPropagation()}>
            <div className="rounded-circle mx-auto d-flex align-items-center justify-content-center mb-3"
              style={{ width: 60, height: 60, background: LIGHT, color: BRAND }}>
              <i className={`bi ${messages[modal].icon} fs-3`} />
            </div>
            <h5 className="fw-bold">{messages[modal].title}</h5>
            <p className="text-muted small mb-4">{messages[modal].text}</p>
            <button className="wd-btn w-100" onClick={closeModal}>Got it</button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {modal === 'confirm' && (
        <div className="wd-overlay" onClick={closeModal}>
          <div className="wd-modal" onClick={e => e.stopPropagation()}>
            <div className="text-center mb-3">
              <div className="rounded-circle mx-auto d-flex align-items-center justify-content-center"
                style={{ width: 58, height: 58, background: LIGHT, color: BRAND }}>
                <i className="bi bi-wallet2 fs-3" />
              </div>
              <h5 className="fw-bold mt-3 mb-1">Confirm Withdrawal</h5>
              <small className="text-muted">Review your withdrawal details.</small>
            </div>

            <div className="rounded-3 p-3 mb-3 small" style={{ background: LIGHT }}>
              {[
                ['Amount', `ETB ${money(withdrawalAmount)}`],
                ['Method', selectedMethod.name],
                ['Account Name', accountName.trim()],
                ['Account Number', accountNumber.trim()]
              ].map(([label, value]) => (
                <div key={label} className="d-flex justify-content-between gap-3 mb-2">
                  <span className="text-muted">{label}</span>
                  <strong className="text-end text-break">{value}</strong>
                </div>
              ))}
              <div className="d-flex justify-content-between">
                <span className="text-muted">Status</span>
                <span className="badge bg-warning text-dark">Pending Review</span>
              </div>
            </div>

            <div className="d-flex gap-2">
              <button className="btn btn-light flex-fill rounded-3"
                disabled={loading} onClick={closeModal}>
                Cancel
              </button>
              <button className="wd-btn flex-fill"
                disabled={loading} onClick={confirmWithdrawal}>
                {loading ? (
                  <><span className="spinner-border spinner-border-sm me-2" />Processing</>
                ) : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {modal === 'success' && (
        <div className="wd-overlay">
          <div className="wd-modal text-center">
            <div className="rounded-circle mx-auto d-flex align-items-center justify-content-center mb-3"
              style={{ width: 68, height: 68, background: '#E8F8EF', color: '#198754' }}>
              <i className="bi bi-check-circle-fill fs-1" />
            </div>

            <h5 className="fw-bold mb-2">Request Submitted!</h5>
            <p className="text-muted small">
              Your withdrawal request has been submitted successfully.
              Our team will review it shortly. Your balance will be updated
              after approval.
            </p>

            <div className="rounded-3 p-3 text-start small mb-3" style={{ background: LIGHT }}>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Amount</span>
                <strong>ETB {money(withdrawalAmount)}</strong>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Method</span>
                <strong>{selectedMethod.name}</strong>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Status</span>
                <span className="badge bg-warning text-dark">Pending</span>
              </div>
            </div>

            <button className="wd-btn w-100" onClick={onBack}>
              Done
            </button>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {modal === 'error' && (
        <div className="wd-overlay">
          <div className="wd-modal text-center">
            <div className="rounded-circle mx-auto d-flex align-items-center justify-content-center mb-3"
              style={{ width: 60, height: 60, background: '#FDECEC', color: '#DC3545' }}>
              <i className="bi bi-exclamation-circle-fill fs-3" />
            </div>
            <h5 className="fw-bold">Submission Failed</h5>
            <p className="text-muted small">
              We couldn't submit your withdrawal request. Please check your connection and try again.
            </p>
            <button className="wd-btn w-100" onClick={() => setModal('confirm')}>
              Try Again
            </button>
            <button className="btn btn-light w-100 rounded-3 mt-2" onClick={() => setModal('')}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Withdraw;
