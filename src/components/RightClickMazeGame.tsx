import React, { useState, useEffect } from 'react';
import { Flag, Compass, RotateCcw, AlertCircle } from 'lucide-react';
import { sound } from '../audio/soundManager';

interface RightClickMazeGameProps {
  onProgress: (ratio: number) => void;
  onComplete: () => void;
}

const COLS = 7;
const ROWS = 5;
const FLAGS: [number, number][] = [
  [5, 0],
  [1, 3],
  [6, 4],
];
const ROCKS = new Set(['2,1', '3,1', '4,3', '2,3', '5,2']);

export const RightClickMazeGame: React.FC<RightClickMazeGameProps> = ({
  onProgress,
  onComplete,
}) => {
  const [characterPos, setCharacterPos] = useState<[number, number]>([0, 0]);
  const [collectedFlags, setCollectedFlags] = useState<number[]>([]);
  const [facingDir, setFacingDir] = useState<number>(1); // 1 = right, -1 = left
  const [message, setMessage] = useState<string>('가고 싶은 칸에서 마우스 오른쪽 버튼(우클릭)을 눌러 이동하세요!');

  useEffect(() => {
    sound.speakGuidance('가고 싶은 칸에서 마우스 오른쪽 버튼을 눌러 깃발을 찾아보세요!');
  }, []);

  const handleCellClick = (x: number, y: number, e: React.MouseEvent) => {
    // Normal left click handler -> remind player to right-click
    e.preventDefault();
    sound.playWrong();
    setMessage('왼쪽 말고 마우스 오른쪽 버튼을 톡 눌러봐요! 🖱️');
    sound.playAnimalese('오른쪽 버튼!');
  };

  const handleCellContextMenu = (x: number, y: number, e: React.MouseEvent) => {
    e.preventDefault();

    // Check rock obstacle
    if (ROCKS.has(`${x},${y}`)) {
      sound.playWrong();
      setMessage('바위는 단단해서 지나갈 수 없어요! 다른 길로 가볼까요? 🪨');
      return;
    }

    // Move character
    setFacingDir(x < characterPos[0] ? -1 : 1);
    setCharacterPos([x, y]);
    sound.playStep();

    // Check if stepped on a flag
    const flagIdx = FLAGS.findIndex(([fx, fy]) => fx === x && fy === y);
    if (flagIdx >= 0 && !collectedFlags.includes(flagIdx)) {
      const nextFlags = [...collectedFlags, flagIdx];
      setCollectedFlags(nextFlags);

      sound.playFlagGet(nextFlags.length);
      setMessage(`깃발 획득! 만세! 🚩 (${nextFlags.length}/${FLAGS.length})`);

      const ratio = nextFlags.length / FLAGS.length;
      onProgress(ratio);

      if (nextFlags.length === FLAGS.length) {
        setMessage('축하합니다! 미로의 깃발 3개를 모두 찾았어요! 🏆');
        sound.speakGuidance('멋져요! 우클릭 모험을 모두 완료했습니다!');
        setTimeout(() => {
          onComplete();
        }, 700);
      }
    } else {
      setMessage(`캐릭터가 (${x + 1}, ${y + 1}) 위치로 걸어갔어요! 🐾`);
    }
  };

  const resetGame = () => {
    setCharacterPos([0, 0]);
    setCollectedFlags([]);
    setFacingDir(1);
    setMessage('가고 싶은 칸에서 마우스 오른쪽 버튼(우클릭)을 눌러 이동하세요!');
    onProgress(0);
  };

  return (
    <div
      onContextMenu={(e) => e.preventDefault()}
      className="relative flex h-[520px] w-full flex-col items-center justify-between rounded-3xl border-4 border-white bg-gradient-to-b from-[#f3e8ff] via-[#e9d5ff] to-[#d8b4fe] p-5 shadow-2xl select-none"
    >
      {/* Top HUD */}
      <div className="flex w-full items-center justify-between z-10">
        <div className="hud-panel flex items-center gap-2 px-4 py-2 font-display text-sm text-slate-800">
          <Flag className="size-5 text-rose-500 fill-rose-500" />
          <span>
            찾은 깃발: <b className="text-primary text-base">{collectedFlags.length}</b> / {FLAGS.length}
          </span>
        </div>

        <button
          onClick={resetGame}
          className="btn-3d btn-3d-ghost text-xs px-3 py-1.5"
          title="다시 하기"
        >
          <RotateCcw className="size-4" />
          <span>처음부터</span>
        </button>
      </div>

      {/* 7x5 Maze Board */}
      <div className="relative my-auto">
        <div
          className="grid gap-2 sm:gap-2.5 p-3 rounded-2xl bg-white/70 shadow-lg border border-purple-200"
          style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: COLS * ROWS }).map((_, index) => {
            const x = index % COLS;
            const y = Math.floor(index / COLS);
            const isRock = ROCKS.has(`${x},${y}`);
            const flagIndex = FLAGS.findIndex(([fx, fy]) => fx === x && fy === y);
            const hasFlag = flagIndex >= 0 && !collectedFlags.includes(flagIndex);

            return (
              <button
                key={index}
                onClick={(e) => handleCellClick(x, y, e)}
                onContextMenu={(e) => handleCellContextMenu(x, y, e)}
                className={`maze-cell relative size-11 sm:size-14 font-bold transition-all ${
                  isRock ? 'maze-rock cursor-not-allowed' : 'cursor-pointer hover:ring-2 hover:ring-primary'
                }`}
                aria-label={`셀 ${x}, ${y}`}
              >
                {isRock && <span className="text-xl sm:text-2xl drop-shadow">🪨</span>}
                {hasFlag && (
                  <Flag className="size-6 text-rose-500 fill-rose-500 animate-bounce drop-shadow" />
                )}
              </button>
            );
          })}
        </div>

        {/* Walking Mascot Mouse positioned on grid */}
        <div
          className="pointer-events-none absolute size-11 sm:size-14 transition-all duration-300 ease-out"
          style={{
            left: `calc(0.75rem + ${characterPos[0]} * (100% - 1.5rem) / ${COLS})`,
            top: `calc(0.75rem + ${characterPos[1]} * (100% - 1.5rem) / ${ROWS})`,
            transform: `scaleX(${facingDir})`,
          }}
        >
          <img
            src="/assets/mascot.png"
            alt="탐험대 캐릭터"
            className="size-full object-contain drop-shadow-md"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <span className="flex size-full items-center justify-center text-3xl">
            🐭
          </span>
        </div>
      </div>

      {/* Bottom Guidance Message */}
      <div className="hud-panel z-10 flex w-full items-center justify-between px-5 py-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🚩</span>
          <p className="font-display text-base text-slate-800">{message}</p>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
          <Compass className="size-4 text-purple-600" />
          <span>팁: 마우스 오른쪽 버튼을 누르면 그 칸으로 성큼성큼 이동해요!</span>
        </div>
      </div>
    </div>
  );
};
