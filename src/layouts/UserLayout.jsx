import React, { useContext, useEffect, useState } from 'react';
import { Outlet, Navigate, useLocation, Link } from 'react-router-dom';
import { User, FileText, Settings, LogOut, Heart } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import './UserLayout.css';

const UserLayout = () => {
  const { user, loading, logout } = useContext(AuthContext);
  const location = useLocation();
  const [animationClass, setAnimationClass] = useState('fade-enter');

  useEffect(() => {
    setAnimationClass('fade-enter');
    const timer = setTimeout(() => {
      setAnimationClass('fade-enter-active');
    }, 50);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  if (loading) return <div className="loader"></div>;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const navItems = [
    { path: '/user/profile', name: 'Hồ sơ cá nhân', icon: <User size={20} /> },
    { path: '/user/wishlist', name: 'Sản phẩm yêu thích', icon: <Heart size={20} /> },
    { path: '/user/order', name: 'Đơn mua của tôi', icon: <FileText size={20} /> },
    { path: '/user/settings', name: 'Cài đặt tài khoản', icon: <Settings size={20} /> },
  ];

  return (
    <div className="user-layout-wrapper">
      <Header />
      <main className="user-main-content">
        <div className="user-container">
          {/* Sidebar */}
          <aside className="user-sidebar">
            <div className="user-sidebar-header">
              <div className="user-avatar-large">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="user-brief">
                <h4>{user.name || user.username}</h4>
                <p>Khách hàng thành viên</p>
              </div>
            </div>
            
            <nav className="user-nav">
              {navItems.map((item) => (
                <Link 
                  key={item.path}
                  to={item.path} 
                  className={`user-nav-item ${location.pathname === item.path ? 'active' : ''}`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              ))}
              <button className="user-nav-item logout-btn-sidebar" onClick={() => logout()}>
                <LogOut size={20} />
                <span>Đăng xuất</span>
              </button>
            </nav>
          </aside>

          {/* Main View Area */}
          <section className="user-view-area">
            <div className={`tab-content-wrapper ${animationClass}`}>
              <Outlet />
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default UserLayout;
