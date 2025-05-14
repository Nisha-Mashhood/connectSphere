import { createSlice } from '@reduxjs/toolkit';

interface ReviewState {
  isReviewModalOpen: boolean;
}

const initialState: ReviewState = {
  isReviewModalOpen: false,
};

const reviewSlice = createSlice({
  name: 'review',
  initialState,
  reducers: {
    openReviewModal(state) {
      state.isReviewModalOpen = true;
    },
    closeReviewModal(state) {
      state.isReviewModalOpen = false;
    },
  },
});

export const { openReviewModal, closeReviewModal } = reviewSlice.actions;
export default reviewSlice.reducer;