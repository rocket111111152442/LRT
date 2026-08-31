"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import type { Group } from "three";

function House() {
  const group = useRef<Group>(null);

  useFrame((state) => {
    if (!group.current) return;
    group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.15) * 0.35 + state.clock.elapsedTime * 0.05;
    group.current.position.y = Math.sin(state.clock.elapsedTime * 0.6) * 0.06;
  });

  return (
    <group ref={group} position={[0, -0.2, 0]}>
      {/* Corps principal */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 1, 1.4]} />
        <meshStandardMaterial color="#f5f1e8" roughness={0.85} />
      </mesh>
      {/* Aile latérale, plus basse */}
      <mesh position={[1.35, -0.25, 0.1]} castShadow receiveShadow>
        <boxGeometry args={[0.9, 0.5, 1.1]} />
        <meshStandardMaterial color="#e9e1d1" roughness={0.9} />
      </mesh>
      {/* Toit pyramidal (cône à 4 côtés) */}
      <mesh position={[0, 0.75, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[1.35, 0.65, 4]} />
        <meshStandardMaterial color="#2f5d46" roughness={0.6} />
      </mesh>
      {/* Baie vitrée */}
      <mesh position={[0, 0.05, 0.71]}>
        <planeGeometry args={[0.6, 0.5]} />
        <meshStandardMaterial color="#8ebba1" roughness={0.15} metalness={0.1} emissive="#3c7256" emissiveIntensity={0.12} />
      </mesh>
      {/* Terrasse / socle */}
      <mesh position={[0, -0.55, 0.4]} receiveShadow>
        <boxGeometry args={[2.6, 0.08, 1.1]} />
        <meshStandardMaterial color="#b08a4e" roughness={0.8} />
      </mesh>
    </group>
  );
}

/**
 * Scène 3D très légère : une maison stylisée à géométrie minimale
 * (quelques box/cone), sans texture lourde ni post-processing, pour
 * rester à 60 FPS sur un ordinateur récent. Montée uniquement côté client
 * via next/dynamic (voir HeroScene.tsx), jamais pendant le rendu serveur.
 */
export function HouseScene() {
  return (
    <Canvas
      dpr={[1, 1.6]}
      camera={{ position: [3.2, 2, 3.6], fov: 38 }}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      style={{ width: "100%", height: "100%" }}
    >
      <ambientLight intensity={0.65} />
      <directionalLight position={[4, 5, 2]} intensity={1.1} castShadow={false} color="#fbf9f4" />
      <directionalLight position={[-3, 2, -2]} intensity={0.35} color="#5b9678" />
      <House />
    </Canvas>
  );
}
