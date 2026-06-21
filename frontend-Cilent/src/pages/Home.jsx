import React, { useEffect, useState } from 'react';
import { ShoppingCart, Search } from 'lucide-react';
import api from '../services/api';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch products
    api.get('/products')
      .then(response => {
        setProducts(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching products:", error);
        setLoading(false);
      });
  }, []);

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Đồ Ăn Vặt Ngon Nhất Vịnh Bắc Bộ</h1>
          <p>Khám phá thế giới ăn vặt siêu đỉnh, giao hàng siêu tốc, ăn là ghiền!</p>
          <div className="search-bar">
            <input type="text" placeholder="Tìm món ăn..." />
            <button><Search size={20} /></button>
          </div>
        </div>
      </section>

      {/* Product List */}
      <section className="products-section">
        <h2 className="section-title">Món Mới Lên Kệ <span>🔥</span></h2>
        
        {loading ? (
          <div className="loader"></div>
        ) : (
          <div className="product-grid">
            {products.length > 0 ? (
              products.map(product => (
                <div key={product.id} className="product-card">
                  <div className="product-image">
                    <img src={product.image || 'https://via.placeholder.com/300x200?text=Snack'} alt={product.name} />
                    <div className="product-badge">Hot</div>
                  </div>
                  <div className="product-info">
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-desc">{product.description}</p>
                    <div className="product-bottom">
                      <span className="product-price">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}</span>
                      <button className="add-to-cart-btn"><ShoppingCart size={18} /> Mua Ngay</button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="empty-msg">Chưa có sản phẩm nào. Hãy rủ admin thêm món nhé!</p>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
