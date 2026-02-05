import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';  // Use js-cookie for client-side cookie management

interface SidebarState {
  opened: boolean;
  withoutAnimation: boolean;
  hide: boolean;
}

interface AppState {
  sidebar: SidebarState;
  device: 'desktop' | 'mobile';
  size: string;
}

// Initialize state from cookies (client-side)
const initialState: AppState = {
  sidebar: {
    opened: Cookies.get('sidebarStatus') === '1',  // Get from cookies and parse it
    withoutAnimation: false,
    hide: false,
  },
  device: 'desktop',
  size: Cookies.get('size') || 'medium',  // Get from cookies, default to 'medium' if not found
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    toggleSidebar(state) {
      if (state.sidebar.hide) return;
      state.sidebar.opened = !state.sidebar.opened;
      state.sidebar.withoutAnimation = false;
      // Save to cookies (client-side)
      Cookies.set('sidebarStatus', state.sidebar.opened ? '1' : '0');
    },
    closeSidebar(state, action: PayloadAction<boolean>) {
      // Save to cookies (client-side)
      Cookies.set('sidebarStatus', '0');
      state.sidebar.opened = false;
      state.sidebar.withoutAnimation = action.payload;
    },
    toggleDevice(state, action: PayloadAction<'desktop' | 'mobile'>) {
      state.device = action.payload;
    },
    setSize(state, action: PayloadAction<string>) {
      state.size = action.payload;
      // Save to cookies (client-side)
      Cookies.set('size', action.payload);
    },
    setSidebarHide(state, action: PayloadAction<boolean>) {
      state.sidebar.hide = action.payload;
    },
  },
});

export const { toggleSidebar, closeSidebar, toggleDevice, setSize, setSidebarHide } = appSlice.actions;
export default appSlice.reducer;
