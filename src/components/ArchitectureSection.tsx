import React from 'react';
import { ArrowUpRight, ChevronDown, ChevronRight } from 'lucide-react';
import { CYTO_MODULES, CYTO_TIERS, CytoModule, Lang, TierId } from '../lib/cytoDomain';
import { MODULE_TO_SHOWCASE, openShowcaseModel } from '../lib/modelShowcase';

interface ArchitectureSectionProps {
  lang: Lang;
}

const TIER_STYLE: Record<
  TierId,
  {
    box: string;
    title: string;
    question: string;
    divider: string;
    activeTile: string;
    inactiveTile: string;
    tileName: string;
    tileRole: string;
    badge: string;
  }
> = {
  '01': {
    box: 'border-emerald-900/[0.11] bg-[#F7FCF9] shadow-[0_1px_2px_rgba(6,78,59,0.04)]',
    title: 'text-[#0C261B]',
    question: 'text-slate-500',
    divider: 'border-emerald-950/[0.07]',
    activeTile:
      'bg-white border-emerald-700/20 shadow-[0_1px_2px_rgba(6,78,59,0.04)] hover:border-emerald-600/60 hover:shadow-[0_10px_24px_-14px_rgba(5,150,105,0.32)] hover:-translate-y-0.5',
    inactiveTile: 'bg-white/65 border-dashed border-emerald-950/12 opacity-75',
    tileName: 'text-emerald-950',
    tileRole: 'text-slate-500',
    badge: 'bg-emerald-950/[0.04] text-slate-500',
  },
  '02': {
    box: 'border-emerald-600/22 bg-[#EAF8F1]/85 shadow-[0_1px_2px_rgba(6,78,59,0.04)]',
    title: 'text-[#064E3B]',
    question: 'text-emerald-900/70',
    divider: 'border-emerald-800/[0.1]',
    activeTile:
      'bg-white border-emerald-700/18 shadow-[0_1px_2px_rgba(6,78,59,0.04)] hover:border-emerald-600/65 hover:shadow-[0_10px_24px_-14px_rgba(5,150,105,0.32)] hover:-translate-y-0.5',
    inactiveTile: 'bg-white/60 border-dashed border-emerald-800/15 opacity-75',
    tileName: 'text-[#065F46]',
    tileRole: 'text-slate-500',
    badge: 'bg-emerald-900/[0.06] text-emerald-900/60',
  },
  '03': {
    box: 'border-emerald-800/80 bg-[radial-gradient(circle_at_88%_14%,rgba(16,185,129,0.22),transparent_55%),linear-gradient(165deg,#083526_0%,#052118_100%)] shadow-[0_16px_38px_-22px_rgba(5,33,24,0.65)]',
    title: 'text-white',
    question: 'text-emerald-100/75',
    divider: 'border-white/10',
    activeTile:
      'bg-white/[0.07] border-emerald-400/35 hover:bg-white/[0.11] hover:border-emerald-300/75 hover:-translate-y-0.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]',
    inactiveTile: 'bg-white/[0.04] border-dashed border-emerald-400/20 opacity-75',
    tileName: 'text-emerald-100',
    tileRole: 'text-emerald-100/75',
    badge: 'bg-white/10 text-emerald-200/75',
  },
};

const ModuleTile: React.FC<{ mod: CytoModule; tier: TierId; lang: Lang; stretch?: boolean }> = ({
  mod,
  tier,
  lang,
  stretch = false,
}) => {
  const style = TIER_STYLE[tier];
  const target = MODULE_TO_SHOWCASE[mod.id];
  const zh = lang === 'zh';

  const body = (
    <>
      <span className="flex items-center justify-between gap-2">
        <span className={`text-sm font-semibold tracking-tight ${style.tileName}`}>{mod.name}</span>
        {target ? (
          <span
            className={`inline-flex items-center justify-center w-6 h-6 rounded-md transition-all duration-200 shrink-0 ${
              tier === '03'
                ? 'bg-emerald-400/15 text-emerald-300 group-hover:bg-emerald-400/25'
                : 'bg-emerald-600/[0.08] text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white'
            }`}
            aria-hidden="true"
          >
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        ) : (
          <span className={`px-2 py-0.5 rounded text-[10.5px] font-mono shrink-0 ${style.badge}`}>
            {mod.status === 'in_dev' ? (zh ? '研发中' : 'R&D') : zh ? '待发布' : 'Pending'}
          </span>
        )}
      </span>
      <span className={`block text-xs mt-1.5 leading-relaxed ${style.tileRole}`}>{mod.shortRole[lang]}</span>
    </>
  );

  if (!target) {
    return (
      <div aria-disabled="true" className={`rounded-xl border px-3.5 py-3 ${style.inactiveTile}`}>
        {body}
      </div>
    );
  }
  return (
    <a
      href={`#model-${target}`}
      onClick={(e) => {
        e.preventDefault();
        openShowcaseModel(target);
      }}
      className={`group block rounded-xl border px-3.5 py-3 transition-all duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 ${
        style.activeTile
      } ${stretch ? 'py-4 px-4' : ''}`}
    >
      {body}
    </a>
  );
};

