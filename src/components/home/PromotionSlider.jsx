
import React, { useEffect, useState } from 'react';

const BRAND = '#9B7AF2';

const promotions = [
  {
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200',
    title: 'Discover Amazing Products',
    subtitle: 'Find the products you love at great prices.'
  },
  {
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200',
    title: 'Shop With Confidence',
    subtitle: 'Enjoy a simple and convenient shopping experience.'
  },
  {
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200',
    title: 'Start Your Shopping Journey',
    subtitle: 'Explore our latest products today.'
  }
];

function PromotionSlider() {
  const [slide, setSlide] = useState(0);
  const [count, setCount] = useState(0);
  const CUSTOMER_COUNT = 150575;

  useEffect(() => {
    const timer = setInterval(() => {
      setSlide(s => (s + 1) % promotions.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const start = performance.now();
    let frame;

    const animate = now => {
      const progress = Math.min((now - start) / 2500, 1);
      setCount(Math.floor((1 - Math.pow(1 - progress, 3)) * CUSTOMER_COUNT));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  const active = promotions[slide];

  return (
    <div className="position-relative overflow-hidden rounded-4 shadow-sm mb-3"
      style={{ height: 175, background: '#7651D5' }}>

      <img
        key={active.image}
        src={active.image}
        alt={active.title}
        className="w-100 h-100"
        style={{ objectFit: 'cover' }}
      />

      <div className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column justify-content-center p-3"
        style={{ background: 'linear-gradient(90deg,rgba(35,20,75,.88),rgba(35,20,75,.15))' }}>

        <div style={{ maxWidth: 280 }}>
          <span className="badge rounded-pill mb-2 px-2 py-1"
            style={{ background: BRAND, color: '#fff', fontSize: 9 }}>
            WELCOME TO BRANDCARE
          </span>

          <h5 className="text-white fw-bold mb-1">{active.title}</h5>
          <p className="text-white-50 small mb-2">{active.subtitle}</p>

          <div className="d-inline-flex align-items-center gap-2 rounded-3 px-2 py-2 text-white"
            style={{ background: 'rgba(255,255,255,.17)', backdropFilter: 'blur(8px)' }}>
            <i className="bi bi-people-fill fs-5" style={{ color: '#D9C9FF' }} />
            <div>
              <div className="fw-bold lh-1">{count.toLocaleString('en-US')}+</div>
              <small style={{ fontSize: 10 }}>Happy Customers</small>
            </div>
          </div>
        </div>
      </div>

      <div className="position-absolute bottom-0 start-0 w-100 d-flex justify-content-center gap-2 pb-2">
        {promotions.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setSlide(i)}
            aria-label={`Show promotion ${i + 1}`}
            style={{
              width: slide === i ? 20 : 7,
              height: 7,
              padding: 0,
              border: 0,
              borderRadius: 10,
              background: slide === i ? BRAND : 'rgba(255,255,255,.65)',
              transition: 'all .25s'
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default PromotionSlider;
