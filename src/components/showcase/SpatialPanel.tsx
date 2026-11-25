import React, { useEffect, useId, useRef, useState, useSyncExternalStore } from 'react';
import { motion } from 'motion/react';
import { ArrowDown, Maximize2, Pause, Play, X } from 'lucide-react';
import type { Lang } from '../../lib/cytoDomain';
import { EyebrowHeading, ModelIntro, useInView } from './shared';
import './spatial.css';

const ASSETS = '/assets/spatial/';
const motionQuery = '(prefers-reduced-motion: reduce)';
const subscribeMotion = (notify: () => void) => {
  const query = window.matchMedia(motionQuery);
  query.addEventListener('change', notify);
  return () => query.removeEventListener('change', notify);
};
const readMotion = () => window.matchMedia(motionQuery).matches;
const useReducedMotion = () => useSyncExternalStore(subscribeMotion, readMotion, () => true);
type Zoom = (name: string, alt: string) => void;

function PaperFigure({ name, alt, onZoom }: { name: string; alt: string; onZoom: Zoom }) {
  return <button type="button" className="spatial-image" onClick={() => onZoom(name, alt)} aria-label={alt}>
    <img src={`${ASSETS}${name}.png`} alt={alt} loading="lazy" decoding="async" />
    <span className="spatial-zoom" aria-hidden="true"><Maximize2 size={14} /></span>
  </button>;
}

