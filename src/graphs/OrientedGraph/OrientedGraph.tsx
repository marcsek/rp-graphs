import {
    applyEdgeChanges,
    applyNodeChanges,
    Background,
    ReactFlow,
    type Edge,
    type NodeChange,
    type EdgeChange,
    type OnConnect,
    addEdge,
    ReactFlowProvider,
    MarkerType,
    type IsValidConnection,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback, useState } from "react";
import DevTools from "../../helpers/Devtools";
import PredicateNodeComponent, {
    type PredicateNodeType,
} from "../graphComponents/PredicateNode";
import DirectEdge from "../graphComponents/DirectEdge";
import CustomConnectionLine from "../graphComponents/DirectConnectionLine";

const initialNodes: PredicateNodeType[] = [
    {
        id: "1",
        type: "predicate",
        position: { x: 0, y: 0 },
        data: { label: "1" },
    },
    {
        id: "2",
        type: "predicate",
        position: { x: 250, y: 320 },
        data: { label: "2" },
    },
    {
        id: "3",
        type: "predicate",
        position: { x: 40, y: 300 },
        data: { label: "3" },
    },
    {
        id: "4",
        type: "predicate",
        position: { x: 300, y: 0 },
        data: { label: "4" },
    },
];

const initialEdges: Edge[] = [];

const connectionLineStyle = {
    stroke: "#b1b1b7",
};

const nodeTypes = {
    predicate: PredicateNodeComponent,
};

const edgeTypes = {
    direct: DirectEdge,
};

const defaultEdgeOptions = {
    type: "direct",
    markerEnd: {
        type: MarkerType.ArrowClosed,
        color: "#b1b1b7",
    },
};

export default function OrientedGraph() {
    const [nodes, setNodes] = useState(initialNodes);
    const [edges, setEdges] = useState(initialEdges);

    const onNodesChange = useCallback(
        (changes: NodeChange<PredicateNodeType>[]) => {
            setNodes((prev) => applyNodeChanges(changes, prev));
        },
        [],
    );

    const onEdgesChange = useCallback((changes: EdgeChange<Edge>[]) => {
        setEdges((prev) => applyEdgeChanges(changes, prev));
    }, []);

    const onConnect: OnConnect = useCallback(
        (params) => setEdges((prev) => addEdge(params, prev)),
        [],
    );

    const isValidConnection: IsValidConnection = useCallback(
        (newEdge) =>
            // no duplicate edges
            !edges.some(
                (edge) =>
                    newEdge.source === edge.source &&
                    newEdge.target === edge.target,
            ),
        [edges],
    );

    return (
        <ReactFlowProvider>
            <div style={{ width: "100%", height: "100%" }}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    fitView
                    nodeTypes={nodeTypes}
                    edgeTypes={edgeTypes}
                    defaultEdgeOptions={defaultEdgeOptions}
                    connectionLineComponent={CustomConnectionLine}
                    connectionLineStyle={connectionLineStyle}
                    isValidConnection={isValidConnection}
                >
                    <Background />
                    <DevTools />
                </ReactFlow>
            </div>
        </ReactFlowProvider>
    );
}
