import { cookies } from "next/headers";

export async function sessionId(): Promise<string> {
  const jar = await cookies();
  const existing = jar.get("pathwise_session")?.value;
  if (existing) return existing;
  const id = crypto.randomUUID();
  jar.set("pathwise_session", id, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 24 * 90, path: "/" });
  return id;
}

