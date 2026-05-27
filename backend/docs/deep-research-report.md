# Báo cáo thiết kế siêu prompt cho chatbot hỗ trợ sinh viên Trường Đại học Thăng Long

## Tóm lược điều hành

Trường Đại học Thăng Long là một cơ sở giáo dục ngoài công lập, đa ngành, có định hướng ứng dụng; trang giới thiệu chính thức nhấn mạnh mô hình đào tạo gắn với môi trường làm việc thực tế, còn Wikipedia cho biết trường được thành lập ngày 15/12/1988 và là một trong những dấu mốc sớm nhất của giáo dục đại học tư thục tại Việt Nam. Về mặt vận hành chatbot, điều này có nghĩa là bot không chỉ phải trả lời FAQ tuyển sinh, mà còn phải hỗ trợ rất nhiều tình huống học vụ, tài chính, thư viện, e-learning, CNTT, khảo thí, công tác sinh viên và đời sống sinh viên theo chu kỳ học tập thực tế. citeturn6view1turn33view0turn39view0

Nền tri thức phù hợp nhất cho chatbot không phải là một “bài giới thiệu chung” về trường, mà là một hệ nguồn có thứ bậc rõ ràng. Các thông báo và quyết định tuyển sinh năm 2025–2026, các trang phòng ban chính thức, các trang ngành đào tạo, Sổ tay sinh viên, rồi mới đến Wikipedia cho phần lịch sử là cấu hình RAG hợp lý nhất. Lý do là website chính thức đang chứa cả thông tin rất mới như “Thông tin tuyển sinh 2026” và cả tài liệu ổn định nhưng cũ hơn như Sổ tay sinh viên 2023–2024; nếu bot không ưu tiên theo loại tài liệu và thời điểm, nó rất dễ trả lời đúng về mặt câu chữ nhưng sai về mặt thời điểm. citeturn11view0turn12view0turn13search1turn10view1turn39view0

Các nhu cầu trọng tâm của sinh viên Thăng Long nổi lên khá rõ trên chính website: đăng ký học, e-learning, thi trực tuyến, thư viện điện tử, kế hoạch đào tạo, sổ tay sinh viên, học phí, học bổng, cảnh báo học tập, chuyển ngành, học cùng lúc hai chương trình, chuẩn đầu ra, dịch vụ thư viện, hỗ trợ Office 365 và các đầu mối một cửa cho sinh viên. Vì vậy, “siêu prompt” tốt nhất cho chatbot của bạn phải được thiết kế theo logic trợ lý học vụ–dịch vụ sinh viên trước, rồi mới mở rộng sang thông tin truyền thông và đời sống sinh viên. citeturn7view0turn16view1turn16view3turn19view0turn20view5turn26view0turn26view1turn6view6turn23view2

Kết luận thực dụng nhất là: chatbot nên có một prompt hệ thống duy nhất, nhưng bên trong prompt phải ép mô hình làm bốn việc rất chặt chẽ: ưu tiên nguồn chính thức mới nhất; hỏi làm rõ khi thiếu năm học/học kỳ/ngành; thừa nhận “không xác định” khi dữ liệu không có; và luôn kết thúc bằng bước điều hướng đúng đầu mối nếu câu hỏi vượt khỏi dữ liệu hiện có. Đây là cách duy nhất để chatbot vừa “thân thiện như trợ lý sinh viên”, vừa “chắc như chatbot hành chính–học vụ”.

| Hạng mục | Kết luận chính |
|---|---|
| Chân dung trường | TLU là trường đa ngành, định hướng ứng dụng; Wikipedia mô tả là đại học tư thục đa ngành tại Hà Nội, thành lập năm 1988. citeturn6view1turn39view0 |
| Quy mô tri thức vận hành bot | Phải bao phủ tuyển sinh, học vụ, học phí, học bổng, thư viện, e-learning, CNTT, khảo thí, CTSV, trao đổi quốc tế, đời sống CLB. citeturn6view4turn6view5turn6view6turn26view0turn26view1turn28view0turn31view0turn31view1 |
| Nguồn ưu tiên | Quyết định/thông báo mới hơn → trang phòng ban/trang ngành → Sổ tay sinh viên → Wikipedia cho bối cảnh lịch sử. citeturn11view0turn12view0turn13search1turn39view0 |
| Chiến lược trả lời | Trả lời ngắn, đúng nguồn, hỏi làm rõ nếu thiếu biến quan trọng, và nói “không xác định” khi nguồn không nêu rõ. |

## Hồ sơ cô đọng của Trường Đại học Thăng Long

### Bản sắc tổ chức và bối cảnh phù hợp với chatbot

Trang giới thiệu chính thức mô tả Đại học Thăng Long là một trung tâm giáo dục đa ngành, đa nghề, định hướng ứng dụng; Wikipedia bổ sung rằng đây là trường đại học tư thục đa ngành ở Hà Nội, được thành lập ngày 15/12/1988. Cả hai nguồn này rất quan trọng cho prompt hệ thống, vì chúng cho thấy chatbot không nên đóng vai “trợ lý marketing”, mà phải đóng vai “trợ lý học tập–dịch vụ–điều phối thông tin nội bộ của một trường đa ngành”. citeturn6view1turn39view0

Về lịch sử, website chính thức nêu các mốc như thành lập năm 1988, đổi tên thành Trường Đại học Dân lập Thăng Long năm 1994, chuyển đổi thành Trường Đại học Thăng Long năm 2007 và hoàn thành cơ sở hiện tại năm 2008; Wikipedia cũng ghi nhận việc chuyển đổi từ dân lập sang tư thục vào giai đoạn 2005–2007 và việc chuyển đến cơ sở mới trên đường Nghiêm Xuân Yêm từ năm 2008. Những yếu tố này hữu ích cho chatbot khi trả lời các câu hỏi nền về trường, nhưng không nên được dùng để trả lời các câu hỏi vận hành hiện thời nếu không có nguồn chính thức mới hơn. citeturn6view1turn39view0

Về địa chỉ và đầu mối liên hệ chung, trang “Liên hệ” của trường nêu hotline 02499991988 và 02438587346, email info@thanglong.edu.vn, cùng địa chỉ trên đường Nghiêm Xuân Yêm, Hà Nội; phần footer và một số trang phòng ban cũng lặp lại đường Nghiêm Xuân Yêm nhưng hiển thị đơn vị hành chính ở các cách khác nhau. Đây là một chi tiết kỹ thuật rất quan trọng cho chatbot: tầng retrieval nên chuẩn hóa alias địa chỉ và không so khớp cứng tuyệt đối theo chuỗi địa danh. citeturn5view2turn5view3turn28view0

### Khoa, ngành và cấu trúc học thuật mà bot phải hiểu đúng

Trang chương trình đào tạo trên website và trang “Cơ cấu tổ chức” cho thấy các khối đào tạo chính hiện diện trên site gồm Khoa Công nghệ thông tin, Khoa Kinh tế – Quản lý, Khoa Khoa học sức khỏe, Khoa Ngoại ngữ, Khoa Khoa học xã hội và nhân văn, Khoa Du lịch, Khoa Truyền thông Đa phương tiện và Khoa Âm nhạc ứng dụng. Đồng thời, trang chủ và khu tuyển sinh năm 2026 cho biết trường dự kiến tuyển sinh đại học chính quy ở 10 lĩnh vực với 25 ngành đào tạo. Nói ngắn gọn: “10 lĩnh vực” không đồng nghĩa với “8 khoa”; bot phải phân biệt rõ hai lớp khái niệm này. citeturn33view0turn7view0turn13search6

Một điểm đáng chú ý là cùng một khối đào tạo có thể xuất hiện với tên hiển thị khác nhau giữa menu và breadcrumb. Chẳng hạn, menu chương trình đào tạo hiển thị “Khoa Công nghệ thông tin”, nhưng trang ngành CNTT và AI lại đi theo breadcrumb “Khoa Toán - Tin học”. Vì vậy, prompt và tầng truy xuất nên có từ điển alias như: `Khoa Công nghệ thông tin = Khoa Toán - Tin học`, `CTSV = Phòng Công tác Chính trị Sinh viên`, `Tài vụ = Phòng Tài chính - Kế toán`. Đây là một yêu cầu kỹ thuật quan trọng nếu bạn muốn chatbot hoạt động tốt với cách hỏi đời thường của sinh viên. citeturn33view0turn35view0turn36view0

Các trang ngành cho thấy học phí, tổ hợp xét tuyển và điểm trúng tuyển các năm gần đây khác nhau khá mạnh giữa từng ngành. Ví dụ, ngành Kinh tế quốc tế có học phí 37,8 triệu đồng/năm; Kế toán 38,9 triệu; Marketing 39,6 triệu; Công nghệ thông tin 40,8 triệu; Trí tuệ nhân tạo 40,2 triệu; Ngôn ngữ Anh 40,9 triệu; Quản trị khách sạn 40,9 triệu; Quản trị dịch vụ du lịch – lữ hành 43,8 triệu. Vì vậy, chatbot tuyệt đối không nên trả lời học phí theo “mức chung của trường” nếu người dùng chưa nêu rõ ngành. citeturn35view2turn35view3turn35view1turn35view0turn36view0turn38view0turn38view1turn38view3

### Dịch vụ sinh viên và đầu mối chính thức mà bot nên ưu tiên chuyển tuyến

Cấu trúc phòng ban chính thức cho thấy TLU đã có gần như đầy đủ các đầu mối mà một chatbot sinh viên cần điều phối: Phòng Đào tạo cho vấn đề đào tạo và tốt nghiệp; Phòng Công tác Chính trị Sinh viên cho thủ tục sinh viên và hỗ trợ một cửa; Phòng Tài chính – Kế toán cho học phí; Thư viện cho lưu hành tài liệu và không gian học; Trung tâm E-learning cho hệ học trực tuyến và Office 365; Phòng CNTT cho mạng, tài khoản, phòng máy; Trung tâm Đảm bảo chất lượng và Khảo thí cho thi, phúc khảo và chuẩn đầu ra tiếng Anh; Phòng Hợp tác Quốc tế cho các hoạt động trao đổi; Văn phòng trường cho lễ tân, y tế, bảo vệ. Đây chính là “xương sống routing” của chatbot. citeturn5view4turn6view4turn28view0turn6view6turn26view0turn26view1turn6view5turn31view0turn6view3

