import type { BackgroundRenderer, ShapeParams } from "./background";
import { N } from "./background";

function fract(v: number) {
  return v - Math.floor(v);
}

export function createCanvasRenderer(
  canvas: HTMLCanvasElement,
  shapes: ShapeParams,
): BackgroundRenderer | null {
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) return null;

  let width = 0;
  let height = 0;

  return {
    resize(w, h) {
      width = w;
      height = h;
      canvas.width = w;
      canvas.height = h;
    },
    frame(time) {
      if (width === 0 || height === 0) return;

      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);

      const g = ctx.createLinearGradient(0, height, width, 0);
      g.addColorStop(0, "rgb(255,245,240)");
      g.addColorStop(0.5, "rgb(255,249,245)");
      g.addColorStop(1, "rgb(255,240,245)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, width, height);

      const ar = width / height;

      for (let i = 0; i < N; i++) {
        const t = time * shapes.driftSpeed[i]! + shapes.driftOffset[i]!;
        let cx = fract(shapes.pos[i * 2]! + shapes.dir[i * 2]! * t);
        let cy = fract(shapes.pos[i * 2 + 1]! + shapes.dir[i * 2 + 1]! * t);
        cy = 1 - cy;

        const rot = time * shapes.rotSpeed[i]!;
        const size = shapes.size[i]!;
        const kind = shapes.kind[i]!;
        const filled = shapes.filled[i]!;
        const ax = shapes.aspect[i * 2]!;
        const ay = shapes.aspect[i * 2 + 1]!;
        const r = shapes.color[i * 3]!;
        const gc = shapes.color[i * 3 + 1]!;
        const b = shapes.color[i * 3 + 2]!;
        const breathe = 0.5 + 0.5 * Math.sin(time * shapes.breatheSpeed[i]! + shapes.breathePhase[i]!);
        const alpha = breathe * shapes.baseAlpha[i]!;

        const baseAlpha = Math.max(0, Math.min(1, alpha));
        const color = `rgba(${Math.round(r * 255)},${Math.round(gc * 255)},${Math.round(b * 255)},${baseAlpha})`;

        const sizePx = size * height;

        for (let dx = -1; dx <= 1; dx++) {
          for (let dy = -1; dy <= 1; dy++) {
            const px = (cx + dx) * width;
            const py = (cy + dy) * height;

            const visible =
              px + sizePx * 2 >= 0 &&
              px - sizePx * 2 <= width &&
              py + sizePx * 2 >= 0 &&
              py - sizePx * 2 <= height;
            if (!visible) continue;

            ctx.save();
            ctx.translate(px, py);
            ctx.rotate(rot);
            ctx.scale(ar, 1);

            if (kind < 0.5) {
              const scale = (ax + ay) * 0.5;
              const radius = sizePx * scale;
              ctx.scale(1 / ax, 1 / ay);

              ctx.beginPath();
              for (let k = 0; k < 3; k++) {
                const angle = (Math.PI * 2 * k) / 3 - Math.PI / 2;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                if (k === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
              }
              ctx.closePath();

              if (filled > 0.5) {
                ctx.fillStyle = color;
                ctx.fill();
              } else {
                ctx.strokeStyle = color;
                ctx.lineWidth = Math.max(1, sizePx * 0.15);
                ctx.lineJoin = "round";
                ctx.stroke();
              }
            } else {
              const radius = sizePx;

              ctx.beginPath();
              ctx.moveTo(0, -radius);
              ctx.lineTo(radius, 0);
              ctx.lineTo(0, radius);
              ctx.lineTo(-radius, 0);
              ctx.closePath();

              if (filled > 0.5) {
                ctx.fillStyle = color;
                ctx.fill();
              } else {
                ctx.strokeStyle = color;
                ctx.lineWidth = Math.max(1, sizePx * 0.15);
                ctx.lineJoin = "round";
                ctx.stroke();
              }
            }

            ctx.restore();
          }
        }
      }

      ctx.restore();
    },
    destroy() {},
  };
}
