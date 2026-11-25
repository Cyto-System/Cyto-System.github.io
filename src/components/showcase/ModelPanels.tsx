import React, { useEffect, useState } from 'react';
import type { Lang } from '../../lib/cytoDomain';
import {
  PERTURBATION_DRUG,
  PERTURBATION_FIGURE,
  PERTURBATION_MAIN,
  PERTURBATION_OOD,
  PERTURBATION_PARADIGM_LABEL,
  PERTURBATION_STAGES,
  PerturbParadigm,
} from '../../lib/modelShowcase';
import {
  BenchCard,
  BenchControlsBar,
  ScatterPlot,
  TaiyiBarList,
  VerticalColumnChart,
} from './BenchCharts';
import { EyebrowHeading, HotspotFigure, ModelIntro, prefersReducedMotion, useAutoStep, useInView } from './shared';

export { SpatialPanel } from './SpatialPanel';
export { IdentityPanel } from './IdentityPanel';

const PARADIGM_COLOR: Record<PerturbParadigm, string> = {
  prior: '#94A3B8',
  reasoning: '#D97706',
  retrieval: '#0284C7',
  continuous: '#64748B',
  ours: '#059669',
};

type PerturbBenchMode = 'perturbqa' | 'rpe1' | 'genetak';

/** Cyto.Perturbation (RELAY): framework walkthrough + Taiyi-style multi-chart benchmark board. */
export const PerturbationPanel: React.FC<{ lang: Lang }> = ({ lang }) => {
  const zh = lang === 'zh';
  const [ref, inView] = useInView<HTMLDivElement>(false, 0.25);
  const [benchRef, benchInView] = useInView<HTMLDivElement>(true, 0.2);
  const [userPicked, setUserPicked] = useState(false);
  const [stage, setStage] = useAutoStep(PERTURBATION_STAGES.length, 4200, inView && !userPicked && !prefersReducedMotion());

  const [mode, setMode] = useState<PerturbBenchMode>('perturbqa');
  const [scatterTask, setScatterTask] = useState<'de' | 'dir'>('de');
  const [axisMode, setAxisMode] = useState<'zoom' | 'full'>('zoom');
  const [play, setPlay] = useState(false);
  const [replayNonce, setReplayNonce] = useState(0);

  useEffect(() => {
    if (!benchInView) return;
    setPlay(false);
    const id = window.requestAnimationFrame(() => window.requestAnimationFrame(() => setPlay(true)));
    return () => window.cancelAnimationFrame(id);
  }, [benchInView, mode, axisMode, replayNonce]);

  const scatterSource = mode === 'genetak' ? PERTURBATION_DRUG : PERTURBATION_MAIN;
  const scatterPoints = scatterSource.map((r) => {
    let dx: number | undefined;
    let dy: number | undefined;
    if (r.paradigm === 'ours') {
      dx = -8;
      dy = -8;
    } else if (r.method === 'AROMA') {
      dx = -8;
      dy = -7;
    } else if (r.method === 'Gene prior') {
      dx = -8;
      dy = 12;
    } else if (r.method === 'GEARS') {
      dx = -6;
      dy = 12;
    } else if (r.method === 'STATE') {
      dx = 8;
      dy = -6;
    } else if (r.method === 'PerturbDiff') {
      dx = 8;
      dy = 4;
    }
    return {
      id: r.method,
      label: r.method,
      x: scatterTask === 'de' ? r.deF1 : r.dirF1,
      y: scatterTask === 'de' ? r.dePgAuroc : r.dirPgAuroc,
      color: PARADIGM_COLOR[r.paradigm],
      ours: r.paradigm === 'ours',
      dx,
      dy,
    };
  });

  return (
    <div className="space-y-14 sm:space-y-16">
      <ModelIntro
        lang={lang}
        eyebrow="03 / CYTO.PERTURBATION · RELAY"
        name="Cyto.Perturbation"
        tagline={zh ? '面向未见扰动判别的稠密响应对比迁移' : 'Dense response-contrast transfer for unseen perturbations'}
        description={
          zh
            ? '基于知识进行扰动迁移的轻量级预测模型，进一步拆分全局基态响应与基因特异响应，实现全局准确率与基因特异判别能力的同步提升。'
            : 'A lightweight knowledge-driven transfer model for unseen perturbation prediction that decomposes global baseline responses from gene-specific perturbation signals, jointly improving global accuracy and fine-grained discrimination.'
        }
        subnav={[
          { href: '#perturbation-framework', label: zh ? '模型框架' : 'Framework' },
          { href: '#perturbation-benchmark', label: zh ? '基准评测' : 'Benchmarks' },
        ]}
      />

      {/* 01 Framework */}
      <div ref={ref} className="pt-12 sm:pt-14 border-t border-emerald-950/[0.08] space-y-8">
        <EyebrowHeading
          id="perturbation-framework"
          index="01"
          kicker="THE FRAMEWORK"
          title={zh ? '分离固有倾向，' : 'Separate intrinsic gene bias,'}
          accent={zh ? '迁移扰动特异信息。' : 'transfer perturbation-specific signals.'}
        />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          <ol className="lg:col-span-4 space-y-2">
            {PERTURBATION_STAGES.map((s, i) => {
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
                    className={`relative w-full text-left flex gap-3 px-3.5 py-3 rounded-xl border transition-all duration-200 cursor-pointer ${
                      active
                        ? 'bg-white border-emerald-600/35 shadow-[0_6px_18px_-12px_rgba(5,150,105,0.35)]'
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
                    <span>
                      <span className="block text-sm font-semibold text-[#0C261B]">{s.title[lang]}</span>
                      <span className="block mt-1 text-[13px] text-slate-600 leading-[1.6]">{s.body[lang]}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
          <div className="lg:col-span-8">
            <HotspotFigure
              src={PERTURBATION_FIGURE.src}
              alt={zh ? 'RELAY 响应对比迁移架构图' : 'RELAY response-contrast transfer architecture'}
              width={PERTURBATION_FIGURE.width}
              height={PERTURBATION_FIGURE.height}
              hotspot={PERTURBATION_STAGES[stage].hotspot}
              lang={lang}
            />
          </div>
        </div>
      </div>

      {/* 02 Taiyi-Style Multi-Chart Benchmark Suite */}
      <div ref={benchRef} className="pt-12 sm:pt-14 border-t border-emerald-950/[0.08] space-y-6">
        <EyebrowHeading
          id="perturbation-benchmark"
          index="02"
          kicker="PERTURBATION BENCHMARK"
          title={zh ? '既保住全局准确度，' : 'Global accuracy without sacrificing'}
          accent={zh ? '也拉开同一基因下的扰动区分。' : 'within-gene perturbation discrimination.'}
        />

        <div className="pb-1">
          <BenchControlsBar
            lang={lang}
            activeTab={mode}
            onSelectTab={(id) => setMode(id as PerturbBenchMode)}
            axisMode={mode === 'rpe1' ? undefined : axisMode}
            onAxisMode={mode === 'rpe1' ? undefined : setAxisMode}
            onReplay={() => setReplayNonce((n) => n + 1)}
            tabs={[
              { id: 'perturbqa', label: zh ? 'PerturbQA 基因扰动' : 'PerturbQA (CRISPRi)' },
              { id: 'rpe1', label: zh ? 'RPE1 跨细胞系' : 'RPE1 OOD' },
              { id: 'genetak', label: zh ? 'GeneTAK 未见药物' : 'GeneTAK (Compounds)' },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* LEFT COLUMN: 2D Pareto Frontier Scatter (balanced cleanly with right board) */}
          <div className="lg:col-span-5 flex flex-col">
            <BenchCard
              className="flex-1"
              title={zh ? '全局精度 vs 基因内判别（Pareto 前沿）' : 'Global Macro-F1 vs within-gene pgAUROC'}
              meta={mode === 'genetak' ? 'GeneTAK' : 'PerturbQA'}
              footer={
                zh
                  ? '虚线标示基因内随机基线（0.50）；右上角兼顾全局 Macro-F1 与同基因下不同扰动的区分度。'
                  : 'Dashed line marks within-gene chance (0.50); top-right balances global Macro-F1 with within-gene discrimination.'
              }
            >
              <div className="h-full flex flex-col justify-between gap-3">
                <div className="inline-flex self-start p-0.5 rounded-lg bg-[#F2F8F5] border border-emerald-950/[0.06]">
                  <button
                    type="button"
                    aria-pressed={scatterTask === 'de'}
                    onClick={() => setScatterTask('de')}
                    className={`px-2.5 py-1 text-xs rounded-md transition-colors cursor-pointer ${
                      scatterTask === 'de' ? 'bg-white text-emerald-800 font-semibold shadow-2xs' : 'text-slate-500'
                    }`}
                  >
                    DE
                  </button>
                  <button
                    type="button"
                    aria-pressed={scatterTask === 'dir'}
                    onClick={() => setScatterTask('dir')}
                    className={`px-2.5 py-1 text-xs rounded-md transition-colors cursor-pointer ${
                      scatterTask === 'dir' ? 'bg-white text-emerald-800 font-semibold shadow-2xs' : 'text-slate-500'
                    }`}
                  >
                    DIR
                  </button>
                </div>

                <div className="my-auto">
                  <ScatterPlot
                    xLabel={scatterTask === 'de' ? 'DE Macro-F1 ↑' : 'DIR Macro-F1 ↑'}
                    yLabel={scatterTask === 'de' ? 'DE pgAUROC ↑' : 'DIR pgAUROC ↑'}
                    xDomain={mode === 'genetak' ? [0.56, 0.95] : [0.65, 0.92]}
                    yDomain={mode === 'genetak' ? [0.47, 0.66] : [0.47, 0.9]}
                    yChance={0.5}
                    idealCorner="top-right"
                    points={scatterPoints}
                    legend={(['ours', 'prior', 'reasoning', 'retrieval', 'continuous'] as PerturbParadigm[]).map((p) => ({
                      label: PERTURBATION_PARADIGM_LABEL[p][lang],
                      color: PARADIGM_COLOR[p],
                    }))}
                  />
                </div>
              </div>
            </BenchCard>
          </div>

          {/* RIGHT COLUMN: 2x2 Sub-Metric Boards / OOD Columns */}
          <div className="lg:col-span-7 flex flex-col">

            {mode === 'perturbqa' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <BenchCard title="DE · Macro-F1" meta={zh ? '全局精度' : 'Global'}>
                  <TaiyiBarList
                    compact
                    entries={PERTURBATION_MAIN.map((r) => ({
                      label: r.method,
                      value: r.deF1,
                      ours: r.paradigm === 'ours',
                      dotColor: PARADIGM_COLOR[r.paradigm],
                    }))}
                    zoomAxis={[0.64, 0.92]}
                    fullAxis={[0, 1]}
                    axisMode={axisMode}
                    digits={4}
                    better="higher"
                    play={play}
                  />
                </BenchCard>
                <BenchCard title="DE · pgAUROC" meta={zh ? '基因内排序' : 'Within-gene'}>
                  <TaiyiBarList
                    compact
                    entries={PERTURBATION_MAIN.map((r) => ({
                      label: r.method,
                      value: r.dePgAuroc,
                      ours: r.paradigm === 'ours',
                      dotColor: PARADIGM_COLOR[r.paradigm],
                    }))}
                    zoomAxis={[0.48, 0.8]}
                    fullAxis={[0, 1]}
                    axisMode={axisMode}
                    digits={4}
                    better="higher"
                    play={play}
                  />
                </BenchCard>
                <BenchCard title="DIR · Macro-F1" meta={zh ? '方向全局精度' : 'Direction global'}>
                  <TaiyiBarList
                    compact
                    entries={PERTURBATION_MAIN.map((r) => ({
                      label: r.method,
                      value: r.dirF1,
                      ours: r.paradigm === 'ours',
                      dotColor: PARADIGM_COLOR[r.paradigm],
                    }))}
                    zoomAxis={[0.68, 0.9]}
                    fullAxis={[0, 1]}
                    axisMode={axisMode}
                    digits={4}
                    better="higher"
                    play={play}
                  />
                </BenchCard>
                <BenchCard title="DIR · pgAUROC" meta={zh ? '方向基因内排序' : 'Within-gene'}>
                  <TaiyiBarList
                    compact
                    entries={PERTURBATION_MAIN.map((r) => ({
                      label: r.method,
                      value: r.dirPgAuroc,
                      ours: r.paradigm === 'ours',
                      dotColor: PARADIGM_COLOR[r.paradigm],
                    }))}
                    zoomAxis={[0.48, 0.9]}
                    fullAxis={[0, 1]}
                    axisMode={axisMode}
                    digits={4}
                    better="higher"
                    play={play}
                  />
                </BenchCard>
              </div>
            )}

            {mode === 'rpe1' && (
              <div className="space-y-4">
                <BenchCard
                  title={zh ? '跨细胞系零样本迁移（K562 / HepG2 / Jurkat → RPE1）· 三分类 F1' : 'Held-out RPE1 transfer · three-class F1'}
                  meta="ND · Up · Down · Macro-F1"
                  footer={
                    zh
                      ? 'RPE1 仅提供未扰动对照表达，RELAY 在上调（0.6243）与下调（0.6980）两类驱动 Macro-F1 达到 0.7597。'
                      : 'RPE1 provides only unperturbed controls; RELAY leads Up (0.6243), Down (0.6980), and Macro-F1 (0.7597).'
                  }
                >
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-sm bg-slate-300 inline-block" />
                        Source gene prior
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-sm bg-amber-500/75 inline-block" />
                        AROMA
                      </span>
                      <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-800">
                        <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600 inline-block" />
                        RELAY
                      </span>
                    </div>
                    <VerticalColumnChart
                      yDomain={[0.35, 1.0]}
                      digits={3}
                      play={play}
                      groups={[
                        {
                          label: 'ND',
                          bars: PERTURBATION_OOD.map((r) => ({
                            name: r.method,
                            value: r.nd,
                            ours: r.ours,
                            color: r.method === 'AROMA' ? '#D97706' : undefined,
                          })),
                        },
                        {
                          label: 'Up',
                          bars: PERTURBATION_OOD.map((r) => ({
                            name: r.method,
                            value: r.up,
                            ours: r.ours,
                            color: r.method === 'AROMA' ? '#D97706' : undefined,
                          })),
                        },
                        {
                          label: 'Down',
                          bars: PERTURBATION_OOD.map((r) => ({
                            name: r.method,
                            value: r.down,
                            ours: r.ours,
                            color: r.method === 'AROMA' ? '#D97706' : undefined,
                          })),
                        },
                        {
                          label: 'Macro-F1',
                          bars: PERTURBATION_OOD.map((r) => ({
                            name: r.method,
                            value: r.macroF1,
                            ours: r.ours,
                            color: r.method === 'AROMA' ? '#D97706' : undefined,
                          })),
                        },
                      ]}
                    />
                  </div>
                </BenchCard>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <BenchCard title={zh ? 'RPE1 二分类 DE · WG-BAcc' : 'RPE1 Binary DE · WG-BAcc'} meta="Chance = 0.50">
                    <TaiyiBarList
                      compact
                      entries={PERTURBATION_OOD.filter((r) => r.deWgBAcc !== null).map((r) => ({
                        label: r.method,
                        value: r.deWgBAcc!,
                        ours: r.ours,
                      }))}
                      zoomAxis={[0.45, 0.65]}
                      fullAxis={[0, 1]}
                      axisMode="zoom"
                      digits={4}
                      better="higher"
                      play={play}
                    />
                  </BenchCard>
                  <BenchCard title={zh ? 'RPE1 二分类 DIR · WG-BAcc' : 'RPE1 Binary DIR · WG-BAcc'} meta="Chance = 0.50">
                    <TaiyiBarList
                      compact
                      entries={PERTURBATION_OOD.filter((r) => r.dirWgBAcc !== null).map((r) => ({
                        label: r.method,
                        value: r.dirWgBAcc!,
                        ours: r.ours,
                      }))}
                      zoomAxis={[0.45, 0.78]}
                      fullAxis={[0, 1]}
                      axisMode="zoom"
                      digits={4}
                      better="higher"
                      play={play}
                    />
                  </BenchCard>
                </div>
              </div>
            )}

            {mode === 'genetak' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <BenchCard title="DE · Macro-F1" meta="Tahoe-100M">
                  <TaiyiBarList
                    compact
                    entries={PERTURBATION_DRUG.map((r) => ({
                      label: r.method,
                      value: r.deF1,
                      ours: r.paradigm === 'ours',
                      dotColor: PARADIGM_COLOR[r.paradigm],
                    }))}
                    zoomAxis={[0.66, 0.94]}
                    fullAxis={[0, 1]}
                    axisMode={axisMode}
                    digits={4}
                    better="higher"
                    play={play}
                  />
                </BenchCard>
                <BenchCard title="DE · pgAUROC" meta={zh ? '未见药物排序' : 'Unseen drugs'}>
                  <TaiyiBarList
                    compact
                    entries={PERTURBATION_DRUG.map((r) => ({
                      label: r.method,
                      value: r.dePgAuroc,
                      ours: r.paradigm === 'ours',
                      dotColor: PARADIGM_COLOR[r.paradigm],
                    }))}
                    zoomAxis={[0.48, 0.64]}
                    fullAxis={[0, 1]}
                    axisMode={axisMode}
                    digits={4}
                    better="higher"
                    play={play}
                  />
                </BenchCard>
                <BenchCard title="DIR · Macro-F1" meta="Tahoe-100M">
                  <TaiyiBarList
                    compact
                    entries={PERTURBATION_DRUG.map((r) => ({
                      label: r.method,
                      value: r.dirF1,
                      ours: r.paradigm === 'ours',
                      dotColor: PARADIGM_COLOR[r.paradigm],
                    }))}
                    zoomAxis={[0.56, 0.82]}
                    fullAxis={[0, 1]}
                    axisMode={axisMode}
                    digits={4}
                    better="higher"
                    play={play}
                  />
                </BenchCard>
                <BenchCard title="DIR · pgAUROC" meta={zh ? '未见药物排序' : 'Unseen drugs'}>
                  <TaiyiBarList
                    compact
                    entries={PERTURBATION_DRUG.map((r) => ({
                      label: r.method,
                      value: r.dirPgAuroc,
                      ours: r.paradigm === 'ours',
                      dotColor: PARADIGM_COLOR[r.paradigm],
                    }))}
                    zoomAxis={[0.48, 0.65]}
                    fullAxis={[0, 1]}
                    axisMode={axisMode}
                    digits={4}
                    better="higher"
                    play={play}
                  />
                </BenchCard>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
