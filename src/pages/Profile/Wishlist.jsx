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
        <p>Danh sách các món giày thể thao bạn đã thả tim</p>
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
            <WishlistCard 
              key={product.id} 
              product={product} 
              onRemove={() => removeFavorite(product.id)} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Sub-component to manage state for each wishlist item
const WishlistCard = ({ product, onRemove }) => {
  const [variants, setVariants] = React.useState([]);
  const [activeColorIdx, setActiveColorIdx] = React.useState(-1);

  React.useEffect(() => {
    if (product && product.id) {
      api.get(`/product-variants/product/${product.id}`)
        .then(res => setVariants(res.data || []))
        .catch(err => console.error(err));
    }
  }, [product?.id]);

  // Compute unique color variants with their images
  const colorVariants = [];
  if (variants && variants.length > 0) {
    const uniqueColors = [...new Set(variants.map(v => v.color))].filter(c => c && c.trim() !== '');
    uniqueColors.forEach(color => {
      const vImgStr = variants.find(v => v.color === color && v.image && v.image.trim() !== '')?.image;
      if (vImgStr) {
        colorVariants.push({ color, image: vImgStr.split(',')[0] });
      }
    });
  }

  // Get current main image based on active color
  const defaultImage = product.image ? (product.image.startsWith('http') ? product.image : `http://localhost:8080/uploads/${product.image}`) : 'https://placehold.co/400';
  const displayImage = colorVariants.length > 0 && colorVariants[activeColorIdx]
    ? (colorVariants[activeColorIdx].image.startsWith('http') ? colorVariants[activeColorIdx].image : `http://localhost:8080/uploads/${colorVariants[activeColorIdx].image}`)
    : defaultImage;

  return (
    <div className="wishlist-card">
      <Link to={`/product/${product.id}`} className="wishlist-img-wrapper">
        <img 
          src={displayImage} 
          alt={product.name} 
          className="wishlist-img"
        />
      </Link>
      <div className="wishlist-info">
        {/* Real Color Variant Thumbnails */}
        {colorVariants.length > 1 && (
          <div className="product-card-colors" style={{ marginBottom: '10px' }}>
            {colorVariants.map((cv, idx) => {
              const thumbSrc = cv.image.startsWith('http') ? cv.image : `http://localhost:8080/uploads/${cv.image}`;
              return (
                <img 
                  key={idx}
                  src={thumbSrc} 
                  alt={cv.color}
                  title={cv.color}
                  className={activeColorIdx === idx ? 'active' : ''}
                  onMouseEnter={() => setActiveColorIdx(idx)}
                  onError={(e) => { e.target.style.display = 'none' }}
                  style={{ width: '32px', height: '32px', borderRadius: '4px', objectFit: 'cover', border: activeColorIdx === idx ? '1.5px solid #111' : '1px solid #e5e5e5', marginRight: '6px', cursor: 'pointer' }}
                />
              );
            })}
          </div>
        )}
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
            onClick={onRemove}
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
