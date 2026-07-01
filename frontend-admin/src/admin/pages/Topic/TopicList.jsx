import React, { useEffect, useState } from 'react';
import { FileText, Trash2, Plus, Edit } from 'lucide-react';
import { Link } from 'react-router-dom';
import topicService from '../../services/topicService';
import Pagination from '../../components/Pagination/Pagination';

const TopicList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const paginatedData = data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const fetchData = () => {
    setLoading(true);
    topicService.getAll().then(res => { setData(res.data); setLoading(false); }).catch(err => { console.error(err); setLoading(false); });
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xoá?')) {
      topicService.delete(id).then(() => fetchData()).catch(err => alert('Lỗi: ' + err.message));
    }
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h2><FileText /> Quản Lý Topic</h2>
        <Link to="/admin/topic/create" className="btn-primary"><Plus size={18} /> Thêm Mới</Link>
      </div>
      <div className="table-container">
        {loading ? <div className="loader"></div> : (
          <>
          <table className="admin-table">
            <thead><tr><th>ID</th><th>Thông tin</th><th>Thao tác</th></tr></thead>
            <tbody>
              {paginatedData.map(item => (
                <tr key={item.id}>
                  <td>#{item.id}</td>
                  <td>{item.name || item.title || item.username || item.fullname || 'No Data'}</td>
                  <td>
                    <div className="action-btns">
                      <Link to={'/admin/topic/edit/' + item.id} className="btn-icon text-blue"><Edit size={18}/></Link>
                      <button className="btn-icon text-red" onClick={() => handleDelete(item.id)}><Trash2 size={18}/></button>
                    </div>
                  </td>
                </tr>
              ))}
              {data.length === 0 && <tr><td colSpan="3" className="text-center py-4">Chưa có dữ liệu.</td></tr>}
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

export default TopicList;
