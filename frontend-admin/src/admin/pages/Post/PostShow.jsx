import React, { useEffect, useState } from 'react';
import { Eye, ArrowLeft, FileText, Calendar, User } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import postService from '../../services/postService';

const PostShow = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    postService.getById(id)
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <div className="admin-page"><div className="loader"></div></div>;
  }

  if (!data) {
    return <div className="admin-page"><p>Không tìm thấy bài viết.</p></div>;
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <div className="flex-row">
          <Link to="/admin/post" className="btn-icon"><ArrowLeft size={20}/></Link>
          <h2><Eye /> Chi Tiết Bài Viết</h2>
        </div>
      </div>
      
      <div className="card-panel">
        <h1 style={{ fontSize: '24px', marginBottom: '10px' }}>{data.title || data.name}</h1>
        <div style={{ display: 'flex', gap: '20px', color: '#6c757d', marginBottom: '20px', fontSize: '14px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Calendar size={14}/> {new Date(data.createdAt).toLocaleString()}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><FileText size={14}/> Chủ đề: {data.topic?.name || 'Không rõ'}</span>
        </div>

        {data.image && (
          <div style={{ marginBottom: '20px' }}>
            <img 
              src={data.image.startsWith('http') ? data.image : `http://localhost:8080/uploads/${data.image}`} 
              alt={data.title} 
              style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain', borderRadius: '8px' }} 
            />
          </div>
        )}

        <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
          <strong>Đường dẫn (Slug):</strong> {data.slug}
        </div>

        <div className="post-content">
          <h3 style={{ marginBottom: '10px', fontSize: '18px' }}>Nội dung bài viết:</h3>
          {data.detail ? (
            <div dangerouslySetInnerHTML={{ __html: data.detail }} style={{ lineHeight: '1.6' }} />
          ) : (
            <p style={{ fontStyle: 'italic', color: '#888' }}>Chưa có nội dung (detail).</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostShow;
