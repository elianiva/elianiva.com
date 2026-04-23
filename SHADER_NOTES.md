# Learning Shaders: Project Sekai Background Breakdown

This walks through every line of the canvas background shader we built, assuming you know almost nothing about shaders.

---

## 1. What Is a Shader?

A shader is a small program that runs on your **GPU** (not CPU). It executes in parallel for every pixel on screen. There are two main types:

- **Vertex shader**: Decides *where* things go on screen (vertex = point in 3D space)
- **Fragment shader**: Decides *what color* each pixel is (fragment = pixel candidate)

We use **WebGL2**, which lets us write shaders in **GLSL** (OpenGL Shading Language).

---

## 2. The Big Picture

Our setup does this every frame:

```
JavaScript: create canvas → compile shaders → draw a giant triangle
                                    ↓
GPU: vertex shader places triangle → fragment shader colors every pixel
```

The fragment shader runs once **for every single pixel** on the canvas, in parallel. This is why shaders are fast — the GPU processes thousands of pixels simultaneously.

---

## 3. The Vertex Shader (`bg.vert.glsl`)

```glsl
#version 300 es
in vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
```

### `#version 300 es`
Tells the GPU we are using WebGL2 / GLSL ES 3.0. Must be the very first line.

### `in vec2 a_pos;`
Declares an **input** variable. `vec2` means a 2D vector (x, y). `a_pos` receives vertex positions from JavaScript.

### `gl_Position`
A built-in variable. You *must* write to this. It tells the GPU where this vertex goes in **clip space**.

### `vec4(a_pos, 0.0, 1.0)`
Converts our `vec2` (x, y) into a `vec4` (x, y, z, w). Clip space goes from `-1` to `+1`:
- `(-1, -1)` = bottom-left corner
- `(+1, +1)` = top-right corner
- `z = 0.0` = flat on the screen
- `w = 1.0` = required for math reasons (homogeneous coordinates)

### Why a giant triangle?

In JavaScript we pass these 3 points:
```js
[-1, -1,   // bottom-left
  3, -1,   // way off-screen to the right
-1,  3]    // way off-screen above
```

This creates a triangle so large it completely covers the canvas. This is a common trick — simpler than drawing a proper rectangle (2 triangles), and the GPU clips the off-screen parts for free.

---

## 4. The Fragment Shader (`bg.frag.glsl`)

This is where the magic happens. It runs once per pixel.

### `#version 300 es`
Same as vertex shader — WebGL2.

### `precision mediump float;`
Tells the GPU how precise floating-point numbers should be.
- `highp` = very precise, slower
- `mediump` = medium precision, faster
- `lowp` = rough, fastest

We use `mediump` because we don't need extreme precision for soft shapes.

### Uniforms

```glsl
uniform float u_time;
uniform vec2 u_res;
```

**Uniforms** are variables that are the same for *all* pixels in a single draw call. JavaScript sets them before drawing.

- `u_time`: seconds elapsed, makes things animate
- `u_res`: canvas width/height in pixels, used for aspect ratio correction

### `out vec4 outColor;`
In WebGL2, you declare your output color explicitly. `vec4` = (red, green, blue, alpha). Range is `0.0` to `1.0`.

---

## 5. Hash Functions (Fake Randomness)

GPUs have no built-in random number generator. We fake it with math.

```glsl
float h(float n) { return fract(sin(n) * 43758.5453); }
```

### How it works:
1. Feed in a number `n` (e.g., `1.0`, `2.0`, `17.5`)
2. `sin(n)` — sine produces a wave between -1 and 1
3. Multiply by a large constant — scales the wave into high-frequency chaos
4. `fract(...)` — returns the fractional part (everything after the decimal point)

The result looks random and is **deterministic**: `h(1.0)` always returns the same value. This is crucial — every pixel that calls `h(1.0)` gets the same "random" number.

