import React from 'react';
import type { Lang } from '../../lib/cytoDomain';
import { CoSciArchitecture } from './CoSciArchitecture';
import { CoSciResults } from './CoSciResults';
import { CoSciCaseFilms } from './CoSciCaseFilms';
import { CoSciCaseComparison } from './CoSciCaseComparison';
import { EyebrowHeading, ModelIntro } from './shared';

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
          { href: '#cosci-cases', label: zh ? '五项研究案例' : 'Five case studies' },
          { href: '#cosci-results', label: zh ? '研究结果' : 'Study results' },
        ]}
        githubUrl="https://github.com/Cyto-System/Cyto.CoScientist"
      />
      <div className="pt-12 sm:pt-14 border-t border-emerald-950/[0.08]">
        <CoSciArchitecture lang={lang} />
      </div>
      <div className="pt-12 sm:pt-14 border-t border-emerald-950/[0.08]">
        <div className="space-y-7 sm:space-y-8">
          <EyebrowHeading
            id="cosci-cases"
            index="02"
            kicker="CASE STUDIES"
            title={zh ? '五项研究案例' : 'Five case studies'}
            accent={zh ? '算法开发与开放式生信研究' : 'Algorithm development and open-ended bioinformatics inquiry'}
          />
          <CoSciCaseComparison lang={lang} />
          <CoSciCaseFilms lang={lang} />
        </div>
      </div>
      <div className="pt-12 sm:pt-14 border-t border-emerald-950/[0.08]">
        <CoSciResults lang={lang} />
      </div>
    </div>
  );
};
