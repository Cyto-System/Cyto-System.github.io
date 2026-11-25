import React from 'react';
import { Lang } from '../lib/cytoDomain';
import { openShowcaseModel } from '../lib/modelShowcase';

interface EcosystemAndFooterProps {
  lang: Lang;
}

export const EcosystemAndFooter: React.FC<EcosystemAndFooterProps> = React.memo(({
  lang,
}) => {
  return (
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
  );
});
