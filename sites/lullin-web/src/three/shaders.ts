/* Shaders GLSL de la scène. Les couleurs sont manipulées en espace linéaire
 * puis converties en sortie par <colorspace_fragment>. */

const pingpong = /* glsl */ `
float pingpong(float x) {
  float t = fract(x * 0.5) * 2.0;
  t = t > 1.0 ? 2.0 - t : t;
  return t * t * (3.0 - 2.0 * t);
}`;

/* ------------------------------------------------------------------ */
/* Écrans du mur (InstancedMesh, un par texture de site)              */
/* ------------------------------------------------------------------ */

export const panelVertex = /* glsl */ `
attribute float aPhase;
attribute float aSlot;
varying vec2 vUv;
varying float vPhase;
varying float vSlot;
varying vec3 vWorld;
varying float vDepth;
void main() {
  vUv = uv;
  vPhase = aPhase;
  vSlot = aSlot;
  vec4 wp = modelMatrix * instanceMatrix * vec4(position, 1.0);
  vWorld = wp.xyz;
  vec4 mv = viewMatrix * wp;
  vDepth = -mv.z;
  gl_Position = projectionMatrix * mv;
}`;

export const panelFragment = /* glsl */ `
uniform sampler2D map;
uniform float uWindow;
uniform float uScroll;
uniform float uReady;
uniform float uHover;
uniform float uAspect;
uniform float uDim;
uniform vec3 uFloor;
uniform vec3 uBacking;
varying vec2 vUv;
varying float vPhase;
varying float vSlot;
varying vec3 vWorld;
varying float vDepth;
${pingpong}
void main() {
  // Vu de l'intérieur du cylindre, l'axe u est inversé.
  vec2 uv = vec2(1.0 - vUv.x, vUv.y);

  // « Faites défiler, ils défilent avec vous » : fenêtre glissante sur la
  // capture pleine page, propre à chaque écran.
  float s = pingpong(uScroll * (0.55 + vPhase * 0.5) + vPhase * 7.0);
  float off = s * (1.0 - uWindow);
  vec2 tuv = vec2(uv.x, 1.0 - off - (1.0 - uv.y) * uWindow);
  vec3 col = texture2D(map, tuv).rgb;
  col = mix(uBacking * 2.2, col, uReady);

  // Coins arrondis et léger assombrissement des bords (écran).
  vec2 p = (uv - 0.5) * vec2(uAspect, 1.0);
  vec2 hs = vec2(uAspect, 1.0) * 0.5;
  float r = 0.045;
  float d = length(max(abs(p) - hs + r, 0.0)) - r;
  float inside = 1.0 - smoothstep(-0.004, 0.002, d);
  col *= mix(0.74, 1.0, smoothstep(0.0, 0.09, -d));

  // Reflet bleu du sol sur les rangées basses.
  float glow = exp(-max(vWorld.y, 0.0) * 0.55);
  col = col * (1.0 - glow * 0.2) + uFloor * glow * 0.22;

  // Brume de profondeur très légère.
  col *= mix(1.0, 0.6, smoothstep(30.0, 70.0, vDepth));

  // Survol : écran plus lumineux et liseré blanc.
  float h = 1.0 - step(0.5, abs(vSlot - uHover));
  col = mix(col, col * 1.12 + 0.05, h);
  float border = h * (1.0 - smoothstep(0.004, 0.016, abs(d + 0.008)));
  col = mix(col, vec3(1.0), border);

  col *= uDim;
  gl_FragColor = vec4(mix(uBacking, col, inside), 1.0);
  #include <colorspace_fragment>
}`;

/* ------------------------------------------------------------------ */
/* Écran « décroché du mur »                                          */
/* ------------------------------------------------------------------ */

export const featureVertex = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