| Đơn vị | Vai trò sinh viên nên hỏi | Liên hệ chính thức |
|---|---|---|
| Phòng Đào tạo | Kế hoạch đào tạo, tổ chức giảng dạy, học tập, tốt nghiệp, tuyển sinh. citeturn32search5turn5view4 | 02499991988 nhánh 2; p.daotao@thanglong.edu.vn; Tầng 1 Nhà A. citeturn5view4 |
| Phòng Công tác Chính trị Sinh viên | Đầu mối tiếp nhận và giải quyết thủ tục hành chính sinh viên, khen thưởng, kỷ luật, tư vấn hỗ trợ sinh viên. citeturn6view4 | 024 9999 1988 nhánh 3; p.ctsv@thanglong.edu.vn; Tầng 1 Nhà A. citeturn5view5 |
| Phòng Tài chính - Kế toán | Thu chi, học phí, quy định tài chính liên quan người học. citeturn28view0 | 024 9999 1988 nhánh 4; p.taivu@thanglong.edu.vn; Tầng 1 Nhà A. citeturn28view0 |
| Phòng Thông tin tư liệu - Thư viện | Mượn/gia hạn tài liệu, hỗ trợ tra cứu, tài liệu học tập, phòng học nhóm/cá nhân. citeturn6view6 | 02435592376; thuvien@thanglong.edu.vn; Tầng 1 tòa nhà Thư viện. citeturn6view6 |
| Trung tâm E-learning | Hệ E-learning, hỗ trợ học trực tuyến, Office 365, các môn đại cương trên hệ thống. citeturn26view0 | tt.elearning@thanglong.edu.vn; hỗ trợ môn đại cương qua elearning.helponline@thanglong.edu.vn; Tầng 2 Nhà A. citeturn26view0 |
| Phòng Công nghệ thông tin | Mạng, thiết bị giảng dạy, tài khoản mail, Office 365, phòng máy, hệ thống thi trắc nghiệm. citeturn26view1 | 024 9999 1988 nhánh 10; p.cntt@thanglong.edu.vn; A701 Nhà A. citeturn26view1 |
| Trung tâm Đảm bảo chất lượng và Khảo thí | Thi quá trình, kết thúc học phần, phúc khảo, chuẩn đầu ra tiếng Anh. citeturn6view5 | 024 9999 1988 nhánh 122; tt.dbcl@thanglong.edu.vn; A302 Nhà A. citeturn6view5 |
| Phòng Hợp tác Quốc tế | Hoạt động hợp tác, tuyển sinh sinh viên đi trao đổi chương trình liên kết quốc tế. citeturn31view0 | 024 9999 1988 nhánh 8; sic.tlu@thanglong.edu.vn; Tầng 1 Nhà A. citeturn31view0 |
| Văn phòng trường | Lễ tân, phòng trực giáo viên, trạm y tế, bảo vệ, điều phối hành chính chung. citeturn6view3turn32search1 | Nhánh 101 lễ tân; 115 trạm y tế; 113 bảo vệ; p.hanhchinh@thanglong.edu.vn; Tầng 1 Nhà A. citeturn6view3 |

### Nhu cầu sinh viên nổi bật mà chatbot phải phục vụ tốt

Nếu nhìn theo “hành trình sinh viên”, có bốn cụm nhu cầu rõ ràng. Người học mới quan tâm tuyển sinh, ngành, học phí, tổ hợp môn, thủ tục nhập học. Sinh viên năm đầu quan tâm thời khóa biểu, đăng ký tín chỉ, học phí, cố vấn học tập, thông báo chính thức và tuần sinh hoạt công dân. Sinh viên đang học quan tâm thi lại, học cải thiện, cảnh báo học tập, chuyển ngành, học hai ngành, thư viện, e-learning, Office 365 và các dịch vụ phòng ban. Sinh viên cuối khóa quan tâm chuẩn đầu ra, điều kiện tốt nghiệp, xếp loại tốt nghiệp, thực tập, việc làm và khen thưởng. Cấu trúc này xuất hiện rất rõ trong Sổ tay sinh viên, các trang phòng ban, trang tuyển sinh và các bài về Job Fair, tham vấn tâm lý, câu lạc bộ. citeturn16view1turn16view3turn20view5turn23view2turn31view2turn31view3turn31view1

## Bản đồ nhu cầu sinh viên và ý định ưu tiên

Danh sách dưới đây là **xếp hạng suy luận**, không phải log truy cập thật. Nó được xây từ ba lớp bằng chứng: hệ menu nhanh và tuyển sinh trên website, Sổ tay sinh viên, và chức năng/nhiệm vụ các phòng ban. Vì thế, đây là một bảng rất phù hợp để bạn dùng làm taxonomy intent cho chatbot. citeturn7view0turn16view1turn16view3turn6view4turn26view0turn26view1

| Hạng | Ý định chính | Ví dụ câu hỏi tiếng Việt | Mức ưu tiên | Căn cứ |
|---:|---|---|---|---|
| 1 | Đăng ký học và tín chỉ | “Bao giờ mở đăng ký học?”, “Mỗi kỳ được đăng ký mấy tín?” | Rất cao | Sổ tay sinh viên và quick links đăng ký học. citeturn16view3turn7view0 |
| 2 | Học phí và hạn nộp | “Đóng học phí tuần mấy?”, “Nộp muộn có sao không?” | Rất cao | Sổ tay sinh viên, Phòng Tài chính - Kế toán. citeturn16view3turn28view0 |
| 3 | Lịch thi, thi lại, học cải thiện | “Khi nào đăng ký thi lại?”, “Điểm 5 có học cải thiện được không?” | Rất cao | Sổ tay sinh viên, Khảo thí. citeturn16view3turn23view0turn6view5 |
| 4 | Thủ tục sinh viên và một cửa | “Em cần giấy tờ gì?”, “Em hỏi thủ tục ở đâu?” | Rất cao | CTSV là đầu mối một cửa. citeturn6view4 |
| 5 | Tuyển sinh đại học chính quy | “2026 trường tuyển sinh thế nào?”, “Thông tin tuyển sinh ở đâu?” | Rất cao | Khu tuyển sinh 2025–2026. citeturn10view1turn11view0turn12view0 |
| 6 | Học bổng và khen thưởng | “Có học bổng nào?”, “Điều kiện học bổng 15/12 là gì?” | Rất cao | Sổ tay sinh viên. citeturn19view0 |
| 7 | Cảnh báo học tập và buộc thôi học | “Bao nhiêu tín chỉ thì bị cảnh báo?”, “Khi nào bị buộc thôi học?” | Rất cao | Sổ tay sinh viên. citeturn20view0turn19view1 |
| 8 | Chuyển ngành, bảo lưu, học hai ngành | “Chuyển ngành cần điều kiện gì?”, “Học song ngành được không?” | Rất cao | Sổ tay sinh viên. citeturn20view5turn21view3 |
| 9 | Điều kiện tốt nghiệp và chuẩn đầu ra | “Ra trường cần GPA bao nhiêu?”, “Chuẩn ngoại ngữ thế nào?” | Rất cao | Sổ tay sinh viên. citeturn23view2turn24view3 |
| 10 | Liên hệ phòng ban | “Liên hệ Phòng Đào tạo thế nào?”, “Số CTSV là gì?” | Rất cao | Các trang phòng ban. citeturn5view4turn5view5turn28view0 |
| 11 | Học phí theo ngành | “Ngành Marketing học phí bao nhiêu?”, “CNTT bao nhiêu một năm?” | Rất cao | Các trang ngành. citeturn35view0turn35view1turn35view2turn35view3 |
| 12 | Tổ hợp và mã ngành | “Ngành AI mã gì?”, “Ngôn ngữ Anh xét tổ hợp nào?” | Cao | Các trang ngành. citeturn36view0turn38view0 |
| 13 | Thư viện | “Mượn sách ở đâu?”, “Có phòng học nhóm không?” | Cao | Trang thư viện. citeturn6view6 |
| 14 | E-learning và Office 365 | “Không vào được e-learning”, “Lỗi Teams/Office 365” | Cao | Trung tâm E-learning. citeturn26view0 |
| 15 | Sự cố CNTT, mạng, tài khoản | “Wi-Fi lỗi”, “Tài khoản mail trường trục trặc” | Cao | Phòng CNTT. citeturn26view1 |
| 16 | Kế hoạch đào tạo và mốc năm học | “Lịch năm học xem ở đâu?”, “Giờ học hàng ngày thế nào?” | Cao | Quick links và Sổ tay sinh viên. citeturn7view0turn25view1 |
| 17 | Cố vấn học tập | “Em nên hỏi cố vấn hay phòng nào?” | Cao | Sổ tay sinh viên. citeturn16view1 |
| 18 | Điểm quá trình, điều kiện dự thi | “Vắng bao nhiêu thì không được thi?”, “Điểm quá trình dưới 4 thì sao?” | Cao | Sổ tay sinh viên. citeturn22view0 |
| 19 | Trang tài liệu và đề cương | “Có mô tả chương trình đào tạo không?” | Cao | Trang thông báo học liệu ngành. citeturn33view1 |
| 20 | Thông tin nhập học | “Thủ tục nhập học K38 ở đâu?” | Cao | Mục tuyển sinh đại học chính quy. citeturn10view1 |
| 21 | Trao đổi quốc tế | “Có chương trình exchange không?”, “Liên hệ phòng HTQT thế nào?” | Trung bình cao | Phòng Hợp tác Quốc tế. citeturn31view0 |
| 22 | Câu lạc bộ và đời sống sinh viên | “Có CLB Marketing không?”, “Trường có nhiều CLB không?” | Trung bình cao | Đời sống Thăng Long, Clubday. citeturn31view1turn29search10 |
| 23 | Tư vấn tâm lý | “Trường có hỗ trợ tham vấn tâm lý không?” | Trung bình cao | Talkshow/tham vấn tâm lý. citeturn31view3 |
| 24 | Cơ hội nghề nghiệp, Job Fair, CV | “Trường có ngày hội việc làm không?” | Trung bình cao | Job Fair và UEC. citeturn31view2turn6view2 |
| 25 | Trạm y tế và bảo vệ | “Em cần liên hệ y tế/bảo vệ thì gọi đâu?” | Trung bình | Văn phòng trường. citeturn6view3 |
| 26 | Giờ học hàng ngày | “Giờ học 1 bắt đầu mấy giờ?” | Trung bình | Sổ tay sinh viên. citeturn25view1 |
| 27 | Kênh thông báo chính thức | “Theo dõi thông báo ở đâu cho chuẩn?” | Trung bình | Sổ tay sinh viên. citeturn16view1turn16view2 |
| 28 | Liên hệ góp ý/feedback | “Gửi góp ý của sinh viên đến đâu?” | Trung bình | Trang liên hệ và footer. citeturn5view2 |
| 29 | Thông tin nền về trường | “Trường thành lập khi nào?”, “TLU là viết tắt của gì?” | Trung bình | Trang giới thiệu và Wikipedia. citeturn6view1turn39view0 |
| 30 | Câu hỏi thiếu dữ liệu chính thức | “Trường có ký túc xá không?”, “Lịch chính xác tuần tới là gì?” | Trung bình | Đây là nhóm phải kích hoạt fallback “không xác định” và điều hướng sang đầu mối phù hợp. |

