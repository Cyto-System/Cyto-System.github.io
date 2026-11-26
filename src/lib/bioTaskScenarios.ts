import { BilingualText } from './cytoDomain';

export type CameraPresetId = 'overview' | 'macro' | 'exploded';

export type WindowZoneId =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center';

export const STEP_DURATION_SEC = 3.0;
export const CYCLE_DURATION_SEC = STEP_DURATION_SEC * 4; // 12.0s full 4-model self-looping cycle

export interface TaskPipelineStep {
  stepNo: string;
  moduleName: string;
  tierTag: string;
  tierBadge: BilingualText;
  boardMetric: string;
  roleHeadline: BilingualText;
  roleDetail: BilingualText;
  readoutMetric: string;
  accentColorCss: string;
  accentHex: number;
  // Spatial anchoring: matches 3D Explanation Board position to the corresponding Virtual Cell 3D element
  windowZone: WindowZoneId;
  targetElementLabel: BilingualText;
  boardPos: [number, number, number];
  boardRotY: number;
  anchorPos: [number, number, number];
}

export interface BioTaskScenario {
  id: string;
  index: string;
  shortTabLabel: BilingualText;
  title: BilingualText;
  shortSubtitle: BilingualText;
  taskPrompt: BilingualText;
  headlineStat: string;
  headlineStatLabel: BilingualText;
  secondaryStats: {
    value: string;
    label: BilingualText;
  }[];
  summary: BilingualText;
  specimenGeometryMode: 'niche_ring' | 'enhancer_helix' | 'alveolar_dome';
  steps: [TaskPipelineStep, TaskPipelineStep, TaskPipelineStep, TaskPipelineStep];
}

