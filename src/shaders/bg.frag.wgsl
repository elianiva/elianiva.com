// frame: time, res.x, res.y, 0
// shapes: 5 vec4f per shape (see src/lib/webgpu-background.ts)
//   v0 = pos.xy, dir.xy
//   v1 = driftSpeed, driftOffset, rotSpeed, size
//   v2 = kind, filled, aspect.x, aspect.y
//   v3 = color.rgb, breatheSpeed
//   v4 = breathePhase, baseAlpha, 0, 0
@group(0) @binding(0) var<uniform> frame: vec4f;
@group(0) @binding(1) var<uniform> shapes: array<vec4f, 50>;

fn fill(d: f32, w: f32) -> f32 {
  return 1.0 - smoothstep(0.0, w, d);
}

fn stroke(d: f32, w: f32, t: f32) -> f32 {
  return fill(abs(d) - t, w);
}

fn sdTri(p: vec2f, r: f32) -> f32 {
  let k = sqrt(3.0);
  var q: vec2f = p;
  q.x = abs(q.x) - r;
  q.y = q.y + r / k;
  if (q.x + k * q.y > 0.0) {
    q = vec2f(q.x - k * q.y, -k * q.x - q.y) * 0.5;
  }
  q.x -= clamp(q.x, -2.0 * r, 0.0);
  return -length(q) * sign(q.y);
}

fn sdDiamond(p: vec2f, r: f32) -> f32 {
  return (abs(p.x) + abs(p.y) - r) * 0.7071;
}

fn bg(uv: vec2f) -> vec3f {
  let g = dot(uv, vec2f(0.7071, -0.7071)) * 0.5 + 0.5;
  let c0 = vec3f(1.0, 0.9608, 0.9412);
  let c1 = vec3f(1.0, 0.9765, 0.9608);
  let c2 = vec3f(1.0, 0.9412, 0.9608);
  return mix(mix(c0, c1, smoothstep(0.0, 0.5, g)), c2, smoothstep(0.5, 1.0, g));
}

@fragment
fn fs_main(@builtin(position) fragCoord: vec4f) -> @location(0) vec4f {
  let time = frame.x;
  let res = frame.yz;
  let uv = fragCoord.xy / res;
  let ar = res.x / res.y;
  let pAspect = vec2f(ar, 1.0);
  let aa = 1.0 / res.y;

  var col = bg(uv);

  for (var i = 0u; i < 10u; i++) {
    let b = i * 5u;
    let pos = shapes[b].xy;
    let dir = shapes[b].zw;
    let dr = shapes[b + 1u];
    let ka = shapes[b + 2u];
    let c4 = shapes[b + 3u];
    let bp = shapes[b + 4u];

    let t = time * dr.x + dr.y;
    var p = uv - (pos + dir * t);
    p = fract(p + 100.0) - 0.5;
    p = p * pAspect;

    let rot = time * dr.z;
    let c = cos(rot);
    let s = sin(rot);
    p = mat2x2f(c, -s, s, c) * p;

    var d: f32;
    if (ka.x < 0.5) {
      let a = ka.zw;
      let scale = (a.x + a.y) * 0.5;
      d = sdTri(p * a, dr.w * scale) / scale;
    } else {
      d = sdDiamond(p, dr.w);
    }

    var a: f32;
    if (ka.y > 0.5) {
      a = fill(d, aa);
    } else {
      a = stroke(d, aa, dr.w * 0.15);
    }
    a = a * (0.5 + 0.5 * sin(time * c4.w + bp.x));
    a = a * bp.y;

    col = mix(col, c4.xyz, a);
  }

  return vec4f(col, 1.0);
}