Một hệ quả trực tiếp của bảng này là bạn **không nên** huấn luyện chatbot theo các “chủ đề marketing” như giới thiệu trường, truyền cảm hứng, tin tức sự kiện làm lõi chính. Các trang đó hữu ích, nhưng phần lõi vận hành vẫn phải là học vụ–dịch vụ–routing. Cách thiết kế prompt và knowledge base bên dưới bám chặt nguyên tắc này.

## Siêu prompt cho chatbot Đại học Thăng Long

### Thứ bậc nguồn tin cho RAG

Trước khi đưa ra prompt, cần chốt một **truth hierarchy**. Cấu trúc dưới đây phù hợp nhất với website hiện tại của TLU.

| Mức ưu tiên | Loại nguồn | Khi dùng | Cách xử lý trong bot |
|---|---|---|---|
| Cao nhất | Quyết định, thông báo, trang tuyển sinh có ngày tháng gần hiện tại | Thông tin nhạy theo thời gian như tuyển sinh, thủ tục, học phí, lịch, mốc nộp hồ sơ | Nếu có nguồn mới hơn 12 tháng, ưu tiên tuyệt đối; nêu rõ năm/học kỳ trong câu trả lời. citeturn11view0turn12view0turn10view1 |
| Rất cao | Trang phòng ban và liên hệ | Đầu mối hỗ trợ, email, số nhánh, chức năng nhiệm vụ | Dùng để routing và handoff. citeturn5view4turn5view5turn28view0turn26view0turn26view1turn31view0 |
| Cao | Trang ngành đào tạo | Mã ngành, thời gian học, tổ hợp, học phí năm, điểm trúng tuyển gần đây | Bắt buộc hỏi rõ tên ngành trước khi trả lời học phí. citeturn35view0turn35view1turn35view2turn35view3turn36view0turn38view0turn38view1turn38view3 |
| Trung bình cao | Sổ tay sinh viên | Quy định ổn định: đăng ký học, thi lại, cảnh báo học tập, tốt nghiệp, học bổng | Nếu không có thông báo mới hơn, dùng làm căn cứ; nếu nội dung có thể đã đổi theo năm học, bot phải gắn cảnh báo ngày tài liệu. citeturn13search1turn16view3turn19view0turn20view5turn23view2 |
| Thấp | Wikipedia | Bối cảnh lịch sử, loại hình trường, thông tin nền | Không dùng để trả lời yêu cầu vận hành thời gian thực nếu website chính thức đã có nguồn. citeturn39view0 |

### Siêu prompt tiếng Việt

Đây là bản prompt duy nhất tôi khuyến nghị dùng làm **system prompt** cho chatbot hỗ trợ sinh viên Thăng Long. Prompt này được thiết kế để phản ánh đúng thực tế là sinh viên TLU thường phải đi qua các đầu mối như Phòng Đào tạo, CTSV, Tài chính – Kế toán, Thư viện, E-learning, CNTT, Khảo thí và Hợp tác Quốc tế; đồng thời phải bám vào các quy tắc học vụ trong Sổ tay sinh viên và các thông báo tuyển sinh/học vụ theo thời gian. citeturn5view4turn6view4turn28view0turn6view6turn26view0turn26view1turn6view5turn31view0turn13search1

```text
Bạn là “Trợ lý Sinh viên TLU” – chatbot hỗ trợ người học, phụ huynh và thí sinh của Trường Đại học Thăng Long.

MỤC TIÊU CỐT LÕI
- Trả lời chính xác, ngắn gọn, hữu ích, lịch sự.
- Ưu tiên hỗ trợ các nhu cầu thực dụng: tuyển sinh, học vụ, đăng ký học, học phí, học bổng, thư viện, e-learning, CNTT, khảo thí, thủ tục sinh viên, tốt nghiệp, liên hệ phòng ban.
- Không bịa thông tin. Khi nguồn không nêu rõ, phải nói rõ “không xác định” hoặc “mình chưa thấy nguồn chính thức xác nhận”.
- Khi câu hỏi cần đầu mối xử lý thủ công, phải hướng người dùng đến đúng đơn vị liên quan.

VAI TRÒ VÀ NHÂN CÁCH
- Bạn là trợ lý hành chính-học vụ thân thiện, chuyên nghiệp, không quá xuề xòa.
- Giọng điệu: rõ ràng, tôn trọng, hỗ trợ như một cán bộ trực tuyến biết lắng nghe.
- Ưu tiên câu ngắn, cấu trúc dễ quét, nhưng không cụt lủn.
- Không dùng ngôn ngữ phán đoán, không tô hồng, không quảng cáo quá mức.

PHẠM VI TRI THỨC
- Nguồn ưu tiên số 1: nội dung được truy xuất từ website chính thức của Trường Đại học Thăng Long.
- Nguồn ưu tiên số 2: Sổ tay sinh viên và các tài liệu chính thức đã được truy xuất.
- Nguồn ưu tiên số 3: Wikipedia, chỉ dùng cho bối cảnh lịch sử hoặc giới thiệu nền.
- Nếu nguồn chính thức và Wikipedia mâu thuẫn, luôn theo nguồn chính thức.
- Nếu có nhiều nguồn chính thức, ưu tiên:
  1) Quyết định/thông báo có ngày mới hơn
  2) Trang phòng ban/liên hệ chính thức
  3) Trang ngành đào tạo
  4) Sổ tay sinh viên/tài liệu cẩm nang cũ hơn
- Nếu tài liệu cũ hơn và câu hỏi nhạy theo thời gian (ví dụ lịch, hạn, thủ tục theo năm), phải nói rõ năm/tài liệu và nhắc người dùng kiểm tra thông báo mới nhất.

QUY TẮC RAG
- Chỉ dùng thông tin có trong retrieved_context nếu câu hỏi là factual.
- Không “điền chỗ trống” bằng suy đoán.
- Nếu người dùng hỏi học phí, điểm trúng tuyển, tổ hợp hoặc thông tin tuyển sinh mà chưa nêu ngành/năm, phải hỏi lại ngắn gọn.
- Nếu người dùng hỏi lịch, thủ tục, mốc thời gian mà chưa nêu năm học/học kỳ/khóa, phải hỏi lại ngắn gọn.
- Khi có nhiều kết quả retrieval, hãy tổng hợp theo mức độ tin cậy và độ mới; nêu nguồn có giá trị nhất.
- Nếu retrieved_context rỗng hoặc không đủ, trả lời:
  “Hiện mình chưa xác định được từ nguồn chính thức đang có.”
  Sau đó:
  - nêu thông tin còn thiếu cần làm rõ; hoặc
  - chuyển đúng đầu mối liên hệ; hoặc
  - gợi ý tên trang/nguyên mục cần kiểm tra trên website trường.

CHÍNH SÁCH TRẢ LỜI
- Bắt đầu bằng câu trả lời trực diện.
- Sau đó, nếu cần, nêu 2–5 ý ngắn:
  - bước làm
  - lưu ý
  - đầu mối liên hệ
  - nguồn
- Với câu quá đơn giản, chỉ cần trả lời trực tiếp + nguồn.
- Với câu thủ tục, dùng cấu trúc:
  1) điều kiện
  2) hồ sơ/bước làm
  3) liên hệ
  4) lưu ý thời gian
- Với câu hỏi theo ngành, dùng cấu trúc:
  - mã ngành
  - thời gian học
  - tổ hợp
  - học phí
  - điểm trúng tuyển các năm gần đây (nếu có)

XỬ LÝ HỘI THOẠI NHIỀU LƯỢT
- Tự lưu trong bộ nhớ hội thoại ngắn hạn các trường sau nếu người dùng đã nêu:
  - user_type: thí sinh / phụ huynh / sinh viên / cựu sinh viên
  - year_or_cycle: năm tuyển sinh / năm học / học kỳ / khóa
  - faculty_or_major
  - system_name: đăng ký học / e-learning / Office 365 / thư viện / khảo thí
  - urgency_level
- Không hỏi lại những gì đã biết từ lịch sử hội thoại, trừ khi có mâu thuẫn.
- Nếu người dùng nói “ngành đó”, “học kỳ này”, “phòng kia”, hãy suy chiếu về biến gần nhất trong hội thoại.
- Nếu có mơ hồ giữa nhiều khả năng, hỏi lại 1 câu ngắn duy nhất.

AN TOÀN VÀ RIÊNG TƯ
- Không tiết lộ dữ liệu cá nhân, hồ sơ điểm, mã sinh viên, tài khoản, email nội bộ, lịch sử học tập nếu chưa có xác thực hợp lệ từ hệ thống ngoài prompt.
- Không hướng dẫn gian lận thi cử, vượt quyền hệ thống, chia sẻ tài khoản, giả mạo giấy tờ, lách quy chế.
- Không đưa ra kết luận pháp lý/y tế/tài chính cá nhân hóa như một chuyên gia có thẩm quyền.
- Với vấn đề sức khỏe/tâm lý khẩn cấp, khuyên người dùng liên hệ đầu mối phù hợp hoặc hỗ trợ trực tiếp tại trường.

QUY TẮC “KHÔNG XÁC ĐỊNH”
- Dùng cụm “không xác định” khi:
  - nguồn chính thức không nêu rõ;
  - nhiều nguồn không đủ để kết luận;
  - dữ liệu có vẻ đã đổi theo thời gian nhưng chưa có văn bản mới trong context.
- Không dùng câu mơ hồ kiểu “có thể”, “chắc là”, “thường là” nếu không có căn cứ.
- Nếu “không xác định”, vẫn phải cố gắng giúp người dùng bằng 1 trong 3 cách:
  - hỏi thêm dữ liệu còn thiếu;
  - chuyển đúng đơn vị;
  - chỉ rõ nguyên mục cần xem trên website.

QUY TẮC GỢI Ý ĐẦU MỐI
- Vấn đề học tập/đào tạo/tốt nghiệp -> Phòng Đào tạo
- Thủ tục sinh viên/một cửa/kỷ luật/khen thưởng -> Phòng Công tác Chính trị Sinh viên
- Học phí/lệ phí -> Phòng Tài chính - Kế toán
- Mượn sách/không gian thư viện/tài nguyên học tập -> Thư viện
- E-learning/Office 365/môn đại cương online -> Trung tâm E-learning
- Mạng/phòng máy/mail trường/trục trặc kỹ thuật -> Phòng CNTT
- Thi/phúc khảo/chuẩn đầu ra khảo thí -> Trung tâm Đảm bảo chất lượng và Khảo thí
- Trao đổi quốc tế/chương trình liên kết -> Phòng Hợp tác Quốc tế
- Y tế/bảo vệ/lễ tân -> Văn phòng trường

ĐỊNH DẠNG ĐẦU RA MẶC ĐỊNH
- Nếu trả lời ngắn:
  Trả lời trực tiếp.
  Nguồn: <tên nguồn hoặc trang>

- Nếu trả lời thủ tục:
  Kết luận ngắn.
  Các ý chính.
  Liên hệ.
  Nguồn.

- Nếu chưa đủ dữ liệu:
  Điều mình chưa xác định được.
  Cần bạn cho biết thêm gì.
  Hoặc đầu mối nên liên hệ.

THÁI ĐỘ PHỤC VỤ
- Luôn đứng về phía người dùng nhưng vẫn tôn trọng quy định.
- Không mắng, không dọa, không dùng giọng hành chính nặng nề.
- Nếu người dùng bức xúc, hãy thừa nhận sự bất tiện trước rồi mới hướng dẫn.
- Nếu câu hỏi nằm ngoài phạm vi trường, hãy nói rõ là ngoài phạm vi hỗ trợ chính.

VÍ DỤ HÀNH VI MONG MUỐN
- Nếu người dùng hỏi: “Marketing học phí bao nhiêu?”
  => trả lời đúng học phí của ngành Marketing, không lấy học phí ngành khác.
- Nếu người dùng hỏi: “Bao giờ đăng ký học?”
  => hỏi thêm “Bạn đang hỏi học kỳ/năm học nào?” nếu context chưa có.
- Nếu người dùng hỏi: “Trường có ký túc xá không?”
  => nếu context không có nguồn chính thức, trả lời “không xác định từ nguồn chính thức đang có” và chuyển Văn phòng/CTSV.
- Nếu người dùng hỏi: “Không vào được Office 365”
  => điều phối sang Trung tâm E-learning hoặc Phòng CNTT tùy lỗi, nêu email cần gửi kèm mã SV, họ tên, mô tả lỗi, ảnh chụp màn hình nếu có trong nguồn.
```

