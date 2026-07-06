import React, { useState, useEffect, useContext, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CartContext } from '../../context/CartContext';
import { CreditCard } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import './PaymentGateway.css';

const PaymentGateway = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [cancelling, setCancelling] = useState(false);
  const cancelledRef = useRef(false); // chống spam - chỉ cho hủy 1 lần duy nhất

  const order = location.state?.order;
  const previousCart = location.state?.previousCart;

  useEffect(() => {
    if (!order) {
      navigate('/cart');
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleCancel();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [order, navigate]);

  const handleCancel = async () => {
    // Chặn spam: nếu đã bấm hủy rồi thì bỏ qua
    if (cancelledRef.current) return;
    cancelledRef.current = true;
    setCancelling(true);

    try {
      await api.put(`/orders/${order.id}/status`, { status: 7, cancelReason: "Khách hàng hủy thanh toán trực tuyến" });
      toast.info("Đã hủy thanh toán trực tuyến thành công");
    } catch (error) {
      console.error("Lỗi khi hủy đơn hàng:", error);
      toast.error("Có lỗi xảy ra khi hủy đơn hàng");
    }

    // Phục hồi giỏ hàng - chỉ chạy 1 lần duy nhất nhờ cancelledRef
    if (previousCart && previousCart.length > 0) {
      previousCart.forEach(item => {
        addToCart(item, item.quantity);
      });
    }
    
    navigate('/cart');
  };

  if (!order) return null;

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const amountFormatted = new Intl.NumberFormat('vi-VN').format(order.totalAmount);
  
  // VietQR URL
  const qrUrl = `https://img.vietqr.io/image/techcombank-19072456037013-compact.jpg?amount=${order.totalAmount}&addInfo=Thanh toan don hang ${order.id}&accountName=DONG%20PHUC%20KHANH`;

  return (
    <div className="pg-wrapper">
      <div className="pg-card">
        {/* Icon */}
        <div className="pg-icon-circle">
          <CreditCard size={28} color="#2563eb" />
        </div>

        {/* Title */}
        <h1 className="pg-title">MÃ QR THANH TOÁN</h1>

        {/* Amount */}
        <div className="pg-amount-row">
          <span className="pg-amount-label">TỔNG TIỀN:</span>
          <span className="pg-amount-value">{amountFormatted}Đ</span>
        </div>

        {/* QR Code */}
        <div className="pg-qr-container">
          <img src={qrUrl} alt="QR Code Thanh Toán" className="pg-qr-image" />
        </div>

        {/* Instructions */}
        <div className="pg-instructions">
          <p>* QUÉT MÃ BẰNG APP NGÂN HÀNG BẤT KỲ.</p>
          <p>* VUI LÒNG BẤM XÁC NHẬN SAU KHI CHUYỂN KHOẢN THÀNH CÔNG.</p>
        </div>

        {/* Buttons */}
        <div className="pg-buttons">
          <button 
            className="pg-btn-cancel" 
            onClick={handleCancel}
            disabled={cancelling}
          >
            {cancelling ? 'ĐANG HỦY...' : 'HỦY BỎ'}
          </button>
          <button 
            className="pg-btn-confirm" 
            onClick={() => navigate('/payment-result?success=true')}
            disabled={cancelling}
          >
            ĐÃ CHUYỂN KHOẢN
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentGateway;
