import type {
  ArticleResponse,
  ArticleCategoryResponse,
  ArticleTagResponse,
} from "@/lib/api/article-types";

// ─── Categories ──────────────────────────────────────────────────────

export const mockCategories: ArticleCategoryResponse[] = [
  { id: 1, slug: "tuyen-sinh", name: "Tuyển sinh", description: "Thông tin tuyển sinh đại học, sau đại học." },
  { id: 2, slug: "hoc-thuat", name: "Học thuật", description: "Nghiên cứu khoa học, hội thảo, kiểm định chất lượng." },
  { id: 3, slug: "sinh-vien", name: "Đời sống sinh viên", description: "Hoạt động CLB, sự kiện, thành tích sinh viên." },
  { id: 4, slug: "hop-tac-quoc-te", name: "Hợp tác quốc tế", description: "Trao đổi sinh viên, liên kết đào tạo quốc tế." },
  { id: 5, slug: "su-kien", name: "Sự kiện", description: "Hội thảo, lễ kỷ niệm, ngày hội việc làm." },
];

export const mockTags: ArticleTagResponse[] = [
  { id: 1, slug: "ai", name: "Trí tuệ nhân tạo" },
  { id: 2, slug: "hoc-bong", name: "Học bổng" },
  { id: 3, slug: "tuyen-sinh-2025", name: "Tuyển sinh 2025" },
  { id: 4, slug: "cuu-sinh-vien", name: "Cựu sinh viên" },
  { id: 5, slug: "clb", name: "Câu lạc bộ" },
  { id: 6, slug: "cntt", name: "Công nghệ thông tin" },
  { id: 7, slug: "kinh-te", name: "Kinh tế" },
  { id: 8, slug: "ngon-ngu", name: "Ngôn ngữ" },
  { id: 9, slug: "truyen-thong", name: "Truyền thông" },
  { id: 10, slug: "quoc-te", name: "Quốc tế" },
];

const cat = (slug: string) => mockCategories.find((c) => c.slug === slug)!;
const tags = (...slugs: string[]) => slugs.map((s) => mockTags.find((t) => t.slug === s)!);
const author = { name: "Ban Truyền thông TLU", role: "Phòng Truyền thông" };

// ─── Articles ────────────────────────────────────────────────────────

