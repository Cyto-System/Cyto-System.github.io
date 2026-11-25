export type Lang = 'zh' | 'en';

export type TierId = '01' | '02' | '03';

export type ReleaseStatus = 'open_source' | 'report_only' | 'cloud_trial' | 'in_dev';

export interface BilingualText {
  zh: string;
  en: string;
}

export interface CytoModule {
  id: string;
  name: string;
  tier: TierId;
  tierTitle: BilingualText;
  shortRole: BilingualText;
  tableTask: BilingualText;
  scaleLabel: BilingualText;
  inputOutput: BilingualText;
  summary: BilingualText;
  reportLabel: string;
  reportUrl: string;
  codeWeightsLabel: BilingualText;
  repoSlug?: string;
  status: ReleaseStatus;
  inMainTable: boolean;
  highlights: { zh: string[]; en: string[] };
}

export interface CytoRepo {
  slug: string;
  title: string;
  moduleRef: string;
  subtitle: BilingualText;
  description: BilingualText;
  quickstartCmd: string;
  pythonSnippet: string;
  weightsHost: string;
}

export interface MarkerGeneSpec {
  gene: string;
  pathway: BilingualText;
  baselineExpr: number;
  maxDeltaLog2FC: number;
  hillK50: number;
  hillN: number;
}

export interface FateStateSpec {
  id: string;
  name: BilingualText;
  baseShare: number;
  shiftSlope: number;
}

export interface PerturbationScenario {
  id: string;
  index: string;
  tabLabel: BilingualText;
  targetLocus: string;
  perturbationMode: BilingualText;
  tissueNiche: BilingualText;
  modulesUsed: string[];
  question: BilingualText;
  givenContext: BilingualText;
  constraints: BilingualText;
  openQuestion: BilingualText;
  nextWetLabStep: BilingualText;
  markers: MarkerGeneSpec[];
  fateStates: FateStateSpec[];
}

export interface ComputedMarkerDelta {
  gene: string;
  pathway: BilingualText;
  baselineExpr: number;
  perturbedExpr: number;
  log2FC: number;
}

export interface ComputedFateShare {
  id: string;
  name: BilingualText;
  baselinePct: number;
  perturbedPct: number;
  deltaPct: number;
}

export interface PerturbationSimulationResult {
  dosePercent: number;
  effectiveHillFactor: number;
  markers: ComputedMarkerDelta[];
  fates: ComputedFateShare[];
  phenotypeShiftIndex: number;
  nicheCoherenceScore: number;
}

export interface BenchmarkEntry {
  model: string;
  isCyto: boolean;
  score: number;
  note: BilingualText;
}

export interface BenchmarkSuite {
  id: string;
  tabLabel: BilingualText;
  metricName: BilingualText;
  axisMin: number;
  axisMax: number;
  leadHeadline: string;
  leadSubtitle: BilingualText;
  entries: BenchmarkEntry[];
}

export interface CoScientistCase {
  id: string;
  index: string;
  title: BilingualText;
  domainKicker: BilingualText;
  targetGene: string;
  tissueContext: BilingualText;
  initialMetric: string;
  initialDesc: BilingualText;
  validatedMetric: string;
  validatedDesc: BilingualText;
  significance: BilingualText;
  steps: {
    stepIndex: string;
    phase: BilingualText;
    module: string;
    detail: BilingualText;
    readout: string;
  }[];
}

export interface CustomHypothesisInput {
  targetGene: string;
  tissueContext: string;
  perturbationMode: 'crispr_ko' | 'crispr_a' | 'cytokine_blockade';
}

export interface ValidationResult {
  valid: boolean;
  errors: {
    targetGene?: BilingualText;
    tissueContext?: BilingualText;
  };
}

export const CYTO_TIERS: {
  id: TierId;
  title: BilingualText;
  question: BilingualText;
  enKicker: string;
}[] = [
  {
    id: '01',
    title: { zh: '01 读懂细胞', en: '01 Read Cell State' },
    question: { zh: '细胞处于什么状态？', en: 'What state is the cell currently in?' },
    enKicker: 'TIER 01 · MULTI-SCALE STATE READOUT',
  },
  {
    id: '02',
    title: { zh: '02 推演细胞', en: '02 Simulate & Reason' },
    question: {
      zh: '它是谁？会怎样变？干预后会怎样？',
      en: 'What is its identity, how will it evolve, and how does it respond to intervention?',
    },
    enKicker: 'TIER 02 · IDENTITY, DYNAMICS & PERTURBATION',
  },
  {
    id: '03',
    title: { zh: '03 闭环发现', en: '03 Closed-Loop Discovery' },
    question: {
      zh: '多尺度关联，自主提出并验证科学问题',
      en: 'Cross-scale synthesis to autonomously formulate and validate hypotheses',
    },
    enKicker: 'TIER 03 · AUTONOMOUS SCIENTIFIC DISCOVERY',
  },
];

