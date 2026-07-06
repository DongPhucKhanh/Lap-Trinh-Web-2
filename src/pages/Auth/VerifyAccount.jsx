import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, Mail } from 'lucide-react';
import api from '../../services/api';
import './Auth.css';

const VerifyAccount = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  useEffect(() => {
    if (!email) {
      navigate('/register');
    }
  }, [email, navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Auto focus first input
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Only digits

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Only last char
    setOtp(newOtp);

    // Auto move to next
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i];
    }
    setOtp(newOtp);
    if (pasted.length > 0) {
      const focusIndex = Math.min(pasted.length, 5);
      inputRefs.current[focusIndex]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpStr = otp.join('');
    if (otpStr.length !== 6) {
      setError('Vui lòng nhập đủ 6 chữ số OTP.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.post('/auth/verify-account', { email, otp: otpStr });
      setSuccess('Xác thực tài khoản thành công! Đang chuyển hướng...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Mã OTP không hợp lệ hoặc đã hết hạn.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setResendLoading(true);
    setError('');

    try {
      // Use forgot-password/request to resend OTP (reuses the same endpoint logic)
      await api.post('/auth/resend-otp', { email });
      setCountdown(60);
      setOtp(['', '', '', '', '', '']);
      setSuccess('Mã OTP mới đã được gửi đến email của bạn!');
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError('Không thể gửi lại mã OTP. Vui lòng thử lại.');
    } finally {
      setResendLoading(false);
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
              <h1>Bảo Mật Tối Đa<br/>Cho Tài Khoản Của Bạn</h1>
              <p>Chúng tôi ưu tiên bảo vệ thông tin cá nhân của bạn. Vui lòng xác thực email để hoàn tất quá trình đăng ký và bắt đầu trải nghiệm mua sắm.</p>
              
              <div className="auth-hero-badges">
                <div className="hero-badge"><ShieldCheck size={18} color="#60a5fa" /> Bảo Mật 2 Lớp</div>
                <div className="hero-badge"><Mail size={18} color="#fcd34d" /> Xác Minh Nhanh Chóng</div>
              </div>
            </div>

            <div className="auth-hero-stats">
              {/* Optional empty space or other stats */}
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: AUTH CARD */}
        <div className="auth-form-section">
          <div className="auth-premium-card" style={{ maxWidth: '520px' }}>
            <div className="auth-card-header">
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                <div style={{ 
                  background: 'var(--auth-primary-glow)', width: '80px', height: '80px', 
                  borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <ShieldCheck size={40} color="var(--auth-primary)" />
                </div>
              </div>
              <h2>Xác thực tài khoản</h2>
              <p>Nhập mã OTP gồm 6 chữ số đã gửi đến</p>
              <div style={{ 
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                background: '#f8fafc', padding: '10px 16px', borderRadius: '8px', marginTop: '16px',
                border: '1px solid var(--auth-border)'
              }}>
                <Mail size={18} color="var(--auth-text-muted)" />
                <span style={{ fontWeight: 700, color: 'var(--auth-text-dark)' }}>{email}</span>
              </div>
            </div>

            {error && (
              <div className="premium-alert error">
                <ShieldCheck size={18} /> {error}
              </div>
            )}
            
            {success && (
              <div className="premium-alert success">
                <ShieldCheck size={18} /> {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="premium-form">
              <div style={{
                display: 'flex', gap: '12px', justifyContent: 'center', margin: '20px 0 30px'
              }}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => (inputRefs.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onPaste={i === 0 ? handlePaste : undefined}
                    style={{
                      width: '56px', height: '64px',
                      textAlign: 'center', fontSize: '28px', fontWeight: 700,
                      border: '2px solid var(--auth-border)', borderRadius: '12px',
                      outline: 'none', transition: 'all 0.2s',
                      background: digit ? 'var(--auth-primary-glow)' : 'transparent',
                      borderColor: digit ? 'var(--auth-primary)' : 'var(--auth-border)',
                      color: 'var(--auth-primary)',
                      fontFamily: 'inherit',
                      boxShadow: digit ? '0 4px 12px rgba(249, 115, 22, 0.1)' : 'none'
                    }}
                    onFocus={(e) => { 
                      e.target.style.borderColor = 'var(--auth-primary)'; 
                      e.target.style.boxShadow = '0 0 0 4px var(--auth-primary-glow)'; 
                      e.target.style.transform = 'translateY(-2px)';
                    }}
                    onBlur={(e) => { 
                      e.target.style.borderColor = digit ? 'var(--auth-primary)' : 'var(--auth-border)'; 
                      e.target.style.boxShadow = digit ? '0 4px 12px rgba(249, 115, 22, 0.1)' : 'none'; 
                      e.target.style.transform = 'translateY(0)';
                    }}
                  />
                ))}
              </div>

              <button type="submit" className="premium-submit-btn" disabled={loading}>
                {loading ? 'ĐANG XÁC THỰC...' : 'XÁC THỰC TÀI KHOẢN'}
              </button>
            </form>

            <div className="auth-card-footer" style={{ marginTop: '30px' }}>
              <p>Chưa nhận được mã?</p>
              {countdown > 0 ? (
                <span style={{ color: 'var(--auth-text-muted)', fontWeight: 600 }}>Gửi lại sau {countdown}s</span>
              ) : (
                <button
                  onClick={handleResend}
                  disabled={resendLoading}
                  style={{
                    background: 'none', border: 'none', color: 'var(--auth-primary)',
                    fontWeight: 700, cursor: 'pointer', fontSize: '1rem',
                    fontFamily: 'inherit', textDecoration: 'none',
                    display: 'inline-flex', alignItems: 'center', gap: '6px'
                  }}
                  onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
                  onMouseOut={(e) => e.target.style.textDecoration = 'none'}
                >
                  {resendLoading ? 'Đang gửi...' : 'Gửi lại mã OTP'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyAccount;
