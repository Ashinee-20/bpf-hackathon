import { lookup } from "node:dns/promises";
import type { Opportunity } from "./types";

const API = "https://api.firecrawl.dev/v2";

function privateIp(address: string) {
  return /^(127\.|10\.|0\.|169\.254\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|::1$|fc|fd|fe80)/i.test(address);
}

export async function validatePublicUrl(input: string): Promise<URL> {
  const url = new URL(input);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw new Error("Only public HTTP(S) URLs are supported.");
  const records = await lookup(url.hostname, { all: true });
  if (!records.length || records.some((record) => privateIp(record.address))) throw new Error("Private or local destinations are not allowed.");
  return url;
}

async function firecrawl(path: string, body: unknown) {
  const key = process.env.FIRECRAWL_API_KEY;
  if (!key) throw new Error("Firecrawl is not configured. Add FIRECRAWL_API_KEY.");
  const response = await fetch(`${API}${path}`, {
    method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify(body), signal: AbortSignal.timeout(25_000),
  });
  if (!response.ok) throw new Error(`Firecrawl request failed (${response.status}).`);
  return await response.json() as Record<string, unknown>;
}

export async function scrapePublicPage(input: string): Promise<{ markdown: string; title?: string }> {
  const url = await validatePublicUrl(input);
  const result = await firecrawl("/scrape", { url: url.toString(), formats: ["markdown"], onlyMainContent: true, timeout: 20000 });
  const data = (result.data ?? result) as Record<string, unknown>;
  const metadata = (data.metadata ?? {}) as Record<string, unknown>;
  return { markdown: String(data.markdown ?? "").slice(0, 200_000), title: metadata.title ? String(metadata.title) : undefined };
}

export async function discoverOpportunities(paths: string[]): Promise<Opportunity[]> {
  const intent = paths.length ? paths.join(" OR ") : "student technology";
  const query = `${intent} hackathon competition conference call for papers startup pitch internship India official 2026 2027`;
  const result = await firecrawl("/search", { query, limit: 8, sources: ["web"], scrapeOptions: { formats: ["markdown"], onlyMainContent: true } });
  const data = (result.data ?? result) as Record<string, unknown>;
  const raw = (Array.isArray(data.web) ? data.web : Array.isArray(result.web) ? result.web : Array.isArray(result.data) ? result.data : []) as Array<Record<string, unknown>>;
  const seen = new Set<string>();
  return raw.flatMap((item, index) => {
    const officialUrl = String(item.url ?? item.sourceURL ?? "");
    if (!officialUrl || seen.has(officialUrl)) return [];
    seen.add(officialUrl);
    return [{
      id: `firecrawl-${Buffer.from(officialUrl).toString("base64url").slice(0, 24)}-${index}`,
      title: String(item.title ?? "Opportunity discovered on the web"), organizer: new URL(officialUrl).hostname.replace(/^www\./, ""),
      category: "Discovered opportunity", paths, why: String(item.description ?? "Matches your active path search terms.").slice(0, 240), officialUrl,
      mode: null, dates: null, deadline: null, eligibility: null, fees: null,
      status: "unverified", eligibilityState: "needs_information", checkedAt: new Date().toISOString(),
    } satisfies Opportunity];
  });
}

