import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../../context/CartContext';
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag } from 'lucide-react';
import { toast } from 'react-toastify';
import './Cart.css';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, clearCart, cartTotal } = useContext(CartContext);
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="cart-empty-container">
        <ShoppingBag size={80} color="#cbd5e1" />
        <h2>Giỏ hàng của bạn đang trống</h2>
        <p>Có vẻ như bạn chưa chọn món giày thể thao nào. Khám phá ngay các mẫu giày nhé!</p>
        <Link to="/" className="btn-primary" style={{ marginTop: '20px', display: 'inline-block', padding: '10px 20px', background: '#ff6b6b', color: 'white', borderRadius: '8px' }}>
          Quay lại mua sắm
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h1>Giỏ Hàng Của Bạn</h1>
        <button className="btn-outline-danger" onClick={clearCart}>Xóa tất cả</button>
      </div>

      <div className="cart-content">
        <div className="cart-items">
          {cart.map(item => (
            <div key={item.cartItemId} className="cart-item">
              <div className="cart-item-img">
                <img src={item.image ? (item.image.startsWith('http') ? item.image : `http://localhost:8080/uploads/${item.image}`) : 'https://placehold.co/100x100/f4f7f6/636e72'} alt={item.name} />
              </div>
              <div className="cart-item-details">
                <h3>{item.name || item.title}</h3>
                {(item.selectedColor || item.selectedSize) && (
                  <p className="item-variant text-sm text-gray-500 mb-1">
                    {item.selectedColor && `Màu: ${item.selectedColor}`} 
                    {item.selectedColor && item.selectedSize && ' | '}
                    {item.selectedSize && `Size: ${item.selectedSize}`}
                  </p>
                )}
                {item.productSale?.pricesale ? (
                  <p className="item-price">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.productSale.pricesale)}
                    <span style={{textDecoration: 'line-through', color: '#94a3b8', fontSize: '0.85em', marginLeft: '8px'}}>
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price || 0)}
                    </span>
                  </p>
                ) : (
                  <p className="item-price">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price || 0)}</p>
                )}
              </div>
              <div className="cart-item-actions">
                <div className="quantity-control">
                  <button onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}><Minus size={16}/></button>
                  <span>{item.quantity}</span>
                  <button onClick={() => {
                    const maxQty = item.productStore?.qty || 0;
                    if (item.quantity < maxQty) {
                      updateQuantity(item.cartItemId, item.quantity + 1);
                    } else {
                      toast.warning(`Kho chỉ còn tối đa ${maxQty} sản phẩm!`);
                    }
                  }}><Plus size={16}/></button>
                </div>
                <button className="btn-remove" onClick={() => removeFromCart(item.cartItemId)}><Trash2 size={20}/></button>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h2>Tổng Đơn Hàng</h2>
          <div className="summary-row">
            <span>Tạm tính:</span>
            <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cartTotal)}</span>
          </div>
          <div className="summary-row">
            <span>Phí giao hàng:</span>
            <span>Miễn phí</span>
          </div>
          <div className="summary-divider"></div>
          <div className="summary-row total">
            <span>Tổng cộng:</span>
            <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cartTotal)}</span>
          </div>
          <button className="btn-checkout" onClick={() => navigate('/checkout')}>
            Tiến Hành Thanh Toán
          </button>
          <Link to="/" className="continue-shopping">
            <ArrowLeft size={16} /> Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Cart;
