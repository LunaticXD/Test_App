import React from 'react';
import { motion } from 'motion/react';
import {
  Palette,
  Sparkles,
  Check,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Disc,
  Radio,
  Eye,
  Building,
} from 'lucide-react';
import { ThemeMode } from '../types';
import { soundFX } from '../lib/audio';

interface ThemeShowcaseProps {
  currentTheme: ThemeMode;
  onSelectTheme: (theme: ThemeMode) => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const ThemeShowcase: React.FC<ThemeShowcaseProps> = ({
  currentTheme,
  onSelectTheme,
  isMuted,
  onToggleMute,
}) => {
  const themes = [
    {
      id: 'cyberpunk' as ThemeMode,
      name: 'Cyberpunk 2077 // Edgerunners (Default)',
      badge: 'ACTIVE CANON',
      desc: 'Iconic Edgerunners electric yellow (#fcee0a) with black circuitry traces, neon cyan (#00f0ff), and hot magenta accents',
      primaryColor: '#fcee0a',
      secondaryColor: '#00f0ff',
      tertiaryColor: '#ff0055',
      bgPreview: 'from-[#070710] via-[#100f02] to-[#141200]',
      borderGlow: 'hover:border-[#fcee0a] hover:shadow-[#fcee0a]/30',
      activeBorder: 'border-[#fcee0a] shadow-xl shadow-[#fcee0a]/35 ring-2 ring-[#fcee0a]/40',
      tagline: 'High-Voltage Edgerunners Circuit & HUD Telemetry',
    },
    {
      id: 'synthwave' as ThemeMode,
      name: 'Night City Sunset Skyline',
      badge: 'NIGHT CITY SKYLINE',
      desc: 'Panoramic Night City mega-towers at dusk with neon magenta searchlights, cyan beams, and waterfront silhouettes',
      primaryColor: '#ff007f',
      secondaryColor: '#00f0ff',
      tertiaryColor: '#ff8800',
      bgPreview: 'from-[#080318] via-[#180528] to-[#25083a]',
      borderGlow: 'hover:border-pink-500 hover:shadow-pink-500/30',
      activeBorder: 'border-pink-500 shadow-xl shadow-pink-500/35 ring-2 ring-pink-500/40',
      tagline: 'Arasaka Megatowers & Skyline Vista',
    },
    {
      id: 'matrix' as ThemeMode,
      name: 'Matrix Phosphor Terminal',
      badge: 'CRT PHOSPHOR',
      desc: 'Retro-futuristic monochrome terminal green on deep void black with CRT scanlines',
      primaryColor: '#22c55e',
      secondaryColor: '#4ade80',
      tertiaryColor: '#16a34a',
      bgPreview: 'from-[#020603] to-[#051a08]',
      borderGlow: 'hover:border-emerald-400 hover:shadow-emerald-500/25',
      activeBorder: 'border-emerald-400 shadow-xl shadow-emerald-500/30 ring-2 ring-emerald-400/30',
      tagline: 'Green Data Rain & Terminal Telemetry',
    },
    {
      id: 'obsidian' as ThemeMode,
      name: 'Midnight Obsidian',
      badge: 'STEALTH OPS',
      desc: 'Minimalist luxury stealth pitch black with crisp ice-cyan borders and frosted glass',
      primaryColor: '#38bdf8',
      secondaryColor: '#94a3b8',
      tertiaryColor: '#64748b',
      bgPreview: 'from-[#050508] to-[#0f1118]',
      borderGlow: 'hover:border-sky-400 hover:shadow-sky-500/25',
      activeBorder: 'border-sky-400 shadow-xl shadow-sky-500/30 ring-2 ring-sky-400/30',
      tagline: 'Stealth Carbon Fiber & Ice Cyan',
    },
    {
      id: 'solar' as ThemeMode,
      name: 'Neo Tokyo Solar',
      badge: 'LIGHT CYBER',
      desc: 'High-contrast holographic daytime cyber theme with electric blue and crimson accents',
      primaryColor: '#2563eb',
      secondaryColor: '#e11d48',
      tertiaryColor: '#0ea5e9',
      bgPreview: 'from-[#f4f7fc] to-[#e2e8f0]',
      borderGlow: 'hover:border-blue-500 hover:shadow-blue-500/25',
      activeBorder: 'border-blue-600 shadow-xl shadow-blue-500/30 ring-2 ring-blue-500/30',
      tagline: 'Daylight High-Contrast Hologram',
    },
  ];

  const handleSelect = (id: ThemeMode) => {
    soundFX.playSweep();
    onSelectTheme(id);
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-6 box-border">
      {/* Header Bar with Track Player */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[color:var(--accent)]/20 gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-[color:var(--accent)] flex items-center justify-center text-black font-black shadow-md shadow-[color:var(--accent)]/30 shrink-0">
            <Palette className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-black tracking-tight text-white font-mono flex items-center gap-2 truncate">
              CYBERPUNK THEME MATRIX
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[color:var(--accent)]/20 text-[color:var(--accent)] border border-[color:var(--accent)]/40 truncate">
                {currentTheme.toUpperCase()}
              </span>
            </h3>
            <p className="text-[10px] sm:text-xs text-zinc-400 font-mono truncate">
              Reference themes inspired by Cyberpunk: Edgerunners & Night City vistas
            </p>
          </div>
        </div>

        {/* BGM Player Bar: Let You Down */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black border border-[color:var(--accent)]/40 text-xs font-mono">
            <Disc className="w-4 h-4 text-[color:var(--accent)] animate-spin" />
            <div className="hidden sm:block text-[11px]">
              <span className="text-zinc-400 block text-[9px]">BGM OST</span>
              <span className="text-white font-bold">Let You Down</span>
            </div>
          </div>

          <button
            onClick={() => {
              soundFX.playBlip();
              onToggleMute();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold font-mono border transition-all cursor-pointer ${
              !isMuted
                ? 'bg-[color:var(--accent)] text-black border-[color:var(--accent)] shadow-md shadow-[color:var(--accent)]/25'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800'
            }`}
          >
            {!isMuted ? (
              <Volume2 className="w-4 h-4 text-black animate-pulse" />
            ) : (
              <VolumeX className="w-4 h-4 text-zinc-500" />
            )}
            <span>{isMuted ? 'UNMUTE BGM' : 'MUTE BGM'}</span>
          </button>
        </div>
      </div>

      {/* Theme Cards Showcase Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {themes.map((th) => {
          const isActive = currentTheme === th.id;

          return (
            <motion.div
              key={th.id}
              whileHover={{ y: -3, scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => handleSelect(th.id)}
              className={`cursor-pointer rounded-2xl p-4 sm:p-5 border bg-gradient-to-br ${th.bgPreview} transition-all relative overflow-hidden flex flex-col justify-between box-border ${
                isActive ? th.activeBorder : `border-zinc-800/80 ${th.borderGlow}`
              }`}
            >
              {/* Active Indicator Banner */}
              {isActive && (
                <div className="absolute top-0 right-0 px-3 py-0.5 bg-[color:var(--accent)] text-black text-[10px] font-black uppercase tracking-wider rounded-bl-xl font-mono shadow-md">
                  CURRENT THEME
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md font-mono bg-white/10 text-white border border-white/10">
                    {th.badge}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-xs"
                      style={{ backgroundColor: th.primaryColor }}
                    ></span>
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-xs"
                      style={{ backgroundColor: th.secondaryColor }}
                    ></span>
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-xs"
                      style={{ backgroundColor: th.tertiaryColor }}
                    ></span>
                  </div>
                </div>

                <h4
                  className={`text-sm sm:text-base font-black font-mono tracking-wide mt-2 ${
                    th.id === 'solar' ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  {th.name}
                </h4>
                <p className="text-[10px] font-mono text-[color:var(--accent)] mt-0.5 font-bold">
                  {th.tagline}
                </p>
                <p
                  className={`text-xs mt-1.5 leading-relaxed line-clamp-2 ${
                    th.id === 'solar' ? 'text-slate-600' : 'text-zinc-300'
                  }`}
                >
                  {th.desc}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono">
                <span
                  style={{ color: th.primaryColor }}
                  className="font-bold flex items-center gap-1 text-[11px]"
                >
                  {isActive ? <Check className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                  {isActive ? 'Theme Loaded' : 'Apply Theme'}
                </span>
                <span className="text-[10px] text-zinc-400">1-Click Switch</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
