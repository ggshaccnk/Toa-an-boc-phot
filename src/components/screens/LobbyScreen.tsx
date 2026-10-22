'use client';

import React, { useState } from 'react';
import { Player, GameState, GameMode } from '@/types/party';
import { AVATAR_PRESETS } from '@/data/avatars';
import { DoodleAvatar } from '@/components/common/DoodleAvatar';
import { partyAudio } from '@/lib/partyAudio';
import {
  DoodleGavel,
  DoodleScale,
  DoodleBomb,
  DoodleDetective,
  DoodlePen,
  DoodleDice,
  WashiTape,
  RubberStamp,
} from '@/components/common/HandDoodles';

interface LobbyScreenProps {
  localPlayer: Player;
  gameState: GameState;
  connectionStatus: string;
  connectionMessage: string;
  copyNotification: string | null;
  joinCodeInput: string;
  onSetJoinCodeInput: (code: string) => void;
  onJoinRoom: (code: string) => void;
  onSetGameMode: (mode: GameMode) => void;
  onSetGeminiApiKey: (key: string) => void;
  onUpdateProfile: (name: string, avatarId: string) => void;
  onSubmitCustomPrompt: (text: string) => void;
  onAddBot: () => void;
  onRemovePlayer: (id: string) => void;
  onStartGame: () => void;
  onCopyShareLink: () => void;
}

