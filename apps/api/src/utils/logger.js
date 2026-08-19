export function logInfo(...msg) {
  console.log("[INFO]", ...msg);
}

export function logWarn(...msg) {
  console.log("[WARN]", ...msg);
}

export function logError(...msg) {
  console.log("[ERROR]", ...msg);
}

export function logApi(title, data) {
  console.log(`========== ${title} ==========`);

  console.dir(data, {
    depth: null
  });

  console.log("==============================");
}