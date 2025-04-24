import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentUser: null,
  users: [],
  loading: false,
  error: false,
  isAdmin: false,
  resetEmail: null,
  currentAdmin:null,
  isLoggingOutAdmin:false,
  selectedContact: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setResetEmail: (state, action) => {
      state.resetEmail = action.payload;
    },
    clearResetEmail: (state) => {
      state.resetEmail = null;
    },
    signinStart: (state) => {
      state.loading = false;
      state.error = false;
    },
    signinSuccess: (state, action) => {
      state.currentUser = action.payload;
      state.loading = false;
      state.error = false;
    },
    signinFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    signOut: (state) => {
      state.currentUser = null;
      state.currentAdmin = null;
      state.isAdmin = false;
      state.isLoggingOutAdmin = false;
      state.loading = false;
      state.error = false;
      state.selectedContact = null;
    },
    setIsAdmin: (state, action) => {
      state.isAdmin = true;
      state.currentAdmin = action.payload;
      state.loading = false;
      state.error = false;
   },
   unsetIsAdmin: (state) => {
      state.currentAdmin = null;
      state.isAdmin = false;
   },
   AdminLogout: (state) => {
    state.currentAdmin = null;
    state.isAdmin = false;
    state.isLoggingOutAdmin = true; 
  },

  setSelectedContact(state, action) {
    state.selectedContact = action.payload;
  },

  //update the user profile

  updateUserProfile: (state, action) => {
    state.currentUser = {
      ...state.currentUser,
      ...action.payload
    };
    state.loading = false;
    state.error = false;
  },
  },
});

export const {
  setResetEmail,
  clearResetEmail,
  signinStart,
  signinSuccess,
  signinFailure,
  signOut,
  setIsAdmin,
  unsetIsAdmin,
  AdminLogout,
  updateUserProfile,
  setSelectedContact,
} = userSlice.actions;
export default userSlice.reducer;


