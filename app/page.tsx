"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Landing from "@/components/Landing";
import Workspace from "@/components/Workspace";
import Processing from "@/components/Processing";
import Results from "@/components/Results";
import { analyze, Analysis } from "@/lib/engine";

type View = "landing" | "workspace" | "processing" | "results";
export default function Home() {
  const [view, setView] = useState<View>("landing");
  const [result, setResult] = useState<Analysis | null>(null);
  const run = (resume: string, jd: string) => { setResult(analyze(resume, jd)); setView("processing"); };
  return (
    <AnimatePresence mode="wait">
      <motion.main key={view} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
        {view === "landing" && <Landing onLaunch={() => setView("workspace")} />}
        {view === "workspace" && <Workspace onRun={run} onBack={() => setView("landing")} />}
        {view === "processing" && <Processing onDone={() => setView("results")} />}
        {view === "results" && result && <Results data={result} onReset={() => setView("workspace")} />}
      </motion.main>
    </AnimatePresence>
  );
}
