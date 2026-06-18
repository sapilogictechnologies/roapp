import { createSlice } from '@reduxjs/toolkit';
const saved = localStorage.getItem('aquaflow_theme') || 'dark';
const uiSlice = createSlice({
  name: 'ui',
  initialState: { theme: saved },
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('aquaflow_theme', state.theme);
    },
    setTheme: (state, { payload }) => {
      state.theme = payload;
      localStorage.setItem('aquaflow_theme', payload);
    },
  },
});
export const { toggleTheme, setTheme } = uiSlice.actions;
export const selectTheme = (state) => state.ui.theme;
export default uiSlice.reducer;
