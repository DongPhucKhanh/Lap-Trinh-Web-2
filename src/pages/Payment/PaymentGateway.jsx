import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CartContext } from '../../context/CartContext';
import api from '../../services/api';
import './PaymentGateway.css';

const PaymentGateway = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes in seconds
  const [showAlert, setShowAlert] = useState(true);

  // Retrieve order details from state
  const order = location.state?.order;
  const previousCart = location.state?.previousCart;

  useEffect(() => {
    if (!order) {
      navigate('/cart');
      return;
    }

    // Timer logic
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleCancel(); // Auto cancel on timeout
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [order, navigate]);

  const handleCancel = async () => {
    try {
      // Gọi API hủy đơn hàng do chưa thanh toán
      await api.put(`/orders/${order.id}/status`, { status: 7, cancelReason: "Khách hàng hủy thanh toán trực tuyến" });
    } catch (error) {
      console.error("Lỗi khi hủy đơn hàng:", error);
    }

    // Phục hồi giỏ hàng
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

  const amountFormatted = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalAmount);
  
  // VietQR URL for Techcombank
  const qrUrl = `https://img.vietqr.io/image/techcombank-19072456037013-compact.jpg?amount=${order.totalAmount}&addInfo=Thanh toan don hang ${order.id}&accountName=DONG%20PHUC%20KHANH`;

  const popularBanks = [
    { name: "Vietcombank", logo: "https://api.vietqr.io/img/VCB.png" },
    { name: "Agribank", logo: "https://api.vietqr.io/img/VBA.png" },
    { name: "BIDV", logo: "https://api.vietqr.io/img/BIDV.png" },
    { name: "VietinBank", logo: "https://api.vietqr.io/img/ICB.png" },
    { name: "MSB", logo: "https://api.vietqr.io/img/MSB.png" },
    { name: "VPBank", logo: "https://api.vietqr.io/img/VPB.png" },
    { name: "SCB", logo: "https://api.vietqr.io/img/SCB.png" },
    { name: "ABBANK", logo: "https://api.vietqr.io/img/ABB.png" },
    { name: "IVB", logo: "https://api.vietqr.io/img/IVB.png" },
    { name: "NCB", logo: "https://api.vietqr.io/img/NCB.png" },
    { name: "SHB", logo: "https://api.vietqr.io/img/SHB.png" },
    { name: "VIB", logo: "https://api.vietqr.io/img/VIB.png" },
    { name: "TPBank", logo: "https://api.vietqr.io/img/TPB.png" },
    { name: "Techcombank", logo: "https://api.vietqr.io/img/TCB.png" },
    { name: "MBBank", logo: "https://api.vietqr.io/img/MB.png" },
    { name: "Eximbank", logo: "https://api.vietqr.io/img/EIB.png" },
    { name: "NamABank", logo: "https://api.vietqr.io/img/NAB.png" },
    { name: "BacABank", logo: "https://api.vietqr.io/img/BAB.png" },
    { name: "OCB", logo: "https://api.vietqr.io/img/OCB.png" },
    { name: "HDBank", logo: "https://api.vietqr.io/img/HDB.png" }
  ];

  return (
    <div className="payment-gateway-wrapper">
      <div className="pg-header">
        <div className="pg-logo">
          <h1><span>SNACK</span>HUB<span style={{color: '#0ea5e9'}}>QR</span></h1>
          <span className="pg-logo-sub">Cổng thanh toán an toàn</span>
        </div>
        <div className="pg-flags">
          <img src="https://flagcdn.com/w40/vn.png" alt="VN" />
          <img src="https://flagcdn.com/w40/gb.png" alt="EN" style={{ opacity: 0.5 }} />
        </div>
      </div>

      <div className="pg-container">
        {showAlert && (
          <div className="pg-alert">
            Quý khách vui lòng không tắt trình duyệt cho đến khi nhận được kết quả giao dịch trên website. Xin cảm ơn!
            <span className="pg-alert-close" onClick={() => setShowAlert(false)}>✕</span>
          </div>
        )}

        <div className="pg-content">
          <div className="pg-left">
            <h2>Ứng dụng mobile<br/>quét mã</h2>
            <div className="brand-qr">SNACKHUB<sup style={{fontSize:'12px'}}>QR</sup></div>
            
            <div className="pg-qr-frame">
              <div className="corner-bottom"></div>
              <img src={qrUrl} alt="QR Code" className="pg-qr-image" />
            </div>
            
            <div className="pg-scan-text">Scan to Pay</div>
            <div className="pg-amount-title">Thanh toán trực tuyến</div>
            <div className="pg-amount">{amountFormatted}</div>
            
            <div style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '18px', marginBottom: '10px' }}>
              Thời gian còn lại: {formatTime(timeLeft)}
            </div>
            
            <a href="#" className="pg-guide-link">Hướng dẫn thanh toán?</a>
            
            <div className="pg-divider"><span>Hoặc</span></div>
            
            <button className="pg-btn-cancel" onClick={handleCancel}>HỦY GIAO DỊCH</button>
            <button className="pg-btn-success" onClick={() => navigate('/payment-result?success=true')}>TÔI ĐÃ THANH TOÁN</button>
          </div>

          <div className="pg-right">
            <h3>Sử dụng Mobile Banking hỗ trợ <span>SNACKHUB<sup style={{fontSize:'10px'}}>QR</sup></span></h3>
            
            <div className="pg-banks-grid">
              {popularBanks.map((bank, index) => (
                <div key={index} className="pg-bank-item" title={bank.name}>
                  <img src={bank.logo} alt={bank.name} style={{ width: '95%', height: '100%', maxHeight: '55px', objectFit: 'contain' }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="pg-footer">
        <p>Phát triển bởi SneakerHub © 2026</p>
        <div className="pg-security">
          <img src="https://cdn.iconscout.com/icon/free/png-256/pci-dss-3629088-3031023.png" alt="PCI DSS" style={{filter: 'grayscale(1)', opacity: 0.7}} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#64748b', fontWeight: 'bold' }}>
            <span style={{ fontSize: '20px' }}>🔒</span> SECURE
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentGateway;
