import React from "react";
import { useMeetingStore } from "@/stores/meetingStore";
import VideoTile from "./VideoTile";
import { useAuthStore } from "@/stores/authStore";
import { Users } from "lucide-react";

interface VideoGridProps {
  localVideoRef: React.RefObject<HTMLVideoElement | null>;
  registerRemoteVideoRef: (peerId: string, el: HTMLVideoElement | null) => void;
}

const VideoGrid: React.FC<VideoGridProps> = ({
  localVideoRef,
  registerRemoteVideoRef,
}) => {
  const { participants, isCameraOff, isScreenSharing } = useMeetingStore();
  const { user } = useAuthStore();

  if (participants.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6 p-6">
        <div className="relative w-full max-w-3xl aspect-video">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className={`w-full h-full rounded-2xl object-cover bg-gray-900 border-2 border-white/5 ${!isCameraOff || isScreenSharing ? "" : "hidden"}`}
          />
          {isCameraOff && !isScreenSharing && (
            <div className="absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center border-2 border-white/5">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-slate-600 to-zinc-700 flex items-center justify-center text-white text-4xl font-bold shadow-xl select-none">
                {user?.username?.[0]?.toUpperCase() ?? "U"}
              </div>
            </div>
          )}
          <div className="absolute bottom-3 left-3 px-3 py-1.5 bg-black/60 rounded-lg bg-white/5 backdrop-blur-md border border-white/10">
            <span className="text-white text-sm font-medium">
              {user?.username} (You)
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
            <Users className="w-7 h-7 text-gray-400" />
          </div>
          <p className="text-gray-300 font-medium">
            Waiting for others to join
          </p>
          <p className="text-gray-500 text-sm">
            Share the meeting code to invite participants
          </p>
          <div className="flex gap-1.5 mt-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-emerald-500/60 animate-bounce"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex-1 grid gap-3 p-4"
      style={{
        gridTemplateColumns: "repeat(auto-fit, minmax(min(280px, 100%), 1fr))",
        alignContent: "center",
      }}
    >
      <div className="relative rounded-2xl overflow-hidden bg-gray-900 border-2 border-white/5 aspect-video">
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          className={`w-full h-full object-cover ${!isCameraOff || isScreenSharing ? "" : "hidden"}`}
        />
        {isCameraOff && !isScreenSharing && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-slate-600 to-zinc-700 flex items-center justify-center text-white text-2xl font-bold select-none">
              {user?.username?.[0]?.toUpperCase() ?? "U"}
            </div>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-gradient-to-t from-black/80 to-transparent">
          <span className="text-white text-sm font-medium">
            {user?.username} (You)
          </span>
        </div>
      </div>

      {participants.map((p) => (
        <VideoTile
          key={p.id}
          participant={p}
          registerVideoRef={(el) => registerRemoteVideoRef(p.id, el)}
        />
      ))}
    </div>
  );
};

export default VideoGrid;
