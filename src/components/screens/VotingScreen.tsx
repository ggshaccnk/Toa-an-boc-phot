'use client';

import React from 'react';
import { Player, GameState } from '@/types/party';
import { DoodleAvatar } from '@/components/common/DoodleAvatar';
import {
  DoodleClock,
  DoodlePointing,
  DoodleGavel,
  DoodleDetective,
  RubberStamp,
  WashiTape,
} from '@/components/common/HandDoodles';
import { motion } from 'framer-motion';

interface VotingScreenProps {
  localPlayer: Player;
  gameState: GameState;
  onCastVote: (targetId: string) => void;
  onFinalizeVerdict: () => void;
}

export const VotingScreen: React.FC<VotingScreenProps> = ({
  localPlayer,
  gameState,
  onCastVote,
  onFinalizeVerdict,
}) => {
  const currentPrompt = gameState.currentPrompt;
  const isShadowMode = gameState.gameMode === 'SHADOW';
  const myPlayerState =
    gameState.players.find((p) => p.id === localPlayer.id) || localPlayer;
  const votedTargetId = myPlayerState.voteTargetId;

  // Calculate live vote counts
  const voteTallies: Record<string, number> = {};
  gameState.players.forEach((p) => {
    if (p.voteTargetId) {
      voteTallies[p.voteTargetId] = (voteTallies[p.voteTargetId] || 0) + 1;
    }
  });

  const totalVoted = gameState.players.filter((p) => p.voteTargetId !== null).length;
  const allVoted = totalVoted === gameState.players.length;

  return (
    <div className={`w-full max-w-5xl mx-auto space-y-6 ${gameState.screenShaking ? 'animate-shake' : ''}`}>
      {/* Top Header */}
      <div className="p-4 bg-white border-[2.5px] border-slate-900 rounded-3xl shadow-pop flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-rose-500 text-white border-2 border-slate-900 rounded-xl shadow-pop-sm flex items-center gap-1.5 font-black text-xs uppercase tracking-wide">
            {isShadowMode ? '[ BỎ PHIẾU BÍ MẬT NẶC DANH ]' : '[ BỎ PHIẾU CÔNG KHAI ]'}
          </div>
          <span className="text-xs md:text-sm font-black text-slate-800 uppercase tracking-tight">
            👉 ĐẾM NGƯỢC CHỈ TAY VẠCH MẶT KẺ KHẢ NGHI NHẤT
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={`px-3 py-1.5 rounded-xl border-2 border-slate-900 shadow-pop-sm flex items-center gap-2 font-black text-xs md:text-sm ${
              gameState.phaseTimer <= 5
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-yellow-300 text-slate-900'
            }`}
          >
            <DoodleClock className="w-4 h-4 shrink-0" />
            <span>CÒN {gameState.phaseTimer}s</span>
          </div>

          {localPlayer.isHost && (
            <button
              onClick={onFinalizeVerdict}
              className="px-3.5 py-1.5 bg-rose-500 hover:bg-rose-600 text-white border-2 border-slate-900 rounded-xl text-xs font-black uppercase shadow-pop-sm transition-transform active:translate-y-0.5 flex items-center gap-1"
            >
              <span>[ TUYÊN ÁN NGAY 🔨 ]</span>
            </button>
          )}
        </div>
      </div>

      {/* Accusation Reminder Banner */}
      {currentPrompt && (
        <div className="p-4 md:p-5 bg-paper-cream border-[2.5px] border-slate-900 rounded-3xl shadow-pop flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="mb-1">
              <WashiTape text="CÂU HỎI VẤN ĐÁP:" color="bg-amber-300 text-slate-950" />
            </div>
            <h3 className="text-sm md:text-base font-black text-slate-900 font-display mt-1">
              &ldquo;{currentPrompt.scenario}&rdquo;
            </h3>
          </div>
          <div className="shrink-0 px-3 py-1.5 bg-white border-2 border-slate-900 rounded-xl shadow-pop-sm text-xs font-bold text-slate-800 flex items-center gap-2">
            {isShadowMode && <RubberStamp text="ẨN DANH" color="purple" />}
            <span>
              Đã bỏ phiếu: <span className="font-black text-rose-600 font-mono">{totalVoted}/{gameState.players.length}</span>
            </span>
          </div>
        </div>
      )}

      {/* Suspect Voting Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {gameState.players.map((suspect, idx) => {
          const isMe = suspect.id === localPlayer.id;
          const isVotedByMe = votedTargetId === suspect.id;
          const votesReceived = voteTallies[suspect.id] || 0;

          return (
            <motion.div
              key={suspect.id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: idx * 0.05 }}
              className={`p-4 bg-white border-[2.5px] border-slate-900 rounded-3xl transition-all duration-200 flex flex-col justify-between relative overflow-hidden ${
                isVotedByMe
                  ? 'ring-4 ring-rose-500 shadow-pop-lg -translate-y-1 bg-rose-50/50'
                  : 'shadow-pop hover:shadow-pop-md'
              }`}
            >
              {/* Vote Count Badge (Hidden in Shadow Mode) */}
              {!isShadowMode ? (
                votesReceived > 0 && (
                  <div className="absolute top-2 right-2 px-2.5 py-1 bg-rose-500 text-white font-black text-xs rounded-xl border-2 border-slate-900 shadow-pop-sm animate-bounce flex items-center gap-1 font-mono">
                    <span>{votesReceived} PHIẾU</span>
                  </div>
                )
              ) : (
                <div className="absolute top-2 right-2">
                  <RubberStamp text="BÍ MẬT" color="purple" />
                </div>
              )}

              <div>
                {/* Avatar & Name */}
                <div className="flex items-center gap-3 mb-3">
                  <DoodleAvatar
                    avatarId={suspect.avatarId}
                    size="md"
                    isGuiltyLook={!isShadowMode && votesReceived >= 2}
                  />
                  <div className="overflow-hidden">
                    <p className="text-sm font-black text-slate-900 truncate">
                      {suspect.name}
                    </p>
                    <span className="text-[11px] font-bold text-slate-500 block">
                      {isMe ? '👤 Bạn' : 'Bị cáo dự khuyết'}
                    </span>
                    {suspect.voteTargetId ? (
                      <span className="text-[10px] font-black text-emerald-700 block mt-0.5">
                        [ ✓ ĐÃ CHỈ TAY ]
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-amber-600 block mt-0.5 animate-pulse">
                        [ ...ĐANG NGHĨ ]
                      </span>
                    )}
                  </div>
                </div>

                {/* ARTIST MODE: Sketch Thumbnail & Witness Guess */}
                {gameState.gameMode === 'ARTIST' ? (
                  <div className="p-2.5 bg-paper-cream border-[1.5px] border-slate-900 rounded-2xl mb-3 shadow-pop-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase text-slate-500">
                        Bản Phác Họa Ngoại Phạm:
                      </span>
                      <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-amber-300 text-slate-900 border border-slate-800">
                        VẼ TAY 🎨
                      </span>
                    </div>

                    {suspect.sketchData ? (
                      <div className="w-full aspect-square max-h-32 bg-white rounded-xl border border-slate-800 overflow-hidden flex items-center justify-center p-1">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={suspect.sketchData}
                          alt={`Tranh của ${suspect.name}`}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ) : (
                      <p className="text-[10px] italic text-slate-400 text-center py-2">
                        (Không nộp tranh)
                      </p>
                    )}

                    {(() => {
                      const witness = gameState.players.find(
                        (p) => p.targetSketchPlayerId === suspect.id
                      );
                      return witness?.guessedAction ? (
                        <div className="p-1.5 bg-rose-50 border border-rose-300 rounded-lg">
                          <span className="text-[9px] font-black text-rose-800 uppercase block">
                            Nhân chứng {witness.name} tố cáo:
                          </span>
                          <p className="text-[10px] font-bold text-slate-900 italic line-clamp-2">
                            &ldquo;{witness.guessedAction}&rdquo;
                          </p>
                        </div>
                      ) : null;
                    })()}
                  </div>
                ) : (
                  /* NORMAL MODES: The card they played as defense */
                  <div className="p-3 bg-paper-cream border-[1.5px] border-slate-900 rounded-2xl mb-3 shadow-pop-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] font-black uppercase text-slate-500">
                        Lời Bào Chữa Đã Nộp:
                      </span>
                      {suspect.playedCard?.authorName && (
                        <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-yellow-300 text-slate-900 border border-slate-800">
                          TỰ CHẾ ✍️
                        </span>
                      )}
                    </div>

                    {suspect.playedCard ? (
                      <div>
                        <p className="text-xs font-black text-slate-900 leading-snug">
                          {suspect.playedCard.title}
                        </p>
                        <p className="text-[10px] italic text-slate-700 line-clamp-2 mt-1 bg-white/70 p-1.5 rounded-lg border border-slate-300">
                          &ldquo;{suspect.playedCard.description}&rdquo;
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs italic text-slate-500 mt-1">
                        (Không kịp đưa ra lý do nào - quá khả nghi!)
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Vote action button */}
              <button
                type="button"
                onClick={() => onCastVote(suspect.id)}
                className={`w-full py-2.5 rounded-xl border-2 border-slate-900 font-black text-xs uppercase tracking-wider transition-all shadow-pop-sm flex items-center justify-center gap-2 active:translate-y-0.5 ${
                  isVotedByMe
                    ? 'bg-rose-500 text-white ring-2 ring-slate-900'
                    : isMe
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    : 'bg-yellow-300 hover:bg-yellow-400 text-slate-950 cursor-pointer'
                }`}
              >
                <DoodlePointing className="w-4 h-4 shrink-0" />
                <span>
                  {isVotedByMe
                    ? 'BẠN ĐÃ CHỈ VÀO ĐÂY'
                    : isMe
                    ? 'TỰ NHẬN TỘI'
                    : 'CHỈ TAY VÀO ĐỨA NÀY'}
                </span>
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
