import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Palette,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Download,
  Trash2,
  PaintBucket,
  Brush,
  Eraser,
  Wand2,
} from 'lucide-react';
import { sound } from '../audio/soundManager';

interface PaintPlaygroundGameProps {
  onProgress: (ratio: number) => void;
  onComplete: () => void;
}

type ShapeKind = 'circle' | 'square' | 'triangle' | 'star';
const ALL_SHAPES: ShapeKind[] = ['circle', 'square', 'triangle', 'star'];

const SHAPE_COLORS: Record<ShapeKind, string> = {
  circle: '#38bdf8', // Sky
  square: '#34d399', // Mint
  triangle: '#fb923c', // Peach
  star: '#facc15', // Sun
};

const SHAPE_NAMES: Record<ShapeKind, string> = {
  circle: '동그라미',
  square: '네모',
  triangle: '세모',
  star: '별',
};

// 16 Vivid kid-friendly colors
const PALETTE_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#84cc16', '#10b981', '#06b6d4', '#3b82f6',
  '#6366f1', '#a855f7', '#ec4899', '#f43f5e',
  '#854d0e', '#fed7aa', '#334155', '#ffffff',
];

interface TemplateItem {
  id: string;
  name: string;
  icon: string;
  draw: (ctx: CanvasRenderingContext2D, width: number, height: number) => void;
}

