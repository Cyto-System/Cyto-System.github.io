import React from 'react';
import type { Lang } from '../../lib/cytoDomain';
import { EyebrowHeading } from './shared';

export const CoSciResults: React.FC<{ lang: Lang }> = ({ lang }) => {
  const zh = lang === 'zh';
  return (
    <div className="space-y-8">
        <EyebrowHeading
          id="cosci-results"
          index="03"
          kicker="STUDY RESULTS"
          title={zh ? '研究结果' : 'Study results'}
          accent={zh ? '两项算法评估与三项开放式生信研究' : 'Two algorithm evaluations and three open-ended bioinformatics studies'}
        />
      <section aria-labelledby="cosci-algorithm-results" className="space-y-4">
        <h4 id="cosci-algorithm-results" className="text-lg font-semibold text-[#0C261B]">{zh ? '算法开发：定量评估' : 'Algorithm development: quantitative evaluation'}</h4>
        <div className="grid gap-4 lg:grid-cols-2">
          {[
            {
              title: zh ? 'OpenProblems · 单细胞 RNA 测序去噪' : 'OpenProblems · Single-cell RNA-seq denoising',
              panel: '1c', preview: 'openproblems-benchmark.png',
              alt: zh ? '三组织平均 MSE（越低越好）：ALRA 0.2813，DCA 0.2346，MAGIC 0.2013，Cyto.CoScientist 0.1919。' : 'Three-tissue mean MSE (lower is better): ALRA 0.2813, DCA 0.2346, MAGIC 0.2013, Cyto.CoScientist 0.1919.',
              result: zh ? '改用图传播算子后，最终算法在三种组织上的均方误差均低于 MAGIC。等权平均 MSE 为 0.1919，比 MAGIC 的 0.2013 低 4.7%。' : 'The final graph-propagation denoiser reduced mean squared error relative to MAGIC in all three tissues. Equally weighted mean MSE was 0.1919 versus 0.2013 for MAGIC, a 4.7% reduction.',
            },
            {
              title: zh ? 'TCGA-LUAD · 多组学生存预测' : 'TCGA-LUAD · Multi-omics survival prediction',
              panel: '1d', preview: 'luad-benchmark.png',
              alt: zh ? 'Harrell C 指数（越高越好）：匹配复现的 DeepProg 为 0.5950，Cyto.CoScientist 为 0.6458。' : 'Harrell’s C-index (higher is better): matched DeepProg 0.5950, Cyto.CoScientist 0.6458.',
              result: zh ? '在相同的 336 人训练集和 84 人评估集上，Cyto.CoScientist 的 C 指数为 0.6458，比匹配复现的 DeepProg（0.5950）高 0.0508。' : 'On the same 336-patient training and 84-patient evaluation split, Cyto.CoScientist achieved a C-index of 0.6458 versus 0.5950 for matched DeepProg, an absolute gain of 0.0508.',
            },
          ].map(({ title, panel, preview, alt, result }) => (
            <article key={panel} className="flex flex-col gap-3 rounded-xl border border-emerald-950/10 bg-white p-5">
              <h5 className="font-semibold text-[#0C261B]">{title}</h5>
              <a href="/assets/coscientist/cycle-cg.png" target="_blank" rel="noreferrer" className="flex flex-1 flex-col justify-between rounded-md focus-visible:outline-2 focus-visible:outline-emerald-700">
                <img src={`/assets/coscientist/results/${preview}`} width={415} height={407} alt={alt} className="h-auto w-full max-w-[360px] self-center" />
                <span className="mt-2 text-xs font-semibold text-emerald-800 underline underline-offset-2">{zh ? `正文图 ${panel} · 查看案例总图` : `Fig. ${panel} · View case overview`}</span>
              </a>
              <p className="text-sm leading-relaxed text-slate-700">{result}</p>
            </article>
          ))}
        </div>
      </section>
      <section aria-labelledby="cosci-inquiry-results" className="space-y-4">
        <h4 id="cosci-inquiry-results" className="text-lg font-semibold text-[#0C261B]">
          {zh ? '开放式生信研究：主要发现与证据边界' : 'Open-ended bioinformatics: findings and limits of the evidence'}
        </h4>
        <div className="grid gap-4 lg:grid-cols-3">
          {[
            {
              panel: '10a',
              preview: 'sepsis-panel.png',
              original: 'fig3_sepsis_round2_findings.png',
              caption: zh ? '同一患者第 1 天至第 7 天的苯丙氨酸变化' : 'Day 1 to day 7 phenylalanine changes within patients',
              title: zh ? '脓毒症死亡风险' : 'Sepsis mortality',
              finding: zh ? '研究从单次采血转向同一患者第 1 天与第 7 天的配对比较。以另外 19 种氨基酸为参照，苯丙氨酸的相对水平在存活组和死亡组平均均有下降，但死亡组降幅较小。' : 'The analysis shifted from single blood draws to changes within patients from day 1 to day 7. Relative to 19 other amino acids, phenylalanine fell on average in both outcome groups, but less in non-survivors.',
              limit: zh ? '该模式仍需在独立配对队列中验证，尚不能据此判断死亡风险。' : 'The pattern requires replication in an independent paired cohort; its association with mortality remains unresolved.',
            },
            {
              panel: '11c',
              preview: 'escc-panel.png',
              original: 'fig1_escc_bcell_decoupling.png',
              caption: zh ? '记忆 B 细胞比例变化与状态内 TOP2A 表达' : 'Memory B-cell proportions and within-state TOP2A expression',
              title: zh ? '食管鳞癌淋巴结转移' : 'Lymph node metastasis in esophageal squamous cell carcinoma',
              finding: zh ? '配对比较显示，转移淋巴结中记忆 B 细胞总体占比下降，但在记忆 B 细胞内部，10 名可评估患者的 TOP2A 表达均升高。' : 'In paired lymph nodes from 12 patients, the memory B-cell proportion fell overall in metastatic nodes, while TOP2A expression within memory B cells rose in all 10 evaluable patients.',
              limit: zh ? 'B 细胞标签下检出的 CXCL13 RNA 不能证明其由 B 细胞产生，仍需原位定位。' : 'CXCL13 RNA detected under B-cell labels does not establish that B cells produced it. Its cellular origin requires in situ localization.',
            },
            {
              panel: '13e',
              preview: 'anzhen-panel.png',
              original: 'fig1_anzhen_single_dual_smad3.png',
              caption: zh ? '13 例患者中 SMAD3 区域的甲基化与染色质可及性' : 'SMAD3 methylation and chromatin accessibility across 13 cases',
              title: zh ? '急性主动脉夹层五组学研究' : 'Five-omics analysis of acute aortic dissection',
              finding: zh ? '比较不同样本材料中的 48 对预设指标时，仅 SMAD3 区域在 13 例患者中呈现一致的负相关：血浆游离 DNA 甲基化越高，外周血单个核细胞的染色质可及性越低。' : 'Of 48 prespecified cross-material pairs, only the SMAD3 region showed a consistent inverse association across 13 cases: higher plasma cell-free DNA methylation tracked with lower chromatin accessibility in peripheral blood mononuclear cells.',
              limit: zh ? '该关联仍需独立队列复现。另一个候选位点 CP6B 缺少物理染色质接触证据，评审后撤回了这一解释。' : 'The association awaits independent replication. At a separate candidate locus, CP6B, review found no evidence of physical chromatin contact, and that interpretation was withdrawn.',
            },
          ].map(({ title, finding, limit, preview, original, panel, caption }) => (
            <article key={title} className="space-y-3 rounded-xl border border-emerald-950/10 bg-white p-5">
              <h5 className="font-semibold text-[#0C261B]">{title}</h5>
              <figure className="space-y-2">
                <a href={`/assets/coscientist/results/${original}`} target="_blank" rel="noreferrer" className="group block rounded-md focus-visible:outline-2 focus-visible:outline-emerald-700">
                  <img src={`/assets/coscientist/results/${preview}`} loading="lazy" alt={caption} className="aspect-[6/5] w-full object-contain" />
                  <span className="mt-2 inline-block text-xs font-semibold text-emerald-800 underline underline-offset-2">{zh ? `正文图 ${panel} · 查看完整原图` : `Fig. ${panel} · View full figure`}</span>
                </a>
                <figcaption className="text-sm font-medium leading-snug text-[#29483A]">{caption}</figcaption>
              </figure>
              <p className="text-sm leading-relaxed text-slate-700">{finding}</p>
              <p className="border-t border-emerald-950/10 pt-3 text-sm leading-relaxed text-slate-600">{limit}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};
