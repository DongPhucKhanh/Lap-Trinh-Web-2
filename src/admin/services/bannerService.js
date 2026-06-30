import api from './api';

const bannerServiceService = {
  getAll: () => api.get('/banners'),
  getById: (id) => api.get('/banners/' + id),
  create: (data) => api.post('/banners', data),
  update: (id, data) => api.put('/banners/' + id, data),
  delete: (id) => api.delete('/banners/' + id)
};

export default bannerServiceService;