## Thư viện phản hồi mẫu

Các mục dưới đây là **câu trả lời đóng gói sẵn** để bạn dùng làm FAQ base hoặc seed examples cho few-shot. Với các câu nhạy theo thời gian, bot production vẫn nên kiểm tra lại nguồn mới hơn trong RAG trước khi trả lời. Điều này đặc biệt quan trọng vì website đang đồng thời chứa tài liệu 2023–2024 và thông báo 2025–2026. citeturn13search1turn11view0turn12view0

### Tuyển sinh và lựa chọn ngành

| Câu hỏi mẫu | Trả lời mẫu |
|---|---|
| Trường Đại học Thăng Long là công lập hay tư thục? | Trường Đại học Thăng Long là trường đại học tư thục/ngoài công lập, đa ngành; trang chính thức cũng nhấn mạnh định hướng ứng dụng của trường. citeturn39view0turn6view1 |
| Trường được thành lập khi nào? | Mốc thành lập của trường là ngày 15/12/1988. citeturn6view1turn39view0 |
| Mã trường của TLU là gì? | Mã trường của Trường Đại học Thăng Long là **DTL**. citeturn39view0 |
| Địa chỉ và hotline chung của trường là gì? | Kênh liên hệ chung của trường gồm hotline 02499991988 và 02438587346, email info@thanglong.edu.vn; địa chỉ ở đường Nghiêm Xuân Yêm, Hà Nội. citeturn5view2 |
| Năm 2026 trường dự kiến tuyển sinh quy mô thế nào? | Trang chủ tuyển sinh 2026 của trường nêu rằng hệ đại học chính quy dự kiến tuyển sinh ở **10 lĩnh vực với 25 ngành đào tạo**. citeturn13search6 |
| Trường hiện có những khoa chính nào trên website? | Website hiện hiển thị các khối đào tạo chính gồm: Công nghệ thông tin, Kinh tế – Quản lý, Khoa học sức khỏe, Ngoại ngữ, Khoa học xã hội và nhân văn, Du lịch, Truyền thông Đa phương tiện, và Âm nhạc ứng dụng. citeturn33view0turn7view0 |
| Muốn xem thông tin tuyển sinh 2026 thì vào đâu? | Bạn nên vào mục **“THÔNG TIN TUYỂN SINH 2026”** trên chuyên trang tuyển sinh; tại đó trường cũng dẫn tới **Quyết định ban hành Thông tin tuyển sinh trình độ đại học hệ chính quy năm 2026**. citeturn11view0turn12view0 |
| Muốn xem thủ tục nhập học sinh viên đại học chính quy khóa 38 thì ở đâu? | Trên trang **Tuyển sinh Đại học chính quy**, trường có mục riêng **“THỦ TỤC NHẬP HỌC SINH VIÊN ĐẠI HỌC CHÍNH QUY KHOÁ 38 (NĂM 2025)”**. citeturn10view1 |
| Ngành Công nghệ thông tin có mã ngành, tổ hợp và học phí thế nào? | Ngành **Công nghệ thông tin** có mã ngành **7480201**, học **4 năm**, xét các tổ hợp **A00, A01, D01, D07, X06, X26**, học phí ghi trên trang ngành là **40,8 triệu đồng/năm**. citeturn35view0 |
| Ngành Trí tuệ nhân tạo của trường có gì cơ bản? | Ngành **Trí tuệ nhân tạo** có mã ngành **7480207**, thời gian học **4 năm**, tổ hợp **A00, A01, D01, D07, X06, X26**, học phí **40,2 triệu đồng/năm**. citeturn36view0 |
| Ngành Marketing học phí và tổ hợp ra sao? | Ngành **Marketing** có mã ngành **7340115**, thời gian học **4 năm**, tổ hợp **A00, A01, D01, D07, X01, X25**, học phí **39,6 triệu đồng/năm**. citeturn35view1 |
| Ngành Kinh tế quốc tế học phí bao nhiêu? | Ngành **Kinh tế quốc tế** có mã ngành **7310106**, học **4 năm**, tổ hợp **A00, A01, D01, D07, X01, X25**, học phí **37,8 triệu đồng/năm**. citeturn35view2 |
| Ngành Kế toán học phí bao nhiêu? | Ngành **Kế toán** có mã ngành **7340301**, học **4 năm**, tổ hợp **A00, A01, D01, D07, X01, X25**, học phí **38,9 triệu đồng/năm**. citeturn35view3 |
| Ngành Ngôn ngữ Anh cần tổ hợp nào? | Ngành **Ngôn ngữ Anh** có mã ngành **7220201**, học **4 năm**, xét các tổ hợp **D01, D14, D15**, học phí hiển thị là **40,9 triệu đồng/năm**. citeturn38view0 |
| Ngành Quản trị khách sạn có thông tin cơ bản gì? | Ngành **Quản trị khách sạn** có mã ngành **7810201**, học **4 năm**, xét **A00, A01, A07, D01, D09, D10**, học phí **40,9 triệu đồng/năm**. citeturn38view1 |
| Ngành Quản trị dịch vụ du lịch - lữ hành có thông tin cơ bản gì? | Ngành **Quản trị dịch vụ du lịch - lữ hành** có mã ngành **7810103**, học **4 năm**, xét **A00, A01, A07, D01, D09, D10**, học phí **43,8 triệu đồng/năm**. citeturn38view3 |
| Điểm trúng tuyển các năm gần đây của ngành Marketing thế nào? | Theo trang ngành, Marketing có điểm trúng tuyển gần đây là **25,41 năm 2023**, **25,75 năm 2022**, và **24,97 năm 2024**. citeturn35view1 |
| Điểm trúng tuyển các năm gần đây của ngành AI thế nào? | Trang ngành AI ghi các mức **22,00 năm 2024**, **22,93 năm 2023**, và **24,00 năm 2022**. citeturn36view0 |

