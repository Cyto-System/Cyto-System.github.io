import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Github, Maximize2, X } from 'lucide-react';
import type { Lang } from '../../lib/cytoDomain';
import type { Hotspot } from '../../lib/modelShowcase';

/** True once the element has scrolled into view (stays true afterwards when `once`). */
export function useInView<T extends Element>(once = true, threshold = 0.25) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries[0]?.isIntersecting ?? false;
        if (visible) {
          setInView(true);
          if (once) io.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [once, threshold]);

  return [ref, inView] as const;
}

/** Advances an index on a timer while `running`; returns [index, setIndex]. */
export function useAutoStep(count: number, intervalMs: number, running: boolean) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (!running || count <= 1) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % count), intervalMs);
    return () => window.clearInterval(id);
  }, [count, intervalMs, running]);
  return [index, setIndex] as const;
}

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

interface EyebrowHeadingProps {
  index: string;
  kicker: string;
  title: React.ReactNode;
  accent: React.ReactNode;
  aside?: React.ReactNode;
  id?: string;
}

/** Section heading in the Sage-style "01 / THE ARCHITECTURE" pattern, in Cyto greens. */
export const EyebrowHeading: React.FC<EyebrowHeadingProps> = ({ index, kicker, title, accent, aside, id }) => (
  <div id={id} className="scroll-mt-32 md:scroll-mt-36 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
    <div>
      <p className="font-mono text-xs tracking-[0.2em] text-emerald-800/70 mb-3">
        {index} / {kicker}
      </p>
      <h3 className="text-2xl sm:text-3xl lg:text-[34px] font-bold tracking-tight leading-[1.2] [text-wrap:balance]">
        <span className="text-[#0C261B]">{title}</span>
        <span className="block text-emerald-700 mt-1">{accent}</span>
      </h3>
    </div>
    {aside && <p className="font-mono text-xs text-slate-500 lg:pb-1.5">{aside}</p>}
  </div>
);

interface ModelIntroProps {
  eyebrow: string;
  name: string;
  tagline: string;
  description: string;
  logo?: string;
  subnav?: { href: string; label: string }[];
  githubUrl?: string;
  lang: Lang;
}

const DEFAULT_CYTO_LOGO = '/assets/coscientist/cytoco-logo.png';

/** Shared opening block for every model panel: name, one-line positioning, scope, section index & GitHub link. */
export const ModelIntro: React.FC<ModelIntroProps> = ({
  eyebrow,
  name,
  tagline,
  description,
  logo = DEFAULT_CYTO_LOGO,
  subnav,
  githubUrl,
  lang,
}) => {
  const zh = lang === 'zh';
  const showFooterBar = Boolean((subnav && subnav.length > 0) || githubUrl);

  return (
    <div className="space-y-7">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-end">
        <div className="lg:col-span-7">
          <div className="flex items-center gap-3">
            {logo && <img src={logo} alt="" width={40} height={36} className="w-10 h-auto shrink-0" />}
            <p className="font-mono text-xs tracking-[0.2em] text-emerald-800/70">{eyebrow}</p>
          </div>
          <h3 className="mt-4 text-3xl sm:text-4xl lg:text-[44px] font-bold tracking-tight leading-[1.14]">
            <span className="text-[#0C261B]">{name}</span>
            <span className="block text-emerald-700 mt-1.5 text-2xl sm:text-3xl lg:text-[34px] leading-[1.2]">{tagline}</span>
          </h3>
        </div>
        <p className="lg:col-span-5 text-sm text-slate-600 leading-[1.7] lg:border-l lg:border-emerald-950/10 lg:pl-7 lg:py-0.5 [text-wrap:pretty]">
          {description}
        </p>
      </div>
      {showFooterBar && (
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 pt-5 border-t border-emerald-950/[0.08]">
          {subnav && subnav.length > 0 ? (
            <nav
              aria-label={zh ? `${name} 章节` : `${name} sections`}
              className="flex flex-wrap gap-x-2 gap-y-1.5 text-sm"
            >
              {subnav.map((s, i) => (
                <a
                  key={s.href}
                  href={s.href}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-slate-600 hover:text-emerald-800 hover:bg-emerald-950/[0.04] transition-colors"
                >
                  <span className="font-mono text-xs text-emerald-700/60">{String(i + 1).padStart(2, '0')}</span>
                  <span>{s.label}</span>
                </a>
              ))}
            </nav>
          ) : (
            <span />
          )}

          {githubUrl && (
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-950/12 bg-white hover:border-emerald-600/50 hover:text-emerald-800 text-xs font-medium text-[#0C261B] shadow-[0_1px_2px_rgba(6,78,59,0.04)] transition-colors whitespace-nowrap shrink-0"
            >
              <Github className="w-3.5 h-3.5 text-emerald-700" aria-hidden="true" />
              <span>GitHub</span>
              <ArrowUpRight className="w-3 h-3 text-slate-400" aria-hidden="true" />
            </a>
          )}
        </div>
      )}
    </div>
  );
};

/** Horizontal bar chart; bars grow from 0 when `play` turns true. */
export const BarChart: React.FC<{
  entries: { label: string; value: number; ours?: boolean }[];
  axis: [number, number];
  digits: number;
  better: 'lower' | 'higher';
  play: boolean;
  sort?: boolean;
}> = ({ entries, axis, digits, better, play, sort = true }) => {
  const [lo, hi] = axis;
  const rows = sort ? [...entries].sort((a, b) => (better === 'lower' ? b.value - a.value : a.value - b.value)) : entries;
  return (
    <div className="space-y-1.5">
      {rows.map((e, i) => {
        const pct = Math.max(2, Math.min(100, ((e.value - lo) / (hi - lo)) * 100));
        return (
          <div
            key={e.label}
            className={`grid grid-cols-[minmax(96px,118px)_1fr_50px] sm:grid-cols-[minmax(122px,146px)_1fr_58px] items-center gap-2.5 sm:gap-3 px-2 py-1 -mx-2 rounded-md transition-colors ${
              e.ours ? 'bg-emerald-50/85' : ''
            }`}
          >
            <span className={`text-[12.5px] sm:text-[13px] truncate ${e.ours ? 'font-semibold text-emerald-800' : 'text-[#0C261B]'}`}>
              {e.label}
            </span>
            <span className="h-2.5 rounded-full bg-emerald-950/[0.07] overflow-hidden">
              <span
                className={`block h-full rounded-full ${
                  e.ours ? 'bg-gradient-to-r from-emerald-600 to-emerald-500' : 'bg-slate-400/65'
                }`}
                style={{
                  width: play ? `${pct}%` : '0%',
                  transition: 'width 850ms cubic-bezier(0.22, 1, 0.36, 1)',
                  transitionDelay: `${i * 75}ms`,
                }}
              />
            </span>
            <span
              className={`font-mono text-[12.5px] sm:text-[13px] tabular-nums text-right ${
                e.ours ? 'font-semibold text-emerald-700' : 'text-slate-600'
              }`}
            >
              {e.value.toFixed(digits)}
            </span>
          </div>
        );
      })}
      <div className="pt-2.5 mt-1 border-t border-emerald-950/[0.06] flex justify-between font-mono text-[10.5px] text-slate-400">
        <span>{lo.toFixed(2)}</span>
        <span>{better === 'lower' ? '↓ lower is better' : '↑ higher is better'}</span>
        <span>{hi.toFixed(2)}</span>
      </div>
    </div>
  );
};

interface HotspotFigureProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  hotspot?: Hotspot | null;
  lang: Lang;
  caption?: string;
}

