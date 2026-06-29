import React, { useContext, useState, useEffect, useRef } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { User, Mail, Phone, MapPin, Edit2, Camera } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import './Profile.css';

const Profile = () => {
  const { user, setUser } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    gender: 'other',
    avatar: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        gender: user.gender || 'other',
        avatar: user.avatar || ''
      });
      if (user.avatar) {
        setAvatarUrl(user.avatar.startsWith('http') ? user.avatar : `http://localhost:8080/uploads/${user.avatar}`);
      }
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!formData.name) {
      toast.error('Tên không được để trống!');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...user,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        gender: formData.gender,
        avatar: formData.avatar
      };
      
      const res = await api.put(`/users/${user.id}`, payload);
      
      setUser(res.data);
      
      toast.success('Cập nhật hồ sơ thành công!');
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      toast.error('Có lỗi xảy ra khi cập nhật hồ sơ!');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file
    if (file.size > 1024 * 1024) {
      toast.error('Dung lượng file không được vượt quá 1MB!');
      return;
    }
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      toast.error('Chỉ chấp nhận file JPEG hoặc PNG!');
      return;
    }

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => setAvatarUrl(reader.result);
    reader.readAsDataURL(file);

    // Upload
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      const uploadRes = await api.post('/upload', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const filename = uploadRes.data.filename;
      setAvatarUrl(`http://localhost:8080/uploads/${filename}`);
      setFormData(prev => ({ ...prev, avatar: filename }));
      toast.success('Tải ảnh đại diện thành công!');
    } catch (err) {
      console.error(err);
      toast.error('Có lỗi xảy ra khi tải ảnh!');
    }
  };

  return (
    <div className="profile-page">
      <div className="section-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <div>
          <h2>Hồ sơ của tôi</h2>
          <p>Quản lý thông tin hồ sơ để bảo mật tài khoản</p>
        </div>
        <div>
          {isEditing ? (
            <div style={{display: 'flex', gap: '10px'}}>
              <button onClick={handleSave} disabled={loading} style={{background: 'var(--primary)', color: 'white', padding: '10px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '0.95rem', opacity: 1}}>
                {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
              <button onClick={() => {
                setIsEditing(false);
                setFormData({
                  name: user?.name || '',
                  email: user?.email || '',
                  phone: user?.phone || '',
                  address: user?.address || '',
                  gender: user?.gender || 'other',
                  avatar: user?.avatar || ''
                });
                if (user?.avatar) {
                  setAvatarUrl(user.avatar.startsWith('http') ? user.avatar : `http://localhost:8080/uploads/${user.avatar}`);
                } else {
                  setAvatarUrl(null);
                }
              }} disabled={loading} style={{background: 'white', color: '#64748b', padding: '10px 24px', borderRadius: '8px', border: '2px solid #cbd5e1', cursor: 'pointer', fontWeight: '600', fontSize: '0.95rem'}}>Hủy</button>
            </div>
          ) : (
            <button onClick={() => setIsEditing(true)} style={{background: 'var(--primary)', color: 'white', padding: '10px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px', opacity: 1}}>
              <Edit2 size={16} /> Cập nhật hồ sơ
            </button>
          )}
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-form">
          <div className="info-row">
            <label>Tên đăng nhập</label>
            <div className="info-value text-muted">{user?.username}</div>
          </div>
          
          <div className="info-row">
            <label>Họ và tên</label>
            <div className="info-value">
              {isEditing ? (
                <input type="text" name="name" value={formData.name} onChange={handleChange} className="profile-input" />
              ) : (
                <span className="flex-value"><User size={16}/> {user?.name || 'Chưa cập nhật'}</span>
              )}
            </div>
          </div>

          <div className="info-row">
            <label>Giới tính</label>
            <div className="info-value">
              {isEditing ? (
                <select name="gender" value={formData.gender} onChange={handleChange} className="profile-input" style={{width: '150px'}}>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                </select>
              ) : (
                <span className="flex-value">
                  {user?.gender === 'male' ? 'Nam' : user?.gender === 'female' ? 'Nữ' : 'Khác'}
                </span>
              )}
            </div>
          </div>

          <div className="info-row">
            <label>Email</label>
            <div className="info-value">
              {isEditing ? (
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="profile-input" />
              ) : (
                <span className="flex-value"><Mail size={16}/> {user?.email || 'Chưa cập nhật'}</span>
              )}
            </div>
          </div>

          <div className="info-row">
            <label>Số điện thoại</label>
            <div className="info-value">
              {isEditing ? (
                <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="profile-input" />
              ) : (
                <span className="flex-value"><Phone size={16}/> {user?.phone || 'Chưa cập nhật'}</span>
              )}
            </div>
          </div>

          <div className="info-row">
            <label>Địa chỉ</label>
            <div className="info-value">
              {isEditing ? (
                <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Nhập địa chỉ" className="profile-input" />
              ) : (
                <span className="flex-value"><MapPin size={16}/> {user?.address || 'Chưa cập nhật'}</span>
              )}
            </div>
          </div>

          <div style={{marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0'}}>
            {isEditing ? (
              <div style={{display: 'flex', gap: '12px'}}>
                <button 
                  onClick={handleSave} 
                  disabled={loading}
                  style={{padding: '12px 32px', fontSize: '1rem', fontWeight: '600', borderRadius: '8px', background: 'var(--primary)', color: 'white', border: 'none', cursor: 'pointer', opacity: 1}}
                >
                  {loading ? 'Đang lưu...' : '💾 Lưu thay đổi'}
                </button>
                <button 
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      name: user?.name || '',
                      email: user?.email || '',
                      phone: user?.phone || '',
                      address: user?.address || '',
                      gender: user?.gender || 'other'
                    });
                  }} 
                  disabled={loading}
                  style={{padding: '12px 32px', fontSize: '1rem', fontWeight: '600', borderRadius: '8px', background: 'white', color: '#64748b', border: '2px solid #cbd5e1', cursor: 'pointer'}}
                >
                  ✕ Hủy
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsEditing(true)}
                style={{padding: '12px 32px', fontSize: '1rem', fontWeight: '600', borderRadius: '8px', background: 'var(--primary)', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', opacity: 1}}
              >
                <Edit2 size={18} /> Cập nhật hồ sơ
              </button>
            )}
          </div>
        </div>

        <div className="profile-avatar-sec">
          <div className="avatar-preview" style={{ overflow: 'hidden', position: 'relative' }}>
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
            ) : (
              user?.name ? user.name.charAt(0).toUpperCase() : 'U'
            )}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleAvatarUpload}
            accept="image/jpeg,image/png"
            style={{ display: 'none' }}
          />
          <button className="btn-outline mt-3" onClick={() => fileInputRef.current?.click()} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Camera size={16} /> Chọn Ảnh
          </button>
          <p className="help-text">Dung lượng file tối đa 1MB<br/>Định dạng: .JPEG, .PNG</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
