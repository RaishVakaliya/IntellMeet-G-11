import React, { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useMeetingStore } from "@/stores/meetingStore";
import { useAuthStore } from "@/stores/authStore";
import {
  getChatHistory,
  type ChatMessage as ApiChatMessage,
} from "@/services/chatService";
import type { Socket } from "socket.io-client";
import { Send, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

interface ChatPanelProps {
  socket: Socket;
  meetingCode: string;
}

const formatTime = (d: Date | string) => {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const ChatPanel: React.FC<ChatPanelProps> = ({ socket, meetingCode }) => {
  const { user } = useAuthStore();
  const { messages, sendMessage, isChatOpen } = useMeetingStore();
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: history, isLoading } = useQuery<ApiChatMessage[]>({
    queryKey: ["chat-history", meetingCode],
    queryFn: () => getChatHistory(meetingCode),
    enabled: !!user && !!meetingCode,
    staleTime: 60_000,
  });

  useEffect(() => {
    const handleNewMessage = (msg: {
      content: string;
      sender: { _id: string; name: string };
      timestamp: string;
    }) => {
      sendMessage(msg.content, msg.sender.name, msg.sender._id);
    };

    socket.on("new-message", handleNewMessage);
    return () => {
      socket.off("new-message", handleNewMessage);
    };
  }, [socket, user, sendMessage]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, history]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || !user) return;

    socket.emit("send-message", {
      meetingCode,
      message: text,
      senderId: user._id,
      senderName: user.username,
      senderAvatar: "",
    });

    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isChatOpen) return null;

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-gray-900/90 backdrop-blur-xl">
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-white">In-call messages</h3>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-3 py-4 space-y-3 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner className="size-6 text-emerald-500" />
          </div>
        ) : (
          <>
            {history?.map((msg) => {
              const isMe = msg.sender._id === user?._id;
              return (
                <MessageBubble
                  key={msg._id}
                  name={msg.sender.name}
                  text={msg.content}
                  time={msg.timestamp}
                  isMe={isMe}
                />
              );
            })}

            {(!history || history.length === 0) && messages.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-gray-500" />
                </div>
                <p className="text-gray-400 text-sm font-medium">
                  No messages yet
                </p>
                <p className="text-gray-500 text-xs">
                  Start the conversation below
                </p>
              </div>
            )}

            {messages.map((msg) => {
              const isMe = msg.senderId === user?._id;
              return (
                <MessageBubble
                  key={msg.id}
                  name={msg.senderName}
                  text={msg.text}
                  time={msg.timestamp}
                  isMe={isMe}
                />
              );
            })}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="px-3 py-3 border-t border-white/5 bg-gray-900/40">
        <div className="flex items-center gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Send a message..."
            className="flex-1 bg-white/5 border-white/10 text-sm h-9 rounded-xl focus-visible:ring-emerald-500/30"
          />
          <Button
            size="icon-sm"
            onClick={handleSend}
            disabled={!input.trim()}
            className={cn(
              "rounded-xl transition-all duration-200",
              input.trim()
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "bg-white/5 text-gray-600 cursor-not-allowed border border-white/5",
            )}
          >
            <Send className="w-3.5 h-3.5" />
          </Button>
        </div>
        <p className="text-[10px] text-gray-600 mt-1.5 text-center">
          Messages are only visible during this meeting
        </p>
      </div>
    </div>
  );
};

interface MessageBubbleProps {
  name: string;
  text: string;
  time: Date | string;
  isMe: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  name,
  text,
  time,
  isMe,
}) => (
  <div
    className={cn("flex flex-col gap-0.5", isMe ? "items-end" : "items-start")}
  >
    {!isMe && (
      <span className="text-[10px] text-gray-400 font-medium px-1">{name}</span>
    )}
    <div
      className={cn(
        "max-w-[85%] rounded-2xl px-3 py-2 text-sm break-words break-all whitespace-pre-wrap",
        isMe
          ? "bg-emerald-600/80 text-white rounded-br-sm"
          : "bg-white/8 text-gray-100 rounded-bl-sm border border-white/5",
      )}
    >
      {text}
    </div>
    <span className="text-[10px] text-gray-500 px-1">{formatTime(time)}</span>
  </div>
);

export default ChatPanel;
