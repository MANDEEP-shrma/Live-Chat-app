// // import { useEffect, useState, useRef } from "react";
// // import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// // import { Button } from "@/components/ui/button";
// // import { Input } from "@/components/ui/input";
// // import { Send, ChevronLeft, Ban, UserMinus } from "lucide-react";
// // import axios from "axios";
// // import {
// //   fetchMessageFailure,
// //   fetchMessageStart,
// //   fetchMessageSuccess,
// //   markMessageRead,
// //   sendMessage,
// // } from "@/store/messageSlice";
// // import { useDispatch, useSelector } from "react-redux";
// // import { RootState } from "@/store/store";
// // import { getSocket } from "@/hooks/socket";
// // import { useToast } from "@/hooks/use-toast";
// // import { removeFriend } from "@/store/friendSlice";

// // interface Friend {
// //   _id: string;
// //   name: string;
// //   avatar?: string;
// //   status?: "online" | "offline";
// // }

// // interface ChatWindowProps {
// //   friend: Friend;
// //   currUser: string;
// //   onClose: () => void;
// //   isMobile?: boolean;
// // }

// // interface MessageFromAPI {
// //   _id: string;
// //   sender: {
// //     _id: string;
// //     name: string;
// //   };
// //   receiver: {
// //     _id: string;
// //     name: string;
// //   };
// //   message: string;
// //   createdAt: string;
// //   isRead: boolean;
// //   isDelivered: boolean;
// // }

// // interface Message {
// //   id: string;
// //   senderId: string;
// //   receiverId: string;
// //   message: string;
// //   content?: string;
// //   timestamp: string;
// //   isRead: boolean;
// //   isDelivered: boolean;
// // }

// // export function ChatWindow({
// //   friend,
// //   onClose,
// //   currUser,
// //   isMobile = false,
// // }: ChatWindowProps) {
// //   const [message, setMessage] = useState("");
// //   const dispatch = useDispatch();
// //   const { toast } = useToast();
// //   const messagesEndRef = useRef<HTMLDivElement>(null);
// //   const currentUserId = currUser;
// //   const socketRef = useRef(getSocket());

// //   // Track processed message IDs to prevent duplicates
// //   const processedMessageIds = useRef(new Set());

// //   const messages = useSelector(
// //     (state: RootState) => state.message.messages[friend._id] || []
// //   ) as Message[];

// //   const scrollToBottom = () => {
// //     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
// //   };

// //   useEffect(() => {
// //     scrollToBottom();
// //   }, [messages]);

// //   // Fetch messages only once when component mounts or friend changes
// //   useEffect(() => {
// //     const fetchMessages = async () => {
// //       try {
// //         dispatch(fetchMessageStart());

// //         const response = await axios.get(
// //           `${
// //             import.meta.env.VITE_BACKEND_URL
// //           }/api/v1/users/get-all-messages?friendId=${friend._id}`,
// //           { withCredentials: true }
// //         );

// //         // Converting the response
// //         const formattedMessages = response.data.data.map(
// //           (msg: MessageFromAPI) => {
// //             const formattedMsg = {
// //               id: msg._id,
// //               senderId: msg.sender._id,
// //               receiverId: msg.receiver._id,
// //               message: msg.message,
// //               timestamp: new Date(msg.createdAt).toLocaleTimeString([], {
// //                 hour: "2-digit",
// //                 minute: "2-digit",
// //               }),
// //               isRead: Boolean(msg.isRead),
// //               isDelivered: Boolean(msg.isDelivered),
// //             };

// //             // Add to processed IDs to avoid duplicates from socket
// //             processedMessageIds.current.add(formattedMsg.id);

// //             return formattedMsg;
// //           }
// //         );

// //         dispatch(
// //           fetchMessageSuccess({
// //             friendId: friend._id,
// //             messages: formattedMessages,
// //           })
// //         );
// //       } catch (err) {
// //         console.error("Chat Window error: ", err);
// //         dispatch(
// //           fetchMessageFailure({
// //             error:
// //               err instanceof Error ? err.message : "Failed to fetch messages",
// //           })
// //         );

// //         toast.error("Error", {
// //           description: "Failed to fetch messages",
// //         });
// //       }
// //     };

// //     fetchMessages();

// //     // Clear processed message IDs when changing friends
// //     processedMessageIds.current = new Set();
// //   }, [dispatch, friend._id, toast]);

