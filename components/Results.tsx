"use client";
import { useEffect, useState } from "react";
import { animate, AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, ChevronDown, RotateCcw } from "lucide-react";
import type { Analysis } from "@/lib/engine";

function Ring({ value }: { value: number }) {
  const [n, setN] = useState(0); const r = 70, c = 2 * Math.PI * r;
  useEffect(() => { const a = animate(0, value, { duration: 1.6, ease: "easeOut", onUpdate: v => setN(v) }); return () => a.stop(); }, [value]);
  return (
    <div className="relative h-44 w-44" role="img" aria-label={`Semantic fit score ${value} percent`}>
      <svg viewBox="0 0 160 160" className="-rotate-90"><circle cx="80" cy="80" r={r} fill="none" stroke="#D8DDDF" strokeWidth="12" />
        <motion.circle cx="80" cy="80" r={r} fill="none" stroke="#A66C46" strokeWidth="12" strokeLinecap="round" strokeDasharray={c} initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: c * (1 - value / 100) }} transition={{ duration: 1.6, ease: "easeOut" }} /></svg>
      <div className="absolute inset-0 grid place-items-center font-serif text-4xl text-navy">{n.toFixed(1)}%</div>
    </div>
  );
}
function Bullet({ b }: { b: Analysis["bullets"][number] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="glass overflow-hidden">
      <button aria-expanded={open} onClick={() => setOpen(!open)} className="flex w-full items-center justify-between gap-4 p-4 text-left text-sm">
        <span className="line-clamp-2">{b.original}</span><ChevronDown size={18} className={`shrink-0 transition ${open ? "rotate-180" : ""}`} /></button>
      <AnimatePresence initial={false}>{open && (
        <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
          <div className="space-y-3 border-t border-steel/20 p-4 text-sm">
            <p><span className="pill bg-mist text-ink">Original</span><br />{b.original}</p>
            <p><span className="pill bg-terra text-white">STAR rewrite</span><br />{b.rewritten}</p>
            <p className="text-steel"><b>Why:</b> {b.reason}</p>
          </div></motion.div>)}</AnimatePresence>
    </div>
  );
}
export default function Results({ data, onReset }: { data: Analysis; onReset: () => void }) {
  const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } }, item = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } };
  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="mx-auto max-w-6xl space-y-8 px-6 py-10">
      <motion.div variants={item} className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-4xl text-navy">Your results</h1>
        <button onClick={onReset} className="inline-flex items-center gap-2 rounded-full bg-navy px-5 py-2 text-sm text-white"><RotateCcw size={15} />Analyze another</button>
      </motion.div>
      <motion.section variants={item} className="glass flex flex-wrap items-center gap-8 p-6">
        <Ring value={data.score} />
        <div className="max-w-md"><h2 className="font-serif text-2xl text-navy">Semantic fit score</h2>
          <p className="mt-2 text-sm leading-relaxed">Cosine similarity of {data.cosine} between your resume and the job text, blended with weighted skill coverage. {data.matched.length} of {data.matched.length + data.missing.length} requested skills found in your resume.</p></div>
      </motion.section>
      <motion.section variants={item} className="grid gap-6 md:grid-cols-2">
        <div className="glass p-5"><h2 className="mb-3 flex items-center gap-2 font-serif text-xl text-navy"><CheckCircle2 size={20} className="text-steel" />Matched strengths</h2>
          <div className="flex flex-wrap gap-2">{data.matched.map(s => <span key={s.skill} className="pill bg-steel/15 text-steel">{s.skill}</span>)}{!data.matched.length && <p className="text-sm">No overlap found.</p>}</div></div>
        <div className="glass p-5"><h2 className="mb-3 flex items-center gap-2 font-serif text-xl text-navy"><AlertTriangle size={20} className="text-terra" />Missing gaps</h2>
          <div className="flex flex-wrap gap-2">{data.missing.map(s => <span key={s.skill} className={`pill ${s.severity === "critical" ? "bg-terra text-white" : "bg-terra/15 text-terra"}`}>{s.skill}{s.severity === "critical" && " · critical"}</span>)}{!data.missing.length && <p className="text-sm">No gaps found.</p>}</div></div>
      </motion.section>
      <motion.section variants={item} className="space-y-3"><h2 className="font-serif text-2xl text-navy">STAR bullet rewriter</h2>
        {data.bullets.length ? data.bullets.map(b => <Bullet key={b.original} b={b} />) : <p className="text-sm">No bullet points found. Start each resume bullet with a dash.</p>}</motion.section>
      <motion.section variants={item}><h2 className="mb-3 font-serif text-2xl text-navy">Roadmap</h2>
        <ol className="space-y-3">{data.roadmap.map(r => (
          <li key={r.title} className="glass flex gap-4 p-4"><span className="pill h-fit bg-navy text-white">{r.time}</span><div><p className="font-medium text-navy">{r.title}</p><p className="text-sm">{r.detail}</p></div></li>))}</ol>
      </motion.section>
    </motion.div>
  );
}
