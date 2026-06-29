import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, ArrowRight } from 'lucide-react';
import api from '../../services/api';
import './Post.css';

const PostList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/posts')
      .then(res => {
        // Filter out inactive posts (status !== 1 implies inactive typically, but let's assume status 1 is active)
        const activePosts = res.data.filter(p => p.status === 1);
        setPosts(activePosts);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="loader"></div>;

  return (
    <div className="post-list-page">
      <div className="container">
        <div className="post-header text-center">
          <h1>Góc Ăn Vặt & Tin Tức</h1>
          <p>Khám phá những xu hướng ẩm thực mới nhất và các chương trình khuyến mãi từ SnackHub</p>
        </div>

        {posts.length === 0 ? (
          <div className="empty-msg text-center" style={{padding: '5rem 0'}}>
            <h3>Chưa có bài viết nào được đăng.</h3>
            <p>Vui lòng quay lại sau nhé!</p>
          </div>
        ) : (
          <div className="post-grid">
            {posts.map(post => (
              <div key={post.id} className="post-card">
                <Link to={`/post/${post.slug || post.id}`} className="post-img-link">
                  <div className="post-img-wrapper">
                    <img 
                      src={post.image ? (post.image.startsWith('http') ? post.image : `http://localhost:8080/uploads/${post.image}`) : 'https://images.unsplash.com/photo-1599490659213-e2b9527bd08c?auto=format&fit=crop&w=600&q=80'} 
                      alt={post.title} 
                    />
                    <div className="post-topic-badge">{post.topic?.name || 'Tin Tức'}</div>
                  </div>
                </Link>
                
                <div className="post-content">
                  <div className="post-meta">
                    <span className="meta-item"><Calendar size={14} /> {new Date(post.createdAt).toLocaleDateString('vi-VN')}</span>
                    <span className="meta-item"><User size={14} /> {post.createdBy || 'Admin'}</span>
                  </div>
                  
                  <Link to={`/post/${post.slug || post.id}`} className="post-title-link">
                    <h3 className="post-title">{post.title}</h3>
                  </Link>
                  
                  <p className="post-desc">{post.description || 'Chưa có mô tả ngắn...'}</p>
                  
                  <Link to={`/post/${post.slug || post.id}`} className="btn-read-more">
                    Đọc tiếp <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PostList;
