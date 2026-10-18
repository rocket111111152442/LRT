// Fond technique de lullin-web.com : carte topographique animée en WebGL2
// (courbes de niveau calculées sur la carte graphique, qui se creusent autour de
// la souris) et rail de mesures en direct sur le bord droit.
// Le canevas est derrière le contenu (z-index -1) : il n'apparaît que sur les
// sections sans fond. Animation coupée si l'appareil demande moins d'animations,
// si le bouton « Motion » du site est sur off ou si l'onglet est masqué.

import './fx-tech.css';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const motionOff = () => document.documentElement.dataset.motion === 'off';

const VERTEX = `#version 300 es
in vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }`;

const FRAGMENT = `#version 300 es
precision highp float;
uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_mouse;
uniform float u_mouseOn;
uniform float u_scroll;
uniform float u_scale;
out vec4 outColor;

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

// Bruit simplex 2D (Ashima Arts, licence MIT).
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * snoise(p);
    p = p * 2.03 + vec2(17.1, 9.2);
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 px = gl_FragCoord.xy / u_scale;
  vec2 res = u_res / u_scale;
  vec2 uv = px / res.y;

  // Relief : bruit fractal qui dérive lentement et suit le défilement.
  vec2 p = uv * 1.35 + vec2(0.0, -u_scroll * 0.00035);
  float h = fbm(p + vec2(u_time * 0.018, u_time * 0.011));

  // Puits de gravité sous la souris : les courbes se resserrent autour du curseur.
  vec2 m = u_mouse / u_scale;
  float d = length(px - m) / res.y;
  h += u_mouseOn * 0.55 * exp(-d * d * 28.0);

  // Courbes de niveau anti-crénelées, une courbe maîtresse sur cinq.
  float v = h * 11.0;
  float g = abs(fract(v - 0.5) - 0.5) / max(fwidth(v), 1e-4);
  float line = 1.0 - min(g, 1.0);
  float major = step(abs(mod(floor(v + 0.5), 5.0)), 0.5);

  // Grille de points façon plan technique.
  vec2 cell = mod(px, 48.0) - 24.0;
  float dot_ = 1.0 - smoothstep(0.6, 1.4, length(cell));

  float glow = u_mouseOn * exp(-d * d * 9.0);
  float vignette = smoothstep(1.25, 0.25, length((px / res - 0.5) * vec2(1.3, 1.0)));

  float alpha = line * mix(0.07, 0.17, major) * (0.55 + 0.45 * vignette);
  alpha += line * glow * 0.28;
  alpha += dot_ * 0.07 * vignette;
  vec3 accent = vec3(0.824, 0.992, 0.475);
  vec3 col = mix(vec3(0.94, 0.94, 0.91), accent, clamp(0.55 + major * 0.3 + glow, 0.0, 1.0));
  outColor = vec4(col * alpha, alpha);
}`;