### Variations:
```glsl
vec2 h2(float n) { return vec2(h(n), h(n + 73.0)); }
vec3 h3(float n) { return vec3(h(n), h(n + 53.0), h(n + 97.0)); }
```

These generate 2D and 3D "random" vectors by offsetting the seed with different constants.

---

## 6. SDFs — Signed Distance Functions

An **SDF** is a function that, given a point, tells you how far it is from the edge of a shape. Negative = inside, positive = outside, zero = exactly on the edge.

### Why SDFs?
With SDFs you can:
- Draw perfect shapes at any size
- Apply rotation, scaling, and blending easily
- Get smooth anti-aliased edges "for free"

### Triangle SDF
```glsl
float tri(vec2 p, float r) {
    float k = sqrt(3.0);
    p.x = abs(p.x) - r;
    p.y = p.y + r / k;
    if (p.x + k * p.y > 0.0) p = vec2(p.x - k * p.y, -k * p.x - p.y) / 2.0;
    p.x -= clamp(p.x, -2.0 * r, 0.0);
    return -length(p) * sign(p.y);
}
```

This is a well-known optimized equilateral triangle SDF. Don't try to derive it from scratch — SDFs are like recipes from a cookbook. The key insight: it returns distance from the triangle edge, and we only care about the distance value.

### Diamond SDF
```glsl
float dia(vec2 p, float r) {
    p = abs(p);           // mirror to top-right quadrant
    return (p.x + p.y - r) * 0.7071;
}
```

A diamond is just a square rotated 45°. The formula `x + y = r` describes a diagonal line. `0.7071` is `1/sqrt(2)`, correcting for the rotation.

### Line Segment SDF
```glsl
float line(vec2 p, vec2 a, vec2 b) {
    vec2 pa = p - a, ba = b - a;
    return length(pa - ba * clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0));
}
```

Finds the closest point on segment `a-b` to point `p`, then returns that distance.

### Sparkle SDF
```glsl
float spark(vec2 p, float r) {
    p = abs(p);
    return max(
        length(p - vec2(r * 0.5, 0.0)) - r * 0.5,
        length(p - vec2(0.0, r * 0.5)) - r * 0.5
    );
}
```

A sparkle is two overlapping circles, one horizontal and one vertical. `max` of their SDFs creates the intersection shape — a 4-pointed star/diamond.

---

## 7. Rendering Shapes

### From distance to color
```glsl
float fill(float d, float w) {
    return 1.0 - smoothstep(0.0, w, d);
}
float stroke(float d, float w, float t) {
    return fill(abs(d) - t, w);
}
```

- `fill(d, w)`: full solid shape. When `d` is negative (inside), returns ~1.0. When `d` is positive (outside), returns ~0.0. The transition zone is `w` pixels wide, creating soft anti-aliased edges.
- `stroke(d, w, t)`: hollow outline. Subtract thickness `t` from the distance, then fill the rim.

### Example
If a pixel is at distance `d = -2.0` from a triangle edge (deep inside), and `w = 0.01`:
- `smoothstep(0.0, 0.01, -2.0)` returns `0.0`
- `fill` returns `1.0` → fully visible

If `d = +2.0` (far outside):
- `smoothstep(0.0, 0.01, 2.0)` returns `1.0`
- `fill` returns `0.0` → invisible

If `d = 0.005` (on the edge):
- `smoothstep(0.0, 0.01, 0.005)` returns `0.5`
- `fill` returns `0.5` → half-bright, soft edge

---

## 8. The Main Loop

```glsl
void main() {
    vec2 uv = gl_FragCoord.xy / u_res;
    ...
}
```

### `gl_FragCoord.xy`
The pixel's position in screen coordinates: `(0, 0)` at bottom-left, `(width, height)` at top-right.

### Normalizing to UV space
`uv = gl_FragCoord.xy / u_res` converts this to `0.0`–`1.0` range, regardless of screen size. This makes the shader resolution-independent.

