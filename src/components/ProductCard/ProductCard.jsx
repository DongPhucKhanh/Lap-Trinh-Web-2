import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Star, Heart, Eye } from 'lucide-react';
import { CartContext } from '../../context/CartContext';
import './ProductCard.css';

const ProductCard = ({ product, layout = 'grid', isFavorite, onToggleFavorite, onQuickView }) => {
  const { addToCart } = useContext(CartContext);

  // Check if product has an active sale
  const hasSale = product.productSale && product.productSale.pricesale;
  
  // Parse prices
  const originalPrice = parseFloat(product.price);
  const salePrice = hasSale ? parseFloat(product.productSale.pricesale) : null;
  const currentPrice = hasSale ? salePrice : originalPrice;

  // Calculate discount percentage
  const discountPercent = hasSale ? Math.round(((originalPrice - salePrice) / originalPrice) * 100) : 0;

  // Simulate NEW label (if created within last 7 days)
  const isNew = () => {
    if (!product.createdAt) return false;
    const createdDate = new Date(product.createdAt);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return createdDate > sevenDaysAgo;
  };

  // Simulate Rating
  const mockRating = (4 + (product.id % 10) / 10).toFixed(1);

  return (
    <div className={`product-card ${layout}`}>
      <div className="product-image-container">
        {hasSale && <span className="discount-badge">-{discountPercent}%</span>}
        {!hasSale && isNew() && <span className="new-badge">NEW</span>}
        <Link to={`/product/${product.id}`}>
          <img 
            src={product.image ? (product.image.startsWith('http') ? product.image : `http://localhost:8080/uploads/${product.image}`) : 'https://images.unsplash.com/photo-1599490659213-e2b9527bd08c?auto=format&fit=crop&w=500&q=80'} 
            alt={product.name} 
            className="product-image"
            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1599490659213-e2b9527bd08c?auto=format&fit=crop&w=500&q=80' }}
          />
        </Link>
        
        {/* Overlay Actions */}
        <div className="product-overlay-actions">
          <button 
            className="action-btn"
            onClick={(e) => { e.preventDefault(); onToggleFavorite && onToggleFavorite(product); }}
            title={isFavorite ? "Bỏ yêu thích" : "Yêu thích"}
          >
            <Heart size={18} fill={isFavorite ? "#ef4444" : "none"} color={isFavorite ? "#ef4444" : "currentColor"} />
          </button>
          
          <button 
            className="action-btn"
            onClick={(e) => { e.preventDefault(); onQuickView && onQuickView(product); }}
            title="Xem nhanh"
          >
            <Eye size={18} />
          </button>
        </div>

        {layout === 'grid' && (
          <button 
            className="add-to-cart-btn" 
            onClick={() => addToCart(product)}
            title="Thêm vào giỏ hàng"
          >
            <ShoppingCart size={20} />
          </button>
        )}
      </div>

      <div className="product-info">
        <div className="product-category">{product.category?.name || 'Ăn vặt'}</div>
        <Link to={`/product/${product.id}`} className="product-name">
          <h3>{product.name}</h3>
        </Link>
        
        <div className="product-rating">
          <Star size={14} className="star-icon filled" />
          <span>{mockRating}</span>
        </div>
        
        {layout === 'list' && (
          <p className="product-description-snippet">
            {product.description || 'Thức ăn vặt thơm ngon, đậm đà hương vị truyền thống. Sản phẩm được đóng gói kỹ lưỡng đảm bảo vệ sinh an toàn thực phẩm.'}
          </p>
        )}

        <div className="product-price-container">
          {hasSale ? (
            <>
              <span className="product-price current">{currentPrice.toLocaleString('vi-VN')}đ</span>
              <span className="product-price original">{originalPrice.toLocaleString('vi-VN')}đ</span>
            </>
          ) : (
            <span className="product-price current">{currentPrice.toLocaleString('vi-VN')}đ</span>
          )}
        </div>

        {layout === 'list' && (
          <button 
            className="add-to-cart-btn-list" 
            onClick={() => addToCart(product)}
          >
            <ShoppingCart size={18} /> Thêm vào giỏ
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
