import "../BasicGraph/BasicGraph.css";
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
  Node,
  useConnection,
} from "@xyflow/react";
import { useCallback, useEffect } from "react";
import FloatingEdge from "../BasicGraph/FloatingEdge";
import CustomNode from "../BasicGraph/CustomNode";
import CustomConnectionLine from "../BasicGraph/CustomConnectionLine";
import dagre from "@dagrejs/dagre";
import {
  findRelatedPairs,
  getAllSubsets,
  hasseEdges,
  hasseEdgesFullClosure,
  isSubset,
  isValidHasseWithEdge,
  wouldBeInvalidHasseEdge,
} from "./PosetHelper";
import AddNodeButton from "../BasicGraph/AddNodeButton";

const domain = ["4", "5", "6", "8"];

let initialNodes: Node<{
  label: string;
  constant: string;
  predicate: [];
  activePreds: [];
  focusedPreds: [];
}>[] = [];

//["a", "b", "c", "d", "e", "f", "g", "h", "i"].forEach((ch) =>
//  initialNodes.push({
//    id: ch,
//    position: { x: 0, y: 0 },
//    data: {
//      label: "",
//      constant: "",
//      predicate: [],
//      activePreds: [],
//      focusedPreds: [],
//    },
//    type: "custom",
//  }),
//);

const subsets = getAllSubsets(["a", "b", "c", "d"]);
const relation = findRelatedPairs(subsets, isSubset);
const hEdges = hasseEdges(relation);
console.log(relation);
console.log("REDUCTION", hasseEdges(relation));
const initialEdges: Edge<DefaultEdgeOptions>[] = [];

subsets.forEach((ch) =>
  initialNodes.push({
    id: `{${ch.toString()}}`,
    position: { x: 0, y: 0 },
    data: {
      label: "",
      constant: "",
      predicate: [],
      activePreds: [],
      focusedPreds: [],
    },
    type: "custom",
  }),
);

subsets.forEach((ch) => console.log(ch.toString()));

//const initialEdges: Edge<DefaultEdgeOptions>[] = [
//  { id: "ea-c", source: "a", target: "c" },
//  { id: "eb-c", source: "b", target: "c" },
//  { id: "eb-d", source: "b", target: "d" },
//  { id: "ee-f", source: "e", target: "f" },
//  { id: "ef-h", source: "f", target: "h" },
//  { id: "ec-h", source: "c", target: "h" },
//  { id: "ec-g", source: "c", target: "g" },
//  { id: "eg-i", source: "g", target: "i" },
//  { id: "eh-i", source: "h", target: "i" },
//];

hEdges.forEach(([a, b]) =>
  initialEdges.push({
    id: `e${a.toString()}${b.toString()}`,
    source: `{${a.toString()}}`,
    target: `{${b.toString()}}`,
  }),
);

const connectionLineStyle = {
  stroke: "#22C55E99",
  strokeWidth: 2,
};

const nodeTypes = {
  custom: CustomNode,
};

const edgeTypes = {
  floating: FloatingEdge,
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

const computeLayout = <TNode extends Node, TEdge extends Edge>(
  nodes: TNode[],
  edges: TEdge[],
) => {
  const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: "BT" });
  console.log(edges);

  nodes.forEach((n) => dagreGraph.setNode(n.id, { width: 120, height: 80 }));
  edges.forEach((e) => dagreGraph.setEdge(e.source, e.target));

  dagre.layout(dagreGraph);
  const offsetX = dagreGraph.graph().width / 2;
  const offsetY = dagreGraph.graph().height / 2;

  const newNodes = nodes.map((n) => {
    const nodeWithPosition = dagreGraph.node(n.id);
    return {
      ...n,
      position: {
        x: nodeWithPosition.x - 120 / 2 - offsetX,
        y: nodeWithPosition.y - 80 / 2 - offsetY,
      },
    };
  });

  return { nodes: newNodes, edges };
};

function HasseDiagram() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const { fitView, screenToFlowPosition } = useReactFlow();

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const addNode = (x: number, y: number) => {
    let lastNodeId: number = nodes.length + 1;
    setNodes((nds) =>
      nds.concat({
        id: lastNodeId.toString(),
        position: screenToFlowPosition({ x, y }),
        data: {
          label: lastNodeId.toString(),
          constant: lastNodeId.toString(),
          predicate: [],
          activePreds: [],
          focusedPreds: [],
        },
        type: "custom",
      }),
    );
  };

  const addNodeWithId = (id: string, x: number, y: number) => {
    setNodes((nds) =>
      nds.concat({
        id: id,
        position: { x, y },
        data: {
          label: id,
          constant: id,
          predicate: [],
          activePreds: [],
          focusedPreds: [],
        },
        type: "custom",
      }),
    );
  };

  const reduce = () => {
    setEdges((prev) => {
      const initialEdges = [];
      console.log(prev);
      console.log("RELATION", prev);
      //console.log("REDUCE", hasseEdgesFullClosure(prev));
      const relation = prev.map((e) => [e.source, e.target]);
      hasseEdgesFullClosure(relation).forEach(([a, b]) => {
        const aa = a
          .replace(/[{}]/g, "")
          .split(",")
          .map((num) => num.trim());
        const bb = b
          .replace(/[{}]/g, "")
          .split(",")
          .map((num) => num.trim());
        return initialEdges.push({
          id: `e${aa.toString()}${bb.toString()}`,
          source: `{${aa.toString()}}`,
          target: `{${bb.toString()}}`,
        });
      });
      return initialEdges;
    });
  };

  useEffect(() => {
    //const relation = edges.map((e) => [e.source, e.target]);
    //console.log("IS POSET:", isValidHasse(relation));
  }, [edges]);

  const onLayout = useCallback(() => {
    const { nodes: lNodes, edges: lEdges } = computeLayout(nodes, edges);

    setNodes([...lNodes]);
    setEdges([...lEdges]);
    fitView({ duration: 500 });
  }, [nodes, edges]);

  return (
    <div className="graph-container">
      <button onClick={() => onLayout()}>layout</button>
      <button onClick={() => reduce()}>reduce</button>
      <ReactFlow
        id="4"
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        proOptions={{ hideAttribution: true }}
        onConnect={onConnect}
        isValidConnection={(e) => {
          const relation = edges.map((e) => [e.source, e.target]);
          return isValidHasseWithEdge(relation, [e.source, e.target]);
        }}
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
        <Background />
      </ReactFlow>
      <AddNodeButton
        elements={domain}
        onAdd={(id) => addNodeWithId(id, 0, 0)}
      />
    </div>
  );
}

export default HasseDiagram;
