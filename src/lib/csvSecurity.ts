export function escapeCsvCell(value: unknown) {
  let text = String(value ?? "");

  // Excel et certains tableurs évaluent ces préfixes comme des formules.
  if (/^\s*[=+\-@]/.test(text)) {
    text = `'${text}`;
  }

  return `"${text.replace(/"/g, '""')}"`;
}
