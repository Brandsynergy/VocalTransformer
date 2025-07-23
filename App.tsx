import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import { ThemeProvider } from "@/components/theme-provider";
import { useState, useEffect } from "react";
import LicenseVerify from "@/components/license-verify";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [isLicensed, setIsLicensed] = useState<boolean>(() => {
    // Check if we have a verified license in localStorage
    const licensed = localStorage.getItem('audioverter_licensed');
    return licensed === 'true';
  });

  const handleLicenseVerified = () => {
    setIsLicensed(true);
    localStorage.setItem('audioverter_licensed', 'true');
  };

  if (!isLicensed) {
    return (
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <LicenseVerify onVerified={handleLicenseVerified} />
          <Toaster />
        </QueryClientProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <Router />
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;