'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { partyAudio } from '@/lib/partyAudio';
import { WashiTape, RubberStamp } from '@/components/common/HandDoodles';
import { IconBrush, IconEraser, IconUndo, IconTrash, IconCheck } from '@/components/common/FlatIcons';

interface DoodleCanvasProps {
  promptScenario: string;
  onSaveSketch: (dataUrl: string) => void;
  disabled?: boolean;
  timeRemaining?: number;
}

const INTERNAL_RES = 800; // Fixed high-resolution canvas size (800x800)
const BG_PAPER_COLOR = '#fdfbf7';

const INK_COLORS = [
  { id: 'black', label: 'Mực Đen Tòa', color: '#0f172a' },
  { id: 'crimson', label: 'Đỏ Tố Cáo', color: '#dc2626' },
  { id: 'blue', label: 'Xanh Chân Lý', color: '#2563eb' },
  { id: 'amber', label: 'Vàng Bằng Chứng', color: '#d97706' },
  { id: 'emerald', label: 'Xanh Ngoại Phạm', color: '#059669' },
  { id: 'purple', label: 'Tím Mờ Ám', color: '#7c3aed' },
  { id: 'white', label: 'Phấn Trắng', color: '#ffffff' },
];

const BRUSH_SIZES = [
  { id: 'fine', label: 'Nét Mảnh', size: 5, dotClass: 'w-1.5 h-1.5' },
  { id: 'medium', label: 'Nét Vừa', size: 11, dotClass: 'w-2.5 h-2.5' },
  { id: 'bold', label: 'Nét Đậm', size: 22, dotClass: 'w-4 h-4' },
  { id: 'marker', label: 'Bút Lông', size: 40, dotClass: 'w-5 h-5' },
];

