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

interface CallState {
  incomingCall: IncomingCall | null;
}

const initialState: CallState = {
  incomingCall: null,
};

const callSlice = createSlice({
  name: 'call',
  initialState,
  reducers: {
    setIncomingCall(state, action: PayloadAction<IncomingCall>) {
      console.log("Setting call info to redux");
      state.incomingCall = action.payload;
    },
    clearIncomingCall(state) {
      state.incomingCall = null;
    },
  },
});

export const { setIncomingCall, clearIncomingCall } = callSlice.actions;
export default callSlice.reducer;