import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Lấy thông tin admin từ localStorage
  const adminInfo = JSON.parse(localStorage.getItem('adminInfo') || '{}');
  const adminName = adminInfo.name || adminInfo.username || 'Admin';

  const handleLogout = () => {
    if (window.confirm('Bạn có chắc chắn muốn đăng xuất?')) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminInfo');
      navigate('/login');
    }
  };

  // Tạo breadcrumb dựa trên path
  const pathParts = location.pathname.split('/').filter(p => p !== '');
  let breadcrumb = 'Trang chủ';
  if (pathParts.length > 1) {
    breadcrumb = `Trang chủ / ${pathParts[1].charAt(0).toUpperCase() + pathParts[1].slice(1)}`;
  }

  return (
    <header className="top-header">
      <div className="breadcrumb">{breadcrumb}</div>
      <div className="admin-profile">
        <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(adminName)}&background=random`} alt="Admin" className="avatar"/>
        <span>{adminName}</span>
        <button 
          onClick={handleLogout} 
          title="Đăng xuất"
          style={{
            background: 'none', border: '1px solid #e2e8f0', borderRadius: '8px',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
            padding: '6px 14px', marginLeft: '12px', color: '#ef4444',
            fontSize: '0.85rem', fontWeight: 600, fontFamily: 'inherit',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.borderColor = '#fca5a5'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
        >
          <LogOut size={16} /> Đăng xuất
        </button>
      </div>
    </header>
  );
};

export default Header;

