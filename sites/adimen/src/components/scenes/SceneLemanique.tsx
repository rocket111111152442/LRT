'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

import { bureaux } from '@/content/site';
import { generateur } from '@/lib/aleatoire';
import { proximiteLac, versScene } from '@/lib/geo';

type Qualite = 'complete' | 'allegee';

/* ==========================================================================
   Nappe de points — le territoire
   Le lac n'est pas dessiné : il est creusé. Les points situés dans l'eau sont
   retirés, et la silhouette du Léman apparaît en négatif.
   ========================================================================== */

const vertexNappe = /* glsl */ `
  uniform float uTemps;
  uniform float uTaille;
  attribute float aIntensite;
  attribute float aPhase;
  varying float vIntensite;

  void main() {
    vIntensite = aIntensite;

    vec3 pos = position;
    // Respiration très lente de la nappe, décalée point par point.
    pos.y += sin(uTemps * 0.35 + aPhase) * 0.045;

    vec4 positionVue = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * positionVue;
    // Atténuation par la distance : les points lointains restent fins.
    gl_PointSize = uTaille * (1.0 / -positionVue.z) * 26.0;
  }
`;

const fragmentNappe = /* glsl */ `
  uniform vec3 uCouleurTerre;
  uniform vec3 uCouleurRive;
  varying float vIntensite;

  void main() {
    // Point circulaire adouci sur les bords.
    float d = length(gl_PointCoord - vec2(0.5));
    if (d > 0.5) discard;
    float alpha = smoothstep(0.5, 0.16, d);

    vec3 couleur = mix(uCouleurTerre, uCouleurRive, vIntensite);
    // Plancher d'opacité relevé : sans lui, la terre disparaît sur le fond noir
    // et le creux du lac cesse d'être lisible.
    gl_FragColor = vec4(couleur, alpha * (0.45 + vIntensite * 0.55));
  }
`;

