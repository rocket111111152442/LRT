import { prisma, safeQuery } from "@/lib/prisma";
import { markMessageHandledAction } from "@/app/actions/admin";

export default async function AdminMessagesPage() {
  const messages = await safeQuery(
    () =>
      prisma.contactMessage.findMany({
        orderBy: [{ handled: "asc" }, { createdAt: "desc" }],
        take: 200,
      }),
    [],
    "messages de contact",
  );

  return (
    <div className="space-y-10">
      <header>
        <p className="label mb-4 text-[color:var(--color-smoke)]">(Service client)</p>
        <h1 className="display-xl">Messages</h1>
      </header>

      {messages.length === 0 ? (
        <p className="hairline py-16 text-sm text-[color:var(--color-smoke)]">
          Aucun message reçu.
        </p>
      ) : (
        <div className="space-y-px">
          {messages.map((message) => (
            <article
              key={message.id}
              className={`border-t border-[color:var(--color-hairline)] py-6 last:border-b ${
                message.handled ? "opacity-50" : ""
              }`}
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">{message.subject}</p>
                  <p className="label-sm mt-1.5 text-[color:var(--color-smoke)]">
                    {message.name} — {message.email}
                  </p>
                </div>

                <span className="label-sm text-[color:var(--color-smoke)]">
                  {message.createdAt.toLocaleString("fr-FR")}
                </span>
              </div>

              <p className="max-w-[80ch] whitespace-pre-line text-sm leading-relaxed text-[color:var(--color-ink-soft)]">
                {message.message}
              </p>

              <div className="mt-5 flex items-center gap-5">
                <a
                  href={`mailto:${message.email}?subject=${encodeURIComponent(`Re: ${message.subject}`)}`}
                  className="btn btn-outline btn-sm"
                >
                  Répondre par e-mail
                </a>

                <form action={markMessageHandledAction}>
                  <input type="hidden" name="messageId" value={message.id} />
                  <button type="submit" className="label-sm link-sweep">
                    {message.handled ? "Rouvrir" : "Marquer comme traité"}
                  </button>
                </form>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
