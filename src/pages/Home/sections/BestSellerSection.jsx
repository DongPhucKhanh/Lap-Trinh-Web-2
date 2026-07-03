import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import ProductCard from '../../../components/ProductCard/ProductCard';

const BestSellerSection = ({ products }) => {
  if (!products || products.length === 0) return null;

  return (
    <section className="py-24 bg-light">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-extrabold text-dark mb-4">Sản Phẩm Bán Chạy</h2>
            <p className="text-gray-500 text-lg">Những phong cách được yêu thích nhất bởi hàng ngàn khách hàng.</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <Link to="/product?sort=popular" className="inline-flex items-center font-bold text-primary hover:text-primary-hover group transition-colors text-lg border-b-2 border-transparent hover:border-primary pb-1">
              Xem tất cả <ChevronRight className="ml-2 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.slice(0, 4).map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
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

export default BestSellerSection;
