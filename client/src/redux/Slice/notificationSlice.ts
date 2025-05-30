import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Notification } from "../../types";

interface NotificationState {
  chatNotifications: Notification[];
  taskNotifications: Notification[];
  chatUnreadCount: number;
  taskUnreadCount: number;
  isInChatComponent: boolean;
  activeChatKey: string | null; 
}

const initialState: NotificationState = {
  chatNotifications: [],
  taskNotifications: [],
  chatUnreadCount: 0,
  taskUnreadCount: 0,
  isInChatComponent: false,
  activeChatKey: null,
};

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    setNotifications: (state, action: PayloadAction<Notification[]>) => {
      state.chatNotifications = action.payload.filter(
        n => ["message", "incoming_call", "client_call", "missed_call"].includes(n.type)
      );
      state.taskNotifications = action.payload.filter(n => n.type === "task_reminder");
      state.chatUnreadCount = state.chatNotifications.filter(n => n.status === "unread").length;
      state.taskUnreadCount = state.taskNotifications.filter(n => n.status === "unread").length;
      console.log("setNotifications: chatNotifications:", state.chatNotifications);
      console.log("setNotifications: taskNotifications:", state.taskNotifications);
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      const { _id, type, status, relatedId } = action.payload;
      console.log("addNotification:", action.payload);

      if (["message", "incoming_call", "client_call", "missed_call"].includes(type)) {
        // Only mark as read if in chat component AND notification is for the active chat
        const isActiveChat = state.isInChatComponent && state.activeChatKey === relatedId;
        if (["message", "client_call"].includes(type) && isActiveChat) {
          state.chatNotifications = [
            { ...action.payload, status: "read" },
            ...state.chatNotifications,
          ];
          console.log("addNotification: Added read chat notification:", _id);
        } else {
          state.chatNotifications = [action.payload, ...state.chatNotifications];
          if (status === "unread") {
            state.chatUnreadCount += 1;
          }
          console.log("addNotification: Added chat notification:", _id);
        }
      } else if (type === "task_reminder") {
        state.taskNotifications = [action.payload, ...state.taskNotifications];
        if (status === "unread") {
          state.taskUnreadCount += 1;
        }
        console.log("addNotification: Added task notification:", _id);
      }
      state.chatUnreadCount = state.chatNotifications.filter(n => n.status === "unread").length;
      state.taskUnreadCount = state.taskNotifications.filter(n => n.status === "unread").length;
      console.log("addNotification: chatUnreadCount:", state.chatUnreadCount);
      console.log("taskUnreadCount:", state.taskUnreadCount);
    },
    updateNotification: (state, action: PayloadAction<Notification>) => {
      const { _id, type } = action.payload;
      console.log("updateNotification:", action.payload);
      if (["message", "incoming_call", "client_call", "missed_call"].includes(type)) {
        state.chatNotifications = state.chatNotifications.map(n =>
          n._id === _id ? action.payload : n
        );
        console.log("updateNotification: Updated chat notification:", _id);
      } else if (type === "task_reminder") {
        state.taskNotifications = state.taskNotifications.map(n =>
          n._id === _id ? action.payload : n
        );
        console.log("updateNotification: Updated task notification:", _id);
      }
      state.chatUnreadCount = state.chatNotifications.filter(n => n.status === "unread").length;
      state.taskUnreadCount = state.taskNotifications.filter(n => n.status === "unread").length;
    },
    markNotificationAsRead: (state, action: PayloadAction<string>) => {
      const notificationId = action.payload;
      console.log("markNotificationAsRead: notificationId:", notificationId);
      state.chatNotifications = state.chatNotifications.map(n =>
        n._id === notificationId ? { ...n, status: "read" } : n
      );
      state.taskNotifications = state.taskNotifications.map(n =>
        n._id === notificationId ? { ...n, status: "read" } : n
      );
      state.chatUnreadCount = state.chatNotifications.filter(n => n.status === "unread").length;
      state.taskUnreadCount = state.taskNotifications.filter(n => n.status === "unread").length;
      console.log("markNotificationAsRead: chatUnreadCount:", state.chatUnreadCount);
    },
    clearNotifications: (state) => {
      state.chatNotifications = [];
      state.taskNotifications = [];
      state.chatUnreadCount = 0;
      state.taskUnreadCount = 0;
      console.log("clearNotifications: Cleared all notifications");
    },
    setIsInChatComponent: (state, action: PayloadAction<boolean>) => {
      state.isInChatComponent = action.payload;
      console.log("setIsInChatComponent:", action.payload);
      if (action.payload && state.activeChatKey) {
        state.chatNotifications = state.chatNotifications.map(n =>
          ["message", "incoming_call"].includes(n.type) &&
          n.status === "unread" &&
          n.relatedId === state.activeChatKey
            ? { ...n, status: "read" }
            : n
        );
        state.chatUnreadCount = state.chatNotifications.filter(n => n.status === "unread").length;
        console.log("setIsInChatComponent: Marked message/incoming_call as read for active chat");
      }
    },
    setActiveChatKey: (state, action: PayloadAction<string | null>) => {
      state.activeChatKey = action.payload;
      console.log("setActiveChatKey:", action.payload);
    },
  },
});

export const {
  setNotifications,
  addNotification,
  updateNotification,
  markNotificationAsRead,
  clearNotifications,
  setIsInChatComponent,
  setActiveChatKey,
} = notificationSlice.actions;

export default notificationSlice.reducer;