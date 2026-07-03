import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const ParallaxBannerSection = () => {
  return (
    <section className="relative w-full h-[70vh] min-h-[500px] flex items-center justify-center overflow-hidden bg-fixed bg-center bg-cover" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1460353581641-37baddab0fa2?q=80&w=2070&auto=format&fit=crop')" }}>
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60 z-0"></div>

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <motion.span 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-primary font-bold tracking-[0.2em] uppercase text-sm md:text-base mb-4 block"
        >
          Trải nghiệm ngay
        </motion.span>
        
        <motion.h2 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-4xl md:text-6xl font-extrabold text-white mb-8 leading-tight"
        >
          Hương vị bùng nổ, <br/>Cuộc vui bất tận
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Link 
            to="/product" 
            className="inline-block bg-primary text-white font-bold py-4 px-12 rounded-full text-lg hover:bg-white hover:text-primary transition-colors duration-300 shadow-xl shadow-primary/20"
          >
            Mua Ngay
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default ParallaxBannerSection;
