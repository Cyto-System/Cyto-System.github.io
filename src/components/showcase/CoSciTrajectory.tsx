import React, { useState } from 'react';
import type { Lang } from '../../lib/cytoDomain';
import { COSCI_TRAJECTORY } from '../../lib/modelShowcase';
import { EyebrowHeading, HotspotFigure, prefersReducedMotion, useAutoStep, useInView } from './shared';

export const CoSciTrajectory: React.FC<{ lang: Lang }> = ({ lang }) => {
  const zh = lang === 'zh';
  const [wrapRef, inView] = useInView<HTMLDivElement>(false, 0.3);
  const [userPicked, setUserPicked] = useState(false);
  const [stage, setStage] = useAutoStep(COSCI_TRAJECTORY.length, 3400, inView && !userPicked && !prefersReducedMotion());
  const current = COSCI_TRAJECTORY[stage];

  return (
    <div ref={wrapRef} className="space-y-6">
      <EyebrowHeading
        id="cosci-trajectory"
        index="02"
        kicker="ONE POSSIBLE TRAJECTORY"
        title={zh ? '一条研究路线是一棵树，' : 'A research route is a tree;'}
        accent={zh ? '分析不支持时沿回边退回。' : 'when analysis disagrees, it walks back.'}
      />

      <div
        role="tablist"
        aria-label={zh ? '研究轨迹阶段' : 'Trajectory stages'}
        className="grid grid-cols-2 md:grid-cols-5 gap-2"
      >
        {COSCI_TRAJECTORY.map((s, i) => {
          const selected = i === stage;
          return (
            <button
              key={s.index}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => {
                setUserPicked(true);
                setStage(i);
              }}
              className={`last:col-span-2 md:last:col-span-1 text-left px-3.5 py-2.5 rounded-xl border text-xs transition-all cursor-pointer ${
                selected
                  ? s.revisit
                    ? 'bg-[#FDF1EE] border-[#C2584A]/55 text-[#7A2A20] font-semibold shadow-[0_4px_14px_-8px_rgba(194,88,74,0.45)]'
                    : 'bg-[#0C261B] border-[#0C261B] text-white font-semibold shadow-[0_4px_14px_-8px_rgba(6,78,59,0.55)]'
                  : 'bg-white border-emerald-950/[0.09] text-slate-600 hover:border-emerald-600/40 hover:text-[#0C261B]'
              }`}
            >
              <span className={`font-mono mr-1.5 ${selected ? (s.revisit ? 'text-[#C2584A]' : 'text-emerald-300') : 'text-slate-400'}`}>
                {s.index}
              </span>
              {s.label[lang]}
            </button>
          );
        })}
      </div>

      <HotspotFigure
        src="/assets/coscientist/cycle-b.png"
        alt={zh ? '一条可能的研究轨迹' : 'One possible research trajectory'}
        width={2400}
        height={585}
        hotspot={current.hotspot}
        lang={lang}
      />
      <div
        className={`rounded-xl border px-4 sm:px-5 py-3.5 min-h-[3.75rem] flex items-center transition-colors ${
          current.revisit
            ? 'bg-[#FDF4F2] border-[#C2584A]/25 text-[#7A2A20]'
            : 'bg-white border-emerald-950/[0.08] text-slate-600 shadow-[0_1px_2px_rgba(6,78,59,0.03)]'
        }`}
        aria-live="polite"
      >
        <p className="text-[13px] leading-[1.68]">{current.caption[lang]}</p>
      </div>
    </div>
  );
};
