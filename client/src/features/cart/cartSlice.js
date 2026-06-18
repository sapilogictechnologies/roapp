import { createSlice } from '@reduxjs/toolkit';

const CART_KEY = 'ro_cart_items';

const loadCart = () => {
  try {
    const value = localStorage.getItem(CART_KEY);
    const items = value ? JSON.parse(value) : [];
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
};

const saveCart = (items) => {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  } catch {}
};

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: loadCart() },
  reducers: {
    addToCart: (state, { payload }) => {
      const existing = state.items.find((i) => i.product === payload.product);
      if (existing) existing.quantity += payload.quantity || 1;
      else state.items.push({ ...payload, quantity: payload.quantity || 1, hasEmptyJar: payload.hasEmptyJar ?? true });
      saveCart(state.items);
    },
    removeFromCart: (state, { payload }) => {
      state.items = state.items.filter((i) => i.product !== payload);
      saveCart(state.items);
    },
    updateQuantity: (state, { payload }) => {
      const item = state.items.find((i) => i.product === payload.product);
      if (item) item.quantity = Math.max(1, Number(payload.quantity) || 1);
      saveCart(state.items);
    },
    setHasEmptyJar: (state, { payload }) => {
      const item = state.items.find((i) => i.product === payload.product);
      if (item) item.hasEmptyJar = payload.hasEmptyJar;
      saveCart(state.items);
    },
    clearCart: (state) => {
      state.items = [];
      saveCart(state.items);
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, setHasEmptyJar, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
export const selectCart = (state) => state.cart.items;
export const selectCartTotal = (state) =>
  state.cart.items.reduce((sum, i) => sum + (i.salePrice || i.price) * i.quantity, 0);
export const selectCartCount = (state) =>
  state.cart.items.reduce((sum, i) => sum + i.quantity, 0);
