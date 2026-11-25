import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { ArrowRight, Pause, Play, RotateCcw, X, Maximize2 } from 'lucide-react';
import type { Lang } from '../../lib/cytoDomain';
import { EyebrowHeading, HotspotFigure, ModelIntro, useAutoStep, useInView } from './shared';
import { TaiyiBarList } from './BenchCharts';
import './spatial.css';

const ASSETS = '/assets/spatial/';
const motionQuery = '(prefers-reduced-motion: reduce)';
const subscribeMotion = (notify: () => void) => {
  const query = window.matchMedia(motionQuery);
  query.addEventListener('change', notify);
  return () => query.removeEventListener('change', notify);
};
const useReducedMotion = () => useSyncExternalStore(subscribeMotion, () => window.matchMedia(motionQuery).matches, () => true);
type Zoom = (name: string, alt: string) => void;
type Row = { label: string; value: number };
const rows = (names: string[], values: number[]): Row[] => names.map((label, i) => ({ label, value: values[i] }));
// Manuscript Tables 2–4: class means, median ARI, and geometry-specific medium-tier accuracy.
const retrievalNames = ['SUDOKU', 'QueST', 'GeST', 'Novae', 'CellPLM'];
const retrieval = [[.496, .416, .447, .234, .332], [.687, .684, .599, .551, .243]];
const clusterNames = ['SUDOKU', 'STAGATE', 'BANKSY', 'CellPLM', 'Novae'];
const cluster = [[.342, .312, .111, .113, .264], [.493, .420, .091, .115, .334], [.520, .154, .440, .438, .121]];
const completion = [
  { image: 'scattered', zh: '散点缺失', en: 'Scattered', values: [.378, .321, .346, .339] },
  { image: 'block', zh: '内部块状', en: 'Interior block', values: [.390, .326, .368, .307] },
  { image: 'shell', zh: '外围环带', en: 'Outer shell', values: [.376, .282, .324, .323] },
  { image: 'multiple', zh: '多块缺失', en: 'Multiple blocks', values: [.373, .296, .330, .315] },
];

