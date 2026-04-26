import { useRef, useEffect } from 'react'
import fragSource from '#/shaders/bg.frag.glsl?raw'
import vertSource from '#/shaders/bg.vert.glsl?raw'

const N = 10

function createShader(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)!
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }
  return shader
}

function createProgram(gl: WebGL2RenderingContext, vs: WebGLShader, fs: WebGLShader) {
  const program = gl.createProgram()!
  gl.attachShader(program, vs)
  gl.attachShader(program, fs)
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program))
    gl.deleteProgram(program)
    return null
  }
  return program
}

function random(min: number, max: number) {
  return Math.random() * (max - min) + min
}

export function CanvasBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    const gl = canvas.getContext('webgl2', { alpha: false, antialias: false })
    if (!gl) return

    const c = canvas

    const vs = createShader(gl, gl.VERTEX_SHADER, vertSource)
    const fs = createShader(gl, gl.FRAGMENT_SHADER, fragSource)
    if (!vs || !fs) return

    const program = createProgram(gl, vs, fs)
    if (!program) return

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)

    const aPos = gl.getAttribLocation(program, 'a_pos')
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

    const uTime = gl.getUniformLocation(program, 'u_time')
    const uRes = gl.getUniformLocation(program, 'u_res')
    const uPos = gl.getUniformLocation(program, 'u_pos')
    const uDir = gl.getUniformLocation(program, 'u_dir')
    const uDriftSpeed = gl.getUniformLocation(program, 'u_driftSpeed')
    const uDriftOffset = gl.getUniformLocation(program, 'u_driftOffset')
    const uRotSpeed = gl.getUniformLocation(program, 'u_rotSpeed')
    const uSize = gl.getUniformLocation(program, 'u_size')
    const uKind = gl.getUniformLocation(program, 'u_kind')
    const uFilled = gl.getUniformLocation(program, 'u_filled')
    const uAspect = gl.getUniformLocation(program, 'u_aspect')
    const uColor = gl.getUniformLocation(program, 'u_color')
    const uBreatheSpeed = gl.getUniformLocation(program, 'u_breatheSpeed')
    const uBreathePhase = gl.getUniformLocation(program, 'u_breathePhase')
    const uBaseAlpha = gl.getUniformLocation(program, 'u_baseAlpha')

    const posArr = new Float32Array(N * 2)
    const dirArr = new Float32Array(N * 2)
    const driftSpeedArr = new Float32Array(N)
    const driftOffsetArr = new Float32Array(N)
    const rotSpeedArr = new Float32Array(N)
    const sizeArr = new Float32Array(N)
    const kindArr = new Float32Array(N)
    const filledArr = new Float32Array(N)
    const aspectArr = new Float32Array(N * 2)
    const colorArr = new Float32Array(N * 3)
    const breatheSpeedArr = new Float32Array(N)
    const breathePhaseArr = new Float32Array(N)
    const baseAlphaArr = new Float32Array(N)

    for (let i = 0; i < N; i++) {
      posArr[i * 2] = random(0, 1)
      posArr[i * 2 + 1] = random(0, 1)
      dirArr[i * 2] = random(-0.3, 0.3)
      dirArr[i * 2 + 1] = random(-0.3, 0.3)
      driftSpeedArr[i] = random(0.05, 0.15)
      driftOffsetArr[i] = random(0, Math.PI * 2)
      rotSpeedArr[i] = random(-0.5, 0.5)
      sizeArr[i] = random(0.03, 0.08)
      kindArr[i] = Math.random() > 0.5 ? 1 : 0
      filledArr[i] = Math.random() > 0.5 ? 1 : 0
      aspectArr[i * 2] = random(0.8, 1.2)
      aspectArr[i * 2 + 1] = random(0.8, 1.2)
      colorArr[i * 3] = random(0.9, 1.0)
      colorArr[i * 3 + 1] = random(0.8, 0.95)
      colorArr[i * 3 + 2] = random(0.85, 0.95)
      breatheSpeedArr[i] = random(0.5, 1.5)
      breathePhaseArr[i] = random(0, Math.PI * 2)
      baseAlphaArr[i] = random(0.1, 0.25)
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio, 1.5)
      const w = window.innerWidth
      const h = window.innerHeight
      c.width = w * dpr
      c.height = h * dpr
      gl!.viewport(0, 0, c.width, c.height)
    }

    resize()
    window.addEventListener('resize', resize)

    const startTime = performance.now()

    function render(now: number) {
      const elapsed = (now - startTime) / 1000
      gl!.useProgram(program)
      gl!.uniform1f(uTime, elapsed)
      gl!.uniform2f(uRes, c.width, c.height)
      gl!.uniform2fv(uPos, posArr)
      gl!.uniform2fv(uDir, dirArr)
      gl!.uniform1fv(uDriftSpeed, driftSpeedArr)
      gl!.uniform1fv(uDriftOffset, driftOffsetArr)
      gl!.uniform1fv(uRotSpeed, rotSpeedArr)
      gl!.uniform1fv(uSize, sizeArr)
      gl!.uniform1fv(uKind, kindArr)
      gl!.uniform1fv(uFilled, filledArr)
      gl!.uniform2fv(uAspect, aspectArr)
      gl!.uniform3fv(uColor, colorArr)
      gl!.uniform1fv(uBreatheSpeed, breatheSpeedArr)
      gl!.uniform1fv(uBreathePhase, breathePhaseArr)
      gl!.uniform1fv(uBaseAlpha, baseAlphaArr)
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4)
      rafRef.current = requestAnimationFrame(render)
    }

    // 30fps cap
    const interval = 1000 / 30
    let then = performance.now()

    function loop(now: number) {
      rafRef.current = requestAnimationFrame(loop)
      const delta = now - then
      if (delta >= interval) {
        then = now - (delta % interval)
        render(now)
      }
    }

    // Intersection observer to pause when not visible
    let isVisible = true
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting
        if (isVisible && !rafRef.current) {
          rafRef.current = requestAnimationFrame(loop)
        }
      },
      { threshold: 0 }
    )
    observer.observe(canvas)

    rafRef.current = requestAnimationFrame(loop)

    return () => {
      window.removeEventListener('resize', resize)
      observer.disconnect()
      cancelAnimationFrame(rafRef.current)
      gl.deleteProgram(program)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
      gl.deleteBuffer(buf)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -2,
        pointerEvents: 'none',
      }}
    />
  )
}
