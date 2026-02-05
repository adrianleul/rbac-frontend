import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction} from '@reduxjs/toolkit'
// Define the state interface
interface SidebarState {
  opened: boolean;
  withoutAnimation: boolean;
  hide: boolean;
}

interface AppState {
  sidebar: SidebarState;
  device: string;
  size: string;
}

// Initialize the state
const initialState: AppState = {
  sidebar: {
    opened: true,
    withoutAnimation: false,
    hide: false,
  },
  device: 'desktop',
  size: 'medium',
};

// Create the slice
const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    toggleSidebar(state) {
      if (!state.sidebar.hide) {
        state.sidebar.opened = !state.sidebar.opened;
        state.sidebar.withoutAnimation = false;
      }
    },
    closeSidebar(state, action: PayloadAction<boolean>) {
      state.sidebar.opened = false;
      state.sidebar.withoutAnimation = action.payload;
    },
    toggleDevice(state, action: PayloadAction<string>) {
      state.device = action.payload;
    },
    setSize(state, action: PayloadAction<string>) {
      state.size = action.payload;
    },
    setSidebarHide(state, action: PayloadAction<boolean>) {
      state.sidebar.hide = action.payload;
    },
  },
});

// Export actions and reducer
export const {
  toggleSidebar,
  closeSidebar,
  toggleDevice,
  setSize,
  setSidebarHide,
} = appSlice.actions;

export default appSlice.reducer;
