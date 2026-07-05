import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer-wrapper">
      <div className="footer-top">
        {/* Column 1: About */}
        <div className="footer-column">
          <h3>Về Nova Store</h3>
          <p>
            Nova Store - Thiên đường giày thể thao dành cho bạn. Chúng tôi cam kết mang đến những 
            sản phẩm tốt nhất, phong cách nhất và đảm bảo chất lượng cùng độ bền.
          </p>
          <div className="footer-socials">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon">FB</a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon">IG</a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-icon">TW</a>
          </div>
        </div>

        {/* Column 2: Links */}
        <div className="footer-column">
          <h3>Chính Sách</h3>
          <ul>
            <li><Link to="/about">Giới thiệu cửa hàng</Link></li>
            <li><Link to="/policy/doi-tra">Chính sách đổi trả</Link></li>
            <li><Link to="/policy/giao-hang">Chính sách giao hàng</Link></li>
            <li><Link to="/policy/dieu-khoan">Điều khoản sử dụng</Link></li>
            <li><Link to="/policy/bao-mat">Bảo mật thông tin</Link></li>
          </ul>
        </div>

        {/* Column 3: Contact */}
        <div className="footer-column">
          <h3>Liên Hệ</h3>
          <ul className="footer-contact">
            <li>
              <MapPin size={18} />
              <span>123 Đường Giày Thể Thao, Quận 1, TP. Hồ Chí Minh</span>
            </li>
            <li>
              <Phone size={18} />
              <span>0123 456 789 (Hotline)</span>
            </li>
            <li>
              <Mail size={18} />
              <span>contact@Nova Store.vn</span>
            </li>
          </ul>
        </div>


      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Nova Store. Mọi mẫu giày đều ở đây!</p>
      </div>
    </footer>
  );
};

export default Footer;
