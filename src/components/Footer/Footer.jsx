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
          <h3>Về SnackHub</h3>
          <p>
            SnackHub - Thiên đường ăn vặt dành cho bạn. Chúng tôi cam kết mang đến những 
            sản phẩm chất lượng nhất, ngon nhất và đảm bảo vệ sinh an toàn thực phẩm.
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
              <span>123 Đường Ăn Vặt, Quận Ngon Miệng, TP. Hồ Chí Minh</span>
            </li>
            <li>
              <Phone size={18} />
              <span>0123 456 789 (Hotline)</span>
            </li>
            <li>
              <Mail size={18} />
              <span>contact@snackhub.vn</span>
            </li>
          </ul>
        </div>

        {/* Column 4: Map */}
        <div className="footer-column">
          <h3>Bản Đồ</h3>
          <div className="map-container">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.669658423702!2d106.6662753147489!3d10.75992006243956!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f1b7c3ed289%3A0xa06651894598e403!2zMTIzIMSQxrDhu51uZyDEg24gVuG6t3QsIFBoxrDhu51uZyA1LCBRdeG6rW4gMTAsIFRow6BuaCBwaOG7kSBI4buTIENow60gTWluaA!5e0!3m2!1svi!2s!4v1622378345479!5m2!1svi!2s" 
              allowFullScreen="" 
              loading="lazy" 
              title="Google Maps"
            ></iframe>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} SnackHub. Mọi món ngon đều ở đây!</p>
      </div>
    </footer>
  );
};

export default Footer;
