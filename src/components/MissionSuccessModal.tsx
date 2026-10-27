import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Sparkles, ArrowRight, RotateCcw, Home, Award } from 'lucide-react';
import { Mission, Badge } from '../types/game';
import { sound } from '../audio/soundManager';

interface MissionSuccessModalProps {
  mission: Mission;
  newBadge: Badge | null;
  onGoHome: () => void;
  onNextMission: () => void;
  onReplay: () => void;
}

export const MissionSuccessModal: React.FC<MissionSuccessModalProps> = ({
  mission,
  newBadge,
  onGoHome,
  onNextMission,
  onReplay,
}) => {
  useEffect(() => {
    // Play celebratory victory fanfare
    sound.playVictory();

    // Launch colorful confetti celebration
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
        });
      }, 300);
    } catch {
      // Ignore
    }

    if (newBadge) {
      setTimeout(() => {
        sound.playBadgeUnlock();
      }, 800);
    }
  }, [newBadge]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-pop select-none">
      <div className="card-3d relative w-full max-w-md overflow-hidden bg-white p-6 sm:p-8 text-center shadow-2xl">
        {/* Top Trophy Banner */}
        <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-3xl bg-amber-100 text-amber-500 shadow-inner animate-bounce">
          <Trophy className="size-10" />
        </div>

        <span className="status-chip status-done text-xs mb-2">미션 완벽 클리어! 🎉</span>

        <h2 className="font-display text-3xl text-slate-800 mb-1">
          {mission.title} 완료!
        </h2>
        <p className="text-sm font-bold text-muted-foreground mb-6">
          마우스 실력이 쑥쑥 늘었어요! 멋진 탐험대원이에요!
        </p>

        {/* Reward Box */}
        <div className="mb-6 rounded-2xl bg-amber-50/70 p-4 border border-amber-200/60 flex items-center justify-around">
          <div className="flex flex-col items-center">
            <span className="text-xs font-bold text-slate-400">보상 경험치</span>
            <span className="font-display text-2xl text-amber-600 flex items-center gap-1">
              <Sparkles className="size-5 fill-amber-500" /> +{mission.xp} XP
            </span>
          </div>

          {newBadge && (
            <div className="flex flex-col items-center border-l border-amber-200/60 pl-6">
              <span className="text-xs font-bold text-slate-400">획득한 배지</span>
              <span className="font-display text-lg text-indigo-600 flex items-center gap-1">
                <Award className="size-5" /> {newBadge.name}
              </span>
            </div>
          )}
        </div>

        {/* Mascot Speech Bubble */}
        <div className="mb-6 rounded-2xl bg-slate-50 p-3 text-xs font-bold text-slate-600 flex items-center gap-3">
          <span className="text-2xl">🐭</span>
          <p className="text-left">
            "찍찍! 손 감각이 정말 섬세해졌어요! 다음 모험 지역으로 계속 떠나볼까요?"
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 sm:flex-row sm:justify-center">
          <button
            onClick={() => {
              sound.playClick();
              onNextMission();
            }}
            className="btn-3d btn-3d-primary flex-1 justify-center py-2.5 text-sm"
          >
            <span>다음 미션으로</span>
            <ArrowRight className="size-4" />
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onGoHome();
            }}
            className="btn-3d btn-3d-ghost justify-center py-2.5 text-sm"
          >
            <Home className="size-4" />
            <span>섬으로</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onReplay();
            }}
            className="btn-3d btn-3d-ghost justify-center py-2.5 text-sm"
          >
            <RotateCcw className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
