'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Player, ChatMessage } from '@/types/party';
import { DoodleAvatar } from '@/components/common/DoodleAvatar';
import { RubberStamp } from '@/components/common/HandDoodles';
import { IconMail, IconCrown } from '@/components/common/FlatIcons';

interface LobbyChatProps {
  localPlayer: Player;
  players: Player[];
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
}

const QUICK_CHAT_PRESETS = [
  'Chào cả phòng!',
  'Ai là thủ phạm khai mau?',
  'Tôi vô tội nha mọi người!',
  'Chuẩn bị ra tòa cãi cùn đi!',
  'Chủ tọa ơi mở tòa đi!',
];

export const LobbyChat: React.FC<LobbyChatProps> = ({
  localPlayer,
  players,
  messages,
  onSendMessage,
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = inputText.trim();
    if (!clean) return;
    onSendMessage(clean);
    setInputText('');
  };

  const handleQuickPreset = (presetText: string) => {
    onSendMessage(presetText);
  };

  const formatTime = (timestamp: number) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="p-4 md:p-5 bg-white border-[2.5px] border-slate-900 rounded-3xl shadow-pop flex flex-col justify-between space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-200 border-2 border-slate-900 flex items-center justify-center shadow-pop-sm">
            <IconMail className="w-4 h-4 text-purple-950" />
          </div>
          <div>
            <h3 className="text-xs md:text-sm font-black uppercase text-slate-900 font-display tracking-wide">
              KÊNH CHAT TRỰC TIẾP PHÒNG CHỜ
            </h3>
            <span className="text-[10px] font-bold text-slate-500">
              Trò chuyện &amp; cà khịa trước giờ mở tòa
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-black uppercase text-slate-700 font-mono">
            {players.length} ONLINE
          </span>
        </div>
      </div>

      {/* Messages Scrollbox */}
      <div className="bg-paper-cream border-2 border-slate-900 rounded-2xl p-3 h-56 md:h-64 overflow-y-auto space-y-2.5 shadow-inner">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4">
            <div className="w-10 h-10 rounded-2xl bg-white border-2 border-slate-900 shadow-pop-sm flex items-center justify-center mb-2">
              <IconMail className="w-5 h-5 text-slate-400" />
            </div>
            <p className="text-xs font-black text-slate-700 uppercase">
              Phòng chờ đang yên ắng!
            </p>
            <p className="text-[11px] font-bold text-slate-500 max-w-xs mt-0.5">
              Hãy là người đầu tiên lên tiếng chào hỏi hoặc dằn mặt các bị cáo khác trước giờ mở tòa!
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === localPlayer.id;

            return (
              <div
                key={msg.id}
                className={`flex gap-2 items-end ${
                  isMe ? 'justify-end' : 'justify-start'
                }`}
              >
                {/* Avatar for other players */}
                {!isMe && (
                  <div className="shrink-0 mb-1">
                    <DoodleAvatar avatarId={msg.avatarId} size="sm" />
                  </div>
                )}

                {/* Message Bubble */}
                <div
                  className={`max-w-[78%] px-3 py-2 rounded-2xl border-2 border-slate-900 text-xs shadow-pop-sm space-y-0.5 ${
                    isMe
                      ? 'bg-yellow-200 text-slate-950 rounded-br-xs'
                      : msg.isBot
                      ? 'bg-purple-100 border-purple-900 text-purple-950 rounded-bl-xs'
                      : 'bg-white text-slate-900 rounded-bl-xs'
                  }`}
                >
                  {/* Sender Header */}
                  <div className="flex items-center justify-between gap-2 border-b border-black/10 pb-0.5">
                    <div className="flex items-center gap-1 overflow-hidden">
                      <span className="font-black text-[11px] truncate">
                        {msg.senderName}
                      </span>
                      {players.find((p) => p.id === msg.senderId)?.isHost && (
                        <span title="Chủ phòng" className="inline-flex items-center">
                          <IconCrown className="w-3.5 h-3.5 shrink-0" />
                        </span>
                      )}
                      {isMe && (
                        <span className="text-[9px] font-bold text-amber-800">
                          (Bạn)
                        </span>
                      )}
                    </div>
                    <span className="text-[9px] font-mono text-slate-500 shrink-0">
                      {formatTime(msg.createdAt)}
                    </span>
                  </div>

                  {/* Message Body */}
                  <p className="font-semibold text-xs md:text-sm leading-snug break-words pt-0.5">
                    {msg.text}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Presets Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
        <span className="text-[10px] font-black uppercase text-slate-500 shrink-0 mr-0.5">
          Gõ nhanh:
        </span>
        {QUICK_CHAT_PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => handleQuickPreset(preset)}
            className="px-2.5 py-1 text-[11px] font-bold text-slate-800 bg-slate-100 hover:bg-yellow-200 border border-slate-900 rounded-xl shrink-0 transition-colors cursor-pointer active:translate-y-0.5 whitespace-nowrap"
          >
            {preset}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          maxLength={150}
          placeholder="Nhập tin nhắn tán gẫu phòng chờ..."
          className="flex-1 px-3.5 py-2 text-xs md:text-sm font-semibold bg-slate-50 hover:bg-white focus:bg-white border-2 border-slate-900 rounded-xl shadow-pop-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className={`px-4 py-2 rounded-xl border-2 border-slate-900 font-black text-xs md:text-sm uppercase shadow-pop-sm transition-all shrink-0 ${
            inputText.trim()
              ? 'bg-purple-600 hover:bg-purple-700 text-white cursor-pointer active:translate-y-0.5'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed border-slate-400'
          }`}
        >
          [ GỬI ]
        </button>
      </form>
    </div>
  );
};
