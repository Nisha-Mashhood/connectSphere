import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { checkMentorProfile } from '../../Service/Mentor.Service';
import { getCollabDataforMentor, getCollabDataforUser } from '../../Service/collaboration.Service';

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
FetchCollabDetailsResponse, // Return type
FetchCollabDetailsArgs,    // Argument type
{ rejectValue: string }    // Reject value type
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

// Slice
const profileSlice = createSlice({
  name: 'profile',
  initialState: {
    mentorDetails: null,
    collabDetails: null,
    loading: false,
    error: null,
  },
  reducers: {},
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
        if (role === 'mentor') {
          state.collabDetails = { type: 'mentor', data };
        } else {
          state.collabDetails = { type: 'user', data };
        }
        state.loading = false;
      })
      .addCase(fetchCollabDetails.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      });
  },
});

export default profileSlice.reducer;