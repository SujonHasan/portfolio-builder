export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function buildEmailLookup(email: string) {
  const normalizedEmail = normalizeEmail(email);
  return {
    email: new RegExp(`^${escapeRegex(normalizedEmail)}$`, "i"),
  };
}
