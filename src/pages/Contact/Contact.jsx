import React, { useState, useContext } from 'react';
import { MapPin, Phone, Mail, Send } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import './Contact.css';

const Contact = () => {
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    title: '',
    content: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');

    const payload = {
      ...formData,
      ...(user && { user: { id: user.id } })
    };

    try {
      await api.post('/contacts', payload);
      setSuccess('Cảm ơn bạn! Lời nhắn của bạn đã được gửi thành công.');
      setFormData(prev => ({ ...prev, title: '', content: '' })); // Clear only message fields
    } catch (err) {
      console.error(err);
      setError('Có lỗi xảy ra, vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page">
      <div className="container">
        <div className="contact-header">
          <h1>Liên hệ với chúng tôi</h1>
          <p>Bạn có câu hỏi hoặc cần hỗ trợ? Đừng ngần ngại liên hệ với Nova Store nhé!</p>
        </div>

        <div className="contact-grid">
          {/* Info Side */}
          <div className="contact-info-side">
            <div className="info-card">
              <div className="info-icon"><MapPin size={24} /></div>
              <div>
                <h3>Địa chỉ cửa hàng</h3>
                <p>123 Đường Nguyễn Trãi, Phường Bến Thành, Quận 1, TP.HCM</p>
              </div>
            </div>
            
            <div className="info-card">
              <div className="info-icon"><Phone size={24} /></div>
              <div>
                <h3>Hotline hỗ trợ</h3>
                <p>1900 1234 (Từ 8h - 22h hàng ngày)</p>
              </div>
            </div>
            
            <div className="info-card">
              <div className="info-icon"><Mail size={24} /></div>
              <div>
                <h3>Email liên hệ</h3>
                <p>support@Nova Store.vn</p>
              </div>
            </div>

            <div className="map-container">
              {/* Dummy Map for Visuals */}
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.5138139598285!2d106.69894811526027!3d10.771891992324203!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f40a3b49e59%3A0xa1bd14e483a6028c!2zQ2jhu6MgQuG6v24gVGjDoG5o!5e0!3m2!1svi!2s!4v1680150965042!5m2!1svi!2s" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Google Maps"
              ></iframe>
            </div>
          </div>

          {/* Form Side */}
          <div className="contact-form-side">
            <h2>Gửi lời nhắn cho Nova Store</h2>
            {success && <div className="alert-success">{success}</div>}
            {error && <div className="alert-error">{error}</div>}

            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-group">
                <label>Họ và tên *</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Nhập họ và tên của bạn" />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email *</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="Nhập địa chỉ email" />
                </div>
                <div className="form-group">
                  <label>Số điện thoại</label>
                  <input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="Nhập số điện thoại" />
                </div>
              </div>

              <div className="form-group">
                <label>Tiêu đề *</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} required placeholder="Bạn cần hỗ trợ vấn đề gì?" />
              </div>

              <div className="form-group">
                <label>Nội dung *</label>
                <textarea name="content" value={formData.content} onChange={handleChange} required placeholder="Nhập chi tiết lời nhắn của bạn ở đây..." rows="5"></textarea>
              </div>

              <button type="submit" className="btn-send-msg" disabled={loading}>
                <Send size={20} /> {loading ? 'ĐANG GỬI...' : 'GỬI LỜI NHẮN'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
