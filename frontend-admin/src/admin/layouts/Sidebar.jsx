import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, Users, Settings, LogOut, Tag, Bookmark, FileText, ShoppingCart, MessageSquare, Image, Menu } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    { path: '/admin', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { path: '/admin/product', icon: <Package size={20} />, label: 'Sản Phẩm' },
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
        <div className="admin-logo">🛡️ AdminPanel</div>
      </div>
      <nav className="sidebar-nav">
        {navItems.map(item => (
          <Link 
            key={item.path} 
            to={item.path} 
            className={`nav-item ${location.pathname.startsWith(item.path) && (item.path !== '/admin' || location.pathname === '/admin') ? 'active' : ''}`}
          >
            {item.icon} {item.label}
          </Link>
        ))}
      </nav>
      <div className="sidebar-footer">
        <button className="logout-btn">
          <LogOut size={20} /> Đăng Xuất
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
