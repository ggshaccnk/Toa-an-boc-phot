import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const apiKey = body.apiKey || process.env.GEMINI_API_KEY;
    const scenario = body.scenario || 'Đang bận làm việc mờ ám';
    const botName = body.botName || 'AI Bot';

    if (apiKey) {
      try {
        const promptInstruction = `Bạn là họa sĩ pháp đình Bot mang tên "${botName}" trong web party game hài hước "Tòa Án Bóc Phốt".
Cáo trạng vụ án: "${scenario}".
Nhiệm vụ của bạn là vẽ một bức tranh phác họa doodle (phong cách tranh vẽ tay nguệch ngoạc của trẻ con hoặc người que) thể hiện hành động chối tội / tạo bằng chứng ngoại phạm buồn cười cho vụ án này.

Hãy tạo MÃ SVG HOÀN CHỈNH nằm trong thẻ <svg viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">...</svg>.
Yêu cầu kỹ thuật bắt buộc:
1. KHÔNG có hình nền (nền trong suốt), để các nét vẽ hiển thị trên nền giấy kẻ của game.
2. Vẽ bằng các đường nét doodle: dùng các thẻ <circle>, <path>, <line>, <rect>, <ellipse>, <text>.
3. Nét vẽ dày dặn: stroke="#0f172a", stroke-width="10" hoặc "12", stroke-linecap="round", stroke-linejoin="round", fill="none" (hoặc fill màu sắc đơn giản: đỏ #dc2626, xanh #2563eb, vàng #d97706, xanh lá #059669).
4. Vẽ rõ ràng một nhân vật người que hoặc biểu cảm mặt hài hước đang làm một hành động dở khóc dở cười liên quan đến vụ án.
5. Có thể thêm 1 bong bóng thoại hoặc text ngắn (font-family="sans-serif", font-weight="bold", fill="#0f172a"): ví dụ "Em vô tội!", "Zzz...", "Không phải em!".
6. CHỈ TRẢ VỀ DUY NHẤT MÃ NGUỒN SVG. Không dùng thẻ markdown \`\`\`xml hoặc \`\`\`svg, không có lời dẫn.`;

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
              temperature: 0.9,
              maxOutputTokens: 1200,
            },
          }),
        });

        if (res.ok) {
          const data = await res.json();
          let rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
          rawText = rawText
            .replace(/```xml/g, '')
            .replace(/```svg/g, '')
            .replace(/```/g, '')
            .trim();

          // Check if valid SVG
          if (rawText.includes('<svg') && rawText.includes('</svg>')) {
            const svgStart = rawText.indexOf('<svg');
            const svgEnd = rawText.lastIndexOf('</svg>') + 6;
            const cleanSvg = rawText.substring(svgStart, svgEnd);

            // Encode as SVG Data URI
            const svgDataUri = `data:image/svg+xml;utf8,${encodeURIComponent(
              cleanSvg
            )}`;

            return NextResponse.json({
              sketchData: svgDataUri,
              source: 'gemini',
              botName,
            });
          }
        }
      } catch (geminiErr) {
        console.error('Gemini bot-draw error:', geminiErr);
      }
    }

    // Fallback: Generate a quirky procedural SVG sketch if API key missing or error
    const fallbackSvg = `
<svg viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
  <circle cx="400" cy="280" r="90" stroke="#0f172a" stroke-width="12" fill="#fff" stroke-linecap="round"/>
  <circle cx="370" cy="260" r="12" fill="#0f172a"/>
  <circle cx="430" cy="260" r="12" fill="#0f172a"/>
  <path d="M 370 320 Q 400 350 430 320" stroke="#dc2626" stroke-width="10" fill="none" stroke-linecap="round"/>
  <line x1="400" y1="370" x2="400" y2="580" stroke="#0f172a" stroke-width="14" stroke-linecap="round"/>
  <line x1="400" y1="430" x2="280" y2="490" stroke="#0f172a" stroke-width="12" stroke-linecap="round"/>
  <line x1="400" y1="430" x2="520" y2="400" stroke="#0f172a" stroke-width="12" stroke-linecap="round"/>
  <line x1="400" y1="580" x2="310" y2="720" stroke="#0f172a" stroke-width="14" stroke-linecap="round"/>
  <line x1="400" y1="580" x2="490" y2="720" stroke="#0f172a" stroke-width="14" stroke-linecap="round"/>
  <rect x="520" y="340" width="130" height="90" rx="20" stroke="#2563eb" stroke-width="10" fill="#eff6ff"/>
  <text x="585" y="395" font-family="sans-serif" font-size="28" font-weight="black" fill="#1e3a8a" text-anchor="middle">OAN QUÁ!</text>
  <path d="M 230 460 Q 250 430 290 470" stroke="#d97706" stroke-width="8" fill="none"/>
</svg>`.trim();

    const fallbackDataUri = `data:image/svg+xml;utf8,${encodeURIComponent(
      fallbackSvg
    )}`;

    return NextResponse.json({
      sketchData: fallbackDataUri,
      source: 'fallback',
      botName,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Error generating bot sketch' },
      { status: 500 }
    );
  }
}
