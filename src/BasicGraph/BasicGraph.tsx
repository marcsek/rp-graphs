import "./BasicGraph.css";
import "@xyflow/react/dist/style.css";

import {
  Background,
  ConnectionMode,
  DefaultEdgeOptions,
  MarkerType,
  NodeChange,
  ReactFlow,
} from "@xyflow/react";
import FloatingEdge from "./FloatingEdge";
import CustomNode from "./CustomNode";
import CustomConnectionLine from "./CustomConnectionLine";
import SelfConnectingEdge from "./SelfConnectingEdge";
import AddNodeButton from "./AddNodeButton";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import {
  makeConnection,
  nodeAdded,
  NodeType,
  onNodesChange,
  predFocused,
  predUnfocused,
  togglePredicate,
  updateEdges,
} from "./basicGraphSlice";

const connectionLineStyle = {
  stroke: "#22C55E99",
  strokeWidth: 2,
};

const nodeTypes = {
  custom: CustomNode,
};

const edgeTypes = {
  floating: FloatingEdge,
  selfConnecting: SelfConnectingEdge,
};

const defaultEdgeOptions: DefaultEdgeOptions = {
  type: "floating",
  style: {
    stroke: "#b1b1b7",
  },
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: "#b1b1b7",
  },
};

function BasicGraph() {
  const nodes = useAppSelector((state) => state.graph.nodes);
  const edges = useAppSelector((state) => state.graph.edges);
  const domain = useAppSelector((state) => state.explorer.domain);
  const unaryPredicates = useAppSelector(
    (state) => state.explorer.unaryPredicates,
  );
  const selectedPredicates = useAppSelector(
    (state) => state.graph.selectedPreds,
  );
  const dispatch = useAppDispatch();
  const addNodeWithId = (id: string, x: number, y: number) => {
    dispatch(nodeAdded({ id, x, y }));
  };

  return (
    <div className="graph-container">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={(e) =>
          dispatch(onNodesChange(e as NodeChange<NodeType>[]))
        }
        onEdgesChange={(e) => dispatch(updateEdges(e))}
        proOptions={{ hideAttribution: true }}
        onConnect={(e) => dispatch(makeConnection(e))}
        zoomOnDoubleClick={false}
        defaultEdgeOptions={defaultEdgeOptions}
        edgeTypes={edgeTypes}
        nodeTypes={nodeTypes}
        connectionLineComponent={CustomConnectionLine}
        connectionLineStyle={connectionLineStyle}
        connectionMode={ConnectionMode.Loose}
        connectionRadius={55}
        fitView
      >
        <Background id="2" />
      </ReactFlow>
      {unaryPredicates.map((p) => (
        <label
          key={p.name}
          onMouseEnter={() => dispatch(predFocused(p.name))}
          onMouseLeave={() => dispatch(predUnfocused())}
        >
          <input
            type="checkbox"
            checked={selectedPredicates.includes(p.name)}
            onChange={() => dispatch(togglePredicate(p.name))}
          />
          {p.name}
        </label>
      ))}
      <AddNodeButton
        elements={domain}
        onAdd={(id) => addNodeWithId(id, 0, 0)}
      />
    </div>
  );
}

export default BasicGraph;
