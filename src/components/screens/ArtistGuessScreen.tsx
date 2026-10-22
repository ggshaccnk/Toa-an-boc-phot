'use client';

import React, { useState } from 'react';
import { Player, GameState } from '@/types/party';
import { DoodleAvatar } from '@/components/common/DoodleAvatar';
import { DoodleClock, RubberStamp, WashiTape } from '@/components/common/HandDoodles';
import { IconSearch } from '@/components/common/FlatIcons';
import { partyAudio } from '@/lib/partyAudio';

interface ArtistGuessScreenProps {
  localPlayer: Player;
  gameState: GameState;
  onSubmitGuess: (guessText: string) => void;
  onFastForwardToExhibit: () => void;
}

export const ArtistGuessScreen: React.FC<ArtistGuessScreenProps> = ({
  localPlayer,
  gameState,
  onSubmitGuess,
  onFastForwardToExhibit,
}) => {
  const [guessInput, setGuessInput] = useState('');

  const myPlayerState =
    gameState.players.find((p) => p.id === localPlayer.id) || localPlayer;

  // The player whose sketch localPlayer is assigned to guess
  const targetPlayer = gameState.players.find(
    (p) => p.id === myPlayerState.targetSketchPlayerId
  );

  const hasGuessed = !!myPlayerState.guessedAction;

  const guessedCount = gameState.players.filter((p) => !!p.guessedAction).length;
  const allGuessed = guessedCount === gameState.players.length;

  const handleConfirmGuess = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = guessInput.trim();
    if (!clean) return;

    partyAudio.playGavelStrike();
    onSubmitGuess(clean);
  };

  return (
    <div className={`w-full max-w-4xl mx-auto space-y-6 ${gameState.screenShaking ? 'animate-shake' : ''}`}>
      {/* Top Court Header Bar */}
      <div className="p-4 bg-white border-[2.5px] border-slate-900 rounded-3xl shadow-pop flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-purple-400 border-2 border-slate-900 rounded-xl shadow-pop-sm flex items-center gap-1.5 font-black text-xs uppercase tracking-wide">
            <span className="font-mono">HIỆP {gameState.round}/{gameState.maxRounds}</span>
            <span className="text-[10px] text-purple-950">[ĐOÁN MÒ LỜI KHAI]</span>
          </div>
          <span className="text-xs md:text-sm font-black text-slate-800 uppercase tracking-tight">
            {allGuessed
              ? '✓ TẤT CẢ ĐÃ NỘP XONG • CHỜ CHỦ TỌA MỞ TÒA ĐỐI CHẤT'
              : hasGuessed
              ? '✓ BẠN ĐÃ NỘP LỜI KHAI • CHỜ CÁC NHÂN CHỨNG KHÁC'
              : 'NHÂN CHỨNG: BẠN ĐOÁN XEM TÊN NÀY ĐANG VẼ GÌ?'}
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
              onClick={onFastForwardToExhibit}
              className="px-3 py-1.5 bg-slate-100 hover:bg-yellow-300 border-2 border-slate-900 rounded-xl text-xs font-black uppercase shadow-pop-sm transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>MỞ PHIÊN TÒA →</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Guess Area */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: The mystery swapped sketch */}
        <div className="md:col-span-6 p-5 bg-paper-cream border-[3px] border-slate-900 rounded-3xl shadow-pop-lg flex flex-col items-center justify-between space-y-4">
          <div className="w-full flex items-center justify-between border-b-2 border-slate-900 pb-2">
            <div className="flex items-center gap-2">
              <RubberStamp text="VẬT CHỨNG" color="red" />
              <h3 className="text-xs md:text-sm font-black uppercase text-slate-900 font-display">
                BẢN PHÁC HỌA BÍ MẬT CẦN DIỄN GIẢI
              </h3>
            </div>
            <WashiTape text="CHƯA CÓ LỜI KHAI" color="bg-rose-300 text-rose-950" />
          </div>

          {/* Sketch Canvas Image */}
          <div className="relative p-2 bg-white border-2 border-slate-900 rounded-2xl shadow-pop-md w-full max-w-[320px] aspect-square flex items-center justify-center overflow-hidden">
            {targetPlayer?.sketchData ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={targetPlayer.sketchData}
                alt="Bức tranh bí mật"
                className="w-full h-full object-contain rounded-xl"
              />
            ) : (
              <div className="text-center p-4">
                <IconSearch className="w-8 h-8 mx-auto mb-1 text-slate-400" />
                <p className="text-xs font-bold text-slate-500">
                  Đang tải bức tranh bí mật từ bị cáo...
                </p>
              </div>
            )}

            <div className="absolute bottom-2 left-2">
              <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-slate-900 text-white rounded-md">
                Bị cáo: ???
              </span>
            </div>
          </div>

          <p className="text-xs font-bold text-slate-600 text-center italic">
            &ldquo;Hãy nhìn kỹ từng nét vẽ nguệch ngoạc và diễn giải xem tên này đang làm trò gì!&rdquo;
          </p>
        </div>

        {/* Right Column: Testimony Input Form */}
        <div className="md:col-span-6 p-5 bg-white border-[3px] border-slate-900 rounded-3xl shadow-pop-lg flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2 mb-3">
              <div className="flex items-center gap-2">
                <RubberStamp text="LỜI KHAI" color="purple" />
                <h3 className="text-xs md:text-sm font-black uppercase text-slate-900 font-display">
                  NHÂN CHỨNG ĐỐI CHẤT
                </h3>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <span className="text-xs font-black uppercase text-slate-700 block">
                Cáo trạng đang điều tra:
              </span>
              <div className="p-3 bg-amber-50 border-2 border-slate-900 rounded-2xl text-xs font-bold text-slate-900">
                &ldquo;{gameState.currentPrompt?.scenario}&rdquo;
              </div>
            </div>

            {hasGuessed ? (
              <div className="p-4 bg-emerald-50 border-2 border-emerald-900 rounded-2xl text-center space-y-3">
                <div className="inline-block">
                  <RubberStamp text="ĐÃ GHI NHẬN" color="green" />
                </div>
                <h4 className="text-sm font-black text-slate-900">
                  LỜI KHAI CỦA BẠN ĐÃ ĐƯỢC CHUYỂN TỚI TÒA:
                </h4>
                <p className="text-sm font-black text-emerald-900 bg-white p-3 rounded-xl border border-emerald-800 italic">
                  &ldquo;{myPlayerState.guessedAction}&rdquo;
                </p>
                <p className="text-[11px] font-bold text-slate-500">
                  Chờ các nhân chứng khác nộp lời khai xong để mở phiên đối chất công khai!
                </p>
              </div>
            ) : (
              <form onSubmit={handleConfirmGuess} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-black uppercase text-slate-800">
                      Theo bạn, tên này lúc đó ĐANG LÀM GÌ để chối tội?
                    </label>
                    <span className="text-[10px] font-bold text-slate-400">
                      {guessInput.length}/120 ký tự
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    maxLength={120}
                    value={guessInput}
                    onChange={(e) => setGuessInput(e.target.value)}
                    placeholder="Tự ghi lại suy đoán của bạn: Ví dụ: Đang trèo tường trốn nợ, đang giấu tang vật vào nồi cơm, đang giả vờ hóa đá..."
                    className="w-full p-3.5 text-xs md:text-sm font-bold bg-slate-50 hover:bg-white border-2 border-slate-900 rounded-2xl shadow-pop-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all resize-none leading-relaxed"
                    autoFocus
                  />
                  <p className="text-[11px] text-slate-500 mt-1 italic">
                    * Lời khai của bạn sẽ được Tòa Án đọc to trước toàn thể phòng xét xử!
                  </p>
                </div>

                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={!guessInput.trim()}
                    className={`w-full py-3 rounded-2xl border-2 border-slate-900 font-black text-xs md:text-sm uppercase tracking-wide shadow-pop transition-all flex items-center justify-center gap-2 ${
                      guessInput.trim()
                        ? 'bg-purple-600 hover:bg-purple-700 text-white cursor-pointer active:translate-y-0.5 shadow-pop-md'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed border-slate-400'
                    }`}
                  >
                    <span>[ NỘP LỜI KHAI VÀO HỒ SƠ TÒA ]</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Quick Roster Tracker */}
          <div className="pt-3 border-t-2 border-slate-900 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-600">
              Tiến độ nhân chứng nộp lời khai:
            </span>
            <span className="font-mono font-black text-purple-900 bg-purple-100 px-2 py-0.5 rounded border border-purple-800">
              {guessedCount}/{gameState.players.length} ĐÃ NỘP
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
