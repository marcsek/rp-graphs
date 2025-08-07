import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Structure } from "./structure.type";
import { constantsChanged, predicatesChanged } from "./languageSlice";

export interface StructureState extends Structure {}

export const initialState: StructureState = {
    domain: ["a", "b", "c", "d"],

    iC: { Tim: "a", Anna: "b", Karen: "c" },
    iP: {
        teacher: [["a"]],
        student: [["b"], ["c"]],
        teaches: [
            ["a", "b"],
            ["a", "a"],
            ["b", "b"],
            ["c", "c"],
            ["a", "c"],
            ["d", "d"],
        ],
        likes: [
            ["c", "a"],
            ["b", "c"],
            ["a", "a"],
            ["b", "b"],
            ["c", "c"],
            ["b", "a"],
        ],
    },
};

export const structureSlice = createSlice({
    name: "structure",
    initialState,
    reducers: {
        domainChanged(state, action: PayloadAction<Structure["domain"]>) {
            state.domain = action.payload;
        },

        constInterpretationChanged(
            state,
            action: PayloadAction<{
                name: string;
                intr: Structure["iC"][string];
            }>,
        ) {
            const { name, intr } = action.payload;
            state.iC[name] = intr;
        },

        predInterpretationChanged(
            state,
            action: PayloadAction<{
                name: string;
                intr: Structure["iP"][string];
            }>,
        ) {
            const { name, intr } = action.payload;
            state.iP[name] = intr;
        },
    },

    extraReducers(builder) {
        builder.addCase(constantsChanged, (state, action) => {
            const newConstants = new Set(action.payload);

            for (const oldConst in state.iC) {
                if (!newConstants.has(oldConst)) delete state.iC[oldConst];
            }
        });

        builder.addCase(predicatesChanged, (state, action) => {
            const newPreds = new Set(Object.keys(action.payload));

            for (const oldPred in state.iP) {
                if (!newPreds.has(oldPred)) delete state.iP[oldPred];
            }
        });
    },
});

export const {
    constInterpretationChanged,
    domainChanged,
    predInterpretationChanged,
} = structureSlice.actions;

export default structureSlice.reducer;
