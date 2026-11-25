import test from 'node:test';
import assert from 'node:assert/strict';
import {
  COSCI_CASE_FILMS,
  COSCI_COMPONENTS,
  COSCI_TRAJECTORY,
  SHOWCASE_MODELS,
  SPATIAL_PARTS,
  PERTURBATION_STAGES,
  PERTURBATION_MAIN,
  PERTURBATION_BUILDUP,
  PERTURBATION_OOD,
  PERTURBATION_DRUG,
  SPATIAL_REPRESENTATION,
  SPATIAL_GENERATION,
  matrixAxis,
  chapterIndexAt,
  formatClock,
  modelIdFromHash,
} from './modelShowcase';

test('four showcase models share one entry bar in hero order', () => {
  assert.deepEqual(
    SHOWCASE_MODELS.map((m) => m.name),
    ['Cyto.Spatial', 'Cyto.Identity', 'Cyto.Perturbation', 'Cyto.CoScientist']
  );
});

test('model hash parsing accepts only known ids', () => {
  assert.equal(modelIdFromHash('#model-coscientist'), 'coscientist');
  assert.equal(modelIdFromHash('#model-perturbation'), 'perturbation');
  assert.equal(modelIdFromHash('#model-unknown'), null);
  assert.equal(modelIdFromHash('#models'), null);
});

test('hotspots stay inside their figure', () => {
  const all = [
    ...COSCI_COMPONENTS.map((c) => c.hotspot),
    ...COSCI_TRAJECTORY.map((s) => s.hotspot),
    ...SPATIAL_PARTS.map((p) => p.hotspot),
    ...PERTURBATION_STAGES.map((p) => p.hotspot),
  ];
  for (const h of all) {
    assert.ok(h.x >= 0 && h.y >= 0, 'origin inside');
    assert.ok(h.x + h.w <= 100.01 && h.y + h.h <= 100.01, 'extent inside');
  }
});

test('case films have ordered chapters within their duration', () => {
  assert.equal(COSCI_CASE_FILMS.length, 5);
  for (const f of COSCI_CASE_FILMS) {
    assert.equal(f.chapters[0].start, 0);
    for (let i = 1; i < f.chapters.length; i++) {
      assert.ok(f.chapters[i].start > f.chapters[i - 1].start);
    }
    assert.ok(f.chapters[f.chapters.length - 1].start < f.duration);
    assert.match(f.video, /^\/assets\/coscientist\/videos\/.+\.mp4$/);
  }
});

test('chapterIndexAt and formatClock', () => {
  const film = COSCI_CASE_FILMS[0];
  assert.equal(chapterIndexAt(film, 0), 0);
  assert.equal(chapterIndexAt(film, film.chapters[2].start + 0.1), 2);
  assert.equal(chapterIndexAt(film, film.duration), 3);
  assert.equal(formatClock(73.4), '01:13');
  assert.equal(formatClock(-3), '00:00');
});

test('benchmark matrices are rectangular and include SUDOKU', () => {
  for (const b of [...SPATIAL_REPRESENTATION, ...SPATIAL_GENERATION]) {
    assert.ok(b.methods.some((m) => m.name === 'SUDOKU'));
    for (const m of b.methods) assert.equal(m.values.length, b.columns.length, `${b.id}/${m.name}`);
  }
});

test('matrixAxis covers negatives', () => {
  assert.deepEqual(matrixAxis([-0.094, 0.765]), [-0.1, 0.8]);
  assert.deepEqual(matrixAxis([0.2, 0.5]), [0, 0.5]);
});

test('method case films carry no metric boxes (numbers live in the results section)', () => {
  for (const f of COSCI_CASE_FILMS) {
    if (f.track === 'method') assert.equal(f.metrics.length, 0, f.id);
  }
});

test('RELAY perturbation benchmarks lead all primary PerturbQA metrics and cover buildup, OOD, and unseen compounds', () => {
  const relayMain = PERTURBATION_MAIN.find((r) => r.paradigm === 'ours');
  assert.ok(relayMain);
  for (const row of PERTURBATION_MAIN) {
    assert.ok(relayMain.deF1 >= row.deF1);
    assert.ok(relayMain.deWgBAcc >= row.deWgBAcc);
    assert.ok(relayMain.dePgAuroc >= row.dePgAuroc);
    assert.ok(relayMain.dirF1 >= row.dirF1);
    assert.ok(relayMain.dirWgBAcc >= row.dirWgBAcc);
    assert.ok(relayMain.dirPgAuroc >= row.dirPgAuroc);
  }
  assert.equal(PERTURBATION_BUILDUP.length, 7);
  assert.equal(PERTURBATION_OOD.length, 3);
  assert.equal(PERTURBATION_DRUG.length, 5);
});
