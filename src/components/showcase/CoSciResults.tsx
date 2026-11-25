import React, { useEffect, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import type { Lang } from '../../lib/cytoDomain';
import { COSCI_ALGO_CHARTS, COSCI_LUAD_DECISIONS, COSCI_OPENPROBLEMS_TISSUES } from '../../lib/modelShowcase';
import { BenchCard, DonutChart, LollipopAuditChart, VerticalColumnChart } from './BenchCharts';
import { EyebrowHeading, useInView } from './shared';

export const CoSciResults: React.FC<{ lang: Lang }> = ({ lang }) => {
  const zh = lang === 'zh';
  const [ref, inView] = useInView<HTMLDivElement>(true, 0.2);
  const [play, setPlay] = useState(false);
  const [replayNonce, setReplayNonce] = useState(0);

  useEffect(() => {
    if (!inView) return;
    setPlay(false);
    const id = window.requestAnimationFrame(() => window.requestAnimationFrame(() => setPlay(true)));
    return () => window.cancelAnimationFrame(id);
  }, [inView, replayNonce]);

  const denoise = COSCI_ALGO_CHARTS[0];
  const luad = COSCI_ALGO_CHARTS[1];

  return (
    <div ref={ref} className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <EyebrowHeading
          id="cosci-results"
          index="03"
          kicker="ALGORITHM DESIGN"
          title={zh ? '两项方法开发任务，' : 'Two method-development tasks,'}
          accent={zh ? '与已有方法在同一考题上比较。' : 'scored against existing methods.'}
        />
        <button
          type="button"
          onClick={() => setReplayNonce((n) => n + 1)}
          className="self-start sm:self-end inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:text-emerald-700 rounded-lg hover:bg-white/80 transition-colors cursor-pointer shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{zh ? '重播动画' : 'Replay'}</span>
        </button>
      </div>

      {/* Task 1: OpenProblems scRNA denoising — cohort donut + MSE column drop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <BenchCard
          className="lg:col-span-5"
          title={zh ? 'OpenProblems 三组织测试细胞构成' : 'OpenProblems 3-tissue evaluation cohort'}
          meta={zh ? '三组织等权评分' : 'Equal-weight tissues'}
          footer={
            zh
              ? '每个细胞留出部分分子作为测试目标，在肺、胰腺与 PBMC 三组织上等权平均。'
              : 'Held-out molecules per cell, weighted equally across lung, pancreas, and PBMC.'
          }
        >
          <div className="h-full flex items-center">
            <DonutChart
              centerValue="27,564"
              centerLabel={zh ? '测试细胞' : 'cells'}
              segments={COSCI_OPENPROBLEMS_TISSUES.map((t) => ({
                label: t.label[lang],
                value: t.count,
                color: t.color,
              }))}
            />
          </div>
        </BenchCard>

        <BenchCard
          className="lg:col-span-7"
          title={denoise.tab[lang]}
          meta={denoise.metric[lang]}
          footer={zh ? '越低越好；虚线标示最优已有方法 MAGIC（0.2013）。' : 'Lower is better; dashed line marks MAGIC (0.2013).'}
        >
          <VerticalColumnChart
            yDomain={[0.15, 0.30]}
            digits={4}
            play={play}
            refLine={{ value: 0.2013, label: 'MAGIC 0.2013' }}
            groups={denoise.entries.map((e) => ({
              label: e.label,
              bars: [{ name: e.label, value: e.value, ours: e.ours }],
            }))}
          />
        </BenchCard>
      </div>

      {/* Task 2: TCGA-LUAD survival — C-index column comparison + candidate fusion audit track */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <BenchCard
          className="lg:col-span-5"
          title={luad.tab[lang]}
          meta={luad.metric[lang]}
          footer={zh ? '420 例肺腺癌三组学（RNA / miRNA / DNA 甲基化）匹配评估。' : '420 LUAD patients across RNA, miRNA, and DNA methylation.'}
        >
          <VerticalColumnChart
            yDomain={[0.54, 0.67]}
            digits={4}
            play={play}
            refLine={{ value: 0.595, label: 'DeepProg 0.5950', align: 'left' }}
            groups={luad.entries.map((e) => ({
              label: e.label === 'CytoCoScientist' ? 'CytoCoScientist' : 'DeepProg (matched)',
              bars: [{ name: e.label, value: e.value, ours: e.ours }],
            }))}
          />
        </BenchCard>

        <BenchCard
          className="lg:col-span-7"
          title={zh ? 'TCGA-LUAD 候选融合方案评审轨迹' : 'TCGA-LUAD fusion candidate audit track'}
          meta="C-index"
        >
          <LollipopAuditChart
            play={play}
            domain={[0.56, 0.66]}
            baseline={{ value: 0.595, label: 'DeepProg' }}
            rows={COSCI_LUAD_DECISIONS.map((r) => ({
              label: r.design[lang],
              score: Number(r.score),
              decision: r.decision[lang],
              kept: r.kept,
            }))}
          />
        </BenchCard>
      </div>
    </div>
  );
};
