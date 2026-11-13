
import React from 'react';

function BottomNavigation({ activePage, onNavigate, isAdmin = false }) {
  const items = [
    { title: 'Home', icon: 'bi-house-door', page: 'home' },
    { title: 'Income', icon: 'bi-graph-up-arrow', page: 'income' },
    { title: 'Reward', icon: 'bi-people', page: 'reward' },
    { title: 'Share', icon: 'bi-share', page: 'share' },
    ...(isAdmin
      ? [{ title: 'Admin', icon: 'bi-shield-lock', page: 'admin' }]
      : []),
    { title: 'Me', icon: 'bi-person', page: 'profile' },
  ];

  return (
    <nav
      className="position-fixed bottom-0 start-0 w-100 bg-white shadow-lg"
      style={{
        zIndex: 1500,
        borderTop: '1px solid #eee',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="container">
        <div className="d-flex justify-content-around align-items-center py-2">
          {items.map(item => {
            const active = activePage === item.page;

            return (
              <button
                type="button"
                key={item.page}
                onClick={() => onNavigate?.(item.page)}
                className="btn border-0 d-flex flex-column align-items-center px-2 py-1"
                style={{
                  color: active ? '#9B7AF2' : '#92909b',
                  minWidth: 48,
                  background: 'transparent',
                }}
              >
                <i
                  className={`bi ${item.icon}`}
                  style={{ fontSize: 21, lineHeight: 1 }}
                />

                <small
                  className="mt-1"
                  style={{ fontSize: 10, fontWeight: 900 }}
                >
                  {item.title}
                </small>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

export default BottomNavigation;
