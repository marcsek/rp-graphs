import type { PredicateNodeType } from "../graphComponents/PredicateNode";
import type { DirectEdgeType } from "../graphComponents/DirectEdge";
import {
    createSelector,
    createSlice,
    type PayloadAction,
} from "@reduxjs/toolkit";
import {
    addEdge,
    applyEdgeChanges,
    applyNodeChanges,
    type Connection,
    type EdgeChange,
    type NodeChange,
} from "@xyflow/react";
import type {
    Language,
    Structure,
} from "../../components/StructureExplorer/structure.type";
import type { AppThunk, RootState } from "../../app/store";
import {
    domainChanged,
    predInterpretationChanged,
} from "../../components/StructureExplorer/structureSlice";

export type OrientedGraphState = Record<
    string,
    {
        nodes: PredicateNodeType[];
        edges: DirectEdgeType[];
    }
>;

const convertStructToGraph = (struct: Structure, lang: Language) => {
    const graphs: OrientedGraphState = {};

    const binaryPreds = Object.keys(lang.predicates).filter(
        (pred) => lang.predicates[pred].arity === 2,
    );

    binaryPreds.forEach((binaryPred) => {
        const iP = struct.iP[binaryPred];
        graphs[binaryPred] = { nodes: [], edges: [] };

        struct.domain.forEach((domElement) => {
            graphs[binaryPred].nodes.push({
                id: domElement,
                type: "predicate",
                position: { x: 0, y: 0 },
                data: { label: domElement },
                //hidden: !iP.flat().includes(domElement),
            });
        });

        iP.forEach(([predA, predB]) => {
            graphs[binaryPred].edges.push({
                id: `eg-${predA}->${predB}`,
                source: predA,
                target: predB,
            });
        });
    });

    return graphs;
};

const initialState: OrientedGraphState = {};

export const orientedGraphSlice = createSlice({
    name: "orientedGraph",
    initialState,
    reducers: {
        setStructure(
            _,
            action: PayloadAction<{ struct: Structure; lang: Language }>,
        ) {
            const { struct, lang } = action.payload;
            return convertStructToGraph(struct, lang);
        },

        setNodes(
            state,
            action: PayloadAction<{ id: string; nodes: PredicateNodeType[] }>,
        ) {
            const { id, nodes } = action.payload;
            state[id].nodes = nodes;
        },

        setEdges(
            state,
            action: PayloadAction<{ id: string; edges: DirectEdgeType[] }>,
        ) {
            const { id, edges } = action.payload;
            state[id].edges = edges;
        },

        edgeAdded(
            state,
            action: PayloadAction<{ id: string; edge: DirectEdgeType }>,
        ) {
            const { id, edge } = action.payload;
            state[id].edges = [...state[id].edges, edge];
        },

        onNodesChanged(
            state,
            action: PayloadAction<{
                id: string;
                changes: NodeChange<PredicateNodeType>[];
            }>,
        ) {
            const { id, changes } = action.payload;
            state[id].nodes = applyNodeChanges(changes, state[id].nodes);
        },
    },

    extraReducers(builder) {
        builder.addCase(domainChanged, (state, action) => {
            for (const [id, graphState] of Object.entries(state)) {
                let nodes = [...graphState.nodes];
                const domain = action.payload;

                const newNodes = domain.map((element) => {
                    const existingNode = nodes.find(
                        (node) => node.id === element,
                    );

                    return existingNode
                        ? { ...existingNode }
                        : {
                              id: element,
                              type: "predicate",
                              position: { x: 0, y: 0 },
                              data: { label: element },
                          };
                });

                state[id].nodes = newNodes;
            }
        });

        builder.addCase(predInterpretationChanged, (state, action) => {
            const { name, intr: newIP } = action.payload;

            const newEdges = newIP.map(([source, target]) => {
                const id = `eg-${source}->${target}`;
                const existingEdge = state[name].edges.find(
                    (edge) => edge.id === id,
                );

                return existingEdge
                    ? { ...existingEdge }
                    : { id, source, target };
            });

            state[name].edges = newEdges;
        });
    },
});

export const selectBinaryPreds = createSelector(
    [(state: RootState) => state.language.predicates],
    (preds) => Object.values(preds).filter((pred) => pred.arity === 2),
);

export const onEdgesChanged = ({
    id,
    changes,
}: {
    id: string;
    changes: EdgeChange<DirectEdgeType>[];
}): AppThunk => {
    return (dispatch, getState) => {
        const orientedGraphState = getState().orientedGraph;

        const newEdges = applyEdgeChanges(
            changes,
            orientedGraphState[id].edges,
        );

        const structFormat = newEdges.map((edge) => [edge.source, edge.target]);

        console.log("Edges Changed");

        dispatch(setEdges({ id, edges: newEdges }));
        dispatch(predInterpretationChanged({ name: id, intr: structFormat }));
    };
};

export const onConnected = ({
    id,
    connection,
}: {
    id: string;
    connection: Connection;
}): AppThunk => {
    return (dispatch, getState) => {
        const orientedGraphState = getState().orientedGraph;

        const newEdges = addEdge(connection, orientedGraphState[id].edges);

        const structFormat = newEdges.map((edge) => [edge.source, edge.target]);

        console.log("On Connected");

        dispatch(predInterpretationChanged({ name: id, intr: structFormat }));
    };
};

export const { setStructure, setNodes, setEdges, edgeAdded, onNodesChanged } =
    orientedGraphSlice.actions;

export default orientedGraphSlice.reducer;
