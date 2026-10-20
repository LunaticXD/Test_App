import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  Upload,
  Radio,
  Disc,
  X,
  Sparkles,
  Check,
  RotateCcw,
  Sliders,
  Music,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { soundFX, TrackMetadata } from '../lib/audio';
import { getThemeColors } from '../lib/theme';

interface CyberMusicPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LYRICS = [
  { time: 33, text: 'Feel the rhythm of the streets' },
  { time: 37, text: 'Neon lights and neon dreams' },
  { time: 42, text: 'Bloody fists they feel no pain' },
  { time: 47, text: "When there's so much more to gain" },
  { time: 51, text: 'Hunting season if you will' },
  { time: 56, text: "Tell me where'd you rather be" },
  { time: 60, text: 'I can hardly see the moon' },
  { time: 65, text: "Hope we'll get there pretty soon" },
  { time: 70, text: 'Trying so hard to release you out of the misery' },
  { time: 79, text: "Hold on to your wishes if you can't hold on to me" },
  { time: 87, text: 'Forgive me for letting you down' },
  { time: 92, text: 'Forgive me for letting you down again' },
  { time: 97, text: "I guess I'm not strong enough right now" },
  { time: 122, text: 'They will finally feel the flames' },
  { time: 126, text: 'Flames that run down through my veins' },
  { time: 131, text: 'I will make the city burn' },
  { time: 136, text: "When I'm planning to return" },
  { time: 140, text: 'Trying so hard to be free' },
  { time: 144, text: 'To make you see what I see' },
  { time: 149, text: "Hold on to your wishes if you can't hold on to me" },
  { time: 157, text: 'Forgive me for letting you down' },
  { time: 162, text: 'Forgive me for letting you down again' },
  { time: 167, text: "I guess I'm not strong enough right now..." },
];

