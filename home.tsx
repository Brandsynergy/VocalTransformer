import { Card } from "@/components/ui/card";
import UploadZone from "@/components/upload-zone";
import GenderSelector from "@/components/gender-selector";
import ConvertedSongsList from "@/components/converted-songs-list";
import PurchaseButton from "@/components/purchase-button";
import { useState } from "react";
import { useTheme } from "@/components/theme-provider";
import { motion } from "framer-motion";

export default function Home() {
  const [selectedGender, setSelectedGender] = useState<'male' | 'female'>('male');
  const [targetGender, setTargetGender] = useState<'male' | 'female'>('female');
  const { theme } = useTheme();

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50/50 via-slate-50/50 to-white dark:from-blue-950 dark:via-slate-900 dark:to-slate-950 py-12 px-4 transition-all duration-500">
      <motion.div 
        className="max-w-6xl mx-auto space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="text-center space-y-6" variants={itemVariants}>
          <div className="flex justify-center items-center gap-4 mb-8">
            <motion.img 
              src="/MediAd Logo2.PNG" 
              alt="MediAd Logo" 
              className="h-24 w-auto" 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <h1 className="text-6xl font-black tracking-tighter bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 dark:from-blue-300 dark:via-blue-400 dark:to-blue-500 bg-clip-text text-transparent inline-block drop-shadow-sm">
            MEDIAD AUDIOVERTER
          </h1>
          <p className="text-slate-700 dark:text-slate-300 text-xl font-medium">
            Transform any voice with professional-grade audio processing
          </p>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.12)] bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60 transition-all duration-300 hover:shadow-[0_8px_40px_rgb(0,0,0,0.16)]">
            <div className="space-y-12">
              <UploadZone 
                sourceGender={selectedGender}
                targetGender={targetGender}
              />

              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-950 dark:to-transparent opacity-50 pointer-events-none transition-opacity duration-300"></div>
                <div className="relative bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-blue-950/30 p-8 md:p-10 rounded-2xl shadow-inner border border-slate-100 dark:border-slate-800 transition-all duration-300">
                  <div className="grid md:grid-cols-2 gap-12">
                    <GenderSelector 
                      title="Change the vocals from"
                      selected={selectedGender}
                      onSelect={setSelectedGender}
                    />
                    <GenderSelector 
                      title="to"
                      selected={targetGender}
                      onSelect={setTargetGender}
                    />
                  </div>
                </div>
              </div>

              <ConvertedSongsList />
            </div>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.12)] bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60 transition-all duration-300 hover:shadow-[0_8px_40px_rgb(0,0,0,0.16)]">
            <PurchaseButton />
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}