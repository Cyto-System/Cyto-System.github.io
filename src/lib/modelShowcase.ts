// Content for the four-model showcase (Spatial / Identity / Perturbation / CoScientist).
// Every number below is taken from the Cyto-System repositories:
//   Cyto.CoScientist  README.md, assets/research-cycle.png, videos/*_case_demo.mp4
//   Cyto.Perturbation README_zh.md, RELAY slide deck (landscape framework figure)
//   SUDOKU            README_zh.md, docs/assets/sudoku-architecture.png
// Editorial rule: each fact appears in exactly one place on the page.
import type { BilingualText, Lang } from './cytoDomain';

export type ShowcaseModelId = 'spatial' | 'identity' | 'perturbation' | 'coscientist';

export interface ShowcaseModel {
  id: ShowcaseModelId;
  index: string;
  name: string;
  /** One short release fact shown under the tab; must not repeat panel content. */
  release: BilingualText;
}

export const SHOWCASE_MODELS: ShowcaseModel[] = [
  { id: 'spatial', index: '01', name: 'Cyto.Spatial', release: { zh: 'SUDOKU · 空间基座', en: 'SUDOKU · Spatial' } },
  { id: 'identity', index: '02', name: 'Cyto.Identity', release: { zh: 'scVerity · 身份推理', en: 'scVerity · Identity' } },
  { id: 'perturbation', index: '03', name: 'Cyto.Perturbation', release: { zh: 'RELAY · 扰动迁移', en: 'RELAY · Transfer' } },
  { id: 'coscientist', index: '04', name: 'Cyto.CoScientist', release: { zh: '案例展示', en: 'Case showcase' } },
];

export const SHOWCASE_HASH_PREFIX = '#model-';

export function modelIdFromHash(hash: string): ShowcaseModelId | null {
  if (!hash.startsWith(SHOWCASE_HASH_PREFIX)) return null;
  const id = hash.slice(SHOWCASE_HASH_PREFIX.length);
  return SHOWCASE_MODELS.some((m) => m.id === id) ? (id as ShowcaseModelId) : null;
}

/** Maps a Cyto family module id (cytoDomain) to its showcase panel, if it has one. */
export const MODULE_TO_SHOWCASE: Record<string, ShowcaseModelId> = {
  'cyto-spatial': 'spatial',
  'cyto-identity': 'identity',
  'cyto-perturbation': 'perturbation',
  'cyto-coscientist': 'coscientist',
};

/** Switches the showcase to a model panel and scrolls to it, even if the hash is unchanged. */
export function openShowcaseModel(id: ShowcaseModelId): void {
  if (typeof window === 'undefined') return;
  const target = `${SHOWCASE_HASH_PREFIX}${id}`;
  if (window.location.hash === target) {
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  } else {
    window.location.hash = target;
  }
}

/** Percent box on a figure: left / top / width / height, all in % of the image. */
export interface Hotspot {
  x: number;
  y: number;
  w: number;
  h: number;
}

// ---------------------------------------------------------------------------
// Cyto.CoScientist · 01 architecture (figure panel a, cycle-a.png)
// gist = what the component contains; detail = what it is for. They must not overlap.
// ---------------------------------------------------------------------------

export type CoSciRegion = Hotspot & { optional?: boolean };

export interface CoSciComponent {
  id: string;
  name: BilingualText;
  gist: BilingualText;
  detail: BilingualText;
  hotspot: Hotspot;
  relatedRegions?: CoSciRegion[];
  roles?: { name: BilingualText; responsibility: BilingualText }[];
}

export const COSCI_COMPONENTS: CoSciComponent[] = [
  {
    id: 'agent',
    name: { zh: '研究状态与智能体架构', en: 'Research state and agent architecture' },
    gist: { zh: '主智能体选择研究活动并委派任务；子智能体执行任务并回报结果。', en: 'The main agent selects activities and delegates tasks; subagents carry out the tasks and report back.' },
    roles: [
      {
        name: { zh: '主智能体 · 研究决策', en: 'Main agent · Research decisions' },
        responsibility: {
          zh: '根据已有证据、评审意见和尚未解决的问题选择下一项活动，并委派具体任务。各项活动没有固定顺序。',
          en: 'Selects the next activity based on evidence, review feedback, and open questions, then delegates a specific task. Activities have no fixed order.',
        },
      },
      {
        name: { zh: '子智能体 · 任务执行', en: 'Subagents · Task execution' },
        responsibility: {
          zh: '在独立上下文中执行受派任务，向主智能体返回发现、未决问题及原始记录的引用。任务来自五类研究活动：多源证据获取、假设演化与实验设计、算法与程序演化、生物信息学数据分析、科研论文写作。',
          en: 'Work in isolated contexts and return findings, open questions, and references to the underlying records. Tasks span five activities: multi-source evidence acquisition, hypothesis evolution and experimental design, algorithm and program evolution, bioinformatics data analysis, and scientific manuscript writing.',
        },
      },
    ],
    detail: {
      zh: '外环元评审独立回顾跨轮次的决策；必要时，人类专家可补充意见。',
      en: 'Outer-loop meta-review independently assesses decisions across rounds; human experts may provide additional feedback.',
    },
    hotspot: { x: 15.4, y: 20.4, w: 69.2, h: 7.0 },
    relatedRegions: [
      { x: 17.6, y: 36.6, w: 31.2, h: 31.6 },
      { x: 17.7, y: 7.3, w: 31.2, h: 7.6 },
      { x: 51.1, y: 7.3, w: 31.2, h: 7.6, optional: true },
    ],
  },
  {
    id: 'search',
    name: { zh: '显式搜索空间与候选演化', en: 'Explicit search spaces and candidate evolution' },
    gist: { zh: '分支选择决定延续哪个候选，评审反馈指导如何修订。', en: 'Branch selection determines which candidate to extend; review guides its revision.' },
    detail: {
      zh: '修订假设、程序或分析方案会产生新版本，并保留其与原版本的关系。新证据也可以改变对已有版本的评价，而不改写其内容。',
      en: 'Revising a hypothesis, program, or analysis produces a new version linked to its parent. New evidence can also change the assessment of an existing version without changing its content.',
    },
    hotspot: { x: 1.0, y: 72.6, w: 29.4, h: 26.6 },
  },
  {
    id: 'control',
    name: { zh: '基于证据的执行控制与研究监督', en: 'Evidence-based execution control and research supervision' },
    gist: { zh: '行动前核对前提，行动后评审结果，研究结束前逐项核对目标。', en: 'Check prerequisites before acting, review results afterward, and verify objective coverage before concluding.' },
    detail: {
      zh: '缺少必要输入或前置评审时，行动暂不执行。分层评审（R0–R4）判断结果能支持哪些结论；完成判定则检查证据和已评审的研究产出是否覆盖研究目标。',
      en: 'An action waits if required inputs or reviews are missing. Layered review (R0–R4) determines what each result supports; the completion check asks whether the evidence and reviewed deliverables address the research objectives.',
    },
    hotspot: { x: 50.9, y: 36.6, w: 31.2, h: 31.6 },
    relatedRegions: [
      { x: 18.2, y: 29.8, w: 30.3, h: 4.7 },
      { x: 51.5, y: 29.8, w: 30.4, h: 4.7 },
    ],
  },
  {
    id: 'context',
    name: { zh: '长程研究状态与经验复用', en: 'Long-horizon research state and experience reuse' },
    gist: { zh: '在独立上下文中执行局部任务，保留后续决策所需的证据与经验。', en: 'Local tasks run in isolated contexts; their evidence and findings remain available to later decisions.' },
    detail: {
      zh: '研究时间线记录哪些判断已修正、哪些问题尚待解决。分层记忆将研究层面的综合判断（L3）连接到各次尝试的发现与经验（L2），再追溯到数据、代码和评审记录（L1）。',
      en: 'A revisable timeline tracks changes in interpretation and unresolved questions. Hierarchical memory links the study synthesis (L3) to findings from individual attempts (L2) and to primary records such as data, code, and reviews (L1).',
    },
    hotspot: { x: 30.8, y: 72.6, w: 44.6, h: 26.6 },
  },
  {
    id: 'skills',
    name: { zh: '研究技能的发现与整合', en: 'Research skill discovery and integration' },
    gist: { zh: '按需检索和组合分析方法，再根据执行结果与评审意见改进。', en: 'The main agent retrieves and combines analytical procedures, then refines them using results and review feedback.' },
    detail: {
      zh: '主智能体优先检索本地方法库；已有方法不足时，再查找外部资源。修订后的方法经过检验，才在后续研究中复用。',
      en: 'The main agent searches the local skill library first and consults external sources when local procedures are insufficient. It tests revised procedures before reusing them later in the study.',
    },
    hotspot: { x: 75.8, y: 72.6, w: 23.2, h: 26.6 },
  },
];

