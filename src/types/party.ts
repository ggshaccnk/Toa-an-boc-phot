export type GamePhase =
  | 'LOBBY'
  | 'PROMPT_REVEAL'
  | 'ARTIST_DRAW'
  | 'ARTIST_GUESS'
  | 'ARTIST_EXHIBIT'
  | 'DEFENSE'
  | 'VOTING'
  | 'VERDICT'
  | 'SCOREBOARD';

export type GameMode = 'CLASSIC' | 'CHAOS' | 'SHADOW' | 'ARTIST';

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
  authorName?: string; // If submitted by a player or AI
  isAiGenerated?: boolean;
  source?: 'gemini' | 'custom' | 'fallback' | 'static';
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
  customPrompt?: string; // Secret accusation prompt submitted by this player
  sketchData?: string | null; // Drawing dataURL for ARTIST mode
  targetSketchPlayerId?: string | null; // Player ID whose sketch this player must guess
  guessedAction?: string | null; // Guess written for targetSketchPlayerId
}

export interface FloatingReaction {
  id: string;
  emoji: string;
  senderName: string;
  x: number; // percentage from left (10% to 90%)
  createdAt: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  avatarId: string;
  text: string;
  createdAt: number;
  isBot?: boolean;
  isSystem?: boolean;
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
  convictedPlayerIds?: string[];
  isTieVote?: boolean;
  voteResults: Record<string, number>; // playerId -> vote count
  chaosAnnouncements: string[];
  screenShaking: boolean;
  artistExhibitIndex: number;
  customPromptsPool: AccusationPrompt[];
  usedPromptIds: string[];
  geminiApiKey?: string;
  chatMessages?: ChatMessage[];
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
    | 'UPDATE_PROFILE'
    | 'SUBMIT_CUSTOM_PROMPT'
    | 'START_GAME'
    | 'PLAY_CARD'
    | 'SUBMIT_SKETCH'
    | 'SUBMIT_GUESS'
    | 'NEXT_EXHIBIT'
    | 'CAST_VOTE'
    | 'NEXT_PHASE'
    | 'EMOTE_REACTION'
    | 'CHAT_MESSAGE'
    | 'ROOM_CLOSED';
  payload: any;
  senderId: string;
}
