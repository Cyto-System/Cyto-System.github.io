import React, { useEffect, useState } from 'react';
import type { Lang } from '../../lib/cytoDomain';
import {
  IDENTITY_BENCHMARKS,
  IDENTITY_CASE_GIF,
  IDENTITY_CASE_STAGES,
  IDENTITY_FIGURE,
  IDENTITY_MAIT_RECALL,
  IDENTITY_PARADIGM_LABEL,
  IDENTITY_STAGES,
  IdentityCohortBenchmark,
  IdentityParadigm,
} from '../../lib/modelShowcase';
import {
  BenchCard,
  BenchControlsBar,
  ScatterPlot,
  TaiyiBarList,
  VerticalColumnChart,
} from './BenchCharts';
import { EyebrowHeading, HotspotFigure, ModelIntro, prefersReducedMotion, useAutoStep, useInView } from './shared';

const PARADIGM_COLOR: Record<IdentityParadigm, string> = {
  ours: '#059669',
  classifier: '#0284C7',
  agent: '#D97706',
  foundation: '#64748B',
};

/** Cyto.Identity (scVerity): architecture walkthrough, 3-cohort benchmark board, and staged T-cell case study. */
export const IdentityPanel: React.FC<{ lang: Lang }> = ({ lang }) => {
  const zh = lang === 'zh';
  const [archRef, archInView] = useInView<HTMLDivElement>(false, 0.25);
  const [benchRef, benchInView] = useInView<HTMLDivElement>(true, 0.2);
  const [caseRef, caseInView] = useInView<HTMLDivElement>(true, 0.2);
  const [userPicked, setUserPicked] = useState(false);
  const [stage, setStage] = useAutoStep(IDENTITY_STAGES.length, 4200, archInView && !userPicked && !prefersReducedMotion());

  const [cohortId, setCohortId] = useState<IdentityCohortBenchmark['id']>('mean');
  const [axisMode, setAxisMode] = useState<'zoom' | 'full'>('zoom');
  const [play, setPlay] = useState(false);
  const [replayNonce, setReplayNonce] = useState(0);
  const [casePlay, setCasePlay] = useState(false);

  useEffect(() => {
    if (!benchInView) return;
    setPlay(false);
    const id = window.requestAnimationFrame(() => window.requestAnimationFrame(() => setPlay(true)));
    return () => window.cancelAnimationFrame(id);
  }, [benchInView, cohortId, axisMode, replayNonce]);

  useEffect(() => {
    if (!caseInView) return;
    setCasePlay(false);
    const id = window.requestAnimationFrame(() => window.requestAnimationFrame(() => setCasePlay(true)));
    return () => window.cancelAnimationFrame(id);
  }, [caseInView]);

  const cohort = IDENTITY_BENCHMARKS.find((b) => b.id === cohortId) ?? IDENTITY_BENCHMARKS[0];
  const accVals = cohort.rows.map((r) => r.acc);
  const f1Vals = cohort.rows.map((r) => r.macroF1);
  const accZoom: [number, number] = [Math.max(0, Math.floor((Math.min(...accVals) - 6) / 5) * 5), Math.min(100, Math.ceil((Math.max(...accVals) + 4) / 5) * 5)];
  const f1Zoom: [number, number] = [Math.max(0, Math.floor((Math.min(...f1Vals) - 6) / 5) * 5), Math.min(100, Math.ceil((Math.max(...f1Vals) + 4) / 5) * 5)];

  const scatterXDomain: [number, number] = [
    Math.max(0, Math.floor((Math.min(...accVals) - 5) / 5) * 5),
    Math.min(100, Math.ceil((Math.max(...accVals) + 5) / 5) * 5),
  ];
  const scatterYDomain: [number, number] = [
    Math.max(0, Math.floor((Math.min(...f1Vals) - 5) / 5) * 5),
    Math.min(100, Math.ceil((Math.max(...f1Vals) + 5) / 5) * 5),
  ];

  const scatterPoints = cohort.rows.map((r) => {
    let dx: number | undefined;
    let dy: number | undefined;
    if (r.paradigm === 'ours') {
      dx = -8;
      dy = -8;
    } else if (r.method === 'mLLMCelltype') {
      dx = 8;
      dy = 12;
    } else if (r.method === 'CellTypist' && cohortId === 'pan-cancer-t') {
      dx = 8;
      dy = 4;
    } else if (r.method === 'CASSIA' && cohortId === 'pan-cancer-t') {
      dx = 8;
      dy = -8;
    } else if (r.method === 'CASSIA' && cohortId === 'mean') {
      dx = 8;
      dy = -6;
    }
    return {
      id: r.method,
      label: r.method,
      x: r.acc,
      y: r.macroF1,
      color: PARADIGM_COLOR[r.paradigm],
      ours: r.paradigm === 'ours',
      dx,
      dy,
    };
  });

  const singleCohorts = IDENTITY_BENCHMARKS.filter((b) => b.id !== 'mean');

  return (
    <div className="space-y-14 sm:space-y-16">
      <ModelIntro
        lang={lang}
        eyebrow="02 / CYTO.IDENTITY · SCVERITY"
        name="Cyto.Identity"
        tagline={zh ? '面向开放世界单细胞注释的循证推理' : 'Evidence-grounded reasoning for open-world single-cell annotation'}
        description={
          zh
            ? '将细胞级候选假设生成与样本内生物学证据验证解耦。自适应流形提供器保留相近亚型的竞争假设，分析与评审智能体结合细胞本体知识图谱与局部分群实测证据逐层核验，输出可溯源的细胞身份与状态。'
            : 'Decouples per-cell candidate generation from sample-grounded biological verification. An Adaptive Manifold Provider preserves competing subtype hypotheses, while Analyst and Reviewer agents audit local query measurements against Cell Ontology knowledge to release traceable identities.'
        }
        subnav={[
          { href: '#identity-architecture', label: zh ? '模型架构' : 'Architecture' },
          { href: '#identity-benchmark', label: zh ? '基准评测' : 'Benchmarks' },
          { href: '#identity-case', label: zh ? '阶段验证案例' : 'Case study' },
        ]}
      />

      {/* 01 Architecture */}
      <div ref={archRef} className="pt-12 sm:pt-14 border-t border-emerald-950/[0.08] space-y-8">
        <EyebrowHeading
          id="identity-architecture"
          index="01"
          kicker="THE ARCHITECTURE"
          title={zh ? '先用局部流形高召回提出候选，' : 'Propose high-recall candidates on a local manifold,'}
          accent={zh ? '再用样本内实测证据逐层验证。' : 'then verify them against query measurements.'}
        />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          <ol className="lg:col-span-4 space-y-2">
            {IDENTITY_STAGES.map((s, i) => {
              const active = i === stage;
              return (
                <li key={s.code}>
                  <button
                    type="button"
                    aria-pressed={active}
                    onClick={() => {
                      setUserPicked(true);
                      setStage(i);
                    }}
                    onMouseEnter={() => {
                      setUserPicked(true);
                      setStage(i);
                    }}
                    className={`relative w-full text-left flex gap-3.5 px-4 py-3.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                      active
                        ? 'bg-white border-emerald-600/40 shadow-[0_8px_22px_-14px_rgba(5,150,105,0.4)]'
                        : 'bg-transparent border-transparent hover:bg-white/65 hover:border-emerald-950/[0.08]'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full transition-colors ${
                        active ? 'bg-emerald-600' : 'bg-transparent'
                      }`}
                    />
                    <span className={`font-mono text-xs pt-0.5 font-semibold ${active ? 'text-emerald-700' : 'text-slate-400'}`}>
                      {s.code}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-[#0C261B]">{s.title[lang]}</span>
                      <span className="block text-xs text-slate-600 mt-1.5 leading-relaxed">{s.body[lang]}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
          <div className="lg:col-span-8">
            <HotspotFigure
              src={IDENTITY_FIGURE.src}
              alt={zh ? 'Cyto.Identity (scVerity) 系统架构图' : 'Cyto.Identity (scVerity) system architecture'}
              width={IDENTITY_FIGURE.width}
              height={IDENTITY_FIGURE.height}
              hotspot={IDENTITY_STAGES[stage].hotspot}
              lang={lang}
            />
          </div>
        </div>
      </div>

      {/* 02 Benchmarks */}
      <div ref={benchRef} className="pt-12 sm:pt-14 border-t border-emerald-950/[0.08] space-y-6">
        <EyebrowHeading
          id="identity-benchmark"
          index="02"
          kicker="IDENTITY BENCHMARK"
          title={zh ? '跨三类独立单细胞队列，' : 'Across three independent single-cell cohorts,'}
          accent={zh ? '与基础模型、分类器及 LLM 智能体全面对比。' : 'benchmarked against foundation models, classifiers, and LLM agents.'}
        />

        <BenchControlsBar
          tabs={IDENTITY_BENCHMARKS.map((b) => ({ id: b.id, label: b.tab[lang] }))}
          activeTab={cohortId}
          onSelectTab={(id) => setCohortId(id as IdentityCohortBenchmark['id'])}
          axisMode={axisMode}
          onAxisMode={setAxisMode}
          onReplay={() => setReplayNonce((n) => n + 1)}
          lang={lang}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* LEFT: 2D Accuracy vs Macro-F1 Frontier */}
          <div className="lg:col-span-5 flex flex-col">
            <BenchCard
              className="flex-1"
              title={zh ? '本体准确率 vs 宏平均 F1 前沿' : 'Ontology accuracy vs Macro-F1 frontier'}
              meta={cohort.cohortMeta[lang]}
              footer={cohort.note[lang]}
            >
              <ScatterPlot
                points={scatterPoints}
                xLabel={zh ? '本体兼容准确率 (%) ↑' : 'Ontology accuracy (%) ↑'}
                yLabel={zh ? 'Macro-F1 (%) ↑' : 'Macro-F1 (%) ↑'}
                xDomain={scatterXDomain}
                yDomain={scatterYDomain}
                tickDigits={0}
                valueDigits={2}
                suffix="%"
                legend={(['ours', 'classifier', 'agent', 'foundation'] as IdentityParadigm[]).map((k) => ({
                  label: IDENTITY_PARADIGM_LABEL[k][lang],
                  color: PARADIGM_COLOR[k],
                }))}
              />
            </BenchCard>
          </div>

          {/* RIGHT: Side-by-side Accuracy & Macro-F1 Leaderboards */}
          <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-5">
            <BenchCard
              title={zh ? '本体兼容准确率' : 'Ontology-compatible accuracy'}
              meta={cohort.tab[lang]}
              footer={
                zh
                  ? '要求预测满足作者标注的全部本体断言且不发生无依据的谱系偏离。'
                  : 'Awards credit when predictions satisfy all ground-truth ontology assertions without unsupported lineage divergence.'
              }
            >
              <TaiyiBarList
                entries={cohort.rows.map((r) => ({
                  label: r.method,
                  value: r.acc,
                  ours: r.paradigm === 'ours',
                  dotColor: PARADIGM_COLOR[r.paradigm],
                }))}
                zoomAxis={accZoom}
                fullAxis={[0, 100]}
                axisMode={axisMode}
                digits={2}
                suffix="%"
                better="higher"
                play={play}
                compact
              />
            </BenchCard>

            <BenchCard
              title="Macro-F1"
              meta={cohort.tab[lang]}
              footer={
                zh
                  ? '对全部评估目标细胞类别等权计算，重点检验罕见亚型与细粒度分化状态的召回能力。'
                  : 'Unweighted harmonic mean across all target classes, highlighting fine-grained and rare subtype recall.'
              }
            >
              <TaiyiBarList
                entries={cohort.rows.map((r) => ({
                  label: r.method,
                  value: r.macroF1,
                  ours: r.paradigm === 'ours',
                  dotColor: PARADIGM_COLOR[r.paradigm],
                }))}
                zoomAxis={f1Zoom}
                fullAxis={[0, 100]}
                axisMode={axisMode}
                digits={2}
                suffix="%"
                better="higher"
                play={play}
                compact
              />
            </BenchCard>
          </div>
        </div>

        {/* Compact 3-column per-cohort comparison strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {singleCohorts.map((c) => {
            const ours = c.rows.find((r) => r.paradigm === 'ours')!;
            const bestAccBase = c.rows.filter((r) => r.paradigm !== 'ours').reduce((a, b) => (b.acc > a.acc ? b : a));
            const bestF1Base = c.rows.filter((r) => r.paradigm !== 'ours').reduce((a, b) => (b.macroF1 > a.macroF1 ? b : a));
            const isSelected = cohortId === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setCohortId(c.id)}
                className={`text-left rounded-xl border p-4 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white border-emerald-600/45 shadow-[0_6px_18px_-12px_rgba(5,150,105,0.32)]'
                    : 'bg-white/85 border-emerald-950/[0.08] hover:border-emerald-600/35 hover:bg-white'
                }`}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-xs font-semibold text-[#0C261B]">{c.tab[lang]}</span>
                  <span className="font-mono text-[10.5px] text-slate-400">{c.cohortMeta[lang]}</span>
                </div>
                <div className="mt-2.5 grid grid-cols-2 gap-3 text-[11.5px]">
                  <div>
                    <div className="text-slate-400">{zh ? '准确率' : 'Accuracy'}</div>
                    <div className="font-mono font-bold text-emerald-700 tabular-nums mt-0.5">
                      {ours.acc.toFixed(2)}%
                    </div>
                    <div className="font-mono text-[10.5px] text-emerald-600/80 tabular-nums">
                      +{(ours.acc - bestAccBase.acc).toFixed(2)} pp vs {bestAccBase.method}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400">Macro-F1</div>
                    <div className="font-mono font-bold text-emerald-700 tabular-nums mt-0.5">
                      {ours.macroF1.toFixed(2)}%
                    </div>
                    <div className="font-mono text-[10.5px] text-emerald-600/80 tabular-nums">
                      +{(ours.macroF1 - bestF1Base.macroF1).toFixed(2)} pp vs {bestF1Base.method}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 03 Staged Verification Case Study */}
      <div ref={caseRef} className="pt-12 sm:pt-14 border-t border-emerald-950/[0.08] space-y-8">
        <EyebrowHeading
          id="identity-case"
          index="03"
          kicker="STAGED CASE STUDY"
          title={zh ? '78,228 个人胸腺与外周血 T 细胞，' : '78,228 human thymic and peripheral blood T cells,'}
          accent={zh ? '三阶段验证逐步纠偏并找回罕见亚群。' : 'refined stage by stage to recover rare invariant lineages.'}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <figure className="lg:col-span-7 rounded-2xl border border-emerald-950/[0.09] bg-white shadow-[0_1px_2px_rgba(6,78,59,0.04)] overflow-hidden flex flex-col">
            <div className="px-4 sm:px-5 py-3 border-b border-emerald-950/[0.06] flex items-center justify-between gap-2">
              <span className="text-xs sm:text-[13px] font-semibold text-[#0C261B]">
                {zh ? '证据审阅、重标注与局部再分群演示' : 'Evidence review, relabeling, and localized cluster splitting'}
              </span>
              <span className="font-mono text-[11px] text-slate-400">13 donors · RNA + TCR-seq</span>
            </div>
            <div className="flex-1 bg-white p-3 sm:p-4 flex items-center justify-center">
              <img
                src={IDENTITY_CASE_GIF.src}
                alt={
                  zh
                    ? '人胸腺与外周血 T 细胞证据审阅、重标注与局部拆分动态演示'
                    : 'Animated scVerity case study showing evidence review, relabeling, and cluster splitting'
                }
                width={IDENTITY_CASE_GIF.width}
                height={IDENTITY_CASE_GIF.height}
                loading="lazy"
                className="w-full h-auto max-h-[540px] object-contain rounded-lg"
              />
            </div>
            <figcaption className="px-4 sm:px-5 py-3 border-t border-emerald-950/[0.06] text-xs text-slate-500 leading-relaxed bg-[#FAFDFB]">
              {zh
                ? '基于 Loh et al. (2024) 13 位健康供体胸腺与外周血 T 细胞配对单细胞 RNA 及 TCR 数据，展示智能体评审解决 CD4/CD8 谱系混淆、局部拆分胸腺 γδ 分支，并经配对 TCR 复核找回罕见 MAIT 与 iNKT 亚群。'
                : 'On Loh et al. (2024) paired scRNA-seq and TCR profiles from 13 healthy donors, Agent Review resolves CD4/CD8 conflicts and splits hidden thymic γδ sub-branches, while Meta Review recovers rare MAIT and iNKT populations confirmed by paired TCRs.'}
            </figcaption>
          </figure>

          <div className="lg:col-span-5 flex flex-col gap-5">
            <BenchCard
              title={zh ? '三阶段 FACS 分选真值演进' : 'Staged verification against FACS ground truth'}
              meta={zh ? '5 大 T 细胞谱系' : '5 T-cell lineages'}
              footer={
                zh
                  ? 'Agent Review 修订 3,949 个细胞并净增 +2,784 正确注释；Meta Review 进一步修订 611 个罕见细胞并净增 +606 正确注释。'
                  : 'Agent Review revises 3,949 cells (+2,784 net correct); Meta Review revises 611 rare cells (+606 net correct).'
              }
            >
              <VerticalColumnChart
                groups={IDENTITY_CASE_STAGES.map((s) => ({
                  label: s.stage[lang],
                  bars: [
                    { name: zh ? '准确率' : 'Acc', value: s.acc, ours: true },
                    { name: 'Macro-F1', value: s.macroF1Pct, color: '#0D9488' },
                  ],
                }))}
                yDomain={[35, 62]}
                digits={2}
                suffix="%"
                play={casePlay}
              />
              <div className="mt-3 flex items-center justify-center gap-5 text-[11px] text-slate-600">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-emerald-600" aria-hidden="true" />
                  <span className="font-semibold text-emerald-800">{zh ? '准确率 (%)' : 'Accuracy (%)'}</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-teal-600" aria-hidden="true" />
                  <span>Macro-F1 (%)</span>
                </span>
              </div>
            </BenchCard>

            <BenchCard
              className="flex-1"
              title={zh ? '多模态配对 TCR 罕见亚群验证' : 'Multimodal paired-TCR rare-lineage verification'}
              meta={zh ? '四聚体物理分选对照' : 'Tetramer sorting ground truth'}
              footer={
                zh
                  ? '放宽转录本丢失导致的 SLC4A10 门槛后，MAIT 召回率由 69.09% 升至 91.91%，而假阳性始终维持 23 个细胞不变。'
                  : 'Relaxing RNA dropout constraints via paired TCR raises MAIT recall from 69.09% to 91.91% while false positives stay fixed at 23 cells.'
              }
            >
              <div className="space-y-3.5">
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="rounded-xl bg-[#F4FAF6] border border-emerald-950/[0.06] px-3 py-2.5">
                    <div className="text-[11px] text-slate-500">iNKT · CD1d-PBS57</div>
                    <div className="font-mono text-sm font-bold text-emerald-800 tabular-nums mt-0.5">98.88%</div>
                    <div className="text-[10.5px] text-slate-500 mt-0.5">
                      {zh ? '177 / 179 匹配分选' : '177 / 179 verified'}
                    </div>
                  </div>
                  <div className="rounded-xl bg-[#F4FAF6] border border-emerald-950/[0.06] px-3 py-2.5">
                    <div className="text-[11px] text-slate-500">MAIT · MR1-5-OP-RU</div>
                    <div className="font-mono text-sm font-bold text-emerald-800 tabular-nums mt-0.5">99.54%</div>
                    <div className="text-[10.5px] text-slate-500 mt-0.5">
                      {zh ? '430 / 432 匹配分选' : '430 / 432 verified'}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  {IDENTITY_MAIT_RECALL.map((row, idx) => (
                    <div key={row.criterion.en} className="space-y-1">
                      <div className="flex items-baseline justify-between gap-2 text-[11.5px]">
                        <span className="text-slate-600 truncate">{row.criterion[lang]}</span>
                        <span className="font-mono font-semibold text-emerald-800 tabular-nums shrink-0">
                          {row.recall.toFixed(2)}%
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-emerald-950/[0.07] overflow-hidden">
                        <span
                          className={`block h-full rounded-full ${
                            idx === 2 ? 'bg-gradient-to-r from-emerald-600 to-emerald-500' : 'bg-emerald-500/65'
                          }`}
                          style={{
                            width: casePlay ? `${row.recall}%` : '0%',
                            transition: 'width 760ms cubic-bezier(0.22, 1, 0.36, 1)',
                            transitionDelay: `${idx * 90}ms`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </BenchCard>
          </div>
        </div>
      </div>
    </div>
  );
};
