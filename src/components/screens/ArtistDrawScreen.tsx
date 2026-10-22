'use client';

import React, { useState } from 'react';
import { Player, GameState } from '@/types/party';
import { DoodleCanvas } from '@/components/game/DoodleCanvas';
import { DoodleAvatar } from '@/components/common/DoodleAvatar';
import { DoodleClock, RubberStamp, WashiTape } from '@/components/common/HandDoodles';
import { partyAudio } from '@/lib/partyAudio';

interface ArtistDrawScreenProps {
  localPlayer: Player;
  gameState: GameState;
  onSaveSketch: (dataUrl: string) => void;
  onFastForwardToGuess: () => void;
}

export const ArtistDrawScreen: React.FC<ArtistDrawScreenProps> = ({
  localPlayer,
  gameState,
  onSaveSketch,
  onFastForwardToGuess,
}) => {
  const [isRedrawing, setIsRedrawing] = useState(false);
  const myPlayerState =
    gameState.players.find((p) => p.id === localPlayer.id) || localPlayer;
  const hasSubmitted = !!myPlayerState.sketchData && !isRedrawing;

  const submittedCount = gameState.players.filter((p) => !!p.sketchData).length;
  const allSubmitted = submittedCount === gameState.players.length;

  return (
    <div className={`w-full max-w-4xl mx-auto space-y-6 ${gameState.screenShaking ? 'animate-shake' : ''}`}>
      {/* Top Court Header Bar */}
      <div className="p-4 bg-white border-[2.5px] border-slate-900 rounded-3xl shadow-pop flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-amber-400 border-2 border-slate-900 rounded-xl shadow-pop-sm flex items-center gap-1.5 font-black text-xs uppercase tracking-wide">
            <span className="font-mono">HIỆP {gameState.round}/{gameState.maxRounds}</span>
            <span className="text-[10px] text-slate-800">[HỌA SĨ BIỆN HỘ 🎨]</span>
          </div>
          <span className="text-xs md:text-sm font-black text-slate-800 uppercase tracking-tight">
            {hasSubmitted
              ? '✓ BẠN ĐÃ NỘP XONG &bull; CHỜ CÁC BỊ CÁO KHÁC'
              : '🎨 VẼ PHÁC HỌA: LÚC ĐÓ BẠN ĐANG LÀM GÌ?'}
          </span>
        </div>

        {/* Phase Timer & Fast-Forward */}
        <div className="flex items-center gap-3">
          <div
            className={`px-3 py-1.5 rounded-xl border-2 border-slate-900 shadow-pop-sm flex items-center gap-2 font-black text-xs md:text-sm ${
              gameState.phaseTimer <= 5
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-yellow-300 text-slate-900'
            }`}
          >
            <DoodleClock className="w-4 h-4 shrink-0" />
            <span>CÒN LẠI: {gameState.phaseTimer}s</span>
          </div>

          {localPlayer.isHost && (
            <button
              onClick={onFastForwardToGuess}
              className="px-3 py-1.5 bg-slate-100 hover:bg-yellow-300 border-2 border-slate-900 rounded-xl text-xs font-black uppercase shadow-pop-sm transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>VÀO ĐOÁN MÒ →</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {hasSubmitted && myPlayerState.sketchData ? (
        <div className="p-6 md:p-8 bg-paper-cream border-[3px] border-slate-900 rounded-3xl shadow-pop-lg text-center space-y-6">
          <div className="inline-block">
            <RubberStamp text="BẰNG CHỨNG ĐÃ NỘP" color="green" />
          </div>

          <h2 className="text-xl md:text-2xl font-black text-slate-900 font-display">
            BẰNG CHỨNG NGOẠI PHẠM CỦA BẠN ĐÃ ĐƯỢC NIÊM PHONG!
          </h2>
          <p className="text-xs md:text-sm font-bold text-slate-600 max-w-md mx-auto">
            Hết giờ, bức tranh này sẽ được tráo ngẫu nhiên cho một người khác trong phòng để họ &ldquo;đoán mò&rdquo; xem bạn đang vẽ cái gì!
          </p>

          {/* Sketch Preview */}
          <div className="relative inline-block p-2 bg-white border-2 border-slate-900 rounded-2xl shadow-pop-md max-w-xs mx-auto">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={myPlayerState.sketchData}
              alt="Bản phác họa của bạn"
              className="w-64 h-64 object-contain rounded-xl"
            />
            <div className="absolute -bottom-2 -right-2 transform rotate-3">
              <WashiTape text="TÁC PHẨM CỦA BẠN" color="bg-yellow-300 text-slate-950" />
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={() => {
                partyAudio.playCardHover();
                setIsRedrawing(true);
              }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 border-2 border-slate-900 rounded-xl text-xs font-black uppercase shadow-pop-sm transition-transform active:translate-y-0.5 cursor-pointer"
            >
              ✏️ VẼ LẠI NẾU CHƯA ƯNG Ý
            </button>
          </div>
        </div>
      ) : (
        <DoodleCanvas
          promptScenario={gameState.currentPrompt?.scenario || 'Đang bận làm việc mờ ám'}
          onSaveSketch={(dataUrl) => {
            setIsRedrawing(false);
            onSaveSketch(dataUrl);
          }}
        />
      )}

      {/* Progress Bench: Who has drawn? */}
      <div className="p-4 bg-white border-[2.5px] border-slate-900 rounded-3xl shadow-pop space-y-3">
        <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2">
          <div className="flex items-center gap-2">
            <RubberStamp text="TIẾN ĐỘ VẼ" color="amber" />
            <h3 className="text-xs md:text-sm font-black uppercase text-slate-900 font-display">
              BỊ CÁO ĐÃ NỘP BẢN VẼ ({submittedCount}/{gameState.players.length})
            </h3>
          </div>
          <span className="text-[11px] font-bold text-slate-500">
            {allSubmitted ? 'Tất cả đã nộp! Đang chuẩn bị tráo tranh...' : 'Đang chờ các họa sĩ...'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {gameState.players.map((p) => {
            const hasDrawn = !!p.sketchData;
            const isMe = p.id === localPlayer.id;

            return (
              <div
                key={p.id}
                className={`p-2.5 rounded-2xl border-2 border-slate-900 flex items-center justify-between shadow-pop-sm transition-all ${
                  hasDrawn
                    ? 'bg-emerald-50 border-emerald-900'
                    : isMe
                    ? 'bg-amber-50 ring-2 ring-yellow-400'
                    : 'bg-paper-cream'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <DoodleAvatar avatarId={p.avatarId} size="sm" />
                  <span className="text-xs font-black text-slate-900 truncate">
                    {p.name} {isMe && '(Bạn)'}
                  </span>
                </div>
                <span
                  className={`text-[10px] font-black uppercase px-1.5 py-0.5 rounded border ${
                    hasDrawn
                      ? 'bg-emerald-300 text-emerald-950 border-emerald-800'
                      : 'bg-yellow-200 text-yellow-950 border-yellow-800 animate-pulse'
                  }`}
                >
                  {hasDrawn ? '✓ Xong' : 'Đang vẽ'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
