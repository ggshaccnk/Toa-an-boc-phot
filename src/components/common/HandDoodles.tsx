'use client';

import React from 'react';

interface DoodleProps {
  className?: string;
  color?: string;
}

// 1. Hand-drawn Judicial Gavel
export const DoodleGavel: React.FC<DoodleProps> = ({ className = 'w-6 h-6', color = '#18181B' }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none">
    {/* Impact sparks */}
    <path d="M 68,22 L 78,14 M 82,34 L 94,32 M 72,48 L 84,54" stroke="#FF5E36" strokeWidth="4.5" strokeLinecap="round" />
    {/* Hammer head */}
    <rect x="42" y="24" width="34" height="22" rx="4" transform="rotate(-30 59 35)" fill="#F59E0B" stroke={color} strokeWidth="4.5" strokeLinejoin="round" />
    <path d="M 38,20 L 58,8 M 55,50 L 75,38" stroke={color} strokeWidth="4" strokeLinecap="round" />
    {/* Hammer handle */}
    <path d="M 44,44 L 14,78 C 11,81 12,87 16,89 C 20,91 25,89 28,85 L 56,52 Z" fill="#D97706" stroke={color} strokeWidth="4.5" strokeLinejoin="round" />
    {/* Base block */}
    <ellipse cx="65" cy="80" rx="26" ry="10" fill="#E2E8F0" stroke={color} strokeWidth="4" />
    <path d="M 39,80 L 39,88 C 39,94 91,94 91,88 L 91,80" fill="#CBD5E1" stroke={color} strokeWidth="4" />
  </svg>
);

// 2. Hand-drawn Pointing Finger
export const DoodlePointing: React.FC<DoodleProps> = ({ className = 'w-6 h-6', color = '#18181B' }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none">
    {/* Hand body with long pointing index finger */}
    <path
      d="M 12,48 C 12,38 22,34 30,34 L 56,34 L 88,34 C 92,34 95,38 95,43 C 95,48 92,52 88,52 L 62,52 L 62,60 C 62,64 58,68 54,68 L 54,76 C 54,80 50,84 46,84 L 30,84 C 18,84 12,74 12,62 Z"
      fill="#FDE047"
      stroke={color}
      strokeWidth="4.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Thumb */}
    <path d="M 32,34 C 32,24 40,16 46,20 C 50,24 48,34 46,38" stroke={color} strokeWidth="4" strokeLinecap="round" />
    {/* Knuckle lines */}
    <path d="M 34,50 L 46,50 M 34,62 L 44,62 M 34,74 L 42,74" stroke={color} strokeWidth="3.5" strokeLinecap="round" />
    {/* Motion lines behind index finger */}
    <path d="M 82,24 L 92,20 M 88,60 L 98,64" stroke="#DC2626" strokeWidth="4" strokeLinecap="round" />
  </svg>
);

// 3. Hand-drawn Bomb with sizzling fuse
export const DoodleBomb: React.FC<DoodleProps> = ({ className = 'w-6 h-6', color = '#18181B' }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none">
    {/* Bomb sphere */}
    <circle cx="48" cy="58" r="32" fill="#1E293B" stroke={color} strokeWidth="4.5" />
    {/* Shine highlight */}
    <path d="M 30,42 C 32,36 40,32 46,32" stroke="#FFFFFF" strokeWidth="4.5" strokeLinecap="round" />
    {/* Neck */}
    <rect x="58" y="24" width="14" height="10" transform="rotate(35 65 29)" fill="#64748B" stroke={color} strokeWidth="4" />
    {/* Wobbly fuse */}
    <path d="M 72,25 C 78,20 74,12 82,10" stroke={color} strokeWidth="4" strokeLinecap="round" fill="none" />
    {/* Spark */}
    <path d="M 82,10 L 86,4 M 82,10 L 90,12 M 82,10 L 82,16 M 82,10 L 76,6" stroke="#EF4444" strokeWidth="4" strokeLinecap="round" />
  </svg>
);

// 4. Hand-drawn Mirror / Swapping Arrows
export const DoodleMirror: React.FC<DoodleProps> = ({ className = 'w-6 h-6', color = '#18181B' }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none">
    {/* Oval mirror frame */}
    <ellipse cx="50" cy="45" rx="34" ry="38" fill="#E0F2FE" stroke={color} strokeWidth="4.5" />
    {/* Handle */}
    <path d="M 44,82 L 40,96 C 40,98 44,100 50,100 C 56,100 60,98 60,96 L 56,82 Z" fill="#FBBF24" stroke={color} strokeWidth="4.5" />
    {/* Glare diagonal strokes */}
    <line x1="34" y1="30" x2="42" y2="20" stroke="#0284C7" strokeWidth="4" strokeLinecap="round" />
    <line x1="38" y1="46" x2="52" y2="28" stroke="#0284C7" strokeWidth="4" strokeLinecap="round" />
    <line x1="48" y1="60" x2="64" y2="40" stroke="#0284C7" strokeWidth="4" strokeLinecap="round" />
  </svg>
);

