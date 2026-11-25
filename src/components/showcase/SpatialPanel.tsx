import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { motion } from 'motion/react';
import { ArrowDown, ArrowRight, Maximize2, RotateCcw, X } from 'lucide-react';
import type { Lang } from '../../lib/cytoDomain';
import { EyebrowHeading, ModelIntro, useInView } from './shared';
import { SpatialBenchmarks } from './SpatialBenchmarks';
import './spatial.css';

const ASSETS = '/assets/spatial/';
type Task = 'representation' | 'generation';

// Subscribe locally so changing the OS preference also stops an active walkthrough.
const motionQuery = '(prefers-reduced-motion: reduce)';
const subscribeMotion = (notify: () => void) => {
  const query = window.matchMedia(motionQuery);
  query.addEventListener('change', notify);
  return () => query.removeEventListener('change', notify);
};
const readMotion = () => window.matchMedia(motionQuery).matches;
const useReducedMotion = () => useSyncExternalStore(subscribeMotion, readMotion, () => true);

/** Only illustrations are animated. Paper images remain unchanged. */
function TaskWalkthrough({ lang }: { lang: Lang }) {
  const zh = lang === 'zh';
  const reduced = useReducedMotion();
  const [ref, visible] = useInView<HTMLDivElement>(false, 0.25);
  const [task, setTask] = useState<Task>('representation');
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const stages = task === 'representation'
    ? (zh ? ['读取表达与位置', '结合周围细胞', '识别组织结构', '聚类与跨片检索'] : ['Read expression + position', 'Read the neighborhood', 'Resolve tissue structure', 'Cluster and retrieve'])
    : (zh ? ['保留已测细胞', '预测缺失状态', '逐轮补全', '得到空间分布'] : ['Keep observed cells', 'Predict missing states', 'Fill iteratively', 'Read spatial patterns']);
  useEffect(() => {
    if (!visible || !playing || reduced) return;
    const timer = window.setInterval(() => setStep(s => {
      if (s >= 3) return s;
      return s + 1;
    }), 1500);
    return () => window.clearInterval(timer);
  }, [visible, playing, reduced, task]);
  useEffect(() => { if (step === 3) setPlaying(false); }, [step]);
  const change = (next: Task) => { setTask(next); setStep(0); setPlaying(true); };
  const shown = reduced ? 3 : step;
  const colors = ['#2f7cc4', '#daaf49', '#dc768c'];
  return <div ref={ref} className="spatial-demo">
    <div className="spatial-demo-top">
      <div className="spatial-choice" aria-label={zh ? '任务演示' : 'Task demonstration'}>
        {(['representation', 'generation'] as const).map((t, i) => <button key={t} type="button" aria-pressed={task === t} onClick={() => change(t)}>
          <span>0{i + 1}</span>{t === 'representation' ? (zh ? '表征 · 看懂组织' : 'Represent · understand') : (zh ? '生成 · 补全状态' : 'Generate · complete')}
        </button>)}
      </div>
      <span className="spatial-note">{zh ? '流程示意，不是模型运行结果' : 'Illustration, not a model output'}</span>
    </div>
    <div className="spatial-demo-body">
      <div className="spatial-demo-copy">
        <span className="spatial-kicker">{task === 'representation' ? 'REPRESENTATION' : 'GENERATION'}</span>
        <h4>{task === 'representation' ? (zh ? '给一张切片，读出它的结构。' : 'Read the organization of a tissue.') : (zh ? '给周围细胞，补全缺失的状态。' : 'Use neighboring cells to fill missing states.')}</h4>
        <p>{task === 'representation' ? (zh ? '哪些细胞相似？哪些区域属于同一类邻域？从细胞到组织区域，用同一个模型理解。' : 'Which cells are alike? Which regions share a niche? Use one model across cells and tissue regions.') : (zh ? '保留细胞位置，用周围已测信息逐步补全。预测的是细胞状态，不是新坐标。' : 'Keep cell positions fixed. Complete missing states using observed neighbors, without inventing coordinates.')}</p>
        <a className="spatial-text-link" href={task === 'representation' ? '#spatial-representation' : '#spatial-generation'}>{zh ? '查看真实结果' : 'Explore the results'} <ArrowDown size={14} /></a>
      </div>
      <div className="spatial-demo-map">
        <svg viewBox="0 0 560 225" role="img" aria-label={zh ? '固定坐标的细胞示意，从输入到空间表征或状态补全' : 'Illustrative cells at fixed positions, from input to representations or completed states'}>
          <rect x="8" y="8" width="232" height="205" rx="18" fill="#fff" stroke="#d9e7df" />
          <rect x="320" y="8" width="232" height="205" rx="18" fill="#fff" stroke="#d9e7df" />
          {[0, 1].map(side => <g key={side} transform={`translate(${side * 312},0)`}>
            {Array.from({ length: 80 }, (_, i) => {
              const col = i % 10, row = Math.floor(i / 10);
              const x = 30 + col * 20 + Math.sin(i * 7) * 3, y = 31 + row * 22 + Math.cos(i * 3) * 3;
              const group = Math.min(2, Math.floor((row + col * 0.25) / 3.5));
              const masked = col >= 3 && col <= 6 && row >= 2 && row <= 6;
              const complete = task === 'representation' ? side === 0 || shown >= 1 : !masked || side === 1 && shown >= 1 + i % 3;
              const fill = complete ? colors[group] : '#d6dfdb';
              return <motion.circle key={i} cx={x} cy={y} r={5.3} animate={{ fill, opacity: side === 1 && shown === 0 ? 0.42 : 1 }} transition={{ duration: reduced ? 0 : 0.55, delay: reduced ? 0 : (i % 10) * .025 }} />;
            })}
            {task === 'representation' && <motion.rect x="64" y="43" width="92" height="85" rx="28" fill="none" stroke="#007a57" strokeWidth="2" strokeDasharray="5 4" animate={{ opacity: side === 0 || shown >= 2 ? 1 : 0 }} transition={{ duration: reduced ? 0 : .5 }} />}
          </g>)}
          <path d="M262 111h34m-7-7 7 7-7 7" fill="none" stroke="#00996e" strokeWidth="2" />
        </svg>
        <div className="spatial-demo-labels"><span>{zh ? '输入' : 'Input'}</span><span>{task === 'representation' ? (zh ? '相似细胞与邻域' : 'Related cells and niches') : (zh ? '固定位置，补全状态' : 'Fixed positions, completed states')}</span></div>
      </div>
    </div>
    <div className="spatial-stepbar">
      {stages.map((s, i) => <button key={s} type="button" aria-pressed={shown === i} onClick={() => { setStep(i); setPlaying(false); }} disabled={!!reduced} className={shown >= i ? 'is-reached' : ''}><span>0{i + 1}</span>{s}</button>)}
      <button type="button" className="spatial-replay" onClick={() => { setStep(0); setPlaying(true); }} disabled={!!reduced} aria-label={zh ? '重播流程演示' : 'Replay demonstration'}><RotateCcw size={16} /></button>
    </div>
  </div>;
}

