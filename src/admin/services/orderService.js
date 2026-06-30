import api from './api';

const orderServiceService = {
  getAll: () => api.get('/orders'),
  getById: (id) => api.get('/orders/' + id),
  create: (data) => api.post('/orders', data),
  update: (id, data) => api.put('/orders/' + id, data),
  updateStatus: (id, data) => api.put('/orders/' + id + '/status', data),
  delete: (id) => api.delete('/orders/' + id),
  deleteItem: (orderId, itemId, reason) => api.delete(`/orders/${orderId}/items/${itemId}`, { data: { reason } })
};

export default orderServiceService;
