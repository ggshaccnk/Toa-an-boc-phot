'use client';

import React from 'react';
import { AVATAR_PRESETS } from '@/data/avatars';

interface DoodleAvatarProps {
  avatarId: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isBusted?: boolean;
  isSpeaking?: boolean;
  isGuiltyLook?: boolean;
  className?: string;
  badge?: string;
}

export const DoodleAvatar: React.FC<DoodleAvatarProps> = ({
  avatarId,
  size = 'md',
  isBusted = false,
  isSpeaking = false,
  isGuiltyLook = false,
  className = '',
  badge,
}) => {
  const preset = AVATAR_PRESETS.find((p) => p.id === avatarId) || AVATAR_PRESETS[0];

  const sizeStyles = {
    sm: 'w-12 h-12 text-xs',
    md: 'w-16 h-16 text-sm',
    lg: 'w-24 h-24 text-base',
    xl: 'w-32 h-32 text-lg',
  };

  const renderFace = () => {
    switch (preset.svgType) {
      case 'cat':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full fill-current">
            {/* Cat Ears */}
            <polygon points="20,40 32,12 48,35" fill="#FACC15" stroke="#18181B" strokeWidth="3.5" strokeLinejoin="round" />
            <polygon points="25,36 33,18 43,33" fill="#F87171" opacity="0.6" />
            <polygon points="80,40 68,12 52,35" fill="#FACC15" stroke="#18181B" strokeWidth="3.5" strokeLinejoin="round" />
            <polygon points="75,36 67,18 57,33" fill="#F87171" opacity="0.6" />
            {/* Head */}
            <circle cx="50" cy="58" r="38" fill="#FEF08A" stroke="#18181B" strokeWidth="3.5" />
            {/* Glasses / Lawyer Spectacles */}
            <rect x="25" y="46" width="20" height="15" rx="4" fill="none" stroke="#18181B" strokeWidth="3" />
            <rect x="55" y="46" width="20" height="15" rx="4" fill="none" stroke="#18181B" strokeWidth="3" />
            <line x1="45" y1="53" x2="55" y2="53" stroke="#18181B" strokeWidth="3" />
            {/* Eyes */}
            {isGuiltyLook ? (
              <>
                <circle cx="37" cy="53" r="3" fill="#18181B" />
                <circle cx="67" cy="53" r="3" fill="#18181B" />
              </>
            ) : (
              <>
                <circle cx="34" cy="53" r="4" fill="#18181B" />
                <circle cx="64" cy="53" r="4" fill="#18181B" />
                <circle cx="35" cy="51" r="1.5" fill="#FFFFFF" />
                <circle cx="65" cy="51" r="1.5" fill="#FFFFFF" />
              </>
            )}
            {/* Nose & Whiskers */}
            <polygon points="48,64 52,64 50,67" fill="#F87171" />
            <line x1="22" y1="63" x2="10" y2="60" stroke="#18181B" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="22" y1="67" x2="10" y2="69" stroke="#18181B" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="78" y1="63" x2="90" y2="60" stroke="#18181B" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="78" y1="67" x2="90" y2="69" stroke="#18181B" strokeWidth="2.5" strokeLinecap="round" />
            {/* Mouth */}
            <path d="M 45,69 Q 50,74 55,69" fill="none" stroke="#18181B" strokeWidth="3" strokeLinecap="round" />
          </svg>
        );

      case 'shiba':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full fill-current">
            {/* Ears */}
            <polygon points="18,38 28,10 46,32" fill="#FB923C" stroke="#18181B" strokeWidth="3.5" strokeLinejoin="round" />
            <polygon points="82,38 72,10 54,32" fill="#FB923C" stroke="#18181B" strokeWidth="3.5" strokeLinejoin="round" />
            {/* Face */}
            <ellipse cx="50" cy="58" rx="38" ry="34" fill="#FED7AA" stroke="#18181B" strokeWidth="3.5" />
            <ellipse cx="50" cy="65" rx="22" ry="18" fill="#FFF7ED" />
            {/* Eyebrows (Sweat/Nervous) */}
            <path d="M 28,42 Q 36,36 44,42" fill="none" stroke="#18181B" strokeWidth="3" strokeLinecap="round" />
            <path d="M 72,42 Q 64,36 56,42" fill="none" stroke="#18181B" strokeWidth="3" strokeLinecap="round" />
            {/* Eyes */}
            <circle cx="36" cy="49" r="4.5" fill="#18181B" />
            <circle cx="64" cy="49" r="4.5" fill="#18181B" />
            {/* Nose & Mouth */}
            <ellipse cx="50" cy="62" rx="5" ry="3.5" fill="#18181B" />
            <path d="M 44,68 Q 50,75 56,68" fill="none" stroke="#18181B" strokeWidth="3" strokeLinecap="round" />
            {/* Sweat drops (nervous) */}
            <path d="M 78,38 Q 83,43 78,48 Q 73,43 78,38 Z" fill="#38BDF8" stroke="#18181B" strokeWidth="1.5" />
          </svg>
        );

      case 'frog':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full fill-current">
            {/* Big Bulging Frog Eyes */}
            <circle cx="30" cy="30" r="18" fill="#BBF7D0" stroke="#18181B" strokeWidth="3.5" />
            <circle cx="70" cy="30" r="18" fill="#BBF7D0" stroke="#18181B" strokeWidth="3.5" />
            <circle cx="30" cy="30" r="7" fill="#18181B" />
            <circle cx="70" cy="30" r="7" fill="#18181B" />
            <circle cx="32" cy="27" r="2.5" fill="#FFFFFF" />
            <circle cx="72" cy="27" r="2.5" fill="#FFFFFF" />
            {/* Head */}
            <ellipse cx="50" cy="62" rx="42" ry="32" fill="#86EFAC" stroke="#18181B" strokeWidth="3.5" />
            {/* Smug Smirk */}
            <path d="M 28,64 Q 50,82 74,60" fill="none" stroke="#18181B" strokeWidth="4" strokeLinecap="round" />
            {/* Cheeks */}
            <ellipse cx="26" cy="60" rx="6" ry="3.5" fill="#F43F5E" opacity="0.4" />
            <ellipse cx="74" cy="60" rx="6" ry="3.5" fill="#F43F5E" opacity="0.4" />
          </svg>
        );

      case 'duck':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full fill-current">
            {/* Detective Hat */}
            <ellipse cx="50" cy="28" rx="34" ry="9" fill="#78350F" stroke="#18181B" strokeWidth="3" />
            <path d="M 26,26 C 26,10 74,10 74,26 Z" fill="#92400E" stroke="#18181B" strokeWidth="3" />
            {/* Head */}
            <circle cx="50" cy="60" r="34" fill="#FEF08A" stroke="#18181B" strokeWidth="3.5" />
            {/* Sharp Detective Eyes */}
            <ellipse cx="38" cy="54" rx="4" ry="6" fill="#18181B" />
            <ellipse cx="62" cy="54" rx="4" ry="6" fill="#18181B" />
            {/* Duck Bill */}
            <path d="M 32,66 Q 50,60 68,66 Q 50,80 32,66 Z" fill="#FB923C" stroke="#18181B" strokeWidth="3.5" />
          </svg>
        );

      case 'sloth':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full fill-current">
            {/* Head */}
            <circle cx="50" cy="52" r="38" fill="#DDD6FE" stroke="#18181B" strokeWidth="3.5" />
            {/* Eye Patches */}
            <ellipse cx="34" cy="50" rx="14" ry="10" transform="rotate(-15 34 50)" fill="#C4B5FD" />
            <ellipse cx="66" cy="50" rx="14" ry="10" transform="rotate(15 66 50)" fill="#C4B5FD" />
            {/* Sleepy Closed Eyes */}
            <path d="M 26,50 Q 34,57 42,50" fill="none" stroke="#18181B" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M 58,50 Q 66,57 74,50" fill="none" stroke="#18181B" strokeWidth="3.5" strokeLinecap="round" />
            {/* Nose & Mouth */}
            <ellipse cx="50" cy="60" rx="7" ry="5" fill="#18181B" />
            <path d="M 45,68 Q 50,72 55,68" fill="none" stroke="#18181B" strokeWidth="3" strokeLinecap="round" />
            {/* Sleep Zzz */}
            <text x="74" y="24" fontFamily="sans-serif" fontSize="16" fontWeight="bold" fill="#7C3AED">Z</text>
            <text x="84" y="16" fontFamily="sans-serif" fontSize="12" fontWeight="bold" fill="#A78BFA">z</text>
          </svg>
        );

      case 'dino':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full fill-current">
            {/* Dino Spikes */}
            <polygon points="46,12 56,2 62,14" fill="#FB7185" stroke="#18181B" strokeWidth="3" />
            <polygon points="66,18 78,8 82,24" fill="#FB7185" stroke="#18181B" strokeWidth="3" />
            {/* Head */}
            <path d="M 20,60 C 20,28 75,22 84,52 C 88,68 76,86 48,86 C 30,86 20,78 20,60 Z" fill="#FECDD3" stroke="#18181B" strokeWidth="3.5" />
            {/* Shocked Round Eyes */}
            <circle cx="44" cy="45" r="9" fill="#FFFFFF" stroke="#18181B" strokeWidth="3" />
            <circle cx="44" cy="45" r="4" fill="#18181B" />
            {/* Nostril */}
            <circle cx="26" cy="58" r="2.5" fill="#18181B" />
            {/* Open Gasped Mouth */}
            <ellipse cx="38" cy="72" rx="7" ry="9" fill="#18181B" />
            <ellipse cx="38" cy="74" rx="4" ry="4" fill="#FB7185" />
          </svg>
        );

      case 'bear':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full fill-current">
            {/* Bear Round Ears */}
            <circle cx="24" cy="28" r="14" fill="#F59E0B" stroke="#18181B" strokeWidth="3.5" />
            <circle cx="76" cy="28" r="14" fill="#F59E0B" stroke="#18181B" strokeWidth="3.5" />
            {/* Head */}
            <circle cx="50" cy="56" r="38" fill="#FDE68A" stroke="#18181B" strokeWidth="3.5" />
            {/* Snout */}
            <ellipse cx="50" cy="65" rx="18" ry="14" fill="#FEF3C7" stroke="#18181B" strokeWidth="2.5" />
            <ellipse cx="50" cy="59" rx="6" ry="4" fill="#18181B" />
            {/* Grumpy Eyebrows */}
            <line x1="28" y1="42" x2="42" y2="48" stroke="#18181B" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="72" y1="42" x2="58" y2="48" stroke="#18181B" strokeWidth="3.5" strokeLinecap="round" />
            {/* Eyes */}
            <circle cx="36" cy="50" r="3.5" fill="#18181B" />
            <circle cx="64" cy="50" r="3.5" fill="#18181B" />
            {/* Frown */}
            <path d="M 43,72 Q 50,67 57,72" fill="none" stroke="#18181B" strokeWidth="3" strokeLinecap="round" />
          </svg>
        );

      default:
        // Alien
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full fill-current">
            {/* Antenna */}
            <line x1="50" y1="22" x2="50" y2="8" stroke="#18181B" strokeWidth="3" />
            <circle cx="50" cy="8" r="5" fill="#10B981" stroke="#18181B" strokeWidth="2.5" />
            {/* Oval Head */}
            <ellipse cx="50" cy="55" rx="36" ry="38" fill="#A7F3D0" stroke="#18181B" strokeWidth="3.5" />
            {/* Giant Alien Eyes */}
            <ellipse cx="32" cy="50" rx="9" ry="14" transform="rotate(-15 32 50)" fill="#18181B" />
            <ellipse cx="68" cy="50" rx="9" ry="14" transform="rotate(15 68 50)" fill="#18181B" />
            <circle cx="30" cy="46" r="3" fill="#FFFFFF" />
            <circle cx="66" cy="46" r="3" fill="#FFFFFF" />
            {/* Little 'o' Mouth */}
            <circle cx="50" cy="72" r="4.5" fill="#047857" stroke="#18181B" strokeWidth="2" />
          </svg>
        );
    }
  };

  return (
    <div className={`relative inline-flex flex-col items-center select-none ${className}`}>
      {/* Speech bubble indicator */}
      {isSpeaking && (
        <div className="absolute -top-7 px-2.5 py-0.5 bg-yellow-300 border-2 border-slate-900 rounded-full text-[11px] font-black tracking-wide shadow-pop-sm animate-bounce z-20 whitespace-nowrap">
          ĐANG BÀO CHỮA! 📣
        </div>
      )}

      {/* Main Avatar Bubble */}
      <div
        className={`relative ${sizeStyles[size]} rounded-3xl p-1.5 transition-transform duration-200 border-[2.5px] border-slate-900 shadow-pop overflow-hidden`}
        style={{ backgroundColor: preset.bgColor }}
      >
        {renderFace()}

        {/* DRAMATIC BUSTED STAMP OVERLAY */}
        {isBusted && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
            <div className="border-[3px] border-red-600 bg-red-600/90 text-white font-black text-[12px] md:text-sm px-2 py-0.5 rounded uppercase tracking-widest transform -rotate-12 shadow-pop-red animate-stamp-in text-center leading-tight">
              BUSTED!
              <span className="block text-[8px] md:text-[9px] font-bold">THỦ PHẠM</span>
            </div>
          </div>
        )}
      </div>

      {/* Badge name */}
      {badge && (
        <span className="mt-1.5 px-2 py-0.5 text-[11px] font-bold bg-white border-[1.5px] border-slate-900 rounded-md shadow-pop-sm text-slate-800 whitespace-nowrap">
          {badge}
        </span>
      )}
    </div>
  );
};
