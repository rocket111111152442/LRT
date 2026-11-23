import * as THREE from "three";
import { figureFragment, figureVertex } from "./shaders";

/**
 * Silhouette procédurale en manteau long, vue de dos, éclairée en contre-jour.
 *
 * La référence utilise un personnage 3D riggé et animé (fichier d'origine non
 * disponible). On reproduit ici sa lecture à l'écran : silhouette sombre,
 * liseré coloré selon le projet, marche et petits mouvements de tête.
 */
export class Figure {
  readonly group = new THREE.Group();
  readonly material: THREE.ShaderMaterial;
  private body = new THREE.Group();
  private head = new THREE.Group();
  private legL = new THREE.Group();
  private legR = new THREE.Group();
  private armL = new THREE.Group();
  private armR = new THREE.Group();
  private coat: THREE.Mesh;
  private phase = 0;
  private walk = 0;
  private yaw = 0;
  private yawTarget = 0;
  private lookTimer = 0;

  constructor(floor: THREE.Color) {
    this.material = new THREE.ShaderMaterial({
      vertexShader: figureVertex,
      fragmentShader: figureFragment,
      uniforms: {
        uBase: { value: new THREE.Color("#020203") },
        uRim: { value: new THREE.Color("#7c6bff") },
        uFloor: { value: floor.clone() },
      },
    });
    const m = this.material;
    const seg = 14;

    // Jambes (pivot à la hanche).
    const legGeo = new THREE.CapsuleGeometry(0.062, 0.8, 4, seg);
    legGeo.translate(0, -0.47, 0);
    for (const [g, x] of [
      [this.legL, -0.085],
      [this.legR, 0.085],
    ] as const) {
      const leg = new THREE.Mesh(legGeo, m);
      g.add(leg);
      g.position.set(x, 0.98, 0);
      this.body.add(g);
    }

    // Manteau long (profil de révolution), légèrement aplati.
    const profile = [
      new THREE.Vector2(0.0, 0.5),
      new THREE.Vector2(0.255, 0.52),
      new THREE.Vector2(0.245, 0.62),
      new THREE.Vector2(0.21, 0.95),
      new THREE.Vector2(0.175, 1.15),
      new THREE.Vector2(0.17, 1.35),
      new THREE.Vector2(0.2, 1.55),
      new THREE.Vector2(0.19, 1.64),
      new THREE.Vector2(0.1, 1.7),
      new THREE.Vector2(0.05, 1.72),
      new THREE.Vector2(0.0, 1.72),
    ];
    const coatGeo = new THREE.LatheGeometry(profile, 28);
    coatGeo.scale(1, 1, 0.72);
    this.coat = new THREE.Mesh(coatGeo, m);
    this.body.add(this.coat);

    // Col / cou.
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.06, 0.14, seg), m);
    neck.position.y = 1.77;
    this.body.add(neck);

    // Tête + cheveux.
    const skull = new THREE.Mesh(new THREE.SphereGeometry(0.1, 20, 16), m);
    skull.scale.set(0.92, 1.08, 1);
    const hair = new THREE.Mesh(
      new THREE.SphereGeometry(0.107, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.55),
      m,
    );
    hair.position.set(0, 0.02, -0.012);
    this.head.add(skull, hair);
    this.head.position.y = 1.9;
    this.body.add(this.head);

    // Bras (pivot à l'épaule), manches du manteau.
    const armGeo = new THREE.CapsuleGeometry(0.052, 0.62, 4, seg);
    armGeo.translate(0, -0.34, 0);
    for (const [g, x] of [
      [this.armL, -0.215],
      [this.armR, 0.215],
    ] as const) {
      const arm = new THREE.Mesh(armGeo, m);
      g.add(arm);
      g.position.set(x, 1.6, 0);
      g.rotation.z = x < 0 ? -0.05 : 0.05;
      this.body.add(g);
    }

    this.group.add(this.body);
    this.group.scale.setScalar(1.05);
  }

  setRim(c: THREE.Color) {
    (this.material.uniforms.uRim!.value as THREE.Color).lerp(c, 0.06);
  }

  /** Petit mouvement de tête/buste quand un nouveau projet apparaît. */
  glance() {
    this.yawTarget = (Math.random() - 0.5) * 0.5;
    this.lookTimer = 1.4;
  }

  update(dt: number, time: number, speed: number) {
    // Marche pilotée par la vitesse de défilement.
    const target = Math.min(1, Math.abs(speed) * 2.2);
    this.walk += (target - this.walk) * Math.min(1, dt * 3);
    this.phase += dt * (2.2 + this.walk * 5.5);

    const s = Math.sin(this.phase);
    const amp = this.walk;
    this.legL.rotation.x = s * 0.5 * amp;
    this.legR.rotation.x = -s * 0.5 * amp;
    this.armL.rotation.x = -s * 0.35 * amp;
    this.armR.rotation.x = s * 0.35 * amp;
    this.coat.rotation.y = s * 0.05 * amp;
    this.body.position.y = Math.abs(Math.cos(this.phase)) * 0.035 * amp;

    // Respiration / balancement au repos.
    const idle = 1 - amp;
    this.body.rotation.z = Math.sin(time * 0.7) * 0.012 * idle;
    this.head.rotation.x = Math.sin(time * 0.45) * 0.03 * idle - 0.08;

    // Regard.
    if (this.lookTimer > 0) {
      this.lookTimer -= dt;
      if (this.lookTimer <= 0) this.yawTarget = 0;
    }
    this.yaw += (this.yawTarget - this.yaw) * Math.min(1, dt * 2.5);
    this.head.rotation.y = this.yaw;
    this.body.rotation.y = this.yaw * 0.35;
  }

  dispose() {
    this.group.traverse((o) => {
      if (o instanceof THREE.Mesh) o.geometry.dispose();
    });
    this.material.dispose();
  }
}
