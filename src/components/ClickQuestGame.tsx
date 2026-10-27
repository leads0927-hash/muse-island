import React, { useState, useEffect, useRef } from 'react';
import { Star, Sparkles, Trophy, RotateCcw } from 'lucide-react';
import { sound } from '../audio/soundManager';

interface StarObj {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  caught: boolean;
  scale: number;
  rotation: number;
}

interface ClickQuestGameProps {
  onProgress: (ratio: number) => void;
  onComplete: () => void;
}

const TOTAL_STARS = 10;
const STAR_COLORS = ['#ffd166', '#ffb703', '#4cc9f0', '#06d6a0', '#ff70a6', '#f72585'];

export const ClickQuestGame: React.FC<ClickQuestGameProps> = ({ onProgress, onComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [stars, setStars] = useState<StarObj[]>([]);
  const [caughtCount, setCaughtCount] = useState<number>(0);
  const [message, setMessage] = useState<string>('하늘을 날아다니는 별을 마우스로 클릭해보세요!');
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; color: string }[]>([]);

  // Initialize stars
  const initGame = () => {
    const list: StarObj[] = [];
    for (let i = 0; i < TOTAL_STARS; i++) {
      list.push({
        id: i,
        x: 15 + Math.random() * 70,
        y: 15 + Math.random() * 65,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        size: 46 + Math.random() * 16,
        color: STAR_COLORS[i % STAR_COLORS.length],
        caught: false,
        scale: 1,
        rotation: Math.random() * 360,
      });
    }
    setStars(list);
    setCaughtCount(0);
    setMessage('하늘을 날아다니는 별을 마우스로 클릭해보세요!');
    onProgress(0);
  };

  useEffect(() => {
    initGame();
    sound.speakGuidance('하늘의 별을 마우스로 클릭해서 잡아보세요!');
  }, []);

  // Star movement physics loop
  useEffect(() => {
    let animId: number;
    const update = () => {
      setStars((prev) =>
        prev.map((star) => {
          if (star.caught) return star;
          let nx = star.x + star.vx;
          let ny = star.y + star.vy;
          let nvx = star.vx;
          let nvy = star.vy;

          if (nx < 8 || nx > 92) nvx = -nvx;
          if (ny < 12 || ny > 85) nvy = -nvy;

          return {
            ...star,
            x: nx,
            y: ny,
            vx: nvx,
            vy: nvy,
            rotation: star.rotation + 0.8,
          };
        })
      );
      animId = requestAnimationFrame(update);
    };

    animId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animId);
  }, []);

  const handleStarClick = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const target = stars.find((s) => s.id === id);
    if (!target || target.caught) return;

    const nextCount = caughtCount + 1;
    setCaughtCount(nextCount);

    // Play sparkling rising combo pitch audio
    sound.playStarCatch(nextCount);

    // Spawn sparkle particles
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      const newParts = Array.from({ length: 8 }, (_, i) => ({
        id: Date.now() + i,
        x: clickX + (Math.random() - 0.5) * 50,
        y: clickY + (Math.random() - 0.5) * 50,
        color: target.color,
      }));
      setParticles((prev) => [...prev, ...newParts]);
      setTimeout(() => {
        setParticles((prev) => prev.filter((p) => !newParts.includes(p)));
      }, 600);
    }

    setStars((prev) =>
      prev.map((s) => (s.id === id ? { ...s, caught: true } : s))
    );

    const ratio = nextCount / TOTAL_STARS;
    onProgress(ratio);

    if (nextCount === TOTAL_STARS) {
      setMessage('🎉 축하합니다! 모든 별을 다 잡았어요!');
      sound.speakGuidance('멋져요! 별 10개를 모두 잡았습니다!');
      setTimeout(() => {
        onComplete();
      }, 700);
    } else {
      setMessage(`반짝! 별 ${nextCount}개 획득! (${nextCount}/${TOTAL_STARS})`);
      sound.playAnimalese('반짝!');
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative flex h-[520px] w-full flex-col overflow-hidden rounded-3xl border-4 border-white bg-gradient-to-b from-[#101935] via-[#202b52] to-[#394989] p-5 shadow-2xl select-none"
    >
      {/* Top HUD */}
      <div className="flex items-center justify-between z-10">
        <div className="hud-panel flex items-center gap-2 px-4 py-2 font-display text-sm text-slate-800">
          <Star className="size-5 text-amber-400 fill-amber-400 animate-spin" />
          <span>
            잡은 별: <b className="text-primary text-base">{caughtCount}</b> / {TOTAL_STARS}
          </span>
        </div>

        <button
          onClick={initGame}
          className="btn-3d btn-3d-ghost text-xs px-3 py-1.5"
          title="다시 하기"
        >
          <RotateCcw className="size-4" />
          <span>다시 시작</span>
        </button>
      </div>

      {/* Floating Stars Arena */}
      <div className="relative flex-1">
        {stars.map((star) => {
          if (star.caught) return null;
          return (
            <button
              key={star.id}
              onClick={(e) => handleStarClick(star.id, e)}
              onMouseEnter={() => sound.playHover()}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-125 active:scale-95 focus:outline-none"
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
                transform: `translate(-50%, -50%) rotate(${star.rotation}deg)`,
              }}
              aria-label="별 잡기"
            >
              <div
                className="flex items-center justify-center rounded-full p-2.5 transition-all"
                style={{
                  filter: `drop-shadow(0 0 14px ${star.color})`,
                }}
              >
                <Star
                  className="size-10"
                  style={{ fill: star.color, stroke: '#ffffff', strokeWidth: 1.5 }}
                />
              </div>
            </button>
          );
        })}

        {/* Sparkle burst particles */}
        {particles.map((p) => (
          <div
            key={p.id}
            className="pointer-events-none absolute size-3.5 rounded-full animate-ping"
            style={{
              left: p.x,
              top: p.y,
              backgroundColor: p.color,
              boxShadow: `0 0 8px ${p.color}`,
            }}
          />
        ))}
      </div>

      {/* Bottom Guidance Message */}
      <div className="hud-panel z-10 flex items-center justify-between px-5 py-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">✨</span>
          <p className="font-display text-base text-slate-800">{message}</p>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
          <Sparkles className="size-4 text-amber-500" />
          <span>팁: 날아가는 별의 중심을 정확히 클릭해보세요!</span>
        </div>
      </div>
    </div>
  );
};
