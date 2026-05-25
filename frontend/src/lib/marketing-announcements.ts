export const announcementCategories = [
  "Tất cả",
  "Học phí",
  "Đào tạo",
  "Khảo thí",
  "Chung",
] as const;

export interface MarketingAnnouncement {
  id: number;
  slug: string;
  title: string;
  summary: string;
  content: string[];
  day: string;
  month: string;
  fullDate: string;
  category: (typeof announcementCategories)[number] extends "Tất cả"
    ? never
    : Exclude<(typeof announcementCategories)[number], "Tất cả">;
  department: string;
  isNew: boolean;
}

export const marketingAnnouncements: MarketingAnnouncement[] = [
  {
    id: 1,
    slug: "nop-hoc-phi-hoc-ky-i-2026-2027-qua-ma-qr",
    title: "V/v: Nộp học phí học kỳ I năm học 2026-2027 qua mã QR tĩnh định danh",
    summary:
      "Sinh viên thực hiện nộp học phí theo đúng thời hạn và kiểm tra trạng thái xác nhận trên hệ thống Portal.",
    content: [
      "Nhà trường thông báo kế hoạch thu học phí học kỳ I năm học 2026-2027 qua mã QR tĩnh định danh. Sinh viên cần sử dụng đúng thông tin thanh toán được cung cấp trong tài khoản Portal cá nhân.",
      "Sau khi hoàn tất giao dịch, sinh viên kiểm tra trạng thái ghi nhận học phí trên hệ thống. Trường hợp sau thời gian xử lý mà trạng thái chưa cập nhật, sinh viên liên hệ Phòng Tài chính để được hỗ trợ.",
      "Sinh viên cần hoàn thành nghĩa vụ học phí trước thời hạn thông báo để bảo đảm quyền đăng ký học phần và tham gia các hoạt động học tập trong học kỳ.",
    ],
    day: "24",
    month: "Th05",
    fullDate: "24/05/2026",
    category: "Học phí",
    department: "Phòng Tài chính",
    isNew: true,
  },
  {
    id: 2,
    slug: "ke-hoach-dang-ky-hoc-phan-hoc-ky-i-2026-2027",
    title: "Kế hoạch đăng ký học phần học kỳ I năm học 2026-2027 cho các khóa 33, 34, 35",
    summary:
      "Lịch đăng ký học phần được chia theo từng khóa. Sinh viên cần theo dõi thời gian mở đăng ký của lớp mình.",
    content: [
      "Phòng Đào tạo thông báo kế hoạch đăng ký học phần học kỳ I năm học 2026-2027 cho sinh viên các khóa 33, 34 và 35.",
      "Sinh viên đăng nhập Portal theo đúng khung thời gian của khóa, kiểm tra chương trình đào tạo, điều kiện tiên quyết và số tín chỉ tối đa trước khi đăng ký.",
      "Trong thời gian đăng ký, hệ thống có thể giới hạn số lượng truy cập đồng thời. Sinh viên cần thao tác đúng quy trình và không chia sẻ tài khoản cá nhân cho người khác.",
    ],
    day: "20",
    month: "Th05",
    fullDate: "20/05/2026",
    category: "Đào tạo",
    department: "Phòng Đào tạo",
    isNew: true,
  },
  {
    id: 3,
    slug: "thi-chuan-dau-ra-tieng-anh-dot-2-2026",
    title: "Thông báo về việc tổ chức thi chuẩn đầu ra Tiếng Anh đợt 2 năm 2026",
    summary:
      "Sinh viên đăng ký dự thi đúng hạn, chuẩn bị giấy tờ tùy thân và có mặt tại phòng thi theo danh sách.",
    content: [
      "Trung tâm Khảo thí thông báo tổ chức kỳ thi chuẩn đầu ra Tiếng Anh đợt 2 năm 2026 dành cho sinh viên có nhu cầu xét điều kiện tốt nghiệp.",
      "Sinh viên theo dõi danh sách phòng thi, ca thi và các yêu cầu về giấy tờ tùy thân trên Portal. Những trường hợp sai thông tin cần phản hồi trước hạn chốt danh sách.",
      "Sinh viên có mặt tại địa điểm thi trước giờ thi tối thiểu 30 phút. Nhà trường không giải quyết các trường hợp đến muộn sau khi phòng thi đã bắt đầu làm bài.",
    ],
    day: "18",
    month: "Th05",
    fullDate: "18/05/2026",
    category: "Khảo thí",
    department: "Trung tâm Khảo thí",
    isNew: false,
  },
  {
    id: 4,
    slug: "danh-sach-sinh-vien-du-dieu-kien-lam-khoa-luan-tot-nghiep-dot-1",
    title: "Danh sách sinh viên đủ điều kiện làm khóa luận tốt nghiệp đợt 1",
    summary:
      "Sinh viên trong danh sách liên hệ khoa chuyên môn để nhận giảng viên hướng dẫn và lịch triển khai.",
    content: [
      "Các khoa chuyên môn công bố danh sách sinh viên đủ điều kiện làm khóa luận tốt nghiệp đợt 1.",
      "Sinh viên có tên trong danh sách cần liên hệ khoa để nhận thông tin giảng viên hướng dẫn, lịch nộp đề cương và các mốc đánh giá.",
      "Sinh viên không có tên trong danh sách nhưng cho rằng đủ điều kiện cần gửi yêu cầu rà soát trong thời hạn thông báo.",
    ],
    day: "15",
    month: "Th05",
    fullDate: "15/05/2026",
    category: "Đào tạo",
    department: "Các khoa chuyên môn",
    isNew: false,
  },
  {
    id: 5,
    slug: "cap-nhat-tai-lieu-huong-dan-su-dung-portal-moi",
    title: "Cập nhật tài liệu hướng dẫn sử dụng hệ thống Portal mới",
    summary:
      "Tài liệu hướng dẫn đăng nhập, xem lịch học, xem điểm, đăng ký học phần và gửi yêu cầu hỗ trợ đã được cập nhật.",
    content: [
      "Trung tâm CNTT đã cập nhật tài liệu hướng dẫn sử dụng hệ thống Portal mới dành cho sinh viên.",
      "Tài liệu bao gồm các thao tác đăng nhập, đổi mật khẩu, xem lịch học, xem điểm, đăng ký học phần, theo dõi học phí và gửi yêu cầu hỗ trợ.",
      "Sinh viên nên đọc kỹ hướng dẫn trước khi sử dụng các chức năng mới để hạn chế lỗi thao tác trong các giai đoạn cao điểm.",
    ],
    day: "10",
    month: "Th05",
    fullDate: "10/05/2026",
    category: "Chung",
    department: "Trung tâm CNTT",
    isNew: false,
  },
  {
    id: 6,
    slug: "ra-soat-thong-tin-ca-nhan-truoc-ky-xet-tot-nghiep",
    title: "Thông báo rà soát thông tin cá nhân sinh viên trước kỳ xét tốt nghiệp",
    summary:
      "Sinh viên kiểm tra họ tên, ngày sinh, ngành học và thông tin liên hệ để bảo đảm dữ liệu xét tốt nghiệp chính xác.",
    content: [
      "Phòng Công tác sinh viên đề nghị sinh viên thuộc diện xét tốt nghiệp kiểm tra lại toàn bộ thông tin cá nhân trên Portal.",
      "Các thông tin cần rà soát gồm họ tên, ngày sinh, giới tính, ngành học, lớp quản lý, số điện thoại và email liên hệ.",
      "Nếu phát hiện sai lệch, sinh viên gửi yêu cầu cập nhật kèm minh chứng hợp lệ trước thời hạn để nhà trường xử lý.",
    ],
    day: "08",
    month: "Th05",
    fullDate: "08/05/2026",
    category: "Chung",
    department: "Phòng Công tác sinh viên",
    isNew: false,
  },
];

export function getAnnouncementBySlug(slug: string) {
  return marketingAnnouncements.find((announcement) => announcement.slug === slug);
}

export function getRelatedAnnouncements(slug: string, category: MarketingAnnouncement["category"]) {
  return marketingAnnouncements
    .filter((announcement) => announcement.slug !== slug && announcement.category === category)
    .slice(0, 3);
}
