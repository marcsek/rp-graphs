import {
  Background,
  ReactFlow,
  useEdgesState,
  useNodesState,
  addEdge,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";
import BipartiteNode from "./BipartiteNode";
import { useCallback } from "react";

const initialNodes = [
  {
    id: "1",
    position: { x: 0, y: 0 },
    data: { label: "1", constant: "Bob", isFromDomain: true },
    type: "bipartiteDomain",
  },
  {
    id: "2",
    position: { x: 0, y: 100 },
    data: { label: "2", constant: "Alice", isFromDomain: true },
    type: "bipartiteDomain",
  },

  {
    id: "3",
    position: { x: 300, y: 0 },
    data: { label: "1", constant: "Bob", isFromDomain: false },
    type: "bipartiteDomain",
  },
  {
    id: "4",
    position: { x: 300, y: 100 },
    data: { label: "2", constant: "Alice", isFromDomain: false },
    type: "bipartiteDomain",
  },
];

const nodeTypes = {
  bipartiteDomain: BipartiteNode,
};

function BipartiteGraph() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  return (
    <div className="graph-container">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background />
      </ReactFlow>
    </div>
  );
}

export default BipartiteGraph;
