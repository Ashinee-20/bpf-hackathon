import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "Pathwise · Academic & career guidance", description: "Evidence-aware academic and career guidance for computing students." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" data-scroll-behavior="smooth"><body>{children}</body></html>;
}
