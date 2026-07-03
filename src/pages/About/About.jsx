import React from 'react';
import { Shield, Zap, Heart, Truck } from 'lucide-react';
import './About.css';

const About = () => {
  return (
    <div className="about-page">
      {/* Hero Section */}
      <div className="about-hero">
        <div className="container">
          <div className="about-hero-content">
            <h1>Về SneakerHub</h1>
            <p>Khởi nguồn từ tình yêu với giày thể thao, chúng tôi mang đến những phong cách tuyệt vời nhất cho bạn.</p>
          </div>
        </div>
      </div>

      {/* Story Section */}
      <div className="about-story">
        <div className="container">
          <div className="story-grid">
            <div className="story-image">
              <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80" alt="SneakerHub Story" />
            </div>
            <div className="story-text">
              <h2>Câu chuyện của chúng tôi</h2>
              <p>SneakerHub ra đời vào năm 2023 với một sứ mệnh đơn giản: Kết nối những tâm hồn đam mê giày thể thao với những mẫu giày chất lượng nhất. Từ những bịch giày chạy bộ đậm đường phố, đến những gói sneaker phiên bản giới hạn độc lạ, chúng tôi đều cất công tuyển chọn kỹ lưỡng.</p>
              <p>Chúng tôi hiểu rằng, mỗi món giày thể thao không chỉ là thức quà giải trí, mà còn là niềm vui, là chất xúc tác cho những câu chuyện bất tận bên bạn bè. Vì vậy, an toàn vệ sinh thực phẩm và phong cách nguyên bản luôn là ưu tiên hàng đầu của SneakerHub.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="about-values">
        <div className="container">
          <h2 className="text-center mb-5">Giá trị cốt lõi</h2>
          <div className="values-grid">
            <div className="value-card">
              <div className="value-icon"><Shield size={32} /></div>
              <h3>Chất lượng hàng đầu</h3>
              <p>100% sản phẩm có nguồn gốc xuất xứ rõ ràng, đảm bảo chất lượng và độ bền.</p>
            </div>
            <div className="value-card">
              <div className="value-icon"><Zap size={32} /></div>
              <h3>Giao hàng siêu tốc</h3>
              <p>Đóng gói cẩn thận, giao hàng nhanh chóng đến tận tay khách hàng trong vòng 2h.</p>
            </div>
            <div className="value-card">
              <div className="value-icon"><Heart size={32} /></div>
              <h3>Tận tâm phục vụ</h3>
              <p>Đội ngũ chăm sóc khách hàng luôn sẵn sàng lắng nghe và hỗ trợ bạn 24/7.</p>
            </div>
            <div className="value-card">
              <div className="value-icon"><Truck size={32} /></div>
              <h3>Phủ sóng toàn quốc</h3>
              <p>Dù bạn ở đâu, SneakerHub cũng sẽ mang niềm vui thời trang đến tận cửa nhà bạn.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
