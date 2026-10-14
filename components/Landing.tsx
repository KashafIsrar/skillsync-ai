"use client";
import { motion } from "framer-motion";
import { ArrowRight, Target, Sparkles, Map, ShieldCheck } from "lucide-react";
const features = [
  { icon: Target, t: "Semantic fit score", d: "A cosine-similarity score between your resume and the job description." },
  { icon: ShieldCheck, t: "Skill gap check", d: "Matched strengths and missing requirements, ranked by how often the JD asks for them." },
  { icon: Sparkles, t: "STAR bullet rewrites", d: "Each bullet reframed as Situation, Action, Result, with the reasoning shown." },
  { icon: Map, t: "Weekly roadmap", d: "Concrete steps to close each gap before you apply." },
];
export default function Landing({ onLaunch }: { onLaunch: () => void }) {
  return (
    <div className="min-h-screen bg-navy text-paper">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <span className="font-serif text-2xl">SkillSync <span className="text-terra">AI</span></span>
        <button onClick={onLaunch} className="rounded-full border border-paper/30 px-5 py-2 text-sm hover:bg-paper/10">Launch app</button>
      </header>
      <section className="mx-auto grid max-w-6xl gap-12 px-6 pb-20 pt-16 md:grid-cols-[1.3fr_1fr] md:items-center">
        <div>
          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="font-serif text-5xl leading-[1.08] md:text-7xl">
            Your resume, rewritten for the job you actually want.
          </motion.h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-mist">Paste a resume and a job description. See your fit score, the skills you are missing, and bullet points rewritten in STAR format. Nothing leaves your browser.</p>
          <button onClick={onLaunch} className="mt-9 inline-flex items-center gap-2 rounded-full bg-terra px-7 py-3.5 font-medium text-white shadow-card transition hover:brightness-110">
            Launch app <ArrowRight size={18} />
          </button>
        </div>
        <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 0.7 }} className="glass p-6 text-ink">
          <p className="text-sm text-steel">Sample result</p>
          <p className="font-serif text-6xl text-navy">84.5%</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {["React", "Node.js", "Agile"].map(s => <span key={s} className="pill bg-steel/15 text-steel">{s}</span>)}
            {["TypeScript", "GraphQL"].map(s => <span key={s} className="pill bg-terra/15 text-terra">{s}</span>)}
          </div>
        </motion.div>
      </section>
      <section className="mx-auto grid max-w-6xl gap-4 px-6 pb-24 sm:grid-cols-2 lg:grid-cols-4">
        {features.map(({ icon: Icon, t, d }, i) => (
          <motion.div key={t} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="rounded-2xl border border-paper/10 bg-white/5 p-5">
            <Icon className="text-terra" size={22} /><h3 className="mt-3 font-serif text-xl">{t}</h3><p className="mt-1 text-sm text-mist">{d}</p>
          </motion.div>
        ))}
      </section>
    </div>
  );
}
