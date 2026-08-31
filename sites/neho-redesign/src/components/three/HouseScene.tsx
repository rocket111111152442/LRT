"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Group } from "three";

/** Rectangle aux coins arrondis, extrudé en volume — pas de dépendance
 * externe (drei) pour un budget de bundle minimal : juste `three`, déjà
 * une dépendance du projet. */
function roundedRectShape(width: number, height: number, radius: number) {
  const shape = new THREE.Shape();
  const w = width / 2;
  const h = height / 2;
  const r = Math.min(radius, w, h);
  shape.moveTo(-w + r, -h);
  shape.lineTo(w - r, -h);
  shape.quadraticCurveTo(w, -h, w, -h + r);
  shape.lineTo(w, h - r);
  shape.quadraticCurveTo(w, h, w - r, h);
  shape.lineTo(-w + r, h);
  shape.quadraticCurveTo(-w, h, -w, h - r);
  shape.lineTo(-w, -h + r);
  shape.quadraticCurveTo(-w, -h, -w + r, -h);
  return shape;
}

function useRoundedSlab(width: number, height: number, depth: number, radius: number) {
  return useMemo(() => {
    const geometry = new THREE.ExtrudeGeometry(roundedRectShape(width, height, radius), {
      depth,
      bevelEnabled: false,
      curveSegments: 8,
    });
    geometry.translate(0, 0, -depth / 2);
    geometry.rotateX(-Math.PI / 2);
    return geometry;
  }, [width, height, depth, radius]);
}

/**
 * Composition architecturale abstraite (volumes décalés façon maquette de
 * masse) plutôt qu'une "maison jouet" figurative — plus proche d'un
 * rendu de studio d'architecture que d'un asset 3D générique.
 */
function Composition() {
  const group = useRef<Group>(null);

  useFrame((state) => {
    if (!group.current) return;
    group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.12) * 0.28 + state.clock.elapsedTime * 0.035;
    group.current.position.y = Math.sin(state.clock.elapsedTime * 0.55) * 0.05;
  });

  const baseGeo = useRoundedSlab(1.9, 1.5, 0.62, 0.16);
  const midGeo = useRoundedSlab(1.3, 1.0, 0.5, 0.14);
  const canopyGeo = useRoundedSlab(1.55, 1.2, 0.08, 0.12);
  const accentGeo = useRoundedSlab(1.7, 0.045, 0.09, 0.02);

  return (
    <group ref={group} position={[0, -0.2, 0]}>
      {/* Volume principal */}
      <mesh geometry={baseGeo} castShadow receiveShadow>
        <meshStandardMaterial color="#f5f1e8" roughness={0.75} />
      </mesh>

      {/* Volume secondaire, décalé en hauteur et en profondeur — masse
          asymétrique plutôt qu'une silhouette de maison symétrique */}
      <mesh geometry={midGeo} position={[0.5, 0.62, -0.22]} castShadow receiveShadow>
        <meshStandardMaterial color="#e9e1d1" roughness={0.8} />
      </mesh>

      {/* Plan "toit" flottant, indigo — élément signature de la marque */}
      <mesh geometry={canopyGeo} position={[0.08, 1.25, -0.12]} castShadow>
        <meshStandardMaterial color="#392a6b" roughness={0.35} metalness={0.15} />
      </mesh>

      {/* Liseré bronze sous le toit */}
      <mesh geometry={accentGeo} position={[0.08, 1.195, 0.46]}>
        <meshStandardMaterial color="#c79a41" roughness={0.3} metalness={0.4} />
      </mesh>

      {/* Baie vitrée, à fleur de la façade principale (le volume de base
          fait 1.5 de profondeur en Z après rotation du plan extrudé,
          donc sa face avant est à z = +0.75) */}
      <mesh position={[0, 0.02, 0.755]}>
        <planeGeometry args={[0.55, 0.45]} />
        <meshStandardMaterial
          color="#a292d4"
          roughness={0.1}
          metalness={0.2}
          emissive="#4c3a8a"
          emissiveIntensity={0.15}
        />
      </mesh>

      {/* Ombre de contact douce au sol */}
      <mesh position={[0, -0.63, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[1.7, 32]} />
        <shadowMaterial opacity={0.16} />
      </mesh>
    </group>
  );
}

/**
 * Scène 3D très légère : quelques volumes extrudés, sans texture lourde ni
 * post-processing, pour rester à 60 FPS sur un ordinateur récent. Montée
 * uniquement côté client via next/dynamic (voir HeroScene.tsx), jamais
 * pendant le rendu serveur.
 */
export function HouseScene() {
  return (
    <Canvas
      shadows
      dpr={[1, 1.6]}
      camera={{ position: [3.2, 2, 3.6], fov: 38 }}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      style={{ width: "100%", height: "100%" }}
    >
      <ambientLight intensity={0.55} />
      <directionalLight
        position={[4, 5, 2]}
        intensity={1.2}
        color="#fbf9f4"
        castShadow
        shadow-mapSize-width={512}
        shadow-mapSize-height={512}
        shadow-camera-left={-2.5}
        shadow-camera-right={2.5}
        shadow-camera-top={2.5}
        shadow-camera-bottom={-2.5}
        shadow-camera-near={0.5}
        shadow-camera-far={10}
      />
      <directionalLight position={[-3, 2, -2]} intensity={0.4} color="#a292d4" />
      <Composition />
    </Canvas>
  );
}
