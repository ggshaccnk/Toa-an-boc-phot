/**
 * Google Text-to-Speech (TTS) Courtroom Narration Engine
 * Powers authentic Google TTS voice playback for witness guesses with Web Speech API fallback.
 */

type SpeechCallback = () => void;
type SpeechErrorCallback = (err: any) => void;

class CourtroomSpeechEngine {
  private currentAudio: HTMLAudioElement | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isCurrentlySpeaking: boolean = false;
  private isMuted: boolean = false;
  private onStateChangeListeners: Set<(speaking: boolean) => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.getVoices();
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
          window.speechSynthesis.onvoiceschanged = () => {
            window.speechSynthesis.getVoices();
          };
        }
      } catch {
        // Ignored
      }
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
    // Stop server-streamed audio
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
        this.currentAudio.src = '';
      } catch {
        // Ignored
      }
      this.currentAudio = null;
    }

    // Stop Web Speech API synthesis
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Ignored
      }
      this.currentUtterance = null;
    }

    this.notifyState(false);
  }

  public isSpeaking(): boolean {
    return this.isCurrentlySpeaking;
  }

  /**
   * Speak the witness guess aloud using authentic Google Vietnamese TTS
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
    authorName?: string;
    guessText: string;
    onStart?: SpeechCallback;
    onEnd?: SpeechCallback;
    onError?: SpeechErrorCallback;
  }) {
    if (this.isMuted) {
      onEnd?.();
      return;
    }

    this.stop();

    const cleanWitness = witnessName?.trim() || 'Nhân chứng';
    const cleanGuess = guessText?.trim();

    if (!cleanGuess) {
      onEnd?.();
      return;
    }

    // Natural, punchy phrase reading the exact guess
    const spokenText = `${cleanWitness} đoán là: ${cleanGuess}`;

    // Priority 1: High-fidelity Google Translate TTS audio via our server route /api/tts
    const ttsUrl = `/api/tts?text=${encodeURIComponent(spokenText)}`;

    if (typeof Audio !== 'undefined') {
      try {
        const audio = new Audio(ttsUrl);
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

        audio.onerror = () => {
          // If server /api/tts fails, fallback to local Web Speech API
          this.fallbackToWebSpeech(spokenText, onStart, onEnd, onError);
        };

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // Autoplay might be blocked or error: fallback to Web Speech
            this.fallbackToWebSpeech(spokenText, onStart, onEnd, onError);
          });
        }
        return;
      } catch {
        // Fallback to Web Speech if Audio constructor throws
      }
    }

    // Priority 2 fallback: Web Speech API
    this.fallbackToWebSpeech(spokenText, onStart, onEnd, onError);
  }

  /**
   * Fallback using browser Web Speech API
   */
  private fallbackToWebSpeech(
    text: string,
    onStart?: SpeechCallback,
    onEnd?: SpeechCallback,
    onError?: SpeechErrorCallback
  ) {
    if (
      typeof window === 'undefined' ||
      !('speechSynthesis' in window) ||
      !('SpeechSynthesisUtterance' in window)
    ) {
      this.notifyState(false);
      onError?.('TTS not supported');
      onEnd?.();
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'vi-VN';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      // Find local Vietnamese voice if available
      try {
        const voices = window.speechSynthesis.getVoices();
        const viVoice = voices.find(
          (v) =>
            v.lang === 'vi-VN' ||
            v.lang === 'vi_VN' ||
            v.lang.toLowerCase().startsWith('vi')
        );
        if (viVoice) {
          utterance.voice = viVoice;
        }
      } catch {
        // Ignored
      }

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
        onError?.(e);
        onEnd?.();
      };

      this.currentUtterance = utterance;
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      this.notifyState(false);
      onError?.(err);
      onEnd?.();
    }
  }
}

export const courtroomSpeech = new CourtroomSpeechEngine();
