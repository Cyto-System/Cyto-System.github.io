import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { Lang } from '../lib/cytoDomain';
import { SHOWCASE_HASH_PREFIX, SHOWCASE_MODELS, ShowcaseModelId, modelIdFromHash } from '../lib/modelShowcase';
import { CoScientistPanel } from './showcase/CoScientistPanel';
import { IdentityPanel, PerturbationPanel, SpatialPanel } from './showcase/ModelPanels';

interface ModelShowcaseSectionProps {
  lang: Lang;
}

const DEFAULT_MODEL: ShowcaseModelId = 'coscientist';

/** Four Cyto models share one entry bar; the panel below switches per model. */
export const ModelShowcaseSection: React.FC<ModelShowcaseSectionProps> = React.memo(({ lang }) => {
  const zh = lang === 'zh';
  const sectionRef = useRef<HTMLElement | null>(null);
  const tablistRef = useRef<HTMLDivElement | null>(null);
  const tabRefs = useRef<Partial<Record<ShowcaseModelId, HTMLButtonElement | null>>>({});
  const [active, setActive] = useState<ShowcaseModelId>(
    () => (typeof window !== 'undefined' && modelIdFromHash(window.location.hash)) || DEFAULT_MODEL
  );

  const scrollToTop = useCallback(() => {
    const el = sectionRef.current;
    if (!el) return;
    if (el.getBoundingClientRect().top < 0) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  useEffect(() => {
    const onHash = (behavior: ScrollBehavior) => {
      const id = modelIdFromHash(window.location.hash);
      if (id) {
        setActive(id);
        sectionRef.current?.scrollIntoView({ behavior, block: 'start' });
      }
    };
    const onHashChange = () => onHash('smooth');
    let timer: number | undefined;
    if (modelIdFromHash(window.location.hash)) {
      timer = window.setTimeout(() => onHash('auto'), 120);
    }
    window.addEventListener('hashchange', onHashChange);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('hashchange', onHashChange);
    };
  }, []);

  // Keep active tab visible horizontally inside the mobile strip without ever scrolling the page vertically.
  useEffect(() => {
    const list = tablistRef.current;
    const btn = tabRefs.current[active];
    if (!list || !btn || window.innerWidth >= 768) return;
    const targetLeft = Math.max(0, btn.offsetLeft - (list.clientWidth - btn.offsetWidth) / 2);
    list.scrollTo({ left: targetLeft, behavior: 'auto' });
  }, [active]);

  const select = (id: ShowcaseModelId) => {
    setActive(id);
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `${SHOWCASE_HASH_PREFIX}${id}`);
    }
    scrollToTop();
  };

  return (
    <section
      id="model-family"
      ref={sectionRef}
      data-active-model={active}
      className="relative bg-[#F4FAF6] border-b border-emerald-950/[0.08]"
    >
      <div className="max-w-[1320px] mx-auto px-5 sm:px-8 pt-16 sm:pt-20 pb-5">
        <p className="font-mono text-xs tracking-[0.2em] text-emerald-800/70">02. MODEL DEEP DIVE</p>
      </div>

      {/* Shared sticky entry bar: single-row scrollable strip on mobile, 4-column editorial bar on md+ */}
      <div className="sticky top-14 z-30 bg-[#F4FAF6]/94 backdrop-blur-md border-y border-emerald-950/[0.08] shadow-[0_6px_20px_-16px_rgba(6,78,59,0.25)]">
        <div className="max-w-[1320px] mx-auto px-3 sm:px-8">
          <div
            ref={tablistRef}
            role="tablist"
            aria-label={zh ? 'Cyto 模型切换' : 'Cyto models'}
            className="flex md:grid md:grid-cols-4 overflow-x-auto md:overflow-visible cyto-no-scrollbar snap-x md:divide-x md:divide-emerald-950/[0.06]"
          >
            {SHOWCASE_MODELS.map((m) => {
              const selected = m.id === active;
              return (
                <button
                  key={m.id}
                  ref={(el) => {
                    tabRefs.current[m.id] = el;
                  }}
                  id={`model-tab-${m.id}`}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-controls={`model-panel-${m.id}`}
                  onClick={() => select(m.id)}
                  className={`relative shrink-0 snap-start text-left px-3.5 md:px-5 py-3 md:py-3.5 transition-colors cursor-pointer whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-emerald-600 ${
                    selected
                      ? 'bg-white/75 text-[#0C261B]'
                      : 'text-slate-500 hover:text-[#0C261B] hover:bg-white/40'
                  }`}
                >
                  <span className="flex items-baseline gap-2">
                    <span className={`font-mono text-[11px] sm:text-xs ${selected ? 'text-emerald-700 font-semibold' : 'text-slate-400'}`}>
                      {m.index}
                    </span>
                    <span className="text-[13.5px] sm:text-[15px] font-semibold tracking-tight">{m.name}</span>
                  </span>
                  <span className="hidden md:block mt-0.5 font-mono text-[10.5px] text-slate-400">{m.release[lang]}</span>
                  <span
                    aria-hidden="true"
                    className={`absolute inset-x-0 bottom-0 h-[2px] transition-colors ${
                      selected ? 'bg-emerald-600' : 'bg-transparent'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div
        key={active}
        id={`model-panel-${active}`}
        role="tabpanel"
        aria-labelledby={`model-tab-${active}`}
        className="cyto-panel-enter max-w-[1320px] mx-auto px-5 sm:px-8 py-12 sm:py-16"
      >
        {active === 'spatial' && <SpatialPanel lang={lang} />}
        {active === 'identity' && <IdentityPanel lang={lang} />}
        {active === 'perturbation' && <PerturbationPanel lang={lang} />}
        {active === 'coscientist' && <CoScientistPanel lang={lang} />}
      </div>
    </section>
  );
});