### Aspect ratio correction
```glsl
float ar = u_res.x / u_res.y;
vec2 pAspect = vec2(ar, 1.0);
```

Without this, shapes would stretch on wide screens. We multiply points by `(ar, 1.0)` to keep shapes square.

---

## 9. Background Gradient

```glsl
vec3 bg(vec2 uv) {
    float g = dot(uv, vec2(0.7071, -0.7071)) * 0.5 + 0.5;
    vec3 c0 = vec3(1.0, 0.9608, 0.9412);  // cream
    vec3 c1 = vec3(1.0, 0.9765, 0.9608);  // lighter cream
    vec3 c2 = vec3(1.0, 0.9412, 0.9608);  // blush
    return mix(mix(c0, c1, smoothstep(0.0, 0.5, g)), c2, smoothstep(0.5, 1.0, g));
}
```

### `dot(uv, vec2(0.7071, -0.7071))`
`0.7071` is `1/sqrt(2)`. This creates a diagonal gradient from bottom-left to top-right. `dot` projects `uv` onto a diagonal axis.

### `smoothstep(a, b, x)`
A smooth interpolation function:
- Returns `0.0` when `x <= a`
- Returns `1.0` when `x >= b`
- Smooth S-curve in between

### `mix(a, b, t)`
Linear interpolation: `a * (1-t) + b * t`. Blends between two colors.

### The gradient logic
First blend `c0 → c1` over the first half of the diagonal, then blend that result `→ c2` over the second half. This creates a 3-color soft gradient.

---

## 10. Shape Loop

```glsl
for (int i = 0; i < N; i++) {
    float fi = float(i);
    ...
}
```

We draw `N = 16` shapes. The loop runs for every pixel, but the shapes are positioned via hash functions so they appear in the same place on every pixel (deterministic).

Wait — how does that work? If every pixel runs the same code with the same `i`, don't all pixels see the same shape?

**No!** Because `uv` (pixel position) is different for each pixel. The shape is defined by its SDF relative to `uv`. Most pixels are "far away" from a given shape and get `alpha = 0`. Only pixels near the shape's position get a non-zero color.

### Randomizing each shape
```glsl
vec3 rnd = h3(fi * 17.0);   // 3 random values for this shape
vec2 pos = h2(fi * 31.0);   // random starting position
int kind = int(rnd.x * 4.0); // 0=tri, 1=dia, 2=spark, 3=line
bool filled = rnd.y > 0.5;   // coin flip: filled or outline
```

Each shape gets a unique seed derived from its index `i`. We multiply by different constants (`17.0`, `31.0`) so the hash outputs are uncorrelated.

### Drift (animation)
```glsl
float spd = 0.02 + h(fi * 41.0) * 0.03;
float ang = h(fi * 59.0) * PI * 2.0;
vec2 dir = vec2(cos(ang), sin(ang));
float t = u_time * spd;

vec2 p = uv - (pos + dir * t + dir * h(fi * 71.0) * 10.0);
```

- `spd`: random speed for this shape
- `ang`: random drift direction
- `dir * t`: position changes over time → movement
- `dir * h(...) * 10.0`: random starting offset so shapes don't all start at the same phase

### Wrapping (infinite field)
```glsl
p.x = fract(p.x + 50.0) - 0.5;
p.y = fract(p.y + 50.0) - 0.5;
```

`fract(x)` returns the fractional part of `x` (wraps to `0.0`–`1.0`). Adding `50.0` ensures we never get negative values before `fract`. Subtracting `0.5` centers the range to `-0.5`–`+0.5`.

This creates an infinitely repeating field: shapes that drift off-screen wrap around to the other side.

### Rotation
```glsl
float rot = u_time * (h(fi * 101.0) - 0.5) * 0.4;
float c = cos(rot), s = sin(rot);
p = mat2(c, -s, s, c) * p;
```

Builds a 2D rotation matrix and multiplies the point. Each shape spins at a different random speed and direction (`-0.5` centers the speed range around zero).

