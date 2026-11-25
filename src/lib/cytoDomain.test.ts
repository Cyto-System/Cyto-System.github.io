import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CYTO_MODULES,
  CYTO_BENCHMARK_SUITES,
  PERTURBATION_SCENARIOS,
  filterCytoModules,
  simulatePerturbation,
  validateHypothesisInput,
  synthesizeCoScientistTrace,
  getSortedBenchmarkEntries,
} from './cytoDomain';

test('CYTO_MODULES covers all 7 modules across 3 tiers (5 published in main table + 2 in R&D)', () => {
  assert.equal(CYTO_MODULES.length, 7);
  const mainTable = CYTO_MODULES.filter((m) => m.inMainTable);
  const inDev = CYTO_MODULES.filter((m) => !m.inMainTable);
  assert.equal(mainTable.length, 5);
  assert.equal(inDev.length, 2);
});

test('filterCytoModules filters accurately by tier, availability, and search query', () => {
  const tier01 = filterCytoModules(CYTO_MODULES, '01', '');
  assert.equal(tier01.length, 3);

  const available = filterCytoModules(CYTO_MODULES, 'available', '');
  assert.deepEqual(
    available.map((m) => m.name),
    ['Cyto.Spatial', 'Cyto.Identity', 'Cyto.Perturbation', 'Cyto.CoScientist']
  );

  const nicheSearch = filterCytoModules(CYTO_MODULES, 'all', 'niche');
  assert.equal(nicheSearch.length, 1);
  assert.equal(nicheSearch[0].name, 'Cyto.Spatial');
});

test('simulatePerturbation yields zero delta at 0% dose and normalized 100.0% fate shares across doses', () => {
  const scenario = PERTURBATION_SCENARIOS[0];
  const zeroDose = simulatePerturbation(scenario, 0);
  assert.equal(zeroDose.dosePercent, 0);
  assert.equal(zeroDose.phenotypeShiftIndex, 0);
  for (const m of zeroDose.markers) {
    assert.equal(m.log2FC, 0);
  }

  for (const dose of [0, 25, 50, 75, 100]) {
    const sim = simulatePerturbation(scenario, dose);
    const totalPct = Number(
      sim.fates.reduce((acc, f) => acc + f.perturbedPct, 0).toFixed(1)
    );
    assert.equal(totalPct, 100.0);
  }

  const highDose = simulatePerturbation(scenario, 85);
  assert.ok(highDose.phenotypeShiftIndex > 40);
  const tcf7 = highDose.markers.find((m) => m.gene === 'TCF7');
  const havcr2 = highDose.markers.find((m) => m.gene === 'HAVCR2');
  assert.ok(tcf7 && tcf7.log2FC > 1.5);
  assert.ok(havcr2 && havcr2.log2FC < -1.8);
});

test('validateHypothesisInput rejects empty or malformed inputs without silent fallback', () => {
  const emptyRes = validateHypothesisInput({
    targetGene: '   ',
    tissueContext: '',
    perturbationMode: 'crispr_ko',
  });
  assert.equal(emptyRes.valid, false);
  assert.ok(emptyRes.errors.targetGene);
  assert.ok(emptyRes.errors.tissueContext);

  const badGeneRes = validateHypothesisInput({
    targetGene: '12345!!!',
    tissueContext: '结直肠癌浸润边界',
    perturbationMode: 'crispr_ko',
  });
  assert.equal(badGeneRes.valid, false);
  assert.ok(badGeneRes.errors.targetGene);
  assert.equal(badGeneRes.errors.tissueContext, undefined);

  const validRes = validateHypothesisInput({
    targetGene: 'PDCD1+LAG3',
    tissueContext: '非小细胞肺癌免疫微环境',
    perturbationMode: 'crispr_ko',
  });
  assert.equal(validRes.valid, true);
});

test('synthesizeCoScientistTrace produces deterministic 5-step multi-scale trajectory', () => {
  const trace = synthesizeCoScientistTrace({
    targetGene: 'tp53',
    tissueContext: '肝细胞癌边界生态位',
    perturbationMode: 'crispr_a',
  });
  assert.equal(trace.targetGene, 'TP53');
  assert.equal(trace.steps.length, 5);
  assert.equal(trace.steps[0].module, 'Cyto.Genome');
  assert.equal(trace.steps[4].module, 'Cyto.CoScientist');
});

test('getSortedBenchmarkEntries places Cyto family model at rank 1 in every benchmark suite', () => {
  for (const suite of CYTO_BENCHMARK_SUITES) {
    const sorted = getSortedBenchmarkEntries(suite);
    assert.equal(sorted[0].isCyto, true);
    assert.ok(sorted[0].score > sorted[1].score);
  }
});
