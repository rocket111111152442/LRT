'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

import { generateur } from '@/lib/aleatoire';

type Qualite = 'complete' | 'allegee';

const RAYON = 2.1;

function versVecteur(lat: number, lng: number, rayon = RAYON): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -rayon * Math.sin(phi) * Math.cos(theta),
    rayon * Math.cos(phi),
    rayon * Math.sin(phi) * Math.sin(theta),
  );
}

/**
 * Ancrages des zones d'intervention annoncées par l'agence.
 * Ce sont des repères de zone, non des adresses : aucun bureau n'est
 * revendiqué à ces coordonnées.
 */
const GENEVE = { lat: 46.19, lng: 6.13 };
const ZONES = [
  { lat: 50.1, lng: 8.7 }, // Europe continentale
  { lat: 45.5, lng: -73.6 }, // Canada
  { lat: 40.7, lng: -74.0 }, // États-Unis
  { lat: 51.5, lng: -0.13 }, // Europe de l'Ouest
];

/* ==========================================================================
   Sphère de points
   ========================================================================== */

function SphereDePoints({ qualite }: { qualite: Qualite }) {
  const geometrie = useMemo(() => {
    const hasard = generateur(0x474c4f42);
    const nombre = qualite === 'complete' ? 5200 : 2200;
    const positions = new Float32Array(nombre * 3);
    const intensites = new Float32Array(nombre);

    // Répartition de Fibonacci : points régulièrement espacés sur la sphère.
    const angleDor = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < nombre; i += 1) {
      const y = 1 - (i / (nombre - 1)) * 2;
      const rayonAnneau = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = angleDor * i;

      positions[i * 3] = Math.cos(theta) * rayonAnneau * RAYON;
      positions[i * 3 + 1] = y * RAYON;
      positions[i * 3 + 2] = Math.sin(theta) * rayonAnneau * RAYON;
      intensites[i] = 0.35 + hasard() * 0.65;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aIntensite', new THREE.BufferAttribute(intensites, 1));
    return geo;
  }, [qualite]);

  useEffect(() => () => geometrie.dispose(), [geometrie]);

  return (
    <points geometry={geometrie}>
      <shaderMaterial
        transparent
        depthWrite={false}
        uniforms={{ uCouleur: { value: new THREE.Color('#5d6f80') } }}
        vertexShader={
          /* glsl */ `
          attribute float aIntensite;
          varying float vIntensite;
          varying float vFace;
          void main() {
            vIntensite = aIntensite;
            vec4 positionVue = modelViewMatrix * vec4(position, 1.0);
            // Les points de la face arrière s'estompent : la sphère garde son volume.
            vec3 normaleVue = normalize(normalMatrix * normalize(position));
            vFace = smoothstep(-0.35, 0.55, normaleVue.z);
            gl_Position = projectionMatrix * positionVue;
            gl_PointSize = 2.0 * (1.0 / -positionVue.z) * 26.0;
          }
        `
        }
        fragmentShader={
          /* glsl */ `
          uniform vec3 uCouleur;
          varying float vIntensite;
          varying float vFace;
          void main() {
            float d = length(gl_PointCoord - vec2(0.5));
            if (d > 0.5) discard;
            float alpha = smoothstep(0.5, 0.15, d) * vIntensite * vFace;
            gl_FragColor = vec4(uCouleur, alpha * 0.75);
          }
        `
        }
      />
    </points>
  );
}

/* ==========================================================================
   Liaisons internationales
   ========================================================================== */

