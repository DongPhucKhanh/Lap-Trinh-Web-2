import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, Home } from 'lucide-react';

const NotFound = () => { 
  return (
    <div style={{
      minHeight: '70vh', 
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'center', 
      alignItems: 'center',
      textAlign: 'center',
      padding: '2rem'
    }}>
      <FileQuestion size={100} color="#cbd5e1" style={{ marginBottom: '2rem' }} />
      <h1 style={{ fontSize: '4rem', color: '#1e293b', margin: '0 0 1rem 0' }}>404</h1>
      <h2 style={{ fontSize: '1.5rem', color: '#475569', margin: '0 0 2rem 0' }}>Trang không tồn tại</h2>
      <p style={{ color: '#64748b', maxWidth: '500px', marginBottom: '2.5rem', lineHeight: '1.6' }}>
        Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã bị gỡ bỏ. 
        Vui lòng kiểm tra lại đường dẫn hoặc quay về trang chủ.
      </p>
      <Link to="/" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 28px',
        background: 'var(--primary)',
        color: 'white',
        borderRadius: '8px',
        textDecoration: 'none',
        fontWeight: '600',
        transition: 'all 0.3s'
      }}>
        <Home size={18} /> Quay về Trang chủ
      </Link>
    </div>
  ); 
};

export default NotFound;
