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
        tagline={zh ? '面向生命科学的 Autoresearch 系统' : 'An Autoresearch system for long-horizon biological discovery'}
        description={
          zh
            ? '在固定模型参数下实现任务内递归自我改进（Within-Task RSI），横跨生信算法开发与开放式多组学研究。将“结果能否产出”与“结论是否具备证据准入资格”严格分离，依托持久研究状态、多分支候选演化与循证控制闭环，在长程探索中持续修正假设、方法与科学结论。'
            : 'Realizes within-task recursive self-improvement (RSI) under fixed model parameters across bioinformatics algorithm development and open-ended multi-omics inquiry—decoupling whether a result runs from whether it is evidentially admissible through multi-branch evolution, layered auditing, and revisable research state.'
        }
        subnav={[
          { href: '#cosci-architecture', label: zh ? '系统架构' : 'Architecture' },
          { href: '#cosci-trajectory', label: zh ? '研究轨迹' : 'Trajectory' },
          { href: '#cosci-results', label: zh ? '算法设计' : 'Algorithm design' },
          { href: '#cosci-cases', label: zh ? '案例影片' : 'Case films' },
        ]}
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
