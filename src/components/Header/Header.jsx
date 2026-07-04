import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, LogOut, FileText, Search, Phone, Menu, X, Settings, Footprints } from 'lucide-react';
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
  const [isHidden, setIsHidden] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(120);
  const headerRef = React.useRef(null);
  const lastScrollY = React.useRef(0);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.offsetHeight);
    }
    // Fetch categories
    api.get('/categories').then(res => setCategories(res.data)).catch(console.error);

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Update scrolled state (to trigger sticky UI)
      setIsScrolled(currentScrollY > 50);
      
      // Handle hide/show based on scroll direction
      if (currentScrollY > lastScrollY.current && currentScrollY > 150) {
        // Scrolling down and past the threshold -> hide
        setIsHidden(true);
      } else if (currentScrollY < lastScrollY.current) {
        // Scrolling up -> show
        setIsHidden(false);
      }
      
      lastScrollY.current = currentScrollY;
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
      {isScrolled && <div style={{ height: `${headerHeight}px` }} />}
      <header ref={headerRef} className={`header-wrapper ${isScrolled ? 'scrolled' : ''} ${isHidden ? 'hidden' : ''}`}>
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
              <Footprints className="logo-icon" size={28} color="var(--primary)" />
              <span className="logo-text">SneakerHub</span>
            </Link>

            <form className="header-search" onSubmit={handleSearch}>
              <input 
                type="text" 
                placeholder="Tìm kiếm giày thể thao, sneaker..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="search-btn"><Search size={20} /></button>
            </form>

            <div className="header-actions">
              <label className="theme-switch" title="Chế độ Sáng/Tối">
                <input 
                  type="checkbox" 
                  className="theme-switch__checkbox" 
                  checked={isDarkMode} 
                  onChange={() => setIsDarkMode(!isDarkMode)} 
                />
                <div className="theme-switch__container">
                  <div className="theme-switch__clouds"></div>
                  <div className="theme-switch__stars-container">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 55" fill="none">
                      <path fillRule="evenodd" clipRule="evenodd" d="M135.831 3.00688C135.055 3.85027 134.111 4.29946 133 4.35447C134.111 4.40947 135.055 4.85867 135.831 5.71123C136.607 6.55462 136.996 7.56303 136.996 8.72727C136.996 7.95722 137.172 7.25134 137.525 6.59129C137.886 5.93124 138.372 5.39954 138.98 5.00535C139.598 4.60199 140.268 4.39114 141 4.35447C139.88 4.2903 138.936 3.85027 138.16 3.00688C137.384 2.16348 136.996 1.16425 136.996 0C136.996 1.16425 136.607 2.16348 135.831 3.00688ZM31 23.3545C32.1114 23.2995 33.0551 22.8503 33.8313 22.0069C34.6075 21.1635 34.9956 20.1642 34.9956 19C34.9956 20.1642 35.3837 21.1635 36.1599 22.0069C36.9361 22.8503 37.8798 23.2903 39 23.3545C38.2679 23.3911 37.5976 23.602 36.9802 24.0053C36.3716 24.3995 35.8864 24.9312 35.5248 25.5913C35.172 26.2513 34.9956 26.9572 34.9956 27.7273C34.9956 26.563 34.6075 25.5546 33.8313 24.7112C33.0551 23.8587 32.1114 23.4095 31 23.3545ZM0 36.3545C1.11136 36.2995 2.05513 35.8503 2.83131 35.0069C3.6075 34.1635 3.99559 33.1642 3.99559 32C3.99559 33.1642 4.38368 34.1635 5.15987 35.0069C5.93605 35.8503 6.87982 36.2903 8 36.3545C7.26792 36.3911 6.59757 36.602 5.98015 37.0053C5.37155 37.3995 4.88644 37.9312 4.52481 38.5913C4.172 39.2513 3.99559 39.9572 3.99559 40.7273C3.99559 39.563 3.6075 38.5546 2.83131 37.7112C2.05513 36.8587 1.11136 36.4095 0 36.3545ZM56.8313 24.0069C56.0551 24.8503 55.1114 25.2995 54 25.3545C55.1114 25.4095 56.0551 25.8587 56.8313 26.7112C57.6075 27.5546 57.9956 28.563 57.9956 29.7273C57.9956 28.9572 58.172 28.2513 58.5248 27.5913C58.8864 26.9312 59.3716 26.3995 59.9802 26.0053C60.5976 25.602 61.2679 25.3911 62 25.3545C60.8798 25.2903 59.9361 24.8503 59.1599 24.0069C58.3837 23.1635 57.9956 22.1642 57.9956 21C57.9956 22.1642 57.6075 23.1635 56.8313 24.0069ZM81 25.3545C82.1114 25.2995 83.0551 24.8503 83.8313 24.0069C84.6075 23.1635 84.9956 22.1642 84.9956 21C84.9956 22.1642 85.3837 23.1635 86.1599 24.0069C86.9361 24.8503 87.8798 25.2903 89 25.3545C88.2679 25.3911 87.5976 25.602 86.9802 26.0053C86.3716 26.3995 85.8864 26.9312 85.5248 27.5913C85.172 28.2513 84.9956 28.9572 84.9956 29.7273C84.9956 28.563 84.6075 27.5546 83.8313 26.7112C83.0551 25.8587 82.1114 25.4095 81 25.3545ZM136 36.3545C137.111 36.2995 138.055 35.8503 138.831 35.0069C139.607 34.1635 139.996 33.1642 139.996 32C139.996 33.1642 140.384 34.1635 141.16 35.0069C141.936 35.8503 142.88 36.2903 144 36.3545C143.268 36.3911 142.598 36.602 141.98 37.0053C141.372 37.3995 140.886 37.9312 140.525 38.5913C140.172 39.2513 139.996 39.9572 139.996 40.7273C139.996 39.563 139.607 38.5546 138.831 37.7112C138.055 36.8587 137.111 36.4095 136 36.3545ZM101.831 49.0069C101.055 49.8503 100.111 50.2995 99 50.3545C100.111 50.4095 101.055 50.8587 101.831 51.7112C102.607 52.5546 102.996 53.563 102.996 54.7273C102.996 53.9572 103.172 53.2513 103.525 52.5913C103.886 51.9312 104.372 51.3995 104.98 51.0053C105.598 50.602 106.268 50.3911 107 50.3545C105.88 50.2903 104.936 49.8503 104.16 49.0069C103.384 48.1635 102.996 47.1642 102.996 46C102.996 47.1642 102.607 48.1635 101.831 49.0069Z" fill="currentColor"></path>
                    </svg>
                  </div>
                  <div className="theme-switch__circle-container">
                    <div className="theme-switch__sun-moon-container">
                      <div className="theme-switch__moon">
                        <div className="theme-switch__spot"></div>
                        <div className="theme-switch__spot"></div>
                        <div className="theme-switch__spot"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </label>

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
