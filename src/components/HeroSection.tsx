import React, { Suspense, lazy } from 'react';
import { ArrowRight, ArrowUpRight, Github } from 'lucide-react';
import { Lang } from '../lib/cytoDomain';
import { CYTO_TASK_SCENARIOS } from '../lib/bioTaskScenarios';

const LazyThreeTaskWindowStage = lazy(() => import('./ThreeTaskWindowStage'));
const CYTO_GITHUB_ORG_URL = 'https://github.com/Cyto-System';

interface HeroSectionProps {
  lang: Lang;
  onChangeLang: (lang: Lang) => void;
  pausedByScroll?: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  lang,
  onChangeLang,
  pausedByScroll = false,
}) => {
  const defaultScenario = CYTO_TASK_SCENARIOS[0];

  return (
    <section
      id="home"
      className="cyto-hero-canvas text-[#0C261B] relative lg:min-h-[calc(100vh-3.5rem)] flex items-center border-b border-emerald-950/[0.08]"
    >
      <div className="w-full max-w-[1320px] mx-auto px-5 sm:px-8 py-8 sm:py-10 lg:py-8 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(320px,380px)_1fr] gap-8 xl:gap-12 items-stretch lg:min-h-[640px] lg:h-[calc(100vh-7.5rem)] lg:max-h-[780px]">
          {/* LEFT COLUMN: Clean Minimal Brand Title, Single Concise Introduction & 2 Preserved Jump Buttons */}
          <div className="flex flex-col justify-center gap-6 sm:gap-7 py-2 lg:py-6">
            {/* Compact Language Switch */}
            <div className="flex items-center">
              <div
                role="group"
                aria-label={lang === 'zh' ? '页面语言切换' : 'Page language selector'}
                className="inline-flex items-center p-0.5 rounded-lg bg-emerald-950/[0.05] border border-emerald-950/[0.06] shrink-0"
              >
                <button
                  type="button"
                  aria-pressed={lang === 'zh'}
                  onClick={() => onChangeLang('zh')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer whitespace-nowrap ${
                    lang === 'zh'
                      ? 'bg-white text-[#0C261B] font-semibold shadow-2xs'
                      : 'text-slate-600 hover:text-[#0C261B]'
                  }`}
                >
                  中文
                </button>
                <button
                  type="button"
                  aria-pressed={lang === 'en'}
                  onClick={() => onChangeLang('en')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer whitespace-nowrap ${
                    lang === 'en'
                      ? 'bg-white text-[#0C261B] font-semibold shadow-2xs'
                      : 'text-slate-600 hover:text-[#0C261B]'
                  }`}
                >
                  EN
                </button>
              </div>
            </div>

            {/* Brand Name + Virtual Cell System + Concise Description */}
            <div className="space-y-4">
              <h1 className="text-[clamp(2.35rem,3.6vw,3.45rem)] font-bold tracking-tight leading-[1.08] text-[#0C261B] [text-wrap:balance]">
                <span className="block">Cyto</span>
                <span className="cyto-emerald-text-gradient block mt-1.5">
                  {lang === 'zh' ? '虚拟细胞系统' : 'Virtual Cell System'}
                </span>
              </h1>

              <p className="text-[15px] sm:text-base text-slate-600 leading-[1.7] max-w-[36ch] [text-wrap:pretty]">
                {lang === 'zh'
                  ? '面向生命科学的多尺度时空细胞模型家族——读懂细胞的状态，推演它的变化与干预响应，自主提出并验证科学问题。'
                  : 'A multi-scale spatiotemporal virtual cell model family—decoding cellular states, simulating intervention responses, and autonomously validating scientific questions.'}
              </p>
            </div>

            {/* Two Preserved Action / Jump Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <a
                href={CYTO_GITHUB_ORG_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#0C261B] hover:bg-emerald-800 text-white text-sm font-medium shadow-[0_6px_18px_-10px_rgba(6,78,59,0.55)] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-600"
              >
                <Github className="w-4 h-4 text-emerald-300" aria-hidden="true" />
                <span>{lang === 'zh' ? '访问 GitHub' : 'Explore on GitHub'}</span>
                <ArrowUpRight className="w-4 h-4 text-emerald-300" aria-hidden="true" />
              </a>

              <a
                href="#architecture"
                className="group inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-emerald-950/14 bg-white/95 hover:bg-emerald-50/75 hover:border-emerald-600/35 text-[#0C261B] text-sm font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-600"
              >
                <span>{lang === 'zh' ? '查看模型家族' : 'Explore the model family'}</span>
                <ArrowRight className="w-4 h-4 text-emerald-700 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* RIGHT COLUMN: Async Lazy-Loaded 3D Transparent Tech-Glass Virtual Cell Model Stage */}
          <div className="flex-1 min-w-0 flex flex-col h-[340px] sm:h-[440px] lg:h-full">
            <Suspense
              fallback={
                <div
                  aria-busy="true"
                  className="w-full flex-1 h-full min-h-[320px] sm:min-h-[420px] lg:min-h-[540px] rounded-2xl border border-emerald-900/12 bg-gradient-to-b from-[#E8F7F0] via-[#F4FBF7] to-white flex items-center justify-center p-6"
                >
                  <div className="text-xs font-mono text-emerald-800/70">
                    {lang === 'zh' ? '正在加载三维虚拟细胞视窗…' : 'Loading 3D Virtual Cell Stage…'}
                  </div>
                </div>
              }
            >
              <LazyThreeTaskWindowStage
                scenario={defaultScenario}
                lang={lang}
                pausedByScroll={pausedByScroll}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </section>
  );
};
