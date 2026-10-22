/**
 * Google Text-to-Speech (TTS) Courtroom Narration Engine
 * Powers dramatic testimony readings using Web Speech API with Google TTS Audio fallback.
 */

type SpeechCallback = () => void;
type SpeechErrorCallback = (err: any) => void;

class CourtroomSpeechEngine {
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private currentAudio: HTMLAudioElement | null = null;
  private isCurrentlySpeaking: boolean = false;
  private isMuted: boolean = false;
  private cachedVoices: SpeechSynthesisVoice[] = [];
  private onStateChangeListeners: Set<(speaking: boolean) => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      this.cachedVoices = window.speechSynthesis.getVoices();
    } catch {
      this.cachedVoices = [];
    }
  }

  public subscribeState(listener: (speaking: boolean) => void): () => void {
    this.onStateChangeListeners.add(listener);
    listener(this.isCurrentlySpeaking);
    return () => {
      this.onStateChangeListeners.delete(listener);
    };
  }

  private notifyState(speaking: boolean) {
    this.isCurrentlySpeaking = speaking;
    this.onStateChangeListeners.forEach((listener) => {
      try {
        listener(speaking);
      } catch {
        // Ignored
      }
    });
  }

  public getVietnameseVoice(): SpeechSynthesisVoice | null {
    if (this.cachedVoices.length === 0) {
      this.loadVoices();
    }
    // Search for Vietnamese voice (Google Tiếng Việt, Microsoft HoaiMy, Apple Linh, etc.)
    return (
      this.cachedVoices.find(
        (v) =>
          v.lang === 'vi-VN' ||
          v.lang === 'vi_VN' ||
          v.lang.toLowerCase().startsWith('vi')
      ) || null
    );
  }

  public isVoiceSupported(): boolean {
    return (
      typeof window !== 'undefined' &&
      (('speechSynthesis' in window) || typeof Audio !== 'undefined')
    );
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stop();
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public stop() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Ignored
      }
    }

    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch {
        // Ignored
      }
      this.currentAudio = null;
    }

    this.currentUtterance = null;
    this.notifyState(false);
  }

  public isSpeaking(): boolean {
    return this.isCurrentlySpeaking;
  }

  /**
   * Speak a testimony aloud with courtroom flair
   */
  public speakTestimony({
    witnessName,
    authorName,
    guessText,
    onStart,
    onEnd,
    onError,
  }: {
    witnessName: string;
    authorName: string;
    guessText: string;
    onStart?: SpeechCallback;
    onEnd?: SpeechCallback;
    onError?: SpeechErrorCallback;
  }) {
    if (this.isMuted) {
      onEnd?.();
      return;
    }

    // Stop any ongoing speech
    this.stop();

    const cleanWitness = witnessName.trim() || 'Nhân chứng';
    const cleanAuthor = authorName.trim() || 'Bị cáo';
    const cleanGuess = guessText.trim();

    if (!cleanGuess) {
      onEnd?.();
      return;
    }

    // Dramatic courtroom script in Vietnamese
    const spokenText = `Kính thưa Hội Đồng Xét Xử! Nhân chứng ${cleanWitness} tố cáo bị cáo ${cleanAuthor}: Lúc đó đang ${cleanGuess}!`;

    // Try Web Speech API first
    const viVoice = this.getVietnameseVoice();
    const canUseSpeechSynthesis =
      typeof window !== 'undefined' &&
      'speechSynthesis' in window &&
      'SpeechSynthesisUtterance' in window;

    if (canUseSpeechSynthesis && viVoice) {
      try {
        const utterance = new SpeechSynthesisUtterance(spokenText);
        utterance.voice = viVoice;
        utterance.lang = 'vi-VN';
        utterance.rate = 1.0;
        utterance.pitch = 1.05;

        utterance.onstart = () => {
          this.notifyState(true);
          onStart?.();
        };

        utterance.onend = () => {
          this.currentUtterance = null;
          this.notifyState(false);
          onEnd?.();
        };

        utterance.onerror = (e) => {
          this.currentUtterance = null;
          this.notifyState(false);
          // Fallback to Google TTS audio on error
          this.playGoogleTtsAudioFallback(spokenText, onStart, onEnd, onError);
        };

        this.currentUtterance = utterance;
        window.speechSynthesis.speak(utterance);
        return;
      } catch (err) {
        // Fallback to audio if Web Speech API fails
      }
    }

    // If no local Vietnamese voice or SpeechSynthesis threw, use Google TTS stream fallback
    this.playGoogleTtsAudioFallback(spokenText, onStart, onEnd, onError);
  }

  /**
   * Fallback using Google Translate TTS endpoint
   */
  private playGoogleTtsAudioFallback(
    text: string,
    onStart?: SpeechCallback,
    onEnd?: SpeechCallback,
    onError?: SpeechErrorCallback
  ) {
    if (typeof window === 'undefined' || typeof Audio === 'undefined') {
      onEnd?.();
      return;
    }

    try {
      // Chunk to max 180 chars for translate_tts endpoint
      const truncated = text.slice(0, 180);
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=vi&client=tw-ob&q=${encodeURIComponent(
        truncated
      )}`;

      const audio = new Audio(url);
      this.currentAudio = audio;
      audio.playbackRate = 1.05;

      audio.onplay = () => {
        this.notifyState(true);
        onStart?.();
      };

      audio.onended = () => {
        this.currentAudio = null;
        this.notifyState(false);
        onEnd?.();
      };

      audio.onerror = (err) => {
        this.currentAudio = null;
        this.notifyState(false);
        onError?.(err);
        onEnd?.();
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          this.currentAudio = null;
          this.notifyState(false);
          onError?.(err);
          onEnd?.();
        });
      }
    } catch (err) {
      this.notifyState(false);
      onError?.(err);
      onEnd?.();
    }
  }
}

export const courtroomSpeech = new CourtroomSpeechEngine();
