import { NextResponse } from 'next/server';
import { BOT_GUESS_PRESETS } from '@/lib/botArtist';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const apiKey = body.apiKey || process.env.GEMINI_API_KEY;
    const imageBase64 = body.imageBase64 || '';
    const scenario = body.scenario || 'Vụ án bóc phốt bí ẩn';
    const botName = body.botName || 'AI Bot';
    const targetName = body.targetName || 'Bị cáo';

    if (apiKey) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        const promptText = `Bạn là người chơi mang tên "${botName}" trong party game suy luận hài hước "Tòa Án Bóc Phốt".
Cáo trạng vụ án đang xét xử: "${scenario}".
Bị cáo "${targetName}" vừa tự tay vẽ bản phác họa này để làm bằng chứng ngoại phạm chối tội.
Hãy quan sát thật kỹ các nét vẽ trong hình (đối tượng, hình người que, đồ vật, biểu cảm, tư thế...).
Dựa vào những gì bạn THỰC SỰ NHÌN THẤY trong bức tranh, hãy đưa ra 1 lời đoán xem tên này đang làm gì để chối tội một cách cực kỳ hài hước, dí dỏm, bựa đời.

Quy tắc bắt buộc:
1. Chỉ trả lời duy nhất 1 câu ngắn gọn (từ 5 đến 18 từ tiếng Việt).
2. Bắt đầu bằng từ "Đang..." (hoặc hành động trực tiếp), ví dụ: "Đang trèo tường trốn nợ rách cả quần", "Đang trùm chăn ôm mèo giả vờ ngủ say", "Đang lén ăn vụng rồi đổ tội cho con chó".
3. Tuyệt đối không thêm dấu ngoặc kép, không giải thích, không chào hỏi.`;

        // Check if image is PNG base64
        const isPng = imageBase64.includes('data:image/png;base64,');
        const isSvg = imageBase64.includes('data:image/svg+xml');

        const parts: any[] = [];

        if (isPng) {
          const pureBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
          parts.push({
            inlineData: {
              mimeType: 'image/png',
              data: pureBase64,
            },
          });
          parts.push({ text: promptText });
        } else if (isSvg) {
          // Decode SVG text for Gemini
          try {
            const svgContent = decodeURIComponent(
              imageBase64.replace(/^data:image\/svg\+xml;utf8,/, '')
            );
            parts.push({
              text: `Mã vector SVG của bức tranh bị cáo vẽ:\n${svgContent.slice(
                0,
                1500
              )}\n\n${promptText}`,
            });
          } catch {
            parts.push({ text: promptText });
          }
        } else {
          parts.push({ text: promptText });
        }

        const res = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts }],
            generationConfig: {
              temperature: 0.95,
              maxOutputTokens: 120,
            },
          }),
        });

        if (res.ok) {
          const data = await res.json();
          let rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
          let cleanGuess = rawText
            .replace(/["“”«»`]/g, '')
            .replace(/\n/g, ' ')
            .trim();

          if (cleanGuess.length > 5) {
            // Trim to max 120 chars
            cleanGuess = cleanGuess.slice(0, 120).trim();
            return NextResponse.json({
              guess: cleanGuess,
              source: 'gemini_vision',
              botName,
            });
          }
        }
      } catch (geminiErr) {
        console.error('Gemini bot-guess vision error:', geminiErr);
      }
    }

    // Fallback: Pick a funny scenario-flavored preset
    const randomPreset =
      BOT_GUESS_PRESETS[Math.floor(Math.random() * BOT_GUESS_PRESETS.length)];

    return NextResponse.json({
      guess: randomPreset,
      source: 'fallback',
      botName,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Error generating bot guess' },
      { status: 500 }
    );
  }
}