// //   // Set up socket listeners separately, with proper cleanup
// //   useEffect(() => {
// //     const socket = socketRef.current;

// //     // Make sure we're connected
// //     if (!socket.connected) {
// //       socket.connect();
// //     }

// //     // Function to handle new messages from socket
// //     const handleNewMessage = (newMessage: any) => {
// //       console.log("💬 New live message received:", newMessage);

// //       // Create a consistent message ID
// //       const messageId = newMessage._id || newMessage.id;

// //       // Only process if message is for this chat
// //       const isRelevantMessage =
// //         newMessage.sender._id === friend._id ||
// //         newMessage.sender === friend._id ||
// //         newMessage.receiver._id === friend._id ||
// //         newMessage.receiver === friend._id;

// //       // Skip if we've already processed this message or it's not relevant
// //       if (!isRelevantMessage || processedMessageIds.current.has(messageId)) {
// //         return;
// //       }

// //       // Mark as processed
// //       processedMessageIds.current.add(messageId);

// //       const formattedMessage = {
// //         id: messageId,
// //         senderId: newMessage.sender._id || newMessage.sender,
// //         receiverId: newMessage.receiver._id || newMessage.receiver,
// //         message: newMessage.message || newMessage.content,
// //         timestamp: new Date(
// //           newMessage.createdAt || Date.now()
// //         ).toLocaleTimeString([], {
// //           hour: "2-digit",
// //           minute: "2-digit",
// //         }),
// //         isRead: Boolean(newMessage.isRead),
// //         isDelivered: Boolean(newMessage.isDelivered),
// //       };

// //       dispatch(
// //         sendMessage({
// //           friendId: friend._id,
// //           message: formattedMessage,
// //         })
// //       );

// //       // Mark message as read if we're the receiver
// //       if (formattedMessage.receiverId === currentUserId) {
// //         socket.emit("message_read", { messageId: formattedMessage.id });
// //       }
// //     };

// //     // Function to handle read acknowledgments
// //     const handleMessageReadAck = ({
// //       messageId,
// //       friendId,
// //     }: {
// //       messageId: string;
// //       friendId: string;
// //     }) => {
// //       if (friendId === currentUserId) {
// //         dispatch(markMessageRead({ friendId: friend._id, messageId }));
// //       }
// //     };

// //     // Add event listeners
// //     socket.on("new-message", handleNewMessage);
// //     socket.on("message_read_ack", handleMessageReadAck);

// //     // Clean up
// //     return () => {
// //       socket.off("new-message", handleNewMessage);
// //       socket.off("message_read_ack", handleMessageReadAck);
// //     };
// //   }, [dispatch, friend._id, currentUserId]);

// //   const handleSendMessage = async (e: React.FormEvent) => {
// //     e.preventDefault();
// //     if (!message.trim()) return;

// //     // Create temporary message for UI
// //     const tempId = `temp-${Date.now()}`;
// //     const tempMessage = {
// //       id: tempId,
// //       senderId: currentUserId,
// //       receiverId: friend._id,
// //       message: message,
// //       timestamp: new Date().toLocaleTimeString([], {
// //         hour: "2-digit",
// //         minute: "2-digit",
// //       }),
// //       isRead: false,
// //       isDelivered: false,
// //     };

// //     // Add to processed IDs to avoid duplicates
// //     processedMessageIds.current.add(tempId);

// //     // Add to Redux immediately for responsive UI
// //     dispatch(
// //       sendMessage({
// //         friendId: friend._id,
// //         message: tempMessage,
// //       })
// //     );

// //     setMessage("");

// //     try {
// //       const response = await axios.post(
// //         `${import.meta.env.VITE_BACKEND_URL}/api/v1/users/open-chat`,
// //         { content: message, receiverId: friend._id },
// //         { withCredentials: true }
// //       );

// //       // The actual message with server-generated ID
// //       const serverMessage = response.data.data.message;

// //       // Add server ID to processed IDs to avoid duplicates from socket
// //       if (serverMessage && serverMessage._id) {
// //         processedMessageIds.current.add(serverMessage._id);
// //       }
// //     } catch (error) {
// //       console.error("Failed to send message:", error);
// //       toast.error("Error", {
// //         description: "Failed to send Message",
// //       });
// //     }
// //   };

