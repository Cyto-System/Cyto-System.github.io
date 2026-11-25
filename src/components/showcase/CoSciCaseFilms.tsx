import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize, Pause, Play, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import type { Lang } from '../../lib/cytoDomain';
import { COSCI_CASE_FILMS, chapterIndexAt, formatClock } from '../../lib/modelShowcase';
import { EyebrowHeading, useInView } from './shared';

export const CoSciCaseFilms: React.FC<{ lang: Lang }> = ({ lang }) => {
  const zh = lang === 'zh';
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [playerRef, inView] = useInView<HTMLDivElement>(false, 0.5);

  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [time, setTime] = useState(0);
  const userPausedRef = useRef(false);
  const wantPlayRef = useRef(false);

  const film = COSCI_CASE_FILMS[active];
  const duration = film.duration;
  const chapter = chapterIndexAt(film, time);

  const play = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    wantPlayRef.current = true;
    v.play().catch(() => {
      // Autoplay with sound can be blocked; retry muted.
      v.muted = true;
      setMuted(true);
      v.play().catch(() => undefined);
    });
  }, []);

  const pause = useCallback(() => {
    wantPlayRef.current = false;
    videoRef.current?.pause();
  }, []);

  // Autoplay (muted) while visible, unless the user paused.
  useEffect(() => {
    if (inView && !userPausedRef.current) play();
    if (!inView) videoRef.current?.pause();
  }, [inView, play]);

  // Switching films: keep playing state.
  useEffect(() => {
    setTime(0);
    const v = videoRef.current;
    if (!v) return;
    v.load();
    if (wantPlayRef.current) play();
  }, [active, play]);

  const selectFilm = (idx: number) => {
    setActive((idx + COSCI_CASE_FILMS.length) % COSCI_CASE_FILMS.length);
  };

  const seek = (t: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, Math.min(duration - 0.1, t));
    setTime(v.currentTime);
  };

  const togglePlay = () => {
    if (playing) {
      userPausedRef.current = true;
      pause();
    } else {
      userPausedRef.current = false;
      play();
    }
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
    if (!v.muted && v.paused) {
      userPausedRef.current = false;
      play();
    }
  };

  const fullscreen = () => {
    const el = stageRef.current as (HTMLDivElement & { webkitRequestFullscreen?: () => void }) | null;
    if (!el) return;
    if (el.requestFullscreen) el.requestFullscreen().catch(() => undefined);
    else el.webkitRequestFullscreen?.();
  };

  const onProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    seek(((e.clientX - rect.left) / rect.width) * duration);
  };

  return (
    <div className="space-y-7 sm:space-y-8">
      <EyebrowHeading
        id="cosci-cases"
        index="03"
        kicker="CASE STUDIES"
        title={zh ? '五项研究案例' : 'Five case studies'}
        accent={zh ? '算法开发与开放式生信研究' : 'Algorithm development and open-ended bioinformatics inquiry'}
      />

      {/* Case selector: horizontal snap strip on mobile, 5-up grid on lg+ */}
      <div
        role="tablist"
        aria-label={zh ? '案例影片' : 'Case films'}
        className="flex overflow-x-auto snap-x gap-2.5 pb-1 -mx-1 px-1 sm:mx-0 sm:px-0 sm:pb-0 sm:grid sm:grid-cols-3 lg:grid-cols-5 sm:gap-3 cyto-no-scrollbar"
      >
        {COSCI_CASE_FILMS.map((c, i) => {
          const selected = i === active;
          return (
            <button
              key={c.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => selectFilm(i)}
              className={`group w-[172px] shrink-0 snap-start sm:w-auto text-left rounded-xl overflow-hidden border bg-white transition-all duration-200 cursor-pointer ${
                selected
                  ? 'border-emerald-600 shadow-[0_0_0_2px_rgba(16,185,129,0.18),0_10px_24px_-16px_rgba(6,78,59,0.35)]'
                  : 'border-emerald-950/[0.09] hover:border-emerald-600/45 hover:-translate-y-0.5'
              }`}
            >
              <span className="block aspect-[16/9] overflow-hidden bg-[#F2F7F4]">
                <img
                  src={c.cover}
                  alt=""
                  loading="lazy"
                  className={`w-full h-full object-cover transition-transform duration-500 ${selected ? 'scale-[1.03]' : 'group-hover:scale-[1.03]'}`}
                />
              </span>
              <span className="flex items-center justify-between gap-2 px-3 py-2 text-xs">
                <span className={`truncate ${selected ? 'text-[#0C261B] font-semibold' : 'text-slate-600'}`}>
                  <span className={`font-mono mr-1.5 ${selected ? 'text-emerald-700' : 'text-slate-400'}`}>{c.index}</span>
                  {c.short[lang]}
                </span>
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors ${selected ? 'bg-emerald-500' : 'bg-slate-300'}`}
                  aria-hidden="true"
                />
              </span>
            </button>
          );
        })}
      </div>

      {/* Unified light gallery frame bridging the dark cinema player and the light section surface */}
      <div className="rounded-2xl bg-white border border-emerald-950/[0.09] shadow-[0_2px_4px_rgba(6,78,59,0.03),0_22px_52px_-28px_rgba(6,78,59,0.18)] p-3.5 sm:p-5 lg:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-7 items-stretch">
          {/* Dark Cinema Player */}
          <div
            ref={stageRef}
            className="lg:col-span-8 rounded-xl overflow-hidden bg-[#07291E] text-white ring-1 ring-emerald-950/20 shadow-[0_18px_40px_-24px_rgba(7,41,30,0.65)] flex flex-col justify-between"
          >
            <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-[#052118]/75 border-b border-white/[0.08] font-mono text-[11px] tracking-[0.12em]">
              <span className="flex items-center gap-2 text-emerald-200/80 truncate">
                <span className="inline-flex items-center gap-1 shrink-0" aria-hidden="true">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/55" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/25" />
                </span>
                <span className="truncate">CYTO.COSCIENTIST / CASE FILM</span>
              </span>
              <span className="text-emerald-200 shrink-0">
                {film.track === 'method' ? (zh ? '方法开发' : 'METHOD DEVELOPMENT') : zh ? '队列研究' : 'COHORT INVESTIGATION'}
              </span>
            </div>

            <div ref={playerRef} className="relative bg-[#041A12] aspect-video">
              <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-contain bg-white"
                src={film.video}
                poster={film.cover}
                muted={muted}
                playsInline
                preload="metadata"
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
                onEnded={() => selectFilm(active + 1)}
                onClick={togglePlay}
              />
              {!playing && (
                <button
                  type="button"
                  onClick={togglePlay}
                  aria-label={zh ? '播放' : 'Play'}
                  className="absolute inset-0 m-auto w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#07291E]/85 hover:bg-[#07291E] ring-1 ring-white/25 backdrop-blur-xs flex items-center justify-center shadow-lg transition-transform hover:scale-105 cursor-pointer"
                >
                  <Play className="w-6 h-6 ml-0.5 text-emerald-200" />
                </button>
              )}
            </div>

            {/* Controls */}
            <div className="px-3.5 sm:px-4 pt-3 pb-4 space-y-3 bg-[#06241A]">
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                <button
                  type="button"
                  onClick={togglePlay}
                  aria-label={playing ? (zh ? '暂停' : 'Pause') : zh ? '播放' : 'Play'}
                  className="w-8 h-8 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/25 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                >
                  {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => seek(0)}
                  aria-label={zh ? '从头播放' : 'Restart'}
                  className="w-8 h-8 rounded-lg border border-white/12 hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono text-[11px] text-emerald-100/80 tabular-nums w-[86px] sm:w-[92px] shrink-0">
                  {formatClock(time)} / {formatClock(duration)}
                </span>
                <div
                  role="slider"
                  tabIndex={0}
                  aria-label={zh ? '播放进度' : 'Playback position'}
                  aria-valuemin={0}
                  aria-valuemax={Math.round(duration)}
                  aria-valuenow={Math.round(time)}
                  onClick={onProgressClick}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowRight') seek(time + 5);
                    if (e.key === 'ArrowLeft') seek(time - 5);
                  }}
                  className="relative flex-1 min-w-[110px] h-5 cursor-pointer group"
                >
                  <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 rounded-full bg-white/15" />
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-1 rounded-full bg-emerald-400"
                    style={{ width: `${(time / duration) * 100}%` }}
                  />
                  {film.chapters.slice(1).map((c) => (
                    <span
                      key={c.start}
                      className="absolute top-1/2 -translate-y-1/2 w-0.5 h-2.5 bg-[#06241A]"
                      style={{ left: `${(c.start / duration) * 100}%` }}
                      aria-hidden="true"
                    />
                  ))}
                  <span
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-emerald-300 shadow"
                    style={{ left: `${(time / duration) * 100}%` }}
                    aria-hidden="true"
                  />
                </div>
                <div className="flex items-center gap-1.5 ml-auto sm:ml-0 shrink-0">
                  <button
                    type="button"
                    onClick={toggleMute}
                    aria-label={muted ? (zh ? '打开声音' : 'Unmute') : zh ? '静音' : 'Mute'}
                    className="w-8 h-8 rounded-lg border border-white/12 hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => selectFilm(active - 1)}
                    aria-label={zh ? '上一个案例' : 'Previous case'}
                    className="w-8 h-8 rounded-lg border border-white/12 hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => selectFilm(active + 1)}
                    aria-label={zh ? '下一个案例' : 'Next case'}
                    className="w-8 h-8 rounded-lg border border-white/12 hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={fullscreen}
                    aria-label={zh ? '全屏' : 'Fullscreen'}
                    className="w-8 h-8 rounded-lg border border-white/12 hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Maximize className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {film.chapters.map((c, i) => {
                  const end = film.chapters[i + 1]?.start ?? duration;
                  const fill = time >= end ? 100 : time <= c.start ? 0 : ((time - c.start) / (end - c.start)) * 100;
                  const isCurrent = i === chapter;
                  return (
                    <button
                      key={c.start}
                      type="button"
                      onClick={() => {
                        seek(c.start + 0.05);
                        if (!playing) {
                          userPausedRef.current = false;
                          play();
                        }
                      }}
                      className={`relative overflow-hidden text-left px-3 py-2 rounded-lg text-xs border transition-colors cursor-pointer ${
                        isCurrent
                          ? 'border-emerald-400/70 text-white bg-white/[0.04]'
                          : 'border-white/10 text-emerald-100/65 hover:text-emerald-50 hover:border-white/20'
                      }`}
                    >
                      <span className="absolute inset-y-0 left-0 bg-emerald-400/18" style={{ width: `${fill}%` }} aria-hidden="true" />
                      <span className="relative flex items-baseline gap-1.5">
                        <span className={`font-mono text-[11px] ${isCurrent ? 'text-emerald-300' : 'opacity-70'}`}>
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span className="truncate">{c.label[lang]}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Narrative Column (framed within the unified light stage) */}
          <div
            className="lg:col-span-4 lg:border-l lg:border-emerald-950/[0.08] lg:pl-7 pt-1 lg:pt-0 flex flex-col justify-center gap-5"
            aria-live="polite"
          >
            <div className="space-y-4">
              <div>
                <p className="font-mono text-[11px] tracking-[0.14em] text-emerald-800/70">
                  {film.index} / {film.dataset.toUpperCase()}
                </p>
                <h4 className="mt-2 text-xl sm:text-2xl font-bold leading-snug text-[#0C261B]">{film.title[lang]}</h4>
                <p className="mt-1.5 text-[14.5px] font-semibold text-emerald-700 leading-snug">{film.headline[lang]}</p>
              </div>

              {film.metrics.length > 0 && (
                <div className="grid grid-cols-2 gap-3 py-3.5 border-y border-emerald-950/[0.08]">
                  {film.metrics.map((m) => (
                    <div key={m.value} className="rounded-lg bg-[#F7FBF9] border border-emerald-950/[0.06] px-3 py-2.5">
                      <div className="font-mono text-xl sm:text-[22px] font-bold tabular-nums text-emerald-700 leading-tight">
                        {m.value}
                      </div>
                      <div className="text-[11.5px] text-slate-500 mt-1 leading-snug">{m.label[lang]}</div>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-xs text-slate-500 leading-[1.65]">{film.data[lang]}</p>

              <div className="pt-1">
                <div className="text-xs font-semibold text-emerald-800">{zh ? '发现' : 'Finding'}</div>
                <p className="mt-1 text-[13px] text-slate-600 leading-[1.68]">{film.significance[lang]}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
