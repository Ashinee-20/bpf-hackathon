import { after, NextResponse } from "next/server";
import { scrapePublicPage } from "@/lib/firecrawl";
import { sessionId } from "@/lib/session";
import { loadState, saveState } from "@/lib/store";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  const id = await sessionId(); const state = await loadState(id); const form = await request.formData();
  const url = String(form.get("url") ?? "").trim(); const file = form.get("file"); const type = String(form.get("type") ?? "curriculum");
  if (!url && !(file instanceof File)) return NextResponse.json({ code: "DOCUMENT_REQUIRED", message: "Provide a public URL or PDF file.", retryable: false }, { status: 400 });
  if (!url && file instanceof File && (file.type !== "application/pdf" || file.size > 10 * 1024 * 1024)) return NextResponse.json({ code: "INVALID_FILE", message: "Upload a text-based PDF no larger than 10 MB.", retryable: false }, { status: 400 });

  const documentId = crypto.randomUUID(); const jobId = crypto.randomUUID(); const now = new Date().toISOString();
  const fileBytes = !url && file instanceof File ? new Uint8Array(await file.arrayBuffer()) : undefined;
  state.documents.push({ id: documentId, name: file instanceof File ? file.name : url, type, scope: type === "curriculum" ? "public" : "private", status: "queued", source: url || undefined, message: "Queued for background processing.", addedAt: now });
  state.jobs.push({ id: jobId, type: "document", stage: "queued", status: "queued", targetId: documentId, createdAt: now, updatedAt: now });
  state.version += 1; await saveState(id, state);

  after(async () => {
    try {
      await mark(id, jobId, documentId, "reading", "processing", "Reading source in the background…");
      let text = ""; let resolvedName: string | undefined;
      if (url) { const page = await scrapePublicPage(url); text = page.markdown; resolvedName = page.title; }
      else if (fileBytes) {
        const { PDFParse } = await import("pdf-parse"); const parser = new PDFParse({ data: fileBytes });
        try { text = (await parser.getText({ first: 50 })).text; } finally { await parser.destroy(); }
      }
      await mark(id, jobId, documentId, "validating", "processing", "Text extracted; validating readiness…", resolvedName);
      const finalStatus = text.trim().length > 150 ? "ready" : "partial";
      await mark(id, jobId, documentId, "complete", finalStatus, finalStatus === "ready" ? "Text extracted. Academic claims still require student review before use." : "Little or no text was found. This may be an image-only PDF; OCR is not configured.", resolvedName);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Document processing failed";
      await mark(id, jobId, documentId, "failed", "failed", message);
    }
  });

  return NextResponse.json({ state, jobId, documentId, message: "Upload accepted. You can keep using Pathwise; a notification will appear when processing finishes." }, { status: 202 });
}

async function mark(session: string, jobId: string, documentId: string, stage: string, status: "processing"|"ready"|"partial"|"failed", message: string, resolvedName?: string) {
  const latest = await loadState(session); const job = latest.jobs.find((item) => item.id === jobId); const document = latest.documents.find((item) => item.id === documentId);
  if (job) { job.stage = stage; job.status = status; job.updatedAt = new Date().toISOString(); if(status === "failed")job.error = message; }
  if (document) { document.status = status; document.message = message; if(resolvedName)document.name = resolvedName; }
  await saveState(session, latest);
}
