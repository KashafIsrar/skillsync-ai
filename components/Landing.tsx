"use client";

import { motion } from "framer-motion";
import { ArrowDownRight, ArrowRight, Check, CircleHelp, FileText, ShieldCheck, Sparkles, Target } from "lucide-react";
import { analyze } from "@/lib/engine";
import { SAMPLE_JD, SAMPLE_RESUME } from "@/lib/samples";

const features = [
  {
    icon: Target,
    title: "See the evidence",
    description: "Review the resume phrase and job requirement behind each recognized skill.",
  },
  {
    icon: ShieldCheck,
    title: "Keep control",
    description: "Confirm, reject, or add equivalent experience to correct the analysis.",
  },
  {
    icon: Sparkles,
    title: "Improve with care",
    description: "Get conservative bullet suggestions that don’t invent your achievements.",
  },
];

const preview = analyze(SAMPLE_RESUME, SAMPLE_JD);

export default function Landing({ onLaunch }: { onLaunch: () => void }) {
  const score = preview.score === null ? "—" : `${preview.score}%`;

  return (
    <div className="min-h-screen overflow-hidden bg-[#f3f0ec] text-[#191817]">
      <section className="mx-auto grid min-h-[650px] max-w-7xl items-center gap-12 px-5 pb-16 pt-12 sm:px-8 sm:pb-20 sm:pt-16 lg:min-h-[690px] lg:grid-cols-[0.94fr_1.06fr] lg:gap-8 lg:px-12">
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="mb-6 inline-flex items-center gap-3 text-sm font-medium text-[#514a46]"
          >
            <span className="grid h-8 w-8 place-items-center rounded-full border border-[#b8afa7] bg-white/60">
              <ArrowRight size={15} />
            </span>
            A more thoughtful way to tailor your resume
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.06 }}
            className="max-w-[620px] font-sans text-[clamp(3rem,5.4vw,5.2rem)] font-semibold leading-[0.94] tracking-[-0.07em]"
          >
            Make your next application{" "}
            <span className="text-[#82766d]">more intentional.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.16 }}
            className="mt-7 max-w-[500px] text-base leading-7 text-[#625b56] sm:text-lg sm:leading-8"
          >
            Compare your resume with a role, see the skill evidence behind the results, and decide what to improve—without pretending a score can predict a hiring decision.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.24 }}
            className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3"
          >
            <button
              onClick={onLaunch}
              className="inline-flex items-center gap-3 rounded-full bg-[#171615] px-7 py-3.5 text-sm font-semibold text-white shadow-[0_8px_24px_-12px_rgba(0,0,0,.45)] transition hover:bg-[#403a36]"
            >
              Analyze a resume <ArrowRight size={17} />
            </button>
            <a href="#how-it-works" className="inline-flex items-center gap-2 text-sm font-medium text-[#393431] underline decoration-[#9b9189] underline-offset-4 hover:text-[#82766d]">
              See how it works <ArrowDownRight size={16} />
            </a>
          </motion.div>
          <p className="mt-6 flex items-start gap-2 text-xs leading-5 text-[#716963]">
            <ShieldCheck size={15} className="mt-0.5 shrink-0" />
            Resume analysis stays in your browser. AI suggestions are optional and require your consent.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.18 }}
          className="relative mx-auto w-full max-w-[620px] py-8 sm:py-12"
          aria-label="Illustrative resume skill coverage preview"
        >
          <div className="absolute -left-2 top-10 z-20 hidden w-44 rounded-2xl bg-[#d7d0c8] p-4 shadow-[0_20px_40px_-24px_rgba(45,37,31,.45)] sm:block lg:-left-7">
            <div className="mb-5 flex gap-1">
              <span className="h-2 w-2 rounded-full bg-[#8b7b70]" />
              <span className="h-2 w-2 rounded-full bg-[#8b7b70]/50" />
              <span className="h-2 w-2 rounded-full bg-[#8b7b70]/25" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#62574f]">Built for clarity</p>
            <p className="mt-2 text-sm leading-5 text-[#453e39]">A readable breakdown—not a black-box verdict.</p>
          </div>

          <div className="relative ml-auto max-w-[480px] rounded-[30px] border border-white/80 bg-[#e6e1dc] p-3 shadow-[0_32px_80px_-40px_rgba(44,34,27,.45)] sm:p-5">
            <div className="rounded-[22px] bg-[#fbfaf8] p-5 sm:p-7">
              <div className="flex items-center justify-between border-b border-[#e9e4df] pb-5">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#eee8e2] text-[#665b53]">
                    <FileText size={19} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#25211e]">Role comparison</p>
                    <p className="text-xs text-[#81766e]">Illustrative sample</p>
                  </div>
                </div>
                <span className="rounded-full bg-[#e9eee5] px-3 py-1 text-[11px] font-medium text-[#52624a]">Ready to review</span>
              </div>

              <div className="grid grid-cols-[1fr_auto] items-center gap-4 py-6">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.15em] text-[#8b8179]">Recognized skill coverage</p>
                  <p className="mt-2 text-5xl font-semibold tracking-[-0.06em] text-[#201d1b] sm:text-6xl">{score}</p>
                  <p className="mt-1 text-xs text-[#81766e]">Weighted estimate · not a hiring prediction</p>
                </div>
                <div className="grid h-[82px] w-[82px] place-items-center rounded-full border-[7px] border-[#ded8d2] border-t-[#8c7869] text-sm font-semibold text-[#51453d] sm:h-[96px] sm:w-[96px]">
                  {preview.matched.length}/{preview.requirementCount}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#777068]">Resume evidence</p>
                  <span className="text-[11px] text-[#91877f]">{preview.matched.length} recognized</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {preview.matched.slice(0, 4).map(skill => (
                    <span key={skill.skill} className="inline-flex items-center gap-1.5 rounded-full border border-[#dce4d8] bg-[#eef2eb] px-3 py-1.5 text-xs font-medium text-[#4c5a45]">
                      <Check size={12} />{skill.skill}
                    </span>
                  ))}
                  {preview.missing.slice(0, 2).map(skill => (
                    <span key={skill.skill} className="inline-flex items-center gap-1.5 rounded-full border border-[#e8d9cb] bg-[#f5ede6] px-3 py-1.5 text-xs font-medium text-[#80634e]">
                      <CircleHelp size={12} />{skill.skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="absolute -bottom-1 right-0 z-20 flex items-center gap-3 rounded-2xl bg-[#171615] px-4 py-3 text-white shadow-[0_18px_40px_-22px_rgba(0,0,0,.65)] sm:-right-3">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-white/10"><Sparkles size={16} /></div>
            <div>
              <p className="text-xs font-semibold">Your experience, clearly shown</p>
              <p className="mt-0.5 text-[11px] text-white/65">You stay in control of every edit</p>
            </div>
          </div>
        </motion.div>
      </section>

      <section id="features" className="scroll-mt-8 border-y border-[#dcd5ce] bg-[#ebe7e2]">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-9 sm:px-8 md:grid-cols-[0.8fr_1.2fr] md:items-center lg:px-12">
          <div className="flex items-center gap-4">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[#d6cec6] text-[#433b35]"><Target size={23} /></div>
            <div>
              <p className="text-lg font-semibold tracking-tight text-[#25211e]">Evidence before advice</p>
              <p className="mt-1 text-sm text-[#716963]">A useful starting point, with clear limits.</p>
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {features.map(({ icon: Icon, title, description }, index) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="border-l border-[#d0c8c0] pl-4"
              >
                <Icon size={18} className="text-[#7a6d63]" />
                <h2 className="mt-2 text-sm font-semibold text-[#302a26]">{title}</h2>
                <p className="mt-1 text-xs leading-5 text-[#716963]">{description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="mx-auto grid max-w-7xl gap-8 px-5 py-14 sm:px-8 sm:py-16 md:grid-cols-[0.75fr_1.25fr] lg:px-12">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#82766d]">How it works</p>
          <h2 className="mt-3 max-w-md text-3xl font-semibold leading-tight tracking-[-0.05em] text-[#211e1b] sm:text-4xl">A little more signal. A lot less guessing.</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            ["01", "Add your resume", "Paste your text or upload a PDF and check the extracted text."],
            ["02", "Compare the role", "See recognized skills, their priority, and supporting evidence."],
            ["03", "Make your call", "Review suggestions and correct matches before using them."],
          ].map(([number, title, description]) => (
            <div key={number} className="rounded-2xl border border-[#ddd6cf] bg-white/50 p-5">
              <span className="text-xs font-semibold tracking-[0.16em] text-[#8a7c71]">{number}</span>
              <h3 className="mt-4 font-semibold text-[#2c2723]">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#716963]">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-[#dcd5ce] px-5 py-6 text-center text-xs text-[#716963] sm:px-8">
        <p>© {new Date().getFullYear()} SkillSync AI · Skill coverage for more thoughtful applications.</p>
      </footer>
    </div>
  );
}
