// app/store.ts
import { configureStore } from '@reduxjs/toolkit';
import appReducer from './features/app/appSlice';
import dictReducer from './features/dict/dictSlice';
import menuReducer from './features/menu/menuSlice';
import userReducer from './features/user/userSlice';
import storage from 'redux-persist/lib/storage';
import { persistStore, persistReducer } from 'redux-persist';

const persistConfig = {
  key: 'root',
  storage,  // Use localStorage (or sessionStorage)
  whitelist: ['user', 'menu'],  // Persist these slices of state
};

const persistedUserReducer = persistReducer(persistConfig, userReducer);
const persistedMenuReducer = persistReducer(persistConfig, menuReducer);

const store = configureStore({
  reducer: {
    app: appReducer,
    dict: dictReducer,
    menu: persistedMenuReducer,
    user: persistedUserReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
//const persistor = persistStore(store);
export default store;
