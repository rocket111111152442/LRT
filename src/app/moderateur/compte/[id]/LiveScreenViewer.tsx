"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Eye, Loader2, MonitorOff } from "lucide-react";

type ClientSignal = {
  id: string;
  kind: "OFFER" | "ICE" | "END";
  payload: string;
};

type ViewerStatus = "idle" | "waiting" | "connected" | "error";

const PEER_CONFIGURATION: RTCConfiguration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export function LiveScreenViewer({
  accountId,
  controlAccepted,
}: {
  accountId: string;
  controlAccepted: boolean;
}) {
  const [status, setStatus] = useState<ViewerStatus>("idle");
  const [error, setError] = useState("");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const pollRef = useRef<number | null>(null);
  const seenSignalsRef = useRef(new Set<string>());
  const queuedCandidatesRef = useRef<RTCIceCandidateInit[]>([]);

  const endpoint = `/api/moderateur/compte/${encodeURIComponent(accountId)}/control-session`;

  const sendSignal = useCallback(
    async (kind: "ANSWER" | "ICE" | "END", payload = "{}") => {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, payload }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "Signal video refuse.");
      }
    },
    [endpoint],
  );

  const closeViewer = useCallback(() => {
    if (pollRef.current !== null) {
      window.clearInterval(pollRef.current);
      pollRef.current = null;
    }

    peerRef.current?.close();
    peerRef.current = null;
    queuedCandidatesRef.current = [];
    seenSignalsRef.current.clear();

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const stopViewer = useCallback(
    async (notifyClient = true) => {
      closeViewer();
      setStatus("idle");
      setError("");

      if (notifyClient) {
        await sendSignal("END").catch(() => null);
      }
    },
    [closeViewer, sendSignal],
  );

  const readClientSignals = useCallback(async () => {
    const peer = peerRef.current;

    if (!peer) {
      return;
    }

    const response = await fetch(endpoint, { cache: "no-store" });

    if (response.status === 401) {
      window.location.href = "/moderateur/login";
      return;
    }

    if (!response.ok) {
      return;
    }

    const data = await response.json();

    if (!data.active) {
      await stopViewer(false);
      return;
    }

    for (const signal of (data.signals ?? []) as ClientSignal[]) {
      if (seenSignalsRef.current.has(signal.id)) {
        continue;
      }

      seenSignalsRef.current.add(signal.id);

      try {
        if (signal.kind === "OFFER" && !peer.remoteDescription) {
          const offer = JSON.parse(signal.payload) as RTCSessionDescriptionInit;
          await peer.setRemoteDescription(offer);

          for (const candidate of queuedCandidatesRef.current) {
            await peer.addIceCandidate(candidate);
          }
          queuedCandidatesRef.current = [];

          const answer = await peer.createAnswer();
          await peer.setLocalDescription(answer);
          await sendSignal("ANSWER", JSON.stringify(answer));
        } else if (signal.kind === "ICE") {
          const candidate = JSON.parse(signal.payload) as RTCIceCandidateInit;

          if (peer.remoteDescription) {
            await peer.addIceCandidate(candidate);
          } else {
            queuedCandidatesRef.current.push(candidate);
          }
        } else if (signal.kind === "END") {
          await stopViewer(false);
        }
      } catch {
        setStatus("error");
        setError("Le flux video n a pas pu etre negocie.");
      }
    }
  }, [endpoint, sendSignal, stopViewer]);

  const startViewer = useCallback(async () => {
    if (!controlAccepted) {
      return;
    }

    closeViewer();
    setStatus("waiting");
    setError("");

    const peer = new RTCPeerConnection(PEER_CONFIGURATION);
    peerRef.current = peer;

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        void sendSignal(
          "ICE",
          JSON.stringify(event.candidate.toJSON()),
        ).catch(() => {
          setStatus("error");
          setError("Un signal video n a pas pu etre transmis.");
        });
      }
    };
    peer.ontrack = (event) => {
      if (videoRef.current) {
        videoRef.current.srcObject = event.streams[0] ?? null;
        void videoRef.current.play().catch(() => null);
      }
      setStatus("connected");
    };
    peer.onconnectionstatechange = () => {
      if (peer.connectionState === "connected") {
        setStatus("connected");
      } else if (
        ["failed", "disconnected", "closed"].includes(peer.connectionState)
      ) {
        setStatus("error");
        setError("Le partage d ecran a ete interrompu.");
      }
    };

    await readClientSignals();
    pollRef.current = window.setInterval(
      () => void readClientSignals(),
      1_000,
    );
  }, [closeViewer, controlAccepted, readClientSignals, sendSignal]);

  useEffect(() => {
    return () => closeViewer();
  }, [closeViewer]);

  useEffect(() => {
    if (!controlAccepted && status !== "idle") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void stopViewer(false);
    }
  }, [controlAccepted, status, stopViewer]);

  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-sky-400/20 bg-slate-950">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
        <div>
          <p className="text-sm font-bold text-white">Ecran du commerçant</p>
          <p className="mt-0.5 text-xs text-slate-400">
            Flux direct volontaire, non enregistre. Les mots de passe ne sont
            jamais collectes comme frappes.
          </p>
        </div>
        {status === "idle" || status === "error" ? (
          <button
            type="button"
            onClick={() => void startViewer()}
            disabled={!controlAccepted}
            className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-3 py-2 text-xs font-bold text-white hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Eye className="h-4 w-4" aria-hidden="true" />
            Voir en direct
          </button>
        ) : (
          <button
            type="button"
            onClick={() => void stopViewer(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-red-700 px-3 py-2 text-xs font-bold text-white hover:bg-red-600"
          >
            <MonitorOff className="h-4 w-4" aria-hidden="true" />
            Arreter
          </button>
        )}
      </div>

      <div className="relative aspect-video bg-black">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className={`h-full w-full object-contain ${
            status === "connected" ? "block" : "hidden"
          }`}
        />
        {status !== "connected" ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
            {status === "waiting" ? (
              <>
                <Loader2
                  className="h-8 w-8 animate-spin text-sky-400"
                  aria-hidden="true"
                />
                <p className="text-sm font-semibold text-slate-300">
                  En attente du partage d&apos;ecran du commerçant...
                </p>
              </>
            ) : (
              <>
                <Eye className="h-8 w-8 text-slate-600" aria-hidden="true" />
                <p className="max-w-md text-sm text-slate-400">
                  {error ||
                    "Le commerçant doit accepter puis choisir l onglet ou l ecran qu il souhaite partager."}
                </p>
              </>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
