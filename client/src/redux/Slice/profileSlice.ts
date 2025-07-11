import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { checkMentorProfile } from '../../Service/Mentor.Service';
import { getAllRequest, getCollabDataforMentor, getCollabDataforUser, getTheRequestByUser } from '../../Service/collaboration.Service';
import { getGroupRequestsByUser, groupDetailsForMembers, groupDetailsWithAdminId } from '../../Service/Group.Service';
import { getUser_UserRequests } from '../../Service/User-User.Service';
import { User } from '../../types';

// Define the argument type for the thunk
interface FetchCollabDetailsArgs {
    userId: string;
    role: 'mentor' | 'user';
  }
  
  // Define the return type for the thunk
  interface FetchCollabDetailsResponse {
    role: 'mentor' | 'user';
    data: any; 
  }

  interface FetchRequestsArgs {
    userId: string;
    role: 'mentor' | 'user';
    mentorId?: string;
  }
  
  interface FetchRequestsResponse {
    receivedRequests: any[];
    sentRequests: any[];
  }

  interface UserConnection {
    _id: string;
    requester:User;
    recipient: User;
    requestStatus: 'Pending' | 'Accepted' | 'Rejected';
    connectionStatus: 'Connected' | 'Disconnected';
    requestSentAt: Date;
    requestAcceptedAt?: Date;
    disconnectedAt?: Date;
    disconnectionReason?: string;
  }

// Thunk to fetch mentor details
export const fetchMentorDetails = createAsyncThunk(
    'profile/fetchMentorDetails',
    async (userId: string, { rejectWithValue }) => {  
      try {
        const response = await checkMentorProfile(userId);
        return response.mentor; 
      } catch (error) {
        return rejectWithValue(error.message);
      }
    }
  );

// Thunk to fetch collaboration details
export const fetchCollabDetails = createAsyncThunk<
FetchCollabDetailsResponse, 
FetchCollabDetailsArgs,   
{ rejectValue: string }    
>(
  'profile/fetchCollabDetails',
  async ({ userId, role }, { rejectWithValue }) => {
    try {
      if (role === 'mentor') {
        const response = await getCollabDataforMentor(userId);
        return { role, data: response.collabData };
      } else {
        const response = await getCollabDataforUser(userId);
        return { role, data: response.collabData };
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Thunk to fetch requests
export const fetchRequests = createAsyncThunk<
  FetchRequestsResponse,
  FetchRequestsArgs,
  { rejectValue: string }
>(
  'profile/fetchRequests',
  async ({ userId, role, mentorId }, { rejectWithValue }) => {
    try {
      let receivedRequests = [];
      let sentRequests = [];

      if (role === 'user') {
        const response = await getTheRequestByUser(userId);
        sentRequests = response.requests;
      } else if (role === 'mentor' && mentorId) {
        const receivedResponse = await getAllRequest(mentorId);
        receivedRequests = receivedResponse.requests;

        const sentResponse = await getTheRequestByUser(userId);
        sentRequests = sentResponse.requests;
      }
      
      return { receivedRequests, sentRequests };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch groups created by the user
export const fetchGroups = createAsyncThunk(
  'profile/fetchGroups',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await groupDetailsWithAdminId(userId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch group requests sent by the user
export const fetchGroupRequests = createAsyncThunk(
  'profile/fetchGroupRequests',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await getGroupRequestsByUser(userId);
      const filteredRequests = response.data.filter(
        (request) => request.groupId?.adminId !== userId
      );
      return filteredRequests;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

//Fetch group deatils where user is a member
export const fetchGroupDetailsForMembers = createAsyncThunk(
  'profile/fetchGroupDetailsForMembers',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await groupDetailsForMembers(userId);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Thunk for fetching user-user connection requests
export const fetchUserConnections = createAsyncThunk(
  'profile/fetchUserConnections',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await getUser_UserRequests(userId);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);


// Slice
const profileSlice = createSlice({
  name: 'profile',
  initialState: {
    mentorDetails: null,
    collabDetails: null,
    req: { receivedRequests: [], sentRequests: [] },
    Groups: [],
    groupRequests: [],
    groupMemberships: [],
    userConnections: {
      sent: [] as UserConnection[],
      received: [] as UserConnection[],
    },
    loading: false,
    error: null,
  },
  reducers: {
    updateMentorInfo: (state, action) => {
      state.mentorDetails = {
        ...state.mentorDetails,
        ...action.payload
      };
    },
    setGroupRequests: (state, action) => {
      state.groupRequests = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Mentor Details
      .addCase(fetchMentorDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMentorDetails.fulfilled, (state, action) => {
        state.mentorDetails = action.payload;
        state.loading = false;
      })
      .addCase(fetchMentorDetails.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })

      // Fetch Collaboration Details
      .addCase(fetchCollabDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCollabDetails.fulfilled, (state, action) => {
        const { role, data } = action.payload;
        state.collabDetails = { type: role, data };
        state.loading = false;
      })
      .addCase(fetchCollabDetails.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })

      //Fetch request details
      .addCase(fetchRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRequests.fulfilled, (state, action) => {
        state.req.receivedRequests = action.payload.receivedRequests;
        state.req.sentRequests = action.payload.sentRequests;
        state.loading = false;
      })
      .addCase(fetchRequests.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })

      // Fetch groups
      .addCase(fetchGroups.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGroups.fulfilled, (state, action) => {
        state.Groups = action.payload;
        state.loading = false;
      })
      .addCase(fetchGroups.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })

      // Fetch group requests
      .addCase(fetchGroupRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGroupRequests.fulfilled, (state, action) => {
        state.groupRequests = action.payload;
        state.loading = false;
      })
      .addCase(fetchGroupRequests.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })

      //group membership
      .addCase(fetchGroupDetailsForMembers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGroupDetailsForMembers.fulfilled, (state, action) => {
        state.groupMemberships = action.payload;
        state.loading = false;
      })
      .addCase(fetchGroupDetailsForMembers.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })

      //user - user connections
      .addCase(fetchUserConnections.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserConnections.fulfilled, (state, action) => {
        state.userConnections = {
          sent: action.payload.sentRequests || [],
          received: action.payload.receivedRequests || [],
        };
        state.loading = false;
      })
      .addCase(fetchUserConnections.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      });
  },
});

export const { 
  updateMentorInfo,
   setGroupRequests
} = profileSlice.actions;

export default profileSlice.reducer;
