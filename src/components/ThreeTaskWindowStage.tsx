import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import {
  BioTaskScenario,
  CYCLE_DURATION_SEC,
  STEP_DURATION_SEC,
  computeBioInteriorKinematics,
  computeBoardTetherStart,
  computeCycleLoopState,
  computeWindowLayerTargets,
} from '../lib/bioTaskScenarios';
import { buildVirtualCellInterior } from '../lib/virtualCell3DBuilder';
import { Lang } from '../lib/cytoDomain';

interface ThreeTaskWindowStageProps {
  scenario: BioTaskScenario;
  lang: Lang;
  pausedByScroll: boolean;
}

const _targetCamPos = new THREE.Vector3();
const _targetLookAt = new THREE.Vector3();
const _currentLookAt = new THREE.Vector3(0, -0.01, 0);
const _pointerNdc = new THREE.Vector2();
const _tetherStart = new THREE.Vector3();
const _tetherEnd = new THREE.Vector3();
const _tetherMid = new THREE.Vector3();
const _tetherDir = new THREE.Vector3();
const _upAxis = new THREE.Vector3(0, 1, 0);
const _tetherQuat = new THREE.Quaternion();
const _boardPosTuple: [number, number, number] = [0, 0, 0];
const _anchorPosTuple: [number, number, number] = [0, 0, 0];
const _tetherOutTuple: [number, number, number] = [0, 0, 0];

const BOARD_WORLD_W = 1.4;
const BOARD_WORLD_H = 0.94;
const BOARD_INNER_W = BOARD_WORLD_W - 0.07;
const BOARD_INNER_H = BOARD_WORLD_H - 0.07;
const BOARD_CANVAS_W = 640;
const BOARD_CANVAS_H = 430;
const BAR_START_PX_X = 24;
const BAR_PX_Y = 392;
const BAR_PX_H = 12;
const BAR_GAP_PX = 10;
const BAR_SEG_PX_W = (BOARD_CANVAS_W - 48 - BAR_GAP_PX * 3) / 4;

function configureFlatUiTexture(tex: THREE.CanvasTexture): void {
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.generateMipmaps = false;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
}

function createRoundedRectShape(width: number, height: number, radius: number): THREE.Shape {
  const shape = new THREE.Shape();
  const x = -width / 2;
  const y = -height / 2;
  const r = Math.min(radius, width / 2, height / 2);

  shape.moveTo(x + r, y);
  shape.lineTo(x + width - r, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + r);
  shape.lineTo(x + width, y + height - r);
  shape.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  shape.lineTo(x + r, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);
  return shape;
}

function createBezelFrameShape(
  width: number,
  height: number,
  radius: number,
  border: number
): THREE.Shape {
  const outer = createRoundedRectShape(width, height, radius);
  const innerW = width - border * 2;
  const innerH = height - border * 2;
  const innerR = Math.max(0.03, radius - border * 0.85);
  const hole = new THREE.Path();
  const x = -innerW / 2;
  const y = -innerH / 2;

  hole.moveTo(x + innerR, y);
  hole.lineTo(x + innerW - innerR, y);
  hole.quadraticCurveTo(x + innerW, y, x + innerW, y + innerR);
  hole.lineTo(x + innerW, y + innerH - innerR);
  hole.quadraticCurveTo(x + innerW, y + innerH, x + innerW - innerR, y + innerH);
  hole.lineTo(x + innerR, y + innerH);
  hole.quadraticCurveTo(x, y + innerH, x, y + innerH - innerR);
  hole.lineTo(x, y + innerR);
  hole.quadraticCurveTo(x, y, x + innerR, y);

  outer.holes.push(hole);
  return outer;
}

function createContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(128, 128, 14, 128, 128, 124);
    grad.addColorStop(0, 'rgba(6, 78, 59, 0.32)');
    grad.addColorStop(0.55, 'rgba(16, 185, 129, 0.11)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);
  }
  const tex = new THREE.CanvasTexture(canvas);
  configureFlatUiTexture(tex);
  return tex;
}

function wrapCanvasLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number
): string[] {
  const hasSpaces = text.includes(' ');
  const tokens = hasSpaces ? text.split(' ') : Array.from(text);
  const joiner = hasSpaces ? ' ' : '';
  const lines: string[] = [];
  let current = '';

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const candidate = current ? `${current}${joiner}${token}` : token;
    if (ctx.measureText(candidate).width <= maxWidth || !current) {
      current = candidate;
    } else {
      lines.push(current);
      current = token;
      if (lines.length === maxLines - 1) {
        const rest = tokens.slice(i + 1).join(joiner);
        let tail = rest ? `${current}${joiner}${rest}` : current;
        while (tail.length > 2 && ctx.measureText(tail).width > maxWidth) {
          tail = tail.slice(0, -1);
        }
        lines.push(tail);
        return lines;
      }
    }
  }
  if (current) {
    lines.push(current);
  }
  return lines.slice(0, maxLines);
}

function drawBackGridTexture(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, 'rgba(209, 250, 229, 0.45)');
  bg.addColorStop(0.5, 'rgba(240, 253, 244, 0.3)');
  bg.addColorStop(1, 'rgba(167, 243, 208, 0.42)');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = 'rgba(5, 150, 105, 0.12)';
  ctx.lineWidth = 1.5;
  const step = 52;
  for (let x = step; x < w; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = step; y < h; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  // Concentric spatial niche rings centered behind the Virtual Cell
  ctx.strokeStyle = 'rgba(5, 150, 105, 0.2)';
  ctx.setLineDash([8, 8]);
  [140, 230, 320].forEach((r) => {
    ctx.beginPath();
    ctx.arc(w * 0.53, h * 0.51, r, 0, Math.PI * 2);
    ctx.stroke();
  });
  ctx.setLineDash([]);
}

