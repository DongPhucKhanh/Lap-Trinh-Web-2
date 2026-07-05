import api from './api';

const contactServiceService = {
  getAll: () => api.get('/contacts'),
  getById: (id) => api.get('/contacts/' + id),
  create: (data) => api.post('/contacts', data),
  update: (id, data) => api.put('/contacts/' + id, data),
  updateStatus: (id, status) => api.put(`/contacts/${id}/status`, { status }),
  delete: (id) => api.delete('/contacts/' + id)
};

export default contactServiceService;
