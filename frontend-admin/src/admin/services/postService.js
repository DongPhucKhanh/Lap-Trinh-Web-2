import api from './api';

const postServiceService = {
  getAll: () => api.get('/posts'),
  getById: (id) => api.get('/posts/' + id),
  create: (data) => api.post('/posts', data),
  update: (id, data) => api.put('/posts/' + id, data),
  delete: (id) => api.delete('/posts/' + id)
};

export default postServiceService;