export const mockArticles: ArticleResponse[] = [
  {
    id: 1,
    slug: "thong-bao-tuyen-sinh-2025",
    title: "Thông báo tuyển sinh đại học chính quy năm 2025",
    excerpt: "Đại học Thăng Long công bố 6 phương thức xét tuyển đại học chính quy năm 2025 với ngưỡng điểm sàn từ 16–23 điểm.",
    content: `<p>Trường Đại học Thăng Long chính thức công bố phương án tuyển sinh đại học chính quy năm 2025 với <strong>6 phương thức xét tuyển</strong>, mang đến cơ hội rộng mở cho thí sinh trên toàn quốc.</p>
<h2>Các phương thức xét tuyển</h2>
<ol><li>Xét điểm thi tốt nghiệp THPT 2025</li><li>Xét học bạ THPT (xét tuyển sớm)</li><li>Chứng chỉ Đánh giá năng lực (HSA) — ĐHQGHN</li><li>Chứng chỉ Đánh giá tư duy (TSA) — ĐHBKHN</li><li>Chứng chỉ quốc tế (IELTS, TOEFL, SAT)</li><li>Xét tuyển thẳng theo quy chế Bộ GD&ĐT</li></ol>
<h2>Điểm chuẩn tham khảo</h2>
<p>Ngành <strong>Truyền thông đa phương tiện</strong> dẫn đầu với 26.52 điểm (2024) và 23.75 điểm (2025, tổ hợp D01). Ngành <strong>Trí tuệ nhân tạo</strong> có mức điểm sàn tiếp cận cởi mở từ 16–17 điểm — cơ hội tuyệt vời cho thí sinh đam mê công nghệ.</p>
<p>Hạn nộp hồ sơ: <strong>30/06/2025</strong>. Hotline tư vấn: <strong>1900 1582</strong>.</p>`,
    category: cat("tuyen-sinh"),
    tags: tags("tuyen-sinh-2025", "ai", "truyen-thong"),
    author,
    publishedAt: "2025-04-12T08:00:00Z",
    readingTime: 4,
    viewCount: 12840,
    relatedArticleIds: [2, 5, 8],
  },
  {
    id: 2,
    slug: "diem-chuan-2024-ky-luc-truyen-thong",
    title: "Truyền thông đa phương tiện xác lập kỷ lục điểm chuẩn 2024",
    excerpt: "Ngành Truyền thông đa phương tiện đạt mức điểm chuẩn trúng tuyển cao nhất toàn trường năm 2024 với 26.52 điểm.",
    content: `<p>Trong kỳ tuyển sinh 2024, ngành <strong>Truyền thông đa phương tiện</strong> tại Đại học Thăng Long đã xác lập kỷ lục với mức điểm chuẩn <strong>26.52 điểm</strong> — cao nhất toàn trường.</p>
<p>Con số này phản ánh sức hút mãnh liệt của khối ngành sáng tạo đối với thế hệ Gen Z, đồng thời khẳng định chất lượng đào tạo của TLU trong lĩnh vực truyền thông và thiết kế.</p>
<blockquote>"Sinh viên Truyền thông TLU không chỉ học lý thuyết mà được cọ xát thực chiến qua các dự án thực tế ngay từ năm nhất" — Trưởng Khoa Truyền thông Đa phương tiện.</blockquote>`,
    category: cat("tuyen-sinh"),
    tags: tags("truyen-thong", "tuyen-sinh-2025"),
    author,
    publishedAt: "2024-08-20T10:00:00Z",
    readingTime: 3,
    viewCount: 8920,
    relatedArticleIds: [1, 6],
  },
  {
    id: 3,
    slug: "nguyen-gia-huy-thac-si-temple-university",
    title: "Cựu sinh viên Nguyễn Gia Huy chinh phục Thạc sĩ tại Temple University, Nhật Bản",
    excerpt: "Từ giảng đường Thăng Long đến Temple University — hành trình bản lĩnh và ý chí của chàng trai 9X.",
    content: `<p>Cựu sinh viên <strong>Nguyễn Gia Huy</strong> — trưởng thành từ Đại học Thăng Long — đã vươn lên xuất sắc để theo học chương trình <strong>Thạc sĩ Kinh tế tại Temple University</strong> (Nhật Bản), cơ sở quốc tế lâu đời và lớn nhất tại Nhật.</p>
<p>Câu chuyện của Gia Huy là bài ca về ý chí nỗ lực bền bỉ, sự trưởng thành sớm từ những khó khăn rèn luyện và bản lĩnh của người trẻ Việt vươn ra quốc tế.</p>
<blockquote>"Thăng Long đã cho tôi nền tảng vững chắc — không chỉ kiến thức chuyên môn mà còn là tư duy độc lập và khát vọng vươn xa" — Nguyễn Gia Huy.</blockquote>`,
    category: cat("sinh-vien"),
    tags: tags("cuu-sinh-vien", "kinh-te", "quoc-te"),
    author,
    publishedAt: "2025-03-15T09:00:00Z",
    readingTime: 5,
    viewCount: 6540,
    relatedArticleIds: [4, 7],
  },
  {
    id: 4,
    slug: "pham-anh-duy-giong-hat-viet",
    title: "Phạm Anh Duy — từ Thăng Long đến sân khấu Giọng hát Việt",
    excerpt: "Ca sĩ Phạm Anh Duy (Duy Pad), học trò cưng của HLV Thu Phương tại The Voice 2015, là gương mặt nghệ thuật tiêu biểu của TLU.",
    content: `<p><strong>Phạm Anh Duy</strong> (nghệ danh Duy Pad) nổi lên từ chương trình <strong>Giọng hát Việt 2015</strong> với vai trò học trò cưng của huấn luyện viên Thu Phương.</p>
<p>Trưởng thành từ môi trường tự do sáng tạo của Đại học Thăng Long, Phạm Anh Duy là minh chứng cho triết lý giáo dục phát triển toàn diện — nơi sinh viên có thể theo đuổi đam mê nghệ thuật song hành cùng kiến thức học thuật.</p>`,
    category: cat("sinh-vien"),
    tags: tags("cuu-sinh-vien", "truyen-thong"),
    author,
    publishedAt: "2025-02-28T14:00:00Z",
    readingTime: 3,
    viewCount: 9200,
    relatedArticleIds: [3, 7],
  },
  {
    id: 5,
    slug: "co-hoi-nganh-tri-tue-nhan-tao-tlu",
    title: "Cơ hội rộng mở với ngành Trí tuệ nhân tạo tại TLU",
    excerpt: "Với mức điểm sàn 16–17 điểm, ngành AI tại Thăng Long mở ra cơ hội cho thí sinh đam mê công nghệ nhưng chưa tự tin về điểm số.",
    content: `<p>Ngành <strong>Trí tuệ nhân tạo (AI)</strong> tại Đại học Thăng Long có mức điểm sàn tiếp cận cực kỳ cởi mở: <strong>17 điểm</strong> (tổ hợp A00, X06, X26) và <strong>16 điểm</strong> (tổ hợp A01, D01, D07).</p>
<h2>Tại sao chọn AI tại TLU?</h2>
<ul><li>Phòng lab AI và fablab hiện đại</li><li>Giảng viên tốt nghiệp từ các trường danh tiếng</li><li>Chương trình gắn liền doanh nghiệp công nghệ</li><li>Cơ hội thực tập từ năm 3</li></ul>
<p>Đây là lợi thế tuyệt đối cho các thí sinh có năng lực trung khá nhưng đam mê công nghệ — bệ phóng vững chắc vào ngành nghề của tương lai.</p>`,
    category: cat("hoc-thuat"),
    tags: tags("ai", "cntt", "tuyen-sinh-2025"),
    author,
    publishedAt: "2025-04-05T07:30:00Z",
    readingTime: 4,
    viewCount: 15200,
    relatedArticleIds: [1, 2],
  },
  {
    id: 6,
    slug: "im-club-business-marketing-challenge",
    title: "iM Club TLU khởi động mùa 2 Thang Long Business & Marketing Challenge",
    excerpt: "Sân chơi trí tuệ được nâng cấp thành đấu trường \"Ý tưởng kinh doanh số\" dành cho sinh viên toàn trường.",
    content: `<p>CLB Marketing <strong>iM Club TLU</strong> chính thức khởi động mùa 2 cuộc thi <strong>Thang Long Business & Marketing Challenge</strong> — nâng cấp thành đấu trường "Ý tưởng kinh doanh số".</p>
<p>Cuộc thi mang đến cơ hội để sinh viên cọ xát với kiến thức số hóa mới nhất, phá vỡ giới hạn bản thân, và tìm kiếm cảm hứng khởi nghiệp ngay trên giảng đường đại học.</p>`,
    category: cat("su-kien"),
    tags: tags("clb", "kinh-te"),
    author,
    publishedAt: "2025-03-20T08:00:00Z",
    readingTime: 3,
    viewCount: 4300,
    relatedArticleIds: [7, 9],
  },
  {
    id: 7,
    slug: "lsc-gap-mat-clb-logistics-phia-bac",
    title: "LSC Thăng Long tham gia gặp mặt CLB Logistics khu vực phía Bắc",
    excerpt: "Sinh viên TLU kết nối cùng ĐH Kinh tế Quốc dân, ĐH Bách khoa, Học viện Tài chính tại sự kiện networking ngành Logistics.",
    content: `<p>CLB Logistics và Chuỗi cung ứng (<strong>LSC</strong>) Đại học Thăng Long đã tham gia sự kiện gặp mặt các CLB Logistics khu vực phía Bắc, đồng hành cùng các tên tuổi lớn như <strong>ĐH Kinh tế Quốc dân, ĐH Công nghệ GTVT, Học viện Tài chính, ĐH Phenikaa và ĐH Đại Nam</strong>.</p>
<p>Sự kiện khẳng định sức mạnh kết nối của LSC Thăng Long — trở thành sinh viên TLU đồng nghĩa với việc gia nhập mạng lưới quan hệ rộng lớn của ngành nghề trên toàn miền Bắc.</p>`,
    category: cat("su-kien"),
    tags: tags("clb", "kinh-te"),
    author,
    publishedAt: "2025-03-05T09:30:00Z",
    readingTime: 3,
    viewCount: 3100,
    relatedArticleIds: [6, 9],
  },
  {
    id: 8,
    slug: "hoc-bong-lotte-sinh-vien-tlu",
    title: "Học bổng LOTTE dành riêng cho sinh viên Đại học Thăng Long",
    excerpt: "Tập đoàn LOTTE cấp phát học bổng cho sinh viên TLU — minh chứng cho sự ghi nhận từ doanh nghiệp đa quốc gia.",
    content: `<p>Đại học Thăng Long tiếp tục duy trì mối quan hệ doanh nghiệp chặt chẽ với việc <strong>Tập đoàn LOTTE</strong> cấp phát học bổng dành riêng cho sinh viên nhà trường.</p>
<p>Đây là minh chứng cho thấy sinh viên TLU được các tập đoàn đa quốc gia chú ý và đầu tư trực tiếp — bên cạnh hệ thống học bổng học thuật nội bộ với 3 ngưỡng: Khá – Giỏi – Xuất sắc.</p>
<h2>Chính sách học bổng nội bộ</h2>
<ul><li><strong>Xuất sắc</strong> (GPA ≥ 9.0): 5.000.000 VNĐ/suất</li><li><strong>Giỏi</strong> (GPA ≥ 8.0): 3.000.000 VNĐ/suất</li></ul>`,
    category: cat("sinh-vien"),
    tags: tags("hoc-bong"),
    author,
    publishedAt: "2025-01-20T10:00:00Z",
    readingTime: 3,
    viewCount: 7600,
    relatedArticleIds: [1, 9],
  },
  {
    id: 9,
    slug: "thac-si-quoc-te-nice-sophia-antipolis",
    title: "Chương trình Thạc sĩ liên kết Đại học Nice - Sophia Antipolis (Pháp)",
    excerpt: "Thạc sĩ Kinh doanh & Quản trị Quốc tế — đối tác Top 3 ĐH công lập Pháp, Top 500 thế giới. Học phí 4,000 EUR toàn khóa.",
    content: `<p>Chương trình đào tạo <strong>Thạc sĩ Kinh doanh và Quản trị Quốc tế</strong> do Đại học Thăng Long liên kết với <strong>Đại học Nice - Sophia Antipolis</strong> (Pháp) — xếp thứ 3 trong các trường đại học công lập của Pháp, lọt Top 500 thế giới.</p>
<h2>Điểm nổi bật</h2>
<ul><li>Xếp hạng #2 toàn nước Pháp về chương trình thạc sĩ kinh doanh</li><li>Liên kết Hội đồng Ngoại thương Chính phủ Pháp</li><li>Chấp nhận cử nhân từ mọi chuyên ngành</li><li>Học phí: 4,000 EUR (4 kỳ × 1,000 EUR)</li><li>Yêu cầu: Tiếng Anh B1+ — luyện thi miễn phí</li></ul>`,
    category: cat("hop-tac-quoc-te"),
    tags: tags("quoc-te", "kinh-te"),
    author,
    publishedAt: "2025-02-10T08:00:00Z",
    readingTime: 5,
    viewCount: 5400,
    relatedArticleIds: [3, 10],
  },
  {
    id: 10,
    slug: "tuan-le-khoi-nghiep-tlu-2025",
    title: "Khai mạc Tuần lễ Khởi nghiệp TLU 2025",
    excerpt: "Hơn 60 dự án sinh viên tranh tài tại sự kiện thường niên lớn nhất nhà trường.",
    content: `<p>Tuần lễ Khởi nghiệp TLU 2025 chính thức khai mạc với hơn <strong>60 dự án</strong> đến từ sinh viên các khoa tham gia tranh tài.</p>
<p>Sự kiện thường niên này là sân chơi để sinh viên hiện thực hóa ý tưởng kinh doanh, kết nối với mentor từ doanh nghiệp và nhà đầu tư.</p>`,
    category: cat("su-kien"),
    tags: tags("clb", "kinh-te"),
    author,
    publishedAt: "2025-03-10T07:00:00Z",
    readingTime: 2,
    viewCount: 4800,
    relatedArticleIds: [6, 7],
  },
  {
    id: 11,
    slug: "hop-tac-chien-luoc-dai-hoc-tokyo",
    title: "TLU ký kết hợp tác chiến lược với Đại học Tokyo",
    excerpt: "Mở rộng chương trình trao đổi sinh viên và nghiên cứu chung trong lĩnh vực AI.",
    content: `<p>Đại học Thăng Long và <strong>Đại học Tokyo</strong> chính thức ký kết thỏa thuận hợp tác chiến lược, mở rộng chương trình trao đổi sinh viên và nghiên cứu chung trong lĩnh vực <strong>Trí tuệ nhân tạo</strong>.</p>
<p>Thỏa thuận bao gồm trao đổi sinh viên, học kỳ ngoài nước, và dự án nghiên cứu AI liên trường — mang đến cơ hội tiếp cận công nghệ tiên tiến cho sinh viên TLU.</p>`,
    category: cat("hop-tac-quoc-te"),
    tags: tags("quoc-te", "ai"),
    author,
    publishedAt: "2025-03-28T10:00:00Z",
    readingTime: 3,
    viewCount: 6100,
    relatedArticleIds: [5, 9],
  },
  {
    id: 12,
    slug: "dong-thuy-tien-hoa-mi-ngan-nguoi-me",
    title: "Đồng Thủy Tiên — \"Họa mi ngàn người mê\" trưởng thành từ TLU",
    excerpt: "Từ chuyên ngành Tài chính đến sân khấu X-Factor và Vietnam Idol — câu chuyện phát triển toàn diện.",
    content: `<p><strong>Đồng Thủy Tiên</strong> — trưởng thành từ chuyên ngành Tài chính của Đại học Thăng Long — đã dùng giọng hát cao vút và ngoại hình sáng giá để ghi dấu ấn tại các đấu trường lớn như <strong>X-Factor</strong> và <strong>Vietnam Idol</strong>.</p>
<p>Câu chuyện của Thủy Tiên là minh chứng cho triết lý giáo dục TLU: phát triển toàn diện bản sắc cá nhân, tạo không gian để sinh viên tỏa sáng theo cách riêng.</p>`,
    category: cat("sinh-vien"),
    tags: tags("cuu-sinh-vien", "truyen-thong"),
    author,
    publishedAt: "2025-01-15T14:00:00Z",
    readingTime: 3,
    viewCount: 8100,
    relatedArticleIds: [4, 3],
  },
];
