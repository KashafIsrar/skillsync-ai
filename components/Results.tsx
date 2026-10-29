"use client";
import { useEffect, useState } from "react";
import { OptimizedCVModal } from './OptimizedCVModal';
import { animate, AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, ChevronDown, RotateCcw, Sparkles } from "lucide-react";
import { applySkillFeedback, type Analysis, type SkillFeedback } from "@/lib/engine";

function Ring({ value }: { value: number }) {
  const [n, setN] = useState(0);
  const r = 70, c = 2 * Math.PI * r;

  useEffect(() => {
    const a = animate(0, value, { duration: 1.6, ease: "easeOut", onUpdate: v => setN(v) });
    return () => a.stop();
  }, [value]);

  return (
    <div className="relative h-44 w-44" role="img" aria-label={`Weighted skill coverage ${value} percent`}>
      <svg viewBox="0 0 160 160" className="-rotate-90">
        <circle cx="80" cy="80" r={r} fill="none" stroke="#F0D9E4" strokeWidth="12" />
        <motion.circle
          cx="80" cy="80" r={r} fill="none" stroke="#806C79" strokeWidth="12" strokeLinecap="round"
          strokeDasharray={c} initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - value / 100) }}
          transition={{ duration: 1.6, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center font-serif text-4xl text-navy">{n.toFixed(1)}%</div>
    </div>
  );
}

