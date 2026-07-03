import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Truck, CheckCircle, XCircle, Star } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import './OrderHistory.css';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Review Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewingProduct, setReviewingProduct] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const openReviewModal = (product) => {
    setReviewingProduct(product);
    setRating(5);
    setComment('');
    setIsReviewModalOpen(true);
  };

  const closeReviewModal = () => {
    setIsReviewModalOpen(false);
    setReviewingProduct(null);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error('Vui lòng nhập nội dung đánh giá!');
      return;
    }
    
    setSubmittingReview(true);
    try {
      await api.post('/reviews', {
        productId: reviewingProduct.id,
        orderId: order.id,
        rating,
        comment
      });
      toast.success('Cảm ơn bạn đã đánh giá sản phẩm!');
      closeReviewModal();
    } catch (err) {
      console.error(err);
      if (err.response?.data) {
        toast.error(err.response.data);
      } else {
        toast.error('Có lỗi xảy ra, vui lòng thử lại.');
      }
    } finally {
      setSubmittingReview(false);
    }
  };

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
      case 1: return { icon: <CheckCircle size={16}/>, text: 'Đã xác nhận', class: 'status-completed' };
      case 2: return { icon: <Clock size={16}/>, text: 'Đang chuẩn bị', class: 'status-pending' };
      case 3: return { icon: <Truck size={16}/>, text: 'Đang giao hàng', class: 'status-delivering' };
      case 4: return { icon: <CheckCircle size={16}/>, text: 'Đã giao hàng', class: 'status-completed' };
      case 5: return { icon: <CheckCircle size={16}/>, text: 'Hoàn thành', class: 'status-completed' };
      case 6: return { icon: <XCircle size={16}/>, text: 'Đã hủy', class: 'status-cancelled' };
      case 7: return { icon: <XCircle size={16}/>, text: 'Hoàn tiền', class: 'status-cancelled' };
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
              <div key={index} className="order-item" style={{position: 'relative', marginBottom: '1rem'}}>
                <div style={{ width: '80px', height: '80px', flexShrink: 0, borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                  <img 
                    src={detail.product?.image ? (detail.product.image.startsWith('http') ? detail.product.image : `http://localhost:8080/uploads/${detail.product.image}`) : 'https://placehold.co/60x60/f4f7f6/636e72'} 
                    alt={detail.product?.name} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div className="item-info" style={{ flexGrow: 1 }}>
                  <h4>{detail.product?.name || 'Sản phẩm'}</h4>
                  <p>Số lượng: {detail.qty}</p>
                  {(order.status === 4 || order.status === 5) && (
                    <button 
                      className="btn-outline" 
                      style={{marginTop: '10px', fontSize: '0.8rem', padding: '0.3rem 0.8rem', borderColor: '#f59e0b', color: '#f59e0b'}}
                      onClick={() => openReviewModal(detail.product)}
                    >
                      <Star size={14} style={{marginRight: '4px', verticalAlign: 'middle', fill: '#f59e0b'}} /> Đánh giá
                    </button>
                  )}
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

      {/* Review Modal */}
      {isReviewModalOpen && (
        <div className="modal-overlay" style={{position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div className="modal-content" style={{background: 'white', padding: '2.5rem', borderRadius: '16px', width: '90%', maxWidth: '650px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)'}}>
            <h2 style={{marginBottom: '1.5rem', textAlign: 'center', color: 'var(--dark)'}}>Đánh Giá Sản Phẩm</h2>
            <div style={{display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '2rem', padding: '1.25rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0'}}>
              <img 
                src={reviewingProduct?.image ? (reviewingProduct.image.startsWith('http') ? reviewingProduct.image : `http://localhost:8080/uploads/${reviewingProduct.image}`) : 'https://placehold.co/60x60/f4f7f6/636e72'} 
                alt={reviewingProduct?.name} 
                style={{width: '70px', height: '70px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #cbd5e1'}}
              />
              <div>
                <strong style={{fontSize: '1.2rem', display: 'block', marginBottom: '0.25rem'}}>{reviewingProduct?.name}</strong>
                <span style={{color: '#64748b', fontSize: '0.9rem'}}>Cảm ơn bạn đã tin dùng sản phẩm của SnackHub!</span>
              </div>
            </div>

            <form onSubmit={handleReviewSubmit}>
              <div style={{marginBottom: '1.5rem', textAlign: 'center'}}>
                <label style={{display: 'block', marginBottom: '1rem', fontWeight: 600, fontSize: '1.1rem'}}>Bạn cảm thấy sản phẩm này thế nào?</label>
                <div style={{display: 'flex', gap: '0.75rem', justifyContent: 'center', color: '#f59e0b', cursor: 'pointer', marginBottom: '0.5rem'}}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star 
                      key={star} 
                      onClick={() => setRating(star)} 
                      style={{fill: star <= rating ? '#f59e0b' : 'transparent', cursor: 'pointer', transition: 'all 0.2s', strokeWidth: 1.5, stroke: '#f59e0b'}} 
                      size={45} 
                    />
                  ))}
                </div>
                <div style={{fontWeight: 600, color: '#f59e0b', fontSize: '1.1rem'}}>
                  {rating === 5 && 'Tuyệt vời'}
                  {rating === 4 && 'Rất tốt'}
                  {rating === 3 && 'Bình thường'}
                  {rating === 2 && 'Không hài lòng'}
                  {rating === 1 && 'Rất tệ'}
                  {` (${rating} sao)`}
                </div>
              </div>

              <div style={{marginBottom: '2rem'}}>
                <label style={{display: 'block', marginBottom: '0.75rem', fontWeight: 600, fontSize: '1.05rem'}}>Nhận xét chi tiết:</label>
                <textarea 
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Hãy chia sẻ những điều bạn thích (hoặc chưa thích) về sản phẩm này nhé..."
                  style={{width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid #cbd5e1', minHeight: '130px', resize: 'vertical', fontFamily: 'inherit', fontSize: '1rem', backgroundColor: '#fff'}}
                  required
                ></textarea>
              </div>

              <div style={{display: 'flex', justifyContent: 'center', gap: '1rem'}}>
                <button type="button" className="btn-outline" onClick={closeReviewModal} style={{padding: '0.8rem 2rem', fontSize: '1.05rem'}}>Hủy bỏ</button>
                <button type="submit" className="btn-primary" disabled={submittingReview} style={{padding: '0.8rem 2.5rem', fontSize: '1.05rem'}}>
                  {submittingReview ? 'Đang gửi...' : 'Gửi Đánh Giá'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetail;
