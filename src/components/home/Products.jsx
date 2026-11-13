
import React from 'react';

const BRAND = '#9B7AF2';

function Products({ products = [], likedProducts = [], loading, onLike, onBuy }) {
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h5 className="fw-bold mb-0">Our Products</h5>
          <small className="text-muted">Explore our collection</small>
        </div>
        <span className="badge rounded-pill px-3 py-2" style={{ background: '#F4F0FF', color: BRAND }}>
          {products.length} Products
        </span>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border spinner-border-sm" style={{ color: BRAND }} />
          <p className="text-muted small mt-2 mb-0">Loading products...</p>
        </div>
      ) : !products.length ? (
        <div className="bg-white rounded-4 p-4 text-center shadow-sm">
          <i className="bi bi-bag-x fs-1" style={{ color: BRAND }} />
          <h6 className="fw-bold mt-2 mb-1">No products available</h6>
          <p className="text-muted small mb-0">
            Products added by the administrator will appear here.
          </p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {products.map(product => {
            const isLiked = likedProducts.includes(product.id);

            return (
              <div
                key={product.id}
                data-product-id={product.id}
                className="bg-white rounded-4 shadow-sm overflow-hidden p-2"
              >
                <div className="row g-2">
                  {/* Product Image */}
                  <div className="col-5">
                    <div
                      className="rounded-3 overflow-hidden h-100"
                      style={{ minHeight: 145, background: '#F4F0FF' }}
                    >
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-100 h-100"
                          style={{ minHeight: 145, objectFit: 'cover' }}
                        />
                      ) : (
                        <div className="h-100 d-flex align-items-center justify-content-center">
                          <i className="bi bi-image fs-2" style={{ color: BRAND }} />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Product Information */}
                  <div className="col-7 d-flex flex-column py-1">
                    <h6 className="fw-bold mb-1">{product.name}</h6>

                    <p
                      className="text-muted mb-2"
                      style={{
                        fontSize: 11,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {product.description || 'No description available.'}
                    </p>

                    <div className="fw-bold mb-2" style={{ color: BRAND, fontSize: 17 }}>
                      ETB {Number(product.price).toLocaleString()}
                    </div>

                    {/* Vertical Statistics */}
                    <div className="mt-auto d-flex flex-column gap-2 small">
                      <span className="text-muted">
                        <i className="bi bi-eye me-2" style={{ color: BRAND }} />
                        {product.clicks || 0} Views
                      </span>

                      <button
                        type="button"
                        onClick={() => onLike(product)}
                        className="btn btn-link p-0 text-start text-decoration-none small"
                        style={{ color: isLiked ? '#e63962' : BRAND }}
                      >
                        <i className={`bi ${isLiked ? 'bi-heart-fill' : 'bi-heart'} me-2`} />
                        {product.likes || 0} Likes
                      </button>

                      <span style={{ color: '#D69B25' }}>
                        <i className="bi bi-star-fill me-2" />
                        {Number(product.rating || 0).toFixed(1)} Rates
                      </span>

                      <span className="text-muted">
                        <i className="bi bi-bag-check me-2" style={{ color: BRAND }} />
                        {product.purchases || 0} Purchases
                      </span>
                    </div>
                  </div>
                </div>

                {/* Buy Button */}
                <button
                  type="button"
                  onClick={() => onBuy(product)}
                  className="btn text-white fw-semibold w-100 rounded-3 mt-2"
                  style={{
                    background: 'linear-gradient(135deg, #9B7AF2, #7651D5)',
                    padding: '9px'
                  }}
                >
                  <i className="bi bi-cart3 me-2" />
                  Buy Now
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Products;