function Bullet({ b }: { b: Analysis["bullets"][number] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="glass overflow-hidden">
      <button aria-expanded={open} onClick={() => setOpen(!open)} className="flex w-full items-center justify-between gap-4 p-4 text-left text-sm">
        <span className="line-clamp-2">{b.original}</span>
        <ChevronDown size={18} className={`shrink-0 transition ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="space-y-3 border-t border-steel/20 p-4 text-sm">
              <p><span className="pill bg-mist text-ink">Original</span><br />{b.original}</p>
              <p><span className="pill bg-terra text-white">{b.rewritten ? "Suggested edit" : "No safe local rewrite"}</span><br />{b.rewritten || "The local rules could not make a distinct edit without guessing. Use AI suggestions or add more detail yourself."}</p>
              <p className="text-steel"><b>Why:</b> {b.reason}</p>
              <p className="text-steel"><b>To make this stronger:</b> {b.question}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Results({
  data,
  jobDescription,
  onReset
}: {
  data: Analysis;
  jobDescription: string;
  onReset: () => void
}) {
  const [displayData, setDisplayData] = useState(data);
  const [aiEnabled, setAiEnabled] = useState<boolean | null>(null);
  const [aiStatusError, setAiStatusError] = useState(false);
  const [consent, setConsent] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);
  const [aiError, setAiError] = useState("");
  const [isCVModalOpen, setIsCVModalOpen] = useState(false);
  const [skillFeedback, setSkillFeedback] = useState<SkillFeedback>({});
  const [equivalentSkill, setEquivalentSkill] = useState<string | null>(null);
  const [equivalentEvidence, setEquivalentEvidence] = useState("");
  const reviewedData = applySkillFeedback(displayData, skillFeedback);
  const resetSkillReview = (skill: string) => setSkillFeedback(current => {
    const next = { ...current };
    delete next[skill];
    return next;
  });
  const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
  const item = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } };

  useEffect(() => {
    let active = true;
    fetch("/api/suggestions")
      .then(response => response.json())
      .then(result => { if (active) setAiEnabled(Boolean(result.enabled)); })
      .catch(() => { if (active) { setAiEnabled(false); setAiStatusError(true); } });
    return () => { active = false; };
  }, []);

  const generateAiSuggestions = async () => {
    setAiBusy(true);
    setAiError("");
    try {
      const response = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription,
          bullets: displayData.bullets.map(({ original }) => ({ original })),
          gaps: reviewedData.missing.map(gap => gap.skill),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not generate suggestions.");
      setDisplayData(current => ({
        ...current,
        bullets: current.bullets.map((bullet, index) => ({ ...bullet, ...result.bullets[index] })),
        roadmap: result.roadmap,
      }));
    } catch (error) {
      setAiError(error instanceof Error ? error.message : "Could not generate suggestions.");
    } finally {
      setAiBusy(false);
    }
  };

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="mx-auto max-w-6xl space-y-8 overflow-x-clip px-4 py-7 sm:px-6 sm:py-10">
      <motion.div variants={item} className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-3xl text-navy sm:text-4xl">Your results</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCVModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-full bg-terra px-4 py-2 text-sm font-medium text-white shadow-md hover:bg-steel sm:px-5"
          >
            <Sparkles size={16} />
            View improvement plan
          </button>
          <button onClick={onReset} className="inline-flex items-center gap-2 rounded-full bg-navy px-4 py-2 text-sm text-white hover:bg-steel sm:px-5">
            <RotateCcw size={15} />
            Analyze another
          </button>
        </div>
      </motion.div>

      <motion.section variants={item} className="glass flex flex-wrap items-center gap-8 p-6">
        {reviewedData.score === null ? <div className="grid h-44 w-44 place-items-center rounded-full border-[12px] border-mist text-center font-serif text-2xl text-navy">N/A</div> : <Ring value={reviewedData.score} />}
        <div className="max-w-md">
          <h2 className="font-serif text-2xl text-navy">Weighted skill coverage</h2>
          <p className="mt-2 text-sm leading-relaxed">
            {reviewedData.requirementCount
              ? `You have ${reviewedData.matched.length} of ${reviewedData.requirementCount} recognized job skills (${reviewedData.matchedWeight} of ${reviewedData.totalWeight} weighted points). Score = matched points ÷ all recognized skill points. Explicitly required skills count 2 points; preferred or unspecified skills count 1 point. Each skill counts once. This is skill coverage only, not an overall job-fit or hiring prediction.`
              : "No skills from the analyzer’s supported list were found in this job description, so there is not enough information to calculate a meaningful match score."}
          </p>
        </div>
      </motion.section>

      <motion.section variants={item} className="grid gap-6 md:grid-cols-2">
        <div className="glass interactive-card min-w-0 p-4 sm:p-5">
          <h2 className="mb-3 flex items-center gap-2 font-serif text-xl text-navy">
            <CheckCircle2 size={20} className="text-steel" />Skills mentioned in resume
          </h2>
          <div className="space-y-3">
            {reviewedData.matched.map(s => <div key={s.skill} className="interactive-card min-w-0 rounded-xl bg-steel/5 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="pill bg-steel/15 text-steel">{s.skill}</span>
                <span className="text-xs text-steel">{skillFeedback[s.skill] ? `Reviewed: ${skillFeedback[s.skill].decision}` : "Needs your review"}</span>
              </div>
              {s.evidence && <p className="mt-2 break-words text-sm text-ink">{skillFeedback[s.skill]?.decision === "equivalent" ? "Your evidence" : "Resume evidence"}: “{s.evidence}”</p>}
              {s.requirementEvidence && <p className="mt-2 break-words text-sm text-steel">Job description: “{s.requirementEvidence}”</p>}
              <div className="mt-3 flex gap-2">
                <button onClick={() => setSkillFeedback(current => ({ ...current, [s.skill]: { decision: "confirmed" } }))} className="rounded-full border border-steel/40 px-3 py-1 text-xs">Confirm match</button>
                <button onClick={() => setSkillFeedback(current => ({ ...current, [s.skill]: { decision: "rejected" } }))} className="rounded-full border border-terra/40 px-3 py-1 text-xs text-terra">Not a match</button>
                {skillFeedback[s.skill] && <button onClick={() => resetSkillReview(s.skill)} className="rounded-full border border-ink/20 px-3 py-1 text-xs">Undo review</button>}
              </div>
            </div>)}
            {!reviewedData.matched.length && <p className="text-sm">No matches confirmed yet.</p>}
          </div>
        </div>
        <div className="glass interactive-card min-w-0 p-4 sm:p-5">
          <h2 className="mb-3 flex items-center gap-2 font-serif text-xl text-navy">
            <AlertTriangle size={20} className="text-terra" />Job skills not found
          </h2>
          <div className="flex flex-wrap gap-2">
            {reviewedData.missing.map(s => (
              <div key={s.skill} className="w-full rounded-xl bg-terra/5 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className={`pill ${s.severity === "critical" ? "bg-terra text-white" : "bg-terra/15 text-terra"}`}>
                    {s.skill}{s.priority === "preferred" ? " · preferred" : s.priority === "required" ? " · required" : " · priority unspecified"}
                  </span>
                  <span className="text-xs text-steel">{skillFeedback[s.skill] ? "Reviewed: not currently evidenced" : "Needs your review"}</span>
                </div>
                {s.requirementEvidence && <p className="mt-2 break-words text-sm text-steel">Job description: “{s.requirementEvidence}”</p>}
                {equivalentSkill === s.skill ? <form className="mt-3 flex flex-wrap gap-2" onSubmit={event => {
                  event.preventDefault();
                  const evidence = equivalentEvidence.trim();
                  if (!evidence) return;
                  setSkillFeedback(current => ({ ...current, [s.skill]: { decision: "equivalent", evidence } }));
                  setEquivalentSkill(null);
                  setEquivalentEvidence("");
                }}>
                  <label className="sr-only" htmlFor={`evidence-${s.skill}`}>Describe your equivalent {s.skill} experience</label>
                  <input id={`evidence-${s.skill}`} value={equivalentEvidence} onChange={event => setEquivalentEvidence(event.target.value)} maxLength={240} required placeholder="Add a resume phrase or experience" className="min-w-0 flex-1 rounded-lg border border-steel/30 bg-white px-3 py-2 text-sm sm:min-w-64" />
                  <button className="rounded-full bg-steel px-3 py-1 text-xs text-white">Add evidence</button>
                </form> : <div className="mt-3 flex flex-wrap gap-2">
                  <button onClick={() => setSkillFeedback(current => ({ ...current, [s.skill]: { decision: "rejected" } }))} className="rounded-full border border-ink/30 px-3 py-1 text-xs">Confirm gap</button>
                  <button onClick={() => { setEquivalentSkill(s.skill); setEquivalentEvidence(""); }} className="rounded-full border border-steel/40 px-3 py-1 text-xs text-steel">I have equivalent experience</button>
                  {skillFeedback[s.skill] && <button onClick={() => resetSkillReview(s.skill)} className="rounded-full border border-ink/20 px-3 py-1 text-xs">Undo review</button>}
                </div>}
              </div>
            ))}
            {!reviewedData.missing.length && <p className="text-sm">No recognized skill gaps remain after your review.</p>}
          </div>
        </div>
      </motion.section>

      <motion.section variants={item} className="space-y-3">
        <h2 className="font-serif text-2xl text-navy">Bullet suggestions</h2>
        <p className="text-sm text-steel">Local edits use conservative wording rules. Optional AI suggestions can make more context-aware edits and ask for missing STAR details without inventing them.</p>
        {aiEnabled === null ? <div role="status" aria-label="Checking AI availability" className="glass space-y-3 p-4"><div className="skeleton h-4 w-3/4 rounded" /><div className="skeleton h-10 w-52 rounded-full" /></div> : aiEnabled ? <div className="glass space-y-3 p-4">
          <label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={consent} onChange={event => setConsent(event.target.checked)} className="mt-1" />I agree to send the extracted resume bullets and job description to OpenAI to generate these suggestions.</label>
          <button onClick={generateAiSuggestions} disabled={!consent || aiBusy} className="rounded-full bg-terra px-5 py-2 text-sm font-medium text-white disabled:opacity-40">{aiBusy ? "Generating context-aware suggestions…" : "Generate AI suggestions"}</button>
          {aiError && <p role="alert" className="text-sm text-terra">{aiError}</p>}
        </div> : <p className="glass p-4 text-sm">{aiStatusError ? "Could not check AI availability. Local analysis still works; reconnect and reload to check whether AI rewrites are enabled." : "AI rewrites are off because this server has no OpenAI API key. Local analysis still works, but its wording suggestions are limited. Set OPENAI_API_KEY on the server to enable AI rewrites."}</p>}
        {displayData.incompleteBullets > 0 && <p className="glass p-4 text-sm">Skipped {displayData.incompleteBullets} incomplete bullet{displayData.incompleteBullets === 1 ? "" : "s"} ending mid-phrase. Check the resume text or PDF extraction and restore the missing words before using them.</p>}
        {displayData.bullets.length ? displayData.bullets.map(b => <Bullet key={b.original} b={b} />) : <p className="text-sm">No experience bullets found. Add bullets under an Experience or Projects heading, or start them with a dash.</p>}
      </motion.section>

      <motion.section variants={item}>
        <h2 className="mb-3 font-serif text-2xl text-navy">Suggested next steps</h2>
        {reviewedData.roadmap.length ? <ol className="space-y-3">
          {reviewedData.roadmap.map(r => (
            <li key={r.title} className="glass flex gap-4 p-4">
              <span className="pill h-fit bg-navy text-white">{r.time}</span>
              <div>
                <p className="font-medium text-navy">{r.title}</p>
                <p className="text-sm">{r.detail}</p>
              </div>
            </li>
          ))}
        </ol> : <p className="glass p-4 text-sm">No recognized skill gaps were identified from the job description. Review the bullet suggestions and verify that your resume clearly shows the experience the role asks for.</p>}
      </motion.section>

      <OptimizedCVModal
        isOpen={isCVModalOpen}
        onClose={() => setIsCVModalOpen(false)}
        matchedSkills={reviewedData.matched.map(s => s.skill)}
        missingGaps={reviewedData.missing.map(m => ({ skill: m.skill, importance: m.priority === "preferred" ? "preferred" : m.severity }))}
        starRewrites={displayData.bullets.map(b => ({ original: b.original, rewritten: b.rewritten || "No safe local rewrite was found.", reasoning: b.reason, question: b.question }))}
      />
    </motion.div>
  );
}
