import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Connection,
  DefaultEdgeOptions,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
} from "@xyflow/react";

import { hasseEdges, hasseToRelation, isPoset } from "./PosetHelper";
import {
  mainPredicateChanged as structMainPredicateChanged,
  structureChanged,
} from "../StructureExplorer/structExplorerSlice";
import { mainPredicateChanged as graphMainPredicateChanged } from "../BasicGraph/basicGraphSlice";
import { Structure } from "../structPresets/type";
import { AppThunk } from "../app/store";
import smallStruct from "../structPresets/smallStruct";

export type NodeType = Node<{ label: string }>;
type EdgeType = Edge<DefaultEdgeOptions>;

const convertStructToGraph = (struct: Structure) => {
  if (!isPoset(struct.mainPredicate.interpretation))
    return { isPoset: false, nodes: [], edges: [] };

  const domainInUse = [
    ...new Set(struct.mainPredicate.interpretation.flatMap((e) => e)),
  ];

  const nodes: NodeType[] = domainInUse.map((d) => ({
    id: d,
    position: { x: 0, y: 0 },
    type: "custom",
    data: {
      label: d,
      constants: struct.constants[d],
    },
  }));

  const edges: EdgeType[] = hasseEdges(struct.mainPredicate.interpretation).map(
    ([source, target]) => ({ id: `e${source}-${target}`, source, target }),
  );

  return { isPoset: true, nodes, edges };
};

const {
  nodes: initialNodes,
  edges: initialEdges,
  isPoset: initialIsPoset,
} = convertStructToGraph(smallStruct);

const initialState = {
  nodes: initialNodes,
  edges: initialEdges,
  isPoset: initialIsPoset,
};

const hasseSlice = createSlice({
  name: "hasse",
  initialState,
  reducers: {
    setNodes(state, action: PayloadAction<NodeType[]>) {
      state.nodes = action.payload;
    },
    setEdges(state, action: PayloadAction<EdgeType[]>) {
      state.edges = action.payload;
    },
    onNodesChange(state, action: PayloadAction<NodeChange<NodeType>[]>) {
      const a = applyNodeChanges(action.payload, state.nodes);
      state.nodes = a;
    },
    onEdgesChange(state, action: PayloadAction<EdgeChange<EdgeType>[]>) {
      const a = applyEdgeChanges(action.payload, state.edges);
      state.edges = a;
    },
    onConnect(state, action: PayloadAction<Connection>) {
      const a = addEdge(action.payload, state.edges);
      state.edges = a;
    },

    nodeAdded(
      state,
      action: PayloadAction<{
        id: string;
        x: number;
        y: number;
      }>,
    ) {
      const { id, x, y } = action.payload;
      state.nodes.push({
        id: id,
        position: { x, y },
        data: {
          label: id,
        },
        type: "custom",
      });
    },

    mainPredicateChanged(state, action: PayloadAction<[string, string][]>) {
      if (!isPoset(action.payload)) {
        state.nodes = [];
        state.edges = [];
        state.isPoset = false;
      } else {
        state.isPoset = true;
        const edges: EdgeType[] = hasseEdges(action.payload).map(
          ([source, target]) => ({
            id: `e${source}-${target}`,
            source,
            target,
          }),
        );
        state.edges = edges;
        const domainInUse = new Set(edges.flatMap((e) => [e.source, e.target]));
        const nodesInUse = new Set(state.nodes.map((n) => n.id));
        const nodesToAdd = [...domainInUse].filter((x) => !nodesInUse.has(x));
        const newNodes = [
          ...nodesToAdd.map((n) => ({
            id: n,
            position: { x: 0, y: 0 },
            data: {
              label: n,
            },
            type: "custom",
          })),
          ...state.nodes,
        ];
        state.nodes = newNodes.filter((n) => domainInUse.has(n.id));
      }
    },
  },

  extraReducers(builder) {
    builder.addCase(structureChanged, (state, action) => {
      const {
        isPoset,
        nodes: newNodes,
        edges: newEdges,
      } = convertStructToGraph(action.payload);
      if (!isPoset) {
        state.nodes = [];
        state.edges = [];
        state.isPoset = false;
      } else {
        state.nodes = newNodes;
        state.edges = newEdges;
        state.isPoset = true;
      }
    });
  },
});

export function makeConnection(connection: Connection): AppThunk {
  return (dispatch, getState) => {
    dispatch(onConnect(connection));
    const relationEdges = hasseToRelation(
      getState().hasse.edges.map((e) => [e.source, e.target]),
    );
    dispatch(structMainPredicateChanged(relationEdges));
    dispatch(graphMainPredicateChanged(relationEdges));
  };
}

export function updateEdges(edgeChanges: EdgeChange<EdgeType>[]): AppThunk {
  return (dispatch, getState) => {
    const removeActions = edgeChanges.filter((e) => e.type === "remove");
    const removedEdgePairs = removeActions.map((a) => {
      const edge = getState().hasse.edges.find((e) => e.id === a.id);
      return [edge.source, edge.target] as [string, string];
    });
    dispatch(onEdgesChange(edgeChanges));

    if (removedEdgePairs.length === 0) return;

    const leftEdgePairs: [string, string][] = getState()
      .hasse.edges.filter(
        (e) =>
          !removedEdgePairs.some(
            ([ap, bp]) => ap === e.source && bp === e.target,
          ),
      )
      .map((e) => [e.source, e.target]);

    console.log(leftEdgePairs);
    const relationEdges = hasseToRelation(leftEdgePairs);
    dispatch(graphMainPredicateChanged(relationEdges));
    dispatch(structMainPredicateChanged(relationEdges));
  };
}

export const {
  setNodes,
  setEdges,
  onNodesChange,
  onEdgesChange,
  nodeAdded,
  onConnect,
  mainPredicateChanged,
} = hasseSlice.actions;

export default hasseSlice.reducer;
