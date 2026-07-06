import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { MessageSquare, Clock, CheckCircle, X, ShieldAlert } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import './ContactHistory.css';

const ContactHistory = () => {
  const { user } = useContext(AuthContext);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loadingReplies, setLoadingReplies] = useState(false);

  useEffect(() => {
    if (user) {
      fetchContacts();
    }
  }, [user]);

  const fetchContacts = async () => {
    try {
      const res = await api.get(`/contacts/user/${user.id}`);
      setContacts(res.data);
    } catch (error) {
      console.error("Lỗi khi lấy lịch sử liên hệ:", error);
      toast.error("Không thể tải lịch sử liên hệ");
    } finally {
      setLoading(false);
    }
  };

  const fetchReplies = async (contactId) => {
    setLoadingReplies(true);
    try {
      const res = await api.get(`/contacts/${contactId}/replies`);
      setReplies(res.data);
    } catch (error) {
      console.error("Lỗi khi lấy phản hồi:", error);
      toast.error("Không thể tải phản hồi từ ban quản trị");
    } finally {
      setLoadingReplies(false);
    }
  };

  const handleOpenContact = (contact) => {
    setSelectedContact(contact);
    if (contact.status === 2) {
      fetchReplies(contact.id);
    } else {
      setReplies([]);
    }
  };

  const closeContactDetails = () => {
    setSelectedContact(null);
  };

  const getStatusText = (status) => {
    switch(status) {
      case 0: return { text: 'Chờ phản hồi', class: 'unread' };
      case 1: return { text: 'Đã xem', class: 'read' };
      case 2: return { text: 'Đã trả lời', class: 'replied' };
      default: return { text: 'Không rõ', class: '' };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', { 
      hour: '2-digit', minute: '2-digit', 
      day: '2-digit', month: '2-digit', year: 'numeric' 
    });
  };

  if (loading) {
    return <div className="loader"></div>;
  }

  return (
    <div className="contact-history-page">
      <div className="section-header">
        <h2>Lịch sử hỗ trợ</h2>
        <p>Theo dõi tiến độ xử lý các yêu cầu hỗ trợ mà bạn đã gửi cho Nova Store.</p>
      </div>

      {contacts.length === 0 ? (
        <div className="no-contacts">
          <MessageSquare size={48} />
          <p>Bạn chưa gửi yêu cầu hỗ trợ nào.</p>
        </div>
      ) : (
        <div className="contact-list">
          {contacts.map((contact) => {
            const statusInfo = getStatusText(contact.status);
            return (
              <div 
                key={contact.id} 
                className="contact-item"
                onClick={() => handleOpenContact(contact)}
              >
                <div className="contact-item-header">
                  <h4 className="contact-title">{contact.title}</h4>
                  <span className={`status-badge ${statusInfo.class}`}>
                    {statusInfo.text}
                  </span>
                </div>
                <div className="contact-meta">
                  <span className="meta-item">
                    <Clock size={16} /> {formatDate(contact.createdAt)}
                  </span>
                  {contact.status === 2 && (
                    <span className="meta-item" style={{color: '#10b981'}}>
                      <CheckCircle size={16} /> Có phản hồi
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal chi tiết liên hệ */}
      {selectedContact && (
        <div className="contact-modal-overlay" onClick={closeContactDetails}>
          <div className="contact-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Chi tiết yêu cầu hỗ trợ</h3>
              <button className="close-btn" onClick={closeContactDetails}>
                <X size={24} />
              </button>
            </div>
            
            <div className="modal-body">
              {/* Tin nhắn của user */}
              <div className="message-bubble user-message">
                <div className="message-header">
                  <div className="sender-info">
                    <MessageSquare size={18} />
                    <span>Bạn</span>
                  </div>
                  <span className="message-time">{formatDate(selectedContact.createdAt)}</span>
                </div>
                <div className="message-content">
                  <strong>Chủ đề: {selectedContact.title}</strong>
                  <br /><br />
                  {selectedContact.content}
                </div>
              </div>

              {/* Phản hồi của admin */}
              {selectedContact.status === 2 && (
                loadingReplies ? (
                  <div style={{textAlign: 'center', color: '#64748b'}}>Đang tải phản hồi...</div>
                ) : (
                  replies.map(reply => (
                    <div key={reply.id} className="message-bubble admin-reply">
                      <div className="message-header">
                        <div className="sender-info">
                          <ShieldAlert size={18} />
                          <span>Ban Quản Trị Nova Store</span>
                        </div>
                        <span className="message-time">{formatDate(reply.createdAt)}</span>
                      </div>
                      <div className="message-content">
                        {reply.content}
                      </div>
                    </div>
                  ))
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactHistory;
