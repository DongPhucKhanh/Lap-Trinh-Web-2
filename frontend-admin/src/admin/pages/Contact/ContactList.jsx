import React, { useEffect, useState } from 'react';
import { FileText, Send, User, Clock, Trash2, ArrowLeft } from 'lucide-react';
import contactService from '../../services/contactService';

const ContactList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

  const fetchData = () => {
    setLoading(true);
    contactService.getAll().then(res => { 
      setData(res.data); 
      setLoading(false); 
    }).catch(err => { 
      console.error(err); 
      setLoading(false); 
    });
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = (id, e) => {
    if (e) e.stopPropagation();
    if (window.confirm('Bạn có chắc chắn muốn xoá?')) {
      contactService.delete(id).then(() => {
        if (selectedContact && selectedContact.id === id) {
          setSelectedContact(null);
        }
        fetchData();
      }).catch(err => alert('Lỗi: ' + err.message));
    }
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setSending(true);
    try {
      // Create a reply contact
      await contactService.create({
        name: 'Admin',
        email: 'admin@system.com',
        title: 'Phản hồi: ' + selectedContact.title,
        content: replyText,
        replyId: selectedContact.id,
        status: 2
      });
      // Optionally update the status of the original contact to 'replied'
      await contactService.updateStatus(selectedContact.id, 2);
      
      setReplyText('');
      fetchData();
      // Keep selected contact active but update its status locally if needed
      setSelectedContact({ ...selectedContact, status: 2 });
      alert('Đã gửi phản hồi thành công!');
    } catch (error) {
      alert('Lỗi gửi phản hồi: ' + error.message);
    } finally {
      setSending(false);
    }
  };

  // Group root contacts and replies (if backend returns all)
  const rootContacts = data.filter(c => !c.replyId);

  return (
    <div className="admin-page" style={{ padding: '0', height: 'calc(100vh - 60px)', display: 'flex', flexDirection: 'column' }}>
      
      <div className="chat-container">
        {/* Left Sidebar - Contact List */}
        <div className={`chat-sidebar ${selectedContact ? 'mobile-hidden' : ''}`}>
          <div className="chat-header">
            <h3><FileText size={20} /> Tin nhắn liên hệ</h3>
          </div>
          <div className="chat-list">
            {loading ? <div className="loader"></div> : (
              rootContacts.length === 0 ? <p className="text-center py-4" style={{color: '#64748b'}}>Chưa có tin nhắn nào.</p> :
              rootContacts.map(item => (
                <div 
                  key={item.id} 
                  className={`chat-list-item ${selectedContact?.id === item.id ? 'active' : ''} ${item.status === 0 ? 'unread' : ''}`}
                  onClick={() => setSelectedContact(item)}
                >
                  <div className="chat-avatar">
                    <User size={24} />
                  </div>
                  <div className="chat-preview">
                    <div className="chat-preview-header">
                      <h4>{item.name || item.email || 'Không tên'}</h4>
                      <span className="chat-time">
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : ''}
                      </span>
                    </div>
                    <p className="chat-subject">{item.title}</p>
                    <p className="chat-snippet">{item.content}</p>
                  </div>
                  <button className="chat-delete-btn" onClick={(e) => handleDelete(item.id, e)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Content - Chat View */}
        <div className={`chat-content ${!selectedContact ? 'mobile-hidden' : ''}`}>
          {selectedContact ? (
            <>
              <div className="chat-content-header">
                <button className="chat-back-btn" onClick={() => setSelectedContact(null)}>
                  <ArrowLeft size={20} />
                </button>
                <div className="chat-contact-info">
                  <h3>{selectedContact.name || selectedContact.email}</h3>
                  <p>{selectedContact.email} {selectedContact.phone ? `• ${selectedContact.phone}` : ''}</p>
                </div>
                <div className="chat-status-badge">
                  {selectedContact.status === 2 ? (
                    <span className="badge badge-success">Đã trả lời</span>
                  ) : selectedContact.status === 1 ? (
                    <span className="badge badge-secondary">Đã đọc</span>
                  ) : (
                    <span className="badge" style={{background: '#fee2e2', color: '#ef4444'}}>Chưa đọc</span>
                  )}
                </div>
              </div>

              <div className="chat-messages">
                {/* Customer Message */}
                <div className="message-bubble customer">
                  <div className="message-meta">
                    <span className="message-sender">{selectedContact.name}</span>
                    <span className="message-time"><Clock size={12}/> {new Date(selectedContact.createdAt).toLocaleString('vi-VN')}</span>
                  </div>
                  <div className="message-box">
                    <h5 style={{ margin: '0 0 10px 0', fontSize: '1rem', borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: '10px' }}>
                      Cần hỗ trợ: {selectedContact.title}
                    </h5>
                    <p style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{selectedContact.content}</p>
                  </div>
                </div>

                {/* Replies (if any) */}
                {data.filter(c => c.replyId === selectedContact.id).map(reply => (
                  <div key={reply.id} className="message-bubble admin">
                    <div className="message-meta">
                      <span className="message-sender">Quản trị viên (Bạn)</span>
                      <span className="message-time"><Clock size={12}/> {new Date(reply.createdAt).toLocaleString('vi-VN')}</span>
                    </div>
                    <div className="message-box">
                      <p style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{reply.content}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="chat-input-area">
                <textarea 
                  className="chat-textarea" 
                  placeholder="Nhập nội dung phản hồi cho khách hàng này..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />
                <button 
                  className="chat-send-btn" 
                  onClick={handleReply}
                  disabled={!replyText.trim() || sending}
                >
                  <Send size={18} /> Gửi phản hồi
                </button>
              </div>
            </>
          ) : (
            <div className="chat-empty-state">
              <div className="empty-icon-wrapper">
                <FileText size={48} />
              </div>
              <h2>Chưa chọn liên hệ</h2>
              <p>Hãy chọn một khách hàng bên trái để xem nội dung chi tiết và bắt đầu hỗ trợ.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactList;
