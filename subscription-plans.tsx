import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, CreditCard } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface Plan {
  name: string;
  price: number;
  features: string[];
  stripePriceId?: string;
}

export default function SubscriptionPlans() {
  const { toast } = useToast();

  const { data: plans, isLoading } = useQuery<Record<string, Plan>>({
    queryKey: ['/api/subscription/plans'],
  });

  const checkoutMutation = useMutation({
    mutationFn: async (priceId: string) => {
      const response = await fetch('/api/subscription/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const data = await response.json();
      return data.url;
    },
    onSuccess: (url) => {
      window.location.href = url;
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to start checkout process",
        variant: "destructive",
      });
    },
  });

  if (isLoading || !plans) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
            <div className="space-y-2">
              {[...Array(4)].map((_, j) => (
                <div key={j} className="h-4 bg-slate-100 dark:bg-slate-800 rounded" />
              ))}
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold tracking-tight">Choose Your Plan</h2>
        <p className="text-lg text-slate-500 dark:text-slate-400">
          Select the perfect plan for your voice conversion needs
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Object.entries(plans).map(([key, plan]) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="relative p-6 space-y-6 overflow-hidden group hover:shadow-lg transition-shadow duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-transparent dark:from-blue-950/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="space-y-2 relative">
                <h3 className="text-2xl font-bold">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">${plan.price}</span>
                  {plan.price > 0 && (
                    <span className="text-slate-500 dark:text-slate-400">/month</span>
                  )}
                </div>
              </div>

              <ul className="space-y-3 relative">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-blue-500" />
                    <span className="text-slate-600 dark:text-slate-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="w-full relative group"
                size="lg"
                onClick={() => plan.stripePriceId && checkoutMutation.mutate(plan.stripePriceId)}
                disabled={!plan.stripePriceId || checkoutMutation.isPending}
              >
                <CreditCard className="mr-2 h-5 w-5" />
                {plan.price === 0 ? 'Current Plan' : 'Subscribe Now'}
              </Button>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
