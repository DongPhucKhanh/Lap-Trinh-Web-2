import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, ArrowRight } from 'lucide-react';
import api from '../../services/api';
import './Post.css';

const PostList = () => {
  const [posts, setPosts] = useState([]);
  const [topics, setTopics] = useState([{ id: 'all', name: 'Tất cả chủ đề' }]);
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/posts')
      .then(res => {
        // Filter out inactive posts (status !== 1 implies inactive typically, but let's assume status 1 is active)
        const activePosts = res.data.filter(p => p.status === 1);
        setPosts(activePosts);
        
        // Extract unique topics
        const topicMap = new Map();
        const extractedTopics = [{ id: 'all', name: 'Tất cả chủ đề' }];
        activePosts.forEach(p => {
          if (p.topic && p.topic.id && !topicMap.has(p.topic.id)) {
            topicMap.set(p.topic.id, true);
            extractedTopics.push({ id: p.topic.id, name: p.topic.name });
          }
        });
        setTopics(extractedTopics);
        
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="loader"></div>;

  const displayedPosts = selectedTopic === 'all' 
    ? posts 
    : posts.filter(p => p.topic && p.topic.id === selectedTopic);

  return (
    <div className="post-list-page">
      <div className="container">
        <div className="post-header text-center">
          <h1>Góc Giày Thể Thao & Tin Tức</h1>
          <p>Khám phá những xu hướng thời trang mới nhất và các chương trình khuyến mãi từ Nova Store</p>
        </div>

        {topics.length > 1 && (
          <div className="post-topic-filters" style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '2rem', flexWrap: 'wrap' }}>
            {topics.map(t => (
              <button 
                key={t.id}
                onClick={() => setSelectedTopic(t.id)}
                className={`btn-topic-filter ${selectedTopic === t.id ? 'active' : ''}`}
                style={{
                  padding: '8px 20px',
                  borderRadius: '30px',
                  border: '1px solid #e2e8f0',
                  background: selectedTopic === t.id ? '#1e293b' : 'white',
                  color: selectedTopic === t.id ? 'white' : '#475569',
                  fontWeight: selectedTopic === t.id ? '600' : '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {t.name}
              </button>
            ))}
          </div>
        )}

        {displayedPosts.length === 0 ? (
          <div className="empty-msg text-center" style={{padding: '5rem 0'}}>
            <h3>Không tìm thấy bài viết nào.</h3>
            <p>Vui lòng chọn chủ đề khác nhé!</p>
          </div>
        ) : (
          <div className="post-grid">
            {displayedPosts.map(post => (
              <div key={post.id} className="post-card">
                <Link to={`/post/${post.slug || post.id}`} className="post-img-link">
                  <div className="post-img-wrapper">
                    <img 
                      src={post.image ? (post.image.startsWith('http') ? post.image : `http://localhost:8080/uploads/${post.image}`) : 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80'} 
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
