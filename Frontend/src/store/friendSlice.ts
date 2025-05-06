import { createSlice } from "@reduxjs/toolkit";

interface Friend {
  _id: string;
  name: string;
  avatar: string;
  status: "online" | "offline";
}

interface FriendState {
  listOfFriends: Friend[];
}

const initialState: FriendState = {
  listOfFriends: [],
};

const friendSlice = createSlice({
  name: "friend",
  initialState,
  reducers: {
    setFriends: (state, action) => {
      //I will give whole listOfFriends and change the state.
      state.listOfFriends = action.payload.listOfFriends;
    },
    updateOnlineStatus: (state, action) => {
      const friend = state.listOfFriends.find(
        (f) => f._id === action.payload.friend.id
      );
      if (friend) {
        friend.status = action.payload.friend.status;
      }
    },
    addFriend: (state, action) => {
      //i will give one friend(it's object) will pick it from payload and done
      state.listOfFriends.push(action.payload.friend);
    },
    removeFriend: (state, action) => {
      //I will give the friendId and filter the array where he will not be the part of new one.
      state.listOfFriends = state.listOfFriends.filter(
        (f) => f._id !== action.payload.friendId
      );
    },
  },
});

export const { setFriends, updateOnlineStatus, addFriend, removeFriend } =
  friendSlice.actions;

export default friendSlice.reducer;