export const CYTO_TASK_SCENARIOS: BioTaskScenario[] = [
  {
    id: 'pdac-stroma-barrier',
    index: '01',
    shortTabLabel: {
      zh: '肿瘤免疫重编程',
      en: 'Tumor Immunotherapy',
    },
    title: {
      zh: '多尺度时空细胞真实评测与闭环发现流程',
      en: 'Multi-Scale Spatiotemporal Cell Benchmarks & Closed-Loop Discovery',
    },
    shortSubtitle: {
      zh: 'Cyto.Spatial · Cyto.Identity · Cyto.Perturbation · Cyto.CoScientist',
      en: 'Cyto.Spatial · Cyto.Identity · Cyto.Perturbation · Cyto.CoScientist',
    },
    taskPrompt: {
      zh: '从空间邻域表征、可推理细胞鉴定、未见扰动迁移到多组学自主方法开发与队列发现',
      en: 'From spatial niche encoding, reasoned cell identity, and unseen perturbation transfer to autonomous multi-omics discovery',
    },
    headlineStat: '0.8611',
    headlineStatLabel: {
      zh: 'PerturbQA 未见扰动方向排序 DIR pgAUROC',
      en: 'PerturbQA unseen perturbation DIR pgAUROC',
    },
    secondaryStats: [
      {
        value: '0.932',
        label: { zh: 'HESTA 肝脏跨切片检索 AUPRC', en: 'HESTA liver retrieval AUPRC' },
      },
      {
        value: '0.6458',
        label: { zh: 'TCGA-LUAD 三组学生存 C-index', en: 'TCGA-LUAD survival C-index' },
      },
    ],
    summary: {
      zh: '串联空间微环境建模、可推理亚群鉴定、未见扰动响应迁移与自主科研智能体，覆盖表征、预测与多组学闭环发现。',
      en: 'Connects spatial niche foundation modeling, auditable cell identity reasoning, unseen perturbation transfer, and autonomous multi-omics discovery.',
    },
    specimenGeometryMode: 'niche_ring',
    steps: [
      {
        stepNo: '01',
        moduleName: 'Cyto.Spatial',
        tierTag: '01 READ',
        tierBadge: { zh: '01 读懂细胞', en: '01 READ STATE' },
        boardMetric: '0.932',
        roleHeadline: {
          zh: '跨切片空间邻域解码',
          en: 'Cross-Slice Niche Decoding',
        },
        roleDetail: {
          zh: '两级离散量化与 2D-RoPE 空间主干在 HESTA 8 器官检索中 7 项领先，肝脏 AUPRC 达 0.932',
          en: 'Two-level quantization & 2D-RoPE backbone leads 7/8 organs on HESTA retrieval (Liver AUPRC 0.932)',
        },
        readoutMetric: 'HESTA Liver AUPRC',
        accentColorCss: '#0d9488',
        accentHex: 0x0d9488,
        windowZone: 'top-left',
        targetElementLabel: {
          zh: '空间微环境邻域环',
          en: 'Spatial Niche Ring',
        },
        boardPos: [-0.58, 1.13, 0.78],
        boardRotY: 0.06,
        anchorPos: [-0.66, 0.42, 0.04],
      },
      {
        stepNo: '02',
        moduleName: 'Cyto.Identity',
        tierTag: '02 REASON',
        tierBadge: { zh: '02 推演细胞', en: '02 REASON IDENTITY' },
        boardMetric: '61.36%',
        roleHeadline: {
          zh: '开放世界细胞注释',
          en: 'Open-World Cell Annotation',
        },
        roleDetail: {
          zh: 'scVerity 以连续流形候选、局部群体实测证据与知识图谱约束逐层推理，输出可溯源的最细细胞标签；三队列 ACC 均值领先最强外部基线 +14.86 个百分点',
          en: 'scVerity reasons from continuous-manifold candidates through local-population evidence and knowledge-graph constraints to release traceable cell labels (+14.86 pp over best baseline)',
        },
        readoutMetric: 'scVerity · Ontology ACC',
        accentColorCss: '#059669',
        accentHex: 0x059669,
        windowZone: 'bottom-center',
        targetElementLabel: {
          zh: '细胞核与转录状态',
          en: 'Nucleus & Transcriptome',
        },
        boardPos: [0.32, -1.14, 0.78],
        boardRotY: -0.04,
        anchorPos: [0.08, -0.18, 0.06],
      },
      {
        stepNo: '03',
        moduleName: 'Cyto.Perturbation',
        tierTag: '02 SIMULATE',
        tierBadge: { zh: '02 推演细胞', en: '02 SIMULATE RESPONSE' },
        boardMetric: '0.8611',
        roleHeadline: {
          zh: '未见扰动响应对比迁移',
          en: 'Unseen Perturbation Transfer',
        },
        roleDetail: {
          zh: '扣减基因固有倾向并经五大知识库核岭迁移，在 PerturbQA 6 项指标与 95 种未见药物排序居首',
          en: 'Subtracts gene baselines via 5-KB kernel ridge, leading all 6 PerturbQA metrics & 95 unseen compounds',
        },
        readoutMetric: 'DIR pgAUROC · PerturbQA',
        accentColorCss: '#d97706',
        accentHex: 0xd97706,
        windowZone: 'bottom-left',
        targetElementLabel: {
          zh: 'DNA 扰动靶点位点',
          en: 'DNA Perturbation Locus',
        },
        boardPos: [-1.34, -1.12, 0.78],
        boardRotY: 0.12,
        anchorPos: [-1.4, 0.02, 0.04],
      },
      {
        stepNo: '04',
        moduleName: 'Cyto.CoScientist',
        tierTag: '03 DISCOVER',
        tierBadge: { zh: '03 闭环发现', en: '03 CLOSED-LOOP' },
        boardMetric: '0.6458',
        roleHeadline: {
          zh: '多组学自主方法与发现',
          en: 'Closed-Loop Multi-Omics',
        },
        roleDetail: {
          zh: '自主构建 TCGA-LUAD 三模态生存融合（0.6458 vs 0.5950）并完成食管癌配对淋巴结机制分析',
          en: 'Autonomously designs TCGA-LUAD 3-assay survival fusion (0.6458 vs 0.5950) & ESCC paired-node discovery',
        },
        readoutMetric: 'TCGA-LUAD C-index',
        accentColorCss: '#047857',
        accentHex: 0x047857,
        windowZone: 'top-right',
        targetElementLabel: {
          zh: '靶向分子与闭环验证',
          en: 'Ligands & Loop Validation',
        },
        boardPos: [1.94, 0.88, 0.78],
        boardRotY: -0.14,
        anchorPos: [1.32, 0.12, 0.12],
      },
    ],
  },
  {
    id: 'hspc-enhancer-editing',
    index: '02',
    shortTabLabel: {
      zh: '增强子基因编辑',
      en: 'Enhancer Editing',
    },
    title: {
      zh: '非编码增强子变异解读与红系谱系定向重编程',
      en: 'Non-Coding Enhancer Decoding & Erythroid Fate Steering',
    },
    shortSubtitle: {
      zh: 'CD34+ 造血干祖细胞 · 顺式调控序列到单细胞表型推演',
      en: 'CD34+ HSPC · Cis-regulatory sequence-to-phenotype demo',
    },
    taskPrompt: {
      zh: '量化 +58 kb 红系增强子顺式变异因果效应，滴定无周期阻滞应激的胎儿血红蛋白激活窗口',
      en: 'Quantify +58 kb erythroid enhancer variant drive & titrate stress-free HbF induction window',
    },
    headlineStat: '74.6%',
    headlineStatLabel: {
      zh: '功能性胎儿血红蛋白 HbF+ 诱导占比',
      en: 'Functional HbF+ erythroid commitment',
    },
    secondaryStats: [
      {
        value: '128 kb',
        label: { zh: '长程顺式序列归因跨度', en: 'Cis-sequence context span' },
      },
      {
        value: '97.8%',
        label: { zh: '原代干祖细胞活率维持', en: 'Primary HSPC viability' },
      },
    ],
    summary: {
      zh: '打通 DNA 序列变异效应预测与单细胞转录因子网络推演，精准跨过髓系-红系谱系分叉鞍点并规避超生理剂量细胞毒性。',
      en: 'Bridges long-range DNA sequence attribution with single-cell trajectory simulation to steer progenitors across lineage saddle points safely.',
    },
    specimenGeometryMode: 'enhancer_helix',
    steps: [
      {
        stepNo: '01',
        moduleName: 'Cyto.Genome',
        tierTag: '01 READ',
        tierBadge: { zh: '01 读懂细胞', en: '01 READ SEQUENCE' },
        boardMetric: '128 kb',
        roleHeadline: {
          zh: '长程顺式调控因果编码',
          en: 'Cis-Regulatory Attribution',
        },
        roleDetail: {
          zh: '直接从左侧 DNA 序列量化 +58 kb 增强子变异对染色质开放度与转录活性的驱动贡献',
          en: 'Maps +58 kb DNA enhancer variants directly to chromatin & transcription drive',
        },
        readoutMetric: 'Cis-Δ = -2.14',
        accentColorCss: '#d97706',
        accentHex: 0xd97706,
        windowZone: 'bottom-left',
        targetElementLabel: {
          zh: 'DNA 顺式增强子位点',
          en: 'DNA Cis-Enhancer Locus',
        },
        boardPos: [-1.34, -1.12, 0.78],
        boardRotY: 0.12,
        anchorPos: [-1.4, 0.04, 0.04],
      },
      {
        stepNo: '02',
        moduleName: 'Cyto.Identity',
        tierTag: '02 REASON',
        tierBadge: { zh: '02 推演细胞', en: '02 REASON IDENTITY' },
        boardMetric: 'F1 0.93',
        roleHeadline: {
          zh: '细胞核谱系临界态鉴定',
          en: 'Nuclear Saddle-State Audit',
        },
        roleDetail: {
          zh: '基于核内转录调控网络精准识别骨髓多能祖细胞向红系分叉的 MPP-MEP 临界亚群',
          en: 'Pinpoints bipotent MPP-MEP transitional state inside the nuclear TF network',
        },
        readoutMetric: 'Macro-F1 0.93',
        accentColorCss: '#059669',
        accentHex: 0x059669,
        windowZone: 'top-center',
        targetElementLabel: {
          zh: '细胞核转录调控态',
          en: 'Nuclear Lineage State',
        },
        boardPos: [0.1, 1.14, 0.78],
        boardRotY: 0.0,
        anchorPos: [0.08, 0.18, 0.06],
      },
      {
        stepNo: '03',
        moduleName: 'Cyto.Perturbation',
        tierTag: '02 SIMULATE',
        tierBadge: { zh: '02 推演细胞', en: '02 SIMULATE DOSE' },
        boardMetric: '0.68 opt',
        roleHeadline: {
          zh: '递送分子剂量梯度推演',
          en: 'Stress-Free Dose Titration',
        },
        roleDetail: {
          zh: '模拟右侧递送分子与碱基编辑剂量曲线，锁定规避周期阻滞（<2.2%）的最优窗口',
          en: 'Simulates delivery ligand & base-editing dose curve (<2.2% stress window)',
        },
        readoutMetric: 'Stress < 2.2%',
        accentColorCss: '#0d9488',
        accentHex: 0x0d9488,
        windowZone: 'top-right',
        targetElementLabel: {
          zh: '递送分子与剂量通道',
          en: 'Dose Delivery Ligands',
        },
        boardPos: [1.94, 0.88, 0.78],
        boardRotY: -0.14,
        anchorPos: [1.32, 0.12, 0.12],
      },
      {
        stepNo: '04',
        moduleName: 'Cyto.CoScientist',
        tierTag: '03 DISCOVER',
        tierBadge: { zh: '03 闭环发现', en: '03 CLOSED-LOOP' },
        boardMetric: '74.6%',
        roleHeadline: {
          zh: '全细胞表型闭环验证',
          en: 'Whole-Cell Loop Validation',
        },
        roleDetail: {
          zh: '生成原代 CD34+ 第 7 天单细胞多组学验证方案，全细胞诱导 74.6% 功能性 HbF+ 表型',
          en: 'Emits Day-7 scMultiome protocol yielding 74.6% functional HbF+ whole-cell state',
        },
        readoutMetric: 'HbF+ = 74.6%',
        accentColorCss: '#047857',
        accentHex: 0x047857,
        windowZone: 'bottom-center',
        targetElementLabel: {
          zh: '时空细胞表型重塑闭环',
          en: 'Whole-Cell Phenotype',
        },
        boardPos: [0.36, -1.14, 0.78],
        boardRotY: -0.04,
        anchorPos: [0.24, -0.32, 0.1],
      },
    ],
  },
  {
    id: 'ipf-alveolar-regeneration',
    index: '03',
    shortTabLabel: {
      zh: '肺泡细胞再生',
      en: 'Alveolar Repair',
    },
    title: {
      zh: '肺纤维化异常停滞态微环境解耦与再生修复',
      en: 'Fibrotic Niche Uncoupling & Alveolar AT2 Regeneration',
    },
    shortSubtitle: {
      zh: '特发性肺纤维化 (IPF) · 空间生态位序贯干预效能演示',
      en: 'IPF Precision Lung Slice · Sequential Niche Intervention Demo',
    },
    taskPrompt: {
      zh: '解耦 KRT17+ 异常基底上皮与 CTHRC1+ 肌成纤维细胞正反馈环，恢复肺泡 AT2 修复再生轨迹',
      en: 'Uncouple KRT17+ basaloid & CTHRC1+ myofibroblast loop to unlock SFTPC+ AT2 repair',
    },
    headlineStat: '54.0%',
    headlineStatLabel: {
      zh: '受损肺泡 SFTPC+ AT2 再生修复占比 (基线 8.2%)',
      en: 'Restored SFTPC+ AT2 regenerative fraction (vs 8.2%)',
    },
    secondaryStats: [
      {
        value: '-2.92',
        label: { zh: 'COL1A1 病理胶原下调 (log₂FC)', en: 'COL1A1 log₂FC suppression' },
      },
      {
        value: '3 轮',
        label: { zh: '干湿实验闭环快速收敛', en: 'Closed-loop iterations' },
      },
    ],
    summary: {
      zh: '对比同步给药与时序解耦策略，揭示“先解除局部 TGFBR1 机械压制、再激活上皮再生窗口”的低毒高效组织修复路径。',
      en: 'Contrasts simultaneous vs sequential dosing to uncover a low-toxicity niche decompression path that restores alveolar epithelial repair.',
    },
    specimenGeometryMode: 'alveolar_dome',
    steps: [
      {
        stepNo: '01',
        moduleName: 'Cyto.Spatial',
        tierTag: '01 READ',
        tierBadge: { zh: '01 读懂细胞', en: '01 READ NICHE' },
        boardMetric: '4.2×',
        roleHeadline: {
          zh: '致病邻域配受体场重构',
          en: 'Fibrotic Niche Flux Mapping',
        },
        roleDetail: {
          zh: '量化外围成纤维灶 25 μm 内肌成纤维细胞对上皮膜的机械与 TGF-β 锁定通量',
          en: 'Quantifies 25 μm myofibroblast TGF-β paracrine locking flux around cell boundary',
        },
        readoutMetric: 'Flux = 4.2× Ctrl',
        accentColorCss: '#0d9488',
        accentHex: 0x0d9488,
        windowZone: 'top-left',
        targetElementLabel: {
          zh: '外围纤维化生态位环',
          en: 'Fibrotic Spatial Niche',
        },
        boardPos: [-0.58, 1.13, 0.78],
        boardRotY: 0.06,
        anchorPos: [-0.66, 0.42, 0.04],
      },
      {
        stepNo: '02',
        moduleName: 'Cyto.Identity',
        tierTag: '02 REASON',
        tierBadge: { zh: '02 推演细胞', en: '02 AUDIT IDENTITY' },
        boardMetric: '0.84',
        roleHeadline: {
          zh: '顺式转录可逆潜能审计',
          en: 'Cis-TF Reversibility Audit',
        },
        roleDetail: {
          zh: '结合顺式调控位点与转录证据链证实 KRT17+ 异常细胞仍保留可逆 AT2 修复潜能',
          en: 'Audits cis-regulatory & TF chain proving stalled KRT17+ cells retain AT2 potential',
        },
        readoutMetric: 'Rev Prob = 0.84',
        accentColorCss: '#059669',
        accentHex: 0x059669,
        windowZone: 'bottom-left',
        targetElementLabel: {
          zh: 'DNA 转录调控位点',
          en: 'Cis-TF Gene Locus',
        },
        boardPos: [-1.34, -1.12, 0.78],
        boardRotY: 0.12,
        anchorPos: [-1.4, 0.02, 0.04],
      },
      {
        stepNo: '03',
        moduleName: 'Cyto.Perturbation',
        tierTag: '02 SIMULATE',
        tierBadge: { zh: '02 推演细胞', en: '02 SIMULATE TIMING' },
        boardMetric: '-2.92 FC',
        roleHeadline: {
          zh: '序贯靶向解耦给药推演',
          en: 'Sequential Dosing Simulation',
        },
        roleDetail: {
          zh: '模拟右侧靶向药物胶囊序贯结合膜受体（先抑 TGFBR1 再调 SOX9），显著下调胶原',
          en: 'Simulates sequential TGFBR1 → SOX9 receptor dosing, suppressing COL1A1 (-2.92 FC)',
        },
        readoutMetric: 'COL1A1 -2.92',
        accentColorCss: '#d97706',
        accentHex: 0xd97706,
        windowZone: 'top-right',
        targetElementLabel: {
          zh: '序贯靶向药物与受体',
          en: 'Sequential Drug Docking',
        },
        boardPos: [1.94, 0.88, 0.78],
        boardRotY: -0.14,
        anchorPos: [1.32, 0.12, 0.12],
      },
      {
        stepNo: '04',
        moduleName: 'Cyto.CoScientist',
        tierTag: '03 DISCOVER',
        tierBadge: { zh: '03 闭环发现', en: '03 CLOSED-LOOP' },
        boardMetric: '54.0%',
        roleHeadline: {
          zh: '肺泡细胞再生闭环验证',
          en: 'Alveolar Repair Validation',
        },
        roleDetail: {
          zh: '经 3 轮闭环迭代验证，核心时空细胞 SFTPC+ AT2 功能再生占比由 8.2% 跃升至 54.0%',
          en: 'Validates SFTPC+ AT2 regeneration jumping from 8.2% to 54.0% across cell state',
        },
        readoutMetric: 'AT2 = 54.0%',
        accentColorCss: '#047857',
        accentHex: 0x047857,
        windowZone: 'bottom-center',
        targetElementLabel: {
          zh: '肺泡细胞核与再生态',
          en: 'Regenerated Cell State',
        },
        boardPos: [0.32, -1.14, 0.78],
        boardRotY: -0.04,
        anchorPos: [0.08, -0.18, 0.06],
      },
    ],
  },
];

