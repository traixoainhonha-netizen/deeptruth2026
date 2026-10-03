import q1 from "@/assets/q1.jpg";
import q2 from "@/assets/q2.jpg";
import q3 from "@/assets/q3.jpg";
import q4 from "@/assets/q4.jpg";

export const chapters = [
  {
    no: 1,
    title: "Cẩm nang Toàn diện về Công nghệ Deepfake",
    points: [
      "Deepfake là nội dung (ảnh, video, giọng nói) do AI tạo ra hoặc chỉnh sửa để giả mạo một người thật.",
      "Công nghệ cốt lõi: mạng đối nghịch tạo sinh (GAN), mô hình khuếch tán và mô hình nhân bản giọng nói.",
      "Chỉ cần vài giây ghi âm hoặc vài tấm ảnh công khai, kẻ xấu đã có thể tạo bản giả khá thuyết phục.",
      "Rủi ro phổ biến: lừa đảo chuyển tiền, bôi nhọ danh dự, tin giả, bắt nạt học đường.",
    ],
  },
  {
    no: 2,
    title: "Dấu hiệu nhận biết qua Thị giác và Âm thanh",
    points: [
      "Khuôn mặt: da quá mịn, viền mặt mờ hoặc nhòe, ánh sáng trên mặt không khớp với nền.",
      "Mắt & miệng: chớp mắt bất thường, khẩu hình không khớp lời nói, răng bị dính khối.",
      "Chi tiết nhỏ: tai, tóc, kính, khuyên tai bị méo hoặc không đối xứng; chữ trên nền bị biến dạng.",
      "Âm thanh: giọng đều đều thiếu cảm xúc, ngắt nghỉ lạ, tiếng nền bị cắt đột ngột.",
    ],
  },
  {
    no: 3,
    title: "Quy tắc phòng ngừa 3 Giây & 2 Kênh",
    points: [
      "3 GIÂY: Dừng lại ít nhất 3 giây trước khi tin, chia sẻ hoặc chuyển tiền — cảm xúc gấp gáp là mồi của kẻ lừa đảo.",
      "2 KÊNH: Luôn xác minh lại qua một kênh khác (gọi số điện thoại quen, gặp trực tiếp, hỏi người thân).",
      "Đặt “mật khẩu gia đình” để kiểm tra khi có cuộc gọi khẩn cấp.",
      "Hạn chế đăng ảnh, video, giọng nói rõ nét ở chế độ công khai.",
    ],
  },
  {
    no: 4,
    title: "Khung Pháp lý & Chế tài tại Việt Nam",
    points: [
      "Luật An ninh mạng 2018 nghiêm cấm đăng tải thông tin sai sự thật, xúc phạm danh dự người khác.",
      "Nghị định 13/2023/NĐ-CP bảo vệ dữ liệu cá nhân — hình ảnh, giọng nói là dữ liệu cá nhân.",
      "Bộ luật Hình sự: tội Lừa đảo chiếm đoạt tài sản (Điều 174), Làm nhục người khác (Điều 155), Vu khống (Điều 156).",
      "Nạn nhân có quyền trình báo công an và yêu cầu gỡ bỏ nội dung giả mạo.",
    ],
  },
];

export type QuizItem = {
  kind: "image" | "audio";
  media?: string;
  transcript?: string;
  prompt: string;
  answer: "real" | "fake";
  explain: string;
};

export const quiz: QuizItem[] = [
  {
    kind: "image",
    media: q1,
    prompt: "Bức ảnh chụp ở sân trường này là thật hay giả?",
    answer: "real",
    explain: "Ảnh có độ nhòe chuyển động tự nhiên, tóc bay lộn xộn, nền có nhiều chi tiết nhất quán — đặc trưng của ảnh chụp thật.",
  },
  {
    kind: "image",
    media: q2,
    prompt: "Ảnh chân dung này là thật hay giả?",
    answer: "fake",
    explain: "Hai khuyên tai khác nhau, chữ ở nền bị biến dạng, da mịn như sáp và tóc hòa lẫn vào nền — dấu hiệu ảnh do AI tạo ra.",
  },
  {
    kind: "image",
    media: q3,
    prompt: "Cuộc gọi video từ “chị gái” nhờ chuyển tiền gấp. Thật hay giả?",
    answer: "fake",
    explain: "Viền mặt bị vỡ điểm ảnh, màu da mặt và cổ không khớp, khẩu hình thiếu tự nhiên. Hãy áp dụng quy tắc 2 Kênh: gọi lại số quen!",
  },
  {
    kind: "audio",
    transcript:
      "“Alo con à, mẹ đây… mẹ đang ở bệnh viện… con chuyển ngay 20 triệu vào số tài khoản này nhé… đừng gọi lại, mẹ không nghe được đâu.” (giọng đều đều, không có tiếng ồn bệnh viện)",
    prompt: "Đoạn ghi âm cuộc gọi này là thật hay giả?",
    answer: "fake",
    explain: "Giọng đều thiếu cảm xúc, tạo áp lực gấp gáp, cấm gọi lại và yêu cầu chuyển tiền vào tài khoản lạ — kịch bản lừa đảo bằng giọng nói AI kinh điển.",
  },
  {
    kind: "image",
    media: q4,
    prompt: "Ảnh ông cụ đọc báo ở quán trà đá là thật hay giả?",
    answer: "real",
    explain: "Nếp nhăn, kết cấu da, ánh sáng và bóng đổ đồng nhất. Tuy vậy, ảnh AI ngày càng tinh vi — luôn kiểm tra nguồn gốc ảnh nhé!",
  },
];

export function levelFor(score: number, total: number) {
  const r = score / total;
  if (r === 1) return { label: "Chuyên gia săn Deepfake", note: "Xuất sắc! Bạn có con mắt cực kỳ tinh tường. Hãy chia sẻ kiến thức với bạn bè nhé!" };
  if (r >= 0.6) return { label: "Cảnh giác tốt", note: "Bạn đã nắm được nhiều dấu hiệu quan trọng. Ôn lại Chương 2 để hoàn hảo hơn." };
  return { label: "Cần nâng cao nhận thức", note: "Đừng lo! Hãy đọc Cẩm nang và thử lại — mỗi lần luyện tập là một lần an toàn hơn." };
}
