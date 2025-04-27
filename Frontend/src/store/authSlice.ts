import { createSlice } from "@reduxjs/toolkit";

//for ts problem.
//there is nothing to load about sirf init data kai types dene hai and you done.
//and store mai bas doh line add karni hai joh thodi faaltu hai baaki usme bhi bas init data kai types define karne hote hai everything is fine just seee some chats if you don't get of gpt.

interface UserData {
  name: string;
  id: string;
  email: string;
  avatar?: string;
}

interface AuthState {
  status: boolean;
  userData: UserData | null;
}

const initialState: AuthState = {
  status: false,
  userData: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      state.status = true;
      state.userData = action.payload.userData;
    },
    logout: (state) => {
      state.status = false;
      state.userData = null;
    },
  },
});

export const { login, logout } = authSlice.actions;

export default authSlice.reducer;
