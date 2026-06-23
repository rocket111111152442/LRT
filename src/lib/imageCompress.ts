// Compression d'image côté navigateur (canvas).
//
// Objectif : réduire chaque photo bien en dessous de la limite Firestore
// (1 Mo / document) tout en gardant une qualité correcte pour un constat de
// dépôt. On redimensionne sur la plus grande dimension et on ré-encode en JPEG.

const MAX_DIMENSION = 1280;
const QUALITY = 0.7;

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

/**
 * Compresse une image en data URL JPEG. En cas d'échec (format non géré,
 * navigateur sans canvas...), on retombe sur le fichier original.
 */
export async function compressImage(file: File): Promise<string> {
  try {
    if (!file.type.startsWith("image/")) {
      return fileToDataUrl(file);
    }

    const original = await fileToDataUrl(file);
    const image = await loadImage(original);

    const scale = Math.min(
      1,
      MAX_DIMENSION / Math.max(image.width, image.height),
    );
    const width = Math.round(image.width * scale);
    const height = Math.round(image.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");

    if (!context) {
      return original;
    }

    context.drawImage(image, 0, 0, width, height);
    const compressed = canvas.toDataURL("image/jpeg", QUALITY);

    // On garde le plus léger des deux (certains petits PNG compressent mal).
    return compressed.length < original.length ? compressed : original;
  } catch {
    try {
      return await fileToDataUrl(file);
    } catch {
      return "";
    }
  }
}

export async function compressImages(
  files: FileList | File[] | null,
  max = 3,
): Promise<string[]> {
  if (!files) {
    return [];
  }

  const list = Array.from(files).slice(0, max);
  const results = await Promise.all(list.map((file) => compressImage(file)));
  return results.filter((value) => value.length > 0);
}
