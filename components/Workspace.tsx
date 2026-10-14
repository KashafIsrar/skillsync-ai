"use client";
import { useRef, useState } from "react";
import { FileUp, Wand2, ArrowLeft, Loader2 } from "lucide-react";
import { SAMPLE_JD, SAMPLE_RESUME } from "@/lib/samples";

async function readPdf(file: File) {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
  const doc = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  let out = "";
  for (let p = 1; p <= doc.numPages; p++) {
    const items = (await (await doc.getPage(p)).getTextContent()).items as { str: string; hasEOL?: boolean }[];
    out += items.map(i => i.str + (i.hasEOL ? "\n" : " ")).join("") + "\n";
  }
  return out;
}
export default function Workspace({ onRun, onBack }: { onRun: (r: string, j: string) => void; onBack: () => void }) {
  const [resume, setResume] = useState(""); const [jd, setJd] = useState("");
  const [busy, setBusy] = useState(false); const [err, setErr] = useState(""); const ref = useRef<HTMLInputElement>(null);
  const upload = async (f?: File) => {
    if (!f) return; setErr(""); setBusy(true);
    try { setResume(f.name.endsWith(".pdf") ? await readPdf(f) : await f.text()); }
    catch { setErr("Could not read that file. Paste your resume text instead."); }
    setBusy(false);
  };
  const ready = resume.trim().length > 40 && jd.trim().length > 40;
  const area = "h-72 w-full resize-none rounded-xl border border-steel/30 bg-white/70 p-4 text-sm leading-relaxed focus:border-terra";
  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <button onClick={onBack} className="mb-6 inline-flex items-center gap-1 text-sm text-steel"><ArrowLeft size={16} />Back</button>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-serif text-4xl text-navy">Workspace</h1>
        <button onClick={() => { setResume(SAMPLE_RESUME); setJd(SAMPLE_JD); setErr(""); }} className="inline-flex items-center gap-2 rounded-full border border-terra px-5 py-2 text-sm font-medium text-terra hover:bg-terra hover:text-white">
          <Wand2 size={16} />Load demo data
        </button>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <section className="glass p-5">
          <div className="mb-3 flex items-center justify-between"><h2 className="font-serif text-xl text-navy">Resume</h2>
            <button onClick={() => ref.current?.click()} className="pill bg-steel text-white">{busy ? <Loader2 size={14} className="animate-spin" /> : <FileUp size={14} />}Upload PDF or .txt</button>
            <input ref={ref} type="file" accept=".pdf,.txt,.md" hidden onChange={e => upload(e.target.files?.[0])} /></div>
          <textarea aria-label="Resume text" className={area} placeholder="Paste your resume. Start bullet points with a dash." value={resume} onChange={e => setResume(e.target.value)} />
          {err && <p className="mt-2 text-sm text-terra">{err}</p>}
        </section>
        <section className="glass p-5">
          <h2 className="mb-3 font-serif text-xl text-navy">Job description</h2>
          <textarea aria-label="Job description" className={area} placeholder="Paste the full job description." value={jd} onChange={e => setJd(e.target.value)} />
        </section>
      </div>
      <button disabled={!ready} onClick={() => onRun(resume, jd)} className="mt-8 rounded-full bg-navy px-8 py-3.5 font-medium text-white shadow-card transition enabled:hover:bg-steel disabled:opacity-40">Analyze my fit</button>
      {!ready && <p className="mt-2 text-sm text-steel">Add both a resume and a job description, or load the demo data.</p>}
    </div>
  );
}
