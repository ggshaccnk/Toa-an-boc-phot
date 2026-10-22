'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { partyAudio } from '@/lib/partyAudio';
import { WashiTape, RubberStamp } from '@/components/common/HandDoodles';

interface DoodleCanvasProps {
  promptScenario: string;
  onSaveSketch: (dataUrl: string) => void;
  disabled?: boolean;
}

const INK_COLORS = [
  { id: 'black', label: 'Mực Đen', color: '#0f172a' },
  { id: 'crimson', label: 'Đỏ Chu Sa', color: '#e11d48' },
  { id: 'blue', label: 'Xanh Chàm', color: '#2563eb' },
  { id: 'amber', label: 'Vàng Nghệ', color: '#d97706' },
  { id: 'emerald', label: 'Xanh Rừng', color: '#059669' },
  { id: 'purple', label: 'Tím Khoai', color: '#7c3aed' },
];

const BRUSH_SIZES = [
  { id: 'thin', label: 'Nét Mảnh', size: 3, dotSize: 'w-2 h-2' },
  { id: 'medium', label: 'Nét Vừa', size: 7, dotSize: 'w-3.5 h-3.5' },
  { id: 'thick', label: 'Nét Bự', size: 15, dotSize: 'w-5 h-5' },
];

export const DoodleCanvas: React.FC<DoodleCanvasProps> = ({
  promptScenario,
  onSaveSketch,
  disabled = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [currentColor, setCurrentColor] = useState<string>('#0f172a');
  const [currentSize, setCurrentSize] = useState<number>(7);
  const [isEraser, setIsEraser] = useState<boolean>(false);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [hasDrawn, setHasDrawn] = useState<boolean>(false);
  const [history, setHistory] = useState<ImageData[]>([]);
  const isPointerDownRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  // Setup canvas size on mount / resize with high-DPI
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const size = Math.min(rect.width, 420);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
      // Fill cream paper background
      ctx.fillStyle = '#fdfbf7';
      ctx.fillRect(0, 0, size, size);

      // Save initial blank state to history
      const initialData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setHistory([initialData]);
    }
  }, []);

  useEffect(() => {
    initCanvas();
  }, [initCanvas]);

  // Helper to save current canvas state to history stack
  const pushToHistory = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => {
      const updated = [...prev, imgData];
      if (updated.length > 20) updated.shift();
      return updated;
    });
  }, []);

  // Pointer event coordinates relative to canvas
  const getCanvasCoords = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (disabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.setPointerCapture(e.pointerId);
    isPointerDownRef.current = true;
    setIsDrawing(true);
    setHasDrawn(true);

    const coords = getCanvasCoords(e);
    lastPointRef.current = coords;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = currentSize;
      ctx.strokeStyle = isEraser ? '#fdfbf7' : currentColor;

      // Draw a small dot immediately in case of single tap
      ctx.beginPath();
      ctx.arc(coords.x, coords.y, currentSize / 2, 0, Math.PI * 2);
      ctx.fillStyle = isEraser ? '#fdfbf7' : currentColor;
      ctx.fill();
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isPointerDownRef.current || disabled) return;
    const canvas = canvasRef.current;
    if (!canvas || !lastPointRef.current) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCanvasCoords(e);

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = currentSize;
    ctx.strokeStyle = isEraser ? '#fdfbf7' : currentColor;

    ctx.beginPath();
    ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();

    lastPointRef.current = coords;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isPointerDownRef.current) return;
    const canvas = canvasRef.current;
    if (canvas) {
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch {
        // Ignored
      }
    }
    isPointerDownRef.current = false;
    setIsDrawing(false);
    lastPointRef.current = null;
    pushToHistory();
  };

  // Undo last stroke
  const handleUndo = () => {
    if (disabled || history.length <= 1) return;
    partyAudio.playCardHover();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const newHistory = [...history];
    newHistory.pop(); // Remove current
    const previousState = newHistory[newHistory.length - 1];

    if (previousState) {
      ctx.putImageData(previousState, 0, 0);
      setHistory(newHistory);
      if (newHistory.length <= 1) {
        setHasDrawn(false);
      }
    }
  };

  // Clear all canvas content
  const handleClear = () => {
    if (disabled) return;
    partyAudio.playGavelStrike();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = '#fdfbf7';
    ctx.fillRect(0, 0, rect.width, rect.height);
    setHasDrawn(false);
    pushToHistory();
  };

  // Export and send drawing
  const handleConfirmSubmit = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    partyAudio.playGavelStrike();
    // Export as high-quality lightweight dataURL
    const dataUrl = canvas.toDataURL('image/png', 0.85);
    onSaveSketch(dataUrl);
  };

  return (
    <div className="w-full flex flex-col items-center space-y-4">
      {/* Target Prompt reminder */}
      <div className="w-full max-w-lg p-3 bg-amber-100 border-2 border-slate-900 rounded-2xl shadow-pop-sm flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 overflow-hidden">
          <RubberStamp text="BẰNG CHỨNG" color="red" />
          <div className="truncate">
            <span className="text-[11px] font-black uppercase text-slate-800 block">
              VẼ PHÁC HỌA: Lúc đó bạn đang làm gì để chối tội?
            </span>
            <span className="text-xs font-bold text-slate-900 truncate block">
              &ldquo;{promptScenario}&rdquo;
            </span>
          </div>
        </div>
        <WashiTape text="BÍ MẬT" color="bg-rose-400 text-white" />
      </div>

      {/* Main Canvas Frame */}
      <div
        ref={containerRef}
        className="relative bg-[#fdfbf7] p-2 border-[3px] border-slate-900 rounded-3xl shadow-pop-lg flex items-center justify-center select-none touch-none overflow-hidden"
      >
        {/* Subtle grid pattern overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: 'radial-gradient(#0f172a 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
        />

        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className={`rounded-2xl cursor-crosshair touch-none transition-shadow ${
            isDrawing ? 'ring-2 ring-yellow-400' : ''
          }`}
          style={{ touchAction: 'none' }}
        />

        {/* Floating indicator when canvas is blank */}
        {!hasDrawn && (
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-4 text-center">
            <span className="text-2xl mb-1 animate-bounce">✏️</span>
            <p className="text-xs md:text-sm font-black text-slate-400 uppercase tracking-wide">
              VẼ BẰNG CHỨNG NGOẠI PHẠM VÀO ĐÂY
            </p>
            <span className="text-[11px] text-slate-400 font-bold">
              (Dùng ngón tay hoặc chuột để phác họa)
            </span>
          </div>
        )}
      </div>

      {/* Drawing Toolbar */}
      <div className="w-full max-w-lg bg-white border-2 border-slate-900 rounded-2xl p-3 shadow-pop-sm space-y-3">
        {/* Row 1: Ink Palette & Eraser */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
          <div className="flex items-center gap-1.5 shrink-0">
            {INK_COLORS.map((ink) => (
              <button
                key={ink.id}
                type="button"
                onClick={() => {
                  setCurrentColor(ink.color);
                  setIsEraser(false);
                  partyAudio.playCardHover();
                }}
                title={ink.label}
                className={`w-7 h-7 rounded-xl border-2 border-slate-900 transition-transform ${
                  !isEraser && currentColor === ink.color
                    ? 'scale-125 shadow-pop-sm ring-2 ring-yellow-400'
                    : 'hover:scale-105'
                }`}
                style={{ backgroundColor: ink.color }}
              />
            ))}
          </div>

          {/* Eraser */}
          <button
            type="button"
            onClick={() => {
              setIsEraser(!isEraser);
              partyAudio.playCardHover();
            }}
            className={`px-2.5 py-1 text-xs font-black rounded-xl border-2 border-slate-900 transition-all flex items-center gap-1 shrink-0 ${
              isEraser
                ? 'bg-rose-400 text-white shadow-pop-sm scale-105'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
            }`}
          >
            <span>🧹</span>
            <span>TẨY</span>
          </button>
        </div>

        {/* Row 2: Brush Sizes & Undo / Clear */}
        <div className="flex items-center justify-between gap-2 border-t border-slate-200 pt-2">
          {/* Sizes */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black uppercase text-slate-500 mr-1">Nét:</span>
            {BRUSH_SIZES.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => {
                  setCurrentSize(b.size);
                  partyAudio.playCardHover();
                }}
                title={b.label}
                className={`px-2.5 py-1 rounded-xl border-2 border-slate-900 flex items-center justify-center transition-all ${
                  currentSize === b.size
                    ? 'bg-amber-300 shadow-pop-sm font-black'
                    : 'bg-slate-50 hover:bg-slate-100 font-bold'
                }`}
              >
                <div
                  className={`rounded-full bg-slate-900 ${b.dotSize}`}
                />
              </button>
            ))}
          </div>

          {/* Undo & Clear */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleUndo}
              disabled={history.length <= 1}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-800 border-2 border-slate-900 rounded-xl text-xs font-black shadow-pop-sm"
              title="Hoàn tác nét vẽ"
            >
              ↩ HOÀN TÁC
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="px-2.5 py-1 bg-rose-100 hover:bg-rose-200 text-rose-900 border-2 border-slate-900 rounded-xl text-xs font-black shadow-pop-sm"
              title="Xóa trắng canvas"
            >
              🗑️ XÓA HẾT
            </button>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="w-full max-w-lg">
        <button
          type="button"
          onClick={handleConfirmSubmit}
          disabled={!hasDrawn || disabled}
          className={`w-full py-3.5 rounded-2xl border-[2.5px] border-slate-900 font-black text-sm md:text-base uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-pop active:translate-x-0.5 active:translate-y-0.5 ${
            hasDrawn && !disabled
              ? 'bg-yellow-400 hover:bg-yellow-500 text-slate-950 cursor-pointer shadow-pop-yellow'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed border-slate-400'
          }`}
        >
          <span>[ 🖼️ NỘP BỨC TRANH BẰNG CHỨNG VÀO TÒA ⚖️ ]</span>
        </button>
      </div>
    </div>
  );
};
