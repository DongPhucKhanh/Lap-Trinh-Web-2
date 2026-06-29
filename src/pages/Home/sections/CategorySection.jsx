import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const CategorySection = ({ categories }) => {
  if (!categories || categories.length === 0) return null;

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-extrabold text-dark mb-4">Khám Phá Danh Mục</h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">Lựa chọn hàng ngàn sản phẩm ăn vặt hấp dẫn được phân loại rõ ràng giúp bạn dễ dàng tìm kiếm.</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {categories.slice(0, 10).map((cat, index) => {
            const imageUrl = cat.image?.startsWith('http') ? cat.image : `http://localhost:8080/uploads/${cat.image}`;
            
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-6">
                    <h3 className="text-white text-xl font-bold translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                      {cat.name}
                    </h3>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