// 5. Hand-drawn Swap / Bẻ Lái Arrows
export const DoodleSwap: React.FC<DoodleProps> = ({ className = 'w-6 h-6', color = '#18181B' }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none">
    <path d="M 20,38 L 74,38 L 62,24" stroke="#7C3AED" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 80,62 L 26,62 L 38,76" stroke="#FF5E36" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="20" cy="38" r="4" fill="#7C3AED" />
    <circle cx="80" cy="62" r="4" fill="#FF5E36" />
  </svg>
);

// 6. Hand-drawn Detective Magnifying Glass
export const DoodleDetective: React.FC<DoodleProps> = ({ className = 'w-6 h-6', color = '#18181B' }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none">
    <circle cx="42" cy="42" r="28" fill="#F0FDF4" stroke={color} strokeWidth="5" />
    {/* Lens reflection */}
    <path d="M 26,34 C 28,26 36,22 46,22" stroke="#22C55E" strokeWidth="4" strokeLinecap="round" />
    {/* Big eye inside */}
    <ellipse cx="42" cy="42" rx="14" ry="10" fill="#FFFFFF" stroke={color} strokeWidth="3.5" />
    <circle cx="42" cy="42" r="5" fill="#18181B" />
    {/* Handle */}
    <path d="M 62,62 L 86,86 C 89,89 89,94 86,97 C 83,100 78,100 75,97 L 51,73 Z" fill="#F59E0B" stroke={color} strokeWidth="4.5" strokeLinejoin="round" />
  </svg>
);

// 7. Hand-drawn Dice
export const DoodleDice: React.FC<DoodleProps> = ({ className = 'w-6 h-6', color = '#18181B' }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none">
    <rect x="20" y="20" width="60" height="60" rx="14" transform="rotate(-6 50 50)" fill="#FEF08A" stroke={color} strokeWidth="5" />
    <circle cx="36" cy="36" r="5" fill={color} />
    <circle cx="64" cy="36" r="5" fill={color} />
    <circle cx="50" cy="50" r="5" fill="#EF4444" />
    <circle cx="36" cy="64" r="5" fill={color} />
    <circle cx="64" cy="64" r="5" fill={color} />
  </svg>
);

// 8. Hand-drawn Dog with bone
export const DoodleDog: React.FC<DoodleProps> = ({ className = 'w-6 h-6', color = '#18181B' }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none">
    {/* Floppy dog ears */}
    <path d="M 22,36 C 12,46 16,68 26,62 C 30,58 30,48 26,38 Z" fill="#FB923C" stroke={color} strokeWidth="4" />
    <path d="M 78,36 C 88,46 84,68 74,62 C 70,58 70,48 74,38 Z" fill="#FB923C" stroke={color} strokeWidth="4" />
    {/* Head */}
    <ellipse cx="50" cy="46" rx="28" ry="24" fill="#FED7AA" stroke={color} strokeWidth="4.5" />
    {/* Nose */}
    <ellipse cx="50" cy="50" rx="6" ry="4" fill="#18181B" />
    {/* Eyes */}
    <circle cx="38" cy="40" r="3.5" fill="#18181B" />
    <circle cx="62" cy="40" r="3.5" fill="#18181B" />
    {/* Bone in mouth */}
    <path d="M 32,62 L 68,62 M 30,58 A 3,3 0 0,0 30,66 M 70,58 A 3,3 0 0,1 70,66" stroke={color} strokeWidth="4.5" strokeLinecap="round" />
  </svg>
);

