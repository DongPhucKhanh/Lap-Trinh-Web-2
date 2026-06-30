import React, { useState } from 'react';
import { FileText, ArrowLeft, Save } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import uploadService from '../../services/uploadService';
import postService from '../../services/postService';

const PostCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
    const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [formData, setFormData] = useState({ name: '', title: '', slug: '', topic: { id: '' }, status: 1 });
  const [topics, setTopics] = useState([]);

  React.useEffect(() => {
    import('../../services/topicService').then(module => {
      module.default.getAll().then(res => setTopics(res.data)).catch(err => console.error(err));
    });
  }, []);

  const generateSlug = (name) => {
    let slug = name.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[đĐ]/g, "d")
      .replace(/([^0-9a-z-\s])/g, '')
      .replace(/(\s+)/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
    return slug.substring(0, 250);
  };

  const handleNameChange = (e) => {
    setFormData({
      ...formData,
      name: e.target.value,
      title: e.target.value,
      slug: generateSlug(e.target.value)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.topic || !formData.topic.id) {
      alert("Vui lòng chọn chủ đề!");
      return;
    }
    setLoading(true);
    try {
        let finalImage = formData.image || '';
        if (imageFile) {
          const uploadRes = await uploadService.uploadImage(imageFile);
          finalImage = uploadRes.filename;
        }
        const payload = { ...formData, image: finalImage };
        
        await postService.create(payload);
        setLoading(false);
        navigate('/admin/post');
      } catch (err) {
        setLoading(false);
        alert('Lỗi: ' + (err.response?.data?.message || err.response?.data || err.message));
      }
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <div className="flex-row">
          <Link to="/admin/post" className="btn-icon"><ArrowLeft size={20}/></Link>
          <h2><FileText /> Thêm Post</h2>
        </div>
      </div>
      <div className="form-container card-panel">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Chủ đề (Topic) <span className="text-red">*</span></label>
            <select required value={formData.topic?.id || ''} onChange={e => setFormData({...formData, topic: { id: e.target.value }})}>
              <option value="">-- Chọn Chủ Đề --</option>
              {topics.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Tên / Tiêu đề <span className="text-red">*</span></label>
            <input required type="text" maxLength="255" onChange={handleNameChange} value={formData.name || formData.title || ''} />
          </div>
          <div className="form-group">
            <label>Đường dẫn (Slug) <span className="text-red">*</span></label>
            <input required type="text" maxLength="255" value={formData.slug || ''} onChange={e => setFormData({...formData, slug: e.target.value})} />
          </div>

          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label>Nội dung chi tiết</label>
            <textarea 
              rows="8" 
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
              value={formData.detail || ''} 
              onChange={e => setFormData({...formData, detail: e.target.value})} 
            />
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
            <Link to="/admin/post" className="btn-secondary">Hủy</Link>
            <button type="submit" className="btn-primary" disabled={loading}><Save size={18} /> Lưu</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostCreate;
