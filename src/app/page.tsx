'use client';

import React, { useState } from 'react';
import { usePartyRoom } from '@/hooks/usePartyRoom';
import { LobbyScreen } from '@/components/screens/LobbyScreen';
import { GameScreen } from '@/components/screens/GameScreen';
import { ArtistDrawScreen } from '@/components/screens/ArtistDrawScreen';
import { ArtistGuessScreen } from '@/components/screens/ArtistGuessScreen';
import { ArtistExhibitScreen } from '@/components/screens/ArtistExhibitScreen';
import { VotingScreen } from '@/components/screens/VotingScreen';
import { VerdictScreen } from '@/components/screens/VerdictScreen';
import { ScoreboardScreen } from '@/components/screens/ScoreboardScreen';
import { FloatingEmotes } from '@/components/common/FloatingEmotes';
import { FloatingChatBubble } from '@/components/game/FloatingChatBubble';
import { IconHome, IconDoor, IconGavel } from '@/components/common/FlatIcons';

export default function Home() {
  const [showExitModal, setShowExitModal] = useState(false);

  const {
    localPlayer,
    gameState,
    floatingReactions,
    connectionStatus,
    connectionMessage,
    copyNotification,
    joinCodeInput,
    setJoinCodeInput,
    setGameMode,
    setGeminiApiKey,
    sendReaction,
    sendChatMessage,
    updateProfile,
    submitCustomPrompt,
    submitSketch,
    submitGuess,
    startArtistGuessPhase,
    startArtistExhibitPhase,
    nextArtistExhibit,
    addBotPlayer,
    removePlayer,
    startAccusationPhase,
    playDefenseCard,
    playCustomCard,
    startVotingPhase,
    castVote,
    finalizeVerdict,
    nextRoundOrScoreboard,
    resetGame,
    returnToLobby,
    leaveRoom,
    copyShareLink,
    joinRoomAsGuest,
  } = usePartyRoom();

  const renderActiveScreen = () => {
    switch (gameState.phase) {
      case 'LOBBY':
        return (
          <LobbyScreen
            localPlayer={localPlayer}
            gameState={gameState}
            connectionStatus={connectionStatus}
            connectionMessage={connectionMessage}
            copyNotification={copyNotification}
            joinCodeInput={joinCodeInput}
            onSetJoinCodeInput={setJoinCodeInput}
            onJoinRoom={joinRoomAsGuest}
            onSetGameMode={setGameMode}
            onSetGeminiApiKey={setGeminiApiKey}
            onUpdateProfile={updateProfile}
            onSubmitCustomPrompt={submitCustomPrompt}
            onAddBot={addBotPlayer}
            onRemovePlayer={removePlayer}
            onSendMessage={sendChatMessage}
            onStartGame={() => startAccusationPhase(1)}
            onCopyShareLink={copyShareLink}
          />
        );

      case 'PROMPT_REVEAL':
      case 'DEFENSE':
        return (
          <GameScreen
            localPlayer={localPlayer}
            gameState={gameState}
            onPlayCard={playDefenseCard}
            onPlayCustomCard={playCustomCard}
            onFastForwardToVoting={startVotingPhase}
          />
        );

      case 'ARTIST_DRAW':
        return (
          <ArtistDrawScreen
            localPlayer={localPlayer}
            gameState={gameState}
            onSaveSketch={submitSketch}
            onFastForwardToGuess={startArtistGuessPhase}
          />
        );

      case 'ARTIST_GUESS':
        return (
          <ArtistGuessScreen
            localPlayer={localPlayer}
            gameState={gameState}
            onSubmitGuess={submitGuess}
            onFastForwardToExhibit={startArtistExhibitPhase}
          />
        );

      case 'ARTIST_EXHIBIT':
        return (
          <ArtistExhibitScreen
            localPlayer={localPlayer}
            gameState={gameState}
            onNextExhibit={nextArtistExhibit}
            onProceedToVoting={startVotingPhase}
            onSendReaction={sendReaction}
          />
        );

      case 'VOTING':
        return (
          <VotingScreen
            localPlayer={localPlayer}
            gameState={gameState}
            onCastVote={castVote}
            onFinalizeVerdict={finalizeVerdict}
          />
        );

      case 'VERDICT':
        return (
          <VerdictScreen
            localPlayer={localPlayer}
            gameState={gameState}
            onNextRoundOrScoreboard={nextRoundOrScoreboard}
          />
        );

      case 'SCOREBOARD':
        return (
          <ScoreboardScreen
            localPlayer={localPlayer}
            gameState={gameState}
            onResetGame={resetGame}
          />
        );

      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen py-4 px-3 sm:py-6 sm:px-6 md:py-8 md:px-8 flex flex-col justify-between max-w-7xl mx-auto relative pb-24">
      {/* Universal Top Court Bar: Room Info & Exit / Return Home Button */}
      <header className="w-full flex items-center justify-between gap-3 mb-6 bg-white/95 backdrop-blur-md border-[2.5px] border-slate-900 rounded-2xl p-2.5 sm:px-4 shadow-pop-sm select-none">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-xl bg-amber-400 border-2 border-slate-900 shadow-pop-xs flex items-center justify-center shrink-0">
            <IconGavel className="w-4 h-4 text-slate-950" />
          </div>
          <div className="text-left leading-tight truncate">
            <div className="flex items-center gap-1.5">
              <span className="font-display font-black text-xs sm:text-sm uppercase text-slate-950 truncate">
                TÒA ÁN BÓC PHỐT
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 bg-amber-100 border border-slate-900 rounded font-black">
                {gameState.roomId}
              </span>
            </div>
            <span className="text-[10px] font-bold text-slate-500 block truncate">
              {gameState.phase === 'LOBBY'
                ? 'Sảnh Chờ • Sẵn sàng mở tòa'
                : `Đang xử án • Hiệp ${gameState.round}/${gameState.maxRounds}`}
            </span>
          </div>
        </div>

        {/* Exit / Return Home Button */}
        <div className="flex items-center gap-2">
          {gameState.phase !== 'LOBBY' ? (
            <button
              type="button"
              onClick={() => setShowExitModal(true)}
              className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white border-2 border-slate-900 rounded-xl font-black text-xs uppercase shadow-pop-sm transition-transform active:translate-y-0.5 flex items-center gap-1.5 cursor-pointer"
              title="Thoát phiên tòa hiện tại"
            >
              <IconDoor className="w-4 h-4 shrink-0" />
              <span>[ THOÁT GAME ]</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowExitModal(true)}
              className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-slate-900 border-2 border-slate-900 rounded-xl font-black text-xs uppercase shadow-pop-sm transition-transform active:translate-y-0.5 flex items-center gap-1.5 cursor-pointer"
              title={localPlayer.isHost ? 'Tạo phòng mới' : 'Rời phòng'}
            >
              <IconHome className="w-4 h-4 shrink-0" />
              <span>{localPlayer.isHost ? '[ TẠO PHÒNG MỚI ]' : '[ 🚪 RỜI PHÒNG ]'}</span>
            </button>
          )}
        </div>
      </header>

      {/* Dynamic Screen View */}
      <div className="flex-1 flex flex-col justify-center">
        {renderActiveScreen()}
      </div>

      {/* Floating Comic Sticker Reaction Engine + Beside: Floating Chat Bubble */}
      <FloatingEmotes
        reactions={floatingReactions}
        onSendReaction={(stickerText) => sendReaction(stickerText, localPlayer.name)}
        rightSlot={
          <FloatingChatBubble
            localPlayer={localPlayer}
            players={gameState.players}
            messages={gameState.chatMessages || []}
            onSendMessage={sendChatMessage}
          />
        }
      />

      {/* Universal Exit Confirmation Modal */}
      {showExitModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in select-none">
          <div className="bg-white border-[3px] border-slate-900 rounded-3xl max-w-md w-full p-6 shadow-pop-lg space-y-4">
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-500 text-white border-2 border-slate-900 flex items-center justify-center shadow-pop-xs">
                  <IconDoor className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-slate-900 uppercase font-display">
                  {gameState.phase !== 'LOBBY' ? 'XÁC NHẬN THOÁT PHIÊN TÒA' : 'XÁC NHẬN RỜI PHÒNG'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowExitModal(false)}
                className="w-7 h-7 rounded-xl bg-slate-100 hover:bg-slate-200 border-2 border-slate-900 flex items-center justify-center font-black text-xs uppercase cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs md:text-sm font-semibold text-slate-700 leading-relaxed">
              {gameState.phase !== 'LOBBY'
                ? 'Bạn muốn tạm dừng phiên tòa này? Bạn có thể đưa phòng về lại sảnh chờ hoặc thoát hẳn về trang chủ ban đầu mà không cần reload trang.'
                : localPlayer.isHost
                ? 'Bạn muốn làm mới mã phòng và tạo lại một phiên tòa mới từ đầu?'
                : 'Bạn muốn rời khỏi phòng của Chủ Tọa và quay trở về trang chủ?'}
            </p>

            <div className="flex flex-col gap-2.5 pt-2 border-t-2 border-slate-900">
              {/* Option 1: Return to Lobby (if in active game and is host) */}
              {gameState.phase !== 'LOBBY' && localPlayer.isHost && (
                <button
                  type="button"
                  onClick={() => {
                    returnToLobby();
                    setShowExitModal(false);
                  }}
                  className="w-full py-2.5 px-4 bg-yellow-300 hover:bg-yellow-400 border-2 border-slate-900 rounded-xl font-black text-xs uppercase shadow-pop-sm flex items-center justify-center gap-2 transition-transform active:translate-y-0.5 cursor-pointer"
                >
                  <span>[ ↩ VỀ SẢNH CHỜ (LOBBY) ]</span>
                </button>
              )}

              {/* Option 2: Leave room / Return to fresh home */}
              <button
                type="button"
                onClick={() => {
                  leaveRoom();
                  setShowExitModal(false);
                }}
                className="w-full py-2.5 px-4 bg-rose-500 hover:bg-rose-600 text-white border-2 border-slate-900 rounded-xl font-black text-xs uppercase shadow-pop-sm flex items-center justify-center gap-2 transition-transform active:translate-y-0.5 cursor-pointer"
              >
                <span>
                  {gameState.phase !== 'LOBBY'
                    ? '[ 🚪 THOÁT HẲN VỀ TRANG CHỦ ]'
                    : localPlayer.isHost
                    ? '[ 🔄 TẠO MÃ PHÒNG MỚI ]'
                    : '[ 🚪 RỜI PHÒNG VỀ TRANG CHỦ ]'}
                </span>
              </button>

              {/* Cancel Button */}
              <button
                type="button"
                onClick={() => setShowExitModal(false)}
                className="w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 border-2 border-slate-900 rounded-xl font-black text-xs uppercase text-slate-700 cursor-pointer"
              >
                [ ✕ TIẾP TỤC Ở LẠI ]
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Playful Footer */}
      <footer className="mt-12 text-center text-xs font-bold text-slate-500 space-y-1 select-none">
        <p>
          <span className="font-black text-slate-800">TÒA ÁN BÓC PHỐT</span> &bull; Web Party Game thuần Việt &bull; P2P WebRTC Multiplayer Serverless
        </p>
        <p className="text-[11px] text-slate-400">
          Chế độ: <span className="font-black text-slate-700">{gameState.gameMode}</span> &bull; Kết nối bạn bè từ xa qua link mời Zalo / Messenger!
        </p>
      </footer>
    </main>
  );
}