function Liaison({
  vers,
  decalage,
  anime,
}: {
  vers: THREE.Vector3;
  decalage: number;
  anime: boolean;
}) {
  const impulsion = useRef<THREE.Mesh>(null);

  const courbe = useMemo(() => {
    const depart = versVecteur(GENEVE.lat, GENEVE.lng);
    const milieu = depart.clone().add(vers).multiplyScalar(0.5);
    // L'arc s'élève d'autant plus que les deux points sont éloignés.
    const elevation = 1 + depart.distanceTo(vers) / (RAYON * 3.4);
    milieu.normalize().multiplyScalar(RAYON * elevation);
    return new THREE.QuadraticBezierCurve3(depart, milieu, vers);
  }, [vers]);

  const trait = useMemo(() => {
    const geometrie = new THREE.BufferGeometry().setFromPoints(courbe.getPoints(64));
    const materiau = new THREE.LineBasicMaterial({
      color: '#c9ab72',
      transparent: true,
      opacity: 0.3,
      depthWrite: false,
    });
    return new THREE.Line(geometrie, materiau);
  }, [courbe]);

  useEffect(
    () => () => {
      trait.geometry.dispose();
      (trait.material as THREE.Material).dispose();
    },
    [trait],
  );

  useFrame((etat) => {
    if (!impulsion.current || !anime) return;
    const t = (etat.clock.elapsedTime * 0.19 + decalage) % 1;
    impulsion.current.position.copy(courbe.getPointAt(t));
    const opacite = Math.sin(t * Math.PI);
    (impulsion.current.material as THREE.MeshBasicMaterial).opacity = opacite;
    impulsion.current.scale.setScalar(0.6 + opacite * 0.6);
  });

  return (
    <group>
      <primitive object={trait} />
      <mesh position={vers}>
        <sphereGeometry args={[0.035, 12, 12]} />
        <meshBasicMaterial color="#c9ab72" toneMapped={false} />
      </mesh>
      {anime && (
        <mesh ref={impulsion}>
          <sphereGeometry args={[0.038, 10, 10]} />
          <meshBasicMaterial color="#f0dcb4" transparent toneMapped={false} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}

/* ==========================================================================
   Scène
   ========================================================================== */

function Globe({ qualite }: { qualite: Qualite }) {
  const groupe = useRef<THREE.Group>(null);

  const zones = useMemo(() => ZONES.map((zone) => versVecteur(zone.lat, zone.lng)), []);
  const geneve = useMemo(() => versVecteur(GENEVE.lat, GENEVE.lng), []);

  useFrame((etat, delta) => {
    if (!groupe.current) return;
    groupe.current.rotation.y += delta * 0.075;
    // Léger balancement de l'axe, pour éviter la rotation trop mécanique.
    groupe.current.rotation.x = -0.18 + Math.sin(etat.clock.elapsedTime * 0.14) * 0.06;
  });

  return (
    <group ref={groupe}>
      <SphereDePoints qualite={qualite} />

      {/* Voile interne : donne de la masse au globe */}
      <mesh>
        <sphereGeometry args={[RAYON * 0.985, 48, 48]} />
        <meshBasicMaterial color="#080b0f" transparent opacity={0.94} />
      </mesh>

      {/* Halo de limbe */}
      <mesh>
        <sphereGeometry args={[RAYON * 1.035, 48, 48]} />
        <shaderMaterial
          transparent
          side={THREE.BackSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          uniforms={{ uCouleur: { value: new THREE.Color('#4a6272') } }}
          vertexShader={`
            varying vec3 vNormale;
            void main() {
              vNormale = normalize(normalMatrix * normal);
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            uniform vec3 uCouleur;
            varying vec3 vNormale;
            void main() {
              float bord = pow(1.0 - abs(vNormale.z), 2.4);
              gl_FragColor = vec4(uCouleur, bord * 0.5);
            }
          `}
        />
      </mesh>

      {/* Origine : Genève */}
      <mesh position={geneve}>
        <sphereGeometry args={[0.055, 16, 16]} />
        <meshBasicMaterial color="#f0dcb4" toneMapped={false} />
      </mesh>

      {zones.map((zone, index) => (
        <Liaison key={index} vers={zone} decalage={index * 0.24} anime={qualite === 'complete'} />
      ))}
    </group>
  );
}

export default function SceneGlobe({ qualite = 'complete' }: { qualite?: Qualite }) {
  return (
    <Canvas
      aria-hidden="true"
      dpr={qualite === 'complete' ? [1, 1.75] : [1, 1.25]}
      camera={{ position: [0, 0.6, 6.2], fov: 40 }}
      gl={{ antialias: qualite === 'complete', alpha: true, powerPreference: 'high-performance' }}
      style={{ pointerEvents: 'none' }}
    >
      <Globe qualite={qualite} />
    </Canvas>
  );
}
