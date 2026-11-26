import React, { useState } from 'react';
import { Menu, X, ArrowUpRight, Github } from 'lucide-react';
import { Lang } from '../lib/cytoDomain';
import { openShowcaseModel } from '../lib/modelShowcase';

const CYTO_GITHUB_ORG_URL = 'https://github.com/Cyto-System';

interface NavbarProps {
  lang: Lang;
}

export const Navbar: React.FC<NavbarProps> = React.memo(({ lang }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { href: '#architecture', zh: '模型家族', en: 'Family' },
    { href: '#model-family', zh: '模型详解', en: 'Models' },
    { href: '#model-coscientist', zh: '面向长程自主生物学研究的 AI 科学家', en: 'CoScientist', showcaseId: 'coscientist' as const },
  ];

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    showcaseId?: 'coscientist'
  ) => {
    setMobileOpen(false);
    if (showcaseId) {
      e.preventDefault();
      openShowcaseModel(showcaseId);
    }
  };

  return (
    <header className="sticky top-0 z-40 h-14 bg-white/92 backdrop-blur-md border-b border-emerald-950/[0.08]">
      <div className="max-w-[1320px] mx-auto h-full px-5 sm:px-8 flex items-center justify-between gap-6">
        {/* Zone 1: Single Clean Brand Wordmark */}
        <a
          href="#home"
          className="inline-flex items-center gap-2.5 text-[17px] font-bold tracking-tight text-[#0C261B] hover:opacity-85 transition-opacity whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-600"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 100 100"
            fill="none"
            aria-hidden="true"
            className="shrink-0"
          >
            <path
              d="M69 29A31 31 0 1 0 69 71"
              stroke="#2f7d68"
              strokeWidth="16"
              strokeLinecap="round"
            />
            <circle cx="81" cy="50" r="14" fill="#2f7d68" />
          </svg>
          <span>Cyto</span>
        </a>

        {/* Zone 2: 5 Concise Single-Line Navigation Links */}
        <nav
          aria-label={lang === 'zh' ? '主导航' : 'Main navigation'}
          className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600"
        >
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={(e) => handleNavClick(e, item.showcaseId)}
              className="py-1 hover:text-emerald-700 border-b-2 border-transparent hover:border-emerald-600/80 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-600"
            >
              {lang === 'zh' ? item.zh : item.en}
            </a>
          ))}
        </nav>

        {/* Zone 3: 1 Primary Action + Mobile Menu Trigger */}
        <div className="flex items-center gap-2.5 shrink-0">
          <a
            href={CYTO_GITHUB_ORG_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white bg-[#0C261B] hover:bg-emerald-800 rounded-lg shadow-[0_1px_2px_rgba(6,78,59,0.2)] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-600"
          >
            <Github className="w-3.5 h-3.5 text-emerald-300" aria-hidden="true" />
            <span>GitHub</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-300" aria-hidden="true" />
          </a>

          <button
            type="button"
            aria-label={
              mobileOpen
                ? lang === 'zh'
                  ? '关闭导航菜单'
                  : 'Close navigation menu'
                : lang === 'zh'
                ? '打开导航菜单'
                : 'Open navigation menu'
            }
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden p-2 -mr-1 text-slate-700 hover:text-[#0C261B] hover:bg-emerald-950/[0.04] rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-emerald-600 cursor-pointer"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Drawer */}
      {mobileOpen && (
        <div className="md:hidden absolute inset-x-0 top-14 bg-white/98 backdrop-blur-md border-b border-emerald-950/10 px-5 py-3 shadow-[0_16px_36px_-18px_rgba(6,78,59,0.22)]">
          <div className="divide-y divide-emerald-950/[0.06]">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.showcaseId)}
                className="flex items-center justify-between py-2.5 text-sm font-medium text-slate-700 hover:text-emerald-700 transition-colors"
              >
                <span>{lang === 'zh' ? item.zh : item.en}</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
});
