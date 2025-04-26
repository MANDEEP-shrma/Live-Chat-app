import { useState } from "react";
import { SearchBar } from "@/components/dashboard/SearchBar";
import { UserMenu } from "@/components/dashboard/UserMenu";
import { FriendCard } from "@/components/dashboard/FriendCard";
import { ChatWindow } from "@/components/dashboard/ChatWindow";
import { MessageCircle } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Link } from "react-router-dom";

// Mock data
const currentUser = {
  name: "John Doe",
  email: "john.doe@example.com",
  avatar:
    "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
};

const friends = [
  {
    id: "1",
    name: "Sarah Johnson",
    avatar:
      "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    status: "online" as const,
    bio: "UX Designer | Travel enthusiast | Coffee lover",
    lastMessage: "Hey, are we still meeting tomorrow?",
  },
  {
    id: "2",
    name: "Michael Chen",
    avatar:
      "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    status: "offline" as const,
    bio: "Software Engineer | Gamer | Foodie",
    lastMessage: "Thanks for the help with that project!",
  },
  {
    id: "3",
    name: "Emma Rodriguez",
    avatar:
      "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    status: "away" as const,
    bio: "Marketing Professional | Music lover | Hiking enthusiast",
    lastMessage: "Did you see the latest campaign results?",
  },
  {
    id: "4",
    name: "David Kim",
    avatar:
      "https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    status: "online" as const,
    bio: "Product Manager | Basketball fan | Chef in training",
    lastMessage: "Let's catch up soon!",
  },
  {
    id: "5",
    name: "Jessica Taylor",
    avatar:
      "https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    status: "online" as const,
    bio: "Graphic Designer | Cat lover | Photography enthusiast",
    lastMessage: "I just sent you the latest designs",
  },
];

export default function Dashboard() {
  const [activeFriend, setActiveFriend] = useState<string | null>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const handleFriendClick = (friendId: string) => {
    setActiveFriend(friendId);
  };

  const handleChatClose = () => {
    setActiveFriend(null);
  };

  // I have activeFriend now I am searching for that friend from the array.
  const selectedFriend = friends.find((f) => f.id === activeFriend);

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <Link to="/">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-6 w-6 text-accent" />
            <span className="text-xl font-bold hidden sm:inline-block">
              ChatConnect
            </span>
          </div>
        </Link>
        <div className="flex-1 max-w-xl px-4">
          <SearchBar />
        </div>
        <UserMenu user={currentUser} />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 w-full overflow-hidden">
        {/* Friends List (hide on mobile when chat is active) */}
        {/* If either the user is not on a mobile device (!isMobile) or there is no active friend (!activeFriend), then render whatever JSX is inside the parentheses (...). */}
        {(!isMobile || !activeFriend) && (
          <div className="w-full md:w-64 lg:w-[22rem] xl:w-[25rem] border-r overflow-y-auto">
            <div className="p-4 border-b">
              <h2 className="font-semibold text-primary">Messages</h2>
            </div>
            <div className="p-2 space-y-2">
              {friends.map((friend) => (
                <FriendCard
                  key={friend.id}
                  friend={friend}
                  onClick={handleFriendClick}
                />
              ))}
            </div>
          </div>
        )}

        {/* Chat Window or Empty State */}
        {activeFriend && selectedFriend ? (
          <div className="flex-1 flex min-w-0 flex-col">
            <ChatWindow
              friend={selectedFriend}
              onClose={handleChatClose}
              isMobile={isMobile}
            />
          </div>
        ) : (
          !isMobile && (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center">
                <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2 text-primary">
                  No chat selected
                </h3>
                <p className="text-muted-foreground max-w-sm">
                  Select a conversation from the list to start chatting with
                  your friends.
                </p>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
