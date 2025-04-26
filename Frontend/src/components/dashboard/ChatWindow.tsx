import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Phone, Video, MoreVertical, Send, ChevronLeft } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Friend {
  id: string;
  name: string;
  avatar?: string;
  status?: "online" | "offline" | "away";
}

interface ChatWindowProps {
  friend: Friend;
  onClose: () => void;
  isMobile?: boolean;
}

export function ChatWindow({
  friend,
  onClose,
  isMobile = false,
}: ChatWindowProps) {
  const [message, setMessage] = useState("");

  const mockMessages = [
    {
      id: "1",
      content: "Hey, how are you doing?",
      sender: "them",
      time: "10:30 AM",
    },
    {
      id: "2",
      content: "I'm good, thanks! How about you?",
      sender: "me",
      time: "10:32 AM",
    },
    {
      id: "3",
      content: "Pretty good! Just working on some projects.",
      sender: "them",
      time: "10:33 AM",
    },
    {
      id: "4",
      content: "That sounds interesting. What kind of projects?",
      sender: "me",
      time: "10:35 AM",
    },
    {
      id: "5",
      content:
        "Mostly UI design for a new app. It's pretty challenging but fun!",
      sender: "them",
      time: "10:36 AM",
    },
    {
      id: "6",
      content: "That sounds awesome! Would love to see it sometime.",
      sender: "me",
      time: "10:38 AM",
    },
  ];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      // In a real app, you would send the message to a server here
      setMessage("");
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-3">
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="mr-1"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}
          <Avatar>
            <AvatarImage src={friend.avatar} />
            <AvatarFallback>
              {friend.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium text-sm">{friend.name}</h3>
            {friend.status && (
              <p className="text-xs text-muted-foreground capitalize">
                {friend.status}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="icon">
            <Phone className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Video className="h-5 w-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View Profile</DropdownMenuItem>
              <DropdownMenuItem>Search in Conversation</DropdownMenuItem>
              <DropdownMenuItem>Mute Notifications</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                Block User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {mockMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.sender === "me" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                msg.sender === "me"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              <p>{msg.content}</p>
              <span
                className={`text-xs ${
                  msg.sender === "me"
                    ? "text-primary-foreground/70"
                    : "text-muted-foreground"
                } block text-right mt-1`}
              >
                {msg.time}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Message Input */}
      <form
        onSubmit={handleSendMessage}
        className="p-4 border-t flex items-center space-x-2"
      >
        <Input
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" size="icon" disabled={!message.trim()}>
          <Send className="h-5 w-5" />
        </Button>
      </form>
    </div>
  );
}
