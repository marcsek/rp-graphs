import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Language } from "./structure.type";

export interface LanguageState extends Language {}

export const initialState: LanguageState = {
    constants: ["Tim", "Anna", "Karen"],
    predicates: {
        teacher: { name: "teacher", arity: 1 },
        student: { name: "student", arity: 1 },
        teaches: { name: "teaches", arity: 2 },
        likes: { name: "likes", arity: 2 },
    },
};

export const languageSlice = createSlice({
    name: "language",
    initialState,
    reducers: {
        constantsChanged(state, action: PayloadAction<Language["constants"]>) {
            state.constants = action.payload;
        },

        predicatesChanged(
            state,
            action: PayloadAction<Language["predicates"]>,
        ) {
            state.predicates = action.payload;
        },
    },
});

export const { constantsChanged, predicatesChanged } = languageSlice.actions;

export default languageSlice.reducer;
