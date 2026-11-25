import React, { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import type { Lang } from '../../lib/cytoDomain';

/** Crisp white card wrapper for benchmark charts. */
export const BenchCard: React.FC<{
  title: string;
  meta?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}> = ({ title, meta, children, footer, className = '' }) => (
  <figure
    className={`rounded-2xl border border-emerald-950/[0.09] bg-white shadow-[0_1px_2px_rgba(6,78,59,0.04)] p-4 sm:p-5 flex flex-col gap-3.5 ${className}`}
  >
    <figcaption className="flex items-baseline justify-between gap-2 pb-2.5 border-b border-emerald-950/[0.06]">
      <span className="text-[13.5px] sm:text-sm font-semibold text-[#0C261B]">{title}</span>
      {meta && <span className="font-mono text-[11px] text-slate-400 shrink-0">{meta}</span>}
    </figcaption>
    <div className="flex-1">{children}</div>
    {footer && <div className="pt-2 border-t border-emerald-950/[0.06] text-xs text-slate-500 leading-relaxed">{footer}</div>}
  </figure>
);

/** Taiyi-style pill mode tabs + optional Zoomed/Full scale toggle + Replay trigger. */
export const BenchControlsBar: React.FC<{
  tabs: { id: string; label: string }[];
  activeTab: string;
  onSelectTab: (id: string) => void;
  axisMode?: 'zoom' | 'full';
  onAxisMode?: (mode: 'zoom' | 'full') => void;
  onReplay?: () => void;
  lang: Lang;
}> = ({ tabs, activeTab, onSelectTab, axisMode, onAxisMode, onReplay, lang }) => {
  const zh = lang === 'zh';
  return (
    <div className="flex flex-wrap items-center justify-between gap-2.5">
      <div role="tablist" className="flex flex-wrap items-center gap-1.5">
        {tabs.map((t) => {
          const active = t.id === activeTab;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onSelectTab(t.id)}
              className={`px-3.5 py-1.5 text-xs sm:text-[13px] rounded-full border transition-all cursor-pointer ${
                active
                  ? 'bg-[#0C261B] text-white border-[#0C261B] font-semibold shadow-[0_4px_12px_-6px_rgba(6,78,59,0.55)]'
                  : 'bg-white text-slate-600 border-emerald-950/12 hover:border-emerald-600/45 hover:text-[#0C261B]'
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {axisMode && onAxisMode && (
          <div
            role="group"
            aria-label={zh ? '坐标范围切换' : 'Axis scale'}
            className="inline-flex items-center p-0.5 rounded-lg bg-[#EAF4EE] border border-emerald-950/[0.08]"
          >
            <button
              type="button"
              aria-pressed={axisMode === 'zoom'}
              onClick={() => onAxisMode('zoom')}
              className={`px-2.5 py-1 text-[11px] rounded-md transition-colors cursor-pointer ${
                axisMode === 'zoom' ? 'bg-white text-emerald-800 font-semibold shadow-2xs' : 'text-slate-500 hover:text-[#0C261B]'
              }`}
            >
              {zh ? '差异放大' : 'Zoomed'}
            </button>
            <button
              type="button"
              aria-pressed={axisMode === 'full'}
              onClick={() => onAxisMode('full')}
              className={`px-2.5 py-1 text-[11px] rounded-md transition-colors cursor-pointer ${
                axisMode === 'full' ? 'bg-white text-emerald-800 font-semibold shadow-2xs' : 'text-slate-500 hover:text-[#0C261B]'
              }`}
            >
              {zh ? '完整坐标' : 'Full Scale'}
            </button>
          </div>
        )}
        {onReplay && (
          <button
            type="button"
            onClick={onReplay}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium text-slate-500 hover:text-emerald-700 rounded-lg hover:bg-white/80 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" aria-hidden="true" />
            <span>{zh ? '重播' : 'Replay'}</span>
          </button>
        )}
      </div>
    </div>
  );
};

/** 1. Taiyi-style Animated Leaderboard (supports zoomed vs full axis, optional category dot). */
export const TaiyiBarList: React.FC<{
  title?: string;
  entries: { label: string; value: number; ours?: boolean; dotColor?: string }[];
  zoomAxis: [number, number];
  fullAxis?: [number, number];
  axisMode?: 'zoom' | 'full';
  digits: number;
  suffix?: string;
  better: 'lower' | 'higher';
  play: boolean;
  compact?: boolean;
}> = ({ title, entries, zoomAxis, fullAxis = [0, 1], axisMode = 'zoom', digits, suffix = '', better, play, compact = false }) => {
  const [lo, hi] = axisMode === 'full' ? fullAxis : zoomAxis;
  const rows = [...entries].sort((a, b) => (better === 'lower' ? a.value - b.value : b.value - a.value));
  return (
    <div className="space-y-2">
      {title && (
        <div className="flex items-baseline justify-between gap-2 pb-1.5 border-b border-emerald-950/[0.06]">
          <span className="text-[13px] font-semibold text-[#0C261B]">{title}</span>
          <span className="font-mono text-[10.5px] text-slate-400">
            {lo.toFixed(2)}–{hi.toFixed(2)} {better === 'lower' ? '↓' : '↑'}
          </span>
        </div>
      )}
      <div className="space-y-1">
        {rows.map((e, i) => {
          const pct = Math.max(2, Math.min(100, ((e.value - lo) / Math.max(0.0001, hi - lo)) * 100));
          return (
            <div
              key={e.label}
              className={`grid ${
                compact
                  ? 'grid-cols-[minmax(76px,98px)_1fr_48px]'
                  : 'grid-cols-[minmax(96px,124px)_1fr_54px] sm:grid-cols-[minmax(116px,142px)_1fr_58px]'
              } items-center gap-2.5 px-2 py-1 -mx-2 rounded-md ${e.ours ? 'bg-emerald-50/90' : ''}`}
            >
              <span className={`flex items-center gap-1.5 text-[12px] sm:text-[12.5px] truncate ${e.ours ? 'font-semibold text-emerald-800' : 'text-slate-700'}`}>
                {e.dotColor && (
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: e.dotColor }}
                    aria-hidden="true"
                  />
                )}
                <span className="truncate">{e.label}</span>
              </span>
              <span className="h-2 rounded-full bg-emerald-950/[0.07] overflow-hidden">
                <span
                  className={`block h-full rounded-full ${
                    e.ours ? 'bg-gradient-to-r from-emerald-600 to-emerald-500' : 'bg-slate-400/60'
                  }`}
                  style={{
                    width: play ? `${pct}%` : '0%',
                    transition: 'width 760ms cubic-bezier(0.22, 1, 0.36, 1)',
                    transitionDelay: `${i * 55}ms`,
                  }}
                />
              </span>
              <span
                className={`font-mono text-[12px] tabular-nums text-right ${
                  e.ours ? 'font-bold text-emerald-700' : 'text-slate-600'
                }`}
              >
                {e.value.toFixed(digits)}
                {suffix}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/** 2. SVG Donut Chart (Taiyi left-column signature). */
export const DonutChart: React.FC<{
  segments: { label: string; value: number; color: string }[];
  centerValue: string;
  centerLabel: string;
  valueFormatter?: (v: number) => string;
}> = ({ segments, centerValue, centerLabel, valueFormatter = (v) => v.toLocaleString() }) => {
  const total = segments.reduce((s, d) => s + d.value, 0) || 1;
  const r = 46;
  const circ = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      <svg viewBox="0 0 120 120" className="w-28 h-28 shrink-0" role="img" aria-label={`${centerValue} ${centerLabel}`}>
        <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(6,78,59,0.06)" strokeWidth="14" />
        {segments.map((seg) => {
          const frac = seg.value / total;
          const dash = Math.max(2, frac * circ - 1.5);
          const curOffset = offset;
          offset += frac * circ;
          return (
            <circle
              key={seg.label}
              cx="60"
              cy="60"
              r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth="14"
              strokeDasharray={`${dash} ${circ - dash}`}
              strokeDashoffset={-curOffset}
              transform="rotate(-90 60 60)"
            />
          );
        })}
        <text x="60" y="57" textAnchor="middle" className="fill-[#0C261B] font-mono text-[15px] font-bold">
          {centerValue}
        </text>
        <text x="60" y="72" textAnchor="middle" className="fill-slate-500 text-[8.5px]">
          {centerLabel}
        </text>
      </svg>
      <ul className="flex-1 w-full space-y-1.5 text-xs">
        {segments.map((seg) => (
          <li key={seg.label} className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 text-slate-600 truncate">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: seg.color }} aria-hidden="true" />
              <span className="truncate">{seg.label}</span>
            </span>
            <span className="font-mono text-[11.5px] font-semibold text-[#0C261B] tabular-nums shrink-0">
              {valueFormatter(seg.value)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

/** 3. SVG Multi-Axis Radar Chart (for 8-organ spatial retrieval profile). */
export const RadarChart: React.FC<{
  axes: string[];
  series: { name: string; values: number[]; color: string; fill?: boolean; dashed?: boolean }[];
  maxVal: number;
  activeAxis?: number;
  onSelectAxis?: (idx: number) => void;
}> = ({ axes, series, maxVal, activeAxis, onSelectAxis }) => {
  const n = axes.length;
  const cx = 140;
  const cy = 118;
  const radius = 80;
  const angleAt = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const pt = (i: number, val: number) => {
    const a = angleAt(i);
    const r = (Math.max(0, val) / maxVal) * radius;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r] as const;
  };
  const rings = [0.25, 0.5, 0.75, 1];

  return (
    <div className="space-y-2.5">
      <svg viewBox="0 0 280 236" className="w-full max-w-[300px] mx-auto overflow-visible" role="img" aria-label="Multi-organ radar comparison">
        {rings.map((f) => (
          <polygon
            key={f}
            points={axes.map((_, i) => pt(i, maxVal * f).join(',')).join(' ')}
            fill="none"
            stroke="rgba(6,78,59,0.1)"
            strokeWidth="0.9"
          />
        ))}
        {axes.map((_, i) => {
          const [x, y] = pt(i, maxVal);
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={x}
              y2={y}
              stroke={activeAxis === i ? 'rgba(5,150,105,0.45)' : 'rgba(6,78,59,0.09)'}
              strokeWidth={activeAxis === i ? '1.4' : '0.9'}
            />
          );
        })}

        {series.map((s) => {
          const points = s.values.map((v, i) => pt(i, v).join(',')).join(' ');
          return (
            <g key={s.name}>
              <polygon
                points={points}
                fill={s.fill ? s.color : 'none'}
                fillOpacity={s.fill ? 0.16 : 0}
                stroke={s.color}
                strokeWidth={s.fill ? 2.2 : 1.4}
                strokeDasharray={s.dashed ? '4 3' : undefined}
              />
              {s.fill &&
                s.values.map((v, i) => {
                  const [x, y] = pt(i, v);
                  return (
                    <circle
                      key={i}
                      cx={x}
                      cy={y}
                      r={activeAxis === i ? 4.2 : 2.6}
                      fill={s.color}
                      stroke="#ffffff"
                      strokeWidth="1.2"
                      className={onSelectAxis ? 'cursor-pointer' : undefined}
                      onClick={() => onSelectAxis?.(i)}
                    />
                  );
                })}
            </g>
          );
        })}

        {axes.map((label, i) => {
          const [x, y] = pt(i, maxVal * 1.19);
          const active = activeAxis === i;
          return (
            <text
              key={label}
              x={x}
              y={y}
              textAnchor={Math.abs(x - cx) < 12 ? 'middle' : x > cx ? 'start' : 'end'}
              dominantBaseline="middle"
              onClick={() => onSelectAxis?.(i)}
              className={`text-[9.5px] select-none ${
                onSelectAxis ? 'cursor-pointer' : ''
              } ${active ? 'fill-emerald-700 font-bold' : 'fill-slate-500 hover:fill-[#0C261B]'}`}
            >
              {label}
            </text>
          );
        })}
      </svg>

      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-slate-600">
        {series.map((s) => (
          <span key={s.name} className="inline-flex items-center gap-1.5">
            <span
              className="w-3 h-0.5 inline-block"
              style={{
                backgroundColor: s.dashed ? 'transparent' : s.color,
                borderTop: s.dashed ? `1.5px dashed ${s.color}` : undefined,
              }}
              aria-hidden="true"
            />
            <span className={s.fill ? 'font-semibold text-emerald-800' : ''}>{s.name}</span>
          </span>
        ))}
      </div>
    </div>
  );
};

/** 4. Interactive Matrix Heatmap (for 4×3 Mask Geometry × Difficulty). */
export const HeatmapMatrix: React.FC<{
  rows: string[];
  cols: string[];
  values: number[][]; // [row][col]
  baselines?: number[][]; // best baseline for delta readout
  selectedCell?: [number, number];
  onSelectCell?: (r: number, c: number) => void;
}> = ({ rows, cols, values, baselines, selectedCell, onSelectCell }) => {
  const flat = values.flat();
  const lo = Math.min(...flat);
  const hi = Math.max(...flat);

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[300px] space-y-1.5">
        <div className="grid grid-cols-[84px_repeat(3,1fr)] gap-1.5 text-[11px] font-medium text-slate-500">
          <div />
          {cols.map((c) => (
            <div key={c} className="text-center py-0.5">
              {c}
            </div>
          ))}
        </div>
        {rows.map((rowLabel, r) => (
          <div key={rowLabel} className="grid grid-cols-[84px_repeat(3,1fr)] gap-1.5 items-center">
            <div className="text-xs font-medium text-slate-700 truncate pr-1">{rowLabel}</div>
            {cols.map((_, c) => {
              const v = values[r][c];
              const base = baselines?.[r]?.[c];
              const delta = base !== undefined ? v - base : null;
              const t = (v - lo) / Math.max(0.001, hi - lo);
              const isSelected = selectedCell?.[0] === r && selectedCell?.[1] === c;
              const bg = `rgba(5, 150, 105, ${(0.12 + t * 0.72).toFixed(2)})`;
              const lightText = t > 0.56;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => onSelectCell?.(r, c)}
                  style={{ backgroundColor: bg }}
                  className={`rounded-lg py-2 px-1.5 text-center transition-all cursor-pointer ${
                    isSelected ? 'ring-2 ring-[#0C261B] ring-offset-1' : 'hover:opacity-90'
                  } ${lightText ? 'text-white' : 'text-[#0C261B]'}`}
                >
                  <div className="font-mono text-xs font-bold tabular-nums leading-tight">{v.toFixed(3)}</div>
                  {delta !== null && (
                    <div className={`font-mono text-[10px] tabular-nums mt-0.5 ${lightText ? 'text-emerald-100' : 'text-emerald-800'}`}>
                      {delta >= 0 ? `+${delta.toFixed(3)}` : delta.toFixed(3)}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

/** 6. 2D Pareto / Trade-off Scatter Plot (for RELAY Macro-F1 vs pgAUROC & Spatial SPAC-seq). */
export const ScatterPlot: React.FC<{
  points: {
    id: string;
    label: string;
    x: number;
    y: number;
    color: string;
    ours?: boolean;
    dx?: number;
    dy?: number;
  }[];
  xLabel: string;
  yLabel: string;
  xDomain: [number, number];
  yDomain: [number, number];
  xChance?: number;
  yChance?: number;
  idealCorner?: 'top-right' | 'top-left';
  legend?: { label: string; color: string }[];
  tickDigits?: number;
  valueDigits?: number;
  suffix?: string;
}> = ({
  points,
  xLabel,
  yLabel,
  xDomain,
  yDomain,
  xChance,
  yChance,
  idealCorner = 'top-right',
  legend,
  tickDigits = 2,
  valueDigits = 4,
  suffix = '',
}) => {
  const [hoverId, setHoverId] = useState<string | null>(null);
  const padL = 42;
  const padR = 20;
  const padT = 18;
  const padB = 34;
  const W = 380;
  const H = 228;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const sx = (x: number) => padL + ((x - xDomain[0]) / (xDomain[1] - xDomain[0])) * plotW;
  const sy = (y: number) => padT + plotH - ((y - yDomain[0]) / (yDomain[1] - yDomain[0])) * plotH;

  const xTicks = [xDomain[0], (xDomain[0] + xDomain[1]) / 2, xDomain[1]];
  const yTicks = [yDomain[0], (yDomain[0] + yDomain[1]) / 2, yDomain[1]];
  const hovered = points.find((p) => p.id === hoverId);

  return (
    <div className="space-y-2.5">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto overflow-visible" role="img" aria-label={`${xLabel} vs ${yLabel}`}>
        {/* Grid lines */}
        {yTicks.map((t) => (
          <g key={`y-${t}`}>
            <line x1={padL} y1={sy(t)} x2={W - padR} y2={sy(t)} stroke="rgba(6,78,59,0.08)" strokeWidth="1" />
            <text x={padL - 6} y={sy(t) + 3} textAnchor="end" className="fill-slate-400 font-mono text-[9px]">
              {t.toFixed(tickDigits)}
              {suffix}
            </text>
          </g>
        ))}
        {xTicks.map((t) => (
          <g key={`x-${t}`}>
            <line x1={sx(t)} y1={padT} x2={sx(t)} y2={H - padB} stroke="rgba(6,78,59,0.08)" strokeWidth="1" />
            <text x={sx(t)} y={H - padB + 13} textAnchor="middle" className="fill-slate-400 font-mono text-[9px]">
              {t.toFixed(tickDigits)}
              {suffix}
            </text>
          </g>
        ))}

        {/* Axes */}
        <line x1={padL} y1={H - padB} x2={W - padR} y2={H - padB} stroke="rgba(6,78,59,0.22)" strokeWidth="1" />
        <line x1={padL} y1={padT} x2={padL} y2={H - padB} stroke="rgba(6,78,59,0.22)" strokeWidth="1" />

        {/* Optional chance dashed lines */}
        {xChance !== undefined && (
          <line x1={sx(xChance)} y1={padT} x2={sx(xChance)} y2={H - padB} stroke="#94A3B8" strokeWidth="1" strokeDasharray="3 3" />
        )}
        {yChance !== undefined && (
          <line x1={padL} y1={sy(yChance)} x2={W - padR} y2={sy(yChance)} stroke="#94A3B8" strokeWidth="1" strokeDasharray="3 3" />
        )}

        {/* Ideal corner subtle glow */}
        <circle
          cx={idealCorner === 'top-right' ? W - padR - 6 : padL + 6}
          cy={padT + 6}
          r="26"
          fill="rgba(16,185,129,0.09)"
        />

        {/* Points */}
        {points.map((p) => {
          const cx = sx(p.x);
          const cy = sy(p.y);
          const active = hoverId === p.id;
          return (
            <g
              key={p.id}
              onMouseEnter={() => setHoverId(p.id)}
              onMouseLeave={() => setHoverId(null)}
              className="cursor-pointer"
            >
              {p.ours && <circle cx={cx} cy={cy} r="10.5" fill={p.color} fillOpacity="0.16" />}
              <circle
                cx={cx}
                cy={cy}
                r={p.ours ? 5.5 : active ? 5 : 4}
                fill={p.color}
                stroke="#ffffff"
                strokeWidth="1.5"
              />
              <text
                x={cx + (p.dx ?? (cx > W - 82 ? -8 : 8))}
                y={cy + (p.dy ?? (p.ours ? -8 : 3))}
                textAnchor={p.dx !== undefined ? (p.dx < 0 ? 'end' : 'start') : cx > W - 82 ? 'end' : 'start'}
                className={`text-[9.5px] select-none ${p.ours ? 'fill-emerald-800 font-bold' : 'fill-slate-600'}`}
              >
                {p.label}
              </text>
            </g>
          );
        })}

        {/* Axis captions */}
        <text x={padL + plotW / 2} y={H - 4} textAnchor="middle" className="fill-slate-500 text-[9.5px] font-medium">
          {xLabel}
        </text>
        <text
          x={11}
          y={padT + plotH / 2}
          textAnchor="middle"
          transform={`rotate(-90 11 ${padT + plotH / 2})`}
          className="fill-slate-500 text-[9.5px] font-medium"
        >
          {yLabel}
        </text>
      </svg>

      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 min-h-[1.25rem]">
        {hovered ? (
          <span className="font-mono text-[#0C261B]">
            <strong>{hovered.label}</strong>: {hovered.x.toFixed(valueDigits)}
            {suffix} / {hovered.y.toFixed(valueDigits)}
            {suffix}
          </span>
        ) : legend ? (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            {legend.map((l) => (
              <span key={l.label} className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: l.color }} aria-hidden="true" />
                {l.label}
              </span>
            ))}
          </div>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
};

/** 6. Grouped / Single Vertical Column Chart (for RPE1 3-class F1 & OpenProblems MSE drop). */
export const VerticalColumnChart: React.FC<{
  groups: { label: string; bars: { name: string; value: number; ours?: boolean; color?: string }[] }[];
  yDomain: [number, number];
  digits: number;
  suffix?: string;
  play: boolean;
  refLine?: { value: number; label: string; align?: 'left' | 'right' };
}> = ({ groups, yDomain, digits, suffix = '', play, refLine }) => {
  const [lo, hi] = yDomain;
  const pct = (v: number) => Math.max(4, Math.min(100, ((v - lo) / Math.max(0.0001, hi - lo)) * 100));

  return (
    <div className="space-y-2.5">
      <div className="relative h-44 pt-5 pb-1 flex items-end justify-around gap-3 border-b border-emerald-950/12">
        {refLine && (
          <div
            className={`absolute inset-x-0 border-t border-dashed border-emerald-700/45 pointer-events-none flex ${
              refLine.align === 'left' ? 'justify-start' : 'justify-end'
            }`}
            style={{ bottom: `${pct(refLine.value)}%` }}
          >
            <span className="-mt-4 bg-white/95 px-1 rounded font-mono text-[10px] text-emerald-700">{refLine.label}</span>
          </div>
        )}
        {groups.map((g, gi) => (
          <div key={g.label} className="flex-1 h-full flex items-end justify-center gap-1.5 min-w-0">
            {g.bars.map((b, bi) => {
              const h = pct(b.value);
              return (
                <div key={b.name} className="flex-1 max-w-[40px] h-full flex flex-col justify-end items-center gap-1">
                  <span className={`font-mono text-[10.5px] tabular-nums ${b.ours ? 'font-bold text-emerald-700' : 'text-slate-500'}`}>
                    {b.value.toFixed(digits)}
                    {suffix}
                  </span>
                  <div className="w-full h-full flex items-end">
                    <span
                      className={`block w-full rounded-t-md ${
                        b.ours ? 'bg-gradient-to-t from-emerald-600 to-emerald-500' : b.color ? '' : 'bg-slate-300/85'
                      }`}
                      style={{
                        height: play ? `${h}%` : '0%',
                        backgroundColor: !b.ours && b.color ? b.color : undefined,
                        transition: 'height 780ms cubic-bezier(0.22, 1, 0.36, 1)',
                        transitionDelay: `${(gi * 2 + bi) * 65}ms`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className="flex justify-around gap-3 text-[11.5px] text-slate-600 font-medium">
        {groups.map((g) => (
          <div key={g.label} className="flex-1 text-center truncate">
            {g.label}
          </div>
        ))}
      </div>
    </div>
  );
};

/** 9. Lollipop Audit Track (for CoScientist TCGA-LUAD candidate review decisions). */
export const LollipopAuditChart: React.FC<{
  rows: { label: string; score: number; decision: string; kept: boolean }[];
  baseline: { value: number; label: string };
  domain: [number, number];
  play: boolean;
}> = ({ rows, baseline, domain, play }) => {
  const [lo, hi] = domain;
  const pct = (v: number) => `${Math.max(4, Math.min(96, ((v - lo) / (hi - lo)) * 100))}%`;

  return (
    <div className="space-y-3">
      <div className="space-y-3.5">
        {rows.map((r, i) => (
          <div key={r.label} className="space-y-1">
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className={`truncate ${r.kept ? 'font-semibold text-[#0C261B]' : 'text-slate-600'}`}>{r.label}</span>
              <span className="flex items-center gap-2 shrink-0">
                <span className="font-mono text-xs tabular-nums text-[#0C261B]">{r.score.toFixed(4)}</span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10.5px] font-semibold border ${
                    r.kept
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-600/20'
                      : 'bg-[#FDF2F0] text-[#A84336] border-[#C2584A]/20'
                  }`}
                >
                  {r.decision}
                </span>
              </span>
            </div>
            <div className="relative h-4 flex items-center">
              <span className="absolute inset-x-0 h-[2px] bg-emerald-950/[0.08] rounded-full" />
              <span
                className="absolute inset-y-0 border-l border-dashed border-slate-400/75"
                style={{ left: pct(baseline.value) }}
                aria-hidden="true"
              />
              <span
                className={`absolute left-0 h-[3px] rounded-full ${r.kept ? 'bg-emerald-600' : 'bg-[#C2584A]/65'}`}
                style={{
                  width: play ? pct(r.score) : '0%',
                  transition: 'width 760ms cubic-bezier(0.22, 1, 0.36, 1)',
                  transitionDelay: `${i * 75}ms`,
                }}
              />
              <span
                className={`absolute -translate-x-1/2 w-3 h-3 rounded-full ring-2 ring-white ${
                  r.kept ? 'bg-emerald-600' : 'bg-[#C2584A]'
                }`}
                style={{
                  left: play ? pct(r.score) : '0%',
                  transition: 'left 760ms cubic-bezier(0.22, 1, 0.36, 1)',
                  transitionDelay: `${i * 75}ms`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between font-mono text-[10.5px] text-slate-400 pt-1">
        <span>{lo.toFixed(2)}</span>
        <span>--- {baseline.label} ({baseline.value.toFixed(4)})</span>
        <span>{hi.toFixed(2)}</span>
      </div>
    </div>
  );
};