function drawMainWindowOverlay(
  canvas: HTMLCanvasElement,
  scenario: BioTaskScenario,
  stepIdx: number,
  lang: Lang
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  const activeStep = scenario.steps[stepIdx] ?? scenario.steps[0];
  const zone = activeStep.windowZone;

  // Compact top-left optical wet-lab chamber telemetry stamp
  ctx.fillStyle = 'rgba(255, 255, 255, 0.78)';
  ctx.fillRect(28, 22, 410, 44);
  ctx.strokeStyle = 'rgba(5, 150, 105, 0.28)';
  ctx.lineWidth = 1.8;
  ctx.strokeRect(28, 22, 410, 44);

  const ringColors = ['#059669', '#10b981', '#6ee7b7'];
  ringColors.forEach((c, idx) => {
    ctx.beginPath();
    ctx.arc(48 + idx * 16, 44, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = c;
    ctx.fill();
  });

  ctx.font = '700 15px "JetBrains Mono", monospace';
  ctx.fillStyle = '#064e3b';
  ctx.fillText('CYTO CHAMBER · 37.0°C · 5% CO₂ · pH 7.4', 100, 49);

  // Subtle corner optical alignment fiducials + bottom-left microscope scale bar
  ctx.strokeStyle = 'rgba(5, 150, 105, 0.34)';
  ctx.lineWidth = 1.8;
  const f = 18;
  const pad = 18;
  // Top-right fiducial
  ctx.beginPath();
  ctx.moveTo(w - pad - f, pad);
  ctx.lineTo(w - pad, pad);
  ctx.lineTo(w - pad, pad + f);
  // Bottom-left fiducial
  ctx.moveTo(pad, h - pad - f);
  ctx.lineTo(pad, h - pad);
  ctx.lineTo(pad + f, h - pad);
  // Bottom-right fiducial
  ctx.moveTo(w - pad - f, h - pad);
  ctx.lineTo(w - pad, h - pad);
  ctx.lineTo(w - pad, h - pad - f);
  ctx.stroke();

  // Optical scale bar (bottom-left inside chamber glass)
  if (zone !== 'bottom-left') {
    const sx = 34;
    const sy = h - 34;
    ctx.strokeStyle = 'rgba(6, 78, 59, 0.55)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + 110, sy);
    ctx.moveTo(sx, sy - 6);
    ctx.lineTo(sx, sy + 2);
    ctx.moveTo(sx + 55, sy - 4);
    ctx.lineTo(sx + 55, sy + 2);
    ctx.moveTo(sx + 110, sy - 6);
    ctx.lineTo(sx + 110, sy + 2);
    ctx.stroke();
    ctx.font = '600 13px "JetBrains Mono", monospace';
    ctx.fillStyle = 'rgba(6, 78, 59, 0.72)';
    ctx.fillText('100 μm', sx + 118, sy + 4);
  }

  // Quiet reference micro-callouts on glass for non-occluded elements
  const drawCallout = (
    anchorX: number,
    anchorY: number,
    labelX: number,
    labelY: number,
    tag: string,
    accent: string
  ) => {
    ctx.strokeStyle = accent;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(anchorX, anchorY, 5.5, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(anchorX, anchorY);
    ctx.lineTo(labelX, labelY);
    ctx.stroke();

    ctx.font = '600 17px "Plus Jakarta Sans", "Noto Sans SC", sans-serif';
    const textW = ctx.measureText(tag).width + 22;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.fillRect(labelX - textW / 2, labelY - 16, textW, 30);
    ctx.strokeStyle = accent;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(labelX - textW / 2, labelY - 16, textW, 30);

    ctx.fillStyle = '#064e3b';
    ctx.textAlign = 'center';
    ctx.fillText(tag, labelX, labelY + 5);
    ctx.textAlign = 'left';
  };

  // 1. DNA / Gene Locus micro-tag (top of helix; hidden when top-left board occupies upper-left)
  if (zone !== 'top-left') {
    drawCallout(
      w * 0.21,
      h * 0.34,
      w * 0.2,
      h * 0.17,
      lang === 'zh' ? 'DNA · 基因位点' : 'DNA · Gene Locus',
      'rgba(217, 119, 6, 0.65)'
    );
  }

  // 2. Virtual Cell micro-tag (bottom-center; hidden when bottom-center board occupies it)
  if (zone !== 'bottom-center') {
    drawCallout(
      w * 0.52,
      h * 0.67,
      w * 0.52,
      h * 0.88,
      lang === 'zh' ? '虚拟细胞' : 'Virtual Cell',
      'rgba(5, 150, 105, 0.65)'
    );
  }

  // 3. Targeted Drug / Ligand micro-tag (lower-right; clear of all 5 board zones)
  drawCallout(
    w * 0.79,
    h * 0.64,
    w * 0.81,
    h * 0.88,
    lang === 'zh' ? '靶向药物 · 小分子配体' : 'Drug · Ligand Stream',
    'rgba(16, 185, 129, 0.68)'
  );
}

function drawModelPillCard(
  canvas: HTMLCanvasElement,
  stepNo: string,
  moduleName: string,
  tierTag: string,
  accentColorCss: string,
  isActive: boolean
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  const isAmber = accentColorCss === '#d97706';
  ctx.fillStyle = isActive
    ? isAmber
      ? 'rgba(255, 251, 235, 0.97)'
      : 'rgba(236, 253, 245, 0.97)'
    : 'rgba(255, 255, 255, 0.88)';
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = isActive ? accentColorCss : 'rgba(15, 41, 30, 0.16)';
  ctx.lineWidth = isActive ? 8 : 3;
  ctx.strokeRect(4, 4, w - 8, h - 8);

  ctx.fillStyle = isActive ? accentColorCss : '#d1fae5';
  ctx.fillRect(20, 20, 64, h - 40);

  ctx.font = '700 28px "JetBrains Mono", monospace';
  ctx.fillStyle = isActive ? '#ffffff' : '#065f46';
  ctx.textAlign = 'center';
  ctx.fillText(stepNo, 52, h / 2 + 10);
  ctx.textAlign = 'left';

  ctx.font = '700 30px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = isActive ? '#064e3b' : '#1e3a2f';
  ctx.fillText(moduleName, 104, 62);

  ctx.font = '600 19px "JetBrains Mono", monospace';
  ctx.fillStyle = isActive ? accentColorCss : '#64748b';
  ctx.fillText(tierTag, 104, 96);
}

/**
 * Spatially-Anchored 3D Glass Model Explanation Board:
 * Relocates around the 3D Task Window to sit adjacent to the active Virtual Cell element
 * (DNA Locus, Spatial Niche Ring, Cell Nucleus, or Drug-Receptor Docking), displaying the
 * matched element label, active model metric, role headline, and wrapped mechanism summary.
 */
function drawDynamicModelRoleBoard(
  canvas: HTMLCanvasElement,
  scenario: BioTaskScenario,
  activeStepIdx: number,
  lang: Lang
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const w = canvas.width; // 640
  const h = canvas.height; // 430
  ctx.clearRect(0, 0, w, h);

  const st = scenario.steps[activeStepIdx] ?? scenario.steps[0];
  const isAmber = st.accentColorCss === '#d97706';

  // Crisp Glass Surface + Accent Frame
  ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = isAmber ? 'rgba(217, 119, 6, 0.62)' : 'rgba(5, 150, 105, 0.54)';
  ctx.lineWidth = 5;
  ctx.strokeRect(4, 4, w - 8, h - 8);

  // Top Header Strip: Active Model Name (left) + Spatially Matched 3D Element Label (right)
  ctx.fillStyle = isAmber ? 'rgba(254, 243, 199, 0.82)' : 'rgba(236, 253, 245, 0.96)';
  ctx.fillRect(7, 7, w - 14, 58);

  ctx.font = '700 22px "JetBrains Mono", monospace';
  ctx.fillStyle = '#064e3b';
  ctx.textAlign = 'left';
  ctx.fillText(`${st.stepNo} · ${st.moduleName}`, 24, 44);

  ctx.font = '700 18px "Plus Jakarta Sans", "Noto Sans SC", sans-serif';
  ctx.fillStyle = st.accentColorCss;
  ctx.textAlign = 'right';
  ctx.fillText(`⌖ ${st.targetElementLabel[lang]}`, w - 24, 43);
  ctx.textAlign = 'left';

  ctx.fillStyle = 'rgba(15, 41, 30, 0.08)';
  ctx.fillRect(7, 65, w - 14, 2);

  // Primary Dynamic Metric + Stage Readout
  ctx.font = '700 64px "JetBrains Mono", "Plus Jakarta Sans", "Noto Sans SC", monospace';
  ctx.fillStyle = st.accentColorCss;
  ctx.fillText(st.boardMetric, 24, 144);

  ctx.font = '600 17px "Plus Jakarta Sans", "Noto Sans SC", sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.textAlign = 'right';
  ctx.fillText(st.tierBadge[lang], w - 24, 114);

  ctx.font = '600 18px "JetBrains Mono", monospace';
  ctx.fillStyle = '#334155';
  ctx.fillText(st.readoutMetric, w - 24, 144);
  ctx.textAlign = 'left';

  // Active Model Role Headline
  ctx.font = '700 27px "Plus Jakarta Sans", "Noto Sans SC", sans-serif';
  ctx.fillStyle = '#0c261b';
  ctx.fillText(st.roleHeadline[lang], 24, 194);

  // Wrapped 2–3 Line Biological Action Explanation
  ctx.font = '500 20px "Plus Jakarta Sans", "Noto Sans SC", sans-serif';
  ctx.fillStyle = '#334155';
  const detailLines = wrapCanvasLines(ctx, st.roleDetail[lang], w - 48, 3);
  detailLines.forEach((line, idx) => {
    ctx.fillText(line, 24, 234 + idx * 31);
  });

  // Bottom 4-Segment Self-Looping Cycle Bar
  ctx.fillStyle = 'rgba(15, 41, 30, 0.08)';
  ctx.fillRect(24, 344, w - 48, 2);

  ctx.font = '600 17px "Plus Jakarta Sans", "Noto Sans SC", sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.fillText(
    lang === 'zh' ? '空间锚定流转 · 自动循环推演' : 'ELEMENT-MATCHED · AUTO-LOOP',
    24,
    375
  );

  ctx.font = '700 17px "JetBrains Mono", monospace';
  ctx.fillStyle = st.accentColorCss;
  ctx.textAlign = 'right';
  ctx.fillText(`${activeStepIdx + 1} / 4`, w - 24, 375);
  ctx.textAlign = 'left';

  for (let i = 0; i < 4; i++) {
    const sx = BAR_START_PX_X + i * (BAR_SEG_PX_W + BAR_GAP_PX);
    ctx.fillStyle = i < activeStepIdx ? 'rgba(5, 150, 105, 0.36)' : 'rgba(15, 41, 30, 0.1)';
    ctx.fillRect(sx, BAR_PX_Y, BAR_SEG_PX_W, BAR_PX_H);
  }
}

export const ThreeTaskWindowStage: React.FC<ThreeTaskWindowStageProps> = ({
  scenario,
  lang,
  pausedByScroll,
}) => {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);

  const [activeStepIdx, setActiveStepIdx] = useState(0);
  const [webglFallback, setWebglFallback] = useState(false);

  const wakeLoopRef = useRef<(() => void) | null>(null);

  const stateRef = useRef({
    scenario,
    lang,
    activeStepIdx: 0,
    pausedByScroll,
    phaseOffsetSec: 0,
    lastElapsedSec: 0,
    pointerTiltX: 0,
    pointerTiltY: 0,
    staticHudDirty: true,
    boardDirty: true,
  });

  // Sync props into mutable ref without tearing down WebGL context
  useEffect(() => {
    const prevScenarioId = stateRef.current.scenario.id;
    const wasPaused = stateRef.current.pausedByScroll;
    stateRef.current.scenario = scenario;
    stateRef.current.lang = lang;
    stateRef.current.pausedByScroll = pausedByScroll;

    if (prevScenarioId !== scenario.id) {
      stateRef.current.phaseOffsetSec = -stateRef.current.lastElapsedSec;
      stateRef.current.activeStepIdx = 0;
      setActiveStepIdx(0);
    }

    stateRef.current.staticHudDirty = true;
    stateRef.current.boardDirty = true;

    if (wasPaused && !pausedByScroll) {
      wakeLoopRef.current?.();
    }
  }, [scenario, lang, pausedByScroll]);

  useEffect(() => {
    const mountEl = canvasMountRef.current;
    if (!mountEl) return;

    const isSoftwareGl = (() => {
      try {
        const probeCanvas = document.createElement('canvas');
        const gl = probeCanvas.getContext('webgl2') || probeCanvas.getContext('webgl');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglFallback(true);
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 1.75));
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(0xf4fbf7, 0);

    const initW = Math.max(320, mountEl.clientWidth || 920);
    const initH = Math.max(360, mountEl.clientHeight || 720);
    renderer.setSize(initW, initH);

    mountEl.innerHTML = '';
    mountEl.appendChild(renderer.domElement);

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      setWebglFallback(true);
    };
    const handleContextRestored = () => {
      setWebglFallback(false);
    };
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', handleContextRestored);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xf2faf6, 0.028);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envRT = pmremGenerator.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envRT.texture;
    pmremGenerator.dispose();

    const initAspect = initW / initH;
    const initTargets = computeWindowLayerTargets('overview', 0, initAspect);
    const camera = new THREE.PerspectiveCamera(36, initAspect, 0.1, 60);
    camera.position.set(
      initTargets.cameraPos[0],
      initTargets.cameraPos[1],
      initTargets.cameraPos[2]
    );
    _currentLookAt.set(initTargets.lookAt[0], initTargets.lookAt[1], initTargets.lookAt[2]);
    camera.lookAt(_currentLookAt);

    // Studio 3-Point Warm/Cool Rig
    const hemiLight = new THREE.HemisphereLight(0xecfdf5, 0xd1fae5, 1.18);
    hemiLight.position.set(0, 8, 0);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfffbeb, 1.8);
    keyLight.position.set(4.8, 6.5, 5.8);
    if (!isSoftwareGl) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(1024, 1024);
      const d = 4.8;
      keyLight.shadow.camera.left = -d;
      keyLight.shadow.camera.right = d;
      keyLight.shadow.camera.top = d;
      keyLight.shadow.camera.bottom = -d;
      keyLight.shadow.camera.near = 0.5;
      keyLight.shadow.camera.far = 20;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x34d399, 1.15);
    rimLight.position.set(-4.8, 3.4, -3.6);
    scene.add(rimLight);

    if (!isSoftwareGl) {
      RectAreaLightUniformsLib.init();
      const softbox = new THREE.RectAreaLight(0xffffff, 2.8, 5.6, 3.4);
      softbox.position.set(-2.6, 4.0, 4.4);
      softbox.lookAt(0, 0, 0);
      scene.add(softbox);
    }

    const disposables: { dispose: () => void }[] = [envRT];

    // Symmetrically Centered Hero Assembly
    const rootAssembly = new THREE.Group();
    rootAssembly.position.set(0, 0.02, 0);
    scene.add(rootAssembly);

    // PART 1: Grounded Studio Pedestal & Radial Contact Shadow
    const platformGeo = new THREE.CylinderGeometry(3.05, 3.25, 0.05, 56);
    const platformMat = new THREE.MeshStandardMaterial({
      color: 0xeaf6f0,
      roughness: 0.68,
      metalness: 0.08,
    });
    const platformMesh = new THREE.Mesh(platformGeo, platformMat);
    platformMesh.position.set(0, -1.84, 0);
    platformMesh.receiveShadow = !isSoftwareGl;
    rootAssembly.add(platformMesh);

    const shadowTex = createContactShadowTexture();
    const shadowGeo = new THREE.CircleGeometry(2.92, 40);
    shadowGeo.rotateX(-Math.PI / 2);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.65,
    });
    const shadowDisc = new THREE.Mesh(shadowGeo, shadowMat);
    shadowDisc.position.set(0, -1.8, 0.08);
    rootAssembly.add(shadowDisc);
    disposables.push(platformGeo, platformMat, shadowTex, shadowGeo, shadowMat);

    // PART 2: Wide Back Frosted Emerald Glass Plane + Spatial Grid
    const backGlassGroup = new THREE.Group();
    backGlassGroup.position.set(0, 0.06, -0.78);
    rootAssembly.add(backGlassGroup);

    const backShape = createRoundedRectShape(5.02, 3.2, 0.2);
    const backGeo = new THREE.ExtrudeGeometry(backShape, {
      depth: 0.05,
      bevelEnabled: true,
      bevelThickness: 0.018,
      bevelSize: 0.018,
      bevelSegments: 3,
    });
    backGeo.center();
    const backGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0xd1fae5,
      roughness: 0.22,
      metalness: 0.05,
      transmission: 0,
      transparent: true,
      opacity: isSoftwareGl ? 0.4 : 0.56,
      envMapIntensity: 1.15,
      clearcoat: 0.85,
      depthWrite: false,
    });
    const backGlassMesh = new THREE.Mesh(backGeo, backGlassMat);
    backGlassMesh.renderOrder = 1;
    backGlassGroup.add(backGlassMesh);

    const backGridCanvas = document.createElement('canvas');
    backGridCanvas.width = 1024;
    backGridCanvas.height = 640;
    drawBackGridTexture(backGridCanvas);
    const backGridTex = new THREE.CanvasTexture(backGridCanvas);
    configureFlatUiTexture(backGridTex);

    const backGridGeo = new THREE.PlaneGeometry(4.84, 3.02);
    const backGridMat = new THREE.MeshBasicMaterial({
      map: backGridTex,
      transparent: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
    const backGridPlane = new THREE.Mesh(backGridGeo, backGridMat);
    backGridPlane.position.z = 0.046;
    backGridPlane.renderOrder = 1;
    backGlassGroup.add(backGridPlane);
    disposables.push(backGeo, backGlassMat, backGridTex, backGridGeo, backGridMat);

    // PART 3: Interior Virtual Cell Biological Chamber (DNA/Gene + Spatial Halo + Virtual Cell + Drug Molecules)
    const specimenGroup = new THREE.Group();
    specimenGroup.position.set(0, 0.02, -0.06);
    rootAssembly.add(specimenGroup);

    const bioInterior = buildVirtualCellInterior(isSoftwareGl, disposables);
    specimenGroup.add(bioInterior.group);

    // PART 4 & 5: Centered Foreground Optical-Crystal Task Window + Anodized Bezel
    const mainWindowGroup = new THREE.Group();
    mainWindowGroup.position.set(0, 0.02, 0.46);
    rootAssembly.add(mainWindowGroup);

    const glassShape = createRoundedRectShape(4.86, 3.1, 0.18);
    const glassGeo = new THREE.ExtrudeGeometry(glassShape, {
      depth: 0.075,
      bevelEnabled: true,
      bevelThickness: 0.024,
      bevelSize: 0.024,
      bevelSegments: 4,
    });
    glassGeo.center();
    const crystalGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0xf7fef9,
      roughness: 0.05,
      metalness: 0.04,
      transmission: isSoftwareGl ? 0 : 0.92,
      transparent: true,
      opacity: isSoftwareGl ? 0.2 : 1.0,
      ior: 1.52,
      thickness: 1.1,
      attenuationColor: new THREE.Color(0xd1fae5),
      attenuationDistance: 2.8,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04,
      depthWrite: false,
    });
    const mainGlassMesh = new THREE.Mesh(glassGeo, crystalGlassMat);
    mainGlassMesh.renderOrder = 6;
    mainWindowGroup.add(mainGlassMesh);

    const bezelShape = createBezelFrameShape(4.96, 3.2, 0.2, 0.056);
    const bezelGeo = new THREE.ExtrudeGeometry(bezelShape, {
      depth: 0.098,
      bevelEnabled: true,
      bevelThickness: 0.016,
      bevelSize: 0.016,
      bevelSegments: 3,
    });
    bezelGeo.center();
    const brushedMetalMat = new THREE.MeshStandardMaterial({
      color: 0xd4eae0,
      roughness: 0.36,
      metalness: 0.85,
    });
    const bezelMesh = new THREE.Mesh(bezelGeo, brushedMetalMat);
    bezelMesh.castShadow = !isSoftwareGl;
    bezelMesh.renderOrder = 7;
    mainWindowGroup.add(bezelMesh);

    // 4 Machined Emerald-Titanium Corner Clamps + Recessed Silicone Gasket + Wet-Lab Bioreactor Hardware
    const gasketShape = createBezelFrameShape(4.84, 3.08, 0.17, 0.022);
    const gasketGeo = new THREE.ExtrudeGeometry(gasketShape, {
      depth: 0.11,
      bevelEnabled: false,
    });
    gasketGeo.center();
    const gasketMat = new THREE.MeshStandardMaterial({
      color: 0x064e3b,
      roughness: 0.72,
      metalness: 0.12,
    });
    const gasketMesh = new THREE.Mesh(gasketGeo, gasketMat);
    gasketMesh.renderOrder = 7;
    mainWindowGroup.add(gasketMesh);

    const claspGeo = new THREE.BoxGeometry(0.32, 0.11, 0.16);
    const claspMat = new THREE.MeshStandardMaterial({
      color: 0x059669,
      roughness: 0.28,
      metalness: 0.72,
    });
    const boltGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.18, 6);
    boltGeo.rotateX(Math.PI / 2);
    const stainlessMat = new THREE.MeshStandardMaterial({
      color: 0xe2ece7,
      roughness: 0.24,
      metalness: 0.9,
    });
    const darkAnodizedMat = new THREE.MeshStandardMaterial({
      color: 0x0d3b2c,
      roughness: 0.42,
      metalness: 0.62,
    });

    const claspPositions: [number, number][] = [
      [-2.26, 1.54],
      [2.26, 1.54],
      [-2.26, -1.54],
      [2.26, -1.54],
    ];
    claspPositions.forEach(([cx, cy]) => {
      const clasp = new THREE.Mesh(claspGeo, claspMat);
      clasp.position.set(cx, cy, 0.01);
      clasp.renderOrder = 7;
      mainWindowGroup.add(clasp);

      [-0.095, 0.095].forEach((bx) => {
        const bolt = new THREE.Mesh(boltGeo, stainlessMat);
        bolt.position.set(cx + bx, cy, 0.012);
        bolt.renderOrder = 8;
        mainWindowGroup.add(bolt);
      });
    });

    // Top Environmental Control Manifold Rail (CO2 / O2 / Temp sensor housing + micro status pips)
    const topRailGeo = new THREE.BoxGeometry(1.72, 0.11, 0.15);
    const topRail = new THREE.Mesh(topRailGeo, darkAnodizedMat);
    topRail.position.set(0.18, 1.64, -0.02);
    topRail.renderOrder = 7;
    mainWindowGroup.add(topRail);

    const valveGeo = new THREE.CylinderGeometry(0.036, 0.044, 0.14, 16);
    [-0.45, 0.82].forEach((vx) => {
      const valve = new THREE.Mesh(valveGeo, stainlessMat);
      valve.position.set(vx, 1.74, -0.02);
      valve.renderOrder = 7;
      mainWindowGroup.add(valve);
    });

    const ledGeo = new THREE.SphereGeometry(0.022, 12, 12);
    const ledMat = new THREE.MeshBasicMaterial({ color: 0x34d399 });
    [-0.12, 0.04, 0.2].forEach((lx) => {
      const led = new THREE.Mesh(ledGeo, ledMat);
      led.position.set(lx, 1.64, 0.062);
      led.renderOrder = 8;
      mainWindowGroup.add(led);
    });

    // Right-Side Microfluidic Perfusion Ports + Capillary Feed Tubes (wet-lab reagent inlet/outlet)
    const portBaseGeo = new THREE.CylinderGeometry(0.068, 0.078, 0.16, 18);
    portBaseGeo.rotateZ(Math.PI / 2);
    const collarGeo = new THREE.CylinderGeometry(0.052, 0.052, 0.12, 16);
    collarGeo.rotateZ(Math.PI / 2);
    const tubeMat = new THREE.MeshPhysicalMaterial({
      color: 0x6ee7b7,
      roughness: 0.16,
      metalness: 0.05,
      transparent: true,
      opacity: 0.65,
      clearcoat: 0.9,
    });
    const tubeGeos: THREE.BufferGeometry[] = [];
    [0.52, -0.52].forEach((py, idx) => {
      const port = new THREE.Mesh(portBaseGeo, stainlessMat);
      port.position.set(2.53, py, -0.04);
      port.renderOrder = 7;
      mainWindowGroup.add(port);

      const collar = new THREE.Mesh(collarGeo, claspMat);
      collar.position.set(2.63, py, -0.04);
      collar.renderOrder = 7;
      mainWindowGroup.add(collar);

      const dir = idx === 0 ? 1 : -1;
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(2.68, py, -0.04),
        new THREE.Vector3(2.86, py + dir * 0.06, -0.14),
        new THREE.Vector3(2.82, py - dir * 0.28, -0.44),
        new THREE.Vector3(2.58, py - dir * 0.44, -0.68),
      ]);
      const tGeo = new THREE.TubeGeometry(curve, 20, 0.024, 10, false);
      tubeGeos.push(tGeo);
      const tube = new THREE.Mesh(tGeo, tubeMat);
      tube.renderOrder = 6;
      mainWindowGroup.add(tube);
    });

    // Bottom Precision Microscope Stage Brackets + Micrometer Alignment Dials
    const stageFootGeo = new THREE.BoxGeometry(0.46, 0.16, 0.24);
    const stageRailGeo = new THREE.BoxGeometry(4.1, 0.085, 0.34);
    const stageRail = new THREE.Mesh(stageRailGeo, darkAnodizedMat);
    stageRail.position.set(0, -1.73, -0.04);
    stageRail.renderOrder = 7;
    mainWindowGroup.add(stageRail);

    [-1.44, 1.44].forEach((fx) => {
      const foot = new THREE.Mesh(stageFootGeo, stainlessMat);
      foot.position.set(fx, -1.65, -0.03);
      foot.renderOrder = 7;
      mainWindowGroup.add(foot);
    });

    const knobGeo = new THREE.CylinderGeometry(0.085, 0.085, 0.16, 20);
    knobGeo.rotateZ(Math.PI / 2);
    [-2.14, 2.14].forEach((kx) => {
      const knob = new THREE.Mesh(knobGeo, stainlessMat);
      knob.position.set(kx, -1.73, -0.04);
      knob.renderOrder = 7;
      mainWindowGroup.add(knob);
    });

    disposables.push(
      glassGeo,
      crystalGlassMat,
      bezelGeo,
      brushedMetalMat,
      gasketGeo,
      gasketMat,
      claspGeo,
      claspMat,
      boltGeo,
      stainlessMat,
      darkAnodizedMat,
      topRailGeo,
      valveGeo,
      ledGeo,
      ledMat,
      portBaseGeo,
      collarGeo,
      tubeMat,
      stageFootGeo,
      stageRailGeo,
      knobGeo,
      ...tubeGeos
    );

    // High-DPI Glass Optical Etching & Micro-Callouts Overlay
    const overlayCanvas = document.createElement('canvas');
    overlayCanvas.width = 1280;
    overlayCanvas.height = 800;
    const overlayTex = new THREE.CanvasTexture(overlayCanvas);
    configureFlatUiTexture(overlayTex);

    const overlayGeo = new THREE.PlaneGeometry(4.74, 2.96);
    const overlayMat = new THREE.MeshBasicMaterial({
      map: overlayTex,
      transparent: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
    });
    const overlayPlane = new THREE.Mesh(overlayGeo, overlayMat);
    overlayPlane.position.z = 0.066;
    overlayPlane.renderOrder = 8;
    mainWindowGroup.add(overlayPlane);
    disposables.push(overlayTex, overlayGeo, overlayMat);

    // PART 6–8: Sleek Outer-Left Floating 3D Glass Model Cards (clickable to jump phase while staying self-looping)
    const cardShape = createRoundedRectShape(1.1, 0.3, 0.068);
    const cardBodyGeo = new THREE.ExtrudeGeometry(cardShape, {
      depth: 0.034,
      bevelEnabled: true,
      bevelThickness: 0.01,
      bevelSize: 0.01,
      bevelSegments: 2,
    });
    cardBodyGeo.center();
    const cardGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.14,
      metalness: 0.08,
      clearcoat: 0.9,
      transparent: true,
      opacity: 0.94,
    });
    const cardLabelGeo = new THREE.PlaneGeometry(1.04, 0.26);
    disposables.push(cardBodyGeo, cardGlassMat, cardLabelGeo);

    const modelCards: {
      group: THREE.Group;
      canvas: HTMLCanvasElement;
      tex: THREE.CanvasTexture;
    }[] = [];
    const modelCardHitMeshes: THREE.Mesh[] = [];

    for (let i = 0; i < 4; i++) {
      const cGroup = new THREE.Group();
      const yPos = 0.96 - i * 0.41;
      cGroup.position.set(-2.36, yPos, 0.62);
      cGroup.rotation.y = 0.16;
      rootAssembly.add(cGroup);

      const cBody = new THREE.Mesh(cardBodyGeo, cardGlassMat);
      cBody.castShadow = !isSoftwareGl;
      cBody.renderOrder = 9;
      cBody.userData.stepIndex = i;
      cGroup.add(cBody);
      modelCardHitMeshes.push(cBody);

      const cCanvas = document.createElement('canvas');
      cCanvas.width = 480;
      cCanvas.height = 116;
      const cTex = new THREE.CanvasTexture(cCanvas);
      configureFlatUiTexture(cTex);

      const cMat = new THREE.MeshBasicMaterial({
        map: cTex,
        transparent: true,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1,
      });
      const cLabel = new THREE.Mesh(cLabelGeoAlias(cardLabelGeo), cMat);
      cLabel.position.z = 0.028;
      cLabel.renderOrder = 10;
      cGroup.add(cLabel);

      disposables.push(cTex, cMat);
      modelCards.push({ group: cGroup, canvas: cCanvas, tex: cTex });
    }

    function cLabelGeoAlias(g: THREE.PlaneGeometry) {
      return g;
    }

    // PART 9: Spatially-Anchored 3D Glass Model Explanation Board (glides across 4 distinct window zones)
    const initStep = stateRef.current.scenario.steps[0];
    const tracePaneGroup = new THREE.Group();
    tracePaneGroup.position.set(
      initStep.boardPos[0],
      initStep.boardPos[1],
      initStep.boardPos[2]
    );
    tracePaneGroup.rotation.y = initStep.boardRotY;
    rootAssembly.add(tracePaneGroup);

    const traceShape = createRoundedRectShape(BOARD_WORLD_W, BOARD_WORLD_H, 0.082);
    const traceGeo = new THREE.ExtrudeGeometry(traceShape, {
      depth: 0.038,
      bevelEnabled: true,
      bevelThickness: 0.011,
      bevelSize: 0.011,
      bevelSegments: 2,
    });
    traceGeo.center();
    const traceBodyMesh = new THREE.Mesh(traceGeo, cardGlassMat);
    traceBodyMesh.castShadow = !isSoftwareGl;
    traceBodyMesh.renderOrder = 11;
    tracePaneGroup.add(traceBodyMesh);

    const traceCanvas = document.createElement('canvas');
    traceCanvas.width = BOARD_CANVAS_W;
    traceCanvas.height = BOARD_CANVAS_H;
    const traceTex = new THREE.CanvasTexture(traceCanvas);
    configureFlatUiTexture(traceTex);

    const tracePlaneGeo = new THREE.PlaneGeometry(BOARD_INNER_W, BOARD_INNER_H);
    const tracePlaneMat = new THREE.MeshBasicMaterial({
      map: traceTex,
      transparent: true,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
    const tracePlane = new THREE.Mesh(tracePlaneGeo, tracePlaneMat);
    tracePlane.position.z = 0.032;
    tracePlane.renderOrder = 12;
    tracePaneGroup.add(tracePlane);

    // GPU-driven 3D Progress Fill Bar (eliminates 8Hz 640x430 CanvasTexture redraw & upload)
    const barWorldH = (BAR_PX_H / BOARD_CANVAS_H) * BOARD_INNER_H;
    const barWorldY = (0.5 - (BAR_PX_Y + BAR_PX_H * 0.5) / BOARD_CANVAS_H) * BOARD_INNER_H;
    const activeBarFillGeo = new THREE.PlaneGeometry(1, barWorldH);
    const activeBarFillMat = new THREE.MeshBasicMaterial({
      color: initStep.accentHex,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
    });
    const activeBarFillMesh = new THREE.Mesh(activeBarFillGeo, activeBarFillMat);
    activeBarFillMesh.position.set(0, barWorldY, 0.0335);
    activeBarFillMesh.renderOrder = 13;
    tracePaneGroup.add(activeBarFillMesh);

    const updateActiveProgressFill = (stepIdx: number, stepProgress: number) => {
      const clampedProg = Math.max(0, Math.min(1, stepProgress));
      const segLeftPx = BAR_START_PX_X + stepIdx * (BAR_SEG_PX_W + BAR_GAP_PX);
      const fillPxW = Math.max(8, BAR_SEG_PX_W * clampedProg);
      const fillWorldW = (fillPxW / BOARD_CANVAS_W) * BOARD_INNER_W;
      const fillCenterX =
        ((segLeftPx + fillPxW * 0.5) / BOARD_CANVAS_W - 0.5) * BOARD_INNER_W;
      activeBarFillMesh.position.x = fillCenterX;
      activeBarFillMesh.scale.set(fillWorldW, 1, 1);
    };

    disposables.push(
      traceGeo,
      traceTex,
      tracePlaneGeo,
      tracePlaneMat,
      activeBarFillGeo,
      activeBarFillMat
    );

    // PART 10: 3D Spatial Target Beacon Ring & Optical Tether Beam linking Board <-> Matched 3D Element
    const tetherAccentMat = new THREE.MeshStandardMaterial({
      color: initStep.accentHex,
      emissive: initStep.accentHex,
      emissiveIntensity: 0.55,
      roughness: 0.22,
      metalness: 0.3,
      transparent: true,
      opacity: 0.88,
      depthTest: false,
    });

    const targetBeaconGroup = new THREE.Group();
    targetBeaconGroup.position.set(
      initStep.anchorPos[0],
      initStep.anchorPos[1],
      initStep.anchorPos[2]
    );
    rootAssembly.add(targetBeaconGroup);

    const outerReticleGeo = new THREE.TorusGeometry(0.16, 0.013, 10, 40);
    const innerReticleGeo = new THREE.TorusGeometry(0.065, 0.01, 8, 28);
    const coreDotGeo = new THREE.SphereGeometry(0.032, 12, 10);

    const outerReticleMesh = new THREE.Mesh(outerReticleGeo, tetherAccentMat);
    const innerReticleMesh = new THREE.Mesh(innerReticleGeo, tetherAccentMat);
    const coreDotMesh = new THREE.Mesh(coreDotGeo, tetherAccentMat);
    outerReticleMesh.renderOrder = 9;
    innerReticleMesh.renderOrder = 9;
    coreDotMesh.renderOrder = 9;
    targetBeaconGroup.add(outerReticleMesh, innerReticleMesh, coreDotMesh);

    // Unit-height 3D Optical Tether Beam dynamically oriented & scaled between Board border and Target Beacon
    const tetherBeamGeo = new THREE.CylinderGeometry(0.01, 0.01, 1, 8);
    const tetherBeamMat = new THREE.MeshStandardMaterial({
      color: initStep.accentHex,
      emissive: initStep.accentHex,
      emissiveIntensity: 0.45,
      roughness: 0.25,
      transparent: true,
      opacity: 0.72,
      depthTest: false,
    });
    const tetherBeamMesh = new THREE.Mesh(tetherBeamGeo, tetherBeamMat);
    tetherBeamMesh.renderOrder = 9;
    rootAssembly.add(tetherBeamMesh);

    const boardJointMesh = new THREE.Mesh(coreDotGeo, tetherAccentMat);
    boardJointMesh.scale.setScalar(0.85);
    boardJointMesh.renderOrder = 12;
    rootAssembly.add(boardJointMesh);

    const tetherPulseGeo = new THREE.SphereGeometry(0.028, 10, 8);
    const tetherPulseMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: initStep.accentHex,
      emissiveIntensity: 0.95,
      roughness: 0.15,
      depthTest: false,
    });
    const tetherPulseMesh = new THREE.Mesh(tetherPulseGeo, tetherPulseMat);
    tetherPulseMesh.renderOrder = 10;
    rootAssembly.add(tetherPulseMesh);

    disposables.push(
      tetherAccentMat,
      outerReticleGeo,
      innerReticleGeo,
      coreDotGeo,
      tetherBeamGeo,
      tetherBeamMat,
      tetherPulseGeo,
      tetherPulseMat
    );

    const refreshStaticStepTextures = (stepIdx: number) => {
      const { scenario: sc, lang: l } = stateRef.current;
      const activeSt = sc.steps[stepIdx] ?? sc.steps[0];

      drawMainWindowOverlay(overlayCanvas, sc, stepIdx, l);
      overlayTex.needsUpdate = true;

      modelCards.forEach((mc, i) => {
        const st = sc.steps[i];
        drawModelPillCard(
          mc.canvas,
          st.stepNo,
          st.moduleName,
          st.tierTag,
          st.accentColorCss,
          i === stepIdx
        );
        mc.tex.needsUpdate = true;
      });

      tetherAccentMat.color.setHex(activeSt.accentHex);
      tetherAccentMat.emissive.setHex(activeSt.accentHex);
      tetherBeamMat.color.setHex(activeSt.accentHex);
      tetherBeamMat.emissive.setHex(activeSt.accentHex);
      tetherPulseMat.emissive.setHex(activeSt.accentHex);
      activeBarFillMat.color.setHex(activeSt.accentHex);

      stateRef.current.staticHudDirty = false;
    };

    const refreshDynamicBoardTexture = (stepIdx: number) => {
      const { scenario: sc, lang: l } = stateRef.current;
      drawDynamicModelRoleBoard(traceCanvas, sc, stepIdx, l);
      traceTex.needsUpdate = true;
      stateRef.current.boardDirty = false;
    };

    refreshStaticStepTextures(0);
    refreshDynamicBoardTexture(0);
    updateActiveProgressFill(0, 0);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Raycaster strictly bounded to the 4 left 3D model cards
    const raycaster = new THREE.Raycaster();
    let isDragging = false;
    let downX = 0;
    let downY = 0;
    let lastX = 0;
    let lastY = 0;

    // Cached canvas bounds so high-frequency pointermove never triggers getBoundingClientRect() reflow
    const cachedBounds = { left: 0, top: 0, width: initW, height: initH };
    const syncCachedBounds = () => {
      const r = mountEl.getBoundingClientRect();
      cachedBounds.left = r.left;
      cachedBounds.top = r.top;
      cachedBounds.width = r.width;
      cachedBounds.height = r.height;
    };
    syncCachedBounds();

    const onPointerDown = (e: PointerEvent) => {
      syncCachedBounds();
      isDragging = true;
      downX = e.clientX;
      downY = e.clientY;
      lastX = e.clientX;
      lastY = e.clientY;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (stateRef.current.pausedByScroll || document.hidden) return;
      if (cachedBounds.width <= 0 || cachedBounds.height <= 0) return;
      if (isDragging) {
        const dx = (e.clientX - lastX) / cachedBounds.width;
        const dy = (e.clientY - lastY) / cachedBounds.height;
        lastX = e.clientX;
        lastY = e.clientY;
        stateRef.current.pointerTiltY = THREE.MathUtils.clamp(
          stateRef.current.pointerTiltY + dx * 1.15,
          -0.46,
          0.46
        );
        stateRef.current.pointerTiltX = THREE.MathUtils.clamp(
          stateRef.current.pointerTiltX + dy * 0.65,
          -0.25,
          0.25
        );
      } else {
        const nx = THREE.MathUtils.clamp(
          ((e.clientX - cachedBounds.left) / cachedBounds.width - 0.5) * 2,
          -1.4,
          1.4
        );
        const ny = THREE.MathUtils.clamp(
          ((e.clientY - cachedBounds.top) / cachedBounds.height - 0.5) * 2,
          -1.4,
          1.4
        );
        stateRef.current.pointerTiltY = nx * 0.11;
        stateRef.current.pointerTiltX = ny * 0.065;
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!isDragging) return;
      isDragging = false;

      const movedDist = Math.hypot(e.clientX - downX, e.clientY - downY);
      if (movedDist < 6) {
        const rect = renderer.domElement.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          _pointerNdc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
          _pointerNdc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
          raycaster.setFromCamera(_pointerNdc, camera);
          const hits = raycaster.intersectObjects(modelCardHitMeshes, false);
          if (hits.length > 0) {
            const clickedIdx = hits[0].object.userData.stepIndex;
            if (typeof clickedIdx === 'number' && clickedIdx >= 0 && clickedIdx < 4) {
              const targetSec = clickedIdx * STEP_DURATION_SEC + 0.02;
              stateRef.current.phaseOffsetSec =
                ((targetSec - stateRef.current.lastElapsedSec) % CYCLE_DURATION_SEC +
                  CYCLE_DURATION_SEC) %
                CYCLE_DURATION_SEC;
              stateRef.current.activeStepIdx = clickedIdx;
              stateRef.current.staticHudDirty = true;
              stateRef.current.boardDirty = true;
              setActiveStepIdx(clickedIdx);
              if (prefersReducedMotion) {
                renderSingleFrame();
              }
            }
          }
        }
      }
    };

    const domCanvas = renderer.domElement;
    domCanvas.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('scroll', syncCachedBounds, { passive: true });

    let curW = initW;
    let curH = initH;
    const handleResize = () => {
      if (!mountEl) return;
      syncCachedBounds();
      const w = Math.max(300, mountEl.clientWidth);
      const h = Math.max(360, mountEl.clientHeight);
      if (w === curW && h === curH) return;
      curW = w;
      curH = h;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      renderer.render(scene, camera);
    };
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(mountEl);

    let frameId = 0;
    let unmounted = false;
    let loopRunning = false;
    const prefersReducedMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const startMs = performance.now();
    let prevMs = startMs;

    // Refresh 3D glass typography once non-blocking Google Webfonts finish loading
    const markFontsReady = () => {
      if (unmounted) return;
      if (document.fonts?.load) {
        Promise.allSettled([
          document.fonts.load('600 20px "Noto Sans SC"'),
          document.fonts.load('700 24px "Plus Jakarta Sans"'),
          document.fonts.load('700 20px "JetBrains Mono"'),
        ]).then(() => {
          if (unmounted) return;
          stateRef.current.staticHudDirty = true;
          stateRef.current.boardDirty = true;
          if (!loopRunning) {
            renderSingleFrame();
          }
        });
      }
    };
    if (document.readyState === 'complete') {
      markFontsReady();
    } else {
      window.addEventListener('load', markFontsReady, { once: true });
    }

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (!gl || typeof gl.fenceSync !== 'function') {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (unmounted) return;
        const status = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (status === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function advanceAndDrawScene(nowMs: number, dt: number) {
      const elapsed = (nowMs - startMs) / 1000;
      stateRef.current.lastElapsedSec = elapsed;

      // Deterministic continuous self-looping cycle: 01 -> 02 -> 03 -> 04 -> 01...
      const loop = computeCycleLoopState(elapsed, stateRef.current.phaseOffsetSec);
      if (loop.activeStepIdx !== stateRef.current.activeStepIdx) {
        stateRef.current.activeStepIdx = loop.activeStepIdx;
        stateRef.current.staticHudDirty = true;
        stateRef.current.boardDirty = true;
        setActiveStepIdx(loop.activeStepIdx);
      }

      if (stateRef.current.staticHudDirty) {
        refreshStaticStepTextures(loop.activeStepIdx);
      }
      if (stateRef.current.boardDirty) {
        refreshDynamicBoardTexture(loop.activeStepIdx);
      }
      updateActiveProgressFill(loop.activeStepIdx, loop.stepProgress);

      const { scenario: sc, pointerTiltX, pointerTiltY } = stateRef.current;
      const activeSt = sc.steps[loop.activeStepIdx] ?? sc.steps[0];
      const targets = computeWindowLayerTargets('overview', loop.activeStepIdx, curW / curH);

      // Smooth exponential camera damping
      _targetCamPos.set(targets.cameraPos[0], targets.cameraPos[1], targets.cameraPos[2]);
      _targetLookAt.set(targets.lookAt[0], targets.lookAt[1], targets.lookAt[2]);

      const dampAlpha = 1 - Math.exp(-5.5 * dt);
      camera.position.lerp(_targetCamPos, dampAlpha);
      _currentLookAt.lerp(_targetLookAt, dampAlpha);
      camera.lookAt(_currentLookAt);

      rootAssembly.rotation.y = THREE.MathUtils.damp(
        rootAssembly.rotation.y,
        pointerTiltY,
        5.0,
        dt
      );
      rootAssembly.rotation.x = THREE.MathUtils.damp(
        rootAssembly.rotation.x,
        0.02 + pointerTiltX,
        5.0,
        dt
      );

      // Strictly periodic harmonic window float (2 oscillations per cycle -> seamless loop)
      const cycleTheta = loop.cyclePhase * Math.PI * 2;
      const floatOffset = Math.sin(cycleTheta * 2) * 0.026;
      mainWindowGroup.position.y = 0.02 + floatOffset;
      specimenGroup.position.y = 0.02 + floatOffset * 0.85;

      backGlassGroup.position.z = THREE.MathUtils.damp(
        backGlassGroup.position.z,
        targets.backGlassZ,
        6.0,
        dt
      );
      specimenGroup.position.z = THREE.MathUtils.damp(
        specimenGroup.position.z,
        targets.specimenZ,
        6.0,
        dt
      );
      mainWindowGroup.position.z = THREE.MathUtils.damp(
        mainWindowGroup.position.z,
        targets.mainWindowZ,
        6.0,
        dt
      );

      // Smoothly glide 3D Explanation Board to the active step's matched Window Zone
      const boardSwitchPulse = Math.sin(Math.PI * Math.min(1, loop.stepProgress * 3.2)) * 0.07;
      tracePaneGroup.position.x = THREE.MathUtils.damp(
        tracePaneGroup.position.x,
        activeSt.boardPos[0],
        6.2,
        dt
      );
      tracePaneGroup.position.y = THREE.MathUtils.damp(
        tracePaneGroup.position.y,
        activeSt.boardPos[1] + floatOffset * 0.6,
        6.2,
        dt
      );
      tracePaneGroup.position.z = THREE.MathUtils.damp(
        tracePaneGroup.position.z,
        activeSt.boardPos[2] + boardSwitchPulse,
        6.8,
        dt
      );
      tracePaneGroup.rotation.y = THREE.MathUtils.damp(
        tracePaneGroup.rotation.y,
        activeSt.boardRotY,
        6.2,
        dt
      );

      // Smoothly glide 3D Target Beacon Ring onto the matched Virtual Cell 3D structure
      targetBeaconGroup.position.x = THREE.MathUtils.damp(
        targetBeaconGroup.position.x,
        activeSt.anchorPos[0],
        7.5,
        dt
      );
      targetBeaconGroup.position.y = THREE.MathUtils.damp(
        targetBeaconGroup.position.y,
        activeSt.anchorPos[1] + floatOffset * 0.85,
        7.5,
        dt
      );
      targetBeaconGroup.position.z = THREE.MathUtils.damp(
        targetBeaconGroup.position.z,
        activeSt.anchorPos[2],
        7.5,
        dt
      );

      const reticlePulse = 1 + 0.1 * Math.sin(cycleTheta * 8);
      outerReticleMesh.scale.setScalar(reticlePulse);
      outerReticleMesh.rotation.z = cycleTheta * 2;
      innerReticleMesh.rotation.z = -cycleTheta * 3;

      // Update 3D Optical Tether Beam connecting Board perimeter <-> Target Beacon (zero GC allocations)
      _boardPosTuple[0] = tracePaneGroup.position.x;
      _boardPosTuple[1] = tracePaneGroup.position.y;
      _boardPosTuple[2] = tracePaneGroup.position.z;
      _anchorPosTuple[0] = targetBeaconGroup.position.x;
      _anchorPosTuple[1] = targetBeaconGroup.position.y;
      _anchorPosTuple[2] = targetBeaconGroup.position.z;

      const attach = computeBoardTetherStart(
        _boardPosTuple,
        _anchorPosTuple,
        BOARD_WORLD_W,
        BOARD_WORLD_H,
        _tetherOutTuple
      );
      _tetherStart.set(attach[0], attach[1], attach[2]);
      _tetherEnd.copy(targetBeaconGroup.position);

      boardJointMesh.position.copy(_tetherStart);

      _tetherDir.subVectors(_tetherEnd, _tetherStart);
      const tetherLen = Math.max(0.05, _tetherDir.length());
      _tetherDir.divideScalar(tetherLen);

      _tetherMid.addVectors(_tetherStart, _tetherEnd).multiplyScalar(0.5);
      _tetherQuat.setFromUnitVectors(_upAxis, _tetherDir);

      tetherBeamMesh.position.copy(_tetherMid);
      tetherBeamMesh.quaternion.copy(_tetherQuat);
      tetherBeamMesh.scale.set(1, tetherLen, 1);

      // Periodic pulse bead traveling from matched 3D biological element -> Explanation Board
      const pulseT = (loop.stepProgress * 2) % 1;
      const pulseFade = Math.sin(Math.PI * pulseT);
      tetherPulseMesh.position.lerpVectors(_tetherEnd, _tetherStart, pulseT);
      tetherPulseMesh.scale.setScalar(Math.max(0.01, 0.45 + 0.85 * pulseFade));

      modelCards.forEach((mc, idx) => {
        mc.group.position.x = THREE.MathUtils.damp(mc.group.position.x, -2.36, 6.5, dt);
        mc.group.position.z = THREE.MathUtils.damp(
          mc.group.position.z,
          targets.cardZOffsets[idx],
          7.0,
          dt
        );
      });

      // Closed-loop periodic kinematics for DNA/Gene, Spatial Halo, Virtual Cell, and Drug structures
      const bioKin = computeBioInteriorKinematics(sc.id, loop.cyclePhase);
      bioInterior.update(bioKin, loop.cyclePhase, sc.specimenGeometryMode);

      renderer.render(scene, camera);
    }

    function renderSingleFrame() {
      if (unmounted) return;
      const nowMs = performance.now();
      prevMs = nowMs;
      advanceAndDrawScene(nowMs, 0.016);
    }

    function tick() {
      if (unmounted) {
        loopRunning = false;
        return;
      }

      // True zero-timer hibernation when scrolled offscreen or browser tab is hidden
      if (stateRef.current.pausedByScroll || document.hidden || prefersReducedMotion) {
        loopRunning = false;
        return;
      }

      const nowMs = performance.now();
      const dt = Math.min(0.08, Math.max(0.001, (nowMs - prevMs) / 1000));
      prevMs = nowMs;

      advanceAndDrawScene(nowMs, dt);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    const startLoop = () => {
      if (unmounted || loopRunning || stateRef.current.pausedByScroll || document.hidden) {
        return;
      }
      if (prefersReducedMotion) {
        renderSingleFrame();
        return;
      }
      loopRunning = true;
      prevMs = performance.now();
      tick();
    };

    wakeLoopRef.current = startLoop;

    const handleVisibilityChange = () => {
      if (!document.hidden && !stateRef.current.pausedByScroll) {
        startLoop();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    if (prefersReducedMotion) {
      renderSingleFrame();
    } else {
      startLoop();
    }

    return () => {
      unmounted = true;
      loopRunning = false;
      wakeLoopRef.current = null;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      resizeObserver.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('scroll', syncCachedBounds);
      domCanvas.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      domCanvas.removeEventListener('webglcontextlost', handleContextLost);
      domCanvas.removeEventListener('webglcontextrestored', handleContextRestored);

      disposables.forEach((d) => d.dispose());
      renderer.dispose();
    };
  }, []);

  const currentStep = scenario.steps[activeStepIdx] ?? scenario.steps[0];

  return (
    <div
      data-testid="three-task-window-stage"
      data-scenario={scenario.id}
      data-step={currentStep.stepNo}
      data-active-module={currentStep.moduleName}
      data-window-zone={currentStep.windowZone}
      data-target-element={currentStep.targetElementLabel[lang]}
      data-board-metric={currentStep.boardMetric}
      data-board-role={currentStep.roleHeadline[lang]}
      className="relative w-full flex-1 h-full min-h-[320px] sm:min-h-[420px] lg:min-h-[540px] rounded-2xl border border-emerald-900/12 bg-gradient-to-b from-[#E8F7F0] via-[#F4FBF7] to-white shadow-[0_1px_2px_rgba(6,78,59,0.05),0_22px_50px_-28px_rgba(6,78,59,0.2)] overflow-hidden select-none"
    >
      {webglFallback ? (
        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-2 bg-[#F2FAF6]">
          <div className="text-sm font-semibold text-[#0C261B]">
            {scenario.shortTabLabel[lang]} · {currentStep.moduleName}
          </div>
          <p className="text-xs text-emerald-800 font-mono">
            {currentStep.boardMetric} · {currentStep.roleHeadline[lang]}
          </p>
        </div>
      ) : (
        <div
          ref={canvasMountRef}
          aria-label={
            lang === 'zh'
              ? 'Cyto 三维透明玻璃虚拟细胞主模型视窗'
              : 'Cyto 3D Transparent Glass Virtual Cell Main Model Stage'
          }
          className="w-full h-full cursor-grab active:cursor-grabbing"
        />
      )}
    </div>
  );
};

export default ThreeTaskWindowStage;
