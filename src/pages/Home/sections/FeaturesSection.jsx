import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Truck, RotateCcw, CreditCard } from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    {
      icon: <ShieldCheck size={40} className="text-primary" />,
      title: "100% Chính hãng",
      desc: "Nguồn gốc rõ ràng, đảm bảo chất lượng từ nhà sản xuất."
    },
    {
      icon: <Truck size={40} className="text-primary" />,
      title: "Giao nhanh 2H",
      desc: "Nhận hàng ngay lập tức trong vòng 2 giờ tại nội thành."
    },
    {
      icon: <RotateCcw size={40} className="text-primary" />,
      title: "Đổi trả 7 ngày",
      desc: "Miễn phí đổi trả nếu sản phẩm có lỗi từ nhà sản xuất."
    },
    {
      icon: <CreditCard size={40} className="text-primary" />,
      title: "Thanh toán an toàn",
      desc: "Hỗ trợ đa dạng phương thức, bảo mật thông tin tuyệt đối."
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
  };

  return (
    <section className="py-20 bg-light relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
        >
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              variants={itemVariants}
              className="bg-white rounded-[24px] p-8 shadow-sm hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 transform hover:-translate-y-2 flex flex-col items-center text-center group"
            >
              <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-dark mb-3">{feature.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
