
import React from 'react';

function Services({ onNavigate }) {
  const services = [
    {
      title: 'Recharge',
      icon: 'bi-wallet2',
      page: 'recharge',
    },
    {
      title: 'Withdraw',
      icon: 'bi-cash-stack',
      page: 'withdraw',
    },
    {
      title: 'Channel',
      icon: 'bi-telegram',
      page: 'channel',
      external: 'https://t.me/santim_bet',
    },
    {
      title: 'Help',
      icon: 'bi-headset',
      page: 'help',
      external: 'https://wa.me/8801941233002',
    },
  ];

  const handleServiceClick = (service) => {
    if (service.external) {
      window.open(service.external, '_blank', 'noopener,noreferrer');
      return;
    }

    onNavigate?.(service.page);
  };

  return (
    <div className="mb-4">
      <h5 className="fw-bold mb-3">Our Services</h5>

      {/* ONE SHARED BACKGROUND */}
      <div
        className="bg-white shadow-sm rounded-4 p-2"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
          gap: '8px',
        }}
      >
        {services.map((service) => (
          <button
            type="button"
            key={service.title}
            onClick={() => handleServiceClick(service)}
            className="btn border-0 rounded-3 w-100 py-3 px-1"
            style={{
              background: 'transparent',
              minWidth: 0,
            }}
          >
            <div
              className="mx-auto mb-2 d-flex align-items-center justify-content-center"
              style={{
                width: 44,
                height: 44,
                color: '#6545d5',
              }}
            >
              <i className={`bi ${service.icon} fs-4`}></i>
            </div>

            <small className="fw-semibold text-dark">
              {service.title}
            </small>
          </button>
        ))}
      </div>
    </div>
  );
}

export default Services;