export const LobbyScreen: React.FC<LobbyScreenProps> = ({
  localPlayer,
  gameState,
  connectionStatus,
  connectionMessage,
  copyNotification,
  joinCodeInput,
  onSetJoinCodeInput,
  onJoinRoom,
  onSetGameMode,
  onSetGeminiApiKey,
  onUpdateProfile,
  onSubmitCustomPrompt,
  onAddBot,
  onRemovePlayer,
  onStartGame,
  onCopyShareLink,
}) => {
  const [nameInput, setNameInput] = useState(localPlayer.name);
  const [selectedAvatar, setSelectedAvatar] = useState(localPlayer.avatarId);
  const [profileSavedBadge, setProfileSavedBadge] = useState(false);
  const [customPromptInput, setCustomPromptInput] = useState('');
  const [isGeneratingAiPrompt, setIsGeneratingAiPrompt] = useState(false);
  const [geminiKeyInput, setGeminiKeyInput] = useState(gameState.geminiApiKey || '');
  const [showAiSettings, setShowAiSettings] = useState(false);
  const [isTestingAi, setIsTestingAi] = useState(false);
  const [aiTestResult, setAiTestResult] = useState<{
    scenario: string;
    title: string;
    source: string;
    authorName?: string;
  } | null>(null);
  const [isMuted, setIsMuted] = useState(partyAudio.getMuted());
  const [isBgmPlaying, setIsBgmPlaying] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showMultiplayerHelper, setShowMultiplayerHelper] = useState(false);

  // Profile Save
  const handleSaveProfile = () => {
    partyAudio.playCardPlay();
    onUpdateProfile(nameInput, selectedAvatar);
    setProfileSavedBadge(true);
    setTimeout(() => setProfileSavedBadge(false), 2500);
  };

  const handleAvatarSelect = (avatarId: string) => {
    setSelectedAvatar(avatarId);
    partyAudio.playCardHover();
    onUpdateProfile(nameInput, avatarId);
  };

  // Submit Secret Custom Prompt
  const handleSendPrompt = () => {
    if (!customPromptInput.trim()) return;
    onSubmitCustomPrompt(customPromptInput);
    setCustomPromptInput('');
  };

  // Request AI Prompt Suggestion
  const handleGetAiPromptSuggestion = async () => {
    try {
      setIsGeneratingAiPrompt(true);
      partyAudio.playCardHover();

      const res = await fetch('/api/gemini/generate-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: gameState.geminiApiKey }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.scenario) {
          setCustomPromptInput(data.scenario);
        }
      }
    } catch (e) {
      console.warn('AI prompt error:', e);
    } finally {
      setIsGeneratingAiPrompt(false);
    }
  };

  const toggleSound = () => {
    const muted = partyAudio.toggleMute();
    setIsMuted(muted);
    if (muted) setIsBgmPlaying(false);
  };

  const toggleBgm = () => {
    if (isBgmPlaying) {
      partyAudio.stopBGM();
      setIsBgmPlaying(false);
    } else {
      partyAudio.startBGM('lobby');
      setIsBgmPlaying(true);
    }
  };

  const canStart = gameState.players.length >= 3;

  const GAME_MODES: {
    id: GameMode;
    title: string;
    badge: string;
    description: string;
    tag: string;
    color: string;
  }[] = [
    {
      id: 'CLASSIC',
      title: 'Phiên Tòa Dân Sự',
      badge: 'TIÊU CHUẨN',
      description: '3 hiệp xử án hài hước, cãi cùn dí dỏm, gắn kết bạn bè.',
      tag: '[ ⚖️ DÂN SỰ ]',
      color: 'bg-blue-100 text-blue-900 border-blue-800',
    },
    {
      id: 'CHAOS',
      title: 'Tòa Án Cực Đoan',
      badge: 'SIÊU HỖN LOẠN',
      description: 'Gấp đôi thẻ Hỗn Loạn: Bom nổ chậm lây lan, Tráo hồ sơ, Phản đòn!',
      tag: '[ 💣 BOM NỔ ]',
      color: 'bg-rose-100 text-rose-900 border-rose-800',
    },
    {
      id: 'SHADOW',
      title: 'Tòa Án Giấu Mặt',
      badge: 'ẨN DANH 100%',
      description: 'Bỏ phiếu bí mật nặc danh, thủ phạm chỉ lộ diện khi tuyên án!',
      tag: '[ 🕵️ NẶC DANH ]',
      color: 'bg-purple-100 text-purple-900 border-purple-800',
    },
    {
      id: 'ARTIST',
      title: 'Họa Sĩ Biện Hộ',
      badge: 'VẼ & ĐOÁN MÒ 🎨',
      description: 'Phác họa lúc đó đang làm gì, tráo tranh cho người khác đoán mò rồi ra tòa đấu tố!',
      tag: '[ 🎨 HỘI HỌA ]',
      color: 'bg-amber-100 text-amber-950 border-amber-800',
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Top Banner & Header */}
      <div className="relative p-6 bg-white border-[2.5px] border-slate-900 rounded-3xl shadow-pop flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-400 border-2 border-slate-900 shadow-pop-sm flex items-center justify-center shrink-0 animate-wobble-slow p-2">
            <DoodleGavel className="w-full h-full" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <WashiTape text="PARTY ONLINE 3-8 NGƯỜI TỪ XA" color="bg-rose-500 text-white" />
              <RubberStamp text="P2P WEBRTC MESH" color="purple" />
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight font-display">
              TÒA ÁN BÓC PHỐT ⚖️
            </h1>
            <p className="text-xs md:text-sm font-semibold text-slate-600">
              Chơi cùng bạn bè khắp mọi miền &bull; Mở link trên điện thoại hoặc máy tính!
            </p>
          </div>
        </div>

        {/* Action button controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* BGM button */}
          <button
            onClick={toggleBgm}
            title={isBgmPlaying ? 'Tắt nhạc nền' : 'Bật nhạc nền kịch tính'}
            className={`px-3 py-2 border-2 border-slate-900 rounded-2xl shadow-pop-sm transition-all font-black text-xs ${
              isBgmPlaying
                ? 'bg-yellow-300 text-slate-950 animate-pulse'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            {isBgmPlaying ? '[ ♫ NHẠC: BẬT ]' : '[ ♫ NHẠC NỀN ]'}
          </button>

          {/* Sound Mute */}
          <button
            onClick={toggleSound}
            title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 border-2 border-slate-900 rounded-2xl shadow-pop-sm font-black text-xs text-slate-800 transition-all"
          >
            {isMuted ? '[ LOA: TẮT ]' : '[ LOA: BẬT ]'}
          </button>

          <button
            onClick={() => setShowMultiplayerHelper(true)}
            className="px-3 py-2 bg-blue-100 hover:bg-blue-200 border-2 border-slate-900 rounded-2xl shadow-pop-sm font-black text-xs text-blue-900 transition-all"
          >
            [ CÁCH CHƠI TỪ XA? ]
          </button>
        </div>
      </div>

      {/* REMOTE MULTIPLAYER CONNECTION BAR */}
      <div className="p-4 bg-paper-cream border-[2.5px] border-slate-900 rounded-3xl shadow-pop flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Host Room Code & Share Invite Link */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 px-3 py-2 bg-white border-2 border-slate-900 rounded-2xl shadow-pop-sm">
            <span className="text-xs font-black uppercase text-slate-700">PHÒNG HIỆN TẠI:</span>
            <span className="text-sm font-black text-slate-950 font-mono tracking-wider">
              {gameState.roomId}
            </span>
          </div>

          {localPlayer.isHost && (
            <button
              onClick={onCopyShareLink}
              type="button"
              className="flex-1 md:flex-initial px-4 py-2 bg-emerald-400 hover:bg-emerald-500 border-2 border-slate-900 rounded-2xl shadow-pop-sm font-black text-xs uppercase text-slate-950 flex items-center justify-center gap-1.5 transition-transform active:translate-y-0.5 cursor-pointer"
            >
              <span>[ 🔗 SAO CHÉP LINK MỜI BẠN BÈ ]</span>
            </button>
          )}
        </div>

        {/* Right: Join Another Room Input */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <input
            type="text"
            value={joinCodeInput}
            onChange={(e) => onSetJoinCodeInput(e.target.value.toUpperCase())}
            placeholder="Nhập mã phòng bạn bè..."
            maxLength={10}
            className="px-3 py-2 text-xs font-black uppercase font-mono bg-white border-2 border-slate-900 rounded-xl shadow-pop-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 w-full sm:w-48"
          />
          <button
            type="button"
            onClick={() => onJoinRoom(joinCodeInput)}
            disabled={!joinCodeInput.trim()}
            className="px-4 py-2 bg-yellow-300 hover:bg-yellow-400 disabled:opacity-50 border-2 border-slate-900 rounded-xl font-black text-xs uppercase shadow-pop-sm shrink-0 transition-transform active:translate-y-0.5 cursor-pointer"
          >
            [ VÀO PHÒNG ]
          </button>
        </div>
      </div>

      {/* Realtime Status Notice */}
      <div className="flex items-center justify-between px-4 py-2 bg-white border-2 border-slate-900 rounded-2xl text-xs font-bold text-slate-700 shadow-pop-sm">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>{connectionMessage}</span>
        </div>
        <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
          {localPlayer.isHost ? 'VAI TRÒ: CHỦ TỌA' : 'VAI TRÒ: BỊ CÁO THAM GIA'}
        </span>
      </div>

      {copyNotification && (
        <div className="text-center py-2 px-4 bg-emerald-200 border-2 border-emerald-900 text-emerald-950 font-black text-xs rounded-xl shadow-pop animate-pulse">
          {copyNotification}
        </div>
      )}

      {/* NEW: HÒM THƯ BÓC PHỐT BÍ MẬT (PLAYER CUSTOM PROMPT BOX) */}
      <div className="p-5 bg-yellow-50 border-[2.5px] border-slate-900 rounded-3xl shadow-pop space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-slate-900 pb-2">
          <div className="flex items-center gap-2">
            <RubberStamp text="HÒM THƯ BÍ MẬT" color="red" />
            <h2 className="text-sm md:text-base font-black text-slate-900 uppercase font-display">
              TỰ SOẠN CÂU CÁO TRẠNG BÓC PHỐT BẠN BÈ ({gameState.customPromptsPool?.length || 0} CÂU ĐÃ NỘP)
            </h2>
          </div>
          <span className="text-[11px] font-bold text-slate-600">
            Hệ thống sẽ lấy chính câu này để xét xử trong trận!
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={customPromptInput}
              onChange={(e) => setCustomPromptInput(e.target.value)}
              placeholder="VD: Ai là người vay tiền mua trà sữa xong giả vờ mất trí nhớ?"
              maxLength={120}
              className="flex-1 px-3 py-2 text-xs md:text-sm font-semibold bg-white border-2 border-slate-900 rounded-xl shadow-pop-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
            <button
              type="button"
              onClick={handleGetAiPromptSuggestion}
              disabled={isGeneratingAiPrompt}
              className="px-3 py-2 bg-amber-200 hover:bg-amber-300 border-2 border-slate-900 rounded-xl font-black text-xs uppercase flex items-center justify-center gap-1.5 shadow-pop-sm shrink-0 transition-transform active:translate-y-0.5"
            >
              <DoodleDice className="w-4 h-4 shrink-0" />
              <span>{isGeneratingAiPrompt ? 'Đang tạo...' : '🎲 GỢI Ý CÂU BẰNG AI'}</span>
            </button>
            <button
              type="button"
              onClick={handleSendPrompt}
              disabled={!customPromptInput.trim()}
              className="px-4 py-2 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white border-2 border-slate-900 rounded-xl font-black text-xs uppercase shadow-pop-sm shrink-0 transition-transform active:translate-y-0.5"
            >
              [ 📬 NỘP CÁO TRẠNG ]
            </button>
          </div>

          {/* List of submitted prompts summary */}
          {gameState.customPromptsPool && gameState.customPromptsPool.length > 0 && (
            <div className="pt-2 flex flex-wrap gap-1.5">
              <span className="text-[10px] font-black uppercase text-slate-700 py-0.5">
                Các vụ án ẩn danh trong hòm thư:
              </span>
              {gameState.customPromptsPool.map((p, idx) => (
                <span
                  key={p.id}
                  className="px-2 py-0.5 bg-white border border-slate-900 rounded-md text-[10px] font-bold text-slate-800 shadow-pop-sm"
                >
                  #{idx + 1}: &ldquo;{p.scenario.slice(0, 30)}...&rdquo;
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* GAME MODE SELECTION TABS */}
      <div className="p-5 bg-white border-[2.5px] border-slate-900 rounded-3xl shadow-pop space-y-3">
        <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2">
          <div className="flex items-center gap-2">
            <RubberStamp text="CHẾ ĐỘ XỬ ÁN" color="amber" />
            <h2 className="text-sm md:text-base font-black text-slate-900 uppercase font-display">
              CHỌN THỂ THỨC PHIÊN TÒA ({GAME_MODES.length} CHẾ ĐỘ)
            </h2>
          </div>
          <span className="text-[11px] font-bold text-slate-500">
            {localPlayer.isHost ? 'Chủ tọa chọn thể thức' : 'Theo quyền chủ tọa'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {GAME_MODES.map((mode) => {
            const isSelected = gameState.gameMode === mode.id;

            return (
              <div
                key={mode.id}
                onClick={() => localPlayer.isHost && onSetGameMode(mode.id)}
                className={`p-3.5 rounded-2xl border-2 border-slate-900 transition-all select-none cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-yellow-300 ring-2 ring-slate-900 shadow-pop -translate-y-1'
                    : 'bg-paper-cream hover:bg-white shadow-pop-sm'
                } ${!localPlayer.isHost ? 'cursor-default' : ''}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black border ${mode.color}`}>
                      {mode.badge}
                    </span>
                    <span className="font-mono font-black text-xs text-slate-800">{mode.tag}</span>
                  </div>
                  <h4 className="text-sm font-black text-slate-900 font-display uppercase">
                    {mode.title}
                  </h4>
                  <p className="text-xs text-slate-600 font-medium mt-1 leading-snug">
                    {mode.description}
                  </p>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-300 flex items-center justify-between text-[11px] font-bold">
                  <span className={isSelected ? 'text-slate-950 font-black' : 'text-slate-400'}>
                    {isSelected ? '[ ✓ ĐANG CHỌN ]' : '[ BẤM ĐỂ CHỌN ]'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Avatar Customizer & Player Roster */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Player Identity / Avatar Studio (5 cols) */}
        <div className="md:col-span-5 p-5 bg-white border-[2.5px] border-slate-900 rounded-3xl shadow-pop space-y-4">
          <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2">
            <h2 className="text-base font-black text-slate-900 uppercase font-display">
              HỒ SƠ BỊ CÁO CỦA BẠN
            </h2>
            <RubberStamp text="ID THÀNH VIÊN" color="purple" />
          </div>

          {/* Current Avatar Highlight & Rename Box */}
          <div className="flex flex-col items-center justify-center p-4 bg-paper-cream border-2 border-slate-900 rounded-2xl space-y-3">
            <DoodleAvatar avatarId={selectedAvatar} size="lg" />
            
            <div className="w-full space-y-2">
              <label className="block text-left text-[11px] font-black uppercase text-slate-700">
                Tên hiển thị của bạn:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  maxLength={20}
                  placeholder="Nhập biệt danh..."
                  className="flex-1 px-3 py-2 text-center text-sm font-black text-slate-900 bg-white border-2 border-slate-900 rounded-xl shadow-pop-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  className="px-3.5 py-2 bg-yellow-400 hover:bg-yellow-500 border-2 border-slate-900 rounded-xl font-black text-xs uppercase shadow-pop-sm shrink-0 transition-transform active:translate-y-0.5 cursor-pointer"
                >
                  [ LƯU ]
                </button>
              </div>

              {profileSavedBadge && (
                <div className="text-center py-1 bg-emerald-100 border border-emerald-800 text-emerald-900 font-black text-[11px] rounded-lg">
                  ✓ ĐÃ LƯU TÊN MỚI THÀNH CÔNG!
                </div>
              )}
            </div>
          </div>

          {/* Choose Avatar Grid */}
          <div>
            <label className="block text-xs font-black text-slate-700 uppercase mb-2">
              Chọn Nhân Vật Đại Diện ({AVATAR_PRESETS.length} mẫu):
            </label>
            <div className="grid grid-cols-4 gap-2">
              {AVATAR_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleAvatarSelect(preset.id)}
                  className={`p-1.5 rounded-2xl border-2 border-slate-900 transition-all ${
                    selectedAvatar === preset.id
                      ? 'bg-yellow-300 shadow-pop-sm scale-105 ring-2 ring-slate-900'
                      : 'bg-slate-50 hover:bg-slate-100 hover:scale-100'
                  }`}
                >
                  <DoodleAvatar avatarId={preset.id} size="sm" />
                </button>
              ))}
            </div>
          </div>

          {/* Optional Gemini API Key Drawer Toggle */}
          <div className="pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowAiSettings(!showAiSettings)}
                className="text-[11px] font-black uppercase text-purple-700 hover:underline flex items-center gap-1"
              >
                [ ⚙️ CẤU HÌNH GOOGLE GEMINI API KEY (TÙY CHỌN) ]
              </button>
              {gameState.geminiApiKey ? (
                <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-400">
                  ● ĐÃ KÍCH HOẠT
                </span>
              ) : (
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                  Chế độ dự phòng
                </span>
              )}
            </div>

            {showAiSettings && (
              <div className="mt-2 p-3 bg-purple-50 border border-purple-800 rounded-xl space-y-2.5">
                <span className="text-[10px] text-slate-700 block font-medium">
                  Nhập API Key Google Gemini để AI tự động sáng tạo cáo trạng vô hạn (hoặc cài biến môi trường <code className="font-bold">GEMINI_API_KEY</code> trên Vercel):
                </span>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={geminiKeyInput}
                    onChange={(e) => setGeminiKeyInput(e.target.value)}
                    placeholder="AIzaSy..."
                    className="flex-1 px-2.5 py-1.5 text-xs font-mono bg-white border border-slate-900 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      onSetGeminiApiKey(geminiKeyInput);
                      partyAudio.playCardPlay();
                    }}
                    className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs rounded-lg border border-slate-900 shadow-pop-sm"
                  >
                    Lưu Key
                  </button>
                </div>

                {/* Test Ping Gemini Button */}
                <div className="pt-1">
                  <button
                    type="button"
                    disabled={isTestingAi}
                    onClick={async () => {
                      setIsTestingAi(true);
                      setAiTestResult(null);
                      try {
                        const res = await fetch('/api/gemini/generate-prompt', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ apiKey: geminiKeyInput || gameState.geminiApiKey }),
                        });
                        if (res.ok) {
                          const data = await res.json();
                          setAiTestResult({
                            scenario: data.scenario,
                            title: data.title,
                            source: data.source || 'gemini',
                            authorName: data.authorName || 'Google Gemini 1.5 Flash',
                          });
                        }
                      } catch (e) {
                        console.error('Test AI error:', e);
                      } finally {
                        setIsTestingAi(false);
                      }
                    }}
                    className="w-full py-1.5 bg-yellow-300 hover:bg-yellow-400 disabled:opacity-50 text-slate-950 font-black text-[11px] uppercase rounded-lg border border-slate-900 shadow-pop-sm transition-transform active:translate-y-0.5"
                  >
                    {isTestingAi ? 'ĐANG KẾT NỐI VÀ KIỂM TRA GEMINI...' : '[ 🧪 BẤM ĐỂ THỬ XEM GEMINI ĐÃ CHẠY CHƯA ]'}
                  </button>
                </div>

                {/* Display Test Result if available */}
                {aiTestResult && (
                  <div className="p-2.5 bg-white border-2 border-purple-900 rounded-xl space-y-1 animate-fade-in shadow-pop-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-purple-800">
                        {aiTestResult.source === 'gemini' ? '✨ GEMINI ĐÃ SẴN SÀNG!' : '🎲 CHẾ ĐỘ TỰ SINH DỰ PHÒNG'}
                      </span>
                      <span className="text-[9px] font-mono text-slate-500">
                        {aiTestResult.authorName}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-900 leading-snug">
                      &ldquo;{aiTestResult.scenario}&rdquo;
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Court Jury Roster (7 cols) */}
        <div className="md:col-span-7 p-5 bg-white border-[2.5px] border-slate-900 rounded-3xl shadow-pop flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2 mb-3">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-slate-900 uppercase font-display">
                  HỘI ĐỒNG XỬ ÁN ({gameState.players.length}/8 NGƯỜI)
                </h2>
              </div>
              <WashiTape text="TỐI THIỂU 3 NGƯỜI" color="bg-blue-200 text-blue-950" />
            </div>

            {/* Players List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[260px] overflow-y-auto pr-1">
              {gameState.players.map((p) => (
                <div
                  key={p.id}
                  className="p-2.5 bg-paper-cream border-2 border-slate-900 rounded-2xl flex items-center justify-between shadow-pop-sm"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <DoodleAvatar avatarId={p.avatarId} size="sm" />
                    <div className="truncate">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-slate-900 truncate">
                          {p.name}
                        </span>
                        {p.isHost && (
                          <span className="px-1.5 py-0.2 bg-amber-400 text-[9px] font-black rounded border border-slate-900">
                            CHỦ TỌA
                          </span>
                        )}
                        {p.isBot && (
                          <span className="px-1.5 py-0.2 bg-purple-200 text-[9px] font-bold rounded border border-purple-800">
                            BOT AI
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-semibold text-slate-500 block truncate">
                        {p.customPrompt ? '✓ Đã nộp cáo trạng' : 'Chưa nộp cáo trạng'}
                      </span>
                    </div>
                  </div>

                  {localPlayer.isHost && p.id !== localPlayer.id && (
                    <button
                      onClick={() => onRemovePlayer(p.id)}
                      title="Xóa khỏi phòng"
                      className="px-2 py-0.5 text-xs font-black text-rose-700 bg-rose-100 hover:bg-rose-200 rounded-lg border border-rose-400"
                    >
                      [ ✕ ]
                    </button>
                  )}
                </div>
              ))}

              {gameState.players.length < 3 && (
                <div className="p-3 bg-amber-50 border-2 border-dashed border-amber-500 rounded-2xl col-span-full text-center">
                  <p className="text-xs font-bold text-amber-900">
                    ⚠️ Cần ít nhất 3 người để bắt đầu. Hãy bấm nút &ldquo;+ Thêm Bot Lập Dị&rdquo; hoặc gửi link mời bạn bè!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Bot & Room Action Row */}
          <div className="space-y-3 pt-2 border-t-2 border-slate-900">
            <div className="flex flex-wrap items-center gap-2">
              {localPlayer.isHost ? (
                <button
                  type="button"
                  onClick={onAddBot}
                  disabled={gameState.players.length >= 8}
                  className="flex-1 py-2 px-3 bg-blue-100 hover:bg-blue-200 disabled:opacity-50 text-blue-950 font-black text-xs uppercase border-2 border-slate-900 rounded-xl shadow-pop-sm flex items-center justify-center gap-1.5 transition-transform active:translate-y-0.5"
                >
                  + THÊM BOT LẬP DỊ (AI)
                </button>
              ) : (
                <div className="flex-1 py-2 px-3 bg-slate-100 border-2 border-slate-900 rounded-xl text-center text-xs font-bold text-slate-700">
                  Đang trong phòng của Chủ Tọa &bull; Chờ lệnh mở tòa...
                </div>
              )}

              <button
                type="button"
                onClick={() => setShowRulesModal(true)}
                className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-900 font-black text-xs border-2 border-slate-900 rounded-xl shadow-pop-sm"
              >
                [ ? LUẬT CHƠI ]
              </button>
            </div>

            {/* Giant Start Button */}
            {localPlayer.isHost ? (
              <button
                type="button"
                onClick={onStartGame}
                disabled={!canStart}
                className={`w-full py-3.5 rounded-2xl border-[2.5px] border-slate-900 font-black text-sm md:text-base uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-pop active:translate-x-0.5 active:translate-y-0.5 ${
                  canStart
                    ? 'bg-rose-500 hover:bg-rose-600 text-white cursor-pointer shadow-pop-red hover:shadow-pop'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed border-slate-400'
                }`}
              >
                {canStart
                  ? `[ BẮT ĐẦU: ${GAME_MODES.find((m) => m.id === gameState.gameMode)?.title.toUpperCase()} (3 HIỆP) ⚖️ ]`
                  : `[ CẦN THÊM ${3 - gameState.players.length} NGƯỜI ĐỂ MỞ TÒA ]`}
              </button>
            ) : (
              <div className="w-full py-3.5 bg-yellow-300 border-[2.5px] border-slate-900 rounded-2xl text-center font-black text-slate-950 uppercase shadow-pop animate-pulse">
                [ BẠN ĐÃ SẴN SÀNG &bull; CHỜ CHỦ TỌA BẤM MỞ TÒA ]
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rules Modal */}
      {showRulesModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border-[3px] border-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-pop-lg space-y-4">
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3">
              <h3 className="text-lg font-black text-slate-900 uppercase font-display flex items-center gap-2">
                <RubberStamp text="QUY TẮC" color="amber" />
                CẨM NANG BÓC PHỐT &amp; SINH TỒN
              </h3>
              <button
                onClick={() => setShowRulesModal(false)}
                className="px-2.5 py-1 bg-slate-100 border-2 border-slate-900 font-black rounded-xl text-xs hover:bg-slate-200"
              >
                [ ✕ ĐÓNG ]
              </button>
            </div>

            <div className="space-y-3 text-xs md:text-sm text-slate-800 leading-relaxed">
              <div className="p-3 bg-amber-50 border-2 border-slate-900 rounded-xl">
                <p className="font-black text-slate-950 mb-1">
                  1. Giai đoạn 1: Khởi tố Cáo Trạng
                </p>
                <p>Hệ thống tự động ưu tiên các câu do người chơi trong phòng nộp vào **Hòm Thư Bí Mật** hoặc sinh tự động bằng Gemini AI.</p>
              </div>

              <div className="p-3 bg-blue-50 border-2 border-slate-900 rounded-xl">
                <p className="font-black text-slate-950 mb-1">
                  2. Giai đoạn 2: Bào Chữa Bằng Thẻ Bài &amp; Tự Chế (30s)
                </p>
                <p>Chọn 1 lá bài lý do ngớ ngẩn có sẵn, kích hoạt thẻ Hỗn Loạn (*Bom Nổ Chậm*, *Gương Phản Chiếu*...), hoặc **Tự Gõ Lời Bào Chữa Của Riêng Bạn**!</p>
              </div>

              <div className="p-3 bg-rose-50 border-2 border-slate-900 rounded-xl">
                <p className="font-black text-slate-950 mb-1">
                  3. Giai đoạn 3: Bỏ Phiếu Chỉ Tay &amp; Tuyên Án
                </p>
                <p>Đếm ngược 20 giây: Mọi người chĩa ngón tay vào người nhìn khả nghi nhất. Người bị nhiều phiếu nhất bị đóng dấu **BUSTED!** và phải chịu 1 hình phạt meme công khai!</p>
              </div>
            </div>

            <button
              onClick={() => setShowRulesModal(false)}
              className="w-full py-2.5 bg-yellow-400 hover:bg-yellow-500 border-2 border-slate-900 rounded-xl font-black text-xs uppercase shadow-pop-sm"
            >
              [ ĐÃ HIỂU, CHO TÔI VÀO XỬ ÁN NGAY! ]
            </button>
          </div>
        </div>
      )}

      {/* Multiplayer Helper Modal */}
      {showMultiplayerHelper && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border-[3px] border-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-pop-lg space-y-4">
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3">
              <h3 className="text-lg font-black text-slate-900 uppercase font-display flex items-center gap-2">
                <RubberStamp text="KẾT NỐI TỪ XA" color="purple" />
                HƯỚNG DẪN CHƠI CHUNG TRÊN VERCEL
              </h3>
              <button
                onClick={() => setShowMultiplayerHelper(false)}
                className="px-2.5 py-1 bg-slate-100 border-2 border-slate-900 font-black rounded-xl text-xs hover:bg-slate-200"
              >
                [ ✕ ĐÓNG ]
              </button>
            </div>

            <div className="space-y-3 text-xs md:text-sm text-slate-800 leading-relaxed">
              <div className="p-3 bg-emerald-50 border-2 border-slate-900 rounded-xl">
                <p className="font-black text-slate-950 mb-1">
                  Cách 1: Gửi Link Trực Tiếp (Tiện nhất cho Zalo / Messenger)
                </p>
                <p>Chủ phòng bấm nút <span className="font-black text-emerald-800">[ 🔗 SAO CHÉP LINK MỜI BẠN BÈ ]</span> rồi gửi link cho bạn bè. Bạn bè bấm vào link trên điện thoại hoặc máy tính sẽ tự động vào phòng ngay lập tức!</p>
              </div>

              <div className="p-3 bg-yellow-50 border-2 border-slate-900 rounded-xl">
                <p className="font-black text-slate-950 mb-1">
                  Cách 2: Nhập Mã Phòng
                </p>
                <p>Đọc mã phòng (VD: <span className="font-mono font-black">{gameState.roomId}</span>) cho bạn bè. Họ nhập mã vào ô &ldquo;Nhập mã phòng bạn bè...&rdquo; và bấm &ldquo;Vào Phòng&rdquo;.</p>
              </div>

              <div className="p-3 bg-purple-50 border-2 border-slate-900 rounded-xl">
                <p className="font-black text-slate-950 mb-1">
                  Công Nghệ P2P WebRTC:
                </p>
                <p>Game kết nối trực tiếp thiết bị với thiết bị qua giao thức WebRTC DataChannels và máy chủ STUN của Google, hoàn toàn miễn phí, độ trễ cực thấp và tương thích 100% với nền tảng Vercel Serverless!</p>
              </div>
            </div>

            <button
              onClick={() => setShowMultiplayerHelper(false)}
              className="w-full py-2.5 bg-yellow-400 hover:bg-yellow-500 border-2 border-slate-900 rounded-xl font-black text-xs uppercase shadow-pop-sm"
            >
              [ ĐÃ HIỂU, ĐÓNG HƯỚNG DẪN ]
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
