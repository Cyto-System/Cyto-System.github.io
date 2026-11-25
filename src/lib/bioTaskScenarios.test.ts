import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CYCLE_DURATION_SEC,
  CYTO_TASK_SCENARIOS,
  STEP_DURATION_SEC,
  computeBioInteriorKinematics,
  computeBoardTetherStart,
  computeCycleLoopState,
  computeWindowLayerTargets,
  shouldPauseHeroWebgl,
} from './bioTaskScenarios';

test('CYTO_TASK_SCENARIOS defines distinct per-model board metrics, roles, and 4 distinct spatially matched window positions per scenario', () => {
  assert.equal(CYTO_TASK_SCENARIOS.length, 3);
  for (const scenario of CYTO_TASK_SCENARIOS) {
    assert.equal(scenario.steps.length, 4);
    const distinctMetrics = new Set(scenario.steps.map((s) => s.boardMetric));
    const distinctRolesZh = new Set(scenario.steps.map((s) => s.roleHeadline.zh));
    const distinctZones = new Set(scenario.steps.map((s) => s.windowZone));
    assert.equal(distinctMetrics.size, 4, `Expected 4 distinct board metrics in ${scenario.id}`);
    assert.equal(distinctRolesZh.size, 4, `Expected 4 distinct model role headlines in ${scenario.id}`);
    assert.equal(distinctZones.size, 4, `Expected 4 distinct window positions in ${scenario.id}`);

    for (const st of scenario.steps) {
      assert.ok(st.roleDetail.zh.length >= 12);
      assert.ok(st.roleDetail.en.length >= 12);
      assert.ok(st.targetElementLabel.zh.length >= 4);
      assert.ok(st.targetElementLabel.en.length >= 4);

      const [bx, by, bz] = st.boardPos;
      const [ax, ay, az] = st.anchorPos;

      // Board must never collide with left 4 model cards (x in [-2.91, -1.81], y in [-0.42, 1.11])
      const overlapsLeftCardsX = bx - 0.7 < -1.81 && bx + 0.7 > -2.91;
      const overlapsLeftCardsY = by - 0.47 < 1.11 && by + 0.47 > -0.42;
      assert.equal(
        overlapsLeftCardsX && overlapsLeftCardsY,
        false,
        `Board at ${st.windowZone} in ${scenario.id} overlaps left model cards`
      );

      // Anchor must be spatially close to board (matched element) yet outside board's projected XY box
      const xyDist = Math.hypot(bx - ax, by - ay);
      assert.ok(
        xyDist >= 0.65 && xyDist <= 1.5,
        `Expected matched proximity between board and anchor (${xyDist.toFixed(2)}m) for ${st.moduleName}`
      );
      assert.ok(bz > az, 'Board should float in front of interior Virtual Cell anchor');
    }
  }
});

test('computeBoardTetherStart attaches cleanly to the perimeter of the 3D Explanation Board and reuses optional out buffer', () => {
  // Board below anchor -> attaches to top edge of board (by + halfH)
  const fromBottomLeft = computeBoardTetherStart([-1.34, -1.12, 0.78], [-1.4, 0.02, 0.04], 1.4, 0.94);
  assert.ok(Math.abs(fromBottomLeft[1] - (-1.12 + 0.47)) < 0.002);

  // Board above anchor -> attaches to bottom edge of board (by - halfH), reusing pre-allocated tuple
  const outBuf: [number, number, number] = [0, 0, 0];
  const fromTopCenter = computeBoardTetherStart(
    [0.1, 1.14, 0.78],
    [0.08, 0.18, 0.06],
    1.4,
    0.94,
    outBuf
  );
  assert.equal(fromTopCenter, outBuf);
  assert.ok(Math.abs(fromTopCenter[1] - (1.14 - 0.47)) < 0.002);
});

test('computeCycleLoopState cycles autonomously 0 -> 1 -> 2 -> 3 -> 0 without stalling', () => {
  const s0 = computeCycleLoopState(0.2);
  const s1 = computeCycleLoopState(STEP_DURATION_SEC + 0.2);
  const s2 = computeCycleLoopState(STEP_DURATION_SEC * 2 + 0.2);
  const s3 = computeCycleLoopState(STEP_DURATION_SEC * 3 + 0.2);
  const wrapped = computeCycleLoopState(CYCLE_DURATION_SEC + 0.2);

  assert.equal(s0.activeStepIdx, 0);
  assert.equal(s1.activeStepIdx, 1);
  assert.equal(s2.activeStepIdx, 2);
  assert.equal(s3.activeStepIdx, 3);
  assert.equal(wrapped.activeStepIdx, 0);
  assert.ok(Math.abs(wrapped.cyclePhase - s0.cyclePhase) < 1e-6);
});