export const featureFragment = /* glsl */ `
uniform sampler2D mapA;
uniform sampler2D mapB;
uniform float uWinA;
uniform float uWinB;
uniform float uReadyA;
uniform float uReadyB;
uniform float uScrollA;
uniform float uScrollB;
uniform float uMix;
uniform float uOpacity;
uniform float uFlash;
uniform vec3 uAccentA;
uniform vec3 uAccentB;
uniform vec2 uSize;
uniform vec2 uRect;
uniform float uStrips;
varying vec2 vUv;
${pingpong}
float hash(float n) { return fract(sin(n * 12.9898) * 43758.5453); }

vec3 screenAt(sampler2D m, float win, float ready, float scroll, vec2 uv) {
  float s = pingpong(scroll);
  float off = s * (1.0 - win);
  vec2 t = vec2(uv.x, 1.0 - off - (1.0 - uv.y) * win);
  return mix(vec3(0.02), texture2D(m, clamp(t, 0.0, 1.0)).rgb, ready);
}

void main() {
  vec2 p = (vUv - 0.5) * uSize;
  float r = 0.07;
  float d = length(max(abs(p) - uRect + r, 0.0)) - r;
  vec2 ruv = p / (uRect * 2.0) + 0.5;

  // Transition par lamelles verticales (effet « stores » de la référence).
  float si = floor(ruv.x * uStrips);
  float rnd = hash(si + 1.0);
  float lp = clamp(uMix * 1.8 - rnd * 0.8, 0.0, 1.0);
  float wob = sin(lp * 3.14159);
  vec2 suv = vec2(ruv.x + (rnd - 0.5) * 0.05 * wob, ruv.y);
  vec3 a = screenAt(mapA, uWinA, uReadyA, uScrollA, suv);
  vec3 b = screenAt(mapB, uWinB, uReadyB, uScrollB, suv);
  vec3 col = lp > 0.5 ? b : a;
  vec3 acc = mix(uAccentA, uAccentB, smoothstep(0.35, 0.65, uMix));
  float sub = step(0.55, hash(floor(ruv.x * uStrips * 4.0) + 7.0));
  float bar = (1.0 - smoothstep(0.0, 0.3, abs(lp - 0.5))) * sub;
  col = mix(col, mix(vec3(1.0), acc, 0.45), bar * 0.9);

  col += uFlash * 0.9;

  float inside = 1.0 - smoothstep(-0.002, 0.004, d);
  float border = 1.0 - smoothstep(0.008, 0.02, abs(d - 0.004));
  float glow = exp(-max(d, 0.0) * 7.0) * (1.0 - inside);
  vec3 rim = acc * 1.25 + 0.08;
  vec3 c = mix(col, rim, border);
  c = mix(acc, c, max(inside, border));
  float alpha = max(max(inside, border), glow * 0.6) * uOpacity;
  gl_FragColor = vec4(c, alpha);
  #include <colorspace_fragment>
}`;

/* ------------------------------------------------------------------ */
/* Sol bleu lumineux                                                  */
/* ------------------------------------------------------------------ */

export const floorVertex = featureVertex;

export const floorFragment = /* glsl */ `
uniform vec3 uC0;
uniform vec3 uC1;
uniform vec3 uC2;
uniform float uTime;
varying vec2 vUv;
void main() {
  float r = length(vUv - 0.5) * 2.0;
  vec3 col = mix(uC0, uC1, smoothstep(0.0, 0.75, r));
  col = mix(col, uC2, smoothstep(0.78, 1.0, r));
  col *= 0.985 + 0.015 * sin(r * 34.0 - uTime * 0.4);
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}`;

export const shadowFragment = /* glsl */ `
uniform float uOpacity;
varying vec2 vUv;
void main() {
  vec2 q = (vUv - 0.5) * 2.0;
  float d = length(vec2(q.x, q.y * 0.9));
  float a = (1.0 - smoothstep(0.15, 1.0, d)) * uOpacity;
  gl_FragColor = vec4(0.0, 0.0, 0.03, a);
}`;

/* ------------------------------------------------------------------ */
/* Personnage (silhouette en contre-jour, liseré coloré)              */
/* ------------------------------------------------------------------ */

export const figureVertex = /* glsl */ `
varying vec3 vN;
varying vec3 vV;
varying vec3 vWN;
void main() {
  vN = normalize(normalMatrix * normal);
  vWN = normalize(mat3(modelMatrix) * normal);
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vV = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}`;

export const figureFragment = /* glsl */ `
uniform vec3 uBase;
uniform vec3 uRim;
uniform vec3 uFloor;
varying vec3 vN;
varying vec3 vV;
varying vec3 vWN;
void main() {
  float fr = pow(1.0 - max(dot(normalize(vN), normalize(vV)), 0.0), 3.4);
  float down = max(-vWN.y, 0.0);
  float side = abs(vWN.x);
  vec3 c = uBase + uRim * fr * 1.15 + uRim * side * fr * 0.6 + uFloor * down * 0.12;
  gl_FragColor = vec4(c, 1.0);
  #include <colorspace_fragment>
}`;

/* ------------------------------------------------------------------ */
/* Poussière en suspension                                            */
/* ------------------------------------------------------------------ */

export const dustVertex = /* glsl */ `
uniform float uTime;
uniform float uHeight;
uniform float uPixel;
attribute float aSeed;
varying float vA;
void main() {
  vec3 p = position;
  p.y = mod(p.y + uTime * (0.12 + aSeed * 0.2), uHeight);
  p.x += sin(uTime * 0.3 + aSeed * 20.0) * 0.25;
  p.z += cos(uTime * 0.25 + aSeed * 13.0) * 0.25;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uPixel * (0.6 + aSeed) * (14.0 / max(-mv.z, 1.0));
  vA = 0.35 + 0.65 * fract(aSeed * 91.7);
}`;

export const dustFragment = /* glsl */ `
varying float vA;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float a = smoothstep(0.5, 0.0, length(c)) * vA;
  gl_FragColor = vec4(vec3(1.0), a);
}`;
