import { createSlice } from "@reduxjs/toolkit";

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

interface MessageState {
  activeChatId: string | null;
  messages: {
    [friendId: string]: Message[];
  };
  loading: boolean;
  error: string | null;
}

const initialState: MessageState = {
  activeChatId: null,
  messages: {},
  loading: false,
  error: null,
};

const messageSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    setActiveChat: (state, action) => {
      state.activeChatId = action.payload.chatId;
    },
    fetchMessageStart: (state) => {
      //I will call this as a promise
      state.loading = true;
      state.error = null;
    },
    fetchMessageSuccess: (state, action) => {
      //If promise get resolved , I will send friendId and their messages, and set messages for that friend
      state.loading = false;
      state.messages[action.payload.friendId] = action.payload.messages;
    },
    fetchMessageFailure: (state, action) => {
      //if promise get rejected
      state.loading = false;
      state.error = action.payload.error;
    },
    sendMessage: (state, action) => {
      //The message iam sending I have to put that in here also.
      const { friendId, message } = action.payload;
      const messages = state.messages[friendId] || [];

      const exists = messages.some((msg) => msg.id === message.id);
      if (!exists) {
        messages.push(message);
      }

      state.messages[friendId] = messages;
    },
    markMessageRead: (state, action) => {
      const friendMessages = state.messages[action.payload.friendId];
      if (friendMessages) {
        const msg = friendMessages.find(
          (m) => m.id === action.payload.messageId
        );

        if (msg) {
          msg.isRead = true;
        }
      }
    },
    replaceTempMessage: (state, action) => {
      const { friendId, tempId, actualMessage } = action.payload;
      const messages = state.messages[friendId] || [];
      console.log("🧩 Replacing temp message:", { tempId, actualMessage });
      const index = messages.findIndex((msg) => msg.id === tempId);
      if (index !== -1) {
        //if the temp msg exists
        messages[index] = actualMessage;
      } else {
        //but if it not exists
        messages.push(actualMessage);
      }

      state.messages[friendId] = messages;
    },
  },
});

export const {
  setActiveChat,
  fetchMessageStart,
  fetchMessageSuccess,
  fetchMessageFailure,
  sendMessage,
  markMessageRead,
  replaceTempMessage,
} = messageSlice.actions;

export default messageSlice.reducer;

/**
 * Function | Kya karta hai?
 * 
 * //kiski chat active h
setActiveChat({friendId}) | Jab tu kisi dost pe click karega to active chat set karega. in here I will send and socketMessage of "message-read for that freindId"

fetchMessagesStart() | Jab tu messages API se load karne start karega (loading spinner).

fetchMessagesSuccess({friendId, messages}) | Jab messages aa jayenge, unhe store mein bhar dega.

fetchMessagesFailure({error}) | Agar koi error aaya messages fetch karte waqt.

//message send kiya toh isse call karke us message ko frontend pai show karenge and then db mai daal denge
sendMessage({friendId, message}) | Jab tu koi naya message bhejega aur chat mein show karna hai.

markMessageAsRead({friendId, messageId}) | Jab koi message read ho jaaye, toh isRead=true kar dega.

 */
