// Cyberpunk Audio Engine: Dual-Mode (Real Soundtrack Audio Stream + Neural Synthesizer)
import {
  saveSoundtrackToIndexedDB,
  loadSoundtrackFromIndexedDB,
  deleteSoundtrackFromIndexedDB,
  StoredTrackData,
} from './audioStorage';

export interface TrackMetadata {
  title: string;
  artist: string;
  album: string;
  source: 'custom_file' | 'synth_let_you_down';
  fileName?: string;
  duration?: number;
}

export type AudioEventListener = (event: {
  type: 'play' | 'pause' | 'timeupdate' | 'trackchange' | 'volumechange' | 'mute';
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  track: TrackMetadata;
}) => void;

class CyberAudioEngine {
  private ctx: AudioContext | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private mediaSourceNode: MediaElementAudioSourceNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private masterGainNode: GainNode | null = null;

  public isMuted: boolean = false;
  public volume: number = 0.8;
  public isAudioElementPlaying: boolean = false;
  public isSynthPlaying: boolean = false;

  private synthTimer: number | null = null;
  private currentObjectUrl: string | null = null;

  public currentTrack: TrackMetadata = {
    title: 'Let You Down',
    artist: 'Dawid Podsiadło',
    album: 'Cyberpunk: Edgerunners OST',
    source: 'synth_let_you_down',
  };

