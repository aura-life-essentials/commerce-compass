import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff, 
  Users, 
  Monitor,
  Smartphone,
  Globe,
  Sparkles,
  Camera,
  Volume2,
  VolumeX
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useMetaverse } from '@/hooks/useMetaverse';
import { toast } from 'sonner';

interface Participant {
  id: string;
  name: string;
  device: 'desktop' | 'mobile' | 'tablet';
  isSpeaking: boolean;
  isMuted: boolean;
  videoEnabled: boolean;
  avatarUrl?: string;
}

// Simulated participants for demo
const mockParticipants: Participant[] = [
  { id: '1', name: 'Alex Chen', device: 'mobile', isSpeaking: false, isMuted: false, videoEnabled: true },
  { id: '2', name: 'Sarah Kim', device: 'desktop', isSpeaking: true, isMuted: false, videoEnabled: true },
  { id: '3', name: 'Marcus Johnson', device: 'mobile', isSpeaking: false, isMuted: true, videoEnabled: false },
];

export function LiveAvatarCall() {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const { enterSpace, leaveSpace, spaces } = useMetaverse();
  
  // Get the main office space
  const mainOffice = spaces.find(s => s.space_type === 'office');
  
  const avatarName = 'blueoceanfloor';

  const startCall = useCallback(async () => {
    setIsConnecting(true);
    
    try {
      // Request camera/mic permissions
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      streamRef.current = stream;
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      // Enter metaverse space
      if (mainOffice) {
        enterSpace.mutate({
          spaceId: mainOffice.id,
          displayName: avatarName
        });
      }
      
      // Simulate connecting to other participants
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setParticipants(mockParticipants);
      setIsCallActive(true);
      setIsConnecting(false);
      
      toast.success('Connected! Others see you as your avatar "blueoceanfloor" in the metaverse');
    } catch (error) {
      console.error('Failed to start call:', error);
      setIsConnecting(false);
      toast.error('Failed to access camera/microphone');
    }
  }, [enterSpace, mainOffice]);

  const endCall = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (mainOffice) {
      leaveSpace.mutate(mainOffice.id);
    }
    setIsCallActive(false);
    setParticipants([]);
    toast.info('Call ended');
  }, [leaveSpace, mainOffice]);

  const toggleMute = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = isMuted;
        setIsMuted(!isMuted);
      }
    }
  };

  const toggleVideo = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoOn;
        setIsVideoOn(!isVideoOn);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case 'mobile': return Smartphone;
      case 'desktop': return Monitor;
      default: return Globe;
    }
  };

  if (!isCallActive) {
    return (
      <Card className="bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-cyan-900/20 border-purple-500/30">
        <CardContent className="py-12">
          <div className="text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center"
            >
              <div className="text-2xl font-bold text-white">🌊</div>
            </motion.div>
            
            <h3 className="text-2xl font-bold mb-2">Live Avatar Connection</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Connect with people on any device - they'll see you as your metaverse avatar <span className="text-cyan-400 font-semibold">"{avatarName}"</span> in real-time
            </p>
            
            <div className="flex items-center justify-center gap-6 mb-8">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Monitor className="w-4 h-4" />
                <span>Desktop</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Smartphone className="w-4 h-4" />
                <span>Mobile</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Globe className="w-4 h-4" />
                <span>Web</span>
              </div>
            </div>
            
            <Button
              onClick={startCall}
              disabled={isConnecting}
              size="lg"
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
            >
              {isConnecting ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="mr-2"
                  >
                    <Sparkles className="w-5 h-5" />
                  </motion.div>
                  Connecting...
                </>
              ) : (
                <>
                  <Video className="w-5 h-5 mr-2" />
                  Start Avatar Call
                </>
              )}
            </Button>
            
            <p className="text-xs text-muted-foreground mt-4">
              Your camera feed transforms into your 3D avatar for others to see
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-black/50 border-purple-500/30 overflow-hidden">
      <CardHeader className="border-b border-white/10 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            Live - {participants.length + 1} Connected
          </CardTitle>
          <Badge variant="outline" className="border-cyan-500 text-cyan-400">
            You: {avatarName}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {/* Main video grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 p-1">
          {/* Your video (local) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative aspect-video bg-gradient-to-br from-blue-900/50 to-cyan-900/50 rounded-lg overflow-hidden"
          >
            {isVideoOn ? (
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-3xl">
                  🌊
                </div>
              </div>
            )}
            
            {/* Avatar overlay */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute bottom-2 left-2 flex items-center gap-2">
                <Badge className="bg-black/60 backdrop-blur">
                  You ({avatarName})
                </Badge>
                {isMuted && <MicOff className="w-4 h-4 text-red-400" />}
              </div>
              
              {/* Avatar silhouette overlay */}
              <div className="absolute top-2 right-2">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/80 to-cyan-500/80 flex items-center justify-center backdrop-blur"
                >
                  <span className="text-lg">🌊</span>
                </motion.div>
              </div>
            </div>
          </motion.div>
          
          {/* Remote participants */}
          <AnimatePresence>
            {participants.map((participant, index) => {
              const DeviceIcon = getDeviceIcon(participant.device);
              
              return (
                <motion.div
                  key={participant.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative aspect-video bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-lg overflow-hidden ${
                    participant.isSpeaking ? 'ring-2 ring-green-500' : ''
                  }`}
                >
                  {participant.videoEnabled ? (
                    <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                      {/* Simulated video placeholder */}
                      <div className="text-center">
                        <Avatar className="w-16 h-16 mx-auto mb-2">
                          <AvatarImage src={participant.avatarUrl} />
                          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xl">
                            {participant.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Avatar className="w-20 h-20">
                        <AvatarImage src={participant.avatarUrl} />
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-2xl">
                          {participant.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  )}
                  
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                    <Badge className="bg-black/60 backdrop-blur flex items-center gap-1">
                      <DeviceIcon className="w-3 h-3" />
                      {participant.name}
                    </Badge>
                    <div className="flex items-center gap-1">
                      {participant.isMuted && <MicOff className="w-4 h-4 text-red-400" />}
                      {participant.isSpeaking && (
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 0.5, repeat: Infinity }}
                        >
                          <Volume2 className="w-4 h-4 text-green-400" />
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
        
        {/* Controls */}
        <div className="p-4 bg-black/80 border-t border-white/10">
          <div className="flex items-center justify-center gap-4">
            <Button
              variant={isMuted ? "destructive" : "secondary"}
              size="icon"
              className="rounded-full w-12 h-12"
              onClick={toggleMute}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </Button>
            
            <Button
              variant={!isVideoOn ? "destructive" : "secondary"}
              size="icon"
              className="rounded-full w-12 h-12"
              onClick={toggleVideo}
            >
              {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </Button>
            
            <Button
              variant="destructive"
              size="icon"
              className="rounded-full w-14 h-14"
              onClick={endCall}
            >
              <PhoneOff className="w-6 h-6" />
            </Button>
            
            <Button
              variant={!isSpeakerOn ? "destructive" : "secondary"}
              size="icon"
              className="rounded-full w-12 h-12"
              onClick={() => setIsSpeakerOn(!isSpeakerOn)}
            >
              {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </Button>
            
            <Button
              variant="secondary"
              size="icon"
              className="rounded-full w-12 h-12"
            >
              <Users className="w-5 h-5" />
            </Button>
          </div>
          
          <p className="text-center text-xs text-muted-foreground mt-3">
            Others see your avatar "blueoceanfloor" in the metaverse while talking to you
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
