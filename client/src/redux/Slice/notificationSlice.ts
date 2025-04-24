import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Notification } from "../../types";

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
};

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    setNotifications: (state, action: PayloadAction<Notification[]>) => {
      state.notifications = action.payload;
      state.unreadCount = action.payload.filter((n) => n.status === "unread").length;
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications = [action.payload, ...state.notifications];
      if (action.payload.status === "unread") {
        state.unreadCount += 1;
      }
    },
    updateNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications = state.notifications.map((n) =>
        n._id === action.payload._id ? action.payload : n
      );
      state.unreadCount = state.notifications.filter((n) => n.status === "unread").length;
    },
    markNotificationAsRead: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.map((n) =>
        n._id === action.payload ? { ...n, status: "read" } : n
      );
      state.unreadCount = state.notifications.filter((n) => n.status === "unread").length;
    },
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
  },
});

export const {
  setNotifications,
  addNotification,
  updateNotification,
  markNotificationAsRead,
  clearNotifications,
} = notificationSlice.actions;
export default notificationSlice.reducer;