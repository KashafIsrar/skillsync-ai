"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
const STEPS = ["Parsing PDF text and structuring document vectors…", "Computing high-dimensional cosine similarity score…", "Running structured schema validation for skill gaps…", "Generating STAR-formatted tailored bullet points…"];
export default function Processing({ onDone }: { onDone: () => void }) {
  const [i, setI] = useState(0);
  useEffect(() => { const t = setTimeout(() => (i < STEPS.length ? setI(i + 1) : onDone()), i < STEPS.length ? 1100 : 500); return () => clearTimeout(t); }, [i, onDone]);
  return (
    <div className="grid min-h-screen place-items-center bg-navy px-6">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-white/5 p-8 text-paper backdrop-blur-md">
        <h1 className="font-serif text-3xl">Analyzing your fit</h1>
        <ul className="mt-6 space-y-4" aria-live="polite">
          {STEPS.map((s, n) => (
            <motion.li key={s} animate={{ opacity: n <= i ? 1 : 0.3 }} className="flex items-start gap-3 text-sm">
              {n < i ? <Check size={18} className="mt-0.5 text-terra" /> : n === i ? <Loader2 size={18} className="mt-0.5 animate-spin text-mist" /> : <span className="h-[18px] w-[18px]" />}
              <span>{s}</span>
            </motion.li>
          ))}
        </ul>
        <div className="mt-8 h-1.5 overflow-hidden rounded-full bg-white/10"><motion.div className="h-full bg-terra" animate={{ width: `${(i / STEPS.length) * 100}%` }} /></div>
      </div>
    </div>
  );
}