function Nappe({ qualite }: { qualite: Qualite }) {
  const materiauRef = useRef<THREE.ShaderMaterial>(null);

  const geometrie = useMemo(() => {
    // Graine fixe : la nappe est identique à chaque chargement, et sa
    // construction reste une fonction pure.
    const hasard = generateur(0x4c454d41);
    const pas = qualite === 'complete' ? 0.15 : 0.22;
    const positions: number[] = [];
    const intensites: number[] = [];
    const phases: number[] = [];

    for (let x = -8.4; x <= 8.4; x += pas) {
      for (let z = -3.6; z <= 3.6; z += pas) {
        // Léger désordre : une grille parfaitement régulière ferait « moiré ».
        const dx = x + (hasard() - 0.5) * pas * 0.55;
        const dz = z + (hasard() - 0.5) * pas * 0.55;

        const rapport = proximiteLac(dx, dz);
        if (rapport < 1) continue; // dans l'eau : pas de point

        // Fondu vers les bords du cadre, pour éviter une découpe nette.
        const bord =
          Math.min(1, (8.4 - Math.abs(dx)) / 2.2) * Math.min(1, (3.6 - Math.abs(dz)) / 1.4);
        if (bord <= 0) continue;

        // Les points proches de la rive s'éclairent : le trait de côte se lit.
        const rive = Math.max(0, 1 - (rapport - 1) * 1.9);

        positions.push(dx, 0, dz);
        intensites.push(Math.min(1, rive * bord + bord * 0.3));
        phases.push(hasard() * Math.PI * 2);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('aIntensite', new THREE.Float32BufferAttribute(intensites, 1));
    geo.setAttribute('aPhase', new THREE.Float32BufferAttribute(phases, 1));
    return geo;
  }, [qualite]);

  const uniformes = useMemo(
    () => ({
      uTemps: { value: 0 },
      uTaille: { value: qualite === 'complete' ? 1.25 : 1.6 },
      uCouleurTerre: { value: new THREE.Color('#3d4a58') },
      uCouleurRive: { value: new THREE.Color('#c9ab72') },
    }),
    [qualite],
  );

  useFrame((etat) => {
    if (materiauRef.current) {
      materiauRef.current.uniforms.uTemps!.value = etat.clock.elapsedTime;
    }
  });

  return (
    <points geometry={geometrie} frustumCulled={false}>
      <shaderMaterial
        ref={materiauRef}
        uniforms={uniformes}
        vertexShader={vertexNappe}
        fragmentShader={fragmentNappe}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* ==========================================================================
   Implantations — repère lumineux et faisceau vertical
   ========================================================================== */

function Implantation({
  position,
  principal,
  index,
}: {
  position: [number, number];
  principal: boolean;
  index: number;
}) {
  const halo = useRef<THREE.Mesh>(null);
  const [x, z] = position;

  useFrame((etat) => {
    if (!halo.current) return;
    // Pulsation lente et décalée, pour que les quatre points ne battent pas ensemble.
    const t = etat.clock.elapsedTime * 0.8 + index * 1.7;
    const echelle = 1 + Math.sin(t) * 0.18;
    halo.current.scale.setScalar(echelle);
    (halo.current.material as THREE.MeshBasicMaterial).opacity =
      (principal ? 0.34 : 0.22) + Math.sin(t) * 0.09;
  });

  const rayon = principal ? 0.075 : 0.055;
  const hauteur = principal ? 1.5 : 1.05;

  return (
    <group position={[x, 0, z]}>
      {/* Noyau */}
      <mesh>
        <sphereGeometry args={[rayon, 16, 16]} />
        <meshBasicMaterial color={principal ? '#f0dcb4' : '#c9ab72'} toneMapped={false} />
      </mesh>

      {/* Halo pulsant */}
      <mesh ref={halo} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[rayon * 2.4, rayon * 3.6, 40]} />
        <meshBasicMaterial
          color="#c9ab72"
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>

      {/* Faisceau vertical, dégradé vers le haut */}
      <mesh position={[0, hauteur / 2, 0]}>
        <cylinderGeometry args={[rayon * 0.32, rayon * 0.32, hauteur, 8, 1, true]} />
        <shaderMaterial
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          uniforms={{ uCouleur: { value: new THREE.Color('#c9ab72') } }}
          vertexShader={`
            varying float vH;
            void main() {
              vH = uv.y;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            uniform vec3 uCouleur;
            varying float vH;
            void main() {
              gl_FragColor = vec4(uCouleur, (1.0 - vH) * 0.34);
            }
          `}
        />
      </mesh>
    </group>
  );
}

/* ==========================================================================
   Liaisons — arcs entre implantations, parcourus par une impulsion
   ========================================================================== */

function Liaison({
  depart,
  arrivee,
  decalage,
  anime,
}: {
  depart: [number, number];
  arrivee: [number, number];
  decalage: number;
  anime: boolean;
}) {
  const impulsion = useRef<THREE.Mesh>(null);

  const courbe = useMemo(() => {
    const a = new THREE.Vector3(depart[0], 0.04, depart[1]);
    const b = new THREE.Vector3(arrivee[0], 0.04, arrivee[1]);
    const milieu = a.clone().lerp(b, 0.5);
    // Hauteur de l'arc proportionnelle à la distance parcourue.
    milieu.y = 0.34 + a.distanceTo(b) * 0.11;
    return new THREE.QuadraticBezierCurve3(a, milieu, b);
  }, [depart, arrivee]);

  const trait = useMemo(() => {
    const geometrie = new THREE.BufferGeometry().setFromPoints(courbe.getPoints(56));
    const materiau = new THREE.LineBasicMaterial({
      color: '#c9ab72',
      transparent: true,
      opacity: 0.2,
      depthWrite: false,
    });
    return new THREE.Line(geometrie, materiau);
  }, [courbe]);

  // Libère la géométrie et le matériau quand l'arc disparaît.
  useEffect(
    () => () => {
      trait.geometry.dispose();
      (trait.material as THREE.Material).dispose();
    },
    [trait],
  );

  useFrame((etat) => {
    if (!impulsion.current || !anime) return;
    // Progression cyclique le long de l'arc.
    const t = (etat.clock.elapsedTime * 0.16 + decalage) % 1;
    const point = courbe.getPointAt(t);
    impulsion.current.position.copy(point);
    // Le point s'efface aux extrémités plutôt que d'apparaître brutalement.
    const opacite = Math.sin(t * Math.PI);
    (impulsion.current.material as THREE.MeshBasicMaterial).opacity = opacite * 0.95;
    impulsion.current.scale.setScalar(0.55 + opacite * 0.65);
  });

  return (
    <group>
      <primitive object={trait} />
      {anime && (
        <mesh ref={impulsion}>
          <sphereGeometry args={[0.045, 10, 10]} />
          <meshBasicMaterial color="#f0dcb4" transparent toneMapped={false} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}

/* ==========================================================================
   Mouvement de caméra — dérive lente et parallaxe au pointeur
   ========================================================================== */

function Camera() {
  const cible = useRef({ x: 0, y: 0 });

  useFrame((etat, delta) => {
    const { camera } = etat;
    const t = etat.clock.elapsedTime;
    // `etat.pointer` vaut 0,0 tant que la souris n'a pas bougé : sur mobile la
    // scène garde donc simplement sa dérive.
    cible.current.x = etat.pointer.x * 0.9;
    cible.current.y = etat.pointer.y * 0.5;

    // Dérive volontairement courte : le cadrage doit rester tel que les quatre
    // implantations restent dans le champ, texte de couverture compris.
    const viseX = Math.sin(t * 0.08) * 0.45 + cible.current.x * 0.6;
    const viseY = 6.2 + Math.sin(t * 0.06) * 0.24 - cible.current.y * 0.6;

    // Amortissement indépendant de la fréquence d'affichage.
    const k = 1 - Math.exp(-2.2 * delta);
    camera.position.x += (viseX - camera.position.x) * k;
    camera.position.y += (viseY - camera.position.y) * k;
    // Le point visé est décalé vers l'ouest : l'arc lémanique se déploie ainsi
    // dans la moitié droite, là où le texte de couverture ne le recouvre pas.
    camera.lookAt(-2, 0, 0);
  });

  return null;
}

/* ==========================================================================
   Scène
   ========================================================================== */

export default function SceneLemanique({ qualite = 'complete' }: { qualite?: Qualite }) {
  const implantations = useMemo(
    () =>
      bureaux.map((bureau) => ({
        id: bureau.id,
        position: versScene(bureau.lng, bureau.lat),
        principal: bureau.principal,
      })),
    [],
  );

  const liaisons = useMemo(() => {
    const paires: { depart: [number, number]; arrivee: [number, number] }[] = [];
    for (let i = 0; i < implantations.length - 1; i += 1) {
      const a = implantations[i];
      const b = implantations[i + 1];
      if (a && b) paires.push({ depart: a.position, arrivee: b.position });
    }
    // Liaison directe Genève – Montreux, qui referme la figure.
    const geneve = implantations[0];
    const montreux = implantations[2];
    if (geneve && montreux) paires.push({ depart: geneve.position, arrivee: montreux.position });
    return paires;
  }, [implantations]);

  return (
    <Canvas
      /* Le canevas est décoratif : le contenu équivalent est dans le DOM. */
      aria-hidden="true"
      dpr={qualite === 'complete' ? [1, 1.75] : [1, 1.25]}
      camera={{ position: [0, 6.2, 8.6], fov: 42, near: 0.1, far: 60 }}
      gl={{ antialias: qualite === 'complete', alpha: true, powerPreference: 'high-performance' }}
      style={{ pointerEvents: 'none' }}
    >
      <fog attach="fog" args={['#06080b', 9, 24]} />

      <Nappe qualite={qualite} />

      {implantations.map((implantation, index) => (
        <Implantation
          key={implantation.id}
          position={implantation.position}
          principal={implantation.principal}
          index={index}
        />
      ))}

      {liaisons.map((liaison, index) => (
        <Liaison
          key={index}
          depart={liaison.depart}
          arrivee={liaison.arrivee}
          decalage={index * 0.27}
          anime={qualite === 'complete'}
        />
      ))}

      <Camera />
    </Canvas>
  );
}
