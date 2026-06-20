export function normalizeTicketNumber(value: string) {
  const normalized = value
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  if (/^QOR\d{6}$/.test(normalized)) {
    return `QOR-${normalized.slice(3)}`;
  }

  if (/^LRT\d{6}$/.test(normalized)) {
    return `LRT-${normalized.slice(3)}`;
  }

  return normalized;
}
