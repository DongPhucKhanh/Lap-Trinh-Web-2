import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Mail } from 'lucide-react';

const BlogNewsletterSection = ({ posts }) => {
  return (
    <section className="py-24 bg-light">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Blog Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-extrabold text-dark mb-4">Tạp Chí Thời Trang</h2>
            <p className="text-gray-500 text-lg">Khám phá những câu chuyện thú vị và bí quyết giày thể thao đẹp mắt.</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <Link to="/post" className="inline-flex items-center font-bold text-dark hover:text-primary transition-colors text-lg">
              Đọc tất cả bài viết <ArrowRight className="ml-2" />
            </Link>
          </motion.div>
        </div>

        {/* Blog Grid */}
        {posts && posts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
            {posts.slice(0, 3).map((post, index) => {
              const imageUrl = post.image?.startsWith('http') ? post.image : `http://localhost:8080/uploads/${post.image}`;
              
              return (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                  className="group cursor-pointer flex flex-col"
                >
                  <Link to={`/post/${post.slug || post.id}`} className="block relative aspect-[4/3] rounded-[24px] overflow-hidden mb-6 bg-gray-200">
                    <img 
                      src={imageUrl || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80'} 
                      alt={post.title}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                  </Link>
                  <span className="text-sm font-bold text-primary uppercase tracking-wider mb-3">
                    {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                  <Link to={`/post/${post.slug || post.id}`}>
                    <h3 className="text-2xl font-bold text-dark mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                  </Link>
                  <p className="text-gray-500 line-clamp-3 leading-relaxed">
                    {post.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Newsletter */}
        <motion.div 
          className="bg-dark rounded-[40px] p-10 md:p-16 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-12"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          {/* Decorative shapes */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 rounded-full blur-[80px]"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-secondary/20 rounded-full blur-[80px]"></div>
          
          <div className="relative z-10 md:w-1/2">
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4">Đăng ký nhận <br/><span className="text-primary">ưu đãi độc quyền</span></h2>
            <p className="text-gray-400 text-lg">Đừng bỏ lỡ các voucher giảm giá và thông tin sản phẩm mới nhất từ Nova Store.</p>
          </div>
          
          <div className="relative z-10 w-full md:w-1/2">
            <form className="flex flex-col sm:flex-row gap-4 w-full" onSubmit={(e) => e.preventDefault()}>
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="text-gray-400" size={20} />
                </div>
                <input 
                  type="email" 
                  placeholder="Nhập email của bạn..." 
                  className="w-full bg-white/10 border border-white/20 text-white rounded-full py-4 pl-12 pr-6 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder-gray-400 transition-all"
                  required
                />
              </div>
              <button 
                type="submit" 
                className="bg-primary hover:bg-white hover:text-primary text-white font-bold py-4 px-8 rounded-full transition-colors duration-300 whitespace-nowrap shadow-lg shadow-primary/20"
              >
                Đăng ký ngay
              </button>
            </form>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default BlogNewsletterSection;