/**
 * Determines whether the Hero 3D WebGL render loop can pause when scrolled completely past the Hero section.
 */
export function shouldPauseHeroWebgl(scrollY: number, heroHeightPx: number): boolean {
  const safeHeight = Math.max(320, heroHeightPx);
  return scrollY > safeHeight + 48;
}

export interface CycleLoopState {
  cyclePhase: number; // Smooth periodic phase in [0, 1)
  activeStepIdx: number; // 0 | 1 | 2 | 3
  stepProgress: number; // Progress within current active step in [0, 1)
}

/**
 * Pure deterministic self-looping clock mapping elapsed seconds (+ optional user click phase offset)
 * into a seamless periodic cyclePhase in [0, 1), activeStepIdx in {0, 1, 2, 3}, and stepProgress in [0, 1).
 */
export function computeCycleLoopState(
  elapsedSec: number,
  phaseOffsetSec = 0
): CycleLoopState {
  const totalSec = elapsedSec + phaseOffsetSec;
  const wrappedSec = ((totalSec % CYCLE_DURATION_SEC) + CYCLE_DURATION_SEC) % CYCLE_DURATION_SEC;
  const cyclePhase = wrappedSec / CYCLE_DURATION_SEC;
  const scaled = cyclePhase * 4;
  const activeStepIdx = Math.min(3, Math.floor(scaled));
  const stepProgress = scaled - activeStepIdx;

  return {
    cyclePhase,
    activeStepIdx,
    stepProgress,
  };
}