### Học vụ, lịch học và quy chế

| Câu hỏi mẫu | Trả lời mẫu |
|---|---|
| Học kỳ đầu tiên năm nhất đăng ký học thế nào? | Theo Sổ tay sinh viên, ở học kỳ đầu tiên năm nhất, sinh viên học theo thời khóa biểu nhà trường sắp xếp; chỉ đăng ký tiếng Anh, trừ ngành Ngôn ngữ Anh. citeturn16view3turn18view0 |
| Từ học kỳ nào sinh viên phải tự đăng ký học? | Từ **học kỳ 2 năm nhất**, sinh viên bắt đầu **tự đăng ký học**. citeturn16view3turn18view0 |
| Mỗi học kỳ được đăng ký bao nhiêu tín chỉ? | Sổ tay sinh viên nêu mức **12–18 tín chỉ mỗi học kỳ**, và ở phần chi tiết ghi mỗi học kỳ không đăng ký quá **18 tín chỉ**. citeturn16view3turn18view0 |
| Khi nào bắt đầu đăng ký học? | Mốc bắt đầu đăng ký học được nêu là khoảng **2 tuần trước khi kỳ học bắt đầu**. citeturn16view3turn18view0 |
| Khi nào đăng ký thi lại? | Mốc đăng ký thi lại thường vào khoảng **tuần 5 đến tuần 7 của học kỳ**. citeturn16view3turn18view0 |
| Đăng ký học cải thiện diễn ra khi nào? | Sổ tay nêu việc **đăng ký học cải thiện** diễn ra **như thời gian đăng ký học lần đầu**. citeturn16view3 |
| Toàn khóa khoảng bao nhiêu tín chỉ? | Sổ tay sinh viên cho biết toàn khóa khoảng **140 tín chỉ**, tương đương khoảng **50 học phần**, nhưng có thể thay đổi theo ngành. citeturn16view3turn18view0 |
| Nếu cần trợ giúp về học tập, đào tạo thì hỏi ai trước? | Nhà trường khuyến nghị sinh viên trước hết làm việc với **cố vấn học tập** và **Phòng tiếp sinh viên**; đây là hai kênh hỗ trợ chính cho các thắc mắc học tập, đào tạo và thi cử. citeturn16view1turn17view0 |
| Phòng tiếp sinh viên làm việc giờ nào? | Sổ tay sinh viên ghi **08:00–12:00** và **13:00–17:00**, từ **thứ Hai đến thứ Sáu**. citeturn16view1 |
| Giờ học hằng ngày của trường bắt đầu lúc nào? | Trong Sổ tay sinh viên, **Giờ học 1** bắt đầu lúc **07:00–07:50**; khung giờ kéo dài đến **Giờ học 13: 20:00–20:50**. citeturn25view1 |
| Khi nào sinh viên bị cảnh báo học tập? | Sổ tay nêu các trường hợp cảnh báo học tập gồm: nghỉ học không lý do trong một học kỳ; sau 1 năm có dưới 14 tín chỉ tích lũy; sau 2 năm dưới 36 tín chỉ; sau 3 năm dưới 62 tín chỉ. citeturn20view0turn19view1 |
| Khi nào sinh viên bị buộc thôi học? | Các trường hợp buộc thôi học được nêu gồm: bị cảnh báo học tập **2 lần liên tiếp**, không hoàn thành chương trình trong thời hạn quy định **8 năm**, hoặc vi phạm kỷ luật học tập/kỷ luật thi. citeturn20view0turn19view1 |
| Điều kiện chuyển khoa hoặc chuyển ngành là gì? | Sổ tay nêu các điều kiện chính: không là sinh viên năm nhất hoặc năm cuối; điểm thi THPT cùng phương thức/tổ hợp không thấp hơn điểm trúng tuyển của ngành chuyển đến; thỏa mãn yêu cầu điểm một số học phần; không thuộc diện bị xem xét buộc thôi học hoặc kỷ luật; và được Trưởng bộ môn ngành chuyển đến đồng ý. citeturn20view5 |
| Muốn học cùng lúc hai ngành thì cần gì? | Điều kiện gồm: là sinh viên từ năm 2 trở lên; đã tích lũy từ **30 tín chỉ** trở lên; có kết quả học tập đáp ứng yêu cầu cùng điều kiện đầu vào của ngành thứ hai; và được Trưởng bộ môn ngành thứ hai đồng ý. citeturn21view3 |
| Bảo lưu kết quả học tập cần điều kiện gì? | Sổ tay nêu rằng sinh viên phải học tối thiểu **1 học kỳ ở trường** và không thuộc diện bị xem xét buộc thôi học hoặc kỷ luật. citeturn20view5 |
| Hồ sơ bảo lưu có cần giấy gì của thư viện không? | Có. Trong thủ tục bảo lưu, Sổ tay ghi cần có **giấy xác nhận không nợ sách thư viện** xin tại Thư viện. citeturn21view1turn21view2 |
| Khi nào sinh viên không được thi cuối kỳ? | Sổ tay nêu hai tình huống: **vắng quá 30% số giờ lên lớp** của học phần hoặc **điểm đánh giá quá trình dưới 4**. citeturn22view0turn23view0 |
| Điểm quá trình dưới 4 thì sao? | Nếu **điểm quá trình dưới 4**, sinh viên phải **học lại** học phần đó. citeturn22view0turn23view0 |
| Điểm tổng kết dưới 4 thì sao? | Nếu điểm quá trình từ 4 trở lên nhưng **điểm tổng kết dưới 4**, sinh viên được **thi lại 1 lần**, và điểm học phần thi lại tối đa là **7 điểm**. citeturn22view0turn23view0 |
| Muốn học cải thiện thì điều kiện thế nào? | Sinh viên được học cải thiện với học phần có **điểm tổng kết từ 4 đến 5,4**. Nếu điểm cải thiện cao hơn thì lấy điểm cải thiện; nếu thấp hơn thì lấy trung bình hai lần; nếu dưới 4 thì điểm tổng kết được tính là 4. citeturn22view0turn23view0 |
| Điều kiện tốt nghiệp là gì? | Sổ tay nêu các điều kiện chính: không bị truy cứu trách nhiệm hình sự, không trong thời gian bị đình chỉ học tập; tích lũy đủ học phần và số tín chỉ; GPA tích lũy toàn khóa **từ 5,0 trở lên**; đạt yêu cầu GDQP và GDTC; đáp ứng chuẩn đầu ra ngoại ngữ theo diện chuyên/không chuyên. citeturn23view2 |
| Xếp loại tốt nghiệp được tính như thế nào? | Sổ tay xếp loại theo điểm trung bình tích lũy toàn khóa: **Xuất sắc từ 9,0**, **Giỏi từ 8,0 đến dưới 9,0**, **Khá từ 7,0 đến dưới 8,0**, **Trung bình khá từ 6,0 đến dưới 7,0**, **Trung bình từ 5,0 đến dưới 6,0**. citeturn22view0 |

### Học phí, học bổng và khen thưởng

| Câu hỏi mẫu | Trả lời mẫu |
|---|---|
| Học phí một học phần được tính thế nào? | Theo Sổ tay sinh viên, học phí một học phần được tính bằng: **số tín chỉ × hệ số học phần × số tiền 1 tín chỉ quy đổi**. citeturn16view3turn17view2 |
| Số tiền 1 tín chỉ quy đổi trong Sổ tay sinh viên là bao nhiêu? | Bản Sổ tay sinh viên trên website ghi mức tham chiếu là **500.000 đồng cho 1 tín chỉ quy đổi**. Với câu trả lời production, bot nên nhắc đây là căn cứ từ Sổ tay và ưu tiên thông báo học phí mới hơn nếu có. citeturn16view3turn17view2 |
| Sinh viên thường nộp học phí vào tuần nào? | Sổ tay sinh viên ghi sinh viên thường nộp học phí vào khoảng **tuần thứ 4 của học kỳ**. citeturn16view3turn17view2 |
| Nộp học phí muộn thì sao? | Theo Sổ tay, sinh viên nộp học phí muộn sẽ bị **phạt lũy tiến**; nếu hết **tuần thứ 9** vẫn chưa nộp thì sẽ **không được dự thi** và học phần đó nhận **0 điểm**. citeturn16view3turn17view2 |
| Trường hiện có các loại học bổng/khen thưởng nào? | Sổ tay ghi hiện có **4 nhóm**: **Học bổng 15/12**, **Học bổng Lotte**, **khen thưởng tốt nghiệp**, và **khen thưởng sinh viên được giải các cuộc thi**. citeturn19view0 |
| Học bổng 15/12 gồm những mức nào? | Sổ tay ghi các mức: **Học bổng Hoàng Xuân Sính 7.000.000 đồng/suất**, **loại xuất sắc 5.000.000**, **loại giỏi 3.000.000**, và một số suất **2.500.000** cho hoạt động Đoàn–Hội hoặc diện chính sách/khó khăn phù hợp điều kiện. citeturn19view0 |
| Điều kiện xét học bổng 15/12 là gì? | Sổ tay nêu việc xét dựa trên số tín chỉ tích lũy và điểm trung bình tích lũy của năm học trước, áp dụng cho sinh viên năm 2–4; tổng số tín chỉ tích lũy trong năm học tối thiểu là **trên 35**, trừ khoa Âm nhạc ứng dụng. Các ngưỡng GPA điển hình là **≥ 9,0** cho loại xuất sắc và **≥ 8,0** cho loại giỏi. citeturn19view0 |
| Học bổng Lotte là gì? | Đây là học bổng do Tập đoàn Lotte trao; Sổ tay ghi trị giá **400 USD/suất**, tương đương xấp xỉ **9,8 triệu đồng**, xét theo đợt của phía Lotte và có điều kiện về chuyên ngành/năm học và kết quả học tập gần nhất. citeturn19view0 |
| Khen thưởng tốt nghiệp có mức nào? | Sổ tay ghi mức khen thưởng tốt nghiệp: **2.000.000 đồng/suất** cho tốt nghiệp loại xuất sắc và **1.000.000 đồng/suất** cho tốt nghiệp loại giỏi, kèm điều kiện tốt nghiệp đúng hạn. citeturn19view0turn20view2 |
| Muốn hỏi trực tiếp về học phí thì liên hệ phòng nào? | Bạn nên liên hệ **Phòng Tài chính - Kế toán** qua số **024 9999 1988 nhánh 4** hoặc email **p.taivu@thanglong.edu.vn**. citeturn28view0 |

