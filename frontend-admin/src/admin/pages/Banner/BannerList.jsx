import React, { useEffect, useState } from 'react';
import { FileText, Trash2, Plus, Edit } from 'lucide-react';
import { Link } from 'react-router-dom';
import bannerService from '../../services/bannerService';
import Pagination from '../../components/Pagination/Pagination';

const BannerList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const paginatedData = data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const fetchData = () => {
    setLoading(true);
    bannerService.getAll().then(res => { setData(res.data); setLoading(false); }).catch(err => { console.error(err); setLoading(false); });
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xoá?')) {
      bannerService.delete(id).then(() => fetchData()).catch(err => alert('Lỗi: ' + err.message));
    }
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h2><FileText /> Quản Lý Banner</h2>
        <Link to="/admin/banner/create" className="btn-primary"><Plus size={18} /> Thêm Mới</Link>
      </div>
      <div className="banner-grid-container">
        {loading ? <div className="loader"></div> : (
          <div className="banner-grid">
            {paginatedData.map(item => {
              const imageUrl = item.image ? (item.image.startsWith('http') ? item.image : `http://localhost:8080/uploads/${item.image}`) : 'https://via.placeholder.com/600x300';
              return (
                <div key={item.id} className="banner-card">
                  <div className="banner-img-wrapper">
                    <img src={imageUrl} alt="banner" className="banner-img" />
                    <button className="btn-banner-delete" onClick={() => handleDelete(item.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="banner-info">
                    <h3 className="banner-name">{item.name || item.title || 'BANNER KHÔNG TÊN'}</h3>
                    <Link to={'/admin/banner/edit/' + item.id} className="btn-banner-edit">THAY ẢNH</Link>
                  </div>
                </div>
              );
            })}
            
            {/* Add New Card */}
            <Link to="/admin/banner/create" className="banner-card add-new-card">
              <div className="add-icon-wrapper">
                <Plus size={32} className="add-icon" />
              </div>
              <span className="add-text">THÊM BANNER MỚI</span>
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

export default BannerList;
