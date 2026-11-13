
import React from 'react';

const BRAND = '#9B7AF2';
const GRADIENT = 'linear-gradient(135deg, #9B7AF2, #7651D5)';

function PurchaseModal({ product, balance, buying, onConfirm, onClose, onRecharge }) {
  if (!product) return null;

  const price = Number(product.price) || 0;
  const availableBalance = Number(balance) || 0;
  const insufficient = availableBalance < price;
  const money = value => Number(value || 0).toLocaleString('en-US');

  const handleAction = () => {
    if (buying) return;
    if (insufficient) {
      onRecharge?.();
      return;
    }
    onConfirm?.();
  };

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
      style={{ background: '#160D2FCC', zIndex: 3000, backdropFilter: 'blur(3px)' }}
      onClick={e => e.target === e.currentTarget && !buying && onClose()}
    >
      <div className="bg-white rounded-4 shadow-lg w-100 p-3"
        style={{ maxWidth: 390, maxHeight: '90vh', overflowY: 'auto' }}>

        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h6 className="fw-bold mb-0">Confirm Purchase</h6>
            <small className="text-muted">Review your order details</small>
          </div>
          <button className="btn btn-light rounded-circle p-2"
            onClick={onClose} disabled={buying}>
            <i className="bi bi-x-lg" style={{ color: BRAND }} />
          </button>
        </div>

        <div className="d-flex align-items-center gap-3 mb-3 p-2 rounded-3"
          style={{ background: '#F8F6FF' }}>
          {product.image_url ? (
            <img src={product.image_url} alt={product.name}
              style={{ width: 68, height: 68, objectFit: 'cover', borderRadius: 11 }} />
          ) : (
            <div className="rounded-3 d-flex align-items-center justify-content-center"
              style={{ width: 68, height: 68, background: '#EDE6FF', color: BRAND }}>
              <i className="bi bi-image fs-3" />
            </div>
          )}
          <div className="min-w-0">
            <h6 className="fw-bold mb-1">{product.name}</h6>
            <small className="text-muted">Product purchase</small>
          </div>
        </div>

        <div className="rounded-3 p-3 mb-3" style={{ background: '#F8F7FB' }}>
          {[
            ['Price', price],
            ['Daily Profit', product.daily_profit],
            ['Duration', `${product.days || 30} days`]
          ].map(([label, value]) => (
            <div key={label} className="d-flex justify-content-between mb-3 small">
              <span className="text-muted">{label}</span>
              <strong>{label === 'Duration' ? value : `ETB ${money(value)}`}</strong>
            </div>
          ))}
          <div className="d-flex justify-content-between align-items-center pt-2 border-top">
            <strong>Total Price</strong>
            <strong style={{ color: BRAND }}>ETB {money(price)}</strong>
          </div>
        </div>

        <div className="d-flex justify-content-between align-items-center mb-3">
          <span className="text-muted small">Available Balance</span>
          <strong className={insufficient ? 'text-danger' : 'text-success'}>
            ETB {money(availableBalance)}
          </strong>
        </div>

        {insufficient && (
          <div className="rounded-3 p-2 mb-3 small"
            style={{ background: '#FFF4E5', color: '#A66A13' }}>
            <i className="bi bi-info-circle me-2" />
            Insufficient balance. Recharge your wallet to purchase this product.
            <div className="mt-1 fw-semibold">
              Shortfall: ETB {money(price - availableBalance)}
            </div>
          </div>
        )}

        <button type="button" onClick={handleAction}
          disabled={buying}
          className="btn text-white fw-bold w-100 rounded-3 py-2"
          style={{ background: GRADIENT }}>
          {buying ? (
            <><span className="spinner-border spinner-border-sm me-2" />Processing...</>
          ) : insufficient ? (
            <><i className="bi bi-wallet2 me-2" />Recharge Now</>
          ) : (
            <><i className="bi bi-check-circle me-2" />Confirm Purchase</>
          )}
        </button>

        <button type="button" onClick={onClose} disabled={buying}
          className="btn btn-light w-100 rounded-3 mt-2 py-2">
          Cancel
        </button>
      </div>
    </div>
  );
}

export default PurchaseModal;
