import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Key, Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";

interface LicenseVerifyProps {
  onVerified: () => void;
}

export default function LicenseVerify({ onVerified }: LicenseVerifyProps) {
  const [licenseKey, setLicenseKey] = useState("");
  const { toast } = useToast();

  const verifyMutation = useMutation({
    mutationFn: async (key: string) => {
      const response = await fetch('/api/verify-license', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ licenseKey: key }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "License Verified",
        description: "Welcome to MEDIAD AUDIOVERTER!",
      });
      onVerified();
    },
    onError: (error: Error) => {
      toast({
        title: "Verification Failed",
        description: error.message || "Please check your license key and try again",
        variant: "destructive",
      });
    },
  });

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!licenseKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter a license key",
        variant: "destructive",
      });
      return;
    }
    verifyMutation.mutate(licenseKey);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50/50 via-slate-50/50 to-white dark:from-blue-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4">
      <div className="max-w-xl w-full space-y-8">
        <div className="text-center space-y-6">
          <div className="flex justify-center items-center gap-4 mb-8">
            <img 
              src="/MediAd Logo2.PNG" 
              alt="MediAd Logo" 
              className="h-24 w-auto" 
            />
          </div>
          <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 dark:from-blue-300 dark:via-blue-400 dark:to-blue-500 bg-clip-text text-transparent">
            Activate Your License
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            Enter your Gumroad license key to access MEDIAD AUDIOVERTER
          </p>
        </div>

        <Card className="p-8 shadow-lg bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm">
          <form onSubmit={handleVerify} className="space-y-6">
            <div className="space-y-4">
              <Input
                type="text"
                placeholder="Enter your license key"
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value)}
                className="h-14 text-lg px-4"
              />
              <p className="text-sm text-slate-500 dark:text-slate-400">
                You can find your license key in the email from Gumroad after purchase
              </p>
            </div>
            <Button
              type="submit"
              className="w-full h-14 text-lg font-semibold relative group bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:to-blue-800"
              disabled={verifyMutation.isPending}
            >
              {verifyMutation.isPending ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  <Key className="mr-2 h-6 w-6" />
                  Verify License
                </>
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-base text-slate-600 dark:text-slate-400">
              Don't have a license yet?{" "}
              <Button
                variant="link"
                className="text-blue-600 dark:text-blue-400 font-semibold text-base"
                onClick={() => window.open("https://761671591635.gumroad.com/l/tfclja", "_blank")}
              >
                Purchase Now
              </Button>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}