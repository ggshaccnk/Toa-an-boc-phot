'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Player, ChatMessage } from '@/types/party';
import { DoodleAvatar } from '@/components/common/DoodleAvatar';
import { IconCrown, IconMessageCircle } from '@/components/common/FlatIcons';
import { partyAudio } from '@/lib/partyAudio';

interface FloatingChatBubbleProps {
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
  'Chủ phòng mở tòa đi nào!',
  'Thách ai cãi lại tui!',
];

export const FloatingChatBubble: React.FC<FloatingChatBubbleProps> = ({
  localPlayer,
  players,
  messages,
  onSendMessage,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [inputText, setInputText] = useState('');
  const [latestToast, setLatestToast] = useState<ChatMessage | null>(null);

  const prevCountRef = useRef(messages.length);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Monitor incoming messages for unread count & Facebook-style speech balloon teaser
  useEffect(() => {
    if (messages.length > prevCountRef.current) {
      const newMsg = messages[messages.length - 1];

      if (!isOpen) {
        if (newMsg.senderId !== localPlayer.id) {
          setUnreadCount((prev) => prev + 1);
          setLatestToast(newMsg);

          if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
          toastTimerRef.current = setTimeout(() => {
            setLatestToast(null);
          }, 4500);
        }
      } else {
        // Auto scroll to latest if opened
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 50);
      }
    }
    prevCountRef.current = messages.length;
  }, [messages, isOpen, localPlayer.id]);

  // Clean up toast timer
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const handleToggleOpen = () => {
    partyAudio.playEmotePop();
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState) {
      setUnreadCount(0);
      setLatestToast(null);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 80);
    }
  };

  const handleClose = () => {
    partyAudio.playCardHover();
    setIsOpen(false);
  };

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
    <div className="relative pointer-events-auto">
      {/* 1. Facebook-style Floating Message Teaser Speech Bubble (When closed) */}
      {latestToast && !isOpen && (
        <div
          onClick={handleToggleOpen}
          className="absolute bottom-16 right-0 mb-2 w-60 sm:w-68 p-3 bg-white/95 backdrop-blur-md border-[2.5px] border-slate-900 rounded-2xl shadow-pop text-xs cursor-pointer hover:scale-105 transition-transform z-50 animate-bounce-short select-none"
        >
          <div className="flex items-center justify-between gap-1.5 border-b border-slate-200 pb-1">
            <div className="flex items-center gap-1.5 overflow-hidden">
              <DoodleAvatar avatarId={latestToast.avatarId} size="sm" />
              <span className="font-black text-[11px] text-slate-900 truncate">
                {latestToast.senderName}
              </span>
            </div>
            <span className="text-[9px] font-mono text-slate-400">vừa nhắn</span>
          </div>
          <p className="mt-1 text-slate-800 text-[11px] font-bold line-clamp-2 italic">
            &ldquo;{latestToast.text}&rdquo;
          </p>
        </div>
      )}

      {/* 2. Floating Circular Chat Bubble Head (Facebook Messenger Style) */}
      <button
        type="button"
        onClick={handleToggleOpen}
        title={isOpen ? 'Thu nhỏ khung chat' : 'Mở kênh chat trực tiếp'}
        className={`relative w-11 h-11 sm:w-12 sm:h-12 rounded-2xl border-[2.5px] border-slate-900 flex items-center justify-center transition-all cursor-pointer shadow-pop active:translate-y-0.5 ${
          isOpen
            ? 'bg-yellow-400 ring-2 ring-yellow-500 scale-105'
            : 'bg-white hover:bg-yellow-300'
        }`}
      >
        <IconMessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-slate-950" />

        {/* Unread Counter Badge */}
        {unreadCount > 0 && !isOpen && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-[20px] px-1 bg-rose-600 text-white font-black text-[10px] rounded-full border-2 border-slate-900 flex items-center justify-center animate-bounce shadow-pop-xs">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* 3. Pop-up Floating Chat Window (Anchored Above the Bubble) */}
      {isOpen && (
        <div className="fixed bottom-16 sm:bottom-20 right-2 sm:right-4 z-50 w-[94vw] sm:w-[380px] max-w-md h-[490px] max-h-[75vh] flex flex-col bg-white border-[3px] border-slate-900 rounded-3xl shadow-pop-lg overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="bg-yellow-300 border-b-[2.5px] border-slate-900 px-4 py-2.5 flex items-center justify-between select-none shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-white border-2 border-slate-900 flex items-center justify-center shadow-pop-xs">
                <IconMessageCircle className="w-4 h-4 text-slate-950" />
              </div>
              <div className="leading-tight">
                <h3 className="text-xs font-black uppercase text-slate-950 tracking-wide font-display">
                  TRÒ CHUYỆN PHÁP ĐÌNH
                </h3>
                <span className="text-[10px] font-bold text-slate-700 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  {players.length} người trong phòng
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="w-7 h-7 rounded-xl bg-white hover:bg-slate-100 border-2 border-slate-900 flex items-center justify-center font-black text-xs uppercase cursor-pointer shadow-pop-xs active:translate-y-0.5"
              title="Thu nhỏ"
            >
              ✕
            </button>
          </div>

          {/* Messages Scroll Box */}
          <div className="flex-1 p-3 bg-paper-cream overflow-y-auto space-y-2.5">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <div className="w-10 h-10 rounded-2xl bg-white border-2 border-slate-900 shadow-pop-sm flex items-center justify-center mb-2">
                  <IconMessageCircle className="w-5 h-5 text-slate-400" />
                </div>
                <p className="text-xs font-black text-slate-700 uppercase">
                  Chưa có tin nhắn nào!
                </p>
                <p className="text-[11px] font-bold text-slate-500 max-w-xs mt-0.5">
                  Hãy gửi tin nhắn đầu tiên để khuấy động không khí trước phiên tòa!
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.senderId === localPlayer.id;
                const isHost = players.find((p) => p.id === msg.senderId)?.isHost;

                return (
                  <div
                    key={msg.id}
                    className={`flex gap-2 items-end ${
                      isMe ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {!isMe && (
                      <div className="shrink-0 mb-1">
                        <DoodleAvatar avatarId={msg.avatarId} size="sm" />
                      </div>
                    )}

                    <div
                      className={`max-w-[80%] px-3 py-2 rounded-2xl border-2 border-slate-900 text-xs shadow-pop-sm space-y-0.5 ${
                        isMe
                          ? 'bg-yellow-200 text-slate-950 rounded-br-xs'
                          : msg.isBot
                          ? 'bg-purple-100 border-purple-900 text-purple-950 rounded-bl-xs'
                          : 'bg-white text-slate-900 rounded-bl-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 border-b border-black/10 pb-0.5">
                        <div className="flex items-center gap-1 overflow-hidden">
                          <span className="font-black text-[11px] truncate">
                            {msg.senderName}
                          </span>
                          {isHost && (
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

                      <p className="font-semibold text-xs leading-relaxed break-words whitespace-pre-wrap">
                        {msg.text}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Chat Presets Rail */}
          <div className="p-1.5 bg-amber-50 border-t-2 border-slate-900 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            {QUICK_CHAT_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleQuickPreset(preset)}
                className="px-2.5 py-1 bg-white hover:bg-yellow-200 border border-slate-900 rounded-xl text-[10px] font-bold text-slate-800 whitespace-nowrap shadow-pop-xs transition-transform active:translate-y-0.5 shrink-0 cursor-pointer"
              >
                {preset}
              </button>
            ))}
          </div>

          {/* Input & Send Form */}
          <form
            onSubmit={handleSubmit}
            className="p-2.5 bg-white border-t-2 border-slate-900 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Nhập tiếng lòng của bạn..."
              maxLength={120}
              className="flex-1 px-3 py-2 text-xs font-bold text-slate-900 bg-paper-cream border-2 border-slate-900 rounded-xl shadow-pop-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="px-3.5 py-2 bg-yellow-400 hover:bg-yellow-500 disabled:opacity-50 border-2 border-slate-900 rounded-xl font-black text-xs uppercase shadow-pop-sm transition-transform active:translate-y-0.5 cursor-pointer shrink-0"
            >
              GỬI
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
