import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import smallStruct from "../structPresets/smallStruct";
import { Structure } from "../structPresets/type";

const structExpSlice = createSlice({
    name: "structExplorer",
    initialState: smallStruct,
    reducers: {
        structureChanged(state, action: PayloadAction<Structure>) {
            state.unaryPredicates = action.payload.unaryPredicates;
            state.mainPredicate = action.payload.mainPredicate;
            state.domain = action.payload.domain;
            state.constants = action.payload.constants;
        },
        mainPredicateRemoved(state, action: PayloadAction<[string, string][]>) {
            state.mainPredicate.interpretation =
                state.mainPredicate.interpretation.filter(
                    ([a, b]) =>
                        !action.payload.some(
                            ([ap, bp]) => ap === a && bp === b,
                        ),
                );
        },
        mainPredicateAdded(state, action: PayloadAction<[string, string]>) {
            state.mainPredicate.interpretation.push(action.payload);
        },
        mainPredicateChanged(state, action: PayloadAction<[string, string][]>) {
            state.mainPredicate.interpretation = action.payload;
        },
    },
});

export const {
    structureChanged,
    mainPredicateRemoved,
    mainPredicateAdded,
    mainPredicateChanged,
} = structExpSlice.actions;

export default structExpSlice.reducer;
