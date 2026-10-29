# SkillSync AI — Resume Requirement Matcher

**Problem:** Job seekers can't tell why a resume gets filtered out, or how to reword it for a specific role.
**Solution:** Paste a resume (or upload a PDF) and a job description. SkillSync estimates weighted coverage of skills in its built-in taxonomy, lists matched and missing skills, offers conservative bullet edits, and suggests next steps for detected gaps.

## Architecture
The score and skill analysis run in the browser. Optional AI rewrites use a server-side OpenAI API key; without one, local wording suggestions remain available.
- `lib/engine.ts` — rule-based skill matching, requirement weighting, resume and job-description evidence, resume bullet extraction, and cautious wording suggestions.
- `components/` — Landing, Workspace (original PDF preview plus editable text extraction via pdf.js), Processing (animated steps), Results (score ring, grids, accordion, roadmap), and a copyable, formatted resume-upgrade blueprint.
- Stack: Next.js 14 App Router, TypeScript, Tailwind CSS, Framer Motion, Lucide.

Note: the score is weighted coverage over the app's supported skill list, not semantic understanding, overall job fit, or a hiring prediction. Skills outside that list are not scored. Each detected skill includes the matching job-description phrase and, when available, resume evidence so results can be checked. Each detected skill can be confirmed, rejected, or marked as equivalent experience; those choices update the score and roadmap for the current analysis. Local edits use conservative rules. AI suggestions are generated only after the user opts in and sends extracted bullets plus the job description; they must be checked for accuracy.

## Matcher evaluation

Run `npm test` (or `npm run evaluate:matcher`) to run the matcher checks against the labeled examples in `lib/matcher-evaluation.json`, including phrase aliases, common false positives, score weighting, evidence attribution, and user review decisions. The examples are hand-authored regression fixtures, not a benchmark of real job seekers or evidence of production accuracy. Add reviewed examples when changing aliases or contextual rules. GitHub Actions runs these checks and a production build on pushes and pull requests.

## Run locally
```bash
npm install
npm run dev   # http://localhost:3000
```

## Optional AI suggestions

Set `OPENAI_API_KEY` in the server environment before starting the app. In PowerShell, for the current terminal session:

```powershell
$env:OPENAI_API_KEY = "your-api-key"
npm.cmd run dev
```

The API key stays on the server. The results page requires an explicit checkbox before sending extracted resume bullets and the job description to OpenAI. Set `OPENAI_MODEL` to override the default model (`gpt-6-astra`). In production, add these variables to the server deployment environment; never expose the key in a `NEXT_PUBLIC_` variable.

## Deploy free on Vercel
```bash
git init && git add . && git commit -m "SkillSync AI"
git branch -M main
git remote add origin https://github.com/<you>/skillsync-ai.git
git push -u origin main
```
Then go to vercel.com/new, import the repo, keep the defaults (Framework: Next.js) and click **Deploy**. Or use the CLI: `npx vercel --prod`.
