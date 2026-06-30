import React, { useEffect, useState } from 'react';
import { Bookmark, Trash2, Plus, Edit } from 'lucide-react';
import { Link } from 'react-router-dom';
import categoryService from '../../services/categoryService';

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = () => {
    setLoading(true);
    categoryService.getAll()
      .then(res => {
        setCategories(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xoá danh mục này? Việc này có thể ảnh hưởng đến các sản phẩm bên trong!')) {
      categoryService.delete(id)
        .then(() => fetchCategories())
        .catch(err => alert('Có lỗi xảy ra: ' + err.message));
    }
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h2><Bookmark /> Quản Lý Danh Mục</h2>
        <Link to="/admin/category/create" className="btn-primary">
          <Plus size={18} /> Thêm Danh Mục Mới
        </Link>
      </div>

      <div className="table-container">
        {loading ? <div className="loader"></div> : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Hình ảnh</th>
                <th>Tên danh mục</th>
                <th>Slug</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(c => (
                <tr key={c.id}>
                  <td>#{c.id}</td>
                  <td>
                    {c.image ? (
                      <img src={c.image.startsWith('http') ? c.image : `http://localhost:8080/uploads/${c.image}`} alt={c.name} style={{width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px'}} />
                    ) : (
                      <span className="text-muted">Không có ảnh</span>
                    )}
                  </td>
                  <td><strong>{c.name}</strong></td>
                  <td className="text-muted">{c.slug}</td>
                  <td>
                    <span className={`badge ${c.status === 1 ? 'badge-success' : 'badge-secondary'}`}>
                      {c.status === 1 ? 'Hoạt động' : 'Ẩn'}
                    </span>
                  </td>
                  <td>
                    <div className="action-btns">
                      <Link to={`/admin/category/edit/${c.id}`} className="btn-icon text-blue"><Edit size={18}/></Link>
                      <button className="btn-icon text-red" onClick={() => handleDelete(c.id)}><Trash2 size={18}/></button>
                    </div>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-4">Chưa có danh mục nào.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default CategoryList;
