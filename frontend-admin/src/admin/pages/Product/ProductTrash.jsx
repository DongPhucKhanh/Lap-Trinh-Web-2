import React, { useEffect, useState } from 'react';
import { Package, Trash2, ArrowLeft, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Pagination from '../../components/Pagination/Pagination';

const ProductTrash = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const paginatedProducts = products.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const fetchTrash = () => {
    setLoading(true);
    api.get('/products/trash')
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
    fetchTrash();
  }, []);

  const handleRestore = (id) => {
    if (window.confirm('Khôi phục sản phẩm này?')) {
      api.put(`/products/${id}/restore`)
        .then(() => fetchTrash())
        .catch(err => alert('Có lỗi xảy ra: ' + err.message));
    }
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <div className="flex-row">
          <Link to="/admin/product" className="btn-icon"><ArrowLeft size={20}/></Link>
          <h2><Trash2 /> Thùng Rác Sản Phẩm</h2>
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
                <th>Tên món</th>
                <th>Giá bán</th>
                <th>Danh mục</th>
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
                  <td><strong style={{color: '#94a3b8', textDecoration: 'line-through'}}>{p.name}</strong></td>
                  <td className="price-col">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price)}</td>
                  <td>{p.category?.name || 'Không có'}</td>
                  <td>
                    <div className="action-btns">
                      <button className="btn-primary" style={{padding: '5px 10px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px'}} onClick={() => handleRestore(p.id)}>
                        <RefreshCw size={14}/> Khôi phục
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-4">Thùng rác trống.</td>
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

export default ProductTrash;
