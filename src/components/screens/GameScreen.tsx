'use client';

import React, { useState } from 'react';
import { Player, GameState, AlibiCard } from '@/types/party';
import { DoodleAvatar } from '@/components/common/DoodleAvatar';
import { PaperCard } from '@/components/common/PaperCard';
import { CustomCardModal } from '@/components/common/CustomCardModal';
import {
  DoodleClock,
  DoodleGavel,
  DoodlePen,
  WashiTape,
  RubberStamp,
} from '@/components/common/HandDoodles';
import { motion } from 'framer-motion';

interface GameScreenProps {
  localPlayer: Player;
  gameState: GameState;
  onPlayCard: (card: AlibiCard) => void;
  onPlayCustomCard: (card: AlibiCard) => void;
  onFastForwardToVoting: () => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({
  localPlayer,
  gameState,
  onPlayCard,
  onPlayCustomCard,
  onFastForwardToVoting,
}) => {
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const currentPrompt = gameState.currentPrompt;
  const isPromptReveal = gameState.phase === 'PROMPT_REVEAL';

  // Find local player state in gameState
  const myPlayerState =
    gameState.players.find((p) => p.id === localPlayer.id) || localPlayer;

  // Check how many players have played a card
  const playedCount = gameState.players.filter((p) => p.playedCard !== null).length;
  const allPlayed = playedCount === gameState.players.length;

  return (
    <div className={`w-full max-w-5xl mx-auto space-y-6 ${gameState.screenShaking ? 'animate-shake' : ''}`}>
      {/* Top Court Header Bar */}
      <div className="p-4 bg-white border-[2.5px] border-slate-900 rounded-3xl shadow-pop flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-amber-400 border-2 border-slate-900 rounded-xl shadow-pop-sm flex items-center gap-1.5 font-black text-xs uppercase tracking-wide">
            <span className="font-mono">HIỆP {gameState.round}/{gameState.maxRounds}</span>
            <span className="text-[10px] text-slate-800">[{gameState.gameMode}]</span>
          </div>
          <span className="text-xs md:text-sm font-black text-slate-800 uppercase tracking-tight">
            {isPromptReveal ? '🔔 CÔNG BỐ CÁO TRẠNG MỚI' : '🗣️ GIAI ĐOẠN BIỆN HỘ BẰNG THẺ BÀI'}
          </span>
        </div>

        {/* Phase Timer & Fast-forward */}
        <div className="flex items-center gap-3">
          <div
            className={`px-3 py-1.5 rounded-xl border-2 border-slate-900 shadow-pop-sm flex items-center gap-2 font-black text-xs md:text-sm ${
              gameState.phaseTimer <= 5
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-yellow-300 text-slate-900'
            }`}
          >
            <DoodleClock className="w-4 h-4 shrink-0" />
            <span>
              {isPromptReveal
                ? `CHUẨN BỊ: ${gameState.phaseTimer}s`
                : `CÒN LẠI: ${gameState.phaseTimer}s`}
            </span>
          </div>

          {!isPromptReveal && localPlayer.isHost && (
            <button
              onClick={onFastForwardToVoting}
              className="px-3 py-1.5 bg-slate-100 hover:bg-yellow-300 border-2 border-slate-900 rounded-xl text-xs font-black uppercase shadow-pop-sm transition-colors flex items-center gap-1"
            >
              <span>VÀO BỎ PHIẾU →</span>
            </button>
          )}
        </div>
      </div>

      {/* PROMPT BANNER - CÁO TRẠNG TRỚ TRÊU */}
      {currentPrompt && (
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="relative p-6 md:p-8 bg-paper-cream border-[3px] border-slate-900 rounded-3xl shadow-pop-lg overflow-hidden"
        >
          {/* Decorative Corner Badge */}
          <div className="absolute top-3 right-4 transform rotate-2">
            <RubberStamp text={currentPrompt.dramaticTag} color="red" />
          </div>

          <div className="max-w-3xl">
            <div className="mb-2">
              <WashiTape text={`CHUYÊN MỤC: ${currentPrompt.category}`} color="bg-amber-300 text-slate-950" />
            </div>
            <h2 className="text-xl md:text-3xl font-black text-slate-900 font-display mb-3 leading-snug">
              &ldquo;{currentPrompt.scenario}&rdquo;
            </h2>
            <p className="text-xs md:text-sm font-bold text-slate-600">
              👉 Hãy chọn một lá bài bên dưới hoặc bấm nút &ldquo;Tự Chế Lời Bào Chữa&rdquo; để cãi cùn!
            </p>
          </div>
        </motion.div>
      )}

      {/* COURT BENCH - ALL PLAYERS ROSTER & PLAYED CARDS */}
      <div className="p-5 bg-white border-[2.5px] border-slate-900 rounded-3xl shadow-pop space-y-4">
        <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2">
          <div className="flex items-center gap-2">
            <RubberStamp text="BỊ CÁO ĐIỂM DANH" color="amber" />
            <h3 className="text-xs md:text-sm font-black uppercase text-slate-900 tracking-wide font-display">
              HÀNG GHẾ BỊ CÁO &amp; LÝ DO BIỆN MINH ({playedCount}/{gameState.players.length})
            </h3>
          </div>
          <span className="text-[11px] font-bold text-slate-500">
            {allPlayed ? 'Tất cả đã nộp lý do ra tòa!' : 'Đang chờ các bị cáo trình thẻ...'}
          </span>
        </div>

        {/* Players Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {gameState.players.map((p) => {
            const hasPlayed = p.playedCard !== null;
            const isMe = p.id === localPlayer.id;

            return (
              <div
                key={p.id}
                className={`p-3 rounded-2xl border-2 border-slate-900 flex flex-col justify-between transition-all ${
                  isMe
                    ? 'bg-amber-50 ring-2 ring-amber-400 shadow-pop-sm'
                    : 'bg-paper-cream'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <DoodleAvatar avatarId={p.avatarId} size="sm" isSpeaking={hasPlayed} />
                  <div className="overflow-hidden">
                    <p className="text-xs font-black text-slate-900 truncate">
                      {p.name} {isMe && '(Bạn)'}
                    </p>
                    <span
                      className={`inline-block px-1.5 py-0.2 text-[9px] font-black rounded border ${
                        hasPlayed
                          ? 'bg-emerald-200 text-emerald-950 border-emerald-800'
                          : 'bg-slate-200 text-slate-700 border-slate-600 animate-pulse'
                      }`}
                    >
                      {hasPlayed ? '✓ ĐÃ RA LÝ DO' : 'Đang suy nghĩ...'}
                    </span>
                  </div>
                </div>

                {/* Show card played if already selected */}
                {p.playedCard ? (
                  <div className="p-2 bg-white border border-slate-900 rounded-xl shadow-pop-sm">
                    <span className="text-[9px] font-black uppercase text-rose-600 block truncate">
                      {p.playedCard.badgeText}
                    </span>
                    <p className="text-[11px] font-black text-slate-900 leading-tight truncate">
                      {p.playedCard.title}
                    </p>
                    <p className="text-[10px] italic text-slate-600 line-clamp-1 mt-0.5">
                      &ldquo;{p.playedCard.tagline}&rdquo;
                    </p>
                  </div>
                ) : (
                  <div className="p-2 bg-slate-100/60 border border-dashed border-slate-400 rounded-xl text-center">
                    <span className="text-[10px] text-slate-400 font-bold">
                      Chưa lật thẻ
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* PLAYER HAND - CARD SELECTION & CUSTOM CREATOR */}
      <div className="p-6 bg-paper-cream border-[2.5px] border-slate-900 rounded-3xl shadow-pop-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-slate-900 pb-3">
          <div>
            <h3 className="text-base font-black text-slate-900 uppercase font-display">
              TAY BÀI BÀO CHỮA CỦA BẠN (CHỌN 1 LÁ ĐỂ BIỆN HỘ)
            </h3>
            <p className="text-xs font-semibold text-slate-600">
              Chọn từ bộ bài có sẵn, hoặc tự tay viết lời cãi cùn mang phong cách riêng!
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Custom Card Creator Button */}
            {!isPromptReveal && (
              <button
                type="button"
                onClick={() => setIsCustomModalOpen(true)}
                className="py-2 px-3.5 bg-yellow-300 hover:bg-yellow-400 border-2 border-slate-900 rounded-xl font-black text-xs uppercase shadow-pop-sm flex items-center gap-2 transition-transform active:translate-y-0.5 cursor-pointer"
              >
                <DoodlePen className="w-4 h-4" />
                <span>[ ✍️ TỰ CHẾ BÀI BÀO CHỮA ]</span>
              </button>
            )}

            {myPlayerState.playedCard && (
              <div className="px-3 py-1 bg-emerald-500 text-white font-black text-xs uppercase rounded-xl border-2 border-slate-900 shadow-pop-sm">
                ✓ ĐÃ CHỌN
              </div>
            )}
          </div>
        </div>

        {/* Hand Cards Horizontal Scroll */}
        <div className="flex flex-wrap md:flex-nowrap items-center justify-center md:justify-start gap-4 overflow-x-auto py-3 px-1">
          {myPlayerState.hand.map((card, idx) => {
            const isSelected = myPlayerState.playedCard?.id === card.id;
            const rotations = [-2, 1, -1, 2];
            const rot = rotations[idx % rotations.length];

            return (
              <motion.div
                key={card.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: idx * 0.08 }}
                className="shrink-0"
              >
                <PaperCard
                  card={card}
                  rotation={rot}
                  isSelected={isSelected}
                  isPlayable={!isPromptReveal}
                  onPlay={onPlayCard}
                />
              </motion.div>
            );
          })}

          {myPlayerState.hand.length === 0 && (
            <div className="w-full text-center py-8 text-slate-500 font-bold text-sm">
              Đang chia bài biện hộ mới...
            </div>
          )}
        </div>
      </div>

      {/* Custom Alibi Creator Modal */}
      <CustomCardModal
        playerName={localPlayer.name}
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onCreateCard={(card) => {
          onPlayCustomCard(card);
        }}
      />
    </div>
  );
};
