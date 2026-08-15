export const N = 10;
export const COLS = 4;
export const ROWS = 3;

const PALETTE = [
  [0.88, 0.72, 0.78],
  [0.82, 0.78, 0.86],
  [0.9, 0.82, 0.8],
  [0.85, 0.74, 0.82],
  [0.92, 0.76, 0.8],
  [0.8, 0.76, 0.88],
];

export interface ShapeParams {
  pos: Float32Array;
  dir: Float32Array;
  driftSpeed: Float32Array;
  driftOffset: Float32Array;
  rotSpeed: Float32Array;
  size: Float32Array;
  kind: Float32Array;
  filled: Float32Array;
  aspect: Float32Array;
  color: Float32Array;
  breatheSpeed: Float32Array;
  breathePhase: Float32Array;
  baseAlpha: Float32Array;
}

function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]!];
  }
  return arr;
}

export function generateShapes(): ShapeParams {
  const cells: { x: number; y: number }[] = [];
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      cells.push({ x, y });
    }
  }
  shuffle(cells);

  const pos = new Float32Array(N * 2);
  const dir = new Float32Array(N * 2);
  const driftSpeed = new Float32Array(N);
  const driftOffset = new Float32Array(N);
  const rotSpeed = new Float32Array(N);
  const size = new Float32Array(N);
  const kind = new Float32Array(N);
  const filled = new Float32Array(N);
  const aspect = new Float32Array(N * 2);
  const color = new Float32Array(N * 3);
  const breatheSpeed = new Float32Array(N);
  const breathePhase = new Float32Array(N);
  const baseAlpha = new Float32Array(N);

  for (let i = 0; i < N; i++) {
    const cell = cells[i]!;
    const cx = (cell.x + 0.5) / COLS;
    const cy = (cell.y + 0.5) / ROWS;
    const jx = ((Math.random() - 0.5) * 0.5) / COLS;
    const jy = ((Math.random() - 0.5) * 0.5) / ROWS;
    pos[i * 2] = cx + jx;
    pos[i * 2 + 1] = cy + jy;

    const angle = Math.random() * Math.PI * 2;
    dir[i * 2] = Math.cos(angle);
    dir[i * 2 + 1] = Math.sin(angle);

    driftSpeed[i] = 0.02 + Math.random() * 0.03;
    driftOffset[i] = Math.random() * 10.0;
    rotSpeed[i] = (Math.random() - 0.5) * 0.4;
    size[i] = 0.025 + Math.random() * 0.045;
    kind[i] = Math.random() > 0.7 ? 1.0 : 0.0;
    filled[i] = Math.random() > 0.4 ? 1.0 : 0.0;

    if (kind[i] < 0.5) {
      aspect[i * 2] = 0.5 + Math.random() * 1.0;
      aspect[i * 2 + 1] = 0.6 + Math.random() * 0.8;
    } else {
      aspect[i * 2] = 1.0;
      aspect[i * 2 + 1] = 1.0;
    }

    const pal = PALETTE[Math.floor(Math.random() * PALETTE.length)]!;
    color[i * 3] = pal[0];
    color[i * 3 + 1] = pal[1];
    color[i * 3 + 2] = pal[2];

    breatheSpeed[i] = 0.4 + Math.random() * 0.6;
    breathePhase[i] = Math.random() * Math.PI * 2;
    baseAlpha[i] = 0.15 + Math.random() * 0.08;
  }

  return {
    pos,
    dir,
    driftSpeed,
    driftOffset,
    rotSpeed,
    size,
    kind,
    filled,
    aspect,
    color,
    breatheSpeed,
    breathePhase,
    baseAlpha,
  };
}

export interface BackgroundRenderer {
  resize(width: number, height: number): void;
  frame(time: number): void;
  destroy(): void;
}

const MAX_DPR = 1.5;
const PIXEL_BUDGET = 750_000;

export function computeCanvasSize(clientWidth: number, clientHeight: number) {
  const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
  let width = Math.max(1, Math.floor(clientWidth * dpr));
  let height = Math.max(1, Math.floor(clientHeight * dpr));
  const pixels = width * height;
  if (pixels > PIXEL_BUDGET) {
    const k = Math.sqrt(PIXEL_BUDGET / pixels);
    width = Math.max(1, Math.floor(width * k));
    height = Math.max(1, Math.floor(height * k));
  }
  return { width, height };
}
