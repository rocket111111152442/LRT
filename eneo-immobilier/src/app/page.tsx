import Hero from "@/components/Hero";
import Intro from "@/components/Intro";
import Services from "@/components/Services";
import Properties from "@/components/Properties";
import ProjectShowcase from "@/components/ProjectShowcase";
import Team from "@/components/Team";
import Contact from "@/components/Contact";

export default function Home() {
  return (
    <main>
      <Hero />
      <Intro />
      <Services />
      <Properties />
      <ProjectShowcase />
      <Team />
      <Contact />
    </main>
  );
}
