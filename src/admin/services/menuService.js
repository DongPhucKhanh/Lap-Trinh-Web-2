import api from './api';

const menuServiceService = {
  getAll: () => api.get('/menus'),
  getById: (id) => api.get('/menus/' + id),
  create: (data) => api.post('/menus', data),
  update: (id, data) => api.put('/menus/' + id, data),
  delete: (id) => api.delete('/menus/' + id)
};

export default menuServiceService;
