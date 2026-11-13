
import React, { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../supabase';

const BRAND = '#9B7AF2';
const GRADIENT = 'linear-gradient(135deg,#9B7AF2,#7651D5)';

const methods = {
  telebirr: 'Telebirr', cbe: 'Commercial Bank of Ethiopia',
  abyssinia: 'Bank of Abyssinia', awash: 'Awash Bank',
  dashen: 'Dashen Bank', wegagen: 'Wegagen Bank',
  hibret: 'Hibret Bank', nib: 'Nib International Bank'
};

const money = n => `${Number(n || 0).toLocaleString('en-US', {
  minimumFractionDigits: 2, maximumFractionDigits: 2
})} ETB`;

const date = value => value && !isNaN(new Date(value))
  ? new Date(value).toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  : 'Date unavailable';

const statusInfo = status => {
  const value = String(status || 'pending').toLowerCase();
  if (['approved', 'completed'].includes(value))
    return ['Approved', 'success', 'check-circle-fill'];
  if (['rejected', 'failed'].includes(value))
    return ['Rejected', 'danger', 'x-circle-fill'];
  return ['Pending', 'warning', 'clock-fill'];
};

function Income({ currentUser, loginCredentials, onBack }) {
  const [balance, setBalance] = useState(0);
  const [income, setIncome] = useState(0);
  const [referredCount, setReferredCount] = useState(0);
  const [recharges, setRecharges] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState('');
  const [section, setSection] = useState('income');
  const [tab, setTab] = useState('recharge');

  const phone = loginCredentials?.phone || currentUser?.phone;
  const password = loginCredentials?.password;

  // Load balance and referrals
  useEffect(() => {
    let active = true;

    const load = async () => {
      if (!currentUser?.id) return setLoading(false);

      try {
        const { data, error } = await supabase.from('users')
          .select('balance,commission_balance')
          .eq('id', currentUser.id).single();

        if (error) throw error;
        if (!active) return;

        setBalance(Number(data?.balance || 0));
        setIncome(Number(data?.commission_balance || 0));

        const { count, error: countError } = await supabase.from('users')
          .select('id', { count: 'exact', head: true })
          .eq('referred_by_id', currentUser.id);

        if (countError) throw countError;
        if (active) setReferredCount(count || 0);
      } catch (err) {
        console.error('Income error:', err.message);
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => { active = false; };
  }, [currentUser?.id]);

  // Load transaction history
  const fetchHistory = useCallback(async () => {
    if (!phone || !password) {
      setHistoryError('Please log in again to view your transactions.');
      setHistoryLoading(false);
      return;
    }

    setHistoryLoading(true);
    setHistoryError('');

    try {
      const { data, error } = await supabase.rpc('get_my_transaction_history', {
        p_phone: phone, p_password: password
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.message || 'Unable to load history.');

      setRecharges(data.recharges || []);
      setWithdrawals(data.withdrawals || []);
    } catch (err) {
      console.error('History error:', err);
      setHistoryError(err.message || 'Unable to load transaction history.');
    } finally {
      setHistoryLoading(false);
    }
  }, [phone, password]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  // Transaction totals
  const total = list => list.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const approved = list => total(list.filter(item =>
    ['approved', 'completed'].includes(String(item.status || '').toLowerCase())
  ));

  const totalRecharge = total(recharges);
  const totalWithdrawal = total(withdrawals);
  const approvedRecharge = approved(recharges);
  const approvedWithdrawal = approved(withdrawals);
  const transactions = tab === 'recharge' ? recharges : withdrawals;

  const stats = [
    ['CURRENT BALANCE', money(balance), 'wallet-fill', '#EAF8F0', '#159B65'],
    ['REFERRAL BALANCE', money(income), 'cash-stack', '#F4F0FF', BRAND],
    ['REFERRED USERS', referredCount.toLocaleString(), 'people-fill', '#FFF5E8', '#D99428'],
    ['TOTAL TRANSACTIONS', recharges.length + withdrawals.length, 'clock-history', '#EEF5FF', '#3985CE']
  ];

  return (
    <div className="inc">
      <style>{`
        .inc{max-width:760px;margin:auto;padding:14px;color:#253047}
        .inc *{box-sizing:border-box}
        .inc-head{display:flex;align-items:center;gap:11px;margin-bottom:16px}
        .inc-back{width:39px;height:39px;border:1px solid #eee;border-radius:12px;background:white;color:${BRAND};font-size:18px}
        .inc-title{font-size:19px;font-weight:850;margin:0}
        .inc-sub{font-size:11px;color:#929bad;margin-top:3px}
        .inc-nav{display:grid;grid-template-columns:1fr 1fr;gap:7px;padding:5px;background:#f0eef8;border-radius:14px;margin-bottom:15px}
        .inc-nav button,.inc-tab{border:0;border-radius:11px;padding:12px 6px;background:transparent;color:#7e879a;font-size:11px;font-weight:800}
        .inc-nav button.active{background:${GRADIENT};color:white;box-shadow:0 3px 10px #9B7AF233}
        .inc-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:15px}
        .inc-card{background:white;border:1px solid #eeeef4;border-radius:15px;padding:13px;min-width:0;box-shadow:0 3px 12px #00000005}
        .inc-icon{width:35px;height:35px;border-radius:11px;display:grid;place-items:center;font-size:17px;margin-bottom:11px}
        .inc-label{font-size:10px;color:#8992a5;font-weight:750}
        .inc-value{font-size:clamp(13px,3.5vw,17px);font-weight:850;margin:5px 0 0;overflow-wrap:anywhere}
        .inc-info{background:#F4F0FF;color:#6e609c;border-radius:12px;padding:11px;font-size:10px;line-height:1.6;margin-top:12px}
        .inc-heading{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:5px 0 12px}
        .inc-heading h6{font-size:16px;font-weight:850;margin:0}
        .inc-refresh{width:36px;height:36px;border:1px solid #eee;border-radius:11px;background:white;color:${BRAND};font-size:17px}
        .inc-spin{animation:incspin 1s linear infinite}
        @keyframes incspin{to{transform:rotate(360deg)}}
        .inc-totals{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-bottom:12px}
        .inc-total{padding:13px;border-radius:14px;min-width:0}
        .inc-total strong{display:block;font-size:clamp(13px,3.5vw,17px);margin:8px 0 4px;overflow-wrap:anywhere}
        .inc-total small{font-size:10px;color:#8992a5}
        .inc-approved,.inc-history{background:white;border:1px solid #eeeef4;border-radius:15px;padding:13px;margin-bottom:13px}
        .inc-approved-row{display:flex;justify-content:space-between;gap:8px;font-size:11px;align-items:center}
        .inc-approved-row+ .inc-approved-row{border-top:1px solid #f0f0f4;margin-top:10px;padding-top:10px}
        .inc-tabs{display:flex;gap:6px;background:#f0eef8;padding:4px;border-radius:12px;margin-bottom:12px}
        .inc-tab{flex:1}
        .inc-tab.active-r{background:white;color:#159B65;box-shadow:0 2px 7px #0000000b}
        .inc-tab.active-w{background:white;color:#D94360;box-shadow:0 2px 7px #0000000b}
        .inc-record{border:1px solid #eeeef4;border-radius:13px;padding:12px;margin-top:9px}
        .inc-record-top{display:flex;justify-content:space-between;gap:8px}
        .inc-record-name{font-size:12px;font-weight:850}
        .inc-muted{font-size:10px;color:#929bad;margin-top:4px;overflow-wrap:anywhere}
        .inc-amount{font-size:12px;font-weight:850;white-space:nowrap}
        .inc-status{display:inline-block;font-size:9px;font-weight:800;padding:4px 8px;border-radius:20px;margin-top:6px}
        .inc-status.success{background:#dcfce7;color:#15803d}
        .inc-status.warning{background:#fef3c7;color:#a16207}
        .inc-status.danger{background:#fee2e2;color:#b91c1c}
        .inc-account{background:#f7f7fb;padding:9px;border-radius:9px;margin-top:10px;font-size:10px;overflow-wrap:anywhere}
        .inc-foot{display:flex;justify-content:space-between;gap:8px;border-top:1px solid #f0f0f4;padding-top:9px;margin-top:9px;color:#929bad;font-size:9px;flex-wrap:wrap}
        .inc-empty{text-align:center;padding:30px 10px;color:#8992a5;font-size:11px}
        .inc-empty i{display:block;font-size:27px;color:${BRAND};margin-bottom:8px}
        .inc-loading{text-align:center;padding:30px;color:#8992a5;font-size:11px}
        .inc-error{background:#fff7ed;color:#9a5815;padding:13px;border-radius:12px;font-size:11px}
        .inc-retry{border:1px solid #e9b878;border-radius:8px;background:white;color:#9a5815;padding:6px 10px;margin-top:9px;font-size:10px}
        @media(max-width:380px){.inc{padding:10px}.inc-card{padding:10px}.inc-total{padding:10px}.inc-tab{font-size:10px}}
      `}</style>

      {/* Header */}
      <div className="inc-head">
        <button className="inc-back" onClick={onBack} aria-label="Go back">
          <i className="bi bi-arrow-left" />
        </button>
        <div>
          <h4 className="inc-title">My Income</h4>
          <div className="inc-sub">Your balance and transactions</div>
        </div>
      </div>

      {/* Main navigation */}
      <div className="inc-nav">
        <button className={section === 'income' ? 'active' : ''}
          onClick={() => setSection('income')}>
          <i className="bi bi-wallet-fill me-2" />Income
        </button>
        <button className={section === 'history' ? 'active' : ''}
          onClick={() => setSection('history')}>
          <i className="bi bi-clock-history me-2" />Transaction History
        </button>
      </div>

      {section === 'income' ? (
        <>
          {loading ? <div className="inc-loading">
            <div className="spinner-border spinner-border-sm" style={{ color: BRAND }} />
            <div className="mt-2">Loading income...</div>
          </div> : (
            <div className="inc-grid">
              {stats.map(([label, value, icon, bg, color]) => (
                <div className="inc-card" key={label}>
                  <div className="inc-icon" style={{ background: bg, color }}>
                    <i className={`bi bi-${icon}`} />
                  </div>
                  <div className="inc-label">{label}</div>
                  <div className="inc-value" style={{ color: label === 'CURRENT BALANCE' ? '#159B65' : label === 'REFERRAL BALANCE' ? BRAND : '#253047' }}>
                    {value}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="inc-info">
            <i className="bi bi-info-circle-fill me-2" />
            Your overview includes your current balance, referral commissions and invited customers.
          </div>
        </>
      ) : (
        <>
          <div className="inc-heading">
            <div>
              <h6>Transaction History</h6>
              <div className="inc-sub">Your recharge and withdrawal records</div>
            </div>
            <button className="inc-refresh" onClick={fetchHistory} disabled={historyLoading}>
              <i className={`bi bi-arrow-clockwise ${historyLoading ? 'inc-spin' : ''}`} />
            </button>
          </div>

          <div className="inc-totals">
            <div className="inc-total" style={{ background: '#EAF8F0' }}>
              <span className="inc-label text-success">TOTAL RECHARGES</span>
              <strong className="text-success">{money(totalRecharge)}</strong>
              <small>{recharges.length} requests</small>
            </div>
            <div className="inc-total" style={{ background: '#FFF0F2' }}>
              <span className="inc-label" style={{ color: '#D94360' }}>TOTAL WITHDRAWALS</span>
              <strong style={{ color: '#D94360' }}>{money(totalWithdrawal)}</strong>
              <small>{withdrawals.length} requests</small>
            </div>
          </div>

          <div className="inc-approved">
            <div className="inc-approved-row">
              <span><i className="bi bi-check-circle-fill text-success me-2" />Approved Recharges</span>
              <strong className="text-success">{money(approvedRecharge)}</strong>
            </div>
            <div className="inc-approved-row">
              <span><i className="bi bi-check-circle-fill text-success me-2" />Approved Withdrawals</span>
              <strong style={{ color: '#D94360' }}>{money(approvedWithdrawal)}</strong>
            </div>
          </div>

          <div className="inc-tabs">
            <button className={`inc-tab ${tab === 'recharge' ? 'active-r' : ''}`}
              onClick={() => setTab('recharge')}>
              <i className="bi bi-arrow-down-circle me-1" />Recharges ({recharges.length})
            </button>
            <button className={`inc-tab ${tab === 'withdrawal' ? 'active-w' : ''}`}
              onClick={() => setTab('withdrawal')}>
              <i className="bi bi-arrow-up-circle me-1" />Withdrawals ({withdrawals.length})
            </button>
          </div>

          <div className="inc-history">
            <div className="inc-heading">
              <div className="fw-bold" style={{ fontSize: 13 }}>
                {tab === 'recharge' ? 'Recharge Records' : 'Withdrawal Records'}
              </div>
              <span className="inc-label">{transactions.length} RECORDS</span>
            </div>

            {historyLoading ? (
              <div className="inc-loading">
                <div className="spinner-border spinner-border-sm" style={{ color: BRAND }} />
                <div className="mt-2">Loading transactions...</div>
              </div>
            ) : historyError ? (
              <div className="inc-error">
                <i className="bi bi-exclamation-circle me-2" />{historyError}
                <br />
                <button className="inc-retry" onClick={fetchHistory}>
                  <i className="bi bi-arrow-clockwise me-1" />Try Again
                </button>
              </div>
            ) : !transactions.length ? (
              <div className="inc-empty">
                <i className={`bi bi-${tab === 'recharge' ? 'wallet2' : 'cash-coin'}`} />
                No {tab === 'recharge' ? 'recharges' : 'withdrawals'} yet.
              </div>
            ) : transactions.map(item => {
              const [label, color, icon] = statusInfo(item.status);
              const recharge = tab === 'recharge';

              return (
                <div className="inc-record" key={item.id}>
                  <div className="inc-record-top">
                    <div>
                      <div className="inc-record-name">
                        <i className={`bi bi-${recharge ? 'arrow-down-circle-fill' : 'arrow-up-circle-fill'} me-1`}
                          style={{ color: recharge ? '#159B65' : '#D94360' }} />
                        {recharge ? 'Recharge' : 'Withdrawal'}
                      </div>
                      <div className="inc-muted">
                        {methods[String(item.method || '').toLowerCase()] || item.method || 'Not specified'}
                      </div>
                      <span className={`inc-status ${color}`}>
                        <i className={`bi bi-${icon} me-1`} />{label}
                      </span>
                    </div>
                    <strong className="inc-amount" style={{ color: recharge ? '#159B65' : '#D94360' }}>
                      {recharge ? '+' : '-'}{money(item.amount)}
                    </strong>
                  </div>

                  {!recharge && (item.account_name || item.account_number) && (
                    <div className="inc-account">
                      {item.account_name && <div>Account: <strong>{item.account_name}</strong></div>}
                      {item.account_number && <div>Number: <strong>{item.account_number}</strong></div>}
                    </div>
                  )}

                  <div className="inc-foot">
                    <span><i className="bi bi-calendar3 me-1" />{date(item.created_at)}</span>
                    <span><i className="bi bi-hash" />{item.id}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="inc-info">
            <i className="bi bi-info-circle-fill me-2" />
            Pending transactions await administrator review. Approved transactions are processed; rejected transactions are not approved.
          </div>
        </>
      )}

      <div className="text-center mt-4">
        <small className="text-muted">
          <i className="bi bi-shield-check me-1" style={{ color: BRAND }} />
          BrandCare Financial Overview
        </small>
      </div>
    </div>
  );
}

export default Income;
