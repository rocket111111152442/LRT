"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Check,
  Loader2,
  MonitorUp,
  ShieldCheck,
  ShieldQuestion,
  X,
} from "lucide-react";

type ControlRequestState = {
  requestId: string;
  reason: string | null;
};

type RemoteSignal = {
  id: string;
  kind: "ANSWER" | "ICE" | "END";
  payload: string;
};

type ShareStatus =
  | "idle"
  | "starting"
  | "waiting"
  | "connected"
  | "error";

const PEER_CONFIGURATION: RTCConfiguration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

async function postSignal(kind: "OFFER" | "ICE" | "END", payload = "{}") {
  const response = await fetch("/api/admin/control-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind, payload }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error ?? "Partage d ecran impossible.");
  }
}

export function ControlConsent() {
  const [pending, setPending] = useState<ControlRequestState | null>(null);
  const [accepted, setAccepted] = useState<ControlRequestState | null>(null);
  const [screenSharePending, setScreenSharePending] = useState(false);
  const [working, setWorking] = useState(false);
  const [decisionMessage, setDecisionMessage] = useState("");
  const [shareStatus, setShareStatus] = useState<ShareStatus>("idle");
  const [shareError, setShareError] = useState("");
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const signalPollRef = useRef<number | null>(null);
  const seenSignalsRef = useRef(new Set<string>());
  const queuedCandidatesRef = useRef<RTCIceCandidateInit[]>([]);

  const closePeer = useCallback((stopTracks: boolean) => {
    if (signalPollRef.current !== null) {
      window.clearInterval(signalPollRef.current);
      signalPollRef.current = null;
    }

    peerRef.current?.close();
    peerRef.current = null;
    queuedCandidatesRef.current = [];
    seenSignalsRef.current.clear();

    if (stopTracks) {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const stopSharing = useCallback(
    async (notifySupport = true) => {
      closePeer(true);
      setShareStatus("idle");
      setShareError("");

      if (notifySupport) {
        await postSignal("END").catch(() => null);
      }
    },
    [closePeer],
  );

  const readRemoteSignals = useCallback(async () => {
    const peer = peerRef.current;

    if (!peer) {
      return;
    }

    const response = await fetch("/api/admin/control-session", {
      cache: "no-store",
    });

    if (!response.ok) {
      return;
    }

    const data = await response.json();

    if (!data.active) {
      await stopSharing(false);
      setAccepted(null);
      return;
    }

    for (const signal of (data.signals ?? []) as RemoteSignal[]) {
      if (seenSignalsRef.current.has(signal.id)) {
        continue;
      }

      seenSignalsRef.current.add(signal.id);

      try {
        if (signal.kind === "ANSWER" && !peer.remoteDescription) {
          const answer = JSON.parse(signal.payload) as RTCSessionDescriptionInit;
          await peer.setRemoteDescription(answer);

          for (const candidate of queuedCandidatesRef.current) {
            await peer.addIceCandidate(candidate);
          }
          queuedCandidatesRef.current = [];
        } else if (signal.kind === "ICE") {
          const candidate = JSON.parse(signal.payload) as RTCIceCandidateInit;

          if (peer.remoteDescription) {
            await peer.addIceCandidate(candidate);
          } else {
            queuedCandidatesRef.current.push(candidate);
          }
        } else if (signal.kind === "END") {
          await stopSharing(false);
        }
      } catch {
        setShareError("La connexion video a ete interrompue.");
        setShareStatus("error");
      }
    }
  }, [stopSharing]);

  const startSharing = useCallback(async (
    preparedStream?: MediaStream,
    acceptedDuringAction = false,
  ) => {
    if ((!accepted && !acceptedDuringAction) || shareStatus === "starting") {
      return;
    }

    if (!navigator.mediaDevices?.getDisplayMedia) {
      setShareError("Ce navigateur ne permet pas le partage d ecran.");
      setShareStatus("error");
      return;
    }

    setShareStatus("starting");
    setShareError("");
    closePeer(true);

    try {
      const stream =
        preparedStream ??
        (await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false,
        }));
      const peer = new RTCPeerConnection(PEER_CONFIGURATION);

      streamRef.current = stream;
      peerRef.current = peer;

      stream.getTracks().forEach((track) => peer.addTrack(track, stream));
      stream.getVideoTracks()[0]?.addEventListener(
        "ended",
        () => void stopSharing(true),
        { once: true },
      );

      peer.onicecandidate = (event) => {
        if (event.candidate) {
          void postSignal("ICE", JSON.stringify(event.candidate.toJSON())).catch(
            () => setShareError("Un signal video n a pas pu etre envoye."),
          );
        }
      };
      peer.onconnectionstatechange = () => {
        if (peer.connectionState === "connected") {
          setShareStatus("connected");
        } else if (
          ["failed", "disconnected", "closed"].includes(peer.connectionState)
        ) {
          setShareStatus("error");
          setShareError("Le partage d ecran a ete interrompu.");
        }
      };

      const offer = await peer.createOffer();
      await postSignal("OFFER", JSON.stringify(offer));
      // L'offre est stockée avant le démarrage du trickle ICE. Cela évite
      // qu'un premier candidat soit effacé lors d'une reprise de session.
      await peer.setLocalDescription(offer);
      setShareStatus("waiting");

      await readRemoteSignals();
      signalPollRef.current = window.setInterval(
        () => void readRemoteSignals(),
        1_000,
      );
    } catch (error) {
      closePeer(true);
      setShareStatus("error");
      setShareError(
        error instanceof DOMException && error.name === "NotAllowedError"
          ? "Partage refuse. Vous gardez le controle de votre ecran."
          : "Le partage d ecran n a pas pu demarrer.",
      );
    }
  }, [
    accepted,
    closePeer,
    readRemoteSignals,
    shareStatus,
    stopSharing,
  ]);

  useEffect(() => {
    let active = true;

    async function pollRequest() {
      try {
        const response = await fetch("/api/admin/control-request", {
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        if (!active) {
          return;
        }

        if (data.pending) {
          setPending({
            requestId: data.requestId,
            reason: data.reason ?? null,
          });
          setAccepted(null);
          setScreenSharePending(false);
        } else {
          setPending(null);

          if (data.accepted) {
            setAccepted({
              requestId: data.requestId,
              reason: data.reason ?? null,
            });
            setScreenSharePending(Boolean(data.screenSharePending));
          } else if (!streamRef.current) {
            setAccepted(null);
            setScreenSharePending(false);
          }
        }
      } catch {
        // Une coupure reseau ne doit jamais accepter une demande implicitement.
      }
    }

    void pollRequest();
    const pollId = window.setInterval(pollRequest, 2_000);

    return () => {
      active = false;
      window.clearInterval(pollId);
      closePeer(true);
    };
  }, [closePeer]);

  async function respond(decision: "accept" | "refuse") {
    if (!pending) {
      return;
    }

    setWorking(true);
    setDecisionMessage("");
    setShareError("");
    try {
      const response = await fetch("/api/admin/control-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: pending.requestId,
          decision,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "Reponse impossible.");
      }

      if (decision === "accept") {
        setAccepted(pending);
        setDecisionMessage(
          "Assistance autorisee. Vous pouvez interrompre la session a tout moment.",
        );
      } else {
        setDecisionMessage("Demande de prise en main refusee.");
      }

      setPending(null);
    } catch (error) {
      setDecisionMessage(
        error instanceof Error ? error.message : "Reponse impossible.",
      );
    } finally {
      setWorking(false);
    }
  }

  async function respondToScreenShare(decision: "accept" | "refuse") {
    if (!accepted || working) {
      return;
    }

    setWorking(true);
    setShareError("");
    let preparedStream: MediaStream | null = null;

    try {
      if (decision === "accept") {
        if (!navigator.mediaDevices?.getDisplayMedia) {
          throw new Error("Ce navigateur ne permet pas le partage d ecran.");
        }

        preparedStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false,
        });
      }

      const response = await fetch("/api/admin/control-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: accepted.requestId,
          decision,
          scope: "screen",
        }),
      });

      if (!response.ok) {
        preparedStream?.getTracks().forEach((track) => track.stop());
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "Reponse impossible.");
      }

      setScreenSharePending(false);

      if (decision === "accept" && preparedStream) {
        setDecisionMessage(
          "Affichage en direct autorise. Vous pouvez l arreter a tout moment.",
        );
        await startSharing(preparedStream, true);
      } else {
        setDecisionMessage("Demande d affichage en direct refusee.");
      }
    } catch (error) {
      preparedStream?.getTracks().forEach((track) => track.stop());
      setShareError(
        error instanceof DOMException && error.name === "NotAllowedError"
          ? "Le partage a ete annule dans le navigateur."
          : error instanceof Error
            ? error.message
            : "Reponse impossible.",
      );
    } finally {
      setWorking(false);
    }
  }

  if (pending) {
    return (
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-md"
        role="dialog"
        aria-modal="true"
        aria-labelledby="control-consent-title"
      >
        <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-2xl">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-sky-100">
            <ShieldQuestion
              className="h-7 w-7 text-sky-600"
              aria-hidden="true"
            />
          </div>
          <h2
            id="control-consent-title"
            className="text-center text-2xl font-extrabold text-slate-900"
          >
            Demande de prise en main
          </h2>
          <p className="mt-2 text-center text-sm leading-6 text-slate-600">
            Le support Qoravo souhaite intervenir dans votre espace pour vous
            aider. Il ne pourra acceder a votre compte que si vous
            l&apos;autorisez.
          </p>
          {pending.reason ? (
            <p className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-center text-xs text-slate-600">
              Motif : {pending.reason}
            </p>
          ) : null}
          <p className="mt-3 text-center text-xs font-semibold text-slate-700">
            Choisissez obligatoirement Autoriser ou Ne pas autoriser.
          </p>
          {decisionMessage ? (
            <p className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-center text-sm font-semibold text-red-700">
              {decisionMessage}
            </p>
          ) : null}
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => respond("refuse")}
              disabled={working}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              <X className="h-4 w-4" aria-hidden="true" />
              Ne pas autoriser
            </button>
            <button
              type="button"
              onClick={() => respond("accept")}
              disabled={working}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-sky-700 disabled:opacity-50"
            >
              {working ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Check className="h-4 w-4" aria-hidden="true" />
              )}
              Autoriser
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (accepted && screenSharePending) {
    return (
      <div
        className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-md"
        role="dialog"
        aria-modal="true"
        aria-labelledby="screen-consent-title"
      >
        <div className="w-full max-w-lg rounded-xl border border-sky-200 bg-white p-7 shadow-2xl">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-sky-100">
            <MonitorUp className="h-8 w-8 text-sky-700" aria-hidden="true" />
          </div>
          <h2
            id="screen-consent-title"
            className="text-center text-2xl font-extrabold text-slate-950"
          >
            Autoriser l&apos;affichage en direct ?
          </h2>
          <p className="mt-3 text-center text-sm leading-6 text-slate-600">
            Le support demande maintenant a voir votre ecran en direct. Si vous
            acceptez, votre navigateur vous laissera choisir exactement
            l&apos;ecran, la fenetre ou l&apos;onglet visible.
          </p>
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-center text-xs font-semibold leading-5 text-amber-900">
            Le partage n&apos;est pas enregistre. Vous pouvez l&apos;arreter a
            tout moment depuis Qoravo ou depuis votre navigateur.
          </div>
          {shareError ? (
            <p className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-center text-sm font-semibold text-red-700">
              {shareError}
            </p>
          ) : null}
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => void respondToScreenShare("refuse")}
              disabled={working}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-800 hover:bg-slate-50 disabled:opacity-50"
            >
              <X className="h-4 w-4" aria-hidden="true" />
              Ne pas autoriser
            </button>
            <button
              type="button"
              onClick={() => void respondToScreenShare("accept")}
              disabled={working}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-sky-700 disabled:opacity-50"
            >
              {working ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <MonitorUp className="h-4 w-4" aria-hidden="true" />
              )}
              Autoriser l&apos;ecran
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!accepted && !decisionMessage) {
    return null;
  }

  return (
    <aside className="no-print fixed bottom-4 right-4 z-[100] w-[min(420px,calc(100vw-2rem))] rounded-xl border border-sky-300 bg-white p-4 shadow-2xl">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-100">
          <ShieldCheck className="h-5 w-5 text-sky-700" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-slate-950">Assistance Qoravo autorisee</p>
          <p className="mt-1 text-xs leading-5 text-slate-600">
            {shareStatus === "connected"
              ? "Votre ecran est visible en direct par le support."
              : shareStatus === "waiting"
                ? "Ecran partage. Connexion du support en attente."
                : decisionMessage ||
                  "Le support peut intervenir dans votre compte."}
          </p>
          {shareError ? (
            <p className="mt-2 text-xs font-semibold text-red-700">
              {shareError}
            </p>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-2">
            {shareStatus === "waiting" || shareStatus === "connected" ? (
              <button
                type="button"
                onClick={() => void stopSharing(true)}
                className="rounded-lg bg-red-700 px-3 py-2 text-xs font-bold text-white hover:bg-red-800"
              >
                Arreter le partage
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </aside>
  );
}