export const CYTO_MODULES: CytoModule[] = [
  {
    id: 'cyto-genome',
    name: 'Cyto.Genome',
    tier: '01',
    tierTitle: { zh: '01 读懂细胞', en: '01 Read Cell State' },
    shortRole: { zh: '基因组到分子表达', en: 'Genome sequence to molecular expression' },
    tableTask: { zh: '基因组到分子表达', en: 'Genome-to-molecular expression modeling' },
    scaleLabel: { zh: 'DNA 序列 · 顺式调控 · 转录起始 (bp → Mb)', en: 'DNA sequence · Cis-regulation · Transcription (bp → Mb)' },
    inputOutput: {
      zh: '输入：参考基因组序列与变异位点 → 输出：细胞类型特异染色质可及性与基因表达谱',
      en: 'Input: Genomic sequence & variants → Output: Cell-type-specific chromatin accessibility & expression',
    },
    summary: {
      zh: '建立长程基因组序列到单细胞分子表达的因果映射，解析非编码区顺式调控元件与致病变异在不同细胞状态下的表达效应。cyto-genome 仓库将在 2026 年 12 月底代码和权重开源时正式创建。',
      en: 'Maps long-range DNA sequence directly to cell-state molecular expression, decoding non-coding cis-regulatory elements and variant effects. Code and weights open-source in late December 2026.',
    },
    reportLabel: 'arXiv',
    reportUrl: '#report-viewer',
    codeWeightsLabel: { zh: '2026.12 开源', en: 'Open-source 2026.12' },
    status: 'report_only',
    inMainTable: true,
    highlights: {
      zh: ['长上下文基因组序列编码', '零样本非编码变异表达预测', '跨组织顺式调控语法对齐'],
      en: ['Long-context sequence encoding', 'Zero-shot non-coding variant effect prediction', 'Cross-tissue cis-regulatory alignment'],
    },
  },
  {
    id: 'cyto-multiomics',
    name: 'Cyto.Multiomics',
    tier: '01',
    tierTitle: { zh: '01 读懂细胞', en: '01 Read Cell State' },
    shortRole: { zh: '单细胞多组学', en: 'Single-cell multiomics integration' },
    tableTask: { zh: '单细胞多组学统一表征', en: 'Unified single-cell multiomics representation' },
    scaleLabel: { zh: '表观组 · 转录组 · 蛋白组跨模态对齐', en: 'Epigenome · Transcriptome · Proteome alignment' },
    inputOutput: {
      zh: '输入：scRNA / scATAC / CITE-seq 异构模态 → 输出：统一潜在细胞状态流形与跨模态补全',
      en: 'Input: Heterogeneous scRNA / scATAC / CITE-seq → Output: Unified cell-state manifold & cross-modal imputation',
    },
    summary: {
      zh: '连接表观遗传调控、RNA 转录丰度与表面蛋白丰度的单细胞多组学基础表征模块，当前正在联合攻关研发中，发布后将补入模型主表。',
      en: 'Bridges chromatin accessibility, RNA abundance, and surface proteomics into a unified single-cell state representation. Currently in active R&D.',
    },
    reportLabel: '研发中',
    reportUrl: '#models',
    codeWeightsLabel: { zh: '发布后补入上表', en: 'Added upon release' },
    status: 'in_dev',
    inMainTable: false,
    highlights: {
      zh: ['异构单细胞组学联合预训练', '缺失模态高保真生成补全', '跨批次细胞状态稳健对齐'],
      en: ['Joint multi-modal pretraining', 'High-fidelity missing modality imputation', 'Batch-invariant state representation'],
    },
  },
  {
    id: 'cyto-spatial',
    name: 'Cyto.Spatial',
    tier: '01',
    tierTitle: { zh: '01 读懂细胞', en: '01 Read Cell State' },
    shortRole: { zh: '组织 Niche', en: 'Tissue Niche spatial foundation' },
    tableTask: { zh: '组织 Niche 空间细胞群基座', en: 'Tissue Niche spatial cell-community foundation' },
    scaleLabel: { zh: '亚细胞空间转录组 · 邻域微环境 Niche (10 μm → cm)', en: 'Subcellular spatial omics · Tissue Niche (10 μm → cm)' },
    inputOutput: {
      zh: '输入：空间转录组坐标与邻域图谱 → 输出：组织微环境 Niche 表征与细胞间通讯场',
      en: 'Input: Spatial coordinates & neighborhood graphs → Output: Tissue Niche embeddings & cell-cell communication fields',
    },
    summary: {
      zh: '面向高分辨率空间组学（Stereo-seq / Merfish / Visium HD）构建的组织微环境（Niche）基座模型，刻画细胞群空间拓扑结构与配受体邻域互作，代码与权重已全面开源。',
      en: 'Spatial foundation model built on high-resolution spatial transcriptomics (Stereo-seq, MERFISH, Visium HD) to decode tissue niche topology and ligand-receptor interactions. Fully open-sourced.',
    },
    reportLabel: 'bioRxiv',
    reportUrl: '#report-viewer',
    codeWeightsLabel: { zh: 'GitHub (cyto-spatial)', en: 'GitHub (cyto-spatial)' },
    repoSlug: 'cyto-spatial',
    status: 'open_source',
    inMainTable: true,
    highlights: {
      zh: ['亿级空间斑点与细胞邻域预训练', '跨切片三维组织微环境 Niche 识别', '开源代码、权重与复现 Notebook'],
      en: ['Pretrained on 100M+ spatial niches', 'Cross-slice 3D niche domain discovery', 'Open weights, code & reproduction scripts'],
    },
  },
  {
    id: 'cyto-identity',
    name: 'Cyto.Identity',
    tier: '02',
    tierTitle: { zh: '02 推演细胞', en: '02 Simulate & Reason' },
    shortRole: { zh: '它是谁', en: 'Reasoning-based cell identity' },
    tableTask: { zh: '可推理细胞鉴定', en: 'Reasoning-capable cell identity annotation' },
    scaleLabel: { zh: '细胞本体论 · 谱系标志物证据链推理', en: 'Cell Ontology · Marker evidence chain reasoning' },
    inputOutput: {
      zh: '输入：单细胞表达谱与组织上下文 → 输出：层级细胞身份判定 + 可解释分子证据链',
      en: 'Input: Single-cell profile & tissue context → Output: Hierarchical cell identity + explicit molecular reasoning chain',
    },
    summary: {
      zh: '突破传统黑盒分类器局限，结合基因表达定量信号与生物学通路先验进行多步可解释推理，精确鉴定罕见亚群、过渡态细胞与疾病异常表型。',
      en: 'Moves beyond black-box classification by combining quantitative expression profiles with biological pathway priors to produce auditable multi-step cell identity reasoning.',
    },
    reportLabel: 'arXiv',
    reportUrl: '#report-viewer',
    codeWeightsLabel: { zh: '即将开源', en: 'Opening soon' },
    status: 'report_only',
    inMainTable: true,
    highlights: {
      zh: ['输出完整标志基因与通路推理链', '零样本发现罕见与疾病特异亚群', 'Cell Ontology 层级一致性校验'],
      en: ['Explicit marker & pathway reasoning trace', 'Zero-shot rare & disease subpopulation discovery', 'Cell Ontology hierarchy consistency'],
    },
  },
  {
    id: 'cyto-dynamics',
    name: 'Cyto.Dynamics',
    tier: '02',
    tierTitle: { zh: '02 推演细胞', en: '02 Simulate & Reason' },
    shortRole: { zh: '将如何演化', en: 'Cell state temporal dynamics' },
    tableTask: { zh: '细胞状态演化推演', en: 'Continuous cell-state trajectory & fate dynamics' },
    scaleLabel: { zh: '发育分化 · 疾病进展连续时间流形 (h → months)', en: 'Development · Disease progression manifold (h → months)' },
    inputOutput: {
      zh: '输入：起始细胞群状态分布 → 输出：连续时间演化速度场与谱系分叉概率',
      en: 'Input: Initial cell population distribution → Output: Continuous-time velocity field & lineage bifurcation probabilities',
    },
    summary: {
      zh: '通过神经最优传输与随机微分流匹配建模发育分化、衰老及肿瘤演进过程中的细胞状态连续轨迹，当前处于研发攻关阶段，发布后补入主表。',
      en: 'Models developmental differentiation, aging, and tumor evolution via neural optimal transport and flow matching over cell-state manifolds. Currently in R&D.',
    },
    reportLabel: '研发中',
    reportUrl: '#models',
    codeWeightsLabel: { zh: '发布后补入上表', en: 'Added upon release' },
    status: 'in_dev',
    inMainTable: false,
    highlights: {
      zh: ['神经流匹配重构连续发育轨迹', '命运分叉临界点早期预警识别', '时序单细胞图谱跨时间点外推'],
      en: ['Continuous developmental trajectory reconstruction', 'Early detection of fate bifurcation tipping points', 'Temporal extrapolation across scRNA timepoints'],
    },
  },
  {
    id: 'cyto-perturbation',
    name: 'Cyto.Perturbation',
    tier: '02',
    tierTitle: { zh: '02 推演细胞', en: '02 Simulate & Reason' },
    shortRole: { zh: '干预响应', en: 'Perturbation & intervention response' },
    tableTask: { zh: '扰动 / 干预响应预测', en: 'Genetic & chemical perturbation response prediction' },
    scaleLabel: { zh: 'CRISPR 敲除/激活 · 小分子药物 · 细胞因子组合干预', en: 'CRISPR KO/a · Small molecules · Cytokine combinations' },
    inputOutput: {
      zh: '输入：基线细胞状态 + 基因/药物组合扰动 → 输出：扰动后全转录组响应与表型偏移',
      en: 'Input: Baseline cell state + genetic/drug perturbation → Output: Post-perturbation transcriptome & phenotypic shift',
    },
    summary: {
      zh: '预测未见单基因及双基因组合扰动、药物剂量梯度与细胞因子刺激在特定细胞背景下的转录组与表型响应，代码、预训练权重与复现脚本已在 GitHub 开源。',
      en: 'Predicts transcriptional and phenotypic responses to unseen single/combinatorial CRISPR perturbations, drug dose gradients, and cytokines across cell contexts. Fully open-sourced.',
    },
    reportLabel: 'arXiv',
    reportUrl: '#report-viewer',
    codeWeightsLabel: { zh: 'GitHub (cyto-perturbation)', en: 'GitHub (cyto-perturbation)' },
    repoSlug: 'cyto-perturbation',
    status: 'open_source',
    inMainTable: true,
    highlights: {
      zh: ['未见组合基因敲除协同/拮抗预测', '跨细胞系与原代组织背景泛化', 'Hugging Face 与魔搭双端权重托管'],
      en: ['Unseen combinatorial gene synergy prediction', 'Cross-cell-line & primary tissue generalization', 'Weights hosted on Hugging Face & ModelScope'],
    },
  },
  {
    id: 'cyto-coscientist',
    name: 'Cyto.CoScientist',
    tier: '03',
    tierTitle: { zh: '03 闭环发现', en: '03 Closed-Loop Discovery' },
    shortRole: { zh: '自主科研', en: 'Autonomous scientific agent' },
    tableTask: { zh: '自主科研智能体', en: 'Autonomous multi-scale scientific discovery agent' },
    scaleLabel: { zh: '多尺度模型编排 · 假说生成 · 干湿实验闭环验证', en: 'Multi-scale orchestration · Hypothesis · Closed-loop validation' },
    inputOutput: {
      zh: '输入：开放性生物学/医学问题 → 输出：多尺度推演轨迹、候选靶点方案与可检验实验报告',
      en: 'Input: Open biological/clinical question → Output: Multi-scale simulation trajectory, target candidates & testable protocol',
    },
    summary: {
      zh: '协同调用 Cyto 家族基因组、空间 Niche、身份推理与扰动推演模块，从多尺度生物数据关联中自主提出科学假说、设计虚拟干预验证并输出完整研究轨迹，已上线华大云平台开放试用。',
      en: 'Orchestrates Cyto.Genome, Spatial, Identity, and Perturbation to autonomously synthesize multi-scale evidence, propose mechanistic hypotheses, run virtual interventions, and iterate with experimental feedback.',
    },
    reportLabel: 'arXiv',
    reportUrl: '#report-viewer',
    codeWeightsLabel: { zh: '案例展示 (cyto-coscientist-cases)', en: 'Case trajectories (cyto-coscientist-cases)' },
    repoSlug: 'cyto-coscientist-cases',
    status: 'cloud_trial',
    inMainTable: true,
    highlights: {
      zh: ['串联 01 读懂与 02 推演全栈工具链', '完整可审计科研轨迹与报告展示', '支持华大云平台在线交互试用'],
      en: ['End-to-end orchestration across Tier 01 & Tier 02 models', 'Auditable scientific trajectories & full reports', 'Interactive cloud trial via BGI Cloud Platform'],
    },
  },
];

