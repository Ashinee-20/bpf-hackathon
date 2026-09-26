"use client";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles } from "lucide-react";

export function LandingActions() {
  const router = useRouter();
  async function demo() { await fetch("/api/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "start_demo" }) }); router.push("/app/careers"); }
  return <div className="actions"><button className="btn btn-primary" onClick={() => router.push("/onboarding")}>Build my plan <ArrowRight size={17}/></button><button className="btn" onClick={demo}><Sparkles size={16}/> Open synthetic demo</button></div>;
}

