import React, { useState, useEffect } from 'react';
import { Heart, Trash2, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';
import './Wishlist.css';

const Wishlist = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const res = await api.get('/favorites');
      setFavorites(res.data);
    } catch (error) {
      console.error(error);
      toast.error('Lỗi khi tải danh sách yêu thích');
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (productId) => {
    try {
      await api.delete(`/favorites/${productId}`);
      toast.success('Đã xóa khỏi danh sách');
      fetchFavorites(); // Refresh list
    } catch (error) {
      console.error(error);
      toast.error('Lỗi khi xóa sản phẩm');
    }
  };

  if (loading) return <div className="loader"></div>;

  return (
    <div className="wishlist-container">
      <div className="wishlist-header">
        <h2><Heart size={24} className="text-red" /> Sản Phẩm Yêu Thích</h2>
        <p>Danh sách các món ăn vặt bạn đã thả tim</p>
      </div>

      {favorites.length === 0 ? (
        <div className="empty-wishlist">
          <Heart size={48} className="empty-icon" />
          <p>Bạn chưa có sản phẩm yêu thích nào.</p>
          <Link to="/product" className="btn-primary mt-3">Khám phá ngay</Link>
        </div>
      ) : (
        <div className="wishlist-grid">
          {favorites.map(product => (
            <div key={product.id} className="wishlist-card">
              <Link to={`/product/${product.id}`} className="wishlist-img-wrapper">
                <img 
                  src={product.image ? (product.image.startsWith('http') ? product.image : `http://localhost:8080/uploads/${product.image}`) : 'https://placehold.co/400'} 
                  alt={product.name} 
                  className="wishlist-img"
                />
              </Link>
              <div className="wishlist-info">
                <Link to={`/product/${product.id}`} className="wishlist-title">
                  {product.name}
                </Link>
                <div className="wishlist-price">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                </div>
                <div className="wishlist-actions">
                  <button 
                    className="btn-icon text-red" 
                    title="Xóa khỏi danh sách"
                    onClick={() => removeFavorite(product.id)}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
