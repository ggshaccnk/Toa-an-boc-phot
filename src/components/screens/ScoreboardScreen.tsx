'use client';

import React from 'react';
import { Player, GameState } from '@/types/party';
import { DoodleAvatar } from '@/components/common/DoodleAvatar';
import {
  DoodleScale,
  RubberStamp,
  WashiTape,
} from '@/components/common/HandDoodles';

interface ScoreboardScreenProps {
  localPlayer: Player;
  gameState: GameState;
  onResetGame: () => void;
}

export const ScoreboardScreen: React.FC<ScoreboardScreenProps> = ({
  localPlayer,
  gameState,
  onResetGame,
}) => {
  // Sort players by guiltScore descending
  const sortedPlayers = [...gameState.players].sort(
    (a, b) => b.guiltScore - a.guiltScore
  );

  const topCulprit = sortedPlayers[0];
  const mostInnocent = sortedPlayers[sortedPlayers.length - 1];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="p-6 bg-white border-[3px] border-slate-900 rounded-3xl shadow-pop text-center space-y-2">
        <div className="inline-block mb-1">
          <WashiTape text="KẾT THÚC PHIÊN TÒA CHUNG CUỘC" color="bg-amber-400 text-slate-950" />
        </div>
        <h1 className="text-2xl md:text-4xl font-black text-slate-900 font-display uppercase tracking-tight">
          BẢNG PHONG THẦN &amp; SỔ TỘI ĐỒ
        </h1>
        <p className="text-xs md:text-sm font-semibold text-slate-600">
          Ai là kẻ lươn lẹo nhất bàn, và ai giữ được sự trong sạch giả tạo?
        </p>
      </div>

      {/* Hall of Shame Podium Highlight */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Crown of Shame (Most Guilty) */}
        {topCulprit && (
          <div className="p-6 bg-rose-50 border-[2.5px] border-slate-900 rounded-3xl shadow-pop relative overflow-hidden flex flex-col items-center text-center">
            <div className="mb-2">
              <RubberStamp text="QUÁN QUÂN TỘI ĐỒ (BỊ BÓC NHIỀU NHẤT)" color="red" />
            </div>
            <DoodleAvatar avatarId={topCulprit.avatarId} size="lg" isBusted={true} />
            <h3 className="text-lg md:text-xl font-black text-slate-900 font-display mt-2">
              {topCulprit.name}
            </h3>
            <p className="text-xs font-bold text-rose-600">
              Tổng cộng bị kết án: <span className="text-base font-black font-mono">{topCulprit.timesConvicted} lần</span>
            </p>
            <div className="mt-3 p-2.5 bg-white border border-slate-900 rounded-xl text-xs font-semibold text-slate-700 italic">
              Danh hiệu: &ldquo;Chúa Tể Bị Đổ Tội &amp; Trùm Quỵt Nợ&rdquo;
            </div>
          </div>
        )}

        {/* Most Innocent (Least Guilty) */}
        {mostInnocent && (
          <div className="p-6 bg-emerald-50 border-[2.5px] border-slate-900 rounded-3xl shadow-pop relative overflow-hidden flex flex-col items-center text-center">
            <div className="mb-2">
              <RubberStamp text="BẬC THẦY BÀO CHỮA (ÍT TỘI NHẤT)" color="green" />
            </div>
            <DoodleAvatar avatarId={mostInnocent.avatarId} size="lg" />
            <h3 className="text-lg md:text-xl font-black text-slate-900 font-display mt-2">
              {mostInnocent.name}
            </h3>
            <p className="text-xs font-bold text-emerald-700">
              Chỉ bị kết án: <span className="text-base font-black font-mono">{mostInnocent.timesConvicted} lần</span>
            </p>
            <div className="mt-3 p-2.5 bg-white border border-slate-900 rounded-xl text-xs font-semibold text-slate-700 italic">
              Danh hiệu: &ldquo;Luật Sư Vàng Trong Làng Lươn Lẹo&rdquo;
            </div>
          </div>
        )}
      </div>

      {/* Complete Score Table */}
      <div className="p-5 bg-white border-[2.5px] border-slate-900 rounded-3xl shadow-pop space-y-3">
        <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2">
          <h3 className="text-sm font-black text-slate-900 uppercase font-display">
            BẢNG XẾP HẠNG TOÀN BỘ BỊ CÁO
          </h3>
          <RubberStamp text="ĐIỂM TỔNG KẾT" color="amber" />
        </div>

        <div className="space-y-2">
          {sortedPlayers.map((player, index) => (
            <div
              key={player.id}
              className={`p-3 rounded-2xl border-2 border-slate-900 flex items-center justify-between shadow-pop-sm ${
                index === 0
                  ? 'bg-rose-100/70'
                  : index === sortedPlayers.length - 1
                  ? 'bg-emerald-50'
                  : 'bg-paper-cream'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-slate-900 text-white font-black text-xs flex items-center justify-center font-mono">
                  #{index + 1}
                </span>
                <DoodleAvatar avatarId={player.avatarId} size="sm" />
                <div>
                  <span className="text-xs md:text-sm font-black text-slate-900">
                    {player.name} {player.id === localPlayer.id && '(Bạn)'}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500 block">
                    {player.isBot ? 'Người chơi máy (Bot)' : 'Người chơi thật'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-xs font-black text-rose-600 block font-mono">
                    {player.guiltScore} Điểm Tội Đồ
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500 font-mono">
                    {player.timesConvicted} lần đền tội
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Case History Ledger */}
      {gameState.history.length > 0 && (
        <div className="p-5 bg-paper-cream border-[2.5px] border-slate-900 rounded-3xl shadow-pop space-y-3">
          <h3 className="text-sm font-black text-slate-900 uppercase font-display border-b-2 border-slate-900 pb-2">
            NHẬT KÝ CÁC BẢN ÁN TRONG TRẬN ĐẤU ({gameState.history.length} VỤ ÁN)
          </h3>

          <div className="space-y-2">
            {gameState.history.map((item, idx) => (
              <div
                key={idx}
                className="p-3 bg-white border border-slate-900 rounded-2xl shadow-pop-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div>
                  <div className="mb-0.5">
                    <WashiTape text={`HIỆP ${item.round}: ${item.promptTitle}`} color="bg-amber-300 text-slate-950" />
                  </div>
                  <p className="text-xs font-bold text-slate-800 mt-1">
                    Hình phạt: <span className="text-slate-600 italic">&ldquo;{item.penalty}&rdquo;</span>
                  </p>
                </div>
                <div className="shrink-0 px-3 py-1 bg-rose-100 border border-rose-800 rounded-xl text-xs font-black text-rose-800">
                  Thủ phạm: {item.convictedName}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Action CTA */}
      <div className="p-4 bg-white border-[2.5px] border-slate-900 rounded-3xl shadow-pop flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          type="button"
          onClick={onResetGame}
          className="w-full sm:w-auto px-8 py-3.5 bg-yellow-400 hover:bg-yellow-500 border-[2.5px] border-slate-900 rounded-2xl font-black text-sm uppercase shadow-pop flex items-center justify-center gap-2 transition-transform active:translate-y-0.5 cursor-pointer"
        >
          <span>[ CHƠI LẠI VÁN MỚI (LÀM LẠI CUỘC ĐỜI) ]</span>
        </button>
      </div>
    </div>
  );
};
