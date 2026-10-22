'use client';

import React from 'react';
import { Player, GameState } from '@/types/party';
import { DoodleAvatar } from '@/components/common/DoodleAvatar';
import { RubberStamp, WashiTape } from '@/components/common/HandDoodles';
import { IconPalette, IconScale, IconGavel } from '@/components/common/FlatIcons';
import { partyAudio } from '@/lib/partyAudio';

interface ArtistExhibitScreenProps {
  localPlayer: Player;
  gameState: GameState;
  onNextExhibit: (index: number) => void;
  onProceedToVoting: () => void;
  onSendReaction: (emoji: string) => void;
}

export const ArtistExhibitScreen: React.FC<ArtistExhibitScreenProps> = ({
  localPlayer,
  gameState,
  onNextExhibit,
  onProceedToVoting,
  onSendReaction,
}) => {
  const currentIndex = gameState.artistExhibitIndex || 0;
  const totalPlayers = gameState.players.length;

  // The author of the sketch being exhibited
  const authorPlayer = gameState.players[currentIndex] || gameState.players[0];

  // The player who guessed what authorPlayer was doing
  const witnessPlayer = gameState.players.find(
    (p) => p.targetSketchPlayerId === authorPlayer.id
  );

  const isLastExhibit = currentIndex >= totalPlayers - 1;
  const isMeAuthor = authorPlayer.id === localPlayer.id;
  const isMeWitness = witnessPlayer?.id === localPlayer.id;

  const handleNext = () => {
    partyAudio.playGavelStrike();
    if (isLastExhibit) {
      onProceedToVoting();
    } else {
      onNextExhibit(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      partyAudio.playCardHover();
      onNextExhibit(currentIndex - 1);
    }
  };

  return (
    <div className={`w-full max-w-4xl mx-auto space-y-6 ${gameState.screenShaking ? 'animate-shake' : ''}`}>
      {/* Top Court Header Bar */}
      <div className="p-4 bg-white border-[2.5px] border-slate-900 rounded-3xl shadow-pop flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-yellow-400 border-2 border-slate-900 rounded-xl shadow-pop-sm flex items-center gap-1.5 font-black text-xs uppercase tracking-wide">
            <span className="font-mono">HIỆP {gameState.round}/{gameState.maxRounds}</span>
            <span className="text-[10px] text-slate-900">[TRIỂN LÃM ĐỐI CHẤT]</span>
          </div>
          <span className="text-xs md:text-sm font-black text-slate-800 uppercase tracking-tight">
            VỤ ÁN HỘI HỌA #{currentIndex + 1}/{totalPlayers}
          </span>
        </div>

        {/* Host Exhibit Navigator */}
        <div className="flex items-center gap-2">
          {localPlayer.isHost && currentIndex > 0 && (
            <button
              onClick={handlePrev}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border-2 border-slate-900 rounded-xl text-xs font-black uppercase shadow-pop-sm cursor-pointer"
            >
              ← TRƯỚC
            </button>
          )}

          {localPlayer.isHost ? (
            <button
              onClick={handleNext}
              className={`px-4 py-1.5 border-2 border-slate-900 rounded-xl text-xs font-black uppercase shadow-pop-sm transition-all cursor-pointer ${
                isLastExhibit
                  ? 'bg-rose-500 hover:bg-rose-600 text-white animate-pulse'
                  : 'bg-yellow-400 hover:bg-yellow-500 text-slate-950'
              }`}
            >
              {isLastExhibit ? 'VÀO BỎ PHIẾU CHỈ TAY →' : `TRANH TIẾP THEO (${currentIndex + 2}/${totalPlayers}) →`}
            </button>
          ) : (
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-300">
              Chờ Chủ Tọa chuyển tranh...
            </span>
          )}
        </div>
      </div>

      {/* Main Spotlight Exhibit Card */}
      <div className="p-6 md:p-8 bg-paper-cream border-[3px] border-slate-900 rounded-3xl shadow-pop-lg space-y-6">
        {/* Accusation Banner */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-slate-900 pb-3">
          <div className="flex items-center gap-2">
            <RubberStamp text="VỤ ÁN ĐANG XỬ" color="amber" />
            <span className="text-xs md:text-sm font-black text-slate-900 uppercase">
              &ldquo;{gameState.currentPrompt?.scenario}&rdquo;
            </span>
          </div>
          <WashiTape
            text={`VẬT CHỨNG ${currentIndex + 1}/${totalPlayers}`}
            color="bg-purple-300 text-purple-950"
          />
        </div>

        {/* Center: The Drawing & The Guess */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Left Column: Sketch Art */}
          <div className="md:col-span-6 flex flex-col items-center">
            <div className="relative p-3 bg-white border-[2.5px] border-slate-900 rounded-3xl shadow-pop-md max-w-sm w-full aspect-square flex items-center justify-center overflow-hidden transform -rotate-1 hover:rotate-0 transition-transform">
              {authorPlayer.sketchData ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={authorPlayer.sketchData}
                  alt={`Tranh của ${authorPlayer.name}`}
                  className="w-full h-full object-contain rounded-2xl"
                />
              ) : (
                <div className="text-center p-4">
                  <IconPalette className="w-10 h-10 mx-auto mb-2 text-slate-400" />
                  <p className="text-xs font-bold text-slate-400">
                    Bị cáo không nộp tranh kịp giờ!
                  </p>
                </div>
              )}

              {/* Author Pin */}
              <div className="absolute top-2 left-2">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-slate-900 text-white rounded-md shadow-sm">
                  {isMeAuthor ? '[TRANH CỦA BẠN]' : `Tác giả: ${authorPlayer.name}`}
                </span>
              </div>
            </div>

            {/* Author Status Card */}
            <div className="mt-3 flex items-center gap-2 px-3 py-1.5 bg-amber-100 border-2 border-slate-900 rounded-xl shadow-pop-sm">
              <DoodleAvatar avatarId={authorPlayer.avatarId} size="sm" />
              <span className="text-xs font-black text-slate-900">
                Bị cáo: {authorPlayer.name} {isMeAuthor && '(Bạn)'}
              </span>
            </div>
          </div>

          {/* Right Column: Witness Testimony */}
          <div className="md:col-span-6 space-y-4">
            <div className="p-5 bg-white border-[2.5px] border-slate-900 rounded-3xl shadow-pop space-y-3">
              <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2">
                <div className="flex items-center gap-2">
                  <RubberStamp text="LỜI KHAI NHÂN CHỨNG" color="red" />
                </div>
                {witnessPlayer && (
                  <div className="flex items-center gap-1.5 text-xs font-black text-purple-900">
                    <DoodleAvatar avatarId={witnessPlayer.avatarId} size="sm" />
                    <span>{witnessPlayer.name} {isMeWitness && '(Bạn)'}</span>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 block">
                  NHÂN CHỨNG TỐ CÁO TRƯỚC VÀNH MÓNG NGỰA:
                </span>
                <p className="text-lg md:text-2xl font-black text-rose-600 font-display leading-snug p-3 bg-rose-50 border-2 border-rose-300 rounded-2xl italic">
                  &ldquo;{witnessPlayer?.guessedAction || 'Hắn đang làm điều mờ ám không dám khai nhận!'}&rdquo;
                </p>
              </div>

              <div className="text-[11px] font-bold text-slate-600 border-t border-slate-200 pt-2 flex items-center justify-between">
                <span>Trạng thái bị cáo:</span>
                <span className="font-black text-slate-900 uppercase">
                  {isMeAuthor ? '[HÃY TÌM CÁCH CÃI CÙN ĐỂ THANH MINH]' : '[CẢ PHÒNG HÃY PHÁN XÉT]'}
                </span>
              </div>
            </div>

            {/* Quick Emote Reactions Bar */}
            <div className="p-3 bg-white border-2 border-slate-900 rounded-2xl shadow-pop-sm flex items-center justify-between gap-2">
              <span className="text-[11px] font-black uppercase text-slate-700 shrink-0">
                Phản ứng:
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {[
                  { text: 'HAHA!', label: 'Cười ngất', color: 'bg-yellow-200 hover:bg-yellow-300 text-slate-950' },
                  { text: 'XẤU QUÁ!', label: 'Vẽ xấu', color: 'bg-rose-100 hover:bg-rose-200 text-rose-950' },
                  { text: 'CÓ TỘI!', label: 'Có tội', color: 'bg-red-200 hover:bg-red-300 text-red-950 font-black' },
                  { text: 'LƯƠN LẸO!', label: 'Lươn lẹo', color: 'bg-amber-100 hover:bg-amber-200 text-amber-950' },
                  { text: 'ĐỈNH!', label: 'Khen đẹp', color: 'bg-purple-100 hover:bg-purple-200 text-purple-950' },
                ].map((item) => (
                  <button
                    key={item.text}
                    type="button"
                    onClick={() => {
                      partyAudio.playEmotePop();
                      onSendReaction(item.text);
                    }}
                    className={`px-2.5 py-1 text-xs font-black uppercase hover:scale-105 active:scale-95 transition-transform rounded-xl border-2 border-slate-900 shadow-pop-sm cursor-pointer ${item.color}`}
                    title={item.label}
                  >
                    {item.text}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
