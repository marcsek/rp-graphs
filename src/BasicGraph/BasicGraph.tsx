import "./BasicGraph.css";
import "@xyflow/react/dist/style.css";

import {
  addEdge,
  Background,
  ConnectionMode,
  MarkerType,
  ReactFlow,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from "@xyflow/react";
import { useCallback, useEffect, useState } from "react";
import FloatingEdge from "./FloatingEdge";
import CustomNode from "./CustomNode";
import CustomConnectionLine from "./CustomConnectionLine";
import SelfConnectingEdge from "./SelfConnectingEdge";

const preds = [
  { name: "student", active: false, focused: false },
  { name: "teacher", active: false, focused: false },
];

const initialNodes = [
  {
    id: "1",
    position: { x: 0, y: 0 },
    data: {
      label: "1",
      constant: "Bob",
      predicate: ["student", "teacher"],
      activePreds: [],
    },
    activePreds: [],
    type: "custom",
  },
  {
    id: "2",
    position: { x: 0, y: 100 },
    data: {
      label: "2",
      constant: "Alice",
      predicate: ["student"],
      activePreds: [],
    },
    type: "custom",
  },
];

const initialEdges = [{ id: "e1-2", source: "1", target: "2" }];

const connectionLineStyle = {
  stroke: "#b1b1b7",
  zIndex: 0,
};

const nodeTypes = {
  custom: CustomNode,
};

const edgeTypes = {
  floating: FloatingEdge,
  selfConnecting: SelfConnectingEdge,
};

const defaultEdgeOptions = {
  type: "floating",
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: "#b1b1b7",
  },
};

function BasicGraph() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [activePreds, setActivePreds] = useState<typeof preds>(preds);
  const { screenToFlowPosition } = useReactFlow();

  useEffect(() => {
    setNodes((prev) =>
      prev.map((e) => ({
        ...e,
        data: { ...e.data, activePreds: activePreds },
      })),
    );
    console.log(nodes);
  }, [activePreds]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const addNode = (x: number, y: number) => {
    let lastNodeId: number = parseInt(nodes[nodes.length - 1].id) + 1;
    setNodes((nds) =>
      nds.concat({
        id: lastNodeId.toString(),
        position: screenToFlowPosition({ x, y }),
        data: {
          label: lastNodeId.toString(),
          constant: lastNodeId.toString(),
          predicate: [],
          activePreds: activePreds,
        },
        type: "custom",
      }),
    );
  };

  return (
    <div className="graph-container">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        proOptions={{ hideAttribution: true }}
        onConnect={onConnect}
        onDoubleClick={(e) => addNode(e.clientX, e.clientY)}
        zoomOnDoubleClick={false}
        defaultEdgeOptions={defaultEdgeOptions}
        edgeTypes={edgeTypes}
        nodeTypes={nodeTypes}
        connectionLineComponent={CustomConnectionLine}
        connectionLineStyle={connectionLineStyle}
        connectionMode={ConnectionMode.Loose}
        fitView
      >
        <Background />
      </ReactFlow>
      {activePreds.map((p) => (
        <label key={p.name}>
          <input
            type="checkbox"
            checked={p.active}
            onChange={(e) => {
              setActivePreds((prev) =>
                prev.map((item) =>
                  item.name === p.name
                    ? { ...item, active: !item.active }
                    : item,
                ),
              );
            }}
          />
          {p.name}
        </label>
      ))}
    </div>
  );
}

export default BasicGraph;
