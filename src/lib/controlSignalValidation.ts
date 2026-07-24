export type ControlSignalSender = "CLIENT" | "MODERATOR";
export type ControlSignalKind = "OFFER" | "ANSWER" | "ICE" | "END";

const MAX_SDP_LENGTH = 64_000;
const MAX_CANDIDATE_LENGTH = 8_000;

type SignalBody = {
  kind?: unknown;
  payload?: unknown;
};

function normalizedDescription(
  value: unknown,
  expectedType: "offer" | "answer",
) {
  if (
    typeof value !== "object" ||
    value === null ||
    !("type" in value) ||
    !("sdp" in value)
  ) {
    return null;
  }

  const description = value as { type?: unknown; sdp?: unknown };

  if (
    description.type !== expectedType ||
    typeof description.sdp !== "string" ||
    !description.sdp ||
    description.sdp.length > MAX_SDP_LENGTH
  ) {
    return null;
  }

  return JSON.stringify({
    type: expectedType,
    sdp: description.sdp,
  });
}

function normalizedCandidate(value: unknown) {
  if (
    typeof value !== "object" ||
    value === null ||
    !("candidate" in value)
  ) {
    return null;
  }

  const candidate = value as {
    candidate?: unknown;
    sdpMid?: unknown;
    sdpMLineIndex?: unknown;
    usernameFragment?: unknown;
  };

  if (
    typeof candidate.candidate !== "string" ||
    candidate.candidate.length > MAX_CANDIDATE_LENGTH ||
    (candidate.sdpMid !== null &&
      candidate.sdpMid !== undefined &&
      (typeof candidate.sdpMid !== "string" ||
        candidate.sdpMid.length > 128)) ||
    (candidate.sdpMLineIndex !== null &&
      candidate.sdpMLineIndex !== undefined &&
      (!Number.isInteger(candidate.sdpMLineIndex) ||
        Number(candidate.sdpMLineIndex) < 0 ||
        Number(candidate.sdpMLineIndex) > 128)) ||
    (candidate.usernameFragment !== null &&
      candidate.usernameFragment !== undefined &&
      (typeof candidate.usernameFragment !== "string" ||
        candidate.usernameFragment.length > 256))
  ) {
    return null;
  }

  return JSON.stringify({
    candidate: candidate.candidate,
    sdpMid:
      typeof candidate.sdpMid === "string" ? candidate.sdpMid : null,
    sdpMLineIndex:
      typeof candidate.sdpMLineIndex === "number"
        ? candidate.sdpMLineIndex
        : null,
    usernameFragment:
      typeof candidate.usernameFragment === "string"
        ? candidate.usernameFragment
        : null,
  });
}

export function validateControlSignal(
  body: SignalBody,
  sender: ControlSignalSender,
):
  | { ok: true; kind: ControlSignalKind; payload: string }
  | { ok: false; error: string } {
  const kind =
    typeof body.kind === "string"
      ? (body.kind.toUpperCase() as ControlSignalKind)
      : null;
  const allowedKinds =
    sender === "CLIENT"
      ? new Set<ControlSignalKind>(["OFFER", "ICE", "END"])
      : new Set<ControlSignalKind>(["ANSWER", "ICE", "END"]);

  if (!kind || !allowedKinds.has(kind)) {
    return { ok: false, error: "Type de signal invalide." };
  }

  if (kind === "END") {
    return { ok: true, kind, payload: "{}" };
  }

  if (typeof body.payload !== "string") {
    return { ok: false, error: "Signal manquant." };
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(body.payload);
  } catch {
    return { ok: false, error: "Signal invalide." };
  }

  const payload =
    kind === "OFFER"
      ? normalizedDescription(parsed, "offer")
      : kind === "ANSWER"
        ? normalizedDescription(parsed, "answer")
        : normalizedCandidate(parsed);

  if (!payload) {
    return { ok: false, error: "Signal invalide ou trop volumineux." };
  }

  return { ok: true, kind, payload };
}
