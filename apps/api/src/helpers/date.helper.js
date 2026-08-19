export function formatDate(date = new Date()) {
  const d = new Date(date);

  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
}

export function formatTime(date = new Date()) {
  const d = new Date(date);

  return d.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit"
  });
}

export function formatDateTime(date = new Date()) {
  return `${formatDate(date)} ${formatTime(date)}`;
}