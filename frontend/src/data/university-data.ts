/**
 * university-data.ts
 * Structured content extracted from profilethanglong.md
 * Used across all public marketing pages (/, /about, /programs, /admissions, /tuition, /scholarships)
 */

// ─── Types ───────────────────────────────────────────────────────────

export interface Faculty {
  id: string;
  name: string;
  slug: string;
  icon: string; // lucide icon name
  description: string;
  majors: Major[];
  colorAccent: string; // tailwind color token
}

export interface Major {
  id: string;
  name: string;
  code?: string;
  benchmarks: BenchmarkEntry[];
  tuitionPerYear: number;
  duration: string;
}

export interface BenchmarkEntry {
  year: number;
  subjectGroup: string;
  score: number;
}

export interface TuitionTier {
  cohort: string;
  pricePerCredit: number;
  note?: string;
}

export interface TuitionGroup {
  groupName: string;
  representativeMajors: string[];
  annualFee: number;
}

export interface ScholarshipTier {
  level: string;
  gpaMin: number;
  amount: number;
  description: string;
}

export interface CorporateScholarship {
  name: string;
  sponsor: string;
  description: string;
}

export interface AlumniStory {
  id: string;
  name: string;
  achievement: string;
  description: string;
  category: "arts" | "academic";
}

export interface TimelineMilestone {
  year: number;
  title: string;
  description: string;
}