/**
 * Computes the 3D attachment point on the perimeter of the floating Explanation Board
 * closest to the 3D Virtual Cell anchor point so the 3D optical leader beam starts cleanly
 * on the board border rather than piercing through board text.
 */
export function computeBoardTetherStart(
  boardPos: [number, number, number],
  anchorPos: [number, number, number],
  boardWidth = 1.4,
  boardHeight = 0.94,
  out?: [number, number, number]
): [number, number, number] {
  const dx = anchorPos[0] - boardPos[0];
  const dy = anchorPos[1] - boardPos[1];
  const halfW = boardWidth * 0.5;
  const halfH = boardHeight * 0.5;
  const target: [number, number, number] = out ?? [0, 0, 0];

  if (Math.abs(dx) < 1e-4 && Math.abs(dy) < 1e-4) {
    target[0] = boardPos[0];
    target[1] = boardPos[1] - halfH;
    target[2] = Number((boardPos[2] - 0.02).toFixed(4));
    return target;
  }

  const scaleX = Math.abs(dx) > 1e-4 ? halfW / Math.abs(dx) : Infinity;
  const scaleY = Math.abs(dy) > 1e-4 ? halfH / Math.abs(dy) : Infinity;
  const t = Math.min(1, scaleX, scaleY);

  target[0] = Number((boardPos[0] + dx * t).toFixed(4));
  target[1] = Number((boardPos[1] + dy * t).toFixed(4));
  target[2] = Number((boardPos[2] - 0.02).toFixed(4));
  return target;
}

