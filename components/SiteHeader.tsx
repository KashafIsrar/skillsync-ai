"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Menu, X } from "lucide-react";

export default function SiteHeader({ onHome, onLaunch, showFeatures, showLaunch }: { onHome: () => void; onLaunch: () => void; showFeatures: boolean; showLaunch: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isLanding = showFeatures;
  const closeMenu = () => setMenuOpen(false);
  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") closeMenu(); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);
  return <header className={`relative z-40 border-b ${isLanding ? "border-[#d3ccc5] bg-[#f3f0ec] text-[#191817]" : "border-white/10 bg-navy text-paper"}`}>
    <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 sm:px-8 sm:py-4 lg:px-12">
      <Link href="/" onClick={onHome} aria-label="SkillSync AI home" className={`inline-flex items-center font-serif text-2xl tracking-tight ${isLanding ? "text-[#211e1b]" : "text-paper"}`}>SkillSync <span className={`ml-1 ${isLanding ? "text-[#82766d]" : "text-decanting"}`}>AI</span></Link>
      <nav aria-label="Main navigation" className="hidden items-center gap-2 sm:flex">
        {showFeatures && <>
          <button onClick={onLaunch} className="rounded-full px-4 py-2 text-sm text-[#514a46] hover:bg-black/5">Platform</button>
          <a href="#features" className="inline-flex items-center rounded-full px-4 py-2 text-sm text-[#514a46] hover:bg-black/5">Features</a>
          <a href="#how-it-works" className="inline-flex items-center rounded-full px-4 py-2 text-sm text-[#514a46] hover:bg-black/5">How it works</a>
        </>}
        {!showFeatures && <button onClick={onHome} className="rounded-full px-4 py-2 text-sm text-mist hover:bg-white/10 hover:text-white">Home</button>}
        {showLaunch && <button onClick={onLaunch} className={`ml-5 inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold ${isLanding ? "bg-[#171615] text-white hover:bg-[#403a36]" : "bg-decanting text-navy hover:bg-mist"}`}>Get started <ArrowRight size={16} /></button>}
      </nav>
      <button type="button" aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen} aria-controls="site-mobile-navigation" onClick={() => setMenuOpen(open => !open)} className={`grid w-11 place-items-center rounded-full border sm:hidden ${isLanding ? "border-[#b8afa7] text-[#302a26]" : "border-mist/30"}`}>
        {menuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
      <AnimatePresence>
        {menuOpen && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`fixed inset-x-0 bottom-0 top-[68px] z-[60] sm:hidden ${isLanding ? "bg-black/30" : "bg-navy/55"}`}>
          <button aria-label="Close navigation menu" onClick={closeMenu} className="menu-backdrop absolute inset-0 h-full w-full bg-transparent" />
          <motion.nav id="site-mobile-navigation" aria-label="Mobile navigation" initial={{ x: 28, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 28, opacity: 0 }} transition={{ type: "spring", stiffness: 320, damping: 30 }} className={`relative ml-auto h-full w-[min(20rem,calc(100vw-1rem))] border-l p-4 shadow-card ${isLanding ? "border-[#d3ccc5] bg-[#f3f0ec] text-[#211e1b]" : "border-white/10 bg-steel text-paper"}`}>
            {showFeatures && <>
              <button onClick={() => { closeMenu(); onLaunch(); }} className="w-full rounded-xl px-4 py-3 text-left text-sm hover:bg-black/5">Platform</button>
              <a href="#features" onClick={closeMenu} className="flex items-center rounded-xl px-4 py-3 text-sm hover:bg-black/5">Features</a>
              <a href="#how-it-works" onClick={closeMenu} className="flex items-center rounded-xl px-4 py-3 text-sm hover:bg-black/5">How it works</a>
            </>}
            {!showFeatures && <button onClick={() => { closeMenu(); onHome(); }} className="w-full rounded-xl px-4 py-3 text-left text-sm hover:bg-white/10">Home</button>}
            {showLaunch && <button onClick={() => { closeMenu(); onLaunch(); }} className={`mt-2 w-full rounded-xl px-4 py-3 text-left text-sm font-medium ${isLanding ? "bg-[#171615] text-white" : "bg-decanting text-navy"}`}>Get started <ArrowRight className="ml-2 inline" size={16} /></button>}
          </motion.nav>
        </motion.div>}
      </AnimatePresence>
    </div>
  </header>;
}
