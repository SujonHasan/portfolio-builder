const ALLOWED_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:"]);
const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "strong",
  "em",
  "u",
  "s",
  "ul",
  "ol",
  "li",
  "blockquote",
  "code",
  "pre",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "a",
]);

function escapeHtmlAttribute(value: string) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

export function sanitizeUrl(value?: string | null) {
  if (!value) return "";

  const trimmed = value.trim();
  if (!trimmed) return "";

  if (trimmed.startsWith("/") || trimmed.startsWith("#")) {
    return trimmed;
  }

  try {
    const url = new URL(trimmed);
    return ALLOWED_PROTOCOLS.has(url.protocol) ? trimmed : "";
  } catch {
    return "";
  }
}

function sanitizeAttributes(tag: string, rawAttributes: string) {
  if (tag !== "a") {
    return "";
  }

  const hrefMatch = rawAttributes.match(
    /\shref\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/i
  );
  const targetMatch = rawAttributes.match(
    /\starget\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/i
  );

  const hrefValue =
    hrefMatch?.[2] ?? hrefMatch?.[3] ?? hrefMatch?.[4] ?? "";
  const safeHref = sanitizeUrl(hrefValue);

  if (!safeHref) {
    return "";
  }

  const targetValue =
    targetMatch?.[2] ?? targetMatch?.[3] ?? targetMatch?.[4] ?? "";
  const safeTarget = targetValue === "_blank" ? ' target="_blank"' : "";
  const rel = safeTarget ? ' rel="noopener noreferrer"' : "";

  return ` href="${escapeHtmlAttribute(safeHref)}"${safeTarget}${rel}`;
}

export function sanitizeRichText(value?: string | null) {
  if (!value) return "";

  let sanitized = value;

  sanitized = sanitized.replace(/<!--[\s\S]*?-->/g, "");
  sanitized = sanitized.replace(
    /<\s*(script|style|iframe|object|embed|meta|link|base)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi,
    ""
  );
  sanitized = sanitized.replace(
    /<\s*(script|style|iframe|object|embed|meta|link|base)[^>]*\/?>/gi,
    ""
  );
  sanitized = sanitized.replace(/\s+on[a-z]+\s*=\s*(".*?"|'.*?'|[^\s>]+)/gi, "");
  sanitized = sanitized.replace(/\s+style\s*=\s*(".*?"|'.*?'|[^\s>]+)/gi, "");

  sanitized = sanitized.replace(/<\/?([a-z0-9-]+)([^>]*)>/gi, (match, tagName, rawAttributes) => {
    const tag = String(tagName).toLowerCase();

    if (!ALLOWED_TAGS.has(tag)) {
      return "";
    }

    if (match.startsWith("</")) {
      return `</${tag}>`;
    }

    const safeAttributes = sanitizeAttributes(tag, String(rawAttributes));
    return `<${tag}${safeAttributes}>`;
  });

  return sanitized.trim();
}

export function stripHtml(value?: string | null) {
  if (!value) return "";

  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h1|h2|h3|h4|h5|h6|blockquote)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