// //   const handleBlock = () => {
// //     const friendId = friend._id;
// //     axios
// //       .get(
// //         `${
// //           import.meta.env.VITE_BACKEND_URL
// //         }/api/v1/users/block-friend?blockUserId=${friendId}`,
// //         {
// //           withCredentials: true,
// //         }
// //       )
// //       .then(() => {
// //         dispatch(removeFriend({ friendId }));
// //         const storedFriends = localStorage.getItem("friends");
// //         if (storedFriends) {
// //           const friendsList = JSON.parse(storedFriends);
// //           const updatedFriendsList = friendsList.filter(
// //             (id: string) => id !== friendId
// //           );
// //           localStorage.setItem("friends", JSON.stringify(updatedFriendsList));
// //         }

// //         toast.success("Success", {
// //           description: "User has been Blocked successfully",
// //         });

// //         if (onClose) {
// //           onClose();
// //         }
// //       })
// //       .catch((err) => {
// //         console.log(err);
// //         toast.error("Error", {
// //           description: err.response?.data?.message || "Failed to block user",
// //         });
// //       });
// //   };

// //   const handleRemove = () => {
// //     const friendId = friend._id;
// //     axios
// //       .post(
// //         `${import.meta.env.VITE_BACKEND_URL}/api/v1/users/remove-friend`,
// //         { friendId },
// //         {
// //           withCredentials: true,
// //         }
// //       )
// //       .then(() => {
// //         dispatch(removeFriend({ friendId }));
// //         const storedFriends = localStorage.getItem("friends");
// //         if (storedFriends) {
// //           const friendsList = JSON.parse(storedFriends);
// //           const updatedFriendsList = friendsList.filter(
// //             (id: string) => id !== friendId
// //           );
// //           localStorage.setItem("friends", JSON.stringify(updatedFriendsList));
// //         }

// //         toast.success("Success", {
// //           description: "User has been removed from friend list",
// //         });
// //         if (onClose) {
// //           onClose();
// //         }
// //       })
// //       .catch((err) => {
// //         console.log(err);
// //         toast.error("Error", {
// //           description: err.response?.data?.message || "Failed to remove friend",
// //         });
// //       });
// //   };

// //   return (
// //     <div className="flex flex-col h-full">
// //       {/* Chat Header */}
// //       <div className="flex items-center justify-between p-4 border-b">
// //         <div className="flex items-center space-x-3">
// //           {isMobile && (
// //             <Button
// //               variant="ghost"
// //               size="icon"
// //               onClick={onClose}
// //               className="mr-1"
// //             >
// //               <ChevronLeft className="h-5 w-5" />
// //             </Button>
// //           )}
// //           <Avatar>
// //             <AvatarImage src={friend.avatar} />
// //             <AvatarFallback>
// //               {friend.name
// //                 .split(" ")
// //                 .map((n) => n[0])
// //                 .join("")
// //                 .toUpperCase()}
// //             </AvatarFallback>
// //           </Avatar>
// //           <div>
// //             <h3 className="font-medium text-sm">{friend.name}</h3>
// //             {friend.status && (
// //               <p className="text-xs text-muted-foreground capitalize">
// //                 {friend.status}
// //               </p>
// //             )}
// //           </div>
// //         </div>
// //         <div className="flex items-center space-x-4">
// //           <Button
// //             variant="outline"
// //             size="sm"
// //             className="flex items-center gap-1 bg-red-100 hover:bg-red-200 text-red-600 border-red-300 font-medium px-3"
// //             onClick={handleBlock}
// //           >
// //             <Ban className="h-4 w-4" />
// //             Block
// //           </Button>
// //           <Button
// //             variant="outline"
// //             size="sm"
// //             className="flex items-center gap-1 bg-purple-100 hover:bg-purple-200 text-purple-600 border-purple-300 font-medium px-3"
// //             onClick={handleRemove}
// //           >
// //             <UserMinus className="h-4 w-4" />
// //             Remove
// //           </Button>
// //         </div>
// //       </div>

// //       {/* Messages */}
// //       <div className="flex-1 overflow-y-auto p-4 space-y-4">
// //         {messages.map((msg: Message) => {
// //           const isCurrentUserMessage = msg.senderId === currentUserId;

