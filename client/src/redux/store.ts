import { AnyAction, combineReducers, configureStore } from '@reduxjs/toolkit';
import userReducer, { signOut } from './Slice/userSlice';
import profileReducer from './Slice/profileSlice';
import  notificationReducer from './Slice/notificationSlice';
import reviewReducer from './Slice/reviewSlice';
import callReducer from './Slice/callSlice';
import storage from 'redux-persist/lib/storage';
import { persistReducer, persistStore } from 'redux-persist';

const appReducer = combineReducers({
    user: userReducer,
    profile: profileReducer,
    notification: notificationReducer,
    review: reviewReducer,
    call: callReducer,
});

const rootReducer = (state: ReturnType<typeof appReducer>, action: AnyAction) => {
    if (action.type === signOut.type) {
        state = undefined;
    }
    return appReducer(state || undefined, action);
};

const persistConfig = {
    key: 'root',
    version: 1,
    storage,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export const persistor = persistStore(store);

// RootState type
export type RootState = ReturnType<typeof store.getState>;

// AppDispatch type
export type AppDispatch = typeof store.dispatch;
