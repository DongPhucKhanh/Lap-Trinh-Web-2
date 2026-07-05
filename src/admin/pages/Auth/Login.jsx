import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User, Lock, ShieldAlert, LogIn } from 'lucide-react';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    axios.post('http://localhost:8080/api/auth/login', formData)
      .then(res => {
        setLoading(false);
        localStorage.setItem('adminToken', res.data.token);
        localStorage.setItem('adminInfo', JSON.stringify(res.data));
        navigate('/admin');
      })
      .catch(err => {
        setLoading(false);
        setError(err.response?.data?.message || 'Lỗi kết nối tới máy chủ!');
      });
  };

  return (
    <div className="admin-login-container">
      {/* Animated Background Shapes */}
      <div className="bg-shape bg-shape-1"></div>
      <div className="bg-shape bg-shape-2"></div>
      <div className="bg-shape bg-shape-3"></div>

      <div className="login-glass-card">
        <div className="login-header">
          <div className="login-logo">
            <ShieldAlert size={32} color="white" />
          </div>
          <h2 className="login-title">Hệ Thống Quản Trị</h2>
          <p className="login-subtitle">Vui lòng đăng nhập để tiếp tục</p>
        </div>
        
        {error && (
          <div className="login-error">
            <ShieldAlert size={18} />
            <span>{error}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tài khoản (Username)</label>
            <div className="input-wrapper">
              <input 
                required 
                type="text" 
                className="glass-input"
                value={formData.username} 
                onChange={e => setFormData({...formData, username: e.target.value})} 
                placeholder="Nhập tên đăng nhập..."
              />
              <User className="input-icon" size={18} />
            </div>
          </div>
          
          <div className="form-group">
            <label>Mật khẩu (Password)</label>
            <div className="input-wrapper">
              <input 
                required 
                type="password" 
                className="glass-input"
                value={formData.password} 
                onChange={e => setFormData({...formData, password: e.target.value})} 
                placeholder="Nhập mật khẩu..."
              />
              <Lock className="input-icon" size={18} />
            </div>
          </div>

          <div className="remember-forgot">
            <label className="checkbox-wrapper">
              <input type="checkbox" />
              <span>Ghi nhớ đăng nhập</span>
            </label>
            <a href="#" className="forgot-link">Quên mật khẩu?</a>
          </div>

          <button 
            type="submit" 
            className="btn-login" 
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner"></div>
                Đang kết nối...
              </>
            ) : (
              <>
                <LogIn size={20} />
                Đăng Nhập
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
