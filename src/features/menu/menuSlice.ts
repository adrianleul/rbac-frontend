import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import Cookies from 'js-cookie'; //default import
import type { AppRoute } from '../../types/types';
import { getRouters } from '../../api/auth/menu';

interface menuState {
  routes: AppRoute[];
  addRoutes: AppRoute[];
  defaultRoutes: AppRoute[];
  topbarRouters: AppRoute[];
  sidebarRouters: AppRoute[];
}

const initialState: menuState = {
  routes: [],
  addRoutes: [],
  defaultRoutes: [],
  topbarRouters: [],
  sidebarRouters: [],
};

// Transform backend route format to AppRoute[]
const transformMenuToAppRoutes = (menus: any[]): AppRoute[] => {
  return menus.map(menu => ({
    path: menu.path,
    name: menu.name,
    component: menu.component,
    hidden: menu.hidden,
    redirect: menu.redirect,
    alwaysShow: menu.alwaysShow,
    meta: menu.meta,
    children: menu.children ? transformMenuToAppRoutes(menu.children) : [],
  }));
};
//  Async thunk to fetch menu routes from backend
export const fetchMenuRoutes = createAsyncThunk(
  'menu/fetchRoutes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getRouters();
      console.log('🔍 Raw Get Menu Routes response:', response.data);
      const menus = response.data;
      return transformMenuToAppRoutes(menus);
    } catch (err: any) {
      const errorMsg = err?.response?.data?.msg || err.message || 'Failed to fetch menus';
      console.error('❌ fetchMenuRoutes error:', errorMsg);
      return rejectWithValue(errorMsg);
    }
  }
);
const menuSlice = createSlice({
  name: 'menu',
  initialState,
  reducers: {
    // setRoutes(state, action: PayloadAction<AppRoute[]>) {
    //   state.addRoutes = action.payload;
    //   Cookies.set('addRoutes', JSON.stringify(action.payload));
    // },
    setDefaultRoutes: (state, action: PayloadAction<AppRoute[]>) => {
      state.defaultRoutes = action.payload;
      state.routes = [...action.payload, ...state.addRoutes];
      Cookies.set('setDefaultRoutes', JSON.stringify(action.payload));
    },
    // setTopbarRoutes(state, action: PayloadAction<AppRoute[]>) {
    //   state.topbarRouters = action.payload;
    //   Cookies.set('setTopbarRoutes', JSON.stringify(action.payload));
    // },
    // setSidebarRoutes(state, action: PayloadAction<AppRoute[]>) {
    //   state.sidebarRouters = action.payload;
    //   Cookies.set('sidebarRouters', JSON.stringify(action.payload));
    // },
  },
  extraReducers: builder => {
    builder.addCase(fetchMenuRoutes.fulfilled, (state, action) => {
      const addRoutes = action.payload;
      state.addRoutes = addRoutes;
      state.routes = [...state.defaultRoutes, ...addRoutes];
      state.sidebarRouters = addRoutes;
      state.topbarRouters = addRoutes;
    });
  },
});

// export const { setRoutes, setDefaultRoutes, setTopbarRoutes, setSidebarRoutes } = menuSlice.actions;
export const { setDefaultRoutes } = menuSlice.actions;
export default menuSlice.reducer;