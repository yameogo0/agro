"use client";

import { ReactNode } from "react";
import { PiAuthProvider } from "@/contexts/pi-auth-context";
import { ThemeProvider } from "@/components/ui/theme-provider";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <PiAuthProvider>
        {children}
      </PiAuthProvider>
    </ThemeProvider>
  );
}
