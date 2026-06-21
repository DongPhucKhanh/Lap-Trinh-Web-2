import api from './api';

const orderServiceService = {
  getAll: () => api.get('/orders'),
  getById: (id) => api.get('/orders/' + id),
  create: (data) => api.post('/orders', data),
  update: (id, data) => api.put('/orders/' + id, data),
  delete: (id) => api.delete('/orders/' + id)
};

export default orderServiceService;
