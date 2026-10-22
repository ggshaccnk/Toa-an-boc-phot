'use client';

import React from 'react';
import { AlibiCard } from '@/types/party';
import { partyAudio } from '@/lib/partyAudio';
import {
  DoodleMirror,
  DoodlePointing,
  DoodleDice,
  DoodleDog,
  DoodleBomb,
  DoodleSwap,
  DoodleMegaphone,
  DoodleScale,
  DoodlePen,
  WashiTape,
} from '@/components/common/HandDoodles';

interface PaperCardProps {
  card: AlibiCard;
  isPlayable?: boolean;
  isSelected?: boolean;
  isCompact?: boolean;
  rotation?: number;
  onPlay?: (card: AlibiCard) => void;
  className?: string;
}

export const PaperCard: React.FC<PaperCardProps> = ({
  card,
  isPlayable = true,
  isSelected = false,
  isCompact = false,
  rotation = 0,
  onPlay,
  className = '',
}) => {
  const getIllustrationDoodle = (iconName: string) => {
    switch (iconName) {
      case 'mirror':
        return <DoodleMirror className="w-8 h-8" />;
      case 'bomb':
        return <DoodleBomb className="w-8 h-8" />;
      case 'swap':
        return <DoodleSwap className="w-8 h-8" />;
      case 'pointing':
        return <DoodlePointing className="w-8 h-8" />;
      case 'dog':
        return <DoodleDog className="w-8 h-8" />;
      case 'dice':
        return <DoodleDice className="w-8 h-8" />;
      case 'megaphone':
        return <DoodleMegaphone className="w-8 h-8" />;
      case 'pen':
        return <DoodlePen className="w-8 h-8" />;
      case 'scale':
        return <DoodleScale className="w-8 h-8" />;
      case 'moon':
        return (
          <svg viewBox="0 0 100 100" className="w-8 h-8 fill-none">
            <path d="M 40,15 C 68,15 85,38 85,62 C 85,82 72,92 56,92 C 76,82 78,48 50,30 C 42,25 32,24 25,25 C 28,19 34,15 40,15 Z" fill="#0D9488" stroke="#18181B" strokeWidth="4" />
            <circle cx="28" cy="48" r="2.5" fill="#18181B" />
            <circle cx="70" cy="20" r="3" fill="#FDE047" />
          </svg>
        );
      case 'heart':
        return (
          <svg viewBox="0 0 100 100" className="w-8 h-8 fill-none">
            <path d="M 50,32 C 38,12 12,24 16,50 C 20,70 50,90 50,90 C 50,90 80,70 84,50 C 88,24 62,12 50,32 Z" fill="#F43F5E" stroke="#18181B" strokeWidth="4.5" strokeLinejoin="round" />
            <path d="M 28,34 C 24,38 24,44 26,48" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
          </svg>
        );
      case 'shield':
        return (
          <svg viewBox="0 0 100 100" className="w-8 h-8 fill-none">
            <path d="M 50,14 L 84,24 L 84,56 C 84,76 50,90 50,90 C 50,90 16,76 16,56 L 16,24 Z" fill="#F59E0B" stroke="#18181B" strokeWidth="4.5" strokeLinejoin="round" />
            <line x1="50" y1="24" x2="50" y2="78" stroke="#18181B" strokeWidth="3.5" />
            <line x1="28" y1="46" x2="72" y2="46" stroke="#18181B" strokeWidth="3.5" />
          </svg>
        );
      case 'masks':
        return (
          <svg viewBox="0 0 100 100" className="w-8 h-8 fill-none">
            <ellipse cx="40" cy="50" rx="26" ry="34" fill="#C084FC" stroke="#18181B" strokeWidth="4" />
            <circle cx="32" cy="44" r="3.5" fill="#18181B" />
            <circle cx="48" cy="44" r="3.5" fill="#18181B" />
            <path d="M 28,64 Q 40,74 52,64" stroke="#18181B" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M 64,30 Q 78,50 64,74" stroke="#7C3AED" strokeWidth="4" strokeLinecap="round" />
          </svg>
        );
      case 'laptop':
        return (
          <svg viewBox="0 0 100 100" className="w-8 h-8 fill-none">
            <rect x="22" y="24" width="56" height="42" rx="4" fill="#38BDF8" stroke="#18181B" strokeWidth="4" />
            <line x1="12" y1="74" x2="88" y2="74" stroke="#18181B" strokeWidth="5" strokeLinecap="round" />
            <text x="36" y="52" fontFamily="monospace" fontSize="16" fontWeight="bold" fill="#0369A1">&gt;_</text>
          </svg>
        );
      case 'crying':
        return (
          <svg viewBox="0 0 100 100" className="w-8 h-8 fill-none">
            <circle cx="50" cy="50" r="36" fill="#CBD5E1" stroke="#18181B" strokeWidth="4" />
            <path d="M 32,44 Q 38,38 44,44" stroke="#18181B" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M 56,44 Q 62,38 68,44" stroke="#18181B" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M 36,68 Q 50,56 64,68" stroke="#18181B" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M 34,50 L 32,70 M 66,50 L 68,70" stroke="#0284C7" strokeWidth="3.5" strokeLinecap="round" />
          </svg>
        );
      case 'burger':
        return (
          <svg viewBox="0 0 100 100" className="w-8 h-8 fill-none">
            <path d="M 20,44 C 20,24 80,24 80,44 Z" fill="#FBBF24" stroke="#18181B" strokeWidth="4" />
            <rect x="18" y="50" width="64" height="8" rx="2" fill="#22C55E" stroke="#18181B" strokeWidth="3.5" />
            <rect x="16" y="60" width="68" height="10" rx="3" fill="#991B1B" stroke="#18181B" strokeWidth="4" />
            <path d="M 22,74 L 78,74 C 78,86 22,86 22,74 Z" fill="#FBBF24" stroke="#18181B" strokeWidth="4" />
          </svg>
        );
      default:
        // Default quirky hand-drawn doodle star badge
        return (
          <svg viewBox="0 0 100 100" className="w-8 h-8 fill-none">
            <polygon
              points="50,12 62,36 88,40 68,60 74,86 50,72 26,86 32,60 12,40 38,36"
              fill="#FDE047"
              stroke="#18181B"
              strokeWidth="4"
              strokeLinejoin="round"
            />
            <circle cx="50" cy="50" r="4" fill="#DC2626" />
          </svg>
        );
    }
  };

  const categoryColorStyles: Record<string, { bg: string; badge: string; border: string }> = {
    chaos: {
      bg: 'bg-rose-50',
      badge: 'bg-rose-500 text-white',
      border: 'border-rose-900',
    },
    alibi: {
      bg: 'bg-blue-50',
      badge: 'bg-blue-600 text-white',
      border: 'border-slate-900',
    },
    blame_shift: {
      bg: 'bg-amber-50',
      badge: 'bg-amber-500 text-slate-950',
      border: 'border-amber-900',
    },
    absurd: {
      bg: 'bg-emerald-50',
      badge: 'bg-emerald-600 text-white',
      border: 'border-emerald-950',
    },
    custom: {
      bg: 'bg-yellow-50',
      badge: 'bg-yellow-400 text-slate-950',
      border: 'border-slate-900',
    },
  };

  const styleConfig = categoryColorStyles[card.category] || categoryColorStyles.alibi;

  const handleMouseEnter = () => {
    if (isPlayable) {
      partyAudio.playCardHover();
    }
  };

  const handleClick = () => {
    if (isPlayable && onPlay) {
      partyAudio.playCardPlay();
      onPlay(card);
    }
  };

  if (isCompact) {
    return (
      <div
        className={`px-3 py-2 bg-white border-2 border-slate-900 rounded-xl shadow-pop-sm flex items-center gap-2 select-none ${className}`}
      >
        <div className="p-1 rounded-lg bg-slate-100 border border-slate-900 shrink-0">
          {getIllustrationDoodle(card.illustration)}
        </div>
        <div className="overflow-hidden">
          <p className="text-xs font-black text-slate-900 truncate">{card.title}</p>
          <p className="text-[10px] font-medium text-slate-600 truncate">{card.tagline}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      style={{
        transform: `rotate(${isSelected ? 0 : rotation}deg)`,
      }}
      className={`relative group w-52 md:w-56 rounded-2xl bg-white border-[2.5px] border-slate-900 select-none transition-all duration-200 cursor-pointer overflow-hidden ${
        isSelected
          ? '-translate-y-4 shadow-pop-lg ring-4 ring-yellow-400'
          : 'hover:-translate-y-3 hover:rotate-0 shadow-pop hover:shadow-pop-lg'
      } ${className}`}
    >
      {/* Category Header */}
      <div
        className={`px-3 py-1.5 border-b-[2px] border-slate-900 flex items-center justify-between font-black text-[10px] tracking-wider uppercase ${styleConfig.badge}`}
      >
        <span>{card.badgeText}</span>
        {card.category === 'chaos' && (
          <span className="px-1.5 py-0.2 bg-black text-white text-[8px] rounded">HỖN LOẠN</span>
        )}
        {card.authorName && (
          <span className="px-1.5 py-0.2 bg-white text-slate-900 text-[8px] rounded border border-black font-bold">
            TÁC GIẢ: {card.authorName}
          </span>
        )}
      </div>

      {/* Card Content Body */}
      <div className={`p-3.5 flex flex-col justify-between h-[270px] ${styleConfig.bg}`}>
        {/* Top Header & Illustration Box */}
        <div>
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className="text-sm font-black text-slate-900 leading-snug tracking-tight font-display uppercase">
              {card.title}
            </h4>
            <div className="w-11 h-11 shrink-0 rounded-xl bg-white border-2 border-slate-900 shadow-pop-sm flex items-center justify-center p-1">
              {getIllustrationDoodle(card.illustration)}
            </div>
          </div>

          {/* Quote Tagline */}
          <div className="px-2 py-1 bg-white/95 border border-dashed border-slate-700 rounded-lg mb-2">
            <p className="text-[11px] font-semibold italic text-slate-700 leading-tight">
              &ldquo;{card.tagline}&rdquo;
            </p>
          </div>
        </div>

        {/* Defense Argument Description */}
        <div className="p-2.5 bg-white border-[1.5px] border-slate-900 rounded-xl shadow-pop-sm">
          <p className="text-xs text-slate-800 leading-relaxed font-medium">
            {card.description}
          </p>
        </div>

        {/* Action Button CTA */}
        {isPlayable && (
          <button
            type="button"
            className={`w-full py-2 mt-2 rounded-xl border-2 border-slate-900 font-black text-xs uppercase tracking-wide transition-colors shadow-pop-sm flex items-center justify-center gap-1.5 ${
              isSelected
                ? 'bg-yellow-400 text-slate-950 font-black'
                : 'bg-white hover:bg-yellow-300 text-slate-900'
            }`}
          >
            {isSelected ? '[✓ ĐÃ CHỌN LÁ NÀY]' : '[DÙNG BÀO CHỮA]'}
          </button>
        )}
      </div>
    </div>
  );
};
