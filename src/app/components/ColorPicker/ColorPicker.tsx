/**
 * ColorPicker – Custom Aucctus color picker with flexible saturation/brightness
 * canvas, hue slider, and switchable Hex / RGB / HSL inputs.
 *
 * Keyboard: Enter confirms, Escape cancels.
 */

import Portal from '@components/Portal';
import { cn } from '@libs/utils/react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  hexToHsv,
  hslToHsv,
  hsvToHex,
  hsvToHsl,
  hsvToRgb,
  rgbToHsv,
  type HSV,
} from './colorUtils';

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export interface ColorPickerProps {
  /** Current hex color value (e.g. "#6366F1") */
  value: string;
  /** Called with new hex when user confirms */
  onChange: (hex: string) => void;
  /** Called when user cancels / closes */
  onClose?: () => void;
  /** Ref to the trigger element — picker positions itself relative to this */
  anchorRef?: React.RefObject<HTMLElement | null>;
  /** Additional class name on the root wrapper */
  className?: string;
}

type ColorMode = 'hex' | 'rgb' | 'hsl';

/* ------------------------------------------------------------------ */
/* Sub-components                                                      */
/* ------------------------------------------------------------------ */

/** Saturation / Brightness canvas — fills parent width */
const SatBrightCanvas: React.FC<{
  hue: number;
  sat: number;
  bright: number;
  onPick: (s: number, v: number) => void;
}> = ({ hue, sat, bright, onPick }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const sizeRef = useRef({ w: 0, h: 0 });

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const w = container.clientWidth;
    const h = container.clientHeight;
    canvas.width = w;
    canvas.height = h;
    sizeRef.current = { w, h };

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // White → hue gradient (left → right)
    const gradH = ctx.createLinearGradient(0, 0, w, 0);
    gradH.addColorStop(0, '#fff');
    gradH.addColorStop(1, `hsl(${hue}, 100%, 50%)`);
    ctx.fillStyle = gradH;
    ctx.fillRect(0, 0, w, h);

    // Transparent → black gradient (top → bottom)
    const gradV = ctx.createLinearGradient(0, 0, 0, h);
    gradV.addColorStop(0, 'rgba(0,0,0,0)');
    gradV.addColorStop(1, '#000');
    ctx.fillStyle = gradV;
    ctx.fillRect(0, 0, w, h);
  }, [hue]);

  useEffect(() => {
    draw();
    const obs = new ResizeObserver(draw);
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, [draw]);

  const pick = useCallback(
    (e: React.MouseEvent | MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const { w, h } = sizeRef.current;
      const x = Math.max(0, Math.min(e.clientX - rect.left, w));
      const y = Math.max(0, Math.min(e.clientY - rect.top, h));
      onPick(x / w, 1 - y / h);
    },
    [onPick],
  );

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      dragging.current = true;
      pick(e);

      const move = (ev: MouseEvent) => {
        if (dragging.current) pick(ev);
      };
      const up = () => {
        dragging.current = false;
        window.removeEventListener('mousemove', move);
        window.removeEventListener('mouseup', up);
      };

      window.addEventListener('mousemove', move);
      window.addEventListener('mouseup', up);
    },
    [pick],
  );

  const { w, h } = sizeRef.current;
  const cx = sat * w;
  const cy = (1 - bright) * h;

  return (
    <div
      ref={containerRef}
      className='relative h-40 w-full cursor-crosshair'
      onMouseDown={onMouseDown}
    >
      <canvas ref={canvasRef} className='h-full w-full rounded-lg' />
      <div
        className='pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.3)]'
        style={{ left: cx, top: cy }}
      />
    </div>
  );
};

