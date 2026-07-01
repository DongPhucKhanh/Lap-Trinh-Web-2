import React, { useEffect, useState } from 'react';
import { FileText, Trash2, Plus, Edit, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import userService from '../../services/userService';
import Pagination from '../../components/Pagination/Pagination';

const UserList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const paginatedData = data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const fetchData = () => {
    setLoading(true);
    userService.getAll()
      .then(res => { 
        // Lọc ra những user có chứa chữ ADMIN hoặc muốn hiển thị hết cũng được
        // Ở đây hiển thị tất cả tài khoản
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
    if (window.confirm('Bạn có chắc chắn muốn xoá tài khoản này?')) {
      userService.delete(id).then(() => fetchData()).catch(err => alert('Lỗi: ' + err.message));
    }
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h2><Shield /> Quản Lý Tài Khoản (Admin & Staff)</h2>
        <Link to="/admin/user/create" className="btn-primary"><Plus size={18} /> Thêm Mới Admin</Link>
      </div>
      <div className="table-container">
        {loading ? <div className="loader"></div> : (
          <>
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Họ Tên</th>
                <th>Email</th>
                <th>Quyền hạn</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map(item => (
                <tr key={item.id}>
                  <td>#{item.id}</td>
                  <td className="font-bold">{item.username}</td>
                  <td>{item.name}</td>
                  <td>{item.email || '-'}</td>
                  <td>
                    {item.roles?.includes('ADMIN') ? 
                      <span className="badge bg-red-100 text-red-700">ADMIN</span> : 
                      <span className="badge bg-gray-100 text-gray-700">USER</span>}
                  </td>
                  <td>
                    {item.status === 1 ? 
                      <span className="text-green-600 font-medium">Hoạt động</span> : 
                      <span className="text-red-600 font-medium">Bị khóa</span>}
                  </td>
                  <td>
                    <div className="action-btns">
                      <Link to={'/admin/user/edit/' + item.id} className="btn-icon text-blue"><Edit size={18}/></Link>
                      <button className="btn-icon text-red" onClick={() => handleDelete(item.id)}><Trash2 size={18}/></button>
                    </div>
                  </td>
                </tr>
              ))}
              {data.length === 0 && <tr><td colSpan="7" className="text-center py-4">Chưa có dữ liệu.</td></tr>}
            </tbody>
          </table>
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
          </>
        )}
      </div>
    </div>
  );
};

export default UserList;
