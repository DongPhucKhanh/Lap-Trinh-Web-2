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
      // Local Fallback Mode
      const lowerInput = userMsg.text.toLowerCase();
      let fallbackText = '';
      
      if (lowerInput.includes('giày nam') || lowerInput.includes('nam')) {
        fallbackText = 'Hiện tại cửa hàng đang có rất nhiều mẫu **Giày Thể Thao Nam** cực chất. Bạn có thể ghé thăm danh mục "Giày Nam" hoặc trang "Tất cả sản phẩm" để xem nhé!';
      } else if (lowerInput.includes('giày nữ') || lowerInput.includes('nữ')) {
        fallbackText = 'Các mẫu **Giày Nữ** đang có chương trình khuyến mãi hấp dẫn. Bạn hãy vào mục "Giày Nữ" trên thanh menu để chọn lựa nha.';
      } else if (lowerInput.includes('giá') || lowerInput.includes('bao nhiêu')) {
        fallbackText = 'Mức giá sản phẩm của Nova Store giao động từ **200.000đ đến 2.000.000đ** tùy mẫu mã. Bạn hãy bấm vào từng sản phẩm để xem chi tiết nhé.';
      } else if (lowerInput.includes('chào') || lowerInput.includes('hello')) {
        fallbackText = 'Chào bạn! Do hệ thống AI lõi đang bảo trì, tôi là trợ lý ảo cơ bản (Local Mode) tạm thời phục vụ bạn. Bạn cần tìm giày gì nào?';
      } else if (lowerInput.includes('cảm ơn') || lowerInput.includes('thanks')) {
        fallbackText = 'Không có gì! Nova Store luôn sẵn sàng hỗ trợ bạn. Chúc bạn mua sắm vui vẻ!';
      } else {
        fallbackText = '⚠️ **(Local Mode)**: Hệ thống AI Ollama đang tắt nên tôi tạm thời trả lời theo mẫu cơ bản. Tôi có thể hiểu các từ khóa như: "giày nam", "giày nữ", "giá cả". Bạn hãy thử lại xem sao nhé!';
      }

      setMessages(prev => [...prev, { sender: 'bot', text: fallbackText }]);
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
