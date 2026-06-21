import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Gọi trực tiếp axios vì api.js có interceptor tự gắn token cũ
    axios.post('http://localhost:8080/api/auth/login', formData)
      .then(res => {
        setLoading(false);
        // Lưu token vào localStorage
        localStorage.setItem('adminToken', res.data.token);
        localStorage.setItem('adminInfo', JSON.stringify(res.data));
        
        // Điều hướng vào dashboard
        navigate('/admin');
      })
      .catch(err => {
        setLoading(false);
        setError(err.response?.data?.message || 'Lỗi kết nối tới máy chủ!');
      });
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8fafc' }}>
      <div className="card-panel" style={{ width: '400px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Admin Login</h2>
        
        {error && <div style={{ background: '#fee2e2', color: '#ef4444', padding: '10px', borderRadius: '4px', marginBottom: '15px' }}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input 
              required 
              type="text" 
              value={formData.username} 
              onChange={e => setFormData({...formData, username: e.target.value})} 
              placeholder="Nhập tên đăng nhập..."
              style={{ width: '100%', padding: '10px', marginTop: '5px' }}
            />
          </div>
          
          <div className="form-group" style={{ marginTop: '15px' }}>
            <label>Password</label>
            <input 
              required 
              type="password" 
              value={formData.password} 
              onChange={e => setFormData({...formData, password: e.target.value})} 
              placeholder="Nhập mật khẩu..."
              style={{ width: '100%', padding: '10px', marginTop: '5px' }}
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            style={{ width: '100%', marginTop: '20px', padding: '10px' }}
            disabled={loading}
          >
            {loading ? 'Đang xử lý...' : 'Đăng Nhập'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
