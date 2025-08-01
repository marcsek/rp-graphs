import {
    applyEdgeChanges,
    applyNodeChanges,
    Background,
    ReactFlow,
    type Edge,
    type Node,
    type NodeChange,
    type EdgeChange,
    type OnConnect,
    addEdge,
    ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback, useState } from "react";
import DevTools from "../../helpers/Devtools";

const initialNodes: Node[] = [
    {
        id: "n1",
        position: { x: 0, y: 0 },
        data: { label: "Node 1" },
        type: "input",
    },
    {
        id: "n2",
        position: { x: 100, y: 100 },
        data: { label: "Node 2" },
    },
];

const initialEdges: Edge[] = [
    {
        id: "n1-n2",
        source: "n1",
        target: "n2",
    },
];

export default function OrientedGraph() {
    const [nodes, setNodes] = useState(initialNodes);
    const [edges, setEdges] = useState(initialEdges);

    const onNodesChange = useCallback((changes: NodeChange<Node>[]) => {
        setNodes((prev) => applyNodeChanges(changes, prev));
    }, []);

    const onEdgesChange = useCallback((changes: EdgeChange<Edge>[]) => {
        setEdges((prev) => applyEdgeChanges(changes, prev));
    }, []);

    const onConnect: OnConnect = useCallback(
        (params) => setEdges((prev) => addEdge(params, prev)),
        [],
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
                >
                    <Background />
                    <DevTools />
                </ReactFlow>
            </div>
        </ReactFlowProvider>
    );
}
