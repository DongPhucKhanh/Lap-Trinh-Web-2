import React, { useEffect, useState } from 'react';
import { FileText, Trash2, Plus, Edit, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import postService from '../../services/postService';

const PostList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    postService.getAll().then(res => { setData(res.data); setLoading(false); }).catch(err => { console.error(err); setLoading(false); });
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xoá?')) {
      postService.delete(id).then(() => fetchData()).catch(err => alert('Lỗi: ' + err.message));
    }
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h2><FileText /> Quản Lý Post</h2>
        <Link to="/admin/post/create" className="btn-primary"><Plus size={18} /> Thêm Mới</Link>
      </div>
      <div className="table-container">
        {loading ? <div className="loader"></div> : (
          <table className="admin-table">
            <thead><tr><th>ID</th><th>Hình ảnh</th><th>Thông tin</th><th>Thao tác</th></tr></thead>
            <tbody>
              {data.map(item => (
                <tr key={item.id}>
                  <td>#{item.id}</td>
                  <td>
                    {item.image ? (
                      <img src={item.image.startsWith('http') ? item.image : `http://localhost:8080/uploads/${item.image}`} alt="post" style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                    ) : (
                      <div style={{ width: '50px', height: '50px', backgroundColor: '#e9ecef', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#6c757d' }}>Trống</div>
                    )}
                  </td>
                  <td>{item.name || item.title || item.username || item.fullname || 'No Data'}</td>
                  <td>
                    <div className="action-btns">
                      <Link to={'/admin/post/show/' + item.id} className="btn-icon text-green"><Eye size={18}/></Link>
                      <Link to={'/admin/post/edit/' + item.id} className="btn-icon text-blue"><Edit size={18}/></Link>
                      <button className="btn-icon text-red" onClick={() => handleDelete(item.id)}><Trash2 size={18}/></button>
                    </div>
                  </td>
                </tr>
              ))}
              {data.length === 0 && <tr><td colSpan="4" className="text-center py-4">Chưa có dữ liệu.</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default PostList;
