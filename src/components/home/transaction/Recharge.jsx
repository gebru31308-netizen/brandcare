
import React, { useState } from 'react';
import { supabase } from '../../../supabase';

const BRAND = '#9B7AF2';
const DARK = '#7651D5';
const LIGHT = '#F4F0FF';
const GRADIENT = `linear-gradient(135deg, ${BRAND}, ${DARK})`;

const packages = [
  { id: 1, name: 'Basic', amount: 50 },
  { id: 2, name: 'Standard', amount: 100 },
  { id: 3, name: 'Premium', amount: 200 },
  { id: 4, name: 'Business', amount: 500 },
  { id: 5, name: 'Gold', amount: 1000 },
  { id: 6, name: 'VIP', amount: 2000 }
];

const methods = [
  { id: 'telebirr', name: 'Telebirr', icon: 'bi-phone' },
  { id: 'cbe', name: 'Commercial Bank of Ethiopia (CBE)', icon: 'bi-bank' }
];

const accountName = 'Chala';
const accounts = { telebirr: '0914688285', cbe: '1000108469928' };
const money = value => Number(value || 0).toLocaleString();

function Recharge({ currentUser, loginCredentials, onBack, onSubmitted }) {
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [method, setMethod] = useState('telebirr');
  const [showInstructions, setShowInstructions] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const selected = packages.find(p => p.id === selectedPackage);
  const total = selected?.amount || 0;
  const selectedMethod = methods.find(m => m.id === method);

  const copyText = async text => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Copied successfully!');
    } catch {
      window.prompt('Copy this information:', text);
    }
  };

  const handleSubmit = async () => {
    if (!currentUser?.id || !loginCredentials?.phone || !loginCredentials?.password) {
      setError('Please log in again before submitting your deposit.');
      setShowConfirmation(false);
      return;
    }

    if (!paymentMessage.trim()) {
      setError('Please enter your payment SMS or transaction code.');
      setShowConfirmation(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data, error: submitError } = await supabase.rpc('submit_deposit', {
        p_phone: loginCredentials.phone,
        p_password: loginCredentials.password,
        p_amount: total,
        p_method: method,
        p_payment_message: paymentMessage.trim()
      });

      if (submitError) throw submitError;
      if (!data?.success) throw new Error(data?.message || 'Deposit submission failed.');

      setShowConfirmation(false);
      setSuccess('Your deposit request was submitted successfully. Please wait for administrator approval.');
      setPaymentMessage('');
      onSubmitted?.(data);
    } catch (err) {
      console.error('Deposit submission error:', err);
      setError(err.message || 'Unable to submit your deposit.');
      setShowConfirmation(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-3 pb-5" style={{ maxWidth: 560 }}>
      <style>{`
        .rc-card{background:#fff;border:1px solid #eeeaf5;border-radius:15px;padding:15px}
        .rc-package{width:100%;padding:13px;border:1px solid #eae7f2;background:white;border-radius:12px;text-align:left;transition:.2s}
        .rc-package.active{border:2px solid ${BRAND};background:${LIGHT}}
        .rc-package.active strong{color:${DARK}}
        .rc-method{width:100%;padding:12px;border:1px solid #eae7f2;background:white;border-radius:11px;text-align:left}
        .rc-method.active{border:2px solid ${BRAND};background:${LIGHT}}
        .rc-btn{background:${GRADIENT};color:white;border:0;border-radius:11px;padding:12px;font-weight:700}
        .rc-btn:disabled{opacity:.5}
        .rc-icon{color:${BRAND}}
        .rc-copy{background:${LIGHT};color:${DARK};border:0;border-radius:8px;padding:6px 10px;font-size:12px;font-weight:700}
      `}</style>

      {/* Header */}
      <div className="d-flex align-items-center gap-3 mb-3">
        <button onClick={onBack} className="btn rounded-circle"
          style={{ background: LIGHT, color: BRAND, width: 38, height: 38 }}>
          <i className="bi bi-arrow-left" />
        </button>
        <div>
          <h5 className="fw-bold mb-0">Recharge</h5>
          <small className="text-muted">Add funds to your BrandCare wallet</small>
        </div>
      </div>

      {error && <div className="alert alert-danger py-2 small rounded-3">{error}</div>}

      {success ? (
        <div className="rc-card text-center py-4">
          <i className="bi bi-check-circle-fill text-success" style={{ fontSize: 48 }} />
          <h5 className="fw-bold mt-3">Request Submitted</h5>
          <p className="text-muted small">{success}</p>
          <button className="rc-btn w-100 mt-2" onClick={onBack}>Back to Home</button>
        </div>
      ) : (
        <>
          {!showInstructions ? (
            <>
              {/* Amount */}
              <div className="rounded-4 p-3 mb-3 text-white" style={{ background: GRADIENT }}>
                <small className="opacity-75">Selected Amount</small>
                <h2 className="fw-bold my-1">{money(total)} ETB</h2>
                <small className="opacity-75">{selected?.name || 'Select a recharge package'}</small>
              </div>

              <h6 className="fw-bold mb-2">Choose Package</h6>
              <div className="row g-2">
                {packages.map(p => (
                  <div className="col-6" key={p.id}>
                    <button onClick={() => setSelectedPackage(p.id)}
                      className={`rc-package ${selectedPackage === p.id ? 'active' : ''}`}>
                      <div className="d-flex justify-content-between mb-2">
                        <small className="text-muted fw-semibold">{p.name}</small>
                        <i className={`bi ${selectedPackage === p.id ? 'bi-check-circle-fill' : 'bi-circle'} rc-icon`} />
                      </div>
                      <strong className="fs-5">{money(p.amount)} ETB</strong>
                    </button>
                  </div>
                ))}
              </div>

              <div className="rc-card mt-3 d-flex justify-content-between align-items-center">
                <strong>Total Amount</strong>
                <strong style={{ color: BRAND }}>{money(total)} ETB</strong>
              </div>

              <button className="rc-btn w-100 mt-3" disabled={!selected} onClick={() => {
                setError('');
                setShowInstructions(true);
              }}>
                Continue to Payment <i className="bi bi-arrow-right ms-2" />
              </button>
            </>
          ) : (
            <>
              {/* Payment Details */}
              <div className="rc-card mb-3">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <small className="text-muted">Recharge Amount</small>
                    <h4 className="fw-bold mb-0" style={{ color: BRAND }}>ETB {money(total)}</h4>
                    <small className="text-muted">{selected?.name}</small>
                  </div>
                  <i className="bi bi-wallet2 fs-2 rc-icon" />
                </div>

                <h6 className="fw-bold mb-2">Payment Method</h6>
                <div className="d-flex flex-column gap-2">
                  {methods.map(m => (
                    <button key={m.id} onClick={() => setMethod(m.id)}
                      className={`rc-method ${method === m.id ? 'active' : ''}`}>
                      <div className="d-flex align-items-center gap-2">
                        <i className={`bi ${m.icon} fs-5 rc-icon`} />
                        <small className="fw-semibold">{m.name}</small>
                        <i className={`bi ${method === m.id ? 'bi-check-circle-fill' : 'bi-circle'} ms-auto rc-icon`} />
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-3">
                  <small className="text-muted">Account Name</small>
                  <div className="d-flex justify-content-between align-items-center">
                    <strong>{accountName}</strong>
                    <button className="rc-copy" onClick={() => copyText(accountName)}>Copy</button>
                  </div>
                </div>

                <div className="rounded-3 p-3 mt-3" style={{ background: LIGHT }}>
                  <small className="text-muted">Account Number</small>
                  <div className="d-flex justify-content-between align-items-center">
                    <strong className="fs-5">{accounts[method]}</strong>
                    <button className="rc-copy" onClick={() => copyText(accounts[method])}>Copy</button>
                  </div>
                </div>

                <p className="small mb-0 mt-3 text-muted">
                  <i className="bi bi-info-circle rc-icon me-2" />
                  Transfer the exact amount. Your balance updates after administrator approval.
                </p>
              </div>

              {/* Payment SMS */}
              <div className="rc-card">
                <h6 className="fw-bold mb-2">Payment Confirmation</h6>
                <label className="small fw-semibold mb-2">Payment SMS / Transaction Code</label>
                <textarea className="form-control rounded-3" rows={3}
                  placeholder="Paste your payment SMS or transaction code..."
                  value={paymentMessage}
                  onChange={e => setPaymentMessage(e.target.value)} />

                <button className="rc-btn w-100 mt-3"
                  disabled={!paymentMessage.trim()}
                  onClick={() => { setError(''); setShowConfirmation(true); }}>
                  <i className="bi bi-send me-2" />Submit Deposit Request
                </button>
              </div>

              <button className="btn btn-light w-100 rounded-3 mt-2"
                onClick={() => { setShowInstructions(false); setError(''); }}>
                <i className="bi bi-arrow-left me-2" />Back to Packages
              </button>
            </>
          )}
        </>
      )}

      {/* Confirmation */}
      {showConfirmation && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{ zIndex: 4000, background: '#160D2FCC' }}>
          <div className="bg-white rounded-4 p-4 w-100 shadow-lg" style={{ maxWidth: 380 }}>
            <div className="text-center mb-3">
              <i className="bi bi-shield-check rc-icon" style={{ fontSize: 42 }} />
              <h5 className="fw-bold mt-2">Confirm Deposit</h5>
              <p className="text-muted small">Have you completed the payment transfer?</p>
            </div>

            <div className="rounded-3 p-3 mb-3 small" style={{ background: LIGHT }}>
              <div className="d-flex justify-content-between mb-2">
                <span>Amount</span><strong>ETB {money(total)}</strong>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Method</span><strong>{selectedMethod?.name}</strong>
              </div>
              <div className="d-flex justify-content-between">
                <span>Status</span><span className="badge bg-warning text-dark">Pending Review</span>
              </div>
            </div>

            <div className="d-flex gap-2">
              <button className="btn btn-light flex-fill rounded-3"
                disabled={loading} onClick={() => setShowConfirmation(false)}>
                Cancel
              </button>
              <button className="rc-btn flex-fill"
                disabled={loading} onClick={handleSubmit}>
                {loading ? <><span className="spinner-border spinner-border-sm me-2" />Submitting</> : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Recharge;
