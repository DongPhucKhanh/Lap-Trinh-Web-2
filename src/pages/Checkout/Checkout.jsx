import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CartContext } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';
import { CreditCard, Truck, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import './Checkout.css';

const Checkout = () => {
  const { cart, cartTotal, removeFromCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const selectedItemIds = location.state?.selectedItems || [];
  
  // Filter cart to only selected items, or use whole cart if no selection passed
  const checkoutCart = selectedItemIds.length > 0 
    ? cart.filter(item => selectedItemIds.includes(item.cartItemId))
    : cart;
    
  const checkoutTotal = checkoutCart.reduce((total, item) => {
    const price = item.productSale?.pricesale || item.price || 0;
    return total + (price * item.quantity);
  }, 0);
  
  const [formData, setFormData] = useState({
    deliveryName: '',
    deliveryPhone: '',
    deliveryEmail: '',
    deliveryAddress: '',
    note: '',
    paymentMethod: 'cod'
  });

  const [formErrors, setFormErrors] = useState({});

  // Voucher states
  const [voucherCode, setVoucherCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [voucherMessage, setVoucherMessage] = useState('');
  const [voucherError, setVoucherError] = useState(false);
  const [applyingVoucher, setApplyingVoucher] = useState(false);

  const finalTotal = checkoutTotal - discountAmount > 0 ? checkoutTotal - discountAmount : 0;

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
  
  const [activeVouchers, setActiveVouchers] = useState([]);

  useEffect(() => {
    // Fetch active vouchers
    api.get('/vouchers/active')
      .then(res => {
        setActiveVouchers(res.data);
      })
      .catch(err => {
        console.error("Lỗi lấy danh sách mã giảm giá:", err);
      });
  }, []);

  const [loading, setLoading] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    let timer;
    if (placedOrder && formData.paymentMethod !== 'transfer') {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            navigate('/product');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [placedOrder, formData.paymentMethod, navigate]);

  useEffect(() => {
    if (checkoutCart.length === 0 && !placedOrder) {
      navigate('/cart');
    }
  }, [checkoutCart, navigate, placedOrder]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.deliveryName.trim()) errors.deliveryName = 'Vui lòng nhập họ tên';
    if (!formData.deliveryPhone.trim()) errors.deliveryPhone = 'Vui lòng nhập số điện thoại';
    if (!formData.deliveryEmail.trim()) {
      errors.deliveryEmail = 'Vui lòng nhập email';
    } else if (!/\S+@\S+\.\S+/.test(formData.deliveryEmail)) {
      errors.deliveryEmail = 'Email không hợp lệ';
    }
    if (!formData.deliveryAddress.trim()) errors.deliveryAddress = 'Vui lòng nhập địa chỉ giao hàng';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      setVoucherError(true);
      setVoucherMessage('Vui lòng nhập mã giảm giá');
      return;
    }
    setApplyingVoucher(true);
    setVoucherMessage('');
    
    try {
      const res = await api.post('/vouchers/apply', {
        code: voucherCode.trim(),
        cartTotal: checkoutTotal
      });
      setVoucherError(false);
      setVoucherMessage(res.data.message);
      setDiscountAmount(res.data.discountAmount);
    } catch (err) {
      setVoucherError(true);
      setDiscountAmount(0);
      setVoucherMessage(err.response?.data?.message || 'Mã giảm giá không hợp lệ');
    } finally {
      setApplyingVoucher(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      // Scroll to first error
      const firstError = document.querySelector('.error-text');
      if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const payload = {
        deliveryName: formData.deliveryName,
        deliveryPhone: formData.deliveryPhone,
        deliveryEmail: formData.deliveryEmail,
        deliveryAddress: formData.deliveryAddress,
        note: formData.note,
        paymentMethod: formData.paymentMethod,
        voucherCode: discountAmount > 0 ? voucherCode.trim() : null,
        ...(user && { userId: user.id }),
        items: checkoutCart.map(item => ({
          productId: item.id || item.product?.id,
          qty: item.quantity,
          discount: 0
        }))
      };

      const res = await api.post('/orders/checkout', payload);
      
      const newOrder = res.data;
      newOrder.totalAmount = finalTotal;
      setPlacedOrder(newOrder);
      
      // Remove only checked out items from cart
      checkoutCart.forEach(item => {
        removeFromCart(item.cartItemId);
      });
      
      if (formData.paymentMethod === 'transfer') {
        navigate('/payment-gateway', { state: { order: newOrder, previousCart: checkoutCart } });
      }
    } catch (err) {
      console.error("Lỗi đặt hàng:", err);
      setError('Đã có lỗi xảy ra khi đặt hàng. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  if (placedOrder && formData.paymentMethod !== 'transfer') {
    return (
      <div className="checkout-success-premium">
        <div className="success-card">
          <div className="success-icon-wrapper">
            <CheckCircle size={60} color="#10b981" />
            <div className="success-icon-ring"></div>
          </div>
          <h2>Đặt hàng thành công!</h2>
          <div className="order-reference">
            Mã đơn hàng: <strong>#{placedOrder.id || Math.floor(Math.random() * 100000)}</strong>
          </div>
          <p className="success-message">
            Cảm ơn bạn đã tin tưởng Nova Store. Đơn hàng của bạn đang được xử lý và sẽ giao đến trong thời gian sớm nhất. 
            Thông tin chi tiết đã được gửi đến email <strong>{formData.deliveryEmail}</strong>.
          </p>
          <div className="success-actions">
            <button className="btn-primary" onClick={() => navigate('/product')}>Tiếp tục mua sắm ({countdown}s)</button>
            <button className="btn-outline" onClick={() => navigate('/user/order')}>Xem đơn hàng</button>
          </div>
          <div className="redirect-text">
            Sẽ tự động chuyển về trang sản phẩm sau {countdown} giây...
          </div>
        </div>
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
                  <span>Thanh toán Online (Quét mã QR)</span>
                </div>
              </label>
            </div>
          </form>
        </div>

        <div className="order-summary-premium">
          <h2>Tóm tắt đơn hàng</h2>
          <div className="summary-items">
            {checkoutCart.map((item, index) => (
              <div key={index} className="summary-item">
                <div className="item-image">
                  <img src={item.image ? (item.image.startsWith('http') ? item.image : `http://localhost:8080/uploads/${item.image}`) : 'https://placehold.co/80x80/f4f7f6/636e72'} alt={item.name} />
                  <span className="item-qty-badge">{item.quantity}</span>
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

          <div className="voucher-section">
            <div className="voucher-input-group">
              <input 
                type="text" 
                placeholder="Nhập mã giảm giá" 
                value={voucherCode} 
                onChange={(e) => setVoucherCode(e.target.value)} 
              />
              <button type="button" onClick={handleApplyVoucher} disabled={applyingVoucher}>
                {applyingVoucher ? 'Đang xử lý...' : 'Áp dụng'}
              </button>
            </div>
            {voucherMessage && (
              <div className={`voucher-message ${voucherError ? 'text-red' : 'text-success'}`} style={{ marginTop: '8px', fontSize: '14px' }}>
                {voucherMessage}
              </div>
            )}
            
            {activeVouchers.length > 0 && (
              <div className="available-vouchers">
                <h4>🎁 Mã giảm giá dành cho bạn:</h4>
                <div className="voucher-cards">
                  {activeVouchers.map(v => (
                    <div key={v.id} className="holo-card">
                      <div className="holo-notes">$$$$$</div>
                      <div className="holo-notes">$$$$</div>
                      <div className="holo-notes">$$$$$</div>

                      <div className="holo-header">
                        {v.code}
                        <div className="holo-symbol">✁</div>
                      </div>
                      <div className="holo-body">
                        <em>Giảm {v.discountPercent}%</em>
                        Đơn từ {v.minOrderValue ? (v.minOrderValue / 1000) + 'k' : '0đ'}<br />
                        {v.maxDiscountAmount ? `Giảm tối đa ${(v.maxDiscountAmount / 1000)}k` : 'Không giới hạn'}
                      </div>
                      <div className="holo-footer">
                        <div className="holo-number">
                          <button 
                            type="button" 
                            className="holo-btn"
                            onClick={() => {
                              setVoucherCode(v.code);
                              setTimeout(() => {
                                const btn = document.querySelector('.voucher-input-group button');
                                if (btn) btn.click();
                              }, 50);
                            }}
                          >
                            Dùng Ngay
                          </button>
                        </div>
                        <div className="holo-barcode"></div>
                      </div>

                      <div className="holo-bg holo-holographic" style={{ filter: `url(#bump-${v.id})` }}></div>
                      <svg className="holo-filter" width="0" height="0">
                        <filter id={`bump-${v.id}`}>
                          <feTurbulence result="noise" numOctaves="3" baseFrequency="0.7" type="fractalNoise" />
                          <feSpecularLighting in="noise" result="specular" lightingColor="#fffffc" specularExponent="25" specularConstant="0.8" surfaceScale="0.15">
                            <fePointLight z="210" y="100" x="100" />
                          </feSpecularLighting>
                          <feComposite result="noise2" operator="in" in="specular" in2="SourceGraphic" />
                          <feBlend mode="screen" in2="noise2" in="SourceGraphic" />
                        </filter>
                      </svg>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="summary-totals">
            <div className="total-row">
              <span>Tạm tính ({checkoutCart.length} sản phẩm)</span>
              <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(checkoutTotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="total-row text-success">
                <span>Mã giảm giá ({voucherCode})</span>
                <span>-{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(discountAmount)}</span>
              </div>
            )}
            <div className="total-row">
              <span>Phí vận chuyển</span>
              <span>Miễn phí</span>
            </div>
            <div className="total-row final-total">
              <span>Tổng cộng</span>
              <span className="total-price">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(finalTotal)}</span>
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
