/**
 * Bot Artist Helpers: Generates funny procedural sketch dataURLs and absurd alibi guesses
 */

export const BOT_GUESS_PRESETS = [
  'Đang cầm gậy định đi bắt trộm chó nhà hàng xóm',
  'Đang ngồi gấp 1000 con hạc giấy cầu người yêu cũ bị sâu răng',
  'Đang trốn nợ dưới gầm giường nhưng lỡ chân đá vào thùng mì tôm',
  'Đang đứng hình ngoài ban công ngắm mưa diễn cảnh MV Sơn Tùng',
  'Đang ngủ gật trong giờ họp online nhưng giả vờ đơ webcam',
  'Đang mải cãi nhau sống chết với con mèo đầu ngõ',
  'Đang bay lên cung trăng bằng chổi quét nhà của bà ngoại',
  'Đang ngồi thiền đếm từng hạt cơm trong bát để tu tâm',
  'Đang lén lút ăn vụng nửa nồi lẩu xong đổ tội cho con chó',
  'Đang cố giải cứu thế giới khỏi bầy quái vật trà sữa',
  'Đang đi tìm ví tiền bị mất nhưng thực ra là đã tiêu hết sạch',
  'Đang tập nhảy hip-hop dưỡng sinh với các cụ ngoài công viên',
];

export const FUNNY_GUESS_SUGGESTIONS = [
  'Đang giả vờ bị mất trí nhớ tạm thời để quỵt 50k',
  'Đang đứng cãi lý với cái cột điện vì bị va vào đầu',
  'Đang ngồi soi gương tự khen bản thân đẹp trai 3 tiếng đồng hồ',
  'Đang bay lượn trên sao Hỏa bằng đĩa bay làm từ nắp nồi cơm điện',
  'Đang chạy trốn deadline bằng cách đắp chăn giả chết',
  'Đang pha trà sữa trân châu bằng nước mắm truyền thống',
  'Đang hóa trang thành cây chuối để trốn nợ tiền nhà',
  'Đang đi xin chữ ký của người ngoài hành tinh',
];

// Procedural sketch generator for bots (creates a unique funny canvas drawing)
export function generateBotSketch(botName: string, promptIndex: number): string {
  if (typeof window === 'undefined') return '';

  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 400;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background
  ctx.fillStyle = '#fdfbf7';
  ctx.fillRect(0, 0, 400, 400);

  // Border & Grid
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  for (let x = 20; x < 400; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 400);
    ctx.stroke();
  }
  for (let y = 20; y < 400; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(400, y);
    ctx.stroke();
  }

  // Draw doodle based on bot style
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const themes = [
    // Theme 0: Stickman sleeping in bed
    () => {
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 6;
      // Bed
      ctx.strokeRect(60, 220, 280, 80);
      ctx.fillStyle = '#fde047';
      ctx.fillRect(65, 225, 270, 70);
      // Pillow
      ctx.strokeStyle = '#e11d48';
      ctx.strokeRect(80, 200, 60, 30);
      // Sleeping head
      ctx.strokeStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(110, 180, 25, 0, Math.PI * 2);
      ctx.stroke();
      // ZZZ
      ctx.fillStyle = '#2563eb';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText('Z', 170, 150);
      ctx.font = 'bold 32px sans-serif';
      ctx.fillText('Z', 210, 120);
      ctx.font = 'bold 40px sans-serif';
      ctx.fillText('z', 260, 90);
    },
    // Theme 1: Stickman running with tea / money
    () => {
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 6;
      // Head
      ctx.beginPath();
      ctx.arc(200, 100, 30, 0, Math.PI * 2);
      ctx.stroke();
      // Body
      ctx.beginPath();
      ctx.moveTo(200, 130);
      ctx.lineTo(200, 240);
      // Legs running
      ctx.lineTo(140, 330);
      ctx.moveTo(200, 240);
      ctx.lineTo(260, 310);
      ctx.lineTo(310, 290);
      // Arms
      ctx.moveTo(200, 170);
      ctx.lineTo(130, 150);
      ctx.lineTo(110, 100);
      ctx.moveTo(200, 170);
      ctx.lineTo(270, 180);
      ctx.lineTo(320, 140);
      ctx.stroke();
      // Stolen Cup of Milk Tea
      ctx.strokeStyle = '#d97706';
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.moveTo(310, 130);
      ctx.lineTo(350, 130);
      ctx.lineTo(340, 190);
      ctx.lineTo(320, 190);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Straw
      ctx.strokeStyle = '#e11d48';
      ctx.beginPath();
      ctx.moveTo(330, 130);
      ctx.lineTo(330, 90);
      ctx.stroke();
    },
    // Theme 2: Alien UFO abducting
    () => {
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 6;
      // UFO Dome
      ctx.beginPath();
      ctx.arc(200, 100, 40, Math.PI, 0);
      ctx.stroke();
      // UFO Saucer
      ctx.strokeStyle = '#7c3aed';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.ellipse(200, 100, 100, 30, 0, 0, Math.PI * 2);
      ctx.stroke();
      // Light beam
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(140, 120);
      ctx.lineTo(60, 350);
      ctx.moveTo(260, 120);
      ctx.lineTo(340, 350);
      ctx.stroke();
      ctx.setLineDash([]);
      // Tiny Cow being lifted
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 4;
      ctx.strokeRect(170, 210, 60, 35);
      ctx.beginPath();
      ctx.arc(160, 220, 12, 0, Math.PI * 2);
      ctx.stroke();
    },
    // Theme 3: Meditating zen stickman
    () => {
      ctx.strokeStyle = '#059669';
      ctx.lineWidth = 6;
      // Head
      ctx.beginPath();
      ctx.arc(200, 120, 30, 0, Math.PI * 2);
      ctx.stroke();
      // Body
      ctx.beginPath();
      ctx.moveTo(200, 150);
      ctx.lineTo(200, 240);
      // Crossed Legs
      ctx.moveTo(150, 280);
      ctx.lineTo(250, 280);
      ctx.stroke();
      // Namaste hands
      ctx.beginPath();
      ctx.moveTo(200, 180);
      ctx.lineTo(180, 210);
      ctx.lineTo(200, 200);
      ctx.lineTo(220, 210);
      ctx.lineTo(200, 180);
      ctx.stroke();
      // Lotus flower
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(200, 315, 12, 0, Math.PI * 2);
      ctx.fill();
    },
  ];

  const selectedTheme = themes[promptIndex % themes.length];
  selectedTheme();

  // Signature
  ctx.fillStyle = '#64748b';
  ctx.font = 'italic 12px sans-serif';
  ctx.fillText(`Tác phẩm của: ${botName}`, 20, 385);

  return canvas.toDataURL('image/png', 0.8);
}