/** Four linked views: two training stages, then two inference modes. */
function Architecture({ lang, onZoom }: { lang: Lang; onZoom: Zoom }) {
  const zh = lang === 'zh';
  const reduced = useReducedMotion();
  const [ref, visible] = useInView<HTMLDivElement>(false, .1);
  const [stage, setStage] = useState(0);
  const [playing, setPlaying] = useState(false);
  const projectionClip = useId();
  const stages = zh ? [
    {
      tag: '第一阶段 · 表达编码', title: 'VQ-VAE 细胞状态编码器',
      brief: '先学习细胞表达，将高维基因信息压缩为连续表征和两级离散编码。',
      detail: '表达编码器把每个细胞的基因表达映射到连续向量。第一级量化描述粗粒度状态，第二级量化补充残差信息；解码器通过重构表达，帮助编码器保留细胞状态。',
      input: '单细胞基因表达', output: '连续向量 + 两级细胞编码',
    },
    {
      tag: '第二阶段 · 空间建模', title: '空间坐标感知 Transformer',
      brief: '再结合细胞位置与邻域上下文，学习恢复被掩码的细胞状态。',
      detail: '可见细胞以连续表达向量输入，二维坐标通过 2D-RoPE 融入注意力。被掩码细胞保留坐标，由空间去噪主干读取周围信息；两个预测头分别预测粗粒度编码与残差编码。',
      input: '可见细胞表征 + 所有细胞坐标', output: '上下文表征 + 缺失状态分布',
    },
    {
      tag: '推理模式一 · 表征', title: '表征提取（t = 0）',
      brief: '完整观察邻域，读取细胞及邻域表征，用于检索与多尺度聚类。',
      detail: '当输入全部可见时，空间主干输出包含邻域信息的细胞表征。对邻域内表征进行平均池化，得到邻域表征，用于跨切片寻找相似区域，并解析不同尺度的组织结构。',
      input: '完整细胞表达与位置', output: '细胞表征 / 邻域表征',
    },
    {
      tag: '推理模式二 · 生成', title: '状态生成（t > 0）',
      brief: '固定细胞坐标，利用已知上下文，逐步补全缺失的细胞状态。',
      detail: '模型先预测被掩码位置的两级编码，优先确定置信度较高的细胞，再将这些细胞加入上下文，继续补全其余位置。用于缺失区域补全与肿瘤克隆周围的细胞状态生成。',
      input: '已知细胞状态 + 待补全位置', output: '缺失位置的细胞状态',
    },
  ] : [
    {
      tag: 'Stage 1 · Expression encoding', title: 'VQ-VAE cell-state tokenizer',
      brief: 'Learn cell expression first, compressing gene profiles into continuous embeddings and two-level codes.',
      detail: 'The expression encoder maps each cell to a continuous vector. The first quantization level captures a coarse state; the second refines its residual. Expression reconstruction trains the tokenizer to preserve cell-state information.',
      input: 'Single-cell gene expression', output: 'Continuous embeddings + two-level codes',
    },
    {
      tag: 'Stage 2 · Spatial modeling', title: 'Coordinate-aware Transformer',
      brief: 'Use cell positions and neighborhood context to learn recovery of masked cell states.',
      detail: 'Visible cells enter as continuous expression embeddings, with 2D-RoPE incorporating their spatial coordinates into attention. Masked cells retain their coordinates. The denoising backbone reads context, and two heads predict coarse and residual codes.',
      input: 'Visible embeddings + all cell coordinates', output: 'Contextual embeddings + missing-state distributions',
    },
    {
      tag: 'Inference mode 1 · Representation', title: 'Read representations (t = 0)',
      brief: 'Observe the full neighborhood and read embeddings for retrieval and multi-scale clustering.',
      detail: 'With all inputs visible, the backbone returns contextual cell embeddings. Mean pooling within a neighborhood yields its niche embedding, supporting cross-section retrieval and tissue organization at different scales.',
      input: 'Complete expression and positions', output: 'Cell embeddings / niche embeddings',
    },
    {
      tag: 'Inference mode 2 · Generation', title: 'Generate cell states (t > 0)',
      brief: 'Keep coordinates fixed and iteratively complete missing states from known context.',
      detail: 'Predict two-level codes at masked positions, commit the most confident cells first, and use them as context for the remaining positions. This supports masked-region completion and cell-state generation around tumor clones.',
      input: 'Known cell states + positions to complete', output: 'Cell states at missing positions',
    },
  ];
  // Normalized regions of the unchanged manuscript architecture image.
  const zones = [
    { x: 20, y: 3, w: 34, h: 24 },
    { x: .5, y: 28, w: 55, h: 70 },
    { x: 67, y: 1, w: 32, h: 47 },
    { x: 67, y: 52, w: 32, h: 47 },
  ];
  const active = stages[stage];
  const region = zones[stage];
  const regionStyle = (r: typeof region) => ({ left: `${r.x}%`, top: `${r.y}%`, width: `${r.w}%`, height: `${r.h}%` });
  const viewBox = `${region.x * 22.71} ${region.y * 11.38} ${region.w * 22.71} ${region.h * 11.38}`;
  const choose = (i: number) => { setStage(i); setPlaying(false); };
  useEffect(() => {
    if (!visible || !playing || reduced) return;
    const timer = window.setTimeout(() => {
      if (stage < 3) setStage(stage + 1);
      else setPlaying(false);
    }, 5000);
    return () => window.clearTimeout(timer);
  }, [visible, playing, reduced, stage]);
  return <div ref={ref} className="spatial-architecture-tour">
    <div className="spatial-tour-toolbar">
      <p>{zh ? '两阶段训练 → 表征与生成两种推理模式' : 'Two training stages → two inference modes'}</p>
      <button type="button" className="spatial-text-link" disabled={reduced} onClick={() => {
        if (playing) setPlaying(false); else { setStage(0); setPlaying(true); }
      }} aria-label={zh ? (playing ? '暂停架构导览' : '播放架构导览') : (playing ? 'Pause architecture tour' : 'Play architecture tour')}>
        {playing && !reduced ? <Pause size={14} /> : <Play size={14} />}
        {zh ? (playing && !reduced ? '暂停导览' : '播放导览') : (playing && !reduced ? 'Pause tour' : 'Play tour')}
      </button>
    </div>
    <div className="spatial-architecture-layout">
      <div className="spatial-module-list" aria-label={zh ? '选择架构模块' : 'Choose an architecture module'}>
        {stages.map((item, i) => <button type="button" key={i} aria-pressed={stage === i} aria-controls="spatial-module-detail" onClick={() => choose(i)}>
          <span className="spatial-module-tag">0{i + 1} / {item.tag}</span>
          <strong>{item.title}</strong><p>{item.brief}</p>
        </button>)}
      </div>
      <div className="spatial-paper-card spatial-architecture-card">
        <figure>
          <div className="spatial-architecture-image">
            <img src={`${ASSETS}sudoku-architecture.png`} width={2271} height={1138} alt={zh ? 'SUDOKU 完整架构：VQ-VAE、空间 Transformer、表征和生成' : 'Full SUDOKU architecture: VQ-VAE, spatial Transformer, representation and generation'} loading="lazy" />
            <motion.div aria-hidden="true" className="spatial-architecture-focus" initial={false} animate={regionStyle(region)} transition={{ duration: reduced ? 0 : .65, ease: 'easeInOut' }} />
            {zones.map((r, i) => <button type="button" key={i} className="spatial-architecture-hotspot" style={regionStyle(r)} aria-label={`${zh ? '查看' : 'Explore'} ${stages[i].title}`} aria-pressed={stage === i} aria-controls="spatial-module-detail" onClick={() => choose(i)} />)}
          </div>
          <figcaption className="spatial-diagram-caption"><span>{zh ? '点击左侧模块或图中区域，查看对应结构。' : 'Select a module or a region in the diagram to explore.'}</span><button type="button" className="spatial-text-link" onClick={() => onZoom('sudoku-architecture', zh ? 'SUDOKU 完整模型架构' : 'Complete SUDOKU model architecture')}><Maximize2 size={14} />{zh ? '放大原图' : 'Full figure'}</button></figcaption>
        </figure>
        <div id="spatial-module-detail" className="spatial-module-detail" aria-live={playing ? 'off' : 'polite'}>
          <div className="spatial-projection">
            <span className="spatial-kicker">{zh ? '当前模块 · 局部放大' : 'SELECTED MODULE · CLOSE-UP'}</span>
            <motion.svg role="img" aria-label={active.title} initial={false} animate={{ viewBox }} transition={{ duration: reduced ? 0 : .65, ease: 'easeInOut' }} preserveAspectRatio="xMidYMid meet">
              <defs><clipPath id={projectionClip}><motion.rect initial={false} animate={{ x: region.x * 22.71, y: region.y * 11.38, width: region.w * 22.71, height: region.h * 11.38 }} transition={{ duration: reduced ? 0 : .65, ease: 'easeInOut' }} /></clipPath></defs>
              <image href={`${ASSETS}sudoku-architecture.png`} width="2271" height="1138" clipPath={`url(#${projectionClip})`} />
            </motion.svg>
          </div>
          <motion.div key={stage} initial={reduced ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : .3 }} className="spatial-module-explanation">
            <span className="spatial-module-tag">{active.tag}</span><h4>{active.title}</h4><p>{active.detail}</p>
            <dl><div><dt>{zh ? '输入' : 'Input'}</dt><dd>{active.input}</dd></div><div><dt>{zh ? '输出' : 'Output'}</dt><dd>{active.output}</dd></div></dl>
            {stage >= 2 && <a className="spatial-text-link" href={stage === 2 ? '#spatial-representation' : '#spatial-generation'}>{zh ? '查看两个下游任务与结果' : 'Explore the two tasks and results'}<ArrowDown size={14} /></a>}
          </motion.div>
        </div>
      </div>
    </div>
  </div>;
}