export const CYTO_REPOS: CytoRepo[] = [
  {
    slug: 'cyto-spatial',
    title: 'cyto-spatial',
    moduleRef: 'Cyto.Spatial',
    subtitle: {
      zh: '代码 · 权重下载 · 示例 notebook · 复现脚本',
      en: 'Code · Model weights · Example notebooks · Reproduction scripts',
    },
    description: {
      zh: '组织 Niche 空间细胞群基座模型官方仓库，支持 Stereo-seq、MERFISH 与 10x Visium HD 空间邻域表征提取、微环境分群及跨切片对齐复现。',
      en: 'Official repository for Cyto.Spatial tissue niche foundation model, supporting Stereo-seq, MERFISH, and Visium HD spatial embedding extraction and niche clustering.',
    },
    quickstartCmd: 'git clone https://github.com/Cyto-System/cyto-spatial.git && cd cyto-spatial && pip install -e .',
    pythonSnippet: `from cyto_spatial import SpatialNicheModel
import scanpy as sc

adata = sc.read_h5ad("stereo_tumor_section.h5ad")
model = SpatialNicheModel.from_pretrained("Cyto-System/cyto-spatial-base")
adata.obsm["X_cyto_niche"] = model.encode_niche(adata, radius_um=50.0)`,
    weightsHost: 'Hugging Face & ModelScope (魔搭)',
  },
  {
    slug: 'cyto-perturbation',
    title: 'cyto-perturbation',
    moduleRef: 'Cyto.Perturbation',
    subtitle: {
      zh: '代码 · 权重下载 · 示例 notebook · 复现脚本',
      en: 'Code · Model weights · Example notebooks · Reproduction scripts',
    },
    description: {
      zh: '基因敲除/激活与小分子干预响应预测模型仓库，内置单扰动与双基因协同扰动零样本推演管线及完整论文图表复现实验脚本。',
      en: 'Genetic and chemical perturbation response prediction suite, featuring zero-shot single/combinatorial CRISPR inference pipelines and paper reproduction scripts.',
    },
    quickstartCmd: 'git clone https://github.com/Cyto-System/cyto-perturbation.git && cd cyto-perturbation && pip install -e .',
    pythonSnippet: `from cyto_perturbation import PerturbationPredictor

predictor = PerturbationPredictor.from_pretrained("Cyto-System/cyto-perturbation-v1")
pred_adata = predictor.predict(
    ctrl_adata,
    perturbations=["PDCD1+LAG3"],
    dose=0.85
)`,
    weightsHost: 'Hugging Face & ModelScope (魔搭)',
  },
  {
    slug: 'cyto-coscientist-cases',
    title: 'cyto-coscientist-cases',
    moduleRef: 'Cyto.CoScientist',
    subtitle: {
      zh: '案例轨迹与报告展示',
      en: 'Autonomous discovery trajectories & full technical reports',
    },
    description: {
      zh: '收录 Cyto.CoScientist 在肿瘤免疫微环境重编程、纤维化空间生态位逆转及罕见亚群调控机制发现中的完整多步推理轨迹与结构化科研报告。',
      en: 'Curated end-to-end execution trajectories and structured scientific reports generated by Cyto.CoScientist across spatial oncology, fibrosis reversal, and lineage fate control.',
    },
    quickstartCmd: 'git clone https://github.com/Cyto-System/cyto-coscientist-cases.git',
    pythonSnippet: `# Browse structured trajectory JSON & rendered reports
import json
with open("cases/spatial_tme_exhaustion_reversal/trajectory.json") as f:
    trace = json.load(f)
print(f"Loaded {len(trace['iterations'])} closed-loop iterations")`,
    weightsHost: '华大云平台在线试用 · GitHub Cases',
  },
  {
    slug: 'cyto-eval',
    title: 'cyto-eval',
    moduleRef: 'All Cyto Modules',
    subtitle: {
      zh: '时空细胞评测体系',
      en: 'Standardized Spatiotemporal Cell Evaluation Suite',
    },
    description: {
      zh: '面向多尺度时空细胞模型的统一基准评测框架，覆盖顺式变异效应、组织 Niche 一致性、可推理细胞鉴定、跨细胞系未见扰动预测及闭环科研评测。',
      en: 'Unified multi-scale evaluation benchmark covering cis-variant expression, spatial niche coherence, reasoning cell annotation, unseen perturbation prediction, and closed-loop discovery.',
    },
    quickstartCmd: 'pip install git+https://github.com/Cyto-System/cyto-eval.git && cyto-eval --list-tasks',
    pythonSnippet: `from cyto_eval import BenchmarkRunner

runner = BenchmarkRunner(suite="perturbation_combo_ood")
metrics = runner.evaluate(predictions_path="outputs/pred_combo.h5ad")
print(metrics.summary_table())`,
    weightsHost: 'GitHub & Hugging Face Datasets',
  },
];

