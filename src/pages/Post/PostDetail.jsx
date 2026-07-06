import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Calendar, User, ArrowLeft, Share2, Volume2, Pause, Play, Square } from 'lucide-react';
import api from '../../services/api';
import './Post.css';

const PostDetail = () => {
  const { id } = useParams(); // Could be ID or SLUG
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Voice Reader State
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    // Stop speech when component unmounts
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleReadAloud = () => {
    if (!window.speechSynthesis) {
      alert("Trình duyệt của bạn không hỗ trợ đọc văn bản.");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
      return;
    }

    // Extract text from HTML
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = post.detail || '';
    const textToRead = `${post.title}. ${post.description || ''}. ${tempDiv.textContent || tempDiv.innerText || ""}`;

    if (!textToRead.trim()) return;

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = 'vi-VN'; // Vietnamese voice
    utterance.rate = 1.15; // Hơi nhanh một chút cho giống anime
    utterance.pitch = 1.8; // Tăng độ cao giọng lên mức 1.8 để tạo giọng nữ cao, dễ thương (anime)
    
    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };
    
    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
    setIsPaused(false);
  };

  const handlePauseResume = () => {
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    } else {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

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
      <div className="container" style={{maxWidth: '100%', padding: '0 2rem'}}>
        <button className="back-btn" onClick={() => navigate('/post')}>
          <ArrowLeft size={20} /> Quay lại Tin Tức
        </button>

        <div className="post-detail-wrapper">
          <div className="post-detail-header">
            <div className="topic-badge">{post.topic?.name || 'Tin Tức'}</div>
            <h1>{post.title}</h1>
            <div className="post-meta-large" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
              <div>
                <span className="meta-item"><Calendar size={16} /> {new Date(post.createdAt).toLocaleDateString('vi-VN')}</span>
                <span className="meta-item"><User size={16} /> {post.createdBy || 'Admin'}</span>
              </div>
              
              <div className="voice-reader-controls">
                {!isSpeaking ? (
                  <button className="btn-voice" onClick={handleReadAloud}>
                    <Volume2 size={16} /> Nghe bài viết
                  </button>
                ) : (
                  <div className="voice-active-controls">
                    <button className="btn-voice active" onClick={handlePauseResume}>
                      {isPaused ? <Play size={16} /> : <Pause size={16} />} 
                      {isPaused ? ' Tiếp tục' : ' Tạm dừng'}
                    </button>
                    <button className="btn-voice stop" onClick={handleReadAloud}>
                      <Square size={16} /> Dừng
                    </button>
                  </div>
                )}
              </div>
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
