import React, { useState } from 'react';
import { Bookmark, ArrowLeft, Save } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import uploadService from '../../services/uploadService';
import categoryService from '../../services/categoryService';

const CategoryCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
    const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    status: 1
  });

  const generateSlug = (name) => {
    return name.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove diacritics
      .replace(/[đĐ]/g, "d")
      .replace(/([^0-9a-z-\s])/g, '')
      .replace(/(\s+)/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNameChange = (e) => {
    setFormData({
      ...formData,
      name: e.target.value,
      slug: generateSlug(e.target.value)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
        let finalImage = formData.image || '';
        if (imageFile) {
          const uploadRes = await uploadService.uploadImage(imageFile);
          finalImage = uploadRes.filename;
        }
        const payload = { ...formData, image: finalImage };
        
        await categoryService.create(payload);
        setLoading(false);
        navigate('/admin/category');
      } catch (err) {
        setLoading(false);
        alert('Lỗi: ' + (err.response?.data?.message || err.response?.data || err.message));
      }
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <div className="flex-row">
          <Link to="/admin/category" className="btn-icon"><ArrowLeft size={20}/></Link>
          <h2><Bookmark /> Thêm Danh Mục Mới</h2>
        </div>
      </div>

      <div className="form-container card-panel">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tên danh mục <span className="text-red">*</span></label>
            <input required type="text" value={formData.name} onChange={handleNameChange} placeholder="Nhập tên danh mục..." />
          </div>
          
          <div className="form-group">
            <label>Đường dẫn (Slug) <span className="text-red">*</span></label>
            <input required type="text" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} />
          </div>

          <div className="form-group">
            <label>Mô tả</label>
            <textarea rows="4" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Mô tả về danh mục..."></textarea>
          </div>

          <div className="form-group">
            <label>Trạng thái</label>
            <select value={formData.status} onChange={e => setFormData({...formData, status: parseInt(e.target.value)})}>
              <option value={1}>Hoạt động</option>
              <option value={0}>Ẩn</option>
            </select>
          </div>

          
          <div className="form-group">
            <label>Hình ảnh</label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={e => {
                const file = e.target.files[0];
                if (file) {
                  setImageFile(file);
                  setImagePreview(URL.createObjectURL(file));
                }
              }} 
            />
            {imagePreview && <img src={imagePreview} alt="Preview" style={{marginTop: '10px', maxHeight: '100px', borderRadius: '8px'}} />}
          </div>
          <div className="form-actions">
            <Link to="/admin/category" className="btn-secondary">Hủy</Link>
            <button type="submit" className="btn-primary" disabled={loading}>
              <Save size={18} /> {loading ? 'Đang lưu...' : 'Lưu Danh Mục'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryCreate;