function Choices({ labels, value, onChange, label }: { labels: string[]; value: number; onChange: (n: number) => void; label: string }) {
  return <div className="spatial-choices" role="group" aria-label={label}>{labels.map((text, i) => <button type="button" key={text} aria-pressed={i === value} onClick={() => onChange(i)}>{text}</button>)}</div>;
}
function TaskTabs({ id, labels, value, onChange }: { id: string; labels: string[]; value: number; onChange: (n: number) => void }) {
  return <div className="spatial-tabs" role="tablist" aria-label={labels.join(' / ')}>{labels.map((text, i) => <button type="button" role="tab" id={`${id}-tab-${i}`} aria-controls={`${id}-panel`} aria-selected={value === i} tabIndex={value === i ? 0 : -1} key={text} onClick={() => onChange(i)} onKeyDown={e => {
    let next: number | undefined;
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') next = (i + 1) % 2;
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = 1;
    if (next !== undefined) { e.preventDefault(); onChange(next); document.getElementById(`${id}-tab-${next}`)?.focus(); }
  }}><span className="spatial-tab-number">0{i + 1}</span>{text}<ArrowRight size={16} aria-hidden="true" /></button>)}</div>;
}
function Bars({ entries, title, lang, replay, paused, reduced, digits = 3, lower = false }: { entries: Row[]; title: string; lang: Lang; replay: number; paused: boolean; reduced: boolean; digits?: number; lower?: boolean }) {
  const [ref, visible] = useInView<HTMLDivElement>(false, .15);
  const [play, setPlay] = useState(false);
  const key = entries.map(r => r.value).join(',');
  useEffect(() => {
    if (reduced || paused) { setPlay(true); return; }
    if (!visible) { setPlay(false); return; }
    setPlay(false);
    const id = window.setTimeout(() => setPlay(true), 70);
    return () => window.clearTimeout(id);
  }, [visible, replay, key, paused, reduced]);
  return <div ref={ref} className="spatial-bars" aria-label={title}>
    <TaiyiBarList title={title} entries={entries.map(r => ({ ...r, ours: r.label === 'SUDOKU' }))} zoomAxis={[0, 1]} fullAxis={[0, 1]} axisMode="full" digits={digits} better={lower ? 'lower' : 'higher'} play={play} compact />
    <div className="spatial-axis"><span>0</span><span>{lang === 'zh' ? (lower ? '越低越好' : '越高越好') : (lower ? 'Lower is better' : 'Higher is better')}</span><span>1</span></div>
  </div>;
}
function MapImage({ name, alt, onZoom, animation = '', context, replay = 0 }: { name: string; alt: string; onZoom: Zoom; animation?: string; context?: string; replay?: number }) {
  const [ref, visible] = useInView<HTMLDivElement>(false, .1);
  return <div ref={ref} className={`spatial-map ${animation}`} data-visible={visible}>
    <button type="button" className="spatial-map-button" aria-label={alt} onClick={() => onZoom(name, alt)}>
      {context ? <><img className="spatial-context" src={`${ASSETS}${context}.png`} alt="" loading="lazy" /><img key={`${name}-${replay}`} className="spatial-reveal" src={`${ASSETS}${name}.png`} alt={alt} loading="lazy" /></> : <img src={`${ASSETS}${name}.png`} alt={alt} loading="lazy" />}
      {animation && <span key={`scan-${replay}`} className="spatial-scan" aria-hidden="true" />}
      <span className="spatial-zoom-icon" aria-hidden="true"><Maximize2 size={13} /></span>
    </button>
  </div>;
}
function Architecture({ lang, paused, reduced }: { lang: Lang; paused: boolean; reduced: boolean }) {
  const zh = lang === 'zh';
  const [ref, visible] = useInView<HTMLDivElement>(false, .2);
  const [picked, setPicked] = useState(false);
  // Use the same shared auto-step + HotspotFigure sliding spotlight as Cyto.Identity.
  const [stage, setStage] = useAutoStep(4, 4200, visible && !picked && !paused && !reduced);
  const titles = zh ? ['VQ-VAE 细胞状态编码器', '空间坐标感知 Transformer', '表征提取 · t = 0', '状态生成 · t > 0'] : ['VQ-VAE cell-state tokenizer', 'Coordinate-aware Transformer', 'Representation · t = 0', 'Generation · t > 0'];
  const tags = zh ? ['第一阶段 · 表达编码', '第二阶段 · 空间建模', '推理模式 · 表征', '推理模式 · 生成'] : ['Stage 1 · Expression', 'Stage 2 · Spatial context', 'Inference · Representation', 'Inference · Generation'];
  const descriptions = zh ? [
    '将基因表达编码为连续向量与两级离散编码；通过表达重构，学习保留细胞状态的粗粒度与残差信息。',
    '可见细胞的连续表征与空间坐标共同输入主干，2D-RoPE 感知位置；通过掩码去噪学习预测缺失细胞的两级编码。',
    '完整观察细胞及其邻域，提取上下文细胞表征与池化后的邻域表征，用于跨切片邻域检索和多尺度聚类。',
    '保留坐标，以可见细胞为条件，优先确定高置信度编码并逐步补全，用于细胞状态补全和克隆周围免疫招募预测。',
  ] : [
    'Encode gene expression as continuous embeddings and two-level discrete codes. Reconstruction preserves coarse cell states and their residual detail.',
    'Visible continuous embeddings and coordinates enter a 2D-RoPE backbone. Masked denoising learns to predict the two code levels at missing positions.',
    'With all cells visible, extract contextual cell embeddings and pooled niche embeddings for cross-section retrieval and multi-scale clustering.',
    'At fixed coordinates, condition on visible cells and iteratively commit high-confidence codes for state completion and clone-conditioned immune recruitment prediction.',
  ];
  const zones = [{ x: 20, y: 3, w: 34, h: 24 }, { x: .5, y: 28, w: 55, h: 70 }, { x: 67, y: 1, w: 32, h: 47 }, { x: 67, y: 52, w: 32, h: 47 }];
  return <div ref={ref} className="spatial-architecture-layout">
    <ol className="spatial-module-list">{titles.map((title, i) => <li key={title}><button type="button" aria-pressed={stage === i} onClick={() => { setPicked(true); setStage(i); }} onMouseEnter={() => { setPicked(true); setStage(i); }}>
      <span className="spatial-module-index">0{i + 1}</span><span><span className="spatial-kicker">{tags[i]}</span><strong>{title}</strong><span className="spatial-module-copy">{descriptions[i]}</span></span>
    </button></li>)}</ol>
    <div className="spatial-architecture-figure"><HotspotFigure src={`${ASSETS}sudoku-architecture.png`} alt={zh ? 'SUDOKU 两阶段模型架构与表征、生成推理模式' : 'SUDOKU two-stage architecture and representation / generation modes'} width={2271} height={1138} hotspot={zones[stage]} lang={lang} caption={zh ? '两阶段学习 · 同一空间主干 · 两种推理模式' : 'Two-stage learning · one spatial backbone · two inference modes'} />
      <p className="spatial-note">{zh ? '点击或移入左侧模块，查看对应架构。' : 'Select or hover a module to highlight its architecture.'}</p>
    </div>
  </div>;
}
function RetrievalCase({ kind, lang, onZoom, replay }: { kind: 'hesta' | 'dlpfc'; lang: Lang; onZoom: Zoom; replay: number }) {
  const zh = lang === 'zh';
  const [view, setView] = useState(0);
  const title = kind === 'hesta' ? (zh ? '心脏邻域检索' : 'Heart niche retrieval') : (zh ? '脑区 L4–L5 交界检索' : 'Brain L4–L5 junction');
  return <article className="spatial-card">
    <header><span className="spatial-kicker">{kind === 'hesta' ? 'HESTA · HEART' : 'DLPFC · L4–L5'}</span><h4>{title}</h4></header>
    <div className="spatial-retrieval-pair">
      <figure><figcaption>{zh ? '查询邻域' : 'Query niche'}</figcaption><MapImage name={`${kind}-query`} alt={`${title} · ${zh ? '查询' : 'query'}`} onZoom={onZoom} /></figure>
      <ArrowRight className="spatial-query-arrow" size={18} aria-hidden="true" />
      <figure><figcaption>{['SUDOKU', 'CellPLM', zh ? '参考区域' : 'Reference'][view]}</figcaption><MapImage key={view} name={`${kind}-${['sudoku', 'cellplm', 'reference'][view]}`} alt={`${title} · ${['SUDOKU', 'CellPLM', 'reference'][view]}`} onZoom={onZoom} context={`${kind}-${['sudoku', 'cellplm', 'reference'][view]}`} animation="spatial-retrieval-scan" replay={replay} /></figure>
    </div>
    <Choices label={title} labels={['SUDOKU', 'CellPLM', zh ? '参考' : 'Reference']} value={view} onChange={setView} />
    <div className="spatial-score-pair"><div><span>SUDOKU</span><strong>{kind === 'hesta' ? '0.99' : '0.87'}</strong></div><div><span>CellPLM</span><strong>{kind === 'hesta' ? '0.61' : '0.24'}</strong></div><small>{kind === 'hesta' ? 'AUPRC' : 'PCC'} · {zh ? '单例' : 'example'}</small></div>
    <p className="spatial-card-copy">{kind === 'hesta' ? (zh ? '给定心脏查询邻域，在另一张切片中寻找相似组织区域。' : 'Find a corresponding tissue region in another section from a heart query niche.') : (zh ? '以皮层交界为查询，检索另一张切片中相似的 L4–L5 邻域。' : 'Retrieve matching L4–L5 neighborhoods across cortical sections.')}</p>
    <p className="spatial-note">{zh ? '深蓝表示更高相似度；各模型分别按分位数着色。' : 'Darker blue: higher similarity; percentile scales are model-specific.'}</p>
  </article>;
}

