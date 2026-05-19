package com.example.ThangLongUniversityWeb.service;

import com.example.ThangLongUniversityWeb.config.VNPayConfig;
import com.example.ThangLongUniversityWeb.dto.response.TuitionItemResponse;
import com.example.ThangLongUniversityWeb.dto.response.TuitionResponse;
import com.example.ThangLongUniversityWeb.entity.Enrollment;
import com.example.ThangLongUniversityWeb.entity.Semester;
import com.example.ThangLongUniversityWeb.entity.Student;
import com.example.ThangLongUniversityWeb.entity.TuitionBill;
import com.example.ThangLongUniversityWeb.repository.EnrollmentRepository;
import com.example.ThangLongUniversityWeb.repository.SemesterRepository;
import com.example.ThangLongUniversityWeb.repository.StudentRepository;
import com.example.ThangLongUniversityWeb.repository.TuitionBillRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class StudentTuitionService {

    private final TuitionBillRepository tuitionBillRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final StudentRepository studentRepository;
    private final SemesterRepository semesterRepository;
    private final VNPayConfig vnPayConfig;

    private final BigDecimal PRICE_PER_CREDIT = new BigDecimal("850000"); // 850k/1 tín chỉ

    private Student getCurrentStudent() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return studentRepository.findByUser_Username(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin sinh viên!"));
    }

    // 1. TẠO HOẶC XEM HÓA ĐƠN
    @Transactional
    public TuitionResponse getTuitionFee(Long semesterId) {
        Student student = getCurrentStudent();
        Semester semester = semesterRepository.findById(semesterId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy học kỳ!"));

        List<Enrollment> enrollments = enrollmentRepository.findByStudentIdAndClassSection_SemesterId(student.getId(), semesterId);

        int totalCredits = enrollments.stream()
                .mapToInt(e -> e.getClassSection().getCourse().getCredits())
                .sum();

        BigDecimal totalAmount = PRICE_PER_CREDIT.multiply(new BigDecimal(totalCredits));

        TuitionBill bill = tuitionBillRepository.findByStudentIdAndSemesterId(student.getId(), semesterId)
                .orElse(new TuitionBill());

        if (!bill.isCompleted()) {
            bill.setStudent(student);
            bill.setSemester(semester);
            bill.setTotalAmount(totalAmount);
            if (bill.getPaidAmount() == null) bill.setPaidAmount(BigDecimal.ZERO);
            if (bill.getCreatedAt() == null) bill.setCreatedAt(LocalDateTime.now());
            bill = tuitionBillRepository.save(bill);
        }

        // Build chi tiet tung mon
        List<TuitionItemResponse> items = enrollments.stream().map(e -> {
            var course = e.getClassSection().getCourse();
            int credits = course.getCredits() != null ? course.getCredits() : 0;
            long subtotal = PRICE_PER_CREDIT.longValue() * credits;
            return new TuitionItemResponse(
                    course.getCode(),
                    course.getName(),
                    credits,
                    PRICE_PER_CREDIT.longValue(),
                    subtotal
            );
        }).toList();

        return TuitionResponse.builder()
                .semesterName(semester.getName())
                .totalCredits(totalCredits)
                .totalAmount(bill.getTotalAmount().longValue())
                .pricePerCredit(PRICE_PER_CREDIT.longValue())
                .isPaid(bill.isCompleted())
                .items(items)
                .build();
    }

    // 2. TẠO URL VNPAY
    @Transactional
    public String createVNPayUrl(Long semesterId, HttpServletRequest request) {
        Student student = getCurrentStudent();
        TuitionBill bill = tuitionBillRepository.findByStudentIdAndSemesterId(student.getId(), semesterId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hóa đơn học phí!"));

        if (bill.isCompleted()) {
            throw new RuntimeException("Hóa đơn này đã được thanh toán!");
        }

        // VNPAY yêu cầu số tiền nhân thêm 100
        long amount = bill.getTotalAmount().longValue() * 100L;

        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", vnPayConfig.getVnpVersion());
        vnp_Params.put("vnp_Command", vnPayConfig.getVnpCommand());
        vnp_Params.put("vnp_TmnCode", vnPayConfig.getVnpTmnCode());
        vnp_Params.put("vnp_Amount", String.valueOf(amount));
        vnp_Params.put("vnp_CurrCode", "VND");

        // MẸO: Lưu ID hóa đơn nối với chuỗi ngẫu nhiên để lát nữa Return còn biết là thanh toán cho hóa đơn nào
        String txnRef = bill.getId() + "_" + vnPayConfig.getRandomNumber(8);
        vnp_Params.put("vnp_TxnRef", txnRef);

        vnp_Params.put("vnp_OrderInfo", "Thanh toan hoc phi HK " + semesterId + " SV " + student.getStudentCode());
        vnp_Params.put("vnp_OrderType", "other");
        vnp_Params.put("vnp_Locale", "vn");
        vnp_Params.put("vnp_ReturnUrl", vnPayConfig.getVnpReturnUrl());
        vnp_Params.put("vnp_IpAddr", vnPayConfig.getIpAddress(request));

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnp_CreateDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);

        cld.add(Calendar.MINUTE, 15); // Thời hạn thanh toán 15 phút
        String vnp_ExpireDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();

        try {
            Iterator<String> itr = fieldNames.iterator();
            while (itr.hasNext()) {
                String fieldName = itr.next();
                String fieldValue = vnp_Params.get(fieldName);
                if ((fieldValue != null) && (fieldValue.length() > 0)) {
                    hashData.append(fieldName);
                    hashData.append('=');
                    hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                    query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII.toString()));
                    query.append('=');
                    query.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                    if (itr.hasNext()) {
                        query.append('&');
                        hashData.append('&');
                    }
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("Lỗi tạo mã URL VNPAY");
        }

        String queryUrl = query.toString();
        String vnp_SecureHash = vnPayConfig.hmacSHA512(vnPayConfig.getSecretKey(), hashData.toString());
        queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;

        return vnPayConfig.getVnpPayUrl() + "?" + queryUrl;
    }

    // 3. HỨNG KẾT QUẢ TỪ VNPAY VÀ CẬP NHẬT DATABASE
    @Transactional
    public String processVNPayReturn(HttpServletRequest request) {
        Map<String, String> fields = new HashMap<>();
        for (Enumeration<String> params = request.getParameterNames(); params.hasMoreElements(); ) {
            String fieldName = params.nextElement();
            String fieldValue = request.getParameter(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                fields.put(fieldName, fieldValue);
            }
        }

        String vnp_SecureHash = request.getParameter("vnp_SecureHash");
        fields.remove("vnp_SecureHashType");
        fields.remove("vnp_SecureHash");

        // Hash lại dữ liệu để kiểm tra xem có hacker sửa tiền không
        List<String> fieldNames = new ArrayList<>(fields.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        try {
            Iterator<String> itr = fieldNames.iterator();
            while (itr.hasNext()) {
                String fieldName = itr.next();
                String fieldValue = fields.get(fieldName);
                if ((fieldValue != null) && (fieldValue.length() > 0)) {
                    hashData.append(fieldName);
                    hashData.append('=');
                    hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                    if (itr.hasNext()) {
                        hashData.append('&');
                    }
                }
            }
        } catch (Exception e) {
            return "Lỗi giải mã dữ liệu VNPAY!";
        }

        String signValue = vnPayConfig.hmacSHA512(vnPayConfig.getSecretKey(), hashData.toString());

        if (signValue.equals(vnp_SecureHash)) {
            // Mã "00" có nghĩa là giao dịch thành công bên phía Ngân hàng
            if ("00".equals(request.getParameter("vnp_TransactionStatus"))) {

                // Lấy ID hóa đơn ra từ vnp_TxnRef (Ví dụ: "5_92837482" -> Lấy số 5)
                String txnRef = request.getParameter("vnp_TxnRef");
                Long billId = Long.parseLong(txnRef.split("_")[0]);

                TuitionBill bill = tuitionBillRepository.findById(billId)
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy hóa đơn!"));

                // CẬP NHẬT TRẠNG THÁI: ĐÃ ĐÓNG TIỀN
                bill.setCompleted(true);
                bill.setPaidAmount(bill.getTotalAmount());
                tuitionBillRepository.save(bill);

                return "Giao dịch thành công! Mã giao dịch: " + request.getParameter("vnp_TransactionNo");
            } else {
                return "Giao dịch không thành công hoặc bị hủy (Mã lỗi: " + request.getParameter("vnp_TransactionStatus") + ").";
            }
        } else {
            return "Lỗi bảo mật: Chữ ký dữ liệu không hợp lệ!";
        }
    }
}