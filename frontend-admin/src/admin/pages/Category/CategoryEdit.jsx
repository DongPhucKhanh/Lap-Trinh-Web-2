import React, { useState, useEffect } from 'react';
import { Bookmark, ArrowLeft, Save } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import uploadService from '../../services/uploadService';
import categoryService from '../../services/categoryService';

const CategoryEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
    const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    parentId: '', // Added for multi-level
    status: 1
  });
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    categoryService.getById(id)
      .then(res => {
        setFormData({
          ...res.data,
          parentId: res.data.parentId || ''
        });
        if (res.data.image) setImagePreview(uploadService.getImageUrl(res.data.image));
        
        // Fetch all categories for the dropdown
        return categoryService.getAll();
      })
      .then(resCats => {
        const allCats = resCats.data || [];
        if (allCats) {
          // Exclude the current category to prevent selecting itself as parent
          setCategories(allCats.filter(c => c.id.toString() !== id));
        }
        setInitialLoading(false);
      })
      .catch(err => {
        alert('Không tìm thấy danh mục!');
        navigate('/admin/category');
      });
  }, [id, navigate]);

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
    setLoading(true);
    try {
        let finalImage = formData.image || '';
        if (imageFile) {
          const uploadRes = await uploadService.uploadImage(imageFile);
          finalImage = uploadRes.filename;
        }
        const payload = { 
          ...formData, 
          image: finalImage,
          parentId: formData.parentId ? parseInt(formData.parentId) : null
        };
        
        await categoryService.update(id, payload);
        setLoading(false);
        navigate('/admin/category');
      } catch (err) {
        setLoading(false);
        alert('Lỗi: ' + (err.response?.data?.message || err.response?.data || err.message));
      }
  };

  if (initialLoading) return <div className="loader"></div>;

  return (
    <div className="admin-page">
      <div className="page-header">
        <div className="flex-row">
          <Link to="/admin/category" className="btn-icon"><ArrowLeft size={20}/></Link>
          <h2><Bookmark /> Cập Nhật Danh Mục</h2>
        </div>
      </div>

      <div className="form-container card-panel">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tên danh mục <span className="text-red">*</span></label>
            <input required type="text" value={formData.name || ''} onChange={handleNameChange} />
          </div>
          
          <div className="form-group">
            <label>Đường dẫn (Slug) <span className="text-red">*</span></label>
            <input required type="text" value={formData.slug || ''} onChange={e => setFormData({...formData, slug: e.target.value})} />
          </div>

          <div className="form-group">
            <label>Mô tả</label>
            <textarea rows="4" value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
          </div>

          <div className="form-group">
            <label>Trạng thái</label>
            <select value={formData.status} onChange={e => setFormData({...formData, status: parseInt(e.target.value)})}>
              <option value={1}>Hoạt động</option>
              <option value={0}>Ẩn</option>
            </select>
          </div>

          <div className="form-group">
            <label>Danh mục cha (Cấp trên)</label>
            <select value={formData.parentId || ''} onChange={e => setFormData({...formData, parentId: e.target.value})}>
              <option value="">-- Không có (Danh mục gốc) --</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <small style={{display: 'block', marginTop: '5px', color: '#666'}}>
              Chọn danh mục cha nếu bạn muốn danh mục này nằm bên trong danh mục khác.
            </small>
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
              <Save size={18} /> {loading ? 'Đang lưu...' : 'Lưu Thay Đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryEdit;
