import React from 'react';
import { motion } from 'framer-motion';

const BrandStorySection = () => {
  return (
    <section className="py-24 md:py-32 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-16">
        
        {/* Left: Image with Parallax / Scale reveal */}
        <motion.div 
          className="w-full md:w-1/2"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-gray-100">
            <img 
              src="https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=1000&auto=format&fit=crop" 
              alt="Brand Story" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 border border-black/5 rounded-3xl"></div>
          </div>
        </motion.div>

        {/* Right: Content */}
        <div className="w-full md:w-1/2 flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <span className="text-sm font-bold tracking-widest text-primary uppercase mb-4 block">Câu Chuyện Của Chúng Tôi</span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-dark mb-6 leading-tight">
              Đam mê từ những <br/>phong cách nguyên bản
            </h2>
          </motion.div>

          <motion.p 
            className="text-lg text-gray-600 mb-6 leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Bắt đầu từ một căn bếp nhỏ với tình yêu mãnh liệt dành cho giày thể thao, Nova Store ra đời với sứ mệnh mang đến những đôi giày không chỉ đẹp mắt mà còn đảm bảo chất lượng tuyệt đối.
          </motion.p>
          
          <motion.p 
            className="text-lg text-gray-600 mb-10 leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            Chúng tôi tin rằng, mỗi món giày thể thao đều mang trong mình một niềm vui bé nhỏ, giúp bạn xua tan căng thẳng và kết nối với những người thân yêu.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-bold">10+</span>
              </div>
              <span className="font-medium text-dark">Năm kinh nghiệm trong ngành F&B</span>
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
};

export default BrandStorySection;