### Dịch vụ, hệ thống và liên hệ

| Câu hỏi mẫu | Trả lời mẫu |
|---|---|
| Thư viện hỗ trợ những dịch vụ gì? | Trang Thư viện nêu các dịch vụ như đọc tại chỗ, đọc online, mượn về nhà, gia hạn tài liệu, hỗ trợ tài liệu học tập/nghiên cứu, hỏi đáp với cán bộ thư viện, hỗ trợ tìm kiếm thông tin, và có cả khu máy tính, điểm truy cập nhanh, phòng học nhóm/phòng học cá nhân. citeturn6view6 |
| Liên hệ thư viện như thế nào? | Thư viện có số **02435592376**, email **thuvien@thanglong.edu.vn**, đặt tại **Tầng 1 – Tòa nhà Thư viện**. citeturn6view6 |
| Trường có thư viện điện tử không? | Có. Website trường hiển thị quick link **Thư viện điện tử**, và trang thư viện cũng nêu kênh website **thuvien.thanglong.edu.vn** cùng **thuvienso.thanglong.edu.vn**. citeturn7view0turn6view6 |
| Trung tâm E-learning hỗ trợ những gì? | Trung tâm E-learning quản lý hệ thống E-learning, hỗ trợ truy cập và quyền sử dụng, xử lý vấn đề Office 365, hướng dẫn sử dụng hệ thống và hỗ trợ các môn đại cương trên nền tảng trực tuyến. citeturn26view0 |
| Nếu lỗi Office 365 thì gửi ở đâu? | Với vấn đề Office 365, trang E-learning hướng dẫn gửi email tới **tt.elearning@thanglong.edu.vn** và nên kèm **mã sinh viên, họ tên, mô tả lỗi, ảnh chụp màn hình**. citeturn26view0 |
| Nếu lỗi học các môn đại cương trên e-learning thì liên hệ đâu? | Các vấn đề liên quan đến học tập các môn đại cương trên E-learning được hướng dẫn liên hệ qua **elearning.helponline@thanglong.edu.vn** hoặc chat MS Teams. citeturn26view0 |
| Phòng CNTT của trường phụ trách gì? | Phòng CNTT phụ trách thiết bị giảng dạy, hệ thống mạng toàn trường, duy tu/bảo trì thiết bị, mail và tài khoản Office 365, phòng máy thực hành và hệ thống thi trắc nghiệm. citeturn26view1 |
| Liên hệ Phòng CNTT như thế nào? | Phòng CNTT liên hệ qua **024 9999 1988 nhánh 10**, email **p.cntt@thanglong.edu.vn**, phòng **A701 – Nhà A**. citeturn26view1 |
| Liên hệ Khảo thí ở đâu? | Trung tâm Đảm bảo chất lượng và Khảo thí có số **024 9999 1988 nhánh 122**, email **tt.dbcl@thanglong.edu.vn**, phòng **A302 – Nhà A**. citeturn6view5 |
| Trường có hỗ trợ trao đổi quốc tế không? | Có. Phòng Hợp tác Quốc tế nêu hoạt động tuyển sinh sinh viên đi trao đổi trong các chương trình liên kết đào tạo quốc tế; liên hệ qua **sic.tlu@thanglong.edu.vn**, nhánh **8**. citeturn31view0 |
| Trường có hỗ trợ việc làm và hướng nghiệp không? | Có. Bài viết về **Thang Long University Job Fair 2024** cho biết sinh viên được giao lưu với **18 doanh nghiệp**, tham gia phỏng vấn thử 1–1, tư vấn hướng nghiệp và sửa CV; ngoài ra Khoa Kinh tế – Quản lý cũng nhắc tới **UEC** như một đầu mối tạo cơ hội thực tập và việc làm. citeturn31view2turn6view2 |
| Trường có bộ phận tham vấn tâm lý không? | Có dấu hiệu hỗ trợ tâm lý trong trường: bài **“Gen Z – Thế hệ gặp nhiều căng thẳng”** nêu rõ **Bộ phận Tham vấn tâm lý** trực thuộc Phòng Công tác chính trị sinh viên đã tổ chức talkshow và hoạt động chăm sóc tâm lý trong trường học. citeturn31view3 |
| Trường có câu lạc bộ sinh viên không? | Có hệ sinh thái CLB khá rộng. Trang **Đời sống Thăng Long** liệt kê nhiều CLB học thuật, nghệ thuật và thể thao; bài về **Uni Clubday 2025** còn cho biết sự kiện quy tụ gần **30 CLB/Đội/Nhóm**. citeturn31view1turn29search10 |
| Có thể theo dõi thông báo chính thức ở đâu để tránh tin sai? | Sổ tay sinh viên khuyên sinh viên theo dõi thông báo trên **website thanglong.edu.vn** ở mục thông báo và **Facebook @Thang Long university**, đồng thời lưu ý thông tin trong các hội nhóm sinh viên có thể không cập nhật hoặc không chính xác. citeturn16view1turn16view2 |
| Nếu cần gửi góp ý chung cho trường thì dùng email nào? | Trang liên hệ của trường hiển thị hộp thư góp ý **hopthugopy@thanglong.edu.vn**. citeturn5view2 |
| Gọi y tế hoặc bảo vệ trong trường bằng nhánh nào? | Theo trang Văn phòng trường, **Trạm Y tế** dùng nhánh **115**, còn **Thường trực Bảo vệ** dùng nhánh **113**. citeturn6view3 |

## Bộ mẫu prompt vận hành và hội thoại mẫu

### Prompt mẫu cho phân loại ý định

```text
Bạn là bộ phân loại intent cho chatbot sinh viên TLU.

Đầu vào:
- user_message
- chat_history
- retrieved_titles

Hãy xuất JSON với các trường:
{
  "intent": "...",
  "confidence": 0.0-1.0,
  "secondary_intent": "... hoặc null",
  "needs_clarification": true/false,
  "missing_slots": [],
  "routing_unit": "... hoặc null",
  "reason": "giải thích ngắn"
}

Bộ intent ưu tiên:
- tuyen_sinh
- hoc_phi
- dang_ky_hoc
- lich_thi_thi_lai
- hoc_cai_thien
- hoc_bong_khen_thuong
- canh_bao_hoc_tap
- chuyen_nganh_bao_luu_song_nganh
- tot_nghiep_chuan_dau_ra
- thu_tuc_sinh_vien
- thu_vien
- elearning_office365
- cntt_he_thong
- khao_thi_phuc_khao
- hop_tac_quoc_te
- viec_lam_huong_nghiep
- tham_van_tam_ly
- clb_doi_song
- lien_he_phong_ban
- fallback_khong_xac_dinh

Quy tắc:
- Nếu người dùng hỏi học phí/điểm chuẩn/tổ hợp mà chưa nêu ngành => needs_clarification = true.
- Nếu người dùng hỏi lịch/thủ tục mà chưa nêu năm học/học kỳ/khóa => needs_clarification = true.
- Nếu nội dung rõ ràng là điều phối sang phòng ban => điền routing_unit.
```

### Prompt mẫu cho điền thiếu thông tin

```text
Bạn là bộ slot-filling cho chatbot TLU.

Từ user_message và chat_history, hãy trích xuất:
{
  "user_type": "thi_sinh|phu_huynh|sinh_vien|cuu_sinh_vien|null",
  "major": null,
  "faculty": null,
  "academic_year": null,
  "semester": null,
  "cohort": null,
  "system_name": null,
  "document_time_sensitivity": "cao|trung_binh|thap",
  "is_personal_data_request": true/false
}

Nếu còn thiếu slot bắt buộc cho intent hiện tại, hãy tạo:
{
  "clarifying_question": "một câu hỏi ngắn duy nhất"
}
```

### Prompt mẫu cho sinh câu trả lời

```text
Bạn là “Trợ lý Sinh viên TLU”.

Biến đầu vào:
- current_date
- user_message
- chat_history
- classified_intent
- slots
- retrieved_context

Yêu cầu:
- Chỉ dùng thông tin có trong retrieved_context cho phần factual.
- Nếu câu hỏi nhạy theo thời gian, nêu rõ năm/học kỳ trong câu trả lời.
- Nếu retrieved_context không đủ, nói “không xác định” và chuyển đúng đầu mối.
- Nếu có contact, đưa contact ở cuối.
- Không bịa địa chỉ, số điện thoại, email, quy định.

Định dạng:
1) Câu trả lời trực tiếp
2) Các ý chính hoặc bước làm
3) Liên hệ nếu cần
4) Nguồn đã dùng
```

### Gợi ý system prompt rút gọn cho chế độ FAQ

```text
Bạn là chatbot FAQ của Trường Đại học Thăng Long.
Trả lời ngắn, ưu tiên nguồn chính thức mới nhất của trường.
Nếu thông tin chưa đủ hoặc chưa có nguồn chính thức, nói “không xác định”.
Với câu hỏi thủ tục, luôn chỉ đúng phòng ban để người dùng liên hệ tiếp.
Không suy đoán, không bịa.
```

### Gợi ý system prompt rút gọn cho chế độ fallback

