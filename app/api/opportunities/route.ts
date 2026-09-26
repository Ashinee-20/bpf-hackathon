import { after, NextResponse } from "next/server";
import { EVERGREEN_OPPORTUNITIES } from "@/lib/catalog";
import { discoverOpportunities } from "@/lib/firecrawl";
import { preparationChecklist } from "@/lib/ai";
import { sessionId } from "@/lib/session";
import { loadState, saveState } from "@/lib/store";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET() {
  const state = await loadState(await sessionId());
  return NextResponse.json({ opportunities: state.opportunities.length ? state.opportunities : EVERGREEN_OPPORTUNITIES, source: state.opportunities.length ? "firecrawl_live" : "labeled_fixture" });
}

export async function POST(request: Request) {
  const id = await sessionId(); const state = await loadState(id); const body = await request.json() as { action: string; opportunity?: { id: string; title: string; eligibility: string | null } };
  if (body.action === "discover") {
    const jobId = crypto.randomUUID(); const now = new Date().toISOString(); const paths = state.paths.filter((path) => path.active).map((path) => path.label);
    state.jobs.push({ id: jobId, type: "opportunities", stage: "searching", status: "queued", createdAt: now, updatedAt: now }); state.version += 1; await saveState(id, state);
    after(async () => {
      try { await updateJob(id, jobId, "searching official pages", "processing"); const items = await discoverOpportunities(paths); const latest = await loadState(id); latest.opportunities = items; const job = latest.jobs.find((item) => item.id === jobId); if(job){job.stage="complete";job.status="ready";job.updatedAt=new Date().toISOString()} await saveState(id,latest); }
      catch(error){await updateJob(id,jobId,"failed","failed",error instanceof Error?error.message:"Discovery failed")}
    });
    return NextResponse.json({ state, jobId, message: "Live discovery is running in the background. You can continue using Pathwise." }, { status: 202 });
  }
  if (!body.opportunity) return NextResponse.json({ message: "Opportunity is required." }, { status: 400 });
  if (body.action === "prepare") {
    const jobId=crypto.randomUUID();const now=new Date().toISOString();state.jobs.push({id:jobId,type:"preparation",stage:"preparing",status:"queued",targetId:body.opportunity.id,createdAt:now,updatedAt:now});state.version+=1;await saveState(id,state);
    after(async()=>{try{await updateJob(id,jobId,"building checklist","processing");const checklist=await preparationChecklist(body.opportunity!.title,body.opportunity!.eligibility);const latest=await loadState(id);latest.preparationPlans[body.opportunity!.id]=checklist;const job=latest.jobs.find((item)=>item.id===jobId);if(job){job.stage="complete";job.status="ready";job.updatedAt=new Date().toISOString()}await saveState(id,latest)}catch(error){await updateJob(id,jobId,"failed","failed",error instanceof Error?error.message:"Preparation failed")}});
    return NextResponse.json({state,jobId,message:"Preparation checklist queued."},{status:202});
  }
  if (["saved", "dismissed"].includes(body.action)) state.savedOpportunities[body.opportunity.id] = body.action as "saved" | "dismissed";
  else return NextResponse.json({ message: "Unknown action" }, { status: 400 });
  state.version += 1; await saveState(id, state); return NextResponse.json(state);
}

async function updateJob(session:string,jobId:string,stage:string,status:"processing"|"failed",error?:string){const latest=await loadState(session);const job=latest.jobs.find((item)=>item.id===jobId);if(job){job.stage=stage;job.status=status;job.updatedAt=new Date().toISOString();job.error=error}await saveState(session,latest)}
