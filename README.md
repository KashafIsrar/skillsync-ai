# SkillSync AI — Semantic Resume Tailor & Gap Analyzer

**Problem:** Job seekers can't tell why a resume gets filtered out, or how to reword it for a specific role.
**Solution:** Paste a resume (or upload a PDF) and a job description. SkillSync scores the fit, lists matched and missing skills, rewrites bullets in STAR format and gives a weekly roadmap.

## Architecture
Everything runs in the browser, so hosting and usage are free and need no API keys.
- `lib/engine.ts` — Smart Simulation Engine: skill taxonomy extraction, term-vector cosine similarity, weighted skill coverage, a runtime schema check (`validate`), STAR rewrite templates and roadmap generation.
- `components/` — Landing, Workspace (PDF parsing via pdf.js), Processing (animated steps), Results (score ring, grids, accordion, roadmap).
- Stack: Next.js 14 App Router, TypeScript, Tailwind CSS, Framer Motion, Lucide.

Note: scores and rewrites are rule-based simulations, not LLM output. STAR rewrites add `[bracketed]` placeholders where a real metric belongs; fill in true numbers only.

## Run locally
```bash
npm install
npm run dev   # http://localhost:3000
```

## Deploy free on Vercel
```bash
git init && git add . && git commit -m "SkillSync AI"
git branch -M main
git remote add origin https://github.com/<you>/skillsync-ai.git
git push -u origin main
```
Then go to vercel.com/new, import the repo, keep the defaults (Framework: Next.js) and click **Deploy**. Or use the CLI: `npx vercel --prod`.
