#version 300 es
precision mediump float;

#define N 10

uniform float u_time;
uniform vec2 u_res;

uniform vec2 u_pos[N];
uniform vec2 u_dir[N];
uniform float u_driftSpeed[N];
uniform float u_driftOffset[N];
uniform float u_rotSpeed[N];
uniform float u_size[N];
uniform float u_kind[N];
uniform float u_filled[N];
uniform vec2 u_aspect[N];
uniform vec3 u_color[N];
uniform float u_breatheSpeed[N];
uniform float u_breathePhase[N];
uniform float u_baseAlpha[N];

out vec4 outColor;

float fill(float d, float w) {
	return 1.0 - smoothstep(0.0, w, d);
}

float stroke(float d, float w, float t) {
	return fill(abs(d) - t, w);
}

float sdTri(vec2 p, float r) {
	float k = sqrt(3.0);
	p.x = abs(p.x) - r;
	p.y = p.y + r / k;
	if (p.x + k * p.y > 0.0) p = vec2(p.x - k * p.y, -k * p.x - p.y) / 2.0;
	p.x -= clamp(p.x, -2.0 * r, 0.0);
	return -length(p) * sign(p.y);
}

float sdDiamond(vec2 p, float r) {
	return (abs(p.x) + abs(p.y) - r) * 0.7071;
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
	float aa = 1.0 / u_res.y;

	for (int i = 0; i < N; i++) {
		float t = u_time * u_driftSpeed[i] + u_driftOffset[i];
		vec2 p = uv - (u_pos[i] + u_dir[i] * t);
		p = fract(p + 100.0) - 0.5;
		p *= pAspect;

		float rot = u_time * u_rotSpeed[i];
		float c = cos(rot), s = sin(rot);
		p = mat2(c, -s, s, c) * p;

		float d;
		if (u_kind[i] < 0.5) {
			vec2 a = u_aspect[i];
			float scale = (a.x + a.y) * 0.5;
			d = sdTri(p * a, u_size[i] * scale) / scale;
		} else {
			d = sdDiamond(p, u_size[i]);
		}

		float a;
		if (u_filled[i] > 0.5) {
			a = fill(d, aa);
		} else {
			a = stroke(d, aa, u_size[i] * 0.15);
		}

		a *= 0.5 + 0.5 * sin(u_time * u_breatheSpeed[i] + u_breathePhase[i]);
		a *= u_baseAlpha[i];

		col = mix(col, u_color[i], a);
	}

	outColor = vec4(col, 1.0);
}
