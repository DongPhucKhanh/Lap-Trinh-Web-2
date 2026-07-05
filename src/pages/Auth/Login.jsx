import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { LogIn, User, Lock, CheckCircle, Truck, ShieldCheck, Star } from 'lucide-react';
import './Auth.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(username, password);
      navigate('/'); // Redirect to home on success
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Đăng nhập thất bại. Vui lòng kiểm tra lại!');
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
            <img src="https://placehold.co/100x100/transparent/fff?text=👟" alt="sneaker" style={{width: '60px', filter: 'drop-shadow(0 10px 10px rgba(0,0,0,0.3))'}} />
          </div>
          <div className="auth-floating-element auth-float-2">
            <img src="https://placehold.co/100x100/transparent/fff?text=🔥" alt="fire" style={{width: '80px', filter: 'drop-shadow(0 10px 10px rgba(0,0,0,0.3))'}} />
          </div>

          <div className="auth-hero-content">
            <div className="auth-brand">
              <div className="auth-brand-logo">
                <span style={{color: 'white', fontWeight: 900, fontSize: '20px'}}>S</span>
              </div>
              Nova Store
            </div>

            <div className="auth-hero-text">
              <h1>Khám Phá Phong Cách<br/>Trong Từng Bước Chân</h1>
              <p>Tham gia cùng hàng ngàn tín đồ giày thể thao trải nghiệm những mẫu giày thượng hạng giao hàng toàn quốc. Đôi giày yêu thích chỉ cách bạn một cú click.</p>
              
              <div className="auth-hero-badges">
                <div className="hero-badge"><Truck size={18} color="#fcd34d" /> Giao Hàng Toàn Quốc</div>
                <div className="hero-badge"><CheckCircle size={18} color="#10b981" /> Mẫu Mới Mỗi Ngày</div>
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
          <div className="auth-premium-card">
            <div className="auth-card-header">
              <h2>Chào mừng trở lại</h2>
              <p>Vui lòng nhập thông tin để đăng nhập.</p>
            </div>

            {error && (
              <div className="premium-alert error">
                <CheckCircle size={18} /> {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="premium-form-group">
                <div className="premium-input-wrapper">
                  <User size={20} className="premium-input-icon" />
                  <input 
                    type="text" 
                    className="premium-input"
                    placeholder=" " 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required 
                  />
                  <label className="premium-floating-label">Tên đăng nhập</label>
                </div>
              </div>

              <div className="premium-form-group">
                <div className="premium-input-wrapper">
                  <Lock size={20} className="premium-input-icon" />
                  <input 
                    type="password" 
                    className="premium-input"
                    placeholder=" " 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                  />
                  <label className="premium-floating-label">Mật khẩu</label>
                </div>
              </div>

              <div className="auth-premium-options">
                <label className="premium-checkbox">
                  <input type="checkbox" />
                  <span>Ghi nhớ đăng nhập</span>
                </label>
                <Link to="/forgot-password" className="premium-forgot-link">Quên mật khẩu?</Link>
              </div>

              <button type="submit" className="btn-premium-submit" disabled={loading}>
                {loading ? 'Đang xử lý...' : 'Đăng Nhập'}
              </button>
            </form>

            <div className="premium-divider">
              <span>HOẶC</span>
            </div>

            <div className="auth-premium-footer">
              Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
