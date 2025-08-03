import {
    configureStore,
    type Action,
    type ThunkAction,
} from "@reduxjs/toolkit";

import structureReducer from "../components/StructureExplorer/structureSlice";
import languageReducer from "../components/StructureExplorer/languageSlice.ts";

export const store = configureStore({
    reducer: {
        structure: structureReducer,
        language: languageReducer,
    },
});

export type AppStore = typeof store;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
export type AppThunk<ThunkReturnType = void> = ThunkAction<
    ThunkReturnType,
    RootState,
    unknown,
    Action
>;
