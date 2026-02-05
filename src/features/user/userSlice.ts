import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { login, logout, getInfo } from '../../api/auth/login';
import { getToken, setToken, removeToken } from '../../utils/auth';

interface UserState {
  token: string | null;
  id: string;
  name: string;
  nickname?: string;
  avatar: string;
  roles: string[];
  permissions: string[];
  loading?: boolean;
  error?: string | null;
}

const initialState: UserState = {
  token: getToken() || null,
  id: '',
  name: '',
  nickname: '',
  avatar: '',
  roles: [],
  permissions: [],
  loading: false,
  error: null,
};

// Login thunk
export const loginUser = createAsyncThunk(
  'user/login',
  async (
    {
      username,
      password,
      code,
      uuid,
    }: { username: string; password: string; code: string; uuid: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await login(username, password, code, uuid);
      const token = response.token;
      if (!token) {
        throw new Error('Missing token in login response');
      }

      setToken(token);
      return token;
    } catch (error: any) {
      console.error('Login thunk error:', error);

      const backendMsg =
        error?.response?.data?.msg ||
        error?.response?.data?.message ||
        error?.data?.msg ||
        error?.data?.message;

      return rejectWithValue(backendMsg || error?.message || 'Login failed');
    }
  }
);

// Get user info thunk
export const fetchUserInfo = createAsyncThunk(
  'user/getInfo',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getInfo();
      console.log('🔍 Get Info response:', response);
      return response;
    } catch (error) {
      // Pass only the error message string, not the entire Error object
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('getInfo failed:', errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// Logout thunk
export const logoutUser = createAsyncThunk('user/logout', async () => {
  await logout();
  removeToken();
});

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Frontend logout action
    frontendLogout(state) {
      state.token = null;
      state.roles = [];
      state.permissions = [];
      removeToken();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<string>) => {
        state.token = action.payload;
        state.loading = false;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchUserInfo.fulfilled, (state, action) => {
        const user = action.payload.user;
        state.id = user.userId;
        state.name = user.userName;
        state.nickname = user.nickName;
        state.avatar = user.avatar;
        state.roles = action.payload.roles.length > 0 ? action.payload.roles : ['ROLE_DEFAULT'];
        state.permissions = action.payload.permissions;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.token = null;
        state.roles = [];
        state.permissions = [];
      });
  },
});

export const selectUserRoles = (state: { user: UserState }) => state.user.roles;
export const selectUserPermissions = (state: { user: UserState }) => state.user.permissions;
export const { frontendLogout } = userSlice.actions;
export default userSlice.reducer;
