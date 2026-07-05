import React from 'react';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import { Star, Quote } from 'lucide-react';
import 'swiper/css';
import 'swiper/css/pagination';

const testimonials = [
  { 
    name: 'Trần Thị Mai', 
    role: 'Khách hàng thân thiết', 
    text: 'Mình đã đặt nhiều lần và lần nào cũng rất hài lòng. Đồ giày thể thao đóng gói cẩn thận, phong cách đúng như mô tả. Giao hàng cực nhanh!', 
    stars: 5, 
    color: '#e74c3c' 
  },
  { 
    name: 'Lê Văn Hùng', 
    role: 'Khách hàng mới', 
    text: 'Lần đầu mua ở đây nhưng rất bất ngờ! Giá cả hợp lý, chất lượng tốt. Đặc biệt là giày chạy và giày thời trang mang là mê luôn!', 
    stars: 5, 
    color: '#3498db' 
  },
  { 
    name: 'Phạm Ngọc Linh', 
    role: 'Đối tác bán hàng', 
    text: 'Mình là đối tác bán lại của Nova Store. Nguồn hàng ổn định, chính sách hỗ trợ tốt. Rất yên tâm khi hợp tác lâu dài.', 
    stars: 4, 
    color: '#2ecc71' 
  },
  { 
    name: 'Hoàng Minh', 
    role: 'Khách hàng', 
    text: 'Combo giày thể thao rất tuyệt vời cho các buổi nhậu cuối tuần cùng bạn bè. Đóng gói đẹp, vị bền bỉ.', 
    stars: 5, 
    color: '#9b59b6' 
  }
];

const TestimonialSection = ({ reviews = [] }) => {
  const displayReviews = reviews.length > 0 ? reviews.map((r, i) => ({
    name: r.userName,
    role: 'Khách hàng',
    text: r.comment,
    stars: r.rating,
    color: ['#e74c3c', '#3498db', '#2ecc71', '#9b59b6', '#f1c40f'][i % 5]
  })) : testimonials;

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-extrabold text-dark mb-4">Phản Hồi Từ Khách Hàng</h2>
          <p className="text-gray-500 text-lg">Hàng ngàn đánh giá tích cực là minh chứng cho chất lượng của chúng tôi.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8 }}
        >
          <Swiper
            modules={[Pagination, Autoplay]}
            spaceBetween={30}
            slidesPerView={1}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            pagination={{ clickable: true, dynamicBullets: true }}
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            className="pb-16"
          >
            {displayReviews.map((t, index) => (
              <SwiperSlide key={index}>
                <div className="bg-light rounded-[32px] p-8 h-full flex flex-col relative border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                  <Quote className="absolute top-8 right-8 text-primary/10" size={60} />
                  
                  <div className="flex gap-1 mb-6 relative z-10">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} fill={i < t.stars ? '#ffcc00' : 'none'} color="#ffcc00" size={20} />
                    ))}
                  </div>
                  
                  <p className="text-gray-600 text-lg leading-relaxed mb-8 flex-grow relative z-10">"{t.text}"</p>
                  
                  <div className="flex items-center gap-4 relative z-10 mt-auto">
                    <div 
                      className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-md"
                      style={{ backgroundColor: t.color }}
                    >
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-dark text-lg">{t.name}</h4>
                      <span className="text-sm text-gray-500">{t.role}</span>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialSection;
