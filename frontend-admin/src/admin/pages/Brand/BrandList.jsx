import React, { useEffect, useState } from 'react';
import { Tag, Trash2, Plus, Edit } from 'lucide-react';
import { Link } from 'react-router-dom';
import brandService from '../../services/brandService';

const BrandList = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBrands = () => {
    setLoading(true);
    brandService.getAll()
      .then(res => {
        setBrands(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xoá thương hiệu này?')) {
      brandService.delete(id)
        .then(() => fetchBrands())
        .catch(err => alert('Có lỗi xảy ra: ' + err.message));
    }
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h2><Tag /> Quản Lý Thương Hiệu</h2>
        <Link to="/admin/brand/create" className="btn-primary">
          <Plus size={18} /> Thêm Thương Hiệu
        </Link>
      </div>

      <div className="table-container">
        {loading ? <div className="loader"></div> : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên thương hiệu</th>
                <th>Slug</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {brands.map(b => (
                <tr key={b.id}>
                  <td>#{b.id}</td>
                  <td><strong>{b.name}</strong></td>
                  <td className="text-muted">{b.slug}</td>
                  <td>
                    <span className={`badge ${b.status === 1 ? 'badge-success' : 'badge-secondary'}`}>
                      {b.status === 1 ? 'Hoạt động' : 'Ẩn'}
                    </span>
                  </td>
                  <td>
                    <div className="action-btns">
                      <Link to={`/admin/brand/edit/${b.id}`} className="btn-icon text-blue"><Edit size={18}/></Link>
                      <button className="btn-icon text-red" onClick={() => handleDelete(b.id)}><Trash2 size={18}/></button>
                    </div>
                  </td>
                </tr>
              ))}
              {brands.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-4">Chưa có thương hiệu nào.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default BrandList;
