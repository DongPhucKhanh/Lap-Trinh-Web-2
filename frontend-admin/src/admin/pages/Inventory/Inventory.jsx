import React, { useState, useEffect } from 'react';
import { Package, Search, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import api from '../../services/api';
import InventoryModal from './InventoryModal';

const InventoryTooltip = ({ productId, children }) => {
  const [variants, setVariants] = useState(null);
  const [show, setShow] = useState(false);

  const handleMouseEnter = async () => {
    setShow(true);
    if (!variants) {
      try {
        const res = await api.get(`/product-variants/product/${productId}`);
        setVariants(res.data);
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div 
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div style={{
          position: 'absolute',
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#1f2937',
          color: 'white',
          padding: '12px',
          borderRadius: '8px',
          zIndex: 50,
          minWidth: '220px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          marginBottom: '10px'
        }}>
          <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '8px', borderBottom: '1px solid #374151', paddingBottom: '4px' }}>
            Chi tiết tồn kho
          </div>
          {variants ? (
            variants.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '200px', overflowY: 'auto' }}>
                {variants.map(v => (
                  <div key={v.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', alignItems: 'center' }}>
                    <span>{v.color} - {v.size}</span>
                    <span style={{ 
                      fontWeight: 'bold', 
                      backgroundColor: v.qty > 0 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                      color: v.qty > 0 ? '#34d399' : '#f87171',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '12px'
                    }}>{v.qty}</span>
                  </div>
                ))}
              </div>
            ) : <div style={{ fontSize: '13px', color: '#9ca3af' }}>Sản phẩm chưa có biến thể</div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#9ca3af' }}>
              <span className="loader" style={{ width: '12px', height: '12px', borderWidth: '2px' }}></span> Đang tải...
            </div>
          )}
          
          {/* Mũi tên chỉ xuống */}
          <div style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            borderWidth: '6px',
            borderStyle: 'solid',
            borderColor: '#1f2937 transparent transparent transparent'
          }} />
        </div>
      )}
    </div>
  );
};

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products');
      setProducts(response.data);
    } catch (error) {
      console.error("Lỗi khi tải danh sách sản phẩm:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenModal = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleSaveInventory = async (updatedProduct) => {
    try {
      await api.put(`/products/${updatedProduct.id}`, updatedProduct);
      setIsModalOpen(false);
      // Refresh the list to get updated data including updatedAt
      fetchProducts();
    } catch (error) {
      console.error("Lỗi khi cập nhật kho:", error);
      alert('Có lỗi xảy ra khi cập nhật kho!');
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.id.toString().includes(searchTerm)
  );

  const getStockBadge = (qty) => {
    if (qty === 0) {
      return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold flex items-center gap-1 w-fit"><AlertCircle size={14}/> Hết hàng</span>;
    } else if (qty < 5) {
      return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold flex items-center gap-1 w-fit"><Clock size={14}/> Sắp hết</span>;
    } else {
      return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold flex items-center gap-1 w-fit"><CheckCircle2 size={14}/> Còn hàng</span>;
    }
  };

  return (
    <div className="admin-page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2><Package /> Quản lý Kho sản phẩm</h2>
        
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={18} style={{ position: 'absolute', left: '10px', color: '#9ca3af' }} />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, ID..."
            style={{ padding: '8px 12px 8px 35px', border: '1px solid #d1d5db', borderRadius: '4px', width: '250px' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="table-container">
        {loading ? (
          <div className="loader"></div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>Không tìm thấy sản phẩm nào</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Sản phẩm</th>
                <th>Tồn kho</th>
                <th>Cảnh báo</th>
                <th>Cập nhật lần cuối</th>
                <th style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => {
                const qty = product.productStore?.qty || 0;
                const updatedAt = product.productStore?.updatedAt || product.updatedAt;
                
                return (
                  <tr key={product.id}>
                    <td>#{product.id}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <img 
                          src={product.image ? (product.image.startsWith('http') ? product.image : `http://localhost:8080/uploads/${product.image}`) : 'https://placehold.co/40x40/f1f5f9/94a3b8?text=Img'} 
                          alt="" 
                          onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/40x40/f1f5f9/94a3b8?text=Img'; }}
                          style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #e2e8f0' }}
                        />
                        <div>
                          <div style={{ fontWeight: 'bold', color: '#1f2937' }}>{product.name}</div>
                          <div style={{ fontSize: '13px', color: '#6b7280' }}>{product.category?.name}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <InventoryTooltip productId={product.id}>
                        <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827', borderBottom: '1px dashed #9ca3af', cursor: 'help', padding: '0 4px' }}>{qty}</span>
                      </InventoryTooltip>
                    </td>
                    <td>{getStockBadge(qty)}</td>
                    <td style={{ fontSize: '14px', color: '#6b7280' }}>
                      {updatedAt ? new Date(updatedAt).toLocaleString('vi-VN') : 'Chưa cập nhật'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        onClick={() => handleOpenModal(product)}
                        className="btn-primary"
                        style={{ padding: '6px 12px', fontSize: '13px' }}
                      >
                        Cập nhật kho
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <InventoryModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={selectedProduct}
        onSave={handleSaveInventory}
      />
    </div>
  );
};

export default Inventory;
