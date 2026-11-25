import React from 'react';
import { ArrowUpRight, Github } from 'lucide-react';
import { Lang } from '../lib/cytoDomain';
import { openShowcaseModel } from '../lib/modelShowcase';

const CYTO_GITHUB_ORG_URL = 'https://github.com/Cyto-System';

interface EcosystemAndFooterProps {
  lang: Lang;
}

export const EcosystemAndFooter: React.FC<EcosystemAndFooterProps> = React.memo(({
  lang,
}) => {
  return (
    <>
      {/* Deep-Emerald Closing Banner */}
      <section className="cyto-emerald-deep-grid text-white py-20 sm:py-24 border-t border-emerald-800/40">
        <div className="max-w-[1320px] mx-auto px-5 sm:px-8 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <p className="font-mono text-xs tracking-[0.2em] text-emerald-200/75">
              03. KEEP EXPLORING SPATIOTEMPORAL CELLS
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight leading-[1.18] [text-wrap:balance]">
              {lang === 'zh' ? (
                <>
                  <span className="block text-white">下一次生命科学发现，</span>
                  <span className="block text-emerald-300 mt-1">
                    始于可推演的多尺度时空细胞。
                  </span>
                </>
              ) : (
                <>
                  <span className="block text-white">The next biological discovery</span>
                  <span className="block text-emerald-300 mt-1">
                    begins with simulatable spatiotemporal cells.
                  </span>
                </>
              )}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-5">
            <a
              href={CYTO_GITHUB_ORG_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-400 hover:bg-emerald-300 text-[#05261C] text-sm font-semibold rounded-lg shadow-[0_10px_28px_-10px_rgba(52,211,153,0.48)] transition-colors whitespace-nowrap"
            >
              <Github className="w-4 h-4" aria-hidden="true" />
              <span>{lang === 'zh' ? '访问 Cyto GitHub' : 'Visit Cyto on GitHub'}</span>
              <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
            </a>
            <a
              href="#model-coscientist"
              onClick={(e) => {
                e.preventDefault();
                openShowcaseModel('coscientist');
              }}
              className="inline-flex items-center gap-1.5 py-2 text-sm font-medium text-emerald-100 hover:text-emerald-300 border-b border-emerald-200/40 hover:border-emerald-300 transition-colors whitespace-nowrap"
            >
              <span>{lang === 'zh' ? '观看 CoScientist 案例影片' : 'Watch CoScientist case films'}</span>
              <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      {/* Quiet Institutional Footer */}
      <footer className="bg-[#051F16] text-emerald-100/70 border-t border-white/10 py-10">
        <div className="max-w-[1320px] mx-auto px-5 sm:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 text-xs">
          <div className="space-y-1.5">
            <div className="text-sm font-bold text-white">
              Cyto · {lang === 'zh' ? '多尺度时空细胞模型家族' : 'Multi-Scale Spatiotemporal Cell Family'}
            </div>
            <p className="text-emerald-100/60">
              {lang === 'zh'
                ? '北京中关村学院 × 华大研究院 联合发布'
                : 'Jointly Released by Beijing Zhongguancun Academy × BGI Research'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <a href="#architecture" className="hover:text-white transition-colors">
              {lang === 'zh' ? '模型家族' : 'Family'}
            </a>
            <a href="#model-family" className="hover:text-white transition-colors">
              {lang === 'zh' ? '模型详解' : 'Models'}
            </a>
            <a
              href="#model-coscientist"
              onClick={(e) => {
                e.preventDefault();
                openShowcaseModel('coscientist');
              }}
              className="hover:text-white transition-colors"
            >
              {lang === 'zh' ? '闭环科研' : 'CoScientist'}
            </a>
          </div>
        </div>
      </footer>
    </>
  );
});
