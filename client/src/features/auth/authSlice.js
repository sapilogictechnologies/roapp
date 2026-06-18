import { createSlice } from '@reduxjs/toolkit';

const getStoredToken = () => {
  try { return localStorage.getItem('ro_token') || null; } catch { return null; }
};
const getStoredUser = () => {
  try { const u = localStorage.getItem('ro_user'); return u ? JSON.parse(u) : null; } catch { return null; }
};

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: getStoredToken(),
    user: getStoredUser(),
    isAuthenticated: !!getStoredToken(),
  },
  reducers: {
    setCredentials: (state, { payload }) => {
      state.token = payload.token;
      state.user = payload.user;
      state.isAuthenticated = true;
      try {
        localStorage.setItem('ro_token', payload.token);
        localStorage.setItem('ro_user', JSON.stringify(payload.user));
      } catch {}
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      try {
        localStorage.removeItem('ro_token');
        localStorage.removeItem('ro_user');
      } catch {}
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectToken = (state) => state.auth.token;
