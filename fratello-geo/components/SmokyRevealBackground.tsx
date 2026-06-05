"use client";

import { useEffect, useRef, useState } from "react";

/* ------------------------------------------------------------------ */
/*  Brand card data                                                    */
/* ------------------------------------------------------------------ */

interface BrandCard {
  name: string;
  tagline?: string;
  accentColor: string;
  style: "serif" | "sans" | "script" | "mono";
  x: string;
  y: string;
  rotate: number;
  width: number;
  height: number;
  tapeRotate: number;
  tapeOffset: string;
}

const BRAND_CARDS: BrandCard[] = [
  {
    name: "Your Brand",
    tagline: "MADE FOR YOU",
    accentColor: "#c4a882",
    style: "serif",
    x: "7%",
    y: "10%",
    rotate: -7,
    width: 185,
    height: 120,
    tapeRotate: 14,
    tapeOffset: "-9px",
  },
  {
    name: "GLOW\nSTUDIO",
    tagline: "SKINCARE CO.",
    accentColor: "#d4a9b4",
    style: "sans",
    x: "76%",
    y: "7%",
    rotate: 5,
    width: 175,
    height: 115,
    tapeRotate: -10,
    tapeOffset: "-7px",
  },
  {
    name: "Skin Lab",
    tagline: "DERMATOLOGY • EST. 2019",
    accentColor: "#8cb4a0",
    style: "mono",
    x: "2%",
    y: "48%",
    rotate: -4,
    width: 170,
    height: 110,
    tapeRotate: 8,
    tapeOffset: "-8px",
  },
  {
    name: "LUMA",
    tagline: "BEAUTY",
    accentColor: "#b8a4d4",
    style: "sans",
    x: "80%",
    y: "46%",
    rotate: 3,
    width: 180,
    height: 118,
    tapeRotate: -12,
    tapeOffset: "-8px",
  },
  {
    name: "Bloom",
    tagline: "BOTANICAL CARE",
    accentColor: "#a8c4a0",
    style: "script",
    x: "5%",
    y: "78%",
    rotate: 6,
    width: 160,
    height: 105,
    tapeRotate: 10,
    tapeOffset: "-7px",
  },
  {
    name: "NARA",
    tagline: "TOKYO • BEAUTY",
    accentColor: "#d4c4a8",
    style: "sans",
    x: "74%",
    y: "80%",
    rotate: -5,
    width: 170,
    height: 110,
    tapeRotate: -7,
    tapeOffset: "-8px",
  },
];

/* ------------------------------------------------------------------ */
/*  WebGL Shaders                                                      */
/* ------------------------------------------------------------------ */

const VERTEX_SHADER = `
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

/**
 * Density update shader — ping-pong FBO pass.
 * Uses domain-warped FBM for realistic, swirling smoke edges.
 * The heal effect is noise-modulated so fog rolls back in organically.
 */
const DENSITY_UPDATE_SHADER = `
precision highp float;

varying vec2 v_uv;

uniform sampler2D u_prevDensity;
uniform vec2 u_mouse;
uniform float u_mouseActive;
uniform float u_time;
uniform vec2 u_resolution;
uniform float u_healRate;
uniform float u_revealRadius;

