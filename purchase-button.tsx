import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function PurchaseButton() {
  const { toast } = useToast();

  const handlePurchase = () => {
    try {
      const GUMROAD_URL = "https://761671591635.gumroad.com/l/tfclja";
      window.open(GUMROAD_URL, '_blank');
    } catch (error) {
      toast({
        title: "Error",
        description: "Unable to open purchase page. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold tracking-tight">Get Full Access</h2>
        <p className="text-lg text-slate-500 dark:text-slate-400">
          Transform your voice with professional-grade audio processing
        </p>
      </div>

      <div className="flex justify-center">
        <Button
          size="lg"
          className="px-8 py-6 text-lg font-semibold relative group bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:to-blue-800"
          onClick={handlePurchase}
        >
          <ShoppingCart className="mr-2 h-5 w-5" />
          Buy Now - $20
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </Button>
      </div>

      <ul className="max-w-md mx-auto space-y-3 text-center">
        <li className="text-slate-600 dark:text-slate-300">✓ Unlimited voice conversions</li>
        <li className="text-slate-600 dark:text-slate-300">✓ Advanced voice customization</li>
        <li className="text-slate-600 dark:text-slate-300">✓ Priority processing</li>
        <li className="text-slate-600 dark:text-slate-300">✓ Download in multiple formats</li>
        <li className="text-slate-600 dark:text-slate-300">✓ Lifetime access</li>
      </ul>
    </div>
  );
}