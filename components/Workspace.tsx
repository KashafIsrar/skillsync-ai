"use client";
import { useEffect, useRef, useState } from "react";
import { FileUp, Wand2, ArrowLeft, Loader2, CheckCircle2, ExternalLink } from "lucide-react";
import { SAMPLE_JD, SAMPLE_RESUME } from "@/lib/samples";
import { cleanUploadedResumeText, formatPdfPageText, type PdfTextItem } from "@/lib/resume-format";

async function readPdf(file: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  const doc = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  let text = "";
  for (let p = 1; p <= doc.numPages; p++) {
    const items = (await (await doc.getPage(p)).getTextContent()).items as PdfTextItem[];
    text += `${formatPdfPageText(items)}\n\n`;
  }
  return cleanUploadedResumeText(text);
}

export default function Workspace({ onRun, onBack, initialResume = "", initialJobDescription = "" }: { onRun: (r: string, j: string) => void; onBack: () => void; initialResume?: string; initialJobDescription?: string }) {
  const [resume, setResume] = useState(initialResume); const [jd, setJd] = useState(initialJobDescription);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false); const [err, setErr] = useState(""); const [notice, setNotice] = useState(""); const ref = useRef<HTMLInputElement>(null);
  useEffect(() => () => {
    if (pdfPreviewUrl) URL.revokeObjectURL(pdfPreviewUrl);
  }, [pdfPreviewUrl]);

  const upload = async (f?: File) => {
    if (!f) return; setErr(""); setNotice(""); setBusy(true); setResume("");
    const extension = f.name.toLowerCase().split(".").pop();
    if (!["pdf", "txt", "md"].includes(extension ?? "")) { setErr("Invalid file format. Please upload a PDF, TXT, or Markdown file."); setBusy(false); return; }
    if (f.size > 10 * 1024 * 1024) { setErr("Please choose a file smaller than 10 MB."); setBusy(false); return; }
    setPdfPreviewUrl(null);
    try {
      const text = f.name.toLowerCase().endsWith(".pdf")
        ? await readPdf(f)
        : cleanUploadedResumeText(await f.text());
      if (!text.trim()) setErr("No selectable text found. This may be a scanned image, so paste your resume text instead.");
      else {
        setResume(text);
        if (f.name.toLowerCase().endsWith(".pdf")) setPdfPreviewUrl(URL.createObjectURL(f));
        setNotice("Resume uploaded. The original file preview keeps its formatting; edit the extracted text below if needed.");
      }
    } catch { setErr("Could not read that file. Paste your resume text instead."); }
    finally { setBusy(false); }
  };
  const ready = resume.trim().length > 40 && jd.trim().length > 40;
  const area = "h-72 w-full resize-none rounded-xl border border-steel/30 bg-white/70 p-4 text-sm leading-relaxed focus:border-terra";
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <button onClick={onBack} className="mb-6 inline-flex items-center gap-2 rounded-full px-3 text-sm text-steel hover:bg-mist"><ArrowLeft size={16} />Back</button>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-serif text-4xl text-navy">Workspace</h1>
        <button onClick={() => { setResume(SAMPLE_RESUME); setJd(SAMPLE_JD); setPdfPreviewUrl(null); setErr(""); setNotice(""); }} className="inline-flex items-center gap-2 rounded-full border border-terra px-5 py-2 text-sm font-medium text-terra hover:bg-terra hover:text-white">
          <Wand2 size={16} />Load demo data
        </button>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <section className="glass interactive-card min-w-0 p-4 sm:p-5">
          <div className="mb-3 flex min-w-0 flex-wrap items-center justify-between gap-3"><h2 className="font-serif text-xl text-navy">Resume</h2>
            <button disabled={busy} onClick={() => ref.current?.click()} className="inline-flex max-w-full items-center justify-center gap-2 rounded-full bg-steel px-3 py-2 text-center text-xs text-white disabled:opacity-50 sm:px-4 sm:text-sm">{busy ? <Loader2 size={14} className="animate-spin" /> : <FileUp size={14} className="shrink-0" />}{busy ? "Parsing…" : "Upload PDF, TXT, or MD"}</button>
            <input ref={ref} type="file" accept=".pdf,.txt,.md" hidden onChange={e => { const file = e.target.files?.[0]; e.currentTarget.value = ""; void upload(file); }} /></div>
          {pdfPreviewUrl && <div className="mb-4 overflow-hidden rounded-xl border border-steel/20 bg-white">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-steel/15 px-3 py-2">
              <p className="text-xs font-medium text-steel">Original PDF preview</p>
              <a href={pdfPreviewUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-steel underline underline-offset-2">
                Open PDF separately <ExternalLink size={13} />
              </a>
            </div>
            <iframe title="Original uploaded resume PDF" src={pdfPreviewUrl} className="h-[min(70vh,680px)] w-full bg-white" />
          </div>}
          {pdfPreviewUrl
            ? <details className="rounded-xl border border-steel/20 bg-white/60 p-3">
              <summary className="cursor-pointer text-sm font-medium text-navy">Review or edit extracted text used for analysis</summary>
              <p className="mb-2 mt-3 text-xs leading-relaxed text-steel">Text extraction cannot retain the PDF’s fonts, columns, or exact spacing. Changes here affect analysis, not the original PDF preview.</p>
              <textarea aria-label="Extracted resume text" className={`${area} leading-7`} placeholder="Extracted resume text" value={resume} onChange={e => { setResume(e.target.value); setNotice(""); }} />
            </details>
            : <textarea aria-label="Resume text" className={`${area} leading-7`} placeholder="Paste your resume. Start bullet points with a dash." value={resume} onChange={e => { setResume(e.target.value); setNotice(""); }} />}
          {err && <p role="alert" className="mt-3 rounded-xl bg-decanting/20 px-3 py-2 text-sm text-steel">{err}</p>}
          {notice && <p role="status" className="mt-3 flex items-center gap-2 rounded-xl bg-mist px-3 py-2 text-sm text-steel"><CheckCircle2 size={16} />{notice}</p>}
        </section>
        <section className="glass interactive-card min-w-0 p-4 sm:p-5">
          <h2 className="mb-3 font-serif text-xl text-navy">Job description</h2>
          <textarea aria-label="Job description" className={area} placeholder="Paste the full job description." value={jd} onChange={e => setJd(e.target.value)} />
        </section>
      </div>
      <button disabled={!ready || busy} onClick={() => onRun(resume, jd)} className="mt-8 rounded-full bg-navy px-8 py-3.5 font-medium text-white shadow-card transition enabled:hover:bg-steel disabled:opacity-40">Check skill coverage</button>
      {!ready && <p className="mt-2 text-sm text-steel">Add both a resume and a job description, or load the demo data.</p>}
    </div>
  );
}
