import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Calendar, User, ArrowLeft, Share2 } from 'lucide-react';
import api from '../../services/api';
import './Post.css';

const PostDetail = () => {
  const { id } = useParams(); // Could be ID or SLUG
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // First try to fetch all to find by slug, or if it's numeric fetch by ID
    const fetchPost = async () => {
      try {
        const isNumeric = /^\d+$/.test(id);
        if (isNumeric) {
          const res = await api.get(`/posts/${id}`);
          setPost(res.data);
        } else {
          // If slug, we might need to find it in the list (since backend doesn't have getBySlug)
          const res = await api.get('/posts');
          const found = res.data.find(p => p.slug === id);
          if (found) {
            setPost(found);
          } else {
            setError('Không tìm thấy bài viết!');
          }
        }
      } catch (err) {
        console.error(err);
        setError('Không tìm thấy bài viết!');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPost();
  }, [id]);

  if (loading) return <div className="loader"></div>;
  
  if (error || !post) return (
    <div className="empty-msg text-center" style={{padding: '5rem 0'}}>
      <h2>{error || 'Bài viết không tồn tại'}</h2>
      <button className="btn-primary mt-4" onClick={() => navigate('/post')}>Quay lại danh sách</button>
    </div>
  );

  return (
    <div className="post-detail-page">
      <div className="container" style={{maxWidth: 800}}>
        <button className="back-btn" onClick={() => navigate('/post')}>
          <ArrowLeft size={20} /> Quay lại Tin Tức
        </button>

        <div className="post-detail-wrapper">
          <div className="post-detail-header">
            <div className="topic-badge">{post.topic?.name || 'Tin Tức'}</div>
            <h1>{post.title}</h1>
            <div className="post-meta-large">
              <span className="meta-item"><Calendar size={16} /> {new Date(post.createdAt).toLocaleDateString('vi-VN')}</span>
              <span className="meta-item"><User size={16} /> {post.createdBy || 'Admin'}</span>
            </div>
          </div>

          <div className="post-detail-featured-image">
            <img 
              src={post.image ? (post.image.startsWith('http') ? post.image : `http://localhost:8080/uploads/${post.image}`) : 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80'} 
              alt={post.title} 
            />
          </div>

          <div className="post-detail-content">
            {post.description && (
              <div className="post-intro-desc">
                {post.description}
              </div>
            )}
            
            {post.detail ? (
              <div className="html-content" dangerouslySetInnerHTML={{ __html: post.detail }} />
            ) : (
              <p>Nội dung đang được cập nhật...</p>
            )}
          </div>

          <div className="post-detail-footer">
            <div className="share-section">
              <span><Share2 size={18} /> Chia sẻ bài viết:</span>
              <button className="share-btn fb" onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank', 'width=600,height=400')}>FB</button>
              <button className="share-btn tw" onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(post.name || '')}`, '_blank', 'width=600,height=400')}>TW</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