// ---------------------------------------------------------------------------
// Cyto.CoScientist · 02 one research trajectory (figure panel b, cycle-b.png)
// Captions describe what the figure shows, not the component definitions above.
// ---------------------------------------------------------------------------

export interface TrajectoryStage {
  index: string;
  label: BilingualText;
  caption: BilingualText;
  hotspot: Hotspot;
  revisit?: boolean;
}

export const COSCI_TRAJECTORY: TrajectoryStage[] = [
  {
    index: '01',
    label: { zh: '证据', en: 'Evidence' },
    caption: {
      zh: '研究目标先落到三类证据来源：文献、网页与已有实证结果；红色箭头表示后续结果会回流到证据层。',
      en: 'The goal is first grounded in three evidence sources — literature, web, empirical results; the red arrow shows later results flowing back.',
    },
    hotspot: { x: 0.6, y: 14.0, w: 22.0, h: 84.0 },
  },
  {
    index: '02',
    label: { zh: '假设', en: 'Hypotheses' },
    caption: {
      zh: '假设树同时展开多条分支：深色节点是被选中继续的父节点，⊕ 为新候选，⊗ 为放弃的分支。',
      en: 'The hypothesis tree branches in parallel: the dark node is the selected parent, ⊕ a new candidate, ⊗ a dropped branch.',
    },
    hotspot: { x: 22.6, y: 14.0, w: 19.2, h: 78.0 },
  },
  {
    index: '03',
    label: { zh: '程序 → 分析 → 实验设计', en: 'Programs → analysis → design' },
    caption: {
      zh: '程序、生信分析、实验设计三层各自维护候选树，上一层被选中的节点成为下一层的起点。',
      en: 'Programs, bioinformatics analysis and experimental design each keep their own candidate tree; the node selected in one layer seeds the next.',
    },
    hotspot: { x: 42.4, y: 14.0, w: 33.4, h: 78.0 },
  },
  {
    index: '04',
    label: { zh: '回溯假设', en: 'Revisit' },
    caption: {
      zh: '实验设计层的节点沿红色回边退回假设树，从更早的分支重新选择父节点。',
      en: 'A node in the design layer follows the red edge back into the hypothesis tree and re-selects a parent from an earlier branch.',
    },
    hotspot: { x: 26.8, y: 76.0, w: 38.0, h: 23.0 },
    revisit: true,
  },
  {
    index: '05',
    label: { zh: '稿件草稿', en: 'Manuscript drafts' },
    caption: {
      zh: '稿件同样以候选树迭代，最终沿一条被选中的路径成稿。',
      en: 'Drafts also iterate as a candidate tree and are finalized along one selected path.',
    },
    hotspot: { x: 77.8, y: 14.0, w: 21.6, h: 78.0 },
  },
];

// ---------------------------------------------------------------------------
// Cyto.CoScientist · 03 algorithm design (figure panels c–d). Sole home of these numbers.
// ---------------------------------------------------------------------------

export interface BarEntry {
  label: string;
  value: number;
  ours?: boolean;
}

export interface BarChartSpec {
  id: string;
  tab: BilingualText;
  metric: BilingualText;
  better: 'lower' | 'higher';
  axis: [number, number];
  digits: number;
  entries: BarEntry[];
}

export const COSCI_ALGO_CHARTS: BarChartSpec[] = [
  {
    id: 'denoise',
    tab: { zh: '单细胞 RNA 去噪 · OpenProblems', en: 'scRNA denoising · OpenProblems' },
    metric: { zh: '三组织平均 MSE（越低越好）', en: 'Mean MSE over 3 tissues (lower is better)' },
    better: 'lower',
    axis: [0.16, 0.29],
    digits: 4,
    entries: [
      { label: 'ALRA', value: 0.2813 },
      { label: 'DCA', value: 0.2346 },
      { label: 'MAGIC', value: 0.2013 },
      { label: 'CytoCoScientist', value: 0.1919, ours: true },
    ],
  },
  {
    id: 'luad',
    tab: { zh: '肺腺癌生存风险 · TCGA-LUAD', en: 'LUAD survival · TCGA-LUAD' },
    metric: { zh: 'C-index（越高越好）', en: 'C-index (higher is better)' },
    better: 'higher',
    axis: [0.56, 0.66],
    digits: 4,
    entries: [
      { label: 'DeepProg (matched)', value: 0.595 },
      { label: 'CytoCoScientist', value: 0.6458, ours: true },
    ],
  },
];

export interface DecisionRow {
  design: BilingualText;
  score: string;
  decision: BilingualText;
  kept: boolean;
}

export const COSCI_LUAD_DECISIONS: DecisionRow[] = [
  { design: { zh: '早期拼接（PCA 拼接三种检测）', en: 'Early concatenation (PCA over three assays)' }, score: '0.6382', decision: { zh: '否决', en: 'Rejected' }, kept: false },
  { design: { zh: '分别建模，后期融合', en: 'Separate models, late fusion' }, score: '0.5954', decision: { zh: '采纳', en: 'Admitted' }, kept: true },
  { design: { zh: '训练集百分位对齐 + 等权平均', en: 'Training-percentile alignment + equal weights' }, score: '0.6458', decision: { zh: '保留', en: 'Retained' }, kept: true },
  { design: { zh: '可靠性加权', en: 'Reliability weights' }, score: '0.6411', decision: { zh: '未选', en: 'Not selected' }, kept: false },
];

// ---------------------------------------------------------------------------
// Cyto.CoScientist · 04 case films
// Method cases carry no metric boxes: their numbers live in section 03.
// ---------------------------------------------------------------------------

export interface CaseChapter {
  label: BilingualText;
  start: number;
}

export interface CoSciCaseFilm {
  id: string;
  index: string;
  track: 'method' | 'cohort';
  short: BilingualText;
  dataset: string;
  title: BilingualText;
  headline: BilingualText;
  video: string;
  cover: string;
  duration: number;
  chapters: CaseChapter[];
  data: BilingualText;
  metrics: { value: string; label: BilingualText }[];
  significance: BilingualText;
  boundary: BilingualText;
}

const chapterLabels: BilingualText[] = [
  { zh: '研究问题', en: 'Question' },
  { zh: '数据与设计', en: 'Data' },
  { zh: '关键证据', en: 'Evidence' },
  { zh: '研究结论', en: 'Takeaway' },
];

function chapters(starts: [number, number, number, number]): CaseChapter[] {
  return starts.map((start, i) => ({ label: chapterLabels[i], start }));
}

const ASSET = '/assets/coscientist';

