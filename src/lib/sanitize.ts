// Lightweight client-side HTML sanitizer for rendering API-provided markup
// Allows a small, safe subset of tags and strips unsafe attributes.

export function sanitizeHtml(input: string): string {
  if (!input) return "";
  // DOM APIs only exist on the client
  if (typeof window === "undefined") return input;

  const parser = new DOMParser();
  const doc = parser.parseFromString(input, "text/html");

  // Remove obviously unsafe elements
  doc.querySelectorAll("script, style, iframe, object, embed").forEach((el) =>
    el.remove()
  );

  const allowed = new Set([
    "A",
    "P",
    "BR",
    "STRONG",
    "EM",
    "B",
    "I",
    "U",
    "UL",
    "OL",
    "LI",
  ]);

  const walker = (node: Element | ChildNode | null) => {
    if (!node || !(node as Element).querySelectorAll) return;
    const all = (node as Element).querySelectorAll("*");
    all.forEach((el) => {
      const tag = el.tagName.toUpperCase();

      if (!allowed.has(tag)) {
        // Unwrap disallowed element (preserve its children/text)
        const parent = el.parentNode;
        if (!parent) return;
        while (el.firstChild) parent.insertBefore(el.firstChild, el);
        parent.removeChild(el);
        return;
      }

      // Strip all attributes except safe ones
      Array.from(el.attributes).forEach((attr) => {
        const name = attr.name.toLowerCase();
        if (tag === "A" && name === "href") {
          const val = attr.value.trim();
          // Only allow http/https links
          if (!/^https?:/i.test(val)) {
            el.removeAttribute("href");
          } else {
            (el as HTMLAnchorElement).rel = "noreferrer noopener";
            (el as HTMLAnchorElement).target = "_blank";
          }
          return;
        }
        // Remove event handlers and everything else
        el.removeAttribute(name);
      });
    });
  };

  walker(doc.body);
  return doc.body.innerHTML;
}

