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
  replaceTempMessage,
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
  };
  receiver: {
    _id: string;
    name: string;
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
  content?: string;
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
  const socketRef = useRef(getSocket());

  // Track processed message IDs to prevent duplicates
  const processedMessageIds = useRef(new Set());

  const messages = useSelector(
    (state: RootState) => state.message.messages[friend._id] || []
  ) as Message[];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch messages only once when component mounts or friend changes
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

        // Converting the response
        const formattedMessages = response.data.data.map(
          (msg: MessageFromAPI) => {
            const formattedMsg = {
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
            };

            // Add to processed IDs to avoid duplicates from socket
            processedMessageIds.current.add(formattedMsg.id);
            return formattedMsg;
          }
        );

        //we have entered the data in auth.
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

        toast.error("Error", {
          description: "Failed to fetch messages",
        });
      }
    };

    fetchMessages();

    // Clear processed message IDs when changing friends
    processedMessageIds.current = new Set();
  }, [dispatch, friend._id, toast]);

  // Set up socket listeners separately, with proper cleanup
  useEffect(() => {
    const socket = socketRef.current;

    // Make sure we're connected
    if (!socket.connected) {
      socket.connect();
    }

    // Function to handle new messages from socket
    const handleNewMessage = (newMessage: any) => {
      console.log("New live message received:", newMessage);
      console.log("📥 Socket received message:", newMessage);
      console.log("🔌 Socket connected:", socket.id);
      // Create a consistent message ID
      const messageId = newMessage._id || newMessage.id;

      // Only process if message is for this chat
      const isRelevantMessage =
        newMessage.sender._id === friend._id ||
        newMessage.sender === friend._id ||
        newMessage.receiver._id === friend._id ||
        newMessage.receiver === friend._id;

      if (!isRelevantMessage) {
        return;
      }

      //Skiping the message if we have already processed this message
      if (processedMessageIds.current.has(messageId)) {
        return;
      }

      const formattedMessage = {
        id: newMessage._id || newMessage.id,
        senderId: newMessage.sender._id || newMessage.sender,
        receiverId: newMessage.receiver._id || newMessage.receiver,
        message: newMessage.message || newMessage.content,
        timestamp: new Date(
          newMessage.createdAt || Date.now()
        ).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isRead: Boolean(newMessage.isRead),
        isDelivered: Boolean(newMessage.isDelivered),
      };

      // Check if the message already exists in the Redux state
      const existingMessages = messages.map((msg) => msg.id);
      if (!existingMessages.includes(formattedMessage.id)) {
        dispatch(
          sendMessage({
            friendId: newMessage.sender._id || newMessage.sender.id,
            message: formattedMessage,
          })
        );
      }

      //if not then mark it as processed now.
      // Mark as processed
      processedMessageIds.current.add(messageId);

      // Mark message as read if we're the receiver
      if (formattedMessage.receiverId === currentUserId) {
        socket.emit("message_read", { messageId: formattedMessage.id });
      }
    };

    // Function to handle read acknowledgments
    const handleMessageReadAck = ({
      messageId,
      friendId,
    }: {
      messageId: string;
      friendId: string;
    }) => {
      if (friendId === currentUserId) {
        dispatch(markMessageRead({ friendId: friend._id, messageId }));
      }
    };

    // Add event listeners
    socket.on("new-message", handleNewMessage);
    socket.on("message_read_ack", handleMessageReadAck);

    // Clean up
    return () => {
      socket.off("new-message", handleNewMessage);
      socket.off("message_read_ack", handleMessageReadAck);
    };
  }, [dispatch, friend._id, currentUserId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Create temporary message for UI
    const tempId = `temp-${Date.now()}`;
    const tempMessage = {
      id: tempId,
      senderId: currentUserId,
      receiverId: friend._id,
      message: message,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isRead: false,
      isDelivered: false,
    };

    // Check if the temporary message already exists in the Redux state
    const existingTempMessages = messages.map((msg) => msg.id);
    if (!existingTempMessages.includes(tempMessage.id)) {
      dispatch(
        sendMessage({
          friendId: friend._id,
          message: tempMessage,
        })
      );
    }

    setMessage("");

    try {
      console.log("⏳ Temp message being dispatched:", tempMessage);
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/users/open-chat`,
        { content: message, receiverId: friend._id },
        { withCredentials: true }
      );

      // The actual message with server-generated ID
      const serverMessage = response.data.data.message;
      console.log("📤 Sent message via Axios:", serverMessage);
      //when the server sends the message we replace the server message from our temp message.
      dispatch(
        replaceTempMessage({
          friendId: friend._id,
          tempId,
          actualMessage: {
            id: serverMessage._id,
            senderId: serverMessage.sender._id || serverMessage.sender,
            receiverId: serverMessage.receiver._id || serverMessage.receiver,
            message: serverMessage.message,
            timestamp: new Date(
              serverMessage.createdAt || Date.now()
            ).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            isRead: false,
            isDelivered: serverMessage.isDelivered,
          },
        })
      );
      // Add server ID to processed IDs to avoid duplicates from socket
      if (serverMessage && serverMessage._id) {
        processedMessageIds.current.add(serverMessage._id);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Error", {
        description: "Failed to send Message",
      });
    }
  };

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

        toast.success("Success", {
          description: "User has been Blocked successfully",
        });

        if (onClose) {
          onClose();
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error("Error", {
          description: err.response?.data?.message || "Failed to block user",
        });
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

        toast.success("Success", {
          description: "User has been removed from friend list",
        });
        if (onClose) {
          onClose();
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error("Error", {
          description: err.response?.data?.message || "Failed to remove friend",
        });
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
        {messages.map((msg: Message) => {
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