export interface AdmissionMethod {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface CertificateConversion {
  certificate: string;
  ielts: string;
  toeflIbt: string;
  tluScore: number;
}

// ─── Founder ─────────────────────────────────────────────────────────

export const founder = {
  name: "GS. Hoàng Xuân Sính",
  title: "Nữ giáo sư toán học đầu tiên của Việt Nam",
  role: "Người sáng lập Đại học Thăng Long",
  quote:
    "Hoài bão về một nền giáo dục tiên tiến, phát triển toàn diện cho thế hệ trẻ vẫn cháy bỏng khi bà bước sang tuổi 90.",
  bio: "GS. Hoàng Xuân Sính — nữ giáo sư toán học đầu tiên của Việt Nam — là người trực tiếp đặt nền móng thành lập Đại học Thăng Long năm 1988. Bà 'vừa làm hiệu trưởng, vừa làm lao công' trong những ngày đầu khó khăn, cống hiến trọn vẹn cả một đời cho sự nghiệp giáo dục.",
};

// ─── Core Values ─────────────────────────────────────────────────────

export const coreValues = {
  faculty: [
    "Yêu nghề",
    "Có năng lực",
    "Có ý chí",
    "Khát vọng",
    "Tư duy hiện đại",
  ],
  students: [
    "Trung thực",
    "Nhân ái",
    "Trách nhiệm",
    "Hợp tác quốc tế",
    "Học tập suốt đời",
  ],
};

export const missionVision = {
  mission:
    "Cung cấp môi trường giáo dục đại học chất lượng cao, phát triển con người toàn diện, đóng góp tích cực cho xã hội.",
  vision:
    "Xây dựng cơ sở hạ tầng để liên kết nền tảng thế giới phẳng, giáo dục để nhiều người sáng tạo, làm việc và tận dụng nền tảng, và cuối cùng khả năng quản lý để tranh thủ tối đa.",
  visionShort:
    "Trở thành đại học định hướng ứng dụng hàng đầu khu vực Đông Nam Á vào năm 2035.",
};

// ─── Timeline ────────────────────────────────────────────────────────

export const timeline: TimelineMilestone[] = [
  { year: 1988, title: "Thành lập trường", description: "Đại học Thăng Long ra đời — trường đại học tư thục đầu tiên tại Việt Nam, do GS. Hoàng Xuân Sính sáng lập." },
  { year: 1993, title: "Mở rộng đào tạo", description: "Bổ sung các ngành Kinh tế, Ngoại ngữ bên cạnh khối Toán - Tin học ban đầu." },
  { year: 2005, title: "Hợp tác quốc tế", description: "Liên kết đào tạo Thạc sĩ với Đại học Nice - Sophia Antipolis (Pháp), mở ra hướng hội nhập toàn cầu." },
  { year: 2010, title: "Kiểm định chất lượng", description: "Đạt tiêu chuẩn kiểm định AUN-QA cho nhiều chương trình đào tạo." },
  { year: 2018, title: "30 năm xây dựng", description: "Kỷ niệm 30 năm thành lập với hơn 50,000 cựu sinh viên trên toàn quốc." },
  { year: 2023, title: "Chuyên ngành AI", description: "Ra mắt chuyên ngành Trí tuệ nhân tạo, đáp ứng nhu cầu nhân lực số." },
  { year: 2025, title: "Kỷ nguyên mới", description: "12,400+ sinh viên, 32 chương trình đào tạo, 60+ đối tác quốc tế, 480+ giảng viên cơ hữu." },
];

// ─── 7 Faculties & Majors ────────────────────────────────────────────

export const faculties: Faculty[] = [
  {
    id: "f1",
    name: "Khoa Công nghệ Thông tin & Khoa Toán - Tin học",
    slug: "cong-nghe",
    icon: "Monitor",
    colorAccent: "info",
    description: "Đào tạo chuyên sâu về lập trình, hệ thống thông tin, AI và khoa học dữ liệu — bám sát xu hướng công nghệ toàn cầu.",
    majors: [
      { id: "m1", name: "Khoa học máy tính", benchmarks: [{ year: 2025, subjectGroup: "A00, X01, X25", score: 20.2 }], tuitionPerYear: 33_000_000, duration: "4 năm" },
      { id: "m2", name: "Hệ thống thông tin", benchmarks: [{ year: 2023, subjectGroup: "A00", score: 23.29 }, { year: 2022, subjectGroup: "A00", score: 24.40 }], tuitionPerYear: 33_000_000, duration: "4 năm" },
      { id: "m3", name: "Mạng máy tính và truyền thông dữ liệu", benchmarks: [], tuitionPerYear: 36_000_000, duration: "4 năm" },
      { id: "m4", name: "Công nghệ thông tin", benchmarks: [{ year: 2025, subjectGroup: "A01, D01, D07", score: 16.0 }], tuitionPerYear: 36_000_000, duration: "4 năm" },
      { id: "m5", name: "Trí tuệ nhân tạo (AI)", benchmarks: [{ year: 2025, subjectGroup: "A00, X06, X26", score: 17.0 }, { year: 2025, subjectGroup: "A01, D01, D07", score: 16.0 }], tuitionPerYear: 36_000_000, duration: "4 năm" },
    ],
  },
  {
    id: "f2",
    name: "Khoa Kinh tế - Quản lý",
    slug: "kinh-te",
    icon: "TrendingUp",
    colorAccent: "success",
    description: "Đào tạo đa ngành từ Kế toán, Tài chính đến Marketing và Thương mại điện tử — xây dựng năng lực quản trị toàn diện.",
    majors: [
      { id: "m6", name: "Kế toán", benchmarks: [], tuitionPerYear: 33_000_000, duration: "4 năm" },
      { id: "m7", name: "Tài chính ngân hàng", benchmarks: [], tuitionPerYear: 33_000_000, duration: "4 năm" },
      { id: "m8", name: "Quản trị kinh doanh", benchmarks: [{ year: 2025, subjectGroup: "A00, X01, X25", score: 20.2 }, { year: 2025, subjectGroup: "A01, D01, D07", score: 19.2 }], tuitionPerYear: 33_000_000, duration: "4 năm" },
      { id: "m9", name: "Marketing", benchmarks: [], tuitionPerYear: 33_000_000, duration: "4 năm" },
      { id: "m10", name: "Logistics và Quản lý chuỗi cung ứng", benchmarks: [{ year: 2025, subjectGroup: "A00, X01, X25", score: 21.4 }], tuitionPerYear: 36_000_000, duration: "4 năm" },
      { id: "m11", name: "Luật kinh tế", benchmarks: [], tuitionPerYear: 36_000_000, duration: "4 năm" },
      { id: "m12", name: "Kinh tế quốc tế", benchmarks: [{ year: 2025, subjectGroup: "A00, X01, X25", score: 20.6 }, { year: 2025, subjectGroup: "A01, D01, D07", score: 19.6 }], tuitionPerYear: 33_000_000, duration: "4 năm" },
      { id: "m13", name: "Thương mại điện tử", benchmarks: [], tuitionPerYear: 36_000_000, duration: "4 năm" },
    ],
  },
  {
    id: "f3",
    name: "Khoa Ngoại ngữ",
    slug: "ngoai-ngu",
    icon: "Globe",
    colorAccent: "primary",
    description: "Ngôn ngữ Anh, Trung, Nhật, Hàn — đáp ứng nhu cầu nhân lực trong làn sóng FDI và hội nhập quốc tế.",
    majors: [
      { id: "m14", name: "Ngôn ngữ Anh", benchmarks: [], tuitionPerYear: 36_000_000, duration: "4 năm" },
      { id: "m15", name: "Ngôn ngữ Trung Quốc", benchmarks: [], tuitionPerYear: 36_000_000, duration: "4 năm" },
      { id: "m16", name: "Ngôn ngữ Nhật", benchmarks: [], tuitionPerYear: 37_500_000, duration: "4 năm" },
      { id: "m17", name: "Ngôn ngữ Hàn Quốc", benchmarks: [], tuitionPerYear: 37_500_000, duration: "4 năm" },
    ],
  },
  {
    id: "f4",
    name: "Khoa Du lịch",
    slug: "du-lich",
    icon: "Plane",
    colorAccent: "warning",
    description: "Quản trị du lịch, lữ hành và khách sạn — kỹ năng thực hành cao, gắn liền chuẩn dịch vụ quốc tế.",
    majors: [
      { id: "m18", name: "Quản trị Du lịch và Lữ hành", benchmarks: [], tuitionPerYear: 36_000_000, duration: "4 năm" },
      { id: "m19", name: "Quản trị Khách sạn", benchmarks: [], tuitionPerYear: 36_000_000, duration: "4 năm" },
    ],
  },
  {
    id: "f5",
    name: "Khoa Khoa học Sức khỏe",
    slug: "suc-khoe",
    icon: "HeartPulse",
    colorAccent: "destructive",
    description: "Ngành Điều dưỡng với phòng thực hành hiện đại, đào tạo nhân lực y tế chất lượng cao.",
    majors: [
      { id: "m20", name: "Điều dưỡng", benchmarks: [], tuitionPerYear: 27_000_000, duration: "4 năm" },
    ],
  },
  {
    id: "f6",
    name: "Khoa Truyền thông Đa phương tiện & Khoa Âm nhạc ứng dụng",
    slug: "truyen-thong-nghe-thuat",
    icon: "Palette",
    colorAccent: "chart-5",
    description: "Truyền thông, Thiết kế đồ họa, Thanh nhạc — khối ngành sáng tạo dẫn đầu điểm chuẩn toàn trường.",
    majors: [
      { id: "m21", name: "Truyền thông đa phương tiện", benchmarks: [{ year: 2024, subjectGroup: "Chung", score: 26.52 }, { year: 2025, subjectGroup: "D01", score: 23.75 }], tuitionPerYear: 45_000_000, duration: "4 năm" },
      { id: "m22", name: "Thiết kế đồ hoạ", benchmarks: [], tuitionPerYear: 45_000_000, duration: "4 năm" },
      { id: "m23", name: "Thanh nhạc", benchmarks: [], tuitionPerYear: 36_000_000, duration: "4 năm" },
    ],
  },
  {
    id: "f7",
    name: "Khoa Khoa học Xã hội và Nhân văn",
    slug: "xa-hoi-nhan-van",
    icon: "BookOpen",
    colorAccent: "accent",
    description: "Chuyên ngành Việt Nam học — nghiên cứu văn hóa, báo chí, hướng dẫn viên du lịch chuyên sâu.",
    majors: [
      { id: "m24", name: "Việt Nam học", benchmarks: [{ year: 2025, subjectGroup: "C03, C04, D14, D15", score: 22.88 }, { year: 2025, subjectGroup: "D01", score: 21.88 }], tuitionPerYear: 33_000_000, duration: "4 năm" },
    ],
  },
];

// ─── Tuition ─────────────────────────────────────────────────────────

export const tuitionTiers: TuitionTier[] = [
  { cohort: "Khóa 34 trở về trước", pricePerCredit: 460_000 },
  { cohort: "Khóa 35", pricePerCredit: 480_000 },
  { cohort: "Khóa 36", pricePerCredit: 575_000 },
  { cohort: "Khóa 37 (Tuyển sinh mới)", pricePerCredit: 600_000 },
];

export const tuitionGroups: TuitionGroup[] = [
  { groupName: "Nghệ thuật & Đa phương tiện", representativeMajors: ["Thiết kế đồ hoạ", "Truyền thông đa phương tiện"], annualFee: 45_000_000 },
  { groupName: "Ngoại ngữ Châu Á", representativeMajors: ["Ngôn ngữ Nhật", "Ngôn ngữ Hàn Quốc"], annualFee: 37_500_000 },
  { groupName: "Khối 36 triệu", representativeMajors: ["NN Anh", "NN Trung", "Thanh nhạc", "Luật kinh tế", "CNTT", "AI", "Logistics", "Quản trị Du lịch & Khách sạn", "Thương mại điện tử"], annualFee: 36_000_000 },
  { groupName: "Khối 33 triệu", representativeMajors: ["Kinh tế quốc tế", "QTKD", "Marketing", "Tài chính NH", "Kế toán", "Khoa học máy tính", "Việt Nam học"], annualFee: 33_000_000 },
  { groupName: "Chăm sóc Sức khỏe", representativeMajors: ["Điều dưỡng"], annualFee: 27_000_000 },
];

export const tuitionProjection = {
  year2526: { increasePercent: 5, note: "Tăng khoảng 1–1.5 triệu đồng/năm" },
  year2627: { increasePercent: 5, maxPercent: 7, note: "Tăng 5–7%" },
  year2728onward: { maxPercent: 7, note: "Cam kết không vượt quá 7%/năm" },
};

export const retakeFees = {
  retake1: "100% lệ phí thi lần đầu",
  retake2: "200% lệ phí thi lần đầu",
  thesisRedo: "50% mức học phí môn khóa luận theo năm hiện hành",
};

export const tuitionComparison = [
  { name: "Đại học Thăng Long", range: "27–45 triệu/năm" },
  { name: "Đại học FPT", range: "14–35.8 triệu/năm" },
  { name: "Đại học Phenikaa", range: "36–72 triệu/năm" },
  { name: "Đại học Đại Nam", range: "22–96 triệu/năm" },
  { name: "Đại học RMIT", range: "351–365 triệu/năm" },
];

// ─── Scholarships ────────────────────────────────────────────────────

export const academicScholarships: ScholarshipTier[] = [
  { level: "Xuất sắc", gpaMin: 9.0, amount: 5_000_000, description: "Sinh viên đạt GPA (thang 10) từ 9.0 trở lên — 5.000.000 VNĐ/suất." },
  { level: "Giỏi", gpaMin: 8.0, amount: 3_000_000, description: "Sinh viên đạt GPA (thang 10) từ 8.0 trở lên — 3.000.000 VNĐ/suất." },
];

export const corporateScholarships: CorporateScholarship[] = [
  { name: "Học bổng LOTTE", sponsor: "Tập đoàn LOTTE", description: "Học bổng dành riêng cho sinh viên Đại học Thăng Long — minh chứng cho sự ghi nhận từ tập đoàn đa quốc gia hàng đầu." },
];

// ─── Admissions ──────────────────────────────────────────────────────

export const admissionMethods: AdmissionMethod[] = [
  { id: "a1", name: "Điểm thi tốt nghiệp THPT", description: "Xét tuyển theo kết quả điểm thi tốt nghiệp THPT.", icon: "FileCheck" },
  { id: "a2", name: "Xét học bạ THPT", description: "Xét tuyển dựa trên học bạ THPT (phương thức xét tuyển sớm).", icon: "BookMarked" },
  { id: "a3", name: "Đánh giá năng lực (HSA)", description: "Xét tuyển qua chứng chỉ kỳ thi Đánh giá năng lực do ĐHQGHN tổ chức.", icon: "GraduationCap" },
  { id: "a4", name: "Đánh giá tư duy (TSA)", description: "Xét tuyển qua chứng chỉ kỳ thi Đánh giá tư duy do ĐHBKHN tổ chức.", icon: "Brain" },
  { id: "a5", name: "Chứng chỉ quốc tế", description: "Xét tuyển thông qua chứng chỉ IELTS, TOEFL, SAT, ACT.", icon: "Award" },
  { id: "a6", name: "Xét tuyển thẳng", description: "Xét tuyển thẳng theo quy chế Bộ GD&ĐT.", icon: "Zap" },
];

export const certificateConversions: CertificateConversion[] = [
  { certificate: "Tiếng Anh", ielts: "5.0", toeflIbt: "45–54", tluScore: 8.0 },
  { certificate: "Tiếng Anh", ielts: "5.5", toeflIbt: "55–64", tluScore: 8.5 },
  { certificate: "Tiếng Anh", ielts: "6.0", toeflIbt: "65–74", tluScore: 9.0 },
  { certificate: "Tiếng Anh", ielts: "6.5", toeflIbt: "75–84", tluScore: 9.5 },
  { certificate: "Tiếng Anh", ielts: "≥ 7.0", toeflIbt: "≥ 85", tluScore: 10.0 },
];

export const hsaTsaFormula =
  "Điểm xét tuyển = Kết quả thi HSA/TSA + Điểm cộng (nếu có) + Điểm ưu tiên (nếu có). Tất cả quy đổi theo thang điểm kết quả thi.";

// ─── Alumni ──────────────────────────────────────────────────────────

export const alumniStories: AlumniStory[] = [
  {
    id: "al1",
    name: "Phạm Anh Duy (Duy Pad)",
    achievement: "Ca sĩ — Giọng hát Việt 2015, học trò HLV Thu Phương",
    description: "Nổi lên từ chương trình Giọng hát Việt 2015, Phạm Anh Duy là một trong những gương mặt nghệ thuật tiêu biểu trưởng thành từ Đại học Thăng Long.",
    category: "arts",
  },
  {
    id: "al2",
    name: "Đồng Thủy Tiên",
    achievement: "Ca sĩ — \"Họa mi ngàn người mê\", X-Factor, Vietnam Idol",
    description: "Trưởng thành từ chuyên ngành Tài chính, Đồng Thủy Tiên đã dùng giọng hát cao vút và ngoại hình sáng giá ghi dấu ấn tại X-Factor và Vietnam Idol — minh chứng cho sự phát triển toàn diện tại TLU.",
    category: "arts",
  },
  {
    id: "al3",
    name: "Nguyễn Gia Huy",
    achievement: "Thạc sĩ Kinh tế — Temple University, Nhật Bản",
    description: "Trưởng thành từ Đại học Thăng Long, Nguyễn Gia Huy đã vươn lên xuất sắc để theo học chương trình Thạc sĩ Kinh tế tại Temple University (Nhật Bản) — cơ sở quốc tế lâu đời và lớn nhất tại Nhật. Câu chuyện về ý chí nỗ lực và bản lĩnh vươn ra quốc tế.",
    category: "academic",
  },
];

// ─── Student Life / Clubs ────────────────────────────────────────────

export const studentClubs = [
  {
    id: "c1",
    name: "iM Club TLU",
    fullName: "Câu lạc bộ Marketing",
    highlight: "Thang Long Business & Marketing Challenge",
    description: "Đơn vị kiến tạo sân chơi trí tuệ \"Thang Long Business & Marketing Challenge\" — mùa 2 nâng cấp thành đấu trường \"Ý tưởng kinh doanh số\", mang đến cơ hội cọ xát với kiến thức số hóa mới nhất.",
  },
  {
    id: "c2",
    name: "LSC",
    fullName: "Câu lạc bộ Logistics và Chuỗi cung ứng",
    highlight: "Kết nối CLB Logistics khu vực phía Bắc",
    description: "Sự kiện gặp mặt các CLB Logistics khu vực phía Bắc cùng ĐH Kinh tế Quốc dân, ĐH Công nghệ GTVT, Học viện Tài chính, ĐH Phenikaa, ĐH Đại Nam — minh chứng cho mạng lưới quan hệ rộng lớn.",
  },
];

// ─── International Programs ──────────────────────────────────────────

export const internationalPrograms = [
  {
    name: "Thạc sĩ Kinh doanh & Quản trị Quốc tế",
    partner: "Đại học Nice - Sophia Antipolis (Pháp)",
    partnerRanking: "Top 3 ĐH công lập Pháp, Top 500 thế giới",
    duration: "2 năm",
    tuitionTotal: "4,000 EUR (4 kỳ × 1,000 EUR)",
    applicationFee: "1.000.000 VNĐ",
    languageRequirement: "Tiếng Anh B1 trở lên (CEFR)",
    perk: "Luyện thi ngoại ngữ miễn phí trước xét tuyển",
    usps: [
      "Xếp hạng #2 toàn nước Pháp về thạc sĩ kinh doanh",
      "Liên kết Hội đồng Ngoại thương Chính phủ Pháp",
      "Vận hành song song tại Mỹ (San Francisco), Nga, Đức",
      "Chấp nhận cử nhân từ mọi chuyên ngành",
    ],
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────

/** Get all majors flattened from all faculties */
export function getAllMajors(): (Major & { facultyName: string })[] {
  return faculties.flatMap((f) =>
    f.majors.map((m) => ({ ...m, facultyName: f.name }))
  );
}

/** Get benchmark scores for a specific year */
export function getBenchmarksByYear(year: number) {
  return getAllMajors()
    .map((m) => ({
      ...m,
      benchmarks: m.benchmarks.filter((b) => b.year === year),
    }))
    .filter((m) => m.benchmarks.length > 0);
}

/** Format VND currency */
export function formatVND(amount: number): string {
  return new Intl.NumberFormat("vi-VN").format(amount) + " đ";
}
