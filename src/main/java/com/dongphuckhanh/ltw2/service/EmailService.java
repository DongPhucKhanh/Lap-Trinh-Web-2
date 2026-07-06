package com.dongphuckhanh.ltw2.service;

import com.dongphuckhanh.ltw2.entity.Contact;
import com.dongphuckhanh.ltw2.entity.Order;
import com.dongphuckhanh.ltw2.entity.OrderDetail;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.text.NumberFormat;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    private void sendHtmlEmail(String to, String subject, String htmlContent) {
        sendHtmlEmailWithInline(to, subject, htmlContent, null);
    }

    private void sendHtmlEmailWithInline(String to, String subject, String htmlContent, java.util.Map<String, String> inlineImages) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            
            if (inlineImages != null) {
                for (java.util.Map.Entry<String, String> entry : inlineImages.entrySet()) {
                    java.io.File file = new java.io.File("uploads/" + entry.getValue());
                    if (file.exists()) {
                        helper.addInline(entry.getKey(), file);
                    }
                }
            }
            
            mailSender.send(message);
        } catch (MessagingException e) {
            e.printStackTrace();
        }
    }

    private String formatCurrency(java.math.BigDecimal amount) {
        if (amount == null) return "0 ₫";
        NumberFormat format = NumberFormat.getCurrencyInstance(new Locale("vi", "VN"));
        return format.format(amount);
    }

    // 1. Email đăng ký tài khoản (OTP)
    public void sendRegistrationOtp(String email, String otp) {
        String subject = "Xác nhận đăng ký tài khoản - SneakerHub";
        String htmlContent = """
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #ff6b6b; text-align: center;">Chào mừng đến với SneakerHub!</h2>
                <p>Cảm ơn bạn đã đăng ký tài khoản. Để hoàn tất quá trình đăng ký, vui lòng sử dụng mã xác thực sau:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <span style="font-size: 32px; font-weight: bold; background: #f4f7f6; padding: 10px 20px; letter-spacing: 5px; color: #333; border-radius: 5px;">%s</span>
                </div>
                <p>Mã này có hiệu lực trong vòng 10 phút. Nếu bạn không yêu cầu đăng ký, vui lòng bỏ qua email này.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                <p style="font-size: 12px; color: #999; text-align: center;">Đội ngũ SneakerHub</p>
            </div>
        """.formatted(otp);
        sendHtmlEmail(email, subject, htmlContent);
    }

    // 2. Email quên mật khẩu (OTP)
    public void sendForgotPasswordOtp(String email, String otp) {
        String subject = "Mã OTP Đặt Lại Mật Khẩu - SneakerHub";
        String htmlContent = """
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #ff6b6b; text-align: center;">Khôi phục mật khẩu</h2>
                <p>Bạn vừa yêu cầu đặt lại mật khẩu cho tài khoản SneakerHub. Dưới đây là mã xác nhận (OTP) của bạn:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <span style="font-size: 32px; font-weight: bold; background: #f4f7f6; padding: 10px 20px; letter-spacing: 5px; color: #333; border-radius: 5px;">%s</span>
                </div>
                <p>Vui lòng không chia sẻ mã này cho bất kỳ ai. Mã này có hiệu lực trong vòng 10 phút.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                <p style="font-size: 12px; color: #999; text-align: center;">Đội ngũ SneakerHub</p>
            </div>
        """.formatted(otp);
        sendHtmlEmail(email, subject, htmlContent);
    }

    // 3. Email xác nhận đặt hàng thành công
    @Async
    public void sendOrderConfirmation(String email, Order order, List<OrderDetail> details) {
        String subject = "Xác nhận đơn hàng #" + order.getId() + " - SneakerHub";
        
        StringBuilder itemsHtml = new StringBuilder();
        java.math.BigDecimal total = java.math.BigDecimal.ZERO;
        java.util.Map<String, String> inlineImages = new java.util.HashMap<>();
        
        for (int i = 0; i < details.size(); i++) {
            OrderDetail detail = details.get(i);
            java.math.BigDecimal amount = detail.getAmount();
            if (amount != null) total = total.add(amount);
            
            String imgName = detail.getProduct().getImage();
            String imgSrc = "";
            
            if (imgName != null && !imgName.isEmpty()) {
                // Nếu có nhiều ảnh cách nhau dấu phẩy, chỉ lấy ảnh đầu tiên
                if (imgName.contains(",")) {
                    imgName = imgName.split(",")[0].trim();
                }

                if (imgName.startsWith("http")) {
                    imgSrc = imgName;
                } else {
                    String cid = "img_" + i;
                    inlineImages.put(cid, imgName);
                    imgSrc = "cid:" + cid;
                }
            }
            String variantInfo = "";
            if (detail.getVariantColor() != null && !detail.getVariantColor().isEmpty()) {
                variantInfo += " - Màu: " + detail.getVariantColor();
            }
            if (detail.getVariantSize() != null && !detail.getVariantSize().isEmpty()) {
                variantInfo += " - Size: " + detail.getVariantSize();
            }
            String productNameWithVariant = detail.getProduct().getName() + variantInfo;
            
            itemsHtml.append(String.format("""
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #eee;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <img src="%s" alt="%s" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;" />
                            <span>%s</span>
                        </div>
                    </td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">%d</td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">%s</td>
                </tr>
            """, imgSrc, detail.getProduct().getName(), productNameWithVariant, detail.getQty(), formatCurrency(amount)));
        }

        String orderDate = order.getCreatedAt() != null 
            ? order.getCreatedAt().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss"))
            : java.time.LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss"));

        String htmlContent = """
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #2ecc71; text-align: center;">Đặt hàng thành công!</h2>
                <p>Chào <b>%s</b>,</p>
                <p>Cảm ơn bạn đã đặt hàng tại SneakerHub. Đơn hàng <b>#%d</b> của bạn đã được ghi nhận và đang chờ xử lý.</p>
                <p><b>Thời gian đặt hàng:</b> %s</p>
                
                <h3 style="color: #333; margin-top: 30px;">Thông tin giao hàng:</h3>
                <p style="margin: 5px 0;"><b>Người nhận:</b> %s</p>
                <p style="margin: 5px 0;"><b>Điện thoại:</b> %s</p>
                <p style="margin: 5px 0;"><b>Địa chỉ:</b> %s</p>
                <p style="margin: 5px 0;"><b>Ghi chú:</b> %s</p>
                
                <h3 style="color: #333; margin-top: 30px;">Chi tiết đơn hàng:</h3>
                <table style="width: 100%%; border-collapse: collapse; margin-top: 10px;">
                    <thead>
                        <tr style="background-color: #f4f7f6;">
                            <th style="padding: 10px; text-align: left;">Sản phẩm</th>
                            <th style="padding: 10px; text-align: center;">SL</th>
                            <th style="padding: 10px; text-align: right;">Thành tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        %s
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="2" style="padding: 15px 10px; text-align: right; font-weight: bold;">Tổng cộng:</td>
                            <td style="padding: 15px 10px; text-align: right; font-weight: bold; color: #ff6b6b; font-size: 18px;">%s</td>
                        </tr>
                    </tfoot>
                </table>
                
                <p style="margin-top: 30px;">Chúng tôi sẽ thông báo cho bạn khi đơn hàng thay đổi trạng thái.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                <p style="font-size: 12px; color: #999; text-align: center;">Đội ngũ SneakerHub</p>
            </div>
        """.formatted(
            order.getDeliveryName(), 
            order.getId(), 
            orderDate,
            order.getDeliveryName(), 
            order.getDeliveryPhone(), 
            order.getDeliveryAddress(), 
            order.getNote() != null ? order.getNote() : "Không có", 
            itemsHtml.toString(), 
            formatCurrency(total)
        );
        sendHtmlEmailWithInline(email, subject, htmlContent, inlineImages);
    }

    // 4. Email thay đổi trạng thái đơn hàng
    @Async
    public void sendOrderStatusChange(String email, Order order, int newStatus) {
        String statusText = "";
        String color = "#333";
        String message = "";
        
        switch (newStatus) {
            case 0:
                statusText = "Chờ xác nhận";
                color = "#f39c12"; // Orange
                message = "Đơn hàng của bạn đang chờ hệ thống xác nhận.";
                break;
            case 1:
                statusText = "Đã xác nhận";
                color = "#3498db"; // Blue
                message = "Đơn hàng của bạn đã được cửa hàng xác nhận.";
                break;
            case 2:
                statusText = "Đang chuẩn bị";
                color = "#9b59b6"; // Purple
                message = "Cửa hàng đang tiến hành chuẩn bị đơn hàng cho bạn.";
                break;
            case 3:
                statusText = "Đang giao hàng";
                color = "#e67e22"; // Dark Orange
                message = "Đơn hàng của bạn đã được bàn giao cho đơn vị vận chuyển và đang trên đường đến.";
                break;
            case 4:
                statusText = "Đã giao hàng";
                color = "#2ecc71"; // Green
                message = "Đơn hàng đã được giao đến bạn.";
                break;
            case 5:
                statusText = "Hoàn thành";
                color = "#27ae60"; // Dark Green
                message = "Đơn hàng đã hoàn thành. Chúc bạn có trải nghiệm tuyệt vời cùng SneakerHub!";
                break;
            case 6:
                statusText = "Đã hủy";
                color = "#e74c3c"; // Red
                message = "Đơn hàng của bạn đã bị hủy.";
                if (order.getCancelReason() != null && !order.getCancelReason().isEmpty()) {
                    message += "<br/><br/><b>Lý do:</b> " + order.getCancelReason();
                } else {
                    message += " Nếu bạn có bất kỳ thắc mắc nào, vui lòng liên hệ với chúng tôi.";
                }
                break;
            case 7:
                statusText = "Hoàn tiền";
                color = "#c0392b"; // Dark Red
                message = "Đơn hàng của bạn đã được xử lý hoàn tiền.";
                if (order.getCancelReason() != null && !order.getCancelReason().isEmpty()) {
                    message += "<br/><br/><b>Lý do:</b> " + order.getCancelReason();
                }
                break;
            default:
                statusText = "Đang xử lý";
        }

        StringBuilder itemsHtml = new StringBuilder();
        java.math.BigDecimal total = java.math.BigDecimal.ZERO;
        java.util.Map<String, String> inlineImages = new java.util.HashMap<>();
        
        if (order.getOrderDetails() != null) {
            for (int i = 0; i < order.getOrderDetails().size(); i++) {
                com.dongphuckhanh.ltw2.entity.OrderDetail detail = order.getOrderDetails().get(i);
                java.math.BigDecimal amount = detail.getAmount();
                if (amount != null) total = total.add(amount);
                
                String imgName = detail.getProduct().getImage();
                String imgSrc = "";
                
                if (imgName != null && !imgName.isEmpty()) {
                    // Nếu có nhiều ảnh cách nhau dấu phẩy, chỉ lấy ảnh đầu tiên
                    if (imgName.contains(",")) {
                        imgName = imgName.split(",")[0].trim();
                    }

                    if (imgName.startsWith("http")) {
                        imgSrc = imgName;
                    } else {
                        String cid = "img_" + i;
                        inlineImages.put(cid, imgName);
                        imgSrc = "cid:" + cid;
                    }
                }
                String variantInfo = "";
                if (detail.getVariantColor() != null && !detail.getVariantColor().isEmpty()) {
                    variantInfo += " - Màu: " + detail.getVariantColor();
                }
                if (detail.getVariantSize() != null && !detail.getVariantSize().isEmpty()) {
                    variantInfo += " - Size: " + detail.getVariantSize();
                }
                String productNameWithVariant = detail.getProduct().getName() + variantInfo;
                
                itemsHtml.append(String.format("""
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <img src="%s" alt="%s" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;" />
                                <span>%s</span>
                            </div>
                        </td>
                        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">%d</td>
                        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">%s</td>
                    </tr>
                """, imgSrc, detail.getProduct().getName(), productNameWithVariant, detail.getQty(), formatCurrency(amount)));
            }
        }

        String orderDate = order.getCreatedAt() != null 
            ? order.getCreatedAt().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss"))
            : java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss"));

        String subject = "Cập nhật trạng thái đơn hàng #" + order.getId() + " - SneakerHub";
        String htmlContent = """
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: %s; text-align: center;">Trạng thái: %s</h2>
                <p>Chào <b>%s</b>,</p>
                <p>Đơn hàng <b>#%d</b> của bạn vừa được cập nhật trạng thái.</p>
                <p style="padding: 15px; background: #f9f9f9; border-left: 4px solid %s; margin: 20px 0;">
                    %s
                </p>
                
                <h3 style="color: #333; margin-top: 30px;">Thông tin đơn hàng:</h3>
                <p style="margin: 5px 0;"><b>Mã đơn:</b> #%d</p>
                <p style="margin: 5px 0;"><b>Thời gian:</b> %s</p>
                <p style="margin: 5px 0;"><b>Người nhận:</b> %s</p>
                <p style="margin: 5px 0;"><b>Điện thoại:</b> %s</p>
                <p style="margin: 5px 0;"><b>Địa chỉ:</b> %s</p>
                
                <h3 style="color: #333; margin-top: 30px;">Chi tiết sản phẩm:</h3>
                <table style="width: 100%%; border-collapse: collapse; margin-top: 10px;">
                    <thead>
                        <tr style="background-color: #f4f7f6;">
                            <th style="padding: 10px; text-align: left;">Sản phẩm</th>
                            <th style="padding: 10px; text-align: center;">SL</th>
                            <th style="padding: 10px; text-align: right;">Thành tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        %s
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="2" style="padding: 15px 10px; text-align: right; font-weight: bold;">Tổng cộng:</td>
                            <td style="padding: 15px 10px; text-align: right; font-weight: bold; color: #ff6b6b; font-size: 18px;">%s</td>
                        </tr>
                    </tfoot>
                </table>
                
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                <p style="font-size: 12px; color: #999; text-align: center;">Đội ngũ SneakerHub</p>
            </div>
        """.formatted(
            color, statusText, 
            order.getDeliveryName(), order.getId(), color, message,
            order.getId(), orderDate, order.getDeliveryName(), order.getDeliveryPhone(), order.getDeliveryAddress(),
            itemsHtml.toString(),
            formatCurrency(total)
        );
        sendHtmlEmailWithInline(email, subject, htmlContent, inlineImages);
    }

    // 5. Email thông báo hủy 1 sản phẩm cụ thể
    @Async
    public void sendItemCancellationNotice(String email, Order order, com.dongphuckhanh.ltw2.entity.OrderDetail deletedItem, String reason) {
        String subject = "Thông báo hủy 1 sản phẩm trong đơn hàng #" + order.getId() + " - SneakerHub";
        
        java.util.Map<String, String> inlineImages = new java.util.HashMap<>();
        String imgName = deletedItem.getProduct().getImage();
        String cid = "img_deleted";
        if (imgName != null && !imgName.isEmpty()) {
            inlineImages.put(cid, imgName);
        }

        String orderDate = order.getCreatedAt() != null 
            ? order.getCreatedAt().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss"))
            : java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss"));

        String variantInfo = "";
        if (deletedItem.getVariantColor() != null && !deletedItem.getVariantColor().isEmpty()) {
            variantInfo += " - Màu: " + deletedItem.getVariantColor();
        }
        if (deletedItem.getVariantSize() != null && !deletedItem.getVariantSize().isEmpty()) {
            variantInfo += " - Size: " + deletedItem.getVariantSize();
        }
        String productNameWithVariant = deletedItem.getProduct().getName() + variantInfo;

        String htmlContent = """
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #e74c3c; text-align: center;">Thông báo Hủy Sản Phẩm</h2>
                <p>Chào <b>%s</b>,</p>
                <p>Chúng tôi rất tiếc phải thông báo rằng một sản phẩm trong đơn hàng <b>#%d</b> của bạn đã bị hủy do lỗi kỹ thuật hoặc hết hàng.</p>
                
                <h3 style="color: #333; margin-top: 20px;">Thông tin đơn hàng:</h3>
                <p style="margin: 5px 0;"><b>Mã đơn:</b> #%d</p>
                <p style="margin: 5px 0;"><b>Thời gian:</b> %s</p>
                <p style="margin: 5px 0;"><b>Người nhận:</b> %s</p>
                
                <div style="padding: 15px; background: #fff3f3; border-left: 4px solid #e74c3c; margin: 20px 0;">
                    <p style="margin: 0 0 10px 0; font-weight: bold;">Sản phẩm bị hủy:</p>
                    <table style="width: 100%%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 10px 0; display: flex; align-items: center; gap: 10px;">
                                <img src="cid:%s" alt="%s" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;" />
                                <div>
                                    <div style="font-weight: bold;">%s</div>
                                    <div style="font-size: 13px; color: #666;">Số lượng: %d | Đơn giá: %s</div>
                                </div>
                            </td>
                        </tr>
                    </table>
                    <p style="margin: 10px 0 0 0; color: #c0392b;"><b>Lý do:</b> %s</p>
                </div>
                
                <p>Các sản phẩm còn lại trong đơn hàng của bạn vẫn sẽ được giao đến bạn bình thường. Số tiền tương ứng của sản phẩm bị hủy sẽ được hoàn lại hoặc cấn trừ vào tổng thanh toán khi nhận hàng.</p>
                <p>Rất xin lỗi bạn vì sự bất tiện này. Cảm ơn bạn đã thông cảm và đồng hành cùng SneakerHub!</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                <p style="font-size: 12px; color: #999; text-align: center;">Đội ngũ SneakerHub</p>
            </div>
        """.formatted(
            order.getDeliveryName(), order.getId(),
            order.getId(), orderDate, order.getDeliveryName(),
            cid, deletedItem.getProduct().getName(), productNameWithVariant, deletedItem.getQty(), formatCurrency(deletedItem.getPrice()),
            reason
        );
        sendHtmlEmailWithInline(email, subject, htmlContent, inlineImages);
    }

    // 6. Email cảm ơn khách hàng gửi form liên hệ
    @Async
    public void sendContactThankYou(String email, String customerName) {
        String subject = "SneakerHub đã nhận được tin nhắn của bạn!";
        String htmlContent = """
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #ff6b6b; text-align: center;">Cảm ơn bạn đã liên hệ!</h2>
                <p>Chào <b>%s</b>,</p>
                <p>Chúng tôi đã nhận được thông tin liên hệ của bạn. Đội ngũ chăm sóc khách hàng của SneakerHub sẽ xem xét và phản hồi bạn trong thời gian sớm nhất (thông thường trong vòng 24 giờ làm việc).</p>
                <p>Trong lúc chờ đợi, bạn có thể tham quan những đôi giày hấp dẫn đang có trên website của chúng tôi.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                <p style="font-size: 12px; color: #999; text-align: center;">Đội ngũ SneakerHub</p>
            </div>
        """.formatted(customerName);
        sendHtmlEmail(email, subject, htmlContent);
    }

    // 6. Email thông báo cho Admin khi có liên hệ mới
    @Async
    public void sendContactNoticeToAdmin(String adminEmail, Contact contact) {
        String subject = "[Thông báo] Có liên hệ mới từ khách hàng: " + contact.getName();
        String dateStr = contact.getCreatedAt() != null 
            ? contact.getCreatedAt().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss"))
            : "Vừa xong";
            
        String htmlContent = """
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #333; text-align: center;">Có liên hệ mới!</h2>
                <p>Hệ thống vừa ghi nhận một yêu cầu liên hệ mới từ khách hàng.</p>
                <table style="width: 100%%; border-collapse: collapse; margin-top: 15px;">
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee; width: 120px;"><b>Khách hàng:</b></td>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">%s</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;"><b>Email:</b></td>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">%s</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;"><b>Điện thoại:</b></td>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">%s</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;"><b>Tiêu đề:</b></td>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">%s</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;"><b>Thời gian:</b></td>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">%s</td>
                    </tr>
                </table>
                
                <h3 style="color: #333; margin-top: 25px;">Nội dung tin nhắn:</h3>
                <div style="padding: 15px; background: #f9f9f9; border-radius: 5px; white-space: pre-wrap;">
                    %s
                </div>
                
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                <p style="font-size: 12px; color: #999; text-align: center;">Hệ thống tự động SneakerHub</p>
            </div>
        """.formatted(
            contact.getName(), 
            contact.getEmail(), 
            contact.getPhone() != null ? contact.getPhone() : "Không có", 
            contact.getTitle() != null ? contact.getTitle() : "Không có", 
            dateStr,
            contact.getContent() != null ? contact.getContent() : "Không có"
        );
        sendHtmlEmail(adminEmail, subject, htmlContent);
    }
}
