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
} from '@/types/party';
import { ACCUSATION_PROMPTS } from '@/data/prompts';
import { MEME_CARDS } from '@/data/cards';
import { AVATAR_PRESETS, BOT_NAMES } from '@/data/avatars';
import { partyAudio } from '@/lib/partyAudio';
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

  // Handle incoming peer messages
  const handleIncomingMessage = useCallback(
    (data: PeerMessage) => {
      switch (data.type) {
        case 'STATE_SYNC':
          setGameState(data.payload);
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
            // Greet guest with reaction
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
          // If Host receives reaction from a guest, rebroadcast to all other guests
          if (localPlayer.isHost) {
            broadcastToGuests(data);
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
          // Send immediate state sync to newcomer
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

            // Set role as guest
            setLocalPlayer((prev) => ({ ...prev, isHost: false }));

            // Announce presence to Host
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
        // Auto join if room param exists
        setTimeout(() => {
          joinRoomAsGuest(roomParam);
        }, 800);
      } else {
        // Start hosting local room
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

  // Update local player profile
  const updateProfile = useCallback(
    (name: string, avatarId: string) => {
      setLocalPlayer((prev) => {
        const updated = { ...prev, name, avatarId };
        setGameState((g) => ({
          ...g,
          players: g.players.map((p) => (p.id === prev.id ? updated : p)),
        }));
        return updated;
      });
    },
    []
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

  // Phase transition logic: Khởi tố
  const startAccusationPhase = useCallback(
    (roundNum: number = 1) => {
      if (!localPlayer.isHost) return;

      const prompt =
        ACCUSATION_PROMPTS[Math.floor(Math.random() * ACCUSATION_PROMPTS.length)];

      partyAudio.stopBGM();
      partyAudio.playGavelStrike();
      triggerScreenShake();

      syncStateAndBroadcast((prev) => {
        const refreshedPlayers = prev.players.map((p) => ({
          ...p,
          hand: dealCards(prev.gameMode),
          playedCard: null,
          voteTargetId: null,
          activeModifier: null,
          lastVerdict: false,
          assignedPenalty: null,
        }));

        return {
          ...prev,
          round: roundNum,
          currentPrompt: prompt,
          phase: 'PROMPT_REVEAL',
          phaseTimer: 4,
          timerActive: true,
          players: refreshedPlayers,
          convictedPlayerId: null,
          voteResults: {},
          chaosAnnouncements: [],
        };
      });

      // Automatically transition to DEFENSE phase after 4s dramatic reveal
      setTimeout(() => {
        partyAudio.playObjectionWhoosh();
        partyAudio.startBGM('court_tension');
        syncStateAndBroadcast((prev) => ({
          ...prev,
          phase: 'DEFENSE',
          phaseTimer: DEFENSE_DURATION,
          timerActive: true,
        }));
      }, 4200);
    },
    [localPlayer.isHost, dealCards, triggerScreenShake, syncStateAndBroadcast]
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

      let maxVotes = -1;
      let culpritId: string | null = null;
      Object.entries(votes).forEach(([pId, count]) => {
        if (count > maxVotes) {
          maxVotes = count;
          culpritId = pId;
        }
      });

      if (!culpritId && prev.players.length > 0) {
        culpritId = prev.players[0].id;
      }

      const chaosMessages: string[] = [];
      const prompt = prev.currentPrompt;
      const penalty =
        prompt?.penalties[Math.floor(Math.random() * prompt.penalties.length)] ||
        'Phải thừa nhận mình là kẻ ngốc nhất bàn!';

      const culprit = prev.players.find((p) => p.id === culpritId);
      let finalGuiltyId = culpritId;

      if (culprit?.activeModifier === 'REFLECT') {
        chaosMessages.push(
          `⚡ GƯƠNG PHẢN CHIẾU! ${culprit.name} phản đòn! Kẻ vote ${culprit.name} bị dính phạt!`
        );
      } else if (culprit?.activeModifier === 'BOMB_BLAST') {
        chaosMessages.push(
          `💣 BOM NỔ CHẬM! ${culprit.name} kích hoạt bom khiến các bị cáo lân cận dính miểng phạt!`
        );
      } else if (culprit?.activeModifier === 'SWAP_VOTES') {
        const others = prev.players.filter((p) => p.id !== culprit.id);
        const scapegoat = others[0] || others[others.length - 1];
        if (scapegoat) {
          finalGuiltyId = scapegoat.id;
          chaosMessages.push(
            `🔄 TRÁO ĐỔI HỒ SƠ! ${culprit.name} tẩu thoát, chuyển giao ghế bị cáo cho ${scapegoat.name}!`
          );
        }
      } else if (culprit?.activeModifier === 'LINK_PUPPET') {
        const others = prev.players.filter((p) => p.id !== culprit.id);
        const scapegoat = others[Math.floor(Math.random() * others.length)];
        if (scapegoat) {
          chaosMessages.push(
            `⚡ KÉO ĐỒNG BỌN! ${culprit.name} kéo theo ${scapegoat.name} cùng chịu chung án phạt!`
          );
        }
      }

      const updatedPlayers = prev.players.map((p) => {
        const isConvicted = p.id === finalGuiltyId;
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
        sendReaction('DÍNH CHẤU!', 'Hội Đồng Xét Xử');
      }, 500);

      const historyItem = {
        round: prev.round,
        promptTitle: prev.currentPrompt?.title || 'Vụ án bí ẩn',
        convictedName: culprit?.name || 'Không rõ',
        penalty,
      };

      return {
        ...prev,
        phase: 'VERDICT',
        phaseTimer: 0,
        timerActive: false,
        convictedPlayerId: finalGuiltyId,
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
      const inviteMsg = `⚖️ Bạn đã bị khởi tố tại TÒA ÁN BÓC PHỐT!\n👉 Vào nhận án và cãi cùn tại: ${shareUrl}\nMã phòng: ${gameState.roomId}`;

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
    startHostingRoom,
    joinRoomAsGuest,
  };
}
