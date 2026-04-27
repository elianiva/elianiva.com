import { useRef, useEffect } from "react";
import fragSource from "#/shaders/bg.frag.glsl?raw";
import vertSource from "#/shaders/bg.vert.glsl?raw";

const SCALE = 0.5;
const TARGET_FPS = 30;
const FRAME_INTERVAL = 1000 / TARGET_FPS;
const UPDATE_EVERY = 1;

const N = 10;
const COLS = 4;
const ROWS = 3;

const PALETTE = [
  [0.88, 0.72, 0.78],
  [0.82, 0.78, 0.86],
  [0.9, 0.82, 0.8],
  [0.85, 0.74, 0.82],
  [0.92, 0.76, 0.8],
  [0.8, 0.76, 0.88],
];

function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [arr[i], arr[j]] = [(arr as any)[j], (arr as any)[i]];
  }
  return arr;
}

export function CanvasBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl2", {
      alpha: false,
      antialias: false,
      preserveDrawingBuffer: false,
    });
    if (!gl) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function compile(type: number, source: string) {
      const s = gl!.createShader(type);
      if (!s) return null;
      gl!.shaderSource(s, source);
      gl!.compileShader(s);
      if (!gl!.getShaderParameter(s, gl!.COMPILE_STATUS)) {
        console.error(gl!.getShaderInfoLog(s));
        gl!.deleteShader(s);
        return null;
      }
      return s;
    }

    const vs = compile(gl.VERTEX_SHADER, vertSource);
    const fs = compile(gl.FRAGMENT_SHADER, fragSource);
    if (!vs || !fs) return;

    const prog = gl.createProgram();
    if (!prog) return;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(prog));
      return;
    }
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    // --- generate shapes evenly across grid cells ---
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
      const cell = cells[i];
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

      const pal = PALETTE[Math.floor(Math.random() * PALETTE.length)];
      color[i * 3] = pal[0];
      color[i * 3 + 1] = pal[1];
      color[i * 3 + 2] = pal[2];

      breatheSpeed[i] = 0.4 + Math.random() * 0.6;
      breathePhase[i] = Math.random() * Math.PI * 2;
      baseAlpha[i] = 0.15 + Math.random() * 0.08;
    }

    // --- uniform locations ---
    const uTime = gl.getUniformLocation(prog, "u_time");
    const uRes = gl.getUniformLocation(prog, "u_res");
    const uPos = gl.getUniformLocation(prog, "u_pos");
    const uDir = gl.getUniformLocation(prog, "u_dir");
    const uDriftSpeed = gl.getUniformLocation(prog, "u_driftSpeed");
    const uDriftOffset = gl.getUniformLocation(prog, "u_driftOffset");
    const uRotSpeed = gl.getUniformLocation(prog, "u_rotSpeed");
    const uSize = gl.getUniformLocation(prog, "u_size");
    const uKind = gl.getUniformLocation(prog, "u_kind");
    const uFilled = gl.getUniformLocation(prog, "u_filled");
    const uAspect = gl.getUniformLocation(prog, "u_aspect");
    const uColor = gl.getUniformLocation(prog, "u_color");
    const uBreatheSpeed = gl.getUniformLocation(prog, "u_breatheSpeed");
    const uBreathePhase = gl.getUniformLocation(prog, "u_breathePhase");
    const uBaseAlpha = gl.getUniformLocation(prog, "u_baseAlpha");

    // --- upload once ---
    gl.uniform2fv(uPos, pos);
    gl.uniform2fv(uDir, dir);
    gl.uniform1fv(uDriftSpeed, driftSpeed);
    gl.uniform1fv(uDriftOffset, driftOffset);
    gl.uniform1fv(uRotSpeed, rotSpeed);
    gl.uniform1fv(uSize, size);
    gl.uniform1fv(uKind, kind);
    gl.uniform1fv(uFilled, filled);
    gl.uniform2fv(uAspect, aspect);
    gl.uniform3fv(uColor, color);
    gl.uniform1fv(uBreatheSpeed, breatheSpeed);
    gl.uniform1fv(uBreathePhase, breathePhase);
    gl.uniform1fv(uBaseAlpha, baseAlpha);

    let running = true;
    let raf: number;
    let startTime = performance.now();
    let lastFrameTime = 0;
    let frameCount = 0;
    let needsDraw = true;

    function resize() {
      const c = canvas!;
      const w = c.clientWidth;
      const h = c.clientHeight;
      c.width = Math.max(1, Math.floor(w * SCALE));
      c.height = Math.max(1, Math.floor(h * SCALE));
      gl!.viewport(0, 0, c.width, c.height);
      gl!.uniform2f(uRes, c.width, c.height);
      needsDraw = true;
    }

    function render(now: number) {
      if (!running) return;

      if (now - lastFrameTime < FRAME_INTERVAL) {
        raf = requestAnimationFrame(render);
        return;
      }
      lastFrameTime = now;

      if (prefersReducedMotion) {
        gl!.uniform1f(uTime, 0);
        gl!.drawArrays(gl!.TRIANGLES, 0, 3);
        return;
      }

      const t = (now - startTime) * 0.001;
      gl!.uniform1f(uTime, t);

      if (needsDraw || frameCount % UPDATE_EVERY === 0) {
        gl!.drawArrays(gl!.TRIANGLES, 0, 3);
        needsDraw = false;
      }
      frameCount++;

      raf = requestAnimationFrame(render);
    }

    resize();
    window.addEventListener("resize", resize);
    raf = requestAnimationFrame(render);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries[0].isIntersecting;
        if (visible && !running) {
          running = true;
          needsDraw = true;
          lastFrameTime = 0;
          raf = requestAnimationFrame(render);
        } else if (!visible && running) {
          running = false;
          cancelAnimationFrame(raf);
        }
      },
      { threshold: 0 },
    );
    observer.observe(canvas);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("resize", resize);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none -z-10"
      style={{ imageRendering: "auto" }}
      aria-hidden="true"
    />
  );
}
