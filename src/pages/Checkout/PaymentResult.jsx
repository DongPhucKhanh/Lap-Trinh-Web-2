import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle } from 'lucide-react';
import api from '../../services/api';
import './Checkout.css'; // Reuse checkout styles

const PaymentResult = () => {
  const [status, setStatus] = useState('loading'); // loading, success, failed
  const [message, setMessage] = useState('Đang xử lý kết quả thanh toán...');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyPayment = async () => {
      // VNPay appends all result info to the query string
      const searchParams = location.search;
      if (!searchParams) {
        setStatus('failed');
        setMessage('Không tìm thấy dữ liệu thanh toán.');
        return;
      }

      // Xử lý riêng cho trường hợp khách tự xác nhận "Tôi đã thanh toán" bằng mã QR
      if (searchParams === '?success=true') {
        setStatus('success');
        setMessage('Thanh toán của bạn đã được ghi nhận. Vui lòng giữ lại biên lai chuyển khoản!');
        return;
      }

      try {
        // Gửi toàn bộ query parameters sang backend để kiểm tra chữ ký (verify signature)
        const response = await api.get(`/payment/vnpay_return${searchParams}`);
        if (response.data.success) {
          setStatus('success');
          setMessage(response.data.message || 'Thanh toán thành công!');
        } else {
          setStatus('failed');
          setMessage(response.data.message || 'Thanh toán thất bại.');
        }
      } catch (error) {
        console.error("Payment verification failed", error);
        setStatus('failed');
        setMessage('Giao dịch đã bị hủy hoặc có lỗi xảy ra. Vui lòng kiểm tra lại!');
      }
    };

    verifyPayment();
  }, [location]);

  return (
    <div className="checkout-page" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="checkout-success" style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        {status === 'loading' && (
          <div>
            <div className="loader" style={{ margin: '0 auto 20px auto' }}></div>
            <h2>Đang xác thực giao dịch...</h2>
            <p>Vui lòng không đóng trình duyệt lúc này.</p>
          </div>
        )}
        
        {status === 'success' && (
          <div>
            <CheckCircle size={80} color="#10b981" style={{ margin: '0 auto 20px auto' }} />
            <h2 style={{ color: '#10b981', marginBottom: '10px' }}>Thanh toán thành công!</h2>
            <p style={{ color: '#666', marginBottom: '20px' }}>{message}</p>
            <p style={{ color: '#888', marginBottom: '30px' }}>Đơn hàng của bạn đã được ghi nhận và đang được xử lý.</p>
            <button className="btn-primary" onClick={() => navigate('/user/order')}>Xem đơn hàng của tôi</button>
            <button className="btn-outline" onClick={() => navigate('/')} style={{ marginLeft: '10px' }}>Trang chủ</button>
          </div>
        )}

        {status === 'failed' && (
          <div>
            <XCircle size={80} color="#ef4444" style={{ margin: '0 auto 20px auto' }} />
            <h2 style={{ color: '#ef4444', marginBottom: '10px' }}>Giao dịch không thành công</h2>
            <p style={{ color: '#666', marginBottom: '30px' }}>{message}</p>
            <button className="btn-primary" onClick={() => navigate('/cart')}>Quay lại giỏ hàng</button>
            <button className="btn-outline" onClick={() => navigate('/')} style={{ marginLeft: '10px' }}>Trang chủ</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentResult;
