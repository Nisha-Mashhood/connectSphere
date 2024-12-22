import { createSlice } from "@reduxjs/toolkit";

const categorySlice = createSlice({
  name: "categories",
  initialState: {
    categories: [],
    loading: false,
    error: null,
  },
  reducers: {
    addCategoryStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    addCategorySuccess: (state, action) => {
      state.loading = false;
      state.categories.push(action.payload);
    },
    addCategoryFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { addCategoryStart, addCategorySuccess, addCategoryFailure } =
  categorySlice.actions;

export default categorySlice.reducer;
