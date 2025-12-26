import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IncomingCallData } from '../../Hooks/User/Chat/OneToOneCall/useChatCall';

interface IncomingCall {
  senderId: string;
  senderName: string;
  callType: 'audio' | 'video';
  contactType: 'user-user' | 'user-mentor';
  offerData?: IncomingCallData;
  shouldAutoAnswer?: boolean;
}
export interface IncomingGroupCall {
  groupId: string;
  starterId: string;
  starterName: string;
  roomName: string;
}

interface CallState {
  incomingCall: IncomingCall | null;
  incomingGroupCall: IncomingGroupCall | null;
  activeGroupCall: {
    groupId: string;
    roomName: string;
  } | null;
}

const initialState: CallState = {
  incomingCall: null,
  incomingGroupCall: null,
  activeGroupCall: {
    groupId: null,
    roomName: null
  }
};

const callSlice = createSlice({
  name: 'call',
  initialState,
  reducers: {
    setIncomingCall(state, action: PayloadAction<IncomingCall>) {
      state.incomingCall = action.payload;
    },
    clearIncomingCall(state) {
      state.incomingCall = null;
    },
    setIncomingGroupCall: (state, action: PayloadAction<IncomingGroupCall | null>) => {
      state.incomingGroupCall = action.payload;
    },
    clearIncomingGroupCall: (state) => {
      state.incomingGroupCall = null;
    },
    setActiveGroupCall(state, action: PayloadAction<{ groupId: string; roomName: string }>) {
      state.activeGroupCall = action.payload;
    },
    clearActiveGroupCall(state) {
      state.activeGroupCall = null;
    }
  },
});

export const { 
  setIncomingCall, 
  clearIncomingCall, 
  setIncomingGroupCall, 
  clearIncomingGroupCall,
  setActiveGroupCall,
  clearActiveGroupCall,  
} = callSlice.actions;
export default callSlice.reducer;