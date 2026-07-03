import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageCircle, Phone, MapPin } from 'lucide-react';

const ContactCTASection = () => {
  return (
    <section style={{
      position: 'relative',
      padding: '100px 24px',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      overflow: 'hidden',
      textAlign: 'center'
    }}>
      {/* Decorative circles */}
      <div style={{
        position: 'absolute', top: '-100px', right: '-100px',
        width: '400px', height: '400px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,107,107,0.15) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', bottom: '-80px', left: '-80px',
        width: '300px', height: '300px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(78,205,196,0.12) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        style={{ position: 'relative', zIndex: 1, maxWidth: '700px', margin: '0 auto' }}
      >
        <motion.div
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: 'rgba(255,107,107,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 30px'
          }}
        >
          <MessageCircle size={36} color="#ff6b6b" />
        </motion.div>

        <h2 style={{
          fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
          fontWeight: 800, color: 'white', marginBottom: '16px',
          lineHeight: 1.2
        }}>
          Bạn cần hỗ trợ?
        </h2>

        <p style={{
          fontSize: '1.15rem', color: 'rgba(255,255,255,0.7)',
          marginBottom: '40px', lineHeight: 1.7, maxWidth: '520px', margin: '0 auto 40px'
        }}>
          Đội ngũ SneakerHub luôn sẵn sàng lắng nghe và hỗ trợ bạn. Hãy liên hệ với chúng tôi 
          để được tư vấn nhanh nhất!
        </p>

        <div style={{
          display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '40px'
        }}>
          <Link 
            to="/contact" 
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '10px',
              padding: '16px 36px', borderRadius: '50px',
              background: '#ff6b6b', color: 'white',
              fontWeight: 700, fontSize: '1.05rem',
              textDecoration: 'none',
              boxShadow: '0 8px 30px rgba(255,107,107,0.35)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(255,107,107,0.5)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(255,107,107,0.35)'; }}
          >
            <MessageCircle size={20} />
            Gửi liên hệ
          </Link>
          <a 
            href="tel:19001234" 
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '10px',
              padding: '16px 36px', borderRadius: '50px',
              background: 'transparent', color: 'white',
              fontWeight: 700, fontSize: '1.05rem',
              textDecoration: 'none', border: '2px solid rgba(255,255,255,0.3)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#ff6b6b'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <Phone size={20} />
            Gọi 1900 1234
          </a>
        </div>

        {/* Quick info */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap', 
          fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)'
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Phone size={14} /> Hotline 24/7
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MessageCircle size={14} /> Phản hồi trong 24h
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MapPin size={14} /> Tận tâm phục vụ
          </span>
        </div>
      </motion.div>
    </section>
  );
};

export default ContactCTASection;