// 9. Hand-drawn Pen / Feather
export const DoodlePen: React.FC<DoodleProps> = ({ className = 'w-6 h-6', color = '#18181B' }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none">
    <path d="M 76,14 L 86,24 L 38,82 L 18,88 L 24,68 Z" fill="#FDE047" stroke={color} strokeWidth="4.5" strokeLinejoin="round" />
    <line x1="68" y1="22" x2="78" y2="32" stroke={color} strokeWidth="3.5" />
    <path d="M 18,88 L 26,80" stroke={color} strokeWidth="4" />
    <circle cx="21" cy="85" r="2" fill="#18181B" />
    <path d="M 32,92 C 40,88 44,95 56,92" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

// 10. Hand-drawn Clock / Timer
export const DoodleClock: React.FC<DoodleProps> = ({ className = 'w-6 h-6', color = '#18181B' }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none">
    <circle cx="50" cy="54" r="36" fill="#FEF3C7" stroke={color} strokeWidth="4.5" />
    {/* Top button */}
    <rect x="44" y="8" width="12" height="10" rx="3" fill="#D97706" stroke={color} strokeWidth="3.5" />
    <line x1="38" y1="8" x2="62" y2="8" stroke={color} strokeWidth="4" strokeLinecap="round" />
    {/* Clock hands */}
    <line x1="50" y1="54" x2="50" y2="32" stroke={color} strokeWidth="4.5" strokeLinecap="round" />
    <line x1="50" y1="54" x2="66" y2="54" stroke="#DC2626" strokeWidth="4" strokeLinecap="round" />
    <circle cx="50" cy="54" r="4" fill={color} />
  </svg>
);

// 11. Hand-drawn Scales of Justice
export const DoodleScale: React.FC<DoodleProps> = ({ className = 'w-6 h-6', color = '#18181B' }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none">
    {/* Center pillar */}
    <line x1="50" y1="18" x2="50" y2="82" stroke={color} strokeWidth="5" strokeLinecap="round" />
    <path d="M 36,82 L 64,82" stroke={color} strokeWidth="5" strokeLinecap="round" />
    {/* Balance beam (tilted) */}
    <line x1="20" y1="36" x2="80" y2="28" stroke={color} strokeWidth="4.5" strokeLinecap="round" />
    {/* Left plate */}
    <line x1="20" y1="36" x2="10" y2="58" stroke={color} strokeWidth="2.5" />
    <line x1="20" y1="36" x2="30" y2="58" stroke={color} strokeWidth="2.5" />
    <path d="M 6,58 Q 20,70 34,58 Z" fill="#FDE047" stroke={color} strokeWidth="3.5" />
    {/* Right plate */}
    <line x1="80" y1="28" x2="70" y2="50" stroke={color} strokeWidth="2.5" />
    <line x1="80" y1="28" x2="90" y2="50" stroke={color} strokeWidth="2.5" />
    <path d="M 66,50 Q 80,62 94,50 Z" fill="#FDE047" stroke={color} strokeWidth="3.5" />
  </svg>
);

// 12. Hand-drawn Megaphone
export const DoodleMegaphone: React.FC<DoodleProps> = ({ className = 'w-6 h-6', color = '#18181B' }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none">
    <path d="M 28,42 L 56,26 L 56,74 L 28,58 Z" fill="#F43F5E" stroke={color} strokeWidth="4.5" strokeLinejoin="round" />
    <ellipse cx="56" cy="50" rx="8" ry="24" fill="#FFE4E6" stroke={color} strokeWidth="4" />
    <rect x="16" y="44" width="12" height="12" rx="2" fill="#E2E8F0" stroke={color} strokeWidth="3.5" />
    {/* Handle */}
    <path d="M 32,56 L 36,78 C 36,80 40,82 44,80 L 44,54" stroke={color} strokeWidth="4" strokeLinejoin="round" />
    {/* Sound waves */}
    <path d="M 72,36 Q 80,50 72,64" stroke="#EA580C" strokeWidth="4" strokeLinecap="round" />
    <path d="M 82,28 Q 94,50 82,72" stroke="#EA580C" strokeWidth="4" strokeLinecap="round" />
  </svg>
);

// 13. Washi Tape Strip (Retro paper tape decorator)
export const WashiTape: React.FC<{ className?: string; color?: string; text?: string }> = ({
  className = '',
  color = 'bg-amber-200/90 text-amber-950',
  text,
}) => (
  <div
    className={`inline-flex items-center justify-center px-3 py-0.5 border border-dashed border-slate-700/60 font-black text-[10px] uppercase tracking-wider shadow-sm select-none transform -rotate-1 ${color} ${className}`}
    style={{
      clipPath: 'polygon(3% 0%, 97% 0%, 100% 50%, 97% 100%, 3% 100%, 0% 50%)',
    }}
  >
    {text}
  </div>
);

// 14. Rubber Ink Stamp
export const RubberStamp: React.FC<{ text: string; color?: 'red' | 'purple' | 'green' | 'amber'; className?: string }> = ({
  text,
  color = 'red',
  className = '',
}) => {
  const styles = {
    red: 'border-rose-600 text-rose-600 shadow-pop-red',
    purple: 'border-purple-600 text-purple-600 shadow-pop-sm',
    green: 'border-emerald-600 text-emerald-600 shadow-pop-sm',
    amber: 'border-amber-600 text-amber-700 shadow-pop-sm',
  };

  return (
    <div
      className={`inline-block px-2.5 py-0.5 border-[2px] border-dashed rounded-md font-black text-[10px] md:text-xs tracking-widest uppercase transform -rotate-2 select-none ${styles[color]} ${className}`}
    >
      [ {text} ]
    </div>
  );
};
