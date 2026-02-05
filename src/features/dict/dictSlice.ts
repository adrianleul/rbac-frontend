// features/dict/dictSlice.ts
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface DictItem {
  key: string;
  value: any;
}

interface DictState {
  dict: DictItem[];
}

const initialState: DictState = {
  dict: [],
};

const dictSlice = createSlice({
  name: 'dict',
  initialState,
  reducers: {
    setDict(state, action: PayloadAction<DictItem>) {
      const { key, value } = action.payload;
      if (key) {
        state.dict.push({ key, value });
      }
    },
    removeDict(state, action: PayloadAction<string>) {
      state.dict = state.dict.filter((item) => item.key !== action.payload);
    },
    cleanDict(state) {
      state.dict = [];
    },
  },
});

export const { setDict, removeDict, cleanDict } = dictSlice.actions;
export default dictSlice.reducer;
