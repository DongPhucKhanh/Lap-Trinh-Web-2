import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Shield, Truck, RotateCcw, Lock } from 'lucide-react';
import './PolicyPage.css';

const policies = {
  'doi-tra': {
    title: 'Chính Sách Đổi Trả',
    icon: <RotateCcw size={28} />,
    content: `
      <h3>1. Điều kiện đổi trả</h3>
      <p>Nova Store hỗ trợ đổi trả sản phẩm trong vòng <strong>7 ngày</strong> kể từ khi nhận hàng, với các điều kiện sau:</p>
      <ul>
        <li>Sản phẩm bị lỗi do nhà sản xuất (bao bì rách, sản phẩm hỏng, hết hạn sử dụng)</li>
        <li>Sản phẩm giao không đúng loại, không đúng số lượng so với đơn hàng</li>
        <li>Sản phẩm chưa được mở bao bì, còn nguyên seal</li>
      </ul>
      
      <h3>2. Trường hợp không áp dụng đổi trả</h3>
      <ul>
        <li>Sản phẩm đã mở bao bì và sử dụng (trừ trường hợp lỗi sản xuất)</li>
        <li>Sản phẩm không còn nguyên vẹn do lỗi từ phía khách hàng</li>
        <li>Yêu cầu đổi trả sau 7 ngày kể từ ngày nhận hàng</li>
      </ul>
      
      <h3>3. Quy trình đổi trả</h3>
      <ol>
        <li>Liên hệ hotline <strong>0123 456 789</strong> hoặc gửi email về <strong>contact@Nova Store.vn</strong></li>
        <li>Cung cấp mã đơn hàng, hình ảnh sản phẩm lỗi</li>
        <li>Nova Store xác nhận và gửi hướng dẫn gửi trả hàng</li>
        <li>Hoàn tiền hoặc gửi sản phẩm thay thế trong vòng 3-5 ngày làm việc</li>
      </ol>
    `
  },
  'giao-hang': {
    title: 'Chính Sách Giao Hàng',
    icon: <Truck size={28} />,
    content: `
      <h3>1. Phạm vi giao hàng</h3>
      <p>Nova Store giao hàng trên <strong>toàn quốc</strong> thông qua các đối tác vận chuyển uy tín.</p>
      
      <h3>2. Thời gian giao hàng</h3>
      <ul>
        <li><strong>Nội thành TP.HCM:</strong> 1-2 giờ (giao nhanh), 1-2 ngày (giao tiêu chuẩn)</li>
        <li><strong>Ngoại thành TP.HCM:</strong> 2-3 ngày</li>
        <li><strong>Các tỉnh miền Nam:</strong> 2-4 ngày</li>
        <li><strong>Các tỉnh miền Trung, miền Bắc:</strong> 3-5 ngày</li>
      </ul>
      
      <h3>3. Phí giao hàng</h3>
      <ul>
        <li><strong>Miễn phí</strong> cho đơn hàng từ 200.000đ trở lên</li>
        <li>Phí vận chuyển tiêu chuẩn: 15.000đ - 30.000đ tùy khu vực</li>
      </ul>
      
      <h3>4. Lưu ý</h3>
      <p>Thời gian giao hàng có thể thay đổi tùy thuộc vào điều kiện thời tiết, lễ tết hoặc các sự kiện bất khả kháng. Nova Store sẽ thông báo cho bạn nếu có sự chậm trễ.</p>
    `
  },
  'dieu-khoan': {
    title: 'Điều Khoản Sử Dụng',
    icon: <Shield size={28} />,
    content: `
      <h3>1. Giới thiệu</h3>
      <p>Chào mừng bạn đến với Nova Store. Khi sử dụng website và dịch vụ của chúng tôi, bạn đồng ý tuân thủ các điều khoản và điều kiện dưới đây.</p>
      
      <h3>2. Tài khoản người dùng</h3>
      <ul>
        <li>Bạn chịu trách nhiệm bảo mật thông tin tài khoản của mình</li>
        <li>Không chia sẻ mật khẩu hoặc cho phép người khác sử dụng tài khoản</li>
        <li>Nova Store có quyền khóa tài khoản nếu phát hiện hành vi vi phạm</li>
      </ul>
      
      <h3>3. Đặt hàng và thanh toán</h3>
      <ul>
        <li>Giá sản phẩm có thể thay đổi mà không cần thông báo trước</li>
        <li>Đơn hàng chỉ được xác nhận sau khi chúng tôi xác nhận qua email hoặc điện thoại</li>
        <li>Nova Store có quyền từ chối đơn hàng nếu sản phẩm hết hàng hoặc có thông tin không chính xác</li>
      </ul>
      
      <h3>4. Quyền sở hữu trí tuệ</h3>
      <p>Toàn bộ nội dung trên website (logo, hình ảnh, bài viết) thuộc quyền sở hữu của Nova Store và được bảo vệ bởi luật sở hữu trí tuệ.</p>
    `
  },
  'bao-mat': {
    title: 'Bảo Mật Thông Tin',
    icon: <Lock size={28} />,
    content: `
      <h3>1. Thu thập thông tin</h3>
      <p>Nova Store thu thập các thông tin cần thiết khi bạn đăng ký tài khoản hoặc đặt hàng, bao gồm:</p>
      <ul>
        <li>Họ tên, email, số điện thoại</li>
        <li>Địa chỉ giao hàng</li>
        <li>Lịch sử đơn hàng</li>
      </ul>
      
      <h3>2. Sử dụng thông tin</h3>
      <p>Thông tin của bạn được sử dụng để:</p>
      <ul>
        <li>Xử lý và giao đơn hàng</li>
        <li>Liên hệ hỗ trợ khi cần thiết</li>
        <li>Gửi thông tin khuyến mãi (nếu bạn đồng ý nhận)</li>
      </ul>
      
      <h3>3. Bảo vệ thông tin</h3>
      <p>Chúng tôi cam kết:</p>
      <ul>
        <li>Không bán hoặc chia sẻ thông tin cá nhân cho bên thứ ba vì mục đích thương mại</li>
        <li>Sử dụng mã hóa SSL để bảo vệ dữ liệu truyền tải</li>
        <li>Mật khẩu được mã hóa và lưu trữ an toàn</li>
      </ul>
      
      <h3>4. Quyền của bạn</h3>
      <p>Bạn có quyền yêu cầu truy cập, chỉnh sửa hoặc xóa thông tin cá nhân bất kỳ lúc nào bằng cách liên hệ với chúng tôi qua email <strong>contact@Nova Store.vn</strong>.</p>
    `
  }
};

const PolicyPage = () => {
  const { type } = useParams();
  const policy = policies[type];

  if (!policy) {
    return (
      <div className="policy-page">
        <div className="container">
          <div className="policy-not-found">
            <h2>Không tìm thấy trang chính sách</h2>
            <Link to="/" className="btn-primary" style={{ marginTop: '1rem', display: 'inline-block', padding: '10px 24px', borderRadius: '8px', background: 'var(--primary)', color: 'white', textDecoration: 'none' }}>Quay về trang chủ</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="policy-page">
      <div className="container">
        <div className="policy-header">
          <Link to="/" className="back-link"><ArrowLeft size={18} /> Trang chủ</Link>
          <div className="policy-title-row">
            <span className="policy-icon">{policy.icon}</span>
            <h1>{policy.title}</h1>
          </div>
          <p className="policy-updated">Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}</p>
        </div>
        <div className="policy-content" dangerouslySetInnerHTML={{ __html: policy.content }} />
      </div>
    </div>
  );
};

export default PolicyPage;
