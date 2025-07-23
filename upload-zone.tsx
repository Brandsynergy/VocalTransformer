import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

interface UploadZoneProps {
  sourceGender: 'male' | 'female';
  targetGender: 'male' | 'female';
}

export default function UploadZone({ sourceGender, targetGender }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('sourceGender', sourceGender);
      formData.append('targetGender', targetGender);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Upload successful",
        description: "Your file has been uploaded and is being converted",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/converted-songs'] });
    },
    onError: () => {
      toast({
        title: "Upload failed",
        description: "There was an error uploading your file",
        variant: "destructive",
      });
    }
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && file.type === 'audio/mpeg') {
      uploadMutation.mutate(file);
    } else {
      toast({
        title: "Invalid file",
        description: "Please upload an MP3 file",
        variant: "destructive",
      });
    }
  }, [uploadMutation, toast]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'audio/mpeg': ['.mp3']
    },
    multiple: false,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
    onDropAccepted: () => setIsDragging(false),
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card
        {...getRootProps()}
        className={`
          relative overflow-hidden group
          p-16 border-3 border-dashed cursor-pointer
          transition-all duration-300 ease-in-out
          ${isDragging 
            ? 'border-blue-500 bg-blue-50/50 scale-[1.02]' 
            : 'border-slate-200 hover:border-blue-400/50 hover:bg-slate-50/80'
          }
          backdrop-blur-sm
        `}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-slate-50/0 to-blue-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-8 relative z-10">
          <motion.div
            animate={{
              scale: uploadMutation.isPending ? [1, 1.1, 1] : 1,
              rotate: uploadMutation.isPending ? 360 : 0,
            }}
            transition={{
              duration: 2,
              repeat: uploadMutation.isPending ? Infinity : 0,
              ease: "easeInOut",
            }}
          >
            {uploadMutation.isPending ? (
              <Loader2 className="w-24 h-24 text-blue-500" />
            ) : (
              <Upload className="w-24 h-24 text-blue-500/80" />
            )}
          </motion.div>
          <div className="text-center space-y-3">
            <h3 className="text-3xl font-semibold text-slate-800">
              {uploadMutation.isPending 
                ? "Uploading..."
                : "Drop MP3 here or click to upload"
              }
            </h3>
            <p className="text-xl text-slate-500 font-medium">MP3 files only</p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}