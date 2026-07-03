import React, { useContext, useState } from 'react';
import { ShoppingCart, X, Minus, Plus } from 'lucide-react';
import { CartContext } from '../../context/CartContext';
import { Link } from 'react-router-dom';
import './QuickViewModal.css';

const QuickViewModal = ({ product, onClose }) => {
  const { addToCart } = useContext(CartContext);
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const hasSale = product.productSale && product.productSale.pricesale;
  const originalPrice = parseFloat(product.price);
  const salePrice = hasSale ? parseFloat(product.productSale.pricesale) : null;
  const currentPrice = hasSale ? salePrice : originalPrice;

  const mainImageUrl = product.image 
    ? (product.image.startsWith('http') ? product.image : `http://localhost:8080/uploads/${product.image}`)
    : 'https://placehold.co/400x400/f4f7f6/636e72?text=Snack';

  const handleAddToCart = () => {
    addToCart(product, quantity);
    onClose(); // Optional: close modal after adding to cart
  };

  return (
    <div className="quickview-overlay" onClick={onClose}>
      <div className="quickview-modal" onClick={e => e.stopPropagation()}>
        <button className="quickview-close" onClick={onClose}>
          <X size={24} />
        </button>
        
        <div className="quickview-content">
          <div className="quickview-image">
            <img src={mainImageUrl} alt={product.name} />
          </div>
          
          <div className="quickview-info">
            <h2 className="quickview-title">{product.name}</h2>
            <div className="quickview-category">{product.category?.name || 'Giày thể thao'}</div>
            
            <div className="quickview-price-sec">
              {hasSale ? (
                <>
                  <span className="current-price">{currentPrice.toLocaleString('vi-VN')}đ</span>
                  <span className="original-price">{originalPrice.toLocaleString('vi-VN')}đ</span>
                </>
              ) : (
                <span className="current-price">{currentPrice.toLocaleString('vi-VN')}đ</span>
              )}
            </div>
            
            <p className="quickview-desc">
              {product.description || 'Sản phẩm êm ái, chất lượng tuyệt hảo.'}
            </p>
            
            <div className="quickview-stock">
              Tình trạng: <strong>{product.productStore && product.productStore.qty > 0 ? `Còn hàng (${product.productStore.qty})` : 'Hết hàng'}</strong>
            </div>

            <div className="quickview-actions">
              <div className="quantity-selector">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))}><Minus size={16}/></button>
                <input type="number" value={quantity} readOnly />
                <button onClick={() => setQuantity(q => q + 1)}><Plus size={16}/></button>
              </div>
              
              <button 
                className="btn-add-cart" 
                onClick={handleAddToCart}
                disabled={!(product.productStore && product.productStore.qty > 0)}
              >
                <ShoppingCart size={18} /> Thêm vào giỏ
              </button>
            </div>
            
            <div className="quickview-footer">
              <Link to={`/product/${product.id}`} onClick={onClose} className="view-detail-link">
                Xem chi tiết sản phẩm ➔
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;
