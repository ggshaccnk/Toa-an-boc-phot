export type GamePhase =
  | 'LOBBY'
  | 'PROMPT_REVEAL'
  | 'DEFENSE'
  | 'VOTING'
  | 'VERDICT'
  | 'SCOREBOARD';

export type GameMode = 'CLASSIC' | 'CHAOS' | 'SHADOW';

export type CardCategory = 'alibi' | 'blame_shift' | 'chaos' | 'absurd' | 'custom';

export type ChaosModifierType =
  | 'REFLECT'
  | 'DOUBLE_DOWN'
  | 'LINK_PUPPET'
  | 'VOICE_GENZ'
  | 'BOMB_BLAST'
  | 'SWAP_VOTES';

export interface AlibiCard {
  id: string;
  title: string;
  category: CardCategory;
  tagline: string;
  description: string;
  modifierType?: ChaosModifierType;
  color: string; // Tailwind color token or hex
  badgeText: string;
  illustration: string; // SVG icon identifier or doodle name
  authorName?: string; // If player created this custom card
}

export interface AccusationPrompt {
  id: string;
  category: string;
  title: string;
  scenario: string;
  dramaticTag: string;
  penalties: string[];
}

export interface Player {
  id: string;
  name: string;
  avatarId: string;
  isHost: boolean;
  isBot: boolean;
  isReady: boolean;
  hand: AlibiCard[];
  playedCard: AlibiCard | null;
  voteTargetId: string | null;
  activeModifier?: ChaosModifierType | null;
  guiltScore: number;
  timesConvicted: number;
  lastVerdict: boolean;
  assignedPenalty: string | null;
}

export interface FloatingReaction {
  id: string;
  emoji: string;
  senderName: string;
  x: number; // percentage from left (10% to 90%)
  createdAt: number;
}

export interface GameState {
  roomId: string;
  hostId: string;
  gameMode: GameMode;
  phase: GamePhase;
  round: number;
  maxRounds: number;
  currentPrompt: AccusationPrompt | null;
  phaseTimer: number; // in seconds
  timerActive: boolean;
  players: Player[];
  convictedPlayerId: string | null;
  voteResults: Record<string, number>; // playerId -> vote count
  chaosAnnouncements: string[];
  screenShaking: boolean;
  history: {
    round: number;
    promptTitle: string;
    convictedName: string;
    penalty: string;
  }[];
}

export interface PeerMessage {
  type:
    | 'STATE_SYNC'
    | 'PLAYER_JOIN'
    | 'PLAYER_READY'
    | 'START_GAME'
    | 'PLAY_CARD'
    | 'CAST_VOTE'
    | 'NEXT_PHASE'
    | 'EMOTE_REACTION';
  payload: any;
  senderId: string;
}
