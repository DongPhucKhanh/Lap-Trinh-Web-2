import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

const HeroSection = ({ banners }) => {
  // We use the active banners or a default array if none exist
  const activeBanners = banners && banners.length > 0 ? banners : [
    {
      id: 'default-1',
      title: 'Khám phá phong cách hoàn hảo',
      description: 'Trải nghiệm thiên đường giày thể thao với hàng trăm mẫu giày được tuyển chọn kỹ lưỡng dành riêng cho bạn.',
      link: '/product',
      image: 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?q=80&w=1920&auto=format&fit=crop'
    }
  ];

  return (
    <section className="relative w-full h-screen overflow-hidden bg-black flex items-center justify-center group">
      <Swiper
        modules={[Pagination, Autoplay, EffectFade]}
        effect="fade"
        speed={1000}
        pagination={{ clickable: true, dynamicBullets: true }}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        loop={activeBanners.length > 1}
        allowTouchMove={activeBanners.length > 1}
        className="w-full h-full absolute inset-0 z-0 hero-swiper"
      >
        {activeBanners.map((banner, index) => {
          const imageUrl = banner.image?.startsWith('http') ? banner.image : `http://localhost:8080/uploads/${banner.image}`;
          return (
            <SwiperSlide key={banner.id || index}>
              <div className="w-full h-full relative flex items-center justify-center">
                {/* Background Image with Parallax effect via Framer (simulated by scaling up) */}
                <motion.div 
                  className="absolute inset-0 z-0"
                  initial={{ scale: 1.1 }}
                  whileInView={{ scale: 1 }}
                  transition={{ duration: 10, ease: "easeOut" }}
                >
                  <div className="absolute inset-0 bg-black/50 z-10"></div>
                  <img 
                    src={imageUrl} 
                    alt={banner.name || banner.title || 'Hero Banner'} 
                    className="w-full h-full object-cover"
                  />
                </motion.div>

                {/* Content */}
                <div className="relative z-20 text-center text-white px-6 max-w-4xl mx-auto flex flex-col items-center">
                  <motion.h1 
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight drop-shadow-lg"
                  >
                    {banner.name || banner.title}
                  </motion.h1>
                  
                  <motion.p 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="text-lg md:text-2xl font-light mb-10 opacity-90 max-w-2xl drop-shadow-md"
                  >
                    {banner.description}
                  </motion.p>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                  >
                    <Link 
                      to={banner.link || '/product'} 
                      className="inline-block bg-white text-black font-bold py-4 px-10 rounded-full text-lg hover:scale-105 transition-transform duration-300 shadow-[0_0_30px_rgba(255,255,255,0.3)]"
                    >
                      Khám Phá Ngay
                    </Link>
                  </motion.div>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>

      {/* Scroll Indicator */}
      <motion.div 
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 text-white/70 flex flex-col items-center gap-2 pointer-events-none"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <span className="text-sm uppercase tracking-widest font-medium drop-shadow-md">Cuộn xuống</span>
        <ChevronDown size={24} className="drop-shadow-md" />
      </motion.div>

      {/* Custom Styles for Swiper Pagination in Hero */}
      <style dangerouslySetInnerHTML={{__html: `
        .hero-swiper .swiper-pagination-bullet {
          background: white;
          opacity: 0.5;
          width: 10px;
          height: 10px;
          margin: 0 6px !important;
          transition: all 0.3s ease;
        }
        .hero-swiper .swiper-pagination-bullet-active {
          opacity: 1;
          width: 30px;
          border-radius: 5px;
          background: var(--color-primary, #ff6b6b);
        }
        .hero-swiper .swiper-pagination {
          bottom: 40px !important;
          z-index: 30;
        }
      `}} />
    </section>
  );
};

export default HeroSection;
