import React, { useEffect, useState } from 'react';
import { Package, Trash2, Plus, Edit } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Pagination from '../../components/Pagination/Pagination';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const paginatedProducts = products.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
    if (window.confirm('Bạn có chắc chắn muốn đưa món này vào thùng rác?')) {
      api.delete(`/products/${id}`)
        .then(() => fetchProducts())
        .catch(err => alert('Có lỗi xảy ra: ' + err.message));
    }
  };

  const toggleStatus = (id) => {
    api.put(`/products/${id}/status`)
      .then(() => fetchProducts())
      .catch(err => alert('Có lỗi xảy ra: ' + err.message));
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h2><Package /> Quản Lý Sản Phẩm</h2>
        <div style={{display: 'flex', gap: '10px'}}>
          <Link to="/admin/product/trash" className="btn-secondary">
            Thùng rác
          </Link>
          <Link to="/admin/product/create" className="btn-primary">
            <Plus size={18} /> Thêm Hàng Mới
          </Link>
        </div>
      </div>

      <div className="table-container">
        {loading ? <div className="loader"></div> : (
          <>
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Hình ảnh</th>
                <th>Tên sản phẩm</th>
                <th>Giá bán</th>
                <th>Danh mục</th>
                <th>Tồn kho</th>
                <th>Hiển thị</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.map(p => (
                <tr key={p.id}>
                  <td>#{p.id}</td>
                  <td>
                    <img src={p.image ? (p.image.startsWith('http') ? p.image : `http://localhost:8080/uploads/${p.image}`) : 'https://via.placeholder.com/50'} alt={p.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                  </td>
                  <td>
                    <strong>{p.name}</strong>
                    {p.isFeatured && <span style={{fontSize: '12px', color: '#e67e22', display: 'block'}}>⭐ Nổi bật</span>}
                  </td>
                  <td className="price-col">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price)}
                    {p.productSale && (
                      <div style={{fontSize: '12px', color: '#e74c3c'}}>
                        Sale: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.productSale.pricesale)}
                      </div>
                    )}
                  </td>
                  <td>{p.category?.name || 'Không có'}</td>
                  <td>{p.productStore ? p.productStore.qty : 0}</td>
                  <td>
                    <button 
                      onClick={() => toggleStatus(p.id)} 
                      style={{
                        padding: '4px 10px', 
                        borderRadius: '20px', 
                        border: 'none', 
                        background: p.status === 1 ? '#10b981' : '#94a3b8', 
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}>
                      {p.status === 1 ? 'Bật' : 'Tắt'}
                    </button>
                  </td>
                  <td>
                    <div className="action-btns">
                      <Link to={`/admin/product/edit/${p.id}`} className="btn-icon text-blue"><Edit size={18}/></Link>
                      <button className="btn-icon text-red" onClick={() => handleDelete(p.id)} title="Xóa mềm"><Trash2 size={18}/></button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan="8" className="text-center py-4">Chưa có sản phẩm nào.</td>
                </tr>
              )}
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

export default ProductList;
