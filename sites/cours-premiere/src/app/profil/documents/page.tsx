import { requireCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UploadForm } from "./UploadForm";
import { deleteDocumentAction } from "./actions";

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export default async function DocumentsPage() {
  const user = await requireCurrentUser();

  const [subjects, documents] = await Promise.all([
    prisma.subject.findMany({ where: { userId: user.id }, orderBy: { name: "asc" } }),
    prisma.document.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        filename: true,
        mimeType: true,
        size: true,
        createdAt: true,
        subject: { select: { name: true } },
      },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-brand-ink">Documents</h1>
        <p className="text-slate-600 mt-1">PDF, photos de cours, exercices — accessibles partout.</p>
      </div>

      <UploadForm subjects={subjects} />

      {documents.length === 0 ? (
        <p className="text-slate-500 text-sm">Aucun document pour l&apos;instant.</p>
      ) : (
        <ul className="divide-y divide-brand-border rounded-xl border border-brand-border bg-brand-card">
          {documents.map((doc) => (
            <li key={doc.id} className="px-4 py-3 flex items-center justify-between gap-3">
              <div>
                <a
                  href={`/profil/documents/${doc.id}/telecharger`}
                  className="font-medium text-brand-primary hover:underline"
                >
                  {doc.filename}
                </a>
                <p className="text-sm text-slate-500">
                  {doc.subject?.name ?? "Général"} ·{" "}
                  {formatSize(doc.size)} ·{" "}
                  {new Intl.DateTimeFormat("fr-FR").format(doc.createdAt)}
                </p>
              </div>
              <form action={deleteDocumentAction}>
                <input type="hidden" name="documentId" value={doc.id} />
                <button type="submit" className="text-sm text-red-600 hover:underline">
                  Supprimer
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