### Rendering each shape
```glsl
float d = 1e5;
if (kind == 0) d = tri(p, sz);
else if (kind == 1) d = dia(p, sz * 1.2);
else if (kind == 2) d = spark(p, sz * 1.5);
else { ... d = line(p, a, b); }

float a = 0.0;
if (kind == 3) a = fill(d, aa) * 0.6;
else if (filled) a = fill(d, aa);
else a = stroke(d, aa, sz * 0.12);
```

- Pick the SDF based on shape kind
- Compute alpha based on fill vs outline
- Lines are thinner (`* 0.6`)

### Breathing
```glsl
a *= 0.5 + 0.5 * sin(u_time * (0.4 + h(fi * 137.0) * 0.6) + fi * 7.0);
```

Sine wave oscillates between `0.0` and `1.0`. `0.5 + 0.5 * sin(...)` remaps to `0.0`–`1.0`. Each shape has a different frequency and phase, so they don't pulse in unison.

### Opacity
```glsl
a *= 0.10 + h(fi * 149.0) * 0.08;
```

Final opacity multiplier. Range: `0.10` to `0.18`. Very subtle — we want background decoration, not foreground elements.

### Blending into the background
```glsl
col = mix(col, pal(h(fi * 163.0)), a);
```

`mix(existing_color, shape_color, alpha)` blends the shape over the background. This is how all 16 shapes stack on top of the gradient.

---

## 11. Color Palette

```glsl
vec3 pal(float t) {
    vec3 a = vec3(0.88, 0.72, 0.78); // muted pink
    vec3 b = vec3(0.82, 0.78, 0.86); // muted lavender
    vec3 c = vec3(0.90, 0.82, 0.80); // muted cream-pink
    vec3 d = vec3(0.85, 0.74, 0.82); // muted rose
    float m = fract(t * 4.0);
    if (m < 0.33) return mix(a, b, m * 3.0);
    if (m < 0.66) return mix(b, c, (m - 0.33) * 3.0);
    return mix(c, d, (m - 0.66) * 3.0);
}
```

4 colors, cycling based on hash `t`. `fract(t * 4.0)` maps the random `0.0`–`1.0` input to `0.0`–`1.0` repeating 4 times. Then we blend between adjacent colors in 3 segments.

These colors are **darker than the background** so shapes are actually visible. If they matched the background exactly, you'd see nothing.

---

## 12. JavaScript Setup (Svelte)

### Canvas context
```js
const gl = canvas.getContext("webgl2", {
    alpha: false,              // no transparency, we handle bg in shader
    antialias: false,          // we anti-alias in the shader via SDFs
    preserveDrawingBuffer: false,  // allow compositor optimization
});
```

### Shader compilation
```js
function compile(type, source) {
    const s = gl.createShader(type);
    gl.shaderSource(s, source);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(s));
        return null;
    }
    return s;
}
```

1. Create shader object
2. Feed it GLSL source code
3. Compile it on the GPU
4. Check for compilation errors (syntax mistakes in GLSL)

### Program linking
```js
const prog = gl.createProgram();
gl.attachShader(prog, vs);
gl.attachShader(prog, fs);
gl.linkProgram(prog);
```

A **program** is a vertex + fragment shader pair. Linking connects them: the GPU knows which vertex outputs feed into which fragment inputs.

### Fullscreen quad buffer
```js
const buf = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buf);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
```

Creates a GPU buffer with our 3 giant triangle vertices. `STATIC_DRAW` tells the GPU this data never changes.

### Attribute setup
```js
const aPos = gl.getAttribLocation(prog, "a_pos");
gl.enableVertexAttribArray(aPos);
gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
```

- `getAttribLocation`: finds the `in vec2 a_pos` variable in our vertex shader
- `enableVertexAttribArray`: turn on this attribute
- `vertexAttribPointer`: "read 2 floats per vertex from the buffer"

