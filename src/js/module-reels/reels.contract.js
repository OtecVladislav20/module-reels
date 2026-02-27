export function normalizeReels(raw) {
  return {
    id: String(raw.id ?? crypto.randomUUID()),
    title: String(raw.title ?? ''),
    subtitle: String(raw.subtitle ?? ''),
    text: String(raw.text ?? ''),
    avatar: String(raw.avatar ?? ''),
    items: Array.isArray(raw.items)
      ? raw.items
          .map((i) => ({
            src: String(i.src ?? ''),
            duration: Number(i.duration ?? 5000),
            poster: i.poster ? String(i.poster) : null,
          }))
          .filter((i) => i.src)
      : [],
  };
}
