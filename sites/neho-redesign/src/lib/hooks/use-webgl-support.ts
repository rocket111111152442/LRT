"use client";

import { useEffect, useState } from "react";

function detectWebgl(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl2") || canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

/**
 * Détecte : support WebGL, préférence de réduction des animations, et
 * viewport mobile — les trois conditions qui décident si la scène 3D du
 * hero doit être montée ou remplacée par une illustration statique.
 */
export function useCanRender3D() {
  const [state, setState] = useState({ ready: false, canRender: false });

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isSmallViewport = window.innerWidth < 640;
    const webgl = detectWebgl();
    // Détection de capacités navigateur (WebGL, viewport, préférence
    // système) : indisponible avant le montage côté client.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ ready: true, canRender: webgl && !reducedMotion && !isSmallViewport });
  }, []);

  return state;
}
