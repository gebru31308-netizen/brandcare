
import React, { useState } from 'react';

function WelcomeBanner({ currentUser }) {
  const [visible, setVisible] = useState(true);

  if (!currentUser || !visible) return null;

  const username =
    currentUser.full_name ||
    currentUser.name ||
    currentUser.phone ||
    'Valued Member';

  return (
    <div className="welcome-overlay">
      <div className="welcome-modal">
        <button
          className="welcome-close"
          onClick={() => setVisible(false)}
          aria-label="Close welcome promotion"
        >
          <i className="bi bi-x-lg" />
        </button>

        <div className="welcome-decoration">
          <i className="bi bi-stars" />
        </div>

        <span className="welcome-tag">WELCOME TO BRANDCARE</span>

        <h2>Hello, {username}! 🎉</h2>

        <p className="welcome-description">
          We're excited to have you with us.
          Discover amazing products, exclusive promotions
          and exciting rewards.
        </p>

        <div className="welcome-benefits">
          <div>
            <i className="bi bi-bag-heart-fill" />
            <span>Amazing Products</span>
          </div>
          <div>
            <i className="bi bi-gift-fill" />
            <span>Exciting Rewards</span>
          </div>
          <div>
            <i className="bi bi-stars" />
            <span>Special Promotions</span>
          </div>
        </div>

        <button
          className="welcome-continue"
          onClick={() => setVisible(false)}
        >
          Explore BrandCare <i className="bi bi-arrow-right ms-2" />
        </button>

        <small>Thank you for being part of BrandCare!</small>
      </div>

      <style>{`
        .welcome-overlay {
          position:fixed;inset:0;z-index:99999;
          display:flex;align-items:center;justify-content:center;
          padding:20px;background:rgba(22,15,40,.55);
          backdrop-filter:blur(9px);
          -webkit-backdrop-filter:blur(9px);
          animation:welcomeFade .3s ease;
        }
        .welcome-modal {
          position:relative;width:100%;max-width:390px;
          padding:32px 23px 25px;text-align:center;
          border-radius:24px;background:#fff;
          box-shadow:0 20px 70px #0003;
          animation:welcomePop .35s ease;
        }
        .welcome-close {
          position:absolute;right:15px;top:15px;
          width:32px;height:32px;border:0;border-radius:50%;
          background:#F4F0FF;color:#7651D5;
        }
        .welcome-decoration {
          width:68px;height:68px;margin:0 auto 17px;
          display:grid;place-items:center;border-radius:21px;
          background:linear-gradient(135deg,#9B7AF2,#7651D5);
          color:white;font-size:32px;
          box-shadow:0 8px 20px #9B7AF255;
        }
        .welcome-tag {
          color:#9B7AF2;font-size:10px;
          font-weight:900;letter-spacing:1.5px;
        }
        .welcome-modal h2 {
          margin:10px 0;font-size:23px;
          font-weight:900;color:#29213e;
        }
        .welcome-description {
          color:#777184;font-size:13px;
          line-height:1.7;margin:0 auto 22px;
          max-width:290px;
        }
        .welcome-benefits {
          display:grid;grid-template-columns:repeat(3,1fr);
          gap:7px;margin-bottom:23px;
        }
        .welcome-benefits div {
          padding:13px 4px;border-radius:13px;
          background:#F7F4FF;color:#7651D5;
          display:flex;flex-direction:column;
          align-items:center;gap:8px;
        }
        .welcome-benefits i {font-size:19px}
        .welcome-benefits span {
          font-size:9px;font-weight:800;color:#51466b;
        }
        .welcome-continue {
          width:100%;padding:13px;border:0;
          border-radius:12px;color:white;font-size:13px;
          font-weight:800;
          background:linear-gradient(135deg,#9B7AF2,#7651D5);
          box-shadow:0 5px 15px #9B7AF244;
        }
        .welcome-modal > small {
          display:block;margin-top:15px;
          color:#aaa;font-size:10px;
        }
        @keyframes welcomeFade {
          from{opacity:0}to{opacity:1}
        }
        @keyframes welcomePop {
          from{opacity:0;transform:scale(.92) translateY(15px)}
          to{opacity:1;transform:scale(1) translateY(0)}
        }
        @media(max-width:380px) {
          .welcome-modal{padding:27px 17px 22px}
          .welcome-modal h2{font-size:20px}
        }
      `}</style>
    </div>
  );
}

export default WelcomeBanner;
