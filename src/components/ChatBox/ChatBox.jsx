import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, Sparkles } from 'lucide-react';
import api from '../../services/api';
import './ChatBox.css';

const ChatBox = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    const saved = sessionStorage.getItem('Nova Store_chat_messages');
    if (saved) {
      return JSON.parse(saved);
    }
    return [{ sender: 'bot', text: 'Xin chào! Tôi là trợ lý ảo AI của Nova Store. Tôi có thể giúp gì cho bạn?' }];
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Lấy sessionId cũ từ session hoặc tạo mới nếu chưa có
  const sessionIdRef = useRef(
    sessionStorage.getItem('Nova Store_chat_sessionId') || 
    (Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15))
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Lưu lịch sử chat và sessionId mỗi khi có thay đổi
  useEffect(() => {
    sessionStorage.setItem('Nova Store_chat_messages', JSON.stringify(messages));
    sessionStorage.setItem('Nova Store_chat_sessionId', sessionIdRef.current);
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/chat', { 
        message: userMsg.text,
        sessionId: sessionIdRef.current
      });
      setMessages(prev => [...prev, { sender: 'bot', text: res.data.response }]);
    } catch (error) {
      setMessages(prev => [...prev, { sender: 'bot', text: 'Xin lỗi, hệ thống AI đang bận hoặc gặp sự cố kết nối tới Ollama. Hãy đảm bảo Ollama đang chạy.' }]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = (text) => {
    if (!text) return { __html: '' };
    
    // Extract PRODUCT_CARDs first so they don't get messed up by HTML escaping
    let extractedCards = [];
    text = text.replace(/\[PRODUCT_CARD:\s*({.*?})\s*\]/g, (match, jsonStr) => {
      extractedCards.push(jsonStr);
      return `__PRODUCT_CARD_${extractedCards.length - 1}__`;
    });

    // Escape HTML to prevent XSS
    let html = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    // Bold: **text**
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    // Images: ![alt](url) -> prepending localhost:8080/uploads/ if not starting with http
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, url) => {
      const src = url.startsWith('http') ? url : `http://localhost:8080/uploads/${url}`;
      return `<img src="${src}" alt="${alt}" style="max-width: 100%; border-radius: 8px; margin-top: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" onerror="this.style.display='none'" />`;
    });
    // Line breaks
    html = html.replace(/\n/g, '<br />');

    // Re-inject PRODUCT_CARDs as beautiful HTML
    extractedCards.forEach((jsonStr, index) => {
      try {
        const p = JSON.parse(jsonStr);
        const imgUrl = p.image.startsWith('http') ? p.image : `http://localhost:8080/uploads/${p.image}`;
        const formattedPrice = new Intl.NumberFormat('vi-VN').format(p.price) + '₫';

        const cardHtml = `
          <div class="ai-product-card">
            <div class="ai-product-img-wrapper">
              <img src="${imgUrl}" alt="${p.name}" onerror="this.style.display='none'" />
              <span class="ai-badge">✨ AI</span>
            </div>
            <div class="ai-product-info">
              <h4 class="ai-product-name">${p.name}</h4>
              <p class="ai-product-price">${formattedPrice}</p>
              <a href="/product/${p.id}" class="ai-product-btn">Xem chi tiết</a>
            </div>
          </div>
        `;
        html = html.replace(`__PRODUCT_CARD_${index}__`, cardHtml);
      } catch (e) {
        html = html.replace(`__PRODUCT_CARD_${index}__`, '');
      }
    });

    return { __html: html };
  };

  return (
    <>
      <div className={`chat-toggle-wrapper ${isOpen ? 'hidden' : ''}`}>
        <div className="chat-tooltip">
          Chat với AI <Sparkles size={14} className="sparkle-icon" />
        </div>
        <button className="chat-toggle-btn" onClick={() => setIsOpen(true)}>
          <Bot size={28} />
        </button>
      </div>

      <div className={`chat-box-container ${isOpen ? 'open' : ''}`}>
        <div className="chat-header">
          <div className="chat-title">
            <span className="online-dot"></span>
            Nova Store AI
          </div>
          <button onClick={() => setIsOpen(false)} className="close-btn"><X size={20}/></button>
        </div>

        <div className="chat-messages" data-lenis-prevent="true">
          {messages.map((msg, idx) => (
            <div key={idx} className={`chat-message ${msg.sender}`}>
              <div className="msg-bubble" dangerouslySetInnerHTML={renderMessage(msg.text)} />
            </div>
          ))}
          {loading && (
            <div className="chat-message bot">
              <div className="msg-bubble typing">
                <span className="dot"></span><span className="dot"></span><span className="dot"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-area">
          <input 
            type="text" 
            placeholder="Nhập câu hỏi của bạn..." 
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleSend()}
            disabled={loading}
          />
          <button onClick={handleSend} disabled={loading || !input.trim()}>
            <Send size={18} />
          </button>
        </div>
      </div>
    </>
  );
};

export default ChatBox;
