import { useEffect, useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, ChevronLeft, Ban, UserMinus } from "lucide-react";
import axios from "axios";
import {
  fetchMessageFailure,
  fetchMessageStart,
  fetchMessageSuccess,
  markMessageRead,
  sendMessage,
} from "@/store/messageSlice";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { getSocket } from "@/hooks/socket";
import { useToast } from "@/hooks/use-toast";
import { removeFriend } from "@/store/friendSlice";

interface Friend {
  _id: string;
  name: string;
  avatar?: string;
  status?: "online" | "offline";
}

interface ChatWindowProps {
  friend: Friend;
  currUser: string;
  onClose: () => void;
  isMobile?: boolean;
}

interface MessageFromAPI {
  _id: string;
  sender: {
    _id: string;
    name: string;
    //i can take further properties here
  };
  receiver: {
    _id: string;
    name: string;
    //here also.
  };
  message: string;
  createdAt: string;
  isRead: boolean;
  isDelivered: boolean;
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  content?: string; // Add optional content field to handle possible structure differences
  timestamp: string;
  isRead: boolean;
  isDelivered: boolean;
}

export function ChatWindow({
  friend,
  onClose,
  currUser,
  isMobile = false,
}: ChatWindowProps) {
  const [message, setMessage] = useState("");
  const dispatch = useDispatch();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUserId = currUser;
  // Add debug logging for currentUserId
  console.log("Current user ID from Redux:", currentUserId);

  const messages = useSelector(
    (state: RootState) => state.message.messages[friend._id] || []
  ) as any[];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        dispatch(fetchMessageStart());

        const response = await axios.get(
          `${
            import.meta.env.VITE_BACKEND_URL
          }/api/v1/users/get-all-messages?friendId=${friend._id}`,
          { withCredentials: true }
        );

        // Debug the raw API response to see structure
        console.log("Raw API response:", response.data.data);

        // Converting the response coming to the Msg store acceptance
        const formattedMessages = response.data.data.map(
          (msg: MessageFromAPI) => ({
            id: msg._id,
            senderId: msg.sender._id,
            receiverId: msg.receiver._id,
            message: msg.message,
            timestamp: new Date(msg.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            isRead: Boolean(msg.isRead),
            isDelivered: Boolean(msg.isDelivered),
          })
        );

        // Debug formatted messages
        console.log("Formatted messages:", formattedMessages);
        console.log("Current user ID:", currentUserId);

        dispatch(
          fetchMessageSuccess({
            friendId: friend._id,
            messages: formattedMessages,
          })
        );
      } catch (err) {
        console.error("Chat Window error: ", err);
        dispatch(
          fetchMessageFailure({
            error:
              err instanceof Error ? err.message : "Failed to fetch messages",
          })
        );
        toast.error("A A A!!", {
          description: "Failed to fetch the message",
        });
      }
    };

    fetchMessages();

    const socket = getSocket();

    // Listen for new messages from the socket
    socket.on("new-message", (newMessage) => {
      console.log("💬 New live message received on receiver:", newMessage);

      // Only process if message is for this chat
      if (
        newMessage.sender._id === friend._id ||
        newMessage.sender === friend._id ||
        newMessage.receiver._id === friend._id ||
        newMessage.receiver === friend._id
      ) {
        const formattedMessage = {
          id: newMessage._id || newMessage.id,
          senderId: newMessage.sender._id || newMessage.sender,
          receiverId: newMessage.receiver._id || newMessage.receiver,
          message: newMessage.message || newMessage.content, // Handle both formats
          timestamp: new Date(
            newMessage.createdAt || Date.now()
          ).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          isRead: Boolean(newMessage.isRead),
          isDelivered: Boolean(newMessage.isDelivered),
        };

        console.log("Formatted socket message:", formattedMessage);

        dispatch(
          sendMessage({
            friendId: friend._id,
            message: formattedMessage,
          })
        );

        // Mark message as read if we're the receiver
        if (formattedMessage.receiverId === currentUserId) {
          socket.emit("message_read", { messageId: formattedMessage.id });
        }
      }
    });

    // Listen for read acknowledgments
    socket.on("message_read_ack", ({ messageId, friendId }) => {
      if (friendId === currentUserId) {
        // Update message read status in Redux
        dispatch(markMessageRead({ friendId: friend._id, messageId }));
      }
    });

    // Debug event binding - helps ensure events are registered
    console.log("Setting up socket listeners for friend:", friend._id);

    // Clean up listeners when component unmounts or friend changes
    return () => {
      console.log("Cleaning up socket listeners");
      socket.off("new-message");
      socket.off("message_read_ack");
    };
  }, [dispatch, friend._id, currentUserId, toast]);

  // Make sure we reconnect the socket if it's disconnected
  useEffect(() => {
    const socket = getSocket();

    // Check if socket is connected, if not, reconnect
    if (!socket.connected) {
      console.log("Socket not connected, attempting to reconnect");
      socket.connect();
    }

    return () => {
      // No need to disconnect the socket here as other components might use it
    };
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    console.log("Sending message as user:", currentUserId);

    // Create temporary message for UI
    const tempId = `temp-${Date.now()}`;
    const tempMessage = {
      id: tempId,
      senderId: currentUserId,
      receiverId: friend._id,
      message: message, // Make sure the message field is set
      content: message, // Also set content field to support different possible structures
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isRead: false,
      isDelivered: false,
    };

    console.log("Created temp message:", tempMessage);

    // Add to Redux immediately for responsive UI
    dispatch(
      sendMessage({
        friendId: friend._id,
        message: tempMessage,
      })
    );

    setMessage("");

    try {
      // Your API expects receiverId in params, not body
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/users/open-chat`,
        { content: message, receiverId: friend._id }, // Changed from 'content' to 'message' to match API expectation
        { withCredentials: true }
      );

      // The actual message with server-generated ID
      const serverMessage = response.data.data.message;
      console.log("Message sent successfully:", serverMessage);

      // Emit socket event to notify recipients (optional, depending on your backend)
      const socket = getSocket();
      if (socket && socket.connected) {
        console.log("Emitting message-sent event");
        socket.emit("message-sent", {
          message: serverMessage,
          to: friend._id,
        });
        console.log("📤 Emitted message via socket to:", friend._id);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("A A A!!", {
        description: "Failed to send the message",
      });
    }
  };

  // if (!currentUserId) return <div>Loading...</div>;

  const handleBlock = () => {
    const friendId = friend._id;
    axios
      .get(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/v1/users/block-friend?blockUserId=${friendId}`,
        {
          withCredentials: true,
        }
      )
      .then(() => {
        dispatch(removeFriend({ friendId }));
        const storedFriends = localStorage.getItem("friends");
        if (storedFriends) {
          const friendsList = JSON.parse(storedFriends);
          const updatedFriendsList = friendsList.filter(
            (id: string) => id !== friendId
          );
          localStorage.setItem("friends", JSON.stringify(updatedFriendsList));
        }

        toast.success("User has been blocked Successfully");
      })
      .catch((err) => {
        console.log(err);
        toast.error(err.response?.data?.message);
      });
  };

  const handleRemove = () => {
    const friendId = friend._id;
    axios
      .post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/users/remove-friend`,
        { friendId },
        {
          withCredentials: true,
        }
      )
      .then(() => {
        dispatch(removeFriend({ friendId }));
        const storedFriends = localStorage.getItem("friends");
        if (storedFriends) {
          const friendsList = JSON.parse(storedFriends);
          const updatedFriendsList = friendsList.filter(
            (id: string) => id !== friendId
          );
          localStorage.setItem("friends", JSON.stringify(updatedFriendsList));
        }

        toast.success("User has been removed from friend list");
      })
      .catch((err) => {
        console.log(err);
        toast.error(err.response?.data?.message);
      });
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
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1 bg-red-100 hover:bg-red-200 text-red-600 border-red-300 font-medium px-3"
            onClick={handleBlock}
          >
            <Ban className="h-4 w-4" />
            Block
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1 bg-purple-100 hover:bg-purple-200 text-purple-600 border-purple-300 font-medium px-3"
            onClick={handleRemove}
          >
            <UserMinus className="h-4 w-4" />
            Remove
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages &&
          messages.map((msg: Message) => {
            const isCurrentUserMessage = msg.senderId === currentUserId;

            return (
              <div
                key={msg.id}
                className={`flex ${
                  isCurrentUserMessage ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg shadow ${
                    isCurrentUserMessage
                      ? "bg-blue-300 text-black rounded-br-none"
                      : "bg-gray-200 text-black rounded-bl-none"
                  }`}
                >
                  <p>{msg.message}</p>
                  <span className="text-xs text-muted-foreground block mt-1 text-right">
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}
        <div ref={messagesEndRef} />
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
