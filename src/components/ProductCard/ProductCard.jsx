import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Star, Heart, Eye } from 'lucide-react';
import { CartContext } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import api from '../../services/api';
import './ProductCard.css';
import QuickViewModal from './QuickViewModal';

const ProductCard = ({ product, layout = 'grid', isFavorite, onToggleFavorite, onQuickView }) => {
  const { addToCart, cart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [variants, setVariants] = useState([]);
  const [activeColorIdx, setActiveColorIdx] = useState(-1);
  const [showInternalQuickView, setShowInternalQuickView] = useState(false);

  useEffect(() => {
    if (product && product.id) {
      api.get(`/product-variants/product/${product.id}`)
        .then(res => setVariants(res.data || []))
        .catch(err => console.error(err));
    }
  }, [product?.id]);

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (!user) {
      toast.info('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!');
      navigate('/login');
      return;
    }

    // Nếu sản phẩm có biến thể, hiển thị modal chọn biến thể (bảng chọn màu/size)
    if (variants.length > 0) {
      if (onQuickView) {
        onQuickView(product);
      } else {
        setShowInternalQuickView(true);
      }
      return;
    }

    const cartItemId = `${product.id}-default-default`;
    const existingItem = cart.find(item => item.cartItemId === cartItemId);
    const existingQty = existingItem ? existingItem.quantity : 0;
    const maxQty = product.productStore?.qty || 0;
    
    if (existingQty + 1 > maxQty) {
      toast.warning(`Tồn kho chỉ còn ${maxQty} sản phẩm!`);
      return;
    }
    
    addToCart(product);
    toast.success('Đã thêm vào giỏ hàng!');
  };

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
  const defaultImage = product.image ? (product.image.startsWith('http') ? product.image : `http://localhost:8080/uploads/${product.image}`) : 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=500&q=80';
  const displayImage = colorVariants.length > 0 && colorVariants[activeColorIdx]
    ? (colorVariants[activeColorIdx].image.startsWith('http') ? colorVariants[activeColorIdx].image : `http://localhost:8080/uploads/${colorVariants[activeColorIdx].image}`)
    : defaultImage;

  return (
    <div className={`product-card ${layout}`}>
      <div className="product-image-container">
        {hasSale && <span className="discount-badge">-{discountPercent}%</span>}
        {!hasSale && isNew() && <span className="new-badge">NEW</span>}
        <Link to={`/product/${product.id}`}>
          <img 
            src={displayImage} 
            alt={product.name} 
            className="product-image"
            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=500&q=80' }}
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
            onClick={(e) => { 
              e.preventDefault(); 
              if (onQuickView) onQuickView(product); 
              else setShowInternalQuickView(true);
            }}
            title="Xem nhanh"
          >
            <Eye size={18} />
          </button>
        </div>

        {layout === 'grid' && (
          <button 
            className="add-to-cart-btn" 
            onClick={handleAddToCart}
            title="Thêm vào giỏ hàng"
          >
            <ShoppingCart size={20} />
          </button>
        )}
      </div>
      <div className="product-info">
        {/* Real Color Variant Thumbnails */}
        {colorVariants.length > 1 && (
          <div className="product-card-colors">
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
                />
              );
            })}
          </div>
        )}

        <Link to={`/product/${product.id}`} className="product-name">
          <h3>{product.name}</h3>
        </Link>
        <div className="product-category">{product.category?.name || "Men's Hard Court Tennis Shoes"}</div>
        
        {layout === 'list' && (
          <p className="product-description-snippet">
            {product.description || 'Mẫu giày thể thao êm ái, bền bỉ phong cách truyền thống. Sản phẩm được đóng gói kỹ lưỡng đảm bảo chất lượng và độ bền.'}
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
            onClick={handleAddToCart}
          >
            <ShoppingCart size={18} /> Thêm vào giỏ
          </button>
        )}
      </div>
      {showInternalQuickView && (
        <QuickViewModal 
          product={product} 
          onClose={() => setShowInternalQuickView(false)} 
        />
      )}
    </div>
  );
};

export default ProductCard;
