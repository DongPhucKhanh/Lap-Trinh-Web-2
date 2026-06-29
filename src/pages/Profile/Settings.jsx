import React, { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Lock, Bell, Shield, Edit2, Globe, Moon, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import './Profile.css'; // Reusing profile styles

const Settings = () => {
  const { user, logout } = useContext(AuthContext);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error('Vui lòng điền đầy đủ các trường mật khẩu');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự!');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu nhập lại không khớp!');
      return;
    }

    setLoading(true);
    try {
      await api.post(`/users/${user.id}/change-password`, {
        oldPassword,
        newPassword
      });
      toast.success('Đổi mật khẩu thành công!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error(err);
      const msg = err.response?.data || 'Có lỗi xảy ra khi đổi mật khẩu!';
      toast.error(typeof msg === 'string' ? msg : 'Có lỗi xảy ra khi đổi mật khẩu!');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tài khoản vĩnh viễn? Hành động này không thể hoàn tác.')) {
      toast.info('Tính năng đang được phát triển.');
    }
  };

  return (
    <div className="profile-page">
      <div className="section-header">
        <h2>Cài đặt tài khoản</h2>
        <p>Quản lý mật khẩu và các thiết lập bảo mật khác</p>
      </div>

      <div className="profile-content">
        <div className="profile-form" style={{maxWidth: '600px'}}>
          
          <h3 style={{marginBottom: '1.5rem', fontSize: '1.1rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
            <Lock size={18} /> Đổi mật khẩu
          </h3>

          <form onSubmit={handleChangePassword}>
            <div className="info-row">
              <label>Mật khẩu hiện tại</label>
              <div className="info-value">
                <input 
                  type="password" 
                  value={oldPassword} 
                  onChange={(e) => setOldPassword(e.target.value)} 
                  className="profile-input" 
                  placeholder="Nhập mật khẩu hiện tại"
                />
              </div>
            </div>

            <div className="info-row">
              <label>Mật khẩu mới</label>
              <div className="info-value">
                <input 
                  type="password" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  className="profile-input" 
                  placeholder="Nhập mật khẩu mới"
                />
              </div>
            </div>

            <div className="info-row">
              <label>Nhập lại mật khẩu</label>
              <div className="info-value">
                <input 
                  type="password" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  className="profile-input" 
                  placeholder="Xác nhận mật khẩu mới"
                />
              </div>
            </div>

            <div className="profile-actions" style={{paddingLeft: '150px'}}>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Đang lưu...' : 'Lưu mật khẩu mới'}
              </button>
            </div>
          </form>

          <hr style={{margin: '2rem 0', borderColor: '#e2e8f0'}} />

          <h3 style={{marginBottom: '1.5rem', fontSize: '1.1rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
            <Globe size={18} /> Tùy chọn hiển thị
          </h3>
          <div className="info-row">
            <label style={{width: '150px'}}>Ngôn ngữ</label>
            <div className="info-value">
              <select className="profile-input" style={{width: '200px'}}>
                <option value="vi">Tiếng Việt</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>

          <div className="info-row">
            <label style={{width: '150px'}}>Chế độ nền tối</label>
            <div className="info-value" style={{paddingTop: '0.5rem'}}>
              <label className="switch" style={{display: 'inline-flex', alignItems: 'center', gap: '10px', cursor: 'pointer'}}>
                <input type="checkbox" style={{width: '18px', height: '18px'}} />
                <span>Bật / Tắt (Sắp ra mắt)</span>
              </label>
            </div>
          </div>

          <hr style={{margin: '2rem 0', borderColor: '#e2e8f0'}} />

          <h3 style={{marginBottom: '1.5rem', fontSize: '1.1rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
            <Bell size={18} /> Cài đặt thông báo
          </h3>
          <div className="info-row">
            <label style={{width: 'auto', marginRight: '1rem', cursor: 'pointer'}}>
              <input type="checkbox" defaultChecked style={{width: '18px', height: '18px', marginRight: '8px'}} />
              Nhận email khuyến mãi
            </label>
          </div>
          <div className="info-row">
            <label style={{width: 'auto', marginRight: '1rem', cursor: 'pointer'}}>
              <input type="checkbox" defaultChecked style={{width: '18px', height: '18px', marginRight: '8px'}} />
              Nhận email cập nhật đơn hàng
            </label>
          </div>

          <hr style={{margin: '2rem 0', borderColor: '#e2e8f0'}} />

          <h3 style={{marginBottom: '1.5rem', fontSize: '1.1rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
            <Shield size={18} /> Vùng nguy hiểm
          </h3>
          <div className="info-row" style={{alignItems: 'center'}}>
            <div style={{flex: 1}}>
              <p style={{margin: 0, fontWeight: '500'}}>Xóa tài khoản</p>
              <p style={{margin: 0, fontSize: '0.85rem', color: '#64748b'}}>Xóa vĩnh viễn tài khoản và tất cả dữ liệu của bạn khỏi hệ thống.</p>
            </div>
            <button onClick={handleDeleteAccount} className="btn-outline" style={{borderColor: '#ef4444', color: '#ef4444'}}>
              <Trash2 size={16} /> Xóa tài khoản
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Settings;
