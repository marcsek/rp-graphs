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
import { convertPredicateToHasseDiagram } from "./HasseDiagram/creators.ts";
import { convertPredicateToOrientedGraph } from "./OrientedGraph/creators.ts";
import { convertPredicateToBipartiteGraph } from "./BipartiteGraph/creators.ts";
import {
    domainChanged,
    predInterpretationChanged,
} from "../components/StructureExplorer/structureSlice";
import { createNode as createBipartiteNode } from "./BipartiteGraph/creators";
import { createNode as createOrientedNode } from "./OrientedGraph/creators";
import {
    expandReducedPoset,
    isPoset,
    reducePosetRelations,
    type BinaryRelation,
} from "./HasseDiagram/posetHelpers";
import type { BipartiteNodeType } from "./BipartiteGraph/BipartiteGraph";

export const graphTypes = ["oriented", "hasse", "bipartite"] as const;

export type GraphType = (typeof graphTypes)[number];

export type OrientedGraphState = {
    nodes: PredicateNodeType[];
    edges: DirectEdgeType[];
};

export type BipartiteGraphState = {
    nodes: BipartiteNodeType[];
    edges: DirectEdgeType[];
};

export type HasseDiagramState = {
    nodes: PredicateNodeType[];
    edges: DirectEdgeType[];
    isPoset: boolean;
};

export type GraphStateEntry = {
    oriented: OrientedGraphState;
    bipartite: BipartiteGraphState;
    hasse: HasseDiagramState;
};

export type GraphManagerState = Record<string, GraphStateEntry>;

const initGraphManagerFromStruct = (struct: Structure, lang: Language) => {
    const managerState: GraphManagerState = {};

    const binaryPreds = Object.keys(lang.predicates).filter(
        (pred) => lang.predicates[pred].arity === 2,
    );

    binaryPreds.forEach((binaryPred) => {
        const graphs: GraphStateEntry = {
            hasse: convertPredicateToHasseDiagram(struct, binaryPred),
            oriented: convertPredicateToOrientedGraph(struct, binaryPred),
            bipartite: convertPredicateToBipartiteGraph(struct, binaryPred),
        };

        managerState[binaryPred] = graphs;
    });

    return managerState;
};

const initialState: GraphManagerState = {};

type GraphIdentifier = { id: string; type: GraphType };

export const graphManagerSlice = createSlice({
    name: "graphManager",
    initialState,
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
            action: PayloadAction<
                GraphIdentifier & {
                    nodes: PredicateNodeType[];
                }
            >,
        ) {
            const { id, type, nodes } = action.payload;
            state[id][type].nodes = nodes;
        },

        setEdges(
            state,
            action: PayloadAction<
                GraphIdentifier & { edges: DirectEdgeType[] }
            >,
        ) {
            const { id, type, edges } = action.payload;
            state[id][type].edges = edges;
        },

        edgeAdded(
            state,
            action: PayloadAction<GraphIdentifier & { edge: DirectEdgeType }>,
        ) {
            const { id, type, edge } = action.payload;
            state[id][type].edges = [...state[id][type].edges, edge];
        },

        onNodesChanged(
            state,
            action: PayloadAction<
                GraphIdentifier & {
                    changes: NodeChange<PredicateNodeType>[];
                }
            >,
        ) {
            const { id, type, changes } = action.payload;
            state[id][type].nodes = applyNodeChanges(
                changes,
                state[id][type].nodes,
            );
        },
    },

    extraReducers(builder) {
        builder.addCase(domainChanged, (state, action) => {
            for (const [id, predicate] of Object.entries(state)) {
                for (const graphType of graphTypes) {
                    const graphState = predicate[graphType];

                    const nodes = [...graphState.nodes];
                    const domain = action.payload;

                    const newNodes = domain.flatMap((element) => {
                        const existingNode = nodes.find(
                            (node) => node.id === element,
                        );

                        if (existingNode) return { ...existingNode };
                        else if (graphType === "bipartite") {
                            return [
                                createBipartiteNode(element, "domain"),
                                createBipartiteNode(element, "range"),
                            ];
                        } else return createOrientedNode(element);
                    });

                    state[id][graphType].nodes = newNodes;
                }
            }
        });

        builder.addCase(predInterpretationChanged, (state, action) => {
            const { name, intr } = action.payload;
            const predicate = state[name];

            for (const graphType of graphTypes) {
                let newIP = intr as BinaryRelation<string>;

                if (graphType === "hasse") {
                    predicate[graphType].isPoset = isPoset(newIP);

                    if (predicate[graphType].isPoset)
                        newIP = reducePosetRelations(newIP);
                }

                const newEdges = newIP.map(([from, to]) => {
                    const id = `eg-${from}->${to}`;
                    const existingEdge = predicate[graphType].edges.find(
                        (edge) => edge.id === id,
                    );

                    const source =
                        graphType === "bipartite" ? `d-${from}` : from;

                    const target = graphType === "bipartite" ? `r-${to}` : to;

                    return existingEdge
                        ? { ...existingEdge }
                        : { id, source, target };
                });

                predicate[graphType].edges = newEdges;
            }
        });
    },
});

export const selectBinaryPreds = createSelector(
    [(state: RootState) => state.language.predicates],
    (preds) => Object.values(preds).filter((pred) => pred.arity === 2),
);

const convertEdgesToStructFormat = (
    graphType: GraphType,
    edges: DirectEdgeType[],
    domain: Set<string>,
) => {
    const structFormat: BinaryRelation<string> = edges.map((edge) => [
        graphType === "bipartite" ? edge.source.slice(2) : edge.source,
        graphType === "bipartite" ? edge.target.slice(2) : edge.target,
    ]);

    return graphType === "hasse"
        ? expandReducedPoset(structFormat, domain)
        : structFormat;
};

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

        const domain = new Set(getState().structure.domain);
        const structFormat = convertEdgesToStructFormat(type, newEdges, domain);

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

        const domain = new Set(getState().structure.domain);
        const structFormat = convertEdgesToStructFormat(type, newEdges, domain);

        console.log("On Connected");

        dispatch(predInterpretationChanged({ name: id, intr: structFormat }));
    };
};

export const { setStructure, setNodes, setEdges, edgeAdded, onNodesChanged } =
    graphManagerSlice.actions;

export default graphManagerSlice.reducer;
