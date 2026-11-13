
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../../supabase';

import PromotionSlider from './PromotionSlider';
import WelcomeBanner from './WelcomeBanner';
import Services from './Services';
import Products from './Products';
import PurchaseModal from './PurchaseModal';
import BottomNavigation from './BottomNavigation';

export { BottomNavigation };

const BRAND = '#9B7AF2';

function Home({
  currentUser,
  isAdmin = false,
  onNavigate,
  activePage = 'home',
  hideBottomNavigation = false
}) {
  const [products, setProducts] = useState([]);
  const [likedProducts, setLikedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [userBalance, setUserBalance] = useState(0);
  const [buying, setBuying] = useState(false);
  const viewedProducts = useRef(new Set());

  // Fetch products
  const fetchProducts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setProducts((data || []).map(p => ({
        ...p,
        clicks: Number(p.clicks) || 0,
        likes: Number(p.likes) || 0,
        rating: Number(p.rating) || 0,
        purchases: Number(p.purchases) || 0,
        price: Number(p.price) || 0,
        daily_profit: Number(p.daily_profit) || 0,
        days: Number(p.days) || 30
      })));
    } catch (error) {
      console.error('Product loading failed:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch liked products
  const fetchLikedProducts = useCallback(async () => {
    if (!currentUser?.id) return setLikedProducts([]);

    try {
      const { data, error } = await supabase
        .from('product_likes')
        .select('product_id')
        .eq('user_id', currentUser.id);

      if (error) throw error;
      setLikedProducts((data || []).map(item => item.product_id));
    } catch (error) {
      console.error('Liked products error:', error);
    }
  }, [currentUser?.id]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { fetchLikedProducts(); }, [fetchLikedProducts]);

  // Count product views once per page visit
  const countProductView = async id => {
    if (!id || viewedProducts.current.has(id)) return;
    viewedProducts.current.add(id);

    const { data, error } = await supabase.rpc('increment_product_views', {
      p_product_id: id
    });

    if (error) {
      console.error('View count failed:', error);
      viewedProducts.current.delete(id);
      return;
    }

    setProducts(previous => previous.map(p => p.id === id
      ? { ...p, clicks: typeof data === 'number' ? data : p.clicks + 1 }
      : p
    ));
  };

  // Automatically count visible products
  useEffect(() => {
    if (!products.length || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const id = Number(entry.target.dataset.productId);
        if (id) countProductView(id);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.5 });

    document.querySelectorAll('.home-page [data-product-id]')
      .forEach(element => observer.observe(element));

    return () => observer.disconnect();
  }, [products]);

  // Like / unlike
  const handleLike = async product => {
    if (!currentUser?.id) return alert('Please log in to like products.');

    const id = product.id;
    const liked = likedProducts.includes(id);

    try {
      const query = supabase.from('product_likes');

      const { error } = liked
        ? await query.delete().eq('user_id', currentUser.id).eq('product_id', id)
        : await query.insert([{ user_id: currentUser.id, product_id: id }]);

      if (error) throw error;

      const { error: countError } = await supabase.rpc('adjust_product_likes', {
        p_product_id: id,
        p_delta: liked ? -1 : 1
      });

      if (countError) throw countError;

      setLikedProducts(previous => liked
        ? previous.filter(item => item !== id)
        : [...previous, id]
      );

      await fetchProducts();
    } catch (error) {
      console.error('Like failed:', error);
      alert('Could not update your like. Please try again.');
    }
  };

  // Open purchase modal
  const handleProductClick = async product => {
    if (!currentUser?.id) return alert('Please log in to continue.');

    try {
      const { data, error } = await supabase
        .from('users')
        .select('balance')
        .eq('id', currentUser.id)
        .maybeSingle();

      if (error) throw error;

      setUserBalance(Number(data?.balance) || 0);
      setSelectedProduct(product);
    } catch (error) {
      console.error('Balance loading failed:', error);
      alert('Could not load your account balance.');
    }
  };

  // Purchase product
  const handleConfirmPurchase = async () => {
    if (!selectedProduct || buying) return;

    if (userBalance < Number(selectedProduct.price || 0)) {
      setSelectedProduct(null);
      onNavigate?.('recharge');
      return;
    }

    setBuying(true);

    try {
      const { data, error } = await supabase.rpc('purchase_product', {
        p_user_id: currentUser.id,
        p_product_id: selectedProduct.id
      });

      if (error) throw error;

      if (!data?.success) {
        if (data?.insufficient_balance) {
          setSelectedProduct(null);
          onNavigate?.('recharge');
          return;
        }
        return alert(data?.message || 'Purchase failed. Please try again.');
      }

      const { error: countError } = await supabase.rpc('increment_product_purchases', {
        p_product_id: selectedProduct.id
      });

      if (countError) console.error('Purchase counter error:', countError);

      setUserBalance(Number(data.balance) || 0);
      setSelectedProduct(null);
      alert('Purchase successful!');
      await fetchProducts();
    } catch (error) {
      console.error('Purchase error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setBuying(false);
    }
  };

  return (
    <div
      className="home-page bg-light"
      style={{
        minHeight: '100vh',
        paddingBottom: hideBottomNavigation ? 20 : 90
      }}
    >
      <div className="container py-2">

        {/* Compact Header */}
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div className="d-flex align-items-center gap-2">
            <div
              className="rounded-3 d-flex align-items-center justify-content-center"
              style={{
                width: 39,
                height: 39,
                background: '#F4F0FF',
                color: BRAND
              }}
            >
              <i className="bi bi-bag-heart-fill fs-5" />
            </div>

            <div>
              <h5 className="fw-bold mb-0" style={{ color: BRAND }}>
                BrandCare
              </h5>
              <small className="text-muted" style={{ fontSize: 10 }}>
                Your trusted shopping experience
              </small>
            </div>
          </div>

          <button
            type="button"
            onClick={fetchProducts}
            className="btn bg-white rounded-circle shadow-sm d-flex align-items-center justify-content-center"
            aria-label="Refresh products"
            style={{ width: 38, height: 38, color: BRAND }}
          >
            <i className="bi bi-arrow-clockwise fs-5" />
          </button>
        </div>

        <WelcomeBanner currentUser={currentUser} />

        <PromotionSlider />
        <Services onNavigate={onNavigate} />

        <Products
          products={products}
          likedProducts={likedProducts}
          loading={loading}
          onLike={handleLike}
          onBuy={handleProductClick}
        />
      </div>

      <PurchaseModal
        product={selectedProduct}
        balance={userBalance}
        buying={buying}
        onConfirm={handleConfirmPurchase}
        onClose={() => setSelectedProduct(null)}
      />

      {!hideBottomNavigation && (
        <BottomNavigation
          activePage={activePage}
          onNavigate={onNavigate}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
}

export default Home;