function PaperFigure({ name, alt, className = '', onZoom }: { name: string; alt: string; className?: string; onZoom: (name: string, alt: string) => void }) {
  return <button type="button" className={`spatial-image ${className}`} onClick={() => onZoom(name, alt)} aria-label={`${alt} · Zoom`}>
    <img src={`${ASSETS}${name}.png`} alt={alt} loading="lazy" decoding="async" />
    <span className="spatial-zoom" aria-hidden="true"><Maximize2 size={14} /></span>
  </button>;
}

export const SpatialPanel: React.FC<{ lang: Lang }> = ({ lang }) => {
  const zh = lang === 'zh';
  const reduced = useReducedMotion();
  const [representation, setRepresentation] = useState<'hesta' | 'dlpfc' | 'cluster'>('hesta');
  const [details, setDetails] = useState(false);
  const [zoom, setZoom] = useState<{ name: string; alt: string } | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const zoomFigure = (name: string, alt: string) => setZoom({ name, alt });
  useEffect(() => {
    if (!zoom || !dialog.current) return;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.current.showModal();
    return () => { document.body.style.overflow = overflow; previous?.focus(); };
  }, [zoom]);
  const reveal = { initial: reduced ? false as const : { opacity: 0, y: 18 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: .08 }, transition: { duration: reduced ? 0 : .5 } };
  return <div className="spatial-story space-y-12 sm:space-y-16">
    <ModelIntro lang={lang} eyebrow="01 / CYTO.SPATIAL · SUDOKU" name="Cyto.Spatial"
      tagline={zh ? '看懂组织结构，补全细胞状态。' : 'Understand tissue. Complete cell states.'}
      description={zh ? '输入基因表达和细胞位置，完成两类任务：用表征识别相似细胞与邻域，用生成补全缺失的细胞状态。适用于人和小鼠空间转录组。' : 'Start with gene expression and cell positions. Representations identify related cells and niches; generation completes missing cell states. Built for human and mouse spatial transcriptomics.'}
      subnav={[{ href: '#spatial-representation', label: zh ? '表征任务' : 'Representation' }, { href: '#spatial-generation', label: zh ? '生成任务' : 'Generation' }, { href: '#spatial-architecture', label: zh ? '模型原理' : 'How it works' }, { href: '#spatial-benchmark', label: zh ? '完整评测' : 'All benchmarks' }]}
      githubUrl="https://github.com/Cyto-System/Cyto.Spatial" />
    <TaskWalkthrough lang={lang} />

    <motion.section {...reveal} className="spatial-section" aria-labelledby="spatial-representation">
      <EyebrowHeading id="spatial-representation" index="01" kicker="REPRESENTATION" title={zh ? '表征：找到相似的细胞和区域。' : 'Representation: find related cells and regions.'} accent={zh ? '跨切片检索，也能读出多尺度结构。' : 'Across sections. Across spatial scales.'} />
      <p className="spatial-lead">{zh ? '给定一个邻域，在另一张切片寻找相似区域；或者将整张切片按细胞类型、层带与脑区分组。' : 'Query a neighborhood in another section, or group a tissue by cell type, laminar band, and brain region.'}</p>
      <div className="spatial-choice" aria-label={zh ? '表征任务案例' : 'Representation cases'}>
        {(['hesta', 'dlpfc', 'cluster'] as const).map((id, i) => <button key={id} type="button" aria-pressed={representation === id} onClick={() => setRepresentation(id)}>{(zh ? ['心脏邻域检索', '皮层交界检索', '多尺度聚类'] : ['Heart niche retrieval', 'Cortical junction retrieval', 'Multi-scale clustering'])[i]}</button>)}
      </div>
      <motion.div key={representation} initial={reduced ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : .3 }} className="spatial-paper-card">
        {representation !== 'cluster' ? <>
          <div className="spatial-result-heading"><div><span className="spatial-kicker">{representation === 'hesta' ? 'HESTA · STEREO-SEQ' : 'DLPFC · VISIUM'}</span><h4>{representation === 'hesta' ? (zh ? '在另一张切片中，找到心脏。' : 'Find the heart in another section.') : (zh ? '识别另一张切片上的 L4/L5 交界。' : 'Locate the L4/L5 junction in another section.')}</h4></div><span className="spatial-badge">{zh ? '论文单例 · 非全队列均值' : 'Paper example · not a cohort average'}</span></div>
          <div className="spatial-map-grid">
            {['query', 'reference', 'sudoku', 'cellplm'].map((kind, i) => <figure key={kind} className={kind === 'sudoku' ? 'spatial-highlight' : ''}>
              <figcaption><span>0{i + 1}</span>{(zh ? ['查询邻域', representation === 'hesta' ? '目标心脏标签' : '目标匹配分数', 'SUDOKU 相似度', 'CellPLM 相似度'] : ['Query niche', representation === 'hesta' ? 'Target heart labels' : 'Target matching score', 'SUDOKU similarity', 'CellPLM similarity'])[i]}</figcaption>
              <PaperFigure name={`${representation}-${kind}`} alt={`${representation.toUpperCase()} · ${(zh ? ['查询邻域', '目标参考', 'SUDOKU 相似度', 'CellPLM 相似度'] : ['Query niche', 'Target reference', 'SUDOKU similarity', 'CellPLM similarity'])[i]}`} onZoom={zoomFigure} />
            </figure>)}
          </div>
          <div className="spatial-result-foot"><p>{zh ? '从左到右：查询、目标参考、两种模型的检索图。相似度图中蓝色越深，匹配程度越高；各模型颜色按自身分位数缩放。' : 'Left to right: query, target reference, and two retrieval maps. Darker blue indicates stronger similarity; each model uses its own percentile color scale.'}</p><div className="spatial-score"><span>{representation === 'hesta' ? 'AUPRC' : 'Pearson r'} <small>{zh ? '单例' : 'example'}</small></span><strong>{representation === 'hesta' ? '0.99' : '0.87'}</strong><span>vs {representation === 'hesta' ? '0.61' : '0.24'}<small>CellPLM</small></span></div></div>
          <button className="spatial-text-link" type="button" onClick={() => zoomFigure('niche-retrieval', zh ? '邻域检索完整原图' : 'Full niche retrieval figure')}>{zh ? '查看完整原图与评测曲线' : 'View the full figure and evaluation curves'} <Maximize2 size={14} /></button>
        </> : <>
          <div className="spatial-result-heading"><div><span className="spatial-kicker">MOUSE BRAIN · MERFISH</span><h4>{zh ? '同一张组织，从三个尺度理解。' : 'One tissue, three levels of organization.'}</h4></div><span className="spatial-badge">{zh ? '参考标签示例，不是预测图' : 'Reference labels, not predictions'}</span></div>
          <PaperFigure name="multiscale-labels" alt={zh ? '脑区、层带、细胞类型三个层级的参考标签' : 'Reference labels at region, band, and cell-type levels'} className="spatial-label-figure" onZoom={zoomFigure} />
          <div className="spatial-metric-row">{(zh ? ['脑区', '层带', '细胞类型'] : ['Region', 'Band', 'Cell type']).map((label, i) => <div key={label}><span>{label}</span><strong>{['0.342', '0.493', '0.520'][i]} <small>ARI</small></strong></div>)}</div>
          <p className="spatial-note">{zh ? '图为一张切片的评测参考标签。分数为 SUDOKU 微调后在 6 张切片上的 ARI 中位数，并非这张图的单例分数。灰色为该层级未定义的细胞。' : 'The figure shows reference labels on one section. Scores are median ARI across six sections after task fine-tuning, not scores for this example. Gray cells are undefined at that level.'}</p>
        </>}
      </motion.div>
    </motion.section>

    <motion.section {...reveal} className="spatial-section" aria-labelledby="spatial-generation">
      <EyebrowHeading id="spatial-generation" index="02" kicker="GENERATION" title={zh ? '生成：从已知邻域，补全缺失状态。' : 'Generation: complete states from known neighbors.'} accent={zh ? '位置不变，预测细胞如何分布。' : 'Keep positions fixed. Predict the cellular pattern.'} />
      <p className="spatial-lead">{zh ? '隐藏部分细胞的表达，保留它们的位置。模型读取周围可见细胞，再逐轮填入缺失的状态。' : 'Hide some expression profiles while keeping their positions. Read the visible neighbors, then fill missing states iteratively.'}</p>
      <div className="spatial-paper-card">
        <div className="spatial-result-heading"><div><span className="spatial-kicker">SPATIAL COMPLETION</span><h4>{zh ? '四种缺失形态，同一个补全任务。' : 'Four missing geometries, one completion task.'}</h4></div><span className="spatial-badge">{zh ? '评测题目示例' : 'Benchmark inputs'}</span></div>
        <div className="spatial-map-grid spatial-mask-grid">{['scattered', 'block', 'shell', 'multiple'].map((name, i) => <figure key={name}><figcaption>{(zh ? ['散点缺失', '内部块状', '外围环带', '多块缺失'] : ['Scattered', 'Interior block', 'Shell', 'Multiple blocks'])[i]}</figcaption><PaperFigure name={`mask-${name}`} alt={`${zh ? '掩码题目' : 'Mask example'}: ${name}`} onZoom={zoomFigure} /></figure>)}</div>
        <div className="spatial-result-foot"><p>{zh ? '灰点是提供给模型的可见细胞；彩点是待补全位置的真实类型，不是模型预测。图示遮蔽比例为 40%。' : 'Gray cells are visible inputs. Colored cells show true types at masked positions, not model predictions. Examples use 40% masking.'}</p><div className="spatial-score"><span>{zh ? '类型准确率' : 'Type accuracy'}<small>{zh ? '微调后' : 'fine-tuned'}</small></span><strong>0.401</strong></div></div>
        <div className="spatial-inline-facts"><span>{zh ? '31 张切片' : '31 sections'}</span><span>{zh ? '972 道题' : '972 questions'}</span><span>{zh ? '人脑 · 小鼠脑 · 小鼠肾' : 'Human brain · mouse brain · mouse kidney'}</span><button type="button" className="spatial-text-link" onClick={() => zoomFigure('generation-questions', zh ? '生成评测题目完整图' : 'Full generation benchmark inputs')}>{zh ? '查看全部示例' : 'All examples'} <ArrowRight size={14} /></button></div>
      </div>
      <div className="spatial-paper-card">
        <div className="spatial-result-heading"><div><span className="spatial-kicker">SPAC-SEQ · CD274 (PD-L1)</span><h4>{zh ? '生成肿瘤克隆周围的细胞分布。' : 'Generate the cells surrounding a tumor clone.'}</h4></div><span className="spatial-badge">{zh ? '论文生成结果' : 'Generation result from the paper'}</span></div>
        <p className="spatial-lead">{zh ? '给定实测肿瘤克隆，补全周围 50 μm 环带，再估计免疫细胞占比。下面是一个 Cd274 敲除克隆的实测与预测对照。' : 'Condition on a measured tumor clone, complete its 50 μm surrounding band, and estimate the immune fraction. Below is a measured-versus-generated Cd274-knockout example.'}</p>
        <div className="spatial-map-grid spatial-generation-grid">{['reference', 'sudoku', 'gest'].map((name, i) => <figure key={name} className={name === 'sudoku' ? 'spatial-highlight' : ''}><figcaption>{i === 0 ? (zh ? '实测' : 'Measured') : i === 1 ? 'SUDOKU' : 'GeST'}<strong>{['65%', '63%', '10%'][i]}</strong></figcaption><PaperFigure name={`spac-${name}`} alt={`${name}: ${['65%', '63%', '10%'][i]} ${zh ? '免疫细胞占比' : 'immune fraction'}`} onZoom={zoomFigure} /></figure>)}</div>
        <div className="spatial-legend">{(zh ? ['免疫细胞', '肿瘤细胞', '其他细胞', '肿瘤克隆'] : ['Immune', 'Tumor', 'Other cells', 'Tumor clone']).map((label, i) => <span key={label}><i style={{ background: ['#2f7cc4', '#ed3b48', '#3ba64b', '#ffd7d8'][i] }} />{label}</span>)}</div>
        <div className="spatial-result-foot"><p>{zh ? '这是一例空间分布对照，不代表全队列。全队列包含 3 张切片、125 个克隆，SUDOKU 的平均 Spearman ρ 为 0.77。克隆条件生成是论文实验，当前推理包不含该工作流。' : 'This spatial comparison is one example, not the full cohort. Across three sections and 125 clones, SUDOKU achieves mean Spearman ρ = 0.77. Clone-conditioned generation is a paper experiment, not a workflow included in the inference package.'}</p><button type="button" className="spatial-text-link" onClick={() => zoomFigure('spac-generation', zh ? 'SPAC-seq 完整评测图' : 'Full SPAC-seq evaluation')}>{zh ? '查看完整原图' : 'Full figure'} <Maximize2 size={14} /></button></div>
      </div>
    </motion.section>

    <motion.section {...reveal} className="spatial-section" aria-labelledby="spatial-architecture">
      <EyebrowHeading id="spatial-architecture" index="03" kicker="HOW IT WORKS" title={zh ? '先读懂细胞，再联系它的邻居。' : 'Encode a cell, then read its neighborhood.'} accent={zh ? '同一个空间主干，两种用法。' : 'One spatial backbone, two ways to use it.'} />
      <div className="spatial-process">{(zh ? [['输入', '基因表达 + 细胞位置'], ['空间模型', '结合周围细胞理解当前细胞'], ['两种输出', '读取表征，或补全状态']] : [['Input', 'Expression + cell positions'], ['Spatial model', 'Interpret a cell in its neighborhood'], ['Two outputs', 'Read embeddings or complete states']]).map(([title, body], i) => <div key={title}><span>0{i + 1}</span><h4>{title}</h4><p>{body}</p></div>)}</div>
      <details className="spatial-details"><summary>{zh ? '展开模型架构图与技术说明' : 'Explore the architecture and technical details'}</summary><div className="spatial-details-body"><PaperFigure name="sudoku-architecture" alt={zh ? 'SUDOKU 模型架构' : 'SUDOKU architecture'} onZoom={zoomFigure} /><p className="spatial-note">{zh ? '表达编码器将细胞表达压缩为向量和两级离散编码；空间 Transformer 结合二维坐标，读取上下文或预测缺失编码。图中的随机掩码、重构解码器和损失函数描述预训练，当前代码只发布推理与评测。' : 'The encoder maps expression to vectors and two-level codes. A spatial Transformer incorporates 2D coordinates to read context or predict missing codes. Random masking, the reconstruction decoder, and losses describe pretraining; the released code supports inference and evaluation only.'}</p></div></details>
    </motion.section>

    <section id="spatial-benchmark" className="spatial-section spatial-benchmark-details">
      <div className="spatial-result-heading"><div><span className="spatial-kicker">BENCHMARK DETAILS</span><h4>{zh ? '想看更多？展开完整对比。' : 'Go deeper with the full comparisons.'}</h4></div></div>
      <p className="spatial-note">{zh ? '以上图与分数均来自论文，不是本网页实时运行结果。保留零样本与微调的区别：生成任务零样本准确率为 0.355，低于距离加权 300-NN 的 0.385；微调后为 0.401。任务微调权重与完整评测数据不包含在发布包中。' : 'Figures and scores come from the manuscript, not live inference on this page. Zero-shot generation accuracy is 0.355, below distance-weighted 300-NN at 0.385; fine-tuning reaches 0.401. Task-fine-tuned weights and complete evaluation inputs are not included in the release.'}</p>
      <details className="spatial-details" onToggle={e => setDetails(e.currentTarget.open)}><summary>{zh ? '完整模型对比 · 零样本与微调 · 分任务结果' : 'All models · zero-shot vs fine-tuned · task-level scores'}</summary>{details && <div className="spatial-details-body"><SpatialBenchmarks lang={lang} /></div>}</details>
    </section>
    {zoom && <dialog ref={dialog} className="spatial-lightbox" onCancel={() => setZoom(null)} onClick={e => { if (e.target === e.currentTarget) setZoom(null); }} aria-label={zoom.alt}>
      <div><header><span>{zoom.alt}</span><button type="button" onClick={() => setZoom(null)} aria-label={zh ? '关闭图片' : 'Close image'}><X size={22} /></button></header><img src={`${ASSETS}${zoom.name}.png`} alt={zoom.alt} /><a href={`${ASSETS}${zoom.name}.png`} target="_blank" rel="noreferrer">{zh ? '在新标签页查看原图' : 'Open the full-resolution image'}</a></div>
    </dialog>}
  </div>;
};