// //           return (
// //             <div
// //               key={msg.id}
// //               className={`flex ${
// //                 isCurrentUserMessage ? "justify-end" : "justify-start"
// //               }`}
// //             >
// //               <div
// //                 className={`max-w-xs px-4 py-2 rounded-lg shadow ${
// //                   isCurrentUserMessage
// //                     ? "bg-blue-300 text-black rounded-br-none"
// //                     : "bg-gray-200 text-black rounded-bl-none"
// //                 }`}
// //               >
// //                 <p>{msg.message}</p>
// //                 <span className="text-xs text-muted-foreground block mt-1 text-right">
// //                   {msg.timestamp}
// //                 </span>
// //               </div>
// //             </div>
// //           );
// //         })}
// //         <div ref={messagesEndRef} />
// //       </div>

// //       {/* Message Input */}
// //       <form
// //         onSubmit={handleSendMessage}
// //         className="p-4 border-t flex items-center space-x-2"
// //       >
// //         <Input
// //           type="text"
// //           placeholder="Type a message..."
// //           value={message}
// //           onChange={(e) => setMessage(e.target.value)}
// //           className="flex-1"
// //         />
// //         <Button type="submit" size="icon" disabled={!message.trim()}>
// //           <Send className="h-5 w-5" />
// //         </Button>
// //       </form>
// //     </div>
// //   );
// // }

import { useEffect, useState, useRef } from "react";

// Extend the Window interface to include _messageTracker
declare global {
  interface Window {
    _messageTracker?: {
      processedMessages: Map<string, number>;
      chatInstances: Set<string>;
      registerMessage: (chatId: string, messageId: string) => boolean;
      isProcessed: (chatId: string, messageId: string) => boolean;
      cleanup: () => void;
    };
  }
}
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

// Interface definitions
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

