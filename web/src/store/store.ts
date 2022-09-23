import { configureStore } from '@reduxjs/toolkit';
import { walletSlice } from './slices/walletSlice';

const store = configureStore({
	reducer: {
		wallet: walletSlice.reducer,
	},
});

export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
