import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import api from '../../services/api';
import uploadService from '../../services/uploadService';

const InventoryModal = ({ product, isOpen, onClose, onSave }) => {
  const [variants, setVariants] = useState([]);
  const [color, setColor] = useState('');
  const [size, setSize] = useState('');
  const [qty, setQty] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && product) {
      fetchVariants();
      setColor('');
      setSize('');
      setQty('');
      setImageFile(null);
    }
  }, [isOpen, product]);

  const fetchVariants = async () => {
    try {
      const res = await api.get(`/product-variants/product/${product.id}`);
      setVariants(res.data);
    } catch (err) {
      console.error(err);
      alert('Lỗi khi tải biến thể!');
    }
  };

  const handleAddVariant = async () => {
    if (!color || !size || !qty) {
      alert('Vui lòng nhập đủ thông tin!');
      return;
    }
    setLoading(true);
    try {
      let finalImage = '';
      if (imageFile) {
        const uploadRes = await uploadService.uploadImage(imageFile);
        finalImage = uploadRes.filename;
      }

      await api.post(`/product-variants/product/${product.id}`, {
        color, size, qty: parseInt(qty, 10), image: finalImage
      });
      alert('Thêm biến thể thành công!');
      fetchVariants();
      setColor('');
      setSize('');
      setQty('');
      setImageFile(null);
    } catch (err) {
      console.error(err);
      alert('Lỗi khi thêm biến thể!');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVariant = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa biến thể này?')) {
      try {
        await api.delete(`/product-variants/${id}`);
        alert('Đã xóa biến thể!');
        fetchVariants();
      } catch (err) {
        console.error(err);
        alert('Lỗi khi xóa!');
      }
    }
  };

  if (!isOpen || !product) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', width: '100%', maxWidth: '600px', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: '#1f2937' }}>Quản lý Biến thể & Tồn kho: {product.name}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
            <X size={20} />
          </button>
        </div>
        
        <div style={{ padding: '16px', overflowY: 'auto' }}>
          
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '15px' }}>Thêm Biến Thể Mới</h4>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', alignItems: 'center' }}>
              <input 
                type="text" 
                placeholder="Màu sắc (vd: Đen)" 
                value={color}
                onChange={e => setColor(e.target.value)}
                style={{ flex: 1, padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
              <input 
                type="text" 
                placeholder="Size (vd: 42)" 
                value={size}
                onChange={e => setSize(e.target.value)}
                style={{ flex: 1, padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
              <input 
                type="number" 
                placeholder="Số lượng" 
                value={qty}
                onChange={e => setQty(e.target.value)}
                style={{ width: '100px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
              <label style={{ cursor: 'pointer', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <ImageIcon size={16} /> {imageFile ? 'Đã chọn ảnh' : 'Ảnh'}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => setImageFile(e.target.files[0])} 
                  style={{ display: 'none' }} 
                />
              </label>
              <button 
                onClick={handleAddVariant}
                disabled={loading}
                style={{ padding: '8px 15px', backgroundColor: '#111', color: 'white', border: 'none', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}
              >
                <Plus size={16}/> {loading ? '...' : 'Thêm'}
              </button>
            </div>
          </div>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '15px' }}>Danh sách Biến thể</h4>
          <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb', textAlign: 'left' }}>
                <th style={{ padding: '10px' }}>Ảnh</th>
                <th style={{ padding: '10px' }}>Màu sắc</th>
                <th style={{ padding: '10px' }}>Kích cỡ</th>
                <th style={{ padding: '10px' }}>Tồn kho</th>
                <th style={{ padding: '10px' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {variants.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#6b7280', fontStyle: 'italic' }}>Chưa có biến thể nào.</td>
                </tr>
              ) : (
                variants.map(v => {
                  let firstVariantImg = v.image && v.image !== 'null' ? v.image.split(',')[0].trim() : '';
                  const displayImg = (firstVariantImg && firstVariantImg !== '') ? firstVariantImg : product.image;
                  
                  return (
                  <tr key={v.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '10px' }}>
                      <img 
                        src={displayImg ? (displayImg.startsWith('http') ? displayImg : `http://localhost:8080/uploads/${displayImg}`) : 'https://placehold.co/40x40/f1f5f9/94a3b8?text=Img'} 
                        alt={v.color} 
                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/40x40/f1f5f9/94a3b8?text=Img'; }}
                        style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #e2e8f0' }} 
                      />
                    </td>
                    <td style={{ padding: '10px', fontWeight: 'bold' }}>{v.color}</td>
                    <td style={{ padding: '10px' }}>{v.size}</td>
                    <td style={{ padding: '10px', color: v.qty > 0 ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>{v.qty}</td>
                    <td style={{ padding: '10px' }}>
                      <button onClick={() => handleDeleteVariant(v.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                  );
                })
              )}
              </tbody>
            </table>
        </div>
        
        <div style={{ padding: '16px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: '12px', backgroundColor: '#f9fafb' }}>
          <button onClick={onClose} style={{ padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', backgroundColor: 'white', border: '1px solid #d1d5db', color: '#374151' }}>
            Đóng
          </button>
          <button onClick={() => { onClose(); onSave(); }} style={{ padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', backgroundColor: '#111', border: 'none', color: 'white' }}>
            Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );
};

export default InventoryModal;
