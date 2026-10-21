'use client';

import React from 'react';
import { FloatingReaction } from '@/types/party';
import { partyAudio } from '@/lib/partyAudio';

interface FloatingEmotesProps {
  reactions: FloatingReaction[];
  onSendReaction: (stickerText: string) => void;
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
    id: 'no_kia',
    text: 'NÓ KÌA!',
    subtext: 'Chỉ tay 5 ngón',
    bg: 'bg-red-600',
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
    text: 'TRẢ TIỀN ĐI!',
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
    id: 'vo_tri',
    text: 'VÔ TRI!',
    subtext: 'Mặt ngây thơ vô số tội',
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
    subtext: 'Tòa tuyên án rồi',
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
];

export const FloatingEmotes: React.FC<FloatingEmotesProps> = ({
  reactions,
  onSendReaction,
}) => {
  const handleStickerClick = (sticker: ComicSticker) => {
    partyAudio.playEmotePop();
    onSendReaction(sticker.text);
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

      {/* Comic Sticker Reaction Toolbar */}
      <div className="fixed bottom-3 left-1/2 transform -translate-x-1/2 z-40 bg-white/95 backdrop-blur-md border-[2.5px] border-slate-900 rounded-3xl shadow-pop p-1.5 sm:p-2 max-w-[95vw] overflow-x-auto">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="hidden md:flex flex-col text-left pl-2 pr-1 border-r-2 border-slate-300">
            <span className="text-[10px] font-black uppercase text-slate-800 tracking-wider">
              KHẨU NGỮ BÓC PHỐT
            </span>
            <span className="text-[9px] font-semibold text-slate-500">
              Spam phản ứng tức thì
            </span>
          </div>

          {COMIC_STICKERS.map((sticker) => (
            <button
              key={sticker.id}
              type="button"
              onClick={() => handleStickerClick(sticker)}
              className={`px-2.5 py-1.5 rounded-xl border-[2px] border-slate-900 ${sticker.bg} ${sticker.textColor} ${sticker.shadow} hover:-translate-y-1 active:translate-y-0.5 transition-all flex items-center gap-1.5 shrink-0 select-none cursor-pointer`}
            >
              {sticker.renderDoodle()}
              <span className="font-display font-black text-[11px] uppercase tracking-wide whitespace-nowrap">
                {sticker.text}
              </span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
};
