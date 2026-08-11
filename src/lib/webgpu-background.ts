import fragSource from "~/shaders/bg.frag.wgsl?raw";
import vertSource from "~/shaders/bg.vert.wgsl?raw";
import type { BackgroundRenderer, ShapeParams } from "./background";
import { N } from "./background";

const RING = 3;
const VEC4S_PER_SHAPE = 5;

function packShapes(shapes: ShapeParams): Float32Array {
  const flat = new Float32Array(N * VEC4S_PER_SHAPE * 4);
  for (let i = 0; i < N; i++) {
    const o = i * VEC4S_PER_SHAPE * 4;
    flat[o] = shapes.pos[i * 2];
    flat[o + 1] = shapes.pos[i * 2 + 1];
    flat[o + 2] = shapes.dir[i * 2];
    flat[o + 3] = shapes.dir[i * 2 + 1];
    flat[o + 4] = shapes.driftSpeed[i];
    flat[o + 5] = shapes.driftOffset[i];
    flat[o + 6] = shapes.rotSpeed[i];
    flat[o + 7] = shapes.size[i];
    flat[o + 8] = shapes.kind[i];
    flat[o + 9] = shapes.filled[i];
    flat[o + 10] = shapes.aspect[i * 2];
    flat[o + 11] = shapes.aspect[i * 2 + 1];
    flat[o + 12] = shapes.color[i * 3];
    flat[o + 13] = shapes.color[i * 3 + 1];
    flat[o + 14] = shapes.color[i * 3 + 2];
    flat[o + 15] = shapes.breatheSpeed[i];
    flat[o + 16] = shapes.breathePhase[i];
    flat[o + 17] = shapes.baseAlpha[i];
  }
  return flat;
}

export async function createWebGPURenderer(
  canvas: HTMLCanvasElement,
  shapes: ShapeParams,
  onLost: () => void,
): Promise<BackgroundRenderer | null> {
  const adapter = await navigator.gpu?.requestAdapter();
  if (!adapter) return null;

  const device = await adapter.requestDevice();
  const context = canvas.getContext("webgpu");
  if (!context) return null;

  let destroyed = false;
  void device.lost.then(() => {
    if (!destroyed) onLost();
  });

  const format = navigator.gpu.getPreferredCanvasFormat();

  const vertModule = device.createShaderModule({ code: vertSource });
  const fragModule = device.createShaderModule({ code: fragSource });

  const bindGroupLayout = device.createBindGroupLayout({
    entries: [
      {
        binding: 0,
        visibility: GPUShaderStage.FRAGMENT,
        buffer: { type: "uniform", minBindingSize: 16 },
      },
      {
        binding: 1,
        visibility: GPUShaderStage.FRAGMENT,
        buffer: { type: "uniform" },
      },
    ],
  });

  const pipeline = device.createRenderPipeline({
    layout: device.createPipelineLayout({ bindGroupLayouts: [bindGroupLayout] }),
    vertex: { module: vertModule, entryPoint: "vs_main" },
    fragment: {
      module: fragModule,
      entryPoint: "fs_main",
      targets: [{ format }],
    },
    primitive: { topology: "triangle-list" },
  });

  const shapesData = packShapes(shapes);
  const shapesBuffer = device.createBuffer({
    size: shapesData.byteLength,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });
  device.queue.writeBuffer(shapesBuffer, 0, shapesData);

  const frameBuffers = Array.from({ length: RING }, () =>
    device.createBuffer({
      size: 16,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    }),
  );
  const bindGroups = frameBuffers.map((buffer) =>
    device.createBindGroup({
      layout: bindGroupLayout,
      entries: [
        { binding: 0, resource: { buffer } },
        { binding: 1, resource: { buffer: shapesBuffer } },
      ],
    }),
  );

  const frameData = new Float32Array(4);
  let frameIndex = 0;
  let width = 0;
  let height = 0;

  return {
    resize(w, h) {
      width = w;
      height = h;
      canvas.width = w;
      canvas.height = h;
      context.configure({
        device,
        format,
        alphaMode: "opaque",
      });
    },
    frame(time) {
      if (width === 0 || height === 0) return;
      const slot = frameIndex % RING;
      frameIndex++;
      frameData[0] = time;
      frameData[1] = width;
      frameData[2] = height;
      device.queue.writeBuffer(frameBuffers[slot], 0, frameData);

      const view = context.getCurrentTexture().createView();
      const encoder = device.createCommandEncoder();
      const pass = encoder.beginRenderPass({
        colorAttachments: [
          {
            view,
            loadOp: "clear",
            storeOp: "store",
            clearValue: { r: 1.0, g: 0.96, b: 0.94, a: 1.0 },
          },
        ],
      });
      pass.setPipeline(pipeline);
      pass.setBindGroup(0, bindGroups[slot]);
      pass.draw(3);
      pass.end();
      device.queue.submit([encoder.finish()]);
    },
    destroy() {
      destroyed = true;
      shapesBuffer.destroy();
      frameBuffers.forEach((buffer) => buffer.destroy());
      device.destroy();
    },
  };
}
