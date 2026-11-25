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
          index="04"
          kicker="STUDY RESULTS"
          title={zh ? '研究结果' : 'Study results'}
          accent={zh ? '两项算法评估与三项开放式生信研究' : 'Two algorithm evaluations and three open-ended bioinformatics studies'}
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

      <h4 className="text-lg font-semibold text-[#0C261B]">{zh ? '算法开发：定量评估' : 'Algorithm development: quantitative evaluation'}</h4>
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
      <section aria-labelledby="cosci-inquiry-results" className="space-y-4">
        <h4 id="cosci-inquiry-results" className="text-lg font-semibold text-[#0C261B]">
          {zh ? '开放式生信研究：主要发现与证据边界' : 'Open-ended bioinformatics: findings and limits of the evidence'}
        </h4>
        <div className="grid gap-4 lg:grid-cols-3">
          {[
            {
              title: zh ? '脓毒症死亡风险' : 'Sepsis mortality',
              finding: zh ? '研究从单次采血转向同一患者第 1 天与第 7 天的配对比较。以另外 19 种氨基酸为参照，苯丙氨酸的相对水平在存活组和死亡组平均均有下降，但死亡组降幅较小。' : 'The analysis shifted from single blood draws to changes within patients from day 1 to day 7. Relative to 19 other amino acids, phenylalanine fell on average in both outcome groups, but less in non-survivors.',
              limit: zh ? '该模式仍需在独立配对队列中验证，尚不能据此判断死亡风险。' : 'The pattern requires replication in an independent paired cohort; its association with mortality remains unresolved.',
            },
            {
              title: zh ? '食管鳞癌淋巴结转移' : 'Lymph node metastasis in esophageal squamous cell carcinoma',
              finding: zh ? '配对比较显示，12 名患者中有 11 名在转移淋巴结中有更高比例的生发中心样 B 细胞。固定细胞状态后，记忆 B 细胞的 TOP2A 表达仍升高。' : 'In paired lymph nodes from 12 patients, the proportion of germinal-center-like B cells was higher in metastatic nodes in 11 patients. Within memory B cells, TOP2A expression remained elevated.',
              limit: zh ? 'B 细胞标签下检出的 CXCL13 RNA 不能证明其由 B 细胞产生，仍需原位定位。' : 'CXCL13 RNA detected under B-cell labels does not establish that B cells produced it. Its cellular origin requires in situ localization.',
            },
            {
              title: zh ? '急性主动脉夹层五组学研究' : 'Five-omics analysis of acute aortic dissection',
              finding: zh ? '比较不同样本材料中的 48 对预设指标时，仅 SMAD3 区域在 13 例患者中呈现一致的负相关：血浆游离 DNA 甲基化越高，外周血单个核细胞的染色质可及性越低。' : 'Of 48 prespecified cross-material pairs, only the SMAD3 region showed a consistent inverse association across 13 cases: higher plasma cell-free DNA methylation tracked with lower chromatin accessibility in peripheral blood mononuclear cells.',
              limit: zh ? '该关联仍需独立队列复现。另一个候选位点 CP6B 缺少物理染色质接触证据，评审后撤回了这一解释。' : 'The association awaits independent replication. At a separate candidate locus, CP6B, review found no evidence of physical chromatin contact, and that interpretation was withdrawn.',
            },
          ].map(({ title, finding, limit }) => (
            <article key={title} className="space-y-3 rounded-xl border border-emerald-950/10 bg-white p-5">
              <h5 className="font-semibold text-[#0C261B]">{title}</h5>
              <p className="text-sm leading-relaxed text-slate-700">{finding}</p>
              <p className="border-t border-emerald-950/10 pt-3 text-sm leading-relaxed text-slate-600">{limit}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};
