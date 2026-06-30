import React, { useState, useEffect } from 'react';
import { FileText, ArrowLeft, Save } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import contactService from '../../services/contactService';

const ContactEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    contactService.getById(id).then(res => setFormData(res.data)).catch(() => navigate('/admin/contact'));
  }, [id, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    contactService.update(id, formData).then(() => { setLoading(false); navigate('/admin/contact'); }).catch(err => { setLoading(false); alert('Lỗi: ' + (err.response?.data || err.message)); });
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <div className="flex-row">
          <Link to="/admin/contact" className="btn-icon"><ArrowLeft size={20}/></Link>
          <h2><FileText /> Cập Nhật Contact</h2>
        </div>
      </div>
      <div className="form-container card-panel">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tên / Tiêu đề <span className="text-red">*</span></label>
            <input required type="text" value={formData.name || formData.title || ''} onChange={e => setFormData({...formData, name: e.target.value, title: e.target.value})} />
          </div>
          <div className="form-actions">
            <Link to="/admin/contact" className="btn-secondary">Hủy</Link>
            <button type="submit" className="btn-primary" disabled={loading}><Save size={18} /> Lưu</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactEdit;
