import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, KeyRound, Lock, ArrowLeft, CheckCircle } from 'lucide-react';
import api from '../../services/api';
import './ForgotPassword.css';
import { toast } from 'react-toastify';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Vui lòng nhập email');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password/request', { email });
      toast.success(res.data.message || 'Mã OTP đã được gửi!');
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) {
      toast.error('Vui lòng nhập mã OTP');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password/verify', { email, otp });
      toast.success(res.data.message || 'Xác thực thành công!');
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Mã OTP không hợp lệ hoặc đã hết hạn.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      toast.error('Vui lòng điền đầy đủ mật khẩu mới');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu nhập lại không khớp!');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password/reset', { email, newPassword });
      toast.success(res.data.message || 'Đổi mật khẩu thành công!');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi đặt lại mật khẩu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card forgot-password-card">
          <button className="back-link-btn" onClick={() => navigate('/login')}>
            <ArrowLeft size={16} /> Quay lại đăng nhập
          </button>
          
          <div className="auth-header text-center">
            <h2>Quên Mật Khẩu</h2>
            <p className="text-muted mt-2">
              {step === 1 && 'Nhập email đã đăng ký để nhận mã OTP khôi phục mật khẩu.'}
              {step === 2 && 'Mã OTP 6 số đã được gửi tới email của bạn.'}
              {step === 3 && 'Nhập mật khẩu mới cho tài khoản của bạn.'}
            </p>
          </div>

          {/* STEP 1: REQUEST OTP */}
          {step === 1 && (
            <form className="auth-form" onSubmit={handleRequestOtp}>
              <div className="form-group">
                <label>Email *</label>
                <div className="input-with-icon">
                  <Mail size={18} className="input-icon" />
                  <input 
                    type="email" 
                    placeholder="VD: user@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <button type="submit" className="btn-primary auth-submit-btn" disabled={loading}>
                {loading ? 'Đang gửi...' : 'GỬI MÃ OTP'}
              </button>
            </form>
          )}

          {/* STEP 2: VERIFY OTP */}
          {step === 2 && (
            <form className="auth-form" onSubmit={handleVerifyOtp}>
              <div className="form-group">
                <label>Mã OTP (6 số) *</label>
                <div className="input-with-icon">
                  <KeyRound size={18} className="input-icon" />
                  <input 
                    type="text" 
                    placeholder="VD: 123456" 
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    required
                  />
                </div>
              </div>
              <button type="submit" className="btn-primary auth-submit-btn" disabled={loading}>
                {loading ? 'Đang xác thực...' : 'XÁC THỰC OTP'}
              </button>
            </form>
          )}

          {/* STEP 3: RESET PASSWORD */}
          {step === 3 && (
            <form className="auth-form" onSubmit={handleResetPassword}>
              <div className="form-group">
                <label>Mật khẩu mới *</label>
                <div className="input-with-icon">
                  <Lock size={18} className="input-icon" />
                  <input 
                    type="password" 
                    placeholder="Nhập mật khẩu mới" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Nhập lại mật khẩu mới *</label>
                <div className="input-with-icon">
                  <Lock size={18} className="input-icon" />
                  <input 
                    type="password" 
                    placeholder="Xác nhận mật khẩu" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <button type="submit" className="btn-primary auth-submit-btn" disabled={loading}>
                {loading ? 'Đang lưu...' : 'HOÀN TẤT ĐỔI MẬT KHẨU'}
              </button>
            </form>
          )}

          {/* Progress Indicators */}
          <div className="step-indicators mt-4">
            <div className={`step-dot ${step >= 1 ? 'active' : ''}`}></div>
            <div className={`step-dot ${step >= 2 ? 'active' : ''}`}></div>
            <div className={`step-dot ${step >= 3 ? 'active' : ''}`}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
