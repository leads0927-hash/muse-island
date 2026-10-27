import React, { useState, useRef, useEffect } from 'react';
import { RotateCcw, Utensils } from 'lucide-react';
import { sound } from '../audio/soundManager';

interface FoodItem {
  id: string;
  name: string;
  emoji: string;
  x: number;
  y: number;
}

interface DragFeedGameProps {
  onProgress: (ratio: number) => void;
  onComplete: () => void;
}

const INITIAL_FOODS: FoodItem[] = [
  { id: 'cheese', name: '치즈', emoji: '🧀', x: 12, y: 22 },
  { id: 'apple', name: '사과', emoji: '🍎', x: 10, y: 55 },
  { id: 'carrot', name: '당근', emoji: '🥕', x: 14, y: 82 },
  { id: 'cookie', name: '쿠키', emoji: '🍪', x: 86, y: 22 },
  { id: 'banana', name: '바나나', emoji: '🍌', x: 88, y: 55 },
  { id: 'corn', name: '옥수수', emoji: '🌽', x: 84, y: 82 },
];

export const DragFeedGame: React.FC<DragFeedGameProps> = ({ onProgress, onComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouthRef = useRef<HTMLDivElement>(null);

  const [foods, setFoods] = useState<FoodItem[]>(INITIAL_FOODS);
  const [eatenIds, setEatenIds] = useState<string[]>([]);
  const [draggingFood, setDraggingFood] = useState<{ id: string; x: number; y: number } | null>(null);
  const [isChomping, setIsChomping] = useState<boolean>(false);
  const [isNearMouth, setIsNearMouth] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('먹이를 꾹 누른 채 마우스를 끌어서 입에 쏙 넣어주세요!');

  useEffect(() => {
    sound.speakGuidance('맛있는 먹이를 마우스로 꾹 누른 채 친구 입에 넣어주세요!');
  }, []);

  const getRelativeCoords = (e: React.PointerEvent) => {
    if (!containerRef.current) return { x: 50, y: 50 };
    const rect = containerRef.current.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    };
  };

  const checkNearMouth = (clientX: number, clientY: number) => {
    if (!mouthRef.current) return false;
    const rect = mouthRef.current.getBoundingClientRect();
    return (
      clientX > rect.left - 30 &&
      clientX < rect.right + 30 &&
      clientY > rect.top - 30 &&
      clientY < rect.bottom + 30
    );
  };

  const handlePointerDown = (food: FoodItem, e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    sound.playFoodGrab();
    const coords = getRelativeCoords(e);
    setDraggingFood({ id: food.id, x: coords.x, y: coords.y });
    setMessage(`${food.name}를(을) 입으로 쏙 가져가보세요!`);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingFood) return;
    const coords = getRelativeCoords(e);
    setDraggingFood({ ...draggingFood, x: coords.x, y: coords.y });

    const near = checkNearMouth(e.clientX, e.clientY);
    setIsNearMouth(near);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!draggingFood) return;

    if (checkNearMouth(e.clientX, e.clientY)) {
      const food = foods.find((f) => f.id === draggingFood.id);
      const nextEaten = [...eatenIds, draggingFood.id];
      setEatenIds(nextEaten);

      // Play Chomp audio and chomp animation
      sound.playChomp();
      setIsChomping(true);
      setTimeout(() => setIsChomping(false), 400);

      const ratio = nextEaten.length / foods.length;
      onProgress(ratio);

      if (food) {
        setMessage(`냠냠! 맛있는 ${food.name} 고마워요! (${nextEaten.length}/${foods.length})`);
      }

      if (nextEaten.length === foods.length) {
        setMessage('배불러요! 모든 먹이를 맛있게 다 먹었어요! 🏆');
        sound.speakGuidance('멋져요! 배부르게 먹이를 모두 주었습니다!');
        setTimeout(() => {
          onComplete();
        }, 700);
      }
    }

    setDraggingFood(null);
    setIsNearMouth(false);
  };

  const resetGame = () => {
    setEatenIds([]);
    setDraggingFood(null);
    setIsChomping(false);
    setIsNearMouth(false);
    setMessage('먹이를 꾹 누른 채 마우스를 끌어서 입에 쏙 넣어주세요!');
    onProgress(0);
  };

  const remainingFoods = foods.filter((f) => !eatenIds.includes(f.id));

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className="relative flex h-[520px] w-full flex-col items-center justify-between overflow-hidden rounded-3xl border-4 border-white bg-gradient-to-b from-[#e0f2fe] via-[#bae6fd] to-[#7dd3fc] p-5 shadow-2xl select-none touch-none"
    >
      {/* Top HUD */}
      <div className="flex w-full items-center justify-between z-10 pointer-events-auto">
        <div className="hud-panel flex items-center gap-2 px-4 py-2 font-display text-sm text-slate-800">
          <Utensils className="size-5 text-primary" />
          <span>
            먹인 음식: <b className="text-primary text-base">{eatenIds.length}</b> / {foods.length}
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

      {/* Mascot Center Hungry Mouse */}
      <div
        className={`pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-transform duration-200 ${
          isChomping ? 'chomp' : isNearMouth ? 'scale-110' : 'scale-100'
        }`}
      >
        <div className="relative">
          <svg viewBox="0 0 200 200" className="size-56 sm:size-64 drop-shadow-xl">
            {/* Ears */}
            <circle cx="45" cy="50" r="38" fill="#c8ccd6" />
            <circle cx="45" cy="50" r="24" fill="#f7b3b3" />
            <circle cx="155" cy="50" r="38" fill="#c8ccd6" />
            <circle cx="155" cy="50" r="24" fill="#f7b3b3" />

            {/* Head */}
            <circle cx="100" cy="110" r="78" fill="#c8ccd6" />
            <ellipse cx="100" cy="128" rx="55" ry="45" fill="#f3ede4" />

            {/* Eyes */}
            <circle cx="72" cy="92" r="9" fill="#2e1065" />
            <circle cx="128" cy="92" r="9" fill="#2e1065" />
            <circle cx="75" cy="89" r="3" fill="#ffffff" />
            <circle cx="131" cy="89" r="3" fill="#ffffff" />

            {/* Pink Cheeks */}
            <circle cx="58" cy="122" r="9" fill="#ffb5b5" opacity="0.6" />
            <circle cx="142" cy="122" r="9" fill="#ffb5b5" opacity="0.6" />

            {/* Nose */}
            <ellipse cx="100" cy="112" rx="8" ry="6" fill="#ff9aa8" />

            {/* Whiskers */}
            <line x1="30" y1="110" x2="60" y2="114" stroke="#718096" strokeWidth="2.5" />
            <line x1="28" y1="125" x2="58" y2="123" stroke="#718096" strokeWidth="2.5" />
            <line x1="170" y1="110" x2="140" y2="114" stroke="#718096" strokeWidth="2.5" />
            <line x1="172" y1="125" x2="142" y2="123" stroke="#718096" strokeWidth="2.5" />

            {/* Animated Mouth (open wide if near mouth or dragging) */}
            {isNearMouth || draggingFood ? (
              <>
                <ellipse cx="100" cy="148" rx="22" ry="16" fill="#800e13" />
                <ellipse cx="100" cy="154" rx="14" ry="7" fill="#ff8fa3" />
                {/* Cute little front teeth */}
                <rect x="94" y="132" width="6" height="6" fill="#ffffff" rx="1" />
                <rect x="100" y="132" width="6" height="6" fill="#ffffff" rx="1" />
              </>
            ) : (
              <path
                d="M86 138 Q100 152 114 138"
                stroke="#2e1065"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
              />
            )}
          </svg>

          {/* Invisible Hit Area for Mouth */}
          <div
            ref={mouthRef}
            className="absolute left-1/2 top-[66%] size-20 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
          />
        </div>
      </div>

      {/* Draggable Food Items */}
      {remainingFoods.map((food) => {
        const isDragged = draggingFood?.id === food.id;
        const posX = isDragged ? draggingFood.x : food.x;
        const posY = isDragged ? draggingFood.y : food.y;

        return (
          <div
            key={food.id}
            onPointerDown={(e) => handlePointerDown(food, e)}
            className={`food-item absolute -translate-x-1/2 -translate-y-1/2 ${
              isDragged ? 'food-dragging' : ''
            }`}
            style={{
              left: `${posX}%`,
              top: `${posY}%`,
            }}
          >
            <span>{food.emoji}</span>
          </div>
        );
      })}

      {/* Bottom Guidance Message */}
      <div className="hud-panel z-10 flex w-full items-center justify-between px-5 py-3 pointer-events-auto">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🍽️</span>
          <p className="font-display text-base text-slate-800">{message}</p>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
          <span>팁: 먹이를 마우스 왼쪽 버튼으로 꾹 누른 상태에서 움직여보세요!</span>
        </div>
      </div>
    </div>
  );
};