export const SpatialPanel: React.FC<{ lang: Lang }> = ({ lang }) => {
  const zh = lang === 'zh';
  const reduced = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const [replay, setReplay] = useState(0);
  const [repTab, setRepTab] = useState(0);
  const [genTab, setGenTab] = useState(0);
  const [cohort, setCohort] = useState(0);
  const [scale, setScale] = useState(0);
  const [recruitMetric, setRecruitMetric] = useState(0);
  const [zoom, setZoom] = useState<{ name: string; alt: string } | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const onZoom: Zoom = (name, alt) => setZoom({ name, alt });
  useEffect(() => {
    if (!zoom || !dialog.current) return;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.current.showModal();
    return () => { document.body.style.overflow = overflow; previous?.focus(); };
  }, [zoom]);
  const barProps = { lang, replay, paused, reduced };
  const scales = zh ? ['脑区', '皮层层带', '细胞类型'] : ['Region', 'Cortical band', 'Cell type'];
  const repLabels = zh ? ['跨切片邻域检索', '多尺度聚类'] : ['Cross-section niche retrieval', 'Multi-scale clustering'];
  const genLabels = zh ? ['细胞状态补全', '免疫招募预测'] : ['Cell-state completion', 'Immune recruitment'];
  return <div className="spatial-story space-y-12 sm:space-y-16" data-paused={paused || reduced} data-reduced={reduced}>
    <ModelIntro lang={lang} eyebrow="01 / CYTO.SPATIAL · SUDOKU" name="Cyto.Spatial"
      tagline={zh ? '面向空间转录组表征学习与生成的统一基础模型' : 'A unified foundation model for spatial transcriptomic representation and generation'}
      description={zh ? 'SUDOKU 是融合基因表达与空间位置的基础模型，通过 VQ-VAE 表达编码与空间坐标感知 Transformer 掩码去噪的两阶段训练，统一支持跨切片邻域检索、多尺度聚类、细胞状态补全与免疫招募预测。' : 'SUDOKU integrates gene expression and spatial positions through two-stage learning—VQ-VAE expression encoding followed by masked denoising with a coordinate-aware Transformer—to support cross-section niche retrieval, multi-scale clustering, cell-state completion, and immune recruitment prediction.'}
      subnav={[{ href: '#spatial-architecture', label: zh ? '模型架构' : 'Model architecture' }, { href: '#spatial-representation', label: zh ? 'SUDOKU 表征任务' : 'SUDOKU representation' }, { href: '#spatial-generation', label: zh ? 'SUDOKU 生成任务' : 'SUDOKU generation' }]}
      githubUrl="https://github.com/Cyto-System/Cyto.Spatial" />
    <section className="spatial-section" aria-labelledby="spatial-architecture">
      <div className="spatial-heading-row"><EyebrowHeading id="spatial-architecture" index="01" kicker="MODEL ARCHITECTURE" title={zh ? '模型架构' : 'Model architecture'} accent={zh ? '两阶段学习，统一表征与生成。' : 'Two-stage learning. Unified representation and generation.'} /><div className="spatial-motion-controls">
        <button type="button" onClick={() => setPaused(p => !p)} disabled={reduced} aria-pressed={paused}>{paused ? <Play size={14} /> : <Pause size={14} />}{zh ? (paused ? '播放动效' : '暂停动效') : (paused ? 'Play' : 'Pause')}</button>
        <button type="button" onClick={() => { setReplay(n => n + 1); setPaused(false); }} disabled={reduced}><RotateCcw size={14} />{zh ? '重播动效' : 'Replay'}</button>
      </div></div>
      <Architecture key={replay} lang={lang} paused={paused} reduced={reduced} />
    </section>
    <section className="spatial-section" aria-labelledby="spatial-representation">
      <EyebrowHeading id="spatial-representation" index="02" kicker="REPRESENTATION" title={zh ? 'SUDOKU 表征任务：' : 'SUDOKU representation:'} accent={zh ? '跨切片邻域检索与多尺度聚类' : 'Cross-section niche retrieval & multi-scale clustering'} />
      <div className="spatial-task-toolbar"><TaskTabs id="spatial-rep" labels={repLabels} value={repTab} onChange={setRepTab} /><button type="button" className="spatial-replay" disabled={reduced} onClick={() => { setReplay(n => n + 1); setPaused(false); }}><RotateCcw size={13} />{zh ? '重播表征动效' : 'Replay representation'}</button></div>
      <div id="spatial-rep-panel" role="tabpanel" aria-labelledby={`spatial-rep-tab-${repTab}`} tabIndex={0} key={repTab} className="spatial-task-panel">
        {repTab === 0 ? <><div className="spatial-board spatial-board-three" data-task="R1">
          <article className="spatial-card spatial-benchmark"><header><span className="spatial-kicker">BENCHMARK</span><h4>{zh ? '跨模型结果对比' : 'Model comparison'}</h4></header>
            <Choices label={zh ? '检索数据集' : 'Retrieval dataset'} labels={['HESTA', 'DLPFC']} value={cohort} onChange={setCohort} />
            <Bars {...barProps} entries={rows(retrievalNames, retrieval[cohort])} title={cohort === 0 ? 'AUPRC' : 'PCC'} />
            <p className="spatial-card-copy">{zh ? (cohort === 0 ? '八个器官的平均 AUPRC，衡量匹配区域的检索质量。' : '七类皮层邻域的平均 PCC，衡量预测相似度与参考匹配分数的一致性。') : (cohort === 0 ? 'Mean AUPRC across eight organs measures retrieval of matching regions.' : 'Mean PCC across seven niche classes measures agreement with reference matching scores.')}</p>
            <p className="spatial-note">{zh ? 'SUDOKU：任务微调。右侧为独立查询示例，不等同于队列平均。' : 'Task-fine-tuned SUDOKU. Examples at right are distinct from cohort means.'}</p>
          </article>
          <RetrievalCase kind="hesta" lang={lang} onZoom={onZoom} replay={replay} /><RetrievalCase kind="dlpfc" lang={lang} onZoom={onZoom} replay={replay} />
        </div></> : <><div className="spatial-board spatial-board-four" data-task="R2">
          <article className="spatial-card spatial-benchmark"><header><span className="spatial-kicker">BENCHMARK</span><h4>{zh ? '多尺度结果对比' : 'Multi-scale comparison'}</h4></header>
            <Choices label={zh ? '聚类尺度' : 'Clustering scale'} labels={scales} value={scale} onChange={setScale} />
            <Bars {...barProps} entries={rows(clusterNames, cluster[scale])} title={zh ? 'ARI 中位数' : 'Median ARI'} />
            <p className="spatial-card-copy">{zh ? '六张 MERFISH 脑切片，比较聚类与对应尺度参考标签的一致性。' : 'Six MERFISH brain sections; clustering agreement with scale-matched reference labels.'}</p>
            <p className="spatial-note">{zh ? 'SUDOKU：任务微调；三个尺度 ARI 中位数均领先所列方法。' : 'Task-fine-tuned SUDOKU leads the listed methods in median ARI at all three scales.'}</p>
          </article>
          {['region', 'band', 'cell'].map((name, i) => <article className="spatial-card" key={name}><header><span className="spatial-kicker">{['100 μm', '50 μm', zh ? '50 μm 上下文' : '50 μm context'][i]}</span><h4>{scales[i]}</h4></header>
            <MapImage name={`cluster-${name}`} alt={`${scales[i]} · ${zh ? '参考标签' : 'reference labels'}`} onZoom={() => onZoom('multiscale-labels', zh ? '多尺度参考标签与完整图例' : 'Multi-scale reference labels and full legend')} context={`cluster-${name}`} animation="spatial-cluster-scan" replay={replay} />
            <div className="spatial-result-stat"><strong>{cluster[i][0].toFixed(3)}</strong><span>SUDOKU · {zh ? 'ARI 中位数' : 'median ARI'}</span></div>
            <p className="spatial-card-copy">{(zh ? ['100 μm 邻域表征，区分脑区结构。', '50 μm 邻域表征，解析皮层层带。', '结合 50 μm 空间上下文，区分细胞类型。'] : ['Resolve brain-region structure with 100 μm niche embeddings.', 'Resolve cortical bands with 50 μm niche embeddings.', 'Distinguish cell types using 50 μm spatial context.'])[i]}</p>
            <p className="spatial-note">{zh ? '图示为参考标签；点击查看完整图例。' : 'Reference labels; click for the full legend.'}</p>
          </article>)}
        </div></>}
      </div>
    </section>
    <section className="spatial-section" aria-labelledby="spatial-generation">
      <EyebrowHeading id="spatial-generation" index="03" kicker="GENERATION" title={zh ? 'SUDOKU 生成任务：' : 'SUDOKU generation:'} accent={zh ? '细胞状态补全与免疫招募预测' : 'Cell-state completion & immune recruitment prediction'} />
      <div className="spatial-task-toolbar"><TaskTabs id="spatial-gen" labels={genLabels} value={genTab} onChange={setGenTab} /><button type="button" className="spatial-replay" disabled={reduced} onClick={() => { setReplay(n => n + 1); setPaused(false); }}><RotateCcw size={13} />{zh ? '重播生成动效' : 'Replay generation'}</button></div>
      <div id="spatial-gen-panel" role="tabpanel" aria-labelledby={`spatial-gen-tab-${genTab}`} tabIndex={0} key={genTab} className="spatial-task-panel">
        {genTab === 0 ? <><p className="spatial-task-intro">{zh ? '保留空间坐标，以可见细胞为条件恢复缺失状态；31 张切片，972 道补全题。' : 'Keep coordinates fixed and recover missing states from visible cells: 31 sections and 972 completion questions.'}</p>
          <div className="spatial-board spatial-board-four" data-task="G1">{completion.map((item, i) => <article key={item.image} className="spatial-card spatial-completion-card" style={{ '--spatial-delay': `${i * .35}s` } as React.CSSProperties}>
            <header><span className="spatial-kicker">MASK 0{i + 1}</span><h4>{zh ? item.zh : item.en}</h4></header>
            <MapImage name={`mask-${item.image}`} context={`mask-${item.image}-context`} alt={`${zh ? item.zh : item.en} · ${zh ? '待补全位置的真实类型' : 'ground-truth types at masked positions'}`} onZoom={onZoom} animation="spatial-completion-reveal" replay={replay} />
            <div className="spatial-flow-label"><span>{zh ? '已知上下文' : 'Context'}</span><ArrowRight size={13} /><span>{zh ? '缺失状态显现' : 'Reveal missing states'}</span></div>
            <Bars {...barProps} entries={rows(['SUDOKU', 'GeST', '5-NN', '1-NN'], item.values)} title={zh ? '中等难度 · 准确率' : 'Medium tier · accuracy'} />
            <p className="spatial-card-copy">{(zh ? ['补全分散在组织中的缺失细胞。', '根据周边上下文恢复内部缺失区域。', '利用内部可见细胞补全外围环带。', '同时补全多个分离的缺失区域。'] : ['Recover cells scattered across the tissue.', 'Recover an interior gap from its surroundings.', 'Complete an outer shell from visible inner context.', 'Complete several disconnected missing regions.'])[i]}</p>
          </article>)}</div>
          <div className="spatial-evidence-note"><p>{zh ? '图中灰色为可见输入，彩色为待预测位置的真实类型；动画展示补全位置，条形图展示模型实测准确率。' : 'Gray: visible input. Colors: ground-truth types at masked positions. The animation reveals completion targets; bars report measured model accuracy.'}</p><span>{zh ? '每窗 500 个细胞 · 中等难度掩码 40% · SUDOKU 任务微调' : '500 cells / window · medium tier: 40% masked · task-fine-tuned SUDOKU'}</span></div>
        </> : <><p className="spatial-task-intro">{zh ? '以实测肿瘤克隆为条件，生成周围 50 μm 环带的细胞状态，估计非肿瘤细胞中的免疫比例。' : 'Condition on a measured tumor clone, generate cell states in its surrounding 50 μm band, and estimate the immune fraction among non-tumor cells.'}</p>
          <div className="spatial-board spatial-board-recruit" data-task="G2">
            <article className="spatial-card spatial-benchmark"><header><span className="spatial-kicker">SPAC-seq · 125 {zh ? '克隆' : 'CLONES'}</span><h4>{zh ? '预测与实测的一致性' : 'Agreement with measurements'}</h4></header>
              <Choices label={zh ? '招募评测指标' : 'Recruitment metric'} labels={zh ? ['排序相关', '秩误差'] : ['Correlation', 'Rank error']} value={recruitMetric} onChange={setRecruitMetric} />
              <Bars {...barProps} entries={rows(['SUDOKU', 'GeST', zh ? '表达插值' : 'Interpolation'], recruitMetric === 0 ? [.77, .49, .11] : [.12, .20, .28])} title={recruitMetric === 0 ? (zh ? '平均 Spearman ρ' : 'Mean Spearman ρ') : (zh ? '中位秩误差' : 'Median rank error')} lower={recruitMetric === 1} digits={2} />
              <p className="spatial-card-copy">{zh ? '3 张切片、125 个克隆；平均相关系数按切片统计，秩误差取克隆中位数。' : 'Three sections and 125 clones. Correlations are averaged over sections; rank error is the median over clones.'}</p>
              <p className="spatial-note">{zh ? '模型输入克隆表达与空间上下文，不输入扰动身份。' : 'The model receives clone expression and spatial context, not perturbation identity.'}</p>
            </article>
            <article className="spatial-card spatial-recruit-case"><header><span className="spatial-kicker">Cd274 / PD-L1 {zh ? '敲除示例' : 'KNOCKOUT EXAMPLE'}</span><h4>{zh ? '克隆周围的免疫细胞分布' : 'Immune distribution around a clone'}</h4></header>
              <div className="spatial-recruit-maps">{['reference', 'sudoku', 'gest'].map((name, i) => <figure key={name} className={i === 1 ? 'spatial-generated-map' : ''}><figcaption>{[zh ? '实测' : 'Measured', 'SUDOKU', 'GeST'][i]}<strong>{['65%', '63%', '10%'][i]}</strong></figcaption>
                <MapImage name={`spac-${name}`} context={i === 1 ? 'spac-sudoku-context' : undefined} alt={`${zh ? '克隆周围细胞分布' : 'Cell distribution around a clone'} · ${name}`} onZoom={onZoom} animation={i === 1 ? 'spatial-immune-reveal' : ''} replay={replay} />
              </figure>)}</div>
              <div className="spatial-legend">{(zh ? ['克隆', '免疫细胞', '肿瘤细胞', '其他细胞'] : ['Clone', 'Immune', 'Tumor', 'Other']).map((label, i) => <span key={label}><i style={{ background: ['#ffd5d7', '#2f7ddd', '#ed4448', '#43aa52'][i] }} />{label}</span>)}</div>
              <p className="spatial-card-copy">{zh ? 'SUDOKU 预测免疫比例 63%，接近实测的 65%；GeST 为 10%。比例均以非肿瘤细胞为分母。' : 'SUDOKU predicts a 63% immune fraction, close to the measured 65%; GeST predicts 10%. All fractions use non-tumor cells as the denominator.'}</p>
              <p className="spatial-note">{zh ? '动效逐步显现固定位置上的生成免疫状态，展示静态预测分布，不表示细胞迁移轨迹。' : 'The animation reveals generated immune states at fixed positions: a static predicted distribution, not cell migration trajectories.'}</p>
            </article>
          </div>
        </>}
      </div>
    </section>
    {zoom && <dialog ref={dialog} className="spatial-dialog" aria-label={zoom.alt} onCancel={() => setZoom(null)} onClick={e => { if (e.target === e.currentTarget) setZoom(null); }}><div><header><span>{zoom.alt}</span><button type="button" onClick={() => setZoom(null)} aria-label={zh ? '关闭图片' : 'Close figure'}><X size={20} /></button></header><img src={`${ASSETS}${zoom.name}.png`} alt={zoom.alt} /></div></dialog>}
  </div>;
};