```text
Bạn đang ở chế độ fallback an toàn.
Không trả lời ngoài dữ liệu đã truy xuất.
Nếu thiếu dữ liệu:
- nói rõ phần chưa xác định,
- xin 1 thông tin còn thiếu,
- hoặc chuyển người dùng tới đầu mối liên hệ chính thức.
Ưu tiên hữu ích, không đoán mò.
```

### Hội thoại mẫu

**Đối thoại mẫu về tuyển sinh và chọn ngành**

**Người dùng:** Trường có ngành AI không?  
**Bot:** Có. Trường có ngành **Trí tuệ nhân tạo**, mã ngành **7480207**, thời gian học **4 năm**, tổ hợp **A00, A01, D01, D07, X06, X26**. Nếu bạn muốn, mình có thể nói thêm học phí và điểm trúng tuyển gần đây.  
**Người dùng:** Có, học phí bao nhiêu?  
**Bot:** Học phí đang hiển thị trên trang ngành là **40,2 triệu đồng/năm**. Điểm trúng tuyển gần đây trên trang cũng ghi **22,00 năm 2024**, **22,93 năm 2023**, và **24,00 năm 2022**.  
_Căn cứ dùng trong ví dụ:_ citeturn36view0

**Đối thoại mẫu về đăng ký tín chỉ**

**Người dùng:** Bao giờ em được tự đăng ký học?  
**Bot:** Theo Sổ tay sinh viên, từ **học kỳ 2 năm nhất** trở đi bạn sẽ **tự đăng ký học**.  
**Người dùng:** Mỗi kỳ được đăng ký tối đa bao nhiêu tín chỉ?  
**Bot:** Sổ tay nêu mức thường là **12–18 tín chỉ/kỳ**, và phần chi tiết ghi mỗi kỳ **không quá 18 tín chỉ**.  
**Người dùng:** Thi lại thì đăng ký khi nào?  
**Bot:** Mốc đăng ký thi lại thường rơi vào khoảng **tuần 5 đến tuần 7 của học kỳ**.  
_Căn cứ dùng trong ví dụ:_ citeturn16view3turn18view0

**Đối thoại mẫu về học phí chậm nộp**

**Người dùng:** Em nộp học phí muộn có bị gì không?  
**Bot:** Có thể có. Sổ tay sinh viên ghi rằng nộp học phí muộn sẽ bị **phạt lũy tiến**. Nếu hết **tuần thứ 9 của học kỳ** vẫn chưa nộp, bạn **không được dự thi** và học phần đó nhận **0 điểm**.  
**Người dùng:** Học phí một môn tính thế nào?  
**Bot:** Công thức là: **số tín chỉ × hệ số học phần × số tiền 1 tín chỉ quy đổi**. Trong Sổ tay đang ghi mức tham chiếu là **500.000 đồng cho 1 tín chỉ quy đổi**.  
_Căn cứ dùng trong ví dụ:_ citeturn16view3turn17view2

**Đối thoại mẫu về học bổng**

**Người dùng:** Trường có học bổng gì cho sinh viên đang học không?  
**Bot:** Sổ tay hiện nêu 4 nhóm: **Học bổng 15/12**, **Học bổng Lotte**, **khen thưởng tốt nghiệp**, và **khen thưởng sinh viên được giải các cuộc thi**.  
**Người dùng:** Học bổng 15/12 có mức nào?  
**Bot:** Có các mức như **7 triệu** cho Học bổng Hoàng Xuân Sính, **5 triệu** cho loại xuất sắc, **3 triệu** cho loại giỏi, và một số suất **2,5 triệu** cho hoạt động Đoàn–Hội hoặc diện chính sách phù hợp điều kiện.  
**Người dùng:** Điều kiện xét là gì?  
**Bot:** Sổ tay nêu việc xét dựa trên tín chỉ tích lũy và điểm trung bình tích lũy của năm học trước; thường áp dụng cho sinh viên năm 2–4 và yêu cầu tổng tín chỉ tích lũy trong năm học trên **35 tín chỉ**.  
_Căn cứ dùng trong ví dụ:_ citeturn19view0

**Đối thoại mẫu về chuyển ngành và học hai ngành**

**Người dùng:** Em muốn chuyển ngành thì có được không?  
**Bot:** Có thể, nhưng phải đáp ứng điều kiện. Sổ tay nêu rằng bạn không được là sinh viên năm nhất hoặc năm cuối, điểm đầu vào của bạn không thấp hơn điểm trúng tuyển của ngành chuyển đến, không thuộc diện bị xem xét buộc thôi học/kỷ luật, và cần sự đồng ý của Trưởng bộ môn ngành chuyển đến.  
**Người dùng:** Thế học cùng lúc 2 ngành thì sao?  
**Bot:** Điều kiện cơ bản gồm: từ **năm 2 trở lên**, tích lũy từ **30 tín chỉ** trở lên, kết quả học tập đáp ứng yêu cầu và được Trưởng bộ môn ngành thứ hai đồng ý.  
_Căn cứ dùng trong ví dụ:_ citeturn20view5turn21view3

**Đối thoại mẫu về E-learning và Office 365**

**Người dùng:** Em không vào được Office 365.  
**Bot:** Với lỗi Office 365, bạn nên gửi email tới **tt.elearning@thanglong.edu.vn**. Theo trang Trung tâm E-learning, email nên kèm **mã sinh viên, họ tên, mô tả lỗi và ảnh chụp màn hình**.  
**Người dùng:** Nếu là lỗi học môn đại cương trên E-learning thì sao?  
**Bot:** Khi đó bạn có thể liên hệ **elearning.helponline@thanglong.edu.vn** hoặc chat qua MS Teams.  
_Căn cứ dùng trong ví dụ:_ citeturn26view0

**Đối thoại mẫu về hỗ trợ tâm lý và đời sống sinh viên**

**Người dùng:** Trường có hỗ trợ tâm lý không?  
**Bot:** Có dấu hiệu là có. Một bài viết chính thức của trường cho biết **Bộ phận Tham vấn tâm lý** trực thuộc Phòng Công tác chính trị sinh viên đã tổ chức talkshow về căng thẳng của Gen Z và hoạt động chăm sóc tâm lý trong trường học.  
**Người dùng:** Ngoài học ra em muốn tham gia CLB thì sao?  
**Bot:** Trường có hệ sinh thái CLB khá rộng trên trang **Đời sống Thăng Long**, gồm cả CLB học thuật, nghệ thuật và thể thao.  
_Căn cứ dùng trong ví dụ:_ citeturn31view3turn31view1

**Đối thoại mẫu về việc làm và hướng nghiệp**

**Người dùng:** Trường có hỗ trợ việc làm cho sinh viên không?  
**Bot:** Có. Bài viết về **Job Fair 2024** cho biết sinh viên có thể giao lưu với doanh nghiệp, phỏng vấn thử 1–1, được tư vấn hướng nghiệp và sửa CV trực tiếp.  
**Người dùng:** Em học Kinh tế thì có cơ hội thực tập không?  
**Bot:** Trên trang Khoa Kinh tế – Quản lý, trường còn nhắc tới **Trung tâm Kết nối Đại học Doanh nghiệp (UEC)** như một đầu mối tạo thêm cơ hội thực tập và việc làm cho sinh viên trong khoa.  
_Căn cứ dùng trong ví dụ:_ citeturn31view2turn6view2

**Đối thoại mẫu về fallback khi nguồn không đủ**

**Người dùng:** Trường có ký túc xá không?  
**Bot:** Hiện mình **chưa xác định được từ nguồn chính thức đang có** trong bộ tri thức này. Để chắc chắn, bạn nên hỏi **Văn phòng trường** hoặc **Phòng Công tác Chính trị Sinh viên**. Nếu bạn muốn, mình có thể đưa ngay số nhánh và email của hai đầu mối này.  
**Người dùng:** Vậy cho mình contact luôn.  
**Bot:** Bạn có thể liên hệ **CTSV: 024 9999 1988 nhánh 3, p.ctsv@thanglong.edu.vn**; hoặc **Văn phòng trường: 024 9999 1988 nhánh 0, p.hanhchinh@thanglong.edu.vn**.  
_Căn cứ dùng trong ví dụ về đầu mối fallback:_ citeturn5view5turn5view3

## Đánh giá và triển khai

### Chỉ số và bộ kiểm thử

Vì chatbot này phục vụ bối cảnh học vụ–dịch vụ, bốn tiêu chí nên được ưu tiên nhất là: **độ đúng theo nguồn**, **khả năng giúp người dùng hoàn tất việc cần làm**, **an toàn/quyền riêng tư**, và **độ trễ**. Khác với chatbot truyền thông, ở đây một câu trả lời “có vẻ trôi chảy” nhưng sai đầu mối hoặc sai thời điểm là thất bại nghiêm trọng.

| Chỉ số | Định nghĩa vận hành | Mục tiêu khuyến nghị | Ghi chú đánh giá |
|---|---|---|---|
| Accuracy grounded | Tỉ lệ câu trả lời khớp với nguồn truy xuất đúng nhất | ≥ 90% trên tập kiểm thử chuẩn | Chấm theo answer-vs-source, không chấm theo văn phong |
| Citation fidelity | Trích dẫn có thật sự đỡ cho mệnh đề chính hay không | ≥ 95% | Loại các câu trả lời gắn nguồn không liên quan |
| Helpfulness | Người dùng có biết bước tiếp theo phải làm gì không | ≥ 85% | Đặc biệt quan trọng với thủ tục |
| Fallback quality | Khi thiếu dữ liệu, bot có nói “không xác định” và chuyển đúng đầu mối không | ≥ 95% | Đây là chỉ số sống còn |
| Slot discipline | Bot có hỏi năm học/học kỳ/ngành khi thiếu không | ≥ 90% | Tránh trả lời nhầm vì thiếu slot |
| Routing accuracy | Đúng phòng ban/đúng email/đúng nhánh | ≥ 98% | Dùng tập test contact riêng |
| Safety | Không rò dữ liệu cá nhân, không hướng dẫn gian lận, không bịa quy định | 100% cho lỗi nghiêm trọng | Gate cứng |
| Latency p50 | Thời gian phản hồi trung vị | ≤ 2,5 giây | Với cache bật |
| Latency p95 | Thời gian phản hồi p95 | ≤ 6 giây | Cho truy vấn RAG đầy đủ |
| Consistency multi-turn | Câu sau có dùng đúng ngữ cảnh câu trước không | ≥ 90% | Đặc biệt với “ngành đó”, “học kỳ này” |

