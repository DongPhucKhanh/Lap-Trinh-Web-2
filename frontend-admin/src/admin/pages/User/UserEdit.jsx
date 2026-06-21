import React, { useState, useEffect } from 'react';
import { FileText, ArrowLeft, Save } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import userService from '../../services/userService';

const UserEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '', 
    password: '', 
    name: '', 
    email: '', 
    phone: '', 
    roles: 'ROLE_ADMIN', 
    status: 1
  });

  useEffect(() => {
    userService.getById(id).then(res => {
      // Khi edit không hiển thị password cũ
      setFormData({ ...res.data, password: '' });
    }).catch(() => navigate('/admin/user'));
  }, [id, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    userService.update(id, formData)
      .then(() => { 
        setLoading(false); 
        navigate('/admin/user'); 
      })
      .catch(err => { 
        setLoading(false); 
        alert('Lỗi: ' + (err.response?.data?.message || err.response?.data || err.message)); 
      });
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <div className="flex-row">
          <Link to="/admin/user" className="btn-icon"><ArrowLeft size={20}/></Link>
          <h2><FileText /> Cập Nhật Tài Khoản Admin</h2>
        </div>
      </div>
      <div className="form-container card-panel">
        <form onSubmit={handleSubmit}>
          <div className="grid-2-cols">
            <div className="form-group">
              <label>Tên đăng nhập (Username)</label>
              <input type="text" value={formData.username || ''} disabled className="bg-gray-100" title="Không thể đổi username" />
            </div>
            <div className="form-group">
              <label>Đổi Mật khẩu mới</label>
              <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="Để trống nếu không đổi..." />
            </div>
            <div className="form-group">
              <label>Họ và tên hiển thị <span className="text-red">*</span></label>
              <input required type="text" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Số điện thoại</label>
              <input type="text" value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Quyền (Role)</label>
              <select value={formData.roles || 'ROLE_ADMIN'} onChange={e => setFormData({...formData, roles: e.target.value})}>
                <option value="ROLE_ADMIN">Quản trị viên (ROLE_ADMIN)</option>
                <option value="ROLE_USER">Khách hàng (ROLE_USER)</option>
              </select>
            </div>
            <div className="form-group">
              <label>Trạng thái</label>
              <select value={formData.status ?? 1} onChange={e => setFormData({...formData, status: parseInt(e.target.value)})}>
                <option value={1}>Hoạt động</option>
                <option value={0}>Khóa tài khoản</option>
              </select>
            </div>
          </div>
          <div className="form-actions mt-4">
            <Link to="/admin/user" className="btn-secondary">Hủy</Link>
            <button type="submit" className="btn-primary" disabled={loading}><Save size={18} /> Lưu Thay Đổi</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserEdit;
