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
    type DefaultEdgeOptions,
    type EdgeTypes,
    type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback, useState } from "react";
import DevTools from "../../helpers/Devtools";
import PredicateNodeComponent, {
    type PredicateNodeType,
} from "../graphComponents/PredicateNode";
import DirectEdge from "../graphComponents/DirectEdge";
import CustomConnectionLine from "../graphComponents/DirectConnectionLine";
import RandomNodeButton from "../../helpers/RandomNodeButton";

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

const nodeTypes: NodeTypes = {
    predicate: PredicateNodeComponent,
};

const edgeTypes: EdgeTypes = {
    direct: DirectEdge,
};

const defaultEdgeOptions: DefaultEdgeOptions = {
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

    const addNodeWithId = (id: string) => {
        const newNode: PredicateNodeType = {
            id,
            type: "predicate",
            position: { x: 0, y: 0 },
            data: { label: id },
        };

        setNodes((prev) => [...prev, newNode]);
    };

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
            <div style={{ width: "100%", flexGrow: 1 }}>
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
            <RandomNodeButton getId={addNodeWithId} />
        </ReactFlowProvider>
    );
}
