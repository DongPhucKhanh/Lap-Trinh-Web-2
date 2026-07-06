import React, { useState, useEffect } from 'react';
import { FileText, ArrowLeft, Save, Trash2 } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import orderService from '../../services/orderService';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState(0);
  const [cancelReason, setCancelReason] = useState('');
  
  const statuses = [
    { value: 0, label: 'Chờ xác nhận' },
    { value: 1, label: 'Đã xác nhận' },
    { value: 2, label: 'Đang chuẩn bị' },
    { value: 3, label: 'Đang giao' },
    { value: 4, label: 'Đã giao' },
    { value: 5, label: 'Hoàn thành' },
    { value: 6, label: 'Đã hủy' },
    { value: 7, label: 'Hoàn tiền' }
  ];

  useEffect(() => {
    orderService.getById(id)
      .then(res => {
        setOrder(res.data);
        setStatus(res.data.status);
        setCancelReason(res.data.cancelReason || '');
      })
      .catch(() => navigate('/admin/order'));
  }, [id, navigate]);

  const handleUpdateStatus = (e) => {
    e.preventDefault();
    if ((Number(status) === 6 || Number(status) === 7) && !cancelReason.trim()) {
      alert('Vui lòng nhập lý do hủy/hoàn tiền!');
      return;
    }
    setLoading(true);
    orderService.updateStatus(id, { status: Number(status), cancelReason: cancelReason })
      .then(() => { 
        setLoading(false);
        alert('Cập nhật trạng thái và gửi email thông báo thành công!');
        // Cập nhật lại state order hiện tại
        setOrder(prev => ({...prev, status: Number(status)}));
      })
      .catch(err => { 
        setLoading(false); 
        alert('Lỗi: ' + (err.response?.data || err.message)); 
      });
  };

  const handleDeleteItem = (itemId) => {
    const reason = window.prompt("Vui lòng nhập lý do xóa/hoàn tiền cho sản phẩm này:");
    if (reason === null) return;
    if (!reason.trim()) {
      alert("Lý do không được để trống!");
      return;
    }
    setLoading(true);
    orderService.deleteItem(order.id, itemId, reason)
      .then(res => {
        setLoading(false);
        alert('Đã xóa sản phẩm và gửi email thông báo thành công!');
        setOrder(res.data);
      })
      .catch(err => {
        setLoading(false);
        alert('Lỗi: ' + (err.response?.data || err.message));
      });
  };

  const calculateTotal = (orderDetails) => {
    if (!orderDetails) return 0;
    return orderDetails.reduce((sum, item) => sum + (item.price * item.qty), 0);
  };

  if (!order) return <div className="loader"></div>;

  return (
    <div className="admin-page">
      <div className="page-header">
        <div className="flex-row">
          <Link to="/admin/order" className="btn-icon"><ArrowLeft size={20}/></Link>
          <h2><FileText /> Chi Tiết Đơn Hàng #{order.id}</h2>
        </div>
      </div>
      
      <div className="grid-2-cols" style={{ gap: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Thông tin giao hàng</h3>
            <p style={{ margin: '0.5rem 0' }}><strong>Người nhận:</strong> {order.deliveryName}</p>
            <p style={{ margin: '0.5rem 0' }}><strong>Số điện thoại:</strong> {order.deliveryPhone}</p>
            <p style={{ margin: '0.5rem 0' }}><strong>Email:</strong> {order.deliveryEmail || 'Không có'}</p>
            <p style={{ margin: '0.5rem 0' }}><strong>Địa chỉ:</strong> {order.deliveryAddress}</p>
            <p style={{ margin: '0.5rem 0' }}><strong>Ghi chú:</strong> {order.note || 'Không có'}</p>
            <p style={{ margin: '0.5rem 0' }}><strong>Ngày đặt:</strong> {new Date(order.createdAt).toLocaleString('vi-VN')}</p>
          </div>

          <div className="card-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Cập nhật trạng thái</h3>
            <form onSubmit={handleUpdateStatus}>
              <div className="form-group">
                <label>Trạng thái đơn hàng hiện tại</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ padding: '0.75rem', width: '100%', border: '1px solid #cbd5e1', borderRadius: '6px' }}>
                  {statuses.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
                {(Number(status) === 6 || Number(status) === 7) && (
                  <div style={{marginTop: '1rem'}}>
                    <label>Lý do hủy / hoàn tiền <span style={{color:'red'}}>*</span></label>
                    <textarea 
                      value={cancelReason} 
                      onChange={e => setCancelReason(e.target.value)}
                      placeholder="Nhập lý do để thông báo cho khách hàng..."
                      style={{ padding: '0.75rem', width: '100%', border: '1px solid #cbd5e1', borderRadius: '6px', minHeight: '80px', marginTop: '0.5rem', outline: 'none' }}
                      required
                    ></textarea>
                  </div>
                )}
                <small style={{ color: '#64748b', marginTop: '0.75rem', display: 'block' }}>
                  * Khi bấm Cập nhật, hệ thống sẽ lưu trạng thái mới và tự động gửi Email thông báo đến khách hàng.
                </small>
              </div>
              <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '1rem' }}>
                <Save size={18} /> {loading ? 'Đang xử lý...' : 'Cập nhật & Gửi Email'}
              </button>
            </form>
          </div>
        </div>

        <div className="card-panel" style={{ padding: '1.5rem', alignSelf: 'start' }}>
          <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Danh sách sản phẩm</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #eee' }}>Sản phẩm</th>
                  <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #eee' }}>SL</th>
                  <th style={{ padding: '10px', textAlign: 'right', borderBottom: '1px solid #eee' }}>Đơn giá</th>
                  <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #eee', width: '50px' }}></th>
                </tr>
              </thead>
              <tbody>
                {order.orderDetails && order.orderDetails.map((item, idx) => (
                  <tr key={idx}>
                    <td style={{ padding: '10px', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img 
                        src={item.product?.image ? (item.product.image.startsWith('http') ? item.product.image : `http://localhost:8080/uploads/${item.product.image}`) : 'https://placehold.co/40'} 
                        alt="" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} 
                      />
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>{item.product?.name}</span>
                        {(item.variantColor || item.variantSize) && (
                          <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                            {item.variantColor} {item.variantColor && item.variantSize && '-'} {item.variantSize}
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #eee' }}>{item.qty}</td>
                    <td style={{ padding: '10px', textAlign: 'right', borderBottom: '1px solid #eee' }}>
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                    </td>
                    <td style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #eee' }}>
                      <button onClick={() => handleDeleteItem(item.id)} className="btn-icon text-red" title="Xóa/Hoàn tiền sản phẩm này" style={{background: 'transparent', border: 'none', cursor: 'pointer', padding: '5px'}}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="2" style={{ padding: '15px 10px', textAlign: 'right', fontWeight: 'bold' }}>Tổng cộng:</td>
                  <td style={{ padding: '15px 10px', textAlign: 'right', fontWeight: 'bold', color: 'var(--primary)', fontSize: '1.1rem' }}>
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(calculateTotal(order.orderDetails))}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;


