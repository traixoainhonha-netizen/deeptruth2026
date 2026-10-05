import v1 from "@/assets/vs11.mp4.asset.json";
import v2 from "@/assets/v18.mp4.asset.json";
import v3 from "@/assets/vs14.mp4.asset.json";
import i4 from "@/assets/IMG_7011.png.asset.json";
import i5 from "@/assets/IMG_7015.jpeg.asset.json";
import i6 from "@/assets/IMG_7024.png.asset.json";

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
  kind: "image" | "video" | "audio";
  media?: string;
  transcript?: string;
  prompt: string;
  answer: "real" | "fake";
  explain: string;
};

const sign = "Dấu hiệu nhận biết:\n";

export const quiz: QuizItem[] = [
  {
    kind: "video",
    media: v1.url,
    prompt: "Video 1 này là thật hay giả?",
    answer: "fake",
    explain: sign +
      "- Sự mất tự nhiên trong chuyển động của cơ mặt: Vùng miệng và các cơ quanh má khi cử động trông hơi cứng, thiếu sự linh hoạt và biến đổi cơ học tự nhiên của con người.\n" +
      "- Độ tương phản và ánh sáng vùng mặt: Khuôn mặt có độ sáng hoặc tông màu hơi chênh lệch nhẹ so với phần cổ và bối cảnh xung quanh, tạo cảm giác gương mặt được 'đắp' vào khung hình.\n" +
      "- Hiệu ứng mờ nhòe viền (Blending artifacts): Khi nhân vật có các chuyển động nhỏ, phần viền tiếp giáp giữa cằm, quai hàm và cổ đôi khi xuất hiện hiện tượng nhòe mờ hoặc gợn sóng đặc trưng của công nghệ hoán đổi khuôn mặt.",
  },
  {
    kind: "video",
    media: v2.url,
    prompt: "Video 2 này là thật hay giả?",
    answer: "real",
    explain: "Đây là video THẬT: biểu cảm khuôn mặt tự nhiên, cơ mặt và khẩu hình chuyển động linh hoạt, ánh sáng trên mặt đồng nhất với cổ và bối cảnh, không có hiện tượng nhòe viền hay rung lệch khi nhân vật cử động.",
  },
  {
    kind: "video",
    media: v3.url,
    prompt: "Video 3 này là thật hay giả?",
    answer: "fake",
    explain: sign +
      "- Tần suất chớp mắt và hướng nhìn bất thường: Nhân vật có thể chớp mắt rất ít hoặc gần như mở trừng trừng trong suốt khoảng thời gian ngắn, khiến ánh mắt trở nên vô hồn, thiếu sự sống động tự nhiên.\n" +
      "- Độ trễ chuyển động (Lag/Jitter): Khi đầu hoặc cơ thể thay đổi góc độ, khung hình khuôn mặt có độ bắt nhịp chậm hơn hoặc bị rung nhẹ so với phần thân, làm lộ rõ ranh giới xử lý của thuật toán AI.\n" +
      "- Độ chi tiết da mặt: Vùng da trên mặt quá mịn màng, làm mất đi các nếp nhăn nhỏ hoặc độ nhám tự nhiên thường thấy ở da thật khi quay cận cảnh.",
  },
  {
    kind: "image",
    media: i4.url,
    prompt: "Ảnh 4 này là thật hay giả?",
    answer: "fake",
    explain: sign +
      "- Sự lệch pha về ánh sáng và góc chiếu: Nguồn sáng trên khuôn mặt không khớp hoàn toàn với chiều chiếu sáng tổng thể của bối cảnh và phần cơ thể bên dưới.\n" +
      "- Lỗi ở đường viền tiếp giáp: Khu vực quanh tai, tóc xuất hiện vết viền mờ, nhòe hoặc răng cưa do thuật toán ghép nối không khớp hoàn toàn với tỉ lệ đầu.\n" +
      "- Tỷ lệ kích thước đầu so với khung xương: Kích thước và cấu trúc của phần đầu (khuôn mặt và mái tóc) không tương xứng hoàn toàn với bề rộng của vai và vóc dáng tổng thể của cơ thể, tạo cảm giác đầu được ghép vào thân bị gượng gạo, mất tự nhiên.",
  },
  {
    kind: "image",
    media: i5.url,
    prompt: "Ảnh 5 này là thật hay giả?",
    answer: "real",
    explain: "Đây là ảnh THẬT: ánh sáng sân khấu chiếu lên khuôn mặt, cổ và trang phục nhất quán; tỷ lệ đầu và cơ thể cân đối; tóc, khuyên tai và viền mặt sắc nét, hòa hợp tự nhiên với bối cảnh phía sau.",
  },
  {
    kind: "image",
    media: i6.url,
    prompt: "Ví dụ 6 này là thật hay giả?",
    answer: "fake",
    explain: sign +
      "- Sự lệch lạc tỷ lệ giữa đầu và thân: Kích thước đầu và cấu trúc khuôn mặt trông hơi lớn, không đồng bộ hoàn toàn với độ rộng của vai và vóc dáng tổng thể bên dưới.\n" +
      "- Lỗi ở ranh giới vùng cổ: Vùng da cổ và phần tiếp giáp với cổ áo có sự đứt gãy về sắc độ và bóng đổ, do thuật toán ghép nối không hòa hợp hoàn toàn với nguồn sáng chiếu lên áo.\n" +
      "- Độ sắc nét và hạt ảnh chênh lệch: Khuôn mặt có độ mịn và kết cấu da khác biệt rõ rệt so với phần da tay và chất liệu trang phục, tố cáo việc đầu được ghép vào một khung thân có sẵn.\n" +
      "- Sự liên kết với nền ảnh: Chủ thể trông như bị 'dán' áp lên phía trước, hoàn toàn tách rời khỏi không gian và chiều sâu của bối cảnh đồng lúa phía sau.",
  },
];

export function levelFor(score: number, total: number) {
  const r = score / total;
  if (r === 1) return { label: "Chuyên gia săn Deepfake", note: "Xuất sắc! Bạn có con mắt cực kỳ tinh tường. Hãy chia sẻ kiến thức với bạn bè nhé!" };
  if (r >= 0.6) return { label: "Cảnh giác tốt", note: "Bạn đã nắm được nhiều dấu hiệu quan trọng. Ôn lại Chương 2 để hoàn hảo hơn." };
  return { label: "Cần nâng cao nhận thức", note: "Đừng lo! Hãy đọc Cẩm nang và thử lại — mỗi lần luyện tập là một lần an toàn hơn." };
}
