/**
 * announcement-mock.ts
 * Dữ liệu giả lập cho hệ thống Thông báo trường Đại học Thăng Long.
 */

export interface AnnouncementCategory {
  id: number;
  slug: string;
  name: string;
}

export interface Announcement {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: AnnouncementCategory;
  publishedAt: string;
  /** Ngày hết hiệu lực (nếu có) */
  expiresAt?: string | null;
  isHot: boolean;
  isPinned: boolean;
  attachments?: { name: string; url: string }[];
}

// ─── Categories ──────────────────────────────────────────────────────

export const announcementCategories: AnnouncementCategory[] = [
  { id: 1, slug: "hoc-phi",   name: "Học phí" },
  { id: 2, slug: "dao-tao",   name: "Đào tạo" },
  { id: 3, slug: "khao-thi",  name: "Khảo thí" },
  { id: 4, slug: "tuyen-sinh",name: "Tuyển sinh" },
  { id: 5, slug: "chung",     name: "Chung" },
];

const cat = (slug: string) => announcementCategories.find((c) => c.slug === slug)!;

// ─── Announcements ───────────────────────────────────────────────────

export const mockAnnouncements: Announcement[] = [
  {
    id: 1,
    slug: "nop-hoc-phi-hk1-2026-2027-qr",
    title: "V/v: Nộp học phí học kỳ I năm học 2026-2027 qua mã QR tĩnh định danh",
    excerpt: "Nhà trường thông báo về việc nộp học phí học kỳ I năm học 2026-2027 thông qua hình thức quét mã QR tĩnh định danh sinh viên.",
    content: `<p>Căn cứ kế hoạch tài chính năm học 2026-2027, Trường Đại học Thăng Long thông báo về việc <strong>nộp học phí học kỳ I năm học 2026-2027</strong> như sau:</p>
<h2>Thời hạn nộp học phí</h2>
<ul>
  <li>Đợt 1: <strong>05/08/2026 – 20/08/2026</strong> (ưu tiên, được giảm 1%)</li>
  <li>Đợt 2: <strong>21/08/2026 – 10/09/2026</strong></li>
  <li>Đợt 3 (cuối cùng): <strong>11/09/2026 – 30/09/2026</strong></li>
</ul>
<h2>Hình thức nộp</h2>
<p>Sinh viên sử dụng <strong>mã QR tĩnh định danh</strong> in trên thẻ sinh viên hoặc tải về từ Cổng thông tin để thanh toán tại các ngân hàng liên kết hoặc qua ứng dụng Mobile Banking.</p>
<p>Ngân hàng liên kết: <strong>Vietcombank, BIDV, Agribank, VietinBank, MB Bank</strong>.</p>
<h2>Lưu ý quan trọng</h2>
<ul>
  <li>Sinh viên <strong>chưa hoàn thành học phí</strong> đúng hạn sẽ bị <strong>khoá quyền đăng ký học phần</strong>.</li>
  <li>Không nộp tiền mặt trực tiếp tại phòng Tài chính.</li>
  <li>Mọi thắc mắc liên hệ: <strong>Phòng Tài chính – Kế toán</strong>, ĐT: 024 3858 7346 (phím 4).</li>
</ul>`,
    category: cat("hoc-phi"),
    publishedAt: "2026-05-24T07:00:00Z",
    expiresAt: "2026-09-30T23:59:00Z",
    isHot: true,
    isPinned: true,
  },
  {
    id: 2,
    slug: "ke-hoach-dang-ky-hoc-phan-hk1-2026-2027",
    title: "Kế hoạch đăng ký học phần Học kỳ I năm học 2026-2027 cho các khóa 33, 34, 35",
    excerpt: "Phòng Đào tạo thông báo lịch đăng ký học phần học kỳ I năm học 2026-2027 cho sinh viên các khoá 33, 34, 35.",
    content: `<p><strong>Phòng Đào tạo</strong> thông báo kế hoạch đăng ký học phần Học kỳ I năm học 2026-2027 như sau:</p>
<h2>Lịch đăng ký</h2>
<table>
  <tr><th>Đối tượng</th><th>Thời gian</th><th>Ghi chú</th></tr>
  <tr><td>Khóa 33 (năm 4)</td><td>01/07/2026 – 07/07/2026</td><td>Ưu tiên đăng ký trước</td></tr>
  <tr><td>Khóa 34 (năm 3)</td><td>08/07/2026 – 14/07/2026</td><td></td></tr>
  <tr><td>Khóa 35 (năm 2)</td><td>15/07/2026 – 21/07/2026</td><td></td></tr>
  <tr><td>Bổ sung (tất cả)</td><td>22/07/2026 – 28/07/2026</td><td>Thêm/bớt môn</td></tr>
</table>
<h2>Lưu ý</h2>
<ul>
  <li>Đăng nhập vào <strong>Cổng thông tin sinh viên</strong> tại địa chỉ portal để thực hiện đăng ký.</li>
  <li>Kiểm tra thời khóa biểu dự kiến trước khi đăng ký để tránh trùng tiết.</li>
  <li>Số lượng tín chỉ tối thiểu mỗi kỳ: <strong>12 tín chỉ</strong>. Tối đa: <strong>25 tín chỉ</strong>.</li>
</ul>`,
    category: cat("dao-tao"),
    publishedAt: "2026-05-20T08:00:00Z",
    isHot: true,
    isPinned: true,
  },
  {
    id: 3,
    slug: "thi-chuan-dau-ra-tieng-anh-dot-2-2026",
    title: "Thông báo về việc tổ chức thi chuẩn đầu ra Tiếng Anh đợt 2 năm 2026",
    excerpt: "Trung tâm Ngoại ngữ – Tin học thông báo kế hoạch tổ chức kỳ thi chuẩn đầu ra tiếng Anh đợt 2 năm 2026.",
    content: `<p>Căn cứ quy định về chuẩn đầu ra tiếng Anh, <strong>Trung tâm Ngoại ngữ – Tin học</strong> thông báo tổ chức kỳ thi chuẩn đầu ra Tiếng Anh đợt 2 năm 2026:</p>
<h2>Thông tin kỳ thi</h2>
<ul>
  <li>Thời gian thi: <strong>Ngày 12/07/2026</strong></li>
  <li>Địa điểm: Phòng máy tính, Tầng 5, Tòa nhà A</li>
  <li>Hình thức: Thi trên máy tính (VSTEP B1 chuẩn Bộ GD&ĐT)</li>
</ul>
<h2>Đối tượng</h2>
<p>Sinh viên chưa đạt chuẩn đầu ra tiếng Anh và <strong>dự kiến tốt nghiệp năm 2026</strong>, hoặc sinh viên muốn cải thiện điểm.</p>
<h2>Đăng ký tham dự</h2>
<p>Đăng ký trực tuyến trên Cổng thông tin từ <strong>01/06/2026 đến 25/06/2026</strong>. Lệ phí thi: <strong>350.000 VNĐ/lượt</strong> (nộp qua cổng thanh toán).</p>`,
    category: cat("khao-thi"),
    publishedAt: "2026-05-18T09:00:00Z",
    isHot: false,
    isPinned: false,
  },
  {
    id: 4,
    slug: "danh-sach-sv-du-dieu-kien-khoa-luan-dot-1",
    title: "Danh sách sinh viên đủ điều kiện làm khóa luận tốt nghiệp đợt 1 năm 2026",
    excerpt: "Phòng Đào tạo công bố danh sách sinh viên đủ điều kiện đăng ký thực hiện khóa luận tốt nghiệp đợt 1 năm 2026.",
    content: `<p><strong>Phòng Đào tạo</strong> thông báo danh sách sinh viên đủ điều kiện làm khóa luận tốt nghiệp đợt 1 năm 2026 (theo Quyết định số 45/QĐ-ĐHTL ngày 15/05/2026).</p>
<h2>Điều kiện xét duyệt</h2>
<ul>
  <li>Đã hoàn thành tối thiểu <strong>120 tín chỉ</strong> trong chương trình đào tạo.</li>
  <li>Điểm trung bình tích lũy (GPA) từ <strong>6.5 trở lên</strong> (thang 10).</li>
  <li>Không có môn học nợ quá 2 kỳ liên tiếp.</li>
</ul>
<h2>Thủ tục đăng ký</h2>
<p>Sinh viên trong danh sách nộp <strong>Phiếu đề xuất đề tài</strong> về Văn phòng Khoa chủ quản trước ngày <strong>30/06/2026</strong>.</p>
<p>File danh sách chi tiết đính kèm theo thông báo này (xem phần tệp đính kèm bên dưới).</p>`,
    category: cat("dao-tao"),
    publishedAt: "2026-05-15T08:00:00Z",
    isHot: false,
    isPinned: false,
    attachments: [
      { name: "Danh sách SV đủ điều kiện KLTN đợt 1.xlsx", url: "#" },
    ],
  },
  {
    id: 5,
    slug: "huong-dan-su-dung-portal-moi-2026",
    title: "Cập nhật tài liệu hướng dẫn sử dụng hệ thống Portal mới phiên bản 3.0",
    excerpt: "Trung tâm CNTT phát hành tài liệu hướng dẫn cập nhật cho hệ thống Cổng thông tin sinh viên phiên bản 3.0.",
    content: `<p><strong>Trung tâm Công nghệ Thông tin</strong> trân trọng thông báo về việc nâng cấp hệ thống <strong>Cổng thông tin sinh viên phiên bản 3.0</strong> với nhiều tính năng mới và giao diện hiện đại hơn.</p>
<h2>Các thay đổi chính</h2>
<ul>
  <li>Giao diện mới, tương thích hoàn toàn với thiết bị di động.</li>
  <li>Tích hợp thanh toán học phí trực tuyến qua QR Code và ví điện tử.</li>
  <li>Xem thời khóa biểu dạng lịch tuần trực quan.</li>
  <li>Tra cứu điểm và bảng điểm theo từng học kỳ.</li>
  <li>Đăng ký học phần nhanh hơn với giao diện kéo-thả.</li>
</ul>
<h2>Tài liệu hỗ trợ</h2>
<p>Sinh viên tải tài liệu hướng dẫn đầy đủ trong phần đính kèm hoặc liên hệ Trung tâm CNTT tại phòng B101 trong giờ hành chính.</p>`,
    category: cat("chung"),
    publishedAt: "2026-05-10T10:00:00Z",
    isHot: false,
    isPinned: false,
    attachments: [
      { name: "Hướng dẫn sử dụng Portal 3.0.pdf", url: "#" },
      { name: "Video hướng dẫn.mp4", url: "#" },
    ],
  },
  {
    id: 6,
    slug: "tuyen-sinh-lien-thong-dai-hoc-2026",
    title: "Thông báo tuyển sinh liên thông đại học chính quy năm 2026",
    excerpt: "Trường Đại học Thăng Long thông báo tuyển sinh đào tạo liên thông từ cao đẳng lên đại học năm 2026.",
    content: `<p>Trường Đại học Thăng Long thông báo tuyển sinh đào tạo liên thông từ trình độ <strong>Cao đẳng lên Đại học chính quy</strong> năm 2026.</p>
<h2>Ngành tuyển sinh liên thông</h2>
<ul>
  <li>Quản trị Kinh doanh</li>
  <li>Kế toán</li>
  <li>Công nghệ Thông tin</li>
  <li>Điều dưỡng</li>
</ul>
<h2>Điều kiện dự tuyển</h2>
<ul>
  <li>Có bằng tốt nghiệp Cao đẳng đúng ngành hoặc ngành gần.</li>
  <li>Không yêu cầu kinh nghiệm làm việc.</li>
</ul>
<h2>Thời gian nộp hồ sơ</h2>
<p>Từ <strong>01/06/2026 đến 31/07/2026</strong>. Nộp trực tuyến hoặc trực tiếp tại Phòng Tuyển sinh, Tầng 1 Tòa nhà A.</p>`,
    category: cat("tuyen-sinh"),
    publishedAt: "2026-05-08T08:00:00Z",
    isHot: false,
    isPinned: false,
  },
  {
    id: 7,
    slug: "lich-nghi-he-2026-sinh-vien",
    title: "Thông báo lịch nghỉ hè và kế hoạch học kỳ hè năm 2026",
    excerpt: "Nhà trường thông báo lịch nghỉ hè chính thức và kế hoạch mở học kỳ hè năm 2026 dành cho sinh viên có nhu cầu.",
    content: `<p>Nhà trường thông báo lịch nghỉ hè và kế hoạch tổ chức <strong>Học kỳ hè năm 2026</strong>:</p>
<h2>Lịch nghỉ hè</h2>
<p>Sinh viên nghỉ hè từ ngày <strong>10/06/2026 đến 30/07/2026</strong>.</p>
<h2>Học kỳ hè (tự chọn)</h2>
<p>Nhà trường tổ chức học kỳ hè từ <strong>01/07/2026 đến 10/08/2026</strong> cho sinh viên có nhu cầu học vượt, cải thiện điểm hoặc trả nợ môn.</p>
<ul>
  <li>Đăng ký: <strong>15/06/2026 – 25/06/2026</strong> trên Cổng thông tin</li>
  <li>Số môn tối đa: 3 môn/kỳ hè</li>
  <li>Học phí học kỳ hè tính theo số tín chỉ đăng ký</li>
</ul>`,
    category: cat("dao-tao"),
    publishedAt: "2026-05-05T09:00:00Z",
    isHot: false,
    isPinned: false,
  },
  {
    id: 8,
    slug: "thu-vien-gio-mo-cua-he-2026",
    title: "Thông báo điều chỉnh giờ mở cửa Thư viện trong thời gian hè 2026",
    excerpt: "Thư viện Đại học Thăng Long thông báo điều chỉnh giờ mở cửa trong thời gian hè từ ngày 10/06/2026.",
    content: `<p><strong>Thư viện Đại học Thăng Long</strong> thông báo điều chỉnh giờ mở cửa phục vụ bạn đọc trong thời gian hè 2026:</p>
<h2>Giờ mở cửa mới (từ 10/06/2026)</h2>
<ul>
  <li>Thứ Hai – Thứ Sáu: <strong>08:00 – 17:00</strong></li>
  <li>Thứ Bảy: <strong>08:00 – 12:00</strong></li>
  <li>Chủ Nhật & Ngày lễ: <strong>Đóng cửa</strong></li>
</ul>
<p>Bạn đọc có thể truy cập tài nguyên thư viện số <strong>24/7</strong> tại địa chỉ thư viện điện tử của trường.</p>`,
    category: cat("chung"),
    publishedAt: "2026-05-02T08:00:00Z",
    isHot: false,
    isPinned: false,
  },
];