export const PERTURBATION_SCENARIOS: PerturbationScenario[] = [
  {
    id: 'tme-exhaustion',
    index: '01',
    tabLabel: {
      zh: '肿瘤空间免疫耗竭逆转',
      en: 'Spatial TME Exhaustion Reversal',
    },
    targetLocus: 'TOX + HAVCR2 (CRISPRi)',
    perturbationMode: {
      zh: '双基因协同抑制 · 肿瘤边界 Niche',
      en: 'Dual-gene CRISPRi · Tumor boundary niche',
    },
    tissueNiche: {
      zh: '结直肠癌肝转移边界免疫生态位 (Stereo-seq)',
      en: 'CRC liver metastasis invasive margin niche (Stereo-seq)',
    },
    modulesUsed: ['Cyto.Spatial', 'Cyto.Identity', 'Cyto.Perturbation'],
    question: {
      zh: '如何在富含 SPP1+ 巨噬细胞的免疫排斥边界逆转 CD8+ T 细胞终末耗竭？',
      en: 'How to reverse terminal CD8+ T-cell exhaustion within an SPP1+ macrophage exclusionary boundary?',
    },
    givenContext: {
      zh: '已知状态：Cyto.Spatial 识别出距肿瘤浸润前沿 35 μm 内存在高密度 SPP1+ TAM 与耗竭态 Tex 空间共定位簇。',
      en: 'Given state: Cyto.Spatial identifies dense SPP1+ TAM and terminal Tex co-localization within 35 μm of the invasive margin.',
    },
    constraints: {
      zh: '边界约束：单一 PDCD1 阻断在该空间微环境中仅引起微弱效应记忆恢复，伴随高凋亡率。',
      en: 'Constraint: Single-agent PDCD1 blockade yields minimal effector-memory recovery with elevated apoptosis in this niche.',
    },
    openQuestion: {
      zh: '推演问题：TOX 与 HAVCR2 梯度联合抑制能否重塑 TCF7+ 前体耗竭态并解除髓系抑制通讯？',
      en: 'Simulation question: Can graded TOX + HAVCR2 co-inhibition restore TCF7+ progenitor-exhausted pools and disrupt myeloid suppression?',
    },
    nextWetLabStep: {
      zh: '下一步验证：在患者来源器官样切片 (PDO-TIL 共培养) 中执行双靶点 sgRNA 扰动并检测 GZMB/IFNG 分泌恢复。',
      en: 'Next step: Validate dual-sgRNA knockdown in patient-derived organoid-TIL co-cultures measuring GZMB/IFNG restoration.',
    },
    markers: [
      { gene: 'TCF7', pathway: { zh: '干细胞样记忆维持', en: 'Stem-like memory renewal' }, baselineExpr: 1.15, maxDeltaLog2FC: 2.38, hillK50: 42, hillN: 2.1 },
      { gene: 'GZMB', pathway: { zh: '细胞毒效应杀伤', en: 'Cytotoxic effector lysis' }, baselineExpr: 1.82, maxDeltaLog2FC: 1.94, hillK50: 48, hillN: 1.9 },
      { gene: 'IFNG', pathway: { zh: 'I 型免疫激活因子', en: 'Type-I immune activation' }, baselineExpr: 1.34, maxDeltaLog2FC: 1.76, hillK50: 45, hillN: 2.0 },
      { gene: 'HAVCR2', pathway: { zh: '免疫检查点耗竭受体', en: 'Exhaustion checkpoint receptor' }, baselineExpr: 4.40, maxDeltaLog2FC: -2.85, hillK50: 32, hillN: 2.2 },
      { gene: 'SPP1 (邻域响应)', pathway: { zh: '髓系促纤维化信号', en: 'Myeloid fibrotic niche signal' }, baselineExpr: 3.95, maxDeltaLog2FC: -1.42, hillK50: 55, hillN: 1.8 },
    ],
    fateStates: [
      { id: 'tex-term', name: { zh: '终末耗竭态 CD8+ Tex', en: 'Terminal Exhausted CD8+ Tex' }, baseShare: 58.0, shiftSlope: -39.5 },
      { id: 'tpex-stem', name: { zh: '前体记忆态 TCF7+ Tpex', en: 'Progenitor TCF7+ Tpex' }, baseShare: 14.0, shiftSlope: 24.5 },
      { id: 'teff-active', name: { zh: '细胞毒效应态 GZMB+ Teff', en: 'Cytotoxic Effector Teff' }, baseShare: 16.0, shiftSlope: 18.0 },
      { id: 'treg-bystander', name: { zh: '静息旁观态 T 亚群', en: 'Quiescent Bystander T' }, baseShare: 12.0, shiftSlope: -3.0 },
    ],
  },
  {
    id: 'hsc-lineage',
    index: '02',
    tabLabel: {
      zh: '造血干祖谱系定向重编程',
      en: 'HSC Lineage Fate Steering',
    },
    targetLocus: 'GATA1 ↑ + SPI1 ↓ (CRISPRa/i)',
    perturbationMode: {
      zh: '转录因子拮抗对调控 · 骨髓造血微环境',
      en: 'TF toggle modulation · Bone marrow niche',
    },
    tissueNiche: {
      zh: '人骨髓窦周血管内皮生态位 (CD34+ HSPC)',
      en: 'Human bone marrow perisinusoidal niche (CD34+ HSPC)',
    },
    modulesUsed: ['Cyto.Genome', 'Cyto.Identity', 'Cyto.Perturbation'],
    question: {
      zh: '顺式增强子激活配合髓系转录因子抑制如何精确跨过红系-巨核谱系分叉鞍点？',
      en: 'How does cis-enhancer activation paired with myeloid TF suppression steer multipotent progenitors across the erythroid saddle point?',
    },
    givenContext: {
      zh: '已知状态：Cyto.Identity 将双潜能过渡细胞群鉴定为 GATA2+ 多能祖细胞 (MPP-MEP 临界态)。',
      en: 'Given state: Cyto.Identity resolves bipotent transitional cells as GATA2+ multipotent progenitors near the MPP-MEP boundary.',
    },
    constraints: {
      zh: '边界约束：过强单因子过表达会导致细胞周期阻滞与非生理性应激转录特征。',
      en: 'Constraint: Supraphysiological single-factor overexpression induces cell-cycle arrest and stress transcriptional signatures.',
    },
    openQuestion: {
      zh: '推演问题：什么剂量窗口能在维持细胞活率前提下最大化红系功能成熟轨迹比例？',
      en: 'Simulation question: Which intervention window maximizes physiological erythroid commitment without stress arrest?',
    },
    nextWetLabStep: {
      zh: '下一步验证：在原代 CD34+ 细胞中滴定 dCas9-VPR 激活强度并于第 7 天执行单细胞多组学测序验证。',
      en: 'Next step: Titrate dCas9-VPR activation in primary CD34+ HSPCs followed by Day-7 single-cell RNA+ATAC readout.',
    },
    markers: [
      { gene: 'KLF1', pathway: { zh: '红系谱系主控因子', en: 'Erythroid master regulator' }, baselineExpr: 1.08, maxDeltaLog2FC: 2.64, hillK50: 38, hillN: 2.4 },
      { gene: 'HBB', pathway: { zh: '血红蛋白功能表达', en: 'Adult beta-globin synthesis' }, baselineExpr: 0.92, maxDeltaLog2FC: 3.12, hillK50: 52, hillN: 2.3 },
      { gene: 'TFRC', pathway: { zh: '转铁蛋白受体摄取', en: 'Transferrin receptor uptake' }, baselineExpr: 2.05, maxDeltaLog2FC: 1.55, hillK50: 44, hillN: 1.7 },
      { gene: 'SPI1', pathway: { zh: '髓系分支竞争网络', en: 'Myeloid competing program' }, baselineExpr: 3.62, maxDeltaLog2FC: -2.48, hillK50: 36, hillN: 2.1 },
      { gene: 'MPO', pathway: { zh: '粒单核分化标志', en: 'Granulocyte-monocyte marker' }, baselineExpr: 2.94, maxDeltaLog2FC: -2.06, hillK50: 46, hillN: 1.9 },
    ],
    fateStates: [
      { id: 'mpp-uncommitted', name: { zh: '未定型多能祖细胞 MPP', en: 'Uncommitted MPP' }, baseShare: 46.0, shiftSlope: -31.0 },
      { id: 'ery-committed', name: { zh: '定向红系前体细胞 EryP', en: 'Committed Erythroid EryP' }, baseShare: 18.0, shiftSlope: 42.0 },
      { id: 'gmp-myeloid', name: { zh: '粒单核系祖细胞 GMP', en: 'Granulocyte-Monocyte GMP' }, baseShare: 26.0, shiftSlope: -16.0 },
      { id: 'mk-prog', name: { zh: '巨核系前体细胞 MkP', en: 'Megakaryocyte Progenitor MkP' }, baseShare: 10.0, shiftSlope: 5.0 },
    ],
  },
  {
    id: 'fibrosis-niche',
    index: '03',
    tabLabel: {
      zh: '肺纤维化空间生态位解耦',
      en: 'Pulmonary Fibrosis Niche Uncoupling',
    },
    targetLocus: 'TGFBR1 + CTHRC1 (Perturbation)',
    perturbationMode: {
      zh: '配受体通路阻断 · 肺泡成纤维灶 Niche',
      en: 'Receptor-axis blockade · Fibroblastic focus niche',
    },
    tissueNiche: {
      zh: '特发性肺纤维化 KRT17+ 异常基底样上皮邻域',
      en: 'IPF KRT17+ aberrant basaloid-fibroblast spatial niche',
    },
    modulesUsed: ['Cyto.Spatial', 'Cyto.Perturbation', 'Cyto.CoScientist'],
    question: {
      zh: '阻断异常上皮-肌成纤维细胞正反馈环能否促进受损肺泡 AT2 修复再生？',
      en: 'Can uncoupling the aberrant basaloid–myofibroblast paracrine loop unlock alveolar AT2 regenerative repair?',
    },
    givenContext: {
      zh: '已知状态：Cyto.Spatial 解析出 KRT17+ 异常上皮与 CTHRC1+ 致病成纤维细胞形成自维持细胞外基质沉积核。',
      en: 'Given state: Cyto.Spatial maps a self-reinforcing ECM-depositing core between KRT17+ basaloid cells and CTHRC1+ fibroblasts.',
    },
    constraints: {
      zh: '边界约束：全身泛 TGF-β 抑制存在毒性风险，需评估局部靶向剂量下的上皮再生收益。',
      en: 'Constraint: Systemic pan-TGF-β blockade carries toxicity; localized receptor-axis dosing must preserve epithelial repair.',
    },
    openQuestion: {
      zh: '推演问题：局部阻断 TGFBR1/CTHRC1 轴能否同步下调 COL1A1 并提升 SFTPC+ AT2 细胞比例？',
      en: 'Simulation question: Does targeted TGFBR1/CTHRC1 inhibition suppress COL1A1 while expanding SFTPC+ AT2 cells?',
    },
    nextWetLabStep: {
      zh: '下一步验证：在人精密切割肺切片 (hPCLS) 模型中给予双通路抑制剂并进行空间转录组复测。',
      en: 'Next step: Test dual-axis inhibition in human precision-cut lung slices (hPCLS) with spatial transcriptomic profiling.',
    },
    markers: [
      { gene: 'SFTPC', pathway: { zh: 'II 型肺泡上皮再生标志', en: 'Alveolar AT2 regeneration' }, baselineExpr: 1.12, maxDeltaLog2FC: 2.18, hillK50: 47, hillN: 2.0 },
      { gene: 'AGER', pathway: { zh: 'I 型气体交换上皮恢复', en: 'AT1 gas-exchange maturation' }, baselineExpr: 0.96, maxDeltaLog2FC: 1.62, hillK50: 54, hillN: 1.9 },
      { gene: 'COL1A1', pathway: { zh: '病理胶原基质沉积', en: 'Pathological collagen deposition' }, baselineExpr: 5.10, maxDeltaLog2FC: -2.92, hillK50: 35, hillN: 2.2 },
      { gene: 'CTHRC1', pathway: { zh: '致病成纤维细胞核心基因', en: 'Pathogenic fibroblast driver' }, baselineExpr: 4.35, maxDeltaLog2FC: -2.65, hillK50: 39, hillN: 2.1 },
      { gene: 'KRT17', pathway: { zh: '异常基底样停滞表型', en: 'Aberrant basaloid stall state' }, baselineExpr: 3.80, maxDeltaLog2FC: -1.78, hillK50: 50, hillN: 1.8 },
    ],
    fateStates: [
      { id: 'myofib-core', name: { zh: '致病肌成纤维态 CTHRC1+', en: 'Pathogenic CTHRC1+ Myofibroblast' }, baseShare: 48.0, shiftSlope: -32.0 },
      { id: 'basaloid-stall', name: { zh: '异常基底停滞态 KRT17+', en: 'Aberrant KRT17+ Basaloid' }, baseShare: 24.0, shiftSlope: -12.0 },
      { id: 'at2-repair', name: { zh: '再生修复态 SFTPC+ AT2', en: 'Regenerative SFTPC+ AT2' }, baseShare: 16.0, shiftSlope: 28.0 },
      { id: 'homeo-stroma', name: { zh: '稳态肺泡间质细胞', en: 'Homeostatic Alveolar Stroma' }, baseShare: 12.0, shiftSlope: 16.0 },
    ],
  },
];

