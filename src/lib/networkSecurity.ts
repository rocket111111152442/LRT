import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

const ALLOWED_SMTP_PORTS = new Set([465, 587, 2525]);

function isPrivateIpv4(address: string) {
  const parts = address.split(".").map(Number);

  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part))) {
    return true;
  }

  const [a, b, c] = parts;

  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 0) ||
    (a === 192 && b === 168) ||
    (a === 192 && b === 0 && c === 2) ||
    (a === 198 && (b === 18 || b === 19)) ||
    (a === 198 && b === 51 && c === 100) ||
    (a === 203 && b === 0 && c === 113) ||
    a >= 224
  );
}

function isPrivateIpv6(address: string) {
  const normalized = address.toLowerCase().split("%")[0];

  if (normalized.startsWith("::ffff:")) {
    const mappedIpv4 = normalized.slice("::ffff:".length);
    return isIP(mappedIpv4) !== 4 || isPrivateIpv4(mappedIpv4);
  }

  return (
    normalized === "::" ||
    normalized === "::1" ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    /^fe[89ab]/.test(normalized) ||
    normalized.startsWith("ff") ||
    normalized.startsWith("2001:db8:")
  );
}

export function isPrivateOrReservedIp(address: string) {
  const version = isIP(address);

  if (version === 4) {
    return isPrivateIpv4(address);
  }

  if (version === 6) {
    return isPrivateIpv6(address);
  }

  return true;
}

export function isAllowedSmtpPort(port: number) {
  return Number.isInteger(port) && ALLOWED_SMTP_PORTS.has(port);
}

export async function resolvePublicSmtpHost(host: string, port: number) {
  const normalizedHost = host.trim().toLowerCase().replace(/\.$/, "");

  if (
    !normalizedHost ||
    normalizedHost.length > 253 ||
    normalizedHost === "localhost" ||
    normalizedHost.endsWith(".localhost") ||
    normalizedHost.endsWith(".local") ||
    normalizedHost.endsWith(".internal") ||
    !isAllowedSmtpPort(port)
  ) {
    return null;
  }

  if (isIP(normalizedHost)) {
    return isPrivateOrReservedIp(normalizedHost)
      ? null
      : { address: normalizedHost, servername: undefined };
  }

  if (!/^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(normalizedHost)) {
    return null;
  }

  try {
    const addresses = await lookup(normalizedHost, { all: true, verbatim: true });

    if (
      addresses.length === 0 ||
      addresses.some((entry) => isPrivateOrReservedIp(entry.address))
    ) {
      return null;
    }

    return {
      address: addresses[0].address,
      servername: normalizedHost,
    };
  } catch {
    return null;
  }
}