/** Hue slider — fills parent width */
const HueSlider: React.FC<{
  hue: number;
  onHueChange: (h: number) => void;
}> = ({ hue, onHueChange }) => {
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const pick = useCallback(
    (e: React.MouseEvent | MouseEvent) => {
      const rect = ref.current?.getBoundingClientRect();
      if (!rect) return;
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      onHueChange((x / rect.width) * 360);
    },
    [onHueChange],
  );

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      dragging.current = true;
      pick(e);

      const move = (ev: MouseEvent) => {
        if (dragging.current) pick(ev);
      };
      const up = () => {
        dragging.current = false;
        window.removeEventListener('mousemove', move);
        window.removeEventListener('mouseup', up);
      };

      window.addEventListener('mousemove', move);
      window.addEventListener('mouseup', up);
    },
    [pick],
  );

  const thumbPct = `${(hue / 360) * 100}%`;

  return (
    <div
      ref={ref}
      className='relative h-3.5 w-full cursor-pointer rounded-full'
      style={{
        background:
          'linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)',
      }}
      onMouseDown={onMouseDown}
    >
      <div
        className='pointer-events-none absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.3)]'
        style={{ left: thumbPct }}
      />
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Color mode input row                                                */
/* ------------------------------------------------------------------ */

const inputCls =
  'aucctus-text-primary aucctus-bg-secondary aucctus-border-secondary w-full rounded-md border px-2 py-1 font-mono text-xs outline-none focus:border-emerald-500/50 text-center';
const labelCls =
  'aucctus-text-tertiary text-[9px] uppercase tracking-wider text-center';

const ColorInputs: React.FC<{
  mode: ColorMode;
  hsv: HSV;
  onHsvChange: (hsv: HSV) => void;
}> = ({ mode, hsv, onHsvChange }) => {
  const currentHex = hsvToHex(hsv);
  const rgb = hsvToRgb(hsv);
  const hsl = hsvToHsl(hsv);

  const [hexDraft, setHexDraft] = useState(currentHex.toUpperCase());
  const [rgbDraft, setRgbDraft] = useState({
    r: String(rgb.r),
    g: String(rgb.g),
    b: String(rgb.b),
  });
  const [hslDraft, setHslDraft] = useState({
    h: String(hsl.h),
    s: String(hsl.s),
    l: String(hsl.l),
  });

  // Sync drafts when hsv changes externally (canvas / hue slider interaction)
  useEffect(() => {
    setHexDraft(hsvToHex(hsv).toUpperCase());
    const r = hsvToRgb(hsv);
    setRgbDraft({ r: String(r.r), g: String(r.g), b: String(r.b) });
    const h = hsvToHsl(hsv);
    setHslDraft({ h: String(h.h), s: String(h.s), l: String(h.l) });
  }, [hsv]);

  const commitHex = () => {
    const parsed = hexToHsv(hexDraft);
    if (parsed) onHsvChange(parsed);
    else setHexDraft(hsvToHex(hsv).toUpperCase());
  };

  const commitRgb = () => {
    const r = parseInt(rgbDraft.r);
    const g = parseInt(rgbDraft.g);
    const b = parseInt(rgbDraft.b);
    if ([r, g, b].every((n) => !isNaN(n) && n >= 0 && n <= 255)) {
      onHsvChange(rgbToHsv({ r, g, b }));
    } else {
      const cur = hsvToRgb(hsv);
      setRgbDraft({ r: String(cur.r), g: String(cur.g), b: String(cur.b) });
    }
  };

  const commitHsl = () => {
    const h = parseInt(hslDraft.h);
    const s = parseInt(hslDraft.s);
    const l = parseInt(hslDraft.l);
    if (
      !isNaN(h) &&
      h >= 0 &&
      h <= 360 &&
      !isNaN(s) &&
      s >= 0 &&
      s <= 100 &&
      !isNaN(l) &&
      l >= 0 &&
      l <= 100
    ) {
      onHsvChange(hslToHsv({ h, s, l }));
    } else {
      const cur = hsvToHsl(hsv);
      setHslDraft({ h: String(cur.h), s: String(cur.s), l: String(cur.l) });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, commit: () => void) => {
    if (e.key === 'Enter') {
      e.stopPropagation();
      commit();
    }
  };

  if (mode === 'hex') {
    return (
      <div className='flex flex-1 flex-col gap-1'>
        <input
          type='text'
          value={hexDraft}
          onChange={(e) => setHexDraft(e.target.value.toUpperCase())}
          onBlur={commitHex}
          onKeyDown={(e) => handleKeyDown(e, commitHex)}
          maxLength={7}
          className={inputCls}
        />
        <span className={labelCls}>Hex</span>
      </div>
    );
  }

  if (mode === 'rgb') {
    return (
      <>
        {(['r', 'g', 'b'] as const).map((ch) => (
          <div key={ch} className='flex flex-1 flex-col gap-1'>
            <input
              type='text'
              value={rgbDraft[ch]}
              onChange={(e) =>
                setRgbDraft((prev) => ({ ...prev, [ch]: e.target.value }))
              }
              onBlur={commitRgb}
              onKeyDown={(e) => handleKeyDown(e, commitRgb)}
              maxLength={3}
              className={inputCls}
            />
            <span className={labelCls}>{ch.toUpperCase()}</span>
          </div>
        ))}
      </>
    );
  }

  // hsl
  return (
    <>
      {(['h', 's', 'l'] as const).map((ch) => (
        <div key={ch} className='flex flex-1 flex-col gap-1'>
          <input
            type='text'
            value={hslDraft[ch]}
            onChange={(e) =>
              setHslDraft((prev) => ({ ...prev, [ch]: e.target.value }))
            }
            onBlur={commitHsl}
            onKeyDown={(e) => handleKeyDown(e, commitHsl)}
            maxLength={3}
            className={inputCls}
          />
          <span className={labelCls}>{ch.toUpperCase()}</span>
        </div>
      ))}
    </>
  );
};

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */

const COLOR_MODES: ColorMode[] = ['hex', 'rgb', 'hsl'];

const ColorPicker: React.FC<ColorPickerProps> = ({
  value,
  onChange,
  onClose,
  anchorRef,
  className,
}) => {
  const [hsv, setHsv] = useState<HSV>(
    () => hexToHsv(value) ?? { h: 240, s: 0.7, v: 0.9 },
  );
  const [mode, setMode] = useState<ColorMode>('hex');
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  const currentHex = hsvToHex(hsv);

  // Position relative to anchor element
  useEffect(() => {
    if (!anchorRef?.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    setPos({
      top: rect.bottom + window.scrollY + 8,
      left: rect.left + window.scrollX,
    });
  }, [anchorRef]);

  const handleSatBright = useCallback((s: number, v: number) => {
    setHsv((prev) => ({ ...prev, s, v }));
  }, []);

  const handleHue = useCallback((h: number) => {
    setHsv((prev) => ({ ...prev, h }));
  }, []);

  const confirm = useCallback(() => {
    onChange(currentHex);
  }, [onChange, currentHex]);

  const cancel = useCallback(() => {
    onClose?.();
  }, [onClose]);

  const cycleMode = useCallback(() => {
    setMode(
      (prev) =>
        COLOR_MODES[(COLOR_MODES.indexOf(prev) + 1) % COLOR_MODES.length],
    );
  }, []);

  // Keyboard: Enter confirm, Escape cancel
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        confirm();
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        cancel();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [confirm, cancel]);

  const pickerStyle: React.CSSProperties = pos
    ? { position: 'absolute', top: pos.top, left: pos.left }
    : {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      };

  return (
    <Portal containerId='color-picker-portal'>
      {/* Backdrop */}
      <div
        className='pointer-events-auto fixed inset-0 z-[99]'
        onClick={cancel}
      />

      {/* Picker */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 4 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 4 }}
        transition={{ duration: 0.15 }}
        style={pickerStyle}
        className={cn(
          'aucctus-border-secondary bg-background/95 pointer-events-auto z-[100] flex w-64 flex-col gap-3 rounded-xl border p-3 shadow-xl backdrop-blur-xl',
          className,
        )}
      >
        {/* Saturation / Brightness canvas */}
        <SatBrightCanvas
          hue={hsv.h}
          sat={hsv.s}
          bright={hsv.v}
          onPick={handleSatBright}
        />

        {/* Hue slider */}
        <HueSlider hue={hsv.h} onHueChange={handleHue} />

        {/* Color preview + inputs + mode toggle */}
        <div className='flex items-start gap-2'>
          {/* Preview swatch */}
          <div
            className='h-9 w-9 flex-shrink-0 rounded-lg border border-black/10 shadow-inner'
            style={{ backgroundColor: currentHex }}
          />

          {/* Input fields */}
          <div className='flex min-w-0 flex-1 items-start gap-1.5'>
            <ColorInputs mode={mode} hsv={hsv} onHsvChange={setHsv} />
          </div>

          {/* Mode toggle */}
          <button
            type='button'
            onClick={cycleMode}
            className='aucctus-text-tertiary hover:aucctus-text-primary aucctus-bg-secondary aucctus-border-secondary flex h-7 flex-shrink-0 items-center rounded-md border px-1.5 text-[9px] font-semibold uppercase tracking-wider transition-colors'
            title={`Switch to ${COLOR_MODES[(COLOR_MODES.indexOf(mode) + 1) % COLOR_MODES.length].toUpperCase()}`}
          >
            {mode}
          </button>
        </div>

        {/* Actions */}
        <div className='flex items-center justify-end gap-1.5'>
          <button
            type='button'
            onClick={cancel}
            className='aucctus-text-tertiary hover:aucctus-text-primary hover:bg-muted flex h-7 items-center gap-1 rounded-lg px-2.5 text-xs transition-colors'
          >
            <X className='h-3 w-3' />
            Cancel
          </button>
          <button
            type='button'
            onClick={confirm}
            className='flex h-7 items-center gap-1 rounded-lg bg-emerald-500/20 px-2.5 text-xs text-emerald-400 transition-colors hover:bg-emerald-500/30 hover:text-emerald-300'
          >
            <Check className='h-3 w-3' />
            Confirm
          </button>
        </div>
      </motion.div>
    </Portal>
  );
};

export default ColorPicker;
