import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Friend {
  _id: string;
  name: string;
  avatar?: string;
  status: "online" | "offline"; // Changed to boolean
  bio?: string;
  lastMessage?: string;
}

interface FriendCardProps {
  friend: Friend;
  onClick: (friendId: string) => void;
}

export function FriendCard({ friend, onClick }: FriendCardProps) {
  const [showProfile, setShowProfile] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const handleCardClick = () => {
    onClick(friend._id);
  };

  const handleAvatarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowProfile(true);
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
            {friend.status === "online" && (
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full ring-2 ring-white bg-green-500" />
            )}
          </div>
          <div className="flex-1 overflow-hidden">
            <h4 className="font-medium text-sm">{friend.name}</h4>
            {friend.bio && (
              <p className="text-muted-foreground text-xs truncate mt-1">
                {friend.bio}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showProfile} onOpenChange={setShowProfile}>
        <DialogContent className="sm:max-w-md">
          <DialogTitle>Profile</DialogTitle>
          <div className="flex flex-col items-center pt-4 pb-6">
            <Avatar
              className="h-24 w-24 mb-4 cursor-pointer"
              onClick={() => setShowImageDialog(true)}
            >
              <AvatarImage src={friend.avatar} alt={friend.name} />
              <AvatarFallback className="text-2xl">
                {friend.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {showImageDialog && (
              <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
                <DialogContent className="p-0 bg-transparent shadow-none">
                  <img
                    src={friend.avatar}
                    alt={friend.name}
                    className="w-full h-full object-cover"
                  />
                </DialogContent>
              </Dialog>
            )}
            <h3 className="text-xl font-semibold">{friend.name}</h3>
            {friend.status === "online" && (
              <div className="flex items-center mt-1">
                <span className="h-2 w-2 rounded-full bg-green-500 mr-2" />
                <span className="text-sm text-muted-foreground capitalize">
                  Online
                </span>
              </div>
            )}
            {friend.bio && (
              <p className="text-muted-foreground  text-md text-center mt-4 max-w-sm">
                {friend.bio}
              </p>
            )}
            <div className="flex gap-2 mt-6">
              <Button
                onClick={() => {
                  setShowProfile(false);
                  onClick(friend._id);
                }}
              >
                Message
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
