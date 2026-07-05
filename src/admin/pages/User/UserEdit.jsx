import React, { useState, useEffect } from 'react';
import { FileText, ArrowLeft, Save, Shield, Lock, MapPin, Phone, Mail, User as UserIcon } from 'lucide-react';
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
    address: '',
    roles: 'ROLE_USER', 
    status: 1,
    adminNote: ''
  });

  useEffect(() => {
    userService.getById(id).then(res => {
      setFormData({ 
        ...res.data, 
        password: '', // Ẩn mật khẩu cũ, chỉ nhập khi muốn đổi
        adminNote: res.data.adminNote || '',
        address: res.data.address || ''
      });
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
          <Link to="/admin/user" className="btn-icon text-muted"><ArrowLeft size={20}/></Link>
          <h2><FileText /> Hồ sơ Khách Hàng</h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card-panel" style={{ padding: '2rem' }}>
        <h3 style={{fontSize: '18px', fontWeight: 'bold', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px'}}>
          <UserIcon size={20} color="#2563eb" /> Thông tin cơ bản
        </h3>
        <div className="grid-2-cols" style={{ gap: '2rem', marginBottom: '2rem' }}>
          
          <div className="form-group">
            <label>Tên đăng nhập (Username)</label>
            <input type="text" value={formData.username || ''} disabled className="bg-gray-100" title="Không thể đổi username" style={{ opacity: 0.7 }} />
          </div>

          <div className="form-group">
            <label>Họ và tên hiển thị <span className="text-red">*</span></label>
            <input required type="text" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>

          <div className="form-group">
            <label><Mail size={14} style={{display: 'inline', marginRight: '4px'}}/> Email</label>
            <input type="email" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>

          <div className="form-group">
            <label><Phone size={14} style={{display: 'inline', marginRight: '4px'}}/> Số điện thoại</label>
            <input type="text" value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} />
          </div>

          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label><MapPin size={14} style={{display: 'inline', marginRight: '4px'}}/> Địa chỉ liên hệ</label>
            <input type="text" value={formData.address || ''} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Nhập địa chỉ nhận hàng..." />
          </div>
        </div>

        <h3 style={{fontSize: '18px', fontWeight: 'bold', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px'}}>
          <Shield size={20} color="#f59e0b" /> Phân quyền & Bảo mật
        </h3>
        <div className="grid-2-cols" style={{ gap: '2rem', marginBottom: '2rem' }}>
          
          <div className="form-group">
            <label>Quyền hạn (Role)</label>
            <select value={formData.roles || 'ROLE_USER'} onChange={e => setFormData({...formData, roles: e.target.value})}>
              <option value="ROLE_USER">Khách hàng (ROLE_USER)</option>
              <option value="ROLE_ADMIN">Quản trị viên (ROLE_ADMIN)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Trạng thái tài khoản</label>
            <select value={formData.status ?? 1} onChange={e => setFormData({...formData, status: parseInt(e.target.value)})}>
              <option value={1}>Hoạt động bình thường</option>
              <option value={0}>Khóa tài khoản</option>
            </select>
          </div>

          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label><Lock size={14} style={{display: 'inline', marginRight: '4px'}}/> Đặt lại mật khẩu mới (Tùy chọn)</label>
            <input 
              type="password" 
              value={formData.password} 
              onChange={e => setFormData({...formData, password: e.target.value})} 
              placeholder="Để trống nếu không muốn đổi mật khẩu..." 
            />
          </div>
        </div>

        <h3 style={{fontSize: '18px', fontWeight: 'bold', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px'}}>
          <FileText size={20} color="#10b981" /> Ghi chú Nội bộ (Admin Note)
        </h3>
        <div className="form-group">
          <textarea 
            rows="4" 
            value={formData.adminNote || ''} 
            onChange={e => setFormData({...formData, adminNote: e.target.value})} 
            placeholder="Ghi chú về khách hàng (Ví dụ: Khách VIP, Hay boom hàng, Thích màu đen...)"
            style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid #cbd5e1', resize: 'vertical', fontFamily: 'inherit' }}
          ></textarea>
          <p className="text-muted" style={{fontSize: '13px', marginTop: '4px'}}>* Ghi chú này chỉ Admin mới có thể xem được.</p>
        </div>

        <div className="form-actions mt-4" style={{borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem'}}>
          <Link to="/admin/user" className="btn-secondary" style={{padding: '0.8rem 1.5rem'}}>Hủy</Link>
          <button type="submit" className="btn-primary" disabled={loading} style={{padding: '0.8rem 1.5rem'}}>
            <Save size={18} /> Lưu Thay Đổi
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserEdit;
