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
    <div className="auth-page">
      <div className="auth-container" style={{ maxWidth: '480px' }}>
        <div className="auth-header">
          <div className="auth-icon-wrapper">
            <ShieldCheck size={32} color="#ff6b6b" />
          </div>
          <h2>Xác thực tài khoản</h2>
          <p>Nhập mã OTP gồm 6 chữ số đã gửi đến</p>
          <div style={{ 
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            background: '#f1f5f9', padding: '8px 16px', borderRadius: '8px', marginTop: '10px'
          }}>
            <Mail size={16} color="#64748b" />
            <span style={{ fontWeight: 700, color: '#334155' }}>{email}</span>
          </div>
        </div>

        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">{success}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div style={{
            display: 'flex', gap: '10px', justifyContent: 'center', margin: '10px 0 20px'
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
                  width: '52px', height: '60px',
                  textAlign: 'center', fontSize: '24px', fontWeight: 700,
                  border: '2px solid #e2e8f0', borderRadius: '12px',
                  outline: 'none', transition: 'all 0.2s',
                  background: digit ? '#fff5f5' : 'white',
                  borderColor: digit ? '#ff6b6b' : '#e2e8f0',
                  color: '#1a1a2e',
                  fontFamily: 'inherit'
                }}
                onFocus={(e) => { e.target.style.borderColor = '#ff6b6b'; e.target.style.boxShadow = '0 0 0 3px rgba(255,107,107,0.15)'; }}
                onBlur={(e) => { e.target.style.borderColor = digit ? '#ff6b6b' : '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
              />
            ))}
          </div>

          <button type="submit" className="btn-auth-submit" disabled={loading}>
            {loading ? 'ĐANG XÁC THỰC...' : 'XÁC THỰC TÀI KHOẢN'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', color: '#64748b', fontSize: '0.95rem' }}>
          Chưa nhận được mã?{' '}
          {countdown > 0 ? (
            <span style={{ color: '#94a3b8' }}>Gửi lại sau {countdown}s</span>
          ) : (
            <button
              onClick={handleResend}
              disabled={resendLoading}
              style={{
                background: 'none', border: 'none', color: '#ff6b6b',
                fontWeight: 700, cursor: 'pointer', fontSize: 'inherit',
                fontFamily: 'inherit', textDecoration: 'underline'
              }}
            >
              {resendLoading ? 'Đang gửi...' : 'Gửi lại mã OTP'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyAccount;
