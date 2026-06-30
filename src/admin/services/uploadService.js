import api from './api';

const uploadService = {
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    // Gửi POST lên endpoint /api/upload
    // api.js tự động gắn baseURL và header token
    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data; // Trả về { filename: "...", message: "..." }
  },
  
  // Tiện ích lấy URL hình ảnh đầy đủ để hiển thị
  getImageUrl: (filename) => {
    if (!filename) return '';
    // Nếu filename đã là một URL HTTP đầy đủ thì trả về nguyên bản
    if (filename.startsWith('http')) return filename;
    // Nếu không, trả về đường dẫn tới thư mục uploads của Backend
    return `http://localhost:8080/uploads/${filename}`;
  }
};

export default uploadService;
