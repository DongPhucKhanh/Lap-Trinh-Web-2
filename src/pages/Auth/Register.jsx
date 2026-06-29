import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, User, Lock, Mail, Phone, Users } from 'lucide-react';
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
      
      setSuccess('Đăng ký thành công! Đang chuyển hướng...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
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
    <div className="auth-page">
      <div className="auth-container" style={{ maxWidth: '600px' }}>
        <div className="auth-header">
          <div className="auth-icon-wrapper">
            <UserPlus size={32} color="#ff6b6b" />
          </div>
          <h2>Tạo tài khoản mới</h2>
          <p>Gia nhập cộng đồng SnackHub ngay hôm nay!</p>
        </div>

        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">{success}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="auth-input-group">
              <User size={20} className="input-icon" />
              <input type="text" name="name" placeholder="Họ và tên *" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="auth-input-group">
              <User size={20} className="input-icon" />
              <input type="text" name="username" placeholder="Tên đăng nhập *" value={formData.username} onChange={handleChange} required />
            </div>
          </div>

          <div className="auth-input-group">
            <Mail size={20} className="input-icon" />
            <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} />
          </div>

          <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="auth-input-group">
              <Phone size={20} className="input-icon" />
              <input type="text" name="phone" placeholder="Số điện thoại" value={formData.phone} onChange={handleChange} />
            </div>
            <div className="auth-input-group">
              <Users size={20} className="input-icon" />
              <select name="gender" value={formData.gender} onChange={handleChange}>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
          </div>

          <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="auth-input-group">
              <Lock size={20} className="input-icon" />
              <input type="password" name="password" placeholder="Mật khẩu *" value={formData.password} onChange={handleChange} required />
            </div>
            <div className="auth-input-group">
              <Lock size={20} className="input-icon" />
              <input type="password" name="confirmPassword" placeholder="Nhập lại mật khẩu *" value={formData.confirmPassword} onChange={handleChange} required />
            </div>
          </div>

          <button type="submit" className="btn-auth-submit" disabled={loading}>
            {loading ? 'ĐANG XỬ LÝ...' : 'ĐĂNG KÝ'}
          </button>
        </form>

        <div className="auth-footer">
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
