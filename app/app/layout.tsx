import { AppProvider } from "@/components/app-provider";
import { AppShell } from "@/components/app-shell";
export default function ProductLayout({children}:{children:React.ReactNode}){return <AppProvider><AppShell>{children}</AppShell></AppProvider>}

