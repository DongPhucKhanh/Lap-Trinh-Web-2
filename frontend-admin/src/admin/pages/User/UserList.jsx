import React, { useEffect, useState } from 'react';
import { Trash2, Plus, Edit, Shield, Search, Filter, MoreVertical, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import userService from '../../services/userService';
import Pagination from '../../components/Pagination/Pagination';

const UserList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search and Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchData = () => {
    setLoading(true);
    userService.getAll()
      .then(res => { 
        setData(res.data); 
        setLoading(false); 
      })
      .catch(err => { 
        console.error(err); 
        setLoading(false); 
      });
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xoá tài khoản này? Toàn bộ dữ liệu liên quan sẽ bị xoá!')) {
      userService.delete(id).then(() => fetchData()).catch(err => alert('Lỗi: ' + err.message));
    }
  };

  // 1. Lọc theo Search (Tên, Email, SĐT)
  let filteredData = data.filter(user => {
    const term = searchTerm.toLowerCase();
    const nameMatch = user.name?.toLowerCase().includes(term);
    const emailMatch = user.email?.toLowerCase().includes(term);
    const phoneMatch = user.phone?.includes(term);
    return nameMatch || emailMatch || phoneMatch;
  });

  // 2. Lọc theo Trạng thái
  if (filterStatus !== 'all') {
    const statusVal = filterStatus === 'active' ? 1 : 0;
    filteredData = filteredData.filter(user => user.status === statusVal);
  }

  // 3. Sắp xếp
  filteredData.sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    } else if (sortBy === 'oldest') {
      return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
    } else if (sortBy === 'name') {
      return (a.name || '').localeCompare(b.name || '');
    }
    return 0;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getAvatarUrl = (avatar) => {
    if (!avatar) return 'https://ui-avatars.com/api/?name=User&background=f1f5f9&color=64748b';
    if (avatar.startsWith('http')) return avatar;
    return `http://localhost:8080/uploads/${avatar}`;
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <div className="flex-row">
          <h2><Shield /> Quản Lý Khách Hàng</h2>
          <span className="badge bg-blue-100 text-blue-700">{data.length} Tổng số</span>
        </div>
        <Link to="/admin/user/create" className="btn-primary"><Plus size={18} /> Thêm Tài Khoản Mới</Link>
      </div>

      {/* SEARCH & FILTER BAR */}
      <div className="card-panel mb-4" style={{ padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input 
            type="text" 
            placeholder="Tìm kiếm theo Tên, Email, SĐT..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Filter size={18} color="#64748b" />
          <select 
            value={filterStatus} 
            onChange={e => setFilterStatus(e.target.value)}
            style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', background: 'white' }}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="banned">Bị khóa</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <select 
            value={sortBy} 
            onChange={e => setSortBy(e.target.value)}
            style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', background: 'white' }}
          >
            <option value="newest">Mới nhất</option>
            <option value="oldest">Cũ nhất</option>
            <option value="name">Tên (A-Z)</option>
          </select>
        </div>
      </div>

      <div className="table-container card-panel" style={{ padding: '0' }}>
        {loading ? <div className="loader" style={{ margin: '3rem auto' }}></div> : (
          <>
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{width: '60px'}}>ID</th>
                <th>Khách Hàng</th>
                <th>Liên Hệ</th>
                <th>Ngày Đăng Ký</th>
                <th>Đơn Hàng</th>
                <th>Trạng Thái</th>
                <th style={{textAlign: 'right'}}>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map(item => (
                <tr key={item.id}>
                  <td className="text-muted">#{item.id}</td>
                  
                  {/* Khách hàng (Avatar + Tên) */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img 
                        src={getAvatarUrl(item.avatar)} 
                        alt="avatar" 
                        style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #e2e8f0' }}
                      />
                      <div>
                        <div className="font-bold text-dark">{item.name} {item.roles?.includes('ADMIN') && <span style={{fontSize: '10px', background: '#fef2f2', color: '#ef4444', padding: '2px 6px', borderRadius: '4px', marginLeft: '6px'}}>ADMIN</span>}</div>
                        <div className="text-muted" style={{fontSize: '13px'}}>@{item.username}</div>
                      </div>
                    </div>
                  </td>

                  {/* Liên hệ */}
                  <td>
                    <div className="text-dark" style={{fontSize: '14px'}}>{item.email || '-'}</div>
                    <div className="text-muted" style={{fontSize: '13px'}}>{item.phone || '-'}</div>
                  </td>

                  {/* Ngày đăng ký */}
                  <td>
                    <div className="text-dark">{item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : '-'}</div>
                  </td>

                  {/* Đơn hàng */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <ShoppingBag size={14} className="text-muted" />
                      <span className="font-bold">{item.orderCount || 0}</span> đơn
                    </div>
                  </td>

                  {/* Trạng thái */}
                  <td>
                    {item.status === 1 ? 
                      <span className="badge badge-success">Hoạt động</span> : 
                      <span className="badge badge-danger">Bị khóa</span>}
                  </td>

                  {/* Thao tác */}
                  <td style={{textAlign: 'right'}}>
                    <div className="action-btns" style={{justifyContent: 'flex-end'}}>
                      <Link to={'/admin/user/edit/' + item.id} className="btn-icon text-blue" title="Chỉnh sửa chi tiết">
                        <Edit size={18}/>
                      </Link>
                      <button className="btn-icon text-red" onClick={() => handleDelete(item.id)} title="Xóa khách hàng">
                        <Trash2 size={18}/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && <tr><td colSpan="7" className="text-center py-8 text-muted">Không tìm thấy khách hàng nào phù hợp.</td></tr>}
            </tbody>
          </table>
          {totalPages > 1 && (
            <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)' }}>
              <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
          </>
        )}
      </div>
    </div>
  );
};

export default UserList;