export const CYTO_BENCHMARK_SUITES: BenchmarkSuite[] = [
  {
    id: 'perturbation-ood',
    tabLabel: { zh: '组合扰动预测 (Perturbation)', en: 'Combo Perturbation (OOD)' },
    metricName: {
      zh: '未见双基因扰动差异表达 Pearson r (Top-50 DEGs)',
      en: 'Unseen 2-gene combo delta-expression Pearson r (Top-50 DEGs)',
    },
    axisMin: 0.4,
    axisMax: 0.9,
    leadHeadline: '0.842',
    leadSubtitle: {
      zh: 'cyto-eval 跨 6 个 CRISPR 扰动数据集平均相关系数领先',
      en: 'Leading mean delta Pearson r across 6 CRISPR combo datasets in cyto-eval',
    },
    entries: [
      { model: 'Cyto.Perturbation', isCyto: true, score: 0.842, note: { zh: '开源基座 · 多尺度通路先验对齐', en: 'Open-source · Pathway-grounded' } },
      { model: 'GEARS-v2', isCyto: false, score: 0.764, note: { zh: '知识图谱引导扰动基线', en: 'GO-graph guided baseline' } },
      { model: 'scGPT-Perturb', isCyto: false, score: 0.748, note: { zh: '单细胞生成式预训练微调', en: 'Generative pretrained fine-tuned' } },
      { model: 'Geneformer-30M', isCyto: false, score: 0.719, note: { zh: '排序编码预训练模型', en: 'Rank-value pretrained transformer' } },
      { model: 'CPA (Compositional)', isCyto: false, score: 0.685, note: { zh: '自编码组合扰动基线', en: 'Compositional autoencoder' } },
      { model: 'Linear Additive', isCyto: false, score: 0.612, note: { zh: '单基因效应线性叠加基准', en: 'Single-gene additive baseline' } },
    ],
  },
  {
    id: 'spatial-niche',
    tabLabel: { zh: '空间 Niche 识别 (Spatial)', en: 'Spatial Niche Coherence' },
    metricName: {
      zh: '跨平台组织微环境重建综合得分 (ARI + Niche-F1)',
      en: 'Cross-platform tissue niche reconstruction composite (ARI + Niche-F1)',
    },
    axisMin: 0.4,
    axisMax: 0.95,
    leadHeadline: '0.891',
    leadSubtitle: {
      zh: '覆盖 Stereo-seq、MERFISH 与 Visium HD 18 套组织图谱',
      en: 'Evaluated across 18 Stereo-seq, MERFISH, and Visium HD tissue atlases',
    },
    entries: [
      { model: 'Cyto.Spatial', isCyto: true, score: 0.891, note: { zh: '开源空间细胞群基座模型', en: 'Open-source spatial community model' } },
      { model: 'Nicheformer', isCyto: false, score: 0.816, note: { zh: '空间转录组 Transformer 基线', en: 'Spatial transformer baseline' } },
      { model: 'GraphST', isCyto: false, score: 0.772, note: { zh: '图自监督对比空间聚类', en: 'Graph self-supervised clustering' } },
      { model: 'STAGATE', isCyto: false, score: 0.749, note: { zh: '图注意力空间结构编码', en: 'Graph attention auto-encoder' } },
      { model: 'Banksy', isCyto: false, score: 0.731, note: { zh: '邻域特征增强空间分群', en: 'Neighborhood-augmented clustering' } },
      { model: 'Non-spatial scVI', isCyto: false, score: 0.568, note: { zh: '无空间坐标单细胞变分基线', en: 'Non-spatial variational baseline' } },
    ],
  },
  {
    id: 'identity-reasoning',
    tabLabel: { zh: '可推理细胞鉴定 (Identity)', en: 'Reasoning Cell Identity' },
    metricName: {
      zh: '跨器官零样本罕见亚群鉴定 Macro-F1 (含证据链一致性)',
      en: 'Cross-organ zero-shot rare cell subtype Macro-F1',
    },
    axisMin: 0.45,
    axisMax: 0.95,
    leadHeadline: '0.876',
    leadSubtitle: {
      zh: '在未见疾病样本中兼顾层级分类精度与标志物推理可审计性',
      en: 'Balances zero-shot subtype precision with auditable marker reasoning chains',
    },
    entries: [
      { model: 'Cyto.Identity', isCyto: true, score: 0.876, note: { zh: '显式证据链推理细胞鉴定', en: 'Explicit reasoning-chain annotation' } },
      { model: 'CellTypist-Ens', isCyto: false, score: 0.793, note: { zh: '集成逻辑回归参考映射', en: 'Ensemble reference classifier' } },
      { model: 'scGPT-ZeroShot', isCyto: false, score: 0.768, note: { zh: '预训练嵌入零样本检索', en: 'Pretrained embedding retrieval' } },
      { model: 'UCE (Universal Cell)', isCyto: false, score: 0.754, note: { zh: '跨物种统一细胞表征', en: 'Universal cell embedding' } },
      { model: 'scANVI', isCyto: false, score: 0.722, note: { zh: '半监督变分推断迁移', en: 'Semi-supervised variational transfer' } },
      { model: 'SingleR', isCyto: false, score: 0.664, note: { zh: '相关性参考转录组比对', en: 'Correlation reference mapping' } },
    ],
  },
];

