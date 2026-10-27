import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Target,
  Award,
  CheckCircle2,
  MousePointer,
  Sparkles,
  Hand,
  Palette,
  Compass,
  ArrowLeft,
  Volume2,
} from 'lucide-react';
import { MissionId, Mission, Badge, DailyQuest } from './types/game';
import {
  INITIAL_MISSIONS,
  INITIAL_BADGES,
  INITIAL_QUESTS,
  ISLAND_ZONES,
} from './data/missions';
import { sound } from './audio/soundManager';
import { Header } from './components/Header';
import { SoundSettingsModal } from './components/SoundSettingsModal';
import { IslandWorld3D } from './components/IslandWorld3D';
import { MissionCard } from './components/MissionCard';
import { ClickQuestGame } from './components/ClickQuestGame';
import { DoubleClickGame } from './components/DoubleClickGame';
import { DragFeedGame } from './components/DragFeedGame';
import { PaintPlaygroundGame } from './components/PaintPlaygroundGame';
import { RightClickMazeGame } from './components/RightClickMazeGame';
import { MissionSuccessModal } from './components/MissionSuccessModal';

const BADGE_ICONS: Record<string, React.FC<{ className?: string }>> = {
  MousePointer,
  Sparkles,
  Hand,
  Palette,
  Compass,
};

