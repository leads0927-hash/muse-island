import React, { useState } from 'react';
import { X, Volume2, Music, Mic, Play, Check } from 'lucide-react';
import { sound } from '../audio/soundManager';

interface SoundSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SoundSettingsModal: React.FC<SoundSettingsModalProps> = ({ isOpen, onClose }) => {
  const [bgmVol, setBgmVol] = useState(sound.bgmVolume);
  const [sfxVol, setSfxVol] = useState(sound.sfxVolume);
  const [bgmEnabled, setBgmEnabled] = useState(sound.bgmEnabled);
  const [sfxEnabled, setSfxEnabled] = useState(sound.sfxEnabled);
  const [voiceEnabled, setVoiceEnabled] = useState(sound.voiceEnabled);
  const [testActive, setTestActive] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleBgmVolChange = (val: number) => {
    setBgmVol(val);
    sound.setBgmVolume(val);
  };

  const handleSfxVolChange = (val: number) => {
    setSfxVol(val);
    sound.setSfxVolume(val);
  };

  const handleToggleBgm = () => {
    const next = !bgmEnabled;
    setBgmEnabled(next);
    sound.setBgmEnabled(next);
  };

  const handleToggleSfx = () => {
    const next = !sfxEnabled;
    setSfxEnabled(next);
    sound.setSfxEnabled(next);
  };

  const handleToggleVoice = () => {
    const next = !voiceEnabled;
    setVoiceEnabled(next);
    sound.setVoiceEnabled(next);
    if (next) {
      sound.speakGuidance('음성 안내가 켜졌습니다!');
    }
  };