export const DoodleCanvas: React.FC<DoodleCanvasProps> = ({
  promptScenario,
  onSaveSketch,
  disabled = false,
  timeRemaining,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [currentColor, setCurrentColor] = useState<string>('#0f172a');
  const [currentSize, setCurrentSize] = useState<number>(11);
  const [isEraser, setIsEraser] = useState<boolean>(false);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [hasDrawn, setHasDrawn] = useState<boolean>(false);
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);

  // Auto-submit sketch when countdown timer hits 0
  const hasAutoSubmittedRef = useRef(false);
  useEffect(() => {
    if (timeRemaining !== undefined && timeRemaining <= 0 && !hasAutoSubmittedRef.current) {
      hasAutoSubmittedRef.current = true;
      handleConfirmSubmit();
    }
  }, [timeRemaining]);

  // Undo & Redo stacks
  const [history, setHistory] = useState<ImageData[]>([]);
  const [redoStack, setRedoStack] = useState<ImageData[]>([]);

  // Stroke tracking refs for smooth quadratic bezier curves
  const isPointerDownRef = useRef<boolean>(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const lastMidPointRef = useRef<{ x: number; y: number } | null>(null);

  // Initialize canvas only once on mount
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = INTERNAL_RES;
    canvas.height = INTERNAL_RES;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (ctx) {
      // Base paper fill
      ctx.fillStyle = BG_PAPER_COLOR;
      ctx.fillRect(0, 0, INTERNAL_RES, INTERNAL_RES);

      // Line properties
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Save initial blank state to history
      const initialSnapshot = ctx.getImageData(0, 0, INTERNAL_RES, INTERNAL_RES);
      setHistory([initialSnapshot]);
      setRedoStack([]);
    }
  }, []);

  // Save snapshot to history
  const pushToHistory = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    try {
      const snapshot = ctx.getImageData(0, 0, INTERNAL_RES, INTERNAL_RES);
      setHistory((prev) => {
        const next = [...prev, snapshot];
        if (next.length > 25) next.shift(); // Limit to 25 history states
        return next;
      });
      setRedoStack([]); // Clear redo stack on new action
    } catch {
      // Ignored
    }
  }, []);

  // Convert client pointer event into exact 800x800 canvas coordinates
  const getCanvasCoords = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scale = INTERNAL_RES / rect.width;
    return {
      x: (e.clientX - rect.left) * scale,
      y: (e.clientY - rect.top) * scale,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (disabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignored if capture unsupported
    }

    isPointerDownRef.current = true;
    setIsDrawing(true);
    setHasDrawn(true);
    setShowClearConfirm(false);

    const coords = getCanvasCoords(e);
    lastPointRef.current = coords;
    lastMidPointRef.current = coords;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (ctx) {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = isEraser ? Math.max(currentSize * 2, 28) : currentSize;
      ctx.strokeStyle = isEraser ? BG_PAPER_COLOR : currentColor;
      ctx.fillStyle = isEraser ? BG_PAPER_COLOR : currentColor;

      // Draw initial dot for single tap
      ctx.beginPath();
      ctx.arc(
        coords.x,
        coords.y,
        (isEraser ? Math.max(currentSize * 2, 28) : currentSize) / 2,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isPointerDownRef.current || disabled) return;
    const canvas = canvasRef.current;
    if (!canvas || !lastPointRef.current || !lastMidPointRef.current) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const currentPoint = getCanvasCoords(e);
    const midPoint = {
      x: (lastPointRef.current.x + currentPoint.x) / 2,
      y: (lastPointRef.current.y + currentPoint.y) / 2,
    };

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = isEraser ? Math.max(currentSize * 2, 28) : currentSize;
    ctx.strokeStyle = isEraser ? BG_PAPER_COLOR : currentColor;

    ctx.beginPath();
    ctx.moveTo(lastMidPointRef.current.x, lastMidPointRef.current.y);
    ctx.quadraticCurveTo(
      lastPointRef.current.x,
      lastPointRef.current.y,
      midPoint.x,
      midPoint.y
    );
    ctx.stroke();

    lastPointRef.current = currentPoint;
    lastMidPointRef.current = midPoint;
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
    lastMidPointRef.current = null;

    pushToHistory();
  };

  // Undo
  const handleUndo = () => {
    if (disabled || history.length <= 1) return;
    partyAudio.playCardHover();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const newHistory = [...history];
    const currentState = newHistory.pop();
    if (currentState) {
      setRedoStack((prev) => [...prev, currentState]);
    }

    const previousState = newHistory[newHistory.length - 1];
    if (previousState) {
      ctx.putImageData(previousState, 0, 0);
      setHistory(newHistory);
      if (newHistory.length <= 1) {
        setHasDrawn(false);
      }
    }
  };

  // Redo
  const handleRedo = () => {
    if (disabled || redoStack.length === 0) return;
    partyAudio.playCardHover();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const newRedo = [...redoStack];
    const nextState = newRedo.pop();
    if (nextState) {
      ctx.putImageData(nextState, 0, 0);
      setHistory((prev) => [...prev, nextState]);
      setRedoStack(newRedo);
      setHasDrawn(true);
    }
  };

  // Clear Canvas
  const handleClear = () => {
    if (disabled) return;
    partyAudio.playGavelStrike();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    ctx.fillStyle = BG_PAPER_COLOR;
    ctx.fillRect(0, 0, INTERNAL_RES, INTERNAL_RES);
    setHasDrawn(false);
    setShowClearConfirm(false);
    pushToHistory();
  };

  // Submit sketch
  const handleConfirmSubmit = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    partyAudio.playGavelStrike();
    const dataUrl = canvas.toDataURL('image/png', 0.9);
    onSaveSketch(dataUrl);
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center space-y-4">
      {/* Target Prompt reminder */}
      <div className="w-full p-3.5 bg-amber-100 border-[2.5px] border-slate-900 rounded-2xl shadow-pop flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2 overflow-hidden">
          <RubberStamp text="VỤ ÁN" color="red" />
          <div className="overflow-hidden">
            <span className="text-[11px] font-black uppercase text-slate-700 block">
              VẼ PHÁC HỌA: Lúc đó bạn đang làm gì để chối tội?
            </span>
            <span className="text-xs md:text-sm font-black text-slate-950 truncate block">
              &ldquo;{promptScenario}&rdquo;
            </span>
          </div>
        </div>
        <div className="shrink-0 self-end sm:self-center">
          <WashiTape text="VẼ TAY NGOẠI PHẠM" color="bg-rose-500 text-white" />
        </div>
      </div>

      {/* Main Spacious Canvas Frame */}
      <div
        ref={containerRef}
        className="w-full relative bg-[#fdfbf7] p-2 md:p-3 border-[3px] border-slate-900 rounded-3xl shadow-pop-lg flex items-center justify-center select-none touch-none overflow-hidden"
      >
        {/* Subtle grid pattern overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-25"
          style={{
            backgroundImage:
              'radial-gradient(#334155 1.2px, transparent 1.2px), linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)',
            backgroundSize: '24px 24px, 120px 120px, 120px 120px',
          }}
        />

        {/* Big Responsive Canvas */}
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className={`w-full max-w-[560px] aspect-square rounded-2xl cursor-crosshair touch-none transition-shadow bg-[#fdfbf7] border-2 border-dashed border-slate-300 ${
            isDrawing ? 'ring-4 ring-yellow-400' : 'hover:border-slate-400'
          }`}
          style={{ touchAction: 'none' }}
        />

        {/* Floating guidance when canvas is blank */}
        {!hasDrawn && (
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6 text-center">
            <div className="p-3 bg-white/80 border-2 border-slate-900 rounded-2xl shadow-pop-sm backdrop-blur-xs flex flex-col items-center max-w-sm">
              <IconBrush className="w-8 h-8 mb-2 text-slate-700 animate-bounce" />
              <p className="text-xs md:text-sm font-black text-slate-900 uppercase tracking-wide">
                BẢNG VẼ RỘNG RÃI &bull; PHÁC HỌA TỰ DO
              </p>
              <p className="text-[11px] text-slate-600 font-bold mt-1">
                Dùng chuột hoặc ngón tay để vẽ lại cảnh tượng ngoại phạm của bạn!
              </p>
            </div>
          </div>
        )}

        {/* Canvas Dimension Badge */}
        <div className="absolute top-4 left-4 pointer-events-none">
          <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-slate-900/80 text-white rounded-md backdrop-blur-xs">
            KHỔ TRANH: 800 &times; 800 HD
          </span>
        </div>
      </div>

      {/* Drawing Toolbar */}
      <div className="w-full bg-white border-[2.5px] border-slate-900 rounded-2xl p-3 shadow-pop space-y-3">
        {/* Row 1: Ink Palette & Eraser */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Colors */}
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            <span className="text-[10px] font-black uppercase text-slate-500 mr-0.5">Màu:</span>
            {INK_COLORS.map((ink) => {
              const isSelected = !isEraser && currentColor === ink.color;
              return (
                <button
                  key={ink.id}
                  type="button"
                  onClick={() => {
                    setCurrentColor(ink.color);
                    setIsEraser(false);
                    partyAudio.playCardHover();
                  }}
                  title={ink.label}
                  className={`w-7 h-7 md:w-8 md:h-8 rounded-xl border-2 border-slate-900 transition-all cursor-pointer ${
                    isSelected
                      ? 'scale-115 shadow-pop-sm ring-2 ring-yellow-400 ring-offset-1 -translate-y-0.5'
                      : 'hover:scale-105 opacity-90 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: ink.color }}
                />
              );
            })}
          </div>

          {/* Eraser Button */}
          <button
            type="button"
            onClick={() => {
              setIsEraser(!isEraser);
              partyAudio.playCardHover();
            }}
            className={`px-3 py-1.5 text-xs font-black rounded-xl border-2 border-slate-900 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              isEraser
                ? 'bg-rose-500 text-white shadow-pop-sm scale-105'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
            }`}
          >
            <IconEraser className="w-4 h-4" />
            <span>{isEraser ? 'ĐANG DÙNG TẨY' : 'CỤC TẨY'}</span>
          </button>
        </div>

        {/* Row 2: Brush Sizes & Undo / Redo / Clear */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t-2 border-slate-100 pt-2.5">
          {/* Brush Sizes */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black uppercase text-slate-500 mr-1">Cỡ nét:</span>
            {BRUSH_SIZES.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => {
                  setCurrentSize(b.size);
                  partyAudio.playCardHover();
                }}
                title={b.label}
                className={`px-2.5 py-1 rounded-xl border-2 border-slate-900 flex items-center justify-center transition-all cursor-pointer ${
                  currentSize === b.size && !isEraser
                    ? 'bg-amber-300 shadow-pop-sm font-black'
                    : 'bg-slate-50 hover:bg-slate-100 font-bold'
                }`}
              >
                <div className={`rounded-full bg-slate-900 ${b.dotClass}`} />
              </button>
            ))}
          </div>

          {/* Action buttons: Undo, Redo, Clear */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleUndo}
              disabled={history.length <= 1}
              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed text-slate-800 border-2 border-slate-900 rounded-xl text-xs font-black shadow-pop-sm flex items-center gap-1 cursor-pointer transition-transform active:translate-y-0.5"
              title="Hoàn tác nét vừa vẽ"
            >
              <IconUndo className="w-3.5 h-3.5" />
              <span>HOÀN TÁC</span>
            </button>

            <button
              type="button"
              onClick={handleRedo}
              disabled={redoStack.length === 0}
              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed text-slate-800 border-2 border-slate-900 rounded-xl text-xs font-black shadow-pop-sm flex items-center gap-1 cursor-pointer transition-transform active:translate-y-0.5"
              title="Lấy lại nét đã xóa"
            >
              <span>LÀM LẠI</span>
            </button>

            {showClearConfirm ? (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white border-2 border-slate-900 rounded-xl text-xs font-black shadow-pop-sm cursor-pointer"
                >
                  XÁC NHẬN XÓA
                </button>
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(false)}
                  className="px-2 py-1 bg-slate-200 text-slate-800 border-2 border-slate-900 rounded-xl text-xs font-black cursor-pointer"
                >
                  HỦY
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowClearConfirm(true)}
                disabled={!hasDrawn}
                className="px-2.5 py-1.5 bg-rose-100 hover:bg-rose-200 disabled:opacity-30 disabled:cursor-not-allowed text-rose-900 border-2 border-slate-900 rounded-xl text-xs font-black shadow-pop-sm flex items-center gap-1 cursor-pointer transition-transform active:translate-y-0.5"
                title="Xóa trắng toàn bộ bảng vẽ"
              >
                <IconTrash className="w-3.5 h-3.5" />
                <span>XÓA SẠCH</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Big Submit Button */}
      <div className="w-full">
        <button
          type="button"
          onClick={handleConfirmSubmit}
          disabled={!hasDrawn || disabled}
          className={`w-full py-4 rounded-2xl border-[3px] border-slate-900 font-black text-sm md:text-base uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-pop active:translate-x-0.5 active:translate-y-0.5 ${
            hasDrawn && !disabled
              ? 'bg-yellow-400 hover:bg-yellow-500 text-slate-950 cursor-pointer shadow-pop-yellow'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed border-slate-400'
          }`}
        >
          <IconCheck className="w-5 h-5" />
          <span>[ NỘP BẢN PHÁC HỌA VÀO HỒ SƠ TÒA ÁN ]</span>
        </button>
      </div>
    </div>
  );
};
