'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, Copy, Check, X, ShieldCheck } from 'lucide-react';

interface STARRewrite {
  original: string;
  rewritten: string;
  reasoning: string;
  question: string;
}

interface Gap {
  skill: string;
  importance: 'critical' | 'moderate' | 'preferred';
}

interface OptimizedCVProps {
  isOpen: boolean;
  onClose: () => void;
  matchedSkills: string[];
  missingGaps: Gap[];
  starRewrites: STARRewrite[];
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export const OptimizedCVModal: React.FC<OptimizedCVProps> = ({
  isOpen,
  onClose,
  matchedSkills,
  missingGaps,
  starRewrites,
}) => {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKeyDown);
    closeRef.current?.focus();
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);
  if (!isOpen) return null;
  if (!isOpen) return null;

  const matchedText = matchedSkills.length ? matchedSkills.map(skill => `- ${skill}`).join("\n") : "- No recognized skills found.";
  const suggestionsText = starRewrites.length
    ? starRewrites.map((item, index) =>
      `${index + 1}. ${item.original}\n   Suggested edit: ${item.rewritten}\n   Why: ${item.reasoning}\n   To strengthen it: ${item.question}`
    ).join("\n\n")
    : "No experience or project bullets were detected. Add complete bullets under those sections to generate suggestions.";
  const gapsText = missingGaps.length
    ? missingGaps.map(gap => `- ${gap.skill} — ${gap.importance}`).join("\n")
    : "- No recognized skill gaps.";
  const matchedHtml = matchedSkills.length
    ? matchedSkills.map(skill => `<li>${escapeHtml(skill)}</li>`).join("")
    : "<li>No recognized skills found.</li>";
  const gapsHtml = missingGaps.length
    ? missingGaps.map(gap => `<li>${escapeHtml(gap.skill)} — ${escapeHtml(gap.importance)}</li>`).join("")
    : "<li>No recognized skill gaps.</li>";
  const blueprintText = [
    "SKILLSYNC AI",
    "Resume Improvement Plan",
    "",
    "Review note: Suggestions can be wrong or overstate your contribution. Verify every sentence before using it.",
    "",
    "MATCHED SKILLS",
    matchedText,
    "",
    "BULLET SUGGESTIONS",
    suggestionsText,
    "",
    "SKILL GAPS TO REVIEW",
    gapsText,
  ].join("\n");
  const htmlSuggestions = starRewrites.length
    ? `<ol>${starRewrites.map(item => `<li style="margin:0 0 16px"><p><strong>Original:</strong> ${escapeHtml(item.original)}</p><p><strong>Suggested edit:</strong> ${escapeHtml(item.rewritten)}</p><p><strong>Why:</strong> ${escapeHtml(item.reasoning)}</p><p><strong>To strengthen it:</strong> ${escapeHtml(item.question)}</p></li>`).join("")}</ol>`
    : `<p>${escapeHtml(suggestionsText)}</p>`;
  const blueprintHtml = `
    <article style="font-family:Arial,sans-serif;color:#222;line-height:1.55;max-width:760px">
      <h1 style="margin:0 0 4px;color:#16131f">SkillSync AI</h1>
      <p style="margin:0 0 24px;color:#555;font-size:20px"><strong>Resume Improvement Plan</strong></p>
      <p style="padding:12px 16px;background:#f6f1f4;border-left:4px solid #806c79"><strong>Review note:</strong> Suggestions can be wrong or overstate your contribution. Verify every sentence before using it.</p>
      <h2 style="margin:24px 0 8px;color:#16131f">Matched skills</h2>
      <ul>${matchedHtml}</ul>
      <h2 style="margin:24px 0 8px;color:#16131f">Bullet suggestions</h2>
      ${htmlSuggestions}
      <h2 style="margin:24px 0 8px;color:#16131f">Skill gaps to review</h2>
      <ul>${gapsHtml}</ul>
    </article>
  `;

  const handleCopy = async () => {
    setCopyError(false);
    try {
      if (navigator.clipboard.write && typeof ClipboardItem !== "undefined") {
        try {
          await navigator.clipboard.write([new ClipboardItem({
            "text/html": new Blob([blueprintHtml], { type: "text/html" }),
            "text/plain": new Blob([blueprintText], { type: "text/plain" }),
          })]);
        } catch {
          await navigator.clipboard.writeText(blueprintText);
        }
      } else {
        await navigator.clipboard.writeText(blueprintText);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
      setCopyError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-navy/75 p-3 backdrop-blur-sm sm:p-5" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
      <div role="dialog" aria-modal="true" aria-labelledby="blueprint-title" className="flex max-h-[94dvh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-navy text-paper shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-white/10 p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-decanting/20 p-2 text-decanting">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 id="blueprint-title" className="font-serif text-lg font-bold text-paper sm:text-xl">
                Resume Improvement Plan
              </h3>
              <p className="text-xs text-mist sm:text-sm">
                Review evidence-based bullet edits, matched skills, and gaps
              </p>
            </div>
          </div>
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label="Close resume blueprint"
            className="grid w-11 shrink-0 place-items-center rounded-lg text-mist hover:bg-white/10 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="m-3 min-h-0 flex-1 space-y-5 overflow-y-auto rounded-lg border border-white/10 bg-white/5 p-4 text-sm leading-relaxed sm:m-4 sm:space-y-6 sm:p-6">
          <div className="rounded-xl border-l-4 border-decanting bg-white/10 p-4 text-mist">
            <p className="font-semibold text-paper">Review before using</p>
            <p className="mt-1">Suggestions can be wrong or overstate your contribution. Verify every sentence before using it.</p>
          </div>
          <section>
            <h4 className="mb-2 font-semibold text-paper">Matched skills</h4>
            {matchedSkills.length
              ? <ul className="flex flex-wrap gap-2">{matchedSkills.map(skill => <li key={skill} className="rounded-full bg-decanting/15 px-3 py-1 text-decanting">{skill}</li>)}</ul>
              : <p className="text-mist">No recognized skills found.</p>}
          </section>
          <section>
            <h4 className="mb-2 font-semibold text-paper">Bullet suggestions</h4>
            {starRewrites.length
              ? <ol className="space-y-3">{starRewrites.map((item, index) => <li key={`${item.original}-${index}`} className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-paper"><span className="font-semibold">Original:</span> {item.original}</p>
                <p className="mt-2 text-decanting"><span className="font-semibold">Suggested edit:</span> {item.rewritten}</p>
                <p className="mt-2 text-mist"><span className="font-semibold text-paper">Why:</span> {item.reasoning}</p>
                <p className="mt-2 text-mist"><span className="font-semibold text-paper">To strengthen it:</span> {item.question}</p>
              </li>)}</ol>
              : <p className="text-mist">No experience or project bullets were detected. Add complete bullets under those sections to generate suggestions.</p>}
          </section>
          <section>
            <h4 className="mb-2 font-semibold text-paper">Skill gaps to review</h4>
            {missingGaps.length
              ? <ul className="space-y-2">{missingGaps.map(gap => <li key={gap.skill} className="flex items-center justify-between gap-3 rounded-lg bg-white/5 px-3 py-2 text-mist"><span>{gap.skill}</span><span className="rounded-full bg-terra/20 px-2 py-1 text-xs capitalize text-decanting">{gap.importance}</span></li>)}</ul>
              : <p className="text-mist">No recognized skill gaps.</p>}
          </section>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col items-stretch justify-between gap-3 border-t border-white/10 bg-white/5 p-4 sm:flex-row sm:items-center sm:p-6">
          <div className="flex items-center gap-2 text-xs text-mist">
            <ShieldCheck className="w-4 h-4" />
            <span>Review every suggestion before using it</span>
          </div>
          <button
            onClick={handleCopy}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-decanting px-5 py-2.5 text-sm font-semibold text-navy shadow-md hover:bg-mist sm:w-auto"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied plan!' : 'Copy improvement plan'}
          </button>
        </div>
        {copyError && <p role="alert" className="px-4 pb-4 text-sm text-decanting sm:px-6 sm:text-right">Clipboard access failed. Select and copy the text manually.</p>}
      </div>
    </div>
  );
};