export const COSCIENTIST_CASES: CoScientistCase[] = [
  {
    id: 'case-crc-niche',
    index: '01',
    title: {
      zh: '肝转移浸润前沿“免疫屏障生态位”组合干预发现',
      en: 'Combinatorial Disruption of the Invasive-Margin Immune Barrier Niche',
    },
    domainKicker: {
      zh: '肿瘤空间免疫学 · CYTO-COSCIENTIST-CASES #01',
      en: 'SPATIAL ONCOLOGY · CYTO-COSCIENTIST-CASES #01',
    },
    targetGene: 'SPP1 + HAVCR2',
    tissueContext: {
      zh: '结直肠癌肝转移 Stereo-seq 空间队列',
      en: 'CRC Liver Metastasis Stereo-seq Cohort',
    },
    initialMetric: '11.4%',
    initialDesc: {
      zh: '基线浸润前沿有效细胞毒 CD8+ T 渗透率',
      en: 'Baseline cytotoxic CD8+ infiltration across margin',
    },
    validatedMetric: '68.5%',
    validatedDesc: {
      zh: '虚拟推演优选双靶点方案在类器官共培养中的杀伤恢复率',
      en: 'Restored tumoroid killing efficiency under co-designed dual blockade',
    },
    significance: {
      zh: 'Cyto.CoScientist 自主串联空间邻域解析 (Cyto.Spatial)、过渡态耗竭亚群推理鉴定 (Cyto.Identity) 与千级双基因虚拟扰动筛选 (Cyto.Perturbation)，定位出 SPP1-CD44 髓系屏障与 T 细胞内在 TOX/HAVCR2 的协同锁定机制。',
      en: 'Cyto.CoScientist autonomously chained spatial niche decoding (Cyto.Spatial), transitional exhaustion reasoning (Cyto.Identity), and combinatorial in-silico screening (Cyto.Perturbation) to uncover synergistic myeloid-T-cell blockade.',
    },
    steps: [
      {
        stepIndex: '01',
        phase: { zh: '空间异常发现', en: 'Spatial Anomaly Detection' },
        module: 'Cyto.Spatial',
        detail: {
          zh: '扫描 24 例肝转移空间切片，锁定宽度 30–60 μm 的成纤维-SPP1+ 巨噬细胞富集免疫排斥带。',
          en: 'Scanned 24 metastasis sections, isolating a 30–60 μm fibroblast–SPP1+ macrophage exclusionary belt.',
        },
        readout: 'Niche Enrichment z = +6.42',
      },
      {
        stepIndex: '02',
        phase: { zh: '亚群可推理鉴定', en: 'Reasoning Cell Annotation' },
        module: 'Cyto.Identity',
        detail: {
          zh: '基于标志物推理链区分驻留于边界内侧的 TCF7+ 前体耗竭亚群与不可逆终末耗竭态。',
          en: 'Distinguished border-resident TCF7+ progenitor-exhausted cells from terminally exhausted subsets via explicit marker chains.',
        },
        readout: 'Tpex Precision = 94.1%',
      },
      {
        stepIndex: '03',
        phase: { zh: '顺式调控致因溯源', en: 'Cis-Regulatory Attribution' },
        module: 'Cyto.Genome',
        detail: {
          zh: '解析缺氧响应增强子对 SPP1 启动子转录活性的序列驱动贡献，排除非因果伴随上调基因。',
          en: 'Quantified hypoxia-responsive enhancer drive on SPP1 transcription, pruning non-causal passenger genes.',
        },
        readout: 'Cis-Attribution Δ = +1.89',
      },
      {
        stepIndex: '04',
        phase: { zh: '高通量虚拟扰动推演', en: 'Combinatorial Perturbation Screen' },
        module: 'Cyto.Perturbation',
        detail: {
          zh: '在虚拟边界生态位中并行推演 480 组双靶点干预，筛出 SPP1 + HAVCR2 协同效应排名前 1%。',
          en: 'Simulated 480 dual-target interventions in-silico; SPP1 + HAVCR2 ranked top 1% in synergy.',
        },
        readout: 'Synergy Score = +0.37 log2FC',
      },
      {
        stepIndex: '05',
        phase: { zh: '实验方案生成与闭环修正', en: 'Protocol Synthesis & Loop Update' },
        module: 'Cyto.CoScientist',
        detail: {
          zh: '自动生成 PDO-TIL 湿实验验证矩阵，并根据首轮流式细胞毒读数修正剂量配比假设。',
          en: 'Synthesized PDO-TIL validation protocol and updated dose-ratio priors after round-1 flow cytometry feedback.',
        },
        readout: '3 Closed-Loop Iterations',
      },
    ],
  },
  {
    id: 'case-ipf-regeneration',
    index: '02',
    title: {
      zh: '肺泡上皮异常停滞态的顺式调控与微环境联合解锁',
      en: 'Cis-Regulatory & Niche Unlocking of Stalled Alveolar Regeneration',
    },
    domainKicker: {
      zh: '再生医学与纤维化 · CYTO-COSCIENTIST-CASES #02',
      en: 'REGENERATIVE MEDICINE · CYTO-COSCIENTIST-CASES #02',
    },
    targetGene: 'SOX9 + TGFBR1',
    tissueContext: {
      zh: '人特发性肺纤维化 (IPF) 多模态图谱',
      en: 'Human Idiopathic Pulmonary Fibrosis Atlas',
    },
    initialMetric: '8.2%',
    initialDesc: {
      zh: '纤维化病灶区内受损上皮向功能 AT1/AT2 正常转化率',
      en: 'Baseline epithelial differentiation completion in fibrotic foci',
    },
    validatedMetric: '54.0%',
    validatedDesc: {
      zh: '经推演靶向干预后 hPCLS 切片中 SFTPC+/AGER+ 修复态占比',
      en: 'Restored SFTPC+/AGER+ regenerative epithelial fraction in hPCLS',
    },
    significance: {
      zh: '针对肺纤维化中上皮细胞卡在 KRT17+ 异常基底样中间态的核心难题，Cyto.CoScientist 整合基因组非编码风险位点效应与空间成纤维邻域信号，提出“微环境减压 + 内在转录解锁”双步干预假设。',
      en: 'Addressing KRT17+ basaloid epithelial stalling in IPF, Cyto.CoScientist integrated non-coding GWAS variant effects with spatial fibroblast signaling to formulate a two-stage niche decompression and transcriptional unlocking hypothesis.',
    },
    steps: [
      {
        stepIndex: '01',
        phase: { zh: '风险变异细胞态定位', en: 'Variant-to-State Mapping' },
        module: 'Cyto.Genome',
        detail: {
          zh: '将 11 个 IPF 相关非编码风险变异映射至异常基底样上皮特异开放增强子区域。',
          en: 'Mapped 11 non-coding IPF risk variants onto enhancers selectively active in stalled basaloid epithelium.',
        },
        readout: '11 / 14 Loci Resolved',
      },
      {
        stepIndex: '02',
        phase: { zh: '致病邻域通讯重构', en: 'Pathogenic Niche Decoding' },
        module: 'Cyto.Spatial',
        detail: {
          zh: '量化 CTHRC1+ 肌成纤维细胞对邻近 25 μm 内上皮细胞的机械-TGF-β 持续锁定强度。',
          en: 'Quantified CTHRC1+ myofibroblast TGF-β locking signal within a 25 μm epithelial perimeter.',
        },
        readout: 'Ligand Flux = 4.2x Ctrl',
      },
      {
        stepIndex: '03',
        phase: { zh: '过渡态身份精准确认', en: 'Transitional Identity Audit' },
        module: 'Cyto.Identity',
        detail: {
          zh: '证实 KRT17+/KRT8+ 细胞兼具可逆肺泡祖细胞潜能而非终末鳞状化生。',
          en: 'Verified KRT17+/KRT8+ cells retain reversible alveolar progenitor potential rather than irreversible metaplasia.',
        },
        readout: 'Reversibility Prob = 0.81',
      },
      {
        stepIndex: '04',
        phase: { zh: '序贯干预响应推演', en: 'Sequential Perturbation Simulation' },
        module: 'Cyto.Perturbation',
        detail: {
          zh: '对比同步给药与序贯阻断，推演显示先解除 TGFBR1 压制再调控 SOX9 窗口可避免细胞凋亡。',
          en: 'Demonstrated sequential TGFBR1 release prior to SOX9 modulation prevents stress apoptosis.',
        },
        readout: 'AT2 Recovery +45.8%',
      },
      {
        stepIndex: '05',
        phase: { zh: '闭环研究报告输出', en: 'Closed-Loop Report Generation' },
        module: 'Cyto.CoScientist',
        detail: {
          zh: '输出包含因果证据图、反事实对照实验设计与可复现评分记录的结构化研究报告。',
          en: 'Generated auditable report with counterfactual controls, dose windows, and spatial readout endpoints.',
        },
        readout: 'Full Trace Archived',
      },
    ],
  },
];

