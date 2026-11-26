"use client";

import { useEffect, useRef } from "react";

/**
 * « Soffit » — dégradé WebGL2 animé (un triangle plein écran, un fragment shader).
 * Toute la transformation a lieu dans le shader ; le CPU ne fait que suivre le pointeur
 * (deux ressorts, 0.105 puis 0.043) et téléverser deux uniformes par image.
 * La palette vit dans CONFIG uniquement : ne jamais modifier le GLSL pour recolorer.
 * Palette « crépuscule » : les violets et le rose d'horizon du thème Kalima (seules les couleurs
 * de CONFIG ont changé par rapport aux paramètres fournis).
 */
const CONFIG = {
  bgColor: "#140d2b",
  colorA: "#4b2fb0",
  colorB: "#8d74ff",
  colorC: "#e9a3c9",
  colorD: "#f4e6cf",
  scale: 0.4,
  speed: 0.235,
  tilt: 2.96,
  rock: 0.3,
  horizon: 0.15,
  breathe: 0.12,
  spread: -2.03,
  curve: 3.14,
  direct: 0.6,
  bounce: 0.64,
  bounceCurve: 2.2,
  spillCentre: 0.12,
  spillWidth: 1.91,
  spillFloor: 0.66,
  amount: 0.47,
  warp: 2.83,
  warpScale: 1.2,
  flow: 0.2,
  roughness: 0.53,
  lacunarity: 2.23,
  motes: 0.074,
  moteScale: 18,
  ambient: 0.16,
  contrast: 1.9,
  midpoint: 0.78,
  sink: 0.1,
  glow: 0.29,
  grain: 0,
  grainAnim: 0,
  dither: 1.11,
  vignette: 0.07,
  steer: -0.24,
  lift: 0.09,
  sweep: 0.32,
  cursor: 1,
  parallax: 0.01,
  maxDpr: 1,
} as const;

const VERT = `#version 300 es
void main() {
  vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

const FRAG = `#version 300 es
precision highp float;
out vec4 fragColor;

uniform vec2  iResolution;
uniform float iTime;
uniform vec2  iMouse;
uniform float uScale;

uniform vec3  uBg, uColorA, uColorB, uColorC, uColorD;
uniform float uSpeed, uTilt, uRock, uHorizon, uBreathe, uSpread, uCurve, uDirect;
uniform float uBounce, uBounceCurve;
uniform float uSpillCentre, uSpillWidth, uSpillFloor;
uniform float uAmount, uWarp, uWarpScale, uFlow, uRoughness, uLacunarity, uMotes, uMoteScale;
uniform float uAmbient, uContrast, uMidpoint, uSink, uGlow;
uniform float uGrain, uDither, uVignette;
uniform float uSteer, uLift, uSweep, uParallax;

#define OCTAVES 4

vec2 hash2(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}

float snoise(vec2 p) {
  const float K1 = 0.366025404, K2 = 0.211324865;
  vec2 i = floor(p + (p.x + p.y) * K1);
  vec2 a = p - i + (i.x + i.y) * K2;
  float m = step(a.y, a.x);
  vec2 o = vec2(m, 1.0 - m);
  vec2 b = a - o + K2;
  vec2 c = a - 1.0 + 2.0 * K2;
  vec3 h = max(0.5 - vec3(dot(a, a), dot(b, b), dot(c, c)), 0.0);
  vec3 n = h * h * h * h * vec3(dot(a, hash2(i)), dot(b, hash2(i + o)), dot(c, hash2(i + 1.0)));
  return dot(n, vec3(70.0));
}

float fbm(vec2 p) {
  float v = 0.0, amp = 0.5;
  for (int i = 0; i < OCTAVES; i++) {
    v += amp * snoise(p);
    p *= uLacunarity;
    amp *= uRoughness;
  }
  return v;
}

vec3 ramp4(float t) {
  vec3 c = mix(uColorA, uColorB, smoothstep(0.00, 0.36, t));
  c = mix(c, uColorC, smoothstep(0.32, 0.70, t));
  c = mix(c, uColorD, smoothstep(0.66, 1.00, t));
  return c;
}

float triDither(vec2 fc) {
  float a = fract(sin(dot(fc, vec2(12.9898, 78.233))) * 43758.5453);
  float b = fract(sin(dot(fc + 17.0, vec2(12.9898, 78.233))) * 43758.5453);
  return (a + b - 1.0) / 255.0;
}

