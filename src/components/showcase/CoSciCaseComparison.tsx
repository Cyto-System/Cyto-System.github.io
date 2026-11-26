import React from 'react';
import type { Lang } from '../../lib/cytoDomain';

// Research objectives and data follow the Experiments table in the showcase README.
const groups = [
  {
    name: { zh: '生物信息学算法开发', en: 'Bioinformatics algorithm development' },
    cases: [
      {
        name: { zh: '跨组织单细胞 RNA 测序去噪', en: 'Cross-tissue single-cell RNA-seq denoising' },
        type: { zh: '单组学算法开发', en: 'Single-omics algorithm development' },
        data: { zh: 'OpenProblems 训练计数矩阵，涵盖肺、胰腺和外周血单个核细胞。', en: 'OpenProblems training count matrices from lung, pancreas, and peripheral blood mononuclear cells.' },
        goal: { zh: '从零开发通用去噪算法，在三种组织上使用同一套参数，最小化等权平均均方误差。', en: 'Develop a denoising algorithm from scratch, without tissue-specific tuning, to minimize equally weighted mean squared error across three tissues.' },
      },
      {
        name: { zh: '肺腺癌生存预测', en: 'Lung adenocarcinoma survival prediction' },
        type: { zh: '多组学算法开发', en: 'Multi-omics algorithm development' },
        data: { zh: 'TCGA-LUAD 的 RNA、miRNA 和 DNA 甲基化数据。420 例患者中，336 例用于训练，84 例用于评估。', en: 'RNA, miRNA, and DNA methylation from 420 TCGA-LUAD patients, with 336 for training and 84 for evaluation.' },
        goal: { zh: '从零开发多组学生存风险预测流程，最大化固定评估集上的 Harrell C 指数。', en: 'Develop a multi-omics survival pipeline from scratch to maximize Harrell’s C-index on the fixed evaluation split.' },
      },
    ],
  },
  {
    name: { zh: '开放式生物信息学研究', en: 'Open-ended bioinformatics inquiry' },
    cases: [
      {
        name: { zh: '脓毒症死亡风险', en: 'Sepsis mortality' },
        type: { zh: '开放式假设探索与跨队列研究', en: 'Hypothesis development across cohorts' },
        data: { zh: 'Cyto.CoScientist 自主检索并评估公开队列。', en: 'Cyto.CoScientist independently identified and assessed public cohorts.' },
        goal: { zh: '在不预设感染来源与机制的条件下，提出与死亡风险相关的可测量分子变化假设，并设计可将其与疾病严重程度、治疗等替代解释区分开的预测。', en: 'With infection source and mechanism left open, propose measurable molecular changes associated with mortality and predictions that distinguish them from disease severity or treatment effects.' },
      },
      {
        name: { zh: '食管鳞癌淋巴结转移', en: 'Lymph-node metastasis in esophageal squamous cell carcinoma' },
        type: { zh: '单组学生物信息学分析', en: 'Single-omics analysis' },
        data: { zh: '40 例患者、110 个单细胞文库。系统筛得 12 例具有 C4 平台配对淋巴结的患者。', en: '110 single-cell libraries from 40 patients. The system identified 12 patients with paired nodes profiled on the C4 platform.' },
        goal: { zh: '比较同一患者转移与无肿瘤淋巴结中的 B 细胞和浆细胞，区分组成、状态及表达中跨患者复现与个体特有的变化，并提出后续验证问题。', en: 'Compare B- and plasma-cell composition, states, and expression in paired metastatic and tumor-free lymph nodes, distinguish recurrent from patient-specific responses, and propose follow-up validation questions.' },
      },
      {
        name: { zh: '急性主动脉夹层', en: 'Acute aortic dissection' },
        type: { zh: '多组学整合分析', en: 'Multi-omics integration' },
        data: { zh: '13 例术前患者与 5 名健康对照，同次采血获单细胞 RNA、单细胞 ATAC、血浆蛋白组、游离 DNA 甲基化和全基因组测序数据。', en: 'One blood draw each from 13 preoperative cases and 5 healthy controls, profiled by single-cell RNA-seq, single-cell ATAC-seq, plasma proteomics, cell-free DNA methylation, and whole-genome sequencing.' },
        goal: { zh: '比较各组学的病例与对照差异，检验遗传变异、表观调控、转录、蛋白与表型之间的关联，为候选早筛标志物和相关通路确定验证优先级。', en: 'Compare cases and controls within each modality, test associations across molecular layers and phenotype, and prioritize candidate early-detection markers and pathways for validation.' },
      },
    ],
  },
];

export function CoSciCaseComparison({ lang }: { lang: Lang }) {
  const dataLabel = lang === 'zh' ? '研究数据' : 'Data';
  const goalLabel = lang === 'zh' ? '初始研究目标' : 'Original research objective';
  const columns = 'md:grid md:grid-cols-[1fr_1.35fr_1.65fr] md:gap-6';
  return (
    <div className="overflow-hidden rounded-xl border border-emerald-950/10 bg-white">
      <div aria-hidden="true" className={`hidden ${columns} bg-[#F1F6F3] px-5 py-3 text-sm font-semibold text-[#29483A]`}>
        <span>{lang === 'zh' ? '案例与任务类型' : 'Study and task type'}</span><span>{dataLabel}</span><span>{goalLabel}</span>
      </div>
      {groups.map(group => (
        <section key={group.name.en}>
          <h4 className="border-y border-emerald-950/10 bg-[#E6F1EB] px-5 py-2 text-sm font-semibold text-[#16583D]">{group.name[lang]}</h4>
          <ul className="divide-y divide-emerald-950/10">
            {group.cases.map(study => (
              <li key={study.name.en} className={`${columns} space-y-2 px-5 py-4 md:space-y-0 text-sm leading-relaxed text-slate-700`}>
                <div><h5 className="font-semibold text-[#0C261B]">{study.name[lang]}</h5><p className="mt-1 text-xs text-slate-600">{study.type[lang]}</p></div>
                <p><span className="font-semibold md:sr-only">{dataLabel}　</span>{study.data[lang]}</p>
                <p><span className="font-semibold md:sr-only">{goalLabel}　</span>{study.goal[lang]}</p>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
