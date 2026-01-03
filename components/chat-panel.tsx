"use client";

import { useEffect, useRef, useState } from "react";
import { useCall } from "@stream-io/video-react-sdk";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  senderName: string;
  senderId: string;
  text: string;
  timestamp: number;
}

interface ChatPanelProps {
  onClose: () => void;
  user: any;
  effectiveUserId: string;
}

export function ChatPanel({ onClose, user, effectiveUserId }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const call = useCall();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!call) return;

    // Listen for custom chat events
    const unsubscribe = call.on("custom", (event) => {
      if (event.type === "chat.message") {
        const newMessage = event.data as Message;
        setMessages((prev) => {
          // Prevent duplicates
          if (prev.some((m) => m.id === newMessage.id)) return prev;
          return [...prev, newMessage];
        });
      }
    });

    return () => unsubscribe();
  }, [call]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || !call) return;

    const message: Message = {
      id: `${effectiveUserId}-${Date.now()}`,
      senderName: user?.username || user?.fullName || effectiveUserId,
      senderId: effectiveUserId,
      text: inputValue.trim(),
      timestamp: Date.now(),
    };

    try {
      await call.sendCustomEvent({
        type: "chat.message",
        data: message,
      });
      // Add locally immediately for fast feedback
      setMessages((prev) => [...prev, message]);
      setInputValue("");
    } catch (error) {
      console.error("Failed to send chat message:", error);
    }
  };

  return (
    <div className="flex h-full flex-col bg-[#1c1f2e] text-white">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold">Chat</h2>
        <button onClick={onClose} className="text-white/50 hover:text-white">
          ✕
        </button>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-hide"
      >
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-white/30 space-y-2">
            <Send size={40} className="mb-2 opacity-20" />
            <p className="text-sm">No messages yet.</p>
            <p className="text-xs">Be the first to say hello!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === effectiveUserId;
            return (
              <div 
                key={msg.id} 
                className={cn("flex flex-col max-w-[85%]", {
                  "ml-auto items-end": isMe,
                  "items-start": !isMe
                })}
              >
                {!isMe && (
                  <span className="text-[10px] text-white/50 mb-1 ml-1 px-1">
                    {msg.senderName}
                  </span>
                )}
                <div 
                  className={cn("rounded-2xl px-4 py-2 text-sm break-words", {
                    "bg-[#0E78F9] text-white rounded-tr-none": isMe,
                    "bg-white/10 text-white rounded-tl-none": !isMe
                  })}
                >
                  {msg.text}
                </div>
                <span className="text-[9px] text-white/30 mt-1 px-1">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })
        )}
      </div>

      <form 
        onSubmit={handleSendMessage}
        className="mt-4 flex gap-2 border-t border-white/10 pt-4"
      >
        <Input
          placeholder="Type a message..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="flex-1 border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-[#0E78F9]"
        />
        <Button 
          type="submit" 
          disabled={!inputValue.trim()}
          className="bg-[#0E78F9] hover:bg-[#0E78F9]/90 h-10 w-10 p-0 shrink-0"
        >
          <Send size={18} />
        </Button>
      </form>
    </div>
  );
}
