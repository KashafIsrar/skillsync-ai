const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");

const root = path.resolve(__dirname, "..");
const enginePath = path.join(root, "lib", "engine.ts");
const engineSource = fs.readFileSync(enginePath, "utf8");
const compiled = ts.transpileModule(engineSource, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const engineModule = new Module(enginePath, module);
engineModule.filename = enginePath;
engineModule.paths = Module._nodeModulePaths(path.dirname(enginePath));
engineModule._compile(compiled, enginePath);
const { analyze, applySkillFeedback } = engineModule.exports;
const examples = JSON.parse(fs.readFileSync(path.join(root, "lib", "matcher-evaluation.json"), "utf8"));
const formattingPath = path.join(root, "lib", "resume-format.ts");
const formattingSource = fs.readFileSync(formattingPath, "utf8");
const formattingCompiled = ts.transpileModule(formattingSource, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const formattingModule = new Module(formattingPath, module);
formattingModule.filename = formattingPath;
formattingModule.paths = Module._nodeModulePaths(path.dirname(formattingPath));
formattingModule._compile(formattingCompiled, formattingPath);
const { cleanPdfText, cleanUploadedResumeText, formatPdfPageText } = formattingModule.exports;

let truePositive = 0;
let falsePositive = 0;
let falseNegative = 0;
const failures = [];

for (const example of examples) {
  const actual = analyze(example.resume, example.jobDescription).matched.map(item => item.skill).sort();
  const expected = [...example.expectedMatched].sort();
  for (const skill of actual) expected.includes(skill) ? truePositive++ : falsePositive++;
  for (const skill of expected) if (!actual.includes(skill)) falseNegative++;
  if (JSON.stringify(actual) !== JSON.stringify(expected)) failures.push({ name: example.name, expected, actual });
}

const scoringExample = analyze("Built a React application.", "React is required. React is mentioned again. SQL is preferred.");
if (scoringExample.totalWeight !== 3 || scoringExample.matchedWeight !== 2 || scoringExample.score !== 67) {
  failures.push({ name: "Repeated mentions do not inflate score", expected: [67, 2, 3], actual: [scoringExample.score, scoringExample.matchedWeight, scoringExample.totalWeight] });
}
const reactRequirement = scoringExample.matched.find(skill => skill.skill === "React");
const sqlRequirement = scoringExample.missing.find(skill => skill.skill === "SQL");
if (reactRequirement?.priority !== "required" || reactRequirement.requirementEvidence !== "React is required." || reactRequirement.evidence !== "Built a React application.") {
  failures.push({
    name: "Matched skill shows its job-description evidence",
    expected: ["required", "React is required.", "Built a React application."],
    actual: [reactRequirement?.priority, reactRequirement?.requirementEvidence, reactRequirement?.evidence],
  });
}
if (sqlRequirement?.priority !== "preferred" || sqlRequirement.requirementEvidence !== "SQL is preferred.") {
  failures.push({
    name: "Missing skill shows its job-description evidence",
    expected: ["preferred", "SQL is preferred."],
    actual: [sqlRequirement?.priority, sqlRequirement?.requirementEvidence],
  });
}
const corrected = applySkillFeedback(scoringExample, { SQL: { decision: "equivalent", evidence: "Used PostgreSQL to query project data." } });
if (corrected.score !== 100 || corrected.matched.find(skill => skill.skill === "SQL")?.evidence !== "Used PostgreSQL to query project data." || corrected.matched.find(skill => skill.skill === "SQL")?.requirementEvidence !== "SQL is preferred.") {
  failures.push({
    name: "Equivalent experience feedback updates score and preserves requirement evidence",
    expected: [100, "Used PostgreSQL to query project data.", "SQL is preferred."],
    actual: [corrected.score, corrected.matched.find(skill => skill.skill === "SQL")?.evidence, corrected.matched.find(skill => skill.skill === "SQL")?.requirementEvidence],
  });
}
const rejected = applySkillFeedback(scoringExample, { React: { decision: "rejected" } });
if (rejected.score !== 0 || rejected.missing.every(gap => gap.skill !== "React")) {
  failures.push({ name: "Rejecting a false match updates score and gap list", expected: [0, true], actual: [rejected.score, rejected.missing.some(gap => gap.skill === "React")] });
}
const noRecognizedSkills = analyze("Built a personal project with clear documentation.", "Clear communication and curiosity are important.");
if (noRecognizedSkills.score !== null || noRecognizedSkills.requirementCount !== 0) {
  failures.push({ name: "Unrecognized job text does not produce a misleading score", expected: [null, 0], actual: [noRecognizedSkills.score, noRecognizedSkills.requirementCount] });
}
const reconstructedPdf = formatPdfPageText([
  { str: "Frontend Engineer", transform: [1, 0, 0, 1, 12, 90], width: 92 },
  { str: "Reyes", transform: [1, 0, 0, 1, 49, 100], width: 30 },
  { str: "Jordan", transform: [1, 0, 0, 1, 12, 100], width: 35 },
]);
if (reconstructedPdf !== "Jordan Reyes\nFrontend Engineer") {
  failures.push({ name: "PDF text is sorted into readable visual lines", expected: "Jordan Reyes\\nFrontend Engineer", actual: reconstructedPdf });
}
const cleanedPdf = cleanPdfText("S O F T W A R E\nexperi-\nence");
if (cleanedPdf !== "SOFTWARE\nexperi-ence") {
  failures.push({ name: "PDF headings and line-wrapped hyphenation are normalized", expected: "SOFTWARE\\nexperi-ence", actual: cleanedPdf });
}
const cleanedUpload = cleanUploadedResumeText("Jordan Reyes \r\n\r\n\r\nFrontend Engineer  \r\n");
if (cleanedUpload !== "Jordan Reyes\n\nFrontend Engineer") {
  failures.push({ name: "Uploaded text preserves paragraphs without excess blank lines", expected: "Jordan Reyes\\n\\nFrontend Engineer", actual: cleanedUpload });
}

const precision = truePositive + falsePositive ? truePositive / (truePositive + falsePositive) : 1;
const recall = truePositive + falseNegative ? truePositive / (truePositive + falseNegative) : 1;
const f1 = precision + recall ? 2 * precision * recall / (precision + recall) : 0;
console.log(`Matcher evaluation: ${examples.length} labeled examples`);
console.log(`Skill labels: ${truePositive + falsePositive + falseNegative} | TP ${truePositive} | FP ${falsePositive} | FN ${falseNegative}`);
console.log(`Precision ${(precision * 100).toFixed(1)}% | Recall ${(recall * 100).toFixed(1)}% | F1 ${(f1 * 100).toFixed(1)}%`);
for (const failure of failures) console.error(`FAIL ${failure.name}: expected [${failure.expected}], got [${failure.actual}]`);
if (!failures.length) console.log(`Passed ${examples.length + 9} matcher, scoring, evidence, formatting, and feedback checks.`);
if (failures.length) process.exitCode = 1;
