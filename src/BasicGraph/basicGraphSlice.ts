import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import smallStruct from "../structPresets/smallStruct";
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Connection,
  DefaultEdgeOptions,
  Edge,
  EdgeChange,
  MarkerType,
  Node,
  NodeChange,
} from "@xyflow/react";
import { Structure } from "../structPresets/type";
import { AppThunk, RootState } from "../app/store";
import {
  mainPredicateAdded,
  mainPredicateRemoved,
  structureChanged,
} from "../StructureExplorer/structExplorerSlice";
import { mainPredicateChanged as hasseMainPredicateChanged } from "../HasseDiagram/hasseDiagramSlice";

export type NodeType = Node<{
  label: string;
}>;

type UnaryPredicates = Record<
  string,
  {
    name: string;
    color: string;
  }[]
>;

type EdgeType = Edge<DefaultEdgeOptions>;

const convertStructToGraph = (struct: Structure) => {
  const colorStack = ["#FFAB00", "#22C55E", "#00B8D9", "#b76e00"];
  const colorMap: Record<string, string> = {};

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

  const edges: EdgeType[] = struct.mainPredicate.interpretation.map(
    ([source, target]) => ({ id: `e${source}-${target}`, source, target }),
  );

  const unaryPredicates: UnaryPredicates = struct.domain.reduce(
    (acc, d) => {
      const presentIn = struct.unaryPredicates.filter((u) =>
        u.interpretation.includes(d),
      );
      acc[d] = presentIn.map((u) => {
        if (!colorMap[u.name]) colorMap[u.name] = colorStack.shift();
        return {
          name: u.name,
          color: colorMap[u.name],
        };
      });
      return acc;
    },
    <UnaryPredicates>{},
  );

  return { nodes, edges, unaryPredicates };
};

const {
  nodes: initialNodes,
  edges: initialEdges,
  unaryPredicates: initialUnaryPredicates,
} = convertStructToGraph(smallStruct);

const initialState = {
  nodes: initialNodes,
  edges: initialEdges,
  selectedNodes: [] as typeof initialNodes,
  selectedEdges: [] as typeof initialEdges,
  unaryPredicates: initialUnaryPredicates,
  selectedPreds: <string[]>[],
  focusedPred: "",
};

const activateEdgesFocus = (state: typeof initialState, focused: string) => {
  return state.edges.map((edge) => {
    const source = edge.source;
    const target = edge.target;
    const sourceNode = state.unaryPredicates[source];
    const targetNode = state.unaryPredicates[target];

    if (!sourceNode || !targetNode) return edge;

    const predSource = sourceNode.find((p) => p.name === focused);
    const predTarget = targetNode.find((p) => p.name === focused);

    if (!predSource || !predTarget) return edge;

    return {
      ...edge,
      className: "animated",
      style: { ...edge.style, stroke: predSource.color },
      markerEnd: { type: MarkerType.ArrowClosed, color: predSource.color },
    };
  });
};

const resetEdgeFocus = (state: typeof initialState) => {
  return (state.edges = state.edges.map((edge) => {
    return {
      ...edge,
      className: "",
      style: { ...edge.style, stroke: "#b1b1b7" },
      markerEnd: { type: MarkerType.ArrowClosed, color: "#b1b1b7" },
    };
  }));
};

const graphSlice = createSlice({
  name: "graph",
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
      const edges: EdgeType[] = action.payload.map(([source, target]) => ({
        id: `e${source}-${target}`,
        source,
        target,
      }));
      state.edges = edges;
    },

    togglePredicate(state, action: PayloadAction<string>) {
      if (state.selectedPreds.includes(action.payload)) {
        state.selectedPreds = state.selectedPreds.filter(
          (p) => p !== action.payload,
        );
        state.edges = resetEdgeFocus(state);
        state.focusedPred = "";
      } else {
        state.selectedPreds.push(action.payload);
        state.focusedPred = action.payload;
        state.edges = activateEdgesFocus(state, action.payload);
      }
    },

    predFocused(state, action: PayloadAction<string>) {
      if (!state.selectedPreds.includes(action.payload)) return;

      state.edges = activateEdgesFocus(state, action.payload);

      state.focusedPred = action.payload;
    },

    predUnfocused(state) {
      state.edges = resetEdgeFocus(state);
      state.focusedPred = "";
    },
  },

  extraReducers(builder) {
    builder.addCase(structureChanged, (state, action) => {
      const {
        nodes: newNodes,
        edges: newEdges,
        unaryPredicates: newPreds,
      } = convertStructToGraph(action.payload);

      state.nodes = newNodes;
      state.edges = newEdges;
      state.unaryPredicates = newPreds;
      state.selectedPreds = [];
      state.focusedPred = "";
    });
  },
});

export const {
  setNodes,
  setEdges,
  onNodesChange,
  onEdgesChange,
  nodeAdded,
  onConnect,
  mainPredicateChanged,
  togglePredicate,
  predFocused,
  predUnfocused,
} = graphSlice.actions;

export const selectSelectedPreds = createSelector(
  [
    (state: RootState) => state.graph.unaryPredicates,
    (state: RootState) => state.graph.selectedPreds,
    (_: RootState, id: string) => id,
  ],
  (unaryPredicates, selectedPreds, id) => {
    if (unaryPredicates[id]) {
      return unaryPredicates[id].filter((p) => selectedPreds.includes(p.name));
    }
    return [];
  },
);

export function updateEdges(edgeChanges: EdgeChange<EdgeType>[]): AppThunk {
  return (dispatch, getState) => {
    const removeActions = edgeChanges.filter((e) => e.type === "remove");
    const removedEdgePairs = removeActions.map((a) => {
      const edge = getState().graph.edges.find((e) => e.id === a.id);
      return [edge.source, edge.target] as [string, string];
    });
    dispatch(onEdgesChange(edgeChanges));
    dispatch(mainPredicateRemoved(removedEdgePairs));

    const leftEdgePairs: [string, string][] = getState()
      .graph.edges.filter(
        (e) =>
          !removedEdgePairs.some(
            ([ap, bp]) => ap === e.source && bp === e.target,
          ),
      )
      .map((e) => [e.source, e.target]);

    dispatch(hasseMainPredicateChanged(leftEdgePairs));
  };
}

export function makeConnection(connection: Connection): AppThunk {
  return (dispatch, getState) => {
    if (
      !getState().graph.edges.find(
        (e) => e.source === connection.source && e.target === connection.target,
      )
    ) {
      dispatch(onConnect(connection));
      dispatch(mainPredicateAdded([connection.source, connection.target]));
      const edges: [string, string][] = getState().graph.edges.map((e) => [
        e.source,
        e.target,
      ]);
      edges.push([connection.source, connection.target]);
      dispatch(hasseMainPredicateChanged(edges));
    }
  };
}

export default graphSlice.reducer;
