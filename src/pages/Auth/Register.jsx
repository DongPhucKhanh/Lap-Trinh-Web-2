import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Lock, Mail, Phone, Users, CheckCircle, Truck, ShieldCheck, Star } from 'lucide-react';
import api from '../../services/api';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    phone: '',
    gender: 'Nam'
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu nhập lại không khớp!');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/auth/register', {
        name: formData.name,
        username: formData.username,
        password: formData.password,
        email: formData.email,
        phone: formData.phone,
        gender: formData.gender
      });
      
      setSuccess('Đăng ký thành công! Vui lòng kiểm tra email để lấy mã OTP...');
      setTimeout(() => {
        navigate('/verify-account', { state: { email: formData.email } });
      }, 1500);
      
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Đăng ký thất bại. Vui lòng kiểm tra lại thông tin!');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-premium">
      <div className="auth-split-layout">
        
        {/* LEFT SIDE: STORYTELLING HERO */}
        <div className="auth-hero-section">
          <div className="auth-hero-bg"></div>
          <div className="auth-hero-overlay"></div>
          
          <div className="auth-floating-element auth-float-1">
            <img src="https://placehold.co/100x100/transparent/fff?text=🍿" alt="snack" style={{width: '60px', filter: 'drop-shadow(0 10px 10px rgba(0,0,0,0.3))'}} />
          </div>
          <div className="auth-floating-element auth-float-2">
            <img src="https://placehold.co/100x100/transparent/fff?text=🍫" alt="snack" style={{width: '80px', filter: 'drop-shadow(0 10px 10px rgba(0,0,0,0.3))'}} />
          </div>

          <div className="auth-hero-content">
            <div className="auth-brand">
              <div className="auth-brand-logo">
                <span style={{color: 'white', fontWeight: 900, fontSize: '20px'}}>S</span>
              </div>
              SnackHub
            </div>

            <div className="auth-hero-text">
              <h1>Tham Gia Kỷ Nguyên<br/>Ăn Vặt Của Chúng Tôi</h1>
              <p>Trải nghiệm dịch vụ giao đồ ăn vặt cao cấp nhất. Sản phẩm được tuyển chọn, giao hàng siêu tốc và chất lượng tuyệt hảo.</p>
              
              <div className="auth-hero-badges">
                <div className="hero-badge"><Truck size={18} color="#fcd34d" /> Giao Hàng Toàn Quốc</div>
                <div className="hero-badge"><CheckCircle size={18} color="#10b981" /> Tươi Ngon Mỗi Ngày</div>
                <div className="hero-badge"><ShieldCheck size={18} color="#60a5fa" /> Thanh Toán An Toàn</div>
              </div>
            </div>

            <div className="auth-hero-stats">
              <div className="stat-item">
                <h3>500+</h3>
                <p>Sản Phẩm</p>
              </div>
              <div className="stat-item">
                <h3>12k+</h3>
                <p>Khách Hàng</p>
              </div>
              <div className="stat-item">
                <h3 style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
                  4.9 <Star size={24} fill="#fcd34d" color="#fcd34d" />
                </h3>
                <p>Đánh Giá Tốt</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: AUTH CARD */}
        <div className="auth-form-section">
          <div className="auth-premium-card" style={{ maxWidth: '600px', padding: '2.5rem' }}>
            <div className="auth-card-header" style={{ marginBottom: '2rem' }}>
              <h2>Tạo Tài Khoản</h2>
              <p>Gia nhập cộng đồng yêu ẩm thực ngay hôm nay.</p>
            </div>

            {error && (
              <div className="premium-alert error">
                <CheckCircle size={18} /> {error}
              </div>
            )}
            
            {success && (
              <div className="premium-alert success">
                <CheckCircle size={18} /> {success}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              
              <div className="premium-form-row">
                <div className="premium-form-group">
                  <div className="premium-input-wrapper">
                    <User size={20} className="premium-input-icon" />
                    <input type="text" className="premium-input" name="name" placeholder=" " value={formData.name} onChange={handleChange} required />
                    <label className="premium-floating-label">Họ và tên</label>
                  </div>
                </div>
                <div className="premium-form-group">
                  <div className="premium-input-wrapper">
                    <User size={20} className="premium-input-icon" />
                    <input type="text" className="premium-input" name="username" placeholder=" " value={formData.username} onChange={handleChange} required />
                    <label className="premium-floating-label">Tên đăng nhập</label>
                  </div>
                </div>
              </div>

              <div className="premium-form-group">
                <div className="premium-input-wrapper">
                  <Mail size={20} className="premium-input-icon" />
                  <input type="email" className="premium-input" name="email" placeholder=" " value={formData.email} onChange={handleChange} required />
                  <label className="premium-floating-label">Địa chỉ Email</label>
                </div>
              </div>

              <div className="premium-form-row">
                <div className="premium-form-group">
                  <div className="premium-input-wrapper">
                    <Phone size={20} className="premium-input-icon" />
                    <input type="text" className="premium-input" name="phone" placeholder=" " value={formData.phone} onChange={handleChange} required />
                    <label className="premium-floating-label">Số điện thoại</label>
                  </div>
                </div>
                <div className="premium-form-group">
                  <div className="premium-input-wrapper">
                    <Users size={20} className="premium-input-icon" />
                    <select className="premium-input" name="gender" value={formData.gender} onChange={handleChange}>
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                      <option value="Khác">Khác</option>
                    </select>
                    {/* Select doesn't trigger placeholder-shown reliably in all browsers, so we keep label lifted */}
                    <label className="premium-floating-label" style={{ transform: 'translateY(-22px) scale(0.75)', color: 'var(--auth-primary)', fontWeight: 600 }}>Giới tính</label>
                  </div>
                </div>
              </div>

              <div className="premium-form-row">
                <div className="premium-form-group">
                  <div className="premium-input-wrapper">
                    <Lock size={20} className="premium-input-icon" />
                    <input type="password" className="premium-input" name="password" placeholder=" " value={formData.password} onChange={handleChange} required />
                    <label className="premium-floating-label">Mật khẩu</label>
                  </div>
                </div>
                <div className="premium-form-group">
                  <div className="premium-input-wrapper">
                    <Lock size={20} className="premium-input-icon" />
                    <input type="password" className="premium-input" name="confirmPassword" placeholder=" " value={formData.confirmPassword} onChange={handleChange} required />
                    <label className="premium-floating-label">Nhập lại mật khẩu</label>
                  </div>
                </div>
              </div>

              <button type="submit" className="btn-premium-submit" disabled={loading} style={{ marginTop: '1.5rem' }}>
                {loading ? 'Đang xử lý...' : 'Đăng Ký Tài Khoản'}
              </button>
            </form>

            <div className="premium-divider">
              <span>HOẶC</span>
            </div>

            <div className="auth-premium-footer">
              Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link>
            </div>
            <div className="auth-premium-footer" style={{ marginTop: '1rem', fontSize: '0.8rem' }}>
              Bằng việc đăng ký, bạn đồng ý với <a href="#">Điều khoản</a> và <a href="#">Chính sách bảo mật</a> của chúng tôi.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Register;
