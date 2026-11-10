function withProtocol(value: string): string | undefined {
  const trimmed = value.trim();
  if (trimmed === "") {
    return undefined;
  }
  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  if (!URL.canParse(candidate)) {
    return undefined;
  }
  const parsed = new URL(candidate);
  if ((parsed.protocol !== "https:" && parsed.protocol !== "http:") || !parsed.hostname.includes(".")) {
    return undefined;
  }
  return parsed.href;
}

export function phoneHref(phone: string): string | undefined {
  const digits = phone.replace(/[^\d+]/g, "");
  const normalized = digits.startsWith("+") ? `+${digits.slice(1).replaceAll("+", "")}` : digits.replaceAll("+", "");
  if (normalized.replace("+", "").length < 6) {
    return undefined;
  }
  return `tel:${normalized}`;
}

export function emailHref(email: string): string | undefined {
  const trimmed = email.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return undefined;
  }
  return `mailto:${trimmed}`;
}

export function websiteHref(website: string): string | undefined {
  return withProtocol(website);
}

export function linkedinHref(value: string): string | undefined {
  const trimmed = value.trim();
  if (trimmed === "") {
    return undefined;
  }
  if (/linkedin\.com/i.test(trimmed)) {
    return withProtocol(trimmed);
  }
  const handle = trimmed.replace(/^@/, "");
  if (!/^[\w-]+$/.test(handle)) {
    return undefined;
  }
  return `https://www.linkedin.com/in/${handle}`;
}

export function instagramHref(value: string): string | undefined {
  const trimmed = value.trim();
  if (trimmed === "") {
    return undefined;
  }
  if (/instagram\.com/i.test(trimmed)) {
    return withProtocol(trimmed);
  }
  const handle = trimmed.replace(/^@/, "");
  if (!/^[\w.]+$/.test(handle)) {
    return undefined;
  }
  return `https://www.instagram.com/${handle}`;
}
