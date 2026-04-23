<script lang="ts">
import { onMount } from "svelte";
import frag from "~/shaders/bg.frag.glsl?raw";
import vert from "~/shaders/bg.vert.glsl?raw";

// biome-ignore lint/style/useConst: DOM ref
let canvas: HTMLCanvasElement;

onMount(() => {
	const gl = canvas.getContext("webgl2", {
		alpha: false,
		antialias: false,
		preserveDrawingBuffer: false,
	});
	if (!gl) return;

	const prefersReducedMotion = window.matchMedia(
		"(prefers-reduced-motion: reduce)",
	).matches;

	const SCALE = 0.4; // render at 40% res, let CSS upscale

	function compile(type: number, source: string) {
		const s = gl.createShader(type)!;
		gl.shaderSource(s, source);
		gl.compileShader(s);
		if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
			console.error(gl.getShaderInfoLog(s));
			gl.deleteShader(s);
			return null;
		}
		return s;
	}

	const vs = compile(gl.VERTEX_SHADER, vert);
	const fs = compile(gl.FRAGMENT_SHADER, frag);
	if (!vs || !fs) return;

	const prog = gl.createProgram()!;
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
	gl.bufferData(
		gl.ARRAY_BUFFER,
		new Float32Array([-1, -1, 3, -1, -1, 3]),
		gl.STATIC_DRAW,
	);
	const aPos = gl.getAttribLocation(prog, "a_pos");
	gl.enableVertexAttribArray(aPos);
	gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

	const uTime = gl.getUniformLocation(prog, "u_time");
	const uRes = gl.getUniformLocation(prog, "u_res");

	let running = true;
	let raf: number;
	let startTime = performance.now();

	function resize() {
		const w = canvas.clientWidth;
		const h = canvas.clientHeight;
		// render at reduced resolution for performance
		canvas.width = w * SCALE;
		canvas.height = h * SCALE;
		gl.viewport(0, 0, canvas.width, canvas.height);
		gl.uniform2f(uRes, canvas.width, canvas.height);
	}

	function render() {
		if (!running) return;
		const t = prefersReducedMotion
			? 0
			: (performance.now() - startTime) * 0.001;
		gl.uniform1f(uTime, t);
		gl.drawArrays(gl.TRIANGLES, 0, 3);
		raf = requestAnimationFrame(render);
	}

	resize();
	window.addEventListener("resize", resize);
	render();

	const observer = new IntersectionObserver(
		(entries) => {
			const visible = entries[0].isIntersecting;
			if (visible && !running) {
				running = true;
				render();
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
});
</script>

<canvas
	bind:this={canvas}
	class="fixed inset-0 w-full h-full pointer-events-none -z-10"
	style="image-rendering: auto;"
	aria-hidden="true"
></canvas>
