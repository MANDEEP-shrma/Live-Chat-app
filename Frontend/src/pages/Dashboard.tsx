// import { useEffect, useRef, useState } from "react";
// import { initSocket } from "@/hooks/socket"; // adjust path as needed
// import { SearchBar } from "@/components/dashboard/SearchBar";
// import { UserMenu } from "@/components/dashboard/UserMenu";
// import { FriendCard } from "@/components/dashboard/FriendCard";
// import { ChatWindow } from "@/components/dashboard/ChatWindow";
// import { MessageCircle } from "lucide-react";
// import { useMediaQuery } from "@/hooks/use-media-query";
// import { Link } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import { RootState } from "@/store/store";
// import axios from "axios";
// import { setFriends, updateOnlineStatus } from "@/store/friendSlice";
// import { markMessageRead, sendMessage } from "@/store/messageSlice";

// export default function Dashboard() {
//   const currentUser =
//     useSelector((state: RootState) => state.auth.userData) ||
//     JSON.parse(localStorage.getItem("currentUser") || "{}");

//   const friends = useSelector((state: RootState) => state.friend.listOfFriends);
//   const [activeFriend, setActiveFriend] = useState<string | null>(null);
//   const isMobile = useMediaQuery("(max-width: 768px)");
//   const dispatch = useDispatch();
//   const socketRef = useRef<any>(null);

//   useEffect(() => {
//     if (currentUser && currentUser.name !== "Guest") {
//       localStorage.setItem("currentUser", JSON.stringify(currentUser));
//       localStorage.setItem("userId", currentUser._id);
//       localStorage.setItem("authStatus", "true");
//     }
//   }, [currentUser]);

//   useEffect(() => {
//     if (!socketRef.current) {
//       const socket = initSocket();
//       socketRef.current = socket;

//       socket.on("connect", () => {
//         const userId = localStorage.getItem("userId");

//         if (userId) {
//           socket.emit("user_connected", userId);
//           console.log("Emitted user_connected:", userId);
//         } else {
//           console.warn("No userId found for user_connected emit.");
//         }
//       });

//       socket.on("user_online", (userId) => {
//         dispatch(
//           updateOnlineStatus({ friend: { id: userId, status: "online" } })
//         );
//       });

//       socket.on("user_offline", (userId) => {
//         dispatch(
//           updateOnlineStatus({ friend: { id: userId, status: "offline" } })
//         );
//       });

//       socket.on("new-message", (data) => {
//         console.log("New message received from server:", data);

//         dispatch(
//           sendMessage({
//             friendId: data.sender._id, // data.sender is populated already
//             message: data,
//           })
//         );
//       });

//       socket.on("unread-messages", (message) => {
//         console.log("Unread message received on login:", message);
//         dispatch(
//           sendMessage({
//             friendId: message.sender._id,
//             message: message,
//           })
//         );
//       });

//       socket.on("message_read_ack", ({ messageId, friendId }) => {
//         dispatch(markMessageRead({ messageId, friendId }));
//       });
//     }
//   }, []);

//   useEffect(() => {
//     axios
//       .get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/users/get-all-friends`, {
//         withCredentials: true,
//       })
//       .then((response) => {
//         dispatch(setFriends({ listOfFriends: response.data.data }));
//       })
//       .catch((err) => {
//         console.log(err);
//       });
//   }, []);

//   const handleFriendClick = (friendId: string) => {
//     setActiveFriend(friendId);
//   };

//   const handleChatClose = () => {
//     setActiveFriend(null);
//   };

//   // I have activeFriend now I am searching for that friend from the array.
//   const selectedFriend = friends?.find((f) => f._id === activeFriend) || null;

//   return (
//     <div className="flex h-screen flex-col bg-background">
//       {/* Header */}
//       <div className="flex items-center justify-between border-b px-4 py-3">
//         <Link to="/">
//           <div className="flex items-center gap-2">
//             <MessageCircle className="h-6 w-6 text-accent" />
//             <span className="text-xl font-bold hidden sm:inline-block">
//               ChatConnect
//             </span>
//           </div>
//         </Link>
//         <div className="flex-1 max-w-xl px-4">
//           <SearchBar />
//         </div>
//         <UserMenu user={currentUser} />
//       </div>

//       {/* Main Content */}
//       <div className="flex flex-1 w-full overflow-hidden">
//         {/* Friends List (hide on mobile when chat is active) */}
//         {/* If either the user is not on a mobile device (!isMobile) or there is no active friend (!activeFriend), then render whatever JSX is inside the parentheses (...). */}
//         {(!isMobile || !activeFriend) && (
//           <div className="w-full md:w-64 lg:w-[22rem] xl:w-[25rem] border-r overflow-y-auto">
//             <div className="p-4 border-b">
//               <h2 className="font-semibold text-primary">Messages</h2>
//             </div>
//             <div className="p-2 space-y-2">
//               {friends?.map((friend) => (
//                 <FriendCard
//                   key={friend._id}
//                   friend={friend}
//                   onClick={handleFriendClick}
//                 />
//               ))}
//             </div>
//           </div>
//         )}

//         {/* Chat Window or Empty State */}
//         {activeFriend && selectedFriend ? (
//           <div className="flex-1 flex min-w-0 flex-col">
//             <ChatWindow
//               friend={selectedFriend}
//               currUser={currentUser._id}
//               onClose={handleChatClose}
//               isMobile={isMobile}
//             />
//           </div>
//         ) : (
//           !isMobile && (
//             <div className="flex-1 flex items-center justify-center p-8">
//               <div className="text-center">
//                 <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
//                 <h3 className="text-lg font-medium mb-2 text-primary">
//                   No chat selected
//                 </h3>
//                 <p className="text-muted-foreground max-w-sm">
//                   Select a conversation from the list to start chatting with
//                   your friends.
//                 </p>
//               </div>
//             </div>
//           )
//         )}
//       </div>
//     </div>
//   );
// }

