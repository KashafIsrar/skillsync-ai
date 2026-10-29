"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Landing from "@/components/Landing";
import Workspace from "@/components/Workspace";
import Processing from "@/components/Processing";
import Results from "@/components/Results";
import SiteHeader from "@/components/SiteHeader";
import { analyze, Analysis } from "@/lib/engine";

type View = "landing" | "workspace" | "processing" | "results";

export default function Home() {
  const [view, setView] = useState<View>("landing");
  const [result, setResult] = useState<Analysis | null>(null);
  const [resumeText, setResumeText] = useState<string>("");
  const [jobDescription, setJobDescription] = useState<string>("");

  useEffect(() => {
    const labels: Record<View, string> = {
      landing: "Resume Skill Coverage",
      workspace: "Analyze a Resume",
      processing: "Analyzing Resume",
      results: "Analysis Results",
    };
    document.title = `${labels[view]} | SkillSync AI`;
  }, [view]);

  const run = (resume: string, jd: string) => {
    setResumeText(resume);
    setJobDescription(jd);
    setResult(analyze(resume, jd));
    setView("processing");
  };

  return (
    <>
    <SiteHeader onHome={() => setView("landing")} onLaunch={() => setView("workspace")} showFeatures={view === "landing"} showLaunch={view === "landing" || view === "results"} />
    <AnimatePresence mode="wait">
      <motion.main key={view} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
        {view === "landing" && <Landing onLaunch={() => setView("workspace")} />}
        {view === "workspace" && <Workspace onRun={run} onBack={() => setView("landing")} initialResume={resumeText} initialJobDescription={jobDescription} />}
        {view === "processing" && <Processing onDone={() => setView("results")} />}
        {view === "results" && result && <Results data={result} jobDescription={jobDescription} onReset={() => setView("workspace")} />}
      </motion.main>
    </AnimatePresence>
    </>
  );
}
