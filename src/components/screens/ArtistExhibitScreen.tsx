'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Player, GameState } from '@/types/party';
import { DoodleAvatar } from '@/components/common/DoodleAvatar';
import { RubberStamp, WashiTape } from '@/components/common/HandDoodles';
import {
  IconPalette,
  IconGavel,
  IconVolume,
  IconVolumeMute,
  IconCheck,
} from '@/components/common/FlatIcons';
import { partyAudio } from '@/lib/partyAudio';
import { courtroomSpeech } from '@/lib/speechVoice';

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

  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [autoSpeech, setAutoSpeech] = useState<boolean>(true);
  const lastSpokenIndexRef = useRef<number | null>(null);

  // The author of the sketch being exhibited
  const authorPlayer = gameState.players[currentIndex] || gameState.players[0];

  // The player who guessed what authorPlayer was doing
  const witnessPlayer = gameState.players.find(
    (p) => p.targetSketchPlayerId === authorPlayer?.id
  );

  const isLastExhibit = currentIndex >= totalPlayers - 1;
  const isMeAuthor = authorPlayer?.id === localPlayer.id;
  const isMeWitness = witnessPlayer?.id === localPlayer.id;

  // Subscribe to speech state changes
  useEffect(() => {
    const unsubscribe = courtroomSpeech.subscribeState((speaking) => {
      setIsSpeaking(speaking);
    });
    return () => {
      unsubscribe();
      courtroomSpeech.stop();
    };
  }, []);

  // Function to trigger Google Text-to-Speech reading
  const handleSpeakCurrentTestimony = useCallback(() => {
    if (!authorPlayer) return;

    const witnessName = witnessPlayer?.name || 'Nhân chứng ẩn danh';
    const authorName = authorPlayer.name;
    const guessText =
      witnessPlayer?.guessedAction ||
      'Hắn đang lén lút làm việc phi pháp không dám khai nhận!';

    partyAudio.playGavelStrike();

    courtroomSpeech.speakTestimony({
      witnessName,
      authorName,
      guessText,
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  }, [authorPlayer, witnessPlayer]);

  // Auto-speak when switching exhibit slide if enabled
  useEffect(() => {
    if (autoSpeech && lastSpokenIndexRef.current !== currentIndex) {
      lastSpokenIndexRef.current = currentIndex;
      // Slight delay so the user sees the picture appear first
      const timer = setTimeout(() => {
        handleSpeakCurrentTestimony();
      }, 450);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, autoSpeech, handleSpeakCurrentTestimony]);

  const handleNext = () => {
    courtroomSpeech.stop();
    partyAudio.playGavelStrike();
    if (isLastExhibit) {
      onProceedToVoting();
    } else {
      onNextExhibit(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      courtroomSpeech.stop();
      partyAudio.playCardHover();
      onNextExhibit(currentIndex - 1);
    }
  };

  const handleJumpTo = (index: number) => {
    if (index === currentIndex) return;
    courtroomSpeech.stop();
    partyAudio.playCardHover();
    if (localPlayer.isHost) {
      onNextExhibit(index);
    }
  };

  const handleToggleSpeaking = () => {
    if (isSpeaking) {
      courtroomSpeech.stop();
    } else {
      handleSpeakCurrentTestimony();
    }
  };

  return (
    <div
      className={`w-full max-w-4xl mx-auto space-y-6 ${
        gameState.screenShaking ? 'animate-shake' : ''
      }`}
    >
      {/* Top Court Header Bar */}
      <div className="p-4 bg-white border-[2.5px] border-slate-900 rounded-3xl shadow-pop flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-yellow-400 border-2 border-slate-900 rounded-xl shadow-pop-sm flex items-center gap-1.5 font-black text-xs uppercase tracking-wide">
            <span className="font-mono">
              HIỆP {gameState.round}/{gameState.maxRounds}
            </span>
            <span className="text-[10px] text-slate-900">[TRIỂN LÃM ĐỐI CHẤT]</span>
          </div>
          <span className="text-xs md:text-sm font-black text-slate-800 uppercase tracking-tight">
            VẬT CHỨNG #{currentIndex + 1}/{totalPlayers} &bull; TÒA ÁN ĐỐI CHẤT
          </span>
        </div>

        {/* TTS Toggle & Exhibit Navigator */}
        <div className="flex items-center gap-2">
          {/* Auto voice toggle button */}
          <button
            type="button"
            onClick={() => {
              setAutoSpeech(!autoSpeech);
              partyAudio.playCardHover();
            }}
            className={`px-2.5 py-1.5 border-2 border-slate-900 rounded-xl text-xs font-black uppercase shadow-pop-sm flex items-center gap-1.5 cursor-pointer transition-colors ${
              autoSpeech
                ? 'bg-purple-100 hover:bg-purple-200 text-purple-950'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-500'
            }`}
            title="Bật/Tắt tự động đọc giọng Google khi chuyển tranh"
          >
            {autoSpeech ? (
              <IconVolume className="w-4 h-4 text-purple-700" />
            ) : (
              <IconVolumeMute className="w-4 h-4 text-slate-400" />
            )}
            <span className="hidden sm:inline">
              {autoSpeech ? 'GIỌNG ĐỌC: BẬT' : 'GIỌNG ĐỌC: TẮT'}
            </span>
          </button>

          {/* Previous exhibit button */}
          {localPlayer.isHost && currentIndex > 0 && (
            <button
              onClick={handlePrev}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border-2 border-slate-900 rounded-xl text-xs font-black uppercase shadow-pop-sm cursor-pointer active:translate-y-0.5"
            >
              ← BẢN TRƯỚC
            </button>
          )}

          {/* Next / Proceed to Voting Button */}
          {localPlayer.isHost ? (
            <button
              onClick={handleNext}
              className={`px-4 py-1.5 border-2 border-slate-900 rounded-xl text-xs font-black uppercase shadow-pop-sm transition-all cursor-pointer active:translate-y-0.5 flex items-center gap-1.5 ${
                isLastExhibit
                  ? 'bg-rose-500 hover:bg-rose-600 text-white animate-pulse'
                  : 'bg-yellow-400 hover:bg-yellow-500 text-slate-950'
              }`}
            >
              <IconGavel className="w-4 h-4" />
              <span>
                {isLastExhibit
                  ? 'TIẾN VÀO BỎ PHIẾU BẮT TỘI PHẠM →'
                  : `TRANH TIẾP THEO (${currentIndex + 2}/${totalPlayers}) →`}
              </span>
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

        {/* Center: The Drawing & The Guess with Google TTS */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Left Column: Sketch Art Frame (Spacious) */}
          <div className="md:col-span-6 flex flex-col items-center">
            <div className="relative p-3 bg-white border-[3px] border-slate-900 rounded-3xl shadow-pop-md w-full max-w-md aspect-square flex items-center justify-center overflow-hidden transform -rotate-1 hover:rotate-0 transition-transform">
              {authorPlayer?.sketchData ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={authorPlayer.sketchData}
                  alt={`Tranh của ${authorPlayer.name}`}
                  className="w-full h-full object-contain rounded-2xl bg-[#fdfbf7]"
                />
              ) : (
                <div className="text-center p-6">
                  <IconPalette className="w-12 h-12 mx-auto mb-2 text-slate-400" />
                  <p className="text-xs md:text-sm font-bold text-slate-500">
                    Bị cáo không nộp kịp bản phác họa ngoại phạm!
                  </p>
                </div>
              )}

              {/* Author Pin */}
              <div className="absolute top-3 left-3">
                <span className="text-[10px] md:text-xs font-black uppercase px-2.5 py-1 bg-slate-900 text-white rounded-lg shadow-sm">
                  {isMeAuthor ? '[TRANH CỦA BẠN]' : `Tác giả: ${authorPlayer?.name}`}
                </span>
              </div>
            </div>

            {/* Author Status Card */}
            <div className="mt-3 flex items-center gap-2 px-3.5 py-2 bg-amber-100 border-2 border-slate-900 rounded-2xl shadow-pop-sm">
              <DoodleAvatar avatarId={authorPlayer?.avatarId || 'cat'} size="sm" />
              <span className="text-xs md:text-sm font-black text-slate-900">
                Bị cáo đang bị nghi vấn: {authorPlayer?.name} {isMeAuthor && '(Bạn)'}
              </span>
            </div>
          </div>

          {/* Right Column: Witness Testimony & Google TTS Engine */}
          <div className="md:col-span-6 space-y-4">
            <div
              className={`p-5 md:p-6 bg-white border-[2.5px] border-slate-900 rounded-3xl shadow-pop space-y-4 transition-all ${
                isSpeaking
                  ? 'ring-4 ring-purple-500 shadow-pop-lg bg-purple-50/30'
                  : ''
              }`}
            >
              {/* Header: Witness identification */}
              <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2">
                <div className="flex items-center gap-2">
                  <RubberStamp text="LỜI KHAI NHÂN CHỨNG" color="red" />
                </div>
                {witnessPlayer && (
                  <div className="flex items-center gap-1.5 text-xs font-black text-purple-900 bg-purple-50 px-2.5 py-1 rounded-xl border border-purple-200">
                    <DoodleAvatar avatarId={witnessPlayer.avatarId} size="sm" />
                    <span>
                      {witnessPlayer.name} {isMeWitness && '(Bạn)'}
                    </span>
                  </div>
                )}
              </div>

              {/* The Quoted Guess */}
              <div className="space-y-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 block">
                  NHÂN CHỨNG NHÌN TRANH VÀ TỐ CÁO:
                </span>
                <div
                  className={`p-4 rounded-2xl border-2 transition-all relative ${
                    isSpeaking
                      ? 'bg-rose-100 border-rose-500 shadow-sm'
                      : 'bg-rose-50 border-rose-300'
                  }`}
                >
                  <p className="text-lg md:text-xl font-black text-rose-700 font-display leading-relaxed italic">
                    &ldquo;
                    {witnessPlayer?.guessedAction ||
                      'Hắn đang làm điều mờ ám phi pháp không dám khai nhận!'}
                    &rdquo;
                  </p>
                </div>
              </div>

              {/* Google Text-to-Speech Player Bar */}
              <div className="p-3 bg-purple-100/70 border-2 border-slate-900 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  {/* Speaking Animated Equalizer / Soundwaves */}
                  {isSpeaking ? (
                    <div className="flex items-center gap-1 h-5 px-1">
                      <span className="w-1.5 h-4 bg-purple-600 rounded-full animate-bounce [animation-delay:0ms]" />
                      <span className="w-1.5 h-5 bg-purple-600 rounded-full animate-bounce [animation-delay:150ms]" />
                      <span className="w-1.5 h-3 bg-purple-600 rounded-full animate-bounce [animation-delay:300ms]" />
                      <span className="w-1.5 h-5 bg-purple-600 rounded-full animate-bounce [animation-delay:200ms]" />
                    </div>
                  ) : (
                    <IconVolume className="w-5 h-5 text-purple-700 shrink-0" />
                  )}

                  <div className="overflow-hidden">
                    <span className="text-[11px] font-black uppercase text-purple-950 block">
                      {isSpeaking
                        ? 'ĐANG ĐỌC LỜI KHAI TRƯỚC TÒA...'
                        : 'GOOGLE TEXT TO SPEECH'}
                    </span>
                    <span className="text-[10px] text-purple-800 font-bold block truncate">
                      Giọng đọc pháp đình tiếng Việt
                    </span>
                  </div>
                </div>

                {/* Play / Replay button */}
                <button
                  type="button"
                  onClick={handleToggleSpeaking}
                  className={`px-3 py-1.5 rounded-xl border-2 border-slate-900 font-black text-xs uppercase shadow-pop-sm transition-transform active:translate-y-0.5 cursor-pointer flex items-center justify-center gap-1.5 ${
                    isSpeaking
                      ? 'bg-rose-500 hover:bg-rose-600 text-white'
                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                  }`}
                >
                  {isSpeaking ? (
                    <span>⏸️ TẠM DỪNG</span>
                  ) : (
                    <>
                      <IconVolume className="w-3.5 h-3.5" />
                      <span>🔊 PHÁT LỜI KHAI</span>
                    </>
                  )}
                </button>
              </div>

              {/* Status Note */}
              <div className="text-[11px] font-bold text-slate-600 border-t border-slate-200 pt-2 flex items-center justify-between">
                <span>Trạng thái bị cáo:</span>
                <span className="font-black text-slate-900 uppercase">
                  {isMeAuthor
                    ? '[BẠN HÃY TÌM CÁCH CÃI CÙN ĐỂ GỠ TỘI]'
                    : '[CẢ PHÒNG CHUẨN BỊ PHÁN XÉT]'}
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
                  {
                    text: 'CÓ TỘI!',
                    label: 'Có tội',
                    color: 'bg-red-400 hover:bg-red-500 text-white font-black',
                  },
                  {
                    text: 'HAHA!',
                    label: 'Cười ngất',
                    color: 'bg-yellow-200 hover:bg-yellow-300 text-slate-950',
                  },
                  {
                    text: 'VẼ XẤU!',
                    label: 'Vẽ xấu',
                    color: 'bg-rose-200 hover:bg-rose-300 text-rose-950',
                  },
                  {
                    text: 'LƯƠN LẸO!',
                    label: 'Lươn lẹo',
                    color: 'bg-amber-100 hover:bg-amber-200 text-amber-950',
                  },
                  {
                    text: 'VÔ TỘI!',
                    label: 'Vô tội',
                    color: 'bg-emerald-200 hover:bg-emerald-300 text-emerald-950',
                  },
                ].map((item) => (
                  <button
                    key={item.text}
                    type="button"
                    onClick={() => {
                      partyAudio.playEmotePop();
                      onSendReaction(item.text);
                    }}
                    className={`px-2.5 py-1 text-xs font-black uppercase hover:scale-105 active:scale-95 transition-transform rounded-xl border-2 border-slate-900 shadow-pop-sm cursor-pointer shrink-0 ${item.color}`}
                    title={item.label}
                  >
                    {item.text}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Suspect Roster Carousel / Thumbnails */}
        <div className="pt-4 border-t-2 border-slate-900">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black uppercase text-slate-700">
              Danh sách vật chứng ({currentIndex + 1}/{totalPlayers}):
            </span>
            <span className="text-[11px] font-bold text-slate-500">
              {localPlayer.isHost
                ? '(Bấm vào bị cáo để chuyển xem tranh)'
                : '(Chủ Tọa điều khiển phiên tranh tụng)'}
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {gameState.players.map((p, idx) => {
              const isSelected = idx === currentIndex;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleJumpTo(idx)}
                  disabled={!localPlayer.isHost}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl border-2 border-slate-900 transition-all shrink-0 ${
                    isSelected
                      ? 'bg-yellow-300 shadow-pop-sm font-black -translate-y-0.5 ring-2 ring-slate-900'
                      : localPlayer.isHost
                      ? 'bg-white hover:bg-slate-100 font-bold cursor-pointer'
                      : 'bg-white font-bold opacity-80 cursor-default'
                  }`}
                >
                  <DoodleAvatar avatarId={p.avatarId} size="sm" />
                  <span className="text-xs truncate max-w-[90px]">{p.name}</span>
                  {p.sketchData ? (
                    <IconCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Banner: Advance to Voting if all reviewed */}
        {localPlayer.isHost && (
          <div className="pt-2">
            <button
              type="button"
              onClick={handleNext}
              className={`w-full py-4 rounded-2xl border-[3px] border-slate-900 font-black text-sm md:text-base uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-pop cursor-pointer active:translate-x-0.5 active:translate-y-0.5 ${
                isLastExhibit
                  ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-pop-rose animate-pulse'
                  : 'bg-amber-300 hover:bg-amber-400 text-slate-950'
              }`}
            >
              <IconGavel className="w-5 h-5" />
              <span>
                {isLastExhibit
                  ? '[ ⚖️ ĐỐI CHẤT XONG HẾT &bull; BẮT ĐẦU BỎ PHIẾU BẮT TỘI PHẠM ]'
                  : `[ CHUYỂN TIẾP SANG TRANH #${currentIndex + 2} ]`}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
