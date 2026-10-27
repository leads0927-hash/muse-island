import React from 'react';
import { MousePointer, Sparkles, Hand, Palette, Compass, ArrowRight, CheckCircle2, Star } from 'lucide-react';
import { Mission } from '../types/game';
import { sound } from '../audio/soundManager';

interface MissionCardProps {
  mission: Mission;
  onSelect: (id: Mission['id']) => void;
}

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  MousePointer,
  Sparkles,
  Hand,
  Palette,
  Compass,
};

export const MissionCard: React.FC<MissionCardProps> = ({ mission, onSelect }) => {
  const IconComp = ICON_MAP[mission.iconName] || MousePointer;

  const getStatusBadge = () => {
    switch (mission.status) {
      case 'done':
        return <span className="status-chip status-done">완료됨</span>;
      case 'progress':
        return <span className="status-chip status-progress">진행 중</span>;
      default:
        return <span className="status-chip status-new">새 미션</span>;
    }
  };

  return (
    <div
      onClick={() => {
        sound.playClick();
        onSelect(mission.id);
      }}
      onMouseEnter={() => sound.playHover()}
      className="card-3d group flex flex-col justify-between p-5 cursor-pointer"
    >
      <div>
        {/* Top Icon & Status */}
        <div className="flex items-center justify-between mb-4">
          <div className={`icon-3d size-14 tone-${mission.tone}`}>
            <IconComp className="size-7" />
          </div>
          {getStatusBadge()}
        </div>

        {/* Title & XP */}
        <div className="flex items-baseline justify-between mb-1">
          <h3 className="font-display text-xl text-slate-800 group-hover:text-primary transition-colors">
            {mission.title}
          </h3>
          <span className="font-display text-sm font-bold text-amber-600">+{mission.xp} XP</span>
        </div>

        {/* Description */}
        <p className="text-xs font-bold text-slate-500 mb-3 line-clamp-2">
          {mission.description}
        </p>

        {/* Difficulty */}
        <div className="flex items-center gap-1 mb-4">
          <span className="text-xs font-bold text-slate-400">난이도:</span>
          {Array.from({ length: 3 }).map((_, i) => (
            <Star
              key={i}
              className={`size-3.5 ${
                i < mission.difficulty
                  ? 'fill-amber-400 text-amber-400'
                  : 'fill-slate-200 text-slate-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Progress & Start Button */}
      <div>
        <div className="gauge mb-3">
          <div className="gauge-fill" style={{ width: `${mission.progress}%` }} />
        </div>

        <button className="btn-3d btn-3d-ghost w-full justify-between text-xs font-bold">
          <span>{mission.status === 'done' ? '다시 도전' : '미션 입장'}</span>
          <ArrowRight className="size-4 text-primary group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};
