import { Action, configureStore, ThunkAction } from "@reduxjs/toolkit";
import structExpReducer from "../StructureExplorer/structExplorerSlice";
import basicGraph from "../BasicGraph/basicGraphSlice";
import hasseDiagram from "../HasseDiagram/hasseDiagramSlice";

export const store = configureStore({
  reducer: {
    explorer: structExpReducer,
    graph: basicGraph,
    hasse: hasseDiagram,
  },
});

export type AppStore = typeof store;
export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk = ThunkAction<void, RootState, unknown, Action>;
