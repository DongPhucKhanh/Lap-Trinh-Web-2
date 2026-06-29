import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Zap } from 'lucide-react';
import ProductCard from '../../../components/ProductCard/ProductCard';
import Countdown from '../../../components/Countdown/Countdown';

const FlashSaleSection = ({ products, flashSaleEndTime }) => {
  if (!products || products.length === 0) return null;

  return (
    <section className="py-24 relative bg-[#0f172a] overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/20 rounded-full blur-[100px]"></div>
        <div className="absolute top-40 -left-20 w-72 h-72 bg-blue-500/20 rounded-full blur-[100px]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Zap className="text-yellow-400" size={32} fill="currentColor" />
              <h2 className="text-4xl md:text-5xl font-extrabold text-white">Khuyến Mãi Giờ Vàng</h2>
            </div>
            <p className="text-gray-400 text-lg">Chớp ngay cơ hội thưởng thức đồ ăn vặt với giá cực hời.</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center gap-6"
          >
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
              <Countdown targetDate={flashSaleEndTime} />
            </div>
            
            <Link to="/product?sale=true" className="inline-flex items-center font-bold text-white bg-primary hover:bg-primary-hover px-8 py-4 rounded-full transition-colors text-lg shadow-[0_0_20px_rgba(255,107,107,0.3)]">
              Xem tất cả <ChevronRight className="ml-2" />
            </Link>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.slice(0, 4).map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FlashSaleSection;