export interface WindowLayerTargets {
  cameraPos: [number, number, number];
  lookAt: [number, number, number];
  explodedFactor: number;
  backGlassZ: number;
  specimenZ: number;
  mainWindowZ: number;
  cardZOffsets: [number, number, number, number];
  tracePaneZ: number;
}

/**
 * Pure 3D spatial choreography targets for the Three.js Transparent Tech-Glass Task Execution Window.
 * Adapts camera Z distance to both horizontal and vertical frustum bounds so all 4 dynamic board zones
 * (top-left, top-center, top-right, bottom-left, bottom-center) fit cleanly with zero clipping.
 */
export function computeWindowLayerTargets(
  preset: CameraPresetId,
  activeStepIdx: number,
  viewportAspect = 1.22
): WindowLayerTargets {
  const safeStep = ((activeStepIdx % 4) + 4) % 4;
  const safeAspect = Math.max(0.72, Math.min(2.4, viewportAspect));
  const tanHalfFov = Math.tan((36 * Math.PI) / 360);

  const zForWidth = 0.78 + 3.04 / (tanHalfFov * safeAspect);
  const zForHeight = 0.78 + 2.08 / tanHalfFov;
  const overviewZ = Number(
    Math.max(6.2, Math.min(11.2, Math.max(zForWidth, zForHeight))).toFixed(3)
  );

  let cameraPos: [number, number, number] = [0, 0.02, overviewZ];
  let lookAt: [number, number, number] = [0, -0.01, 0];
  let explodedFactor = 0;

  if (preset === 'macro') {
    const macroZ = Number(
      Math.max(4.9, Math.min(8.1, 0.1 + 2.04 / (tanHalfFov * safeAspect))).toFixed(3)
    );
    cameraPos = [0.06, 0.02, macroZ];
    lookAt = [0.04, -0.02, 0.04];
    explodedFactor = 0.15;
  } else if (preset === 'exploded') {
    const explodedZ = Number(
      Math.max(6.95, Math.min(11.5, 0.95 + 3.08 / (tanHalfFov * safeAspect))).toFixed(3)
    );
    cameraPos = [1.52, 0.56, explodedZ];
    lookAt = [0, -0.03, 0.05];
    explodedFactor = 1.0;
  }

  const backGlassZ = Number((-0.78 - 0.72 * explodedFactor).toFixed(3));
  const specimenZ = Number((-0.06 + 0.04 * explodedFactor).toFixed(3));
  const mainWindowZ = Number((0.46 + 0.52 * explodedFactor).toFixed(3));
  const tracePaneZ = Number((0.78 + 0.72 * explodedFactor).toFixed(3));

  const cardZOffsets = [0, 1, 2, 3].map((idx) => {
    const baseZ = 0.62 + 0.58 * explodedFactor;
    const activeBoost = idx === safeStep ? 0.26 : 0;
    return Number((baseZ + activeBoost).toFixed(3));
  }) as [number, number, number, number];

  return {
    cameraPos,
    lookAt,
    explodedFactor,
    backGlassZ,
    specimenZ,
    mainWindowZ,
    cardZOffsets,
    tracePaneZ,
  };
}

