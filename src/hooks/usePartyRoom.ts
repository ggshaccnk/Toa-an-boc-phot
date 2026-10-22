'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  GameState,
  Player,
  AlibiCard,
  GamePhase,
  GameMode,
  AccusationPrompt,
  PeerMessage,
  FloatingReaction,
  ChatMessage,
} from '@/types/party';
import { ACCUSATION_PROMPTS } from '@/data/prompts';
import { MEME_CARDS } from '@/data/cards';
import { AVATAR_PRESETS, BOT_NAMES } from '@/data/avatars';
import { partyAudio } from '@/lib/partyAudio';
import { generateBotSketch, BOT_GUESS_PRESETS } from '@/lib/botArtist';
import confetti from 'canvas-confetti';

const ROUNDS_PER_MATCH = 3;
const DEFENSE_DURATION = 30; // seconds
const VOTING_DURATION = 20; // seconds

export function usePartyRoom() {
  const [localPlayer, setLocalPlayer] = useState<Player>({
    id: `p-${Math.random().toString(36).substring(2, 8)}`,
    name: 'Bạn (Luật Sư)',
    avatarId: 'cat_lawyer',
    isHost: true,
    isBot: false,
    isReady: true,
    hand: [],
    playedCard: null,
    voteTargetId: null,
    activeModifier: null,
    guiltScore: 0,
    timesConvicted: 0,
    lastVerdict: false,
    assignedPenalty: null,
    customPrompt: '',
    sketchData: null,
    targetSketchPlayerId: null,
    guessedAction: null,
  });

  const [gameState, setGameState] = useState<GameState>({
    roomId: 'BOC-' + Math.floor(100 + Math.random() * 900),
    hostId: '',
    gameMode: 'CLASSIC',
    phase: 'LOBBY',
    round: 1,
    maxRounds: ROUNDS_PER_MATCH,
    currentPrompt: null,
    phaseTimer: 0,
    timerActive: false,
    players: [],
    convictedPlayerId: null,
    voteResults: {},
    chaosAnnouncements: [],
    screenShaking: false,
    artistExhibitIndex: 0,
    customPromptsPool: [],
    usedPromptIds: [],
    geminiApiKey: '',
    chatMessages: [],
    history: [],
  });

  const [floatingReactions, setFloatingReactions] = useState<FloatingReaction[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<
    'idle' | 'hosting' | 'joining' | 'connected' | 'error'
  >('idle');
  const [connectionMessage, setConnectionMessage] = useState<string>('Chưa kết nối phòng mạng.');
  const [copyNotification, setCopyNotification] = useState<string | null>(null);
  const [joinCodeInput, setJoinCodeInput] = useState<string>('');

  const peerRef = useRef<any>(null);
  const hostConnRef = useRef<any>(null); // Guest's connection to Host
  const guestConnsRef = useRef<any[]>([]); // Host's connections to Guests
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Helper to trigger temporary screen shake
  const triggerScreenShake = useCallback(() => {
    setGameState((prev) => ({ ...prev, screenShaking: true }));
    setTimeout(() => {
      setGameState((prev) => ({ ...prev, screenShaking: false }));
    }, 600);
  }, []);

  // Broadcast message to all connected peers (Host -> all Guests)
  const broadcastToGuests = useCallback((msg: PeerMessage) => {
    guestConnsRef.current.forEach((conn) => {
      if (conn && conn.open) {
        try {
          conn.send(msg);
        } catch (err) {
          console.warn('Error broadcasting to guest:', err);
        }
      }
    });
  }, []);

  // Helper to shuffle cards and deal 4 cards per player based on mode
  const dealCards = useCallback(
    (mode: GameMode = gameState.gameMode): AlibiCard[] => {
      const chaosCards = MEME_CARDS.filter((c) => c.category === 'chaos');
      const normalCards = MEME_CARDS.filter((c) => c.category !== 'chaos');

      if (mode === 'CHAOS') {
        const shuffledChaos = [...chaosCards].sort(() => 0.5 - Math.random()).slice(0, 2);
        const shuffledNormal = [...normalCards].sort(() => 0.5 - Math.random()).slice(0, 2);
        return [...shuffledChaos, ...shuffledNormal].sort(() => 0.5 - Math.random());
      }

      const shuffled = [...MEME_CARDS].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, 4);
    },
    [gameState.gameMode]
  );

  // Update GameState and automatically sync with connected guests if Host
  const syncStateAndBroadcast = useCallback(
    (updater: (prev: GameState) => GameState) => {
      setGameState((prev) => {
        const newState = updater(prev);
        if (localPlayer.isHost) {
          broadcastToGuests({
            type: 'STATE_SYNC',
            payload: newState,
            senderId: localPlayer.id,
          });
        }
        return newState;
      });
    },
    [localPlayer.isHost, localPlayer.id, broadcastToGuests]
  );

  // Set game mode (Host only)
  const setGameMode = useCallback(
    (mode: GameMode) => {
      partyAudio.playCardHover();
      syncStateAndBroadcast((prev) => ({ ...prev, gameMode: mode }));
    },
    [syncStateAndBroadcast]
  );

  // Set Gemini API Key
  const setGeminiApiKey = useCallback(
    (key: string) => {
      syncStateAndBroadcast((prev) => ({ ...prev, geminiApiKey: key.trim() }));
    },
    [syncStateAndBroadcast]
  );

  // Send a comic soundbite reaction
  const sendReaction = useCallback(
    (emoji: string, senderName: string = localPlayer.name) => {
      const newReaction: FloatingReaction = {
        id: `react-${Date.now()}-${Math.random()}`,
        emoji,
        senderName,
        x: 15 + Math.random() * 70,
        createdAt: Date.now(),
      };

      setFloatingReactions((prev) => [...prev, newReaction]);

      if (localPlayer.isHost) {
        broadcastToGuests({
          type: 'EMOTE_REACTION',
          payload: { emoji, senderName },
          senderId: localPlayer.id,
        });
      } else if (hostConnRef.current && hostConnRef.current.open) {
        hostConnRef.current.send({
          type: 'EMOTE_REACTION',
          payload: { emoji, senderName },
          senderId: localPlayer.id,
        });
      }
    },
    [localPlayer.name, localPlayer.id, localPlayer.isHost, broadcastToGuests]
  );

  // Send a live chat message in waiting room lobby
  const sendChatMessage = useCallback(
    (text: string) => {
      const clean = text.trim();
      if (!clean) return;

      partyAudio.playEmotePop();

      const newMsg: ChatMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        senderId: localPlayer.id,
        senderName: localPlayer.name,
        avatarId: localPlayer.avatarId,
        text: clean,
        createdAt: Date.now(),
        isBot: false,
      };

      if (localPlayer.isHost) {
        syncStateAndBroadcast((prev) => {
          const existing = prev.chatMessages || [];
          const updated = [...existing, newMsg];
          if (updated.length > 60) updated.shift();
          return { ...prev, chatMessages: updated };
        });

        // If bots are present, randomly reply with witty courtroom banter
        const bots = gameState.players.filter((p) => p.isBot);
        if (bots.length > 0 && Math.random() < 0.5) {
          const bot = bots[Math.floor(Math.random() * bots.length)];
          const botReplies = [
            'Tôi nghe thấy hết đấy nhé!',
            'Chủ tọa ơi, người này nói chuyện rất đáng nghi!',
            'Chuẩn bị ra tòa cãi cùn đi là vừa!',
            'Đừng nhìn tôi, tôi là công dân gương mẫu!',
            'Ai chối cãi nhiều là người có tật giật mình nha!',
            'Lời này sẽ được ghi vào cáo trạng trước tòa!',
            'Hôm nay tôi sẽ làm chứng chống lại bạn!',
            'Ai có tật giật mình nha cả phòng!',
          ];
          const replyText = botReplies[Math.floor(Math.random() * botReplies.length)];

          setTimeout(() => {
            const botMsg: ChatMessage = {
              id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              senderId: bot.id,
              senderName: bot.name,
              avatarId: bot.avatarId,
              text: replyText,
              createdAt: Date.now(),
              isBot: true,
            };
            partyAudio.playEmotePop();
            syncStateAndBroadcast((prev) => {
              const existing = prev.chatMessages || [];
              const updated = [...existing, botMsg];
              if (updated.length > 60) updated.shift();
              return { ...prev, chatMessages: updated };
            });
          }, 1100);
        }
      } else if (hostConnRef.current && hostConnRef.current.open) {
        hostConnRef.current.send({
          type: 'CHAT_MESSAGE',
          payload: newMsg,
          senderId: localPlayer.id,
        });
      }
    },
    [localPlayer.id, localPlayer.name, localPlayer.avatarId, localPlayer.isHost, gameState.players, syncStateAndBroadcast]
  );

  // Handle incoming peer messages
  const handleIncomingMessage = useCallback(
    (data: PeerMessage) => {
      switch (data.type) {
        case 'STATE_SYNC':
          setGameState(data.payload);
          break;

        case 'UPDATE_PROFILE':
          if (localPlayer.isHost) {
            syncStateAndBroadcast((prev) => ({
              ...prev,
              players: prev.players.map((p) =>
                p.id === data.senderId
                  ? { ...p, name: data.payload.name, avatarId: data.payload.avatarId }
                  : p
              ),
            }));
          }
          break;

        case 'SUBMIT_CUSTOM_PROMPT':
          if (localPlayer.isHost) {
            syncStateAndBroadcast((prev) => {
              const existingPool = prev.customPromptsPool || [];
              const updatedPool = [
                ...existingPool.filter((p) => p.id !== data.payload.id),
                data.payload,
              ];
              return {
                ...prev,
                customPromptsPool: updatedPool,
                players: prev.players.map((p) =>
                  p.id === data.senderId ? { ...p, customPrompt: data.payload.scenario } : p
                ),
              };
            });
            setTimeout(() => {
              sendReaction('HÓNG BIẾN!', 'Hòm Thư Tố Cáo');
            }, 500);
          }
          break;

        case 'PLAYER_JOIN':
          if (localPlayer.isHost) {
            syncStateAndBroadcast((prev) => {
              if (prev.players.some((p) => p.id === data.payload.id)) return prev;
              const newGuestPlayer: Player = {
                ...data.payload,
                hand: dealCards(prev.gameMode),
                playedCard: null,
                voteTargetId: null,
                guiltScore: 0,
                timesConvicted: 0,
              };
              const updatedPlayers = [...prev.players, newGuestPlayer];
              partyAudio.playCardHover();
              return { ...prev, players: updatedPlayers };
            });
            setTimeout(() => {
              sendReaction('HÓNG BIẾN!', 'Hội Đồng Tòa Án');
            }, 600);
          }
          break;

        case 'PLAY_CARD':
          syncStateAndBroadcast((prev) => {
            const updated = prev.players.map((p) =>
              p.id === data.senderId
                ? {
                    ...p,
                    playedCard: data.payload,
                    activeModifier: data.payload.modifierType || null,
                  }
                : p
            );
            return { ...prev, players: updated };
          });
          break;

        case 'CAST_VOTE':
          syncStateAndBroadcast((prev) => {
            const updated = prev.players.map((p) =>
              p.id === data.senderId ? { ...p, voteTargetId: data.payload } : p
            );
            return { ...prev, players: updated };
          });
          break;

        case 'SUBMIT_SKETCH':
          if (localPlayer.isHost) {
            syncStateAndBroadcast((prev) => ({
              ...prev,
              players: prev.players.map((p) =>
                p.id === data.senderId ? { ...p, sketchData: data.payload.sketchData } : p
              ),
            }));
          }
          break;

        case 'SUBMIT_GUESS':
          if (localPlayer.isHost) {
            syncStateAndBroadcast((prev) => ({
              ...prev,
              players: prev.players.map((p) =>
                p.id === data.senderId ? { ...p, guessedAction: data.payload.guess } : p
              ),
            }));
          }
          break;

        case 'NEXT_EXHIBIT':
          if (localPlayer.isHost) {
            syncStateAndBroadcast((prev) => ({
              ...prev,
              artistExhibitIndex: data.payload.index,
            }));
          }
          break;

        case 'EMOTE_REACTION':
          setFloatingReactions((prev) => [
            ...prev,
            {
              id: `emote-${Date.now()}-${Math.random()}`,
              emoji: data.payload.emoji,
              senderName: data.payload.senderName,
              x: 15 + Math.random() * 70,
              createdAt: Date.now(),
            },
          ]);
          if (localPlayer.isHost) {
            broadcastToGuests(data);
          }
          break;

        case 'CHAT_MESSAGE':
          partyAudio.playEmotePop();
          if (localPlayer.isHost) {
            const incomingMsg = data.payload as ChatMessage;
            syncStateAndBroadcast((prev) => {
              const existing = prev.chatMessages || [];
              const updated = [...existing, incomingMsg];
              if (updated.length > 60) updated.shift();
              return { ...prev, chatMessages: updated };
            });
          }
          break;

        default:
          break;
      }
    },
    [localPlayer.isHost, syncStateAndBroadcast, dealCards, sendReaction, broadcastToGuests]
  );

  // Initialize WebRTC as Host
  const startHostingRoom = useCallback(async () => {
    if (typeof window === 'undefined') return;

    try {
      setConnectionStatus('hosting');
      setConnectionMessage('Đang mở cổng máy chủ P2P WebRTC...');

      const { default: Peer } = await import('peerjs');
      const cleanRoomId = gameState.roomId.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      const hostPeerId = `toa-an-${cleanRoomId}`;

      if (peerRef.current) {
        peerRef.current.destroy();
      }

      const peer = new Peer(hostPeerId, {
        debug: 1,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
          ],
        },
      });

      peerRef.current = peer;

      peer.on('open', (id) => {
        setConnectionStatus('hosting');
        setConnectionMessage(`Đang làm Chủ Tọa phòng ${gameState.roomId}. Sẵn sàng kết nối bạn bè!`);
      });

      peer.on('connection', (conn) => {
        conn.on('open', () => {
          guestConnsRef.current.push(conn);
          conn.send({
            type: 'STATE_SYNC',
            payload: gameState,
            senderId: localPlayer.id,
          });
        });

        conn.on('data', (d: any) => handleIncomingMessage(d));

        conn.on('close', () => {
          guestConnsRef.current = guestConnsRef.current.filter((c) => c !== conn);
        });
      });

      peer.on('error', (err) => {
        console.warn('PeerJS Host notice:', err);
        setConnectionMessage('Đang chạy chế độ phòng cục bộ (Sẵn sàng chơi)');
      });
    } catch (err) {
      console.warn('WebRTC hosting fallback to local:', err);
      setConnectionStatus('idle');
    }
  }, [gameState.roomId, gameState, localPlayer.id, handleIncomingMessage]);

  // Connect to an existing room as a Guest
  const joinRoomAsGuest = useCallback(
    async (targetRoomCode: string) => {
      if (typeof window === 'undefined' || !targetRoomCode.trim()) return;

      try {
        setConnectionStatus('joining');
        setConnectionMessage(`Đang kết nối tới Chủ Tọa phòng ${targetRoomCode}...`);

        const { default: Peer } = await import('peerjs');
        const cleanRoomId = targetRoomCode.trim().replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        const hostPeerId = `toa-an-${cleanRoomId}`;
        const myGuestPeerId = `khach-${localPlayer.id}`;

        if (peerRef.current) {
          peerRef.current.destroy();
        }

        const peer = new Peer(myGuestPeerId, {
          debug: 1,
          config: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:stun1.l.google.com:19302' },
              { urls: 'stun:stun2.l.google.com:19302' },
            ],
          },
        });

        peerRef.current = peer;

        peer.on('open', () => {
          const conn = peer.connect(hostPeerId, {
            reliable: true,
          });

          conn.on('open', () => {
            hostConnRef.current = conn;
            setConnectionStatus('connected');
            setConnectionMessage(`✓ Đã kết nối thành công vào phiên tòa ${targetRoomCode}!`);
            partyAudio.playVictoryFanfare();

            setLocalPlayer((prev) => ({ ...prev, isHost: false }));

            conn.send({
              type: 'PLAYER_JOIN',
              payload: { ...localPlayer, isHost: false },
              senderId: localPlayer.id,
            });
          });

          conn.on('data', (d: any) => handleIncomingMessage(d));

          conn.on('error', (e) => {
            console.warn('Guest connection error:', e);
            setConnectionStatus('error');
            setConnectionMessage('Không tìm thấy phòng hoặc chủ phòng chưa mở.');
          });

          conn.on('close', () => {
            setConnectionStatus('idle');
            setConnectionMessage('Kết nối với Chủ Tọa đã kết thúc.');
          });
        });

        peer.on('error', (err) => {
          console.warn('Peer error:', err);
          setConnectionStatus('error');
          setConnectionMessage('Lỗi kết nối P2P. Vui lòng kiểm tra mã phòng.');
        });
      } catch (err) {
        console.warn('Join room error:', err);
        setConnectionStatus('error');
        setConnectionMessage('Không thể kết nối. Thử lại sau.');
      }
    },
    [localPlayer, handleIncomingMessage]
  );

  // Auto-start hosting on initial mount & check for ?room= URL parameter
  useEffect(() => {
    setGameState((prev) => ({
      ...prev,
      hostId: localPlayer.id,
      players: [localPlayer],
    }));

    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const roomParam = urlParams.get('room');
      if (roomParam) {
        setJoinCodeInput(roomParam.toUpperCase());
        setTimeout(() => {
          joinRoomAsGuest(roomParam);
        }, 800);
      } else {
        startHostingRoom();
      }
    }
  }, []);

  // Clean up old reactions after 2.8 seconds
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      setFloatingReactions((prev) => prev.filter((r) => now - r.createdAt < 2800));
    }, 1000);
    return () => clearInterval(cleanupInterval);
  }, []);

  // Update local player profile with reliable real-time sync
  const updateProfile = useCallback(
    (name: string, avatarId: string) => {
      const cleanName = name.trim() || 'Vô Danh Luật Sư';

      setLocalPlayer((prev) => {
        const updated = { ...prev, name: cleanName, avatarId };
        return updated;
      });

      if (localPlayer.isHost) {
        syncStateAndBroadcast((g) => ({
          ...g,
          players: g.players.map((p) =>
            p.id === localPlayer.id ? { ...p, name: cleanName, avatarId } : p
          ),
        }));
      } else if (hostConnRef.current && hostConnRef.current.open) {
        hostConnRef.current.send({
          type: 'UPDATE_PROFILE',
          payload: { name: cleanName, avatarId },
          senderId: localPlayer.id,
        });
      }
    },
    [localPlayer.isHost, localPlayer.id, syncStateAndBroadcast]
  );

  // Submit Secret Custom Accusation Prompt to the pool
  const submitCustomPrompt = useCallback(
    (promptText: string) => {
      const cleaned = promptText.trim();
      if (!cleaned) return;

      const formattedScenario = cleaned.toLowerCase().startsWith('ai')
        ? cleaned
        : `Ai là người ${cleaned}?`;

      const promptObj: AccusationPrompt = {
        id: `user-prompt-${Date.now()}-${localPlayer.id}`,
        category: 'Bóc Phốt Bạn Bè',
        title: 'Cáo Trạng Nặc Danh',
        scenario: formattedScenario,
        dramaticTag: 'Tội Danh: Bị Bạn Thân Chỉ Điểm',
        penalties: [
          'Khai nhận tội lỗi và xin lỗi người tố cáo',
          'Bao cả phòng 1 chầu nước vào lần gặp tới',
          'Tự nhận mình là kẻ ngốc nghếch nhất phòng',
        ],
        authorName: localPlayer.name,
        source: 'custom',
        isAiGenerated: false,
      };

      setLocalPlayer((prev) => ({ ...prev, customPrompt: formattedScenario }));

      if (localPlayer.isHost) {
        syncStateAndBroadcast((prev) => {
          const currentPool = prev.customPromptsPool || [];
          return {
            ...prev,
            customPromptsPool: [...currentPool, promptObj],
            players: prev.players.map((p) =>
              p.id === localPlayer.id ? { ...p, customPrompt: formattedScenario } : p
            ),
          };
        });
      } else if (hostConnRef.current && hostConnRef.current.open) {
        hostConnRef.current.send({
          type: 'SUBMIT_CUSTOM_PROMPT',
          payload: promptObj,
          senderId: localPlayer.id,
        });
      }

      partyAudio.playCardPlay();
      setCopyNotification('✓ ĐÃ NỘP CÁO TRẠNG BÍ MẬT VÀO HÒM THƯ!');
      setTimeout(() => setCopyNotification(null), 3000);
    },
    [localPlayer.id, localPlayer.name, localPlayer.isHost, syncStateAndBroadcast]
  );

  // Add a quirky simulated Bot player (Host only)
  const addBotPlayer = useCallback(() => {
    if (!localPlayer.isHost) return;

    syncStateAndBroadcast((prev) => {
      if (prev.players.length >= 8) return prev;
      const botIndex = prev.players.filter((p) => p.isBot).length;
      const botPreset = BOT_NAMES[botIndex % BOT_NAMES.length];

      const newBot: Player = {
        id: `bot-${Math.random().toString(36).substring(2, 7)}`,
        name: `${botPreset.name}`,
        avatarId: botPreset.avatar,
        isHost: false,
        isBot: true,
        isReady: true,
        hand: dealCards(prev.gameMode),
        playedCard: null,
        voteTargetId: null,
        activeModifier: null,
        guiltScore: 0,
        timesConvicted: 0,
        lastVerdict: false,
        assignedPenalty: null,
      };

      partyAudio.playCardHover();
      return {
        ...prev,
        players: [...prev.players, newBot],
      };
    });
  }, [localPlayer.isHost, dealCards, syncStateAndBroadcast]);

  // Remove a player or bot (Host only)
  const removePlayer = useCallback(
    (id: string) => {
      if (!localPlayer.isHost) return;
      syncStateAndBroadcast((prev) => ({
        ...prev,
        players: prev.players.filter((p) => p.id !== id),
      }));
    },
    [localPlayer.isHost, syncStateAndBroadcast]
  );

  // Timer countdown hook
  useEffect(() => {
    if (gameState.timerActive && gameState.phaseTimer > 0) {
      timerIntervalRef.current = setInterval(() => {
        setGameState((prev) => {
          if (prev.phaseTimer <= 1) {
            clearInterval(timerIntervalRef.current!);
            return { ...prev, phaseTimer: 0, timerActive: false };
          }
          if (prev.phaseTimer <= 4) {
            partyAudio.playCountdownTick(prev.phaseTimer === 1);
          }
          return { ...prev, phaseTimer: prev.phaseTimer - 1 };
        });
      }, 1000);
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [gameState.timerActive, gameState.phaseTimer]);

  // Phase transition logic: Khởi tố (Supports Custom Prompts + AI + Anti-Repeat)
  const startAccusationPhase = useCallback(
    async (roundNum: number = 1) => {
      if (!localPlayer.isHost) return;

      partyAudio.stopBGM();
      partyAudio.playGavelStrike();
      triggerScreenShake();

      let chosenPrompt: AccusationPrompt | null = null;

      // 1. Check if there are player-submitted custom prompts in the pool
      const unusedCustomPrompts = (gameState.customPromptsPool || []).filter(
        (p) => !gameState.usedPromptIds.includes(p.id)
      );

      if (unusedCustomPrompts.length > 0) {
        chosenPrompt = unusedCustomPrompts[0];
      } else {
        // 2. Try fetching fresh AI generated prompt from Gemini endpoint
        try {
          const res = await fetch('/api/gemini/generate-prompt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              apiKey: gameState.geminiApiKey,
            }),
          });
          if (res.ok) {
            const aiData = await res.json();
            if (aiData.scenario && !gameState.usedPromptIds.includes(aiData.id)) {
              chosenPrompt = aiData;
            }
          }
        } catch (e) {
          console.warn('AI prompt fetch error, falling back to static non-repeat:', e);
        }

        // 3. Fallback to static prompt pool with strict anti-repeat
        if (!chosenPrompt) {
          const availableStatic = ACCUSATION_PROMPTS.filter(
            (p) => !gameState.usedPromptIds.includes(p.id)
          );
          if (availableStatic.length > 0) {
            chosenPrompt =
              availableStatic[Math.floor(Math.random() * availableStatic.length)];
          } else {
            // All prompts used, reshuffle
            chosenPrompt =
              ACCUSATION_PROMPTS[Math.floor(Math.random() * ACCUSATION_PROMPTS.length)];
          }
        }
      }

      const finalPrompt = chosenPrompt;

      syncStateAndBroadcast((prev) => {
        const refreshedPlayers = prev.players.map((p) => ({
          ...p,
          hand: dealCards(prev.gameMode),
          playedCard: null,
          voteTargetId: null,
          activeModifier: null,
          lastVerdict: false,
          assignedPenalty: null,
          sketchData: null,
          targetSketchPlayerId: null,
          guessedAction: null,
        }));

        const newUsedIds = [...prev.usedPromptIds, finalPrompt.id];

        return {
          ...prev,
          round: roundNum,
          currentPrompt: finalPrompt,
          phase: 'PROMPT_REVEAL',
          phaseTimer: 4,
          timerActive: true,
          players: refreshedPlayers,
          convictedPlayerId: null,
          voteResults: {},
          chaosAnnouncements: [],
          usedPromptIds: newUsedIds,
          artistExhibitIndex: 0,
        };
      });

      // Automatically transition to DEFENSE or ARTIST_DRAW phase after 4s dramatic reveal
      setTimeout(() => {
        partyAudio.playObjectionWhoosh();
        partyAudio.startBGM('court_tension');
        syncStateAndBroadcast((prev) => {
          if (prev.gameMode === 'ARTIST') {
            const updatedWithBots = prev.players.map((p) => {
              if (p.isBot) {
                return {
                  ...p,
                  sketchData: generateBotSketch(p.name, roundNum),
                };
              }
              return p;
            });

            // Asynchronously invoke Google Gemini API so each bot REALLY DRAWS a custom doodle
            prev.players.forEach((p) => {
              if (p.isBot) {
                fetch('/api/gemini/bot-draw', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    scenario: finalPrompt.scenario,
                    botName: p.name,
                    apiKey: prev.geminiApiKey,
                  }),
                })
                  .then((res) => res.json())
                  .then((data) => {
                    if (data.sketchData) {
                      syncStateAndBroadcast((s) => ({
                        ...s,
                        players: s.players.map((pl) =>
                          pl.id === p.id ? { ...pl, sketchData: data.sketchData } : pl
                        ),
                      }));
                    }
                  })
                  .catch(() => {});
              }
            });

            return {
              ...prev,
              players: updatedWithBots,
              phase: 'ARTIST_DRAW',
              phaseTimer: 60,
              timerActive: true,
            };
          }

          return {
            ...prev,
            phase: 'DEFENSE',
            phaseTimer: DEFENSE_DURATION,
            timerActive: true,
          };
        });
      }, 4200);
    },
    [
      localPlayer.isHost,
      gameState.customPromptsPool,
      gameState.usedPromptIds,
      gameState.geminiApiKey,
      dealCards,
      triggerScreenShake,
      syncStateAndBroadcast,
    ]
  );

  // Play defense card
  const playDefenseCard = useCallback(
    (card: AlibiCard) => {
      partyAudio.playCardPlay();

      setLocalPlayer((prev) => ({
        ...prev,
        playedCard: card,
        activeModifier: card.modifierType || null,
      }));

      if (localPlayer.isHost) {
        syncStateAndBroadcast((prev) => ({
          ...prev,
          players: prev.players.map((p) =>
            p.id === localPlayer.id
              ? {
                  ...p,
                  playedCard: card,
                  activeModifier: card.modifierType || null,
                }
              : p
          ),
        }));
      } else if (hostConnRef.current && hostConnRef.current.open) {
        hostConnRef.current.send({
          type: 'PLAY_CARD',
          payload: card,
          senderId: localPlayer.id,
        });
      }
    },
    [localPlayer.isHost, localPlayer.id, syncStateAndBroadcast]
  );

  // Add custom crafted card to hand & play it
  const playCustomCard = useCallback(
    (customCard: AlibiCard) => {
      setLocalPlayer((prev) => ({
        ...prev,
        hand: [customCard, ...prev.hand],
        playedCard: customCard,
        activeModifier: null,
      }));

      if (localPlayer.isHost) {
        syncStateAndBroadcast((prev) => ({
          ...prev,
          players: prev.players.map((p) =>
            p.id === localPlayer.id
              ? {
                  ...p,
                  hand: [customCard, ...p.hand],
                  playedCard: customCard,
                  activeModifier: null,
                }
              : p
          ),
        }));
      } else if (hostConnRef.current && hostConnRef.current.open) {
        hostConnRef.current.send({
          type: 'PLAY_CARD',
          payload: customCard,
          senderId: localPlayer.id,
        });
      }

      setTimeout(() => {
        sendReaction('LẬT MẶT!', 'Bảo Bào Chữa');
      }, 1000);
    },
    [localPlayer.isHost, localPlayer.id, syncStateAndBroadcast, sendReaction]
  );

  // Bot defense AI simulation during DEFENSE phase (Host only)
  useEffect(() => {
    if (gameState.phase === 'DEFENSE' && localPlayer.isHost) {
      const timer = setTimeout(() => {
        syncStateAndBroadcast((prev) => {
          const updatedPlayers = prev.players.map((p) => {
            if (p.isBot && !p.playedCard && p.hand.length > 0) {
              const randomCard = p.hand[Math.floor(Math.random() * p.hand.length)];
              return {
                ...p,
                playedCard: randomCard,
                activeModifier: randomCard.modifierType || null,
              };
            }
            return p;
          });
          return { ...prev, players: updatedPlayers };
        });
      }, 3500 + Math.random() * 3500);

      return () => clearTimeout(timer);
    }
  }, [gameState.phase, localPlayer.isHost, syncStateAndBroadcast]);

  // Submit sketch drawing (ARTIST mode)
  const submitSketch = useCallback(
    (sketchData: string) => {
      partyAudio.playGavelStrike();
      setLocalPlayer((prev) => ({ ...prev, sketchData }));

      if (localPlayer.isHost) {
        syncStateAndBroadcast((prev) => ({
          ...prev,
          players: prev.players.map((p) =>
            p.id === localPlayer.id ? { ...p, sketchData } : p
          ),
        }));
      } else if (hostConnRef.current && hostConnRef.current.open) {
        hostConnRef.current.send({
          type: 'SUBMIT_SKETCH',
          payload: { sketchData },
          senderId: localPlayer.id,
        });
      }
    },
    [localPlayer.id, localPlayer.isHost, syncStateAndBroadcast]
  );

  // Submit guess for swapped sketch (ARTIST mode)
  const submitGuess = useCallback(
    (guessText: string) => {
      partyAudio.playGavelStrike();
      const cleanGuess = guessText.trim();
      setLocalPlayer((prev) => ({ ...prev, guessedAction: cleanGuess }));

      if (localPlayer.isHost) {
        syncStateAndBroadcast((prev) => ({
          ...prev,
          players: prev.players.map((p) =>
            p.id === localPlayer.id ? { ...p, guessedAction: cleanGuess } : p
          ),
        }));
      } else if (hostConnRef.current && hostConnRef.current.open) {
        hostConnRef.current.send({
          type: 'SUBMIT_GUESS',
          payload: { guess: cleanGuess },
          senderId: localPlayer.id,
        });
      }
    },
    [localPlayer.id, localPlayer.isHost, syncStateAndBroadcast]
  );

  // Transition to ARTIST_GUESS phase (Host only)
  const startArtistGuessPhase = useCallback(() => {
    if (!localPlayer.isHost) return;
    partyAudio.playGavelStrike();
    partyAudio.playObjectionWhoosh();

    syncStateAndBroadcast((prev) => {
      const playerIds = prev.players.map((p) => p.id);
      const count = playerIds.length;
      const offset = count > 1 ? Math.max(1, Math.floor(Math.random() * (count - 1)) + 1) : 0;

      const updatedPlayers = prev.players.map((p, idx) => {
        const targetId = count > 1 ? playerIds[(idx + offset) % count] : p.id;
        let botGuess = p.guessedAction;

        if (p.isBot) {
          const randomPreset =
            BOT_GUESS_PRESETS[Math.floor(Math.random() * BOT_GUESS_PRESETS.length)];
          botGuess = randomPreset;
        }

        return {
          ...p,
          targetSketchPlayerId: targetId,
          guessedAction: botGuess,
        };
      });

      // Asynchronously invoke Gemini Multimodal Vision so each bot REALLY GUESSES what was drawn
      updatedPlayers.forEach((p) => {
        if (p.isBot) {
          const targetPlayer = prev.players.find((tp) => tp.id === p.targetSketchPlayerId);
          if (targetPlayer?.sketchData) {
            fetch('/api/gemini/bot-guess', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                imageBase64: targetPlayer.sketchData,
                scenario: prev.currentPrompt?.scenario,
                botName: p.name,
                targetName: targetPlayer.name,
                apiKey: prev.geminiApiKey,
              }),
            })
              .then((res) => res.json())
              .then((data) => {
                if (data.guess) {
                  syncStateAndBroadcast((s) => ({
                    ...s,
                    players: s.players.map((pl) =>
                      pl.id === p.id ? { ...pl, guessedAction: data.guess } : pl
                    ),
                  }));
                }
              })
              .catch(() => {});
          }
        }
      });

      return {
        ...prev,
        players: updatedPlayers,
        phase: 'ARTIST_GUESS',
        phaseTimer: 35,
        timerActive: true,
      };
    });
  }, [localPlayer.isHost, syncStateAndBroadcast]);

  // Transition to ARTIST_EXHIBIT phase (Host only)
  const startArtistExhibitPhase = useCallback(() => {
    if (!localPlayer.isHost) return;
    partyAudio.playGavelStrike();
    partyAudio.startBGM('court_tension');

    syncStateAndBroadcast((prev) => ({
      ...prev,
      phase: 'ARTIST_EXHIBIT',
      artistExhibitIndex: 0,
      phaseTimer: 0,
      timerActive: false,
    }));
  }, [localPlayer.isHost, syncStateAndBroadcast]);

  // Navigate to next/prev exhibit (Host only)
  const nextArtistExhibit = useCallback(
    (index: number) => {
      if (!localPlayer.isHost) return;
      partyAudio.playGavelStrike();

      syncStateAndBroadcast((prev) => ({
        ...prev,
        artistExhibitIndex: index,
      }));
    },
    [localPlayer.isHost, syncStateAndBroadcast]
  );

  // Auto transition from ARTIST_DRAW to ARTIST_GUESS on timer expiry or when all submitted (Host only)
  useEffect(() => {
    if (
      gameState.phase === 'ARTIST_DRAW' &&
      gameState.phaseTimer === 0 &&
      !gameState.timerActive &&
      localPlayer.isHost
    ) {
      startArtistGuessPhase();
    }
  }, [
    gameState.phase,
    gameState.phaseTimer,
    gameState.timerActive,
    localPlayer.isHost,
    startArtistGuessPhase,
  ]);

  useEffect(() => {
    if (
      gameState.phase === 'ARTIST_DRAW' &&
      gameState.players.length > 0 &&
      gameState.players.every((p) => !!p.sketchData) &&
      localPlayer.isHost
    ) {
      const timer = setTimeout(() => {
        startArtistGuessPhase();
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [
    gameState.phase,
    gameState.players,
    localPlayer.isHost,
    startArtistGuessPhase,
  ]);

  // Auto transition from ARTIST_GUESS to ARTIST_EXHIBIT on timer expiry or when all guessed (Host only)
  useEffect(() => {
    if (
      gameState.phase === 'ARTIST_GUESS' &&
      gameState.phaseTimer === 0 &&
      !gameState.timerActive &&
      localPlayer.isHost
    ) {
      startArtistExhibitPhase();
    }
  }, [
    gameState.phase,
    gameState.phaseTimer,
    gameState.timerActive,
    localPlayer.isHost,
    startArtistExhibitPhase,
  ]);

  useEffect(() => {
    if (
      gameState.phase === 'ARTIST_GUESS' &&
      gameState.players.length > 0 &&
      gameState.players.every((p) => !!p.guessedAction) &&
      localPlayer.isHost
    ) {
      const timer = setTimeout(() => {
        startArtistExhibitPhase();
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [
    gameState.phase,
    gameState.players,
    localPlayer.isHost,
    startArtistExhibitPhase,
  ]);

  // Transition to VOTING phase (Host only)
  const startVotingPhase = useCallback(() => {
    if (!localPlayer.isHost) return;
    partyAudio.playGavelStrike();
    partyAudio.startBGM('voting_suspense');
    syncStateAndBroadcast((prev) => ({
      ...prev,
      phase: 'VOTING',
      phaseTimer: VOTING_DURATION,
      timerActive: true,
    }));
  }, [localPlayer.isHost, syncStateAndBroadcast]);

  // When defense timer runs out, automatically go to voting (Host only)
  useEffect(() => {
    if (
      gameState.phase === 'DEFENSE' &&
      gameState.phaseTimer === 0 &&
      !gameState.timerActive &&
      localPlayer.isHost
    ) {
      startVotingPhase();
    }
  }, [
    gameState.phase,
    gameState.phaseTimer,
    gameState.timerActive,
    localPlayer.isHost,
    startVotingPhase,
  ]);

  // Cast vote on a suspect
  const castVote = useCallback(
    (suspectId: string) => {
      partyAudio.playVoteClick();
      setLocalPlayer((prev) => ({ ...prev, voteTargetId: suspectId }));

      if (localPlayer.isHost) {
        syncStateAndBroadcast((prev) => ({
          ...prev,
          players: prev.players.map((p) =>
            p.id === localPlayer.id ? { ...p, voteTargetId: suspectId } : p
          ),
        }));
      } else if (hostConnRef.current && hostConnRef.current.open) {
        hostConnRef.current.send({
          type: 'CAST_VOTE',
          payload: suspectId,
          senderId: localPlayer.id,
        });
      }
    },
    [localPlayer.isHost, localPlayer.id, syncStateAndBroadcast]
  );

  // Bot voting simulation during VOTING phase (Host only)
  useEffect(() => {
    if (gameState.phase === 'VOTING' && localPlayer.isHost) {
      const timer = setTimeout(() => {
        syncStateAndBroadcast((prev) => {
          const eligibleTargets = prev.players;
          const updatedPlayers = prev.players.map((bot) => {
            if (bot.isBot && !bot.voteTargetId) {
              const candidates = eligibleTargets.filter((c) => c.id !== bot.id);
              const target =
                candidates[Math.floor(Math.random() * candidates.length)] || candidates[0];
              return {
                ...bot,
                voteTargetId: target ? target.id : null,
              };
            }
            return bot;
          });
          return { ...prev, players: updatedPlayers };
        });
      }, 2500 + Math.random() * 3000);

      return () => clearTimeout(timer);
    }
  }, [gameState.phase, localPlayer.isHost, syncStateAndBroadcast]);

  // Finalize verdict, tally votes, resolve chaos cards (Host only)
  const finalizeVerdict = useCallback(() => {
    if (!localPlayer.isHost) return;

    partyAudio.stopBGM();
    partyAudio.playGavelStrike();
    triggerScreenShake();

    syncStateAndBroadcast((prev) => {
      const votes: Record<string, number> = {};
      prev.players.forEach((p) => {
        if (p.voteTargetId) {
          votes[p.voteTargetId] = (votes[p.voteTargetId] || 0) + 1;
        }
      });

      // Find the maximum number of votes received
      let maxVotes = 0;
      Object.values(votes).forEach((count) => {
        if (count > maxVotes) {
          maxVotes = count;
        }
      });

      // Collect all culprits who received maxVotes (Tie Handling)
      let culpritIds: string[] = [];
      if (maxVotes === 0) {
        // If nobody voted, pick the first player
        culpritIds = prev.players.length > 0 ? [prev.players[0].id] : [];
      } else {
        culpritIds = Object.entries(votes)
          .filter(([_, count]) => count === maxVotes)
          .map(([pId]) => pId);
      }

      const isTieVote = culpritIds.length > 1;

      const chaosMessages: string[] = [];
      const prompt = prev.currentPrompt;
      const penalty =
        prompt?.penalties[Math.floor(Math.random() * prompt.penalties.length)] ||
        'Phải thừa nhận mình là kẻ ngốc nhất bàn và tự giác làm trò hề!';

      if (isTieVote) {
        const tiedNames = prev.players
          .filter((p) => culpritIds.includes(p.id))
          .map((p) => p.name)
          .join(' & ');
        chaosMessages.push(
          `[HÒA PHIẾU BẤT PHÂN THẮNG BẠI] ${tiedNames} cùng nhận số phiếu ngang nhau (${maxVotes} phiếu)! Tòa phán quyết: ĐỒNG PHẠM CÙNG LÃNH ÁN!`
        );
      }

      // Check chaos modifiers for all culprits
      let finalGuiltyIds = [...culpritIds];
      culpritIds.forEach((cId) => {
        const culprit = prev.players.find((p) => p.id === cId);
        if (culprit?.activeModifier === 'REFLECT') {
          chaosMessages.push(
            `[GƯƠNG PHẢN CHIẾU] ${culprit.name} phản đòn! Kẻ vote ${culprit.name} bị dính phạt!`
          );
        } else if (culprit?.activeModifier === 'BOMB_BLAST') {
          chaosMessages.push(
            `[BOM NỔ CHẬM] ${culprit.name} kích hoạt bom khiến các bị cáo lân cận dính miểng phạt!`
          );
        } else if (culprit?.activeModifier === 'SWAP_VOTES') {
          const others = prev.players.filter((p) => !culpritIds.includes(p.id));
          const scapegoat = others[0] || others[others.length - 1];
          if (scapegoat) {
            finalGuiltyIds = finalGuiltyIds.filter((id) => id !== cId).concat(scapegoat.id);
            chaosMessages.push(
              `[TRÁO ĐỔI HỒ SƠ] ${culprit.name} tẩu thoát, chuyển giao ghế bị cáo cho ${scapegoat.name}!`
            );
          }
        } else if (culprit?.activeModifier === 'LINK_PUPPET') {
          const others = prev.players.filter((p) => !culpritIds.includes(p.id));
          const scapegoat = others[Math.floor(Math.random() * others.length)];
          if (scapegoat && !finalGuiltyIds.includes(scapegoat.id)) {
            finalGuiltyIds.push(scapegoat.id);
            chaosMessages.push(
              `[KÉO ĐỒNG BỌN] ${culprit.name} kéo theo ${scapegoat.name} cùng chịu chung án phạt!`
            );
          }
        }
      });

      const updatedPlayers = prev.players.map((p) => {
        const isConvicted = finalGuiltyIds.includes(p.id);
        return {
          ...p,
          guiltScore: isConvicted ? p.guiltScore + 1 : p.guiltScore,
          timesConvicted: isConvicted ? p.timesConvicted + 1 : p.timesConvicted,
          lastVerdict: isConvicted,
          assignedPenalty: isConvicted ? penalty : null,
        };
      });

      setTimeout(() => {
        partyAudio.playBustedBuzzer();
        sendReaction(isTieVote ? 'CẢ HAI CÙNG DÍNH!' : 'DÍNH CHẤU!', 'Hội Đồng');
      }, 500);

      const convictedPlayersList = prev.players.filter((p) => finalGuiltyIds.includes(p.id));
      const convictedDisplayName =
        convictedPlayersList.length > 0
          ? convictedPlayersList.map((p) => p.name).join(' & ')
          : 'Không rõ';

      const historyItem = {
        round: prev.round,
        promptTitle: prev.currentPrompt?.title || 'Vụ án bí ẩn',
        convictedName: convictedDisplayName,
        penalty,
      };

      return {
        ...prev,
        phase: 'VERDICT',
        phaseTimer: 0,
        timerActive: false,
        convictedPlayerId: finalGuiltyIds[0] || null,
        convictedPlayerIds: finalGuiltyIds,
        isTieVote: finalGuiltyIds.length > 1,
        voteResults: votes,
        chaosAnnouncements: chaosMessages,
        players: updatedPlayers,
        history: [...prev.history, historyItem],
      };
    });
  }, [localPlayer.isHost, triggerScreenShake, syncStateAndBroadcast, sendReaction]);

  // When voting timer reaches 0, trigger verdict (Host only)
  useEffect(() => {
    if (
      gameState.phase === 'VOTING' &&
      gameState.phaseTimer === 0 &&
      !gameState.timerActive &&
      localPlayer.isHost
    ) {
      finalizeVerdict();
    }
  }, [
    gameState.phase,
    gameState.phaseTimer,
    gameState.timerActive,
    localPlayer.isHost,
    finalizeVerdict,
  ]);

  // Proceed to next round or show final Hall of Shame Scoreboard
  const nextRoundOrScoreboard = useCallback(() => {
    if (!localPlayer.isHost) return;

    if (gameState.round >= gameState.maxRounds) {
      partyAudio.stopBGM();
      partyAudio.playVictoryFanfare();
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
      });
      syncStateAndBroadcast((prev) => ({
        ...prev,
        phase: 'SCOREBOARD',
      }));
    } else {
      startAccusationPhase(gameState.round + 1);
    }
  }, [
    localPlayer.isHost,
    gameState.round,
    gameState.maxRounds,
    syncStateAndBroadcast,
    startAccusationPhase,
  ]);

  // Reset and replay game
  const resetGame = useCallback(() => {
    if (!localPlayer.isHost) return;
    partyAudio.stopBGM();
    partyAudio.playGavelStrike();
    syncStateAndBroadcast((prev) => ({
      ...prev,
      phase: 'LOBBY',
      round: 1,
      currentPrompt: null,
      convictedPlayerId: null,
      voteResults: {},
      chaosAnnouncements: [],
      history: [],
      players: prev.players.map((p) => ({
        ...p,
        guiltScore: 0,
        timesConvicted: 0,
        playedCard: null,
        voteTargetId: null,
        lastVerdict: false,
        assignedPenalty: null,
      })),
    }));
  }, [localPlayer.isHost, syncStateAndBroadcast]);

  // Copy full invite link to clipboard (e.g. https://.../?room=BOC-888)
  const copyShareLink = useCallback(() => {
    if (typeof window !== 'undefined') {
      const shareUrl = `${window.location.origin}/?room=${gameState.roomId}`;
      const inviteMsg = `Bạn đã bị khởi tố tại TÒA ÁN BÓC PHỐT!\nVào nhận án và cãi cùn tại: ${shareUrl}\nMã phòng: ${gameState.roomId}`;

      navigator.clipboard.writeText(inviteMsg);
      setCopyNotification('ĐÃ SAO CHÉP LINK MỜI! DÁN VÀO ZALO / MESSENGER GỬI BẠN BÈ NGAY!');
      setTimeout(() => setCopyNotification(null), 3500);
    }
  }, [gameState.roomId]);

  return {
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
    copyShareLink,
    startHostingRoom,
    joinRoomAsGuest,
  };
}
