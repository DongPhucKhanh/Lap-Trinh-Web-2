import React, { useEffect, useState } from 'react';
import { Package, Trash2, Plus, Edit } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = () => {
    setLoading(true);
    api.get('/products')
      .then(res => {
        setProducts(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xoá món này?')) {
      api.delete(`/products/${id}`)
        .then(() => fetchProducts())
        .catch(err => alert('Có lỗi xảy ra: ' + err.message));
    }
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h2><Package /> Quản Lý Sản Phẩm</h2>
        <Link to="/admin/product/create" className="btn-primary">
          <Plus size={18} /> Thêm Món Mới
        </Link>
      </div>

      <div className="table-container">
        {loading ? <div className="loader"></div> : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Hình ảnh</th>
                <th>Tên món</th>
                <th>Giá bán</th>
                <th>Danh mục</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td>#{p.id}</td>
                  <td>
                    <img src={p.image ? (p.image.startsWith('http') ? p.image : `http://localhost:8080/uploads/${p.image}`) : 'https://via.placeholder.com/50'} alt={p.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                  </td>
                  <td><strong>{p.name}</strong></td>
                  <td className="price-col">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price)}</td>
                  <td>{p.category?.name || 'Không có'}</td>
                  <td>
                    <div className="action-btns">
                      <Link to={`/admin/product/edit/${p.id}`} className="btn-icon text-blue"><Edit size={18}/></Link>
                      <button className="btn-icon text-red" onClick={() => handleDelete(p.id)}><Trash2 size={18}/></button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-4">Chưa có sản phẩm nào.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ProductList;
