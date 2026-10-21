'use client';

import React from 'react';
import { usePartyRoom } from '@/hooks/usePartyRoom';
import { LobbyScreen } from '@/components/screens/LobbyScreen';
import { GameScreen } from '@/components/screens/GameScreen';
import { VotingScreen } from '@/components/screens/VotingScreen';
import { VerdictScreen } from '@/components/screens/VerdictScreen';
import { ScoreboardScreen } from '@/components/screens/ScoreboardScreen';
import { FloatingEmotes } from '@/components/common/FloatingEmotes';

export default function Home() {
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
    sendReaction,
    updateProfile,
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
            onUpdateProfile={updateProfile}
            onAddBot={addBotPlayer}
            onRemovePlayer={removePlayer}
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
    <main className="min-h-screen py-6 px-4 md:py-10 md:px-8 flex flex-col justify-between max-w-7xl mx-auto relative pb-20">
      {/* Dynamic Screen View */}
      <div className="flex-1 flex flex-col justify-center">
        {renderActiveScreen()}
      </div>

      {/* Floating Comic Sticker Reaction Engine */}
      <FloatingEmotes
        reactions={floatingReactions}
        onSendReaction={(stickerText) => sendReaction(stickerText, localPlayer.name)}
      />

      {/* Playful Footer */}
      <footer className="mt-12 text-center text-xs font-bold text-slate-500 space-y-1 select-none">
        <p>
          ⚖️ <span className="font-black text-slate-800">TÒA ÁN BÓC PHỐT</span> &bull; Web Party Game thuần Việt &bull; P2P WebRTC Multiplayer Serverless
        </p>
        <p className="text-[11px] text-slate-400">
          Chế độ: <span className="font-black text-slate-700">{gameState.gameMode}</span> &bull; Kết nối bạn bè từ xa qua link mời Zalo / Messenger!
        </p>
      </footer>
    </main>
  );
}
