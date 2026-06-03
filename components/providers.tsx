"use client";

import { ReactNode } from "react";
import { PiAuthProvider } from "@/contexts/pi-auth-context";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <TooltipProvider>
        <PiAuthProvider>
          {children}
          <Toaster />
        </PiAuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
}