export default function App() {
  const [currentView, setCurrentView] = useState<'lobby' | MissionId>('lobby');
  const [missions, setMissions] = useState<Mission[]>(() => {
    try {
      const saved = localStorage.getItem('mouse_island_missions');
      return saved ? JSON.parse(saved) : INITIAL_MISSIONS;
    } catch {
      return INITIAL_MISSIONS;
    }
  });

  const [badges, setBadges] = useState<Badge[]>(() => {
    try {
      const saved = localStorage.getItem('mouse_island_badges');
      return saved ? JSON.parse(saved) : INITIAL_BADGES;
    } catch {
      return INITIAL_BADGES;
    }
  });

  const [quests, setQuests] = useState<DailyQuest[]>(() => {
    try {
      const saved = localStorage.getItem('mouse_island_quests');
      return saved ? JSON.parse(saved) : INITIAL_QUESTS;
    } catch {
      return INITIAL_QUESTS;
    }
  });

  const [xp, setXp] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('mouse_island_xp');
      return saved ? parseInt(saved, 10) : 50;
    } catch {
      return 50;
    }
  });

  const [soundModalOpen, setSoundModalOpen] = useState<boolean>(false);
  const [successModalOpen, setSuccessModalOpen] = useState<boolean>(false);
  const [newBadge, setNewBadge] = useState<Badge | null>(null);
  const [gameKey, setGameKey] = useState<number>(0);

  // Initialize Web Audio on first user click
  useEffect(() => {
    const handleFirstInteraction = () => {
      sound.init();
      if (sound.bgmEnabled) {
        sound.startBgm();
      }
      window.removeEventListener('pointerdown', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };

    window.addEventListener('pointerdown', handleFirstInteraction);
    window.addEventListener('keydown', handleFirstInteraction);

    return () => {
      window.removeEventListener('pointerdown', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
  }, []);

  // Save states to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('mouse_island_missions', JSON.stringify(missions));
      localStorage.setItem('mouse_island_badges', JSON.stringify(badges));
      localStorage.setItem('mouse_island_quests', JSON.stringify(quests));
      localStorage.setItem('mouse_island_xp', String(xp));
    } catch {
      // Ignore
    }
  }, [missions, badges, quests, xp]);

  const activeMission = missions.find((m) => m.id === currentView) || missions[0];

  const handleEnterMission = (id: MissionId) => {
    sound.playClick();
    setCurrentView(id);
    setSuccessModalOpen(false);
    setNewBadge(null);
    setGameKey((prev) => prev + 1);
  };

  const handleMissionProgress = (ratio: number) => {
    const pct = Math.round(ratio * 100);
    setMissions((prev) =>
      prev.map((m) => {
        if (m.id === currentView) {
          return {
            ...m,
            progress: Math.max(m.progress, pct),
            status: pct >= 100 ? 'done' : 'progress',
          };
        }
        return m;
      })
    );
  };

  const handleMissionComplete = () => {
    // Award XP
    const mission = missions.find((m) => m.id === currentView);
    if (mission) {
      setXp((prev) => prev + mission.xp);
    }

    // Update mission status to done
    setMissions((prev) =>
      prev.map((m) => (m.id === currentView ? { ...m, progress: 100, status: 'done' } : m))
    );

    // Complete matching daily quests
    setQuests((prev) =>
      prev.map((q) => {
        if (currentView === 'click' && q.id === 'q1') return { ...q, done: true };
        if (currentView === 'double-click' && q.id === 'q2') return { ...q, done: true };
        if (currentView === 'drag' && q.id === 'q3') return { ...q, done: true };
        return q;
      })
    );

    // Unlock corresponding badge
    let unlocked: Badge | null = null;
    setBadges((prev) =>
      prev.map((b) => {
        const shouldUnlock =
          (currentView === 'click' && b.id === 'first_click') ||
          (currentView === 'double-click' && b.id === 'treasure_hunter') ||
          (currentView === 'drag' && b.id === 'puzzle_master') ||
          (currentView === 'paint' && b.id === 'artist') ||
          (currentView === 'right-click' && b.id === 'navigator');

        if (shouldUnlock && !b.got) {
          unlocked = { ...b, got: true };
          return unlocked;
        }
        return b;
      })
    );

    setNewBadge(unlocked);
    setSuccessModalOpen(true);
  };

  const handleNextMission = () => {
    const ids: MissionId[] = ['click', 'double-click', 'drag', 'paint', 'right-click'];
    const currIdx = ids.indexOf(currentView as MissionId);
    const nextId = ids[(currIdx + 1) % ids.length];
    handleEnterMission(nextId);
  };

  const completedCount = missions.filter((m) => m.status === 'done').length;
  const avgProgress = Math.round(
    missions.reduce((acc, m) => acc + m.progress, 0) / missions.length
  );
  const completedMissionIds = missions.filter((m) => m.status === 'done').map((m) => m.id);

  return (
    <div className="game-bg min-h-screen px-4 pb-12 pt-4 select-none">
      {/* Top Header */}
      <Header
        currentView={currentView}
        onGoHome={() => {
          sound.playClick();
          setCurrentView('lobby');
        }}
        onOpenSoundSettings={() => setSoundModalOpen(true)}
        xp={xp}
        completedCount={completedCount}
        totalMissions={missions.length}
      />

      {/* Main Content Area */}
      <main className="mx-auto mt-6 max-w-7xl space-y-8">
        {currentView === 'lobby' ? (
          <>
            {/* 3D Island World Section */}
            <section>
              <IslandWorld3D
                zones={ISLAND_ZONES}
                onEnterMission={handleEnterMission}
                completedMissions={completedMissionIds}
              />
            </section>

            {/* Mission Cards Grid */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-2xl text-slate-800 flex items-center gap-2">
                  <span>학습 미션</span>
                  <span className="status-chip status-new text-xs">총 5개</span>
                </h2>
                <button
                  onClick={() => setSoundModalOpen(true)}
                  className="flex items-center gap-1.5 text-xs font-bold text-primary hover:underline cursor-pointer"
                >
                  <Volume2 className="size-4" /> 사운드 설정 열기
                </button>
              </div>

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
                {missions.map((m) => (
                  <MissionCard key={m.id} mission={m} onSelect={handleEnterMission} />
                ))}
              </div>
            </section>

            {/* Bottom 3 Summary Widgets */}
            <section className="grid gap-5 lg:grid-cols-3">
              {/* Widget 1: Progress */}
              <div className="card-3d p-6">
                <h3 className="mb-3 flex items-center gap-2 font-display text-lg text-slate-800">
                  <TrendingUp className="size-5 text-primary" /> 학습 진행률
                </h3>
                <p className="font-display text-5xl text-primary">{avgProgress}%</p>
                <div className="gauge mt-4">
                  <div className="gauge-fill" style={{ width: `${avgProgress}%` }} />
                </div>
                <p className="mt-2.5 text-xs font-bold text-muted-foreground">
                  미션 {completedCount} / {missions.length} 완료됨
                </p>
              </div>

              {/* Widget 2: Daily Quests */}
              <div className="card-3d p-6">
                <h3 className="mb-3 flex items-center gap-2 font-display text-lg text-slate-800">
                  <Target className="size-5 text-primary" /> 오늘의 미션
                </h3>
                <ul className="space-y-2.5">
                  {quests.map((q) => (
                    <li
                      key={q.id}
                      className="flex items-center gap-2.5 rounded-xl bg-slate-100/70 px-3.5 py-2.5 text-xs font-bold text-slate-700"
                    >
                      <CheckCircle2
                        className={`size-5 ${
                          q.done ? 'text-emerald-500 fill-emerald-100' : 'text-slate-300'
                        }`}
                      />
                      <span className={q.done ? 'text-slate-400 line-through' : ''}>
                        {q.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Widget 3: Badges */}
              <div className="card-3d p-6">
                <h3 className="mb-3 flex items-center gap-2 font-display text-lg text-slate-800">
                  <Award className="size-5 text-primary" /> 획득한 배지
                </h3>
                <div className="grid grid-cols-5 gap-2">
                  {badges.map((b) => {
                    const BIcon = BADGE_ICONS[b.iconName] || Award;
                    return (
                      <div
                        key={b.id}
                        className="flex flex-col items-center gap-1.5 text-center group cursor-pointer"
                        title={b.description}
                        onClick={() => {
                          if (b.got) sound.playStarCatch(2);
                        }}
                      >
                        <div
                          className={`icon-3d size-12 tone-${b.tone} ${
                            !b.got ? 'grayscale opacity-35' : 'group-hover:scale-110 transition-transform'
                          }`}
                        >
                          <BIcon className="size-6" />
                        </div>
                        <span className="text-[0.65rem] font-bold text-slate-600 truncate max-w-[60px]">
                          {b.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          </>
        ) : (
          /* ACTIVE MISSION VIEW */
          <div className="space-y-5">
            {/* Mission Top Header Bar */}
            <div className="hud-panel flex flex-wrap items-center justify-between gap-3 px-5 py-3.5">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    sound.playClick();
                    setCurrentView('lobby');
                  }}
                  className="btn-3d btn-3d-ghost text-xs px-3 py-1.5"
                >
                  <ArrowLeft className="size-4" />
                  <span>로비로</span>
                </button>

                <div className="flex items-center gap-2">
                  <div className={`icon-3d size-10 tone-${activeMission.tone}`}>
                    {activeMission.id === 'click' && <MousePointer className="size-5" />}
                    {activeMission.id === 'double-click' && <Sparkles className="size-5" />}
                    {activeMission.id === 'drag' && <Hand className="size-5" />}
                    {activeMission.id === 'paint' && <Palette className="size-5" />}
                    {activeMission.id === 'right-click' && <Compass className="size-5" />}
                  </div>
                  <div>
                    <h2 className="font-display text-xl text-slate-800">{activeMission.title}</h2>
                    <p className="text-xs font-bold text-muted-foreground">
                      목표: {activeMission.goal}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl">
                  <span>난이도:</span>
                  <span className="text-amber-500">{'★'.repeat(activeMission.difficulty)}</span>
                </div>
                <div className="font-display text-sm text-primary font-bold">
                  +{activeMission.xp} XP
                </div>
              </div>
            </div>

            {/* Mission Game Component */}
            <div key={`${currentView}-${gameKey}`}>
              {currentView === 'click' && (
                <ClickQuestGame
                  onProgress={handleMissionProgress}
                  onComplete={handleMissionComplete}
                />
              )}
              {currentView === 'double-click' && (
                <DoubleClickGame
                  onProgress={handleMissionProgress}
                  onComplete={handleMissionComplete}
                />
              )}
              {currentView === 'drag' && (
                <DragFeedGame
                  onProgress={handleMissionProgress}
                  onComplete={handleMissionComplete}
                />
              )}
              {currentView === 'paint' && (
                <PaintPlaygroundGame
                  onProgress={handleMissionProgress}
                  onComplete={handleMissionComplete}
                />
              )}
              {currentView === 'right-click' && (
                <RightClickMazeGame
                  onProgress={handleMissionProgress}
                  onComplete={handleMissionComplete}
                />
              )}
            </div>
          </div>
        )}
      </main>

      {/* Sound Settings & Test Pad Modal */}
      <SoundSettingsModal
        isOpen={soundModalOpen}
        onClose={() => setSoundModalOpen(false)}
      />

      {/* Mission Success Celebration Modal */}
      {successModalOpen && (
        <MissionSuccessModal
          mission={activeMission}
          newBadge={newBadge}
          onGoHome={() => {
            setSuccessModalOpen(false);
            setCurrentView('lobby');
          }}
          onNextMission={() => {
            setSuccessModalOpen(false);
            handleNextMission();
          }}
          onReplay={() => {
            setSuccessModalOpen(false);
            setGameKey((prev) => prev + 1);
          }}
        />
      )}
    </div>
  );
}