export const COSCI_CASE_FILMS: CoSciCaseFilm[] = [
  {
    id: 'openproblems',
    index: '01',
    track: 'method',
    short: { zh: '单细胞去噪', en: 'scRNA denoising' },
    dataset: 'OpenProblems',
    title: { zh: '单细胞 RNA 去噪', en: 'Single-cell RNA denoising' },
    headline: { zh: '一个细胞，能从邻居得到多少信号？', en: 'How much signal can a cell draw from its neighbors?' },
    video: `${ASSET}/videos/OpenProblems_case_demo.mp4`,
    cover: `${ASSET}/covers/OpenProblems-cover.jpg`,
    duration: 57,
    chapters: chapters([0, 8.2, 20, 43.5]),
    data: {
      zh: '肺 24,540 · 胰腺 1,937 · PBMC 1,087 个细胞；每个细胞留出部分分子作为答案，三个组织等权评分。',
      en: 'Lung 24,540 · pancreas 1,937 · PBMC 1,087 cells; held-out molecules per cell, three tissues weighted equally.',
    },
    metrics: [],
    significance: {
      zh: '最终规则中邻居计数的权重是 400 /（细胞文库量 + 400）：细胞自己测到的分子越多，越少借邻居；之后再把细胞自身计数加回，避免真实读数被抹掉。',
      en: 'The final rule weights neighbor counts by 400 / (library size + 400): the more a cell measured, the less it borrows; its own counts are then added back so real readings are not erased.',
    },
    boundary: { zh: '几处改动同时发生，尚不能拆分每一步的贡献。', en: 'Several changes landed together; per-step gains are not separated.' },
  },
  {
    id: 'tcga-luad',
    index: '02',
    track: 'method',
    short: { zh: '肺腺癌生存', en: 'LUAD survival' },
    dataset: 'TCGA-LUAD',
    title: { zh: '肺腺癌生存风险', en: 'Lung adenocarcinoma survival' },
    headline: { zh: '为什么要否决一个高分模型？', en: 'Why reject a high-scoring model?' },
    video: `${ASSET}/videos/TCGA-LUAD_case_demo.mp4`,
    cover: `${ASSET}/covers/TCGA-LUAD-cover.jpg`,
    duration: 64,
    chapters: chapters([0, 10.3, 22.5, 49.5]),
    data: {
      zh: 'TCGA 420 位肺腺癌患者，RNA / miRNA / DNA 甲基化三项检测；336 人训练，固定 84 人评估。',
      en: 'TCGA, 420 LUAD patients with RNA / miRNA / DNA methylation; 336 to train, a fixed 84 to evaluate.',
    },
    metrics: [],
    significance: {
      zh: '三项检测的风险分数属于不同尺度。程序不直接比较原始分数，而是先把每项分数换算成它在训练人群中的排位，再合并。',
      en: 'The three risk scores lie on different scales. Instead of comparing raw scores, the program converts each into its rank within the training cohort before combining.',
    },
    boundary: { zh: '评估用的 84 人也参与了程序挑选，需要换一批新患者复核。', en: 'The 84 evaluation patients also guided the search; new patients are needed.' },
  },
  {
    id: 'sepsis',
    index: '03',
    track: 'cohort',
    short: { zh: '脓毒症', en: 'Sepsis' },
    dataset: 'Sepsis',
    title: { zh: '脓毒症死亡风险', en: 'Sepsis mortality' },
    headline: { zh: '单次采血与同一患者的变化，回答的是不同问题。', en: 'A single draw and a within-patient change answer different questions.' },
    video: `${ASSET}/videos/Sepsis_case_demo.mp4`,
    cover: `${ASSET}/covers/Sepsis-cover.jpg`,
    duration: 67,
    chapters: chapters([0, 9, 22, 55.5]),
    data: {
      zh: 'CMAISE 蛋白分支 342 人（非纵向）；另检索 PXD055932、MI GAiNS 血浆蛋白与 ALBIOS 20 人第 1 / 7 天配对样本。',
      en: 'CMAISE protein branch, 342 patients (not longitudinal); retrieved PXD055932, MI GAiNS plasma proteins and ALBIOS paired day-1 / day-7 samples (20 patients).',
    },
    metrics: [
      { value: '30', label: { zh: '第一轮假设数', en: 'Round-1 hypotheses' } },
      { value: '24', label: { zh: '元评审后第二轮假设数', en: 'Round-2 hypotheses after meta-review' } },
    ],
    significance: {
      zh: '两批数据都有反例：APOA1 不低时，两种蛋白也可能都高，于是改用配对样本。苯丙氨酸在存活与死亡两组平均都下降。',
      en: 'Both cohorts had counterexamples — even without low APOA1 both proteins could be high — so the study moved to paired samples. Phenylalanine fell on average in survivors and non-survivors alike.',
    },
    boundary: {
      zh: '另查 9 个来源均无配对测量与结局；这是下一次研究的线索，不能用于判断谁会死亡。',
      en: 'Nine other sources lacked paired data with outcomes; a lead for the next study, not a mortality test.',
    },
  },
  {
    id: 'escc',
    index: '04',
    track: 'cohort',
    short: { zh: '食管癌淋巴结', en: 'ESCC nodes' },
    dataset: 'ESCC',
    title: { zh: '食管癌配对淋巴结', en: 'Paired lymph nodes in esophageal cancer' },
    headline: { zh: '配对淋巴结，揭示跨细胞平均会掩盖的变化。', en: 'Paired nodes reveal what an average across cells can hide.' },
    video: `${ASSET}/videos/ESCC_case_demo.mp4`,
    cover: `${ASSET}/covers/ESCC-cover.jpg`,
    duration: 66,
    chapters: chapters([0, 11.3, 22.5, 57.5]),
    data: {
      zh: '40 位患者 · 110 份单细胞组织文库；13 人同时有转移与非转移淋巴结，其中 12 人同平台测量。',
      en: '40 patients · 110 single-cell libraries; 13 had both node types, 12 measured on the same platform.',
    },
    metrics: [
      { value: '11/12', label: { zh: '转移淋巴结中记忆 B 占比更低', en: 'Lower memory-B share in metastatic nodes' } },
      { value: '10/10', label: { zh: '记忆 B 细胞内 TOP2A 更高', en: 'Higher TOP2A within memory B' } },
    ],
    significance: {
      zh: '在患者 13 身上，把整个 B 细胞家族合在一起看，转移淋巴结的 TOP2A 更低；只看记忆 B 细胞时，方向反了过来。',
      en: 'In patient 13, TOP2A was lower in the metastatic node across the whole B-cell family, but higher once memory B cells were viewed alone.',
    },
    boundary: { zh: '下一步需要对 CXCL13+ B 细胞生态位做空间验证。', en: 'CXCL13+ B-cell niches need spatial follow-up.' },
  },
  {
    id: 'anzhen',
    index: '05',
    track: 'cohort',
    short: { zh: '主动脉夹层', en: 'Aortic dissection' },
    dataset: 'Anzhen',
    title: { zh: '急性主动脉夹层', en: 'Acute aortic dissection' },
    headline: { zh: '跨材料的关联，不等于细胞内的机制。', en: 'A cross-material association is not a mechanism within cells.' },
    video: `${ASSET}/videos/Anzhen_case_demo.mp4`,
    cover: `${ASSET}/covers/Anzhen-cover.jpg`,
    duration: 73,
    chapters: chapters([0, 10, 23, 62]),
    data: {
      zh: '13 例急性夹层与 5 位健康对照，每人一次采血；基因组、DNA 甲基化、染色质、RNA、蛋白五种检测。',
      en: '13 acute dissection cases and 5 healthy controls, one draw each; genome, DNA methylation, chromatin, RNA and protein.',
    },
    metrics: [
      { value: 'ρ −0.841', label: { zh: 'SMAD3 cfDNA 甲基化与 PBMC ATAC', en: 'SMAD3 cfDNA β vs PBMC ATAC' } },
      { value: 'q 0.0091', label: { zh: '13 位患者', en: '13 patients' } },
    ],
    significance: {
      zh: '三位患者血浆 MMP8 都偏高，但上游偏低的检测各不相同：DNA 甲基化、染色质可及性、GFI1 表达。智能体撤回了染色质接触的主张，只保留两种血液检测指向同一 SMAD3 区域。',
      en: 'Three patients shared high plasma MMP8 but differed upstream — DNA methylation, chromatin accessibility, GFI1 expression. The agent withdrew a chromatin-contact claim and kept only the shared SMAD3 region.',
    },
    boundary: { zh: 'SMAD3 线索需在新患者中复查，目前不能用于诊断。', en: 'The SMAD3 lead needs new patients; it is not diagnostic.' },
  },
];

export function chapterIndexAt(film: CoSciCaseFilm, time: number): number {
  let idx = 0;
  film.chapters.forEach((c, i) => {
    if (time >= c.start) idx = i;
  });
  return idx;
}

