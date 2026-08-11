import fragSource from "~/shaders/bg.frag.glsl?raw";
import vertSource from "~/shaders/bg.vert.glsl?raw";
import type { BackgroundRenderer, ShapeParams } from "./background";

export function createWebGLRenderer(
  canvas: HTMLCanvasElement,
  shapes: ShapeParams,
  onLost: () => void,
): BackgroundRenderer | null {
  const gl = canvas.getContext("webgl2", {
    alpha: false,
    antialias: false,
    preserveDrawingBuffer: false,
  })!;
  if (!gl) return null;

  const onContextLost = (event: Event) => {
    event.preventDefault();
    onLost();
  };
  canvas.addEventListener("webglcontextlost", onContextLost);

  function compile(type: number, source: string) {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  const vs = compile(gl.VERTEX_SHADER, vertSource);
  const fs = compile(gl.FRAGMENT_SHADER, fragSource);
  if (!vs || !fs) return null;

  const prog = gl.createProgram();
  if (!prog) return null;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(prog));
    return null;
  }
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, "a_pos");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const uniform = (name: string) => gl.getUniformLocation(prog, name);
  const uTime = uniform("u_time");
  const uRes = uniform("u_res");
  gl.uniform2fv(uniform("u_pos"), shapes.pos);
  gl.uniform2fv(uniform("u_dir"), shapes.dir);
  gl.uniform1fv(uniform("u_driftSpeed"), shapes.driftSpeed);
  gl.uniform1fv(uniform("u_driftOffset"), shapes.driftOffset);
  gl.uniform1fv(uniform("u_rotSpeed"), shapes.rotSpeed);
  gl.uniform1fv(uniform("u_size"), shapes.size);
  gl.uniform1fv(uniform("u_kind"), shapes.kind);
  gl.uniform1fv(uniform("u_filled"), shapes.filled);
  gl.uniform2fv(uniform("u_aspect"), shapes.aspect);
  gl.uniform3fv(uniform("u_color"), shapes.color);
  gl.uniform1fv(uniform("u_breatheSpeed"), shapes.breatheSpeed);
  gl.uniform1fv(uniform("u_breathePhase"), shapes.breathePhase);
  gl.uniform1fv(uniform("u_baseAlpha"), shapes.baseAlpha);

  return {
    resize(width, height) {
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
      gl.uniform2f(uRes, width, height);
    },
    frame(time) {
      gl.uniform1f(uTime, time);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    destroy() {
      canvas.removeEventListener("webglcontextlost", onContextLost);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buf);
    },
  };
}
