const fs = require('fs');
const path = require('path');

const basePath = path.join(__dirname, 'src', 'admin');

function getServiceStr(name, endpoint) {
  return "import api from './api';\n\n" +
  "const " + name + "Service = {\n" +
  "  getAll: () => api.get('/" + endpoint + "'),\n" +
  "  getById: (id) => api.get('/" + endpoint + "/' + id),\n" +
  "  create: (data) => api.post('/" + endpoint + "', data),\n" +
  "  update: (id, data) => api.put('/" + endpoint + "/' + id, data),\n" +
  "  delete: (id) => api.delete('/" + endpoint + "/' + id)\n" +
  "};\n\n" +
  "export default " + name + "Service;\n";
}

function getListStr(entity, endpoint, service) {
  return "import React, { useEffect, useState } from 'react';\n" +
  "import { FileText, Trash2, Plus, Edit } from 'lucide-react';\n" +
  "import { Link } from 'react-router-dom';\n" +
  "import " + service + " from '../../services/" + service + "';\n\n" +
  "const " + entity + "List = () => {\n" +
  "  const [data, setData] = useState([]);\n" +
  "  const [loading, setLoading] = useState(true);\n\n" +
  "  const fetchData = () => {\n" +
  "    setLoading(true);\n" +
  "    " + service + ".getAll().then(res => { setData(res.data); setLoading(false); }).catch(err => { console.error(err); setLoading(false); });\n" +
  "  };\n\n" +
  "  useEffect(() => { fetchData(); }, []);\n\n" +
  "  const handleDelete = (id) => {\n" +
  "    if (window.confirm('Bạn có chắc chắn muốn xoá?')) {\n" +
  "      " + service + ".delete(id).then(() => fetchData()).catch(err => alert('Lỗi: ' + err.message));\n" +
  "    }\n" +
  "  };\n\n" +
  "  return (\n" +
  "    <div className=\"admin-page\">\n" +
  "      <div className=\"page-header\">\n" +
  "        <h2><FileText /> Quản Lý " + entity + "</h2>\n" +
  "        <Link to=\"/admin/" + endpoint + "/create\" className=\"btn-primary\"><Plus size={18} /> Thêm Mới</Link>\n" +
  "      </div>\n" +
  "      <div className=\"table-container\">\n" +
  "        {loading ? <div className=\"loader\"></div> : (\n" +
  "          <table className=\"admin-table\">\n" +
  "            <thead><tr><th>ID</th><th>Thông tin</th><th>Thao tác</th></tr></thead>\n" +
  "            <tbody>\n" +
  "              {data.map(item => (\n" +
  "                <tr key={item.id}>\n" +
  "                  <td>#{item.id}</td>\n" +
  "                  <td>{item.name || item.title || item.username || item.fullname || 'No Data'}</td>\n" +
  "                  <td>\n" +
  "                    <div className=\"action-btns\">\n" +
  "                      <Link to={'/admin/" + endpoint + "/edit/' + item.id} className=\"btn-icon text-blue\"><Edit size={18}/></Link>\n" +
  "                      <button className=\"btn-icon text-red\" onClick={() => handleDelete(item.id)}><Trash2 size={18}/></button>\n" +
  "                    </div>\n" +
  "                  </td>\n" +
  "                </tr>\n" +
  "              ))}\n" +
  "              {data.length === 0 && <tr><td colSpan=\"3\" className=\"text-center py-4\">Chưa có dữ liệu.</td></tr>}\n" +
  "            </tbody>\n" +
  "          </table>\n" +
  "        )}\n" +
  "      </div>\n" +
  "    </div>\n" +
  "  );\n" +
  "};\n\n" +
  "export default " + entity + "List;\n";
}

function getCreateStr(entity, endpoint, service) {
  return "import React, { useState } from 'react';\n" +
  "import { FileText, ArrowLeft, Save } from 'lucide-react';\n" +
  "import { Link, useNavigate } from 'react-router-dom';\n" +
  "import " + service + " from '../../services/" + service + "';\n\n" +
  "const " + entity + "Create = () => {\n" +
  "  const navigate = useNavigate();\n" +
  "  const [loading, setLoading] = useState(false);\n" +
  "  const [formData, setFormData] = useState({ name: '', title: '', status: 1 });\n\n" +
  "  const handleSubmit = (e) => {\n" +
  "    e.preventDefault();\n" +
  "    setLoading(true);\n" +
  "    " + service + ".create(formData).then(() => { setLoading(false); navigate('/admin/" + endpoint + "'); }).catch(err => { setLoading(false); alert('Lỗi: ' + (err.response?.data || err.message)); });\n" +
  "  };\n\n" +
  "  return (\n" +
  "    <div className=\"admin-page\">\n" +
  "      <div className=\"page-header\">\n" +
  "        <div className=\"flex-row\">\n" +
  "          <Link to=\"/admin/" + endpoint + "\" className=\"btn-icon\"><ArrowLeft size={20}/></Link>\n" +
  "          <h2><FileText /> Thêm " + entity + "</h2>\n" +
  "        </div>\n" +
  "      </div>\n" +
  "      <div className=\"form-container card-panel\">\n" +
  "        <form onSubmit={handleSubmit}>\n" +
  "          <div className=\"form-group\">\n" +
  "            <label>Tên / Tiêu đề <span className=\"text-red\">*</span></label>\n" +
  "            <input required type=\"text\" onChange={e => setFormData({...formData, name: e.target.value, title: e.target.value})} />\n" +
  "          </div>\n" +
  "          <div className=\"form-actions\">\n" +
  "            <Link to=\"/admin/" + endpoint + "\" className=\"btn-secondary\">Hủy</Link>\n" +
  "            <button type=\"submit\" className=\"btn-primary\" disabled={loading}><Save size={18} /> Lưu</button>\n" +
  "          </div>\n" +
  "        </form>\n" +
  "      </div>\n" +
  "    </div>\n" +
  "  );\n" +
  "};\n\n" +
  "export default " + entity + "Create;\n";
}

