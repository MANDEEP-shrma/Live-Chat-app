//Now this makes so much sense to me that Here we write a function to initialise our IO and also to send message to a particular user , so in app.js we use initialse wla function which in result when our user get register it automatically get into our activeUser map ,
//Also we can add any function in future if we want Great scalability and a way of thinking -> that if any code you see that is independent and you don't know what to do make it a function that make sense.
import { Server } from "socket.io";
import { Message } from "../Models/messages.model.js";
import { User } from "../Models/users.model.js";
let io;

const activeUsers = new Map();

//Use to initialie the socketIo only used once in app.js
const initialiseSocketIO = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("New connection:", socket.id);

    // Handle user connection with their userId
    socket.on("user_connected", async (userId) => {
      console.log("🧠 user_connected received:", userId);
      activeUsers.set(userId, socket.id);
      //This line will tell all the user that the person is online
      socket.broadcast.emit("user_online", userId);
      await User.findByIdAndUpdate(userId, { status: "online" });

      console.log("🟢 User connected:", userId, "Socket:", socket.id);
      console.log("Current Active Users:", [...activeUsers.entries()]);

      //after setting user I am sending array of Messages to the frontend on "new-message" like frontend can use this if it want
      const unreadMessages = await Message.find({
        receiver: userId,
        isRead: false,
      })
        .populate("sender", "name avatar")
        .populate("receiver", "name avatar");

      // Update isDelivered field to true for all unread messages
      await Message.updateMany(
        { receiver: userId, isRead: false },
        { isDelivered: true }
      );

      unreadMessages.forEach((msg) => {
        io.to(socket.id).emit("unread-messages", msg);
      });

      // socket.on("message-sent", ({ message, to }) => {
      //   const receiverSocketId = activeUsers.get(to); // however you track connected users
      //   if (receiverSocketId) {
      //     io.to(receiverSocketId).emit("message-sent", message);
      //   }
      //   console.log("📨 Backend received message from:", socket.id);
      //   console.log("🎯 Target userId:", to, "SocketId:", activeUsers.get(to));
      // });

      //If frontend send something "message_read" then we have to update in db
      socket.on("message_read", async ({ messageId }) => {
        try {
          await Message.findByIdAndUpdate(messageId, { isRead: true });

          // Here we extract sender and notify him
          const message = await Message.findById(messageId);
          const senderId = message.sender.toString();

          //Here by using this function we are telling frontend that the message is read by user after updating it in db now in frontend we use a socket.on("message_read_ack") and update something in UI.
          emitMessageToUser(senderId, "message_read_ack", {
            messageId,
            friendId: message.receiver.toString(),
          });
        } catch (error) {
          console.error("Error updating isRead:", error);
        }
      });
    });

    socket.on("message-sent", ({ message, to }) => {
      const receiverSocketId = activeUsers.get(to);

      console.log("📨 Message from:", socket.id);
      console.log("🎯 Target userId:", to);
      console.log("🧠 Active users:", [...activeUsers.entries()]);

      if (receiverSocketId) {
        io.to(receiverSocketId).emit("message-sent", message);
        console.log("✅ Message sent to", to, "via socket", receiverSocketId);
      } else {
        console.log("❌ Receiver not online or not in activeUsers map.");
      }
    });

    // Handle disconnection
    socket.on("disconnect", async () => {
      console.log("User disconnected");
      // Remove user from active users
      for (const [userId, socketId] of activeUsers.entries()) {
        if (socketId === socket.id) {
          await User.findByIdAndUpdate(userId, { status: "offline" });
          activeUsers.delete(userId);
          socket.broadcast.emit("user_offline", userId);
          break;
        }
      }
    });
  });

  return io;
};
//This function take the receiverId , the event , data and send the data to that receiver
const emitMessageToUser = (userId, event, data) => {
  const socketId = activeUsers.get(userId);
  if (socketId) {
    //if that person exits in current
    io.to(socketId).emit(event, data);
    return true;
  } else {
    return false;
  }
};

//This function is come handy when we have to take access of "io" from anywhere
const getIO = () => {
  if (!io) {
    throw new Error("Socket.io is not init");
  }
  return io;
};
export { initialiseSocketIO, emitMessageToUser, getIO };
