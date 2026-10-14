// Smart Simulation Engine — fully client-side, zero API cost.
export type Skill = { skill: string; weight: number };
export type Analysis = {
  score: number; cosine: number; matched: Skill[];
  missing: (Skill & { severity: "critical" | "moderate" })[];
  bullets: { original: string; rewritten: string; reason: string }[];
  roadmap: { title: string; detail: string; time: string }[];
};
const TAXONOMY: Record<string, string[]> = {
  React: ["react", "react.js", "reactjs"], "Next.js": ["next.js", "nextjs"], TypeScript: ["typescript"], JavaScript: ["javascript"],
  "Node.js": ["node.js", "nodejs", "node"], Python: ["python"], SQL: ["sql", "postgresql", "mysql"], AWS: ["aws", "amazon web services"],
  Docker: ["docker", "containers"], Kubernetes: ["kubernetes", "k8s"], "CI/CD": ["ci/cd", "github actions", "jenkins"], GraphQL: ["graphql"],
  "REST APIs": ["rest", "restful"], Testing: ["jest", "cypress", "unit test", "testing"], Terraform: ["terraform"], Redis: ["redis"],
  Leadership: ["led", "mentored", "mentor", "leadership"], Agile: ["agile", "scrum"], "Machine Learning": ["machine learning", "ml"],
  "Tailwind CSS": ["tailwind"], Accessibility: ["accessibility", "wcag", "a11y"], "System Design": ["system design", "microservices", "distributed"],
  Observability: ["datadog", "prometheus", "observability", "monitoring"], Performance: ["performance", "latency", "optimization"],
};
const GUIDE: Record<string, string> = {
  TypeScript: "Convert one small JS project to strict TypeScript and publish it.", "Next.js": "Build a small App Router project with server and client components.",
  GraphQL: "Add a GraphQL layer (Apollo or Yoga) over an existing REST service.", AWS: "Deploy a static site and an API using S3, CloudFront and Lambda.",
  Docker: "Containerise an existing app and run it with docker compose.", "CI/CD": "Add a GitHub Actions pipeline that lints, tests and deploys.",
  "Tailwind CSS": "Rebuild one page of your portfolio with Tailwind utilities.", Accessibility: "Audit a page with axe and fix issues against WCAG 2.2 AA.",
  Observability: "Add structured logs and basic dashboards to a side project.", "System Design": "Write a one-page design doc for a system you have built.",
  Performance: "Measure Core Web Vitals on a project and document one measured improvement.",
};
const esc = (t: string) => t.replace(/[.*+?^${}()|[\]\\\/]/g, "\\$&");
const count = (text: string, terms: string[]) => terms.reduce((n, t) => {
  const re = new RegExp(`(?<![a-z0-9])${esc(t)}(?![a-z0-9])`, "gi");
  return n + (text.match(re)?.length ?? 0);
}, 0);
const STOP = new Set("the a an and or to of in for with on at by is are be will you we our your as it that this from".split(" "));
const vec = (t: string) => { const v = new Map<string, number>(); t.toLowerCase().match(/[a-z][a-z0-9.+#]+/g)?.forEach(w => { if (!STOP.has(w)) v.set(w, (v.get(w) ?? 0) + 1); }); return v; };
export function cosine(a: string, b: string) {
  const x = vec(a), y = vec(b); let dot = 0, nx = 0, ny = 0;
  x.forEach((v, k) => { nx += v * v; dot += v * (y.get(k) ?? 0); }); y.forEach(v => (ny += v * v));
  return nx && ny ? dot / Math.sqrt(nx * ny) : 0;
}
export function validate(a: Analysis): Analysis { // lightweight runtime schema check
  const ok = typeof a.score === "number" && Array.isArray(a.matched) && Array.isArray(a.missing) && Array.isArray(a.bullets) && Array.isArray(a.roadmap);
  if (!ok) throw new Error("Invalid analysis schema");
  return a;
}
export function analyze(resume: string, jd: string): Analysis {
  const jdSkills: Skill[] = Object.entries(TAXONOMY).map(([skill, t]) => ({ skill, weight: count(jd, t) })).filter(s => s.weight > 0);
  const has = (s: string) => count(resume, TAXONOMY[s]) > 0;
  const matched = jdSkills.filter(s => has(s.skill)).sort((a, b) => b.weight - a.weight);
  const missing = jdSkills.filter(s => !has(s.skill)).sort((a, b) => b.weight - a.weight)
    .map(s => ({ ...s, severity: (s.weight >= 2 ? "critical" : "moderate") as "critical" | "moderate" }));
  const total = jdSkills.reduce((n, s) => n + s.weight, 0), got = matched.reduce((n, s) => n + s.weight, 0);
  const cos = cosine(resume, jd), coverage = total ? got / total : 0.5;
  const score = Math.min(98, Math.max(5, Math.round((0.62 * coverage + 0.38 * Math.min(1, cos * 2.2)) * 1000) / 10));
  const lines = resume.split("\n").filter(l => /^\s*[-•*]\s+/.test(l)).map(l => l.replace(/^\s*[-•*]\s+/, "").trim()).slice(0, 4);
  const focus = [...jdSkills].sort((a, b) => b.weight - a.weight)[0]?.skill ?? "the role's core stack";
  const bullets = lines.map((original, i) => {
    const body = original.replace(/\.$/, ""), lead = body.charAt(0).toLowerCase() + body.slice(1);
    const weave = matched.find(m => !new RegExp(esc(m.skill), "i").test(original))?.skill;
    const hasNum = /\d/.test(original);
    const result = hasNum ? "preserving your quantified impact" : ["[add a real metric, e.g. reduced load time by X%]", "[add scale, e.g. served X users / saved X hrs per week]"][i % 2];
    return {
      original,
      rewritten: `Faced with a delivery goal centred on ${focus}, ${lead}${weave ? `, applying ${weave}` : ""}, delivering ${result}.`,
      reason: `Adds Situation/Task context tied to the JD's top requirement (${focus}), keeps your action first-person and concrete, and ${hasNum ? "keeps the existing number" : "flags where a measurable Result is missing — replace the bracket with a true figure"}. Never claim skills you lack.`,
    };
  });
  const roadmap = missing.slice(0, 3).map((m, i) => ({
    title: `Close the ${m.skill} gap`, detail: GUIDE[m.skill] ?? `Complete a small hands-on project using ${m.skill} and add it to your resume.`, time: `Week ${i + 1}`,
  }));
  roadmap.push({ title: "Re-tailor and re-score", detail: "Apply the STAR rewrites with your real metrics, mirror the JD's wording honestly, and run SkillSync again.", time: `Week ${roadmap.length + 1}` });
  return validate({ score, cosine: Math.round(cos * 1000) / 1000, matched, missing, bullets, roadmap });
}
