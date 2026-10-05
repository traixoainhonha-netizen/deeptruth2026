export type ChapterItem = { title: string; body: string };
export type ChapterGroup = { heading: string; items: ChapterItem[] };
export type Chapter = { no: number; title: string; groups: ChapterGroup[]; note?: { label: string; text: string } };

export const chapters: Chapter[] = [
  {
    no: 1,
    title: "Bản chất của công nghệ Deepfake",
    groups: [{
      heading: "Bản chất của công nghệ Deepfake",
      items: [
        { title: "Deepfake là gì?", body: "Deepfake là thuật ngữ kết hợp giữa \"Deep learning\" (học sâu) và \"Fake\" (giả mạo). Đây là kỹ thuật tổng hợp hình ảnh, video hoặc giọng nói của con người dựa trên các thuật toán AI tiên tiến như GANs (Mạng đối nghịch tạo sinh), Diffusion Models và Autoencoders, cho phép hoán đổi khuôn mặt hoặc mô phỏng thanh âm với độ chân thực ngày càng tinh vi." },
        { title: "Các cấp độ giả mạo phổ biến hiện nay", body: "Bao gồm: (1) Face Swap - Hoán đổi mặt người trên video gốc; (2) Lip-Sync - Đồng bộ khẩu hình chuyển động khớp với âm thanh bất kỳ; (3) Voice Cloning - Nhân bản giọng nói chỉ từ 3 giây dữ liệu mẫu; và (4) Toàn bộ cơ thể tạo mới (Full Synthesis Avatar)." },
        { title: "Mục đích tấn công chủ yếu", body: "Trong môi trường học đường, Deepfake chủ yếu bị lợi dụng để lừa đảo chuyển tiền học phí, tống tiền bằng hình ảnh cắt ghép nhạy cảm (NCII), bôi nhọ uy tín giáo viên hoặc bắt nạt trực tuyến giữa các nhóm học sinh." },
      ],
    }],
  },
  {
    no: 2,
    title: "Dấu hiệu nhận biết qua Thị giác và Âm thanh",
    groups: [
      {
        heading: "Dấu hiệu nhận biết qua Thị giác",
        items: [
          { title: "Vùng mắt và nhịp chớp mắt", body: "Người thật chớp mắt trung bình 15-20 lần mỗi phút một cách tự nhiên. Trong video Deepfake kém chất lượng, đối tượng thường không chớp mắt hoặc chớp mắt quá nhanh/chậm bất thường. Đồng thời, bóng phản chiếu trong hai con ngươi không đồng hướng." },
          { title: "Viền khuôn mặt, tai và chân tóc", body: "Khi đối tượng quay nghiêng đầu nhanh, thuật toán AI thường bị mất dấu (tracking loss), gây ra hiện tượng mờ nhòe, nhấp nháy (flickering) hoặc vết răng cưa quanh đường viền hàm, mang tai và mép tóc." },
          { title: "Răng và chuyển động của miệng", body: "AI thường gặp khó khăn khi mô phỏng cấu trúc hàm răng riêng rẽ. Răng của đối tượng Deepfake hay trông như một dải trắng phẳng liền khối, thiếu bóng đổ kẽ răng tự nhiên hoặc màu răng không tự nhiên." },
          { title: "Bàn tay và cử chỉ ngón tay", body: "Người thật chớp mắt trung bình 15-20 lần mỗi phút một cách tự nhiên. Trong video Deepfake kém chất lượng, đối tượng thường không chớp mắt hoặc chớp mắt quá nhanh/chậm bất thường. Đồng thời, bóng phản chiếu trong hai con ngươi không đồng hướng." },
        ],
      },
      {
        heading: "Dấu hiệu nhận biết qua Âm thanh",
        items: [
          { title: "Thiếu âm thở tự nhiên", body: "Khi con người nói chuyện liên tục, phổi cần lấy hơi tạo ra tiếng thở nhẹ. Giọng đọc do AI tạo ra thường nói liền một mạch cơ học hoặc chèn âm thở ngẫu nhiên sai vị trí ngắt câu." },
          { title: "Ngữ điệu phẳng và âm kim loại", body: "Giọng nói nhân bản khó thể hiện được những biến thiên cảm xúc phức tạp như run rẩy vì lo lắng, cười đùa chân thật hay ngữ điệu địa phương mộc mạc. Thường xuất hiện âm rè kim loại (metallic artifacts) ở cuối câu." },
          { title: "Lệch đồng bộ khẩu hình (Audio-Visual Desync)", body: "Giọng nói nhân bản khó thể hiện được những biến thiên cảm xúc phức tạp như run rẩy vì lo lắng, cười đùa chân thật hay ngữ điệu địa phương mộc mạc. Thường xuất hiện âm rè kim loại (metallic artifacts) ở cuối câu." },
        ],
      },
    ],
  },
  {
    no: 3,
    title: "Quy tắc Phòng ngừa \"3 Giây & 2 Kênh\"",
    groups: [{
      heading: "Quy tắc Phòng ngừa \"3 Giây & 2 Kênh\"",
      items: [
        { title: "Quy tắc 3 Giây Tĩnh lặng", body: "Khi nhận được bất kỳ cuộc gọi video khẩn cấp nào yêu cầu chuyển tiền hay mượn đồ, hãy dừng lại 3 giây hít thở sâu, không để sự sợ hãi hoặc lòng trắc ẩn thôi thúc chuyển khoản ngay lập tức." },
        { title: "Xác thực qua Kênh Độc lập thứ 2", body: "Tắt cuộc gọi video nghi vấn ngay và dùng một kênh liên lạc khác: Gọi trực tiếp vào số SIM điện thoại chính thức đã lưu, liên lạc qua người thân trong gia đình hoặc gặp mặt trực tiếp." },
        { title: "Đặt câu hỏi bí mật cá nhân (Security Challenge)", body: "Hỏi đối phương một câu chuyện chỉ hai người biết: \"Lần trước chúng ta ăn trưa ở quán nào?\", \"Tên giáo viên chủ nhiệm cấp 2 của cậu là gì?\". Kẻ sử dụng Deepfake sẽ ấp úng và tự ngắt máy." },
        { title: "Bảo vệ dữ liệu sinh trắc học cá nhân", body: "Hạn chế đăng tải các đoạn video cận cảnh độ phân giải cao có góc quay rõ nét khuôn mặt và các bản thu âm giọng nói dài trên chế độ công khai mạng xã hội." },
      ],
    }],
  },
  {
    no: 4,
    title: "Khung Pháp lý & Chế tài tại Việt Nam",
    groups: [{
      heading: "Khung Pháp lý & Chế tài tại Việt Nam",
      items: [
        { title: "Nghị định 15/2020/NĐ-CP & Nghị định 14/2021/NĐ-CP", body: "Phạt tiền từ 10.000.000 đến 20.000.000 đồng đối với hành vi lợi dụng mạng xã hội để cung cấp, chia sẻ thông tin giả mạo, thông tin sai sự thật, xuyên tạc, vu khống, xúc phạm uy tín của cơ quan, tổ chức, danh dự, nhân phẩm của cá nhân." },
        { title: "Điều 288 Bộ luật Hình sự 2015 (Sửa đổi 2017)", body: "Tội đưa hoặc sử dụng trái phép thông tin mạng máy tính, mạng viễn thông có thể bị phạt tù từ 06 tháng đến 07 năm tù tùy theo mức độ thiệt hại và tính chất thu lợi bất chính." },
        { title: "Điều 155 & 156 Bộ luật Hình sự", body: "Tội làm nhục người khác hoặc Tội vu khống: Cố ý sử dụng công nghệ Deepfake để cắt ghép hình ảnh nhạy cảm bôi nhọ người khác có thể bị truy cứu trách nhiệm hình sự với mức phạt tù lên đến 05 năm." },
      ],
    }],
    note: { label: "Lưu ý pháp lý:", text: "Nạn nhân của các vụ việc cắt ghép ảnh/video nhạy cảm có quyền yêu cầu cơ quan công an vào cuộc giám định kỹ thuật số và được bảo vệ thông tin cá nhân tuyệt đối theo quy định của pháp luật." },
  },
];