import { useEffect, useRef, useState } from "react";
import { initSocket } from "@/hooks/socket"; // adjust path as needed
import { SearchBar } from "@/components/dashboard/SearchBar";
import { UserMenu } from "@/components/dashboard/UserMenu";
import { FriendCard } from "@/components/dashboard/FriendCard";
import { ChatWindow } from "@/components/dashboard/ChatWindow";
import { MessageCircle } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import axios from "axios";
import { setFriends, updateOnlineStatus } from "@/store/friendSlice";
import { markMessageRead, sendMessage } from "@/store/messageSlice";

// Global set to track processed message IDs at the Dashboard level
// This helps prevent duplicate message processing
const processedMessageIds = new Set<string>();

export default function Dashboard() {
  const currentUser =
    useSelector((state: RootState) => state.auth.userData) ||
    JSON.parse(localStorage.getItem("currentUser") || "{}");

  const friends = useSelector((state: RootState) => state.friend.listOfFriends);
  const [activeFriend, setActiveFriend] = useState<string | null>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const dispatch = useDispatch();
  const socketRef = useRef<any>(null);
  const socketInitialized = useRef(false);

  useEffect(() => {
    if (currentUser && currentUser.name !== "Guest") {
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
      localStorage.setItem("userId", currentUser._id);
      localStorage.setItem("authStatus", "true");
    }
  }, [currentUser]);

  // Helper function to safely process messages only once
  const processMessageOnce = (message: any) => {
    // Skip processing if message is invalid
    if (!message || !message._id) {
      console.warn("Received invalid message:", message);
      return false;
    }

    // Skip if we've already processed this message
    if (processedMessageIds.has(message._id)) {
      console.log(`Message ${message._id} already processed, skipping`);
      return false;
    }

    // Validate sender exists
    if (!message.sender || !message.sender._id) {
      console.warn("Message has invalid sender:", message);
      return false;
    }

    // Add to processed set
    processedMessageIds.add(message._id);
    return true;
  };

  useEffect(() => {
    // Prevent multiple socket initializations
    if (socketInitialized.current || socketRef.current) {
      return;
    }

    socketInitialized.current = true;
    const socket = initSocket();
    socketRef.current = socket;

    socket.on("connect", () => {
      const userId = localStorage.getItem("userId");
      if (userId) {
        socket.emit("user_connected", userId);
        console.log("Emitted user_connected:", userId);
      } else {
        console.warn("No userId found for user_connected emit.");
      }
    });

    socket.on("user_online", (userId) => {
      dispatch(
        updateOnlineStatus({ friend: { id: userId, status: "online" } })
      );
    });

    socket.on("user_offline", (userId) => {
      dispatch(
        updateOnlineStatus({ friend: { id: userId, status: "offline" } })
      );
    });

    // Handle new messages with deduplication
    socket.on("new-message", (data) => {
      if (processMessageOnce(data)) {
        console.log("Processing new message:", data._id);

        // Only add to Redux if message passes validation
        dispatch(
          sendMessage({
            friendId: data.sender._id,
            message: {
              id: data._id,
              senderId: data.sender._id,
              receiverId: data.receiver,
              message: data.message || data.content || "",
              timestamp: new Date(
                data.createdAt || Date.now()
              ).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
              isRead: Boolean(data.isRead),
              isDelivered: Boolean(data.isDelivered),
            },
          })
        );
      }
    });

    // Handle unread messages with deduplication
    socket.on("unread-messages", (message) => {
      if (
        message &&
        message.sender &&
        message.sender._id &&
        processMessageOnce(message)
      ) {
        console.log("Processing unread message:", message._id);

        dispatch(
          sendMessage({
            friendId: message.sender._id,
            message: {
              id: message._id,
              senderId: message.sender._id,
              receiverId: message.receiver,
              message: message.message || message.content || "",
              timestamp: new Date(
                message.createdAt || Date.now()
              ).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
              isRead: Boolean(message.isRead),
              isDelivered: Boolean(message.isDelivered),
            },
          })
        );
      }
    });

    socket.on("message_read_ack", ({ messageId, friendId }) => {
      if (messageId && friendId) {
        dispatch(markMessageRead({ messageId, friendId }));
      }
    });

    // Clean up socket connection when component unmounts
    return () => {
      if (socket) {
        socket.off("new-message");
        socket.off("unread-messages");
        socket.off("message_read_ack");
        socket.off("user_online");
        socket.off("user_offline");
      }
    };
  }, [dispatch]);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/users/get-all-friends`, {
        withCredentials: true,
      })
      .then((response) => {
        dispatch(setFriends({ listOfFriends: response.data.data }));
      })
      .catch((err) => {
        console.log(err);
      });
  }, [dispatch]);

  const handleFriendClick = (friendId: string) => {
    setActiveFriend(friendId);
  };

  const handleChatClose = () => {
    setActiveFriend(null);
  };

  // Find the selected friend from the array
  const selectedFriend = friends?.find((f) => f._id === activeFriend) || null;

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
        {(!isMobile || !activeFriend) && (
          <div className="w-full md:w-64 lg:w-[22rem] xl:w-[25rem] border-r overflow-y-auto">
            <div className="p-4 border-b">
              <h2 className="font-semibold text-primary">Messages</h2>
            </div>
            <div className="p-2 space-y-2">
              {friends?.map((friend) => (
                <FriendCard
                  key={friend._id}
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
              currUser={currentUser._id}
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
