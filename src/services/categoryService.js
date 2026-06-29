import api from './api';

export default { getAll: () => api.get('/categories') };