/** Figure with an optional highlighted region (everything else dimmed) and a zoom button. */
export const HotspotFigure: React.FC<HotspotFigureProps> = ({ src, alt, width, height, hotspot, lang, caption }) => {
  const [zoom, setZoom] = useState(false);
  return (
    <figure className="bg-white rounded-2xl border border-emerald-950/[0.09] shadow-[0_1px_2px_rgba(6,78,59,0.04),0_18px_42px_-28px_rgba(6,78,59,0.2)] p-3 sm:p-4 lg:p-5">
      <div className="relative overflow-hidden rounded-xl bg-white">
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading="lazy"
          decoding="async"
          className="block w-full h-auto select-none"
          draggable={false}
        />
        {hotspot && (
          <div
            aria-hidden="true"
            className="absolute rounded-lg ring-2 ring-emerald-500/90 transition-[left,top,width,height] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] pointer-events-none"
            style={{
              left: `${hotspot.x}%`,
              top: `${hotspot.y}%`,
              width: `${hotspot.w}%`,
              height: `${hotspot.h}%`,
              boxShadow: '0 0 0 9999px rgba(244, 250, 246, 0.56), 0 0 24px rgba(16, 185, 129, 0.28)',
            }}
          />
        )}
      </div>
      <figcaption className="mt-3 pt-2.5 border-t border-emerald-950/[0.06] flex items-center justify-between gap-3 text-xs text-slate-500">
        <span className="truncate">{caption ?? ''}</span>
        <button
          type="button"
          onClick={() => setZoom(true)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-emerald-950/10 bg-[#F7FBF9] hover:bg-emerald-50 hover:border-emerald-600/35 font-medium text-emerald-800 transition-colors cursor-pointer shrink-0"
        >
          <Maximize2 className="w-3.5 h-3.5" aria-hidden="true" />
          {lang === 'zh' ? '放大查看' : 'Zoom'}
        </button>
      </figcaption>
      {zoom && <Lightbox src={src} alt={alt} lang={lang} onClose={() => setZoom(false)} />}
    </figure>
  );
};

interface LightboxProps {
  src: string;
  alt: string;
  lang: Lang;
  onClose: () => void;
}

export const Lightbox: React.FC<LightboxProps> = ({ src, alt, lang, onClose }) => {
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const onKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onKey]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      className="fixed inset-0 z-50 bg-[#05261C]/82 backdrop-blur-md flex items-center justify-center overflow-auto p-4 sm:p-10"
      onClick={onClose}
    >
      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        aria-label={lang === 'zh' ? '关闭' : 'Close'}
        className="fixed top-4 right-4 p-2.5 rounded-full bg-white/95 text-[#0C261B] hover:bg-white shadow-lg transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-emerald-400"
      >
        <X className="w-5 h-5" />
      </button>
      <img
        src={src}
        alt={alt}
        className="max-w-[1400px] w-full h-auto rounded-xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
};
