#version 300 es
precision mediump float;

uniform float u_time;
uniform vec2 u_res;

out vec4 outColor;

#define N 16
#define PI 3.14159265

// fast hash
float h(float n) { return fract(sin(n) * 43758.5453); }
vec2 h2(float n) { return vec2(h(n), h(n + 73.0)); }
vec3 h3(float n) { return vec3(h(n), h(n + 53.0), h(n + 97.0)); }

// simple SDFs
float tri(vec2 p, float r) {
	float k = sqrt(3.0);
	p.x = abs(p.x) - r;
	p.y = p.y + r / k;
	if (p.x + k * p.y > 0.0) p = vec2(p.x - k * p.y, -k * p.x - p.y) / 2.0;
	p.x -= clamp(p.x, -2.0 * r, 0.0);
	return -length(p) * sign(p.y);
}

float dia(vec2 p, float r) {
	p = abs(p);
	return (p.x + p.y - r) * 0.7071;
}

float line(vec2 p, vec2 a, vec2 b) {
	vec2 pa = p - a, ba = b - a;
	return length(pa - ba * clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0));
}

float spark(vec2 p, float r) {
	p = abs(p);
	return max(
		length(p - vec2(r * 0.5, 0.0)) - r * 0.5,
		length(p - vec2(0.0, r * 0.5)) - r * 0.5
	);
}

float fill(float d, float w) {
	return 1.0 - smoothstep(0.0, w, d);
}
float stroke(float d, float w, float t) {
	return fill(abs(d) - t, w);
}

vec3 pal(float t) {
	// pink/purple/cream, slightly darker than bg for contrast
	vec3 a = vec3(0.88, 0.72, 0.78); // muted pink
	vec3 b = vec3(0.82, 0.78, 0.86); // muted lavender
	vec3 c = vec3(0.90, 0.82, 0.80); // muted cream-pink
	vec3 d = vec3(0.85, 0.74, 0.82); // muted rose
	float m = fract(t * 4.0);
	if (m < 0.33) return mix(a, b, m * 3.0);
	if (m < 0.66) return mix(b, c, (m - 0.33) * 3.0);
	return mix(c, d, (m - 0.66) * 3.0);
}

vec3 bg(vec2 uv) {
	float g = dot(uv, vec2(0.7071, -0.7071)) * 0.5 + 0.5;
	vec3 c0 = vec3(1.0, 0.9608, 0.9412);
	vec3 c1 = vec3(1.0, 0.9765, 0.9608);
	vec3 c2 = vec3(1.0, 0.9412, 0.9608);
	return mix(mix(c0, c1, smoothstep(0.0, 0.5, g)), c2, smoothstep(0.5, 1.0, g));
}

void main() {
	vec2 uv = gl_FragCoord.xy / u_res;
	float ar = u_res.x / u_res.y;
	vec2 pAspect = vec2(ar, 1.0);

	vec3 col = bg(uv);
	float aa = 2.0 / u_res.y;

	for (int i = 0; i < N; i++) {
		float fi = float(i);
		vec3 rnd = h3(fi * 17.0);
		vec2 pos = h2(fi * 31.0);

		int kind = int(rnd.x * 4.0);
		bool filled = rnd.y > 0.5;

		// drift
		float spd = 0.02 + h(fi * 41.0) * 0.03;
		float ang = h(fi * 59.0) * PI * 2.0;
		vec2 dir = vec2(cos(ang), sin(ang));
		float t = u_time * spd;

		vec2 p = uv - (pos + dir * t + dir * h(fi * 71.0) * 10.0);
		p.x = fract(p.x + 50.0) - 0.5;
		p.y = fract(p.y + 50.0) - 0.5;
		p *= pAspect;

		float sz = 0.025 + h(fi * 83.0) * 0.045;

		// rotate
		float rot = u_time * (h(fi * 101.0) - 0.5) * 0.4;
		float c = cos(rot), s = sin(rot);
		p = mat2(c, -s, s, c) * p;

		// SDF
		float d = 1e5;
		if (kind == 0) d = tri(p, sz);
		else if (kind == 1) d = dia(p, sz * 1.2);
		else if (kind == 2) d = spark(p, sz * 1.5);
		else {
			float la = h(fi * 127.0) * PI;
			float lc = cos(la), ls = sin(la);
			vec2 a = mat2(lc, -ls, ls, lc) * vec2(-sz * 2.5, 0.0);
			vec2 b = mat2(lc, -ls, ls, lc) * vec2(sz * 2.5, 0.0);
			d = line(p, a, b);
		}

		// render
		float a = 0.0;
		if (kind == 3) a = fill(d, aa) * 0.6;
		else if (filled) a = fill(d, aa);
		else a = stroke(d, aa, sz * 0.12);

		// breathe
		a *= 0.5 + 0.5 * sin(u_time * (0.4 + h(fi * 137.0) * 0.6) + fi * 7.0);
		a *= 0.15 + h(fi * 149.0) * 0.08;

		col = mix(col, pal(h(fi * 163.0)), a);
	}

	outColor = vec4(col, 1.0);
}
