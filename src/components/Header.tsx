import React, { useState } from 'react';
import { Volume2, VolumeX, Music, Sliders, Home, Sparkles, Award } from 'lucide-react';
import { sound } from '../audio/soundManager';

interface HeaderProps {
  currentView: string;
  onGoHome: () => void;
  onOpenSoundSettings: () => void;
  xp: number;
  completedCount: number;
  totalMissions: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onGoHome,
  onOpenSoundSettings,
  xp,
  completedCount,
  totalMissions,
}) => {
  const [bgmOn, setBgmOn] = useState(sound.bgmEnabled);
  const [sfxOn, setSfxOn] = useState(sound.sfxEnabled);

  const toggleBgm = () => {
    sound.init();
    const next = !bgmOn;
    setBgmOn(next);
    sound.setBgmEnabled(next);
    if (next) {
      sound.playClick();
    }
  };

  const toggleSfx = () => {
    sound.init();
    const next = !sfxOn;
    setSfxOn(next);
    sound.setSfxEnabled(next);
    if (next) {
      sound.playClick();
    }
  };

  return (
    <header className="hud-panel mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
      {/* Brand & Mascot */}
      <div
        className="flex cursor-pointer items-center gap-3 transition-transform hover:scale-[1.02]"
        onClick={() => {
          sound.playClick();
          onGoHome();
        }}
      >
        <div className="relative size-11 overflow-hidden rounded-full border-2 border-white bg-amber-100 shadow-md">
          <img
            src="/assets/mascot.png"
            alt="탐험대 마스코트"
            className="size-full object-cover"
            onError={(e) => {
              // Fallback to cute mouse emoji
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-xl font-bold">
            🐭
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="font-display text-xl tracking-tight text-primary sm:text-2xl">
              디지털 탐험대
            </span>
            <span className="status-chip status-new text-[0.7rem]">Sound Edition 🔊</span>
          </div>
          <p className="hidden text-xs font-bold text-muted-foreground sm:block">
            마우스 아일랜드 미션 클럽
          </p>
        </div>
      </div>

      {/* Right Stats & Sound Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {currentView !== 'lobby' && (
          <button
            onClick={() => {
              sound.playClick();
              onGoHome();
            }}
            className="btn-3d btn-3d-ghost text-sm px-3 py-1.5"
            title="섬으로 돌아가기"
          >
            <Home className="size-4 text-primary" />
            <span className="hidden sm:inline">섬으로</span>
          </button>
        )}

        {/* XP Badge */}
        <div className="flex items-center gap-1.5 rounded-xl bg-amber-50 px-3 py-1.5 font-display text-sm text-amber-700 shadow-inner">
          <Sparkles className="size-4 text-amber-500 fill-amber-400" />
          <span>{xp} XP</span>
        </div>

        {/* Missions Progress */}
        <div className="hidden items-center gap-1.5 rounded-xl bg-blue-50 px-3 py-1.5 font-display text-sm text-blue-700 shadow-inner sm:flex">
          <Award className="size-4 text-blue-500" />
          <span>
            {completedCount}/{totalMissions} 완료
          </span>
        </div>

        {/* BGM Toggle Button */}
        <button
          onClick={toggleBgm}
          className={`flex size-10 items-center justify-center rounded-xl border-2 transition-all ${
            bgmOn
              ? 'border-indigo-200 bg-indigo-50 text-indigo-600 shadow-sm'
              : 'border-slate-200 bg-slate-100 text-slate-400'
          }`}
          title={bgmOn ? '배경음악 끄기 (BGM)' : '배경음악 켜기 (BGM)'}
          aria-label="배경음악 토글"
        >
          <Music className={`size-5 ${bgmOn ? 'animate-bounce' : ''}`} />
        </button>

        {/* SFX Toggle Button */}
        <button
          onClick={toggleSfx}
          className={`flex size-10 items-center justify-center rounded-xl border-2 transition-all ${
            sfxOn
              ? 'border-emerald-200 bg-emerald-50 text-emerald-600 shadow-sm'
              : 'border-slate-200 bg-slate-100 text-slate-400'
          }`}
          title={sfxOn ? '효과음 끄기 (SFX)' : '효과음 켜기 (SFX)'}
          aria-label="효과음 토글"
        >
          {sfxOn ? <Volume2 className="size-5" /> : <VolumeX className="size-5" />}
        </button>

        {/* Sound Settings Modal Trigger */}
        <button
          onClick={() => {
            sound.playClick();
            onOpenSoundSettings();
          }}
          className="btn-3d btn-3d-ghost size-10 !p-0"
          title="사운드 설정 & 테스트"
          aria-label="사운드 설정"
        >
          <Sliders className="size-5 text-primary" />
        </button>
      </div>
    </header>
  );
};
