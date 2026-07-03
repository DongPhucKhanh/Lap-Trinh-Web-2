import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const CategorySection = ({ categories }) => {
  const sliderRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered || !categories || categories.length === 0) return;
    
    const interval = setInterval(() => {
      if (sliderRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          sliderRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          sliderRef.current.scrollBy({ left: 240, behavior: 'smooth' });
        }
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [isHovered, categories]);

  if (!categories || categories.length === 0) return null;

  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-6 relative">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-extrabold text-dark mb-4">Khám Phá Danh Mục</h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">Lựa chọn hàng ngàn sản phẩm giày thể thao hấp dẫn được phân loại rõ ràng giúp bạn dễ dàng tìm kiếm.</p>
        </motion.div>

        <div 
          className="relative group/slider"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <button 
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 -translate-y-1/2 -ml-5 z-10 bg-white shadow-xl rounded-full p-3 hover:bg-red-500 hover:text-white transition-all duration-300 hidden md:flex items-center justify-center text-gray-700 opacity-0 group-hover/slider:opacity-100"
          >
            <ChevronLeft size={24} />
          </button>

          <style>{`
            .hide-scroll::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          
          <div 
            ref={sliderRef}
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory hide-scroll pb-8 pt-4 px-4 -mx-4 scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {categories.map((cat, index) => {
              const imageUrl = cat.image?.startsWith('http') ? cat.image : `http://localhost:8080/uploads/${cat.image}`;
              
              return (
                <motion.div
                  key={cat.id}
                  className="flex-none w-[160px] sm:w-[200px] md:w-[240px] snap-start"
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                >
                  <Link 
                    to={`/product?category=${cat.id}`}
                    className="group block relative rounded-[32px] overflow-hidden bg-gray-100 aspect-square shadow-sm hover:shadow-xl transition-shadow duration-500"
                  >
                    <img 
                      src={imageUrl || 'https://placehold.co/400x400/f4f7f6/636e72?text=Category'} 
                      alt={cat.name}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-5 md:p-6">
                      <h3 className="text-white text-lg md:text-xl font-bold translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                        {cat.name}
                      </h3>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          <button 
            onClick={scrollRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 -mr-5 z-10 bg-white shadow-xl rounded-full p-3 hover:bg-red-500 hover:text-white transition-all duration-300 hidden md:flex items-center justify-center text-gray-700 opacity-0 group-hover/slider:opacity-100"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
