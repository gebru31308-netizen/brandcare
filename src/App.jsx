
import React, { useEffect, useState } from 'react';
import { supabase } from './supabase';

// LOGIN & REGISTER
import Login from './components/regLog/Login';
import Register from './components/regLog/Register';

import Admin from './components/admin/Admin';

// HOME
import Home, { BottomNavigation } from './components/home/Home';

// ME
import Profile from './components/me/Profile';
import Messages from './components/me/Messages';
import PersonalInformation from './components/me/PersonalInformation';
import AboutUs from './components/me/AboutUs';

// INCOME
import Income from './components/income/Income';

// TRANSACTION
import Recharge from './components/home/transaction/Recharge';
import Withdraw from './components/home/transaction/Withdraw';

// REWARD
import Reward from './components/reward/Reward';

// SHARE
import Share from './components/share/Share';

function App() {
  const [page, setPage] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const invitationCode = params.get('ref');

    return invitationCode?.trim() ? 'register' : 'login';
  });

  const [currentUser, setCurrentUser] = useState(null);
  const [loginCredentials, setLoginCredentials] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const [balance, setBalance] = useState(0);
  const [balanceLoading, setBalanceLoading] = useState(false);

  // NAVIGATION WITH ADMIN ACCESS CONTROL
  const handleNavigate = (nextPage) => {
    if (nextPage === 'admin' && !isAdmin) {
      setPage('home');
      return;
    }

    setPage(nextPage);
  };

  // VERIFY ADMIN ACCOUNT
  const verifyAdmin = async (phone, password) => {
    try {
      const { data, error } = await supabase.rpc('admin_get_withdrawals', {
        p_phone: phone,
        p_password: password
      });

      if (error) {
        console.error('Admin verification failed:', error.message);
        return false;
      }

      return data?.success === true;
    } catch (error) {
      console.error('Admin verification error:', error);
      return false;
    }
  };

  // FETCH CUSTOMER BALANCE
  useEffect(() => {
    let active = true;

    const fetchBalance = async () => {
      if (!currentUser?.id) {
        setBalance(0);
        setBalanceLoading(false);
        return;
      }

      setBalanceLoading(true);

      const { data, error } = await supabase
        .from('users')
        .select('balance')
        .eq('id', currentUser.id)
        .single();

      if (!active) return;

      if (error) {
        console.error('Error fetching customer balance:', error.message);
      } else {
        setBalance(Number(data?.balance) || 0);
      }

      setBalanceLoading(false);
    };

    fetchBalance();

    return () => {
      active = false;
    };
  }, [currentUser?.id, page]);

  // LOGIN
  const handleLogin = async (user, credentials) => {
    const phone = credentials?.phone?.trim();
    const password = credentials?.password;

    setCurrentUser(user);
    setIsAdmin(false);

    setLoginCredentials({ phone, password });
    setPage('home');

    if (phone && password) {
      const adminVerified = await verifyAdmin(phone, password);
      setIsAdmin(adminVerified);
    }
  };

  // LOGOUT
  const logout = () => {
    setCurrentUser(null);
    setLoginCredentials(null);
    setIsAdmin(false);
    setPage('login');
    setBalance(0);
    setBalanceLoading(false);
  };

  // SUBMIT WITHDRAWAL
  const handleWithdrawal = async (request) => {
    if (
      !currentUser?.id ||
      !loginCredentials?.phone ||
      !loginCredentials?.password
    ) {
      throw new Error('Please log in again.');
    }

    if (balanceLoading) {
      throw new Error('Your balance is still loading. Please try again.');
    }

    const withdrawalAmount = Number(request.amount);

    if (!Number.isFinite(withdrawalAmount) || withdrawalAmount <= 0) {
      throw new Error('Please enter a valid withdrawal amount.');
    }

    if (withdrawalAmount < 250) {
      throw new Error('Minimum withdrawal amount is 250 ETB.');
    }

    if (withdrawalAmount > balance) {
      throw new Error('Insufficient balance.');
    }

    if (!request.accountName?.trim()) {
      throw new Error('Please enter the account holder name.');
    }

    if (!request.accountNumber?.trim()) {
      throw new Error('Please enter the account number.');
    }

    const { data, error } = await supabase.rpc('submit_withdrawal', {
      p_phone: loginCredentials.phone,
      p_password: loginCredentials.password,
      p_method: request.method,
      p_account_name: request.accountName.trim(),
      p_account_number: request.accountNumber.trim(),
      p_amount: withdrawalAmount
    });

    if (error) {
      console.error('Withdrawal submission error:', error);

      throw new Error(
        'Unable to submit withdrawal request: ' + error.message
      );
    }

    if (!data?.success) {
      throw new Error(data?.message || 'Withdrawal request failed.');
    }

    return data;
  };

  // BOTTOM NAVIGATION VISIBILITY
  const showBottomNavigation =
    Boolean(currentUser) &&
    page !== 'login' &&
    page !== 'register';

  // PERSONAL PAGES
  const personalPages = {
    messages: (
      <Messages
        currentUser={currentUser}
        loginCredentials={loginCredentials}
        onBack={() => setPage('profile')}
      />
    ),

    information: (
      <PersonalInformation
        currentUser={currentUser}
        onBack={() => setPage('profile')}
      />
    ),

    income: (
      <Income
        currentUser={currentUser}
        loginCredentials={loginCredentials}
        onBack={() => setPage('profile')}
      />
    ),

    about: (
      <AboutUs onBack={() => setPage('profile')} />
    )
  };

  return (
    <div
      className="bg-light min-vh-100"
      style={{
        paddingBottom: showBottomNavigation ? '90px' : '0'
      }}
    >
      {/* LOGIN */}
      {page === 'login' && (
        <Login
          onLogin={handleLogin}
          onRegister={() => setPage('register')}
        />
      )}

      {/* REGISTER */}
      {page === 'register' && (
        <Register onRegister={() => setPage('login')} />
      )}

      {/* HOME */}
      {page === 'home' && (
        <Home
          currentUser={currentUser}
          isAdmin={isAdmin}
          activePage="home"
          onNavigate={handleNavigate}
          hideBottomNavigation
        />
      )}

      {/* PROFILE */}
      {page === 'profile' && (
        <Profile
          currentUser={currentUser}
          onHome={() => setPage('home')}
          onLogout={logout}
          onNavigate={handleNavigate}
        />
      )}

      {/* PERSONAL PAGES */}
      {personalPages[page] || null}

      {/* ADMIN DASHBOARD */}
      {page === 'admin' && isAdmin && currentUser?.id && (
        <Admin
          currentUser={currentUser}
          adminCredentials={loginCredentials}
          onBack={() => setPage('home')}
        />
      )}

      {/* RECHARGE */}
      {page === 'recharge' && (
        <Recharge
          currentUser={currentUser}
          loginCredentials={loginCredentials}
          onBack={() => setPage('home')}
        />
      )}

      {/* WITHDRAW */}
      {page === 'withdraw' && (
        <Withdraw
          balance={balance}
          balanceLoading={balanceLoading}
          onBack={() => setPage('home')}
          onWithdraw={handleWithdrawal}
        />
      )}

      {/* REWARD */}
      {page === 'reward' && (
        <div className="container py-3">
          <Reward />
        </div>
      )}

      {/* SERVICE */}
      {page === 'service' && (
        <div className="container py-4">
          <h4 className="fw-bold">Our Services</h4>
          <p>Visit our Telegram group for more services.</p>

          <a
            href="https://t.me/santim_bet"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
          >
            Join Telegram Group
          </a>
        </div>
      )}

      {/* CHANNEL */}
      {page === 'channel' && (
        <div className="container py-4">
          <h4 className="fw-bold">Our Channel</h4>
          <p>Our channel will be available soon.</p>
        </div>
      )}

      {/* SHARE */}
      {page === 'share' && (
        <Share
          currentUser={currentUser}
          onBack={() => setPage('home')}
        />
      )}

      {/* BOTTOM NAVIGATION */}
      {showBottomNavigation && (
        <BottomNavigation
          activePage={page}
          onNavigate={handleNavigate}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
}

export default App;