test('shouldPauseHeroWebgl keeps WebGL active while Hero is visible and pauses once scrolled past Hero', () => {
  assert.equal(shouldPauseHeroWebgl(0, 840), false);
  assert.equal(shouldPauseHeroWebgl(420, 840), false);
  assert.equal(shouldPauseHeroWebgl(880, 840), false);
  assert.equal(shouldPauseHeroWebgl(920, 840), true);
});

test('computeWindowLayerTargets centers overview camera on X=0, adapts Z to split-pane aspect, and separates 3D glass panes in exploded preset', () => {
  const wideOverview = computeWindowLayerTargets('overview', 1, 1.82);
  const splitOverview = computeWindowLayerTargets('overview', 1, 1.21);
  const mobileOverview = computeWindowLayerTargets('overview', 1, 0.78);
  const exploded = computeWindowLayerTargets('exploded', 1, 1.21);

  assert.equal(splitOverview.cameraPos[0], 0);
  assert.ok(splitOverview.cameraPos[2] > wideOverview.cameraPos[2]);
  assert.ok(mobileOverview.cameraPos[2] > splitOverview.cameraPos[2]);

  const tanHalfFov = Math.tan((36 * Math.PI) / 360);
  const visibleHalfW = (splitOverview.cameraPos[2] - 0.78) * tanHalfFov * 1.21;
  assert.ok(visibleHalfW >= 2.95);

  assert.ok(splitOverview.backGlassZ < splitOverview.specimenZ);
  assert.ok(splitOverview.specimenZ < splitOverview.mainWindowZ);
  assert.ok(splitOverview.mainWindowZ < splitOverview.tracePaneZ);

  const overviewSpan = splitOverview.tracePaneZ - splitOverview.backGlassZ;
  const explodedSpan = exploded.tracePaneZ - exploded.backGlassZ;
  assert.ok(explodedSpan > overviewSpan * 1.8);

  assert.ok(splitOverview.cardZOffsets[1] > splitOverview.cardZOffsets[0]);
  assert.ok(splitOverview.cardZOffsets[1] > splitOverview.cardZOffsets[2]);
});

test('computeBioInteriorKinematics is seamlessly periodic across loop wrap (0.9999 -> 0) and peaks at each model stage', () => {
  const start = computeBioInteriorKinematics('pdac-stroma-barrier', 0);
  const end = computeBioInteriorKinematics('pdac-stroma-barrier', 0.9999);

  // Seamless C0 loop continuity across 1.0 -> 0.0 wrap
  assert.ok(Math.abs(end.drugDockProgress - start.drugDockProgress) < 0.005);
  assert.ok(Math.abs(end.cellMembraneScale - start.cellMembraneScale) < 0.005);
  assert.ok(Math.abs(end.geneClampY - start.geneClampY) < 0.005);
  assert.ok(Math.abs(end.receptorActiveRatio - start.receptorActiveRatio) < 0.005);
  assert.ok(Math.abs(end.spatialHaloIntensity - start.spatialHaloIntensity) < 0.005);
  assert.ok(start.geneSignalAlpha < 0.01);

  // Stage-specific biological emphasis:
  const atSpatialStage = computeBioInteriorKinematics('pdac-stroma-barrier', 0.125);
  const atGenomeStage = computeBioInteriorKinematics('hspc-enhancer-editing', 0.125);
  const atIdentityStage = computeBioInteriorKinematics('pdac-stroma-barrier', 0.375);
  const atPerturbStage = computeBioInteriorKinematics('pdac-stroma-barrier', 0.625);

  assert.ok(atSpatialStage.spatialHaloIntensity > atPerturbStage.spatialHaloIntensity);
  assert.ok(atGenomeStage.geneGlowIntensity > atSpatialStage.geneGlowIntensity);
  assert.ok(atIdentityStage.nucleusGlowIntensity > start.nucleusGlowIntensity);
  assert.ok(atPerturbStage.drugDockProgress > start.drugDockProgress);
  assert.ok(atPerturbStage.receptorActiveRatio > start.receptorActiveRatio);
});
