import * as THREE from 'three';
import { BioInteriorKinematics, BioTaskScenario } from './bioTaskScenarios';

const _dummy = new THREE.Object3D();
const _color = new THREE.Color();
const _vA = new THREE.Vector3();
const _vB = new THREE.Vector3();
const _mid = new THREE.Vector3();
const _up = new THREE.Vector3(0, 1, 0);
const _quat = new THREE.Quaternion();

export interface VirtualCellInteriorController {
  group: THREE.Group;
  update: (
    kin: BioInteriorKinematics,
    cyclePhase: number,
    mode: BioTaskScenario['specimenGeometryMode']
  ) => void;
}

/**
 * Builds the unmistakable 3D Virtual-Cell interior inside the Glass Task Execution Window:
 * 1) Left: 3D Watson-Crick DNA Double Helix + Highlighted Golden Gene Locus + CRISPR/TF Ring Clamp
 * 2) Center: Multi-Layered 3D Virtual Cell (Translucent Lipid Membrane, Nucleus, Chromatin Knot,
 *    Mitochondria Organelles, and 14 Y-Cup Transmembrane Surface Receptors)
 * 3) Right: 3 Two-Tone Pharmaceutical Drug Capsules + 4 Hexagonal Small-Molecule Chemical Rings
 * 4) Conduits: Gene->Nucleus mRNA bridge & Drug->Receptor docking bridge with animated pulses
 */
