const fs = require('fs');
const path = require('path');

const basePath = path.join(__dirname, 'src', 'admin');

// 1. Fix incorrect imports in Brand and Category
const dirsToFix = ['Brand', 'Category'];
dirsToFix.forEach(dir => {
    const dirPath = path.join(basePath, 'pages', dir);
    if (fs.existsSync(dirPath)) {
        fs.readdirSync(dirPath).forEach(file => {
            const filePath = path.join(dirPath, file);
            let content = fs.readFileSync(filePath, 'utf8');
            content = content.replace(/import (\w+) from '\.\.\/\.\.\/\.\.\/services\/(\w+)';/g, "import $1 from '../../services/$2';");
            fs.writeFileSync(filePath, content, 'utf8');
        });
    }
});

// 2. Generators for Services
const generateService = (name, endpoint) => `import api from './api';

const ${name}Service = {
  getAll: () => api.get('/${endpoint}'),
  getById: (id) => api.get(\`/${endpoint}/\${id}\`),
  create: (data) => api.post('/${endpoint}', data),
  update: (id, data) => api.put(\`/${endpoint}/\${id}\`, data),
  delete: (id) => api.delete(\`/${endpoint}/\${id}\`)
};

export default ${name}Service;`;

// 3. Generators for Pages (List, Create, Edit)
const generateList = (entity, endpoint, service) => `import React, { useEffect, useState } from 'react';
import { FileText, Trash2, Plus, Edit } from 'lucide-react';
import { Link } from 'react-router-dom';
import ${service} from '../../services/${service}';

const ${entity}List = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    ${service}.getAll()
      .then(res => { setData(res.data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xoá mục này?')) {
      ${service}.delete(id)
        .then(() => fetchData())
        .catch(err => alert('Lỗi: ' + err.message));
    }
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h2><FileText /> Quản Lý ${entity}</h2>
        <Link to="/admin/${endpoint}/create" className="btn-primary">
          <Plus size={18} /> Thêm Mới
        </Link>
      </div>
      <div className="table-container">
        {loading ? <div className="loader"></div> : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Thông tin</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {data.map(item => (
                <tr key={item.id}>
                  <td>#{item.id}</td>
                  <td>{item.name || item.title || item.username || item.email || 'No Data'}</td>
                  <td>
                    <div className="action-btns">
                      <Link to={\`/admin/${endpoint}/edit/\${item.id}\`} className="btn-icon text-blue"><Edit size={18}/></Link>
                      <button className="btn-icon text-red" onClick={() => handleDelete(item.id)}><Trash2 size={18}/></button>
                    </div>
                  </td>
                </tr>
              ))}
              {data.length === 0 && <tr><td colSpan="3" className="text-center py-4">Chưa có dữ liệu.</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ${entity}List;`;

const generateCreate = (entity, endpoint, service) => `import React, { useState } from 'react';
import { FileText, ArrowLeft, Save } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import ${service} from '../../services/${service}';

const ${entity}Create = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', title: '', status: 1 });

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    ${service}.create(formData)
      .then(() => { setLoading(false); navigate('/admin/${endpoint}'); })
      .catch(err => { setLoading(false); alert('Lỗi: ' + (err.response?.data || err.message)); });
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <div className="flex-row">
          <Link to="/admin/${endpoint}" className="btn-icon"><ArrowLeft size={20}/></Link>
          <h2><FileText /> Thêm ${entity}</h2>
        </div>
      </div>
      <div className="form-container card-panel">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tên / Tiêu đề <span className="text-red">*</span></label>
            <input required type="text" onChange={e => setFormData({...formData, name: e.target.value, title: e.target.value})} />
          </div>
          <div className="form-actions">
            <Link to="/admin/${endpoint}" className="btn-secondary">Hủy</Link>
            <button type="submit" className="btn-primary" disabled={loading}>
              <Save size={18} /> Lưu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default ${entity}Create;`;

const generateEdit = (entity, endpoint, service) => `import React, { useState, useEffect } from 'react';
import { FileText, ArrowLeft, Save } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ${service} from '../../services/${service}';

const ${entity}Edit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    ${service}.getById(id).then(res => setFormData(res.data)).catch(() => navigate('/admin/${endpoint}'));
  }, [id, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    ${service}.update(id, formData)
      .then(() => { setLoading(false); navigate('/admin/${endpoint}'); })
      .catch(err => { setLoading(false); alert('Lỗi: ' + (err.response?.data || err.message)); });
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <div className="flex-row">
          <Link to="/admin/${endpoint}" className="btn-icon"><ArrowLeft size={20}/></Link>
          <h2><FileText /> Cập Nhật ${entity}</h2>
        </div>
      </div>
      <div className="form-container card-panel">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tên / Tiêu đề <span className="text-red">*</span></label>
            <input required type="text" value={formData.name || formData.title || ''} onChange={e => setFormData({...formData, name: e.target.value, title: e.target.value})} />
          </div>
          <div className="form-actions">
            <Link to="/admin/${endpoint}" className="btn-secondary">Hủy</Link>
            <button type="submit" className="btn-primary" disabled={loading}>
              <Save size={18} /> Lưu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default ${entity}Edit;`;

const entitiesToGenerate = [
    { entity: 'Banner', endpoint: 'banner', service: 'bannerService', endpoints_api: 'banners' },
    { entity: 'Post', endpoint: 'post', service: 'postService', endpoints_api: 'posts' },
    { entity: 'Topic', endpoint: 'topic', service: 'topicService', endpoints_api: 'topics' },
    { entity: 'User', endpoint: 'user', service: 'userService', endpoints_api: 'users' },
    { entity: 'Contact', endpoint: 'contact', service: 'contactService', endpoints_api: 'contacts' },
    { entity: 'Order', endpoint: 'order', service: 'orderService', endpoints_api: 'orders' }
];

entitiesToGenerate.forEach(item => {
    // Write service
    fs.writeFileSync(path.join(basePath, 'services', \`\${item.service}.js\`), generateService(item.endpoint, item.endpoints_api));
    
    // Create folders
    const pageDir = path.join(basePath, 'pages', item.entity);
    if (!fs.existsSync(pageDir)) fs.mkdirSync(pageDir, { recursive: true });

    // Write components
    fs.writeFileSync(path.join(pageDir, \`\${item.entity}List.jsx\`), generateList(item.entity, item.endpoint, item.service));
    
    // For Order and Contact, we usually don't Create/Edit from admin dashboard like normal entities, but we'll generate generic ones to avoid missing routes.
    fs.writeFileSync(path.join(pageDir, \`\${item.entity}Create.jsx\`), generateCreate(item.entity, item.endpoint, item.service));
    fs.writeFileSync(path.join(pageDir, \`\${item.entity}Edit.jsx\`), generateEdit(item.entity, item.endpoint, item.service));
});

console.log('All missing CRUD functionalities generated and imports fixed.');
