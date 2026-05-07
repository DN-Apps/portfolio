export function splitPipeList(value?: string): string[] {
  // Einige Texte kommen aus den JSON-Dateien als Pipe-Liste, weil das die
  // Übersetzung kompakt hält und trotzdem im UI zu Tags/Listen wird.
  if (!value) {
    return [];
  }

  return value
    .split("|")
    .map((item) => item.replace(/[\u0000-\u001F\u007F]/g, "").trim())
    .filter(Boolean);
}
