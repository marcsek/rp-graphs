import type { PredicateNodeType } from "./graphComponents/PredicateNode";
import type { DirectEdgeType } from "./graphComponents/DirectEdge";
import {
    createSelector,
    createSlice,
    type PayloadAction,
} from "@reduxjs/toolkit";
import type {
    Language,
    Structure,
} from "../components/StructureExplorer/structure.type";
import type { AppThunk, RootState } from "../app/store";
import {
    addEdge,
    applyEdgeChanges,
    applyNodeChanges,
    type Connection,
    type EdgeChange,
    type NodeChange,
} from "@xyflow/react";
import {
    domainChanged,
    predInterpretationChanged,
} from "../components/StructureExplorer/structureSlice";
import {
    expandReducedPoset,
    type BinaryRelation,
} from "./HasseDiagram/posetHelpers";
import {
    graphTypes,
    plugins,
    processEdgesToRelation,
    processHideNodes,
    processSyncNodes,
    processSyncPredIntr,
    type GraphState,
    type GraphType,
} from "./plugins.ts";

export type GraphManagerState = Record<string, GraphState>;

type WithGraphId<T> = { id: string; type: GraphType } & T;

export const graphManagerSlice = createSlice({
    name: "graphManager",
    initialState: {} as GraphManagerState,
    reducers: {
        setStructure(
            _,
            action: PayloadAction<{ struct: Structure; lang: Language }>,
        ) {
            const { struct, lang } = action.payload;
            return initGraphManagerFromStruct(struct, lang);
        },

        setNodes(
            state,
            action: PayloadAction<WithGraphId<{ nodes: PredicateNodeType[] }>>,
        ) {
            const { id, type, nodes } = action.payload;
            state[id][type].nodes = nodes;
        },

        setEdges(
            state,
            action: PayloadAction<WithGraphId<{ edges: DirectEdgeType[] }>>,
        ) {
            const { id, type, edges } = action.payload;
            state[id][type].edges = edges;
        },

        edgeAdded(
            state,
            action: PayloadAction<WithGraphId<{ edge: DirectEdgeType }>>,
        ) {
            const { id, type, edge } = action.payload;
            state[id][type].edges = [...state[id][type].edges, edge];
        },

        onNodesChanged(
            state,
            action: PayloadAction<
                WithGraphId<{ changes: NodeChange<PredicateNodeType>[] }>
            >,
        ) {
            const { id, type, changes } = action.payload;
            state[id][type].nodes = applyNodeChanges(
                changes,
                state[id][type].nodes,
            );
        },

        predicateToggled(
            state,
            action: PayloadAction<WithGraphId<{ predicate: string }>>,
        ) {
            const { id, type, predicate } = action.payload;

            const selected = state[id][type].selectedPreds;
            if (selected.includes(predicate))
                state[id][type].selectedPreds = selected.filter(
                    (pred) => pred != predicate,
                );
            else selected.push(predicate);
        },

        nodeToggled(
            state,
            action: PayloadAction<WithGraphId<{ node: string }>>,
        ) {
            const { id, type, node } = action.payload;

            (state[id][type] as GraphState[typeof type]) = processHideNodes(
                plugins[type],
                state[id][type],
                node,
            );
        },
    },

    extraReducers(builder) {
        builder.addCase(domainChanged, (state, action) => {
            for (const [, graphs] of Object.entries(state)) {
                for (const graphType of graphTypes) {
                    const graphState = graphs[graphType];
                    const plugin = plugins[graphType];
                    const domain = action.payload;

                    (graphs[graphType] as GraphState[typeof graphType]) =
                        processSyncNodes(plugin, graphState, domain);
                }
            }
        });

        builder.addCase(predInterpretationChanged, (state, action) => {
            const { name, intr } = action.payload;

            if (!(name in state)) return;

            const graphs = state[name];
            for (const graphType of graphTypes) {
                const graphState = graphs[graphType];
                const plugin = plugins[graphType];

                (graphs[graphType] as GraphState[typeof graphType]) =
                    processSyncPredIntr(
                        plugin,
                        graphState,
                        intr as BinaryRelation<string>,
                    );
            }
        });
    },
});

