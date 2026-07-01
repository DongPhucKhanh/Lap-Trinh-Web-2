import React, { useState, useEffect, useContext } from 'react';
import { Package, Search, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { CartContext } from '../../context/CartContext';
import api from '../../services/api';
import './OrderHistory.css';

const OrderHistory = () => {
  const { user } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user && user.id) {
      api.get(`/orders/user/${user.id}`)
        .then(res => {
          setOrders(res.data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [user]);

  const filteredOrders = orders.filter(o => {
    // Status filter
    let statusMatch = true;
    if (filter === 'pending') statusMatch = [0, 1, 2].includes(o.status);
    if (filter === 'delivering') statusMatch = o.status === 3;
    if (filter === 'completed') statusMatch = [4, 5].includes(o.status);
    if (filter === 'cancelled') statusMatch = [6, 7].includes(o.status);
    
    // Search filter
    let searchMatch = true;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const idMatch = o.id.toString().includes(term);
      const productMatch = o.orderDetails && o.orderDetails.some(detail => 
        detail.product?.name?.toLowerCase().includes(term)
      );
      searchMatch = idMatch || productMatch;
    }

    return statusMatch && searchMatch;
  });

  const getStatusBadge = (status) => {
    switch(status) {
      case 0: return <span className="status-badge" style={{background: '#fef3c7', color: '#d97706'}}>Chờ xác nhận</span>;
      case 1: return <span className="status-badge" style={{background: '#e0f2fe', color: '#0284c7'}}>Đã xác nhận</span>;
      case 2: return <span className="status-badge" style={{background: '#f3e8ff', color: '#7e22ce'}}>Đang chuẩn bị</span>;
      case 3: return <span className="status-badge" style={{background: '#ffedd5', color: '#c2410c'}}>Đang giao</span>;
      case 4: return <span className="status-badge" style={{background: '#dcfce7', color: '#15803d'}}>Đã giao</span>;
      case 5: return <span className="status-badge success">Hoàn thành</span>;
      case 6: return <span className="status-badge danger">Đã hủy</span>;
      case 7: return <span className="status-badge" style={{background: '#fecaca', color: '#991b1b'}}>Hoàn tiền</span>;
      default: return <span className="status-badge">Không xác định</span>;
    }
  };

  const calculateTotal = (orderDetails) => {
    if (!orderDetails) return 0;
    return orderDetails.reduce((sum, item) => sum + (item.price * item.qty), 0);
  };

  const handleReorder = (order) => {
    if (order.orderDetails) {
      order.orderDetails.forEach(detail => {
        if (detail.product) {
          addToCart(detail.product, detail.qty);
        }
      });
      navigate('/cart');
    }
  };

  return (
    <div className="order-history-page">
      <div className="order-tabs">
        <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>Tất cả</button>
        <button className={filter === 'pending' ? 'active' : ''} onClick={() => setFilter('pending')}>Chờ xử lý</button>
        <button className={filter === 'delivering' ? 'active' : ''} onClick={() => setFilter('delivering')}>Đang giao</button>
        <button className={filter === 'completed' ? 'active' : ''} onClick={() => setFilter('completed')}>Hoàn thành</button>
        <button className={filter === 'cancelled' ? 'active' : ''} onClick={() => setFilter('cancelled')}>Đã hủy / Hoàn tiền</button>
      </div>

      <div className="order-search">
        <Search size={18} />
        <input 
          type="text" 
          placeholder="Bạn có thể tìm kiếm theo Mã đơn hàng hoặc Tên Sản phẩm" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="loader"></div>
      ) : filteredOrders.length === 0 ? (
        <div className="empty-orders">
          <Package size={60} />
          <p>Chưa có đơn hàng nào</p>
        </div>
      ) : (
        <div className="order-list">
          {filteredOrders.map(order => {
            const orderTotal = calculateTotal(order.orderDetails);
            
            return (
              <div key={order.id} className="order-card">
                <div className="order-card-header">
                  <span className="order-id">Mã đơn: #{order.id}</span>
                  <span className="order-date">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
                  <div className="order-status-right">
                    {getStatusBadge(order.status)}
                  </div>
                </div>
                
                <div className="order-items">
                  {order.orderDetails && order.orderDetails.map((detail, idx) => (
                    <div key={idx} className="order-item">
                      <div className="oi-img">
                        <img 
                          src={detail.product?.image ? (detail.product.image.startsWith('http') ? detail.product.image : `http://localhost:8080/uploads/${detail.product.image}`) : 'https://placehold.co/80x80/f4f7f6/636e72'} 
                          alt={detail.product?.name} 
                        />
                      </div>
                      <div className="oi-info">
                        <h4>{detail.product?.name || 'Sản phẩm'}</h4>
                        <p>Đơn giá: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(detail.price)}</p>
                        <span className="oi-qty">x{detail.qty}</span>
                      </div>
                      <div className="oi-price">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(detail.price * detail.qty)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="order-card-footer">
                  <div className="order-total">
                    Thành tiền: <strong>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(orderTotal)}</strong>
                  </div>
                  <div className="order-actions">
                    <button className="btn-outline" onClick={() => handleReorder(order)}>Mua lại</button>
                    <Link to={`/user/order/${order.id}`} className="btn-primary">Xem chi tiết</Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
