import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, RotateCcw } from 'lucide-react';
import { sound } from '../audio/soundManager';

interface DoubleClickGameProps {
  onProgress: (ratio: number) => void;
  onComplete: () => void;
}

const TOTAL_HOLES = 9;
const GOAL_MOLES = 8;

export const DoubleClickGame: React.FC<DoubleClickGameProps> = ({ onProgress, onComplete }) => {
  const [activeHole, setActiveHole] = useState<number | null>(null);
  const [hitHole, setHitHole] = useState<number | null>(null);
  const [hammerPos, setHammerPos] = useState<{ x: number; y: number } | null>(null);
  const [score, setScore] = useState<number>(0);
  const [message, setMessage] = useState<string>('두더지가 쏙 나오면 빠르게 두 번(더블클릭) 톡-톡 때려잡아요!');
  const [hitPopups, setHitPopups] = useState<{ id: number; hole: number; text: string }[]>([]);
  const scoreRef = useRef(0);

  const spawnMole = () => {
    if (scoreRef.current >= GOAL_MOLES) return;
    setHitHole(null);
    setActiveHole((prev) => {
      let next = Math.floor(Math.random() * TOTAL_HOLES);
      if (next === prev) next = (next + 1) % TOTAL_HOLES;
      return next;
    });
    sound.playMoleAppear();
  };

  useEffect(() => {
    sound.speakGuidance('두더지가 나오면 마우스를 빠르게 두 번 눌러서 잡아보세요!');
    let timer: number;
    const loop = () => {
      if (scoreRef.current >= GOAL_MOLES) return;
      spawnMole();
      timer = window.setTimeout(loop, 2200);
    };

    timer = window.setTimeout(loop, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleSingleClick = (index: number, e: React.MouseEvent) => {
    if (index === activeHole && hitHole !== index) {
      sound.playMoleReminder();
      setMessage('한 번 더 빠르게 탁! (더블클릭해야 잡을 수 있어요!)');
      sound.playAnimalese('더블클릭!');

      // Gentle hammer tap preview
      const rect = e.currentTarget.getBoundingClientRect();
      setHammerPos({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 3 });
      setTimeout(() => setHammerPos(null), 180);
    }
  };

  const handleDoubleClick = (index: number, e: React.MouseEvent) => {
    if (index !== activeHole || hitHole === index) return;

    setHitHole(index);
    sound.playMoleWhack();
    setMessage('쾅! 뿅! 정타 성공! 대단해요! 🔨✨');

    // Hammer hit position
    const rect = e.currentTarget.getBoundingClientRect();
    setHammerPos({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 3 });
    setTimeout(() => setHammerPos(null), 300);

    // Floating text popup
    const newPopup = { id: Date.now(), hole: index, text: 'HIT! 뿅! 🎉' };
    setHitPopups((prev) => [...prev, newPopup]);
    setTimeout(() => {
      setHitPopups((prev) => prev.filter((p) => p.id !== newPopup.id));
    }, 700);

    const nextScore = scoreRef.current + 1;
    scoreRef.current = nextScore;
    setScore(nextScore);

    const ratio = nextScore / GOAL_MOLES;
    onProgress(ratio);

    setTimeout(() => {
      setActiveHole((prev) => (prev === index ? null : prev));
    }, 450);

    if (nextScore >= GOAL_MOLES) {
      setMessage('와우! 두더지 8마리를 모두 더블클릭으로 잡았어요! 🏆');
      sound.speakGuidance('멋져요! 두더지 잡기 미션을 완료했습니다!');
      setTimeout(() => {
        onComplete();
      }, 700);
    }
  };

  const resetGame = () => {
    scoreRef.current = 0;
    setScore(0);
    setHitHole(null);
    setActiveHole(null);
    setMessage('두더지가 쏙 나오면 빠르게 두 번(더블클릭) 톡-톡 때려잡아요!');
    onProgress(0);
    spawnMole();
  };

  return (
    <div className="relative flex h-[540px] w-full flex-col items-center justify-between rounded-3xl border-4 border-white bg-gradient-to-b from-[#bbf7d0] via-[#86efac] to-[#4ade80] p-5 shadow-2xl select-none">
      {/* Top HUD */}
      <div className="flex w-full items-center justify-between z-10">
        <div className="hud-panel flex items-center gap-2 px-4 py-2 font-display text-sm text-slate-800">
          <span className="text-xl">🔨</span>
          <span>
            잡은 두더지: <b className="text-primary text-base">{score}</b> / {GOAL_MOLES}
          </span>
        </div>

        <button
          onClick={resetGame}
          className="btn-3d btn-3d-ghost text-xs px-3 py-1.5"
          title="다시 하기"
        >
          <RotateCcw className="size-4" />
          <span>다시 시작</span>
        </button>
      </div>

      {/* 3x3 Whack-a-Mole Holes Grid */}
      <div className="grid grid-cols-3 gap-4 sm:gap-7 my-auto z-10">
        {Array.from({ length: TOTAL_HOLES }).map((_, index) => {
          const isUp = activeHole === index;
          const isHit = hitHole === index;
          const popup = hitPopups.find((p) => p.hole === index);

          return (
            <div
              key={index}
              onClick={(e) => handleSingleClick(index, e)}
              onDoubleClick={(e) => handleDoubleClick(index, e)}
              className="mole-hole relative size-24 cursor-pointer overflow-hidden sm:size-28"
            >
              {/* Hit Floating Score Indicator */}
              {popup && (
                <div className="pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 z-30 font-display text-base font-bold text-amber-500 drop-shadow animate-bounce">
                  {popup.text}
                </div>
              )}

              {/* AUTHENTIC ARCADE MOLE SVG */}
              <div
                className={`mole ${isUp ? 'mole-up' : ''}`}
                style={{
                  transform: isHit
                    ? 'scale(0.85, 0.72) translateY(12px) rotate(-6deg)'
                    : 'scale(1)',
                  transition: 'top 0.18s cubic-bezier(0.18, 0.89, 0.32, 1.28), transform 0.12s ease-out',
                }}
              >
                <svg viewBox="0 0 100 100" className="size-full">
                  <defs>
                    <radialGradient id="moleGrad" cx="40%" cy="35%" r="65%">
                      <stop offset="0%" stopColor="#a77348" />
                      <stop offset="70%" stopColor="#784824" />
                      <stop offset="100%" stopColor="#5a3316" />
                    </radialGradient>
                    <linearGradient id="helmetGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ffe066" />
                      <stop offset="100%" stopColor="#f59e0b" />
                    </linearGradient>
                  </defs>

                  {/* Mole Fur Body & Head */}
                  <ellipse cx="50" cy="56" rx="34" ry="36" fill="url(#moleGrad)" />

                  {/* Miner Safety Helmet (Classic Arcade Whack-a-Mole Icon) */}
                  <ellipse cx="50" cy="30" rx="27" ry="14" fill="url(#helmetGrad)" />
                  <path
                    d="M24 30 C 24 14, 76 14, 76 30 Z"
                    fill="url(#helmetGrad)"
                  />
                  <ellipse cx="50" cy="31" rx="28" ry="4" fill="#d97706" />
                  {/* Helmet Center Flashlight */}
                  <rect x="44" y="20" width="12" height="9" rx="2" fill="#e2e8f0" />
                  <ellipse cx="50" cy="24.5" rx="5" ry="3.5" fill="#38bdf8" />

                  {/* Beige Muzzle/Snout Area */}
                  <ellipse cx="50" cy="67" rx="21" ry="16" fill="#fde2d0" />

                  {/* Cute Pink Mole Nose */}
                  <ellipse cx="50" cy="58" rx="8" ry="5.5" fill="#f43f5e" />
                  {/* Nostrils */}
                  <circle cx="47.5" cy="59" r="1.3" fill="#881337" />
                  <circle cx="52.5" cy="59" r="1.3" fill="#881337" />

                  {/* Eyes: Dizzy X X if hit, cute shiny eyes if normal */}
                  {isHit ? (
                    <>
                      {/* Left X */}
                      <path
                        d="M33 46 l8 8 M41 46 l-8 8"
                        stroke="#1c1917"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                      />
                      {/* Right X */}
                      <path
                        d="M59 46 l8 8 M67 46 l-8 8"
                        stroke="#1c1917"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                      />
                      {/* Wobbly mouth */}
                      <path
                        d="M42 74 Q46 69 50 74 T58 74"
                        stroke="#573318"
                        strokeWidth="2.5"
                        fill="none"
                        strokeLinecap="round"
                      />
                      {/* Dizzy stars above */}
                      <text x="24" y="20" fontSize="11" fill="#facc15">💫</text>
                      <text x="64" y="18" fontSize="10" fill="#facc15">✨</text>
                    </>
                  ) : (
                    <>
                      {/* Round bead eyes */}
                      <ellipse cx="37" cy="48" rx="5" ry="6" fill="#1c1917" />
                      <ellipse cx="63" cy="48" rx="5" ry="6" fill="#1c1917" />
                      {/* Eye specular highlights */}
                      <circle cx="38.5" cy="46" r="2" fill="#ffffff" />
                      <circle cx="64.5" cy="46" r="2" fill="#ffffff" />
                      <circle cx="35.5" cy="50" r="1" fill="#ffffff" />
                      <circle cx="61.5" cy="50" r="1" fill="#ffffff" />

                      {/* Rosy Cheeks */}
                      <circle cx="28" cy="62" r="5" fill="#f472b6" opacity="0.6" />
                      <circle cx="72" cy="62" r="5" fill="#f472b6" opacity="0.6" />

                      {/* Happy Mole Teeth / Smile */}
                      <path
                        d="M44 68 Q50 76 56 68"
                        stroke="#573318"
                        strokeWidth="2.5"
                        fill="none"
                        strokeLinecap="round"
                      />
                      {/* Two cute buck teeth */}
                      <rect x="47" y="68" width="2.8" height="3.5" fill="#ffffff" rx="0.5" />
                      <rect x="50.2" y="68" width="2.8" height="3.5" fill="#ffffff" rx="0.5" />
                    </>
                  )}

                  {/* Whiskers */}
                  <line x1="22" y1="64" x2="10" y2="61" stroke="#784824" strokeWidth="1.5" />
                  <line x1="22" y1="67" x2="10" y2="69" stroke="#784824" strokeWidth="1.5" />
                  <line x1="78" y1="64" x2="90" y2="61" stroke="#784824" strokeWidth="1.5" />
                  <line x1="78" y1="67" x2="90" y2="69" stroke="#784824" strokeWidth="1.5" />

                  {/* Cute Digging Paws Resting on Ground */}
                  <ellipse cx="28" cy="85" rx="8" ry="6" fill="#fde2d0" stroke="#784824" strokeWidth="1" />
                  <circle cx="23" cy="88" r="1.5" fill="#ffffff" />
                  <circle cx="27" cy="90" r="1.5" fill="#ffffff" />
                  <circle cx="31" cy="90" r="1.5" fill="#ffffff" />

                  <ellipse cx="72" cy="85" rx="8" ry="6" fill="#fde2d0" stroke="#784824" strokeWidth="1" />
                  <circle cx="69" cy="90" r="1.5" fill="#ffffff" />
                  <circle cx="73" cy="90" r="1.5" fill="#ffffff" />
                  <circle cx="77" cy="88" r="1.5" fill="#ffffff" />
                </svg>
              </div>

              {/* Mole Hole Front Rim */}
              <div className="mole-rim" />
            </div>
          );
        })}
      </div>

      {/* Dynamic Hammer Whack Animation Overlay */}
      {hammerPos && (
        <div
          className="pointer-events-none fixed z-50 transition-transform -translate-x-1/2 -translate-y-1/2"
          style={{ left: hammerPos.x, top: hammerPos.y }}
        >
          <div className="animate-spin text-5xl drop-shadow-2xl" style={{ transform: 'rotate(-30deg)' }}>
            🔨
          </div>
        </div>
      )}

      {/* Bottom Guidance Message */}
      <div className="hud-panel z-10 flex w-full items-center justify-between px-5 py-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🔨</span>
          <p className="font-display text-base text-slate-800">{message}</p>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
          <Sparkles className="size-4 text-emerald-600" />
          <span>두더지가 튀어나왔을 때 빠르게 두 번 연속 클릭해보세요!</span>
        </div>
      </div>
    </div>
  );
};
