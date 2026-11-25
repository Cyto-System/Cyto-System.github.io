import { useEffect, useRef, useState } from 'react';
import { Lang } from './lib/cytoDomain';
import { shouldPauseHeroWebgl } from './lib/bioTaskScenarios';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ArchitectureSection } from './components/ArchitectureSection';
import { ModelShowcaseSection } from './components/ModelShowcaseSection';
import { EcosystemAndFooter } from './components/EcosystemAndFooter';

export default function App() {
  const [lang, setLang] = useState<Lang>('zh');
  const [heroOffscreen, setHeroOffscreen] = useState(false);
  const heroWrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = heroWrapRef.current;
    if (el && typeof IntersectionObserver !== 'undefined') {
      const observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (entry) {
            setHeroOffscreen(!entry.isIntersecting);
          }
        },
        { threshold: 0.02 }
      );
      observer.observe(el);
      return () => observer.disconnect();
    }

    const onScroll = () => {
      const h = heroWrapRef.current?.offsetHeight ?? window.innerHeight;
      setHeroOffscreen(shouldPauseHeroWebgl(window.scrollY || 0, h));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#0C261B]">
      <Navbar lang={lang} />

      <main className="flex-1">
        <div ref={heroWrapRef} data-testid="hero-flow-container" data-webgl-paused={heroOffscreen}>
          <HeroSection
            lang={lang}
            onChangeLang={setLang}
            pausedByScroll={heroOffscreen}
          />
        </div>

        <ArchitectureSection lang={lang} />

        <ModelShowcaseSection lang={lang} />

        <EcosystemAndFooter lang={lang} />
      </main>
    </div>
  );
}