function compile(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function startTopography() {
  const canvas = document.createElement('canvas');
  canvas.className = 'fx-topo';
  canvas.setAttribute('aria-hidden', 'true');
  const gl = canvas.getContext('webgl2', { alpha: true, antialias: false, premultipliedAlpha: true, powerPreference: 'low-power' });
  if (!gl) return null;

  const vs = compile(gl, gl.VERTEX_SHADER, VERTEX);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
  const program = gl.createProgram();
  if (!vs || !fs || !program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(program, 'a_pos');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const u = {
    res: gl.getUniformLocation(program, 'u_res'),
    time: gl.getUniformLocation(program, 'u_time'),
    mouse: gl.getUniformLocation(program, 'u_mouse'),
    mouseOn: gl.getUniformLocation(program, 'u_mouseOn'),
    scroll: gl.getUniformLocation(program, 'u_scroll'),
    scale: gl.getUniformLocation(program, 'u_scale'),
  };

  document.body.prepend(canvas);

  // Résolution plafonnée : net sur ordinateur, économe sur téléphone.
  const scale = Math.min(window.devicePixelRatio || 1, finePointer ? 1.5 : 1);
  const frameGap = finePointer ? 0 : 1000 / 30;
  let width = 0;
  let height = 0;
  const resize = () => {
    width = Math.round(window.innerWidth * scale);
    height = Math.round(window.innerHeight * scale);
    canvas.width = width;
    canvas.height = height;
    gl.viewport(0, 0, width, height);
  };
  resize();
  window.addEventListener('resize', resize, { passive: true });

  let mx = width / 2;
  let my = height / 2;
  let tx = mx;
  let ty = my;
  let mouseOn = 0;
  let mouseTarget = 0;
  window.addEventListener(
    'pointermove',
    (event) => {
      if (event.pointerType !== 'mouse') return;
      tx = event.clientX * scale;
      ty = height - event.clientY * scale;
      mouseTarget = 1;
    },
    { passive: true },
  );
  document.addEventListener('pointerleave', () => (mouseTarget = 0));

  const animated = () => !reduceMotion && !motionOff();
  let time = 0;
  let last = performance.now();
  let lastDraw = 0;
  let frames = 0;
  let fpsStamp = last;
  let fps = 0;

  const draw = () => {
    mx += (tx - mx) * 0.08;
    my += (ty - my) * 0.08;
    mouseOn += (mouseTarget - mouseOn) * 0.05;
    gl.uniform2f(u.res, width, height);
    gl.uniform1f(u.time, time);
    gl.uniform2f(u.mouse, mx, my);
    gl.uniform1f(u.mouseOn, mouseOn);
    gl.uniform1f(u.scroll, window.scrollY);
    gl.uniform1f(u.scale, scale);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  let running = false;
  const loop = (now: number) => {
    if (!running) return;
    requestAnimationFrame(loop);
    if (now - lastDraw < frameGap) return;
    const dt = Math.min(now - last, 100) / 1000;
    last = now;
    lastDraw = now;
    time += dt;
    draw();
    frames += 1;
    if (now - fpsStamp >= 500) {
      fps = Math.round((frames * 1000) / (now - fpsStamp));
      frames = 0;
      fpsStamp = now;
    }
  };

  const sync = () => {
    const shouldRun = animated() && !document.hidden;
    if (shouldRun && !running) {
      running = true;
      last = performance.now();
      requestAnimationFrame(loop);
    } else if (!shouldRun && running) {
      running = false;
      fps = 0;
    }
    if (!shouldRun) draw();
  };
  document.addEventListener('visibilitychange', sync);
  new MutationObserver(sync).observe(document.documentElement, { attributes: true, attributeFilter: ['data-motion'] });
  // Image fixe quand l'animation est coupée, mais qui suit quand même le défilement.
  window.addEventListener('scroll', () => !running && draw(), { passive: true });
  sync();

  return { fps: () => fps, running: () => running };
}

/* ---------- Rail de mesures en direct ---------- */

function pad(value: number, size: number) {
  return String(Math.max(0, Math.round(value))).padStart(size, '0');
}

function startRail(topo: { fps: () => number; running: () => boolean } | null) {
  const rail = document.createElement('div');
  rail.className = 'fx-rail';
  rail.setAttribute('aria-hidden', 'true');
  rail.innerHTML =
    '<span class="fx-rail-dot"></span>' +
    '<span data-k="gpu"></span><i></i>' +
    '<span data-k="xy"></span><i></i>' +
    '<span data-k="scroll"></span><i></i>' +
    '<span data-k="vp"></span>';
  document.body.appendChild(rail);
  const field = (key: string) => rail.querySelector<HTMLElement>(`[data-k="${key}"]`);
  const gpu = field('gpu');
  const xy = field('xy');
  const scroll = field('scroll');
  const vp = field('vp');
  let x = 0;
  let y = 0;
  window.addEventListener(
    'pointermove',
    (event) => {
      x = event.clientX;
      y = event.clientY;
    },
    { passive: true },
  );

  const render = () => {
    const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    // La cadence n'est affichée que lorsqu'elle est fluide : un visiteur sur une
    // machine lente ne doit pas lire un chiffre trompeur sur le site.
    const fps = topo ? topo.fps() : 0;
    const rate = topo && topo.running() && fps >= 50 ? `${pad(Math.min(fps, 120), 2)} FPS` : 'GPU';
    if (gpu) gpu.textContent = topo ? `WEBGL2 · ${rate}` : 'CSS · GPU';
    if (xy) xy.textContent = `X ${pad(x, 4)} · Y ${pad(y, 4)}`;
    if (scroll) scroll.textContent = `SCROLL ${pad((window.scrollY / max) * 100, 3)} %`;
    if (vp) vp.textContent = `${window.innerWidth} × ${window.innerHeight}`;
  };
  render();
  window.setInterval(render, 250);
}

function start() {
  const topo = startTopography();
  if (finePointer) startRail(topo);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', start, { once: true });
} else {
  start();
}