  const runTest = (key: string, fn: () => void) => {
    setTestActive(key);
    fn();
    setTimeout(() => setTestActive(null), 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-pop">
      <div className="card-3d relative w-full max-w-lg overflow-hidden bg-white p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
              <Volume2 className="size-6" />
            </div>
            <div>
              <h2 className="font-display text-2xl text-slate-800">사운드 & 오디오 센터</h2>
              <p className="text-xs font-bold text-muted-foreground">
                신나는 배경음악과 생생한 효과음을 설정해보세요!
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="flex size-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Sliders & Toggles */}
        <div className="space-y-5 py-5">
          {/* BGM Control */}
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Music className="size-5 text-indigo-500" />
                <span className="font-display text-base text-slate-700">배경 음악 (BGM)</span>
              </div>
              <button
                onClick={handleToggleBgm}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                  bgmEnabled ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'
                }`}
              >
                {bgmEnabled ? '켜짐' : '꺼짐'}
              </button>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={bgmVol}
              disabled={!bgmEnabled}
              onChange={(e) => handleBgmVolChange(parseFloat(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer disabled:opacity-40"
            />
            <div className="flex justify-between text-[0.7rem] font-bold text-slate-400 mt-1">
              <span>조용히</span>
              <span>{Math.round(bgmVol * 100)}%</span>
              <span>신나게</span>
            </div>
          </div>

          {/* SFX Control */}
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Volume2 className="size-5 text-emerald-500" />
                <span className="font-display text-base text-slate-700">효과음 (SFX)</span>
              </div>
              <button
                onClick={handleToggleSfx}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                  sfxEnabled ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
                }`}
              >
                {sfxEnabled ? '켜짐' : '꺼짐'}
              </button>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={sfxVol}
              disabled={!sfxEnabled}
              onChange={(e) => handleSfxVolChange(parseFloat(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer disabled:opacity-40"
            />
            <div className="flex justify-between text-[0.7rem] font-bold text-slate-400 mt-1">
              <span>작게</span>
              <span>{Math.round(sfxVol * 100)}%</span>
              <span>크게</span>
            </div>
          </div>

          {/* Voice Guidance Toggle */}
          <div className="flex items-center justify-between rounded-2xl bg-amber-50/60 p-4 border border-amber-100">
            <div className="flex items-center gap-3">
              <Mic className="size-5 text-amber-500" />
              <div>
                <span className="font-display text-sm text-slate-800">탐험대 음성 안내 & 말소리</span>
                <p className="text-[0.75rem] text-slate-500">
                  마스코트의 귀여운 말소리와 한글 음성 안내 지원
                </p>
              </div>
            </div>
            <button
              onClick={handleToggleVoice}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors ${
                voiceEnabled ? 'bg-amber-500 text-white shadow-sm' : 'bg-slate-200 text-slate-500'
              }`}
            >
              {voiceEnabled ? '사용 중' : '끄기'}
            </button>
          </div>
        </div>

        {/* Sound Effects Preview / Test Pad */}
        <div>
          <h3 className="font-display text-sm text-slate-600 mb-2.5 flex items-center gap-1.5">
            <Play className="size-4 text-primary fill-primary" /> 사운드 효과음 미리듣기 (Test Pad)
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={() => runTest('star', () => sound.playStarCatch(3))}
              className={`btn-3d btn-3d-ghost !p-2 text-xs flex flex-col items-center gap-1 ${
                testActive === 'star' ? 'scale-95 bg-amber-50' : ''
              }`}
            >
              <span className="text-lg">⭐</span>
              <span>별빛 잡기</span>
            </button>

            <button
              onClick={() => runTest('mole', () => sound.playMoleWhack())}
              className={`btn-3d btn-3d-ghost !p-2 text-xs flex flex-col items-center gap-1 ${
                testActive === 'mole' ? 'scale-95 bg-amber-50' : ''
              }`}
            >
              <span className="text-lg">🔨</span>
              <span>두더지 뿅!</span>
            </button>

            <button
              onClick={() => runTest('chomp', () => sound.playChomp())}
              className={`btn-3d btn-3d-ghost !p-2 text-xs flex flex-col items-center gap-1 ${
                testActive === 'chomp' ? 'scale-95 bg-amber-50' : ''
              }`}
            >
              <span className="text-lg">🧀</span>
              <span>냠냠 먹기</span>
            </button>

            <button
              onClick={() => runTest('match', () => sound.playShapeMatch())}
              className={`btn-3d btn-3d-ghost !p-2 text-xs flex flex-col items-center gap-1 ${
                testActive === 'match' ? 'scale-95 bg-amber-50' : ''
              }`}
            >
              <span className="text-lg">🎨</span>
              <span>도형 하모니</span>
            </button>

            <button
              onClick={() => runTest('flag', () => sound.playFlagGet(2))}
              className={`btn-3d btn-3d-ghost !p-2 text-xs flex flex-col items-center gap-1 ${
                testActive === 'flag' ? 'scale-95 bg-amber-50' : ''
              }`}
            >
              <span className="text-lg">🚩</span>
              <span>깃발 나팔</span>
            </button>

            <button
              onClick={() => runTest('victory', () => sound.playVictory())}
              className={`btn-3d btn-3d-ghost !p-2 text-xs flex flex-col items-center gap-1 ${
                testActive === 'victory' ? 'scale-95 bg-amber-50' : ''
              }`}
            >
              <span className="text-lg">🏆</span>
              <span>승리 팡파르</span>
            </button>

            <button
              onClick={() => runTest('voice', () => sound.playAnimalese('뿅! 정말 잘했어요!'))}
              className={`btn-3d btn-3d-ghost !p-2 text-xs flex flex-col items-center gap-1 ${
                testActive === 'voice' ? 'scale-95 bg-amber-50' : ''
              }`}
            >
              <span className="text-lg">🐹</span>
              <span>찍찍이 말소리</span>
            </button>

            <button
              onClick={() => runTest('tts', () => sound.speakGuidance('멋진 마우스 탐험대원이에요!'))}
              className={`btn-3d btn-3d-ghost !p-2 text-xs flex flex-col items-center gap-1 ${
                testActive === 'tts' ? 'scale-95 bg-amber-50' : ''
              }`}
            >
              <span className="text-lg">🗣️</span>
              <span>음성 안내</span>
            </button>
          </div>
        </div>

        {/* Footer Close Button */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="btn-3d btn-3d-primary px-6 py-2 text-sm"
          >
            <Check className="size-4" /> 확인 완료
          </button>
        </div>
      </div>
    </div>
  );
};
