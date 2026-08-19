export function mono(lines = []) {
  return [
    "```",
    ...lines,
    "```"
  ].join("\n");
}

export function divider() {
  return "━━━━━━━━━━━━━━";
}

export function field(label, value = "") {
  return `${label.padEnd(15)}: ${value}`;
}

export function blank() {
  return "";
}