export type Skill = { skill: string; weight: number; evidence?: string; requirementEvidence?: string; priority: "required" | "preferred" | "unspecified" };
export type Gap = Skill & { severity: "critical" | "moderate"; priority: "required" | "preferred" | "unspecified" };
export type SkillFeedback = Record<string, { decision: "confirmed" | "rejected" | "equivalent"; evidence?: string }>;
export type BulletSuggestion = { original: string; rewritten: string; reason: string; question: string };
export type Analysis = {
  score: number | null;
  matched: Skill[];
  missing: Gap[];
  bullets: BulletSuggestion[];
  roadmap: { title: string; detail: string; time: string }[];
  requirementCount: number;
  matchedWeight: number;
  totalWeight: number;
  incompleteBullets: number;
};

type SkillDefinition = { name: string; terms: string[] };
const TAXONOMY: SkillDefinition[] = [
  { name: "React", terms: ["react", "react.js", "reactjs"] },
  { name: "Next.js", terms: ["next.js", "nextjs"] },
  { name: "TypeScript", terms: ["typescript"] },
  { name: "JavaScript", terms: ["javascript", "ecmascript", "es6", "js"] },
  { name: "Node.js", terms: ["node.js", "nodejs"] },
  { name: "Python", terms: ["python"] },
  { name: "SQL", terms: ["sql", "structured query language", "postgresql", "postgres", "mysql", "sqlite", "mariadb", "t sql", "pl sql"] },
  { name: "AWS", terms: ["aws", "amazon web services", "amazon ec2", "amazon s3", "ec2", "s3"] },
  { name: "Docker", terms: ["docker", "containerization", "containerisation", "docker containers"] },
  { name: "Kubernetes", terms: ["kubernetes", "k8s", "kube"] },
  { name: "CI/CD", terms: ["ci/cd", "continuous integration", "continuous delivery", "github actions", "gitlab ci", "circleci", "jenkins", "build pipeline", "deployment pipeline"] },
  { name: "GraphQL", terms: ["graphql"] },
  { name: "REST APIs", terms: ["rest api", "rest apis", "restful api", "restful apis", "http api", "http apis", "http endpoint", "http endpoints", "api endpoint", "api endpoints"] },
  { name: "Testing", terms: ["jest", "cypress", "unit test", "automated test", "testing"] },
  { name: "Terraform", terms: ["terraform"] },
  { name: "Redis", terms: ["redis"] },
  { name: "Leadership", terms: ["led", "mentored", "mentor", "leadership"] },
  { name: "Agile", terms: ["agile", "scrum"] },
  { name: "Machine Learning", terms: ["machine learning", " ml "] },
  { name: "Tailwind CSS", terms: ["tailwind"] },
  { name: "Accessibility", terms: ["accessibility", "wcag", "a11y"] },
  { name: "System Design", terms: ["system design", "microservices", "distributed systems"] },
  { name: "Observability", terms: ["datadog", "prometheus", "observability", "monitoring"] },
  { name: "Performance", terms: ["performance", "latency", "web vitals", "optimization", "optimisation"] },
];

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
function normalizeSkillText(text: string) {
  return text.toLowerCase()
    .replace(/\bci\s*\/\s*cd\b/g, " cicd ")
    .replace(/\./g, (dot, index, source: string) => index > 0 && index < source.length - 1 && /[a-z0-9]/i.test(source[index - 1]) && /[a-z0-9]/i.test(source[index + 1]) ? dot : " ")
    .replace(/[^a-z0-9+#.]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
function termCount(text: string, term: string) {
  const normalized = ` ${normalizeSkillText(text)} `;
  const needle = ` ${normalizeSkillText(term)} `;
  // Phrase boundaries prevent e.g. "testing" from matching "contest".
  return normalized.split(needle).length - 1;
}
function occurrences(text: string, terms: string[]) {
  return terms.reduce((sum, term) => sum + termCount(text, term), 0);
}
function isPlausibleAlias(skill: string, term: string, text: string) {
  if (skill === "Leadership" && term === "led") return /\bled\s+(?:(?:a|an|the|\d+|cross-functional|multidisciplinary|engineering|product)\s+){0,3}(?:team|group|project|initiative|program|department|organization|organisation|colleagues|engineers|developers|students)\b/i.test(text);
  return true;
}
function skillOccurrences(text: string, skill: string, terms: string[]) {
  return terms.reduce((sum, term) => {
    if (skill === "Leadership" && term === "led") {
      return sum + text.split(/\n|(?<=[.!?])\s+/).filter(line => isPlausibleAlias(skill, term, line)).reduce((n, line) => n + termCount(line, term), 0);
    }
    return sum + termCount(text, term);
  }, 0);
}
function hasPositiveSkillMention(text: string, terms: string[]) {
  const lower = text.toLowerCase();
  for (const term of terms) {
    const boundary = term.trim().toLowerCase() === "js" ? "(?<![a-z0-9.])" : "(?<![a-z0-9])";
    const termRe = new RegExp(`${boundary}${escapeRegExp(term.trim())}(?![a-z0-9])`, "gi");
    for (const match of lower.matchAll(termRe)) {
      const index = match.index ?? 0;
      const before = lower.slice(Math.max(0, index - 55), index).split(/[.!?;\n]/).pop() ?? "";
      const after = lower.slice(index + match[0].length, index + match[0].length + 45).split(/[.!?;\n]/)[0] ?? "";
      const negatedBefore =
        /\b(?:no|without|lack(?:s|ing)?)\s+(?:(?:any|prior|previous|professional|practical|hands-on)\s+){0,3}(?:experience|knowledge|familiarity|proficiency|exposure|background|skills?|usage|use|used)\s*(?:with|in|of)?\s*$/i.test(before) ||
        /\b(?:not|never|don't|doesn't|didn't)\s+(?:(?:experienced|familiar|proficient|skilled|knowledgeable)\s+(?:with|in|at)?|(?:use|used|using)\s+)$/i.test(before) ||
        /\b(?:not|never|don't|doesn't|didn't)\s*$/i.test(before);
      const negatedAfter = /^\s*(?:(?:is|are|was|were)\s+)?(?:not required|not needed|not necessary|not essential|not used|never used)\b/i.test(after);
      const negationNear = /\b(?:no|not|never|without|lack(?:s|ing)?|don't|doesn't|didn't)\b/i.test(before.slice(-18)) || /^\s*(?:(?:is|are|was|were)\s+)?(?:not|never|without|lacks?)\b/i.test(after.slice(0, 18));
      const negated = !/\bnot\s+(?:only|just)\b/i.test(before) && (negatedBefore || negatedAfter || negationNear);
      if (!negated) return true;
    }
  }
  return false;
}
function priorityOf(jd: string, terms: string[]): "required" | "preferred" | "unspecified" {
  const lower = jd.toLowerCase();
  let preferred = false;
  const cue = /\b(not required|not necessary|not needed|not essential|nice to have|preferred|bonus|ideally|optional|plus|required|must have|must|need to|essential)\b/g;
  for (const term of terms) {
    const termRe = new RegExp(escapeRegExp(term), "gi");
    for (const match of lower.matchAll(termRe)) {
      const start = Math.max(0, (match.index ?? 0) - 55);
      const end = Math.min(lower.length, (match.index ?? 0) + term.length + 55);
      const nearby = lower.slice(start, end);
      let closest: { distance: number; preferred: boolean } | null = null;
      for (const found of nearby.matchAll(cue)) {
        const index = found.index ?? 0;
        const distance = Math.abs(start + index - (match.index ?? 0));
        if (!closest || distance < closest.distance) {
          closest = { distance, preferred: /\b(not required|not necessary|not needed|not essential|nice to have|preferred|bonus|ideally|optional|plus)\b/.test(found[0]) };
        }
      }
      if (closest?.preferred === false) return "required";
      if (closest?.preferred) preferred = true;
    }
  }
  return preferred ? "preferred" : "unspecified";
}

function evidenceFor(text: string, skill: string, terms: string[]) {
  const candidates = text.split(/\n|(?<=[.!?])\s+/).map(line => line.trim()).filter(Boolean);
  const found = candidates.find(line => terms.some(term => isPlausibleAlias(skill, term, line) && termCount(line, term) > 0 && hasPositiveSkillMention(line, [term])));
  return found ? (found.length > 240 ? `${found.slice(0, 237).trimEnd()}…` : found) : undefined;
}

function requirementEvidenceFor(text: string, skill: string, terms: string[]) {
  const candidates = text.split(/\n|(?<=[.!?])\s+/).map(line => line.trim()).filter(Boolean);
  const found = candidates.find(line => terms.some(term => isPlausibleAlias(skill, term, line) && termCount(line, term) > 0));
  return found ? (found.length > 240 ? `${found.slice(0, 237).trimEnd()}…` : found) : undefined;
}

const BULLET = /^\s*(?:[-*•▪◦‣–—]|\d+[.)])\s+/;
const SECTION_START = /^(?:work|professional|relevant|technical|project)\s+(?:experience|projects?)\b|^experience\b|^projects?\b/i;
const SECTION_END = /^(?:contact|awards?|honou?rs|academic history|education|skills|certifications?|summary|profile|interests|languages|references|publications)\b/i;
const ACTION_VERBS = /^(?:built|created|developed|designed|implemented|led|managed|wrote|tested|improved|reduced|increased|automated|deployed|integrated|maintained|delivered|supported|assisted|guided|mentored|analyzed|analysed|optimized|optimised|worked|selected|conducted|provided|collaborated|launched|migrated|refactored|configured|engineered|authored|organized|organised|taught|tutored|helped)\b/i;
const ALL_CAPS_HEADING = /^[A-Z][A-Z\s/&-]{2,}$/;
const DANGLING_ENDING = /(?:\b(?:and|or|with|to|of|the|in|for|on|by|a|an|using|including)|[,;:&])$/i;

export function extractBullets(resume: string): { bullets: string[]; incompleteCount: number } {
  const bullets: string[] = [];
  let incompleteCount = 0;
  const hasExperienceHeadings = /^(?:work|professional|relevant|technical|project)\s+(?:experience|projects?)\b|^experience\b|^projects?\b/im.test(resume);
  let inExperience = false;
  let current = "";
  const flush = () => {
    const value = current.replace(/\s+/g, " ").trim().replace(/[•▪◦‣]+$/g, "");
    if (DANGLING_ENDING.test(value.replace(/[.!?]+$/, ""))) incompleteCount++;
    else if (value.length >= 18 && value.split(/\s+/).length >= 4 && !bullets.includes(value)) bullets.push(value);
    current = "";
  };
  for (const raw of resume.replace(/\r/g, "").split("\n")) {
    const line = raw.trim();
    if (!line) { if (!DANGLING_ENDING.test(current.trim().replace(/[.!?]+$/, ""))) flush(); continue; }
    if (line.length < 70 && SECTION_START.test(line)) { flush(); inExperience = true; continue; }
    if (line.length < 70 && SECTION_END.test(line)) { flush(); inExperience = false; continue; }
    if (BULLET.test(line)) {
      flush();
      if (!hasExperienceHeadings || inExperience) current = line.replace(BULLET, "");
      continue;
    }
    if (inExperience && ACTION_VERBS.test(line)) { flush(); current = line; continue; }
    if (current && (raw.startsWith(" ") || raw.startsWith("\t") || !ALL_CAPS_HEADING.test(line))) {
      current += ` ${line}`;
    } else flush();
  }
  flush();
  return { bullets: bullets.slice(0, 8), incompleteCount };
}

const VERB_UPGRADES: Record<string, string> = {
  worked: "Contributed", helped: "Supported", assisted: "Supported", made: "Created", did: "Completed",
  used: "Applied", selected: "Selected", guided: "Guided", wrote: "Authored", built: "Built", created: "Created",
  developed: "Developed", designed: "Designed", implemented: "Implemented", led: "Led", managed: "Managed",
  tested: "Tested", improved: "Improved", reduced: "Reduced", increased: "Increased", automated: "Automated",
  deployed: "Deployed", integrated: "Integrated", maintained: "Maintained", delivered: "Delivered", provided: "Provided",
  conducted: "Conducted", mentored: "Mentored", optimized: "Optimized", optimised: "Optimised", analyzed: "Analyzed", analysed: "Analysed",
};
function rewriteBullet(original: string, jdSkills: string[]): BulletSuggestion {
  const clean = original.trim().replace(/[.!?]+$/, "").replace(/\s+/g, " ");
  const words = clean.split(/\s+/);
  const first = words[0]?.toLowerCase().replace(/[^a-z]/g, "") ?? "";
  let upgraded = clean;
  let reason = "";

  let match = clean.match(/^assisted\s+(.+?)\s+in\s+((?:conduct|provid|organiz|maintain|develop|deliver|teach|run|lead)[a-z]+\b.*)$/i);
  if (match) {
    upgraded = `Supported ${match[1]} by ${match[2]}`;
    reason = `Recasts “assisted ${match[1]} in …” as a direct contribution and keeps the specific work that follows.`;
  } else if ((match = clean.match(/^guided\s+(.+?)\s+with\s+(.+)$/i))) {
    upgraded = `Mentored ${match[1]} in ${match[2]}`;
    reason = `Names the mentoring action directly and connects ${match[1]} to the subject they were guided through.`;
  } else if ((match = clean.match(/^selected\s+by\s+(.+?)\s+to\s+assist\s+during\s+(.+)$/i))) {
    upgraded = `Selected by ${match[1]} to support ${match[2]} activities`;
    reason = `Keeps the selection by ${match[1]} while replacing the vague phrase “assist during” with a clearer description.`;
  } else if ((match = clean.match(/^worked\s+on\s+(.+)$/i))) {
    upgraded = `Contributed to ${match[1]}`;
    reason = `Replaces the vague opener “worked on” with “contributed to”; the project detail stays intact.`;
  } else if ((match = clean.match(/^helped\s+(.+?)\s+with\s+(.+)$/i))) {
    upgraded = `Supported ${match[1]} with ${match[2]}`;
    reason = `Uses a direct action verb and retains who or what received the support.`;
  } else if ((match = clean.match(/^(developed|built|created|implemented)\s+(.+?)\s+with\s+(.+,.+)$/i))) {
    upgraded = `${match[1]} ${match[2]} featuring ${match[3]}`;
    reason = `Separates the project from its included features so the main work is easier to scan.`;
  } else if (VERB_UPGRADES[first] && VERB_UPGRADES[first].toLowerCase() !== first) {
    upgraded = `${VERB_UPGRADES[first]} ${words.slice(1).join(" ")}`;
    reason = `Changes the broad opener “${words[0]}” to “${VERB_UPGRADES[first]}” while preserving the rest of the claim.`;
  }

  const related = jdSkills.filter(skill => {
    const definition = TAXONOMY.find(item => item.name === skill);
    return definition && occurrences(original, definition.terms) > 0;
  });
  if (!reason) {
    const verb = ACTION_VERBS.exec(clean)?.[0];
    const subject = clean.split(/\s+(?:with|using|for|across|to)\s+/i)[0]?.replace(/^(?:Built|Developed|Created|Implemented|Led|Managed|Wrote|Designed|Delivered|Automated|Tested)\s+/i, "");
    reason = verb
      ? `This bullet already opens with “${verb}” and identifies ${subject ? `the work as ${subject}` : "the work"}. The local editor found no safe wording change without adding facts.`
      : "The local editor could not identify a safe wording change from this sentence alone; clarify your personal action before rewriting it.";
  }
  let question = "What changed because of this work? Add a result or scale only if you can verify it.";
  if (/student|instructor|mentor|teach|tutor/i.test(original)) question = "How many students or colleagues did you support, and what were they able to do afterward?";
  else if (/test|jest|cypress|qa/i.test(original)) question = "How many tests did you add, or what defect or release risk did they help catch?";
  else if (/api|endpoint|server|backend/i.test(original)) question = "How many endpoints or requests did this cover, and what behavior or reliability improvement can you verify?";
  else if (/checkout|payment|bank|transaction|order/i.test(original)) question = "What was the transaction or user scale, and did you measure a change in completion, errors, or latency?";
  else if (/dashboard|admin/i.test(original)) question = "Which admin task did the dashboard support, and can you measure time saved or users served?";
  else if (/\d/.test(original)) question = "Can you explain what the number measures and the time period it covers?";
  if (related.length) question += ` The bullet already names ${related.join(", ")}; keep those terms only if they describe your work accurately.`;
  return {
    original,
    rewritten: upgraded === clean ? "" : `${upgraded}.`,
    reason,
    question,
  };
}

const GUIDES: Record<string, string> = {
  React: "Build or document a small interface that demonstrates the React work you have actually done.",
  "Next.js": "Create a small Next.js page or feature and document the routing and rendering choices.",
  TypeScript: "Convert one existing feature to TypeScript and document the types and checks you added.",
  JavaScript: "Add a small JavaScript project or feature that demonstrates the language skills requested.",
  "Node.js": "Build a small Node.js service and document its endpoints, validation, and error handling.",
  Python: "Complete a small Python task relevant to the role and document your approach and result.",
  SQL: "Write and document queries against a small relational dataset, including joins and indexes where relevant.",
  AWS: "Deploy a small project on AWS and document the services and configuration you used.",
  Docker: "Containerize a small project and document how to build and run it.",
  Kubernetes: "Deploy a small containerized app to a local Kubernetes cluster and document the manifests.",
  "CI/CD": "Add a CI workflow to a project and document the checks it runs.",
  GraphQL: "Add a small GraphQL schema and resolver to a project and document its queries.",
  "REST APIs": "Build or document an API endpoint, including request validation and response behavior.",
  Testing: "Add tests for a real project feature and document what behavior they verify.",
  Terraform: "Use Terraform to define a small infrastructure resource and document the plan and state workflow.",
  Redis: "Use Redis in a small project and document the data and expiration strategy.",
  Leadership: "Describe a real example of coordinating, mentoring, or unblocking others, including the outcome if known.",
  Agile: "Describe a real example of iterative planning, delivery, or team feedback and what you contributed.",
  "Machine Learning": "Complete a small machine-learning exercise and document the data, evaluation, and limitations.",
  "Tailwind CSS": "Style a small page with Tailwind and document responsive or reusable patterns you used.",
  Accessibility: "Audit a page with an accessibility checker and document verified fixes.",
  "System Design": "Write a short design note for a system you know, including trade-offs and constraints.",
  Observability: "Add structured logging or a basic dashboard to a project and document the signals it provides.",
  Performance: "Measure a real page or operation, make a change, and record before-and-after results.",
};

function buildRoadmap(missing: Gap[]) {
  return missing.slice(0, 3).flatMap((gap, index) => {
    const priority = gap.priority === "preferred" ? "Optional" : gap.priority === "required" ? "High priority" : `Priority ${index + 1}`;
    const guide = GUIDES[gap.skill] ?? `Complete a small, verifiable task using ${gap.skill} and record what you did.`;
    return [
      { title: `Check your ${gap.skill} evidence`, detail: `Review your resume and project notes for equivalent wording or an example of ${gap.skill}. If you have used it, name the relevant work explicitly; do not add it based on familiarity alone.`, time: priority },
      { title: `Build practical ${gap.skill} evidence`, detail: guide, time: "Practice" },
      { title: `Document your ${gap.skill} result`, detail: `Write one accurate bullet that says what you personally did with ${gap.skill}. Add scope or an outcome only when you can support it with a real example or measurement.`, time: "Record" },
    ];
  });
}

export function analyze(resume: string, jd: string): Analysis {
  const requirements = TAXONOMY.flatMap(({ name, terms }) => {
    const mentions = skillOccurrences(jd, name, terms);
    if (!mentions) return [];
    const priority = priorityOf(jd, terms);
    const weight = priority === "required" ? 2 : 1;
    const evidence = evidenceFor(resume, name, terms);
    const requirementEvidence = requirementEvidenceFor(jd, name, terms);
    return [{ skill: name, weight, priority, found: Boolean(evidence), evidence, requirementEvidence }];
  });
  const matched: Skill[] = requirements.filter(item => item.found).map(({ skill, weight, evidence, requirementEvidence, priority }) => ({ skill, weight, evidence, requirementEvidence, priority })).sort((a, b) => b.weight - a.weight);
  const missing: Gap[] = requirements.filter(item => !item.found).map(({ skill, weight, priority, requirementEvidence }) => ({
    skill, weight, priority, requirementEvidence, severity: priority === "required" ? "critical" as const : "moderate" as const,
  })).sort((a, b) => Number(b.priority === "required") - Number(a.priority === "required") || b.weight - a.weight);
  const totalWeight = requirements.reduce((sum, item) => sum + item.weight, 0);
  const achievedWeight = requirements.filter(item => item.found).reduce((sum, item) => sum + item.weight, 0);
  const score = totalWeight ? Math.round((achievedWeight / totalWeight) * 100) : null;
  const jdSkills = requirements.map(item => item.skill);
  const extracted = extractBullets(resume);
  const bullets = extracted.bullets.map(line => rewriteBullet(line, jdSkills));
  const roadmap = buildRoadmap(missing);
  return { score, matched, missing, bullets, roadmap, requirementCount: requirements.length, matchedWeight: achievedWeight, totalWeight, incompleteBullets: extracted.incompleteCount };
}

/** Applies the user's review decisions and recalculates only the skill coverage metrics. */
export function applySkillFeedback(data: Analysis, feedback: SkillFeedback): Analysis {
  if (!Object.keys(feedback).length) return data;
  const candidates = [
    ...data.matched.map(skill => ({ ...skill, found: true, severity: undefined as Gap["severity"] | undefined })),
    ...data.missing.map(skill => ({ ...skill, found: false })),
  ];
  const updated = candidates.map(skill => {
    const decision = feedback[skill.skill];
    const found = decision?.decision === "equivalent"
      || decision?.decision === "confirmed"
      || (skill.found && decision?.decision !== "rejected");
    return {
      ...skill,
      found,
      evidence: decision?.decision === "equivalent" ? decision.evidence : skill.evidence,
    };
  });
  const matched = updated.filter(skill => skill.found).map(({ found: _found, severity: _severity, ...skill }) => skill).sort((a, b) => b.weight - a.weight);
  const missing: Gap[] = updated.filter(skill => !skill.found).map(({ found: _found, evidence: _evidence, severity: _severity, ...skill }) => ({
    ...skill,
    severity: skill.priority === "required" ? "critical" as const : "moderate" as const,
  })).sort((a, b) => Number(b.priority === "required") - Number(a.priority === "required") || b.weight - a.weight);
  const matchedWeight = matched.reduce((sum, skill) => sum + skill.weight, 0);
  return {
    ...data,
    matched,
    missing,
    roadmap: buildRoadmap(missing),
    matchedWeight,
    score: data.totalWeight ? Math.round((matchedWeight / data.totalWeight) * 100) : null,
  };
}
