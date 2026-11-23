import * as THREE from "three";
import gsap from "gsap";
import type { Project } from "@/content/projects";
import {
  T,
  easeInOut,
  invLerp,
  lerp,
  phaseOf,
  projectFloat,
  smooth,
} from "@/lib/timeline";
import { Figure } from "./figure";
import {
  dustFragment,
  dustVertex,
  featureFragment,
  featureVertex,
  floorFragment,
  floorVertex,
  panelFragment,
  panelVertex,
  shadowFragment,
} from "./shaders";

export type ZoetropeOptions = {
  projects: Project[];
  featured: Project[];
  lowPower: boolean;
  reducedMotion: boolean;
  /** Projet affiché sur l'écran décroché (null = aucun). */
  onFeature?: (slug: string | null, picked: boolean) => void;
  /** Site visible face caméra sur le mur (libellé « À l'écran »). */
  onFront?: (slug: string) => void;
  onHover?: (slug: string | null) => void;
  onWhoosh?: () => void;
};

/* Géométrie du cylindre (unités arbitraires, ~1 = 1 m). */
const R = 10;
const PER_RING = 14;
const SLOT = (Math.PI * 2) / PER_RING;
const THETA = SLOT * 0.9;
const PANEL_W = R * THETA;
const PANEL_H = PANEL_W / 1.6;
const PITCH = PANEL_H + 0.3;
const BASE_Y = 0.38;

const ROOM_Y = 2.55;
/** Rotation du mur entre deux projets. */
const PROJECT_TURN = 0.62;
const FIGURE_Z = 2.6;

const FEATURE_RECT = new THREE.Vector2(2.1, 1.31); // demi-taille de l'écran
const FEATURE_PAD = 0.5;

type Uniforms<K extends string> = { [k in K]: THREE.IUniform };
type FeatureKeys =
  | "mapA" | "mapB" | "uWinA" | "uWinB" | "uReadyA" | "uReadyB" | "uScrollA" | "uScrollB" | "uMix"
  | "uOpacity" | "uFlash" | "uAccentA" | "uAccentB" | "uSize" | "uRect" | "uStrips";
type PanelKeys =
  | "map" | "uWindow" | "uScroll" | "uReady" | "uHover" | "uAspect" | "uDim" | "uFloor" | "uBacking";

type Slot = { tier: number; index: number; angle: number; y: number; site: number; phase: number };

type WallMesh = {
  mesh: THREE.InstancedMesh;
  material: THREE.ShaderMaterial;
  u: Uniforms<PanelKeys>;
  slots: Slot[];
  site: Project;
};