/* ---- Simplex 3D noise (Ashima Arts) ---- */
vec3 mod289(vec3 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = mod289(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
  + i.y + vec4(0.0, i1.y, i2.y, 1.0))
  + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 0.142857142857;
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

/* FBM — 6 octaves for rich detail */
float fbm(vec3 p) {
  float val = 0.0;
  float amp = 0.5;
  float freq = 1.0;
  for (int i = 0; i < 6; i++) {
    val += amp * snoise(p * freq);
    amp *= 0.48;
    freq *= 2.1;
  }
  return val;
}

/* Domain-warped FBM — feeds noise into noise for swirling, cloud-like shapes */
float warpedFbm(vec3 p) {
  vec3 q = vec3(
    fbm(p + vec3(0.0, 0.0, 0.0)),
    fbm(p + vec3(5.2, 1.3, 2.8)),
    0.0
  );
  vec3 r = vec3(
    fbm(p + 4.0 * q + vec3(1.7, 9.2, 0.0)),
    fbm(p + 4.0 * q + vec3(8.3, 2.8, 0.0)),
    0.0
  );
  return fbm(p + 3.5 * r);
}

void main() {
  float prev = texture2D(u_prevDensity, v_uv).r;
  float t = u_time * 0.15;

  // --- Organic heal: fog rolls back in with noise variation ---
  float healNoise = warpedFbm(vec3(v_uv * 3.0, t * 0.8 + 10.0));
  float healMask = 0.5 + 0.5 * healNoise; // 0..1 range, varies spatially
  float healAmount = u_healRate * (0.6 + 0.8 * healMask);
  float healed = prev + healAmount * (1.0 - prev);

  // --- Reveal: noise-distorted circle with domain warping ---
  if (u_mouseActive > 0.5) {
    vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
    vec2 diff = (v_uv - u_mouse) * aspect;
    float dist = length(diff);

    // Domain-warped noise for highly organic edge shape
    float warp = warpedFbm(vec3(v_uv * 5.0, t));
    float distortedRadius = u_revealRadius * (0.7 + 0.55 * warp);

    // Smooth falloff — wider, softer transition
    float reveal = smoothstep(distortedRadius, distortedRadius * 0.08, dist);

    // Secondary noise layer — wispy tendrils and smoke trails
    float tendrilNoise = fbm(vec3(v_uv * 10.0, t * 1.2 + 5.0));
    float tendrils = smoothstep(distortedRadius * 1.5, distortedRadius * 0.2, dist)
                   * max(0.0, tendrilNoise) * 0.35;

    // Tertiary layer — very fine wisps at the far edge
    float fineNoise = snoise(vec3(v_uv * 18.0, t * 2.0 + 12.0));
    float fineWisps = smoothstep(distortedRadius * 2.0, distortedRadius * 0.5, dist)
                    * max(0.0, fineNoise) * 0.15;

    float totalReveal = min(1.0, reveal + tendrils + fineWisps);

    healed = healed - totalReveal * 0.45;
  }

  gl_FragColor = vec4(clamp(healed, 0.0, 1.0), 0.0, 0.0, 1.0);
}
`;

/** Render shader — maps density to fog colour with animated cloud texture */
const RENDER_SHADER = `
precision highp float;

varying vec2 v_uv;

uniform sampler2D u_density;
uniform float u_time;

vec3 mod289(vec3 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
  + i.y + vec4(0.0, i1.y, i2.y, 1.0))
  + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3  ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

float fbm(vec3 p) {
  float val = 0.0;
  float amp = 0.5;
  float freq = 1.0;
  for (int i = 0; i < 4; i++) {
    val += amp * snoise(p * freq);
    amp *= 0.5;
    freq *= 2.0;
  }
  return val;
}

void main() {
  float density = texture2D(u_density, v_uv).r;

  // Fog gradient matching the hero: #599e81 top → #03492c bottom
  vec3 topColor    = vec3(0.349, 0.620, 0.506);
  vec3 bottomColor = vec3(0.012, 0.286, 0.173);
  vec3 fogColor = mix(topColor, bottomColor, v_uv.y);

  // Animated cloud texture — slowly drifting noise adds depth to the fog
  float t = u_time * 0.06;
  float cloudA = fbm(vec3(v_uv * 2.5 + vec2(t * 0.3, t * 0.1), t));
  float cloudB = fbm(vec3(v_uv * 4.0 + vec2(-t * 0.2, t * 0.15), t * 0.7 + 5.0));
  float clouds = cloudA * 0.6 + cloudB * 0.4;

  // Subtle colour shift from clouds
  fogColor += clouds * 0.035;

  // Very slight brightness variation
  fogColor *= 0.97 + clouds * 0.06;

  gl_FragColor = vec4(fogColor, density);
}
`;

/* ------------------------------------------------------------------ */
/*  WebGL helpers                                                      */
/* ------------------------------------------------------------------ */

function createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Shader compile error:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl: WebGLRenderingContext, vertSrc: string, fragSrc: string): WebGLProgram | null {
  const vert = createShader(gl, gl.VERTEX_SHADER, vertSrc);
  const frag = createShader(gl, gl.FRAGMENT_SHADER, fragSrc);
  if (!vert || !frag) return null;
  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vert);
  gl.attachShader(program, frag);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("Program link error:", gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

interface FBO {
  framebuffer: WebGLFramebuffer;
  texture: WebGLTexture;
}

function createFBO(gl: WebGLRenderingContext, width: number, height: number): FBO | null {
  const texture = gl.createTexture();
  if (!texture) return null;
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  const framebuffer = gl.createFramebuffer();
  if (!framebuffer) return null;
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.bindTexture(gl.TEXTURE_2D, null);

  return { framebuffer, texture };
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const CANVAS_SCALE = 0.5;

/* ------------------------------------------------------------------ */
/*  Card style helper                                                  */
/* ------------------------------------------------------------------ */

function getCardFontClass(style: BrandCard["style"]): string {
  switch (style) {
    case "serif":   return "brand-card-name--serif";
    case "sans":    return "brand-card-name--sans";
    case "script":  return "brand-card-name--script";
    case "mono":    return "brand-card-name--mono";
    default:        return "";
  }
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function SmokyRevealBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafId = useRef<number>(0);
  const mousePos = useRef({ x: -1, y: -1 });
  const isMoving = useRef(false);
  const moveTimeout = useRef<number>(0);
  const isMobile = useRef(false);
  const startTime = useRef(0);
  const [glReady, setGlReady] = useState(false);
  const glReadySet = useRef(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      isMobile.current = window.matchMedia("(hover: none)").matches || window.innerWidth < 768;
    }

    if (isMobile.current) {
      setGlReady(true);
      return;
    }

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const gl = canvas.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: false,
      antialias: false,
      preserveDrawingBuffer: false,
    });
    if (!gl) {
      console.warn("WebGL not available, smoky reveal disabled");
      setGlReady(true); // Show cards even without WebGL
      return;
    }

    /* ---- Compile programs ---- */
    const densityProgram = createProgram(gl, VERTEX_SHADER, DENSITY_UPDATE_SHADER);
    const renderProgram = createProgram(gl, VERTEX_SHADER, RENDER_SHADER);
    if (!densityProgram || !renderProgram) return;

    /* ---- Full-screen quad ---- */
    const quadBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1,  1, -1,  -1, 1,
      -1,  1,  1, -1,   1, 1,
    ]), gl.STATIC_DRAW);

    /* ---- Uniform locations ---- */
    const dLocs = {
      a_position: gl.getAttribLocation(densityProgram, "a_position"),
      u_prevDensity: gl.getUniformLocation(densityProgram, "u_prevDensity"),
      u_mouse: gl.getUniformLocation(densityProgram, "u_mouse"),
      u_mouseActive: gl.getUniformLocation(densityProgram, "u_mouseActive"),
      u_time: gl.getUniformLocation(densityProgram, "u_time"),
      u_resolution: gl.getUniformLocation(densityProgram, "u_resolution"),
      u_healRate: gl.getUniformLocation(densityProgram, "u_healRate"),
      u_revealRadius: gl.getUniformLocation(densityProgram, "u_revealRadius"),
    };
    const rLocs = {
      a_position: gl.getAttribLocation(renderProgram, "a_position"),
      u_density: gl.getUniformLocation(renderProgram, "u_density"),
      u_time: gl.getUniformLocation(renderProgram, "u_time"),
    };

    /* ---- FBOs for ping-pong ---- */
    let w = Math.round(container.offsetWidth * CANVAS_SCALE);
    let h = Math.round(container.offsetHeight * CANVAS_SCALE);
    canvas.width = w;
    canvas.height = h;

    let fboA = createFBO(gl, w, h);
    let fboB = createFBO(gl, w, h);
    if (!fboA || !fboB) return;

    function initDensity(fbo: FBO, glCtx: WebGLRenderingContext) {
      const pixels = new Uint8Array(w * h * 4);
      for (let i = 0; i < w * h; i++) {
        pixels[i * 4] = 255;
        pixels[i * 4 + 1] = 0;
        pixels[i * 4 + 2] = 0;
        pixels[i * 4 + 3] = 255;
      }
      glCtx.bindTexture(glCtx.TEXTURE_2D, fbo.texture);
      glCtx.texImage2D(glCtx.TEXTURE_2D, 0, glCtx.RGBA, w, h, 0, glCtx.RGBA, glCtx.UNSIGNED_BYTE, pixels);
      glCtx.bindTexture(glCtx.TEXTURE_2D, null);
    }
    initDensity(fboA, gl);
    initDensity(fboB, gl);

    let readFBO = fboA;
    let writeFBO = fboB;

    startTime.current = performance.now();

    /* GL is ready — show the cards now that the fog canvas will cover them */
    if (!glReadySet.current) {
      glReadySet.current = true;
      setGlReady(true);
    }

    /* ---- Resize ---- */
    function resize() {
      if (!container || !canvas || !gl) return;
      w = Math.round(container.offsetWidth * CANVAS_SCALE);
      h = Math.round(container.offsetHeight * CANVAS_SCALE);
      canvas.width = w;
      canvas.height = h;

      fboA = createFBO(gl, w, h);
      fboB = createFBO(gl, w, h);
      if (fboA && fboB) {
        initDensity(fboA, gl);
        initDensity(fboB, gl);
        readFBO = fboA;
        writeFBO = fboB;
      }
    }
    window.addEventListener("resize", resize);

    /* ---- Mouse tracking (no parallax) ---- */
    function handleMouseMove(e: MouseEvent) {
      if (!container) return;
      const rect = container.getBoundingClientRect();
      mousePos.current = {
        x: (e.clientX - rect.left) / rect.width,
        y: 1.0 - (e.clientY - rect.top) / rect.height,
      };
      isMoving.current = true;

      window.clearTimeout(moveTimeout.current);
      moveTimeout.current = window.setTimeout(() => {
        isMoving.current = false;
      }, 150);
    }

    const heroSection = container.closest(".hero-shell");
    if (heroSection) {
      heroSection.addEventListener("mousemove", handleMouseMove as EventListener);
    }

    /* ---- Render loop ---- */
    function tick() {
      if (!gl || !readFBO || !writeFBO) return;

      const elapsed = (performance.now() - startTime.current) / 1000;

      gl.viewport(0, 0, w, h);

      /* Pass 1: Update density */
      gl.bindFramebuffer(gl.FRAMEBUFFER, writeFBO.framebuffer);
      gl.useProgram(densityProgram);

      gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
      gl.enableVertexAttribArray(dLocs.a_position);
      gl.vertexAttribPointer(dLocs.a_position, 2, gl.FLOAT, false, 0, 0);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, readFBO.texture);
      gl.uniform1i(dLocs.u_prevDensity, 0);
      gl.uniform2f(dLocs.u_mouse, mousePos.current.x, mousePos.current.y);
      gl.uniform1f(dLocs.u_mouseActive, isMoving.current ? 1.0 : 0.0);
      gl.uniform1f(dLocs.u_time, elapsed);
      gl.uniform2f(dLocs.u_resolution, w, h);
      gl.uniform1f(dLocs.u_healRate, 0.014);
      gl.uniform1f(dLocs.u_revealRadius, 0.13);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      /* Pass 2: Render fog to screen */
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, canvas!.width, canvas!.height);
      gl.useProgram(renderProgram);

      gl.enableVertexAttribArray(rLocs.a_position);
      gl.vertexAttribPointer(rLocs.a_position, 2, gl.FLOAT, false, 0, 0);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, writeFBO.texture);
      gl.uniform1i(rLocs.u_density, 0);
      gl.uniform1f(rLocs.u_time, elapsed);

      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      gl.disable(gl.BLEND);

      /* Swap */
      const temp = readFBO;
      readFBO = writeFBO;
      writeFBO = temp;



      rafId.current = requestAnimationFrame(tick);
    }

    rafId.current = requestAnimationFrame(tick);

    /* ---- Cleanup ---- */
    return () => {
      cancelAnimationFrame(rafId.current);
      window.removeEventListener("resize", resize);
      window.clearTimeout(moveTimeout.current);
      if (heroSection) {
        heroSection.removeEventListener("mousemove", handleMouseMove as EventListener);
      }
      gl.deleteProgram(densityProgram);
      gl.deleteProgram(renderProgram);
      if (fboA) { gl.deleteFramebuffer(fboA.framebuffer); gl.deleteTexture(fboA.texture); }
      if (fboB) { gl.deleteFramebuffer(fboB.framebuffer); gl.deleteTexture(fboB.texture); }
      gl.deleteBuffer(quadBuffer);
    };
  }, []);

  /* ---- Render ---- */
  return (
    <div
      ref={containerRef}
      className="smoky-reveal-container"
      aria-hidden="true"
    >
      {/* Brand cards layer */}
      <div className={`smoky-reveal-cards${!glReady && !isMobile.current ? " smoky-reveal-cards--hidden" : ""}`}>
        {BRAND_CARDS.map((card) => (
          <div
            key={card.name}
            className={`brand-card${isMobile.current ? " brand-card--mobile" : ""}`}
            style={{
              left: card.x,
              top: card.y,
              width: card.width,
              height: card.height,
              transform: `rotate(${card.rotate}deg)`,
            }}
          >
            {/* Accent bar */}
            <span
              className="brand-card-accent"
              style={{ backgroundColor: card.accentColor }}
            />

            {/* Tape detail */}
            <span
              className="brand-card-tape"
              style={{
                transform: `rotate(${card.tapeRotate}deg)`,
                top: card.tapeOffset,
              }}
            />

            {/* Card content */}
            <span className="brand-card-content">
              <span className={`brand-card-name ${getCardFontClass(card.style)}`}>
                {card.name}
              </span>
              {card.tagline && (
                <span className="brand-card-tagline">{card.tagline}</span>
              )}
            </span>

            {/* Subtle paper grain overlay */}
            <span className="brand-card-grain" />
          </div>
        ))}
      </div>

      {/* WebGL fog canvas */}
      {!isMobile.current && (
        <canvas
          ref={canvasRef}
          className="smoky-reveal-canvas"
        />
      )}
    </div>
  );
}
