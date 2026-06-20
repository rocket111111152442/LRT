"use client";

import { SignaturePad } from "@/components/SignaturePad";

type RepairIntakeExtrasProps = {
  photos: string[];
  signature: string;
  photoError?: string;
  signatureError?: string;
  showPhotos?: boolean;
  onPhotosChange: (photos: string[]) => void;
  onSignatureChange: (signature: string) => void;
};

async function readFiles(files: FileList | null) {
  if (!files) {
    return [];
  }

  const selectedFiles = Array.from(files).slice(0, 3);

  return Promise.all(
    selectedFiles.map(
      (file) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = reject;
          reader.readAsDataURL(file);
        }),
    ),
  );
}

export function RepairIntakeExtras({
  photos,
  signature,
  photoError,
  signatureError,
  showPhotos = true,
  onPhotosChange,
  onSignatureChange,
}: RepairIntakeExtrasProps) {
  async function handlePhotoChange(files: FileList | null) {
    onPhotosChange(await readFiles(files));
  }

  return (
    <fieldset className="grid gap-4">
      <legend className="mb-3 text-base font-semibold text-slate-950">
        Etat au depot
      </legend>

      {showPhotos ? (
        <div className="grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-4">
          <label className="grid gap-2 text-sm font-medium text-slate-800">
            Photos de l&apos;appareil
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(event) => void handlePhotoChange(event.target.files)}
              className="text-sm font-normal"
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-3">
            {photos.map((photo, index) => (
              <img
                key={`${photo.slice(0, 24)}-${index}`}
                src={photo}
                alt={`Photo depot ${index + 1}`}
                className="aspect-[4/3] w-full rounded-md border border-slate-200 bg-white object-cover"
              />
            ))}
          </div>
          {photoError ? <p className="text-sm text-red-700">{photoError}</p> : null}
        </div>
      ) : null}

      <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
        <SignaturePad
          title="Signature client au depot"
          value={signature}
          onChange={onSignatureChange}
        />
        {signatureError ? (
          <p className="mt-2 text-sm text-red-700">{signatureError}</p>
        ) : null}
      </div>
    </fieldset>
  );
}
