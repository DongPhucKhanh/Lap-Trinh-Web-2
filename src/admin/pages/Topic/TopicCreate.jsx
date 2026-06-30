import React, { useState } from 'react';
import { FileText, ArrowLeft, Save } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import topicService from '../../services/topicService';

const TopicCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', slug: '', title: '', status: 1 });

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
      title: e.target.value,
      slug: generateSlug(e.target.value)
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    topicService.create(formData).then(() => { setLoading(false); navigate('/admin/topic'); }).catch(err => { setLoading(false); alert('Lỗi: ' + (err.response?.data || err.message)); });
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <div className="flex-row">
          <Link to="/admin/topic" className="btn-icon"><ArrowLeft size={20}/></Link>
          <h2><FileText /> Thêm Topic</h2>
        </div>
      </div>
      <div className="form-container card-panel">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tên / Tiêu đề <span className="text-red">*</span></label>
            <input required type="text" onChange={handleNameChange} value={formData.name} />
          </div>
          <div className="form-group">
            <label>Đường dẫn (Slug) <span className="text-red">*</span></label>
            <input required type="text" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} />
          </div>
          <div className="form-actions">
            <Link to="/admin/topic" className="btn-secondary">Hủy</Link>
            <button type="submit" className="btn-primary" disabled={loading}><Save size={18} /> Lưu</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TopicCreate;
