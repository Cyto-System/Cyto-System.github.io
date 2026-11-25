import React, { useEffect, useState } from 'react';
import type { Lang } from '../../lib/cytoDomain';
import {
  SPATIAL_GENERATION,
  SPATIAL_OVERVIEW,
  SPATIAL_REPRESENTATION,
  SPATIAL_SPAC,
  matrixAxis,
} from '../../lib/modelShowcase';
import {
  BenchCard,
  BenchControlsBar,
  HeatmapMatrix,
  RadarChart,
  ScatterPlot,
  TaiyiBarList,
} from './BenchCharts';
import { EyebrowHeading, useInView } from './shared';

type SpatialBenchMode = 'hesta' | 'dlpfc' | 'mouse' | 'generation' | 'spac';

const GEOMETRY_ROWS_ZH = ['散点', '内部块', '外壳', '多块'];
const GEOMETRY_ROWS_EN = ['Scatter', 'Inner block', 'Shell', 'Multi-block'];
const DIFFICULTY_COLS_ZH = ['简单', '中等', '困难'];
const DIFFICULTY_COLS_EN = ['Easy', 'Medium', 'Hard'];

export const SpatialBenchmarks: React.FC<{ lang: Lang }> = ({ lang }) => {
  const zh = lang === 'zh';
  const [benchRef, benchInView] = useInView<HTMLDivElement>(true, 0.02);
  const [mode, setMode] = useState<SpatialBenchMode>('hesta');
  const [axisMode, setAxisMode] = useState<'zoom' | 'full'>('zoom');
  const [organIdx, setOrganIdx] = useState(0);
  const [boundaryIdx, setBoundaryIdx] = useState(0);
  const [mouseColIdx, setMouseColIdx] = useState(5);
  const [genView, setGenView] = useState<'geometry' | 'tissue'>('geometry');
  const [geoCell, setGeoCell] = useState<[number, number]>([1, 0]);
  const [tissueIdx, setTissueIdx] = useState(0);
  const [play, setPlay] = useState(false);
  const [replayNonce, setReplayNonce] = useState(0);

  useEffect(() => {
    if (!benchInView) return;
    setPlay(false);
    const id = window.requestAnimationFrame(() => window.requestAnimationFrame(() => setPlay(true)));
    return () => window.cancelAnimationFrame(id);
  }, [benchInView, mode, axisMode, organIdx, boundaryIdx, mouseColIdx, genView, geoCell, tissueIdx, replayNonce]);

  const hesta = SPATIAL_REPRESENTATION[0];
  const dlpfc = SPATIAL_REPRESENTATION[1];
  const mouse = SPATIAL_REPRESENTATION[2];
  const genTissue = SPATIAL_GENERATION[0];
  const genGeo = SPATIAL_GENERATION[1];

  // Radar series for HESTA 8 organs (SUDOKU vs GeST & QueST)
  const hestaSudoku = hesta.methods.find((m) => m.name === 'SUDOKU')!.values;
  const hestaGest = hesta.methods.find((m) => m.name === 'GeST')!.values;
  const hestaQuest = hesta.methods.find((m) => m.name === 'QueST')!.values;

  // Dumbbell rows from SPATIAL_OVERVIEW
  const dumbbellRows = SPATIAL_OVERVIEW.map((r) => {
    const [baseScoreStr, baseName] = r.baseline.split(' · ');
    return {
      label: r.task[lang].split(' · ')[0],
      baseline: Number(baseScoreStr),
      baselineName: baseName ?? 'Baseline',
      zeroShot: Number(r.zeroShot),
      fineTuned: Number(r.fineTuned),
      zeroShotWins: r.zeroShotWins,
    };
  });

  // 4x3 mask geometry heatmap matrices (SUDOKU vs best baseline per cell)
  const geoSudokuVals = genGeo.methods.find((m) => m.name === 'SUDOKU')!.values;
  const geoBaselines = genGeo.methods.filter((m) => m.name !== 'SUDOKU');
  const heatValues: number[][] = [0, 1, 2, 3].map((r) => [0, 1, 2].map((c) => geoSudokuVals[r * 3 + c]));
  const heatBestBase: number[][] = [0, 1, 2, 3].map((r) =>
    [0, 1, 2].map((c) => Math.max(...geoBaselines.map((m) => m.values[r * 3 + c])))
  );
  const selectedGeoFlatIdx = geoCell[0] * 3 + geoCell[1];

  return (
    <div className="space-y-14 sm:space-y-16">
      {/* Detailed comparisons, revealed only on request. */}
      <div ref={benchRef} className="pt-12 sm:pt-14 border-t border-emerald-950/[0.08] space-y-6">
        <EyebrowHeading
          id="spatial-detailed-benchmark"
          index="04"
          kicker="SPATIAL BENCHMARK"
          title={zh ? '完整基准对比，' : 'The complete benchmark,'}
          accent={zh ? '按任务查看不同模型的表现。' : 'compare models within each task.'}
        />

        <div className="pb-1">
          <BenchControlsBar
            lang={lang}
            activeTab={mode}
            onSelectTab={(id) => setMode(id as SpatialBenchMode)}
            axisMode={mode === 'spac' ? undefined : axisMode}
            onAxisMode={mode === 'spac' ? undefined : setAxisMode}
            onReplay={() => setReplayNonce((n) => n + 1)}
            tabs={[
              { id: 'hesta', label: zh ? 'HESTA 检索' : 'HESTA' },
              { id: 'dlpfc', label: zh ? 'DLPFC 交界' : 'DLPFC' },
              { id: 'mouse', label: zh ? '小鼠脑聚类' : 'Mouse brain' },
              { id: 'generation', label: zh ? '掩码生成' : 'Generation' },
              { id: 'spac', label: 'SPAC-seq' },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* LEFT COLUMN: 8-Organ Radar Profile (height-balanced with right board) */}
          <div className="lg:col-span-5 flex flex-col">
            <BenchCard
              className="flex-1"
              title={zh ? 'HESTA 8 器官检索指纹' : 'HESTA 8-organ retrieval radar'}
              meta={zh ? 'AUPRC · 点击顶点联动' : 'AUPRC · click vertex'}
              footer={
                zh
                  ? '对比 SUDOKU 与排名前二的空间基线 GeST、QueST 在 8 个器官上的跨切片检索 AUPRC。'
                  : 'Cross-slice retrieval AUPRC across 8 organs comparing SUDOKU with top baselines GeST and QueST.'
              }
            >
              <div className="h-full flex items-center justify-center py-2">
                <RadarChart
                  axes={hesta.columns.map((c) => c[lang])}
                  maxVal={1.0}
                  activeAxis={mode === 'hesta' ? organIdx : undefined}
                  onSelectAxis={(idx) => {
                    setMode('hesta');
                    setOrganIdx(idx);
                  }}
                  series={[
                    { name: 'SUDOKU', values: hestaSudoku, color: '#059669', fill: true },
                    { name: 'GeST', values: hestaGest, color: '#0F766E', dashed: true },
                    { name: 'QueST', values: hestaQuest, color: '#94A3B8', dashed: true },
                  ]}
                />
              </div>
            </BenchCard>
          </div>

          {/* RIGHT COLUMN: Task-Specific Interactive Board */}
          <div className="lg:col-span-7 flex flex-col">

            {mode === 'hesta' && (
              <BenchCard
                className="flex-1"
                title={`${hesta.title[lang]} · ${hesta.columns[organIdx][lang]}`}
                meta={hesta.metric}
                footer={hesta.note[lang]}
              >
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-1.5">
                    {hesta.columns.map((c, i) => (
                      <button
                        key={c.en}
                        type="button"
                        aria-pressed={i === organIdx}
                        onClick={() => setOrganIdx(i)}
                        className={`px-2.5 py-1 text-xs rounded-full border transition-colors cursor-pointer ${
                          i === organIdx
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-semibold'
                            : 'border-emerald-950/10 text-slate-600 hover:border-emerald-600/40'
                        }`}
                      >
                        {c[lang]}
                      </button>
                    ))}
                  </div>
                  <TaiyiBarList
                    entries={hesta.methods.map((m) => ({
                      label: m.name,
                      value: m.values[organIdx],
                      ours: m.name === 'SUDOKU',
                    }))}
                    zoomAxis={matrixAxis(hesta.methods.map((m) => m.values[organIdx]))}
                    fullAxis={[0, 1]}
                    axisMode={axisMode}
                    digits={3}
                    better="higher"
                    play={play}
                  />
                </div>
              </BenchCard>
            )}

            {mode === 'dlpfc' && (
              <BenchCard
                title={`${dlpfc.title[lang]} · ${dlpfc.columns[boundaryIdx][lang]}`}
                meta={dlpfc.metric}
                footer={dlpfc.note[lang]}
              >
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-1.5">
                    {dlpfc.columns.map((c, i) => (
                      <button
                        key={c.en}
                        type="button"
                        aria-pressed={i === boundaryIdx}
                        onClick={() => setBoundaryIdx(i)}
                        className={`px-2.5 py-1 text-xs rounded-full border transition-colors cursor-pointer ${
                          i === boundaryIdx
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-semibold'
                            : 'border-emerald-950/10 text-slate-600 hover:border-emerald-600/40'
                        }`}
                      >
                        {c[lang]}
                      </button>
                    ))}
                  </div>
                  <TaiyiBarList
                    entries={dlpfc.methods.map((m) => ({
                      label: m.name,
                      value: m.values[boundaryIdx],
                      ours: m.name === 'SUDOKU',
                    }))}
                    zoomAxis={matrixAxis(dlpfc.methods.map((m) => m.values[boundaryIdx]))}
                    fullAxis={[-0.1, 1]}
                    axisMode={axisMode}
                    digits={3}
                    better="higher"
                    play={play}
                  />
                </div>
              </BenchCard>
            )}

            {mode === 'mouse' && (
              <BenchCard
                title={`${mouse.title[lang]} · ${mouse.columns[mouseColIdx][lang]}`}
                meta={mouse.metric}
                footer={mouse.note[lang]}
              >
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-1.5">
                    {mouse.columns.map((c, i) => (
                      <button
                        key={c.en}
                        type="button"
                        aria-pressed={i === mouseColIdx}
                        onClick={() => setMouseColIdx(i)}
                        className={`px-2.5 py-1 text-xs rounded-full border transition-colors cursor-pointer ${
                          i === mouseColIdx
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-semibold'
                            : 'border-emerald-950/10 text-slate-600 hover:border-emerald-600/40'
                        }`}
                      >
                        {c[lang]}
                      </button>
                    ))}
                  </div>
                  <TaiyiBarList
                    entries={mouse.methods.map((m) => ({
                      label: m.name,
                      value: m.values[mouseColIdx],
                      ours: m.name === 'SUDOKU',
                    }))}
                    zoomAxis={matrixAxis(mouse.methods.map((m) => m.values[mouseColIdx]))}
                    fullAxis={[0, 1]}
                    axisMode={axisMode}
                    digits={3}
                    better="higher"
                    play={play}
                  />
                </div>
              </BenchCard>
            )}

            {mode === 'generation' && (
              <div className="space-y-4">
                <BenchCard
                  title={genView === 'geometry' ? genGeo.title[lang] : genTissue.title[lang]}
                  meta={genView === 'geometry' ? (zh ? '点击格点查看明细 · 相对最佳基线差值' : 'Click cell · Δ vs best baseline') : genTissue.metric}
                  footer={genView === 'geometry' ? genGeo.note[lang] : genTissue.note[lang]}
                >
                  <div className="space-y-4">
                    <div className="inline-flex p-0.5 rounded-lg bg-[#F2F8F5] border border-emerald-950/[0.06]">
                      <button
                        type="button"
                        aria-pressed={genView === 'geometry'}
                        onClick={() => setGenView('geometry')}
                        className={`px-3 py-1 text-xs rounded-md transition-colors cursor-pointer ${
                          genView === 'geometry' ? 'bg-white text-[#0C261B] font-semibold shadow-2xs' : 'text-slate-500'
                        }`}
                      >
                        {zh ? '遮蔽几何 × 难度热力图' : 'Geometry × difficulty heatmap'}
                      </button>
                      <button
                        type="button"
                        aria-pressed={genView === 'tissue'}
                        onClick={() => setGenView('tissue')}
                        className={`px-3 py-1 text-xs rounded-md transition-colors cursor-pointer ${
                          genView === 'tissue' ? 'bg-white text-[#0C261B] font-semibold shadow-2xs' : 'text-slate-500'
                        }`}
                      >
                        {zh ? '按 6 个组织组别' : 'By 6 tissue groups'}
                      </button>
                    </div>

                    {genView === 'geometry' ? (
                      <div className="space-y-4">
                        <HeatmapMatrix
                          rows={zh ? GEOMETRY_ROWS_ZH : GEOMETRY_ROWS_EN}
                          cols={zh ? DIFFICULTY_COLS_ZH : DIFFICULTY_COLS_EN}
                          values={heatValues}
                          baselines={heatBestBase}
                          selectedCell={geoCell}
                          onSelectCell={(r, c) => setGeoCell([r, c])}
                        />
                        <div className="pt-3 border-t border-emerald-950/[0.06]">
                          <TaiyiBarList
                            title={genGeo.columns[selectedGeoFlatIdx][lang]}
                            entries={genGeo.methods.map((m) => ({
                              label: m.name,
                              value: m.values[selectedGeoFlatIdx],
                              ours: m.name === 'SUDOKU',
                            }))}
                            zoomAxis={matrixAxis(genGeo.methods.map((m) => m.values[selectedGeoFlatIdx]))}
                            fullAxis={[0, 0.7]}
                            axisMode={axisMode}
                            digits={3}
                            better="higher"
                            play={play}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex flex-wrap gap-1.5">
                          {genTissue.columns.map((c, i) => (
                            <button
                              key={c.en}
                              type="button"
                              aria-pressed={i === tissueIdx}
                              onClick={() => setTissueIdx(i)}
                              className={`px-2.5 py-1 text-xs rounded-full border transition-colors cursor-pointer ${
                                i === tissueIdx
                                  ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-semibold'
                                  : 'border-emerald-950/10 text-slate-600 hover:border-emerald-600/40'
                              }`}
                            >
                              {c[lang]}
                            </button>
                          ))}
                        </div>
                        <TaiyiBarList
                          entries={genTissue.methods.map((m) => ({
                            label: m.name,
                            value: m.values[tissueIdx],
                            ours: m.name === 'SUDOKU',
                          }))}
                          zoomAxis={matrixAxis(genTissue.methods.map((m) => m.values[tissueIdx]))}
                          fullAxis={[0, 0.7]}
                          axisMode={axisMode}
                          digits={3}
                          better="higher"
                          play={play}
                        />
                      </div>
                    )}
                  </div>
                </BenchCard>
              </div>
            )}

            {mode === 'spac' && (
              <BenchCard
                className="flex-1"
                title={zh ? 'SPAC-seq 免疫募集 · 相关性与排名误差权衡' : 'SPAC-seq immune recruitment · correlation vs rank error'}
                meta={zh ? '左上更优 · 3 张切片平均' : 'Top-left is better · mean of 3 slices'}
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                  <div className="md:col-span-7">
                    <ScatterPlot
                      xLabel={zh ? '排名误差 ↓ (越低越好)' : 'Rank error ↓'}
                      yLabel="Spearman ↑"
                      xDomain={[0.08, 0.32]}
                      yDomain={[0, 0.9]}
                      idealCorner="top-left"
                      points={SPATIAL_SPAC.map((r) => ({
                        id: r.method,
                        label: zh ? r.method.split(' / ')[0] : r.method.split(' / ').pop()!,
                        x: Number(r.rankErr),
                        y: Number(r.spearman),
                        color: r.ours ? '#059669' : '#64748B',
                        ours: r.ours,
                        dx: r.ours ? 10 : -8,
                        dy: r.ours ? 4 : -6,
                      }))}
                    />
                  </div>
                  <div className="md:col-span-5 space-y-2.5">
                    {SPATIAL_SPAC.map((r) => (
                      <div
                        key={r.method}
                        className={`rounded-xl border px-3.5 py-2.5 flex items-center justify-between gap-2 text-xs ${
                          r.ours
                            ? 'bg-emerald-50/85 border-emerald-600/30 text-emerald-900 font-semibold'
                            : 'bg-[#F8FCFA] border-emerald-950/[0.07] text-slate-600'
                        }`}
                      >
                        <span className="truncate">{zh ? r.method.split(' / ')[0] : r.method.split(' / ').pop()}</span>
                        <span className="font-mono tabular-nums shrink-0">
                          r {r.spearman} · err {r.rankErr}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </BenchCard>
            )}
          </div>
        </div>

        {/* Compact 4-column horizontal strip: Zero-shot vs Fine-tuned across all 4 suites */}
        <div className="rounded-2xl border border-emerald-950/[0.09] bg-white shadow-[0_1px_2px_rgba(6,78,59,0.04)] p-4 sm:p-5 space-y-3.5">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-emerald-950/[0.06]">
            <span className="text-[13.5px] sm:text-sm font-semibold text-[#0C261B]">
              {zh ? '零样本与微调对照 · 4 项主基准' : 'Zero-shot vs fine-tuned · 4 primary suites'}
            </span>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2 rounded-xs bg-slate-300 inline-block" />
                {zh ? '最佳零样本基线' : 'Best zero-shot baseline'}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2 rounded-xs bg-emerald-400/80 inline-block" />
                {zh ? 'SUDOKU 零样本' : 'SUDOKU zero-shot'}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2 rounded-xs bg-emerald-700 inline-block" />
                {zh ? 'SUDOKU 微调' : 'SUDOKU fine-tuned'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {dumbbellRows.map((r) => {
              const scale = Math.max(r.baseline, r.zeroShot, r.fineTuned, 0.5) * 1.08;
              const items = [
                { label: r.baselineName, val: r.baseline, barClass: 'bg-slate-300/90', textClass: 'text-slate-500' },
                {
                  label: zh ? '零样本' : 'Zero-shot',
                  val: r.zeroShot,
                  barClass: 'bg-emerald-400',
                  textClass: r.zeroShotWins ? 'text-emerald-700 font-semibold' : 'text-slate-600',
                },
                { label: zh ? '微调' : 'Fine-tuned', val: r.fineTuned, barClass: 'bg-emerald-700', textClass: 'text-[#0C261B] font-bold' },
              ];
              return (
                <div
                  key={r.label}
                  className="rounded-xl border border-emerald-950/[0.07] bg-[#F8FCFA] px-3.5 py-3 space-y-2.5"
                >
                  <div className="text-xs font-semibold text-[#0C261B] truncate">{r.label}</div>
                  <div className="space-y-1.5">
                    {items.map((it) => (
                      <div key={it.label} className="grid grid-cols-[64px_1fr_38px] items-center gap-2 text-[11px]">
                        <span className="text-slate-500 truncate">{it.label}</span>
                        <span className="h-1.5 rounded-full bg-emerald-950/[0.07] overflow-hidden">
                          <span
                            className={`block h-full rounded-full ${it.barClass}`}
                            style={{
                              width: play ? `${Math.max(6, (it.val / scale) * 100)}%` : '0%',
                              transition: 'width 700ms cubic-bezier(0.22, 1, 0.36, 1)',
                            }}
                          />
                        </span>
                        <span className={`font-mono tabular-nums text-right ${it.textClass}`}>{it.val.toFixed(3)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