export type ModelFilterKey = 'all' | '01' | '02' | '03' | 'available' | 'in_dev';

export function filterCytoModules(
  modules: CytoModule[],
  filterKey: ModelFilterKey,
  query: string
): CytoModule[] {
  const normalizedQuery = query.trim().toLowerCase();

  return modules.filter((mod) => {
    if (filterKey === '01' || filterKey === '02' || filterKey === '03') {
      if (mod.tier !== filterKey) return false;
    } else if (filterKey === 'available') {
      if (mod.status !== 'open_source' && mod.status !== 'cloud_trial') return false;
    } else if (filterKey === 'in_dev') {
      if (mod.status !== 'in_dev') return false;
    }

    if (!normalizedQuery) return true;

    const haystack = [
      mod.name,
      mod.tier,
      mod.tierTitle.zh,
      mod.tierTitle.en,
      mod.shortRole.zh,
      mod.shortRole.en,
      mod.tableTask.zh,
      mod.tableTask.en,
      mod.reportLabel,
      mod.codeWeightsLabel.zh,
      mod.codeWeightsLabel.en,
      mod.repoSlug ?? '',
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(normalizedQuery);
  });
}

export function computeHillActivation(dosePercent: number, k50: number, n: number): number {
  const clamped = Math.max(0, Math.min(100, dosePercent));
  if (clamped === 0) return 0;
  const dPow = Math.pow(clamped, n);
  const kPow = Math.pow(Math.max(1, k50), n);
  return dPow / (kPow + dPow);
}

export function simulatePerturbation(
  scenario: PerturbationScenario,
  dosePercent: number
): PerturbationSimulationResult {
  const clampedDose = Math.max(0, Math.min(100, Math.round(dosePercent)));

  const markers: ComputedMarkerDelta[] = scenario.markers.map((m) => {
    const hill = computeHillActivation(clampedDose, m.hillK50, m.hillN);
    const log2FC = Number((m.maxDeltaLog2FC * hill).toFixed(2));
    const perturbedExpr = Number(Math.max(0.05, m.baselineExpr * Math.pow(2, log2FC * 0.45)).toFixed(2));
    return {
      gene: m.gene,
      pathway: m.pathway,
      baselineExpr: m.baselineExpr,
      perturbedExpr,
      log2FC,
    };
  });

  const globalHill = computeHillActivation(clampedDose, 44, 2.0);
  const rawShares = scenario.fateStates.map((f) =>
    Math.max(1.5, f.baseShare + f.shiftSlope * globalHill)
  );
  const rawTotal = rawShares.reduce((acc, v) => acc + v, 0);

  let runningSum = 0;
  const fates: ComputedFateShare[] = scenario.fateStates.map((f, idx) => {
    const isLast = idx === scenario.fateStates.length - 1;
    const normalized = isLast
      ? Number((100 - runningSum).toFixed(1))
      : Number(((rawShares[idx] / rawTotal) * 100).toFixed(1));
    if (!isLast) {
      runningSum = Number((runningSum + normalized).toFixed(1));
    }
    const deltaPct = Number((normalized - f.baseShare).toFixed(1));
    return {
      id: f.id,
      name: f.name,
      baselinePct: f.baseShare,
      perturbedPct: normalized,
      deltaPct,
    };
  });

  const meanAbsLog2FC =
    markers.reduce((acc, m) => acc + Math.abs(m.log2FC), 0) / Math.max(1, markers.length);
  const phenotypeShiftIndex = Number(Math.min(99.9, meanAbsLog2FC * 34.5).toFixed(1));
  const nicheCoherenceScore = Number((0.62 + 0.31 * globalHill).toFixed(3));

  return {
    dosePercent: clampedDose,
    effectiveHillFactor: Number(globalHill.toFixed(3)),
    markers,
    fates,
    phenotypeShiftIndex,
    nicheCoherenceScore,
  };
}

const GENE_SYMBOL_REGEX = /^[A-Za-z][A-Za-z0-9\-+/\s]{1,24}$/;

export function validateHypothesisInput(input: CustomHypothesisInput): ValidationResult {
  const errors: ValidationResult['errors'] = {};
  const trimmedGene = input.targetGene.trim();
  const trimmedTissue = input.tissueContext.trim();

  if (!trimmedGene) {
    errors.targetGene = {
      zh: '请输入目标基因或组合靶点名称（例如 TP53、PDCD1+LAG3、SOX9）。',
      en: 'Please enter a target gene or combination locus (e.g., TP53, PDCD1+LAG3, SOX9).',
    };
  } else if (!GENE_SYMBOL_REGEX.test(trimmedGene)) {
    errors.targetGene = {
      zh: '基因符号格式无效：请使用标准基因名（字母开头，2–25 个字符，支持 + 连接组合靶点）。',
      en: 'Invalid gene symbol format: start with a letter (2–25 chars; use + for combinatorial targets).',
    };
  }

  if (!trimmedTissue) {
    errors.tissueContext = {
      zh: '请输入组织微环境或疾病细胞背景（例如 非小细胞肺癌浸润边界）。',
      en: 'Please enter a tissue niche or disease context (e.g., NSCLC invasive margin).',
    };
  } else if (trimmedTissue.length < 2 || trimmedTissue.length > 60) {
    errors.tissueContext = {
      zh: '组织或疾病背景长度需在 2 到 60 个字符之间。',
      en: 'Tissue or disease context must be between 2 and 60 characters.',
    };
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function synthesizeCoScientistTrace(input: CustomHypothesisInput): CoScientistCase {
  const gene = input.targetGene.trim().toUpperCase();
  const tissue = input.tissueContext.trim();
  const seed = Array.from(gene + tissue).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);

  const baseRate = (9 + (seed % 11) + (seed % 10) * 0.1).toFixed(1);
  const improvedRate = (56 + (seed % 26) + ((seed * 3) % 10) * 0.1).toFixed(1);
  const zScore = (4.2 + (seed % 35) * 0.1).toFixed(2);
  const deltaLog2 = (1.35 + (seed % 140) * 0.01).toFixed(2);

  const modeLabels: Record<CustomHypothesisInput['perturbationMode'], BilingualText> = {
    crispr_ko: { zh: 'CRISPR 敲除抑制', en: 'CRISPR Knockout' },
    crispr_a: { zh: 'CRISPRa 转录激活', en: 'CRISPRa Activation' },
    cytokine_blockade: { zh: '配受体阻断干预', en: 'Ligand-Receptor Blockade' },
  };
  const modeText = modeLabels[input.perturbationMode];

  return {
    id: `custom-${seed}`,
    index: 'CUSTOM',
    title: {
      zh: `${tissue}中针对 ${gene} 的${modeText.zh}多尺度闭环推演`,
      en: `Multi-Scale ${modeText.en} Discovery for ${gene} in ${tissue}`,
    },
    domainKicker: {
      zh: '华大云平台沙盒推演 · 自主科研轨迹',
      en: 'BGI CLOUD SANDBOX · AUTONOMOUS RESEARCH TRACE',
    },
    targetGene: gene,
    tissueContext: { zh: tissue, en: tissue },
    initialMetric: `${baseRate}%`,
    initialDesc: {
      zh: `${tissue}基线目标表型响应比例`,
      en: `Baseline target state fraction in ${tissue}`,
    },
    validatedMetric: `${improvedRate}%`,
    validatedDesc: {
      zh: `${gene} (${modeText.zh}) 虚拟闭环优化后预测稳态转化率`,
      en: `Predicted steady-state conversion under ${gene} (${modeText.en})`,
    },
    significance: {
      zh: `Cyto.CoScientist 针对「${tissue}」上下文调用 Cyto.Genome 评估 ${gene} 上游顺式可及性，结合 Cyto.Spatial 定位关键互作邻域，并通过 Cyto.Perturbation 完成剂量响应推演与反事实对照实验设计。`,
      en: `Cyto.CoScientist evaluated upstream cis-accessibility of ${gene} via Cyto.Genome, localized interacting micro-niches in "${tissue}" with Cyto.Spatial, and executed dose-response counterfactuals via Cyto.Perturbation.`,
    },
    steps: [
      {
        stepIndex: '01',
        phase: { zh: '基因组顺式调控解析', en: 'Cis-Regulatory Readout' },
        module: 'Cyto.Genome',
        detail: {
          zh: `解析 ${gene} 基因座周围 ±100 kb 顺式调控元件活性与细胞态特异启动子耦合强度。`,
          en: `Profiled ±100 kb cis-regulatory elements around ${gene} for cell-state promoter coupling.`,
        },
        readout: `Cis-Score = +${deltaLog2}`,
      },
      {
        stepIndex: '02',
        phase: { zh: '组织空间微环境定位', en: 'Spatial Niche Localization' },
        module: 'Cyto.Spatial',
        detail: {
          zh: `在「${tissue}」空间图谱中识别 ${gene} 高表达亚群及其 40 μm 邻域配受体互作网络。`,
          en: `Localized ${gene}-enriched micro-domains and 40 μm paracrine networks across ${tissue}.`,
        },
        readout: `Niche z = +${zScore}`,
      },
      {
        stepIndex: '03',
        phase: { zh: '可推理亚群身份校验', en: 'Reasoning Cell Identity Audit' },
        module: 'Cyto.Identity',
        detail: {
          zh: `验证响应核心亚群的谱系标志物证据链，排除脱靶旁观细胞群干扰。`,
          en: `Audited lineage marker chains for responder subpopulations, filtering off-target bystanders.`,
        },
        readout: 'Ontology Match = 95.4%',
      },
      {
        stepIndex: '04',
        phase: { zh: '虚拟干预与反事实推演', en: 'In-Silico Perturbation Simulation' },
        module: 'Cyto.Perturbation',
        detail: {
          zh: `执行 ${gene} ${modeText.zh}梯度推演，量化下游前 50 个差异表达基因重编程幅度。`,
          en: `Simulated graded ${modeText.en} of ${gene}, quantifying Top-50 DEG reprogramming.`,
        },
        readout: `|Δlog2FC| = ${deltaLog2}`,
      },
      {
        stepIndex: '05',
        phase: { zh: '验证方案生成与闭环判据', en: 'Testable Protocol & Loop Criterion' },
        module: 'Cyto.CoScientist',
        detail: {
          zh: `生成针对「${tissue}」的体外功能验证读出指标与单细胞复测判据。`,
          en: `Synthesized wet-lab validation endpoints and single-cell readout criteria for ${tissue}.`,
        },
        readout: 'Protocol Ready',
      },
    ],
  };
}

export function getSortedBenchmarkEntries(suite: BenchmarkSuite): BenchmarkEntry[] {
  return [...suite.entries].sort((a, b) => b.score - a.score);
}

export const CYTO_BIBTEX = `@article{cyto2026spatiotemporalcell,
  title   = {Cyto: A Multi-Scale Spatiotemporal Cell Model Family for Reading, Simulating, and Autonomous Scientific Discovery},
  author  = {{BGI Research} and {Beijing Zhongguancun Academy}},
  journal = {arXiv preprint / Cyto Technical Overview Report},
  year    = {2026},
  note    = {Jointly released by BGI Research and Beijing Zhongguancun Academy. Organization: https://github.com/Cyto-System}
}`;
