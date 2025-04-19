import "./BasicGraph.css";
import "@xyflow/react/dist/style.css";

import {
  addEdge,
  Background,
  ConnectionMode,
  DefaultEdgeOptions,
  Edge,
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
import AddNodeButton from "./AddNodeButton";

const rndPred = (preds: any) => {
  // Step 1: Get all keys
  const keys = Object.keys(preds);

  // Step 2: Choose a random number of keys to select (can be 0)
  const count = Math.floor(Math.random() * (keys.length + 1)); // 0 to keys.length

  // Step 3: Shuffle and take `count` keys
  const shuffled = keys.sort(() => 0.5 - Math.random());
  const selectedKeys = shuffled.slice(0, count);

  // Step 4: Ensure they're strings (already are, but for clarity)
  return selectedKeys.map(String);
};

const domain = ["4", "5", "6", "8"];
const predCol = { student: "#FFAB00", teacher: "#22C55E", janitor: "#00B8D9" };
const preds = [
  { name: "student", active: false, focused: false },
  { name: "teacher", active: false, focused: false },
  { name: "janitor", active: false, focused: false },
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
      focusedPreds: [],
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
      focusedPreds: [],
    },
    type: "custom",
  },
];

const initialEdges: Edge<DefaultEdgeOptions>[] = [
  { id: "e1-2", source: "1", target: "2" },
];

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
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [activePreds, setActivePreds] = useState<typeof preds>(preds);
  const [focusedPreds, setFocusedPreds] = useState<typeof preds>(preds);
  const { getNode, updateEdge, getNodeConnections, screenToFlowPosition } =
    useReactFlow();

  useEffect(() => {
    setNodes((prev) =>
      prev.map((e) => ({
        ...e,
        data: { ...e.data, activePreds: activePreds },
      })),
    );
  }, [activePreds]);

  useEffect(() => {
    const focusedNodes = nodes.filter((n) =>
      n.data.focusedPreds.some((e) => e.focused),
    );

    const shouldFocus: { id: string; color: string }[] = [];
    focusedNodes.forEach((n) => {
      const connections = getNodeConnections({ nodeId: n.id });
      connections.forEach((c) => {
        const sourceNode = getNode(c.source);
        const targetNode = getNode(c.target);
        const focusedS = sourceNode.data.focusedPreds as any;
        const focusedSP = sourceNode.data.predicate as any;
        const focusedT = targetNode.data.focusedPreds as any;
        const focusedTP = targetNode.data.predicate as any;

        const sourceFocused = focusedS.some(
          (e: any) => focusedSP.includes(e.name) && e.focused,
        );
        const targetFocused = focusedT.some(
          (e: any) => focusedTP.includes(e.name) && e.focused,
        );

        let ttFocused = focusedPreds.find(
          (p) =>
            (sourceNode.data.predicate as any[]).includes(p.name) && p.focused,
        );
        console.log("TTFOCUSED", ttFocused);
        if (sourceFocused && targetFocused && ttFocused)
          shouldFocus.push({
            id: c.edgeId,
            color: predCol[ttFocused.name],
          });
      });
    });

    console.log(shouldFocus, edges);
    setEdges((prev) =>
      prev.map((e) => {
        const found = shouldFocus.find((f) => f.id === e.id);
        console.log("SHOULD FOCUS", shouldFocus);
        const stroke = found ? found.color : "#b1b1b7";

        return {
          ...e,
          className: found ? "animated" : "",
          style: { ...e.style, stroke },
          markerEnd: { type: MarkerType.ArrowClosed, color: stroke },
        };
      }),
    );
  }, [focusedPreds, nodes, updateEdge, getNodeConnections]);

  useEffect(() => {
    setNodes((prev) =>
      prev.map((e) => ({
        ...e,
        data: { ...e.data, focusedPreds: focusedPreds },
      })),
    );
  }, [focusedPreds]);

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
          focusedPreds: focusedPreds,
        },
        type: "custom",
      }),
    );
  };

  const addNodeWithId = (id: string, x: number, y: number) => {
    console.log("ADDING");
    setNodes((nds) =>
      nds.concat({
        id: id,
        position: { x, y },
        data: {
          label: id,
          constant: id,
          predicate: rndPred(predCol),
          activePreds: activePreds,
          focusedPreds: focusedPreds,
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
        connectionRadius={55}
        fitView
      >
        <Background id="2" />
      </ReactFlow>
      {activePreds.map((p) => (
        <label
          key={p.name}
          onMouseEnter={() => {
            setFocusedPreds((prev) =>
              prev.map((item) =>
                item.name === p.name ? { ...item, focused: true } : item,
              ),
            );
          }}
          onMouseLeave={() => {
            setFocusedPreds((prev) =>
              prev.map((item) =>
                item.name === p.name ? { ...item, focused: false } : item,
              ),
            );
          }}
        >
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
      <AddNodeButton
        elements={domain}
        onAdd={(id) => addNodeWithId(id, 0, 0)}
      />
    </div>
  );
}

export default BasicGraph;
