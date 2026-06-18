"use client";

import { PointerEvent, useRef, useState } from "react";

type SignaturePadProps = {
  title: string;
  value: string;
  onChange: (value: string) => void;
};

export function SignaturePad({ title, value, onChange }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  function getPoint(event: PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;

    if (!canvas) {
      return null;
    }

    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    };
  }

  function startDrawing(event: PointerEvent<HTMLCanvasElement>) {
    const point = getPoint(event);
    const context = canvasRef.current?.getContext("2d");

    if (!point || !context) {
      return;
    }

    context.strokeStyle = "#0f172a";
    context.lineWidth = 3;
    context.lineCap = "round";
    context.beginPath();
    context.moveTo(point.x, point.y);
    setIsDrawing(true);
  }

  function draw(event: PointerEvent<HTMLCanvasElement>) {
    if (!isDrawing) {
      return;
    }

    const point = getPoint(event);
    const context = canvasRef.current?.getContext("2d");

    if (!point || !context) {
      return;
    }

    context.lineTo(point.x, point.y);
    context.stroke();
  }

  function stopDrawing() {
    if (!isDrawing) {
      return;
    }

    setIsDrawing(false);
    const canvas = canvasRef.current;

    if (canvas) {
      onChange(canvas.toDataURL("image/png"));
    }
  }

  function clearSignature() {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (canvas && context) {
      context.clearRect(0, 0, canvas.width, canvas.height);
    }

    onChange("");
  }

  return (
    <div className="grid gap-2">
      <p className="text-sm font-medium text-slate-800">{title}</p>
      {value ? (
        <img
          src={value}
          alt={title}
          className="h-28 w-full rounded-md border border-slate-200 bg-white object-contain"
        />
      ) : null}
      <canvas
        ref={canvasRef}
        width={520}
        height={180}
        onPointerDown={startDrawing}
        onPointerMove={draw}
        onPointerUp={stopDrawing}
        onPointerLeave={stopDrawing}
        className="h-32 w-full touch-none rounded-md border border-slate-300 bg-white"
      />
      <button
        type="button"
        onClick={clearSignature}
        className="w-fit text-sm font-semibold text-slate-950 underline-offset-4 hover:underline"
      >
        Effacer
      </button>
    </div>
  );
}
