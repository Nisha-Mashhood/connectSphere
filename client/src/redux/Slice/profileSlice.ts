import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { checkMentorProfile } from '../../Service/Mentor.Service';
import { getAllRequest, getCollabDataforMentor, getCollabDataforUser, getTheRequestByUser } from '../../Service/collaboration.Service';
import { getGroupRequestsByUser, groupDetailsForMembers, groupDetailsWithAdminId } from '../../Service/Group.Service';
import { getUser_UserRequests } from '../../Service/User-User.Service';
import { FetchCollabDetailsArgs, FetchCollabDetailsResponse, FetchRequestsArgs, FetchRequestsResponse, Group, GroupMemberships, GroupRequest, Mentor, ProfileState, RequestData, UserConnection } from '../types'

const initialState: ProfileState = {
  mentorDetails: null,
  collabDetails: null,
  req: { receivedRequests: [], sentRequests: [] },
  Groups: [],
  groupRequests: [],
  groupMemberships: { groups: [] },
  userConnections: {
    sent: [],
    received: [],
  },
  loading: false,
  error: null,
};

// Thunks
export const fetchMentorDetails = createAsyncThunk<
  Mentor | null,
  string,
  { rejectValue: string }
>(
  'profile/fetchMentorDetails',
  async (userId, { rejectWithValue }) => {
    try {
      if (!userId) {
        return rejectWithValue('User ID is required');
      }
      const response = await checkMentorProfile(userId);
      return response.mentor;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchCollabDetails = createAsyncThunk<
  FetchCollabDetailsResponse,
  FetchCollabDetailsArgs,
  { rejectValue: string }
>(
  'profile/fetchCollabDetails',
  async ({ userId, role, mentorId }, { rejectWithValue }) => {
    try {
      if (!userId) {
        return rejectWithValue('User ID is required');
      }
      if (role === 'mentor') {
        if (!mentorId) {
          throw new Error('Mentor ID is required for mentor role');
        }
        const response = await getCollabDataforMentor(mentorId);
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

export const fetchRequests = createAsyncThunk<
  FetchRequestsResponse,
  FetchRequestsArgs,
  { rejectValue: string }
>(
  'profile/fetchRequests',
  async ({ userId, role, mentorId }, { rejectWithValue }) => {
    try {
      if (!userId) {
        return rejectWithValue('User ID is required');
      }
      let receivedRequests: RequestData[] = [];
      let sentRequests: RequestData[] = [];

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

export const fetchGroups = createAsyncThunk<
  Group[],
  string,
  { rejectValue: string }
>(
  'profile/fetchGroups',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await groupDetailsWithAdminId(userId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchGroupRequests = createAsyncThunk<
  GroupRequest[],
  string,
  { rejectValue: string }
>(
  'profile/fetchGroupRequests',
  async (userId, { rejectWithValue }) => {
    try {
      if (!userId) {
        return rejectWithValue('User ID is required');
      }
      const response = await getGroupRequestsByUser(userId);
      const filteredRequests = response.data.filter(
        (request: GroupRequest) => request.groupId?.adminId !== userId
      );
      return filteredRequests;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchGroupDetailsForMembers = createAsyncThunk<
  GroupMemberships,
  string,
  { rejectValue: string }
>(
  'profile/fetchGroupDetailsForMembers',
  async (userId, { rejectWithValue }) => {
    try {
      if (!userId) {
        return rejectWithValue('User ID is required');
      }
      const response = await groupDetailsForMembers(userId);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchUserConnections = createAsyncThunk<
  { sent: UserConnection[]; received: UserConnection[] },
  string,
  { rejectValue: string }
>(
  'profile/fetchUserConnections',
  async (userId, { rejectWithValue }) => {
    try {
      if (!userId) {
        return rejectWithValue('User ID is required');
      }
      const response = await getUser_UserRequests(userId);
      return {
        sent: response.sentRequests || [],
        received: response.receivedRequests || [],
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);


export const refreshCollaborations = createAsyncThunk<
  void,
  { userId: string; role: 'mentor' | 'user'; mentorId?: string }
>('profile/refreshCollaborations', async (args, { dispatch }) => {
  await dispatch(
    fetchCollabDetails({
      userId: args.userId,
      role: args.role,
      mentorId: args.mentorId,
    })
  );
});


// Slice
const profileSlice = createSlice({
  name: 'profile',
  initialState,
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
        state.userConnections = action.payload;
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
