import React, { useState, useEffect } from 'react';
import { Package, ArrowLeft, Save } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import categoryService from '../../services/categoryService';
import brandService from '../../services/brandService';
import uploadService from '../../services/uploadService';

const ProductCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    price: '',
    description: '',
    image: '',
    status: 1,
    category: { id: '' },
    brand: { id: '' }
  });

  useEffect(() => {
    categoryService.getAll().then(res => setCategories(res.data));
    brandService.getAll().then(res => setBrands(res.data));
  }, []);

  const generateSlug = (name) => {
    return name.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
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
    if (!formData.category.id) {
      alert("Vui lòng chọn danh mục!");
      return;
    }

    setLoading(true);
    
    try {
      let finalImage = formData.image;
      if (imageFile) {
        const uploadRes = await uploadService.uploadImage(imageFile);
        finalImage = uploadRes.filename;
      }

      const payload = { ...formData, image: finalImage };
      if (!payload.brand.id) {
        delete payload.brand;
      }

      await api.post('/products', payload);
      setLoading(false);
      navigate('/admin/product');
    } catch (err) {
      setLoading(false);
      alert('Lỗi: ' + (err.response?.data?.message || err.response?.data || err.message));
    }
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <div className="flex-row">
          <Link to="/admin/product" className="btn-icon"><ArrowLeft size={20}/></Link>
          <h2><Package /> Thêm Sản Phẩm Mới</h2>
        </div>
      </div>

      <div className="form-container card-panel">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tên món ăn <span className="text-red">*</span></label>
            <input required type="text" value={formData.name} onChange={handleNameChange} />
          </div>
          
          <div className="form-group">
            <label>Đường dẫn (Slug) <span className="text-red">*</span></label>
            <input required type="text" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} />
          </div>

          <div style={{display: 'flex', gap: '1rem'}}>
            <div className="form-group" style={{flex: 1}}>
              <label>Giá bán (VNĐ) <span className="text-red">*</span></label>
              <input required type="number" min="0" value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} />
            </div>

            <div className="form-group" style={{flex: 1}}>
              <label>Trạng thái</label>
              <select value={formData.status} onChange={e => setFormData({...formData, status: parseInt(e.target.value)})}>
                <option value={1}>Hoạt động</option>
                <option value={0}>Ẩn</option>
              </select>
            </div>
          </div>

          <div style={{display: 'flex', gap: '1rem'}}>
            <div className="form-group" style={{flex: 1}}>
              <label>Danh mục <span className="text-red">*</span></label>
              <select required value={formData.category.id} onChange={e => setFormData({...formData, category: { id: parseInt(e.target.value) }})}>
                <option value="">-- Chọn danh mục --</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div className="form-group" style={{flex: 1}}>
              <label>Thương hiệu</label>
              <select value={formData.brand.id} onChange={e => setFormData({...formData, brand: { id: parseInt(e.target.value) }})}>
                <option value="">-- Không có thương hiệu --</option>
                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Hình ảnh Sản phẩm</label>
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

          <div className="form-group">
            <label>Mô tả ngắn gọn</label>
            <textarea rows="4" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
          </div>

          <div className="form-actions">
            <Link to="/admin/product" className="btn-secondary">Hủy</Link>
            <button type="submit" className="btn-primary" disabled={loading}>
              <Save size={18} /> {loading ? 'Đang lưu...' : 'Lưu Sản Phẩm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductCreate;
