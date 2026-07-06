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

  // Cancel Order State
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [otherCancelReason, setOtherCancelReason] = useState('');
  const [cancelingOrder, setCancelingOrder] = useState(false);

  const handleCancelOrder = async (e) => {
    e.preventDefault();
    const finalReason = cancelReason === 'Khác' ? otherCancelReason : cancelReason;
    if (!finalReason.trim()) {
      toast.error('Vui lòng cho biết lý do hủy đơn hàng!');
      return;
    }

    setCancelingOrder(true);
    try {
      await api.put(`/orders/${order.id}/status`, {
        status: 6,
        cancelReason: finalReason
      });
      toast.success('Đã hủy đơn hàng thành công!');
      setIsCancelModalOpen(false);
      
      // Refresh order data locally
      setOrder(prev => ({ ...prev, status: 6, cancelReason: finalReason }));
    } catch (err) {
      console.error(err);
      toast.error('Có lỗi xảy ra khi hủy đơn hàng. Vui lòng thử lại.');
    } finally {
      setCancelingOrder(false);
    }
  };
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
          <div className="order-detail-header">
            <div>
              <h3 style={{fontSize: '1.5rem', marginBottom: '0.25rem', color: '#0f172a'}}>Chi tiết đơn hàng #{order.id}</h3>
              <p style={{color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem'}}>
                Ngày đặt: <strong>{new Date(order.createdAt).toLocaleString('vi-VN')}</strong>
              </p>
            </div>
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px'}}>
              <div className={`order-status ${statusDisplay.class}`} style={{fontSize: '0.95rem', padding: '0.5rem 1rem'}}>
                {statusDisplay.icon}
                {statusDisplay.text}
              </div>
              {order.status === 0 && (
                <button 
                  className="btn-outline" 
                  style={{fontSize: '0.85rem', padding: '0.4rem 1rem', borderColor: '#ef4444', color: '#ef4444'}}
                  onClick={() => setIsCancelModalOpen(true)}
                >
                  <XCircle size={14} style={{marginRight: '4px', verticalAlign: 'middle'}} /> Hủy đơn hàng
                </button>
              )}
            </div>
          </div>

          {(order.status === 6 || order.status === 7) && order.cancelReason && (
            <div style={{padding: '1rem 1.5rem', backgroundColor: '#fef2f2', borderBottom: '1px solid #fee2e2', color: '#991b1b', fontSize: '0.95rem'}}>
              <strong>Lý do hủy đơn:</strong> {order.cancelReason}
            </div>
          )}

          <div className="premium-delivery-info">
            <h4 style={{marginBottom: '1.25rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
              <Truck size={20} color="#3b82f6" /> Thông tin giao hàng
            </h4>
            <div className="premium-delivery-grid">
              <div className="delivery-info-group">
                <span className="delivery-info-label">Người nhận</span>
                <span className="delivery-info-value">{order.deliveryName}</span>
              </div>
              <div className="delivery-info-group">
                <span className="delivery-info-label">Số điện thoại</span>
                <span className="delivery-info-value">{order.deliveryPhone}</span>
              </div>
              <div className="delivery-info-group" style={{gridColumn: '1 / -1'}}>
                <span className="delivery-info-label">Địa chỉ giao hàng</span>
                <span className="delivery-info-value">{order.deliveryAddress}</span>
              </div>
              <div className="delivery-info-group" style={{gridColumn: '1 / -1'}}>
                <span className="delivery-info-label">Ghi chú đơn hàng</span>
                <span className="delivery-info-value">{order.note || 'Không có ghi chú'}</span>
              </div>
            </div>
          </div>

          <div className="order-body" style={{padding: '1.5rem'}}>
            <h4 style={{marginBottom: '1.25rem', color: '#0f172a'}}>Sản phẩm đã mua</h4>
            {order.orderDetails && order.orderDetails.map((detail, index) => (
              <div key={index} className="order-item" style={{position: 'relative', marginBottom: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: '12px'}}>
                <div style={{ width: '80px', height: '80px', flexShrink: 0, borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0', background: 'white' }}>
                  <img 
                    src={detail.product?.image ? (detail.product.image.startsWith('http') ? detail.product.image : `http://localhost:8080/uploads/${detail.product.image}`) : 'https://placehold.co/60x60/f4f7f6/636e72'} 
                    alt={detail.product?.name} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div className="item-info" style={{ flexGrow: 1, marginLeft: '1rem' }}>
                  <h4 style={{fontSize: '1.05rem', marginBottom: '0.25rem'}}>{detail.product?.name || 'Sản phẩm'}</h4>
                  {(detail.variantColor || detail.variantSize) && (
                    <p style={{color: '#64748b', marginBottom: '0.2rem', fontSize: '0.9rem'}}>
                      Phân loại: {detail.variantColor && <span>{detail.variantColor}</span>} 
                      {detail.variantColor && detail.variantSize && <span> - </span>}
                      {detail.variantSize && <span>Size {detail.variantSize}</span>}
                    </p>
                  )}
                  <p style={{color: '#64748b', fontSize: '0.9rem'}}>Số lượng: {detail.qty}</p>
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
                <div className="item-price" style={{fontSize: '1.1rem', color: '#0f172a', fontWeight: '600'}}>
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(detail.price)}
                </div>
              </div>
            ))}
          </div>

          <div className="order-premium-summary">
            <div className="summary-row">
              <span className="summary-label">Tạm tính:</span>
              <span className="summary-value">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalAmount)}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Phí vận chuyển:</span>
              <span className="summary-value" style={{color: '#10b981', fontWeight: '600'}}>Miễn phí</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Phương thức thanh toán:</span>
              <span className="summary-value" style={{textTransform: 'uppercase'}}>{order.paymentMethod || 'COD'}</span>
            </div>
            <div className="summary-divider"></div>
            <div className="summary-row final">
              <span className="summary-label">Tổng thanh toán:</span>
              <span className="summary-value">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalAmount)}</span>
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
                <span style={{color: '#64748b', fontSize: '0.9rem'}}>Cảm ơn bạn đã tin dùng sản phẩm của Nova Store!</span>
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
      {/* Cancel Modal */}
      {isCancelModalOpen && (
        <div className="modal-overlay" style={{position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div className="modal-content" style={{background: 'white', padding: '2.5rem', borderRadius: '16px', width: '90%', maxWidth: '500px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)'}}>
            <div style={{textAlign: 'center', color: '#ef4444', marginBottom: '1rem'}}>
              <XCircle size={60} />
            </div>
            <h2 style={{marginBottom: '1rem', textAlign: 'center', color: 'var(--dark)'}}>Xác nhận hủy đơn hàng</h2>
            <p style={{textAlign: 'center', color: '#64748b', marginBottom: '1.5rem', lineHeight: '1.6'}}>
              Hành động này không thể hoàn tác. Bạn có chắc chắn muốn hủy đơn hàng <strong>#{order.id}</strong> không?
            </p>

            <form onSubmit={handleCancelOrder}>
              <div style={{marginBottom: '2rem', textAlign: 'left'}}>
                <label style={{display: 'block', marginBottom: '1rem', fontWeight: 600, fontSize: '1.05rem', color: '#334155'}}>Lý do hủy đơn:</label>
                
                <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem'}}>
                  {[
                    'Muốn thay đổi địa chỉ giao hàng',
                    'Muốn thêm/thay đổi sản phẩm',
                    'Đổi ý, không muốn mua nữa',
                    'Tìm thấy giá rẻ hơn ở nơi khác',
                    'Khác'
                  ].map((reason, idx) => (
                    <label key={idx} style={{display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', padding: '0.75rem 1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid', borderColor: cancelReason === reason ? '#3b82f6' : '#e2e8f0', transition: 'all 0.2s'}}>
                      <input 
                        type="radio" 
                        name="cancelReason" 
                        value={reason} 
                        checked={cancelReason === reason} 
                        onChange={(e) => setCancelReason(e.target.value)} 
                        style={{width: '18px', height: '18px', accentColor: '#3b82f6'}}
                        required
                      />
                      <span style={{fontSize: '0.95rem', color: cancelReason === reason ? '#0f172a' : '#475569', fontWeight: cancelReason === reason ? '500' : 'normal'}}>{reason}</span>
                    </label>
                  ))}
                </div>

                {cancelReason === 'Khác' && (
                  <textarea 
                    value={otherCancelReason}
                    onChange={(e) => setOtherCancelReason(e.target.value)}
                    placeholder="Vui lòng cho chúng tôi biết lý do chi tiết..."
                    style={{width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid #3b82f6', minHeight: '80px', resize: 'vertical', fontFamily: 'inherit', fontSize: '0.95rem', background: '#fff', outline: 'none', boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.1)'}}
                    autoFocus
                    required
                  ></textarea>
                )}
              </div>

              <div style={{display: 'flex', justifyContent: 'center', gap: '1rem'}}>
                <button type="button" className="btn-outline" onClick={() => setIsCancelModalOpen(false)} style={{padding: '0.8rem 1.5rem', fontSize: '1rem'}}>Giữ lại đơn hàng</button>
                <button type="submit" className="btn-primary" disabled={cancelingOrder || !cancelReason} style={{padding: '0.8rem 1.5rem', fontSize: '1rem', background: '#ef4444', border: 'none', boxShadow: '0 4px 14px rgba(239, 68, 68, 0.3)'}}>
                  {cancelingOrder ? 'Đang xử lý...' : 'Xác nhận hủy đơn'}
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
