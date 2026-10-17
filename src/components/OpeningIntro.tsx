import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  Volume2,
  VolumeX,
  Play,
  ArrowRight,
  Radio,
  Zap,
  Cpu,
  ShieldCheck,
  Disc,
  FolderSync,
  Layers,
  Upload,
  Check,
  Music,
} from 'lucide-react';
import { soundFX } from '../lib/audio';

interface OpeningIntroProps {
  onEnterApp: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenSoundtrackStation?: () => void;
}

export const OpeningIntro: React.FC<OpeningIntroProps> = ({
  onEnterApp,
  isMuted,
  onToggleMute,
  onOpenSoundtrackStation,
}) => {
  const [bootStep, setBootStep] = useState(0);
  const [autoEnterCountdown, setAutoEnterCountdown] = useState(6);
  const [trackName, setTrackName] = useState(soundFX.currentTrack.title);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const unsubscribe = soundFX.subscribe((state) => {
      setTrackName(state.track.title);
    });

    const t1 = setTimeout(() => setBootStep(1), 500);
    const t2 = setTimeout(() => setBootStep(2), 1200);
    const t3 = setTimeout(() => setBootStep(3), 1900);

    const interval = setInterval(() => {
      setAutoEnterCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      unsubscribe();
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearInterval(interval);
    };
  }, []);

  const handleJackIn = () => {
    soundFX.playBoot();
    soundFX.playTrack();
    onEnterApp();
  };

  const handleCustomAudioSelected = async (file: File) => {
    if (!file) return;
    soundFX.playSweep();
    await soundFX.loadCustomAudioFile(file);
    setTrackName(file.name);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 flex flex-col justify-between p-4 sm:p-8 bg-[#070710] text-white overflow-hidden select-none"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*,.mp3,.wav,.ogg,.m4a"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleCustomAudioSelected(e.target.files[0]);
          }
        }}
      />

      {/* Background Cyber Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-35 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              radial-gradient(circle at 50% 30%, rgba(252, 238, 10, 0.18) 0%, transparent 65%),
              linear-gradient(rgba(252, 238, 10, 0.08) 1px, transparent 1px),
              linear-gradient(90deg, rgba(252, 238, 10, 0.08) 1px, transparent 1px)
            `,
            backgroundSize: '100% 100%, 36px 36px, 36px 36px',
          }}
        ></div>
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#fcee0a] via-[#ff0055] to-cyan-400 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-[#fcee0a]"></div>
      </div>

      {/* Top HUD Telemetry Bar */}
      <div className="relative z-10 flex items-center justify-between border-b border-[#fcee0a]/30 pb-3 font-mono text-xs text-[#fcee0a]">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#fcee0a] animate-ping"></span>
          <span className="font-black tracking-widest uppercase">
            [TASKORBIT CYBERSTUDIO // NEURAL GATEWAY]
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-950/60 border border-cyan-400/40 text-cyan-300 text-xs font-bold hover:bg-cyan-500 hover:text-black transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>SWITCH TRACK</span>
          </button>

          <button
            onClick={onToggleMute}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-black/60 border border-[#fcee0a]/40 text-[#fcee0a] text-xs font-bold hover:bg-[#fcee0a] hover:text-black transition-colors cursor-pointer"
          >
            {!isMuted ? (
              <Volume2 className="w-3.5 h-3.5 text-[#fcee0a] animate-pulse" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-zinc-500" />
            )}
            <span>{isMuted ? 'BGM MUTED' : 'BGM: LET YOU DOWN'}</span>
          </button>
        </div>
      </div>

      {/* Central Cyber Architecture Card */}
      <div className="relative z-10 max-w-3xl mx-auto my-auto w-full text-center space-y-6">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative mx-auto rounded-3xl p-1 bg-gradient-to-b from-[#fcee0a] via-cyan-400 to-[#ff0055]/30 shadow-2xl shadow-[#fcee0a]/20"
        >
          <div className="rounded-[22px] bg-[#070710] p-6 sm:p-8 border border-zinc-800 relative overflow-hidden text-left">
            {/* Cyber Corner Brackets */}
            <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#fcee0a]"></div>
            <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#fcee0a]"></div>
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#fcee0a]"></div>
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#fcee0a]"></div>

            {/* Neural Gateway Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-zinc-800">
              <div>
                <span className="text-[10px] font-black tracking-widest text-[#fcee0a] uppercase font-mono px-2 py-0.5 rounded-sm bg-[#fcee0a]/20 border border-[#fcee0a]/40">
                  ARASAKA NEURAL RECOGNITION
                </span>
                <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white mt-2 font-mono">
                  TASKORBIT <span className="text-[#fcee0a]">CYBERSTUDIO</span>
                </h1>
                <p className="text-xs text-zinc-300 font-mono mt-1">
                  Cross-Platform Tasks, Kanban Board, Desktop Auto-Organizer & Connected Apps
                </p>
              </div>

              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-[#fcee0a] to-cyan-400 p-0.5 shrink-0 shadow-lg shadow-[#fcee0a]/30">
                <div className="w-full h-full rounded-[14px] bg-black flex flex-col items-center justify-center text-center p-1">
                  <Cpu className="w-6 h-6 text-[#fcee0a] animate-pulse" />
                  <span className="text-[9px] font-black text-cyan-300 font-mono mt-1">
                    NEURAL HUB
                  </span>
                </div>
              </div>
            </div>

            {/* Boot Sequence Log */}
            <div className="my-5 p-4 rounded-xl bg-black/80 border border-[#fcee0a]/30 font-mono text-xs space-y-1.5">
              <div className="flex items-center gap-2 text-cyan-400">
                <Cpu className="w-3.5 h-3.5" />
                <span>[INIT] SANDEVISTAN MK.4 NEURAL ADAPTER: SYNCHRONIZED</span>
              </div>
              {bootStep >= 1 && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 text-[#fcee0a]"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>[DATA] TASK TRACKER & DESKTOP FILE ROUTING ENGINE: ARMED</span>
                </motion.div>
              )}
              {bootStep >= 2 && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 text-[#ff0055]"
                >
                  <Disc className="w-3.5 h-3.5 animate-spin" />
                  <span>[AUDIO] SOUNDTRACK LOADED: {trackName.toUpperCase()}</span>
                </motion.div>
              )}
              {bootStep >= 3 && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 text-emerald-400 font-bold"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>[STATUS] READY FOR CYBER DEPLOYMENT. JACK IN TO PROCEED.</span>
                </motion.div>
              )}
            </div>

            {/* Featured Track Info Card with Switch Option */}
            <div className="flex flex-col sm:flex-row items-center justify-between p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-700/80 gap-3">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-pink-500 via-yellow-400 to-cyan-400 flex items-center justify-center text-black font-black shrink-0">
                  <Radio className="w-5 h-5 text-black" />
                </div>
                <div className="truncate">
                  <span className="text-[10px] text-zinc-400 font-mono uppercase block">
                    ACTIVE CYBER SOUNDTRACK
                  </span>
                  <span className="text-xs font-bold text-white font-mono truncate block">
                    {trackName}
                  </span>
                </div>
              </div>

              {/* Action buttons on intro audio card */}
              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-cyan-500 hover:text-black text-cyan-300 border border-zinc-700 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Upload className="w-3 h-3" />
                  <span>Upload Audio</span>
                </button>

                {/* Equalizer Wave Bars */}
                <div className="flex items-end gap-1 h-6 pl-2">
                  <span className="w-1 bg-[#fcee0a] h-3 animate-bounce"></span>
                  <span className="w-1 bg-[#ff0055] h-6 animate-bounce" style={{ animationDelay: '0.15s' }}></span>
                  <span className="w-1 bg-cyan-400 h-4 animate-bounce" style={{ animationDelay: '0.3s' }}></span>
                  <span className="w-1 bg-[#fcee0a] h-5 animate-bounce" style={{ animationDelay: '0.45s' }}></span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Jack In Action Button */}
        <motion.div
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 35px rgba(252, 238, 10, 0.6)' }}
            whileTap={{ scale: 0.95 }}
            onClick={handleJackIn}
            className="px-8 py-4 bg-[#fcee0a] hover:bg-[#ffea00] text-black font-black text-sm sm:text-base tracking-widest uppercase rounded-2xl shadow-xl shadow-[#fcee0a]/30 flex items-center gap-3 font-mono border-2 border-black transition-all cursor-pointer"
          >
            <Play className="w-5 h-5 fill-black" />
            <span>JACK IN // ENTER STUDIO</span>
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </motion.div>
      </div>

      {/* Bottom Footer Info */}
      <div className="relative z-10 flex items-center justify-between border-t border-zinc-800 pt-3 font-mono text-[11px] text-zinc-400">
        <span>TASKORBIT SUITE // NIGHT CITY OS</span>
        <span className="text-[#fcee0a] font-bold">
          Auto-entering in {autoEnterCountdown}s... Click JACK IN to launch now
        </span>
      </div>
    </motion.div>
  );
};