export interface BioInteriorKinematics {
  dnaRotationY: number;
  geneClampY: number;
  geneGlowIntensity: number;
  spatialHaloIntensity: number;
  nucleusGlowIntensity: number;
  drugDockProgress: number;
  cellMembraneScale: number;
  receptorActiveRatio: number;
  geneSignalU: number;
  geneSignalAlpha: number;
  drugSignalU: number;
  drugSignalAlpha: number;
}

/**
 * Pure C-infinity periodic closed-loop kinematics for the 3D Virtual Cell interior elements.
 * Parameterized by cyclePhase in [0, 1) so every rotation, oscillation, docking trajectory,
 * and signal pulse wraps from 1.0 -> 0.0 with ZERO step discontinuity (guaranteed self-looping).
 */
export function computeBioInteriorKinematics(
  scenarioId: string,
  cyclePhase: number
): BioInteriorKinematics {
  const p = ((cyclePhase % 1) + 1) % 1;
  const theta = p * Math.PI * 2;

  const isGeneFocused = scenarioId === 'hspc-enhancer-editing';
  const isDrugFocused = scenarioId === 'pdac-stroma-barrier';

  // Smooth periodic raised-cosine weights centered on each of the 4 model stages:
  // w0 (0.125: Step 01), w1 (0.375: Step 02), w2 (0.625: Step 03), w3 (0.875: Step 04)
  const stageWeight = (center: number): number => {
    const c = 0.5 + 0.5 * Math.cos(2 * Math.PI * (p - center));
    return c * c;
  };

  const w0 = stageWeight(0.125);
  const w1 = stageWeight(0.375);
  const w2 = stageWeight(0.625);
  const w3 = stageWeight(0.875);

  // Exact 2 full turns per cycle -> seamless wrap modulo 2*PI
  const dnaRotationY = theta * 2;
  const geneClampY = Number(
    (0.04 + Math.sin(theta * 2) * (isGeneFocused ? 0.22 : 0.14)).toFixed(4)
  );

  // Gene locus glows strongly when DNA step is active (Step 01 in Scen 02, Step 03 in Scen 01, Step 02 in Scen 03)
  const dnaStageBoost = isGeneFocused
    ? 0.68 * w0
    : isDrugFocused
    ? 0.66 * w2
    : 0.58 * w1;
  const geneGlowIntensity = Number((0.3 + dnaStageBoost + 0.14 * w3).toFixed(4));

  // Spatial Microenvironment Halo glows strongly during Cyto.Spatial (Step 01 in Scen 01 & 03)
  const spatialHaloIntensity = Number(
    (0.22 + (isGeneFocused ? 0.25 * w3 : 0.68 * w0 + 0.22 * w3)).toFixed(4)
  );

  const nucleusGlowIntensity = Number((0.24 + 0.62 * w1 + 0.34 * w3).toFixed(4));

  // Smooth periodic drug docking: peaks across Perturbation (w2) -> CoScientist (w3), smoothly undocks to baseline by p=0/1
  const rawDock =
    0.14 +
    (isDrugFocused ? 0.84 : 0.78) * Math.min(1, 0.12 * w1 + 0.94 * w2 + 0.84 * w3) +
    0.03 * Math.sin(theta * 3);
  const drugDockProgress = Number(Math.max(0, Math.min(1, rawDock)).toFixed(4));

  const cellMembraneScale = Number((1 + 0.022 * Math.sin(theta * 3) + 0.02 * w3).toFixed(4));
  const receptorActiveRatio = Number(
    Math.max(0.2, Math.min(1, 0.22 + 0.78 * Math.min(1, 0.25 * w1 + 0.82 * w2 + 0.98 * w3))).toFixed(
      4
    )
  );

  // 4 periodic pulses per full cycle, fading smoothly to 0 at endpoints u=0 and u=1 (zero teleport snap)
  const geneSignalU = Number(((p * 4) % 1).toFixed(4));
  const geneSignalAlpha = Number(Math.sin(Math.PI * geneSignalU).toFixed(4));

  const drugSignalU = Number(((p * 4 + 0.5) % 1).toFixed(4));
  const drugSignalAlpha = Number(Math.sin(Math.PI * drugSignalU).toFixed(4));

  return {
    dnaRotationY,
    geneClampY,
    geneGlowIntensity,
    spatialHaloIntensity,
    nucleusGlowIntensity,
    drugDockProgress,
    cellMembraneScale,
    receptorActiveRatio,
    geneSignalU,
    geneSignalAlpha,
    drugSignalU,
    drugSignalAlpha,
  };
}