export const CyberMusicPlayerModal: React.FC<CyberMusicPlayerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [isPlaying, setIsPlaying] = useState(soundFX.isAudioElementPlaying || soundFX.isSynthPlaying);
  const [currentTime, setCurrentTime] = useState(soundFX.getCurrentTime());
  const [duration, setDuration] = useState(soundFX.getDuration());
  const [volume, setVolume] = useState(soundFX.volume);
  const [isMuted, setIsMuted] = useState(soundFX.isMuted);
  const [track, setTrack] = useState<TrackMetadata>(soundFX.currentTrack);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const unsubscribe = soundFX.subscribe((state) => {
      setIsPlaying(state.isPlaying);
      setCurrentTime(state.currentTime);
      setDuration(state.duration);
      setVolume(state.volume);
      setIsMuted(state.isMuted);
      setTrack(state.track);
    });

    return () => unsubscribe();
  }, []);

  // Visualizer Animation Loop
  useEffect(() => {
    if (!isOpen) return;
    let animId: number;
    const themeColors = getThemeColors();

    const renderVisualizer = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const analyser = soundFX.getAnalyser();
      const bufferLength = analyser ? analyser.frequencyBinCount : 32;
      const dataArray = new Uint8Array(bufferLength);

      if (analyser && isPlaying && !isMuted) {
        analyser.getByteFrequencyData(dataArray);
      } else {
        // Subtle animated idle wave
        const t = Date.now() / 200;
        for (let i = 0; i < bufferLength; i++) {
          dataArray[i] = Math.max(10, Math.sin(t + i * 0.4) * 40 + 40);
        }
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 1.8;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const val = dataArray[i];
        const percent = val / 255;
        const barHeight = Math.max(4, percent * canvas.height * 0.9);

        // Gradient from Electric Yellow to Neon Cyan
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight);
        gradient.addColorStop(0, themeColors.accent);
        gradient.addColorStop(0.5, themeColors.secondary);
        gradient.addColorStop(1, themeColors.tertiary);

        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 2, barHeight);

        x += barWidth;
        if (x > canvas.width) break;
      }

      animId = requestAnimationFrame(renderVisualizer);
    };

    animId = requestAnimationFrame(renderVisualizer);
    return () => cancelAnimationFrame(animId);
  }, [isOpen, isPlaying, isMuted]);

  if (!isOpen) return null;

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    soundFX.playSweep();
    try {
      await soundFX.loadCustomAudioFile(file);
      setUploadSuccessMessage(`Loaded "${file.name}" successfully! Saved to persistent audio cache.`);
      setTimeout(() => setUploadSuccessMessage(null), 4000);
    } catch (err) {
      console.error('Audio load error:', err);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFileUpload(file);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Find active lyric line
  const currentLyric = LYRICS.reduce((acc, curr) => {
    if (currentTime >= curr.time) return curr.text;
    return acc;
  }, LYRICS[0].text);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 15 }}
        className="w-full max-w-2xl bg-[color:var(--bg)] border-2 border-[color:var(--accent)]/40 rounded-3xl shadow-2xl shadow-[color:var(--accent)]/20 overflow-hidden flex flex-col font-mono text-white relative"
      >
        {/* Top Glowing Header Accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[color:var(--accent)] via-cyan-400 to-[color:var(--tertiary)] animate-pulse"></div>

        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-black/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[color:var(--accent)] via-cyan-400 to-[color:var(--tertiary)] p-0.5 shadow-md shadow-[color:var(--accent)]/20 flex items-center justify-center">
              <div className="w-full h-full rounded-[10px] bg-black flex items-center justify-center">
                <Disc className="w-5 h-5 text-[color:var(--accent)] animate-spin" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white tracking-wide">
                  CYBER SOUNDTRACK STATION
                </h3>
                <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-[color:var(--accent)]/20 text-[color:var(--accent)] border border-[color:var(--accent)]/40">
                  LET YOU DOWN
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Official Cyberpunk: Edgerunners OST & Custom Audio Stream
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundFX.playBlip();
              onClose();
            }}
            className="p-2 rounded-xl text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 hover:border-[color:var(--accent)]/50 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Main Track Display Card */}
          <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row items-center gap-5 relative overflow-hidden">
            {/* Visual Vinyl Disc */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-tr from-pink-500 via-[color:var(--accent)] to-cyan-400 p-1 shrink-0 shadow-lg shadow-[color:var(--accent)]/25 flex items-center justify-center relative">
              <div className="w-full h-full rounded-[14px] bg-black flex flex-col items-center justify-center p-2 text-center">
                <Radio className="w-8 h-8 text-[color:var(--accent)] mb-1 animate-pulse" />
                <span className="text-[9px] font-bold text-cyan-300 uppercase truncate max-w-full">
                  {track.source === 'custom_file' ? 'CUSTOM AUDIO' : 'EDGERUNNERS'}
                </span>
              </div>
            </div>

            {/* Track Info & Real-Time Waveform */}
            <div className="flex-1 w-full space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[color:var(--accent)] tracking-wider uppercase">
                  {track.source === 'custom_file' ? 'ACTIVE UPLOADED TRACK' : 'FEATURED SOUNDTRACK'}
                </span>
                <span className="text-[11px] text-zinc-400 font-mono">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <h4 className="text-lg font-black text-white tracking-tight truncate">
                {track.title}
              </h4>
              <p className="text-xs text-zinc-400 truncate">
                {track.artist} • <span className="text-cyan-400">{track.album}</span>
              </p>

              {/* Spectrum Visualizer Canvas */}
              <div className="h-12 w-full bg-black/60 rounded-xl border border-zinc-800/80 p-1 flex items-center overflow-hidden">
                <canvas
                  ref={canvasRef}
                  width={380}
                  height={44}
                  className="w-full h-full rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Player Progress Scrubber */}
          <div className="space-y-1.5">
            <input
              type="range"
              min="0"
              max={duration || 244}
              value={currentTime}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setCurrentTime(val);
                soundFX.seek(val);
              }}
              className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[color:var(--accent)]"
            />
            <div className="flex justify-between text-[11px] text-zinc-500">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Primary Controls: Play/Pause, Volume */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-950/90 border border-zinc-800">
            {/* Play / Pause Button */}
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  soundFX.playBlip();
                  soundFX.togglePlay();
                }}
                className="px-6 py-2.5 rounded-xl bg-[color:var(--accent)] hover:bg-[color:var(--accent-hover)] text-black font-black text-xs flex items-center gap-2 shadow-lg shadow-[color:var(--accent)]/25 cursor-pointer border border-black"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-black" /> : <Play className="w-4 h-4 fill-black" />}
                <span>{isPlaying ? 'PAUSE BGM' : 'PLAY SOUNDTRACK'}</span>
              </motion.button>

              <button
                onClick={() => {
                  soundFX.seek(0);
                  soundFX.playTrack();
                }}
                title="Restart Track from Beginning"
                className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                onClick={() => soundFX.toggleMute()}
                className="p-2 rounded-xl text-zinc-400 hover:text-[color:var(--accent)] bg-zinc-900 border border-zinc-800 cursor-pointer"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-zinc-500" /> : <Volume2 className="w-4 h-4 text-[color:var(--accent)]" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  setVolume(v);
                  soundFX.setVolume(v);
                  if (isMuted && v > 0) {
                    soundFX.toggleMute();
                  }
                }}
                className="w-28 sm:w-36 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <span className="text-xs text-zinc-400 w-9 text-right font-mono">
                {isMuted ? '0%' : `${Math.round(volume * 100)}%`}
              </span>
            </div>
          </div>

          {/* Synchronized Cyber Lyrics Screen */}
          <div className="p-4 rounded-2xl bg-black/70 border border-[color:var(--accent)]/20 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-zinc-400 pb-1 border-b border-zinc-800">
              <span className="text-[color:var(--accent)] font-bold flex items-center gap-1.5">
                <Music className="w-3.5 h-3.5" />
                SYNCHRONIZED CYBER LYRICS
              </span>
              <span>"Let You Down" — Dawid Podsiadło</span>
            </div>
            <div className="py-2 text-center">
              <p className="text-sm sm:text-base font-black text-cyan-300 font-mono tracking-wide leading-relaxed">
                "{currentLyric}"
              </p>
            </div>
          </div>

          {/* Drag & Drop Audio Upload Box */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDraggingFile(true);
            }}
            onDragLeave={() => setIsDraggingFile(false)}
            onDrop={handleDrop}
            className={`p-6 border-2 border-dashed rounded-2xl text-center transition-all ${
              isDraggingFile
                ? 'border-[color:var(--accent)] bg-[color:var(--accent)]/10 scale-[1.01]'
                : 'border-zinc-800 hover:border-[color:var(--accent)]/40 bg-zinc-950/60'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*,.mp3,.wav,.ogg,.m4a,.aac"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
            />

            <div className="flex flex-col items-center justify-center gap-2">
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[color:var(--accent)]">
                <Upload className="w-6 h-6 animate-bounce" />
              </div>
              <h4 className="text-sm font-bold text-white">
                Drop your soundtrack file here or browse from device
              </h4>
              <p className="text-xs text-zinc-400 max-w-md">
                Select the exact audio track you provided (MP3, WAV, OGG, M4A) to play the authentic master recording directly in the app.
              </p>

              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Choose Audio File</span>
                </button>

                {track.source === 'custom_file' && (
                  <button
                    onClick={async () => {
                      soundFX.playBlip();
                      await soundFX.removeCustomTrack();
                    }}
                    className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-rose-950/50 text-zinc-400 hover:text-rose-400 border border-zinc-800 text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Reset to Default</span>
                  </button>
                )}
              </div>
            </div>

            {uploadSuccessMessage && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4 text-emerald-400" />
                <span>{uploadSuccessMessage}</span>
              </motion.div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-zinc-800 bg-black/60 flex items-center justify-between text-xs text-zinc-400">
          <span className="flex items-center gap-1.5 text-cyan-400 text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-[color:var(--accent)]" />
            Persistent audio saved across sessions in IndexedDB
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs cursor-pointer font-bold"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};
