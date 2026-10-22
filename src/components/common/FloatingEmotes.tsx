'use client';

import React, { useRef } from 'react';
import { FloatingReaction } from '@/types/party';
import { partyAudio } from '@/lib/partyAudio';
import { IconGavel } from '@/components/common/FlatIcons';

interface FloatingEmotesProps {
  reactions: FloatingReaction[];
  onSendReaction: (stickerText: string) => void;
  rightSlot?: React.ReactNode;
}

export interface ComicSticker {
  id: string;
  text: string;
  subtext: string;
  bg: string;
  textColor: string;
  border: string;
  shadow: string;
  renderDoodle: () => React.ReactNode;
}

export const COMIC_STICKERS: ComicSticker[] = [
  {
    id: 'oan_qua',
    text: 'OAN QUÁ!',
    subtext: 'Oan Thị Kính',
    bg: 'bg-rose-500',
    textColor: 'text-white',
    border: 'border-rose-950',
    shadow: 'shadow-pop-red',
    renderDoodle: () => (
      <svg viewBox="0 0 40 40" className="w-5 h-5 fill-none shrink-0">
        <circle cx="20" cy="20" r="16" fill="#FECDD3" stroke="#18181B" strokeWidth="2.5" />
        <path d="M 12,18 Q 16,14 20,18" stroke="#18181B" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 20,18 Q 24,14 28,18" stroke="#18181B" strokeWidth="2.5" strokeLinecap="round" />
        <ellipse cx="20" cy="28" rx="5" ry="6" fill="#18181B" />
        <path d="M 12,22 L 8,30 M 28,22 L 32,30" stroke="#0284C7" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'lat_mat',
    text: 'LẬT MẶT!',
    subtext: 'Bánh tráng nướng',
    bg: 'bg-yellow-400',
    textColor: 'text-slate-950',
    border: 'border-slate-950',
    shadow: 'shadow-pop-yellow',
    renderDoodle: () => (
      <svg viewBox="0 0 40 40" className="w-5 h-5 fill-none shrink-0">
        <circle cx="20" cy="20" r="16" fill="#FEF08A" stroke="#18181B" strokeWidth="2.5" />
        <path d="M 8,20 Q 20,32 32,20" stroke="#18181B" strokeWidth="3" strokeLinecap="round" />
        <circle cx="14" cy="15" r="2.5" fill="#18181B" />
        <path d="M 23,13 L 29,17 M 29,13 L 23,17" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'xao_vua',
    text: 'XẠO VỪA!',
    subtext: 'Mũi dài Pinocchio',
    bg: 'bg-amber-400',
    textColor: 'text-slate-950',
    border: 'border-amber-950',
    shadow: 'shadow-pop-sm',
    renderDoodle: () => (
      <svg viewBox="0 0 40 40" className="w-5 h-5 fill-none shrink-0">
        <circle cx="18" cy="20" r="14" fill="#FED7AA" stroke="#18181B" strokeWidth="2.5" />
        <path d="M 28,20 L 38,20" stroke="#EA580C" strokeWidth="4" strokeLinecap="round" />
        <circle cx="14" cy="16" r="2" fill="#18181B" />
        <path d="M 12,26 Q 16,30 20,26" stroke="#18181B" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'phan_doi',
    text: 'PHẢN ĐỐI!',
    subtext: 'Objection! Đập bàn',
    bg: 'bg-red-600',
    textColor: 'text-white',
    border: 'border-slate-950',
    shadow: 'shadow-pop-red',
    renderDoodle: () => (
      <svg viewBox="0 0 40 40" className="w-5 h-5 fill-none shrink-0">
        <polygon points="20,4 25,15 36,15 28,23 31,34 20,27 9,34 12,23 4,15 15,15" fill="#FEE2E2" stroke="#FFFFFF" strokeWidth="2" />
        <path d="M 20,12 L 20,22 M 20,26 L 20,27" stroke="#991B1B" strokeWidth="3" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'no_kia',
    text: 'NÓ KÌA!',
    subtext: 'Chỉ tay 5 ngón',
    bg: 'bg-rose-600',
    textColor: 'text-white',
    border: 'border-slate-950',
    shadow: 'shadow-pop-red',
    renderDoodle: () => (
      <svg viewBox="0 0 40 40" className="w-5 h-5 fill-none shrink-0">
        <path d="M 6,20 L 26,20 L 34,20" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />
        <polygon points="26,14 36,20 26,26" fill="#FFFFFF" stroke="#18181B" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    id: 'tra_tien',
    text: 'TRẢ TIỀN!',
    subtext: '50k trà sữa',
    bg: 'bg-emerald-500',
    textColor: 'text-slate-950',
    border: 'border-emerald-950',
    shadow: 'shadow-pop-sm',
    renderDoodle: () => (
      <svg viewBox="0 0 40 40" className="w-5 h-5 fill-none shrink-0">
        <circle cx="20" cy="20" r="15" fill="#BBF7D0" stroke="#18181B" strokeWidth="2.5" />
        <text x="14" y="26" fontFamily="sans-serif" fontSize="16" fontWeight="900" fill="#047857">$</text>
      </svg>
    ),
  },
  {
    id: 'hong_bien',
    text: 'HÓNG BIẾN!',
    subtext: 'Cắn miếng bắp rang',
    bg: 'bg-purple-600',
    textColor: 'text-white',
    border: 'border-purple-950',
    shadow: 'shadow-pop-sm',
    renderDoodle: () => (
      <svg viewBox="0 0 40 40" className="w-5 h-5 fill-none shrink-0">
        <ellipse cx="14" cy="20" rx="8" ry="12" fill="#FFFFFF" stroke="#18181B" strokeWidth="2" />
        <ellipse cx="26" cy="20" rx="8" ry="12" fill="#FFFFFF" stroke="#18181B" strokeWidth="2" />
        <circle cx="15" cy="20" r="4" fill="#18181B" />
        <circle cx="27" cy="20" r="4" fill="#18181B" />
      </svg>
    ),
  },
  {
    id: 'luon_leo',
    text: 'LƯƠN LẸO!',
    subtext: 'Chúa tể trốn nợ',
    bg: 'bg-teal-500',
    textColor: 'text-white',
    border: 'border-teal-950',
    shadow: 'shadow-pop-sm',
    renderDoodle: () => (
      <svg viewBox="0 0 40 40" className="w-5 h-5 fill-none shrink-0">
        <path d="M 8,28 Q 16,8 24,24 T 36,12" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />
        <circle cx="34" cy="11" r="2" fill="#18181B" />
      </svg>
    ),
  },
  {
    id: 'vo_tri',
    text: 'VÔ TRI!',
    subtext: 'Mặt ngây thơ vô tội',
    bg: 'bg-sky-400',
    textColor: 'text-slate-950',
    border: 'border-sky-950',
    shadow: 'shadow-pop-sm',
    renderDoodle: () => (
      <svg viewBox="0 0 40 40" className="w-5 h-5 fill-none shrink-0">
        <ellipse cx="20" cy="8" rx="14" ry="4" stroke="#FBBF24" strokeWidth="3" />
        <circle cx="20" cy="24" r="12" fill="#E0F2FE" stroke="#18181B" strokeWidth="2" />
        <circle cx="16" cy="22" r="2" fill="#18181B" />
        <circle cx="24" cy="22" r="2" fill="#18181B" />
        <ellipse cx="20" cy="29" rx="3" ry="1.5" stroke="#18181B" strokeWidth="2" fill="none" />
      </svg>
    ),
  },
  {
    id: 'dinh_chau',
    text: 'DÍNH CHẤU!',
    subtext: 'Tòa gõ búa tuyên án',
    bg: 'bg-orange-500',
    textColor: 'text-white',
    border: 'border-orange-950',
    shadow: 'shadow-pop-orange',
    renderDoodle: () => (
      <svg viewBox="0 0 40 40" className="w-5 h-5 fill-none shrink-0">
        <circle cx="20" cy="20" r="14" stroke="#FFFFFF" strokeWidth="3" strokeDasharray="3 3" />
        <line x1="12" y1="12" x2="28" y2="28" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
        <line x1="28" y1="12" x2="12" y2="28" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'kho_tho',
    text: 'KHÓ THỞ!',
    subtext: 'Trúng tim đen rịn mồ hôi',
    bg: 'bg-indigo-600',
    textColor: 'text-white',
    border: 'border-indigo-950',
    shadow: 'shadow-pop-sm',
    renderDoodle: () => (
      <svg viewBox="0 0 40 40" className="w-5 h-5 fill-none shrink-0">
        <circle cx="20" cy="20" r="15" fill="#E0E7FF" stroke="#18181B" strokeWidth="2.5" />
        <line x1="13" y1="18" x2="17" y2="18" stroke="#18181B" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="23" y1="18" x2="27" y2="18" stroke="#18181B" strokeWidth="2.5" strokeLinecap="round" />
        <ellipse cx="20" cy="26" rx="4" ry="2" stroke="#18181B" strokeWidth="2" />
        <path d="M 28,14 Q 31,18 28,22" stroke="#38BDF8" strokeWidth="2.5" fill="#38BDF8" />
      </svg>
    ),
  },
  {
    id: 'bang_chung',
    text: 'BẰNG CHỨNG?',
    subtext: 'Nói có sách mách có chứng',
    bg: 'bg-blue-600',
    textColor: 'text-white',
    border: 'border-blue-950',
    shadow: 'shadow-pop-sm',
    renderDoodle: () => (
      <svg viewBox="0 0 40 40" className="w-5 h-5 fill-none shrink-0">
        <circle cx="18" cy="18" r="10" stroke="#FFFFFF" strokeWidth="3" />
        <line x1="25" y1="25" x2="35" y2="35" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'choi_di',
    text: 'CHỐI ĐI!',
    subtext: 'Chối cãi vô ích',
    bg: 'bg-pink-600',
    textColor: 'text-white',
    border: 'border-pink-950',
    shadow: 'shadow-pop-sm',
    renderDoodle: () => (
      <svg viewBox="0 0 40 40" className="w-5 h-5 fill-none shrink-0">
        <circle cx="20" cy="20" r="15" fill="#FCE7F3" stroke="#18181B" strokeWidth="2" />
        <path d="M 12,24 Q 20,16 28,24" stroke="#BE185D" strokeWidth="3" strokeLinecap="round" />
        <circle cx="15" cy="16" r="2.5" fill="#18181B" />
        <circle cx="25" cy="16" r="2.5" fill="#18181B" />
      </svg>
    ),
  },
  {
    id: 'cuoi_ia',
    text: 'CƯỜI ỈA!',
    subtext: 'Cười té ghế đứt ruột',
    bg: 'bg-yellow-300',
    textColor: 'text-slate-950',
    border: 'border-slate-950',
    shadow: 'shadow-pop-yellow',
    renderDoodle: () => (
      <svg viewBox="0 0 40 40" className="w-5 h-5 fill-none shrink-0">
        <circle cx="20" cy="20" r="15" fill="#FEF9C3" stroke="#18181B" strokeWidth="2" />
        <path d="M 11,18 L 17,21 M 29,18 L 23,21" stroke="#18181B" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 12,23 Q 20,34 28,23 Z" fill="#DC2626" stroke="#18181B" strokeWidth="2" />
      </svg>
    ),
  },
  {
    id: 'co_toi',
    text: 'CÓ TỘI!',
    subtext: 'Đóng dấu đỏ tử hình',
    bg: 'bg-rose-700',
    textColor: 'text-white',
    border: 'border-slate-950',
    shadow: 'shadow-pop-red',
    renderDoodle: () => (
      <svg viewBox="0 0 40 40" className="w-5 h-5 fill-none shrink-0">
        <rect x="6" y="8" width="28" height="24" rx="4" stroke="#FFFFFF" strokeWidth="2.5" strokeDasharray="4 2" />
        <path d="M 12,14 L 28,26 M 28,14 L 12,26" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'vo_toi',
    text: 'VÔ TỘI!',
    subtext: 'Được tha bổng trong sạch',
    bg: 'bg-emerald-600',
    textColor: 'text-white',
    border: 'border-emerald-950',
    shadow: 'shadow-pop-sm',
    renderDoodle: () => (
      <svg viewBox="0 0 40 40" className="w-5 h-5 fill-none shrink-0">
        <circle cx="20" cy="20" r="15" fill="#D1FAE5" stroke="#FFFFFF" strokeWidth="2.5" />
        <polyline points="12,21 17,26 28,14" stroke="#065F46" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export const FloatingEmotes: React.FC<FloatingEmotesProps> = ({
  reactions,
  onSendReaction,
  rightSlot,
}) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const handleStickerClick = (sticker: ComicSticker) => {
    partyAudio.playEmotePop();
    onSendReaction(sticker.text);
  };

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const offset = direction === 'left' ? -220 : 220;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Floating Animated Reaction Sprites */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {reactions.map((r) => {
          const matchedSticker =
            COMIC_STICKERS.find((s) => s.text === r.emoji) || COMIC_STICKERS[0];

          return (
            <div
              key={r.id}
              style={{
                left: `${r.x}%`,
                bottom: '120px',
              }}
              className="absolute flex flex-col items-center animate-float-up pointer-events-none select-none"
            >
              {/* Comic Soundbite Sticker Bubble */}
              <div
                className={`px-3 py-1.5 rounded-2xl border-[2.5px] border-slate-900 ${matchedSticker.bg} ${matchedSticker.textColor} ${matchedSticker.shadow} flex items-center gap-2 transform -rotate-3 filter drop-shadow-md`}
              >
                {matchedSticker.renderDoodle()}
                <div className="text-left leading-none">
                  <span className="font-display font-black text-xs md:text-sm uppercase tracking-wider block">
                    {r.emoji}
                  </span>
                  <span className="text-[9px] font-bold opacity-80 block mt-0.5">
                    {matchedSticker.subtext}
                  </span>
                </div>
              </div>

              {/* Sender Name Badge */}
              <span className="mt-1 px-2 py-0.5 bg-black/85 text-white text-[10px] font-bold rounded-full backdrop-blur-sm whitespace-nowrap shadow-pop-sm border border-white/20">
                {r.senderName}
              </span>
            </div>
          );
        })}
      </div>

      {/* Expanded & Renamed: HỘI ĐỒNG PHẢN ỨNG PHÁP ĐÌNH (Comic Reaction Dock + Right Slot) */}
      <div className="fixed bottom-3 left-1/2 transform -translate-x-1/2 z-40 w-[96vw] max-w-5xl flex items-center justify-center gap-2 pointer-events-none">
        <div className="flex-1 min-w-0 bg-white/95 backdrop-blur-md border-[2.5px] border-slate-900 rounded-3xl shadow-pop p-2 sm:p-2.5 flex items-center gap-2 pointer-events-auto overflow-hidden">
          {/* Title Badge on the Left */}
          <div className="hidden lg:flex items-center gap-2 pl-2 pr-3 border-r-2 border-slate-300 shrink-0 select-none">
            <div className="w-8 h-8 rounded-xl bg-amber-400 border-2 border-slate-900 flex items-center justify-center shadow-pop-sm shrink-0">
              <IconGavel className="w-4 h-4 text-slate-950" />
            </div>
            <div className="text-left leading-tight">
              <span className="text-[11px] font-black uppercase text-slate-950 tracking-wide block font-display">
                HỘI ĐỒNG PHẢN ỨNG
              </span>
              <span className="text-[9px] font-bold text-slate-500 block">
                Biểu cảm &amp; Tiếng lòng tức thì
              </span>
            </div>
          </div>

          {/* Left Scroll Button */}
          <button
            type="button"
            onClick={() => handleScroll('left')}
            className="hidden sm:flex w-7 h-7 bg-slate-100 hover:bg-slate-200 border-2 border-slate-900 rounded-xl items-center justify-center font-black text-xs shrink-0 cursor-pointer shadow-pop-sm active:translate-y-0.5"
            title="Cuộn sang trái"
          >
            &larr;
          </button>

          {/* Scrollable Reaction Buttons Rail (Lengthened to 16 Stickers) */}
          <div
            ref={scrollRef}
            className="flex-1 flex items-center gap-2 overflow-x-auto scroll-smooth py-1 px-0.5 no-scrollbar"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {COMIC_STICKERS.map((sticker) => (
              <button
                key={sticker.id}
                type="button"
                onClick={() => handleStickerClick(sticker)}
                className={`px-3 py-1.5 rounded-xl border-[2px] border-slate-900 ${sticker.bg} ${sticker.textColor} ${sticker.shadow} hover:-translate-y-1 active:translate-y-0.5 transition-all flex items-center gap-1.5 shrink-0 select-none cursor-pointer`}
                title={sticker.subtext}
              >
                {sticker.renderDoodle()}
                <div className="text-left leading-tight">
                  <span className="font-display font-black text-[11px] uppercase tracking-wide whitespace-nowrap block">
                    {sticker.text}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Right Scroll Button */}
          <button
            type="button"
            onClick={() => handleScroll('right')}
            className="hidden sm:flex w-7 h-7 bg-slate-100 hover:bg-slate-200 border-2 border-slate-900 rounded-xl items-center justify-center font-black text-xs shrink-0 cursor-pointer shadow-pop-sm active:translate-y-0.5"
            title="Cuộn sang phải"
          >
            &rarr;
          </button>
        </div>

        {/* Right Beside the Emote Bar: Floating Chat Bubble Slot */}
        {rightSlot && (
          <div className="shrink-0 pointer-events-auto">
            {rightSlot}
          </div>
        )}
      </div>
    </>
  );
};
