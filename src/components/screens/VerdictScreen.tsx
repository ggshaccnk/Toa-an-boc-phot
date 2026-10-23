'use client';

import React, { useState } from 'react';
import { Player, GameState } from '@/types/party';
import { DoodleAvatar } from '@/components/common/DoodleAvatar';
import {
  DoodleGavel,
  RubberStamp,
  WashiTape,
} from '@/components/common/HandDoodles';
import { partyAudio } from '@/lib/partyAudio';
import { motion } from 'framer-motion';

interface VerdictScreenProps {
  localPlayer: Player;
  gameState: GameState;
  onNextRoundOrScoreboard: () => void;
}

export const VerdictScreen: React.FC<VerdictScreenProps> = ({
  localPlayer,
  gameState,
  onNextRoundOrScoreboard,
}) => {
  const [penaltyDone, setPenaltyDone] = useState(false);

  const isTieVote = !!gameState.isTieVote;
  const convictedIds =
    gameState.convictedPlayerIds ||
    (gameState.convictedPlayerId ? [gameState.convictedPlayerId] : []);
  const convictedPlayers = gameState.players.filter((p) =>
    convictedIds.includes(p.id)
  );

  const convicted = convictedPlayers[0] || null;
  const isCulpritMe = convictedPlayers.some((p) => p.id === localPlayer.id);

  const voteCount = convicted
    ? gameState.voteResults[convicted.id] || 0
    : 0;

  const isFinalRound = gameState.round >= gameState.maxRounds;

  // Find who voted for the culprits (especially exciting in Shadow Mode!)
  const whoVotedForCulprit = gameState.players.filter(
    (p) => p.voteTargetId && convictedIds.includes(p.voteTargetId)
  );

  return (
    <div className={`w-full max-w-4xl mx-auto space-y-6 ${gameState.screenShaking ? 'animate-shake' : ''}`}>
      {/* Top Banner */}
      <div className="p-4 bg-white border-[2.5px] border-slate-900 rounded-3xl shadow-pop flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-rose-500 rounded-xl border-2 border-slate-900 shadow-pop-sm flex items-center justify-center p-1.5 shrink-0">
            <DoodleGavel className="w-full h-full text-white" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-black text-slate-900 font-display uppercase">
              TÒA ĐÃ TUYÊN ÁN! (HIỆP {gameState.round}/{gameState.maxRounds})
            </h2>
            <p className="text-xs font-bold text-slate-600">
              Thể thức: <span className="font-black text-slate-900">[{gameState.gameMode}]</span> &bull; Bản án chính thức có hiệu lực!
            </p>
          </div>
        </div>

        {localPlayer.isHost && (
          <button
            onClick={onNextRoundOrScoreboard}
            className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 border-2 border-slate-900 rounded-2xl font-black text-xs md:text-sm uppercase shadow-pop-sm flex items-center gap-1.5 transition-transform active:translate-y-0.5"
          >
            <span>{isFinalRound ? '[ XEM BẢNG PHONG THẦN ]' : '[ HIỆP KẾ TIẾP → ]'}</span>
          </button>
        )}
      </div>

      {/* Chaos Announcement Alert if triggered */}
      {gameState.chaosAnnouncements.length > 0 && (
        <div className="space-y-2">
          {gameState.chaosAnnouncements.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-4 bg-purple-100 border-[2.5px] border-purple-900 rounded-2xl shadow-pop-sm flex items-center gap-3 text-purple-950 font-black text-xs md:text-sm"
            >
              <RubberStamp text="KÍCH HOẠT HỖN LOẠN" color="purple" />
              <span>{msg}</span>
            </motion.div>
          ))}
        </div>
      )}

      {/* Main Spotlight Card: The Convicted Suspect */}
      {convicted ? (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="p-6 md:p-8 bg-white border-[3px] border-slate-900 rounded-3xl shadow-pop-lg relative overflow-hidden space-y-6 text-center"
        >
          {/* Top Stamp Label */}
          <div className="inline-block px-4 py-1.5 bg-rose-600 text-white font-black text-sm md:text-base uppercase tracking-widest rounded-xl border-2 border-slate-900 shadow-pop-red animate-stamp-in">
            {isTieVote
              ? '[ HÒA PHIẾU: ĐỒNG THỦ PHẠM CÙNG LÃNH ÁN ]'
              : '[ THỦ PHẠM CHÍNH THỨC CỦA VỤ ÁN ]'}
          </div>

          {/* If Tie Vote: Showcase all convicted suspects together */}
          {isTieVote && convictedPlayers.length > 1 ? (
            <div className="space-y-3">
              <p className="text-xs md:text-sm font-bold text-rose-600">
                Hội đồng xét xử bất phân thắng bại! Cả {convictedPlayers.length} bị cáo đều nhận số phiếu cao nhất ({voteCount} phiếu):
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 my-3">
                {convictedPlayers.map((cp) => (
                  <div
                    key={cp.id}
                    className="flex flex-col items-center p-4 bg-rose-50 border-2 border-slate-900 rounded-3xl shadow-pop min-w-[200px] max-w-[240px]"
                  >
                    <DoodleAvatar avatarId={cp.avatarId} size="lg" isBusted={true} />
                    <h3 className="text-lg md:text-xl font-black text-slate-900 font-display mt-2">
                      {cp.name} {cp.id === localPlayer.id && '(Bạn!)'}
                    </h3>
                    <span className="text-xs font-black text-rose-700 bg-white px-2.5 py-0.5 rounded-lg border border-rose-300 mt-1">
                      {gameState.voteResults[cp.id] || 0} PHIẾU BẦU
                    </span>

                    {gameState.gameMode === 'ARTIST' && cp.sketchData && (
                      <div className="w-28 h-28 mt-2 rounded-xl overflow-hidden border-2 border-slate-900 bg-[#fdfbf7] p-1">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={cp.sketchData}
                          alt={`Tranh của ${cp.name}`}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Single Convicted Avatar & Name */
            <div className="flex flex-col items-center justify-center my-2">
              <div className="relative">
                <DoodleAvatar
                  avatarId={convicted.avatarId}
                  size="xl"
                  isBusted={true}
                />
              </div>
              <h3 className="text-2xl md:text-3xl font-black text-slate-900 font-display mt-3">
                {convicted.name} {isCulpritMe && '(Chính Bạn!)'}
              </h3>
              <p className="text-xs md:text-sm font-bold text-rose-600 mt-1">
                Bị kết án với áp đảo <span className="font-black text-base font-mono">{voteCount}</span> phiếu bầu từ hội đồng!
              </p>
            </div>
          )}

          {/* In Shadow Mode: Reveal who voted for them */}
          {gameState.gameMode === 'SHADOW' && whoVotedForCulprit.length > 0 && (
            <div className="p-3 bg-purple-50 border-2 border-purple-900 rounded-2xl max-w-xl mx-auto shadow-pop-sm text-left">
              <div className="flex items-center gap-2 mb-1">
                <RubberStamp text="VẠCH MẶT KẺ ĐÃ BỎ PHIẾU BÍ MẬT" color="purple" />
              </div>
              <p className="text-xs text-purple-900 font-bold mt-1">
                {whoVotedForCulprit.map((p) => p.name).join(', ')} đã thẳng tay bấm chỉ điểm đâm sau lưng!
              </p>
            </div>
          )}

          {/* The Accusation Prompt summary */}
          {gameState.currentPrompt && (
            <div className="p-3 bg-amber-50 border-2 border-slate-900 rounded-2xl max-w-xl mx-auto shadow-pop-sm">
              <span className="text-[10px] font-black uppercase text-amber-800">
                Tội danh khởi tố:
              </span>
              <p className="text-xs md:text-sm font-bold text-slate-900 italic mt-0.5">
                &ldquo;{gameState.currentPrompt.scenario}&rdquo;
              </p>
            </div>
          )}

          {/* In ARTIST Mode: Exhibit the convict's incriminating sketch (Single mode) */}
          {gameState.gameMode === 'ARTIST' && convicted.sketchData && convictedPlayers.length === 1 && (
            <div className="p-3 bg-white border-2 border-slate-900 rounded-2xl max-w-xs mx-auto shadow-pop-sm text-center">
              <span className="text-[10px] font-black uppercase text-slate-600 block mb-1">
                Tang chứng hội họa không thể chối cãi:
              </span>
              <div className="w-44 h-44 mx-auto aspect-square rounded-xl overflow-hidden border-2 border-slate-900 bg-[#fdfbf7] p-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={convicted.sketchData}
                  alt={`Tranh của ${convicted.name}`}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          )}

          {/* THE MEME PENALTY BOX */}
          <div className="p-5 md:p-6 bg-paper-cream border-[2.5px] border-slate-900 rounded-2xl max-w-xl mx-auto shadow-pop text-left space-y-2">
            <div className="flex items-center gap-2">
              <RubberStamp
                text={
                  isTieVote
                    ? `HIỆP ${gameState.round}: CẢ ${convictedPlayers.map((p) => p.name).join(' & ')} CÙNG THỰC HIỆN`
                    : `HÌNH PHẠT HIỆP ${gameState.round} (THỰC HIỆN NGAY)`
                }
                color="red"
              />
            </div>

            <p className="text-base md:text-lg font-black text-slate-950 leading-relaxed font-display bg-white p-3.5 rounded-xl border-2 border-slate-900 shadow-pop-sm">
              {convicted.assignedPenalty || 'Phải công khai xin lỗi cả phòng vì sự lươn lẹo!'}
            </p>

            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-[11px] font-semibold text-slate-500">
                Mọi người giám sát hình phạt trước khi bấm qua hiệp!
              </span>

              <button
                type="button"
                onClick={() => {
                  setPenaltyDone(!penaltyDone);
                  partyAudio.playVictoryFanfare();
                }}
                className={`px-3.5 py-2 rounded-xl border-2 border-slate-900 text-xs font-black uppercase flex items-center justify-center gap-1.5 shadow-pop-sm transition-all ${
                  penaltyDone
                    ? 'bg-emerald-400 text-slate-950'
                    : 'bg-white hover:bg-yellow-300 text-slate-800'
                }`}
              >
                <span>{penaltyDone ? '[ ✓ ĐÃ CHẤP HÀNH XONG! ]' : '[ XÁC NHẬN ĐÃ CHỊU PHẠT ]'}</span>
              </button>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="p-8 bg-white border-2 border-slate-900 rounded-3xl text-center">
          <p className="font-bold text-slate-600">Không tìm thấy bị cáo nào.</p>
        </div>
      )}

      {/* Next Step CTA bottom bar */}
      <div className="p-4 bg-white border-[2.5px] border-slate-900 rounded-3xl shadow-pop flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs font-bold text-slate-700">
          Hiệp {gameState.round} trên tổng số {gameState.maxRounds} hiệp thi đấu.
        </div>

        {localPlayer.isHost ? (
          <button
            onClick={onNextRoundOrScoreboard}
            className="w-full sm:w-auto px-6 py-3 bg-yellow-400 hover:bg-yellow-500 border-2 border-slate-900 rounded-2xl font-black text-sm uppercase shadow-pop flex items-center justify-center gap-2 transition-transform active:translate-y-0.5 cursor-pointer"
          >
            <span>{isFinalRound ? '[ TỔNG KẾT VÀ TRAO GIẢI PHONG THẦN ]' : '[ TIẾP TỤC HIỆP SAU → ]'}</span>
          </button>
        ) : (
          <span className="text-xs font-bold text-slate-500 animate-pulse">
            Chờ chủ phòng bấm chuyển hiệp...
          </span>
        )}
      </div>
    </div>
  );
};
