import Link from "next/link";
import { ArrowLeft, ScanSearch } from "lucide-react";

export const metadata = {
  title: "Page not found",
  description: "This page could not be found. Return to SkillSync AI to compare a resume with a job description.",
};

export default function NotFound() {
  return <main className="grid min-h-[75vh] place-items-center px-4 py-12 text-center">
    <section className="glass interactive-card w-full max-w-xl p-7 sm:p-10">
      <ScanSearch aria-hidden="true" className="mx-auto text-terra" size={42} />
      <p className="mt-5 font-serif text-6xl text-navy">404</p>
      <h1 className="mt-3 font-serif text-2xl text-navy">This page wandered off.</h1>
      <p className="mx-auto mt-2 max-w-sm text-sm text-steel">No resume advice hiding here. Head back to the analyzer and start fresh.</p>
      <Link href="/" className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-navy px-6 py-3 text-sm font-medium text-white hover:bg-steel"><ArrowLeft size={16} />Back to SkillSync</Link>
    </section>
  </main>;
}
