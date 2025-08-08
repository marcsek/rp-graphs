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
import type { BipartiteNodeType } from "./BipartiteGraph";

export type BipartiteGraphState = Record<
    string,
    {
        nodes: BipartiteNodeType[];
        edges: DirectEdgeType[];
    }
>;

const convertStructToGraph = (struct: Structure, lang: Language) => {
    const graphs: BipartiteGraphState = {};

    const binaryPreds = Object.keys(lang.predicates).filter(
        (pred) => lang.predicates[pred].arity === 2,
    );

    binaryPreds.forEach((binaryPred) => {
        const iP = struct.iP[binaryPred];
        graphs[binaryPred] = { nodes: [], edges: [] };

        struct.domain.forEach((domElement) => {
            graphs[binaryPred].nodes.push({
                id: `d-${domElement}`,
                type: "predicate",
                position: { x: 0, y: 0 },
                data: { label: domElement, origin: "domain" },
                //hidden: !iP.flat().includes(domElement),
            });

            graphs[binaryPred].nodes.push({
                id: `r-${domElement}`,
                type: "predicate",
                position: { x: 0, y: 0 },
                data: { label: domElement, origin: "range" },
                //hidden: !iP.flat().includes(domElement),
            });
        });

        iP.forEach(([source, target]) => {
            graphs[binaryPred].edges.push({
                id: `eg-${source}->${target}`,
                source: `d-${source}`,
                target: `r-${target}`,
            });
        });
    });

    return graphs;
};

const initialState: BipartiteGraphState = {};

export const bipartiteGraphSlice = createSlice({
    name: "bipartiteGraph",
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
            action: PayloadAction<{ id: string; nodes: BipartiteNodeType[] }>,
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
                changes: NodeChange<BipartiteNodeType>[];
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

                const newNodes = domain.flatMap((element) => {
                    const existingNode = nodes.find(
                        (node) => node.id === element,
                    );

                    return existingNode
                        ? [{ ...existingNode }]
                        : [
                              {
                                  id: `d-${element}`,
                                  type: "predicate",
                                  position: { x: 0, y: 0 },
                                  data: {
                                      label: element,
                                      origin: "domain" as const,
                                  },
                              },
                              {
                                  id: `r-${element}`,
                                  type: "predicate",
                                  position: { x: 0, y: 0 },
                                  data: {
                                      label: element,
                                      origin: "range" as const,
                                  },
                              },
                          ];
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
                    : { id, source: `d-${source}`, target: `r-${target}` };
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
        const bipartiteGraphState = getState().bipartiteGraph;

        const newEdges = applyEdgeChanges(
            changes,
            bipartiteGraphState[id].edges,
        );

        const structFormat = newEdges.map((edge) => [
            edge.source.slice(2),
            edge.target.slice(2),
        ]);

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
        const bipartiteGraphState = getState().bipartiteGraph;

        const newEdges = addEdge(connection, bipartiteGraphState[id].edges);

        const structFormat = newEdges.map((edge) => [
            edge.source.slice(2),
            edge.target.slice(2),
        ]);

        console.log("On Connected");

        dispatch(predInterpretationChanged({ name: id, intr: structFormat }));
    };
};

export const { setStructure, setNodes, setEdges, edgeAdded, onNodesChanged } =
    bipartiteGraphSlice.actions;

export default bipartiteGraphSlice.reducer;
