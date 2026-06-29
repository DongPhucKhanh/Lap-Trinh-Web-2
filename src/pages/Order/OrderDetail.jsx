import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Truck, CheckCircle, XCircle } from 'lucide-react';
import api from '../../services/api';
import './OrderHistory.css'; // Reusing some CSS

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then(res => {
        setOrder(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Không tìm thấy đơn hàng!');
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="loader"></div>;
  if (error) return <div className="alert-error" style={{margin: '2rem auto', maxWidth: 600}}>{error}</div>;

  const getStatusDisplay = (status) => {
    switch(status) {
      case 0: return { icon: <Clock size={16}/>, text: 'Chờ xác nhận', class: 'status-pending' };
      case 1: return { icon: <Truck size={16}/>, text: 'Đang giao hàng', class: 'status-delivering' };
      case 2: return { icon: <CheckCircle size={16}/>, text: 'Đã hoàn thành', class: 'status-completed' };
      case 3: return { icon: <XCircle size={16}/>, text: 'Đã hủy', class: 'status-cancelled' };
      default: return { icon: <Clock size={16}/>, text: 'Không xác định', class: 'status-pending' };
    }
  };

  const statusDisplay = getStatusDisplay(order.status);
  const totalAmount = order.orderDetails?.reduce((sum, item) => sum + (item.price * item.qty), 0) || 0;

  return (
    <div className="order-history-page">
      <div className="container" style={{maxWidth: 800}}>
        <button className="btn-outline-primary" style={{marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', width: 'fit-content'}} onClick={() => navigate(-1)}>
          <ArrowLeft size={18} /> Quay lại
        </button>

        <div className="order-card">
          <div className="order-header">
            <div>
              <h3>Chi tiết đơn hàng #{order.id}</h3>
              <p style={{color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem'}}>
                Ngày đặt: {new Date(order.createdAt).toLocaleString('vi-VN')}
              </p>
            </div>
            <div className={`order-status ${statusDisplay.class}`}>
              {statusDisplay.icon}
              {statusDisplay.text}
            </div>
          </div>

          <div style={{padding: '1.5rem', borderBottom: '1px solid #f1f5f9'}}>
            <h4 style={{marginBottom: '1rem'}}>Thông tin giao hàng</h4>
            <div style={{display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.75rem', fontSize: '0.95rem'}}>
              <strong>Người nhận:</strong> <span>{order.deliveryName}</span>
              <strong>Điện thoại:</strong> <span>{order.deliveryPhone}</span>
              <strong>Địa chỉ:</strong> <span>{order.deliveryAddress}</span>
              <strong>Ghi chú:</strong> <span>{order.note || 'Không có'}</span>
            </div>
          </div>

          <div className="order-body">
            <h4 style={{marginBottom: '1rem'}}>Sản phẩm đã mua</h4>
            {order.orderDetails && order.orderDetails.map((detail, index) => (
              <div key={index} className="order-item">
                <img 
                  src={detail.product?.image ? (detail.product.image.startsWith('http') ? detail.product.image : `http://localhost:8080/uploads/${detail.product.image}`) : 'https://placehold.co/60x60/f4f7f6/636e72'} 
                  alt={detail.product?.name} 
                />
                <div className="item-info">
                  <h4>{detail.product?.name || 'Sản phẩm'}</h4>
                  <p>Số lượng: {detail.qty}</p>
                </div>
                <div className="item-price">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(detail.price)}
                </div>
              </div>
            ))}
          </div>

          <div className="order-footer" style={{justifyContent: 'flex-end'}}>
            <div className="order-total" style={{textAlign: 'right'}}>
              Phí vận chuyển: <span>Miễn phí</span><br/><br/>
              Tổng thanh toán: <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalAmount)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
