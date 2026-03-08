import { useState } from "react";
import { Volume2, VolumeX, Mic, MicOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAIVoice } from "@/hooks/useAIVoice";
import { toast } from "sonner";

export const VoiceControlPanel = () => {
  const { speak, stop, isSpeaking, isLoading } = useAIVoice();
  const [lastMessage, setLastMessage] = useState("");

  const testPhrases = [
    "All systems nominal. Revenue engines are online and processing.",
    "Bot swarm deployed. 200 agents active across all sectors.",
    "Alert: New high-value opportunity detected. Confidence score 94 percent.",
    "Daily report: Revenue up 12 percent. 47 orders auto-fulfilled.",
  ];

  const handleSpeak = () => {
    const phrase = testPhrases[Math.floor(Math.random() * testPhrases.length)];
    setLastMessage(phrase);
    speak(phrase);
  };

  return (
    <div className="glass rounded-xl p-4 flex items-center gap-3">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
          <Volume2 className="w-4 h-4 text-white" />
        </div>
        <span className="text-sm font-medium">ElevenLabs Voice</span>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {isSpeaking || isLoading ? (
          <Button
            size="sm"
            variant="destructive"
            onClick={stop}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-1" />
            ) : (
              <VolumeX className="w-4 h-4 mr-1" />
            )}
            {isLoading ? "Loading..." : "Stop"}
          </Button>
        ) : (
          <Button
            size="sm"
            variant="default"
            onClick={handleSpeak}
            className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700"
          >
            <Mic className="w-4 h-4 mr-1" />
            Speak
          </Button>
        )}
      </div>

      {isSpeaking && (
        <div className="flex gap-0.5 items-end h-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-1 bg-violet-400 rounded-full animate-pulse"
              style={{
                height: `${Math.random() * 12 + 4}px`,
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
