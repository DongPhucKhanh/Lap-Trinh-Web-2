import React from 'react';
import { useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();
  
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
        <img src="https://ui-avatars.com/api/?name=Admin&background=random" alt="Admin" className="avatar"/>
        <span>Admin</span>
      </div>
    </header>
  );
};

export default Header;