function Comparison({ title, columns, rows, note }: { title: string; columns: string[]; rows: string[][]; note: string }) {
  return <div className="spatial-comparison">
    <table><caption>{title}</caption><thead><tr>{columns.map(c => <th key={c} scope="col">{c}</th>)}</tr></thead>
      <tbody>{rows.map(row => <tr key={row[0]} className={row[0].startsWith('SUDOKU') ? 'spatial-best-row' : undefined}>
        {row.map((v, i) => i === 0 ? <th key={i} scope="row">{v}</th> : <td key={i}>{v}</td>)}
      </tr>)}</tbody>
    </table><p className="spatial-note">{note}</p>
  </div>;
}

export const SpatialPanel: React.FC<{ lang: Lang }> = ({ lang }) => {
  const zh = lang === 'zh';
  const reduced = useReducedMotion();
  const [zoom, setZoom] = useState<{ name: string; alt: string } | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const zoomFigure: Zoom = (name, alt) => setZoom({ name, alt });
  useEffect(() => {
    if (!zoom || !dialog.current) return;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.current.showModal();
    return () => { document.body.style.overflow = overflow; previous?.focus(); };
  }, [zoom]);
  const reveal = { initial: reduced ? false as const : { opacity: 0, y: 18 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: .06 }, transition: { duration: reduced ? 0 : .5 } };
  const method = zh ? '模型 / 方法' : 'Model / method';
  return <div className="spatial-story space-y-12 sm:space-y-16">
    <ModelIntro lang={lang} eyebrow="01 / CYTO.SPATIAL · SUDOKU" name="Cyto.Spatial"
      tagline={zh ? '面向空间转录组的生成式基础模型。' : 'A generative foundation model for spatial transcriptomics.'}
      description={zh ? 'SUDOKU 将基因表达与空间位置结合，在细胞及其邻域中学习组织的空间结构。面向人和小鼠空间转录组，以统一的空间主干连接表征与生成。' : 'SUDOKU combines gene expression and spatial positions to learn tissue organization through cells and their neighborhoods. Built for human and mouse spatial transcriptomics, one spatial backbone unifies representation and generation.'}
      subnav={[{ href: '#spatial-architecture', label: zh ? '模型架构' : 'Architecture' }, { href: '#spatial-representation', label: zh ? '表征 · 两个任务' : 'Representation · two tasks' }, { href: '#spatial-generation', label: zh ? '生成 · 两个任务' : 'Generation · two tasks' }]}
      githubUrl="https://github.com/Cyto-System/Cyto.Spatial" />

    <motion.section {...reveal} className="spatial-section" aria-labelledby="spatial-architecture">
      <EyebrowHeading id="spatial-architecture" index="01" kicker={zh ? '模型架构' : 'THE MODEL'} title={zh ? '从细胞表达，到空间组织。' : 'From cell expression to tissue organization.'} accent={zh ? '一个模型，连接表征与生成。' : 'One model. Representation and generation.'} />
      <p className="spatial-lead">{zh ? '第一阶段训练 VQ-VAE，学习细胞表达编码；第二阶段训练空间坐标感知 Transformer，学习细胞之间的空间关系。训练后的同一主干支持表征提取与状态生成。' : 'Stage one trains a VQ-VAE to encode cell expression. Stage two trains a coordinate-aware Transformer to learn spatial relationships. The resulting backbone supports both representation and generation.'}</p>
      <Architecture lang={lang} onZoom={zoomFigure} />
    </motion.section>

    <section className="spatial-section" aria-labelledby="spatial-representation">
      <EyebrowHeading id="spatial-representation" index="02" kicker="REPRESENTATION · TWO TASKS" title={zh ? '表征：读懂组织中的空间关系。' : 'Representation: read spatial relationships.'} accent={zh ? '邻域检索 + 多尺度聚类' : 'Niche retrieval + multi-scale clustering'} />
      <motion.article {...reveal} className="spatial-paper-card" data-task="R1">
        <div className="spatial-result-heading"><div><span className="spatial-kicker">R1 / NICHE RETRIEVAL</span><h4>{zh ? '邻域检索：跨切片找到相似区域。' : 'Niche retrieval: find a similar region across sections.'}</h4></div><span className="spatial-badge">HESTA · Stereo-seq</span></div>
        <p className="spatial-lead">{zh ? '以心脏邻域为查询，在另一张切片中定位相似的组织区域。' : 'Use a heart neighborhood as a query to locate a matching region in another section.'}</p>
        <div className="spatial-map-grid">{['query', 'reference', 'sudoku', 'cellplm'].map((kind, i) => <figure key={kind} className={kind === 'sudoku' ? 'spatial-highlight' : ''}>
          <figcaption>{(zh ? ['查询邻域', '目标参考区域', 'SUDOKU', 'CellPLM'] : ['Query niche', 'Target reference', 'SUDOKU', 'CellPLM'])[i]}</figcaption>
          <PaperFigure name={`hesta-${kind}`} alt={`${zh ? '心脏邻域检索' : 'Heart niche retrieval'} · ${kind}`} onZoom={zoomFigure} />
        </figure>)}</div>
        <div className="spatial-result-foot"><p>{zh ? '心脏示例 AUPRC：SUDOKU 0.99，CellPLM 0.61。蓝色越深，相似度越高；各模型按各自分位数着色。' : 'Heart example AUPRC: SUDOKU 0.99, CellPLM 0.61. Darker blue indicates higher similarity; each model uses its own percentile color scale.'}</p><button type="button" className="spatial-text-link" onClick={() => zoomFigure('hesta-retrieval', zh ? '心脏检索与 precision–recall 曲线' : 'Heart retrieval and precision–recall curve')}>{zh ? '查看检索曲线' : 'View retrieval curve'} <Maximize2 size={14} /></button></div>
        <Comparison title={zh ? '结果对比 · HESTA 八个器官平均 AUPRC ↑' : 'Benchmark · mean AUPRC across eight HESTA organs ↑'} columns={[method, 'AUPRC ↑']} rows={[
          ['SUDOKU', '0.496'], ['GeST', '0.447'], ['QueST', '0.416'], ['CellPLM', '0.332'],
        ]} note={zh ? '八个器官 AUPRC 的算术平均；SUDOKU 为任务微调设置。上方心脏图展示一个查询示例。' : 'Arithmetic mean of eight organ-level AUPRC scores; SUDOKU uses task fine-tuning. The maps above show one heart query.'} />
      </motion.article>
      <motion.article {...reveal} className="spatial-paper-card" data-task="R2">
        <div className="spatial-result-heading"><div><span className="spatial-kicker">R2 / MULTI-SCALE CLUSTERING</span><h4>{zh ? '多尺度聚类：从细胞类型到脑区。' : 'Multi-scale clustering: from cell types to brain regions.'}</h4></div><span className="spatial-badge">MERFISH · {zh ? '小鼠脑' : 'Mouse brain'}</span></div>
        <p className="spatial-lead">{zh ? '用空间表征区分细胞类型、层带和脑区，连接细胞组成与组织结构。' : 'Resolve cell types, laminar bands, and brain regions with spatial representations, linking cell composition to tissue structure.'}</p>
        <figure><PaperFigure name="multiscale-labels" alt={zh ? '小鼠脑多尺度参考标签：脑区、层带与细胞类型' : 'Multi-scale mouse brain reference labels: regions, bands, and cell types'} onZoom={zoomFigure} /><figcaption className="spatial-note">{zh ? '同一张小鼠脑切片的多尺度参考标签。' : 'Multi-scale reference labels on the same mouse brain section.'}</figcaption></figure>
        <Comparison title={zh ? '结果对比 · 六张切片的 ARI 中位数 ↑' : 'Benchmark · median ARI over six sections ↑'} columns={[method, zh ? '脑区' : 'Region', zh ? '层带' : 'Band', zh ? '细胞类型' : 'Cell type']} rows={[
          ['SUDOKU', '0.342', '0.493', '0.520'], ['STAGATE', '0.312', '0.420', '0.154'], ['BANKSY', '0.111', '0.091', '0.440'], ['CellPLM', '0.113', '0.115', '0.438'],
        ]} note={zh ? 'SUDOKU 为任务微调设置；三个尺度分别对照对应的参考标签进行评测。' : 'SUDOKU uses task fine-tuning; each scale is evaluated against its corresponding reference labels.'} />
      </motion.article>
    </section>

    <section className="spatial-section" aria-labelledby="spatial-generation">
      <EyebrowHeading id="spatial-generation" index="03" kicker="GENERATION · TWO TASKS" title={zh ? '生成：由已知上下文，补全细胞状态。' : 'Generation: complete cell states from context.'} accent={zh ? '掩码补全 + 克隆周围生成' : 'Masked completion + clone-neighborhood generation'} />
      <motion.article {...reveal} className="spatial-paper-card" data-task="G1">
        <div className="spatial-result-heading"><div><span className="spatial-kicker">G1 / MASKED COMPLETION</span><h4>{zh ? '掩码补全：预测缺失位置的细胞状态。' : 'Masked completion: predict missing cell states.'}</h4></div><span className="spatial-badge">{zh ? '31 张切片 · 972 道题' : '31 sections · 972 questions'}</span></div>
        <p className="spatial-lead">{zh ? '保留细胞坐标，用已测邻域补全被掩码的细胞状态。以四种空间掩码检验不同缺失形态下的生成能力。' : 'Keep coordinates fixed and use observed neighbors to complete masked cell states. Four spatial mask geometries test different patterns of missing information.'}</p>
        <div className="spatial-map-grid">{['scattered', 'block', 'shell', 'multiple'].map((kind, i) => <figure key={kind}><figcaption>{(zh ? ['散点缺失', '块状缺失', '环带缺失', '多区域缺失'] : ['Scattered', 'Block', 'Shell', 'Multiple regions'])[i]}</figcaption><PaperFigure name={`mask-${kind}`} alt={`${zh ? '掩码题目参考' : 'Mask question reference'} · ${kind}`} onZoom={zoomFigure} /></figure>)}</div>
        <p className="spatial-note">{zh ? '中等难度题目示例：每窗 500 个细胞，掩码比例 40%。灰色为已知输入，彩色为待预测位置的真实细胞类型。' : 'Medium-tier examples: 500 cells per window, 40% masked. Gray marks observed inputs; colors show the ground-truth cell types at positions to predict.'}</p>
        <Comparison title={zh ? '结果对比 · 细胞类型预测准确率 ↑' : 'Benchmark · cell-type prediction accuracy ↑'} columns={[method, zh ? '总体' : 'All', zh ? '中等' : 'Medium', zh ? '困难' : 'Hard']} rows={[
          ['SUDOKU', '0.401', '0.379', '0.273'], [zh ? '距离加权 300-NN' : 'Distance-weighted 300-NN', '0.385', '0.333', '0.258'], ['GeST', '0.362', '0.306', '0.253'],
        ]} note={zh ? '神经模型为三次运行均值；SUDOKU 为任务微调设置，零样本总体准确率为 0.355。' : 'Neural-model scores are means over three runs. SUDOKU uses task fine-tuning; its zero-shot overall accuracy is 0.355.'} />
      </motion.article>
      <motion.article {...reveal} className="spatial-paper-card" data-task="G2">
        <div className="spatial-result-heading"><div><span className="spatial-kicker">G2 / CLONE-NEIGHBORHOOD GENERATION</span><h4>{zh ? '克隆周围生成：恢复局部细胞分布。' : 'Clone-neighborhood generation: recover local cell patterns.'}</h4></div><span className="spatial-badge">SPAC-seq</span></div>
        <p className="spatial-lead">{zh ? '以肿瘤克隆为条件，生成周围 50 μm 邻域的细胞状态。下图为 Cd274（PD-L1）敲除克隆的实测与生成结果。' : 'Condition on a tumor clone to generate cell states within its surrounding 50 μm band. The example compares measured and generated neighborhoods of a Cd274 (PD-L1) knockout clone.'}</p>
        <div className="spatial-map-grid spatial-generation-grid">{['reference', 'sudoku', 'gest'].map((name, i) => <figure key={name} className={i === 1 ? 'spatial-highlight' : ''}><figcaption><span>{[zh ? '实测' : 'Measured', 'SUDOKU', 'GeST'][i]}</span><strong>{['65%', '63%', '10%'][i]}</strong></figcaption><PaperFigure name={`spac-${name}`} alt={`${name} · ${['65%', '63%', '10%'][i]} ${zh ? '免疫细胞占比' : 'immune fraction'}`} onZoom={zoomFigure} /></figure>)}</div>
        <div className="spatial-legend">{(zh ? ['免疫细胞', '肿瘤细胞', '其他细胞', '肿瘤克隆'] : ['Immune', 'Tumor', 'Other cells', 'Tumor clone']).map((label, i) => <span key={label}><i style={{ background: ['#2f7cc4', '#ed3b48', '#3ba64b', '#ffd7d8'][i] }} />{label}</span>)}</div>
        <p className="spatial-note">{zh ? '图上百分比为该克隆周围非肿瘤细胞中的免疫细胞占比；下表汇总完整队列的对比。' : 'Percentages show immune fractions among non-tumor cells around this clone; the table summarizes the full cohort.'}</p>
        <Comparison title={zh ? '结果对比 · 三张切片、125 个克隆' : 'Benchmark · three sections, 125 clones'} columns={[method, 'Spearman ρ ↑', zh ? '排序误差中位数 ↓' : 'Median rank error ↓']} rows={[
          ['SUDOKU', '0.77', '0.12'], ['GeST', '0.49', '0.20'], [zh ? '表达插值' : 'Expression interpolation', '0.11', '0.28'],
        ]} note={zh ? 'Spearman 为三张切片的平均值，排序误差为克隆层面的中位数；相关性越高、误差越低越好。' : 'Spearman is averaged over three sections; rank error is the median over clones. Higher correlation and lower error are better.'} />
      </motion.article>
      <p className="spatial-note">{zh ? '可视化与评测数值来自 SUDOKU 文章；不同任务的评测设置见各卡片说明。' : 'Visualizations and benchmark scores are from the SUDOKU manuscript; evaluation settings are noted with each task.'}</p>
    </section>
    {zoom && <dialog ref={dialog} className="spatial-lightbox" onCancel={() => setZoom(null)} onClick={e => { if (e.target === e.currentTarget) setZoom(null); }} aria-label={zoom.alt}>
      <div><header><span>{zoom.alt}</span><button type="button" onClick={() => setZoom(null)} aria-label={zh ? '关闭图片' : 'Close image'}><X size={22} /></button></header><img src={`${ASSETS}${zoom.name}.png`} alt={zoom.alt} /><a href={`${ASSETS}${zoom.name}.png`} target="_blank" rel="noreferrer">{zh ? '在新标签页查看原图' : 'Open the full-resolution image'}</a></div>
    </dialog>}
  </div>;
};
