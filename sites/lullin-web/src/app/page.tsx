import Experience from "@/components/Experience";

export default function Page() {
  return (
    <>
      <Experience />
      <noscript>
        <div style={{ position: "relative", zIndex: 50, padding: 24, maxWidth: 640 }}>
          <p>
            Cette expérience utilise JavaScript et WebGL. Retrouvez les réalisations et les services
            de Lullin Web sur www.lullin-web.com ou écrivez à contact@lullin-web.com.
          </p>
        </div>
      </noscript>
    </>
  );
}