export const selectBinaryPreds = createSelector(
    [(state: RootState) => state.language.predicates],
    (preds) => Object.values(preds).filter((pred) => pred.arity === 2),
);

export const selectRelevantConstants = createSelector(
    [
        (state: RootState) => state.structure.iC,
        (_: RootState, predName: string) => predName,
    ],
    (iC, predName) => Object.keys(iC).filter((c) => iC[c] === predName),
);

export const selectUnaryPreds = createSelector(
    [(state: RootState) => state.language.predicates],
    (predicates) =>
        Object.keys(predicates).filter((pred) => predicates[pred].arity === 1),
);

export const selectRelevantUnaryPreds = createSelector(
    [
        (state: RootState) => state.structure.iP,
        (_: RootState, predName: string) => predName,
    ],
    (iP, predName) =>
        Object.keys(iP).filter((p) =>
            iP[p].some((t) => t.length === 1 && t[0] === predName),
        ),
);

export const onEdgesChanged = ({
    id,
    type,
    changes,
}: {
    id: string;
    type: GraphType;
    changes: EdgeChange<DirectEdgeType>[];
}): AppThunk => {
    return (dispatch, getState) => {
        const managerState = getState().graphState;

        const newEdges = applyEdgeChanges(
            changes,
            managerState[id][type].edges,
        );

        const structFormat = processEdgesToRelation(plugins[type], {
            ...managerState[id][type],
            edges: newEdges,
        });

        console.log("Edges Changed");

        dispatch(setEdges({ id, type, edges: newEdges }));
        dispatch(predInterpretationChanged({ name: id, intr: structFormat }));
    };
};

export const onConnected = ({
    id,
    type,
    connection,
}: {
    id: string;
    type: GraphType;
    connection: Connection;
}): AppThunk => {
    return (dispatch, getState) => {
        const managerState = getState().graphState;

        const newEdges = addEdge(connection, managerState[id][type].edges);

        const structFormat = processEdgesToRelation(plugins[type], {
            ...managerState[id][type],
            edges: newEdges,
        });

        console.log("On Connected");

        dispatch(predInterpretationChanged({ name: id, intr: structFormat }));
    };
};

export const selectedNodesChanged = ({
    id,
    type,
    toggledNode,
}: {
    id: string;
    type: GraphType;
    toggledNode: string;
}): AppThunk => {
    return (dispatch, getState) => {
        dispatch(nodeToggled({ id, type, node: toggledNode }));

        if (type === "hasse" && getState().graphState[id][type].isPoset) {
            const graphState = getState().graphState[id][type];
            const vissibleNodes = graphState.nodes
                .filter((node) => !node.hidden)
                .map((node) => node.id);

            const vissibleEdges = graphState.edges
                .filter(
                    ({ source, target }) =>
                        vissibleNodes.includes(source) &&
                        vissibleNodes.includes(target),
                )
                .map(({ source, target }) => [
                    source,
                    target,
                ]) as BinaryRelation<string>;

            const newRelation = expandReducedPoset(
                vissibleEdges,
                new Set(vissibleNodes),
            );

            dispatch(
                predInterpretationChanged({ name: id, intr: newRelation }),
            );
        }
    };
};

const initGraphManagerFromStruct = (struct: Structure, lang: Language) => {
    const managerState: GraphManagerState = {};

    const binaryPreds = Object.keys(lang.predicates).filter(
        (pred) => lang.predicates[pred].arity === 2,
    );

    binaryPreds.forEach((binaryPred) => {
        const predicate = {
            name: binaryPred,
            intr: struct.iP[binaryPred] as BinaryRelation<string>,
        };

        managerState[binaryPred] = {
            oriented: plugins.oriented.init(struct.domain, predicate),
            hasse: plugins.hasse.init(struct.domain, predicate),
            bipartite: plugins.bipartite.init(struct.domain, predicate),
        };
    });

    return managerState;
};

export const {
    setStructure,
    setNodes,
    setEdges,
    edgeAdded,
    onNodesChanged,
    predicateToggled,
    nodeToggled,
} = graphManagerSlice.actions;

export default graphManagerSlice.reducer;
