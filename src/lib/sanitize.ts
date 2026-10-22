export function cleanText(value: unknown) {
  return stripControls(value).replace(/\s+/g, " ").trim();
}

export function cleanMultiline(value: unknown) {
  return stripControls(value, true)
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function stripControls(value: unknown, keepNewlines = false) {
  let result = "";
  const text = String(value ?? "");
  for (const character of text) {
    const code = character.charCodeAt(0);
    const isNewline = character === "\n" || character === "\r";
    if (code === 127 || (code < 32 && !(keepNewlines && isNewline))) continue;
    result += character;
  }
  return result;
}