export function formatClock(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

// ---------------------------------------------------------------------------
// Cyto.Spatial (SUDOKU) and Cyto.Perturbation (RELAY)
// ---------------------------------------------------------------------------

export const SPATIAL_PARTS: { title: BilingualText; body: BilingualText; hotspot: Hotspot }[] = [
  {
    title: { zh: '表达编码与量化', en: 'Expression encoding & quantization' },
    body: {
      zh: '把人和小鼠的基因计数映射到共同的直系同源基因空间，每个细胞表示为连续向量与粗粒度 + 残差两级离散编码。重构解码器只用于训练编码器，不参与推理。',
      en: 'Maps human and mouse counts into a shared ortholog space; each cell becomes a continuous vector plus coarse and residual codes. The reconstruction decoder is used only to train the encoder.',
    },
    hotspot: { x: 19.8, y: 2.8, w: 32.4, h: 24.4 },
  },
  {
    title: { zh: '空间主干', en: 'Spatial backbone' },
    body: {
      zh: '去噪 Transformer 通过 2D-RoPE 引入坐标；被遮蔽的细胞用可学习掩码向量替代表达，但保留坐标。两个预测头分别预测粗粒度编码和残差编码。',
      en: 'A denoising Transformer injects coordinates via 2D-RoPE; masked cells keep their coordinates with a learned mask vector. Two heads predict the coarse and residual codes.',
    },
    hotspot: { x: 0.6, y: 27.6, w: 55.4, h: 71.6 },
  },
  {
    title: { zh: '表征模式', en: 'Representation mode' },
    body: {
      zh: '全部可见时输出带邻域上下文的细胞表征；对邻域内的表征池化得到邻域表征，用于聚类与跨切片检索。',
      en: 'With all cells visible it outputs context-aware cell embeddings; pooling over a neighborhood gives niche embeddings for clustering and cross-slice retrieval.',
    },
    hotspot: { x: 66.8, y: 1.0, w: 32.8, h: 47.6 },
  },
  {
    title: { zh: '生成模式', en: 'Generation mode' },
    body: {
      zh: '逐步补全已知坐标处被遮蔽的细胞状态，优先确定置信度高的编码对，并把已补全的状态作为后续步骤的上下文；不生成新坐标。',
      en: 'Iteratively fills masked cell states at known coordinates, committing confident code pairs first and reusing them as context; no new coordinates are generated.',
    },
    hotspot: { x: 66.8, y: 51.4, w: 32.8, h: 47.8 },
  },
];

export interface MatrixBenchmark {
  id: string;
  tab: BilingualText;
  title: BilingualText;
  metric: string;
  better: 'higher' | 'lower';
  columns: BilingualText[];
  methods: { name: string; values: number[] }[];
  note: BilingualText;
}

const SUDOKU = 'SUDOKU';

export const SPATIAL_REPRESENTATION: MatrixBenchmark[] = [
  {
    id: 'hesta',
    tab: { zh: 'HESTA 邻域检索', en: 'HESTA retrieval' },
    title: { zh: '跨切片邻域检索 · 按器官', en: 'Cross-slice niche retrieval · by organ' },
    metric: 'AUPRC',
    better: 'higher',
    columns: [
      { zh: '脑', en: 'Brain' },
      { zh: '肝', en: 'Liver' },
      { zh: '脊髓', en: 'Spinal cord' },
      { zh: '软骨', en: 'Cartilage' },
      { zh: '神经节', en: 'Ganglion' },
      { zh: '肌肉', en: 'Muscle' },
      { zh: '心脏', en: 'Heart' },
      { zh: '颌部', en: 'Jaw' },
    ],
    methods: [
      { name: 'QueST', values: [0.49, 0.797, 0.43, 0.352, 0.147, 0.277, 0.71, 0.126] },
      { name: 'CellPLM', values: [0.323, 0.731, 0.303, 0.278, 0.129, 0.276, 0.471, 0.148] },
      { name: 'Novae', values: [0.423, 0.333, 0.396, 0.238, 0.073, 0.147, 0.101, 0.162] },
      { name: 'Nicheformer', values: [0.334, 0.589, 0.35, 0.268, 0.121, 0.166, 0.208, 0.136] },
      { name: 'scGPT-spatial', values: [0.328, 0.624, 0.302, 0.25, 0.111, 0.27, 0.391, 0.149] },
      { name: 'SToFM', values: [0.228, 0.467, 0.234, 0.214, 0.075, 0.121, 0.063, 0.098] },
      { name: 'CellWorld', values: [0.224, 0.574, 0.207, 0.159, 0.082, 0.135, 0.081, 0.086] },
      { name: 'TERRA', values: [0.387, 0.532, 0.381, 0.235, 0.154, 0.186, 0.19, 0.155] },
      { name: 'GeST', values: [0.446, 0.847, 0.395, 0.315, 0.251, 0.41, 0.657, 0.253] },
      { name: SUDOKU, values: [0.517, 0.932, 0.503, 0.359, 0.264, 0.427, 0.758, 0.207] },
    ],
    note: {
      zh: 'SUDOKU 为任务微调设置；颌部一列 GeST 最佳。',
      en: 'SUDOKU fine-tuned; GeST is best on the jaw column.',
    },
  },
  {
    id: 'dlpfc',
    tab: { zh: 'DLPFC 皮层交界', en: 'DLPFC boundaries' },
    title: { zh: '皮层交界邻域检索 · 按交界类型', en: 'Cortical boundary retrieval · by boundary' },
    metric: 'Pearson r',
    better: 'higher',
    columns: [
      { zh: 'L3–L4', en: 'L3–L4' },
      { zh: 'L4–L5', en: 'L4–L5' },
      { zh: 'L5–L6', en: 'L5–L6' },
      { zh: 'L6–WM', en: 'L6–WM' },
      { zh: 'L3–L4–L5', en: 'L3–L4–L5' },
      { zh: 'L4–L5–L6', en: 'L4–L5–L6' },
      { zh: 'L5–L6–WM', en: 'L5–L6–WM' },
    ],
    methods: [
      { name: 'QueST', values: [0.566, 0.673, 0.762, 0.746, 0.628, 0.72, 0.696] },
      { name: 'CellPLM', values: [0.344, 0.285, 0.238, 0.015, 0.424, 0.269, 0.126] },
      { name: 'Novae', values: [0.508, 0.603, 0.511, 0.62, 0.58, 0.557, 0.479] },
      { name: 'Nicheformer', values: [0.265, 0.24, 0.12, 0.009, 0.352, 0.213, -0.005] },
      { name: 'scGPT-spatial', values: [0.312, 0.212, 0.123, -0.005, 0.368, 0.191, 0.013] },
      { name: 'SToFM', values: [0.073, 0.128, 0.135, 0.123, 0.12, 0.124, 0.112] },
      { name: 'CellWorld', values: [0.261, 0.325, 0.222, -0.094, 0.382, 0.305, 0.059] },
      { name: 'TERRA', values: [0.326, 0.282, 0.214, -0.03, 0.409, 0.261, 0.096] },
      { name: 'GeST', values: [0.465, 0.629, 0.68, 0.626, 0.539, 0.646, 0.606] },
      { name: SUDOKU, values: [0.566, 0.698, 0.765, 0.751, 0.604, 0.723, 0.705] },
    ],
    note: {
      zh: 'SUDOKU 为任务微调设置；WM 表示白质，L3–L4–L5 一列 QueST 最佳。',
      en: 'SUDOKU fine-tuned; WM = white matter; QueST is best on L3–L4–L5.',
    },
  },
  {
    id: 'mouse-brain',
    tab: { zh: '小鼠脑多尺度聚类', en: 'Mouse brain clustering' },
    title: { zh: 'MERFISH 小鼠脑多尺度聚类 · 6 张切片中位数', en: 'MERFISH mouse brain clustering · median of 6 slices' },
    metric: 'ARI / NMI',
    better: 'higher',
    columns: [
      { zh: '脑区 ARI', en: 'Region ARI' },
      { zh: '脑区 NMI', en: 'Region NMI' },
      { zh: '层状带 ARI', en: 'Band ARI' },
      { zh: '层状带 NMI', en: 'Band NMI' },
      { zh: '细胞类型 ARI', en: 'Cell type ARI' },
      { zh: '细胞类型 NMI', en: 'Cell type NMI' },
    ],
    methods: [
      { name: 'STAGATE', values: [0.312, 0.469, 0.42, 0.634, 0.154, 0.383] },
      { name: 'BANKSY', values: [0.111, 0.19, 0.091, 0.186, 0.44, 0.63] },
      { name: 'CellPLM', values: [0.113, 0.17, 0.115, 0.14, 0.438, 0.671] },
      { name: 'Novae', values: [0.264, 0.44, 0.334, 0.535, 0.121, 0.345] },
      { name: 'Nicheformer', values: [0.246, 0.294, 0.144, 0.18, 0.345, 0.567] },
      { name: 'scGPT-spatial', values: [0.177, 0.235, 0.223, 0.253, 0.364, 0.605] },
      { name: 'SToFM', values: [0.176, 0.237, 0.229, 0.357, 0.283, 0.494] },
      { name: 'CellWorld', values: [0.232, 0.309, 0.026, 0.043, 0.267, 0.435] },
      { name: 'TERRA', values: [0.207, 0.304, 0.212, 0.355, 0.154, 0.39] },
      { name: SUDOKU, values: [0.342, 0.491, 0.493, 0.629, 0.52, 0.776] },
    ],
    note: {
      zh: 'SUDOKU 为微调设置；层状带 NMI 一列 STAGATE 最佳。',
      en: 'SUDOKU fine-tuned; STAGATE is best on band NMI.',
    },
  },
];

export const SPATIAL_GENERATION: MatrixBenchmark[] = [
  {
    id: 'tissue',
    tab: { zh: '按组织组别', en: 'By tissue group' },
    title: { zh: '掩码细胞状态补全 · 按组织组别', en: 'Masked cell-state completion · by tissue group' },
    metric: 'Acc',
    better: 'higher',
    columns: [
      { zh: '人脑（AD）', en: 'Human brain (AD)' },
      { zh: '人脑（对照）', en: 'Human brain (ctrl)' },
      { zh: '小鼠脑（M1）', en: 'Mouse brain (M1)' },
      { zh: '小鼠脑（M2）', en: 'Mouse brain (M2)' },
      { zh: '小鼠肾（损伤）', en: 'Mouse kidney (injury)' },
      { zh: '小鼠肾（对照）', en: 'Mouse kidney (ctrl)' },
    ],
    methods: [
      { name: '1-NN', values: [0.439, 0.372, 0.249, 0.297, 0.269, 0.382] },
      { name: '5-NN', values: [0.514, 0.457, 0.266, 0.314, 0.296, 0.377] },
      { name: 'GeST', values: [0.485, 0.444, 0.228, 0.294, 0.317, 0.396] },
      { name: SUDOKU, values: [0.563, 0.469, 0.29, 0.344, 0.32, 0.406] },
    ],
    note: {
      zh: '31 张切片、972 道问题，单个窗口 500 个细胞；指标是掩码细胞的类型 ACC，不是表达重建精度。',
      en: '31 slices, 972 items, 500-cell windows; the metric is cell-type accuracy of masked cells, not expression reconstruction.',
    },
  },
  {
    id: 'geometry',
    tab: { zh: '按遮蔽几何与难度', en: 'By mask geometry' },
    title: { zh: '掩码细胞状态补全 · 按遮蔽几何与难度', en: 'Masked cell-state completion · by mask geometry' },
    metric: 'Acc',
    better: 'higher',
    columns: [
      { zh: '散点 · 简单', en: 'Scatter · easy' },
      { zh: '散点 · 中等', en: 'Scatter · medium' },
      { zh: '散点 · 困难', en: 'Scatter · hard' },
      { zh: '内部块 · 简单', en: 'Inner block · easy' },
      { zh: '内部块 · 中等', en: 'Inner block · medium' },
      { zh: '内部块 · 困难', en: 'Inner block · hard' },
      { zh: '外壳 · 简单', en: 'Shell · easy' },
      { zh: '外壳 · 中等', en: 'Shell · medium' },
      { zh: '外壳 · 困难', en: 'Shell · hard' },
      { zh: '多块 · 简单', en: 'Multi-block · easy' },
      { zh: '多块 · 中等', en: 'Multi-block · medium' },
      { zh: '多块 · 困难', en: 'Multi-block · hard' },
    ],
    methods: [
      { name: '1-NN', values: [0.45, 0.339, 0.215, 0.433, 0.307, 0.198, 0.434, 0.323, 0.202, 0.448, 0.315, 0.199] },
      { name: '5-NN', values: [0.474, 0.346, 0.251, 0.502, 0.368, 0.232, 0.488, 0.324, 0.253, 0.504, 0.33, 0.246] },
      { name: 'GeST', values: [0.503, 0.321, 0.249, 0.476, 0.326, 0.261, 0.486, 0.282, 0.249, 0.483, 0.296, 0.252] },
      { name: SUDOKU, values: [0.508, 0.378, 0.267, 0.534, 0.39, 0.263, 0.498, 0.376, 0.282, 0.521, 0.373, 0.278] },
    ],
    note: {
      zh: '微调后的 SUDOKU 与稿件主表中的 GeST 和空间近邻基线对比。',
      en: 'Fine-tuned SUDOKU versus GeST and spatial nearest-neighbor baselines from the manuscript.',
    },
  },
];

export const SPATIAL_SPAC: { method: string; spearman: string; rankErr: string; ours?: boolean }[] = [
  { method: '表达插值 / Expression interpolation', spearman: '0.11', rankErr: '0.28' },
  { method: 'GeST', spearman: '0.49', rankErr: '0.20' },
  { method: 'SUDOKU', spearman: '0.77', rankErr: '0.12', ours: true },
];

export const SPATIAL_OVERVIEW: {
  task: BilingualText;
  zeroShot: string;
  baseline: string;
  fineTuned: string;
  zeroShotWins: boolean;
}[] = [
  { task: { zh: 'HESTA 邻域检索 · 8 器官平均 AUPRC', en: 'HESTA retrieval · mean AUPRC (8 organs)' }, zeroShot: '0.486', baseline: '0.303 · scGPT-spatial', fineTuned: '0.496', zeroShotWins: true },
  { task: { zh: 'DLPFC 邻域检索 · 7 类交界平均 Pearson r', en: 'DLPFC retrieval · mean Pearson r (7 boundaries)' }, zeroShot: '0.490', baseline: '0.223 · TERRA', fineTuned: '0.687', zeroShotWins: true },
  { task: { zh: '小鼠脑多尺度聚类 · 3 层级平均 ARI', en: 'Mouse brain clustering · mean ARI (3 levels)' }, zeroShot: '0.408', baseline: '0.255 · scGPT-spatial', fineTuned: '0.452', zeroShotWins: true },
  { task: { zh: '掩码生成 · 972 题细胞类型 ACC', en: 'Masked generation · cell-type accuracy (972)' }, zeroShot: '0.355', baseline: '0.385 · 300-NN', fineTuned: '0.401', zeroShotWins: false },
];

export const SPATIAL_USAGE: { title: BilingualText; body: BilingualText; command: string }[] = [
  {
    title: { zh: '多尺度聚类', en: 'Multi-scale clustering' },
    body: {
      zh: 'region（100 µm 邻域池化）、band（50 µm）、cell-type（50 µm 中心细胞）三个层级；默认 15 近邻图 + Leiden，输出簇编号。',
      en: 'Three levels: region (100 µm pooled), band (50 µm), cell-type (50 µm center cell); 15-NN graph + Leiden by default, outputs cluster ids.',
    },
    command: 'sudoku-st cluster --hf-repo pangjunjie/SUDOKU \\\n  --input mouse_brain.h5ad --species mouse \\\n  --level region --n-clusters 12 --out region.csv',
  },
  {
    title: { zh: '掩码细胞状态补全', en: 'Masked cell-state completion' },
    body: {
      zh: '在 .obs["is_target"] 标记待预测细胞；默认 32 步零温度解码，窗口最多 1,000 个细胞，输出两级编码与联合置信度，不生成新坐标。',
      en: 'Mark targets in .obs["is_target"]; 32-step zero-temperature decoding, up to 1,000 cells per window; outputs two-level codes and confidence, no new coordinates.',
    },
    command: 'sudoku-st generate --hf-repo pangjunjie/SUDOKU \\\n  --input masked_window.h5ad --species human \\\n  --pitch-um 12.5 --out generated_codes.csv',
  },
  {
    title: { zh: '表征与跨切片检索', en: 'Embedding & cross-slice retrieval' },
    body: {
      zh: 'embed 导出细胞表征、邻域表征、离散编码；retrieve 用查询邻域的平均表征按余弦相似度排序候选。150 µm 对应 HESTA 风格半径。',
      en: 'embed exports cell / niche embeddings and codes; retrieve ranks candidates by cosine similarity to the mean query niche. 150 µm matches HESTA-style radius.',
    },
    command: 'sudoku-st embed --hf-repo pangjunjie/SUDOKU \\\n  --input query_section.h5ad --species human \\\n  --radius-um 150 --out query.npz',
  },
];

/** Lowest/highest bound for a bar axis that also covers negative values. */
export function matrixAxis(values: number[]): [number, number] {
  const lo = Math.min(0, ...values);
  const hi = Math.max(...values);
  return [Math.floor(lo * 20) / 20, Math.ceil(hi * 20) / 20 || 0.05];
}

export const PERTURBATION_STAGES: { code: string; title: BilingualText; body: BilingualText; hotspot: Hotspot }[] = [
  {
    code: 'A',
    title: { zh: '生物知识特征与相似度核', en: 'Biological knowledge & similarity kernel' },
    body: {
      zh: '整合 GO、Reactome、CORUM、STRING 和 BioPlex 五个生物知识库，按来源均衡加权构建扰动的生物知识特征，并计算扰动之间的相似度核；对于小分子药物，通过聚合对应靶蛋白的特征进行编码。',
      en: 'Integrates GO, Reactome, CORUM, STRING, and BioPlex with balanced per-source weighting to build biological knowledge features and compute perturbation similarity kernels; small-molecule drugs are encoded by aggregating their target-protein features.',
    },
    hotspot: { x: 0.4, y: 0.4, w: 47.4, h: 99.2 },
  },
  {
    code: 'B',
    title: { zh: '响应迁移', en: 'Response transfer' },
    body: {
      zh: '以训练集中各基因的平均响应为基线，对基因表达变化及其幅度分别进行中心化，拆分为带符号的方向变化与无符号的变化幅度两部分；经正则化核岭回归分别迁移到未见扰动后，再结合预测误差的尺度缩放与联合降维，得到低维响应表征。',
      en: 'Centers each gene’s expression change and magnitude around its training baseline to separate signed response changes from unsigned magnitudes; transfers both to unseen perturbations via regularized kernel ridge regression, followed by error-based scaling and joint dimensionality reduction to obtain compact response representations.',
    },
    hotspot: { x: 48.0, y: 0.4, w: 51.6, h: 49.6 },
  },
  {
    code: 'C',
    title: { zh: '差异表达与方向预测', en: 'Task-specific prediction heads' },
    body: {
      zh: '针对差异表达判定，采用融合全局响应特征的轻量级多层感知机进行预测，在具备统计效应信息时一并纳入标准化效应特征；针对调控方向判定，则将各基因的平均响应基线与迁移预测的变化量直接相加，输出上调或下调的预测得分。',
      en: 'For differential expression, a lightweight multilayer perceptron conditioned on global response features predicts responsive genes, incorporating standardized effect features when statistical summaries are available; for regulation direction, each gene’s baseline mean is combined directly with the transferred contrast to score up- or down-regulation.',
    },
    hotspot: { x: 48.0, y: 50.6, w: 51.6, h: 49.0 },
  },
];

// Landscape framework figure from the Cyto.Perturbation (RELAY) slide deck
// (Manuscript/deliverables/Cyto_Perturbation_RELAY_汇报.pptx, slide 3), downscaled from 5524×3138.
export const PERTURBATION_FIGURE = {
  src: '/assets/perturbation/relay_framework_wide.png',
  width: 3000,
  height: 1704,
};

// ---------------------------------------------------------------------------
// Cyto.Perturbation (RELAY) · Benchmark tables (from Manuscript/sections/experiments.tex & RELAY deck slide 4)
// ---------------------------------------------------------------------------

export type PerturbParadigm = 'prior' | 'reasoning' | 'retrieval' | 'continuous' | 'ours';

export interface PerturbMainRow {
  method: string;
  paradigm: PerturbParadigm;
  deF1: number;
  deWgBAcc: number;
  dePgAuroc: number;
  dirF1: number;
  dirWgBAcc: number;
  dirPgAuroc: number;
}

export const PERTURBATION_PARADIGM_LABEL: Record<PerturbParadigm, BilingualText> = {
  prior: { zh: '基因先验', en: 'Gene prior' },
  reasoning: { zh: '机制推理 LLM', en: 'LLM reasoning' },
  retrieval: { zh: '标签检索 LLM', en: 'Label retrieval' },
  continuous: { zh: '连续表达预测', en: 'Continuous prediction' },
  ours: { zh: 'RELAY (Cyto)', en: 'RELAY (ours)' },
};

/** Table 1: PerturbQA (116,041 DE & 16,208 DIR test queries, equal cell-line means). */
export const PERTURBATION_MAIN: PerturbMainRow[] = [
  { method: 'Gene prior', paradigm: 'prior', deF1: 0.8814, deWgBAcc: 0.5000, dePgAuroc: 0.5000, dirF1: 0.7973, dirWgBAcc: 0.5000, dirPgAuroc: 0.5000 },
  { method: 'AROMA', paradigm: 'reasoning', deF1: 0.8618, deWgBAcc: 0.5169, dePgAuroc: 0.5152, dirF1: 0.7265, dirWgBAcc: 0.6029, dirPgAuroc: 0.5526 },
  { method: 'SUMMER', paradigm: 'retrieval', deF1: 0.7560, deWgBAcc: 0.5827, dePgAuroc: 0.5891, dirF1: 0.8215, dirWgBAcc: 0.7019, dirPgAuroc: 0.6637 },
  { method: 'GEARS', paradigm: 'continuous', deF1: 0.7202, deWgBAcc: 0.5119, dePgAuroc: 0.5143, dirF1: 0.7085, dirWgBAcc: 0.5109, dirPgAuroc: 0.5462 },
  { method: 'STATE', paradigm: 'continuous', deF1: 0.6795, deWgBAcc: 0.5559, dePgAuroc: 0.5452, dirF1: 0.7414, dirWgBAcc: 0.6171, dirPgAuroc: 0.6584 },
  { method: 'PerturbDiff', paradigm: 'continuous', deF1: 0.7370, deWgBAcc: 0.5433, dePgAuroc: 0.5336, dirF1: 0.7792, dirWgBAcc: 0.6445, dirPgAuroc: 0.6788 },
  { method: 'PertOmni', paradigm: 'continuous', deF1: 0.8021, deWgBAcc: 0.6109, dePgAuroc: 0.6479, dirF1: 0.8441, dirWgBAcc: 0.7231, dirPgAuroc: 0.8020 },
  { method: 'RELAY', paradigm: 'ours', deF1: 0.8941, deWgBAcc: 0.6574, dePgAuroc: 0.7732, dirF1: 0.8722, dirWgBAcc: 0.7672, dirPgAuroc: 0.8611 },
];

export interface PerturbBuildupStep {
  step: string;
  label: BilingualText;
  deF1: number;
  deWgBAcc: number;
  dirF1: number;
  dirWgBAcc: number;
  ours?: boolean;
}

/** Table 2: Component buildup from Gene prior to full RELAY. */
export const PERTURBATION_BUILDUP: PerturbBuildupStep[] = [
  { step: '01', label: { zh: '基因先验', en: 'Gene prior' }, deF1: 0.8814, deWgBAcc: 0.5000, dirF1: 0.7973, dirWgBAcc: 0.5000 },
  { step: '02', label: { zh: '标签迁移', en: 'Label transfer' }, deF1: 0.8987, deWgBAcc: 0.5598, dirF1: 0.8510, dirWgBAcc: 0.6788 },
  { step: '03', label: { zh: '响应迁移基线', en: 'Response base' }, deF1: 0.8133, deWgBAcc: 0.6341, dirF1: 0.8649, dirWgBAcc: 0.7709 },
  { step: '04', label: { zh: '+ DE 预测头', en: '+ DE head' }, deF1: 0.8990, deWgBAcc: 0.6068, dirF1: 0.8648, dirWgBAcc: 0.7703 },
  { step: '05', label: { zh: '+ 基因均值中心化', en: '+ Gene centering' }, deF1: 0.9016, deWgBAcc: 0.6152, dirF1: 0.8722, dirWgBAcc: 0.7672 },
  { step: '06', label: { zh: '+ 变化幅度特征', en: '+ Magnitude features' }, deF1: 0.9045, deWgBAcc: 0.6228, dirF1: 0.8722, dirWgBAcc: 0.7672 },
  { step: '07', label: { zh: '+ 标准化效应 (RELAY)', en: '+ Std effect (RELAY)' }, deF1: 0.8941, deWgBAcc: 0.6574, dirF1: 0.8722, dirWgBAcc: 0.7672, ours: true },
];

export interface PerturbOodRow {
  method: string;
  ours?: boolean;
  nd: number;
  up: number;
  down: number;
  macroF1: number;
  deWgBAcc: number | null;
  dirWgBAcc: number | null;
}

/** Table 3: Out-of-distribution transfer to held-out RPE1 (from K562, HepG2, Jurkat). */
export const PERTURBATION_OOD: PerturbOodRow[] = [
  { method: 'Source gene prior', nd: 0.9590, up: 0.4845, down: 0.6094, macroF1: 0.6843, deWgBAcc: 0.5000, dirWgBAcc: 0.5000 },
  { method: 'AROMA', nd: 0.9600, up: 0.5700, down: 0.6600, macroF1: 0.7300, deWgBAcc: null, dirWgBAcc: null },
  { method: 'RELAY', ours: true, nd: 0.9566, up: 0.6243, down: 0.6980, macroF1: 0.7597, deWgBAcc: 0.5933, dirWgBAcc: 0.7333 },
];

/** Table 4: Unseen compounds on GeneTAK (Tahoe-100M, 284 train / 95 held-out drugs). */
export const PERTURBATION_DRUG: PerturbMainRow[] = [
  { method: 'Gene prior', paradigm: 'prior', deF1: 0.9196, deWgBAcc: 0.5000, dePgAuroc: 0.5000, dirF1: 0.7894, dirWgBAcc: 0.5000, dirPgAuroc: 0.5000 },
  { method: 'STATE', paradigm: 'continuous', deF1: 0.8298, deWgBAcc: 0.5113, dePgAuroc: 0.5254, dirF1: 0.6475, dirWgBAcc: 0.5337, dirPgAuroc: 0.5561 },
  { method: 'PertOmni', paradigm: 'continuous', deF1: 0.8671, deWgBAcc: 0.5013, dePgAuroc: 0.5422, dirF1: 0.7790, dirWgBAcc: 0.5049, dirPgAuroc: 0.5335 },
  { method: 'VCWorld', paradigm: 'reasoning', deF1: 0.6988, deWgBAcc: 0.5282, dePgAuroc: 0.5297, dirF1: 0.5949, dirWgBAcc: 0.5179, dirPgAuroc: 0.5140 },
  { method: 'RELAY', paradigm: 'ours', deF1: 0.9179, deWgBAcc: 0.5463, dePgAuroc: 0.6138, dirF1: 0.7828, dirWgBAcc: 0.5574, dirPgAuroc: 0.6284 },
];

/** OpenProblems 3-tissue cell counts (from COSCI_CASE_FILMS[0].data) for donut visualization. */
export const COSCI_OPENPROBLEMS_TISSUES: { label: BilingualText; count: number; color: string }[] = [
  { label: { zh: '肺 (Lung)', en: 'Lung' }, count: 24540, color: '#059669' },
  { label: { zh: '胰腺 (Pancreas)', en: 'Pancreas' }, count: 1937, color: '#0D9488' },
  { label: { zh: '外周血 (PBMC)', en: 'PBMC' }, count: 1087, color: '#34D399' },
];

// ---------------------------------------------------------------------------
// Cyto.Identity (scVerity) · Architecture, Benchmark Table 1, and T-Cell Case Study (Table 2 & Fig. 3)
// Source: Cyto-System/Cyto.Identity README.md & scVerity manuscript
// ---------------------------------------------------------------------------

export const IDENTITY_FIGURE = {
  src: '/assets/identity/scverity-fig1.png',
  width: 3839,
  height: 1864,
};

export const IDENTITY_CASE_GIF = {
  src: '/assets/identity/case-animation.gif',
  width: 1320,
  height: 1217,
};

export const IDENTITY_STAGES: { code: string; title: BilingualText; body: BilingualText; hotspot: Hotspot }[] = [
  {
    code: '01',
    title: { zh: 'Manifold Provider (候选生成)', en: 'Adaptive Manifold Provider' },
    body: {
      zh: '集成基因秩次、检出支持与表达程序三路表征，借助样本条件局部度量张量与多原型匹配，为每个单细胞输出高召回的 Cell Ontology 候选分布。',
      en: 'Integrates gene-rank, detection-support, and gene-program views with a cell-conditioned Riemannian metric and multiple prototypes to propose ranked Cell Ontology candidates per cell.',
    },
    hotspot: { x: 26.2, y: 1.2, w: 73.0, h: 33.4 },
  },
  {
    code: '02',
    title: { zh: 'Analyst Agent (证据提取)', en: 'Analyst Agent & Per-Cluster Report' },
    body: {
      zh: '独立于候选预测构建无监督表达图谱与分群，提取标志基因、功能程序与质控特征生成 Per-Cluster Report，将分子证据严格区分为 Supported、Unresolved、Contradicted 与 Unmeasured 四类。',
      en: 'Builds label-free populations independently of candidate predictions, compiling Per-Cluster Reports that categorize molecular evidence into Supported, Unresolved, Contradicted, and Unmeasured classes.',
    },
    hotspot: { x: 0.7, y: 36.2, w: 50.6, h: 43.2 },
  },
  {
    code: '03',
    title: { zh: 'Reviewer Agent & KG (闭环审阅)', en: 'Reviewer Agent & Knowledge Graph' },
    body: {
      zh: '检索 Cell Ontology 知识图谱 (KG) 对齐标志基因与组织先验，在相关对比簇间评估竞争假设，自主执行 Inspect、Split、Merge 或 Ancestor Fallback 等闭环动作。',
      en: 'Queries Cell Ontology knowledge to contextualize marker panels against comparator clusters, executing closed-loop Inspect, Split, Merge, or Ancestor Fallback actions with optional Meta Review adjudication.',
    },
    hotspot: { x: 52.8, y: 36.2, w: 46.5, h: 43.2 },
  },
  {
    code: '04',
    title: { zh: 'Meta Review & Release (终审发布)', en: 'Ontology-Constrained Release' },
    body: {
      zh: '在具备充分分子实测支持且排除观测冲突的前提下，释放最细粒度的 Cell Ontology 细胞身份；疑难冲突谱系调用 Meta Review 引入单细胞配对受体序列终审裁决。',
      en: 'Releases the finest Cell Ontology identity supported by observed molecular measurements without unresolved contradictions, invoking Meta Review for multimodal receptor adjudication.',
    },
    hotspot: { x: 0.7, y: 86.2, w: 98.6, h: 13.0 },
  },
];

export type IdentityParadigm = 'ours' | 'foundation' | 'classifier' | 'agent';

export const IDENTITY_PARADIGM_LABEL: Record<IdentityParadigm, BilingualText> = {
  ours: { zh: 'scVerity (Ours)', en: 'scVerity (ours)' },
  foundation: { zh: '单细胞基础模型 (Foundation Model)', en: 'Foundation model' },
  classifier: { zh: '参考图谱分类器 (Reference Classifier)', en: 'Reference classifier' },
  agent: { zh: 'LLM 智能体 (LLM Agent)', en: 'LLM agent' },
};

export interface IdentityBenchmarkRow {
  method: string;
  paradigm: IdentityParadigm;
  acc: number;
  macroF1: number;
}

export interface IdentityCohortBenchmark {
  id: 'mean' | 'small-intestine' | 'pan-cancer-t' | 'nsclc-t';
  tab: BilingualText;
  title: BilingualText;
  cohortMeta: BilingualText;
  rows: IdentityBenchmarkRow[];
  note: BilingualText;
}

/** Table 1: Ontology-compatible Accuracy / Macro-F1 (%) across three disjoint cohorts (577,063 cells). */
export const IDENTITY_BENCHMARKS: IdentityCohortBenchmark[] = [
  {
    id: 'mean',
    tab: { zh: '三队列均分', en: 'Dataset-equal mean' },
    title: { zh: '三队列等权均值（577,063 细胞）', en: 'Dataset-equal mean (577,063 cells)' },
    cohortMeta: { zh: '3 个独立队列 · 305 位供体', en: '3 disjoint cohorts · 305 donors' },
    rows: [
      { method: 'scVerity', paradigm: 'ours', acc: 61.36, macroF1: 49.76 },
      { method: 'SingleR', paradigm: 'classifier', acc: 46.50, macroF1: 37.93 },
      { method: 'CASSIA', paradigm: 'agent', acc: 43.64, macroF1: 26.65 },
      { method: 'CellTypist', paradigm: 'classifier', acc: 41.59, macroF1: 32.46 },
      { method: 'mLLMCelltype', paradigm: 'agent', acc: 40.49, macroF1: 25.01 },
      { method: 'SCimilarity', paradigm: 'foundation', acc: 33.55, macroF1: 27.87 },
    ],
    note: {
      zh: 'Manifold Provider 仅在 872 万参考细胞上单次预训练且零微调；相比最强外部基线 SingleR，ACC 提升 +14.86 个百分点，Macro-F1 提升 +11.83 个百分点。',
      en: 'Pretrained once on 8.72M reference cells with zero dataset-specific fine-tuning; gains +14.86 pp accuracy and +11.83 pp Macro-F1 over strongest baseline SingleR.',
    },
  },
  {
    id: 'small-intestine',
    tab: { zh: '人小肠', en: 'Small intestine' },
    title: { zh: '人小肠复杂组织队列', en: 'Human small intestine' },
    cohortMeta: { zh: '89,849 细胞 · 13 位供体', en: '89,849 cells · 13 donors' },
    rows: [
      { method: 'scVerity', paradigm: 'ours', acc: 64.91, macroF1: 69.43 },
      { method: 'CASSIA', paradigm: 'agent', acc: 61.83, macroF1: 46.80 },
      { method: 'mLLMCelltype', paradigm: 'agent', acc: 61.27, macroF1: 38.49 },
      { method: 'CellTypist', paradigm: 'classifier', acc: 60.81, macroF1: 61.90 },
      { method: 'SCimilarity', paradigm: 'foundation', acc: 56.28, macroF1: 50.69 },
      { method: 'SingleR', paradigm: 'classifier', acc: 54.78, macroF1: 53.68 },
    ],
    note: {
      zh: '涵盖上皮、免疫与基质多谱系复杂微环境；scVerity 在 ACC (64.91%) 与 Macro-F1 (69.43%) 均居首位。',
      en: 'Spans epithelial, immune, and stromal lineages; scVerity leads both ontology accuracy (64.91%) and Macro-F1 (69.43%).',
    },
  },
  {
    id: 'pan-cancer-t',
    tab: { zh: '泛癌 T 细胞', en: 'Pan-cancer T-cell' },
    title: { zh: '泛癌细粒度 T 细胞队列', en: 'Pan-cancer T-cell atlas' },
    cohortMeta: { zh: '368,852 细胞 · 256 位供体', en: '368,852 cells · 256 donors' },
    rows: [
      { method: 'scVerity', paradigm: 'ours', acc: 52.98, macroF1: 41.67 },
      { method: 'SingleR', paradigm: 'classifier', acc: 32.29, macroF1: 29.61 },
      { method: 'CASSIA', paradigm: 'agent', acc: 19.47, macroF1: 11.16 },
      { method: 'CellTypist', paradigm: 'classifier', acc: 19.22, macroF1: 13.88 },
      { method: 'mLLMCelltype', paradigm: 'agent', acc: 16.89, macroF1: 12.45 },
      { method: 'SCimilarity', paradigm: 'foundation', acc: 10.84, macroF1: 15.89 },
    ],
    note: {
      zh: '细粒度 T 细胞亚型共享主导谱系标志，全局嵌入度量易发生表征坍缩（SCimilarity ACC 仅 10.84%）；scVerity 凭借条件局部度量与闭环核验达到 52.98% ACC / 41.67% Macro-F1。',
      en: 'Fine-grained T-cell states share dominant lineage markers that collapse global embedding retrieval (SCimilarity 10.84%); scVerity reaches 52.98% / 41.67%.',
    },
  },
  {
    id: 'nsclc-t',
    tab: { zh: 'NSCLC T 细胞', en: 'NSCLC T-cell' },
    title: { zh: '非小细胞肺癌 T 细胞队列', en: 'NSCLC T-cell cohort' },
    cohortMeta: { zh: '118,362 细胞 · 36 位供体', en: '118,362 cells · 36 donors' },
    rows: [
      { method: 'scVerity', paradigm: 'ours', acc: 66.18, macroF1: 38.17 },
      { method: 'SingleR', paradigm: 'classifier', acc: 52.43, macroF1: 30.51 },
      { method: 'CASSIA', paradigm: 'agent', acc: 49.63, macroF1: 22.00 },
      { method: 'CellTypist', paradigm: 'classifier', acc: 44.75, macroF1: 21.59 },
      { method: 'mLLMCelltype', paradigm: 'agent', acc: 43.30, macroF1: 24.10 },
      { method: 'SCimilarity', paradigm: 'foundation', acc: 33.53, macroF1: 17.02 },
    ],
    note: {
      zh: '在非小细胞肺癌肿瘤浸润 T 细胞微环境中，领先最强基线 SingleR +13.75 pp ACC 与 +7.66 pp Macro-F1。',
      en: 'Outperforms strongest baseline SingleR by +13.75 pp in accuracy and +7.66 pp in Macro-F1 on tumor-infiltrating NSCLC T cells.',
    },
  },
];

/** Table 2: Staged verification on 78,228 human thymic & peripheral blood T cells (13 donors, FACS ground truth). */
export const IDENTITY_CASE_STAGES: {
  stage: BilingualText;
  acc: number;
  macroF1Pct: number;
  revised: number;
  netGain: number;
}[] = [
  { stage: { zh: 'Manifold Provider', en: 'Manifold Provider' }, acc: 52.29, macroF1Pct: 43.04, revised: 0, netGain: 0 },
  { stage: { zh: 'Agent Review', en: 'Agent Review' }, acc: 55.85, macroF1Pct: 45.34, revised: 3949, netGain: 2784 },
  { stage: { zh: 'Meta Review', en: 'Meta Review' }, acc: 56.63, macroF1Pct: 47.61, revised: 611, netGain: 606 },
];

/** Fig. 3g: Multimodal MAIT cell recall across decision criteria (constant 23 false positives across all three). */
export const IDENTITY_MAIT_RECALL: {
  criterion: BilingualText;
  recall: number;
  addedTrue: number;
  falsePositives: number;
}[] = [
  { criterion: { zh: '严格联合标准 (TCR + KLRB1 + SLC4A10)', en: 'Joint criteria (TCR + KLRB1 + SLC4A10)' }, recall: 69.09, addedTrue: 0, falsePositives: 23 },
  { criterion: { zh: '放宽 SLC4A10 表达限制 (TCR + KLRB1)', en: 'SLC4A10 optional (TCR + KLRB1)' }, recall: 84.30, addedTrue: 144, falsePositives: 23 },
  { criterion: { zh: '配对 TCR 受体序列确证 (TRAV1-2 Invariant)', en: 'Paired TCR alone (Canonical TRAV1-2)' }, recall: 91.91, addedTrue: 85, falsePositives: 23 },
];

export function pickText(t: BilingualText, lang: Lang): string {
  return t[lang];
}
