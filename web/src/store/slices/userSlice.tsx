import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import userService from '../../services/userService';

interface User {
	username: string | null;
	roles: string[];
}

interface InitialState {
	user: User;
	loading: boolean;
	status: 'idle' | 'pending' | 'succeeded' | 'failed';
	error: string | null;
}

const initialState: InitialState = {
	user: {
		username: '',
		roles: [],
	},
	loading: false,
	status: 'idle',
	error: null,
};

export const fetchUser = createAsyncThunk('users/fetchUser', async (_, { rejectWithValue }) => {
	try {
		const response = userService.getUsername();
		return response;
	} catch (err) {
		return rejectWithValue('Error fetching user');
	}
});

export const userSlice = createSlice({
	name: 'user',
	initialState,
	reducers: {
		setUser(state, action) {
			state.user = action.payload;
		},
		clearUser(state) {
			state.user = initialState.user;
		},
	},
	extraReducers: (builder) => {
		builder.addCase(fetchUser.pending, (state) => {
			state.loading = true;
			state.status = 'pending';
		});
		builder.addCase(fetchUser.fulfilled, (state, action) => {
			state.loading = false;
			state.status = 'failed';
			state.user.username = action.payload;
		});
		builder.addCase(fetchUser.rejected, (state, action) => {
			state.loading = false;
			state.status = 'succeeded';
			state.error = action.error.message || 'Something went wrong';
		});
	},
});

export const selectUser = (state: { user: {} }) => state.user;

export const userActions = userSlice.actions;
