import React from 'react';
import type { Lang } from '../../lib/cytoDomain';
import { CoSciArchitecture } from './CoSciArchitecture';
import { CoSciTrajectory } from './CoSciTrajectory';
import { CoSciResults } from './CoSciResults';
import { CoSciCaseFilms } from './CoSciCaseFilms';
import { ModelIntro } from './shared';

export const CoScientistPanel: React.FC<{ lang: Lang }> = ({ lang }) => {
  const zh = lang === 'zh';
  return (
    <div className="space-y-14 sm:space-y-16">
      <ModelIntro
        lang={lang}
        logo="/assets/coscientist/cytoco-logo.png"
        eyebrow="04 / CYTO.COSCIENTIST"
        name="Cyto.CoScientist"
        tagline={zh ? '面向长程自主生物学研究的任务内递归自改进' : 'Within-Task Recursive Self-Improvement for Long-Horizon Autonomous Biological Research'}
        description={
          zh
            ? '在生物信息学算法开发和开放式多组学研究中，Cyto.CoScientist 根据每轮获得的证据和评审意见，修订假设、程序与分析方案。整个研究过程中，模型参数保持不变。'
            : 'In bioinformatics algorithm development and open-ended multi-omics research, Cyto.CoScientist revises hypotheses, programs, and analyses in light of evidence and review from each round. Model parameters remain fixed throughout the study.'
        }
        subnav={[
          { href: '#cosci-architecture', label: zh ? '系统架构' : 'Architecture' },
          { href: '#cosci-trajectory', label: zh ? '研究轨迹' : 'Trajectory' },
          { href: '#cosci-results', label: zh ? '算法设计' : 'Algorithm design' },
          { href: '#cosci-cases', label: zh ? '案例影片' : 'Case films' },
        ]}
        githubUrl="https://github.com/Cyto-System/Cyto.CoScientist"
      />
      <div className="pt-12 sm:pt-14 border-t border-emerald-950/[0.08]">
        <CoSciArchitecture lang={lang} />
      </div>
      <div className="pt-12 sm:pt-14 border-t border-emerald-950/[0.08]">
        <CoSciTrajectory lang={lang} />
      </div>
      <div className="pt-12 sm:pt-14 border-t border-emerald-950/[0.08]">
        <CoSciResults lang={lang} />
      </div>
      <div className="pt-12 sm:pt-14 border-t border-emerald-950/[0.08]">
        <CoSciCaseFilms lang={lang} />
      </div>
    </div>
  );
};
