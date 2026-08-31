'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

import { generateur } from '@/lib/aleatoire';

type Qualite = 'complete' | 'allegee';

/**
 * Balayage de détection.
 *
 * Un volume de points figure un espace clos ; un front lumineux le traverse
 * lentement et éclaire ce qu'il rencontre. Quelques points continuent de
 * pulser après son passage : ce sont les anomalies relevées.
 *
 * La représentation reste abstraite — ni radar, ni interface d'instrument.
 */

const LARGEUR = 9;
const HAUTEUR = 4.2;
const PROFONDEUR = 5;

function Volume({ qualite }: { qualite: Qualite }) {
  const materiau = useRef<THREE.ShaderMaterial>(null);

  const geometrie = useMemo(() => {
    const hasard = generateur(0x42414c41);
    const nombre = qualite === 'complete' ? 3400 : 1500;
    const positions = new Float32Array(nombre * 3);
    const anomalies = new Float32Array(nombre);
    const phases = new Float32Array(nombre);

    for (let i = 0; i < nombre; i += 1) {
      positions[i * 3] = (hasard() - 0.5) * LARGEUR;
      positions[i * 3 + 1] = (hasard() - 0.5) * HAUTEUR;
      positions[i * 3 + 2] = (hasard() - 0.5) * PROFONDEUR;
      // Environ un point sur cinquante est marqué comme anomalie.
      anomalies[i] = hasard() < 0.02 ? 1 : 0;
      phases[i] = hasard() * Math.PI * 2;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aAnomalie', new THREE.BufferAttribute(anomalies, 1));
    geo.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
    return geo;
  }, [qualite]);

  useEffect(() => () => geometrie.dispose(), [geometrie]);

  const uniformes = useMemo(
    () => ({
      uTemps: { value: 0 },
      uFront: { value: -LARGEUR / 2 },
      uNeutre: { value: new THREE.Color('#3b4855') },
      uActif: { value: new THREE.Color('#c9ab72') },
      uAnomalie: { value: new THREE.Color('#e2caa0') },
    }),
    [],
  );

  useFrame((etat) => {
    if (!materiau.current) return;
    const t = etat.clock.elapsedTime;
    materiau.current.uniforms.uTemps!.value = t;
    // Va-et-vient continu du front, d'un bord à l'autre du volume.
    const cycle = (Math.sin(t * 0.28) + 1) / 2;
    materiau.current.uniforms.uFront!.value = -LARGEUR / 2 + cycle * LARGEUR;
  });

  return (
    <points geometry={geometrie}>
      <shaderMaterial
        ref={materiau}
        uniforms={uniformes}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexShader={
          /* glsl */ `
          uniform float uTemps;
          uniform float uFront;
          attribute float aAnomalie;
          attribute float aPhase;
          varying float vEclat;
          varying float vAnomalie;

          void main() {
            vAnomalie = aAnomalie;

            // Proximité au front de balayage : 1 sur le front, 0 au loin.
            float distanceFront = abs(position.x - uFront);
            float eclat = smoothstep(1.15, 0.0, distanceFront);

            // Les anomalies continuent de battre après le passage du front.
            float battement = 0.5 + 0.5 * sin(uTemps * 2.6 + aPhase);
            vEclat = max(eclat, aAnomalie * battement * 0.85);

            vec3 pos = position;
            // Le front soulève légèrement la matière qu'il traverse.
            pos.y += eclat * 0.14 * sin(uTemps * 1.4 + aPhase);

            vec4 positionVue = modelViewMatrix * vec4(pos, 1.0);
            gl_Position = projectionMatrix * positionVue;
            gl_PointSize = (1.4 + vEclat * 2.6) * (1.0 / -positionVue.z) * 22.0;
          }
        `
        }
        fragmentShader={
          /* glsl */ `
          uniform vec3 uNeutre;
          uniform vec3 uActif;
          uniform vec3 uAnomalie;
          varying float vEclat;
          varying float vAnomalie;

          void main() {
            float d = length(gl_PointCoord - vec2(0.5));
            if (d > 0.5) discard;
            float alpha = smoothstep(0.5, 0.12, d);

            vec3 couleur = mix(uNeutre, uActif, vEclat);
            couleur = mix(couleur, uAnomalie, vAnomalie * vEclat);

            gl_FragColor = vec4(couleur, alpha * (0.12 + vEclat * 0.88));
          }
        `
        }
      />
    </points>
  );
}

/** Plan translucide matérialisant le front, discret et sans contour dur. */
function Front() {
  const plan = useRef<THREE.Mesh>(null);

  useFrame((etat) => {
    if (!plan.current) return;
    const cycle = (Math.sin(etat.clock.elapsedTime * 0.28) + 1) / 2;
    plan.current.position.x = -LARGEUR / 2 + cycle * LARGEUR;
  });

  return (
    <mesh ref={plan} rotation={[0, Math.PI / 2, 0]}>
      <planeGeometry args={[PROFONDEUR, HAUTEUR]} />
      <shaderMaterial
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
        uniforms={{ uCouleur: { value: new THREE.Color('#c9ab72') } }}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform vec3 uCouleur;
          varying vec2 vUv;
          void main() {
            // Voile atténué vers les bords du plan.
            float bordX = smoothstep(0.0, 0.22, vUv.x) * smoothstep(1.0, 0.78, vUv.x);
            float bordY = smoothstep(0.0, 0.14, vUv.y) * smoothstep(1.0, 0.86, vUv.y);
            gl_FragColor = vec4(uCouleur, bordX * bordY * 0.07);
          }
        `}
      />
    </mesh>
  );
}

export default function SceneBalayage({ qualite = 'complete' }: { qualite?: Qualite }) {
  return (
    <Canvas
      aria-hidden="true"
      dpr={qualite === 'complete' ? [1, 1.75] : [1, 1.25]}
      camera={{ position: [0, 0.9, 7], fov: 44 }}
      gl={{ antialias: qualite === 'complete', alpha: true, powerPreference: 'high-performance' }}
      style={{ pointerEvents: 'none' }}
    >
      <fog attach="fog" args={['#06080b', 6, 15]} />
      <Volume qualite={qualite} />
      {qualite === 'complete' && <Front />}
    </Canvas>
  );
}