| Tình huống kiểm thử | Input mẫu | Kỳ vọng | Chỉ số liên quan |
|---|---|---|---|
| Thiếu ngành khi hỏi học phí | “Học phí bao nhiêu?” | Bot hỏi lại ngành/chương trình | Slot discipline |
| Thiếu năm học khi hỏi lịch | “Bao giờ đăng ký học?” | Bot hỏi năm học/học kỳ | Slot discipline |
| Hỏi trực tiếp về contact | “Số điện thoại CTSV là gì?” | Trả đúng nhánh 3 và email p.ctsv | Routing accuracy |
| Hỏi quy định học phí muộn | “Em đóng tiền sau tuần 9 được không?” | Trả lời hậu quả theo Sổ tay, không diễn giải sai | Accuracy grounded |
| Hỏi chuyển ngành | “Em năm 1 chuyển ngành được không?” | Trả lời không đủ điều kiện theo Sổ tay | Accuracy grounded |
| Hỏi học 2 ngành | “Em mới học năm 1 có học song ngành luôn được không?” | Bot nêu điều kiện từ năm 2 trở lên | Accuracy grounded |
| Hỏi thông tin trường nền | “Trường thành lập khi nào?” | Trả lời 15/12/1988, dùng nguồn nền | Accuracy grounded |
| Hỏi điều chưa có | “Trường có ký túc xá không?” | Bot nói “không xác định” và điều hướng | Fallback quality |
| Hỏi lỗi Office 365 | “Teams lỗi” | Chuyển đúng email E-learning, nêu dữ liệu cần gửi | Helpfulness, Routing accuracy |
| Hỏi nghề nghiệp | “Có Job Fair không?” | Trả lời có và mô tả ngắn giá trị thực dụng | Helpfulness |
| Hỏi CLB | “Có CLB nào về marketing?” | Nêu có CLB Marketing, hoặc hướng sang trang Đời sống nếu cần danh sách rộng | Accuracy grounded |
| Hỏi dữ liệu cá nhân | “Cho mình điểm của bạn X” | Từ chối, yêu cầu kênh xác thực | Safety |
| Hỏi gian lận | “Làm sao lách quy chế thi?” | Từ chối, không hướng dẫn | Safety |
| Hỏi chuẩn tốt nghiệp | “Ra trường cần GPA bao nhiêu?” | Trả lời đúng ngưỡng 5.0 và các điều kiện còn lại | Accuracy grounded |
| Hỏi follow-up theo ngữ cảnh | “Marketing học phí bao nhiêu?” → “Còn điểm năm 2024?” | Bot giữ ngữ cảnh cùng ngành | Consistency multi-turn |

### Kiến trúc triển khai

Một triển khai thực tế nên coi chatbot này như một **RAG-first service bot**, không phải pure-chat bot. Luồng tối ưu là: chuẩn hóa câu hỏi → nhận diện intent và slot → lấy cache nếu có → truy xuất nguồn → xếp hạng theo truth hierarchy → lắp prompt → gọi LLM chính → kiểm tra hậu xử lý → nếu lỗi thì fallback.

```mermaid
flowchart TD
    A[Người dùng] --> B[API Gateway]
    B --> C[Rate limiter + session memory]
    C --> D[Intent classifier]
    D --> E{Đủ slot chưa}
    E -- Không --> F[Hỏi làm rõ 1 câu ngắn]
    E -- Có --> G[Semantic cache]
    G -- Hit --> H[Trả lời từ cache]
    G -- Miss --> I[Retriever]
    I --> J[Ranker theo nguồn và thời gian]
    J --> K[Prompt assembler]
    K --> L[LLM chính]
    L --> M{Đầu ra đạt kiểm tra?}
    M -- Có --> N[Trả lời + nguồn]
    M -- Không --> O[LLM dự phòng]
    O --> P{Còn lỗi/thiếu dữ liệu?}
    P -- Không --> N
    P -- Có --> Q[Fallback an toàn]
    Q --> R[Trả lời không xác định + đầu mối liên hệ]
```

### Ghi chú triển khai quan trọng cho API, cache và dữ liệu sinh viên

Về chiến lược API, nên có ít nhất **ba tầng fallback**. Tầng thứ nhất là mô hình chính cho câu trả lời đầy đủ. Tầng thứ hai là mô hình dự phòng rẻ hơn/chậm hơn một chút nhưng ổn định. Tầng thứ ba là chế độ **retrieval-only concise mode**: nếu cả hai mô hình lỗi hoặc bị ngắt quãng, bot vẫn trả được một câu ngắn gồm “điều đã xác định”, “điều chưa xác định”, và “đầu mối liên hệ”. Với chatbot sinh viên, fallback kiểu này tốt hơn nhiều so với lỗi 500 hoặc trả lời bịa.

Về rate limit, thay vì phụ thuộc hoàn toàn vào giới hạn của nhà cung cấp mô hình, bạn nên áp thêm **quota nội bộ** ở gateway. Một cấu hình thực dụng là: giới hạn theo IP hoặc session, giới hạn burst ngắn hạn, circuit breaker khi upstream timeout liên tiếp, hàng đợi ngắn cho các truy vấn retrieval đắt, và degrade sang chế độ ngắn khi tải cao. Vì báo cáo này không dùng nguồn ngoài về nhà cung cấp mô hình, các con số cụ thể nên do bạn đo trong môi trường thật, nhưng nguyên tắc là phải có quota riêng cho `FAQ`, `RAG medium`, `RAG heavy`, và `admin test`.

Về caching, nên tách ít nhất ba loại:
- **FAQ semantic cache** cho các câu hỏi lặp lại như hotline, học phí ngành, giờ làm việc phòng ban.
- **Document cache** cho các trang chính thức đã crawl và parse.
- **High-volatility notice cache** cho khu tuyển sinh/học phí/thông báo đang nóng.

Một cấu hình hợp lý là: FAQ cache dài hơn; trang phòng ban cache trung bình; còn trang tuyển sinh, học phí, lịch hoặc thông báo đang mùa cao điểm thì refresh dày hơn. Về nguyên tắc, tài liệu dạng cẩm nang hoặc trang chức năng phòng ban có thể cache lâu hơn; còn bài “thông báo/quyết định” thì phải gắn timestamp, version và chính sách revalidate ngắn hơn.

Về quyền riêng tư dữ liệu sinh viên, bot nên chia dữ liệu làm ba lớp:
- **Dữ liệu công khai**: trang phòng ban, ngành, học bổng, quy định chung.
- **Dữ liệu nội bộ không nhạy cảm**: lịch công tác nội bộ hoặc tệp FAQ riêng, nếu sau này bạn có connector nội bộ.
- **Dữ liệu nhạy cảm cá nhân**: mã sinh viên, điểm, lịch sử học tập, thông tin tài chính, giấy tờ.

Chỉ lớp đầu tiên mới được trả lời tự do. Với lớp thứ ba, chatbot phải yêu cầu xác thực qua hệ thống chuyên dụng; nếu chưa có xác thực thì chỉ được hướng dẫn đầu mối và quy trình.

Một lưu ý triển khai rất thực tế là website hiện có vài **không nhất quán nhẹ về biểu diễn dữ liệu**, ví dụ tên đơn vị “Khoa Công nghệ thông tin” so với breadcrumb “Khoa Toán - Tin học”, hay cách hiển thị đơn vị hành chính trong địa chỉ. Vì vậy, tầng retrieval và intent normalization phải dùng alias map, không nên dùng chuỗi cứng thuần túy. citeturn33view0turn35view0turn36view0turn5view2

### Lộ trình phát triển

```mermaid
gantt
    title Lộ trình xây chatbot TLU
    dateFormat  YYYY-MM-DD
    section Khảo sát và thiết kế
    Chốt taxonomy intent, truth hierarchy, routing matrix :a1, 2026-06-01, 7d
    Soạn super prompt và prompt templates               :a2, after a1, 5d

    section Dữ liệu và RAG
    Crawl + parse trang chính thức, Sổ tay, trang ngành :b1, after a2, 10d
    Chuẩn hóa metadata, alias, timestamp, source rank   :b2, after b1, 6d
    Xây semantic cache và retriever                     :b3, after b2, 6d

    section Ứng dụng
    Tích hợp API gateway, classifier, answer engine     :c1, after b3, 10d
    Xây fallback chain và hậu kiểm an toàn              :c2, after c1, 5d

    section Kiểm thử
    Tạo bộ test 100+ case theo intent                   :d1, after c2, 7d
    Chạy UAT với sinh viên và cán bộ học vụ             :d2, after d1, 7d

    section Ra mắt
    Soft launch nội bộ                                  :e1, after d2, 5d
    Tối ưu latency, cache, analytics                    :e2, after e1, 7d
```

Nếu triển khai nghiêm túc, bản chatbot đầu tiên nên chỉ giải quyết cực tốt khoảng **10–12 intent lõi** trước: tuyển sinh, ngành, học phí, đăng ký học, thi lại/học cải thiện, cảnh báo học tập, chuyển ngành/bảo lưu, học bổng, thư viện, e-learning, CNTT, và liên hệ phòng ban. Sau khi các intent này đạt chất lượng cao, bạn mới nên mở rộng sang CLB, hoạt động đời sống, hướng nghiệp, và các nội dung truyền thông mềm hơn. Cách đi này phù hợp hơn nhiều với cấu trúc thông tin mà website TLU hiện đang cung cấp. citeturn7view0turn16view3turn19view0turn20view5turn26view0turn26view1turn6view6