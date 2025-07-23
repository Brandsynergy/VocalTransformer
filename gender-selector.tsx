import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { UserSquare, Heart } from "lucide-react";

interface GenderSelectorProps {
  title: string;
  selected: 'male' | 'female';
  onSelect: (gender: 'male' | 'female') => void;
}

export default function GenderSelector({ title, selected, onSelect }: GenderSelectorProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-semibold text-slate-800 dark:text-slate-200">{title}</h3>
      <div className="flex gap-6">
        <Button
          variant={selected === 'male' ? 'default' : 'outline'}
          className={`
            flex-1 py-8 text-xl font-medium gap-3 relative overflow-hidden
            transition-all duration-300 ease-out
            ${selected === 'male' 
              ? 'bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white shadow-lg shadow-blue-500/20' 
              : 'hover:bg-slate-100 border-2 hover:border-blue-200'
            }
          `}
          onClick={() => onSelect('male')}
        >
          <UserSquare className={`w-6 h-6 ${selected === 'male' ? 'text-white' : 'text-blue-600'}`} />
          Male
          {selected === 'male' && (
            <motion.div
              layoutId="genderHighlight"
              className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
              initial={false}
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
        </Button>
        <Button
          variant={selected === 'female' ? 'default' : 'outline'}
          className={`
            flex-1 py-8 text-xl font-medium gap-3 relative overflow-hidden
            transition-all duration-300 ease-out
            ${selected === 'female' 
              ? 'bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white shadow-lg shadow-blue-500/20' 
              : 'hover:bg-slate-100 border-2 hover:border-blue-200'
            }
          `}
          onClick={() => onSelect('female')}
        >
          <Heart className={`w-6 h-6 ${selected === 'female' ? 'text-white' : 'text-blue-600'}`} />
          Female
          {selected === 'female' && (
            <motion.div
              layoutId="genderHighlight"
              className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
              initial={false}
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
        </Button>
      </div>
    </div>
  );
}