### Uniforms
```js
const uTime = gl.getUniformLocation(prog, "u_time");
const uRes = gl.getUniformLocation(prog, "u_res");
```

Finds the uniform variables so we can update them from JS.

### Render loop
```js
function render() {
    const t = (performance.now() - startTime) * 0.001;
    gl.uniform1f(uTime, t);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    raf = requestAnimationFrame(render);
}
```

- `uniform1f`: sets `u_time` to current seconds
- `drawArrays`: draws 3 vertices as 1 triangle
- `requestAnimationFrame`: schedule next frame (syncs to monitor refresh rate)

---

## 13. Performance Optimizations

### Resolution scaling
```js
const SCALE = 0.4;
canvas.width = w * SCALE;
canvas.height = h * SCALE;
```

We render at 40% resolution and let CSS scale up. The canvas is `1920x1080` CSS pixels but only `768x432` actual pixels. Since our shapes are soft and blurry anyway, this looks fine but uses **~6x fewer pixels** to shade.

### IntersectionObserver
```js
const observer = new IntersectionObserver((entries) => {
    const visible = entries[0].isIntersecting;
    if (visible && !running) { running = true; render(); }
    else if (!visible && running) { running = false; cancelAnimationFrame(raf); }
});
```

Pauses the animation when the canvas scrolls off-screen. Saves GPU when the user is on another page or scrolled past.

### prefers-reduced-motion
```js
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
```

If the user has motion sensitivity enabled, we set `u_time = 0` permanently. Shapes render but don't move.

### Shape count
We use only `16` shapes. The GPU loops over all 16 for every pixel. Fewer shapes = less work per pixel = better performance.

---

## 14. Why the Hash Seed Matters

Every shape parameter comes from hashing some combination of:
- `fi` (float index: 0, 1, 2, ... 15)
- A magic constant multiplier (17, 31, 41, 59, ...)

```glsl
vec3 rnd = h3(fi * 17.0);   // shape type, filled/outline, unused
vec2 pos = h2(fi * 31.0);   // position
float spd = 0.02 + h(fi * 41.0) * 0.03;  // speed
```

Different multipliers ensure the hash outputs are uncorrelated. If you used `fi * 17.0` for everything, position and speed and rotation would all move together in predictable patterns.

The `+ 1.0`, `+ 2.0` offsets you see in some code serve the same purpose — shifting the hash sequence.

---

## 15. Modifying Things

### Make shapes bigger
Change `sz`:
```glsl
float sz = 0.025 + h(fi * 83.0) * 0.045;  // currently 0.025 to 0.07
// try:
float sz = 0.05 + h(fi * 83.0) * 0.08;
```

### Make them move faster
Change `spd`:
```glsl
float spd = 0.02 + h(fi * 41.0) * 0.03;
// try:
float spd = 0.05 + h(fi * 41.0) * 0.08;
```

### Change colors
Edit the `pal()` function. Values are RGB in `0.0`–`1.0` range.

### Add more shapes
Change `#define N 16` to a higher number, but watch performance.

### Change the background
Edit `bg()` — the 3 color values `c0`, `c1`, `c2`.

---

## 16. Glossary

| Term | Meaning |
|------|---------|
| **Shader** | GPU program that processes vertices/pixels |
| **GLSL** | C-like language for writing shaders |
| **Vertex** | A point in 2D/3D space |
| **Fragment** | A pixel candidate (before final output) |
| **Uniform** | A variable with the same value for all pixels |
| **Attribute** | Per-vertex input data |
| **Varying** | Data passed from vertex to fragment shader |
| **SDF** | Signed Distance Function — returns distance from shape edge |
| **UV** | Normalized texture/pixel coordinates (0–1) |
| **Clip space** | Coordinate system where -1 to +1 maps to screen |
| **Hash** | Deterministic pseudo-random function |
| **DPR** | Device Pixel Ratio (retina = 2x, 3x) |
