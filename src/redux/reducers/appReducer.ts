import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AppState {
  isSidebarOpen: boolean;
  lastPath: string;
}

const initialState: AppState = {
  isSidebarOpen: false,
  lastPath: ""
};

const appReducer = createSlice({
  name: "app",
  initialState,
  reducers: {
    setSideBar(state, action: PayloadAction<boolean>) {
      state.isSidebarOpen = action.payload;
    },
    setLastPath(state, action: PayloadAction<string>) {
      state.lastPath = action.payload;
    },
    resetLastPath(state) {
      state.lastPath = initialState.lastPath;
    }

  },
});

export const { setSideBar, setLastPath, resetLastPath } = appReducer.actions;

export default appReducer.reducer;
