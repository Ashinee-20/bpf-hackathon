"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { AppState } from "@/lib/types";

type Context = { state?: AppState; loading: boolean; error: string; mutate: (action: string, payload?: unknown) => Promise<AppState | undefined>; refresh: (showLoading?: boolean) => Promise<void> };
const AppContext = createContext<Context | null>(null);
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const refresh = useCallback(async (showLoading = false) => { if(showLoading)setLoading(true); const response = await fetch("/api/session", { cache: "no-store" }); const data = await response.json(); setState(data); setLoading(false); }, []);
  useEffect(() => { refresh(true).catch((e)=>{setError(e.message);setLoading(false);}); }, [refresh]);
  const mutate = useCallback(async (action: string, payload?: unknown) => { setError(""); const response = await fetch("/api/session", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({action,payload,baseVersion:state?.version}) }); const data=await response.json(); if(!response.ok){setError(data.message);return;} setState(data); return data as AppState; }, [state?.version]);
  const value=useMemo(()=>({state,loading,error,mutate,refresh}),[state,loading,error,mutate,refresh]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
export function useApp(){const context=useContext(AppContext);if(!context)throw new Error("useApp must be inside AppProvider");return context;}
