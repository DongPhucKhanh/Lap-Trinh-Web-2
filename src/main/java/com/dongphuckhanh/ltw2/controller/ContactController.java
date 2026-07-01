package com.dongphuckhanh.ltw2.controller;

import com.dongphuckhanh.ltw2.entity.Contact;
import com.dongphuckhanh.ltw2.repository.ContactRepository;
import com.dongphuckhanh.ltw2.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.dongphuckhanh.ltw2.service.EmailService;
import org.springframework.beans.factory.annotation.Value;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/contacts")
public class ContactController {

    @Autowired
    private ContactRepository contactRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    @Value("${spring.mail.username}")
    private String adminEmail;

    // 1. Lấy tất cả liên hệ (dành cho Admin)
    @GetMapping
    public ResponseEntity<List<Contact>> getAllContacts() {
        return ResponseEntity.ok(contactRepository.findAll());
    }

    // 2. Lấy liên hệ theo ID
    @GetMapping("/{id}")
    public ResponseEntity<Contact> getContactById(@PathVariable Long id) {
        return contactRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 3. Lấy tất cả liên hệ của một User
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Contact>> getContactsByUser(@PathVariable Long userId) {
        List<Contact> contacts = contactRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return ResponseEntity.ok(contacts);
    }

    // 4. Gửi liên hệ mới
    //    Body JSON mẫu:
    //    {
    //      "name": "Nguyen Van A",
    //      "email": "a@email.com",
    //      "phone": "0901234567",
    //      "title": "Hỏi về sản phẩm",
    //      "content": "Tôi muốn hỏi về...",
    //      "userId": 1    (tùy chọn, null nếu khách vãng lai)
    //    }
    @PostMapping
    public ResponseEntity<?> createContact(@RequestBody Contact contact) {
        if (contact.getName() == null || contact.getEmail() == null
                || contact.getTitle() == null || contact.getContent() == null) {
            return ResponseEntity.badRequest()
                    .body("Thiếu thông tin bắt buộc: name, email, title, content");
        }

        // Gán user nếu contact có user (đã đăng nhập)
        if (contact.getUser() != null && contact.getUser().getId() != null) {
            userRepository.findById(contact.getUser().getId())
                    .ifPresent(contact::setUser);
        }

        Contact saved = contactRepository.save(contact);

        // Gửi email
        if (saved.getEmail() != null && !saved.getEmail().isBlank()) {
            // 1. Email cảm ơn gửi cho khách
            emailService.sendContactThankYou(saved.getEmail(), saved.getName());
            
            // 2. Email thông báo cho Admin
            if (adminEmail != null && !adminEmail.isBlank()) {
                emailService.sendContactNoticeToAdmin(adminEmail, saved);
            }
        }

        return ResponseEntity.ok(saved);
    }

    // 5. Cập nhật trạng thái liên hệ (Admin đánh dấu đã đọc / đã trả lời)
    //    Body JSON: { "status": 1 }
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateContactStatus(@PathVariable Long id,
                                                  @RequestBody Map<String, Integer> body) {
        Integer newStatus = body.get("status");
        if (newStatus == null) {
            return ResponseEntity.badRequest().body("Vui lòng truyền trường 'status'");
        }

        return contactRepository.findById(id)
                .map(contact -> {
                    contact.setStatus(newStatus);
                    return ResponseEntity.ok(contactRepository.save(contact));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // 6. Admin phản hồi liên hệ (tạo bản ghi Contact mới có replyId trỏ về contact gốc)
    //    Body JSON:
    //    {
    //      "name": "Admin",
    //      "email": "admin@anvat.vn",
    //      "title": "Re: Hỏi về sản phẩm",
    //      "content": "Cảm ơn bạn đã liên hệ..."
    //    }
    @PostMapping("/{id}/reply")
    public ResponseEntity<?> replyContact(@PathVariable Long id, @RequestBody Contact replyContact) {
        Optional<Contact> originalOpt = contactRepository.findById(id);
        if (originalOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Contact original = originalOpt.get();

        // Thiết lập thông tin phản hồi
        replyContact.setReplyId(original.getId());

        Contact savedReply = contactRepository.save(replyContact);

        // Cập nhật trạng thái liên hệ gốc thành "đã trả lời" (status = 2)
        original.setStatus(2);
        contactRepository.save(original);

        return ResponseEntity.ok(savedReply);
    }

    // 7. Xóa liên hệ theo ID
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteContact(@PathVariable Long id) {
        if (!contactRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        contactRepository.deleteById(id);
        return ResponseEntity.ok("Đã xóa liên hệ thành công!");
    }
}
