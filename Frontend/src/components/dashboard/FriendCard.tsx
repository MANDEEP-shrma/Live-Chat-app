import { useState } from "react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface Friend {
  id: string;
  name: string;
  avatar?: string;
  status?: "online" | "offline" | "away";
  bio?: string;
  lastMessage?: string;
}

interface FriendCardProps {
  friend: Friend;
  onClick: (friendId: string) => void;
}

export function FriendCard({ friend, onClick }: FriendCardProps) {
  const [showProfile, setShowProfile] = useState(false);

  const handleCardClick = () => {
    onClick(friend.id);
  };

  const handleAvatarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowProfile(true);
  };

  const statusColors = {
    online: "bg-green-500",
    offline: "bg-gray-400",
    away: "bg-yellow-500",
  };

  return (
    <>
      <Card
        className="cursor-pointer hover:shadow-md transition-all overflow-hidden"
        onClick={handleCardClick}
      >
        <CardContent className="p-4 flex items-center space-x-4">
          <div onClick={handleAvatarClick} className="relative">
            <Avatar className="h-12 w-12 transition-transform hover:scale-105">
              <AvatarImage src={friend.avatar} alt={friend.name} />
              <AvatarFallback>
                {friend.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {friend.status && (
              <span
                className={`absolute bottom-0 right-0 h-3 w-3 rounded-full ring-2 ring-white ${
                  statusColors[friend.status]
                }`}
              />
            )}
          </div>
          <div className="flex-1 overflow-hidden">
            <h4 className="font-medium text-sm">{friend.name}</h4>
            {friend.lastMessage && (
              <p className="text-muted-foreground text-xs truncate mt-1">
                {friend.lastMessage}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showProfile} onOpenChange={setShowProfile}>
        <DialogContent className="sm:max-w-md">
          <DialogTitle className="flex justify-between items-center">
            <span>Profile</span>
            <DialogClose asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogClose>
          </DialogTitle>
          <div className="flex flex-col items-center pt-4 pb-6">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarImage src={friend.avatar} alt={friend.name} />
              <AvatarFallback className="text-2xl">
                {friend.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <h3 className="text-xl font-semibold">{friend.name}</h3>
            {friend.status && (
              <div className="flex items-center mt-1">
                <span
                  className={`h-2 w-2 rounded-full ${
                    statusColors[friend.status]
                  } mr-2`}
                />
                <span className="text-sm text-muted-foreground capitalize">
                  {friend.status}
                </span>
              </div>
            )}
            {friend.bio && (
              <p className="text-muted-foreground text-sm text-center mt-4 max-w-sm">
                {friend.bio}
              </p>
            )}
            <div className="flex gap-2 mt-6">
              <Button
                onClick={() => {
                  setShowProfile(false);
                  onClick(friend.id);
                }}
              >
                Message
              </Button>
              <Button variant="outline">View Details</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
