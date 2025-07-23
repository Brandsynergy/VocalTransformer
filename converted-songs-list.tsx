import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Download, PlayCircle, PauseCircle, Loader2, Mic2, Timer, Trash2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

interface ConvertedSong {
  id: number;
  originalName: string;
  convertedUrl: string | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
}

export default function ConvertedSongsList() {
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [speeds, setSpeeds] = useState<Record<number, number>>({});
  const [songToDelete, setSongToDelete] = useState<ConvertedSong | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: songs = [], isLoading } = useQuery<ConvertedSong[]>({
    queryKey: ['/api/converted-songs'],
    refetchInterval: 2000,
  });

  // Cleanup audio when component unmounts or when changing songs
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };
  }, []);

  const togglePlay = async (song: ConvertedSong) => {
    if (!song.convertedUrl) return;

    try {
      if (playingId === song.id && audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
        setPlayingId(null);
      } else {
        // Cleanup previous audio if exists
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.src = '';
          audioRef.current = null;
        }

        const audio = new Audio();
        audio.src = song.convertedUrl;
        audio.playbackRate = speeds[song.id] || 1;

        // Set up event handlers before playing
        audio.onerror = () => {
          toast({
            title: "Playback Error",
            description: "Failed to play the audio file",
            variant: "destructive",
          });
          setPlayingId(null);
          audioRef.current = null;
        };

        audio.onended = () => {
          setPlayingId(null);
          audioRef.current = null;
        };

        // Start playback
        try {
          await audio.play();
          audioRef.current = audio;
          setPlayingId(song.id);
        } catch (error) {
          console.error('Playback error:', error);
          toast({
            title: "Playback Error",
            description: "Failed to start audio playback",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Audio operation error:', error);
      toast({
        title: "Error",
        description: "An error occurred during audio playback",
        variant: "destructive",
      });
    }
  };

  const handleSpeedChange = (songId: number, speed: string) => {
    const newSpeed = parseFloat(speed);
    setSpeeds(prev => ({ ...prev, [songId]: newSpeed }));
    if (playingId === songId && audioRef.current) {
      audioRef.current.playbackRate = newSpeed;
    }
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/converted-songs/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to delete audio' }));
        throw new Error(errorData.message || 'Failed to delete audio');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Audio deleted",
        description: "The audio has been deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/converted-songs'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete the audio",
        variant: "destructive",
      });
    }
  });

  const handleDownload = (song: ConvertedSong, speed: number) => {
    if (!song.convertedUrl) return;

    const link = document.createElement('a');
    link.href = `/api/download/${song.id}/${speed}`;
    link.download = `speed_adjusted_${song.originalName}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-2xl font-semibold text-slate-800 dark:text-slate-200">Converted Audio</h3>
        <Card className="p-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <div className="h-24 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        </Card>
      </div>
    );
  }

  if (songs.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-2xl font-semibold text-slate-800 dark:text-slate-200">Converted Audio</h3>
        <Card className="p-12 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <div className="flex flex-col items-center justify-center gap-4">
            <Mic2 className="h-12 w-12 text-slate-400 dark:text-slate-600" />
            <p className="text-lg text-slate-600 dark:text-slate-400 font-medium">No converted audio yet</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-semibold text-slate-800 dark:text-slate-200">Converted Audio</h3>
      <Card className="divide-y divide-slate-100 dark:divide-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm overflow-hidden">
        <AnimatePresence initial={false}>
          {songs.map((song) => (
            <motion.div
              key={song.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="p-6 grid grid-cols-[auto,1fr,auto] gap-6 items-center hover:bg-slate-50/80 dark:hover:bg-slate-800/50 group"
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={() => togglePlay(song)}
                className={`
                  h-12 w-12 rounded-xl transition-all duration-300
                  ${playingId === song.id ? 'bg-blue-500 text-white hover:bg-blue-600' : 'hover:bg-blue-50 dark:hover:bg-blue-900/50'}
                `}
                disabled={!song.convertedUrl}
              >
                {song.status === 'processing' ? (
                  <Loader2 className="h-8 w-8 animate-spin" />
                ) : playingId === song.id ? (
                  <PauseCircle className="h-8 w-8" />
                ) : (
                  <PlayCircle className="h-8 w-8" />
                )}
              </Button>

              <div className="space-y-2">
                <span className="font-medium block text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {song.originalName}
                </span>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {new Date(song.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  {song.status === 'processing' && (
                    <div className="flex-grow">
                      <div className="flex items-center gap-3">
                        <Progress value={33} className="h-2" />
                        <span className="text-sm font-medium text-blue-500 animate-pulse whitespace-nowrap">
                          Converting...
                        </span>
                      </div>
                    </div>
                  )}
                  {song.status === 'failed' && (
                    <span className="text-sm font-medium text-red-500">Conversion failed</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Timer className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                  <Select
                    value={String(speeds[song.id] || 1)}
                    onValueChange={(value) => handleSpeedChange(song.id, value)}
                  >
                    <SelectTrigger className="w-[110px] h-9">
                      <SelectValue placeholder="Speed" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.5">0.5x Speed</SelectItem>
                      <SelectItem value="0.75">0.75x Speed</SelectItem>
                      <SelectItem value="1">1x Speed</SelectItem>
                      <SelectItem value="1.25">1.25x Speed</SelectItem>
                      <SelectItem value="1.5">1.5x Speed</SelectItem>
                      <SelectItem value="2">2x Speed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {song.convertedUrl && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-12 w-12 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/50"
                    onClick={() => handleDownload(song, speeds[song.id] || 1)}
                  >
                    <Download className="h-6 w-6" />
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-12 w-12 rounded-xl hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/50"
                  onClick={() => setSongToDelete(song)}
                >
                  <Trash2 className="h-6 w-6" />
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </Card>

      <AlertDialog open={!!songToDelete} onOpenChange={() => setSongToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Audio</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{songToDelete?.originalName}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={() => {
                if (songToDelete) {
                  deleteMutation.mutate(songToDelete.id);
                  setSongToDelete(null);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}