  private listeners: Set<AudioEventListener> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      this.initAudioElement();
      // Try restoring custom soundtrack from IndexedDB
      this.restoreFromIndexedDB();
    }
  }

  private initAudioElement() {
    if (this.audioElement) return;
    this.audioElement = new Audio();
    this.audioElement.loop = true;
    this.audioElement.volume = this.volume;

    this.audioElement.addEventListener('play', () => {
      this.isAudioElementPlaying = true;
      this.emitEvent('play');
    });

    this.audioElement.addEventListener('pause', () => {
      this.isAudioElementPlaying = false;
      this.emitEvent('pause');
    });

    this.audioElement.addEventListener('timeupdate', () => {
      this.emitEvent('timeupdate');
    });

    this.audioElement.addEventListener('loadedmetadata', () => {
      if (this.audioElement) {
        this.currentTrack.duration = this.audioElement.duration;
        this.emitEvent('trackchange');
      }
    });

    this.audioElement.addEventListener('ended', () => {
      this.isAudioElementPlaying = false;
      this.emitEvent('pause');
    });
  }

  private async restoreFromIndexedDB() {
    try {
      const stored = await loadSoundtrackFromIndexedDB();
      if (stored && stored.blob) {
        this.applyBlobTrack(stored.blob, stored.name);
      }
    } catch (err) {
      console.warn('Failed restoring stored soundtrack:', err);
    }
  }

  public getContext(): AudioContext | null {
    try {
      if (!this.ctx && typeof window !== 'undefined') {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          this.ctx = new AudioContextClass();

          this.analyserNode = this.ctx.createAnalyser();
          this.analyserNode.fftSize = 64;

          this.masterGainNode = this.ctx.createGain();
          this.masterGainNode.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);

          this.masterGainNode.connect(this.analyserNode);
          this.analyserNode.connect(this.ctx.destination);
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  public getAnalyser(): AnalyserNode | null {
    this.getContext();
    return this.analyserNode;
  }

  // Subscribe to playback changes
  public subscribe(listener: AudioEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emitEvent(type: 'play' | 'pause' | 'timeupdate' | 'trackchange' | 'volumechange' | 'mute') {
    const curTime = this.getCurrentTime();
    const dur = this.getDuration();
    const isPlaying = this.isAudioElementPlaying || this.isSynthPlaying;

    this.listeners.forEach((fn) => {
      try {
        fn({
          type,
          currentTime: curTime,
          duration: dur,
          isPlaying,
          isMuted: this.isMuted,
          volume: this.volume,
          track: this.currentTrack,
        });
      } catch (err) {
        console.error('Audio listener error:', err);
      }
    });
  }

  // Load user-uploaded audio file (MP3, WAV, OGG, M4A, AAC)
  public async loadCustomAudioFile(file: File): Promise<void> {
    this.getContext();
    this.initAudioElement();

    // Stop previous synth if running
    this.stopSynth();

    if (this.currentObjectUrl) {
      URL.revokeObjectURL(this.currentObjectUrl);
    }

    const objectUrl = URL.createObjectURL(file);
    this.currentObjectUrl = objectUrl;

    if (this.audioElement) {
      this.audioElement.src = objectUrl;
      this.audioElement.volume = this.isMuted ? 0 : this.volume;

      // Connect to Web Audio Analyser if not yet connected
      this.connectAudioElementToAnalyser();

      this.currentTrack = {
        title: file.name.replace(/\.[^/.]+$/, ''),
        artist: 'User Custom Audio',
        album: 'Night City Audio Drive',
        source: 'custom_file',
        fileName: file.name,
      };

      try {
        await this.audioElement.play();
        this.isAudioElementPlaying = true;
      } catch (err) {
        console.warn('Autoplay prevented until user gesture:', err);
      }

      this.emitEvent('trackchange');
      this.emitEvent('play');
    }

    // Persist to IndexedDB
    await saveSoundtrackToIndexedDB(file);
  }

  private applyBlobTrack(blob: Blob, fileName: string) {
    this.initAudioElement();
    if (this.currentObjectUrl) {
      URL.revokeObjectURL(this.currentObjectUrl);
    }
    const objectUrl = URL.createObjectURL(blob);
    this.currentObjectUrl = objectUrl;

    if (this.audioElement) {
      this.audioElement.src = objectUrl;
      this.audioElement.volume = this.isMuted ? 0 : this.volume;
      this.connectAudioElementToAnalyser();

      this.currentTrack = {
        title: fileName.replace(/\.[^/.]+$/, ''),
        artist: 'Dawid Podsiadło (Uploaded Track)',
        album: 'Cyberpunk: Edgerunners OST',
        source: 'custom_file',
        fileName,
      };
      this.emitEvent('trackchange');
    }
  }

  private connectAudioElementToAnalyser() {
    try {
      const ctx = this.getContext();
      if (!ctx || !this.audioElement || this.mediaSourceNode) return;
      this.mediaSourceNode = ctx.createMediaElementSource(this.audioElement);
      if (this.masterGainNode) {
        this.mediaSourceNode.connect(this.masterGainNode);
      } else {
        this.mediaSourceNode.connect(ctx.destination);
      }
    } catch {}
  }

  public async removeCustomTrack(): Promise<void> {
    await deleteSoundtrackFromIndexedDB();
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.src = '';
    }
    if (this.currentObjectUrl) {
      URL.revokeObjectURL(this.currentObjectUrl);
      this.currentObjectUrl = null;
    }
    this.currentTrack = {
      title: 'Let You Down',
      artist: 'Dawid Podsiadło',
      album: 'Cyberpunk: Edgerunners OST',
      source: 'synth_let_you_down',
    };
    this.emitEvent('trackchange');
  }

  public playTrack() {
    this.getContext();
    if (this.currentTrack.source === 'custom_file' && this.audioElement && this.audioElement.src) {
      this.audioElement
        .play()
        .then(() => {
          this.isAudioElementPlaying = true;
          this.emitEvent('play');
        })
        .catch(() => {
          this.startLetYouDownMusic();
        });
    } else {
      this.startLetYouDownMusic();
    }
  }

  public pauseTrack() {
    if (this.audioElement) {
      this.audioElement.pause();
      this.isAudioElementPlaying = false;
    }
    this.stopSynth();
    this.emitEvent('pause');
  }

  public togglePlay(): boolean {
    const isPlaying = this.isAudioElementPlaying || this.isSynthPlaying;
    if (isPlaying) {
      this.pauseTrack();
      return false;
    } else {
      this.playTrack();
      return true;
    }
  }

  public seek(seconds: number) {
    if (this.audioElement && this.currentTrack.source === 'custom_file') {
      this.audioElement.currentTime = Math.max(0, Math.min(seconds, this.audioElement.duration || 0));
      this.emitEvent('timeupdate');
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.audioElement) {
      this.audioElement.volume = this.isMuted ? 0 : this.volume;
    }
    if (this.masterGainNode && this.ctx) {
      this.masterGainNode.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
    }
    this.emitEvent('volumechange');
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.audioElement) {
      this.audioElement.volume = this.isMuted ? 0 : this.volume;
    }
    if (this.masterGainNode && this.ctx) {
      this.masterGainNode.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
    }

    if (this.isMuted) {
      if (this.isSynthPlaying) {
        this.stopSynth();
      }
    } else {
      if (!this.isAudioElementPlaying && !this.isSynthPlaying) {
        this.playTrack();
      }
    }

    this.emitEvent('mute');
    return this.isMuted;
  }

  public getCurrentTime(): number {
    if (this.currentTrack.source === 'custom_file' && this.audioElement) {
      return this.audioElement.currentTime || 0;
    }
    return 0;
  }

  public getDuration(): number {
    if (this.currentTrack.source === 'custom_file' && this.audioElement) {
      return this.audioElement.duration || 244; // ~4:04
    }
    return 244; // ~4:04 standard Let You Down length
  }

  // --- Neural Cyberpunk Procedural Synthesizer ("Let You Down" by Dawid Podsiadło) ---
  public startLetYouDownMusic() {
    if (this.isSynthPlaying || this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    this.isSynthPlaying = true;
    this.emitEvent('play');

    // Chords of "Let You Down" (Em -> C -> G -> D, 108 BPM)
    const progression = [
      { bass: 82.41, chordNotes: [164.81, 196.00, 246.94], melody: [329.63, 392.00, 493.88, 392.00, 329.63, 293.66, 329.63, 246.94] }, // Em
      { bass: 65.41, chordNotes: [130.81, 164.81, 196.00], melody: [261.63, 329.63, 392.00, 329.63, 261.63, 293.66, 261.63, 196.00] }, // C
      { bass: 98.00, chordNotes: [196.00, 246.94, 293.66], melody: [392.00, 493.88, 587.33, 493.88, 392.00, 329.63, 293.66, 246.94] }, // G
      { bass: 73.42, chordNotes: [146.83, 185.00, 220.00], melody: [293.66, 369.99, 440.00, 369.99, 293.66, 261.63, 293.66, 220.00] }, // D
    ];

    let chordIdx = 0;
    let step = 0;

    const playBeat = () => {
      if (!this.isSynthPlaying || this.isMuted) return;
      const currentCtx = this.getContext();
      if (!currentCtx) return;

      const current = progression[chordIdx];
      const now = currentCtx.currentTime;

      // 1. Kick on beat 0 and 4, Snare on beat 2 and 6
      if (step === 0 || step === 4) {
        this.triggerSynthKick(currentCtx, now);
      } else if (step === 2 || step === 6) {
        this.triggerSynthSnare(currentCtx, now);
      }

      // 2. Closed hi-hat on every eighth note
      this.triggerSynthHiHat(currentCtx, now, step % 2 === 1);

      // 3. Sub-bass on downbeats
      if (step === 0 || step === 3) {
        this.triggerSynthBass(currentCtx, now, current.bass);
      }

      // 4. Synth pad chord on step 0
      if (step === 0) {
        this.triggerSynthPad(currentCtx, now, current.chordNotes);
      }

      // 5. Signature melody arpeggio
      const noteFreq = current.melody[step % current.melody.length];
      if (noteFreq) {
        this.triggerSynthMelody(currentCtx, now, noteFreq);
      }

      step++;
      if (step >= 8) {
        step = 0;
        chordIdx = (chordIdx + 1) % progression.length;
      }
    };

    // ~278ms per eighth note = 108 BPM
    this.synthTimer = window.setInterval(playBeat, 278);
  }

  private triggerSynthKick(ctx: AudioContext, time: number) {
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.setValueAtTime(140, time);
      osc.frequency.exponentialRampToValueAtTime(38, time + 0.12);

      gain.gain.setValueAtTime(0.08 * this.volume, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.14);

      osc.connect(gain);
      gain.connect(this.masterGainNode || ctx.destination);
      osc.start(time);
      osc.stop(time + 0.14);
    } catch {}
  }

  private triggerSynthSnare(ctx: AudioContext, time: number) {
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, time);

      gain.gain.setValueAtTime(0.04 * this.volume, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

      osc.connect(gain);
      gain.connect(this.masterGainNode || ctx.destination);
      osc.start(time);
      osc.stop(time + 0.15);
    } catch {}
  }

  private triggerSynthHiHat(ctx: AudioContext, time: number, isOffbeat: boolean) {
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(6000, time);

      gain.gain.setValueAtTime((isOffbeat ? 0.02 : 0.012) * this.volume, time);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.04);

      osc.connect(gain);
      gain.connect(this.masterGainNode || ctx.destination);
      osc.start(time);
      osc.stop(time + 0.04);
    } catch {}
  }

  private triggerSynthBass(ctx: AudioContext, time: number, freq: number) {
    try {
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, time);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(280, time);

      gain.gain.setValueAtTime(0.05 * this.volume, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.5);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGainNode || ctx.destination);

      osc.start(time);
      osc.stop(time + 0.5);
    } catch {}
  }

  private triggerSynthPad(ctx: AudioContext, time: number, notes: number[]) {
    try {
      notes.forEach((f) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, time);

        gain.gain.setValueAtTime(0.018 * this.volume, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 1.8);

        osc.connect(gain);
        gain.connect(this.masterGainNode || ctx.destination);
        osc.start(time);
        osc.stop(time + 1.8);
      });
    } catch {}
  }

  private triggerSynthMelody(ctx: AudioContext, time: number, freq: number) {
    try {
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(freq * 1.2, time);

      gain.gain.setValueAtTime(0.032 * this.volume, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.26);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGainNode || ctx.destination);

      osc.start(time);
      osc.stop(time + 0.26);
    } catch {}
  }

  public stopSynth() {
    this.isSynthPlaying = false;
    if (this.synthTimer !== null) {
      clearInterval(this.synthTimer);
      this.synthTimer = null;
    }
  }

  public stopLetYouDownMusic() {
    this.pauseTrack();
  }

  // --- Sound Effects ---
  public playBlip() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.05 * this.volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch {}
  }

  public playSweep() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(920, ctx.currentTime + 0.2);

      gain.gain.setValueAtTime(0.05 * this.volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch {}
  }

  public playSuccess() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const freqs = [523.25, 659.25, 783.99, 1046.5];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.04);
        gain.gain.setValueAtTime(0.04 * this.volume, ctx.currentTime + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.04 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.04);
        osc.stop(ctx.currentTime + idx * 0.04 + 0.35);
      });
    } catch {}
  }

  public playBoot() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(65.4, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(523.25, ctx.currentTime + 0.6);

      gain.gain.setValueAtTime(0.08 * this.volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.7);
    } catch {}
  }
}

export const soundFX = new CyberAudioEngine();
