import { NextResponse } from 'next/server';

const FALLBACK_CATEGORIES = [
  'Vấn Nạn Công Sở',
  'Gia Đình & Bạn Bè',
  'Đời Sống Tình Cảm',
  'Tài Chính & Nợ Nần',
  'Thói Quen Ngủ Nghê',
  'Mạng Xã Hội Ảo',
  'Ẩm Thực & Ăn Uống',
  'Deadline & Học Tập',
];

const FALLBACK_WHO = [
  'Ai là người',
  'Ai có khả năng cao nhất',
  'Trong phòng này, ai dám cá cược sẽ là người',
  'Ai sẽ là kẻ đầu tiên',
];

const FALLBACK_ACTIONS = [
  'vay 100k mua trà sữa rồi 3 tháng sau giả vờ quên tiệt',
  'nhắn tin "Tao đang dắt xe ra ngõ" nhưng thực chất vừa mới bật dậy khỏi giường',
  'ngủ gật trong giờ họp online nhưng vẫn kịp bấm mở mic nói "Em đồng ý với ý kiến của sếp"',
  'đi ăn lẩu chỉ rình gắp miếng ba chỉ bò cuối cùng rồi vờ quay đi chỗ khác',
  'than hết tiền cả ngày nhưng shipper cứ 1 tiếng gọi giao 2 đơn hàng đồ vô dụng',
  'seen tin nhắn từ màn hình khóa, lờ đi rồi 3 tuần sau mới rep: "Ủa tao quên mất"',
  'bấm nhầm gửi ảnh dìm hàng của đồng nghiệp vào chính nhóm chat có sếp',
  'đặt 15 cái báo thức từ 6h sáng để cho cả xóm thức còn bản thân vẫn ngáy khò khò',
  'luôn tư vấn tình cảm dài 8 trang A4 cho người khác dù bản thân độc thân 20 năm',
  'sống sót cuối cùng qua đại dịch Zombie vì... quá lười không thèm bước chân ra khỏi phòng ngủ',
  'đi xem mắt mà vờ đau bụng để trốn về sớm vì đối phương không bao bill',
  'đóng tiền tập gym 1 năm nhưng chỉ đi đúng ngày đầu chụp 800 tấm ảnh sống ảo',
];

const FALLBACK_PENALTIES = [
  'Tự nguyện chuyển khoản 10k cho người bên phải ghi nội dung "Tiền chuộc lỗi"',
  'Khai báo từ khóa tìm kiếm kỳ lạ nhất trong lịch sử Google 3 ngày gần đây',
  'Hát 1 đoạn thiếu nhi bằng giọng Opera cải lương trầm đục',
  'Chụp ảnh biểu cảm mặt xấu xí nhất có thể gửi vào nhóm chung',
  'Làm động tác người máy hết pin trong 10 giây trước camera',
  'Khen người mình ghét nhất trong phòng bằng 3 câu thật lòng',
  'Tự nhận mình là "Chúa Tể Lươn Lẹo Vô Địch Thiên Hạ"',
];

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const apiKey = body.apiKey || process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const promptInstruction = `Bạn là biên kịch hài hước kiêm thẩm phán của web party game "TÒA ÁN BÓC PHỐT".
Hãy sáng tạo 1 tình huống cáo trạng bóc phốt mới tinh, cực kỳ dí dỏm, châm biếm sâu cay và gắn liền với đời sống thực tế giới trẻ Việt Nam (công sở, bạn thân, tình yêu, nợ nần, giờ cao su, trà sữa, lướt tiktok nửa đêm, sống ảo...).

Yêu cầu định dạng bắt buộc là JSON thuần túy (không markdown, không bọc \`\`\`json):
{
  "category": "Tên chủ đề ngắn gọn (vd: Giờ Cao Su, Nghiện Mua Sắm...)",
  "title": "Tiêu đề giật gân (vd: Kẻ Đánh Cắp Thời Gian)",
  "scenario": "Câu hỏi bóc phốt mở đầu bằng 'Ai là người...' hoặc 'Ai có nguy cơ...'",
  "dramaticTag": "Tội Danh: ...",
  "penalties": [
    "Hình phạt meme 1 cụ thể",
    "Hình phạt meme 2 cụ thể",
    "Hình phạt meme 3 cụ thể"
  ]
}`;

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        const res = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: promptInstruction }],
              },
            ],
            generationConfig: {
              temperature: 0.95,
              topP: 0.95,
              maxOutputTokens: 600,
            },
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
          const cleanedText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

          const parsed = JSON.parse(cleanedText);
          if (parsed.scenario && parsed.title) {
            return NextResponse.json({
              id: `ai-prompt-${Date.now()}`,
              category: parsed.category || 'Vụ Án AI Tạo',
              title: parsed.title,
              scenario: parsed.scenario,
              dramaticTag: parsed.dramaticTag || 'Tội Danh: Khó Dung Thứ',
              penalties: parsed.penalties || FALLBACK_PENALTIES.slice(0, 3),
              isAiGenerated: true,
            });
          }
        }
      } catch (geminiErr) {
        console.warn('Gemini API call failed, falling back to algorithmic generator:', geminiErr);
      }
    }

    // Algorithmic Fallback Generator (guaranteed unique & fresh combinations)
    const category =
      FALLBACK_CATEGORIES[Math.floor(Math.random() * FALLBACK_CATEGORIES.length)];
    const who = FALLBACK_WHO[Math.floor(Math.random() * FALLBACK_WHO.length)];
    const action = FALLBACK_ACTIONS[Math.floor(Math.random() * FALLBACK_ACTIONS.length)];
    const shuffledPenalties = [...FALLBACK_PENALTIES].sort(() => 0.5 - Math.random());

    return NextResponse.json({
      id: `algo-prompt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      category,
      title: `Vụ Án: ${category}`,
      scenario: `${who} ${action}?`,
      dramaticTag: `Tội Danh: Gây Rạn Nứt Tình Bạn`,
      penalties: shuffledPenalties.slice(0, 3),
      isAiGenerated: false,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Error generating prompt' },
      { status: 500 }
    );
  }
}
