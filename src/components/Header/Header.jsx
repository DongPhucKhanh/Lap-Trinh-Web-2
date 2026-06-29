import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, LogOut, FileText, Search, Phone, Menu, X, Settings } from 'lucide-react';
import { CartContext } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';
import CartDrawer from '../CartDrawer/CartDrawer';
import api from '../../services/api';
import './Header.css';

const Header = () => {
  const { cartItemCount } = useContext(CartContext);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    // Fetch categories
    api.get('/categories').then(res => setCategories(res.data)).catch(console.error);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    const handleClickOutside = (e) => {
      if (!e.target.closest('.user-dropdown-container')) {
        setDropdownOpen(false);
      }
      if (!e.target.closest('.nav-categories')) {
        setCategoryMenuOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('click', handleClickOutside);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setDropdownOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/product?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <>
      <header className={`header-wrapper ${isScrolled ? 'scrolled' : ''}`}>
        {/* Topbar */}
        <div className="topbar">
          <div className="topbar-container">
            <div className="topbar-left">
              <span className="topbar-item"><Phone size={14} /> Hotline: 1900 1234</span>
              <span className="topbar-item">Giao hàng miễn phí toàn quốc</span>
            </div>
            <div className="topbar-right">
              <Link to="/about" className="topbar-link">Giới thiệu</Link>
              <Link to="/contact" className="topbar-link">Liên hệ</Link>
              <Link to="/user/order" className="topbar-link">Theo dõi đơn hàng</Link>
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div className="main-header">
          <div className="header-container">
            <Link to="/" className="logo">
              <span className="logo-icon">🍟</span>
              <span className="logo-text">SnackHub</span>
            </Link>

            <form className="header-search" onSubmit={handleSearch}>
              <input 
                type="text" 
                placeholder="Tìm kiếm snack, kẹo, nước uống..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="search-btn"><Search size={20} /></button>
            </form>

            <div className="header-actions">
              <button 
                className="icon-action-btn" 
                onClick={() => setIsCartOpen(true)}
              >
                <ShoppingBag size={22} />
                {cartItemCount > 0 && <span className="action-badge">{cartItemCount}</span>}
              </button>

              {user ? (
                <div className="user-dropdown-container">
                  <button 
                    className="user-menu-btn"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                  >
                    <div className="user-avatar" style={user.avatar ? { overflow: 'hidden', padding: 0 } : {}}>
                      {user.avatar ? (
                        <img 
                          src={user.avatar.startsWith('http') ? user.avatar : `http://localhost:8080/uploads/${user.avatar}`} 
                          alt="Avatar" 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                      ) : (
                        user.name ? user.name.charAt(0).toUpperCase() : 'U'
                      )}
                    </div>
                    <span className="user-name-text">{user.name || user.username}</span>
                  </button>
                  {dropdownOpen && (
                    <div className="user-dropdown-menu show">
                      <Link to="/user/profile" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                        <User size={16} /> Hồ sơ cá nhân
                      </Link>
                      <Link to="/user/order" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                        <FileText size={16} /> Đơn mua của tôi
                      </Link>
                      <Link to="/user/settings" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                        <Settings size={16} /> Cài đặt tài khoản
                      </Link>
                      <div className="dropdown-divider"></div>
                      <button onClick={handleLogout} className="logout-btn">
                        <LogOut size={16} /> Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login" className="login-btn">Đăng nhập</Link>
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="nav-bottom">
          <div className="nav-bottom-container">
            <div className="nav-categories">
              <button 
                className="category-menu-btn" 
                onClick={() => setCategoryMenuOpen(!categoryMenuOpen)}
              >
                <Menu size={20} />
                <span>Danh mục sản phẩm</span>
              </button>
              {categoryMenuOpen && (
                <div className="category-dropdown-menu">
                  {categories.map(cat => (
                    <Link 
                      key={cat.id} 
                      to={`/product?category=${cat.id}`} 
                      className="category-dropdown-item"
                      onClick={() => setCategoryMenuOpen(false)}
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <nav className="nav-links">
              <Link to="/" className="nav-link">Trang chủ</Link>
              <Link to="/product" className="nav-link">Tất cả sản phẩm</Link>
              <Link to="/product?sale=true" className="nav-link hot-link">Khuyến mãi 🔥</Link>
              <Link to="/post" className="nav-link">Blog & Tin tức</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};

export default Header;