// Global message tracker implementation - improved version
if (typeof window !== "undefined") {
  if (!window._messageTracker) {
    window._messageTracker = {
      processedMessages: new Map<string, number>(),
      chatInstances: new Set<string>(),

      // Register a message and return true if it's new
      registerMessage: (chatId: string, messageId: string): boolean => {
        if (!messageId) return false;
        const key = `${chatId}:${messageId}`;
        if (window._messageTracker?.processedMessages?.has(key)) {
          return false;
        }
        window._messageTracker?.processedMessages?.set(key, Date.now());
        return true;
      },

      // Check if a message has been processed
      isProcessed: (chatId: string, messageId: string): boolean => {
        if (!messageId) return true; // Consider undefined IDs as already processed
        const key = `${chatId}:${messageId}`;
        return window._messageTracker?.processedMessages?.has(key) ?? false;
      },

      // Remove old entries (older than 1 hour)
      cleanup: () => {
        const oneHourAgo = Date.now() - 3600000;
        for (const [
          key,
          timestamp,
        ] of window._messageTracker?.processedMessages?.entries() || []) {
          if (timestamp < oneHourAgo) {
            window._messageTracker?.processedMessages?.delete(key);
          }
        }
      },
    };

    // Set up periodic cleanup
    setInterval(() => {
      window._messageTracker?.cleanup();
    }, 300000); // Run cleanup every 5 minutes
  }
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
  const [socketConnected, setSocketConnected] = useState(false);

  // Chat identifier
  const chatId = `${currentUserId}-${friend._id}`;

  // Component instance identifier (for debugging)
  const instanceId = useRef(
    `chat-${Math.random().toString(36).substring(2, 9)}`
  );

  // Track if initial messages have been loaded
  const initialMessagesLoaded = useRef(false);

  // A list of message IDs that we've already dispatched to Redux
  const dispatchedMessageIds = useRef<Set<string>>(new Set());

  // Debug logging with component instance info
  const debug = (message: string, data?: any) => {
    console.log(
      `[${instanceId.current} | ${chatId}] ${message}`,
      data !== undefined ? data : ""
    );
  };

  // Access the messages from Redux
  const messages = useSelector(
    (state: RootState) => state.message.messages[friend._id] || []
  ) as Message[];

  // Register this chat instance when mounted
  useEffect(() => {
    debug("Component mounted");

    if (window._messageTracker) {
      window._messageTracker.chatInstances.add(chatId);
    }

    return () => {
      debug("Component unmounted");
      if (window._messageTracker) {
        window._messageTracker.chatInstances.delete(chatId);
      }
    };
  }, [chatId]);

  // Helper function to handle scrolling to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check if we should process a message
  const shouldProcessMessage = (messageId: string): boolean => {
    if (!messageId) {
      debug("Skipping message with empty ID");
      return false;
    }

    // Use the global tracker to check if this message has been processed
    if (window._messageTracker) {
      if (window._messageTracker.isProcessed(chatId, messageId)) {
        debug(`Message ${messageId} already processed`);
        return false;
      }

      // Register this message as processed
      window._messageTracker.registerMessage(chatId, messageId);
      return true;
    }

    // Fallback if global tracker not available
    if (dispatchedMessageIds.current.has(messageId)) {
      debug(`Message ${messageId} already dispatched locally`);
      return false;
    }

    dispatchedMessageIds.current.add(messageId);
    return true;
  };

  // Helper to safely dispatch a message to Redux only once
  const safeDispatchMessage = (friendId: string, messageData: Message) => {
    if (!messageData.id) {
      debug("Cannot dispatch message without ID");
      return false;
    }

    if (!dispatchedMessageIds.current.has(messageData.id)) {
      debug(`Dispatching message to Redux: ${messageData.id}`);
      dispatchedMessageIds.current.add(messageData.id);
      dispatch(sendMessage({ friendId, message: messageData }));
      return true;
    }
    return false;
  };

  // Set up socket connection
  useEffect(() => {
    const socket = socketRef.current;

    const handleConnect = () => {
      debug("Socket connected");
      setSocketConnected(true);
    };

    const handleDisconnect = (reason: string | Error) => {
      debug("Socket disconnected", reason);
      setSocketConnected(false);
    };

    // Connect if not already connected
    if (!socket.connected) {
      socket.connect();
    } else {
      setSocketConnected(true);
    }

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, []);

  // Fetch messages from API - only run once
  useEffect(() => {
    // Skip if we've already loaded messages for this chat
    if (initialMessagesLoaded.current) {
      debug("Initial messages already loaded, skipping API fetch");
      return;
    }

    const fetchMessages = async () => {
      try {
        debug("Fetching messages from API");
        dispatch(fetchMessageStart());

        const response = await axios.get(
          `${
            import.meta.env.VITE_BACKEND_URL
          }/api/v1/users/get-all-messages?friendId=${friend._id}`,
          { withCredentials: true }
        );

        debug("API returned messages", response.data.data.length);

        // Process and deduplicate messages
        const formattedMessages: Message[] = [];

        for (const msg of response.data.data) {
          if (!msg._id) {
            debug("Skipping message without _id", msg);
            continue;
          }

          const messageObj: Message = {
            id: msg._id,
            senderId: msg.sender?._id || msg.sender,
            receiverId: msg.receiver?._id || msg.receiver,
            message: msg.message || msg.content || "",
            timestamp: new Date(msg.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            isRead: Boolean(msg.isRead),
            isDelivered: Boolean(msg.isDelivered),
          };

          // Only add if not already processed
          if (shouldProcessMessage(messageObj.id)) {
            formattedMessages.push(messageObj);
            dispatchedMessageIds.current.add(messageObj.id);
          }
        }

        debug("Unique messages to add", formattedMessages.length);

        if (formattedMessages.length > 0) {
          dispatch(
            fetchMessageSuccess({
              friendId: friend._id,
              messages: formattedMessages,
            })
          );
        }

        // Mark as loaded
        initialMessagesLoaded.current = true;
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
  }, [dispatch, friend._id, toast]);

  // Handle socket messages - with enhanced deduplication
  useEffect(() => {
    const socket = socketRef.current;

    // Skip setting up duplicate listeners
    const listenerAlreadySet = useRef(false);
    if (listenerAlreadySet.current) {
      return;
    }
    listenerAlreadySet.current = true;

    debug("Setting up socket message listeners");

    // Process new messages from socket
    const handleNewMessage = (newMessage: any) => {
      debug("New socket message received", newMessage);

      // Validate message has required fields
      if (!newMessage) {
        debug("Received empty message object");
        return;
      }

      // Get message ID
      const messageId = newMessage._id || newMessage.id;

      if (!messageId) {
        debug("Skipping message without ID", newMessage);
        return;
      }

      // Safely extract sender and receiver IDs
      const senderId = newMessage.sender?._id || newMessage.sender;
      const receiverId = newMessage.receiver?._id || newMessage.receiver;

      if (!senderId || !receiverId) {
        debug("Skipping message with missing sender or receiver", newMessage);
        return;
      }

      // Check if message is relevant to this chat
      const isRelevantMessage =
        senderId === friend._id || receiverId === friend._id;

      debug(`Message relevance: ${isRelevantMessage}, ID: ${messageId}`);

      // Skip if not relevant or already processed
      if (!isRelevantMessage || !shouldProcessMessage(messageId)) {
        return;
      }

      debug("Processing new unique message", messageId);

      // Format message
      const formattedMessage: Message = {
        id: messageId,
        senderId,
        receiverId,
        message: newMessage.message || newMessage.content || "",
        timestamp: new Date(
          newMessage.createdAt || Date.now()
        ).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isRead: Boolean(newMessage.isRead),
        isDelivered: Boolean(newMessage.isDelivered),
      };

      // Add to Redux
      safeDispatchMessage(friend._id, formattedMessage);

      // Mark as read if we're the receiver
      if (formattedMessage.receiverId === currentUserId) {
        try {
          socket.emit("message_read", { messageId: formattedMessage.id });
        } catch (err) {
          debug("Error marking message as read", err);
        }
      }
    };

    // Handle read receipts
    const handleMessageReadAck = ({
      messageId,
      friendId,
    }: {
      messageId: string;
      friendId: string;
    }) => {
      debug("Message read acknowledgment", { messageId, friendId });
      if (friendId === currentUserId) {
        dispatch(markMessageRead({ friendId: friend._id, messageId }));
      }
    };

    // Set up listeners
    socket.on("new-message", handleNewMessage);
    socket.on("message_read_ack", handleMessageReadAck);

    // Clean up
    return () => {
      debug("Removing socket event listeners");
      socket.off("new-message", handleNewMessage);
      socket.off("message_read_ack", handleMessageReadAck);
    };
  }, [dispatch, friend._id, currentUserId]);

  // Send a new message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    debug("Sending new message", message);

    // Create temporary message for UI
    const tempId = `temp-${Date.now()}`;
    const tempMessage: Message = {
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

    // Register message as processed
    shouldProcessMessage(tempId);

    // Add to Redux
    safeDispatchMessage(friend._id, tempMessage);

    // Clear input
    setMessage("");

    try {
      debug("Sending message to API");
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/users/open-chat`,
        { content: message, receiverId: friend._id },
        { withCredentials: true }
      );

      // Get server-generated message
      const serverMessage = response.data.data.message;
      debug("Server response for sent message", serverMessage);

      // Register server ID to prevent duplicates
      if (serverMessage && serverMessage._id) {
        shouldProcessMessage(serverMessage._id);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Error", {
        description: "Failed to send message",
      });
    }
  };

  // Block user
  const handleBlock = () => {
    const friendId = friend._id;
    debug("Blocking user", friendId);

    axios
      .get(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/v1/users/block-friend?blockUserId=${friendId}`,
        { withCredentials: true }
      )
      .then(() => {
        dispatch(removeFriend({ friendId }));

        // Update localStorage
        const storedFriends = localStorage.getItem("friends");
        if (storedFriends) {
          const friendsList = JSON.parse(storedFriends);
          const updatedFriendsList = friendsList.filter(
            (id: string) => id !== friendId
          );
          localStorage.setItem("friends", JSON.stringify(updatedFriendsList));
        }

        toast.success("Success", {
          description: "User has been blocked successfully",
        });

        if (onClose) {
          onClose();
        }
      })
      .catch((err) => {
        console.error("Block error:", err);
        toast.error("Error", {
          description: err.response?.data?.message || "Failed to block user",
        });
      });
  };

  // Remove friend
  const handleRemove = () => {
    const friendId = friend._id;
    debug("Removing friend", friendId);

    axios
      .post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/users/remove-friend`,
        { friendId },
        { withCredentials: true }
      )
      .then(() => {
        dispatch(removeFriend({ friendId }));

        // Update localStorage
        const storedFriends = localStorage.getItem("friends");
        if (storedFriends) {
          const friendsList = JSON.parse(storedFriends);
          const updatedFriendsList = friendsList.filter(
            (id: string) => id !== friendId
          );
          localStorage.setItem("friends", JSON.stringify(updatedFriendsList));
        }

        toast.success("Success", {
          description: "User has been removed successfully",
        });

        if (onClose) {
          onClose();
        }
      })
      .catch((err) => {
        console.error("Remove friend error:", err);
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
            <p className="text-xs text-muted-foreground capitalize">
              {friend.status || (socketConnected ? "online" : "offline")}
            </p>
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
