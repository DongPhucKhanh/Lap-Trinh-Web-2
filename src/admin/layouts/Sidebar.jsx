import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, Users, Settings, LogOut, Tag, Bookmark, FileText, ShoppingCart, MessageSquare, Image, Menu, Box } from 'lucide-react';
import orderService from '../services/orderService';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const fetchPendingOrders = () => {
      orderService.getAll().then(res => {
        // Lấy danh sách các đơn đang chờ xác nhận
        const pendingOrders = res.data.filter(order => order.status === 0);
        
        // Tìm ID đơn hàng lớn nhất (mới nhất) trong danh sách chờ
        const maxPendingId = pendingOrders.length > 0 ? Math.max(...pendingOrders.map(o => o.id)) : 0;
        
        // Nếu admin đang đứng ở trang Đơn hàng, đánh dấu là đã xem tới ID mới nhất
        if (location.pathname.startsWith('/admin/order')) {
          localStorage.setItem('lastViewedOrderId', maxPendingId);
        }

        const lastViewedId = parseInt(localStorage.getItem('lastViewedOrderId') || '0', 10);
        
        // Chỉ đếm những đơn hàng chờ xác nhận có ID lớn hơn ID đã xem cuối cùng
        const newUnseenCount = pendingOrders.filter(o => o.id > lastViewedId).length;
        
        setPendingCount(newUnseenCount);
      }).catch(err => console.error("Error fetching pending orders for sidebar", err));
    };

    fetchPendingOrders();
    const intervalId = setInterval(fetchPendingOrders, 3000);
    return () => clearInterval(intervalId);
  }, [location.pathname]);

  const handleLogout = () => {
    if (window.confirm('Bạn có chắc chắn muốn đăng xuất?')) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminInfo');
      navigate('/login');
    }
  };

  const navItems = [
    { path: '/admin', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { path: '/admin/product', icon: <Package size={20} />, label: 'Sản Phẩm' },
    { path: '/admin/inventory', icon: <Box size={20} />, label: 'Quản Lý Kho' },
    { path: '/admin/category', icon: <Bookmark size={20} />, label: 'Danh Mục' },
    { path: '/admin/brand', icon: <Tag size={20} />, label: 'Thương Hiệu' },
    { path: '/admin/order', icon: <ShoppingCart size={20} />, label: 'Đơn Hàng' },
    { path: '/admin/customer', icon: <Users size={20} />, label: 'Khách Hàng' },
    { path: '/admin/banner', icon: <Image size={20} />, label: 'Banner' },
    { path: '/admin/post', icon: <FileText size={20} />, label: 'Bài Viết' },
    { path: '/admin/topic', icon: <MessageSquare size={20} />, label: 'Chủ Đề' },
    { path: '/admin/contact', icon: <MessageSquare size={20} />, label: 'Liên Hệ' },
    { path: '/admin/user', icon: <Users size={20} />, label: 'Người Dùng' },
    { path: '/admin/menu', icon: <Menu size={20} />, label: 'Menu' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="admin-logo">🛡️ Trang Quản Trị</div>
      </div>
      <nav className="sidebar-nav">
        {navItems.map(item => (
          <Link 
            key={item.path} 
            to={item.path} 
            className={`nav-item ${location.pathname.startsWith(item.path) && (item.path !== '/admin' || location.pathname === '/admin') ? 'active' : ''}`}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {item.icon} {item.label}
            </div>
            {item.path === '/admin/order' && pendingCount > 0 && (
              <span style={{
                background: '#ef4444', color: 'white', fontSize: '12px', fontWeight: 'bold',
                padding: '2px 8px', borderRadius: '12px', marginLeft: 'auto'
              }}>
                {pendingCount}
              </span>
            )}
          </Link>
        ))}
      </nav>
      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={20} /> Đăng Xuất
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