export const PaintPlaygroundGame: React.FC<PaintPlaygroundGameProps> = ({
  onProgress,
  onComplete,
}) => {
  const [mode, setMode] = useState<'connect' | 'free'>('free'); // default to free drawing / coloring

  // --- MODE 1: SHAPE CONNECT STATE ---
  const connectContainerRef = useRef<HTMLDivElement>(null);
  const [leftShapes, setLeftShapes] = useState<ShapeKind[]>([]);
  const [rightShapes, setRightShapes] = useState<ShapeKind[]>([]);
  const [matchedShapes, setMatchedShapes] = useState<ShapeKind[]>([]);
  const [dragLine, setDragLine] = useState<{ kind: ShapeKind; x1: number; y1: number; x2: number; y2: number } | null>(null);
  const [connectMessage, setConnectMessage] = useState<string>('왼쪽 도형을 마우스로 눌러 오른쪽 같은 도형으로 이어보세요!');

  // --- MODE 2: FREE DRAWING & COLORING STATE ---
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('mouse');
  const [activeTool, setActiveTool] = useState<'brush' | 'bucket' | 'rainbow' | 'eraser' | 'stamp'>('bucket');
  const [currentColor, setCurrentColor] = useState<string>('#3b82f6');
  const [brushSize, setBrushSize] = useState<number>(10);
  const [selectedStamp, setSelectedStamp] = useState<string>('⭐');
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const rainbowHueRef = useRef<number>(0);

  // Template Outlines definition
  const TEMPLATES: TemplateItem[] = [
    {
      id: 'mouse',
      name: '탐험대 생쥐',
      icon: '🐭',
      draw: (ctx, w, h) => {
        ctx.strokeStyle = '#2d3748';
        ctx.lineWidth = 5;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        const cx = w / 2;
        const cy = h / 2 - 10;

        // Ears
        ctx.beginPath();
        ctx.arc(cx - 100, cy - 80, 50, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx - 100, cy - 80, 30, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(cx + 100, cy - 80, 50, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx + 100, cy - 80, 30, 0, Math.PI * 2);
        ctx.stroke();

        // Head
        ctx.beginPath();
        ctx.ellipse(cx, cy, 110, 100, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Inner Face / Muzzle
        ctx.beginPath();
        ctx.ellipse(cx, cy + 25, 75, 60, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Eyes
        ctx.beginPath();
        ctx.ellipse(cx - 40, cy - 20, 14, 18, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(cx + 40, cy - 20, 14, 18, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Nose
        ctx.beginPath();
        ctx.ellipse(cx, cy + 10, 18, 12, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Mouth & Smile
        ctx.beginPath();
        ctx.arc(cx, cy + 30, 24, 0.2 * Math.PI, 0.8 * Math.PI);
        ctx.stroke();

        // Cheeks
        ctx.beginPath();
        ctx.arc(cx - 65, cy + 25, 16, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx + 65, cy + 25, 16, 0, Math.PI * 2);
        ctx.stroke();
      },
    },
    {
      id: 'star',
      name: '빛나는 별',
      icon: '⭐',
      draw: (ctx, w, h) => {
        ctx.strokeStyle = '#2d3748';
        ctx.lineWidth = 5;
        ctx.lineJoin = 'round';
        const cx = w / 2;
        const cy = h / 2;
        const spikes = 5;
        const outerR = 135;
        const innerR = 65;

        ctx.beginPath();
        let rot = (Math.PI / 2) * 3;
        let x = cx;
        let y = cy;
        const step = Math.PI / spikes;

        ctx.moveTo(cx, cy - outerR);
        for (let i = 0; i < spikes; i++) {
          x = cx + Math.cos(rot) * outerR;
          y = cy + Math.sin(rot) * outerR;
          ctx.lineTo(x, y);
          rot += step;

          x = cx + Math.cos(rot) * innerR;
          y = cy + Math.sin(rot) * innerR;
          ctx.lineTo(x, y);
          rot += step;
        }
        ctx.lineTo(cx, cy - outerR);
        ctx.closePath();
        ctx.stroke();

        // Face in star
        ctx.beginPath();
        ctx.ellipse(cx - 35, cy - 10, 10, 14, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(cx + 35, cy - 10, 10, 14, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx, cy + 15, 20, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.stroke();
      },
    },
    {
      id: 'house',
      name: '동화 속 집',
      icon: '🏡',
      draw: (ctx, w, h) => {
        ctx.strokeStyle = '#2d3748';
        ctx.lineWidth = 5;
        ctx.lineJoin = 'round';
        const cx = w / 2;
        const cy = h / 2 + 10;

        // Chimney
        ctx.strokeRect(cx + 50, cy - 130, 30, 50);

        // Triangular Roof
        ctx.beginPath();
        ctx.moveTo(cx - 150, cy - 40);
        ctx.lineTo(cx, cy - 140);
        ctx.lineTo(cx + 150, cy - 40);
        ctx.closePath();
        ctx.stroke();

        // House Body
        ctx.strokeRect(cx - 120, cy - 40, 240, 150);

        // Door
        ctx.strokeRect(cx - 35, cy + 30, 70, 80);
        ctx.beginPath();
        ctx.arc(cx + 20, cy + 70, 5, 0, Math.PI * 2);
        ctx.stroke();

        // Windows
        ctx.strokeRect(cx - 100, cy - 15, 45, 45);
        ctx.strokeRect(cx + 55, cy - 15, 45, 45);
      },
    },
    {
      id: 'apple',
      name: '달콤한 사과',
      icon: '🍎',
      draw: (ctx, w, h) => {
        ctx.strokeStyle = '#2d3748';
        ctx.lineWidth = 5;
        ctx.lineJoin = 'round';
        const cx = w / 2;
        const cy = h / 2 + 15;

        // Apple body
        ctx.beginPath();
        ctx.moveTo(cx, cy - 80);
        ctx.bezierCurveTo(cx - 130, cy - 120, cx - 140, cy + 80, cx, cy + 110);
        ctx.bezierCurveTo(cx + 140, cy + 80, cx + 130, cy - 120, cx, cy - 80);
        ctx.stroke();

        // Stem
        ctx.beginPath();
        ctx.moveTo(cx, cy - 80);
        ctx.quadraticCurveTo(cx - 10, cy - 120, cx - 15, cy - 135);
        ctx.lineWidth = 8;
        ctx.stroke();

        // Leaf
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(cx, cy - 90);
        ctx.quadraticCurveTo(cx + 50, cy - 130, cx + 65, cy - 105);
        ctx.quadraticCurveTo(cx + 40, cy - 80, cx, cy - 90);
        ctx.stroke();
      },
    },
    {
      id: 'car',
      name: '붕붕 자동차',
      icon: '🚗',
      draw: (ctx, w, h) => {
        ctx.strokeStyle = '#2d3748';
        ctx.lineWidth = 5;
        ctx.lineJoin = 'round';
        const cx = w / 2;
        const cy = h / 2 + 10;

        // Car Body
        ctx.beginPath();
        ctx.moveTo(cx - 160, cy + 40);
        ctx.lineTo(cx - 160, cy + 10);
        ctx.quadraticCurveTo(cx - 150, cy - 15, cx - 100, cy - 15);
        ctx.lineTo(cx - 60, cy - 60);
        ctx.lineTo(cx + 50, cy - 60);
        ctx.lineTo(cx + 100, cy - 15);
        ctx.lineTo(cx + 150, cy - 15);
        ctx.quadraticCurveTo(cx + 160, cy + 10, cx + 160, cy + 40);
        ctx.closePath();
        ctx.stroke();

        // Windows
        ctx.strokeRect(cx - 50, cy - 50, 40, 32);
        ctx.strokeRect(cx + 2, cy - 50, 45, 32);

        // Wheels
        ctx.beginPath();
        ctx.arc(cx - 90, cy + 45, 32, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx - 90, cy + 45, 14, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(cx + 90, cy + 45, 32, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx + 90, cy + 45, 14, 0, Math.PI * 2);
        ctx.stroke();
      },
    },
    {
      id: 'blank',
      name: '자유 도화지',
      icon: '🎨',
      draw: () => {
        // Just clear white
      },
    },
  ];

  // Load a chosen template onto canvas
  const loadTemplate = useCallback((templateId: string) => {
    setSelectedTemplate(templateId);
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas to white
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw chosen template outline
    const target = TEMPLATES.find((t) => t.id === templateId) || TEMPLATES[0];
    target.draw(ctx, canvas.width, canvas.height);
  }, []);

  useEffect(() => {
    if (mode === 'free') {
      loadTemplate(selectedTemplate);
      sound.speakGuidance('도안을 선택하고 페인트 통이나 붓으로 예쁘게 색칠해보세요!');
    }
  }, [mode, selectedTemplate, loadTemplate]);

  // Fast Flood-Fill algorithm for Paint Bucket
  const floodFill = (startX: number, startY: number, fillHex: string) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    const width = canvas.width;
    const height = canvas.height;

    // Convert hex to RGB
    const fillR = parseInt(fillHex.slice(1, 3), 16);
    const fillG = parseInt(fillHex.slice(3, 5), 16);
    const fillB = parseInt(fillHex.slice(5, 7), 16);

    const startIndex = (startY * width + startX) * 4;
    const targetR = data[startIndex];
    const targetG = data[startIndex + 1];
    const targetB = data[startIndex + 2];
    const targetA = data[startIndex + 3];

    // If clicking on dark outline or same color, exit
    if (targetR < 60 && targetG < 60 && targetB < 60) return; // Do not fill black outlines
    if (Math.abs(targetR - fillR) < 10 && Math.abs(targetG - fillG) < 10 && Math.abs(targetB - fillB) < 10) return;

    sound.playPaintFill();

    const colorMatch = (idx: number) => {
      const dr = Math.abs(data[idx] - targetR);
      const dg = Math.abs(data[idx + 1] - targetG);
      const db = Math.abs(data[idx + 2] - targetB);
      const da = Math.abs(data[idx + 3] - targetA);
      return dr + dg + db + da < 45;
    };

    const pixelStack: [number, number][] = [[startX, startY]];
    const seen = new Uint8Array(width * height);

    while (pixelStack.length > 0) {
      const [curX, curY] = pixelStack.pop()!;
      let y1 = curY;
      let idx = (y1 * width + curX) * 4;

      while (y1 >= 0 && colorMatch(idx) && seen[y1 * width + curX] === 0) {
        y1--;
        idx -= width * 4;
      }

      y1++;
      idx += width * 4;

      let spanLeft = false;
      let spanRight = false;

      while (y1 < height && colorMatch(idx) && seen[y1 * width + curX] === 0) {
        seen[y1 * width + curX] = 1;
        data[idx] = fillR;
        data[idx + 1] = fillG;
        data[idx + 2] = fillB;
        data[idx + 3] = 255;

        if (curX > 0) {
          const leftIdx = idx - 4;
          if (colorMatch(leftIdx) && seen[y1 * width + curX - 1] === 0) {
            if (!spanLeft) {
              pixelStack.push([curX - 1, y1]);
              spanLeft = true;
            }
          } else if (spanLeft) {
            spanLeft = false;
          }
        }

        if (curX < width - 1) {
          const rightIdx = idx + 4;
          if (colorMatch(rightIdx) && seen[y1 * width + curX + 1] === 0) {
            if (!spanRight) {
              pixelStack.push([curX + 1, y1]);
              spanRight = true;
            }
          } else if (spanRight) {
            spanRight = false;
          }
        }

        y1++;
        idx += width * 4;
      }
    }

    ctx.putImageData(imgData, 0, 0);

    // Re-draw template outline on top to keep outline crisp
    const target = TEMPLATES.find((t) => t.id === selectedTemplate);
    if (target && target.id !== 'blank') {
      target.draw(ctx, canvas.width, canvas.height);
    }

    // Award mission progress on coloring
    onProgress(0.8);
  };

  // Canvas Drawing Pointer Handlers
  const handleCanvasPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.round((e.clientX - rect.left) * scaleX);
    const y = Math.round((e.clientY - rect.top) * scaleY);

    if (activeTool === 'bucket') {
      floodFill(x, y, currentColor);
      return;
    }

    if (activeTool === 'stamp') {
      sound.playStarCatch(2);
      ctx.font = `${brushSize * 3.5}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(selectedStamp, x, y);
      onProgress(0.9);
      return;
    }

    setIsDrawing(true);
    sound.playBrushStroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (activeTool === 'eraser') {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = brushSize * 2;
    } else if (activeTool === 'rainbow') {
      rainbowHueRef.current = (rainbowHueRef.current + 25) % 360;
      ctx.strokeStyle = `hsl(${rainbowHueRef.current}, 90%, 55%)`;
      ctx.lineWidth = brushSize;
    } else {
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = brushSize;
    }
  };

  const handleCanvasPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || activeTool === 'bucket' || activeTool === 'stamp' || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.round((e.clientX - rect.left) * scaleX);
    const y = Math.round((e.clientY - rect.top) * scaleY);

    if (activeTool === 'rainbow') {
      rainbowHueRef.current = (rainbowHueRef.current + 4) % 360;
      ctx.strokeStyle = `hsl(${rainbowHueRef.current}, 90%, 55%)`;
    }

    ctx.lineTo(x, y);
    ctx.stroke();

    if (Math.random() < 0.12) {
      sound.playBrushStroke();
    }
  };

  const handleCanvasPointerUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    onProgress(1.0);
  };

  // Download artwork
  const handleDownloadArtwork = () => {
    if (!canvasRef.current) return;
    sound.playClick();
    const link = document.createElement('a');
    link.download = `내그림_${selectedTemplate}.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
    sound.speakGuidance('멋진 그림이 저장되었습니다!');
  };

  // --- MODE 1: SHAPE CONNECT LOGIC ---
  const initConnectGame = () => {
    const l = [...ALL_SHAPES].sort(() => Math.random() - 0.5);
    const r = [...ALL_SHAPES].sort(() => Math.random() - 0.5);
    setLeftShapes(l);
    setRightShapes(r);
    setMatchedShapes([]);
    setDragLine(null);
    setConnectMessage('왼쪽 도형을 마우스로 눌러 오른쪽 같은 도형으로 이어보세요!');
    onProgress(0);
  };

  useEffect(() => {
    initConnectGame();
  }, []);

  const getRelativePoint = (e: React.PointerEvent) => {
    if (!connectContainerRef.current) return { x: 0, y: 0 };
    const rect = connectContainerRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const getShapeCenter = (side: 'left' | 'right', index: number) => {
    if (!connectContainerRef.current) return { x: 0, y: 0 };
    const rect = connectContainerRef.current.getBoundingClientRect();
    const x = side === 'left' ? rect.width * 0.16 : rect.width * 0.84;
    const y = (rect.height / 4) * (index + 0.5);
    return { x, y };
  };

  const handleShapePointerDown = (kind: ShapeKind, index: number, e: React.PointerEvent) => {
    if (matchedShapes.includes(kind)) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    sound.playShapeStart();
    const startPt = getShapeCenter('left', index);
    const currPt = getRelativePoint(e);
    setDragLine({
      kind,
      x1: startPt.x,
      y1: startPt.y,
      x2: currPt.x,
      y2: currPt.y,
    });
    setConnectMessage(`반짝이는 ${SHAPE_NAMES[kind]}을(를) 오른쪽에 있는 같은 도형으로 이어보세요!`);
  };

  const handleConnectPointerMove = (e: React.PointerEvent) => {
    if (!dragLine) return;
    const pt = getRelativePoint(e);
    setDragLine({ ...dragLine, x2: pt.x, y2: pt.y });
  };

  const handleConnectPointerUp = (e: React.PointerEvent) => {
    if (!dragLine) return;
    const pt = getRelativePoint(e);

    const targetIdx = rightShapes.findIndex((_, idx) => {
      const center = getShapeCenter('right', idx);
      return Math.hypot(center.x - pt.x, center.y - pt.y) < 55;
    });

    if (targetIdx >= 0) {
      const targetKind = rightShapes[targetIdx];
      if (targetKind === dragLine.kind) {
        const nextMatched = [...matchedShapes, dragLine.kind];
        setMatchedShapes(nextMatched);
        sound.playShapeMatch();
        setConnectMessage(`딩동댕! ${SHAPE_NAMES[dragLine.kind]} 연결 성공! 🎉`);

        const ratio = nextMatched.length / ALL_SHAPES.length;
        onProgress(ratio);

        if (nextMatched.length === ALL_SHAPES.length) {
          setConnectMessage('축하합니다! 모든 도형을 완벽하게 연결했어요! 🏆');
          sound.speakGuidance('멋져요! 모든 도형을 바르게 연결했습니다!');
          setTimeout(() => {
            onComplete();
          }, 700);
        }
      } else {
        sound.playWrong();
        setConnectMessage('앗, 서로 다른 모양이에요! 다시 도전해볼까요?');
      }
    }

    setDragLine(null);
  };

  const renderShapeIcon = (kind: ShapeKind) => {
    const col = SHAPE_COLORS[kind];
    switch (kind) {
      case 'circle':
        return (
          <svg viewBox="0 0 40 40" className="size-10">
            <circle cx="20" cy="20" r="15" fill={col} stroke="#ffffff" strokeWidth="2.5" />
          </svg>
        );
      case 'square':
        return (
          <svg viewBox="0 0 40 40" className="size-10">
            <rect x="7" y="7" width="26" height="26" rx="4" fill={col} stroke="#ffffff" strokeWidth="2.5" />
          </svg>
        );
      case 'triangle':
        return (
          <svg viewBox="0 0 40 40" className="size-10">
            <polygon points="20,6 34,34 6,34" fill={col} stroke="#ffffff" strokeWidth="2.5" />
          </svg>
        );
      case 'star':
        return (
          <svg viewBox="0 0 40 40" className="size-10">
            <polygon
              points="20,5 24,15 35,16 27,24 29,35 20,29 11,35 13,24 5,16 16,15"
              fill={col}
              stroke="#ffffff"
              strokeWidth="2.5"
            />
          </svg>
        );
    }
  };

  return (
    <div className="relative flex h-[580px] w-full flex-col overflow-hidden rounded-3xl border-4 border-white bg-slate-50 p-4 sm:p-5 shadow-2xl select-none">
      {/* Top Header Mode Switcher & Tools */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200 z-10">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sound.playClick();
              setMode('free');
            }}
            className={`btn-3d text-xs px-3.5 py-2 ${
              mode === 'free' ? 'btn-3d-primary' : 'btn-3d-ghost'
            }`}
          >
            <Palette className="size-4" />
            <span>모양 색칠 & 자유 그리기</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setMode('connect');
            }}
            className={`btn-3d text-xs px-3.5 py-2 ${
              mode === 'connect' ? 'btn-3d-primary' : 'btn-3d-ghost'
            }`}
          >
            <CheckCircle2 className="size-4" />
            <span>도형 선 연결 놀이</span>
          </button>
        </div>

        {mode === 'free' ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => loadTemplate(selectedTemplate)}
              className="btn-3d btn-3d-ghost text-xs px-3 py-1.5"
              title="도안 다시 그리기"
            >
              <RotateCcw className="size-3.5" />
              <span>도안 초기화</span>
            </button>
            <button
              onClick={handleDownloadArtwork}
              className="btn-3d btn-3d-ghost text-xs px-3 py-1.5 text-indigo-600"
              title="내 그림 다운로드"
            >
              <Download className="size-3.5" />
              <span>그림 저장</span>
            </button>
          </div>
        ) : (
          <button
            onClick={initConnectGame}
            className="btn-3d btn-3d-ghost text-xs px-3 py-1.5"
            title="다시 섞기"
          >
            <RotateCcw className="size-4" />
            <span>도형 섞기</span>
          </button>
        )}
      </div>

      {/* MODE: FREE DRAWING & COLORING PLAYGROUND */}
      {mode === 'free' ? (
        <div className="relative flex-1 flex flex-col gap-2 my-2 overflow-hidden">
          {/* 1. Template Outlines Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 pt-0.5 z-10">
            <span className="text-xs font-bold text-slate-500 whitespace-nowrap mr-1">
              🎨 모양 선택:
            </span>
            {TEMPLATES.map((tmpl) => (
              <button
                key={tmpl.id}
                onClick={() => {
                  sound.playStarCatch(2);
                  loadTemplate(tmpl.id);
                }}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all whitespace-nowrap ${
                  selectedTemplate === tmpl.id
                    ? 'bg-indigo-600 text-white shadow-md scale-105'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span>{tmpl.icon}</span>
                <span>{tmpl.name}</span>
              </button>
            ))}
          </div>

          {/* 2. Drawing Canvas with Outlines */}
          <div className="relative flex-1 rounded-2xl bg-white border-2 border-slate-200 overflow-hidden shadow-inner">
            <canvas
              ref={canvasRef}
              width={800}
              height={360}
              onPointerDown={handleCanvasPointerDown}
              onPointerMove={handleCanvasPointerMove}
              onPointerUp={handleCanvasPointerUp}
              onPointerLeave={handleCanvasPointerUp}
              className={`size-full touch-none ${
                activeTool === 'bucket'
                  ? 'cursor-pointer'
                  : activeTool === 'eraser'
                  ? 'cursor-cell'
                  : 'cursor-crosshair'
              }`}
            />
          </div>

          {/* 3. Drawing Toolbar (Tools, Colors, Stamps) */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-2xl bg-slate-100 border border-slate-200">
            {/* Tool Selection */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  sound.playClick();
                  setActiveTool('bucket');
                }}
                className={`flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-bold transition-all ${
                  activeTool === 'bucket'
                    ? 'bg-primary text-white shadow'
                    : 'bg-white text-slate-700 hover:bg-slate-200'
                }`}
                title="페인트 통 (영역 자동 채우기)"
              >
                <PaintBucket className="size-4" />
                <span className="hidden sm:inline">페인트통</span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  setActiveTool('brush');
                }}
                className={`flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-bold transition-all ${
                  activeTool === 'brush'
                    ? 'bg-primary text-white shadow'
                    : 'bg-white text-slate-700 hover:bg-slate-200'
                }`}
                title="색칠 붓"
              >
                <Brush className="size-4" />
                <span className="hidden sm:inline">붓</span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  setActiveTool('rainbow');
                }}
                className={`flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-bold transition-all ${
                  activeTool === 'rainbow'
                    ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white shadow'
                    : 'bg-white text-slate-700 hover:bg-slate-200'
                }`}
                title="무지개 펜"
              >
                <Wand2 className="size-4" />
                <span className="hidden sm:inline">무지개</span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  setActiveTool('eraser');
                }}
                className={`flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-bold transition-all ${
                  activeTool === 'eraser'
                    ? 'bg-slate-700 text-white shadow'
                    : 'bg-white text-slate-700 hover:bg-slate-200'
                }`}
                title="지우개"
              >
                <Eraser className="size-4" />
                <span className="hidden sm:inline">지우개</span>
              </button>
            </div>

            {/* Colors Palette */}
            <div className="flex items-center gap-1 overflow-x-auto py-1">
              {PALETTE_COLORS.map((col) => (
                <button
                  key={col}
                  onClick={() => {
                    sound.playClick();
                    setCurrentColor(col);
                    if (activeTool === 'eraser') setActiveTool('brush');
                  }}
                  className={`size-6 rounded-full border-2 transition-transform shrink-0 ${
                    currentColor === col && activeTool !== 'eraser' && activeTool !== 'rainbow'
                      ? 'scale-125 border-indigo-600 shadow-md ring-2 ring-indigo-300'
                      : 'border-white hover:scale-110'
                  }`}
                  style={{ backgroundColor: col }}
                />
              ))}

              {/* Custom Color Input */}
              <input
                type="color"
                value={currentColor}
                onChange={(e) => {
                  setCurrentColor(e.target.value);
                  if (activeTool === 'eraser') setActiveTool('brush');
                }}
                className="size-6 cursor-pointer rounded-full border-none p-0 overflow-hidden shrink-0"
                title="더 많은 색깔 고르기"
              />
            </div>

            {/* Brush Sizes */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-400">두께:</span>
              {[6, 12, 20, 32].map((sz) => (
                <button
                  key={sz}
                  onClick={() => {
                    sound.playClick();
                    setBrushSize(sz);
                  }}
                  className={`flex size-7 items-center justify-center rounded-lg border ${
                    brushSize === sz ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700'
                  }`}
                  title={`${sz}px`}
                >
                  <span
                    className="rounded-full bg-current"
                    style={{ width: sz / 2.5, height: sz / 2.5 }}
                  />
                </button>
              ))}
            </div>

            {/* Stamps */}
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-slate-400">도장:</span>
              {['⭐', '🧀', '🐾', '💖', '✨', '🍓', '🎈'].map((stamp) => (
                <button
                  key={stamp}
                  onClick={() => {
                    sound.playClick();
                    setActiveTool('stamp');
                    setSelectedStamp(stamp);
                  }}
                  className={`flex size-7 items-center justify-center rounded-lg text-sm transition-transform ${
                    activeTool === 'stamp' && selectedStamp === stamp
                      ? 'scale-125 bg-amber-200 shadow-md'
                      : 'hover:scale-110 bg-white border border-slate-200'
                  }`}
                >
                  {stamp}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* MODE 1: SHAPE CONNECTING PLAYGROUND */
        <div
          ref={connectContainerRef}
          onPointerMove={handleConnectPointerMove}
          onPointerUp={handleConnectPointerUp}
          className="relative flex-1 touch-none overflow-hidden rounded-2xl bg-gradient-to-r from-blue-50/50 via-white to-amber-50/50 my-2"
        >
          {/* SVG Connecting Lines Layer */}
          <svg className="pointer-events-none absolute inset-0 size-full">
            {matchedShapes.map((kind) => {
              const lIdx = leftShapes.indexOf(kind);
              const rIdx = rightShapes.indexOf(kind);
              const p1 = getShapeCenter('left', lIdx);
              const p2 = getShapeCenter('right', rIdx);
              return (
                <line
                  key={kind}
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke={SHAPE_COLORS[kind]}
                  strokeWidth="8"
                  strokeLinecap="round"
                />
              );
            })}

            {dragLine && (
              <line
                x1={dragLine.x1}
                y1={dragLine.y1}
                x2={dragLine.x2}
                y2={dragLine.y2}
                stroke={SHAPE_COLORS[dragLine.kind]}
                strokeWidth="8"
                strokeDasharray="6 8"
                strokeLinecap="round"
              />
            )}
          </svg>

          {/* Left Shapes Column */}
          {leftShapes.map((kind, idx) => {
            const isMatched = matchedShapes.includes(kind);
            return (
              <button
                key={`left-${kind}`}
                onPointerDown={(e) => handleShapePointerDown(kind, idx, e)}
                disabled={isMatched}
                className={`shape-dot absolute left-[16%] -translate-x-1/2 -translate-y-1/2 cursor-grab transition-transform active:cursor-grabbing ${
                  isMatched ? 'opacity-40 cursor-default scale-90' : 'hover:scale-110'
                }`}
                style={{ top: `${(idx + 0.5) * 25}%` }}
                aria-label={`왼쪽 ${SHAPE_NAMES[kind]}`}
              >
                {renderShapeIcon(kind)}
              </button>
            );
          })}

          {/* Right Shapes Column */}
          {rightShapes.map((kind, idx) => {
            const isMatched = matchedShapes.includes(kind);
            return (
              <div
                key={`right-${kind}`}
                className={`shape-dot absolute left-[84%] -translate-x-1/2 -translate-y-1/2 transition-transform ${
                  isMatched ? 'opacity-40 scale-90' : 'hover:scale-110'
                }`}
                style={{ top: `${(idx + 0.5) * 25}%` }}
                aria-label={`오른쪽 ${SHAPE_NAMES[kind]}`}
              >
                {renderShapeIcon(kind)}
              </div>
            );
          })}

          <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center opacity-30">
            <span className="text-5xl font-display text-slate-400">⇄</span>
          </div>
        </div>
      )}

      {/* Bottom Guidance Message */}
      <div className="hud-panel z-10 flex items-center justify-between px-5 py-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🎨</span>
          <p className="font-display text-base text-slate-800">
            {mode === 'free'
              ? '원하는 도안을 선택하고 페인트통으로 쏙 채우거나 붓으로 자유롭게 그려보세요!'
              : connectMessage}
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
          <Sparkles className="size-4 text-primary" />
          <span>팁: 페인트통 도구는 닫힌 모양을 한 번에 예쁜 색으로 채워줘요!</span>
        </div>
      </div>
    </div>
  );
};
