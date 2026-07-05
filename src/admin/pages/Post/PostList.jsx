import React, { useEffect, useState } from 'react';
import { FileText, Trash2, Plus, Edit, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import postService from '../../services/postService';
import Pagination from '../../components/Pagination/Pagination';

const PostList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const paginatedData = data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
      <div className="post-grid-container">
        {loading ? <div className="loader"></div> : (
          <div className="post-grid">
            {paginatedData.map(item => {
              const imageUrl = item.image ? (item.image.startsWith('http') ? item.image : `http://localhost:8080/uploads/${item.image}`) : 'https://via.placeholder.com/400x250';
              const topicName = item.topic?.name || 'TIN TỨC';
              return (
                <div key={item.id} className="post-card">
                  <div className="post-img-wrapper">
                    <img src={imageUrl} alt="post" className="post-img" />
                    <span className="post-badge">{topicName}</span>
                    
                    <div className="post-actions-overlay">
                      <Link to={`/admin/post/show/${item.id}`} className="post-action-btn view" title="Xem chi tiết">
                        <Eye size={16} />
                      </Link>
                      <Link to={`/admin/post/edit/${item.id}`} className="post-action-btn edit" title="Chỉnh sửa">
                        <Edit size={16} />
                      </Link>
                      <button className="post-action-btn delete" onClick={() => handleDelete(item.id)} title="Xóa">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="post-info">
                    <h3 className="post-name">{item.title || item.name || 'Bài viết không có tiêu đề'}</h3>
                  </div>
                </div>
              );
            })}
            
            {/* Add New Card */}
            <Link to="/admin/post/create" className="post-card add-new-card">
              <div className="add-icon-wrapper">
                <Plus size={32} className="add-icon" />
              </div>
              <span className="add-text">THÊM BÀI VIẾT MỚI</span>
            </Link>
          </div>
        )}
        
        {!loading && totalPages > 1 && (
          <div className="mt-4">
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PostList;
