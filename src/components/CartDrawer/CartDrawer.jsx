import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { CartContext } from '../../context/CartContext';
import './CartDrawer.css';

const CartDrawer = ({ isOpen, onClose }) => {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useContext(CartContext);
  const navigate = useNavigate();

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  const handleViewCart = () => {
    onClose();
    navigate('/cart');
  };

  return (
    <>
      <div className={`cart-drawer-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}></div>
      <div className={`cart-drawer ${isOpen ? 'active' : ''}`}>
        <div className="cart-drawer-header">
          <h3><ShoppingBag size={20} /> Giỏ hàng của bạn</h3>
          <button className="close-btn" onClick={onClose}><X size={24} /></button>
        </div>

        <div className="cart-drawer-content">
          {cart.length === 0 ? (
            <div className="empty-cart-drawer">
              <ShoppingBag size={48} className="empty-icon" />
              <p>Giỏ hàng đang trống.</p>
              <button className="btn-primary mt-3" onClick={() => { onClose(); navigate('/product'); }}>
                Tiếp tục mua sắm
              </button>
            </div>
          ) : (
            <ul className="cart-drawer-list">
              {cart.map(item => {
                const itemPrice = item.productSale && item.productSale.pricesale 
                  ? item.productSale.pricesale 
                  : item.price;
                const itemImage = item.image 
                  ? (item.image.startsWith('http') ? item.image : `http://localhost:8080/uploads/${item.image}`) 
                  : 'https://placehold.co/100x100/f4f7f6/636e72';

                return (
                  <li key={item.cartItemId} className="cart-drawer-item">
                    <div className="item-image">
                      <img src={itemImage} alt={item.name} />
                    </div>
                    <div className="item-details">
                      <h4 className="item-name">{item.name}</h4>
                      {(item.selectedColor || item.selectedSize) && (
                        <div className="item-variant" style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '4px' }}>
                          {item.selectedColor && `Màu: ${item.selectedColor}`} 
                          {item.selectedColor && item.selectedSize && ' | '}
                          {item.selectedSize && `Size: ${item.selectedSize}`}
                        </div>
                      )}
                      <div className="item-price">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(itemPrice)}</div>
                      <div className="item-actions">
                        <div className="quantity-control-mini">
                          <button onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}><Minus size={14}/></button>
                          <span>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}><Plus size={14}/></button>
                        </div>
                        <button className="remove-btn" onClick={() => removeFromCart(item.cartItemId)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="drawer-total">
              <span>Tổng cộng:</span>
              <strong>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cartTotal)}</strong>
            </div>
            <div className="drawer-actions">
              <button className="btn-outline" onClick={handleViewCart}>Xem giỏ hàng</button>
              <button className="btn-primary" onClick={handleCheckout}>Thanh toán ngay</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
