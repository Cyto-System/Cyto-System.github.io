import React, { useState } from 'react';
import type { Lang } from '../../lib/cytoDomain';
import { COSCI_COMPONENTS, COSCI_COMPONENT_GROUPS, CoSciComponent } from '../../lib/modelShowcase';
import { EyebrowHeading, HotspotFigure, prefersReducedMotion, useAutoStep, useInView } from './shared';

const GROUP_ORDER: CoSciComponent['group'][] = ['loop', 'support'];

export const CoSciArchitecture: React.FC<{ lang: Lang }> = ({ lang }) => {
  const zh = lang === 'zh';
  const [wrapRef, inView] = useInView<HTMLDivElement>(false, 0.2);
  const [userPicked, setUserPicked] = useState(false);
  const [active, setActive] = useAutoStep(COSCI_COMPONENTS.length, 3800, inView && !userPicked && !prefersReducedMotion());
  const current = COSCI_COMPONENTS[active];

  const pick = (idx: number) => {
    setUserPicked(true);
    setActive(idx);
  };

  return (
    <div ref={wrapRef} className="space-y-8">
      <EyebrowHeading
        id="cosci-architecture"
        index="01"
        kicker="THE ARCHITECTURE"
        title={zh ? '循环探索结合 meta-review 纠偏，' : 'Iterative exploration paired with meta-review correction,'}
        accent={zh ? '在固定参数下实现任务内递归自我改进（RSI）。' : 'driving within-task recursive self-improvement under fixed weights.'}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        <div className="lg:col-span-4 space-y-5">
          {GROUP_ORDER.map((group) => (
            <div key={group}>
              <p className="font-mono text-[11px] tracking-[0.14em] text-emerald-800/70 pb-2 border-b border-emerald-950/10">
                {COSCI_COMPONENT_GROUPS[group][lang]}
              </p>
              <ul className="mt-2 space-y-1">
                {COSCI_COMPONENTS.map((c, idx) =>
                  c.group !== group ? null : (
                    <li key={c.id}>
                      <button
                        type="button"
                        aria-pressed={idx === active}
                        onClick={() => pick(idx)}
                        onMouseEnter={() => pick(idx)}
                        className={`relative w-full text-left flex gap-3 px-3 py-2.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                          idx === active
                            ? 'bg-white border-emerald-600/35 shadow-[0_6px_18px_-12px_rgba(5,150,105,0.35)]'
                            : 'bg-transparent border-transparent hover:bg-white/65 hover:border-emerald-950/[0.08]'
                        }`}
                      >
                        <span
                          aria-hidden="true"
                          className={`absolute left-0 top-2.5 bottom-2.5 w-[3px] rounded-r-full transition-colors ${
                            idx === active ? 'bg-emerald-600' : 'bg-transparent'
                          }`}
                        />
                        <span className={`font-mono text-xs pt-0.5 tabular-nums ${idx === active ? 'text-emerald-700 font-semibold' : 'text-slate-400'}`}>
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold text-[#0C261B]">{c.name[lang]}</span>
                          <span className="block text-xs text-slate-500 mt-0.5 leading-snug">{c.gist[lang]}</span>
                        </span>
                      </button>
                    </li>
                  )
                )}
              </ul>
            </div>
          ))}
        </div>

        <div className="lg:col-span-8 space-y-4">
          <HotspotFigure
            src="/assets/coscientist/cycle-a.png"
            alt={zh ? 'CytoCoScientist 系统架构图' : 'CytoCoScientist architecture'}
            width={2400}
            height={1490}
            hotspot={current.hotspot}
            lang={lang}
          />
          <div
            className="rounded-xl border border-emerald-950/[0.08] bg-white px-4 sm:px-5 py-3.5 shadow-[0_1px_2px_rgba(6,78,59,0.03)] min-h-[4.25rem] flex items-center"
            aria-live="polite"
          >
            <p className="text-[13px] leading-[1.68] text-slate-600">
              <span className="font-semibold text-[#0C261B] mr-2">{current.name[lang]}</span>
              {current.detail[lang]}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