uniform float uGrainAnim;
float houseGrain(vec2 fc) {
  uvec2 q = uvec2(fc) * uvec2(1597334677u, 3812015801u)
          + uint(floor(iTime * 24.0 * uGrainAnim)) * 2654435769u;
  uint n = q.x ^ q.y; n = n * 1664525u + 1013904223u; n ^= n >> 16u; n *= 2246822519u; n ^= n >> 13u;
  float a = float(n & 0xffffu) / 65535.0;
  n *= 3266489917u; n ^= n >> 16u;
  float b = float(n & 0xffffu) / 65535.0;
  return a + b - 1.0;
}
void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * iResolution) / iResolution.y;
  uv *= uScale;
  vec2 iM = iMouse * uScale;
  float t = iTime * uSpeed;

  vec2 p = uv - iM * uParallax;

  float tilt = uTilt + sin(t * 0.13) * uRock + iM.x * uSteer;
  vec2 dir = vec2(cos(tilt), sin(tilt));
  float axis = dot(p, dir);
  float across = dot(p, vec2(-dir.y, dir.x));

  vec2 q = vec2(fbm(p * uWarpScale + vec2(0.0, t * uFlow)),
                fbm(p * uWarpScale + vec2(5.2, 1.3) - t * uFlow * 0.7));
  float air = fbm(p + uWarp * q + vec2(t * 0.12, -t * 0.09)) * 0.5 + 0.5;

  float horizon = uHorizon + sin(t * 0.09 + 2.1) * uBreathe - iM.y * uLift;
  float alt = clamp(0.5 + (axis - horizon) * uSpread + (air - 0.5) * uAmount, 0.0, 1.0);

  float ac = (across - uSpillCentre - iM.x * uSweep) / max(0.05, uSpillWidth);
  float spill = mix(uSpillFloor, 1.0, exp(-ac * ac));

  float direct = pow(alt, max(0.05, uCurve)) * uDirect * spill;
  float bounce = uBounce * pow(1.0 - alt, max(0.05, uBounceCurve));

  float f = uAmbient + direct + bounce;
  f += uMotes * snoise(p * uMoteScale + vec2(-t * 0.5, t * 0.35)) * 0.5 * alt;

  f = clamp((f - uMidpoint) * uContrast + 0.5, 0.0, 1.0);

  vec3 col = ramp4(f);
  col += uColorD * uGlow * pow(f, 4.0);
  col = mix(uBg, col, smoothstep(0.0, max(0.01, uSink), f) * 0.90 + 0.10);

  col *= 1.0 - uVignette * dot(uv, uv);
  { float hgL = clamp(dot(col, vec3(0.299, 0.587, 0.114)), 0.0, 1.0);
    col += houseGrain(gl_FragCoord.xy) * uGrain * mix(1.0, 4.0 * hgL * (1.0 - hgL), 0.6); }
  col += triDither(gl_FragCoord.xy) * uDither;

  fragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}`;

const hexToVec3 = (hex: string): [number, number, number] => {
  const n = Number.parseInt(hex.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

const uniformName = (key: string) => (key === "bgColor" ? "uBg" : `u${key[0].toUpperCase()}${key.slice(1)}`);

export function Soffit({ className = "soffit" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl2", { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: "low-power" });
    if (!gl) {
      canvas.style.background = `radial-gradient(120% 90% at 20% 0%, ${CONFIG.colorA}, ${CONFIG.bgColor})`;
      return;
    }

    const compile = (type: number, src: string) => {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) ?? "shader");
      return shader;
    };
    let program: WebGLProgram;
    try {
      program = gl.createProgram()!;
      gl.attachShader(program, compile(gl.VERTEX_SHADER, VERT));
      gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) ?? "link");
    } catch {
      canvas.style.background = `radial-gradient(120% 90% at 20% 0%, ${CONFIG.colorA}, ${CONFIG.bgColor})`;
      return;
    }
    gl.useProgram(program);
    gl.bindVertexArray(gl.createVertexArray());

    const locations = new Map<string, WebGLUniformLocation | null>();
    const loc = (name: string) => {
      if (!locations.has(name)) locations.set(name, gl.getUniformLocation(program, name));
      return locations.get(name) ?? null;
    };

    for (const [key, value] of Object.entries(CONFIG)) {
      if (key === "cursor" || key === "maxDpr") continue;
      if (typeof value === "string") gl.uniform3f(loc(uniformName(key)), ...hexToVec3(value));
      else gl.uniform1f(loc(uniformName(key)), value);
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, CONFIG.maxDpr);
      const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, w, h);
      gl.uniform2f(loc("iResolution"), w, h);
    };
    resize();
    const observer = new ResizeObserver(() => resize());
    observer.observe(canvas);

    const mouse = { x: 0, y: 0, ax: 0, ay: 0, tx: 0, ty: 0 };
    const aim = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const aspect = rect.width / Math.max(1, rect.height);
      mouse.tx = ((event.clientX - rect.left) / rect.width - 0.5) * aspect;
      mouse.ty = 0.5 - (event.clientY - rect.top) / rect.height;
    };
    window.addEventListener("pointermove", aim, { passive: true });
    window.addEventListener("pointerdown", aim, { passive: true });

    let visible = true;
    const io = new IntersectionObserver((entries) => {
      visible = entries[0]?.isIntersecting ?? true;
    });
    io.observe(canvas);

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let prev = performance.now();
    let clock = 0;
    let frame = 0;
    const draw = () => gl.drawArrays(gl.TRIANGLES, 0, 3);
    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      const raw = now - prev;
      prev = now;
      if (!visible || document.hidden || reduce.matches) return;
      const ms = raw > 50 ? 50 : raw < 4.167 ? 4.167 : raw;
      const s = ms > 36.7 ? 2.2 : ms * 0.06;
      clock += ms * 0.001;
      const kLead = 0.105 * s;
      const kBody = 0.043 * s;
      mouse.ax += (mouse.tx - mouse.ax) * kLead;
      mouse.ay += (mouse.ty - mouse.ay) * kLead;
      mouse.x += (mouse.ax - mouse.x) * kBody;
      mouse.y += (mouse.ay - mouse.y) * kBody;
      gl.uniform1f(loc("iTime"), clock);
      gl.uniform2f(loc("iMouse"), mouse.x, mouse.y);
      draw();
    };
    gl.uniform1f(loc("iTime"), 12);
    gl.uniform2f(loc("iMouse"), 0, 0);
    draw(); // une image avant tout, même en mouvement réduit
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", aim);
      window.removeEventListener("pointerdown", aim);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