const hashSeed = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export class Zoetrope {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(55, 1, 0.1, 400);
  private wall = new THREE.Group();
  private walls: WallMesh[] = [];
  private allSlots: Slot[] = [];
  private tiers: number;
  private height: number;
  private loader = new THREE.TextureLoader();
  private wallTextures = new Map<string, THREE.Texture>();
  private featureTextures = new Map<string, Promise<THREE.Texture>>();

  private floorColor = new THREE.Color("#1f4dff");
  private backing = new THREE.Color("#120b0e");
  private floorMat!: THREE.ShaderMaterial;
  private shadowMat!: THREE.ShaderMaterial;
  private dust!: THREE.Points;
  private dustMat!: THREE.ShaderMaterial;
  private figure: Figure;

  private feature = new THREE.Group();
  private featureMat!: THREE.ShaderMaterial;
  private fu!: Uniforms<FeatureKeys>;
  private featureMesh!: THREE.Mesh;
  private featureSlug: string | null = null;
  private featureShown = false;
  private featureBusy = false;
  private pendingSlug: string | null = null;
  private pickedSlug: string | null = null;
  private pickedAt = -1;
  private lastActive = -1;

  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2(10, 10);
  private pointerActive = false;
  private hoverSlot = -1;
  private hoverSlug: string | null = null;

  private progress = 0;
  private time = 0;
  private mouse = new THREE.Vector2();
  private mouseTarget = new THREE.Vector2();
  private wallRot = 0;
  private idleRot = 0;
  private frontSlug = "";
  private width = 1;
  private heightPx = 1;
  private disposed = false;

  constructor(
    private canvas: HTMLCanvasElement,
    private opts: ZoetropeOptions,
  ) {
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: !opts.lowPower,
      alpha: true,
      powerPreference: "high-performance",
    });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.tiers = opts.lowPower ? 15 : 20;
    this.height = BASE_Y + this.tiers * PITCH;
    this.camera.rotation.order = "YXZ";

    this.buildWall();
    this.buildFloor();
    this.figure = new Figure(this.floorColor);
    this.figure.group.position.set(0, 0, FIGURE_Z);
    this.figure.group.rotation.y = Math.PI;
    this.scene.add(this.figure.group);
    this.buildFeature();
    this.buildDust();
    this.scene.add(this.wall);

    this.resize();
    // Pré-chargement des premiers projets mis en avant.
    opts.featured.slice(0, 2).forEach((p) => void this.loadFeature(p.slug));
  }

  /* ----------------------------------------------------------------- */
  /* Construction                                                      */
  /* ----------------------------------------------------------------- */

  private buildWall() {
    const { projects, lowPower } = this.opts;
    const dir = lowPower ? "wall-sm" : "wall";

    // Répartition des sites sur les emplacements : voisins toujours différents.
    const n = projects.length;
    for (let tier = 0; tier < this.tiers; tier++) {
      const stagger = (tier % 2) * 0.5 + hashSeed(tier) * 0.3;
      for (let i = 0; i < PER_RING; i++) {
        const k = tier * PER_RING + i;
        this.allSlots.push({
          tier,
          index: i,
          angle: (i + stagger) * SLOT,
          y: BASE_Y + tier * PITCH + PANEL_H / 2,
          site: (i * 5 + tier * 3 + Math.floor(tier / 2)) % n,
          phase: hashSeed(k + 11),
        });
      }
    }

    const geo = new THREE.CylinderGeometry(R, R, PANEL_H, 10, 1, true, -THETA / 2, THETA);
    const dummy = new THREE.Object3D();

    projects.forEach((site, s) => {
      const slots = this.allSlots.filter((sl) => sl.site === s);
      if (!slots.length) return;
      const g = geo.clone();
      const phases = new Float32Array(slots.length);
      const ids = new Float32Array(slots.length);
      slots.forEach((sl, j) => {
        phases[j] = sl.phase;
        ids[j] = this.allSlots.indexOf(sl);
      });
      g.setAttribute("aPhase", new THREE.InstancedBufferAttribute(phases, 1));
      g.setAttribute("aSlot", new THREE.InstancedBufferAttribute(ids, 1));

      const u: Uniforms<PanelKeys> = {
          map: { value: null },
          uWindow: { value: 0.25 },
          uScroll: { value: 0 },
          uReady: { value: 0 },
          uHover: { value: -1 },
          uAspect: { value: PANEL_W / PANEL_H },
          uDim: { value: 1 },
          uFloor: { value: this.floorColor },
          uBacking: { value: this.backing },
      };
      const material = new THREE.ShaderMaterial({
        vertexShader: panelVertex,
        fragmentShader: panelFragment,
        side: THREE.BackSide,
        uniforms: u,
      });

      const mesh = new THREE.InstancedMesh(g, material, slots.length);
      slots.forEach((sl, j) => {
        dummy.position.set(0, sl.y, 0);
        dummy.rotation.set(0, sl.angle, 0);
        dummy.updateMatrix();
        mesh.setMatrixAt(j, dummy.matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
      mesh.computeBoundingSphere();
      mesh.userData.site = s;
      this.wall.add(mesh);
      this.walls.push({ mesh, material, u, slots, site });

      this.loader.load(`/screens/${dir}/${site.slug}.webp`, (tex) => {
        if (this.disposed) return tex.dispose();
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = lowPower ? 1 : 4;
        tex.generateMipmaps = true;
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        const img = tex.image as HTMLImageElement;
        this.wallTextures.set(site.slug, tex);
        u.map.value = tex;
        u.uWindow.value = Math.min(
          1,
          (PANEL_H / PANEL_W) * (img.width / img.height),
        );
        gsap.to(u.uReady, { value: 1, duration: 1.2, ease: "power2.out" });
      });
    });

    // Fond du mur (cadres sombres entre les écrans).
    const back = new THREE.Mesh(
      new THREE.CylinderGeometry(R + 0.06, R + 0.06, this.height + 0.6, 64, 1, true),
      new THREE.MeshBasicMaterial({ color: this.backing, side: THREE.BackSide }),
    );
    back.position.y = (this.height + 0.6) / 2 - 0.3;
    this.wall.add(back);
  }

  private buildFloor() {
    this.floorMat = new THREE.ShaderMaterial({
      vertexShader: floorVertex,
      fragmentShader: floorFragment,
      uniforms: {
        uC0: { value: new THREE.Color("#3f72ff") },
        uC1: { value: new THREE.Color("#1d4cff") },
        uC2: { value: new THREE.Color("#0a26b8") },
        uTime: { value: 0 },
      },
    });
    const floor = new THREE.Mesh(new THREE.CircleGeometry(R + 0.1, 96), this.floorMat);
    floor.rotation.x = -Math.PI / 2;
    this.scene.add(floor);

    // Ombre portée allongée vers la caméra (lumière zénithale arrière).
    this.shadowMat = new THREE.ShaderMaterial({
      vertexShader: floorVertex,
      fragmentShader: shadowFragment,
      transparent: true,
      depthWrite: false,
      uniforms: { uOpacity: { value: 0.7 } },
    });
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(0.85, 3.4), this.shadowMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.set(0.25, 0.01, FIGURE_Z + 1.45);
    shadow.rotation.z = -0.16;
    this.scene.add(shadow);
  }

  private buildFeature() {
    const size = new THREE.Vector2(
      FEATURE_RECT.x * 2 + FEATURE_PAD * 2,
      FEATURE_RECT.y * 2 + FEATURE_PAD * 2,
    );
    this.fu = {
        mapA: { value: null },
        mapB: { value: null },
        uWinA: { value: 0.2 },
        uWinB: { value: 0.2 },
        uReadyA: { value: 0 },
        uReadyB: { value: 0 },
        uScrollA: { value: 0 },
        uScrollB: { value: 0 },
        uMix: { value: 0 },
        uOpacity: { value: 0 },
        uFlash: { value: 0 },
        uAccentA: { value: new THREE.Color("#ffffff") },
        uAccentB: { value: new THREE.Color("#ffffff") },
        uSize: { value: size },
        uRect: { value: FEATURE_RECT.clone() },
        uStrips: { value: this.opts.lowPower ? 10 : 14 },
    };
    this.featureMat = new THREE.ShaderMaterial({
      vertexShader: featureVertex,
      fragmentShader: featureFragment,
      transparent: true,
      depthWrite: false,
      uniforms: this.fu,
    });
    this.featureMesh = new THREE.Mesh(new THREE.PlaneGeometry(size.x, size.y), this.featureMat);
    this.featureMesh.renderOrder = 10;
    this.feature.add(this.featureMesh);
    this.feature.visible = false;
    this.scene.add(this.feature);
  }

  private buildDust() {
    const count = this.opts.lowPower ? 140 : 380;
    const pos = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const r = Math.sqrt(Math.random()) * (R - 0.8);
      const a = Math.random() * Math.PI * 2;
      pos[i * 3] = Math.cos(a) * r;
      pos[i * 3 + 1] = Math.random() * this.height;
      pos[i * 3 + 2] = Math.sin(a) * r;
      seed[i] = Math.random();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    this.dustMat = new THREE.ShaderMaterial({
      vertexShader: dustVertex,
      fragmentShader: dustFragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uHeight: { value: this.height },
        uPixel: { value: 1 },
      },
    });
    this.dust = new THREE.Points(g, this.dustMat);
    this.dust.frustumCulled = false;
    this.scene.add(this.dust);
  }

  /* ----------------------------------------------------------------- */
  /* Textures des écrans décrochés                                     */
  /* ----------------------------------------------------------------- */

  private loadFeature(slug: string) {
    let p = this.featureTextures.get(slug);
    if (!p) {
      p = new Promise<THREE.Texture>((resolve, reject) => {
        this.loader.load(
          `/screens/${this.opts.lowPower ? "feature-sm" : "feature"}/${slug}.webp`,
          (tex) => {
            tex.colorSpace = THREE.SRGBColorSpace;
            tex.anisotropy = this.opts.lowPower ? 1 : 4;
            // Affiché presque à l'échelle 1 : pas de mipmaps (≈ -25 % de mémoire GPU).
            tex.generateMipmaps = false;
            tex.minFilter = THREE.LinearFilter;
            resolve(tex);
          },
          undefined,
          reject,
        );
      });
      this.featureTextures.set(slug, p);
      // Limite la mémoire GPU : on ne garde que les écrans récents.
      const cap = this.opts.lowPower ? 3 : 5;
      if (this.featureTextures.size > cap) {
        for (const [k, v] of this.featureTextures) {
          if (k === slug || k === this.featureSlug || k === this.pendingSlug) continue;
          void v.then((t) => t.dispose());
          this.featureTextures.delete(k);
          if (this.featureTextures.size <= cap) break;
        }
      }
    }
    return p;
  }

  private windowFor(tex: THREE.Texture) {
    const img = tex.image as HTMLImageElement;
    return Math.min(1, (FEATURE_RECT.y / FEATURE_RECT.x) * (img.width / img.height));
  }

  private accentOf(slug: string) {
    const p = this.opts.projects.find((x) => x.slug === slug);
    return new THREE.Color(p?.accent ?? "#ffffff");
  }

  /** Position cible de l'écran décroché (au-dessus du personnage). */
  private featureTarget() {
    const aspect = this.width / this.heightPx;
    const portrait = aspect < 0.9;
    return {
      pos: new THREE.Vector3(0, portrait ? 4.5 : 4.05, portrait ? 1.6 : 1.1),
      scale: portrait ? THREE.MathUtils.clamp(aspect * 1.9, 0.7, 1.15) : 1,
    };
  }

  /** Fait voler un écran depuis le mur jusqu'à sa place devant la caméra. */
  private async flyIn(slug: string, from?: THREE.Matrix4) {
    this.featureBusy = true;
    this.featureSlug = slug;
    this.opts.onFeature?.(slug, slug === this.pickedSlug);
    this.opts.onWhoosh?.();
    const u = this.fu;
    const accent = this.accentOf(slug);
    (u.uAccentA.value as THREE.Color).copy(accent);
    (u.uAccentB.value as THREE.Color).copy(accent);
    u.uMix.value = 0;
    u.uReadyA.value = 0;
    u.uScrollA.value = 0;

    const target = this.featureTarget();
    // Point de départ : l'écran cliqué, ou le mur droit derrière la cible.
    const start = new THREE.Vector3();
    const startQ = new THREE.Quaternion();
    const startS = new THREE.Vector3();
    if (from) {
      from.decompose(start, startQ, startS);
      // Le panneau du mur regarde le centre : on aligne le plan sur cette normale.
      const normal = start.clone().setY(0).negate().normalize();
      startQ.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
    } else {
      start.set(0, BASE_Y + PITCH + PANEL_H / 2, -R + 0.2);
      startQ.identity();
    }
    const startScale = PANEL_W / (FEATURE_RECT.x * 2);

    gsap.killTweensOf(this.feature.position);
    gsap.killTweensOf(this.feature.scale);
    gsap.killTweensOf(this.feature.quaternion);
    this.feature.visible = true;
    this.feature.position.copy(start);
    this.feature.quaternion.copy(startQ);
    this.feature.scale.setScalar(startScale);
    u.uOpacity.value = 1;
    u.uFlash.value = 1;

    const reduce = this.opts.reducedMotion;
    const d = reduce ? 0.01 : 1.25;
    gsap.to(u.uFlash, { value: 0, duration: reduce ? 0.2 : 1.1, ease: "power2.out" });
    gsap.to(this.feature.position, { ...target.pos, duration: d, ease: "power3.inOut" });
    gsap.to(this.feature.scale, {
      x: target.scale,
      y: target.scale,
      z: target.scale,
      duration: d,
      ease: "power3.inOut",
    });
    const q0 = startQ.clone();
    const tw = { t: 0 };
    gsap.to(tw, {
      t: 1,
      duration: d,
      ease: "power3.inOut",
      onUpdate: () => {
        this.feature.quaternion.slerpQuaternions(q0, new THREE.Quaternion(), tw.t);
      },
    });

    try {
      const tex = await this.loadFeature(slug);
      if (this.featureSlug !== slug) return;
      u.mapA.value = tex;
      u.uWinA.value = this.windowFor(tex);
      gsap.to(u.uReadyA, { value: 1, duration: 0.5 });
    } catch {
      /* capture indisponible : l'écran reste neutre */
    }
    gsap.delayedCall(reduce ? 0.05 : 0.9, () => {
      this.featureBusy = false;
      this.flushPending();
    });
  }

  /** Change le contenu de l'écran décroché avec la transition par lamelles. */
  private async swapTo(slug: string) {
    if (slug === this.featureSlug) return;
    this.featureBusy = true;
    this.featureSlug = slug;
    this.opts.onFeature?.(slug, slug === this.pickedSlug);
    this.figure.glance();
    const u = this.fu;
    let tex: THREE.Texture | null = null;
    try {
      tex = await this.loadFeature(slug);
    } catch {
      tex = null;
    }
    if (this.disposed || this.featureSlug !== slug) {
      this.featureBusy = false;
      this.flushPending();
      return;
    }
    this.opts.onWhoosh?.();
    u.mapB.value = tex;
    u.uScrollB.value = 0;
    u.uReadyB.value = tex ? 1 : 0;
    if (tex) u.uWinB.value = this.windowFor(tex);
    (u.uAccentB.value as THREE.Color).copy(this.accentOf(slug));
    u.uMix.value = 0;
    gsap.to(u.uMix, {
      value: 1,
      duration: this.opts.reducedMotion ? 0.2 : 1.05,
      ease: "power2.inOut",
      onComplete: () => {
        u.mapA.value = u.mapB.value;
        u.uWinA.value = u.uWinB.value;
        u.uReadyA.value = u.uReadyB.value;
        u.uScrollA.value = u.uScrollB.value;
        (u.uAccentA.value as THREE.Color).copy(u.uAccentB.value as THREE.Color);
        u.uMix.value = 0;
        this.featureBusy = false;
        this.flushPending();
      },
    });
  }

  private flyOut() {
    if (!this.featureShown) return;
    this.featureShown = false;
    this.featureSlug = null;
    this.pendingSlug = null;
    this.opts.onFeature?.(null, false);
    const u = this.fu;
    gsap.killTweensOf(this.feature.position);
    gsap.to(this.feature.position, { y: "+=2.5", z: -R + 1, duration: 0.9, ease: "power2.in" });
    gsap.to(u.uOpacity, {
      value: 0,
      duration: 0.7,
      ease: "power1.in",
      onComplete: () => {
        if (!this.featureShown) this.feature.visible = false;
        this.featureBusy = false;
      },
    });
  }

  private requestFeature(slug: string, from?: THREE.Matrix4) {
    if (!this.featureShown) {
      this.featureShown = true;
      void this.flyIn(slug, from);
      return;
    }
    if (from) {
      // Un écran cliqué remplace l'écran courant par un nouveau vol.
      void this.flyIn(slug, from);
      return;
    }
    if (this.featureBusy) {
      this.pendingSlug = slug;
      return;
    }
    void this.swapTo(slug);
  }

  private flushPending() {
    if (this.pendingSlug && this.pendingSlug !== this.featureSlug && this.featureShown) {
      const s = this.pendingSlug;
      this.pendingSlug = null;
      void this.swapTo(s);
    } else {
      this.pendingSlug = null;
    }
  }

  /* ----------------------------------------------------------------- */
  /* API publique                                                      */
  /* ----------------------------------------------------------------- */

  resize() {
    const w = this.canvas.clientWidth || window.innerWidth;
    const h = this.canvas.clientHeight || window.innerHeight;
    this.width = w;
    this.heightPx = h;
    const maxDpr = this.opts.lowPower ? 1.5 : 2;
    const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.dustMat.uniforms.uPixel!.value = dpr * (h / 900);
    if (this.featureShown && !this.featureBusy) {
      const t = this.featureTarget();
      this.feature.position.copy(t.pos);
      this.feature.scale.setScalar(t.scale);
    }
  }

  /** Position du pointeur (souris uniquement ; le tactile n'a pas de parallaxe). */
  setPointer(x: number, y: number, active: boolean) {
    this.pointerActive = active;
    if (!active) {
      this.pointer.set(10, 10);
      this.mouseTarget.set(0, 0);
      return;
    }
    const nx = THREE.MathUtils.clamp((x / this.width) * 2 - 1, -1, 1);
    const ny = THREE.MathUtils.clamp(-(y / this.heightPx) * 2 + 1, -1, 1);
    this.pointer.set(nx, ny);
    this.mouseTarget.set(nx, ny);
  }

  /** Clic / toucher sur le canvas : décroche l'écran visé. Retourne true si consommé. */
  pick(): boolean {
    this.updateHover(this.progress);
    if (this.hoverSlot < 0) return false;
    const slot = this.allSlots[this.hoverSlot];
    if (!slot) return false;
    const site = this.opts.projects[slot.site];
    if (!site) return false;
    const m = new THREE.Matrix4()
      .makeRotationY(slot.angle)
      .setPosition(0, slot.y, 0);
    const offset = new THREE.Matrix4().makeTranslation(0, 0, R - 0.3);
    m.multiply(offset);
    m.premultiply(this.wall.matrixWorld);
    this.pickedSlug = site.slug;
    this.pickedAt = this.progress;
    this.requestFeature(site.slug, m);
    return true;
  }

  /** Vue d'une étape de la caméra selon la progression. */
  private cameraAt(p: number) {
    const aspect = this.width / this.heightPx;
    const portrait = aspect < 0.9;
    const roomFov = portrait ? 74 : 53;
    const heroFov = portrait ? 70 : 56;
    // Distance au-dessus du puits pour que l'anneau supérieur remplisse l'écran.
    const vHalf = THREE.MathUtils.degToRad(heroFov / 2);
    const hHalf = Math.atan(Math.tan(vHalf) * aspect);
    const fit = Math.min(vHalf, hHalf);
    const heroY = this.height + (R * 0.8) / Math.tan(fit);
    const outroY = this.height + (R * 2.2) / Math.tan(fit);
    const roomZ = portrait ? 8.4 : 7.7;
    const roomPitch = portrait ? 0.2 : 0.13;

    let y = heroY;
    let z = 0;
    let pitch = -Math.PI / 2;
    let fov = heroFov;

    if (p >= T.heroEnd * 0.4 && p < T.projectsEnd) {
      const t = invLerp(T.heroEnd * 0.4, T.descentEnd, p);
      y = lerp(heroY, ROOM_Y, easeInOut(t));
      const tilt = smooth(invLerp(0.52, 1, t));
      pitch = lerp(-Math.PI / 2, roomPitch, tilt);
      z = lerp(0, roomZ, tilt);
      fov = lerp(heroFov, roomFov, smooth(t));
    }
    if (p >= T.projectsEnd) {
      const t = invLerp(T.projectsEnd, 0.975, p);
      const tilt = smooth(invLerp(0, 0.45, t));
      pitch = lerp(roomPitch, -Math.PI / 2, tilt);
      z = lerp(roomZ, 0, tilt);
      y = lerp(ROOM_Y, outroY, easeInOut(t));
      fov = lerp(roomFov, heroFov, smooth(t));
    }
    return { y, z, pitch, fov };
  }

  update(dt: number, progress: number, velocity: number) {
    if (this.disposed) return;
    const reduce = this.opts.reducedMotion;
    this.time += dt;

    // En mouvement réduit, la caméra saute d'une étape à l'autre.
    let p = progress;
    if (reduce) {
      const ph = phaseOf(progress);
      p =
        ph === "hero"
          ? 0
          : ph === "descent"
            ? progress < 0.25
              ? 0.2
              : T.descentEnd + 0.001
            : ph === "projects"
              ? progress
              : 1;
    }
    const prevP = this.progress;
    this.progress = p;

    // Caméra.
    const cam = this.cameraAt(p);
    this.mouse.lerp(this.mouseTarget, Math.min(1, dt * 2.5));
    const par = reduce ? 0 : 1;
    this.camera.position.set(this.mouse.x * 0.25 * par, cam.y, cam.z);
    this.camera.rotation.set(cam.pitch + this.mouse.y * 0.025 * par, -this.mouse.x * 0.04 * par, 0);
    if (Math.abs(this.camera.fov - cam.fov) > 0.01) {
      this.camera.fov = cam.fov;
      this.camera.updateProjectionMatrix();
    }

    // Rotation du mur (le « zootrope »).
    if (!reduce) this.idleRot += dt * 0.018;
    const descent = smooth(invLerp(T.heroEnd * 0.4, T.projectsStart, p));
    const pf = projectFloat(p);
    const outro = invLerp(T.projectsEnd, 1, p);
    this.wallRot = this.idleRot + descent * 1.9 + pf * PROJECT_TURN + outro * 1.4;
    this.wall.rotation.y = this.wallRot;
    this.wall.updateMatrixWorld();

    // Défilement du contenu des écrans.
    const scroll = p * 26 + this.time * (reduce ? 0 : 0.025);
    const roomDim = smooth(invLerp(0.24, T.projectsStart, p)) * (1 - smooth(Math.min(1, outro * 3)));
    const dim = 1 - 0.27 * roomDim - 0.5 * smooth(invLerp(0.9, 0.98, p));
    for (const w of this.walls) {
      w.u.uScroll.value = scroll;
      w.u.uDim.value = dim;
    }
    // L'écran décroché part du haut de la page puis la parcourt lentement,
    // comme un enregistrement, en suivant aussi le défilement.
    const adv = (reduce ? 0 : dt * 0.022) + Math.abs(p - prevP) * 5;
    this.fu.uScrollA.value += adv;
    this.fu.uScrollB.value += adv;
    this.floorMat.uniforms.uTime!.value = this.time;
    this.dustMat.uniforms.uTime!.value = reduce ? 0 : this.time;

    // Personnage.
    this.figure.update(dt, this.time, reduce ? 0 : velocity);

    // Écran décroché : piloté par le défilement, ou par un clic.
    const phase = phaseOf(p);
    const inProjects = phase === "projects";
    const active = Math.round(pf);
    if (this.pickedSlug && Math.abs(p - this.pickedAt) > 0.02) this.pickedSlug = null;
    if (inProjects) {
      if (active !== this.lastActive || !this.featureShown) {
        this.lastActive = active;
        const slug = this.opts.featured[active]?.slug;
        if (slug && !this.pickedSlug) this.requestFeature(slug);
      }
      // Pré-chargement du projet suivant.
      const next = this.opts.featured[active + 1];
      if (next) void this.loadFeature(next.slug);
    } else {
      this.lastActive = -1;
      const keepPicked = this.pickedSlug && p > 0.27 && p < T.projectsEnd;
      if (this.featureShown && !keepPicked) this.flyOut();
    }

    // Couleur du liseré du personnage.
    const rim = this.featureSlug ? this.accentOf(this.featureSlug) : new THREE.Color("#8a7dff");
    this.figure.setRim(rim);

    // Écran face caméra (libellé « À l'écran »).
    const frontAngle = (((-this.wallRot) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    const tierFront = Math.min(this.tiers - 1, 3);
    let best: Slot | undefined;
    let bestD = 9;
    for (let i = tierFront * PER_RING; i < (tierFront + 1) * PER_RING; i++) {
      const s = this.allSlots[i]!;
      let d = Math.abs(((s.angle - frontAngle + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
      d = Math.min(d, Math.PI * 2 - d);
      if (d < bestD) {
        bestD = d;
        best = s;
      }
    }
    const fs = best ? this.opts.projects[best.site]?.slug : undefined;
    if (fs && fs !== this.frontSlug) {
      this.frontSlug = fs;
      this.opts.onFront?.(fs);
    }

    this.updateHover(p);
    this.renderer.render(this.scene, this.camera);
  }

  private updateHover(p: number) {
    const allowed = this.pointerActive && p > 0.27 && p < T.projectsEnd;
    let slotId = -1;
    if (allowed) {
      this.raycaster.setFromCamera(this.pointer, this.camera);
      // L'écran décroché masque le mur derrière lui.
      const hitFeature =
        this.feature.visible && this.raycaster.intersectObject(this.featureMesh, false)[0];
      if (!hitFeature) {
        const hits = this.raycaster.intersectObjects(
          this.walls.map((w) => w.mesh),
          false,
        );
        const h = hits[0];
        if (h && h.instanceId !== undefined) {
          const wm = this.walls.find((w) => w.mesh === h.object);
          const sl = wm?.slots[h.instanceId];
          if (sl) slotId = this.allSlots.indexOf(sl);
        }
      }
    }
    if (slotId !== this.hoverSlot) {
      this.hoverSlot = slotId;
      for (const w of this.walls) w.u.uHover.value = slotId;
      const slug =
        slotId >= 0 ? (this.opts.projects[this.allSlots[slotId]!.site]?.slug ?? null) : null;
      if (slug !== this.hoverSlug) {
        this.hoverSlug = slug;
        this.opts.onHover?.(slug);
      }
    }
  }

  dispose() {
    this.disposed = true;
    gsap.killTweensOf(this.feature.position);
    this.scene.traverse((o) => {
      if (o instanceof THREE.Mesh || o instanceof THREE.Points) {
        o.geometry.dispose();
        const m = o.material as THREE.Material | THREE.Material[];
        (Array.isArray(m) ? m : [m]).forEach((x) => x.dispose());
      }
    });
    this.figure.dispose();
    this.wallTextures.forEach((t) => t.dispose());
    this.featureTextures.forEach((p) => void p.then((t) => t.dispose()).catch(() => {}));
    this.renderer.dispose();
  }
}