function getEditStr(entity, endpoint, service) {
  return "import React, { useState, useEffect } from 'react';\n" +
  "import { FileText, ArrowLeft, Save } from 'lucide-react';\n" +
  "import { Link, useNavigate, useParams } from 'react-router-dom';\n" +
  "import " + service + " from '../../services/" + service + "';\n\n" +
  "const " + entity + "Edit = () => {\n" +
  "  const { id } = useParams();\n" +
  "  const navigate = useNavigate();\n" +
  "  const [loading, setLoading] = useState(false);\n" +
  "  const [formData, setFormData] = useState({});\n\n" +
  "  useEffect(() => {\n" +
  "    " + service + ".getById(id).then(res => setFormData(res.data)).catch(() => navigate('/admin/" + endpoint + "'));\n" +
  "  }, [id, navigate]);\n\n" +
  "  const handleSubmit = (e) => {\n" +
  "    e.preventDefault();\n" +
  "    setLoading(true);\n" +
  "    " + service + ".update(id, formData).then(() => { setLoading(false); navigate('/admin/" + endpoint + "'); }).catch(err => { setLoading(false); alert('Lỗi: ' + (err.response?.data || err.message)); });\n" +
  "  };\n\n" +
  "  return (\n" +
  "    <div className=\"admin-page\">\n" +
  "      <div className=\"page-header\">\n" +
  "        <div className=\"flex-row\">\n" +
  "          <Link to=\"/admin/" + endpoint + "\" className=\"btn-icon\"><ArrowLeft size={20}/></Link>\n" +
  "          <h2><FileText /> Cập Nhật " + entity + "</h2>\n" +
  "        </div>\n" +
  "      </div>\n" +
  "      <div className=\"form-container card-panel\">\n" +
  "        <form onSubmit={handleSubmit}>\n" +
  "          <div className=\"form-group\">\n" +
  "            <label>Tên / Tiêu đề <span className=\"text-red\">*</span></label>\n" +
  "            <input required type=\"text\" value={formData.name || formData.title || ''} onChange={e => setFormData({...formData, name: e.target.value, title: e.target.value})} />\n" +
  "          </div>\n" +
  "          <div className=\"form-actions\">\n" +
  "            <Link to=\"/admin/" + endpoint + "\" className=\"btn-secondary\">Hủy</Link>\n" +
  "            <button type=\"submit\" className=\"btn-primary\" disabled={loading}><Save size={18} /> Lưu</button>\n" +
  "          </div>\n" +
  "        </form>\n" +
  "      </div>\n" +
  "    </div>\n" +
  "  );\n" +
  "};\n\n" +
  "export default " + entity + "Edit;\n";
}

const entities = [
  { entity: 'Banner', endpoint: 'banner', service: 'bannerService', endpoints_api: 'banners' },
  { entity: 'Post', endpoint: 'post', service: 'postService', endpoints_api: 'posts' },
  { entity: 'Topic', endpoint: 'topic', service: 'topicService', endpoints_api: 'topics' },
  { entity: 'User', endpoint: 'user', service: 'userService', endpoints_api: 'users' },
  { entity: 'Contact', endpoint: 'contact', service: 'contactService', endpoints_api: 'contacts' },
  { entity: 'Order', endpoint: 'order', service: 'orderService', endpoints_api: 'orders' },
  { entity: 'Menu', endpoint: 'menu', service: 'menuService', endpoints_api: 'menus' },
  { entity: 'Customer', endpoint: 'customer', service: 'customerService', endpoints_api: 'customers' }
];

entities.forEach(item => {
  fs.writeFileSync(path.join(basePath, 'services', item.service + '.js'), getServiceStr(item.service, item.endpoints_api));
  
  const pageDir = path.join(basePath, 'pages', item.entity);
  if (!fs.existsSync(pageDir)) fs.mkdirSync(pageDir, { recursive: true });

  fs.writeFileSync(path.join(pageDir, item.entity + 'List.jsx'), getListStr(item.entity, item.endpoint, item.service));
  
  // For standard entities we generate Create/Edit, for Order/Contact/Customer we should generate generic ones as requested so it doesn't break
  fs.writeFileSync(path.join(pageDir, item.entity + 'Create.jsx'), getCreateStr(item.entity, item.endpoint, item.service));
  fs.writeFileSync(path.join(pageDir, item.entity + 'Edit.jsx'), getEditStr(item.entity, item.endpoint, item.service));
  fs.writeFileSync(path.join(pageDir, item.entity + 'Detail.jsx'), getEditStr(item.entity, item.endpoint, item.service)); // just a placeholder
});

console.log('Success');
