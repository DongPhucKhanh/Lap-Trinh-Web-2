import React, { useState, useEffect } from 'react';
import { FileText, ArrowLeft, Heart } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import userService from '../../services/userService';
import api from '../../services/api';

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await userService.getById(id);
        setUser(userRes.data);
        
        const favRes = await api.get(`/users/${id}/favorites`);
        setFavorites(favRes.data);
      } catch (error) {
        console.error(error);
        alert('Lỗi tải dữ liệu người dùng');
        navigate('/admin/user');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  if (loading) return <div>Đang tải...</div>;
  if (!user) return <div>Không tìm thấy người dùng</div>;

  return (
    <div className="admin-page">
      <div className="page-header">
        <div className="flex-row">
          <Link to="/admin/user" className="btn-icon"><ArrowLeft size={20}/></Link>
          <h2><FileText /> Chi Tiết Người Dùng</h2>
        </div>
      </div>
      
      <div className="card-panel" style={{ marginBottom: '20px' }}>
        <h3>Thông tin cá nhân</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '10px', marginTop: '15px' }}>
          <strong>ID:</strong> <span>{user.id}</span>
          <strong>Tài khoản:</strong> <span>{user.username}</span>
          <strong>Họ tên:</strong> <span>{user.name}</span>
          <strong>Email:</strong> <span>{user.email || 'N/A'}</span>
          <strong>Điện thoại:</strong> <span>{user.phone || 'N/A'}</span>
          <strong>Trạng thái:</strong> <span>{user.status === 1 ? 'Hoạt động' : 'Bị khóa'}</span>
          <strong>Ngày tạo:</strong> <span>{new Date(user.createdAt).toLocaleString('vi-VN')}</span>
        </div>
      </div>

      <div className="card-panel">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Heart size={20} color="#ef4444" /> Sản phẩm yêu thích ({favorites.length})
        </h3>
        
        {favorites.length === 0 ? (
          <p style={{ marginTop: '15px', color: '#64748b' }}>Người dùng này chưa có sản phẩm yêu thích nào.</p>
        ) : (
          <table className="admin-table" style={{ marginTop: '15px' }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Hình ảnh</th>
                <th>Tên sản phẩm</th>
                <th>Giá</th>
              </tr>
            </thead>
            <tbody>
              {favorites.map(p => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>
                    <img 
                      src={p.image ? (p.image.startsWith('http') ? p.image : `http://localhost:8080/uploads/${p.image}`) : 'https://placehold.co/50'} 
                      alt={p.name}
                      style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                    />
                  </td>
                  <td>{p.name}</td>
                  <td>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default UserDetail;