export function buildVirtualCellInterior(
  isSoftwareGl: boolean,
  disposables: { dispose: () => void }[]
): VirtualCellInteriorController {
  const group = new THREE.Group();

  // ============================================================================
  // 1. 3D DNA DOUBLE HELIX & ACTIVE GENE LOCUS (x = -1.40)
  // ============================================================================
  const dnaAnchor = new THREE.Group();
  dnaAnchor.position.set(-1.4, 0.02, 0.06);
  dnaAnchor.rotation.z = -0.15;
  group.add(dnaAnchor);

  const dnaSpinGroup = new THREE.Group();
  dnaAnchor.add(dnaSpinGroup);

  const helixHeight = 2.18;
  const helixRadius = 0.29;
  const turns = 2.25;
  const sampleCount = 48;

  const strandPtsA: THREE.Vector3[] = [];
  const strandPtsB: THREE.Vector3[] = [];
  for (let i = 0; i <= sampleCount; i++) {
    const u = i / sampleCount;
    const y = (u - 0.5) * helixHeight;
    const theta = u * Math.PI * 2 * turns;
    strandPtsA.push(new THREE.Vector3(Math.cos(theta) * helixRadius, y, Math.sin(theta) * helixRadius));
    strandPtsB.push(
      new THREE.Vector3(
        Math.cos(theta + Math.PI) * helixRadius,
        y,
        Math.sin(theta + Math.PI) * helixRadius
      )
    );
  }

  const curveA = new THREE.CatmullRomCurve3(strandPtsA);
  const curveB = new THREE.CatmullRomCurve3(strandPtsB);

  const tubeSegs = isSoftwareGl ? 56 : 80;
  const strandGeoA = new THREE.TubeGeometry(curveA, tubeSegs, 0.036, 10, false);
  const strandGeoB = new THREE.TubeGeometry(curveB, tubeSegs, 0.036, 10, false);

  const strandMatA = new THREE.MeshPhysicalMaterial({
    color: 0x059669,
    roughness: 0.2,
    metalness: 0.18,
    clearcoat: 0.85,
  });
  const strandMatB = new THREE.MeshPhysicalMaterial({
    color: 0x10b981,
    roughness: 0.22,
    metalness: 0.15,
    clearcoat: 0.85,
  });

  const meshStrandA = new THREE.Mesh(strandGeoA, strandMatA);
  const meshStrandB = new THREE.Mesh(strandGeoB, strandMatB);
  meshStrandA.renderOrder = 3;
  meshStrandB.renderOrder = 3;
  dnaSpinGroup.add(meshStrandA, meshStrandB);
  disposables.push(strandGeoA, strandGeoB, strandMatA, strandMatB);

  // 22 Base-Pair Rungs (with rungs 8..13 highlighted as the Active Gene / Enhancer Locus)
  const rungCount = 22;
  const rungGeo = new THREE.CylinderGeometry(0.019, 0.019, helixRadius * 1.94, 8);
  const rungMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.26,
    metalness: 0.14,
  });
  const rungInstanced = new THREE.InstancedMesh(rungGeo, rungMat, rungCount);
  rungInstanced.instanceColor = new THREE.InstancedBufferAttribute(
    new Float32Array(rungCount * 3),
    3
  );

  for (let i = 0; i < rungCount; i++) {
    const u = (i + 0.5) / rungCount;
    const y = (u - 0.5) * helixHeight;
    const theta = u * Math.PI * 2 * turns;
    _vA.set(Math.cos(theta) * helixRadius, y, Math.sin(theta) * helixRadius);
    _vB.set(Math.cos(theta + Math.PI) * helixRadius, y, Math.sin(theta + Math.PI) * helixRadius);
    _mid.addVectors(_vA, _vB).multiplyScalar(0.5);

    const dir = _vB.clone().sub(_vA).normalize();
    _quat.setFromUnitVectors(_up, dir);

    _dummy.position.copy(_mid);
    _dummy.quaternion.copy(_quat);
    _dummy.scale.setScalar(1);
    _dummy.updateMatrix();
    rungInstanced.setMatrixAt(i, _dummy.matrix);

    const isGeneLocus = i >= 8 && i <= 13;
    _color.setHex(isGeneLocus ? 0xf59e0b : i % 2 === 0 ? 0x6ee7b7 : 0x34d399);
    rungInstanced.setColorAt(i, _color);
  }
  rungInstanced.instanceMatrix.needsUpdate = true;
  rungInstanced.instanceColor.needsUpdate = true;
  rungInstanced.computeBoundingSphere();
  rungInstanced.renderOrder = 3;
  dnaSpinGroup.add(rungInstanced);
  disposables.push(rungGeo, rungMat);

  // Precision 3D Gene-Editing / TF Ring Clamp around Active Gene Locus
  const geneClampGroup = new THREE.Group();
  dnaAnchor.add(geneClampGroup);

  const clampRingGeo = new THREE.TorusGeometry(0.41, 0.02, 10, 40);
  const clampRingMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0xd97706,
    emissiveIntensity: 0.45,
    roughness: 0.25,
    metalness: 0.65,
  });
  const clampRing = new THREE.Mesh(clampRingGeo, clampRingMat);
  clampRing.rotation.x = Math.PI / 2;
  clampRing.renderOrder = 3;
  geneClampGroup.add(clampRing);

  const clampNodeGeo = new THREE.SphereGeometry(0.045, 12, 10);
  for (let k = 0; k < 3; k++) {
    const a = (k / 3) * Math.PI * 2;
    const node = new THREE.Mesh(clampNodeGeo, clampRingMat);
    node.position.set(Math.cos(a) * 0.41, 0, Math.sin(a) * 0.41);
    node.renderOrder = 3;
    geneClampGroup.add(node);
  }
  disposables.push(clampRingGeo, clampRingMat, clampNodeGeo);

  // ============================================================================
  // 2. CENTRAL MULTI-LAYERED 3D VIRTUAL CELL (x = 0.08, y = -0.02)
  // ============================================================================
  const cellGroup = new THREE.Group();
  cellGroup.position.set(0.08, -0.02, -0.02);
  group.add(cellGroup);

  // 2A: Inner Nucleolus + 3D Knotted Chromatin + Nuclear Envelope
  const nucleolusGeo = new THREE.SphereGeometry(0.11, 16, 14);
  const nucleolusMat = new THREE.MeshStandardMaterial({
    color: 0xfef3c7,
    emissive: 0x10b981,
    emissiveIntensity: 0.5,
    roughness: 0.2,
  });
  const nucleolusMesh = new THREE.Mesh(nucleolusGeo, nucleolusMat);
  nucleolusMesh.renderOrder = 2;
  cellGroup.add(nucleolusMesh);

  const chromatinGeo = new THREE.TorusKnotGeometry(
    0.19,
    0.026,
    isSoftwareGl ? 48 : 72,
    8,
    2,
    3
  );
  const chromatinMat = new THREE.MeshStandardMaterial({
    color: 0x6ee7b7,
    emissive: 0x059669,
    emissiveIntensity: 0.28,
    roughness: 0.32,
    metalness: 0.15,
  });
  const chromatinMesh = new THREE.Mesh(chromatinGeo, chromatinMat);
  chromatinMesh.renderOrder = 2;
  cellGroup.add(chromatinMesh);

  const nucleusGeo = new THREE.SphereGeometry(0.39, isSoftwareGl ? 20 : 28, 18);
  const nucleusMat = new THREE.MeshPhysicalMaterial({
    color: 0x047857,
    roughness: 0.18,
    metalness: 0.08,
    clearcoat: 0.9,
    transparent: true,
    opacity: 0.56,
    depthWrite: false,
  });
  const nucleusMesh = new THREE.Mesh(nucleusGeo, nucleusMat);
  nucleusMesh.renderOrder = 3;
  cellGroup.add(nucleusMesh);
  disposables.push(
    nucleolusGeo,
    nucleolusMat,
    chromatinGeo,
    chromatinMat,
    nucleusGeo,
    nucleusMat
  );

  // 2B: Cytoplasmic Mitochondria & Organelles (14 Capsule instances)
  const mitoCount = 14;
  const mitoGeo = new THREE.CapsuleGeometry(0.048, 0.105, 5, 10);
  const mitoMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.28,
    metalness: 0.12,
  });
  const mitoInstanced = new THREE.InstancedMesh(mitoGeo, mitoMat, mitoCount);
  mitoInstanced.instanceColor = new THREE.InstancedBufferAttribute(
    new Float32Array(mitoCount * 3),
    3
  );
  mitoInstanced.frustumCulled = false;
  mitoInstanced.renderOrder = 3;
  cellGroup.add(mitoInstanced);
  disposables.push(mitoGeo, mitoMat);

  // 2C: Outer Translucent Lipid-Bilayer Plasma Membrane + Cytoskeleton Contour Rings
  const membraneRadius = 0.88;
  const membraneGeo = new THREE.SphereGeometry(
    membraneRadius,
    isSoftwareGl ? 24 : 36,
    isSoftwareGl ? 18 : 26
  );
  const membraneMat = new THREE.MeshPhysicalMaterial({
    color: 0xa7f3d0,
    roughness: 0.08,
    metalness: 0.04,
    transmission: 0,
    transparent: true,
    opacity: isSoftwareGl ? 0.28 : 0.36,
    envMapIntensity: 1.35,
    clearcoat: 1.0,
    clearcoatRoughness: 0.06,
    depthWrite: false,
  });
  const membraneMesh = new THREE.Mesh(membraneGeo, membraneMat);
  membraneMesh.renderOrder = 4;
  cellGroup.add(membraneMesh);

  const cytoRingGeo = new THREE.TorusGeometry(membraneRadius + 0.012, 0.01, 8, 56);
  const cytoRingMat = new THREE.MeshStandardMaterial({
    color: 0x10b981,
    roughness: 0.3,
    metalness: 0.45,
    transparent: true,
    opacity: 0.55,
  });
  const cytoRingA = new THREE.Mesh(cytoRingGeo, cytoRingMat);
  cytoRingA.rotation.x = 0.35;
  cytoRingA.rotation.y = 0.22;
  cytoRingA.renderOrder = 4;
  const cytoRingB = new THREE.Mesh(cytoRingGeo, cytoRingMat);
  cytoRingB.rotation.x = -1.15;
  cytoRingB.rotation.z = 0.4;
  cytoRingB.renderOrder = 4;
  cellGroup.add(cytoRingA, cytoRingB);
  disposables.push(membraneGeo, membraneMat, cytoRingGeo, cytoRingMat);

  // 2C-bis: Outer 3D Spatial Microenvironment Niche Halo Ring (highlights during Cyto.Spatial)
  const spatialHaloGroup = new THREE.Group();
  cellGroup.add(spatialHaloGroup);

  const spatialHaloGeo = new THREE.TorusGeometry(membraneRadius + 0.16, 0.013, 10, 64);
  const spatialHaloMat = new THREE.MeshStandardMaterial({
    color: 0x0d9488,
    emissive: 0x0d9488,
    emissiveIntensity: 0.35,
    roughness: 0.28,
    metalness: 0.35,
    transparent: true,
    opacity: 0.62,
  });
  const spatialHaloRing = new THREE.Mesh(spatialHaloGeo, spatialHaloMat);
  spatialHaloRing.rotation.x = 0.22;
  spatialHaloRing.rotation.y = -0.18;
  spatialHaloRing.renderOrder = 3;
  spatialHaloGroup.add(spatialHaloRing);

  const nicheNodeGeo = new THREE.OctahedronGeometry(0.036, 0);
  const nicheNodeCount = 12;
  for (let i = 0; i < nicheNodeCount; i++) {
    const a = (i / nicheNodeCount) * Math.PI * 2;
    const nMesh = new THREE.Mesh(nicheNodeGeo, spatialHaloMat);
    nMesh.position.set(
      Math.cos(a) * (membraneRadius + 0.16),
      Math.sin(a) * (membraneRadius + 0.16),
      0
    );
    nMesh.renderOrder = 3;
    spatialHaloRing.add(nMesh);
  }
  disposables.push(spatialHaloGeo, spatialHaloMat, nicheNodeGeo);

  // 2D: 14 Transmembrane Y-Cup Surface Receptors around the Plasma Membrane
  const receptorStalkGeo = new THREE.CylinderGeometry(0.016, 0.02, 0.14, 8);
  const receptorCupGeo = new THREE.ConeGeometry(0.058, 0.075, 10, 1, true);
  const receptorActiveMat = new THREE.MeshStandardMaterial({
    color: 0x059669,
    emissive: 0x10b981,
    emissiveIntensity: 0.38,
    roughness: 0.25,
    metalness: 0.35,
    side: THREE.DoubleSide,
  });
  const receptorIdleMat = new THREE.MeshStandardMaterial({
    color: 0x64748b,
    roughness: 0.42,
    metalness: 0.25,
    side: THREE.DoubleSide,
  });
  disposables.push(receptorStalkGeo, receptorCupGeo, receptorActiveMat, receptorIdleMat);

  const receptorMeshes: { stalk: THREE.Mesh; cup: THREE.Mesh }[] = [];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const receptorCount = 14;
  for (let i = 0; i < receptorCount; i++) {
    const yNorm = 1 - (i / (receptorCount - 1)) * 1.75;
    const rad = Math.sqrt(Math.max(0.06, 1 - yNorm * yNorm));
    const theta = goldenAngle * i;
    const dir = new THREE.Vector3(
      Math.cos(theta) * rad,
      yNorm * 0.9,
      Math.sin(theta) * rad * 0.75
    ).normalize();

    const rGroup = new THREE.Group();
    rGroup.position.copy(dir).multiplyScalar(membraneRadius + 0.04);
    rGroup.quaternion.setFromUnitVectors(_up, dir);

    const stalk = new THREE.Mesh(receptorStalkGeo, receptorActiveMat);
    stalk.renderOrder = 4;
    const cup = new THREE.Mesh(receptorCupGeo, receptorActiveMat);
    cup.position.y = 0.09;
    cup.rotation.x = Math.PI; // Open cup facing outward to catch drug ligands
    cup.renderOrder = 4;

    rGroup.add(stalk, cup);
    cellGroup.add(rGroup);
    receptorMeshes.push({ stalk, cup });
  }

  // ============================================================================
  // 3. 3D DRUG CAPSULES & HEXAGONAL SMALL-MOLECULE LIGANDS (x = 1.65 -> 1.15)
  // ============================================================================
  const drugClusterGroup = new THREE.Group();
  group.add(drugClusterGroup);

  const capHalfGeo = new THREE.CapsuleGeometry(0.082, 0.11, 8, 14);
  const capBandGeo = new THREE.TorusGeometry(0.085, 0.014, 8, 24);
  const capWhiteMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    roughness: 0.14,
    metalness: 0.06,
    clearcoat: 1.0,
  });
  const capEmeraldMat = new THREE.MeshPhysicalMaterial({
    color: 0x059669,
    roughness: 0.16,
    metalness: 0.12,
    clearcoat: 1.0,
  });
  const capAmberMat = new THREE.MeshPhysicalMaterial({
    color: 0xf59e0b,
    roughness: 0.18,
    metalness: 0.12,
    clearcoat: 1.0,
  });
  const capGoldBandMat = new THREE.MeshStandardMaterial({
    color: 0xd1fae5,
    roughness: 0.25,
    metalness: 0.85,
  });
  disposables.push(
    capHalfGeo,
    capBandGeo,
    capWhiteMat,
    capEmeraldMat,
    capAmberMat,
    capGoldBandMat
  );

  // Build 3 two-tone pharmaceutical capsules
  const drugCapsules: {
    group: THREE.Group;
    startPos: THREE.Vector3;
    dockPos: THREE.Vector3;
    phase: number;
  }[] = [];

  const capsuleConfigs = [
    {
      start: new THREE.Vector3(1.68, 0.16, 0.18),
      dock: new THREE.Vector3(1.06, 0.14, 0.12),
      mat: capEmeraldMat,
      phase: 0,
    },
    {
      start: new THREE.Vector3(1.78, -0.26, 0.22),
      dock: new THREE.Vector3(1.06, -0.18, 0.16),
      mat: capAmberMat,
      phase: 1.6,
    },
    {
      start: new THREE.Vector3(1.64, -0.7, 0.1),
      dock: new THREE.Vector3(1.04, -0.48, 0.08),
      mat: capEmeraldMat,
      phase: 3.1,
    },
  ];

  capsuleConfigs.forEach((cfg) => {
    const cGrp = new THREE.Group();
    const topHalf = new THREE.Mesh(capHalfGeo, capWhiteMat);
    topHalf.position.y = 0.068;
    topHalf.scale.set(0.98, 0.72, 0.98);
    topHalf.renderOrder = 4;

    const botHalf = new THREE.Mesh(capHalfGeo, cfg.mat);
    botHalf.position.y = -0.068;
    botHalf.scale.set(1.0, 0.72, 1.0);
    botHalf.renderOrder = 4;

    const band = new THREE.Mesh(capBandGeo, capGoldBandMat);
    band.rotation.x = Math.PI / 2;
    band.renderOrder = 4;

    cGrp.add(topHalf, botHalf, band);
    cGrp.rotation.z = 0.95;
    cGrp.position.copy(cfg.start);
    drugClusterGroup.add(cGrp);

    drugCapsules.push({
      group: cGrp,
      startPos: cfg.start,
      dockPos: cfg.dock,
      phase: cfg.phase,
    });
  });

  // Build 4 Hexagonal Small-Molecule Chemical Rings (benzene/pharmacophore silhouettes)
  const hexRingGeo = new THREE.TorusGeometry(0.125, 0.022, 8, 6);
  const atomNodeGeo = new THREE.SphereGeometry(0.038, 10, 8);
  const hexChemMat = new THREE.MeshStandardMaterial({
    color: 0x10b981,
    emissive: 0x059669,
    emissiveIntensity: 0.22,
    roughness: 0.24,
    metalness: 0.35,
  });
  const atomAccentMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    roughness: 0.22,
    metalness: 0.25,
  });
  disposables.push(hexRingGeo, atomNodeGeo, hexChemMat, atomAccentMat);

  const hexMolecules: {
    group: THREE.Group;
    basePos: THREE.Vector3;
    phase: number;
  }[] = [];

  const hexPositions = [
    new THREE.Vector3(1.32, 0.26, -0.06),
    new THREE.Vector3(1.48, -0.06, -0.12),
    new THREE.Vector3(1.44, -0.46, -0.08),
    new THREE.Vector3(1.26, -0.84, 0.06),
  ];

  hexPositions.forEach((pos, idx) => {
    const hGrp = new THREE.Group();
    const ring = new THREE.Mesh(hexRingGeo, hexChemMat);
    ring.renderOrder = 4;
    hGrp.add(ring);

    for (let k = 0; k < 3; k++) {
      const a = (k / 3) * Math.PI * 2 + Math.PI / 6;
      const atom = new THREE.Mesh(atomNodeGeo, k === 0 ? atomAccentMat : hexChemMat);
      atom.position.set(Math.cos(a) * 0.145, Math.sin(a) * 0.145, 0);
      atom.renderOrder = 4;
      hGrp.add(atom);
    }

    hGrp.position.copy(pos);
    drugClusterGroup.add(hGrp);
    hexMolecules.push({ group: hGrp, basePos: pos, phase: idx * 1.3 });
  });

  // ============================================================================
  // 4. MULTI-SCALE SIGNALING CONDUITS (Gene->Cell & Drug->Receptor) + PULSES
  // ============================================================================
  const geneToCellCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-1.26, 0.08, 0.08),
    new THREE.Vector3(-0.78, 0.24, 0.16),
    new THREE.Vector3(-0.34, 0.1, 0.08),
    new THREE.Vector3(0.02, 0.0, 0.0),
  ]);

  const drugToCellCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(1.62, -0.04, 0.14),
    new THREE.Vector3(1.3, -0.02, 0.18),
    new THREE.Vector3(1.02, -0.02, 0.1),
    new THREE.Vector3(0.78, -0.02, 0.04),
  ]);

  const conduitMat = new THREE.MeshStandardMaterial({
    color: 0x34d399,
    emissive: 0x059669,
    emissiveIntensity: 0.3,
    roughness: 0.3,
    metalness: 0.3,
    transparent: true,
    opacity: 0.68,
  });
  const geneTubeGeo = new THREE.TubeGeometry(geneToCellCurve, 32, 0.014, 8, false);
  const drugTubeGeo = new THREE.TubeGeometry(drugToCellCurve, 28, 0.014, 8, false);
  const geneTubeMesh = new THREE.Mesh(geneTubeGeo, conduitMat);
  const drugTubeMesh = new THREE.Mesh(drugTubeGeo, conduitMat);
  geneTubeMesh.renderOrder = 3;
  drugTubeMesh.renderOrder = 3;
  group.add(geneTubeMesh, drugTubeMesh);

  const pulseGeo = new THREE.SphereGeometry(0.046, 12, 10);
  const genePulseMat = new THREE.MeshStandardMaterial({
    color: 0xfef3c7,
    emissive: 0xf59e0b,
    emissiveIntensity: 0.85,
    roughness: 0.15,
  });
  const drugPulseMat = new THREE.MeshStandardMaterial({
    color: 0xd1fae5,
    emissive: 0x10b981,
    emissiveIntensity: 0.85,
    roughness: 0.15,
  });
  const genePulseMesh = new THREE.Mesh(pulseGeo, genePulseMat);
  const drugPulseMesh = new THREE.Mesh(pulseGeo, drugPulseMat);
  genePulseMesh.renderOrder = 5;
  drugPulseMesh.renderOrder = 5;
  group.add(genePulseMesh, drugPulseMesh);
  disposables.push(geneTubeGeo, drugTubeGeo, conduitMat, pulseGeo, genePulseMat, drugPulseMat);

  let lastActiveReceptorCount = -1;
  let lastIsFibrotic: boolean | null = null;

  // ============================================================================
  // PER-FRAME UPDATE (Zero GC Allocations, 100% Periodic Closed-Loop over cyclePhase)
  // ============================================================================
  const update = (
    kin: BioInteriorKinematics,
    cyclePhase: number,
    mode: BioTaskScenario['specimenGeometryMode']
  ) => {
    const cycleTheta = cyclePhase * Math.PI * 2;

    // 1. DNA spin + active Gene Clamp periodic oscillation
    dnaSpinGroup.rotation.y = kin.dnaRotationY;
    geneClampGroup.position.y = kin.geneClampY;
    geneClampGroup.rotation.y = -cycleTheta * 2;
    clampRingMat.emissiveIntensity = kin.geneGlowIntensity;

    // 2. Virtual Cell gentle breathing, Identity-synced nuclear glow, and periodic mitochondria orbit
    cellGroup.scale.setScalar(kin.cellMembraneScale);
    chromatinMesh.rotation.x = cycleTheta;
    chromatinMesh.rotation.y = cycleTheta * 2;
    chromatinMat.emissiveIntensity = kin.nucleusGlowIntensity;
    nucleolusMat.emissiveIntensity = 0.32 + kin.nucleusGlowIntensity * 0.72;
    cytoRingA.rotation.z = cycleTheta;
    cytoRingB.rotation.y = -cycleTheta;

    spatialHaloGroup.rotation.z = -cycleTheta;
    spatialHaloMat.emissiveIntensity = kin.spatialHaloIntensity;
    spatialHaloMat.opacity = 0.34 + 0.52 * kin.spatialHaloIntensity;

    // Scenario tint nuance on nucleus/organelles (re-upload instance colors only when state changes)
    const isFibrotic = mode === 'alveolar_dome' && kin.receptorActiveRatio < 0.55;
    const colorChanged = isFibrotic !== lastIsFibrotic;
    lastIsFibrotic = isFibrotic;

    for (let i = 0; i < mitoCount; i++) {
      const orbitR = 0.54 + (i % 3) * 0.085;
      const harmonic = 1 + (i % 2);
      const a =
        (i / mitoCount) * Math.PI * 2 + cycleTheta * harmonic * (i % 2 === 0 ? 1 : -1);
      const tilt = Math.sin(i * 1.7 + cycleTheta * 2) * 0.34;

      _dummy.position.set(
        Math.cos(a) * orbitR,
        tilt,
        Math.sin(a) * orbitR * 0.65
      );
      _dummy.rotation.set(a * 0.7, cycleTheta * 2 + i, 0.5 + (i % 3) * 0.3);
      _dummy.scale.setScalar(0.9 + (i % 3) * 0.1);
      _dummy.updateMatrix();
      mitoInstanced.setMatrixAt(i, _dummy.matrix);

      if (colorChanged) {
        _color.setHex(
          isFibrotic
            ? i % 2 === 0
              ? 0xd97706
              : 0x94a3b8
            : i % 3 === 0
            ? 0xf59e0b
            : 0x10b981
        );
        mitoInstanced.setColorAt(i, _color);
      }
    }
    mitoInstanced.instanceMatrix.needsUpdate = true;
    if (colorChanged && mitoInstanced.instanceColor) {
      mitoInstanced.instanceColor.needsUpdate = true;
    }

    // Activate transmembrane surface receptors progressively across pipeline steps (dirty-checked)
    const activeCount = Math.round(receptorMeshes.length * kin.receptorActiveRatio);
    if (activeCount !== lastActiveReceptorCount) {
      lastActiveReceptorCount = activeCount;
      for (let i = 0; i < receptorMeshes.length; i++) {
        const mat = i < activeCount ? receptorActiveMat : receptorIdleMat;
        receptorMeshes[i].stalk.material = mat;
        receptorMeshes[i].cup.material = mat;
      }
    }

    // 3. Drug capsules & hexagonal pharmacophores docking toward cell membrane (periodic harmonics)
    for (let i = 0; i < drugCapsules.length; i++) {
      const dc = drugCapsules[i];
      dc.group.position.lerpVectors(dc.startPos, dc.dockPos, kin.drugDockProgress);
      dc.group.position.y += Math.sin(cycleTheta * 3 + dc.phase) * 0.042;
      dc.group.rotation.x = Math.sin(cycleTheta * 2 + dc.phase) * 0.26;
      dc.group.rotation.y = cycleTheta * 2 + dc.phase;
    }

    for (let i = 0; i < hexMolecules.length; i++) {
      const hm = hexMolecules[i];
      const pullX = -0.26 * kin.drugDockProgress;
      hm.group.position.set(
        hm.basePos.x + pullX,
        hm.basePos.y + Math.cos(cycleTheta * 3 + hm.phase) * 0.038,
        hm.basePos.z + Math.sin(cycleTheta * 2 + hm.phase) * 0.03
      );
      hm.group.rotation.z = cycleTheta + hm.phase;
      hm.group.rotation.y = Math.sin(cycleTheta * 2 + hm.phase) * 0.42;
    }

    // 4. Signal packets gliding along Gene->Nucleus and Drug->Receptor conduits with smooth endpoint fade
    geneToCellCurve.getPointAt(kin.geneSignalU, genePulseMesh.position);
    genePulseMesh.scale.setScalar(Math.max(0.01, 0.35 + 0.85 * kin.geneSignalAlpha));
    genePulseMat.emissiveIntensity = 0.25 + 0.9 * kin.geneSignalAlpha;

    drugToCellCurve.getPointAt(kin.drugSignalU, drugPulseMesh.position);
    drugPulseMesh.scale.setScalar(Math.max(0.01, 0.35 + 0.85 * kin.drugSignalAlpha));
    drugPulseMat.emissiveIntensity = 0.25 + 0.9 * kin.drugSignalAlpha;
  };

  return { group, update };
}
