import api from './api';

const brandService = {
  getAll: () => api.get('/brands')
};

export default brandService;