export const ArchitectureSection: React.FC<ArchitectureSectionProps> = React.memo(({ lang }) => {
  const zh = lang === 'zh';
  return (
    <section
      id="architecture"
      className="cyto-defer-section py-20 sm:py-24 bg-white border-b border-emerald-950/[0.08]"
    >
      <div className="max-w-[1320px] mx-auto px-5 sm:px-8">
        <p className="font-mono text-xs tracking-[0.2em] text-emerald-800/70 mb-4">01. THE MODEL FAMILY</p>
        <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-bold tracking-tight leading-[1.18] [text-wrap:balance] mb-10 sm:mb-12">
          <span className="block text-[#0C261B]">
            {zh ? '读懂细胞状态，推演演化与干预，' : 'Read cellular states, simulate dynamics and interventions,'}
          </span>
          <span className="block text-emerald-700 mt-1">
            {zh ? '在多尺度关联中完成闭环科学发现。' : 'and close the loop into autonomous scientific discovery.'}
          </span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_28px_1fr_28px_1fr] gap-2 md:gap-3 items-stretch">
          {CYTO_TIERS.map((tier, i) => {
            const style = TIER_STYLE[tier.id];
            const mods = CYTO_MODULES.filter((m) => m.tier === tier.id);
            const isSingleCapstone = mods.length === 1;
            return (
              <React.Fragment key={tier.id}>
                {i > 0 && (
                  <>
                    <div className="hidden md:flex items-center justify-center" aria-hidden="true">
                      <span className="w-7 h-7 rounded-full border border-emerald-900/12 bg-white shadow-2xs flex items-center justify-center text-emerald-600">
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                    <div className="flex md:hidden items-center justify-center py-0.5" aria-hidden="true">
                      <span className="w-6 h-6 rounded-full border border-emerald-900/12 bg-white flex items-center justify-center text-emerald-600">
                        <ChevronDown className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </>
                )}
                <div className={`relative overflow-hidden rounded-2xl border p-5 sm:p-6 flex flex-col gap-4 ${style.box}`}>
                  {isSingleCapstone && (
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 220 220"
                      fill="none"
                      className="hidden md:block pointer-events-none select-none absolute -right-8 -bottom-10 w-48 h-48 text-emerald-300/[0.12]"
                    >
                      <circle cx="110" cy="110" r="96" stroke="currentColor" strokeWidth="1" strokeDasharray="4 6" />
                      <circle cx="110" cy="110" r="64" stroke="currentColor" strokeWidth="1" />
                      <circle cx="110" cy="110" r="32" stroke="currentColor" strokeWidth="1.2" />
                      <circle cx="110" cy="110" r="6" fill="currentColor" />
                      <path d="M110 14V44M110 176V206M14 110H44M176 110H206" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                    </svg>
                  )}
                  <div className={`relative pb-3.5 border-b ${style.divider}`}>
                    <div className={`text-base font-bold tracking-tight ${style.title}`}>{tier.title[lang]}</div>
                    <p className={`text-xs mt-1 leading-relaxed ${style.question}`}>{tier.question[lang]}</p>
                  </div>
                  <div className="relative flex-1 flex flex-col gap-2.5">
                    {mods.map((mod) => (
                      <ModuleTile
                        key={mod.id}
                        mod={mod}
                        tier={tier.id}
                        lang={lang}
                        stretch={isSingleCapstone}
                      />
                    ))}
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </section>
  );
});
