import React, { useState } from 'react';
import { FileText, ArrowLeft, Save } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import contactService from '../../services/contactService';

const ContactCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', title: '', status: 1 });

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    contactService.create(formData).then(() => { setLoading(false); navigate('/admin/contact'); }).catch(err => { setLoading(false); alert('Lỗi: ' + (err.response?.data || err.message)); });
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <div className="flex-row">
          <Link to="/admin/contact" className="btn-icon"><ArrowLeft size={20}/></Link>
          <h2><FileText /> Thêm Contact</h2>
        </div>
      </div>
      <div className="form-container card-panel">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tên / Tiêu đề <span className="text-red">*</span></label>
            <input required type="text" onChange={e => setFormData({...formData, name: e.target.value, title: e.target.value})} />
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

export default ContactCreate;
