export type PdfTextItem = {
  str?: string;
  transform?: number[];
  width?: number;
  hasEOL?: boolean;
};

type PositionedText = {
  text: string;
  x: number;
  y: number;
  width: number;
};

export function cleanPdfText(text: string): string {
  const joined = text
    .replace(/\r/g, "")
    .replace(/(\w)-[ \t]*\n[ \t]*(?=[a-z])/g, "$1-");

  return joined
    .split("\n")
    .map(line => {
      const normalized = line.replace(/[ \t]+/g, " ").trim();
      const tokens = normalized.split(" ");
      const singleLetterRatio = tokens.filter(token => /^[A-Z]$/.test(token)).length / tokens.length;
      if (tokens.length >= 4 && singleLetterRatio >= 0.8) {
        return normalized.replace(/(?:^| )([A-Z](?: [A-Z]){2,})(?= |$)/g, (_match, spaced: string) => spaced.replace(/ /g, ""));
      }
      return normalized;
    })
    .filter(Boolean)
    .join("\n")
    .trim();
}

export function formatPdfPageText(items: PdfTextItem[]): string {
  const positioned: PositionedText[] = items.flatMap(item => {
    if (typeof item.str !== "string" || !item.transform || item.str.length === 0) return [];
    return [{
      text: item.str,
      x: item.transform[4] ?? 0,
      y: item.transform[5] ?? 0,
      width: item.width ?? 0,
    }];
  }).sort((a, b) => b.y - a.y || a.x - b.x);

  const rows: { y: number; items: PositionedText[] }[] = [];
  for (const item of positioned) {
    let row = rows[rows.length - 1];
    if (!row || Math.abs(row.y - item.y) > 2.5) {
      row = { y: item.y, items: [] };
      rows.push(row);
    }
    row.items.push(item);
  }

  const lines = rows.map(row => {
    const sorted = row.items.sort((a, b) => a.x - b.x);
    let line = "";
    let previous: PositionedText | undefined;
    for (const item of sorted) {
      if (
        previous &&
        !/\s$/.test(line) &&
        !/^\s/.test(item.text) &&
        item.x - (previous.x + previous.width) > 1.5
      ) {
        line += " ";
      }
      line += item.text;
      previous = item;
    }
    return line.trim();
  });

  return cleanPdfText(lines.join("\n"));
}

export function cleanUploadedResumeText(text: string): string {
  return text
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map(line => line.replace(/[ \t]+$/g, ""))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
