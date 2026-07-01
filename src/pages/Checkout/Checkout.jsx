import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';
import { CreditCard, Truck, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import './Checkout.css';

const Checkout = () => {
  const { cart, cartTotal, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    deliveryName: '',
    deliveryPhone: '',
    deliveryEmail: '',
    deliveryAddress: '',
    note: '',
    paymentMethod: 'cod'
  });

  const [formErrors, setFormErrors] = useState({});

  // Pre-fill user data
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        deliveryName: user.name || '',
        deliveryEmail: user.email || '',
        deliveryPhone: user.phone || '',
        deliveryAddress: user.address || ''
      }));
    }
  }, [user]);
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (cart.length === 0 && !success) {
    navigate('/cart');
    return null;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error for this field when typing
    if (formErrors[e.target.name]) {
      setFormErrors({ ...formErrors, [e.target.name]: null });
    }
  };

  const validateForm = () => {
    let errors = {};
    if (!formData.deliveryName.trim()) errors.deliveryName = 'Vui lòng nhập họ tên';
    if (!formData.deliveryPhone.trim()) errors.deliveryPhone = 'Vui lòng nhập số điện thoại';
    else if (!/^[0-9]{10,11}$/.test(formData.deliveryPhone)) errors.deliveryPhone = 'Số điện thoại không hợp lệ';
    if (!formData.deliveryAddress.trim()) errors.deliveryAddress = 'Vui lòng nhập địa chỉ giao hàng';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setError('Vui lòng kiểm tra lại các thông tin bắt buộc.');
      return;
    }

    setLoading(true);
    setError('');

    const payload = {
      deliveryName: formData.deliveryName,
      deliveryPhone: formData.deliveryPhone,
      deliveryEmail: formData.deliveryEmail,
      deliveryAddress: formData.deliveryAddress,
      note: formData.note,
      ...(user && { userId: user.id }),
      items: cart.map(item => ({
        productId: item.id,
        qty: item.quantity,
        discount: 0
      }))
    };

    try {
      await api.post('/orders/checkout', payload);
      setSuccess(true);
      clearCart();
    } catch (err) {
      console.error(err);
      setError('Đã có lỗi xảy ra khi đặt hàng. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="checkout-success">
        <CheckCircle size={80} color="#10b981" />
        <h2>Đặt hàng thành công!</h2>
        <p>Cảm ơn bạn đã tin tưởng SnackHub. Đơn hàng của bạn đang được chuẩn bị và sẽ giao đến trong thời gian sớm nhất.</p>
        <button className="btn-primary mt-4" onClick={() => navigate('/')}>Tiếp tục mua sắm</button>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <div className="checkout-form-section">
          <h2>Thông tin giao hàng</h2>
          {error && <div className="alert-error"><AlertCircle size={18} /> {error}</div>}
          
          <form onSubmit={handleSubmit} id="checkout-form">
            <div className="form-row">
              <div className="form-group">
                <label>Họ và tên *</label>
                <input 
                  type="text" 
                  name="deliveryName" 
                  value={formData.deliveryName} 
                  onChange={handleChange} 
                  placeholder="Nhập họ tên người nhận" 
                  className={formErrors.deliveryName ? 'input-error' : ''}
                />
                {formErrors.deliveryName && <span className="error-text">{formErrors.deliveryName}</span>}
              </div>
              <div className="form-group">
                <label>Số điện thoại *</label>
                <input 
                  type="text" 
                  name="deliveryPhone" 
                  value={formData.deliveryPhone} 
                  onChange={handleChange} 
                  placeholder="Nhập số điện thoại" 
                  className={formErrors.deliveryPhone ? 'input-error' : ''}
                />
                {formErrors.deliveryPhone && <span className="error-text">{formErrors.deliveryPhone}</span>}
              </div>
            </div>
            
            <div className="form-group">
              <label>Email liên hệ</label>
              <input 
                type="email" 
                name="deliveryEmail" 
                value={formData.deliveryEmail} 
                onChange={handleChange} 
                placeholder="Nhập email (tùy chọn)" 
              />
            </div>

            <div className="form-group">
              <label>Địa chỉ nhận hàng *</label>
              <input 
                type="text" 
                name="deliveryAddress" 
                value={formData.deliveryAddress} 
                onChange={handleChange} 
                placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/TP" 
                className={formErrors.deliveryAddress ? 'input-error' : ''}
              />
              {formErrors.deliveryAddress && <span className="error-text">{formErrors.deliveryAddress}</span>}
            </div>

            <div className="form-group">
              <label>Ghi chú đơn hàng</label>
              <textarea name="note" value={formData.note} onChange={handleChange} placeholder="Ghi chú về giao hàng, thời gian nhận..." rows="3"></textarea>
            </div>

            <h3 className="payment-title">Phương thức thanh toán</h3>
            <div className="payment-methods">
              <label className="payment-option">
                <input type="radio" name="paymentMethod" value="cod" checked={formData.paymentMethod === 'cod'} onChange={handleChange} />
                <div className="payment-content">
                  <Truck size={24} />
                  <span>Thanh toán khi nhận hàng (COD)</span>
                </div>
              </label>
              <label className="payment-option">
                <input type="radio" name="paymentMethod" value="transfer" checked={formData.paymentMethod === 'transfer'} onChange={handleChange} />
                <div className="payment-content">
                  <CreditCard size={24} />
                  <span>Chuyển khoản ngân hàng</span>
                </div>
              </label>
            </div>
          </form>
        </div>

        <div className="checkout-summary-section">
          <h2>Đơn hàng của bạn</h2>
          <div className="summary-items">
            {cart.map(item => (
              <div key={item.id} className="summary-item">
                <div className="item-img">
                  <img src={item.image ? (item.image.startsWith('http') ? item.image : `http://localhost:8080/uploads/${item.image}`) : 'https://placehold.co/50x50/f4f7f6/636e72'} alt={item.name} />
                </div>
                <div className="item-info">
                  <h4>{item.name || item.title}</h4>
                  <p>SL: {item.quantity}</p>
                </div>
                <div className="item-price">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format((item.productSale?.pricesale || item.price) * item.quantity)}
                </div>
              </div>
            ))}
          </div>
          
          <div className="summary-totals">
            <div className="total-row">
              <span>Tạm tính</span>
              <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cartTotal)}</span>
            </div>
            <div className="total-row">
              <span>Phí vận chuyển</span>
              <span>Miễn phí</span>
            </div>
            <div className="total-row final">
              <span>Tổng cộng</span>
              <span className="final-price">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cartTotal)}</span>
            </div>
          </div>
          
          <button type="submit" form="checkout-form" className="btn-place-order" disabled={loading}>
            {loading ? 'Đang xử lý...' : 'XÁC NHẬN ĐẶT HÀNG'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
